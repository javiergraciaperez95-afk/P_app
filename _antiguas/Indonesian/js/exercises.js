// Ejercicios de la lección.
// - test, traduccion y huecos: elegir una opción (comparten formato).
// - escribir: escribir la respuesta. El indonesio usa el alfabeto latino, sin letras extra.
// - ordenar: ordenar las palabras de una frase.

import { el, enLinea, barajar, alAzar, poner } from './dom.js';
import { decir } from './tutor.js';
import { registrarRespuesta, estadoEjercicio } from './progress.js';
import { sonar, pronunciar, AYUDA_VOZ } from './sonidos.js';

const ETIQUETAS = {
  test: 'Test',
  traduccion: 'Traducción',
  huecos: 'Completa el hueco',
  escribir: 'Escribe',
  ordenar: 'Ordena la frase',
};

const PREGUNTA_POR_DEFECTO = {
  traduccion: '¿Qué significa esta frase?',
  huecos: 'Elige la palabra que falta:',
  ordenar: 'Ordena las palabras para formar la frase:',
};

const FELICITACIONES = [
  '¡Correcto! Se nota quién es tu profesora.',
  '¡Eso es! Vas muy bien.',
  '¡Perfecto! Ni yo lo habría dicho mejor… bueno, quizá un poquito mejor.',
  '¡Bien hecho! Así me gusta.',
];

const ANIMOS_ERROR = [
  'Casi.',
  'Uy, no del todo.',
  'Buen intento, pero no.',
  'Mmm, esta vez no.',
];

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
      el('p', { class: 'feedback-titulo' }, acierto ? '✔ ¡Correcto!' : '✘ No es correcto'),
      ...mensajes.map(m => el('p', {}, enLinea(m))));
    feedback.focus({ preventScroll: true });

    let expresion = acierto ? 'contenta' : 'pensando';
    if (!acierto && fallosSeguidos >= 2) expresion = 'apurada';
    if (bloque.tutora && !acierto) expresion = bloque.tutora;
    const animo = !acierto && fallosSeguidos >= 2
      ? '¡Ay! Este se te resiste, ¿eh? Tranquilidad, que para eso estoy yo.'
      : null;
    decir([animo, ...mensajes].filter(Boolean).join(' '), expresion);

    pintarPie(pie, true);
    alResponder();
  }

  function pintarPie(pie, respondido) {
    const e = estadoEjercicio(idLeccion, bloque.id);
    const datos = e.intentos
      ? `Intentos: ${e.intentos} · Aciertos: ${e.aciertos} · Errores: ${e.errores}`
      : 'Sin responder todavía';
    poner(pie, el('span', {}, datos));
    if (respondido) {
      pie.append(el('button', {
        type: 'button',
        class: 'boton boton-mini',
        onclick: () => {
          pintar();
          seccion.querySelector('.opcion, input, .pieza')?.focus();
        },
      }, '↺ Repetir'));
    }
  }

  /** Cabecera, pregunta y zonas de respuesta comunes. */
  function estructura(...contenido) {
    const pregunta = bloque.pregunta || PREGUNTA_POR_DEFECTO[bloque.tipo] || '';
    const feedback = el('div', { class: 'feedback', hidden: true, tabindex: '-1', 'aria-live': 'polite' });
    const pie = el('div', { class: 'ejercicio-pie' });
    const oido = bloque.audio ? controlesAudio(bloque.audio) : null;
    poner(seccion,
      el('span', { class: 'etiqueta-bloque' }, `Ejercicio ${numero} · ${bloque.audio ? '🔊 Escucha · ' : ''}${ETIQUETAS[bloque.tipo]}`),
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
    const frase = bloque.frase ? el('p', { class: 'ejercicio-frase' }, pintarHueco(bloque.frase)) : null;
    const lista = el('ul', { class: 'opciones' });
    const zonas = estructura(frase, lista);

    barajar(bloque.opciones).forEach((opcion, i) => {
      const boton = el('button', { type: 'button', class: 'boton opcion' },
        el('span', { class: 'opcion-letra', 'aria-hidden': 'true' }, 'ABCDEFGH'[i]),
        el('span', { class: 'opcion-texto' }, opcion.texto),
        el('span', { class: 'opcion-marca' }));
      boton.addEventListener('click', () => responder(opcion, boton));
      lista.append(el('li', {}, boton));
    });

    function responder(elegida, botonElegido) {
      const correcta = bloque.opciones.find(o => o.correcta);
      for (const boton of lista.querySelectorAll('button')) {
        boton.disabled = true;
        const marca = boton.querySelector('.opcion-marca');
        if (boton.querySelector('.opcion-texto').textContent === correcta.texto) {
          boton.classList.add('es-correcta');
          marca.textContent = '✔ Correcta';
        } else if (boton === botonElegido) {
          boton.classList.add('es-fallo');
          marca.textContent = '✘ Tu respuesta';
        } else {
          boton.classList.add('es-neutra');
        }
      }
      if (bloque.tipo === 'huecos' && frase) poner(frase, ...pintarHueco(bloque.frase, correcta.texto));

      const mensajes = elegida.correcta
        ? [alAzar(FELICITACIONES), correcta.explicacion]
        : [
          `${alAzar(ANIMOS_ERROR)} ${elegida.explicacion || ''}`.trim(),
          `La respuesta correcta es **${correcta.texto}**.`,
          correcta.explicacion,
        ];
      resolver(elegida.correcta, mensajes.filter(Boolean), zonas);
    }
  }

  // ---- Escribir la respuesta -----------------------------------------------

  function pintarEscribir() {
    const id = `escribir-${numero}`;
    const entrada = el('input', {
      id, type: 'text', lang: 'id', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
      'aria-labelledby': `ej-${numero}`,
    });
    const comprobar = el('button', { type: 'submit', class: 'boton boton-principal' }, 'Comprobar');
    const form = el('form', { class: 'formulario-escribir' },
      el('div', { class: 'fila-escribir' }, entrada, comprobar));
    const zonas = estructura(
      bloque.frase && el('p', { class: 'ejercicio-frase' }, bloque.frase),
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

      let mensajes;
      if (acierto) {
        mensajes = [alAzar(FELICITACIONES), bloque.explicacion];
      } else {
        const cerca = bloque.respuestas.some(r => casiIgual(normalizarRespuesta(r), escrito));
        mensajes = [
          cerca ? '¡Casi perfecto! Solo hay una pequeña diferencia: revisa letra por letra.' : alAzar(ANIMOS_ERROR),
          `Lo correcto es: **${bloque.respuestas[0]}**.`,
          bloque.respuestas.length > 1 ? `También vale: ${bloque.respuestas.slice(1).join(' / ')}.` : null,
          bloque.explicacion,
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
    const banco = el('div', { class: 'banco-palabras', role: 'group', 'aria-label': 'Palabras disponibles' });
    const respuesta = el('div', { class: 'respuesta-ordenar', 'aria-live': 'polite', 'aria-label': 'Tu frase' });
    const comprobar = el('button', { type: 'button', class: 'boton boton-principal', disabled: true }, 'Comprobar');
    const borrar = el('button', { type: 'button', class: 'boton boton-mini' }, 'Borrar');
    let resuelto = false;

    function repintar() {
      poner(respuesta, elegidas.length
        ? elegidas.map((i, k) => el('button', {
          type: 'button', class: 'pieza pieza-elegida', lang: 'id', disabled: resuelto,
          'aria-label': `Quitar «${palabras[i]}»`,
          onclick: () => { elegidas.splice(k, 1); sonar('clic'); repintar(); },
        }, palabras[i]))
        : el('span', { class: 'aprox' }, 'Toca las palabras en el orden correcto.'));
      poner(banco, orden.map(i => el('button', {
        type: 'button', class: 'pieza', lang: 'id', disabled: resuelto || elegidas.includes(i),
        onclick: () => { elegidas.push(i); sonar('clic'); repintar(); banco.querySelector('.pieza:not(:disabled)')?.focus(); },
      }, palabras[i])));
      comprobar.disabled = resuelto || elegidas.length !== palabras.length;
      borrar.disabled = resuelto || !elegidas.length;
    }

    borrar.addEventListener('click', () => { elegidas.length = 0; repintar(); });

    const zonas = estructura(
      bloque.traduccion && el('p', { class: 'aprox' }, `«${bloque.traduccion}»`),
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
        ? [alAzar(FELICITACIONES), bloque.explicacion]
        : [alAzar(ANIMOS_ERROR), `El orden correcto es: **${bloque.frase}**`, bloque.explicacion];
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
    if (!pronunciar(texto, { lento })) decir(AYUDA_VOZ, 'apurada');
  };
  const oculto = el('p', { class: 'audio-texto', lang: 'id', hidden: true }, texto);
  const ver = el('button', { type: 'button', class: 'boton boton-mini' }, 'Ver texto');
  ver.addEventListener('click', () => { oculto.hidden = false; ver.remove(); });
  return el('div', { class: 'controles-audio' },
    el('button', { type: 'button', class: 'boton boton-principal boton-escuchar', onclick: escuchar(false) }, '🔊 Escuchar'),
    el('button', { type: 'button', class: 'boton', onclick: escuchar(true) }, '🐢 Despacio'),
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
    .toLocaleLowerCase('id')
    .replace(/[.,!?¡¿;:"«»“”'’()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
