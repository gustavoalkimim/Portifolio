// Recordes e conquistas locais dos jogos. Só valem neste navegador e só
// se comparam entre o mesmo jogo, versão de regras e variante.

import { armazenamento } from './armazenamento.js';
import { conquistas as DEFINICOES, jogos } from '../dados/jogos.js';

const ouvintes = new Set();

function chaveDe(jogo, versao, variante) {
  return [jogo, 'v' + versao, variante || 'padrao'].join(':');
}

function melhorEntre(a, b, criterio) {
  if (a == null) return b;
  if (b == null) return a;
  return criterio === 'menor' ? Math.min(a, b) : Math.max(a, b);
}

function lerRecordes(atual = false) {
  const bruto = atual ? armazenamento.lerAtual('recordes', {}) : armazenamento.ler('recordes', {});
  return bruto && typeof bruto === 'object' && !Array.isArray(bruto) ? bruto : {};
}

function lerConquistas(atual = false) {
  const bruto = atual ? armazenamento.lerAtual('conquistas', {}) : armazenamento.ler('conquistas', {});
  const base = { progresso: {}, desbloqueadas: {}, concluidos: [] };
  if (!bruto || typeof bruto !== 'object') return base;
  return {
    progresso: bruto.progresso && typeof bruto.progresso === 'object' ? bruto.progresso : {},
    desbloqueadas: bruto.desbloqueadas && typeof bruto.desbloqueadas === 'object' ? bruto.desbloqueadas : {},
    concluidos: Array.isArray(bruto.concluidos) ? bruto.concluidos.filter((id) => jogos.some((j) => j.id === id)) : [],
  };
}

export const recordes = {
  obter(jogo, versao, variante) {
    const registro = lerRecordes()[chaveDe(jogo, versao, variante)];
    return registro && Number.isFinite(registro.pontos) ? registro : null;
  },
  /** Melhor registro do jogo em qualquer variante da versão atual. */
  listarDoJogo(jogo, versao) {
    const prefixo = jogo + ':v' + versao + ':';
    return Object.entries(lerRecordes())
      .filter(([chave, registro]) => chave.startsWith(prefixo) && registro && Number.isFinite(registro.pontos))
      .map(([chave, registro]) => ({ variante: chave.slice(prefixo.length), ...registro }));
  },
  /**
   * Registra um resultado e conserva o melhor válido (inclusive o de outra aba).
   * Devolve { novo, persistido, melhor }.
   */
  registrar(jogo, versao, variante, pontos, criterio) {
    if (!Number.isFinite(pontos)) return { novo: false, persistido: false, melhor: null };
    const todos = lerRecordes(true);
    const chave = chaveDe(jogo, versao, variante);
    const anterior = todos[chave] && Number.isFinite(todos[chave].pontos) ? todos[chave].pontos : null;
    const melhor = melhorEntre(anterior, pontos, criterio);
    const novo = anterior === null || melhor !== anterior;
    let persistido = armazenamento.disponivel;
    if (novo) {
      todos[chave] = { pontos: melhor, data: Date.now() };
      persistido = armazenamento.salvar('recordes', todos);
      [...ouvintes].forEach((fn) => fn());
    }
    return { novo, persistido, melhor };
  },
  limpar(jogo) {
    if (!jogo) {
      armazenamento.limpar('recordes');
    } else {
      const todos = lerRecordes(true);
      for (const chave of Object.keys(todos)) if (chave.startsWith(jogo + ':')) delete todos[chave];
      armazenamento.salvar('recordes', todos);
    }
    [...ouvintes].forEach((fn) => fn());
  },
  aoMudar(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
};

export const conquistas = {
  /** Lista com progresso local e estado. */
  listar() {
    const estado = lerConquistas();
    return DEFINICOES.map((definicao) => {
      const progresso = definicao.id === 'quatro-jogos' ? estado.concluidos.length : Number(estado.progresso[definicao.id]) || 0;
      return {
        ...definicao,
        progresso: Math.min(definicao.meta, progresso),
        desbloqueada: Boolean(estado.desbloqueadas[definicao.id]),
        data: estado.desbloqueadas[definicao.id] || null,
      };
    });
  },
  /**
   * Avalia o fim de uma partida. `marcos` = { [idConquista]: valorAtingido }.
   * Devolve as conquistas recém-desbloqueadas.
   */
  avaliar(jogoId, marcos = {}) {
    const estado = lerConquistas(true);
    if (!estado.concluidos.includes(jogoId)) estado.concluidos.push(jogoId);
    const novas = [];
    for (const definicao of DEFINICOES) {
      let valor;
      if (definicao.id === 'quatro-jogos') valor = estado.concluidos.length;
      else if (definicao.id in marcos) valor = Math.max(Number(estado.progresso[definicao.id]) || 0, Number(marcos[definicao.id]) || 0);
      else continue;
      if (definicao.id !== 'quatro-jogos') estado.progresso[definicao.id] = valor;
      if (valor >= definicao.meta && !estado.desbloqueadas[definicao.id]) {
        estado.desbloqueadas[definicao.id] = Date.now();
        novas.push(definicao);
      }
    }
    armazenamento.salvar('conquistas', estado);
    [...ouvintes].forEach((fn) => fn());
    return novas;
  },
  limpar() {
    armazenamento.limpar('conquistas');
    [...ouvintes].forEach((fn) => fn());
  },
};

armazenamento.aoMudarFora((categoria) => {
  if (categoria === 'recordes' || categoria === 'conquistas') [...ouvintes].forEach((fn) => fn());
});
