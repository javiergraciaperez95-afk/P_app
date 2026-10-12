// Pantalla «Práctica»: tandas sueltas de ejercicios de todo el curso.
// - Oído: ejercicios con audio al azar.
// - Fallos: los ejercicios cuya última respuesta fue un error.

import { el, poner, barajar } from '../dom.js';
import { crearEjercicio } from '../exercises.js';
import { ejerciciosFallados } from '../progress.js';
import { decir } from '../tutor.js';
import { sonar } from '../sonidos.js';
import { t } from '../i18n.js';

const TANDA = 10;

function todosLosEjercicios(resultados) {
  const lista = [];
  for (const r of resultados) {
    if (!r.leccion) continue;
    for (const b of r.leccion.bloques) {
      if (b.id && !b.error) lista.push({ leccion: r.leccion, bloque: b });
    }
  }
  return lista;
}

export function pintarPractica(app, { resultados }) {
  const todos = todosLosEjercicios(resultados);
  const zona = el('div', { class: 'zona-practica' });

  function tanda(lista, titulo, vacio) {
    if (!lista.length) {
      poner(zona, el('p', { class: 'caja' }, vacio));
      decir(vacio, 'contenta');
      return;
    }
    sonar('voltear');
    let hechos = 0;
    const contador = el('p', { class: 'aprox' });
    const actualizar = () => { contador.textContent = t('practice.done', { hechos, total: lista.length }); };
    poner(zona,
      el('h2', {}, titulo),
      contador,
      lista.map(({ leccion, bloque }, i) => el('div', { class: 'practica-item' },
        el('a', { class: 'aprox', href: `#/leccion/${leccion.id}`, lang: 'pt-PT' }, leccion.titulo),
        crearEjercicio(bloque, leccion.id, i + 1, () => { hechos += 1; actualizar(); }))));
    actualizar();
    zona.querySelector('h2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const oido = () => tanda(
    barajar(todos.filter(x => x.bloque.audio)).slice(0, TANDA),
    `🔊 ${t('practice.listeningTitle')}`,
    t('practice.noAudio'));

  const fallos = () => {
    const fallados = new Set(ejerciciosFallados().map(f => `${f.idLeccion}|${f.idEjercicio}`));
    tanda(
      barajar(todos.filter(x => fallados.has(`${x.leccion.id}|${x.bloque.id}`))).slice(0, 15),
      `✘ ${t('practice.mistakesTitle')}`,
      t('tutor.noMistakes'));
  };

  const nFallos = ejerciciosFallados().length;
  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, t('practice.title')),
      el('p', {}, t('practice.intro'))),
    el('div', { class: 'botonera' },
      el('button', { type: 'button', class: 'boton boton-principal', onclick: oido }, `🔊 ${t('practice.listeningButton', { n: TANDA })}`),
      el('button', { type: 'button', class: 'boton', onclick: fallos }, `✘ ${t('practice.mistakesButton', { n: nFallos })}`)),
    zona);

  decir(nFallos ? t('tutor.practiceMistakes', { n: nFallos }) : t('tutor.practiceIntro'));
}
