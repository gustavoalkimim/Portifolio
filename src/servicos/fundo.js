// Motor de fundos em duas camadas. A camada atual fica visível enquanto a
// próxima carrega e decodifica; só então as duas trocam de opacidade.
// Cada pedido invalida os anteriores: percorrer A → B → C termina em C.

import { fundos } from '../dados/paineis.js';
import { prefs } from './preferencias.js';

const ATRASO_PREVIA = 240; // ms de estabilização do foco antes de trocar
let camadas = [];
let ativa = 0;
let pedido = 0; // token do pedido mais recente
let temporizador = 0;
let base = null; // fundo da tela atual
let fixo = false; // ficha ou jogo: prévias são ignoradas
let mostrado = null; // descritor exibido agora
const precarregadas = new Map();
const ouvintesFalha = new Set();

function resolver(descritor) {
  if (!descritor) return fundos.neutro;
  if (typeof descritor === 'string') {
    if (descritor === 'padrao') return fundos[prefs.obter().fundoPadrao] || fundos.aurora;
    return fundos[descritor] || fundos.neutro;
  }
  return descritor;
}

function carregar(src) {
  if (precarregadas.has(src)) return precarregadas.get(src);
  const promessa = new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.decoding = 'async';
    imagem.onload = () => {
      if (imagem.decode) imagem.decode().then(resolve, resolve);
      else resolve();
    };
    imagem.onerror = () => reject(new Error('fundo indisponível: ' + src));
    imagem.src = src;
  });
  precarregadas.set(src, promessa);
  promessa.catch(() => precarregadas.delete(src));
  // Limite simples de memória: guarda só as artes mais recentes.
  if (precarregadas.size > 8) precarregadas.delete(precarregadas.keys().next().value);
  return promessa;
}

function pintar(camada, descritor, comImagem) {
  camada.style.backgroundColor = descritor.cor || '';
  camada.style.backgroundImage = comImagem && descritor.src ? 'url("' + descritor.src + '")' : 'none';
  camada.style.backgroundPosition = (descritor.focoX ?? 50) + '% ' + (descritor.focoY ?? 50) + '%';
}

function trocar(descritor, comImagem) {
  if (!camadas.length) return;
  const proxima = 1 - ativa;
  pintar(camadas[proxima], descritor, comImagem);
  camadas[proxima].classList.add('ativa');
  camadas[ativa].classList.remove('ativa');
  ativa = proxima;
  mostrado = descritor;
}

function aplicar(descritorBruto) {
  const descritor = resolver(descritorBruto);
  const meu = ++pedido;
  window.clearTimeout(temporizador);
  if (mostrado === descritor) return Promise.resolve(true);
  if (!descritor.src) {
    trocar(descritor, false);
    return Promise.resolve(true);
  }
  return carregar(descritor.src).then(
    () => {
      if (meu !== pedido) return false; // um pedido mais novo já assumiu
      trocar(descritor, true);
      return true;
    },
    () => {
      // Falha: mantém o fundo anterior; se não havia nenhum, usa a cor.
      if (meu === pedido && !mostrado) trocar({ ...descritor, src: null }, false);
      [...ouvintesFalha].forEach((fn) => fn(descritor.src));
      return false;
    },
  );
}

export const fundo = {
  iniciar(elementos) {
    camadas = elementos;
    ativa = 0;
  },
  /** Define o fundo da tela. `fixar` impede prévias (ficha aberta, jogo). */
  definirBase(descritor, { fixar = false } = {}) {
    base = descritor;
    fixo = fixar;
    return aplicar(descritor);
  },
  /** Pré-visualiza a arte de um cartão focado, após curta estabilização. */
  previa(descritor) {
    if (fixo || !descritor || !prefs.obter().fundoDinamico) return;
    window.clearTimeout(temporizador);
    pedido += 1; // invalida qualquer carga em andamento
    temporizador = window.setTimeout(() => aplicar(descritor), ATRASO_PREVIA);
  },
  /** Volta ao fundo da tela (foco saiu da faixa de cartões). */
  restaurar() {
    if (fixo) return;
    window.clearTimeout(temporizador);
    pedido += 1;
    temporizador = window.setTimeout(() => aplicar(base), ATRASO_PREVIA);
  },
  /** Cancela temporizador e pedidos pendentes (troca de tela). */
  cancelar() {
    window.clearTimeout(temporizador);
    pedido += 1;
  },
  /** Baixa com antecedência a arte de vizinhos previsíveis. */
  precarregar(descritor) {
    const resolvido = resolver(descritor);
    if (resolvido.src && prefs.obter().fundoDinamico) carregar(resolvido.src).catch(() => {});
  },
  /** Reaplica o fundo da tela (mudou a arte padrão nas preferências). */
  reaplicar() {
    mostrado = null;
    return aplicar(base);
  },
  atual() {
    return mostrado;
  },
  aoFalhar(fn) {
    ouvintesFalha.add(fn);
    return () => ouvintesFalha.delete(fn);
  },
  /** Exposto para teste: aplica já, devolvendo a promessa da troca. */
  solicitar: aplicar,
};
