// La cuenta de Phuong App: un código de cuatro cifras. Al abrir la app se pide; el correcto abre la app y es también la
// llave con la que el progreso se guarda en Supabase (js/nube.js). Solo lo usa una persona: no hay registro ni correo.
// - El código se comprueba con su huella (config.js), así también funciona sin conexión.
// - Mientras la app sigue abierta no se vuelve a pedir (sessionStorage); con «Recordar en este móvil» tampoco al
//   volver a abrirla (localStorage). «Bloquear» (Perfil) lo olvida y vuelve a la pantalla del código.

import { HUELLA_CODIGO, CIFRAS_CODIGO } from './config.js';

const CLAVE_SESION = 'phuong-codigo-sesion';
const CLAVE_RECORDADO = 'phuong-codigo-recordado';
export const CIFRAS = CIFRAS_CODIGO;

const leer = (almacen, k) => { try { return almacen.getItem(k); } catch { return null; } };
const escribir = (almacen, k, v) => { try { if (v == null) almacen.removeItem(k); else almacen.setItem(k, v); } catch { /* sin almacenamiento */ } };

let codigo = leer(sessionStorage, CLAVE_SESION) ?? leer(localStorage, CLAVE_RECORDADO);
const oyentes = new Set();
export const alCambiarCuenta = fn => { oyentes.add(fn); return () => oyentes.delete(fn); };
const avisar = () => { for (const fn of oyentes) fn(codigo); };

/** El código con el que se ha entrado (para hablar con la nube), o null si la app está bloqueada. */
export const codigoActual = () => codigo;
export const estaDentro = () => Boolean(codigo);
export const recordado = () => Boolean(leer(localStorage, CLAVE_RECORDADO));

/** true si el código es el de la cuenta. */
export async function codigoCorrecto(intento) {
  if (!new RegExp(`^\\d{${CIFRAS}}$`).test(String(intento))) return false;
  return (await huella(`phuong-app:${intento}`)) === HUELLA_CODIGO;
}

/** Abre la app con ese código (ya comprobado). Con «recordar», el móvil no lo vuelve a pedir. */
export function entrar(nuevo, { recordar = recordado() } = {}) {
  codigo = String(nuevo);
  escribir(sessionStorage, CLAVE_SESION, codigo);
  escribir(localStorage, CLAVE_RECORDADO, recordar ? codigo : null);
  avisar();
}

/** Recordar (o dejar de recordar) el código en este móvil. */
export function recordar(si) {
  escribir(localStorage, CLAVE_RECORDADO, si && codigo ? codigo : null);
}

/** Cierra la app: vuelve a pedir el código (el progreso se queda en el móvil y en la nube). */
export function bloquear() {
  codigo = null;
  escribir(sessionStorage, CLAVE_SESION, null);
  escribir(localStorage, CLAVE_RECORDADO, null);
  avisar();
}

// ----- SHA-256 -----
// Con crypto.subtle si lo hay (https, localhost y la APK); si no, una versión en JavaScript (pequeña y lenta, pero
// solo se usa para cuatro cifras).
async function huella(texto) {
  const bytes = new TextEncoder().encode(texto);
  if (globalThis.crypto?.subtle) {
    try {
      const resumen = await crypto.subtle.digest('SHA-256', bytes);
      return [...new Uint8Array(resumen)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch { /* sigue con la de JavaScript */ }
  }
  return sha256(bytes);
}

function sha256(bytes) {
  const K = [];
  const H = [];
  const primo = n => { for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
  for (let n = 2, i = 0; i < 64; n++) {
    if (!primo(n)) continue;
    if (i < 8) H[i] = (Math.pow(n, 1 / 2) * 2 ** 32) | 0;
    K[i++] = (Math.pow(n, 1 / 3) * 2 ** 32) | 0;
  }
  const largo = bytes.length;
  const total = ((largo + 9 + 63) >> 6) << 6;
  const m = new Uint8Array(total);
  m.set(bytes);
  m[largo] = 0x80;
  const bits = largo * 8;
  for (let i = 0; i < 4; i++) m[total - 1 - i] = (bits >>> (8 * i)) & 0xff;
  const w = new Int32Array(64);
  const rot = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < total; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = (m[o + 4 * i] << 24) | (m[o + 4 * i + 1] << 16) | (m[o + 4 * i + 2] << 8) | m[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rot(w[i - 15], 7) ^ rot(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rot(w[i - 2], 17) ^ rot(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, h].forEach((x, i) => { H[i] = (H[i] + x) | 0; });
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
export const _sha256 = sha256; // (para probarla)
