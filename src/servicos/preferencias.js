// Preferências: valores padrão, normalização, prévia reversível e aplicação
// no documento. Nunca guarda texto de formulário.

import { armazenamento } from './armazenamento.js';

function idiomaInicial() {
  const lingua = (navigator.language || 'pt').toLowerCase();
  return lingua.startsWith('pt') ? 'pt' : 'en';
}

export const OPCOES = Object.freeze({
  idioma: ['pt', 'en'],
  modo: ['console', 'simples'],
  tema: ['escuro', 'claro'],
  realce: ['verde', 'azul', 'ambar', 'rosa'],
  contraste: ['normal', 'reforcado'],
  texto: ['normal', 'grande', 'maior'],
  movimento: ['sistema', 'reduzido', 'completo'],
  abertura: ['mostrar', 'pular'],
  fundoPadrao: ['aurora', 'grade', 'ondas', 'neutro'],
  ladoGuia: ['esquerda', 'direita'],
  duracaoAviso: [4, 6, 10],
});

export const PADRAO = Object.freeze({
  idioma: idiomaInicial(),
  modo: 'console',
  tema: 'escuro',
  realce: 'verde',
  contraste: 'normal',
  texto: 'normal',
  movimento: 'sistema',
  abertura: 'mostrar',
  fundoDinamico: true,
  fundoPadrao: 'aurora',
  ladoGuia: 'esquerda',
  duracaoAviso: 6,
  audio: false,
  volume: 70,
  volumeInterface: 60,
  volumeJogos: 80,
  zonaMorta: 25,
});

const NUMERICOS = { volume: [0, 100], volumeInterface: [0, 100], volumeJogos: [0, 100], zonaMorta: [10, 60] };
const BOOLEANOS = ['fundoDinamico', 'audio'];

export function normalizar(bruto) {
  const saida = { ...PADRAO };
  if (!bruto || typeof bruto !== 'object') return saida;
  for (const [chave, validos] of Object.entries(OPCOES)) {
    if (validos.includes(bruto[chave])) saida[chave] = bruto[chave];
  }
  for (const [chave, [min, max]] of Object.entries(NUMERICOS)) {
    const numero = Number(bruto[chave]);
    if (Number.isFinite(numero)) saida[chave] = Math.min(max, Math.max(min, Math.round(numero)));
  }
  for (const chave of BOOLEANOS) {
    if (typeof bruto[chave] === 'boolean') saida[chave] = bruto[chave];
  }
  return saida;
}

let salvas = normalizar(armazenamento.ler('prefs'));
let ativas = { ...salvas }; // podem conter uma prévia ainda não salva
const ouvintes = new Set();
const consultaMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

function aplicarNoDocumento() {
  const raiz = document.documentElement;
  raiz.lang = ativas.idioma === 'pt' ? 'pt-BR' : 'en';
  raiz.dataset.tema = ativas.tema;
  raiz.dataset.realce = ativas.realce;
  raiz.dataset.contraste = ativas.contraste;
  raiz.dataset.texto = ativas.texto;
  raiz.dataset.movimento = prefs.movimentoReduzido() ? 'reduzido' : 'completo';
  raiz.dataset.ladoGuia = ativas.ladoGuia;
  raiz.dataset.modo = ativas.modo;
}

function notificar(anteriores) {
  aplicarNoDocumento();
  const mudou = Object.keys(ativas).filter((chave) => ativas[chave] !== anteriores[chave]);
  if (mudou.length) [...ouvintes].forEach((fn) => fn(ativas, mudou));
}

export const prefs = {
  /** Valores em uso agora (podem incluir prévia). */
  obter() {
    return ativas;
  },
  /** Valores efetivamente salvos (ou da sessão, se o storage falhou). */
  salvas() {
    return salvas;
  },
  movimentoReduzido() {
    if (ativas.movimento === 'reduzido') return true;
    if (ativas.movimento === 'completo') return false;
    return consultaMovimento.matches;
  },
  /** Aplica e salva. Devolve true se persistiu em disco. */
  definir(parcial) {
    const anteriores = ativas;
    salvas = normalizar({ ...salvas, ...parcial });
    ativas = { ...ativas, ...salvas };
    const persistiu = armazenamento.salvar('prefs', salvas);
    notificar(anteriores);
    return persistiu;
  },
  /** Aplica um rascunho sem salvar. */
  previa(rascunho) {
    const anteriores = ativas;
    ativas = normalizar({ ...salvas, ...rascunho });
    notificar(anteriores);
  },
  /** Descarta a prévia e volta ao que está salvo. */
  cancelarPrevia() {
    const anteriores = ativas;
    ativas = { ...salvas };
    notificar(anteriores);
  },
  /** Restaura padrões; idioma e modo são mantidos. Não toca em histórico/recordes. */
  restaurarPadrao() {
    return this.definir({ ...PADRAO, idioma: salvas.idioma, modo: salvas.modo });
  },
  aoMudar(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
};

consultaMovimento.addEventListener('change', () => {
  const antes = document.documentElement.dataset.movimento;
  aplicarNoDocumento();
  if (antes !== document.documentElement.dataset.movimento) [...ouvintes].forEach((fn) => fn(ativas, ['movimento']));
});

// Outra aba salvou preferências: refletir sem roubar foco. Uma prévia em
// edição é preservada; a tela de configurações avisa do conflito.
const ouvintesExternos = new Set();
armazenamento.aoMudarFora((categoria) => {
  if (categoria !== 'prefs') return;
  const anteriores = ativas;
  const novasSalvas = normalizar(armazenamento.ler('prefs'));
  const emPrevia = Object.keys(salvas).some((chave) => ativas[chave] !== salvas[chave]);
  salvas = novasSalvas;
  if (!emPrevia) ativas = { ...salvas };
  notificar(anteriores);
  [...ouvintesExternos].forEach((fn) => fn(emPrevia));
});
prefs.aoMudarFora = (fn) => {
  ouvintesExternos.add(fn);
  return () => ouvintesExternos.delete(fn);
};

aplicarNoDocumento();
