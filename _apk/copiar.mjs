// Copia la app web (la carpeta de arriba, con todos los cursos) a www/, que es lo que Capacitor mete dentro de la APK.
// Uso: node copiar.mjs
import { cpSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
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

// Lo que hay en las carpetas de la app pero la app no lee: las plantillas, scripts e informes con los que se
// escribieron los cursos (cursos/<código>/plantillas, *.py, *.md). Fuera, que solo engordan la APK.
const SOBRA = /[\\/](plantillas|__pycache__)$|\.(py|md)$/;

rmSync(destino, { recursive: true, force: true });
for (const parte of APP) cpSync(join(origen, parte), join(destino, parte), { recursive: true, filter: (r) => !SOBRA.test(r) });

// Los JSON de los cursos se guardan con sangrías para leerlos a mano; en la APK van sin espacios (mismo contenido).
// Del análisis sintáctico la app solo lee unidades → texto, funcion y partes (js/lessons.js, aplanar);
// lo demás (oracion, sujeto, nucleo) se queda en el proyecto, no en la APK.
const SINTAXIS_SOBRA = new Set(['oracion', 'sujeto', 'nucleo']);
const podarSintaxis = (v) => {
  if (Array.isArray(v)) v.forEach(podarSintaxis);
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) SINTAXIS_SOBRA.has(k) ? delete v[k] : podarSintaxis(v[k]);
};
const recorrer = (v) => {
  if (Array.isArray(v)) v.forEach(recorrer);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) k === 'sintaxis' ? podarSintaxis(x) : recorrer(x);
};
(function compactar(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) compactar(r);
    else if (e.name.endsWith('.json')) {
      const datos = JSON.parse(readFileSync(r, 'utf8'));
      recorrer(datos);
      writeFileSync(r, JSON.stringify(datos));
    }
  }
})(join(destino, 'cursos'));

// La marca de versión que en la web pone la publicación automática.
const indice = join(destino, 'index.html');
// ...y el puente con las funciones del teléfono (la voz), que se carga antes que la app.
const MODULO = '  <script type="module" src="js/app.js';
let html = readFileSync(indice, 'utf8').replaceAll('__VERSION__', String(Date.now()));
if (!html.includes(MODULO)) throw new Error('No encuentro dónde enganchar el puente en index.html');
html = html.replace(MODULO, '  <script src="puente-apk.js"></script>\n' + MODULO);
writeFileSync(indice, html);
// La CSP de index.html lleva el hash de cada <script> en línea; al poner la versión cambian (el mapa de importación
// lleva ?v=…), así que se rehacen como al publicar (_herramientas/publicar.py). Si no, la APK bloquearía el mapa.
const rehacerCsp = `import sys; sys.path.insert(0, r'${join(origen, '_herramientas')}'); from pathlib import Path; from publicar import leer, recalcular_csp; p = Path(r'${indice}'); p.write_text(recalcular_csp(leer(p))[0], encoding='utf-8', newline='\\n')`;
try { execFileSync('python', ['-c', rehacerCsp], { stdio: 'inherit' }); } catch { execFileSync('py', ['-3', '-c', rehacerCsp], { stdio: 'inherit' }); }
cpSync(join(aqui, 'puente.js'), join(destino, 'puente-apk.js'));
console.log('Copiado en', destino);
