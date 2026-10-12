// Dibujo de la tutora en pixel art, hecho por código.
// Es el mismo personaje base que la tutora de las apps de chino y español (cabeza enorme, ojos grandes,
// cuerpo pequeño), con su propio diseño: melena negra muy larga y lisa con la raya en medio, una flor de
// loto en el pelo, ojos castaños, áo dài blanco (el uniforme de las estudiantes en Vietnam) con pantalón
// de seda, y su libro verde entre las manos.
// Se pinta en una rejilla de 48 × 56 con rectángulos de 1 píxel, se le añade el contorno y se vuelca
// centrada en el lienzo de 56 × 64 (el CSS lo amplía con image-rendering: pixelated).

export const ANCHO = 56;
export const ALTO = 64;

const W = 48;       // rejilla del dibujo
const H = 56;
const DX = 4;       // dónde cae la rejilla dentro del lienzo
const DY = 7;

const C = {
  o: '#1a1220', skin: '#fbe0cb', skinS: '#ecb99c', blush: '#f5a0a0',
  hair: '#352d4a', hairL: '#62578a', hairS: '#231d33', hairD: '#120e1a', // negro azulado: se distingue también sobre el fondo oscuro
  eyeG: '#7a4a2a', eyeD: '#33190c', eyeL: '#c48a52', white: '#ffffff',
  ao: '#fbfaf5', aoS: '#dcdfe8', aoD: '#b9bfd0', seda: '#e9ecf3', sedaS: '#c5cbdb',
  loto: '#f49ab8', lotoL: '#ffd0df', lotoD: '#d76890', hoja: '#6fa878',
  book: '#2f6a50', bookD: '#1c4332', bookL: '#44906e', page: '#f5edd4', gold: '#f0cc62', goldD: '#c79a2a',
  mouth: '#b9474f', mouthD: '#7c2432', tongue: '#f08a8f',
  shoe: '#3a2a44', shoeL: '#5b4569',
  drop: '#8fdcff', star: '#fff6a8',
};

let g;
const clear = () => { g = Array.from({ length: H }, () => Array(W).fill(null)); };
const R = (x, y, w, h, c) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < W && j >= 0 && j < H) g[j][i] = c;
};
const P = (x, y, c) => R(x, y, 1, 1, c);

function outline() {
  const add = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x]) continue;
    if ((y > 0 && g[y - 1][x]) || (y < H - 1 && g[y + 1][x]) || (x > 0 && g[y][x - 1]) || (x < W - 1 && g[y][x + 1])) add.push([x, y]);
  }
  add.forEach(([x, y]) => { g[y][x] = C.o; });
}

// Cabeza (y 2–35), que «respira» subiendo y bajando un píxel (bob), y cuerpo (y 34–55), que no se mueve.
function build(s) {
  const dy = s.bob, sw = s.sway;
  clear();
  const Rh = (x, y, w, h, c) => R(x, y + dy, w, h, c); // partes de la cabeza
  const Ph = (x, y, c) => Rh(x, y, 1, 1, c);

  // melena por detrás: muy larga y lisa, hasta la cintura; las puntas se mecen
  R(8, 32, 7, 15, C.hair); R(33, 32, 7, 15, C.hair);
  R(8, 32, 1, 15, C.hairS); R(39, 32, 1, 15, C.hairS);
  R(11, 34, 1, 11, C.hairL); R(36, 34, 1, 11, C.hairL);
  R(8 + sw, 47, 6, 2, C.hair); R(9 + sw, 49, 4, 1, C.hair);
  R(34 + sw, 47, 6, 2, C.hair); R(35 + sw, 49, 4, 1, C.hair);

  // cabeza grande y redonda (masa de pelo)
  for (const [y, x, w] of [[3, 16, 16], [4, 13, 22], [5, 11, 26], [6, 9, 30], [7, 8, 32]]) Rh(x, y, w, 1, C.hair);
  Rh(7, 8, 34, 20, C.hair); Rh(8, 28, 32, 3, C.hair); Rh(9, 31, 30, 2, C.hair); Rh(10, 33, 28, 1, C.hair);
  Rh(7, 10, 1, 18, C.hairS); Rh(40, 10, 1, 18, C.hairS);

  // pantalón de seda (ancho) y zapatos
  R(17, 50, 6, 3, C.seda); R(25, 50, 6, 3, C.seda);
  R(17, 50, 1, 3, C.sedaS); R(25, 50, 1, 3, C.sedaS); R(22, 51, 1, 2, C.sedaS); R(30, 51, 1, 2, C.sedaS);
  R(18, 53, 5, 2, C.shoe); R(25, 53, 5, 2, C.shoe); P(19, 53, C.shoeL); P(26, 53, C.shoeL);

  // cuello
  R(22, 33, 4, 3, C.skinS);

  // áo dài blanco: cuello alto, cierre cruzado, mangas largas y falda abierta por los lados
  R(16, 35, 16, 1, C.ao); R(15, 36, 18, 9, C.ao);
  R(14, 45, 20, 3, C.ao); R(13, 48, 22, 2, C.ao);               // la falda se abre hacia abajo
  R(15, 36, 1, 9, C.aoS); R(32, 36, 1, 9, C.aoS);               // sombra de los costados
  R(18, 46, 1, 4, C.aoS); R(29, 46, 1, 4, C.aoS); R(23, 47, 1, 3, C.aoS); // pliegues
  R(13, 49, 22, 1, C.lotoL);                                     // bajo, con un ribete rosa
  R(21, 34, 6, 2, C.ao); R(21, 35, 6, 1, C.aoS); R(21, 34, 6, 1, C.lotoL); P(23, 34, C.aoD); P(24, 34, C.aoD); // cuello alto
  for (let i = 0; i < 4; i++) P(25 + i, 36 + i, C.loto);         // cierre cruzado, ribeteado en rosa
  P(28, 39, C.lotoD);                                            // botoncito
  R(13, 37, 3, 6, C.ao); R(32, 37, 3, 6, C.ao); P(13, 37, C.white); P(34, 37, C.white); R(13, 42, 3, 1, C.lotoL); R(32, 42, 3, 1, C.lotoL); // mangas

  // libro verde con un loto dorado, entre las manos
  R(16, 38, 16, 7, C.o);
  R(17, 39, 14, 5, C.book); R(17, 39, 14, 1, C.bookL); R(17, 39, 2, 5, C.bookD); R(19, 43, 12, 1, C.page);
  P(24, 40, C.gold); R(23, 41, 3, 1, C.gold); P(22, 41, C.goldD); P(26, 41, C.goldD); R(23, 42, 3, 1, C.goldD);
  R(31, 41, 3, 3, C.skin); P(33, 43, C.skinS);
  R(14, 41, 3, 3, C.skin); P(14, 43, C.skinS);

  // cara
  for (const [y, x, w] of [[13, 14, 20], [14, 12, 24], [15, 12, 24]]) Rh(x, y, w, 1, C.skin);
  Rh(12, 16, 24, 14, C.skin); Rh(13, 30, 22, 1, C.skin); Rh(14, 31, 20, 1, C.skin); Rh(16, 32, 16, 1, C.skin); Rh(19, 33, 10, 1, C.skin);
  Rh(12, 16, 1, 13, C.skinS); Rh(35, 16, 1, 13, C.skinS); // sombra lateral

  // flequillo abierto, con la raya en medio: dos cortinas que dejan ver la frente
  Rh(11, 8, 26, 4, C.hair);
  Rh(12, 12, 10, 1, C.hair); Rh(12, 13, 8, 1, C.hair); Rh(12, 14, 6, 1, C.hair); Rh(12, 15, 4, 1, C.hair);
  Rh(26, 12, 10, 1, C.hair); Rh(28, 13, 8, 1, C.hair); Rh(30, 14, 6, 1, C.hair); Rh(32, 15, 4, 1, C.hair);
  Rh(22, 12, 4, 1, C.hair);                                              // la raya se cierra arriba: frente más pequeña
  Rh(23, 5, 2, 7, C.hairS);                                              // la raya
  Rh(13, 6, 8, 1, C.hairL); Rh(27, 6, 7, 1, C.hairL); Rh(11, 9, 3, 1, C.hairL); Rh(34, 9, 3, 1, C.hairL); // brillo
  Rh(14, 8, 6, 1, C.hairL); Rh(28, 8, 6, 1, C.hairL);                    // aro de brillo del pelo liso
  Rh(17, 10, 1, 3, C.hairS); Rh(30, 10, 1, 3, C.hairS);                  // mechones
  Rh(9, 13, 4, 19, C.hair); Rh(35, 13, 4, 19, C.hair);                   // mechones largos a los lados de la cara
  Rh(9, 13, 1, 19, C.hairS); Rh(38, 13, 1, 19, C.hairS); Rh(11, 16, 1, 13, C.hairL); Rh(36, 16, 1, 13, C.hairL);
  Rh(9, 32, 4, 3, C.hair); Rh(35, 32, 4, 3, C.hair);

  // flor de loto en el pelo (a su izquierda), con una hojita
  Rh(33, 8, 5, 3, C.loto); Ph(35, 7, C.loto); Ph(32, 9, C.loto); Ph(38, 9, C.loto);
  Ph(35, 8, C.lotoL); Rh(34, 9, 3, 1, C.lotoL); Ph(33, 10, C.lotoD); Ph(37, 10, C.lotoD); Ph(35, 10, C.gold);
  Rh(38, 11, 2, 1, C.hoja); Ph(39, 10, C.hoja);

  // ojos grandes
  const eye = (x, left, estado) => {
    const wing = left ? x - 1 : x + 6;
    if (estado === 'blink') { Rh(x, 22, 6, 1, C.o); Ph(wing, 21, C.o); return; }
    if (estado === 'happy') { Ph(x, 23, C.o); Ph(x + 1, 22, C.o); Rh(x + 2, 21, 2, 1, C.o); Ph(x + 4, 22, C.o); Ph(x + 5, 23, C.o); return; }
    // gesto de superioridad: con las cejas «smug» el párpado cae un píxel
    if (estado === 'open' && s.brow === 'smug') {
      Rh(x, 19, 6, 1, C.o); Ph(wing, 19, C.o); Ph(wing, 18, C.o);
      Rh(x, 20, 6, 5, C.eyeG); Rh(x, 20, 6, 1, C.eyeD); Rh(x + 1, 23, 4, 2, C.eyeL);
      Rh(x + 2, 21, 2, 2, C.eyeD); Rh(x + 1, 21, 1, 1, C.white); Ph(x + 2, 21, C.white); Ph(x + 4, 23, C.white);
      Rh(x + 1, 25, 4, 1, C.skinS);
      return;
    }
    Rh(x, 18, 6, 1, C.o); Ph(wing, 18, C.o); Ph(wing, 17, C.o); // pestañas
    if (estado === 'wide') {
      Rh(x, 19, 6, 6, C.white); Rh(x + 1, 20, 4, 4, C.eyeG); Rh(x + 2, 21, 2, 2, C.eyeD); Ph(x + 1, 20, C.white);
    } else {
      Rh(x, 19, 6, 6, C.eyeG); Rh(x, 19, 6, 2, C.eyeD); Rh(x + 1, 23, 4, 2, C.eyeL);
      Rh(x + 2, 21, 2, 2, C.eyeD);
      Rh(x + 1, 20, 2, 2, C.white); Ph(x + 4, 23, C.white); // brillos
    }
    Rh(x + 1, 25, 4, 1, C.skinS); // párpado inferior
  };
  eye(14, true, s.eyes);
  eye(28, false, s.eyesR ?? s.eyes); // en el guiño, este ojo va por su cuenta

  // cejas
  if (s.brow === 'smug') { Rh(14, 16, 2, 1, C.hairD); Rh(16, 17, 3, 1, C.hairD); Rh(32, 16, 2, 1, C.hairD); Rh(29, 17, 3, 1, C.hairD); }
  else if (s.brow === 'worry') { Rh(14, 17, 2, 1, C.hairD); Rh(16, 16, 3, 1, C.hairD); Rh(32, 17, 2, 1, C.hairD); Rh(29, 16, 3, 1, C.hairD); }
  else { Rh(14, 16, 5, 1, C.hairD); Rh(29, 16, 5, 1, C.hairD); }

  // mejillas y nariz
  Rh(12, 26, 3, 2, C.blush); Rh(33, 26, 3, 2, C.blush);
  if (s.fx === 'sparkle') { Ph(13, 26, '#ffc8c6'); Ph(34, 26, '#ffc8c6'); }
  Ph(24, 26, C.skinS);

  // boca pequeñita
  if (s.mouth === 'open') { Rh(22, 28, 4, 2, C.mouthD); Rh(23, 29, 2, 1, C.tongue); }
  else if (s.mouth === 'smile') { Rh(22, 29, 4, 1, C.mouth); Ph(21, 28, C.mouth); Ph(26, 28, C.mouth); }
  else if (s.mouth === 'flat') { Rh(22, 29, 3, 1, C.mouth); }
  else { Rh(22, 29, 3, 1, C.mouth); Ph(25, 28, C.mouth); } // sonrisa de superioridad

  outline();

  // efectos (sin contorno)
  if (s.fx === 'sparkle') {
    const star = (x, y, big) => { P(x, y, C.star); if (big) { P(x - 1, y, C.star); P(x + 1, y, C.star); P(x, y - 1, C.star); P(x, y + 1, C.star); } };
    star(4, 10, s.star); star(44, 5, !s.star); star(44, 30, s.star); star(4, 30, !s.star);
  }
  if (s.fx === 'sweat') {
    P(43, 13 + dy, C.drop); R(42, 14 + dy, 3, 2, C.drop); P(43, 16 + dy, C.drop); P(42, 15 + dy, C.white);
  }
}

// Cada expresión de la app es una combinación de ojos, cejas, boca y efecto.
const EXPRESIONES = {
  normal: { eyes: 'open', brow: 'smug', mouth: 'smirk' },
  pensando: { eyes: 'open', brow: 'flat', mouth: 'flat' },
  contenta: { eyes: 'happy', brow: 'flat', mouth: 'smile', fx: 'sparkle' },
  apurada: { eyes: 'wide', brow: 'worry', mouth: 'flat', fx: 'sweat' },
  guino: { eyes: 'open', eyesR: 'happy', brow: 'flat', mouth: 'smile' },
  sorprendida: { eyes: 'wide', brow: 'flat', mouth: 'open' },
};

/**
 * estado = { expresion: 'normal'|'pensando'|'contenta'|'apurada'|'guino'|'sorprendida',
 *            respiro: bool, parpadeo: bool, boca: bool (abierta al hablar), fase: 0|1 }
 */
export function dibujarSprite(ctx, estado) {
  const cara = { ...(EXPRESIONES[estado.expresion] ?? EXPRESIONES.normal) };
  const abierto = e => e === 'open' || e === 'wide';
  if (estado.parpadeo) {
    if (abierto(cara.eyes)) cara.eyes = 'blink';
    if (cara.eyesR && abierto(cara.eyesR)) cara.eyesR = 'blink';
    else if (!cara.eyesR) cara.eyesR = undefined;
  }
  if (estado.boca) cara.mouth = 'open';

  build({ ...cara, bob: estado.respiro ? 1 : 0, sway: estado.fase ? 1 : 0, star: estado.fase ? 1 : 0 });

  ctx.clearRect(0, 0, ANCHO, ALTO);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = g[y][x];
    if (c) { ctx.fillStyle = c; ctx.fillRect(x + DX, y + DY, 1, 1); }
  }
}
