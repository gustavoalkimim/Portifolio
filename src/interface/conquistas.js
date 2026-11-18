// Conquistas: marcos verificáveis da trajetória (com fonte) separados das
// conquistas locais dos jogos, que valem só neste navegador e podem ser
// apagadas. O estado nunca depende só de cor: há texto e ícone.

import { h, icone } from './dom.js';
import { t, tx, formatarMes } from '../servicos/i18n.js';
import { perfil, FONTE_PERFIL } from '../dados/perfil.js';
import { projetos, FONTE_DATAS } from '../dados/projetos.js';
import { experiencias } from '../dados/experiencias.js';
import { conquistas, recordes } from '../servicos/recordes.js';
import { sobreposicoes } from './sobreposicoes.js';
import { cabecalhoTela } from './componentes.js';
import { periodoDe } from './experiencias.js';

export function montar(raiz, rota, ctx) {
  const marcos = [
    { quando: perfil.formacao.inicio + ' — ' + t('jornada.atual'), titulo: tx(perfil.formacao.curso) + ' — ' + perfil.formacao.instituicao, rota: '/perfil', fonte: tx(FONTE_PERFIL) },
    ...experiencias.map((e) => ({ quando: periodoDe(e), titulo: tx(e.atividade), rota: '/experiencias', fonte: tx(e.fonte) })),
    ...[...projetos].sort((a, b) => a.data.localeCompare(b.data)).map((p) => ({ quando: formatarMes(p.data), titulo: p.titulo + ' — ' + tx(p.estado), rota: '/projetos/' + p.id, fonte: tx(FONTE_DATAS) })),
  ];
  const locais = conquistas.listar();
  const desbloqueadas = locais.filter((c) => c.desbloqueada).length;

  const limpar = async () => {
    const ok = await sobreposicoes.confirmar({
      titulo: t('conquistas.limpar'),
      texto: t('conquistas.limpar.texto'),
      acoes: [
        { rotulo: t('comum.cancelar'), valor: false },
        { rotulo: t('conquistas.limpar'), valor: true, perigo: true },
      ],
    });
    if (ok) {
      conquistas.limpar();
      ctx.remontar();
    }
  };

  raiz.append(
    cabecalhoTela({ titulo: t('secao.conquistas'), subtitulo: t('conquistas.subtitulo') }),
    h(
      'section',
      { class: 'secao', 'aria-label': t('conquistas.marcos') },
      h('h2', { class: 'ficha-subtitulo', text: t('conquistas.marcos') }),
      h('p', { class: 'nota', text: t('conquistas.marcos.nota') }),
      h(
        'ul',
        { class: 'lista-cartoes', 'data-regiao': 'marcos' },
        marcos.map((m, i) =>
          h(
            'li',
            null,
            h(
              'a',
              { class: 'linha-item', href: '#' + m.rota, 'data-chave': 'marco:' + i, 'data-foco-inicial': i === 0 ? true : null },
              icone('certo', 18),
              h('span', { class: 'linha-texto' }, h('strong', { text: m.titulo }), h('span', { class: 'nota', text: m.quando + ' · ' + t('comum.fonte') + ': ' + m.fonte })),
            ),
          ),
        ),
      ),
    ),
    h(
      'section',
      { class: 'secao', 'aria-label': t('conquistas.locais') },
      h('h2', { class: 'ficha-subtitulo', text: t('conquistas.locais') }),
      h('p', { class: 'nota', text: t('conquistas.locais.nota', { n: desbloqueadas, total: locais.length }) }),
      h(
        'ul',
        { class: 'lista-cartoes', 'data-regiao': 'conquistas-locais' },
        locais.map((c) =>
          h(
            'li',
            null,
            h(
              'a',
              { class: 'linha-item' + (c.desbloqueada ? ' feita' : ''), href: '#' + (c.jogo ? '/jogos/' + c.jogo : '/biblioteca?tipo=jogo'), 'data-chave': 'conquista:' + c.id },
              icone(c.desbloqueada ? 'trofeu' : 'cadeado', 18),
              h(
                'span',
                { class: 'linha-texto' },
                h('strong', { text: tx(c.titulo) }),
                h('span', { class: 'nota', text: tx(c.condicao) }),
                h('span', { class: 'nota', text: t(c.desbloqueada ? 'conquistas.desbloqueada' : 'conquistas.bloqueada') + ' · ' + t('conquistas.progresso', { n: c.progresso, total: c.meta }) }),
              ),
            ),
          ),
        ),
      ),
      desbloqueadas || locais.some((c) => c.progresso > 0) ? h('div', { class: 'acoes' }, h('button', { type: 'button', class: 'botao', 'data-chave': 'conquistas:limpar', onClick: limpar }, icone('fechar', 16), h('span', { text: t('conquistas.limpar') }))) : null,
    ),
  );
  const parar = recordes.aoMudar(() => ctx.remontar());
  return { titulo: t('secao.conquistas'), fundo: 'ondas', destruir: parar };
}
