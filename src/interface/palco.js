// Palco dos jogos: carrega o módulo sob demanda e cuida do que é comum aos
// quatro — menu, opções, HUD, pausa, resultado, recorde local, controles por
// teclado/toque/controle e limpeza total ao sair.
// Estados: carregando → menu → jogando ⇄ pausado → resultado.

import { h, icone, limpar, anexar, anunciar } from './dom.js';
import { t, tx, formatarTempo } from '../servicos/i18n.js';
import { sobreposicoes } from './sobreposicoes.js';
import { acoes } from '../entrada/acoes.js';
import { foco } from '../entrada/foco.js';
import { controle } from '../entrada/controle.js';
import { criarDirecional, dispositivoDeToque } from '../entrada/toque.js';
import { audio } from '../servicos/audio.js';
import { prefs } from '../servicos/preferencias.js';
import { armazenamento } from '../servicos/armazenamento.js';
import { recordes, conquistas } from '../servicos/recordes.js';
import { notificacoes } from '../servicos/notificacoes.js';
import { segmentos } from './componentes.js';

const TECLAS = {
  ArrowUp: 'cima', ArrowDown: 'baixo', ArrowLeft: 'esquerda', ArrowRight: 'direita',
  w: 'cima', s: 'baixo', a: 'esquerda', d: 'direita', ' ': 'a',
};

export function formatarPontos(jogo, pontos) {
  if (jogo.unidade === 'tempo') return formatarTempo(pontos);
  return t('jogo.unidade.' + jogo.unidade, { n: pontos });
}

function lerOpcoes(jogo, meta) {
  const salvas = (armazenamento.ler('jogos', {}) || {})[jogo.id] || {};
  const opcoes = {};
  for (const opcao of meta.opcoes || []) {
    const valida = opcao.valores.some((v) => v.valor === salvas[opcao.id]);
    opcoes[opcao.id] = valida ? salvas[opcao.id] : opcao.padrao;
  }
  return opcoes;
}

function salvarOpcoes(jogo, opcoes) {
  const todas = armazenamento.lerAtual('jogos', {}) || {};
  todas[jogo.id] = opcoes;
  armazenamento.salvar('jogos', todas);
}

/** Abre o palco do jogo. `gatilho` recebe o foco de volta ao sair. */
export function abrirPalco(jogo, gatilho) {
  let estado = 'carregando';
  let modulo = null;
  let instancia = null;
  let opcoes = {};
  let cancelado = false;
  let direcional = null;
  let ultimoResultado = null;
  const limpezas = [];
  const pressionadas = new Set();

  const titulo = h('h2', { class: 'palco-titulo', text: tx(jogo.nome) });
  const hud = h('div', { class: 'palco-hud', role: 'status', 'aria-live': 'off' });
  const botaoPausa = h('button', { type: 'button', class: 'botao palco-pausa', hidden: true, 'data-foco-pular': true }, icone('pausa', 18), h('span', { text: t('jogo.pausar') }));
  const area = h('div', { class: 'palco-area' });
  const painel = h('div', { class: 'palco-painel' });
  const toque = h('div', { class: 'palco-toque' });
  let fecharCamada = () => {};

  // ---- ciclo do jogo ----------------------------------------------------

  function destruirInstancia() {
    if (instancia) {
      try {
        instancia.destruir();
      } catch (erro) {
        console.error(erro);
      }
      instancia = null;
    }
    if (direcional) {
      direcional.destruir();
      direcional = null;
    }
    pressionadas.clear();
    limpar(area);
    limpar(hud);
    if (document.pointerLockElement) document.exitPointerLock();
  }

  function soltarEntradas() {
    if (instancia && instancia.entrada) pressionadas.forEach((nome) => instancia.entrada(nome, false));
    pressionadas.clear();
    if (direcional) direcional.soltarTudo();
  }

  function mostrarPainel(conteudo) {
    anexar(limpar(painel), conteudo);
    painel.hidden = false;
    area.setAttribute('aria-hidden', 'true');
    area.inert = true;
    botaoPausa.hidden = true;
    foco.focar(painel.querySelector('[data-foco-inicial]') || foco.primeiro(painel) || painel, { rolar: false });
  }

  function esconderPainel() {
    painel.hidden = true;
    limpar(painel);
    area.removeAttribute('aria-hidden');
    area.inert = false;
  }

  function comecar() {
    destruirInstancia();
    salvarOpcoes(jogo, opcoes);
    esconderPainel();
    estado = 'jogando';
    botaoPausa.hidden = false;
    audio.registrarGesto();
    try {
      instancia = modulo.criar({
        area,
        opcoes: { ...opcoes },
        t,
        tx,
        som: (nome) => audio.tocar(nome),
        movimentoReduzido: prefs.movimentoReduzido(),
        hud(itens) {
          hud.replaceChildren(...itens.map((item) => h('span', { class: 'hud-item' }, h('span', { class: 'hud-rotulo', text: item.rotulo }), h('strong', { text: String(item.valor) }))));
        },
        anunciar,
        terminar: (resultado) => window.setTimeout(() => aoTerminar(resultado), 0),
      });
      if (modulo.meta.toque && dispositivoDeToque() && instancia.entrada) {
        direcional = criarDirecional((nome, pressionado) => instancia && estado === 'jogando' && instancia.entrada(nome, pressionado), { comAcao: modulo.meta.toque === 'direcional+a' });
        toque.replaceChildren(direcional.elemento);
      }
      instancia.iniciar();
      if (modulo.meta.entrada === 'foco') foco.focar(area.querySelector('[data-foco-inicial]') || foco.primeiro(area) || area, { rolar: false });
      else foco.focar(area, { rolar: false });
    } catch (erro) {
      console.error(erro);
      destruirInstancia();
      mostrarFalha();
    }
  }

  function pausar(motivo) {
    if (estado !== 'jogando') return;
    estado = 'pausado';
    soltarEntradas();
    instancia.pausar();
    audio.suspender();
    mostrarPainel([
      h('h3', { class: 'painel-titulo', text: t('jogo.pausado') }),
      motivo ? h('p', { class: 'nota', text: motivo }) : null,
      h(
        'div',
        { class: 'painel-acoes', 'data-regiao': 'palco-acoes' },
        h('button', { type: 'button', class: 'botao botao-principal', 'data-foco-inicial': true, onClick: retomar }, icone('jogar', 18), h('span', { text: t('jogo.retomar') })),
        h('button', { type: 'button', class: 'botao', onClick: reiniciar }, icone('reiniciar', 18), h('span', { text: t('jogo.reiniciar') })),
        h('button', { type: 'button', class: 'botao', onClick: () => sair(true) }, icone('voltar', 18), h('span', { text: t('jogo.sair') })),
      ),
      controlesResumo(),
    ]);
    anunciar(t('jogo.pausado'));
  }

  function retomar() {
    if (estado !== 'pausado') return;
    estado = 'jogando';
    esconderPainel();
    botaoPausa.hidden = false;
    instancia.retomar();
    if (modulo.meta.entrada === 'foco') foco.focar(area.querySelector('[data-foco-inicial]') || foco.primeiro(area) || area, { rolar: false });
    else foco.focar(area, { rolar: false });
  }

  async function reiniciar() {
    const ok = await sobreposicoes.confirmar({
      titulo: t('jogo.reiniciar'),
      texto: t('jogo.reiniciar.texto'),
      acoes: [
        { rotulo: t('comum.cancelar'), valor: false },
        { rotulo: t('jogo.reiniciar'), valor: true, principal: true },
      ],
    });
    if (ok) comecar();
  }

  async function sair(confirmar) {
    if (confirmar) {
      const ok = await sobreposicoes.confirmar({
        titulo: t('jogo.sair'),
        texto: t('jogo.sair.texto'),
        acoes: [
          { rotulo: t('jogo.continuar'), valor: false },
          { rotulo: t('jogo.sair'), valor: true, perigo: true },
        ],
      });
      if (!ok) return;
    }
    fecharCamada();
  }

  function aoTerminar(resultado) {
    if (estado !== 'jogando' || cancelado) return;
    estado = 'resultado';
    soltarEntradas();
    if (instancia) instancia.pausar();
    if (document.pointerLockElement) document.exitPointerLock();
    const variante = modulo.meta.variante ? modulo.meta.variante(opcoes) : 'padrao';
    // Derrota em jogo de "menor é melhor" (tempo, tentativas) não gera recorde.
    const valeRecorde = jogo.melhor === 'maior' ? resultado.pontos > 0 : resultado.vitoria;
    const registro = valeRecorde ? recordes.registrar(jogo.id, jogo.versaoRegras, variante, resultado.pontos, jogo.melhor) : { novo: false, persistido: armazenamento.disponivel, melhor: null };
    const anterior = recordes.obter(jogo.id, jogo.versaoRegras, variante);
    const novas = conquistas.avaliar(jogo.id, resultado.marcos || {});
    ultimoResultado = resultado;
    audio.tocar(resultado.vitoria ? 'vitoria' : 'derrota');
    notificacoes.registrar({
      tipo: 'info',
      chave: resultado.vitoria ? 'notif.jogoVitoria' : 'notif.jogoFim',
      vars: { jogo: tx(jogo.nome), resultado: formatarPontos(jogo, resultado.pontos) },
      destino: '/jogos/' + jogo.id,
    });
    for (const conquista of novas) {
      notificacoes.registrar({ tipo: 'conquista', chave: 'notif.conquista', vars: { nome: tx(conquista.titulo) }, destino: '/conquistas' });
    }
    mostrarPainel([
      h('h3', { class: 'painel-titulo', text: t(resultado.vitoria ? 'jogo.vitoria' : 'jogo.derrota') }),
      resultado.resumo ? h('p', { text: resultado.resumo }) : null,
      h(
        'dl',
        { class: 'fatos' },
        h('div', null, h('dt', { text: t('jogo.resultado') }), h('dd', { text: formatarPontos(jogo, resultado.pontos) })),
        anterior ? h('div', null, h('dt', { text: t('jogo.recordeLocal') }), h('dd', { text: formatarPontos(jogo, anterior.pontos) + (registro.novo ? ' — ' + t('jogo.novoRecorde') : '') })) : null,
      ),
      h('p', { class: 'nota', text: t(armazenamento.disponivel && registro.persistido !== false ? 'jogo.recordeNota' : 'jogo.recordeNaoSalvo') }),
      novas.length ? h('p', { class: 'aviso-inline' }, icone('trofeu', 16), h('span', { text: t('jogo.conquistas', { nomes: novas.map((c) => tx(c.titulo)).join(', ') }) })) : null,
      h(
        'div',
        { class: 'painel-acoes', 'data-regiao': 'palco-acoes' },
        h('button', { type: 'button', class: 'botao botao-principal', 'data-foco-inicial': true, onClick: comecar }, icone('reiniciar', 18), h('span', { text: t('jogo.jogarDeNovo') })),
        h('button', { type: 'button', class: 'botao', onClick: mostrarMenu }, icone('lista', 18), h('span', { text: t('jogo.menu') })),
        h('button', { type: 'button', class: 'botao', onClick: () => sair(false) }, icone('voltar', 18), h('span', { text: t('jogo.voltarFicha') })),
      ),
    ]);
    anunciar(t(resultado.vitoria ? 'jogo.vitoria' : 'jogo.derrota') + '. ' + t('jogo.resultado') + ': ' + formatarPontos(jogo, resultado.pontos));
  }

  // ---- painéis ----------------------------------------------------------

  function controlesResumo() {
    const metodo = acoes.metodo();
    const ordem = metodo === 'controle' ? ['controle', 'teclado', 'toque'] : metodo === 'toque' ? ['toque', 'teclado', 'controle'] : ['teclado', 'toque', 'controle'];
    return h(
      'details',
      { class: 'painel-controles' },
      h('summary', { text: t('jogo.controles') }),
      h('dl', { class: 'fatos' }, ordem.map((tipo) => h('div', null, h('dt', { text: t('ajuda.' + tipo) }), h('dd', { text: tx(jogo.controles[tipo]) })))),
    );
  }

  function mostrarMenu() {
    destruirInstancia();
    estado = 'menu';
    const linhaRecorde = h('p', { class: 'nota' });
    const atualizarRecorde = () => {
      const variante = modulo.meta.variante ? modulo.meta.variante(opcoes) : 'padrao';
      const registro = recordes.obter(jogo.id, jogo.versaoRegras, variante);
      linhaRecorde.textContent = registro ? t('jogo.recordeLocal') + ': ' + formatarPontos(jogo, registro.pontos) + ' — ' + t('jogo.recordeNota') : t('jogo.semRecorde');
    };
    atualizarRecorde();
    mostrarPainel([
      h('h3', { class: 'painel-titulo', text: tx(jogo.nome) }),
      h('p', { text: tx(jogo.objetivo) }),
      (modulo.meta.opcoes || []).map((opcao) =>
        h(
          'div',
          { class: 'filtro' },
          h('span', { class: 'filtro-rotulo', text: tx(opcao.rotulo) }),
          segmentos({
            id: 'opcao-' + opcao.id,
            rotulo: tx(opcao.rotulo),
            valor: opcoes[opcao.id],
            opcoes: opcao.valores.map((v) => ({ valor: v.valor, rotulo: tx(v.rotulo) })),
            aoEscolher: (valor) => {
              opcoes[opcao.id] = valor;
              atualizarRecorde();
            },
          }),
        ),
      ),
      linhaRecorde,
      h(
        'div',
        { class: 'painel-acoes', 'data-regiao': 'palco-acoes' },
        h('button', { type: 'button', class: 'botao botao-principal', 'data-foco-inicial': true, onClick: comecar }, icone('jogar', 18), h('span', { text: t('jogo.iniciar') })),
        h('button', { type: 'button', class: 'botao', onClick: () => sair(false) }, icone('voltar', 18), h('span', { text: t('jogo.voltarFicha') })),
      ),
      controlesResumo(),
    ]);
  }

  function mostrarFalha() {
    estado = 'falha';
    mostrarPainel([
      h('h3', { class: 'painel-titulo', text: t('jogo.falha') }),
      h('p', { text: t('jogo.falha.texto') }),
      h(
        'div',
        { class: 'painel-acoes', 'data-regiao': 'palco-acoes' },
        h('button', { type: 'button', class: 'botao botao-principal', 'data-foco-inicial': true, onClick: carregar }, icone('reiniciar', 18), h('span', { text: t('comum.tentarNovamente') })),
        h('button', { type: 'button', class: 'botao', onClick: () => sair(false) }, icone('voltar', 18), h('span', { text: t('jogo.voltarFicha') })),
      ),
    ]);
  }

  function carregar() {
    estado = 'carregando';
    mostrarPainel([
      h('h3', { class: 'painel-titulo', text: t('jogo.carregando', { nome: tx(jogo.nome) }) }),
      h('div', { class: 'painel-acoes' }, h('button', { type: 'button', class: 'botao', 'data-foco-inicial': true, onClick: () => sair(false) }, h('span', { text: t('comum.cancelar') }))),
    ]);
    // O caminho é relativo a src/interface/; os módulos ficam em src/jogos/.
    import('../jogos/' + jogo.modulo.replace('./', '')).then(
      (carregado) => {
        if (cancelado) return; // o visitante saiu antes: resultado tardio é ignorado
        modulo = carregado;
        opcoes = lerOpcoes(jogo, modulo.meta);
        mostrarMenu();
      },
      (erro) => {
        console.error(erro);
        if (!cancelado) mostrarFalha();
      },
    );
  }

  // ---- entrada ----------------------------------------------------------

  function aoTecla(evento) {
    if (sobreposicoes.topo() !== camada || evento.isComposing) return;
    const tecla = evento.key.length === 1 ? evento.key.toLowerCase() : evento.key;
    if (evento.type === 'keydown' && estado === 'jogando' && tecla === 'p' && !evento.ctrlKey && !evento.metaKey) {
      evento.preventDefault();
      evento.stopImmediatePropagation();
      pausar();
      return;
    }
    if (estado !== 'jogando' || modulo.meta.entrada !== 'jogo' || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    const nome = TECLAS[tecla];
    if (!nome) return;
    evento.preventDefault();
    evento.stopImmediatePropagation(); // o atalho global de setas não age durante a partida
    acoes.definirMetodo('teclado');
    if (evento.type === 'keydown') {
      if (evento.repeat || pressionadas.has(nome)) return;
      pressionadas.add(nome);
      instancia.entrada(nome, true);
    } else if (pressionadas.delete(nome)) {
      instancia.entrada(nome, false);
    }
  }

  function consumir(evento) {
    if (sobreposicoes.topo() !== camada) return false;
    const jogandoComCaptura = estado === 'jogando' && modulo.meta.entrada === 'jogo';
    if (['guia', 'busca', 'menu', 'ajuda', 'abaAnterior', 'abaProxima'].includes(evento.nome)) return true;
    if (evento.nome === 'pausar') {
      if (evento.pressionado) {
        if (estado === 'jogando') pausar();
        else if (estado === 'pausado') retomar();
      }
      return true;
    }
    if (evento.origem !== 'controle' || !jogandoComCaptura) return false;
    if (['cima', 'baixo', 'esquerda', 'direita'].includes(evento.nome)) {
      if (!evento.repeticao) instancia.entrada(evento.nome, evento.pressionado);
      return true;
    }
    if (evento.nome === 'confirmar') {
      instancia.entrada('a', evento.pressionado);
      return true;
    }
    return false;
  }

  const pausarPorFoco = () => pausar(t('jogo.pausaFoco'));
  const aoVisibilidade = () => {
    if (document.hidden) pausarPorFoco();
  };

  // ---- camada -----------------------------------------------------------

  const camada = sobreposicoes.abrir({
    tipo: 'jogo',
    rotulo: tx(jogo.nome),
    gatilho,
    fecharFora: false,
    // Esc/B: pausa durante a partida, retoma na pausa, sai nos demais estados.
    podeFechar() {
      if (estado === 'jogando') {
        pausar();
        return false;
      }
      if (estado === 'pausado') {
        retomar();
        return false;
      }
      return true;
    },
    aoFechar() {
      cancelado = true;
      estado = 'encerrado';
      destruirInstancia();
      limpezas.forEach((fn) => fn());
      audio.suspender();
    },
    montar(elemento, fechar) {
      fecharCamada = fechar;
      elemento.append(h('div', { class: 'palco' }, h('header', { class: 'palco-topo' }, titulo, hud, botaoPausa), h('div', { class: 'palco-centro' }, area, painel), toque));
    },
  });

  area.tabIndex = -1;
  area.setAttribute('aria-label', tx(jogo.nome));
  botaoPausa.addEventListener('click', () => pausar());
  document.addEventListener('keydown', aoTecla, true);
  document.addEventListener('keyup', aoTecla, true);
  window.addEventListener('blur', pausarPorFoco);
  document.addEventListener('visibilitychange', aoVisibilidade);
  const pararConsumo = acoes.empilhar(consumir);
  const pararControle = controle.aoMudar((tipo) => {
    if (tipo === 'desconectado') pausar(t('jogo.pausaControle'));
  });
  limpezas.push(
    () => document.removeEventListener('keydown', aoTecla, true),
    () => document.removeEventListener('keyup', aoTecla, true),
    () => window.removeEventListener('blur', pausarPorFoco),
    () => document.removeEventListener('visibilitychange', aoVisibilidade),
    pararConsumo,
    pararControle,
  );

  carregar();
  return {
    estado: () => estado,
    ultimoResultado: () => ultimoResultado,
  };
}
