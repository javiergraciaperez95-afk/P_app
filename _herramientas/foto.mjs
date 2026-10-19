// Captura de una pantalla de Paglot en Chrome sin ventana (la app servida en localhost:PUERTO, 8300 por defecto).
// node _herramientas/foto.mjs <ruta> <salida.png> [ancho] [alto] [js antes] [idioma] [espera ms]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const [ruta, salida, ancho = '1200', alto = '900', js = '', idioma = 'en', esperaMs = '3000'] = process.argv.slice(2);
const puerto = 9000 + Math.floor(Math.random() * 400);
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${puerto}`, `--window-size=${ancho},${alto}`, '--hide-scrollbars', `--user-data-dir=${process.env.TEMP}/cdp-foto-${puerto}`, 'about:blank']);
let lista;
for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 250)); try { lista = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json(); break; } catch {} }
const ws = new WebSocket(lista.find(x => x.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const esperas = {}; const errores = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && esperas[m.id]) esperas[m.id](m.result ?? m.error);
  // las violaciones de la CSP no salen por la consola sino por el registro del navegador
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errores.push(m.params.entry.text);
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) errores.push(m.params.args.map(a => a.value ?? a.description).join(' '));
});
const cdp = (method, params = {}) => new Promise(r => { esperas[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
await cdp('Runtime.enable'); await cdp('Page.enable'); await cdp('Log.enable');
const movil = +ancho < 768;
await cdp('Emulation.setDeviceMetricsOverride', { width: +ancho, height: +alto, deviceScaleFactor: 1, mobile: movil });
const previo = process.env.PREVIO ?? '';
await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{if(!sessionStorage.getItem('idiomas-abierta'))sessionStorage.setItem('idiomas-abierta','1');localStorage.setItem('paglot-sin-nube','1');localStorage.setItem('idiomas-ajustes',JSON.stringify({idioma:'${idioma}',efectos:false,vozTutora:false}));${previo}}catch{}` });
await cdp('Page.navigate', { url: `http://localhost:${process.env.PUERTO ?? 8300}/index.html#/${ruta}` });
await new Promise(r => setTimeout(r, +esperaMs));
if (js) { const r = await cdp('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true, replMode: true }); console.log('js:', JSON.stringify(r?.result?.value ?? r?.exceptionDetails?.exception?.description ?? r)); await new Promise(r2 => setTimeout(r2, 1200)); }
const f = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(salida, Buffer.from(f.data, 'base64'));
if (errores.length) console.log('errores:', [...new Set(errores)].slice(0, 5).join('\n'));
ws.close(); chrome.kill(); process.exit(0);
