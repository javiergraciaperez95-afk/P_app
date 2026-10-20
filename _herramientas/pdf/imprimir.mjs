// Pasa páginas HTML a PDF con Chrome sin ventana (Page.printToPDF), con las letras y colores de la app.
//   node _herramientas/pdf/imprimir.mjs <lista.json>      (CAPTURA=1: también un .png al lado de cada PDF)
// lista.json: [{ "html": "_herramientas/pdf/salida/x.html", "pdf": "simulacros/ko/es/A1-muestra.pdf" }, …]
// Las páginas se abren desde el servidor local (localhost:PUERTO, 8300 por defecto) para que carguen /assets/fonts.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const lista = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const puerto = 9000 + Math.floor(Math.random() * 400);
const perfil = fs.mkdtempSync(`${os.tmpdir()}/cdp-paglot-pdf-`);
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, 'about:blank']);
let pestanas;
for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 250)); try { pestanas = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json(); break; } catch {} }
const ws = new WebSocket(pestanas.find(x => x.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const esperas = {};
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && esperas[m.id]) esperas[m.id](m.result ?? m.error); });
const cdp = (method, params = {}) => new Promise(r => { esperas[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
await cdp('Page.enable');
await cdp('Runtime.enable');

for (const { html, pdf } of lista) {
  const url = `http://localhost:${process.env.PUERTO ?? 8300}/${html.replace(/\\/g, '/')}`;
  await cdp('Page.navigate', { url });
  // que estén las letras y las imágenes antes de imprimir
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 150));
    const listo = await cdp('Runtime.evaluate', { expression: "document.readyState === 'complete' && document.fonts.status === 'loaded'", returnByValue: true });
    if (listo?.result?.value) break;
  }
  await new Promise(r => setTimeout(r, 200));
  const r = await cdp('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 });
  if (!r?.data) { console.error('FALLO', html, JSON.stringify(r)); continue; }
  fs.mkdirSync(path.dirname(pdf), { recursive: true });
  fs.writeFileSync(pdf, Buffer.from(r.data, 'base64'));
  // con CAPTURA=1, además una imagen de todas las hojas (para revisarlas sin abrir el PDF)
  if (process.env.CAPTURA) {
    const alto = (await cdp('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true })).result.value;
    await cdp('Emulation.setDeviceMetricsOverride', { width: 794, height: alto, deviceScaleFactor: 1, mobile: false });
    const foto = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(pdf.replace(/\.pdf$/, '.png'), Buffer.from(foto.data, 'base64'));
    await cdp('Emulation.clearDeviceMetricsOverride');
  }
  console.log('PDF', pdf, Math.round(fs.statSync(pdf).size / 1024), 'KB');
}
ws.close();
chrome.kill();
try { fs.rmSync(perfil, { recursive: true, force: true }); } catch {}
