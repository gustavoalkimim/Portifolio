// Perfil: foto, apresentação, formação, interesses, objetivos e contatos
// reais. Tudo vem de src/dados/perfil.js.

import { h, icone } from './dom.js';
import { t, tx } from '../servicos/i18n.js';
import { perfil } from '../dados/perfil.js';
import { cabecalhoTela, listaDeContatos } from './componentes.js';

export function blocosDeInformacao() {
  const blocos = [
    { icone: 'trilha', rotulo: t('perfil.formacao'), texto: tx(perfil.formacao.texto) },
    { icone: 'github', rotulo: t('perfil.interesses'), texto: tx(perfil.interesses) },
    { icone: 'jogar', rotulo: t('perfil.objetivos'), texto: tx(perfil.objetivos) },
  ].filter((bloco) => bloco.texto);
  return h('div', { class: 'blocos' }, blocos.map((bloco) => h('article', { class: 'bloco' }, h('h2', { class: 'bloco-titulo' }, icone(bloco.icone, 18), h('span', { text: bloco.rotulo })), h('p', { text: bloco.texto }))));
}

export function montar(raiz) {
  const foto = h('img', { class: 'perfil-foto', src: perfil.foto, alt: tx(perfil.fotoAlt), width: 220, height: 220, style: { objectPosition: perfil.fotoFoco } });
  foto.addEventListener('error', () => foto.remove(), { once: true });
  raiz.append(
    cabecalhoTela({ titulo: t('secao.perfil'), subtitulo: null }),
    h(
      'section',
      { class: 'perfil-apresentacao', 'aria-label': t('secao.perfil') },
      foto,
      h(
        'div',
        { class: 'perfil-texto' },
        h('h2', { class: 'perfil-nome', text: perfil.nome }),
        h('p', { class: 'perfil-subtitulo', text: tx(perfil.subtitulo) }),
        h('p', { class: 'ficha-descricao', text: tx(perfil.apresentacao) }),
        h(
          'div',
          { class: 'acoes', 'data-regiao': 'perfil-acoes' },
          h('a', { class: 'botao botao-principal', href: '#/experiencias', 'data-chave': 'perfil:jornada', 'data-foco-inicial': true }, icone('trilha', 18), h('span', { text: t('nav.jornada') })),
          h('a', { class: 'botao', href: '#/biblioteca?tipo=projeto', 'data-chave': 'perfil:projetos' }, icone('pasta', 18), h('span', { text: t('secao.projetos') })),
          h('a', { class: 'botao', href: '#/contato', 'data-chave': 'perfil:contato' }, icone('mensagem', 18), h('span', { text: t('secao.contato') })),
        ),
      ),
    ),
    blocosDeInformacao(),
    h('section', { class: 'secao', 'aria-label': t('secao.contato') }, h('h2', { class: 'ficha-subtitulo', text: t('secao.contato') }), listaDeContatos(perfil.contatos)),
  );
  return { titulo: t('secao.perfil'), fundo: 'ondas' };
}
