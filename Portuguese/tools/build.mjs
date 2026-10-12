// Compilación de producción: copia la web a dist/ y marca la versión.
// La app no necesita empaquetador: es HTML, CSS y módulos JS. Este paso:
//   1. revisa el curso (falla si alguna lección tiene errores);
//   2. copia solo lo que se publica (index.html, css, js, assets, lessons, phrases, locales);
//   3. cambia «__VERSION__» por la versión (commit de git o fecha) en index.html, para que
//      el navegador descargue los archivos nuevos tras cada publicación.
// dist/ se puede subir tal cual a cualquier hosting estático (GitHub Pages, Netlify…).

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destino = path.join(raiz, 'dist');
const PUBLICAR = ['index.html', '.nojekyll', 'css', 'js', 'assets', 'lessons', 'phrases', 'locales'];

execFileSync(process.execPath, [path.join(raiz, 'tools/validar.mjs')], { stdio: 'inherit' });

let version;
try {
  version = execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: raiz, encoding: 'utf8' }).trim();
  const cambios = execFileSync('git', ['status', '--porcelain'], { cwd: raiz, encoding: 'utf8' }).trim();
  if (cambios) version += `-${Date.now().toString(36)}`;
} catch {
  version = Date.now().toString(36);
}

await rm(destino, { recursive: true, force: true });
await mkdir(destino);
for (const nombre of PUBLICAR) {
  await cp(path.join(raiz, nombre), path.join(destino, nombre), { recursive: true });
}
const indice = path.join(destino, 'index.html');
await writeFile(indice, (await readFile(indice, 'utf8')).replaceAll('__VERSION__', version));

console.log(`\ndist/ ready (version ${version}).`);
