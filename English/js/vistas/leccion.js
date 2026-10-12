// Vista de una lección: pinta los bloques en orden, como las páginas de un libro.

import { el, textoConFormato, poner, enLinea } from '../dom.js';
import { normalizarPalabra } from '../lessons.js';
import { crearEjercicio } from '../exercises.js';
import { decir } from '../tutor.js';
import { resumenLeccion, marcarTerminada, marcarAbierta } from '../progress.js';
import { botonEscuchar, botonGuardar, analisisDesplegable, textoAnalisis } from '../comunes.js';
import { sonar, pronunciarSeguido, callar, AYUDA_VOZ } from '../sonidos.js';

const ETIQUETA_GENERO = { en: 'común (en)', et: 'neutro (et)' };

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
  return { da: entrada.da, es: entrada.es, pron: entrada.pron, nota: entrada.nota || entrada.consejo, tipo: entrada.da.includes(' ') ? 'frase' : 'palabra', origen: origenActual };
}

function rellenarFicha(entrada) {
  const meta = [entrada.cat, ETIQUETA_GENERO[entrada.genero] ?? entrada.genero].filter(Boolean).join(' · ');
  poner(ficha, 
    el('p', { class: 'ficha-da', lang: 'en' }, entrada.da),
    el('p', {}, entrada.es ?? ''),
    entrada.pron && el('p', {}, 'Se pronuncia: ', el('strong', {}, entrada.pron), el('span', { class: 'aprox' }, ' (aprox.)')),
    entrada.consejo && el('p', { class: 'ficha-consejo' }, '🗣 ', entrada.consejo),
    entrada.ipa && el('p', { class: 'ficha-meta' }, `IPA: [${entrada.ipa}]`),
    meta && el('p', { class: 'ficha-meta' }, meta),
    entrada.definida && el('p', { class: 'ficha-meta' }, `Forma definida: ${entrada.definida}`),
    entrada.plural && el('p', { class: 'ficha-meta' }, `Plural: ${entrada.plural}`),
    entrada.nota && el('p', {}, entrada.nota),
    el('div', { class: 'ficha-botones' }, botonEscuchar(entrada.da), botonGuardar(itemPalabra(entrada), { conTexto: true })),
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

/** Mayúscula en mitad de la frase: lo tratamos como un nombre (Ana, Mikkel…). */
function esNombrePropio(frase, ficha) {
  return /^\p{Lu}/u.test(ficha.texto) && !/(^|[.!?¡¿]\s*)$/.test(frase.slice(0, ficha.inicio).trimEnd() || '.');
}

function fraseInteractiva(frase, palabras) {
  return analizarFrase(frase, palabras).map(t => (t.entrada ? botonPalabra(t.texto, t.entrada) : t.texto));
}

/** Pronunciación aproximada de la frase: la escrita a mano o la suma de las palabras. */
function pronunciacionFrase(frase, palabras) {
  if (frase.pron) return frase.pron;
  const trozos = analizarFrase(frase.da, palabras);
  // Si falta la pronunciación de alguna palabra, mejor no inventarla.
  if (trozos.some(t => (t.sinFicha && !t.nombrePropio) || (t.entrada && !t.entrada.pron))) return null;
  return trozos.map(t => (t.entrada ? t.entrada.pron : t.texto)).join('').replace(/\s+/g, ' ').trim();
}

function explicarFrase(frase, palabras) {
  const paginas = [{ texto: `«${frase.da}» significa: **${frase.es ?? '(falta la traducción)'}**`, expresion: 'normal' }];
  if (frase.literal) {
    paginas.push({ texto: `Palabra por palabra sería algo así como: «${frase.literal}».`, expresion: 'pensando' });
  }
  const analisis = textoAnalisis(frase);
  if (analisis) paginas.push({ texto: analisis, expresion: 'pensando' });
  const pron = pronunciacionFrase(frase, palabras);
  if (pron) {
    paginas.push({ texto: `Se pronuncia más o menos: **${pron}**. Es una aproximación para hispanohablantes, no una transcripción exacta.`, expresion: 'normal' });
  }
  for (const nota of frase.notas) paginas.push({ texto: nota, expresion: 'pensando' });
  sonar('pagina');
  decir(paginas);
}

// ---------------------------------------------------------------------------
// Bloques
// ---------------------------------------------------------------------------

function bloqueExplicacion(b) {
  return el('section', { class: 'caja explicacion' },
    el('span', { class: 'etiqueta-bloque' }, 'Explicación'),
    b.titulo && el('h2', { class: 'bloque-titulo' }, b.titulo),
    textoConFormato(b.texto));
}

function bloqueDialogo(b, leccion) {
  const lista = el('ul', { class: 'frases' });
  let selloActivo = null;
  for (const frase of b.frases) {
    const sello = el('button', {
      type: 'button',
      class: 'sello',
      'aria-pressed': 'false',
      'aria-label': `Explicar la frase: ${frase.da}`,
      title: 'Explicar la frase',
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
        el('p', { class: 'frase-da', lang: 'en' }, fraseInteractiva(frase.da, leccion.palabras)),
        frase.es && el('p', { class: 'frase-es' }, frase.es),
        analisisDesplegable(frase, `analisis-${++contadorAnalisis}`)),
      el('div', { class: 'frase-acciones' },
        botonEscuchar(frase.da),
        botonGuardar({ da: frase.da, es: frase.es, pron: pronunciacionFrase(frase, leccion.palabras), nota: frase.notas[0], tipo: 'frase', origen: origenActual }))));
  }

  const seccion = el('section', { class: 'caja dialogo' });
  const alternar = el('button', { type: 'button', class: 'boton boton-mini ver-traducciones', 'aria-pressed': 'false' }, 'Ocultar traducciones');
  alternar.addEventListener('click', () => {
    const ocultas = seccion.classList.toggle('ocultar-traduccion');
    alternar.setAttribute('aria-pressed', String(ocultas));
    alternar.textContent = ocultas ? 'Mostrar traducciones' : 'Ocultar traducciones';
  });

  // Modo «solo escuchar»: se oculta el texto inglés (comprensión auditiva pura).
  const soloOir = el('button', { type: 'button', class: 'boton boton-mini', 'aria-pressed': 'false' }, '🙈 Solo escuchar');
  soloOir.addEventListener('click', () => {
    const activo = seccion.classList.toggle('ocultar-danes');
    soloOir.setAttribute('aria-pressed', String(activo));
    soloOir.textContent = activo ? '👁 Mostrar texto' : '🙈 Solo escuchar';
    if (activo) decir('Texto oculto. Pulsa ▶ y escucha. Usa 🔊 en cada frase si se te escapa algo. ¡Nada de hacer trampas!', 'pensando');
  });

  // Escuchar el diálogo entero; cada personaje con un tono de voz distinto.
  const tonos = new Map();
  const nombre = b.esTexto ? 'el texto' : 'el diálogo';
  const escuchar = el('button', { type: 'button', class: 'boton boton-principal boton-mini' }, `▶ Escuchar ${nombre}`);
  let sonando = false;
  const items = [...lista.children];
  const parar = () => {
    sonando = false;
    escuchar.textContent = `▶ Escuchar ${nombre}`;
    items.forEach(li => li.classList.remove('sonando'));
  };
  escuchar.addEventListener('click', () => {
    if (sonando) { callar(); parar(); return; }
    const secuencia = b.frases.map(f => {
      if (!tonos.has(f.quien)) tonos.set(f.quien, [1, 0.75, 1.3, 0.9][tonos.size % 4]);
      return { texto: f.da, tono: tonos.get(f.quien) };
    });
    const ok = pronunciarSeguido(secuencia, {
      alEmpezar: i => items.forEach((li, k) => li.classList.toggle('sonando', k === i)),
      alAcabar: parar,
    });
    if (!ok) { decir(AYUDA_VOZ, 'apurada'); return; }
    sonando = true;
    escuchar.textContent = '■ Parar';
  });

  seccion.append(
    el('span', { class: 'etiqueta-bloque' }, b.esTexto ? 'Texto' : 'Diálogo'),
    escuchar,
    b.titulo && el('h2', { class: 'bloque-titulo' }, b.titulo),
    el('p', { class: 'aprox' }, 'Toca una palabra subrayada para ver qué significa. Pulsa «?» para que la tutora explique la frase.'),
    lista,
    el('div', { class: 'botonera' }, alternar, soloOir));
  return seccion;
}

function bloqueVocabulario(b, leccion) {
  const lista = el('ul', { class: 'vocabulario' });
  for (const palabra of b.palabras) {
    const v = leccion.palabras.get(normalizarPalabra(palabra));
    if (!v) {
      lista.append(el('li', { class: 'voz' }, el('p', { class: 'voz-da' }, palabra), el('p', { class: 'aviso-bloque' }, '⚠ Falta en «palabras».')));
      continue;
    }
    const filas = [
      ['Pronunciación', v.pron && `${v.pron} (aprox.)`],
      ['Cómo suena', v.consejo],
      ['IPA', v.ipa && `[${v.ipa}]`],
      ['Tipo', v.cat],
      ['Género', ETIQUETA_GENERO[v.genero] ?? v.genero],
      ['Forma definida', v.definida],
      ['Plural', v.plural],
      ['Ejemplo', v.ejemplo],
      ['Nota', v.nota],
    ].filter(([, valor]) => valor);
    lista.append(el('li', { class: 'voz' },
      el('div', { class: 'voz-cabecera' },
        el('p', { class: 'voz-da', lang: 'en' }, v.da),
        botonEscuchar(v.da),
        botonGuardar(itemPalabra(v))),
      el('p', { class: 'voz-es' }, v.es ?? ''),
      el('dl', {}, filas.flatMap(([t, d]) => [el('dt', {}, `${t}:`), el('dd', {}, d)]))));
  }
  return el('section', { class: 'caja' },
    el('span', { class: 'etiqueta-bloque' }, 'Vocabulario'),
    b.titulo && el('h2', { class: 'bloque-titulo' }, b.titulo),
    lista);
}

/** Tabla (conjugaciones, pronombres, plurales…). Las casillas admiten **negrita**. */
function bloqueTabla(b) {
  return el('section', { class: 'caja' },
    el('span', { class: 'etiqueta-bloque' }, 'Tabla'),
    b.titulo && el('h2', { class: 'bloque-titulo' }, b.titulo),
    el('div', { class: 'tabla-contenedor', tabindex: '0', role: 'region', 'aria-label': b.titulo ?? 'Tabla' },
      el('table', { class: 'tabla' },
        b.columnas && el('thead', {}, el('tr', {}, b.columnas.map(c => el('th', { scope: 'col' }, enLinea(c))))),
        el('tbody', {}, b.filas.map(fila => el('tr', {}, fila.map(c => el('td', {}, enLinea(c)))))))),
    b.nota && el('p', { class: 'aprox' }, enLinea(b.nota)));
}

function bloqueImagen(b) {
  return el('figure', { class: 'caja imagen' },
    el('img', { src: b.archivo, alt: b.descripcion, loading: 'lazy' }),
    b.pie && el('figcaption', { class: 'aprox' }, b.pie));
}

function bloqueConError(b) {
  return el('section', { class: 'caja' },
    el('p', { class: 'aviso-bloque' }, `⚠ Este bloque no se puede mostrar. ${b.error}`));
}

// ---------------------------------------------------------------------------
// Lección completa
// ---------------------------------------------------------------------------

function textoProgreso(r) {
  return `Ejercicios: ${r.completados}/${r.total} · Aciertos: ${r.aciertos} · Errores: ${r.errores}`;
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

export function pintarLeccion(contenedor, resultado, siguiente) {
  const { avisos } = resultado;
  // Las palabras propias de la lección mandan sobre las del resto del curso.
  const leccion = { ...resultado.leccion, palabras: new Map([...diccionarioGlobal, ...resultado.leccion.palabras]) };
  marcarAbierta(leccion.id);
  origenActual = `Lección ${leccion.id}`;

  const progreso = el('p', { class: 'aprox' });
  const actualizar = () => {
    const r = resumenLeccion(leccion.id, leccion.idsEjercicios);
    progreso.textContent = textoProgreso(r);
    pintarFinal(r);
  };

  const cabecera = el('header', { class: 'cabecera-leccion' },
    el('a', { class: 'boton boton-mini volver', href: '#/lecciones' }, '◀ Lecciones'),
    el('p', { class: 'etiqueta-bloque' }, `Lección ${leccion.id}`),
    el('h1', { class: 'titulo-da', lang: 'en' }, leccion.titulo_da),
    el('p', { class: 'titulo-es' }, leccion.titulo_es),
    progreso);

  const avisosEl = avisos.length
    ? el('details', { class: 'caja tarjeta-error' },
      el('summary', {}, `⚠ El archivo ${resultado.archivo} tiene ${avisos.length} aviso(s)`),
      el('ul', {}, avisos.map(a => el('li', {}, a))))
    : null;

  let numero = 0;
  const bloques = leccion.bloques.map(b => {
    if (b.error) return bloqueConError(b);
    if (b.tipo === 'explicacion') return bloqueExplicacion(b);
    if (b.tipo === 'dialogo') return bloqueDialogo(b, leccion);
    if (b.tipo === 'vocabulario') return bloqueVocabulario(b, leccion);
    if (b.tipo === 'tabla') return bloqueTabla(b);
    if (b.tipo === 'imagen') return bloqueImagen(b);
    numero += 1;
    return crearEjercicio(b, leccion.id, numero, actualizar);
  });

  const final = el('section', { class: 'caja final-leccion' });

  function pintarFinal(r) {
    const faltan = r.total - r.completados;
    const botonTerminar = el('button', { type: 'button', class: 'boton boton-principal' }, 'Terminar lección');
    botonTerminar.addEventListener('click', () => {
      if (faltan > 0) {
        decir(`¡Eh, eh! No tan deprisa: te ${faltan === 1 ? 'falta 1 ejercicio' : `faltan ${faltan} ejercicios`}. Hazlos y luego presumimos.`, 'apurada');
        return;
      }
      marcarTerminada(leccion.id);
      sonar('fin');
      decir(`¡Lección terminada! ${r.aciertos} aciertos. Sabía que con una tutora como yo lo conseguirías. Estoy orgullosa de ti.`, 'contenta');
      actualizar();
      final.querySelector('a, button')?.focus();
    });

    poner(final, 
      el('h2', {}, r.terminada ? '✔ Lección terminada' : 'Fin de la lección'),
      el('p', { class: 'resumen' }, textoProgreso(r)),
      r.terminada ? null : botonTerminar,
      siguiente
        ? el('a', { class: 'boton', href: `#/leccion/${siguiente}` }, 'Siguiente lección ▶')
        : el('a', { class: 'boton', href: '#/lecciones' }, '◀ Volver a las lecciones'));
  }

  poner(contenedor, ...[cabecera, avisosEl, ...bloques, final].filter(Boolean));
  actualizar();

  decir(leccion.intro ?? `¡Vamos con «${leccion.titulo_es || leccion.titulo_da}»! Toca las palabras subrayadas para ver su significado y pulsa el sello «?» de cada frase para que te la explique yo.`);
}
