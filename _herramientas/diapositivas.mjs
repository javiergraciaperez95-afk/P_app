// Hoja de contactos de una pantalla del móvil: captura cada diapositiva (Chrome sin ventana) y las junta en una imagen.
//   node _herramientas/diapositivas.mjs <ruta sin #/> <salida.png> [ancho=390] [alto=844] [idioma=es]
// Env PUERTO (8300 por defecto) y PREVIO (JS antes de cargar, p. ej. para elegir curso). Por cada diapositiva dice el
// zoom (1 = no se encoge) y cuánto hueco queda debajo del contenido.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const [ruta, salida, ancho = '390', alto = '844', idioma = 'es'] = process.argv.slice(2);
const puerto = 9000 + Math.floor(Math.random() * 400);
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${puerto}`,
  '--hide-scrollbars', `--user-data-dir=${process.env.TEMP}/cdp-diap-${puerto}`, 'about:blank']);
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
});
const cdp = (method, params = {}) => new Promise(r => { esperas[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const espera = ms => new Promise(r => setTimeout(r, ms));
const valor = async expr => (await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }))?.result?.value;
await cdp('Runtime.enable'); await cdp('Page.enable'); await cdp('Log.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: +ancho, height: +alto, deviceScaleFactor: 1, mobile: true });
await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{sessionStorage.setItem('idiomas-abierta','1');localStorage.setItem('idiomas-aviso-visto','1');localStorage.setItem('idiomas-bienvenida-vista','1');localStorage.setItem('idiomas-ajustes',JSON.stringify({idioma:'${idioma}',efectos:false,vozTutora:false}));${process.env.PREVIO ?? ''}}catch{}` });
await cdp('Page.navigate', { url: `http://localhost:${process.env.PUERTO ?? 8300}/index.html#/${ruta}` });
await espera(3500);

const total = (await valor(`document.querySelectorAll('.pm-puntos i').length || Number((document.querySelector('.pm-puntos b')?.textContent || '1/1').split('/')[1]) || 1`)) || 1;
const fotos = [];
for (let i = 0; i < Math.min(total, 30); i++) {
  const m = await valor(`(() => {
    const app = document.getElementById('app'); const nav = document.querySelector('.pm-nav');
    const visibles = [...app.querySelectorAll('*')].filter(n => n.offsetParent && n.getBoundingClientRect().height > 0);
    const fondo = Math.max(0, ...visibles.map(n => n.getBoundingClientRect().bottom));
    const tope = nav && !nav.hidden ? nav.getBoundingClientRect().top : innerHeight;
    return { zoom: Number(app.style.zoom || (app.firstElementChild?.style.zoom) || 1), hueco: Math.round(tope - fondo) };
  })()`);
  const f = await cdp('Page.captureScreenshot', { format: 'png' });
  fotos.push(f.data);
  console.log(`diapositiva ${i + 1}/${total}: zoom ${m?.zoom} · hueco abajo ${m?.hueco}px`);
  await valor(`document.querySelector('.pm-alante')?.click()`);
  await espera(700);
}

// la hoja: todas en filas de 6, a la mitad de tamaño
const columnas = Math.min(6, fotos.length);
const filas = Math.ceil(fotos.length / columnas);
const w = Math.round(+ancho / 2), h = Math.round(+alto / 2);
await cdp('Emulation.setDeviceMetricsOverride', { width: columnas * (w + 8) + 8, height: filas * (h + 26) + 8, deviceScaleFactor: 1, mobile: false });
await cdp('Page.navigate', { url: 'about:blank' });
await espera(300);
await valor(`document.body.style.cssText='margin:0;padding:4px;background:#222;display:grid;grid-template-columns:repeat(${columnas},${w + 8}px);font:12px sans-serif;color:#eee';
  document.body.innerHTML = ${JSON.stringify(fotos)}.map((d, i) => '<div style="padding:4px"><div>' + (i + 1) + '</div><img width="${w}" height="${h}" src="data:image/png;base64,' + d + '"></div>').join(''); true`);
await espera(500);
const hoja = await cdp('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(salida, Buffer.from(hoja.data, 'base64'));
if (errores.length) console.log('errores:', [...new Set(errores)].slice(0, 5).join('\n'));
ws.close(); chrome.kill(); process.exit(0);
