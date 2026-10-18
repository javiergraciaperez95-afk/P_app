// Página perdida: una dirección que no existe (o una lección que no se puede abrir).
// Una tutora confundida la busca de un lado a otro. Cabe en la pantalla sin desplazar.

import { el, poner, alAzar } from '../dom.js';
import { t } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';

/** Pinta la página. «detalle» es un texto opcional (por ejemplo, qué lección no se abre). Devuelve la función que la apaga. */
export function pintarPerdida(contenedor, detalle = '') {
  let encendida = true;
  let sprite = null;
  const disponibles = CURSOS.filter(c => !c.proximamente);
  const quien = hayCurso ? curso : disponibles[Math.floor(Math.random() * disponibles.length)];

  const canvas = el('canvas', { class: 'sobre-tutora', width: 48, height: 64 });
  const globo = el('span', { class: 'inicio-globo' });
  const tutora = el('div', { class: 'sobre-actriz habla', 'aria-hidden': 'true' }, globo, el('span', { class: 'sobre-salto' }, canvas));
  const frases = t('perdida.dice');
  let n = Math.floor(Math.random() * frases.length);
  const hablar = () => { globo.textContent = frases[n % frases.length]; n += 1; };
  hablar();
  const reloj = setInterval(hablar, 3600);
  dibujoDe(quien).then(dibujo => {
    if (!encendida) return;
    sprite = dibujo.crearSprite(canvas);
    sprite.expresion = 'confundida';
  }).catch(() => { tutora.hidden = true; });
  tutora.addEventListener('click', () => { sonar(alAzar(['saludo', 'cosquillas', 'sorpresa'])); sprite?.reaccionar('cosquillas', 900); globo.textContent = alAzar(frases); });

  poner(contenedor,
    el('section', { class: 'perdida' },
      el('p', { class: 'perdida-numero', 'aria-hidden': 'true' }, '4', el('img', { src: 'assets/logo.svg', alt: '', width: 96, height: 96 }), '4'),
      el('h1', {}, t('perdida.titulo')),
      el('p', { class: 'perdida-texto' }, detalle || t('perdida.texto')),
      el('div', { class: 'perdida-busca' }, el('div', { class: 'perdida-paseo' }, tutora)),
      el('p', { class: 'inicio-botones' },
        hayCurso && el('a', { class: 'boton boton-principal', href: '#/lecciones' }, t('menu.lecciones')),
        el('a', { class: hayCurso ? 'boton' : 'boton boton-principal', href: '#/inicio' }, t('inicio.titulo')))));

  return () => {
    encendida = false;
    clearInterval(reloj);
    sprite?.parar?.();
  };
}
