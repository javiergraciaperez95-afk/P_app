// Dibujo de la tutora en pixel art, hecho por código (48 × 60 píxeles sobre un canvas de 48 × 62).
// Mismo personaje base que las tutoras de chino, español y vietnamita; lo propio de esta app está en DISENO.
// Inglés: media melena ondulada castaño miel con diadema azul marino, gafas redondas doradas, ojos azul grisáceo,
// jersey burdeos de pico con camisa y corbata, falda de cuadros escoceses, calcetines altos y libro verde botella.
// Este archivo se genera con _tutoras/generar.py: los cambios se hacen allí.

const ANCHO = 48;
const ALTO = 60;
const OY = 4; // filas libres por encima de la cabeza (moños, gorros): se dibuja con y desde −4
const MARGEN_ARRIBA = 2; // espacio para saltar sin cortar el pelo

const C = {
  o: '#24160f', skin: '#f9dcc4', skinS: '#e6b294', blush: '#f29a93',
  hair: '#5e3a28', hairL: '#7d5038', hairS: '#46291b', hairD: '#2b170e',
  eyeG: '#8a5a2e', eyeD: '#3f2412', eyeL: '#c8935a', white: '#ffffff',
  book: '#9c3540', bookD: '#6b2029', bookL: '#c4505b', page: '#f5edd4',
  gold: '#f3c94b', goldD: '#c9971f',
  shirt: '#f4f6f5', shirtS: '#c4cfca',
  mouth: '#b9474f', mouthD: '#7c2432', tongue: '#f08a8f',
  shoe: '#4a2c1d', shoeL: '#6e4430',
  drop: '#8fdcff', star: '#fff6a8',
};

let g;
let dy = 0; // la cabeza «respira»: sube y baja un píxel
const clear = () => { g = Array.from({ length: ALTO }, () => Array(ANCHO).fill(null)); };
const R = (x, y, w, h, c) => {
  for (let j = y + OY; j < y + OY + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < ANCHO && j >= 0 && j < ALTO) g[j][i] = c;
};
const P = (x, y, c) => R(x, y, 1, 1, c);
// Lo mismo, a los dos lados (d desplaza los dos hacia el mismo lado: el vaivén del pelo).
const B = (x, y, w, h, c, d = 0) => { R(x + d, y, w, h, c); R(ANCHO - x - w + d, y, w, h, c); };
// Lo mismo, para lo que va en la cabeza.
const Rh = (x, y, w, h, c) => R(x, y + dy, w, h, c);
const Ph = (x, y, c) => Rh(x, y, 1, 1, c);
const Bh = (x, y, w, h, c, d = 0) => B(x, y + dy, w, h, c, d);

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
const mangas = (c, cL, puno) => { B(13, 37, 3, 6, c); P(13, 37, cL); P(34, 37, cL); if (puno) B(13, 40, 3, 1, puno); };
const mangaCorta = () => B(13, 41, 3, 2, C.skin);
const torso = (c, cS) => { R(16, 35, 16, 1, c); R(15, 36, 18, 9, c); if (cS) B(16, 38, 1, 6, cS); };
const falda = (c, cD) => { R(14, 45, 20, 5, c); for (let x = 16; x < 33; x += 3) R(x, 45, 1, 5, cD); };

// ===== Lo propio de esta tutora =====
const DISENO = {
  colores: {
    hair: '#a8703f', hairL: '#d09a62', hairS: '#7f5129', hairD: '#583618',
    eyeG: '#6f8fb0', eyeD: '#33485e', eyeL: '#a9c6e0',
    book: '#2f6b4f', bookD: '#1e4a36', bookL: '#4a8f6c',
    jersey: '#7a2433', jerseyL: '#9c3546', jerseyD: '#551622',
    corbata: '#27365e', cuadro: '#2f5a44', cuadroD: '#27365e', cuadroR: '#c0323c',
    diadema: '#27365e', diademaL: '#4a62a8', gafas: '#b88a2a',
  },
  atras(sw) {
    B(6, 26, 6, 5, C.hair); B(5, 30, 7, 5, C.hair, sw); B(6, 35, 6, 3, C.hair, sw); B(7, 38, 4, 1, C.hair, sw);
    B(5, 30, 1, 5, C.hairS, sw); B(8, 31, 1, 5, C.hairL, sw);
  },
  piernas() { medias('#27365e', 51); },
  cuerpo() {
    torso(C.jersey, C.jerseyL);
    R(20, 35, 8, 2, C.shirt); R(21, 37, 6, 1, C.shirt);
    R(23, 36, 2, 2, C.corbata); P(23, 37, C.gold);
    R(14, 45, 20, 5, C.cuadro);
    for (let x = 16; x < 33; x += 4) R(x, 45, 1, 5, C.cuadroD);
    R(14, 47, 20, 1, C.cuadroD); R(14, 49, 20, 1, C.cuadroR);
    mangas(C.jersey, C.jerseyL, C.shirt);
  },
  sobre() {},
  pelo(sw) {
    Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair);
    Rh(12, 14, 7, 1, C.hair); Rh(22, 14, 6, 1, C.hair); Rh(31, 14, 5, 1, C.hair); Bh(12, 15, 2, 1, C.hair);
    Rh(14, 10, 6, 1, C.hairL); Rh(25, 10, 6, 1, C.hairL);
    Rh(20, 9, 1, 5, C.hairS); Rh(29, 9, 1, 5, C.hairS);
    Bh(9, 13, 4, 19, C.hair); Bh(9, 13, 1, 19, C.hairS); Bh(11, 16, 1, 12, C.hairL);
    Rh(8 + sw, 32, 5, 3, C.hair); Rh(35 + sw, 32, 5, 3, C.hair);
  },
  adorno() {
    Rh(9, 6, 30, 2, C.diadema); Rh(12, 6, 10, 1, C.diademaL); // diadema
    // gafas redondas
    for (const x of [13, 27]) { Rh(x + 1, 17, 6, 1, C.gafas); Rh(x + 1, 26, 6, 1, C.gafas); Rh(x, 18, 1, 8, C.gafas); Rh(x + 7, 18, 1, 8, C.gafas); }
    Rh(21, 21, 6, 1, C.gafas);
  },
};
Object.assign(C, DISENO.colores);

// Cabeza enorme (y 2–35), ojos grandes y cuerpo pequeño (y 34–55). La cabeza «respira»; el cuerpo no se mueve.
function build(s) {
  dy = s.bob;
  const sw = s.sway;
  clear();

  DISENO.atras(sw); // pelo que cae por detrás

  // cabeza grande y redonda (masa de pelo)
  for (const [y, x, w] of [[3, 16, 16], [4, 13, 22], [5, 11, 26], [6, 9, 30], [7, 8, 32]]) Rh(x, y, w, 1, C.hair);
  Rh(7, 8, 34, 20, C.hair); Rh(8, 28, 32, 3, C.hair); Rh(9, 31, 30, 2, C.hair); Rh(10, 33, 28, 1, C.hair);
  Rh(7, 10, 1, 18, C.hairS); Rh(40, 10, 1, 18, C.hairS);

  DISENO.piernas();
  R(22, 33, 4, 3, C.skinS); // cuello
  DISENO.cuerpo();

  // libro en las manos
  R(16, 38, 16, 7, C.o);
  R(17, 39, 14, 5, C.book); R(17, 39, 14, 1, C.bookL); R(17, 39, 2, 5, C.bookD); R(19, 43, 12, 1, C.page);
  R(23, 40, 3, 1, C.gold); R(22, 41, 5, 1, C.gold); R(23, 42, 3, 1, C.gold); P(24, 41, C.goldD);
  R(31, 41, 3, 3, C.skin); P(33, 43, C.skinS);
  R(14, 41, 3, 3, C.skin); P(14, 43, C.skinS);

  DISENO.sobre(sw); // lo que cae por delante de la ropa

  // cara
  for (const [y, x, w] of [[13, 14, 20], [14, 12, 24], [15, 12, 24]]) Rh(x, y, w, 1, C.skin);
  Rh(12, 16, 24, 14, C.skin); Rh(13, 30, 22, 1, C.skin); Rh(14, 31, 20, 1, C.skin); Rh(16, 32, 16, 1, C.skin); Rh(19, 33, 10, 1, C.skin);
  Rh(12, 16, 1, 13, C.skinS); Rh(35, 16, 1, 13, C.skinS); // sombra lateral

  DISENO.pelo(sw); // flequillo y mechones

  // ojos grandes
  const eye = (x, left) => {
    const wing = left ? x - 1 : x + 6;
    if (s.eyes === 'blink') { Rh(x, 22, 6, 1, C.o); Ph(wing, 21, C.o); return; }
    if (s.eyes === 'happy') { Ph(x, 23, C.o); Ph(x + 1, 22, C.o); Rh(x + 2, 21, 2, 1, C.o); Ph(x + 4, 22, C.o); Ph(x + 5, 23, C.o); return; }
    // gesto de superioridad: con las cejas «smug» el párpado cae un píxel
    if (s.eyes === 'open' && s.brow === 'smug') {
      Rh(x, 19, 6, 1, C.o); Ph(wing, 19, C.o); Ph(wing, 18, C.o);
      Rh(x, 20, 6, 5, C.eyeG); Rh(x, 20, 6, 1, C.eyeD); Rh(x + 1, 23, 4, 2, C.eyeL);
      Rh(x + 2, 21, 2, 2, C.eyeD); Rh(x + 1, 21, 1, 1, C.white); Ph(x + 2, 21, C.white); Ph(x + 4, 23, C.white);
      Rh(x + 1, 25, 4, 1, C.skinS);
      return;
    }
    Rh(x, 18, 6, 1, C.o); Ph(wing, 18, C.o); Ph(wing, 17, C.o); // pestañas
    if (s.eyes === 'wide') {
      Rh(x, 19, 6, 6, C.white); Rh(x + 1, 20, 4, 4, C.eyeG); Rh(x + 2, 21, 2, 2, C.eyeD); Ph(x + 1, 20, C.white);
    } else {
      Rh(x, 19, 6, 6, C.eyeG); Rh(x, 19, 6, 2, C.eyeD); Rh(x + 1, 23, 4, 2, C.eyeL);
      Rh(x + 2, 21, 2, 2, C.eyeD);
      Rh(x + 1, 20, 2, 2, C.white); Ph(x + 4, 23, C.white); // brillos
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
  else if (s.mouth === 'smile') { Rh(22, 29, 4, 1, C.mouth); Ph(21, 28, C.mouth); Ph(26, 28, C.mouth); }
  else if (s.mouth === 'flat') { Rh(22, 29, 3, 1, C.mouth); }
  else { Rh(22, 29, 3, 1, C.mouth); Ph(25, 28, C.mouth); } // sonrisa de superioridad

  DISENO.adorno(sw); // lo que va encima de todo

  outline();

  // efectos (sin contorno)
  if (s.fx === 'sparkle') {
    const star = (x, y, big) => { P(x, y, C.star); if (big) { P(x - 1, y, C.star); P(x + 1, y, C.star); P(x, y - 1, C.star); P(x, y + 1, C.star); } };
    star(5, 10, s.star); star(43, 6, !s.star); star(43, 30, s.star); star(5, 36, !s.star);
  }
  if (s.fx === 'sweat') {
    P(42, 9 + dy, C.drop); R(41, 10 + dy, 3, 2, C.drop); P(42, 12 + dy, C.drop); P(41, 11 + dy, C.white);
  }
}

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

export const NOMBRES_EXPRESION = {
  normal: 'tranquila',
  pensando: 'pensando',
  contenta: 'contenta',
  apurada: 'apurada',
  sorprendida: 'sorprendida',
  confundida: 'confundida',
};

// Movimiento de todo el cuerpo al empezar una expresión: salto (píxeles hacia arriba) o temblor (hacia los lados).
const GESTOS = {
  contenta: { duracion: 420, salto: p => (p < 1 ? Math.round(Math.sin(p * Math.PI) * 3) : 0) },
  cosquillas: { duracion: 700, salto: p => (p < 1 ? Math.round(Math.abs(Math.sin(p * Math.PI * 2)) * 3) : 0) },
  sorprendida: { duracion: 220, salto: p => (p < 1 ? 2 : 0) },
  agobiada: { duracion: 1400, temblor: p => (p < 1 ? [1, 0, -1, 0][Math.floor(p * 28) % 4] : 0) },
  apurada: { duracion: 500, temblor: p => (p < 1 ? [1, 0, -1, 0][Math.floor(p * 10) % 4] : 0) },
};

/** Para revisar el dibujo: devuelve la rejilla de colores de una expresión. */
export function rejilla(expresion = 'normal', sway = 0) {
  build({ bob: 0, sway, star: 0, ...(EXPRESIONES[expresion] ?? EXPRESIONES.normal) });
  return g;
}

export function crearSprite(canvas) {
  const ctx = canvas.getContext('2d');
  const sprite = { expresion: 'normal', hablando: false };
  let reaccion = null; // { expresion, hasta }

  /** Reacción breve al tocarla; después vuelve a su expresión. */
  sprite.reaccionar = (expresion, duracion = 1400) => {
    reaccion = { expresion, hasta: performance.now() + duracion };
  };
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let proximoParpadeo = performance.now() + 2000;
  let finParpadeo = 0;
  let expresionAnterior = 'normal';
  let inicioGesto = 0;
  let ultimaClave = '';
  let ultimoFotograma = 0;

  function pintar(estado) {
    build(estado);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const arriba = MARGEN_ARRIBA - estado.salto;
    for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) {
      const c = g[y][x];
      if (c) { ctx.fillStyle = c; ctx.fillRect(x + estado.temblor, y + arriba, 1, 1); }
    }
  }

  function fotograma(ahora) {
    requestAnimationFrame(fotograma);
    if (ahora - ultimoFotograma < 70) return;
    ultimoFotograma = ahora;

    if (reaccion && ahora > reaccion.hasta) reaccion = null;
    const expresion = reaccion ? reaccion.expresion : sprite.expresion;
    if (expresion !== expresionAnterior) {
      expresionAnterior = expresion;
      inicioGesto = ahora;
    }
    const cara = { ...(EXPRESIONES[expresion] ?? EXPRESIONES.normal) };

    if (ahora > proximoParpadeo) {
      finParpadeo = ahora + 160;
      proximoParpadeo = ahora + 2200 + Math.random() * 3500;
    }
    if (ahora < finParpadeo && (cara.eyes === 'open' || cara.eyes === 'wide')) cara.eyes = 'blink';
    if (sprite.hablando && Math.floor(ahora / 130) % 2) cara.mouth = 'open';

    const gesto = GESTOS[expresion];
    const progreso = gesto ? (ahora - inicioGesto) / gesto.duracion : 1;
    const mover = !sinMovimiento;

    const estado = {
      ...cara,
      bob: mover ? Math.floor(ahora / 650) % 2 : 0,
      sway: mover ? Math.floor(ahora / 1000) % 2 : 0,
      star: Math.floor(ahora / 380) % 2,
      salto: mover && gesto?.salto ? gesto.salto(progreso) : 0,
      temblor: mover && gesto?.temblor ? gesto.temblor(progreso) : 0,
    };
    const clave = JSON.stringify(estado);
    if (clave === ultimaClave) return;
    ultimaClave = clave;
    pintar(estado);
  }

  requestAnimationFrame(fotograma);
  return sprite;
}
