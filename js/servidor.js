// La cuenta y todo lo que va al servidor, con la misma forma para los dos motores:
//  · en local (localhost, 127.0.0.1, archivo) → Supabase (Auth con correo y contraseña + las funciones de
//    _herramientas/supabase-cuentas-v2.sql);
//  · en el hosting (paglot.eu) y en la app de Android → el servidor propio en PHP (api/, con su base de datos MySQL y
//    los correos por Resend).
// El resto de la app solo habla con este módulo: no sabe qué motor hay detrás.
// La sesión (token y lo que se sabe de la cuenta) se guarda en «paglot-sesion»; nunca la contraseña.
import { SUPABASE_URL, SUPABASE_CLAVE_PUBLICA } from './config.js';
import { idioma, t } from './i18n.js';

const enLocal = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname) && !window.Capacitor?.isNativePlatform?.();
export const motor = enLocal ? 'supabase' : 'php';
const API = window.Capacitor?.isNativePlatform?.() ? 'https://paglot.eu/api/' : `${location.origin}/api/`;
const CLAVE = 'paglot-sesion';
const ESPERA = 10000;

// ----- La sesión guardada -----
let sesion = null;
try { sesion = JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch { sesion = null; }
if (sesion && sesion.motor !== motor) sesion = null; // una sesión de local no vale en el hosting, ni al revés
const oyentes = new Set();
function guardarSesion(nueva) {
  sesion = nueva;
  try { if (nueva) localStorage.setItem(CLAVE, JSON.stringify(nueva)); else localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
  for (const fn of oyentes) fn(sesion?.usuario ?? null);
}
export const alCambiarSesion = fn => { oyentes.add(fn); return () => oyentes.delete(fn); };
/** La cuenta con sesión abierta (lo último que se supo de ella), o null. */
export const usuario = () => sesion?.usuario ?? null;
export const haySesion = () => Boolean(sesion?.token);

/** Un fallo con su código corto (credenciales, codigo, correo-usado, sin-verificar, sin-conexion…). */
function error(codigo, estado = 0) {
  const e = new Error(codigo);
  e.codigo = codigo;
  e.estado = estado;
  return e;
}

async function pedir(url, opciones) {
  let r;
  try {
    r = await fetch(url, { ...opciones, signal: AbortSignal.timeout?.(ESPERA) });
  } catch {
    throw error('sin-conexion');
  }
  const datos = await r.json().catch(() => ({}));
  return { r, datos };
}

// =====================================================================
// Motor PHP (api/index.php)
// =====================================================================
async function php(ruta, cuerpo = {}, { conSesion = true } = {}) {
  const { r, datos } = await pedir(`${API}?r=${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(conSesion && sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {}) },
    body: JSON.stringify({ idioma: idioma(), ...cuerpo }),
  });
  if (r.status === 401 && conSesion && sesion) guardarSesion(null);
  if (!r.ok) throw error(datos.error || 'servidor', r.status);
  return datos;
}
const conSesionPhp = datos => { guardarSesion({ motor, token: datos.token, usuario: datos.usuario }); return datos.usuario; };

const PHP = {
  registrar: d => php('cuenta/registro', d, { conSesion: false }),
  verificar: (correo, codigo) => php('cuenta/verificar', { correo, codigo }, { conSesion: false }).then(conSesionPhp),
  entrar: (correo, clave) => php('cuenta/entrar', { correo, clave }, { conSesion: false }).then(conSesionPhp),
  pedirCodigo: (correo, uso) => php('cuenta/pedir-codigo', { correo, uso }, { conSesion: false }),
  entrarConCodigo: (correo, codigo) => php('cuenta/entrar-codigo', { correo, codigo }, { conSesion: false }).then(conSesionPhp),
  cambiarClave: (correo, codigo, clave) => php('cuenta/cambiar-clave', { correo, codigo, clave }, { conSesion: false }).then(conSesionPhp),
  yo: () => php('cuenta/yo').then(d => d.usuario),
  ponerNombre: nombre => php('cuenta/nombre', { nombre }),
  salir: () => php('cuenta/salir').catch(() => {}),
  borrarCuenta: clave => php('cuenta/borrar', { clave }),
  leerProgreso: () => php('progreso/leer').then(d => d.cursos ?? {}),
  guardarProgreso: (curso, datos, cuando) => php('progreso/guardar', { curso, datos, cuando }),
  canjearRegalo: codigo => php('regalo/canjear', { codigo }).then(d => d.usuario),
  plazasFundadores: () => php('fundadores/plazas', {}, { conSesion: false }).then(d => d.restantes),
  familiaEstado: () => php('familia/estado').then(d => d.familia),
  familiaInvitar: correo => php('familia/invitar', { correo }),
  familiaUnirse: codigo => php('familia/unirse', { codigo }),
  familiaQuitar: numero => php('familia/quitar', { numero }),
  huchaEstado: zona => php('hucha/estado', { zona }),
  huchaGastar: (producto, zona) => php('hucha/gastar', { producto, zona }).then(d => d.usuario),
  pagar: (producto, zona, regalo = false) => php('pagos/checkout', { producto, zona, regalo }).then(d => d.url),
  contacto: datos => php('contacto/enviar', datos, { conSesion: false }),
};

// =====================================================================
// Motor Supabase (local)
// =====================================================================
const cabeceras = token => ({ apikey: SUPABASE_CLAVE_PUBLICA, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) });
const TRADUCIR = [
  [/invalid login|invalid credentials/i, 'credenciales'], [/not confirmed/i, 'sin-verificar'], [/already registered|already exists/i, 'correo-usado'],
  [/expired|invalid.*(otp|token)|token.*(invalid|expired)/i, 'codigo'], [/password.*(short|least|characters)/i, 'clave-corta'],
  [/rate limit|too many/i, 'demasiado-seguido'], [/regalo-no-existe/, 'regalo-no-existe'], [/regalo-usado/, 'regalo-usado'],
  [/protegida/, 'protegida'], [/sin-plan/, 'sin-plan'], [/familia-llena/, 'familia-llena'],
];
const codigoDe = (texto, estado) => (TRADUCIR.find(([re]) => re.test(texto))?.[1] ?? (estado >= 500 ? 'servidor' : 'datos'));

async function auth(ruta, cuerpo, token = null, metodo = 'POST') {
  const { r, datos } = await pedir(`${SUPABASE_URL}/auth/v1/${ruta}`, { method: metodo, headers: cabeceras(token), body: JSON.stringify(cuerpo) });
  if (!r.ok) throw error(codigoDe(`${datos.msg ?? ''} ${datos.error_description ?? ''} ${datos.message ?? ''} ${datos.error_code ?? ''}`, r.status), r.status);
  return datos;
}
async function tokenVigente() {
  if (!sesion?.token) throw error('sin-sesion', 401);
  if (sesion.caduca && Date.now() > sesion.caduca - 60000 && sesion.refresco) {
    try {
      const d = await auth('token?grant_type=refresh_token', { refresh_token: sesion.refresco });
      guardarSesion({ ...sesion, token: d.access_token, refresco: d.refresh_token, caduca: Date.now() + d.expires_in * 1000 });
    } catch (e) {
      if (e.estado) guardarSesion(null);
      throw e;
    }
  }
  return sesion.token;
}
async function rpc(funcion, datos = {}, conToken = true) {
  const { r, datos: res } = await pedir(`${SUPABASE_URL}/rest/v1/rpc/${funcion}`, {
    method: 'POST', headers: cabeceras(conToken ? await tokenVigente() : null), body: JSON.stringify(datos),
  });
  if (r.status === 401 && conToken) guardarSesion(null);
  if (!r.ok) throw error(codigoDe(`${res.message ?? ''} ${res.details ?? ''}`, r.status), r.status);
  return res;
}
async function conSesionSupabase(d) {
  guardarSesion({ motor, token: d.access_token, refresco: d.refresh_token, caduca: Date.now() + d.expires_in * 1000, usuario: null });
  // sin las funciones de supabase-cuentas-v2.sql (aún sin instalar), se entra igual con lo que trae la sesión: plan gratis
  let u;
  try { u = await rpc('paglot_yo'); } catch { u = { numero: null, correo: d.user?.email ?? '', nombre: d.user?.user_metadata?.nombre ?? '', plan: 'gratis', hasta: null, dev: false }; }
  guardarSesion({ ...sesion, usuario: u });
  return u;
}
const soloHosting = () => Promise.reject(error('solo-hosting'));

const SUPABASE = {
  registrar: ({ correo, clave, nombre }) => auth('signup', { email: correo, password: clave, data: { nombre: nombre ?? '' } }).then(() => ({ verificar: true })),
  verificar: (correo, codigo) => auth('verify', { type: 'signup', email: correo, token: String(codigo).replace(/\D/g, '') }).then(conSesionSupabase),
  async entrar(correo, clave) {
    try {
      return await conSesionSupabase(await auth('token?grant_type=password', { email: correo, password: clave }));
    } catch (e) {
      if (e.codigo === 'sin-verificar') await auth('resend', { type: 'signup', email: correo }).catch(() => {});
      throw e;
    }
  },
  pedirCodigo: (correo, uso) => (uso === 'clave' ? auth('recover', { email: correo }) : auth('otp', { email: correo, create_user: false })).catch(e => {
    if (e.codigo === 'demasiado-seguido') throw e; // si no, se responde igual exista o no la cuenta
    return {};
  }),
  entrarConCodigo: (correo, codigo) => auth('verify', { type: 'email', email: correo, token: String(codigo).replace(/\D/g, '') }).then(conSesionSupabase),
  async cambiarClave(correo, codigo, clave) {
    const d = await auth('verify', { type: 'recovery', email: correo, token: String(codigo).replace(/\D/g, '') });
    await auth('user', { password: clave }, d.access_token, 'PUT');
    return conSesionSupabase(d);
  },
  yo: () => rpc('paglot_yo'),
  ponerNombre: nombre => rpc('paglot_poner_nombre', { p_nombre: nombre }),
  salir: async () => { try { await auth('logout', {}, sesion?.token); } catch { /* da igual */ } },
  borrarCuenta: () => rpc('paglot_borrar_cuenta'),
  leerProgreso: () => rpc('paglot_progreso_leer'),
  guardarProgreso: (curso, datos, cuando) => rpc('paglot_progreso_guardar', { p_curso: curso, p_datos: datos, p_cuando: cuando }),
  canjearRegalo: codigo => rpc('paglot_canjear', { p_codigo: codigo }),
  plazasFundadores: () => rpc('paglot_fundadores_restantes', {}, false),
  familiaEstado: () => rpc('paglot_familia_estado').then(d => d.familia),
  familiaInvitar: soloHosting,
  familiaUnirse: soloHosting,
  familiaQuitar: numero => rpc('paglot_familia_quitar', { p_numero: numero }),
  huchaEstado: async () => ({ saldo: 0, anunciosHoy: 0, anunciosMax: 0, porAnuncio: 0, precios: null, local: true }),
  huchaGastar: soloHosting,
  pagar: soloHosting,
  contacto: async () => ({ ok: true, local: true }), // en local el formulario no manda nada
};

const M = motor === 'php' ? PHP : SUPABASE;

// ----- Lo que usa la app -----
export const registrar = d => M.registrar(d);
export const verificar = (correo, codigo) => M.verificar(correo, codigo);
export const entrar = (correo, clave) => M.entrar(correo, clave);
export const pedirCodigo = (correo, uso = 'entrar') => M.pedirCodigo(correo, uso);
export const entrarConCodigo = (correo, codigo) => M.entrarConCodigo(correo, codigo);
export const cambiarClave = (correo, codigo, clave) => M.cambiarClave(correo, codigo, clave);
export async function refrescarUsuario() {
  if (!haySesion()) return null;
  const u = await M.yo();
  guardarSesion({ ...sesion, usuario: u });
  return u;
}
export async function ponerNombre(nombre) {
  await M.ponerNombre(nombre);
  if (sesion?.usuario) guardarSesion({ ...sesion, usuario: { ...sesion.usuario, nombre } });
}
export async function salir() { await M.salir(); guardarSesion(null); }
export async function borrarCuenta(clave) { await M.borrarCuenta(clave); guardarSesion(null); }
export const leerProgreso = () => M.leerProgreso();
export const guardarProgreso = (curso, datos, cuando) => M.guardarProgreso(curso, datos, cuando);
export async function canjearRegalo(codigo) { const u = await M.canjearRegalo(codigo); if (u) guardarSesion({ ...sesion, usuario: u }); return u; }
export const plazasFundadores = () => M.plazasFundadores();
export const familiaEstado = () => M.familiaEstado();
export const familiaInvitar = correo => M.familiaInvitar(correo);
export const familiaUnirse = codigo => M.familiaUnirse(codigo);
export const familiaQuitar = numero => M.familiaQuitar(numero);
export const huchaEstado = zona => M.huchaEstado(zona);
export async function huchaGastar(producto, zona) { const u = await M.huchaGastar(producto, zona); if (u) guardarSesion({ ...sesion, usuario: u }); return u; }
export const pagar = (producto, zona, regalo) => M.pagar(producto, zona, regalo);
export const enviarContacto = datos => M.contacto(datos);

/** El fallo dicho con palabras (cuenta3.error.<código>), o uno general si no hay texto para ese código. */
export function textoDeError(e) {
  const clave = `cuenta3.error.${e?.codigo ?? 'servidor'}`;
  const texto = t(clave);
  return texto === clave ? t('cuenta3.error.servidor') : texto;
}
