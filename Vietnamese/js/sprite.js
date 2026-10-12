// Dibujo de la tutora en pixel art, píxel a píxel, en un lienzo de 56 x 64.
// Proporciones chibi: cabeza enorme, ojos grandes con brillos y cuerpo corto
// (se ve hasta el libro que lleva en brazos).
// Se pinta en una rejilla, se le añade un contorno de color (el del borde, oscurecido)
// y se vuelca al <canvas> (que el CSS amplía con image-rendering: pixelated).
// El eje de simetría está entre las columnas 27 y 28 (x ↔ 55 - x).

export const ANCHO = 56;
export const ALTO = 64;

const C = {
  pelo: '#3b2721', peloSombra: '#25160f', peloBrillo: '#70483a', peloLuz: '#a0715a',
  piel: '#fde6d4', pielSombra: '#f2c9b0', pielOscura: '#e2a98f',
  rubor: '#f39c9a', ruborClaro: '#f9c1bb',
  ojoOscuro: '#2b1510', irisAlto: '#4a2518', iris: '#7a4228', irisBajo: '#c3874f', blanco: '#ffffff',
  boca: '#a8473f', bocaDentro: '#6a2323', lengua: '#ef9a9a',
  aoDai: '#fbf5ea', aoDaiSombra: '#e7dac5', aoDaiOscuro: '#cbbba1',
  loto: '#f5a3bc', lotoClaro: '#ffd3df', lotoOscuro: '#d9708f', hoja: '#82ad7e', hojaOscura: '#5a8a5c',
  libro: '#2f6a50', libroSombra: '#22503c', libroLomo: '#183a2c', paginas: '#f3ead2', dorado: '#e8c46a',
  sudor: '#9ad6f2', sudorOscuro: '#4f9fd0', brillo: '#ffd75e',
};
const TINTA_CONTORNO = '#1c0f0c';

/**
 * estado = { expresion: 'normal'|'pensando'|'contenta'|'apurada'|'guino'|'sorprendida',
 *            respiro: bool, parpadeo: bool, boca: bool (abierta al hablar), fase: 0|1 }
 */
export function dibujarSprite(ctx, estado) {
  const g = new Array(ANCHO * ALTO).fill(null);
  const px = (x, y, c) => { if (x >= 0 && y >= 0 && x < ANCHO && y < ALTO) g[y * ANCHO + x] = c; };
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };
  // Simétricos: pintan también el reflejo en el otro lado
  const spx = (x, y, c) => { px(x, y, c); px(55 - x, y, c); };
  const srect = (x, y, w, h, c) => { rect(x, y, w, h, c); rect(56 - x - w, y, w, h, c); };
  const fila = (y, mitad, c) => {
    const x0 = Math.round(28 - mitad);
    rect(x0, y, Math.round(28 + mitad) - x0, 1, c);
  };
  const disco = (cy, rx, ry, c, yMax = Infinity) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry) && y <= yMax; y++) {
      const dy = (y + 0.5 - cy) / ry;
      if (Math.abs(dy) <= 1) fila(y, rx * Math.sqrt(1 - dy * dy), c);
    }
  };

  const ex = estado.expresion;
  const b = estado.respiro ? 1 : 0; // la cabeza baja 1 píxel al respirar

  // ===== Pelo de atrás (más oscuro, da profundidad) =====
  disco(25 + b, 21, 20, C.peloSombra);
  rect(7, 25 + b, 42, 39 - b, C.peloSombra);

  // ===== Cuerpo: áo dài =====
  for (let y = 40; y < ALTO; y++) {
    const m = 10 + Math.floor((y - 40) / 5);
    fila(y, m, C.aoDai);
    rect(28 - m, y, 2, 1, C.aoDaiSombra); // sombra del lado izquierdo
  }
  rect(22, 41, 12, 1, C.aoDaiSombra);                 // sombra bajo el cuello
  for (let i = 0; i < 5; i++) px(31 + i, 41 + i, C.aoDaiOscuro); // cierre cruzado
  rect(25, 36, 6, 3, C.pielSombra);                   // cuello
  rect(23, 38, 10, 2, C.aoDai);                       // cuello mandarín
  rect(23, 40, 10, 1, C.aoDaiSombra);
  // loto bordado
  px(16, 57, C.loto); px(15, 58, C.loto); px(16, 58, C.lotoClaro); px(17, 58, C.loto);
  rect(15, 59, 3, 1, C.lotoOscuro); rect(16, 60, 1, 4, C.hojaOscura);
  rect(17, 61, 3, 2, C.hoja); rect(13, 62, 3, 1, C.hoja);

  // Brazos (mangas) que van hacia el libro
  srect(14, 43, 5, 10, C.aoDai);
  px(14, 43, C.aoDaiSombra); rect(14, 44, 1, 9, C.aoDaiSombra);
  rect(41, 44, 1, 9, C.aoDaiSombra);
  srect(15, 47, 3, 1, C.aoDaiSombra); // pliegue de la manga

  // ===== Libro «Tiếng Việt» =====
  rect(18, 47, 20, 13, C.libro);
  rect(19, 47, 18, 1, C.paginas);
  rect(18, 47, 1, 13, C.libroLomo);
  rect(19, 59, 19, 1, C.libroSombra);
  rect(21, 49, 14, 1, C.dorado);
  rect(21, 57, 14, 1, C.dorado);
  rect(27, 51, 2, 1, C.dorado); rect(26, 52, 4, 1, C.dorado); rect(27, 53, 2, 1, C.dorado); // loto dorado
  rect(24, 55, 8, 1, C.libroSombra);
  // Manos
  srect(15, 50, 4, 4, C.piel);
  srect(15, 53, 4, 1, C.pielSombra);
  spx(17, 51, C.pielSombra);

  // ===== Cara (con barbilla) =====
  for (let y = 11 + b; y <= 39 + b; y++) {
    const dy = (y + 0.5 - (25.5 + b)) / 15;
    if (Math.abs(dy) > 1) continue;
    let m = 16.5 * Math.sqrt(1 - dy * dy);
    if (y - b > 31) m *= 1 - (y - b - 31) * 0.045;
    fila(y, m, C.piel);
  }
  fila(39 + b, 4, C.pielSombra); // sombra bajo la barbilla

  // ===== Flequillo =====
  disco(21 + b, 19.5, 13.5, C.pelo, 20 + b);
  for (const [x, w, h] of [[13, 3, 4], [16, 4, 3], [20, 4, 4], [24, 3, 2]]) srect(x, 21 + b, w, h, C.pelo);
  for (const x of [19, 24]) srect(x, 15 + b, 1, 6, C.peloSombra); // separación de mechones
  srect(20, 24 + b, 1, 1, C.peloSombra);
  // Aro de brillo
  for (let x = 14; x <= 41; x++) {
    if (x === 27 || x === 28 || x === 19 || x === 36) continue;
    const y = 13 + b + Math.round(((x + 0.5 - 28) / 14) ** 2 * 4);
    px(x, y, C.peloBrillo);
  }
  srect(20, 13 + b, 2, 1, C.peloLuz);
  rect(27, 8 + b, 2, 4, C.peloSombra); // raya al medio

  // Mechones laterales que caen sobre los hombros
  srect(9, 19 + b, 5, 34 - b, C.pelo);
  srect(10, 53, 3, 1, C.pelo); spx(11, 54, C.pelo);
  srect(10, 23 + b, 1, 18, C.peloBrillo);
  srect(13, 22 + b, 1, 30, C.peloSombra);

  // Horquilla de loto
  px(41, 10 + b, C.loto);
  px(40, 11 + b, C.loto); px(41, 11 + b, C.lotoClaro); px(42, 11 + b, C.loto);
  px(40, 12 + b, C.lotoOscuro); px(41, 12 + b, C.loto); px(42, 12 + b, C.lotoOscuro);
  px(39, 13 + b, C.hoja); px(43, 13 + b, C.hoja);

  // ===== Nariz y rubor =====
  px(28, 31 + b, C.pielOscura);
  const fuerte = ex === 'contenta' || ex === 'guino';
  srect(12, 31 + b, 5, 2, fuerte ? C.rubor : C.ruborClaro);
  for (const [x, y] of [[13, 32], [14, 31], [15, 32], [16, 31]]) spx(x, y + b, C.rubor);

  // ===== Ojos (el derecho es el espejo del izquierdo) =====
  for (const espejo of [false, true]) {
    const ox = (lx, y, c) => px(espejo ? 55 - (16 + lx) : 16 + lx, 24 + b + y, c);
    const orect = (lx, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) ox(lx + i, y + j, c); };
    const exOjo = ex === 'guino' ? (espejo ? 'normal' : 'contenta') : ex;
    ojo(ox, orect, exOjo, estado.parpadeo);
  }

  // ===== Boca =====
  boca(px, rect, 34 + b, ex, estado.boca);

  // ===== Contorno: el color del borde, oscurecido =====
  const final = g.slice();
  for (let y = 0; y < ALTO; y++) {
    for (let x = 0; x < ANCHO; x++) {
      if (g[y * ANCHO + x]) continue;
      const vecino = (y > 0 && g[(y - 1) * ANCHO + x]) || (y < ALTO - 1 && g[(y + 1) * ANCHO + x])
        || (x > 0 && g[y * ANCHO + x - 1]) || (x < ANCHO - 1 && g[y * ANCHO + x + 1]);
      if (vecino) final[y * ANCHO + x] = oscurecer(vecino);
    }
  }

  // ===== Extras de expresión (sin contorno) =====
  const fpx = (x, y, c) => { if (x >= 0 && y >= 0 && x < ANCHO && y < ALTO) final[y * ANCHO + x] = c; };
  if (ex === 'pensando') {
    const interrogacion = ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'];
    interrogacion.forEach((f, j) => [...f].forEach((ch, i) => { if (ch === '#') fpx(50 + i, 1 + j, C.dorado); }));
  }
  if (ex === 'apurada') {
    fpx(47, 15 + b, C.sudorOscuro);
    fpx(46, 16 + b, C.sudor); fpx(47, 16 + b, C.sudor); fpx(48, 16 + b, C.sudorOscuro);
    fpx(46, 17 + b, C.blanco); fpx(47, 17 + b, C.sudor); fpx(48, 17 + b, C.sudorOscuro);
    fpx(47, 18 + b, C.sudorOscuro);
  }
  if (ex === 'contenta' || ex === 'sorprendida') {
    const destellos = estado.fase ? [[3, 8], [52, 20], [50, 4]] : [[5, 3], [51, 10], [3, 22]];
    for (const [x, y] of destellos) {
      fpx(x, y, C.brillo); fpx(x - 1, y, C.brillo); fpx(x + 1, y, C.brillo); fpx(x, y - 1, C.brillo); fpx(x, y + 1, C.brillo);
    }
  }

  // ===== Volcar al canvas =====
  ctx.clearRect(0, 0, ANCHO, ALTO);
  for (let y = 0; y < ALTO; y++) {
    for (let x = 0; x < ANCHO; x++) {
      const c = final[y * ANCHO + x];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

const cacheOscuro = new Map();
function oscurecer(c) {
  if (!cacheOscuro.has(c)) cacheOscuro.set(c, mezclar(c, TINTA_CONTORNO, 0.65));
  return cacheOscuro.get(c);
}

function mezclar(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// Ojo de 6 x 7 en coordenadas locales (0,0 = esquina de arriba a la izquierda).
// Las columnas negativas son el rabito de las pestañas, hacia fuera.
function ojo(px, rect, ex, parpadeo) {
  if (ex === 'contenta') { // ojos ^ ^
    px(-1, 4, C.ojoOscuro); px(0, 3, C.ojoOscuro); px(1, 2, C.ojoOscuro); rect(2, 2, 2, 1, C.ojoOscuro);
    px(4, 2, C.ojoOscuro); px(5, 3, C.ojoOscuro);
    return;
  }
  if (parpadeo) {
    rect(-1, 4, 7, 1, C.ojoOscuro); px(-2, 3, C.ojoOscuro);
    return;
  }
  // pestañas con rabito
  px(-2, -1, C.ojoOscuro); px(-1, 0, C.ojoOscuro);
  rect(0, 0, 6, 1, C.ojoOscuro);

  if (ex === 'apurada' || ex === 'sorprendida') {
    rect(0, 1, 1, 5, C.ojoOscuro); rect(5, 1, 1, 5, C.ojoOscuro);
    rect(1, 1, 4, 5, C.blanco);
    rect(2, 2, 2, 3, ex === 'apurada' ? C.irisAlto : C.iris);
    if (ex === 'sorprendida') px(2, 2, C.blanco);
    rect(1, 6, 4, 1, C.ojoOscuro);
    return;
  }
  if (ex === 'pensando') { // entorna los ojos y mira hacia arriba, a un lado
    rect(0, 1, 6, 2, C.ojoOscuro);
    rect(0, 3, 1, 3, C.ojoOscuro); rect(5, 3, 1, 3, C.ojoOscuro);
    rect(1, 3, 4, 2, C.iris); rect(1, 5, 4, 1, C.irisBajo);
    rect(3, 3, 2, 1, C.blanco);
    rect(1, 6, 4, 1, C.pielOscura);
    return;
  }
  rect(0, 1, 6, 1, C.ojoOscuro);
  rect(0, 2, 1, 4, C.ojoOscuro); rect(5, 2, 1, 4, C.ojoOscuro);
  rect(1, 2, 4, 2, C.irisAlto);
  rect(1, 4, 4, 1, C.iris);
  rect(1, 5, 4, 1, C.irisBajo);
  rect(1, 6, 4, 1, C.pielOscura);
  rect(1, 2, 2, 2, C.blanco);
  px(4, 4, C.blanco);
}

function boca(px, rect, y, ex, abierta) {
  if (abierta) {
    const ancho = ex === 'contenta' || ex === 'guino' ? 6 : 4;
    rect(28 - ancho / 2, y, ancho, 2, C.bocaDentro);
    rect(27, y + 1, 2, 1, C.lengua);
    return;
  }
  if (ex === 'sorprendida') {
    rect(27, y - 1, 2, 3, C.bocaDentro);
  } else if (ex === 'contenta' || ex === 'guino') {
    rect(25, y, 6, 1, C.bocaDentro);
    rect(26, y + 1, 4, 1, C.bocaDentro);
    rect(27, y + 1, 2, 1, C.lengua);
  } else if (ex === 'pensando') {
    rect(28, y + 1, 3, 1, C.boca);
  } else if (ex === 'apurada') {
    for (let i = 0; i < 8; i++) px(24 + i, y + (i % 2), C.boca);
  } else {
    px(26, y, C.boca); rect(27, y + 1, 2, 1, C.boca); px(29, y, C.boca);
  }
}
