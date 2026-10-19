// La tienda (#/tienda): la tiendecita de Paglot en la calle. Fuera, el toldo, el letrero y el escaparate con los seis
// libros del idioma elegido (A1, A2, B1, B2, gramática y examen), cada uno con su tutora en la portada; la tendera
// espera en la puerta. Dentro, los estantes con la colección dibujada en píxeles, los carteles de las categorías y
// el mostrador con las preguntas. La cesta es de muestra: los importes son ficticios y no se procesan pagos.
// Colores en css/tienda.css; las tutoras, con js/vistas/elenco.js.

import { el, poner, alAzar } from '../dom.js';
import { idioma, locale, t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, nombreCurso } from '../curso.js';
import { sonar } from '../sonidos.js';
import { PRECIOS_VISIBLES } from '../config.js';
import { dibujoPixel, conContorno } from './inicio-decorado.js';
import { crearElenco, tutoraPintada, lienzo } from './elenco.js';

// Se conserva durante esta sesión de la app, también al visitar otras vistas.
const cesta = [];
const PRECIO_LIBRO = { papel: 2490, pdf: 990 };
const NIVELES = ['A1', 'A2', 'B1', 'B2', 'gramatica', 'examen'];

// ---------------------------------------------------------------------------
// La colección, en píxeles (prefijo «tn»): c color · C sombra · w blanco · l oro · g gris · n madera · k contorno
// ---------------------------------------------------------------------------
const dibujar = pintar => { const l = lienzo(24, 24); pintar(l.R); return conContorno(l.filas()); };
const logo = (R, x, y) => { R(x, y, 6, 4, 'w'); R(x + 1, y + 4, 1, 1, 'w'); R(x + 1, y + 1, 1, 1, 'k'); R(x + 4, y + 1, 1, 1, 'k'); R(x + 2, y + 2, 2, 1, 'r'); };
const DIBUJOS = {
  camiseta: dibujar(R => {
    R(5, 2, 14, 21, 'c'); R(0, 3, 6, 7, 'c'); R(18, 3, 6, 7, 'c'); R(0, 9, 6, 1, 'C'); R(18, 9, 6, 1, 'C');
    R(9, 2, 6, 2, 'w'); R(10, 2, 4, 1, '.'); R(17, 4, 2, 19, 'C'); R(5, 21, 14, 2, 'C');
    logo(R, 9, 8);
  }),
  capucha: dibujar(R => {
    R(5, 3, 14, 20, 'c'); R(1, 4, 5, 18, 'c'); R(18, 4, 5, 18, 'c'); R(1, 20, 5, 2, 'C'); R(18, 20, 5, 2, 'C');
    R(7, 0, 10, 4, 'C'); R(9, 1, 6, 3, 'k'); R(10, 4, 1, 5, 'w'); R(13, 4, 1, 5, 'w');
    R(8, 15, 8, 5, 'C'); R(5, 21, 14, 2, 'C');
  }),
  sudadera: dibujar(R => {
    R(5, 2, 14, 21, 'c'); R(1, 3, 5, 18, 'c'); R(18, 3, 5, 18, 'c'); R(1, 19, 5, 3, 'C'); R(18, 19, 5, 3, 'C');
    R(9, 2, 6, 2, 'C'); R(5, 20, 14, 3, 'C');
    R(8, 9, 8, 1, 'w'); R(9, 11, 6, 1, 'w'); R(10, 13, 4, 1, 'w');
  }),
  tote: dibujar(R => {
    R(7, 0, 2, 8, 'n'); R(15, 0, 2, 8, 'n'); R(7, 0, 10, 2, 'n');
    R(3, 7, 18, 16, 'c'); R(3, 7, 18, 2, 'C'); R(19, 9, 2, 14, 'C');
    R(6, 12, 10, 1, 'w'); R(6, 14, 12, 1, 'w'); R(6, 16, 8, 1, 'w'); logo(R, 12, 17);
  }),
  taza: dibujar(R => {
    R(7, 0, 1, 3, 'g'); R(11, 1, 1, 3, 'g'); R(15, 0, 1, 3, 'g');
    R(3, 6, 14, 16, 'c'); R(3, 6, 14, 2, 'w'); R(15, 8, 2, 14, 'C'); R(3, 21, 14, 1, 'C');
    R(17, 9, 5, 2, 'c'); R(20, 9, 2, 9, 'c'); R(17, 16, 5, 2, 'c');
    logo(R, 6, 11);
  }),
  funda: dibujar(R => {
    R(6, 0, 12, 24, 'c'); R(16, 0, 2, 24, 'C'); R(8, 2, 5, 5, 'g'); R(9, 3, 1, 1, 'w'); R(11, 5, 1, 1, 'w');
    logo(R, 9, 12);
  }),
  poster: dibujar(R => {
    R(1, 1, 22, 22, 'n'); R(3, 3, 18, 18, 'w');
    R(5, 6, 6, 4, 'c'); R(6, 10, 4, 4, 'c'); R(12, 5, 7, 5, 'c'); R(13, 10, 4, 6, 'C'); R(16, 16, 3, 2, 'c');
    R(5, 18, 14, 1, 'C');
  }),
  lienzo: dibujar(R => {
    R(4, 15, 2, 9, 'n'); R(18, 15, 2, 9, 'n'); R(11, 15, 2, 6, 'n');
    R(2, 0, 20, 15, 'w'); R(16, 2, 3, 3, 'l');
    R(3, 9, 6, 5, 'c'); R(5, 7, 3, 2, 'c'); R(8, 10, 8, 4, 'C'); R(11, 8, 3, 2, 'C'); R(15, 11, 6, 3, 'c');
  }),
  calendario: dibujar(R => {
    R(2, 3, 20, 20, 'w'); R(2, 3, 20, 6, 'c'); R(6, 1, 2, 5, 'g'); R(16, 1, 2, 5, 'g');
    for (let y = 11; y < 21; y += 3) for (let x = 4; x < 20; x += 4) R(x, y, 2, 2, 'C');
    R(12, 14, 2, 2, 'r');
  }),
  postales: dibujar(R => {
    R(5, 8, 18, 13, 'w'); R(18, 10, 4, 5, 'l'); R(7, 15, 8, 1, 'C'); R(7, 17, 10, 1, 'C');
    R(1, 3, 17, 12, 'c'); R(3, 5, 6, 5, 'w'); R(11, 6, 5, 1, 'w'); R(11, 8, 4, 1, 'w'); R(11, 10, 5, 1, 'w');
  }),
};
// la caja registradora del mostrador
const CAJA = (() => {
  const { R, filas } = lienzo(30, 22);
  R(2, 8, 26, 14, 'g'); R(2, 8, 26, 2, 'G'); R(4, 0, 12, 8, 'k'); R(5, 1, 10, 5, 'v');
  R(6, 2, 5, 1, 'w'); R(18, 4, 8, 4, 'g'); R(19, 5, 6, 2, 'w');
  for (let y = 12; y < 18; y += 3) for (let x = 5; x < 17; x += 3) R(x, y, 2, 2, 'w');
  R(19, 12, 7, 6, 'l'); R(2, 19, 26, 3, 'G');
  return conContorno(filas());
})();

export function pintarTienda(root) {
  const elenco = crearElenco();
  const { despues } = elenco;
  const euros = centimos => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(centimos / 100);
  // sin cifras (PRECIOS_VISIBLES = false): cada precio dice «Precio por anunciar»
  const precioTexto = centimos => (PRECIOS_VISIBLES ? euros(centimos) : t('precio.porAnunciar'));
  const productos = [
    { id: 'camiseta', categoria: 'ropa', precio: 2490, nombre: t('tienda.oneMoreWordTShirt'), texto: t('tienda.takeYourLoveOfLearning'), opciones: ['S', 'M', 'L', 'XL'], etiqueta: t('tienda.size'), acento: 'rosa' },
    { id: 'capucha', categoria: 'ropa', precio: 4490, nombre: t('tienda.studyModeHoodie'), texto: t('tienda.aHoodYourFavouriteCorner'), opciones: ['S', 'M', 'L', 'XL'], etiqueta: t('tienda.size'), acento: 'lavanda' },
    { id: 'sudadera', categoria: 'ropa', precio: 3990, nombre: t('tienda.takeYourTimeSweatshirt'), texto: t('tienda.aCrewNeckAndA'), opciones: ['S', 'M', 'L', 'XL'], etiqueta: t('tienda.size'), acento: 'menta' },
    { id: 'tote', categoria: 'accesorios', precio: 1890, nombre: t('tienda.carryingStoriesToteBag'), texto: t('tienda.roomForYourBooksNotes'), opciones: [t('tienda.natural'), t('tienda.black')], etiqueta: t('tienda.colour'), acento: 'arena' },
    { id: 'taza', categoria: 'casa', precio: 1490, nombre: t('tienda.aSipThenOnwardsMug'), texto: t('tienda.aLittleBreakIsPart'), opciones: [t('tienda.light'), t('tienda.dark')], etiqueta: t('tienda.finish'), acento: 'azul' },
    { id: 'funda', categoria: 'accesorios', precio: 1990, nombre: t('tienda.helloWorldPhoneCase'), texto: t('tienda.aLittlePaglotMomentWhenever'), opciones: ['iPhone 15', 'iPhone 16', 'Samsung Galaxy S24'], etiqueta: t('tienda.sampleModel'), acento: 'lavanda' },
    { id: 'poster', categoria: 'casa', precio: 1290, nombre: t('tienda.aWorldOfWordsPoster'), texto: t('tienda.aLittleSpaceOnYour'), opciones: ['A4', 'A3'], etiqueta: t('tienda.format'), acento: 'rosa' },
    { id: 'lienzo', categoria: 'casa', precio: 3490, nombre: t('tienda.smallMightyStepsCanvas'), texto: t('tienda.bringALittlePersonalityTo'), opciones: ['20 × 30 cm', '30 × 40 cm'], etiqueta: t('tienda.format'), acento: 'menta' },
    { id: 'calendario', categoria: 'papel', precio: 1690, nombre: t('tienda.aDayAWordCalendar'), texto: t('tienda.aPlaceForYourPlans'), opciones: [t('tienda.wallCalendar')], etiqueta: t('tienda.format'), acento: 'azul' },
    { id: 'postales', categoria: 'papel', precio: 990, nombre: t('tienda.lovelyWordsPostcards'), texto: t('tienda.sendAFewWordsTo'), opciones: [t('tienda.setOf6')], etiqueta: t('tienda.set'), acento: 'arena' },
  ];
  const categorias = [
    ['todo', t('tienda.theWholeCollection')], ['ropa', t('tienda.clothing')],
    ['accesorios', t('tienda.accessories')], ['casa', t('tienda.yourSpace')], ['papel', t('tienda.lovelyPaper')],
  ];
  const cursos = CURSOS.filter(c => !c.proximamente);
  let idiomaLibro = hayCurso ? curso.id : 'es';
  let nivelLibro = 'A1';
  let formatoLibro = 'papel';
  let categoria = 'todo';
  let busqueda = '';
  let orden = 'coleccion';
  let avisoReloj;
  const nombreNivel = n => (n === 'gramatica' || n === 'examen' ? t(`tn.nivel.${n}`) : n);
  const dibujoProducto = (p, clase = '') => el('span', { class: `tn-dibujo tn-${p.acento} ${clase}`.trim(), 'aria-hidden': 'true' }, dibujoPixel(DIBUJOS[p.id], '', 'tn'));

  const tendera = elenco.tutora(elenco.protagonista(), 'tn-tendera');
  tendera.alTocar = () => { tendera.gesto('invitar'); tendera.decir(alAzar(t('tn.tutora.toca')), 2800); };

  const aviso = el('p', { class: 'tn-aviso', role: 'status', 'aria-live': 'polite', hidden: true });
  const detalle = el('dialog', { class: 'tn-dialogo tn-detalle', 'aria-labelledby': 'tn-detalle-titulo' });
  const bolsa = el('dialog', { class: 'tn-dialogo tn-bolsa', 'aria-labelledby': 'tn-bolsa-titulo' });
  const numeros = [];
  const botonCesta = clase => {
    const numero = el('span', { class: 'tn-cesta-numero' }, '0');
    numeros.push(numero);
    return el('button', { type: 'button', class: clase, onclick: () => { pintarCesta(); abrir(bolsa); sonar('abrir'); } },
      el('span', { class: 'tn-cesta-icono', 'aria-hidden': 'true' }), el('span', { class: 'tn-cesta-texto' }, t('tienda.myBag')), numero);
  };
  const cestaFachada = botonCesta('tn-cesta');
  const cestaFlotante = botonCesta('tn-cesta tn-cesta-flotante');

  function abrir(dialogo) {
    document.body.classList.add('tienda-dialogo-abierto');
    dialogo.showModal();
  }
  for (const dialogo of [detalle, bolsa]) {
    dialogo.addEventListener('close', () => {
      if (!detalle.open && !bolsa.open) document.body.classList.remove('tienda-dialogo-abierto');
    });
  }
  const cerrar = dialogo => el('button', { type: 'button', class: 'tn-cerrar', 'aria-label': t('tienda.close'), onclick: () => dialogo.close() }, '×');
  function contar() {
    const n = cesta.reduce((total, linea) => total + linea.cantidad, 0);
    numeros.forEach(numero => { numero.textContent = String(n); });
    for (const b of [cestaFachada, cestaFlotante]) b.setAttribute('aria-label', t('tienda.miCesta', { n }));
    cestaFlotante.hidden = n === 0;
  }
  function anadir(id, variante, idiomaElegido = '', nivel = '') {
    const clave = `${id}/${variante}/${idiomaElegido}/${nivel}`;
    const linea = cesta.find(item => item.clave === clave);
    if (linea) linea.cantidad = Math.min(99, linea.cantidad + 1);
    else cesta.push({ clave, id, variante, idioma: idiomaElegido, nivel, cantidad: 1 });
    contar();
    clearTimeout(avisoReloj);
    aviso.textContent = t('tienda.addedToYourDemoBag');
    aviso.hidden = false;
    avisoReloj = setTimeout(() => { aviso.hidden = true; }, 2600);
    sonar('caja');
    tendera.gesto('aplaudir');
    for (const b of [cestaFachada, cestaFlotante]) { b.classList.remove('bota'); void b.offsetWidth; b.classList.add('bota'); }
  }
  function datosLinea(linea) {
    if (linea.id === 'libro') {
      const c = cursos.find(item => item.id === linea.idioma) ?? cursos[0];
      return {
        nombre: t('tn.libroNivel', { nivel: nombreNivel(linea.nivel || 'A1'), idioma: nombreCurso(c, idioma()) }),
        opcion: linea.variante === 'papel' ? t('tienda.printedEdition') : 'PDF',
        precio: PRECIO_LIBRO[linea.variante],
        miniatura: portada(c, linea.nivel || 'A1', 'tn-portada-mini'),
      };
    }
    const p = productos.find(item => item.id === linea.id);
    return { nombre: p.nombre, opcion: p.opciones[linea.variante], precio: p.precio, miniatura: dibujoProducto(p, 'tn-miniatura') };
  }
  function cambiarCantidad(indice, diferencia, quitar = false) {
    const linea = cesta[indice];
    if (quitar || linea.cantidad + diferencia <= 0) cesta.splice(indice, 1);
    else linea.cantidad = Math.min(99, linea.cantidad + diferencia);
    contar();
    pintarCesta();
    sonar(diferencia > 0 ? 'moneda' : 'quitar');
    const filas = bolsa.querySelectorAll('.tn-linea');
    (filas[Math.min(indice, filas.length - 1)]?.querySelector('button') ?? bolsa.querySelector('.tn-cerrar')).focus();
  }
  function pintarCesta() {
    const total = cesta.reduce((suma, linea) => suma + datosLinea(linea).precio * linea.cantidad, 0);
    poner(bolsa,
      el('header', { class: 'tn-dialogo-cabecera' }, el('div', {}, el('span', { class: 'tn-eyebrow' }, t('tienda.paglotStore')), el('h2', { id: 'tn-bolsa-titulo' }, t('tienda.yourLittleTreasure'))), cerrar(bolsa)),
      cesta.length ? el('ul', { class: 'tn-lineas' }, cesta.map((linea, i) => {
        const dato = datosLinea(linea);
        return el('li', { class: 'tn-linea' }, dato.miniatura,
          el('div', { class: 'tn-linea-datos' }, el('h3', {}, dato.nombre), el('p', {}, dato.opcion),
            el('div', { class: 'tn-cantidad', role: 'group', 'aria-label': t('tienda.cantidadDe', { producto: dato.nombre }) },
              el('button', { type: 'button', 'aria-label': t('tienda.removeOne'), onclick: () => cambiarCantidad(i, -1) }, '−'),
              el('span', {}, String(linea.cantidad)),
              el('button', { type: 'button', 'aria-label': t('tienda.addOne'), disabled: linea.cantidad >= 99, onclick: () => cambiarCantidad(i, 1) }, '+'))),
          el('div', { class: 'tn-linea-precio' }, el('strong', {}, precioTexto(dato.precio * linea.cantidad)),
            el('button', { type: 'button', class: 'tn-quitar', 'aria-label': t('tienda.quitarProducto', { producto: dato.nombre }), onclick: () => cambiarCantidad(i, 0, true) }, t('tienda.remove'))));
      })) : el('div', { class: 'tn-vacio' }, el('span', { class: 'tn-cesta-icono tn-cesta-grande', 'aria-hidden': 'true' }), el('h3', {}, t('tienda.thereIsStillRoomFor')), el('p', {}, t('tienda.pickABookOrA')), el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => bolsa.close() }, t('tienda.keepBrowsing'))),
      cesta.length ? el('footer', { class: 'tn-bolsa-resumen' },
        el('p', { class: 'tn-subtotal' }, el('span', {}, t('tienda.demoTotal')), el('strong', {}, precioTexto(total))),
        el('button', { type: 'button', class: 'es-boton', disabled: true }, t('tienda.purchasingComingSoon')),
        el('p', { class: 'tn-nota' }, t('tienda.thisBagIsAPreview'))) : null);
  }
  function verProducto(p) {
    const variantes = el('select', { id: 'tn-variante' }, p.opciones.map((opcion, i) => el('option', { value: String(i) }, opcion)));
    const form = el('form', { class: 'tn-detalle-info', onsubmit: evento => { evento.preventDefault(); anadir(p.id, Number(variantes.value)); detalle.close(); } },
      el('span', { class: 'tn-eyebrow' }, categorias.find(c => c[0] === p.categoria)[1]),
      el('h2', { id: 'tn-detalle-titulo' }, p.nombre), el('p', {}, p.texto),
      el('p', { class: 'tn-detalle-precio' }, precioTexto(p.precio)), el('label', { for: 'tn-variante' }, p.etiqueta), variantes,
      el('button', { type: 'submit', class: 'es-boton' }, t('tienda.addToMyBag'), ' +'),
      el('p', { class: 'tn-nota' }, t('tn.muestra')));
    poner(detalle, cerrar(detalle), el('div', { class: `tn-detalle-foto tn-fondo-${p.acento}` }, dibujoProducto(p, 'tn-dibujo-grande')), form);
    abrir(detalle);
    sonar('abrir');
  }

  // =====================================================================
  // El escaparate: los seis libros del idioma elegido
  // =====================================================================
  /** La portada de un libro: la marca, el nivel, el idioma y su tutora. */
  function portada(c, nivel, clase = '') {
    return el('span', { class: `tn-portada tn-nivel-${nivel} ${clase}`.trim(), 'aria-hidden': 'true' },
      el('span', { class: 'tn-portada-marca' }, 'Paglot'),
      el('span', { class: 'tn-portada-nivel' }, nombreNivel(nivel)),
      tutoraPintada(c),
      el('span', { class: 'tn-portada-idioma' }, nombreCurso(c, idioma())));
  }
  const libros = el('div', { class: 'tn-libros', role: 'group', 'aria-label': t('tn.nivel') });
  const libroPrecio = el('strong', { class: 'tn-libro-precio' });
  const libroFormato = el('span', { class: 'tn-libro-formato' });
  const libroNota = el('p', { class: 'tn-libro-nota', role: 'status' });
  const idiomaNombre = el('span', { class: 'tn-idioma-nombre' });
  const selectorIdioma = el('button', {
    type: 'button', id: 'tn-libro-idioma', class: 'tn-idioma-boton',
    'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': 'tn-idioma-lista',
  }, idiomaNombre, el('span', { 'aria-hidden': 'true' }, '▾'));
  const listaIdiomas = el('div', { id: 'tn-idioma-lista', class: 'tn-idioma-lista', role: 'listbox', 'aria-label': t('tienda.bookLanguage'), hidden: true });
  const opcionesIdioma = cursos.map(c => el('button', {
    type: 'button', role: 'option', tabindex: '-1', 'aria-selected': String(c.id === idiomaLibro),
    onclick: () => { idiomaLibro = c.id; actualizarLibro(true); cerrarIdiomas(true); sonar('voltear'); },
  }, nombreCurso(c, idioma())));
  listaIdiomas.append(...opcionesIdioma);
  const idiomasLibro = el('div', { class: 'tn-idioma', 'data-sin-efectos': true }, selectorIdioma, listaIdiomas);
  function cerrarIdiomas(foco = false) {
    listaIdiomas.hidden = true;
    selectorIdioma.setAttribute('aria-expanded', 'false');
    if (foco) selectorIdioma.focus({ preventScroll: true });
  }
  function enfocarIdioma(i) {
    const opcion = opcionesIdioma[i];
    opcion.focus({ preventScroll: true });
    if (opcion.offsetTop < listaIdiomas.scrollTop) listaIdiomas.scrollTop = opcion.offsetTop;
    else if (opcion.offsetTop + opcion.offsetHeight > listaIdiomas.scrollTop + listaIdiomas.clientHeight) listaIdiomas.scrollTop = opcion.offsetTop + opcion.offsetHeight - listaIdiomas.clientHeight;
  }
  function abrirIdiomas() {
    const rect = selectorIdioma.getBoundingClientRect();
    const abajo = innerHeight - rect.bottom;
    const arriba = rect.top;
    const haciaArriba = abajo < 232 && arriba > abajo;
    idiomasLibro.classList.toggle('tn-idioma-arriba', haciaArriba);
    listaIdiomas.style.maxHeight = `${Math.max(80, Math.min(220, (haciaArriba ? arriba : abajo) - 12))}px`;
    listaIdiomas.hidden = false;
    selectorIdioma.setAttribute('aria-expanded', 'true');
    enfocarIdioma(cursos.findIndex(c => c.id === idiomaLibro));
  }
  selectorIdioma.addEventListener('click', () => (listaIdiomas.hidden ? abrirIdiomas() : cerrarIdiomas()));
  selectorIdioma.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); abrirIdiomas(); }
  });
  listaIdiomas.addEventListener('keydown', e => {
    const actual = opcionesIdioma.indexOf(document.activeElement);
    const cambios = { ArrowDown: 2, ArrowUp: -2, ArrowRight: 1, ArrowLeft: -1 };
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrarIdiomas(true); }
    else if (e.key === 'Tab') cerrarIdiomas(true);
    else if (Object.hasOwn(cambios, e.key)) { e.preventDefault(); enfocarIdioma(Math.max(0, Math.min(cursos.length - 1, actual + cambios[e.key]))); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); enfocarIdioma(e.key === 'Home' ? 0 : cursos.length - 1); }
  });
  const fueraDeIdiomas = e => { if (!idiomasLibro.contains(e.target)) cerrarIdiomas(); };
  document.addEventListener('pointerdown', fueraDeIdiomas);
  const formatos = ['papel', 'pdf'].map(formato => el('button', {
    type: 'button', class: 'tn-formato', 'aria-pressed': String(formato === formatoLibro),
    onclick: () => { formatoLibro = formato; actualizarLibro(); sonar('elegir'); },
  }, el('span', {}, formato === 'papel' ? t('tienda.printed') : 'PDF'), el('small', {}, precioTexto(PRECIO_LIBRO[formato]))));
  function actualizarLibro(nuevosLibros = false) {
    const c = cursos.find(item => item.id === idiomaLibro);
    idiomaNombre.textContent = nombreCurso(c, idioma());
    opcionesIdioma.forEach((opcion, i) => opcion.setAttribute('aria-selected', String(cursos[i].id === idiomaLibro)));
    if (nuevosLibros || !libros.children.length) {
      poner(libros, NIVELES.map(nivel => {
        const b = el('button', { type: 'button', class: 'tn-libro', 'aria-pressed': String(nivel === nivelLibro), 'aria-label': t('tn.libroNivel', { nivel: nombreNivel(nivel), idioma: nombreCurso(c, idioma()) }) }, portada(c, nivel));
        b.addEventListener('click', () => { nivelLibro = nivel; actualizarLibro(); sonar('voltear'); tendera.gesto('senalar'); });
        b.dataset.nivel = nivel;
        return b;
      }));
    }
    [...libros.children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.nivel === nivelLibro)));
    libroPrecio.textContent = precioTexto(PRECIO_LIBRO[formatoLibro]);
    libroFormato.textContent = `${nombreNivel(nivelLibro)} · ${formatoLibro === 'papel' ? t('tienda.printedEdition2') : t('tienda.digitalEditionPdf')}`;
    libroNota.textContent = formatoLibro === 'papel' ? t('tienda.toUnderlineTakeNotesAnd') : t('tienda.takeYourNextWordsWith');
    formatos.forEach((b, i) => b.setAttribute('aria-pressed', String(['papel', 'pdf'][i] === formatoLibro)));
  }

  const fachada = el('section', { class: 'tn-fachada', 'aria-labelledby': 'tn-titulo' },
    el('div', { class: 'tn-calle-fondo', 'aria-hidden': 'true' }),
    el('div', { class: 'tn-edificio' },
      el('header', { class: 'tn-letrero' },
        el('span', { class: 'tn-eyebrow' }, t('tienda.madeToKeepYouCompany')),
        el('h1', { id: 'tn-titulo' }, t('tienda.aLittlePaglot'), el('span', {}, t('tienda.toTakeWithYou'))),
        el('p', {}, t('tienda.booksToDiscoverTheWorld')),
        cestaFachada),
      el('span', { class: 'tn-toldo', 'aria-hidden': 'true' }),
      el('div', { class: 'tn-planta' },
        el('div', { class: 'tn-escaparate' },
          el('span', { class: 'tn-escaparate-titulo' }, t('tienda.thePaglotLibrary')),
          el('h2', {}, t('tienda.yourNextLanguagePageBy')),
          libros,
          el('span', { class: 'tn-balda', 'aria-hidden': 'true' }),
          el('div', { class: 'tn-libro-config' },
            el('div', { class: 'tn-config-idioma' }, el('label', { for: 'tn-libro-idioma' }, t('tienda.whichLanguageIsCallingYou')), idiomasLibro),
            el('div', { class: 'tn-formatos', role: 'group', 'aria-label': t('tienda.bookFormat') }, formatos),
            el('div', { class: 'tn-libro-comprar' },
              el('div', {}, libroFormato, libroPrecio),
              el('button', { type: 'button', class: 'es-boton', onclick: () => anadir('libro', formatoLibro, idiomaLibro, nivelLibro) }, t('tienda.addBook'), ' +')),
            libroNota),
          el('p', { class: 'tn-muestra' }, el('span', { 'aria-hidden': 'true' }, '✦'), PRECIOS_VISIBLES ? t('tienda.demoStoreSamplePricesPurchasing') : t('precio.nota'))),
        el('div', { class: 'tn-puerta' },
          el('span', { class: 'tn-abierto', 'aria-hidden': 'true' }, t('tn.abierto')),
          tendera.figura))),
    el('span', { class: 'tn-acera', 'aria-hidden': 'true' }));

  // =====================================================================
  // Dentro: los estantes de la colección
  // =====================================================================
  const rejilla = el('ul', { class: 'tn-rejilla' });
  const contador = el('p', { class: 'tn-resultados', role: 'status', 'aria-live': 'polite' });
  const normalizar = texto => texto.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const buscador = el('input', { type: 'search', placeholder: t('tienda.findYourNextLittleTreasure'), 'aria-label': t('tienda.searchTheCollection'), oninput: () => {
    busqueda = buscador.value;
    pintarCatalogo();
    clearTimeout(buscando);
    if (busqueda.trim()) buscando = setTimeout(() => sonar(rejilla.querySelector('.tn-producto') ? 'buscar' : 'nada'), 450);
  } });
  let buscando = null;
  elenco.alApagar(() => clearTimeout(buscando));
  // ordenar por precio solo con precios visibles; sin ellos, el desplegable no tiene nada que ordenar
  const ordenar = PRECIOS_VISIBLES ? el('select', { 'aria-label': t('tienda.sortProducts'), onchange: () => { orden = ordenar.value; pintarCatalogo(); } },
    el('option', { value: 'coleccion' }, t('tienda.ourSelection')), el('option', { value: 'menor' }, t('tienda.priceLowToHigh')), el('option', { value: 'mayor' }, t('tienda.priceHighToLow'))) : null;
  const filtros = categorias.map(([id, nombre]) => el('button', { type: 'button', class: 'tn-filtro', 'aria-pressed': String(id === categoria), onclick: () => { categoria = id; pintarCatalogo(); sonar('elegir'); } }, nombre));
  function pintarCatalogo() {
    const visibles = productos.filter(p => (categoria === 'todo' || p.categoria === categoria) && normalizar(`${p.nombre} ${p.texto}`).includes(normalizar(busqueda)));
    if (orden !== 'coleccion') visibles.sort((a, b) => (orden === 'menor' ? a.precio - b.precio : b.precio - a.precio));
    filtros.forEach((b, i) => b.setAttribute('aria-pressed', String(categorias[i][0] === categoria)));
    contador.textContent = t('tienda.descubrimientos', { n: visibles.length });
    poner(rejilla, visibles.length ? visibles.map(p => el('li', { class: 'tn-producto' },
      el('button', { type: 'button', class: `tn-producto-foto tn-fondo-${p.acento}`, 'aria-label': t('tienda.verProducto', { producto: p.nombre }), onclick: () => verProducto(p) }, dibujoProducto(p)),
      el('span', { class: 'tn-etiqueta-precio' }, precioTexto(p.precio)),
      el('div', { class: 'tn-producto-info' },
        el('span', { class: 'tn-eyebrow' }, categorias.find(c => c[0] === p.categoria)[1]),
        el('h3', {}, p.nombre), el('p', {}, p.texto),
        el('button', { type: 'button', class: 'es-boton es-boton-papel tn-elegir', 'aria-label': t('tienda.elegirProducto', { producto: p.nombre }), onclick: () => verProducto(p) }, t('tienda.choose'), ' +')))) :
      el('li', { class: 'tn-sin-resultados' }, el('h3', {}, t('tienda.thisCornerIsWaitingTo')), el('p', {}, t('tienda.tryAnotherSearchOrExplore')),
        el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => { categoria = 'todo'; busqueda = ''; buscador.value = ''; pintarCatalogo(); buscador.focus(); } }, t('tienda.showAll'))));
  }
  const interior = el('section', { class: 'tn-interior', 'aria-labelledby': 'tn-coleccion' },
    el('header', { class: 'tn-interior-cabecera' },
      el('span', { class: 'tn-eyebrow' }, t('tienda.thePaglotUniverse')),
      el('h2', { id: 'tn-coleccion' }, t('tienda.littleThingsLotsOfLove')),
      contador),
    el('div', { class: 'tn-filtros', role: 'group', 'aria-label': t('tienda.collectionCategories') }, filtros),
    el('div', { class: 'tn-herramientas' }, el('div', { class: 'tn-busqueda' }, el('span', { class: 'tn-lupa', 'aria-hidden': 'true' }), buscador), ordenar),
    rejilla);

  // =====================================================================
  // El mostrador: gracias y preguntas
  // =====================================================================
  const mostrador = el('section', { class: 'tn-mostrador', 'aria-label': t('tienda.storeQuestions') },
    el('div', { class: 'tn-mostrador-encima' },
      dibujoPixel(CAJA, 'tn-caja', 'tn'),
      el('div', { class: 'tn-gracias es-papel' }, el('span', { class: 'tn-corazon', 'aria-hidden': 'true' }, '♥'), el('div', {}, el('h2', {}, t('tienda.aLittleSomethingThatMeans')), el('p', {}, t('tienda.youDoNotNeedTo'))))),
    el('div', { class: 'tn-preguntas' },
      el('details', {}, el('summary', {}, t('tienda.canIBuySomethingYet')), el('p', {}, t('tienda.weArePreparingTheStore'))),
      el('details', {}, el('summary', {}, t('tienda.areTheBooksPrintedOr')), el('p', {}, t('tienda.youWillBeAbleTo'))),
      el('details', {}, el('summary', {}, t('tienda.whatAboutCollectionProducts')), el('p', {}, t('tienda.theCollectionIsDesignedFor')))));

  poner(root, el('article', { class: 'tienda escena-web' }, fachada, interior, mostrador, cestaFlotante, detalle, bolsa, aviso));
  actualizarLibro(true);
  pintarCatalogo();
  contar();
  elenco.vigilar(fachada);
  // al entrar suena la campanilla de la puerta
  despues(250, () => sonar('timbre'));
  despues(700, () => { tendera.gesto('saludar'); tendera.decir(t('tn.tutora.hola'), 3000); });
  return () => {
    document.removeEventListener('pointerdown', fueraDeIdiomas);
    clearTimeout(avisoReloj);
    detalle.close();
    bolsa.close();
    document.body.classList.remove('tienda-dialogo-abierto');
    elenco.apagar();
  };
}
