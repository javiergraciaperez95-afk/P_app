// La pantalla del probador de juegos (#/desarrollador; se llega con siete toques en el logo de la cabecera): todos los
// juegos con los que se estudian las lecciones. Al elegir uno salen lecciones al azar, de idiomas al azar, que lo
// tengan; con «Todo al azar», lecciones al azar tal cual (js/probador.js). Herramienta interna: sus textos van en español.

import { el, poner } from '../dom.js';
import { sonar } from '../sonidos.js';
import { catalogo } from '../../juegos/catalogo.js';
import '../../juegos/lista.js';
import { empezarProbador, salirDelProbador, probadorActivo, juegoProbado } from '../probador.js';

const TIPOS = {
  explicacion: 'explicación', gramatica: 'gramática', dialogo: 'diálogo', vocabulario: 'vocabulario', texto: 'lectura',
  tabla: 'tabla', test: 'test', traduccion: 'traducción', huecos: 'huecos', ordenar: 'ordenar', escribir: 'escribir',
};

export function pintarProbador(contenedor) {
  const juegos = catalogo();
  const elegido = juegoProbado();
  const boton = j => el('button', {
    type: 'button',
    class: `probador-juego${elegido === j.nombre ? ' elegido' : ''}`,
    onclick: () => empezarProbador(j.nombre, j.tipos),
  },
  el('span', { class: 'probador-icono', 'aria-hidden': 'true' }, j.icono),
  el('b', {}, j.nombre),
  el('small', {}, j.tipos.map(x => TIPOS[x] ?? x).join(' · ') + (j.oido ? ' · 🔊 necesita voz' : '')));

  poner(contenedor, el('section', { class: 'probador' },
    el('header', { class: 'probador-cabeza' },
      el('span', { class: 'probador-etiqueta' }, '🧪 Modo desarrollador'),
      el('h1', {}, 'Probador de juegos'),
      el('p', {}, 'Elige un juego y te saldrán lecciones al azar, de idiomas al azar, que lo tengan, empezando en ese paso. '
        + 'Arriba verás el idioma, la lección y el juego que hay en pantalla; «🎲 Otra» salta a la siguiente. '
        + 'Puedes pasar de paso sin terminarlo.')),
    el('div', { class: 'probador-acciones' },
      el('button', { type: 'button', class: 'es-boton es-boton-grande', onclick: () => empezarProbador(null) }, '🎲 Todo al azar'),
      probadorActivo() ? el('button', { type: 'button', class: 'es-boton es-boton-papel', onclick: () => { sonar('cerrar'); salirDelProbador(); } }, 'Salir del probador') : null,
      el('a', { class: 'es-boton es-boton-papel', href: '#/lecciones', onclick: () => sonar('pagina') }, 'Lecciones con todo abierto')),
    el('h2', {}, `Los ${juegos.length} juegos`),
    el('ul', { class: 'probador-juegos' }, juegos.map(j => el('li', {}, boton(j)))),
    el('p', { class: 'probador-nota' }, 'Lo que juegues cuenta en el progreso de este dispositivo. Al salir del probador vuelve el curso que tenías.')));
}
