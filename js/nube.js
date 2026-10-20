// El progreso en la nube (Supabase), con la cuenta del código (js/cuenta.js).
// - Todo el progreso (lo de copiaCompleta en progress.js: lecciones, cuaderno, juegos, CCSE y DELE) se sube al rato de
//   cada cambio y, al entrar, se junta con el de la nube sin perder nada. En el móvil queda siempre una copia, así se
//   estudia igual sin conexión.
// - Supabase solo deja llamar a dos funciones (_herramientas/supabase-phuong.sql), y las dos piden el código. Hasta
//   que se instalen, se usan las de Paglot (ver leerDeLaNube).

import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA } from './config.js';
import { copiaCompleta, importarCopia, alCambiar } from './progress.js';
import { codigoActual, alCambiarCuenta } from './cuenta.js';

const ESPERA_SUBIDA = 3000;
const ESPERA_MAXIMA = 12000;

// Las pruebas automáticas la apagan: abren la app como nueva cada vez.
const sinNube = (() => { try { return localStorage.getItem('phuong-sin-nube') === '1'; } catch { return false; } })();
export const nubeActiva = Boolean(SUPABASE_URL && SUPABASE_CLAVE_PUBLICA) && !sinNube;

/** estado: apagada · conectando · guardada · sin-conexion · sin-instalar (falta el SQL en Supabase) · error. */
export const nube = { estado: 'apagada', ultima: null };
const oyentes = new Set();
function avisar(estado) {
  nube.estado = estado;
  if (estado === 'guardada') nube.ultima = new Date();
  for (const fn of oyentes) fn(nube);
}
export function alCambiarNube(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }

const fallo = (codigo, detalle) => Object.assign(new Error(codigo), { codigo, detalle });

/** Llama a una función de Supabase. Devuelve su respuesta o lanza un error con «codigo». */
async function rpc(funcion, datos) {
  let r;
  try {
    r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcion}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_CLAVE_PUBLICA, 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
      signal: AbortSignal.timeout?.(ESPERA_MAXIMA),
    });
  } catch {
    throw fallo('sin-conexion');
  }
  const texto = await r.text();
  let cuerpo = null;
  try { cuerpo = texto ? JSON.parse(texto) : null; } catch { /* sin JSON */ }
  // la función no existe todavía: falta pegar el SQL en Supabase
  if (r.status === 404 || cuerpo?.code === 'PGRST202' || cuerpo?.code === '42883') throw fallo('sin-instalar', cuerpo);
  if (!r.ok) throw fallo('error', cuerpo);
  if (cuerpo?.error) throw fallo(cuerpo.error, cuerpo); // «codigo» o «demasiados»
  return cuerpo;
}

// Mientras no se haya pegado _herramientas/supabase-phuong.sql en Supabase, el progreso va a las funciones que ya
// tenía el proyecto de Paglot (cuentas de 16 cifras: el número sale del código). Esas cuentas se borran solas tras 7 días
// sin usarse, pero el móvil guarda siempre su copia y la vuelve a subir al abrir la app. En cuanto existe
// phuong_leer, se usa esa (y lo del móvil se sube allí).
let motor = null; // 'phuong' · 'antiguo'
const numeroAntiguo = codigo => String(codigo).repeat(16).slice(0, 16);

/** Trae lo guardado en la nube: { datos, cuando }. Lanza «codigo», «sin-conexion», «sin-instalar»… */
export async function leerDeLaNube(codigo) {
  if (motor !== 'antiguo') {
    try {
      const r = await rpc('phuong_leer', { p_codigo: codigo });
      motor = 'phuong';
      return r;
    } catch (e) {
      if (e.codigo !== 'sin-instalar') throw e;
      motor = 'antiguo';
    }
  }
  const d = await rpc('paglot_leer', { p_numero: numeroAntiguo(codigo) });
  return d?.phuong ? { datos: d.datos, cuando: d.cuando ?? null } : { datos: null, cuando: null };
}

function guardarEnLaNube(codigo, datos, cuando) {
  if (motor === 'antiguo') return rpc('paglot_guardar', { p_numero: numeroAntiguo(codigo), p_datos: { phuong: true, cuando, datos } });
  return rpc('phuong_guardar', { p_codigo: codigo, p_datos: datos, p_cuando: cuando });
}

// ----- Subir y bajar -----
// Cada copia lleva su hora («cuando»): si al leer la nube su hora no es la de lo último que se subió o se juntó aquí,
// otro móvil cambió algo y se junta antes de escribir.
let reloj = null;
let iniciada = false;
let ultimaMarca = null;
let ultimaSubida = 0;
let cola = Promise.resolve();

const activa = () => nubeActiva && Boolean(codigoActual());

async function bajarYJuntar() {
  const r = await leerDeLaNube(codigoActual());
  const remoto = r?.datos;
  if (!remoto || remoto.version !== 2 || (r.cuando ?? null) === ultimaMarca) return false;
  ultimaMarca = r.cuando ?? null;
  importarCopia(remoto);
  window.dispatchEvent(new Event('datos-sincronizados'));
  return true;
}

function subir() {
  // una subida detrás de otra, nunca dos a la vez
  cola = cola.then(async () => {
    if (!activa()) return;
    try {
      await bajarYJuntar();
      // las funciones de Paglot no dejan escribir dos veces en menos de 2 segundos
      const espera = 2500 - (Date.now() - ultimaSubida);
      if (espera > 0) await new Promise(r => setTimeout(r, espera));
      const cuando = Date.now();
      ultimaSubida = cuando;
      await guardarEnLaNube(codigoActual(), copiaCompleta(), cuando);
      ultimaMarca = cuando;
      avisar('guardada');
    } catch (e) {
      avisar(['sin-conexion', 'sin-instalar'].includes(e.codigo) ? e.codigo : 'error');
    }
  });
  return cola;
}

function subirLuego() {
  if (!activa()) return;
  clearTimeout(reloj);
  reloj = setTimeout(() => { reloj = null; subir(); }, ESPERA_SUBIDA);
}

/** Sube ya lo pendiente (el botón «Guardar ahora» del perfil). */
export function guardarYa() {
  clearTimeout(reloj);
  reloj = null;
  if (!activa()) return Promise.resolve();
  avisar('conectando');
  return subir();
}

/** Al entrar en la app: junta lo de la nube y sube los cambios; desde ahí, sube al rato de cada cambio. */
export function iniciarNube() {
  if (!nubeActiva) return;
  if (!iniciada) {
    iniciada = true;
    alCambiar(subirLuego);
    for (const evento of ['examen-cambiado', 'logro-ganado', 'cofre-abierto', 'reto-terminado']) window.addEventListener(evento, subirLuego);
    // al irse de la app, lo pendiente se sube ya (en el móvil suele quedar en segundo plano y le da tiempo)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && reloj) guardarYa();
      if (document.visibilityState === 'visible' && activa()) subirLuego(); // y al volver, lo de otro móvil
    });
    window.addEventListener('online', () => { if (nube.estado !== 'guardada') subirLuego(); });
    alCambiarCuenta(c => { if (c) { avisar('conectando'); subir(); } else { clearTimeout(reloj); avisar('apagada'); } });
  }
  if (!activa()) { avisar('apagada'); return; }
  avisar('conectando');
  subir();
}
