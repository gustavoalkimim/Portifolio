// Página de recuperação: rota inexistente, ID desconhecido ou falha ao
// montar uma tela. Sempre oferece uma saída que funciona.

import { h, icone } from './dom.js';
import { t } from '../servicos/i18n.js';
import { rotas } from '../servicos/rotas.js';

export function montar(raiz, rota) {
  const tipo = (rota.params && rota.params.tipo) || 'rota';
  const chave = { projeto: 'recuperacao.projeto', jogo: 'recuperacao.jogo', falha: 'recuperacao.falha' }[tipo] || 'recuperacao.rota';
  raiz.append(
    h(
      'section',
      { class: 'vazio-bloco recuperacao' },
      icone('alerta', 36),
      h('h1', { class: 'tela-titulo', id: 'titulo-da-tela', tabindex: '-1', text: t('recuperacao.titulo') }),
      h('p', { text: t(chave) }),
      tipo !== 'falha' ? h('p', { class: 'nota' }, t('recuperacao.endereco') + ' ', h('code', { text: rota.caminho })) : null,
      h(
        'div',
        { class: 'acoes', 'data-regiao': 'recuperacao' },
        h('a', { class: 'botao botao-principal', href: '#/inicio', 'data-foco-inicial': true }, icone('inicio', 18), h('span', { text: t('nav.inicio') })),
        h('a', { class: 'botao', href: '#/biblioteca' }, icone('biblioteca', 18), h('span', { text: t('nav.biblioteca') })),
        rotas.podeVoltar() ? h('button', { type: 'button', class: 'botao', onClick: () => history.back() }, icone('voltar', 18), h('span', { text: t('comum.voltar') })) : null,
        tipo === 'falha' ? h('button', { type: 'button', class: 'botao', onClick: () => location.reload() }, icone('reiniciar', 18), h('span', { text: t('comum.tentarNovamente') })) : null,
      ),
    ),
  );
  return { titulo: t('recuperacao.titulo'), fundo: 'neutro' };
}
