// Revisa las lecciones de uno o varios cursos con el mismo revisor que usa la app (js/lessons.js → revisarLeccion).
// Uso:  node _herramientas/validar_lecciones.mjs fr          → solo francés
//       node _herramientas/validar_lecciones.mjs             → todos los cursos
// Cada curso se revisa en un proceso aparte (la app elige el curso al cargar sus módulos).
// Muestra, por curso: lecciones, avisos, errores graves y huecos en la numeración. -v enseña los avisos.
// (Un mismo identificador de ejercicio en lecciones distintas no es un problema: el progreso se guarda por lección.)

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'Idiomas');
const pedidos = process.argv.slice(2).filter(a => !a.startsWith('-'));
const detalle = process.argv.includes('-v');

if (process.env.VALIDAR_CURSO) {
  await revisarCurso(process.env.VALIDAR_CURSO);
} else {
  const todos = readdirSync(join(RAIZ, 'cursos')).filter(c => existsSync(join(RAIZ, 'cursos', c, 'lessons')));
  let malos = 0;
  for (const c of pedidos.length ? pedidos : todos) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...(detalle ? ['-v'] : [])], {
      env: { ...process.env, VALIDAR_CURSO: c }, encoding: 'utf8',
    });
    process.stdout.write(r.stdout || '');
    if (r.status) { malos += 1; process.stdout.write(r.stderr || ''); }
  }
  process.exitCode = malos ? 1 : 0;
}

async function revisarCurso(id) {
  // Lo mínimo del navegador que necesitan los módulos de la app al cargarse.
  const almacen = new Map([['idiomas-curso', id], ['idiomas-ajustes', JSON.stringify({ idioma: 'es' })]]);
  globalThis.localStorage = {
    getItem: k => (almacen.has(k) ? almacen.get(k) : null), setItem: (k, v) => almacen.set(k, String(v)),
    removeItem: k => almacen.delete(k), clear: () => almacen.clear(),
  };
  const nodoFalso = () => ({ dataset: {}, style: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, setAttribute() {}, addEventListener() {}, append() {}, querySelectorAll: () => [] });
  globalThis.window = globalThis;
  globalThis.addEventListener = () => {};
  globalThis.dispatchEvent = () => {};
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
  globalThis.document = { documentElement: nodoFalso(), body: nodoFalso(), querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, addEventListener() {}, createElement: nodoFalso };
  Object.defineProperty(globalThis, 'navigator', { value: { language: 'es-ES', languages: ['es-ES'], onLine: true }, configurable: true });

  // Las lecciones se leen del disco como si llegaran por la red: así pasan por el mismo camino que en la app.
  globalThis.fetch = async url => {
    const archivo = join(RAIZ, decodeURIComponent(String(url).split('?')[0]));
    if (!existsSync(archivo)) return { status: 404, ok: false };
    return { status: 200, ok: true, text: async () => readFileSync(archivo, 'utf8') };
  };
  const { cargarLeccion } = await import(pathToFileURL(join(RAIZ, 'js', 'lessons.js')));
  const carpeta = join(RAIZ, 'cursos', id, 'lessons');
  const numeros = readdirSync(carpeta).filter(f => /^\d{3}\.json$/.test(f)).map(f => Number(f.slice(0, 3))).sort((a, b) => a - b);
  const huecos = [];
  for (let n = 1; n <= numeros.at(-1); n++) if (!numeros.includes(n)) huecos.push(n);
  let avisos = 0, graves = 0;
  for (const n of numeros) {
    const nombre = String(n).padStart(3, '0');
    const r = await cargarLeccion(nombre);
    if (r.error) { graves += 1; console.log(`  ${id}/${nombre}: ${[r.error.titulo, ...r.error.detalles.map(d => d.codigo ?? d)].join(' · ')}`); continue; }
    const suyos = r.avisos ?? [];
    avisos += suyos.length;
    if (detalle) for (const a of suyos) console.log(`  ${id}/${nombre}: ${a}`);
  }
  console.log(`${id.padEnd(3)} ${String(numeros.length).padStart(4)} lecciones · ${avisos} avisos · ${graves} errores graves`
    + (huecos.length ? ` · HUECOS: ${huecos.slice(0, 10).join(', ')}` : ''));
  if (graves) process.exitCode = 1;
}
