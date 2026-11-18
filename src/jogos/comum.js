// Apoio comum aos jogos em Canvas 2D: tela com escala de pixels e laço de
// animação que para de verdade (nenhum quadro fica agendado após parar()).

/** Cria um canvas de resolução lógica fixa, ajustado ao espaço por CSS. */
export function criarTela(area, largura, altura, { pixelado = false, rotulo = '' } = {}) {
  const escala = pixelado ? 1 : Math.min(2, Math.max(1, Math.round(window.devicePixelRatio || 1)));
  const canvas = document.createElement('canvas');
  canvas.width = largura * escala;
  canvas.height = altura * escala;
  canvas.className = 'jogo-canvas' + (pixelado ? ' pixelado' : '');
  canvas.style.aspectRatio = largura + ' / ' + altura;
  canvas.style.setProperty('--prop', String(largura / altura));
  canvas.setAttribute('role', 'img');
  if (rotulo) canvas.setAttribute('aria-label', rotulo);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível');
  ctx.scale(escala, escala);
  area.append(canvas);
  return { canvas, ctx, largura, altura };
}

/**
 * Laço com requestAnimationFrame. `atualizar(dt)` recebe segundos (limitados
 * a 0,1 s para a simulação não saltar depois de uma aba em segundo plano).
 */
export function criarLaco(atualizar, desenhar) {
  let quadro = 0;
  let anterior = 0;
  function passo(agora) {
    quadro = requestAnimationFrame(passo);
    const dt = Math.min(0.1, (agora - anterior) / 1000);
    anterior = agora;
    atualizar(dt);
    desenhar();
  }
  return {
    iniciar() {
      if (quadro) return;
      anterior = performance.now();
      quadro = requestAnimationFrame(passo);
    },
    parar() {
      if (quadro) cancelAnimationFrame(quadro);
      quadro = 0;
    },
    ativo: () => quadro !== 0,
  };
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function aleatorio(semente) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lê uma cor (token CSS) do tema atual, com valor reserva. */
export function corDoTema(nome, reserva) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  return valor || reserva;
}
