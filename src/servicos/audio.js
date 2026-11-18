// Camada única de áudio (Web Audio API). Desligada por padrão; o contexto só
// é criado depois de um gesto do visitante e com a preferência ligada.
// Todos os sons são sintetizados aqui; não há arquivo de áudio de terceiros.

import { prefs } from './preferencias.js';

let contexto = null;
let mestre = null;
const canais = {};
let houveGesto = false;

const SONS = {
  foco: { canal: 'interface', notas: [[520, 0.03]], tipo: 'sine', ganho: 0.25 },
  abrir: { canal: 'interface', notas: [[440, 0.05], [660, 0.07]], tipo: 'sine', ganho: 0.35 },
  voltar: { canal: 'interface', notas: [[520, 0.05], [330, 0.07]], tipo: 'sine', ganho: 0.35 },
  erro: { canal: 'interface', notas: [[180, 0.12]], tipo: 'triangle', ganho: 0.4 },
  ponto: { canal: 'jogos', notas: [[660, 0.05], [880, 0.06]], tipo: 'square', ganho: 0.2 },
  tiro: { canal: 'jogos', notas: [[740, 0.04]], tipo: 'square', ganho: 0.12 },
  dano: { canal: 'jogos', notas: [[160, 0.16]], tipo: 'sawtooth', ganho: 0.25 },
  virar: { canal: 'jogos', notas: [[400, 0.04]], tipo: 'triangle', ganho: 0.25 },
  vitoria: { canal: 'jogos', notas: [[523, 0.1], [659, 0.1], [784, 0.16]], tipo: 'triangle', ganho: 0.3 },
  derrota: { canal: 'jogos', notas: [[330, 0.12], [247, 0.12], [196, 0.2]], tipo: 'triangle', ganho: 0.3 },
};

function aplicarVolumes() {
  if (!contexto) return;
  const p = prefs.obter();
  mestre.gain.value = p.audio ? p.volume / 100 : 0;
  canais.interface.gain.value = p.volumeInterface / 100;
  canais.jogos.gain.value = p.volumeJogos / 100;
}

function garantirContexto() {
  if (contexto || !houveGesto || !prefs.obter().audio) return contexto;
  const Classe = window.AudioContext || window.webkitAudioContext;
  if (!Classe) return null;
  try {
    contexto = new Classe();
    mestre = contexto.createGain();
    mestre.connect(contexto.destination);
    for (const nome of ['interface', 'jogos']) {
      canais[nome] = contexto.createGain();
      canais[nome].connect(mestre);
    }
    aplicarVolumes();
  } catch {
    contexto = null;
  }
  return contexto;
}

export const audio = {
  /** Informa que houve interação; só a partir daí o navegador permite som. */
  registrarGesto() {
    houveGesto = true;
  },
  disponivel() {
    return Boolean(window.AudioContext || window.webkitAudioContext);
  },
  tocar(nome) {
    const som = SONS[nome];
    if (!som || !prefs.obter().audio || document.hidden) return;
    const ctx = garantirContexto();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    let inicio = ctx.currentTime;
    for (const [frequencia, duracao] of som.notas) {
      const oscilador = ctx.createOscillator();
      const envelope = ctx.createGain();
      oscilador.type = som.tipo;
      oscilador.frequency.value = frequencia;
      envelope.gain.setValueAtTime(som.ganho, inicio);
      envelope.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
      oscilador.connect(envelope);
      envelope.connect(canais[som.canal]);
      oscilador.start(inicio);
      oscilador.stop(inicio + duracao + 0.02);
      inicio += duracao;
    }
  },
  /** Página oculta, pausa ou saída de jogo: silencia tudo. */
  suspender() {
    if (contexto && contexto.state === 'running') contexto.suspend().catch(() => {});
  },
  estado() {
    return contexto ? contexto.state : 'inativo';
  },
};

prefs.aoMudar(aplicarVolumes);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) audio.suspender();
});
