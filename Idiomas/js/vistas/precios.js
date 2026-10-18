// Pantalla de precios (#/precios), con el plan de negocio de octubre de 2026:
// 1. La escalera: tres peldaños (Gratis, Plus y Max) con una tutora de pie en cada uno, bajo el cielo de la portada.
//    Arriba se elige pago anual o mensual. Todo esto (de «Precios» a los tres planes) cabe en una pantalla: si no, se encoge.
//    El precio es el de la región de cada uno, que se adivina en js/region.js (en la app lo pondrá la tienda).
// 2. La Hucha: quien no puede pagar ve anuncios cuando quiere y la hucha va llenándose hasta pagar Plus.
// 3. La colección de Max: los 6 libros del idioma en una estantería, y cómo llegan.
// 4. Familia y Fundadores. 5. Qué incluye cada plan. 6. Las promesas.
//
// TODAVÍA NO SE COBRA NADA ni se aplica ningún límite: los botones de pago dicen «Muy pronto».
// Los precios están en config.js (ZONAS) y la región se adivina en js/region.js; los textos, en i18n/ (claves «pr.*»).

import { el, poner } from '../dom.js';
import { t, locale } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, NOMBRES_TUTORAS } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { PLAZAS_FUNDADORES, LECCIONES_GRATIS_AL_DIA } from '../config.js';
import { preciosDeSuZona } from '../region.js';
import { nubes, luna, sol, dibujoPixel, conContorno, maceta } from './inicio-decorado.js';

const CADA_GESTO = 3800;


// La hucha, en píxeles: cerdito rosa con la ranura arriba (r cuerpo · R sombra · n hocico · k ojo, ranura y orificios)
function rejillaHucha() {
  const W = 26;
  const H = 19;
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dentro = ((x - 12) / 10.5) ** 2 + ((y - 9) / 7) ** 2 <= 1;
    if (dentro) g[y][x] = y > 12 ? 'R' : 'r';
  }
  const R = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j]?.[i] !== undefined) g[j][i] = c; };
  R(6, 1, 2, 2, 'r'); R(7, 0, 1, 1, 'r'); R(15, 1, 2, 2, 'r'); R(15, 0, 1, 1, 'r'); // orejas
  R(9, 3, 6, 1, 'k'); // la ranura
  R(21, 7, 4, 5, 'n'); R(22, 8, 1, 1, 'k'); R(22, 10, 1, 1, 'k'); // hocico
  R(18, 6, 1, 2, 'k'); // ojo
  R(5, 15, 3, 4, 'R'); R(15, 15, 3, 4, 'R'); // patas
  R(0, 7, 2, 1, 'r'); R(0, 8, 1, 1, 'r'); // la colita
  return conContorno(g.map(f => f.join('')));
}

// El cuarto de la Hucha, en píxeles: la tele donde se ven los anuncios, su mesa, el taburete del cerdito y la ventana.
const rejilla = (W, H, pintar) => {
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  pintar((x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j]?.[i] !== undefined) g[j][i] = c; });
  return conContorno(g.map(f => f.join('')));
};
// la tele de tubo: c madera · C madera oscura · s pantalla (cambia de color) · w el «play» · a antenas · b botones
const TELE = rejilla(24, 22, R => {
  for (let i = 0; i < 5; i++) { R(9 + Math.floor(i / 2), i, 1, 1, 'a'); R(15 - Math.floor(i / 2), i, 1, 1, 'a'); }
  R(0, 5, 24, 14, 'c'); R(0, 18, 24, 1, 'C'); R(3, 19, 2, 3, 'C'); R(19, 19, 2, 3, 'C');
  R(2, 7, 15, 11, 's'); R(2, 7, 1, 1, 'c'); R(16, 7, 1, 1, 'c'); R(2, 17, 1, 1, 'c'); R(16, 17, 1, 1, 'c');
  [1, 2, 3, 4, 3, 2, 1].forEach((w, j) => R(8, 9 + j, w, 1, 'w'));
  R(19, 8, 3, 3, 'b'); R(19, 12, 3, 3, 'b'); for (const y of [16]) for (let x = 18; x < 23; x += 2) R(x, y, 1, 1, 'C');
});
// mesa (m tablero · M sombra y patas) y taburete
const MESA = rejilla(26, 12, R => { R(0, 0, 26, 3, 'm'); R(1, 3, 24, 1, 'M'); R(2, 4, 2, 8, 'M'); R(22, 4, 2, 8, 'M'); });
const TABURETE = rejilla(18, 10, R => { R(0, 0, 18, 3, 'm'); R(1, 3, 16, 1, 'M'); R(2, 4, 2, 6, 'M'); R(14, 4, 2, 6, 'M'); });
// ventana: f marco · v cristal (el cielo) · n nube (de día) · e estrella (de noche)
const VENTANA = rejilla(22, 26, R => {
  R(0, 0, 22, 23, 'f'); R(2, 2, 18, 19, 'v'); R(10, 2, 2, 19, 'f'); R(2, 11, 18, 2, 'f'); R(0, 23, 22, 3, 'f');
  R(4, 5, 4, 1, 'n'); R(3, 6, 6, 1, 'n'); R(13, 15, 4, 1, 'n'); R(12, 16, 6, 1, 'n');
  for (const [x, y] of [[5, 4], [16, 6], [4, 15], [14, 18], [7, 9]]) R(x, y, 1, 1, 'e');
});

// La biblioteca de la colección: lámpara colgante (a cable · o pantalla · O sombra · y bombilla), la escalera de mano,
// la caja de cartón del envío anual (c cartón · C sombra · T cinta · w etiqueta · 1-6 lomos) y la tableta del PDF.
const LAMPARA = rejilla(14, 22, R => { R(6, 0, 2, 9, 'a'); R(5, 9, 4, 2, 'O'); for (let i = 0; i < 6; i++) R(5 - i, 11 + i, 4 + i * 2, 1, i % 2 ? 'O' : 'o'); R(5, 17, 4, 2, 'y'); });
const ESCALERA = rejilla(18, 72, R => { R(1, 0, 3, 72, 'm'); R(14, 0, 3, 72, 'm'); for (let y = 6; y < 72; y += 11) R(4, y, 10, 2, 'M'); });
const CAJA = rejilla(32, 26, R => {
  [['1', 3], ['2', 7], ['3', 11], ['4', 15], ['5', 19], ['6', 23]].forEach(([c2, x], i) => R(x, i % 2 ? 1 : 0, 4, 8, c2));
  R(0, 6, 32, 20, 'c'); R(0, 6, 32, 3, 'C'); R(14, 6, 4, 20, 'T'); R(3, 14, 9, 6, 'w'); R(4, 16, 7, 1, 'C'); R(4, 18, 5, 1, 'C'); R(0, 24, 32, 2, 'C');
});
const TABLETA = rejilla(18, 24, R => {
  R(0, 0, 18, 24, 'g'); R(2, 2, 14, 18, 's'); R(4, 4, 10, 4, 'r'); for (const y of [10, 12, 14, 16]) R(4, y, 10, 1, 'l'); R(8, 21, 2, 1, 's');
});

// El barrio de detrás de Familia y Fundadores: casas de colores (a/b/c/d fachadas, r/R tejados, w ventanas que de noche
// se encienden, p puertas, h chimeneas), árboles (t copa, q tronco) y farolas (l poste, y luz).
function rejillaBarrio() {
  const W = 480;
  const H = 64;
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  const R = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && i < W && j >= 0 && j < H) g[j][i] = c; };
  const casa = (x0, ancho, alto, n) => {
    const pared = 'abcd'[n % 4];
    const tejado = n % 2 ? 'r' : 'R';
    const arriba = H - alto;
    R(x0, arriba, ancho, alto, pared);
    const pisos = Math.floor((alto - 10) / 10);
    for (let p = 0; p < pisos; p++) for (let v = 3; v + 4 <= ancho - 3; v += 8) if (!(p === pisos - 1 && Math.abs(v + 2 - ancho / 2) < 4)) R(x0 + v, arriba + 4 + p * 10, 4, 5, (v + p + n) % 3 ? 'w' : 'W');
    R(x0 + Math.floor(ancho / 2) - 3, H - 10, 6, 10, 'p');
    for (let i = 0; i < 6; i++) R(x0 - 2 + i * 2, arriba - 1 - i, ancho + 4 - i * 4, 1, tejado);
    if (n % 3 === 0) R(x0 + ancho - 9, arriba - 12, 4, 9, 'h');
  };
  const arbol = cx => {
    for (const [dy, hw] of [[0, 3], [1, 5], [2, 6], [3, 6], [4, 6], [5, 6], [6, 5], [7, 3]]) R(cx - hw, H - 22 + dy, hw * 2 + 1, 1, 't');
    R(cx - 1, H - 14, 3, 14, 'q');
  };
  const farola = x => { R(x, H - 26, 2, 26, 'l'); R(x - 2, H - 29, 6, 3, 'l'); R(x - 1, H - 27, 4, 2, 'y'); };
  let x = 0;
  let n = 0;
  while (x < W) {
    const ancho = 30 + ((n * 7) % 18);
    const alto = 30 + ((n * 11) % 22);
    casa(x, ancho, alto, n);
    x += ancho + 2;
    if (n % 2 === 0) { arbol(x + 8); x += 18; } else { farola(x + 6); x += 14; }
    n++;
  }
  return conContorno(g.map(f => f.join(''))).slice(1, -1);
}

// Los dibujitos del pergamino de las promesas, uno por promesa (el contorno lo pone conContorno).
const ICONOS_PROMESA = [
  // la hucha con su moneda: anuncios solo si tú quieres
  ['....cccc....', '....cCCc....', '....cccc....', '............', '..ppppppp...', '.ppppppppp.p', 'pppepppppppp', 'ppppppppppp.', 'Pppppppppp..', '.ppppppppp..', '.pP.....pP..'],
  // un corazón entero: sin vidas ni castigos
  ['.rrr...rrr.', 'rrwrr.rrrrr', 'rwrrrrrrrrr', 'rrrrrrrrrrr', 'rrrrrrrrrrR', '.rrrrrrrrR.', '..rrrrrrR..', '...rrrrR...', '....rrR....', '.....R.....'],
  // el botón: cancelar es pulsar y ya
  ['...rrrrr...', '.rrrrrrrrr.', 'rrwrrrrrrrr', 'rrrrrrrrrrr', 'RrrrrrrrrrR', 'gRRRRRRRRRg', 'ggggggggggg', 'GGGGGGGGGGG'],
  // el candado: tu precio no sube
  ['..gggggg..', '.gg....gg.', '.g......g.', '.g......g.', 'yyyyyyyyyy', 'yyyykkyyyy', 'yyyykkyyyy', 'yyyykkyyyy', 'YyyyyyyyyY', 'YYYYYYYYYY'],
  // el regalo: si cerramos, os quedáis con una copia
  ['..rr...rr..', '.r..r.r..r.', '..rrrrrrr..', 'bbbbbrbbbbb', 'bbbbbrbbbbb', 'BBBBBrBBBBB', '.bbbbrbbbb.', '.bbbbrbbbb.', '.bbbbrbbbb.', '.BBBBrBBBB.'],
];

/** Pinta la pantalla. Devuelve una función que la apaga: hay que llamarla al salir. */
export function pintarPrecios(contenedor) {
  const apagar = [];
  let encendida = true;
  const despues = (ms, fn) => { const r = setTimeout(() => encendida && fn(), ms); apagar.push(() => clearTimeout(r)); };
  const euros = n => n.toLocaleString(locale(), { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0 });
  const disponibles = CURSOS.filter(c => !c.proximamente);
  const barajadas = [...disponibles].sort(() => Math.random() - 0.5);
  const principal = hayCurso ? curso : (disponibles.find(c => c.id === 'es') ?? disponibles[0]);
  const otras = barajadas.filter(c => c.id !== principal.id);
  // Las demás se reparten sin repetirse: cada sitio de la página se lleva la siguiente que quede libre.
  let siguienteLibre = 0;
  const repartir = (n = 1) => { const lote = otras.slice(siguienteLibre, siguienteLibre + n); siguienteLibre += n; return lote; };

  const z = preciosDeSuZona();
  let pago = 'ano'; // ano · mes

  // ----- Tutoras vivas: solo se mueven las de las secciones que están en pantalla -----
  // Las «quietas» (las alumnas de la pizarra) se pintan una vez y solo despiertan para hacer su gesto.
  const vivas = [];
  const vistas = new Set();
  const seVe = v => !document.hidden && [...vistas].some(s => s.contains(v.figura));
  const despertar = v => { if (v.dibujo && !v.sprite) v.sprite = v.dibujo.crearSprite(v.figura.querySelector('canvas')); };
  const dormirla = v => { v.siesta = null; v.sprite?.parar(); v.sprite = null; };
  // se para cuando ha pintado algún fotograma y ya no tiene gestos pendientes
  const dormirAlAcabar = v => {
    const turno = v.siesta = {};
    const mirar = () => {
      if (v.siesta !== turno || !v.sprite) return;
      if (v.sprite.pintados && !v.sprite.ocupada()) dormirla(v); else setTimeout(mirar, 200);
    };
    setTimeout(mirar, 200);
  };
  // una quieta: se dibuja un momento y se para (el lienzo conserva el dibujo)
  const pintarQuieta = v => { if (v.pintada || !v.dibujo) return; v.pintada = true; despertar(v); dormirAlAcabar(v); };
  function tutoraViva(c, quieta = false) {
    const canvas = el('canvas', { class: 'tutora-lienzo', width: 48, height: 64 });
    const globo = el('span', { class: 'pr-globo' });
    const figura = el('div', { class: 'inicio-figura pr-tutora', 'aria-hidden': 'true' }, globo, canvas);
    const yo = { figura, sprite: null, dibujo: null, apagarGlobo: null, quieta, pintada: false, siesta: null };
    dibujoDe(c).then(d => { yo.dibujo = d; if (seVe(yo)) (quieta ? pintarQuieta(yo) : despertar(yo)); }).catch(() => { figura.hidden = true; });
    yo.gesto = nombre => {
      if (!quieta) return yo.sprite?.gesto(nombre);
      if (!seVe(yo)) return false;
      despertar(yo);
      yo.sprite?.gesto(nombre);
      dormirAlAcabar(yo);
      return true;
    };
    yo.decir = (texto, ms = 3200) => {
      globo.textContent = texto;
      figura.classList.add('habla');
      clearTimeout(yo.apagarGlobo);
      yo.apagarGlobo = setTimeout(() => figura.classList.remove('habla'), ms);
    };
    figura.addEventListener('click', () => { sonar('saludo'); yo.gesto('firma'); });
    vivas.push(yo);
    return yo;
  }
  let visible = false;
  const actualizar = () => {
    visible = vistas.size > 0 && !document.hidden;
    for (const v of vivas) {
      const ve = seVe(v);
      if (v.quieta) { if (ve) pintarQuieta(v); else if (v.sprite) dormirla(v); } else if (ve) despertar(v); else dormirla(v);
    }
  };
  const dormir = () => { visible = false; for (const v of vivas) dormirla(v); };
  document.addEventListener('visibilitychange', actualizar);
  apagar.push(() => { dormir(); document.removeEventListener('visibilitychange', actualizar); for (const v of vivas) clearTimeout(v.apagarGlobo); });

  // ----- «Muy pronto»: todavía no se cobra -----
  const pronto = (quien, nota) => () => {
    sonar('duda');
    quien?.gesto('rascarse');
    quien?.decir(t('precios.prontoTutora'));
    if (nota) {
      nota.hidden = false;
      despues(4200, () => { nota.hidden = true; });
    }
  };
  const botonPronto = (quien, clase = '') => {
    const nota = el('p', { class: 'pr-nota-pronto', role: 'status', hidden: true }, t('precios.prontoTutora'));
    return [el('button', { type: 'button', class: `pr-boton ${clase}`.trim(), onclick: pronto(quien, quien ? null : nota) }, t('precios.pronto')), nota];
  };

  // =====================================================================
  // 1. La escalera
  // =====================================================================
  const tGratis = tutoraViva(repartir()[0]);
  const tPlus = tutoraViva(repartir()[0]);
  const tMax = tutoraViva(principal);

  const precioPlus = el('p', { class: 'pr-precio' });
  const porPlus = el('p', { class: 'pr-por' });
  const precioMax = el('p', { class: 'pr-precio' });
  const porMax = el('p', { class: 'pr-por' });
  const lista = claves => el('ul', { class: 'pr-lista' }, claves.map(([clave, datos, marca]) => el('li', {}, t(clave, datos ?? undefined), marca ?? null)));

  // En el móvil los tres planes van uno debajo de otro, recogidos: «Qué incluye» despliega la lista de cada uno.
  const peldano = (plan, tutora, cuerpo) => {
    const li = el('li', { class: `pr-peldano pr-${plan}` });
    const ver = el('button', { type: 'button', class: 'pr-ver', 'aria-expanded': 'false' }, t('pr.verIncluye'));
    ver.addEventListener('click', () => {
      const abierto = li.classList.toggle('pr-abierto');
      // en el móvil, uno abierto cada vez, y lo de arriba se vuelve a encajar en la pantalla
      if (abierto && innerWidth <= 640) for (const otro of li.parentElement.querySelectorAll('.pr-abierto')) if (otro !== li) { otro.classList.remove('pr-abierto'); otro.querySelector('.pr-ver').setAttribute('aria-expanded', 'false'); }
      requestAnimationFrame(encajar);
      ver.setAttribute('aria-expanded', String(abierto));
      sonar(abierto ? 'abrir' : 'cerrar');
      if (abierto) tutora.gesto('presentarIzq');
    });
    const lista = cuerpo.find(n => n?.classList?.contains('pr-lista'));
    cuerpo.splice(cuerpo.indexOf(lista), 0, ver);
    poner(li, tutora.figura, el('div', { class: 'pr-bloque' }, cuerpo));
    return li;
  };
  const peldanoGratis = peldano('gratis', tGratis, [
    el('p', { class: 'pr-nombre' }, t('pr.gratis.nombre')),
    el('p', { class: 'pr-lema' }, t('pr.gratis.lema')),
    el('p', { class: 'pr-precio' }, euros(0)),
    el('p', { class: 'pr-por' }, t('pr.siempre')),
    lista([['pr.g1'], ['pr.g2', { n: LECCIONES_GRATIS_AL_DIA }], ['pr.g3'], ['pr.g4'], ['pr.g5']]),
    el('a', { class: 'pr-boton', href: hayCurso ? '#/lecciones' : '#/idiomas', onclick: () => sonar('pagina') },
      hayCurso ? t('inicio.continuar', { curso: curso.nativo }) : t('inicio.empezar')),
  ]);
  const peldanoPlus = peldano('plus', tPlus, [
    el('span', { class: 'pr-cinta' }, t('pr.favorito')),
    el('p', { class: 'pr-nombre' }, t('pr.plus.nombre')),
    el('p', { class: 'pr-lema' }, t('pr.plus.lema')),
    precioPlus, porPlus,
    lista([['pr.p1'], ['pr.p2'], ['pr.p4', null, '*'], ['pr.p5']]),
    ...botonPronto(tPlus),
  ]);
  const peldanoMax = peldano('max', tMax, [
    el('p', { class: 'pr-nombre' }, t('pr.max.nombre')),
    el('p', { class: 'pr-lema' }, t('pr.max.lema')),
    precioMax, porMax,
    lista([['pr.m1'], ['pr.m2'], ['pr.m3', null, '*'], ['pr.m4'], ['pr.m6']]),
    ...botonPronto(tMax, 'pr-boton-oro'),
  ]);

  // el pago: anual o mensual
  const ahorro = Math.round((1 - z.plusAno / (z.plusMes * 12)) * 100);
  const bAnual = el('button', { type: 'button', onclick: () => cambiarPago('ano') }, t('pr.anual'), el('span', { class: 'pr-ahorro' }, t('pr.ahorra', { n: ahorro })));
  const bMensual = el('button', { type: 'button', onclick: () => cambiarPago('mes') }, t('pr.mensual'));

  const contenidoArriba = el('div', { class: 'pr-arriba' },
    el('div', { class: 'pr-cabeza' },
      el('span', { class: 'pr-etiqueta' }, t('precios.titulo')),
      el('h1', { class: 'pr-titulo' }, t('pr.titulo')),
      el('p', { class: 'pr-texto' }, t('pr.texto')),
      el('div', { class: 'pr-controles' },
        el('div', { class: 'pr-pago', role: 'group', 'aria-label': t('precios.elegir') }, bAnual, bMensual),
        el('p', { class: 'pr-region' }, t('pr.region'), ' ', el('a', { class: 'pr-como', href: '#/legal', onclick: () => sonar('pagina') }, t('pr.regionComo'), el('span', { class: 'pr-globito', role: 'tooltip' }, t('pr.regionGlobo')))))),
    el('ol', { class: 'pr-escalera' }, peldanoGratis, peldanoPlus, peldanoMax),
    el('p', { class: 'pr-nota-oral' }, t('pr.nota.oral')));
  const escenario = el('section', { class: 'pr-escenario' },
    el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }, sol(), luna(), nubes()),
    contenidoArriba,
    el('div', { class: 'inicio-suelo', 'aria-hidden': 'true' }));

  function cambiarPago(nuevo) {
    if (nuevo === pago) return;
    pago = nuevo;
    sonar(pago === 'ano' ? 'moneda' : 'elegir');
    pintarPreciosZona();
    if (pago === 'ano') { tMax.gesto('celebrar'); tMax.decir(t('pr.col.anual.titulo') + ': ' + t('pr.col.anual.texto')); } else tPlus.gesto('pulgar');
  }

  // =====================================================================
  // 2. La Hucha
  // =====================================================================
  const tHucha = tutoraViva(repartir()[0]);
  // El cuarto: la tele echa un anuncio y de la pantalla sale una moneda que va volando hasta la ranura del cerdito.
  const cuarto = el('div', { class: 'pr-hucha-escena', 'aria-hidden': 'true' },
    dibujoPixel(VENTANA, 'pr-cuarto-ventana', 'vh'),
    el('div', { class: 'pr-hucha-barra' }, el('span', {}, t('pr.hucha.titulo')), el('i', {}, el('i')), el('b', {}, 'Plus')),
    dibujoPixel(MESA, 'pr-mesa', 'me'),
    dibujoPixel(TELE, 'pr-tele', 'tv'),
    el('span', { class: 'pr-tele-brillo' }),
    tHucha.figura,
    dibujoPixel(TABURETE, 'pr-taburete', 'me'),
    el('div', { class: 'pr-hucha-dibujo' }, dibujoPixel(rejillaHucha(), 'pr-cerdito', 'h')),
    maceta(2),
    el('span', { class: 'pr-moneda-vuela' }), el('span', { class: 'pr-moneda-vuela pr-moneda-2' }));
  const seccionHucha = el('section', { class: 'pr-seccion pr-hucha' },
    cuarto,
    el('div', { class: 'pr-hucha-texto' },
      el('span', { class: 'pr-etiqueta pr-etiqueta-coral' }, t('pr.hucha.etiqueta')),
      el('h2', {}, t('pr.hucha.titulo')),
      el('p', { class: 'pr-entradilla' }, t('pr.hucha.texto')),
      el('ol', { class: 'pr-pasos' }, ['pr.hucha.paso1', 'pr.hucha.paso2', 'pr.hucha.paso3'].map((k, i) => el('li', {}, el('b', {}, String(i + 1)), t(k)))),
      el('p', { class: 'pr-regla' }, t('pr.hucha.regla')),
      ...botonPronto(tHucha)));

  // =====================================================================
  // 3. La colección de Max
  // =====================================================================
  const LIBROS = [['A1', 'a1', '#5fae6a'], ['A2', 'a2', '#4f9fd8'], ['B1', 'b1', '#9a6bd1'], ['B2', 'b2', '#d2353d'], ['GR', 'gram', '#f08a4b'], ['EX', 'examen', '#f4c84a']];
  const GESTOS_LIBRO = ['saludar', 'hojear', 'escribir', 'pulgar', 'pensar', 'celebrar'];
  const enPdf = z.libros === 'pdf';
  const corto = codigo => (codigo === 'GR' ? t('pr.libro.gramCorto') : codigo === 'EX' ? t('pr.libro.examenCorto') : codigo);
  // cada portada lleva a la tutora viva: al pasar por el libro, hace lo suyo
  const estante = el('ul', { class: 'pr-estante' }, LIBROS.map(([codigo, clave, color], i) => {
    const tutora = tutoraViva(principal);
    tutora.figura.classList.add('pr-libro-tutora');
    const libro = el('li', { class: 'pr-libro', style: `--c:${color}` },
      el('span', { class: 'pr-libro-marca' }, 'Paglot'),
      tutora.figura,
      el('b', {}, corto(codigo)),
      el('span', { class: 'pr-libro-nombre' }, t(`pr.libro.${clave}`)),
      enPdf ? el('span', { class: 'pr-sello-pdf' }, 'PDF') : null);
    libro.addEventListener('pointerenter', () => tutora.gesto(GESTOS_LIBRO[i]));
    return libro;
  }));
  const tEscalera = tutoraViva(principal);
  tEscalera.figura.classList.add('pr-escalera-tutora');

  // cómo llegan: la caja con todo (pago anual) y el camino de paquetes nivel a nivel (pago mensual); o el PDF
  const pasos = [['A1', 'GR'], ['A2'], ['B1'], ['B2'], ['EX']];
  const envios = enPdf
    ? el('div', { class: 'pr-carta pr-envio pr-envio-pdf' },
      dibujoPixel(TABLETA, 'pr-tableta', 'tb'),
      el('div', {}, el('h3', {}, 'PDF'), el('p', {}, t('pr.col.pdf'))))
    : el('div', { class: 'pr-dos' },
      el('div', { class: 'pr-carta pr-envio' },
        dibujoPixel(CAJA, 'pr-caja', 'cj'),
        el('div', {}, el('h3', {}, t('pr.col.anual.titulo')), el('p', {}, t('pr.col.anual.texto')))),
      el('div', { class: 'pr-carta pr-envio pr-envio-mes' },
        el('div', {}, el('h3', {}, t('pr.col.mes.titulo')), el('p', {}, t('pr.col.mes.texto'))),
        el('ol', { class: 'pr-camino', 'aria-hidden': 'true' }, pasos.map((p, i) => el('li', { style: `--n:${i}` },
          el('span', { class: 'pr-paquete' }), el('b', {}, p.map(corto).join(' + ')))))));

  const seccionColeccion = el('section', { class: 'pr-seccion pr-coleccion' },
    el('div', { class: 'pr-biblio-fondo', 'aria-hidden': 'true' }, el('i', { class: 'pr-biblio-libros' }), el('i', { class: 'pr-biblio-baldas' })),
    dibujoPixel(LAMPARA, 'pr-lampara pr-lampara-izq', 'lp'), dibujoPixel(LAMPARA, 'pr-lampara pr-lampara-der', 'lp'),
    el('span', { class: 'pr-luz pr-luz-izq', 'aria-hidden': 'true' }), el('span', { class: 'pr-luz pr-luz-der', 'aria-hidden': 'true' }),
    el('span', { class: 'pr-etiqueta' }, t('pr.max.nombre')),
    el('h2', {}, t('pr.col.titulo')),
    el('p', { class: 'pr-entradilla' }, t('pr.col.texto', { tutora: NOMBRES_TUTORAS[principal.id] ?? '' })),
    el('div', { class: 'pr-estanteria' },
      estante,
      el('div', { class: 'pr-tabla-madera', 'aria-hidden': 'true' }, el('i'), el('i')),
      el('div', { class: 'pr-escalera-mano', 'aria-hidden': 'true' }, dibujoPixel(ESCALERA, 'pr-escalera-dibujo', 'lp'), tEscalera.figura)),
    envios,
    el('p', { class: 'pr-col-otro' }, t('pr.col.otro')));

  // =====================================================================
  // 4. Familia y Fundadores
  // =====================================================================
  const precioFamilia = el('p', { class: 'pr-precio pr-precio-medio' });
  const porFamilia = el('p', { class: 'pr-por' });
  const precioFundadores = el('p', { class: 'pr-precio pr-precio-medio' });

  // Familia: una casita con chimenea y las seis tutoras dentro, cada una con su barrita de progreso; hacen la ola
  const familia = repartir(6).map(c => tutoraViva(c));
  const casa = el('div', { class: 'pr-casa', 'aria-hidden': 'true' },
    el('div', { class: 'pr-chimenea' }, el('i'), el('i'), el('i')),
    el('div', { class: 'pr-tejado' }),
    el('ul', { class: 'pr-casa-fila' }, familia.map((x, i) => el('li', { style: `--n:${i}` },
      x.figura, el('span', { class: 'pr-casa-barra' }, el('i'))))),
    el('div', { class: 'pr-casa-suelo' }));
  let olaEn = 0;
  const ola = () => {
    if (!vistas.has(seccionExtras) || document.hidden) return;
    const gesto = ['saludar', 'vueltecita', 'aplaudir'][olaEn++ % 3];
    familia.forEach((x, i) => despues(i * 180, () => x.gesto(gesto)));
  };

  // Fundadores: el carné, con la foto de una tutora, el número de plaza rodando y un brillo que lo cruza
  const fundadora = tutoraViva(repartir()[0]);
  const numero = el('b', { class: 'pr-carne-numero' }, 'Nº 0001');
  const carne = el('div', { class: 'pr-carne', 'aria-hidden': 'true' },
    el('div', { class: 'pr-carne-cabeza' }, el('span', { class: 'pr-carne-marca' }, 'Pa', el('i', {}, 'glot')), el('span', {}, '★ ' + t('pr.fun.titulo').toUpperCase())),
    el('div', { class: 'pr-carne-cuerpo' },
      el('div', { class: 'pr-carne-foto' }, fundadora.figura),
      el('div', { class: 'pr-carne-datos' },
        numero,
        el('span', { class: 'pr-carne-plus' }, 'PLUS ∞'),
        el('span', { class: 'pr-carne-lineas' }, el('i'), el('i'), el('i')))),
    el('span', { class: 'pr-carne-sello' }, '★'),
    el('span', { class: 'pr-chispa', style: '--n:0' }), el('span', { class: 'pr-chispa', style: '--n:1' }), el('span', { class: 'pr-chispa', style: '--n:2' }));
  let plaza = 1;
  const rodarPlaza = () => {
    if (!vistas.has(seccionExtras) || document.hidden) return;
    plaza = (plaza % PLAZAS_FUNDADORES) + 1 + Math.floor(Math.random() * 37);
    if (plaza > PLAZAS_FUNDADORES) plaza = 1;
    numero.textContent = `Nº ${String(plaza).padStart(4, '0')}`;
  };

  const seccionExtras = el('section', { class: 'pr-seccion pr-extras' },
    el('div', { class: 'inicio-cielo pr-barrio-cielo', 'aria-hidden': 'true' }, nubes()),
    dibujoPixel(rejillaBarrio(), 'pr-barrio', 'bz'),
    el('div', { class: 'pr-acera', 'aria-hidden': 'true' }),
    el('div', { class: 'pr-carta pr-familia' },
      casa,
      el('h3', {}, t('pr.fam.titulo')),
      el('p', {}, t('pr.fam.texto')),
      precioFamilia, porFamilia,
      ...botonPronto(null)),
    el('div', { class: 'pr-carta pr-fundadores' },
      carne,
      el('h3', {}, t('pr.fun.titulo')),
      el('p', {}, t('pr.fun.texto', { n: PLAZAS_FUNDADORES.toLocaleString(locale()) })),
      precioFundadores,
      el('p', { class: 'pr-por' }, t('pr.fun.unPago')),
      ...botonPronto(null, 'pr-boton-oro')));

  // =====================================================================
  // 5. Qué incluye cada plan
  // =====================================================================
  const SI = { si: true };
  const FILAS = [
    ['pr.t.idiomas', SI, SI, SI],
    ['pr.t.lecciones', String(LECCIONES_GRATIS_AL_DIA), '∞', '∞'],
    ['pr.t.repaso', '∞', '∞', '∞'],
    ['pr.t.practica', 'pr.v.limitado', '∞', '∞'],
    ['pr.t.simulacros', null, 'pr.v.alMes', '∞', '*'],
    ['pr.t.certificado', null, 'pr.v.dePago', SI, '**'],
    ['pr.t.familia', null, 'pr.v.conFamilia', SI],
    ['pr.t.trajes', 'pr.v.dePago', 'pr.v.dePago', 'pr.v.dePago'],
    ['pr.t.libros', null, null, SI],
    ['pr.t.hucha', SI, null, null],
  ];
  // lo que hace la tutora de cada fila cuando el puntero la señala
  const GESTO_FILA = {
    'pr.t.idiomas': 'saludar', 'pr.t.lecciones': 'escribir', 'pr.t.repaso': 'asentir', 'pr.t.practica': 'pensar',
    'pr.t.simulacros': 'rascarse', 'pr.t.certificado': 'presentarDer', 'pr.t.familia': 'aplaudir', 'pr.t.trajes': 'vueltecita',
    'pr.t.libros': 'hojear', 'pr.t.hucha': 'celebrar',
  };
  const celda = (v, clase = '') => {
    if (v === SI) return el('td', { class: `pr-si ${clase}` }, el('span', { class: 'pr-check', 'aria-label': '✔' }));
    if (v === null) return el('td', { class: `pr-no ${clase}` }, el('span', { class: 'pr-raya', 'aria-label': '—' }));
    return el('td', { class: clase }, v.startsWith('pr.') ? t(v) : v);
  };
  const alumnas = repartir(FILAS.length).map(c2 => tutoraViva(c2, true));
  const filas = FILAS.map(([clave, gr, pl, mx, marca], i) => {
    const alumna = alumnas[i];
    alumna?.figura.classList.add('pr-alumna');
    const fila = el('tr', { 'data-gesto': GESTO_FILA[clave] ?? 'saludar' },
      el('th', { scope: 'row' }, el('div', { class: 'pr-fila-nombre' }, el('span', { class: 'pr-fila-quien' }, alumna?.figura ?? null), el('span', { class: 'pr-fila-que' }, t(clave), marca ?? null))),
      celda(gr), celda(pl), celda(mx, 'pr-col-max'));
    fila.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { manual = true; senalar(i); } });
    fila.addEventListener('pointerleave', () => { manual = false; });
    return { fila, alumna };
  });
  const puntero = el('span', { class: 'pr-puntero', 'aria-hidden': 'true' });
  const tabla = el('table', { class: 'pr-tabla pr-pizarra-tabla' },
    el('thead', {}, el('tr', {}, el('th', {}, ''),
      el('th', { class: 'pr-th-gratis' }, t('pr.gratis.nombre')),
      el('th', { class: 'pr-th-plus' }, t('pr.plus.nombre')),
      el('th', { class: 'pr-th-max pr-col-max' }, t('pr.max.nombre')))),
    el('tbody', {}, filas.map(f => f.fila)));
  let activa = -1;
  let manual = false;
  function senalar(i) {
    if (activa === i) return;
    filas[activa]?.fila.classList.remove('pr-activa');
    activa = i;
    const { fila, alumna } = filas[i];
    fila.classList.add('pr-activa');
    const caja = puntero.parentElement.getBoundingClientRect();
    const sitio = fila.getBoundingClientRect();
    puntero.style.transform = `translateY(${Math.round(sitio.top - caja.top + sitio.height / 2 - 12)}px)`;
    alumna?.gesto(fila.dataset.gesto);
  }
  const pasarLista = () => { if (!vistas.has(seccionTabla) || document.hidden || manual) return; senalar((activa + 1) % filas.length); };

  const seccionTabla = el('section', { class: 'pr-seccion pr-comparar' },
    el('div', { class: 'pr-aula-pared', 'aria-hidden': 'true' },
      el('span', { class: 'pr-reloj' }, el('i', { class: 'pr-reloj-hora' }), el('i', { class: 'pr-reloj-min' })),
      el('span', { class: 'pr-poster' }, el('i'), el('i'), el('i'), el('i'))),
    el('h2', { class: 'pr-aula-titulo' }, el('span', {}, t('pr.tabla.titulo'))),
    el('div', { class: 'pr-pizarra' },
      puntero,
      el('div', { class: 'pr-pizarra-dentro' }, tabla),
      el('div', { class: 'pr-repisa', 'aria-hidden': 'true' }, el('i', { class: 'pr-tiza' }), el('i', { class: 'pr-tiza pr-tiza-rosa' }), el('i', { class: 'pr-tiza pr-tiza-amarilla' }), el('i', { class: 'pr-borrador' }))),
    el('div', { class: 'pr-notas' }, el('p', {}, t('pr.nota.oral')), el('p', {}, t('pr.nota.certificado')), el('p', {}, t('pr.nota.caprichos'))),
    el('div', { class: 'pr-aula-suelo', 'aria-hidden': 'true' }));

  // =====================================================================
  // 6. Las promesas
  // =====================================================================
  // Un pergamino que se desenrolla al llegar; cada promesa lleva su dibujito y un sello de lacre que se estampa
  // uno detrás de otro. Abajo, la firma. Al pulsar un sello se vuelve a estampar.
  const lacre = () => {
    const sello = el('span', { class: 'pr-lacre', 'aria-hidden': 'true' }, '♥');
    sello.addEventListener('click', () => {
      sonar('sello');
      sello.classList.remove('pr-otra-vez');
      void sello.offsetWidth;
      sello.classList.add('pr-otra-vez');
    });
    return sello;
  };
  const seccionPromesas = el('section', { class: 'pr-seccion pr-promesas' },
    el('div', { class: 'inicio-cielo', 'aria-hidden': 'true' }, nubes()),
    el('div', { class: 'pr-corazones', 'aria-hidden': 'true' }, Array.from({ length: 9 }, (_, i) => el('i', { style: `--n:${i}` }))),
    el('div', { class: 'pr-pergamino' },
      el('div', { class: 'pr-rodillo', 'aria-hidden': 'true' }),
      el('div', { class: 'pr-rollo' },
        el('div', { class: 'pr-papel' },
          el('h2', {}, t('precios.promesas.titulo')),
          el('ol', { class: 'pr-juras' }, ['pr.prom1', 'precios.p2', 'precios.p3', 'pr.prom5', 'precios.p4'].map((k, i) =>
            el('li', { style: `--n:${i}` },
              el('span', { class: 'pr-jura-icono' }, dibujoPixel(conContorno(ICONOS_PROMESA[i]), 'pr-icono-promesa', 'pi')),
              el('p', {}, t(k)),
              lacre()))),
          el('div', { class: 'pr-firma', 'aria-hidden': 'true' },
            el('span', { class: 'pr-firma-nombre' }, 'Pa', el('i', {}, 'glot')),
            el('span', { class: 'pr-firma-trazo' })))),
      el('div', { class: 'pr-rodillo pr-rodillo-abajo', 'aria-hidden': 'true' })),
    el('p', { class: 'pr-aviso' }, t('pr.aviso')));

  // ----- Los precios de la zona y el tipo de pago elegidos -----
  function pintarPreciosZona() {
    const anual = pago === 'ano';
    bAnual.setAttribute('aria-pressed', String(anual));
    bMensual.setAttribute('aria-pressed', String(!anual));
    const poner2 = (nodo, texto) => {
      if (nodo.textContent === texto) return;
      nodo.textContent = texto;
      nodo.classList.remove('pr-salta');
      void nodo.offsetWidth;
      nodo.classList.add('pr-salta');
    };
    poner2(precioPlus, euros(anual ? z.plusAno : z.plusMes));
    porPlus.textContent = anual ? t('pr.alAnoEquivale', { p: euros(Math.round(z.plusAno / 12 * 100) / 100) }) : t('pr.alMes');
    poner2(precioMax, euros(anual ? z.maxAno : z.maxMes));
    porMax.textContent = anual ? t('pr.alAnoEquivale', { p: euros(Math.round(z.maxAno / 12 * 100) / 100) }) : t('pr.alMesCompromiso');
    poner2(precioFamilia, euros(z.familia));
    porFamilia.textContent = t('pr.fam.porPersona', { p: euros(Math.round(z.familia / 6 * 100) / 100) });
    poner2(precioFundadores, euros(z.fundadores));
  }

  // ----- Montaje -----
  poner(contenedor, el('div', { class: 'precios' }, escenario, seccionHucha, seccionColeccion, seccionExtras, seccionTabla, seccionPromesas));
  pintarPreciosZona();

  // ----- En el móvil, el resto no va debajo: cada sección se abre a pantalla completa desde unos botones.
  // Nada se desplaza: lo que no cabe se reparte en páginas (flechas, puntos o deslizar el dedo) y cada página
  // se encoge lo justo para caber.
  let abierta = null;
  const ENCOGER_MIN = 0.62;
  const piezasDe = s => [...s.children].filter(k => !k.matches('.pr-panel-cerrar, .pr-paginas') && getComputedStyle(k).position !== 'absolute');
  const altoDe = k => { const e = getComputedStyle(k); return Math.max(k.offsetHeight, k.scrollHeight) + parseFloat(e.marginTop) + parseFloat(e.marginBottom); };
  function paginar(s) {
    const piezas = piezasDe(s);
    for (const k of piezas) { k.classList.remove('pr-oculta'); k.style.zoom = ''; }
    const e = getComputedStyle(s);
    const sitio = s.clientHeight - parseFloat(e.paddingTop) - parseFloat(e.paddingBottom);
    const paginas = [];
    let lista = [];
    let suma = 0;
    for (const k of piezas) {
      const h = altoDe(k);
      if (lista.length && suma + h > sitio) { paginas.push({ lista, suma }); lista = []; suma = 0; }
      lista.push(k);
      suma += h;
    }
    if (lista.length) paginas.push({ lista, suma });
    for (const p of paginas) p.zoom = Math.max(ENCOGER_MIN, Math.min(1, sitio / p.suma));
    s.paginas = paginas;
    const nav = s.querySelector('.pr-paginas');
    nav.hidden = paginas.length < 2;
    poner(nav.querySelector('.pr-puntos'), paginas.map(() => el('i', { class: 'pr-punto' })));
    irA(s, Math.min(s.pagina ?? 0, paginas.length - 1), false);
  }
  // lo medido antes de encoger no siempre coincide con lo que ocupa después: se mide la página ya puesta y se corrige
  function ajustar(s) {
    const p = s.paginas?.[s.pagina];
    if (!p) return;
    const e = getComputedStyle(s);
    const sitio = s.clientHeight - parseFloat(e.paddingTop) - parseFloat(e.paddingBottom);
    const marco = s.getBoundingClientRect();
    const arriba = marco.top + parseFloat(e.paddingTop);
    const abajo = marco.bottom - parseFloat(e.paddingBottom);
    for (let vez = 0; vez < 4; vez++) {
      const cajas = p.lista.map(k => k.getBoundingClientRect());
      const top = Math.min(...cajas.map(c => c.top));
      const bottom = Math.max(...cajas.map(c => c.bottom));
      if (top >= arriba - 1 && bottom <= abajo + 1) return;
      const alto = Math.max(bottom - top, 2 * Math.max(bottom - (arriba + abajo) / 2, (arriba + abajo) / 2 - top));
      p.zoom = Math.max(0.5, p.zoom * sitio / alto);
      for (const k of p.lista) k.style.zoom = p.zoom.toFixed(3);
    }
  }
  function irA(s, n, conSonido = true) {
    const paginas = s.paginas;
    if (!paginas || n < 0 || n >= paginas.length) return;
    if (conSonido && n !== s.pagina) sonar('pagina');
    s.pagina = n;
    paginas.forEach((p, i) => p.lista.forEach(k => { k.classList.toggle('pr-oculta', i !== n); k.style.zoom = i === n && p.zoom < 1 ? p.zoom.toFixed(3) : ''; }));
    ajustar(s);
    const nav = s.querySelector('.pr-paginas');
    nav.querySelectorAll('.pr-punto').forEach((d, i) => d.classList.toggle('pr-punto-ya', i === n));
    nav.querySelector('.pr-atras').disabled = n === 0;
    nav.querySelector('.pr-alante').disabled = n === paginas.length - 1;
  }
  const cerrarPanel = () => {
    if (!abierta) return;
    for (const k of piezasDe(abierta)) { k.classList.remove('pr-oculta'); k.style.zoom = ''; }
    abierta.classList.remove('pr-panel');
    document.documentElement.classList.remove('pr-con-panel');
    abierta = null;
    sonar('cerrar');
  };
  const abrirPanel = seccion => {
    abierta = seccion;
    seccion.pagina = 0;
    seccion.classList.add('pr-panel');
    seccion.classList.remove('pr-fuera');
    vistas.add(seccion);
    actualizar();
    document.documentElement.classList.add('pr-con-panel');
    sonar('abrir');
    if (seccion === seccionPromesas) { mirarPergamino(); despues(1400, () => { if (abierta === seccion) paginar(seccion); }); }
    paginar(seccion);
    seccion.querySelector('.pr-panel-cerrar').focus({ preventScroll: true });
  };
  const menu = [['hucha', seccionHucha], ['coleccion', seccionColeccion], ['extras', seccionExtras], ['comparar', seccionTabla], ['promesas', seccionPromesas]];
  for (const [, s] of menu) {
    s.prepend(el('button', { type: 'button', class: 'pr-panel-cerrar', onclick: cerrarPanel }, '◀ ', t('pr.menu.cerrar')));
    s.append(el('nav', { class: 'pr-paginas', hidden: true },
      el('button', { type: 'button', class: 'pr-atras', 'aria-label': '◀', onclick: () => irA(s, s.pagina - 1) }, '◀'),
      el('span', { class: 'pr-puntos', 'aria-hidden': 'true' }),
      el('button', { type: 'button', class: 'pr-alante', 'aria-label': '▶', onclick: () => irA(s, s.pagina + 1) }, '▶')));
    // el pergamino se desenrolla después de abrir: al acabar, se vuelve a repartir
    let repartir2 = 0;
    const alAcabar = e => {
      if (s !== abierta || !e.target.closest('.pr-pergamino') || repartir2) return;
      repartir2 = requestAnimationFrame(() => { repartir2 = 0; if (s === abierta) paginar(s); });
    };
    s.addEventListener('transitionend', alAcabar);
    s.addEventListener('animationend', alAcabar);
    // deslizar el dedo de lado también pasa de página
    let x0 = null;
    s.addEventListener('pointerdown', e => { if (s === abierta) x0 = e.clientX; });
    s.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) irA(s, s.pagina + (dx < 0 ? 1 : -1));
    });
  }
  contenidoArriba.append(el('nav', { class: 'pr-menu-movil', 'aria-label': t('pr.menu.titulo') },
    menu.map(([clave, s]) => el('button', { type: 'button', onclick: () => abrirPanel(s) }, t(`pr.menu.${clave}`)))));
  const alTeclado = e => {
    if (!abierta) return;
    if (e.key === 'Escape') cerrarPanel();
    else if (e.key === 'ArrowRight') irA(abierta, abierta.pagina + 1);
    else if (e.key === 'ArrowLeft') irA(abierta, abierta.pagina - 1);
  };
  const alCambiarTamano = () => { if (abierta) { if (innerWidth > 640) cerrarPanel(); else paginar(abierta); } };
  addEventListener('keydown', alTeclado);
  addEventListener('resize', alCambiarTamano);
  apagar.push(() => { removeEventListener('keydown', alTeclado); removeEventListener('resize', alCambiarTamano); document.documentElement.classList.remove('pr-con-panel'); });

  // ----- Que lo de arriba (de «Precios» a los tres planes) quepa siempre en la pantalla, sin desplazar -----
  const cabecera = document.querySelector('.cabecera');
  const suelo = escenario.querySelector('.inicio-suelo');
  function encajar() {
    if (!encendida) return;
    const sitio = window.innerHeight - cabecera.getBoundingClientRect().height;
    escenario.style.minHeight = `${Math.round(sitio)}px`;
    contenidoArriba.style.zoom = '';
    const estilo = getComputedStyle(escenario);
    const libre = sitio - suelo.offsetHeight - parseFloat(estilo.paddingTop) - 8;
    const escala = Math.min(1, libre / contenidoArriba.offsetHeight);
    if (escala < 1) contenidoArriba.style.zoom = Math.max(0.55, escala).toFixed(3);
  }
  const vigia = new ResizeObserver(() => requestAnimationFrame(encajar));
  vigia.observe(cabecera);
  window.addEventListener('resize', encajar);
  document.fonts?.ready.then(encajar);
  apagar.push(() => { vigia.disconnect(); window.removeEventListener('resize', encajar); });
  encajar();
  // en el móvil los planes van en fila deslizable: se empieza mirando Plus, el del centro
  requestAnimationFrame(() => {
    const fila = escenario.querySelector('.pr-escalera');
    if (fila.scrollWidth > fila.clientWidth) fila.scrollLeft = peldanoPlus.offsetLeft - (fila.clientWidth - peldanoPlus.offsetWidth) / 2;
  });

  // Las tutoras se mueven solo mientras la pantalla se ve; cada poco, una hace algo.
  const GESTOS = [[tGratis, ['saludar', 'guino', 'asentir']], [tPlus, ['pulgar', 'aplaudir', 'presentarDer']], [tMax, ['hojear', 'celebrar', 'presentarIzq']], [tHucha, ['aplaudir', 'senalar', 'pulgar']], [tEscalera, ['hojear', 'saludar', 'estirarse']]];
  let turno = 0;
  const reloj = setInterval(() => {
    if (!visible || document.hidden) return;
    const [quien, lista2] = GESTOS[turno % GESTOS.length];
    quien.gesto(lista2[Math.floor(turno / GESTOS.length) % lista2.length]);
    turno++;
  }, CADA_GESTO);
  apagar.push(() => clearInterval(reloj));
  const relojOla = setInterval(ola, 5200);
  const relojLista = setInterval(pasarLista, 2600);
  apagar.push(() => clearInterval(relojLista));
  const relojPlaza = setInterval(rodarPlaza, 140);
  apagar.push(() => { clearInterval(relojOla); clearInterval(relojPlaza); });
  fundadora.figura.addEventListener('pointerenter', () => fundadora.gesto('pulgar'));
  for (const [quien, nombre] of [[peldanoGratis, 'saludar'], [peldanoPlus, 'pulgar'], [peldanoMax, 'celebrar']]) {
    const v = vivas.find(x => quien.contains(x.figura));
    quien.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') v?.gesto(nombre); });
  }
  const raiz = contenedor.firstElementChild;
  if ('IntersectionObserver' in window) {
    const ojo = new IntersectionObserver(entradas => {
      for (const e of entradas) {
        if (e.isIntersecting) vistas.add(e.target); else vistas.delete(e.target);
        e.target.classList.toggle('pr-fuera', !e.isIntersecting); // fuera de pantalla, sus animaciones de CSS se paran
      }
      actualizar();
    });
    for (const s of raiz.children) ojo.observe(s);
    apagar.push(() => ojo.disconnect());
  } else { for (const s of raiz.children) vistas.add(s); actualizar(); }
  // el pergamino se desenrolla (una sola vez) cuando ya se ve bien: su parte de arriba pasa de media pantalla,
  // o no se puede bajar más. Se mide lo que ocupa el papel para que baje a ritmo constante.
  const mirarPergamino = () => {
    const abajoDelTodo = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    if (seccionPromesas.getBoundingClientRect().top > innerHeight * 0.55 && !abajoDelTodo) return;
    const papel = seccionPromesas.querySelector('.pr-papel');
    papel.style.setProperty('--alto', `${papel.scrollHeight}px`);
    seccionPromesas.classList.add('pr-visto');
    removeEventListener('scroll', mirarPergamino);
    // se oye cómo se desenrolla, cómo cae cada sello (al ritmo del css) y la firma
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sonar('papel');
      seccionPromesas.querySelectorAll('.pr-lacre').forEach((_, n) => despues(1200 + n * 450 + 260, () => sonar('sello')));
      despues(3600, () => sonar('tiza'));
    }
  };
  addEventListener('scroll', mirarPergamino, { passive: true });
  apagar.push(() => removeEventListener('scroll', mirarPergamino));
  mirarPergamino();
  despues(600, () => tMax.decir(t('pr.saludo', { nombre: NOMBRES_TUTORAS[principal.id] ?? '' })));

  return () => {
    encendida = false;
    for (const f of apagar) f();
  };
}
