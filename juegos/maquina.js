// =====================================================================
// LA MÁQUINA DE ESCRIBIR — juego para escribir la respuesta (bloque «escribir»)
// ---------------------------------------------------------------------
// Una máquina de escribir pixel: la pregunta está en el cartel y la respuesta se teclea de verdad
// (un campo de texto normal: sirve el teclado del móvil) sobre el papel, con su tecleo y su campanilla.
// Vale cualquiera de las respuestas del bloque, sin importar mayúsculas, tildes ni signos. Si casi está
// bien, la tutora da una pista; tras dos fallos se enseña la respuesta y hay que copiarla a máquina.
// Cada intento se apunta (copiar la respuesta, no). Vale para cualquier idioma: solo usa los datos del bloque.
// =====================================================================

import { el, poner, enLinea } from '../js/dom.js';
import { normalizarRespuesta } from '../js/exercises.js';
import { curso } from '../js/curso.js';

const respuestasDe = (bloque, tr) => [].concat(tr(bloque.respuestas)).map(r => String(r ?? '').trim()).filter(Boolean);

export const juego = {
  nombre: 'maquina',
  icono: '⌨️',
  tipos: ['escribir'],
  sirve: (bloque, ctx) => !bloque.autoevaluacion && respuestasDe(bloque, ctx.tr).length > 0,
};

/** Quita las tildes, la diéresis y la virgulilla (á → a, ü → u, ñ → n). */
const sinTildes = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Distancia de edición entre dos textos (letras que hay que cambiar, quitar o poner). */
function distancia(a, b) {
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
  return fila[b.length];
}

export function crear(bloque, ctx) {
  const { t, tr, sonar, alAzar } = ctx;
  const temporizadores = new Set();
  const luego = (fn, ms) => {
    const id = setTimeout(() => { temporizadores.delete(id); fn(); }, ms);
    temporizadores.add(id);
  };
  const respuestas = respuestasDe(bloque, tr);
  const aceptadas = respuestas.map(r => normalizarRespuesta(r));
  const letras = Array.isArray(curso.letras) ? curso.letras : [];
  let fallos = 0;
  let copiando = false;
  let terminado = false;
  let largo = 0;

  const pista = el('p', { class: 'jg-pista' }, t('jg.maquina.pista'));
  const nota = el('p', { class: 'jg-maquina-nota', 'aria-live': 'polite', hidden: true });
  const modelo = el('div', { class: 'jg-maquina-modelo', hidden: true });
  const final = el('div', { class: 'jg-maquina-final', hidden: true, 'aria-live': 'polite' });
  const entrada = el('input', {
    type: 'text', class: 'jg-maquina-entrada', lang: ctx.LANG, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
    enterkeyhint: 'done', 'aria-label': t('jg.maquina.papel'),
  });
  const comprobar = el('button', { type: 'submit', class: 'es-boton jg-maquina-palanca' }, `↵ ${t('jg.maquina.comprobar')}`);
  const aparato = el('div', { class: 'jg-maquina-aparato' });
  const papel = el('div', { class: 'jg-maquina-papel' },
    el('span', { class: 'jg-maquina-membrete', 'aria-hidden': 'true' }, '▌'),
    entrada);

  const teclas = el('div', { class: 'jg-maquina-letras', role: 'group', 'aria-label': t('ej.letrasEspeciales'), hidden: !letras.length },
    letras.map(letra => el('button', {
      type: 'button', class: 'jg-maquina-tecla', lang: ctx.LANG, 'aria-label': t('ej.escribirLetra', { letra }),
      onclick: () => {
        if (terminado) return;
        const inicio = entrada.selectionStart ?? entrada.value.length;
        const fin = entrada.selectionEnd ?? inicio;
        entrada.setRangeText(letra, inicio, fin, 'end');
        entrada.focus();
        teclear();
      },
    }, letra)));

  const form = el('form', { class: 'jg-maquina-form', autocomplete: 'off' },
    papel,
    el('div', { class: 'jg-maquina-rodillo', 'aria-hidden': 'true' }),
    el('div', { class: 'jg-maquina-cuerpo' },
      el('span', { class: 'jg-maquina-adorno', 'aria-hidden': 'true' }),
      comprobar),
    teclas);
  poner(aparato, form);

  /** Cada golpe de tecla: suena y la máquina da un saltito. */
  function teclear() {
    const nuevo = entrada.value.length;
    if (nuevo < largo) sonar('borrar');
    else sonar(/\s$/.test(entrada.value) ? 'espacio' : 'tecla');
    largo = nuevo;
    aparato.classList.remove('golpe');
    void aparato.offsetWidth;
    aparato.classList.add('golpe');
  }
  entrada.addEventListener('input', teclear);

  function sacudir() {
    papel.classList.remove('tiembla');
    void papel.offsetWidth;
    papel.classList.add('tiembla');
  }

  /** La respuesta más cercana a lo escrito (para pistas y para enseñarla). */
  function masCercana(escrito) {
    let mejor = 0;
    aceptadas.forEach((a, i) => { if (distancia(a, escrito) < distancia(aceptadas[mejor], escrito)) mejor = i; });
    return mejor;
  }

  function mostrarModelo(texto) {
    modelo.hidden = false;
    poner(modelo,
      el('span', { class: 'jg-maquina-etiqueta' }, t('jg.maquina.modelo')),
      el('p', { class: 'jg-maquina-modelo-texto', lang: ctx.LANG }, texto, ' ',
        el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(texto) }, '🔊')));
  }

  function mensaje(texto, expresion) {
    nota.hidden = false;
    poner(nota, enLinea(texto));
    ctx.decir(texto, expresion);
  }

  function terminar(texto, nueva) {
    terminado = true;
    entrada.readOnly = true;
    comprobar.disabled = true;
    for (const b of teclas.querySelectorAll('button')) b.disabled = true;
    papel.classList.add('listo');
    sonar('campana');
    if (nueva) luego(() => sonar('bien'), 250);
    const explicacion = tr(bloque.explicacion);
    pista.textContent = t('jg.maquina.listo');
    mensaje([nueva ? alAzar(t('ej.felicitaciones')) : t('jg.maquina.copiado'), explicacion].filter(Boolean).join(' '), 'contenta');
    modelo.hidden = true;
    final.hidden = false;
    const { nodo } = ctx.frase(texto);
    poner(final,
      el('p', { class: 'jg-maquina-frase', lang: ctx.LANG }, nodo, ' ',
        el('button', { type: 'button', class: 'jg-oir', 'aria-label': t('comun.escuchar'), onclick: () => ctx.oir(texto) }, '🔊')));
    ctx.leerSiHayVoz(texto);
    ctx.hecho();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (terminado) return;
    const escrito = normalizarRespuesta(entrada.value);
    if (!escrito) { sacudir(); entrada.focus(); return; }
    const i = aceptadas.indexOf(escrito);
    if (copiando) {
      if (i >= 0) { terminar(respuestas[i], false); return; }
      sonar('mal');
      sacudir();
      mensaje(t('jg.maquina.copiaIgual'), 'pensando');
      entrada.select();
      return;
    }
    if (i >= 0) { ctx.registrar(bloque, true); terminar(respuestas[i], true); return; }

    // fallo: se apunta, suena y la tutora ayuda
    fallos += 1;
    ctx.registrar(bloque, false);
    sonar('mal');
    sacudir();
    const cerca = masCercana(escrito);
    const solo = aceptadas.some(a => sinTildes(a) === sinTildes(escrito));
    const margen = Math.max(1, Math.floor(aceptadas[cerca].length / 12));
    const casi = distancia(aceptadas[cerca], escrito) <= margen && Math.abs(aceptadas[cerca].length - escrito.length) <= margen;
    if (fallos >= 2) {
      copiando = true;
      mostrarModelo(respuestas[cerca]);
      entrada.value = '';
      largo = 0;
      pista.textContent = t('jg.maquina.copia');
      mensaje(`${t('jg.maquina.seEnsena')} ${t('jg.maquina.copia')}`, 'pensando');
      entrada.focus();
      return;
    }
    const aviso = solo ? t('ej.revisaTildes') : casi ? t('ej.casiPerfecto') : `${alAzar(t('ej.animosError'))} ${t('jg.maquina.otra')}`;
    pista.textContent = solo || casi ? t('jg.maquina.casi') : t('jg.maquina.otra');
    mensaje(aviso, 'pensando');
    entrada.select();
  });

  const pregunta = tr(bloque.pregunta);
  const nodo = el('div', { class: 'jg-maquina' },
    el('header', { class: 'jg-encabezado' }, el('h2', {}, t('jg.maquina.titulo'))),
    pista,
    el('div', { class: 'jg-maquina-cartel' },
      pregunta && el('p', { class: 'jg-maquina-pregunta' }, enLinea(pregunta)),
      bloque.frase && el('p', { class: 'jg-maquina-frase-dada', lang: ctx.LANG }, bloque.frase)),
    modelo,
    aparato,
    nota,
    final);
  luego(() => entrada.focus({ preventScroll: true }), 60);
  return { nodo, apagar: () => { for (const id of temporizadores) clearTimeout(id); temporizadores.clear(); } };
}
