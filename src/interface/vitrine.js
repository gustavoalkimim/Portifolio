// Vitrine: os mesmos dados da biblioteca, apresentados como fichas em
// destaque. Não há preço, compra nem assinatura — só "Ver projeto" e "Jogar".

import { h, icone } from './dom.js';
import { t, formatarMes } from '../servicos/i18n.js';
import { catalogo } from '../servicos/catalogo.js';
import { rotas } from '../servicos/rotas.js';
import { cartao, trilho, cabecalhoTela } from './componentes.js';

export function montar(raiz) {
  const projetos = catalogo.projetos();
  const jogos = catalogo.jogos();
  // Destaque: o projeto de data mais recente entre os confirmados.
  const destaque = [...projetos].sort((a, b) => b.data.localeCompare(a.data))[0] || null;

  raiz.append(cabecalhoTela({ titulo: t('nav.vitrine'), subtitulo: t('vitrine.subtitulo') }));

  if (!projetos.length && !jogos.length) {
    raiz.append(h('div', { class: 'vazio-bloco' }, h('p', { class: 'vazio-titulo', text: t('vitrine.vazio') }), h('a', { class: 'botao botao-principal', href: '#/biblioteca', 'data-foco-inicial': true, text: t('nav.biblioteca') })));
    return { titulo: t('nav.vitrine') };
  }

  if (destaque) {
    const link = h(
      'a',
      { class: 'botao botao-principal', href: '#' + destaque.rota, 'data-chave': 'vitrine:destaque', 'data-foco-inicial': true },
      icone('direita', 18),
      h('span', { text: t('vitrine.verProjeto') }),
    );
    link.fundo = destaque.fundo;
    const imagem = h('img', { src: destaque.capa, alt: destaque.capaAlt(), loading: 'lazy' });
    imagem.addEventListener('error', () => imagem.remove(), { once: true });
    raiz.append(
      h(
        'section',
        { class: 'vitrine-destaque', 'aria-label': t('vitrine.destaque') },
        h('div', { class: 'vitrine-capa', style: { backgroundColor: destaque.cor } }, imagem),
        h(
          'div',
          { class: 'vitrine-texto' },
          h('p', { class: 'destaque-tipo', text: t('vitrine.destaque') + ' · ' + formatarMes(destaque.data) }),
          h('h2', { class: 'vitrine-titulo', text: destaque.titulo() }),
          h('p', { text: destaque.resumo() }),
          h('ul', { class: 'etiquetas' }, destaque.tecnologias.map((tec) => h('li', { class: 'etiqueta', text: tec }))),
          h('div', { class: 'acoes', 'data-regiao': 'vitrine-acoes' }, link),
        ),
      ),
    );
  }

  raiz.append(
    h(
      'div',
      { class: 'home-trilhos' },
      trilho({ id: 'vitrine-projetos', titulo: t('home.grupo.projetos'), cartoes: projetos.map((item) => cartao(item, { variante: 'panoramico' })), verTudo: { rota: '/biblioteca?tipo=projeto' } }),
      trilho({
        id: 'vitrine-jogos',
        titulo: t('home.grupo.jogos'),
        cartoes: jogos.map((item) => {
          const el = cartao(item, { variante: 'poster' });
          el.append(
            h('button', {
              type: 'button',
              class: 'botao botao-mini',
              text: t('jogo.jogar'),
              'aria-label': t('jogo.jogar') + ': ' + item.titulo(),
              'data-chave': 'vitrine:jogar:' + item.id,
              onClick: () => {
                rotas.intencao = { jogar: item.id };
                rotas.navegar(item.rota);
              },
            }),
          );
          return el;
        }),
        verTudo: { rota: '/biblioteca?tipo=jogo' },
      }),
    ),
  );
  return { titulo: t('nav.vitrine'), fundo: 'padrao' };
}
