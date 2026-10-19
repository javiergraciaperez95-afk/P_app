// Ejercicios de la lección.
// - test, traduccion y huecos: elegir una opción (comparten formato).
// - escribir: escribir la respuesta (con botones para á, é, í, ó, ú, ñ, ü, ¿, ¡).
// - ordenar: ordenar las palabras de una frase.

import { el, enLinea, barajar, alAzar, poner } from './dom.js';
import { t, tr } from './i18n.js';
import { decir } from './tutor.js';
import { registrarRespuesta, estadoEjercicio } from './progress.js';
import { sonar, pronunciar, ayudaVoz, hayVoz } from './sonidos.js';
import { LANG, curso } from './curso.js';

// Letras que no tienen los teclados ingleses ni vietnamitas.
const LETRAS_ESPECIALES = curso.letras; // las letras que no están en un teclado normal

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
    const autoevaluacion = acierto === null;
    if (!autoevaluacion) sonar(acierto ? 'bien' : 'mal');
    registrarRespuesta(idLeccion, bloque.id, acierto);
    fallosSeguidos = acierto === false ? fallosSeguidos + 1 : 0;

    feedback.hidden = false;
    feedback.className = `feedback ${autoevaluacion ? 'autoevaluacion' : acierto ? 'bien' : 'mal'}`;
    poner(feedback,
      el('p', { class: 'feedback-titulo' }, t(autoevaluacion ? 'ej.autoTitulo' : acierto ? 'ej.correcto' : 'ej.incorrecto')),
      ...mensajes.map(m => el('p', {}, enLinea(m))));
    feedback.focus({ preventScroll: true });

    let expresion = acierto === false ? 'pensando' : 'contenta';
    if (!acierto && fallosSeguidos >= 2) expresion = 'pensando';
    if (bloque.tutora && acierto === false) expresion = bloque.tutora;
    const animo = acierto === false && fallosSeguidos >= 2 ? t('ej.seResiste') : null;
    if (!autoevaluacion) decir([animo, ...mensajes].filter(Boolean).join(' '), expresion);

    pintarPie(pie, true);
    alResponder();
  }

  function pintarPie(pie, respondido) {
    const e = estadoEjercicio(idLeccion, bloque.id);
    const datos = e.ultimo === null && e.completado
      ? t('ej.autoevaluado')
      : e.intentos
        ? t('ej.estadisticas', { intentos: e.intentos, aciertos: e.aciertos, errores: e.errores })
      : t('ej.sinResponder');
    poner(pie, el('span', {}, datos));
    if (respondido) {
      pie.append(el('button', {
        type: 'button',
        class: 'boton boton-mini',
        onclick: () => {
          pintar();
          seccion.querySelector('.opcion, input, textarea, .pieza')?.focus();
        },
      }, t('ej.repetir')));
    }
  }

  /** Cabecera, pregunta y zonas de respuesta comunes. */
  function estructura(...contenido) {
    let pregunta = tr(bloque.pregunta) || (['traduccion', 'huecos', 'ordenar'].includes(bloque.tipo) ? t(`ej.pregunta.${bloque.tipo}`) : '');
    if (bloque.audio && !hayVoz()) pregunta = sinOido(pregunta);
    const feedback = el('div', { class: 'feedback', hidden: true, tabindex: '-1', 'aria-live': 'polite' });
    const pie = el('div', { class: 'ejercicio-pie' });
    const oido = bloque.audio ? controlesAudio(bloque.audio, bloque.audioRevela) : null;
    poner(seccion,
      el('span', { class: 'etiqueta-bloque' }, `${t('ej.ejercicio', { n: numero })} · `, bloque.audio && el('span', { class: 'con-voz' }, `🔊 ${t('ej.escucha')} · `), t(`ej.tipo.${bloque.autoevaluacion ? 'autoevaluacion' : bloque.tipo}`)),
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
    const frase = bloque.frase ? el('p', { class: 'ejercicio-frase', lang: LANG }, pintarHueco(bloque.frase)) : null;
    const lista = el('ul', { class: 'opciones' });
    const zonas = estructura(frase, lista);
    const botones = new Map(); // opción → botón

    barajar(bloque.opciones).forEach((opcion, i) => {
      const boton = el('button', { type: 'button', class: 'boton opcion' },
        el('span', { class: 'opcion-letra', 'aria-hidden': 'true' }, 'ABCDEFGH'[i]),
        el('span', { class: 'opcion-texto' }, tr(opcion.texto)),
        el('span', { class: 'opcion-marca' }));
      boton.addEventListener('click', () => responder(opcion));
      botones.set(opcion, boton);
      lista.append(el('li', {}, boton));
    });

    function responder(elegida) {
      const correcta = bloque.opciones.find(o => o.correcta);
      for (const [opcion, boton] of botones) {
        boton.disabled = true;
        const marca = boton.querySelector('.opcion-marca');
        if (opcion === correcta) {
          boton.classList.add('es-correcta');
          marca.textContent = t('ej.marcaCorrecta');
        } else if (opcion === elegida) {
          boton.classList.add('es-fallo');
          marca.textContent = t('ej.marcaTuya');
        } else {
          boton.classList.add('es-neutra');
        }
      }
      if (bloque.tipo === 'huecos' && frase) poner(frase, ...pintarHueco(bloque.frase, tr(correcta.texto)));

      const mensajes = elegida.correcta
        ? [alAzar(t('ej.felicitaciones')), tr(correcta.explicacion)]
        : [
          `${alAzar(t('ej.animosError'))} ${tr(elegida.explicacion)}`.trim(),
          t('ej.laCorrectaEs', { texto: tr(correcta.texto) }),
          tr(correcta.explicacion),
        ];
      resolver(elegida.correcta, mensajes.filter(Boolean), zonas);
    }
  }

  // ---- Escribir la respuesta -----------------------------------------------

  function pintarEscribir() {
    const id = `escribir-${numero}`;
    const entrada = el(bloque.autoevaluacion ? 'textarea' : 'input', {
      id, ...(bloque.autoevaluacion ? { rows: 5 } : { type: 'text' }),
      lang: LANG, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-labelledby': `ej-${numero}`,
    });
    const letras = el('div', { class: 'letras-especiales', role: 'group', 'aria-label': t('ej.letrasEspeciales'), hidden: !LETRAS_ESPECIALES.length },
      LETRAS_ESPECIALES.map(letra => el('button', {
        type: 'button',
        class: 'boton boton-mini',
        lang: LANG,
        'aria-label': t('ej.escribirLetra', { letra }),
        onclick: () => {
          const inicio = entrada.selectionStart ?? entrada.value.length;
          const fin = entrada.selectionEnd ?? inicio;
          entrada.setRangeText(letra, inicio, fin, 'end');
          entrada.focus();
        },
      }, letra)));
    const comprobar = el('button', { type: 'submit', class: 'boton boton-principal' }, t('ej.comprobar'));
    const form = el('form', { class: 'formulario-escribir' },
      el('div', { class: 'fila-escribir' }, entrada, comprobar),
      letras);
    const zonas = estructura(
      bloque.frase && el('p', { class: 'ejercicio-frase', lang: LANG }, bloque.frase),
      form);

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!entrada.value.trim()) {
        entrada.focus();
        return;
      }
      const respuestas = [].concat(tr(bloque.respuestas));
      const escrito = normalizarRespuesta(entrada.value);
      const acierto = respuestas.some(r => normalizarRespuesta(r) === escrito);
      entrada.readOnly = true;
      comprobar.disabled = true;
      letras.querySelectorAll('button').forEach(b => { b.disabled = true; });

      let mensajes;
      if (bloque.autoevaluacion) {
        mensajes = [
          t('ej.autoInstruccion'),
          bloque.explicacion ? `${t('ej.autoCriterios')} ${tr(bloque.explicacion)}` : null,
          respuestas[0] ? t('ej.autoModelo', { texto: respuestas[0] }) : null,
        ];
        resolver(null, mensajes.filter(Boolean), zonas);
        return;
      } else if (acierto) {
        mensajes = [alAzar(t('ej.felicitaciones')), tr(bloque.explicacion)];
      } else {
        // Lo más típico: todo bien salvo las tildes o la ñ.
        const tildes = respuestas.some(r => sinTildes(normalizarRespuesta(r)) === sinTildes(escrito));
        const cerca = respuestas.some(r => casiIgual(normalizarRespuesta(r), escrito));
        mensajes = [
          tildes ? t('ej.revisaTildes') : cerca ? t('ej.casiPerfecto') : alAzar(t('ej.animosError')),
          t('ej.loCorrectoEs', { texto: respuestas[0] }),
          respuestas.length > 1 ? t('ej.tambienVale', { texto: respuestas.slice(1).join(' / ') }) : null,
          tr(bloque.explicacion),
        ];
      }
      resolver(acierto, mensajes.filter(Boolean), zonas);
    });
  }

  // ---- Ordenar las palabras ------------------------------------------------

  function pintarOrdenar() {
    const palabras = bloque.frase.split(/\s+/).map(p => p.replace(/[.,!?;:]+$/, ''));
    let orden = barajar(palabras.map((_, i) => i));
    // Que no salga ya ordenada.
    for (let intento = 0; intento < 5 && orden.every((v, i) => v === i); intento++) orden = barajar(orden);

    const elegidas = [];
    const banco = el('div', { class: 'banco-palabras', role: 'group', 'aria-label': t('ej.palabrasDisponibles') });
    const respuesta = el('div', { class: 'respuesta-ordenar', 'aria-live': 'polite', 'aria-label': t('ej.tuFrase') });
    const comprobar = el('button', { type: 'button', class: 'boton boton-principal', disabled: true }, t('ej.comprobar'));
    const borrar = el('button', { type: 'button', class: 'boton boton-mini' }, t('ej.borrar'));
    let resuelto = false;

    function repintar() {
      poner(respuesta, elegidas.length
        ? elegidas.map((i, k) => el('button', {
          type: 'button', class: 'pieza pieza-elegida', lang: LANG, disabled: resuelto,
          'aria-label': t('ej.quitarPalabra', { texto: palabras[i] }),
          onclick: () => { elegidas.splice(k, 1); sonar('desmarcar'); repintar(); },
        }, palabras[i]))
        : el('span', { class: 'aprox' }, t('ej.tocaEnOrden')));
      poner(banco, orden.map(i => el('button', {
        type: 'button', class: 'pieza', lang: LANG, disabled: resuelto || elegidas.includes(i),
        onclick: () => { elegidas.push(i); sonar('elegir'); repintar(); banco.querySelector('.pieza:not(:disabled)')?.focus(); },
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
        ? [alAzar(t('ej.felicitaciones')), tr(bloque.explicacion)]
        : [alAzar(t('ej.animosError')), t('ej.ordenCorrecto', { texto: bloque.frase }), tr(bloque.explicacion)];
      resolver(acierto, mensajes.filter(Boolean), zonas);
    });

    repintar();
  }

  pintar();
  return seccion;
}

/** Sin voz, un ejercicio de escucha se hace leyendo: se le quita a la pregunta lo de «escucha». */
function sinOido(pregunta) {
  const p = pregunta
    .replace(/^(Escucha|Listen|Nghe)\s*[.:]\s*/i, '')
    .replace(/¿Qué has oído\?/i, '¿Qué significa?')
    .replace(/What did you hear\?/i, 'What does it mean?');
  return p.charAt(0).toLocaleUpperCase() + p.slice(1);
}

/**
 * Botones de escuchar (normal y despacio) y de ver el texto. Sin voz en el dispositivo, los botones no se ven
 * y el texto sale escrito: el ejercicio pasa a ser de lectura. Si el texto es la solución (revela), no sale nada.
 */
function controlesAudio(texto, revela = false) {
  const escuchar = lento => () => {
    if (!pronunciar(texto, { lento })) decir(ayudaVoz(), 'apurada');
  };
  const oculto = el('p', { class: revela ? 'audio-texto' : 'audio-texto sin-voz-visible', lang: LANG, hidden: true }, texto);
  const ver = el('button', { type: 'button', class: 'boton boton-mini con-voz' }, t('ej.verTexto'));
  ver.addEventListener('click', () => { oculto.hidden = false; ver.remove(); });
  return el('div', { class: 'controles-audio' },
    el('button', { type: 'button', class: 'boton boton-principal boton-escuchar con-voz', onclick: escuchar(false) }, `🔊 ${t('comun.escuchar')}`),
    el('button', { type: 'button', class: 'boton con-voz', onclick: escuchar(true) }, t('ej.despacio')),
    ver,
    oculto);
}

/** Muestra la frase; en los huecos, «___» se convierte en un espacio marcado. */
function pintarHueco(frase, relleno = null) {
  const partes = frase.split(/_{2,}/);
  const nodos = [];
  partes.forEach((parte, i) => {
    nodos.push(parte);
    if (i < partes.length - 1) nodos.push(el('span', { class: 'hueco' }, relleno ?? '   '));
  });
  return nodos;
}

/** Para comparar respuestas: sin mayúsculas, sin signos y con espacios simples. */
export function normalizarRespuesta(texto) {
  return String(texto)
    .toLocaleLowerCase(LANG)
    .replace(/[.,!?¡¿;:"«»“”'’()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Quita las tildes, la diéresis y la virgulilla de la ñ (á → a, ü → u, ñ → n). */
function sinTildes(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** ¿Solo se diferencian en una o dos letras? */
function casiIgual(a, b) {
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
