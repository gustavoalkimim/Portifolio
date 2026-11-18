// Painéis gerais (seções e atalhos) e fundos padrão das telas.
// Um painel geral nunca referencia projeto e jogo ao mesmo tempo.

export const fundos = Object.freeze({
  aurora: { id: 'aurora', src: 'assets/images/fundos/aurora.svg', focoX: 50, focoY: 40, cor: '#07130d', nome: { pt: 'Aurora', en: 'Aurora' } },
  grade: { id: 'grade', src: 'assets/images/fundos/grade.svg', focoX: 50, focoY: 60, cor: '#0a0f1c', nome: { pt: 'Grade', en: 'Grid' } },
  ondas: { id: 'ondas', src: 'assets/images/fundos/ondas.svg', focoX: 50, focoY: 50, cor: '#150f1f', nome: { pt: 'Ondas', en: 'Waves' } },
  neutro: { id: 'neutro', src: null, cor: '#0b0f0d', nome: { pt: 'Cor sólida', en: 'Solid colour' } },
});

// Fundo padrão por tela. 'padrao' usa a arte escolhida nas configurações.
export const fundoDaTela = Object.freeze({
  inicio: 'padrao',
  vitrine: 'padrao',
  biblioteca: 'grade',
  perfil: 'ondas',
  experiencias: 'ondas',
  conquistas: 'ondas',
  capturas: 'grade',
  contato: 'padrao',
  configuracoes: 'neutro',
  ajuda: 'neutro',
  recuperacao: 'neutro',
});

export const secoes = Object.freeze([
  { id: 'projetos', icone: 'pasta', rota: '/biblioteca?tipo=projeto', chave: 'secao.projetos' },
  { id: 'perfil', icone: 'pessoa', rota: '/perfil', chave: 'secao.perfil' },
  { id: 'experiencias', icone: 'trilha', rota: '/experiencias', chave: 'secao.experiencias' },
  { id: 'contato', icone: 'email', rota: '/contato', chave: 'secao.contato' },
  { id: 'jogos', icone: 'controle', rota: '/biblioteca?tipo=jogo', chave: 'secao.jogos' },
  { id: 'vitrine', icone: 'vitrine', rota: '/vitrine', chave: 'secao.vitrine' },
  { id: 'conquistas', icone: 'trofeu', rota: '/conquistas', chave: 'secao.conquistas' },
  { id: 'capturas', icone: 'imagem', rota: '/capturas', chave: 'secao.capturas' },
  { id: 'ajuda', icone: 'ajuda', rota: '/ajuda', chave: 'secao.ajuda' },
  { id: 'configuracoes', icone: 'engrenagem', rota: '/configuracoes', chave: 'secao.configuracoes' },
]);

// Segunda linha da Home: destinos permanentes, sem depender de histórico.
export const atalhosHome = Object.freeze(['projetos', 'perfil', 'experiencias', 'contato', 'jogos', 'ajuda']);
