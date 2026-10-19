// «¡Aún no hemos terminado!»: lo que ve quien intenta entrar en un curso que todavía no está explicado en su idioma
// (hoy, con la interfaz en vietnamita, todos menos el de español: ver paraQuien en curso.js). Salen dos tutoras en
// grande, la de ese curso y la de español, y se vuelve al inicio al tocar el botón o a los pocos segundos.

import { el } from './dom.js';
import { t, idioma } from './i18n.js';
import { CURSOS } from './cursos.js';
import { paraQuien, elegirCurso } from './curso.js';
import { dibujoDe } from './tutor-sprite.js';
import { sonar } from './sonidos.js';

const ESPERA = 8000;

/** Entra en el curso si es para quien usa la interfaz ahora; si aún no lo es, se lo dice. */
export function entrarEnCurso(c) {
  if (paraQuien(c, idioma()) === 'pronto') avisoSinTerminar(c);
  else elegirCurso(c.id);
}

/** Si se acaba de salir de un curso que ya no te tocaba (ver iniciar en app.js), el aviso de ese curso. */
export function avisoPendiente() {
  let id = null;
  try { id = sessionStorage.getItem('paglot-sin-terminar'); sessionStorage.removeItem('paglot-sin-terminar'); } catch { /* sin almacenamiento */ }
  const c = id && CURSOS.find(x => x.id === id);
  if (c) avisoSinTerminar(c);
}

/** El aviso, encima de todo. «alCerrar» decide adónde se va (por defecto, al inicio). */
export function avisoSinTerminar(c, alCerrar = () => { location.hash = '#/'; }) {
  if (document.querySelector('.sin-terminar')) return;
  const sprites = [];
  const tutora = (quien, expresion, gesto) => {
    const canvas = el('canvas', { class: 'sin-terminar-lienzo', width: 48, height: 64 });
    dibujoDe(quien).then(d => {
      if (!canvas.isConnected) return;
      const s = d.crearSprite(canvas);
      s.expresion = expresion;
      setTimeout(() => s.gesto(gesto), 500);
      sprites.push(s);
    }).catch(() => { canvas.hidden = true; });
    return canvas;
  };
  const espanol = CURSOS.find(x => x.id === 'es');
  const boton = el('button', { type: 'button', class: 'boton boton-principal' }, t('pronto.volver'));
  const caja = el('div', {
    class: 'sin-terminar', role: 'alertdialog', 'aria-modal': 'true',
    'aria-labelledby': 'sin-terminar-titulo', 'aria-describedby': 'sin-terminar-texto',
  },
  el('div', { class: 'sin-terminar-caja' },
    el('div', { class: 'sin-terminar-tutoras', 'aria-hidden': 'true' },
      tutora(c, 'apurada', 'rascarse'),
      c.id !== 'es' && tutora(espanol, 'contenta', 'saludar')),
    el('h2', { id: 'sin-terminar-titulo' }, t('pronto.titulo')),
    el('p', { id: 'sin-terminar-texto' }, t('pronto.texto')),
    boton));

  let reloj = null;
  const cerrar = () => {
    clearTimeout(reloj);
    removeEventListener('keydown', teclas);
    sprites.forEach(s => s.parar());
    caja.remove();
    alCerrar();
  };
  const teclas = e => { if (e.key === 'Escape') cerrar(); };
  boton.addEventListener('click', () => { sonar('pagina'); cerrar(); });
  caja.addEventListener('click', e => { if (e.target === caja) cerrar(); });
  addEventListener('keydown', teclas);
  reloj = setTimeout(cerrar, ESPERA);

  document.body.append(caja);
  sonar('sorpresa');
  boton.focus();
}
