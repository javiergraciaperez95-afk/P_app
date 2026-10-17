// Dibujo de las tutoras en pixel art, hecho por código (48 × 60 píxeles).
// Todas comparten el mismo personaje base (cabeza enorme, ojos grandes, cuerpo pequeño, un libro entre las manos);
// lo propio de cada una (pelo, ropa, adornos, colores, su bebida y su gesto propio) está en cursos/<id>/tutora.js.
// Se pinta con rectángulos de 1 píxel y un pase automático de contorno.
// Además de las caras (EXPRESIONES) mueven brazos, cabeza y piernas: las ANIMACIONES, que se piden con sprite.gesto().

const ANCHO = 48;
const ALTO = 60;
const OY = 4; // filas libres por encima de la cabeza (moños, gorros): se dibuja con y desde −4

const BASE = {
  o: '#24160f', skin: '#f9dcc4', skinS: '#e6b294', blush: '#f29a93',
  hair: '#5e3a28', hairL: '#7d5038', hairS: '#46291b', hairD: '#2b170e',
  eyeG: '#8a5a2e', eyeD: '#3f2412', eyeL: '#c8935a', white: '#ffffff',
  book: '#9c3540', bookD: '#6b2029', bookL: '#c4505b', page: '#f5edd4', pageS: '#d8ccad',
  gold: '#f3c94b', goldD: '#c9971f',
  shirt: '#f4f6f5', shirtS: '#c4cfca',
  mouth: '#b9474f', mouthD: '#7c2432', tongue: '#f08a8f',
  shoe: '#4a2c1d', shoeL: '#6e4430',
  drop: '#8fdcff', star: '#fff6a8',
  // la bebida del final del día (cada tutora pone la de su país) y el lápiz
  vaso: '#ffffff', liquido: '#8a5a35', pajita: '#e05a7a', lapiz: '#f2c14e',
};
const C = {}; // la paleta de la tutora que se está dibujando (BASE + sus colores)

let g;
let dy = 0; // la cabeza «respira» (sube y baja) y además asiente o se inclina
let dx = 0; // y se mueve de lado al decir que no
let manga = null; // los colores de la manga, que guarda mangas() para poder dibujar el brazo en otra postura
const clear = () => { g = Array.from({ length: ALTO }, () => Array(ANCHO).fill(null)); };
const R = (x, y, w, h, c) => {
  for (let j = y + OY; j < y + OY + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < ANCHO && j >= 0 && j < ALTO) g[j][i] = c;
};
const P = (x, y, c) => R(x, y, 1, 1, c);
// Lo mismo, a los dos lados (d desplaza los dos hacia el mismo lado: el vaivén del pelo).
const B = (x, y, w, h, c, d = 0) => { R(x + d, y, w, h, c); R(ANCHO - x - w + d, y, w, h, c); };
// Lo mismo, para lo que va en la cabeza.
const Rh = (x, y, w, h, c) => R(x + dx, y + dy, w, h, c);
const Ph = (x, y, c) => Rh(x, y, 1, 1, c);
const Bh = (x, y, w, h, c, d = 0) => B(x, y + dy, w, h, c, d + dx);

function outline() {
  const add = [];
  for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) {
    if (g[y][x]) continue;
    if ((y > 0 && g[y - 1][x]) || (y < ALTO - 1 && g[y + 1][x]) || (x > 0 && g[y][x - 1]) || (x < ANCHO - 1 && g[y][x + 1])) add.push([x, y]);
  }
  add.forEach(([x, y]) => { g[y][x] = C.o; });
}

const zapatos = () => { R(18, 53, 5, 2, C.shoe); R(25, 53, 5, 2, C.shoe); P(19, 53, C.shoeL); P(26, 53, C.shoeL); };
/** Piernas con medias o calcetines: `desde` es la fila donde empiezan (50 = medias enteras). */
const medias = (color, desde = 50) => {
  R(19, 50, 3, 3, C.skin); R(26, 50, 3, 3, C.skin); P(19, 50, C.skinS); P(26, 50, C.skinS);
  R(19, desde, 3, 53 - desde, color); R(26, desde, 3, 53 - desde, color);
  zapatos();
};
/** Las mangas en reposo (bajando hacia el libro). Sus colores sirven también para el brazo en cualquier otra postura. */
const mangas = (c, cL, puno) => {
  manga = { c, puno: puno ?? c, corta: false };
  B(13, 37, 3, 6, c); P(13, 37, cL); P(34, 37, cL); if (puno) B(13, 40, 3, 1, puno);
};
/** Manga corta: el antebrazo es piel. */
const mangaCorta = () => { if (manga) manga.corta = true; B(13, 41, 3, 2, C.skin); };
const torso = (c, cS) => { R(16, 35, 16, 1, c); R(15, 36, 18, 9, c); if (cS) B(16, 38, 1, 6, cS); };
const falda = (c, cD) => { R(14, 45, 20, 5, c); for (let x = 16; x < 33; x += 3) R(x, 45, 1, 5, cD); };

const AYUDAS = { R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos };

// Cada expresión de la app es una combinación de ojos, cejas, boca y efecto.
const EXPRESIONES = {
  normal: { eyes: 'open', brow: 'smug', mouth: 'smirk' },
  pensando: { eyes: 'open', brow: 'flat', mouth: 'smirk' },
  contenta: { eyes: 'happy', brow: 'flat', mouth: 'smile', fx: 'sparkle' },
  apurada: { eyes: 'wide', brow: 'worry', mouth: 'flat', fx: 'sweat' },
  sorprendida: { eyes: 'wide', brow: 'flat', mouth: 'open' },
  confundida: { eyes: 'open', brow: 'worry', mouth: 'flat' },
  // reacciones al tocarla
  cosquillas: { eyes: 'happy', brow: 'flat', mouth: 'open', fx: 'sparkle' },
  agobiada: { eyes: 'blink', brow: 'worry', mouth: 'flat', fx: 'sweat' },
};

export const EXPRESIONES_VALIDAS = ['normal', 'pensando', 'contenta', 'apurada', 'sorprendida', 'confundida'];

// Movimiento de todo el cuerpo al empezar una expresión: salto (píxeles hacia arriba) o temblor (hacia los lados).
const REBOTES = {
  contenta: { duracion: 420, salto: p => (p < 1 ? Math.round(Math.sin(p * Math.PI) * 3) : 0) },
  cosquillas: { duracion: 700, salto: p => (p < 1 ? Math.round(Math.abs(Math.sin(p * Math.PI * 2)) * 3) : 0) },
  sorprendida: { duracion: 220, salto: p => (p < 1 ? 2 : 0) },
  agobiada: { duracion: 1400, temblor: p => (p < 1 ? [1, 0, -1, 0][Math.floor(p * 28) % 4] : 0) },
  apurada: { duracion: 500, temblor: p => (p < 1 ? [1, 0, -1, 0][Math.floor(p * 10) % 4] : 0) },
};

// ---------------------------------------------------------------------------
// Brazos
// ---------------------------------------------------------------------------

// Cada postura es la lista de piezas del brazo de la izquierda del dibujo; el de la derecha es su reflejo.
// Pieza: [tipo, x, y, ancho, alto, sigueALaCabeza]. Tipos: m manga, a antebrazo (piel con manga corta), p puño,
// s mano, f dedo, lapiz y vaso (la bebida). «libro» es el brazo en reposo, sujetando el libro.
const arriba = [['m', 12, 34, 3, 4], ['a', 10, 30, 3, 4], ['p', 9, 28, 4, 2], ['s', 9, 25, 3, 3]];
const cara = [['m', 13, 35, 3, 3], ['a', 13, 30, 3, 5], ['p', 13, 29, 3, 1]];
const BRAZOS = {
  arriba,
  arribaFuera: [['m', 12, 34, 3, 4], ['a', 9, 31, 3, 3], ['p', 7, 29, 4, 2], ['s', 6, 26, 3, 3]],
  alto: [['m', 11, 33, 3, 5], ['a', 8, 28, 3, 5], ['p', 7, 26, 4, 2], ['s', 6, 23, 3, 3]],
  senalar: [...arriba, ['f', 9, 21, 1, 4]],
  senalarCorto: [...arriba, ['f', 9, 22, 1, 3]],
  brindis: [...arriba, ['vaso', 8, 19, 5, 6]],
  lado: [['m', 11, 37, 3, 3], ['a', 7, 37, 4, 3], ['p', 6, 37, 1, 3], ['s', 3, 37, 3, 3]],
  pecho: [['m', 13, 37, 3, 4], ['a', 15, 39, 4, 3], ['p', 19, 39, 1, 3], ['s', 20, 38, 3, 3]],
  pechoJunto: [['m', 13, 37, 3, 4], ['a', 15, 38, 5, 3], ['p', 20, 38, 1, 3], ['s', 21, 37, 3, 3]],
  manoPecho: [['m', 13, 37, 3, 3], ['a', 15, 39, 4, 3], ['s', 19, 36, 4, 4]],
  rezo: [['m', 13, 36, 3, 3], ['a', 15, 34, 6, 3], ['s', 21, 30, 3, 5]],
  cadera: [['m', 12, 37, 3, 3], ['a', 11, 40, 3, 3], ['s', 13, 43, 3, 2]],
  cruzadoArriba: [['m', 13, 37, 3, 3], ['a', 15, 39, 13, 2], ['s', 28, 39, 2, 2]],
  cruzadoAbajo: [['m', 13, 37, 3, 5], ['a', 15, 41, 13, 2], ['s', 28, 41, 2, 2]],
  pulgar: [['m', 13, 36, 3, 4], ['p', 13, 35, 3, 1], ['s', 12, 32, 4, 3], ['f', 13, 29, 2, 3]],
  barbilla: [['m', 13, 36, 3, 3], ['a', 14, 33, 3, 3], ['p', 15, 32, 3, 1], ['s', 16, 29, 3, 3, 1]],
  boca: [['m', 13, 36, 3, 3], ['a', 15, 33, 3, 3], ['p', 17, 32, 3, 1], ['s', 20, 28, 5, 3, 1]],
  nariz: [['m', 13, 36, 3, 3], ['a', 15, 32, 3, 4], ['p', 17, 31, 3, 1], ['s', 19, 27, 3, 4, 1], ['f', 21, 23, 1, 4, 1]],
  cabeza: [['m', 12, 34, 3, 4], ['a', 9, 29, 3, 5], ['p', 8, 27, 4, 2], ['s', 9, 23, 3, 4, 1]],
  cabeza2: [['m', 12, 34, 3, 4], ['a', 9, 29, 3, 5], ['p', 8, 27, 4, 2], ['s', 9, 22, 3, 4, 1]],
  oreja: [['m', 12, 34, 3, 4], ['a', 9, 30, 3, 4], ['p', 8, 29, 4, 1], ['s', 8, 25, 3, 4, 1]],
  cara: [...cara, ['s', 13, 19, 7, 8, 1]],
  caraEspia: [...cara, ['s', 13, 24, 7, 5, 1], ['f', 14, 22, 1, 2, 1], ['f', 16, 22, 1, 2, 1], ['f', 18, 22, 1, 2, 1]],
  escribir: [['m', 13, 37, 3, 3], ['a', 14, 40, 4, 3], ['s', 18, 40, 3, 3], ['lapiz', 20, 36, 1, 5]],
  escribir2: [['m', 13, 37, 3, 3], ['a', 14, 40, 7, 3], ['s', 21, 40, 3, 3], ['lapiz', 23, 36, 1, 5]],
  beber: [['m', 13, 36, 3, 3], ['a', 14, 33, 3, 3], ['p', 15, 32, 3, 1], ['s', 16, 29, 3, 3, 1], ['vaso', 18, 25, 5, 6, 1]],
  beberBaja: [['m', 13, 37, 3, 3], ['a', 14, 36, 3, 3], ['s', 15, 33, 3, 3], ['vaso', 17, 30, 5, 6]],
  // para el botón de la portada: empujar con la palma de lado, señalar hacia abajo e invitar con la mano
  empuje: [['m', 11, 37, 3, 3], ['a', 7, 37, 4, 3], ['p', 6, 37, 1, 3], ['s', 3, 35, 3, 5]],
  empuje2: [['m', 11, 36, 3, 3], ['a', 6, 36, 5, 3], ['p', 5, 36, 1, 3], ['s', 2, 34, 3, 5]],
  abajo: [['m', 12, 37, 3, 3], ['a', 10, 40, 3, 3], ['p', 9, 43, 3, 1], ['s', 8, 44, 3, 3], ['f', 8, 47, 1, 2]],
  abajo2: [['m', 12, 37, 3, 3], ['a', 9, 39, 4, 3], ['p', 8, 42, 3, 1], ['s', 7, 43, 3, 3], ['f', 7, 46, 1, 3]],
  invitar: [['m', 12, 37, 3, 3], ['a', 9, 39, 3, 3], ['p', 8, 41, 3, 1], ['s', 4, 41, 4, 3]],
};

function brazo(postura, derecho) {
  const piezas = BRAZOS[postura];
  if (!piezas) return;
  const m = manga ?? { c: C.shirt, puno: C.shirtS, corta: false };
  const color = { m: m.c, a: m.corta ? C.skin : m.c, p: m.corta ? C.skin : m.puno, s: C.skin, f: C.skin, lapiz: C.lapiz, vaso: C.vaso };
  const sitio = ([, x, y, w, h, enCabeza]) => [(derecho ? ANCHO - x - w : x) + (enCabeza ? dx : 0), y + (enCabeza ? dy : 0), w, h];
  // Primero el contorno de todas las piezas y luego el relleno: así la mano se distingue sobre la cara.
  for (const pieza of piezas) {
    const [x, y, w, h] = sitio(pieza);
    R(x - 1, y - 1, w + 2, h + 2, C.o);
    if (pieza[0] === 'vaso' && C.conPajita) R(x + (derecho ? 0 : w - 3), y - 4, 3, 4, C.o);
  }
  for (const pieza of piezas) {
    const [x, y, w, h] = sitio(pieza);
    const tipo = pieza[0];
    R(x, y, w, h, color[tipo]);
    if (tipo === 's') P(derecho ? x + w - 1 : x, y + h - 1, C.skinS);
    if (tipo === 's' && w >= 6) for (let i = 1; i < w - 1; i += 2) R(x + i, y, 1, 3, C.skinS); // dedos de la mano abierta
    if (tipo === 'lapiz') P(x, y + h - 1, C.o);
    if (tipo === 'vaso') {
      R(x, y, w, 2, C.liquido);
      if (C.conPajita) R(x + (derecho ? 1 : w - 2), y - 3, 1, 3, C.pajita);
      else P(derecho ? x : x + w - 1, y + 2, C.white); // brillo de la taza
    }
  }
}

// Las mangas en reposo ocupan estas columnas: si el brazo se mueve, ahí vuelve a verse lo que había detrás.
const HUECO_MANGA = { izq: [13, 14], der: [33, 34] };

function libro(estado) {
  if (estado === 'nada') return;
  R(16, 38, 16, 7, C.o);
  if (estado === 'cerrado') {
    R(17, 39, 14, 5, C.book); R(17, 39, 14, 1, C.bookL); R(17, 39, 2, 5, C.bookD); R(19, 43, 12, 1, C.page);
    R(23, 40, 3, 1, C.gold); R(22, 41, 5, 1, C.gold); R(23, 42, 3, 1, C.gold); P(24, 41, C.goldD);
    return;
  }
  // abierto, con renglones; «pagina» es el momento en que pasa una hoja
  R(17, 39, 6, 5, C.page); R(25, 39, 6, 5, C.page); R(23, 39, 2, 5, C.bookD);
  for (const y of [40, 42]) { R(18, y, 4, 1, C.pageS); R(26, y, 4, 1, C.pageS); }
  if (estado === 'pagina') { R(23, 35, 5, 9, C.o); R(24, 36, 3, 7, C.page); R(24, 38, 3, 1, C.pageS); }
}

/** Levanta una pierna (de la fila 50 a la 54) unos píxeles: para correr, bailar o mover el pie. */
function levantarPierna(desde, hasta, px) {
  if (!px) return;
  const celdas = [];
  for (let y = 50 + OY; y < 55 + OY; y++) for (let x = desde; x <= hasta; x++) {
    if (g[y][x]) { celdas.push([x, y, g[y][x]]); g[y][x] = null; }
  }
  for (const [x, y, c] of celdas) g[y - px][x] = c;
}

// ---------------------------------------------------------------------------
// Efectos (van sin el contorno automático; los signos llevan el suyo)
// ---------------------------------------------------------------------------

const GLIFOS = {
  pregunta: ['.##.', '#..#', '..#.', '.#..', '....', '.#..'],
  exclamacion: ['#', '#', '#', '.', '#'],
  z: ['###', '..#', '.#.', '###'],
  nota: ['.##', '.#.', '.#.', '##.', '##.'],
  corazon: ['.#.#.', '#####', '#####', '.###.', '..#..'],
};
function glifo(nombre, x, y, color) {
  const filas = GLIFOS[nombre];
  const lleno = (i, j) => filas[j]?.[i] === '#';
  // contorno: las casillas vacías (también la del borde de alrededor) que tocan una llena
  for (let j = -1; j <= filas.length; j++) for (let i = -1; i <= filas[0].length; i++) {
    if (!lleno(i, j) && (lleno(i - 1, j) || lleno(i + 1, j) || lleno(i, j - 1) || lleno(i, j + 1))) P(x + i, y + j, C.o);
  }
  filas.forEach((fila, j) => [...fila].forEach((c, i) => { if (c === '#') P(x + i, y + j, color); }));
}
const CONFETI = ['#ff6b8b', '#ffd23f', '#4fc3f7', '#7ed957', '#b388ff'];
const estrella = (x, y, big) => { P(x, y, C.star); if (big) { P(x - 1, y, C.star); P(x + 1, y, C.star); P(x, y - 1, C.star); P(x, y + 1, C.star); } };
const ciclo = (t, ms, desfase = 0) => ((t / ms + desfase) % 1 + 1) % 1;

function efectos(s) {
  const t = s.t ?? 0;
  if (s.fx === 'sparkle') { estrella(5, 10, s.star); estrella(43, 6, !s.star); estrella(43, 30, s.star); estrella(5, 36, !s.star); }
  if (s.fx === 'sweat') { P(42, 9 + dy, C.drop); R(41, 10 + dy, 3, 2, C.drop); P(42, 12 + dy, C.drop); P(41, 11 + dy, C.white); }
  if (s.fx === 'pregunta') glifo('pregunta', 39, -3 + (Math.floor(t / 300) % 2), '#ffb43a');
  if (s.fx === 'exclamacion') glifo('exclamacion', 41, -3, '#ff5a5a');
  if (s.fx === 'zzz') for (let i = 0; i < 3; i++) {
    const f = ciclo(t, 2400, i / 3);
    glifo('z', 36 + Math.round(f * 6), 8 - Math.round(f * 11), '#a9c1ff');
  }
  if (s.fx === 'notas') for (let i = 0; i < 2; i++) {
    const f = ciclo(t, 1600, i / 2);
    glifo('nota', i ? 4 : 40, 12 - Math.round(f * 12), i ? '#7ed0ff' : '#ff7fb0');
  }
  if (s.fx === 'corazon') {
    const f = ciclo(t, 1400);
    glifo('corazon', 39 - Math.round(f * 2), 28 - Math.round(f * 18), '#ff5a7a');
  }
  if (s.fx === 'confeti') for (let i = 0; i < 18; i++) {
    const x = (i * 29 + 7) % 46 + 1;
    const y = Math.floor((t * 0.035 + i * 11) % 64) - 4;
    R(x + (Math.floor(t / 200 + i) % 2), y, i % 3 ? 1 : 2, 1, CONFETI[i % CONFETI.length]);
  }
  if (s.fx === 'mareo') for (let i = 0; i < 3; i++) {
    const a = t / 170 + i * 2.09;
    estrella(24 + Math.round(Math.cos(a) * 15), 1 + Math.round(Math.sin(a) * 2) + dy, Math.sin(a) > 0);
  }
}

// ---------------------------------------------------------------------------
// Animaciones del cuerpo
// ---------------------------------------------------------------------------

const alterna = (t, ms, a, b) => (Math.floor(t / ms) % 2 ? b : a);
const suave = p => 1 - (1 - Math.min(1, Math.max(0, p))) ** 3;
const subeYBaja = (p, desde, hasta) => (p < desde || p > hasta ? 0 : Math.sin(((p - desde) / (hasta - desde)) * Math.PI));

// Cada animación dura «duracion» ms y en cada fotograma devuelve lo que cambia: brazos (brazoI, brazoD), libro,
// cara (eyes, brow, mouth, mira, guino), cabeza (hdx, hdy), cuerpo (salto, temblor, giro), piernas (piernaI, piernaD) y fx.
// «prioridad»: una animación no corta a otra más importante (celebrar, caerse, asomarse).
const ANIMACIONES = {
  saludar: { duracion: 2000, cuadro: (p, t) => ({ brazoD: p < 0.9 ? alterna(t, 220, 'arriba', 'arribaFuera') : 'arriba', mouth: 'smile' }) },
  aplaudir: { duracion: 1500, cuadro: (p, t) => { const b = alterna(t, 170, 'pecho', 'pechoJunto'); return { brazoI: b, brazoD: b, eyes: 'happy', mouth: 'open', fx: 'sparkle' }; } },
  // la tutora está a la derecha del cuadro de diálogo: señala hacia la izquierda y arriba, donde está el ejercicio
  senalar: { duracion: 2600, cuadro: (p, t) => ({ brazoI: alterna(t, 300, 'senalar', 'senalarCorto'), mira: { x: -1, y: -1 }, brow: 'flat', mouth: 'smirk' }) },
  pensar: { duracion: 2600, cuadro: () => ({ brazoI: 'barbilla', mira: { x: 1, y: -1 }, brow: 'flat', mouth: 'flat' }) },
  rascarse: { duracion: 2400, cuadro: (p, t) => ({ brazoI: alterna(t, 160, 'cabeza', 'cabeza2'), fx: 'pregunta', brow: 'worry', mouth: 'flat', mira: { x: 0, y: -1 } }) },
  celebrar: {
    duracion: 2600, prioridad: 2,
    cuadro: p => {
      const agachada = p < 0.12 || (p > 0.45 && p < 0.52);
      const salto = Math.round(subeYBaja(p, 0.12, 0.45) * 6 + subeYBaja(p, 0.52, 0.8) * 3);
      return { brazoI: agachada ? 'pecho' : 'alto', brazoD: agachada ? 'pecho' : 'alto', salto: agachada ? -1 : salto, eyes: 'happy', mouth: 'open', brow: 'flat', fx: 'confeti' };
    },
  },
  pulgar: { duracion: 1800, cuadro: () => ({ brazoD: 'pulgar', guino: true, eyes: 'open', mouth: 'smile', brow: 'flat', fx: 'sparkle' }) },
  guino: { duracion: 1100, cuadro: () => ({ guino: true, eyes: 'open', mouth: 'smile', brow: 'flat', hdx: 1 }) },
  asentir: { duracion: 900, cuadro: p => ({ hdy: [0, 2, 0, 2, 0][Math.floor(p * 5)] ?? 0, mouth: 'smile', brow: 'flat' }) },
  negar: { duracion: 900, cuadro: p => ({ hdx: [0, -1, 1, -1, 1, 0][Math.floor(p * 6)] ?? 0, brow: 'worry', mouth: 'flat' }) },
  // mientras espera
  bostezo: { duracion: 2200, cuadro: p => ({ brazoD: p < 0.8 ? 'boca' : 'libro', mouth: 'bostezo', eyes: p < 0.8 ? 'blink' : 'open', brow: 'worry' }) },
  estirarse: { duracion: 2400, cuadro: p => ({ brazoI: 'alto', brazoD: 'alto', eyes: 'blink', mouth: 'open', brow: 'flat', salto: p > 0.2 && p < 0.8 ? 1 : 0 }) },
  mirarLados: { duracion: 2600, cuadro: p => { const x = p < 0.3 ? -1 : p > 0.35 && p < 0.7 ? 1 : 0; return { mira: { x, y: 0 }, hdx: x }; } },
  moverPie: { duracion: 2000, cuadro: (p, t) => ({ piernaD: alterna(t, 250, 0, 1) }) },
  dormir: { duracion: Infinity, cuadro: () => ({ eyes: 'blink', hdy: 1, fx: 'zzz', mouth: 'flat', brow: 'flat' }) },
  respingo: { duracion: 800, prioridad: 2, cuadro: p => ({ eyes: 'wide', mouth: 'open', brow: 'flat', salto: p < 0.4 ? 4 : 0, fx: 'exclamacion' }) },
  // al tocarla
  verguenza: { duracion: 1800, cuadro: (p, t) => ({ brazoI: 'cara', brazoD: 'cara', hdy: 1, temblor: alterna(t, 140, 0, 1), mouth: 'smile' }) },
  vueltecita: { duracion: 1000, cuadro: p => ({ giro: Math.cos(p * Math.PI * 2), salto: Math.round(Math.sin(p * Math.PI) * 2), eyes: 'happy', mouth: 'open', brow: 'flat' }) },
  caerse: {
    duracion: 3200, prioridad: 2,
    cuadro: (p, t) => {
      if (p < 0.1) return { salto: -Math.round((p / 0.1) * 6), eyes: 'wide', mouth: 'open', brow: 'worry', brazoI: 'alto', brazoD: 'alto' };
      if (p < 0.7) return { salto: -6, temblor: p < 0.2 ? alterna(t, 60, -1, 1) : 0, eyes: 'mareo', mouth: 'open', brow: 'worry', fx: 'mareo' };
      if (p < 0.85) return { salto: -6 + Math.round(((p - 0.7) / 0.15) * 6), eyes: 'blink', mouth: 'flat', brow: 'worry', brazoI: 'cadera' };
      return { salto: Math.round(subeYBaja(p, 0.85, 1) * 2), eyes: 'happy', mouth: 'smile', brow: 'flat' };
    },
  },
  // lo que pasa en la app
  escuchar: { duracion: Infinity, cuadro: () => ({ brazoI: 'oreja', fx: 'notas', mira: { x: -1, y: 0 }, mouth: 'smirk', brow: 'flat' }) },
  escribir: { duracion: 2400, cuadro: (p, t) => ({ libro: 'abierto', brazoD: alterna(t, 200, 'escribir', 'escribir2'), mira: { x: 0, y: 1 }, mouth: 'smirk', brow: 'flat' }) },
  hojear: { duracion: 2200, cuadro: (p, t) => ({ libro: alterna(t, 350, 'abierto', 'pagina'), mira: { x: 0, y: 1 }, brow: 'flat' }) },
  // entra desde el borde derecho, que es donde está ella
  asomarse: { duracion: 1300, prioridad: 2, cuadro: p => ({ temblor: Math.round((1 - suave(p / 0.7)) * 40), mira: { x: -1, y: 0 }, eyes: 'open', brow: 'flat' }) },
  cruzarBrazos: { duracion: 2600, cuadro: () => ({ brazoI: 'cruzadoArriba', brazoD: 'cruzadoAbajo', eyes: 'open', brow: 'smug', mouth: 'smirk' }) },
  taparseOjos: { duracion: 2600, cuadro: p => { const b = p < 0.55 ? 'cara' : 'caraEspia'; return { brazoI: b, brazoD: b, eyes: 'wide', brow: 'worry', mouth: 'flat' }; } },
  correr: { duracion: 1600, cuadro: (p, t) => ({ piernaI: alterna(t, 120, 2, 0), piernaD: alterna(t, 120, 0, 2), salto: alterna(t, 120, 1, 0), eyes: 'wide', brow: 'worry', mouth: 'flat', fx: 'sweat' }) },
  brindar: {
    duracion: 3400,
    cuadro: p => {
      if (p < 0.3) return { brazoD: 'brindis', eyes: 'happy', mouth: 'open', brow: 'flat', fx: 'sparkle' };
      if (p < 0.8) return { brazoD: 'beber', eyes: 'blink', mouth: 'flat', brow: 'flat' };
      return { brazoD: 'beberBaja', eyes: 'happy', mouth: 'smile', brow: 'flat' };
    },
  },
  // el gesto propio de cada tutora (lo elige su tutora.js con «firma»)
  reverencia: { duracion: 2000, cuadro: p => ({ hdy: Math.round(subeYBaja(p, 0, 1) * 3 + 0.4), eyes: p > 0.15 && p < 0.85 ? 'blink' : 'open', mouth: 'smile', brow: 'flat' }) },
  gafas: { duracion: 1600, cuadro: () => ({ brazoD: 'nariz', eyes: 'open', brow: 'smug', mouth: 'smirk' }) },
  pelo: { duracion: 2000, cuadro: () => ({ brazoD: 'oreja', mira: { x: -1, y: 0 }, hdx: -1, mouth: 'smile', brow: 'flat' }) },
  baile: {
    duracion: 2600,
    cuadro: (p, t) => ({
      brazoI: alterna(t, 330, 'alto', 'libro'), brazoD: alterna(t, 330, 'libro', 'alto'), temblor: alterna(t, 330, -1, 1),
      piernaI: alterna(t, 330, 1, 0), piernaD: alterna(t, 330, 0, 1), eyes: 'happy', mouth: 'open', brow: 'flat', fx: 'notas',
    }),
  },
  beso: {
    duracion: 2200,
    cuadro: p => (p < 0.45
      ? { brazoD: 'boca', mouth: 'o', eyes: 'blink', brow: 'flat' }
      : { brazoD: 'lado', mouth: 'smile', eyes: 'open', guino: true, brow: 'flat', fx: 'corazon' }),
  },
  cadera: { duracion: 2200, cuadro: p => ({ brazoI: 'cadera', brazoD: 'cadera', brow: 'smug', mouth: 'smile', eyes: 'open', salto: p < 0.2 ? 1 : 0 }) },
  manoPecho: { duracion: 2000, cuadro: p => ({ brazoD: 'manoPecho', hdy: p > 0.3 && p < 0.7 ? 1 : 0, eyes: 'happy', mouth: 'smile', brow: 'flat' }) },
  wai: { duracion: 2200, cuadro: p => ({ brazoI: 'rezo', brazoD: 'rezo', hdy: p > 0.25 && p < 0.75 ? 2 : 0, eyes: p > 0.25 && p < 0.75 ? 'blink' : 'happy', mouth: 'smile', brow: 'flat' }) },
  dedoCorazon: { duracion: 1800, cuadro: () => ({ brazoD: 'pulgar', guino: true, eyes: 'open', mouth: 'smile', brow: 'flat', fx: 'corazon' }) },
};
// Las del botón de la portada, en dos versiones: «…Der» con el botón a su derecha (en el dibujo) y «…Izq» a su izquierda.
// cuadro(p, t, lado, otro, x): lado/otro son 'brazoD'/'brazoI' y x hacia dónde mira (1 derecha, −1 izquierda).
const HACIA_EL_BOTON = {
  // empuja el botón con las dos manos… bueno, con la que llega: aprieta los ojos, suda y tiembla del esfuerzo
  empujar: { duracion: 2200, cuadro: (p, t, lado, otro, x) => ({ [lado]: alterna(t, 180, 'empuje', 'empuje2'), [otro]: 'cadera', eyes: 'blink', brow: 'worry', mouth: 'flat', temblor: alterna(t, 90, 0, x), fx: 'sweat' }) },
  // ¡tachán!: lo presenta con la mano abierta y la otra en alto
  presentar: { duracion: 2000, cuadro: (p, t, lado, otro) => ({ [lado]: 'lado', [otro]: 'alto', salto: p < 0.15 ? 2 : 0, eyes: 'happy', mouth: 'open', brow: 'flat', fx: 'sparkle' }) },
  // señala el botón, abajo a su lado, dando golpecitos con el dedo
  senalarAbajo: { duracion: 2200, cuadro: (p, t, lado, otro, x) => ({ [lado]: alterna(t, 260, 'abajo', 'abajo2'), mira: { x, y: 1 }, hdx: x, mouth: 'smile', brow: 'flat' }) },
  // invita a pulsarlo: la mano barre del botón hacia quien mira la pantalla
  invitar: { duracion: 2400, cuadro: (p, t, lado, otro, x) => ({ [lado]: alterna(t, 400, 'invitar', 'lado'), mira: { x: Math.floor(t / 400) % 2 ? x : 0, y: 0 }, eyes: 'open', mouth: 'open', brow: 'flat' }) },
};
for (const [nombre, anim] of Object.entries(HACIA_EL_BOTON)) {
  ANIMACIONES[`${nombre}Der`] = { duracion: anim.duracion, cuadro: (p, t) => anim.cuadro(p, t, 'brazoD', 'brazoI', 1) };
  ANIMACIONES[`${nombre}Izq`] = { duracion: anim.duracion, cuadro: (p, t) => anim.cuadro(p, t, 'brazoI', 'brazoD', -1) };
}
// la que está encima del botón: se agacha, salta bien alto y cae de golpe (ahí se hunde el botón, a 0,55 de la animación)
ANIMACIONES.saltarBoton = {
  duracion: 1700, prioridad: 2,
  cuadro: p => {
    if (p < 0.15) return { salto: -1, brazoI: 'pecho', brazoD: 'pecho', eyes: 'blink', brow: 'flat', mouth: 'flat' };
    if (p < 0.55) return { salto: Math.round(subeYBaja(p, 0.15, 0.55) * 11), brazoI: 'alto', brazoD: 'alto', eyes: 'happy', mouth: 'open', brow: 'flat' };
    if (p < 0.68) return { salto: -2, brazoI: 'lado', brazoD: 'lado', eyes: 'blink', mouth: 'open', brow: 'flat' };
    return { brazoD: 'pulgar', eyes: 'open', guino: true, mouth: 'smile', brow: 'flat', fx: 'sparkle' };
  },
};
export const SALTO_PISA = 0.55;

export const ANIMACIONES_VALIDAS = Object.keys(ANIMACIONES).filter(n => !['dormir', 'escuchar'].includes(n));

// Mientras dura una expresión, el cuerpo la acompaña (sin animación encima).
const POSTURAS = {
  pensando: () => ({ brazoI: 'barbilla', mira: { x: 1, y: -1 } }),
  confundida: () => ({ brazoI: 'cabeza', fx: 'pregunta' }),
  apurada: t => ({ piernaI: alterna(t, 140, 2, 0), piernaD: alterna(t, 140, 0, 2) }),
};

const CON_TIEMPO = ['pregunta', 'zzz', 'notas', 'corazon', 'confeti', 'mareo'];

/**
 * Crea el dibujo de una tutora a partir de su diseño (lo que exporta cursos/<id>/tutora.js).
 * Devuelve { crearSprite(canvas), rejilla(expresion) }.
 */
export function fabricar(disenar) {
  const D = disenar(AYUDAS);
  const firma = ANIMACIONES[D.firma] ? D.firma : 'manoPecho';

  // Cabeza enorme (y 2–35), ojos grandes y cuerpo pequeño (y 34–55).
  function build(s) {
    for (const k of Object.keys(C)) delete C[k];
    Object.assign(C, BASE, D.colores, D.bebida);
    dy = s.bob + (s.hdy ?? 0);
    dx = s.hdx ?? 0;
    manga = null;
    const sw = s.sway;
    const brazoI = s.brazoI ?? 'libro';
    const brazoD = s.brazoD ?? 'libro';
    clear();

    D.atras(sw); // pelo que cae por detrás

    // cabeza grande y redonda (masa de pelo)
    for (const [y, x, w] of [[3, 16, 16], [4, 13, 22], [5, 11, 26], [6, 9, 30], [7, 8, 32]]) Rh(x, y, w, 1, C.hair);
    Rh(7, 8, 34, 20, C.hair); Rh(8, 28, 32, 3, C.hair); Rh(9, 31, 30, 2, C.hair); Rh(10, 33, 28, 1, C.hair);
    Rh(7, 10, 1, 18, C.hairS); Rh(40, 10, 1, 18, C.hairS);

    D.piernas();
    R(22, 33, 4, 3, C.skinS); // cuello
    const antes = g.map(fila => fila.slice());
    D.cuerpo();
    // el brazo que no está en reposo se lleva su manga
    for (const [lado, postura] of [['izq', brazoI], ['der', brazoD]]) {
      if (postura === 'libro') continue;
      for (let y = 37 + OY; y < 43 + OY; y++) for (const x of HUECO_MANGA[lado]) g[y][x] = antes[y][x];
    }

    // el libro, sujeto con las manos que estén en reposo
    libro(s.libro ?? (brazoI !== 'libro' && brazoD !== 'libro' ? 'nada' : 'cerrado'));
    if (brazoD === 'libro') { R(31, 41, 3, 3, C.skin); P(33, 43, C.skinS); }
    if (brazoI === 'libro') { R(14, 41, 3, 3, C.skin); P(14, 43, C.skinS); }

    D.sobre(sw); // lo que cae por delante de la ropa

    // cara
    for (const [y, x, w] of [[13, 14, 20], [14, 12, 24], [15, 12, 24]]) Rh(x, y, w, 1, C.skin);
    Rh(12, 16, 24, 14, C.skin); Rh(13, 30, 22, 1, C.skin); Rh(14, 31, 20, 1, C.skin); Rh(16, 32, 16, 1, C.skin); Rh(19, 33, 10, 1, C.skin);
    Rh(12, 16, 1, 13, C.skinS); Rh(35, 16, 1, 13, C.skinS); // sombra lateral

    D.pelo(sw); // flequillo y mechones

    // ojos grandes (mx, my: hacia dónde miran)
    const mx = s.mira?.x ?? 0;
    const my = s.mira?.y ?? 0;
    const eye = (x, left) => {
      const wing = left ? x - 1 : x + 6;
      const ojos = s.guino && left ? 'happy' : s.eyes;
      if (ojos === 'blink') { Rh(x, 22, 6, 1, C.o); Ph(wing, 21, C.o); return; }
      if (ojos === 'happy') { Ph(x, 23, C.o); Ph(x + 1, 22, C.o); Rh(x + 2, 21, 2, 1, C.o); Ph(x + 4, 22, C.o); Ph(x + 5, 23, C.o); return; }
      if (ojos === 'mareo') { for (let i = 0; i < 4; i++) { Ph(x + 1 + i, 20 + i, C.o); Ph(x + 4 - i, 20 + i, C.o); } return; }
      // gesto de superioridad: con las cejas «smug» el párpado cae un píxel
      if (ojos === 'open' && s.brow === 'smug') {
        Rh(x, 19, 6, 1, C.o); Ph(wing, 19, C.o); Ph(wing, 18, C.o);
        Rh(x, 20, 6, 5, C.eyeG); Rh(x, 20, 6, 1, C.eyeD); Rh(x + 1, 23, 4, 2, C.eyeL);
        Rh(x + 2 + mx, 21 + my, 2, 2, C.eyeD); Rh(x + 1 + mx, 21 + my, 1, 1, C.white); Ph(x + 2 + mx, 21 + my, C.white); Ph(x + 4, 23, C.white);
        Rh(x + 1, 25, 4, 1, C.skinS);
        return;
      }
      Rh(x, 18, 6, 1, C.o); Ph(wing, 18, C.o); Ph(wing, 17, C.o); // pestañas
      if (ojos === 'wide') {
        Rh(x, 19, 6, 6, C.white); Rh(x + 1, 20, 4, 4, C.eyeG); Rh(x + 2 + mx, 21 + my, 2, 2, C.eyeD); Ph(x + 1, 20, C.white);
      } else {
        Rh(x, 19, 6, 6, C.eyeG); Rh(x, 19, 6, 2, C.eyeD); Rh(x + 1, 23, 4, 2, C.eyeL);
        Rh(x + 2 + mx, 21 + my, 2, 2, C.eyeD);
        Rh(x + 1 + mx, 20 + my, 2, 2, C.white); Ph(x + 4, 23, C.white); // brillos
      }
      Rh(x + 1, 25, 4, 1, C.skinS); // párpado inferior
    };
    eye(14, true); eye(28, false);

    // cejas
    if (s.brow === 'smug') { Rh(14, 15, 2, 1, C.hairD); Rh(16, 16, 3, 1, C.hairD); Rh(32, 15, 2, 1, C.hairD); Rh(29, 16, 3, 1, C.hairD); }
    else if (s.brow === 'worry') { Rh(14, 16, 2, 1, C.hairD); Rh(16, 15, 3, 1, C.hairD); Rh(32, 16, 2, 1, C.hairD); Rh(29, 15, 3, 1, C.hairD); }
    else { Rh(14, 15, 5, 1, C.hairD); Rh(29, 15, 5, 1, C.hairD); }

    // mejillas y nariz
    Rh(12, 26, 3, 2, C.blush); Rh(33, 26, 3, 2, C.blush);
    if (s.fx === 'sparkle') { Ph(13, 26, '#ffc0bf'); Ph(34, 26, '#ffc0bf'); }
    Ph(24, 26, C.skinS);

    // boca pequeñita
    if (s.mouth === 'open') { Rh(22, 28, 4, 2, C.mouthD); Rh(23, 29, 2, 1, C.tongue); }
    else if (s.mouth === 'bostezo') { Rh(21, 27, 6, 3, C.mouthD); Rh(22, 29, 4, 1, C.tongue); }
    else if (s.mouth === 'o') { Rh(23, 28, 2, 2, C.mouthD); }
    else if (s.mouth === 'smile') { Rh(22, 29, 4, 1, C.mouth); Ph(21, 28, C.mouth); Ph(26, 28, C.mouth); }
    else if (s.mouth === 'flat') { Rh(22, 29, 3, 1, C.mouth); }
    else { Rh(22, 29, 3, 1, C.mouth); Ph(25, 28, C.mouth); } // sonrisa de superioridad

    D.adorno(sw); // lo que va encima de todo

    // los brazos que no sujetan el libro, por delante de todo (el de la izquierda encima del otro)
    brazo(brazoD, true);
    brazo(brazoI, false);

    levantarPierna(16, 23, s.piernaI ?? 0);
    levantarPierna(24, 31, s.piernaD ?? 0);

    outline();
    efectos(s);
  }

  /** Para revisar el dibujo o pintarlo quieto: devuelve la rejilla de colores de una expresión (y, si se pide, de un momento de una animación). */
  function rejilla(expresion = 'normal', sway = 0, animacion = null, momento = 0.5) {
    const cara = EXPRESIONES[expresion] ?? EXPRESIONES.normal;
    const anim = ANIMACIONES[animacion === 'firma' ? firma : animacion];
    const extra = anim ? anim.cuadro(momento, momento * Math.min(anim.duracion, 4000)) : {};
    build({ bob: 0, sway, star: 0, ...cara, ...extra, t: momento * 4000 });
    return g;
  }

  function crearSprite(canvas) {
    const ctx = canvas.getContext('2d');
    // escuchando / dormida: posturas que duran mientras sigan en true
    const sprite = { expresion: 'normal', hablando: false, escuchando: false, dormida: false };
    let reaccion = null; // { expresion, hasta }
    let actual = null; // { nombre, inicio }
    let cola = [];

    /** Reacción breve al tocarla; después vuelve a su expresión. Si no está haciendo nada, saluda. */
    sprite.reaccionar = (expresion, duracion = 1400) => {
      reaccion = { expresion, hasta: performance.now() + duracion };
      if (expresion === 'cosquillas' && !actual && !cola.length) cola = ['saludar'];
    };

    /** Pide una animación o una lista seguida («firma» es el gesto propio de esta tutora). Devuelve si la va a hacer. */
    sprite.gesto = nombres => {
      const lista = (Array.isArray(nombres) ? nombres : [nombres]).map(n => (n === 'firma' ? firma : n)).filter(n => ANIMACIONES[n]);
      if (!lista.length) return false;
      const ocupada = actual && (ANIMACIONES[actual.nombre].prioridad ?? 1) > (ANIMACIONES[lista[0]].prioridad ?? 1);
      if (ocupada) return false;
      actual = null;
      cola = lista;
      return true;
    };
    /** Si está en mitad de una animación. */
    sprite.ocupada = () => Boolean(actual || cola.length);

    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let proximoParpadeo = performance.now() + 2000;
    let finParpadeo = 0;
    let expresionAnterior = 'normal';
    let inicioRebote = 0;
    let ultimaClave = '';
    let ultimoFotograma = 0;

    function pintar(estado) {
      build(estado);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // El dibujo se apoya en el borde de abajo del lienzo, sea cual sea su alto.
      const arriba = canvas.height - ALTO - estado.salto;
      const k = estado.giro ?? 1; // la vueltecita: el dibujo se estrecha, se da la vuelta y vuelve
      for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) {
        const c = g[y][x];
        if (!c) continue;
        const nx = k === 1 ? x : Math.round(ANCHO / 2 + (x + 0.5 - ANCHO / 2) * k - 0.5);
        ctx.fillStyle = c;
        ctx.fillRect(nx + estado.temblor, y + arriba, 1, 1);
      }
    }

    let parado = false;
    /** Deja de dibujar (cuando el canvas ya no está en pantalla). */
    sprite.parar = () => { parado = true; };

    function fotograma(ahora) {
      if (parado) return;
      requestAnimationFrame(fotograma);
      if (ahora - ultimoFotograma < 70) return;
      ultimoFotograma = ahora;

      if (reaccion && ahora > reaccion.hasta) reaccion = null;
      const expresion = reaccion ? reaccion.expresion : sprite.expresion;
      if (expresion !== expresionAnterior) {
        expresionAnterior = expresion;
        inicioRebote = ahora;
      }
      const cara = { ...(EXPRESIONES[expresion] ?? EXPRESIONES.normal) };

      // la animación en curso (o la siguiente de la cola)
      if (actual && ahora - actual.inicio > ANIMACIONES[actual.nombre].duracion) actual = null;
      if (!actual && cola.length) actual = { nombre: cola.shift(), inicio: ahora };
      let cuerpo;
      let t = ahora;
      if (actual) {
        const anim = ANIMACIONES[actual.nombre];
        t = ahora - actual.inicio;
        cuerpo = anim.cuadro(t / anim.duracion, t);
      } else if (sprite.dormida) cuerpo = ANIMACIONES.dormir.cuadro(0, ahora);
      else if (sprite.escuchando) cuerpo = ANIMACIONES.escuchar.cuadro(0, ahora);
      else cuerpo = POSTURAS[expresion]?.(ahora) ?? {};

      if (ahora > proximoParpadeo) {
        finParpadeo = ahora + 160;
        proximoParpadeo = ahora + 2200 + Math.random() * 3500;
      }
      const ojos = cuerpo.eyes ?? cara.eyes;
      if (ahora < finParpadeo && (ojos === 'open' || ojos === 'wide')) cuerpo.eyes = 'blink';
      if (sprite.hablando && !cuerpo.mouth && Math.floor(ahora / 130) % 2) cara.mouth = 'open';

      const rebote = actual ? null : REBOTES[expresion];
      const progreso = rebote ? (ahora - inicioRebote) / rebote.duracion : 1;
      const mover = !sinMovimiento;
      const fx = cuerpo.fx ?? cara.fx;

      const estado = {
        ...cara,
        ...cuerpo,
        bob: mover ? Math.floor(ahora / 650) % 2 : 0,
        sway: mover ? Math.floor(ahora / 1000) % 2 : 0,
        star: Math.floor(ahora / 380) % 2,
        salto: mover ? (cuerpo.salto ?? (rebote?.salto ? rebote.salto(progreso) : 0)) : 0,
        temblor: mover ? (cuerpo.temblor ?? (rebote?.temblor ? rebote.temblor(progreso) : 0)) : 0,
        giro: mover ? cuerpo.giro : undefined,
        hdx: mover ? cuerpo.hdx : 0,
        hdy: mover ? cuerpo.hdy : 0,
        piernaI: mover ? cuerpo.piernaI : 0,
        piernaD: mover ? cuerpo.piernaD : 0,
        t: CON_TIEMPO.includes(fx) ? Math.floor(t / 70) * 70 : 0,
      };
      const clave = JSON.stringify(estado);
      if (clave === ultimaClave) return;
      ultimaClave = clave;
      pintar(estado);
    }

    requestAnimationFrame(fotograma);
    return sprite;
  }

  return { crearSprite, rejilla };
}
