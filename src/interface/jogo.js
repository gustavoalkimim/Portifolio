// Ficha de jogo: gênero, objetivo, controles por dispositivo, recordes locais
// e o botão Jogar, que só então carrega o módulo do jogo.

import { h, icone } from './dom.js';
import { t, tx } from '../servicos/i18n.js';
import { catalogo } from '../servicos/catalogo.js';
import { rotas } from '../servicos/rotas.js';
import { recordes } from '../servicos/recordes.js';
import { historico } from '../servicos/historico.js';
import { armazenamento } from '../servicos/armazenamento.js';
import { cabecalhoTela, copiarLink, alternarFixado } from './componentes.js';
import { abrirPalco, formatarPontos } from './palco.js';
import { foco } from '../entrada/foco.js';

export function montar(raiz, rota, ctx) {
  const item = catalogo.obter('jogo:' + rota.params.id);
  const jogo = item.dados;

  const botaoJogar = h('button', { type: 'button', class: 'botao botao-principal botao-grande', 'data-chave': 'jogo:jogar', 'data-foco-inicial': true }, icone('jogar', 20), h('span', { text: t('jogo.jogar') }));
  botaoJogar.addEventListener('click', () => abrirPalco(jogo, botaoJogar));

  const botaoFixar = h('button', { type: 'button', class: 'botao', 'data-chave': 'jogo:fixar', 'aria-pressed': String(historico.fixado(item.chave)) }, icone('fixar', 18), h('span', { text: t(historico.fixado(item.chave) ? 'menu.desafixar' : 'menu.fixar') }));
  botaoFixar.addEventListener('click', () => {
    alternarFixado(item);
    ctx.remontar();
    foco.focar(document.querySelector('[data-chave="jogo:fixar"]'), { rolar: false });
  });

  const listaRecordes = h('div', { class: 'recordes' });
  const desenharRecordes = () => {
    const registros = recordes.listarDoJogo(jogo.id, jogo.versaoRegras);
    listaRecordes.replaceChildren(
      h('h2', { class: 'ficha-subtitulo', text: t('jogo.recordes') }),
      registros.length
        ? h('ul', { class: 'lista-simples' }, registros.map((registro) => h('li', null, h('strong', { text: formatarPontos(jogo, registro.pontos) }), h('span', { class: 'nota', text: ' — ' + t('jogo.variante', { nome: t('variante.' + registro.variante) || registro.variante }) }))))
        : h('p', { class: 'vazio', text: t('jogo.semRecorde') }),
      h('p', { class: 'nota', text: t(armazenamento.disponivel ? 'jogo.recordeNota' : 'jogo.recordeNaoSalvo') }),
    );
  };
  desenharRecordes();
  const parar = recordes.aoMudar(desenharRecordes);

  const capa = h('img', { src: jogo.capa, alt: '', loading: 'lazy' });
  capa.addEventListener('error', () => capa.remove(), { once: true });

  raiz.append(
    cabecalhoTela({ titulo: tx(jogo.nome), subtitulo: t('tipo.jogo') + ' · ' + tx(jogo.genero), voltarPara: '/biblioteca?tipo=jogo' }),
    h(
      'div',
      { class: 'ficha' },
      h(
        'section',
        { class: 'ficha-principal', 'aria-label': t('ficha.sobre') },
        h('p', { class: 'ficha-descricao', text: tx(jogo.descricao) }),
        jogo.aviso ? h('p', { class: 'aviso-inline' }, icone('alerta', 16), h('span', { text: tx(jogo.aviso) })) : null,
        h(
          'div',
          { class: 'acoes', 'data-regiao': 'ficha-acoes' },
          botaoJogar,
          botaoFixar,
          h('button', { type: 'button', class: 'botao', 'data-chave': 'jogo:copiar', onClick: () => copiarLink(item.rota) }, icone('copiar', 18), h('span', { text: t('menu.copiarLink') })),
        ),
        h('h2', { class: 'ficha-subtitulo', text: t('jogo.objetivo') }),
        h('p', { text: tx(jogo.objetivo) }),
        h('h2', { class: 'ficha-subtitulo', text: t('jogo.controles') }),
        h(
          'dl',
          { class: 'fatos' },
          ['teclado', 'toque', 'controle'].map((tipo) => h('div', null, h('dt', { text: t('ajuda.' + tipo) }), h('dd', { text: tx(jogo.controles[tipo]) }))),
        ),
        h('p', { class: 'nota', text: t('jogo.autoral') }),
      ),
      h('section', { class: 'ficha-midia', 'aria-label': t('jogo.recordes') }, h('div', { class: 'jogo-capa', style: { backgroundColor: jogo.cor } }, capa), listaRecordes),
    ),
  );

  // "Jogar" pedido de fora (menu do cartão, vitrine): abre o menu do jogo,
  // nunca a partida diretamente.
  if (rotas.intencao && rotas.intencao.jogar === jogo.id) {
    rotas.intencao = null;
    window.setTimeout(() => botaoJogar.isConnected && abrirPalco(jogo, botaoJogar), 0);
  }

  return {
    titulo: tx(jogo.nome),
    fundo: item.fundo,
    fixarFundo: true,
    destruir: parar,
  };
}
