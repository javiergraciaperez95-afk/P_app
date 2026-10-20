// El inicio de Phuong App: Lucía saluda y dice qué toca hoy. Arriba, la meta (la nacionalidad española: el DELE A2 y
// el CCSE) con lo que se lleva de cada uno; después, el plan del día, la pregunta del CCSE del día y los atajos.
// La primera vez, Lucía se presenta y pregunta el nombre.

import { el, poner } from '../dom.js';
import { t, idioma, locale } from '../i18n.js';
import { icono } from '../iconos.js';
import { crearSprite } from '../tutor-sprite.js';
import { sonar } from '../sonidos.js';
import { decir } from '../tutor.js';
import { confeti } from '../fiesta.js';
import { nombre, cambiarNombre, racha, actividadDeHoy, resumenLeccion, hayProgreso } from '../progress.js';
import { pendientesDeHoy } from '../cabecera.js';
import { agrupar } from './lecciones.js';
import { cargarCcse } from './ccse.js';
import { cargarDele, notasDe } from './dele.js';
import { resumenCcse, simulacrosCcse, examenesDeHoy, responderCcse, estadoCcse } from '../examenes.js';

const CLAVE_PRESENTADA = 'phuong-presentada';
const RONDA_CCSE = 10;

/** La lección que toca (la primera sin terminar en el orden del curso) y lo hecho del A1–A2. */
function estadoDelCurso(contenido) {
  const enOrden = agrupar(contenido.resultados, contenido.capitulos).flatMap(g => g.lecciones).filter(r => r.leccion);
  const terminada = r => resumenLeccion(r.leccion.id, r.leccion.idsEjercicios).terminada;
  const toca = enOrden.find(r => !terminada(r))?.leccion ?? null;
  const a2 = enOrden.filter(r => r.leccion.capitulo <= 10);
  return { toca, hechasA2: a2.filter(terminada).length, totalA2: a2.length };
}

function anillo(parte, texto) {
  const p = Math.max(0, Math.min(1, parte));
  return el('span', { class: 'ph-anillo', style: `--avance:${p}`, role: 'img', 'aria-label': texto },
    el('span', { class: 'ph-anillo-cifra' }, `${Math.round(p * 100)}%`));
}

export function pintarInicio(app, contenido) {
  const apagar = [];
  const quien = nombre().trim();
  const hoy = actividadDeHoy();
  const examenesHoy = examenesDeHoy();
  const dias = racha();
  const pendientes = pendientesDeHoy();
  const curso = estadoDelCurso(contenido);

  // ----- Lucía saluda -----
  const canvas = el('canvas', { class: 'ph-lienzo', width: 48, height: 64 });
  const sprite = crearSprite(canvas);
  apagar.push(() => sprite.parar?.());
  setTimeout(() => sprite.gesto?.('saludar'), 500);
  const hora = new Date().getHours();
  const saludo = t(hora < 12 ? 'ph.inicio.buenosDias' : hora < 20 ? 'ph.inicio.buenasTardes' : 'ph.inicio.buenasNoches');
  const fecha = new Date().toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' });
  const tutora = el('button', { type: 'button', class: 'ph-tutora-grande', 'aria-label': t('tutora.tocar'), 'data-sonido': 'cosquillas' }, canvas);
  tutora.addEventListener('click', () => { sprite.reaccionar?.('cosquillas'); sprite.gesto?.('firma'); decir(t('ph.inicio.animo'), 'contenta'); });

  const hola = el('section', { class: 'ph-hola' },
    tutora,
    el('div', { class: 'ph-hola-textos' },
      el('p', { class: 'ph-hola-fecha' }, fecha),
      el('h1', {}, quien ? t('ph.inicio.hola', { nombre: quien, saludo }) : t('ph.inicio.holaSinNombre', { saludo })),
      el('p', { class: 'ph-hola-datos' },
        el('span', { class: `ph-racha${dias ? ' viva' : ''}` }, icono('llama'), ' ', t('ph.inicio.racha', { n: dias })),
        el('span', {}, icono('repaso'), ' ', pendientes ? t('ph.inicio.tarjetas', { n: pendientes }) : t('ph.inicio.alDia')))));

  // ----- La meta: la nacionalidad -----
  const meta = el('section', { class: 'caja ph-meta' },
    el('h2', {}, '🇪🇸 ', t('ph.inicio.meta')),
    el('p', { class: 'aprox' }, t('ph.inicio.metaTexto')));
  const filaDele = el('a', { class: 'ph-meta-fila', href: '#/dele', 'data-sonido': 'pagina' });
  const filaCcse = el('a', { class: 'ph-meta-fila', href: '#/ccse', 'data-sonido': 'pagina' });
  meta.append(filaDele, filaCcse);
  const pintarDele = (examen = null) => {
    const n = examen ? notasDe(examen) : null;
    const parte = curso.totalA2 ? curso.hechasA2 / curso.totalA2 : 0;
    poner(filaDele, anillo(parte, t('ph.inicio.deleAria')),
      el('span', { class: 'ph-meta-textos' },
        el('b', {}, 'DELE A2'),
        el('span', {}, t('ph.inicio.deleLecciones', { hechas: curso.hechasA2, total: curso.totalA2 })),
        el('small', {}, n?.apto === true ? `✔ ${t('ph.inicio.deleSimulacroApto')}` : n && (n.g1 !== null || n.g2 !== null) ? t('ph.inicio.deleSimulacroMedias') : t('ph.inicio.deleSimulacroNada'))),
      el('span', { class: 'ph-meta-flecha', 'aria-hidden': 'true' }, '▶'));
  };
  pintarDele();
  cargarDele().then(d => { if (filaDele.isConnected) pintarDele(d.examenes[0]); }).catch(() => {});
  poner(filaCcse, anillo(0, ''), el('span', { class: 'ph-meta-textos' }, el('b', {}, 'CCSE'), el('span', {}, '…')));

  // ----- El plan de hoy -----
  const leccionHecha = (hoy.lecciones ?? 0) >= 1;
  const objetivoRepaso = Math.min(10, (hoy.repasos ?? 0) + pendientes);
  const repasoHecho = objetivoRepaso === 0 || (hoy.repasos ?? 0) >= objetivoRepaso;
  const ccseHecho = (examenesHoy.ccse ?? 0) >= RONDA_CCSE;
  const tarea = (hecha, emoji, titulo, detalle, href) => el('li', {},
    el('a', { class: `ph-hoy-tarea${hecha ? ' hecha' : ''}`, href, 'data-sonido': hecha ? 'moneda' : 'flecha' },
      el('span', { class: 'ph-hoy-casilla', 'aria-hidden': 'true' }, hecha ? '✔' : emoji),
      el('span', { class: 'ph-hoy-textos' }, el('b', {}, titulo), el('small', {}, detalle)),
      el('span', { class: 'ph-meta-flecha', 'aria-hidden': 'true' }, '▶')));
  const todas = leccionHecha && repasoHecho && ccseHecho;
  const plan = el('section', { class: `caja ph-hoy${todas ? ' completo' : ''}` },
    el('h2', {}, todas ? `🎉 ${t('ph.inicio.hoyCompleto')}` : t('ph.inicio.hoy')),
    el('ol', { class: 'ph-hoy-lista' },
      tarea(leccionHecha, '📘', t('ph.inicio.tareaLeccion'),
        curso.toca ? t('ph.inicio.tareaLeccionDetalle', { n: curso.toca.numero_curso, titulo: curso.toca.titulo_es }) : t('ph.inicio.cursoTerminado'),
        curso.toca ? `#/leccion/${curso.toca.id}` : '#/lecciones'),
      tarea(repasoHecho, '🃏', t('ph.inicio.tareaRepaso'),
        objetivoRepaso ? t('ph.inicio.tareaRepasoDetalle', { hechas: Math.min(hoy.repasos ?? 0, objetivoRepaso), total: objetivoRepaso }) : t('ph.inicio.tareaRepasoNada'), '#/repaso'),
      tarea(ccseHecho, '🏛️', t('ph.inicio.tareaCcse', { n: RONDA_CCSE }),
        t('ph.inicio.tareaCcseDetalle', { hechas: Math.min(examenesHoy.ccse ?? 0, RONDA_CCSE), total: RONDA_CCSE }), '#/ccse/practica')));
  if (todas) {
    const marca = new Date().toLocaleDateString('sv');
    let ya = null;
    try { ya = localStorage.getItem('phuong-dia-celebrado'); } catch { /* sin almacenamiento */ }
    if (ya !== marca) {
      try { localStorage.setItem('phuong-dia-celebrado', marca); } catch { /* sin almacenamiento */ }
      setTimeout(() => { sonar('fanfarria'); confeti(plan.querySelector('h2'), 30); }, 600);
    }
  }

  // ----- La pregunta del CCSE del día -----
  const preguntaDia = el('section', { class: 'caja ph-pregunta-dia', hidden: true });

  // ----- Los atajos -----
  const atajo = (href, ico, texto, extra = null) => el('a', { class: 'ph-atajo', href, 'data-sonido': 'pagina' },
    typeof ico === 'string' && ico.length > 2 ? icono(ico, 'icono ph-atajo-icono') : el('span', { class: 'ph-atajo-emoji', 'aria-hidden': 'true' }, ico),
    el('span', {}, texto), extra);
  const atajos = el('nav', { class: 'ph-atajos', 'aria-label': t('ph.inicio.atajos') },
    atajo('#/lecciones', 'libro', t('menu.lecciones')),
    atajo('#/repaso', 'repaso', t('menu.repaso'), pendientes ? el('b', { class: 'ph-atajo-aviso' }, pendientes > 99 ? '99+' : String(pendientes)) : null),
    atajo('#/ccse', 'ccse', 'CCSE'),
    atajo('#/dele', 'dele', 'DELE'),
    atajo('#/cuaderno', 'cuaderno', t('menu.cuaderno')),
    atajo('#/frases', 'frases', t('menu.frases')),
    atajo('#/reto', '⚡', t('ph.inicio.reto')),
    atajo('#/practica', 'practica', t('menu.practica')),
    atajo('#/perfil', 'perfil', t('menu.perfil')));

  // ----- La primera vez: Lucía se presenta y pregunta el nombre -----
  let presentada = true;
  try { presentada = Boolean(localStorage.getItem(CLAVE_PRESENTADA)) || hayProgreso() || Boolean(quien); } catch { /* sin almacenamiento */ }
  const bienvenida = presentada ? null : (() => {
    const campo = el('input', { type: 'text', id: 'ph-nombre', maxlength: '40', autocomplete: 'given-name', value: 'Phương' });
    const caja = el('section', { class: 'caja ph-bienvenida' },
      el('h2', {}, '👋 ', t('ph.bienvenida.titulo')),
      el('p', {}, t('ph.bienvenida.texto1')),
      el('ul', { class: 'ph-bienvenida-lista' },
        el('li', {}, '📘 ', t('ph.bienvenida.lecciones')),
        el('li', {}, '🎓 ', t('ph.bienvenida.dele')),
        el('li', {}, '🏛️ ', t('ph.bienvenida.ccse')),
        el('li', {}, '🃏 ', t('ph.bienvenida.repaso'))),
      el('form', { class: 'formulario en-linea' },
        el('div', { class: 'campo' }, el('label', { for: 'ph-nombre' }, t('ph.bienvenida.nombre')), campo),
        el('button', { type: 'submit', class: 'boton boton-principal' }, t('ph.bienvenida.empezar'))));
    caja.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      cambiarNombre(campo.value);
      try { localStorage.setItem(CLAVE_PRESENTADA, '1'); } catch { /* sin almacenamiento */ }
      sonar('fanfarria');
      pintarInicio(app, contenido);
      decir(t('ph.bienvenida.encantada', { nombre: campo.value.trim() || 'Phương' }), 'contenta');
    });
    return caja;
  })();

  poner(app, el('div', { class: 'ph-inicio' }, hola, bienvenida, meta, plan, preguntaDia, atajos));

  // lo del CCSE (pesa un poco: se carga aparte)
  cargarCcse().then(banco => {
    if (!meta.isConnected) return;
    const r = resumenCcse(banco.preguntas);
    const ultimo = simulacrosCcse()[0];
    poner(filaCcse, anillo(r.dominadas / r.total, t('ph.inicio.ccseAria')),
      el('span', { class: 'ph-meta-textos' },
        el('b', {}, 'CCSE'),
        el('span', {}, t('ph.inicio.ccseDominadas', { n: r.dominadas, total: r.total })),
        el('small', {}, ultimo ? t('ph.inicio.ccseSimulacro', { n: ultimo.aciertos, total: ultimo.total }) : t('ph.inicio.ccseSinSimulacro'))),
      el('span', { class: 'ph-meta-flecha', 'aria-hidden': 'true' }, '▶'));
    pintarPreguntaDia(preguntaDia, banco);
  }).catch(() => {});

  if (presentada) {
    decir(todas ? t('ph.inicio.tutoraCompleto') : quien ? t('ph.inicio.tutora', { nombre: quien }) : t('ph.inicio.tutoraSinNombre'));
  } else {
    decir(t('ph.bienvenida.tutora'), 'contenta');
  }
  return () => apagar.forEach(f => f());
}

/** La pregunta del día: la misma todo el día; al responderla cuenta como una más del CCSE. */
function pintarPreguntaDia(caja, banco) {
  const semilla = [...new Date().toLocaleDateString('sv')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11);
  const q = banco.preguntas[semilla % banco.preguntas.length];
  const yaHoy = (() => { try { return localStorage.getItem('phuong-pregunta-dia') === new Date().toLocaleDateString('sv'); } catch { return false; } })();
  const opciones = q.o.map((o, i) => el('button', { type: 'button', class: 'cc-opcion', 'data-sonido': 'nada' },
    el('span', { class: 'cc-letra' }, 'abc'[i]), el('span', { class: 'cc-opcion-textos' }, el('span', { lang: 'es' }, o), el('span', { class: 'cc-opcion-vi', lang: 'vi' }, q.ov[i]))));
  const explicacion = el('p', { class: 'cc-x', hidden: true, lang: 'vi' });
  const corregir = i => {
    opciones.forEach((b, k) => { b.disabled = true; b.classList.toggle('buena', k === q.c); b.classList.toggle('mala', k === i && i !== q.c); });
    explicacion.textContent = `${i === q.c ? '✔' : '✘'} ${q.x}`;
    explicacion.hidden = false;
  };
  opciones.forEach((b, i) => b.addEventListener('click', () => {
    if (b.disabled) return;
    const bien = i === q.c;
    responderCcse(q.id, bien);
    try { localStorage.setItem('phuong-pregunta-dia', new Date().toLocaleDateString('sv')); } catch { /* sin almacenamiento */ }
    sonar(bien ? 'bien' : 'mal');
    corregir(i);
    decir(t(bien ? 'ph.inicio.preguntaBien' : 'ph.inicio.preguntaMal'), bien ? 'contenta' : 'pensando');
  }));
  poner(caja,
    el('h2', {}, '🏛️ ', t('ph.inicio.preguntaDia'), ' ', el('small', { class: 'aprox' }, t('ph.ccse.tareaN', { n: q.t }))),
    el('p', { class: 'cc-q-es', lang: 'es' }, q.p),
    el('p', { class: 'cc-q-vi', lang: 'vi' }, q.pv),
    el('div', { class: 'cc-opciones con-vi' }, opciones),
    explicacion,
    el('a', { class: 'boton boton-mini', href: '#/ccse/practica' }, t('ph.inicio.masPreguntas')));
  caja.hidden = false;
  if (yaHoy) {
    const e = estadoCcse(q.id);
    corregir(e.ult === false ? -1 : q.c);
  }
}
