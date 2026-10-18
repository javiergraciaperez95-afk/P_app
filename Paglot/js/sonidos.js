// Sonidos 8-bit generados en el momento (sin archivos de audio)
// y pronunciación con la voz del propio dispositivo o navegador. No hay audios grabados:
// si el dispositivo no tiene voz para el idioma del curso, la app queda en modo de solo lectura.

import { ajuste } from './ajustes.js';
import { t } from './i18n.js';
import { curso } from './curso.js';

let audio = null;

/** Avisa de lo que suena (aunque los efectos estén apagados): la tutora reacciona con el cuerpo. */
const avisar = (nombre, datos = {}) => window.dispatchEvent(new CustomEvent('paglot-suceso', { detail: { nombre, ...datos } }));

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

// Cada efecto sale un pelín más agudo o más grave que la vez anterior (± un cuarto de tono como mucho):
// así el mismo sonido repetido no cansa. Lo fija sonar() antes de cada efecto.
let afinado = 1;
const alAzar = lista => lista[Math.floor(Math.random() * lista.length)];

/** Una nota: frecuencia (Hz), inicio y duración (segundos), forma de onda y volumen. */
function nota(ctx, frecuencia, inicio, duracion, forma = 'square', volumen = 0.05) {
  notaEn(ctx, ctx.destination, frecuencia * afinado, ctx.currentTime + inicio, duracion, forma, volumen);
}

/** Una nota que se desliza de una frecuencia a otra (saltos, silbidos, gotas, rayos). */
function barrido(ctx, desde, hasta, inicio, duracion, forma = 'square', volumen = 0.04) {
  const t0 = ctx.currentTime + inicio;
  const osc = ctx.createOscillator();
  const ganancia = ctx.createGain();
  osc.type = forma;
  osc.frequency.setValueAtTime(desde * afinado, t0);
  osc.frequency.exponentialRampToValueAtTime(hasta * afinado, t0 + duracion);
  ganancia.gain.setValueAtTime(volumen, t0);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  osc.connect(ganancia).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duracion + 0.02);
}

// El «canal de ruido» de las consolas de 8 bits: papel, golpes, chispazos, tiza, cajones…
let blanco = null;
/** Ruido filtrado: tipo y frecuencia del filtro (y hacia dónde se mueve, si se mueve). */
function ruido(ctx, inicio, duracion, volumen = 0.05, { tipo = 'bandpass', f = 1200, hasta, q = 1 } = {}) {
  if (!blanco) {
    blanco = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const datos = blanco.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
  }
  const t0 = ctx.currentTime + inicio;
  const fuente = ctx.createBufferSource();
  fuente.buffer = blanco;
  fuente.loop = true;
  const filtro = ctx.createBiquadFilter();
  filtro.type = tipo;
  filtro.Q.value = q;
  filtro.frequency.setValueAtTime(f, t0);
  if (hasta) filtro.frequency.exponentialRampToValueAtTime(hasta, t0 + duracion);
  const ganancia = ctx.createGain();
  ganancia.gain.setValueAtTime(volumen, t0);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  fuente.connect(filtro).connect(ganancia).connect(ctx.destination);
  fuente.start(t0, Math.random() * 0.8);
  fuente.stop(t0 + duracion + 0.02);
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

// «Bip, bop, bup»: el clic no suena siempre igual; va cambiando de nota y a veces lleva una segunda notita.
const NOTAS_CLIC = [523, 587, 659, 784, 880, 988];
let ultimoClic = -1;
function clic(ctx) {
  let i = Math.floor(Math.random() * NOTAS_CLIC.length);
  if (i === ultimoClic) i = (i + 1) % NOTAS_CLIC.length;
  ultimoClic = i;
  nota(ctx, NOTAS_CLIC[i], 0, 0.05, 'square', 0.03);
  if (Math.random() < 0.4) nota(ctx, NOTAS_CLIC[i] * 1.5, 0.045, 0.05, 'square', 0.022);
}

// Pasar de pantalla: dos notas que suben, con el punto de partida cambiando.
const NOTAS_PAGINA = [392, 440, 494];
function pagina(ctx) {
  const f = NOTAS_PAGINA[Math.floor(Math.random() * NOTAS_PAGINA.length)];
  nota(ctx, f, 0, 0.045, 'triangle', 0.06);
  nota(ctx, f * 1.5, 0.045, 0.06, 'triangle', 0.05);
}

/** Una melodía corta: lista de frecuencias (0 = silencio) con el mismo paso entre notas. */
const melodia = (ctx, notas, paso, duracion, forma = 'square', volumen = 0.04) =>
  notas.forEach((f, i) => { if (f) nota(ctx, f, i * paso, duracion, forma, volumen); });

// Varias versiones de los sonidos que más se oyen: suena una al azar, nunca la misma dos veces seguidas.
const ultimas = {};
function una(nombre, versiones) {
  return (ctx, datos) => {
    let i = Math.floor(Math.random() * versiones.length);
    if (versiones.length > 1 && i === ultimas[nombre]) i = (i + 1) % versiones.length;
    ultimas[nombre] = i;
    versiones[i](ctx, datos);
  };
}

const EFECTOS = {
  clic,
  // Al pasar el ratón por encima: casi no se oye (una nota aguda, cortísima y muy bajita).
  roce: ctx => nota(ctx, 1320 + Math.random() * 240, 0, 0.03, 'sine', 0.007),
  abrir: una('abrir', [
    ctx => { nota(ctx, 523, 0, 0.04, 'square', 0.025); nota(ctx, 784, 0.04, 0.06, 'square', 0.025); },
    ctx => { nota(ctx, 587, 0, 0.04, 'square', 0.025); nota(ctx, 880, 0.04, 0.06, 'square', 0.025); },
    ctx => { ruido(ctx, 0, 0.05, 0.02, { f: 1800, hasta: 3600 }); nota(ctx, 659, 0.02, 0.07, 'triangle', 0.04); },
  ]),
  cerrar: una('cerrar', [
    ctx => { nota(ctx, 784, 0, 0.04, 'square', 0.025); nota(ctx, 523, 0.04, 0.06, 'square', 0.025); },
    ctx => { nota(ctx, 880, 0, 0.04, 'square', 0.025); nota(ctx, 587, 0.04, 0.06, 'square', 0.025); },
    ctx => { ruido(ctx, 0, 0.05, 0.02, { f: 3600, hasta: 1500 }); nota(ctx, 494, 0.02, 0.07, 'triangle', 0.04); },
  ]),
  interruptor: ctx => { nota(ctx, 330, 0, 0.03, 'square', 0.03); nota(ctx, 990, 0.035, 0.07, 'triangle', 0.05); },
  saludo: una('saludo', [
    ctx => melodia(ctx, [659, 880, 1175], 0.05, 0.07, 'triangle', 0.045),
    ctx => melodia(ctx, [784, 988, 784, 1175], 0.045, 0.06, 'triangle', 0.045),
    ctx => melodia(ctx, [587, 784, 0, 1175], 0.05, 0.08, 'triangle', 0.045),
    ctx => { barrido(ctx, 700, 1150, 0, 0.09, 'triangle', 0.04); nota(ctx, 1397, 0.1, 0.09, 'triangle', 0.04); },
  ]),
  bien: una('bien', [
    ctx => melodia(ctx, [523, 659, 784, 1047], 0.07, 0.12, 'square', 0.05),
    ctx => melodia(ctx, [587, 740, 880, 1175], 0.07, 0.12, 'square', 0.05),
    ctx => { melodia(ctx, [659, 784, 1047], 0.06, 0.1, 'square', 0.05); nota(ctx, 1568, 0.2, 0.18, 'triangle', 0.05); },
  ]),
  mal: una('mal', [
    ctx => { nota(ctx, 330, 0, 0.12, 'triangle', 0.08); nota(ctx, 262, 0.12, 0.2, 'triangle', 0.08); },
    ctx => { nota(ctx, 349, 0, 0.1, 'triangle', 0.08); nota(ctx, 330, 0.1, 0.1, 'triangle', 0.07); nota(ctx, 247, 0.2, 0.2, 'triangle', 0.08); },
    ctx => { barrido(ctx, 300, 180, 0, 0.28, 'triangle', 0.08); },
  ]),
  guardar: una('guardar', [
    ctx => { nota(ctx, 880, 0, 0.06); nota(ctx, 1320, 0.06, 0.1); },
    ctx => { nota(ctx, 988, 0, 0.06); nota(ctx, 1480, 0.06, 0.1); },
    ctx => { nota(ctx, 784, 0, 0.05); nota(ctx, 1047, 0.05, 0.05); nota(ctx, 1568, 0.1, 0.09, 'triangle', 0.05); },
  ]),
  quitar: una('quitar', [
    ctx => { nota(ctx, 660, 0, 0.06); nota(ctx, 440, 0.06, 0.1); },
    ctx => { nota(ctx, 587, 0, 0.06); nota(ctx, 392, 0.06, 0.1); },
    ctx => { barrido(ctx, 700, 300, 0, 0.14, 'square', 0.035); },
  ]),
  pagina,
  voltear: una('voltear', [
    ctx => { nota(ctx, 392, 0, 0.05, 'triangle', 0.07); nota(ctx, 587, 0.05, 0.07, 'triangle', 0.07); },
    ctx => { ruido(ctx, 0, 0.12, 0.03, { f: 900, hasta: 3200, q: 0.8 }); nota(ctx, 523, 0.06, 0.07, 'triangle', 0.05); },
    ctx => { nota(ctx, 440, 0, 0.05, 'triangle', 0.07); nota(ctx, 659, 0.05, 0.07, 'triangle', 0.07); },
  ]),
  risa: una('risa', [
    ctx => melodia(ctx, [880, 1046, 880, 1175], 0.07, 0.06, 'triangle', 0.07),
    ctx => melodia(ctx, [1175, 988, 1175, 988, 1319], 0.06, 0.05, 'triangle', 0.06),
    ctx => [0, 1, 2].forEach(i => barrido(ctx, 900 + i * 120, 1300 + i * 120, i * 0.08, 0.06, 'triangle', 0.06)),
  ]),
  fin: ctx => melodia(ctx, [523, 659, 784, 659, 784, 1047], 0.1, 0.16, 'square', 0.05),
  paso: una('paso', [
    ctx => [784, 988, 1175, 1568].forEach((f, i) => nota(ctx, f, i * 0.08, i === 3 ? 0.3 : 0.1)),
    ctx => [659, 880, 1047, 1319].forEach((f, i) => nota(ctx, f, i * 0.08, i === 3 ? 0.3 : 0.1)),
  ]),

  // ----- Pequeños gestos de la interfaz -----
  // Elegir una opción entre varias (pestañas, cajones, filtros): una nota de la escala pentatónica y su eco.
  elegir: ctx => {
    const f = alAzar([523, 587, 659, 784, 880]);
    nota(ctx, f, 0, 0.04, 'square', 0.028);
    nota(ctx, f * 2, 0.04, 0.05, 'triangle', 0.03);
  },
  marcar: ctx => { nota(ctx, 660, 0, 0.03, 'square', 0.03); nota(ctx, 1320, 0.03, 0.06, 'square', 0.025); },
  desmarcar: ctx => { nota(ctx, 990, 0, 0.03, 'square', 0.025); nota(ctx, 495, 0.03, 0.06, 'square', 0.025); },
  // Teclear: un golpecito de máquina de escribir, cada uno distinto. Muy flojito.
  tecla: ctx => {
    ruido(ctx, 0, 0.018, 0.035, { tipo: 'highpass', f: 2500 + Math.random() * 2500 });
    nota(ctx, 1800 + Math.random() * 900, 0, 0.012, 'square', 0.006);
  },
  borrar: ctx => { ruido(ctx, 0, 0.025, 0.03, { tipo: 'lowpass', f: 1400 }); nota(ctx, 440, 0, 0.02, 'square', 0.008); },
  espacio: ctx => ruido(ctx, 0, 0.03, 0.04, { tipo: 'lowpass', f: 900 }),
  // Una barra deslizante: la nota sube con el valor (de 0 a 1).
  deslizar: (ctx, { valor = 0.5 } = {}) => nota(ctx, 260 * 2 ** (valor * 2.2), 0, 0.03, 'square', 0.016),
  // Un aviso que no es un error: una nota que pregunta.
  duda: ctx => { nota(ctx, 523, 0, 0.06, 'triangle', 0.05); nota(ctx, 698, 0.08, 0.1, 'triangle', 0.05); },
  // Buscar: un barrido suave, como un radar.
  buscar: ctx => { barrido(ctx, 900, 1600, 0, 0.08, 'sine', 0.03); nota(ctx, 1760, 0.09, 0.05, 'sine', 0.02); },
  nada: ctx => { nota(ctx, 392, 0, 0.08, 'triangle', 0.05); nota(ctx, 370, 0.1, 0.12, 'triangle', 0.04); },

  // ----- Cosas de las escenas -----
  // Campana del colegio: un repique de dos notas que se va apagando.
  campana: ctx => {
    for (let i = 0; i < 8; i++) nota(ctx, i % 2 ? 1568 : 1760, i * 0.07, 0.09, 'triangle', 0.05 - i * 0.004);
    nota(ctx, 880, 0, 0.9, 'sine', 0.03);
  },
  // Timbre de la puerta de la tienda: din-don.
  timbre: ctx => { nota(ctx, 1319, 0, 0.5, 'sine', 0.06); nota(ctx, 1047, 0.28, 0.7, 'sine', 0.06); nota(ctx, 2637, 0, 0.15, 'sine', 0.015); },
  // Moneda: el «tlin» de toda la vida.
  moneda: ctx => { nota(ctx, 988, 0, 0.06, 'square', 0.04); nota(ctx, 1319, 0.06, 0.32, 'square', 0.035); },
  // Caja registradora: el cajón que sale y la campanita.
  caja: ctx => {
    ruido(ctx, 0, 0.09, 0.05, { tipo: 'lowpass', f: 1200, hasta: 400 });
    nota(ctx, 2093, 0.08, 0.3, 'triangle', 0.045);
    nota(ctx, 2637, 0.12, 0.42, 'triangle', 0.04);
  },
  // Sello de goma: golpe sordo sobre la mesa.
  sello: ctx => {
    barrido(ctx, 190, 55, 0, 0.14, 'sine', 0.16);
    ruido(ctx, 0, 0.07, 0.07, { tipo: 'lowpass', f: 700 });
    nota(ctx, 1200, 0.01, 0.015, 'square', 0.01);
  },
  // Papel: una hoja que se desliza o una ficha que sale.
  papel: una('papel', [
    ctx => ruido(ctx, 0, 0.16, 0.045, { f: 700, hasta: 3400, q: 0.7 }),
    ctx => ruido(ctx, 0, 0.13, 0.045, { f: 3200, hasta: 900, q: 0.7 }),
    ctx => { ruido(ctx, 0, 0.07, 0.04, { f: 1500, hasta: 3000 }); ruido(ctx, 0.08, 0.08, 0.035, { f: 2400, hasta: 1100 }); },
  ]),
  // Cajón de madera: se arrastra y hace tope.
  cajon: ctx => {
    ruido(ctx, 0, 0.2, 0.05, { tipo: 'lowpass', f: 500, hasta: 900, q: 2 });
    barrido(ctx, 160, 90, 0.19, 0.08, 'triangle', 0.12);
  },
  // Gota que cae en el matraz.
  gota: ctx => { barrido(ctx, 500, 1500, 0, 0.07, 'sine', 0.08); barrido(ctx, 900, 1900, 0.09, 0.05, 'sine', 0.03); },
  // Burbujas: tres o cuatro «blup» con alturas al azar.
  burbuja: ctx => {
    const cuantas = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < cuantas; i++) {
      const f = 350 + Math.random() * 500;
      barrido(ctx, f, f * 2.2, i * 0.06 + Math.random() * 0.02, 0.05, 'sine', 0.05);
    }
  },
  // Engranajes: un carraca de dientecitos.
  engranaje: ctx => {
    for (let i = 0; i < 6; i++) {
      ruido(ctx, i * 0.045, 0.015, 0.05, { tipo: 'highpass', f: 3000 });
      nota(ctx, i % 2 ? 330 : 294, i * 0.045, 0.02, 'square', 0.018);
    }
  },
  // Puerta: el chirrido de la bisagra y el pestillo.
  puerta: ctx => {
    barrido(ctx, 150, 230, 0, 0.3, 'sawtooth', 0.012);
    barrido(ctx, 300, 420, 0.05, 0.22, 'square', 0.006);
    ruido(ctx, 0.3, 0.03, 0.05, { tipo: 'highpass', f: 2000 });
  },
  // Llamar a la puerta: toc, toc.
  llamar: ctx => [0, 0.16].forEach(t0 => { barrido(ctx, 220, 110, t0, 0.07, 'triangle', 0.12); ruido(ctx, t0, 0.03, 0.05, { tipo: 'lowpass', f: 900 }); }),
  // Descorchar: «pop».
  pop: ctx => { barrido(ctx, 260, 1300, 0, 0.05, 'square', 0.04); ruido(ctx, 0, 0.04, 0.05, { f: 1800 }); },
  // Confeti: chispitas agudas que caen.
  confeti: ctx => {
    for (let i = 0; i < 7; i++) nota(ctx, alAzar([1568, 1760, 2093, 2349, 2637]), i * 0.045 + Math.random() * 0.02, 0.06, 'triangle', 0.03);
  },
  // Fuegos artificiales: el silbido que sube y el chisporroteo.
  fuegos: ctx => {
    barrido(ctx, 500, 1900, 0, 0.42, 'sine', 0.035);
    ruido(ctx, 0.44, 0.08, 0.09, { tipo: 'lowpass', f: 1600 });
    for (let i = 0; i < 9; i++) ruido(ctx, 0.5 + i * 0.05 + Math.random() * 0.03, 0.02, 0.04, { tipo: 'highpass', f: 4000 });
  },
  // Fanfarria pequeña para los momentos grandes.
  fanfarria: ctx => {
    melodia(ctx, [523, 523, 523, 698, 0, 880, 784, 1047], 0.09, 0.11, 'square', 0.04);
    melodia(ctx, [262, 0, 0, 349, 0, 440, 392, 523], 0.09, 0.14, 'triangle', 0.05);
  },
  // Tiza en la pizarra: dos trazos rasposos.
  tiza: ctx => {
    ruido(ctx, 0, 0.12, 0.03, { f: 3400, hasta: 4200, q: 6 });
    ruido(ctx, 0.15, 0.09, 0.03, { f: 4000, hasta: 3000, q: 6 });
  },
  // Buzón de metal: «clonc».
  buzon: ctx => {
    nota(ctx, 311, 0, 0.25, 'triangle', 0.07);
    nota(ctx, 467, 0, 0.18, 'triangle', 0.04);
    nota(ctx, 1244, 0, 0.08, 'square', 0.012);
    ruido(ctx, 0, 0.05, 0.05, { tipo: 'lowpass', f: 1500 });
  },
  // Algo que sale volando (el sobre, un avión de papel).
  volar: ctx => { ruido(ctx, 0, 0.5, 0.05, { f: 400, hasta: 2600, q: 1.5 }); barrido(ctx, 600, 1400, 0.1, 0.3, 'sine', 0.02); },
  // Flecha o carta lanzada: «fiu».
  flecha: ctx => { ruido(ctx, 0, 0.12, 0.04, { f: 2600, hasta: 700, q: 1.2 }); nota(ctx, 880, 0.11, 0.03, 'square', 0.02); },
  // Sentarse en una silla.
  silla: ctx => { barrido(ctx, 200, 120, 0, 0.08, 'triangle', 0.08); ruido(ctx, 0, 0.04, 0.03, { tipo: 'lowpass', f: 800 }); },
  // Brindis: dos copas.
  brindis: ctx => { nota(ctx, 2637, 0, 0.5, 'sine', 0.035); nota(ctx, 3520, 0.01, 0.35, 'sine', 0.02); nota(ctx, 2794, 0.06, 0.4, 'sine', 0.02); },
  // Pájaro: dos píos.
  pajaro: ctx => { barrido(ctx, 2300, 3300, 0, 0.06, 'sine', 0.025); barrido(ctx, 2500, 3600, 0.1, 0.05, 'sine', 0.022); },
  // Pasos sobre la madera.
  pasos: ctx => [0, 0.17, 0.34].forEach((t0, i) => ruido(ctx, t0, 0.04, 0.05 - i * 0.008, { tipo: 'lowpass', f: 500 + i * 60 })),
  // Silbato del árbitro (o de la vigilante del laboratorio).
  silbato: ctx => { for (let i = 0; i < 6; i++) nota(ctx, i % 2 ? 2100 : 2240, i * 0.035, 0.04, 'sine', 0.035); },
  // Aplausos del público: palmadas sueltas que se juntan y se apagan.
  aplausos: ctx => {
    for (let i = 0; i < 22; i++) {
      const t0 = Math.random() * 1.1;
      ruido(ctx, t0, 0.03, 0.05 * (1 - t0 / 1.4), { f: 1200 + Math.random() * 1400, q: 1.4 });
    }
  },
  // Tic-tac.
  reloj: ctx => { ruido(ctx, 0, 0.012, 0.05, { tipo: 'highpass', f: 3500 }); ruido(ctx, 0.25, 0.012, 0.04, { tipo: 'highpass', f: 2500 }); },
  // Zumbido del neón al encenderse.
  neon: ctx => {
    for (let i = 0; i < 4; i++) nota(ctx, 120, i * 0.06, 0.04, 'sawtooth', 0.01);
    nota(ctx, 240, 0.26, 0.3, 'sawtooth', 0.008);
  },

  // ----- Recreativa -----
  ficha: ctx => { ruido(ctx, 0, 0.03, 0.04, { tipo: 'highpass', f: 2500 }); nota(ctx, 1319, 0.04, 0.06, 'square', 0.035); nota(ctx, 1976, 0.1, 0.18, 'square', 0.03); },
  arcade: una('arcade', [
    // power-up: la escala que sube a toda prisa
    ctx => melodia(ctx, [392, 523, 659, 784, 1047, 1319, 1568], 0.03, 0.05, 'square', 0.03),
    // salto
    ctx => barrido(ctx, 280, 900, 0, 0.14, 'square', 0.035),
    // rayo láser
    ctx => barrido(ctx, 1600, 180, 0, 0.18, 'square', 0.03),
    // bonus: dos notas que repiten
    ctx => melodia(ctx, [1047, 1568, 1047, 1568], 0.05, 0.05, 'square', 0.03),
  ]),
  // Salto de personaje.
  salto: ctx => barrido(ctx, 280, 900, 0, 0.13, 'square', 0.035),
  // Ir completando algo por partes: cada parte suena una nota más alta (valor de 0 a 1).
  escala: (ctx, { valor = 0.5 } = {}) => {
    const f = 392 * 2 ** (Math.round(valor * 12) / 8);
    nota(ctx, f, 0, 0.06, 'square', 0.032);
    nota(ctx, f * 2, 0.05, 0.05, 'triangle', 0.025);
  },
  // Pulsar un botón de una máquina: «pew» o «blip».
  boton: una('boton', [
    ctx => barrido(ctx, 1200, 400, 0, 0.07, 'square', 0.025),
    ctx => { nota(ctx, 196, 0, 0.04, 'square', 0.04); nota(ctx, 392, 0.04, 0.04, 'square', 0.03); },
    ctx => barrido(ctx, 500, 1000, 0, 0.06, 'square', 0.025),
  ]),

  // ----- Tutoras -----
  // Al hacerles cosquillas: una risita aguda, distinta cada vez.
  cosquillas: una('cosquillas', [
    ctx => melodia(ctx, [1319, 1568, 1319, 1760], 0.055, 0.045, 'triangle', 0.05),
    ctx => [0, 1, 2, 3].forEach(i => barrido(ctx, 1100 + i * 90, 1600 + i * 90, i * 0.06, 0.045, 'triangle', 0.045)),
    ctx => melodia(ctx, [1568, 1397, 1568, 1397, 1760], 0.05, 0.04, 'triangle', 0.045),
  ]),
  // Sorpresa: una nota que sube de golpe.
  sorpresa: ctx => { barrido(ctx, 500, 1400, 0, 0.12, 'triangle', 0.06); nota(ctx, 1400, 0.13, 0.08, 'triangle', 0.04); },
};

/** Los efectos de fondo (roce, tecla, barra): no cuentan como «ya ha sonado algo» para el bip del clic. */
const DE_FONDO = new Set(['roce', 'tecla', 'borrar', 'espacio', 'deslizar']);

/** Acierto en el modo juego: el arpegio sube un semitono con cada acierto seguido. */
export function sonarAcierto(racha = 1) {
  avisar('bien', { racha });
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

let ultimoSonido = -Infinity;

/** Hace sonar un efecto por su nombre. Algunos aceptan datos (la barra deslizante: { valor } de 0 a 1). */
export function sonar(nombre, datos) {
  if (!DE_FONDO.has(nombre)) { avisar(nombre); ultimoSonido = performance.now(); }
  if (!ajuste('efectos')) return;
  const ctx = contexto();
  if (!ctx || !EFECTOS[nombre]) return;
  afinado = DE_FONDO.has(nombre) ? 1 : 2 ** ((Math.random() - 0.5) / 12);
  EFECTOS[nombre](ctx, datos);
  afinado = 1;
}

/** true si existe un efecto con ese nombre (para data-sonido="…"). */
export const haySonido = nombre => Object.hasOwn(EFECTOS, nombre);

/** Milisegundos desde el último efecto (sin contar el roce). Sirve para no poner dos sonidos al mismo toque. */
export function sonoHace() {
  return performance.now() - ultimoSonido;
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
    avisar('voz', { suena: false });
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
      f.onstart = () => { haSonado = true; sinEmpezar = 0; if (mio === turno) avisar('voz', { suena: true }); if (k === 0 && mio === turno) alEmpezar?.(i); };
      f.onerror = error;
      if (i === lecturas.length - 1 && k === trozos.length - 1) f.onend = () => { if (mio === turno) { avisar('voz', { suena: false }); alAcabar?.(); } };
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
  avisar('voz', { suena: false });
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
