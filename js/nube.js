// Cuentas al estilo Mullvad, guardadas en Supabase.
// - Cada dispositivo tiene un número de cuenta de 16 cifras, hecho al azar la primera vez: no se pide nada.
// - El progreso (todo lo de copiaCompleta) se sube al rato de cada cambio y, al abrir, se junta con el de la
//   nube sin perder nada. En el dispositivo queda una copia para poder estudiar sin conexión.
// - Con el número se entra desde otro dispositivo (se juntan los dos progresos).
// - Una cuenta anónima que no se usa en 7 días se borra sola (lo hace la base de datos). Si se le añade un
//   correo (con un código que llega por correo), ya no caduca y el número se puede recuperar con ese correo.
// - Solo funciona si la persona la enciende (decisión del 19-10-2026, por el informe legal y por los menores): en la
//   bienvenida o en Perfil → Cuenta, y al entrar con el número de otro dispositivo. Quien ya la usaba antes la conserva.
//   Se puede apagar cuando se quiera; borrar la cuenta de la nube también la apaga.
// Todo va por las funciones de _herramientas/supabase-cuentas.sql, con fetch (sin librería).

import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA } from './config.js';
import { copiaCompleta, importarCopia, alCambiar } from './progress.js';
import { curso } from './curso.js';

const CLAVE_NUMERO = 'paglot-cuenta';
const CLAVE_NUBE = 'paglot-nube'; // 'si' · 'no' · sin valor: aún no se ha elegido (y entonces no sale nada)

// De antes del 19-10 (la nube iba de serie): quien la había apagado, apagada; quien ya tenía cuenta, encendida.
try {
  if (!localStorage.getItem(CLAVE_NUBE)) {
    if (localStorage.getItem('paglot-nube-apagada') === '1') localStorage.setItem(CLAVE_NUBE, 'no');
    else if (localStorage.getItem('paglot-cuenta')) localStorage.setItem(CLAVE_NUBE, 'si');
  }
  localStorage.removeItem('paglot-nube-apagada');
} catch { /* sin almacenamiento */ }
const ESPERA_SUBIDA = 3000;

// Las pruebas automáticas (_herramientas/probar_cursos.mjs, la auditoría, las capturas) la apagan: cada una abre la app
// como nueva y, si no, crearía una cuenta de prueba en la nube.
const sinNube = (() => { try { return localStorage.getItem('paglot-sin-nube') === '1'; } catch { return false; } })();
export const nubeActiva = Boolean(SUPABASE_URL && SUPABASE_CLAVE_PUBLICA) && !sinNube;

/** true solo si la persona ha encendido la nube en este dispositivo; si no, su progreso no sale de aquí. */
export function progresoEnLaNube() {
  try { return localStorage.getItem(CLAVE_NUBE) === 'si'; } catch { return false; }
}

/** estado: apagada · conectando · guardada · sin-conexion · error · desactivada (la ha apagado la persona).
 *  ultima: fecha de la última subida buena. */
export const nube = { estado: !nubeActiva ? 'apagada' : progresoEnLaNube() ? 'conectando' : 'desactivada', ultima: null };
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

export async function rpc(funcion, datos = {}, token = null) {
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
// Cada subida del curso de ahora lleva la hora («cuando»). Si al releer la nube su hora no es la de lo último que se
// subió o se juntó aquí, otro dispositivo ha cambiado este curso entretanto: se junta antes de escribir, para no pisarlo.
let ultimaMarca = null;

const cursosDe = remoto => (remoto?.cursos ?? (remoto?.version === 2 ? { es: remoto } : {}));
const paraSubir = () => ({ version: 3, cursos: { ...cursosNube, [curso.id]: { ...copiaCompleta(), cuando: Date.now() } } });

/** Junta en este dispositivo la copia de la nube del curso de ahora, si es de otro momento. */
function juntarSiCambio() {
  const remoto = curso.id ? cursosNube?.[curso.id] : null;
  if (!remoto || remoto.version !== 2 || (remoto.cuando ?? null) === ultimaMarca) return false;
  ultimaMarca = remoto.cuando ?? null;
  importarCopia(remoto);
  window.dispatchEvent(new Event('datos-sincronizados'));
  return true;
}

async function subir() {
  if (!nubeActiva || !progresoEnLaNube() || !curso.id) return;
  const numero = numeroCuenta();
  if (!numero) return;
  try {
    if (cursosNube === null) await bajarYJuntar(numero);
    // justo antes de escribir se releen los demás cursos: otro dispositivo puede haberlos cambiado desde que se
    // abrió la app, y subir la copia de entonces los pisaría (el curso de ahora va tal cual está aquí)
    else {
      cursosNube = { ...cursosDe(await rpc('paglot_leer', { p_numero: numero })) };
      juntarSiCambio();
    }
    const datos = paraSubir();
    subiendo = rpc('paglot_guardar', { p_numero: numero, p_datos: datos });
    await subiendo;
    cursosNube = datos.cursos;
    ultimaMarca = datos.cursos[curso.id].cuando;
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
  ultimaMarca = null;
  return juntarSiCambio();
}

/** Al abrir la app: junta lo de la nube y se pone a subir los cambios. */
export async function iniciarNube() {
  if (!nubeActiva || !progresoEnLaNube() || iniciada) return;
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
    if (!n || cursosNube === null || !curso.id || !progresoEnLaNube()) return;
    const cuerpo = JSON.stringify({ p_numero: n, p_datos: paraSubir() });
    // keepalive (que sigue aunque se cierre la app) solo admite unos 64 KB; una copia más grande se sube de forma normal
    // (en el móvil la app suele quedar en segundo plano y le da tiempo) y, si no, se subirá al volver
    if (cuerpo.length > 60000) { subir(); return; }
    try {
      fetch(`${SUPABASE_URL}/rest/v1/rpc/paglot_guardar`, {
        method: 'POST',
        keepalive: true,
        headers: { apikey: SUPABASE_CLAVE_PUBLICA, 'Content-Type': 'application/json' },
        body: cuerpo,
      }).catch(() => {});
    } catch { /* no se pudo: se subirá la próxima vez */ }
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
  try { localStorage.setItem(CLAVE_NUMERO, numero); localStorage.setItem(CLAVE_NUBE, 'si'); } catch { /* sin almacenamiento */ }
  cursosNube = null;
  await bajarYJuntar(numero);
  await subir();
}

/** Borra la cuenta de la nube y apaga la nube en este dispositivo: el progreso se queda aquí y ya no se sube nada.
 *  Si se vuelve a encender, se empieza con un número nuevo. */
export async function borrarCuentaNube() {
  const numero = numeroCuenta();
  await rpc('paglot_borrar', { p_numero: numero });
  try { localStorage.setItem(CLAVE_NUMERO, numeroNuevo()); } catch { /* sin almacenamiento */ }
  apagarNube();
}

/** Deja de subir y bajar el progreso en este dispositivo (lo que ya hay en la nube se queda hasta que caduque o se borre). */
export function apagarNube() {
  try { localStorage.setItem(CLAVE_NUBE, 'no'); } catch { /* sin almacenamiento */ }
  clearTimeout(reloj);
  reloj = null;
  cursosNube = null;
  avisar('desactivada');
}

/** Vuelve a guardar el progreso en la nube: junta lo de allí con lo de aquí y sigue subiendo los cambios. */
export async function encenderNube() {
  try { localStorage.setItem(CLAVE_NUBE, 'si'); } catch { /* sin almacenamiento */ }
  avisar('conectando');
  if (iniciada) {
    try { await bajarYJuntar(numeroCuenta()); await subir(); } catch (e) { avisar(e.estado ? 'error' : 'sin-conexion'); }
  } else {
    await iniciarNube();
  }
}

/** Borra todo lo de Paglot: la cuenta en la nube (si la hay) y todo lo guardado en este dispositivo, de todos los
 *  cursos. Después hay que recargar la app. */
export async function borrarTodo() {
  if (nubeActiva && progresoEnLaNube()) {
    try { await rpc('paglot_borrar', { p_numero: numeroCuenta() }); } catch { /* sin conexión: caducará sola a los 7 días */ }
  }
  try { await window.PaglotRecordatorio?.('no'); } catch { /* sin APK */ }
  clearTimeout(reloj);
  reloj = null;
  try { localStorage.clear(); } catch { /* sin almacenamiento */ }
  try { sessionStorage.clear(); } catch { /* sin almacenamiento */ }
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
