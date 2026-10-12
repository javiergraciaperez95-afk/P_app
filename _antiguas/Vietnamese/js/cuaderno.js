// Cuaderno de vocabulario: solo las palabras que el alumno marca con ★.
// Cada palabra es una tarjeta de repaso (ver srs.js). Se guarda en el navegador:
// { version: 1,
//   tarjetas: { "xin chào": { vi, es, pron, nota, leccion, anadida, srs: {...} } },
//   registro: { "2026-10-03": { nuevas, repasos, aciertos } } }

import { clave } from './frases.js';
import { nuevaTarjeta, responder, claveDia, siguiente as siguienteSrs, contar as contarSrs } from './srs.js';
import { RENUMERACION } from './renumeracion.js';

const CLAVE = 'vietlibro.cuaderno';
const ANTIGUA = /^\d{3}$/;

/**
 * Las lecciones se renumeraron al dividir las largas. Las tarjetas con el número nuevo
 * llevan "lv2"; las que no lo llevan apuntan a la numeración antigua y se corrigen aquí
 * (la tarjeta pasa a la primera parte de su lección antigua).
 */
function migrar(d) {
  if (!d?.tarjetas) return d;
  let cambia = false;
  const tarjetas = {};
  for (const [k, t] of Object.entries(d.tarjetas)) {
    if (t && !t.lv2 && ANTIGUA.test(t.leccion || '') && RENUMERACION[t.leccion]) {
      tarjetas[k] = { ...t, leccion: RENUMERACION[t.leccion].partes[0], lv2: true };
      cambia = true;
    } else tarjetas[k] = t;
  }
  return cambia ? { ...d, tarjetas } : d;
}

// Cada tarjeta lleva "mod" (fecha del último cambio). Al quitar una palabra se apunta
// en "borrados" con la fecha, para que el borrado también llegue a otros dispositivos.

function vacio() {
  return { version: 1, tarjetas: {}, borrados: {}, registro: {} };
}

function cargar() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE));
    if (d && d.version === 1 && d.tarjetas && d.registro) return migrar({ borrados: {}, ...d });
  } catch { /* datos corruptos o sin acceso */ }
  return vacio();
}

let datos = cargar();

function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch { /* sin espacio o bloqueado */ }
  document.dispatchEvent(new CustomEvent('cuaderno-cambio'));
}

export function estaGuardada(vi) {
  return !!datos.tarjetas[clave(vi)];
}

/** Marca o desmarca una palabra. Devuelve true si queda guardada. */
export function alternar(entrada, leccion = '', ejemplo = null) {
  const k = clave(entrada.vi);
  if (datos.tarjetas[k]) {
    quitar(k);
    return false;
  }
  const ahora = Date.now();
  datos.tarjetas[k] = {
    vi: entrada.vi, es: entrada.es, pron: entrada.pron || '', nota: entrada.nota || '',
    leccion, anadida: ahora, mod: ahora, srs: nuevaTarjeta(),
  };
  if (ANTIGUA.test(leccion)) datos.tarjetas[k].lv2 = true;
  if (ejemplo?.vi) datos.tarjetas[k].ejemplo = { vi: ejemplo.vi, es: ejemplo.es || '' };
  delete datos.borrados[k];
  guardar();
  return true;
}

export function quitar(id) {
  delete datos.tarjetas[id];
  datos.borrados[id] = Date.now();
  guardar();
}

/** Copia de los datos (para la nube). */
export function exportar() {
  return JSON.parse(JSON.stringify(datos));
}

/** Sustituye los datos por otros (ya unidos con la nube). */
export function importar(nuevos) {
  if (!nuevos || !nuevos.tarjetas) return;
  datos = { version: 1, tarjetas: migrar(nuevos).tarjetas, borrados: nuevos.borrados || {}, registro: nuevos.registro || {} };
  guardar();
}

/**
 * Une dos cuadernos: por cada palabra gana el cambio más reciente
 * (añadirla, repasarla o borrarla). El registro diario se queda con el mayor de cada cifra.
 */
export function unir(a, b) {
  a = migrar(a);
  b = migrar(b);
  const ta = a?.tarjetas || {}, tb = b?.tarjetas || {};
  const ba = a?.borrados || {}, bb = b?.borrados || {};
  const tarjetas = {};
  const borrados = {};
  const claves = new Set([...Object.keys(ta), ...Object.keys(tb), ...Object.keys(ba), ...Object.keys(bb)]);
  for (const k of claves) {
    const fecha = (t) => (t ? t.mod || t.anadida || 0 : -1);
    const tarjeta = fecha(ta[k]) >= fecha(tb[k]) ? ta[k] : tb[k];
    const borrado = Math.max(ba[k] || 0, bb[k] || 0);
    if (tarjeta && fecha(tarjeta) > borrado) tarjetas[k] = tarjeta;
    else if (borrado) borrados[k] = borrado;
  }
  const registro = {};
  const ra = a?.registro || {}, rb = b?.registro || {};
  for (const dia of new Set([...Object.keys(ra), ...Object.keys(rb)])) {
    const x = ra[dia] || {}, y = rb[dia] || {};
    registro[dia] = {};
    for (const campo of new Set([...Object.keys(x), ...Object.keys(y)])) {
      registro[dia][campo] = Math.max(x[campo] || 0, y[campo] || 0);
    }
  }
  return { version: 1, tarjetas, borrados, registro };
}

/** Lista de tarjetas con su id (la palabra normalizada). */
export function lista() {
  return Object.entries(datos.tarjetas).map(([id, t]) => ({ id, ...t }));
}

export function hechasHoy(ahora = Date.now()) {
  return datos.registro[claveDia(ahora)] || { nuevas: 0, repasos: 0, aciertos: 0 };
}

export function siguiente(ahora = Date.now()) {
  return siguienteSrs(lista(), ahora, hechasHoy(ahora));
}

export function contar(ahora = Date.now()) {
  const c = contarSrs(lista(), ahora, hechasHoy(ahora));
  return { nuevas: c.nuevas.length, aprendiendo: c.aprendiendoYa.length, repasos: c.repasos.length };
}

/**
 * Aplica una respuesta (1–4) a una tarjeta y apunta el repaso del día.
 * Devuelve una «foto» de antes, para poder deshacer con deshacerRespuesta().
 */
export function responderTarjeta(id, r, ahora = Date.now()) {
  const t = datos.tarjetas[id];
  if (!t) return null;
  const dia = claveDia(ahora);
  const foto = {
    id,
    tarjeta: JSON.parse(JSON.stringify(t)),
    dia,
    registro: datos.registro[dia] ? { ...datos.registro[dia] } : null,
  };
  const reg = (datos.registro[dia] ??= { nuevas: 0, repasos: 0, aciertos: 0 });
  if (t.srs.estado === 'nueva') reg.nuevas++;
  else if (t.srs.estado === 'repaso') reg.repasos++;
  if (r > 1) reg.aciertos++;
  reg.total = (reg.total || 0) + 1;
  t.srs = responder(t.srs, r, ahora);
  t.mod = ahora;
  guardar();
  return foto;
}

/** Vuelve a dejar la tarjeta (y el registro del día) como estaba antes de responder. */
export function deshacerRespuesta(foto) {
  if (!foto || !datos.tarjetas[foto.id]) return false;
  datos.tarjetas[foto.id] = { ...foto.tarjeta, mod: Date.now() };
  if (foto.registro) datos.registro[foto.dia] = foto.registro;
  else delete datos.registro[foto.dia];
  guardar();
  return true;
}

export function tarjeta(id) {
  const t = datos.tarjetas[id];
  return t ? { id, ...t } : null;
}

export function registro() {
  return datos.registro;
}
