// Projetos do portfólio. Contrato: id estável, título, descrição PT/EN, data e
// estado com fonte, tecnologias, links tipados e mídias com origem e licença.
// As datas são os meses de apresentação registrados no Figma do portfólio
// original; não são as datas de criação dos repositórios.
// Campo sem fonte (por exemplo "papel") fica ausente e a interface o omite.

export const FONTE_DATAS = {
  pt: 'Mês de apresentação registrado no Figma do portfólio',
  en: 'Presentation month recorded in the portfolio Figma file',
};

export const projetos = Object.freeze([
  {
    id: 'fisiogrip',
    titulo: 'Fisiogrip',
    data: '2026-07',
    estado: { pt: 'Projeto em grupo', en: 'Group project' },
    descricao: {
      pt: 'Projeto em grupo de reabilitação da mão com luva Arduino, sensores e app Android. Sistema web para acompanhar sessões e ranking.',
      en: 'A group project for hand rehabilitation using an Arduino glove, sensors and an Android app. A web interface tracks sessions and rankings.',
    },
    observacao: {
      pt: 'A interface web do projeto utiliza dados simulados.',
      en: 'The project’s web interface uses simulated data.',
    },
    tecnologias: ['MIT App Inventor', 'Arduino', 'React', 'C++', 'MySQL'],
    links: [
      { id: 'fisiogrip-repo', tipo: 'repositorio', url: 'https://github.com/Mavilaa/Fisiogrip', visibilidade: 'publico' },
    ],
    midias: [
      {
        id: 'fisiogrip-1',
        caminho: 'assets/images/fisiogrip.jpeg',
        largura: 1600,
        altura: 842,
        alt: {
          pt: 'Tela inicial do sistema web FisioGrasp, do projeto Fisiogrip',
          en: 'Home screen of the FisioGrasp web interface from the Fisiogrip project',
        },
        descricao: {
          pt: 'Captura do repositório Fisiogrip (FisioGrasp). A interface web utiliza dados simulados.',
          en: 'Screenshot from the Fisiogrip (FisioGrasp) repository. The web interface uses simulated data.',
        },
        origem: { pt: 'Repositório Mavilaa/Fisiogrip', en: 'Mavilaa/Fisiogrip repository' },
        licenca: { pt: 'MIT — ver docs/licencas/LICENCA_FISIOGRIP.txt', en: 'MIT — see docs/licencas/LICENCA_FISIOGRIP.txt' },
      },
    ],
    fundo: { src: 'assets/images/fisiogrip.jpeg', focoX: 50, focoY: 30, cor: '#1b1730' },
  },
  {
    id: 'petvet',
    titulo: 'PetVet',
    data: '2026-09',
    estado: { pt: 'MVP em desenvolvimento', en: 'MVP in development' },
    descricao: {
      pt: 'MVP em desenvolvimento de carteirinha digital de saúde do pet para clínicas veterinárias. Lembretes são uma funcionalidade planejada.',
      en: 'An MVP in development for digital pet health records at veterinary clinics. Reminders are a planned feature.',
    },
    observacao: {
      pt: 'Os dados da tela são ilustrativos; os lembretes ainda estão em desenvolvimento.',
      en: 'Screen data is illustrative; reminders are still in development.',
    },
    tecnologias: ['Java', 'Spring Boot', 'MySQL', 'React', 'TypeScript'],
    links: [
      { id: 'petvet-repo', tipo: 'repositorio', url: 'https://github.com/gustavoalkimim/petvet', visibilidade: 'publico' },
    ],
    midias: [
      {
        id: 'petvet-1',
        caminho: 'assets/images/petvet.png',
        largura: 1160,
        altura: 531,
        alt: { pt: 'Interface do MVP PetVet em execução local', en: 'PetVet MVP interface running locally' },
        descricao: {
          pt: 'Interface real do MVP. Os dados da tela são ilustrativos; os lembretes ainda estão em desenvolvimento.',
          en: 'Actual MVP interface. Screen data is illustrative; reminders are still in development.',
        },
        origem: { pt: 'Captura do projeto em execução local', en: 'Screenshot of the project running locally' },
        licenca: { pt: 'Captura do titular do portfólio', en: 'Screenshot by the portfolio owner' },
      },
    ],
    fundo: { src: 'assets/images/petvet.png', focoX: 30, focoY: 40, cor: '#10202b' },
  },
  {
    id: 'hub',
    titulo: 'Hub de Estudos',
    data: '2026-09',
    estado: { pt: 'Protótipo navegável', en: 'Navigable prototype' },
    descricao: {
      pt: 'Protótipo navegável de hub do aluno com notas, frequência e calculadora de média.',
      en: 'A navigable student hub prototype with grades, attendance and a grade calculator.',
    },
    observacao: {
      pt: 'Os dados acadêmicos da demonstração são fictícios.',
      en: 'Academic data in this demonstration is fictional.',
    },
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    links: [
      { id: 'hub-repo', tipo: 'repositorio', url: 'https://github.com/gustavoalkimim/Projeto_HUB', visibilidade: 'privado' },
    ],
    midias: [
      {
        id: 'hub-1',
        caminho: 'assets/images/hub.png',
        largura: 1080,
        altura: 773,
        alt: { pt: 'Hub de Estudos em execução: notas e matérias', en: 'Study Hub running: grades and courses' },
        descricao: {
          pt: 'Captura do protótipo navegável. Os dados acadêmicos da demonstração são fictícios.',
          en: 'Screenshot of the navigable prototype. Academic data in this demonstration is fictional.',
        },
        origem: { pt: 'Captura do projeto em execução local', en: 'Screenshot of the project running locally' },
        licenca: { pt: 'Captura do titular do portfólio', en: 'Screenshot by the portfolio owner' },
      },
    ],
    fundo: { src: 'assets/images/hub.png', focoX: 50, focoY: 25, cor: '#141a24' },
  },
]);
