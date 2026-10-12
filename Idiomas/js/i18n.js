// Idioma de la interfaz (inglés, vietnamita, chino o español). Lo que no esté traducido sale en inglés.
// - t('clave', { n: 3 }): textos de la aplicación (están en i18n/en.js, i18n/vi.js e i18n/zh.js).
// - tr(valor): textos del contenido de las lecciones. Pueden ser un texto
//   (igual en los dos idiomas) o un grupo { "en": "…", "vi": "…" }.

import { ajuste, cambiarAjuste } from './ajustes.js';
import en from './i18n/en.js';
import vi from './i18n/vi.js';
import zh from './i18n/zh.js';
import es from './i18n/es.js';
import { curso, nombreDelCurso, saludo } from './curso.js';

export const IDIOMAS = [
  { clave: 'en', nombre: 'English', corto: 'EN', locale: 'en-GB' },
  { clave: 'vi', nombre: 'Tiếng Việt', corto: 'VI', locale: 'vi-VN' },
  { clave: 'zh', nombre: '中文', corto: '中', locale: 'zh-CN' },
  { clave: 'es', nombre: 'Español', corto: 'ES', locale: 'es-ES' },
];

const TEXTOS = { en, vi, zh, es };

export function idioma() {
  const i = ajuste('idioma');
  return TEXTOS[i] ? i : 'en';
}

/** Para fechas y horas: 'en-GB' o 'vi-VN'. */
export function locale() {
  return IDIOMAS.find(i => i.clave === idioma()).locale;
}

function textoEn(i, clave, vars) {
  // Un texto puede tener una versión solo para un curso: «clave@es» gana a «clave» en el curso de español
  // (bromas con palabras en español, ejemplos…).
  const delCursoActual = `${clave}@${curso.id}`;
  const propio = TEXTOS[i][delCursoActual] ?? TEXTOS[i][clave];
  const v = propio ?? TEXTOS.en[delCursoActual] ?? TEXTOS.en[clave];
  if (v === undefined) {
    console.warn(`Falta el texto «${clave}»`);
    return clave;
  }
  // {L} es el nombre del idioma que se estudia, dicho en el idioma de la interfaz.
  // (Si el texto sale en inglés porque falta su traducción, el nombre del idioma también va en inglés.)
  const todas = { L: nombreDelCurso(propio === undefined ? 'en' : i), ...vars };
  if (typeof v === 'function') return delCurso(v(todas));
  const poner = texto => delCurso(texto.replace(/\{(\w+)\}/g, (_, k) => (todas[k] ?? `{${k}}`)));
  return Array.isArray(v) ? v.map(x => (typeof x === 'string' ? poner(x) : x)) : poner(v);
}

/** Los textos se escribieron para el curso de español y saludan con «¡Hola!»; cada curso saluda en su idioma. */
function delCurso(texto) {
  if (typeof texto !== 'string' || curso.campo === 'es' || !saludo) return texto;
  return texto.replace(/¡Hola(, hola)?/g, saludo);
}

/** Texto de la interfaz en el idioma actual. Si es una lista (frases al azar), devuelve la lista. */
export function t(clave, vars = {}) {
  return textoEn(idioma(), clave, vars);
}

/** El mismo texto en todos los idiomas: { en, vi }. Para guardar datos que se leerán más tarde (p. ej. el origen de una tarjeta). */
export function tTodos(clave, vars = {}) {
  return Object.fromEntries(IDIOMAS.map(({ clave: i }) => [i, textoEn(i, clave, vars)]));
}

/** Resuelve un texto del contenido: un texto normal o { en, vi }. */
export function tr(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor !== 'object' || Array.isArray(valor)) return valor;
  // En el curso de español, «es» es el propio idioma que se estudia, no una traducción.
  const i = idioma() === 'es' && curso.campo === 'es' ? 'en' : idioma();
  return valor[i] ?? valor.en ?? valor.es ?? Object.values(valor).find(v => v !== null && v !== undefined) ?? '';
}

/** Pone en el HTML fijo (index.html) los textos marcados con data-t, data-t-aria y data-t-title. */
export function aplicarIdioma() {
  document.documentElement.lang = idioma();
  for (const nodo of document.querySelectorAll('[data-t]')) nodo.textContent = t(nodo.dataset.t);
  for (const nodo of document.querySelectorAll('[data-t-aria]')) nodo.setAttribute('aria-label', t(nodo.dataset.tAria));
  for (const nodo of document.querySelectorAll('[data-t-title]')) nodo.title = t(nodo.dataset.tTitle);
}

export function cambiarIdioma(clave) {
  if (!TEXTOS[clave] || clave === idioma()) return;
  cambiarAjuste('idioma', clave);
  aplicarIdioma();
  window.dispatchEvent(new Event('idioma-cambiado'));
}
