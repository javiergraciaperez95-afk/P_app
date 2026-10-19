// Copia la app web (la carpeta de arriba, con todos los cursos) a www/, que es lo que Capacitor mete dentro de la APK.
// Uso: node copiar.mjs
import { cpSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const aqui = dirname(fileURLToPath(import.meta.url));
const origen = join(aqui, '..');
const destino = join(aqui, 'www');

// Solo lo que es la app; lo demás (el proyecto de la APK, herramientas, notas, git…) se queda fuera.
const APP = ['index.html', 'manifest.webmanifest', 'assets', 'css', 'cursos', 'js', 'juegos'];

// Primero, el índice y el diccionario de cada curso al día (la app los lee al arrancar).
// (si la herramienta no está, se usan los índices que ya tiene cada curso)
const indices = join(aqui, '..', '_herramientas', 'generar_indices.mjs');
if (existsSync(indices)) execFileSync(process.execPath, [indices], { stdio: 'inherit' });
else console.log('Sin _herramientas/generar_indices.mjs: se usan los índices que ya hay en cada curso.');

rmSync(destino, { recursive: true, force: true });
for (const parte of APP) cpSync(join(origen, parte), join(destino, parte), { recursive: true });

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
