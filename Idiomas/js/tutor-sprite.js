// La tutora del curso elegido. Cada curso tiene la suya:
// - casi todas son un diseño (cursos/<id>/tutora.js) sobre el personaje común de tutora-base.js;
// - un curso puede traer su propio dibujo completo (cursos/<id>/tutor-sprite.js), como el de español.

import { curso, hayCurso } from './curso.js';
import { fabricar, EXPRESIONES_VALIDAS } from './tutora-base.js';

const VERSION = new URL(import.meta.url).searchParams.get('v');
const conVersion = archivo => (VERSION && VERSION !== '__VERSION__' ? `${archivo}?v=${VERSION}` : archivo);

/** Carga el dibujo de la tutora de un curso: { crearSprite, rejilla }. */
export async function dibujoDe(c) {
  if (c.sprite === 'propio') return import(conVersion(`../${c.carpeta}/tutor-sprite.js`));
  const diseno = await import(conVersion(`../${c.carpeta}/tutora.js`));
  return fabricar(diseno.default);
}

// Sin curso elegido no hay tutora en pantalla: un dibujo vacío para que nada falle.
const vacio = { crearSprite: () => ({ expresion: 'normal', hablando: false, reaccionar() {}, parar() {} }), rejilla: () => [] };
const dibujo = hayCurso ? await dibujoDe(curso).catch(() => vacio) : vacio;

export const crearSprite = dibujo.crearSprite;
export const rejilla = dibujo.rejilla;
export { EXPRESIONES_VALIDAS };
