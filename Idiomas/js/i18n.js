// Idioma de la interfaz. El contenido de las lecciones conserva su propio idioma.
// - t('clave', { n: 3 }): textos de la aplicación (están en i18n/<idioma>.js).
// - tr(valor): textos del contenido de las lecciones. Pueden ser un texto
//   (igual en los dos idiomas) o un grupo { "en": "…", "vi": "…" }.

import { ajuste, cambiarAjuste, idiomaDispositivo } from './ajustes.js';
import en from './i18n/en.js';
import { curso, nombreDelCurso, nombreTutora, saludo } from './curso.js';

export const IDIOMAS = [
  { clave: 'en', nombre: 'English', corto: 'EN', locale: 'en-GB' },
  { clave: 'vi', nombre: 'Tiếng Việt', corto: 'VI', locale: 'vi-VN' },
  { clave: 'zh', nombre: '中文', corto: '中', locale: 'zh-CN' },
  { clave: 'es', nombre: 'Español', corto: 'ES', locale: 'es-ES' },
  { clave: 'pt', nombre: 'Português', corto: 'PT', locale: 'pt-BR' },
  { clave: 'fr', nombre: 'Français', corto: 'FR', locale: 'fr-FR' },
  { clave: 'ja', nombre: '日本語', corto: 'JA', locale: 'ja-JP' },
  { clave: 'it', nombre: 'Italiano', corto: 'IT', locale: 'it-IT' },
  { clave: 'ko', nombre: '한국어', corto: 'KO', locale: 'ko-KR' },
  { clave: 'ru', nombre: 'Русский', corto: 'RU', locale: 'ru-RU' },
  { clave: 'de', nombre: 'Deutsch', corto: 'DE', locale: 'de-DE' },
  { clave: 'id', nombre: 'Bahasa Indonesia', corto: 'ID', locale: 'id-ID' },
];

// Al abrir solo se cargan los textos del idioma en uso (y el inglés, que es el de reserva): son unos 90 KB por idioma.
// Los demás llegan después, cuando el navegador está libre (para cambiar de idioma al momento).
const CARGAR = {
  vi: () => import('./i18n/vi.js'), zh: () => import('./i18n/zh.js'), es: () => import('./i18n/es.js'),
  pt: () => import('./i18n/pt.js'), fr: () => import('./i18n/fr.js'), ja: () => import('./i18n/ja.js'),
  it: () => import('./i18n/it.js'), ko: () => import('./i18n/ko.js'), de: () => import('./i18n/de.js'),
  ru: () => import('./i18n/ru.js'), id: () => import('./i18n/id.js'),
};
const TEXTOS = { en };
const cargando = {};
function cargarTextos(i) {
  if (TEXTOS[i] || !CARGAR[i]) return Promise.resolve();
  cargando[i] ??= CARGAR[i]().then(m => { TEXTOS[i] = m.default; }).catch(() => { delete cargando[i]; });
  return cargando[i];
}
const pedido = () => { const i = ajuste('idioma'); return i === 'en' || CARGAR[i] ? i : idiomaDispositivo(); };
await cargarTextos(pedido());
const cargarElResto = () => Object.keys(CARGAR).forEach(cargarTextos);
if ('requestIdleCallback' in window) requestIdleCallback(cargarElResto, { timeout: 5000 });
else setTimeout(cargarElResto, 3000);

export function idioma() {
  const i = pedido();
  return TEXTOS[i] ? i : 'en'; // (solo pasa un instante, si el idioma del dispositivo cambia y sus textos aún no han llegado)
}

/** Para fechas y horas: 'en-GB' o 'vi-VN'. */
export function locale() {
  return IDIOMAS.find(i => i.clave === idioma()).locale;
}

function textoEn(i, clave, vars) {
  // Un texto puede tener una versión solo para un curso: «clave@es» gana a «clave» en el curso de español
  // (bromas con palabras en español, ejemplos…).
  const delCursoActual = `${clave}@${curso.id}`;
  const propio = TEXTOS[i]?.[delCursoActual] ?? TEXTOS[i]?.[clave];
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
  if (clave === 'tutora.nombrePropio') return nombreTutora ?? textoEn(idioma(), 'tutora.nombre', vars);
  return textoEn(idioma(), clave, vars);
}

// ---------------------------------------------------------------------------
// El origen de una tarjeta del cuaderno (de qué lección, frase o del diccionario sale).
// Se guarda como una lista corta [clave, datos?, partes?] y se traduce al enseñarlo: así ocupa poco y sale en el idioma
// de la interfaz de ese momento. Los datos antiguos lo traen escrito en los 12 idiomas ({ en, vi… }),
// que llegaba a ser más de la mitad de lo que pesa un cuaderno lleno.
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
  if (!Array.isArray(o)) return tr(o); // un texto, o el formato antiguo { en, vi… }
  const [clave, datos, partes] = o;
  // Como en tr(): si la interfaz y el curso usan el mismo idioma, va en inglés (así se veía con el formato antiguo).
  const i = idioma() === curso.campo ? 'en' : idioma();
  return [textoEn(i, clave, datos ?? {}), ...(partes ?? []).map(tr)].join(' · ');
}

// Los orígenes antiguos se reconocen por su texto en inglés, con las mismas plantillas que los escribieron.
const ORIGENES_CONOCIDOS = ['cuaderno.deLeccion', 'leccion.numero', 'cuaderno.aMano', 'cuaderno.diccionario'];
let patronesDeOrigen = null;
function patrones() {
  patronesDeOrigen ??= ORIGENES_CONOCIDOS.map(clave => {
    const nombres = [];
    const fuente = String(TEXTOS.en[clave]).split(/\{(\w+)\}/)
      .map((trozo, i) => (i % 2 ? (nombres.push(trozo), '(.+?)') : trozo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      .join('');
    return { clave, nombres, re: new RegExp(`^${fuente}$`) };
  });
  return patronesDeOrigen;
}

/** Pasa un origen antiguo ({ en, vi… }) al formato compacto. Si no lo reconoce, lo deja como estaba. */
export function compactarOrigen(viejo) {
  if (!viejo || typeof viejo !== 'object' || Array.isArray(viejo) || typeof viejo.en !== 'string') return viejo;
  const en = viejo.en;
  for (const { clave, nombres, re } of patrones()) {
    const m = en.match(re);
    if (m) return origenTarjeta(clave, Object.fromEntries(nombres.map((n, i) => [n, m[i + 1]])));
  }
  // «Frases · Categoría · Grupo»: los trozos de detrás son contenido; se guardan en un texto o, si cambian, por idioma.
  const frases = TEXTOS.en['menu.frases'];
  if (en === frases || en.startsWith(`${frases} · `)) {
    const trozos = Object.entries(viejo).map(([i, texto]) => [i, String(texto).split(' · ').slice(1)]);
    const cuantos = trozos[0][1].length;
    if (trozos.every(([, x]) => x.length === cuantos)) {
      const partes = Array.from({ length: cuantos }, (_, j) => {
        const parte = Object.fromEntries(trozos.map(([i, x]) => [i, x[j]]));
        return new Set(Object.values(parte)).size === 1 ? parte.en : parte;
      });
      return origenTarjeta('menu.frases', null, partes);
    }
  }
  return viejo;
}

/** Resuelve un texto del contenido: un texto normal o { en, vi }. */
export function tr(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor !== 'object' || Array.isArray(valor)) return valor;
  // Si la interfaz y el curso usan el mismo código, ese campo es el texto estudiado,
  // no su traducción. La traducción disponible por defecto está en «en».
  const i = idioma() === curso.campo ? 'en' : idioma();
  return valor[i] ?? valor.en ?? valor.es ?? Object.values(valor).find(v => v !== null && v !== undefined) ?? '';
}

/** Pone en el HTML fijo (index.html) los textos marcados con data-t, data-t-aria y data-t-title. */
export function aplicarIdioma() {
  document.documentElement.lang = idioma();
  for (const nodo of document.querySelectorAll('[data-t]')) nodo.textContent = t(nodo.dataset.t);
  for (const nodo of document.querySelectorAll('[data-t-aria]')) nodo.setAttribute('aria-label', t(nodo.dataset.tAria));
  for (const nodo of document.querySelectorAll('[data-t-title]')) nodo.title = t(nodo.dataset.tTitle);
}

export async function cambiarIdioma(clave) {
  if (clave !== 'auto' && clave !== 'en' && !CARGAR[clave]) return;
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
