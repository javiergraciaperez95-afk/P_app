// Escaparate y cesta de muestra. Los importes son ficticios y no se procesan pagos.
import { el, poner } from '../dom.js';
import { idioma, locale, t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, nombreCurso } from '../curso.js';
import { sonar } from '../sonidos.js';

const FOTO = 'assets/tienda/nutria.png';
// Se conserva durante esta sesión de la app, también al visitar otras vistas.
const cesta = [];

export function pintarTienda(root) {
  const euros = centimos => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(centimos / 100);
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
  let formatoLibro = 'papel';
  let categoria = 'todo';
  let busqueda = '';
  let orden = 'coleccion';
  let avisoReloj;
  const foto = (clase, lazy = true) => el('img', { class: clase, src: FOTO, alt: t('tienda.otterPlaceholderProductImage'), width: 250, height: 229, loading: lazy ? 'lazy' : 'eager' });
  const aviso = el('p', { class: 'tienda-aviso', role: 'status', 'aria-live': 'polite', hidden: true });
  const detalle = el('dialog', { class: 'tienda-dialogo tienda-detalle', 'aria-labelledby': 'tienda-detalle-titulo' });
  const bolsa = el('dialog', { class: 'tienda-dialogo tienda-bolsa', 'aria-labelledby': 'tienda-bolsa-titulo' });
  const numeroCesta = el('span', { class: 'tienda-cesta-numero' }, '0');
  const abrirCesta = el('button', { type: 'button', class: 'tienda-cesta-boton', onclick: () => { pintarCesta(); abrir(bolsa); } },
    el('span', { class: 'tienda-bolsa-icono', 'aria-hidden': 'true' }), t('tienda.myBag'), numeroCesta);

  function abrir(dialogo) {
    document.body.classList.add('tienda-dialogo-abierto');
    dialogo.showModal();
  }
  for (const dialogo of [detalle, bolsa]) {
    dialogo.addEventListener('close', () => {
      if (!detalle.open && !bolsa.open) document.body.classList.remove('tienda-dialogo-abierto');
    });
  }
  const cerrar = dialogo => el('button', { type: 'button', class: 'tienda-cerrar', 'aria-label': t('tienda.close'), onclick: () => dialogo.close() }, '×');
  function contar() {
    const n = cesta.reduce((total, linea) => total + linea.cantidad, 0);
    numeroCesta.textContent = String(n);
    abrirCesta.setAttribute('aria-label', t('tienda.miCesta', { n }));
  }
  function anadir(id, variante, idiomaElegido = '') {
    const clave = `${id}/${variante}/${idiomaElegido}`;
    const linea = cesta.find(item => item.clave === clave);
    if (linea) linea.cantidad = Math.min(99, linea.cantidad + 1);
    else cesta.push({ clave, id, variante, idioma: idiomaElegido, cantidad: 1 });
    contar();
    clearTimeout(avisoReloj);
    aviso.textContent = t('tienda.addedToYourDemoBag');
    aviso.hidden = false;
    avisoReloj = setTimeout(() => { aviso.hidden = true; }, 2600);
    sonar('clic');
  }
  function datosLinea(linea) {
    if (linea.id === 'libro') {
      const c = cursos.find(item => item.id === linea.idioma) ?? cursos[0];
      return {
        nombre: t('tienda.libroDe', { idioma: nombreCurso(c, idioma()) }),
        opcion: linea.variante === 'papel' ? t('tienda.printedEdition') : 'PDF',
        precio: linea.variante === 'papel' ? 2490 : 990,
      };
    }
    const p = productos.find(item => item.id === linea.id);
    return { nombre: p.nombre, opcion: p.opciones[linea.variante], precio: p.precio };
  }
  function cambiarCantidad(indice, diferencia, quitar = false) {
    const linea = cesta[indice];
    if (quitar || linea.cantidad + diferencia <= 0) cesta.splice(indice, 1);
    else linea.cantidad = Math.min(99, linea.cantidad + diferencia);
    contar();
    pintarCesta();
    const filas = bolsa.querySelectorAll('.tienda-linea');
    (filas[Math.min(indice, filas.length - 1)]?.querySelector('button') ?? bolsa.querySelector('.tienda-cerrar')).focus();
  }
  function pintarCesta() {
    const total = cesta.reduce((suma, linea) => suma + datosLinea(linea).precio * linea.cantidad, 0);
    poner(bolsa,
      el('header', { class: 'tienda-dialogo-cabecera' }, el('div', {}, el('span', { class: 'tienda-eyebrow' }, t('tienda.paglotStore')), el('h2', { id: 'tienda-bolsa-titulo' }, t('tienda.yourLittleTreasure'))), cerrar(bolsa)),
      cesta.length ? el('ul', { class: 'tienda-lineas' }, cesta.map((linea, i) => {
        const dato = datosLinea(linea);
        return el('li', { class: 'tienda-linea' }, foto('tienda-miniatura'),
          el('div', { class: 'tienda-linea-datos' }, el('h3', {}, dato.nombre), el('p', {}, dato.opcion),
            el('div', { class: 'tienda-cantidad', role: 'group', 'aria-label': t('tienda.cantidadDe', { producto: dato.nombre }) },
              el('button', { type: 'button', 'aria-label': t('tienda.removeOne'), onclick: () => cambiarCantidad(i, -1) }, '−'),
              el('span', {}, String(linea.cantidad)),
              el('button', { type: 'button', 'aria-label': t('tienda.addOne'), disabled: linea.cantidad >= 99, onclick: () => cambiarCantidad(i, 1) }, '+'))),
          el('div', { class: 'tienda-linea-precio' }, el('strong', {}, euros(dato.precio * linea.cantidad)),
            el('button', { type: 'button', class: 'tienda-quitar', 'aria-label': t('tienda.quitarProducto', { producto: dato.nombre }), onclick: () => cambiarCantidad(i, 0, true) }, t('tienda.remove'))));
      })) : el('div', { class: 'tienda-vacio' }, el('span', { 'aria-hidden': 'true' }, '✦'), el('h3', {}, t('tienda.thereIsStillRoomFor')), el('p', {}, t('tienda.pickABookOrA')), el('button', { type: 'button', class: 'boton', onclick: () => bolsa.close() }, t('tienda.keepBrowsing'))),
      cesta.length ? el('footer', { class: 'tienda-bolsa-resumen' },
        el('p', { class: 'tienda-subtotal' }, el('span', {}, t('tienda.demoTotal')), el('strong', {}, euros(total))),
        el('button', { type: 'button', class: 'boton boton-principal', disabled: true }, t('tienda.purchasingComingSoon')),
        el('p', { class: 'tienda-nota' }, t('tienda.thisBagIsAPreview'))) : null);
  }
  function verProducto(p) {
    const variantes = el('select', { id: 'tienda-variante' }, p.opciones.map((opcion, i) => el('option', { value: String(i) }, opcion)));
    const form = el('form', { class: 'tienda-detalle-info', onsubmit: evento => { evento.preventDefault(); anadir(p.id, Number(variantes.value)); detalle.close(); } },
      el('span', { class: 'tienda-eyebrow' }, categorias.find(c => c[0] === p.categoria)[1]),
      el('h2', { id: 'tienda-detalle-titulo' }, p.nombre), el('p', {}, p.texto),
      el('p', { class: 'tienda-detalle-precio' }, euros(p.precio)), el('label', { for: 'tienda-variante' }, p.etiqueta), variantes,
      el('button', { type: 'submit', class: 'boton boton-principal' }, t('tienda.addToMyBag'), ' +'),
      el('p', { class: 'tienda-nota' }, t('tienda.samplePriceAndOptionsPlaceholder')));
    poner(detalle, cerrar(detalle), el('div', { class: `tienda-detalle-foto tienda-tono-${p.acento}` }, foto('', false)), form);
    abrir(detalle);
  }

  const libroNombre = el('h3', { class: 'tienda-libro-nombre' });
  const libroPrecio = el('strong', { class: 'tienda-libro-precio' });
  const libroFormato = el('span', { class: 'tienda-libro-formato' });
  const libroNota = el('p', { class: 'tienda-libro-nota', role: 'status' });
  const idiomaNombre = el('span', { class: 'tienda-idioma-nombre' });
  const selectorIdioma = el('button', {
    type: 'button', id: 'tienda-libro-idioma', class: 'tienda-idioma-boton',
    'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': 'tienda-idioma-lista',
  }, idiomaNombre, el('span', { 'aria-hidden': 'true' }, '▾'));
  const listaIdiomas = el('div', { id: 'tienda-idioma-lista', class: 'tienda-idioma-lista', role: 'listbox', 'aria-label': t('tienda.bookLanguage'), hidden: true });
  const opcionesIdioma = cursos.map(c => el('button', {
    type: 'button', role: 'option', tabindex: '-1', 'aria-selected': String(c.id === idiomaLibro),
    onclick: () => { idiomaLibro = c.id; actualizarLibro(); cerrarIdiomas(true); sonar('clic'); },
  }, nombreCurso(c, idioma())));
  listaIdiomas.append(...opcionesIdioma);
  const idiomasLibro = el('div', { class: 'tienda-idioma', 'data-sin-efectos': true }, selectorIdioma, listaIdiomas);
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
    idiomasLibro.classList.toggle('tienda-idioma-arriba', haciaArriba);
    listaIdiomas.style.maxHeight = `${Math.max(80, Math.min(220, (haciaArriba ? arriba : abajo) - 12))}px`;
    listaIdiomas.hidden = false;
    selectorIdioma.setAttribute('aria-expanded', 'true');
    enfocarIdioma(cursos.findIndex(c => c.id === idiomaLibro));
  }
  selectorIdioma.addEventListener('click', () => listaIdiomas.hidden ? abrirIdiomas() : cerrarIdiomas());
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
    type: 'button', class: 'tienda-formato', 'aria-pressed': String(formato === formatoLibro),
    onclick: () => { formatoLibro = formato; actualizarLibro(); sonar('clic'); },
  }, el('span', {}, formato === 'papel' ? t('tienda.printed') : 'PDF'), el('small', {}, euros(formato === 'papel' ? 2490 : 990))));
  function actualizarLibro() {
    const c = cursos.find(item => item.id === idiomaLibro);
    idiomaNombre.textContent = nombreCurso(c, idioma());
    opcionesIdioma.forEach((opcion, i) => opcion.setAttribute('aria-selected', String(cursos[i].id === idiomaLibro)));
    libroNombre.textContent = nombreCurso(c, idioma());
    libroPrecio.textContent = euros(formatoLibro === 'papel' ? 2490 : 990);
    libroFormato.textContent = formatoLibro === 'papel' ? t('tienda.printedEdition2') : t('tienda.digitalEditionPdf');
    libroNota.textContent = formatoLibro === 'papel' ? t('tienda.toUnderlineTakeNotesAnd') : t('tienda.takeYourNextWordsWith');
    formatos.forEach((b, i) => b.setAttribute('aria-pressed', String(['papel', 'pdf'][i] === formatoLibro)));
  }

  const rejilla = el('div', { class: 'tienda-rejilla' });
  const contador = el('p', { class: 'tienda-resultados', role: 'status', 'aria-live': 'polite' });
  const normalizar = texto => texto.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const buscador = el('input', { type: 'search', placeholder: t('tienda.findYourNextLittleTreasure'), 'aria-label': t('tienda.searchTheCollection'), oninput: () => { busqueda = buscador.value; pintarCatalogo(); } });
  const ordenar = el('select', { 'aria-label': t('tienda.sortProducts'), onchange: () => { orden = ordenar.value; pintarCatalogo(); } },
    el('option', { value: 'coleccion' }, t('tienda.ourSelection')), el('option', { value: 'menor' }, t('tienda.priceLowToHigh')), el('option', { value: 'mayor' }, t('tienda.priceHighToLow')));
  const filtros = categorias.map(([id, nombre]) => el('button', { type: 'button', class: 'tienda-filtro', 'aria-pressed': String(id === categoria), onclick: () => { categoria = id; pintarCatalogo(); sonar('clic'); } }, nombre));
  function pintarCatalogo() {
    const visibles = productos.filter(p => (categoria === 'todo' || p.categoria === categoria) && normalizar(`${p.nombre} ${p.texto}`).includes(normalizar(busqueda)));
    if (orden !== 'coleccion') visibles.sort((a, b) => orden === 'menor' ? a.precio - b.precio : b.precio - a.precio);
    filtros.forEach((b, i) => b.setAttribute('aria-pressed', String(categorias[i][0] === categoria)));
    contador.textContent = t('tienda.descubrimientos', { n: visibles.length });
    poner(rejilla, visibles.length ? visibles.map(p => el('article', { class: `tienda-producto tienda-tono-${p.acento}` },
      el('button', { type: 'button', class: 'tienda-producto-foto', 'aria-label': t('tienda.verProducto', { producto: p.nombre }), onclick: () => verProducto(p) }, foto(''), el('span', { class: 'tienda-producto-categoria' }, categorias.find(c => c[0] === p.categoria)[1])),
      el('div', { class: 'tienda-producto-info' }, el('h3', {}, p.nombre), el('p', {}, p.texto),
        el('div', { class: 'tienda-producto-pie' }, el('strong', {}, euros(p.precio)), el('button', { type: 'button', class: 'tienda-elegir', 'aria-label': t('tienda.elegirProducto', { producto: p.nombre }), onclick: () => verProducto(p) }, t('tienda.choose'), ' +'))))) :
      el('div', { class: 'tienda-sin-resultados' }, el('h3', {}, t('tienda.thisCornerIsWaitingTo')), el('p', {}, t('tienda.tryAnotherSearchOrExplore')),
        el('button', { type: 'button', class: 'boton', onclick: () => { categoria = 'todo'; busqueda = ''; buscador.value = ''; pintarCatalogo(); buscador.focus(); } }, t('tienda.showAll'))));
  }
  const catalogo = el('section', { class: 'tienda-catalogo', 'aria-labelledby': 'tienda-coleccion' },
    el('header', { class: 'tienda-catalogo-cabecera' }, el('div', {}, el('span', { class: 'tienda-eyebrow' }, t('tienda.thePaglotUniverse')), el('h2', { id: 'tienda-coleccion' }, t('tienda.littleThingsLotsOfLove'))), contador),
    el('div', { class: 'tienda-herramientas' }, el('div', { class: 'tienda-filtros', role: 'group', 'aria-label': t('tienda.collectionCategories') }, filtros), el('div', { class: 'tienda-busqueda' }, buscador, ordenar)), rejilla);

  poner(root, el('article', { class: 'tienda' },
    el('header', { class: 'tienda-cabecera' }, el('span', { class: 'tienda-eyebrow' }, t('tienda.paglotStore')), abrirCesta),
    el('section', { class: 'tienda-portada', 'aria-labelledby': 'tienda-titulo' },
      el('div', { class: 'tienda-intro' }, el('span', { class: 'tienda-edicion' }, t('tienda.madeToKeepYouCompany')),
        el('h1', { id: 'tienda-titulo' }, t('tienda.aLittlePaglot'), el('span', {}, t('tienda.toTakeWithYou'))),
        el('p', {}, t('tienda.booksToDiscoverTheWorld')),
        el('button', { type: 'button', class: 'tienda-ver-coleccion', onclick: () => catalogo.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }) }, t('tienda.exploreTheCollection'), ' ↓')),
      el('div', { class: 'tienda-libro' },
        el('div', { class: 'tienda-libro-visual' },
          el('div', { class: 'tienda-cubierta' }, el('span', { class: 'tienda-cubierta-marca' }, t('tienda.paglotBooks')), foto('', false), libroNombre, libroFormato),
          el('span', { class: 'tienda-libro-sello' }, t('tienda.onePageABeginning'))),
        el('div', { class: 'tienda-libro-config' }, el('span', { class: 'tienda-eyebrow' }, t('tienda.thePaglotLibrary')),
          el('h2', {}, t('tienda.yourNextLanguagePageBy')),
          el('label', { for: 'tienda-libro-idioma' }, t('tienda.whichLanguageIsCallingYou')), idiomasLibro,
          el('div', { class: 'tienda-formatos', role: 'group', 'aria-label': t('tienda.bookFormat') }, formatos), libroNota,
          el('div', { class: 'tienda-libro-comprar' }, libroPrecio, el('button', { type: 'button', class: 'boton boton-principal', onclick: () => anadir('libro', formatoLibro, idiomaLibro) }, t('tienda.addBook'), ' +'))))),
    el('p', { class: 'tienda-demo' }, el('span', { 'aria-hidden': 'true' }, '✦'), t('tienda.demoStoreSamplePricesPurchasing')),
    catalogo,
    el('aside', { class: 'tienda-gracias' }, el('span', { 'aria-hidden': 'true' }, '♥'), el('div', {}, el('h2', {}, t('tienda.aLittleSomethingThatMeans')), el('p', {}, t('tienda.youDoNotNeedTo')))),
    el('section', { class: 'tienda-preguntas', 'aria-label': t('tienda.storeQuestions') },
      el('details', {}, el('summary', {}, t('tienda.canIBuySomethingYet')), el('p', {}, t('tienda.weArePreparingTheStore'))),
      el('details', {}, el('summary', {}, t('tienda.areTheBooksPrintedOr')), el('p', {}, t('tienda.youWillBeAbleTo'))),
      el('details', {}, el('summary', {}, t('tienda.whatAboutCollectionProducts')), el('p', {}, t('tienda.theCollectionIsDesignedFor'))))),
    detalle, bolsa, aviso);
  actualizarLibro();
  pintarCatalogo();
  contar();
  return () => {
    document.removeEventListener('pointerdown', fueraDeIdiomas);
    clearTimeout(avisoReloj);
    detalle.close();
    bolsa.close();
    document.body.classList.remove('tienda-dialogo-abierto');
  };
}
