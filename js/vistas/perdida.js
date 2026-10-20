// Página perdida: una dirección que no existe (o una lección que no se puede abrir). Lucía, confundida, la busca.

import { el, poner, alAzar } from '../dom.js';
import { t } from '../i18n.js';
import { crearSprite } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';

/** Pinta la página. «detalle» es un texto opcional (por ejemplo, qué lección no se abre). Devuelve la función que la apaga. */
export function pintarPerdida(contenedor, detalle = '') {
  const canvas = el('canvas', { class: 'ph-lienzo', width: 48, height: 64 });
  const globo = el('span', { class: 'ph-globo' });
  const frases = [].concat(t('perdida.dice'));
  let n = Math.floor(Math.random() * frases.length);
  const hablar = () => { globo.textContent = frases[n % frases.length]; n += 1; };
  hablar();
  const reloj = setInterval(hablar, 3600);
  const sprite = crearSprite(canvas);
  sprite.expresion = 'confundida';
  const tutora = el('button', { type: 'button', class: 'ph-tutora-grande', 'aria-hidden': 'true', tabindex: '-1' }, globo, canvas);
  tutora.addEventListener('click', () => { sonar(alAzar(['saludo', 'cosquillas', 'sorpresa'])); sprite.reaccionar?.('cosquillas', 900); hablar(); });

  poner(contenedor,
    el('section', { class: 'ph-perdida caja' },
      tutora,
      el('h1', {}, t('perdida.titulo')),
      el('p', {}, detalle || t('perdida.texto')),
      el('p', { class: 'botonera' },
        el('a', { class: 'boton boton-principal', href: '#/inicio' }, t('ph.menu.inicio')),
        el('a', { class: 'boton', href: '#/lecciones' }, t('menu.lecciones')))));

  return () => {
    clearInterval(reloj);
    sprite.parar?.();
  };
}
