// Validador del esquema v2 de lecciones (ver _herramientas/ESQUEMA_V2.txt).
// Uso:
//   node _herramientas/validar_v2.mjs                  todas las lecciones v2 de todos los cursos
//   node _herramientas/validar_v2.mjs es               solo un curso
//   node _herramientas/validar_v2.mjs es 001 002       solo unas lecciones
//   node _herramientas/validar_v2.mjs es 001 -v        con el detalle de cada error
//   node _herramientas/validar_v2.mjs es 001 --claves  imprime las claves de cada catálogo
// Sale con código 1 si hay algún error. Sin excepciones.
//
// MODELO
//   lessons/001.json                  SOLO estructura: esquema, id, capítulo, nivel,
//                                     pron/cat/genero de las palabras, orden de bloques,
//                                     sintaxis, respuestas, ids. NI UNA FRASE.
//   traducciones/<idioma>/001.json    Todo el texto, en cada uno de los 12 idiomas.
//
//   Claves DE ESTUDIO (la frase en ese idioma):
//       bN.fM.texto, bN.eM.texto, bN.pM, bN.oM, bN.frase
//     Se escriben en los 12 idiomas. En el del curso van tal cual; en los demás, traducidas.
//
//   Claves y textos DE AYUDA (la explicación para el alumno):
//       titulo, intro, bN.titulo, bN.texto, bN.pregunta, bN.traduccion,
//       bN.oM.refuerzo, p.<palabra>.glosa, p.<palabra>.consejo
//     Se escriben en los 12 idiomas y cada uno va en su idioma.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'Idiomas');
const IDIOMAS = ['en', 'es', 'vi', 'zh', 'pt', 'fr', 'ja', 'it', 'ko', 'ru', 'de', 'id'];

const CAT = ['sust', 'adj', 'verb', 'adv', 'pron', 'prep', 'conj', 'art', 'num', 'interj', 'expr', 'frase', 'propio'];
const FUNCION = [
  'SUJ', 'PRED', 'VOC', 'INTERJ', 'NEG', 'CONJ',
  'V', 'CD', 'CI', 'ATRIB', 'CPVO', 'CRV', 'CAG',
  'CCL', 'CCT', 'CCM', 'CCF', 'CCC', 'CCA', 'CCINSTR', 'CCCOMP',
  'N', 'DET', 'ADY', 'CN', 'APOS', 'PREP', 'TERM', 'ADV', 'PRON', 'CUANT', 'INF', 'GER', 'PART', 'AUX',
];
const ORDEN = ['explicacion', 'dialogo', 'vocabulario', 'gramatica', 'texto'];
const EJERCICIOS = ['test', 'huecos', 'ordenar', 'escribir'];

const SOSPECHOSAS = /\b(partido|elecci|gobiern|president|politic|polític|religi|iglesia|guerra|ej[eé]rcito|diputad|senad|alcald|frontera|inmigra|racis|sexis|homof|dictadur|dios)\w*/i;

const args = process.argv.slice(2);
const detalle = args.includes('-v');
const soloClaves = args.includes('--claves');
const pedidos = args.filter(a => !a.startsWith('-'));
const cursoPedido = pedidos[0] ?? null;
const leccionesPedidas = pedidos.slice(1);

const errores = [];
const avisos = [];
const error = (donde, texto) => errores.push(`${donde}: ${texto}`);
const aviso = (donde, texto) => avisos.push(`${donde}: ${texto}`);

const soloPalabras = t => String(t ?? '')
  .toLowerCase()
  .replace(/[«»"'“”‘’]/g, '')
  .replace(/[.,;:¿?¡!()—–-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// ---------------------------------------------------------------------------
// Claves de cada catálogo
// ---------------------------------------------------------------------------
const esDeEstudio = k =>
  /^b\d+\.f\d+\.texto$/.test(k) ||
  /^b\d+\.e\d+\.texto$/.test(k) ||
  /^b\d+\.p\d+$/.test(k) ||
  /^b\d+\.o\d+$/.test(k) ||
  /^b\d+\.frase$/.test(k);

/** Claves de estudio que genera esta lección. */
function clavesDeEstudio(j) {
  const claves = new Set();
  for (const b of j.bloques ?? []) {
    if (b.tipo === 'dialogo') for (const [n] of (b.frases ?? []).entries()) claves.add(`${b.id}.f${n}.texto`);
    if (b.tipo === 'gramatica') for (const [n] of (b.ejemplos ?? []).entries()) claves.add(`${b.id}.e${n}.texto`);
    // La lectura va por frases (con análisis), cada una marcada con su «parrafo».
    // Las lecciones antiguas con «parrafos»: [0, 1] siguen valiendo hasta que se rehagan.
    if (b.tipo === 'texto' && Array.isArray(b.frases)) for (const [n] of b.frases.entries()) claves.add(`${b.id}.f${n}.texto`);
    else if (b.tipo === 'texto') for (const [n] of (b.parrafos ?? []).entries()) claves.add(`${b.id}.p${n}`);
    if (b.tipo === 'test' || b.tipo === 'huecos') for (const [n] of (b.opciones ?? []).entries()) claves.add(`${b.id}.o${n}`);
    if (b.tipo === 'huecos' || b.tipo === 'ordenar') claves.add(`${b.id}.frase`);
  }
  return [...claves].sort();
}

/** Claves de ayuda que genera esta lección (se leen del catálogo del alumno). */
function clavesDeAyuda(j) {
  const claves = new Set(['titulo', 'intro']);
  for (const b of j.bloques ?? []) {
    claves.add(`${b.id}.titulo`);
    if (b.tipo === 'explicacion' || b.tipo === 'gramatica') claves.add(`${b.id}.texto`);
    if (['test', 'huecos', 'escribir'].includes(b.tipo)) claves.add(`${b.id}.pregunta`);
    if (b.tipo === 'ordenar') claves.add(`${b.id}.traduccion`);
    if (b.tipo === 'test' || b.tipo === 'huecos') {
      for (const [n] of (b.opciones ?? []).entries()) claves.add(`${b.id}.o${n}.refuerzo`);
    }
  }
  for (const [palabra, e] of Object.entries(j.palabras ?? {})) {
    if (e?.propio) continue;
    claves.add(`p.${palabra}.glosa`);
    claves.add(`p.${palabra}.consejo`);
  }
  return [...claves].sort();
}

// ---------------------------------------------------------------------------
// Regla 3: análisis sintáctico
// ---------------------------------------------------------------------------
function revisarSintaxis(s, frase, donde) {
  if (!s || typeof s !== 'object') return error(donde, 'falta «sintaxis»');
  if (!['bimembre', 'unimembre'].includes(s.oracion)) return error(donde, `«oracion» debe ser bimembre o unimembre (es ${JSON.stringify(s.oracion)})`);
  if (!Array.isArray(s.unidades) || !s.unidades.length) return error(donde, '«sintaxis.unidades» vacío');
  if (!String(frase ?? '').trim()) return error(donde, 'no hay texto en el catálogo del curso para comprobar la sintaxis');

  const union = s.unidades.map(u => u.texto).join(' ');
  if (soloPalabras(union) !== soloPalabras(frase)) {
    return error(donde, `las unidades de nivel 1 no reconstruyen la frase\n      frase : «${soloPalabras(frase)}»\n      unión : «${soloPalabras(union)}»`);
  }

  const funciones = s.unidades.map(u => u.funcion);
  if (s.oracion === 'bimembre') {
    if (!['expreso', 'omitido'].includes(s.sujeto)) error(donde, 'falta «sujeto»: expreso u omitido');
    const sujs = funciones.filter(f => f === 'SUJ').length;
    const preds = funciones.filter(f => f === 'PRED').length;
    if (s.sujeto === 'expreso' && sujs !== 1) error(donde, `sujeto expreso pero hay ${sujs} unidades SUJ`);
    if (s.sujeto === 'omitido' && sujs !== 0) error(donde, 'sujeto omitido pero hay una unidad SUJ');
    if (preds !== 1) error(donde, `debe haber exactamente una unidad PRED (hay ${preds})`);
    for (const [i, f] of funciones.entries()) {
      if (!['SUJ', 'PRED'].includes(f)) error(donde, `unidad ${i + 1}: en una oración bimembre el nivel 1 solo admite SUJ o PRED (es ${f})`);
    }
  } else {
    for (const [i, f] of funciones.entries()) {
      if (['SUJ', 'PRED'].includes(f)) error(donde, `unidad ${i + 1}: una oración unimembre no lleva ${f}`);
    }
  }

  const andar = (unidades, ruta) => {
    for (const [i, u] of (unidades ?? []).entries()) {
      const aqui = `${ruta}[${i}]`;
      if (!u || typeof u !== 'object') { error(donde, `${aqui}: unidad mal formada`); continue; }
      if (!FUNCION.includes(u.funcion)) error(donde, `${aqui}: función «${u.funcion}» no está en el catálogo`);
      if (typeof u.texto !== 'string' || !u.texto.trim()) error(donde, `${aqui}: falta «texto»`);
      if (u.nucleo !== undefined && !soloPalabras(u.texto).includes(soloPalabras(u.nucleo))) {
        error(donde, `${aqui}: el núcleo «${u.nucleo}» no aparece en «${u.texto}»`);
      }
      if (u.partes !== undefined) {
        if (!Array.isArray(u.partes) || !u.partes.length) { error(donde, `${aqui}: «partes» vacío`); continue; }
        const un = u.partes.map(p => p.texto).join(' ');
        if (soloPalabras(un) !== soloPalabras(u.texto)) {
          error(donde, `${aqui}: las partes no reconstruyen «${u.texto}»\n        partes: «${soloPalabras(un)}»`);
        }
        andar(u.partes, `${aqui}.`);
      }
    }
  };
  andar(s.unidades, '');
}

// ---------------------------------------------------------------------------
// Revisión de una lección
// ---------------------------------------------------------------------------
/**
 * Lecciones flexibles (punto 9 de ESQUEMA_V2.txt): solo se comprueba que cada referencia tenga
 * su texto y que los catálogos no traigan claves sueltas. Los bloques son los de siempre.
 */
function revisarFlexible(curso, id, j, catalogoCurso) {
  const donde = `${curso}/${id} (flexible)`;
  if (j.id !== id) error(donde, `«id» debe ser "${id}"`);
  const leer = idioma => {
    const r = join(RAIZ, 'cursos', curso, 'traducciones', idioma, `${id}.json`);
    try { return existsSync(r) ? JSON.parse(readFileSync(r, 'utf8').replace(/^﻿/, '')) : null; } catch { error(donde, `traducciones/${idioma} no es JSON válido`); return null; }
  };
  const en = leer('en') ?? {};
  const usadas = new Set(['idioma', 'leccion', 'titulo']);
  const andar = o => {
    if (Array.isArray(o)) return o.forEach(andar);
    if (!o || typeof o !== 'object') return;
    if (typeof o.$t === 'string') { usadas.add(o.$t); if (!en[o.$t]?.trim()) error(donde, `falta «${o.$t}» en traducciones/en`); }
    if (typeof o.$e === 'string') { usadas.add(o.$e); if (!catalogoCurso[o.$e]?.trim()) error(donde, `falta «${o.$e}» en traducciones/${curso}`); }
    if (typeof o.$f === 'string') { usadas.add(o.$f); if (!en[o.$f]?.trim() && !catalogoCurso[o.$f]?.trim()) error(donde, `«${o.$f}» no tiene texto`); }
    Object.values(o).forEach(andar);
  };
  andar(j);
  if (!catalogoCurso.titulo?.trim()) error(donde, `falta «titulo» en traducciones/${curso}`);
  for (const idioma of IDIOMAS) {
    const c = leer(idioma);
    if (!c) continue;
    for (const k of Object.keys(c)) if (!usadas.has(k)) error(donde, `traducciones/${idioma}: clave suelta «${k}»`);
    for (const [k, v] of Object.entries(c)) if (typeof v === 'string' && v.includes('\\n')) aviso(donde, `traducciones/${idioma} «${k}» lleva un \\n escrito`);
  }
}

function revisarLeccion(curso, id, capitulos, catalogoCurso) {
  const donde = `${curso}/${id}`;
  const ruta = join(RAIZ, 'cursos', curso, 'lessons', `${id}.json`);
  if (!existsSync(ruta)) return error(donde, 'no existe');
  let j;
  try { j = JSON.parse(readFileSync(ruta, 'utf8').replace(/^\uFEFF/, '')); }
  catch (e) { return error(donde, `JSON no válido: ${e.message}`); }

  if (j.esquema !== 2) return error(donde, `«esquema» debe ser 2 (es ${JSON.stringify(j.esquema)})`);
  if (j.flexible) return revisarFlexible(curso, id, j, catalogoCurso);
  if (j.id !== id) error(donde, `«id» debe ser "${id}"`);
  if (!['A1', 'A2', 'B1', 'B2'].includes(j.nivel)) error(donde, `«nivel» debe ser A1, A2, B1 o B2 (es ${JSON.stringify(j.nivel)})`);

  const cap = capitulos.get(String(j.capitulo));
  if (!cap) error(donde, `el capítulo ${j.capitulo} no está en capitulos.json`);
  else {
    if (!cap.nombre) error(donde, `el capítulo ${j.capitulo} no tiene «nombre»`);
    if (cap.nivel !== j.nivel) error(donde, `nivel de la lección ${j.nivel} distinto del capítulo ${cap.nivel}`);
  }

  // ---- el archivo de la lección no lleva texto ----
  for (const campo of ['titulo', 'intro']) {
    if (j[campo] !== undefined) error(donde, `«${campo}» no puede estar aquí: el texto va en traducciones/<idioma>/`);
  }
  for (const b of j.bloques ?? []) {
    for (const campo of ['titulo', 'texto', 'pregunta', 'frase', 'traduccion']) {
      if (typeof b[campo] === 'string') error(donde, `${b.id}: «${campo}» no puede estar aquí: el texto va en traducciones/<idioma>/`);
    }
    for (const f of b.frases ?? []) if (f.texto !== undefined) error(donde, `${b.id}: la frase lleva «texto»`);
    for (const e of b.ejemplos ?? []) if (e.texto !== undefined) error(donde, `${b.id}: el ejemplo lleva «texto»`);
    for (const o of b.opciones ?? []) {
      if (typeof o.texto === 'string') error(donde, `${b.id}: la opción lleva «texto»`);
      for (const campo of ['refuerzo', 'explicacion']) {
        if (o[campo] !== undefined) error(donde, `${b.id}: la opción lleva «${campo}»: va en ${b.id}.oN.refuerzo de las traducciones`);
      }
    }
    if ((b.parrafos ?? []).some(x => typeof x === 'string')) error(donde, `${b.id}: los párrafos no llevan texto`);
  }
  for (const [palabra, e] of Object.entries(j.palabras ?? {})) {
    for (const campo of ['consejo', 'ejemplo']) {
      if (e?.[campo] !== undefined) error(donde, `«${palabra}»: «${campo}» va en p.${palabra}.${campo} de las traducciones`);
    }
  }

  // ---- regla 5: estructura ----
  const tipos = (j.bloques ?? []).map(b => b.tipo);
  for (const [i, esperado] of ORDEN.entries()) {
    if (tipos[i] !== esperado) error(donde, `el bloque ${i + 1} debe ser «${esperado}» (es «${tipos[i]}»)`);
  }
  for (const t of tipos.slice(ORDEN.length)) {
    if (!EJERCICIOS.includes(t)) error(donde, `bloque «${t}» fuera de sitio o desconocido`);
  }
  for (const t of ORDEN) {
    const n = tipos.filter(x => x === t).length;
    if (n !== 1) error(donde, `debe haber exactamente un bloque «${t}» (hay ${n})`);
  }
  const idsBloque = new Set();
  for (const b of j.bloques ?? []) {
    if (!b.id) error(donde, 'un bloque no tiene «id»');
    else if (idsBloque.has(b.id)) error(donde, `«id» de bloque repetido: ${b.id}`);
    else idsBloque.add(b.id);
  }

  // ---- reglas 1 y 2 (parte del archivo base) ----
  for (const [palabra, e] of Object.entries(j.palabras ?? {})) {
    if (!e || typeof e !== 'object') { error(donde, `la palabra «${palabra}» no es un objeto`); continue; }
    if (e.propio === true) continue;
    if (!String(e.pron ?? '').trim()) error(donde, `«${palabra}»: falta «pron»`);
    if (!CAT.includes(e.cat)) error(donde, `«${palabra}»: «cat» desconocida «${e.cat}»`);
    if (e.cat === 'sust' && !['m', 'f', 'm/f', 'f/m'].includes(e.genero)) error(donde, `«${palabra}»: sustantivo sin «genero»`);
  }

  // ---- regla 3: sintaxis ----
  let frases = 0;
  for (const b of j.bloques ?? []) {
    if (b.tipo === 'dialogo') {
      for (const [n, f] of (b.frases ?? []).entries()) {
        frases++;
        if (!f.quien) error(donde, `${b.id}.f${n}: falta «quien»`);
        revisarSintaxis(f.sintaxis, catalogoCurso[`${b.id}.f${n}.texto`] ?? '', `${donde} ${b.id}.f${n}`);
      }
    }
    if (b.tipo === 'gramatica') {
      for (const [n, e] of (b.ejemplos ?? []).entries()) {
        frases++;
        revisarSintaxis(e.sintaxis, catalogoCurso[`${b.id}.e${n}.texto`] ?? '', `${donde} ${b.id}.e${n}`);
      }
    }
    if (b.tipo === 'texto') {
      if (b.registro !== 'literario') error(donde, `${b.id}: «registro» debe ser "literario"`);
      if (Array.isArray(b.frases)) {
        if (b.parrafos !== undefined) error(donde, `${b.id}: lleva «frases» y «parrafos» a la vez: sobra «parrafos»`);
        // 2 párrafos (0 y 1), en orden, de 3 a 5 frases cada uno.
        const marcas = b.frases.map(f => f.parrafo);
        if (marcas.some(m => m !== 0 && m !== 1)) error(donde, `${b.id}: cada frase lleva «parrafo»: 0 o 1`);
        else if (marcas.some((m, i) => i && m < marcas[i - 1])) error(donde, `${b.id}: las frases del párrafo 0 van antes que las del 1`);
        for (const n of [0, 1]) {
          const cuantas = marcas.filter(m => m === n).length;
          if (cuantas < 3 || cuantas > 5) error(donde, `${b.id}: el párrafo ${n} tiene ${cuantas} frases (de 3 a 5)`);
        }
        for (const [n, f] of b.frases.entries()) {
          frases++;
          if (f.texto !== undefined) error(donde, `${b.id}.f${n}: la frase lleva «texto»`);
          if (f.quien !== undefined) error(donde, `${b.id}.f${n}: la lectura no lleva «quien»`);
          revisarSintaxis(f.sintaxis, catalogoCurso[`${b.id}.f${n}.texto`] ?? '', `${donde} ${b.id}.f${n}`);
        }
      } else if (!Array.isArray(b.parrafos) || b.parrafos.length !== 2) {
        error(donde, `${b.id}: el texto lleva «frases» (con «parrafo» y «sintaxis»)`);
      } else {
        aviso(donde, `${b.id}: lectura en formato antiguo («parrafos»): pásala a «frases» con análisis`);
      }
    }
    if (b.tipo === 'vocabulario') {
      if (!Array.isArray(b.palabras) || !b.palabras.length) error(donde, `${b.id}: la lista de vocabulario está vacía`);
      for (const p of b.palabras ?? []) if (!(p in (j.palabras ?? {}))) error(donde, `${b.id}: «${p}» no está en «palabras»`);
    }
    // ---- regla 6: ejercicios ----
    if (b.tipo === 'test' || b.tipo === 'huecos') {
      const ops = b.opciones ?? [];
      if (ops.length < 3 || ops.length > 4) error(donde, `${b.id}: ${ops.length} opciones (deben ser 3 o 4)`);
      if (ops.filter(o => o.correcta === true).length !== 1) error(donde, `${b.id}: debe haber exactamente una opción correcta`);
    }
    if (b.tipo === 'escribir' && (!Array.isArray(b.respuestas) || !b.respuestas.length)) error(donde, `${b.id}: faltan «respuestas»`);
  }
  if (frases < 4) error(donde, `solo ${frases} frases con análisis sintáctico (mínimo 4)`);

  const m = SOSPECHOSAS.exec(JSON.stringify(j));
  if (m) aviso(donde, `revisa el contenido: aparece «${m[0]}»`);

  // ---- regla 4: los 12 catálogos ----
  const deEstudio = clavesDeEstudio(j);
  const deAyuda = clavesDeAyuda(j);
  if (soloClaves) {
    console.log(JSON.stringify({ leccion: id, de_estudio: deEstudio, de_ayuda: deAyuda }, null, 2));
    return;
  }
  for (const idioma of IDIOMAS) {
    const etiqueta = `${donde} traducciones/${idioma}`;
    const rutaTrad = join(RAIZ, 'cursos', curso, 'traducciones', idioma, `${id}.json`);
    const esDelCurso = idioma === curso;
    if (!existsSync(rutaTrad)) {
      if (esDelCurso) error(etiqueta, 'falta el archivo del idioma del curso');
      else aviso(etiqueta, 'falta el archivo; se usará el inglés');
      continue;
    }
    let t;
    try { t = JSON.parse(readFileSync(rutaTrad, 'utf8').replace(/^\uFEFF/, '')); }
    catch (e) { error(etiqueta, `JSON no válido: ${e.message}`); continue; }
    if (t.idioma !== idioma) error(etiqueta, `«idioma» debe ser "${idioma}"`);
    if (String(t.leccion) !== id) error(etiqueta, `«leccion» debe ser "${id}"`);

    const tiene = new Set(Object.keys(t).filter(k => k !== 'idioma' && k !== 'leccion'));
    // En el idioma del curso también se exige el texto de estudio: es el que da la pauta.
    const esperadas = [...deAyuda, ...deEstudio];
    for (const k of esperadas) {
      if (!tiene.has(k)) error(etiqueta, `falta la clave «${k}»`);
      else if (typeof t[k] !== 'string' || !t[k].trim()) error(etiqueta, `la clave «${k}» está vacía`);
    }
    for (const k of tiene) {
      if (esperadas.includes(k)) continue;
      if (esDelCurso) error(etiqueta, `clave de más «${k}»: en el idioma del curso, el texto que se estudia no se duplica`);
      else error(etiqueta, `clave de más «${k}»`);
    }

    // Reglas que solo se pueden medir sobre el texto traducido.
    // Un párrafo literario cuenta por «caracteres útiles»: en chino y japonés cada
    // carácter lleva mucha más información que una letra latina, así que se cuentan
    // el doble. Sin esto, un párrafo rico en CJK parecería corto sin serlo.
    const pesoParrafo = texto => {
      const caracteres = String(texto ?? '').length;
      const cjk = (String(texto ?? '').match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) ?? []).length;
      return caracteres + cjk;
    };
    const MINIMO_PARRAFO = 120;
    for (const b of j.bloques ?? []) {
      if (b.tipo === 'texto') {
        // Cada párrafo es la suma de sus frases (o el texto entero, en el formato antiguo).
        const parrafos = Array.isArray(b.frases)
          ? [0, 1].map(n => b.frases.map((f, k) => [f, k]).filter(([f]) => f.parrafo === n).map(([, k]) => t[`${b.id}.f${k}.texto`] ?? '').join(' '))
          : (b.parrafos ?? []).map((_, n) => t[`${b.id}.p${n}`]);
        for (const [n, p] of parrafos.entries()) {
          if (typeof p === 'string' && pesoParrafo(p) < MINIMO_PARRAFO) {
            error(etiqueta, `${b.id} párrafo ${n}: demasiado corto (${pesoParrafo(p)} de ${MINIMO_PARRAFO})`);
          }
        }
      }
      if (['test', 'huecos', 'escribir'].includes(b.tipo) && t[`${b.id}.pregunta`]) {
        const n = t[`${b.id}.pregunta`].split(/\s+/).length;
        if (n > 15) error(etiqueta, `${b.id}.pregunta: ${n} palabras (máximo 15)`);
      }
      const frase = t[`${b.id}.frase`];
      if (b.tipo === 'huecos' && frase && !frase.includes('___')) error(etiqueta, `${b.id}.frase: el hueco debe llevar ___`);
      if (b.tipo === 'ordenar' && frase && frase.trim().split(/\s+/).length < 3) error(etiqueta, `${b.id}.frase: la frase para ordenar es demasiado corta`);
      for (const [n] of (b.opciones ?? []).entries()) {
        if (!t[`${b.id}.o${n}.refuerzo`]) error(etiqueta, `${b.id}.o${n}: falta el «refuerzo»`);
      }
    }
    for (const [palabra, e] of Object.entries(j.palabras ?? {})) {
      if (e?.propio) continue;
      const consejo = t[`p.${palabra}.consejo`];
      if (typeof consejo === 'string' && consejo.length > 160) error(etiqueta, `p.${palabra}.consejo: demasiado largo (${consejo.length}, máximo 160)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Recorrido
// ---------------------------------------------------------------------------
const cursos = readdirSync(join(RAIZ, 'cursos')).filter(c => existsSync(join(RAIZ, 'cursos', c, 'lessons')));
for (const c of (cursoPedido ? [cursoPedido] : cursos)) {
  const dirLecciones = join(RAIZ, 'cursos', c, 'lessons');
  const capitulos = new Map();
  const rutaCap = join(dirLecciones, 'capitulos.json');
  if (existsSync(rutaCap)) {
    try { for (const cap of JSON.parse(readFileSync(rutaCap, 'utf8'))) capitulos.set(String(cap.numero), cap); } catch { /* sin capítulos */ }
  }
  const v2 = readdirSync(dirLecciones)
    .filter(f => /^\d{3}\.json$/.test(f))
    .map(f => f.slice(0, 3))
    .filter(id => {
      try { return JSON.parse(readFileSync(join(dirLecciones, `${id}.json`), 'utf8')).esquema === 2; } catch { return false; }
    })
    .sort();
  for (const id of (leccionesPedidas.length ? leccionesPedidas : v2)) {
    const rutaCurso = join(RAIZ, 'cursos', c, 'traducciones', c, `${id}.json`);
    let catalogoCurso = {};
    if (existsSync(rutaCurso)) {
      try { catalogoCurso = JSON.parse(readFileSync(rutaCurso, 'utf8').replace(/^\uFEFF/, '')); } catch { catalogoCurso = {}; }
    }
    revisarLeccion(c, id, capitulos, catalogoCurso);
  }
}

if (soloClaves) process.exit(0);

for (const a of avisos) console.log(`  aviso  ${a}`);
for (const e of (detalle ? errores : errores.slice(0, 40))) console.log(`  ERROR  ${e}`);
if (errores.length > 40 && !detalle) console.log(`  … y ${errores.length - 40} errores más (usa -v)`);
console.log(errores.length ? `\n${errores.length} errores.` : 'Todo correcto.');
process.exitCode = errores.length ? 1 : 0;
