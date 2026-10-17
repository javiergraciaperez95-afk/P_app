// Escaparate y cesta de muestra. Los importes son ficticios y no se procesan pagos.
import { el, poner } from '../dom.js';
import { idioma, locale, copiarUI as copy } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, nombreCurso } from '../curso.js';
import { sonar } from '../sonidos.js';

const FOTO = 'assets/tienda/nutria.png';
// Se conserva durante esta sesión de la app, también al visitar otras vistas.
const cesta = [];

export function pintarTienda(root) {
  const euros = centimos => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(centimos / 100);
  const productos = [
    { id: 'camiseta', categoria: 'ropa', precio: 2490, nombre: copy('Camiseta «Una palabra más»', '“One more word” T-shirt'), texto: copy('Para llevar tus ganas de aprender a todas partes.', 'Take your love of learning everywhere.'), opciones: ['S', 'M', 'L', 'XL'], etiqueta: copy('Talla', 'Size'), acento: 'rosa' },
    { id: 'capucha', categoria: 'ropa', precio: 4490, nombre: copy('Sudadera «Modo estudio»', '“Study mode” hoodie'), texto: copy('Una capucha, tu rincón favorito y otro pequeño avance.', 'A hood, your favourite corner and one more small step.'), opciones: ['S', 'M', 'L', 'XL'], etiqueta: copy('Talla', 'Size'), acento: 'lavanda' },
    { id: 'sudadera', categoria: 'ropa', precio: 3990, nombre: copy('Sudadera «Sin prisa»', '“Take your time” sweatshirt'), texto: copy('Cuello redondo y espíritu Paglot para los días tranquilos.', 'A crew neck and a little Paglot spirit for quieter days.'), opciones: ['S', 'M', 'L', 'XL'], etiqueta: copy('Talla', 'Size'), acento: 'menta' },
    { id: 'tote', categoria: 'accesorios', precio: 1890, nombre: copy('Tote bag «Llevo historias»', '“Carrying stories” tote bag'), texto: copy('Un sitio para tus libros, tus apuntes y tus próximas ideas.', 'Room for your books, notes and next big ideas.'), opciones: [copy('Natural', 'Natural'), copy('Negro', 'Black')], etiqueta: copy('Color', 'Colour'), acento: 'arena' },
    { id: 'taza', categoria: 'casa', precio: 1490, nombre: copy('Taza «Un sorbito y seguimos»', '“A sip, then onwards” mug'), texto: copy('Una pausa pequeña también forma parte de aprender.', 'A little break is part of learning, too.'), opciones: [copy('Clara', 'Light'), copy('Oscura', 'Dark')], etiqueta: copy('Acabado', 'Finish'), acento: 'azul' },
    { id: 'funda', categoria: 'accesorios', precio: 1990, nombre: copy('Funda «Hola, mundo»', '“Hello, world” phone case'), texto: copy('Un pequeño guiño de Paglot cada vez que coges el móvil.', 'A little Paglot moment whenever you pick up your phone.'), opciones: ['iPhone 15', 'iPhone 16', 'Samsung Galaxy S24'], etiqueta: copy('Modelo de muestra', 'Sample model'), acento: 'lavanda' },
    { id: 'poster', categoria: 'casa', precio: 1290, nombre: copy('Póster «El mundo en palabras»', '“A world of words” poster'), texto: copy('Un rincón de la pared para recordar por qué empezaste.', 'A little space on your wall to remember why you started.'), opciones: ['A4', 'A3'], etiqueta: copy('Formato', 'Format'), acento: 'rosa' },
    { id: 'lienzo', categoria: 'casa', precio: 3490, nombre: copy('Lienzo «Pequeños grandes pasos»', '“Small, mighty steps” canvas'), texto: copy('Para dar un poco de personalidad a tu espacio de estudio.', 'Bring a little personality to your study space.'), opciones: ['20 × 30 cm', '30 × 40 cm'], etiqueta: copy('Formato', 'Format'), acento: 'menta' },
    { id: 'calendario', categoria: 'papel', precio: 1690, nombre: copy('Calendario «Un día, una palabra»', '“A day, a word” calendar'), texto: copy('Un lugar para tus planes y esos pequeños logros que cuentan.', 'A place for your plans and those little wins that matter.'), opciones: [copy('De pared', 'Wall calendar')], etiqueta: copy('Formato', 'Format'), acento: 'azul' },
    { id: 'postales', categoria: 'papel', precio: 990, nombre: copy('Postales «Palabras bonitas»', '“Lovely words” postcards'), texto: copy('Para regalar unas líneas a alguien que te importa.', 'Send a few words to someone who matters.'), opciones: [copy('Juego de 6', 'Set of 6')], etiqueta: copy('Presentación', 'Set'), acento: 'arena' },
  ];
  const categorias = [
    ['todo', copy('Toda la colección', 'The whole collection')], ['ropa', copy('Ropa', 'Clothing')],
    ['accesorios', copy('Accesorios', 'Accessories')], ['casa', copy('Tu rincón', 'Your space')], ['papel', copy('Papel bonito', 'Lovely paper')],
  ];
  const cursos = CURSOS.filter(c => !c.proximamente);
  let idiomaLibro = hayCurso ? curso.id : 'es';
  let formatoLibro = 'papel';
  let categoria = 'todo';
  let busqueda = '';
  let orden = 'coleccion';
  let avisoReloj;
  const foto = (clase, lazy = true) => el('img', { class: clase, src: FOTO, alt: copy('Nutria: imagen provisional del producto', 'Otter: placeholder product image'), width: 250, height: 229, loading: lazy ? 'lazy' : 'eager' });
  const aviso = el('p', { class: 'tienda-aviso', role: 'status', 'aria-live': 'polite', hidden: true });
  const detalle = el('dialog', { class: 'tienda-dialogo tienda-detalle', 'aria-labelledby': 'tienda-detalle-titulo' });
  const bolsa = el('dialog', { class: 'tienda-dialogo tienda-bolsa', 'aria-labelledby': 'tienda-bolsa-titulo' });
  const numeroCesta = el('span', { class: 'tienda-cesta-numero' }, '0');
  const abrirCesta = el('button', { type: 'button', class: 'tienda-cesta-boton', onclick: () => { pintarCesta(); abrir(bolsa); } },
    el('span', { class: 'tienda-bolsa-icono', 'aria-hidden': 'true' }), copy('Mi cesta', 'My bag'), numeroCesta);

  function abrir(dialogo) {
    document.body.classList.add('tienda-dialogo-abierto');
    dialogo.showModal();
  }
  for (const dialogo of [detalle, bolsa]) {
    dialogo.addEventListener('close', () => {
      if (!detalle.open && !bolsa.open) document.body.classList.remove('tienda-dialogo-abierto');
    });
  }
  const cerrar = dialogo => el('button', { type: 'button', class: 'tienda-cerrar', 'aria-label': copy('Cerrar', 'Close'), onclick: () => dialogo.close() }, '×');
  function contar() {
    const n = cesta.reduce((total, linea) => total + linea.cantidad, 0);
    numeroCesta.textContent = String(n);
    abrirCesta.setAttribute('aria-label', copy(`Mi cesta: ${n} artículos`, `My bag: ${n} items`));
  }
  function anadir(id, variante, idiomaElegido = '') {
    const clave = `${id}/${variante}/${idiomaElegido}`;
    const linea = cesta.find(item => item.clave === clave);
    if (linea) linea.cantidad = Math.min(99, linea.cantidad + 1);
    else cesta.push({ clave, id, variante, idioma: idiomaElegido, cantidad: 1 });
    contar();
    clearTimeout(avisoReloj);
    aviso.textContent = copy('Añadido a tu cesta de muestra. ¡Gracias por el cariño!', 'Added to your demo bag. Thanks for the love!');
    aviso.hidden = false;
    avisoReloj = setTimeout(() => { aviso.hidden = true; }, 2600);
    sonar('clic');
  }
  function datosLinea(linea) {
    if (linea.id === 'libro') {
      const c = cursos.find(item => item.id === linea.idioma) ?? cursos[0];
      return {
        nombre: copy(`Libro de ${nombreCurso(c, idioma())}`, `${nombreCurso(c, idioma())} book`),
        opcion: linea.variante === 'papel' ? copy('Edición impresa', 'Printed edition') : 'PDF',
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
      el('header', { class: 'tienda-dialogo-cabecera' }, el('div', {}, el('span', { class: 'tienda-eyebrow' }, copy('PAGLOT / TIENDA', 'PAGLOT / STORE')), el('h2', { id: 'tienda-bolsa-titulo' }, copy('Tu pequeño tesoro', 'Your little treasure'))), cerrar(bolsa)),
      cesta.length ? el('ul', { class: 'tienda-lineas' }, cesta.map((linea, i) => {
        const dato = datosLinea(linea);
        return el('li', { class: 'tienda-linea' }, foto('tienda-miniatura'),
          el('div', { class: 'tienda-linea-datos' }, el('h3', {}, dato.nombre), el('p', {}, dato.opcion),
            el('div', { class: 'tienda-cantidad', role: 'group', 'aria-label': copy(`Cantidad de ${dato.nombre}`, `Quantity of ${dato.nombre}`) },
              el('button', { type: 'button', 'aria-label': copy('Restar una unidad', 'Remove one'), onclick: () => cambiarCantidad(i, -1) }, '−'),
              el('span', {}, String(linea.cantidad)),
              el('button', { type: 'button', 'aria-label': copy('Sumar una unidad', 'Add one'), disabled: linea.cantidad >= 99, onclick: () => cambiarCantidad(i, 1) }, '+'))),
          el('div', { class: 'tienda-linea-precio' }, el('strong', {}, euros(dato.precio * linea.cantidad)),
            el('button', { type: 'button', class: 'tienda-quitar', 'aria-label': copy(`Quitar ${dato.nombre}`, `Remove ${dato.nombre}`), onclick: () => cambiarCantidad(i, 0, true) }, copy('Quitar', 'Remove'))));
      })) : el('div', { class: 'tienda-vacio' }, el('span', { 'aria-hidden': 'true' }, '✦'), el('h3', {}, copy('Todavía hay espacio para una historia', 'There is still room for a story')), el('p', {}, copy('Elige un libro o un pequeño detalle de la colección.', 'Pick a book or a little something from the collection.')), el('button', { type: 'button', class: 'boton', onclick: () => bolsa.close() }, copy('Seguir mirando', 'Keep browsing'))),
      cesta.length ? el('footer', { class: 'tienda-bolsa-resumen' },
        el('p', { class: 'tienda-subtotal' }, el('span', {}, copy('Total de muestra', 'Demo total')), el('strong', {}, euros(total))),
        el('button', { type: 'button', class: 'boton boton-principal', disabled: true }, copy('Compras próximamente', 'Purchasing coming soon')),
        el('p', { class: 'tienda-nota' }, copy('Esta cesta es una vista previa. No se realiza ningún cobro.', 'This bag is a preview. No payments are made.'))) : null);
  }
  function verProducto(p) {
    const variantes = el('select', { id: 'tienda-variante' }, p.opciones.map((opcion, i) => el('option', { value: String(i) }, opcion)));
    const form = el('form', { class: 'tienda-detalle-info', onsubmit: evento => { evento.preventDefault(); anadir(p.id, Number(variantes.value)); detalle.close(); } },
      el('span', { class: 'tienda-eyebrow' }, categorias.find(c => c[0] === p.categoria)[1]),
      el('h2', { id: 'tienda-detalle-titulo' }, p.nombre), el('p', {}, p.texto),
      el('p', { class: 'tienda-detalle-precio' }, euros(p.precio)), el('label', { for: 'tienda-variante' }, p.etiqueta), variantes,
      el('button', { type: 'submit', class: 'boton boton-principal' }, copy('Añadir a mi cesta', 'Add to my bag'), ' +'),
      el('p', { class: 'tienda-nota' }, copy('Precio y opciones de muestra. Imagen provisional.', 'Sample price and options. Placeholder image.')));
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
  const listaIdiomas = el('div', { id: 'tienda-idioma-lista', class: 'tienda-idioma-lista', role: 'listbox', 'aria-label': copy('Idioma del libro', 'Book language'), hidden: true });
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
  }, el('span', {}, formato === 'papel' ? copy('En papel', 'Printed') : 'PDF'), el('small', {}, euros(formato === 'papel' ? 2490 : 990))));
  function actualizarLibro() {
    const c = cursos.find(item => item.id === idiomaLibro);
    idiomaNombre.textContent = nombreCurso(c, idioma());
    opcionesIdioma.forEach((opcion, i) => opcion.setAttribute('aria-selected', String(cursos[i].id === idiomaLibro)));
    libroNombre.textContent = nombreCurso(c, idioma());
    libroPrecio.textContent = euros(formatoLibro === 'papel' ? 2490 : 990);
    libroFormato.textContent = formatoLibro === 'papel' ? copy('EDICIÓN IMPRESA', 'PRINTED EDITION') : copy('EDICIÓN DIGITAL / PDF', 'DIGITAL EDITION / PDF');
    libroNota.textContent = formatoLibro === 'papel' ? copy('Para subrayar, anotar y volver a esa página una vez más.', 'To underline, take notes and return to that page once more.') : copy('Para llevar tus próximas palabras en tu pantalla favorita.', 'Take your next words with you on your favourite screen.');
    formatos.forEach((b, i) => b.setAttribute('aria-pressed', String(['papel', 'pdf'][i] === formatoLibro)));
  }

  const rejilla = el('div', { class: 'tienda-rejilla' });
  const contador = el('p', { class: 'tienda-resultados', role: 'status', 'aria-live': 'polite' });
  const normalizar = texto => texto.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const buscador = el('input', { type: 'search', placeholder: copy('Encuentra tu próximo detalle…', 'Find your next little treasure…'), 'aria-label': copy('Buscar en la colección', 'Search the collection'), oninput: () => { busqueda = buscador.value; pintarCatalogo(); } });
  const ordenar = el('select', { 'aria-label': copy('Ordenar productos', 'Sort products'), onchange: () => { orden = ordenar.value; pintarCatalogo(); } },
    el('option', { value: 'coleccion' }, copy('Nuestra selección', 'Our selection')), el('option', { value: 'menor' }, copy('Precio: menor a mayor', 'Price: low to high')), el('option', { value: 'mayor' }, copy('Precio: mayor a menor', 'Price: high to low')));
  const filtros = categorias.map(([id, nombre]) => el('button', { type: 'button', class: 'tienda-filtro', 'aria-pressed': String(id === categoria), onclick: () => { categoria = id; pintarCatalogo(); sonar('clic'); } }, nombre));
  function pintarCatalogo() {
    const visibles = productos.filter(p => (categoria === 'todo' || p.categoria === categoria) && normalizar(`${p.nombre} ${p.texto}`).includes(normalizar(busqueda)));
    if (orden !== 'coleccion') visibles.sort((a, b) => orden === 'menor' ? a.precio - b.precio : b.precio - a.precio);
    filtros.forEach((b, i) => b.setAttribute('aria-pressed', String(categorias[i][0] === categoria)));
    contador.textContent = copy(`${visibles.length} pequeños descubrimientos`, `${visibles.length} little discoveries`);
    poner(rejilla, visibles.length ? visibles.map(p => el('article', { class: `tienda-producto tienda-tono-${p.acento}` },
      el('button', { type: 'button', class: 'tienda-producto-foto', 'aria-label': copy(`Ver ${p.nombre}`, `View ${p.nombre}`), onclick: () => verProducto(p) }, foto(''), el('span', { class: 'tienda-producto-categoria' }, categorias.find(c => c[0] === p.categoria)[1])),
      el('div', { class: 'tienda-producto-info' }, el('h3', {}, p.nombre), el('p', {}, p.texto),
        el('div', { class: 'tienda-producto-pie' }, el('strong', {}, euros(p.precio)), el('button', { type: 'button', class: 'tienda-elegir', 'aria-label': copy(`Elegir ${p.nombre}`, `Choose ${p.nombre}`), onclick: () => verProducto(p) }, copy('Elegir', 'Choose'), ' +'))))) :
      el('div', { class: 'tienda-sin-resultados' }, el('h3', {}, copy('Este rincón está por descubrir', 'This corner is waiting to be discovered')), el('p', {}, copy('Prueba otra búsqueda o vuelve a ver la colección completa.', 'Try another search or explore the full collection.')),
        el('button', { type: 'button', class: 'boton', onclick: () => { categoria = 'todo'; busqueda = ''; buscador.value = ''; pintarCatalogo(); buscador.focus(); } }, copy('Ver todo', 'Show all'))));
  }
  const catalogo = el('section', { class: 'tienda-catalogo', 'aria-labelledby': 'tienda-coleccion' },
    el('header', { class: 'tienda-catalogo-cabecera' }, el('div', {}, el('span', { class: 'tienda-eyebrow' }, copy('EL UNIVERSO PAGLOT', 'THE PAGLOT UNIVERSE')), el('h2', { id: 'tienda-coleccion' }, copy('Pequeñas cosas. Mucho cariño.', 'Little things. Lots of love.'))), contador),
    el('div', { class: 'tienda-herramientas' }, el('div', { class: 'tienda-filtros', role: 'group', 'aria-label': copy('Categorías de la colección', 'Collection categories') }, filtros), el('div', { class: 'tienda-busqueda' }, buscador, ordenar)), rejilla);

  poner(root, el('article', { class: 'tienda' },
    el('header', { class: 'tienda-cabecera' }, el('span', { class: 'tienda-eyebrow' }, copy('PAGLOT / TIENDA', 'PAGLOT / STORE')), abrirCesta),
    el('section', { class: 'tienda-portada', 'aria-labelledby': 'tienda-titulo' },
      el('div', { class: 'tienda-intro' }, el('span', { class: 'tienda-edicion' }, copy('HECHO PARA ACOMPAÑARTE', 'MADE TO KEEP YOU COMPANY')),
        el('h1', { id: 'tienda-titulo' }, copy('Un poquito de Paglot, ', 'A little Paglot, '), el('span', {}, copy('para llevar.', 'to take with you.'))),
        el('p', {}, copy('Libros para descubrir el mundo y detalles para hacer tuyo el camino. Gracias por darle un rinconcito a Paglot.', 'Books to discover the world and little things to make the journey yours. Thanks for giving Paglot a little space.')),
        el('button', { type: 'button', class: 'tienda-ver-coleccion', onclick: () => catalogo.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }) }, copy('Ojea la colección', 'Explore the collection'), ' ↓')),
      el('div', { class: 'tienda-libro' },
        el('div', { class: 'tienda-libro-visual' },
          el('div', { class: 'tienda-cubierta' }, el('span', { class: 'tienda-cubierta-marca' }, copy('PAGLOT / LIBROS', 'PAGLOT / BOOKS')), foto('', false), libroNombre, libroFormato),
          el('span', { class: 'tienda-libro-sello' }, copy('Una página.\nUn comienzo.', 'One page.\nA beginning.'))),
        el('div', { class: 'tienda-libro-config' }, el('span', { class: 'tienda-eyebrow' }, copy('LA BIBLIOTECA PAGLOT', 'THE PAGLOT LIBRARY')),
          el('h2', {}, copy('Tu próximo idioma, página a página.', 'Your next language, page by page.')),
          el('label', { for: 'tienda-libro-idioma' }, copy('¿Qué idioma te apetece?', 'Which language is calling you?')), idiomasLibro,
          el('div', { class: 'tienda-formatos', role: 'group', 'aria-label': copy('Formato del libro', 'Book format') }, formatos), libroNota,
          el('div', { class: 'tienda-libro-comprar' }, libroPrecio, el('button', { type: 'button', class: 'boton boton-principal', onclick: () => anadir('libro', formatoLibro, idiomaLibro) }, copy('Añadir libro', 'Add book'), ' +'))))),
    el('p', { class: 'tienda-demo' }, el('span', { 'aria-hidden': 'true' }, '✦'), copy(' Escaparate de muestra · Precios ficticios · Compras próximamente', ' Demo store · Sample prices · Purchasing coming soon')),
    catalogo,
    el('aside', { class: 'tienda-gracias' }, el('span', { 'aria-hidden': 'true' }, '♥'), el('div', {}, el('h2', {}, copy('Un pequeño detalle que significa mucho.', 'A little something that means a lot.')), el('p', {}, copy('No hace falta comprar para formar parte de Paglot. Cuando abramos la tienda, cada pedido ayudará a cuidar este proyecto y a seguir creando.', 'You do not need to buy anything to be part of Paglot. When the store opens, every order will help us care for this project and keep creating.')))),
    el('section', { class: 'tienda-preguntas', 'aria-label': copy('Preguntas sobre la tienda', 'Store questions') },
      el('details', {}, el('summary', {}, copy('¿Puedo comprar ya?', 'Can I buy something yet?')), el('p', {}, copy('Estamos preparando la tienda. Puedes explorar los productos y probar la cesta; los precios y las imágenes son de muestra y todavía no se realizan pagos.', 'We are preparing the store. You can explore products and try the bag; prices and images are samples, and payments are not available yet.'))),
      el('details', {}, el('summary', {}, copy('¿Los libros son en papel o PDF?', 'Are the books printed or PDF?')), el('p', {}, copy('Podrás elegir la edición impresa o el PDF para cada idioma. En el escaparate puedes cambiar de formato y ver su precio de muestra.', 'You will be able to choose a printed edition or a PDF for each language. Switch formats in the store preview to see the sample price.'))),
      el('details', {}, el('summary', {}, copy('¿Y los productos de la colección?', 'What about collection products?')), el('p', {}, copy('La colección está pensada para impresión bajo demanda. Antes de abrir confirmaremos los diseños, las opciones y los envíos.', 'The collection is designed for print on demand. We will confirm designs, options and delivery before opening.'))))),
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
