// Recentes e favoritos: apenas identificadores e data local, nunca conteúdo
// de formulário. Referências órfãs são descartadas na leitura.

import { armazenamento } from './armazenamento.js';
import { catalogo } from './catalogo.js';

const LIMITE_RECENTES = 12;
export const LIMITE_FAVORITOS = 6;
const ouvintes = new Set();

function valida(chave) {
  return typeof chave === 'string' && catalogo.obter(chave) !== null;
}

function lerHistorico(atual = false) {
  const bruto = atual ? armazenamento.lerAtual('historico', []) : armazenamento.ler('historico', []);
  if (!Array.isArray(bruto)) return [];
  return bruto.filter((entrada) => entrada && valida(entrada.chave) && Number.isFinite(entrada.data));
}

function lerFavoritos(atual = false) {
  const bruto = atual ? armazenamento.lerAtual('favoritos', []) : armazenamento.ler('favoritos', []);
  if (!Array.isArray(bruto)) return [];
  return [...new Set(bruto.filter(valida))].slice(0, LIMITE_FAVORITOS);
}

function avisar() {
  [...ouvintes].forEach((fn) => fn());
}

export const historico = {
  /** Registra um acesso; duplicata sobe para o topo. Mescla com outras abas. */
  registrar(chave) {
    if (!valida(chave)) return;
    const mapa = new Map();
    for (const entrada of lerHistorico(true)) mapa.set(entrada.chave, entrada.data);
    mapa.set(chave, Date.now());
    const lista = [...mapa].map(([c, data]) => ({ chave: c, data })).sort((a, b) => b.data - a.data).slice(0, LIMITE_RECENTES);
    armazenamento.salvar('historico', lista);
    avisar();
  },
  /** Mais recente primeiro. */
  recentes() {
    return lerHistorico().sort((a, b) => b.data - a.data);
  },
  remover(chave) {
    armazenamento.salvar('historico', lerHistorico(true).filter((entrada) => entrada.chave !== chave));
    avisar();
  },
  limpar() {
    armazenamento.limpar('historico');
    avisar();
  },
  favoritos() {
    return lerFavoritos();
  },
  fixado(chave) {
    return lerFavoritos().includes(chave);
  },
  /** Devolve { fixado, limite } — `limite` true quando não coube. */
  alternarFixado(chave) {
    const lista = lerFavoritos(true);
    if (lista.includes(chave)) {
      armazenamento.salvar('favoritos', lista.filter((c) => c !== chave));
      avisar();
      return { fixado: false, limite: false };
    }
    if (lista.length >= LIMITE_FAVORITOS) return { fixado: false, limite: true };
    armazenamento.salvar('favoritos', [...lista, chave]);
    avisar();
    return { fixado: true, limite: false };
  },
  limparFavoritos() {
    armazenamento.limpar('favoritos');
    avisar();
  },
  aoMudar(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
};

armazenamento.aoMudarFora((categoria) => {
  if (categoria === 'historico' || categoria === 'favoritos') avisar();
});
