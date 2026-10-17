// Pasa las lecciones antiguas (sin "esquema") al esquema v2 «flexible» (ESQUEMA_V2.txt, punto 9):
// mismos bloques que tenían, pero cada texto se va a los catálogos traducciones/<idioma>/NNN.json
// y en la lección queda una referencia. Las lecciones v2 completas no se tocan.
//
// Uso:
//   node _herramientas/a_flexible.mjs es              todas las antiguas del curso
//   node _herramientas/a_flexible.mjs es 050 051      solo esas
//   … --prueba                                        no escribe nada, solo cuenta
//
// Referencias que deja en la lección (las resuelve adaptarFlexible() en js/lessons.js):
//   {"$t": clave}   texto de ayuda (explicación, pregunta, refuerzo, glosa…)
//   "$f": clave     dentro de una frase o palabra: su texto en cada idioma
//   {"$e": clave}   texto en el idioma del curso (la frase de un hueco o de ordenar)

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'Idiomas');
// «id» no cuenta como idioma: en las lecciones antiguas es el identificador del ejercicio.
const IDIOMAS = new Set(['en', 'es', 'vi', 'zh', 'pt', 'fr', 'ja', 'it', 'ko', 'ru', 'de']);
const CATEGORIAS = {
  expression: 'expr', verb: 'verb', noun: 'sust', adjective: 'adj', adverb: 'adv', pronoun: 'pron',
  preposition: 'prep', interjection: 'interj', conjunction: 'conj', number: 'num',
};

const args = process.argv.slice(2);
const prueba = args.includes('--prueba');
const [idCurso, ...pedidas] = args.filter(a => !a.startsWith('--'));
if (!idCurso) throw new Error('Falta el curso: node _herramientas/a_flexible.mjs es');
const CURSO = join(RAIZ, 'cursos', idCurso);
const LECCIONES = join(CURSO, 'lessons');

const esObjeto = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function convertir(id, d) {
  const cat = {};
  const poner = (idioma, clave, texto) => {
    cat[idioma] ??= { idioma, leccion: id };
    if (clave in cat[idioma] && cat[idioma][clave] !== texto) throw new Error(`${id}: clave repetida ${clave}`);
    cat[idioma][clave] = texto;
  };
  const raro = (donde, v) => { throw new Error(`${id}: no sé convertir ${donde}: ${JSON.stringify(v).slice(0, 80)}`); };

  /** Texto de ayuda: una cadena (inglés) o { idioma: texto }. */
  const ayuda = (v, clave) => {
    if (v === undefined) return undefined;
    if (typeof v === 'string') { poner('en', clave, v); return { $t: clave }; }
    if (!esObjeto(v)) raro(clave, v);
    for (const [i, t] of Object.entries(v)) {
      if (!IDIOMAS.has(i) || typeof t !== 'string') raro(clave, v);
      poner(i, clave, t);
    }
    return { $t: clave };
  };
  /** Texto en el idioma del curso. */
  const delCurso = (v, clave) => {
    if (v === undefined) return undefined;
    if (typeof v !== 'string') raro(clave, v);
    poner(idCurso, clave, v);
    return { $e: clave };
  };
  /** Las etiquetas del análisis se repiten mucho: una clave por etiqueta y lección. */
  const etiquetas = new Map();
  const etiqueta = texto => {
    if (!etiquetas.has(texto)) etiquetas.set(texto, ayuda(texto, `a${etiquetas.size}`));
    return etiquetas.get(texto);
  };
  /** Frase o palabra: los campos con nombre de idioma se van al catálogo bajo una sola clave. */
  const frase = (o, clave, campos) => {
    const salida = { $f: clave };
    for (const [k, v] of Object.entries(o)) {
      if (IDIOMAS.has(k)) {
        if (typeof v !== 'string') raro(`${clave}.${k}`, v);
        poner(k, clave, v);
      } else if (k === 'nota' || k === 'consejo') {
        // En los diálogos, «nota» puede ser una lista vacía.
        salida[k] = Array.isArray(v) && !v.length ? v : ayuda(v, `${clave}.${k}`);
      } else if (k === 'analisis') {
        salida[k] = v.map(([texto, e]) => [texto, etiqueta(e)]);
      } else if (k === 'cat') {
        salida[k] = CATEGORIAS[v] ?? v;
      } else if (campos.includes(k)) {
        salida[k] = v;
      } else raro(`${clave}.${k}`, v);
    }
    return salida;
  };

  const base = { esquema: 2, flexible: true, id, capitulo: d.capitulo };
  for (const k of Object.keys(d)) if (!['capitulo', 'titulo_es', 'titulo', 'intro', 'palabras', 'bloques'].includes(k)) raro(k, d[k]);
  if (d.titulo_es !== undefined) poner(idCurso, 'titulo', d.titulo_es);
  base.titulo = ayuda(d.titulo, 'titulo');
  if (d.intro !== undefined) base.intro = ayuda(d.intro, 'intro');

  base.palabras = {};
  for (const [w, p] of Object.entries(d.palabras ?? {})) {
    const clave = `p.${w}`;
    if (typeof p === 'string') { poner('en', clave, p); base.palabras[w] = { $f: clave }; }
    else base.palabras[w] = frase(p, clave, ['pron', 'genero']);
  }

  base.bloques = d.bloques.map((b, n) => {
    const p = `b${n + 1}`;
    const s = {};
    for (const [k, v] of Object.entries(b)) {
      if (['tipo', 'id', 'correcta', 'respuestas', 'audio', 'palabras', 'filas'].includes(k)) s[k] = v;
      else if (['titulo', 'texto', 'pregunta', 'explicacion', 'traduccion', 'nota'].includes(k)) s[k] = ayuda(v, `${p}.${k}`);
      else if (k === 'frase') s[k] = delCurso(v, `${p}.frase`);
      else if (k === 'columnas') s[k] = v.map((c, i) => (c === '' ? c : ayuda(c, `${p}.c${i}`)));
      else if (k === 'frases') s[k] = v.map((f, i) => frase(f, `${p}.f${i}`, ['quien']));
      else if (k === 'opciones' && Array.isArray(v)) {
        s[k] = v.map((o, i) => {
          const r = {};
          for (const [ok, ov] of Object.entries(o)) {
            if (ok === 'correcta') r[ok] = ov;
            else if (ok === 'texto' || ok === 'explicacion') r[ok] = ayuda(ov, `${p}.o${i}${ok === 'texto' ? '' : '.explicacion'}`);
            else raro(`${p}.o${i}.${ok}`, ov);
          }
          return r;
        });
      } else if (k === 'opciones' && esObjeto(v)) {
        // La clave es la opción misma (texto del curso, se queda); el valor es el refuerzo.
        s[k] = Object.fromEntries(Object.entries(v).map(([o, r], i) => [o, ayuda(r, `${p}.o${i}.refuerzo`)]));
      } else raro(`${p}.${k}`, v);
    }
    return s;
  });
  return { base, cat };
}

const archivos = readdirSync(LECCIONES).filter(f => /^\d+\.json$/.test(f) && (!pedidas.length || pedidas.includes(f.slice(0, -5))));
let hechas = 0, textos = 0;
for (const f of archivos) {
  const id = f.slice(0, -5);
  const d = JSON.parse(readFileSync(join(LECCIONES, f), 'utf8').replace(/^﻿/, ''));
  if (d.esquema === 2) continue;
  const { base, cat } = convertir(id, d);
  hechas++;
  for (const c of Object.values(cat)) textos += Object.keys(c).length - 2;
  if (prueba) continue;
  writeFileSync(join(LECCIONES, f), JSON.stringify(base, null, 2) + '\n');
  for (const [idioma, c] of Object.entries(cat)) {
    mkdirSync(join(CURSO, 'traducciones', idioma), { recursive: true });
    writeFileSync(join(CURSO, 'traducciones', idioma, f), JSON.stringify(c, null, 2) + '\n');
  }
}
console.log(`${idCurso}: ${hechas} lecciones ${prueba ? 'se pasarían' : 'pasadas'} a v2 flexible, ${textos} textos en catálogos`);
