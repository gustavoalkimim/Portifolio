// Navegação espacial. O foco visual é sempre o foco DOM: mover é chamar
// focus() no elemento vizinho mais próximo na direção pedida.
// Regiões ([data-regiao]) guardam o último item válido; faixas horizontais
// ([data-eixo="x"]) não deixam esquerda/direita escapar para outra região.

import { prefs } from '../servicos/preferencias.js';

const SELETOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';
const ultimoPorRegiao = new WeakMap();
let obterEscopo = () => document.body;

function visivel(el) {
  if (el.hasAttribute('data-foco-pular')) return false;
  if (el.getAttribute('tabindex') === '-1') return false;
  if (el.closest('[inert], [hidden]')) return false;
  const caixa = el.getBoundingClientRect();
  return caixa.width > 0 && caixa.height > 0;
}

function focaveis(escopo) {
  return [...escopo.querySelectorAll(SELETOR)].filter(visivel);
}

function centro(caixa) {
  return { x: caixa.left + caixa.width / 2, y: caixa.top + caixa.height / 2 };
}

// Distância entre dois intervalos [a1,a2] e [b1,b2]; 0 quando se sobrepõem.
function vao(a1, a2, b1, b2) {
  if (b1 > a2) return b1 - a2;
  if (a1 > b2) return a1 - b2;
  return 0;
}

function dentroDaFaixa(el) {
  // Item de faixa horizontal que está rolado para fora não é candidato
  // quando se chega de outra região.
  const faixa = el.closest('[data-eixo="x"]');
  if (!faixa) return true;
  const caixaFaixa = faixa.getBoundingClientRect();
  const c = centro(el.getBoundingClientRect());
  return c.x >= caixaFaixa.left && c.x <= caixaFaixa.right;
}

function melhorCandidato(atual, candidatos, direcao) {
  const a = atual.getBoundingClientRect();
  const ca = centro(a);
  let melhor = null;
  let menor = Infinity;
  for (const el of candidatos) {
    if (el === atual) continue;
    const b = el.getBoundingClientRect();
    const cb = centro(b);
    let primario;
    let lateral;
    let desvio;
    if (direcao === 'esquerda' || direcao === 'direita') {
      if (direcao === 'direita' ? cb.x <= ca.x + 1 || b.left < a.left + 1 : cb.x >= ca.x - 1 || b.right > a.right - 1) continue;
      primario = direcao === 'direita' ? Math.max(0, b.left - a.right) : Math.max(0, a.left - b.right);
      lateral = vao(a.top, a.bottom, b.top, b.bottom);
      desvio = Math.abs(cb.y - ca.y);
    } else {
      if (direcao === 'baixo' ? cb.y <= ca.y + 1 || b.top < a.top + 1 : cb.y >= ca.y - 1 || b.bottom > a.bottom - 1) continue;
      primario = direcao === 'baixo' ? Math.max(0, b.top - a.bottom) : Math.max(0, a.top - b.bottom);
      lateral = vao(a.left, a.right, b.left, b.right);
      desvio = Math.abs(cb.x - ca.x);
    }
    const nota = primario + lateral * 3 + desvio * 0.05;
    if (nota < menor) {
      menor = nota;
      melhor = el;
    }
  }
  return melhor;
}

function trocarAba(aba, direcao) {
  const lista = aba.closest('[role="tablist"]');
  if (!lista) return false;
  const abas = [...lista.querySelectorAll('[role="tab"]')].filter((el) => !el.disabled);
  const indice = abas.indexOf(aba);
  const proxima = abas[indice + (direcao === 'direita' ? 1 : -1)];
  if (!proxima) return true; // fim da lista: fica onde está
  proxima.click();
  const nova = lista.querySelector('[role="tab"][aria-selected="true"]') || proxima;
  foco.focar(nova);
  return true;
}

function ajustarControle(el, direcao) {
  const passo = Number(el.step) || 1;
  const valor = Number(el.value) + (direcao === 'direita' ? passo : -passo);
  el.value = String(Math.min(Number(el.max || 100), Math.max(Number(el.min || 0), valor)));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

export const foco = {
  /** Define quem informa o escopo atual (sobreposição do topo ou o app). */
  definirEscopo(fn) {
    obterEscopo = fn;
  },
  escopo() {
    return obterEscopo() || document.body;
  },
  focar(el, { rolar = true } = {}) {
    if (!el || !el.isConnected) return false;
    el.focus({ preventScroll: true, focusVisible: true });
    if (rolar) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: prefs.movimentoReduzido() ? 'auto' : 'smooth' });
    }
    return document.activeElement === el;
  },
  primeiro(escopo = this.escopo()) {
    return focaveis(escopo)[0] || null;
  },
  /** Move o foco. Devolve true se houve mudança (ou ajuste de controle). */
  mover(direcao, veioDeTeclado = false) {
    const escopo = this.escopo();
    const atual = document.activeElement;
    if (!atual || atual === document.body || !escopo.contains(atual) || !visivel(atual)) {
      const inicial = escopo.querySelector('[data-foco-inicial]') || this.primeiro(escopo);
      return this.focar(inicial && visivel(inicial) ? inicial : this.primeiro(escopo));
    }
    const horizontal = direcao === 'esquerda' || direcao === 'direita';
    if (horizontal && atual.getAttribute('role') === 'tab') return trocarAba(atual, direcao);
    if (horizontal && atual.tagName === 'INPUT' && atual.type === 'range') {
      // No teclado o próprio navegador ajusta o controle deslizante.
      return veioDeTeclado ? false : ajustarControle(atual, direcao);
    }
    const regiao = atual.closest('[data-regiao]');
    let candidatos = focaveis(escopo);
    if (horizontal && regiao && regiao.dataset.eixo === 'x') {
      candidatos = candidatos.filter((el) => regiao.contains(el));
    } else {
      candidatos = candidatos.filter((el) => el.closest('[data-regiao]') === regiao || dentroDaFaixa(el));
    }
    const alvo = melhorCandidato(atual, candidatos, direcao);
    if (!alvo) return false; // sem candidato: não salta para lugar imprevisível
    return this.focar(alvo);
  },
  /** Último item focado de uma região, se ainda existir. */
  ultimoDa(regiao) {
    const el = ultimoPorRegiao.get(regiao);
    return el && el.isConnected && visivel(el) ? el : null;
  },
};

document.addEventListener('focusin', (evento) => {
  const regiao = evento.target.closest && evento.target.closest('[data-regiao]');
  if (regiao) ultimoPorRegiao.set(regiao, evento.target);
});
