// Entrada unificada. Teclado, controle e toque emitem as mesmas ações; quem
// está no topo da pilha de consumidores decide o que fazer com cada uma.
// Ações: cima, baixo, esquerda, direita, confirmar, voltar, guia, busca,
// menu, abaAnterior, abaProxima, pausar.

const consumidores = [];
const ouvintesMetodo = new Set();
let metodo = 'mouse'; // 'mouse' | 'teclado' | 'toque' | 'controle'

export const acoes = {
  /**
   * Emite uma ação. `detalhe.pressionado` (padrão true) distingue apertar de
   * soltar; `detalhe.repeticao` marca repetição automática.
   */
  emitir(nome, detalhe = {}) {
    const evento = { nome, pressionado: detalhe.pressionado !== false, repeticao: Boolean(detalhe.repeticao), origem: detalhe.origem || metodo };
    for (let i = consumidores.length - 1; i >= 0; i -= 1) {
      if (consumidores[i](evento) !== false) return true;
    }
    return false;
  },
  /** Empilha um consumidor; devolver `false` passa a ação ao de baixo. */
  empilhar(fn) {
    consumidores.push(fn);
    return () => {
      const indice = consumidores.lastIndexOf(fn);
      if (indice >= 0) consumidores.splice(indice, 1);
    };
  },
  metodo() {
    return metodo;
  },
  definirMetodo(novo) {
    if (novo === metodo) return;
    metodo = novo;
    document.body.dataset.entrada = novo;
    [...ouvintesMetodo].forEach((fn) => fn(novo));
  },
  aoMudarMetodo(fn) {
    ouvintesMetodo.add(fn);
    return () => ouvintesMetodo.delete(fn);
  },
};

/** Campo em que o visitante digita: atalhos e setas não devem interferir. */
export function ehCampoDeTexto(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  if (el.tagName !== 'INPUT') return false;
  return !['button', 'checkbox', 'radio', 'range', 'submit', 'reset'].includes(el.type);
}
