// El DELE: los niveles del examen oficial de español del Instituto Cervantes (A1–B2) y las prácticas del A2, el nivel
// que se pide para la nacionalidad (datos/dele.json). Cada práctica sigue la estructura del examen de verdad:
//   lectura y auditiva: 4 tareas, 25 preguntas, corrección al final (la auditiva la lee la voz del móvil, dos veces)
//   escrita: 2 tareas con su número de palabras, el modelo y la autoevaluación con los criterios del examen
//   oral: 3 tareas con su preparación, grabarse y escucharse, el modelo y la autoevaluación
//   #/dele                          los niveles y las prácticas
//   #/dele/<examen>/<prueba>        una prueba (lectura · auditiva · escrita · oral)

import { el, poner, textoConFormato } from '../dom.js';
import { t, idioma } from '../i18n.js';
import { sonar, pronunciar, pronunciarSeguido, callar, hayVoz } from '../sonidos.js';
import { decir } from '../tutor.js';
import { confeti } from '../fiesta.js';
import { resumenLeccion } from '../progress.js';
import { resultadoDele, guardarResultadoDele } from '../examenes.js';
import { banderaIdioma } from '../banderas-idioma.js';

const VERSION = new URL(import.meta.url).searchParams.get('v');
const conVersion = archivo => (VERSION && VERSION !== '__VERSION__' ? `${archivo}?v=${VERSION}` : archivo);
let carga = null;
export function cargarDele() {
  carga ??= fetch(conVersion('datos/dele.json')).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(e => { carga = null; throw e; });
  return carga;
}

const PRUEBAS = ['lectura', 'auditiva', 'escrita', 'oral'];
const ICONOS = { lectura: '📖', auditiva: '🎧', escrita: '✍️', oral: '🗣️' };
const LETRAS = ['a', 'b', 'c'];
// el tono de cada voz al leer los audios: hombre, mujer y locutor
const TONOS = { H: 0.8, M: 1.15, L: 1 };
const MINIMO_GRUPO = 30;

const vi = x => (x && typeof x === 'object' ? (idioma() === 'es' ? x.es ?? x.vi : x.vi ?? x.es) : x);
const ambos = x => (x && typeof x === 'object' ? [x.es, x.vi] : [x, null]);
const contarPalabras = texto => (String(texto).trim().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
const minutos = ms => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

export async function pintarDele(app, parametros, contenido) {
  let datos;
  try {
    datos = await cargarDele();
  } catch {
    poner(app, el('section', { class: 'caja tarjeta-error' }, el('h1', {}, t('ph.dele.sinDatos')),
      el('button', { type: 'button', class: 'boton', onclick: () => location.reload() }, t('app.reintentar'))));
    return null;
  }
  const [idExamen, prueba] = parametros;
  const examen = datos.examenes.find(e => e.id === idExamen);
  if (examen && PRUEBAS.includes(prueba)) {
    const pintar = { lectura: pintarComprension, auditiva: pintarComprension, escrita: pintarEscrita, oral: pintarOral }[prueba];
    return pintar(app, examen, prueba);
  }
  return pintarPortada(app, datos, contenido);
}

// ---------------------------------------------------------------------------
// La portada: los niveles y las prácticas
// ---------------------------------------------------------------------------

/** Las notas de un examen de práctica: cada prueba sobre 25 y los dos grupos (aprobado con 30 de 50 en cada uno). */
export function notasDe(examen) {
  const r = Object.fromEntries(PRUEBAS.map(p => [p, resultadoDele(`${examen.id}/${p}`)]));
  const g1 = r.lectura && r.escrita ? r.lectura.puntos + r.escrita.puntos : null;
  const g2 = r.auditiva && r.oral ? r.auditiva.puntos + r.oral.puntos : null;
  return { r, g1, g2, apto: g1 !== null && g2 !== null ? g1 >= MINIMO_GRUPO && g2 >= MINIMO_GRUPO : null };
}

function avanceNivel(nivel, contenido) {
  const [desde, hasta] = nivel.capitulos;
  const lecciones = (contenido?.resultados ?? []).filter(r => r.leccion && r.leccion.capitulo >= desde && r.leccion.capitulo <= hasta);
  const hechas = lecciones.filter(r => resumenLeccion(r.leccion.id, r.leccion.idsEjercicios).terminada).length;
  return { hechas, total: lecciones.length };
}

function pintarPortada(app, datos, contenido) {
  const tarjetaNivel = nivel => {
    const a = avanceNivel(nivel, contenido);
    const examenes = datos.examenes.filter(e => e.nivel === nivel.id);
    return el('section', { class: `caja dl-nivel nivel-${nivel.id.toLowerCase()}${nivel.objetivo ? ' objetivo' : ''}` },
      el('header', { class: 'dl-nivel-cabeza' },
        el('span', { class: 'dl-insignia' }, nivel.id),
        el('div', {},
          el('h2', {}, t('ph.dele.nivel', { nivel: nivel.id })),
          nivel.objetivo ? el('p', { class: 'dl-objetivo' }, '🇪🇸 ', t('ph.dele.objetivo')) : null)),
      el('p', {}, idioma() === 'es' ? nivel.es : nivel.vi),
      el('ul', { class: 'dl-pruebas' }, nivel.pruebas.map(p => el('li', {},
        el('span', { 'aria-hidden': 'true' }, ICONOS[p.id]),
        el('span', {}, t(`ph.dele.prueba.${p.id}`)),
        el('small', {}, [t('ph.dele.min', { n: p.minutos }), p.preparacion ? t('ph.dele.prep', { n: p.preparacion }) : null,
          t('ph.dele.tareas', { n: p.tareas }), p.items ? t('ph.dele.items', { n: p.items }) : null].filter(Boolean).join(' · '))))),
      a.total ? el('div', { class: 'dl-lecciones' },
        el('span', {}, t('ph.dele.leccionesNivel', { hechas: a.hechas, total: a.total })),
        el('span', { class: 'ph-barra', 'aria-hidden': 'true' }, el('span', { style: `--avance:${a.hechas / a.total}` })),
        el('a', { class: 'boton boton-mini', href: '#/lecciones' }, t('ph.dele.irLecciones'))) : null,
      examenes.length ? el('div', { class: 'dl-examenes' }, examenes.map(tarjetaExamen)) : null);
  };

  const tarjetaExamen = examen => {
    const n = notasDe(examen);
    const boton = p => {
      const r = n.r[p];
      return el('a', { class: `dl-prueba-boton${r ? ' hecha' : ''}`, href: `#/dele/${examen.id}/${p}`, 'data-sonido': 'pagina' },
        el('span', { class: 'dl-prueba-icono', 'aria-hidden': 'true' }, ICONOS[p]),
        el('span', { class: 'dl-prueba-nombre' }, t(`ph.dele.prueba.${p}`)),
        el('span', { class: 'dl-prueba-nota' }, r ? `${redondear(r.puntos)}/25` : t('ph.dele.sinHacer')));
    };
    return el('article', { class: 'dl-examen' },
      el('h3', {}, '📝 ', vi(examen.titulo)),
      el('div', { class: 'dl-prueba-botones' }, PRUEBAS.map(boton)),
      el('p', { class: 'dl-grupos' },
        el('span', {}, t('ph.dele.grupo1'), ' ', el('b', {}, n.g1 === null ? '—' : `${redondear(n.g1)}/50`)),
        el('span', {}, t('ph.dele.grupo2'), ' ', el('b', {}, n.g2 === null ? '—' : `${redondear(n.g2)}/50`)),
        n.apto === null ? el('small', { class: 'aprox' }, t('ph.dele.grupoAyuda'))
          : el('b', { class: n.apto ? 'dl-apto' : 'dl-no-apto' }, n.apto ? t('ph.dele.apto') : t('ph.dele.noApto'))));
  };

  poner(app,
    el('section', { class: 'ph-intro ph-intro-dele' },
      el('span', { class: 'ph-intro-insignia', 'aria-hidden': 'true' }, '🎓'),
      el('div', {},
        el('h1', {}, t('ph.dele.titulo')),
        el('p', {}, t('ph.dele.intro')))),
    el('section', { class: 'caja dl-nacionalidad' },
      el('h2', {}, t('ph.dele.nacionalidadTitulo')),
      el('ol', { class: 'dl-pasos' },
        el('li', {}, el('b', {}, 'DELE A2'), ' — ', t('ph.dele.paso1')),
        el('li', {}, el('b', {}, 'CCSE'), ' — ', t('ph.dele.paso2'), ' ', el('a', { href: '#/ccse' }, t('ph.dele.irCcse')))),
      el('p', { class: 'aprox' }, t('ph.dele.aprobar')),
      el('p', { class: 'aprox' }, t('ph.dele.nota'))),
    datos.niveles.filter(n => n.objetivo).map(tarjetaNivel),
    el('h2', { class: 'dl-otros' }, t('ph.dele.otrosNiveles')),
    datos.niveles.filter(n => !n.objetivo).map(tarjetaNivel));
  decir(t('ph.dele.tutora'));
  return null;
}

const redondear = n => String(Math.round(n * 10) / 10).replace('.', idioma() === 'es' ? ',' : ',');

// ---------------------------------------------------------------------------
// Piezas comunes de las pruebas
// ---------------------------------------------------------------------------

function cabeceraPrueba(examen, prueba, reloj) {
  return el('header', { class: 'cc-barra-sup' },
    el('a', { class: 'boton boton-mini', href: '#/dele' }, '◀ DELE'),
    el('h1', { class: 'cc-ronda-titulo' }, `${ICONOS[prueba]} ${t(`ph.dele.prueba.${prueba}`)} · ${vi(examen.titulo)}`),
    reloj);
}

/** Un reloj que cuenta hacia atrás (solo avisa: como en casa, nadie quita el examen al acabar). */
function crearReloj(minutosTotales) {
  const nodo = el('span', { class: 'cc-reloj', role: 'timer', title: t('ph.dele.relojAyuda') }, minutos(minutosTotales * 60000));
  const fin = Date.now() + minutosTotales * 60000;
  let avisado = false;
  const id = setInterval(() => {
    const queda = fin - Date.now();
    nodo.textContent = queda > 0 ? minutos(queda) : `+${minutos(-queda)}`;
    nodo.classList.toggle('poco', queda < 5 * 60000);
    if (queda <= 0 && !avisado) { avisado = true; sonar('timbre'); decir(t('ph.dele.tiempo'), 'apurada'); }
  }, 500);
  return { nodo, parar: () => clearInterval(id) };
}

function instrucciones(x) {
  const [es, trad] = ambos(x);
  return el('div', { class: 'dl-instrucciones' },
    el('p', { lang: 'es' }, es),
    trad ? el('p', { class: 'dl-instrucciones-vi', lang: 'vi' }, banderaIdioma('vi'), ' ', trad) : null);
}

function textoLeido(texto) {
  return el('div', { class: 'dl-texto', lang: 'es' }, texto.titulo ? el('h3', {}, texto.titulo) : null, textoConFormato(texto.texto));
}

/** Un grupo de botones para elegir una respuesta. Devuelve { nodo, valor(), marcar(correcta) }. */
function eleccion(opciones, alCambiar) {
  let elegida = null;
  const botones = opciones.map(({ valor, texto }) => {
    const b = el('button', { type: 'button', class: 'cc-opcion dl-opcion', 'data-sonido': 'nada', 'aria-pressed': 'false' }, texto);
    b.addEventListener('click', () => {
      if (b.disabled) return;
      elegida = valor;
      botones.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      sonar('marcar');
      alCambiar?.();
    });
    return b;
  });
  return {
    nodo: el('div', { class: 'cc-opciones dl-opciones' }, botones),
    valor: () => elegida,
    marcar(correcta) {
      botones.forEach((b, i) => {
        b.disabled = true;
        const v = opciones[i].valor;
        b.classList.toggle('buena', v === correcta);
        b.classList.toggle('mala', v === elegida && v !== correcta);
      });
    },
  };
}

/** El botón para escuchar un audio: como en el examen, dos veces (después de corregir, las que se quiera). */
function reproductor(audio, { veces = 2 } = {}) {
  let quedan = veces;
  let libre = false;
  const transcripcion = el('div', { class: 'dl-transcripcion', hidden: true, lang: 'es' },
    audio.map(([quien, texto]) => el('p', {}, el('b', {}, quien === 'H' ? '👨 ' : quien === 'M' ? '👩 ' : '📻 '), texto)));
  const boton = el('button', { type: 'button', class: 'boton dl-play', 'data-sonido': 'nada' });
  const pintar = (sonando = false) => {
    poner(boton, sonando ? '⏸ ' : '▶ ', sonando ? t('ph.dele.sonando') : t('ph.dele.escuchar'),
      libre ? null : el('small', {}, ` (${t('ph.dele.quedan', { n: quedan })})`));
    boton.disabled = !libre && quedan <= 0 && !sonando;
  };
  let sonando = false;
  boton.addEventListener('click', () => {
    if (sonando) { callar(); sonando = false; pintar(); return; }
    if (!libre && quedan <= 0) return;
    const ok = pronunciarSeguido(audio.map(([quien, texto]) => ({ texto, tono: TONOS[quien] ?? 1 })), {
      alAcabar: () => { sonando = false; pintar(); },
    });
    if (!ok) { transcripcion.hidden = false; decir(t('ph.dele.sinVoz'), 'apurada'); return; }
    if (!libre) quedan -= 1;
    sonando = true;
    pintar(true);
  });
  pintar();
  const sinVoz = !hayVoz();
  if (sinVoz) transcripcion.hidden = false;
  return {
    nodo: el('div', { class: 'dl-audio' }, sinVoz ? el('p', { class: 'aprox' }, t('ph.dele.sinVozTexto')) : boton, transcripcion),
    liberar() { libre = true; transcripcion.hidden = false; pintar(); },
  };
}

/** Grabarse y escucharse (si el móvil deja usar el micrófono). */
function grabadora() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return null;
  let grabador = null;
  let trozos = [];
  let flujo = null;
  const boton = el('button', { type: 'button', class: 'boton dl-grabar', 'data-sonido': 'nada' }, '🎙️ ', t('ph.dele.grabar'));
  const sonido = el('audio', { controls: true, hidden: true, class: 'dl-grabacion' });
  boton.addEventListener('click', async () => {
    if (grabador?.state === 'recording') { grabador.stop(); return; }
    try {
      callar();
      flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
      grabador = new MediaRecorder(flujo);
      trozos = [];
      grabador.ondataavailable = e => { if (e.data.size) trozos.push(e.data); };
      grabador.onstop = () => {
        flujo.getTracks().forEach(p => p.stop());
        if (sonido.src) URL.revokeObjectURL(sonido.src);
        sonido.src = URL.createObjectURL(new Blob(trozos, { type: grabador.mimeType || 'audio/webm' }));
        sonido.hidden = false;
        boton.classList.remove('grabando');
        poner(boton, '🎙️ ', t('ph.dele.grabarOtra'));
        sonar('fin');
      };
      grabador.start();
      boton.classList.add('grabando');
      poner(boton, '⏹ ', t('ph.dele.parar'));
      sonar('campana');
    } catch {
      decir(t('ph.dele.sinMicro'), 'confundida');
    }
  });
  return el('div', { class: 'dl-grabadora' }, boton, sonido, el('small', { class: 'aprox' }, t('ph.dele.grabarAyuda')));
}

/** La autoevaluación con los dos criterios del examen (0–3 cada uno). Devuelve { nodo, puntos(), completa() }. */
function autoevaluacion(clave, alCambiar) {
  const criterios = ['cumplimiento', 'uso'];
  const valores = {};
  const nodo = el('div', { class: 'dl-auto' }, criterios.map(c => {
    const grupo = el('div', { class: 'dl-auto-botones', role: 'group', 'aria-label': t(`ph.dele.criterio.${c}`) },
      [0, 1, 2, 3].map(n => {
        const b = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': 'false', title: t(`ph.dele.banda.${c}.${n}`) }, String(n));
        b.addEventListener('click', () => {
          valores[c] = n;
          grupo.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          ayuda.textContent = t(`ph.dele.banda.${c}.${n}`);
          sonar('marcar');
          alCambiar?.();
        });
        return b;
      }));
    const ayuda = el('small', { class: 'aprox' }, t(`ph.dele.criterioAyuda.${c}`));
    return el('div', { class: 'dl-criterio' }, el('b', {}, t(`ph.dele.criterio.${c}`)), grupo, ayuda);
  }));
  return {
    nodo: el('details', { class: 'dl-auto-caja', open: true, 'data-clave': clave }, el('summary', {}, '🧑‍⚖️ ', t('ph.dele.autoTitulo')), nodo),
    puntos: () => criterios.reduce((s, c) => s + (valores[c] ?? 0), 0),
    completa: () => criterios.every(c => valores[c] !== undefined),
  };
}

function modeloDesplegable(texto, { conVoz = true } = {}) {
  return el('details', { class: 'dl-modelo' },
    el('summary', {}, '💡 ', t('ph.dele.verModelo')),
    el('div', { class: 'dl-texto', lang: 'es' }, textoConFormato(texto)),
    conVoz ? el('button', { type: 'button', class: 'boton boton-mini con-voz', onclick: () => pronunciar(texto) }, '🔊 ', t('comun.escuchar')) : null);
}

function puntosATratar(puntos) {
  return el('ul', { class: 'dl-puntos' }, puntos.map(p => el('li', {}, el('label', {}, el('input', { type: 'checkbox' }), ' ', el('span', { lang: 'es' }, p)))));
}

function guardarYCelebrar(id, puntos, prueba) {
  guardarResultadoDele(id, puntos, 25);
  const bien = puntos >= 15;
  sonar(bien ? 'fanfarria' : 'fin');
  decir(t(bien ? 'ph.dele.tutoraBien' : 'ph.dele.tutoraFlojo', { n: redondear(puntos), prueba: t(`ph.dele.prueba.${prueba}`) }), bien ? 'contenta' : 'pensando');
}

// ---------------------------------------------------------------------------
// Comprensión de lectura y comprensión auditiva
// ---------------------------------------------------------------------------

function pintarComprension(app, examen, prueba) {
  const datos = examen.pruebas[prueba];
  const reloj = crearReloj(datos.minutos);
  const preguntas = []; // { eleccion, correcta, x, item }
  const reproductores = [];
  let numero = 0;
  const pestanas = el('div', { class: 'filtros dl-pestanas', role: 'tablist' });
  const paneles = [];

  datos.tareas.forEach((tarea, k) => {
    const piezas = [instrucciones(tarea.instrucciones)];
    const item = (it, cuerpo, opciones) => {
      numero += 1;
      const e = eleccion(opciones, contar);
      const x = el('p', { class: 'cc-x', hidden: true, lang: 'vi' });
      preguntas.push({ e, correcta: it.c, x, it });
      return el('div', { class: 'dl-item' },
        el('p', { class: 'dl-item-p' }, el('b', { class: 'dl-num' }, `${numero}.`), ' ', el('span', { lang: 'es' }, it.p ?? '')),
        cuerpo, e.nodo, x);
    };
    const opcionesDe = it => it.o.map((o, i) => ({ valor: i, texto: el('span', {}, el('span', { class: 'cc-letra' }, LETRAS[i]), ' ', el('span', { lang: 'es' }, o)) }));

    if (tarea.tipo === 'opciones') {
      piezas.push(...tarea.textos.map(textoLeido), ...tarea.items.map(it => item(it, null, opcionesDe(it))));
    } else if (tarea.tipo === 'textos-cortos') {
      piezas.push(...tarea.items.map(it => item(it, textoLeido({ texto: it.texto }), opcionesDe(it))));
    } else if (tarea.tipo === 'relacionar') {
      piezas.push(el('div', { class: 'dl-textos-abc' }, tarea.textos.map(tx => el('div', { class: 'dl-abc' },
        el('span', { class: 'dl-abc-letra' }, tx.letra), textoLeido(tx)))));
      const opciones = tarea.textos.map(tx => ({ valor: tx.letra, texto: `${tx.letra} · ${tx.titulo}` }));
      piezas.push(...tarea.items.map(it => item(it, null, opciones)));
    } else if (tarea.tipo === 'audio-opciones') {
      piezas.push(...tarea.items.map(it => {
        const r = reproductor(it.audio);
        reproductores.push(r);
        return item(it, r.nodo, opcionesDe(it));
      }));
    } else if (tarea.tipo === 'personas') {
      const r = reproductor(tarea.audio);
      reproductores.push(r);
      piezas.push(r.nodo);
      const opciones = Object.entries(tarea.personas).map(([valor, nombre]) => ({ valor, texto: vi(nombre) }));
      piezas.push(...tarea.items.map(it => item(it, null, opciones)));
    } else if (tarea.tipo === 'mensajes') {
      piezas.push(el('ol', { class: 'dl-enunciados', type: 'A' }, Object.entries(tarea.enunciados).map(([letra, texto]) =>
        el('li', { value: String(letra.charCodeAt(0) - 64), lang: 'es' }, el('b', {}, letra), ' ', texto))));
      const opciones = Object.keys(tarea.enunciados).map(letra => ({ valor: letra, texto: letra }));
      piezas.push(...tarea.items.map(it => {
        const r = reproductor(it.audio);
        reproductores.push(r);
        return item({ ...it, p: t('ph.dele.mensaje') }, r.nodo, opciones);
      }));
    }
    const panel = el('section', { class: 'caja dl-tarea', role: 'tabpanel', hidden: k > 0 }, el('h2', {}, t('ph.dele.tarea', { n: k + 1 })), piezas);
    paneles.push(panel);
    const b = el('button', { type: 'button', class: 'boton boton-mini', role: 'tab', 'aria-selected': String(k === 0), 'aria-pressed': String(k === 0) }, t('ph.dele.tarea', { n: k + 1 }));
    b.addEventListener('click', () => mostrarTarea(k));
    pestanas.append(b);
  });

  function mostrarTarea(k) {
    callar();
    paneles.forEach((p, i) => { p.hidden = i !== k; });
    [...pestanas.children].forEach((b, i) => { b.setAttribute('aria-selected', String(i === k)); b.setAttribute('aria-pressed', String(i === k)); });
    sonar('pagina');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cuenta = el('p', { class: 'aprox dl-cuenta' });
  function contar() { cuenta.textContent = t('ph.dele.respondidas', { n: preguntas.filter(p => p.e.valor() !== null).length, total: preguntas.length }); }
  contar();

  const anterior = resultadoDele(`${examen.id}/${prueba}`);
  const corregir = el('button', { type: 'button', class: 'boton boton-principal boton-grande' }, '✔ ', t('ph.dele.corregir'));
  const resultado = el('section', { class: 'caja dl-resultado', hidden: true, 'aria-live': 'polite' });
  const raiz = el('div', { 'data-examen-en-curso': '' });
  corregir.addEventListener('click', async () => {
    const sinHacer = preguntas.filter(p => p.e.valor() === null).length;
    if (sinHacer) {
      const { confirmar } = await import('../movil.js');
      if (!await confirmar(t('ph.dele.corregirSinHacer', { n: sinHacer }), { si: t('ph.dele.corregir'), no: t('ph.dele.seguir') })) return;
    }
    reloj.parar();
    callar();
    raiz.removeAttribute('data-examen-en-curso');
    let bien = 0;
    for (const p of preguntas) {
      p.e.marcar(p.correcta);
      const acierto = p.e.valor() === p.correcta;
      if (acierto) bien += 1;
      p.x.hidden = false;
      p.x.textContent = `${acierto ? '✔' : '✘'} ${p.it.x ?? ''}`;
      p.x.classList.toggle('mal', !acierto);
    }
    reproductores.forEach(r => r.liberar());
    corregir.hidden = true;
    poner(resultado,
      el('p', { class: 'cc-final-nota' }, el('b', {}, `${bien}/25`)),
      el('h2', {}, t(bien >= 15 ? 'ph.dele.resultadoBien' : 'ph.dele.resultadoFlojo')),
      el('p', { class: 'aprox' }, t(prueba === 'auditiva' ? 'ph.dele.resultadoAyudaAuditiva' : 'ph.dele.resultadoAyuda')),
      el('p', { class: 'botonera' },
        el('button', { type: 'button', class: 'boton', onclick: () => pintarComprension(app, examen, prueba) }, t('ph.dele.repetir')),
        el('a', { class: 'boton boton-principal', href: '#/dele' }, t('ph.dele.volver'))));
    resultado.hidden = false;
    guardarYCelebrar(`${examen.id}/${prueba}`, bien, prueba);
    if (bien >= 20) confeti(resultado.querySelector('.cc-final-nota'), 30);
    mostrarTarea(0);
  });

  poner(raiz,
    cabeceraPrueba(examen, prueba, reloj.nodo),
    anterior ? el('p', { class: 'aprox dl-anterior' }, t('ph.dele.anterior', { n: redondear(anterior.puntos) })) : null,
    resultado,
    pestanas,
    paneles,
    el('div', { class: 'dl-pie' }, cuenta, corregir));
  poner(app, raiz);
  decir(t(prueba === 'auditiva' ? 'ph.dele.tutoraAuditiva' : 'ph.dele.tutoraLectura'));
  return () => { reloj.parar(); callar(); };
}

// ---------------------------------------------------------------------------
// Expresión e interacción escritas
// ---------------------------------------------------------------------------

const leerBorrador = clave => { try { return localStorage.getItem(`phuong-borrador-${clave}`) ?? ''; } catch { return ''; } };
const guardarBorrador = (clave, texto) => { try { localStorage.setItem(`phuong-borrador-${clave}`, texto); } catch { /* sin almacenamiento */ } };

function cajaEscribir(clave, [min, max]) {
  const area = el('textarea', { class: 'dl-escribir', rows: '9', lang: 'es', spellcheck: 'false', 'aria-label': t('ph.dele.tuTexto'), placeholder: t('ph.dele.escribeAqui') });
  area.value = leerBorrador(clave);
  const contador = el('p', { class: 'dl-contador' });
  const pintar = () => {
    const n = contarPalabras(area.value);
    contador.textContent = t('ph.dele.palabras', { n, min, max });
    contador.className = `dl-contador ${n < min ? 'pocas' : n > max ? 'muchas' : 'justas'}`;
  };
  area.addEventListener('input', () => { pintar(); guardarBorrador(clave, area.value); });
  pintar();
  return el('div', { class: 'dl-caja-escribir' }, area, contador);
}

function pintarEscrita(app, examen) {
  const datos = examen.pruebas.escrita;
  const reloj = crearReloj(datos.minutos);
  const evaluaciones = [];
  const [t1, t2] = datos.tareas;

  const ev1 = autoevaluacion('t1', () => {});
  evaluaciones.push(ev1);
  const tarea1 = el('section', { class: 'caja dl-tarea' },
    el('h2', {}, vi(t1.titulo)),
    instrucciones(t1.instrucciones),
    el('div', { class: 'dl-correo', lang: 'es' },
      el('p', { class: 'dl-correo-cabeza' }, el('b', {}, t('ph.dele.de')), ` ${t1.estimulo.de}`, el('br'), el('b', {}, t('ph.dele.asunto')), ` ${t1.estimulo.asunto}`),
      textoConFormato(t1.estimulo.texto)),
    el('h3', {}, t('ph.dele.tienesQue')),
    puntosATratar(t1.puntos),
    cajaEscribir(`${examen.id}-e1`, t1.palabras),
    el('p', { class: 'aprox' }, '🔑 ', t('ph.dele.claves'), ' ', el('span', { lang: 'es' }, t1.claves)),
    modeloDesplegable(t1.modelo),
    ev1.nodo);

  const ev2 = autoevaluacion('t2', () => {});
  evaluaciones.push(ev2);
  const zonaOpcion = el('div');
  const elegirOpcion = op => {
    poner(zonaOpcion,
      el('h3', {}, vi(op.titulo)),
      instrucciones(op.instrucciones),
      puntosATratar(op.puntos),
      cajaEscribir(`${examen.id}-e2${op.id}`, t2.palabras),
      modeloDesplegable(op.modelo));
  };
  const botonesOpcion = el('div', { class: 'filtros' }, t2.opciones.map((op, i) => {
    const b = el('button', { type: 'button', class: 'boton', 'aria-pressed': String(i === 0) }, t('ph.dele.opcion', { id: op.id }));
    b.addEventListener('click', () => { botonesOpcion.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); elegirOpcion(op); sonar('elegir'); });
    return b;
  }));
  elegirOpcion(t2.opciones[0]);
  const tarea2 = el('section', { class: 'caja dl-tarea' },
    el('h2', {}, vi(t2.titulo)), instrucciones(t2.instrucciones), botonesOpcion, zonaOpcion, ev2.nodo);

  return pintarFinalExpresion(app, examen, 'escrita', reloj, [tarea1, tarea2], evaluaciones, 12, 'ph.dele.tutoraEscrita');
}

/** El final común de la escrita y la oral: el botón de guardar la nota de la autoevaluación (sobre 25). */
function pintarFinalExpresion(app, examen, prueba, reloj, tareas, evaluaciones, maximo, saludo) {
  const id = `${examen.id}/${prueba}`;
  const anterior = resultadoDele(id);
  const resultado = el('section', { class: 'caja dl-resultado', hidden: true, 'aria-live': 'polite' });
  const guardar = el('button', { type: 'button', class: 'boton boton-principal boton-grande' }, '💾 ', t('ph.dele.guardarNota'));
  guardar.addEventListener('click', () => {
    if (!evaluaciones.every(e => e.completa())) { decir(t('ph.dele.faltaAuto'), 'pensando'); sonar('duda'); return; }
    reloj.parar();
    const puntos = Math.round((25 * evaluaciones.reduce((s, e) => s + e.puntos(), 0) / maximo) * 10) / 10;
    poner(resultado,
      el('p', { class: 'cc-final-nota' }, el('b', {}, `${redondear(puntos)}/25`)),
      el('h2', {}, t(puntos >= 15 ? 'ph.dele.resultadoBien' : 'ph.dele.resultadoFlojo')),
      el('p', { class: 'aprox' }, t('ph.dele.autoNota')),
      el('a', { class: 'boton boton-principal', href: '#/dele' }, t('ph.dele.volver')));
    resultado.hidden = false;
    resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
    guardarYCelebrar(id, puntos, prueba);
  });
  poner(app,
    cabeceraPrueba(examen, prueba, reloj.nodo),
    anterior ? el('p', { class: 'aprox dl-anterior' }, t('ph.dele.anterior', { n: redondear(anterior.puntos) })) : null,
    tareas,
    el('div', { class: 'dl-pie' }, guardar),
    resultado);
  decir(t(saludo));
  return () => { reloj.parar(); callar(); };
}

// ---------------------------------------------------------------------------
// Expresión e interacción orales
// ---------------------------------------------------------------------------

function pintarOral(app, examen) {
  const datos = examen.pruebas.oral;
  const reloj = crearReloj(datos.preparacion);
  const evaluaciones = [];
  const [t1, t2, t3] = datos.tareas;

  // Tarea 1: presentación (una de dos)
  const ev1 = autoevaluacion('o1');
  evaluaciones.push(ev1);
  const zona1 = el('div');
  const elegir1 = op => poner(zona1, el('h3', {}, vi(op.tema)), puntosATratar(op.puntos), grabadora(), modeloDesplegable(op.modelo));
  const opciones1 = el('div', { class: 'filtros' }, t1.opciones.map((op, i) => {
    const b = el('button', { type: 'button', class: 'boton', 'aria-pressed': String(i === 0) }, vi(op.tema));
    b.addEventListener('click', () => { opciones1.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); elegir1(op); sonar('elegir'); });
    return b;
  }));
  elegir1(t1.opciones[0]);
  const tarea1 = el('section', { class: 'caja dl-tarea' }, el('h2', {}, vi(t1.titulo)), instrucciones(t1.instrucciones), opciones1, zona1, ev1.nodo);

  // Tarea 2: describir una imagen (aquí, una escena dibujada con emojis y explicada en vietnamita)
  const ev2 = autoevaluacion('o2');
  evaluaciones.push(ev2);
  const tarea2 = el('section', { class: 'caja dl-tarea' },
    el('h2', {}, vi(t2.titulo)), instrucciones(t2.instrucciones),
    el('figure', { class: 'dl-escena' },
      el('p', { class: 'dl-escena-dibujo', 'aria-hidden': 'true' }, t2.escena.emojis),
      el('figcaption', { lang: 'vi' }, t2.escena.vi)),
    puntosATratar(t2.puntos), grabadora(), modeloDesplegable(t2.modelo), ev2.nodo);

  // Tarea 3: la conversación con el examinador (la voz del móvil hace de examinador)
  const ev3 = autoevaluacion('o3');
  evaluaciones.push(ev3);
  let turno = -1;
  const linea = el('div', { class: 'dl-dialogo', 'aria-live': 'polite' });
  const avanzar = el('button', { type: 'button', class: 'boton boton-principal' }, '▶ ', t('ph.dele.empezarConversacion'));
  const decirTurno = () => {
    const d = t3.dialogo[turno];
    const respuesta = el('details', { class: 'dl-modelo' }, el('summary', {}, '💡 ', t('ph.dele.respuestaPosible')), el('p', { lang: 'es' }, d.c));
    linea.append(el('div', { class: 'dl-turno' },
      el('p', { class: 'dl-examinador', lang: 'es' }, el('b', {}, '🧑‍🏫 '), d.e),
      el('p', { class: 'dl-te-toca' }, '🗣️ ', t('ph.dele.teToca')), respuesta));
    if (!pronunciar(d.e)) decir(t('ph.dele.sinVoz'), 'apurada');
    linea.lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  avanzar.addEventListener('click', () => {
    turno += 1;
    if (turno >= t3.dialogo.length) { avanzar.hidden = true; sonar('fanfarria'); decir(t('ph.dele.finConversacion'), 'contenta'); return; }
    decirTurno();
    poner(avanzar, '▶ ', t(turno === t3.dialogo.length - 1 ? 'ph.dele.terminarConversacion' : 'ph.dele.siguienteFrase'));
  });
  const tarea3 = el('section', { class: 'caja dl-tarea' },
    el('h2', {}, vi(t3.titulo)), instrucciones(t3.instrucciones), linea, avanzar, grabadora(), ev3.nodo);

  const prep = el('p', { class: 'caja dl-prep' }, '⏳ ', t('ph.dele.preparacion', { n: datos.preparacion, m: datos.minutos }));
  const vista = pintarFinalExpresion(app, examen, 'oral', reloj, [prep, tarea1, tarea2, tarea3], evaluaciones, 18, 'ph.dele.tutoraOral');
  return vista;
}
