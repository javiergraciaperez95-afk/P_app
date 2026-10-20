// El progreso de los dos exámenes de la nacionalidad: el CCSE (las 300 preguntas oficiales) y las prácticas del DELE.
// Se guarda en el dispositivo junto al resto del curso (y va a la nube con él: ver EXTRAS en progress.js). Cada
// entrada lleva «t», la hora de su último cambio, para juntar sin perder nada lo de dos móviles.
//   ccse      { [id]: { ok, ko, racha, ult, t } }   aciertos, fallos, aciertos seguidos y si la última fue bien
//   ccse-sim  { [hora]: { aciertos, total, porTarea: { 1: [bien, de] … }, t } }   los simulacros hechos
//   dele      { [examen/prueba]: { puntos, max, t, respuestas? } }                 las pruebas del DELE hechas

import { clave } from './curso.js';
import { anotarEstudio } from './progress.js';

const leer = nombre => { try { return JSON.parse(localStorage.getItem(clave(nombre))) ?? {}; } catch { return {}; } };
const escribir = (nombre, valor) => {
  try { localStorage.setItem(clave(nombre), JSON.stringify(valor)); } catch { /* sin almacenamiento */ }
  window.dispatchEvent(new CustomEvent('examen-cambiado', { detail: nombre }));
};

// Una pregunta está «dominada» con dos aciertos seguidos (y vuelve a «por aprender» al fallarla).
export const SEGUIDOS_PARA_DOMINAR = 2;

// ---------------------------------------------------------------------------
// CCSE
// ---------------------------------------------------------------------------

/** El estado de una pregunta: nueva · aprendiendo · dominada (y los números). */
export function estadoCcse(id) {
  const p = leer('ccse')[id];
  if (!p) return { clave: 'nueva', ok: 0, ko: 0, racha: 0 };
  return { ...p, clave: p.racha >= SEGUIDOS_PARA_DOMINAR ? 'dominada' : 'aprendiendo' };
}

/** Todas las respuestas guardadas: { id: { ok, ko, racha, ult, t } }. */
export const respuestasCcse = () => leer('ccse');

/** Apunta una respuesta a una pregunta. */
export function responderCcse(id, bien) {
  const todo = leer('ccse');
  const p = todo[id] ?? { ok: 0, ko: 0, racha: 0 };
  todo[id] = { ok: p.ok + (bien ? 1 : 0), ko: p.ko + (bien ? 0 : 1), racha: bien ? p.racha + 1 : 0, ult: bien, t: Date.now() };
  escribir('ccse', todo);
  anotarDia('ccse');
}

/** Cuántas hay dominadas, aprendiéndose y sin ver, de una lista de preguntas (todas, o las de una tarea). */
export function resumenCcse(preguntas) {
  const todo = leer('ccse');
  const r = { total: preguntas.length, dominadas: 0, aprendiendo: 0, nuevas: 0, falladas: 0 };
  for (const q of preguntas) {
    const p = todo[q.id];
    if (!p) r.nuevas += 1;
    else if (p.racha >= SEGUIDOS_PARA_DOMINAR) r.dominadas += 1;
    else r.aprendiendo += 1;
    if (p && p.ult === false) r.falladas += 1;
  }
  return r;
}

/**
 * Las preguntas para una ronda de práctica: primero las falladas la última vez, luego las que se están aprendiendo
 * (las que llevan más tiempo sin verse), luego nuevas, y de relleno alguna dominada para que no se olvide.
 */
export function rondaCcse(preguntas, cuantas = 10) {
  const todo = leer('ccse');
  const azar = lista => lista.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const falladas = azar(preguntas.filter(q => todo[q.id]?.ult === false));
  const aprendiendo = preguntas.filter(q => todo[q.id] && todo[q.id].ult !== false && todo[q.id].racha < SEGUIDOS_PARA_DOMINAR)
    .sort((a, b) => todo[a.id].t - todo[b.id].t);
  const nuevas = azar(preguntas.filter(q => !todo[q.id]));
  const dominadas = preguntas.filter(q => todo[q.id]?.racha >= SEGUIDOS_PARA_DOMINAR).sort((a, b) => todo[a.id].t - todo[b.id].t);
  const ronda = [];
  for (const grupo of [falladas, aprendiendo, nuevas, dominadas]) {
    for (const q of grupo) {
      if (ronda.length >= cuantas) break;
      if (!ronda.includes(q)) ronda.push(q);
    }
  }
  return azar(ronda);
}

/** Un simulacro como el examen: 25 preguntas repartidas por tareas igual que en el CCSE de verdad. */
export function simulacroCcse(preguntas, tareas) {
  const azar = lista => lista.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  return tareas.flatMap(t => azar(preguntas.filter(q => q.t === t.n)).slice(0, t.examen));
}

export function guardarSimulacroCcse({ aciertos, total, porTarea }) {
  const todo = leer('ccse-sim');
  const ahora = Date.now();
  todo[ahora] = { aciertos, total, porTarea, t: ahora };
  escribir('ccse-sim', todo);
}

/** Los simulacros hechos, del más reciente al más antiguo. */
export const simulacrosCcse = () => Object.values(leer('ccse-sim')).sort((a, b) => b.t - a.t);

// ---------------------------------------------------------------------------
// DELE
// ---------------------------------------------------------------------------

/** El resultado guardado de una prueba (examen/prueba, p. ej. «a2-1/lectura»), o null. */
export const resultadoDele = id => leer('dele')[id] ?? null;
export const resultadosDele = () => leer('dele');

export function guardarResultadoDele(id, puntos, max, extra = {}) {
  const todo = leer('dele');
  todo[id] = { puntos, max, ...extra, t: Date.now() };
  escribir('dele', todo);
  anotarDia('dele');
}

// ---------------------------------------------------------------------------
// Lo que se ha hecho cada día (para el plan de hoy en el inicio y los avisos)
// ---------------------------------------------------------------------------

const hoy = () => new Date().toLocaleDateString('sv');

function anotarDia(cosa) {
  const dias = leer('examenes-dias');
  const d = (dias[hoy()] ??= { ccse: 0, dele: 0, t: 0 });
  d[cosa] = (d[cosa] ?? 0) + 1;
  d.t = Date.now();
  // solo se guardan los últimos 60 días
  for (const k of Object.keys(dias).sort().slice(0, -60)) delete dias[k];
  escribir('examenes-dias', dias);
  anotarEstudio(cosa); // y la actividad del día, para la racha y el calendario del perfil
}

/** Lo hecho hoy en los exámenes: { ccse: preguntas respondidas, dele: pruebas terminadas }. */
export const examenesDeHoy = () => leer('examenes-dias')[hoy()] ?? { ccse: 0, dele: 0 };

/** ¿Se ha estudiado algo de los exámenes ese día (aaaa-mm-dd)? */
export const examenesDelDia = dia => leer('examenes-dias')[dia] ?? null;

/** Los nombres con los que se guardan (para la copia en la nube, ver progress.js). */
export const NOMBRES_EXAMENES = ['ccse', 'ccse-sim', 'dele', 'examenes-dias'];
