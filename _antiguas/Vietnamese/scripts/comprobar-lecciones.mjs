// Comprueba todas las lecciones con el mismo código que usa la web (js/lecciones.js).
// Uso: node scripts/comprobar-lecciones.mjs
// - Errores (la lección no se podría mostrar): el script termina con fallo.
// - Avisos (se muestra, pero conviene arreglarlo): solo se listan.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EN_GITHUB = process.env.GITHUB_ACTIONS === 'true';

// La web pide las lecciones con fetch(); aquí las leemos del disco.
globalThis.fetch = async (ruta) => {
  try {
    const texto = await readFile(path.join(RAIZ, ruta), 'utf8');
    return { ok: true, status: 200, text: async () => texto };
  } catch {
    return { ok: false, status: 404, text: async () => '' };
  }
};

const { descubrirLecciones } = await import('../js/lecciones.js');
const lecciones = await descubrirLecciones();

// Anotación para que GitHub marque el archivo en la pestaña del commit
function anotar(nivel, id, problema) {
  if (!EN_GITHUB) return;
  const linea = problema.extracto?.linea ? `,line=${problema.extracto.linea}` : '';
  const msg = `${problema.donde}: ${problema.mensaje}`.replace(/%/g, '%25').replace(/\r?\n/g, '%0A');
  console.log(`::${nivel} file=lecciones/${id}.json${linea}::${msg}`);
}

let errores = 0;
let avisos = 0;
for (const lec of lecciones) {
  if (!lec.errores.length && !lec.avisos.length) continue;
  console.log(`\n${lec.id}.json · ${lec.titulo}`);
  for (const e of lec.errores) {
    console.log(`  ✗ ERROR  ${e.donde}: ${e.mensaje}`);
    if (e.extracto) console.log(`           ${e.extracto.linea} | ${e.extracto.texto}`);
    anotar('error', lec.id, e);
  }
  for (const a of lec.avisos) {
    console.log(`  ! aviso  ${a.donde}: ${a.mensaje}`);
    anotar('warning', lec.id, a);
  }
  errores += lec.errores.length;
  avisos += lec.avisos.length;
}

console.log(`\n${lecciones.length} lecciones comprobadas: ${errores} errores, ${avisos} avisos.`);
process.exit(errores ? 1 : 0);
