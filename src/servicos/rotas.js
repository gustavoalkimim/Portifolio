// Roteador por hash, compatível com GitHub Pages em subpasta.
// Rotas canônicas (F27) e complementares; ID desconhecido vira recuperação.

import { projetos } from '../dados/projetos.js';
import { jogos } from '../dados/jogos.js';

const SIMPLES = ['inicio', 'biblioteca', 'vitrine', 'perfil', 'experiencias', 'conquistas', 'capturas', 'contato', 'ajuda', 'configuracoes'];
// Âncoras do site anterior continuam levando a algum lugar.
const LEGADO = { sobre: '/perfil', projetos: '/biblioteca?tipo=projeto', experiencias: '/experiencias', contato: '/contato', principal: '/inicio' };

const ouvintes = new Set();
let atual = null;
let guarda = null;
let ignorarProximo = false;
// Pilha das rotas visitadas nesta aba. Voltar só usa history.back() quando a
// rota anterior é do próprio site; na primeira tela vai para um destino seguro.
const pilha = [];
let substituindo = false;

function interpretar(hash) {
  let bruto = String(hash || '').replace(/^#/, '');
  if (LEGADO[bruto]) bruto = LEGADO[bruto];
  let caminho = bruto;
  let consultaTexto = '';
  const corte = bruto.indexOf('?');
  if (corte >= 0) {
    caminho = bruto.slice(0, corte);
    consultaTexto = bruto.slice(corte + 1);
  }
  const consulta = {};
  try {
    new URLSearchParams(consultaTexto).forEach((valor, chave) => {
      consulta[chave] = valor;
    });
  } catch {
    /* consulta inválida é ignorada */
  }
  let partes;
  try {
    partes = caminho.split('/').filter(Boolean).map((parte) => decodeURIComponent(parte).trim().toLowerCase());
  } catch {
    partes = ['?'];
  }
  const base = { caminho: '/' + partes.join('/'), consulta, hash: '#/' + partes.join('/') + (consultaTexto ? '?' + consultaTexto : '') };
  if (partes.length === 0) return { ...base, nome: 'inicio', params: {}, valida: true, caminho: '/inicio', hash: '#/inicio', vazia: true };
  if (partes.length === 1 && SIMPLES.includes(partes[0])) return { ...base, nome: partes[0], params: {}, valida: true };
  if (partes.length === 2 && partes[0] === 'projetos' && projetos.some((p) => p.id === partes[1])) {
    return { ...base, nome: 'projeto', params: { id: partes[1] }, valida: true };
  }
  if (partes.length === 2 && partes[0] === 'jogos' && jogos.some((j) => j.id === partes[1])) {
    return { ...base, nome: 'jogo', params: { id: partes[1] }, valida: true };
  }
  const tipo = partes[0] === 'projetos' ? 'projeto' : partes[0] === 'jogos' ? 'jogo' : 'rota';
  return { ...base, nome: 'recuperacao', params: { tipo }, valida: false };
}

async function aoMudarHash() {
  if (ignorarProximo) {
    ignorarProximo = false;
    return;
  }
  const nova = interpretar(location.hash);
  if (atual && nova.hash === atual.hash) return;
  if (guarda && atual) {
    const funcao = guarda;
    const permitido = await funcao(nova);
    if (!permitido) {
      // Desfaz a troca de endereço sem disparar nova navegação.
      ignorarProximo = true;
      location.hash = atual.hash;
      return;
    }
  }
  const veioDoHistorico = !substituindo && pilha.length > 1 && pilha[pilha.length - 2] === nova.hash;
  if (substituindo) pilha[pilha.length - 1] = nova.hash;
  else if (veioDoHistorico) pilha.pop();
  else pilha.push(nova.hash);
  substituindo = false;
  const anterior = atual;
  atual = nova;
  [...ouvintes].forEach((fn) => fn(atual, { anterior, veioDoHistorico }));
}

export const rotas = {
  iniciar() {
    window.addEventListener('hashchange', aoMudarHash);
    atual = interpretar(location.hash);
    if (atual.vazia) history.replaceState(null, '', '#/inicio');
    pilha.push(atual.hash);
    [...ouvintes].forEach((fn) => fn(atual, { anterior: null, veioDoHistorico: false, inicial: true }));
  },
  atual() {
    return atual;
  },
  lerRota: interpretar,
  /** Navega para '/caminho?consulta'. */
  navegar(caminho, { substituir = false } = {}) {
    const hash = '#' + (caminho.startsWith('/') ? caminho : '/' + caminho);
    if (atual && interpretar(hash).hash === atual.hash) return;
    if (substituir) {
      substituindo = true;
      location.replace(hash);
    } else {
      location.hash = hash;
    }
  },
  /** Volta no histórico interno; se a visita começou aqui, vai ao fallback. */
  voltar(fallback = '/inicio') {
    if (pilha.length > 1) history.back();
    else if (atual && atual.caminho !== fallback) this.navegar(fallback, { substituir: true });
  },
  podeVoltar() {
    return pilha.length > 1;
  },
  inscrever(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
  /** Guarda assíncrona: recebe a rota de destino e devolve true para permitir. */
  definirGuarda(fn) {
    guarda = fn;
  },
  /** URL absoluta de uma rota, para copiar e compartilhar. */
  urlDe(caminho) {
    return location.origin + location.pathname + '#' + caminho;
  },
};
