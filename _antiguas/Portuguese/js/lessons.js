// Carga y revisa el curso: lessons/curso.json (unidades) y lessons/<id>.json (lecciones).
// El formato está explicado en notes/formato.md.
//
// Los avisos y errores no son textos fijos sino { k: clave, v: variables }: se traducen
// al mostrarlos (textoAviso), así cambian de idioma junto con el resto de la interfaz.
// Este archivo no usa el DOM: también lo usan las herramientas de tools/ con Node.

import { esTextoLocalizado, tr } from './i18n.js';

const CARPETA = 'lessons/';
const LOTE = 8; // cuántos archivos se piden a la vez

export const TIPOS_BLOQUE = ['explicacion', 'dialogo', 'texto', 'vocabulario', 'tabla', 'imagen'];
export const TIPOS_EJERCICIO = ['test', 'traduccion', 'huecos', 'escribir', 'ordenar'];
const TIPOS_OPCIONES = ['test', 'traduccion', 'huecos'];
export const EXPRESIONES_TUTORA = ['normal', 'pensando', 'contenta', 'apurada', 'sorprendida', 'confundida'];

/** Identificadores de unidades, lecciones y ejercicios: minúsculas, números, «-» y «_». */
export const ID_VALIDO = /^[a-z0-9][a-z0-9_-]{0,63}$/;

/**
 * Funciones gramaticales y tipos de palabra con nombre traducido (claves «grammar.*»).
 * En «analisis» y en «cat» se puede usar una de estas claves o un texto libre.
 */
export const GRAMATICA = [
  'sujeto', 'verbo', 'infinitivo', 'complemento', 'atributo', 'objeto', 'interrogativo', 'negacion',
  'articulo', 'sustantivo', 'adjetivo', 'pronombre', 'reflexivo', 'posesivo', 'preposicion', 'adverbio',
  'conjuncion', 'interjeccion', 'expresion', 'nombre', 'numero', 'saludo',
];

const CAMPOS = {
  curso: ['unidades'],
  unidad: ['id', 'titulo', 'subtitulo', 'descripcion', 'lecciones'],
  leccion: ['id', 'titulo', 'subtitulo', 'intro', 'palabras', 'bloques'],
  palabra: ['trad', 'pron', 'consejo', 'ipa', 'cat', 'genero', 'plural', 'femenino', 'nota', 'ejemplo'],
  explicacion: ['tipo', 'titulo', 'texto', 'tutora'],
  dialogo: ['tipo', 'titulo', 'frases', 'tutora'],
  frase: ['quien', 'pt', 'trad', 'literal', 'pron', 'nota', 'analisis', 'estructura'],
  vocabulario: ['tipo', 'titulo', 'palabras', 'tutora'],
  tabla: ['tipo', 'titulo', 'columnas', 'filas', 'nota', 'tutora'],
  imagen: ['tipo', 'archivo', 'descripcion', 'pie', 'tutora'],
  ejercicio: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'opciones', 'correcta', 'tutora'],
  escribir: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'respuestas', 'explicacion', 'tutora'],
  ordenar: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'traduccion', 'explicacion', 'tutora'],
  opcion: ['texto', 'explicacion', 'correcta'],
};

/** Aviso traducible. */
export function msg(k, v = {}) {
  return { k, v };
}

/** Texto de un aviso en el idioma actual (t es la función de i18n.js). */
export function textoAviso(aviso, t) {
  if (typeof aviso === 'string') return aviso;
  const v = Object.fromEntries(Object.entries(aviso.v ?? {}).map(([clave, valor]) => [clave, valor && typeof valor === 'object' && valor.k ? textoAviso(valor, t) : valor]));
  return t(aviso.k, v);
}

// Versión del despliegue (la pone tools/build.mjs en index.html). Evita que la caché sirva JSON viejos.
const VERSION = (() => {
  try { return new URL(import.meta.url).searchParams.get('v'); } catch { return null; }
})();
export function conVersion(archivo) {
  return VERSION && VERSION !== '__VERSION__' ? `${archivo}?v=${VERSION}` : archivo;
}

// ---------------------------------------------------------------------------
// Lectura de archivos
// ---------------------------------------------------------------------------

/** Lee un JSON. Devuelve { json, texto }, { noExiste, sinConexion? } o { error }. */
async function leerJSON(archivo) {
  let texto;
  try {
    const respuesta = await fetch(conVersion(archivo), { cache: 'no-cache' });
    if (respuesta.status === 404) return { noExiste: true };
    if (!respuesta.ok) return { error: { titulo: msg('validation.loadFailed', { archivo }), detalles: [msg('validation.httpStatus', { codigo: respuesta.status })] } };
    texto = await respuesta.text();
  } catch {
    return { noExiste: true, sinConexion: true };
  }
  return interpretarJSON(texto, archivo);
}

/** Convierte el texto en JSON o explica el error de formato. */
export function interpretarJSON(texto, archivo) {
  try {
    return { json: JSON.parse(texto.replace(/^\uFEFF/, '')), texto };
  } catch (e) {
    return { error: explicarErrorDeFormato(texto, e, msg('validation.loadFailed', { archivo })) };
  }
}

/**
 * Carga el curso completo.
 * Devuelve { unidades, resultados, error?, sinConexion? }.
 * Cada resultado: { id, archivo, unidad, leccion, avisos } o { id, archivo, unidad, error }.
 */
export async function cargarCurso() {
  const archivo = `${CARPETA}curso.json`;
  const r = await leerJSON(archivo);
  if (r.noExiste) {
    return r.sinConexion
      ? { unidades: [], resultados: [], sinConexion: true }
      : { unidades: [], resultados: [], error: { titulo: msg('validation.loadFailed', { archivo }), detalles: [msg('validation.courseMissing')] } };
  }
  if (r.error) return { unidades: [], resultados: [], error: r.error };

  const { unidades, avisos, fatal } = revisarCurso(r.json);
  if (fatal) return { unidades: [], resultados: [], error: { titulo: msg('validation.loadFailed', { archivo }), detalles: fatal } };

  const pendientes = unidades.flatMap(u => u.lecciones.map(id => ({ id, unidad: u.id })));
  const resultados = [];
  for (let i = 0; i < pendientes.length; i += LOTE) {
    const lote = await Promise.all(pendientes.slice(i, i + LOTE).map(async p => ({ ...(await cargarLeccion(p.id)), unidad: p.unidad })));
    resultados.push(...lote);
  }
  return { unidades, resultados, avisosCurso: avisos };
}

export async function cargarLeccion(id) {
  const archivo = `${CARPETA}${id}.json`;
  const r = await leerJSON(archivo);
  if (r.noExiste) {
    return { id, archivo, error: { titulo: msg('validation.lessonFailed', { id }), detalles: [msg(r.sinConexion ? 'validation.offline' : 'validation.fileNotFound', { archivo })] } };
  }
  if (r.error) return { id, archivo, error: r.error };
  try {
    const { leccion, avisos, fatal } = revisarLeccion(id, r.json);
    if (fatal) return { id, archivo, error: { titulo: msg('validation.lessonFailed', { id }), detalles: fatal } };
    return { id, archivo, leccion, avisos };
  } catch (e) {
    console.error(e);
    return { id, archivo, error: { titulo: msg('validation.lessonFailed', { id }), detalles: [msg('validation.unknownContent')] } };
  }
}

// ---------------------------------------------------------------------------
// Errores de formato JSON explicados para personas
// ---------------------------------------------------------------------------

function explicarErrorDeFormato(texto, error, titulo) {
  const detalles = [msg('validation.jsonError')];
  const posicion = posicionDelError(error.message, texto);

  if (posicion !== null) {
    const { linea, columna } = lineaYColumna(texto, posicion);
    const campo = ultimoCampoAntesDe(texto, posicion);
    detalles.push(campo ? msg('validation.checkLineField', { linea, columna, campo }) : msg('validation.checkLine', { linea, columna }));
    const contenido = texto.split('\n')[linea - 1];
    if (contenido !== undefined) detalles.push({ codigo: contenido.trim().slice(0, 120) });
    const anterior = texto.slice(0, posicion).trimEnd().slice(-1);
    if (/["{[]/.test(texto[posicion] ?? '') && /["}\]0-9el]/.test(anterior)) {
      detalles.push(msg('validation.missingComma'));
    }
  }

  detalles.push(...pistasHabituales(texto));

  if (/end of (JSON|data)|unexpected end|unterminated/i.test(error.message)) {
    detalles.push(msg('validation.endsEarly'));
  }
  return { titulo, detalles };
}

/** Cada navegador describe el error a su manera; intentamos sacar la posición. */
function posicionDelError(mensaje, texto) {
  const lc = /line (\d+) column (\d+)/i.exec(mensaje);
  if (lc) {
    const lineas = texto.split('\n');
    const linea = Math.min(Number(lc[1]), lineas.length);
    let pos = 0;
    for (let i = 0; i < linea - 1; i++) pos += lineas[i].length + 1;
    return pos + Number(lc[2]) - 1;
  }
  const p = /position (\d+)/i.exec(mensaje);
  return p ? Number(p[1]) : buscarPosicionDelError(texto);
}

/**
 * Algunos navegadores no dicen dónde está el error.
 * Este lector de JSON mínimo recorre el texto y devuelve la posición del primer fallo.
 */
function buscarPosicionDelError(texto) {
  let i = 0;
  const fallo = () => { throw i; };
  const espacios = () => { while (/\s/.test(texto[i] ?? '')) i++; };
  const literal = palabra => { if (texto.startsWith(palabra, i)) i += palabra.length; else fallo(); };
  const cadena = () => {
    if (texto[i] !== '"') fallo();
    i++;
    while (i < texto.length && texto[i] !== '"') {
      if (texto[i] === '\n') fallo();
      i += texto[i] === '\\' ? 2 : 1;
    }
    if (texto[i] !== '"') fallo();
    i++;
  };
  const valor = () => {
    espacios();
    const c = texto[i];
    if (c === '{') {
      i++; espacios();
      if (texto[i] === '}') { i++; return; }
      for (;;) {
        espacios(); cadena(); espacios();
        if (texto[i] !== ':') fallo();
        i++; valor(); espacios();
        if (texto[i] === ',') { i++; continue; }
        if (texto[i] === '}') { i++; return; }
        fallo();
      }
    } else if (c === '[') {
      i++; espacios();
      if (texto[i] === ']') { i++; return; }
      for (;;) {
        valor(); espacios();
        if (texto[i] === ',') { i++; continue; }
        if (texto[i] === ']') { i++; return; }
        fallo();
      }
    } else if (c === '"') cadena();
    else if (c === 't') literal('true');
    else if (c === 'f') literal('false');
    else if (c === 'n') literal('null');
    else if (/[-0-9]/.test(c ?? '')) { while (/[-+0-9.eE]/.test(texto[i] ?? '')) i++; }
    else fallo();
  };
  try {
    valor();
    espacios();
    return i < texto.length ? i : null;
  } catch (posicion) {
    return typeof posicion === 'number' ? Math.min(posicion, texto.length) : null;
  }
}

function lineaYColumna(texto, posicion) {
  const antes = texto.slice(0, posicion).split('\n');
  return { linea: antes.length, columna: antes[antes.length - 1].length + 1 };
}

function ultimoCampoAntesDe(texto, posicion) {
  const regex = /"([^"\\\n]{1,40})"\s*:/g;
  let campo = null;
  let m;
  while ((m = regex.exec(texto)) && m.index < posicion) campo = m[1];
  return campo;
}

/** Errores típicos al escribir JSON a mano. */
function pistasHabituales(texto) {
  const pistas = [];
  const lineas = texto.split('\n');
  const buscar = regex => lineas.findIndex(l => regex.test(l)) + 1;

  const comillasCurvas = buscar(/[“”„]/);
  if (comillasCurvas) pistas.push(msg('validation.curlyQuotes', { linea: comillasCurvas }));

  const comaFinal = /,\s*[}\]]/.exec(texto);
  if (comaFinal) pistas.push(msg('validation.trailingComma', { linea: lineaYColumna(texto, comaFinal.index).linea }));

  const comentario = buscar(/^\s*\/\//);
  if (comentario) pistas.push(msg('validation.comment', { linea: comentario }));
  return pistas;
}

// ---------------------------------------------------------------------------
// Revisión del curso (lessons/curso.json)
// ---------------------------------------------------------------------------

function esObjeto(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function textoValido(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function revisarCampos(objeto, permitidos, donde, avisos) {
  for (const clave of Object.keys(objeto)) {
    if (!permitidos.includes(clave)) {
      avisos.push(msg('validation.unknownField', { donde, campo: clave, campos: permitidos.join(', ') }));
    }
  }
}

/**
 * { "unidades": [ { "id", "titulo", "subtitulo", "descripcion", "lecciones": ["id", …] } ] }
 * Devuelve { unidades, avisos } o { fatal }.
 */
export function revisarCurso(json) {
  const avisos = [];
  const lista = Array.isArray(json) ? json : json?.unidades;
  if (!Array.isArray(lista)) return { fatal: [msg('validation.courseNeedsUnits')] };
  if (esObjeto(json)) revisarCampos(json, CAMPOS.curso, 'curso.json', avisos);

  const idsUnidad = new Set();
  const idsLeccion = new Set();
  const unidades = [];
  lista.forEach((u, i) => {
    const donde = msg('validation.where.unit', { n: i + 1 });
    if (!esObjeto(u)) {
      avisos.push(msg('validation.mustBeObject', { donde }));
      return;
    }
    revisarCampos(u, CAMPOS.unidad, donde, avisos);
    const id = String(u.id ?? '').trim();
    if (!ID_VALIDO.test(id)) {
      avisos.push(msg('validation.badId', { donde, id }));
      return;
    }
    if (idsUnidad.has(id)) {
      avisos.push(msg('validation.duplicateId', { donde, id }));
      return;
    }
    idsUnidad.add(id);
    if (!textoValido(u.titulo)) avisos.push(msg('validation.missingTitle', { donde }));
    const lecciones = [];
    for (const idLeccion of Array.isArray(u.lecciones) ? u.lecciones : []) {
      const l = String(idLeccion ?? '').trim();
      if (!ID_VALIDO.test(l)) avisos.push(msg('validation.badId', { donde, id: l }));
      else if (idsLeccion.has(l)) avisos.push(msg('validation.duplicateId', { donde, id: l }));
      else {
        idsLeccion.add(l);
        lecciones.push(l);
      }
    }
    if (!lecciones.length) avisos.push(msg('validation.unitWithoutLessons', { donde }));
    unidades.push({
      id,
      numero: unidades.length + 1,
      titulo: textoValido(u.titulo) ? u.titulo.trim() : id,
      subtitulo: esTextoLocalizado(u.subtitulo) ? u.subtitulo : null,
      descripcion: esTextoLocalizado(u.descripcion) ? u.descripcion : null,
      lecciones,
    });
  });
  return { unidades, avisos };
}

// ---------------------------------------------------------------------------
// Revisión de una lección
// ---------------------------------------------------------------------------

/** Ayuda a escribir «bloque 3 (test)». */
function nombreBloque(i, bloque) {
  return msg(esObjeto(bloque) && bloque.tipo ? 'validation.where.blockType' : 'validation.where.block', { n: i + 1, tipo: esObjeto(bloque) ? bloque.tipo : '' });
}

export function revisarLeccion(id, json) {
  const avisos = [];

  if (!esObjeto(json)) return { fatal: [msg('validation.mustStartWithBrace')] };
  if (!Array.isArray(json.bloques) || json.bloques.length === 0) return { fatal: [msg('validation.missingBlocks')] };

  revisarCampos(json, CAMPOS.leccion, msg('validation.where.lesson'), avisos);
  if (json.id !== undefined && json.id !== id) avisos.push(msg('validation.idMismatch', { id: json.id, archivo: id }));
  if (!textoValido(json.titulo)) avisos.push(msg('validation.missingLessonTitle'));
  if (!esTextoLocalizado(json.subtitulo)) avisos.push(msg('validation.missingSubtitle'));
  revisarIdiomas(json.subtitulo, msg('validation.where.lesson'), avisos);

  const palabras = revisarPalabras(json.palabras, avisos);
  const bloques = json.bloques.map((bloque, i) => revisarBloque(bloque, i, palabras, avisos));

  // Identificadores de ejercicio: sirven para guardar el progreso (también en Supabase).
  const usados = new Set();
  bloques.forEach((b, i) => {
    if (!TIPOS_EJERCICIO.includes(b.tipo) || b.error) return;
    let idEj;
    if (b.idFijo) {
      idEj = b.idFijo;
      if (usados.has(idEj)) avisos.push(msg('validation.duplicateExerciseId', { donde: nombreBloque(i, b), id: idEj }));
    } else {
      // Sin «id», se usa el contenido: el progreso se pierde si se cambia el texto.
      avisos.push(msg('validation.exerciseWithoutId', { donde: nombreBloque(i, b) }));
      idEj = `auto|${b.tipo}|${b.frase || tr(b.pregunta) || ''}`.slice(0, 120);
    }
    const base = idEj;
    for (let n = 2; usados.has(idEj); n++) idEj = `${base}#${n}`;
    usados.add(idEj);
    b.id = idEj;
  });

  return {
    avisos,
    leccion: {
      id,
      titulo: textoValido(json.titulo) ? json.titulo.trim() : id,
      subtitulo: esTextoLocalizado(json.subtitulo) ? json.subtitulo : '',
      intro: esTextoLocalizado(json.intro) ? json.intro : null,
      palabras,
      bloques,
      idsEjercicios: bloques.filter(b => b.id).map(b => b.id),
    },
  };
}

/** Avisa si un texto traducible tiene inglés pero no vietnamita (o al revés). */
function revisarIdiomas(valor, donde, avisos) {
  if (!esObjeto(valor)) return;
  for (const codigo of ['en', 'vi']) {
    if (!esTextoLocalizado(valor[codigo])) avisos.push(msg('validation.missingLanguage', { donde, idioma: codigo }));
  }
}

/** Diccionario de la lección. Se admite "gracias": { "en": "thank you", "vi": "cảm ơn" } como forma corta. */
function revisarPalabras(palabras, avisos) {
  const mapa = new Map();
  if (palabras === undefined) return mapa;
  if (!esObjeto(palabras)) {
    avisos.push(msg('validation.wordsMustBeObject'));
    return mapa;
  }
  for (const [clave, valor] of Object.entries(palabras)) {
    const donde = msg('validation.where.word', { palabra: clave });
    let entrada;
    if (typeof valor === 'string' || (esObjeto(valor) && valor.trad === undefined && Object.keys(valor).every(k => k.length === 2))) {
      entrada = { trad: valor };
    } else if (esObjeto(valor)) {
      revisarCampos(valor, CAMPOS.palabra, donde, avisos);
      entrada = { ...valor };
    } else {
      avisos.push(msg('validation.badWord', { donde }));
      continue;
    }
    if (!esTextoLocalizado(entrada.trad)) avisos.push(msg('validation.missingTranslation', { donde }));
    else revisarIdiomas(entrada.trad, donde, avisos);
    if (entrada.genero !== undefined && !['m', 'f', 'mf'].includes(entrada.genero)) {
      avisos.push(msg('validation.badGender', { donde }));
    }
    mapa.set(normalizarPalabra(clave), { pt: clave.trim(), ...entrada });
  }
  return mapa;
}

export function normalizarPalabra(texto) {
  return String(texto).trim().toLocaleLowerCase('pt').replace(/\s+/g, ' ');
}

/**
 * Análisis gramatical de una frase (opcional):
 * "analisis": [["Me llamo", "verbo"], ["Ana", "nombre", { "en": "Ana", "vi": "Ana" }]]
 * La función puede ser una clave de GRAMATICA o un texto { en, vi }.
 * Devuelve [{ texto, funcion, glosa }] o null.
 */
export function revisarAnalisis(f, donde, avisos) {
  if (f.analisis === undefined) return null;
  if (!Array.isArray(f.analisis)) {
    avisos.push(msg('validation.analysisMustBeList', { donde }));
    return null;
  }
  const partes = [];
  const frase = String(f.pt).toLocaleLowerCase('pt');
  f.analisis.forEach((parte, k) => {
    if (!Array.isArray(parte) || parte.length < 2 || !textoValido(parte[0]) || !esTextoLocalizado(parte[1])) {
      avisos.push(msg('validation.analysisPart', { donde, n: k + 1 }));
      return;
    }
    if (!frase.includes(parte[0].toLocaleLowerCase('pt').replace(/[?!.]+$/, ''))) {
      avisos.push(msg('validation.analysisNotInSentence', { donde, n: k + 1, texto: parte[0] }));
    }
    partes.push({ texto: parte[0], funcion: parte[1], glosa: parte[2] ?? null });
  });
  return partes.length ? partes : null;
}

/** Frases de diálogos y de phrases/frases.json: { pt, trad, … }. */
function revisarFrase(f, donde, avisos) {
  if (!esObjeto(f) || !textoValido(f.pt)) {
    avisos.push(msg('validation.missingPortugueseSentence', { donde }));
    return null;
  }
  revisarCampos(f, CAMPOS.frase, donde, avisos);
  if (!esTextoLocalizado(f.trad)) avisos.push(msg('validation.missingTranslation', { donde }));
  else revisarIdiomas(f.trad, donde, avisos);
  const notas = f.nota === undefined ? [] : [].concat(f.nota).filter(esTextoLocalizado);
  return { ...f, notas, analisis: revisarAnalisis(f, donde, avisos) };
}

function revisarBloque(bloque, i, palabras, avisos) {
  const donde = nombreBloque(i, bloque);
  if (!esObjeto(bloque)) return { tipo: 'error', error: msg('validation.mustBeObject', { donde }) };

  const tipo = String(bloque.tipo ?? '').trim().toLowerCase();
  const fallo = (k, v = {}) => ({ tipo, error: msg(k, { donde, ...v }) });
  const tutora = EXPRESIONES_TUTORA.includes(bloque.tutora) ? bloque.tutora : null;
  if (bloque.tutora !== undefined && !tutora) avisos.push(msg('validation.badTutorExpression', { donde, opciones: EXPRESIONES_TUTORA.join(', ') }));

  if (tipo === 'explicacion') {
    revisarCampos(bloque, CAMPOS.explicacion, donde, avisos);
    if (!esTextoLocalizado(bloque.texto)) return fallo('validation.missingFieldText');
    revisarIdiomas(bloque.texto, donde, avisos);
    return { tipo, titulo: bloque.titulo ?? null, texto: bloque.texto, tutora };
  }

  if (tipo === 'dialogo' || tipo === 'texto') {
    revisarCampos(bloque, CAMPOS.dialogo, donde, avisos);
    if (!Array.isArray(bloque.frases) || bloque.frases.length === 0) return fallo('validation.missingSentences');
    const frases = bloque.frases
      .map((f, j) => revisarFrase(f, msg('validation.where.sentence', { donde, n: j + 1 }), avisos))
      .filter(Boolean);
    return { tipo: 'dialogo', esTexto: tipo === 'texto', titulo: bloque.titulo ?? null, frases, tutora };
  }

  if (tipo === 'vocabulario') {
    revisarCampos(bloque, CAMPOS.vocabulario, donde, avisos);
    const lista = Array.isArray(bloque.palabras) ? bloque.palabras.map(String) : [...palabras.values()].map(p => p.pt);
    const faltan = lista.filter(p => !palabras.has(normalizarPalabra(p)));
    if (faltan.length) avisos.push(msg('validation.wordsNotDefined', { donde, palabras: faltan.join(', ') }));
    return { tipo, titulo: bloque.titulo ?? null, palabras: lista, tutora };
  }

  if (tipo === 'tabla') {
    revisarCampos(bloque, CAMPOS.tabla, donde, avisos);
    if (!Array.isArray(bloque.filas) || !bloque.filas.length || !bloque.filas.every(Array.isArray)) return fallo('validation.badRows');
    const columnas = Array.isArray(bloque.columnas) ? bloque.columnas : null;
    const ancho = Math.max(columnas?.length ?? 0, ...bloque.filas.map(f => f.length));
    if (bloque.filas.some(f => f.length !== ancho)) avisos.push(msg('validation.unevenRows', { donde }));
    return {
      tipo,
      titulo: bloque.titulo ?? null,
      columnas,
      filas: bloque.filas.map(f => f.map(c => (esObjeto(c) ? c : String(c ?? '')))),
      nota: esTextoLocalizado(bloque.nota) ? bloque.nota : null,
    };
  }

  if (tipo === 'imagen') {
    revisarCampos(bloque, CAMPOS.imagen, donde, avisos);
    if (!textoValido(bloque.archivo)) return fallo('validation.missingImageFile');
    if (!esTextoLocalizado(bloque.descripcion)) avisos.push(msg('validation.missingImageDescription', { donde }));
    return { tipo, archivo: bloque.archivo.trim(), descripcion: bloque.descripcion ?? '', pie: bloque.pie ?? null };
  }

  if (tipo === 'escribir') {
    revisarCampos(bloque, CAMPOS.escribir, donde, avisos);
    const respuestas = [].concat(bloque.respuestas ?? []).filter(textoValido);
    if (!respuestas.length) return fallo('validation.missingAnswers');
    if (!esTextoLocalizado(bloque.pregunta)) return fallo('validation.missingQuestion');
    return marcarId(bloque, {
      tipo, pregunta: bloque.pregunta, frase: textoValido(bloque.frase) ? bloque.frase : '',
      respuestas, explicacion: bloque.explicacion ?? '', tutora,
    }, donde, avisos);
  }

  if (tipo === 'ordenar') {
    revisarCampos(bloque, CAMPOS.ordenar, donde, avisos);
    if (!textoValido(bloque.frase)) return fallo('validation.missingOrderSentence');
    if (bloque.frase.trim().split(/\s+/).length < 2) return fallo('validation.orderNeedsTwoWords');
    return marcarId(bloque, {
      tipo, pregunta: esTextoLocalizado(bloque.pregunta) ? bloque.pregunta : '', frase: bloque.frase.trim(),
      traduccion: bloque.traduccion ?? '', explicacion: bloque.explicacion ?? '', tutora,
    }, donde, avisos);
  }

  if (TIPOS_OPCIONES.includes(tipo)) {
    revisarCampos(bloque, CAMPOS.ejercicio, donde, avisos);
    const ejercicio = revisarEjercicio(bloque, tipo, fallo, donde, avisos);
    return ejercicio.error ? ejercicio : marcarId(bloque, { ...ejercicio, tutora }, donde, avisos);
  }

  return { tipo: 'error', error: msg('validation.unknownType', { donde, tipo: bloque.tipo ?? '', tipos: [...TIPOS_BLOQUE, ...TIPOS_EJERCICIO].join(', ') }) };
}

function marcarId(bloque, ejercicio, donde, avisos) {
  // «audio»: texto en portugués que se escucha (ejercicios de comprensión oral).
  if (textoValido(bloque.audio)) ejercicio.audio = bloque.audio.trim();
  else if (bloque.audio === true && textoValido(bloque.frase)) {
    // En los huecos se oye la frase completa, con la respuesta correcta en su sitio.
    // Las pistas entre paréntesis no se leen.
    const relleno = ejercicio.opciones?.find(o => o.correcta)?.texto;
    ejercicio.audio = bloque.frase.replace(/\s*\([^)]*\)/g, '').replace(/_{2,}/g, typeof relleno === 'string' ? relleno : ' ').replace(/\s+/g, ' ').trim();
  }
  if (bloque.id !== undefined) {
    const id = String(bloque.id).trim();
    if (ID_VALIDO.test(id)) ejercicio.idFijo = id;
    else avisos.push(msg('validation.badId', { donde, id }));
  }
  return ejercicio;
}

/**
 * Opciones, en cualquiera de estas formas:
 * - { "soy": "explicación", "estoy": { "en": "…", "vi": "…" } } con "correcta": "soy";
 * - ["soy", "estoy"] con "correcta": "soy";
 * - [{ "texto": { "en": "Good morning", "vi": "Chào buổi sáng" }, "explicacion": …, "correcta": true }, …]
 *   (para cuando las opciones están en el idioma de la interfaz).
 */
function revisarEjercicio(bloque, tipo, fallo, donde, avisos) {
  let opciones;
  if (Array.isArray(bloque.opciones)) {
    opciones = bloque.opciones.map(o => {
      if (esObjeto(o) && 'texto' in o) {
        revisarCampos(o, CAMPOS.opcion, donde, avisos);
        return { texto: o.texto, explicacion: o.explicacion ?? '', marcada: o.correcta === true };
      }
      return { texto: String(o), explicacion: '' };
    });
  } else if (esObjeto(bloque.opciones)) {
    opciones = Object.entries(bloque.opciones).map(([texto, explicacion]) => ({
      texto,
      explicacion: esTextoLocalizado(explicacion) ? explicacion : '',
    }));
  } else {
    return fallo('validation.missingOptions');
  }
  if (opciones.length < 2) return fallo('validation.twoOptions');
  if (opciones.some(o => !esTextoLocalizado(o.texto))) return fallo('validation.emptyOption');

  let correcta;
  const marcadas = opciones.filter(o => o.marcada);
  if (marcadas.length) {
    if (marcadas.length > 1) return fallo('validation.severalCorrect');
    correcta = marcadas[0];
  } else {
    if (!textoValido(bloque.correcta)) return fallo('validation.missingCorrect');
    const comparar = x => String(x).trim().toLocaleLowerCase('pt');
    correcta = opciones.find(o => typeof o.texto === 'string' && comparar(o.texto) === comparar(bloque.correcta));
    if (!correcta) {
      return fallo('validation.correctNotFound', { correcta: bloque.correcta, opciones: opciones.map(o => tr(o.texto)).join(' / ') });
    }
  }

  if (tipo === 'test' && !esTextoLocalizado(bloque.pregunta)) return fallo('validation.missingQuestion');
  if (tipo === 'huecos') {
    if (!textoValido(bloque.frase)) return fallo('validation.missingGapSentence');
    if (!/_{2,}/.test(bloque.frase)) avisos.push(msg('validation.noGap', { donde }));
  }
  if (tipo === 'traduccion' && !esTextoLocalizado(bloque.pregunta) && !textoValido(bloque.frase)) return fallo('validation.missingQuestionOrSentence');

  return {
    tipo,
    pregunta: esTextoLocalizado(bloque.pregunta) ? bloque.pregunta : '',
    frase: textoValido(bloque.frase) ? bloque.frase : '',
    opciones: opciones.map((o, i) => ({ texto: o.texto, explicacion: o.explicacion, correcta: i === opciones.indexOf(correcta) })),
  };
}

// ---------------------------------------------------------------------------
// Frases útiles (phrases/frases.json)
// ---------------------------------------------------------------------------

/**
 * { "categorias": [{ "titulo", "descripcion", "frases": […] o "grupos": [{ "titulo", "tarea", "leccion", "frases": […] }] }] }
 */
export async function cargarFrases() {
  const r = await leerJSON('phrases/frases.json');
  if (r.noExiste) return { categorias: [], avisos: [] };
  if (r.error) return { categorias: [], avisos: [], error: r.error };
  return revisarFrases(r.json);
}

export function revisarFrases(json) {
  const avisos = [];
  const lista = Array.isArray(json?.categorias) ? json.categorias : [];
  if (!lista.length) avisos.push(msg('validation.noCategories'));
  const revisarLista = (frases, donde) => (Array.isArray(frases) ? frases : [])
    .map((f, j) => revisarFrase(f, msg('validation.where.sentence', { donde, n: j + 1 }), avisos))
    .filter(Boolean);
  const categorias = lista.filter(esObjeto).map((c, i) => {
    const donde = msg('validation.where.category', { n: i + 1 });
    return {
      titulo: esTextoLocalizado(c.titulo) ? c.titulo : `#${i + 1}`,
      descripcion: esTextoLocalizado(c.descripcion) ? c.descripcion : '',
      frases: revisarLista(c.frases, donde),
      grupos: (Array.isArray(c.grupos) ? c.grupos : []).filter(esObjeto).map((g, k) => ({
        titulo: esTextoLocalizado(g.titulo) ? g.titulo : `#${k + 1}`,
        tarea: esTextoLocalizado(g.tarea) ? g.tarea : '',
        leccion: textoValido(g.leccion) ? g.leccion : '',
        frases: revisarLista(g.frases, msg('validation.where.group', { donde, n: k + 1 })),
      })),
    };
  });
  return { categorias, avisos };
}
