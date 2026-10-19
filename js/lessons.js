// Descubre, carga y revisa las lecciones (lessons/001.json, 002.json, …).
// El español va en «es»; las traducciones, en «en» (inglés) y «vi» (vietnamita).
// Los demás textos (explicaciones, notas, preguntas…) pueden ser un texto o { "en": "…", "vi": "…" }.

import { t, idioma } from './i18n.js';
import { curso, ruta } from './curso.js';
import { LANG } from './curso.js';
import { hayVoz } from './sonidos.js';

const CARPETA = ruta('lessons/');
const HUECOS_PERMITIDOS = 3; // se para tras 3 archivos seguidos que no existen
const LOTE = 20;             // cuántos archivos se piden a la vez

export const TIPOS_EJERCICIO = ['test', 'traduccion', 'huecos', 'escribir', 'ordenar'];
const TIPOS_OPCIONES = ['test', 'traduccion', 'huecos'];

/** Idiomas en los que puede estar traducido el contenido de una lección. */
const IDIOMAS_CONTENIDO = ['en', 'vi', 'zh', 'es', 'pt', 'fr', 'ja', 'it', 'ko', 'ru', 'de', 'id'];

const CAMPOS = {
  leccion: ['capitulo', 'numero_curso', 'orden_curso', 'titulo_es', 'titulo', 'intro', 'palabras', 'bloques'],
  palabra: ['en', 'vi', 'zh', 'es', 'pt', 'fr', 'ja', 'it', 'ko', 'ru', 'de', 'id', 'tes', 'definida', 'femenino', 'pron', 'consejo', 'ipa', 'cat', 'genero', 'plural', 'nota', 'ejemplo', 'oculta'],
  explicacion: ['tipo', 'titulo', 'texto', 'tutora'],
  gramatica: ['tipo', 'titulo', 'texto', 'ejemplos', 'tutora'],
  dialogo: ['tipo', 'titulo', 'frases', 'tutora', 'esTexto'],
  frase: ['quien', 'es', 'trad', 'en', 'vi', 'zh', 'ko', 'ja', 'ru', 'de', 'fr', 'it', 'pt', 'id', 'tes', 'literal', 'pron', 'nota', 'analisis', 'estructura', 'parrafo'],
  vocabulario: ['tipo', 'titulo', 'palabras', 'tutora'],
  tabla: ['tipo', 'titulo', 'columnas', 'filas', 'nota', 'tutora'],
  imagen: ['tipo', 'archivo', 'descripcion', 'pie', 'tutora'],
  ejercicio: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'opciones', 'correcta', 'tutora', 'traduccion'],
  escribir: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'respuestas', 'explicacion', 'autoevaluacion', 'tutora', 'traduccion'],
  ordenar: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'traduccion', 'explicacion', 'tutora'],
  huecos: ['tipo', 'id', 'audio', 'pregunta', 'frase', 'opciones', 'correcta', 'tutora', 'traduccion'],
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
    // Si falla toda la tanda, probablemente no hay conexión. No conviertas esos fallos
    // en huecos: eso hacía que tres respuestas de red fallidas ocultaran el resto del curso.
    if (lote.every(resultado => resultado.noExiste && resultado.sinConexion)) {
      sinConexion = true;
      break;
    }
    for (const resultado of lote) {
      if (huecosSeguidos >= HUECOS_PERMITIDOS) break;
      if (resultado.noExiste) {
        if (resultado.sinConexion) {
          sinConexion = true;
          huecosSeguidos = 0;
          encontradas.push({ ...resultado, noExiste: false, error: errorSimple(resultado.id, t('app.sinConexionTexto')) });
        } else {
          huecosSeguidos += 1;
        }
      } else {
        huecosSeguidos = 0;
        encontradas.push(resultado);
      }
    }
  }
  // Se conserva el aviso incluso si se cargó parte del curso: así la lista puede
  // mostrar lo disponible y ofrecer recargar para recuperar las lecciones pendientes.
  if (sinConexion) encontradas.sinConexion = true;
  return encontradas;
}

/**
 * El índice del curso (indice/lecciones.json, lo genera _herramientas/generar_indices.mjs): lo que pinta la
 * lista sin descargar cada lección. Devuelve resultados como los de descubrirLecciones(), pero sin bloques
 * ni palabras (la lección completa se carga al abrirla, con cargarLeccion), o null si el curso no tiene índice.
 */
export async function cargarIndice() {
  let indice;
  try {
    const respuesta = await fetch(conVersion(ruta('indice/lecciones.json')), { cache: 'no-cache' });
    if (!respuesta.ok) return null;
    indice = leerContenido(await respuesta.text());
  } catch {
    return null;
  }
  if (!Array.isArray(indice?.lecciones)) return null;
  return Promise.all(indice.lecciones.map(async e => {
    // Las que no cargan se piden enteras: así la lista enseña el error con su detalle.
    if (e.error) return cargarLeccion(e.id);
    return {
      id: e.id,
      archivo: `${CARPETA}${e.id}.json`,
      avisos: [],
      nAvisos: e.avisos ?? 0,
      audio: e.audio ?? 0,
      leccion: {
        id: e.id,
        titulo_es: e.titulo_es,
        titulo: e.titulo,
        capitulo: e.capitulo,
        orden_curso: e.orden_curso,
        numero_curso: e.numero_curso,
        // Igual que en revisarLeccion: sin voz en el dispositivo, los ejercicios solo de oído no cuentan.
        get idsEjercicios() {
          const voz = hayVoz();
          const lista = e.ejerciciosPorIdioma?.[idiomaDeEntorno()] ?? e.ejercicios;
          return lista.filter(([, soloOido]) => voz || !soloOido).map(([id]) => id);
        },
      },
    };
  }));
}

/** Todas las palabras del curso (indice/diccionario.json): Map de palabra normalizada → ficha. null si no hay. */
export async function cargarDiccionario() {
  try {
    const respuesta = await fetch(conVersion(ruta('indice/diccionario.json')), { cache: 'no-cache' });
    if (!respuesta.ok) return null;
    return new Map(Object.entries(leerContenido(await respuesta.text())));
  } catch {
    return null;
  }
}

/**
 * Los cursos de otros idiomas se explican en español y en inglés: donde el texto cambia, el archivo lleva
 * { "@es": "…", "@en": "…" } (ver _herramientas/juntar_es_en.py). Al cargar se queda el del idioma de la
 * interfaz, así el resto del programa sigue viendo textos normales. (Al cambiar de idioma la página se recarga.)
 */
export function elegirIdiomaContenido(dato) {
  const clave = idioma() === 'es' ? '@es' : '@en';
  const andar = d => {
    if (Array.isArray(d)) return d.map(andar);
    if (!esObjeto(d)) return d;
    if ('@es' in d && '@en' in d) return d[clave];
    for (const k in d) d[k] = andar(d[k]);
    return d;
  };
  return andar(dato);
}
const leerContenido = texto => elegirIdiomaContenido(JSON.parse(texto.replace(/^﻿/, '')));

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
    json = leerContenido(texto);
  } catch (e) {
    return { id, archivo, error: explicarErrorDeFormato(id, texto, e) };
  }

  try {
    // Esquema v2: estructura en este archivo y textos en traducciones/<idioma>/<id>.json.
    // Se convierte a la forma antigua para que el resto del programa no cambie.
    // Las «flexibles» son lecciones antiguas pasadas a catálogos sin rehacer sus bloques.
    if (json && json.esquema === 2) json = json.flexible ? await adaptarFlexible(json, id) : await adaptarV2(json, id);
    else json = adaptar(json);
  } catch (e) {
    console.error(e);
    return { id, archivo, error: errorSimple(id, t('rev.noEntiende')) };
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
// De cómo está escrito en los archivos a cómo lo usa el programa
// ---------------------------------------------------------------------------

/**
 * El programa nació para el curso de español, y por dentro llama «es» al texto del idioma que se estudia.
 * En los demás cursos los archivos llevan ese texto bajo el código de su idioma («fr», «de»…) y la traducción
 * española bajo «es». Aquí se pasa a la forma interna: idioma → «es», traducción española → «tes».
 * En «palabras» y «opciones» las claves son palabras del idioma, no nombres de campo, y no se tocan.
 */
function adaptar(json) {
  const c = curso.campo;
  if (c === 'es') return json;
  const CAMBIO = { [c]: 'es', es: 'tes', [`titulo_${c}`]: 'titulo_es', titulo_es: 'titulo' };
  const andar = (o, dentroDe) => {
    if (Array.isArray(o)) return o.map(x => andar(x, dentroDe));
    if (!esObjeto(o)) return o;
    const literales = dentroDe === 'palabras' || dentroDe === 'opciones';
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [literales ? k : (CAMBIO[k] ?? k), andar(v, literales ? '' : k)]));
  };
  return andar(json, '');
}

// ---------------------------------------------------------------------------
// Lecciones de esquema v2 (ver _herramientas/ESQUEMA_V2.txt)
// El archivo de la lección lleva SOLO la estructura (ni una frase de texto).
// Todo el texto, incluido el del idioma que se estudia, está en
// traducciones/<idioma>/<id>.json: 12 carpetas iguales, ninguna privilegiada.
// ---------------------------------------------------------------------------

/** Idioma de los textos que rodean la lección (los mismos que usa tr()). */
function idiomaDeEntorno() {
  return idioma() === curso.campo ? 'en' : idioma();
}

/** Idioma de las frases que se estudian: siempre el del curso. */
const idiomaDelCurso = () => curso.campo;

const catalogos = new Map();

/** Lee un archivo de traducciones. Devuelve {} si no existe. */
async function leerCatalogo(id, clave) {
  const nombre = `${clave}/${id}`;
  if (catalogos.has(nombre)) return catalogos.get(nombre);
  const archivo = ruta(`traducciones/${clave}/${id}.json`);
  let datos = {};
  try {
    const respuesta = await fetch(conVersion(archivo), { cache: 'no-cache' });
    if (respuesta.ok) datos = JSON.parse((await respuesta.text()).replace(/^﻿/, ''));
  } catch {
    datos = {};
  }
  catalogos.set(nombre, datos);
  return datos;
}

/**
 * Texto traducible en la forma que entiende tr(): { idioma: texto }.
 * Se juntan los dos catálogos y manda el primero. La misma función sirve para las
 * explicaciones (idioma de entorno) y para lo que se estudia (idioma del curso).
 */
function textoTraducible(claveTexto, primero, segundo) {
  const salida = {};
  // Primero el catálogo de respaldo (inglés) y después el del alumno, que manda.
  for (const fuente of [segundo, primero]) {
    const v = fuente?.[claveTexto];
    // El código del idioma se toma de la fuente donde aparece el texto.
    if (typeof v === 'string' && v.trim()) salida[fuente.idioma] = v;
  }
  return salida;
}

/**
 * Lecciones v2 «flexibles» (ver _herramientas/ESQUEMA_V2.txt, punto 9): la forma antigua, con
 * cada texto cambiado por una referencia a los catálogos.
 *   {"$t": clave}        texto de ayuda → { en, <idioma del alumno> }
 *   {"$f": clave, …}     frase que se estudia → se le añaden el texto del curso y sus traducciones
 *   {"$e": clave}        texto en el idioma del curso (la frase de un hueco o de ordenar)
 *   ["texto", {"$t"…}]   análisis: la etiqueta también es texto de ayuda
 *   cat                  código del catálogo cerrado → nombre en el idioma del alumno
 * Devuelve la lección en la forma antigua, que el resto del programa ya entiende.
 */
async function adaptarFlexible(json, id) {
  const entorno = idiomaDeEntorno();
  const delCurso = idiomaDelCurso();
  const ingles = await leerCatalogo(id, 'en');
  const propio = entorno === 'en' ? {} : await leerCatalogo(id, entorno);
  const estudio = await leerCatalogo(id, delCurso);
  const etiquetas = { ...(await leerCatalogo('_etiquetas', 'en')), ...(await leerCatalogo('_etiquetas', entorno)) };

  const ayuda = clave => {
    const salida = {};
    if (textoValido(ingles[clave])) salida.en = ingles[clave];
    if (textoValido(propio[clave])) salida[entorno] = propio[clave];
    return salida;
  };
  const andar = (o, dentroDe) => {
    if (Array.isArray(o)) return o.map(x => andar(x, dentroDe));
    if (!esObjeto(o)) return o;
    if (typeof o.$t === 'string' && Object.keys(o).length === 1) return ayuda(o.$t);
    if (typeof o.$e === 'string' && Object.keys(o).length === 1) return estudio[o.$e] ?? '';
    const salida = {};
    for (const [k, v] of Object.entries(o)) {
      if (k === '$f') continue;
      // En «palabras» y «opciones» las claves son palabras del curso: se dejan tal cual.
      const literales = dentroDe === 'palabras' || dentroDe === 'opciones';
      salida[k] = k === 'cat' && typeof v === 'string' && !literales ? (etiquetas[`cat.${v}`] ?? v) : andar(v, literales ? '' : k);
    }
    if (typeof o.$f === 'string') {
      Object.assign(salida, ayuda(o.$f));
      if (textoValido(estudio[o.$f])) salida[delCurso] = estudio[o.$f];
    }
    return salida;
  };
  const leccion = andar(json, '');
  delete leccion.esquema;
  delete leccion.flexible;
  delete leccion.id;
  if (textoValido(estudio.titulo)) leccion[`titulo_${delCurso}`] = estudio.titulo;
  return adaptar(leccion);
}

async function adaptarV2(json, id) {
  const entorno = idiomaDeEntorno();
  const delCurso = idiomaDelCurso();

  // Catálogo de la lección en el idioma del alumno (con el inglés detrás).
  const propio = await leerCatalogo(id, entorno);
  // En el curso de inglés el catálogo «en» es el texto que se estudia: no sirve de respaldo para las explicaciones.
  const ingles = entorno === 'en' || delCurso === 'en' ? {} : await leerCatalogo(id, 'en');
  const textos = { ...ingles, ...propio, idioma: entorno };
  /** Para lo que se estudia: se lee primero en el idioma del curso. */
  const estudio = delCurso === entorno ? textos : { ...(await leerCatalogo(id, delCurso)), idioma: delCurso };

  // Nombres de categorías y funciones: los del alumno, con los del inglés detrás.
  const etiquetas = { ...(await leerCatalogo('_etiquetas', 'en')), ...(await leerCatalogo('_etiquetas', entorno)) };
  const etq = (grupo, codigo) => etiquetas[`${grupo}.${codigo}`] ?? codigo;

  /**
   * Texto de ayuda: idioma del alumno, con el inglés detrás. El inglés se añade
   * SIEMPRE, aunque haya traducción: el revisor de la app exige una traducción «en».
   */
  const T = (claveTexto, original = '') => {
    const salida = {};
    for (const fuente of [ingles, textos]) {
      const v = fuente?.[claveTexto];
      if (typeof v === 'string' && v.trim()) salida[fuente.idioma === entorno ? entorno : 'en'] = v;
    }
    if (!Object.keys(salida).length) {
      const v = textos?.[claveTexto];
      if (typeof v === 'string' && v.trim()) salida[entorno] = v;
    }
    return Object.keys(salida).length ? salida : { es: original };
  };
  /** Texto de ayuda que puede no existir (títulos de bloque, enunciados): null si falta. */
  const OPCIONAL = claveTexto => {
    const salida = textoTraducible(claveTexto, textos, ingles);
    return Object.keys(salida).length ? salida : null;
  };
  /**
   * Texto plano en el idioma del curso, sacado SOLO de su catálogo. Si falta se queda
   * vacío y el revisor avisa: nunca se pone la traducción del alumno en su lugar.
   */
  const CURSO = claveTexto => {
    const v = estudio[claveTexto];
    return typeof v === 'string' ? v.trim() : '';
  };
  /**
   * Traducción para el alumno. El revisor exige que haya SIEMPRE una traducción «en»,
   * así que el inglés se incluye aunque el alumno lea en otro idioma. «es» es el
   * nombre interno del idioma que se estudia, así que la traducción al español va en «tes».
   */
  const TRAD = claveTexto => {
    const salida = {};
    for (const fuente of [ingles, textos]) {
      const v = fuente?.[claveTexto];
      if (typeof v !== 'string' || !v.trim()) continue;
      const codigo = fuente.idioma === 'es' && delCurso !== 'es' ? 'tes' : fuente.idioma;
      salida[codigo] = v;
    }
    return Object.keys(salida).length ? salida : null;
  };
  /**
   * Frase que se estudia. El revisor de la app exige el texto del curso en el campo
   * «es», que es el nombre interno del idioma que se estudia, y la traducción para el
   * alumno en los campos de idioma que entiende traduccionDe() (en, vi, zh… y «tes»).
   */
  const ESTUDIO = claveTexto => ({ ...TRAD(claveTexto), es: CURSO(claveTexto) });

  /** El análisis sintáctico v2 (unidades anidadas) a la lista plana que pinta la app. */
  const aplanar = (unidades, salida = []) => {
    for (const u of unidades ?? []) {
      salida.push([u.texto, etq('sintaxis', u.funcion)]);
      if (u.partes) aplanar(u.partes, salida);
    }
    return salida;
  };

  const palabras = {};
  for (const [palabra, e] of Object.entries(json.palabras ?? {})) {
    // Los nombres propios no llevan ficha: no se subrayan ni se guardan.
    if (!e || e.propio) continue;
    // La ficha se escribe en la forma que espera revisarPalabras(): el significado
    // bajo el código de cada idioma, más los campos de la palabra.
    const significado = T(`p.${palabra}.glosa`);
    // En los cursos de otros idiomas, «es» es la palabra que se estudia: el significado en español va en «tes».
    if (delCurso !== 'es' && significado.es !== undefined) { significado.tes = significado.es; delete significado.es; }
    const ficha = { ...significado, pron: e.pron, cat: etq('cat', e.cat), consejo: T(`p.${palabra}.consejo`) };
    if (e.genero) ficha.genero = e.genero;
    if (e.ejemplo) ficha.ejemplo = e.ejemplo;
    palabras[palabra] = ficha;
  }

  const bloques = (json.bloques ?? []).map(b => {
    const titulo = OPCIONAL(`${b.id}.titulo`) ?? undefined;
    if (b.tipo === 'explicacion' || b.tipo === 'gramatica') {
      const bloque = { tipo: b.tipo, titulo, texto: T(`${b.id}.texto`) };
      if (b.tipo === 'gramatica') {
        bloque.ejemplos = (b.ejemplos ?? []).map((e, n) => ({
          ...ESTUDIO(`${b.id}.e${n}.texto`),
          trad: TRAD(`${b.id}.e${n}.texto`),
          analisis: aplanar(e.sintaxis?.unidades),
        }));
      }
      return bloque;
    }
    if (b.tipo === 'dialogo') {
      return {
        tipo: 'dialogo',
        titulo,
        frases: (b.frases ?? []).map((f, n) => ({
          quien: f.quien,
          // El revisor exige el texto del curso bajo «es»; la traducción para el
          // alumno va en «trad», que es lo que pinta la vista.
          ...ESTUDIO(`${b.id}.f${n}.texto`),
          trad: TRAD(`${b.id}.f${n}.texto`),
          analisis: aplanar(f.sintaxis?.unidades),
          nota: [],
        })),
      };
    }
    if (b.tipo === 'texto') {
      return {
        tipo: 'texto',
        esTexto: true,
        titulo,
        // Por frases, cada una con su análisis y su párrafo (0 o 1). Las lecturas
        // antiguas, con «parrafos», llegan como un párrafo entero por frase.
        frases: Array.isArray(b.frases)
          ? b.frases.map((f, n) => ({
            ...ESTUDIO(`${b.id}.f${n}.texto`),
            trad: TRAD(`${b.id}.f${n}.texto`),
            analisis: aplanar(f.sintaxis?.unidades),
            parrafo: f.parrafo === 1 ? 1 : 0,
            nota: [],
          }))
          : (b.parrafos ?? []).map((p, n) => ({
            ...ESTUDIO(`${b.id}.p${n}`),
            trad: TRAD(`${b.id}.p${n}`),
            nota: [],
          })),
      };
    }
    if (b.tipo === 'vocabulario') return { tipo: 'vocabulario', palabras: b.palabras ?? [] };
    if (b.tipo === 'test' || b.tipo === 'huecos') {
      const bloque = {
        tipo: b.tipo,
        opciones: (b.opciones ?? []).map((o, n) => ({
          // El texto de la opción se estudia (es español) y se traduce para el alumno.
          texto: CURSO(`${b.id}.o${n}`),
          explicacion: T(`${b.id}.o${n}.refuerzo`),
          correcta: o.correcta === true,
        })),
      };
      const pregunta = OPCIONAL(`${b.id}.pregunta`);
      if (pregunta) bloque.pregunta = pregunta;
      if (b.tipo === 'huecos') {
        // La frase del hueco se pinta bajo la pregunta con su traducción.
        bloque.frase = CURSO(`${b.id}.frase`);
        bloque.traduccion = OPCIONAL(`${b.id}.frase`) ?? '';
      }
      return bloque;
    }
    if (b.tipo === 'ordenar') {
      return {
        tipo: 'ordenar',
        frase: CURSO(`${b.id}.frase`),
        traduccion: OPCIONAL(`${b.id}.traduccion`) ?? '',
      };
    }
    if (b.tipo === 'escribir') {
      return { tipo: 'escribir', pregunta: OPCIONAL(`${b.id}.pregunta`), respuestas: b.respuestas ?? [] };
    }
    return { tipo: b.tipo };
  });

  return {
    capitulo: json.capitulo,
    // Posición y número visibles en el curso (el id del archivo no cambia: guarda el progreso).
    numero_curso: json.numero_curso,
    orden_curso: json.orden_curso,
    // «titulo_es» es el título en el idioma que se estudia: lo pide el revisor.
    titulo_es: CURSO('titulo'),
    titulo: T('titulo'),
    intro: T('intro'),
    palabras,
    bloques,
  };
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

/** Traducción de una frase o palabra: los idiomas que haya. Devuelve null si no hay ninguna. */
function traduccionDe(objeto) {
  const trad = {};
  for (const i of IDIOMAS_CONTENIDO) if (traducible(objeto[i])) trad[i] = objeto[i];
  if (traducible(objeto.tes)) trad.es = objeto.tes; // la traducción al español, en los cursos de otros idiomas
  return Object.keys(trad).length ? trad : null;
}

/** Avisa si falta la traducción al inglés. El vietnamita del contenido es opcional. */
function revisarTraduccion(objeto, donde, avisos) {
  // Vale cualquier traducción para el alumno (inglés, español, vietnamita…), no solo la inglesa.
  if (!traduccionDe(objeto) && !traducible(objeto.en) && !traducible(objeto.tes)) avisos.push(t('rev.faltaTraduccion', { donde, campos: '«en»' }));
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
      orden_curso: Number.isFinite(json.orden_curso) ? json.orden_curso : Number(id),
      // El ID interno conserva rutas y progreso; numero_curso permite reordenar cursos sin romperlos.
      numero_curso: Number.isInteger(json.numero_curso) && json.numero_curso > 0 ? json.numero_curso : Number(id),
      intro: traducible(json.intro) ? json.intro : null,
      palabras,
      bloques,
      // Los ejercicios que cuentan: sin voz en el dispositivo, los que solo son de oído no existen.
      get idsEjercicios() {
        const voz = hayVoz();
        return bloques.filter(b => b.id && (voz || !b.soloOido)).map(b => b.id);
      },
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
  return String(texto).trim().toLocaleLowerCase(LANG).replace(/\s+/g, ' ');
}

/**
 * Análisis sintáctico de una frase:
 * "analisis": [["Yo", { "en": "subject (I)", "vi": "chủ ngữ (tôi)" }], ["tengo", "verb"], …]
 * Devuelve [{ texto, funcion }] o null.
 */
export function revisarAnalisis(f, donde, avisos) {
  // El análisis es opcional: hay frases sueltas (sílabas para escuchar, listas) que no lo necesitan.
  if (f.analisis === undefined) return null;
  if (!Array.isArray(f.analisis)) {
    avisos.push(t('rev.analisisLista', { donde }));
    return null;
  }
  const partes = [];
  // Se compara sin signos ni comillas: el análisis escribe «detrás del mostrador levanta» aunque la frase lleve coma.
  const soloPalabras = s => String(s).toLocaleLowerCase(LANG).replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
  const frase = ` ${soloPalabras(f.es)} `;
  // Un constituyente puede ir partido o desordenado («"Buenos días", contesta él con una sonrisa» → PRED «contesta
  // Buenos días con una sonrisa»): basta con que cada palabra suya esté en la frase.
  const cuenta = new Map();
  for (const w of soloPalabras(f.es).split(' ')) cuenta.set(w, (cuenta.get(w) ?? 0) + 1);
  const cabe = texto => {
    const quedan = new Map(cuenta);
    return soloPalabras(texto).split(' ').every(w => { const n = quedan.get(w) ?? 0; quedan.set(w, n - 1); return n > 0; });
  };
  f.analisis.forEach((parte, k) => {
    const aqui = t('rev.analisisN', { donde, n: k + 1 });
    if (!Array.isArray(parte) || parte.length < 2 || !textoValido(parte[0]) || !traducible(parte[1])) {
      avisos.push(t('rev.analisisParte', { donde: aqui }));
      return;
    }
    if (!frase.includes(` ${soloPalabras(parte[0])} `) && !cabe(parte[0])) {
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

  if (tipo === 'gramatica') {
    revisarCampos(bloque, CAMPOS.gramatica, donde, avisos);
    if (!traducible(bloque.texto)) return fallo(t('rev.faltaCampo', { campo: 'texto' }));
    const ejemplos = (Array.isArray(bloque.ejemplos) ? bloque.ejemplos : [])
      .filter(esObjeto)
      .map(e => ({ ...e, trad: traduccionDe(e), notas: [], analisis: revisarAnalisis(e, donde, avisos) }));
    return { tipo, titulo: bloque.titulo ?? null, texto: bloque.texto, ejemplos, tutora: bloque.tutora ?? null };
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
      if (tipo === 'dialogo') revisarTraduccion(f, dondeFrase, avisos);
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
      respuestas, explicacion: bloque.explicacion ?? '', autoevaluacion: bloque.autoevaluacion === true,
      tutora: bloque.tutora ?? null,
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

/** Para comparar lo que se oye con una respuesta: sin mayúsculas, signos ni espacios de más. */
const soloLetras = texto => String(texto ?? '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function marcarId(bloque, ejercicio) {
  // «audio»: texto en el idioma del curso que se escucha (ejercicios de comprensión oral).
  if (textoValido(bloque.audio)) {
    ejercicio.audio = bloque.audio.trim();
    // Sin voz en el dispositivo, el texto se enseña escrito y el ejercicio pasa a ser de lectura.
    // Pero si lo que se oye es justo la respuesta (un dictado, ordenar la frase, «elige lo que oyes»),
    // escrito no tiene sentido: ese ejercicio solo existe cuando hay voz.
    const oido = soloLetras(ejercicio.audio);
    const buena = soloLetras(ejercicio.opciones?.find(o => o.correcta)?.texto);
    if (['escribir', 'ordenar'].includes(ejercicio.tipo) || buena === oido) ejercicio.soloOido = true;
    else if (buena && ejercicio.frase && oido.includes(buena)) ejercicio.audioRevela = true;
  } else if (bloque.audio === true && textoValido(bloque.frase)) {
    // En los huecos se oye la frase completa, con la respuesta correcta en su sitio.
    // Las pistas entre paréntesis, como «(our)», no se leen.
    const relleno = ejercicio.opciones?.find(o => o.correcta)?.texto ?? ' ';
    ejercicio.audio = bloque.frase.replace(/\s*\([^)]*\)/g, '').replace(/_{2,}/g, relleno).replace(/\s+/g, ' ').trim();
    ejercicio.audioRevela = true; // lo que se oye es la solución: sin voz no se puede enseñar escrito
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
    const comparar = x => x.trim().toLocaleLowerCase(LANG);
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
    return { json: adaptar(leerContenido(texto)) };
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
  return {
    capitulos: lista.filter(esObjeto).map((c, i) => ({
      ...c,
      titulo: c.titulo ?? c[`titulo_${curso.campo}`] ?? null,
      numero: c.numero ?? i + 1,
    })),
  };
}


/**
 * phrases/frases.json: { "categorias": [{ "titulo", "descripcion", "frases": […] o "grupos": [{ "titulo", "tarea", "leccion", "frases": […] }] }] }
 */
export async function cargarFrases() {
  const r = await leerJSON(ruta('phrases/frases.json'), t('rev.nombreFrases'));
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
