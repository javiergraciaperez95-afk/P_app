// Arranque y navegación.
// Rutas del curso: #/lecciones · #/leccion/001 · #/practica · #/frases · #/cuaderno · #/reto · #/repaso · #/perfil · #/bienvenida
// Rutas de la web: #/inicio · #/idiomas · #/entrar · #/precios · #/sobre · #/social · #/contacto · #/producto · #/escuelas ·
// #/empresas · #/regala-max · #/tienda · #/guias · #/faq · #/laboratorio · #/creditos · #/legal · #/desarrollador
// Sin curso elegido solo existen las pantallas de la web. La cuenta es al estilo Mullvad (js/nube.js).

import './suave.js'; // lo primero: en el móvil, todo se mueve suave
import { el, poner } from './dom.js';
import { activarDesarrollador } from './desarrollador.js';
import { icono } from './iconos.js';
import { descubrirLecciones, cargarIndice, cargarDiccionario, cargarLeccion, cargarCapitulos, cargarFrases } from './lessons.js';
import { ajuste, aplicarTema, temaActual, cambiarAjuste, aplicarComodidad } from './ajustes.js';
import { t, tr, aplicarIdioma, IDIOMAS, IDIOMAS_VISIBLES, idioma, cambiarIdioma } from './i18n.js';
import { sonar, prepararVoces } from './sonidos.js';
import { alCambiar, hayProgreso } from './progress.js';
import { pintarCabecera, pendientesDeHoy } from './cabecera.js';
import { iniciarPie, pintarPie } from './pie.js';
import { decir } from './tutor.js';
import { agrupar, pintarLecciones } from './vistas/lecciones.js';
import { pintarLeccion, cerrarFicha, ponerDiccionarioGlobal, ponerDiccionario } from './vistas/leccion.js';
import { pintarReto } from './vistas/reto.js';
import { pintarElegirCurso } from './vistas/cursos.js';
import { pintarLegal, pintarAvisoDeDatos } from './vistas/legal.js';
import { paginarEnMovil, esMovil } from './paginas-movil.js';
import { pintarInicio } from './vistas/inicio.js';
import { pintarBienvenida, bienvenidaVista } from './vistas/bienvenida.js';
import { pintarPerdida } from './vistas/perdida.js';
import { iniciarLogros, comprobarLogros } from './logros.js';
import { iniciarNube } from './nube.js';
import { curso, hayCurso, nombreDelCurso, esBeta } from './curso.js';
import './movil.js';
import './chispa.js';

const app = document.getElementById('app');
const menu = document.getElementById('menu');
const controlesCabecera = document.querySelector('.cabecera-botones');
const ajustesCabecera = document.createElement('details');
ajustesCabecera.className = 'cabecera-ajustes';
const abrirAjustes = document.createElement('summary');
abrirAjustes.className = 'btn';
const panelAjustes = document.createElement('div');
panelAjustes.className = 'cabecera-ajustes-panel';
ajustesCabecera.append(abrirAjustes, panelAjustes);
const controlesAjustes = ['.idioma-menu', '#btn-sonido', '#btn-tema'].map(s => controlesCabecera.querySelector(s));
// Sin sesión no hay avatar (con su «Mi perfil»): el perfil va dentro de Ajustes.
const enlacePerfil = el('a', { class: 'btn ajustes-perfil', href: '#/perfil', onclick: () => { ajustesCabecera.open = false; } });
const pintarEnlacePerfil = () => {
  poner(enlacePerfil, icono('perfil'), t('menu.perfil'));
  enlacePerfil.hidden = false;
};
document.addEventListener('click', e => {
  if (!ajustesCabecera.contains(e.target)) ajustesCabecera.open = false;
});
ajustesCabecera.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    cerrarIdiomas();
    ajustesCabecera.open = false;
    abrirAjustes.focus();
  }
});
ajustesCabecera.addEventListener('toggle', () => {
  if (!ajustesCabecera.open) cerrarIdiomas();
});

// Solo tres pestañas, para que quepan sin deslizar el dedo; el perfil está dentro de Ajustes.
const SECCIONES = [
  { ruta: 'lecciones', icono: 'libro' },
  { ruta: 'cuaderno', icono: 'cuaderno' },
  { ruta: 'repaso', icono: 'repaso' },
];

// El código de las pantallas que no son la portada, la lista ni la lección se pide al abrirlas (js/vistas/<nombre>.js):
// así la portada arranca sin descargar precios, perfil, frases…
const vista = (archivo, funcion) => import(`./vistas/${archivo}.js`).then(m => m[funcion]);

// Las pantallas generales (no de un curso): se pintan igual con curso elegido o sin él, no esperan a que lleguen
// las lecciones y no llevan menú de curso ni tutora. titulo: clave del texto de la pestaña (sin ella, solo «Paglot»).
// Para añadir una pantalla nueva basta con ponerla aquí.
const GENERALES = {
  inicio: { pintar: pintarInicio },
  entrar: { titulo: 'entrar.titulo', cargar: () => vista('entrar', 'pintarEntrar') },
  precios: { titulo: 'precios.titulo', cargar: () => vista('precios', 'pintarPrecios') },
  sobre: { titulo: 'sobre.titulo', cargar: () => vista('sobre', 'pintarSobre') },
  social: { titulo: 'pagina.social', cargar: () => vista('comunidad', 'pintarSocial') },
  contacto: { titulo: 'pagina.contacto', cargar: () => vista('comunidad', 'pintarContacto') },
  producto: { titulo: 'pagina.producto', cargar: () => vista('comunidad', 'pintarProducto') },
  escuelas: { titulo: 'pagina.escuelas', cargar: () => vista('productos', 'pintarEscuelas') },
  empresas: { titulo: 'pagina.empresas', cargar: () => vista('productos', 'pintarEmpresas') },
  'regala-max': { titulo: 'pagina.regalo', cargar: () => vista('productos', 'pintarRegalo') },
  tienda: { titulo: 'pagina.tienda', cargar: () => vista('comunidad', 'pintarTienda') },
  guias: { titulo: 'pagina.guias', cargar: () => vista('comunidad-extra', 'pintarGuias') },
  faq: { titulo: 'pagina.faq', cargar: () => vista('comunidad-extra', 'pintarFaq') },
  laboratorio: { titulo: 'pagina.laboratorio', cargar: () => vista('comunidad-extra', 'pintarLaboratorio') },
  idiomas: { titulo: 'cursos.titulo', pintar: pintarElegirCurso, sinPortada: true },
  creditos: { titulo: 'creditos.titulo', cargar: () => vista('creditos', 'pintarCreditos'), sinPortada: true },
  legal: { titulo: 'legal.titulo', pintar: pintarLegal, sinPortada: true },
  // los enlaces de los correos antiguos: la cuenta ya no va por enlace, sino por código (ver vistas/entrar.js)
  enlace: { titulo: 'entrar.titulo', cargar: () => vista('entrar', 'pintarEntrar') },
};
// Las portadas llevan la cabecera de la web (Inicio, Idiomas, Paglot Max) en lugar del menú del curso.
const PORTADAS = Object.keys(GENERALES).filter(ruta => !GENERALES[ruta].sinPortada);
const esGeneral = ruta => Object.hasOwn(GENERALES, ruta);
// En el móvil estas páginas no se desplazan: van por páginas del alto de la pantalla (js/paginas-movil.js).
const PAGINADAS = new Set(['inicio', 'sobre', 'social', 'contacto', 'producto', 'escuelas', 'empresas', 'regala-max', 'tienda', 'guias', 'faq',
  'laboratorio', 'legal', 'creditos', 'idiomas']);
// Las del curso que también van por páginas en el móvil (la lección en modo libro lo hace en vistas/leccion.js).
const PAGINADAS_CURSO = new Set(['perfil', 'cuaderno', 'frases']);

/** En el móvil, la pantalla del curso ya pintada se reparte en páginas (si le toca); se apaga con la vista. */
function paginarCursoEnMovil(seccion) {
  if (!esMovil()) return;
  if (!PAGINADAS_CURSO.has(seccion)) return;
  const deshacer = paginarEnMovil(app, { fijas: DIAPOSITIVAS[seccion] });
  const antes = limpiarVista;
  limpiarVista = () => { deshacer(); antes?.(); };
}

// El alto de una diapositiva del móvil (lo pone js/paginas-movil.js antes de pedir las diapositivas)
const altoDePagina = () => parseFloat(document.documentElement.style.getPropertyValue('--pm-alto')) || window.innerHeight;

/**
 * Reparte unas piezas en diapositivas según lo que miden de verdad, sin partir ninguna: cada diapositiva lleva las que
 * caben una tras otra. Un título (h2, h3) no se queda solo al final: pasa a la siguiente con lo suyo. Cada caja que
 * empieza en una diapositiva suma su marco (relleno y borde).
 */
function porAlto(piezas, { marco = 40, hueco = 12 } = {}) {
  const alto = altoDePagina() * 0.97;
  const paginas = [];
  let pagina = [];
  let usado = 0;
  let cajaActual = null;
  // una rejilla más alta que media diapositiva va por filas (las piezas que empiezan a la misma altura)
  const trozos = piezas.filter(Boolean).flatMap(p => (p.getBoundingClientRect().height > alto / 2 && p.children.length > 1 ? filas(p) : [p]));
  for (const trozo of trozos) {
    const fila = [].concat(trozo);
    const pieza = fila[0];
    const caja = pieza.closest('.caja') ?? pieza;
    const mide = Math.max(...fila.map(f => f.getBoundingClientRect().height)) + hueco + (caja !== cajaActual ? marco : 0);
    if (pagina.length && usado + mide > alto) {
      // el título suelto del final se va con lo que sigue
      const titulos = [];
      while (pagina.length && /^H[1-4]$/.test(pagina[pagina.length - 1].tagName)) titulos.unshift(pagina.pop());
      if (pagina.length) paginas.push(pagina);
      pagina = titulos;
      usado = titulos.reduce((n, t) => n + t.getBoundingClientRect().height + hueco, marco);
    }
    pagina.push(...fila);
    usado += mide;
    cajaActual = caja;
  }
  if (pagina.length) paginas.push(pagina);
  return paginas;
}
/** Los hijos de una rejilla o lista, agrupados por filas. */
function filas(contenedor) {
  const grupos = new Map();
  for (const hijo of contenedor.children) {
    const arriba = Math.round(hijo.getBoundingClientRect().top);
    if (!grupos.has(arriba)) grupos.set(arriba, []);
    grupos.get(arriba).push(hijo);
  }
  return [...grupos.values()];
}

// Las pantallas que en el móvil van en diapositivas grandes, una por escena, en vez de partirse solas
const DIAPOSITIVAS = {
  inicio: () => {
    const $ = sel => app.querySelector(sel);
    return [[$('.inicio-cabeza'), $('.inicio-trio'), $('.inicio-suelo')], $('.inicio-bajo'), $('.inicio-pasillo'), $('.inicio-teatro'), $('.inicio-pie-pag')];
  },
  // Sobre Paglot: un piso de la casa por diapositiva (el tejado con la buhardilla; la historia y el libro del método, en dos)
  // y la calle al final. En un móvil bajito, el texto y su escena van cada uno en la suya, y la historia, cuadro a cuadro.
  sobre: () => {
    const $ = sel => app.querySelector(sel);
    const hitos = [...app.querySelectorAll('.casa-hito')];
    const bajo = altoDePagina() < 600;
    const juntos = (texto, escena) => (bajo ? [texto, escena] : [[texto, escena].flat()]);
    return [[$('.casa-tejado'), $('.casa-buhardilla')], $('.casa-salon'),
      ...(bajo ? hitos : [hitos.slice(0, 2), hitos.slice(2)]),
      $('.casa-pasillo'),
      ...juntos($('.casa-pergamino'), $('.casa-mapa')),
      $('.casa-pagina-izq'), $('.casa-pagina-der'),
      ...juntos($('.casa-plano'), $('.casa-maquina')),
      ...juntos($('.casa-cartel'), $('.casa-mostrador-escena')),
      ...juntos($('.casa-buzon-escena'), [$('.casa-empezar'), $('.casa-acera'), $('.casa-gracias')])];
  },
  // Contacto: la carta va en tres (la ventana con el principio de la carta, los sellos del asunto, y el mensaje con el
  // matasellos y el botón); en un móvil bajito, en cinco.
  contacto: () => {
    const $ = sel => app.querySelector(sel);
    if (altoDePagina() >= 600) {
      return [[$('.ct-lado'), $('.ct-cabecera'), $('.ct-saludo'), $('.ct-lineas')], $('.ct-asuntos'),
        [$('.ct-linea-mensaje'), $('.ct-pie-carta'), $('.ct-envio')]];
    }
    return [$('.ct-lado'), [$('.ct-cabecera'), $('.ct-saludo'), $('.ct-lineas')], $('.ct-asuntos'), $('.ct-linea-mensaje'),
      [$('.ct-pie-carta'), $('.ct-envio')]];
  },
  // La tienda: la fachada (el letrero y la puerta con la tendera), el escaparate en dos (los libros; elegir idioma y
  // formato, que en un móvil bajito también va en dos), la entrada de la colección, los estantes de cuatro en cuatro (de dos en dos en un móvil bajito) y el
  // mostrador. Al filtrar o buscar se vuelve a repartir (paginas-movil.js).
  tienda: () => {
    const $ = sel => app.querySelector(sel);
    const productos = [...app.querySelectorAll('.tn-rejilla > li')];
    const bajo = altoDePagina() < 600;
    const estantes = [];
    for (let i = 0; i < productos.length; i += bajo ? 2 : 4) estantes.push(productos.slice(i, i + (bajo ? 2 : 4)));
    return [[$('.tn-letrero'), $('.tn-puerta')], [$('.tn-escaparate-titulo'), $('.tn-escaparate h2'), $('.tn-libros'), $('.tn-balda')],
      ...(bajo ? [[$('.tn-config-idioma'), $('.tn-formatos')], [$('.tn-libro-comprar'), $('.tn-libro-nota'), $('.tn-muestra')]]
        : [[$('.tn-libro-config'), $('.tn-muestra')]]),
      [$('.tn-interior-cabecera'), $('.tn-filtros'), $('.tn-herramientas')], ...estantes,
      ...(bajo ? [$('.tn-mostrador-encima'), $('.tn-preguntas')] : [$('.tn-mostrador')])];
  },
  // Empresas: la sala, las credenciales en dos, el configurador, los sectores en dos, la plantilla, el proceso en dos y el
  // final. En un móvil bajito, la sala va en dos (el ventanal con la mesa, luego la pizarra), una credencial por
  // diapositiva y el configurador en dos.
  empresas: () => {
    const $ = sel => app.querySelector(sel);
    const $$ = sel => [...app.querySelectorAll(sel)];
    const credenciales = $$('.of-credencial');
    const calculadora = $$('.of-calc > *');
    const resto = [[$('.of-entradilla'), $('.of-sectores-lista')], [$('.of-muestra'), $('.of-sectores-precio')], $('.of-plantilla'),
      $('.of-pasos'), $('.of-avisos'), $('.of-fin')];
    if (altoDePagina() >= 600) {
      return [$('.of-sala'), credenciales.slice(0, 2), [...credenciales.slice(2), $('.of-pronto')], $('.of-equipo'), ...resto];
    }
    return [[$('.of-ventanal'), $('.of-mesa-escena')], $('.of-pizarra'),
      credenciales[0], credenciales[1], credenciales[2], [credenciales[3], $('.of-pronto')],
      calculadora.slice(0, 5), [...calculadora.slice(5), $('.of-mesa-grande')], ...resto];
  },
  // El perfil: sus cajas por piezas (los hijos de cada caja), repartidas según lo que miden
  perfil: () => porAlto([...app.children].flatMap(c => (c.classList.contains('caja') ? [...c.children] : [c]))),
  // Escuelas: el colegio, el tablón y el temario en dos, la calculadora y su clase, la circular y el final. Los títulos
  // de sección no se reparten: salen en todas las de su sección. En un móvil bajito, la pizarra de la entrada aparte, una
  // nota del tablón por diapositiva y la calculadora, el precio y la circular en dos.
  escuelas: () => {
    const $ = sel => app.querySelector(sel);
    const $$ = sel => [...app.querySelectorAll(sel)];
    const notas = $$('.ce-nota');
    const panel = $$('.ce-calc-panel > *');
    const puntos = $$('.ce-circular li');
    if (altoDePagina() >= 600) {
      return [$('.ce-colegio'), notas.slice(0, 2), [...notas.slice(2), $('.ce-pronto')], $('.ce-calc-panel'), $('.ce-clase'),
        $('.ce-ideas'), [$('.ce-medida-precio'), $('.ce-horario'), $('.ce-horario-nota')], $('.ce-circular-seccion'), $('.ce-fin')];
    }
    return [[$('.ce-edificio'), $('.ce-maestra'), $('.ce-alumnas')], $('.ce-pizarra'),
      notas[0], notas[1], notas[2], [notas[3], $('.ce-pronto')],
      panel.slice(0, 5), panel.slice(5), $('.ce-clase'),
      $('.ce-ideas'), $('.ce-medida-precio'), [$('.ce-horario'), $('.ce-horario-nota')],
      [$('.ce-circular h2'), $('.ce-circular-lema'), ...puntos.slice(0, 2)], [...puntos.slice(2), $('.ce-firma')], $('.ce-fin')];
  },
};

/** En el móvil no hay pie debajo de todo: el pie de verdad (con sus tutoras charlando) es la última diapositiva de la
 *  portada. Devuelve la función que lo vuelve a poner en su sitio. */
function pieEnLaPortada() {
  const pie = document.getElementById('pie-sitio');
  const portada = app.querySelector('.inicio');
  if (!pie || !portada) return () => {};
  const padre = pie.parentNode;
  const siguiente = pie.nextSibling;
  const envoltorio = el('div', { class: 'inicio-pie-pag' }, pie);
  portada.append(envoltorio);
  return () => { padre.insertBefore(pie, siguiente); envoltorio.remove(); };
}

/** Pinta una pantalla general y guarda la función que la apaga, si la tiene. sigue(): si sigue tocando esta pantalla
 *  cuando llega su código (si entretanto se ha ido a otra, no se pinta). */
async function pintarGeneral(ruta, sigue = () => true) {
  const pantalla = GENERALES[ruta];
  const pintar = pantalla.pintar ?? await pantalla.cargar();
  if (!sigue()) return;
  if (pantalla.titulo) titulo(t(pantalla.titulo));
  else document.title = t('app.nombre');
  const apagar = pintar(app);
  const devolverPie = ruta === 'inicio' && esMovil() ? pieEnLaPortada() : null;
  const deshacer = PAGINADAS.has(ruta) && esMovil() ? paginarEnMovil(app, { fijas: DIAPOSITIVAS[ruta] }) : null;
  limpiarVista = deshacer || devolverPie || typeof apagar === 'function'
    ? () => { deshacer?.(); devolverPie?.(); if (typeof apagar === 'function') apagar(); }
    : null;
}

const contenido = { resultados: [], capitulos: [], errorCapitulos: null };
let limpiarVista = null;
let rutaActual = 'lecciones';

// ---------------------------------------------------------------------------
// Menú, idioma y tema
// ---------------------------------------------------------------------------

function pintarMenu() {
  poner(menu, el('ul', {}, SECCIONES.map(s => el('li', {},
    el('a', { href: `#/${s.ruta}`, 'data-ruta': s.ruta, class: 'menu-enlace' }, icono(s.icono), el('span', {}, t(`menu.${s.ruta}`)))))));
  marcarMenu(rutaActual);
  pintarAvisoRepaso();
}

/** Numerito rojo en «Repaso»: tarjetas que tocan hoy (pendientes + nuevas, como en la pantalla de repaso). */
function pintarAvisoRepaso() {
  const enlace = menu.querySelector('a[data-ruta="repaso"]');
  if (!enlace) return;
  const n = pendientesDeHoy();
  enlace.querySelector('.menu-aviso')?.remove();
  enlace.setAttribute('aria-label', n ? t('menu.repasoPendientes', { n }) : t('menu.repaso'));
  if (n) enlace.append(el('span', { class: 'menu-aviso', 'aria-hidden': 'true' }, n > 99 ? '99+' : String(n)));
}

function marcarMenu(ruta) {
  for (const a of menu.querySelectorAll('a')) {
    if (a.dataset.ruta === ruta) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  // En el móvil las pestañas se deslizan de lado: la de la pantalla actual se pone a la vista (sin mover la página).
  const lista = menu.querySelector('ul');
  const activa = menu.querySelector('a[aria-current="page"]');
  if (lista && activa && lista.scrollWidth > lista.clientWidth) {
    const desde = activa.getBoundingClientRect().left - lista.getBoundingClientRect().left;
    lista.scrollLeft += desde - (lista.clientWidth - activa.offsetWidth) / 2;
  }
}

function pintarBotonTema() {
  const boton = document.getElementById('btn-tema');
  const oscuro = temaActual() === 'oscuro';
  boton.textContent = oscuro ? '☀' : '☾';
  boton.setAttribute('aria-label', t(oscuro ? 'tema.aDiurno' : 'tema.aOscuro'));
  boton.title = boton.getAttribute('aria-label');
}

function pintarBotonSonido() {
  const boton = document.getElementById('btn-sonido');
  const on = Boolean(ajuste('efectos'));
  boton.setAttribute('aria-pressed', String(on));
  boton.setAttribute('aria-label', t(on ? 'sonido.silenciar' : 'sonido.activar'));
  boton.title = boton.getAttribute('aria-label');
}

// La marca siempre es Paglot; dentro de un curso el idioma aparece debajo.
// Siempre lleva al inicio.
function pintarMarca() {
  const dentro = !document.body.classList.contains('en-inicio');
  document.body.classList.toggle('en-estudio', dentro);
  // El pie solo va en las pantallas de la web: portadas, créditos, aviso legal y la página perdida.
  // Dentro de un curso (lecciones, cuaderno, repaso…) y al elegir idioma no se pinta.
  const ruta = location.hash.startsWith('#/') ? location.hash.slice(2).split('/')[0] : '';
  const perdidaSinCurso = !hayCurso && ruta && !esGeneral(ruta);
  // en el móvil el pie no va debajo de nada (no se desplaza ninguna pantalla): sus enlaces están en la portada
  document.body.classList.toggle('con-pie', !esMovil() && (!dentro || ruta === 'creditos' || ruta === 'legal' || Boolean(perdidaSinCurso)));
  ajustesCabecera.open = false;
  abrirAjustes.textContent = `⚙ ${t('ajustes.titulo')}`;
  if (dentro) {
    controlesCabecera.append(ajustesCabecera);
    panelAjustes.append(...controlesAjustes, enlacePerfil);
    pintarEnlacePerfil();
    pintarNavegacion();
  } else {
    controlesCabecera.append(...controlesAjustes);
    ajustesCabecera.remove();
  }
  const deCurso = hayCurso && !document.body.classList.contains('en-inicio');
  const nombre = document.getElementById('marca-nombre');
  // «Pa» + «glot» en dorado, como en el logotipo grande
  const marca = t('app.nombre');
  if (marca === 'Paglot') poner(nombre, 'Pa', el('span', { class: 'marca-glot' }, 'glot'));
  else nombre.textContent = marca;
  nombre.removeAttribute('lang');
  document.getElementById('marca-bandera').innerHTML = deCurso ? curso.bandera : ''; // SVG del catálogo local de cursos.
  const subtitulo = document.getElementById('marca-subtitulo');
  subtitulo.textContent = deCurso ? nombreDelCurso(idioma()) + (esBeta(curso) ? ` · ${t('beta.etiqueta')}` : '') : '';
  subtitulo.parentElement.hidden = !deCurso;
  document.getElementById('marca').title = t('inicio.titulo');
  pintarNavegacion();
  pintarCabecera();
  pintarPie();
  const boton = document.getElementById('btn-curso');
  boton.setAttribute('aria-label', t('cursos.cambiar'));
  boton.title = t('cursos.cambiar');
  boton.hidden = !hayCurso;
}

// «glot» destella cada 6 s: claro del 90 % al 93 % del ciclo y del 96 % al final (el CSS solo lo enseña en las portadas).
// Con un reloj en vez de una animación de CSS el navegador solo trabaja en esos cuatro cambios.
{
  const brillar = si => document.querySelector('.marca-glot')?.classList.toggle('brilla', si);
  const ciclo = () => {
    setTimeout(() => brillar(true), 5400);
    setTimeout(() => brillar(false), 5580);
    setTimeout(() => brillar(true), 5760);
    setTimeout(() => { brillar(false); ciclo(); }, 6000);
  };
  ciclo();
}

/** La navegación de la web: Inicio, Idiomas y Paglot Max (la cuenta va aparte, en js/cabecera.js). */
function pintarNavegacion() {
  const aqui = location.hash.slice(2).split('/')[0] || (hayCurso ? 'lecciones' : 'inicio');
  const etiquetas = [t('inicio.titulo'), t('cabecera.idiomas'), 'Paglot Max'];
  const rutas = ['inicio', 'idiomas', 'precios'];
  for (const [i, a] of [...document.querySelectorAll('#cabecera-nav a')].entries()) {
    a.href = `#/${rutas[i]}`;
    a.dataset.nav = rutas[i];
    poner(a, etiquetas[i]);
    if (a.dataset.nav === aqui) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

// Selector de idioma de la cabecera (lo que no esté traducido sale en inglés).
// Es un botón que despliega una lista propia (la del navegador no se puede vestir como el resto de la app).
const selectorIdioma = document.getElementById('sel-idioma');
const listaIdiomas = document.getElementById('lista-idiomas');

function pintarSelectorIdioma() {
  const actual = IDIOMAS.find(i => i.clave === idioma());
  const automatico = ajuste('idioma') === 'auto';
  poner(selectorIdioma,
    el('span', { lang: actual.clave, class: 'sel-idioma-nombre' }, actual.nombre),
    el('span', { class: 'sel-idioma-corto', 'aria-hidden': 'true' }, actual.corto), // en pantallas medianas
    automatico ? el('span', { class: 'sel-idioma-auto', title: t('ajustes.automatico') }, 'AUTO') : null,
    el('span', { class: 'sel-idioma-flecha', 'aria-hidden': 'true' }, '▾'));
  selectorIdioma.title = automatico ? `${t('ajustes.automatico')} · ${actual.nombre}` : actual.nombre;
  poner(listaIdiomas,
    el('button', {
      type: 'button', class: 'idioma-opcion idioma-automatico', role: 'menuitemradio',
      'aria-checked': String(automatico), 'aria-label': `${t('ajustes.automatico')} · ${actual.nombre}`,
      onclick: () => { sonar('clic'); cerrarIdiomas(); cambiarIdioma('auto'); },
    },
    el('span', { class: 'idioma-marca', 'aria-hidden': 'true' }, automatico ? '✓' : '↻'),
    el('span', { class: 'idioma-opcion-nombre' }, t('ajustes.automatico')),
    el('span', { class: 'idioma-opcion-detalle', lang: actual.clave }, actual.nombre)),
    IDIOMAS_VISIBLES.map(i => {
      const seleccionado = !automatico && i.clave === actual.clave;
      return el('button', {
        type: 'button', class: 'idioma-opcion', role: 'menuitemradio', lang: i.clave,
        'aria-checked': String(seleccionado),
        onclick: () => { sonar('clic'); cerrarIdiomas(); cambiarIdioma(i.clave); },
      }, el('span', { class: 'idioma-marca', 'aria-hidden': 'true' }, seleccionado ? '✓' : i.corto),
      el('span', { class: 'idioma-opcion-nombre' }, i.nombre));
    }));
}

function abrirIdiomas() {
  listaIdiomas.hidden = false;
  selectorIdioma.setAttribute('aria-expanded', 'true');
  (listaIdiomas.querySelector('[aria-checked="true"]') ?? listaIdiomas.firstElementChild)?.focus();
}

function cerrarIdiomas({ foco = false } = {}) {
  if (listaIdiomas.hidden) return;
  listaIdiomas.hidden = true;
  selectorIdioma.setAttribute('aria-expanded', 'false');
  if (foco) selectorIdioma.focus();
}

pintarSelectorIdioma();
selectorIdioma.addEventListener('click', () => {
  sonar(listaIdiomas.hidden ? 'abrir' : 'cerrar');
  if (listaIdiomas.hidden) abrirIdiomas();
  else cerrarIdiomas();
});
// Se cierra al tocar fuera o con Escape; las flechas respetan las dos columnas.
document.addEventListener('click', e => { if (!e.target.closest('.idioma-menu')) cerrarIdiomas(); });
listaIdiomas.addEventListener('keydown', e => {
  const opciones = [...listaIdiomas.children];
  const i = opciones.indexOf(document.activeElement);
  if (e.key === 'Escape') cerrarIdiomas({ foco: true });
  else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') opciones[Math.min(opciones.length - 1, i + (e.key === 'ArrowDown' ? 2 : 1))].focus();
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') opciones[Math.max(0, i - (e.key === 'ArrowUp' ? 2 : 1))].focus();
  else if (e.key === 'Tab') cerrarIdiomas();
  else return;
  if (e.key !== 'Tab') e.preventDefault();
});

document.getElementById('btn-tema').addEventListener('click', () => {
  cambiarAjuste('tema', temaActual() === 'oscuro' ? 'claro' : 'oscuro');
  sonar('interruptor');
});
document.getElementById('btn-sonido').addEventListener('click', () => {
  const on = !ajuste('efectos');
  cambiarAjuste('efectos', on);
  if (on) sonar('interruptor');
});
window.addEventListener('tema-cambiado', pintarBotonTema);
window.addEventListener('efectos-cambiado', pintarBotonSonido);

// Al cambiar de idioma se repinta todo: cabecera, menú y la pantalla abierta.
window.addEventListener('idioma-cambiado', () => {
  // Los cursos de otros idiomas se quedan con el español o el inglés de sus lecciones al cargarlas: se recargan.
  if (hayCurso && curso.id !== 'es') { location.reload(); return; }
  pintarSelectorIdioma();
  pintarAvisoDeDatos();
  pintarMarca();
  pintarBotonTema();
  pintarBotonSonido();
  if (!hayCurso) { pintarSinCurso({ cambioDeIdioma: true }); return; }
  pintarMenu();
  navegar({ cambioDeIdioma: true });
});

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

alCambiar(pintarAvisoRepaso);
setInterval(pintarAvisoRepaso, 60 * 1000); // las tarjetas también vencen con el paso del tiempo
// Si el navegador no deja guardar el progreso (sin sitio, modo privado…), la tutora lo dice una vez (ver progress.js).
window.addEventListener('guardado-fallido', () => decir(t('app.guardadoFallido'), 'apurada'));

/** Una dirección que no existe o una lección que no se abre: la página perdida, con su propia tutora. */
function pintarNoEncontrada(texto) {
  titulo(t('perdida.titulo'));
  document.body.classList.add('sin-tutora', 'en-inicio'); // como una pantalla general: sin el menú del curso
  pintarMarca();
  limpiarVista = pintarPerdida(app, texto);
}

function titulo(texto) {
  document.title = [texto, hayCurso && curso.nativo, t('app.nombre')].filter(Boolean).join(' · ');
}

// Las lecciones del curso se cargan aparte, una sola vez: las pantallas generales (inicio, entrar, sobre…)
// no las necesitan y se pintan al momento, sin esperar.
let cargaDelCurso = null;
let cursoCargado = false;
function cargarCurso() {
  cargaDelCurso ??= (async () => {
    // La voz del dispositivo se prepara a la vez (tarda hasta segundo y medio); solo la esperan las pantallas
    // cuyos ejercicios dependen de ella (ver navegar). Si aparece más tarde, «voz-cambiada» repinta la pantalla.
    // Con índice (indice/lecciones.json) basta un archivo para la lista; cada lección se carga al abrirla.
    // Sin índice (un curso al que aún no se le ha generado) se descargan todas, como antes.
    contenido.voces = prepararVoces();
    const [indice, { capitulos, error }] = await Promise.all([cargarIndice(), cargarCapitulos()]);
    const resultados = indice ?? await descubrirLecciones();
    Object.assign(contenido, { resultados, capitulos, errorCapitulos: error ?? null, sinConexion: Boolean(resultados.sinConexion) });
    cursoCargado = true;
    comprobarLogros();
  })();
  return cargaDelCurso;
}

// El diccionario del curso (indice/diccionario.json) pesa mucho (2,6 MB el de español): solo lo piden la lección,
// el cuaderno y la bienvenida, o se trae cuando el navegador está libre dentro del curso. Nunca desde la portada.
let cargaDelDiccionario = null;
function cargarElDiccionario() {
  cargaDelDiccionario ??= cargarDiccionario().then(async mapa => {
    if (mapa) { ponerDiccionario(mapa); return; }
    await cargarCurso(); // sin diccionario, se monta con las palabras de las lecciones
    ponerDiccionarioGlobal(contenido.resultados);
  });
  return cargaDelDiccionario;
}
const cuandoEsteLibre = fn => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 2000));

// Lecciones completas ya cargadas, por idioma de la interfaz (los textos de las v2 dependen de él).
const completas = new Map();

/**
 * La lección entera (bloques y palabras) de un resultado de la lista. Con índice, la lista solo trae
 * el resumen y la lección se pide aquí; se le pone el número que enseña la lista, que puede venir reordenado.
 */
function leccionCompleta(resultado) {
  if (resultado.error || resultado.leccion?.bloques) return Promise.resolve(resultado);
  const clave = `${idioma()}|${resultado.id}`;
  if (!completas.has(clave)) {
    completas.set(clave, cargarLeccion(resultado.id).then(r => {
      if (r.leccion) r.leccion.numero_curso = resultado.leccion.numero_curso;
      else completas.delete(clave); // sin conexión, por ejemplo: la próxima vez se vuelve a intentar
      return r;
    }));
  }
  return completas.get(clave);
}

/** Las pantallas que no dependen ni de la voz ni del progreso: repintarlas a media visita las reiniciaría (la bienvenida, los precios…). */
function enPantallaGeneral() {
  const ruta = location.hash.slice(2).split('/')[0];
  return esGeneral(ruta) || ruta === 'bienvenida';
}

let pase = 0; // para descartar una navegación si, mientras esperaba, se ha pedido otra
let bienvenidaOfrecida = false; // la bienvenida se ofrece sola una vez por sesión (y nunca más cuando se ha visto)

async function navegar({ cambioDeIdioma = false } = {}) {
  const estePase = ++pase;
  cerrarFicha();
  limpiarVista?.();
  limpiarVista = null;

  // Solo cuentan las rutas del tipo «#/algo»; cualquier otra cosa lleva a Lecciones.
  const hash = location.hash.startsWith('#/') ? location.hash.slice(2) : '';
  const [ruta, parametro] = hash.split('/');
  let seccion = ruta || 'lecciones';
  // #/desarrollador: acceso para revisar la app (todas las lecciones y sus pasos cuentan como hechos, ver desarrollador.js).
  if (seccion === 'desarrollador') {
    activarDesarrollador();
    history.replaceState(null, '', '#/lecciones');
    seccion = 'lecciones';
  }
  // La primera vez que alguien sin progreso llega a sus lecciones, antes pasa por la bienvenida.
  if (seccion === 'lecciones' && !bienvenidaOfrecida && !bienvenidaVista() && !hayProgreso()) {
    history.replaceState(null, '', '#/bienvenida');
    seccion = 'bienvenida';
  }
  if (seccion === 'bienvenida') bienvenidaOfrecida = true;
  document.body.classList.toggle('en-bienvenida', seccion === 'bienvenida');
  document.body.classList.toggle('en-leccion', seccion === 'leccion'); // en el móvil, la lección usa toda la pantalla
  rutaActual = seccion === 'leccion' ? 'lecciones' : seccion;
  document.body.classList.toggle('en-inicio', PORTADAS.includes(seccion));
  document.body.classList.toggle('sin-tutora', esGeneral(seccion) || seccion === 'bienvenida');
  pintarMarca();
  marcarMenu(rutaActual);
  pintarAvisoRepaso();

  // Las pantallas del curso necesitan sus lecciones: si aún están llegando, se espera con el logotipo.
  if (!cursoCargado && !esGeneral(seccion)) {
    poner(app, el('div', { class: 'arranque' }, el('img', { class: 'arranque-logo', src: 'assets/logo.svg', alt: t('html.cargando'), width: 128, height: 128 })));
    await cargarCurso();
    if (estePase !== pase) return;
  }

  // Lo que se practica depende de si hay voz: esas pantallas esperan a saberlo (Cuaderno, Repaso o Perfil, no).
  if (['lecciones', 'leccion', 'practica'].includes(seccion)) {
    await contenido.voces;
    if (estePase !== pase) return;
  }

  // La lección, el cuaderno (su buscador) y la bienvenida usan el diccionario del curso.
  if (['leccion', 'cuaderno', 'bienvenida'].includes(seccion)) {
    await cargarElDiccionario();
    if (estePase !== pase) return;
  } else if (!esGeneral(seccion)) {
    cuandoEsteLibre(cargarElDiccionario);
  }

  if (seccion === 'leccion') {
    const i = contenido.resultados.findIndex(r => r.id === parametro);
    const resultado = contenido.resultados[i] && await leccionCompleta(contenido.resultados[i]);
    if (estePase !== pase) return;
    if (!resultado || resultado.error) {
      pintarNoEncontrada(t('app.leccionNoAbre', { id: parametro }));
    } else {
      // la siguiente en el orden del curso (por capítulos), no en el de los archivos
      const enOrden = agrupar(contenido.resultados, contenido.capitulos).flatMap(g => g.lecciones).filter(r => !r.error);
      const k = enOrden.findIndex(r => r.id === parametro);
      const siguiente = (k >= 0 ? enOrden[k + 1]?.id : contenido.resultados.slice(i + 1).find(r => !r.error)?.id) ?? null;
      titulo(resultado.leccion.titulo_es || tr(resultado.leccion.titulo));
      limpiarVista = pintarLeccion(app, resultado, siguiente);
    }
  } else if (seccion === 'lecciones') {
    titulo(t('menu.lecciones'));
    if (contenido.sinConexion && !contenido.resultados.length) avisoSinConexion();
    else limpiarVista = pintarLecciones(app, contenido);
    avisoBeta();
  } else if (seccion === 'prueba') {
    titulo(t('prueba.titulo'));
    const pintarPrueba = await vista('prueba', 'pintarPrueba');
    if (estePase !== pase) return;
    limpiarVista = pintarPrueba(app, { ...contenido, leccionCompleta });
  } else if (seccion === 'practica') {
    titulo(t('menu.practica'));
    const pintarPractica = await vista('practica', 'pintarPractica');
    if (estePase !== pase) return;
    pintarPractica(app, { ...contenido, leccionCompleta });
  } else if (seccion === 'frases') {
    titulo(t('menu.frases'));
    contenido.frases ??= await cargarFrases();
    if (estePase !== pase) return;
    const pintarFrases = await vista('frases', 'pintarFrases');
    if (estePase !== pase) return;
    pintarFrases(app, contenido.frases);
  } else if (seccion === 'cuaderno') {
    titulo(t('menu.cuaderno'));
    const pintarCuaderno = await vista('cuaderno', 'pintarCuaderno');
    if (estePase !== pase) return;
    pintarCuaderno(app);
  } else if (seccion === 'repaso') {
    titulo(t('menu.repaso'));
    const pintarRepaso = await vista('repaso', 'pintarRepaso');
    if (estePase !== pase) return;
    limpiarVista = pintarRepaso(app);
  } else if (seccion === 'reto') {
    titulo(t('reto.titulo'));
    limpiarVista = pintarReto(app);
  } else if (seccion === 'perfil') {
    titulo(t('menu.perfil'));
    const pintarPerfil = await vista('perfil', 'pintarPerfil');
    if (estePase !== pase) return;
    pintarPerfil(app, contenido);
  } else if (esGeneral(seccion)) {
    await pintarGeneral(seccion, () => estePase === pase);
  } else if (seccion === 'bienvenida') {
    // La bienvenida busca su frase de ejemplo en las primeras lecciones: solo esas se cargan enteras.
    const primeras = await Promise.all(contenido.resultados.filter(r => !r.error).slice(0, 8).map(leccionCompleta));
    if (estePase !== pase) return;
    titulo(t('bienvenida.titulo'));
    limpiarVista = pintarBienvenida(app, { ...contenido, resultados: primeras });
  } else {
    pintarNoEncontrada('');
  }

  if (estePase === pase && !esGeneral(seccion)) paginarCursoEnMovil(seccion);

  // Al cambiar de idioma no se mueve la página ni el foco: solo cambian los textos.
  if (!cambioDeIdioma) {
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
    // la pantalla nueva entra con un pequeño deslizamiento (ver #app.vista-entra en styles.css)
    app.classList.remove('vista-entra');
    void app.offsetWidth;
    app.classList.add('vista-entra');
  }
}

/**
 * Los cursos que aún no ha revisado nadie llevan un aviso la primera vez que se entra en sus lecciones: se hicieron
 * deprisa, las explicaciones solo están en inglés y se irán traduciendo y mejorando según crezca la app.
 */
function avisoBeta() {
  const visto = `idiomas-beta-${curso.id}`;
  try { if (!esBeta(curso) || localStorage.getItem(visto)) return; } catch { return; }
  const cerrar = () => {
    try { localStorage.setItem(visto, '1'); } catch { /* sin almacenamiento */ }
    sonar('clic');
    capa.remove();
  };
  const vale = el('button', { type: 'button', class: 'es-boton', onclick: cerrar }, t('beta.vale'));
  const capa = el('div', { class: 'aviso-beta', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'aviso-beta-titulo' },
    el('div', { class: 'aviso-beta-caja es-papel' },
      el('span', { class: 'aviso-beta-etiqueta' }, t('beta.etiqueta')),
      el('h2', { id: 'aviso-beta-titulo' }, t('beta.titulo')),
      el('p', {}, t('beta.texto', { curso: nombreDelCurso(idioma()) })),
      vale));
  document.body.append(capa);
  vale.focus();
  decir(t('beta.titulo'), 'pensando');
}

function avisoSinConexion() {
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, t('app.sinConexionTitulo')),
    el('p', {}, t('app.sinConexionTexto')),
    el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, t('app.reintentar'))));
  decir(t('app.sinConexionTutora'), 'confundida');
}

function avisoArchivoLocal() {
  poner(app, el('section', { class: 'caja tarjeta-error' },
    el('h1', {}, t('app.archivoLocalTitulo')),
    el('p', {}, t('app.archivoLocalTexto')),
    el('p', {}, t('app.archivoLocalWindows'), ' ', el('code', {}, 'start-server.cmd'))));
  decir(t('app.archivoLocalTutora'), 'apurada');
}

/**
 * Cada vez que se abre la app se empieza por la pantalla de inicio, con el botón para seguir con el curso de la última vez.
 * Solo al abrirla: no al recargar, ni al elegir curso, ni si se entra por un enlace a una pantalla concreta.
 */
function empezarPorInicio() {
  try {
    if (sessionStorage.getItem('idiomas-abierta')) return;
    sessionStorage.setItem('idiomas-abierta', '1');
  } catch {
    return; // sin almacenamiento no se sabe si es la primera pantalla: se va a las lecciones
  }
  if (location.hash === '' || location.hash === '#/') history.replaceState(null, '', '#/inicio');
}

/** Quita la pantalla de arranque (el logotipo que se ve mientras carga la app). */
function quitarArranque() {
  document.body.classList.remove('arrancando');
  pintarAvisoDeDatos();
}

let pasesSinCurso = 0;
/** Sin curso elegido: solo las pantallas de la web (la portada, elegir idioma, precios…); lo demás es la página perdida. */
function pintarSinCurso({ cambioDeIdioma = false } = {}) {
  limpiarVista?.();
  limpiarVista = null;
  const ruta = location.hash.startsWith('#/') ? location.hash.slice(2).split('/')[0] : '';
  // Lo que no es una ruta («#/algo») no es una página perdida: son, por ejemplo, los datos que traen los enlaces de los correos.
  const pantalla = esGeneral(ruta) ? ruta : ruta ? 'perdida' : 'inicio';
  document.body.classList.toggle('en-inicio', PORTADAS.includes(pantalla));
  pintarMarca();
  const este = ++pasesSinCurso;
  if (pantalla === 'perdida') {
    titulo(t('perdida.titulo'));
    limpiarVista = pintarPerdida(app);
  } else {
    pintarGeneral(pantalla, () => este === pasesSinCurso);
  }
  if (!cambioDeIdioma) window.scrollTo(0, 0);
}

async function iniciar() {
  aplicarIdioma();
  iniciarPie();
  aplicarTema();
  aplicarComodidad();
  pintarMarca();
  pintarBotonTema();
  pintarBotonSonido();

  if (!hayCurso) {
    try { sessionStorage.setItem('idiomas-abierta', '1'); } catch { /* sin almacenamiento */ }
    document.body.classList.add('sin-curso', 'sin-tutora');
    window.addEventListener('hashchange', () => pintarSinCurso());
    window.matchMedia('(max-width: 700px)').addEventListener('change', () => pintarSinCurso());
    pintarSinCurso();
    quitarArranque();
    iniciarNube();
    return;
  }

  empezarPorInicio();
  pintarMenu();
  // los logros miran las lecciones del curso (con el nivel de su capítulo) cuando ya han llegado
  iniciarLogros(() => {
    const niveles = new Map((contenido.capitulos ?? []).map(c => [String(c.numero), c.nivel]));
    return contenido.resultados.filter(r => r.leccion).map(r => ({ id: r.leccion.id, nivel: niveles.get(String(r.leccion.capitulo)) }));
  });

  if (location.protocol === 'file:') {
    avisoArchivoLocal();
    quitarArranque();
    return;
  }

  window.addEventListener('hashchange', () => navegar());
  // Las diapositivas del móvil se deciden al pintar: al cruzar ese ancho (girar una tableta, el modo móvil de F12)
  // se vuelve a pintar la pantalla. Una lección a medias no se corta.
  window.matchMedia('(max-width: 700px)').addEventListener('change', () => {
    if (!document.body.classList.contains('en-leccion')) navegar();
  });
  // Si la voz aparece o desaparece (se instala una, se va la conexión), se repinta la pantalla en el mismo sitio:
  // cambian los ejercicios de oído. En un repaso o en un juego no se interrumpe.
  window.addEventListener('voz-cambiada', () => {
    if (location.hash.startsWith('#/repaso') || document.querySelector('.juego') || enPantallaGeneral()) return;
    const y = window.scrollY;
    navegar().then(() => window.scrollTo(0, y));
  });
  // Un clic en cualquier enlace del menú hace un pequeño sonido.
  menu.addEventListener('click', e => { if (e.target.closest('a')) sonar('pagina'); });

  // La primera pantalla se pinta ya; las lecciones del curso se van cargando mientras tanto.
  // En una pantalla general (la portada…) se espera a que el navegador esté libre: el diccionario pesa unos 750 KB
  // y leerlo a la vez que arrancan las animaciones de la portada las hacía ir a trompicones.
  const primera = navegar();
  if (document.body.classList.contains('en-inicio')) quitarArranque();
  if (enPantallaGeneral() && location.hash !== '#/bienvenida') {
    if ('requestIdleCallback' in window) requestIdleCallback(() => cargarCurso(), { timeout: 3000 });
    else setTimeout(cargarCurso, 1500);
  } else {
    cargarCurso();
  }
  await primera;
  quitarArranque();
  // el progreso en la nube (Supabase): se junta con el del dispositivo y se sube al cambiar
  iniciarNube();
  // si de la nube llega progreso nuevo, se repinta la pantalla (salvo en mitad de una lección, un repaso o un reto)
  window.addEventListener('datos-sincronizados', () => {
    if (!/^#\/(leccion|repaso|reto)/.test(location.hash)) navegar({ cambioDeIdioma: true });
    pintarAvisoRepaso();
  });
}

iniciar();
