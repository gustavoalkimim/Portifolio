// Configurações com rascunho e prévia reversível (F16/F32): mudar um controle
// aplica a prévia na hora; Aplicar salva, Cancelar restaura o que estava
// salvo. O idioma é aplicado imediatamente. Sair com alterações pendentes
// oferece Aplicar, Descartar ou Continuar editando.

import { h, icone, anunciar, anexar, limpar } from './dom.js';
import { t, tx } from '../servicos/i18n.js';
import { prefs, OPCOES } from '../servicos/preferencias.js';
import { armazenamento } from '../servicos/armazenamento.js';
import { historico } from '../servicos/historico.js';
import { recordes, conquistas } from '../servicos/recordes.js';
import { notificacoes } from '../servicos/notificacoes.js';
import { fundos } from '../dados/paineis.js';
import { audio } from '../servicos/audio.js';
import { fundo } from '../servicos/fundo.js';
import { controle } from '../entrada/controle.js';
import { sobreposicoes } from './sobreposicoes.js';
import { cabecalhoTela, segmentos } from './componentes.js';

const SECOES = ['idioma', 'aparencia', 'fundo', 'movimento', 'audio', 'entrada', 'dados', 'sobre'];
let secaoAtual = 'idioma';
let rascunho = null; // só as chaves alteradas e ainda não salvas
let conflito = false;

function pendente() {
  return rascunho && Object.keys(rascunho).some((chave) => rascunho[chave] !== prefs.salvas()[chave]);
}

export function montar(raiz, rota, ctx) {
  if (rota.consulta.secao && SECOES.includes(rota.consulta.secao)) secaoAtual = rota.consulta.secao;
  rascunho = rascunho || {};
  const valor = (chave) => (chave in rascunho ? rascunho[chave] : prefs.salvas()[chave]);
  const barra = h('div', { class: 'config-barra', role: 'status' });
  const corpo = h('div', { class: 'config-corpo' });

  const desenharBarra = () => {
    const tem = pendente();
    anexar(limpar(barra), [
      conflito ? h('p', { class: 'aviso-inline' }, icone('alerta', 16), h('span', { text: t('config.conflito') })) : null,
      !armazenamento.disponivel ? h('p', { class: 'nota', text: t('config.soSessao') }) : null,
      tem ? h('p', { class: 'nota', text: t('config.previa') }) : null,
      h(
        'div',
        { class: 'acoes', 'data-regiao': 'config-acoes' },
        h('button', { type: 'button', class: 'botao botao-principal', 'data-chave': 'config:aplicar', disabled: tem ? null : true, onClick: aplicar }, icone('certo', 16), h('span', { text: t('config.aplicar') })),
        h('button', { type: 'button', class: 'botao', 'data-chave': 'config:cancelar', disabled: tem ? null : true, onClick: cancelar }, h('span', { text: t('config.cancelar') })),
        h('button', { type: 'button', class: 'botao', 'data-chave': 'config:padrao', onClick: restaurar }, icone('reiniciar', 16), h('span', { text: t('config.restaurar') })),
      ),
    ]);
  };

  const mudar = (chave, novo) => {
    rascunho[chave] = novo;
    prefs.previa({ ...rascunho });
    desenharBarra();
  };

  function aplicar() {
    const persistiu = prefs.definir({ ...rascunho });
    rascunho = {};
    conflito = false;
    desenharBarra();
    notificacoes.registrar({ tipo: persistiu ? 'sucesso' : 'info', chave: persistiu ? 'notif.prefsSalvas' : 'notif.prefsSessao' });
    anunciar(t(persistiu ? 'config.salvo' : 'config.soSessao'));
  }

  function cancelar() {
    rascunho = {};
    conflito = false;
    prefs.cancelarPrevia();
    desenharSecao();
    desenharBarra();
    anunciar(t('config.cancelado'));
  }

  async function restaurar() {
    const ok = await sobreposicoes.confirmar({
      titulo: t('config.restaurar'),
      texto: t('config.restaurar.texto'),
      acoes: [
        { rotulo: t('comum.cancelar'), valor: false },
        { rotulo: t('config.restaurar'), valor: true, principal: true },
      ],
    });
    if (!ok) return;
    rascunho = {};
    const persistiu = prefs.restaurarPadrao();
    desenharSecao();
    desenharBarra();
    notificacoes.registrar({ tipo: persistiu ? 'sucesso' : 'info', chave: persistiu ? 'notif.prefsSalvas' : 'notif.prefsSessao' });
  }

  const escolha = (chave, valores, rotuloDe) =>
    h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('config.' + chave) }), segmentos({
      id: 'config-' + chave,
      rotulo: t('config.' + chave),
      valor: valor(chave),
      opcoes: valores.map((v) => ({ valor: v, rotulo: rotuloDe ? rotuloDe(v) : t('config.' + chave + '.' + v) })),
      aoEscolher: (novo) => mudar(chave, novo),
    }), t('config.' + chave + '.dica') ? h('p', { class: 'nota', text: t('config.' + chave + '.dica') }) : null);

  const deslizante = (chave, min, max, passo, sufixo) => {
    const saida = h('output', { class: 'deslizante-valor', text: valor(chave) + sufixo });
    return h(
      'div',
      { class: 'filtro' },
      h('label', { class: 'filtro-rotulo', for: 'config-' + chave, text: t('config.' + chave) }),
      h('div', { class: 'deslizante' }, h('input', {
        type: 'range', id: 'config-' + chave, 'data-chave': 'config:' + chave, min, max, step: passo, value: valor(chave),
        onInput: (evento) => {
          saida.textContent = evento.target.value + sufixo;
          mudar(chave, Number(evento.target.value));
        },
      }), saida),
      t('config.' + chave + '.dica') ? h('p', { class: 'nota', text: t('config.' + chave + '.dica') }) : null,
    );
  };

  const limparCategoria = async (chaveTexto, acao) => {
    const ok = await sobreposicoes.confirmar({
      titulo: t('config.dados.' + chaveTexto),
      texto: t('config.dados.' + chaveTexto + '.texto'),
      acoes: [
        { rotulo: t('comum.cancelar'), valor: false },
        { rotulo: t('config.dados.apagar'), valor: true, perigo: true },
      ],
    });
    if (!ok) return;
    acao();
    notificacoes.registrar({ tipo: 'sucesso', chave: 'notif.dadosApagados', vars: { nome: t('config.dados.' + chaveTexto) } });
    desenharSecao();
  };

  const CONTEUDO = {
    idioma: () => [
      h('div', { class: 'filtro' }, h('span', { class: 'filtro-rotulo', text: t('config.idioma') }), segmentos({
        id: 'config-idioma',
        rotulo: t('config.idioma'),
        valor: prefs.obter().idioma,
        opcoes: [{ valor: 'pt', rotulo: 'Português' }, { valor: 'en', rotulo: 'English' }],
        aoEscolher: (novo) => {
          // Idioma vale na hora; a prévia das outras opções é mantida.
          prefs.definir({ idioma: novo });
          if (pendente()) prefs.previa({ ...rascunho });
        },
      })),
      h('p', { class: 'nota', text: t('config.idioma.dica') }),
      escolha('modo', OPCOES.modo),
    ],
    aparencia: () => [escolha('tema', OPCOES.tema), escolha('realce', OPCOES.realce), escolha('contraste', OPCOES.contraste), escolha('texto', OPCOES.texto), escolha('duracaoAviso', OPCOES.duracaoAviso, (v) => t('config.segundos', { n: v }))],
    fundo: () => [
      escolha('fundoDinamico', [true, false], (v) => t(v ? 'comum.ligado' : 'comum.desligado')),
      escolha('fundoPadrao', OPCOES.fundoPadrao, (v) => tx(fundos[v].nome)),
    ],
    movimento: () => [escolha('movimento', OPCOES.movimento), escolha('abertura', OPCOES.abertura)],
    audio: () => [
      escolha('audio', [false, true], (v) => t(v ? 'comum.ligado' : 'comum.desligado')),
      deslizante('volume', 0, 100, 5, '%'),
      deslizante('volumeInterface', 0, 100, 5, '%'),
      deslizante('volumeJogos', 0, 100, 5, '%'),
      h('div', { class: 'acoes' }, h('button', {
        type: 'button', class: 'botao', 'data-chave': 'config:testar-som',
        onClick: () => {
          audio.registrarGesto();
          audio.tocar('ponto');
          anunciar(t(prefs.obter().audio ? 'config.audio.testado' : 'config.audio.desligado'));
        },
      }, icone('som', 16), h('span', { text: t('config.audio.testar') }))),
      h('p', { class: 'nota', text: t(audio.disponivel() ? 'config.audio.nota' : 'config.audio.indisponivel') }),
    ],
    entrada: () => [
      h('p', { class: 'aviso-inline' }, icone('controle', 16), h('span', { text: t(controle.conectado() ? 'ajuda.controle.conectado' : 'ajuda.controle.nota') })),
      deslizante('zonaMorta', 10, 60, 5, '%'),
      escolha('ladoGuia', OPCOES.ladoGuia),
      h('p', null, h('a', { class: 'link', href: '#/ajuda', 'data-chave': 'config:ajuda', text: t('config.entrada.ajuda') })),
    ],
    dados: () => [
      h('p', { class: 'nota', text: t(armazenamento.disponivel ? 'config.dados.nota' : 'config.soSessao') }),
      h(
        'ul',
        { class: 'lista-cartoes', 'data-regiao': 'config-dados' },
        [
          ['historico', t('config.dados.contagem', { n: historico.recentes().length }), () => historico.limpar()],
          ['favoritos', t('config.dados.contagem', { n: historico.favoritos().length }), () => historico.limparFavoritos()],
          ['recordes', t('config.dados.contagem', { n: conquistas.listar().filter((c) => c.desbloqueada).length }), () => {
            recordes.limpar();
            conquistas.limpar();
            armazenamento.limpar('jogos');
          }],
          ['tudo', '', () => {
            historico.limpar();
            historico.limparFavoritos();
            recordes.limpar();
            conquistas.limpar();
            armazenamento.limpar('jogos');
            notificacoes.limpar();
            rascunho = {};
            prefs.restaurarPadrao();
            desenharBarra();
          }],
        ].map(([id, detalhe, acao]) =>
          h('li', null, h('button', { type: 'button', class: 'linha-item', 'data-chave': 'config:dados:' + id, onClick: () => limparCategoria(id, acao) }, icone('fechar', 18), h('span', { class: 'linha-texto' }, h('strong', { text: t('config.dados.' + id) }), h('span', { class: 'nota', text: t('config.dados.' + id + '.dica') + (detalhe ? ' ' + detalhe : '') })))),
        ),
      ),
    ],
    sobre: () => [
      h('p', { text: t('config.sobre.texto') }),
      h('p', { class: 'nota', text: t('config.sobre.marcas') }),
      h('p', { class: 'nota', text: t('config.sobre.dados') }),
      h('p', null, h('a', { class: 'link', href: '#/ajuda', 'data-chave': 'config:sobre-ajuda', text: t('secao.ajuda') })),
    ],
  };

  function desenharSecao() {
    // Na seção Fundo a arte padrão fica à mostra para a prévia ser visível.
    fundo.definirBase(secaoAtual === 'fundo' ? 'padrao' : 'neutro');
    corpo.replaceChildren(h('h2', { class: 'ficha-subtitulo', text: t('config.' + secaoAtual) }), h('p', { class: 'nota', text: t('config.' + secaoAtual + '.resumo') }), ...CONTEUDO[secaoAtual]().flat());
  }

  const lista = h('div', { class: 'config-lista', role: 'group', 'aria-label': t('nav.configuracoes'), 'data-regiao': 'config-lista' });
  const desenharLista = () => {
    lista.replaceChildren(
      ...SECOES.map((id) =>
        h('button', {
          type: 'button',
          class: 'config-item' + (id === secaoAtual ? ' ativo' : ''),
          'aria-pressed': String(id === secaoAtual),
          'data-chave': 'config:secao:' + id,
          'data-foco-inicial': id === secaoAtual ? true : null,
          text: t('config.' + id),
          onClick: () => {
            secaoAtual = id;
            desenharLista();
            desenharSecao();
            const novo = lista.querySelector('[aria-pressed="true"]');
            if (novo) novo.focus({ preventScroll: true });
          },
        }),
      ),
    );
  };
  desenharLista();

  desenharSecao();
  desenharBarra();
  if (pendente()) prefs.previa({ ...rascunho });

  raiz.append(cabecalhoTela({ titulo: t('nav.configuracoes'), subtitulo: t('config.subtitulo') }), h('div', { class: 'config' }, lista, h('div', { class: 'config-painel' }, corpo, barra)));

  const pararFora = prefs.aoMudarFora((emPrevia) => {
    conflito = emPrevia;
    if (!emPrevia) desenharSecao();
    desenharBarra();
  });

  return {
    titulo: t('nav.configuracoes'),
    fundo: 'neutro',
    destruir() {
      pararFora();
    },
    async podeSair() {
      if (!pendente()) return true;
      const escolhaFinal = await sobreposicoes.confirmar({
        titulo: t('config.sair.titulo'),
        texto: t('config.sair.texto'),
        acoes: [
          { rotulo: t('config.sair.continuar'), valor: 'ficar' },
          { rotulo: t('config.sair.descartar'), valor: 'descartar', perigo: true },
          { rotulo: t('config.aplicar'), valor: 'aplicar', principal: true },
        ],
      });
      if (escolhaFinal === 'aplicar') {
        aplicar();
        return true;
      }
      if (escolhaFinal === 'descartar') {
        rascunho = {};
        prefs.cancelarPrevia();
        return true;
      }
      return false;
    },
  };
}
