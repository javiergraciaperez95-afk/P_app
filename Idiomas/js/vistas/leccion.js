// Vista de una lección: pinta los bloques en orden, como las páginas de un libro.

import { el, textoConFormato, poner, enLinea } from '../dom.js';
import { t, tr, tTodos } from '../i18n.js';
import { normalizarPalabra } from '../lessons.js';
import { crearEjercicio } from '../exercises.js';
import { decir } from '../tutor.js';
import { resumenLeccion, marcarTerminada, marcarAbierta } from '../progress.js';
import { botonEscuchar, botonGuardar, analisisDesplegable, textoAnalisis, apuntarPalabrasDeLeccion } from '../comunes.js';
import { sonar, pronunciarSeguido, callar, ayudaVoz, hayVoz } from '../sonidos.js';
import { cargarJuego, pintarJuego } from '../juego/motor.js';
import { LANG } from '../curso.js';

/** Género: «m» o «f» (también «m/f» para las palabras que admiten los dos). */
function textoGenero(genero) {
  if (!genero) return null;
  const claves = { m: 'genero.m', f: 'genero.f', 'm/f': 'genero.mf', 'f/m': 'genero.mf' };
  return claves[genero] ? t(claves[genero]) : tr(genero);
}

// ---------------------------------------------------------------------------
// Ficha de palabra (aparece al pasar el ratón o al tocar una palabra)
// ---------------------------------------------------------------------------

const ficha = document.getElementById('ficha-palabra');
let botonFicha = null;
let fichaFijada = false;
let cierrePendiente = null;
let origenActual = null; // { en, vi }: de dónde sale lo que se guarda en el cuaderno
let contadorAnalisis = 0;

function itemPalabra(entrada) {
  return { es: entrada.es, trad: entrada.trad, pron: entrada.pron, nota: entrada.nota || entrada.consejo, tipo: entrada.es.includes(' ') ? 'frase' : 'palabra', origen: origenActual };
}

function rellenarFicha(entrada) {
  const meta = [tr(entrada.cat), textoGenero(entrada.genero)].filter(Boolean).join(' · ');
  poner(ficha,
    el('p', { class: 'ficha-es', lang: LANG }, entrada.es),
    el('p', {}, tr(entrada.trad)),
    entrada.pron && el('p', {}, `${t('ficha.sePronuncia')} `, el('strong', {}, entrada.pron), el('span', { class: 'aprox' }, ` ${t('comun.aprox')}`)),
    entrada.consejo && el('p', { class: 'ficha-consejo' }, '🗣 ', tr(entrada.consejo)),
    entrada.ipa && el('p', { class: 'ficha-meta' }, `IPA: [${entrada.ipa}]`),
    meta && el('p', { class: 'ficha-meta' }, meta),
    entrada.plural && el('p', { class: 'ficha-meta' }, `${t('ficha.plural')}: `, el('span', { lang: LANG }, entrada.plural)),
    entrada.nota && el('p', {}, tr(entrada.nota)),
    el('div', { class: 'ficha-botones' }, botonEscuchar(entrada.es), botonGuardar(itemPalabra(entrada), { conTexto: true })),
  );
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
      trozos.push({
        texto: frase.slice(cursor, fichas[i].fin),
        sinFicha: true,
        nombrePropio: esNombrePropio(frase, fichas[i]),
      });
      cursor = fichas[i].fin;
      i += 1;
    }
  }
  if (cursor < frase.length) trozos.push({ texto: frase.slice(cursor) });
  return trozos;
}

/** Mayúscula en mitad de la frase: lo tratamos como un nombre (Ana, Lucía…). */
function esNombrePropio(frase, ficha) {
  return /^\p{Lu}/u.test(ficha.texto) && !/(^|[.!?¡¿]\s*)$/.test(frase.slice(0, ficha.inicio).trimEnd() || '.');
}

function fraseInteractiva(frase, palabras) {
  return analizarFrase(frase, palabras).map(t => (t.entrada ? botonPalabra(t.texto, t.entrada) : t.texto));
}

/** Pronunciación aproximada de la frase: la escrita a mano o la suma de las palabras. */
function pronunciacionFrase(frase, palabras) {
  if (frase.pron) return frase.pron;
  const trozos = analizarFrase(frase.es, palabras);
  // Si falta la pronunciación de alguna palabra, mejor no inventarla.
  if (trozos.some(t => (t.sinFicha && !t.nombrePropio) || (t.entrada && !t.entrada.pron))) return null;
  return trozos.map(t => (t.entrada ? t.entrada.pron : t.texto)).join('').replace(/\s+/g, ' ').trim();
}

function explicarFrase(frase, palabras) {
  const paginas = [{ texto: t('frase.significa', { frase: frase.es, trad: tr(frase.trad) || t('frase.faltaTraduccion') }), expresion: 'normal' }];
  if (frase.literal) {
    paginas.push({ texto: t('frase.literal', { literal: tr(frase.literal) }), expresion: 'pensando' });
  }
  const analisis = textoAnalisis(frase);
  if (analisis) paginas.push({ texto: analisis, expresion: 'pensando' });
  const pron = pronunciacionFrase(frase, palabras);
  if (pron) {
    paginas.push({ texto: t('frase.pronuncia', { pron }), expresion: 'normal' });
  }
  for (const nota of frase.notas) paginas.push({ texto: tr(nota), expresion: 'pensando' });
  sonar('pagina');
  decir(paginas);
}

// ---------------------------------------------------------------------------
// Bloques
// ---------------------------------------------------------------------------

function bloqueExplicacion(b) {
  return el('section', { class: 'caja explicacion' },
    el('span', { class: 'etiqueta-bloque' }, t('bloque.explicacion')),
    b.titulo && el('h2', { class: 'bloque-titulo' }, tr(b.titulo)),
    textoConFormato(Array.isArray(b.texto) ? b.texto.map(tr) : tr(b.texto)));
}

function bloqueGramatica(b) {
  const caja = el('section', { class: 'caja explicacion gramatica' },
    el('span', { class: 'etiqueta-bloque' }, t('bloque.gramatica')),
    b.titulo && el('h2', { class: 'bloque-titulo' }, tr(b.titulo)),
    textoConFormato(Array.isArray(b.texto) ? b.texto.map(tr) : tr(b.texto)));
  for (const ejemplo of b.ejemplos ?? []) {
    caja.append(el('div', { class: 'gramatica-ejemplo' },
      el('p', { class: 'frase-es', lang: LANG }, ejemplo.es),
      ejemplo.trad && el('p', { class: 'frase-trad' }, tr(ejemplo.trad)),
      analisisDesplegable(ejemplo, `analisis-${++contadorAnalisis}`)));
  }
  return caja;
}

/**
 * Lectura por frases: se ve como texto corrido, en sus dos párrafos. Cada frase
 * lleva detrás un botón discreto que abre, bajo su párrafo, la traducción, el
 * análisis sintáctico, la voz y el botón de guardar de esa frase.
 */
function lecturaPorFrases(b, leccion) {
  const lista = el('div', { class: 'lectura' });
  const frases = [];
  for (const n of [0, 1]) {
    const propias = b.frases.filter(f => (f.parrafo ?? 0) === n);
    if (!propias.length) continue;
    const detalle = el('div', { class: 'lectura-detalle', hidden: true });
    let abierto = null;
    const parrafo = el('p', { class: 'lectura-parrafo', lang: LANG });
    for (const frase of propias) {
      const boton = el('button', {
        type: 'button',
        class: 'lectura-boton',
        'aria-expanded': 'false',
        'aria-label': t('frase.explicarAria', { frase: frase.es }),
        title: t('frase.explicar'),
      }, '▸');
      const trozo = el('span', { class: 'lectura-frase' }, fraseInteractiva(frase.es, leccion.palabras), boton);
      boton.addEventListener('click', () => {
        const cerrar = abierto === boton;
        abierto?.setAttribute('aria-expanded', 'false');
        abierto?.parentElement.classList.remove('elegida');
        sonar('pagina');
        if (cerrar) { abierto = null; detalle.hidden = true; return; }
        abierto = boton;
        boton.setAttribute('aria-expanded', 'true');
        trozo.classList.add('elegida');
        const analisis = analisisDesplegable(frase, `analisis-${++contadorAnalisis}`);
        detalle.replaceChildren(
          el('p', { class: 'frase-es', lang: LANG }, frase.es),
          frase.trad && el('p', { class: 'frase-trad-lectura' }, tr(frase.trad)),
          analisis,
          el('div', { class: 'frase-acciones' },
            botonEscuchar(frase.es),
            botonGuardar({ es: frase.es, trad: frase.trad, pron: pronunciacionFrase(frase, leccion.palabras), nota: frase.notas[0], tipo: 'frase', origen: origenActual })));
        // Se abre ya desplegado: es lo que el alumno ha venido a ver.
        analisis?.querySelector('.boton-analisis')?.click();
        detalle.hidden = false;
      });
      parrafo.append(trozo, ' ');
      frases.push(trozo);
    }
    const traduccion = propias.map(f => f.trad && tr(f.trad)).filter(Boolean).join(' ');
    lista.append(el('div', { class: 'lectura-bloque' },
      parrafo,
      traduccion && el('p', { class: 'frase-trad' }, traduccion),
      detalle));
  }
  return { lista, items: frases };
}

function bloqueDialogo(b, leccion) {
  // Una lectura con análisis por frase se pinta como texto corrido.
  const porFrases = b.esTexto && b.frases.some(f => f.analisis);
  const lectura = porFrases ? lecturaPorFrases(b, leccion) : null;
  const lista = lectura ? lectura.lista : el('ul', { class: 'frases' });
  let selloActivo = null;
  for (const frase of lectura ? [] : b.frases) {
    const sello = el('button', {
      type: 'button',
      class: 'sello',
      'aria-pressed': 'false',
      'aria-label': t('frase.explicarAria', { frase: frase.es }),
      title: t('frase.explicar'),
    }, '?');
    sello.addEventListener('click', () => {
      selloActivo?.setAttribute('aria-pressed', 'false');
      sello.setAttribute('aria-pressed', 'true');
      selloActivo = sello;
      explicarFrase(frase, leccion.palabras);
    });
    lista.append(el('li', { class: 'frase' },
      sello,
      el('div', {},
        frase.quien && el('span', { class: 'frase-quien' }, `${frase.quien}:`),
        el('p', { class: 'frase-es', lang: LANG }, fraseInteractiva(frase.es, leccion.palabras)),
        frase.trad && el('p', { class: 'frase-trad' }, tr(frase.trad)),
        analisisDesplegable(frase, `analisis-${++contadorAnalisis}`)),
      el('div', { class: 'frase-acciones' },
        botonEscuchar(frase.es),
        botonGuardar({ es: frase.es, trad: frase.trad, pron: pronunciacionFrase(frase, leccion.palabras), nota: frase.notas[0], tipo: 'frase', origen: origenActual }))));
  }

  const seccion = el('section', { class: 'caja dialogo' });
  // Los textos de lectura empiezan sin traducción para permitir una primera lectura autónoma.
  // En los diálogos se conserva la ayuda en español visible, como antes.
  const traduccionesOcultas = Boolean(b.esTexto);
  seccion.classList.toggle('ocultar-traduccion', traduccionesOcultas);
  const alternar = el('button', {
    type: 'button',
    class: 'boton boton-mini ver-traducciones',
    'aria-pressed': String(traduccionesOcultas),
  }, t(traduccionesOcultas ? 'dialogo.mostrarTraducciones' : 'dialogo.ocultarTraducciones'));
  alternar.addEventListener('click', () => {
    const ocultas = seccion.classList.toggle('ocultar-traduccion');
    alternar.setAttribute('aria-pressed', String(ocultas));
    alternar.textContent = t(ocultas ? 'dialogo.mostrarTraducciones' : 'dialogo.ocultarTraducciones');
  });

  // Modo «solo escuchar»: se oculta el texto en español (comprensión auditiva pura).
  const soloOir = el('button', { type: 'button', class: 'boton boton-mini con-voz', 'aria-pressed': 'false' }, t('dialogo.soloEscuchar'));
  soloOir.addEventListener('click', () => {
    const activo = seccion.classList.toggle('ocultar-espanol');
    soloOir.setAttribute('aria-pressed', String(activo));
    soloOir.textContent = t(activo ? 'dialogo.mostrarTexto' : 'dialogo.soloEscuchar');
    if (activo) decir(t('dialogo.textoOculto'), 'pensando');
  });

  // Escuchar el diálogo entero; cada personaje con un tono de voz distinto.
  const tonos = new Map();
  const textoEscuchar = t(b.esTexto ? 'dialogo.escucharTexto' : 'dialogo.escucharDialogo');
  const escuchar = el('button', { type: 'button', class: 'boton boton-principal boton-mini con-voz' }, `▶ ${textoEscuchar}`);
  let sonando = false;
  const items = lectura ? lectura.items : [...lista.children];
  const parar = () => {
    sonando = false;
    escuchar.textContent = `▶ ${textoEscuchar}`;
    items.forEach(li => li.classList.remove('sonando'));
  };
  escuchar.addEventListener('click', () => {
    if (sonando) { callar(); parar(); return; }
    const secuencia = b.frases.map(f => {
      if (!tonos.has(f.quien)) tonos.set(f.quien, [1, 0.75, 1.3, 0.9][tonos.size % 4]);
      return { texto: f.es, tono: tonos.get(f.quien) };
    });
    const ok = pronunciarSeguido(secuencia, {
      alEmpezar: i => items.forEach((li, k) => li.classList.toggle('sonando', k === i)),
      alAcabar: parar,
    });
    if (!ok) { decir(ayudaVoz(), 'apurada'); return; }
    sonando = true;
    escuchar.textContent = t('comun.parar');
  });

  seccion.append(
    el('span', { class: 'etiqueta-bloque' }, t(b.esTexto ? 'bloque.texto' : 'bloque.dialogo')),
    escuchar,
    b.titulo && el('h2', { class: 'bloque-titulo' }, tr(b.titulo)),
    el('p', { class: 'aprox' }, t('dialogo.ayuda')),
    lista,
    el('div', { class: 'botonera' }, alternar, soloOir));
  return seccion;
}

function bloqueVocabulario(b, leccion) {
  const lista = el('ul', { class: 'vocabulario' });
  for (const palabra of b.palabras) {
    const v = leccion.palabras.get(normalizarPalabra(palabra));
    if (!v) {
      lista.append(el('li', { class: 'voz' }, el('p', { class: 'voz-es', lang: LANG }, palabra), el('p', { class: 'aviso-bloque' }, t('vocab.falta'))));
      continue;
    }
    const filas = [
      ['vocab.pronunciacion', v.pron && `${v.pron} ${t('comun.aprox')}`],
      ['vocab.comoSuena', tr(v.consejo)],
      ['vocab.ipa', v.ipa && `[${v.ipa}]`],
      ['vocab.tipo', tr(v.cat)],
      ['vocab.genero', textoGenero(v.genero)],
      ['ficha.plural', v.plural && el('span', { lang: LANG }, v.plural)],
      ['vocab.ejemplo', v.ejemplo && tr(v.ejemplo)],
      ['vocab.nota', tr(v.nota)],
    ].filter(([, valor]) => valor);
    lista.append(el('li', { class: 'voz' },
      el('div', { class: 'voz-cabecera' },
        el('p', { class: 'voz-es', lang: LANG }, v.es),
        botonEscuchar(v.es),
        botonGuardar(itemPalabra(v))),
      el('p', { class: 'voz-trad' }, tr(v.trad)),
      el('dl', {}, filas.flatMap(([clave, d]) => [el('dt', {}, `${t(clave)}:`), el('dd', {}, d)]))));
  }
  return el('section', { class: 'caja' },
    el('span', { class: 'etiqueta-bloque' }, t('bloque.vocabulario')),
    b.titulo && el('h2', { class: 'bloque-titulo' }, tr(b.titulo)),
    lista);
}

/** Tabla (conjugaciones, pronombres, plurales…). Las casillas admiten **negrita**. */
function bloqueTabla(b) {
  return el('section', { class: 'caja' },
    el('span', { class: 'etiqueta-bloque' }, t('bloque.tabla')),
    b.titulo && el('h2', { class: 'bloque-titulo' }, tr(b.titulo)),
    el('div', { class: 'tabla-contenedor', tabindex: '0', role: 'region', 'aria-label': tr(b.titulo) || t('bloque.tabla') },
      el('table', { class: 'tabla' },
        b.columnas && el('thead', {}, el('tr', {}, b.columnas.map(c => el('th', { scope: 'col' }, enLinea(tr(c)))))),
        el('tbody', {}, b.filas.map(fila => el('tr', {}, fila.map(c => el('td', {}, enLinea(tr(c))))))))),
    b.nota && el('p', { class: 'aprox' }, enLinea(tr(b.nota))));
}

function bloqueImagen(b) {
  return el('figure', { class: 'caja imagen' },
    el('img', { src: b.archivo, alt: tr(b.descripcion), loading: 'lazy' }),
    b.pie && el('figcaption', { class: 'aprox' }, tr(b.pie)));
}

function bloqueConError(b) {
  return el('section', { class: 'caja' },
    el('p', { class: 'aviso-bloque' }, `${t('bloque.noSeMuestra')} ${b.error}`));
}

// ---------------------------------------------------------------------------
// Lección completa
// ---------------------------------------------------------------------------

function textoProgreso(r) {
  return t('leccion.progreso', r);
}

// Palabras de todas las lecciones: si una palabra de un diálogo no está en la
// lección abierta, se busca aquí (así casi todas se pueden tocar).
let diccionarioGlobal = new Map();

/** Todas las palabras del curso (para el buscador del diccionario). */
export function diccionarioCompleto() {
  return diccionarioGlobal;
}

/** El diccionario ya hecho (indice/diccionario.json del curso). */
export function ponerDiccionario(mapa) {
  diccionarioGlobal = new Map([...mapa].map(([clave, ficha]) => [clave, { ...ficha, es: ficha.es ?? clave }]));
}

/** Sin índice: el diccionario se hace con las palabras de todas las lecciones cargadas. */
export function ponerDiccionarioGlobal(resultados) {
  diccionarioGlobal = new Map();
  for (const r of resultados) {
    for (const [clave, entrada] of r.leccion?.palabras ?? []) {
      if (!diccionarioGlobal.has(clave)) diccionarioGlobal.set(clave, entrada);
    }
  }
}

// Las lecciones que tienen juego se abren en modo juego; quien prefiera el libro puede cambiar (y se recuerda).
const CLAVE_MODO = 'idiomas-modo-leccion';
function prefiereLibro() {
  try { return localStorage.getItem(CLAVE_MODO) === 'libro'; } catch { return false; }
}
function preferir(modo) {
  try { localStorage.setItem(CLAVE_MODO, modo); } catch { /* sin almacenamiento */ }
}

/** Pinta la lección (como juego o como libro). Devuelve una función para limpiar al salir. */
export function pintarLeccion(contenedor, resultado, siguiente) {
  let limpiar = null;
  let abierta = true;
  const mostrar = guion => {
    limpiar?.();
    limpiar = null;
    if (guion && !prefiereLibro()) {
      limpiar = pintarJuego(contenedor, resultado, guion, {
        siguiente,
        diccionario: diccionarioGlobal,
        alLibro: () => { preferir('libro'); mostrar(guion); window.scrollTo(0, 0); },
      });
    } else {
      pintarLibro(contenedor, resultado, siguiente, guion ? () => { preferir('juego'); mostrar(guion); window.scrollTo(0, 0); } : null);
    }
  };
  cargarJuego(resultado.leccion.id).then(guion => { if (abierta) mostrar(guion); });
  return () => {
    abierta = false;
    limpiar?.();
  };
}

function pintarLibro(contenedor, resultado, siguiente, alJuego) {
  const { avisos } = resultado;
  // Las palabras propias de la lección mandan sobre las del resto del curso.
  const propias = resultado.leccion.palabras;
  const leccion = { ...resultado.leccion, palabras: new Map([...diccionarioGlobal, ...propias]) };
  marcarAbierta(leccion.id);
  origenActual = tTodos('leccion.numero', { id: leccion.numero_curso });

  const progreso = el('p', { class: 'aprox' });
  const actualizar = () => {
    const r = resumenLeccion(leccion.id, leccion.idsEjercicios);
    progreso.textContent = textoProgreso(r);
    pintarFinal(r);
  };

  const cabecera = el('header', { class: 'cabecera-leccion' },
    el('a', { class: 'boton boton-mini volver', href: '#/lecciones' }, `◀ ${t('menu.lecciones')}`),
    alJuego && el('button', { type: 'button', class: 'boton boton-mini boton-principal', onclick: alJuego }, t('juego.jugar')),
    el('p', { class: 'etiqueta-bloque' }, t('leccion.numero', { id: leccion.numero_curso })),
    el('h1', { class: 'titulo-es', lang: LANG }, leccion.titulo_es),
    leccion.titulo && el('p', { class: 'titulo-trad' }, tr(leccion.titulo)),
    progreso);

  const avisosEl = avisos.length
    ? el('details', { class: 'caja tarjeta-error' },
      el('summary', {}, t('comun.avisosArchivo', { archivo: resultado.archivo, n: avisos.length })),
      el('ul', {}, avisos.map(a => el('li', {}, a))))
    : null;

  let numero = 0;
  const bloques = leccion.bloques.map(b => {
    if (b.error) return bloqueConError(b);
    if (b.tipo === 'explicacion') return bloqueExplicacion(b);
    if (b.tipo === 'gramatica') return bloqueGramatica(b);
    if (b.tipo === 'dialogo') return bloqueDialogo(b, leccion);
    if (b.tipo === 'vocabulario') return bloqueVocabulario(b, leccion);
    if (b.tipo === 'tabla') return bloqueTabla(b);
    if (b.tipo === 'imagen') return bloqueImagen(b);
    if (b.soloOido && !hayVoz()) return null; // ejercicio de oído y el dispositivo no tiene voz
    numero += 1;
    return crearEjercicio(b, leccion.id, numero, actualizar);
  });

  const final = el('section', { class: 'caja final-leccion' });

  function pintarFinal(r) {
    const faltan = r.total - r.completados;
    const botonTerminar = el('button', { type: 'button', class: 'boton boton-principal' }, t('leccion.terminar'));
    botonTerminar.addEventListener('click', () => {
      if (faltan > 0) {
        decir(t('leccion.faltan', { n: faltan }), 'apurada');
        return;
      }
      marcarTerminada(leccion.id);
      const nuevas = apuntarPalabrasDeLeccion(leccion, propias);
      sonar('fin');
      decir([t('leccion.terminadaTutora', { n: r.aciertos }), nuevas ? t('leccion.apuntadas', { n: nuevas }) : null].filter(Boolean).join(' '), 'contenta');
      actualizar();
      final.querySelector('a, button')?.focus();
    });

    poner(final, 
      el('h2', {}, t(r.terminada ? 'leccion.terminada' : 'leccion.fin')),
      el('p', { class: 'resumen' }, textoProgreso(r)),
      r.terminada ? null : botonTerminar,
      r.terminada && propias.size ? el('a', { class: 'boton boton-principal', href: '#/repaso' }, t('leccion.repasarAhora')) : null,
      siguiente
        ? el('a', { class: 'boton', href: `#/leccion/${siguiente}` }, t('leccion.siguiente'))
        : el('a', { class: 'boton', href: '#/lecciones' }, t('comun.volverLecciones')));
  }

  poner(contenedor, ...[cabecera, avisosEl, ...bloques, final].filter(Boolean));
  actualizar();

  decir(leccion.intro ? tr(leccion.intro) : t('leccion.introTutora', { titulo: leccion.titulo_es }));
}
