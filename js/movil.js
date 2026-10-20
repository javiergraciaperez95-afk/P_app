// Lo que hace falta cuando la app va instalada en un móvil (empaquetada con Capacitor):
// el botón «atrás» de Android, la pregunta antes de salir de un juego y los enlaces de los correos.
// En el navegador casi nada de esto se activa; solo la pregunta al salir del juego.

import { t } from './i18n.js';
import { el } from './dom.js';
import { hayCurso } from './curso.js';
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

/** Antes de salir de una lección en modo juego se pregunta. Devuelve true si se puede salir. */
export function salirDelJuego() {
  if (!enJuego()) return Promise.resolve(true);
  return confirmar(t('juego.salir.pregunta'), { si: t('juego.salir.si'), no: t('juego.salir.no') });
}

// --- Solo instalada ---------------------------------------------------------------------------

/** Pantallas principales: el inicio, la lista de lecciones y la de elegir idioma (sin curso elegido, todo menos los créditos). */
function enPrincipal() {
  const hash = location.hash;
  return hayCurso ? ['', '#/', '#/inicio', '#/lecciones', '#/idiomas'].includes(hash) : !['#/creditos', '#/legal', '#/sobre', '#/entrar', '#/precios'].includes(hash);
}

if (piezas?.App) {
  // Botón «atrás»: en la pantalla principal cierra la app; en un juego pregunta; en lo demás vuelve a la principal.
  piezas.App.addListener('backButton', async () => {
    if (cerrarPregunta) { cerrarPregunta(false); return; }
    // una pantalla con algo suyo abierto encima (una hoja, un panel) lo cierra primero: escucha «paglot-atras» y lo cancela
    if (!document.dispatchEvent(new Event('paglot-atras', { cancelable: true }))) return;
    if (enJuego()) {
      if (await salirDelJuego()) location.hash = '#/lecciones';
    } else if (location.hash === '#/bienvenida') {
      location.hash = '#/lecciones'; // «atrás» en la bienvenida la salta
    } else if (enPrincipal()) {
      piezas.App.exitApp();
    } else {
      location.hash = hayCurso ? '#/lecciones' : '#/';
    }
  });

  // Enlaces de los correos (confirmar la cuenta, cambiar la contraseña): abren la app con los datos detrás de «#».
  // Se recarga con ellos para que la parte de cuentas los lea igual que en la web.
  piezas.App.addListener('appUrlOpen', ({ url }) => {
    const i = url.indexOf('#');
    if (i < 0 || !/access_token=|error_description=|type=/.test(url)) return;
    location.hash = url.slice(i);
    location.reload();
  });
}
