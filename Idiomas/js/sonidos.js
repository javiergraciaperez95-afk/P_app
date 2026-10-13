// Sonidos 8-bit generados en el momento (sin archivos de audio)
// y pronunciación con la voz del propio dispositivo o navegador. No hay audios grabados:
// si el dispositivo no tiene voz para el idioma del curso, la app queda en modo de solo lectura.

import { ajuste } from './ajustes.js';
import { t } from './i18n.js';
import { curso } from './curso.js';

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
// Voz del dispositivo (speechSynthesis)
// ---------------------------------------------------------------------------
// La app pregunta qué voces hay y se queda con la mejor del idioma del curso. El resultado se apunta en
// <html data-voz="si|no">; con eso el css enseña u oculta lo que lleva la clase «con-voz» (botones de escuchar)
// o «sin-voz» (el texto que los sustituye). La persona no ve ninguna comprobación.

const voces = window.speechSynthesis;
const IDIOMA = curso.voz.toLowerCase();            // «vi-vn»
const BASE = IDIOMA.split('-')[0];                 // «vi»
// El noruego aparece como «nb» o como «no» según el navegador.
const BASES = BASE === 'nb' || BASE === 'no' ? ['nb', 'no'] : [BASE];

let fallida = false;       // la voz ha dado error al usarla: se da por perdida hasta que se vuelva a abrir la app
let nativa = null;         // dentro de la APK: lo que responde el teléfono (true/false); en el navegador, null
let lista = false;         // ya se sabe si hay voz o no
let sinEmpezar = 0;        // veces seguidas que una lectura no ha llegado a sonar

const etiqueta = v => (v.lang ?? '').replace('_', '-').toLowerCase();

/** Las voces del idioma del curso, de mejor a peor. Sin conexión no cuentan las que la necesitan. */
function candidatas() {
  if (!voces) return [];
  const puntos = v => (etiqueta(v) === IDIOMA ? 8 : 0)
    + (/natural|neural/i.test(v.name) ? 4 : /google|siri|premium|enhanced/i.test(v.name) ? 2 : 0)
    + (v.localService === false ? 0 : 1);
  return voces.getVoices()
    .filter(v => BASES.includes(etiqueta(v).split('-')[0]))
    .filter(v => v.localService !== false || navigator.onLine !== false)
    .sort((a, b) => puntos(b) - puntos(a));
}

function vozDelCurso() {
  if (fallida || nativa === false) return null;
  // Dentro de la APK manda lo que dice el teléfono, aunque su lista de idiomas no nombre este tal cual.
  return candidatas()[0] ?? (nativa ? { name: 'Android', lang: curso.voz, localService: true } : null);
}

/** true si ahora mismo se puede leer en voz alta el idioma del curso. */
export function hayVoz() {
  return Boolean(vozDelCurso());
}

/** Vuelve a mirar si hay voz y lo apunta en la página. Avisa con «voz-cambiada» si ha cambiado. */
function revisarVoz() {
  const antes = document.documentElement.dataset.voz;
  const hay = hayVoz();
  if (!hay && !lista) return; // todavía cargando la lista: mejor no decir que no
  const ahora = hay ? 'si' : 'no';
  if (ahora === antes) return;
  document.documentElement.dataset.voz = ahora;
  if (!hay) voces?.cancel();
  window.dispatchEvent(new Event('voz-cambiada'));
}

/** Dentro de la APK el teléfono dice sin rodeos si puede leer este idioma. */
function preguntarAlTelefono() {
  if (!voces?.idiomaDisponible) return Promise.resolve();
  return voces.idiomaDisponible(curso.voz).then(ok => { nativa = Boolean(ok); }, () => {});
}

let preparada = null;

/** Mira qué voces hay. Algunos navegadores cargan la lista más tarde. Devuelve una promesa. */
export function prepararVoces() {
  preparada ??= new Promise(resolver => {
    const acabar = () => { lista = true; revisarVoz(); resolver(vozDelCurso()); };
    if (!voces) { acabar(); return; }
    voces.addEventListener('voiceschanged', revisarVoz);
    preguntarAlTelefono().then(() => {
      revisarVoz();
      if (hayVoz() || nativa === false) { acabar(); return; }
      voces.addEventListener('voiceschanged', acabar, { once: true });
      setTimeout(acabar, 1500);
    });
  });
  return preparada;
}

// Si se instala una voz, se va la conexión o se vuelve a la app, se mira otra vez.
window.addEventListener('online', revisarVoz);
window.addEventListener('offline', revisarVoz);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && lista) preguntarAlTelefono().then(revisarVoz);
});

export function nombreVoz() {
  const voz = vozDelCurso();
  return voz ? `${voz.name} (${voz.lang})` : null;
}

/** La voz no ha funcionado: se oculta el audio hasta que se vuelva a abrir la app. */
function darPorPerdida() {
  fallida = true;
  revisarVoz();
}

// Las voces de Google que trae Chrome en el ordenador se cortan si una lectura pasa de unos 14 segundos,
// así que con ellas los textos largos se leen por trozos.
const seCorta = voz => voz.localService === false && /^google/i.test(voz.name);
const LARGO = 160;

function trocear(texto) {
  if (texto.length <= LARGO) return [texto];
  const trozos = [];
  const partir = (parte, cortes) => {
    if (parte.length <= LARGO || !cortes.length) { trozos.push(parte); return; }
    let actual = '';
    for (const pieza of parte.split(cortes[0])) {
      if (actual && (actual + pieza).length > LARGO) { partir(actual.trim(), cortes.slice(1)); actual = ''; }
      actual += pieza;
    }
    if (actual.trim()) partir(actual.trim(), cortes.slice(1));
  };
  // Primero por frases, luego por comas y, si aun así es largo, por palabras.
  partir(texto, [/(?<=[.!?…。！？;:])\s*/u, /(?<=[,，、])\s*/u, /(?<=\s)/u]);
  return trozos.filter(Boolean);
}

let turno = 0; // cambia con cada lectura nueva, para no hacer caso a lo que quede de la anterior

/**
 * Pone en cola las lecturas de una lista de { texto, tono, lento }.
 * alEmpezar(i) avisa de cuál suena; alAcabar() cuando termina la última.
 */
function leer(lecturas, voz, { alEmpezar, alAcabar } = {}) {
  voces.cancel();
  turno += 1;
  const mio = turno;
  let haSonado = false;
  const error = e => {
    if (mio !== turno || ['interrupted', 'canceled'].includes(e?.error)) return;
    turno += 1;
    alAcabar?.();
    if (e?.error !== 'not-allowed') darPorPerdida();
  };
  lecturas.forEach((l, i) => {
    const trozos = seCorta(voz) ? trocear(l.texto) : [l.texto];
    trozos.forEach((trozo, k) => {
      const f = new SpeechSynthesisUtterance(trozo);
      f.voice = voz;
      f.lang = voz.lang;
      f.rate = ajuste('velocidadVoz') * (l.lento ? 0.6 : 1);
      f.pitch = l.tono ?? 1;
      f.onstart = () => { haSonado = true; sinEmpezar = 0; if (k === 0 && mio === turno) alEmpezar?.(i); };
      f.onerror = error;
      if (i === lecturas.length - 1 && k === trozos.length - 1) f.onend = () => { if (mio === turno) alAcabar?.(); };
      voces.speak(f);
    });
  });
  // Si no llega a sonar dos veces seguidas, la voz no funciona aunque el dispositivo diga que la tiene.
  setTimeout(() => {
    if (mio !== turno || haSonado) return;
    sinEmpezar += 1;
    if (sinEmpezar < 2) return;
    turno += 1;
    voces.cancel();
    alAcabar?.();
    darPorPerdida();
  }, 6000);
}

/** Lee un texto en el idioma del curso. Devuelve false si no hay voz. */
export function pronunciar(texto, opciones = {}) {
  const voz = vozDelCurso();
  if (!voz) return false;
  leer([{ texto, ...opciones }], voz);
  return true;
}

/**
 * Lee varias frases seguidas (un diálogo). Cada una: { texto, tono }.
 * alEmpezar(i) avisa de qué frase suena; alAcabar() cuando termina o se para.
 */
export function pronunciarSeguido(frases, avisos = {}) {
  const voz = vozDelCurso();
  if (!voz || !frases.length) return false;
  leer(frases, voz, avisos);
  return true;
}

export function callar() {
  turno += 1;
  voces?.cancel();
}

/** Dentro de la APK, abre la pantalla del teléfono donde se instalan las voces. Devuelve false en el navegador. */
export function abrirInstalacionDeVoces() {
  if (!voces?.instalarVoces) return false;
  voces.instalarVoces();
  return true;
}

/** Lo que explica la tutora cuando el dispositivo no tiene voz para el idioma del curso. */
export function ayudaVoz() {
  return t('voz.ayuda');
}
