// Ficha de projeto: capa, descrição, data, estado real, tecnologias, mídias
// e ações que existem de verdade. Campo sem fonte é omitido; link ausente
// não vira botão; repositório privado é avisado antes do clique.

import { h, icone, anexar } from './dom.js';
import { t, tx, formatarMes } from '../servicos/i18n.js';
import { catalogo } from '../servicos/catalogo.js';
import { FONTE_DATAS } from '../dados/projetos.js';
import { historico } from '../servicos/historico.js';
import { cabecalhoTela, linkExterno, compartilhar, copiarLink, alternarFixado } from './componentes.js';
import { miniatura } from './galeria.js';
import { foco } from '../entrada/foco.js';

export function montar(raiz, rota, ctx) {
  const item = catalogo.obter('projeto:' + rota.params.id);
  const projeto = item.dados;
  const midias = projeto.midias.map((midia) => ({ midia, projeto }));

  const acoes = h('div', { class: 'acoes', 'data-regiao': 'ficha-acoes' });
  let primeiro = true;
  for (const link of projeto.links) {
    const privado = link.visibilidade === 'privado';
    const el = linkExterno({ url: link.url, rotulo: t('link.' + link.tipo), nomeIcone: privado ? 'cadeado' : 'externo', classe: 'botao' + (primeiro ? ' botao-principal' : '') });
    if (!el) continue;
    el.dataset.chave = 'ficha:link:' + link.id;
    if (primeiro) el.setAttribute('data-foco-inicial', '');
    primeiro = false;
    acoes.append(el);
  }
  const botaoFixar = h('button', { type: 'button', class: 'botao', 'data-chave': 'ficha:fixar', 'aria-pressed': String(historico.fixado(item.chave)) }, icone('fixar', 18), h('span', { text: t(historico.fixado(item.chave) ? 'menu.desafixar' : 'menu.fixar') }));
  botaoFixar.addEventListener('click', () => {
    alternarFixado(item);
    ctx.remontar();
    foco.focar(document.querySelector('[data-chave="ficha:fixar"]'), { rolar: false });
  });
  anexar(acoes, [
    botaoFixar,
    navigator.share ? h('button', { type: 'button', class: 'botao', 'data-chave': 'ficha:compartilhar', onClick: () => compartilhar(item.rota, item.titulo()) }, icone('compartilhar', 18), h('span', { text: t('menu.compartilhar') })) : null,
    h('button', { type: 'button', class: 'botao', 'data-chave': 'ficha:copiar', onClick: () => copiarLink(item.rota) }, icone('copiar', 18), h('span', { text: t('menu.copiarLink') })),
  ]);

  const temPrivado = projeto.links.some((link) => link.visibilidade === 'privado');
  const fatos = h(
    'dl',
    { class: 'fatos' },
    h('div', null, h('dt', { text: t('ficha.data') }), h('dd', null, h('time', { datetime: projeto.data, text: formatarMes(projeto.data) }), h('span', { class: 'fato-fonte', text: tx(FONTE_DATAS) }))),
    projeto.estado ? h('div', null, h('dt', { text: t('ficha.estado') }), h('dd', { text: tx(projeto.estado) })) : null,
    projeto.papel ? h('div', null, h('dt', { text: t('ficha.papel') }), h('dd', { text: tx(projeto.papel) })) : null,
  );

  raiz.append(
    cabecalhoTela({ titulo: projeto.titulo, subtitulo: t('tipo.projeto') + ' · ' + tx(projeto.estado), voltarPara: '/biblioteca' }),
    h(
      'div',
      { class: 'ficha' },
      h(
        'section',
        { class: 'ficha-principal', 'aria-label': t('ficha.sobre') },
        h('p', { class: 'ficha-descricao', text: tx(projeto.descricao) }),
        projeto.observacao ? h('p', { class: 'aviso-inline' }, icone('alerta', 16), h('span', { text: tx(projeto.observacao) })) : null,
        temPrivado ? h('p', { class: 'aviso-inline' }, icone('cadeado', 16), h('span', { text: t('ficha.privado') })) : null,
        acoes,
        fatos,
        h('h2', { class: 'ficha-subtitulo', text: t('ficha.tecnologias') }),
        h(
          'ul',
          { class: 'etiquetas', 'data-regiao': 'ficha-tecnologias' },
          projeto.tecnologias.map((tec) => h('li', null, h('a', { class: 'etiqueta etiqueta-link', href: '#/biblioteca?tec=' + encodeURIComponent(tec), 'data-chave': 'ficha:tec:' + tec, 'aria-label': t('home.filtrarPor', { nome: tec }), text: tec }))),
        ),
      ),
      h(
        'section',
        { class: 'ficha-midia', 'aria-label': t('ficha.midias') },
        h('h2', { class: 'ficha-subtitulo', text: t('ficha.midias') }),
        midias.length ? midias.map((entrada) => miniatura(entrada, midias)) : h('p', { class: 'vazio', text: t('ficha.semMidia') }),
      ),
    ),
    h('p', { class: 'ficha-rodape' }, h('a', { class: 'link', href: '#/contato', 'data-chave': 'ficha:contato', text: t('ficha.falar') })),
  );

  return { titulo: projeto.titulo, fundo: projeto.fundo, fixarFundo: true };
}
