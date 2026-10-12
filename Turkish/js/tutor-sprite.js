// Dibujo de la tutora en pixel art (canvas de 48 × 62 píxeles).
// Chica chibi muy tierna: cabeza grande y redonda, pelo rubio largo, ojos verdes,
// el mismo dibujo de tutora que las otras apps, y un libro entre las manos. Los contornos son tonos oscuros de cada
// zona (no negros) para que el conjunto se vea suave.

const ANCHO = 48;
const ALTO = 62;
const MARGEN_ARRIBA = 2; // espacio para saltar sin cortar el pelo

// Cada color tiene su «borde»: el tono con el que se contornea esa zona.
const COLORES = {
  // pelo rubio
  H: ['#fff4c2', 'X'], // brillo
  h: ['#f6d77e', 'X'], // base
  d: ['#e2b45a', 'X'], // sombra
  D: ['#c48f3c', 'X'], // sombra profunda
  X: ['#8a5c28', 'X'], // contorno
  // piel
  s: ['#ffeadf', 'Y'],
  S: ['#f7cbb8', 'Y'],
  b: ['#ffaaa8', 'Y'], // rubor
  Y: ['#c98a78', 'Y'],
  // ojos verdes
  k: ['#4a2c22', 'k'], // pestañas
  B: ['#b98656', 'k'], // cejas
  G: ['#1f7a5c', 'k'],
  g: ['#3dbb8c', 'k'],
  l: ['#9be8c4', 'k'],
  w: ['#ffffff', 'k'],
  // boca
  m: ['#b5505a', 'Y'],
  n: ['#f08a92', 'Y'],
  // vestido rojo y libro
  r: ['#c8343c', 'Z'],
  R: ['#8e2028', 'Z'],
  q: ['#e2575c', 'Z'], // brillo del vestido
  L: ['#5a1424', 'Z'], // marco de la tapa del libro
  M: ['#93263c', 'Z'], // tapa
  P: ['#fff1d6', 'Z'], // páginas
  o: ['#f4c24a', 'Z'], // dorado
  K: ['#2a2430', 'Z'], // corpiño negro
  c: ['#fbf8f2', 'Z'], // blusa y delantal blancos
  A: ['#d8d2cc', 'Z'], // sombra del blanco
  g: ['#5a9a4a', 'Z'], // bordado verde
  O: ['#c8902a', 'Z'],
  v: ['#4a3036', 'Z'], // medias
  e: ['#6a4028', 'Z'], // botas
  E: ['#8e5a38', 'Z'],
  Z: ['#4a141c', 'Z'],
  // efectos
  y: ['#ffe066', 'x'],
  a: ['#8fd8ff', 'x'],
  W: ['#ffffff', 'x'],
  x: ['#5a4a6a', 'x'],
};

const ES_PELO = new Set(['H', 'h', 'd', 'D', 'X']);

// --- Ojos (7 × 6). «der» se usa tal cual; si no hay, se refleja «izq». ---
const OJOS = {
  normal: { izq: ['kkkkkk.', 'kGGGwwk', 'GgggwwG', 'Ggggggg', 'glllllg', '.lllll.'] },
  medio: { izq: ['.......', '.......', 'kkkkkkk', 'Gggggg.', 'glllllg', '.lllll.'] },
  cerrados: { izq: ['.......', '.......', '.......', '.kkkkk.', 'k.....k', '.......'] },
  felices: { izq: ['.......', '..kkk..', '.k...k.', 'k.....k', '.......', '.......'] },
  abiertos: { izq: ['.kkkkk.', 'kwwGwwk', 'wwGGGww', 'wwGgGww', 'kwwlwwk', '.kkkkk.'] },
  arriba: { izq: ['kkkkkkk', 'GwwGGGk', 'GwgggGG', 'gllllgg', '.......', '.......'] },
  apretados: { izq: ['k......', '.kk....', '...kkk.', '.kk....', 'k......', '.......'] },
  confundidos: {
    izq: ['kkkkkk.', 'kGGGwwk', 'GgggwwG', 'Ggggggg', 'glllllg', '.lllll.'],
    der: ['.......', '.......', '.k.k.k.', 'k.k.k.k', '.......', '.......'],
  },
  lado: {
    izq: ['kkkkkk.', 'kwwGGGk', 'wwGgggG', 'wGggggg', 'wglllll', '.lllll.'],
    der: ['.kkkkkk', 'kwwGGGk', 'wwGgggG', 'wGggggg', 'wglllll', '.lllll.'],
  },
};

// --- Bocas (pequeñas, centradas) ---
const BOCAS = {
  sonrisa: ['m..m', '.mm.'],
  abierta: ['.mm.', 'mnnm', '.mm.'],
  media: ['.mm.', '.nn.'],
  grande: ['mmmm', 'mnnm', '.nn.'],
  o: ['.mm.', 'mnnm', '.mm.'],
  lado: ['..mm'],
  ondulada: ['m.m.', '.m.m'],
};

const EXPRESIONES = {
  normal: { ojos: 'normal', boca: 'sonrisa', habla: 'abierta' },
  pensando: { ojos: 'arriba', boca: 'lado', habla: 'media', simbolo: 'puntos' },
  contenta: { ojos: 'felices', boca: 'grande', habla: 'abierta', simbolo: 'brillo', rubor: true, libroArriba: true },
  apurada: { ojos: 'apretados', boca: 'ondulada', habla: 'grande', simbolo: 'gota', rubor: true },
  sorprendida: { ojos: 'abiertos', boca: 'o', habla: 'o', simbolo: 'exclamacion' },
  confundida: { ojos: 'confundidos', boca: 'ondulada', habla: 'media', simbolo: 'pregunta' },
  // reacciones al tocarla (duran un momento y vuelve a la expresión anterior)
  cosquillas: { ojos: 'felices', boca: 'grande', habla: 'abierta', simbolo: 'corazon', rubor: true },
  agobiada: { ojos: 'apretados', boca: 'grande', habla: 'grande', simbolo: 'gota', rubor: true },
};

export const NOMBRES_EXPRESION = {
  normal: 'tranquila',
  pensando: 'pensando',
  contenta: 'contenta',
  apurada: 'apurada',
  sorprendida: 'sorprendida',
  confundida: 'confundida',
};

// Emblema del libro.
const EMBLEMA = ['.oo.', 'oOOo', '.oo.'];

const SIMBOLOS = {
  pregunta: { x: 41, y: 0, mapa: ['.WWW.', 'W...W', '...W.', '..W..', '.....', '..W..'] },
  exclamacion: { x: 43, y: 0, mapa: ['WW', 'WW', 'WW', 'WW', '..', 'WW'] },
  brillo: { x: 41, y: 1, mapa: ['..y..', '..y..', 'yyyyy', '..y..', '..y..'] },
  gota: { x: 40, y: 14, mapa: ['.a.', 'aaa', 'aaa', '.a.'] },
  corazon: { x: 40, y: 2, mapa: ['rr.rr', 'rrrrr', 'rrrrr', '.rrr.', '..r..'] },
  puntos: { x: 35, y: 0, mapa: ['WW...WW...WW', 'WW...WW...WW'] },
};

// ---------------------------------------------------------------------------
// Rejilla de píxeles
// ---------------------------------------------------------------------------

class Rejilla {
  constructor(despY = 0) {
    this.p = new Array(ANCHO * ALTO).fill(null);
    this.ox = 0;
    this.oy = MARGEN_ARRIBA + despY;
  }

  con(dx, dy, fn) {
    this.ox += dx; this.oy += dy;
    fn();
    this.ox -= dx; this.oy -= dy;
  }

  punto(x, y, c) {
    x = Math.round(x) + this.ox;
    y = Math.round(y) + this.oy;
    if (x >= 0 && y >= 0 && x < ANCHO && y < ALTO) this.p[y * ANCHO + x] = c;
  }

  leer(x, y) {
    if (x < 0 || y < 0 || x >= ANCHO || y >= ALTO) return null;
    return this.p[y * ANCHO + x];
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.punto(x + i, y + j, c);
  }

  /** Elipse; «color» puede ser una función (dx, dy) → color, con dx/dy entre -1 y 1. */
  elipse(cx, cy, rx, ry, color, filtro = () => true) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && filtro(x, y)) {
          this.punto(x, y, typeof color === 'function' ? color(dx, dy) : color);
        }
      }
    }
  }

  /** Rectángulo de esquinas redondeadas (superelipse); «exp» alto = más cuadrado. */
  forma(cx, cy, rx, ry, exp, color, filtro = () => true) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (Math.abs(dx) ** exp + Math.abs(dy) ** exp <= 1 && filtro(x, y)) {
          this.punto(x, y, typeof color === 'function' ? color(dx, dy, x, y) : color);
        }
      }
    }
  }

  triangulo(ax, ay, bx, by, cx, cy, c) {
    const lado = (px, py, x1, y1, x2, y2) => (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
    for (let y = Math.floor(Math.min(ay, by, cy)); y <= Math.max(ay, by, cy); y++) {
      for (let x = Math.floor(Math.min(ax, bx, cx)); x <= Math.max(ax, bx, cx); x++) {
        const px = x + 0.5, py = y + 0.5;
        const d1 = lado(px, py, ax, ay, bx, by);
        const d2 = lado(px, py, bx, by, cx, cy);
        const d3 = lado(px, py, cx, cy, ax, ay);
        const neg = d1 < 0 || d2 < 0 || d3 < 0;
        const pos = d1 > 0 || d2 > 0 || d3 > 0;
        if (!(neg && pos)) this.punto(x, y, typeof c === 'function' ? c(x, y) : c);
      }
    }
  }

  mapa(x, y, filas, espejo = false) {
    filas.forEach((fila, j) => {
      const linea = espejo ? [...fila].reverse() : [...fila];
      linea.forEach((c, i) => { if (c !== '.') this.punto(x + i, y + j, c); });
    });
  }

  /** Sombra de la piel justo debajo del pelo (el flequillo «proyecta» sombra). */
  sombraBajoPelo() {
    for (let y = ALTO - 1; y > 0; y--) {
      for (let x = 0; x < ANCHO; x++) {
        if (this.leer(x, y) === 's' && ES_PELO.has(this.leer(x, y - 1))) this.p[y * ANCHO + x] = 'S';
      }
    }
  }

  /** Contorno exterior con el tono oscuro de cada zona. */
  contorno() {
    const copia = [...this.p];
    const vecinos = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (let y = 0; y < ALTO; y++) {
      for (let x = 0; x < ANCHO; x++) {
        if (copia[y * ANCHO + x]) continue;
        for (const [dx, dy] of vecinos) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= ANCHO || yy >= ALTO) continue;
          const c = copia[yy * ANCHO + xx];
          if (c) {
            this.p[y * ANCHO + x] = COLORES[c][1];
            break;
          }
        }
      }
    }
  }
}

const espejo = x => ANCHO - 1 - x;

// ---------------------------------------------------------------------------
// Partes del cuerpo
// ---------------------------------------------------------------------------

/** Melena larga: cae a los lados por detrás del cuerpo. */
function melena(r, e) {
  for (let y = 18; y <= 52; y++) {
    const t = (y - 18) / 34;
    const mover = Math.round(e.vaiven * t * t);
    for (const lado of [-1, 1]) {
      // cada lado es una cortina de pelo de unos 8 píxeles
      const exterior = lado < 0 ? 6 : 41;
      const ancho = 9 - Math.round(t * 2);
      for (let k = 0; k < ancho; k++) {
        const x = (lado < 0 ? exterior + k : exterior - k) + mover;
        const fin = 49 + ((x * 5) % 4);
        if (y > fin) continue;
        let c = 'h';
        if (k === 0) c = 'd';
        if ((x + 1) % 3 === 0) c = 'd';
        if (k >= ancho - 2) c = 'D';
        r.punto(x, y, c);
      }
    }
  }
}

function piernas(r) {
  r.rect(19, 52, 3, 3, 'v');
  r.rect(26, 52, 3, 3, 'v');
  r.rect(18, 55, 5, 3, 'e');
  r.rect(25, 55, 5, 3, 'e');
  r.rect(18, 55, 2, 1, 'E');
  r.rect(25, 55, 2, 1, 'E');
}

/**
 * Traje de la tutora: blusa blanca de mangas abullonadas,
 * corpiño negro con cordones, falda roja y delantal blanco bordado.
 */
function vestido(r, dy) {
  for (let y = 37; y <= 52; y++) {
    const extra = y < 45 ? 0 : Math.floor((y - 45) / 2);
    const x0 = 15 - extra;
    const x1 = espejo(15 - extra);
    const yy = y + (y < 45 ? dy : 0);
    for (let x = x0; x <= x1; x++) {
      let c;
      if (y < 45) {
        // corpiño negro con borde rojo y cordones dorados
        c = 'K';
        if (x === x0 || x === x1) c = 'r';
        if ((x === 22 || x === 25) && y % 2 === 0) c = 'o';
        if ((x === 23 || x === 24) && y % 2 === 1) c = 'o';
      } else {
        // falda roja y delantal blanco con bordado
        c = x <= x0 + 1 ? 'q' : x >= x1 - 1 ? 'R' : 'r';
        if (x >= 18 && x <= 29) c = x === 18 || x === 29 ? 'A' : 'c';
        if (x >= 18 && x <= 29 && y === 50 && x % 2 === 0) c = 'r';
        if (x >= 18 && x <= 29 && y === 51) c = 'g';
      }
      if (y === 52) c = 'R';
      r.punto(x, yy, c);
    }
  }
  // escote de la blusa blanca con cuello de encaje
  r.rect(19, 36 + dy, 10, 2, 'c');
  r.mapa(19, 38 + dy, ['c.c.c.c.c.']);
  // mangas abullonadas blancas
  r.rect(10, 37 + dy, 5, 6, 'c');
  r.rect(10, 37 + dy, 1, 6, 'A');
  r.rect(33, 37 + dy, 5, 6, 'c');
  r.rect(37, 37 + dy, 1, 6, 'A');
  r.rect(11, 43 + dy, 3, 1, 'r');
  r.rect(34, 43 + dy, 3, 1, 'r');
  // cuello
  r.rect(21, 34 + dy, 6, 2, 's');
  r.rect(21, 34 + dy, 6, 1, 'S');
}

/** Cinta roja con flores blancas en el pelo. */
function cinta(r) {
  for (let x = 12; x <= 35; x++) {
    const y = 9 + Math.round(((x - 23.5) / 12) ** 2 * 3);
    r.punto(x, y, x % 4 === 0 ? 'c' : 'r');
  }
}

/** El libro que sujeta con las dos manos (lo levanta al alegrarse). */
function libro(r, dy, arriba) {
  const y0 = 45 + dy - (arriba ? 3 : 0);
  r.rect(17, y0, 14, 5, 'L');
  r.rect(18, y0 + 1, 12, 3, 'M');
  r.rect(18, y0 + 4, 12, 1, 'P'); // páginas
  r.mapa(22, y0 + 1, EMBLEMA);
  // manos a los lados del libro
  r.rect(14, y0 + 1, 3, 3, 's');
  r.rect(31, y0 + 1, 3, 3, 's');
  r.punto(14, y0 + 3, 'S');
  r.punto(33, y0 + 3, 'S');
}

/** Cabeza grande y redonda, con flequillo recto y mechones que enmarcan la cara. */
function cabeza(r) {
  // masa de pelo
  r.forma(24, 21, 18.5, 19.5, 2.6, (dx, dy) => {
    if (dy < -0.55 && dx > -0.65 && dx < 0.2 && dy > -0.8) return 'H';
    if (dx * 0.7 + dy * 0.7 > 0.75) return 'D';
    if (dx > 0.55) return 'd';
    return 'h';
  });
  // cara ancha
  r.forma(24, 26, 13.5, 12, 2.4, (dx, dy) => (dy > 0.8 || dx > 0.85 ? 'S' : 's'));
  // flequillo recto con puntas suaves; raya ligeramente a la izquierda
  const bordeFlequillo = x => 18 + [0, 1, 1, 0, 1, 2, 1, 0, 1, 1, 0, 1, 2, 1, 0, 1][Math.abs(x - 10) % 16];
  for (let x = 10; x <= 37; x++) {
    for (let y = 8; y <= bordeFlequillo(x); y++) {
      const c = x === 21 ? 'd' : (x % 4 === 0 ? 'd' : 'h');
      r.punto(x, y, y < 11 && x > 14 && x < 22 ? 'H' : c);
    }
  }
  // mechones a los lados de la cara
  r.triangulo(9, 17, 15, 17, 11, 38, x => (x === 14 ? 'd' : 'h'));
  r.triangulo(espejo(9), 17, espejo(15), 17, espejo(11), 38, x => (x === espejo(14) ? 'D' : 'd'));
  cinta(r);
}

function cara(r, e) {
  const ex = EXPRESIONES[e.expresion] ?? EXPRESIONES.normal;
  let nombreOjos = ex.ojos;
  if (['normal', 'arriba', 'abiertos', 'confundidos'].includes(ex.ojos)) {
    if (e.parpadeo === 2) nombreOjos = 'cerrados';
    else if (e.parpadeo === 1) nombreOjos = 'medio';
    else if (e.mirarLado && ex.ojos === 'normal') nombreOjos = 'lado';
  }
  const ojos = OJOS[nombreOjos];
  r.mapa(14, 23, ojos.izq);
  if (ojos.der) r.mapa(27, 23, ojos.der);
  else r.mapa(27, 23, ojos.izq, true);

  // cejas finas
  r.rect(15, 21, 4, 1, 'B');
  r.rect(29, 21, 4, 1, 'B');

  // rubor suave con un brillito
  const alto = ex.rubor ? 2 : 1;
  r.rect(13, 30, 4, alto, 'b');
  r.rect(31, 30, 4, alto, 'b');

  const boca = BOCAS[e.boca === 2 ? ex.habla : e.boca === 1 ? 'media' : ex.boca];
  r.mapa(22, 31, boca);
}

function simbolo(r, e) {
  const nombre = EXPRESIONES[e.expresion]?.simbolo;
  if (!nombre || e.ocultarSimbolo) return;
  const s = SIMBOLOS[nombre];
  let mapa = s.mapa;
  if (nombre === 'puntos') mapa = s.mapa.map(fila => fila.slice(0, 2 + e.puntos * 5));
  r.mapa(s.x, s.y + e.simboloY, mapa);
}

function dibujar(e) {
  const r = new Rejilla(e.salto);
  const ex = EXPRESIONES[e.expresion] ?? EXPRESIONES.normal;
  r.con(e.temblor, 0, () => {
    r.con(e.cx, e.cy, () => melena(r, e));
    piernas(r);
    vestido(r, e.dy);
    r.con(e.cx, e.cy, () => {
      cabeza(r);
      cara(r, e);
    });
    libro(r, e.dy, ex.libroArriba);
    simbolo(r, e);
  });
  r.sombraBajoPelo();
  r.contorno();
  return r;
}

// ---------------------------------------------------------------------------
// Animación
// ---------------------------------------------------------------------------

function hexARgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const RGB = Object.fromEntries(Object.entries(COLORES).map(([k, [hex]]) => [k, hexARgb(hex)]));

// Movimientos especiales al cambiar de expresión.
const GESTOS = {
  contenta: { duracion: 700, salto: t => -Math.round(Math.sin(Math.min(t, 1) * Math.PI * 2) ** 2 * 2) },
  sorprendida: { duracion: 300, salto: t => (t < 1 ? -2 : 0) },
  apurada: { duracion: 500, temblor: t => (t < 1 ? (Math.floor(t * 10) % 2 ? 1 : -1) : 0) },
  cosquillas: { duracion: 600, salto: t => (t < 0.25 ? 1 : t < 0.6 ? -2 : 0) },
  agobiada: { duracion: 600, temblor: t => (t < 1 ? (Math.floor(t * 12) % 2 ? 1 : -1) : 0) },
};

export function crearSprite(canvas) {
  const ctx = canvas.getContext('2d');
  const imagen = ctx.createImageData(ANCHO, ALTO);
  const sprite = { expresion: 'normal', hablando: false };
  let reaccion = null; // { expresion, hasta }

  /** Reacción breve al tocarla; después vuelve a su expresión. */
  sprite.reaccionar = (expresion, duracion = 1400) => {
    reaccion = { expresion, hasta: performance.now() + duracion };
  };
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ahora0 = performance.now();
  const t = { parpadeo: ahora0 + 2000, finParpadeo: 0, mirar: ahora0 + 9000, finMirar: 0 };
  let expresionAnterior = 'normal';
  let inicioGesto = 0;
  let ultimaClave = '';
  let ultimoFotograma = 0;

  function pintar(rejilla) {
    const datos = imagen.data;
    rejilla.p.forEach((c, i) => {
      const o = i * 4;
      if (c) {
        const [rr, gg, bb] = RGB[c];
        datos[o] = rr; datos[o + 1] = gg; datos[o + 2] = bb; datos[o + 3] = 255;
      } else {
        datos[o + 3] = 0;
      }
    });
    ctx.putImageData(imagen, 0, 0);
  }

  function cada(nombre, ahora, duracion, minimo, variacion) {
    if (ahora > t[nombre]) {
      const fin = 'fin' + nombre[0].toUpperCase() + nombre.slice(1);
      t[fin] = ahora + duracion;
      t[nombre] = ahora + minimo + Math.random() * variacion;
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

    cada('parpadeo', ahora, 200, 2200, 3500);
    cada('mirar', ahora, 1400, 8000, 8000);

    // Parpadeo en dos pasos: medio cerrado → cerrado → medio cerrado.
    let parpadeo = 0;
    if (ahora < t.finParpadeo) {
      const queda = t.finParpadeo - ahora;
      parpadeo = queda > 150 || queda < 50 ? 1 : 2;
    }

    const respiracion = Math.sin(ahora / 650);
    const habla = sprite.hablando;
    let cx = 0;
    let cy = respiracion > 0.2 ? 1 : 0;
    if (expresion === 'pensando') cx = -1;
    if (expresion === 'confundida') cx = 1;
    if (habla && Math.floor(ahora / 260) % 3 === 0) cy += 1; // asiente al hablar

    const gesto = GESTOS[expresion];
    const progreso = gesto ? (ahora - inicioGesto) / gesto.duracion : 1;
    const mover = !sinMovimiento;

    const estado = {
      expresion,
      dy: respiracion > 0 ? 1 : 0,
      cx: mover ? cx : 0,
      cy: mover ? cy : 0,
      vaiven: mover ? Math.round(Math.sin(ahora / 1100) * 1.4) : 0,
      salto: mover && gesto?.salto ? gesto.salto(progreso) : 0,
      temblor: mover && gesto?.temblor ? gesto.temblor(progreso) : 0,
      parpadeo,
      mirarLado: ahora < t.finMirar && !habla,
      boca: habla ? [2, 1, 0, 2][Math.floor(ahora / 110) % 4] : 0,
      simboloY: mover ? Math.round(Math.sin(ahora / 300)) : 0,
      puntos: Math.floor(ahora / 450) % 3,
      ocultarSimbolo: ['contenta', 'cosquillas'].includes(expresion) && Math.floor(ahora / 400) % 2 === 1,
    };
    const clave = JSON.stringify(estado);
    if (clave === ultimaClave) return;
    ultimaClave = clave;
    pintar(dibujar(estado));
  }

  requestAnimationFrame(fotograma);
  return sprite;
}
