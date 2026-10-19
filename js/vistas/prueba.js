// La prueba de nivel (opcional), para quien ya sabe algo del idioma: recorre el curso por tramos de capítulos con
// preguntas sacadas de sus propios ejercicios (test, traducción y huecos, nunca los de solo oído). Dos aciertos pasan el
// tramo; dos fallos lo paran; con uno y uno decide una tercera. Al pararse propone empezar en el primer capítulo de ese
// tramo y lo apunta (progress.js, guardarInicioDePrueba): la lección que toca se busca desde ahí (vistas/lecciones.js).
// Las lecciones de antes siguen abiertas.

import { el, poner, barajar, enLinea } from '../dom.js';
import { t, tr } from '../i18n.js';
import { LANG } from '../curso.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { guardarInicioDePrueba } from '../progress.js';
import { agrupar } from './lecciones.js';
import { conCartel } from './carteles.js';

const TRAMOS = 6;
const TIPOS = ['test', 'traduccion', 'huecos'];

export function pintarPrueba(app, { resultados, capitulos, leccionCompleta }) {
  const grupos = agrupar(resultados, capitulos).filter(g => g.lecciones.some(r => r.leccion));
  const porTramo = Math.max(1, Math.ceil(grupos.length / TRAMOS));
  const tramos = [];
  for (let i = 0; i < grupos.length; i += porTramo) tramos.push(grupos.slice(i, i + porTramo));
  let vivo = true;
  const caja = el('section', { class: 'caja pn-caja', 'aria-live': 'polite' });
  poner(app, conCartel(el('section', { class: 'intro-vista' }, el('h1', {}, t('prueba.titulo'))), 'prueba'), caja);

  let tramo = 0;
  let cola = [];
  let aciertos = 0;
  let fallos = 0;

  function portada() {
    poner(caja,
      el('p', {}, t('prueba.intro', { n: tramos.length })),
      el('div', { class: 'botonera' },
        el('button', { type: 'button', class: 'boton boton-principal', onclick: () => { sonar('clic'); siguienteTramo(); } }, t('prueba.empezar')),
        el('a', { class: 'boton', href: '#/lecciones' }, t('prueba.volver'))));
    decir(t('prueba.tutora'));
  }

  /** Unas preguntas de lecciones al azar del tramo (cada lección se pide al abrirla, como siempre). */
  async function preguntasDe(grupo, cuantas) {
    const sacadas = [];
    for (const r of barajar(grupo.flatMap(g => g.lecciones.filter(x => x.leccion)))) {
      if (sacadas.length >= cuantas) break;
      const completa = await leccionCompleta(r);
      const ejercicios = (completa.leccion?.bloques ?? []).filter(b => TIPOS.includes(b.tipo) && !b.audio
        && b.opciones?.length >= 2 && b.opciones.some(o => o.correcta));
      if (ejercicios.length) sacadas.push(barajar(ejercicios)[0]);
    }
    return sacadas;
  }

  async function siguienteTramo() {
    if (tramo >= tramos.length) { final(tramos.length - 1); return; }
    poner(caja, el('p', { class: 'aprox' }, t('prueba.cargando')));
    cola = await preguntasDe(tramos[tramo], 3);
    if (!vivo) return;
    aciertos = 0;
    fallos = 0;
    if (!cola.length) { tramo += 1; siguienteTramo(); return; } // un tramo sin ejercicios no cuenta
    preguntar();
  }

  function preguntar() {
    if (aciertos >= 2 || (!cola.length && aciertos > fallos)) { tramo += 1; siguienteTramo(); return; }
    if (fallos >= 2 || !cola.length) { final(tramo); return; }
    const b = cola.shift();
    const enunciado = tr(b.pregunta) || (b.tipo === 'traduccion' ? t('prueba.queSignifica') : '');
    const nota = el('p', { class: 'pn-nota', role: 'status' });
    const seguir = el('button', { type: 'button', class: 'boton boton-principal', hidden: true, onclick: () => { sonar('clic'); preguntar(); } }, t('prueba.seguir'));
    const opciones = barajar(b.opciones);
    const botones = opciones.map(o => el('button', {
      type: 'button', class: 'pn-opcion',
      onclick: () => {
        botones.forEach((x, i) => { x.disabled = true; x.classList.toggle('pn-buena', opciones[i].correcta); });
        if (o.correcta) { aciertos += 1; sonar('bien'); nota.textContent = t('prueba.bien'); }
        else {
          fallos += 1;
          sonar('mal');
          botones[opciones.indexOf(o)].classList.add('pn-mala');
          nota.textContent = t('prueba.mal', { texto: tr(opciones.find(x => x.correcta).texto) });
        }
        seguir.hidden = false;
        seguir.focus({ preventScroll: true });
      },
    }, enLinea(tr(o.texto))));
    poner(caja,
      el('p', { class: 'pn-tramo' }, t('prueba.tramo', { n: tramo + 1, total: tramos.length }),
        el('span', { class: 'pn-barra', 'aria-hidden': 'true' }, el('span', { style: `--avance:${tramo / tramos.length}` }))),
      enunciado && el('h2', { class: 'pn-pregunta' }, enLinea(enunciado)),
      b.frase && el('p', { class: 'pn-frase', lang: LANG }, b.frase),
      el('div', { class: 'pn-opciones' }, botones),
      nota,
      seguir);
  }

  function final(k) {
    const grupo = tramos[k]?.[0];
    const primera = grupo?.lecciones.find(r => r.leccion)?.leccion;
    const desdeCero = k === 0 || !primera;
    const cap = grupo?.capitulo?.numero;
    const empezarEn = id => { guardarInicioDePrueba(id); sonar('pagina'); location.hash = '#/lecciones'; };
    poner(caja,
      el('h2', {}, t('prueba.finTitulo')),
      el('p', {}, desdeCero ? t('prueba.resultadoCero') : t('prueba.resultado', { cap, titulo: tr(grupo.capitulo?.titulo) || primera.titulo_es })),
      el('div', { class: 'botonera' },
        desdeCero ? null : el('button', { type: 'button', class: 'boton boton-principal', onclick: () => empezarEn(primera.id) }, t('prueba.empezarAhi', { cap })),
        el('button', { type: 'button', class: desdeCero ? 'boton boton-principal' : 'boton', onclick: () => empezarEn(null) }, t('prueba.desdeCero'))));
    sonar('fanfarria');
    decir(t('prueba.tutoraFin'), 'contenta');
  }

  portada();
  return () => { vivo = false; };
}
