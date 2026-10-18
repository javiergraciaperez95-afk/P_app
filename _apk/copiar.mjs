// Copia la app web (../Paglot, con todos los cursos) a www/, que es lo que Capacitor mete dentro de la APK.
// Uso: node copiar.mjs
import { cpSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const aqui = dirname(fileURLToPath(import.meta.url));
const origen = join(aqui, '..', 'Paglot');
const destino = join(aqui, 'www');

// Lo que no hace falta dentro de la app: material de trabajo, servidor local y cosas de publicación web.
const FUERA = ['.nojekyll', 'sw.js', 'LEEME.txt'];

// Primero, el índice y el diccionario de cada curso al día (la app los lee al arrancar).
// (si la herramienta no está, se usan los índices que ya tiene cada curso)
const indices = join(aqui, '..', '_herramientas', 'generar_indices.mjs');
if (existsSync(indices)) execFileSync(process.execPath, [indices], { stdio: 'inherit' });
else console.log('Sin _herramientas/generar_indices.mjs: se usan los índices que ya hay en cada curso.');

rmSync(destino, { recursive: true, force: true });
cpSync(origen, destino, {
  recursive: true,
  filter: ruta => !FUERA.some(f => ruta === join(origen, f) || ruta.startsWith(join(origen, f) + sep)),
});

// La marca de versión que en la web pone la publicación automática.
const indice = join(destino, 'index.html');
// ...y el puente con las funciones del teléfono (la voz), que se carga antes que la app.
const MODULO = '  <script type="module" src="js/app.js';
let html = readFileSync(indice, 'utf8').replaceAll('__VERSION__', String(Date.now()));
if (!html.includes(MODULO)) throw new Error('No encuentro dónde enganchar el puente en index.html');
html = html.replace(MODULO, '  <script src="puente-apk.js"></script>\n' + MODULO);
writeFileSync(indice, html);
cpSync(join(aqui, 'puente.js'), join(destino, 'puente-apk.js'));
console.log('Copiado en', destino);
