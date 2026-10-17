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

  const z = preciosDeSuZona();
  let pago = 'ano'; // ano · mes

  // ----- Tutoras: vivas (se mueven mientras se ven) o en retrato fijo -----
  const vivas = [];
  function tutoraViva(c) {
    const canvas = el('canvas', { class: 'tutora-lienzo', width: 48, height: 64 });
    const globo = el('span', { class: 'pr-globo' });
    const figura = el('div', { class: 'inicio-figura pr-tutora', 'aria-hidden': 'true' }, globo, canvas);
    const yo = { figura, sprite: null, dibujo: null, apagarGlobo: null };
    dibujoDe(c).then(d => { yo.dibujo = d; if (visible) yo.sprite = d.crearSprite(canvas); }).catch(() => { figura.hidden = true; });
    yo.gesto = nombre => yo.sprite?.gesto(nombre);
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
  const encender = () => { visible = true; for (const v of vivas) if (v.dibujo && !v.sprite) v.sprite = v.dibujo.crearSprite(v.figura.querySelector('canvas')); };
  const dormir = () => { visible = false; for (const v of vivas) { v.sprite?.parar(); v.sprite = null; } };
  apagar.push(() => { dormir(); for (const v of vivas) clearTimeout(v.apagarGlobo); });

  /** Un retrato quieto (para las portadas de los libros y la familia). */
  function retrato(c, clase = 'pr-retrato', animacion = null) {
    const lienzo = el('canvas', { class: clase, width: 48, height: 60, 'aria-hidden': 'true' });
    dibujoDe(c).then(d => {
      const rejilla = d.rejilla('contenta', 0, animacion, 0.5);
      const ctx = lienzo.getContext('2d');
      rejilla.forEach((fila, y) => fila.forEach((color, x) => { if (color) { ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1); } }));
    }).catch(() => { lienzo.hidden = true; });
    return lienzo;
  }

  // ----- «Muy pronto»: todavía no se cobra -----
  const pronto = (quien, nota) => () => {
    sonar('clic');
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
  const tGratis = tutoraViva(otras[0]);
  const tPlus = tutoraViva(otras[1]);
  const tMax = tutoraViva(principal);

  const precioPlus = el('p', { class: 'pr-precio' });
  const porPlus = el('p', { class: 'pr-por' });
  const precioMax = el('p', { class: 'pr-precio' });
  const porMax = el('p', { class: 'pr-por' });
  const lista = claves => el('ul', { class: 'pr-lista' }, claves.map(([clave, datos, marca]) => el('li', {}, t(clave, datos ?? undefined), marca ?? null)));

  const peldano = (plan, tutora, cuerpo) => el('li', { class: `pr-peldano pr-${plan}` }, tutora.figura, el('div', { class: 'pr-bloque' }, cuerpo));
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
    sonar('voltear');
    pintarPreciosZona();
    if (pago === 'ano') { tMax.gesto('celebrar'); tMax.decir(t('pr.col.anual.titulo') + ': ' + t('pr.col.anual.texto')); } else tPlus.gesto('pulgar');
  }

  // =====================================================================
  // 2. La Hucha
  // =====================================================================
  const tHucha = tutoraViva(otras[2]);
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
  const ANIMACIONES_LIBRO = [null, 'saludar', 'hojear', 'pulgar', 'pensar', 'celebrar'];
  const sellosPdf = [];
  const estante = el('ul', { class: 'pr-estante' }, LIBROS.map(([codigo, clave, color], i) => {
    const sello = el('span', { class: 'pr-sello-pdf', hidden: true }, 'PDF');
    sellosPdf.push(sello);
    return el('li', { class: 'pr-libro', style: `--c:${color}` },
      el('span', { class: 'pr-libro-marca' }, 'Paglot'),
      retrato(principal, 'pr-libro-tutora', ANIMACIONES_LIBRO[i]),
      el('b', {}, codigo === 'GR' ? t('pr.libro.gramCorto') : codigo === 'EX' ? t('pr.libro.examenCorto') : codigo),
      el('span', { class: 'pr-libro-nombre' }, t(`pr.libro.${clave}`)),
      sello);
  }));
  const notaZona = el('p', { class: 'pr-col-pdf' });
  const seccionColeccion = el('section', { class: 'pr-seccion pr-coleccion' },
    el('span', { class: 'pr-etiqueta' }, t('pr.max.nombre')),
    el('h2', {}, t('pr.col.titulo')),
    el('p', { class: 'pr-entradilla' }, t('pr.col.texto', { tutora: NOMBRES_TUTORAS[principal.id] ?? '' })),
    estante,
    el('div', { class: 'pr-tabla-madera', 'aria-hidden': 'true' }),
    el('div', { class: 'pr-dos' },
      el('div', { class: 'pr-carta' }, el('h3', {}, t('pr.col.anual.titulo')), el('p', {}, t('pr.col.anual.texto'))),
      el('div', { class: 'pr-carta' }, el('h3', {}, t('pr.col.mes.titulo')), el('p', {}, t('pr.col.mes.texto')))),
    notaZona,
    el('p', { class: 'pr-col-otro' }, t('pr.col.otro')));

  // =====================================================================
  // 4. Familia y Fundadores
  // =====================================================================
  const precioFamilia = el('p', { class: 'pr-precio pr-precio-medio' });
  const porFamilia = el('p', { class: 'pr-por' });
  const precioFundadores = el('p', { class: 'pr-precio pr-precio-medio' });
  const seccionExtras = el('section', { class: 'pr-seccion pr-extras' },
    el('div', { class: 'pr-carta pr-familia' },
      el('div', { class: 'pr-familia-fila' }, barajadas.slice(0, 6).map(c => retrato(c))),
      el('h3', {}, t('pr.fam.titulo')),
      el('p', {}, t('pr.fam.texto')),
      precioFamilia, porFamilia,
      ...botonPronto(null)),
    el('div', { class: 'pr-carta pr-fundadores' },
      el('span', { class: 'pr-insignia', 'aria-hidden': 'true' }, '★'),
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
  const celda = v => {
    if (v === SI) return el('td', { class: 'pr-si' }, el('span', { class: 'pr-check', 'aria-label': '✔' }));
    if (v === null) return el('td', { class: 'pr-no' }, '—');
    return el('td', {}, v.startsWith('pr.') ? t(v) : v);
  };
  const seccionTabla = el('section', { class: 'pr-seccion pr-comparar' },
    el('h2', {}, t('pr.tabla.titulo')),
    el('div', { class: 'pr-tabla-caja' },
      el('table', { class: 'pr-tabla' },
        el('thead', {}, el('tr', {}, el('th', {}, ''), el('th', { class: 'pr-th-gratis' }, t('pr.gratis.nombre')), el('th', { class: 'pr-th-plus' }, t('pr.plus.nombre')), el('th', { class: 'pr-th-max' }, t('pr.max.nombre')))),
        el('tbody', {}, FILAS.map(([clave, a, b, m, marca]) => el('tr', {}, el('th', { scope: 'row' }, t(clave), marca ?? null), celda(a), celda(b), celda(m)))))),
    el('p', { class: 'pr-notas' }, t('pr.nota.oral'), el('br'), t('pr.nota.certificado'), el('br'), t('pr.nota.caprichos')));

  // =====================================================================
  // 6. Las promesas
  // =====================================================================
  const seccionPromesas = el('section', { class: 'pr-seccion pr-promesas' },
    el('h2', {}, t('precios.promesas.titulo')),
    el('ul', { class: 'pr-sellos' }, ['pr.prom1', 'precios.p2', 'precios.p3', 'pr.prom5', 'precios.p4'].map((k, i) =>
      el('li', { style: `--n:${i}` }, el('span', { class: 'pr-corazon', 'aria-hidden': 'true' }), el('p', {}, t(k))))),
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
    const pdf = z.libros === 'pdf';
    for (const s of sellosPdf) s.hidden = !pdf;
    notaZona.textContent = pdf ? t('pr.col.pdf') : t('pr.col.impresos');
    notaZona.classList.toggle('pr-col-pdf-si', pdf);
  }

  // ----- Montaje -----
  poner(contenedor, el('div', { class: 'precios' }, escenario, seccionHucha, seccionColeccion, seccionExtras, seccionTabla, seccionPromesas));
  pintarPreciosZona();

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
  const GESTOS = [[tGratis, ['saludar', 'guino', 'asentir']], [tPlus, ['pulgar', 'aplaudir', 'presentarDer']], [tMax, ['hojear', 'celebrar', 'presentarIzq']], [tHucha, ['aplaudir', 'senalar', 'pulgar']]];
  let turno = 0;
  const reloj = setInterval(() => {
    if (!visible || document.hidden) return;
    const [quien, lista2] = GESTOS[turno % GESTOS.length];
    quien.gesto(lista2[Math.floor(turno / GESTOS.length) % lista2.length]);
    turno++;
  }, CADA_GESTO);
  apagar.push(() => clearInterval(reloj));
  for (const [quien, nombre] of [[peldanoGratis, 'saludar'], [peldanoPlus, 'pulgar'], [peldanoMax, 'celebrar']]) {
    const v = vivas.find(x => quien.contains(x.figura));
    quien.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') v?.gesto(nombre); });
  }
  const raiz = contenedor.firstElementChild;
  if ('IntersectionObserver' in window) {
    const vistas = new Set();
    const ojo = new IntersectionObserver(entradas => {
      for (const e of entradas) if (e.isIntersecting) vistas.add(e.target); else vistas.delete(e.target);
      if (vistas.size) encender(); else dormir();
    });
    for (const s of raiz.children) ojo.observe(s);
    apagar.push(() => ojo.disconnect());
  } else encender();
  despues(600, () => tMax.decir(t('pr.saludo', { nombre: NOMBRES_TUTORAS[principal.id] ?? '' })));

  return () => {
    encendida = false;
    for (const f of apagar) f();
  };
}
