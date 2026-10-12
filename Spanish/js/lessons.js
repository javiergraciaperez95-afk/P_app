// Descubre, carga y revisa las lecciones (lessons/001.json, 002.json, …).
// El español va en «es»; las traducciones, en «en» (inglés) y «vi» (vietnamita).
// Los demás textos (explicaciones, notas, preguntas…) pueden ser un texto o { "en": "…", "vi": "…" }.

import { t } from './i18n.js';

const CARPETA = 'lessons/';
const HUECOS_PERMITIDOS = 3; // se para tras 3 archivos seguidos que no existen
const LOTE = 20;             // cuántos archivos se piden a la vez

export const TIPOS_EJERCICIO = ['test', 'traduccion', 'huecos', 'escribir', 'ordenar'];
const TIPOS_OPCIONES = ['test', 'traduccion', 'huecos'];

const CAMPOS = {
  leccion: ['capitulo', 'titulo_es', 'titulo', 'intro', 'palabras', 'bloques'],
  palabra: ['en', 'vi', 'zh', 'pron', 'consejo', 'ipa', 'cat', 'genero', 'plural', 'nota', 'ejemplo'],
  explicacion: ['tipo', 'titulo', 'texto', 'tutora'],
  dialogo: ['tipo', 'titulo', 'frases', 'tutora'],
  frase: ['quien', 'es', 'en', 'vi', 'zh', 'literal', 'pron', 'nota', 'analisis', 'estructura'],
  vocabulario: ['tipo', 'titulo', 'palabras', 'tutora'],
  tabla: ['tipo', 'titulo', 'columnas', 'filas', 'nota', 'tutora'],
  imagen: ['tipo', 'archivo', 'descripcion', 'pie', 'tutora'],
  ejercicio: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'opciones', 'correcta', 'tutora'],
  escribir: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'respuestas', 'explicacion', 'tutora'],
  ordenar: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'traduccion', 'explicacion', 'tutora'],
};

/** Nombre de archivo a partir de un número: 7 → "007". */
export function idDeNumero(n) {
  return String(n).padStart(3, '0');
}

/**
 * Busca lecciones probando 001, 002, 003… hasta encontrar varios huecos seguidos.
 * Devuelve una lista de resultados: { id, archivo, leccion, avisos } o { id, archivo, error }.
 */
export async function descubrirLecciones() {
  const encontradas = [];
  let huecosSeguidos = 0;
  let sinConexion = false;
  for (let inicio = 1; huecosSeguidos < HUECOS_PERMITIDOS && inicio < 1000; inicio += LOTE) {
    const ids = Array.from({ length: LOTE }, (_, i) => idDeNumero(inicio + i));
    const lote = await Promise.all(ids.map(cargarLeccion));
    for (const resultado of lote) {
      if (huecosSeguidos >= HUECOS_PERMITIDOS) break;
      if (resultado.noExiste) {
        if (resultado.sinConexion) sinConexion = true;
        huecosSeguidos += 1;
      } else {
        huecosSeguidos = 0;
        encontradas.push(resultado);
      }
    }
  }
  // Si no se ha encontrado nada porque no hay conexión, se avisa.
  if (!encontradas.length && sinConexion) encontradas.sinConexion = true;
  return encontradas;
}

// Versión del despliegue (la pone el workflow en index.html). Evita que la caché sirva JSON viejos.
const VERSION = new URL(import.meta.url).searchParams.get('v');
function conVersion(archivo) {
  return VERSION && VERSION !== '__VERSION__' ? `${archivo}?v=${VERSION}` : archivo;
}

export async function cargarLeccion(id) {
  const archivo = `${CARPETA}${id}.json`;
  let texto;
  try {
    const respuesta = await fetch(conVersion(archivo), { cache: 'no-cache' });
    if (respuesta.status === 404) return { id, archivo, noExiste: true };
    if (!respuesta.ok) {
      return { id, archivo, error: errorSimple(id, t('rev.codigoServidor', { codigo: respuesta.status })) };
    }
    texto = await respuesta.text();
  } catch {
    return { id, archivo, noExiste: true, sinConexion: true };
  }

  let json;
  try {
    json = JSON.parse(texto.replace(/^﻿/, ''));
  } catch (e) {
    return { id, archivo, error: explicarErrorDeFormato(id, texto, e) };
  }

  try {
    const { leccion, avisos, fatal } = revisarLeccion(id, json);
    if (fatal) return { id, archivo, error: { titulo: t('rev.noCargaLeccion', { id }), detalles: fatal } };
    return { id, archivo, leccion, avisos };
  } catch (e) {
    console.error(e);
    return { id, archivo, error: errorSimple(id, t('rev.noEntiende')) };
  }
}

function errorSimple(id, detalle) {
  return { titulo: t('rev.noCargaLeccion', { id }), detalles: [detalle] };
}

// ---------------------------------------------------------------------------
// Errores de formato JSON explicados para personas
// ---------------------------------------------------------------------------

function explicarErrorDeFormato(id, texto, error, titulo = t('rev.noCargaLeccion', { id })) {
  const detalles = [t('rev.errorJson')];
  const posicion = posicionDelError(error.message, texto);

  if (posicion !== null) {
    const { linea, columna } = lineaYColumna(texto, posicion);
    const campo = ultimoCampoAntesDe(texto, posicion);
    detalles.push(campo ? t('rev.revisaLineaCampo', { linea, columna, campo }) : t('rev.revisaLinea', { linea, columna }));
    const contenido = texto.split('\n')[linea - 1];
    if (contenido !== undefined) detalles.push({ codigo: contenido.trim().slice(0, 120) });
    const anterior = texto.slice(0, posicion).trimEnd().slice(-1);
    if (/["{[]/.test(texto[posicion] ?? '') && /["}\]0-9el]/.test(anterior)) {
      detalles.push(t('rev.faltaComa'));
    }
  }

  for (const pista of pistasHabituales(texto)) detalles.push(pista);

  if (/end of (JSON|data)|unexpected end|unterminated/i.test(error.message)) {
    detalles.push(t('rev.terminaAntes'));
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
  if (comillasCurvas) {
    pistas.push(t('rev.comillasCurvas', { linea: comillasCurvas }));
  }

  const comaFinal = /,\s*[}\]]/.exec(texto);
  if (comaFinal) {
    const { linea } = lineaYColumna(texto, comaFinal.index);
    pistas.push(t('rev.comaSobra', { linea }));
  }

  if (buscar(/^\s*\/\//)) {
    pistas.push(t('rev.comentario', { linea: buscar(/^\s*\/\//) }));
  }
  return pistas;
}

// ---------------------------------------------------------------------------
// Revisión del contenido
// ---------------------------------------------------------------------------

function esObjeto(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function textoValido(v) {
  return typeof v === 'string' && v.trim() !== '';
}

/** Un texto o un grupo { "en": "…", "vi": "…" } con al menos un texto. */
function traducible(v) {
  return textoValido(v) || (esObjeto(v) && Object.values(v).some(textoValido));
}

/** Traducción de una frase o palabra: { en, vi } con lo que haya. Devuelve null si no hay ninguna. */
function traduccionDe(objeto) {
  const trad = {};
  for (const i of ['en', 'vi', 'zh']) if (traducible(objeto[i])) trad[i] = objeto[i];
  return Object.keys(trad).length ? trad : null;
}

/** Avisa si falta la traducción al inglés. El vietnamita del contenido es opcional. */
function revisarTraduccion(objeto, donde, avisos) {
  if (!traducible(objeto.en)) avisos.push(t('rev.faltaTraduccion', { donde, campos: '«en»' }));
}

function revisarCampos(objeto, permitidos, donde, avisos) {
  for (const clave of Object.keys(objeto)) {
    if (!permitidos.includes(clave)) {
      avisos.push(t('rev.campoDesconocido', { donde, campo: clave, posibles: permitidos.join(', ') }));
    }
  }
}

/** Ayuda a escribir «bloque 3 (test)». */
function nombreBloque(i, bloque) {
  const tipo = esObjeto(bloque) && bloque.tipo ? ` (${bloque.tipo})` : '';
  return `${t('rev.bloque', { n: i + 1 })}${tipo}`;
}

export function revisarLeccion(id, json) {
  const avisos = [];

  if (!esObjeto(json)) {
    return { fatal: [t('rev.llaves')] };
  }
  if (!Array.isArray(json.bloques) || json.bloques.length === 0) {
    return { fatal: [t('rev.faltanBloques')] };
  }

  revisarCampos(json, CAMPOS.leccion, t('rev.leccion'), avisos);
  if (!textoValido(json.titulo_es)) avisos.push(t('rev.faltaTituloEs'));
  if (!traducible(json.titulo)) avisos.push(t('rev.faltaTitulo'));

  const palabras = revisarPalabras(json.palabras, avisos);
  const bloques = json.bloques.map((bloque, i) => revisarBloque(bloque, i, palabras, avisos));

  // Identificadores de ejercicio: sirven para guardar el progreso.
  const usados = new Set();
  for (const b of bloques) {
    if (!TIPOS_EJERCICIO.includes(b.tipo) || b.error) continue;
    // Con «id» el progreso se conserva aunque se cambie el texto de la pregunta.
    // Solo cuentan «en» y «vi» (como siempre): añadir otro idioma a la pregunta no cambia el identificador.
    const pregunta = typeof b.pregunta === 'object' ? JSON.stringify(b.pregunta, ['en', 'vi']) : b.pregunta;
    let base = b.idFijo ? `id|${b.idFijo}` : `${b.tipo}|${pregunta}|${b.frase}`;
    let idEj = base;
    for (let n = 2; usados.has(idEj); n++) idEj = `${base}#${n}`;
    usados.add(idEj);
    b.id = idEj;
  }

  return {
    avisos,
    leccion: {
      id,
      titulo_es: textoValido(json.titulo_es) ? json.titulo_es.trim() : `Lección ${id}`,
      titulo: traducible(json.titulo) ? json.titulo : '',
      capitulo: json.capitulo ?? null,
      intro: traducible(json.intro) ? json.intro : null,
      palabras,
      bloques,
      idsEjercicios: bloques.filter(b => b.id).map(b => b.id),
    },
  };
}

/**
 * Diccionario de la lección: la clave es la palabra en español.
 * "hola": { "en": "hello", "vi": "xin chào", "pron": "O-la" }
 * Se admite "hola": "hello" como forma corta (el mismo significado en los dos idiomas).
 * Cada entrada queda como { es, trad, … }.
 */
function revisarPalabras(palabras, avisos) {
  const mapa = new Map();
  if (palabras === undefined) return mapa;
  if (!esObjeto(palabras)) {
    avisos.push(t('rev.palabrasLlaves'));
    return mapa;
  }
  for (const [clave, valor] of Object.entries(palabras)) {
    const donde = t('rev.palabra', { palabra: clave });
    let entrada;
    if (typeof valor === 'string') {
      entrada = { trad: valor };
    } else if (esObjeto(valor)) {
      revisarCampos(valor, CAMPOS.palabra, donde, avisos);
      revisarTraduccion(valor, donde, avisos);
      entrada = { ...valor, trad: traduccionDe(valor) };
    } else {
      avisos.push(t('rev.palabraFormato', { donde }));
      continue;
    }
    mapa.set(normalizarPalabra(clave), { ...entrada, es: clave.trim() });
  }
  return mapa;
}

export function normalizarPalabra(texto) {
  return String(texto).trim().toLocaleLowerCase('es').replace(/\s+/g, ' ');
}

/**
 * Análisis sintáctico de una frase:
 * "analisis": [["Yo", { "en": "subject (I)", "vi": "chủ ngữ (tôi)" }], ["tengo", "verb"], …]
 * Devuelve [{ texto, funcion }] o null.
 */
export function revisarAnalisis(f, donde, avisos) {
  if (f.analisis === undefined) {
    avisos.push(t('rev.faltaAnalisis', { donde }));
    return null;
  }
  if (!Array.isArray(f.analisis)) {
    avisos.push(t('rev.analisisLista', { donde }));
    return null;
  }
  const partes = [];
  const frase = String(f.es).toLocaleLowerCase('es');
  f.analisis.forEach((parte, k) => {
    const aqui = t('rev.analisisN', { donde, n: k + 1 });
    if (!Array.isArray(parte) || parte.length < 2 || !textoValido(parte[0]) || !traducible(parte[1])) {
      avisos.push(t('rev.analisisParte', { donde: aqui }));
      return;
    }
    if (!frase.includes(parte[0].toLocaleLowerCase('es').replace(/[?!.]+$/, '').replace(/^[¿¡]+/, ''))) {
      avisos.push(t('rev.analisisNoAparece', { donde: aqui, texto: parte[0] }));
    }
    partes.push({ texto: parte[0], funcion: parte[1] });
  });
  return partes.length ? partes : null;
}

function revisarBloque(bloque, i, palabras, avisos) {
  const donde = nombreBloque(i, bloque);
  if (!esObjeto(bloque)) return { tipo: 'error', error: t('rev.bloqueLlaves', { donde }) };

  const tipo = String(bloque.tipo ?? '').trim().toLowerCase();
  const fallo = mensaje => ({ tipo, error: `${donde}: ${mensaje}` });

  if (tipo === 'explicacion') {
    revisarCampos(bloque, CAMPOS.explicacion, donde, avisos);
    if (!traducible(bloque.texto) && !Array.isArray(bloque.texto)) return fallo(t('rev.faltaCampo', { campo: 'texto' }));
    return { tipo, titulo: bloque.titulo ?? null, texto: bloque.texto, tutora: bloque.tutora ?? null };
  }

  if (tipo === 'dialogo' || tipo === 'texto') {
    revisarCampos(bloque, CAMPOS.dialogo, donde, avisos);
    if (!Array.isArray(bloque.frases) || bloque.frases.length === 0) {
      return fallo(t('rev.faltaFrases'));
    }
    const frases = [];
    bloque.frases.forEach((f, j) => {
      const dondeFrase = t('rev.fraseN', { donde, n: j + 1 });
      if (!esObjeto(f) || !textoValido(f.es)) {
        avisos.push(t('rev.faltaEsOmite', { donde: dondeFrase }));
        return;
      }
      revisarCampos(f, CAMPOS.frase, dondeFrase, avisos);
      revisarTraduccion(f, dondeFrase, avisos);
      const notas = f.nota === undefined ? [] : [].concat(f.nota).filter(traducible);
      const analisis = revisarAnalisis(f, dondeFrase, avisos);
      frases.push({ ...f, trad: traduccionDe(f), notas, analisis });
    });
    return { tipo: 'dialogo', esTexto: tipo === 'texto', titulo: bloque.titulo ?? null, frases, tutora: bloque.tutora ?? null };
  }

  if (tipo === 'vocabulario') {
    revisarCampos(bloque, CAMPOS.vocabulario, donde, avisos);
    const lista = Array.isArray(bloque.palabras) ? bloque.palabras : [...palabras.keys()];
    const faltan = lista.filter(p => !palabras.has(normalizarPalabra(p)));
    if (faltan.length) {
      avisos.push(t('rev.palabrasFaltan', { donde, lista: faltan.join(', ') }));
    }
    return { tipo, titulo: bloque.titulo ?? null, palabras: lista.map(String), tutora: bloque.tutora ?? null };
  }

  if (tipo === 'tabla') {
    revisarCampos(bloque, CAMPOS.tabla, donde, avisos);
    if (!Array.isArray(bloque.filas) || !bloque.filas.length || !bloque.filas.every(Array.isArray)) {
      return fallo(t('rev.filas'));
    }
    // Las casillas pueden ser un texto o { "en": "…", "vi": "…" }.
    const casilla = c => (esObjeto(c) ? c : String(c ?? ''));
    const columnas = Array.isArray(bloque.columnas) ? bloque.columnas.map(casilla) : null;
    const ancho = Math.max(columnas?.length ?? 0, ...bloque.filas.map(f => f.length));
    if (bloque.filas.some(f => f.length !== ancho)) avisos.push(t('rev.filasDistintas', { donde }));
    return {
      tipo,
      titulo: bloque.titulo ?? null,
      columnas,
      filas: bloque.filas.map(f => f.map(casilla)),
      nota: traducible(bloque.nota) ? bloque.nota : null,
    };
  }

  if (tipo === 'imagen') {
    revisarCampos(bloque, CAMPOS.imagen, donde, avisos);
    if (!textoValido(bloque.archivo)) return fallo(t('rev.faltaArchivo'));
    if (!traducible(bloque.descripcion)) avisos.push(t('rev.faltaDescripcion', { donde }));
    return { tipo, archivo: bloque.archivo.trim(), descripcion: bloque.descripcion ?? '', pie: bloque.pie ?? null };
  }

  if (tipo === 'escribir') {
    revisarCampos(bloque, CAMPOS.escribir, donde, avisos);
    // Normalmente una lista en español; si la respuesta cambia según el idioma: { "en": [...], "vi": [...] }.
    const limpiar = r => [].concat(r ?? []).filter(textoValido);
    const respuestas = esObjeto(bloque.respuestas)
      ? Object.fromEntries(Object.entries(bloque.respuestas).map(([i, r]) => [i, limpiar(r)]))
      : limpiar(bloque.respuestas);
    const hay = Array.isArray(respuestas) ? respuestas.length : Object.values(respuestas).some(r => r.length);
    if (!hay) return fallo(t('rev.faltanRespuestas'));
    if (!traducible(bloque.pregunta)) return fallo(t('rev.faltaPregunta'));
    return marcarId(bloque, {
      tipo, pregunta: bloque.pregunta, frase: textoValido(bloque.frase) ? bloque.frase : '',
      respuestas, explicacion: bloque.explicacion ?? '', tutora: bloque.tutora ?? null,
    });
  }

  if (tipo === 'ordenar') {
    revisarCampos(bloque, CAMPOS.ordenar, donde, avisos);
    if (!textoValido(bloque.frase)) return fallo(t('rev.faltaFraseOrdenar'));
    const piezas = bloque.frase.trim().split(/\s+/);
    if (piezas.length < 2) return fallo(t('rev.dosPalabras'));
    return marcarId(bloque, {
      tipo, pregunta: traducible(bloque.pregunta) ? bloque.pregunta : '', frase: bloque.frase.trim(),
      traduccion: bloque.traduccion ?? '', explicacion: bloque.explicacion ?? '', tutora: bloque.tutora ?? null,
    });
  }

  if (TIPOS_OPCIONES.includes(tipo)) {
    revisarCampos(bloque, CAMPOS.ejercicio, donde, avisos);
    const ejercicio = revisarEjercicio(bloque, tipo, fallo, donde, avisos);
    return ejercicio.error ? ejercicio : marcarId(bloque, ejercicio);
  }

  return {
    tipo: 'error',
    error: t('rev.tipoNoExiste', { donde, tipo: bloque.tipo ?? '', posibles: `explicacion, dialogo, texto, vocabulario, tabla, imagen, ${TIPOS_EJERCICIO.join(', ')}` }),
  };
}

function marcarId(bloque, ejercicio) {
  // «audio»: texto en español que se escucha (ejercicios de comprensión oral).
  if (textoValido(bloque.audio)) ejercicio.audio = bloque.audio.trim();
  else if (bloque.audio === true && textoValido(bloque.frase)) {
    // En los huecos se oye la frase completa, con la respuesta correcta en su sitio.
    // Las pistas entre paréntesis, como «(our)», no se leen.
    const relleno = ejercicio.opciones?.find(o => o.correcta)?.texto ?? ' ';
    ejercicio.audio = bloque.frase.replace(/\s*\([^)]*\)/g, '').replace(/_{2,}/g, relleno).replace(/\s+/g, ' ').trim();
  }
  if (textoValido(bloque.id) || typeof bloque.id === 'number') ejercicio.idFijo = String(bloque.id);
  return ejercicio;
}

/**
 * Opciones, en una de estas formas:
 * - { "texto de la opción": "explicación" o { "en": "…", "vi": "…" }, … } con "correcta": "texto".
 * - Una lista sencilla: ["es", "está", …] con "correcta": "texto".
 * - Una lista de grupos, para opciones traducidas (p. ej. «¿qué significa?»):
 *   [{ "texto": { "en": "Hello", "vi": "Xin chào" }, "explicacion": …, "correcta": true }, …]
 */
function revisarEjercicio(bloque, tipo, fallo, donde, avisos) {
  let opciones;
  let correcta;
  if (Array.isArray(bloque.opciones) && bloque.opciones.some(esObjeto)) {
    opciones = bloque.opciones.filter(esObjeto).map(o => ({ texto: o.texto, explicacion: o.explicacion ?? '', marcada: o.correcta === true }));
    if (opciones.some(o => !traducible(o.texto))) return fallo(t('rev.opcionSinTexto'));
    const marcadas = opciones.filter(o => o.marcada);
    if (marcadas.length !== 1) return fallo(t('rev.unaCorrecta'));
    correcta = marcadas[0];
  } else {
    if (Array.isArray(bloque.opciones)) {
      opciones = bloque.opciones.map(o => ({ texto: String(o), explicacion: '' }));
    } else if (esObjeto(bloque.opciones)) {
      opciones = Object.entries(bloque.opciones).map(([texto, explicacion]) => ({
        texto,
        explicacion: traducible(explicacion) ? explicacion : '',
      }));
    } else {
      return fallo(t('rev.faltanOpciones'));
    }
    if (!textoValido(bloque.correcta)) return fallo(t('rev.faltaCorrecta'));
    const comparar = x => x.trim().toLocaleLowerCase('es');
    correcta = opciones.find(o => comparar(o.texto) === comparar(bloque.correcta));
    if (!correcta) {
      return fallo(t('rev.correctaNoCoincide', { correcta: bloque.correcta, opciones: opciones.map(o => o.texto).join(' / ') }));
    }
  }
  if (opciones.length < 2) return fallo(t('rev.dosOpciones'));

  if (tipo === 'test' && !traducible(bloque.pregunta)) return fallo(t('rev.faltaPregunta'));
  if (tipo === 'huecos') {
    if (!textoValido(bloque.frase)) return fallo(t('rev.faltaFraseHueco'));
    if (!/_{2,}/.test(bloque.frase)) avisos.push(t('rev.sinHueco', { donde }));
  }
  if (tipo === 'traduccion' && !traducible(bloque.pregunta) && !textoValido(bloque.frase)) {
    return fallo(t('rev.faltaPreguntaOFrase'));
  }

  return {
    tipo,
    pregunta: traducible(bloque.pregunta) ? bloque.pregunta : '',
    frase: textoValido(bloque.frase) ? bloque.frase : '',
    opciones: opciones.map(({ texto, explicacion }, i) => ({ texto, explicacion, correcta: opciones[i] === correcta })),
    tutora: bloque.tutora ?? null,
  };
}

// ---------------------------------------------------------------------------
// Otros archivos: capítulos y frases útiles
// ---------------------------------------------------------------------------

/** Lee un JSON opcional. Devuelve { json } , { noExiste } o { error }. */
async function leerJSON(archivo, nombre) {
  let texto;
  try {
    const respuesta = await fetch(conVersion(archivo), { cache: 'no-cache' });
    if (respuesta.status === 404) return { noExiste: true };
    if (!respuesta.ok) return { error: { titulo: t('rev.noCarga', { nombre }), detalles: [t('rev.codigoServidor', { codigo: respuesta.status })] } };
    texto = await respuesta.text();
  } catch {
    return { noExiste: true };
  }
  try {
    return { json: JSON.parse(texto.replace(/^﻿/, '')) };
  } catch (e) {
    return { error: explicarErrorDeFormato('', texto, e, t('rev.noCargaArchivo', { nombre, archivo })) };
  }
}

/**
 * lessons/capitulos.json: [{ "numero": 1, "titulo_es": "…", "titulo": { "en": "…", "vi": "…" }, "descripcion": { … } }]
 * Es opcional: sin él, las lecciones se agrupan solo por número de capítulo.
 */
export async function cargarCapitulos() {
  const r = await leerJSON(`${CARPETA}capitulos.json`, t('rev.nombreCapitulos'));
  if (r.noExiste) return { capitulos: [] };
  if (r.error) return { capitulos: [], error: r.error };
  const lista = Array.isArray(r.json) ? r.json : r.json?.capitulos;
  if (!Array.isArray(lista)) {
    return { capitulos: [], error: { titulo: t('rev.noCarga', { nombre: t('rev.nombreCapitulos') }), detalles: [t('rev.listaCorchetes')] } };
  }
  return { capitulos: lista.filter(esObjeto).map((c, i) => ({ ...c, numero: c.numero ?? i + 1 })) };
}

/**
 * phrases/frases.json: { "categorias": [{ "titulo", "descripcion", "frases": […] o "grupos": [{ "titulo", "tarea", "leccion", "frases": […] }] }] }
 */
export async function cargarFrases() {
  const r = await leerJSON('phrases/frases.json', t('rev.nombreFrases'));
  if (r.noExiste) return { categorias: [], avisos: [] };
  if (r.error) return { categorias: [], avisos: [], error: r.error };
  const avisos = [];
  const lista = Array.isArray(r.json?.categorias) ? r.json.categorias : [];
  if (!lista.length) avisos.push(t('rev.sinCategorias'));
  const revisarFrases = (lista, donde) => {
    const frases = [];
    (Array.isArray(lista) ? lista : []).forEach((f, j) => {
      const aqui = t('rev.fraseN', { donde, n: j + 1 });
      if (!esObjeto(f) || !textoValido(f.es)) {
        avisos.push(t('rev.faltaEs', { donde: aqui }));
        return;
      }
      revisarTraduccion(f, aqui, avisos);
      frases.push({ ...f, trad: traduccionDe(f), analisis: revisarAnalisis(f, aqui, avisos) });
    });
    return frases;
  };
  // Una categoría tiene «frases» o «grupos» (cada grupo: una tarea con sus frases).
  const categorias = lista.filter(esObjeto).map((c, i) => {
    const dondeCat = t('rev.categoria', { n: i + 1 });
    return {
      titulo: traducible(c.titulo) ? c.titulo : dondeCat,
      descripcion: traducible(c.descripcion) ? c.descripcion : '',
      frases: revisarFrases(c.frases, dondeCat),
      grupos: (Array.isArray(c.grupos) ? c.grupos : []).filter(esObjeto).map((g, k) => ({
        titulo: traducible(g.titulo) ? g.titulo : t('rev.grupo', { n: k + 1 }),
        tarea: traducible(g.tarea) ? g.tarea : '',
        leccion: textoValido(g.leccion) ? g.leccion : '',
        frases: revisarFrases(g.frases, `${dondeCat}, ${t('rev.grupo', { n: k + 1 })}`),
      })),
    };
  });
  return { categorias, avisos };
}
