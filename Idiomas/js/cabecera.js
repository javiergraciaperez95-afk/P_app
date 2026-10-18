// La parte de la cabecera que cambia: en las portadas, una cinta con el saludo (con el nombre que se puso en el perfil),
// la racha, lo que toca repasar hoy y el botón para seguir. No hay cuentas: todo vive en este dispositivo.
// app.js decide la parte fija (marca, menú del curso, ajustes) y llama a pintarCabecera() cada vez que algo cambia.

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { t } from './i18n.js';
import { curso } from './curso.js';
import { tarjetas, racha, nombre, alCambiar } from './progress.js';
import { tocaRepasar, esNueva } from './srs.js';

const cabecera = document.querySelector('.cabecera');
const cinta = document.getElementById('cabecera-cinta');

/** Tarjetas que tocan hoy: las pendientes más las nuevas (como mucho 20, igual que en la pantalla de repaso). */
export function pendientesDeHoy() {
  const todas = tarjetas();
  return todas.filter(c => tocaRepasar(c.srs)).length + Math.min(20, todas.filter(c => esNueva(c.srs)).length);
}

const enPortada = () => document.body.classList.contains('en-inicio');

/** Portada: el saludo, la racha, lo que toca hoy y el botón para seguir. */
function cintaBienvenida() {
  const quien = nombre().trim();
  const n = pendientesDeHoy();
  const dias = racha();
  return el('div', { class: 'cinta-hola' },
    el('p', { class: 'hola-texto' },
      el('strong', {}, quien ? t('cabecera.hola', { nombre: quien }) : t('cabecera.holaSinNombre')),
      dias ? el('span', { class: 'hola-dato' }, icono('llama'), t('cabecera.racha', { n: dias })) : null,
      el('span', { class: 'hola-dato' }, icono('repaso'), n ? t('cabecera.pendientes', { n }) : t('cabecera.alDia'))),
    el('a', { class: 'btn hola-seguir', href: '#/lecciones' }, t('inicio.continuar', { curso: curso.nativo })));
}

/** Pinta la cinta (solo en las portadas). */
export function pintarCabecera() {
  const contenido = enPortada() ? cintaBienvenida() : null;
  poner(cinta, contenido);
  cinta.hidden = !contenido;
}

// Con la página bajada, la cabecera (que se queda arriba) se encoge y esconde la cinta.
// Dos umbrales separados: al encogerse, la página se acorta y el desplazamiento cambia; con uno solo,
// ese cambio la hacía dudar entre encogerse y crecer. Ahora se encoge pasados 120 px y solo crece arriba del todo.
let encogida = false;
addEventListener('scroll', () => {
  const ahora = encogida ? scrollY > 8 : scrollY > 120;
  if (ahora !== encogida) { encogida = ahora; cabecera.classList.toggle('encogida', ahora); }
}, { passive: true });

alCambiar(() => pintarCabecera());
