// El plan de cada persona (gratis, plus o max) y lo que da cada uno. El plan lo dice el servidor (js/servidor.js), que
// lo comprueba dos veces: en su base de datos y en Supabase (ver api/inc/planes.php). La app solo lo refleja: lo que
// cuesta dinero de verdad (los PDF completos, los libros…) lo vuelve a comprobar el servidor al darlo.
// El modo desarrollador (#/desarrollador) y la cuenta de desarrollo (78910021) lo tienen todo.
import { esDesarrollador } from './desarrollador.js';
import { usuario } from './servidor.js';

const ORDEN = { gratis: 0, plus: 1, max: 2 };
export const NUMERO_DESARROLLO = 78910021;

export function planActual() {
  if (esDesarrollador()) return 'max';
  const u = usuario();
  if (!u) return 'gratis';
  if (u.dev || u.numero === NUMERO_DESARROLLO) return 'max';
  // si ya pasó la fecha (sin haber vuelto a preguntar al servidor), deja de valer
  if (u.hasta && new Date(u.hasta).getTime() < Date.now()) return 'gratis';
  return ORDEN[u.plan] !== undefined ? u.plan : 'gratis';
}

/** ¿El plan actual incluye lo de `minimo`? (tienePlan('plus') es verdad en Plus y en Max) */
export const tienePlan = minimo => ORDEN[planActual()] >= ORDEN[minimo];

/** Cuántos simulacros en PDF da cada plan (las muestras son de todo el mundo). */
export const SIMULACROS_POR_PLAN = { gratis: 0, plus: 1, max: Infinity };
