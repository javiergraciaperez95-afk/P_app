// Mete en las lecciones lo que Haiku ha escrito en _herramientas/haiku/respuestas/<tipo>/NNN.json.
// Comprueba cada resultado: lo que no cumple las reglas no entra y se lista para repetirlo.
// La criba no se mete: se junta en haiku/criba_marcadas.json para revisarla.
//
// Uso:
//   node _herramientas/meter_respuestas.mjs es            mete todo lo nuevo
//   node _herramientas/meter_respuestas.mjs es --prueba   solo dice qué metería
// Los lotes ya metidos quedan apuntados en haiku/metidos.json y no se vuelven a meter.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const idCurso = args.find(a => !a.startsWith('--'));
if (!idCurso) throw new Error('Falta el curso: node _herramientas/meter_respuestas.mjs es');
const prueba = args.includes('--prueba');
const CURSO = join(AQUI, '..', 'Idiomas', 'cursos', idCurso);
const HAIKU = join(AQUI, 'haiku');
const RUTA_METIDOS = join(HAIKU, 'metidos.json');
const RUTA_CRIBA = join(HAIKU, 'criba_marcadas.json');

const leer = r => JSON.parse(readFileSync(r, 'utf8').replace(/^﻿/, ''));
const guardar = (r, d) => writeFileSync(r, JSON.stringify(d, null, 2) + '\n');
const palabrasDe = t => String(t ?? '').trim().split(/\s+/).filter(Boolean).length;
const CAT = new Set(['sust', 'adj', 'verb', 'adv', 'pron', 'prep', 'conj', 'art', 'num', 'interj', 'expr', 'frase']);
const TIPOS_CRIBA = new Set(['errata', 'tilde', 'signos', 'concordancia', 'gramatica', 'natural', 'nivel']);
// La pronunciación: sílabas con guiones, al menos una en mayúsculas, solo letras.
const PRON = /^[a-zñ]+(?:-[a-zñ]+)*(?: [a-zñ]+(?:-[a-zñ]+)*)*$/i;

const metidos = existsSync(RUTA_METIDOS) ? leer(RUTA_METIDOS) : {};
const criba = existsSync(RUTA_CRIBA) ? leer(RUTA_CRIBA) : [];

// Lecciones y catálogos que se tocan, cargados una vez y guardados al final.
const cache = new Map();
const abrir = (carpeta, id) => {
  const r = join(CURSO, carpeta, `${id}.json`);
  if (!cache.has(r)) cache.set(r, { datos: leer(r), cambiado: false });
  return cache.get(r);
};
const leccion = id => abrir('lessons', id);
const ingles = id => abrir(join('traducciones', 'en'), id);

const rechazos = [];
let metidas = 0;

/** Lo que pedía cada tarea del lote original, para comprobar que la respuesta corresponde. */
function tareasDelLote(tipo, lote) {
  const r = join(HAIKU, 'lotes', tipo, `${lote}.json`);
  return existsSync(r) ? leer(r).tareas : null;
}

const METER = {
  refuerzos(res, tareas) {
    const t = tareas.find(x => x.leccion === res.leccion && x.clave === res.clave);
    if (!t) return 'no corresponde a ninguna tarea del lote';
    const n = palabrasDe(res.refuerzo);
    if (n < 4 || n > 18) return `refuerzo de ${n} palabras (4 a 18)`;
    if (/^correct\b/i.test(res.refuerzo)) return 'empieza por «Correct»';
    const c = ingles(res.leccion);
    c.datos[res.clave] = res.refuerzo.trim();
    c.cambiado = true;
  },
  explicaciones(res, tareas) {
    const t = tareas.find(x => x.leccion === res.leccion && x.clave === res.clave);
    if (!t) return 'no corresponde a ninguna tarea del lote';
    const n = palabrasDe(res.explicacion);
    if (n < 4 || n > 18) return `explicación de ${n} palabras (4 a 18)`;
    // La opción de la lección pasa a apuntar a su explicación (b4.o1 → b4.o1.explicacion).
    const l = leccion(res.leccion);
    const opcion = l.datos.bloques.flatMap(b => (b.tipo === 'traduccion' ? b.opciones : [])).find(o => `${o.texto.$t}.explicacion` === res.clave);
    if (!opcion) return 'la opción ya no existe en la lección';
    opcion.explicacion = { $t: res.clave };
    l.cambiado = true;
    const c = ingles(res.leccion);
    c.datos[res.clave] = res.explicacion.trim();
    c.cambiado = true;
  },
  palabras(res, tareas) {
    const t = tareas.find(x => x.leccion === res.leccion && x.palabra === res.palabra);
    if (!t) return 'no corresponde a ninguna tarea del lote';
    const p = leccion(res.leccion).datos.palabras[res.palabra];
    if (!p) return 'la palabra ya no está en la lección';
    const cambios = {};
    for (const campo of t.falta) {
      const v = res[campo];
      // El género se pide por si es sustantivo («una vez que» empieza por artículo y no lo es).
      if (campo === 'genero' && v === undefined && (res.cat ?? p.cat) !== 'sust') continue;
      if (v === undefined) return `falta «${campo}»`;
      if (campo === 'pron' && (!PRON.test(v) || !/[A-ZÑ]/.test(v))) return `pron no válida: ${v}`;
      if (campo === 'cat' && !CAT.has(v)) return `cat no válida: ${v}`;
      if (campo === 'genero' && v !== 'm' && v !== 'f') return `genero no válido: ${v}`;
      cambios[campo] = v;
    }
    // Un sustantivo con artículo necesita género aunque no se pidiera.
    if ((cambios.cat ?? p.cat) === 'sust' && !p.genero && !cambios.genero && /^(el|la|los|las|un|una) /i.test(res.palabra)) {
      if (res.genero !== 'm' && res.genero !== 'f') return 'sustantivo sin género';
      cambios.genero = res.genero;
    }
    Object.assign(p, cambios);
    leccion(res.leccion).cambiado = true;
  },
  preguntas(res, tareas) {
    const t = tareas.find(x => x.leccion === res.leccion && x.clave === res.clave);
    if (!t) return 'no corresponde a ninguna tarea del lote';
    const n = palabrasDe(res.pregunta);
    if (n < 3 || n > 15) return `pregunta de ${n} palabras (máximo 15)`;
    // Sin «id» fijo, el identificador del ejercicio sale de la pregunta: cambiarla borraría el progreso.
    const bloque = leccion(res.leccion).datos.bloques[Number(res.clave.match(/^b(\d+)\./)?.[1]) - 1];
    if (!bloque?.id) return 'el ejercicio no tiene «id» fijo: cambiar la pregunta borraría el progreso';
    const c = ingles(res.leccion);
    c.datos[res.clave] = res.pregunta.trim();
    c.cambiado = true;
  },
  criba(res, tareas) {
    const t = tareas.find(x => x.leccion === res.leccion);
    if (!t) return 'no corresponde a ninguna lección del lote';
    if (!(res.ref in t.textos)) return `referencia desconocida: ${res.ref}`;
    if (!TIPOS_CRIBA.has(res.tipo)) return `tipo desconocido: ${res.tipo}`;
    criba.push({ leccion: res.leccion, ref: res.ref, tipo: res.tipo, texto: t.textos[res.ref], dudoso: res.dudoso ?? '', propuesta: res.propuesta ?? '' });
  },
};

for (const tipo of Object.keys(METER)) {
  const carpeta = join(HAIKU, 'respuestas', tipo);
  if (!existsSync(carpeta)) continue;
  for (const archivo of readdirSync(carpeta).filter(f => /^\d+\.json$/.test(f)).sort()) {
    const lote = archivo.slice(0, -5);
    if (metidos[`${tipo}/${lote}`]) continue;
    const tareas = tareasDelLote(tipo, lote);
    if (!tareas) { rechazos.push(`${tipo}/${lote}: no encuentro el lote original`); continue; }
    let respuesta;
    try { respuesta = leer(join(carpeta, archivo)); } catch (e) { rechazos.push(`${tipo}/${lote}: JSON no válido (${e.message})`); continue; }
    const resultados = Array.isArray(respuesta.resultados) ? respuesta.resultados : [];
    let buenos = 0;
    for (const res of resultados) {
      const fallo = METER[tipo](res, tareas);
      if (fallo) rechazos.push(`${tipo}/${lote} · ${res.leccion} ${res.clave ?? res.palabra ?? res.ref ?? ''}: ${fallo}`);
      else buenos++;
    }
    // Las tareas sin respuesta también se avisan (la criba puede no devolver nada de una lección).
    if (tipo !== 'criba' && resultados.length < tareas.length) rechazos.push(`${tipo}/${lote}: ${tareas.length - resultados.length} tareas sin respuesta`);
    metidas += buenos;
    metidos[`${tipo}/${lote}`] = { resultados: resultados.length, buenos };
    console.log(`  ${tipo}/${lote}: ${buenos} de ${resultados.length}`);
  }
}

if (!prueba) {
  for (const [r, { datos, cambiado }] of cache) if (cambiado) guardar(r, datos);
  guardar(RUTA_METIDOS, metidos);
  guardar(RUTA_CRIBA, criba);
}
for (const r of rechazos) console.log(`  RECHAZO  ${r}`);
console.log(`${metidas} resultados ${prueba ? 'se meterían' : 'metidos'}, ${rechazos.length} rechazos.${prueba ? '' : ' Después: node _herramientas/validar_v2.mjs es y generar_indices.mjs es'}`);
