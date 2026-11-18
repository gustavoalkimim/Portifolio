// Catálogo unificado de projetos e jogos, com filtro e busca local.
// A vitrine e a biblioteca leem os mesmos dados daqui.

import { projetos } from '../dados/projetos.js';
import { jogos } from '../dados/jogos.js';
import { experiencias } from '../dados/experiencias.js';
import { secoes } from '../dados/paineis.js';
import { perfil } from '../dados/perfil.js';
import { t, tx } from './i18n.js';

/** Minúsculas e sem acentos, para comparar texto. */
export function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function itemDeProjeto(projeto) {
  return {
    chave: 'projeto:' + projeto.id,
    tipo: 'projeto',
    id: projeto.id,
    rota: '/projetos/' + projeto.id,
    titulo: () => projeto.titulo,
    resumo: () => tx(projeto.descricao),
    selo: () => tx(projeto.estado),
    capa: projeto.midias[0] ? projeto.midias[0].caminho : null,
    capaAlt: () => (projeto.midias[0] ? tx(projeto.midias[0].alt) : ''),
    fundo: projeto.fundo,
    cor: projeto.fundo ? projeto.fundo.cor : null,
    tecnologias: projeto.tecnologias,
    data: projeto.data,
    ano: projeto.data.slice(0, 4),
    dados: projeto,
  };
}

function itemDeJogo(jogo) {
  return {
    chave: 'jogo:' + jogo.id,
    tipo: 'jogo',
    id: jogo.id,
    rota: '/jogos/' + jogo.id,
    titulo: () => tx(jogo.nome),
    resumo: () => tx(jogo.descricao),
    selo: () => tx(jogo.genero),
    capa: jogo.capa,
    capaAlt: () => '',
    fundo: { src: jogo.capa, focoX: 50, focoY: 50, cor: jogo.cor },
    cor: jogo.cor,
    tecnologias: [],
    data: null,
    ano: null,
    dados: jogo,
  };
}

function itemDeSecao(secao) {
  return {
    chave: 'secao:' + secao.id,
    tipo: 'secao',
    id: secao.id,
    rota: secao.rota,
    icone: secao.icone,
    titulo: () => t(secao.chave),
    resumo: () => t(secao.chave + '.resumo'),
    selo: () => t('tipo.secao'),
    capa: null,
    fundo: null,
    tecnologias: [],
    dados: secao,
  };
}

const ITENS = Object.freeze([...projetos.map(itemDeProjeto), ...jogos.map(itemDeJogo)]);
const SECOES = Object.freeze(secoes.map(itemDeSecao));
const POR_CHAVE = new Map([...ITENS, ...SECOES].map((item) => [item.chave, item]));

export const catalogo = {
  /** Projetos (ordem cronológica antiga → recente) seguidos dos jogos. */
  listar() {
    return ITENS;
  },
  projetos() {
    return ITENS.filter((item) => item.tipo === 'projeto');
  },
  jogos() {
    return ITENS.filter((item) => item.tipo === 'jogo');
  },
  secoes() {
    return SECOES;
  },
  obter(chave) {
    return POR_CHAVE.get(chave) || null;
  },
  tecnologias() {
    return [...new Set(projetos.flatMap((projeto) => projeto.tecnologias))].sort((a, b) => a.localeCompare(b));
  },
  anos() {
    return [...new Set(projetos.map((projeto) => projeto.data.slice(0, 4)))].sort();
  },
  /**
   * @param {{tipo?:string, tec?:string, ano?:string, texto?:string, ordem?:string}} filtro
   * @param {string[]} recentes chaves em ordem de acesso, para ordem 'recente'
   */
  filtrar(filtro = {}, recentes = []) {
    const texto = normalizar(filtro.texto);
    let lista = ITENS.filter((item) => {
      if (filtro.tipo && filtro.tipo !== 'todos' && item.tipo !== filtro.tipo) return false;
      if (filtro.tec && !item.tecnologias.includes(filtro.tec)) return false;
      if (filtro.ano && item.ano !== filtro.ano) return false;
      if (texto) {
        const alvo = normalizar([item.titulo(), item.resumo(), item.tecnologias.join(' '), item.selo()].join(' '));
        if (!alvo.includes(texto)) return false;
      }
      return true;
    });
    const ordem = filtro.ordem || 'data';
    if (ordem === 'nome') {
      lista = [...lista].sort((a, b) => a.titulo().localeCompare(b.titulo()));
    } else if (ordem === 'recente') {
      const posicao = (item) => {
        const indice = recentes.indexOf(item.chave);
        return indice < 0 ? Number.MAX_SAFE_INTEGER : indice;
      };
      lista = [...lista].sort((a, b) => posicao(a) - posicao(b));
    }
    // 'data': a ordem base já é cronológica (antiga → recente), jogos ao final.
    return lista;
  },
};

// ---- Busca global -------------------------------------------------------

function nosDoisIdiomas(...campos) {
  return campos.filter(Boolean).map((campo) => (typeof campo === 'string' ? campo : campo.pt + ' ' + campo.en)).join(' ');
}

function entradasDeBusca() {
  const entradas = [];
  for (const item of ITENS) {
    entradas.push({
      tipo: item.tipo,
      chave: item.chave,
      titulo: item.titulo(),
      trecho: item.resumo(),
      rota: item.rota,
      tecnologias: item.tecnologias,
      extra: item.selo(),
      // Índice bilíngue: o termo vale nos dois idiomas, seja qual for o atual.
      alternativos: item.tipo === 'jogo' ? [item.dados.nome.pt, item.dados.nome.en] : [],
      outroIdioma: nosDoisIdiomas(item.dados.descricao, item.dados.estado, item.dados.genero),
    });
  }
  for (const experiencia of experiencias) {
    entradas.push({
      tipo: 'experiencia',
      chave: 'experiencia:' + experiencia.id,
      titulo: tx(experiencia.atividade),
      trecho: tx(experiencia.descricao),
      rota: '/experiencias',
      tecnologias: [],
      extra: tx(experiencia.instituicao),
      alternativos: [experiencia.atividade.pt, experiencia.atividade.en],
      outroIdioma: nosDoisIdiomas(experiencia.descricao, experiencia.instituicao),
    });
  }
  entradas.push({
    tipo: 'secao',
    chave: 'secao:perfil-texto',
    titulo: perfil.nome,
    trecho: tx(perfil.apresentacao),
    rota: '/perfil',
    tecnologias: [],
    extra: [tx(perfil.subtitulo), tx(perfil.interesses), tx(perfil.objetivos), tx(perfil.formacao.texto)].join(' '),
  });
  for (const secao of SECOES) {
    entradas.push({ tipo: 'secao', chave: secao.chave, titulo: secao.titulo(), trecho: secao.resumo(), rota: secao.rota, tecnologias: [], extra: '' });
  }
  for (const chave of ['idioma', 'aparencia', 'fundo', 'movimento', 'audio', 'entrada', 'dados', 'sobre']) {
    entradas.push({
      tipo: 'configuracao',
      chave: 'configuracao:' + chave,
      titulo: t('config.' + chave),
      trecho: t('config.' + chave + '.resumo'),
      rota: '/configuracoes?secao=' + chave,
      tecnologias: [],
      extra: '',
    });
  }
  return entradas;
}

/**
 * Busca local. Ranking explícito e estável: título exato (0), prefixo do
 * título (1), título contém (2), tecnologia (3), descrição/outros (4).
 * Empate mantém a ordem do catálogo.
 */
export function buscar(consulta, tipo = 'todos') {
  const termo = normalizar(consulta);
  const entradas = entradasDeBusca().filter((entrada) => tipo === 'todos' || entrada.tipo === tipo);
  if (!termo) return [];
  const resultados = [];
  entradas.forEach((entrada, indice) => {
    const titulo = normalizar(entrada.titulo);
    let nivel = -1;
    if (titulo === termo) nivel = 0;
    else if (titulo.startsWith(termo)) nivel = 1;
    else if (titulo.includes(termo) || (entrada.alternativos || []).some((alt) => normalizar(alt).includes(termo))) nivel = 2;
    else if (entrada.tecnologias.some((tec) => normalizar(tec).includes(termo))) nivel = 3;
    else if (normalizar(entrada.trecho + ' ' + entrada.extra + ' ' + (entrada.outroIdioma || '')).includes(termo)) nivel = 4;
    if (nivel >= 0) resultados.push({ ...entrada, nivel, indice });
  });
  return resultados.sort((a, b) => a.nivel - b.nivel || a.indice - b.indice);
}
