// Busca global: local, sem acentos, sem enviar nada a serviço externo.
// A consulta e o filtro ficam guardados enquanto a página estiver aberta,
// então reabrir a busca restaura o que estava digitado.

import { h, icone, anunciar } from './dom.js';
import { t } from '../servicos/i18n.js';
import { sobreposicoes } from './sobreposicoes.js';
import { buscar, catalogo } from '../servicos/catalogo.js';
import { historico } from '../servicos/historico.js';
import { segmentos } from './componentes.js';
import { foco } from '../entrada/foco.js';

const TIPOS = ['todos', 'projeto', 'jogo', 'experiencia', 'secao', 'configuracao'];
const ICONE = { projeto: 'pasta', jogo: 'controle', experiencia: 'trilha', secao: 'direita', configuracao: 'engrenagem' };
const estado = { consulta: '', tipo: 'todos' };

export function abrirBusca(gatilho) {
  if (sobreposicoes.aberta('busca')) return;
  let temporizador = 0;
  sobreposicoes.abrir({
    tipo: 'busca',
    rotulo: t('busca.titulo'),
    gatilho,
    aoFechar: () => window.clearTimeout(temporizador),
    montar(painel, fechar) {
      const resultados = h('div', { class: 'busca-resultados', 'data-regiao': 'busca-resultados' });
      const status = h('p', { class: 'nota busca-status', role: 'status' });
      const campo = h('input', {
        class: 'campo campo-grande', type: 'search', id: 'busca-campo', autocomplete: 'off', spellcheck: 'false',
        placeholder: t('busca.exemplo'), 'aria-label': t('busca.titulo'), 'data-foco-inicial': true, value: estado.consulta,
      });

      const item = (entrada) =>
        h('li', null, h('a', { class: 'linha-item', href: '#' + entrada.rota, 'data-chave': 'busca:' + entrada.chave },
          icone(ICONE[entrada.tipo] || 'direita', 18),
          h('span', { class: 'linha-texto' }, h('strong', { text: entrada.titulo }), h('span', { class: 'nota', text: t('tipo.' + entrada.tipo) + (entrada.trecho ? ' · ' + entrada.trecho : '') })),
        ));

      const desenhar = (anunciarTotal) => {
        const consulta = estado.consulta.trim();
        let lista;
        try {
          lista = buscar(consulta, estado.tipo);
        } catch (erro) {
          console.error(erro);
          status.textContent = t('busca.falha');
          resultados.replaceChildren(h('div', { class: 'acoes' }, h('button', { type: 'button', class: 'botao', text: t('comum.tentarNovamente'), onClick: () => desenhar(true) }), h('a', { class: 'botao', href: '#/biblioteca', text: t('nav.biblioteca') })));
          return;
        }
        if (!consulta) {
          // Sem texto: sugestões reais — recentes locais ou seções fixas.
          const recentes = historico.recentes().slice(0, 4).map((r) => catalogo.obter(r.chave)).filter(Boolean);
          const sugestoes = (recentes.length ? recentes : catalogo.listar().slice(0, 4)).filter((s) => estado.tipo === 'todos' || s.tipo === estado.tipo);
          status.textContent = t(recentes.length ? 'busca.sugestoesRecentes' : 'busca.sugestoes');
          resultados.replaceChildren(h('ul', { class: 'lista-cartoes' }, sugestoes.map((s) => item({ tipo: s.tipo, chave: s.chave, titulo: s.titulo(), trecho: s.resumo(), rota: s.rota }))));
          return;
        }
        if (!lista.length) {
          status.textContent = t('busca.nenhum', { termo: consulta });
          resultados.replaceChildren(
            h('p', { class: 'vazio', text: t('busca.nenhum.dica') }),
            h('div', { class: 'acoes' },
              estado.tipo !== 'todos' ? h('button', { type: 'button', class: 'botao', 'data-chave': 'busca:limpar-filtro', text: t('busca.limparFiltro'), onClick: () => { estado.tipo = 'todos'; desenharFiltros(); desenhar(true); foco.focar(campo, { rolar: false }); } }) : null,
              h('a', { class: 'botao', href: '#/biblioteca', text: t('nav.biblioteca') }),
            ),
          );
        } else {
          status.textContent = t(lista.length === 1 ? 'busca.um' : 'busca.varios', { n: lista.length });
          resultados.replaceChildren(h('ul', { class: 'lista-cartoes' }, lista.map(item)));
        }
        if (anunciarTotal) anunciar(status.textContent);
      };

      const filtros = h('div', { class: 'busca-filtros' });
      const desenharFiltros = () => {
        filtros.replaceChildren(segmentos({
          id: 'busca-tipo', rotulo: t('busca.filtro'), valor: estado.tipo,
          opcoes: TIPOS.map((tipo) => ({ valor: tipo, rotulo: t(tipo === 'todos' ? 'biblioteca.aba.todos' : 'tipo.' + tipo) })),
          aoEscolher: (valor) => { estado.tipo = valor; desenhar(true); },
        }));
      };

      campo.addEventListener('input', () => {
        estado.consulta = campo.value;
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(() => desenhar(true), 160); // não rouba o foco do campo
      });
      const botaoLimpar = h('button', { type: 'button', class: 'botao', 'data-chave': 'busca:limpar', 'aria-label': t('busca.limpar'), onClick: () => { estado.consulta = ''; campo.value = ''; desenhar(true); foco.focar(campo, { rolar: false }); } }, icone('fechar', 16), h('span', { text: t('busca.limpar') }));

      painel.append(
        h('div', { class: 'busca-topo', 'data-regiao': 'busca-topo' }, h('h2', { class: 'so-leitor', text: t('busca.titulo') }), icone('busca', 22), campo, botaoLimpar, h('button', { type: 'button', class: 'botao', 'aria-label': t('comum.fechar'), onClick: () => fechar() }, icone('fechar', 16))),
        filtros, status, resultados,
        h('p', { class: 'nota', text: t('busca.nota') }),
      );
      painel.addEventListener('click', (evento) => {
        const link = evento.target.closest('a[href^="#/"]');
        if (link) fechar(link.getAttribute('href') === location.hash ? undefined : { semFoco: true });
      });
      desenharFiltros();
      desenhar(false);
    },
  });
}
