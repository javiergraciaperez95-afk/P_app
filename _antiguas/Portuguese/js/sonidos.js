// Sonidos 8-bit generados en el momento (sin archivos de audio)
// y pronunciación con una voz en portugués del navegador, si existe.

import { ajuste } from './ajustes.js';
import { lista as listaDeTextos } from './i18n.js';

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
  const osc = ctx.createOscillator();
  const ganancia = ctx.createGain();
  osc.type = forma;
  osc.frequency.value = frecuencia;
  const t = ctx.currentTime + inicio;
  ganancia.gain.setValueAtTime(volumen, t);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  osc.connect(ganancia).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duracion + 0.02);
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
};

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
// Voz en portugués (speechSynthesis)
// ---------------------------------------------------------------------------

const voces = window.speechSynthesis;

/** Prefiere una voz de Portugal (pt-PT); si no hay, cualquier voz en portugués (p. ej. pt-BR). */
function vozPortuguesa() {
  if (!voces) return null;
  const todas = voces.getVoices();
  return todas.find(v => v.lang === 'pt-PT' || v.lang === 'pt_PT')
    ?? todas.find(v => v.lang?.toLowerCase().startsWith('pt'))
    ?? null;
}

// Algunos navegadores cargan la lista de voces más tarde.
export function prepararVoces() {
  return new Promise(resolver => {
    if (!voces) return resolver(null);
    if (voces.getVoices().length) return resolver(vozPortuguesa());
    voces.addEventListener('voiceschanged', () => resolver(vozPortuguesa()), { once: true });
    setTimeout(() => resolver(vozPortuguesa()), 1500);
  });
}

export function hayVozPortuguesa() {
  return Boolean(vozPortuguesa());
}

export function nombreVozPortuguesa() {
  const voz = vozPortuguesa();
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

/** Lee un texto en portugués. Devuelve false si no hay voz en portugués. */
export function pronunciar(texto, opciones = {}) {
  const voz = vozPortuguesa();
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
  const voz = vozPortuguesa();
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

/** Páginas de ayuda de la tutora cuando no hay voz en portugués (en el idioma de la interfaz). */
export function ayudaVoz() {
  return listaDeTextos('voice.help');
}
