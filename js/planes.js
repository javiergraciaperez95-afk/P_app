// El plan de cada persona (gratis, plus o max) y lo que da cada uno. Todavía no hay cobros: todo el mundo está en
// «gratis», salvo el modo desarrollador, que lo tiene todo. Cuando lleguen los pagos, planActual() leerá el plan de la
// cuenta (comprobado en el servidor) y lo demás de la app no tendrá que cambiar: pregunta siempre por aquí.
import { esDesarrollador } from './desarrollador.js';

const ORDEN = { gratis: 0, plus: 1, max: 2 };

export function planActual() {
  if (esDesarrollador()) return 'max';
  return 'gratis';
}

/** ¿El plan actual incluye lo de `minimo`? (tienePlan('plus') es verdad en Plus y en Max) */
export const tienePlan = minimo => ORDEN[planActual()] >= ORDEN[minimo];

/** Cuántos simulacros en PDF da cada plan (las muestras son de todo el mundo). */
export const SIMULACROS_POR_PLAN = { gratis: 0, plus: 1, max: Infinity };
