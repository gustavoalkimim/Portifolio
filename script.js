'use strict';

// Identificadores públicos do serviço de e-mail. O destinatário fica no template.
const EMAILJS = {
    serviceId: 'service_j8x2n98',
    templateId: 'template_zopdxbp',
    publicKey: 'DE3aJQUg4Su63Vq9E'
};

const TRADUCOES = {
  pt: {
    pageTitle: 'Gustavo Santos | Portfólio Profissional',
    pageDescription: 'Portfólio de Gustavo Henrique Santos e Silva, estudante de Ciência da Computação na PUC Minas. Projetos, trajetória e contato.',
    skip: 'Pular para o conteúdo', homeLabel: 'Gustavo Santos — início', navigation: 'Navegação principal',
    about: 'Sobre Mim', projects: 'Projetos', experience: 'Experiências', contact: 'Contato',
    openMenu: 'Abrir menu', closeMenu: 'Fechar menu',
    subtitle: 'Estudante de Ciência da Computação — PUC Minas',
    bio: 'Olá! Sou Gustavo Henrique Santos e Silva, estudante do 2º período de Ciência da Computação na PUC Minas, em Belo Horizonte. Gosto de programar, de aprender coisas novas e de reunir, orientar e ajudar pessoas. Meu objetivo é aprender sem me limitar, atuar em uma big tech e, no futuro, fundar minha própria empresa.',
    portraitPlaceholder: 'Espaço reservado para a foto de Gustavo', portraitAlt: 'Foto de Gustavo Henrique Santos e Silva',
    education: 'Formação', educationText: 'Ciência da Computação — PUC Minas (2026–atual)',
    interests: 'Interesses', interestsText: 'Programação, liderança, empreendedorismo',
    goals: 'Objetivos', goalsText: 'Big tech e empresa própria', portfolio: 'Portfólio', journey: 'Trajetória',
    experienceRole: 'Integração com Equipe — Startup Universitária',
    experienceInstitution: 'Startup fundada por veteranos — PUC Minas', experiencePeriod: '2026 — atual',
    experienceText: 'Participação em fase de integração e testes com o time de uma empresa criada e patrocinada por alunos veteranos do curso de Ciência da Computação da PUC Minas. Atuação em desenvolvimento, testes e colaboração com a equipe.',
    emailContact: 'E-mail: gusalkimim@gmail.com', linkedinContact: 'LinkedIn de Gustavo (abre em nova aba)',
    githubContact: 'GitHub de Gustavo (abre em nova aba)', whatsappContact: 'Conversar com Gustavo no WhatsApp (abre em nova aba)',
    whatsappPending: 'WhatsApp: link disponível após confirmar o número completo.',
    formTitle: 'Fale comigo', name: 'Nome', email: 'E-mail', message: 'Mensagem',
    namePlaceholder: 'Seu nome', emailPlaceholder: 'seu@email.com', messagePlaceholder: 'Deixe uma mensagem...',
    send: 'Enviar', sending: 'Enviando...',
    requiredName: 'Informe seu nome.', requiredEmail: 'Informe seu e-mail.', invalidEmail: 'Informe um e-mail válido, como nome@exemplo.com.',
    requiredMessage: 'Escreva uma mensagem.', tooLong: 'O texto ultrapassa o limite permitido.',
    invalidForm: 'Confira os campos indicados antes de enviar.',
    unconfigured: 'O envio pelo formulário ainda não está configurado. Sua mensagem não foi enviada. Entre em contato pelo e-mail ao lado.',
    success: 'Mensagem enviada! Obrigado pelo contato.',
    failed: 'Não foi possível enviar a mensagem. Os campos foram preservados. Tente novamente ou use o e-mail ao lado.',
    rateLimited: 'O serviço limitou os envios. Aguarde um pouco e tente novamente ou use o e-mail ao lado.',
    uncertain: 'Não foi possível confirmar o envio. Verifique sua conexão e, antes de reenviar, considere entrar em contato pelo e-mail ao lado.',
    githubButton: 'Ver no GitHub', newTab: 'abre em nova aba', imageMissing: 'Imagem do projeto a adicionar',
    repositoryMissing: 'Repositório ainda não informado.', enlarge: 'Abrir captura de',
    fisiogripDescription: 'Projeto em grupo de reabilitação da mão com luva Arduino, sensores e app Android. Sistema web para acompanhar sessões e ranking.',
    petvetDescription: 'MVP em desenvolvimento de carteirinha digital de saúde do pet para clínicas veterinárias. Lembretes são uma funcionalidade planejada.',
    hubDescription: 'Protótipo navegável de hub do aluno com notas, frequência e calculadora de média.',
    fisiogripCaption: 'Captura do repositório Fisiogrip (FisioGrasp). A interface web utiliza dados simulados.',
    petvetCaption: 'Interface real do MVP. Os dados da tela são ilustrativos; os lembretes ainda estão em desenvolvimento.',
    hubCaption: 'Captura do protótipo navegável. Os dados acadêmicos da demonstração são fictícios.',
    fisiogripAlt: 'Tela inicial do sistema web FisioGrasp, do projeto Fisiogrip', petvetAlt: 'Interface do MVP PetVet em execução local', hubAlt: 'Hub de Estudos em execução: notas e matérias',
    imageError: 'Não foi possível carregar a imagem do projeto.'
  },
  en: {
    pageTitle: 'Gustavo Santos | Professional Portfolio',
    pageDescription: 'Portfolio of Gustavo Henrique Santos e Silva, a Computer Science student at PUC Minas. Projects, experience and contact.',
    skip: 'Skip to content', homeLabel: 'Gustavo Santos — home', navigation: 'Main navigation',
    about: 'About Me', projects: 'Projects', experience: 'Experience', contact: 'Contact',
    openMenu: 'Open menu', closeMenu: 'Close menu',
    subtitle: 'Computer Science student — PUC Minas',
    bio: 'Hi! I’m Gustavo Henrique Santos e Silva, a second-semester Computer Science student at PUC Minas in Belo Horizonte. I enjoy programming, learning new things, and bringing people together, guiding them and helping them. My goal is to keep learning without limiting myself, work at a big tech company and, in the future, start my own business.',
    portraitPlaceholder: 'Reserved space for Gustavo’s photo', portraitAlt: 'Photo of Gustavo Henrique Santos e Silva',
    education: 'Education', educationText: 'Computer Science — PUC Minas (2026–present)',
    interests: 'Interests', interestsText: 'Programming, leadership, entrepreneurship',
    goals: 'Goals', goalsText: 'Big tech and my own business', portfolio: 'Portfolio', journey: 'Background',
    experienceRole: 'Team Integration — University Startup',
    experienceInstitution: 'Startup founded by senior students — PUC Minas', experiencePeriod: '2026 — present',
    experienceText: 'Taking part in onboarding and testing with the team of a company founded and sponsored by senior Computer Science students at PUC Minas. Working on development, testing and team collaboration.',
    emailContact: 'Email: gusalkimim@gmail.com', linkedinContact: 'Gustavo’s LinkedIn (opens in a new tab)',
    githubContact: 'Gustavo’s GitHub (opens in a new tab)', whatsappContact: 'Chat with Gustavo on WhatsApp (opens in a new tab)',
    whatsappPending: 'WhatsApp: the link will be available once the full number is confirmed.',
    formTitle: 'Get in touch', name: 'Name', email: 'Email', message: 'Message',
    namePlaceholder: 'Your name', emailPlaceholder: 'you@example.com', messagePlaceholder: 'Leave a message...',
    send: 'Send', sending: 'Sending...',
    requiredName: 'Enter your name.', requiredEmail: 'Enter your email.', invalidEmail: 'Enter a valid email, such as name@example.com.',
    requiredMessage: 'Write a message.', tooLong: 'The text exceeds the allowed limit.',
    invalidForm: 'Check the highlighted fields before sending.',
    unconfigured: 'Form delivery is not configured yet. Your message was not sent. Please use the email link beside the form.',
    success: 'Message sent! Thank you for getting in touch.',
    failed: 'The message could not be sent. Your fields have been preserved. Try again or use the email link beside the form.',
    rateLimited: 'The service has limited submissions. Wait a moment and try again, or use the email link beside the form.',
    uncertain: 'Delivery could not be confirmed. Check your connection and consider using the email link beside the form before submitting again.',
    githubButton: 'View on GitHub', newTab: 'opens in a new tab', imageMissing: 'Project image to be added',
    repositoryMissing: 'Repository not provided yet.', enlarge: 'Open screenshot of',
    fisiogripDescription: 'A group project for hand rehabilitation using an Arduino glove, sensors and an Android app. A web interface tracks sessions and rankings.',
    petvetDescription: 'An MVP in development for digital pet health records at veterinary clinics. Reminders are a planned feature.',
    hubDescription: 'A navigable student hub prototype with grades, attendance and a grade calculator.',
    fisiogripCaption: 'Screenshot from the Fisiogrip (FisioGrasp) repository. The web interface uses simulated data.',
    petvetCaption: 'Actual MVP interface. Screen data is illustrative; reminders are still in development.',
    hubCaption: 'Screenshot of the navigable prototype. Academic data in this demonstration is fictional.',
    fisiogripAlt: 'Home screen of the FisioGrasp web interface from the Fisiogrip project', petvetAlt: 'PetVet MVP interface running locally', hubAlt: 'Study Hub running: grades and courses',
    imageError: 'The project image could not be loaded.'
  }
};

// Datas de apresentação registradas no Figma.
const PROJETOS = [
    {
        id: 'fisiogrip', nome: 'Fisiogrip', data: '2026-07',
        tecnologias: ['MIT App Inventor', 'Arduino', 'React', 'C++', 'MySQL'],
        repositorio: 'https://github.com/Mavilaa/Fisiogrip',
        imagem: 'assets/images/fisiogrip.jpeg'
    },
    {
        id: 'petvet', nome: 'PetVet', data: '2026-09',
        tecnologias: ['Java', 'Spring Boot', 'MySQL', 'React', 'TypeScript'],
        repositorio: 'https://github.com/gustavoalkimim/petvet',
        imagem: 'assets/images/petvet.png'
    },
    {
        id: 'hub', nome: 'Hub de Estudos', data: '2026-09',
        tecnologias: ['HTML', 'CSS', 'JavaScript'],
        repositorio: 'https://github.com/gustavoalkimim/Projeto_HUB',
        imagem: 'assets/images/hub.png'
    }
];
PROJETOS.sort((a, b) => a.data.localeCompare(b.data));

let idioma = 'pt';
let enviando = false;
let textoRetorno = '';
let tipoRetorno = '';
const errosCampos = {};
const campos = ['nome', 'email', 'mensagem'];

try {
    if (localStorage.getItem('portfolio-language') === 'en') idioma = 'en';
} catch { /* A preferência é opcional. */ }

function buscar(seletor) {
    return document.querySelector(seletor);
}

function traduzir(chave) {
    return TRADUCOES[idioma][chave];
}

function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto) elemento.textContent = texto;
    return elemento;
}

function mostrarProjetos() {
    const lista = buscar('#lista-projetos');
    lista.replaceChildren();

    for (const projeto of PROJETOS) {
        const item = criar('li', 'item-projeto');
        item.dataset.projeto = projeto.id;
        item.dataset.data = projeto.data;

        const ponto = criar('img', 'ponto');
        ponto.src = 'assets/icons/frame.svg';
        ponto.alt = '';
        ponto.width = 24;
        ponto.height = 24;

        const artigo = criar('article', 'projeto card p-4');
        const figura = criar('figure', 'midia-projeto mb-3');
        const abrirImagem = criar('a', 'imagem-projeto');
        abrirImagem.href = projeto.imagem;
        abrirImagem.target = '_blank';
        abrirImagem.rel = 'noopener noreferrer';
        abrirImagem.setAttribute('aria-label', traduzir('enlarge') + ' ' + projeto.nome + ' (' + traduzir('newTab') + ')');

        const imagem = criar('img', 'img-fluid');
        imagem.src = projeto.imagem;
        imagem.alt = traduzir(projeto.id + 'Alt');
        imagem.loading = 'lazy';
        imagem.addEventListener('error', function () {
            abrirImagem.replaceWith(criar('p', 'aviso', traduzir('imageError')));
        }, { once: true });
        abrirImagem.append(imagem);
        figura.append(abrirImagem, criar('figcaption', 'small mt-2', traduzir(projeto.id + 'Caption')));

        const data = new Date(projeto.data + '-01T12:00:00Z');
        const mes = data.toLocaleDateString(idioma === 'pt' ? 'pt-BR' : 'en', { month: 'short', timeZone: 'UTC' }).replace('.', '');
        const periodo = criar('time', 'data-projeto small', mes + '/' + projeto.data.slice(0, 4));
        periodo.dateTime = projeto.data;
        const nome = criar('h3', 'h5 fw-bold mt-2', projeto.nome);
        const descricao = criar('p', 'descricao-projeto small', traduzir(projeto.id + 'Description'));
        const tecnologias = criar('ul', 'tecnologias d-flex flex-wrap gap-2 list-unstyled');
        for (const tecnologia of projeto.tecnologias) {
            tecnologias.append(criar('li', 'badge text-bg-light border fw-normal', tecnologia));
        }

        const github = criar('a', 'btn btn-primary d-inline-flex align-items-center gap-2 align-self-start');
        github.href = projeto.repositorio;
        github.target = '_blank';
        github.rel = 'noopener noreferrer';
        github.setAttribute('aria-label', traduzir('githubButton') + ': ' + projeto.nome + ' (' + traduzir('newTab') + ')');
        const icone = criar('img');
        icone.src = 'assets/icons/github.svg';
        icone.alt = '';
        icone.width = 16;
        icone.height = 16;
        github.append(icone, document.createTextNode(traduzir('githubButton')));

        artigo.append(figura, periodo, nome, descricao, tecnologias, github);
        item.append(ponto, artigo);
        lista.append(item);
    }
}

function mostrarRetorno(chave, tipo) {
    textoRetorno = chave;
    tipoRetorno = tipo;
    const retorno = buscar('#retorno-formulario');
    retorno.hidden = !chave;
    retorno.textContent = chave ? traduzir(chave) : '';
    retorno.dataset.estado = tipo;
}

function mostrarErro(id, chave) {
    errosCampos[id] = chave;
    buscar('#' + id).setAttribute('aria-invalid', chave ? 'true' : 'false');
    const erro = buscar('#' + id + '-erro');
    erro.textContent = chave ? traduzir(chave) : '';
    erro.hidden = !chave;
}

function atualizarIdioma() {
    document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : 'en';
    document.title = traduzir('pageTitle');
    buscar('meta[name="description"]').content = traduzir('pageDescription');
    document.querySelectorAll('[data-traducao]').forEach(function (elemento) {
        elemento.textContent = traduzir(elemento.dataset.traducao);
    });
    document.querySelectorAll('[data-rotulo]').forEach(function (elemento) {
        elemento.setAttribute('aria-label', traduzir(elemento.dataset.rotulo));
    });
    document.querySelectorAll('[data-exemplo]').forEach(function (elemento) {
        elemento.placeholder = traduzir(elemento.dataset.exemplo);
    });
    document.querySelectorAll('[data-descricao]').forEach(function (elemento) {
        elemento.alt = traduzir(elemento.dataset.descricao);
    });
    const botao = buscar('#trocar-idioma');
    botao.setAttribute('aria-label', idioma === 'pt' ? 'Switch to English' : 'Mudar para português');
    botao.title = botao.getAttribute('aria-label');
    buscar('#indicador-pt').classList.toggle('selecionado', idioma === 'pt');
    buscar('#indicador-en').classList.toggle('selecionado', idioma === 'en');
    buscar('#abrir-menu').setAttribute('aria-label', traduzir(buscar('#abrir-menu').getAttribute('aria-expanded') === 'true' ? 'closeMenu' : 'openMenu'));
    mostrarProjetos();
    for (const id of campos) mostrarErro(id, errosCampos[id] || '');
    mostrarRetorno(textoRetorno, tipoRetorno);
    if (enviando) buscar('#enviar').textContent = traduzir('sending');
    try { localStorage.setItem('portfolio-language', idioma); } catch { /* Preferência opcional. */ }
}

function abrirMenu(aberto, voltarFoco = false) {
    buscar('#menu').classList.toggle('aberto', aberto);
    buscar('#abrir-menu').setAttribute('aria-expanded', String(aberto));
    buscar('#abrir-menu').setAttribute('aria-label', traduzir(aberto ? 'closeMenu' : 'openMenu'));
    buscar('#fundo-menu').hidden = !aberto;
    if (voltarFoco) buscar('#abrir-menu').focus();
}

function validarCampo(id) {
    const campo = buscar('#' + id);
    const valor = campo.value.trim();
    let erro = '';
    if (!valor) erro = { nome: 'requiredName', email: 'requiredEmail', mensagem: 'requiredMessage' }[id];
    else if (valor.length > campo.maxLength) erro = 'tooLong';
    else if (id === 'email' && (campo.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor))) erro = 'invalidEmail';
    mostrarErro(id, erro);
    return !erro;
}

async function enviarMensagem(evento) {
    evento.preventDefault();
    if (enviando) return;
    const validos = campos.map(validarCampo);
    if (validos.includes(false)) {
        mostrarRetorno('invalidForm', 'erro');
        buscar('#' + campos.find(id => errosCampos[id])).focus();
        return;
    }
    if (!EMAILJS.serviceId || !EMAILJS.templateId || !EMAILJS.publicKey) {
        mostrarRetorno('unconfigured', 'erro');
        return;
    }
    enviando = true;
    buscar('#enviar').disabled = true;
    buscar('#enviar').textContent = traduzir('sending');
    buscar('#form-contato').setAttribute('aria-busy', 'true');
    for (const id of campos) buscar('#' + id).readOnly = true;
    mostrarRetorno('sending', 'enviando');

    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 15000);
    try {
        const resposta = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controle.signal,
            body: JSON.stringify({
                service_id: EMAILJS.serviceId,
                template_id: EMAILJS.templateId,
                user_id: EMAILJS.publicKey,
                template_params: {
                    from_name: buscar('#nome').value.trim(),
                    reply_to: buscar('#email').value.trim(),
                    message: buscar('#mensagem').value.trim(),
                    to_name: 'Gustavo Henrique Santos e Silva'
                }
            })
        });
        const resultado = await resposta.text();
        if (!resposta.ok || resultado.trim() !== 'OK') {
            console.warn('EmailJS:', resposta.status, resultado, 'Template:', EMAILJS.templateId);
            mostrarRetorno(resposta.status === 429 ? 'rateLimited' : 'failed', 'erro');
            return;
        }
        buscar('#form-contato').reset();
        for (const id of campos) mostrarErro(id, '');
        mostrarRetorno('success', 'sucesso');
    } catch {
        mostrarRetorno('uncertain', 'erro');
    } finally {
        clearTimeout(limite);
        enviando = false;
        buscar('#enviar').disabled = false;
        buscar('#enviar').textContent = traduzir('send');
        buscar('#form-contato').removeAttribute('aria-busy');
        for (const id of campos) buscar('#' + id).readOnly = false;
    }
}

buscar('#trocar-idioma').addEventListener('click', function () {
    idioma = idioma === 'pt' ? 'en' : 'pt';
    atualizarIdioma();
});
buscar('#abrir-menu').addEventListener('click', function () {
    abrirMenu(buscar('#abrir-menu').getAttribute('aria-expanded') !== 'true');
});
buscar('#fundo-menu').addEventListener('click', () => abrirMenu(false, true));
buscar('#menu').addEventListener('click', function (evento) {
    const destino = evento.target.closest('a');
    if (!destino) return;
    for (const link of document.querySelectorAll('#menu a')) {
        const ativo = link === destino;
        link.classList.toggle('ativo', ativo);
        if (ativo) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    }
    abrirMenu(false);
});
document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') abrirMenu(false, buscar('#abrir-menu').getAttribute('aria-expanded') === 'true');
});
matchMedia('(min-width: 768px)').addEventListener('change', () => abrirMenu(false));
for (const id of campos) {
    buscar('#' + id).addEventListener('input', function () {
        if (errosCampos[id]) validarCampo(id);
    });
}
buscar('#form-contato').addEventListener('submit', enviarMensagem);
atualizarIdioma();
