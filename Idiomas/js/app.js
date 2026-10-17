// Arranque y navegación.
// Rutas: #/inicio · #/lecciones · #/leccion/001 · #/practica · #/frases · #/cuaderno · #/repaso · #/perfil · #/idiomas · #/creditos · #/legal · #/sobre · #/entrar · #/precios · #/bienvenida
// Sin curso elegido solo existen la pantalla de inicio, la de elegir idioma, los créditos, el aviso legal y «Sobre Paglot».

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { descubrirLecciones, cargarIndice, cargarDiccionario, cargarLeccion, cargarCapitulos, cargarFrases } from './lessons.js';
import { ajuste, aplicarTema, temaActual, cambiarAjuste } from './ajustes.js';
import { t, tr, aplicarIdioma, IDIOMAS, idioma, cambiarIdioma } from './i18n.js';
import { sonar, prepararVoces } from './sonidos.js';
import { iniciarNube, usuarioActual, alCambiarNube } from './sync.js';
import { alCambiar, hayProgreso } from './progress.js';
import { pintarCabecera, pendientesDeHoy } from './cabecera.js';
import { iniciarPie, pintarPie } from './pie.js';
import { decir } from './tutor.js';
import { agrupar, pintarLecciones } from './vistas/lecciones.js';
import { pintarLeccion, cerrarFicha, ponerDiccionarioGlobal, ponerDiccionario } from './vistas/leccion.js';
import { pintarFrases } from './vistas/frases.js';
import { pintarCuaderno } from './vistas/cuaderno.js';
import { pintarRepaso } from './vistas/repaso.js';
import { pintarPerfil } from './vistas/perfil.js';
import { pintarPractica } from './vistas/practica.js';
import { pintarElegirCurso, pintarCreditos } from './vistas/cursos.js';
import { pintarInicio } from './vistas/inicio.js';
import { pintarLegal, pintarAvisoDeDatos } from './vistas/legal.js';
import { pintarSobre } from './vistas/sobre.js';
import { pintarEntrar } from './vistas/entrar.js';
import { pintarEnlace } from './vistas/enlace.js';
import { pintarPrecios } from './vistas/precios.js';
import { pintarBienvenida, bienvenidaVista } from './vistas/bienvenida.js';
import { pintarPerdida } from './vistas/perdida.js';
import { pintarSocial, pintarContacto, pintarProducto, pintarTienda } from './vistas/comunidad.js';
import { pintarEscuelas, pintarEmpresas, pintarRegalo } from './vistas/productos.js';
import { pintarGuias, pintarFaq, pintarLaboratorio } from './vistas/comunidad-extra.js';
import { curso, hayCurso, nombreDelCurso } from './curso.js';
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
  enlacePerfil.hidden = !hayCurso || Boolean(usuarioActual());
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

// Solo tres pestañas, para que quepan sin deslizar el dedo. Práctica y Frases siguen existiendo (#/practica, #/frases)
// hasta que su contenido pase al cuaderno; el perfil está en el menú del avatar (o en Ajustes, sin sesión).
const SECCIONES = [
  { ruta: 'lecciones', icono: 'libro' },
  { ruta: 'cuaderno', icono: 'cuaderno' },
  { ruta: 'repaso', icono: 'repaso' },
];

// Las pantallas generales (no de un curso): se pintan igual con curso elegido o sin él, no esperan a que lleguen
// las lecciones y no llevan menú de curso ni tutora. titulo: clave del texto de la pestaña (sin ella, solo «Paglot»).
// Para añadir una pantalla nueva basta con ponerla aquí.
const GENERALES = {
  inicio: { pintar: pintarInicio },
  entrar: { titulo: 'entrar.titulo', pintar: pintarEntrar },
  precios: { titulo: 'precios.titulo', pintar: pintarPrecios },
  sobre: { titulo: 'sobre.titulo', pintar: pintarSobre },
  social: { titulo: 'pagina.social', pintar: pintarSocial },
  contacto: { titulo: 'pagina.contacto', pintar: pintarContacto },
  producto: { titulo: 'pagina.producto', pintar: pintarProducto },
  escuelas: { titulo: 'pagina.escuelas', pintar: pintarEscuelas },
  empresas: { titulo: 'pagina.empresas', pintar: pintarEmpresas },
  'regala-max': { titulo: 'pagina.regalo', pintar: pintarRegalo },
  tienda: { titulo: 'pagina.tienda', pintar: pintarTienda },
  guias: { titulo: 'pagina.guias', pintar: pintarGuias },
  faq: { titulo: 'pagina.faq', pintar: pintarFaq },
  laboratorio: { titulo: 'pagina.laboratorio', pintar: pintarLaboratorio },
  idiomas: { titulo: 'cursos.titulo', pintar: pintarElegirCurso, sinPortada: true },
  creditos: { titulo: 'creditos.titulo', pintar: pintarCreditos, sinPortada: true },
  legal: { titulo: 'legal.titulo', pintar: pintarLegal, sinPortada: true },
  enlace: { titulo: 'enlace.titulo', pintar: pintarEnlace, sinPortada: true },
};
// Las portadas llevan la cabecera de la web (Inicio, Entrar, Paglot Max) en lugar del menú del curso.
const PORTADAS = Object.keys(GENERALES).filter(ruta => !GENERALES[ruta].sinPortada);
const esGeneral = ruta => Object.hasOwn(GENERALES, ruta);

/** Pinta una pantalla general y guarda la función que la apaga, si la tiene. */
function pintarGeneral(ruta) {
  const pantalla = GENERALES[ruta];
  if (pantalla.titulo) titulo(t(pantalla.titulo));
  else document.title = t('app.nombre');
  const apagar = pantalla.pintar(app);
  limpiarVista = typeof apagar === 'function' ? apagar : null;
}

const contenido = { resultados: [], capitulos: [], errorCapitulos: null, frases: null };
let limpiarVista = null;
let rutaActual = 'lecciones';

// ---------------------------------------------------------------------------
// Menú, idioma y tema
// ---------------------------------------------------------------------------

function pintarMenu() {
  poner(menu, el('ul', {}, SECCIONES.map(s => el('li', {},
    el('a', { href: `#/${s.ruta}`, 'data-ruta': s.ruta, class: 'menu-enlace' }, icono(s.icono), el('span', {}, t(`menu.${s.ruta}`)),
      // sin cuenta, el cuaderno solo se guarda en este dispositivo: lo dice un candadito
      s.ruta === 'cuaderno' && !usuarioActual()
        ? el('span', { class: 'menu-candado', title: t('cabecera.cuadernoInvitado') }, icono('candado'), el('span', { class: 'solo-lector' }, t('cabecera.cuadernoInvitado')))
        : null)))));
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
  document.body.classList.toggle('con-pie', !dentro || ruta === 'creditos' || ruta === 'legal' || Boolean(perdidaSinCurso));
  ajustesCabecera.open = false;
  abrirAjustes.textContent = `⚙ ${t('ajustes.titulo')}`;
  if (dentro) {
    controlesCabecera.append(ajustesCabecera);
    panelAjustes.append(...controlesAjustes, enlacePerfil);
    pintarEnlacePerfil();
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
  subtitulo.textContent = deCurso ? nombreDelCurso(idioma()) : '';
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

/** La navegación de la web: Inicio, Idiomas y Paglot Max (la cuenta va aparte, en js/cabecera.js). */
function pintarNavegacion() {
  const aqui = location.hash.slice(2).split('/')[0] || (hayCurso ? 'lecciones' : 'inicio');
  const etiquetas = [t('inicio.titulo'), t('cabecera.idiomas'), 'Paglot Max'];
  const rutas = ['inicio', 'idiomas', 'precios'];
  for (const [i, a] of [...document.querySelectorAll('#cabecera-nav a')].entries()) {
    a.href = `#/${rutas[i]}`;
    a.dataset.nav = rutas[i];
    poner(a, rutas[i] === 'precios' ? icono('corona', 'icono nav-corona') : null, etiquetas[i]);
    if (a.dataset.nav === aqui) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

// Al entrar o salir de la cuenta cambia el candadito del cuaderno (el resto de la cabecera lo repinta js/cabecera.js).
let habiaSesion = null;
alCambiarNube(() => {
  const hay = Boolean(usuarioActual());
  if (hay !== habiaSesion) { habiaSesion = hay; pintarEnlacePerfil(); if (hayCurso) pintarMenu(); }
});

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
    IDIOMAS.map(i => {
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
window.addEventListener('datos-sincronizados', pintarAvisoRepaso);
setInterval(pintarAvisoRepaso, 60 * 1000); // las tarjetas también vencen con el paso del tiempo

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
    // Se espera a saber si el dispositivo tiene voz (segundo y medio como mucho): de eso depende qué ejercicios hay.
    // Con índice (indice/lecciones.json) basta un archivo para la lista; cada lección se carga al abrirla.
    // Sin índice (un curso al que aún no se le ha generado) se descargan todas, como antes.
    const diccionario = cargarDiccionario();
    const [indice, { capitulos, error }] = await Promise.all([cargarIndice(), cargarCapitulos(), prepararVoces()]);
    const cargadas = indice ?? await descubrirLecciones();
    contenido.diccionario = diccionario.then(mapa => {
      if (mapa) ponerDiccionario(mapa);
      else ponerDiccionarioGlobal(cargadas);
    });
    // Los IDs internos conservan rutas y progreso; cada curso define su orden visible.
    const resultados = curso.id === 'vi'
      ? cargadas.sort((a, b) =>
        (Number(a.leccion?.capitulo) || Number.MAX_SAFE_INTEGER) - (Number(b.leccion?.capitulo) || Number.MAX_SAFE_INTEGER)
        || Number(a.leccion?.orden_curso ?? a.id) - Number(b.leccion?.orden_curso ?? b.id))
      : curso.id === 'fr'
        ? cargadas.sort((a, b) => Number(a.leccion?.numero_curso ?? a.id) - Number(b.leccion?.numero_curso ?? b.id))
      : cargadas;
    if (curso.id === 'vi') {
      let numeroCurso = 0;
      for (const resultado of resultados) if (resultado.leccion) resultado.leccion.numero_curso = ++numeroCurso;
    }
    // El ID del JSON conserva rutas y progreso; los números visibles siguen el orden que pinta la lista.
    // Inglés, español y ruso están en edición aparte; se dejan con su numeración actual.
    if (!['en', 'es', 'ru'].includes(curso.id)) {
      agrupar(resultados, capitulos).flatMap(grupo => grupo.lecciones)
        .filter(resultado => resultado.leccion)
        .forEach((resultado, i) => { resultado.leccion.numero_curso = i + 1; });
    }
    Object.assign(contenido, { resultados, capitulos, errorCapitulos: error ?? null, sinConexion: Boolean(resultados.sinConexion) });
    cursoCargado = true;
  })();
  return cargaDelCurso;
}

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
  // La primera vez que alguien sin progreso llega a sus lecciones, antes pasa por la bienvenida.
  if (seccion === 'lecciones' && !bienvenidaOfrecida && !bienvenidaVista() && !hayProgreso()) {
    history.replaceState(null, '', '#/bienvenida');
    seccion = 'bienvenida';
  }
  if (seccion === 'bienvenida') bienvenidaOfrecida = true;
  document.body.classList.toggle('en-bienvenida', seccion === 'bienvenida');
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

  // La lección, el cuaderno (su buscador) y la bienvenida usan el diccionario del curso.
  if (['leccion', 'cuaderno', 'bienvenida'].includes(seccion)) {
    await contenido.diccionario;
    if (estePase !== pase) return;
  }

  if (seccion === 'leccion') {
    const i = contenido.resultados.findIndex(r => r.id === parametro);
    const resultado = contenido.resultados[i] && await leccionCompleta(contenido.resultados[i]);
    if (estePase !== pase) return;
    if (!resultado || resultado.error) {
      pintarNoEncontrada(t('app.leccionNoAbre', { id: parametro }));
    } else {
      const siguiente = contenido.resultados.slice(i + 1).find(r => !r.error)?.id ?? null;
      titulo(resultado.leccion.titulo_es || tr(resultado.leccion.titulo));
      limpiarVista = pintarLeccion(app, resultado, siguiente);
    }
  } else if (seccion === 'lecciones') {
    titulo(t('menu.lecciones'));
    if (contenido.sinConexion && !contenido.resultados.length) avisoSinConexion();
    else pintarLecciones(app, contenido);
  } else if (seccion === 'practica') {
    titulo(t('menu.practica'));
    pintarPractica(app, { ...contenido, leccionCompleta });
  } else if (seccion === 'frases') {
    titulo(t('menu.frases'));
    contenido.frases ??= await cargarFrases();
    pintarFrases(app, contenido.frases);
  } else if (seccion === 'cuaderno') {
    titulo(t('menu.cuaderno'));
    pintarCuaderno(app);
  } else if (seccion === 'repaso') {
    titulo(t('menu.repaso'));
    limpiarVista = pintarRepaso(app);
  } else if (seccion === 'perfil') {
    titulo(t('menu.perfil'));
    pintarPerfil(app, contenido);
  } else if (esGeneral(seccion)) {
    pintarGeneral(seccion);
  } else if (seccion === 'bienvenida') {
    // La bienvenida busca su frase de ejemplo en las primeras lecciones: solo esas se cargan enteras.
    const primeras = await Promise.all(contenido.resultados.filter(r => !r.error).slice(0, 8).map(leccionCompleta));
    if (estePase !== pase) return;
    titulo(t('bienvenida.titulo'));
    limpiarVista = pintarBienvenida(app, { ...contenido, resultados: primeras });
  } else {
    pintarNoEncontrada('');
  }

  // Al cambiar de idioma no se mueve la página ni el foco: solo cambian los textos.
  if (!cambioDeIdioma) {
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
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

/** Sin curso elegido: la pantalla de inicio, la de elegir idioma o los créditos. */
function pintarSinCurso({ cambioDeIdioma = false } = {}) {
  limpiarVista?.();
  limpiarVista = null;
  const ruta = location.hash.startsWith('#/') ? location.hash.slice(2).split('/')[0] : '';
  // Lo que no es una ruta («#/algo») no es una página perdida: son, por ejemplo, los datos que traen los enlaces de los correos.
  const vista = esGeneral(ruta) ? ruta : ruta ? 'perdida' : 'inicio';
  document.body.classList.toggle('en-inicio', PORTADAS.includes(vista));
  pintarMarca();
  if (vista === 'perdida') {
    titulo(t('perdida.titulo'));
    limpiarVista = pintarPerdida(app);
  } else {
    pintarGeneral(vista);
  }
  if (!cambioDeIdioma) window.scrollTo(0, 0);
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

async function iniciar() {
  aplicarIdioma();
  iniciarPie();
  aplicarTema();
  pintarMarca();
  pintarBotonTema();
  pintarBotonSonido();

  if (!hayCurso) {
    try { sessionStorage.setItem('idiomas-abierta', '1'); } catch { /* sin almacenamiento */ }
    document.body.classList.add('sin-curso', 'sin-tutora');
    window.addEventListener('hashchange', () => pintarSinCurso());
    pintarSinCurso();
    quitarArranque();
    iniciarNube(); // para saber si ya hay una sesión iniciada
    return;
  }

  empezarPorInicio();
  pintarMenu();

  if (location.protocol === 'file:') {
    avisoArchivoLocal();
    quitarArranque();
    return;
  }

  window.addEventListener('hashchange', () => navegar());
  // Cuando llegan datos de la nube, se repinta la pantalla (salvo en mitad de un repaso).
  window.addEventListener('datos-sincronizados', () => {
    if (!location.hash.startsWith('#/repaso') && !enPantallaGeneral()) navegar();
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
  iniciarNube();
}

iniciar();
