// Componentes reutilizados pelas telas: cartão, trilho, menu de opções do
// item, compartilhamento, cabeçalho de tela e opções segmentadas.

import { h, icone, urlSegura, copiarTexto, anunciar } from './dom.js';
import { t, tx } from '../servicos/i18n.js';
import { rotas } from '../servicos/rotas.js';
import { historico, LIMITE_FAVORITOS } from '../servicos/historico.js';
import { notificacoes } from '../servicos/notificacoes.js';
import { sobreposicoes } from './sobreposicoes.js';
import { prefs } from '../servicos/preferencias.js';

export function nomeDoTipo(tipo) {
  return t('tipo.' + tipo);
}

/** Imagem com fallback: se falhar, some e o cartão mostra a cor e o ícone. */
function capa(item) {
  const moldura = h('span', { class: 'cartao-capa', style: item.cor ? { backgroundColor: item.cor } : null });
  if (item.capa) {
    const imagem = h('img', { src: item.capa, alt: '', loading: 'lazy', decoding: 'async' });
    imagem.addEventListener(
      'error',
      () => {
        imagem.remove();
        moldura.classList.add('sem-imagem');
        moldura.append(icone(item.tipo === 'jogo' ? 'controle' : 'imagem', 30));
        notificacoes.registrar({ tipo: 'erro', chave: 'aviso.midiaFalhou', vars: { nome: item.titulo() }, unico: 'midia:' + item.capa });
      },
      { once: true },
    );
    moldura.append(imagem);
  } else {
    moldura.classList.add('sem-imagem');
    moldura.append(icone(item.icone || 'pasta', 30));
  }
  return moldura;
}

/**
 * Cartão navegável. O link é o alvo principal; "Mais opções" é um botão
 * irmão, sempre visível para toque e alcançável por Tab.
 * Variantes: 'quadrado' | 'poster' | 'panoramico' | 'atalho' | 'atalho-largo'.
 */
export function cartao(item, { variante = 'quadrado', selo = null, comMenu = true } = {}) {
  const titulo = item.titulo();
  const rotuloSelo = selo || item.selo();
  const link = h(
    'a',
    {
      class: 'cartao-link',
      href: '#' + item.rota,
      'data-chave': item.chave,
      'aria-label': titulo + ' — ' + nomeDoTipo(item.tipo) + (selo ? ' — ' + selo : ''),
    },
    capa(item),
    h('span', { class: 'cartao-texto' }, h('span', { class: 'cartao-tipo', text: rotuloSelo }), h('span', { class: 'cartao-titulo', text: titulo })),
  );
  link.fundo = item.fundo || null;
  link.item = item;
  const el = h('div', { class: 'cartao cartao-' + variante + ' cartao-de-' + item.tipo }, link);
  if (comMenu && item.tipo !== 'secao') {
    el.append(
      h(
        'button',
        {
          type: 'button',
          class: 'cartao-mais',
          'aria-label': t('menu.maisOpcoes', { nome: titulo }),
          'aria-haspopup': 'menu',
          'data-foco-pular': true,
          onClick: (evento) => abrirMenuDoItem(item, evento.currentTarget.previousElementSibling),
        },
        icone('mais', 18),
      ),
    );
    if (historico.fixado(item.chave)) el.append(h('span', { class: 'cartao-fixado', title: t('menu.fixado') }, icone('fixar', 14)));
  }
  return el;
}

/** Faixa horizontal com título, botões de rolagem e "Ver tudo" opcional. */
export function trilho({ id, titulo, cartoes, verTudo = null, vazio = null }) {
  const lista = h('div', { class: 'trilho-lista', 'data-regiao': id, 'data-eixo': 'x', role: 'list', 'aria-label': titulo }, cartoes.map((c) => h('div', { class: 'trilho-item', role: 'listitem' }, c)));
  const rolar = (sentido) => lista.scrollBy({ left: sentido * lista.clientWidth * 0.8, behavior: prefs.movimentoReduzido() ? 'auto' : 'smooth' });
  const anterior = h('button', { type: 'button', class: 'trilho-seta', 'aria-label': t('trilho.anterior', { nome: titulo }), 'data-foco-pular': true, onClick: () => rolar(-1) }, icone('esquerda', 18));
  const proximo = h('button', { type: 'button', class: 'trilho-seta', 'aria-label': t('trilho.proximo', { nome: titulo }), 'data-foco-pular': true, onClick: () => rolar(1) }, icone('direita', 18));
  const secao = h(
    'section',
    { class: 'trilho', 'aria-label': titulo },
    h(
      'div',
      { class: 'trilho-cabecalho' },
      h('h2', { class: 'trilho-titulo', text: titulo }),
      verTudo ? h('a', { class: 'trilho-ver-tudo', href: '#' + verTudo.rota, text: verTudo.rotulo || t('comum.verTudo'), 'aria-label': (verTudo.rotulo || t('comum.verTudo')) + ': ' + titulo }) : null,
      h('div', { class: 'trilho-setas' }, anterior, proximo),
    ),
    cartoes.length ? lista : h('p', { class: 'vazio', text: vazio || t('comum.semItens') }),
  );
  // As setas só aparecem quando há o que rolar.
  const conferir = () => {
    const rola = lista.scrollWidth > lista.clientWidth + 4;
    anterior.hidden = proximo.hidden = !rola;
  };
  requestAnimationFrame(conferir);
  secao.conferir = conferir;
  return secao;
}

/** Compartilha pela Web Share API; sem suporte ou com erro, copia o link. */
export async function compartilhar(caminho, titulo) {
  const url = rotas.urlDe(caminho);
  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, url });
      return; // o navegador mostra a própria confirmação; nada é afirmado aqui
    } catch (erro) {
      if (erro && erro.name === 'AbortError') return;
    }
  }
  await copiarLink(caminho);
}

/** Copia o link; se não puder, mostra o endereço selecionável. */
export async function copiarLink(caminho) {
  const url = rotas.urlDe(caminho);
  if (await copiarTexto(url)) {
    anunciar(t('aviso.linkCopiado'));
    notificacoes.registrar({ tipo: 'sucesso', chave: 'aviso.linkCopiado' });
    return;
  }
  sobreposicoes.abrir({
    tipo: 'dialogo',
    rotulo: t('aviso.copieManual'),
    montar(painel, fechar) {
      const campo = h('input', { class: 'campo', type: 'text', readonly: true, value: url, 'aria-label': t('aviso.copieManual'), 'data-foco-inicial': true });
      campo.addEventListener('focus', () => campo.select());
      painel.append(h('h2', { class: 'dialogo-titulo', text: t('aviso.copieManual') }), campo, h('div', { class: 'dialogo-acoes' }, h('button', { type: 'button', class: 'botao', text: t('comum.fechar'), onClick: () => fechar() })));
    },
  });
}

export function alternarFixado(item) {
  const resultado = historico.alternarFixado(item.chave);
  if (resultado.limite) {
    notificacoes.registrar({ tipo: 'info', chave: 'aviso.limiteFixados', vars: { n: LIMITE_FAVORITOS } });
  } else {
    anunciar(t(resultado.fixado ? 'aviso.fixado' : 'aviso.desafixado', { nome: item.titulo() }));
  }
  return resultado;
}

/** Menu contextual do item: só ações que existem de verdade. */
export function abrirMenuDoItem(item, gatilho) {
  const itens = [{ rotulo: t(item.tipo === 'jogo' ? 'menu.verJogo' : 'menu.verProjeto'), icone: 'direita', acao: () => rotas.navegar(item.rota) }];
  if (item.tipo === 'jogo') {
    itens.push({ rotulo: t('jogo.jogar'), icone: 'jogar', acao: () => {
        rotas.intencao = { jogar: item.id };
        rotas.navegar(item.rota);
      },
    });
  }
  if (item.tipo === 'projeto') {
    for (const link of item.dados.links) {
      const url = urlSegura(link.url);
      if (!url) continue;
      const privado = link.visibilidade === 'privado';
      itens.push({ rotulo: t('link.' + link.tipo) + (privado ? ' — ' + t('link.privadoCurto') : '') + ' (' + t('comum.novaAba') + ')', icone: privado ? 'cadeado' : 'externo', url });
    }
  }
  itens.push({
    rotulo: t(historico.fixado(item.chave) ? 'menu.desafixar' : 'menu.fixar'),
    icone: 'fixar',
    marcado: historico.fixado(item.chave),
    acao: () => alternarFixado(item),
  });
  if (historico.recentes().some((entrada) => entrada.chave === item.chave)) {
    itens.push({
      rotulo: t('menu.ocultarRecentes'),
      icone: 'fechar',
      acao: async () => {
        const ok = await sobreposicoes.confirmar({
          titulo: t('menu.ocultarRecentes'),
          texto: t('menu.ocultarRecentes.texto', { nome: item.titulo() }),
          acoes: [
            { rotulo: t('comum.cancelar'), valor: false },
            { rotulo: t('menu.ocultar'), valor: true, principal: true },
          ],
        });
        if (ok) historico.remover(item.chave);
      },
    });
  }
  itens.push({ rotulo: t('menu.copiarLink'), icone: 'copiar', acao: () => copiarLink(item.rota) });
  if (navigator.share) itens.push({ rotulo: t('menu.compartilhar'), icone: 'compartilhar', acao: () => compartilhar(item.rota, item.titulo()) });
  sobreposicoes.menu(item.titulo(), itens, gatilho);
}

/** Cabeçalho padrão de tela: voltar + título + subtítulo. */
export function cabecalhoTela({ titulo, subtitulo = null, voltarPara = '/inicio', acoes: extras = null }) {
  return h(
    'header',
    { class: 'tela-cabecalho' },
    h(
      'button',
      { type: 'button', class: 'botao botao-voltar', 'aria-label': t('comum.voltar'), onClick: () => rotas.voltar(voltarPara) },
      icone('voltar', 18),
      h('span', { text: t('comum.voltar') }),
    ),
    h('div', { class: 'tela-titulos' }, h('h1', { class: 'tela-titulo', id: 'titulo-da-tela', tabindex: '-1', text: titulo }), subtitulo ? h('p', { class: 'tela-subtitulo', text: subtitulo }) : null),
    extras ? h('div', { class: 'tela-acoes' }, extras) : null,
  );
}

/**
 * Opções segmentadas (substituem <select> para funcionar com controle).
 * `opcoes`: [{ valor, rotulo }]. Chama `aoEscolher(valor)`.
 */
export function segmentos({ rotulo, opcoes, valor, aoEscolher, id }) {
  const grupo = h('div', { class: 'segmentos', role: 'group', 'aria-label': rotulo, 'data-regiao': id || null });
  const pintar = (atual) => {
    grupo.replaceChildren(
      ...opcoes.map((opcao) =>
        h('button', {
          type: 'button',
          class: 'segmento' + (opcao.valor === atual ? ' ativo' : ''),
          'aria-pressed': String(opcao.valor === atual),
          'data-chave': (id || rotulo) + ':' + opcao.valor,
          text: opcao.rotulo,
          onClick: (evento) => {
            if (opcao.valor === atual) return;
            const chave = evento.currentTarget.dataset.chave;
            pintar(opcao.valor);
            const novo = grupo.querySelector('[data-chave="' + CSS.escape(chave) + '"]');
            if (novo) novo.focus({ preventScroll: true });
            aoEscolher(opcao.valor);
          },
        }),
      ),
    );
  };
  pintar(valor);
  return grupo;
}

/** Link externo com indicação de nova aba no nome acessível. */
export function linkExterno({ url, rotulo, nomeIcone = 'externo', classe = 'botao', novaAba = true }) {
  const segura = urlSegura(url);
  if (!segura) return null; // destino ausente ou inválido não vira botão
  return h(
    'a',
    {
      class: classe,
      href: segura,
      target: novaAba ? '_blank' : null,
      rel: novaAba ? 'noopener noreferrer' : null,
      'aria-label': novaAba ? rotulo + ' (' + t('comum.novaAba') + ')' : rotulo,
    },
    icone(nomeIcone, 18),
    h('span', { text: rotulo }),
  );
}

/** Lista de canais de contato reais. */
export function listaDeContatos(contatos) {
  return h(
    'ul',
    { class: 'contatos', 'data-regiao': 'contatos' },
    contatos.map((contato) => {
      const url = urlSegura(contato.url);
      if (!url) return null;
      return h(
        'li',
        null,
        h(
          'a',
          {
            class: 'contato',
            href: url,
            target: contato.novaAba ? '_blank' : null,
            rel: contato.novaAba ? 'noopener noreferrer' : null,
            'data-chave': 'contato:' + contato.id,
            'aria-label': tx(contato.rotulo) + ': ' + contato.valor + (contato.novaAba ? ' (' + t('comum.novaAba') + ')' : ''),
          },
          h('span', { class: 'contato-icone' }, icone(contato.icone, 20)),
          h('span', { class: 'contato-texto' }, h('span', { class: 'contato-rotulo', text: tx(contato.rotulo) }), h('span', { class: 'contato-valor', text: contato.valor })),
          contato.novaAba ? icone('externo', 14) : null,
        ),
      );
    }),
  );
}
