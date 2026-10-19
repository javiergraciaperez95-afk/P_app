// Informes de errores anónimos (decisión del 19-10-2026). Si la app falla en el móvil o el navegador de alguien, se
// manda a la nube (función paglot_error de _herramientas/supabase-errores-e-ideas.sql) solo esto: el mensaje del
// error, dónde del código, la pantalla (#/leccion/012), el curso, la versión de la app y el navegador («Chrome 141 ·
// Android»). Nada personal: ni el número de cuenta, ni el correo, ni lo que se ha escrito. Lo dice el aviso legal.
// Como mucho 5 por visita y cada error distinto una sola vez. Con la nube apagada (pruebas automáticas) no se manda nada.

import { nubeActiva, rpc } from './nube.js';
import { curso } from './curso.js';

const MAXIMO = 5;
const VERSION = new URL(import.meta.url).searchParams.get('v') ?? '';
const enviados = new Set();

/** «Chrome 141 · Android», sin el resto de la cadena del navegador (que casi identifica a una persona). */
function navegador() {
  const ua = navigator.userAgent ?? '';
  const [, nombre, version] = ua.match(/(Edg|OPR|SamsungBrowser|Firefox|Chrome|Version)\/(\d+)/) ?? [];
  const que = { Edg: 'Edge', OPR: 'Opera', SamsungBrowser: 'Samsung', Version: 'Safari' }[nombre] ?? nombre ?? '?';
  const sistema = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows'
    : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '?';
  return `${que} ${version ?? ''} · ${sistema}${window.Capacitor ? ' · APK' : ''}`.replace(/\s+/g, ' ');
}

/** Solo los errores de la app: los de extensiones del navegador o de otras webs no son nuestros. */
function esNuestro(archivo) {
  if (!archivo) return false;
  try { return new URL(archivo, location.href).origin === location.origin; } catch { return false; }
}

/** El mensaje sin nada que pueda ser de la persona (lo pide el informe legal del 19-10): sin correos, sin números largos
 *  (el de la cuenta), sin lo que va detrás de «?» o «#» en una dirección y sin textos largos entre comillas (podrían ser
 *  algo que ha escrito). Lo corto entre comillas (el nombre de una propiedad) se queda: ayuda a encontrar el fallo. */
export function limpiarMensaje(texto) {
  return String(texto ?? '')
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[correo]')
    .replace(/\d[\d\s-]{5,}\d/g, '[número]')
    .replace(/(https?:\/\/[^\s?#'"]*)[?#][^\s'"]*/g, '$1')
    .replace(/(["'«`])([^"'»`]{25,})(["'»`])/g, '$1…$3')
    .slice(0, 300);
}

// Ruido conocido que no es un fallo de la app.
const RUIDO = /ResizeObserver loop|Script error\.?$|AbortError|The operation was aborted|NetworkError|Failed to fetch|Load failed/i;

function mandar(mensaje, donde) {
  if (!nubeActiva || enviados.size >= MAXIMO || !mensaje || RUIDO.test(mensaje)) return;
  const clave = `${mensaje}|${donde}`;
  if (enviados.has(clave)) return;
  enviados.add(clave);
  // (las rutas de la app, sin el dominio ni la versión: «js/vistas/leccion.js:120:7»)
  const corto = String(donde ?? '').replace(location.origin + '/', '').replace(/\?v=[^:]*/, '');
  rpc('paglot_error', {
    p: {
      mensaje: limpiarMensaje(mensaje),
      donde: corto.slice(0, 200),
      // solo una ruta de la app («#/leccion/012»): nunca lo que traen los enlaces de los correos (#access_token=…)
      pantalla: (location.hash.match(/^#\/[\w/-]*/)?.[0] ?? '').slice(0, 80),
      curso: curso.id,
      version: VERSION,
      navegador: navegador(),
    },
  }).catch(() => { /* sin conexión, o la tabla aún no existe: no pasa nada */ });
}

window.addEventListener('error', e => {
  if (!esNuestro(e.filename)) return;
  mandar(e.message, `${e.filename}:${e.lineno}:${e.colno}`);
});
window.addEventListener('unhandledrejection', e => {
  const motivo = e.reason;
  // la primera línea de la pila que sea de la app dice dónde
  const donde = String(motivo?.stack ?? '').split('\n').map(l => l.match(/(https?:\/\/[^\s)]+):(\d+):(\d+)/)).find(m => m && esNuestro(m[1]));
  if (!donde) return;
  mandar(motivo?.message ?? String(motivo), `${donde[1]}:${donde[2]}:${donde[3]}`);
});
