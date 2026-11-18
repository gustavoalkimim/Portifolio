// Ponto de entrada. Liga serviços, entrada e interface; a abertura decide
// quando o console aparece. Os jogos são carregados só quando abertos.

import { prefs } from './src/servicos/preferencias.js';
import { rotas } from './src/servicos/rotas.js';
import { fundo } from './src/servicos/fundo.js';
import { audio } from './src/servicos/audio.js';
import { armazenamento } from './src/servicos/armazenamento.js';
import { notificacoes } from './src/servicos/notificacoes.js';
import { acoes } from './src/entrada/acoes.js';
import { foco } from './src/entrada/foco.js';
import { iniciarTeclado } from './src/entrada/teclado.js';
import { controle } from './src/entrada/controle.js';
import { iniciarToque } from './src/entrada/toque.js';
import { sobreposicoes } from './src/interface/sobreposicoes.js';
import { casca } from './src/interface/casca.js';
import { iniciarAvisos } from './src/interface/avisos.js';
import { abrirGuia } from './src/interface/guia.js';
import { abrirBusca } from './src/interface/busca.js';
import { abrirMenuDoItem } from './src/interface/componentes.js';
import { executarAbertura } from './src/interface/abertura.js';

document.documentElement.classList.add('js');

const DIRECOES = ['cima', 'baixo', 'esquerda', 'direita'];

function trocarAba(passo) {
  const lista = foco.escopo().querySelector('[role="tablist"]');
  if (!lista) return;
  const abas = [...lista.querySelectorAll('[role="tab"]')];
  const proxima = abas[abas.findIndex((aba) => aba.getAttribute('aria-selected') === 'true') + passo];
  if (proxima) proxima.click();
}

// Consumidor padrão das ações: navegação do console.
function comandoPadrao(evento) {
  if (!evento.pressionado) return true;
  const { nome } = evento;
  if (DIRECOES.includes(nome)) {
    const moveu = foco.mover(nome, evento.origem === 'teclado');
    if (moveu && !evento.repeticao) audio.tocar('foco');
    return moveu;
  }
  switch (nome) {
    case 'confirmar': {
      const ativo = document.activeElement;
      if (ativo && ativo !== document.body && foco.escopo().contains(ativo)) ativo.click();
      return true;
    }
    case 'voltar': {
      if (sobreposicoes.fecharTopo()) return true;
      const atual = rotas.atual();
      if (!atual || atual.nome === 'inicio') return false;
      audio.tocar('voltar');
      rotas.voltar(atual.nome === 'projeto' || atual.nome === 'jogo' ? '/biblioteca' : '/inicio');
      return true;
    }
    case 'guia':
      if (prefs.obter().modo === 'simples') return false;
      if (sobreposicoes.aberta('guia')) sobreposicoes.fecharTopo();
      else if (!sobreposicoes.aberta()) {
        // Ao fechar, o foco volta ao item que estava em foco (ou ao botão do Guia).
        const ativo = document.activeElement;
        abrirGuia('inicio', ativo && ativo !== document.body ? ativo : document.getElementById('botao-guia'));
      }
      return true;
    case 'busca':
      if (!sobreposicoes.aberta()) abrirBusca();
      return true;
    case 'menu': {
      const ativo = document.activeElement;
      if (ativo && ativo.item && ativo.item.tipo !== 'secao' && !sobreposicoes.aberta('menu')) {
        abrirMenuDoItem(ativo.item, ativo);
        return true;
      }
      return false;
    }
    case 'ajuda':
      if (sobreposicoes.aberta()) return false;
      rotas.navegar('/ajuda');
      return true;
    case 'abaAnterior':
      trocarAba(-1);
      return true;
    case 'abaProxima':
      trocarAba(1);
      return true;
    default:
      return false;
  }
}

function preparar() {
  fundo.iniciar([...document.querySelectorAll('.fundo-camada')]);
  sobreposicoes.iniciar(document.getElementById('app'), document.getElementById('camadas'));
  iniciarAvisos(document.getElementById('avisos'));
  casca.iniciar({
    elementoTopo: document.getElementById('topo'),
    elementoTela: document.getElementById('tela'),
    elementoDicas: document.getElementById('dicas'),
  });
  acoes.empilhar(comandoPadrao);
  iniciarTeclado();
  iniciarToque();
  controle.iniciar();

  // O primeiro gesto libera o áudio (se o visitante o ligar).
  const gesto = () => audio.registrarGesto();
  document.addEventListener('pointerdown', gesto, { once: true, passive: true });
  document.addEventListener('keydown', gesto, { once: true });

  // Eventos reais que viram notificação.
  armazenamento.aoFalhar(() => notificacoes.registrar({ tipo: 'info', chave: 'notif.semArmazenamento', unico: 'armazenamento', critico: true }));
  if (!armazenamento.disponivel) notificacoes.registrar({ tipo: 'info', chave: 'notif.semArmazenamento', unico: 'armazenamento' });
  controle.aoMudar((tipo) => notificacoes.registrar({ tipo: 'info', chave: tipo === 'conectado' ? 'notif.controleConectado' : 'notif.controleDesconectado' }));

  rotas.iniciar();
}

executarAbertura({ preparar, aoConcluir: () => casca.liberar() });
