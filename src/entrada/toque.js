// Toque: detecção do método de entrada e direcional virtual para os jogos.
// Botões grandes com segurar/soltar; nenhum gesto complexo é exigido.

import { acoes } from './acoes.js';
import { h, icone } from '../interface/dom.js';
import { t } from '../servicos/i18n.js';

export function iniciarToque() {
  document.addEventListener(
    'pointerdown',
    (evento) => {
      acoes.definirMetodo(evento.pointerType === 'touch' || evento.pointerType === 'pen' ? 'toque' : 'mouse');
    },
    { passive: true },
  );
}

export function dispositivoDeToque() {
  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

/**
 * Cria o direcional virtual. `aoMudar(nome, pressionado)` recebe
 * 'cima' | 'baixo' | 'esquerda' | 'direita' | 'a'.
 * Devolve { elemento, soltarTudo, destruir }.
 */
export function criarDirecional(aoMudar, { comAcao = false } = {}) {
  const ativos = new Set();
  const limpezas = [];

  function botao(nome, rotulo, nomeIcone) {
    const el = h('button', { type: 'button', class: 'toque-botao toque-' + nome, 'aria-label': rotulo, 'data-foco-pular': true }, nomeIcone ? icone(nomeIcone, 26) : h('span', { text: 'A' }));
    const apertar = (evento) => {
      evento.preventDefault();
      if (ativos.has(nome)) return;
      ativos.add(nome);
      el.classList.add('apertado');
      aoMudar(nome, true);
    };
    const soltar = () => {
      if (!ativos.delete(nome)) return;
      el.classList.remove('apertado');
      aoMudar(nome, false);
    };
    el.addEventListener('pointerdown', apertar);
    for (const tipo of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(tipo, soltar);
    el.addEventListener('contextmenu', (evento) => evento.preventDefault());
    // Teclado/leitor de tela: Enter ou Espaço dão um toque curto.
    el.addEventListener('click', (evento) => {
      if (evento.detail !== 0) return;
      aoMudar(nome, true);
      window.setTimeout(() => aoMudar(nome, false), 120);
    });
    limpezas.push(soltar);
    return el;
  }

  const cruz = h(
    'div',
    { class: 'toque-cruz', role: 'group', 'aria-label': t('jogo.toque.direcional') },
    botao('cima', t('jogo.toque.cima'), 'cima'),
    botao('esquerda', t('jogo.toque.esquerda'), 'esquerda'),
    botao('direita', t('jogo.toque.direita'), 'direita'),
    botao('baixo', t('jogo.toque.baixo'), 'baixo'),
  );
  const elemento = h('div', { class: 'toque-controles' }, cruz, comAcao ? botao('a', t('jogo.toque.acao'), null) : null);

  return {
    elemento,
    soltarTudo() {
      limpezas.forEach((fn) => fn());
    },
    destruir() {
      limpezas.forEach((fn) => fn());
      elemento.remove();
    },
  };
}
