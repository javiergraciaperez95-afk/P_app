// Carga, comprobación y preparación de las lecciones (lecciones/001.json, 002.json…).
// Nunca lanza errores hacia fuera: si algo está mal escrito, lo devuelve en
// "errores" (impide mostrar algo) o "avisos" (se puede mostrar, pero conviene arreglarlo).

import { nfc } from './util.js';
import { clave, segmentar } from './frases.js';
import { separarTono, esSilabaVietnamita, TONOS } from './pronunciacion.js';

const CARPETA = 'lecciones/';
const HUECOS_MAX = 3; // números seguidos que faltan antes de dejar de buscar

const CAMPOS = {
  explicacion: ['tipo', 'titulo', 'texto'],
  dialogo: ['tipo', 'titulo', 'frases'],
  vocabulario: ['tipo', 'titulo', 'palabras'],
  test: ['tipo', 'id', 'pregunta', 'opciones'],
  traducir: ['tipo', 'id', 'pregunta', 'frase', 'opciones'],
  hueco: ['tipo', 'id', 'pregunta', 'frase', 'es', 'opciones'],
  practica: ['tipo', 'titulo', 'texto', 'lineas'],
  escucha: ['tipo', 'id', 'pregunta', 'audio', 'opciones'],
};
const TIPOS = Object.keys(CAMPOS);
const CAMPOS_LECCION = ['titulo', 'tituloEs', 'palabras', 'pronunciacion', 'bloques'];
const CAMPOS_FRASE = ['quien', 'vi', 'es', 'analisis', 'nota'];

/**
 * Busca 001.json, 002.json… hasta que falten varios seguidos.
 * Las pide de 10 en 10 a la vez, para que con muchas lecciones arranque rápido.
 */
export async function descubrirLecciones() {
  const TANDA = 10;
  const lista = [];
  let faltan = 0;
  for (let inicio = 1; inicio <= 999 && faltan < HUECOS_MAX; inicio += TANDA) {
    const ids = [];
    for (let n = inicio; n < inicio + TANDA && n <= 999; n++) ids.push(String(n).padStart(3, '0'));
    const tanda = await Promise.all(ids.map(cargarLeccion));
    for (const lec of tanda) {
      if (faltan >= HUECOS_MAX) break;
      if (!lec) { faltan++; continue; }
      faltan = 0;
      lista.push(lec);
    }
  }
  return lista;
}

/** Devuelve la lección preparada, o null si el archivo no existe. */
export async function cargarLeccion(id) {
  let resp;
  try {
    resp = await fetch(`${CARPETA}${id}.json`, { cache: 'no-store' });
  } catch {
    return null;
  }
  if (resp.status === 404) return null;
  if (!resp.ok) {
    return roto(id, { donde: 'archivo', mensaje: `El servidor no dejó leer el archivo (código ${resp.status}).` });
  }

  const texto = nfc(await resp.text()).replace(/^﻿/, '');
  let crudo;
  try {
    crudo = JSON.parse(texto);
  } catch (e) {
    return roto(id, errorDeSintaxis(texto, e));
  }
  return validar(id, crudo);
}

function roto(id, error) {
  return { id, roto: true, titulo: `Lección ${id}`, tituloEs: '', bloques: [], errores: [error], avisos: [] };
}

// ---------- Errores de escritura del JSON (comas, comillas…) ----------

function errorDeSintaxis(texto, e) {
  const tecnico = String(e?.message || e);
  let linea = null;
  let col = null;
  let m;
  if ((m = /line (\d+) column (\d+)/i.exec(tecnico))) {
    linea = +m[1];
    col = +m[2];
  } else if ((m = /position (\d+)/i.exec(tecnico))) {
    const pos = +m[1];
    const antes = texto.slice(0, pos);
    linea = antes.split('\n').length;
    col = pos - antes.lastIndexOf('\n');
  }
  const lineas = texto.split('\n').map((l) => l.replace(/\t/g, ' ').replace(/\r$/, ''));
  return {
    donde: linea ? `línea ${linea}, columna ${col}` : 'en algún punto del archivo (probablemente al final)',
    mensaje: 'El archivo no se puede leer. Casi siempre es una coma que falta o que sobra (la última antes de } o ] no lleva coma), o unas comillas sin cerrar.',
    extracto: linea ? { linea, col, texto: lineas[linea - 1] ?? '', anterior: linea > 1 ? lineas[linea - 2] : null } : null,
    tecnico,
  };
}

// ---------- Comprobación del contenido ----------

const esObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const cadena = (v) => (typeof v === 'string' ? v.trim() : '');

function camposDesconocidos(obj, validos, donde, avisos) {
  for (const k of Object.keys(obj)) {
    if (!validos.includes(k)) {
      avisos.push({ donde, mensaje: `No conozco el campo "${k}" (¿está bien escrito?). Campos posibles: ${validos.join(', ')}.` });
    }
  }
}

function validar(id, crudo) {
  const errores = [];
  const avisos = [];
  if (!esObjeto(crudo)) {
    return roto(id, { donde: 'archivo', mensaje: 'La lección debe empezar por { y terminar por }.' });
  }
  camposDesconocidos(crudo, CAMPOS_LECCION, 'lección', avisos);

  const titulo = cadena(crudo.titulo);
  const tituloEs = cadena(crudo.tituloEs);
  if (!titulo) errores.push({ donde: '"titulo"', mensaje: 'Falta el título en vietnamita.' });
  if (!tituloEs) errores.push({ donde: '"tituloEs"', mensaje: 'Falta el título en español.' });

  const dic = leerPalabras(crudo.palabras, errores, avisos);
  leerPronunciacion(crudo.pronunciacion, dic, avisos);
  const sinDatos = new Set();

  let bloques = [];
  if (!Array.isArray(crudo.bloques) || crudo.bloques.length === 0) {
    errores.push({ donde: '"bloques"', mensaje: 'Falta la lista de bloques: "bloques": [ ... ].' });
  } else {
    bloques = crudo.bloques.map((b, i) => leerBloque(b, i + 1, { dic, sinDatos }, errores, avisos));
  }

  const ids = bloques.filter((b) => b.esEjercicio).map((b) => b.idEj);
  const repetidos = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  if (repetidos.length) {
    avisos.push({ donde: 'ejercicios', mensaje: `Hay ejercicios con el mismo "id" (${repetidos.join(', ')}): compartirían el progreso. Cambia uno.` });
  }

  if (sinDatos.size) {
    avisos.push({
      donde: '"palabras"',
      mensaje: `Estas palabras salen en frases pero no están en "palabras" (no tendrán globo con traducción): ${[...sinDatos].join(', ')}.`,
    });
  }

  return { id, roto: false, titulo: titulo || `Lección ${id}`, tituloEs, dic, bloques, errores, avisos };
}

function leerPalabras(obj, errores, avisos) {
  const dic = new Map();
  if (obj == null) return dic;
  if (!esObjeto(obj)) {
    errores.push({ donde: '"palabras"', mensaje: 'Debe ir entre llaves: { "palabra": "traducción | pronunciación" }.' });
    return dic;
  }
  for (const [vi, valor] of Object.entries(obj)) {
    const donde = `"palabras" → «${vi}»`;
    if (typeof valor !== 'string') {
      errores.push({ donde, mensaje: 'El valor va entre comillas: "traducción | pronunciación | nota".' });
      continue;
    }
    const [es = '', pron = '', nota = ''] = valor.split('|').map((s) => s.trim());
    if (!es) { errores.push({ donde, mensaje: 'Falta la traducción.' }); continue; }
    if (!pron) avisos.push({ donde, mensaje: 'Sin pronunciación (va después de |).' });
    else comprobarFlechas(vi, pron, donde, avisos);
    dic.set(clave(vi), { vi: vi.trim(), es, pron, nota });
  }
  return dic;
}

// Flecha que corresponde a cada tono en la pronunciación aproximada
const FLECHA_TONO = { ngang: '', huyen: '↘', sac: '↗', hoi: '↘↗', nga: '~↗', nang: '↓' };

/** Avisa si las flechas de la pronunciación no coinciden con los tonos reales de la palabra. */
function comprobarFlechas(vi, pron, donde, avisos) {
  const silabas = vi.trim().split(/\s+/);
  const trozos = pron.trim().split(/\s+/);
  if (silabas.length !== trozos.length) return; // no se puede comparar sílaba a sílaba
  if (!silabas.every(esSilabaVietnamita)) return; // p. ej. un nombre extranjero
  const fallos = [];
  silabas.forEach((s, i) => {
    const { tono } = separarTono(s);
    const flecha = (/(~↗|↘↗|↘|↗|↓)$/.exec(trozos[i]) || [''])[0];
    if (flecha !== FLECHA_TONO[tono]) {
      fallos.push(`«${s}» tiene tono ${TONOS[tono].nombre}${FLECHA_TONO[tono] ? ` (${FLECHA_TONO[tono]})` : ' (sin flecha)'} y pone «${trozos[i]}»`);
    }
  });
  if (fallos.length) avisos.push({ donde, mensaje: `La flecha del tono no coincide: ${fallos.join('; ')}.` });
}

/**
 * Opcional: explicación del sonido escrita a mano, para las palabras en que la automática
 * no convenza. { "khỏe": "kh como una j suave; oe como «ue»" }
 */
function leerPronunciacion(obj, dic, avisos) {
  if (obj == null) return;
  if (!esObjeto(obj)) {
    avisos.push({ donde: '"pronunciacion"', mensaje: 'Debe ir entre llaves: { "palabra": "cómo suena" }.' });
    return;
  }
  for (const [vi, texto] of Object.entries(obj)) {
    const e = dic.get(clave(vi));
    if (!e) { avisos.push({ donde: `"pronunciacion" → «${vi}»`, mensaje: 'Esa palabra no está en "palabras".' }); continue; }
    if (typeof texto === 'string' && texto.trim()) e.fonetica = texto.trim();
  }
}

function leerBloque(b, n, ctx, errores, avisos) {
  const lugar = `bloque ${n}`;
  const fallos = [];
  const h = {
    n,
    ctx,
    mal: (donde, mensaje) => fallos.push({ donde: donde ? `${lugar}, ${donde}` : lugar, mensaje, bloque: n }),
    aviso: (donde, mensaje) => avisos.push({ donde: donde ? `${lugar}, ${donde}` : lugar, mensaje }),
  };

  let datos = {};
  if (!esObjeto(b)) {
    h.mal('', 'Cada bloque va entre llaves { }.');
  } else if (!TIPOS.includes(b.tipo)) {
    h.mal('"tipo"', b.tipo
      ? `No conozco el tipo «${b.tipo}». Tipos posibles: ${TIPOS.join(', ')}.`
      : `Falta "tipo". Tipos posibles: ${TIPOS.join(', ')}.`);
  } else {
    camposDesconocidos(b, CAMPOS[b.tipo], `${lugar} (${b.tipo})`, avisos);
    datos = LECTORES[b.tipo](b, h);
  }

  if (fallos.length) {
    errores.push(...fallos);
    return { tipo: 'error', n, errores: fallos };
  }
  return { ...datos, tipo: b.tipo, n };
}

const LECTORES = {
  explicacion(b, h) {
    const lista = Array.isArray(b.texto) ? b.texto : [b.texto];
    const parrafos = lista.map(cadena).filter(Boolean);
    if (!parrafos.length) h.mal('"texto"', 'Falta el texto de la explicación.');
    return { titulo: cadena(b.titulo), parrafos };
  },

  dialogo(b, h) {
    if (!Array.isArray(b.frases) || !b.frases.length) {
      h.mal('"frases"', 'Falta la lista de frases: "frases": [ ... ].');
      return {};
    }
    const frases = b.frases.map((f, i) => leerFrase(f, `frase ${i + 1}`, h)).filter(Boolean);
    return { titulo: cadena(b.titulo), frases };
  },

  vocabulario(b, h) {
    let entradas;
    if (b.palabras == null) {
      entradas = [...h.ctx.dic.values()];
    } else if (!Array.isArray(b.palabras)) {
      h.mal('"palabras"', 'Debe ser una lista: ["palabra 1", "palabra 2"].');
      return {};
    } else {
      entradas = b.palabras.map((p) => {
        const e = h.ctx.dic.get(clave(String(p)));
        if (!e) h.aviso('"palabras"', `«${p}» no está en "palabras" de la lección, así que no se muestra.`);
        return e;
      }).filter(Boolean);
    }
    if (!entradas.length) h.mal('', 'El vocabulario está vacío.');
    return { titulo: cadena(b.titulo), entradas };
  },

  test(b, h) {
    const pregunta = cadena(b.pregunta);
    if (!pregunta) h.mal('"pregunta"', 'Falta la pregunta.');
    return { pregunta, opciones: leerOpciones(b.opciones, h), ...ejercicio(b, h) };
  },

  traducir(b, h) {
    const vi = cadena(b.frase);
    if (!vi) h.mal('"frase"', 'Falta la frase en vietnamita que hay que traducir.');
    return {
      pregunta: cadena(b.pregunta) || '¿Qué significa esta frase?',
      frase: { vi, segmentos: analizar(vi, h) },
      opciones: leerOpciones(b.opciones, h),
      ...ejercicio(b, h),
    };
  },

  hueco(b, h) {
    const vi = cadena(b.frase);
    if (!vi) h.mal('"frase"', 'Falta la frase con el hueco.');
    else if ((vi.match(/_{2,}/g) || []).length !== 1) h.mal('"frase"', 'La frase debe tener un único hueco, escrito así: ___');
    return {
      pregunta: cadena(b.pregunta) || 'Elige la palabra que falta.',
      frase: { vi, es: cadena(b.es), segmentos: analizar(vi, h) },
      opciones: leerOpciones(b.opciones, h),
      ...ejercicio(b, h),
    };
  },
};

/**
 * Práctica de pronunciación: filas de sílabas o palabras para pulsar y oír.
 * "lineas": ["ba bá bà", "hai mươi mốt=21 · ba mươi=30"]
 * Se separan por espacios; si una fila lleva «·», se separa por «·» (para palabras de varias sílabas).
 * «palabra=traducción» añade la traducción.
 */
LECTORES.practica = function (b, h) {
  if (!Array.isArray(b.lineas) || !b.lineas.length) {
    h.mal('"lineas"', 'Falta la lista de filas: "lineas": ["ba bá bà", "ma má mà"].');
    return {};
  }
  const lineas = b.lineas.map((l, i) => {
    if (typeof l !== 'string' || !l.trim()) { h.mal(`fila ${i + 1}`, 'Cada fila va entre comillas y no puede estar vacía.'); return []; }
    const trozos = l.includes('·') ? l.split('·') : l.trim().split(/\s+/);
    return trozos.map((t) => t.trim()).filter(Boolean).map((t) => {
      const [vi, es = ''] = t.split('=').map((s) => s.trim());
      return { vi, es };
    });
  }).filter((l) => l.length);
  return { titulo: cadena(b.titulo), texto: cadena(b.texto), lineas };
};

/** Ejercicio de escucha: suena "audio" (con la voz del navegador) y se elige lo que se ha oído. */
LECTORES.escucha = function (b, h) {
  const audio = cadena(b.audio);
  if (!audio) h.mal('"audio"', 'Falta lo que tiene que sonar ("audio": "bá").');
  return {
    pregunta: cadena(b.pregunta) || 'Escucha y elige lo que oyes.',
    audio,
    opciones: leerOpciones(b.opciones, h),
    ...ejercicio(b, h),
  };
};

function ejercicio(b, h) {
  return { esEjercicio: true, idEj: b.id != null && b.id !== '' ? String(b.id) : `b${h.n}` };
}

function leerFrase(f, donde, h) {
  if (!esObjeto(f)) {
    h.mal(donde, 'Cada frase va entre llaves: { "vi": "...", "es": "..." }.');
    return null;
  }
  for (const k of Object.keys(f)) {
    if (!CAMPOS_FRASE.includes(k)) h.aviso(donde, `No conozco el campo "${k}". Campos posibles: ${CAMPOS_FRASE.join(', ')}.`);
  }
  const vi = cadena(f.vi);
  const es = cadena(f.es);
  if (!vi) h.mal(`${donde}, "vi"`, 'Falta la frase en vietnamita.');
  if (!es) h.mal(`${donde}, "es"`, 'Falta la traducción.');
  if (!vi) return null;
  return {
    quien: cadena(f.quien), vi, es, nota: cadena(f.nota),
    segmentos: analizar(vi, h),
    analisis: leerAnalisis(f.analisis, donde, h),
  };
}

// Análisis sintáctico: "Em: sujeto · chào: verbo · chị: complemento (a quién)"
// Cada trozo separado por · es «palabra(s): función».
function leerAnalisis(valor, donde, h) {
  const texto = cadena(valor);
  if (!texto) {
    h.aviso(donde, 'Falta el análisis sintáctico ("analisis": "Em: sujeto · chào: verbo · chị: complemento").');
    return [];
  }
  return texto.split('·').map((s) => s.trim()).filter(Boolean).map((trozo) => {
    const corte = trozo.indexOf(':');
    if (corte < 0) {
      h.aviso(`${donde}, "analisis"`, `«${trozo}» no tiene función. Escríbelo así: «palabra: función».`);
      return { palabra: trozo, funcion: '', clase: 'otro' };
    }
    const funcion = trozo.slice(corte + 1).trim();
    return { palabra: trozo.slice(0, corte).trim(), funcion, clase: claseFuncion(funcion) };
  });
}

/** Color según la función: sujeto, verbo, complemento u otro (partículas, adverbios…). */
function claseFuncion(funcion) {
  const f = funcion.toLowerCase();
  if (/^(sujeto|tema)/.test(f)) return 'sujeto';
  if (/^(verbo|predicado)/.test(f)) return 'verbo';
  if (/^(complemento|atributo|objeto)/.test(f)) return 'complemento';
  return 'otro';
}

function analizar(vi, h) {
  const segs = segmentar(vi, h.ctx.dic);
  for (const s of segs) {
    if (s.tipo === 'palabra' && !s.entrada && !/^\p{N}+$/u.test(s.texto)) h.ctx.sinDatos.add(s.texto);
  }
  return segs;
}

function leerOpciones(lista, h) {
  if (!Array.isArray(lista) || lista.length < 2) {
    h.mal('"opciones"', 'Hacen falta al menos 2 opciones: ["*la buena | por qué", "otra | por qué no"].');
    return [];
  }
  const ops = lista.map((o, i) => {
    const donde = `opción ${i + 1}`;
    if (typeof o !== 'string') { h.mal(donde, 'Cada opción va entre comillas.'); return null; }
    let s = o.trim();
    const ok = s.startsWith('*');
    if (ok) s = s.slice(1).trim();
    const corte = s.indexOf('|');
    const texto = (corte >= 0 ? s.slice(0, corte) : s).trim();
    const por = corte >= 0 ? s.slice(corte + 1).trim() : '';
    if (!texto) h.mal(donde, 'La opción está vacía.');
    if (!por) h.aviso(donde, `«${texto}» no tiene explicación (lo que va después de |).`);
    return { texto, por, ok };
  }).filter(Boolean);

  const buenas = ops.filter((o) => o.ok).length;
  if (buenas === 0) h.mal('"opciones"', 'Ninguna opción está marcada como buena. Pon un * delante: "*Xin chào | ...".');
  if (buenas > 1) h.mal('"opciones"', 'Hay más de una opción con *. Solo puede haber una buena.');
  return ops;
}
