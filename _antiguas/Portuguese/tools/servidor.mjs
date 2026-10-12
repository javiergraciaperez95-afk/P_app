// Servidor local muy sencillo (sin dependencias) para probar la web.
//   npm start                  → sirve la carpeta del proyecto en http://localhost:8000/
//   npm run preview            → sirve dist/ (lo que genera npm run build)
//   PORT=9000 npm start        → otro puerto
// En Windows también se puede usar start-server.cmd (PowerShell, sin instalar nada).

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raizProyecto = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const raiz = path.resolve(raizProyecto, process.argv[2] ?? '.');
const puerto = Number(process.env.PORT ?? 8000);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
};

const servidor = createServer(async (peticion, respuesta) => {
  try {
    const ruta = decodeURIComponent(new URL(peticion.url, 'http://localhost').pathname);
    let archivo = path.resolve(raiz, `.${ruta}`);
    // Nada fuera de la carpeta servida.
    if (archivo !== raiz && !archivo.startsWith(raiz + path.sep)) {
      respuesta.writeHead(403).end('403');
      return;
    }
    if ((await stat(archivo).catch(() => null))?.isDirectory()) archivo = path.join(archivo, 'index.html');
    const contenido = await readFile(archivo);
    respuesta.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    respuesta.end(contenido);
  } catch {
    respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not found');
  }
});

servidor.listen(puerto, () => {
  console.log(`Olá! Learn Portuguese → http://localhost:${puerto}/  (${path.relative(raizProyecto, raiz) || '.'})`);
});
