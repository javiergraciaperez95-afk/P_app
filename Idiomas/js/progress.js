// Todos los datos del estudiante: perfil, progreso de lecciones, cuaderno y actividad.
// Se guardan en el navegador (localStorage) y, si hay sesión iniciada, se
// sincronizan con la API propia (ver sync.js). Cada entrada lleva «t», la hora de su
// último cambio, para poder juntar los datos de varios dispositivos.
//
// Cómo se guarda (pensado para cuadernos de miles de tarjetas):
// - cada tarjeta del cuaderno va en su propia clave («<curso>-tarjeta:<id>») y solo se reescriben las que cambian;
//   el resto de los datos va en «<curso>-datos». Repasar una tarjeta escribe unos cientos de letras, no el cuaderno entero;
// - las tarjetas se guardan sin lo que se puede deducir (ver tarjetaParaGuardar), también al subirlas a la nube,
//   donde la API admite como mucho 1,5 MB por curso;
// - los cambios seguidos se escriben de una vez (ver guardar()).

import { nuevaTarjeta } from './srs.js';
import { LANG } from './curso.js';
import { clave } from './curso.js';
import { compactarOrigen } from './i18n.js';
import { esDesarrollador } from './desarrollador.js';

const CLAVE = clave('datos');
const PREFIJO_TARJETA = `${clave('tarjeta')}:`;
const ESPERA_GUARDAR = 800; // milisegundos: los cambios seguidos (varias respuestas) se escriben de una vez

const oyentes = new Set();
let pendiente = null; // { resto: true, tarjetas: Set de ids | 'todas' }
let relojGuardar = null;
let avisadoFallo = false;
let datos; // se carga más abajo, cuando ya está definido todo lo que hace falta para leerlos

function vacio() {
  return { version: 2, reiniciado: 0, perfil: { nombre: '', t: 0 }, lecciones: {}, cuaderno: {}, actividad: {} };
}

function completar(d) {
  const base = vacio();
  return {
    ...base,
    ...d,
    perfil: { ...base.perfil, ...(d.perfil ?? {}) },
    lecciones: d.lecciones ?? {},
    cuaderno: tarjetasLeidas(d.cuaderno ?? {}),
    actividad: d.actividad ?? {},
  };
}

// ---------------------------------------------------------------------------
// Una tarjeta, tal como se guarda y tal como se usa
// ---------------------------------------------------------------------------

const tipoDeduciblePor = es => (String(es).includes(' ') ? 'frase' : 'palabra');
const SRS_INICIAL = nuevaTarjeta();
const srsInicial = srs => srs && typeof srs === 'object' && Object.keys(srs).length === Object.keys(SRS_INICIAL).length
  && Object.entries(SRS_INICIAL).every(([k, v]) => srs[k] === v);

/** La tarjeta sin lo que se puede deducir: su id (es la clave), el tipo de siempre, textos vacíos, la fecha de creación si no ha cambiado y el repaso sin empezar. */
function tarjetaParaGuardar(tarjeta) {
  const { id, ...g } = tarjeta;
  if (g.borrada) return g;
  if (g.tipo === tipoDeduciblePor(g.es)) delete g.tipo;
  for (const campo of ['trad', 'pron', 'nota', 'origen']) if (g[campo] === '' || g[campo] == null) delete g[campo];
  if (g.creada === g.t) delete g.creada;
  if (srsInicial(g.srs)) delete g.srs;
  return g;
}

/** La tarjeta completa a partir de lo guardado (de este formato o de los anteriores). Si ya está completa, la misma. */
function tarjetaLeida(id, g) {
  if (!g || typeof g !== 'object') return null;
  const origen = g.origen && typeof g.origen === 'object' ? compactarOrigen(g.origen) : g.origen;
  if (g.borrada) return g.id === id ? g : { ...g, id };
  if (g.id === id && g.srs && typeof g.tipo === 'string' && 'creada' in g && 'trad' in g && 'pron' in g && 'nota' in g && origen === g.origen) return g;
  return { tipo: tipoDeduciblePor(g.es), trad: '', pron: '', nota: '', origen: '', creada: g.t, srs: nuevaTarjeta(), ...g, origen: origen ?? '', id };
}

function tarjetasLeidas(cuaderno) {
  const resultado = {};
  for (const [id, g] of Object.entries(cuaderno)) {
    const tarjeta = tarjetaLeida(id, g);
    if (tarjeta) resultado[id] = tarjeta;
  }
  return resultado;
}

/** Los datos tal como se suben a la nube: las tarjetas sin lo deducible. */
export function datosParaGuardar() {
  const cuaderno = {};
  for (const [id, tarjeta] of Object.entries(datos.cuaderno)) cuaderno[id] = tarjetaParaGuardar(tarjeta);
  return { ...datos, cuaderno };
}

// ---------------------------------------------------------------------------
// Leer y escribir en el navegador
// ---------------------------------------------------------------------------

function leer(claveGuardada) {
  try {
    const valor = JSON.parse(localStorage.getItem(claveGuardada));
    return valor && typeof valor === 'object' ? valor : null;
  } catch {
    return null; // datos dañados o almacenamiento bloqueado
  }
}

function clavesDeTarjetas() {
  try {
    return Object.keys(localStorage).filter(k => k.startsWith(PREFIJO_TARJETA));
  } catch {
    return [];
  }
}

function cargar() {
  const guardado = leer(CLAVE) ?? {};
  const cuaderno = {};
  for (const k of clavesDeTarjetas()) {
    const tarjeta = leer(k);
    if (tarjeta) cuaderno[k.slice(PREFIJO_TARJETA.length)] = tarjeta;
  }
  // Los datos de antes llevaban el cuaderno dentro de «datos»: en el primer guardado cada tarjeta pasa a su clave.
  // Si hay de las dos formas (una versión vieja de la app pudo volver a escribirlo dentro), se juntan tarjeta a tarjeta.
  if (guardado.cuaderno) {
    pendiente = { resto: true, tarjetas: 'todas' };
    relojGuardar = setTimeout(escribir, ESPERA_GUARDAR);
  }
  return completar({ ...guardado, cuaderno: guardado.cuaderno ? unirMapas(guardado.cuaderno, cuaderno, masReciente) : cuaderno });
}

/**
 * Apunta que hay cambios y avisa a quien escuche (por ejemplo, la sincronización).
 * Se escriben en el navegador agrupados: como mucho cada ESPERA_GUARDAR, y siempre al ocultar o cerrar la app.
 * tarjetas: los ids de las tarjetas del cuaderno que han cambiado (o 'todas'); el resto de los datos se escribe siempre.
 */
function guardar({ avisar = true, tarjetas = [] } = {}) {
  pendiente ??= { resto: true, tarjetas: new Set() };
  if (tarjetas === 'todas' || pendiente.tarjetas === 'todas') pendiente.tarjetas = 'todas';
  else for (const id of tarjetas) pendiente.tarjetas.add(id);
  relojGuardar ??= setTimeout(escribir, ESPERA_GUARDAR);
  if (avisar) for (const fn of oyentes) fn();
}

function escribir() {
  clearTimeout(relojGuardar);
  relojGuardar = null;
  if (!pendiente) return;
  const { tarjetas } = pendiente;
  pendiente = null;
  const { cuaderno, ...resto } = datos;
  const ids = tarjetas === 'todas' ? Object.keys(cuaderno) : [...tarjetas];
  try {
    // Primero las tarjetas y después lo demás: así, si algo falla, los datos de antes siguen enteros.
    if (tarjetas === 'todas') {
      const quedan = new Set(ids.map(id => PREFIJO_TARJETA + id));
      for (const k of clavesDeTarjetas()) if (!quedan.has(k)) localStorage.removeItem(k);
    }
    for (const id of ids) {
      if (cuaderno[id]) localStorage.setItem(PREFIJO_TARJETA + id, JSON.stringify(tarjetaParaGuardar(cuaderno[id])));
      else localStorage.removeItem(PREFIJO_TARJETA + id);
    }
    localStorage.setItem(CLAVE, JSON.stringify(resto));
  } catch (e) {
    console.error(e);
    // Lo que no se ha podido escribir se vuelve a intentar con el siguiente cambio.
    pendiente ??= { resto: true, tarjetas: new Set() };
    if (tarjetas === 'todas') pendiente.tarjetas = 'todas';
    else if (pendiente.tarjetas !== 'todas') for (const id of ids) pendiente.tarjetas.add(id);
    // Se avisa una vez por visita: lo de hoy solo dura mientras la app siga abierta (y en la nube, si hay sesión).
    if (!avisadoFallo) { avisadoFallo = true; window.dispatchEvent(new Event('guardado-fallido')); }
  }
}

// Al ocultar la pestaña, cerrarla o pasar la app a segundo plano en el móvil, se escribe lo pendiente ya.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') escribir(); });
window.addEventListener('pagehide', escribir);

datos = cargar();

export function alCambiar(fn) {
  oyentes.add(fn);
}

export function todosLosDatos() {
  return datos;
}

/** Sustituye los datos (tras juntarlos con los de la nube). Solo se reescriben las tarjetas que han cambiado. */
export function reemplazarDatos(nuevos) {
  const antes = datos.cuaderno;
  datos = completar(nuevos);
  const cambiadas = [];
  for (const id of new Set([...Object.keys(antes), ...Object.keys(datos.cuaderno)])) {
    if (antes[id] !== datos.cuaderno[id]) cambiadas.push(id);
  }
  guardar({ avisar: false, tarjetas: cambiadas });
}

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function anotarActividad(campo) {
  const dia = (datos.actividad[hoy()] ??= { ejercicios: 0, repasos: 0, t: 0 });
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
  datos.perfil = { nombre: nuevo.trim().slice(0, 40), t: Date.now() };
  guardar();
}

// ---------------------------------------------------------------------------
// Lecciones y ejercicios
// ---------------------------------------------------------------------------

function leccion(id) {
  datos.lecciones[id] ??= { terminada: false, ejercicios: {}, t: Date.now() };
  return datos.lecciones[id];
}

/** Datos de un ejercicio: { intentos, aciertos, errores, completado }. */
export function estadoEjercicio(idLeccion, idEjercicio) {
  return datos.lecciones[idLeccion]?.ejercicios[idEjercicio]
    ?? { intentos: 0, aciertos: 0, errores: 0, completado: false };
}

export function registrarRespuesta(idLeccion, idEjercicio, acierto) {
  const l = leccion(idLeccion);
  const e = l.ejercicios[idEjercicio] ?? { intentos: 0, aciertos: 0, errores: 0, completado: false };
  e.intentos += 1;
  if (acierto === true) e.aciertos += 1;
  else if (acierto === false) e.errores += 1;
  e.completado = true;
  e.ultimo = acierto;
  l.ejercicios[idEjercicio] = e;
  l.t = Date.now();
  anotarActividad('ejercicios');
  guardar();
  return e;
}

/** Ejercicios cuya última respuesta fue un fallo: [{ idLeccion, idEjercicio }]. */
export function ejerciciosFallados() {
  const lista = [];
  for (const [idLeccion, l] of Object.entries(datos.lecciones)) {
    for (const [idEjercicio, e] of Object.entries(l.ejercicios ?? {})) {
      // Los datos antiguos no tienen «ultimo»: cuenta como fallo si hay más errores que aciertos.
      const fallado = e.ultimo === undefined ? e.errores > e.aciertos : e.ultimo === false;
      if (fallado) lista.push({ idLeccion, idEjercicio });
    }
  }
  return lista;
}

export function marcarTerminada(idLeccion) {
  const l = leccion(idLeccion);
  l.terminada = true;
  l.t = Date.now();
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
  const terminada = Boolean(guardada?.terminada) || esDesarrollador();
  let estado = 'nueva';
  if (terminada) estado = 'terminada';
  else if (guardada && (completados > 0 || guardada.abierta)) estado = 'curso';
  return { total, completados, aciertos, errores, terminada, estado };
}

export function hayProgreso() {
  return Object.keys(datos.lecciones).length > 0 || Object.keys(datos.cuaderno).length > 0;
}

// ---------------------------------------------------------------------------
// Cuaderno (palabras y frases guardadas) y repaso
// ---------------------------------------------------------------------------

export function idDeTarjeta(es) {
  return String(es).trim().toLocaleLowerCase(LANG).replace(/\s+/g, ' ');
}

/** Tarjetas del cuaderno que no se han borrado. */
export function tarjetas() {
  return Object.values(datos.cuaderno).filter(t => !t.borrada);
}

export function estaEnCuaderno(es) {
  const t = datos.cuaderno[idDeTarjeta(es)];
  return Boolean(t && !t.borrada);
}

/**
 * item: { es, trad, pron?, nota?, tipo: 'palabra' | 'frase', origen? }
 * «es» es el español; «trad», «nota» y «origen» pueden ser un texto o { en, vi }.
 */
export function guardarEnCuaderno(item) {
  const id = idDeTarjeta(item.es);
  const ahora = Date.now();
  datos.cuaderno[id] = {
    id,
    tipo: item.tipo ?? 'palabra',
    es: item.es,
    trad: item.trad ?? '',
    pron: item.pron ?? '',
    nota: item.nota ?? '',
    origen: item.origen ?? '',
    creada: ahora,
    t: ahora,
    srs: nuevaTarjeta(),
  };
  guardar({ tarjetas: [id] });
}

/**
 * Guarda varias tarjetas de golpe (las palabras de una lección terminada).
 * No toca las que ya están ni vuelve a meter las que la persona borró. Devuelve cuántas son nuevas.
 */
export function guardarVariasEnCuaderno(items) {
  const ahora = Date.now();
  const nuevas = [];
  for (const item of items) {
    const id = idDeTarjeta(item.es);
    if (datos.cuaderno[id]) continue;
    datos.cuaderno[id] = {
      id,
      tipo: item.tipo ?? 'palabra',
      es: item.es,
      trad: item.trad ?? '',
      pron: item.pron ?? '',
      nota: item.nota ?? '',
      origen: item.origen ?? '',
      creada: ahora,
      t: ahora,
      srs: nuevaTarjeta(),
    };
    nuevas.push(id);
  }
  if (nuevas.length) guardar({ tarjetas: nuevas });
  return nuevas.length;
}

export function quitarDelCuaderno(es) {
  const id = idDeTarjeta(es);
  if (!datos.cuaderno[id]) return;
  // Se deja una marca de borrado para que la nube también la borre.
  datos.cuaderno[id] = { id, borrada: true, t: Date.now() };
  guardar({ tarjetas: [id] });
}

export function actualizarTarjeta(id, srs) {
  const tarjeta = datos.cuaderno[id];
  if (!tarjeta || tarjeta.borrada) return;
  tarjeta.srs = srs;
  tarjeta.t = Date.now();
  anotarActividad('repasos');
  guardar({ tarjetas: [id] });
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
  const clave = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  if (!datos.actividad[clave(d)]) d.setDate(d.getDate() - 1);
  while (datos.actividad[clave(d)]) {
    dias += 1;
    d.setDate(d.getDate() - 1);
  }
  return dias;
}

export function actividadDeHoy() {
  return datos.actividad[hoy()] ?? { ejercicios: 0, repasos: 0 };
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
  guardar({ tarjetas: 'todas' });
}

// ---------------------------------------------------------------------------
// Unir datos de dos dispositivos (local y nube)
// ---------------------------------------------------------------------------

/** Junta dos mapas entrada a entrada con fn(a, b); las entradas que no cumplen «vale» no cuentan. */
function unirMapas(mapaA, mapaB, fn, vale = () => true) {
  const resultado = {};
  for (const clave of new Set([...Object.keys(mapaA), ...Object.keys(mapaB)])) {
    const x = vale(mapaA[clave]) ? mapaA[clave] : null;
    const y = vale(mapaB[clave]) ? mapaB[clave] : null;
    const elegido = fn(x, y);
    if (elegido) resultado[clave] = elegido;
  }
  return resultado;
}

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
    ejercicios[id] = !otro || e.intentos > otro.intentos ? e : otro;
  }
  return {
    terminada: a.terminada || b.terminada,
    abierta: a.abierta || b.abierta,
    ejercicios,
    t: Math.max(a.t ?? 0, b.t ?? 0),
  };
}

export function unirDatos(local, remoto) {
  if (!remoto) return local;
  const a = completar(local);
  const b = completar(remoto);
  const reiniciado = Math.max(a.reiniciado ?? 0, b.reiniciado ?? 0);
  const vigente = x => x && (x.t ?? 0) >= reiniciado;

  const unir = (mapaA, mapaB, fn) => unirMapas(mapaA, mapaB, fn, vigente);

  return {
    version: 2,
    reiniciado,
    perfil: masReciente(a.perfil, b.perfil),
    lecciones: unir(a.lecciones, b.lecciones, unirLeccion),
    cuaderno: unir(a.cuaderno, b.cuaderno, masReciente),
    actividad: unir(a.actividad, b.actividad, (x, y) => (x && y
      ? { ejercicios: Math.max(x.ejercicios, y.ejercicios), repasos: Math.max(x.repasos, y.repasos), t: Math.max(x.t, y.t) }
      : x ?? y)),
  };
}

/**
 * Copia de seguridad: se junta con lo que ya hay (no se pierde nada).
 * Devuelve false si el archivo no parece una copia de esta app.
 */
export function importarCopia(copia) {
  if (!copia || typeof copia !== 'object' || copia.version !== 2 || typeof copia.lecciones !== 'object') return false;
  datos = completar(unirDatos(datos, copia));
  guardar({ tarjetas: 'todas' });
  return true;
}

export function borrarTodo() {
  reiniciarProgreso({ vaciarCuaderno: true });
}
