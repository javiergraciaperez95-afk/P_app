// Copia la app web (la carpeta de arriba) a www/, que es lo que Capacitor mete dentro de la APK. Solo lo que la app
// usa: el curso de español explicado en vietnamita, los datos del CCSE y del DELE, el código y los estilos.
// Uso: node copiar.mjs
import { cpSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rehacerCsp } from '../_herramientas/csp.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const origen = join(aqui, '..');
const destino = join(aqui, 'www');

// Lo que va dentro: carpetas enteras y archivos sueltos.
const APP = ['index.html', 'css', 'js', 'juegos', 'datos', 'cursos/es/vi', 'cursos/es/juegos', 'cursos/es/phrases', 'cursos/es/tutora.js',
  'assets/fonts', 'assets/logo.svg', 'assets/favicon.svg', 'assets/favicon-32.png', 'assets/apple-touch-icon.png', 'assets/icono-192.png',
  'assets/icono-512.png', 'assets/icono-512-maskable.png', 'manifest.webmanifest'];
// y el dibujo de las compañeras de Lucía (salen en los minijuegos)
for (const id of readdirSync(join(origen, 'cursos'))) {
  if (id !== 'es' && statSync(join(origen, 'cursos', id)).isDirectory()) APP.push(`cursos/${id}/tutora.js`);
}
// lo que nunca va: los restos de las herramientas con las que se escribieron los cursos
const SOBRA = /[\\/](plantillas|__pycache__)([\\/]|$)|\.(py|md|map)$/;

rmSync(destino, { recursive: true, force: true });
for (const parte of APP) {
  mkdirSync(dirname(join(destino, parte)), { recursive: true });
  cpSync(join(origen, parte), join(destino, parte), { recursive: true, filter: r => !SOBRA.test(r) });
}

// Los JSON se guardan con sangrías para leerlos a mano; en la APK van sin espacios (mismo contenido). Del análisis
// sintáctico la app solo lee unidades → texto, funcion y partes: lo demás (oracion, sujeto, nucleo) se queda fuera.
const SINTAXIS_SOBRA = new Set(['oracion', 'sujeto', 'nucleo']);
const podarSintaxis = v => {
  if (Array.isArray(v)) v.forEach(podarSintaxis);
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) SINTAXIS_SOBRA.has(k) ? delete v[k] : podarSintaxis(v[k]);
};
const recorrer = v => {
  if (Array.isArray(v)) v.forEach(recorrer);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) k === 'sintaxis' ? podarSintaxis(x) : recorrer(x);
};
let antes = 0;
let despues = 0;
(function compactar(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) compactar(r);
    else if (e.name.endsWith('.json')) {
      const texto = readFileSync(r, 'utf8');
      const datos = JSON.parse(texto.replace(/^﻿/, ''));
      recorrer(datos);
      const nuevo = JSON.stringify(datos);
      antes += Buffer.byteLength(texto);
      despues += Buffer.byteLength(nuevo);
      writeFileSync(r, nuevo);
    }
  }
})(destino);

// El puente con el teléfono (la voz) se carga antes que la app; la CSP se rehace con los hashes de la copia.
const indice = join(destino, 'index.html');
const MODULO = '  <script type="module" src="js/app.js">';
let html = readFileSync(indice, 'utf8');
if (!html.includes(MODULO)) throw new Error('No encuentro dónde enganchar el puente en index.html');
html = html.replace(MODULO, `  <script src="puente-apk.js"></script>\n${MODULO}`);
writeFileSync(indice, rehacerCsp(html));
cpSync(join(aqui, 'puente.js'), join(destino, 'puente-apk.js'));

// cuánto ocupa
let total = 0;
let archivos = 0;
(function medir(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) medir(r);
    else { total += statSync(r).size; archivos += 1; }
  }
})(destino);
console.log(`Copiado en ${relative(origen, destino)}: ${archivos} archivos, ${(total / 1048576).toFixed(1)} MB`
  + ` (los JSON, de ${(antes / 1048576).toFixed(1)} a ${(despues / 1048576).toFixed(1)} MB)`);
