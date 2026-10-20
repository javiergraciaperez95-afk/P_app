// Idioma de la interfaz: vietnamita (el de la estudiante, el de siempre) o español (para practicar en inmersión).
// El contenido de las lecciones conserva su propio idioma (español, explicado en vietnamita).
// - t('clave', { n: 3 }): textos de la aplicación (están en i18n/<idioma>.js).
// - tr(valor): textos del contenido. Pueden ser un texto (igual en los dos idiomas) o un grupo { "en": "…", "vi": "…" }.

import { ajuste, cambiarAjuste, idiomaDispositivo } from './ajustes.js';
import viBase from './i18n/vi.js';
import viPhuong from './i18n/ph-vi.js';
import { curso, nombreDelCurso, nombreTutora } from './curso.js';

const vi = { ...viBase, ...viPhuong };

export const IDIOMAS = [
  { clave: 'vi', nombre: 'Tiếng Việt', corto: 'VI', locale: 'vi-VN' },
  { clave: 'es', nombre: 'Español', corto: 'ES', locale: 'es-ES' },
];
export const IDIOMAS_VISIBLES = IDIOMAS;
const visible = i => IDIOMAS.some(x => x.clave === i);

// Al abrir solo se cargan los textos del idioma en uso; el vietnamita va siempre (es el de reserva).
const CARGAR = {
  es: () => Promise.all([import('./i18n/es.js'), import('./i18n/ph-es.js')]).then(([base, phuong]) => ({ default: { ...base.default, ...phuong.default } })),
};
const TEXTOS = { vi };
const cargando = {};
function cargarTextos(i) {
  if (TEXTOS[i] || !CARGAR[i]) return Promise.resolve();
  cargando[i] ??= CARGAR[i]().then(m => { TEXTOS[i] = m.default; }).catch(() => { delete cargando[i]; });
  return cargando[i];
}
// El elegido; con «automático», el del dispositivo (español si el móvil está en español; si no, vietnamita).
const pedido = () => {
  const i = ajuste('idioma');
  if (visible(i)) return i;
  return idiomaDispositivo();
};
await cargarTextos(pedido());

export function idioma() {
  const i = pedido();
  return TEXTOS[i] ? i : 'vi'; // (solo pasa un instante, mientras llegan los textos)
}

/** Para fechas y horas: 'vi-VN' o 'es-ES'. */
export function locale() {
  return IDIOMAS.find(i => i.clave === idioma()).locale;
}

function textoEn(i, clave, vars) {
  // Un texto puede tener una versión solo para el curso de español: «clave@es» gana a «clave».
  const delCurso = `${clave}@${curso.id}`;
  const propio = TEXTOS[i]?.[delCurso] ?? TEXTOS[i]?.[clave];
  const v = propio ?? TEXTOS.vi[delCurso] ?? TEXTOS.vi[clave];
  if (v === undefined) {
    console.warn(`Falta el texto «${clave}»`);
    return clave;
  }
  // {L} es el nombre del idioma que se estudia, dicho en el idioma de la interfaz.
  const todas = { L: nombreDelCurso(propio === undefined ? 'vi' : i), ...vars };
  if (typeof v === 'function') return v(todas);
  const poner = texto => texto.replace(/\{(\w+)\}/g, (_, k) => (todas[k] ?? `{${k}}`));
  return Array.isArray(v) ? v.map(x => (typeof x === 'string' ? poner(x) : x)) : poner(v);
}

/** Texto de la interfaz en el idioma actual. Si es una lista (frases al azar), devuelve la lista. */
export function t(clave, vars = {}) {
  if (clave === 'tutora.nombrePropio') return nombreTutora;
  return textoEn(idioma(), clave, vars);
}

// ---------------------------------------------------------------------------
// El origen de una tarjeta del cuaderno (de qué lección, frase o del diccionario sale).
// Se guarda como una lista corta [clave, datos?, partes?] y se traduce al enseñarlo.
// ---------------------------------------------------------------------------

/** Un origen para guardar: la clave del texto, sus datos ({ id, titulo }…) y los trozos de contenido que van detrás. */
export function origenTarjeta(clave, datos = null, partes = []) {
  const conDatos = datos && Object.keys(datos).length ? datos : null;
  const trozos = partes.filter(p => p !== null && p !== undefined && p !== '');
  if (trozos.length) return [clave, conDatos, trozos];
  return conDatos ? [clave, conDatos] : [clave];
}

/** El origen guardado, como texto para enseñarlo. */
export function textoOrigen(o) {
  if (!o) return '';
  if (!Array.isArray(o)) return tr(o);
  const [clave, datos, partes] = o;
  return [textoEn(idioma(), clave, datos ?? {}), ...(partes ?? []).map(tr)].join(' · ');
}

/** Los orígenes antiguos ({ en, vi… }) se dejan como estaban: tr() ya sabe leerlos. */
export const compactarOrigen = viejo => viejo;

/**
 * Resuelve un texto del contenido: un texto normal o { en, vi… }. La traducción que se enseña es siempre la
 * vietnamita (es la lengua de la estudiante), también con la interfaz en español; si no hay, la inglesa.
 */
export function tr(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor !== 'object' || Array.isArray(valor)) return valor;
  return valor.vi ?? valor.en ?? valor.es ?? Object.values(valor).find(v => v !== null && v !== undefined) ?? '';
}

/** Pone en el HTML fijo (index.html) los textos marcados con data-t, data-t-aria y data-t-title. */
export function aplicarIdioma() {
  document.documentElement.lang = idioma();
  for (const nodo of document.querySelectorAll('[data-t]')) nodo.textContent = t(nodo.dataset.t);
  for (const nodo of document.querySelectorAll('[data-t-aria]')) nodo.setAttribute('aria-label', t(nodo.dataset.tAria));
  for (const nodo of document.querySelectorAll('[data-t-title]')) nodo.title = t(nodo.dataset.tTitle);
}

export async function cambiarIdioma(clave) {
  if (clave !== 'auto' && !visible(clave)) return;
  if (ajuste('idioma') === clave) return;
  await cargarTextos(clave === 'auto' ? idiomaDispositivo() : clave);
  cambiarAjuste('idioma', clave);
  aplicarIdioma();
  window.dispatchEvent(new Event('idioma-cambiado'));
}

window.addEventListener('languagechange', async () => {
  if (ajuste('idioma') !== 'auto') return;
  await cargarTextos(idiomaDispositivo());
  aplicarIdioma();
  window.dispatchEvent(new Event('idioma-cambiado'));
});
