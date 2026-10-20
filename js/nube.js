// El progreso en la nube, con la cuenta (correo y contraseña, ver js/servidor.js): desde el 20-10-2026 hace falta una
// cuenta para estudiar, así que con sesión abierta el progreso se guarda siempre en la nube.
// - El progreso de cada curso (todo lo de copiaCompleta) se sube al rato de cada cambio y, al abrir, se junta con el
//   de la nube sin perder nada. En el dispositivo queda una copia para poder estudiar sin conexión.
// - En local va a Supabase y en el hosting al servidor propio (PHP): lo decide servidor.js.
// - El laboratorio de ideas y los avisos de errores usan rpc(): en local, las funciones de Supabase; en el hosting,
//   las mismas llamadas al PHP (api/index.php, rutas «rpc/…»).
import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA } from './config.js';
import { copiaCompleta, importarCopia, alCambiar } from './progress.js';
import { curso } from './curso.js';
import { motor, haySesion, alCambiarSesion, leerProgreso, guardarProgreso, refrescarUsuario, salir } from './servidor.js';

const ESPERA_SUBIDA = 3000;
const API = window.Capacitor?.isNativePlatform?.() ? 'https://paglot.eu/api/' : `${location.origin}/api/`;

// Las pruebas automáticas (capturas, auditorías) la apagan: abren la app como nueva cada vez.
const sinNube = (() => { try { return localStorage.getItem('paglot-sin-nube') === '1'; } catch { return false; } })();
export const nubeActiva = (motor === 'php' || Boolean(SUPABASE_URL && SUPABASE_CLAVE_PUBLICA)) && !sinNube;

/** Con cuenta, el progreso siempre va a la nube. */
export const progresoEnLaNube = () => nubeActiva && haySesion();

/** estado: apagada (sin cuenta) · conectando · guardada · sin-conexion · error. ultima: la última subida buena. */
export const nube = { estado: progresoEnLaNube() ? 'conectando' : 'apagada', ultima: null };
const oyentes = new Set();
function avisar(estado) {
  nube.estado = estado;
  if (estado === 'guardada') nube.ultima = new Date();
  for (const fn of oyentes) fn(nube);
}
export function alCambiarNube(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }

// ----- Llamadas sueltas (laboratorio, errores) -----
const ESPERA_MAXIMA = 8000;
export async function rpc(funcion, datos = {}) {
  const enPhp = motor === 'php';
  const respuesta = await fetch(enPhp ? `${API}?r=rpc/${funcion}` : `${SUPABASE_URL}/rest/v1/rpc/${funcion}`, {
    method: 'POST',
    headers: enPhp ? { 'Content-Type': 'application/json' } : { apikey: SUPABASE_CLAVE_PUBLICA, 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
    signal: AbortSignal.timeout?.(ESPERA_MAXIMA),
  });
  if (!respuesta.ok) {
    const error = new Error(`nube ${respuesta.status}`);
    error.estado = respuesta.status;
    try { error.detalle = await respuesta.json(); } catch { /* sin cuerpo */ }
    throw error;
  }
  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

// ----- Subir y bajar -----
// Para no pisar lo de otro dispositivo, cada copia lleva su hora («cuando»): si al leer la nube su hora no es la de lo
// último que se subió o se juntó aquí, otro dispositivo cambió este curso y se junta antes de escribir.
let reloj = null;
let iniciada = false;
let ultimaMarca = null;

async function bajarYJuntar() {
  if (!curso.id) return false;
  const remoto = (await leerProgreso())?.[curso.id];
  if (!remoto?.datos || remoto.datos.version !== 2 || (remoto.cuando ?? null) === ultimaMarca) return false;
  ultimaMarca = remoto.cuando ?? null;
  importarCopia(remoto.datos);
  window.dispatchEvent(new Event('datos-sincronizados'));
  return true;
}

async function subir() {
  if (!progresoEnLaNube() || !curso.id) return;
  try {
    await bajarYJuntar();
    const cuando = Date.now();
    await guardarProgreso(curso.id, copiaCompleta(), cuando);
    ultimaMarca = cuando;
    avisar('guardada');
  } catch (e) {
    avisar(e.codigo === 'sin-conexion' ? 'sin-conexion' : 'error');
  }
}
function subirLuego() {
  if (!progresoEnLaNube()) return;
  clearTimeout(reloj);
  reloj = setTimeout(subir, ESPERA_SUBIDA);
}

/** Al abrir la app (y al entrar en la cuenta): pone al día el plan, junta lo de la nube y sube los cambios. */
export async function iniciarNube() {
  if (!nubeActiva) return;
  if (!iniciada) {
    iniciada = true;
    alCambiar(subirLuego);
    for (const evento of ['logro-ganado', 'cofre-abierto', 'reto-terminado']) window.addEventListener(evento, subirLuego);
    // al irse de la app, lo pendiente se sube ya (en el móvil suele quedar en segundo plano y le da tiempo)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && reloj) { clearTimeout(reloj); reloj = null; subir(); }
    });
    window.addEventListener('online', () => { if (nube.estado !== 'guardada') subir(); });
    // al entrar o salir de la cuenta
    alCambiarSesion(u => { if (u) { avisar('conectando'); subir(); } else avisar('apagada'); });
  }
  if (!haySesion()) { avisar('apagada'); return; }
  avisar('conectando');
  try { await refrescarUsuario(); } catch { /* sin conexión: vale lo último que se supo */ }
  await subir();
}

/** Borra todo lo de Paglot en este dispositivo (y cierra la sesión). Después hay que recargar la app.
 *  Borrar la cuenta del servidor se hace aparte (Perfil → Cuenta → Borrar mi cuenta). */
export async function borrarTodo() {
  try { await salir(); } catch { /* sin conexión */ }
  try { await window.PaglotRecordatorio?.('no'); } catch { /* sin APK */ }
  clearTimeout(reloj);
  reloj = null;
  try { localStorage.clear(); } catch { /* sin almacenamiento */ }
  try { sessionStorage.clear(); } catch { /* sin almacenamiento */ }
}
