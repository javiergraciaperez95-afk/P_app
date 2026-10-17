// Genera el índice de lecciones y el diccionario de cada curso, para que la app no tenga que
// descargar y revisar las 300 lecciones al arrancar:
//   Idiomas/cursos/<curso>/indice/lecciones.json    lo que pinta la lista (título, capítulo, número,
//                                                   ejercicios, avisos) y las lecciones que no cargan
//   Idiomas/cursos/<curso>/indice/diccionario.json  todas las palabras del curso (las que se tocan en
//                                                   las lecciones y se buscan en el cuaderno)
// La app abre cada lección completa solo cuando se entra en ella.
//
// Usa el MISMO código de la app (js/lessons.js) con un navegador de mentira, así los identificadores
// de los ejercicios (de ellos depende el progreso guardado) salen exactamente iguales.
//
// Uso:
//   node _herramientas/generar_indices.mjs          todos los cursos
//   node _herramientas/generar_indices.mjs es fr    solo esos cursos
// Hay que volver a ejecutarlo cada vez que se añade o cambia una lección (copiar.mjs de la APK y
// «Abrir Paglot.cmd» ya lo hacen solos).

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = fileURLToPath(import.meta.url);
const RAIZ = join(dirname(AQUI), '..', 'Idiomas');
const IDIOMAS = ['en', 'es', 'vi', 'zh', 'pt', 'fr', 'ja', 'it', 'ko', 'ru', 'de', 'id'];
// En el diccionario la traducción ya va en «trad»: estas copias sobran. «es» no: es la palabra misma.
const CAMPOS_DUPLICADOS = new Set([...IDIOMAS.filter(i => i !== 'es'), 'tes']);

const [, , modo, ...resto] = process.argv;

if (modo === '--curso') {
  await generarCurso(resto[0]);
} else {
  // Cada curso en su propio proceso: la app lee el curso elegido una sola vez, al cargarse.
  const { CURSOS } = await import(pathToFileURL(join(RAIZ, 'js', 'cursos.js')));
  const pedidos = process.argv.slice(2);
  const cursos = CURSOS.filter(c => existsSync(join(RAIZ, c.carpeta, 'lessons')) && (!pedidos.length || pedidos.includes(c.id)));
  for (const c of cursos) execFileSync(process.execPath, [AQUI, '--curso', c.id], { stdio: 'inherit' });
}

/** Un navegador mínimo: lo justo para que los módulos de la app se carguen en Node. */
function prepararNavegador(idCurso) {
  const almacen = new Map([['idiomas-curso', idCurso], ['idiomas-ajustes', JSON.stringify({ idioma: 'en' })]]);
  const nada = () => {};
  const elemento = () => ({ dataset: {}, style: {}, setAttribute: nada, addEventListener: nada, append: nada });
  const ventana = new EventTarget();
  ventana.matchMedia = () => ({ matches: false, addEventListener: nada });
  Object.defineProperty(globalThis, 'window', { value: ventana, configurable: true });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: k => almacen.get(k) ?? null, setItem: (k, v) => almacen.set(k, String(v)), removeItem: k => almacen.delete(k) },
  });
  Object.defineProperty(globalThis, 'navigator', { value: { languages: ['en'], language: 'en', onLine: true }, configurable: true });
  globalThis.document = {
    documentElement: elemento(), body: elemento(), hidden: false,
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
    createElement: elemento, addEventListener: nada,
  };
  globalThis.location = { protocol: 'http:', hash: '', origin: 'http://localhost' };
  // fetch lee los archivos del disco; lo que no existe es un 404, como en el servidor.
  globalThis.fetch = async url => {
    const archivo = join(RAIZ, decodeURIComponent(String(url).split('?')[0]));
    if (!existsSync(archivo)) return { ok: false, status: 404, text: async () => '', json: async () => null };
    const texto = readFileSync(archivo, 'utf8');
    return { ok: true, status: 200, text: async () => texto, json: async () => JSON.parse(texto) };
  };
}

/** Junta lo que da cada idioma de la interfaz: si un texto cambia según el idioma, queda como { idioma: texto }. */
function unir(porIdioma) {
  const valores = [...porIdioma.values()].filter(v => v !== undefined && v !== null && v !== '');
  if (!valores.length) return [...porIdioma.values()][0];
  if (valores.every(v => typeof v === 'object' && !Array.isArray(v))) {
    const salida = {};
    for (const v of valores) for (const [k, x] of Object.entries(v)) if (!(k in salida) || salida[k] === '') salida[k] = x;
    return salida;
  }
  if (valores.every(v => JSON.stringify(v) === JSON.stringify(valores[0]))) return valores[0];
  // Un texto distinto en cada idioma (las etiquetas de las fichas v2): se guarda bajo el idioma de cada uno.
  const salida = {};
  for (const [i, v] of porIdioma) if (typeof v === 'string' && v) salida[i] = v;
  return salida;
}

async function generarCurso(idCurso) {
  prepararNavegador(idCurso);
  const js = archivo => pathToFileURL(join(RAIZ, 'js', archivo));
  const { curso } = await import(js('curso.js'));
  const { cambiarIdioma } = await import(js('i18n.js'));
  const { descubrirLecciones, cargarLeccion } = await import(js('lessons.js'));

  // El inglés primero: con él se descubren las lecciones y se calculan los identificadores.
  const resultados = await descubrirLecciones();
  if (resultados.sinConexion) throw new Error(`${idCurso}: no se han podido leer las lecciones`);
  const buenas = resultados.filter(r => r.leccion);

  // Las lecciones v2 sacan sus textos de traducciones/<idioma>/: hay que leerlas en cada idioma.
  const carpetaLecciones = join(RAIZ, curso.carpeta, 'lessons');
  const esV2 = id => {
    try { return JSON.parse(readFileSync(join(carpetaLecciones, `${id}.json`), 'utf8').replace(/^﻿/, '')).esquema === 2; } catch { return false; }
  };
  const v2 = buenas.filter(r => esV2(r.id));
  /** id → Map(idioma → lección cargada con ese idioma de interfaz) */
  const versiones = new Map(buenas.map(r => [r.id, new Map([['en', r.leccion]])]));
  /** id → Map(idioma → identificadores) cuando no salen iguales que en inglés */
  for (const idioma of IDIOMAS.filter(i => i !== 'en')) {
    if (!v2.length) break;
    await cambiarIdioma(idioma);
    for (const r of v2) {
      const otra = await cargarLeccion(r.id);
      if (otra.leccion) versiones.get(r.id).set(idioma === curso.campo ? 'en' : idioma, otra.leccion);
    }
  }
  await cambiarIdioma('en');

  const ejercicios = leccion => leccion.bloques.filter(b => b.id).map(b => (b.soloOido ? [b.id, 1] : [b.id]));

  const lecciones = resultados.map(r => {
    if (!r.leccion) return { id: r.id, error: true };
    const { leccion } = r;
    const porIdioma = versiones.get(r.id);
    const entrada = {
      id: r.id,
      titulo_es: leccion.titulo_es,
      titulo: unir(new Map([...porIdioma].map(([i, l]) => [i, l.titulo]))),
      capitulo: leccion.capitulo,
      orden_curso: leccion.orden_curso,
      numero_curso: leccion.numero_curso,
      ejercicios: ejercicios(leccion),
    };
    // En algunas lecciones v2 el identificador depende de la pregunta, y la pregunta del idioma del alumno.
    const distintos = {};
    for (const [i, l] of porIdioma) {
      const ids = ejercicios(l);
      if (JSON.stringify(ids) !== JSON.stringify(entrada.ejercicios)) distintos[i] = ids;
    }
    if (Object.keys(distintos).length) entrada.ejerciciosPorIdioma = distintos;
    const conAudio = leccion.bloques.filter(b => b.id && b.audio).length;
    if (conAudio) entrada.audio = conAudio;
    if (r.avisos.length) entrada.avisos = r.avisos.length;
    return entrada;
  });

  // El diccionario: la primera lección que define una palabra manda (como en la app).
  const diccionario = {};
  for (const r of buenas) {
    const porIdioma = versiones.get(r.id);
    for (const clave of r.leccion.palabras.keys()) {
      if (clave in diccionario) continue;
      const fichas = new Map([...porIdioma].map(([i, l]) => [i, l.palabras.get(clave)]).filter(([, f]) => f));
      const campos = new Set([...fichas.values()].flatMap(f => Object.keys(f)));
      const ficha = {};
      for (const campo of campos) {
        if (CAMPOS_DUPLICADOS.has(campo)) continue;
        const valor = unir(new Map([...fichas].map(([i, f]) => [i, f[campo]])));
        if (valor !== undefined && valor !== null) ficha[campo] = valor;
      }
      diccionario[clave] = ficha;
    }
  }

  const carpeta = join(RAIZ, curso.carpeta, 'indice');
  mkdirSync(carpeta, { recursive: true });
  writeFileSync(join(carpeta, 'lecciones.json'), JSON.stringify({ version: 1, lecciones }));
  writeFileSync(join(carpeta, 'diccionario.json'), JSON.stringify(diccionario));
  const errores = lecciones.filter(l => l.error).length;
  console.log(`${idCurso}: ${buenas.length} lecciones${errores ? `, ${errores} con error` : ''}, ${Object.keys(diccionario).length} palabras`);
}
