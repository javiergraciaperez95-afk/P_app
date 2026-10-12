// Sonidos 8 bits generados al vuelo con Web Audio (sin archivos de audio).
// Los navegadores solo dejan sonar después de que el usuario toque algo, así que el
// motor de audio se crea en el primer clic o tecla (nunca antes) y hasta entonces hay silencio.

const CLAVE = 'vietlibro.sonido';
const VOLUMEN_GENERAL = 0.9;

let ctx = null;
let salida = null;
let activo = true;
try { activo = localStorage.getItem(CLAVE) !== 'no'; } catch { /* sin acceso */ }

function desbloquear() {
  if (!activo) return;
  try {
    if (!ctx) {
      const Contexto = window.AudioContext || window.webkitAudioContext;
      if (!Contexto) return;
      ctx = new Contexto();
      salida = ctx.createGain();
      salida.gain.value = VOLUMEN_GENERAL;
      salida.connect(ctx.destination);
    }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    // Un sonido vacío ayuda a algunos navegadores (Safari, móviles) a desbloquear el audio
    const vacio = ctx.createBufferSource();
    vacio.buffer = ctx.createBuffer(1, 1, 22050);
    vacio.connect(ctx.destination);
    vacio.start(0);
  } catch { /* sin audio */ }
}

for (const ev of ['pointerdown', 'mousedown', 'touchend', 'keydown', 'click']) {
  window.addEventListener(ev, desbloquear, { capture: true, passive: true });
}

function audio() {
  if (!activo || !ctx) return null;
  if (ctx.state !== 'running') { ctx.resume().catch(() => {}); return null; }
  return ctx;
}

function nota(freq, inicio, dur, { tipo = 'square', vol = 0.15, hasta = null } = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + 0.01 + inicio;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(salida);
  o.start(t);
  o.stop(t + dur + 0.03);
}

export const sonido = {
  /** «Voz» de la tutora mientras escribe: pitidos cortos y agudos. */
  voz() { nota(560 + Math.random() * 160, 0, 0.04, { vol: 0.07 }); },
  clic() { nota(880, 0, 0.04, { vol: 0.12 }); },
  pagina() { nota(660, 0, 0.05, { vol: 0.12 }); nota(990, 0.05, 0.06, { vol: 0.12 }); },
  globo() { nota(1320, 0, 0.03, { tipo: 'triangle', vol: 0.12 }); },
  reaccion() { nota(740, 0, 0.07, { vol: 0.14, hasta: 1100 }); nota(1180, 0.07, 0.08, { tipo: 'triangle', vol: 0.15 }); },
  acierto() { [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.07, 0.13, { vol: 0.16 })); },
  fallo() {
    nota(240, 0, 0.13, { tipo: 'sawtooth', vol: 0.13, hasta: 200 });
    nota(180, 0.13, 0.22, { tipo: 'sawtooth', vol: 0.13, hasta: 120 });
  },
  fanfarria() {
    const melodia = [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36], [784, 0.52], [1047, 0.64]];
    for (const [f, t] of melodia) nota(f, 0.35 + t, 0.17, { vol: 0.16 });
    nota(1568, 1.15, 0.45, { tipo: 'triangle', vol: 0.18 });
  },
};

export function sonidoActivo() { return activo; }

export function alternarSonido() {
  activo = !activo;
  try { localStorage.setItem(CLAVE, activo ? 'si' : 'no'); } catch { /* sin acceso */ }
  if (activo) { desbloquear(); setTimeout(() => sonido.acierto(), 60); }
  return activo;
}
