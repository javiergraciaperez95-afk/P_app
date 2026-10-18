// Créditos (#/creditos): a quién se agradecen las voces y lo demás que usa la app.

import { el, poner } from '../dom.js';
import { t, tr, idioma } from '../i18n.js';
import { CURSOS } from '../cursos.js';
import { hayCurso, nombreCurso } from '../curso.js';
import { VOCES, OTROS } from '../creditos.js';

function bandera(c) {
  const hueco = el('span', { class: 'curso-bandera', 'aria-hidden': 'true' });
  hueco.innerHTML = c.bandera; // dibujo fijo que viene de js/cursos.js
  return hueco;
}

const nombreEn = nombreCurso;

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
