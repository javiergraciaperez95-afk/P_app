// El pie de la web: un escenario con el logotipo grande y cuatro tutoras que charlan entre ellas delante de un
// horizonte con monumentos de los países de los idiomas (de día, nubes y pájaros; de noche, luna, estrellas fugaces),
// los enlaces secundarios en tres carteles y una franja final con el botón de volver arriba.
// Solo se ve en las pantallas generales de la web (lo decide body.con-pie, en js/app.js): dentro de un curso no hay pie.

import { el, poner } from './dom.js';
import { t } from './i18n.js';
import { CURSOS } from './cursos.js';
import { curso, hayCurso } from './curso.js';
import { dibujoDe } from './tutor-sprite.js';
import { sonar } from './sonidos.js';
import { icono } from './iconos.js';
import { horizonte, nubes, luna } from './vistas/inicio-decorado.js';

const ICONOS_GRUPO = { descubre: 'libro', producto: 'corona', ayuda: 'frases' };
const CUANTAS = 4;          // dos a cada lado del logotipo (en el móvil, en fila debajo)
const CADA_ESCENA = 4200;   // milisegundos entre una escenita y la siguiente
const DURA_GLOBO = 1900;

// Las escenitas: quién hace qué y cuándo. «a», «b»… son posiciones relativas (la que empieza y sus vecinas).
// globo: dice su «¡Hola!» en su idioma. Las que no se ven en pantallas estrechas se saltan solas.
const ESCENAS = [
  // una saluda y la de al lado le contesta
  [{ quien: 0, gesto: 'saludar', globo: true }, { quien: 1, a: 900, gesto: 'saludar', globo: true }, { quien: 0, a: 2100, gesto: 'asentir' }],
  // una señala el logotipo y las demás aplauden
  [{ quien: 0, gesto: 'senalar', logo: true }, { quien: 1, a: 700, gesto: 'aplaudir' }, { quien: 2, a: 800, gesto: 'aplaudir' }, { quien: 3, a: 900, gesto: 'pulgar' }],
  // a una le entra sueño y la otra la despierta con su saludo
  [{ quien: 0, gesto: 'bostezo' }, { quien: 1, a: 1500, gesto: 'saludar', globo: true }, { quien: 0, a: 2300, gesto: 'respingo' }],
  // la ola: se dan la vuelta una detrás de otra
  [{ quien: 0, gesto: 'vueltecita' }, { quien: 1, a: 350, gesto: 'vueltecita' }, { quien: 2, a: 700, gesto: 'vueltecita' }, { quien: 3, a: 1050, gesto: 'vueltecita' }],
  // una enseña su gesto propio y la vecina le guiña un ojo
  [{ quien: 0, gesto: 'firma', globo: true }, { quien: 1, a: 1200, gesto: 'guino' }],
  // una piensa, la otra se rasca la cabeza y al final las dos asienten
  [{ quien: 0, gesto: 'pensar' }, { quien: 1, a: 600, gesto: 'rascarse' }, { quien: 0, a: 2400, gesto: 'asentir' }, { quien: 1, a: 2500, gesto: 'asentir' }],
];

let figuras = [];     // { curso, figura, canvas, globo, sprite, dibujo, apagarGlobo }
let encendido = false;
let reloj = null;
let pendientes = [];  // temporizadores de la escenita en curso
let ultimaEscena = -1;
let siguiente = 0;    // por qué tutora empieza la próxima escenita

/** Cuatro tutoras al azar; si hay curso elegido, la suya va la primera (en el móvil solo quedan las de los extremos). */
function elegirTutoras() {
  const libres = CURSOS.filter(c => !c.proximamente && c.id !== curso.id);
  for (let i = libres.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [libres[i], libres[j]] = [libres[j], libres[i]];
  }
  const lista = libres.slice(0, hayCurso ? CUANTAS - 1 : CUANTAS);
  if (hayCurso) lista.unshift(curso);
  return lista;
}

const visibles = () => figuras.filter(f => f.figura.offsetParent !== null);

function decir(f) {
  f.figura.classList.add('habla');
  clearTimeout(f.apagarGlobo);
  f.apagarGlobo = setTimeout(() => f.figura.classList.remove('habla'), DURA_GLOBO);
}

function hacer(f, gesto, globo) {
  if (!f?.sprite) return;
  f.sprite.gesto(gesto);
  if (globo) decir(f);
}

function saltaLogo() {
  const logo = document.querySelector('.pie-logo');
  if (!logo) return;
  logo.classList.remove('salta');
  void logo.offsetWidth; // para que la animación vuelva a empezar
  logo.classList.add('salta');
}

/** Una escenita, empezando por la tutora que toca (las demás son sus vecinas, dando la vuelta). */
function representar() {
  const quienes = visibles();
  if (quienes.length < 2) return;
  let n;
  do { n = Math.floor(Math.random() * ESCENAS.length); } while (n === ultimaEscena);
  ultimaEscena = n;
  const escena = ESCENAS[n];
  const primera = siguiente % quienes.length;
  siguiente++;
  pendientes = []; // los de la escenita anterior ya han pasado (cada una dura menos que CADA_ESCENA)
  for (const paso of escena) {
    if (paso.quien >= quienes.length) continue;
    const f = quienes[(primera + paso.quien) % quienes.length];
    pendientes.push(setTimeout(() => {
      hacer(f, paso.gesto, paso.globo);
      if (paso.logo) saltaLogo();
    }, paso.a ?? 0));
  }
}

function cortarEscena() {
  for (const p of pendientes) clearTimeout(p);
  pendientes = [];
}

function encender() {
  if (encendido) return;
  encendido = true;
  for (const f of figuras) if (f.dibujo) f.sprite = f.dibujo.crearSprite(f.canvas);
  reloj = setInterval(() => { if (!document.hidden) representar(); }, CADA_ESCENA);
  pendientes.push(setTimeout(representar, 600));
}

function apagar() {
  if (!encendido) return;
  encendido = false;
  clearInterval(reloj);
  cortarEscena();
  for (const f of figuras) {
    f.sprite?.parar();
    f.sprite = null;
    clearTimeout(f.apagarGlobo);
    f.figura.classList.remove('habla');
  }
}

/** Al tocar una tutora: hace su gesto propio y dice hola; las demás le aplauden. */
function tocar(f) {
  if (!f.sprite) return;
  sonar('saludo');
  cortarEscena();
  hacer(f, 'firma', true);
  for (const otra of visibles()) {
    if (otra !== f) pendientes.push(setTimeout(() => hacer(otra, 'aplaudir'), 500 + Math.random() * 300));
  }
}

/** Todas se despiden, una detrás de otra (al volver arriba o al tocar el logotipo). */
function despedida() {
  cortarEscena();
  visibles().forEach((f, i) => pendientes.push(setTimeout(() => hacer(f, 'saludar', true), i * 220)));
}

/** Monta las tutoras una sola vez y las pone a moverse solo mientras el pie está a la vista. */
export function iniciarPie() {
  const pie = document.getElementById('pie-sitio');
  const lados = [pie.querySelector('[data-pie-tutoras="izq"]'), pie.querySelector('[data-pie-tutoras="der"]')];
  // la guirnalda con las banderas de todos los idiomas, entre los carteles y la franja final
  const guirnalda = el('div', { class: 'pie-guirnalda', 'aria-hidden': 'true' }, CURSOS.map((c, n) => {
    const b = el('span', { class: 'pie-banderita', style: `--n:${n}` });
    b.innerHTML = c.bandera; // dibujo fijo del catálogo local de cursos
    return b;
  }));
  pie.querySelector('.pie-base').before(guirnalda);
  pie.querySelector('[data-pie-anio]').before(el('img', { class: 'pie-base-logo', src: 'assets/favicon.svg', alt: '', width: 22, height: 22 }));

  // el decorado, detrás de todo
  const pajaros = el('div', { class: 'pie-pajaros', 'aria-hidden': 'true' }, el('i'), el('i'), el('i'));
  pie.querySelector('.pie-escena').prepend(horizonte(), nubes(), luna(), pajaros, el('span', { class: 'pie-fugaz', 'aria-hidden': 'true' }));
  figuras = elegirTutoras().map((c, i) => {
    const canvas = el('canvas', { class: 'pie-tutora', width: 48, height: 64 });
    const globo = el('span', { class: 'pie-globo', lang: c.lang }, c.hola);
    const figura = el('div', { class: 'pie-figura', 'data-n': String(i) }, globo, canvas);
    const f = { curso: c, figura, canvas, globo, sprite: null, dibujo: null, apagarGlobo: null };
    figura.addEventListener('click', () => tocar(f));
    lados[i < CUANTAS / 2 ? 0 : 1].append(figura);
    dibujoDe(c).then(dibujo => {
      f.dibujo = dibujo;
      if (encendido) f.sprite = dibujo.crearSprite(canvas);
    }).catch(() => { figura.hidden = true; });
    return f;
  });

  pie.querySelector('.pie-marca').addEventListener('click', () => { saltaLogo(); despedida(); });
  pie.querySelector('[data-pie-subir]').addEventListener('click', () => {
    sonar('pagina');
    despedida();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  // Solo se mueven cuando se ven: el pie no está en todas las pantallas y casi siempre queda abajo del todo.
  const escena = pie.querySelector('.pie-escena');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entrada]) => (entrada.isIntersecting ? encender() : apagar()), { rootMargin: '80px' }).observe(escena);
    // y mientras no se ve, sus animaciones de CSS (banderitas, estrellas…) se quedan quietas
    new IntersectionObserver(([entrada]) => pie.classList.toggle('pie-fuera', !entrada.isIntersecting)).observe(pie);
  } else {
    encender();
  }
}

/** Los textos del pie, en el idioma de la interfaz (se repinta al cambiarlo y al cambiar de pantalla). */
export function pintarPie() {
  for (const clave of ['descubre', 'producto', 'ayuda']) {
    const nodo = document.querySelector(`[data-pie-titulo="${clave}"]`);
    if (nodo) poner(nodo, icono(ICONOS_GRUPO[clave], 'icono pie-icono'), el('span', {}, t(`pie.${clave}`)));
  }
  const enlaces = {
    sobre: t('sobre.titulo'), social: t('pagina.social'), guias: t('pie.guias'), laboratorio: t('pie.laboratorio'),
    escuelas: t('pie.escuelas'), empresas: t('pie.empresas'), max: 'Paglot Max', regalo: t('pie.regalo'), tienda: t('pie.tienda'),
    contacto: t('pie.contacto'), faq: t('pagina.faq'), legal: t('legal.titulo'), creditos: t('creditos.titulo'),
  };
  for (const [clave, texto] of Object.entries(enlaces)) {
    const nodo = document.querySelector(`[data-pie="${clave}"]`);
    if (nodo) nodo.textContent = texto;
  }
  // Volver a ver la bienvenida solo tiene sentido con un curso elegido (es una lección de prueba de ese idioma).
  const bienvenida = document.querySelector('[data-pie="bienvenida"]');
  bienvenida.textContent = t('bienvenida.otraVez');
  bienvenida.hidden = !hayCurso;
  document.querySelector('[data-pie-lema]').textContent = t('pie.lema');
  document.querySelector('[data-pie-final]').textContent = t('pie.firma');
  document.querySelector('[data-pie-anio]').textContent = `© ${new Date().getFullYear()} Paglot`;
  document.querySelector('.pie-marca').setAttribute('aria-label', t('pie.marca'));
  const subir = document.querySelector('[data-pie-subir]');
  poner(subir, el('span', { class: 'pie-subir-flecha', 'aria-hidden': 'true' }, '▲'), t('pie.subir'));
}
