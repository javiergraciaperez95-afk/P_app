// Cuentas de usuario y sincronización del progreso con Supabase.
// Solo se activa si config.js tiene la URL y la clave pública.
// La librería de Supabase se descarga únicamente cuando hace falta.

import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA, SUPABASE_TABLA } from './config.js';
import { todosLosDatos, reemplazarDatos, unirDatos, alCambiar } from './progress.js';

const LIBRERIA = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const ESPERA_SUBIDA = 2000;

export const nubeConfigurada = Boolean(SUPABASE_URL && SUPABASE_CLAVE_PUBLICA);

let cliente = null;
let usuario = null;
let temporizador = null;
const oyentes = new Set();

/** estado: desactivada · sin-sesion · sincronizando · sincronizada · error */
export const nube = { estado: nubeConfigurada ? 'sin-sesion' : 'desactivada', mensaje: '', ultima: null, recuperando: false };

function avisar(estado, mensaje = '') {
  nube.estado = estado;
  nube.mensaje = mensaje;
  if (estado === 'sincronizada') nube.ultima = new Date();
  for (const fn of oyentes) fn(nube);
}

export function alCambiarNube(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

export function usuarioActual() {
  return usuario;
}

async function obtenerCliente() {
  if (cliente) return cliente;
  let createClient;
  try {
    ({ createClient } = await import(LIBRERIA));
  } catch {
    throw new Error('No se ha podido conectar con el servidor de cuentas. Revisa tu conexión a internet y vuelve a probar.');
  }
  cliente = createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICA, {
    // PKCE: los enlaces de los correos vuelven con «?code=…» y no ocupan el «#»,
    // que es lo que usa la web para saber en qué pantalla está.
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
  });
  // Se escucha desde el principio para no perderse el aviso de «recuperar contraseña»,
  // que llega mientras la librería lee el enlace del correo.
  cliente.auth.onAuthStateChange(alCambiarSesion);
  return cliente;
}

function alCambiarSesion(evento, sesion) {
  // Llegada desde el enlace de «he olvidado mi contraseña».
  if (evento === 'PASSWORD_RECOVERY') {
    nube.recuperando = true;
    setTimeout(() => { location.hash = '#/perfil'; avisar(nube.estado); }, 0);
  }
  const antes = usuario?.id;
  usuario = sesion?.user ?? null;
  if (evento === 'INITIAL_SESSION') return; // de esto se encarga iniciarNube
  if (!usuario) avisar('sin-sesion');
  // Se aplaza: llamar a Supabase dentro de este aviso puede bloquearlo.
  else if (usuario.id !== antes) setTimeout(sincronizar, 0);
}

export async function iniciarNube() {
  if (!nubeConfigurada) return;
  try {
    const c = await obtenerCliente();
    const { data } = await c.auth.getSession();
    usuario = data.session?.user ?? null;
    alCambiar(programarSubida);
    if (usuario) await sincronizar();
    else avisar('sin-sesion');
  } catch (e) {
    console.error(e);
    avisar('error', 'No se ha podido conectar con el servidor. Tu progreso se sigue guardando en este navegador.');
  }
}

/** Baja los datos de la nube, los junta con los locales y sube el resultado. */
export async function sincronizar() {
  if (!usuario) return;
  avisar('sincronizando');
  try {
    const c = await obtenerCliente();
    const { data, error } = await c.from(SUPABASE_TABLA).select('datos').eq('user_id', usuario.id).maybeSingle();
    if (error) throw error;
    const antes = JSON.stringify(todosLosDatos());
    reemplazarDatos(unirDatos(todosLosDatos(), data?.datos ?? null));
    await subir();
    // Si han llegado datos nuevos de la nube, la pantalla abierta se repinta.
    if (JSON.stringify(todosLosDatos()) !== antes) window.dispatchEvent(new Event('datos-sincronizados'));
  } catch (e) {
    console.error(e);
    avisar('error', textoDeError(e));
  }
}

async function subir() {
  const c = await obtenerCliente();
  const { error } = await c.from(SUPABASE_TABLA).upsert({
    user_id: usuario.id,
    datos: todosLosDatos(),
    actualizado: new Date().toISOString(),
  });
  if (error) throw error;
  avisar('sincronizada');
}

function programarSubida() {
  if (!usuario) return;
  clearTimeout(temporizador);
  temporizador = setTimeout(async () => {
    avisar('sincronizando');
    try {
      // Antes de subir se juntan los datos de la nube: así no se pisa lo que
      // otro dispositivo haya guardado mientras tanto. No se repinta la pantalla.
      const c = await obtenerCliente();
      const { data, error } = await c.from(SUPABASE_TABLA).select('datos').eq('user_id', usuario.id).maybeSingle();
      if (error) throw error;
      if (data?.datos) reemplazarDatos(unirDatos(todosLosDatos(), data.datos));
      await subir();
    } catch (e) {
      console.error(e);
      avisar('error', textoDeError(e));
    }
  }, ESPERA_SUBIDA);
}

function textoDeError(e) {
  const m = String(e?.message ?? e);
  if (/invalid login credentials/i.test(m)) return 'El correo o la contraseña no son correctos.';
  if (/email not confirmed/i.test(m)) return 'Falta confirmar el correo: revisa tu bandeja de entrada (y la carpeta de spam).';
  if (/already registered/i.test(m)) return 'Ya existe una cuenta con ese correo. Prueba a iniciar sesión.';
  if (/password/i.test(m) && /6|characters|short/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/same.*password|different from the old/i.test(m)) return 'La contraseña nueva debe ser distinta de la anterior.';
  if (/weak|pwned/i.test(m)) return 'Esa contraseña es demasiado fácil de adivinar. Prueba con otra más larga.';
  if (/valid email|invalid.*email/i.test(m)) return 'El correo no parece válido.';
  if (/rate limit/i.test(m)) return 'Demasiados intentos seguidos. Espera un poco y vuelve a probar.';
  if (/relation|does not exist|schema cache/i.test(m)) return 'La tabla de la app no existe todavía en Supabase (falta ejecutar supabase/esquema.sql).';
  if (/fetch|network|import/i.test(m)) return 'Sin conexión con el servidor. Tu progreso se sigue guardando en este navegador.';
  return `Algo ha fallado con la cuenta: ${m}`;
}

// ---------------------------------------------------------------------------
// Cuenta
// ---------------------------------------------------------------------------

export async function entrar(correo, contrasena) {
  const c = await obtenerCliente();
  const { error } = await c.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) throw new Error(textoDeError(error));
}

function direccionDeVuelta() {
  return `${location.origin}${location.pathname}`;
}

/** Devuelve true si hace falta confirmar el correo. */
export async function crearCuenta(correo, contrasena, nombre = '') {
  const c = await obtenerCliente();
  const { data, error } = await c.auth.signUp({
    email: correo,
    password: contrasena,
    options: { emailRedirectTo: direccionDeVuelta(), data: { nombre } },
  });
  if (error) throw new Error(textoDeError(error));
  return !data.session;
}

export async function salir() {
  const c = await obtenerCliente();
  clearTimeout(temporizador);
  await c.auth.signOut();
  usuario = null;
  avisar('sin-sesion');
}

/** Envía un correo con un enlace para poner una contraseña nueva. */
export async function recuperarContrasena(correo) {
  const c = await obtenerCliente();
  const { error } = await c.auth.resetPasswordForEmail(correo, { redirectTo: direccionDeVuelta() });
  if (error) throw new Error(textoDeError(error));
}

export async function cambiarContrasena(nueva) {
  const c = await obtenerCliente();
  const { error } = await c.auth.updateUser({ password: nueva });
  if (error) throw new Error(textoDeError(error));
  nube.recuperando = false;
  avisar(nube.estado);
}

/** Borra la copia de la nube (los datos de este navegador se quedan). */
export async function borrarDatosNube() {
  if (!usuario) return;
  const c = await obtenerCliente();
  clearTimeout(temporizador);
  const { error } = await c.from(SUPABASE_TABLA).delete().eq('user_id', usuario.id);
  if (error) throw new Error(textoDeError(error));
}
