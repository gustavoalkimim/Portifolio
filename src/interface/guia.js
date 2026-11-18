// Guia lateral: painel com abas, foco preso e destinos reais.
// Abas: Início, Biblioteca, Pessoas, Mensagens, Conquistas, Capturas,
// Notificações e Perfil/sistema. Os nomes são adaptação própria, não uma
// reprodução das abas de um console.

import { h, icone } from './dom.js';
import { t, tx, formatarHora } from '../servicos/i18n.js';
import { sobreposicoes } from './sobreposicoes.js';
import { catalogo } from '../servicos/catalogo.js';
import { historico } from '../servicos/historico.js';
import { notificacoes } from '../servicos/notificacoes.js';
import { conquistas } from '../servicos/recordes.js';
import { prefs } from '../servicos/preferencias.js';
import { perfil } from '../dados/perfil.js';
import { audio } from '../servicos/audio.js';
import { listaDeContatos } from './componentes.js';
import { todasAsMidias, abrirGaleria } from './galeria.js';
import { abrirBusca } from './busca.js';
import { textoDaNotificacao } from './avisos.js';
import { foco } from '../entrada/foco.js';

const ABAS = [
  { id: 'inicio', icone: 'inicio' },
  { id: 'biblioteca', icone: 'biblioteca' },
  { id: 'pessoas', icone: 'pessoas' },
  { id: 'mensagens', icone: 'mensagem' },
  { id: 'conquistas', icone: 'trofeu' },
  { id: 'capturas', icone: 'imagem' },
  { id: 'notificacoes', icone: 'sino' },
  { id: 'sistema', icone: 'engrenagem' },
];

function linha({ nomeIcone, titulo, detalhe, rota, aoClicar, chave, inicial }) {
  const conteudo = [icone(nomeIcone, 18), h('span', { class: 'linha-texto' }, h('strong', { text: titulo }), detalhe ? h('span', { class: 'nota', text: detalhe }) : null)];
  const props = { class: 'linha-item', 'data-chave': chave, 'data-foco-inicial': inicial ? true : null };
  return h('li', null, rota ? h('a', { ...props, href: '#' + rota }, conteudo) : h('button', { ...props, type: 'button', onClick: aoClicar }, conteudo));
}

function conteudoDaAba(id, fechar) {
  if (id === 'inicio') {
    const recentes = historico.recentes().slice(0, 5).map((entrada) => catalogo.obter(entrada.chave)).filter(Boolean);
    return [
      h('ul', { class: 'lista-cartoes' },
        linha({ nomeIcone: 'inicio', titulo: t('nav.inicio'), detalhe: t('guia.inicio.dica'), rota: '/inicio', chave: 'guia:inicio' }),
        linha({ nomeIcone: 'busca', titulo: t('nav.busca'), detalhe: t('guia.busca.dica'), aoClicar: () => { fechar(); abrirBusca(document.getElementById('botao-guia')); }, chave: 'guia:busca' }),
        linha({ nomeIcone: 'ajuda', titulo: t('secao.ajuda'), detalhe: t('secao.ajuda.resumo'), rota: '/ajuda', chave: 'guia:ajuda' }),
      ),
      h('h3', { class: 'guia-subtitulo', text: t('home.recentes') }),
      recentes.length
        ? h('ul', { class: 'lista-cartoes' }, recentes.map((item) => linha({ nomeIcone: item.tipo === 'jogo' ? 'controle' : item.tipo === 'projeto' ? 'pasta' : item.icone, titulo: item.titulo(), detalhe: t('tipo.' + item.tipo), rota: item.rota, chave: 'guia:recente:' + item.chave })))
        : h('p', { class: 'vazio', text: t('guia.semRecentes') }),
    ];
  }
  if (id === 'biblioteca') {
    return [
      h('ul', { class: 'lista-cartoes' },
        linha({ nomeIcone: 'biblioteca', titulo: t('nav.biblioteca'), detalhe: t('biblioteca.total', { n: catalogo.listar().length }), rota: '/biblioteca', chave: 'guia:biblioteca' }),
        linha({ nomeIcone: 'vitrine', titulo: t('nav.vitrine'), detalhe: t('secao.vitrine.resumo'), rota: '/vitrine', chave: 'guia:vitrine' }),
      ),
      h('h3', { class: 'guia-subtitulo', text: t('secao.projetos') }),
      h('ul', { class: 'lista-cartoes' }, catalogo.projetos().map((item) => linha({ nomeIcone: 'pasta', titulo: item.titulo(), detalhe: item.selo(), rota: item.rota, chave: 'guia:' + item.chave }))),
      h('h3', { class: 'guia-subtitulo', text: t('secao.jogos') }),
      h('ul', { class: 'lista-cartoes' }, catalogo.jogos().map((item) => linha({ nomeIcone: 'controle', titulo: item.titulo(), detalhe: item.selo(), rota: item.rota, chave: 'guia:' + item.chave }))),
    ];
  }
  if (id === 'pessoas') {
    return [h('p', { class: 'nota', text: t('guia.pessoas.nota') }), listaDeContatos(perfil.contatos), h('ul', { class: 'lista-cartoes' }, linha({ nomeIcone: 'pessoa', titulo: t('secao.perfil'), detalhe: perfil.nome, rota: '/perfil', chave: 'guia:perfil' }))];
  }
  if (id === 'mensagens') {
    const envios = notificacoes.listar().filter((n) => n.chave.startsWith('notif.envio.'));
    return [
      h('p', { class: 'nota', text: t('guia.mensagens.nota') }),
      h('ul', { class: 'lista-cartoes' }, linha({ nomeIcone: 'mensagem', titulo: t('form.titulo'), detalhe: t('guia.mensagens.dica'), rota: '/contato', chave: 'guia:formulario' })),
      h('h3', { class: 'guia-subtitulo', text: t('guia.mensagens.sessao') }),
      envios.length
        ? h('ul', { class: 'lista-simples' }, envios.map((n) => h('li', null, h('time', { class: 'nota', datetime: n.data.toISOString(), text: formatarHora(n.data) + ' — ' }), textoDaNotificacao(n))))
        : h('p', { class: 'vazio', text: t('guia.mensagens.vazio') }),
    ];
  }
  if (id === 'conquistas') {
    const locais = conquistas.listar();
    return [
      h('p', { class: 'nota', text: t('conquistas.locais.nota', { n: locais.filter((c) => c.desbloqueada).length, total: locais.length }) }),
      h('ul', { class: 'lista-cartoes' },
        linha({ nomeIcone: 'trofeu', titulo: t('secao.conquistas'), detalhe: t('secao.conquistas.resumo'), rota: '/conquistas', chave: 'guia:conquistas' }),
        linha({ nomeIcone: 'trilha', titulo: t('nav.jornada'), detalhe: t('secao.experiencias.resumo'), rota: '/experiencias', chave: 'guia:jornada' }),
      ),
      h('ul', { class: 'lista-simples' }, locais.map((c) => h('li', null, icone(c.desbloqueada ? 'trofeu' : 'cadeado', 14), ' ' + tx(c.titulo) + ' — ' + t(c.desbloqueada ? 'conquistas.desbloqueada' : 'conquistas.bloqueada')))),
    ];
  }
  if (id === 'capturas') {
    const lista = todasAsMidias();
    return [
      h('ul', { class: 'lista-cartoes' }, linha({ nomeIcone: 'imagem', titulo: t('secao.capturas'), detalhe: t('secao.capturas.resumo'), rota: '/capturas', chave: 'guia:capturas' })),
      lista.length
        ? h('div', { class: 'guia-miniaturas' }, lista.map((entrada, indice) => {
            const botao = h('button', { type: 'button', class: 'miniatura', 'data-chave': 'guia:midia:' + entrada.midia.id, 'aria-label': t('galeria.ampliar', { nome: entrada.projeto.titulo }) }, h('img', { src: entrada.midia.caminho, alt: tx(entrada.midia.alt), loading: 'lazy' }));
            botao.addEventListener('click', () => abrirGaleria(lista, indice, botao));
            botao.querySelector('img').addEventListener('error', () => botao.remove(), { once: true });
            return botao;
          }))
        : h('p', { class: 'vazio', text: t('ficha.semMidia') }),
    ];
  }
  if (id === 'notificacoes') {
    const lista = notificacoes.listar();
    return [
      lista.length
        ? h('div', { class: 'acoes' },
            h('button', { type: 'button', class: 'botao', 'data-chave': 'guia:notif:lidas', disabled: notificacoes.naoLidas() ? null : true, onClick: () => notificacoes.marcarTodas() }, icone('certo', 16), h('span', { text: t('notif.marcarLidas') })),
            h('button', { type: 'button', class: 'botao', 'data-chave': 'guia:notif:limpar', onClick: () => notificacoes.limpar() }, icone('fechar', 16), h('span', { text: t('notif.limpar') })),
          )
        : null,
      lista.length
        ? h('ul', { class: 'lista-cartoes' }, lista.map((n) => {
            const conteudo = [
              icone({ sucesso: 'certo', erro: 'alerta', info: 'sino', conquista: 'trofeu' }[n.tipo], 18),
              h('span', { class: 'linha-texto' }, h('strong', { text: textoDaNotificacao(n) }), h('span', { class: 'nota' }, h('time', { datetime: n.data.toISOString(), text: formatarHora(n.data) }), ' · ' + t(n.lida ? 'notif.lida' : 'notif.naoLida') + (n.destino ? ' · ' + t('notif.abrirContexto') : ''))),
            ];
            const props = { class: 'linha-item' + (n.lida ? '' : ' nao-lida'), 'data-chave': 'guia:notif:' + n.id };
            return h('li', null, n.destino
              ? h('a', { ...props, href: '#' + n.destino, onClick: () => notificacoes.marcarLida(n.id) }, conteudo)
              : h('button', { ...props, type: 'button', 'aria-label': textoDaNotificacao(n) + ' — ' + t('notif.marcarLida'), onClick: () => notificacoes.marcarLida(n.id) }, conteudo));
          }))
        : h('p', { class: 'vazio', text: t('notif.vazio') }),
      h('p', { class: 'nota', text: t('notif.nota') }),
    ];
  }
  // sistema
  const p = prefs.obter();
  return [
    h('ul', { class: 'lista-cartoes' },
      linha({ nomeIcone: 'pessoa', titulo: t('secao.perfil'), detalhe: perfil.nomeCurto, rota: '/perfil', chave: 'guia:sis:perfil' }),
      linha({ nomeIcone: 'engrenagem', titulo: t('nav.configuracoes'), detalhe: t('secao.configuracoes.resumo'), rota: '/configuracoes', chave: 'guia:sis:config' }),
      linha({ nomeIcone: 'ajuda', titulo: t('secao.ajuda'), detalhe: t('secao.ajuda.resumo'), rota: '/ajuda', chave: 'guia:sis:ajuda' }),
      linha({ nomeIcone: 'mensagem', titulo: t('guia.idioma'), detalhe: p.idioma === 'pt' ? 'Português → English' : 'English → Português', aoClicar: () => prefs.definir({ idioma: prefs.obter().idioma === 'pt' ? 'en' : 'pt' }), chave: 'guia:sis:idioma' }),
      linha({ nomeIcone: 'som', titulo: t('config.audio'), detalhe: t(p.audio ? 'comum.ligado' : 'comum.desligado'), aoClicar: () => { audio.registrarGesto(); prefs.definir({ audio: !prefs.obter().audio }); audio.tocar('abrir'); }, chave: 'guia:sis:audio' }),
      linha({ nomeIcone: 'lista', titulo: t('config.modo.simples'), detalhe: t('ajuda.modoSimples'), aoClicar: () => { fechar(); prefs.definir({ modo: 'simples' }); }, chave: 'guia:sis:simples' }),
    ),
  ];
}

export function abrirGuia(abaInicial = 'inicio', gatilho) {
  if (sobreposicoes.aberta('guia')) return;
  let abaAtual = ABAS.some((aba) => aba.id === abaInicial) ? abaInicial : 'inicio';
  let desenhar = () => {};
  const limpezas = [];
  sobreposicoes.abrir({
    tipo: 'guia',
    rotulo: t('guia.titulo'),
    gatilho,
    aoFechar: () => limpezas.forEach((fn) => fn()),
    montar(painel, fechar) {
      const abas = h('div', { class: 'guia-abas', role: 'tablist', 'aria-label': t('guia.abas'), 'data-regiao': 'guia-abas', 'data-eixo': 'x' });
      const titulo = h('h2', { class: 'guia-titulo' });
      const corpo = h('div', { class: 'guia-corpo', role: 'tabpanel', id: 'guia-painel', 'data-regiao': 'guia-corpo' });

      desenhar = (focarChave) => {
        const naoLidas = notificacoes.naoLidas();
        abas.replaceChildren(
          ...ABAS.map((aba) => {
            const nome = t('guia.aba.' + aba.id) + (aba.id === 'notificacoes' && naoLidas ? ' (' + naoLidas + ')' : '');
            return h(
              'button',
              {
                type: 'button', role: 'tab', class: 'guia-aba', id: 'guia-aba-' + aba.id,
                'aria-selected': String(aba.id === abaAtual), 'aria-controls': 'guia-painel',
                tabindex: aba.id === abaAtual ? '0' : '-1', 'aria-label': nome, title: nome,
                'data-chave': 'guia:aba:' + aba.id,
                onClick: () => {
                  if (abaAtual === aba.id) return;
                  abaAtual = aba.id;
                  desenhar('guia:aba:' + aba.id);
                },
              },
              icone(aba.icone, 20),
              aba.id === 'notificacoes' && naoLidas ? h('span', { class: 'topo-contagem', 'aria-hidden': 'true', text: String(naoLidas) }) : null,
            );
          }),
        );
        titulo.textContent = t('guia.aba.' + abaAtual);
        corpo.setAttribute('aria-labelledby', 'guia-aba-' + abaAtual);
        corpo.replaceChildren(...conteudoDaAba(abaAtual, fechar).flat().filter(Boolean));
        corpo.classList.remove('trocando');
        void corpo.offsetWidth;
        corpo.classList.add('trocando');
        if (focarChave) {
          const alvo = painel.querySelector('[data-chave="' + CSS.escape(focarChave) + '"]') || painel.querySelector('[role="tab"][aria-selected="true"]');
          if (alvo) foco.focar(alvo, { rolar: false });
        }
      };

      // Escolher um destino fecha o Guia mesmo quando a rota não muda.
      painel.addEventListener('click', (evento) => {
        const link = evento.target.closest('a[href^="#/"]');
        if (link) fechar(link.getAttribute('href') === location.hash ? undefined : { semFoco: true });
      });

      painel.append(
        h('div', { class: 'guia-topo' }, h('p', { class: 'guia-marca', text: t('guia.titulo') }), h('button', { type: 'button', class: 'botao guia-fechar', 'aria-label': t('guia.fechar'), 'data-foco-pular': true, onClick: () => fechar() }, icone('fechar', 16))),
        abas,
        titulo,
        corpo,
        h('p', { class: 'guia-rodape nota', text: t('guia.rodape') }),
      );
      desenhar();
      const selecionada = abas.querySelector('[aria-selected="true"]');
      if (selecionada) selecionada.setAttribute('data-foco-inicial', '');

      const redesenhar = () => {
        const ativo = document.activeElement;
        desenhar(ativo && painel.contains(ativo) ? ativo.dataset.chave || 'guia:aba:' + abaAtual : null);
      };
      limpezas.push(notificacoes.aoMudar(redesenhar), prefs.aoMudar((_, mudou) => (mudou.includes('idioma') || mudou.includes('audio')) && redesenhar()), historico.aoMudar(redesenhar));
    },
  });
}
