// La parte de la cabecera que cambia: la llama de la racha y el botón de la cuenta, con su puntito de la nube (si el
// progreso está guardado en Supabase). app.js pinta lo fijo (marca, pestañas, ajustes) y llama a pintarCabecera().

import { el, poner } from './dom.js';
import { icono } from './iconos.js';
import { t } from './i18n.js';
import { tarjetas, racha, alCambiar } from './progress.js';
import { colaDeHoy } from './srs.js';
import { decir, botonTutora } from './tutor.js';
import { sonar } from './sonidos.js';
import { nube, alCambiarNube } from './nube.js';

const cabecera = document.querySelector('.cabecera');
const cuenta = document.getElementById('cabecera-cuenta');

// La llama de la racha, junto a los botones de la cabecera. Al tocarla, Lucía la comenta.
const llama = el('button', { type: 'button', class: 'btn cabecera-llama', 'data-sonido': 'nada' });
llama.addEventListener('click', () => {
  const dias = racha();
  llama.classList.remove('aviva'); void llama.offsetWidth; llama.classList.add('aviva');
  sonar(dias ? 'fuegos' : 'nada');
  decir(t(dias >= 7 ? 'cabecera.llamaMucha' : dias ? 'cabecera.llamaViva' : 'cabecera.llamaApagada', { n: dias }), dias ? 'contenta' : 'pensando', { abrir: true });
});
document.querySelector('.cabecera-botones')?.prepend(botonTutora(), llama);

/** Tarjetas que quedan hoy: las que tocan más las nuevas que aún caben hoy (igual que en la pantalla de repaso). */
export function pendientesDeHoy() {
  const { pendientes, nuevas } = colaDeHoy(tarjetas());
  return pendientes.length + nuevas.length;
}

/** El botón de la cuenta: lleva al perfil. Su puntito dice si el progreso está guardado en la nube. */
function pintarCuenta() {
  if (!cuenta) return;
  const estado = { guardada: 'ok', conectando: 'guardando', 'sin-conexion': 'local', 'sin-instalar': 'local', error: 'error' }[nube.estado] ?? 'local';
  const texto = t(`ph.nube.${nube.estado}`);
  poner(cuenta, el('a', { class: 'btn cabecera-entrar', href: '#/perfil', title: texto, 'aria-label': `${t('menu.perfil')} · ${texto}` },
    icono('nube'), el('span', { class: `avatar-nube ${estado}`, 'aria-hidden': 'true' })));
}

/** Pinta la llama de la racha y el botón de la cuenta. */
export function pintarCabecera() {
  pintarCuenta();
  const dias = racha();
  poner(llama, el('span', { class: 'cabecera-llama-fuego', 'aria-hidden': 'true' }, '🔥'), String(dias));
  llama.classList.toggle('viva', dias > 0);
  llama.setAttribute('aria-label', t('cabecera.racha', { n: dias }));
  llama.title = t('cabecera.racha', { n: dias });
}

// Con la página bajada, la cabecera (que se queda arriba) se encoge (en el móvil no: se notaría a tirones).
let encogida = false;
const enMovil = window.matchMedia('(max-width: 700px)');
addEventListener('scroll', () => {
  if (enMovil.matches) return;
  const ahora = encogida ? scrollY > 8 : scrollY > 120;
  if (ahora !== encogida) { encogida = ahora; cabecera.classList.toggle('encogida', ahora); }
}, { passive: true });

alCambiar(() => pintarCabecera());
alCambiarNube(() => pintarCuenta());
