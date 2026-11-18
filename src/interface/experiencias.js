// Jornada: experiências confirmadas e linha do tempo (antiga → recente).
// Formação e experiência só têm o ano na fonte, então ficam em uma trilha
// própria; os projetos, que têm mês, ficam em outra. Nada é ordenado por
// inferência e não há vínculo experiência ↔ projeto sem fonte.

import { h, icone } from './dom.js';
import { t, tx, formatarMes } from '../servicos/i18n.js';
import { perfil, FONTE_PERFIL } from '../dados/perfil.js';
import { experiencias } from '../dados/experiencias.js';
import { projetos, FONTE_DATAS } from '../dados/projetos.js';
import { cabecalhoTela } from './componentes.js';

export function periodoDe(experiencia) {
  return experiencia.inicio + ' — ' + (experiencia.fim || t('jornada.atual'));
}

export function cartaoDeExperiencia(experiencia) {
  const relacionados = experiencia.projetos.map((id) => projetos.find((p) => p.id === id)).filter(Boolean);
  return h(
    'article',
    { class: 'experiencia' },
    h('div', { class: 'experiencia-topo' }, h('div', null, h('h3', { class: 'experiencia-titulo', text: tx(experiencia.atividade) }), h('p', { class: 'experiencia-instituicao', text: tx(experiencia.instituicao) })), h('p', { class: 'etiqueta', text: periodoDe(experiencia) })),
    h('p', { text: tx(experiencia.descricao) }),
    relacionados.length ? h('p', null, t('jornada.relacionados') + ': ', relacionados.map((p) => h('a', { class: 'link', href: '#/projetos/' + p.id, text: p.titulo }))) : null,
    h('p', { class: 'fato-fonte', text: t('comum.fonte') + ': ' + tx(experiencia.fonte) }),
  );
}

function marco({ quando, datetime, titulo, texto, rota, chave, fonte }) {
  const cabecalho = rota ? h('a', { class: 'link marco-titulo', href: '#' + rota, 'data-chave': chave, text: titulo }) : h('span', { class: 'marco-titulo', text: titulo });
  return h('li', { class: 'marco' }, h('time', { class: 'marco-data', datetime, text: quando }), h('div', { class: 'marco-corpo' }, cabecalho, texto ? h('p', { text: texto }) : null, h('p', { class: 'fato-fonte', text: t('comum.fonte') + ': ' + fonte })));
}

export function montar(raiz) {
  const ordenados = [...projetos].sort((a, b) => a.data.localeCompare(b.data));
  raiz.append(
    cabecalhoTela({ titulo: t('nav.jornada'), subtitulo: t('jornada.subtitulo') }),
    h(
      'section',
      { class: 'secao', 'aria-label': t('secao.experiencias') },
      h('h2', { class: 'ficha-subtitulo', text: t('secao.experiencias') }),
      experiencias.length ? experiencias.map(cartaoDeExperiencia) : h('p', { class: 'vazio', text: t('comum.semItens') }),
    ),
    h(
      'section',
      { class: 'secao', 'aria-label': t('jornada.formacao') },
      h('h2', { class: 'ficha-subtitulo' }, icone('trilha', 18), h('span', { text: t('jornada.formacao') })),
      h('p', { class: 'nota', text: t('jornada.notaAno') }),
      h(
        'ol',
        { class: 'linha-tempo', 'data-regiao': 'jornada-formacao' },
        marco({ quando: perfil.formacao.inicio + ' — ' + t('jornada.atual'), datetime: perfil.formacao.inicio, titulo: tx(perfil.formacao.curso) + ' — ' + perfil.formacao.instituicao, texto: null, rota: '/perfil', chave: 'marco:formacao', fonte: tx(FONTE_PERFIL) }),
        experiencias.map((experiencia) => marco({ quando: periodoDe(experiencia), datetime: experiencia.inicio, titulo: tx(experiencia.atividade), texto: tx(experiencia.instituicao), rota: null, fonte: tx(experiencia.fonte) })),
      ),
    ),
    h(
      'section',
      { class: 'secao', 'aria-label': t('jornada.projetos') },
      h('h2', { class: 'ficha-subtitulo' }, icone('pasta', 18), h('span', { text: t('jornada.projetos') })),
      h(
        'ol',
        { class: 'linha-tempo', 'data-regiao': 'jornada-projetos' },
        ordenados.map((projeto, indice) => {
          const el = marco({ quando: formatarMes(projeto.data), datetime: projeto.data, titulo: projeto.titulo, texto: tx(projeto.descricao), rota: '/projetos/' + projeto.id, chave: 'marco:' + projeto.id, fonte: tx(FONTE_DATAS) });
          if (indice === 0) el.querySelector('a').setAttribute('data-foco-inicial', '');
          return el;
        }),
      ),
    ),
  );
  return { titulo: t('nav.jornada'), fundo: 'ondas' };
}
