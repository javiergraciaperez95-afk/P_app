// =====================================================================
// AYUDA PARA LOS JUEGOS DE EXPLICACIÓN Y GRAMÁTICA (no es un juego)
// ---------------------------------------------------------------------
// Lo que comparten el subrayador, los sobres, el taller, el detective y el semáforo:
//   · partir un texto en trozos y sacar sus **negritas**;
//   · partir una frase en unidades (palabras; o signos si el idioma no usa espacios);
//   · colocar los elementos de «analisis» sobre las unidades de la frase y sacar los trozos de nivel alto;
//   · la lectura a trozos (como la pizarra) que abre los juegos de gramática;
//   · un ejemplo con su traducción, su 🔊 y su análisis.
// Solo lee los datos del bloque: vale para cualquier idioma.
// =====================================================================

import { el, textoConFormato } from '../js/dom.js';
import { tr as trTexto } from '../js/i18n.js';

// ----- Texto -----
// Algunos cursos traen la explicación como lista de párrafos (cada uno, texto o { en, es… }): se junta en un texto.
const plano = texto => (Array.isArray(texto) ? texto.map(trTexto).join('\n\n') : String(texto ?? ''));
export const trozosDe = texto => plano(texto).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
export const negritasDe = trozo => [...plano(trozo).matchAll(/\*\*(.+?)\*\*/g)].map(m => m[1].trim()).filter(Boolean);
export const normalizar = s => String(s ?? '').toLocaleLowerCase().replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();

const SIN_ESPACIOS = /[぀-ヿ㐀-鿿]/;
/** La frase en unidades: palabras (con su puntuación) o, en idiomas sin espacios, signos con su puntuación. */
export function unidades(texto) {
  const s = String(texto ?? '').trim();
  if (!s) return [];
  if (!/\s/.test(s) && SIN_ESPACIOS.test(s)) {
    const salida = [];
    for (const c of Array.from(s)) {
      if (/^[\p{P}\p{S}]$/u.test(c) && salida.length) salida[salida.length - 1] += c; else salida.push(c);
    }
    return salida;
  }
  return s.split(/\s+/);
}

// ----- Análisis sobre las unidades de la frase -----
function buscar(nor, m, desde) {
  for (let i = desde; i + m.length <= nor.length; i++) {
    if (m.every((x, k) => nor[i + k] === x)) return i;
  }
  return -1;
}

/**
 * Los elementos de «frase.analisis» colocados sobre las unidades de la frase:
 * [{ texto, funcion, ini, fin }] (ini y fin son posiciones en unidades(frase.es), ambas incluidas).
 * Se descartan los que no se encuentran en la frase.
 */
export function tramos(frase) {
  const orig = unidades(frase.es);
  const idx = [];
  const nor = [];
  orig.forEach((u, i) => { const n = normalizar(u); if (n) { idx.push(i); nor.push(n); } });
  const lista = [];
  let desde = 0;
  for (const p of frase.analisis ?? []) {
    const m = unidades(p.texto).map(normalizar).filter(Boolean);
    if (!m.length) continue;
    let ini = buscar(nor, m, desde);
    if (ini < 0) ini = buscar(nor, m, 0);
    if (ini < 0) continue;
    desde = ini;
    lista.push({ texto: p.texto, funcion: p.funcion, ini: idx[ini], fin: idx[ini + m.length - 1], hijos: [] });
  }
  return lista;
}

/**
 * Los trozos «de nivel alto»: los primeros elementos del análisis que juntos forman la frase. Si todo
 * cabe en un solo elemento (una interjección, un predicado), se baja un nivel. Devuelve [] si no hay
 * al menos dos trozos.
 */
export function altos(frase) {
  const lista = tramos(frase);
  const raices = [];
  const pila = [];
  for (const x of lista) {
    while (pila.length && !(pila[pila.length - 1].ini <= x.ini && pila[pila.length - 1].fin >= x.fin)) pila.pop();
    if (pila.length) pila[pila.length - 1].hijos.push(x); else raices.push(x);
    pila.push(x);
  }
  let nivel = raices;
  while (nivel.length === 1 && nivel[0].hijos.length) nivel = nivel[0].hijos;
  return nivel.length >= 2 ? nivel : [];
}

// ----- Piezas de pantalla -----
/** Un ejemplo con su frase pulsable, 🔊, traducción y análisis. */
export function ejemploNodo(e, ctx, id, clase = '') {
  const f = ctx.frase(e.es);
  return el('div', { class: `jg-ejemplo ${clase}` },
    el('p', {}, f.nodo, ' ', el('button', { type: 'button', class: 'jg-oir', 'aria-label': ctx.t('comun.escuchar'), onclick: () => ctx.oir(e.es) }, '🔊')),
    e.trad && el('p', { class: 'jg-trad' }, ctx.tr(e.trad)),
    ctx.analisis(e, id));
}

/**
 * La lectura a trozos que abre los juegos de gramática: el texto sale de trozo en trozo con
 * «Entendido»; al entender el último se llama a alFin(). Devuelve { nodo, vacia }.
 */
export function lectura(bloque, ctx, alFin, clase = '') {
  const { t, tr, sonar } = ctx;
  const trozos = trozosDe(tr(bloque.texto));
  const lista = el('div', { class: 'jg-pizarra-texto' });
  const boton = el('button', { type: 'button', class: 'es-boton jg-entendido' }, t('jg.entendido'));
  const cuenta = el('span', { class: 'jg-cuenta' });
  let n = 0;
  function mostrar() {
    lista.append(el('div', { class: 'jg-tiza' }, textoConFormato(trozos[n])));
    n += 1;
    cuenta.textContent = `${n} / ${trozos.length}`;
    lista.lastChild.scrollIntoView?.({ block: 'nearest', behavior: ctx.quieto ? 'auto' : 'smooth' });
  }
  boton.addEventListener('click', () => {
    sonar('tiza');
    if (n >= trozos.length) { boton.disabled = true; alFin(); } else mostrar();
  });
  if (trozos.length) mostrar();
  const nodo = el('div', { class: `jg-ayuda-lectura ${clase}` },
    el('div', { class: 'jg-pizarra-marco' },
      bloque.titulo && el('h2', {}, tr(bloque.titulo)),
      lista,
      el('div', { class: 'jg-pizarra-pie' }, cuenta, boton)));
  return { nodo, vacia: trozos.length === 0 };
}
