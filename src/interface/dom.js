// Utilitários de DOM. Todo texto de conteúdo entra por textContent; não há
// HTML montado a partir de dados ou de entrada do visitante.

const SVG = 'http://www.w3.org/2000/svg';

/**
 * Cria um elemento. Props: class, text, dataset, style (objeto), on<Evento>,
 * demais viram atributos (false/null/undefined são ignorados).
 * Filhos: nós, textos ou listas (valores vazios são ignorados).
 */
export function h(tag, props, ...filhos) {
  const el = document.createElement(tag);
  if (props) {
    for (const [chave, valor] of Object.entries(props)) {
      if (valor === false || valor == null) continue;
      if (chave === 'class') el.className = valor;
      else if (chave === 'text') el.textContent = valor;
      else if (chave === 'dataset') Object.assign(el.dataset, valor);
      else if (chave === 'style') Object.assign(el.style, valor);
      else if (chave === 'value') el.value = valor;
      else if (chave.startsWith('on') && typeof valor === 'function') el.addEventListener(chave.slice(2).toLowerCase(), valor);
      else el.setAttribute(chave, valor === true ? '' : String(valor));
    }
  }
  anexar(el, filhos);
  return el;
}

export function anexar(el, filhos) {
  for (const filho of filhos.flat(Infinity)) {
    if (filho === false || filho == null || filho === '') continue;
    el.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
  }
  return el;
}

export function limpar(el) {
  el.replaceChildren();
  return el;
}

// Ícones autorais (traço simples em grade 24×24). Constantes do projeto,
// nunca dados externos; não reproduzem marcas de terceiros.
const ICONES = {
  inicio: '<path d="M3 11.5 12 4l9 7.5"/><path d="M6 10v10h12V10"/>',
  biblioteca: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  vitrine: '<path d="M4 9 5.5 4h13L20 9"/><path d="M4 9v11h16V9"/><path d="M4 9h16"/><path d="M9 20v-6h6v6"/>',
  trilha: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6"/>',
  busca: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
  engrenagem: '<path d="M4 6h8m4 0h4M4 12h2m4 0h10M4 18h10m4 0h2"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
  sino: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  guia: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14a5 5 0 0 1 4.5 5"/>',
  pasta: '<path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  telefone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>',
  linkedin: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M3 13h18"/>',
  github: '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13.5 5-3 14"/>',
  controle: '<path d="M7 8h10a5 5 0 0 1 5 5v1a3 3 0 0 1-5.4 1.8L15.5 14h-7l-1.1 1.8A3 3 0 0 1 2 14v-1a5 5 0 0 1 5-5z"/><path d="M7 10.5v3M5.5 12h3"/><circle cx="16.5" cy="12" r=".6"/>',
  trofeu: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/><path d="M12 14v4M8 20h8"/>',
  imagem: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7"/><path d="M12 17h.01"/>',
  fixar: '<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>',
  mais: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
  esquerda: '<path d="m14 6-6 6 6 6"/>',
  direita: '<path d="m10 6 6 6-6 6"/>',
  cima: '<path d="m6 14 6-6 6 6"/>',
  baixo: '<path d="m6 10 6 6 6-6"/>',
  fechar: '<path d="m6 6 12 12M18 6 6 18"/>',
  externo: '<path d="M14 5h5v5"/><path d="M19 5 11 13"/><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',
  copiar: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
  compartilhar: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
  cadeado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mensagem: '<path d="M4 5h16v11H9l-5 4z"/>',
  jogar: '<path d="M8 5v14l11-7z"/>',
  pausa: '<path d="M8 5v14M16 5v14"/>',
  reiniciar: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v5h5"/>',
  voltar: '<path d="M10 6 4 12l6 6"/><path d="M4 12h16"/>',
  som: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  certo: '<path d="m5 12 5 5 9-10"/>',
  alerta: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v5M12 17.5h.01"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lista: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  ampliar: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  chave: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M17 12v3M20 12v2"/>',
};

/** Ícone decorativo (aria-hidden). O nome acessível fica no botão ou link. */
export function icone(nome, tamanho = 20) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', tamanho);
  svg.setAttribute('height', tamanho);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('icone');
  svg.innerHTML = ICONES[nome] || ICONES.ajuda;
  return svg;
}

/** Só aceita http(s) e mailto; qualquer outra coisa não vira link. */
export function urlSegura(url) {
  try {
    const analisada = new URL(url, location.href);
    return ['http:', 'https:', 'mailto:'].includes(analisada.protocol) ? analisada.href : null;
  } catch {
    return null;
  }
}

let regiaoAnuncio = null;
let temporizadorAnuncio = 0;
/** Anuncia uma mudança para leitores de tela, com atraso para não repetir. */
export function anunciar(texto) {
  regiaoAnuncio = regiaoAnuncio || document.getElementById('anuncio');
  if (!regiaoAnuncio) return;
  window.clearTimeout(temporizadorAnuncio);
  temporizadorAnuncio = window.setTimeout(() => {
    regiaoAnuncio.textContent = '';
    regiaoAnuncio.textContent = texto;
  }, 250);
}

/** Copia texto; devolve false se o navegador não permitir. */
export async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
