// Cuentas y progreso en la nube (Supabase), sin librerías: todo con fetch.
// Ver notes/supabase.md. Esta web solo ESCRIBE en public.vi_progress;
// de public.progress (la web de chino) solo LEE el nombre y la foto como valor inicial.
// Sin sesión, la web funciona igual guardando en el navegador.

import * as progreso from './progreso.js';
import * as cuaderno from './cuaderno.js';
import * as perfil from './perfil.js';

const URL_BASE = 'https://iuniglsiqnfvnotmfgdo.supabase.co';
const CLAVE_PUBLICA = 'sb_publishable_dZDATuXD7GFWilF-SnWXyw_KVWjyX4P';
const TABLA = 'vi_progress';
const CLAVE_SESION = 'vietlibro.sesion';
const ESPERA_TRAS_CAMBIO = 4000; // ms

let sesion = leerSesion();
let relojRenovar = null;
let relojCambio = null;
let enCurso = null;
let otraPendiente = false;
let aplicandoNube = false;
export const estado = { fase: 'sin-sesion', mensaje: '', ultima: 0 }; // sin-sesion | sincronizando | ok | error

// ---------- Sesión ----------

function leerSesion() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SESION));
    if (s && s.access_token && s.refresh_token && s.user?.id) return s;
  } catch { /* nada */ }
  return null;
}

function guardarSesion(s) {
  sesion = s;
  try {
    if (s) localStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    else localStorage.removeItem(CLAVE_SESION);
  } catch { /* sin acceso */ }
  programarRenovacion();
  avisar();
}

/** Convierte la respuesta de Supabase en nuestra sesión. */
function sesionDe(d) {
  return {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expires_at: d.expires_at ? d.expires_at * 1000 : Date.now() + (d.expires_in || 3600) * 1000,
    user: { id: d.user?.id, email: d.user?.email },
  };
}

export function usuario() {
  return sesion ? { ...sesion.user } : null;
}

function programarRenovacion() {
  clearTimeout(relojRenovar);
  if (!sesion) return;
  const falta = sesion.expires_at - Date.now() - 2 * 60 * 1000; // 2 min antes de caducar
  relojRenovar = setTimeout(() => { renovar().catch(() => {}); }, Math.max(5000, falta));
}

async function renovar() {
  if (!sesion) return;
  const r = await pedir(`${URL_BASE}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: CLAVE_PUBLICA, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: sesion.refresh_token }),
  });
  if (!r.ok) {
    if (r.status === 400 || r.status === 401) {
      guardarSesion(null);
      ponerEstado('sin-sesion', 'La sesión caducó. Vuelve a entrar.');
    }
    throw new Error(await textoError(r));
  }
  guardarSesion(sesionDe(await r.json()));
}

async function asegurarToken() {
  if (sesion && sesion.expires_at - Date.now() < 60 * 1000) await renovar();
}

// ---------- Peticiones ----------

/** fetch, pero sin internet da un mensaje claro en vez de «Failed to fetch». */
async function pedir(url, opciones) {
  try {
    return await fetch(url, opciones);
  } catch {
    throw new Error('No hay conexión con la nube (¿sin internet?). Lo intentaré de nuevo más tarde.');
  }
}

function tokenActual() {
  if (!sesion) throw new Error('La sesión ha caducado. Vuelve a entrar en tu cuenta.');
  return sesion.access_token;
}

async function auth(ruta, cuerpo, metodo = 'POST', conToken = false) {
  const headers = { apikey: CLAVE_PUBLICA, 'Content-Type': 'application/json' };
  if (conToken) {
    await asegurarToken();
    headers.Authorization = `Bearer ${tokenActual()}`;
  }
  const r = await pedir(`${URL_BASE}/auth/v1/${ruta}`, { method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  if (!r.ok) throw new Error(await textoError(r));
  const texto = await r.text();
  return texto ? JSON.parse(texto) : {};
}

/** Petición a la base de datos con el token; ante un 401 renueva y reintenta una vez. */
async function datos(ruta, { metodo = 'GET', cuerpo, prefer } = {}) {
  await asegurarToken();
  const hacer = () => pedir(`${URL_BASE}/rest/v1/${ruta}`, {
    method: metodo,
    headers: {
      apikey: CLAVE_PUBLICA,
      Authorization: `Bearer ${tokenActual()}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  let r = await hacer();
  if (r.status === 401) { await renovar(); r = await hacer(); }
  if (!r.ok) throw new Error(await textoError(r));
  // El upsert responde sin cuerpo (201, 204 o incluso 200 vacío): nunca leerlo como JSON a ciegas
  const texto = await r.text();
  return texto ? JSON.parse(texto) : null;
}

/** Mensajes de error de Supabase, traducidos y sin jerga. */
async function textoError(r) {
  let m = '';
  let codigo = '';
  try {
    const d = await r.json();
    m = d.msg || d.error_description || d.message || d.error || '';
    codigo = d.error_code || d.code || '';
  } catch { /* sin cuerpo */ }
  const t = m.toLowerCase();
  if (codigo === 'same_password' || t.includes('same password') || t.includes('different from the old')) {
    return 'La nueva contraseña debe ser distinta de la anterior.';
  }
  if (codigo === 'weak_password' || t.includes('password should')) return textoContrasenaDebil(m);
  if (r.status === 429 || t.includes('rate limit')) return 'Demasiados intentos o correos en poco tiempo. Espera un rato y vuelve a probar.';
  if (t.includes('invalid login')) return 'Email o contraseña incorrectos.';
  if (t.includes('email not confirmed')) return 'Aún no has confirmado tu email. Busca el correo de confirmación (mira también en spam).';
  if (t.includes('already registered') || t.includes('already been registered')) return 'Ya existe una cuenta con ese email. Prueba a entrar.';
  if (t.includes('unable to validate email') || t.includes('invalid format') || t.includes('email address') && t.includes('invalid')) return 'Ese email no parece válido.';
  if ((t.includes('relation') && t.includes('does not exist')) || t.includes('schema cache')) return 'Falta crear la tabla en Supabase (ver notes/supabase.sql).';
  if (r.status >= 500) return 'El servidor de la nube ha fallado. Prueba más tarde.';
  return m || `Error de conexión (código ${r.status}).`;
}

/** Explica qué le falta a la contraseña según lo que exige Supabase (longitud y tipos de caracteres). */
function textoContrasenaDebil(m) {
  const partes = [];
  const largo = /at least (\d+) characters/i.exec(m);
  if (largo) partes.push(`tener al menos ${largo[1]} caracteres`);
  const tipos = /one character of each:\s*(.+)$/i.exec(m);
  if (tipos) {
    const grupos = tipos[1].split(/,\s*/).map((g) => g.trim());
    const nombres = [];
    if (grupos.some((g) => g.includes('abc'))) nombres.push('una minúscula');
    if (grupos.some((g) => g.includes('ABC'))) nombres.push('una mayúscula');
    if (grupos.some((g) => g.includes('0123'))) nombres.push('un número');
    if (grupos.some((g) => /[!@#$%^&*]/.test(g))) nombres.push('un símbolo (como ! @ # $ %)');
    if (nombres.length) partes.push(`llevar al menos ${nombres.join(', ')}`);
  }
  if (/pwned|leaked|breach/i.test(m)) partes.push('no ser una contraseña conocida o filtrada en internet');
  if (!partes.length) return `La contraseña no es lo bastante segura. (Mensaje de Supabase: ${m})`;
  return `La contraseña debe ${partes.join(' y ')}.`;
}

function redireccion() {
  return location.origin + location.pathname;
}

// ---------- Cuentas ----------

export async function crearCuenta(email, contrasena) {
  const d = await auth(`signup?redirect_to=${encodeURIComponent(redireccion())}`, { email, password: contrasena });
  // Con confirmación activada, si el email ya existe Supabase responde «bien» pero sin identidades.
  if (d.user?.identities?.length === 0 || d.identities?.length === 0) {
    throw new Error('Ya existe una cuenta con ese email. Prueba a entrar.');
  }
  if (d.access_token) { guardarSesion(sesionDe(d)); await sincronizar(); }
  return d;
}

export async function entrar(email, contrasena) {
  const d = await auth('token?grant_type=password', { email, password: contrasena });
  guardarSesion(sesionDe(d));
  await sincronizar();
}

export async function salir() {
  try { if (sesion) await auth('logout', null, 'POST', true); } catch { /* da igual: cerramos aquí */ }
  guardarSesion(null);
  ponerEstado('sin-sesion', '');
}

export async function recuperarContrasena(email) {
  await auth(`recover?redirect_to=${encodeURIComponent(redireccion())}`, { email });
}

export async function cambiarContrasena(nueva) {
  await auth('user', { password: nueva }, 'PUT', true);
}

/**
 * Al arrancar: captura lo que traen los enlaces del correo en la dirección
 * (#access_token=…&type=signup|recovery, o #error=…).
 * Devuelve { tipo: 'signup'|'recovery'|'error', mensaje } o null.
 */
export async function capturarEnlace() {
  const h = location.hash.slice(1);
  if (!h.includes('access_token=') && !h.includes('error=')) return null;
  const p = new URLSearchParams(h);
  history.replaceState(null, '', location.pathname + location.search + '#/perfil');

  if (p.get('error')) {
    const caducado = (p.get('error_code') || '').includes('expired') || (p.get('error_description') || '').toLowerCase().includes('expired');
    return {
      tipo: 'error',
      mensaje: caducado
        ? 'El enlace del correo ha caducado o ya se usó. Pide otro desde aquí.'
        : `El enlace del correo no funcionó: ${p.get('error_description') || p.get('error')}`,
    };
  }

  const datosEnlace = {
    access_token: p.get('access_token'),
    refresh_token: p.get('refresh_token'),
    expires_at: Number(p.get('expires_at')) || 0,
    expires_in: Number(p.get('expires_in')) || 3600,
  };
  try {
    const r = await pedir(`${URL_BASE}/auth/v1/user`, {
      headers: { apikey: CLAVE_PUBLICA, Authorization: `Bearer ${datosEnlace.access_token}` },
    });
    if (!r.ok) throw new Error(await textoError(r));
    datosEnlace.user = await r.json();
    guardarSesion(sesionDe(datosEnlace));
  } catch (e) {
    return { tipo: 'error', mensaje: `No se pudo abrir la sesión del enlace: ${e.message}` };
  }
  return { tipo: p.get('type') === 'recovery' ? 'recovery' : 'signup', mensaje: '' };
}

// ---------- Sincronización ----------

/** Lee la fila de la nube, la une con lo de este navegador y guarda el resultado en los dos sitios. */
export function sincronizar() {
  if (!sesion) return Promise.resolve();
  if (enCurso) { otraPendiente = true; return enCurso; }
  enCurso = (async () => {
    ponerEstado('sincronizando', 'Sincronizando…');
    try {
      const id = sesion.user.id;
      const filas = await datos(`${TABLA}?select=name,photo,progress,notebook,updated_at&user_id=eq.${id}`);
      const nube = filas?.[0] || null;

      const antes = JSON.stringify([progreso.exportar(), cuaderno.exportar(), perfil.perfil()]);
      const prog = progreso.unir(progreso.exportar(), nube?.progress);
      const cuad = cuaderno.unir(cuaderno.exportar(), nube?.notebook);
      let perf = unirPerfil(perfil.perfil(), nube);
      if (!perf.nombre && !perf.foto) perf = { ...perf, ...(await perfilDeChino(id)) };

      aplicandoNube = true;
      try {
        progreso.importar(prog);
        cuaderno.importar(cuad);
        perfil.importar(perf);
      } finally {
        aplicandoNube = false;
      }

      await datos(TABLA, {
        metodo: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        cuerpo: {
          user_id: id,
          name: perf.nombre || null,
          photo: perf.foto || null,
          progress: { ...prog, perfilMod: perf.mod },
          notebook: cuad,
          updated_at: new Date().toISOString(),
        },
      });
      ponerEstado('ok', '');
      estado.ultima = Date.now();
      if (JSON.stringify([progreso.exportar(), cuaderno.exportar(), perfil.perfil()]) !== antes) {
        document.dispatchEvent(new CustomEvent('nube-datos-nuevos'));
      }
    } catch (e) {
      if (!sesion) ponerEstado('sin-sesion', 'La sesión ha caducado. Vuelve a entrar en tu cuenta.');
      else ponerEstado('error', e.message || 'No se pudo sincronizar.');
    }
  })();
  return enCurso.finally(() => {
    enCurso = null;
    if (otraPendiente) { otraPendiente = false; sincronizar(); }
  });
}

function unirPerfil(local, nube) {
  if (!nube) return local;
  const modNube = Number(nube.progress?.perfilMod) || Date.parse(nube.updated_at) || 0;
  if (local.mod >= modNube) return local;
  return { nombre: nube.name || '', foto: nube.photo || '', mod: modNube };
}

/** Nombre y foto de la web de chino (solo lectura), si existen. */
async function perfilDeChino(id) {
  try {
    const filas = await datos(`progress?select=name,photo&user_id=eq.${id}`);
    const f = filas?.[0];
    if (f && (f.name || f.photo)) return { nombre: f.name || '', foto: f.photo || '', mod: Date.now() };
  } catch { /* no pasa nada */ }
  return {};
}

function ponerEstado(fase, mensaje) {
  estado.fase = fase;
  estado.mensaje = mensaje;
  avisar();
}

function avisar() {
  document.dispatchEvent(new CustomEvent('nube-estado'));
}

/** Arranca: sincroniza al abrir y unos segundos después de cada cambio. */
export function iniciarNube() {
  programarRenovacion();
  const alCambiar = () => {
    if (!sesion || aplicandoNube) return;
    clearTimeout(relojCambio);
    relojCambio = setTimeout(sincronizar, ESPERA_TRAS_CAMBIO);
  };
  for (const ev of ['progreso-cambio', 'cuaderno-cambio', 'perfil-cambio']) document.addEventListener(ev, alCambiar);
  // Al volver a la pestaña, por si se avanzó en otro dispositivo
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sincronizar(); });
  if (sesion) sincronizar();
}
