// Lo que hace falta cuando la app va instalada en el móvil (empaquetada con Capacitor): el botón «atrás» de Android y
// la pregunta antes de salir de un juego. En el navegador solo se activa la pregunta al salir del juego.

import { t } from './i18n.js';
import { el } from './dom.js';
import { sonar } from './sonidos.js';

const piezas = window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins : null;

/** true si la app va instalada (no en un navegador). */
export const instalada = Boolean(piezas);

let cerrarPregunta = null;

/**
 * Pregunta con dos botones y el aspecto de la app. Devuelve una promesa: true si se acepta.
 * Solo puede haber una abierta; el botón «atrás» la cierra como un «no».
 */
export function confirmar(texto, { si, no }) {
  cerrarPregunta?.(false);
  return new Promise(resolver => {
    const responder = valor => {
      cerrarPregunta = null;
      capa.remove();
      document.removeEventListener('keydown', alTeclear);
      resolver(valor);
    };
    const alTeclear = e => { if (e.key === 'Escape') responder(false); };
    const botonNo = el('button', { type: 'button', class: 'boton', onclick: () => { sonar('clic'); responder(false); } }, no);
    const capa = el('div', { class: 'pregunta-capa', role: 'dialog', 'aria-modal': 'true', onclick: e => { if (e.target === capa) responder(false); } },
      el('div', { class: 'pregunta caja' },
        el('p', {}, texto),
        el('div', { class: 'pregunta-botones' },
          botonNo,
          el('button', { type: 'button', class: 'boton boton-secundario', onclick: () => { sonar('clic'); responder(true); } }, si))));
    cerrarPregunta = responder;
    document.addEventListener('keydown', alTeclear);
    document.body.append(capa);
    botonNo.focus();
  });
}

const enJuego = () => Boolean(document.querySelector('.juego'));

/** Antes de salir de una lección en modo juego (o de un examen a medias) se pregunta. Devuelve true si se puede salir. */
export function salirDelJuego() {
  if (document.querySelector('[data-examen-en-curso]')) {
    return confirmar(t('ph.examen.salirPregunta'), { si: t('ph.examen.salirSi'), no: t('ph.examen.salirNo') });
  }
  if (!enJuego()) return Promise.resolve(true);
  return confirmar(t('juego.salir.pregunta'), { si: t('juego.salir.si'), no: t('juego.salir.no') });
}

// --- Solo instalada ---------------------------------------------------------------------------

/** La pantalla de inicio (y la del código): «atrás» desde ellas cierra la app. */
const enPrincipal = () => ['', '#/', '#/inicio', '#/codigo'].includes(location.hash);

// Las pantallas por las que se ha pasado, para que «atrás» vuelva a la anterior de verdad
const pasadas = [location.hash];
let volviendo = false;
window.addEventListener('hashchange', () => {
  if (volviendo) { volviendo = false; return; }
  if (pasadas[pasadas.length - 1] !== location.hash) pasadas.push(location.hash);
  if (pasadas.length > 50) pasadas.shift();
});

if (piezas?.App) {
  // Botón «atrás»: primero cierra lo abierto (las pantallas escuchan «paglot-atras» y lo cancelan); después, a la
  // pantalla anterior; en el inicio sin nada detrás cierra la app; en un juego o un examen pregunta.
  piezas.App.addListener('backButton', async () => {
    if (cerrarPregunta) { cerrarPregunta(false); return; }
    if (!document.dispatchEvent(new Event('paglot-atras', { cancelable: true }))) return;
    if (enJuego() || document.querySelector('[data-examen-en-curso]')) {
      if (await salirDelJuego()) location.hash = enJuego() ? '#/lecciones' : '#/inicio';
    } else if (enPrincipal() || document.body.classList.contains('bloqueada')) {
      piezas.App.exitApp();
    } else if (pasadas.length > 1) {
      pasadas.pop();
      volviendo = true;
      location.hash = pasadas[pasadas.length - 1];
    } else {
      location.hash = '#/inicio';
    }
  });
}
