// Memória de tecnologias. Cartas são botões de verdade: funcionam com Tab,
// setas, controle, toque e leitor de tela. Cada par tem forma e nome
// próprios (nunca só cor) e a carta fechada não revela nada no rótulo.

const SVG = 'http://www.w3.org/2000/svg';
// Formas autorais; os nomes são as tecnologias citadas nos projetos.
const SIMBOLOS = [
  { nome: 'HTML', forma: '<path d="M6 4h20l-2 22-8 3-8-3z"/>' },
  { nome: 'CSS', forma: '<rect x="5" y="5" width="22" height="22" rx="4"/><path d="M5 16h22"/>' },
  { nome: 'JavaScript', forma: '<path d="M16 3l12 7v12l-12 7-12-7V10z"/>' },
  { nome: 'Java', forma: '<path d="M7 14h16v6a8 8 0 0 1-16 0z"/><path d="M23 15h3a3 3 0 0 1 0 6h-3M12 4c2 2-2 4 0 6M18 4c2 2-2 4 0 6"/>' },
  { nome: 'React', forma: '<ellipse cx="16" cy="16" rx="13" ry="5"/><ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="13" ry="5" transform="rotate(120 16 16)"/>' },
  { nome: 'TypeScript', forma: '<rect x="4" y="4" width="24" height="24"/><path d="M10 12h10M15 12v12"/>' },
  { nome: 'MySQL', forma: '<ellipse cx="16" cy="8" rx="10" ry="4"/><path d="M6 8v16c0 2 4 4 10 4s10-2 10-4V8M6 16c0 2 4 4 10 4s10-2 10-4"/>' },
  { nome: 'C++', forma: '<path d="M14 8a8 8 0 1 0 0 16M17 16h6M20 13v6M24 16h6M27 13v6"/>' },
  { nome: 'Arduino', forma: '<circle cx="10" cy="16" r="6"/><circle cx="22" cy="16" r="6"/><path d="M7 16h6M19 16h6M22 13v6"/>' },
  { nome: 'Spring Boot', forma: '<path d="M6 26C6 12 14 6 27 5c0 13-6 20-17 20"/><path d="M6 26c3-6 8-10 14-13"/>' },
];
const TAMANHOS = { pequena: { pares: 6, colunas: 4 }, media: { pares: 8, colunas: 4 }, grande: { pares: 10, colunas: 5 } };
const ESPERA = 0.9; // segundos com o par errado à mostra

export const meta = {
  entrada: 'foco',
  toque: null,
  opcoes: [
    {
      id: 'tamanho',
      rotulo: { pt: 'Tamanho da grade', en: 'Grid size' },
      padrao: 'pequena',
      valores: [
        { valor: 'pequena', rotulo: { pt: '12 cartas', en: '12 cards' } },
        { valor: 'media', rotulo: { pt: '16 cartas', en: '16 cards' } },
        { valor: 'grande', rotulo: { pt: '20 cartas', en: '20 cards' } },
      ],
    },
    {
      id: 'tempo',
      rotulo: { pt: 'Temporizador', en: 'Timer' },
      padrao: 'desligado',
      valores: [
        { valor: 'desligado', rotulo: { pt: 'Sem tempo', en: 'No timer' } },
        { valor: 'ligado', rotulo: { pt: 'Mostrar tempo', en: 'Show time' } },
      ],
    },
  ],
  variante: (opcoes) => opcoes.tamanho,
};

function desenhoDe(simbolo) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = simbolo.forma; // constante do projeto
  return svg;
}

export function criar(contexto) {
  const { area, opcoes, t } = contexto;
  const config = TAMANHOS[opcoes.tamanho] || TAMANHOS.pequena;
  const comTempo = opcoes.tempo === 'ligado';
  const grade = document.createElement('div');
  grade.className = 'memoria-grade';
  grade.style.setProperty('--colunas', String(config.colunas));
  grade.style.setProperty('--prop', String(config.colunas / ((config.pares * 2) / config.colunas)));
  grade.setAttribute('role', 'group');
  grade.setAttribute('aria-label', t('memoria.rotulo'));
  grade.dataset.regiao = 'memoria';

  let cartas = [];
  let primeira = null;
  let bloqueado = false;
  let tentativas = 0;
  let pares = 0;
  let segundos = 0;
  let espera = null; // { restante, fn }: intervalo pausável
  let relogio = 0;
  let ultimoInstante = 0;
  let pausado = true;
  let encerrado = false;

  function rotular(carta) {
    const numero = carta.indice + 1;
    if (carta.achada) carta.el.setAttribute('aria-label', t('memoria.cartaPar', { n: numero, nome: carta.simbolo.nome }));
    else if (carta.aberta) carta.el.setAttribute('aria-label', t('memoria.cartaAberta', { n: numero, nome: carta.simbolo.nome }));
    else carta.el.setAttribute('aria-label', t('memoria.cartaFechada', { n: numero }));
  }

  function pintar(carta) {
    carta.el.classList.toggle('aberta', carta.aberta || carta.achada);
    carta.el.classList.toggle('achada', carta.achada);
    carta.el.setAttribute('aria-pressed', String(carta.aberta || carta.achada));
    if (carta.achada) carta.el.setAttribute('aria-disabled', 'true');
    if (carta.aberta || carta.achada) {
      const nome = document.createElement('span');
      nome.className = 'memoria-nome';
      nome.textContent = carta.simbolo.nome;
      carta.el.replaceChildren(desenhoDe(carta.simbolo), nome);
    } else {
      const verso = document.createElement('span');
      verso.className = 'memoria-verso';
      verso.textContent = '?';
      verso.setAttribute('aria-hidden', 'true');
      carta.el.replaceChildren(verso);
    }
    rotular(carta);
  }

  function atualizarHud() {
    const itens = [
      { rotulo: t('memoria.tentativas'), valor: tentativas },
      { rotulo: t('memoria.pares'), valor: pares + '/' + config.pares },
    ];
    if (comTempo) itens.push({ rotulo: t('jogo.hud.tempo'), valor: Math.floor(segundos / 60) + ':' + String(Math.floor(segundos % 60)).padStart(2, '0') });
    contexto.hud(itens);
  }

  function escolher(carta) {
    if (pausado || encerrado || bloqueado || carta.aberta || carta.achada) return; // terceira carta é ignorada
    carta.aberta = true;
    pintar(carta);
    contexto.som('virar');
    if (!primeira) {
      primeira = carta;
      contexto.anunciar(t('memoria.cartaAberta', { n: carta.indice + 1, nome: carta.simbolo.nome }));
      return;
    }
    tentativas += 1;
    const anterior = primeira;
    primeira = null;
    if (anterior.simbolo === carta.simbolo) {
      anterior.achada = carta.achada = true;
      anterior.aberta = carta.aberta = false;
      pintar(anterior);
      pintar(carta);
      pares += 1;
      contexto.som('ponto');
      contexto.anunciar(t('memoria.par', { nome: carta.simbolo.nome }));
      atualizarHud();
      if (pares === config.pares) {
        encerrado = true;
        window.clearInterval(relogio);
        relogio = 0;
        contexto.terminar({
          vitoria: true,
          pontos: tentativas,
          resumo: comTempo ? t('memoria.resumoTempo', { n: tentativas, tempo: Math.floor(segundos / 60) + ':' + String(Math.floor(segundos % 60)).padStart(2, '0') }) : t('memoria.resumo', { n: tentativas }),
          marcos: { 'memoria-completa': 1 },
        });
      }
      return;
    }
    bloqueado = true;
    contexto.anunciar(t('memoria.diferentes', { a: anterior.simbolo.nome, b: carta.simbolo.nome }));
    atualizarHud();
    espera = {
      restante: ESPERA,
      fn() {
        anterior.aberta = carta.aberta = false;
        pintar(anterior);
        pintar(carta);
        bloqueado = false;
      },
    };
  }

  function tique() {
    const agora = performance.now();
    const dt = Math.min(0.5, (agora - ultimoInstante) / 1000);
    ultimoInstante = agora;
    if (pausado || encerrado) return;
    segundos += dt;
    if (espera) {
      espera.restante -= dt;
      if (espera.restante <= 0) {
        const { fn } = espera;
        espera = null;
        fn();
      }
    }
    if (comTempo) atualizarHud();
  }

  function ligarRelogio() {
    if (relogio) return;
    ultimoInstante = performance.now();
    relogio = window.setInterval(tique, 100);
  }

  return {
    iniciar() {
      const usados = [...SIMBOLOS].sort(() => Math.random() - 0.5).slice(0, config.pares);
      const baralho = [...usados, ...usados];
      for (let i = baralho.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
      }
      cartas = baralho.map((simbolo, indice) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'memoria-carta';
        el.dataset.chave = 'carta:' + indice;
        if (indice === 0) el.setAttribute('data-foco-inicial', '');
        const carta = { indice, simbolo, el, aberta: false, achada: false };
        el.addEventListener('click', () => escolher(carta));
        pintar(carta);
        return carta;
      });
      grade.replaceChildren(...cartas.map((carta) => carta.el));
      area.append(grade);
      primeira = null;
      bloqueado = false;
      tentativas = pares = segundos = 0;
      espera = null;
      encerrado = false;
      pausado = false;
      atualizarHud();
      ligarRelogio();
    },
    pausar() {
      pausado = true; // congela tempo de jogo e a espera do par errado
      window.clearInterval(relogio);
      relogio = 0;
    },
    retomar() {
      if (encerrado) return;
      pausado = false;
      ligarRelogio();
    },
    destruir() {
      encerrado = true;
      pausado = true;
      window.clearInterval(relogio);
      relogio = 0;
      espera = null;
      grade.remove();
    },
    idioma() {
      cartas.forEach(rotular);
      grade.setAttribute('aria-label', t('memoria.rotulo'));
      atualizarHud();
    },
  };
}
