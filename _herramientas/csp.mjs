// La CSP de index.html deja ejecutar solo los <script> en línea cuyo hash lleva. Al tocar uno, hay que rehacerlos:
//   node _herramientas/csp.mjs [index.html]
// (también lo usa _apk/copiar.mjs con la copia que va dentro de la APK)
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/** Devuelve el HTML con los hashes de la CSP puestos al día. */
export function rehacerCsp(html) {
  const sinComentarios = html.replace(/<!--[\s\S]*?-->/g, ''); // (un comentario puede nombrar «<script>»)
  const hashes = [...sinComentarios.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);
  return html.replace(/(script-src 'self')(?: 'sha256-[^']+')*/, `$1 ${hashes.join(' ')}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const archivo = process.argv[2] ?? new URL('../index.html', import.meta.url);
  const html = readFileSync(archivo, 'utf8');
  const nuevo = rehacerCsp(html);
  writeFileSync(archivo, nuevo);
  console.log(nuevo === html ? 'La CSP ya estaba al día.' : 'CSP puesta al día.');
}
