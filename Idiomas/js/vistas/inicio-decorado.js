// El decorado del escenario de la portada, en píxeles: la universidad del fondo, el sol, la luna y las nubes.
// Cada dibujo es una rejilla de letras; cada letra es un color, que pone css/inicio.css (de día y de noche).

const SVG = 'http://www.w3.org/2000/svg';

/** Una rejilla de letras en SVG: un trazo por letra, con la clase «<prefijo>-<letra>». */
function svg(rejilla, clase, prefijo) {
  const alto = rejilla.length;
  const ancho = rejilla[0].length;
  const dibujo = document.createElementNS(SVG, 'svg');
  dibujo.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  dibujo.setAttribute('class', clase);
  dibujo.setAttribute('shape-rendering', 'crispEdges');
  dibujo.setAttribute('aria-hidden', 'true');
  const trazos = {};
  rejilla.forEach((fila, y) => [...fila].forEach((c, x) => {
    if (c && c !== '.') trazos[c] = (trazos[c] ?? '') + `M${x} ${y}h1v1h-1z`;
  }));
  for (const [c, d] of Object.entries(trazos)) {
    const ruta = document.createElementNS(SVG, 'path');
    ruta.setAttribute('d', d);
    ruta.setAttribute('class', `${prefijo}-${c}`);
    dibujo.append(ruta);
  }
  return dibujo;
}

// ---------------------------------------------------------------------------
// La universidad: fachada clásica con columnas, frontón, torre del reloj con bandera, dos alas y árboles.
// Letras: a muro · b muro en sombra · c molduras · r tejado · w ventana · x ventana que parpadea de noche
// d puerta · o esfera del reloj · e escalones · t copa · u copa en sombra · n tronco · f bandera · p mástil · k contorno
// ---------------------------------------------------------------------------
const ANCHO = 200;
const OX = 36; // el edificio principal va en el centro; a los lados, dos pabellones más bajos
const ALTO = 76;

function rejillaUniversidad() {
  const g = Array.from({ length: ALTO }, () => Array(ANCHO).fill('.'));
  let ox = 0;
  const R = (x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x + ox; i < x + ox + w; i++) if (i >= 0 && i < ANCHO && j >= 0 && j < ALTO) g[j][i] = c;
  };
  const ventana = (x, y, w, h, c = 'w') => { R(x + 1, y, w - 2, 1, c); R(x, y + 1, w, h - 1, c); R(x - 1, y + h, w + 2, 1, 'c'); };

  // los pabellones de los lados: una planta, tejado a dos aguas y una fila de ventanas
  for (const x0 of [4, 162]) {
    for (let i = 0; i < 5; i++) R(x0 + 4 - i, 42 + i, 26 + i * 2, 1, 'r');
    R(x0 - 2, 47, 38, 2, 'c');
    R(x0, 49, 34, 21, 'a');
    for (const vx of [4, 12, 20, 27]) ventana(x0 + vx, 53, 3, 7, (vx + x0) % 4 ? 'w' : 'x');
    R(x0, 66, 34, 4, 'b');
  }
  ox = OX;

  // la torre del reloj (detrás del frontón), con su aguja, mástil y bandera
  R(63, 0, 1, 7, 'p');
  R(64, 0, 5, 3, 'f');
  for (let i = 0; i < 6; i++) R(64 - 1 - i * 2, 6 + i, 2 + i * 4, 1, 'r');
  R(55, 12, 18, 1, 'c');
  R(56, 13, 16, 14, 'a');
  R(56, 13, 2, 14, 'b');
  ventana(62, 14, 4, 4, 'x'); // la ventanita del campanario

  // las dos alas, con tejado a cuatro aguas, cornisa, dos filas de ventanas y zócalo
  for (const x0 of [12, 80]) {
    for (let i = 0; i < 5; i++) R(x0 + 5 - i, 30 + i, 26 + i * 2, 1, 'r');
    R(x0 - 2, 35, 40, 2, 'c');
    R(x0, 37, 36, 33, 'a');
    R(x0 + (x0 < 64 ? 0 : 33), 37, 3, 33, 'b');
    for (const vx of [4, 12, 20, 28]) {
      ventana(x0 + vx, 41, 4, 7, (vx + x0) % 3 ? 'w' : 'x');
      ventana(x0 + vx, 53, 4, 7, (vx + x0) % 5 ? 'w' : 'x');
    }
    R(x0, 66, 36, 4, 'b');
  }

  // el cuerpo central: frontón escalonado, entablamento, seis columnas y la puerta en arco
  R(44, 31, 40, 39, 'a');
  for (let i = 0; i < 12; i++) R(64 - 4 - i * 2, 18 + i, 8 + i * 4, 1, 'r');
  // el reloj, en medio del frontón: esfera redonda y agujas
  R(61, 20, 6, 8, 'o'); R(60, 21, 8, 6, 'o');
  R(63, 21, 1, 3, 'k'); R(64, 23, 2, 1, 'k');
  R(42, 30, 44, 3, 'c');
  R(44, 33, 40, 31, 'b');
  for (let i = 0; i < 6; i++) {
    const x = 45 + i * 7;
    R(x - 1, 33, 5, 1, 'c'); R(x, 34, 3, 28, 'c'); R(x - 1, 62, 5, 1, 'c');
  }
  for (const x of [48, 55, 69, 76]) { ventana(x, 37, 4, 8, x === 55 ? 'x' : 'w'); ventana(x, 50, 4, 9); }
  R(63, 46, 2, 1, 'd'); R(62, 47, 4, 16, 'd');

  // la escalinata
  R(42, 63, 44, 2, 'e'); R(39, 65, 50, 2, 'e'); R(36, 67, 56, 3, 'e');
  R(42, 64, 44, 1, 'c'); R(39, 66, 50, 1, 'c');

  // árboles entre los edificios y en las puntas
  ox = 0;
  for (const cx of [41, 158, 2, 197]) {
    for (const [dy, hw] of [[0, 3], [1, 5], [2, 6], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 6], [9, 5], [10, 3]]) R(cx - hw, 50 + dy, hw * 2 + 1, 1, 't');
    R(cx + 1, 56, 5, 3, 'u'); R(cx - 3, 58, 7, 2, 'u');
    R(cx - 1, 61, 3, 9, 'n');
  }

  // contorno automático, como en las tutoras
  const borde = [];
  for (let y = 0; y < ALTO; y++) for (let x = 0; x < ANCHO; x++) {
    if (g[y][x] !== '.') continue;
    const lleno = (i, j) => g[j]?.[i] && g[j][i] !== '.' && g[j][i] !== 'k';
    if (lleno(x - 1, y) || lleno(x + 1, y) || lleno(x, y - 1) || lleno(x, y + 1)) borde.push([x, y]);
  }
  for (const [x, y] of borde) g[y][x] = 'k';
  return g;
}

let guardada = null;
export function universidad() {
  guardada ??= rejillaUniversidad();
  return svg(guardada, 'inicio-universidad', 'u');
}

// ---------------------------------------------------------------------------
// El sol (dos fotogramas de rayos que se turnan), la luna y las nubes
// ---------------------------------------------------------------------------
const SOL = [
  [
    '.......s.......',
    '.......s.......',
    '..s....s....s..',
    '...s.......s...',
    '.....aaaaa.....',
    '....aaaaaaa....',
    '...aaaaaaaaa...',
    'ss.aaaaaaaaa.ss',
    '...aaaaaaaaa...',
    '....aaaaaaa....',
    '.....aaaaa.....',
    '...s.......s...',
    '..s....s....s..',
    '.......s.......',
    '.......s.......',
  ],
  [
    '...............',
    '....s.....s....',
    '.....s...s.....',
    '...............',
    '.s...aaaaa...s.',
    '..s.aaaaaaa.s..',
    '...aaaaaaaaa...',
    '...aaaaaaaaa...',
    '...aaaaaaaaa...',
    '..s.aaaaaaa.s..',
    '.s...aaaaa...s.',
    '...............',
    '.....s...s.....',
    '....s.....s....',
    '...............',
  ],
].map(f => f.map(fila => fila.padEnd(16, '.').slice(0, 15)));

const LUNA = [
  '....kkkk..',
  '..kkllkk..',
  '.kllllk...',
  '.klllk....',
  'kllllk....',
  'kllllk....',
  'klllllk...',
  '.kllllllkk',
  '.klllllllk',
  '..kkllllk.',
  '....kkkk..',
];

const NUBES = [
  [
    '......kkkk..........',
    '....kkbbbbkk.kkk....',
    '...kbbbbbbbbkbbbk...',
    '.kkbbbbbbbbbbbbbbkk.',
    'kbbbbbbbbbbbbbbbbbbk',
    'kssssssssssssssssssk',
    '.kkkkkkkkkkkkkkkkkk.',
  ],
  [
    '.....kkkk.....',
    '..kkkbbbbk....',
    '.kbbbbbbbbkkk.',
    'kbbbbbbbbbbbbk',
    'kssssssssssssk',
    '.kkkkkkkkkkkk.',
  ],
];

export function sol() {
  const caja = document.createElement('div');
  caja.className = 'inicio-sol';
  caja.setAttribute('aria-hidden', 'true');
  caja.append(svg(SOL[0], 'sol-a', 's'), svg(SOL[1], 'sol-b', 's'));
  return caja;
}

export function luna() {
  return svg(LUNA, 'inicio-luna', 'l');
}

/** Las nubes del día: cada una a su altura y a su velocidad. */
export function nubes() {
  const caja = document.createElement('div');
  caja.className = 'inicio-nubes';
  caja.setAttribute('aria-hidden', 'true');
  [[0, 12, 0], [1, 34, 1], [0, 54, 2], [1, 22, 3]].forEach(([forma, alto, n]) => {
    const nube = svg(NUBES[forma], `inicio-nube nube-${n}`, 'n');
    nube.style.top = `${alto}%`;
    caja.append(nube);
  });
  return caja;
}

// ---------------------------------------------------------------------------
// El pasillo: macetas, apliques de pared, banderines y los ventanales de las puntas.
// A las rejillas sin contorno se lo pone conContorno() (k), como a las tutoras.
// ---------------------------------------------------------------------------
function conContorno(filas) {
  const g = filas.map(f => [...f]);
  const ancho = Math.max(...g.map(f => f.length));
  // un píxel de margen alrededor, para que quepa el contorno
  const m = [Array(ancho + 2).fill('.'), ...g.map(f => ['.', ...f, ...Array(ancho - f.length).fill('.'), '.']), Array(ancho + 2).fill('.')];
  const lleno = (x, y) => m[y]?.[x] && m[y][x] !== '.' && m[y][x] !== 'k';
  const borde = [];
  m.forEach((fila, y) => fila.forEach((c, x) => {
    if (c === '.' && (lleno(x - 1, y) || lleno(x + 1, y) || lleno(x, y - 1) || lleno(x, y + 1))) borde.push([x, y]);
  }));
  for (const [x, y] of borde) m[y][x] = 'k';
  return m;
}

// h hoja · g hoja oscura · c cactus · d cactus en sombra · f flor · e flor clara · r borde de la maceta · m maceta · q maceta en sombra
const MACETAS = [
  [ // helecho
    '......h.......',
    '...h..h..h....',
    '....h.hh.h..h.',
    '.h...hhhhh.h..',
    '..hh.hghgh.h..',
    '...hhhgggghh..',
    '.hhhgghhgghhh.',
    '..hhghhhhgghh.',
    '...hhhghhhh...',
    '.....hhhh.....',
    '..rrrrrrrrrr..',
    '..rmmmmmmmmr..',
    '...mmmmmmmq...',
    '...mmmmmmmq...',
    '....mmmmmq....',
    '....qqqqqq....',
  ],
  [ // cactus con flor
    '......ff......',
    '.....feef.....',
    '.....cddc.....',
    '.....cddc..c..',
    '..c..cddc.cc..',
    '..cc.cddc.cd..',
    '..dc.cddc.cd..',
    '..dccccddccd..',
    '...ddccddcd...',
    '......cddc....',
    '..rrrrrrrrrr..',
    '..rmmmmmmmmr..',
    '...mmmmmmmq...',
    '...mmmmmmmq...',
    '....mmmmmq....',
    '....qqqqqq....',
  ],
  [ // tulipanes
    '..ff....ee....',
    '.feef..eeee...',
    '.ffff..eeee.f.',
    '..ff....ee.fef',
    '..g..g..g..fff',
    '..g.hg..g...g.',
    '..ghhg.hg..hg.',
    '...gg.hhg.hg..',
    '....g..gghg...',
    '....hhhggh....',
    '..rrrrrrrrrr..',
    '..rmmmmmmmmr..',
    '...mmmmmmmq...',
    '...mmmmmmmq...',
    '....mmmmmq....',
    '....qqqqqq....',
  ],
].map(conContorno);

export function maceta(n) {
  return svg(MACETAS[n % MACETAS.length], `pasillo-maceta maceta-${n % MACETAS.length}`, 'm');
}

// la pantalla de la lámpara (o), la bombilla (y) y el brazo de latón (b)
const APLIQUE = conContorno([
  '...oooo...',
  '..oooooo..',
  '.oooooooo.',
  'oooooooooo',
  '.yyyyyyyy.',
  '..yyyyyy..',
  '....bb....',
  '....bb....',
  '...bbbb...',
  '..bbbbbb..',
]);
export function aplique() {
  const caja = document.createElement('span');
  caja.className = 'pasillo-aplique';
  caja.setAttribute('aria-hidden', 'true');
  caja.append(svg(APLIQUE, 'aplique-dibujo', 'a'));
  return caja;
}

/** El ventanal en arco de las puntas del pasillo: dentro se ve el cielo (nubes de día, estrellas de noche). */
function rejillaVentanal() {
  const W = 22;
  const H = 42;
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  const cx = 10.5;
  for (let y = 0; y < H - 3; y++) for (let x = 0; x < W; x++) {
    const dentro = (r, lado) => (y >= 11 ? x >= lado && x < W - lado : (x - cx) ** 2 + (y - 11) ** 2 <= r * r);
    if (dentro(10.6, 0)) g[y][x] = 'f';
    if (dentro(8.4, 2) && y >= 3) g[y][x] = 'v';
  }
  for (let y = 3; y < H - 3; y++) { g[y][10] = 'f'; g[y][11] = 'f'; }
  for (const y of [21, 22, 30, 31]) for (let x = 2; x < W - 2; x++) g[y][x] = 'f';
  for (const [x, y] of [[6, 7], [14, 9], [4, 16], [16, 18], [7, 26], [15, 27], [5, 35], [13, 36]]) if (g[y][x] === 'v') g[y][x] = 's';
  for (const [x, y, w] of [[4, 13, 5], [3, 14, 6], [13, 24, 5], [12, 25, 7]]) for (let i = 0; i < w; i++) if (g[y][x + i] === 'v') g[y][x + i] = 'n';
  for (let x = 0; x < W; x++) { g[H - 3][x] = 'r'; g[H - 2][x] = 'r'; }
  return conContorno(g.map(f => f.join('')));
}
let ventanal = null;
export function ventana(lado) {
  ventanal ??= rejillaVentanal();
  return svg(ventanal, `pasillo-ventana ventana-${lado}`, 'v');
}

/** La guirnalda de banderines bajo el techo: uno detrás de otro, de colores. */
export function banderines(cuantos = 64) {
  const caja = document.createElement('div');
  caja.className = 'pasillo-banderines';
  caja.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < cuantos; i++) {
    const b = document.createElement('i');
    b.style.setProperty('--n', String(i % 6));
    caja.append(b);
  }
  return caja;
}

// ---------------------------------------------------------------------------
// El mercado nocturno (como los de Taiwán) detrás de la pancarta: una fila de puestos con toldo de rayas,
// cartel con su dibujo, bombillas, mostrador y lo que venden, con árboles entre medias.
// Letras: p poste/madera oscura · c mostrador · C borde del mostrador · v fondo del puesto · y bombilla
// 1/2 rayas del toldo (cada puesto lleva sus colores: a-b, d-e, f-g, h-i) · S cartel · Z dibujo del cartel
// m olla · w cuenco/vaso · n té · o brocheta · s vapor · t copa · u copa en sombra · q tronco · k contorno
// ---------------------------------------------------------------------------
const M_ANCHO = 640;
const M_ALTO = 64;

// los dibujos de los carteles (7 × 6): té con perlas, baozi, brocheta y cuenco de fideos
const CARTELES = [
  ['.ZZZZZ.', '..Z.Z..', '.ZZZZZ.', '.Z.Z.Z.', '.ZZZZZ.', '..ZZZ..'],
  ['...Z...', '..ZZZ..', '.ZZZZZ.', 'ZZ.Z.ZZ', 'ZZZZZZZ', '.ZZZZZ.'],
  ['Z......', '.ZZ....', '.ZZZ...', '...ZZ..', '....ZZ.', '......Z'],
  ['.Z..Z..', '..Z..Z.', 'ZZZZZZZ', 'Z.....Z', '.Z...Z.', '..ZZZ..'],
];
const RAYAS = [['a', 'b'], ['d', 'e'], ['f', 'g'], ['h', 'i']];

function rejillaMercado() {
  const g = Array.from({ length: M_ALTO }, () => Array(M_ANCHO).fill('.'));
  const R = (x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < M_ANCHO && j >= 0 && j < M_ALTO) g[j][i] = c;
  };
  const arbol = cx => {
    for (const [dy, hw] of [[0, 4], [1, 6], [2, 7], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 7], [9, 6], [10, 4]]) R(cx - hw, 30 + dy, hw * 2 + 1, 1, 't');
    R(cx + 1, 36, 6, 3, 'u'); R(cx - 4, 38, 9, 2, 'u');
    R(cx - 1, 41, 3, 23, 'q');
    // el gato, sentado junto al tronco
    R(cx + 3, 58, 1, 1, 'G'); R(cx + 6, 58, 1, 1, 'G'); R(cx + 3, 59, 4, 3, 'G'); R(cx + 3, 62, 6, 2, 'G'); R(cx + 9, 60, 1, 3, 'G');
    R(cx + 4, 60, 1, 1, 'k'); R(cx + 6, 60, 1, 1, 'k');
  };
  const puesto = (x0, n) => {
    const [c1, c2] = RAYAS[n % RAYAS.length];
    // postes y el fondo del puesto
    R(x0 + 2, 12, 2, 52, 'p'); R(x0 + 50, 12, 2, 52, 'p');
    R(x0 + 4, 22, 46, 24, 'v');
    // el cartel de arriba, con su dibujo
    R(x0 + 15, 1, 24, 10, 'S'); R(x0 + 26, 11, 2, 2, 'p');
    CARTELES[n % CARTELES.length].forEach((fila, j) => [...fila].forEach((c, i) => { if (c === 'Z') g[3 + j][x0 + 23 + i] = 'Z'; }));
    // el toldo de rayas con el borde en ondas
    for (let x = 0; x < 54; x++) {
      const c = Math.floor(x / 4) % 2 ? c2 : c1;
      R(x0 + x, 13, 1, 7, c);
      if (x % 8 >= 1 && x % 8 <= 6) R(x0 + x, 20, 1, 1, c);
      if (x % 8 >= 2 && x % 8 <= 5) R(x0 + x, 21, 1, 1, c);
    }
    R(x0, 12, 54, 1, c2);
    // bombillas colgando
    for (const bx of [14, 39]) { R(x0 + bx, 22, 1, 2, 'p'); R(x0 + bx - 1, 24, 3, 2, 'y'); }
    // el vendedor (o la vendedora), asomando detrás del mostrador: pelo, cara, camiseta y delantal
    {
      const vx = x0 + [30, 32, 26, 28][n % 4];
      const pelo = n % 3 === 0 ? 'r' : n % 3 === 1 ? 'R' : 'P';
      R(vx + 1, 27, 6, 2, pelo); R(vx, 29, 8, 1, pelo);
      R(vx + 1, 30, 6, 5, 'H'); R(vx, 30, 1, 3, pelo); R(vx + 7, 30, 1, 3, pelo);
      R(vx + 2, 32, 1, 1, 'k'); R(vx + 5, 32, 1, 1, 'k');
      if (n % 2) R(vx, 26, 8, 1, 'W'); // el gorrito de cocinero
      R(vx - 1, 35, 10, 9, n % 2 ? 'J' : 'j'); R(vx + 2, 37, 4, 7, 'W');
    }
    // lo que venden, encima del mostrador
    const sobre = 44;
    if (n % 4 === 0) { // tés con perlas
      for (const vx of [8, 15, 22, 29, 36]) { R(x0 + vx, sobre - 6, 4, 6, 'w'); R(x0 + vx, sobre - 3, 4, 3, 'n'); R(x0 + vx + 2, sobre - 9, 1, 3, 'o'); }
    } else if (n % 4 === 1) { // la olla al vapor y cestas de baozi
      R(x0 + 8, sobre - 8, 14, 8, 'm'); R(x0 + 7, sobre - 9, 16, 1, 'm');
      for (const [sx, sy] of [[11, 12], [16, 15], [13, 18], [18, 20]]) R(x0 + sx, sobre - sy, 2, 2, 's');
      for (const bx of [28, 37]) { R(x0 + bx, sobre - 4, 7, 4, 'w'); R(x0 + bx + 1, sobre - 6, 5, 2, 'w'); }
    } else if (n % 4 === 2) { // brochetas
      for (let k = 0; k < 7; k++) { R(x0 + 8 + k * 5, sobre - 10, 1, 10, 'p'); R(x0 + 7 + k * 5, sobre - 9, 3, 5, 'o'); }
    } else { // cuencos de fideos humeantes
      for (const bx of [8, 22, 36]) {
        R(x0 + bx, sobre - 4, 9, 4, 'w'); R(x0 + bx + 1, sobre - 5, 7, 1, 'n');
        R(x0 + bx + 3, sobre - 10, 1, 2, 's'); R(x0 + bx + 5, sobre - 13, 1, 2, 's');
      }
    }
    // el mostrador
    R(x0 + 1, sobre, 52, 20, 'c'); R(x0 + 1, sobre, 52, 2, 'C');
    for (const lx of [12, 24, 36]) R(x0 + lx, sobre + 4, 1, 16, 'p');
    R(x0 + 40, sobre + 6, 9, 6, 'w'); // la tablilla de precios
    R(x0 + 42, sobre + 8, 5, 1, 'p'); R(x0 + 42, sobre + 10, 3, 1, 'p');
  };
  let x = 2;
  let n = 0;
  while (x < M_ANCHO) {
    puesto(x, n);
    x += 56;
    n++;
    if (n % 2 === 0) { arbol(x + 9); x += 20; }
  }
  // contorno
  const borde = [];
  for (let y = 0; y < M_ALTO; y++) for (let x2 = 0; x2 < M_ANCHO; x2++) {
    if (g[y][x2] !== '.') continue;
    const lleno = (i, j) => g[j]?.[i] && g[j][i] !== '.' && g[j][i] !== 'k';
    if (lleno(x2 - 1, y) || lleno(x2 + 1, y) || lleno(x2, y - 1) || lleno(x2, y + 1)) borde.push([x2, y]);
  }
  for (const [i, j] of borde) g[j][i] = 'k';
  return g;
}
let mercadoGuardado = null;
export function mercado() {
  mercadoGuardado ??= rejillaMercado();
  return svg(mercadoGuardado, 'inicio-mercado', 'x');
}

// El farolillo rojo (cuerpo r, brillo l, tapas o, borla t)
const FAROLILLO = conContorno([
  '..oooo..',
  '.rrrrrr.',
  'rrlrrrrr',
  'rlrrrrrr',
  'rrrrrrrr',
  'rrrrrrrr',
  '.rrrrrr.',
  '..oooo..',
  '...tt...',
  '...tt...',
]);
/** La guirnalda de farolillos de lado a lado. */
export function farolillos(cuantos = 30) {
  const caja = document.createElement('div');
  caja.className = 'mercado-farolillos';
  caja.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < cuantos; i++) {
    const f = svg(FAROLILLO, 'farolillo', 'f');
    f.style.setProperty('--i', String(i));
    caja.append(f);
  }
  return caja;
}

// ---------------------------------------------------------------------------
// La gente que pasea por el mercado: de perfil, con dos fotogramas de pasos que se turnan.
// r pelo · H piel · B camiseta · P pantalón · s zapatos · w vaso de té · n té · k contorno
// ---------------------------------------------------------------------------
const PASEANTE = [
  [
    '...rrrr...',
    '..rrrrrr..',
    '..rHHHHr..',
    '..rHHHkH..',
    '...HHHH...',
    '....HH....',
    '...BBBB...',
    '..BBBBBB..',
    '..BBBBBHww',
    '..BBBBBBnn',
    '...PPPP...',
    '...PP.PP..',
    '..PP...PP.',
    '..ss...ss.',
  ],
  [
    '...rrrr...',
    '..rrrrrr..',
    '..rHHHHr..',
    '..rHHHkH..',
    '...HHHH...',
    '....HH....',
    '...BBBB...',
    '..BBBBBB..',
    '..BBBBBHww',
    '..BBBBBBnn',
    '...PPPP...',
    '....PP....',
    '....PP....',
    '....ss....',
  ],
].map(conContorno);

/** Unos cuantos paseantes, cada uno a su ritmo y en su sentido. */
export function paseantes() {
  const caja = document.createElement('div');
  caja.className = 'mercado-paseantes';
  caja.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i++) {
    const quien = document.createElement('div');
    quien.className = `paseante paseante-${i}`;
    quien.append(svg(PASEANTE[0], 'paso-a', 'z'), svg(PASEANTE[1], 'paso-b', 'z'));
    caja.append(quien);
  }
  return caja;
}

/**
 * La curva de la tela: la pancarta cuelga de las puntas de los palos y se comba por el centro.
 * Devuelve los polígonos (a escalones de 3 px) para la tela y para sus flecos.
 */
export function curvaDeTela(comba = 27, tramos = 20, flecos = 10) {
  const ys = Array.from({ length: tramos }, (_, i) => {
    const m = (i + 0.5) / tramos;
    return Math.round((comba * (1 - (2 * m - 1) ** 2)) / 3) * 3;
  });
  const x = i => `${((i / tramos) * 100).toFixed(3)}%`;
  const arriba = ys.flatMap((y, i) => [`${x(i)} ${y}px`, `${x(i + 1)} ${y}px`]);
  const abajo = (extra = 0) => ys.map((y, i) => [`${x(i + 1)} calc(100% - ${comba - y - extra}px)`, `${x(i)} calc(100% - ${comba - y - extra}px)`]).reverse().flat();
  const tela = `polygon(${[...arriba, ...abajo()].join(', ')})`;
  // los flecos van en una caja igual que la tela pero unos píxeles más alta: una franja que sigue su borde de abajo
  const borde = extra => ys.map((y, i) => [`${x(i)} calc(100% - ${comba - y + extra}px)`, `${x(i + 1)} calc(100% - ${comba - y + extra}px)`]).flat();
  const flecosPoligono = `polygon(${[...borde(flecos), ...borde(0).reverse()].join(', ')})`;
  return { tela, flecos: flecosPoligono };
}

// ---------------------------------------------------------------------------
// El horizonte del pie: siluetas de monumentos de los países de los idiomas sobre unas colinas
// (Big Ben, torre Eiffel, Coliseo, pagoda, Sagrada Familia · cúpulas de Moscú, molino holandés,
// Partenón, estupa tailandesa y Santa Sofía). En el centro, donde va el logotipo, solo colinas.
// Letras: a silueta · b silueta en sombra · w ventana (de noche, encendida) · h colina · g colina de atrás · k contorno
// ---------------------------------------------------------------------------
const H_ANCHO = 360;
const H_ALTO = 56;
export const MOLINO = { x: 271, y: 22 }; // dónde va el eje de las aspas del molino (en píxeles del dibujo)

function rejillaHorizonte() {
  const g = Array.from({ length: H_ALTO }, () => Array(H_ANCHO).fill('.'));
  const R = (x, y, w, h, c) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < H_ANCHO && j >= 0 && j < H_ALTO) g[j][i] = c;
  };
  const base = 48; // donde se apoyan los monumentos
  const ventanas = (x, y0, y1, paso, w = 2) => { for (let y = y0; y <= y1; y += paso) R(x, y, w, 2, 'w'); };

  // las colinas de atrás, suaves, de lado a lado
  for (let x = 0; x < H_ANCHO; x++) {
    const alto = Math.round(6 + 3 * Math.sin(x / 23) + 2 * Math.sin(x / 9 + 1));
    R(x, H_ALTO - alto - 4, 1, alto + 4, 'g');
  }

  // Big Ben
  { const x = 2; R(x + 2, 13, 8, 35, 'a'); R(x + 2, 13, 2, 35, 'b'); R(x + 1, 11, 10, 2, 'a');
    for (let i = 0; i < 5; i++) R(x + 5 - i, 6 + i, 2 + i * 2, 1, 'a');
    R(x + 5, 2, 2, 4, 'a'); R(x + 4, 15, 4, 4, 'w'); ventanas(x + 5, 23, 44, 5); }
  // torre Eiffel
  { const x = 16; const cx = x + 11;
    for (let y = 6; y < base; y++) {
      const hw = Math.round(1 + 10 * ((y - 6) / 41) ** 1.7);
      R(cx - hw, y, hw * 2, 1, 'a');
      if (y > 38) R(cx - Math.max(0, hw - 4), y, Math.max(0, hw - 4) * 2, 1, '.'); // el arco entre las patas
    }
    R(cx - 5, 22, 10, 2, 'b'); R(cx - 8, 34, 16, 2, 'b'); R(cx - 1, 1, 2, 5, 'a'); }
  // Coliseo
  { const x = 42; R(x, 30, 34, 18, 'a'); R(x, 25, 20, 5, 'a'); R(x, 30, 34, 1, 'b');
    for (const y of [27, 33, 40]) for (let c = 0; c < 6; c++) if (y > 27 || c < 3) R(x + 2 + c * 5 + (y === 27 ? 1 : 0), y, 3, 4, 'w'); }
  // pagoda
  { const x = 80; let y = base;
    for (let t = 0; t < 4; t++) {
      const w = 22 - t * 4; const x0 = x + 13 - w / 2;
      R(x0 + 2, y - 6, w - 4, 6, 'a'); R(x0 + 2, y - 6, 2, 6, 'b'); R(x0 + w / 2 - 1, y - 4, 2, 3, 'w');
      R(x0 - 1, y - 8, w + 2, 2, 'b'); R(x0 - 2, y - 9, 1, 1, 'b'); R(x0 + w + 1, y - 9, 1, 1, 'b'); // el alero, con las puntas hacia arriba
      y -= 8;
    }
    R(x + 12, y - 6, 2, 6, 'a'); }
  // Sagrada Familia
  { const x = 108;
    for (const [dx, alto] of [[0, 26], [5, 36], [10, 38], [15, 30]]) {
      R(x + dx, base - alto, 4, alto, 'a'); R(x + dx + 1, base - alto - 2, 2, 2, 'a'); R(x + dx + 1, base - alto - 3, 2, 1, 'w');
      ventanas(x + dx + 1, base - alto + 6, base - 6, 6);
    }
    R(x - 2, base - 12, 24, 12, 'a'); }

  // cúpulas de Moscú
  { const x = 232;
    const cupula = (cx, y, ancho) => {
      const filas = ancho > 7 ? [1, 3, 5, 7, 9, 9, 7, 5] : [1, 3, 5, 7, 7, 5];
      filas.forEach((w, j) => R(cx - Math.floor(w / 2), y + j, w, 1, j % 2 ? 'b' : 'a'));
      return y + filas.length;
    };
    const tambor = (cx, y, w) => { R(cx - Math.floor(w / 2), y, w, base - y, 'a'); ventanas(cx, y + 3, base - 4, 6); };
    tambor(x + 13, cupula(x + 13, 8, 9) , 7); tambor(x + 5, cupula(x + 5, 20, 7), 5); tambor(x + 21, cupula(x + 21, 18, 7), 5);
    R(x + 13, 5, 1, 3, 'a'); R(x + 1, base - 8, 24, 8, 'a'); }
  // molino holandés (las aspas van aparte, girando)
  { const x = 262; for (let y = 24; y < base; y++) { const hw = Math.round(4 + (y - 24) / 6); R(x + 9 - hw, y, hw * 2, 1, 'a'); }
    R(x + 5, 21, 8, 3, 'b'); R(x + 7, 41, 4, 7, 'w'); R(x + 8, 30, 2, 3, 'w'); }
  // Partenón
  { const x = 284; R(x, base - 4, 34, 4, 'b'); for (let i = 0; i < 6; i++) R(x + 2 + i * 6, base - 18, 3, 14, 'a');
    R(x, base - 22, 34, 4, 'a'); for (let i = 0; i < 5; i++) { const w = 6 + i * 7; R(x + 17 - w / 2, base - 27 + i, w, 1, 'a'); } }
  // estupa tailandesa
  { const x = 320; [1, 1, 2, 2, 3, 4, 5, 6, 7, 7].forEach((hw, j) => R(x + 7 - hw, 22 + j * 2, hw * 2, 2, 'a'));
    R(x + 6, 10, 2, 12, 'a'); R(x + 1, base - 6, 12, 6, 'b'); }
  // Santa Sofía, con sus minaretes
  { const x = 336; [3, 6, 8, 9, 10, 10].forEach((hw, j) => R(x + 12 - hw, 22 + j, hw * 2, 1, 'a'));
    R(x + 1, 28, 22, base - 28, 'a'); ventanas(x + 6, 32, 44, 6); ventanas(x + 16, 32, 44, 6);
    for (const mx of [x - 2, x + 25]) { R(mx, 14, 2, base - 14, 'a'); R(mx, 11, 2, 3, 'b'); R(mx, 10, 1, 1, 'b'); } }

  // las colinas de delante tapan la base de todo
  for (let x = 0; x < H_ANCHO; x++) {
    const alto = Math.round(5 + 2 * Math.sin(x / 31 + 2) + Math.sin(x / 11));
    R(x, H_ALTO - alto, 1, alto, 'h');
  }
  // contorno
  const borde = [];
  for (let y = 0; y < H_ALTO; y++) for (let x = 0; x < H_ANCHO; x++) {
    if (g[y][x] !== '.') continue;
    const lleno = (i, j) => g[j]?.[i] && g[j][i] !== '.' && g[j][i] !== 'k';
    if (lleno(x - 1, y) || lleno(x + 1, y) || lleno(x, y - 1) || lleno(x, y + 1)) borde.push([x, y]);
  }
  for (const [i, j] of borde) g[j][i] = 'k';
  return g;
}

// las aspas del molino, en dos fotogramas (en cruz y en aspa)
const ASPAS = [
  ['......a......', '......a......', '......a......', '......a......', '.....aaa.....', '.....aaa.....', 'aaaaaaaaaaaaa', '.....aaa.....', '.....aaa.....', '......a......', '......a......', '......a......', '......a......'],
  ['a...........a', '.a.........a.', '..a.......a..', '...a.....a...', '....aa..aa...', '.....aaaa....', '......aa.....', '.....aaaa....', '....aa..aa...', '...a.....a...', '..a.......a..', '.a.........a.', 'a...........a'],
];

let horizonteGuardado = null;
export function horizonte() {
  horizonteGuardado ??= rejillaHorizonte();
  const caja = document.createElement('div');
  caja.className = 'pie-horizonte';
  caja.setAttribute('aria-hidden', 'true');
  const aspas = document.createElement('div');
  aspas.className = 'molino-aspas';
  aspas.style.left = `${(MOLINO.x / H_ANCHO) * 100}%`;
  aspas.style.top = `${(MOLINO.y / H_ALTO) * 100}%`;
  aspas.append(svg(ASPAS[0], 'aspas-a', 'p'), svg(ASPAS[1], 'aspas-b', 'p'));
  caja.append(svg(horizonteGuardado, 'pie-horizonte-dibujo', 'o'), aspas);
  return caja;
}

// Para dibujar otros píxeles con el mismo sistema (la Hucha de la pantalla de precios).
export { svg as dibujoPixel, conContorno };
