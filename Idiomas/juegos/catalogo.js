// =====================================================================
// EL CATÁLOGO DE JUEGOS — qué juegos hay y cuál le toca a cada bloque de cada lección.
// ---------------------------------------------------------------------
// Cada juego es un módulo de esta carpeta que exporta:
//   export const juego = { nombre, icono, tipos: ['dialogo', …], sirve?(bloque, ctx) → bool }
//   export function crear(bloque, ctx) → { nodo, apagar? }      (llama a ctx.hecho() al terminar)
// Para añadir uno: créalo, impórtalo aquí y ponlo en JUEGOS. Nada más: el reparto es automático.
//
// EL REPARTO: para cada tipo de bloque se miran los juegos que le sirven y se elige uno según el
// número de la lección (y cuántos bloques de ese tipo lleva ya la lección). Como cada tipo tiene un
// número distinto de juegos, las combinaciones cambian de una lección a otra y dos lecciones
// seguidas nunca juegan igual el mismo tipo de bloque.
// =====================================================================

import * as pizarra from './pizarra.js';
import * as ejercicio from './ejercicio.js';
import * as teatro from './teatro.js';
import * as cartas from './cartas.js';
import * as linterna from './linterna.js';

// Los tres primeros juegos se escribieron antes del catálogo: aquí se declara para qué sirven.
const JUEGOS = [
  { nombre: 'pizarra', icono: '✏️', tipos: ['explicacion', 'gramatica'], crear: pizarra.crear },
  { nombre: 'teatro', icono: '🎭', tipos: ['dialogo'], crear: teatro.crear },
  { nombre: 'cartas', icono: '🃏', tipos: ['vocabulario'], crear: cartas.crear },
  { nombre: 'linterna', icono: '🏮', tipos: ['texto'], crear: linterna.crear },
  { nombre: 'ejercicio', icono: '⭐', tipos: ['test', 'huecos', 'ordenar', 'escribir'], crear: ejercicio.crear },
];

/** Añade juegos al catálogo (módulos con «juego» y «crear»). */
export function registrar(...modulos) {
  for (const m of modulos) JUEGOS.push({ ...m.juego, crear: m.crear });
}

// Un salto distinto por tipo, para que los tipos no avancen todos a la vez.
const SALTO = { explicacion: 0, dialogo: 1, vocabulario: 2, gramatica: 3, texto: 4, test: 0, huecos: 1, ordenar: 2, escribir: 3 };

/**
 * El juego que le toca a un bloque. «n» es el número de la lección en el curso y «k» cuántos bloques
 * de ese tipo van ya en la lección (los ejercicios se repiten: así cada uno sale distinto).
 */
export function elegir(tipo, bloque, ctx, n, k = 0) {
  const candidatos = JUEGOS.filter(j => j.tipos.includes(tipo) && (!j.sirve || j.sirve(bloque, ctx)));
  if (!candidatos.length) return null;
  // Para probar un juego: localStorage «paglot-juego-forzado» = { "dialogo": "telefono" }
  const forzado = probar()[tipo];
  if (forzado) return candidatos.find(j => j.nombre === forzado) ?? candidatos[0];
  return candidatos[(n + (SALTO[tipo] ?? 0) + k * 3) % candidatos.length];
}

export const todos = () => JUEGOS.map(j => j.nombre);

/** Lo que pide la prueba de un juego (solo en desarrollo): { tipo: nombre, empezar: tipo }. */
export function probar() {
  try { return JSON.parse(localStorage.getItem('paglot-juego-forzado') ?? '{}') ?? {}; } catch { return {}; }
}
