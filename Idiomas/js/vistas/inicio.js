// Pantalla de inicio (portada): el nombre de la app, el botón para empezar o seguir, un grupo de tutoras
// que saludan cada una en su idioma, cómo se aprende aquí y la lista de idiomas.

import { el, poner } from '../dom.js';
import { t, locale, idioma } from '../i18n.js';
import { icono } from '../iconos.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, elegirCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';

const CUANTAS_TUTORAS = 7; // en pantallas estrechas se ven menos (las de los lados se esconden)
const CADA_SALUDO = 2600;  // milisegundos entre un saludo y el siguiente
const DURA_SALUDO = 2100;

const CARACTERISTICAS = [
  { clave: 'f1', icono: 'libro' },
  { clave: 'f2', icono: 'frases' },
  { clave: 'f3', icono: 'estrellaLlena' },
  { clave: 'f4', icono: 'altavoz' },
];

// Las tutoras que salen se eligen al azar una vez por visita (no cambian al cambiar el idioma de la interfaz).
let elencoGuardado = null;

/** Las tutoras de la portada: la del curso elegido en el centro y las demás al azar. */
function elenco() {
  if (elencoGuardado) return elencoGuardado;
  const disponibles = CURSOS.filter(c => !c.proximamente && c.id !== curso.id);
  for (let i = disponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
  }
  const centro = hayCurso ? curso : disponibles.pop();
  const resto = disponibles.slice(0, CUANTAS_TUTORAS - 1);
  const mitad = Math.floor(resto.length / 2);
  elencoGuardado = [...resto.slice(0, mitad), centro, ...resto.slice(mitad)];
  return elencoGuardado;
}

function logo(clase, lado) {
  return el('img', { class: clase, src: 'assets/logo.svg', alt: '', width: lado, height: lado });
}

function bandera(c) {
  const hueco = el('span', { class: 'curso-bandera', 'aria-hidden': 'true' });
  hueco.innerHTML = c.bandera; // dibujo fijo que viene de js/cursos.js
  return hueco;
}

/**
 * Pinta la portada. Devuelve una función que la apaga (las tutoras dejan de moverse y de saludar):
 * hay que llamarla al salir de la pantalla.
 */
export function pintarInicio(contenedor) {
  const sprites = [];
  let encendida = true;

  // --- El grupo de tutoras ---
  const lista = elenco();
  const centro = lista.findIndex(c => (hayCurso ? c.id === curso.id : false));
  const medio = centro >= 0 ? centro : Math.floor(lista.length / 2);
  const figuras = lista.map((c, i) => {
    const canvas = el('canvas', { class: 'inicio-tutora', width: 48, height: 64 });
    const globo = el('span', { class: 'inicio-globo', lang: c.lang }, c.hola);
    const figura = el('div', { class: 'inicio-figura', 'data-lejos': String(Math.abs(i - medio)) }, globo, canvas);
    const dato = { figura, sprite: null, apagar: null };
    dibujoDe(c).then(dibujo => {
      if (!encendida) return;
      dato.sprite = dibujo.crearSprite(canvas);
      sprites.push(dato.sprite);
    }).catch(() => { figura.hidden = true; });
    figura.addEventListener('click', () => { sonar('saludo'); saludar(dato); });
    return dato;
  });

  function saludar(dato) {
    for (const otra of figuras) {
      if (otra === dato) continue;
      otra.figura.classList.remove('habla');
      clearTimeout(otra.apagar);
    }
    dato.figura.classList.add('habla');
    dato.sprite?.reaccionar('contenta', DURA_SALUDO);
    clearTimeout(dato.apagar);
    dato.apagar = setTimeout(() => dato.figura.classList.remove('habla'), DURA_SALUDO);
  }

  // Saludan por turnos, de izquierda a derecha, solo las que se ven; la primera es la del centro.
  let turno = medio;
  const visibles = () => figuras.filter(f => !f.figura.hidden && f.figura.offsetParent !== null);
  const siguienteSaludo = () => {
    if (!encendida || document.hidden) return;
    const quienes = visibles();
    if (!quienes.length) return;
    const actual = figuras[turno % figuras.length];
    saludar(quienes.includes(actual) ? actual : quienes[0]);
    do { turno = (turno + 1) % figuras.length; } while (!quienes.includes(figuras[turno]));
  };
  const primero = setTimeout(siguienteSaludo, 700);
  const reloj = setInterval(siguienteSaludo, CADA_SALUDO);

  // --- Los números ---
  const numero = n => n.toLocaleString(locale());
  const totalLecciones = CURSOS.reduce((suma, c) => suma + (c.lecciones || 0), 0);
  const dato = (n, clave) => el('li', {}, el('strong', {}, numero(n)), ' ', el('span', {}, t(`inicio.dato.${clave}`)));

  // --- La lista de idiomas ---
  const i = idioma();
  const ficha = c => {
    const pronto = Boolean(c.proximamente);
    const traducido = c.nombre[i] ?? c.nombre.en ?? c.nativo;
    return el('li', {},
      el('button', {
        type: 'button', class: `inicio-idioma${c.id === curso.id ? ' actual' : ''}`, disabled: pronto,
        title: pronto ? `${traducido} · ${t('cursos.pronto')}` : traducido,
        onclick: () => { sonar('pagina'); elegirCurso(c.id); },
      }, bandera(c), el('span', { lang: c.lang }, c.nativo)));
  };

  poner(contenedor,
    el('div', { class: 'inicio' },
      el('section', { class: 'inicio-portada' },
        logo('inicio-logo', 128),
        el('h1', { class: 'inicio-nombre', 'aria-label': t('app.nombre') },
          el('span', { 'aria-hidden': 'true' }, 'Pa'), el('span', { class: 'inicio-nombre-oro', 'aria-hidden': 'true' }, 'glot')),
        el('p', { class: 'inicio-lema' }, t('inicio.lema')),
        el('p', { class: 'inicio-texto' }, t('inicio.texto')),
        el('p', { class: 'inicio-botones' },
          hayCurso
            ? el('a', { class: 'boton boton-principal boton-grande', href: '#/lecciones', onclick: () => sonar('pagina') },
              el('span', {}, t('inicio.continuar', { curso: curso.nativo })))
            : el('a', { class: 'boton boton-principal boton-grande', href: '#/idiomas', onclick: () => sonar('pagina') }, t('inicio.empezar')),
          hayCurso && el('a', { class: 'boton', href: '#/idiomas', onclick: () => sonar('pagina') }, t('inicio.otroIdioma'))),
        el('div', { class: 'inicio-escena', 'aria-hidden': 'true' }, figuras.map(f => f.figura)),
        el('ul', { class: 'inicio-datos' },
          dato(CURSOS.length, 'idiomas'),
          dato(totalLecciones, 'lecciones'),
          dato(CURSOS.length, 'tutoras'))),

      el('section', { class: 'inicio-seccion' },
        el('h2', {}, t('inicio.comoTitulo')),
        el('ul', { class: 'inicio-ventajas' }, CARACTERISTICAS.map(c =>
          el('li', { class: 'caja' },
            icono(c.icono, 'icono inicio-icono'),
            el('h3', {}, t(`inicio.${c.clave}.titulo`)),
            el('p', {}, t(`inicio.${c.clave}.texto`)))))),

      el('section', { class: 'inicio-seccion' },
        el('h2', {}, t('inicio.idiomasTitulo', { n: CURSOS.length })),
        el('p', { class: 'inicio-seccion-texto' }, t('inicio.idiomasTexto')),
        el('ul', { class: 'inicio-idiomas' }, CURSOS.map(ficha))),

      el('footer', { class: 'inicio-pie' },
        logo('inicio-pie-logo', 32),
        el('p', {}, el('strong', {}, t('app.nombre')), ' · ', t('inicio.pie')),
        el('p', {}, hayCurso && el('a', { href: '#/bienvenida' }, t('bienvenida.otraVez')), hayCurso && ' · ', el('a', { href: '#/sobre' }, t('sobre.titulo')), ' · ', el('a', { href: '#/legal' }, t('legal.titulo')), ' · ', el('a', { href: '#/creditos' }, t('creditos.titulo'))))));

  return () => {
    encendida = false;
    clearTimeout(primero);
    clearInterval(reloj);
    for (const f of figuras) clearTimeout(f.apagar);
    for (const s of sprites) s.parar?.();
  };
}
