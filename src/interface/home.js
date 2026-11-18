// Início: área de destaque, trilho de fixados/recentes, trilho de atalhos
// permanentes e grupos por tema. Sem histórico, mostra destaques reais.

import { h, icone } from './dom.js';
import { t, tx } from '../servicos/i18n.js';
import { catalogo } from '../servicos/catalogo.js';
import { historico } from '../servicos/historico.js';
import { perfil } from '../dados/perfil.js';
import { atalhosHome } from '../dados/paineis.js';
import { cartao, trilho, nomeDoTipo, listaDeContatos } from './componentes.js';

function itensDoPrimeiroTrilho() {
  const vistos = new Set();
  const saida = [];
  const incluir = (chave, selo) => {
    const item = catalogo.obter(chave);
    if (!item || vistos.has(chave)) return;
    vistos.add(chave);
    saida.push({ item, selo });
  };
  historico.favoritos().forEach((chave) => incluir(chave, t('home.selo.fixado')));
  historico.recentes().forEach((entrada) => incluir(entrada.chave, t('home.selo.recente')));
  // Destaques fixos verdadeiros completam a faixa (e a preenchem sem histórico).
  catalogo.listar().forEach((item) => incluir(item.chave, null));
  return saida.slice(0, 10);
}

export function montar(raiz, rota, ctx) {
  const tipo = h('p', { class: 'destaque-tipo' });
  const titulo = h('p', { class: 'destaque-titulo' });
  const resumo = h('p', { class: 'destaque-resumo' });
  const destaque = h('section', { class: 'home-destaque', 'aria-label': t('home.destaque') }, h('h1', { class: 'so-leitor', id: 'titulo-da-tela', tabindex: '-1', text: t('nav.inicio') }), tipo, titulo, resumo);

  const mostrar = (item) => {
    if (item) {
      tipo.textContent = nomeDoTipo(item.tipo) + (item.tipo !== 'secao' ? ' · ' + item.selo() : '');
      titulo.textContent = item.titulo();
      resumo.textContent = item.resumo();
    } else {
      tipo.textContent = t('home.portfolio');
      titulo.textContent = perfil.nome;
      resumo.textContent = tx(perfil.subtitulo);
    }
  };
  mostrar(null);

  const primeiros = itensDoPrimeiroTrilho();
  const temHistorico = historico.recentes().length > 0 || historico.favoritos().length > 0;
  const trilhoRecentes = trilho({
    id: 'recentes',
    titulo: t(temHistorico ? 'home.recentes' : 'home.destaques'),
    cartoes: primeiros.map(({ item, selo }, indice) => {
      const el = cartao(item, { variante: item.tipo === 'secao' ? 'atalho' : 'quadrado', selo });
      if (indice === 0) el.querySelector('.cartao-link').setAttribute('data-foco-inicial', '');
      return el;
    }),
    verTudo: { rota: '/biblioteca' },
  });

  const trilhoAtalhos = trilho({
    id: 'atalhos',
    titulo: t('home.atalhos'),
    cartoes: atalhosHome.map((id) => cartao(catalogo.obter('secao:' + id), { variante: 'atalho-largo', comMenu: false })),
  });

  const grupos = [
    trilho({
      id: 'grupo-projetos',
      titulo: t('home.grupo.projetos'),
      cartoes: catalogo.projetos().map((item) => cartao(item, { variante: 'panoramico' })),
      verTudo: { rota: '/biblioteca?tipo=projeto' },
    }),
    trilho({
      id: 'grupo-jogos',
      titulo: t('home.grupo.jogos'),
      cartoes: catalogo.jogos().map((item) => cartao(item, { variante: 'poster' })),
      verTudo: { rota: '/biblioteca?tipo=jogo' },
    }),
  ];

  const tecnologias = catalogo.tecnologias();
  const grupoTecnologias = tecnologias.length
    ? h(
        'section',
        { class: 'trilho', 'aria-label': t('home.grupo.tecnologias') },
        h('div', { class: 'trilho-cabecalho' }, h('h2', { class: 'trilho-titulo', text: t('home.grupo.tecnologias') })),
        h('p', { class: 'nota', text: t('home.grupo.tecnologias.nota') }),
        h(
          'div',
          { class: 'etiquetas', 'data-regiao': 'tecnologias' },
          tecnologias.map((tec) => h('a', { class: 'etiqueta etiqueta-link', href: '#/biblioteca?tec=' + encodeURIComponent(tec), 'data-chave': 'tec:' + tec, 'aria-label': t('home.filtrarPor', { nome: tec }), text: tec })),
        ),
      )
    : null;

  const grupoContato = h(
    'section',
    { class: 'trilho', 'aria-label': t('secao.contato') },
    h('div', { class: 'trilho-cabecalho' }, h('h2', { class: 'trilho-titulo', text: t('secao.contato') }), h('a', { class: 'trilho-ver-tudo', href: '#/contato' }, icone('mensagem', 16), t('home.enviarMensagem'))),
    listaDeContatos(perfil.contatos),
  );

  raiz.append(destaque, h('div', { class: 'home-trilhos' }, trilhoRecentes, trilhoAtalhos, ...grupos, grupoTecnologias, grupoContato));

  const aoFocar = (evento) => mostrar(evento.target.item || null);
  const aoPassar = (evento) => {
    if (evento.pointerType !== 'mouse') return;
    const link = evento.target.closest ? evento.target.closest('.cartao-link') : null;
    if (link) mostrar(link.item);
  };
  raiz.addEventListener('focusin', aoFocar);
  raiz.addEventListener('pointerover', aoPassar);

  // Fixar, desafixar ou ocultar um item redesenha a faixa mantendo o foco.
  const parar = historico.aoMudar(() => ctx.remontar());

  return {
    titulo: t('nav.inicio'),
    fundo: 'padrao',
    destruir() {
      parar();
      raiz.removeEventListener('focusin', aoFocar);
      raiz.removeEventListener('pointerover', aoPassar);
    },
  };
}
