// Tradução PT/EN. Chave ausente em um idioma cai no outro; nunca se mostra
// a chave técnica ao visitante.

import { TEXTOS } from '../dados/traducoes.js';
import { prefs } from './preferencias.js';

export function idioma() {
  return prefs.obter().idioma;
}

/** Texto de interface por chave, com variáveis {nome}. */
export function t(chave, variaveis) {
  const par = TEXTOS[chave];
  if (!par) return '';
  let texto = (idioma() === 'en' ? par[1] : par[0]) || par[0] || par[1] || '';
  if (variaveis) {
    for (const [nome, valor] of Object.entries(variaveis)) texto = texto.replaceAll('{' + nome + '}', String(valor));
  }
  return texto;
}

/** Campo bilíngue de conteúdo: { pt, en } ou string simples. */
export function tx(campo) {
  if (campo == null) return '';
  if (typeof campo === 'string') return campo;
  return campo[idioma()] || campo.pt || campo.en || '';
}

export function localidade() {
  return idioma() === 'pt' ? 'pt-BR' : 'en';
}

/** '2026-07' → 'jul/2026' ou 'Jul/2026'; '2026' → '2026'. */
export function formatarMes(data) {
  if (!data) return '';
  if (!/^\d{4}-\d{2}$/.test(data)) return data;
  const objeto = new Date(data + '-01T12:00:00Z');
  const mes = objeto.toLocaleDateString(localidade(), { month: 'short', timeZone: 'UTC' }).replace('.', '');
  return mes + '/' + data.slice(0, 4);
}

export function formatarHora(data) {
  return data.toLocaleTimeString(localidade(), { hour: '2-digit', minute: '2-digit' });
}

/** Segundos → 'm:ss'. */
export function formatarTempo(segundos) {
  const total = Math.max(0, Math.round(segundos));
  return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
}
