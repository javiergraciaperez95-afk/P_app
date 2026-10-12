// Conversión entre los datos locales (progress.js) y las filas de las tablas de Supabase
// (ver supabase/esquema.sql). No usa ni el DOM ni Supabase: se puede probar con Node.
//
// Cada fila lleva «client_ts», la hora (ms) de su último cambio en el dispositivo:
// sirve para juntar los datos de varios dispositivos igual que en local (campo «t»).
// Las claves primarias de cada tabla impiden filas duplicadas: guardar otra vez la
// misma lección o el mismo ejercicio actualiza su fila (upsert), nunca crea otra.

import { completar } from './progress.js';

export const TABLAS = {
  unidades: 'portuguese_units',
  lecciones: 'portuguese_lessons',
  perfil: 'portuguese_profiles',
  progresoLecciones: 'portuguese_lesson_progress',
  progresoEjercicios: 'portuguese_exercise_progress',
  cuaderno: 'portuguese_notebook_cards',
  actividad: 'portuguese_daily_activity',
};

/** Columnas que se leen y escriben de cada tabla del usuario, y su clave primaria. */
export const COLUMNAS = {
  perfil: { clave: ['user_id'], campos: ['user_id', 'display_name', 'ui_language', 'reset_at', 'client_ts'] },
  progresoLecciones: { clave: ['user_id', 'lesson_id'], campos: ['user_id', 'lesson_id', 'opened', 'completed', 'completed_ms', 'client_ts'] },
  progresoEjercicios: {
    clave: ['user_id', 'lesson_id', 'exercise_id'],
    campos: ['user_id', 'lesson_id', 'exercise_id', 'attempts', 'correct', 'wrong', 'last_correct', 'client_ts'],
  },
  cuaderno: {
    clave: ['user_id', 'card_id'],
    campos: ['user_id', 'card_id', 'deleted', 'kind', 'portuguese', 'translation', 'pronunciation', 'note', 'origin', 'created_ms',
      'srs_repetitions', 'srs_interval', 'srs_ease', 'srs_lapses', 'srs_due', 'client_ts'],
  },
  actividad: { clave: ['user_id', 'day'], campos: ['user_id', 'day', 'exercises', 'reviews', 'client_ts'] },
};

/** Orden de escritura: el progreso de una lección antes que el de sus ejercicios (clave foránea). */
export const ORDEN = ['perfil', 'progresoLecciones', 'progresoEjercicios', 'cuaderno', 'actividad'];

const MAX_EXERCISE_ID = 200;
const vacioANull = v => (v === '' || v === undefined ? null : v);
const entero = v => Math.max(0, Math.round(Number(v) || 0));

/**
 * Datos locales → filas. Solo se incluyen las lecciones que existen en el catálogo de
 * Supabase (leccionesConocidas), porque las filas de progreso tienen clave foránea a él.
 */
export function datosAFilas(datos, userId, { idiomaInterfaz = 'en', leccionesConocidas = null } = {}) {
  const d = completar(datos);
  const conocida = id => !leccionesConocidas || leccionesConocidas.has(id);
  const filas = { perfil: [], progresoLecciones: [], progresoEjercicios: [], cuaderno: [], actividad: [] };
  const omitidas = new Set();

  filas.perfil.push({
    user_id: userId,
    display_name: vacioANull(d.perfil.nombre?.slice(0, 40)),
    ui_language: idiomaInterfaz,
    reset_at: entero(d.reiniciado),
    client_ts: entero(d.perfil.t),
  });

  for (const [lessonId, l] of Object.entries(d.lecciones)) {
    if (!conocida(lessonId)) {
      omitidas.add(lessonId);
      continue;
    }
    filas.progresoLecciones.push({
      user_id: userId,
      lesson_id: lessonId,
      opened: Boolean(l.abierta),
      completed: Boolean(l.terminada),
      completed_ms: l.terminada ? entero(l.terminadaEn ?? l.t) : null,
      client_ts: entero(l.t),
    });
    for (const [exerciseId, e] of Object.entries(l.ejercicios ?? {})) {
      if (exerciseId.length > MAX_EXERCISE_ID) continue;
      filas.progresoEjercicios.push({
        user_id: userId,
        lesson_id: lessonId,
        exercise_id: exerciseId,
        attempts: entero(e.intentos),
        correct: entero(e.aciertos),
        wrong: entero(e.errores),
        last_correct: typeof e.ultimo === 'boolean' ? e.ultimo : null,
        client_ts: entero(e.t ?? l.t),
      });
    }
  }

  for (const c of Object.values(d.cuaderno)) {
    const srs = c.srs ?? {};
    filas.cuaderno.push(c.borrada
      ? {
        user_id: userId, card_id: c.id, deleted: true, kind: 'palabra', portuguese: c.id, translation: null, pronunciation: null,
        note: null, origin: null, created_ms: 0, srs_repetitions: 0, srs_interval: 0, srs_ease: 2.5, srs_lapses: 0, srs_due: 0,
        client_ts: entero(c.t),
      }
      : {
        user_id: userId,
        card_id: c.id,
        deleted: false,
        kind: c.tipo === 'frase' ? 'frase' : 'palabra',
        portuguese: c.pt,
        translation: vacioANull(c.trad),
        pronunciation: vacioANull(c.pron),
        note: vacioANull(c.nota),
        origin: vacioANull(c.origen),
        created_ms: entero(c.creada),
        srs_repetitions: entero(srs.repeticiones),
        srs_interval: entero(srs.intervalo),
        srs_ease: Number(srs.facilidad ?? 2.5),
        srs_lapses: entero(srs.lapsos),
        srs_due: entero(srs.vence),
        client_ts: entero(c.t),
      });
  }

  for (const [day, a] of Object.entries(d.actividad)) {
    filas.actividad.push({ user_id: userId, day, exercises: entero(a.ejercicios), reviews: entero(a.repasos), client_ts: entero(a.t) });
  }
  return { filas, omitidas: [...omitidas] };
}

/** Filas de Supabase → datos locales (null si el usuario aún no tiene nada guardado). */
export function filasADatos({ perfil = [], progresoLecciones = [], progresoEjercicios = [], cuaderno = [], actividad = [] }) {
  const p = perfil[0];
  if (!p && !progresoLecciones.length && !cuaderno.length && !actividad.length) return null;
  const datos = {
    reiniciado: Number(p?.reset_at ?? 0),
    perfil: { nombre: p?.display_name ?? '', t: Number(p?.client_ts ?? 0) },
    lecciones: {},
    cuaderno: {},
    actividad: {},
  };
  for (const f of progresoLecciones) {
    const l = { terminada: f.completed, abierta: f.opened, ejercicios: {}, t: Number(f.client_ts) };
    if (f.completed && f.completed_ms) l.terminadaEn = Number(f.completed_ms);
    datos.lecciones[f.lesson_id] = l;
  }
  for (const f of progresoEjercicios) {
    const l = (datos.lecciones[f.lesson_id] ??= { terminada: false, abierta: true, ejercicios: {}, t: Number(f.client_ts) });
    const e = { intentos: f.attempts, aciertos: f.correct, errores: f.wrong, completado: f.attempts > 0, t: Number(f.client_ts) };
    if (typeof f.last_correct === 'boolean') e.ultimo = f.last_correct;
    l.ejercicios[f.exercise_id] = e;
  }
  for (const f of cuaderno) {
    datos.cuaderno[f.card_id] = f.deleted
      ? { id: f.card_id, borrada: true, t: Number(f.client_ts) }
      : {
        id: f.card_id,
        tipo: f.kind,
        pt: f.portuguese,
        trad: f.translation ?? '',
        pron: f.pronunciation ?? '',
        nota: f.note ?? '',
        origen: f.origin ?? '',
        creada: Number(f.created_ms),
        t: Number(f.client_ts),
        srs: {
          repeticiones: f.srs_repetitions, intervalo: f.srs_interval, facilidad: Number(f.srs_ease), lapsos: f.srs_lapses, vence: Number(f.srs_due),
        },
      };
  }
  for (const f of actividad) {
    datos.actividad[f.day] = { ejercicios: f.exercises, repasos: f.reviews, t: Number(f.client_ts) };
  }
  return datos;
}

/** JSON con las claves ordenadas: así {"en","vi"} y {"vi","en"} se comparan igual. */
function estable(v) {
  if (Array.isArray(v)) return `[${v.map(estable).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${estable(v[k])}`).join(',')}}`;
  if (typeof v === 'number') return String(Number(v));
  return JSON.stringify(v ?? null);
}

export function claveFila(tabla, fila) {
  return COLUMNAS[tabla].clave.map(c => fila[c]).join('\u0001');
}

function firma(tabla, fila) {
  return estable(Object.fromEntries(COLUMNAS[tabla].campos.map(c => [c, fila[c] ?? null])));
}

/** Filas locales que no están en la nube o que han cambiado (lo único que hay que subir). */
export function filasCambiadas(locales, remotas) {
  const cambios = {};
  for (const tabla of ORDEN) {
    const enNube = new Map((remotas[tabla] ?? []).map(f => [claveFila(tabla, f), firma(tabla, f)]));
    cambios[tabla] = (locales[tabla] ?? []).filter(f => enNube.get(claveFila(tabla, f)) !== firma(tabla, f));
  }
  return cambios;
}
