// Pantalla «Sobre Paglot» (#/sobre): la casa de Paglot, cortada por la mitad como una casa de muñecas,
// con el cielo detrás (de día o de noche, como el tema). Cada sección es una habitación:
// - el tejado y la buhardilla: el cartel con el título y una tutora que entra andando y saluda;
// - el salón («Qué es Paglot»): una tutora pasea por el suelo y comenta si te acercas a la nota;
// - la escalera (la historia): una tutora baja los tramos según bajas por la página y enciende cada cuadro;
// - el pasillo («En qué creemos»): tres puertas que se abren al verlas y por las que se asoma una tutora;
// - la sala de mapas (misión), el estudio (método, un libro abierto) y el taller (eficacia, tres engranajes);
// - la tiendecita de la planta baja;
// - y la calle: el buzón («¿Hablamos?»), «¿Empezamos?» y el desfile de todas las tutoras por la acera.
// Las tutoras solo se mueven mientras su habitación se ve (js/vistas/elenco.js). Colores en css/sobre.css.
// Los textos están en i18n/ (claves «sobre.*»). Los datos de la historia son provisionales.

import { el, poner, alAzar } from '../dom.js';
import { t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { sonar } from '../sonidos.js';
import { TITULAR } from '../config.js';
import { sol, luna, nubes, maceta, dibujoPixel, conContorno, conHalo } from './inicio-decorado.js';
import { crearElenco, tutoraPintada, lienzo } from './elenco.js';

const HITOS = ['h1', 'h2', 'h3', 'h4'];
const VALORES = ['v1', 'v2', 'v3'];

// ---------------------------------------------------------------------------
// Los dibujos (rejillas de letras; los colores, en css/sobre.css con el prefijo «cp»)
// k contorno · m madera · M madera oscura · n madera clara · t tela · T tela en sombra · u tela clara
// r rojo · R rojo oscuro · o oro · O oro oscuro · p papel · g hierro · G hierro claro · a azul · v verde · q piel · y luz
// ---------------------------------------------------------------------------

/** El tejado a dos aguas con su chimenea, la cumbrera y el ojo de buey. W de ancho (con el alero). */
function rejillaTejado(W, H, { banda, chimenea, ojo }) {
  const arriba = 10; // filas libres encima del caballete, para la chimenea
  const { g, R, filas } = lienzo(W, H + arriba);
  // la chimenea: va antes, el tejado la tapa por abajo
  const [cx, cw] = chimenea;
  R(cx, 2, cw, H, 'h');
  for (let y = 4; y < H; y += 3) {
    R(cx, y, cw, 1, 'H');
    for (let x = cx + (Math.floor((y - 4) / 3) % 2 ? 1 : 3); x < cx + cw; x += 4) R(x, y - 2, 1, 2, 'H');
  }
  R(cx - 1, 0, cw + 2, 2, 'c'); R(cx - 1, 2, cw + 2, 1, 'C');
  // el tejado, fila a fila: tejas (r, con juntas R) en la banda de los lados; dentro, la pared de la buhardilla
  for (let fila = 0; fila < H; fila++) {
    const y = arriba + fila;
    const medio = (fila + 1) * (W / 2) / H;
    const x0 = Math.round(W / 2 - medio);
    const x1 = Math.round(W / 2 + medio);
    const dentro = medio - banda;
    for (let x = x0; x < x1; x++) {
      const deCentro = Math.abs(x + 0.5 - W / 2);
      if (fila < 2) { g[y][x] = 'c'; continue; } // la cumbrera
      if (dentro > 1 && deCentro < dentro - 1) { g[y][x] = (x % 9 === 0) ? 'A' : 'a'; continue; }
      if (dentro > 1 && deCentro < dentro) { g[y][x] = 'c'; continue; } // el canto de madera por dentro
      const teja = Math.floor(fila / 3);
      g[y][x] = fila % 3 === 2 || (x + (teja % 2) * 3) % 6 === 0 ? 'R' : 'r';
    }
  }
  R(0, arriba + H - 2, W, 2, 'C'); // el alero
  // el ojo de buey
  if (ojo) {
    const [ox, oy, radio] = ojo;
    for (let y = oy - radio - 1; y <= oy + radio + 1; y++) {
      for (let x = ox - radio - 1; x <= ox + radio + 1; x++) {
        const d = Math.hypot(x + 0.5 - ox, y + 0.5 - oy);
        if (d <= radio - 1) g[arriba + y][x] = 'w';
        else if (d <= radio + 0.6) g[arriba + y][x] = 'f';
      }
    }
    R(ox - radio + 1, arriba + oy, radio * 2 - 2, 1, 'f');
    R(ox, arriba + oy - radio + 1, 1, radio * 2 - 2, 'f');
  }
  return conContorno(filas());
}

const SOFA = (() => {
  const { R, filas } = lienzo(46, 20);
  R(4, 0, 38, 10, 't'); R(4, 0, 38, 1, 'u'); R(17, 2, 1, 7, 'T'); R(29, 2, 1, 7, 'T');
  R(0, 5, 6, 12, 't'); R(40, 5, 6, 12, 't'); R(0, 5, 6, 1, 'u'); R(40, 5, 6, 1, 'u'); R(5, 6, 1, 11, 'T'); R(40, 6, 1, 11, 'T');
  R(6, 10, 34, 5, 't'); R(6, 10, 34, 1, 'u'); R(17, 11, 1, 4, 'T'); R(29, 11, 1, 4, 'T');
  R(8, 4, 7, 6, 'o'); R(8, 4, 7, 1, 'y'); R(9, 6, 5, 1, 'O'); // un cojín
  R(1, 15, 44, 2, 'T');
  R(3, 17, 3, 3, 'M'); R(40, 17, 3, 3, 'M');
  return conContorno(filas());
})();

const LAMPARA = (() => {
  const { R, filas } = lienzo(14, 46);
  R(4, 0, 6, 1, 'o'); R(3, 1, 8, 1, 'o'); R(2, 2, 10, 2, 'o'); R(1, 4, 12, 3, 'o'); R(0, 7, 14, 2, 'O');
  R(5, 9, 4, 1, 'y');
  R(6, 10, 2, 32, 'g'); R(6, 10, 1, 32, 'G');
  R(3, 42, 8, 2, 'g'); R(2, 44, 10, 2, 'g');
  return conContorno(filas());
})();

// el baúl de la buhardilla, con el cuaderno de apuntes de 2024 encima
const BAUL = (() => {
  const { R, filas } = lienzo(32, 24);
  R(9, 2, 16, 5, 'r'); R(9, 2, 16, 1, 'R'); R(10, 6, 15, 1, 'p'); R(12, 3, 1, 3, 'g'); R(16, 4, 6, 1, 'p'); // el cuaderno
  R(1, 7, 30, 4, 'n'); R(1, 7, 30, 1, 'y');
  R(0, 11, 32, 13, 'm'); R(0, 21, 32, 3, 'M');
  R(5, 7, 3, 17, 'g'); R(24, 7, 3, 17, 'g');
  R(14, 12, 4, 5, 'o'); R(15, 14, 2, 2, 'k');
  return conContorno(filas());
})();

// una pila de libros viejos
const PILA = (() => {
  const { R, filas } = lienzo(20, 16);
  R(1, 12, 18, 4, 'a'); R(1, 12, 18, 1, 'p');
  R(3, 8, 15, 4, 'v'); R(3, 8, 15, 1, 'p');
  R(0, 4, 17, 4, 'r'); R(0, 4, 17, 1, 'p');
  R(4, 0, 12, 4, 'o'); R(4, 0, 12, 1, 'p');
  return conContorno(filas());
})();

// los cuadritos de la historia: el cuaderno, la primera tutora, las banderas y una estrella
const ICONOS_HITO = {
  h1: (() => {
    const { R, filas } = lienzo(16, 16);
    R(3, 1, 11, 14, 'r'); R(3, 1, 11, 1, 'R'); R(5, 3, 7, 10, 'p');
    R(6, 5, 5, 1, 'g'); R(6, 7, 5, 1, 'g'); R(6, 9, 3, 1, 'g');
    for (let y = 2; y < 15; y += 3) R(2, y, 2, 1, 'G');
    return conContorno(filas());
  })(),
  h2: (() => {
    const { R, filas } = lienzo(16, 16);
    R(3, 1, 10, 4, 'M'); R(2, 3, 12, 9, 'M'); // el pelo
    R(4, 4, 8, 8, 'q'); R(4, 4, 8, 2, 'M'); R(4, 6, 1, 3, 'M'); R(11, 6, 1, 3, 'M'); // la cara y el flequillo
    R(5, 7, 2, 2, 'k'); R(9, 7, 2, 2, 'k'); R(5, 7, 1, 1, 'p'); R(9, 7, 1, 1, 'p');
    R(4, 9, 1, 1, 'R'); R(11, 9, 1, 1, 'R'); R(7, 10, 2, 1, 'R');
    R(5, 12, 6, 2, 'a'); R(3, 14, 10, 2, 'a'); R(7, 12, 2, 2, 'p');
    return conContorno(filas());
  })(),
  h3: (() => {
    // el mundo: mar y tierras
    const { g, filas } = lienzo(16, 16);
    const tierra = ['......vv........', '.....vvvv...vv..', '....vvvvv..vvvv.', '...vvvvv...vvvv.', '....vvv.....vv..', '.....vv.........', '..........vvv...', '.........vvvvv..', '..vv.....vvvvv..', '.vvvv.....vvv...', '..vvv......v....', '...v............', '........vv......', '.......vvvv.....', '........vv......', '................'];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (Math.hypot(x + 0.5 - 8, y + 0.5 - 8) > 7.6) continue;
        g[y][x] = tierra[y][x] === 'v' ? 'v' : (x + y > 21 ? 'A' : 'a');
      }
    }
    return conContorno(filas());
  })(),
  h4: (() => {
    const { R, filas } = lienzo(16, 16);
    R(7, 0, 2, 3, 'o'); R(6, 3, 4, 3, 'o'); R(0, 5, 16, 2, 'o'); R(2, 7, 12, 2, 'o'); R(4, 9, 8, 2, 'o');
    R(3, 11, 4, 2, 'o'); R(9, 11, 4, 2, 'o'); R(2, 13, 3, 2, 'o'); R(11, 13, 3, 2, 'o');
    R(7, 4, 1, 4, 'y'); R(6, 6, 1, 2, 'k'); R(9, 6, 1, 2, 'k'); R(7, 9, 2, 1, 'O');
    return conContorno(filas());
  })(),
};

/** Un engranaje de r de radio con n dientes: hierro, sombra abajo a la derecha y el eje en medio. */
function rejillaEngranaje(r, n, metal = 'G', sombra = 'g') {
  const lado = r * 2 + 6;
  const c = lado / 2;
  const { g, filas } = lienzo(lado, lado);
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const dx = x + 0.5 - c;
      const dy = y + 0.5 - c;
      const d = Math.hypot(dx, dy);
      const angulo = (Math.atan2(dy, dx) / (Math.PI * 2) + 1) % 1;
      const diente = Math.floor(angulo * n * 2) % 2 === 0;
      if (d < r * 0.28) g[y][x] = 'k';
      else if (d < r * 0.45) g[y][x] = 'o';
      else if (d <= r - 0.5 || (diente && d <= r + 2.2)) g[y][x] = dx + dy > r * 0.55 ? sombra : metal;
    }
  }
  return conContorno(filas());
}

const ESTANTERIA = (() => {
  const W = 64;
  const H = 58;
  const { R, filas } = lienzo(W, H);
  R(0, 0, W, H, 'M'); R(2, 2, W - 4, H - 4, 'm');
  let semilla = 7;
  const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  const colores = ['r', 'a', 'v', 'o', 't', 'R', 'n'];
  for (const baldaY of [18, 36, 54]) {
    R(0, baldaY, W, 3, 'n'); R(0, baldaY + 2, W, 1, 'M');
    for (let x = 4; x < W - 6;) {
      const ancho = 3 + Math.floor(azar() * 3);
      const alto = 10 + Math.floor(azar() * 5);
      if (azar() < 0.12) { x += 3; continue; } // un hueco
      const c = colores[Math.floor(azar() * colores.length)];
      R(x, baldaY - alto, ancho, alto, c);
      R(x, baldaY - alto + 2, ancho, 1, 'p'); R(x, baldaY - 4, ancho, 1, 'p');
      x += ancho + (azar() < 0.3 ? 1 : 0);
    }
  }
  return conContorno(filas());
})();

const BUZON = (() => {
  const { R, filas } = lienzo(20, 40);
  R(3, 0, 14, 1, 'r'); R(1, 1, 18, 1, 'r'); R(0, 2, 20, 20, 'r');
  R(16, 2, 4, 20, 'R'); R(1, 2, 2, 18, 'u');
  R(4, 7, 12, 2, 'k'); R(4, 9, 12, 1, 'R');
  R(5, 12, 10, 6, 'o'); R(6, 14, 8, 1, 'O'); R(6, 16, 5, 1, 'O');
  R(0, 22, 20, 2, 'R');
  R(8, 24, 4, 13, 'g'); R(8, 24, 1, 13, 'G');
  R(4, 37, 12, 3, 'g');
  return conContorno(filas());
})();

/**
 * La escalera de la historia, para un hueco de ancho × alto unidades: tramos en zigzag con barandilla.
 * Devuelve la rejilla y el camino de los pies (puntos en unidades) para la tutora.
 */
function trazarEscalera(ancho, alto, estrecha) {
  const { R, filas } = lienzo(ancho, alto);
  const rellano = estrecha ? 4 : 7;
  const paso = estrecha ? 2 : 3;
  const n = Math.max(2, Math.floor((ancho - rellano * 2) / paso));
  const camino = [];
  R(0, 0, 2, alto, 's'); R(ancho - 2, 0, 2, alto, 's'); // los dos pilares del hueco
  let y = 12;
  let haciaDerecha = true;
  camino.push([rellano / 2, y]);
  R(0, y, rellano, 1, 'P'); R(0, y + 1, rellano, paso + 2, 'p'); R(0, y + paso + 3, rellano, 2, 's');
  while (y + n * paso + paso + 6 < alto) {
    const desde = haciaDerecha ? rellano : ancho - rellano;
    for (let i = 0; i < n; i++) {
      const x = haciaDerecha ? desde + i * paso : desde - (i + 1) * paso;
      const yi = y + (i + 1) * paso;
      R(x, yi, paso, 1, 'P'); R(x, yi + 1, paso, paso + 2, 'p'); R(x, yi + paso + 1, paso, 2, 's');
      // la barandilla: un barrote cada dos peldaños y el pasamanos inclinado
      for (let k = 0; k < paso; k++) {
        const recorrido = haciaDerecha ? i * paso + k : (i + 1) * paso - 1 - k;
        const pasamanos = y + recorrido - (estrecha ? 6 : 8);
        R(x + k, pasamanos, 1, 1, 'B');
        if (k === 1 && i % 2 === 0) R(x + k, pasamanos + 1, 1, yi - pasamanos - 1, 'b');
      }
    }
    y += n * paso;
    const llega = haciaDerecha ? ancho - rellano : rellano;
    camino.push([haciaDerecha ? desde + n * paso - paso / 2 : desde - n * paso + paso / 2, y]);
    // el rellano del otro lado
    const rx = haciaDerecha ? ancho - rellano : 0;
    R(rx, y, rellano, 1, 'P'); R(rx, y + 1, rellano, paso + 2, 'p'); R(rx, y + paso + 3, rellano, 2, 's');
    camino.push([llega + (haciaDerecha ? rellano / 2 - 1 : -rellano / 2 + 1), y]);
    haciaDerecha = !haciaDerecha;
  }
  return { rejilla: filas(), camino };
}

/** Un punto del camino a una distancia d (en unidades) desde el principio. */
function puntoDelCamino(camino, d) {
  for (let i = 1; i < camino.length; i++) {
    const [x0, y0] = camino[i - 1];
    const [x1, y1] = camino[i];
    const largo = Math.hypot(x1 - x0, y1 - y0);
    if (d <= largo || i === camino.length - 1) {
      const p = largo ? Math.max(0, Math.min(1, d / largo)) : 0;
      return { x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p, sentido: Math.sign(x1 - x0) };
    }
    d -= largo;
  }
  return { x: camino[0][0], y: camino[0][1], sentido: 1 };
}
const largoDelCamino = camino => camino.slice(1).reduce((s, [x, y], i) => s + Math.hypot(x - camino[i][0], y - camino[i][1]), 0);

/** El camino punteado del mapa, de la primera parada a la última. */
function caminoDelMapa() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  const linea = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  linea.setAttribute('points', '16,78 30,70 50,51 66,40 82,24');
  linea.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(linea);
  return el('span', { class: 'casa-mapa-camino', 'aria-hidden': 'true' }, svg);
}

// ---------------------------------------------------------------------------
// La pantalla
// ---------------------------------------------------------------------------

/**
 * Pinta la página. Devuelve una función que la apaga (las tutoras dejan de moverse):
 * hay que llamarla al salir de la pantalla.
 */
export function pintarSobre(contenedor) {
  const elenco = crearElenco();
  const { quieto, despues, alApagar } = elenco;
  const hablar = (quien, clave, ms) => quien.decir(Array.isArray(t(clave)) ? alAzar(t(clave)) : t(clave), ms);
  const dibujo = (rejilla, clase) => dibujoPixel(rejilla, clase, 'cp');

  // =====================================================================
  // El tejado y la buhardilla
  // =====================================================================
  const tejado = el('div', { class: 'casa-tejado', 'aria-hidden': 'true' },
    // de noche el ojo de buey encendido alumbra el tejado (conHalo: solo de noche, sin animación)
    conHalo(dibujoPixel(rejillaTejado(262, 46, { banda: 13, chimenea: [190, 14], ojo: [131, 20, 8] }), 'casa-tejado-ancho', 'cp'), ['cp-w'], { radio: 3 }),
    conHalo(dibujoPixel(rejillaTejado(92, 34, { banda: 7, chimenea: [64, 8], ojo: [46, 17, 5] }), 'casa-tejado-estrecho', 'cp'), ['cp-w'], { radio: 2 }),
    el('span', { class: 'casa-humo' }, el('i', {}), el('i', {}), el('i', {})));

  const guia = elenco.tutora(elenco.protagonista(), 'casa-guia');
  guia.alTocar = () => hablar(guia, 'sobre.toca');
  const saludar = () => {
    guia.figura.classList.remove('entra');
    guia.poner({ andando: false });
    guia.reaccionar('contenta', 900);
    guia.gesto('saludar');
    sonar('saludo');
    guia.decir(t('sobre.hola'), 4200);
  };
  if (quieto) despues(500, saludar);
  else {
    guia.figura.classList.add('entra');
    guia.poner({ andando: true });
    guia.figura.addEventListener('animationend', saludar, { once: true });
  }

  const buhardilla = el('header', { class: 'es-limite casa-piso casa-buhardilla' },
    el('span', { class: 'casa-bombilla', 'aria-hidden': 'true' }),
    el('div', { class: 'casa-placa' },
      el('h1', {}, t('sobre.titulo')),
      el('p', { class: 'casa-lema' }, t('sobre.lema'))),
    guia.figura,
    el('div', { class: 'casa-trastos', 'aria-hidden': 'true' }, dibujo(PILA, 'casa-pila'), dibujo(BAUL, 'casa-baul')));

  // =====================================================================
  // El salón: «Qué es Paglot», con una tutora que pasea
  // =====================================================================
  const paseante = elenco.tutora(elenco.otra(), 'casa-paseante');
  const pista = el('div', { class: 'casa-pista' }, paseante.figura);
  const nota = el('div', { class: 'es-papel casa-nota' },
    el('span', { class: 'casa-chincheta', 'aria-hidden': 'true' }),
    el('h2', {}, t('sobre.que.titulo')),
    el('p', {}, t('sobre.que.p1')),
    el('p', {}, t('sobre.que.p2')));
  let x = -1;
  let sentido = 1;
  let quietaHasta = 0;
  const comentar = () => {
    quietaHasta = performance.now() + 3200;
    paseante.poner({ andando: false });
    paseante.reaccionar('contenta', 900);
    hablar(paseante, 'sobre.que.dice', 2800);
  };
  paseante.alTocar = comentar;
  nota.addEventListener('pointerenter', comentar);
  const salon = el('section', { class: 'es-limite casa-piso casa-salon' },
    el('div', { class: 'casa-salon-pared' },
      nota,
      el('div', { class: 'casa-ventana', 'aria-hidden': 'true' }, el('span', { class: 'casa-ventana-cielo' }), el('i', {}), el('i', {}))),
    el('div', { class: 'casa-salon-suelo', 'aria-hidden': 'true' },
      dibujo(LAMPARA, 'casa-lampara'), dibujo(SOFA, 'casa-sofa'), maceta(0)),
    pista);

  // =====================================================================
  // La escalera: la historia
  // =====================================================================
  const caminante = elenco.tutora(elenco.otra(), 'casa-caminante');
  caminante.alTocar = () => hablar(caminante, 'sobre.toca');
  const cuadros = HITOS.map(h => el('li', { class: `casa-hito casa-hito-${h}` },
    el('div', { class: 'casa-cuadro', 'aria-hidden': 'true' },
      el('span', { class: 'casa-foco' }),
      el('span', { class: 'casa-marco' }, dibujo(ICONOS_HITO[h], 'casa-icono'))),
    el('div', { class: 'es-papel casa-hito-texto' },
      el('p', { class: 'casa-fecha' }, t(`sobre.${h}.fecha`)),
      el('h3', {}, t(`sobre.${h}.titulo`)),
      el('p', {}, t(`sobre.${h}.texto`)))));
  const hueco = el('div', { class: 'casa-hueco', 'aria-hidden': 'true' });
  const carril = el('div', { class: 'casa-carril' }, hueco, caminante.figura);
  const escalera = el('section', { class: 'es-limite casa-piso casa-escalera' },
    el('h2', { class: 'casa-letrero' }, t('sobre.historia.titulo')),
    el('div', { class: 'casa-historia' }, carril, el('ol', { class: 'casa-hitos' }, cuadros)));

  // =====================================================================
  // El pasillo: «En qué creemos», tres puertas
  // =====================================================================
  const puertas = VALORES.map(v => {
    const curiosa = elenco.tutora(elenco.otra(), 'casa-curiosa');
    const puerta = el('div', { class: 'casa-puerta' },
      el('span', { class: 'casa-puerta-dentro' }),
      curiosa.figura,
      el('span', { class: 'casa-hoja', 'aria-hidden': 'true' }, el('i', {}), el('i', {}), el('b', {})));
    const valor = el('li', { class: 'casa-valor' },
      puerta,
      el('div', { class: 'es-papel casa-valor-texto' },
        el('h3', {}, t(`sobre.${v}.titulo`)),
        el('p', {}, t(`sobre.${v}.texto`))));
    valor.addEventListener('pointerenter', () => curiosa.reaccionar('contenta', 900));
    return { valor, curiosa };
  });
  const pasillo = el('section', { class: 'es-limite casa-piso casa-pasillo' },
    el('h2', { class: 'casa-letrero' }, t('sobre.valores.titulo')),
    el('ul', { class: 'casa-valores' }, puertas.map(p => p.valor)));
  if (quieto || !('IntersectionObserver' in window)) {
    for (const { valor } of puertas) valor.classList.add('abierta');
  } else {
    const vigia = new IntersectionObserver(entradas => {
      for (const e of entradas) {
        const dentro = e.intersectionRatio >= 0.7;
        const era = e.target.classList.contains('abierta');
        if (dentro === era) continue;
        e.target.classList.toggle('abierta', dentro);
        const p = puertas.find(q => q.valor === e.target);
        if (dentro) {
          const n = puertas.indexOf(p);
          despues(250 + n * 220, () => { p.curiosa.gesto('asomarse'); if (n === 1) sonar('puerta'); });
        }
      }
    }, { threshold: [0, 0.7, 1] });
    puertas.forEach(({ valor }) => vigia.observe(valor));
    alApagar(() => vigia.disconnect());
  }

  // =====================================================================
  // Misión, método y eficacia: tres habitaciones con tres pasos que se eligen
  // =====================================================================
  /** Los pasos de una habitación: botones que se eligen; la anfitriona pasa al siguiente si la tocas. */
  function pasos(clave, anfitriona, alElegir) {
    let actual = 0;
    const botones = [0, 1, 2].map(i => el('button', {
      type: 'button', class: `casa-paso casa-paso-${i + 1}`, 'aria-pressed': String(i === 0),
      onclick: () => elegir(i),
    }, el('span', { class: 'casa-paso-numero', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')), el('span', {}, t(`sobre.${clave}.paso${i + 1}`))));
    function elegir(i, conGesto = true) {
      actual = i;
      botones.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      alElegir(i, conGesto);
    }
    anfitriona.alTocar = () => {
      elegir((actual + 1) % 3);
      anfitriona.decir(t(`sobre.${clave}.dice`), 3500);
    };
    elegir(0, false);
    return botones;
  }
  const texto = (clave, ...extra) => el('div', { class: 'casa-texto' },
    el('h2', { id: `sobre-${clave}` }, t(`sobre.${clave}.titulo`)),
    el('p', {}, t(`sobre.${clave}.p1`)),
    el('p', {}, t(`sobre.${clave}.p2`)),
    ...extra);

  // --- La sala de mapas: la tutora es la ficha que avanza por el camino ---
  const exploradora = elenco.tutora(elenco.otra(), 'casa-ficha');
  const mapa = el('div', { class: 'casa-mapa' },
    caminoDelMapa(),
    el('span', { class: 'casa-mapa-monte', 'aria-hidden': 'true' }),
    el('span', { class: 'casa-mapa-lago', 'aria-hidden': 'true' }),
    el('span', { class: 'casa-mapa-rosa', 'aria-hidden': 'true' }, 'N'),
    exploradora.figura);
  const botonesMision = pasos('mision', exploradora, (i, conGesto) => {
    mapa.style.setProperty('--paso', String(i));
    if (conGesto) sonar('pasos');
    if (conGesto && !quieto) {
      exploradora.poner({ andando: true });
      despues(420, () => { exploradora.poner({ andando: false }); exploradora.reaccionar('contenta', 900); });
    }
  });
  mapa.append(el('div', { class: 'casa-mapa-banderas', role: 'group', 'aria-label': t('sobre.mision.titulo') }, botonesMision));
  const mision = el('section', { class: 'es-limite casa-piso casa-mapas', 'aria-labelledby': 'sobre-mision' },
    el('div', { class: 'es-papel casa-pergamino' }, texto('mision')),
    mapa);

  // --- El estudio: un libro abierto con sus marcapáginas ---
  const lectora = elenco.tutora(elenco.otra(), 'casa-lectora');
  const libro = el('div', { class: 'casa-libro' });
  const pagPaso = el('p', { class: 'casa-pagina-paso', 'aria-live': 'polite' });
  const botonesMetodo = pasos('metodo', lectora, (i, conGesto) => {
    libro.style.setProperty('--paso', String(i));
    pagPaso.textContent = `${String(i + 1).padStart(2, '0')} · ${t(`sobre.metodo.paso${i + 1}`)}`;
    if (conGesto) { lectora.gesto('hojear'); sonar('papel'); }
  });
  libro.append(
    el('div', { class: 'casa-marcas', role: 'group', 'aria-label': t('sobre.metodo.titulo') }, botonesMetodo),
    el('div', { class: 'casa-pagina casa-pagina-izq' },
      el('h2', { id: 'sobre-metodo' }, t('sobre.metodo.titulo')),
      el('p', {}, t('sobre.metodo.p1'))),
    el('div', { class: 'casa-pagina casa-pagina-der' },
      el('p', {}, t('sobre.metodo.p2')),
      pagPaso));
  const estudio = el('section', { class: 'es-limite casa-piso casa-estudio', 'aria-labelledby': 'sobre-metodo' },
    el('div', { class: 'casa-escritorio' }, libro, lectora.figura,
      el('span', { class: 'casa-flexo', 'aria-hidden': 'true' }),
      el('span', { class: 'casa-mesa', 'aria-hidden': 'true' })));

  // --- El taller: tres engranajes, atención → práctica → repaso ---
  const mecanica = elenco.tutora(elenco.otra(), 'casa-mecanica');
  const maquina = el('div', { class: 'casa-maquina' },
    ...[[11, 10], [8, 8], [9, 9]].map(([r, n], i) => el('span', { class: `casa-rueda casa-rueda-${i + 1}`, 'aria-hidden': 'true' }, dibujo(rejillaEngranaje(r, n), 'casa-engranaje'))),
    mecanica.figura);
  let girar = null;
  const botonesEficacia = pasos('eficacia', mecanica, (i, conGesto) => {
    maquina.dataset.paso = String(i);
    if (!conGesto) return;
    sonar('engranaje');
    maquina.classList.remove('gira');
    void maquina.offsetWidth;
    maquina.classList.add('gira');
    clearTimeout(girar);
    girar = setTimeout(() => maquina.classList.remove('gira'), 1600);
    mecanica.gesto(['senalar', 'pulgar', 'asentir'][i]);
  });
  alApagar(() => clearTimeout(girar));
  maquina.append(el('div', { class: 'casa-maquina-pasos', role: 'group', 'aria-label': t('sobre.eficacia.titulo') }, botonesEficacia));
  const taller = el('section', { class: 'es-limite casa-piso casa-taller', 'aria-labelledby': 'sobre-eficacia' },
    el('div', { class: 'casa-plano' }, texto('eficacia')),
    maquina);

  // --- La tiendecita de la planta baja ---
  const tendera = elenco.tutora(elenco.otra(), 'casa-tendera');
  tendera.alTocar = () => { tendera.gesto('invitar'); tendera.decir(t('sobre.tienda.dice'), 3500); };
  const tienda = el('section', { class: 'es-limite casa-piso casa-tienda', 'aria-labelledby': 'sobre-tienda' },
    el('span', { class: 'casa-toldo', 'aria-hidden': 'true' }),
    el('div', { class: 'es-papel casa-cartel' },
      el('h2', { id: 'sobre-tienda' }, t('sobre.tienda.titulo')),
      el('p', {}, t('sobre.tienda.p1')),
      el('p', {}, t('sobre.tienda.p2')),
      el('a', { class: 'es-boton', href: '#/tienda', onclick: () => sonar('timbre') }, t('sobre.tienda.boton'))),
    el('div', { class: 'casa-mostrador-escena' },
      dibujo(ESTANTERIA, 'casa-estanteria'),
      tendera.figura,
      el('span', { class: 'casa-mostrador', 'aria-hidden': 'true' })));

  // =====================================================================
  // La calle: el buzón, «¿Empezamos?» y el desfile
  // =====================================================================
  const todas = CURSOS.filter(c => !c.proximamente);
  const fila = el('div', { class: 'casa-desfile-fila' }, [...todas, ...todas].map(c => tutoraPintada(c))); // dos veces: la vuelta no se nota
  const calle = el('section', { class: 'casa-calle' },
    el('div', { class: 'casa-calle-fila' },
      el('div', { class: 'casa-buzon-escena' },
        dibujo(BUZON, 'casa-buzon'),
        el('div', { class: 'es-papel casa-buzon-texto' },
          el('h2', {}, t('sobre.contacto.titulo')),
          el('p', {}, t('sobre.contacto.texto'),
            TITULAR.correo && ' ', TITULAR.correo && el('a', { href: `mailto:${TITULAR.correo}` }, TITULAR.correo)),
          el('a', { class: 'es-boton es-boton-papel', href: '#/contacto', onclick: () => sonar('buzon') }, t('sobre.contacto.boton')))),
      el('div', { class: 'casa-empezar' },
        el('h2', {}, t('sobre.fin.titulo')),
        el('p', { class: 'casa-empezar-botones' },
          hayCurso
            ? el('a', { class: 'es-boton es-boton-grande', href: '#/lecciones', onclick: () => sonar('pagina') }, t('inicio.continuar', { curso: curso.nativo }))
            : el('a', { class: 'es-boton es-boton-grande', href: '#/idiomas', onclick: () => sonar('pagina') }, t('inicio.empezar')),
          el('a', { class: 'es-boton es-boton-papel', href: '#/inicio', onclick: () => sonar('pagina') }, t('inicio.titulo'))))),
    el('div', { class: 'casa-acera', 'aria-hidden': 'true' }, el('div', { class: 'casa-desfile' }, fila)),
    el('p', { class: 'casa-gracias' }, el('span', { 'aria-hidden': 'true' }, '♥ '), t('sobre.gracias')));

  const habitaciones = [buhardilla, salon, escalera, pasillo, mision, estudio, taller, tienda];
  poner(contenedor,
    el('article', { class: 'casa-paglot escena-web' },
      el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }, sol(), luna(), nubes()),
      el('div', { class: 'casa' },
        tejado,
        el('div', { class: 'casa-cuerpo' }, habitaciones)),
      calle));
  elenco.vigilar(...habitaciones, calle);

  // ----- El paseo por el salón -----
  if (!quieto) {
    const PASO = 4;
    const reloj = setInterval(() => {
      if (!elenco.seVeParte(salon)) return;
      const recorrido = pista.clientWidth - paseante.figura.offsetWidth;
      if (recorrido <= 0) return;
      if (x < 0) x = Math.round(recorrido * (0.25 + Math.random() * 0.5) / PASO) * PASO;
      const ahora = performance.now();
      if (ahora >= quietaHasta) {
        if (Math.random() < 0.012) {
          // de vez en cuando se para a pensar o a mirar por la ventana
          quietaHasta = ahora + 1400 + Math.random() * 1800;
          paseante.poner({ andando: false });
          paseante.gesto(alAzar(['pensar', 'mirarLados', 'estirarse']));
        } else {
          x += sentido * PASO;
          if (x <= 0) { x = 0; sentido = 1; }
          if (x >= recorrido) { x = recorrido; sentido = -1; }
          paseante.poner({ andando: true });
          paseante.figura.classList.toggle('izquierda', sentido < 0);
        }
      }
      paseante.figura.style.transform = `translateX(${Math.min(x, recorrido)}px)`;
    }, 90);
    alApagar(() => clearInterval(reloj));
  }

  // ----- La escalera: se dibuja a la medida del hueco; la tutora baja con la página -----
  let camino = [[0, 0], [0, 1]];
  let largo = 1;
  let anchoU = 0;
  let altoU = 0;
  let U = 4; // píxeles de pantalla por píxel de dibujo (en el móvil, 3: la escalera es más estrecha)
  const trazar = () => {
    U = hueco.clientWidth < 160 ? 3 : 4;
    const w = Math.floor(hueco.clientWidth / U);
    const h = Math.floor(hueco.clientHeight / U);
    if (w < 10 || h < 20 || (w === anchoU && h === altoU)) return;
    anchoU = w; altoU = h;
    const hecho = trazarEscalera(w, h, U === 3);
    camino = hecho.camino;
    largo = largoDelCamino(camino);
    const svg = dibujoPixel(hecho.rejilla, 'casa-escalones', 'cp');
    svg.style.width = `${w * U}px`;
    svg.style.height = `${h * U}px`;
    hueco.replaceChildren(svg);
    seguir();
  };
  let pAnterior = -1;
  let parar = null;
  let primeraVez = true;
  function seguir() {
    const caja = carril.getBoundingClientRect();
    const altoTutora = caminante.figura.offsetHeight;
    const anchoTutora = caminante.figura.offsetWidth;
    // la tutora va más o menos a media pantalla: lo que se ha bajado de la escalera es lo que ya ha pasado por ahí
    const bajado = Math.max(0, Math.min(1, (window.innerHeight * 0.55 - caja.top) / Math.max(1, caja.height)));
    const p = quieto ? 1 : Math.round(bajado * largo);
    if (p === pAnterior) return;
    const { x: px, y: py, sentido: va } = puntoDelCamino(camino, p);
    const izq = Math.round(px * U - anchoTutora / 2);
    const arriba = Math.round(py * U - altoTutora + 2);
    caminante.figura.style.transform = `translate(${izq}px, ${arriba}px)`;
    if (!primeraVez && !quieto) {
      caminante.poner({ andando: true });
      caminante.figura.classList.toggle('izquierda', (p < pAnterior ? -va : va) < 0);
      clearTimeout(parar);
      parar = setTimeout(() => caminante.poner({ andando: false }), 200);
    }
    pAnterior = p;
    // un cuadro se enciende cuando los pies de la tutora llegan a su altura (y se apaga si vuelve a subir)
    const pies = py * U;
    for (const cuadro of cuadros) {
      const llega = quieto || cuadro.offsetTop + 24 <= pies;
      if (llega && !cuadro.classList.contains('encendido')) {
        cuadro.classList.add('encendido');
        if (!primeraVez) { caminante.reaccionar('contenta', 800); sonar('interruptor'); }
      } else if (!llega) cuadro.classList.remove('encendido');
    }
    primeraVez = false;
  }
  const alDesplazar = () => { if (elenco.seVeParte(escalera) || primeraVez) seguir(); };
  window.addEventListener('scroll', alDesplazar, { passive: true });
  const medida = new ResizeObserver(() => trazar());
  medida.observe(hueco);
  const alEmpezar = requestAnimationFrame(() => { trazar(); seguir(); });
  alApagar(() => {
    window.removeEventListener('scroll', alDesplazar);
    medida.disconnect();
    cancelAnimationFrame(alEmpezar);
    clearTimeout(parar);
  });

  return () => elenco.apagar();
}
