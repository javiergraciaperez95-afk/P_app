// Contenido del curso: el de muestra es válido, está en portugués y el validador detecta errores.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { revisarCurso, revisarLeccion, revisarFrases, ID_VALIDO, interpretarJSON } from '../js/lessons.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = async archivo => JSON.parse(await readFile(path.join(raiz, archivo), 'utf8'));

const curso = revisarCurso(await leer('lessons/curso.json'));
const lecciones = [];
for (const u of curso.unidades) {
  for (const id of u.lecciones) lecciones.push({ id, json: await leer(`lessons/${id}.json`) });
}

/** Todos los textos que aprende el alumno (campos en portugués) de un objeto de lección. */
function textosPortugueses(json) {
  const textos = [json.titulo, ...Object.keys(json.palabras ?? {})];
  for (const b of json.bloques) {
    for (const f of b.frases ?? []) textos.push(f.pt);
    if (b.frase) textos.push(b.frase);
    if (b.audio && typeof b.audio === 'string') textos.push(b.audio);
    for (const r of b.respuestas ?? []) textos.push(r);
    if (b.opciones && !Array.isArray(b.opciones)) textos.push(...Object.keys(b.opciones));
  }
  return textos.filter(Boolean);
}

test('dos unidades de muestra con varias lecciones cada una', () => {
  assert.equal(curso.unidades.length, 2);
  assert.deepEqual(curso.avisos, []);
  for (const u of curso.unidades) assert.ok(u.lecciones.length >= 3, `${u.id} tiene pocas lecciones`);
});

test('todas las lecciones de muestra son válidas, sin avisos y con ids estables', () => {
  for (const { id, json } of lecciones) {
    const r = revisarLeccion(id, json);
    assert.equal(r.fatal, undefined, id);
    assert.deepEqual(r.avisos, [], `${id}: ${JSON.stringify(r.avisos)}`);
    assert.deepEqual(r.leccion.bloques.filter(b => b.error), [], id);
    assert.ok(r.leccion.idsEjercicios.length >= 5, `${id}: pocos ejercicios`);
    for (const ej of r.leccion.idsEjercicios) assert.match(ej, ID_VALIDO, `${id}: id de ejercicio «${ej}»`);
    // Todos los tipos de ejercicio tienen ejemplo en el curso.
  }
  const tipos = new Set(lecciones.flatMap(({ json }) => json.bloques.map(b => b.tipo)));
  for (const tipo of ['explicacion', 'dialogo', 'vocabulario', 'tabla', 'test', 'traduccion', 'huecos', 'escribir', 'ordenar']) {
    assert.ok(tipos.has(tipo), `falta un ejemplo de «${tipo}»`);
  }
});

test('el contenido que se aprende está en portugués (no en español)', () => {
  const todos = lecciones.flatMap(({ json }) => textosPortugueses(json)).join(' | ');
  // Letras y signos propios del español que no existen en portugués.
  assert.doesNotMatch(todos, /[ñ¿¡]/, 'hay letras o signos del español');
  // Palabras españolas muy frecuentes que no son portuguesas.
  const espanol = /\b(hola|gracias|buenos|buenas|señor|señora|usted|cómo|qué|está usted|me llamo|adiós|perdón|cuánto|también es|vosotros)\b/i;
  assert.doesNotMatch(todos, espanol, 'hay palabras en español');
  // Sí aparecen rasgos del portugués.
  assert.match(todos, /[ãõç]/);
  for (const palabra of ['Olá', 'obrigado', 'Bom dia', 'Chamo-me', 'dezasseis', 'comboio']) {
    assert.ok(todos.includes(palabra), `falta «${palabra}»`);
  }
});

test('cada texto traducido tiene inglés y vietnamita', () => {
  for (const { id, json } of lecciones) {
    for (const [palabra, v] of Object.entries(json.palabras)) {
      assert.ok(v.trad?.en && v.trad?.vi, `${id}: «${palabra}» sin traducción completa`);
    }
    for (const b of json.bloques) {
      for (const f of b.frases ?? []) assert.ok(f.trad?.en && f.trad?.vi, `${id}: «${f.pt}» sin traducción completa`);
    }
  }
});

test('frases útiles válidas', async () => {
  const r = revisarFrases(await leer('phrases/frases.json'));
  assert.deepEqual(r.avisos, []);
  assert.ok(r.categorias.length >= 1);
});

test('el validador detecta los errores típicos', () => {
  const r = revisarLeccion('x', {
    titulo: 'Teste',
    subtitulo: { en: 'Test' },
    palabras: { casa: { trad: { en: 'house', vi: 'nhà' }, genero: 'x' } },
    bloques: [
      { tipo: 'huecos', id: 'a', frase: 'Eu ___ bem.', opciones: { estou: '', sou: '' }, correcta: 'estás' },
      { tipo: 'test', pregunta: { en: '?', vi: '?' }, opciones: ['a', 'b'], correcta: 'a' },
      { tipo: 'inventado' },
      { tipo: 'escribir', id: 'b', pregunta: { en: 'Write', vi: 'Viết' }, respuestas: [] },
    ],
  });
  const claves = r.avisos.map(a => a.k);
  assert.ok(claves.includes('validation.missingLanguage'), 'subtítulo sin vietnamita');
  assert.ok(claves.includes('validation.badGender'));
  assert.ok(claves.includes('validation.exerciseWithoutId'));
  const errores = r.leccion.bloques.filter(b => b.error).map(b => b.error.k);
  assert.deepEqual(errores, ['validation.correctNotFound', 'validation.unknownType', 'validation.missingAnswers']);

  const roto = interpretarJSON('{\n  "titulo": "a",\n  "bloques": [],\n}', 'lessons/x.json');
  assert.ok(roto.error.detalles.some(d => d.k === 'validation.trailingComma'));
});
