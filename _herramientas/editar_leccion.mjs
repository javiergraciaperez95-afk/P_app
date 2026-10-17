// Para reescribir a mano una lección flexible sin pelearse con las claves de los catálogos.
//
//   node _herramientas/editar_leccion.mjs sacar es 263   → _herramientas/edicion/263.json
//        La lección entera en la forma antigua (español y su traducción juntos), fácil de editar.
//   node _herramientas/editar_leccion.mjs meter es 263   → la vuelve a pasar a flexible y la comprueba
//        con el mismo código de la app. Si la app la carga con avisos nuevos o con error, no se mete.
//
// Al meterla se rehacen las claves de los catálogos es/en de esa lección. Las lecciones flexibles aún
// no tienen otros idiomas; si los tuvieran, habría que volver a traducirla.

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', 'Idiomas');
const EDICION = join(AQUI, 'edicion');
const [, , orden, idCurso, id] = process.argv;
if (!['sacar', 'meter'].includes(orden) || !idCurso || !/^\d{3}$/.test(id ?? '')) {
  throw new Error('Uso: node _herramientas/editar_leccion.mjs sacar|meter es 263');
}
const CURSO = join(RAIZ, 'cursos', idCurso);
const leer = r => JSON.parse(readFileSync(r, 'utf8').replace(/^﻿/, ''));
const rutaLeccion = join(CURSO, 'lessons', `${id}.json`);
const rutaCat = idioma => join(CURSO, 'traducciones', idioma, `${id}.json`);

if (orden === 'sacar') {
  const base = leer(rutaLeccion);
  if (!base.flexible) throw new Error(`${id} no es una lección flexible`);
  const en = leer(rutaCat('en'));
  const cur = leer(rutaCat(idCurso));
  const andar = o => {
    if (Array.isArray(o)) return o.map(andar);
    if (!o || typeof o !== 'object') return o;
    if (typeof o.$t === 'string' && Object.keys(o).length === 1) return en[o.$t] ?? '';
    if (typeof o.$e === 'string' && Object.keys(o).length === 1) return cur[o.$e] ?? '';
    const s = {};
    if (typeof o.$f === 'string') {
      if (cur[o.$f] !== undefined) s[idCurso] = cur[o.$f];
      if (en[o.$f] !== undefined) s.en = en[o.$f];
    }
    for (const [k, v] of Object.entries(o)) if (k !== '$f') s[k] = andar(v);
    return s;
  };
  const l = andar(base);
  const salida = { capitulo: l.capitulo, titulo_es: cur.titulo, titulo: l.titulo, intro: l.intro, palabras: l.palabras, bloques: l.bloques };
  if (salida.intro === undefined) delete salida.intro;
  mkdirSync(EDICION, { recursive: true });
  writeFileSync(join(EDICION, `${id}.json`), JSON.stringify(salida, null, 2) + '\n');
  console.log(`Escrita _herramientas/edicion/${id}.json`);
} else {
  const editada = join(EDICION, `${id}.json`);
  if (!existsSync(editada)) throw new Error(`No existe ${editada}: primero «sacar»`);
  leer(editada); // que sea JSON válido antes de tocar nada
  // Copia de seguridad de lo que hay ahora, por si la nueva no pasa.
  const copia = { leccion: readFileSync(rutaLeccion), es: readFileSync(rutaCat(idCurso)), en: readFileSync(rutaCat('en')) };
  const antes = await cargarConLaApp();
  const restaurar = () => {
    writeFileSync(rutaLeccion, copia.leccion);
    writeFileSync(rutaCat(idCurso), copia.es);
    writeFileSync(rutaCat('en'), copia.en);
  };
  try {
    copyFileSync(editada, rutaLeccion);
    execFileSync(process.execPath, [join(AQUI, 'a_flexible.mjs'), idCurso, id], { stdio: 'pipe' });
    execFileSync(process.execPath, [join(AQUI, 'validar_v2.mjs'), idCurso, id], { stdio: 'pipe' });
  } catch (e) {
    restaurar();
    console.log(String(e.stdout ?? '') + String(e.stderr ?? e.message));
    console.log('NO SE HA METIDO: la lección vuelve a estar como antes.');
    process.exit(1);
  }
  const despues = await cargarConLaApp();
  const nuevos = despues.avisos.filter(a => !antes.avisos.includes(a));
  if (despues.error || nuevos.length) {
    restaurar();
    console.log(despues.error ? `La app no la carga: ${JSON.stringify(despues.error)}` : `Avisos nuevos de la app:\n  ${nuevos.join('\n  ')}`);
    console.log('NO SE HA METIDO: la lección vuelve a estar como antes.');
    process.exit(1);
  }
  console.log(`${id} metida. Ejercicios: ${despues.ids.length} (${despues.ids.filter(i => !antes.ids.includes(i)).length} con identificador nuevo).`);
}

/** Carga la lección con el código de la app, en un proceso aparte (la app guarda caché). */
async function cargarConLaApp() {
  const guion = `
    import { readFileSync, existsSync } from 'node:fs';
    import { join } from 'node:path';
    import { pathToFileURL } from 'node:url';
    const RAIZ = ${JSON.stringify(RAIZ)};
    const almacen = new Map([['idiomas-curso', ${JSON.stringify(idCurso)}], ['idiomas-ajustes', JSON.stringify({ idioma: 'en' })]]);
    const nada = () => {}; const el = () => ({ dataset: {}, style: {}, setAttribute: nada, addEventListener: nada, append: nada });
    const w = new EventTarget(); w.matchMedia = () => ({ matches: false, addEventListener: nada });
    Object.defineProperty(globalThis, 'window', { value: w, configurable: true });
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: k => almacen.get(k) ?? null, setItem: (k, v) => almacen.set(k, String(v)), removeItem: k => almacen.delete(k) } });
    Object.defineProperty(globalThis, 'navigator', { value: { languages: ['en'], language: 'en', onLine: true }, configurable: true });
    globalThis.document = { documentElement: el(), body: el(), hidden: false, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createElement: el, addEventListener: nada };
    globalThis.location = { protocol: 'http:', hash: '', origin: 'http://localhost' };
    globalThis.fetch = async url => { const a = join(RAIZ, decodeURIComponent(String(url).split('?')[0])); if (!existsSync(a)) return { ok: false, status: 404, text: async () => '' }; const t = readFileSync(a, 'utf8'); return { ok: true, status: 200, text: async () => t }; };
    await import(pathToFileURL(join(RAIZ, 'js', 'curso.js')));
    const { cargarLeccion } = await import(pathToFileURL(join(RAIZ, 'js', 'lessons.js')));
    const r = await cargarLeccion(${JSON.stringify(id)});
    process.stdout.write(JSON.stringify({ error: r.error ?? null, avisos: (r.avisos ?? []).map(String), ids: (r.leccion?.bloques ?? []).filter(b => b.id).map(b => b.id) }));
  `;
  const salida = execFileSync(process.execPath, ['--input-type=module', '-e', guion], { encoding: 'utf8' });
  return JSON.parse(salida);
}
