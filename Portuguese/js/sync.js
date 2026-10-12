// Cuentas de usuario y sincronización del progreso con Supabase.
// Solo se activa si config.js tiene la URL y la clave pública.
// La librería de Supabase se descarga únicamente cuando hace falta.
//
// Cómo se sincroniza (ver también filas.js y supabase/esquema.sql):
// 1. Se leen todas las filas del usuario (perfil, progreso de lecciones y ejercicios,
//    cuaderno y actividad) y el catálogo de lecciones.
// 2. Se juntan con los datos de este navegador (gana lo más reciente; nunca se pierde
//    un ejercicio hecho en otro dispositivo).
// 3. Se suben solo las filas que han cambiado, con upsert sobre la clave primaria:
//    repetir una lección, volver a abrirla o cambiar el idioma de la interfaz nunca
//    crea filas duplicadas.
// Sin sesión, todo sigue guardándose en el navegador; al iniciar sesión se junta con la cuenta.

import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA } from './config.js';
import { todosLosDatos, reemplazarDatos, unirDatos, alCambiar } from './progress.js';
import { TABLAS, COLUMNAS, ORDEN, datosAFilas, filasADatos, filasCambiadas } from './filas.js';
import { t, idioma, cambiarIdioma, hayIdiomaGuardado } from './i18n.js';
import { msg } from './lessons.js';

const LIBRERIA = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const ESPERA_SUBIDA = 2000;
const PAGINA = 1000; // filas por petición (límite habitual de la API de Supabase)
const LOTE_SUBIDA = 500;

export const nubeConfigurada = Boolean(SUPABASE_URL && SUPABASE_CLAVE_PUBLICA);

let cliente = null;
let usuario = null;
let temporizador = null;
let enCurso = null;
const oyentes = new Set();

/**
 * estado: desactivada · sin-sesion · sincronizando · sincronizada · error
 * mensaje: aviso traducible { k, v } (se traduce al mostrarlo) o null.
 */
export const nube = { estado: nubeConfigurada ? 'sin-sesion' : 'desactivada', mensaje: null, ultima: null, recuperando: false };

function avisar(estado, mensaje = null) {
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
    throw new Error(t('cloud.error.cannotConnect'));
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
    setTimeout(() => { location.hash = '#/perfil'; avisar(nube.estado, nube.mensaje); }, 0);
  }
  const antes = usuario?.id;
  usuario = sesion?.user ?? null;
  if (evento === 'INITIAL_SESSION') return; // de esto se encarga iniciarNube
  if (!usuario) avisar('sin-sesion');
  // Se aplaza: llamar a Supabase dentro de este aviso puede bloquearlo.
  else if (usuario.id !== antes) setTimeout(() => sincronizar(), 0);
}

export async function iniciarNube() {
  if (!nubeConfigurada) return;
  try {
    const c = await obtenerCliente();
    const { data } = await c.auth.getSession();
    usuario = data.session?.user ?? null;
    alCambiar(programarSubida);
    // El idioma de la interfaz se guarda también en el perfil (no afecta al progreso).
    window.addEventListener('idioma-cambiado', programarSubida);
    if (usuario) await sincronizar();
    else avisar('sin-sesion');
  } catch (e) {
    console.error(e);
    avisar('error', msg('cloud.error.offlineLocal'));
  }
}

// ---------------------------------------------------------------------------
// Lectura y escritura
// ---------------------------------------------------------------------------

/** Lee todas las filas de una consulta, página a página. */
async function todasLasFilas(crearConsulta) {
  const filas = [];
  for (let desde = 0; ; desde += PAGINA) {
    const { data, error } = await crearConsulta().range(desde, desde + PAGINA - 1);
    if (error) throw error;
    filas.push(...data);
    if (data.length < PAGINA) return filas;
  }
}

async function descargar(c) {
  const uid = usuario.id;
  // Se ordena por toda la clave primaria para que la paginación no salte ni repita filas.
  const ordenar = (consulta, columnas) => columnas.reduce((q, col) => q.order(col), consulta);
  const leer = tabla => todasLasFilas(() => ordenar(
    c.from(TABLAS[tabla]).select(COLUMNAS[tabla].campos.join(',')).eq('user_id', uid), COLUMNAS[tabla].clave));
  const [perfil, progresoLecciones, progresoEjercicios, cuaderno, actividad, catalogo] = await Promise.all([
    leer('perfil'),
    leer('progresoLecciones'),
    leer('progresoEjercicios'),
    leer('cuaderno'),
    leer('actividad'),
    todasLasFilas(() => c.from(TABLAS.lecciones).select('id').order('id')),
  ]);
  return {
    remotas: { perfil, progresoLecciones, progresoEjercicios, cuaderno, actividad },
    leccionesConocidas: new Set(catalogo.map(f => f.id)),
  };
}

async function subirFilas(c, cambios) {
  for (const tabla of ORDEN) {
    const filas = cambios[tabla];
    for (let i = 0; i < filas.length; i += LOTE_SUBIDA) {
      const { error } = await c.from(TABLAS[tabla]).upsert(filas.slice(i, i + LOTE_SUBIDA), { onConflict: COLUMNAS[tabla].clave.join(',') });
      if (error) throw error;
    }
  }
}

/** Tras un reinicio hecho en algún dispositivo, se borran de la nube las filas anteriores a él. */
async function borrarAnterioresA(c, instante) {
  // Borrar el progreso de una lección borra también el de sus ejercicios (on delete cascade).
  for (const tabla of ['progresoLecciones', 'progresoEjercicios', 'cuaderno', 'actividad']) {
    const { error } = await c.from(TABLAS[tabla]).delete().eq('user_id', usuario.id).lt('client_ts', instante);
    if (error) throw error;
  }
}

/**
 * Baja los datos de la nube, los junta con los locales y sube lo que haya cambiado.
 * repintar: si han llegado datos nuevos, la pantalla abierta se vuelve a pintar.
 */
export function sincronizar({ repintar = true } = {}) {
  if (!usuario) return Promise.resolve();
  // Si ya hay una sincronización en marcha, se encadena detrás (nunca dos a la vez).
  enCurso = (enCurso ?? Promise.resolve()).then(() => sincronizarAhora(repintar)).finally(() => { enCurso = null; });
  return enCurso;
}

async function sincronizarAhora(repintar) {
  if (!usuario) return;
  avisar('sincronizando');
  try {
    const c = await obtenerCliente();
    const { remotas, leccionesConocidas } = await descargar(c);
    const remoto = filasADatos(remotas);

    // Un dispositivo nuevo adopta el idioma guardado en la cuenta (si el usuario no eligió otro aquí).
    const idiomaCuenta = remotas.perfil[0]?.ui_language;
    if (idiomaCuenta && !hayIdiomaGuardado()) cambiarIdioma(idiomaCuenta);

    const antes = JSON.stringify(todosLosDatos());
    const unidos = unirDatos(todosLosDatos(), remoto);
    reemplazarDatos(unidos);

    const reinicioRemoto = Number(remotas.perfil[0]?.reset_at ?? 0);
    const { filas, omitidas } = datosAFilas(unidos, usuario.id, { idiomaInterfaz: idioma(), leccionesConocidas });
    let cambios;
    if (unidos.reiniciado > reinicioRemoto) {
      await borrarAnterioresA(c, unidos.reiniciado);
      cambios = filas; // tras el reinicio se sube todo lo vigente
    } else {
      cambios = filasCambiadas(filas, remotas);
    }
    await subirFilas(c, cambios);

    avisar('sincronizada', omitidas.length ? msg('cloud.lessonsNotInCatalog', { n: omitidas.length, ids: omitidas.join(', ') }) : null);
    if (omitidas.length) console.warn('Lecciones que no están en el catálogo de Supabase:', omitidas);
    if (repintar && JSON.stringify(todosLosDatos()) !== antes) window.dispatchEvent(new Event('datos-sincronizados'));
  } catch (e) {
    console.error(e);
    avisar('error', mensajeDeError(e));
  }
}

function programarSubida() {
  if (!usuario) return;
  clearTimeout(temporizador);
  // Antes de subir se juntan los datos de la nube: así no se pisa lo que otro
  // dispositivo haya guardado mientras tanto. No se repinta la pantalla.
  temporizador = setTimeout(() => sincronizar({ repintar: false }), ESPERA_SUBIDA);
}

/** Clave del mensaje (claves «cloud.error.*») para un error de Supabase. */
function claveDeError(e) {
  const m = String(e?.message ?? e);
  if (/invalid login credentials/i.test(m)) return 'cloud.error.badLogin';
  if (/email not confirmed/i.test(m)) return 'cloud.error.notConfirmed';
  if (/already registered/i.test(m)) return 'cloud.error.alreadyRegistered';
  if (/password/i.test(m) && /6|characters|short/i.test(m)) return 'cloud.error.passwordShort';
  if (/same.*password|different from the old/i.test(m)) return 'cloud.error.samePassword';
  if (/weak|pwned/i.test(m)) return 'cloud.error.weakPassword';
  if (/valid email|invalid.*email/i.test(m)) return 'cloud.error.badEmail';
  if (/rate limit/i.test(m)) return 'cloud.error.rateLimit';
  if (/relation|does not exist|schema cache/i.test(m) || e?.code === '42P01' || e?.code === 'PGRST205') return 'cloud.error.noTables';
  if (/foreign key/i.test(m) || e?.code === '23503') return 'cloud.error.catalog';
  if (/row-level security|permission denied/i.test(m) || e?.code === '42501') return 'cloud.error.permission';
  if (/fetch|network|import/i.test(m)) return 'cloud.error.offlineLocal';
  return null;
}

function mensajeDeError(e) {
  const clave = claveDeError(e);
  return clave ? msg(clave) : msg('cloud.error.generic', { detalle: String(e?.message ?? e) });
}

/** Error para los formularios, ya traducido. */
function errorTraducido(e) {
  const clave = claveDeError(e);
  return new Error(clave ? t(clave) : t('cloud.error.generic', { detalle: String(e?.message ?? e) }));
}

// ---------------------------------------------------------------------------
// Cuenta
// ---------------------------------------------------------------------------

export async function entrar(correo, contrasena) {
  const c = await obtenerCliente();
  const { error } = await c.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) throw errorTraducido(error);
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
    options: { emailRedirectTo: direccionDeVuelta(), data: { display_name: nombre } },
  });
  if (error) throw errorTraducido(error);
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
  if (error) throw errorTraducido(error);
}

export async function cambiarContrasena(nueva) {
  const c = await obtenerCliente();
  const { error } = await c.auth.updateUser({ password: nueva });
  if (error) throw errorTraducido(error);
  nube.recuperando = false;
  avisar(nube.estado, nube.mensaje);
}

/** Borra todas las filas del usuario en la nube (los datos de este navegador se quedan). */
export async function borrarDatosNube() {
  if (!usuario) return;
  const c = await obtenerCliente();
  clearTimeout(temporizador);
  for (const tabla of ['progresoEjercicios', 'progresoLecciones', 'cuaderno', 'actividad', 'perfil']) {
    const { error } = await c.from(TABLAS[tabla]).delete().eq('user_id', usuario.id);
    if (error) throw errorTraducido(error);
  }
}
