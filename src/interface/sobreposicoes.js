// Pilha de sobreposições: tela → Guia/busca → menu contextual → confirmação.
// Só a camada do topo recebe interação (as de baixo ficam `inert`); Esc/B
// fecha apenas a do topo; ao fechar, o foco volta ao gatilho se ele existir.

import { h, icone, anexar } from './dom.js';
import { t } from '../servicos/i18n.js';
import { foco } from '../entrada/foco.js';
import { audio } from '../servicos/audio.js';
import { prefs } from '../servicos/preferencias.js';

const pilha = [];
let recipiente = null;
let app = null;

function abaixoDe(indice) {
  return indice > 0 ? pilha[indice - 1].elemento : app;
}

function prenderTab(evento, painel) {
  if (evento.key !== 'Tab') return;
  const itens = [...painel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')].filter(
    (el) => el.getClientRects().length > 0,
  );
  if (!itens.length) {
    evento.preventDefault();
    return;
  }
  const primeiro = itens[0];
  const ultimo = itens[itens.length - 1];
  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  }
}

export const sobreposicoes = {
  iniciar(elementoApp, elementoCamadas) {
    app = elementoApp;
    recipiente = elementoCamadas;
    foco.definirEscopo(() => (pilha.length ? pilha[pilha.length - 1].painel : app));
  },
  /**
   * Abre uma camada.
   * @param {object} opcoes
   * @param {string} opcoes.tipo       classe visual: 'guia' | 'busca' | 'menu' | 'dialogo' | 'galeria' | 'jogo'
   * @param {string} opcoes.rotulo     nome acessível do diálogo
   * @param {(painel:HTMLElement, fechar:Function)=>void} opcoes.montar
   * @param {Function} [opcoes.aoFechar]
   * @param {boolean} [opcoes.fecharFora=true]  clique no fundo fecha
   * @param {()=>boolean} [opcoes.podeFechar]   Esc/B/clique fora respeitam
   * @param {HTMLElement} [opcoes.gatilho]
   */
  abrir(opcoes) {
    const gatilho = opcoes.gatilho || document.activeElement;
    const painel = h('div', { class: 'camada-painel', role: 'dialog', 'aria-modal': 'true', 'aria-label': opcoes.rotulo, tabindex: '-1' });
    const fundoCamada = h('div', { class: 'camada-fundo' });
    const elemento = h('div', { class: 'camada camada-' + opcoes.tipo }, fundoCamada, painel);
    const camada = { ...opcoes, elemento, painel, gatilho, fechada: false };

    const fechar = (resultado) => {
      if (camada.fechada) return;
      camada.fechada = true;
      const indice = pilha.indexOf(camada);
      // Fecha também o que estiver acima desta camada.
      while (pilha.length > indice + 1) pilha[pilha.length - 1].fechar();
      pilha.splice(indice, 1);
      abaixoDe(indice).inert = false;
      elemento.classList.add('saindo');
      elemento.inert = true;
      window.setTimeout(() => elemento.remove(), prefs.movimentoReduzido() ? 0 : 220);
      if (opcoes.aoFechar) opcoes.aoFechar(resultado);
      if (resultado && resultado.semFoco) return;
      if (gatilho && gatilho.isConnected && !gatilho.closest('[inert]') && gatilho !== document.body) {
        foco.focar(gatilho);
      } else {
        const escopo = foco.escopo();
        const alternativa = escopo.querySelector('[data-foco-inicial]') || escopo.querySelector('#tela') || foco.primeiro(escopo);
        if (alternativa) foco.focar(alternativa);
      }
    };
    camada.fechar = fechar;
    camada.tentarFechar = () => {
      if (opcoes.podeFechar && !opcoes.podeFechar()) return false;
      audio.tocar('voltar');
      fechar();
      return true;
    };

    fundoCamada.addEventListener('click', () => {
      if (opcoes.fecharFora !== false) camada.tentarFechar();
    });
    painel.addEventListener('keydown', (evento) => prenderTab(evento, painel));

    abaixoDe(pilha.length).inert = true;
    pilha.push(camada);
    recipiente.append(elemento);
    opcoes.montar(painel, fechar);
    audio.tocar('abrir');
    // Força o estilo inicial e só então liga a transição (sem depender de rAF,
    // que o navegador suspende em janelas fora de vista).
    void elemento.offsetWidth;
    elemento.classList.add('aberta');
    const inicial = painel.querySelector('[data-foco-inicial]') || foco.primeiro(painel) || painel;
    foco.focar(inicial, { rolar: false });
    return camada;
  },
  /** Fecha a camada do topo (Esc/B). Devolve true se havia camada. */
  fecharTopo() {
    if (!pilha.length) return false;
    pilha[pilha.length - 1].tentarFechar();
    return true;
  },
  fecharTodas() {
    while (pilha.length) pilha[0].fechar({ semFoco: true });
  },
  topo() {
    return pilha[pilha.length - 1] || null;
  },
  aberta(tipo) {
    return tipo ? pilha.some((camada) => camada.tipo === tipo) : pilha.length > 0;
  },

  /**
   * Diálogo de confirmação. Resolve com o `valor` da ação escolhida, ou
   * null se o visitante fechar (Esc, B ou clique fora).
   */
  confirmar({ titulo, texto, acoes: lista }) {
    return new Promise((resolve) => {
      let resposta = null;
      this.abrir({
        tipo: 'dialogo',
        rotulo: titulo,
        aoFechar: () => resolve(resposta),
        montar(painel, fechar) {
          painel.setAttribute('role', 'alertdialog');
          anexar(painel, [
            h('h2', { class: 'dialogo-titulo', text: titulo }),
            texto ? h('p', { class: 'dialogo-texto', text: texto }) : null,
            h(
              'div',
              { class: 'dialogo-acoes', 'data-regiao': 'dialogo' },
              lista.map((acao, indice) =>
                h('button', {
                  type: 'button',
                  class: 'botao' + (acao.perigo ? ' botao-perigo' : acao.principal ? ' botao-principal' : ''),
                  text: acao.rotulo,
                  'data-foco-inicial': indice === lista.length - 1 ? true : null,
                  onClick: () => {
                    resposta = acao.valor;
                    fechar();
                  },
                }),
              ),
            ),
          ]);
        },
      });
    });
  },

  /**
   * Menu contextual. `itens`: [{ rotulo, icone, acao, marcado, url }].
   * Item com `url` vira link de verdade (abre mesmo com popup bloqueado).
   */
  menu(titulo, itens, gatilho) {
    this.abrir({
      tipo: 'menu',
      rotulo: titulo,
      gatilho,
      montar(painel, fechar) {
        painel.append(
          h('h2', { class: 'menu-titulo', text: titulo }),
          h(
            'ul',
            { class: 'menu-lista', role: 'menu', 'data-regiao': 'menu' },
            itens.map((item) => {
              const conteudo = [icone(item.icone || 'direita', 18), h('span', { text: item.rotulo }), item.marcado ? icone('certo', 16) : null];
              const el = item.url
                ? h('a', { class: 'menu-item', role: 'menuitem', href: item.url, target: '_blank', rel: 'noopener noreferrer', onClick: () => fechar({ semFoco: false }) }, conteudo)
                : h(
                    'button',
                    {
                      type: 'button',
                      class: 'menu-item',
                      role: item.marcado === undefined ? 'menuitem' : 'menuitemcheckbox',
                      'aria-checked': item.marcado === undefined ? null : String(Boolean(item.marcado)),
                      onClick: () => {
                        fechar();
                        item.acao();
                      },
                    },
                    conteudo,
                  );
              return h('li', { role: 'none' }, el);
            }),
          ),
          h('button', { type: 'button', class: 'botao menu-fechar', text: t('comum.fechar'), onClick: () => fechar() }),
        );
      },
    });
  },
};
