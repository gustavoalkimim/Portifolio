// Avisos flutuantes: aparecem na borda quando um evento real é registrado e
// somem após o tempo configurado. Os críticos ficam até o visitante fechar.
// O histórico completo fica na central de notificações do Guia.

import { h, icone } from './dom.js';
import { t } from '../servicos/i18n.js';
import { notificacoes } from '../servicos/notificacoes.js';
import { prefs } from '../servicos/preferencias.js';
import { audio } from '../servicos/audio.js';

const ICONE = { sucesso: 'certo', erro: 'alerta', info: 'sino', conquista: 'trofeu' };

export function textoDaNotificacao(item) {
  return t(item.chave, item.vars || undefined);
}

export function iniciarAvisos(recipiente) {
  notificacoes.aoRegistrar((item) => {
    const fechar = () => {
      window.clearTimeout(temporizador);
      el.classList.add('saindo');
      window.setTimeout(() => el.remove(), prefs.movimentoReduzido() ? 0 : 200);
    };
    const el = h(
      'div',
      { class: 'aviso aviso-' + item.tipo, role: item.tipo === 'erro' ? 'alert' : 'status' },
      icone(ICONE[item.tipo], 20),
      h('p', { class: 'aviso-texto', text: textoDaNotificacao(item) }),
      h('button', { type: 'button', class: 'aviso-fechar', 'aria-label': t('aviso.fechar'), 'data-foco-pular': true, onClick: fechar }, icone('fechar', 16)),
    );
    let temporizador = 0;
    if (!item.critico) temporizador = window.setTimeout(fechar, prefs.obter().duracaoAviso * 1000);
    recipiente.append(el);
    while (recipiente.children.length > 3) recipiente.firstElementChild.remove();
    audio.tocar(item.tipo === 'erro' ? 'erro' : 'abrir');
  });
}
