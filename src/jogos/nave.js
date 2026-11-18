// Nave arcade. Cinco fases com padrões determinísticos (mesma semente por
// fase), limites de entidades, vidas e invulnerabilidade temporária
// sinalizada por um anel estável e por texto no HUD — sem piscar rápido.
// Regra de progressão: cada fase solta 10 + 4×fase obstáculos, mais rápidos
// e mais frequentes; a fase termina quando todos passaram ou foram
// destruídos. Sobreviver à fase 5 é vitória.

import { criarTela, criarLaco, aleatorio } from './comum.js';

const L = 360;
const A = 540;
const FASES = 5;
const MAX_TIROS = 12;
const MAX_OBSTACULOS = 30;
const DIFICULDADE = {
  facil: { vidas: 5, fator: 0.8 },
  normal: { vidas: 3, fator: 1 },
  dificil: { vidas: 2, fator: 1.25 },
};

export const meta = {
  entrada: 'jogo',
  toque: 'direcional+a',
  opcoes: [
    {
      id: 'dificuldade',
      rotulo: { pt: 'Dificuldade', en: 'Difficulty' },
      padrao: 'normal',
      valores: [
        { valor: 'facil', rotulo: { pt: 'Fácil', en: 'Easy' } },
        { valor: 'normal', rotulo: { pt: 'Normal', en: 'Normal' } },
        { valor: 'dificil', rotulo: { pt: 'Difícil', en: 'Hard' } },
      ],
    },
  ],
  variante: (opcoes) => opcoes.dificuldade,
};

export function criar(contexto) {
  const { area, opcoes, t } = contexto;
  const tela = criarTela(area, L, A, { rotulo: t('nave.rotulo') });
  const { ctx } = tela;
  const config = DIFICULDADE[opcoes.dificuldade] || DIFICULDADE.normal;
  const teclas = { cima: false, baixo: false, esquerda: false, direita: false, a: false };
  const estrelas = Array.from({ length: 40 }, (_, i) => {
    const sorteio = aleatorio(i + 1);
    return { x: sorteio() * L, y: sorteio() * A, r: 0.6 + sorteio() * 1.2 };
  });

  let nave;
  let tiros;
  let obstaculos;
  let pontos;
  let vidas;
  let fase;
  let faseMaxima;
  let soltos; // obstáculos já lançados na fase
  let cota;
  let proximo; // tempo até o próximo obstáculo
  let recarga;
  let escudo; // segundos de invulnerabilidade restantes
  let faixa; // segundos mostrando o título da fase
  let sorteio;
  let encerrado = false;
  let escudoNoHud = null;

  function atualizarHud() {
    contexto.hud([
      { rotulo: t('jogo.hud.pontos'), valor: pontos },
      { rotulo: t('nave.vidas'), valor: vidas },
      { rotulo: t('nave.fase'), valor: fase + '/' + FASES },
      { rotulo: t('nave.escudo'), valor: t(escudo > 0 ? 'nave.escudoAtivo' : 'nave.escudoInativo') },
    ]);
    escudoNoHud = escudo > 0;
  }

  function iniciarFase(numero) {
    fase = numero;
    faseMaxima = Math.max(faseMaxima, numero);
    soltos = 0;
    cota = 10 + 4 * numero;
    proximo = 1.2;
    faixa = 1.6;
    sorteio = aleatorio(numero * 7919); // padrão igual em toda partida
    contexto.anunciar(t('nave.faseAnuncio', { n: numero }));
    atualizarHud();
  }

  function encerrar(vitoria) {
    encerrado = true;
    laco.parar();
    desenhar();
    contexto.terminar({ vitoria, pontos, resumo: t(vitoria ? 'nave.vitoria' : 'nave.derrota', { n: fase }), marcos: { 'nave-fase-3': faseMaxima } });
  }

  function atualizar(dt) {
    if (encerrado) return;
    // Nave
    const velocidade = 230;
    nave.x += ((teclas.direita ? 1 : 0) - (teclas.esquerda ? 1 : 0)) * velocidade * dt;
    nave.y += ((teclas.baixo ? 1 : 0) - (teclas.cima ? 1 : 0)) * velocidade * dt;
    nave.x = Math.min(L - 16, Math.max(16, nave.x));
    nave.y = Math.min(A - 20, Math.max(A * 0.35, nave.y));
    // Tiros
    recarga -= dt;
    if (teclas.a && recarga <= 0 && tiros.length < MAX_TIROS) {
      tiros.push({ x: nave.x, y: nave.y - 18 });
      recarga = 0.22;
      contexto.som('tiro');
    }
    for (const tiro of tiros) tiro.y -= 430 * dt;
    tiros = tiros.filter((tiro) => tiro.y > -10);
    // Obstáculos
    if (faixa > 0) faixa -= dt;
    proximo -= dt;
    if (soltos < cota && proximo <= 0 && obstaculos.length < MAX_OBSTACULOS) {
      const raio = 12 + sorteio() * 12;
      obstaculos.push({
        x: raio + sorteio() * (L - 2 * raio),
        y: -raio,
        raio,
        vida: raio > 19 ? 2 : 1,
        vy: (70 + 26 * fase + sorteio() * 30) * config.fator,
        vx: (sorteio() - 0.5) * 30 * fase * 0.5,
        giro: sorteio() * Math.PI,
      });
      soltos += 1;
      proximo = Math.max(0.3, 1.05 - 0.13 * fase) / config.fator;
    }
    for (const o of obstaculos) {
      o.y += o.vy * dt;
      o.x += o.vx * dt;
      if (o.x < o.raio || o.x > L - o.raio) o.vx *= -1;
    }
    // Tiro × obstáculo
    for (const tiro of tiros) {
      for (const o of obstaculos) {
        if (o.vida > 0 && Math.abs(tiro.x - o.x) < o.raio && Math.abs(tiro.y - o.y) < o.raio) {
          o.vida -= 1;
          tiro.y = -100;
          if (o.vida <= 0) {
            pontos += 10;
            contexto.som('ponto');
            atualizarHud();
          }
          break;
        }
      }
    }
    // Nave × obstáculo
    if (escudo > 0) escudo -= dt;
    for (const o of obstaculos) {
      if (o.vida <= 0) continue;
      const dx = o.x - nave.x;
      const dy = o.y - nave.y;
      if (escudo <= 0 && dx * dx + dy * dy < (o.raio + 12) * (o.raio + 12)) {
        o.vida = 0;
        vidas -= 1;
        escudo = 2;
        contexto.som('dano');
        contexto.anunciar(t('nave.dano', { n: vidas }));
        atualizarHud();
        if (vidas <= 0) {
          encerrar(false);
          return;
        }
      }
    }
    obstaculos = obstaculos.filter((o) => o.vida > 0 && o.y < A + o.raio);
    tiros = tiros.filter((tiro) => tiro.y > -10);
    if (escudoNoHud !== escudo > 0) atualizarHud();
    // Fim de fase
    if (soltos >= cota && obstaculos.length === 0) {
      pontos += 100;
      if (fase >= FASES) {
        atualizarHud();
        encerrar(true);
      } else {
        iniciarFase(fase + 1);
      }
    }
  }

  function desenhar() {
    ctx.fillStyle = '#070b18';
    ctx.fillRect(0, 0, L, A);
    ctx.fillStyle = '#93a4c7';
    for (const e of estrelas) {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Obstáculos: polígonos irregulares, os resistentes têm contorno duplo.
    for (const o of obstaculos) {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(o.giro);
      ctx.beginPath();
      for (let i = 0; i < 7; i += 1) {
        const angulo = (i / 7) * Math.PI * 2;
        const r = o.raio * (i % 2 ? 0.78 : 1);
        ctx[i ? 'lineTo' : 'moveTo'](Math.cos(angulo) * r, Math.sin(angulo) * r);
      }
      ctx.closePath();
      ctx.fillStyle = '#5b6478';
      ctx.fill();
      ctx.lineWidth = o.vida > 1 ? 4 : 2;
      ctx.strokeStyle = o.vida > 1 ? '#ffd166' : '#c5cee0';
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#ffe066';
    for (const tiro of tiros) ctx.fillRect(tiro.x - 2, tiro.y - 8, 4, 12);
    // Nave
    ctx.save();
    ctx.translate(nave.x, nave.y);
    if (escudo > 0) {
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = '#e6edf7';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(14, 14);
    ctx.lineTo(0, 7);
    ctx.lineTo(-14, 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(-3, -4, 6, 8);
    ctx.restore();
    if (faixa > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, A / 2 - 30, L, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 24px Geist, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t('nave.faseAnuncio', { n: fase }), L / 2, A / 2);
    }
  }

  const laco = criarLaco(atualizar, desenhar);

  return {
    iniciar() {
      // Reinício começa limpo: nada de projéteis, obstáculos ou teclas presas.
      nave = { x: L / 2, y: A - 60 };
      tiros = [];
      obstaculos = [];
      pontos = 0;
      vidas = config.vidas;
      faseMaxima = 1;
      recarga = 0;
      escudo = 0;
      encerrado = false;
      Object.keys(teclas).forEach((chave) => {
        teclas[chave] = false;
      });
      iniciarFase(1);
      desenhar();
      laco.iniciar();
    },
    pausar() {
      laco.parar(); // congela relógio e entidades
    },
    retomar() {
      if (!encerrado) laco.iniciar();
    },
    destruir() {
      encerrado = true;
      laco.parar();
      tiros = [];
      obstaculos = [];
      tela.canvas.remove();
    },
    entrada(nome, pressionado) {
      if (nome in teclas) teclas[nome] = pressionado;
    },
  };
}
