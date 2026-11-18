// Jogos autorais do portfólio. Cada módulo é carregado sob demanda e exporta
// `meta` e `criar(contexto)`, que devolve { iniciar, pausar, retomar, destruir }.
// `versaoRegras` separa recordes de regras incompatíveis.

export const jogos = Object.freeze([
  {
    id: 'snake',
    nome: { pt: 'Snake do código', en: 'Code Snake' },
    genero: { pt: 'Arcade em grade', en: 'Grid arcade' },
    descricao: {
      pt: 'Conduza a cobra pela grade, colete símbolos de código e cresça sem bater nas bordas nem no próprio corpo.',
      en: 'Steer the snake across the grid, collect code symbols and grow without hitting the edges or your own body.',
    },
    objetivo: {
      pt: 'Colete o maior número de símbolos. Preencher a grade inteira é vitória.',
      en: 'Collect as many symbols as you can. Filling the whole grid is a win.',
    },
    controles: {
      teclado: { pt: 'Setas ou WASD mudam a direção. P ou Esc pausa.', en: 'Arrow keys or WASD change direction. P or Esc pauses.' },
      toque: { pt: 'Botões direcionais na tela. Botão Pausa no topo.', en: 'On-screen directional buttons. Pause button at the top.' },
      controle: { pt: 'Direcional ou analógico esquerdo. B ou Menu pausa.', en: 'D-pad or left stick. B or Menu pauses.' },
    },
    modulo: './snake.js',
    versaoRegras: 1,
    melhor: 'maior',
    unidade: 'pontos',
    capa: 'assets/images/jogos/snake.svg',
    cor: '#0f2417',
    disponivel: true,
  },
  {
    id: 'memoria',
    nome: { pt: 'Memória de tecnologias', en: 'Tech Memory' },
    genero: { pt: 'Jogo de memória', en: 'Memory game' },
    descricao: {
      pt: 'Encontre os pares de cartas com tecnologias citadas nos projetos. Cada carta tem símbolo e nome próprios, sem depender só de cor.',
      en: 'Find the pairs of cards showing technologies mentioned in the projects. Each card has its own symbol and name, never colour alone.',
    },
    objetivo: {
      pt: 'Revele todos os pares com o menor número de tentativas.',
      en: 'Reveal every pair in as few attempts as possible.',
    },
    aviso: {
      pt: 'As tecnologias das cartas ilustram o jogo; não comprovam habilidade profissional.',
      en: 'The technologies on the cards illustrate the game; they are not proof of professional skill.',
    },
    controles: {
      teclado: { pt: 'Setas movem entre as cartas. Enter ou Espaço vira. P ou Esc pausa.', en: 'Arrow keys move between cards. Enter or Space flips. P or Esc pauses.' },
      toque: { pt: 'Toque na carta para virar.', en: 'Tap a card to flip it.' },
      controle: { pt: 'Direcional move, A vira a carta. B ou Menu pausa.', en: 'D-pad moves, A flips the card. B or Menu pauses.' },
    },
    modulo: './memoria.js',
    versaoRegras: 1,
    melhor: 'menor',
    unidade: 'tentativas',
    capa: 'assets/images/jogos/memoria.svg',
    cor: '#1d1633',
    disponivel: true,
  },
  {
    id: 'nave',
    nome: { pt: 'Nave arcade', en: 'Arcade Ship' },
    genero: { pt: 'Tiro arcade', en: 'Arcade shooter' },
    descricao: {
      pt: 'Pilote a nave, desvie dos obstáculos e atire para abrir caminho por cinco fases cada vez mais rápidas.',
      en: 'Fly the ship, dodge obstacles and shoot your way through five increasingly fast stages.',
    },
    objetivo: {
      pt: 'Sobreviva às cinco fases. Você perde uma vida a cada colisão.',
      en: 'Survive all five stages. You lose a life on every collision.',
    },
    controles: {
      teclado: { pt: 'Setas ou WASD movem. Espaço atira. P ou Esc pausa.', en: 'Arrow keys or WASD move. Space fires. P or Esc pauses.' },
      toque: { pt: 'Botões direcionais movem e o botão Ação atira.', en: 'Directional buttons move and the Action button fires.' },
      controle: { pt: 'Direcional ou analógico move, A atira. B ou Menu pausa.', en: 'D-pad or stick moves, A fires. B or Menu pauses.' },
    },
    modulo: './nave.js',
    versaoRegras: 1,
    melhor: 'maior',
    unidade: 'pontos',
    capa: 'assets/images/jogos/nave.svg',
    cor: '#0d1a33',
    disponivel: true,
  },
  {
    id: 'labirinto',
    nome: { pt: 'Labirinto 2.5D', en: '2.5D Maze' },
    genero: { pt: 'Exploração em primeira pessoa', en: 'First-person exploration' },
    descricao: {
      pt: 'Explore um labirinto próprio desenhado por raycasting em Canvas 2D, a técnica dos jogos em primeira pessoa dos anos 90. Mapa, texturas e regras são originais.',
      en: 'Explore an original maze drawn by raycasting on a 2D canvas, the technique behind 90s first-person games. Map, textures and rules are original.',
    },
    objetivo: {
      pt: 'Colete as três chaves, passe pela porta e alcance a saída.',
      en: 'Collect the three keys, go through the door and reach the exit.',
    },
    controles: {
      teclado: { pt: 'W/S ou ↑/↓ andam, A/D ou ←/→ giram. Mouse opcional. P ou Esc pausa.', en: 'W/S or ↑/↓ walk, A/D or ←/→ turn. Optional mouse. P or Esc pauses.' },
      toque: { pt: 'Botões direcionais: frente, trás e giro.', en: 'Directional buttons: forward, back and turn.' },
      controle: { pt: 'Direcional ou analógico esquerdo anda e gira. B ou Menu pausa.', en: 'D-pad or left stick walks and turns. B or Menu pauses.' },
    },
    modulo: './labirinto.js',
    versaoRegras: 1,
    melhor: 'menor',
    unidade: 'tempo',
    capa: 'assets/images/jogos/labirinto.svg',
    cor: '#231a12',
    disponivel: true,
  },
]);

// Conquistas locais dos jogos. Não são conquistas profissionais.
export const conquistas = Object.freeze([
  {
    id: 'snake-10',
    jogo: 'snake',
    titulo: { pt: 'Dez símbolos', en: 'Ten symbols' },
    condicao: { pt: 'Faça 10 pontos em uma partida de Snake.', en: 'Score 10 points in a single Snake match.' },
    meta: 10,
  },
  {
    id: 'memoria-completa',
    jogo: 'memoria',
    titulo: { pt: 'Todos os pares', en: 'Every pair' },
    condicao: { pt: 'Conclua uma partida de Memória.', en: 'Finish a Memory match.' },
    meta: 1,
  },
  {
    id: 'nave-fase-3',
    jogo: 'nave',
    titulo: { pt: 'Terceira fase', en: 'Third stage' },
    condicao: { pt: 'Chegue à fase 3 da Nave arcade.', en: 'Reach stage 3 in Arcade Ship.' },
    meta: 3,
  },
  {
    id: 'labirinto-saida',
    jogo: 'labirinto',
    titulo: { pt: 'Saída encontrada', en: 'Exit found' },
    condicao: { pt: 'Alcance a saída do Labirinto 2.5D.', en: 'Reach the exit of the 2.5D Maze.' },
    meta: 1,
  },
  {
    id: 'quatro-jogos',
    jogo: null,
    titulo: { pt: 'Quatro jogos', en: 'Four games' },
    condicao: { pt: 'Termine ao menos uma partida de cada jogo.', en: 'Finish at least one match of every game.' },
    meta: 4,
  },
]);
