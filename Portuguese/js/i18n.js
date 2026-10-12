// Idioma de la interfaz (inglés o vietnamita).
// OJO: el idioma que se APRENDE es siempre el PORTUGUÉS (europeo). Este módulo solo decide
// en qué idioma se muestran los menús, las explicaciones y las traducciones.
//
// - Los textos de la interfaz están en locales/en.json y locales/vi.json.
// - t('clave.con.puntos', { n: 3 }) devuelve el texto del idioma actual.
// - tr(valor) elige el idioma de un texto de las lecciones: "texto" o { "en": "…", "vi": "…" }.

export const IDIOMAS = [
  { codigo: 'en', nombre: 'English', local: 'en-GB' },
  { codigo: 'vi', nombre: 'Tiếng Việt', local: 'vi-VN' },
];
export const IDIOMA_BASE = 'en';

const CLAVE = 'ola-idioma';
const CARPETA = 'locales/';

let actual = idiomaInicial();
let textos = {};
const avisadas = new Set();

function valido(codigo) {
  return IDIOMAS.some(i => i.codigo === codigo);
}

/** Idioma guardado; si no hay, el del navegador (vietnamita si lo usa, inglés si no). */
function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (valido(guardado)) return guardado;
  } catch { /* sin almacenamiento */ }
  const navegador = (globalThis.navigator?.languages ?? [globalThis.navigator?.language ?? ''])
    .map(l => String(l).toLowerCase());
  return navegador.some(l => l.startsWith('vi')) ? 'vi' : IDIOMA_BASE;
}

export function hayIdiomaGuardado() {
  try { return valido(localStorage.getItem(CLAVE)); } catch { return false; }
}

/** Carga los dos archivos de idioma (se usan los dos: el base sirve de reserva). */
export async function cargarIdiomas(conVersion = archivo => archivo) {
  const leer = async codigo => {
    const respuesta = await fetch(conVersion(`${CARPETA}${codigo}.json`), { cache: 'no-cache' });
    if (!respuesta.ok) throw new Error(`${CARPETA}${codigo}.json: ${respuesta.status}`);
    return respuesta.json();
  };
  const lista = await Promise.all(IDIOMAS.map(async i => [i.codigo, await leer(i.codigo)]));
  ponerTextos(Object.fromEntries(lista));
  aplicarIdiomaAlDocumento();
}

/** Para las pruebas (y por si algún día se cargan de otra forma). */
export function ponerTextos(diccionarios) {
  textos = diccionarios;
}

export function idioma() {
  return actual;
}

/** Código para Intl (fechas, horas). */
export function localeActual() {
  return IDIOMAS.find(i => i.codigo === actual)?.local ?? 'en-GB';
}

export function cambiarIdioma(codigo, { guardar = true } = {}) {
  if (!valido(codigo)) return;
  const cambia = codigo !== actual;
  actual = codigo;
  if (guardar) {
    try { localStorage.setItem(CLAVE, codigo); } catch { /* sin almacenamiento */ }
  }
  aplicarIdiomaAlDocumento();
  if (cambia) globalThis.dispatchEvent?.(new CustomEvent('idioma-cambiado', { detail: codigo }));
}

function aplicarIdiomaAlDocumento() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = actual;
  traducirPagina(document);
}

/**
 * Textos fijos de index.html:
 * data-i18n="clave" (contenido), data-i18n-aria-label, data-i18n-title, data-i18n-content (meta).
 */
export function traducirPagina(raiz) {
  for (const nodo of raiz.querySelectorAll('[data-i18n]')) nodo.textContent = t(nodo.dataset.i18n);
  for (const nodo of raiz.querySelectorAll('[data-i18n-aria-label]')) nodo.setAttribute('aria-label', t(nodo.dataset.i18nAriaLabel));
  for (const nodo of raiz.querySelectorAll('[data-i18n-title]')) nodo.title = t(nodo.dataset.i18nTitle);
  for (const nodo of raiz.querySelectorAll('[data-i18n-content]')) nodo.setAttribute('content', t(nodo.dataset.i18nContent));
}

function buscar(diccionario, clave) {
  return clave.split('.').reduce((nodo, parte) => (nodo && typeof nodo === 'object' ? nodo[parte] : undefined), diccionario);
}

function crudo(clave) {
  const valor = buscar(textos[actual], clave) ?? buscar(textos[IDIOMA_BASE], clave);
  if (valor === undefined && !avisadas.has(clave)) {
    avisadas.add(clave);
    console.warn(`[i18n] Falta la clave «${clave}»`);
  }
  return valor;
}

function interpolar(texto, vars) {
  return String(texto).replace(/\{(\w+)\}/g, (todo, nombre) => (vars[nombre] ?? todo));
}

/**
 * Texto de la interfaz. Con vars.n y un valor { "one": …, "other": … } elige el plural.
 * Si la clave no existe, devuelve la propia clave (y avisa en la consola una vez).
 */
export function t(clave, vars = {}) {
  let valor = crudo(clave);
  if (valor === undefined) return clave;
  if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
    const forma = new Intl.PluralRules(localeActual()).select(Number(vars.n ?? 0));
    valor = valor[forma] ?? valor.other ?? Object.values(valor)[0];
  }
  return interpolar(valor, vars);
}

/** Lista de textos (felicitaciones, frases de la tutora…). */
export function lista(clave, vars = {}) {
  const valor = crudo(clave);
  return Array.isArray(valor) ? valor.map(v => interpolar(v, vars)) : [];
}

/**
 * Texto de las lecciones en el idioma de la interfaz.
 * Admite "texto" (igual para todos) o { "en": "…", "vi": "…" } (si falta el idioma, se usa el inglés).
 * Las listas se traducen elemento a elemento.
 */
export function tr(valor) {
  if (valor === undefined || valor === null) return '';
  if (Array.isArray(valor)) return valor.map(tr);
  if (typeof valor === 'object') {
    return valor[actual] ?? valor[IDIOMA_BASE] ?? Object.values(valor).find(v => typeof v === 'string') ?? '';
  }
  return String(valor);
}

/** ¿Es un texto traducible válido? ("texto" o { "en": "…", … } con algún texto). */
export function esTextoLocalizado(valor) {
  if (typeof valor === 'string') return valor.trim() !== '';
  if (Array.isArray(valor)) return valor.length > 0 && valor.every(esTextoLocalizado);
  return Boolean(valor) && typeof valor === 'object'
    && Object.values(valor).some(v => typeof v === 'string' ? v.trim() !== '' : Array.isArray(v) && v.length > 0);
}

/** Fecha corta en el idioma de la interfaz. */
export function fechaCorta(ms) {
  return new Date(ms).toLocaleDateString(localeActual(), { day: 'numeric', month: 'short' });
}

export function horaCorta(fecha) {
  return fecha.toLocaleTimeString(localeActual(), { hour: '2-digit', minute: '2-digit' });
}
