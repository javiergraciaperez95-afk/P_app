// El examen de la nacionalidad (CCSE): las 300 preguntas oficiales del Manual CCSE 2026 del Instituto Cervantes, en
// español como en el examen y con su traducción y explicación en vietnamita (datos/ccse.json).
//   #/ccse                la portada: cómo es el examen, lo dominado por tareas y lo que se puede hacer
//   #/ccse/practica[/n]   una ronda de 10 preguntas (de todas las tareas o de la n), con la corrección al momento
//   #/ccse/fallos         una ronda solo con las falladas la última vez
//   #/ccse/examen         un simulacro como el de verdad: 25 preguntas, 45 minutos, sin corrección hasta el final
//   #/ccse/lista          las 300, con su respuesta, para leerlas y buscar
// Lo respondido se guarda en js/examenes.js (y va a la nube con el resto).

import { el, poner } from '../dom.js';
import { t, idioma } from '../i18n.js';
import { sonar, pronunciar, callar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { ajuste, cambiarAjuste } from '../ajustes.js';
import { confeti } from '../fiesta.js';
import {
  estadoCcse, responderCcse, resumenCcse, rondaCcse, simulacroCcse, guardarSimulacroCcse, simulacrosCcse, respuestasCcse,
} from '../examenes.js';
import { banderaIdioma } from '../banderas-idioma.js';

const VERSION = new URL(import.meta.url).searchParams.get('v');
const conVersion = archivo => (VERSION && VERSION !== '__VERSION__' ? `${archivo}?v=${VERSION}` : archivo);
let carga = null;
/** El banco de preguntas (se pide una vez). */
export function cargarCcse() {
  carga ??= fetch(conVersion('datos/ccse.json')).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(e => { carga = null; throw e; });
  return carga;
}

const LETRAS = ['a', 'b', 'c'];
const conVietnamita = () => ajuste('ccseVi') ?? true;
const minutos = ms => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

/** El texto de la pregunta y sus opciones, para leerlo en voz alta. */
const enVozAlta = q => `${q.p.replace(/…$/, '...')} ${q.o.map((o, i) => `${LETRAS[i]}: ${o}`).join('. ')}`;

/** Pinta la pantalla del CCSE que toque según la ruta. Devuelve la función que la apaga. */
export async function pintarCcse(app, parametros = []) {
  let banco;
  try {
    banco = await cargarCcse();
  } catch {
    poner(app, el('section', { class: 'caja tarjeta-error' }, el('h1', {}, t('ph.ccse.sinDatos')),
      el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, t('app.reintentar'))));
    return null;
  }
  const [modo, extra] = parametros;
  if (modo === 'practica') return pintarRonda(app, banco, { tarea: extra ? Number(extra) : null });
  if (modo === 'fallos') return pintarRonda(app, banco, { soloFallos: true });
  if (modo === 'examen') return pintarExamen(app, banco);
  if (modo === 'lista') return pintarLista(app, banco, extra ? Number(extra) : 0);
  return pintarPortada(app, banco);
}

// ---------------------------------------------------------------------------
// La portada
// ---------------------------------------------------------------------------

function barra(parte, clase = '') {
  return el('span', { class: `ph-barra ${clase}`.trim(), 'aria-hidden': 'true' }, el('span', { style: `--avance:${Math.max(0, Math.min(1, parte))}` }));
}

function pintarPortada(app, banco) {
  const { preguntas, tareas, examen } = banco;
  const todo = resumenCcse(preguntas);
  const sims = simulacrosCcse();
  const ultimo = sims[0];
  const preparada = todo.dominadas / todo.total;

  const filaTarea = tarea => {
    const r = resumenCcse(preguntas.filter(q => q.t === tarea.n));
    return el('li', { class: 'cc-tarea' },
      el('span', { class: 'cc-tarea-num' }, tarea.n),
      el('span', { class: 'cc-tarea-textos' },
        el('span', { class: 'cc-tarea-nombre' }, idioma() === 'es' ? tarea.es : tarea.vi),
        el('span', { class: 'cc-tarea-dato' }, t('ph.ccse.tareaDato', { dominadas: r.dominadas, total: r.total, examen: tarea.examen })),
        barra(r.dominadas / r.total)),
      el('a', { class: 'boton boton-mini', href: `#/ccse/practica/${tarea.n}`, 'data-sonido': 'pagina' }, t('ph.ccse.practicar')));
  };

  const vi = el('input', { type: 'checkbox', id: 'cc-vi' });
  vi.checked = conVietnamita();
  vi.addEventListener('change', () => { cambiarAjuste('ccseVi', vi.checked); sonar('interruptor'); });

  poner(app,
    el('section', { class: 'ph-intro ph-intro-ccse' },
      el('span', { class: 'ph-intro-insignia', 'aria-hidden': 'true' }, '🏛️'),
      el('div', {},
        el('h1', {}, t('ph.ccse.titulo')),
        el('p', {}, t('ph.ccse.intro')))),
    el('section', { class: 'caja cc-examen' },
      el('h2', {}, t('ph.ccse.comoEs')),
      el('ul', { class: 'ph-datos' },
        el('li', {}, el('b', {}, String(examen.preguntas)), el('span', {}, t('ph.ccse.preguntas'))),
        el('li', {}, el('b', {}, String(examen.minutos)), el('span', {}, t('ph.ccse.minutos'))),
        el('li', {}, el('b', {}, `${examen.aprobado}/${examen.preguntas}`), el('span', {}, t('ph.ccse.paraAprobar')))),
      el('p', { class: 'aprox' }, t('ph.ccse.comoEsTexto'))),
    el('section', { class: 'caja cc-progreso' },
      el('h2', {}, t('ph.ccse.tuProgreso')),
      el('p', { class: 'cc-total' }, el('b', {}, `${todo.dominadas}/${todo.total}`), ' ', t('ph.ccse.dominadas'),
        todo.aprendiendo ? ` · ${t('ph.ccse.aprendiendo', { n: todo.aprendiendo })}` : ''),
      barra(preparada, 'ph-barra-grande'),
      el('p', { class: 'aprox' }, t(preparada >= 0.9 ? 'ph.ccse.consejoListo' : preparada >= 0.5 ? 'ph.ccse.consejoMitad' : 'ph.ccse.consejoEmpezar')),
      el('ol', { class: 'cc-tareas' }, tareas.map(filaTarea))),
    el('section', { class: 'cc-acciones' },
      accion('#/ccse/practica', '🎯', t('ph.ccse.ronda'), t('ph.ccse.rondaTexto'), 'principal'),
      accion('#/ccse/examen', '⏱️', t('ph.ccse.simulacro'), ultimo ? t('ph.ccse.ultimoSimulacro', { n: ultimo.aciertos, total: ultimo.total }) : t('ph.ccse.simulacroTexto')),
      accion('#/ccse/fallos', '🔁', t('ph.ccse.fallos'), todo.falladas ? t('ph.ccse.fallosN', { n: todo.falladas }) : t('ph.ccse.fallosNinguno'), todo.falladas ? '' : 'apagada'),
      accion('#/ccse/lista', '📖', t('ph.ccse.lista'), t('ph.ccse.listaTexto'))),
    sims.length ? el('section', { class: 'caja cc-historial' },
      el('h2', {}, t('ph.ccse.historial')),
      el('ol', { class: 'cc-sims' }, sims.slice(0, 8).map(s => el('li', { class: s.aciertos >= examen.aprobado ? 'apto' : 'no-apto' },
        el('span', {}, new Date(s.t).toLocaleDateString(idioma() === 'es' ? 'es-ES' : 'vi-VN', { day: 'numeric', month: 'short' })),
        el('b', {}, `${s.aciertos}/${s.total}`),
        el('span', {}, s.aciertos >= examen.aprobado ? t('ph.ccse.apto') : t('ph.ccse.noApto')))))) : null,
    el('section', { class: 'caja cc-ajustes' },
      el('label', { class: 'campo-casilla', for: 'cc-vi' }, vi, el('span', {}, t('ph.ccse.verVietnamita'))),
      el('p', { class: 'aprox cc-fuente' }, t('ph.ccse.fuente', { fuente: banco.fuente }))));

  decir(todo.dominadas === 0 ? t('ph.ccse.tutoraEmpezar') : t('ph.ccse.tutora', { n: todo.dominadas, total: todo.total }));
  return null;
}

function accion(href, icono, titulo, texto, clase = '') {
  return el('a', { class: `ph-accion ${clase}`.trim(), href, 'data-sonido': 'pagina' },
    el('span', { class: 'ph-accion-icono', 'aria-hidden': 'true' }, icono),
    el('span', { class: 'ph-accion-titulo' }, titulo),
    el('span', { class: 'ph-accion-texto' }, texto));
}

// ---------------------------------------------------------------------------
// Una pregunta (la usan la ronda y el simulacro)
// ---------------------------------------------------------------------------

/**
 * La tarjeta de una pregunta. alElegir(i) al tocar una opción. Con «corregir», al elegir se marca la buena y la
 * elegida, y sale la explicación. Devuelve { nodo, marcar(i) }.
 */
function tarjetaPregunta(q, { numero, total, alElegir, corregir = true, elegida = null }) {
  let traducida = conVietnamita();
  const tareaTexto = el('span', { class: 'cc-q-tarea' }, t('ph.ccse.tareaN', { n: q.t }));
  const enunciado = el('p', { class: 'cc-q-es', lang: 'es' }, q.p);
  const traduccion = el('p', { class: 'cc-q-vi', lang: 'vi' }, q.pv);
  const opciones = q.o.map((texto, i) => el('button', { type: 'button', class: 'cc-opcion', 'data-sonido': 'nada' },
    el('span', { class: 'cc-letra' }, LETRAS[i]),
    el('span', { class: 'cc-opcion-textos' },
      el('span', { class: 'cc-opcion-es', lang: 'es' }, texto),
      el('span', { class: 'cc-opcion-vi', lang: 'vi' }, q.ov[i]))));
  const explicacion = el('div', { class: 'cc-explicacion', hidden: true, 'aria-live': 'polite' });
  const botonVi = el('button', { type: 'button', class: 'boton boton-mini cc-dictar', 'aria-pressed': String(traducida), 'data-sonido': 'interruptor' }, banderaIdioma('vi'), ' ', t('ph.ccse.traducir'));
  const botonOir = el('button', { type: 'button', class: 'boton boton-mini con-voz', 'data-sonido': 'nada' }, '🔊 ', t('comun.escuchar'));
  const nodo = el('article', { class: `cc-pregunta${traducida ? ' con-vi' : ''}` },
    el('header', { class: 'cc-q-cabeza' }, el('span', { class: 'cc-q-num' }, `${numero}/${total}`), tareaTexto, el('span', { class: 'cc-q-botones' }, botonOir, botonVi)),
    enunciado, traduccion,
    el('div', { class: 'cc-opciones', role: 'group', 'aria-label': t('ph.ccse.opciones') }, opciones),
    explicacion);
  botonVi.addEventListener('click', () => {
    traducida = !traducida;
    nodo.classList.toggle('con-vi', traducida);
    botonVi.setAttribute('aria-pressed', String(traducida));
  });
  botonOir.addEventListener('click', () => pronunciar(enVozAlta(q)));

  let respondida = false;
  const marcar = i => {
    opciones.forEach((b, k) => b.classList.toggle('elegida', k === i));
    if (!corregir) return;
    respondida = true;
    const bien = i === q.c;
    opciones.forEach((b, k) => {
      b.disabled = true;
      b.classList.toggle('buena', k === q.c);
      b.classList.toggle('mala', k === i && !bien);
    });
    poner(explicacion,
      el('p', { class: `cc-veredicto ${bien ? 'bien' : 'mal'}` }, bien ? `✔ ${t('ph.ccse.bien')}` : `✘ ${t('ph.ccse.mal', { letra: LETRAS[q.c] })}`),
      el('p', { class: 'cc-x', lang: 'vi' }, '💡 ', q.x));
    explicacion.hidden = false;
  };
  opciones.forEach((b, i) => b.addEventListener('click', () => { if (!respondida) alElegir(i); }));
  if (elegida !== null) marcar(elegida);
  return { nodo, marcar };
}

// ---------------------------------------------------------------------------
// La ronda de práctica (corrección al momento)
// ---------------------------------------------------------------------------

function pintarRonda(app, banco, { tarea = null, soloFallos = false }) {
  const respuestas = respuestasCcse();
  const base = banco.preguntas.filter(q => (tarea ? q.t === tarea : true) && (!soloFallos || respuestas[q.id]?.ult === false));
  if (!base.length) {
    poner(app, el('section', { class: 'caja ph-vacio' },
      el('p', { class: 'ph-vacio-icono', 'aria-hidden': 'true' }, '🎉'),
      el('h1', {}, t('ph.ccse.fallosVacio')),
      el('p', {}, t('ph.ccse.fallosVacioTexto')),
      el('a', { class: 'boton boton-principal', href: '#/ccse' }, t('ph.ccse.volver'))));
    decir(t('ph.ccse.fallosVacio'), 'contenta');
    return null;
  }
  const ronda = soloFallos ? rondaCcse(base, Math.min(15, base.length)) : rondaCcse(base, 10);
  let i = 0;
  let aciertos = 0;
  const falladas = [];
  const zona = el('div', { class: 'cc-zona' });
  const avance = el('span', { class: 'ph-barra cc-avance', 'aria-hidden': 'true' }, el('span'));
  const titulo = tarea ? t('ph.ccse.rondaTarea', { n: tarea }) : soloFallos ? t('ph.ccse.fallos') : t('ph.ccse.ronda');

  const siguiente = el('button', { type: 'button', class: 'boton boton-principal cc-siguiente', hidden: true, 'data-sonido': 'flecha' }, t('ph.ccse.siguiente'), ' ▶');
  siguiente.addEventListener('click', () => { i += 1; if (i < ronda.length) mostrar(); else final(); });

  function mostrar() {
    callar();
    const q = ronda[i];
    avance.firstChild.style.setProperty('--avance', String(i / ronda.length));
    siguiente.hidden = true;
    const tarjeta = tarjetaPregunta(q, {
      numero: i + 1, total: ronda.length,
      alElegir: k => {
        const bien = k === q.c;
        responderCcse(q.id, bien);
        tarjeta.marcar(k);
        if (bien) { aciertos += 1; sonar('bien'); } else { falladas.push(q); sonar('mal'); }
        const e = estadoCcse(q.id);
        if (bien && e.clave === 'dominada' && e.racha === 2) decir(t('ph.ccse.dominada'), 'contenta');
        siguiente.hidden = false;
        siguiente.focus({ preventScroll: true });
        siguiente.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      },
    });
    poner(zona, tarjeta.nodo, siguiente);
  }

  function final() {
    avance.firstChild.style.setProperty('--avance', '1');
    const perfecta = aciertos === ronda.length;
    poner(zona, el('section', { class: 'caja cc-final' },
      el('p', { class: 'cc-final-nota' }, el('b', {}, `${aciertos}/${ronda.length}`)),
      el('h2', {}, t(perfecta ? 'ph.ccse.finPerfecto' : aciertos >= ronda.length * 0.6 ? 'ph.ccse.finBien' : 'ph.ccse.finFlojo')),
      falladas.length ? el('div', {},
        el('h3', {}, t('ph.ccse.repasaEstas')),
        el('ul', { class: 'cc-repaso' }, falladas.map(q => el('li', {},
          el('p', { lang: 'es' }, q.p, ' → ', el('b', {}, q.o[q.c])),
          conVietnamita() ? el('p', { class: 'aprox', lang: 'vi' }, q.ov[q.c] && `${q.pv} → ${q.ov[q.c]}`) : null)))) : null,
      el('p', { class: 'botonera' },
        el('button', { type: 'button', class: 'boton boton-principal', onclick: () => pintarRonda(app, banco, { tarea, soloFallos }) }, t('ph.ccse.otraRonda')),
        el('a', { class: 'boton', href: '#/ccse' }, t('ph.ccse.volver')))));
    if (perfecta) { sonar('fanfarria'); confeti(zona.querySelector('.cc-final-nota'), 30); }
    window.dispatchEvent(new Event('ronda-terminada')); // (js/avisos.js ofrece el aviso diario la primera vez)
    decir(t(perfecta ? 'ph.ccse.tutoraPerfecta' : 'ph.ccse.tutoraFin', { n: aciertos, total: ronda.length }), perfecta ? 'contenta' : 'normal');
  }

  poner(app,
    el('header', { class: 'cc-barra-sup' },
      el('a', { class: 'boton boton-mini', href: '#/ccse' }, '◀ ', t('ph.ccse.titulo')),
      el('h1', { class: 'cc-ronda-titulo' }, titulo), avance),
    zona);
  mostrar();
  return () => callar();
}

// ---------------------------------------------------------------------------
// El simulacro: 25 preguntas en 45 minutos, sin corrección hasta entregar
// ---------------------------------------------------------------------------

function pintarExamen(app, banco) {
  const { examen, tareas } = banco;
  const preguntas = simulacroCcse(banco.preguntas, tareas);
  const elegidas = new Array(preguntas.length).fill(null);
  const fin = Date.now() + examen.minutos * 60 * 1000;
  let i = 0;
  let entregado = false;

  const reloj = el('span', { class: 'cc-reloj', role: 'timer' }, minutos(examen.minutos * 60000));
  const zona = el('div', { class: 'cc-zona' });
  const mapa = el('ol', { class: 'cc-mapa', 'aria-label': t('ph.ccse.mapa') });
  const raiz = el('div', { class: 'cc-examen-en-curso', 'data-examen-en-curso': '' });

  const intervalo = setInterval(() => {
    const queda = fin - Date.now();
    if (queda <= 0) { reloj.textContent = '00:00'; entregar(true); return; }
    reloj.textContent = minutos(queda);
    reloj.classList.toggle('poco', queda < 5 * 60000);
  }, 500);

  function pintarMapa() {
    poner(mapa, preguntas.map((q, k) => el('li', {}, el('button', {
      type: 'button',
      class: `cc-mapa-num${elegidas[k] !== null ? ' hecha' : ''}${k === i ? ' actual' : ''}`,
      'aria-label': t('ph.ccse.irA', { n: k + 1 }),
      'data-sonido': 'nada',
      onclick: () => { i = k; mostrar(); },
    }, String(k + 1)))));
  }

  function mostrar() {
    callar();
    const q = preguntas[i];
    const tarjeta = tarjetaPregunta(q, {
      numero: i + 1, total: preguntas.length, corregir: false, elegida: elegidas[i],
      alElegir: k => { elegidas[i] = k; tarjeta.marcar(k); sonar('marcar'); pintarMapa(); },
    });
    const hechas = elegidas.filter(x => x !== null).length;
    poner(zona, tarjeta.nodo,
      el('div', { class: 'cc-nav' },
        el('button', { type: 'button', class: 'boton', disabled: i === 0, onclick: () => { i -= 1; mostrar(); } }, '◀ ', t('ph.ccse.anterior')),
        i < preguntas.length - 1
          ? el('button', { type: 'button', class: 'boton boton-principal', onclick: () => { i += 1; mostrar(); } }, t('ph.ccse.siguiente'), ' ▶')
          : el('button', { type: 'button', class: 'boton boton-principal', onclick: () => pedirEntrega() }, t('ph.ccse.entregar'))),
      el('p', { class: 'aprox cc-hechas' }, t('ph.ccse.hechas', { n: hechas, total: preguntas.length })));
    pintarMapa();
  }

  async function pedirEntrega() {
    const sinHacer = elegidas.filter(x => x === null).length;
    const { confirmar } = await import('../movil.js');
    if (await confirmar(sinHacer ? t('ph.ccse.entregarSinHacer', { n: sinHacer }) : t('ph.ccse.entregarSeguro'), { si: t('ph.ccse.entregar'), no: t('ph.ccse.seguir') })) entregar(false);
  }

  function entregar(porTiempo) {
    if (entregado) return;
    entregado = true;
    clearInterval(intervalo);
    callar();
    raiz.removeAttribute('data-examen-en-curso');
    const porTarea = {};
    let aciertos = 0;
    preguntas.forEach((q, k) => {
      const bien = elegidas[k] === q.c;
      if (bien) aciertos += 1;
      porTarea[q.t] ??= [0, 0];
      porTarea[q.t][1] += 1;
      if (bien) porTarea[q.t][0] += 1;
      if (elegidas[k] !== null) responderCcse(q.id, bien);
    });
    guardarSimulacroCcse({ aciertos, total: preguntas.length, porTarea });
    const apto = aciertos >= examen.aprobado;
    poner(raiz,
      el('section', { class: `caja cc-resultado ${apto ? 'apto' : 'no-apto'}` },
        porTiempo ? el('p', { class: 'aprox' }, t('ph.ccse.seAcaboElTiempo')) : null,
        el('p', { class: 'cc-final-nota' }, el('b', {}, `${aciertos}/${preguntas.length}`)),
        el('h1', {}, apto ? t('ph.ccse.resultadoApto') : t('ph.ccse.resultadoNoApto', { faltan: examen.aprobado - aciertos })),
        el('ul', { class: 'cc-por-tarea' }, tareas.map(ta => {
          const [b, de] = porTarea[ta.n] ?? [0, 0];
          return el('li', {}, el('span', {}, t('ph.ccse.tareaN', { n: ta.n })), barra(de ? b / de : 0), el('b', {}, `${b}/${de}`));
        })),
        el('p', { class: 'botonera' },
          el('button', { type: 'button', class: 'boton boton-principal', onclick: () => pintarExamen(app, banco) }, t('ph.ccse.otroSimulacro')),
          el('a', { class: 'boton', href: '#/ccse' }, t('ph.ccse.volver')))),
      el('section', { class: 'caja cc-revision' },
        el('h2', {}, t('ph.ccse.revision')),
        el('ol', { class: 'cc-revision-lista' }, preguntas.map((q, k) => {
          const bien = elegidas[k] === q.c;
          return el('li', { class: bien ? 'bien' : 'mal' },
            el('p', { lang: 'es' }, el('span', { class: 'cc-marca', 'aria-hidden': 'true' }, bien ? '✔' : '✘'), ' ', q.p),
            el('p', { class: 'cc-rev-respuesta' }, elegidas[k] === null ? t('ph.ccse.sinResponder') : !bien ? el('s', { lang: 'es' }, q.o[elegidas[k]]) : null,
              !bien ? ' → ' : '', el('b', { lang: 'es' }, q.o[q.c])),
            conVietnamita() ? el('p', { class: 'aprox', lang: 'vi' }, '💡 ', q.x) : null);
        }))));
    if (apto) { sonar('fanfarria'); confeti(raiz.querySelector('.cc-final-nota'), 40); } else sonar('fin');
    window.dispatchEvent(new Event('ronda-terminada'));
    decir(apto ? t('ph.ccse.tutoraApto', { n: aciertos }) : t('ph.ccse.tutoraNoApto', { n: aciertos }), apto ? 'contenta' : 'pensando');
    window.scrollTo(0, 0);
  }

  poner(raiz,
    el('header', { class: 'cc-barra-sup' },
      el('a', { class: 'boton boton-mini', href: '#/ccse' }, '✕'),
      el('h1', { class: 'cc-ronda-titulo' }, t('ph.ccse.simulacro')),
      reloj),
    mapa,
    zona);
  poner(app, raiz);
  mostrar();
  decir(t('ph.ccse.tutoraSimulacro'), 'pensando');
  return () => { clearInterval(intervalo); callar(); };
}

// ---------------------------------------------------------------------------
// Las 300 preguntas, para leer y buscar
// ---------------------------------------------------------------------------

function pintarLista(app, banco, tareaInicial) {
  let tarea = tareaInicial;
  let busqueda = '';
  const lista = el('ol', { class: 'cc-lista' });
  const sinTildes = x => String(x ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const pintar = () => {
    const q = sinTildes(busqueda.trim());
    const visibles = banco.preguntas.filter(p => (!tarea || p.t === tarea)
      && (!q || sinTildes(`${p.p} ${p.o.join(' ')} ${p.pv} ${p.ov.join(' ')}`).includes(q)));
    poner(lista, visibles.length ? visibles.map(p => {
      const e = estadoCcse(p.id);
      const detalle = el('div', { class: 'cc-lista-detalle', hidden: true },
        el('ol', { class: 'cc-lista-opciones', type: 'a' }, p.o.map((o, i) => el('li', { class: i === p.c ? 'buena' : '' },
          el('span', { lang: 'es' }, o), conVietnamita() ? el('small', { lang: 'vi' }, ` · ${p.ov[i]}`) : null))),
        el('p', { class: 'aprox', lang: 'vi' }, '💡 ', p.x),
        el('button', { type: 'button', class: 'boton boton-mini con-voz', onclick: () => pronunciar(enVozAlta(p)) }, '🔊 ', t('comun.escuchar')));
      const cara = el('button', { type: 'button', class: 'cc-lista-cara', 'aria-expanded': 'false', 'data-sonido': 'nada' },
        el('span', { class: `cc-punto ${e.clave}`, title: t(`ph.ccse.estado.${e.clave}`) }),
        el('span', { class: 'cc-lista-textos' },
          el('span', { lang: 'es' }, p.p),
          conVietnamita() ? el('small', { lang: 'vi' }, p.pv) : null));
      cara.addEventListener('click', () => {
        const abrir = detalle.hidden;
        detalle.hidden = !abrir;
        cara.setAttribute('aria-expanded', String(abrir));
        sonar(abrir ? 'abrir' : 'cerrar');
      });
      return el('li', { class: 'cc-lista-item' }, cara, detalle);
    }) : el('li', { class: 'aprox' }, t('ph.ccse.nadaEncontrado')));
  };
  const buscador = el('input', { type: 'search', class: 'cc-buscar', placeholder: t('ph.ccse.buscar'), 'aria-label': t('ph.ccse.buscar'), autocomplete: 'off' });
  buscador.addEventListener('input', () => { busqueda = buscador.value; pintar(); });
  const filtros = el('div', { class: 'filtros', role: 'group', 'aria-label': t('ph.ccse.filtrar') },
    [0, 1, 2, 3, 4, 5].map(n => {
      const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': String(n === tarea) }, n ? t('ph.ccse.tareaN', { n }) : t('ph.ccse.todas'));
      b.addEventListener('click', () => {
        tarea = n;
        filtros.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        pintar();
      });
      return b;
    }));
  poner(app,
    el('header', { class: 'cc-barra-sup' },
      el('a', { class: 'boton boton-mini', href: '#/ccse' }, '◀ ', t('ph.ccse.titulo')),
      el('h1', { class: 'cc-ronda-titulo' }, t('ph.ccse.lista'))),
    el('div', { class: 'caja cc-lista-herramientas' }, buscador, filtros),
    lista);
  pintar();
  return null;
}

/** Una pregunta al azar del día (la misma todo el día): para el inicio y los avisos. */
export async function preguntaDelDia() {
  const { preguntas } = await cargarCcse();
  const semilla = [...new Date().toLocaleDateString('sv')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11);
  return preguntas[semilla % preguntas.length];
}
