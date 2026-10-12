// Dibujo de la tutora en pixel art, hecho por código (48 × 56 píxeles sobre un canvas de 48 × 60).
// Parte del dibujo de la tutora de la app de chino, adaptado: chibi de media melena castaña con flequillo,
// ojos marrones, aros, uniforme escolar (chaqueta azul marino, camisa blanca, corbata roja, falda gris
// plisada, calcetines blancos) y un libro entre las manos. Se pinta con rectángulos de 1 píxel y un pase
// automático de contorno.

const ANCHO = 48;
const ALTO = 56;
const MARGEN_ARRIBA = 4; // espacio para saltar sin cortar el pelo

const C = {
  o: '#24160f', skin: '#f9dcc4', skinS: '#e6b294', blush: '#f29a93',
  hair: '#5e3a28', hairL: '#7d5038', hairS: '#46291b', hairD: '#2b170e',
  eyeG: '#8a5a2e', eyeD: '#3f2412', eyeL: '#c8935a', white: '#ffffff',
  book: '#9c3540', bookD: '#6b2029', bookL: '#c4505b', page: '#f5edd4',
  gold: '#f3c94b', goldD: '#c9971f',
  robe: '#1d2220', robeL: '#34403b', lin: '#1f7a45', linL: '#3bbd6d',
  vest: '#7b847f', vestD: '#5c6561', shirt: '#f4f6f5', shirtS: '#c4cfca',
  tie: '#c0323c', tieD: '#8a1f2a', ring: '#d5dae0',
  navy: '#27365e', navyL: '#3d5088', skirt: '#8d90a0', skirtD: '#6c6f80',
  mouth: '#b9474f', mouthD: '#7c2432', tongue: '#f08a8f',
  drop: '#8fdcff', star: '#fff6a8',
};
const LEGS = '#2b2d33', SHOE = '#4a2c1d', SHOEL = '#6e4430';

let g;
const clear = () => { g = Array.from({ length: ALTO }, () => Array(ANCHO).fill(null)); };
const R = (x, y, w, h, c) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < ANCHO && j >= 0 && j < ALTO) g[j][i] = c;
};
const P = (x, y, c) => R(x, y, 1, 1, c);

function outline() {
  const add = [];
  for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) {
    if (g[y][x]) continue;
    if ((y > 0 && g[y - 1][x]) || (y < ALTO - 1 && g[y + 1][x]) || (x > 0 && g[y][x - 1]) || (x < ANCHO - 1 && g[y][x + 1])) add.push([x, y]);
  }
  add.forEach(([x, y]) => { g[y][x] = C.o; });
}

// Vestuario: cada conjunto dibuja el torso (x 13–34, y 34–50) y da los colores de la manga para la pose de señalar.
const sleeves = (c, cL) => { R(13, 37, 3, 6, c); R(32, 37, 3, 6, c); P(13, 37, cL); P(34, 37, cL); };

export const CONJUNTOS = {
  uniforme: {
    sleeve: ['#27365e', '#3d5088'], cuff: ['#f4f6f5', '#ffffff'],
    body(point) {
      // chaqueta azul marino
      R(16, 35, 16, 1, C.navy); R(15, 36, 18, 9, C.navy);
      R(16, 37, 1, 7, C.navyL); R(31, 37, 1, 7, C.navyL);
      // camisa blanca y corbata roja
      R(20, 35, 8, 2, C.shirt); R(21, 37, 6, 1, C.shirt); R(22, 38, 4, 1, C.shirt); P(20, 35, C.shirtS); P(27, 35, C.shirtS);
      R(23, 36, 2, 3, C.tie); P(23, 37, C.tieD); P(24, 37, C.tieD);
      // falda gris plisada con una raya roja
      R(14, 45, 20, 5, C.skirt);
      for (let x = 16; x < 33; x += 3) R(x, 45, 1, 5, C.skirtD);
      R(14, 48, 20, 1, C.tie);
      if (!point) sleeves(C.navy, C.navyL); else R(32, 37, 3, 6, C.navy);
    },
  },
  invierno: {
    sleeve: ['#e9dfc4', '#fff7e2'], cuff: ['#c9bc98', '#e9dfc4'],
    body(point) {
      const knit = '#e9dfc4', knitD = '#c9bc98', blue = '#3b6fc4', blueD = '#284f91', blueL = '#6f9be0';
      R(16, 35, 16, 1, knit); R(15, 36, 18, 11, knit); R(14, 46, 20, 4, knit);
      for (let x = 16; x < 33; x += 3) R(x, 39, 1, 8, knitD); // punto acanalado
      R(14, 48, 20, 2, knitD);
      R(17, 34, 14, 3, blue); R(17, 34, 14, 1, blueL); R(17, 36, 14, 1, blueD); // bufanda
      R(26, 37, 3, 7, blue); P(26, 37, blueL); R(26, 40, 3, 1, blueL); P(26, 44, blue); P(28, 44, blue);
      if (!point) sleeves(knit, '#fff7e2'); else R(32, 37, 3, 6, knit);
    },
  },
  deportiva: {
    sleeve: ['#2f8f4e', '#ffffff'], cuff: ['#1f6b39', '#2f8f4e'],
    body(point) {
      const v = '#2f8f4e', vD = '#1f6b39', vL = '#46c46f';
      R(16, 35, 16, 1, v); R(15, 36, 18, 11, v); R(14, 46, 20, 4, vD);
      R(15, 37, 1, 10, C.white); R(32, 37, 1, 10, C.white); R(17, 38, 2, 2, vL);
      R(19, 34, 10, 2, vD); R(22, 35, 4, 2, C.white); // cuello y camiseta
      R(24, 37, 1, 9, C.ring); // cremallera
      R(17, 44, 4, 1, vD); R(27, 44, 4, 1, vD); // bolsillos
      if (!point) { sleeves(v, C.white); R(13, 40, 3, 1, C.white); R(32, 40, 3, 1, C.white); } else R(32, 37, 3, 6, v);
    },
  },
};

// Cabeza enorme (y 2–35), ojos grandes y cuerpo pequeño (y 34–55). La cabeza «respira» (bob); el cuerpo no se mueve.
function build(s) {
  const dy = s.bob, sw = s.sway;
  const point = s.arm === 'point';
  const o = CONJUNTOS[s.conjunto] || CONJUNTOS.uniforme;
  clear();
  const Rh = (x, y, w, h, c) => R(x, y + dy, w, h, c); // partes de la cabeza
  const Ph = (x, y, c) => Rh(x, y, 1, 1, c);

  // pelo trasero: media melena que cae hasta los hombros, con las puntas hacia fuera
  R(9, 32, 6, 8, C.hair); R(33, 32, 6, 8, C.hair);
  R(9, 32, 1, 8, C.hairS); R(38, 32, 1, 8, C.hairS); R(12, 35, 1, 4, C.hairL); R(35, 35, 1, 4, C.hairL);
  R(7 + sw, 39, 6, 2, C.hair); R(7 + sw, 41, 3, 1, C.hair); R(35 + sw, 39, 6, 2, C.hair); R(38 + sw, 41, 3, 1, C.hair);

  // cabeza grande y redonda (masa de pelo)
  for (const [y, x, w] of [[3, 16, 16], [4, 13, 22], [5, 11, 26], [6, 9, 30], [7, 8, 32]]) Rh(x, y, w, 1, C.hair);
  Rh(7, 8, 34, 20, C.hair); Rh(8, 28, 32, 3, C.hair); Rh(9, 31, 30, 2, C.hair); Rh(10, 33, 28, 1, C.hair);
  Rh(7, 10, 1, 18, C.hairS); Rh(40, 10, 1, 18, C.hairS);

  // piernas y zapatos
  R(19, 50, 3, 2, C.skin); R(26, 50, 3, 2, C.skin); P(19, 50, C.skinS); P(26, 50, C.skinS);
  R(19, 52, 3, 1, C.white); R(26, 52, 3, 1, C.white);
  R(18, 53, 5, 2, SHOE); R(25, 53, 5, 2, SHOE); P(19, 53, SHOEL); P(26, 53, SHOEL);

  // cuello y ropa
  R(22, 33, 4, 3, C.skinS);
  o.body(point);

  // libro en las manos
  R(16, 38, 16, 7, C.o);
  R(17, 39, 14, 5, C.book); R(17, 39, 14, 1, C.bookL); R(17, 39, 2, 5, C.bookD); R(19, 43, 12, 1, C.page);
  R(23, 40, 3, 1, C.gold); R(22, 41, 5, 1, C.gold); R(23, 42, 3, 1, C.gold); P(24, 41, C.goldD);
  R(31, 41, 3, 3, C.skin); P(33, 43, C.skinS); // mano derecha
  if (!point) { R(14, 41, 3, 3, C.skin); P(14, 43, C.skinS); } // mano izquierda

  // cara
  for (const [y, x, w] of [[13, 14, 20], [14, 12, 24], [15, 12, 24]]) Rh(x, y, w, 1, C.skin);
  Rh(12, 16, 24, 14, C.skin); Rh(13, 30, 22, 1, C.skin); Rh(14, 31, 20, 1, C.skin); Rh(16, 32, 16, 1, C.skin); Rh(19, 33, 10, 1, C.skin);
  Rh(12, 16, 1, 13, C.skinS); Rh(35, 16, 1, 13, C.skinS); // sombra lateral

  // flequillo recto, con las puntas desiguales, y mechones que enmarcan la cara
  Rh(11, 8, 26, 5, C.hair); Rh(12, 13, 24, 1, C.hair); Rh(12, 14, 4, 2, C.hair); Rh(32, 14, 4, 2, C.hair);
  Rh(17, 14, 3, 1, C.hair); Rh(22, 14, 5, 1, C.hair); Rh(29, 14, 2, 1, C.hair); // puntas del flequillo
  Rh(13, 6, 7, 1, C.hairL); Rh(25, 6, 8, 1, C.hairL); Rh(11, 8, 3, 1, C.hairL); Rh(34, 8, 3, 1, C.hairL); // brillo
  Rh(16, 10, 1, 4, C.hairS); Rh(21, 10, 1, 4, C.hairS); Rh(27, 10, 1, 4, C.hairS); Rh(32, 10, 1, 3, C.hairS); // mechones
  Rh(9, 13, 4, 19, C.hair); Rh(35, 13, 4, 19, C.hair); // mechones laterales
  Rh(9, 13, 1, 19, C.hairS); Rh(38, 13, 1, 19, C.hairS); Rh(11, 16, 1, 12, C.hairL); Rh(36, 16, 1, 12, C.hairL);
  Rh(8 + sw, 32, 5, 3, C.hair); Rh(35 + sw, 32, 5, 3, C.hair); // puntas (se mecen)

  // aros
  Rh(11, 27, 2, 1, C.ring); Ph(11, 28, C.ring); Rh(11, 29, 2, 1, C.ring);
  Rh(35, 27, 2, 1, C.ring); Ph(36, 28, C.ring); Rh(35, 29, 2, 1, C.ring);

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

  // brazo señalando hacia arriba
  if (point) {
    const f = s.star;
    R(12, 34, 3, 5, o.sleeve[0]); R(10, 30, 3, 5, o.sleeve[0]); P(10, 30, o.sleeve[1]);
    R(9, 28, 4, 2, o.cuff[0]); R(9, 28, 4, 1, o.cuff[1]);
    R(9, 25, 3, 3, C.skin); P(11, 27, C.skinS);
    R(9, 21 - f, 1, 4 + f, C.skin);
  }

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

export const EXPRESIONES_VALIDAS = ['normal', 'pensando', 'contenta', 'apurada', 'sorprendida', 'confundida'];

// Movimiento de todo el cuerpo al empezar una expresión: salto (píxeles hacia arriba) o temblor (hacia los lados).
const GESTOS = {
  contenta: { duracion: 420, salto: p => (p < 1 ? Math.round(Math.sin(p * Math.PI) * 3) : 0) },
  cosquillas: { duracion: 700, salto: p => (p < 1 ? Math.round(Math.abs(Math.sin(p * Math.PI * 2)) * 3) : 0) },
  sorprendida: { duracion: 220, salto: p => (p < 1 ? 2 : 0) },
  agobiada: { duracion: 1400, temblor: p => (p < 1 ? [1, 0, -1, 0][Math.floor(p * 28) % 4] : 0) },
  apurada: { duracion: 500, temblor: p => (p < 1 ? [1, 0, -1, 0][Math.floor(p * 10) % 4] : 0) },
};

/** Para revisar el dibujo: devuelve la rejilla de colores de una expresión. */
export function rejilla(expresion = 'normal') {
  build({ bob: 0, sway: 0, star: 0, conjunto: 'uniforme', ...(EXPRESIONES[expresion] ?? EXPRESIONES.normal) });
  return g;
}

export function crearSprite(canvas) {
  const ctx = canvas.getContext('2d');
  const sprite = { expresion: 'normal', hablando: false, conjunto: 'uniforme' };
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
      conjunto: sprite.conjunto,
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
