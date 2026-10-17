// Mide lo que le falta a cada lección flexible y prepara los lotes de trabajo para Haiku.
//
// Uso:
//   node _herramientas/medir_faltas.mjs es              informe por pantalla
//   node _herramientas/medir_faltas.mjs es --lotes      además, escribe los lotes en _herramientas/haiku/lotes/
//
// Tipos de tarea (las instrucciones de cada uno están en _herramientas/haiku/<tipo>.txt):
//   refuerzos     refuerzo genérico o muy corto («Correct.», «The text does not say that.»)
//   explicaciones opción de un ejercicio de traducción sin explicación
//   palabras      ficha sin pron, sin cat (o con una categoría fuera del catálogo) o sustantivo sin género
//   preguntas     enunciado de más de 15 palabras
//   criba         todo el español de la lección, para marcar lo dudoso (sin corregir)
// Las respuestas se meten con: node _herramientas/meter_respuestas.mjs es

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const idCurso = args.find(a => !a.startsWith('--'));
if (!idCurso) throw new Error('Falta el curso: node _herramientas/medir_faltas.mjs es');
const escribir = args.includes('--lotes');
const CURSO = join(AQUI, '..', 'Idiomas', 'cursos', idCurso);
const LOTES = join(AQUI, 'haiku', 'lotes');

const CAT = /^(sust|adj|verb|adv|pron|prep|conj|art|num|interj|expr|frase)$/;
// Cuántas tareas van en cada lote (la criba va por lecciones).
const TAMANO = { refuerzos: 40, explicaciones: 40, palabras: 60, preguntas: 40, criba: 5 };

const leer = r => JSON.parse(readFileSync(r, 'utf8').replace(/^﻿/, ''));
const palabrasDe = t => String(t ?? '').trim().split(/\s+/).filter(Boolean).length;

const ids = readdirSync(join(CURSO, 'lessons')).filter(f => /^\d+\.json$/.test(f)).map(f => f.slice(0, -5)).sort();
const lecciones = [];
for (const id of ids) {
  const d = leer(join(CURSO, 'lessons', `${id}.json`));
  if (!d.flexible) continue;
  lecciones.push({ id, d, en: leer(join(CURSO, 'traducciones', 'en', `${id}.json`)), es: leer(join(CURSO, 'traducciones', idCurso, `${id}.json`)) });
}

// Un refuerzo es genérico si es muy corto o si se repite igual en muchos ejercicios del curso.
const veces = new Map();
for (const { d, en } of lecciones) for (const b of d.bloques) {
  if (!['test', 'huecos'].includes(b.tipo)) continue;
  for (const r of Object.values(b.opciones)) { const t = en[r.$t] ?? ''; veces.set(t, (veces.get(t) ?? 0) + 1); }
}
const generico = t => !t || palabrasDe(t) <= 2 || veces.get(t) >= 4;

const tareas = { refuerzos: [], explicaciones: [], palabras: [], preguntas: [], criba: [] };
const porLeccion = new Map();
const anotar = (id, tipo) => { const c = porLeccion.get(id) ?? {}; c[tipo] = (c[tipo] ?? 0) + 1; porLeccion.set(id, c); };

for (const { id, d, en, es } of lecciones) {
  const titulo = es.titulo;
  // Contexto del ejercicio, en pocas líneas: lo que Haiku necesita para escribir bien.
  const contexto = b => {
    const c = { tipo: b.tipo };
    if (b.pregunta) c.pregunta = en[b.pregunta.$t];
    if (b.frase) c.frase = es[b.frase.$e];
    if (b.traduccion) c.traduccion = en[b.traduccion.$t];
    return c;
  };

  for (const [w, p] of Object.entries(d.palabras)) {
    const falta = [];
    if (!p.pron) falta.push('pron');
    if (!p.cat || !CAT.test(p.cat)) falta.push('cat');
    if ((p.cat === 'sust' || falta.includes('cat')) && !p.genero && /^(el|la|los|las|un|una) /i.test(w)) falta.push('genero');
    if (!falta.length) continue;
    tareas.palabras.push({ leccion: id, palabra: w, glosa: en[p.$f] ?? null, cat_actual: p.cat ?? null, pron_actual: p.pron ?? null, falta });
    anotar(id, 'palabras');
  }

  d.bloques.forEach(b => {
    if (b.pregunta && palabrasDe(en[b.pregunta.$t]) > 15) {
      tareas.preguntas.push({ leccion: id, clave: b.pregunta.$t, ...contexto(b) });
      anotar(id, 'preguntas');
    }
    if (['test', 'huecos'].includes(b.tipo)) {
      const opciones = Object.entries(b.opciones).map(([texto, r]) => ({ texto, correcta: texto === b.correcta, refuerzo: en[r.$t] ?? '' , clave: r.$t }));
      for (const o of opciones) {
        if (!generico(o.refuerzo)) continue;
        tareas.refuerzos.push({
          leccion: id, titulo, clave: o.clave, ...contexto(b),
          opciones: opciones.map(x => x.texto + (x.correcta ? '  ✔' : '')),
          opcion: o.texto, correcta: o.correcta, refuerzo_actual: o.refuerzo,
        });
        anotar(id, 'refuerzos');
      }
    }
    if (b.tipo === 'traduccion') {
      b.opciones.forEach((o, i) => {
        if (o.explicacion) return;
        tareas.explicaciones.push({
          leccion: id, titulo, clave: `${o.texto.$t}.explicacion`, frase: es[b.frase.$e],
          opciones: b.opciones.map(x => en[x.texto.$t] + (x.correcta ? '  ✔' : '')),
          opcion: en[o.texto.$t], correcta: o.correcta === true,
        });
        anotar(id, 'explicaciones');
      });
    }
  });

  // Criba: todo el español de la lección, cada texto con una referencia para poder señalarlo.
  const textos = {};
  for (const [k, v] of Object.entries(es)) if (k !== 'idioma' && k !== 'leccion') textos[k] = v;
  d.bloques.forEach((b, n) => {
    const p = `b${n + 1}`;
    if (['test', 'huecos'].includes(b.tipo)) Object.keys(b.opciones).forEach((o, i) => { textos[`${p}.o${i}[opción]`] = o; });
    (b.respuestas ?? []).forEach((r, i) => { textos[`${p}.r${i}[respuesta]`] = r; });
    (b.filas ?? []).forEach((f, i) => { textos[`${p}.fila${i}[tabla]`] = f.join(' | '); });
  });
  for (const w of Object.keys(d.palabras)) textos[`p.${w}[palabra]`] = w;
  tareas.criba.push({ leccion: id, titulo, nivel_capitulo: d.capitulo, textos });
}

// ---------------------------------------------------------------------------
// Informe
// ---------------------------------------------------------------------------
console.log(`${idCurso}: ${lecciones.length} lecciones flexibles`);
for (const [tipo, lista] of Object.entries(tareas)) {
  const lotes = Math.ceil(lista.length / TAMANO[tipo]);
  console.log(`  ${tipo.padEnd(14)} ${String(lista.length).padStart(5)} tareas  →  ${lotes} lotes`);
}
const peores = [...porLeccion].map(([id, c]) => [id, Object.values(c).reduce((a, b) => a + b, 0), c]).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log('  lecciones con más faltas:', peores.map(([id, n]) => `${id} (${n})`).join(', '));

if (escribir) {
  // Rehacer los lotes los renumera: lo ya respondido dejaría de corresponder. Solo con --de-cero.
  const HAIKU = join(AQUI, 'haiku');
  if (existsSync(join(HAIKU, 'metidos.json')) && !args.includes('--de-cero')) {
    console.log('Ya hay lotes metidos (haiku/metidos.json). Para empezar de cero: --lotes --de-cero');
    process.exit(1);
  }
  for (const c of ['lotes', 'respuestas', 'metidos.json', 'criba_marcadas.json']) rmSync(join(HAIKU, c), { recursive: true, force: true });
  for (const [tipo, lista] of Object.entries(tareas)) {
    mkdirSync(join(LOTES, tipo), { recursive: true });
    for (let i = 0; i * TAMANO[tipo] < lista.length; i++) {
      const nombre = String(i + 1).padStart(3, '0');
      const lote = { curso: idCurso, tipo, lote: nombre, tareas: lista.slice(i * TAMANO[tipo], (i + 1) * TAMANO[tipo]) };
      writeFileSync(join(LOTES, tipo, `${nombre}.json`), JSON.stringify(lote, null, 1) + '\n');
    }
  }
  console.log(`Lotes escritos en ${LOTES}`);
}
