// Pantalla «¡Elige el idioma a estudiar!», con la tutora de cada curso, y la pantalla de créditos.

import { el, poner } from '../dom.js';
import { t, tr, idioma } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { curso, hayCurso, elegirCurso } from '../curso.js';
import { dibujoDe } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { VOCES, OTROS } from '../creditos.js';

/** La tutora de un curso, quieta, para su tarjeta. */
function retrato(c) {
  const canvas = el('canvas', { class: 'curso-tutora', width: 48, height: 60, 'aria-hidden': 'true' });
  dibujoDe(c).then(dibujo => {
    const rejilla = dibujo.rejilla('normal');
    const ctx = canvas.getContext('2d');
    const arriba = canvas.height - rejilla.length;
    rejilla.forEach((fila, y) => fila.forEach((color, x) => {
      if (color) { ctx.fillStyle = color; ctx.fillRect(x, y + arriba, 1, 1); }
    }));
  }).catch(() => { /* sin dibujo: la tarjeta sale sin tutora */ });
  return canvas;
}

function bandera(c) {
  const hueco = el('span', { class: 'curso-bandera', 'aria-hidden': 'true' });
  hueco.innerHTML = c.bandera; // dibujo fijo que viene de js/cursos.js
  return hueco;
}

const nombreEn = (c, i) => c.nombre[i] ?? c.nombre.en ?? c.nativo;

export function pintarElegirCurso(contenedor) {
  const i = idioma();
  const tarjeta = c => {
    const pronto = Boolean(c.proximamente);
    return el('li', {},
      el('button', {
        type: 'button', class: `curso-tarjeta caja${c.id === curso.id ? ' curso-actual' : ''}`, disabled: pronto,
        onclick: () => { sonar('pagina'); elegirCurso(c.id); },
      },
      retrato(c),
      el('span', { class: 'curso-nombre', lang: c.lang }, c.nativo, ' ', bandera(c)),
      el('span', { class: 'curso-traducido' }, nombreEn(c, i)),
      el('span', { class: 'curso-estado' },
        pronto ? t('cursos.pronto') : c.id === curso.id ? t('cursos.estudiando') : t('cursos.lecciones', { n: c.lecciones }))));
  };

  poner(contenedor,
    el('section', { class: 'elegir-curso' },
      el('h1', {}, t('cursos.titulo')),
      el('p', { class: 'elegir-curso-texto' }, t('cursos.texto')),
      el('ul', { class: 'cursos-lista' }, CURSOS.map(tarjeta)),
      el('p', { class: 'elegir-curso-pie' },
        el('a', { class: 'boton boton-mini', href: '#/inicio' }, t('inicio.titulo')),
        ' ',
        hayCurso && el('a', { class: 'boton boton-mini', href: '#/lecciones' }, t('cursos.volver', { curso: curso.nativo })),
        ' ',
        el('a', { class: 'boton boton-mini', href: '#/creditos' }, t('creditos.titulo')))));
}

export function pintarCreditos(contenedor) {
  const i = idioma();
  const enlace = (texto, url) => el('a', { href: url, target: '_blank', rel: 'noopener' }, texto);
  const porCurso = CURSOS
    .map(c => ({ c, voces: VOCES.filter(v => v.curso === c.id) }))
    .filter(x => x.voces.length);

  poner(contenedor,
    el('section', { class: 'creditos' },
      el('h1', {}, t('creditos.titulo')),
      el('p', { class: 'caja' }, t('creditos.gracias')),
      porCurso.length > 0 && el('h2', {}, t('creditos.voces')),
      porCurso.length > 0 && el('ul', { class: 'creditos-lista' }, porCurso.map(({ c, voces }) =>
        el('li', { class: 'caja' },
          el('strong', {}, nombreEn(c, i), ' ', bandera(c)),
          el('ul', {}, voces.map(v => el('li', {}, enlace(v.autor, v.url), ` · ${t('creditos.voz', { voz: v.voz })} · ${v.licencia}`)))))),
      el('h2', {}, t('creditos.otros')),
      el('ul', { class: 'creditos-lista' }, OTROS.map(o =>
        el('li', { class: 'caja' }, el('strong', {}, o.nombre), ` (${tr(o.que)}) · `, enlace(o.autor, o.url), ` · ${o.licencia}`))),
      el('p', {}, t('creditos.ia')),
      el('p', {}, el('a', { class: 'boton boton-mini', href: hayCurso ? '#/lecciones' : '#/inicio' }, t('creditos.volver')))));
}
