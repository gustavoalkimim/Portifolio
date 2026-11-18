// Gamepad API → ações. Leitura por quadro só enquanto há controle conectado.
// Zona morta configurável, detecção de borda dos botões e repetição
// controlada das direções. O botão central do sistema nunca é obrigatório.

import { acoes } from './acoes.js';
import { prefs } from '../servicos/preferencias.js';

const BOTOES = { 0: 'confirmar', 1: 'voltar', 2: 'menu', 3: 'busca', 4: 'abaAnterior', 5: 'abaProxima', 8: 'guia', 9: 'guia' };
const DIRECOES = ['cima', 'baixo', 'esquerda', 'direita'];
const REPETICAO_INICIAL = 420;
const REPETICAO_CONTINUA = 130;

let quadro = 0;
let indiceAtivo = null;
const botoesAntes = {};
const direcaoAntes = { cima: false, baixo: false, esquerda: false, direita: false };
const proximaRepeticao = {};
const ouvintes = new Set();

function controles() {
  try {
    return [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean);
  } catch {
    return [];
  }
}

function lerDirecoes(controle) {
  const zona = prefs.obter().zonaMorta / 100;
  const eixoX = controle.axes[0] || 0;
  const eixoY = controle.axes[1] || 0;
  const padrao = controle.mapping === 'standard';
  const botao = (i) => Boolean(padrao && controle.buttons[i] && controle.buttons[i].pressed);
  return {
    cima: botao(12) || eixoY < -zona,
    baixo: botao(13) || eixoY > zona,
    esquerda: botao(14) || eixoX < -zona,
    direita: botao(15) || eixoX > zona,
  };
}

function soltarTudo() {
  for (const direcao of DIRECOES) {
    if (direcaoAntes[direcao]) acoes.emitir(direcao, { pressionado: false, origem: 'controle' });
    direcaoAntes[direcao] = false;
  }
  for (const indice of Object.keys(botoesAntes)) {
    if (botoesAntes[indice] && BOTOES[indice]) acoes.emitir(BOTOES[indice], { pressionado: false, origem: 'controle' });
    botoesAntes[indice] = false;
  }
}

function ler(agora) {
  quadro = 0;
  const lista = controles();
  if (!lista.length) return;
  quadro = requestAnimationFrame(ler);
  if (document.hidden || !document.hasFocus()) return;
  // Com dois controles, vale o que foi usado por último.
  let controle = lista.find((c) => c.index === indiceAtivo) || lista[0];
  for (const outro of lista) {
    if (outro !== controle && outro.buttons.some((b) => b.pressed)) controle = outro;
  }
  if (controle.index !== indiceAtivo) {
    soltarTudo();
    indiceAtivo = controle.index;
  }

  const direcoes = lerDirecoes(controle);
  for (const direcao of DIRECOES) {
    const pressionado = direcoes[direcao];
    if (pressionado && !direcaoAntes[direcao]) {
      acoes.definirMetodo('controle');
      acoes.emitir(direcao, { origem: 'controle' });
      proximaRepeticao[direcao] = agora + REPETICAO_INICIAL;
    } else if (pressionado && agora >= proximaRepeticao[direcao]) {
      acoes.emitir(direcao, { origem: 'controle', repeticao: true });
      proximaRepeticao[direcao] = agora + REPETICAO_CONTINUA;
    } else if (!pressionado && direcaoAntes[direcao]) {
      acoes.emitir(direcao, { pressionado: false, origem: 'controle' });
    }
    direcaoAntes[direcao] = pressionado;
  }

  const total = controle.mapping === 'standard' ? controle.buttons.length : Math.min(2, controle.buttons.length);
  for (let i = 0; i < total; i += 1) {
    const nome = BOTOES[i];
    if (!nome) continue;
    const pressionado = controle.buttons[i].pressed;
    if (pressionado !== Boolean(botoesAntes[i])) {
      if (pressionado) acoes.definirMetodo('controle');
      acoes.emitir(nome, { pressionado, origem: 'controle' });
    }
    botoesAntes[i] = pressionado;
  }
}

function agendar() {
  if (!quadro && controles().length) quadro = requestAnimationFrame(ler);
}

export const controle = {
  iniciar() {
    window.addEventListener('gamepadconnected', (evento) => {
      agendar();
      [...ouvintes].forEach((fn) => fn('conectado', evento.gamepad));
    });
    window.addEventListener('gamepaddisconnected', (evento) => {
      soltarTudo();
      if (evento.gamepad.index === indiceAtivo) indiceAtivo = null;
      if (!controles().length && acoes.metodo() === 'controle') acoes.definirMetodo('teclado');
      [...ouvintes].forEach((fn) => fn('desconectado', evento.gamepad));
    });
    agendar();
  },
  conectado() {
    return controles().length > 0;
  },
  /** fn(tipo: 'conectado' | 'desconectado', gamepad) */
  aoMudar(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
};
