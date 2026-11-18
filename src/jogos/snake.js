// Snake do código. Simulação em passos fixos (independe da taxa de quadros),
// fila de direção limitada a dois comandos e sem inversão de 180°.

import { criarTela, criarLaco, corDoTema } from './comum.js';

const COLUNAS = 16;
const LINHAS = 16;
const CELULA = 20;
const PASSO = { lenta: 0.19, normal: 0.135, rapida: 0.09 }; // segundos por passo
const VETOR = { cima: [0, -1], baixo: [0, 1], esquerda: [-1, 0], direita: [1, 0] };
const SIMBOLOS = ['{', ';', '<', '#', '=', '+', '/', '>'];

export const meta = {
  entrada: 'jogo',
  toque: 'direcional',
  opcoes: [
    {
      id: 'velocidade',
      rotulo: { pt: 'Velocidade', en: 'Speed' },
      padrao: 'normal',
      valores: [
        { valor: 'lenta', rotulo: { pt: 'Lenta', en: 'Slow' } },
        { valor: 'normal', rotulo: { pt: 'Normal', en: 'Normal' } },
        { valor: 'rapida', rotulo: { pt: 'Rápida', en: 'Fast' } },
      ],
    },
    {
      id: 'contraste',
      rotulo: { pt: 'Contraste da grade', en: 'Grid contrast' },
      padrao: 'normal',
      valores: [
        { valor: 'normal', rotulo: { pt: 'Normal', en: 'Normal' } },
        { valor: 'alto', rotulo: { pt: 'Alto', en: 'High' } },
      ],
    },
  ],
  variante: (opcoes) => opcoes.velocidade,
};

export function criar(contexto) {
  const { area, opcoes, t } = contexto;
  const tela = criarTela(area, COLUNAS * CELULA, LINHAS * CELULA, { rotulo: t('snake.rotulo') });
  const { ctx } = tela;
  const altoContraste = opcoes.contraste === 'alto';
  const cores = {
    fundo: altoContraste ? '#000000' : '#0c1611',
    grade: altoContraste ? '#3a3a3a' : '#14241b',
    cobra: altoContraste ? '#ffffff' : corDoTema('--realce', '#4ade80'),
    cabeca: altoContraste ? '#ffe600' : '#d9ffe6',
    comida: altoContraste ? '#00e5ff' : '#ffd166',
  };
  const intervalo = PASSO[opcoes.velocidade] || PASSO.normal;

  let cobra = [];
  let direcao = 'direita';
  let fila = [];
  let comida = null;
  let simbolo = 0;
  let pontos = 0;
  let acumulado = 0;
  let encerrado = false;

  function celulaLivre() {
    const ocupadas = new Set(cobra.map((parte) => parte.x + ',' + parte.y));
    const livres = [];
    for (let y = 0; y < LINHAS; y += 1) for (let x = 0; x < COLUNAS; x += 1) if (!ocupadas.has(x + ',' + y)) livres.push({ x, y });
    return livres.length ? livres[Math.floor(Math.random() * livres.length)] : null;
  }

  function atualizarHud() {
    contexto.hud([
      { rotulo: t('jogo.hud.pontos'), valor: pontos },
      { rotulo: t('snake.tamanho'), valor: cobra.length },
    ]);
  }

  function encerrar(vitoria) {
    encerrado = true;
    laco.parar();
    desenhar();
    contexto.terminar({ vitoria, pontos, resumo: t(vitoria ? 'snake.vitoria' : 'snake.derrota'), marcos: { 'snake-10': pontos } });
  }

  function passo() {
    if (fila.length) direcao = fila.shift();
    const [dx, dy] = VETOR[direcao];
    const cabeca = { x: cobra[0].x + dx, y: cobra[0].y + dy };
    const comeu = comida && cabeca.x === comida.x && cabeca.y === comida.y;
    // A cauda sai do lugar neste passo, a menos que a cobra cresça.
    const corpo = comeu ? cobra : cobra.slice(0, -1);
    const bateu = cabeca.x < 0 || cabeca.y < 0 || cabeca.x >= COLUNAS || cabeca.y >= LINHAS || corpo.some((parte) => parte.x === cabeca.x && parte.y === cabeca.y);
    if (bateu) {
      encerrar(false);
      return;
    }
    cobra.unshift(cabeca);
    if (comeu) {
      pontos += 1;
      contexto.som('ponto');
      comida = celulaLivre();
      simbolo = (simbolo + 1) % SIMBOLOS.length;
      atualizarHud();
      if (!comida) encerrar(true); // grade inteira preenchida
    } else {
      cobra.pop();
    }
  }

  function atualizar(dt) {
    if (encerrado) return;
    acumulado += dt;
    while (acumulado >= intervalo && !encerrado) {
      acumulado -= intervalo;
      passo();
    }
  }

  function desenhar() {
    ctx.fillStyle = cores.fundo;
    ctx.fillRect(0, 0, tela.largura, tela.altura);
    ctx.strokeStyle = cores.grade;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < COLUNAS; i += 1) {
      ctx.moveTo(i * CELULA + 0.5, 0);
      ctx.lineTo(i * CELULA + 0.5, tela.altura);
    }
    for (let i = 1; i < LINHAS; i += 1) {
      ctx.moveTo(0, i * CELULA + 0.5);
      ctx.lineTo(tela.largura, i * CELULA + 0.5);
    }
    ctx.stroke();
    if (comida) {
      ctx.fillStyle = cores.comida;
      ctx.font = 'bold 17px "Geist Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(SIMBOLOS[simbolo], comida.x * CELULA + CELULA / 2, comida.y * CELULA + CELULA / 2 + 1);
    }
    cobra.forEach((parte, indice) => {
      ctx.fillStyle = indice === 0 ? cores.cabeca : cores.cobra;
      ctx.beginPath();
      ctx.roundRect(parte.x * CELULA + 2, parte.y * CELULA + 2, CELULA - 4, CELULA - 4, 4);
      ctx.fill();
    });
  }

  const laco = criarLaco(atualizar, desenhar);

  return {
    iniciar() {
      cobra = [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }];
      direcao = 'direita';
      fila = []; // reinício não herda direção pendente
      pontos = 0;
      acumulado = 0;
      encerrado = false;
      simbolo = 0;
      comida = celulaLivre();
      atualizarHud();
      desenhar();
      laco.iniciar();
    },
    pausar() {
      laco.parar();
    },
    retomar() {
      if (!encerrado) laco.iniciar();
    },
    destruir() {
      encerrado = true;
      laco.parar();
      tela.canvas.remove();
    },
    entrada(nome, pressionado) {
      if (!pressionado || !VETOR[nome] || fila.length >= 2) return;
      const ultima = fila.length ? fila[fila.length - 1] : direcao;
      const [ax, ay] = VETOR[ultima];
      const [bx, by] = VETOR[nome];
      if (ax + bx === 0 && ay + by === 0) return; // inversão de 180°
      if (nome !== ultima) fila.push(nome);
    },
  };
}
