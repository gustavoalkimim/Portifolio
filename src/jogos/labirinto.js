// Labirinto 2.5D: raycasting em Canvas 2D sobre uma grade (algoritmo DDA),
// com correção de perspectiva, colisão por raio do jogador, texturas
// procedurais próprias e sprites de chave com buffer de profundidade.
// Mapa, texturas e regras são originais deste portfólio.
//
// Células: '#' e '%' paredes (duas texturas), 'D' porta (abre com 1 chave),
// 'K' chave, 'E' saída (destrava com as 3 chaves), 'P' início, '.' vazio.

import { criarTela, criarLaco } from './comum.js';

const MAPA = [
  '################',
  '#P...#.....%..K#',
  '#.##.#.###.%.#.#',
  '#.#..#...#...#.#',
  '#.#.####.#####.#',
  '#.#......%.....#',
  '#.######.%.###.#',
  '#......#.%.#K#.#',
  '%%%%%%.#.#.#.#.#',
  '#K...%.#...#...#',
  '#.##.%.#####D###',
  '#.#..%.....#...#',
  '#.#.######.###.#',
  '#.#........#..E#',
  '#.##############',
  '#..............#',
  '################',
];
const TOTAL_CHAVES = 3;
const TEX = 32;
const RAIO = 0.22;
const GIRO = { baixa: 1.5, media: 2.3, alta: 3.2 }; // rad/s
const LIMITE = 240; // segundos, quando o limite está ligado

export const meta = {
  entrada: 'jogo',
  toque: 'direcional',
  opcoes: [
    { id: 'limite', rotulo: { pt: 'Limite de tempo', en: 'Time limit' }, padrao: 'livre', valores: [{ valor: 'livre', rotulo: { pt: 'Sem limite', en: 'No limit' } }, { valor: 'limite', rotulo: { pt: '4 minutos', en: '4 minutes' } }] },
    { id: 'sensibilidade', rotulo: { pt: 'Sensibilidade do giro', en: 'Turn sensitivity' }, padrao: 'media', valores: [{ valor: 'baixa', rotulo: { pt: 'Baixa', en: 'Low' } }, { valor: 'media', rotulo: { pt: 'Média', en: 'Medium' } }, { valor: 'alta', rotulo: { pt: 'Alta', en: 'High' } }] },
    { id: 'giro', rotulo: { pt: 'Eixo do giro', en: 'Turn axis' }, padrao: 'normal', valores: [{ valor: 'normal', rotulo: { pt: 'Normal', en: 'Normal' } }, { valor: 'invertido', rotulo: { pt: 'Invertido', en: 'Inverted' } }] },
    { id: 'campo', rotulo: { pt: 'Campo de visão', en: 'Field of view' }, padrao: '66', valores: [{ valor: '55', rotulo: { pt: 'Estreito', en: 'Narrow' } }, { valor: '66', rotulo: { pt: 'Médio', en: 'Medium' } }, { valor: '80', rotulo: { pt: 'Amplo', en: 'Wide' } }] },
    { id: 'qualidade', rotulo: { pt: 'Qualidade', en: 'Quality' }, padrao: 'alta', valores: [{ valor: 'alta', rotulo: { pt: 'Alta', en: 'High' } }, { valor: 'baixa', rotulo: { pt: 'Reduzida (aparelhos lentos)', en: 'Reduced (slow devices)' } }] },
    { id: 'minimapa', rotulo: { pt: 'Minimapa', en: 'Minimap' }, padrao: 'ligado', valores: [{ valor: 'ligado', rotulo: { pt: 'Ligado', en: 'On' } }, { valor: 'desligado', rotulo: { pt: 'Desligado', en: 'Off' } }] },
    { id: 'mouse', rotulo: { pt: 'Girar com o mouse', en: 'Turn with the mouse' }, padrao: 'desligado', valores: [{ valor: 'desligado', rotulo: { pt: 'Desligado', en: 'Off' } }, { valor: 'ligado', rotulo: { pt: 'Ligado (clique na tela)', en: 'On (click the screen)' } }] },
  ],
  variante: (opcoes) => opcoes.limite,
};

/** Confere que o mapa tem solução: chaves e saída alcançáveis. */
export function verificarMapa(mapa = MAPA) {
  let inicio = null;
  const alvos = [];
  mapa.forEach((linha, y) => [...linha].forEach((celula, x) => {
    if (celula === 'P') inicio = [x, y];
    if (celula === 'K' || celula === 'E') alvos.push({ celula, x, y });
  }));
  if (!inicio) return false;
  const alcance = (portaAberta) => {
    const vistos = new Set([inicio.join(',')]);
    const fila = [inicio];
    while (fila.length) {
      const [x, y] = fila.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        const celula = mapa[ny] && mapa[ny][nx];
        if (!celula || celula === '#' || celula === '%' || (celula === 'D' && !portaAberta)) continue;
        const chave = nx + ',' + ny;
        if (!vistos.has(chave)) {
          vistos.add(chave);
          if (celula !== 'E') fila.push([nx, ny]);
        }
      }
    }
    return vistos;
  };
  const semPorta = alcance(false);
  const comPorta = alcance(true);
  const chaves = alvos.filter((a) => a.celula === 'K');
  return chaves.length === TOTAL_CHAVES && chaves.some((c) => semPorta.has(c.x + ',' + c.y)) && alvos.every((a) => comPorta.has(a.x + ',' + a.y));
}

function textura(pintar) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TEX;
  pintar(canvas.getContext('2d'));
  return canvas;
}

function criarTexturas() {
  const tijolo = textura((c) => {
    c.fillStyle = '#7a4a32';
    c.fillRect(0, 0, TEX, TEX);
    c.fillStyle = '#3d251a';
    for (let y = 0; y < TEX; y += 8) {
      c.fillRect(0, y, TEX, 1);
      for (let x = (y / 8) % 2 ? 8 : 0; x < TEX; x += 16) c.fillRect(x, y, 1, 8);
    }
    c.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 40; i += 1) c.fillRect((i * 13) % TEX, (i * 7) % TEX, 1, 1);
  });
  const pedra = textura((c) => {
    c.fillStyle = '#4c5563';
    c.fillRect(0, 0, TEX, TEX);
    c.fillStyle = '#2b313b';
    c.fillRect(0, 0, TEX, 1);
    c.fillRect(0, 16, TEX, 1);
    c.fillRect(0, 0, 1, 16);
    c.fillRect(16, 16, 1, 16);
    c.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 50; i += 1) c.fillRect((i * 11) % TEX, (i * 5 + 3) % TEX, 1, 1);
  });
  const porta = textura((c) => {
    c.fillStyle = '#5c3b1e';
    c.fillRect(0, 0, TEX, TEX);
    c.fillStyle = '#2f1d0e';
    for (let x = 0; x < TEX; x += 8) c.fillRect(x, 0, 1, TEX);
    c.fillStyle = '#c9a227';
    c.fillRect(0, 4, TEX, 2);
    c.fillRect(0, 26, TEX, 2);
    c.fillRect(22, 14, 5, 5);
  });
  const saida = (aberta) => textura((c) => {
    c.fillStyle = aberta ? '#0f5132' : '#3b3f47';
    c.fillRect(0, 0, TEX, TEX);
    c.fillStyle = aberta ? '#4ade80' : '#8a909c';
    for (let i = -TEX; i < TEX; i += 8) {
      c.beginPath();
      c.moveTo(i, TEX);
      c.lineTo(i + TEX, 0);
      c.lineTo(i + TEX + 3, 0);
      c.lineTo(i + 3, TEX);
      c.fill();
    }
    c.fillRect(0, 0, TEX, 2);
    c.fillRect(0, TEX - 2, TEX, 2);
  });
  const chave = textura((c) => {
    c.strokeStyle = '#ffd43b';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(11, 16, 6, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = '#ffd43b';
    c.fillRect(17, 15, 12, 3);
    c.fillRect(23, 18, 3, 5);
    c.fillRect(27, 18, 2, 4);
  });
  return { '#': tijolo, '%': pedra, D: porta, saidaFechada: saida(false), saidaAberta: saida(true), chave };
}

export function criar(contexto) {
  const { area, opcoes, t } = contexto;
  if (!verificarMapa()) throw new Error('Mapa do labirinto sem solução');
  const baixa = opcoes.qualidade === 'baixa';
  const L = baixa ? 160 : 320;
  const A = baixa ? 100 : 200;
  const tela = criarTela(area, L, A, { pixelado: true, rotulo: t('labirinto.rotulo') });
  const { ctx, canvas } = tela;
  ctx.imageSmoothingEnabled = false;
  const texturas = criarTexturas();
  const plano = Math.tan(((Number(opcoes.campo) || 66) * Math.PI) / 360); // metade do campo de visão
  const giro = (GIRO[opcoes.sensibilidade] || GIRO.media) * (opcoes.giro === 'invertido' ? -1 : 1);
  const comLimite = opcoes.limite === 'limite';
  const profundidade = new Float32Array(L);
  const teclas = { cima: false, baixo: false, esquerda: false, direita: false };

  let grade;
  let chavesNoMapa;
  let jogador;
  let chaves;
  let tempo;
  let encerrado = false;
  let ultimoAviso = 0;
  let segundoNoHud = -1;

  const solida = (x, y) => {
    const celula = grade[Math.floor(y)] && grade[Math.floor(y)][Math.floor(x)];
    return celula === undefined || celula === '#' || celula === '%' || celula === 'D' || celula === 'E';
  };

  function avisar(chaveTexto) {
    if (tempo - ultimoAviso < 2.5 && ultimoAviso > 0) return; // sem repetir o mesmo aviso
    ultimoAviso = tempo || 0.01;
    contexto.anunciar(t(chaveTexto));
    mensagem = { texto: t(chaveTexto), ate: tempo + 2.5 };
  }
  let mensagem = null;

  function atualizarHud() {
    contexto.hud([
      { rotulo: t('labirinto.chaves'), valor: chaves + '/' + TOTAL_CHAVES },
      { rotulo: t('jogo.hud.tempo'), valor: Math.floor(tempo / 60) + ':' + String(Math.floor(tempo % 60)).padStart(2, '0') + (comLimite ? ' / 4:00' : '') },
      { rotulo: t('labirinto.objetivo'), valor: t(chaves >= TOTAL_CHAVES ? 'labirinto.irSaida' : 'labirinto.acharChaves') },
    ]);
  }

  function encerrar(vitoria) {
    encerrado = true;
    laco.parar();
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    contexto.terminar({ vitoria, pontos: Math.round(tempo), resumo: t(vitoria ? 'labirinto.vitoria' : 'labirinto.derrota'), marcos: { 'labirinto-saida': vitoria ? 1 : 0 } });
  }

  // Ao bater em uma célula especial: abre a porta ou conclui a fase.
  function tocar(x, y) {
    const cx = Math.floor(x);
    const cy = Math.floor(y);
    const celula = grade[cy] && grade[cy][cx];
    if (celula === 'D') {
      if (chaves >= 1) {
        grade[cy][cx] = '.';
        contexto.som('abrir');
        avisar('labirinto.portaAberta');
      } else {
        avisar('labirinto.portaTrancada');
      }
    } else if (celula === 'E') {
      if (chaves >= TOTAL_CHAVES) encerrar(true);
      else avisar('labirinto.saidaTrancada');
    }
  }

  function mover(dx, dy) {
    // Eixos separados: desliza ao longo da parede em vez de travar.
    const nx = jogador.x + dx;
    const margemX = dx > 0 ? RAIO : -RAIO;
    if (!solida(nx + margemX, jogador.y - RAIO) && !solida(nx + margemX, jogador.y + RAIO)) jogador.x = nx;
    else tocar(nx + margemX, jogador.y);
    if (encerrado) return;
    const ny = jogador.y + dy;
    const margemY = dy > 0 ? RAIO : -RAIO;
    if (!solida(jogador.x - RAIO, ny + margemY) && !solida(jogador.x + RAIO, ny + margemY)) jogador.y = ny;
    else tocar(jogador.x, ny + margemY);
  }

  function atualizar(dt) {
    if (encerrado) return;
    tempo += dt;
    const girar = (teclas.direita ? 1 : 0) - (teclas.esquerda ? 1 : 0);
    jogador.a += girar * giro * dt;
    const andar = (teclas.cima ? 1 : 0) - (teclas.baixo ? 1 : 0);
    if (andar) {
      const passo = andar * 2.5 * dt;
      mover(Math.cos(jogador.a) * passo, Math.sin(jogador.a) * passo);
      if (encerrado) return;
    }
    for (const chave of chavesNoMapa) {
      if (!chave.pega && Math.hypot(chave.x - jogador.x, chave.y - jogador.y) < 0.5) {
        chave.pega = true;
        chaves += 1;
        contexto.som('ponto');
        ultimoAviso = 0;
        avisar(chaves >= TOTAL_CHAVES ? 'labirinto.todasChaves' : 'labirinto.chavePega');
        atualizarHud();
      }
    }
    if (Math.floor(tempo) !== segundoNoHud) {
      segundoNoHud = Math.floor(tempo);
      atualizarHud();
    }
    if (comLimite && tempo >= LIMITE) encerrar(false);
  }

  function desenhar() {
    // Teto e chão
    ctx.fillStyle = '#1b1f2a';
    ctx.fillRect(0, 0, L, A / 2);
    ctx.fillStyle = '#3a3128';
    ctx.fillRect(0, A / 2, L, A / 2);
    const dirX = Math.cos(jogador.a);
    const dirY = Math.sin(jogador.a);
    const planoX = -dirY * plano;
    const planoY = dirX * plano;

    for (let coluna = 0; coluna < L; coluna += 1) {
      const camera = (2 * coluna) / L - 1;
      const raioX = dirX + planoX * camera;
      const raioY = dirY + planoY * camera;
      let mapaX = Math.floor(jogador.x);
      let mapaY = Math.floor(jogador.y);
      const deltaX = Math.abs(1 / raioX);
      const deltaY = Math.abs(1 / raioY);
      const passoX = raioX < 0 ? -1 : 1;
      const passoY = raioY < 0 ? -1 : 1;
      let ladoX = raioX < 0 ? (jogador.x - mapaX) * deltaX : (mapaX + 1 - jogador.x) * deltaX;
      let ladoY = raioY < 0 ? (jogador.y - mapaY) * deltaY : (mapaY + 1 - jogador.y) * deltaY;
      let lado = 0;
      let celula = '.';
      // DDA: avança célula a célula até uma parede ou o limite do mapa.
      for (let i = 0; i < 64; i += 1) {
        if (ladoX < ladoY) {
          ladoX += deltaX;
          mapaX += passoX;
          lado = 0;
        } else {
          ladoY += deltaY;
          mapaY += passoY;
          lado = 1;
        }
        celula = grade[mapaY] ? grade[mapaY][mapaX] : '#';
        if (celula === undefined) celula = '#';
        if (celula === '#' || celula === '%' || celula === 'D' || celula === 'E') break;
      }
      // Distância perpendicular ao plano da câmera (sem efeito olho de peixe).
      const distancia = Math.max(0.05, lado === 0 ? ladoX - deltaX : ladoY - deltaY);
      profundidade[coluna] = distancia;
      const altura = Math.floor(A / distancia);
      const topo = Math.floor((A - altura) / 2);
      let ponto = lado === 0 ? jogador.y + distancia * raioY : jogador.x + distancia * raioX;
      ponto -= Math.floor(ponto);
      const texX = Math.min(TEX - 1, Math.floor(ponto * TEX));
      const imagem = celula === 'E' ? (chaves >= TOTAL_CHAVES ? texturas.saidaAberta : texturas.saidaFechada) : texturas[celula] || texturas['#'];
      ctx.drawImage(imagem, texX, 0, 1, TEX, coluna, topo, 1, altura);
      const sombra = Math.min(0.78, distancia / 11 + (lado ? 0.18 : 0));
      if (sombra > 0.02) {
        ctx.fillStyle = 'rgba(0,0,0,' + sombra.toFixed(3) + ')';
        ctx.fillRect(coluna, topo, 1, altura);
      }
    }

    // Sprites das chaves, do mais distante ao mais próximo.
    const visiveis = chavesNoMapa.filter((c) => !c.pega).map((c) => ({ c, d: (c.x - jogador.x) ** 2 + (c.y - jogador.y) ** 2 })).sort((a, b) => b.d - a.d);
    const inverso = 1 / (planoX * dirY - dirX * planoY);
    for (const { c } of visiveis) {
      const relX = c.x - jogador.x;
      const relY = c.y - jogador.y;
      const transfX = inverso * (dirY * relX - dirX * relY);
      const transfY = inverso * (-planoY * relX + planoX * relY);
      if (transfY <= 0.1) continue;
      const centro = Math.floor((L / 2) * (1 + transfX / transfY));
      const tamanho = Math.abs(Math.floor(A / transfY)) * 0.6;
      const inicioX = Math.floor(centro - tamanho / 2);
      const topoSprite = Math.floor(A / 2 + tamanho * 0.15);
      for (let x = Math.max(0, inicioX); x < Math.min(L, inicioX + tamanho); x += 1) {
        if (transfY >= profundidade[x]) continue; // atrás de uma parede
        const texX = Math.floor(((x - inicioX) / tamanho) * TEX);
        ctx.drawImage(texturas.chave, texX, 0, 1, TEX, x, topoSprite, 1, tamanho);
      }
    }

    // Mira simples
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(L / 2 - 1, A / 2 - 1, 2, 2);

    if (opcoes.minimapa !== 'desligado') {
      const e = baixa ? 2 : 3;
      const ox = L - grade[0].length * e - 3;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(ox - 1, 2, grade[0].length * e + 2, grade.length * e + 2);
      grade.forEach((linha, y) => linha.forEach((celula, x) => {
        if (celula === '.') return;
        ctx.fillStyle = celula === 'D' ? '#c9a227' : celula === 'E' ? '#4ade80' : '#9aa3b2';
        ctx.fillRect(ox + x * e, 3 + y * e, e, e);
      }));
      ctx.fillStyle = '#ffd43b';
      for (const c of chavesNoMapa) if (!c.pega) ctx.fillRect(ox + Math.floor(c.x * e) - 1, 3 + Math.floor(c.y * e) - 1, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + jogador.x * e - 1, 3 + jogador.y * e - 1, 2, 2);
      ctx.fillRect(ox + (jogador.x + Math.cos(jogador.a) * 0.9) * e - 0.5, 3 + (jogador.y + Math.sin(jogador.a) * 0.9) * e - 0.5, 1, 1);
    }

    if (mensagem && tempo < mensagem.ate) {
      ctx.font = (baixa ? 7 : 10) + 'px Geist, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const largura = ctx.measureText(mensagem.texto).width + 12;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(L / 2 - largura / 2, A - (baixa ? 16 : 24), largura, baixa ? 12 : 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(mensagem.texto, L / 2, A - (baixa ? 10 : 16));
    }
  }

  const laco = criarLaco(atualizar, desenhar);

  // Mouse opcional: só com a opção ligada e depois de um clique na tela.
  const aoClicar = () => {
    if (opcoes.mouse === 'ligado' && canvas.requestPointerLock && document.pointerLockElement !== canvas && !encerrado) {
      const pedido = canvas.requestPointerLock();
      if (pedido && pedido.catch) pedido.catch(() => {}); // negado: teclado e toque seguem valendo
    }
  };
  const aoMoverMouse = (evento) => {
    if (document.pointerLockElement === canvas && !encerrado) jogador.a += evento.movementX * 0.0025 * Math.sign(giro);
  };
  canvas.addEventListener('click', aoClicar);
  document.addEventListener('mousemove', aoMoverMouse);

  return {
    iniciar() {
      grade = MAPA.map((linha) => [...linha]);
      chavesNoMapa = [];
      grade.forEach((linha, y) => linha.forEach((celula, x) => {
        if (celula === 'K') {
          chavesNoMapa.push({ x: x + 0.5, y: y + 0.5, pega: false });
          linha[x] = '.';
        } else if (celula === 'P') {
          jogador = { x: x + 0.5, y: y + 0.5, a: 0 };
          linha[x] = '.';
        }
      }));
      chaves = 0;
      tempo = 0;
      ultimoAviso = 0;
      mensagem = null;
      encerrado = false;
      Object.keys(teclas).forEach((chave) => {
        teclas[chave] = false;
      });
      atualizarHud();
      desenhar();
      laco.iniciar();
    },
    pausar() {
      laco.parar();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    },
    retomar() {
      if (!encerrado) laco.iniciar();
    },
    destruir() {
      encerrado = true;
      laco.parar();
      canvas.removeEventListener('click', aoClicar);
      document.removeEventListener('mousemove', aoMoverMouse);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      canvas.remove();
    },
    entrada(nome, pressionado) {
      if (nome in teclas) teclas[nome] = pressionado;
    },
  };
}
