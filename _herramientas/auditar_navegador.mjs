// Auditoría en Chrome sin ventana de todas las pantallas de Paglot (19-10-2026).
//   node _herramientas/auditar_navegador.mjs [puerto=8300]
// Necesita la app servida en http://localhost:<puerto> (la raíz del repo). Para cada tamaño (móvil, móvil pequeño,
// tableta, escritorio) y cada ruta mide: errores de consola, diapositivas del móvil y cuánto se encoge cada una,
// desbordes de lado, imágenes rotas, botones sin nombre, nodos, peticiones y peso. En unas lecciones de varios cursos
// compara los bloques de la lección con los pasos del modo juego. Escribe _notas/auditoria/navegador.json.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const puerto = process.argv[2] ?? '8300';
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const depuracion = 9300 + Math.floor(Math.random() * 300);
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${depuracion}`,
  '--window-size=1280,900', '--hide-scrollbars', `--user-data-dir=${process.env.TEMP}/cdp-auditoria-${depuracion}`, 'about:blank']);
let lista;
for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 250)); try { lista = await (await fetch(`http://127.0.0.1:${depuracion}/json`)).json(); break; } catch {} }
const ws = new WebSocket(lista.find(x => x.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const esperas = {}; let errores = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && esperas[m.id]) { esperas[m.id](m.result ?? m.error); delete esperas[m.id]; }
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] ?? m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) errores.push(m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 200));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errores.push(`${m.params.entry.text} ${m.params.entry.url ?? ''}`.slice(0, 200));
});
const cdp = (method, params = {}) => new Promise(r => { esperas[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const evaluar = async expr => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, replMode: true });
  return r?.result?.value ?? { error: r?.exceptionDetails?.exception?.description ?? JSON.stringify(r).slice(0, 200) };
};
await cdp('Runtime.enable'); await cdp('Page.enable'); await cdp('Log.enable'); await cdp('Network.enable');
await cdp('Network.setCacheDisabled', { cacheDisabled: true });
const espera = ms => new Promise(r => setTimeout(r, ms));

const GENERALES = ['inicio', 'entrar', 'precios', 'sobre', 'social', 'contacto', 'producto', 'escuelas', 'empresas', 'regala-max', 'tienda',
  'guias', 'faq', 'laboratorio', 'idiomas', 'creditos', 'legal', 'bienvenida', 'no-existe'];
const CURSO = ['lecciones', 'leccion/001', 'leccion/150', 'practica', 'frases', 'cuaderno', 'repaso', 'reto', 'perfil'];
const TAMANOS = [
  { nombre: 'movil', ancho: 390, alto: 844, movil: true },
  { nombre: 'movil-pequeno', ancho: 322, alto: 645, movil: true },
  { nombre: 'tableta', ancho: 768, alto: 1024, movil: true },
  { nombre: 'escritorio', ancho: 1280, alto: 900, movil: false },
];

// lo que se mide en cada pantalla, ya pintada
const MEDIR = `{
  const app = document.getElementById('app');
  const raiz = app.childElementCount > 1 ? app : app.firstElementChild;
  const doc = document.documentElement;
  const res = performance.getEntriesByType('resource');
  const visibles = [...document.querySelectorAll('button, a[href], [role=button]')].filter(b => b.offsetParent !== null);
  const sinNombre = visibles.filter(b => !(b.getAttribute('aria-label') || b.textContent.trim() || b.title || b.querySelector('img[alt]:not([alt=""])'))).length;
  const imgsRotas = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src'));
  const texto = document.body.innerText;
  const clavesSueltas = [...new Set(texto.match(/\\b[a-z]{3,}\\.[a-z][A-Za-z]{2,}(\\.[a-zA-Z]+)?\\b/g) ?? [])].filter(k => !/\\.(js|json|com|org|es|png|svg|css|html)$/.test(k)).slice(0, 8);
  const out = {
    titulo: document.title, hash: location.hash,
    errorVista: !!document.querySelector('.tarjeta-error'),
    nodos: document.getElementsByTagName('*').length,
    peticiones: res.length,
    kb: Math.round(res.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0) / 1024),
    js: res.filter(r => /\\.m?js(\\?|$)/.test(r.name)).length,
    css: res.filter(r => /\\.css(\\?|$)/.test(r.name)).length,
    json: res.filter(r => /\\.json(\\?|$)/.test(r.name)).length,
    cargaMs: Math.round(performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0),
    desbordeLado: doc.scrollWidth > innerWidth + 1 ? doc.scrollWidth - innerWidth : 0,
    altoPagina: doc.scrollHeight, alto: innerHeight,
    sinNombre, imgsRotas, clavesSueltas,
    pmActivo: doc.classList.contains('pm-activo'),
  };
  const nav = document.querySelector('.pm-nav');
  if (nav && !nav.hidden) {
    const n = document.querySelectorAll('.pm-puntos i').length || Number((document.querySelector('.pm-puntos b')?.textContent || '0/0').split('/')[1]) || 0;
    out.diapositivas = n;
    const zooms = [];
    for (let i = 0; i < Math.min(n, 14); i++) {
      zooms.push(Number(raiz?.style.zoom || 1));
      document.querySelector('.pm-alante')?.click();
      await new Promise(r => setTimeout(r, 450));
    }
    out.zooms = zooms;
    out.zoomMin = Math.min(...zooms);
  }
  out;
}`;

const resultado = { fecha: new Date().toISOString(), pantallas: {}, lecciones: {} };
async function abrir(ruta, previo, tam) {
  errores = [];
  await cdp('Emulation.setDeviceMetricsOverride', { width: tam.ancho, height: tam.alto, deviceScaleFactor: 1, mobile: tam.movil });
  await cdp('Page.navigate', { url: 'about:blank' });
  await espera(150);
  const { identifier } = await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `try{localStorage.clear();sessionStorage.clear();localStorage.setItem('paglot-sin-nube','1');${previo}}catch{}` });
  await cdp('Page.navigate', { url: `http://localhost:${puerto}/index.html#/${ruta}` });
  await espera(3200);
  await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier });
}
const BASE = "localStorage.setItem('idiomas-ajustes',JSON.stringify({idioma:'en',efectos:false,vozTutora:false}));localStorage.setItem('idiomas-aviso-visto','1');localStorage.setItem('idiomas-bienvenida-vista','1');sessionStorage.setItem('idiomas-abierta','1');";
const CON_CURSO = c => `${BASE}localStorage.setItem('idiomas-curso','${c}');localStorage.setItem('idiomas-beta-${c}','1');`;

for (const tam of TAMANOS) {
  for (const ruta of [...GENERALES, ...CURSO]) {
    await abrir(ruta, CON_CURSO('es'), tam);
    const m = await evaluar(MEDIR);
    m.errores = [...new Set(errores)].slice(0, 6);
    (resultado.pantallas[ruta] ??= {})[tam.nombre] = m;
    const z = m.zoomMin !== undefined ? ` diap=${m.diapositivas} zmin=${m.zoomMin}` : '';
    console.log(`${tam.nombre.padEnd(13)} ${ruta.padEnd(12)} ${m.error ? 'ERROR ' + m.error.slice(0, 80) : `nodos=${m.nodos} pet=${m.peticiones} kb=${m.kb}${z} lado=${m.desbordeLado} alto=${m.altoPagina}/${m.alto} sinNombre=${m.sinNombre} err=${m.errores.length}`}`);
  }
}

// lecciones: bloques de la lección frente a pasos del modo juego (los bloques sin juego se saltan)
const CONTAR = `{
  await new Promise(r => setTimeout(r, 800));
  const pasos = document.querySelectorAll('.jg-camino > *, .jg-ruta li, .jg-pasos > *').length;
  const cuenta = document.querySelector('.jg-ruta-lado')?.textContent?.trim();
  ({ pasos, cuenta, modo: document.querySelector('.jg') ? 'juego' : (document.querySelector('.libro, .leccion-libro, article') ? 'libro' : '?'), titulo: document.title });
}`;
for (const c of ['es', 'fr', 'de', 'ja', 'vi', 'en', 'zh', 'th']) {
  for (const n of ['001', '010', '100']) {
    const f = path.join(raiz, 'cursos', c, 'lessons', `${n}.json`);
    if (!fs.existsSync(f)) continue;
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    const tipos = {}; for (const b of d.bloques ?? []) tipos[b.tipo] = (tipos[b.tipo] ?? 0) + 1;
    await abrir(`leccion/${n}`, `${CON_CURSO(c)}localStorage.setItem('idiomas-modo-leccion','juego');`, TAMANOS[3]);
    const m = await evaluar(CONTAR);
    resultado.lecciones[`${c}/${n}`] = { bloques: (d.bloques ?? []).length, tipos, ...m, errores: [...new Set(errores)].slice(0, 4) };
    console.log(`leccion ${c}/${n}: bloques=${(d.bloques ?? []).length} pasos=${m.pasos} ${m.cuenta ?? ''} modo=${m.modo} tipos=${JSON.stringify(tipos)}`);
  }
}

fs.mkdirSync(path.join(raiz, '_notas', 'auditoria'), { recursive: true });
fs.writeFileSync(path.join(raiz, '_notas', 'auditoria', 'navegador.json'), JSON.stringify(resultado, null, 1));
console.log('Fin.');
ws.close(); chrome.kill(); process.exit(0);
