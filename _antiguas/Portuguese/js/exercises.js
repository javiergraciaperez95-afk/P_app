// Ejercicios de la lección.
// - test, traduccion y huecos: elegir una opción (comparten formato).
// - escribir: escribir la respuesta en portugués (con botones para ã, õ, ç, á, à, â, é, ê, í, ó, ô, ú).
// - ordenar: ordenar las palabras de una frase en portugués.

import { el, enLinea, barajar, alAzar, poner } from './dom.js';
import { decir } from './tutor.js';
import { registrarRespuesta, estadoEjercicio } from './progress.js';
import { sonar, pronunciar, ayudaVoz } from './sonidos.js';
import { t, tr, lista } from './i18n.js';

const LETRAS_ESPECIALES = ['ã', 'õ', 'ç', 'á', 'à', 'â', 'é', 'ê', 'í', 'ó', 'ô', 'ú'];

/** Etiqueta del tipo de ejercicio (claves «exercise.type.*»). */
export function etiquetaEjercicio(tipo) {
  return t(`exercise.type.${tipo}`);
}

/** Texto de una opción: las portuguesas son texto; las del idioma de la interfaz, { en, vi }. */
function textoOpcion(opcion) {
  return tr(opcion.texto);
}

/**
 * Crea el ejercicio que toque según su tipo.
 * alResponder(): avisa a la lección para que actualice su progreso.
 */
export function crearEjercicio(bloque, idLeccion, numero, alResponder) {
  const seccion = el('section', { class: 'caja ejercicio', 'aria-labelledby': `ej-${numero}` });
  let fallosSeguidos = 0;

  const pintar = {
    escribir: pintarEscribir,
    ordenar: pintarOrdenar,
  }[bloque.tipo] ?? pintarOpciones;

  /** Lo común a todos: guardar, mostrar la explicación y que hable la tutora. */
  function resolver(acierto, mensajes, { feedback, pie }) {
    sonar(acierto ? 'bien' : 'mal');
    registrarRespuesta(idLeccion, bloque.id, acierto);
    fallosSeguidos = acierto ? 0 : fallosSeguidos + 1;

    feedback.hidden = false;
    feedback.className = `feedback ${acierto ? 'bien' : 'mal'}`;
    poner(feedback,
      el('p', { class: 'feedback-titulo' }, acierto ? `✔ ${t('exercise.correct')}` : `✘ ${t('exercise.incorrect')}`),
      ...mensajes.map(m => el('p', {}, enLinea(m))));
    feedback.focus({ preventScroll: true });

    let expresion = acierto ? 'contenta' : 'pensando';
    if (!acierto && fallosSeguidos >= 2) expresion = 'apurada';
    if (bloque.tutora && !acierto) expresion = bloque.tutora;
    const animo = !acierto && fallosSeguidos >= 2 ? t('tutor.stuck') : null;
    decir([animo, ...mensajes].filter(Boolean).join(' '), expresion);

    pintarPie(pie, true);
    alResponder();
  }

  function pintarPie(pie, respondido) {
    const e = estadoEjercicio(idLeccion, bloque.id);
    const datos = e.intentos
      ? t('exercise.stats', { intentos: e.intentos, aciertos: e.aciertos, errores: e.errores })
      : t('exercise.notAnswered');
    poner(pie, el('span', {}, datos));
    if (respondido) {
      pie.append(el('button', {
        type: 'button',
        class: 'boton boton-mini',
        onclick: () => {
          pintar();
          seccion.querySelector('.opcion, input, .pieza')?.focus();
        },
      }, `↺ ${t('exercise.retry')}`));
    }
  }

  /** Cabecera, pregunta y zonas de respuesta comunes. */
  function estructura(...contenido) {
    const pregunta = tr(bloque.pregunta) || t(`exercise.defaultQuestion.${bloque.tipo}`);
    const feedback = el('div', { class: 'feedback', hidden: true, tabindex: '-1', 'aria-live': 'polite' });
    const pie = el('div', { class: 'ejercicio-pie' });
    const oido = bloque.audio ? controlesAudio(bloque.audio) : null;
    poner(seccion,
      el('span', { class: 'etiqueta-bloque' },
        `${t('exercise.number', { n: numero })} · ${bloque.audio ? `🔊 ${t('exercise.listening')} · ` : ''}${etiquetaEjercicio(bloque.tipo)}`),
      el('p', { class: 'ejercicio-pregunta', id: `ej-${numero}` }, enLinea(pregunta)),
      oido,
      ...contenido,
      feedback,
      pie);
    pintarPie(pie, false);
    return { feedback, pie };
  }

  // ---- Elegir una opción ---------------------------------------------------

  function pintarOpciones() {
    const frase = bloque.frase ? el('p', { class: 'ejercicio-frase', lang: 'pt-PT' }, pintarHueco(bloque.frase)) : null;
    const listaOpciones = el('ul', { class: 'opciones' });
    const zonas = estructura(frase, listaOpciones);
    const indices = barajar(bloque.opciones.map((_, i) => i));

    indices.forEach((indice, i) => {
      const opcion = bloque.opciones[indice];
      const boton = el('button', { type: 'button', class: 'boton opcion', 'data-indice': String(indice) },
        el('span', { class: 'opcion-letra', 'aria-hidden': 'true' }, 'ABCDEFGH'[i]),
        el('span', { class: 'opcion-texto', lang: typeof opcion.texto === 'string' ? 'pt-PT' : null }, textoOpcion(opcion)),
        el('span', { class: 'opcion-marca' }));
      boton.addEventListener('click', () => responder(indice));
      listaOpciones.append(el('li', {}, boton));
    });

    function responder(elegidaIndice) {
      const elegida = bloque.opciones[elegidaIndice];
      const correcta = bloque.opciones.find(o => o.correcta);
      for (const boton of listaOpciones.querySelectorAll('button')) {
        boton.disabled = true;
        const marca = boton.querySelector('.opcion-marca');
        const opcion = bloque.opciones[Number(boton.dataset.indice)];
        if (opcion.correcta) {
          boton.classList.add('es-correcta');
          marca.textContent = `✔ ${t('exercise.correctOption')}`;
        } else if (opcion === elegida) {
          boton.classList.add('es-fallo');
          marca.textContent = `✘ ${t('exercise.yourAnswer')}`;
        } else {
          boton.classList.add('es-neutra');
        }
      }
      if (bloque.tipo === 'huecos' && frase) poner(frase, ...pintarHueco(bloque.frase, textoOpcion(correcta)));

      const mensajes = elegida.correcta
        ? [alAzar(lista('tutor.praise')), tr(correcta.explicacion)]
        : [
          `${alAzar(lista('tutor.oops'))} ${tr(elegida.explicacion)}`.trim(),
          t('exercise.theAnswerIs', { respuesta: textoOpcion(correcta) }),
          tr(correcta.explicacion),
        ];
      resolver(Boolean(elegida.correcta), mensajes.filter(Boolean), zonas);
    }
  }

  // ---- Escribir la respuesta -----------------------------------------------

  function pintarEscribir() {
    const id = `escribir-${numero}`;
    const entrada = el('input', {
      id, type: 'text', lang: 'pt-PT', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-labelledby': `ej-${numero}`,
    });
    // Muchos teclados (inglés, vietnamita) no tienen estas letras a mano.
    const letras = el('div', { class: 'letras-especiales', role: 'group', 'aria-label': t('exercise.specialLetters') },
      LETRAS_ESPECIALES.map(letra => el('button', {
        type: 'button',
        class: 'boton boton-mini',
        'aria-label': t('exercise.typeLetter', { letra }),
        onclick: () => {
          const inicio = entrada.selectionStart ?? entrada.value.length;
          const fin = entrada.selectionEnd ?? inicio;
          entrada.setRangeText(letra, inicio, fin, 'end');
          entrada.focus();
        },
      }, letra)));
    const comprobar = el('button', { type: 'submit', class: 'boton boton-principal' }, t('exercise.check'));
    const form = el('form', { class: 'formulario-escribir' },
      el('div', { class: 'fila-escribir' }, entrada, comprobar),
      letras);
    const zonas = estructura(
      bloque.frase && el('p', { class: 'ejercicio-frase', lang: 'pt-PT' }, bloque.frase),
      form);

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!entrada.value.trim()) {
        entrada.focus();
        return;
      }
      const escrito = normalizarRespuesta(entrada.value);
      const acierto = bloque.respuestas.some(r => normalizarRespuesta(r) === escrito);
      entrada.readOnly = true;
      comprobar.disabled = true;
      letras.querySelectorAll('button').forEach(b => { b.disabled = true; });

      let mensajes;
      if (acierto) {
        mensajes = [alAzar(lista('tutor.praise')), tr(bloque.explicacion)];
      } else {
        const soloTildes = bloque.respuestas.some(r => quitarTildes(normalizarRespuesta(r)) === quitarTildes(escrito));
        const cerca = bloque.respuestas.some(r => casiIgual(normalizarRespuesta(r), escrito));
        mensajes = [
          soloTildes ? t('exercise.accentsHint') : cerca ? t('exercise.almost') : alAzar(lista('tutor.oops')),
          t('exercise.correctIs', { respuesta: bloque.respuestas[0] }),
          bloque.respuestas.length > 1 ? t('exercise.alsoValid', { respuestas: bloque.respuestas.slice(1).join(' / ') }) : null,
          tr(bloque.explicacion),
        ];
      }
      resolver(acierto, mensajes.filter(Boolean), zonas);
    });
  }

  // ---- Ordenar las palabras ------------------------------------------------

  function pintarOrdenar() {
    // Los signos de puntuación (? ! , .) no se ordenan: delatarían la última palabra.
    const palabras = bloque.frase.split(/\s+/).map(p => p.replace(/^[¿¡]+/, '').replace(/[.,!?;:]+$/, ''));
    let orden = barajar(palabras.map((_, i) => i));
    // Que no salga ya ordenada.
    for (let intento = 0; intento < 5 && orden.every((v, i) => v === i); intento++) orden = barajar(orden);

    const elegidas = [];
    const banco = el('div', { class: 'banco-palabras', role: 'group', 'aria-label': t('exercise.availableWords') });
    const respuesta = el('div', { class: 'respuesta-ordenar', 'aria-live': 'polite', 'aria-label': t('exercise.yourSentence') });
    const comprobar = el('button', { type: 'button', class: 'boton boton-principal', disabled: true }, t('exercise.check'));
    const borrar = el('button', { type: 'button', class: 'boton boton-mini' }, t('exercise.clear'));
    let resuelto = false;

    function repintar() {
      poner(respuesta, elegidas.length
        ? elegidas.map((i, k) => el('button', {
          type: 'button', class: 'pieza pieza-elegida', lang: 'pt-PT', disabled: resuelto,
          'aria-label': t('exercise.removeWord', { palabra: palabras[i] }),
          onclick: () => { elegidas.splice(k, 1); sonar('clic'); repintar(); },
        }, palabras[i]))
        : el('span', { class: 'aprox' }, t('exercise.tapInOrder')));
      poner(banco, orden.map(i => el('button', {
        type: 'button', class: 'pieza', lang: 'pt-PT', disabled: resuelto || elegidas.includes(i),
        onclick: () => { elegidas.push(i); sonar('clic'); repintar(); banco.querySelector('.pieza:not(:disabled)')?.focus(); },
      }, palabras[i])));
      comprobar.disabled = resuelto || elegidas.length !== palabras.length;
      borrar.disabled = resuelto || !elegidas.length;
    }

    borrar.addEventListener('click', () => { elegidas.length = 0; repintar(); });

    const zonas = estructura(
      bloque.traduccion && el('p', { class: 'aprox' }, `«${tr(bloque.traduccion)}»`),
      respuesta,
      banco,
      el('div', { class: 'botonera' }, comprobar, borrar));

    comprobar.addEventListener('click', () => {
      const escrito = normalizarRespuesta(elegidas.map(i => palabras[i]).join(' '));
      const acierto = escrito === normalizarRespuesta(bloque.frase);
      resuelto = true;
      repintar();
      respuesta.classList.add(acierto ? 'es-correcta' : 'es-fallo');
      const mensajes = acierto
        ? [alAzar(lista('tutor.praise')), tr(bloque.explicacion)]
        : [alAzar(lista('tutor.oops')), t('exercise.correctOrder', { frase: bloque.frase }), tr(bloque.explicacion)];
      resolver(acierto, mensajes.filter(Boolean), zonas);
    });

    repintar();
  }

  pintar();
  return seccion;
}

/** Botones de escuchar (normal y despacio) y, por si no hay voz, ver el texto. */
function controlesAudio(texto) {
  const escuchar = lento => () => {
    if (!pronunciar(texto, { lento })) decir(ayudaVoz(), 'apurada');
  };
  const oculto = el('p', { class: 'audio-texto', lang: 'pt-PT', hidden: true }, texto);
  const ver = el('button', { type: 'button', class: 'boton boton-mini' }, t('exercise.showText'));
  ver.addEventListener('click', () => { oculto.hidden = false; ver.remove(); });
  return el('div', { class: 'controles-audio' },
    el('button', { type: 'button', class: 'boton boton-principal boton-escuchar', onclick: escuchar(false) }, `🔊 ${t('common.listen')}`),
    el('button', { type: 'button', class: 'boton', onclick: escuchar(true) }, `🐢 ${t('exercise.slowly')}`),
    ver,
    oculto);
}

/** Muestra la frase; en los huecos, «___» se convierte en un espacio marcado. */
function pintarHueco(frase, relleno = null) {
  const partes = frase.split(/_{2,}/);
  const nodos = [];
  partes.forEach((parte, i) => {
    nodos.push(parte);
    if (i < partes.length - 1) nodos.push(el('span', { class: 'hueco' }, relleno ?? '   '));
  });
  return nodos;
}

/** Para comparar respuestas: sin mayúsculas, sin signos y con espacios simples. Las tildes SÍ cuentan. */
export function normalizarRespuesta(texto) {
  return String(texto)
    .normalize('NFC')
    .toLocaleLowerCase('pt')
    .replace(/[.,!?¡¿;:"«»“”'’()…-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** «não» → «nao», «coração» → «coracao»: para avisar de que solo fallan los acentos o la cedilla. */
export function quitarTildes(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** ¿Solo se diferencian en una o dos letras? */
export function casiIgual(a, b) {
  const margen = Math.max(1, Math.floor(a.length / 12));
  if (Math.abs(a.length - b.length) > margen) return false;
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const arriba = fila[j];
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = arriba;
    }
  }
  return fila[b.length] <= margen;
}
