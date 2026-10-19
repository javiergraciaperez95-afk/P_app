// Pantalla «Práctica»: tandas sueltas de ejercicios de todo el curso.
// - Oído: ejercicios con audio al azar.
// - Fallos: los ejercicios cuya última respuesta fue un error.

import { el, poner, barajar } from '../dom.js';
import { t } from '../i18n.js';
import { crearEjercicio } from '../exercises.js';
import { ejerciciosFallados } from '../progress.js';
import { decir } from '../tutor.js';
import { sonar, hayVoz } from '../sonidos.js';
import { LANG } from '../curso.js';
import { conCartel } from './carteles.js';

const TANDA = 10;

/** Los ejercicios de esas lecciones (ya completas). */
function ejerciciosDe(resultados) {
  const lista = [];
  for (const r of resultados) {
    if (!r.leccion) continue;
    for (const b of r.leccion.bloques) {
      if (b.id && !b.error) lista.push({ leccion: r.leccion, bloque: b });
    }
  }
  return lista;
}

/**
 * resultados: la lista de lecciones del curso (con índice, solo el resumen de cada una).
 * leccionCompleta: carga una lección entera; solo se piden las que hacen falta para la tanda.
 */
export function pintarPractica(app, { resultados, leccionCompleta }) {
  const validas = resultados.filter(r => r.leccion);
  const cargar = lista => Promise.all(lista.map(leccionCompleta));
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
    const actualizar = () => { contador.textContent = t('practica.hechos', { n: hechos, total: lista.length }); };
    poner(zona,
      el('h2', {}, titulo),
      contador,
      lista.map(({ leccion, bloque }, i) => el('div', { class: 'practica-item' },
        el('a', { class: 'aprox', href: `#/leccion/${leccion.id}` }, `${t('leccion.numero', { id: leccion.numero_curso })} · `, el('span', { lang: LANG }, leccion.titulo_es)),
        crearEjercicio(bloque, leccion.id, i + 1, () => { hechos += 1; actualizar(); }))));
    actualizar();
    zona.querySelector('h2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Con índice se sabe qué lecciones tienen audio: se cargan unas cuantas al azar, no todas.
  const oido = async () => {
    const conAudio = validas.filter(r => r.audio ?? true);
    const todos = ejerciciosDe(await cargar(barajar(conAudio).slice(0, TANDA)));
    tanda(
      barajar(todos.filter(x => x.bloque.audio)).slice(0, TANDA),
      t('practica.oidoTitulo'),
      t('practica.sinAudio'));
  };

  const fallos = async () => {
    const fallados = new Set(ejerciciosFallados().map(f => `${f.idLeccion}|${f.idEjercicio}`));
    const conFallos = new Set(ejerciciosFallados().map(f => f.idLeccion));
    const todos = ejerciciosDe(await cargar(validas.filter(r => conFallos.has(r.id))));
    tanda(
      barajar(todos.filter(x => fallados.has(`${x.leccion.id}|${x.bloque.id}`) && (hayVoz() || !x.bloque.soloOido))).slice(0, 15),
      t('practica.fallosTitulo'),
      t('practica.sinFallos'));
  };

  const nFallos = ejerciciosFallados().length;
  poner(app,
    conCartel(el('section', { class: 'intro-vista' },
      el('h1', {}, t('menu.practica')),
      el('p', {}, t('practica.intro'))), 'practica'),
    el('div', { class: 'botonera' },
      el('button', { type: 'button', class: 'boton boton-principal con-voz', onclick: oido }, t('practica.botonOido', { n: TANDA })),
      el('button', { type: 'button', class: 'boton', onclick: fallos }, t('practica.botonFallos', { n: nFallos }))),
    zona);

  decir(nFallos ? t('practica.tutoraFallos', { n: nFallos }) : t('practica.tutora'));
}
