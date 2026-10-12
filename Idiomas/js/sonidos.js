// Sonidos 8-bit generados en el momento (sin archivos de audio)
// y pronunciación: primero con los audios grabados (carpeta audio/), y si un texto no tiene audio,
// con la voz española del navegador, si existe.

import { ajuste } from './ajustes.js';
import { t } from './i18n.js';
import { clave } from './curso.js';
import { curso, ruta } from './curso.js';
import { AUDIOS_EN_LINEA } from './config.js';

let audio = null;

function contexto() {
  // El navegador no deja sonar nada hasta que la persona toca la página.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
  if (!audio) {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return null;
    audio = new Contexto();
  }
  if (audio.state === 'suspended') audio.resume();
  return audio;
}

/** Una nota: frecuencia (Hz), inicio y duración (segundos), forma de onda y volumen. */
function nota(ctx, frecuencia, inicio, duracion, forma = 'square', volumen = 0.05) {
  notaEn(ctx, ctx.destination, frecuencia, ctx.currentTime + inicio, duracion, forma, volumen);
}

/** Igual, pero con la hora exacta (t0) y la salida a la que se conecta. */
function notaEn(ctx, salida, frecuencia, t0, duracion, forma, volumen) {
  const osc = ctx.createOscillator();
  const ganancia = ctx.createGain();
  osc.type = forma;
  osc.frequency.value = frecuencia;
  ganancia.gain.setValueAtTime(volumen, t0);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  osc.connect(ganancia).connect(salida);
  osc.start(t0);
  osc.stop(t0 + duracion + 0.02);
}

const EFECTOS = {
  clic: ctx => nota(ctx, 660, 0, 0.05, 'square', 0.03),
  bien: ctx => [523, 659, 784, 1047].forEach((f, i) => nota(ctx, f, i * 0.07, 0.12)),
  mal: ctx => { nota(ctx, 330, 0, 0.12, 'triangle', 0.08); nota(ctx, 262, 0.12, 0.2, 'triangle', 0.08); },
  guardar: ctx => { nota(ctx, 880, 0, 0.06); nota(ctx, 1320, 0.06, 0.1); },
  quitar: ctx => { nota(ctx, 660, 0, 0.06); nota(ctx, 440, 0.06, 0.1); },
  pagina: ctx => nota(ctx, 440, 0, 0.04, 'triangle', 0.06),
  voltear: ctx => { nota(ctx, 392, 0, 0.05, 'triangle', 0.07); nota(ctx, 587, 0.05, 0.07, 'triangle', 0.07); },
  risa: ctx => [880, 1046, 880, 1175].forEach((f, i) => nota(ctx, f, i * 0.07, 0.06, 'triangle', 0.07)),
  fin: ctx => [523, 659, 784, 659, 784, 1047].forEach((f, i) => nota(ctx, f, i * 0.1, 0.16)),
  paso: ctx => [784, 988, 1175, 1568].forEach((f, i) => nota(ctx, f, i * 0.08, i === 3 ? 0.3 : 0.1)),
};

/** Acierto en el modo juego: el arpegio sube un semitono con cada acierto seguido. */
export function sonarAcierto(racha = 1) {
  if (!ajuste('efectos')) return;
  const ctx = contexto();
  if (!ctx) return;
  const sube = 2 ** (Math.min(racha - 1, 7) / 12);
  [523, 659, 784, 1047].forEach((f, i) => nota(ctx, f * sube, i * 0.07, 0.12));
}

// ---------------------------------------------------------------------------
// Música de fondo del modo juego: un bucle chiptune generado nota a nota
// ---------------------------------------------------------------------------

const CORCHEA = 0.21; // segundos
// Un acorde por compás (do, sol, la menor, fa; fa, sol, do, do).
const COMPASES = [
  [262, 330, 392], [196, 247, 294], [220, 262, 330], [175, 220, 262],
  [175, 220, 262], [196, 247, 294], [262, 330, 392], [262, 330, 392],
];
const ARPEGIOS = [[0, 1, 2, 1, 0, 1, 2, 1], [0, 2, 1, 2, 0, 2, 1, -1]]; // -1: silencio
let musica = null;

/** Enciende o apaga la música. Devuelve true si está sonando. */
export function ponerMusica(encender) {
  if (!encender) {
    if (musica) {
      clearInterval(musica.reloj);
      musica.salida.gain.setValueAtTime(0, musica.ctx.currentTime);
      const { salida } = musica;
      setTimeout(() => salida.disconnect(), 300);
      musica = null;
    }
    return false;
  }
  if (musica) return true;
  const ctx = contexto();
  if (!ctx) return false;
  const salida = ctx.createGain();
  salida.connect(ctx.destination);
  let proxima = ctx.currentTime + 0.1;
  let n = 0;
  const programar = () => {
    if (proxima < ctx.currentTime) proxima = ctx.currentTime + 0.1; // la pestaña estuvo dormida
    while (proxima < ctx.currentTime + 1.5) {
      const compas = Math.floor(n / 8) % COMPASES.length;
      const tiempo = n % 8;
      const acorde = COMPASES[compas];
      const i = ARPEGIOS[compas % 2][tiempo];
      if (i >= 0) notaEn(ctx, salida, acorde[i] * 2, proxima, CORCHEA * 0.9, 'square', 0.011);
      if (tiempo === 0 || tiempo === 4) notaEn(ctx, salida, acorde[0] / 2, proxima, CORCHEA * 3, 'triangle', 0.04);
      proxima += CORCHEA;
      n += 1;
    }
  };
  programar();
  musica = { ctx, salida, reloj: setInterval(programar, 400) };
  return true;
}

export function sonar(nombre) {
  if (!ajuste('efectos')) return;
  const ctx = contexto();
  if (ctx && EFECTOS[nombre]) EFECTOS[nombre](ctx);
}

/** Pitido corto de la voz de la tutora (como en los juegos retro). */
export function pitidoVoz() {
  if (!ajuste('vozTutora')) return;
  const ctx = contexto();
  if (ctx) nota(ctx, 740 + Math.random() * 160, 0, 0.035, 'square', 0.015);
}

// ---------------------------------------------------------------------------
// Voz española (speechSynthesis)
// ---------------------------------------------------------------------------

// --- Audios grabados -------------------------------------------------------
// Se generan con _audio/generar.py. Cada texto tiene un archivo cuyo nombre sale del propio texto (clave),
// así que la app no necesita una lista de frases: solo saber qué archivos existen (audio/indice.json).

const grabados = { f: new Set(), m: new Set() };
// Los audios van dentro de la app o, si config.js lo dice, se bajan de internet y se guardan en el dispositivo.
const EN_LINEA = Boolean(AUDIOS_EN_LINEA) && 'caches' in window;
const CARPETA_AUDIO = EN_LINEA ? `${AUDIOS_EN_LINEA.replace(/\/+$/, '')}/${curso.id}/` : ruta('audio/');
const almacen = EN_LINEA ? caches.open(`audios-${curso.id}`) : null;

/** Pide un archivo de audio en línea: primero a internet (y guarda copia); sin conexión, la copia guardada. */
async function bajar(url, { preferirCopia = false } = {}) {
  const copias = await almacen;
  if (preferirCopia) {
    const guardada = await copias.match(url);
    if (guardada) return guardada;
  }
  try {
    const respuesta = await fetch(url);
    if (respuesta.ok) { await copias.put(url, respuesta.clone()); return respuesta; }
  } catch { /* sin conexión */ }
  return (await copias.match(url)) ?? null;
}

const indiceListo = (EN_LINEA ? bajar(`${CARPETA_AUDIO}indice.json`) : fetch(`${CARPETA_AUDIO}indice.json`))
  .then(r => (r?.ok ? r.json() : null))
  .then(i => { if (i) { grabados.f = new Set(i.f); grabados.m = new Set(i.m); } })
  .catch(() => {});

/** Lo que se le da al reproductor: la dirección tal cual o, en línea, la copia guardada en el dispositivo. */
async function fuente(url) {
  if (!EN_LINEA) return url;
  const respuesta = await bajar(url, { preferirCopia: true });
  if (!respuesta) throw new Error('sin audio');
  return URL.createObjectURL(await respuesta.blob());
}

/**
 * Descarga por adelantado los audios de unas lecciones (solo si están en línea), para que suenen al momento
 * y sigan funcionando sin conexión. Se llama al abrir una lección, con esa y las siguientes.
 */
export async function precargarAudios(lecciones) {
  if (!EN_LINEA) return;
  await indiceListo;
  const urls = new Set();
  const apuntar = (texto, tono) => { const u = typeof texto === 'string' && grabacion(texto, tono); if (u) urls.add(u); };
  for (const leccion of lecciones) {
    for (const p of leccion.palabras?.values?.() ?? []) apuntar(p.es);
    for (const b of leccion.bloques ?? []) {
      apuntar(b.audio);
      for (const f of b.frases ?? []) { apuntar(f.es); apuntar(f.es, 0.75); }
    }
  }
  const pendientes = [...urls];
  const obrero = async () => { for (let u; (u = pendientes.pop());) await bajar(u, { preferirCopia: true }).catch(() => {}); };
  await Promise.all([obrero(), obrero(), obrero(), obrero()]);
}

/** Nombre del archivo de un texto: la misma cuenta que hace _audio/generar.py. */
function huella(texto) {
  const datos = new TextEncoder().encode(texto.normalize('NFC').trim().replace(/\s+/g, ' '));
  return [0x811c9dc5, 0x01000193].map(semilla => {
    let h = semilla;
    for (const b of datos) h = Math.imul(h ^ b, 0x01000193) >>> 0;
    return h.toString(16).padStart(8, '0');
  }).join('');
}

/** Dirección del audio de un texto, o null si no está grabado. Los tonos graves usan la segunda voz. */
function grabacion(texto, tono = 1) {
  const c = huella(texto);
  if (tono < 0.95 && grabados.m.has(c)) return `${CARPETA_AUDIO}${c}-m.mp3`;
  return grabados.f.has(c) ? `${CARPETA_AUDIO}${c}.mp3` : null;
}

let sonando = null; // { audio, cola, alAcabar }

function pararGrabacion() {
  if (!sonando) return;
  const { audio, alAcabar } = sonando;
  sonando = null;
  audio.onended = audio.onerror = null;
  audio.pause();
  alAcabar?.();
}

/** Reproduce una lista de { url, lento, alEmpezar } una detrás de otra. */
function reproducir(cola, alAcabar) {
  pararGrabacion();
  const audio = new Audio();
  sonando = { audio, alAcabar };
  const siguiente = () => {
    if (!sonando || sonando.audio !== audio) return;
    const paso = cola.shift();
    if (!paso) { sonando = null; alAcabar?.(); return; }
    fuente(paso.url).then(src => {
      if (!sonando || sonando.audio !== audio) return;
      if (audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
      audio.src = src;
      audio.playbackRate = ajuste('velocidadVoz') * (paso.lento ? 0.6 : 1);
      paso.alEmpezar?.();
      return audio.play();
    }).catch(siguiente);
  };
  audio.onended = audio.onerror = siguiente;
  siguiente();
}

/** Apunta los textos sin audio, para saber cuáles faltan por grabar. */
function apuntarFalta(texto) {
  try {
    const lista = JSON.parse(localStorage.getItem(clave('audio-faltan')) || '[]');
    if (!lista.includes(texto) && lista.length < 300) localStorage.setItem(clave('audio-faltan'), JSON.stringify([...lista, texto]));
  } catch { /* sin almacenamiento */ }
}

// --- Voz del navegador (reserva) --------------------------------------------

const voces = window.speechSynthesis;

/** Prefiere el español de España; si no hay, cualquier voz en español. */
function vozEspanola() {
  if (!voces) return null;
  const todas = voces.getVoices();
  return todas.find(v => v.lang === curso.voz)
    ?? todas.find(v => (v.lang ?? '').replace('_', '-').toLowerCase() === curso.voz.toLowerCase())
    ?? todas.find(v => v.lang?.toLowerCase().startsWith(curso.voz.slice(0, 2).toLowerCase()))
    ?? null;
}

// Algunos navegadores cargan la lista de voces más tarde.
export function prepararVoces() {
  return indiceListo.then(() => new Promise(resolver => {
    if (!voces) return resolver(null);
    if (voces.getVoices().length) return resolver(vozEspanola());
    voces.addEventListener('voiceschanged', () => resolver(vozEspanola()), { once: true });
    setTimeout(() => resolver(vozEspanola()), 1500);
  }));
}

export function hayVozEspanola() {
  return grabados.f.size > 0 || Boolean(vozEspanola());
}

export function nombreVozEspanola() {
  const voz = vozEspanola();
  if (voz) return `${voz.name} (${voz.lang})`;
  return grabados.f.size ? 'audio' : null;
}

function frase(texto, voz, { lento = false, tono = 1 } = {}) {
  const f = new SpeechSynthesisUtterance(texto);
  f.voice = voz;
  f.lang = voz.lang;
  f.rate = ajuste('velocidadVoz') * (lento ? 0.6 : 1);
  f.pitch = tono;
  return f;
}

/** Lee un texto en español. Devuelve false si no hay voz española. */
export function pronunciar(texto, opciones = {}) {
  const url = grabacion(texto, opciones.tono);
  if (url) {
    voces?.cancel();
    reproducir([{ url, lento: opciones.lento }]);
    return true;
  }
  apuntarFalta(texto);
  pararGrabacion();
  const voz = vozEspanola();
  if (!voz) return false;
  voces.cancel();
  voces.speak(frase(texto, voz, opciones));
  return true;
}

/**
 * Lee varias frases seguidas (un diálogo). Cada una: { texto, tono }.
 * alEmpezar(i) avisa de qué frase suena; alAcabar() cuando termina o se para.
 */
export function pronunciarSeguido(lista, { alEmpezar, alAcabar } = {}) {
  const urls = lista.map(l => grabacion(l.texto, l.tono ?? 1));
  if (urls.length && urls.every(Boolean)) {
    voces?.cancel();
    reproducir(urls.map((url, i) => ({ url, alEmpezar: () => alEmpezar?.(i) })), alAcabar);
    return true;
  }
  lista.forEach((l, i) => { if (!urls[i]) apuntarFalta(l.texto); });
  pararGrabacion();
  const voz = vozEspanola();
  if (!voz) return false;
  voces.cancel();
  lista.forEach((l, i) => {
    const f = frase(l.texto, voz, { tono: l.tono ?? 1 });
    f.onstart = () => alEmpezar?.(i);
    if (i === lista.length - 1) f.onend = () => alAcabar?.();
    voces.speak(f);
  });
  return true;
}

export function callar() {
  pararGrabacion();
  voces?.cancel();
}

/** Páginas de ayuda de la tutora cuando no hay voz española instalada. */
export function ayudaVoz() {
  return t('voz.ayuda');
}
