// Descubre, carga y revisa las lecciones (lessons/001.json, 002.json, …).

const CARPETA = 'lessons/';
const HUECOS_PERMITIDOS = 3; // se para tras 3 archivos seguidos que no existen
const LOTE = 5;              // cuántos archivos se piden a la vez

export const TIPOS_EJERCICIO = ['test', 'traduccion', 'huecos', 'escribir', 'ordenar'];
const TIPOS_OPCIONES = ['test', 'traduccion', 'huecos'];

const CAMPOS = {
  leccion: ['capitulo', 'titulo_da', 'titulo_es', 'intro', 'palabras', 'bloques'],
  palabra: ['es', 'pron', 'consejo', 'ipa', 'cat', 'genero', 'plural', 'definida', 'nota', 'ejemplo'],
  explicacion: ['tipo', 'titulo', 'texto', 'tutora'],
  dialogo: ['tipo', 'titulo', 'frases', 'tutora'],
  frase: ['quien', 'da', 'es', 'literal', 'pron', 'nota', 'analisis', 'estructura'],
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
      return { id, archivo, error: errorSimple(id, `El servidor respondió con el código ${respuesta.status}.`) };
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
    if (fatal) return { id, archivo, error: { titulo: `No se ha podido cargar la lección ${id}.`, detalles: fatal } };
    return { id, archivo, leccion, avisos };
  } catch (e) {
    console.error(e);
    return { id, archivo, error: errorSimple(id, 'Hay algo en el archivo que la aplicación no entiende.') };
  }
}

function errorSimple(id, detalle) {
  return { titulo: `No se ha podido cargar la lección ${id}.`, detalles: [detalle] };
}

// ---------------------------------------------------------------------------
// Errores de formato JSON explicados para personas
// ---------------------------------------------------------------------------

function explicarErrorDeFormato(id, texto, error, titulo = `No se ha podido cargar la lección ${id}.`) {
  const detalles = ['El archivo contiene un error de formato (JSON).'];
  const posicion = posicionDelError(error.message, texto);

  if (posicion !== null) {
    const { linea, columna } = lineaYColumna(texto, posicion);
    const campo = ultimoCampoAntesDe(texto, posicion);
    let frase = `Revisa la línea ${linea} (carácter ${columna})`;
    if (campo) frase += `, cerca del campo «${campo}»`;
    detalles.push(frase + '.');
    const contenido = texto.split('\n')[linea - 1];
    if (contenido !== undefined) detalles.push({ codigo: contenido.trim().slice(0, 120) });
    const anterior = texto.slice(0, posicion).trimEnd().slice(-1);
    if (/["{[]/.test(texto[posicion] ?? '') && /["}\]0-9el]/.test(anterior)) {
      detalles.push('Parece que falta una coma al final de la línea anterior.');
    }
  }

  for (const pista of pistasHabituales(texto)) detalles.push(pista);

  if (/end of (JSON|data)|unexpected end|unterminated/i.test(error.message)) {
    detalles.push('Parece que el archivo termina antes de tiempo: puede faltar cerrar una llave } o un corchete ].');
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
    pistas.push(`En la línea ${comillasCurvas} hay comillas “curvas” (pasa al copiar de Word). Para abrir y cerrar textos hay que usar comillas rectas: "así".`);
  }

  const comaFinal = /,\s*[}\]]/.exec(texto);
  if (comaFinal) {
    const { linea } = lineaYColumna(texto, comaFinal.index);
    pistas.push(`En la línea ${linea} sobra una coma: no puede haber coma justo antes de } o ].`);
  }

  if (buscar(/^\s*\/\//)) {
    pistas.push(`En la línea ${buscar(/^\s*\/\//)} hay un comentario con //. El formato JSON no admite comentarios.`);
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

function revisarCampos(objeto, permitidos, donde, avisos) {
  for (const clave of Object.keys(objeto)) {
    if (!permitidos.includes(clave)) {
      avisos.push(`${donde}: el campo «${clave}» no se reconoce y se ignora. Campos posibles: ${permitidos.join(', ')}.`);
    }
  }
}

/** Ayuda a escribir «bloque 3 (test)». */
function nombreBloque(i, bloque) {
  const tipo = esObjeto(bloque) && bloque.tipo ? ` (${bloque.tipo})` : '';
  return `Bloque ${i + 1}${tipo}`;
}

export function revisarLeccion(id, json) {
  const avisos = [];

  if (!esObjeto(json)) {
    return { fatal: ['El archivo debe empezar con { y terminar con }.'] };
  }
  if (!Array.isArray(json.bloques) || json.bloques.length === 0) {
    return { fatal: ['Falta el campo «bloques» (la lista de bloques de la lección) o está vacío.'] };
  }

  revisarCampos(json, CAMPOS.leccion, 'Lección', avisos);
  if (!textoValido(json.titulo_da)) avisos.push('Falta el campo «titulo_da» (título en inglés).');
  if (!textoValido(json.titulo_es)) avisos.push('Falta el campo «titulo_es» (título en español).');

  const palabras = revisarPalabras(json.palabras, avisos);
  const bloques = json.bloques.map((bloque, i) => revisarBloque(bloque, i, palabras, avisos));

  // Identificadores de ejercicio: sirven para guardar el progreso.
  const usados = new Set();
  for (const b of bloques) {
    if (!TIPOS_EJERCICIO.includes(b.tipo) || b.error) continue;
    // Con «id» el progreso se conserva aunque se cambie el texto de la pregunta.
    let base = b.idFijo ? `id|${b.idFijo}` : `${b.tipo}|${b.pregunta}|${b.frase}`;
    let idEj = base;
    for (let n = 2; usados.has(idEj); n++) idEj = `${base}#${n}`;
    usados.add(idEj);
    b.id = idEj;
  }

  return {
    avisos,
    leccion: {
      id,
      titulo_da: textoValido(json.titulo_da) ? json.titulo_da.trim() : `Lección ${id}`,
      titulo_es: textoValido(json.titulo_es) ? json.titulo_es.trim() : '',
      capitulo: json.capitulo ?? null,
      intro: textoValido(json.intro) ? json.intro : null,
      palabras,
      bloques,
      idsEjercicios: bloques.filter(b => b.id).map(b => b.id),
    },
  };
}

/** Diccionario de la lección. Se admite "merci": "gracias" como forma corta. */
function revisarPalabras(palabras, avisos) {
  const mapa = new Map();
  if (palabras === undefined) return mapa;
  if (!esObjeto(palabras)) {
    avisos.push('El campo «palabras» debe ir entre llaves { } con una entrada por palabra.');
    return mapa;
  }
  for (const [clave, valor] of Object.entries(palabras)) {
    const donde = `Palabra «${clave}»`;
    let entrada;
    if (typeof valor === 'string') {
      entrada = { es: valor };
    } else if (esObjeto(valor)) {
      revisarCampos(valor, CAMPOS.palabra, donde, avisos);
      entrada = { ...valor };
    } else {
      avisos.push(`${donde}: debe ser un texto o un grupo { } con «es», «pron», etc.`);
      continue;
    }
    if (!textoValido(entrada.es)) avisos.push(`${donde}: falta «es» (el significado en español).`);
    mapa.set(normalizarPalabra(clave), { da: clave.trim(), ...entrada });
  }
  return mapa;
}

export function normalizarPalabra(texto) {
  return String(texto).trim().toLocaleLowerCase('en').replace(/\s+/g, ' ');
}

/**
 * Análisis sintáctico de una frase:
 * "analisis": [["Jeg", "sujeto"], ["har", "verbo"], …]
 * Devuelve [{ texto, funcion }] o null.
 */
export function revisarAnalisis(f, donde, avisos) {
  if (f.analisis === undefined) {
    avisos.push(`${donde}: falta el «analisis» (análisis sintáctico de la frase).`);
    return null;
  }
  if (!Array.isArray(f.analisis)) {
    avisos.push(`${donde}: el «analisis» debe ser una lista: [["Jeg", "sujeto"], ["har", "verbo"]].`);
    return null;
  }
  const partes = [];
  const frase = String(f.da).toLocaleLowerCase('en');
  f.analisis.forEach((parte, k) => {
    if (!Array.isArray(parte) || parte.length < 2 || !textoValido(parte[0]) || !textoValido(parte[1])) {
      avisos.push(`${donde}, análisis ${k + 1}: cada parte se escribe así: ["palabra", "función"].`);
      return;
    }
    if (!frase.includes(parte[0].toLocaleLowerCase('en').replace(/[?!.]+$/, ''))) {
      avisos.push(`${donde}, análisis ${k + 1}: «${parte[0]}» no aparece en la frase.`);
    }
    partes.push({ texto: parte[0], funcion: parte[1] });
  });
  return partes.length ? partes : null;
}

function revisarBloque(bloque, i, palabras, avisos) {
  const donde = nombreBloque(i, bloque);
  if (!esObjeto(bloque)) return { tipo: 'error', error: `${donde}: debe ir entre llaves { }.` };

  const tipo = String(bloque.tipo ?? '').trim().toLowerCase();
  const fallo = mensaje => ({ tipo, error: `${donde}: ${mensaje}` });

  if (tipo === 'explicacion') {
    revisarCampos(bloque, CAMPOS.explicacion, donde, avisos);
    if (!textoValido(bloque.texto) && !Array.isArray(bloque.texto)) return fallo('falta el campo «texto».');
    return { tipo, titulo: bloque.titulo ?? null, texto: bloque.texto, tutora: bloque.tutora ?? null };
  }

  if (tipo === 'dialogo' || tipo === 'texto') {
    revisarCampos(bloque, CAMPOS.dialogo, donde, avisos);
    if (!Array.isArray(bloque.frases) || bloque.frases.length === 0) {
      return fallo('falta la lista «frases».');
    }
    const frases = [];
    bloque.frases.forEach((f, j) => {
      const dondeFrase = `${donde}, frase ${j + 1}`;
      if (!esObjeto(f) || !textoValido(f.da)) {
        avisos.push(`${dondeFrase}: falta «da» (la frase en inglés). Se omite.`);
        return;
      }
      revisarCampos(f, CAMPOS.frase, dondeFrase, avisos);
      if (!textoValido(f.es)) avisos.push(`${dondeFrase}: falta «es» (la traducción).`);
      const notas = f.nota === undefined ? [] : [].concat(f.nota).filter(textoValido);
      const analisis = revisarAnalisis(f, dondeFrase, avisos);
      frases.push({ ...f, notas, analisis });
    });
    return { tipo: 'dialogo', esTexto: tipo === 'texto', titulo: bloque.titulo ?? null, frases, tutora: bloque.tutora ?? null };
  }

  if (tipo === 'vocabulario') {
    revisarCampos(bloque, CAMPOS.vocabulario, donde, avisos);
    const lista = Array.isArray(bloque.palabras) ? bloque.palabras : [...palabras.keys()];
    const faltan = lista.filter(p => !palabras.has(normalizarPalabra(p)));
    if (faltan.length) {
      avisos.push(`${donde}: estas palabras no están en «palabras»: ${faltan.join(', ')}.`);
    }
    return { tipo, titulo: bloque.titulo ?? null, palabras: lista.map(String), tutora: bloque.tutora ?? null };
  }

  if (tipo === 'tabla') {
    revisarCampos(bloque, CAMPOS.tabla, donde, avisos);
    if (!Array.isArray(bloque.filas) || !bloque.filas.length || !bloque.filas.every(Array.isArray)) {
      return fallo('la «filas» debe ser una lista de filas: [["jeg", "er"], ["du", "er"]].');
    }
    const columnas = Array.isArray(bloque.columnas) ? bloque.columnas.map(String) : null;
    const ancho = Math.max(columnas?.length ?? 0, ...bloque.filas.map(f => f.length));
    if (bloque.filas.some(f => f.length !== ancho)) avisos.push(`${donde}: no todas las filas tienen el mismo número de casillas.`);
    return {
      tipo,
      titulo: bloque.titulo ?? null,
      columnas,
      filas: bloque.filas.map(f => f.map(c => String(c ?? ''))),
      nota: textoValido(bloque.nota) ? bloque.nota : null,
    };
  }

  if (tipo === 'imagen') {
    revisarCampos(bloque, CAMPOS.imagen, donde, avisos);
    if (!textoValido(bloque.archivo)) return fallo('falta el «archivo» de la imagen (por ejemplo "assets/img/mapa.png").');
    if (!textoValido(bloque.descripcion)) avisos.push(`${donde}: falta la «descripcion» de la imagen (la leen quienes no pueden verla).`);
    return { tipo, archivo: bloque.archivo.trim(), descripcion: bloque.descripcion ?? '', pie: bloque.pie ?? null };
  }

  if (tipo === 'escribir') {
    revisarCampos(bloque, CAMPOS.escribir, donde, avisos);
    const respuestas = [].concat(bloque.respuestas ?? []).filter(textoValido);
    if (!respuestas.length) return fallo('faltan las «respuestas» correctas (una lista: ["Jeg hedder Ana"]).');
    if (!textoValido(bloque.pregunta)) return fallo('falta la «pregunta».');
    return marcarId(bloque, {
      tipo, pregunta: bloque.pregunta, frase: textoValido(bloque.frase) ? bloque.frase : '',
      respuestas, explicacion: bloque.explicacion ?? '', tutora: bloque.tutora ?? null,
    });
  }

  if (tipo === 'ordenar') {
    revisarCampos(bloque, CAMPOS.ordenar, donde, avisos);
    if (!textoValido(bloque.frase)) return fallo('falta la «frase» en inglés que hay que ordenar.');
    const piezas = bloque.frase.trim().split(/\s+/);
    if (piezas.length < 2) return fallo('la «frase» necesita al menos dos palabras.');
    return marcarId(bloque, {
      tipo, pregunta: textoValido(bloque.pregunta) ? bloque.pregunta : '', frase: bloque.frase.trim(),
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
    error: `${donde}: el tipo «${bloque.tipo ?? ''}» no existe. Tipos posibles: explicacion, dialogo, vocabulario, tabla, imagen, ${TIPOS_EJERCICIO.join(', ')}.`,
  };
}

function marcarId(bloque, ejercicio) {
  // «audio»: texto en inglés que se escucha (ejercicios de comprensión oral).
  if (textoValido(bloque.audio)) ejercicio.audio = bloque.audio.trim();
  else if (bloque.audio === true && textoValido(bloque.frase)) {
    // En los huecos se oye la frase completa, con la respuesta correcta en su sitio.
    // Las pistas entre paréntesis, como «(nuestra)», no se leen.
    const relleno = ejercicio.opciones?.find(o => o.correcta)?.texto ?? ' ';
    ejercicio.audio = bloque.frase.replace(/\s*\([^)]*\)/g, '').replace(/_{2,}/g, relleno).replace(/\s+/g, ' ').trim();
  }
  if (textoValido(bloque.id) || typeof bloque.id === 'number') ejercicio.idFijo = String(bloque.id);
  return ejercicio;
}

/**
 * Opciones en formato { "texto de la opción": "explicación", … }.
 * También se acepta una lista sencilla: ["er", "har", …].
 */
function revisarEjercicio(bloque, tipo, fallo, donde, avisos) {
  let opciones;
  if (Array.isArray(bloque.opciones)) {
    opciones = bloque.opciones.map(o => ({ texto: String(o), explicacion: '' }));
  } else if (esObjeto(bloque.opciones)) {
    opciones = Object.entries(bloque.opciones).map(([texto, explicacion]) => ({
      texto,
      explicacion: typeof explicacion === 'string' ? explicacion : '',
    }));
  } else {
    return fallo('faltan las «opciones».');
  }
  if (opciones.length < 2) return fallo('hacen falta al menos 2 opciones.');

  if (!textoValido(bloque.correcta)) return fallo('falta el campo «correcta» (el texto de la opción correcta).');
  const comparar = t => t.trim().toLocaleLowerCase('en');
  const correcta = opciones.find(o => comparar(o.texto) === comparar(bloque.correcta));
  if (!correcta) {
    return fallo(`la respuesta correcta «${bloque.correcta}» no coincide con ninguna opción (${opciones.map(o => o.texto).join(' / ')}).`);
  }

  if (tipo === 'test' && !textoValido(bloque.pregunta)) return fallo('falta la «pregunta».');
  if (tipo === 'huecos') {
    if (!textoValido(bloque.frase)) return fallo('falta la «frase» con el hueco (___).');
    if (!/_{2,}/.test(bloque.frase)) avisos.push(`${donde}: la frase no tiene hueco. Escríbelo con guiones bajos: ___`);
  }
  if (tipo === 'traduccion' && !textoValido(bloque.pregunta) && !textoValido(bloque.frase)) {
    return fallo('falta la «pregunta» o la «frase».');
  }

  return {
    tipo,
    pregunta: textoValido(bloque.pregunta) ? bloque.pregunta : '',
    frase: textoValido(bloque.frase) ? bloque.frase : '',
    opciones: opciones.map(o => ({ ...o, correcta: o === correcta })),
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
    if (!respuesta.ok) return { error: { titulo: `No se ha podido cargar ${nombre}.`, detalles: [`Código ${respuesta.status}.`] } };
    texto = await respuesta.text();
  } catch {
    return { noExiste: true };
  }
  try {
    return { json: JSON.parse(texto.replace(/^﻿/, '')) };
  } catch (e) {
    return { error: explicarErrorDeFormato('', texto, e, `No se ha podido cargar ${nombre} (${archivo}).`) };
  }
}

/**
 * lessons/capitulos.json: [{ "numero": 1, "titulo_da": "…", "titulo_es": "…", "descripcion": "…" }]
 * Es opcional: sin él, las lecciones se agrupan solo por número de capítulo.
 */
export async function cargarCapitulos() {
  const r = await leerJSON(`${CARPETA}capitulos.json`, 'la lista de capítulos');
  if (r.noExiste) return { capitulos: [] };
  if (r.error) return { capitulos: [], error: r.error };
  const lista = Array.isArray(r.json) ? r.json : r.json?.capitulos;
  if (!Array.isArray(lista)) {
    return { capitulos: [], error: { titulo: 'No se ha podido cargar la lista de capítulos.', detalles: ['El archivo debe ser una lista entre corchetes [ ].'] } };
  }
  return { capitulos: lista.filter(esObjeto).map((c, i) => ({ ...c, numero: c.numero ?? i + 1 })) };
}

/**
 * phrases/frases.json: { "categorias": [{ "titulo", "descripcion", "frases": […] o "grupos": [{ "titulo", "tarea", "leccion", "frases": […] }] }] }
 */
export async function cargarFrases() {
  const r = await leerJSON('phrases/frases.json', 'las frases útiles');
  if (r.noExiste) return { categorias: [], avisos: [] };
  if (r.error) return { categorias: [], avisos: [], error: r.error };
  const avisos = [];
  const lista = Array.isArray(r.json?.categorias) ? r.json.categorias : [];
  if (!lista.length) avisos.push('El archivo no tiene «categorias».');
  const revisarFrases = (lista, donde) => {
    const frases = [];
    (Array.isArray(lista) ? lista : []).forEach((f, j) => {
      const aqui = `${donde}, frase ${j + 1}`;
      if (!esObjeto(f) || !textoValido(f.da)) {
        avisos.push(`${aqui}: falta «da» (la frase en inglés).`);
        return;
      }
      if (!textoValido(f.es)) avisos.push(`${aqui}: falta «es» (la traducción).`);
      frases.push({ ...f, analisis: revisarAnalisis(f, aqui, avisos) });
    });
    return frases;
  };
  // Una categoría tiene «frases» o «grupos» (cada grupo: una tarea con sus frases).
  const categorias = lista.filter(esObjeto).map((c, i) => ({
    titulo: textoValido(c.titulo) ? c.titulo : `Categoría ${i + 1}`,
    descripcion: textoValido(c.descripcion) ? c.descripcion : '',
    frases: revisarFrases(c.frases, `Categoría ${i + 1}`),
    grupos: (Array.isArray(c.grupos) ? c.grupos : []).filter(esObjeto).map((g, k) => ({
      titulo: textoValido(g.titulo) ? g.titulo : `Grupo ${k + 1}`,
      tarea: textoValido(g.tarea) ? g.tarea : '',
      leccion: textoValido(g.leccion) ? g.leccion : '',
      frases: revisarFrases(g.frases, `Categoría ${i + 1}, grupo ${k + 1}`),
    })),
  }));
  return { categorias, avisos };
}
