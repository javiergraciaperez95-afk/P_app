// Pantalla «Práctica»: tandas sueltas de ejercicios de todo el curso.
// - Oído: ejercicios con audio al azar.
// - Fallos: los ejercicios cuya última respuesta fue un error.

import { el, poner, barajar } from '../dom.js';
import { crearEjercicio } from '../exercises.js';
import { ejerciciosFallados } from '../progress.js';
import { decir } from '../tutor.js';
import { sonar } from '../sonidos.js';

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
    const actualizar = () => { contador.textContent = `Hechos: ${hechos}/${lista.length}`; };
    poner(zona,
      el('h2', {}, titulo),
      contador,
      lista.map(({ leccion, bloque }, i) => el('div', { class: 'practica-item' },
        el('a', { class: 'aprox', href: `#/leccion/${leccion.id}` }, `Lección ${leccion.id} · ${leccion.titulo_da}`),
        crearEjercicio(bloque, leccion.id, i + 1, () => { hechos += 1; actualizar(); }))));
    actualizar();
    zona.querySelector('h2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const oido = () => tanda(
    barajar(todos.filter(x => x.bloque.audio)).slice(0, TANDA),
    '🔊 Práctica de oído',
    'No encuentro ejercicios con audio.');

  const fallos = () => {
    const fallados = new Set(ejerciciosFallados().map(f => `${f.idLeccion}|${f.idEjercicio}`));
    tanda(
      barajar(todos.filter(x => fallados.has(`${x.leccion.id}|${x.bloque.id}`))).slice(0, 15),
      '✘ Tus fallos',
      '¡No tienes ningún fallo pendiente! O no has hecho ejercicios todavía… o eres un genio. Me inclino por lo segundo.');
  };

  const nFallos = ejerciciosFallados().length;
  poner(app,
    el('section', { class: 'intro-vista' },
      el('h1', {}, 'Práctica'),
      el('p', {}, 'Tandas cortas de ejercicios de todo el curso. Lo que respondas aquí cuenta también en su lección.')),
    el('div', { class: 'botonera' },
      el('button', { type: 'button', class: 'boton boton-principal', onclick: oido }, `🔊 ${TANDA} ejercicios de oído al azar`),
      el('button', { type: 'button', class: 'boton', onclick: fallos }, `✘ Repasar mis fallos (${nFallos})`)),
    zona);

  decir(nFallos
    ? `Tienes ${nFallos} ${nFallos === 1 ? 'ejercicio fallado' : 'ejercicios fallados'}. ¿Les damos la revancha? O si prefieres, entrenamos el oído.`
    : 'Aquí entrenamos el oído con ejercicios sueltos de todo el curso. ¡Orejas suecas, allá vamos!');
}
