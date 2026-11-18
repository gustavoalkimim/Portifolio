// Perfil do titular. Todos os textos vêm do portfólio publicado
// (https://gustavoalkimim.github.io/Portifolio/). Nada aqui é inferido.

export const FONTE_PERFIL = {
  pt: 'Portfólio publicado e Figma do projeto',
  en: 'Published portfolio and project Figma',
};

export const perfil = Object.freeze({
  id: 'gustavo',
  nome: 'Gustavo Henrique Santos e Silva',
  nomeCurto: 'Gustavo Santos',
  foto: 'assets/images/gustavo.jpg',
  fotoFoco: 'center 62%',
  fotoAlt: {
    pt: 'Foto de Gustavo Henrique Santos e Silva',
    en: 'Photo of Gustavo Henrique Santos e Silva',
  },
  subtitulo: {
    pt: 'Estudante de Ciência da Computação — PUC Minas',
    en: 'Computer Science student — PUC Minas',
  },
  apresentacao: {
    pt: 'Olá! Sou Gustavo Henrique Santos e Silva, estudante do 2º período de Ciência da Computação na PUC Minas, em Belo Horizonte. Gosto de programar, de aprender coisas novas e de reunir, orientar e ajudar pessoas. Meu objetivo é aprender sem me limitar, atuar em uma big tech e, no futuro, fundar minha própria empresa.',
    en: 'Hi! I’m Gustavo Henrique Santos e Silva, a second-semester Computer Science student at PUC Minas in Belo Horizonte. I enjoy programming, learning new things, and bringing people together, guiding them and helping them. My goal is to keep learning without limiting myself, work at a big tech company and, in the future, start my own business.',
  },
  formacao: {
    inicio: '2026',
    instituicao: 'PUC Minas',
    curso: { pt: 'Ciência da Computação', en: 'Computer Science' },
    texto: {
      pt: 'Ciência da Computação — PUC Minas (2026–atual)',
      en: 'Computer Science — PUC Minas (2026–present)',
    },
  },
  interesses: {
    pt: 'Programação, liderança, empreendedorismo',
    en: 'Programming, leadership, entrepreneurship',
  },
  objetivos: {
    pt: 'Big tech e empresa própria',
    en: 'Big tech and my own business',
  },
  contatos: Object.freeze([
    {
      id: 'email',
      icone: 'email',
      url: 'mailto:gusalkimim@gmail.com',
      valor: 'gusalkimim@gmail.com',
      rotulo: { pt: 'E-mail', en: 'Email' },
      novaAba: false,
    },
    {
      id: 'whatsapp',
      icone: 'telefone',
      url: 'https://wa.me/5531982665639',
      valor: '+55 (31) 98266-5639',
      rotulo: { pt: 'WhatsApp', en: 'WhatsApp' },
      novaAba: true,
    },
    {
      id: 'linkedin',
      icone: 'linkedin',
      url: 'https://linkedin.com/in/gustavo-alkimim-73091b24a',
      valor: 'linkedin.com/in/gustavo-alkimim-73091b24a',
      rotulo: { pt: 'LinkedIn', en: 'LinkedIn' },
      novaAba: true,
    },
    {
      id: 'github',
      icone: 'github',
      url: 'https://github.com/gustavoalkimim',
      valor: 'github.com/gustavoalkimim',
      rotulo: { pt: 'GitHub', en: 'GitHub' },
      novaAba: true,
    },
  ]),
});
