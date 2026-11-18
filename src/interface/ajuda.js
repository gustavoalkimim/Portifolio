// Ajuda e acessibilidade: comandos por dispositivo, ajustes rápidos,
// controles dos jogos, índice textual com links permanentes e o modo simples.

import { h, icone } from './dom.js';
import { t, tx } from '../servicos/i18n.js';
import { prefs } from '../servicos/preferencias.js';
import { jogos } from '../dados/jogos.js';
import { projetos } from '../dados/projetos.js';
import { controle } from '../entrada/controle.js';
import { armazenamento } from '../servicos/armazenamento.js';
import { cabecalhoTela, segmentos } from './componentes.js';

function tabela(titulo, linhas, nota) {
  return h(
    'section',
    { class: 'bloco' },
    h('h2', { class: 'bloco-titulo', text: titulo }),
    nota ? h('p', { class: 'nota', text: nota }) : null,
    h('dl', { class: 'fatos' }, linhas.map(([comando, efeito]) => h('div', null, h('dt', null, h('kbd', { text: comando })), h('dd', { text: efeito })))),
  );
}

function salvar(parcial) {
  const persistiu = prefs.definir(parcial);
  return persistiu;
}

export function montar(raiz) {
  const p = prefs.obter();
  const nota = h('p', { class: 'nota', role: 'status', text: armazenamento.disponivel ? '' : t('config.soSessao') });
  const aviso = (persistiu) => {
    nota.textContent = persistiu ? t('config.salvo') : t('config.soSessao');
  };

  const indice = [
    ['/inicio', t('nav.inicio')],
    ['/perfil', t('secao.perfil')],
    ['/experiencias', t('nav.jornada')],
    ['/biblioteca', t('nav.biblioteca')],
    ...projetos.map((projeto) => ['/projetos/' + projeto.id, projeto.titulo]),
    ...jogos.map((jogo) => ['/jogos/' + jogo.id, tx(jogo.nome)]),
    ['/vitrine', t('nav.vitrine')],
    ['/conquistas', t('secao.conquistas')],
    ['/capturas', t('secao.capturas')],
    ['/contato', t('secao.contato')],
    ['/configuracoes', t('nav.configuracoes')],
  ];

  raiz.append(
    cabecalhoTela({ titulo: t('secao.ajuda'), subtitulo: t('ajuda.subtitulo') }),
    h(
      'section',
      { class: 'bloco', 'aria-label': t('ajuda.rapidos') },
      h('h2', { class: 'bloco-titulo', text: t('ajuda.rapidos') }),
      h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('config.modo') }), segmentos({
        id: 'ajuda-modo',
        rotulo: t('config.modo'),
        valor: p.modo,
        opcoes: [{ valor: 'console', rotulo: t('config.modo.console') }, { valor: 'simples', rotulo: t('config.modo.simples') }],
        aoEscolher: (valor) => aviso(salvar({ modo: valor })),
      })),
      h('p', { class: 'nota', text: t('ajuda.modoSimples') }),
      h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('config.movimento') }), segmentos({
        id: 'ajuda-movimento',
        rotulo: t('config.movimento'),
        valor: p.movimento,
        opcoes: ['sistema', 'reduzido', 'completo'].map((valor) => ({ valor, rotulo: t('config.movimento.' + valor) })),
        aoEscolher: (valor) => aviso(salvar({ movimento: valor })),
      })),
      h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('config.contraste') }), segmentos({
        id: 'ajuda-contraste',
        rotulo: t('config.contraste'),
        valor: p.contraste,
        opcoes: ['normal', 'reforcado'].map((valor) => ({ valor, rotulo: t('config.contraste.' + valor) })),
        aoEscolher: (valor) => aviso(salvar({ contraste: valor })),
      })),
      h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('config.texto') }), segmentos({
        id: 'ajuda-texto',
        rotulo: t('config.texto'),
        valor: p.texto,
        opcoes: ['normal', 'grande', 'maior'].map((valor) => ({ valor, rotulo: t('config.texto.' + valor) })),
        aoEscolher: (valor) => aviso(salvar({ texto: valor })),
      })),
      nota,
      h('p', null, h('a', { class: 'link', href: '#/configuracoes', 'data-chave': 'ajuda:config', text: t('ajuda.todasConfig') })),
    ),
    h(
      'div',
      { class: 'blocos blocos-largos' },
      tabela(t('ajuda.teclado'), [
        ['← ↑ ↓ →', t('ajuda.cmd.navegar')],
        ['Tab / Shift+Tab', t('ajuda.cmd.tab')],
        ['Enter / ' + t('ajuda.espaco'), t('ajuda.cmd.abrir')],
        ['Esc / Backspace', t('ajuda.cmd.voltar')],
        ['G', t('ajuda.cmd.guia')],
        ['/ ' + t('ajuda.ou') + ' Ctrl+K', t('ajuda.cmd.busca')],
        ['M / Shift+F10', t('ajuda.cmd.menu')],
        ['?', t('ajuda.cmd.ajuda')],
      ], t('ajuda.teclado.nota')),
      tabela(t('ajuda.controle'), [
        [t('ajuda.direcional'), t('ajuda.cmd.navegar')],
        ['A', t('ajuda.cmd.abrir')],
        ['B', t('ajuda.cmd.voltar')],
        ['X', t('ajuda.cmd.menu')],
        ['Y', t('ajuda.cmd.busca')],
        ['Menu / View', t('ajuda.cmd.guia')],
        ['LB / RB', t('ajuda.cmd.abas')],
      ], t(controle.conectado() ? 'ajuda.controle.conectado' : 'ajuda.controle.nota')),
      tabela(t('ajuda.toque'), [
        [t('ajuda.tocar'), t('ajuda.cmd.abrir')],
        [t('ajuda.arrastar'), t('ajuda.cmd.rolar')],
        ['⋯', t('ajuda.cmd.menu')],
        ['☰', t('ajuda.cmd.guia')],
      ], t('ajuda.toque.nota')),
    ),
    h(
      'section',
      { class: 'bloco', 'aria-label': t('ajuda.jogos') },
      h('h2', { class: 'bloco-titulo', text: t('ajuda.jogos') }),
      h('p', { class: 'nota', text: t('ajuda.jogos.nota') }),
      jogos.map((jogo) =>
        h(
          'details',
          { class: 'painel-controles' },
          h('summary', { 'data-chave': 'ajuda:jogo:' + jogo.id, text: tx(jogo.nome) }),
          h('p', { text: tx(jogo.objetivo) }),
          h('dl', { class: 'fatos' }, ['teclado', 'toque', 'controle'].map((tipo) => h('div', null, h('dt', { text: t('ajuda.' + tipo) }), h('dd', { text: tx(jogo.controles[tipo]) })))),
          h('p', null, h('a', { class: 'link', href: '#/jogos/' + jogo.id, text: t('menu.verJogo') })),
        ),
      ),
    ),
    h(
      'nav',
      { class: 'bloco', 'aria-label': t('ajuda.indice') },
      h('h2', { class: 'bloco-titulo' }, icone('lista', 18), h('span', { text: t('ajuda.indice') })),
      h('p', { class: 'nota', text: t('ajuda.indice.nota') }),
      h('ul', { class: 'indice', 'data-regiao': 'indice' }, indice.map(([rota, nome]) => h('li', null, h('a', { class: 'link', href: '#' + rota, 'data-chave': 'indice:' + rota }, nome, h('code', { text: ' #' + rota }))))),
    ),
  );
  const primeiro = raiz.querySelector('.segmento');
  if (primeiro) primeiro.setAttribute('data-foco-inicial', '');
  return { titulo: t('secao.ajuda'), fundo: 'neutro' };
}
