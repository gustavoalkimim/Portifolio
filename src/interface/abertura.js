// Abertura como máquina de estados (seção 13 do plano):
//   boot-inicial → verificar-preferencias → abertura → preparar-home → home
// com saídas laterais para pular, erro-de-recurso e modo-simples.
// A marca e a animação são próprias (CSS/SVG em index.html e style.css).
// O botão Pular já está no HTML: existe desde o primeiro quadro.

import { t } from '../servicos/i18n.js';
import { prefs } from '../servicos/preferencias.js';
import { acoes } from '../entrada/acoes.js';

const DURACAO = 2800; // ms; ponto de partida ajustável

export function executarAbertura({ preparar, aoConcluir }) {
  const raiz = document.getElementById('abertura');
  const app = document.getElementById('app');
  const botaoPular = document.getElementById('abertura-pular');
  const botaoSimples = document.getElementById('abertura-simples');
  const linkAjuda = document.getElementById('abertura-ajuda');
  const erro = document.getElementById('abertura-erro');
  let estado = 'boot-inicial';
  let temporizador = 0;
  let pararControle = () => {};

  const ir = (novo) => {
    estado = novo;
    raiz.dataset.estado = novo;
  };

  // Textos no idioma salvo (o HTML vem em português).
  botaoPular.textContent = t('abertura.pular');
  botaoSimples.textContent = t('abertura.simples');
  linkAjuda.textContent = t('abertura.ajuda');
  raiz.setAttribute('aria-label', t('abertura.rotulo'));
  document.getElementById('abertura-sub').textContent = t('abertura.sub');

  function concluir() {
    if (estado === 'preparar-home' || estado === 'home' || estado === 'erro-de-recurso') return;
    window.clearTimeout(temporizador);
    document.removeEventListener('keydown', aoTecla, true);
    pararControle();
    ir('preparar-home');
    app.hidden = false;
    app.inert = false;
    const reduzido = prefs.movimentoReduzido();
    raiz.classList.add('saindo');
    window.setTimeout(
      () => {
        raiz.hidden = true;
        ir('home');
      },
      reduzido ? 0 : 380,
    );
    aoConcluir();
  }

  function falhar(causa) {
    console.error(causa);
    window.clearTimeout(temporizador);
    ir('erro-de-recurso');
    erro.hidden = false;
    erro.replaceChildren();
    const texto = document.createElement('p');
    texto.textContent = t('abertura.erro');
    const recarregar = document.createElement('button');
    recarregar.type = 'button';
    recarregar.className = 'botao botao-principal';
    recarregar.textContent = t('abertura.recarregar');
    recarregar.addEventListener('click', () => location.reload());
    const basico = document.createElement('button');
    basico.type = 'button';
    basico.className = 'botao';
    basico.textContent = t('abertura.basico');
    basico.addEventListener('click', () => {
      // Volta ao HTML estático com perfil, projetos e contato.
      document.documentElement.classList.remove('js');
      raiz.hidden = true;
      document.getElementById('basico').focus();
    });
    erro.append(texto, recarregar, basico);
    botaoPular.hidden = true;
    botaoSimples.hidden = true;
    linkAjuda.hidden = true;
    recarregar.focus();
  }

  function aoTecla(evento) {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      evento.stopPropagation();
      ir('pular');
      concluir();
    } else if (evento.key !== 'Tab' && evento.key !== 'Shift' && evento.key !== 'Enter' && evento.key !== ' ') {
      evento.stopPropagation(); // atalhos do console só valem depois da abertura
    }
  }

  botaoPular.addEventListener('click', () => {
    ir('pular');
    concluir();
  });
  botaoSimples.addEventListener('click', () => {
    ir('modo-simples');
    prefs.definir({ modo: 'simples' });
    concluir();
  });
  linkAjuda.addEventListener('click', () => {
    // O href (#/ajuda) já troca a rota; aqui só encerra a abertura.
    window.setTimeout(() => {
      ir('pular');
      concluir();
    }, 0);
  });
  document.addEventListener('keydown', aoTecla, true);

  ir('verificar-preferencias');
  const semAnimacao = prefs.movimentoReduzido() || prefs.obter().abertura === 'pular';

  // O essencial do aplicativo inicia em paralelo com a animação; os jogos
  // não entram aqui (são carregados sob demanda).
  try {
    preparar();
  } catch (causa) {
    falhar(causa);
    return;
  }

  // Com controle, A ou B também pulam; o resto espera a abertura acabar.
  pararControle = acoes.empilhar((evento) => {
    if (evento.pressionado && (evento.nome === 'confirmar' || evento.nome === 'voltar')) {
      ir('pular');
      concluir();
    }
    return true;
  });

  if (semAnimacao) {
    ir('pular');
    concluir();
    return;
  }
  ir('abertura');
  botaoPular.focus({ preventScroll: true });
  temporizador = window.setTimeout(concluir, DURACAO);
}
