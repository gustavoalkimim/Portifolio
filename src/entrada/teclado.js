// Teclado → ações. Não intercepta teclas enquanto o visitante digita, nem
// durante composição de texto (IME).

import { acoes, ehCampoDeTexto } from './acoes.js';

const DIRECOES = { ArrowUp: 'cima', ArrowDown: 'baixo', ArrowLeft: 'esquerda', ArrowRight: 'direita' };

function aoPressionar(evento) {
  if (evento.isComposing || evento.defaultPrevented) return;
  acoes.definirMetodo('teclado');
  const alvo = evento.target;
  const digitando = ehCampoDeTexto(alvo);
  const comModificador = evento.ctrlKey || evento.metaKey || evento.altKey;

  if (evento.key === 'Escape') {
    if (acoes.emitir('voltar', { origem: 'teclado' })) evento.preventDefault();
    return;
  }
  if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k') {
    evento.preventDefault();
    acoes.emitir('busca', { origem: 'teclado' });
    return;
  }
  if (evento.key === 'ContextMenu' || (evento.shiftKey && evento.key === 'F10')) {
    if (!digitando && acoes.emitir('menu', { origem: 'teclado' })) evento.preventDefault();
    return;
  }
  const direcao = DIRECOES[evento.key];
  if (direcao && !comModificador) {
    // Em campo de uma linha, ↑/↓ saem do campo; ←/→ movem o cursor.
    if (digitando) {
      const umaLinha = alvo.tagName === 'INPUT';
      if (!umaLinha || direcao === 'esquerda' || direcao === 'direita') return;
    }
    if (acoes.emitir(direcao, { origem: 'teclado', repeticao: evento.repeat })) evento.preventDefault();
    return;
  }
  if (digitando || comModificador) return;
  if (evento.key === ' ' && alvo.tagName === 'A') {
    // Espaço ativa cartões que são links, como em um botão.
    evento.preventDefault();
    alvo.click();
    return;
  }
  const tecla = evento.key.length === 1 ? evento.key.toLowerCase() : evento.key;
  const atalho = { '/': 'busca', g: 'guia', m: 'menu', Backspace: 'voltar', p: 'pausar', '?': 'ajuda' }[tecla];
  if (atalho && acoes.emitir(atalho, { origem: 'teclado' })) evento.preventDefault();
}

export function iniciarTeclado() {
  document.addEventListener('keydown', aoPressionar);
}
