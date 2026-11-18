// Armazenamento local versionado, por categoria. Se o localStorage estiver
// bloqueado, cheio ou com JSON inválido, tudo continua funcionando em memória.
// Nenhum dado de formulário passa por aqui.

const PREFIXO = 'portfolio-console.';
const VERSAO = 1;
const CATEGORIAS = ['prefs', 'historico', 'favoritos', 'recordes', 'conquistas', 'jogos'];

const memoria = new Map();
const ouvintes = new Set();
let disponivel = true;
let falhaAvisada = false;
const ouvintesFalha = new Set();

function testar() {
  try {
    const chave = PREFIXO + 'teste';
    localStorage.setItem(chave, '1');
    localStorage.removeItem(chave);
    return true;
  } catch {
    return false;
  }
}

function avisarFalha() {
  disponivel = false;
  if (falhaAvisada) return;
  falhaAvisada = true;
  [...ouvintesFalha].forEach((fn) => fn());
}

// Lê um registro bruto; registros inválidos ou de versão desconhecida são
// ignorados (valores seguros), mas não apagados automaticamente.
function lerBruto(categoria) {
  try {
    const texto = localStorage.getItem(PREFIXO + categoria);
    if (texto == null) return null;
    const registro = JSON.parse(texto);
    if (!registro || typeof registro !== 'object' || registro.v !== VERSAO) return null;
    return registro;
  } catch {
    return null;
  }
}

function migrarLegado() {
  // O site anterior guardava só o idioma em 'portfolio-language'.
  try {
    const antigo = localStorage.getItem('portfolio-language');
    if ((antigo === 'pt' || antigo === 'en') && !lerBruto('prefs')) {
      memoria.set('prefs', { idioma: antigo });
      localStorage.setItem(PREFIXO + 'prefs', JSON.stringify({ v: VERSAO, t: Date.now(), d: { idioma: antigo } }));
    }
  } catch {
    /* migração é opcional */
  }
}

function iniciar() {
  disponivel = testar();
  if (!disponivel) return;
  migrarLegado();
  for (const categoria of CATEGORIAS) {
    const registro = lerBruto(categoria);
    if (registro) memoria.set(categoria, registro.d);
  }
  window.addEventListener('storage', (evento) => {
    if (!evento.key || !evento.key.startsWith(PREFIXO)) return;
    const categoria = evento.key.slice(PREFIXO.length);
    if (!CATEGORIAS.includes(categoria)) return;
    const registro = lerBruto(categoria);
    if (registro) memoria.set(categoria, registro.d);
    else memoria.delete(categoria);
    [...ouvintes].forEach((fn) => fn(categoria));
  });
}

function copiar(valor) {
  return valor === undefined ? undefined : JSON.parse(JSON.stringify(valor));
}

export const armazenamento = {
  get disponivel() {
    return disponivel;
  },
  /** Devolve uma cópia do dado da categoria, ou `padrao` se não houver. */
  ler(categoria, padrao = null) {
    return memoria.has(categoria) ? copiar(memoria.get(categoria)) : copiar(padrao);
  },
  /** Relê do disco (outra aba pode ter gravado) antes de uma mesclagem. */
  lerAtual(categoria, padrao = null) {
    if (disponivel) {
      const registro = lerBruto(categoria);
      if (registro) memoria.set(categoria, registro.d);
    }
    return this.ler(categoria, padrao);
  },
  /** Grava em memória e tenta persistir. Devolve true se foi para o disco. */
  salvar(categoria, dados) {
    memoria.set(categoria, copiar(dados));
    if (!disponivel) return false;
    try {
      localStorage.setItem(PREFIXO + categoria, JSON.stringify({ v: VERSAO, t: Date.now(), d: dados }));
      return true;
    } catch {
      avisarFalha();
      return false;
    }
  },
  limpar(categoria) {
    memoria.delete(categoria);
    if (!disponivel) return false;
    try {
      localStorage.removeItem(PREFIXO + categoria);
      return true;
    } catch {
      avisarFalha();
      return false;
    }
  },
  /** Mudança vinda de outra aba. */
  aoMudarFora(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
  /** Primeira falha de escrita nesta sessão. */
  aoFalhar(fn) {
    ouvintesFalha.add(fn);
    return () => ouvintesFalha.delete(fn);
  },
  categorias: CATEGORIAS,
};

iniciar();
