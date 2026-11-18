// Galeria: lista de mídias reais dos projetos e visualizador ampliado com
// anterior/próximo, legenda, origem e licença. Fecha com Esc/B e devolve o
// foco à miniatura de origem.

import { h, icone } from './dom.js';
import { t, tx } from '../servicos/i18n.js';
import { projetos } from '../dados/projetos.js';
import { sobreposicoes } from './sobreposicoes.js';
import { notificacoes } from '../servicos/notificacoes.js';
import { foco } from '../entrada/foco.js';

/** Todas as mídias autorizadas, com o projeto de origem. */
export function todasAsMidias() {
  return projetos.flatMap((projeto) => projeto.midias.map((midia) => ({ midia, projeto })));
}

/** Miniatura que abre o visualizador. Em falha, vira texto com a legenda. */
export function miniatura(entrada, lista) {
  const { midia, projeto } = entrada;
  const botao = h(
    'button',
    { type: 'button', class: 'miniatura', 'data-chave': 'midia:' + midia.id, 'aria-label': t('galeria.ampliar', { nome: projeto.titulo }), onClick: () => abrirGaleria(lista, lista.indexOf(entrada), botao) },
    h('img', { src: midia.caminho, alt: tx(midia.alt), loading: 'lazy', decoding: 'async', width: midia.largura, height: midia.altura }),
    h('span', { class: 'miniatura-acao' }, icone('ampliar', 16), h('span', { text: t('galeria.ampliarCurto') })),
  );
  botao.querySelector('img').addEventListener(
    'error',
    () => {
      botao.replaceWith(h('p', { class: 'aviso-inline', role: 'status', text: t('galeria.falhou') }));
      notificacoes.registrar({ tipo: 'erro', chave: 'aviso.midiaFalhou', vars: { nome: projeto.titulo }, unico: 'midia:' + midia.caminho });
    },
    { once: true },
  );
  return h('figure', { class: 'figura' }, botao, h('figcaption', null, h('span', { text: tx(midia.descricao) }), h('span', { class: 'figura-credito', text: t('galeria.origem') + ': ' + tx(midia.origem) + ' · ' + t('galeria.licenca') + ': ' + tx(midia.licenca) })));
}

export function abrirGaleria(lista, indiceInicial, gatilho) {
  let indice = Math.max(0, indiceInicial);
  let ampliada = false;
  sobreposicoes.abrir({
    tipo: 'galeria',
    rotulo: t('galeria.titulo'),
    gatilho,
    montar(painel, fechar) {
      const palco = h('div', { class: 'galeria-palco' });
      const legenda = h('div', { class: 'galeria-legenda', 'aria-live': 'polite' });
      const posicao = h('span', { class: 'galeria-posicao' });
      const botaoZoom = h('button', { type: 'button', class: 'botao', 'data-chave': 'galeria:zoom' });

      const desenhar = () => {
        const { midia, projeto } = lista[indice];
        const imagem = h('img', { src: midia.caminho, alt: tx(midia.alt), class: ampliada ? 'ampliada' : null });
        imagem.addEventListener('error', () => imagem.replaceWith(h('p', { class: 'aviso-inline', text: t('galeria.falhou') })), { once: true });
        palco.replaceChildren(imagem);
        palco.classList.toggle('ampliada', ampliada);
        legenda.replaceChildren(
          h('p', { class: 'galeria-projeto', text: projeto.titulo }),
          h('p', { text: tx(midia.descricao) }),
          h('p', { class: 'figura-credito', text: t('galeria.origem') + ': ' + tx(midia.origem) + ' · ' + t('galeria.licenca') + ': ' + tx(midia.licenca) }),
          h('a', { class: 'link', href: '#/projetos/' + projeto.id, text: t('galeria.verProjeto') }),
        );
        posicao.textContent = t('galeria.posicao', { n: indice + 1, total: lista.length });
        botaoZoom.replaceChildren(icone('ampliar', 16), h('span', { text: t(ampliada ? 'galeria.reduzir' : 'galeria.ampliarCurto') }));
        botaoZoom.setAttribute('aria-pressed', String(ampliada));
      };
      const ir = (passo) => {
        indice = (indice + passo + lista.length) % lista.length;
        ampliada = false;
        desenhar();
      };
      botaoZoom.addEventListener('click', () => {
        ampliada = !ampliada;
        desenhar();
        foco.focar(botaoZoom, { rolar: false });
      });
      const varias = lista.length > 1;
      painel.append(
        h(
          'div',
          { class: 'galeria-barra', 'data-regiao': 'galeria-barra', 'data-eixo': 'x' },
          h('h2', { class: 'galeria-titulo', text: t('galeria.titulo') }),
          posicao,
          varias ? h('button', { type: 'button', class: 'botao', 'aria-label': t('galeria.anterior'), onClick: () => ir(-1) }, icone('esquerda', 18)) : null,
          varias ? h('button', { type: 'button', class: 'botao', 'aria-label': t('galeria.proxima'), onClick: () => ir(1) }, icone('direita', 18)) : null,
          botaoZoom,
          h('button', { type: 'button', class: 'botao', 'data-foco-inicial': true, onClick: () => fechar() }, icone('fechar', 16), h('span', { text: t('comum.fechar') })),
        ),
        palco,
        legenda,
      );
      desenhar();
    },
  });
}
