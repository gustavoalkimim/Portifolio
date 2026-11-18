// Modo simples (F26): navegação convencional em uma única página com perfil,
// projetos, experiências e contato. Usa os mesmos dados, links, formulário e
// idioma do modo console; não depende de trilhos, fundos nem jogos.

import { h, icone } from './dom.js';
import { t, tx, formatarMes } from '../servicos/i18n.js';
import { perfil } from '../dados/perfil.js';
import { projetos } from '../dados/projetos.js';
import { experiencias } from '../dados/experiencias.js';
import { jogos } from '../dados/jogos.js';
import { prefs } from '../servicos/preferencias.js';
import { linkExterno, listaDeContatos } from './componentes.js';
import { blocosDeInformacao } from './perfil.js';
import { cartaoDeExperiencia } from './experiencias.js';
import { formulario, podeSairDoFormulario } from './contato.js';

function ancoraDa(rota) {
  if (rota.nome === 'projeto') return 'simples-projeto-' + rota.params.id;
  return { inicio: 'simples-perfil', perfil: 'simples-perfil', biblioteca: 'simples-projetos', vitrine: 'simples-projetos', experiencias: 'simples-experiencias', contato: 'simples-contato' }[rota.nome] || 'simples-perfil';
}

function irPara(rota, focar) {
  const alvo = document.getElementById(ancoraDa(rota));
  if (!alvo) return;
  alvo.scrollIntoView({ block: 'start', behavior: prefs.movimentoReduzido() ? 'auto' : 'smooth' });
  if (focar) alvo.focus({ preventScroll: true });
}

function cartaoDeProjeto(projeto) {
  const midia = projeto.midias[0];
  const imagem = midia ? h('img', { src: midia.caminho, alt: tx(midia.alt), loading: 'lazy', width: midia.largura, height: midia.altura }) : null;
  if (imagem) imagem.addEventListener('error', () => imagem.replaceWith(h('p', { class: 'aviso-inline', text: t('galeria.falhou') })), { once: true });
  return h(
    'article',
    { class: 'simples-projeto', id: 'simples-projeto-' + projeto.id, tabindex: '-1' },
    imagem ? h('figure', { class: 'figura' }, imagem, h('figcaption', { text: tx(midia.descricao) })) : null,
    h('div', null,
      h('p', { class: 'destaque-tipo' }, h('time', { datetime: projeto.data, text: formatarMes(projeto.data) }), ' · ' + tx(projeto.estado)),
      h('h3', { class: 'experiencia-titulo', text: projeto.titulo }),
      h('p', { text: tx(projeto.descricao) }),
      h('ul', { class: 'etiquetas' }, projeto.tecnologias.map((tec) => h('li', { class: 'etiqueta', text: tec }))),
      projeto.links.some((l) => l.visibilidade === 'privado') ? h('p', { class: 'aviso-inline' }, icone('cadeado', 16), h('span', { text: t('ficha.privado') })) : null,
      h('div', { class: 'acoes' }, projeto.links.map((link) => linkExterno({ url: link.url, rotulo: t('link.' + link.tipo) + ': ' + projeto.titulo, nomeIcone: link.visibilidade === 'privado' ? 'cadeado' : 'externo' }))),
    ),
  );
}

export function montar(raiz, rota) {
  const ordenados = [...projetos].sort((a, b) => a.data.localeCompare(b.data));
  const foto = h('img', { class: 'perfil-foto', src: perfil.foto, alt: tx(perfil.fotoAlt), width: 180, height: 180, style: { objectPosition: perfil.fotoFoco } });
  foto.addEventListener('error', () => foto.remove(), { once: true });
  raiz.append(
    h('p', { class: 'nota simples-aviso', text: t('simples.aviso') }),
    h(
      'section',
      { class: 'secao', id: 'simples-perfil', tabindex: '-1', 'aria-labelledby': 'titulo-da-tela' },
      h('div', { class: 'perfil-apresentacao' }, foto, h('div', { class: 'perfil-texto' }, h('h1', { class: 'perfil-nome', id: 'titulo-da-tela', tabindex: '-1', text: perfil.nome }), h('p', { class: 'perfil-subtitulo', text: tx(perfil.subtitulo) }), h('p', { class: 'ficha-descricao', text: tx(perfil.apresentacao) }))),
      blocosDeInformacao(),
    ),
    h('section', { class: 'secao', id: 'simples-projetos', tabindex: '-1', 'aria-label': t('secao.projetos') }, h('h2', { class: 'tela-titulo', text: t('secao.projetos') }), ordenados.map(cartaoDeProjeto)),
    h('section', { class: 'secao', id: 'simples-experiencias', tabindex: '-1', 'aria-label': t('secao.experiencias') }, h('h2', { class: 'tela-titulo', text: t('secao.experiencias') }), experiencias.map(cartaoDeExperiencia)),
    h(
      'section',
      { class: 'secao', id: 'simples-contato', tabindex: '-1', 'aria-label': t('secao.contato') },
      h('h2', { class: 'tela-titulo', text: t('secao.contato') }),
      h('div', { class: 'contato-layout' }, listaDeContatos(perfil.contatos), formulario()),
    ),
    h(
      'section',
      { class: 'secao', 'aria-label': t('secao.jogos') },
      h('h2', { class: 'tela-titulo', text: t('secao.jogos') }),
      h('p', { class: 'nota', text: t('simples.jogos') }),
      h('ul', { class: 'indice' }, jogos.map((jogo) => h('li', null, h('a', { class: 'link', href: '#/jogos/' + jogo.id, text: tx(jogo.nome) })))),
    ),
  );
  // A seção pedida pela rota só existe depois de anexada ao documento.
  window.requestAnimationFrame(() => irPara(rota, false));
  return {
    titulo: t('simples.titulo'),
    fundo: 'neutro',
    atualizar(nova) {
      irPara(nova, true);
    },
    podeSair: podeSairDoFormulario,
  };
}
