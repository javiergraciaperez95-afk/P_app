// Progreso del alumno, guardado en el navegador (localStorage) y, con cuenta, en la nube.
// { version: 1, lecciones: { "v2-001": {
//     hecha, fecha,          ← terminada y cuándo (texto ISO)
//     hechaT, desmarcadaT,   ← momento (ms) en que se marcó / desmarcó a mano
//     reiniciadoT,           ← momento (ms) en que se reiniciaron los ejercicios
//     ejercicios: { b5: { intentos, resuelto, primeraBien, t } } } } }
// Las fechas sirven para unir con la nube respetando lo que el alumno hizo a propósito.
//
// Numeración: al dividir las lecciones largas (de 51 a 97) cambiaron los números. Para que lo
// guardado con la numeración antigua ("002") no se confunda con la nueva, las lecciones se
// guardan ahora como "v2-002". Lo antiguo se pasa solo a la nueva (ver migrar()), también lo
// que llegue de la nube o de otro dispositivo que aún tenga la versión vieja abierta.

import { RENUMERACION } from './renumeracion.js';

const CLAVE = 'vietlibro.progreso';
const PREFIJO = 'v2-';
const k = (id) => PREFIJO + id;
const ANTIGUA = /^\d{3}$/;

function vacio() {
  return { version: 1, lecciones: {} };
}

function cargar() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE));
    if (d && d.version === 1 && d.lecciones) return migrar(d);
  } catch { /* datos corruptos o sin acceso: empezamos de cero */ }
  return vacio();
}

/**
 * Pasa a la numeración nueva lo guardado con la antigua: una lección antigua terminada
 * deja terminadas todas sus partes nuevas, y cada ejercicio va a la parte donde está ahora.
 */
function migrar(d) {
  const lecciones = d?.lecciones || {};
  const viejas = Object.keys(lecciones).filter((id) => ANTIGUA.test(id) && RENUMERACION[id]);
  if (!viejas.length) return d;
  let res = { version: 1, lecciones: Object.fromEntries(Object.entries(lecciones).filter(([id]) => !viejas.includes(id))) };
  for (const id of viejas) {
    const r = RENUMERACION[id];
    const l = lecciones[id] || {};
    const partes = {};
    for (const p of r.partes) partes[k(p)] = { ...l, ejercicios: {} };
    for (const [ej, e] of Object.entries(l.ejercicios || {})) {
      partes[k(r.ej?.[ej] || r.partes[0])].ejercicios[ej] = e;
    }
    res = juntar(res, { lecciones: partes });
  }
  return res;
}

let datos = cargar();
try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { /* sin acceso */ }

function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { /* sin espacio o bloqueado */ }
  document.dispatchEvent(new CustomEvent('progreso-cambio'));
}

/** Copia de los datos (para la nube o la copia de seguridad). */
export function exportar() {
  return JSON.parse(JSON.stringify(datos));
}

/** Sustituye los datos por otros (ya unidos con la nube o la copia). */
export function importar(nuevos) {
  if (!nuevos || typeof nuevos.lecciones !== 'object') return;
  datos = { version: 1, lecciones: migrar(nuevos).lecciones };
  guardar();
}

/** Momento en que se marcó como hecha (los datos antiguos no tienen hechaT). */
function momentoHecha(l) {
  if (!l?.hecha) return 0;
  return l.hechaT || Date.parse(l.fecha) || 1;
}

/**
 * Une dos progresos. Nunca se pierde una lección terminada ni un ejercicio resuelto
 * por culpa de la sincronización; solo gana un «desmarcar» o un «reiniciar» hecho
 * a propósito DESPUÉS de terminarla. Antes pasa los dos a la numeración nueva.
 */
export function unir(a, b) {
  return juntar(migrar(a), migrar(b));
}

function juntar(a, b) {
  const lecciones = {};
  const la = a?.lecciones || {};
  const lb = b?.lecciones || {};
  for (const id of new Set([...Object.keys(la), ...Object.keys(lb)])) {
    const x = la[id] || {};
    const y = lb[id] || {};

    const hechaT = Math.max(momentoHecha(x), momentoHecha(y));
    const desmarcadaT = Math.max(x.desmarcadaT || 0, y.desmarcadaT || 0);
    const reiniciadoT = Math.max(x.reiniciadoT || 0, y.reiniciadoT || 0);

    const ejercicios = {};
    for (const ej of new Set([...Object.keys(x.ejercicios || {}), ...Object.keys(y.ejercicios || {})])) {
      // Los ejercicios guardados antes de existir las fechas cuentan como «muy antiguos» (t = 1)
      const validos = [x.ejercicios?.[ej], y.ejercicios?.[ej]].filter((e) => e && (e.t || 1) > reiniciadoT);
      if (!validos.length) continue;
      ejercicios[ej] = {
        intentos: Math.max(...validos.map((e) => e.intentos || 0)),
        resuelto: validos.some((e) => e.resuelto),
        primeraBien: validos.some((e) => e.primeraBien),
        t: Math.max(...validos.map((e) => e.t || 1)),
      };
    }

    const l = { hecha: hechaT > desmarcadaT, ejercicios };
    if (hechaT) l.hechaT = hechaT;
    if (desmarcadaT) l.desmarcadaT = desmarcadaT;
    if (reiniciadoT) l.reiniciadoT = reiniciadoT;
    if (l.hecha) l.fecha = [x.fecha, y.fecha].filter(Boolean).sort()[0] || new Date(hechaT).toISOString();
    lecciones[id] = l;
  }
  return { version: 1, lecciones };
}

function leccion(id) {
  return (datos.lecciones[k(id)] ??= { hecha: false, ejercicios: {} });
}

export function estaHecha(id) {
  return !!datos.lecciones[k(id)]?.hecha;
}

export function marcarHecha(id, valor) {
  const l = leccion(id);
  const ahora = Date.now();
  l.hecha = !!valor;
  if (valor) {
    l.fecha = new Date(ahora).toISOString();
    l.hechaT = ahora;
  } else {
    delete l.fecha;
    l.desmarcadaT = ahora;
  }
  guardar();
}

export function estadoEjercicio(id, ej) {
  return datos.lecciones[k(id)]?.ejercicios?.[ej] || null;
}

/** Apunta una respuesta. Si el ejercicio ya estaba resuelto no cambia nada. */
export function registrarRespuesta(id, ej, acierto) {
  const l = leccion(id);
  const e = (l.ejercicios[ej] ??= { intentos: 0, resuelto: false, primeraBien: false });
  if (e.resuelto) return e;
  e.intentos++;
  e.t = Date.now();
  if (acierto) {
    e.resuelto = true;
    e.primeraBien = e.intentos === 1;
  }
  guardar();
  return e;
}

export function reiniciarEjercicios(id) {
  const l = leccion(id);
  l.ejercicios = {};
  l.reiniciadoT = Date.now();
  guardar();
}
