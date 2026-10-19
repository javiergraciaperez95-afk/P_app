// Cuentas al estilo Mullvad, guardadas en Supabase.
// - Cada dispositivo tiene un número de cuenta de 16 cifras, hecho al azar la primera vez: no se pide nada.
// - El progreso (todo lo de copiaCompleta) se sube al rato de cada cambio y, al abrir, se junta con el de la
//   nube sin perder nada. En el dispositivo queda una copia para poder estudiar sin conexión.
// - Con el número se entra desde otro dispositivo (se juntan los dos progresos).
// - Una cuenta anónima que no se usa en 7 días se borra sola (lo hace la base de datos). Si se le añade un
//   correo (con un código que llega por correo), ya no caduca y el número se puede recuperar con ese correo.
// Todo va por las funciones de Para_lodriga/paglot-cuentas.sql, con fetch (sin librería).

import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA } from './config.js';
import { copiaCompleta, importarCopia, alCambiar } from './progress.js';
import { curso } from './curso.js';

const CLAVE_NUMERO = 'paglot-cuenta';
const ESPERA_SUBIDA = 3000;

export const nubeActiva = Boolean(SUPABASE_URL && SUPABASE_CLAVE_PUBLICA);

/** estado: apagada · conectando · guardada · sin-conexion · error. ultima: fecha de la última subida buena. */
export const nube = { estado: nubeActiva ? 'conectando' : 'apagada', ultima: null };
const oyentes = new Set();
function avisar(estado) {
  nube.estado = estado;
  if (estado === 'guardada') nube.ultima = new Date();
  for (const fn of oyentes) fn(nube);
}
export function alCambiarNube(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }

// ----- El número -----
function numeroNuevo() {
  const cifras = new Uint8Array(16);
  crypto.getRandomValues(cifras);
  // la primera nunca es 0, para que siempre tenga 16 cifras al copiarlo
  return [...cifras].map((b, i) => (i === 0 ? 1 + (b % 9) : b % 10)).join('');
}
export function numeroCuenta() {
  try {
    let n = localStorage.getItem(CLAVE_NUMERO);
    if (!/^\d{16}$/.test(n ?? '')) { n = numeroNuevo(); localStorage.setItem(CLAVE_NUMERO, n); }
    return n;
  } catch {
    return null;
  }
}
/** «1234 5678 9012 3456» */
export const numeroBonito = n => String(n ?? '').replace(/(\d{4})(?=\d)/g, '$1 ');
export const limpiarNumero = n => String(n ?? '').replace(/\D/g, '');

// ----- Hablar con Supabase -----
// Sin conexión, una petición podría quedarse esperando mucho: a los 8 segundos se da por perdida.
const ESPERA_MAXIMA = 8000;
const conLimite = () => (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(ESPERA_MAXIMA) : undefined);

async function rpc(funcion, datos = {}, token = null) {
  const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcion}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_CLAVE_PUBLICA, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(datos),
    signal: conLimite(),
  });
  if (!respuesta.ok) {
    const error = new Error(`Supabase ${respuesta.status}`);
    error.estado = respuesta.status;
    try { error.detalle = await respuesta.json(); } catch { /* sin cuerpo */ }
    throw error;
  }
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}
async function auth(ruta, cuerpo) {
  const respuesta = await fetch(`${SUPABASE_URL}/auth/v1/${ruta}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_CLAVE_PUBLICA, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
    signal: conLimite(),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(datos.msg || datos.error_description || datos.message || `Supabase ${respuesta.status}`);
    error.estado = respuesta.status;
    throw error;
  }
  return datos;
}

// ----- Subir y bajar -----
// En la nube, una cuenta guarda el progreso de cada curso por separado: { version: 3, cursos: { es: copia, fr: copia… } }.
// (Las cuentas de cuando solo había español guardaban la copia del español sin más: se leen como { es: copia }.)
// Para no borrar los otros cursos al subir el de ahora, se sube solo después de haber leído lo que hay en la nube.
let reloj = null;
let subiendo = null;
let iniciada = false;
let cursosNube = null; // lo último que se leyó de la nube (null: aún no se ha podido leer)

const cursosDe = remoto => (remoto?.cursos ?? (remoto?.version === 2 ? { es: remoto } : {}));
const paraSubir = () => ({ version: 3, cursos: { ...cursosNube, [curso.id]: copiaCompleta() } });

async function subir() {
  const numero = numeroCuenta();
  if (!nubeActiva || !numero || !curso.id) return;
  try {
    if (cursosNube === null) await bajarYJuntar(numero);
    // justo antes de escribir se releen los demás cursos: otro dispositivo puede haberlos cambiado desde que se
    // abrió la app, y subir la copia de entonces los pisaría (el curso de ahora va tal cual está aquí)
    else cursosNube = { ...cursosDe(await rpc('paglot_leer', { p_numero: numero })) };
    const datos = paraSubir();
    subiendo = rpc('paglot_guardar', { p_numero: numero, p_datos: datos });
    await subiendo;
    cursosNube = datos.cursos;
    avisar('guardada');
  } catch (e) {
    avisar(e.estado ? 'error' : 'sin-conexion');
  } finally {
    subiendo = null;
  }
}
function subirLuego() {
  clearTimeout(reloj);
  reloj = setTimeout(subir, ESPERA_SUBIDA);
}

/** Baja el progreso de la nube y lo junta con el del dispositivo. Devuelve si había algo allí. */
async function bajarYJuntar(numero) {
  const remoto = await rpc('paglot_leer', { p_numero: numero });
  cursosNube = { ...cursosDe(remoto) };
  const mio = curso.id ? cursosNube[curso.id] : null;
  if (mio && mio.version === 2) {
    importarCopia(mio);
    window.dispatchEvent(new Event('datos-sincronizados'));
    return true;
  }
  return false;
}

/** Al abrir la app: junta lo de la nube y se pone a subir los cambios. */
export async function iniciarNube() {
  if (!nubeActiva || iniciada) return;
  iniciada = true;
  const numero = numeroCuenta();
  if (!numero) { avisar('error'); return; }
  try {
    await bajarYJuntar(numero);
    await subir();
  } catch (e) {
    avisar(e.estado ? 'error' : 'sin-conexion');
  }
  alCambiar(() => subirLuego());
  // lo que guardan aparte el modo juego y el camino (estrellas, cofres, logros) también se sube
  for (const evento of ['logro-ganado', 'cofre-abierto', 'reto-terminado']) window.addEventListener(evento, subirLuego);
  // al irse de la app, lo pendiente se sube ya
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' || !reloj) return;
    clearTimeout(reloj);
    reloj = null;
    const n = numeroCuenta();
    if (!n || cursosNube === null || !curso.id) return;
    try {
      fetch(`${SUPABASE_URL}/rest/v1/rpc/paglot_guardar`, {
        method: 'POST',
        keepalive: true,
        headers: { apikey: SUPABASE_CLAVE_PUBLICA, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_numero: n, p_datos: paraSubir() }),
      }).catch(() => {});
    } catch { /* demasiado grande para keepalive: se subirá la próxima vez */ }
  });
  // si vuelve la conexión, se intenta otra vez
  window.addEventListener('online', () => { if (nube.estado !== 'guardada') subir(); });
}

/** Entrar con otro número (el de otro dispositivo). Se juntan los dos progresos. */
export async function usarNumero(texto) {
  const numero = limpiarNumero(texto);
  if (!/^\d{16}$/.test(numero)) throw Object.assign(new Error('formato'), { motivo: 'formato' });
  const existe = await rpc('paglot_existe', { p_numero: numero });
  if (!existe) throw Object.assign(new Error('no existe'), { motivo: 'noExiste' });
  try { localStorage.setItem(CLAVE_NUMERO, numero); } catch { /* sin almacenamiento */ }
  cursosNube = null;
  await bajarYJuntar(numero);
  await subir();
}

/** Borra la cuenta de la nube y empieza otra (el progreso del dispositivo se queda). */
export async function borrarCuentaNube() {
  const numero = numeroCuenta();
  await rpc('paglot_borrar', { p_numero: numero });
  try { localStorage.setItem(CLAVE_NUMERO, numeroNuevo()); } catch { /* sin almacenamiento */ }
  cursosNube = {};
  await subir();
}

// ----- El correo (opcional): para que la cuenta no caduque y para recuperar el número -----
/** Manda un código de 6 cifras al correo. */
export function pedirCodigo(correo) {
  return auth('otp', { email: correo.trim(), create_user: true });
}
/** Comprueba el código; devuelve el pase de esa sesión (solo se usa al momento, no se guarda). */
export async function comprobarCodigo(correo, codigo) {
  const datos = await auth('verify', { type: 'email', email: correo.trim(), token: String(codigo).replace(/\D/g, '') });
  if (!datos.access_token) throw new Error('sin sesión');
  return datos.access_token;
}
/** Une la cuenta de este dispositivo al correo verificado. */
export async function unirCorreo(token) {
  await subir(); // que la cuenta exista ya en la nube
  const ok = await rpc('paglot_vincular', { p_numero: numeroCuenta() }, token);
  if (!ok) throw new Error('no se pudo unir');
}
/** Recupera el número unido a un correo verificado y entra con él. */
export async function recuperarConCorreo(token) {
  const numero = await rpc('paglot_mi_numero', {}, token);
  if (!numero) throw Object.assign(new Error('sin cuenta'), { motivo: 'sinCuenta' });
  await usarNumero(numero);
  return numero;
}
/** El correo unido a la cuenta de este dispositivo, o null. */
export async function correoDeLaCuenta() {
  if (!nubeActiva) return null;
  try { return await rpc('paglot_correo', { p_numero: numeroCuenta() }); } catch { return null; }
}
