// La parte de la cabecera que cambia: en las portadas, una cinta con el saludo (con el nombre que se puso en el perfil),
// la racha, lo que toca repasar hoy y el botón para seguir. No hay cuentas: todo vive en este dispositivo.
// app.js decide la parte fija (marca, menú del curso, ajustes) y llama a pintarCabecera() cada vez que algo cambia.

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { t } from './i18n.js';
import { curso } from './curso.js';
import { tarjetas, racha, nombre, alCambiar, hayProgreso } from './progress.js';
import { tocaRepasar, esNueva } from './srs.js';
import { decir } from './tutor.js';
import { sonar } from './sonidos.js';
import { nube, alCambiarNube } from './nube.js';

const cabecera = document.querySelector('.cabecera');
const cinta = document.getElementById('cabecera-cinta');
const cuenta = document.getElementById('cabecera-cuenta');

// La llama de la racha, junto a los botones de la cabecera (solo dentro del curso). Al tocarla, Lucía la comenta.
const llama = el('button', { type: 'button', class: 'btn cabecera-llama', 'data-sonido': 'nada' });
llama.addEventListener('click', () => {
  const dias = racha();
  llama.classList.remove('aviva'); void llama.offsetWidth; llama.classList.add('aviva');
  sonar(dias ? 'fuegos' : 'nada');
  decir(t(dias >= 7 ? 'cabecera.llamaMucha' : dias ? 'cabecera.llamaViva' : 'cabecera.llamaApagada', { n: dias }), dias ? 'contenta' : 'pensando');
});
document.querySelector('.cabecera-botones')?.prepend(llama);

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

/** El botón de la cuenta (número al estilo Mullvad): lleva a #/entrar y su puntito dice si la nube está al día. */
function pintarCuenta() {
  if (!cuenta) return;
  const estado = { guardada: 'ok', conectando: 'guardando', 'sin-conexion': 'local', error: 'error' }[nube.estado] ?? 'local';
  const texto = t(`cuenta2.estado.${nube.estado}`) || t('cabecera.cuenta');
  poner(cuenta, el('a', { class: 'btn cabecera-entrar', href: '#/entrar', title: texto, 'aria-label': `${t('cabecera.cuenta')} · ${texto}` },
    icono('perfil'), el('span', { class: 'cabecera-cuenta-texto' }, t('cabecera.cuenta')),
    el('span', { class: `avatar-nube ${estado}`, 'aria-hidden': 'true' })));
}

/** Pinta la cinta (solo en las portadas), la llama de la racha y el botón de la cuenta. */
export function pintarCabecera() {
  pintarCuenta();
  const dias = racha();
  poner(llama, el('span', { class: 'cabecera-llama-fuego', 'aria-hidden': 'true' }, '🔥'), String(dias));
  llama.classList.toggle('viva', dias > 0);
  llama.setAttribute('aria-label', t('cabecera.racha', { n: dias }));
  llama.title = t('cabecera.racha', { n: dias });
  // la cinta del saludo solo para quien ya ha empezado (a quien llega por primera vez no se le da la «bienvenida de vuelta»)
  const contenido = enPortada() && hayProgreso() ? cintaBienvenida() : null;
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
alCambiarNube(() => pintarCuenta());
