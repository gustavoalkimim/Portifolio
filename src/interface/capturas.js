// Capturas: galeria com as imagens reais dos projetos. Não grava a tela nem
// pede permissão alguma; só exibe mídias autorizadas com origem e licença.

import { h } from './dom.js';
import { t } from '../servicos/i18n.js';
import { cabecalhoTela } from './componentes.js';
import { todasAsMidias, miniatura } from './galeria.js';

export function montar(raiz) {
  const lista = todasAsMidias();
  raiz.append(
    cabecalhoTela({ titulo: t('secao.capturas'), subtitulo: t('capturas.subtitulo') }),
    lista.length
      ? h('div', { class: 'capturas-grade', 'data-regiao': 'capturas' }, lista.map((entrada) => miniatura(entrada, lista)))
      : h('div', { class: 'vazio-bloco' }, h('p', { class: 'vazio-titulo', text: t('ficha.semMidia') }), h('a', { class: 'botao', href: '#/biblioteca', 'data-foco-inicial': true, text: t('nav.biblioteca') })),
  );
  const primeira = raiz.querySelector('.miniatura');
  if (primeira) primeira.setAttribute('data-foco-inicial', '');
  return { titulo: t('secao.capturas'), fundo: 'grade' };
}
