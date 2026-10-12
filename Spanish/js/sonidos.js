// Sonidos 8-bit generados en el momento (sin archivos de audio)
// y pronunciación con la voz española del navegador, si existe.

import { ajuste } from './ajustes.js';
import { t } from './i18n.js';

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

const voces = window.speechSynthesis;

/** Prefiere el español de España; si no hay, cualquier voz en español. */
function vozEspanola() {
  if (!voces) return null;
  const todas = voces.getVoices();
  return todas.find(v => v.lang === 'es-ES')
    ?? todas.find(v => /^es[-_]ES/i.test(v.lang ?? ''))
    ?? todas.find(v => v.lang?.toLowerCase().startsWith('es'))
    ?? null;
}

// Algunos navegadores cargan la lista de voces más tarde.
export function prepararVoces() {
  return new Promise(resolver => {
    if (!voces) return resolver(null);
    if (voces.getVoices().length) return resolver(vozEspanola());
    voces.addEventListener('voiceschanged', () => resolver(vozEspanola()), { once: true });
    setTimeout(() => resolver(vozEspanola()), 1500);
  });
}

export function hayVozEspanola() {
  return Boolean(vozEspanola());
}

export function nombreVozEspanola() {
  const voz = vozEspanola();
  return voz ? `${voz.name} (${voz.lang})` : null;
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
  voces?.cancel();
}

/** Páginas de ayuda de la tutora cuando no hay voz española instalada. */
export function ayudaVoz() {
  return t('voz.ayuda');
}
