// Todos los datos del estudiante: perfil, progreso de lecciones, cuaderno y actividad.
// Se guardan en el navegador (localStorage) y, si hay sesión iniciada, se
// sincronizan con Supabase (ver sync.js y filas.js). Cada entrada lleva «t», la hora
// de su último cambio, para poder juntar los datos de varios dispositivos.
//
// El idioma de la interfaz NO se guarda aquí (ver i18n.js): cambiar de idioma
// nunca toca el progreso.

import { nuevaTarjeta } from './srs.js';

const CLAVE = 'ola-datos-v1';
export const MARCA_APP = 'ola-portugues';
export const VERSION_DATOS = 1;

let datos = cargar();
const oyentes = new Set();

export function vacio() {
  return { app: MARCA_APP, version: VERSION_DATOS, reiniciado: 0, perfil: { nombre: '', t: 0 }, lecciones: {}, cuaderno: {}, actividad: {} };
}

export function completar(d) {
  const base = vacio();
  return {
    ...base,
    ...d,
    app: MARCA_APP,
    version: VERSION_DATOS,
    reiniciado: d.reiniciado ?? 0,
    perfil: { ...base.perfil, ...(d.perfil ?? {}) },
    lecciones: d.lecciones ?? {},
    cuaderno: d.cuaderno ?? {},
    actividad: d.actividad ?? {},
  };
}

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado && typeof guardado === 'object') return completar(guardado);
  } catch {
    // Datos dañados o almacenamiento bloqueado: empezamos de cero.
  }
  return vacio();
}

/** Guarda en el navegador y avisa a quien escuche (por ejemplo, la sincronización). */
function guardar({ avisar = true } = {}) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento (modo privado, etc.): los datos duran solo esta visita.
  }
  if (avisar) for (const fn of oyentes) fn();
}

export function alCambiar(fn) {
  oyentes.add(fn);
}

export function todosLosDatos() {
  return datos;
}

/** Sustituye los datos (tras juntarlos con los de la nube). */
export function reemplazarDatos(nuevos) {
  datos = completar(nuevos);
  guardar({ avisar: false });
}

export function claveDia(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function anotarActividad(campo) {
  const dia = (datos.actividad[claveDia()] ??= { ejercicios: 0, repasos: 0, t: 0 });
  dia[campo] += 1;
  dia.t = Date.now();
}

// ---------------------------------------------------------------------------
// Perfil
// ---------------------------------------------------------------------------

export function nombre() {
  return datos.perfil.nombre;
}

export function cambiarNombre(nuevo) {
  datos.perfil = { ...datos.perfil, nombre: nuevo.trim().slice(0, 40), t: Date.now() };
  guardar();
}

// ---------------------------------------------------------------------------
// Lecciones y ejercicios
// ---------------------------------------------------------------------------

function leccion(id) {
  datos.lecciones[id] ??= { terminada: false, abierta: false, ejercicios: {}, t: Date.now() };
  return datos.lecciones[id];
}

/** Datos de un ejercicio: { intentos, aciertos, errores, completado }. */
export function estadoEjercicio(idLeccion, idEjercicio) {
  return datos.lecciones[idLeccion]?.ejercicios[idEjercicio]
    ?? { intentos: 0, aciertos: 0, errores: 0, completado: false };
}

export function registrarRespuesta(idLeccion, idEjercicio, acierto) {
  const l = leccion(idLeccion);
  const ahora = Date.now();
  const e = l.ejercicios[idEjercicio] ?? { intentos: 0, aciertos: 0, errores: 0, completado: false };
  e.intentos += 1;
  if (acierto) e.aciertos += 1;
  else e.errores += 1;
  e.completado = true;
  e.ultimo = acierto;
  e.t = ahora;
  l.ejercicios[idEjercicio] = e;
  l.t = ahora;
  anotarActividad('ejercicios');
  guardar();
  return e;
}

/** Ejercicios cuya última respuesta fue un fallo: [{ idLeccion, idEjercicio }]. */
export function ejerciciosFallados() {
  const lista = [];
  for (const [idLeccion, l] of Object.entries(datos.lecciones)) {
    for (const [idEjercicio, e] of Object.entries(l.ejercicios ?? {})) {
      if (e.ultimo === false) lista.push({ idLeccion, idEjercicio });
    }
  }
  return lista;
}

/** Marcar como terminada otra vez no cambia nada (ni la fecha): así no hay registros duplicados. */
export function marcarTerminada(idLeccion) {
  const l = leccion(idLeccion);
  if (l.terminada) return;
  const ahora = Date.now();
  l.terminada = true;
  l.abierta = true;
  l.terminadaEn ??= ahora;
  l.t = ahora;
  guardar();
}

export function marcarAbierta(idLeccion) {
  if (datos.lecciones[idLeccion]?.abierta) return;
  const l = leccion(idLeccion);
  l.abierta = true;
  l.t = Date.now();
  guardar();
}

/** Resumen de una lección. idsEjercicios: los ejercicios que tiene ahora el archivo. */
export function resumenLeccion(idLeccion, idsEjercicios) {
  const guardada = datos.lecciones[idLeccion];
  let completados = 0, aciertos = 0, errores = 0;
  for (const id of idsEjercicios) {
    const e = guardada?.ejercicios[id];
    if (!e) continue;
    if (e.completado) completados += 1;
    aciertos += e.aciertos;
    errores += e.errores;
  }
  const total = idsEjercicios.length;
  const terminada = Boolean(guardada?.terminada);
  let estado = 'nueva';
  if (terminada) estado = 'terminada';
  else if (guardada && (completados > 0 || guardada.abierta)) estado = 'curso';
  return { total, completados, aciertos, errores, terminada, estado };
}

export function hayProgreso() {
  return Object.keys(datos.lecciones).length > 0 || tarjetas().length > 0;
}

// ---------------------------------------------------------------------------
// Cuaderno (palabras y frases guardadas) y repaso
// ---------------------------------------------------------------------------

/** Identificador estable de una tarjeta: el texto en portugués, en minúsculas. */
export function idDeTarjeta(pt) {
  return String(pt).trim().toLocaleLowerCase('pt').replace(/\s+/g, ' ');
}

/** Tarjetas del cuaderno que no se han borrado. */
export function tarjetas() {
  return Object.values(datos.cuaderno).filter(t => !t.borrada);
}

export function estaEnCuaderno(pt) {
  const t = datos.cuaderno[idDeTarjeta(pt)];
  return Boolean(t && !t.borrada);
}

/**
 * item: { pt, trad, pron?, nota?, tipo: 'palabra' | 'frase', origen? }
 * «trad», «pron» y «nota» pueden ser texto o { en, vi }: así la tarjeta se ve
 * en el idioma de la interfaz que haya en cada momento.
 */
export function guardarEnCuaderno(item) {
  const id = idDeTarjeta(item.pt);
  const ahora = Date.now();
  datos.cuaderno[id] = {
    id,
    tipo: item.tipo ?? 'palabra',
    pt: item.pt,
    trad: item.trad ?? '',
    pron: item.pron ?? '',
    nota: item.nota ?? '',
    origen: item.origen ?? '',
    creada: ahora,
    t: ahora,
    srs: nuevaTarjeta(),
  };
  guardar();
}

export function quitarDelCuaderno(pt) {
  const id = idDeTarjeta(pt);
  if (!datos.cuaderno[id]) return;
  // Se deja una marca de borrado para que la nube también la borre.
  datos.cuaderno[id] = { id, borrada: true, t: Date.now() };
  guardar();
}

export function actualizarTarjeta(id, srs) {
  const tarjeta = datos.cuaderno[id];
  if (!tarjeta || tarjeta.borrada) return;
  tarjeta.srs = srs;
  tarjeta.t = Date.now();
  anotarActividad('repasos');
  guardar();
}

// ---------------------------------------------------------------------------
// Estadísticas
// ---------------------------------------------------------------------------

export function actividad() {
  return datos.actividad;
}

/** Días seguidos con actividad, contando hacia atrás desde hoy (o ayer). */
export function racha() {
  let dias = 0;
  const d = new Date();
  if (!datos.actividad[claveDia(d)]) d.setDate(d.getDate() - 1);
  while (datos.actividad[claveDia(d)]) {
    dias += 1;
    d.setDate(d.getDate() - 1);
  }
  return dias;
}

export function actividadDeHoy() {
  return datos.actividad[claveDia()] ?? { ejercicios: 0, repasos: 0 };
}

// ---------------------------------------------------------------------------
// Reinicio
// ---------------------------------------------------------------------------

/** Borra el progreso de lecciones y repasos. Con vaciarCuaderno, también las tarjetas. */
export function reiniciarProgreso({ vaciarCuaderno = false } = {}) {
  const ahora = Date.now();
  const cuaderno = {};
  if (!vaciarCuaderno) {
    for (const t of tarjetas()) cuaderno[t.id] = { ...t, srs: nuevaTarjeta(), t: ahora + 1 };
  }
  datos = { ...vacio(), reiniciado: ahora, perfil: datos.perfil, cuaderno };
  guardar();
}

// ---------------------------------------------------------------------------
// Unir datos de dos dispositivos (local y nube)
// ---------------------------------------------------------------------------

function masReciente(a, b) {
  if (!a) return b;
  if (!b) return a;
  return (b.t ?? 0) > (a.t ?? 0) ? b : a;
}

function unirLeccion(a, b) {
  if (!a || !b) return a ?? b;
  const ejercicios = { ...a.ejercicios };
  for (const [id, e] of Object.entries(b.ejercicios ?? {})) {
    const otro = ejercicios[id];
    // Gana el que tiene más intentos; a igualdad, el más reciente.
    ejercicios[id] = !otro || e.intentos > otro.intentos || (e.intentos === otro.intentos && (e.t ?? 0) > (otro.t ?? 0)) ? e : otro;
  }
  const terminadaEn = [a.terminadaEn, b.terminadaEn].filter(Boolean);
  const unida = {
    terminada: Boolean(a.terminada || b.terminada),
    abierta: Boolean(a.abierta || b.abierta),
    ejercicios,
    t: Math.max(a.t ?? 0, b.t ?? 0),
  };
  if (terminadaEn.length) unida.terminadaEn = Math.min(...terminadaEn);
  return unida;
}

export function unirDatos(local, remoto) {
  if (!remoto) return completar(local);
  const a = completar(local);
  const b = completar(remoto);
  const reiniciado = Math.max(a.reiniciado ?? 0, b.reiniciado ?? 0);
  const vigente = x => x && (x.t ?? 0) >= reiniciado;

  const unir = (mapaA, mapaB, fn) => {
    const resultado = {};
    for (const clave of new Set([...Object.keys(mapaA), ...Object.keys(mapaB)])) {
      const x = vigente(mapaA[clave]) ? mapaA[clave] : null;
      const y = vigente(mapaB[clave]) ? mapaB[clave] : null;
      const elegido = fn(x, y);
      if (elegido) resultado[clave] = elegido;
    }
    return resultado;
  };

  return completar({
    reiniciado,
    perfil: masReciente(a.perfil, b.perfil),
    lecciones: unir(a.lecciones, b.lecciones, unirLeccion),
    cuaderno: unir(a.cuaderno, b.cuaderno, masReciente),
    actividad: unir(a.actividad, b.actividad, (x, y) => (x && y
      ? { ejercicios: Math.max(x.ejercicios, y.ejercicios), repasos: Math.max(x.repasos, y.repasos), t: Math.max(x.t, y.t) }
      : x ?? y)),
  });
}

/**
 * Copia de seguridad: se junta con lo que ya hay (no se pierde nada).
 * Devuelve false si el archivo no es una copia de esta app (por ejemplo, de la app de danés).
 */
export function importarCopia(copia) {
  if (!copia || typeof copia !== 'object' || copia.app !== MARCA_APP || typeof copia.lecciones !== 'object') return false;
  datos = completar(unirDatos(datos, copia));
  guardar();
  return true;
}

export function borrarTodo() {
  reiniciarProgreso({ vaciarCuaderno: true });
}
