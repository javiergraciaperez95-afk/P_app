// EL EJERCICIO CLÁSICO — el de siempre (test, huecos, ordenar, escribir), solo en su paso.

import { el } from '../js/dom.js';
import { crearEjercicio } from '../js/exercises.js';

/** Un ejercicio de los de siempre, solo en su paso. */
export function crear(bloque, ctx) {
  let hecho = false;
  const nodo = el('div', { class: 'jg-ejercicio' }, crearEjercicio(bloque, ctx.leccion.id, ctx.numeroEjercicio, () => {
    if (!hecho) { hecho = true; ctx.hecho(); }
  }));
  return { nodo };
}
