// Cuentas de usuario y progreso en la nube, con la API propia (servidor/, ver servidor/LEEME.md).
// Solo se activa si config.js tiene la dirección de la API.
//
// Tres formas de entrar:
//   - código de 6 cifras por correo (pedirCodigo + entrarConCodigo): entrar y crear la cuenta son lo mismo;
//   - Google (entrarConGoogle, con el token que da Google: ver js/google.js);
//   - correo y contraseña (entrar, crearCuenta, recuperarContrasena).
// La sesión es un token que se guarda en el dispositivo y va en cada petición («Authorization: Bearer …»).

import { API_URL } from './config.js';
import { curso } from './curso.js';
import { todosLosDatos, datosParaGuardar, reemplazarDatos, unirDatos, alCambiar } from './progress.js';
import { t, idioma } from './i18n.js';

const ESPERA_SUBIDA = 2000;
const CLAVE_SESION = 'paglot-sesion'; // { token, usuario }: la misma para todos los cursos

export const nubeConfigurada = Boolean(API_URL);

let sesion = leerSesion();
let usuario = sesion ? adaptar(sesion.usuario) : null;
let version = 0; // la versión del progreso de este curso en la nube (para no pisar a otro dispositivo)
let temporizador = null;
const oyentes = new Set();

/**
 * estado: desactivada · sin-sesion · sin-curso · sincronizando · sincronizada · error
 * mensaje(): el texto del error, en el idioma que esté puesto al leerlo.
 * recuperando: el token del enlace «he olvidado mi contraseña» mientras se pone la nueva.
 */
export const nube = { estado: nubeConfigurada ? 'sin-sesion' : 'desactivada', mensaje: () => '', ultima: null, recuperando: null };

function avisar(estado, mensaje = () => '') {
  nube.estado = estado;
  nube.mensaje = mensaje;
  if (estado === 'sincronizada') nube.ultima = new Date();
  for (const fn of oyentes) fn(nube);
}

export function alCambiarNube(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

/**
 * La cuenta con sesión, o null. Conserva la forma que tenía con Supabase (email, user_metadata), que es
 * la que usan la cabecera y el perfil; además dice si tiene contraseña y si está enlazada con Google.
 */
export function usuarioActual() {
  return usuario;
}

function adaptar(u) {
  if (!u) return null;
  return { id: u.id, email: u.correo, user_metadata: { nombre: u.nombre, foto: u.foto }, contrasena: u.contrasena !== false, google: Boolean(u.google) };
}

function leerSesion() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SESION));
    return s?.token ? s : null;
  } catch {
    return null;
  }
}

function guardarSesion(nueva) {
  sesion = nueva;
  usuario = adaptar(nueva?.usuario);
  try {
    if (nueva) localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
    else localStorage.removeItem(CLAVE_SESION);
  } catch { /* sin almacenamiento: la sesión dura lo que dure la visita */ }
}

// ---------------------------------------------------------------------------
// Peticiones a la API
// ---------------------------------------------------------------------------

/** Un error de la API: «codigo» es el de servidor/LEEME.md; «datos», lo que trae con él. */
class ErrorNube extends Error {
  constructor(codigo, datos = {}, estado = 0) {
    super(textoDeError(codigo, datos));
    this.codigo = codigo;
    this.datos = datos;
    this.estado = estado;
  }
}

async function api(metodo, ruta, cuerpo) {
  if (!nubeConfigurada) throw new ErrorNube('desactivada');
  const cabeceras = {};
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';
  if (sesion?.token) cabeceras.Authorization = `Bearer ${sesion.token}`;
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorNube('sin_conexion');
  }
  let json = null;
  try { json = await respuesta.json(); } catch { /* 202 y otros sin cuerpo */ }
  if (respuesta.ok) return json ?? {};
  const codigo = json?.error ?? 'interno';
  // La sesión ha caducado o se ha cerrado desde otro dispositivo: se sigue sin cuenta.
  if (codigo === 'sin_sesion' && sesion) {
    clearTimeout(temporizador);
    guardarSesion(null);
    avisar('sin-sesion');
  }
  throw new ErrorNube(codigo, json ?? {}, respuesta.status);
}

function textoDeError(codigo, datos = {}) {
  const claves = {
    credenciales: 'nube.err.credenciales',
    sin_confirmar: 'nube.err.sinConfirmar',
    contrasena_corta: 'form.contrasenaCorta',
    contrasena_debil: 'nube.err.debil',
    contrasena_igual: 'nube.err.mismaContrasena',
    contrasena_incorrecta: 'nube.err.contrasenaIncorrecta',
    correo_invalido: 'nube.err.correoInvalido',
    correo_igual: 'nube.err.correoIgual',
    correo_en_uso: 'nube.err.correoEnUso',
    codigo_invalido: 'nube.err.codigo',
    google_invalido: 'nube.err.google',
    google_desactivado: 'nube.err.google',
    enlace_invalido: 'nube.err.enlace',
    demasiados: 'nube.err.demasiados',
    sin_conexion: 'nube.err.sinConexion',
    desactivada: 'form.sinSupabase',
  };
  if (codigo === 'datos_invalidos' && datos.campo === 'correo') return t('nube.err.correoInvalido');
  return claves[codigo] ? t(claves[codigo]) : t('nube.err.otro', { mensaje: codigo });
}

// ---------------------------------------------------------------------------
// Sincronizar el progreso de este curso
// ---------------------------------------------------------------------------

export async function iniciarNube() {
  if (!nubeConfigurada) return;
  alCambiar(programarSubida);
  if (!sesion) { avisar('sin-sesion'); return; }
  try {
    // Al abrir la app se pregunta por la cuenta: así llegan el nombre o la foto cambiados en otro dispositivo.
    const { usuario: u } = await api('GET', '/yo');
    guardarSesion({ ...sesion, usuario: u });
    await sincronizar();
  } catch (e) {
    console.error(e);
    if (sesion) avisar('error', () => e.message);
  }
}

/** Baja los datos de la nube, los junta con los locales y sube el resultado. */
export async function sincronizar() {
  if (!sesion) return;
  // Sin curso elegido (pantalla de inicio) hay sesión, pero todavía no hay progreso que guardar.
  if (!curso.id) { avisar('sin-curso'); return; }
  avisar('sincronizando');
  try {
    const nubeDatos = await api('GET', `/progreso/${curso.id}`);
    version = nubeDatos.version ?? 0;
    const antes = JSON.stringify(todosLosDatos());
    reemplazarDatos(unirDatos(todosLosDatos(), nubeDatos.datos ?? null));
    await subir();
    // Si han llegado datos nuevos de la nube, la pantalla abierta se repinta.
    if (JSON.stringify(todosLosDatos()) !== antes) window.dispatchEvent(new Event('datos-sincronizados'));
  } catch (e) {
    console.error(e);
    if (sesion) avisar('error', () => e.message);
  }
}

/**
 * Sube el progreso. Si otro dispositivo ha guardado mientras tanto (409 «conflicto»), la API devuelve lo que
 * hay ahora: se junta con lo de aquí y se vuelve a intentar. Así nadie pisa a nadie.
 */
async function subir() {
  for (let intento = 0; ; intento++) {
    try {
      // las tarjetas sin lo deducible: así un cuaderno lleno cabe en el límite de la API (1,5 MB por curso)
      const r = await api('PUT', `/progreso/${curso.id}`, { datos: datosParaGuardar(), version });
      version = r.version;
      avisar('sincronizada');
      return;
    } catch (e) {
      if (intento >= 3) throw e;
      if (e.codigo === 'conflicto') {
        version = e.datos.version ?? 0;
        reemplazarDatos(unirDatos(todosLosDatos(), e.datos.datos ?? null));
      } else if (e.codigo === 'retroceso') {
        // Lo de aquí tiene mucho menos que la nube (p. ej. datos del navegador borrados): no se pisa la nube,
        // se baja lo que hay, se junta con lo de aquí y se vuelve a guardar.
        const nubeDatos = await api('GET', `/progreso/${curso.id}`);
        version = nubeDatos.version ?? 0;
        reemplazarDatos(unirDatos(todosLosDatos(), nubeDatos.datos ?? null));
        window.dispatchEvent(new Event('datos-sincronizados'));
      } else {
        throw e;
      }
    }
  }
}

function programarSubida() {
  if (!sesion || !curso.id) return;
  clearTimeout(temporizador);
  temporizador = setTimeout(async () => {
    avisar('sincronizando');
    try {
      await subir();
    } catch (e) {
      console.error(e);
      if (sesion) avisar('error', () => e.message);
    }
  }, ESPERA_SUBIDA);
}

// ---------------------------------------------------------------------------
// Entrar y crear la cuenta
// ---------------------------------------------------------------------------

/** Respuesta de la API que abre sesión ({token, usuario}): se guarda y se sincroniza. */
async function abrirSesion(r) {
  guardarSesion({ token: r.token, usuario: r.usuario });
  avisar(curso.id ? 'sincronizando' : 'sin-curso');
  await sincronizar();
  return r;
}

/** Manda un código de 6 cifras al correo. Llega aunque aún no haya cuenta (se crea al entrar). */
export async function pedirCodigo(correo) {
  await api('POST', '/codigo', { correo, idioma: idioma() });
}

/** Entra (o crea la cuenta) con el código. Devuelve true si la cuenta es nueva. */
export async function entrarConCodigo(correo, codigo, nombre = '') {
  const r = await api('POST', '/codigo/entrar', { correo, codigo, idioma: idioma(), ...(nombre ? { nombre } : {}) });
  await abrirSesion(r);
  return r.nueva;
}

/** Entra (o crea la cuenta) con el token que da Google. Devuelve true si la cuenta es nueva. */
export async function entrarConGoogle(credencial) {
  const r = await api('POST', '/google', { credencial, idioma: idioma() });
  await abrirSesion(r);
  return r.nueva;
}

export async function entrar(correo, contrasena) {
  await abrirSesion(await api('POST', '/entrar', { correo, contrasena }));
}

/** Devuelve true: con contraseña siempre hay que confirmar el correo (llega un enlace). */
export async function crearCuenta(correo, contrasena, nombre = '') {
  await api('POST', '/registro', { correo, contrasena, idioma: idioma(), ...(nombre ? { nombre } : {}) });
  return true;
}

export async function reenviarConfirmacion(correo) {
  await api('POST', '/confirmar/reenviar', { correo });
}

export async function salir() {
  clearTimeout(temporizador);
  try { await api('POST', '/salir'); } catch { /* sin conexión: la sesión caducará sola */ }
  guardarSesion(null);
  version = 0;
  avisar(nubeConfigurada ? 'sin-sesion' : 'desactivada');
}

/** Envía un correo con un enlace para poner una contraseña nueva. */
export async function recuperarContrasena(correo) {
  await api('POST', '/recuperar', { correo });
}

/**
 * Pone una contraseña nueva. Llegando desde el enlace del correo (nube.recuperando), abre sesión.
 * Con sesión: «actual» solo hace falta si la cuenta ya tenía contraseña.
 */
export async function cambiarContrasena(nueva, actual = '') {
  if (nube.recuperando) {
    const r = await api('POST', '/recuperar/nueva', { token: nube.recuperando, contrasena: nueva });
    nube.recuperando = null;
    await abrirSesion(r);
    return;
  }
  await api('POST', '/yo/contrasena', usuario?.contrasena ? { actual, nueva } : { nueva });
  guardarSesion({ ...sesion, usuario: { ...sesion.usuario, contrasena: true } });
  avisar(nube.estado);
}

/**
 * Pone (o quita, con null) la foto de perfil, ya reducida a una miniatura (js/cabecera.js la deja en
 * unos pocos KB). El servidor la vuelve a dibujar y la guarda con la cuenta.
 */
export async function cambiarFoto(foto) {
  const { usuario: u } = await api('PATCH', '/yo', { foto: foto ?? null });
  guardarSesion({ ...sesion, usuario: u });
  avisar(nube.estado);
}

/** Borra la copia de la nube de este curso (los datos del dispositivo se quedan). */
export async function borrarDatosNube(contrasena = '') {
  if (!sesion || !curso.id) return;
  clearTimeout(temporizador);
  await api('DELETE', `/progreso/${curso.id}`, { contrasena });
  version = 0;
}

// ---------------------------------------------------------------------------
// Enlaces de los correos: #/enlace/{confirmar|recuperar|correo}/{token}
// ---------------------------------------------------------------------------

/**
 * Atiende el enlace de un correo. Devuelve qué ha pasado: 'confirmada' (ya con sesión),
 * 'recuperar' (falta escribir la contraseña nueva) o 'correo' (el correo nuevo ya vale).
 */
export async function abrirEnlace(accion, token) {
  if (accion === 'confirmar') {
    await abrirSesion(await api('POST', '/confirmar', { token }));
    return 'confirmada';
  }
  if (accion === 'recuperar') {
    nube.recuperando = token;
    avisar(nube.estado);
    return 'recuperar';
  }
  if (accion === 'correo') {
    const { usuario: u } = await api('POST', '/yo/correo/confirmar', { token });
    if (sesion && sesion.usuario?.id === u.id) guardarSesion({ ...sesion, usuario: u });
    avisar(nube.estado);
    return 'correo';
  }
  throw new ErrorNube('enlace_invalido');
}
