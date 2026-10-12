// Vista de una lección: pinta los bloques en orden, como las páginas de un libro.
// Todo lo que está en portugués lleva lang="pt-PT"; las traducciones y explicaciones
// salen en el idioma de la interfaz (inglés o vietnamita) con tr().

import { el, textoConFormato, poner, enLinea } from '../dom.js';
import { normalizarPalabra, textoAviso } from '../lessons.js';
import { crearEjercicio } from '../exercises.js';
import { decir } from '../tutor.js';
import { resumenLeccion, marcarTerminada, marcarAbierta } from '../progress.js';
import { botonEscuchar, botonGuardar, analisisDesplegable, textoAnalisis, nombreGramatical } from '../comunes.js';
import { sonar, pronunciarSeguido, callar, ayudaVoz } from '../sonidos.js';
import { t, tr } from '../i18n.js';
import { listaAvisos } from './lecciones.js';

function etiquetaGenero(genero) {
  return genero ? t(`grammar.gender.${genero}`) : null;
}

// ---------------------------------------------------------------------------
// Ficha de palabra (aparece al pasar el ratón o al tocar una palabra)
// ---------------------------------------------------------------------------

const ficha = document.getElementById('ficha-palabra');
let botonFicha = null;
let fichaFijada = false;
let cierrePendiente = null;
let origenActual = '';
let contadorAnalisis = 0;

function itemPalabra(entrada) {
  return { pt: entrada.pt, trad: entrada.trad, pron: entrada.pron, nota: entrada.nota || entrada.consejo, tipo: entrada.pt.includes(' ') ? 'frase' : 'palabra', origen: origenActual };
}

function rellenarFicha(entrada) {
  const meta = [entrada.cat && nombreGramatical(entrada.cat), etiquetaGenero(entrada.genero)].filter(Boolean).join(' · ');
  poner(ficha,
    el('p', { class: 'ficha-pt', lang: 'pt-PT' }, entrada.pt),
    el('p', {}, tr(entrada.trad)),
    entrada.pron && el('p', {}, `${t('word.pronounced')} `, el('strong', {}, tr(entrada.pron)), el('span', { class: 'aprox' }, ` (${t('word.approx')})`)),
    entrada.consejo && el('p', { class: 'ficha-consejo' }, '🗣 ', tr(entrada.consejo)),
    entrada.ipa && el('p', { class: 'ficha-meta' }, `IPA: [${entrada.ipa}]`),
    meta && el('p', { class: 'ficha-meta' }, meta),
    entrada.femenino && el('p', { class: 'ficha-meta' }, `${t('word.feminine')}: `, el('span', { lang: 'pt-PT' }, entrada.femenino)),
    entrada.plural && el('p', { class: 'ficha-meta' }, `${t('word.plural')}: `, el('span', { lang: 'pt-PT' }, entrada.plural)),
    entrada.nota && el('p', {}, tr(entrada.nota)),
    el('div', { class: 'ficha-botones' }, botonEscuchar(entrada.pt), botonGuardar(itemPalabra(entrada), { conTexto: true })),
  );
  ficha.setAttribute('aria-label', t('word.card'));
}

function abrirFicha(boton, entrada, fijar) {
  clearTimeout(cierrePendiente);
  if (botonFicha && botonFicha !== boton) botonFicha.setAttribute('aria-expanded', 'false');
  botonFicha = boton;
  fichaFijada = fijar;
  rellenarFicha(entrada);
  boton.setAttribute('aria-expanded', 'true');
  ficha.hidden = false;

  const caja = boton.getBoundingClientRect();
  const margen = 12;
  const ancho = ficha.offsetWidth;
  let izquierda = caja.left + window.scrollX;
  izquierda = Math.min(izquierda, window.scrollX + document.documentElement.clientWidth - ancho - margen);
  izquierda = Math.max(izquierda, window.scrollX + margen);
  ficha.style.left = `${izquierda}px`;
  ficha.style.top = `${caja.bottom + window.scrollY + 8}px`;
}

export function cerrarFicha() {
  clearTimeout(cierrePendiente);
  if (botonFicha) botonFicha.setAttribute('aria-expanded', 'false');
  ficha.hidden = true;
  botonFicha = null;
  fichaFijada = false;
}

document.addEventListener('click', e => {
  if (!ficha.hidden && !e.target.closest('.palabra, .ficha-palabra')) cerrarFicha();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !ficha.hidden) {
    const boton = botonFicha;
    cerrarFicha();
    boton?.focus();
  }
});
window.addEventListener('resize', cerrarFicha);
// Con ratón: se puede pasar de la palabra a la ficha sin que se cierre.
ficha.addEventListener('pointerenter', () => clearTimeout(cierrePendiente));
ficha.addEventListener('pointerleave', e => {
  if (e.pointerType === 'mouse' && !fichaFijada) cierrePendiente = setTimeout(cerrarFicha, 250);
});

function botonPalabra(texto, entrada) {
  const boton = el('button', {
    type: 'button',
    class: 'palabra',
    'aria-expanded': 'false',
    'aria-controls': 'ficha-palabra',
  }, texto);
  boton.addEventListener('click', e => {
    if (botonFicha === boton && fichaFijada) {
      cerrarFicha();
      return;
    }
    abrirFicha(boton, entrada, true);
    // Con teclado (Enter/Espacio), el foco entra en la ficha. Escape lo devuelve.
    if (e.detail === 0) ficha.querySelector('button')?.focus();
  });
  boton.addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse' && !fichaFijada) abrirFicha(boton, entrada, false);
  });
  boton.addEventListener('pointerleave', e => {
    if (e.pointerType === 'mouse' && !fichaFijada && botonFicha === boton) {
      cierrePendiente = setTimeout(cerrarFicha, 250);
    }
  });
  return boton;
}

// ---------------------------------------------------------------------------
// Frases: cada palabra que esté en el diccionario se convierte en un botón
// ---------------------------------------------------------------------------

const REGEX_PALABRA = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const MAX_PALABRAS_EXPRESION = 5;

/** Divide la frase en trozos: { texto, entrada? }. Busca primero expresiones de varias palabras. */
export function analizarFrase(frase, palabras) {
  const fichas = [...frase.matchAll(REGEX_PALABRA)].map(m => ({ texto: m[0], inicio: m.index, fin: m.index + m[0].length }));
  const trozos = [];
  let cursor = 0;
  let i = 0;
  while (i < fichas.length) {
    let encontrada = null;
    for (let n = Math.min(MAX_PALABRAS_EXPRESION, fichas.length - i); n >= 1; n--) {
      const grupo = fichas.slice(i, i + n);
      const entreMedias = grupo.slice(1).every((f, k) => /^\s+$/.test(frase.slice(grupo[k].fin, f.inicio)));
      if (!entreMedias) continue;
      const clave = normalizarPalabra(grupo.map(f => f.texto).join(' '));
      if (palabras.has(clave)) {
        encontrada = { n, inicio: grupo[0].inicio, fin: grupo[n - 1].fin, entrada: palabras.get(clave) };
        break;
      }
    }
    if (encontrada) {
      if (encontrada.inicio > cursor) trozos.push({ texto: frase.slice(cursor, encontrada.inicio) });
      trozos.push({ texto: frase.slice(encontrada.inicio, encontrada.fin), entrada: encontrada.entrada });
      cursor = encontrada.fin;
      i += encontrada.n;
    } else {
      trozos.push({ texto: frase.slice(cursor, fichas[i].fin) });
      cursor = fichas[i].fin;
      i += 1;
    }
  }
  if (cursor < frase.length) trozos.push({ texto: frase.slice(cursor) });
  return trozos;
}

function fraseInteractiva(frase, palabras) {
  return analizarFrase(frase, palabras).map(trozo => (trozo.entrada ? botonPalabra(trozo.texto, trozo.entrada) : trozo.texto));
}

function explicarFrase(frase) {
  const paginas = [{ texto: t('tutor.sentenceMeans', { pt: frase.pt, trad: tr(frase.trad) || t('lesson.missingTranslation') }), expresion: 'normal' }];
  if (frase.literal) paginas.push({ texto: t('tutor.literally', { literal: tr(frase.literal) }), expresion: 'pensando' });
  const analisis = textoAnalisis(frase);
  if (analisis) paginas.push({ texto: analisis, expresion: 'pensando' });
  if (frase.pron) paginas.push({ texto: t('tutor.pronounced', { pron: tr(frase.pron) }), expresion: 'normal' });
  for (const nota of frase.notas) paginas.push({ texto: tr(nota), expresion: 'pensando' });
  sonar('pagina');
  decir(paginas);
}

// ---------------------------------------------------------------------------
// Bloques
// ---------------------------------------------------------------------------

function bloqueExplicacion(b) {
  return el('section', { class: 'caja explicacion' },
    el('span', { class: 'etiqueta-bloque' }, t('lesson.block.explanation')),
    b.titulo && el('h2', { class: 'bloque-titulo' }, tr(b.titulo)),
    textoConFormato(tr(b.texto)));
}

function bloqueDialogo(b, leccion) {
  const lista = el('ul', { class: 'frases' });
  let selloActivo = null;
  for (const frase of b.frases) {
    const sello = el('button', {
      type: 'button',
      class: 'sello',
      'aria-pressed': 'false',
      'aria-label': t('lesson.explainSentence', { frase: frase.pt }),
      title: t('lesson.explainSentenceShort'),
    }, '?');
    sello.addEventListener('click', () => {
      selloActivo?.setAttribute('aria-pressed', 'false');
      sello.setAttribute('aria-pressed', 'true');
      selloActivo = sello;
      explicarFrase(frase);
    });
    lista.append(el('li', { class: 'frase' },
      sello,
      el('div', {},
        frase.quien && el('span', { class: 'frase-quien' }, `${frase.quien}:`),
        el('p', { class: 'frase-pt', lang: 'pt-PT' }, fraseInteractiva(frase.pt, leccion.palabras)),
        frase.trad && el('p', { class: 'frase-trad' }, tr(frase.trad)),
        analisisDesplegable(frase, `analisis-${++contadorAnalisis}`)),
      el('div', { class: 'frase-acciones' },
        botonEscuchar(frase.pt),
        botonGuardar({ pt: frase.pt, trad: frase.trad, pron: frase.pron, nota: frase.notas[0], tipo: 'frase', origen: origenActual }))));
  }

  const seccion = el('section', { class: 'caja dialogo' });
  const alternar = el('button', { type: 'button', class: 'boton boton-mini ver-traducciones', 'aria-pressed': 'false' }, t('lesson.hideTranslations'));
  alternar.addEventListener('click', () => {
    const ocultas = seccion.classList.toggle('ocultar-traduccion');
    alternar.setAttribute('aria-pressed', String(ocultas));
    alternar.textContent = t(ocultas ? 'lesson.showTranslations' : 'lesson.hideTranslations');
  });

  // Modo «solo escuchar»: se oculta el texto en portugués (comprensión auditiva pura).
  const soloOir = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': 'false' }, `🙈 ${t('lesson.listenOnly')}`);
  soloOir.addEventListener('click', () => {
    const activo = seccion.classList.toggle('ocultar-portugues');
    soloOir.setAttribute('aria-pressed', String(activo));
    soloOir.textContent = activo ? `👁 ${t('lesson.showText')}` : `🙈 ${t('lesson.listenOnly')}`;
    if (activo) decir(t('tutor.listenOnly'), 'pensando');
  });

  // Escuchar el diálogo entero; cada personaje con un tono de voz distinto.
  const tonos = new Map();
  const textoEscuchar = () => `▶ ${t(b.esTexto ? 'lesson.listenText' : 'lesson.listenDialogue')}`;
  const escuchar = el('button', { type: 'button', class: 'boton boton-principal boton-mini' }, textoEscuchar());
  let sonando = false;
  const items = [...lista.children];
  const parar = () => {
    sonando = false;
    escuchar.textContent = textoEscuchar();
    items.forEach(li => li.classList.remove('sonando'));
  };
  escuchar.addEventListener('click', () => {
    if (sonando) { callar(); parar(); return; }
    const secuencia = b.frases.map(f => {
      if (!tonos.has(f.quien)) tonos.set(f.quien, [1, 0.75, 1.3, 0.9][tonos.size % 4]);
      return { texto: f.pt, tono: tonos.get(f.quien) };
    });
    const ok = pronunciarSeguido(secuencia, {
      alEmpezar: i => items.forEach((li, k) => li.classList.toggle('sonando', k === i)),
      alAcabar: parar,
    });
    if (!ok) { decir(ayudaVoz(), 'apurada'); return; }
    sonando = true;
    escuchar.textContent = `■ ${t('common.stop')}`;
  });

  seccion.append(
    el('span', { class: 'etiqueta-bloque' }, t(b.esTexto ? 'lesson.block.text' : 'lesson.block.dialogue')),
    escuchar,
    b.titulo && el('h2', { class: 'bloque-titulo' }, tr(b.titulo)),
    el('p', { class: 'aprox' }, t('lesson.dialogueHelp')),
    lista,
    el('div', { class: 'botonera' }, alternar, soloOir));
  return seccion;
}

function bloqueVocabulario(b, leccion) {
  const lista = el('ul', { class: 'vocabulario' });
  for (const palabra of b.palabras) {
    const v = leccion.palabras.get(normalizarPalabra(palabra));
    if (!v) {
      lista.append(el('li', { class: 'voz' }, el('p', { class: 'voz-pt', lang: 'pt-PT' }, palabra), el('p', { class: 'aviso-bloque' }, `⚠ ${t('lesson.wordMissing')}`)));
      continue;
    }
    const filas = [
      [t('word.pronunciation'), v.pron && `${tr(v.pron)} (${t('word.approx')})`],
      [t('word.howItSounds'), v.consejo && tr(v.consejo)],
      ['IPA', v.ipa && `[${v.ipa}]`],
      [t('word.type'), v.cat && nombreGramatical(v.cat)],
      [t('word.gender'), etiquetaGenero(v.genero)],
      [t('word.feminine'), v.femenino],
      [t('word.plural'), v.plural],
      [t('word.example'), v.ejemplo],
      [t('word.note'), v.nota && tr(v.nota)],
    ].filter(([, valor]) => valor);
    lista.append(el('li', { class: 'voz' },
      el('div', { class: 'voz-cabecera' },
        el('p', { class: 'voz-pt', lang: 'pt-PT' }, v.pt),
        botonEscuchar(v.pt),
        botonGuardar(itemPalabra(v))),
      el('p', { class: 'voz-trad' }, tr(v.trad)),
      el('dl', {}, filas.flatMap(([titulo, d]) => [el('dt', {}, `${titulo}:`), el('dd', {}, d)]))));
  }
  return el('section', { class: 'caja' },
    el('span', { class: 'etiqueta-bloque' }, t('lesson.block.vocabulary')),
    b.titulo && el('h2', { class: 'bloque-titulo' }, tr(b.titulo)),
    lista);
}

/** Tabla (conjugaciones, pronombres, artículos…). Las casillas admiten **negrita**. */
function bloqueTabla(b) {
  const titulo = b.titulo ? tr(b.titulo) : null;
  return el('section', { class: 'caja' },
    el('span', { class: 'etiqueta-bloque' }, t('lesson.block.table')),
    titulo && el('h2', { class: 'bloque-titulo' }, titulo),
    el('div', { class: 'tabla-contenedor', tabindex: '0', role: 'region', 'aria-label': titulo ?? t('lesson.block.table') },
      el('table', { class: 'tabla' },
        b.columnas && el('thead', {}, el('tr', {}, b.columnas.map(c => el('th', { scope: 'col' }, enLinea(tr(c)))))),
        el('tbody', {}, b.filas.map(fila => el('tr', {}, fila.map(c => el('td', { lang: typeof c === 'string' ? 'pt-PT' : null }, enLinea(tr(c))))))))),
    b.nota && el('p', { class: 'aprox' }, enLinea(tr(b.nota))));
}

function bloqueImagen(b) {
  return el('figure', { class: 'caja imagen' },
    el('img', { src: b.archivo, alt: tr(b.descripcion), loading: 'lazy' }),
    b.pie && el('figcaption', { class: 'aprox' }, tr(b.pie)));
}

function bloqueConError(b) {
  return el('section', { class: 'caja' },
    el('p', { class: 'aviso-bloque' }, `⚠ ${t('lesson.blockError')} ${textoAviso(b.error, t)}`));
}

// ---------------------------------------------------------------------------
// Lección completa
// ---------------------------------------------------------------------------

function textoProgreso(r) {
  return t('lesson.progress', { completados: r.completados, total: r.total, aciertos: r.aciertos, errores: r.errores });
}

// Palabras de todas las lecciones: si una palabra de un diálogo no está en la
// lección abierta, se busca aquí (así casi todas se pueden tocar).
let diccionarioGlobal = new Map();

/** Todas las palabras del curso (para el buscador del diccionario). */
export function diccionarioCompleto() {
  return diccionarioGlobal;
}

export function ponerDiccionarioGlobal(resultados) {
  diccionarioGlobal = new Map();
  for (const r of resultados) {
    for (const [clave, entrada] of r.leccion?.palabras ?? []) {
      if (!diccionarioGlobal.has(clave)) diccionarioGlobal.set(clave, entrada);
    }
  }
}

/**
 * resultado: la lección cargada. contexto: { unidad, numero, siguiente } para la cabecera y el botón final.
 */
export function pintarLeccion(contenedor, resultado, { unidad, numero, siguiente }) {
  const { avisos } = resultado;
  // Las palabras propias de la lección mandan sobre las del resto del curso.
  const leccion = { ...resultado.leccion, palabras: new Map([...diccionarioGlobal, ...resultado.leccion.palabras]) };
  marcarAbierta(leccion.id);
  origenActual = `${t('lessons.unit', { n: unidad?.numero ?? '?' })} · ${leccion.titulo}`;

  const progreso = el('p', { class: 'aprox' });
  const actualizar = () => {
    const r = resumenLeccion(leccion.id, leccion.idsEjercicios);
    progreso.textContent = textoProgreso(r);
    pintarFinal(r);
  };

  const cabecera = el('header', { class: 'cabecera-leccion' },
    el('a', { class: 'boton boton-mini volver', href: '#/lecciones' }, `◀ ${t('lessons.title')}`),
    el('p', { class: 'etiqueta-bloque' }, t('lesson.label', { unidad: unidad?.numero ?? '?', n: numero })),
    el('h1', { class: 'titulo-pt', lang: 'pt-PT' }, leccion.titulo),
    el('p', { class: 'titulo-trad' }, tr(leccion.subtitulo)),
    progreso);

  let n = 0;
  const bloques = leccion.bloques.map(b => {
    if (b.error) return bloqueConError(b);
    if (b.tipo === 'explicacion') return bloqueExplicacion(b);
    if (b.tipo === 'dialogo') return bloqueDialogo(b, leccion);
    if (b.tipo === 'vocabulario') return bloqueVocabulario(b, leccion);
    if (b.tipo === 'tabla') return bloqueTabla(b);
    if (b.tipo === 'imagen') return bloqueImagen(b);
    n += 1;
    return crearEjercicio(b, leccion.id, n, actualizar);
  });

  const final = el('section', { class: 'caja final-leccion' });

  function pintarFinal(r) {
    const faltan = r.total - r.completados;
    const botonTerminar = el('button', { type: 'button', class: 'boton boton-principal' }, t('lesson.finish'));
    botonTerminar.addEventListener('click', () => {
      if (faltan > 0) {
        decir(t('tutor.exercisesLeft', { n: faltan }), 'apurada');
        return;
      }
      marcarTerminada(leccion.id);
      sonar('fin');
      decir(t('tutor.lessonFinished', { n: r.aciertos }), 'contenta');
      actualizar();
      final.querySelector('a, button')?.focus();
    });

    poner(final,
      el('h2', {}, r.terminada ? `✔ ${t('lesson.finished')}` : t('lesson.end')),
      el('p', { class: 'resumen' }, textoProgreso(r)),
      r.terminada ? null : botonTerminar,
      siguiente
        ? el('a', { class: 'boton', href: `#/leccion/${siguiente}` }, `${t('lesson.next')} ▶`)
        : el('a', { class: 'boton', href: '#/lecciones' }, `◀ ${t('lesson.backToLessons')}`));
  }

  poner(contenedor, cabecera, listaAvisos(avisos, resultado.archivo), ...bloques, final);
  actualizar();

  decir(leccion.intro ? tr(leccion.intro) : t('tutor.lessonIntro', { titulo: leccion.titulo }));
}
