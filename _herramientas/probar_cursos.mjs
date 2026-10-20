// Abre una lección de cada curso en sus idiomas de interfaz (Chrome sin ventana) y avisa de lo que falla:
// errores de consola, la tarjeta de error, «[object Object]» o «@es»/«@en» a la vista, o la página en otro idioma.
//   node _herramientas/probar_cursos.mjs [puerto=8300] [lección=010]
// Necesita la app servida en http://localhost:<puerto> (la raíz del repo). Env CHROME: otro Chrome (en GitHub Actions,
// el de Linux; ver .github/workflows/comprobar.yml).
import { spawn } from 'node:child_process';
import os from 'node:os';
import fs from 'node:fs';

const puerto = process.argv[2] ?? '8300';
const leccion = process.argv[3] ?? '010';
const CURSOS = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ru', 'tr', 'nl', 'sv', 'el', 'pl', 'no', 'vi', 'id', 'da', 'ro', 'th'];
// los idiomas de cada curso, como idiomasDe en js/curso.js (los tres, menos el del propio curso)
const IDIOMAS = c => ['es', 'en', 'vi'].filter(i => i !== c);

const depuracion = 9300 + Math.floor(Math.random() * 300);
// un perfil de Chrome nuevo cada vez (y se borra al acabar): con uno viejo se colaba lo guardado en otra prueba
const perfil = fs.mkdtempSync(`${os.tmpdir()}/cdp-paglot-`);
const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${depuracion}`,
  '--window-size=1280,900', `--user-data-dir=${perfil}`, ...(process.platform === 'linux' ? ['--no-sandbox'] : []), 'about:blank']);
let lista;
for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 250)); try { lista = await (await fetch(`http://127.0.0.1:${depuracion}/json`)).json(); break; } catch {} }
const ws = new WebSocket(lista.find(x => x.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const esperas = {}; let errores = [];
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && esperas[m.id]) { esperas[m.id](m.result ?? m.error); delete esperas[m.id]; }
  if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] ?? m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) errores.push(m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 160));
});
const cdp = (method, params = {}) => new Promise(r => { esperas[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const espera = ms => new Promise(r => setTimeout(r, ms));
await cdp('Runtime.enable'); await cdp('Page.enable');

let fallos = 0;
for (const c of CURSOS) {
  for (const i of IDIOMAS(c)) {
    errores = [];
    await cdp('Page.navigate', { url: 'about:blank' });
    await espera(100);
    const previo = `try{localStorage.clear();localStorage.setItem('paglot-sin-nube','1');localStorage.setItem('idiomas-ajustes',JSON.stringify({idioma:'${i}',efectos:false,vozTutora:false}));` +
      `localStorage.setItem('idiomas-curso','${c}');localStorage.setItem('idiomas-beta-${c}','1');localStorage.setItem('idiomas-aviso-visto','1');` +
      `localStorage.setItem('idiomas-bienvenida-vista','1');localStorage.setItem('idiomas-modo-leccion','libro');sessionStorage.setItem('idiomas-abierta','1');}catch{}`;
    const { identifier } = await cdp('Page.addScriptToEvaluateOnNewDocument', { source: previo });
    const n = c === 'th' ? '002' : leccion;
    await cdp('Page.navigate', { url: `http://localhost:${puerto}/index.html#/leccion/${n}` });
    await espera(3000);
    await cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier });
    const r = await cdp('Runtime.evaluate', { returnByValue: true, expression: `({
      lang: document.documentElement.lang,
      error: !!document.querySelector('.tarjeta-error'),
      raros: (document.body.innerText.match(/\\[object Object\\]|@es|@en/g) || []).length,
      titulo: (document.querySelector('#app h2')?.textContent || '').slice(0, 40),
    })` });
    const v = r?.result?.value ?? {};
    const mal = v.lang !== i || v.error || v.raros || errores.length;
    if (mal) fallos++;
    console.log(`${mal ? '✗' : '✓'} ${c}/${i} ${n}: ${v.titulo}${v.lang !== i ? ` · idioma ${v.lang}` : ''}${v.error ? ' · TARJETA DE ERROR' : ''}` +
      `${v.raros ? ` · ${v.raros} textos raros` : ''}${errores.length ? ` · ${[...new Set(errores)].slice(0, 2).join(' | ')}` : ''}`);
  }
}
console.log(fallos ? `${fallos} con fallos.` : 'Todo bien.');
ws.close(); chrome.kill();
setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch { /* aún abierto */ } process.exit(fallos ? 1 : 0); }, 600);
