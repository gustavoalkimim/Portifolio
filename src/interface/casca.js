// Casca do console: cabeçalho, relógio, rodapé de dicas e montagem das telas
// conforme a rota. Cada tela exporta montar(raiz, rota, ctx) e devolve
// { titulo, fundo, fixarFundo?, destruir?, atualizar?, podeSair? }.

import { h, icone, limpar, anunciar } from './dom.js';
import { t, formatarHora } from '../servicos/i18n.js';
import { rotas } from '../servicos/rotas.js';
import { prefs } from '../servicos/preferencias.js';
import { fundo } from '../servicos/fundo.js';
import { fundoDaTela } from '../dados/paineis.js';
import { perfil } from '../dados/perfil.js';
import { historico } from '../servicos/historico.js';
import { notificacoes } from '../servicos/notificacoes.js';
import { catalogo } from '../servicos/catalogo.js';
import { sobreposicoes } from './sobreposicoes.js';
import { foco } from '../entrada/foco.js';
import { acoes } from '../entrada/acoes.js';
import { controle } from '../entrada/controle.js';
import { abrirGuia } from './guia.js';
import { abrirBusca } from './busca.js';

import * as home from './home.js';
import * as biblioteca from './biblioteca.js';
import * as vitrine from './vitrine.js';
import * as detalhe from './detalhe.js';
import * as jogo from './jogo.js';
import * as telaPerfil from './perfil.js';
import * as experiencias from './experiencias.js';
import * as conquistas from './conquistas.js';
import * as capturas from './capturas.js';
import * as contato from './contato.js';
import * as ajuda from './ajuda.js';
import * as configuracoes from './configuracoes.js';
import * as recuperacao from './recuperacao.js';
import * as simples from './simples.js';

const TELAS = { inicio: home, biblioteca, vitrine, projeto: detalhe, jogo, perfil: telaPerfil, experiencias, conquistas, capturas, contato, ajuda, configuracoes, recuperacao };
const NO_MODO_SIMPLES = ['inicio', 'biblioteca', 'vitrine', 'perfil', 'experiencias', 'contato', 'projeto'];
const SECAO_DO_HISTORICO = { perfil: 'secao:perfil', experiencias: 'secao:experiencias', contato: 'secao:contato', vitrine: 'secao:vitrine', conquistas: 'secao:conquistas', capturas: 'secao:capturas' };

let topo;
let tela;
let dicas;
let relogio;
let visao = null; // { modulo, instancia, rota }
const memoriaDeRotas = new Map(); // hash → { rolagem, chave }
let pronto = false;

function moduloPara(rota) {
  if (prefs.obter().modo === 'simples' && NO_MODO_SIMPLES.includes(rota.nome)) return simples;
  return TELAS[rota.nome] || recuperacao;
}

function chaveDoFoco() {
  const ativo = document.activeElement;
  if (!ativo || !tela.contains(ativo)) return null;
  return ativo.dataset.chave || ativo.id || null;
}

function acharPorChave(chave) {
  if (!chave) return null;
  return tela.querySelector('[data-chave="' + CSS.escape(chave) + '"]') || document.getElementById(chave);
}

// ---- Cabeçalho ----------------------------------------------------------

function botaoTopo({ nomeIcone, rotulo, rota, aoClicar, chave, extra }) {
  const atual = rota && rotas.atual() && rotas.atual().caminho === rota.split('?')[0];
  const conteudo = [icone(nomeIcone, 20), h('span', { class: 'topo-rotulo', text: rotulo }), extra || null];
  if (rota) return h('a', { class: 'topo-botao', href: '#' + rota, 'aria-current': atual ? 'page' : null, 'data-chave': chave, title: rotulo, 'aria-label': rotulo }, conteudo);
  return h('button', { type: 'button', class: 'topo-botao', 'data-chave': chave, title: rotulo, 'aria-label': rotulo, onClick: aoClicar }, conteudo);
}

function desenharTopo() {
  const ativo = document.activeElement;
  const chave = ativo && topo.contains(ativo) ? ativo.dataset.chave || ativo.id : null;
  construirTopo();
  if (!chave) return;
  const alvo = topo.querySelector('[data-chave="' + CSS.escape(chave) + '"]') || document.getElementById(chave);
  if (alvo) alvo.focus({ preventScroll: true });
}

function construirTopo() {
  const p = prefs.obter();
  const naoLidas = notificacoes.naoLidas();
  const botaoIdioma = h(
    'button',
    {
      type: 'button',
      class: 'topo-botao topo-idioma',
      'data-chave': 'topo:idioma',
      'aria-label': p.idioma === 'pt' ? 'Switch to English' : 'Mudar para português',
      title: p.idioma === 'pt' ? 'Switch to English' : 'Mudar para português',
      onClick: () => prefs.definir({ idioma: prefs.obter().idioma === 'pt' ? 'en' : 'pt' }),
    },
    h('span', { class: p.idioma === 'pt' ? 'ativo' : null, lang: 'pt-BR', text: 'PT' }),
    h('span', { 'aria-hidden': 'true', text: '/' }),
    h('span', { class: p.idioma === 'en' ? 'ativo' : null, lang: 'en', text: 'EN' }),
  );
  relogio = h('time', { class: 'topo-relogio', 'aria-label': t('topo.horaLocal') });
  const desconectado = navigator.onLine === false ? h('span', { class: 'topo-rede', title: t('topo.semRedeDica') }, icone('alerta', 14), h('span', { text: t('topo.semRede') })) : null;
  const identidade = h(
    'a',
    { class: 'topo-perfil', href: '#/perfil', 'data-chave': 'topo:perfil', 'aria-label': t('topo.abrirPerfil', { nome: perfil.nomeCurto }) },
    h('img', { class: 'avatar', src: perfil.foto, alt: '', width: 40, height: 40, style: { objectPosition: perfil.fotoFoco } }),
    h('span', { class: 'topo-nome', text: perfil.nomeCurto }),
  );

  if (p.modo === 'simples') {
    limpar(topo).append(
      identidade,
      h(
        'nav',
        { class: 'topo-nav topo-nav-simples', 'aria-label': t('topo.navegacao'), 'data-regiao': 'topo', 'data-eixo': 'x' },
        h('a', { href: '#/perfil', text: t('secao.perfil') }),
        h('a', { href: '#/biblioteca', text: t('secao.projetos') }),
        h('a', { href: '#/experiencias', text: t('secao.experiencias') }),
        h('a', { href: '#/contato', text: t('secao.contato') }),
        h('a', { href: '#/ajuda', text: t('secao.ajuda') }),
      ),
      h(
        'div',
        { class: 'topo-direita', 'data-regiao': 'topo-direita', 'data-eixo': 'x' },
        botaoIdioma,
        h('button', { type: 'button', class: 'botao', 'data-chave': 'topo:modo', text: t('simples.voltarConsole'), onClick: () => prefs.definir({ modo: 'console' }) }),
      ),
    );
    return;
  }

  limpar(topo).append(
    h(
      'div',
      { class: 'topo-esquerda', 'data-regiao': 'topo-esquerda', 'data-eixo': 'x' },
      h('button', { type: 'button', class: 'topo-botao topo-guia', id: 'botao-guia', 'aria-label': t('guia.abrir'), title: t('guia.abrir'), 'aria-haspopup': 'dialog', onClick: (e) => abrirGuia('inicio', e.currentTarget) }, icone('guia', 22)),
      identidade,
    ),
    h(
      'nav',
      { class: 'topo-nav', 'aria-label': t('topo.navegacao'), 'data-regiao': 'topo', 'data-eixo': 'x' },
      botaoTopo({ nomeIcone: 'inicio', rotulo: t('nav.inicio'), rota: '/inicio', chave: 'topo:inicio' }),
      botaoTopo({ nomeIcone: 'biblioteca', rotulo: t('nav.biblioteca'), rota: '/biblioteca', chave: 'topo:biblioteca' }),
      botaoTopo({ nomeIcone: 'vitrine', rotulo: t('nav.vitrine'), rota: '/vitrine', chave: 'topo:vitrine' }),
      botaoTopo({ nomeIcone: 'trilha', rotulo: t('nav.jornada'), rota: '/experiencias', chave: 'topo:jornada' }),
      botaoTopo({ nomeIcone: 'busca', rotulo: t('nav.busca'), aoClicar: (e) => abrirBusca(e.currentTarget), chave: 'topo:busca' }),
      botaoTopo({ nomeIcone: 'engrenagem', rotulo: t('nav.configuracoes'), rota: '/configuracoes', chave: 'topo:config' }),
    ),
    h(
      'div',
      { class: 'topo-direita', 'data-regiao': 'topo-direita', 'data-eixo': 'x' },
      desconectado,
      h(
        'button',
        {
          type: 'button',
          class: 'topo-botao topo-sino',
          id: 'botao-notificacoes',
          'aria-label': naoLidas ? t('notif.abrirCom', { n: naoLidas }) : t('notif.abrir'),
          title: t('notif.abrir'),
          'aria-haspopup': 'dialog',
          onClick: (e) => abrirGuia('notificacoes', e.currentTarget),
        },
        icone('sino', 20),
        naoLidas ? h('span', { class: 'topo-contagem', 'aria-hidden': 'true', text: String(naoLidas) }) : null,
      ),
      botaoIdioma,
      relogio,
    ),
  );
  atualizarRelogio();
}

function atualizarRelogio() {
  if (!relogio || !relogio.isConnected) return;
  const agora = new Date();
  const texto = formatarHora(agora);
  if (relogio.textContent !== texto) {
    relogio.textContent = texto;
    relogio.dateTime = agora.toISOString();
  }
}

// ---- Rodapé de dicas ----------------------------------------------------

function tecla(texto) {
  return h('kbd', { text: texto });
}

function desenharDicas() {
  if (!dicas) return;
  const metodo = acoes.metodo();
  const ativo = document.activeElement;
  const temMenu = Boolean(ativo && ativo.classList && ativo.classList.contains('cartao-link') && ativo.parentElement.querySelector('.cartao-mais'));
  const itens = [];
  if (metodo === 'controle' && controle.conectado()) {
    itens.push([tecla('A'), t('dica.abrir')], [tecla('B'), t('dica.voltar')]);
    if (temMenu) itens.push([tecla('X'), t('dica.opcoes')]);
    itens.push([tecla('Y'), t('dica.buscar')], [tecla('Menu'), t('dica.guia')]);
  } else if (metodo === 'toque') {
    itens.push([icone('guia', 14), t('dica.toqueGuia')]);
  } else {
    itens.push([tecla('←↑↓→'), t('dica.navegar')], [tecla('Enter'), t('dica.abrir')], [tecla('Esc'), t('dica.voltar')]);
    if (temMenu) itens.push([tecla('M'), t('dica.opcoes')]);
    itens.push([tecla('/'), t('dica.buscar')], [tecla('G'), t('dica.guia')]);
  }
  limpar(dicas).append(...itens.map(([marca, texto]) => h('span', { class: 'dica' }, marca, h('span', { text: texto }))), h('a', { class: 'dica dica-link', href: '#/ajuda', text: t('dica.ajuda'), 'data-foco-pular': true }));
}

// ---- Telas --------------------------------------------------------------

const contexto = {
  /** Redesenha a tela atual preservando foco e rolagem. */
  remontar() {
    if (!visao) return;
    const chave = chaveDoFoco();
    const rolagem = window.scrollY;
    montar(visao.rota, { animar: false });
    window.scrollTo(0, rolagem);
    const alvo = acharPorChave(chave);
    if (alvo && !sobreposicoes.aberta()) foco.focar(alvo, { rolar: false });
  },
};

function montar(rota, { animar = true } = {}) {
  if (visao && visao.instancia.destruir) visao.instancia.destruir();
  fundo.cancelar();
  const modulo = moduloPara(rota);
  limpar(tela);
  tela.className = 'tela tela-' + rota.nome + (modulo === simples ? ' tela-simples' : '');
  let instancia;
  try {
    instancia = modulo.montar(tela, rota, contexto) || {};
  } catch (erro) {
    console.error(erro);
    limpar(tela);
    instancia = recuperacao.montar(tela, { ...rota, nome: 'recuperacao', params: { tipo: 'falha' } }, contexto);
  }
  visao = { modulo, instancia, rota };
  document.title = (instancia.titulo ? instancia.titulo + ' · ' : '') + t('site.titulo');
  const descricao = document.querySelector('meta[name="description"]');
  if (descricao) descricao.content = t('site.descricao');
  if (modulo === simples) fundo.definirBase('neutro', { fixar: true });
  else fundo.definirBase(instancia.fundo || fundoDaTela[rota.nome] || 'padrao', { fixar: Boolean(instancia.fixarFundo) });
  if (animar && !prefs.movimentoReduzido()) {
    tela.classList.remove('entrando');
    void tela.offsetWidth; // reinicia a animação de entrada
    tela.classList.add('entrando');
  }
}

function focarInicial() {
  const alvo = tela.querySelector('[data-foco-inicial]') || document.getElementById('titulo-da-tela') || tela;
  foco.focar(alvo, { rolar: false });
}

function aoMudarRota(rota, { anterior, veioDoHistorico }) {
  if (anterior) memoriaDeRotas.set(anterior.hash, { rolagem: window.scrollY, chave: chaveDoFoco() });
  sobreposicoes.fecharTodas();
  const modulo = moduloPara(rota);
  if (visao && visao.modulo === modulo && visao.instancia.atualizar) {
    visao.rota = rota;
    visao.instancia.atualizar(rota);
  } else {
    montar(rota);
    const lembrado = veioDoHistorico ? memoriaDeRotas.get(rota.hash) : null;
    if (lembrado) {
      window.scrollTo(0, lembrado.rolagem);
      const alvo = acharPorChave(lembrado.chave);
      if (alvo) foco.focar(alvo, { rolar: false });
      else if (pronto) focarInicial();
    } else {
      window.scrollTo(0, 0);
      if (pronto) focarInicial();
    }
  }
  if (rota.nome === 'projeto' || rota.nome === 'jogo') historico.registrar(rota.nome + ':' + rota.params.id);
  else if (SECAO_DO_HISTORICO[rota.nome] && catalogo.obter(SECAO_DO_HISTORICO[rota.nome])) historico.registrar(SECAO_DO_HISTORICO[rota.nome]);
  desenharTopo();
  if (pronto && visao.instancia.titulo) anunciar(visao.instancia.titulo);
}

export const casca = {
  iniciar({ elementoTopo, elementoTela, elementoDicas }) {
    topo = elementoTopo;
    tela = elementoTela;
    dicas = elementoDicas;
    desenharTopo();
    desenharDicas();
    const pular = document.getElementById('pular-conteudo');
    pular.textContent = t('comum.pularConteudo');
    pular.addEventListener('click', () => focarInicial());

    rotas.inscrever(aoMudarRota);
    rotas.definirGuarda(async (destino) => {
      if (!visao || !visao.instancia.podeSair) return true;
      if (visao.instancia.atualizar && moduloPara(destino) === visao.modulo) return true;
      return visao.instancia.podeSair(destino);
    });

    prefs.aoMudar((_, mudou) => {
      if (mudou.includes('idioma') || mudou.includes('modo')) {
        desenharTopo();
        desenharDicas();
        pular.textContent = t('comum.pularConteudo');
        dicas.setAttribute('aria-label', t('dica.rotulo'));
        const trocaDeModo = mudou.includes('modo');
        if (trocaDeModo && visao) {
          montar(visao.rota);
          window.scrollTo(0, 0);
          focarInicial();
        } else {
          contexto.remontar();
        }
      }
      if (mudou.includes('fundoPadrao') || mudou.includes('fundoDinamico')) fundo.reaplicar();
    });
    notificacoes.aoMudar(desenharTopo);
    acoes.aoMudarMetodo(desenharDicas);
    document.addEventListener('focusin', desenharDicas);
    controle.aoMudar(desenharDicas);
    window.addEventListener('online', desenharTopo);
    window.addEventListener('offline', desenharTopo);
    window.setInterval(atualizarRelogio, 15000);

    // Prévia de fundo: só quando muda o foco efetivo (foco DOM ou cartão
    // sob o ponteiro), nunca a cada movimento do mouse.
    let ultimoSobre = null;
    const app = document.getElementById('app');
    document.addEventListener('focusin', (evento) => {
      const alvo = evento.target;
      // Foco em sobreposição (Guia, busca, menus) não mexe no fundo.
      if (!app.contains(alvo)) return;
      if (alvo.fundo && tela.contains(alvo)) {
        fundo.previa(alvo.fundo);
        const vizinho = alvo.closest('.trilho-item, .grade-item');
        const proximo = vizinho && vizinho.nextElementSibling && vizinho.nextElementSibling.querySelector('.cartao-link');
        if (proximo && proximo.fundo) fundo.precarregar(proximo.fundo);
      } else {
        fundo.restaurar();
      }
    });
    tela.addEventListener('pointerover', (evento) => {
      if (evento.pointerType !== 'mouse') return;
      const cartaoSobre = evento.target.closest ? evento.target.closest('.cartao-link') : null;
      if (cartaoSobre === ultimoSobre) return;
      ultimoSobre = cartaoSobre;
      if (cartaoSobre && cartaoSobre.fundo) fundo.previa(cartaoSobre.fundo);
      else if (!cartaoSobre) {
        const ativo = document.activeElement;
        if (ativo && ativo.fundo && tela.contains(ativo)) fundo.previa(ativo.fundo);
        else fundo.restaurar();
      }
    });
  },
  /** Chamado quando a abertura termina: libera foco e anúncios. */
  liberar() {
    pronto = true;
    focarInicial();
  },
  remontar: () => contexto.remontar(),
  visaoAtual: () => visao,
};
