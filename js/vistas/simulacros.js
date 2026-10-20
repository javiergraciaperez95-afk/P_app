// Simulacros de examen (#/simulacros): PDF para descargar y practicar por tu cuenta. Paglot no los revisa, no los
// corrige y no los puntúa: se da el PDF y punto (cada uno trae las soluciones al final).
// Qué se puede descargar: las muestras, todo el mundo; Plus, un simulacro (el primero que elija, para siempre);
// Max, todos. Los PDF los hace _herramientas/pdf/simulacros.py y el índice está en simulacros/indice.json.
import { el, poner } from '../dom.js';
import { t, idioma } from '../i18n.js';
import { curso, nombreDelCurso } from '../curso.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { conCartel } from './carteles.js';
import { planActual, SIMULACROS_POR_PLAN } from '../planes.js';

const CLAVE_PLUS = () => `${curso.prefijo}-simulacro-plus`;
const leer = k => { try { return localStorage.getItem(k); } catch { return null; } };
const escribir = (k, v) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };

export async function pintarSimulacros(app) {
  poner(app, el('p', { class: 'cargando' }, t('html.cargando')));
  let indice = {};
  try { indice = await (await fetch('simulacros/indice.json', { cache: 'no-cache' })).json(); } catch { /* sin conexión */ }
  const delCurso = indice[curso.id] ?? {};
  // en la lengua de la interfaz si lo hay; si no, en la que haya
  const lengua = delCurso[idioma()] ? idioma() : Object.keys(delCurso)[0];
  const lista = lengua ? delCurso[lengua] : [];
  const plan = planActual();
  const elegido = leer(CLAVE_PLUS());

  const puede = s => s.muestra || plan === 'max' || (plan === 'plus' && (!elegido || elegido === s.id));

  const tarjeta = s => {
    const libre = puede(s);
    const enlace = `simulacros/${curso.id}/${lengua}/${s.archivo}`;
    const boton = libre
      ? el('a', {
        class: 'es-boton sm-descargar', href: enlace, download: `Paglot-${curso.id}-${s.id}.pdf`,
        onclick: () => {
          sonar('papel');
          if (!s.muestra && plan === 'plus' && !elegido) escribir(CLAVE_PLUS(), s.id);
          decir(t('sim.tutoraDescarga'), 'contenta');
        },
      }, t('sim.descargar'))
      : el('a', { class: 'es-boton es-boton-papel sm-descargar', href: '#/precios' }, t(plan === 'plus' ? 'sim.soloMax' : 'sim.conPlus'));
    return el('li', { class: `caja sm-tarjeta${libre ? '' : ' bloqueada'}` },
      el('span', { class: 'sm-nivel' }, s.nivel),
      el('div', { class: 'sm-textos' },
        el('h2', {}, t('sim.titulo', { curso: nombreDelCurso(idioma()), nivel: s.nivel })),
        el('p', {}, t(s.muestra ? 'sim.muestra' : 'sim.completo'))),
      boton);
  };

  poner(app,
    conCartel(el('section', { class: 'intro-vista' },
      el('h1', {}, t('sim.cabecera')),
      el('p', {}, t('sim.intro'))), 'repaso'),
    el('section', { class: 'caja sm-reglas' },
      el('p', {}, el('strong', {}, t('sim.sinNota'))),
      el('ul', {},
        el('li', {}, t('sim.regla.muestra')),
        el('li', {}, t('sim.regla.plus')),
        el('li', {}, t('sim.regla.max'))),
      plan === 'plus' && elegido ? el('p', { class: 'aprox' }, t('sim.yaElegido')) : null),
    lista.length
      ? el('ul', { class: 'sm-lista' }, lista.map(tarjeta))
      : el('p', { class: 'caja aprox' }, t('sim.ninguno')),
    el('p', { class: 'aprox sm-pronto' }, t('sim.pronto')));
  if (SIMULACROS_POR_PLAN[plan] === 0) decir(t('sim.tutoraGratis'));
}
