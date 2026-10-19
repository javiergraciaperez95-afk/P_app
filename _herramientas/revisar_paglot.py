"""Revisión de la carpeta Paglot para el informe (18-10-2026).

    python _herramientas/revisar_paglot.py [--sin-navegador]

1. Estática: rutas, vistas, imports que no existen, textos que faltan (en / vi), contenido de cada curso.
2. En Chrome sin ventana (http://localhost:8300, la carpeta Paglot servida con «paglot-nueva»), con el tamaño de
   un móvil (390 × 844): cuánto mide cada pantalla (cuántas «diapositivas» haría falta), errores de consola,
   desbordes de lado y, en una lección, cuánto mide cada paso del modo juego.
Escribe el resultado en _notas/revision_paglot.json (lo usa el informe en PDF).
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
APP = RAIZ
PUERTO = 8300
SALIDA = RAIZ / '_notas' / 'revision_paglot.json'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

IDIOMAS_CONOCIDOS = {'en', 'es', 'vi', 'zh', 'pt', 'fr', 'ja', 'it', 'ko', 'ru', 'de', 'tes'}
informe = {'fecha': time.strftime('%d-%m-%Y %H:%M')}


# ----------------------------------------------------------------- 1. Estática
def estatica():
    js = list((APP / 'js').rglob('*.js')) + list((APP / 'juegos').rglob('*.js'))
    # imports que apuntan a archivos que no existen
    rotos = []
    for f in js:
        texto = f.read_text(encoding='utf-8', errors='replace')
        for m in re.finditer(r"from '(\.[^']+)'", texto):
            destino = (f.parent / m.group(1)).resolve()
            if not destino.exists():
                rotos.append(f'{f.relative_to(APP)} → {m.group(1)}')
    # textos: claves usadas con t('…') frente a las definidas
    usadas = set()
    for f in js:
        usadas |= set(re.findall(r"\bt\('([a-zA-Z0-9_.\-]+)'", f.read_text(encoding='utf-8', errors='replace')))
    definidas = {}
    for idioma in ('en', 'vi'):
        texto = (APP / 'js' / 'i18n' / f'{idioma}.js').read_text(encoding='utf-8')
        definidas[idioma] = set(re.findall(r"^\s*'([^']+)'\s*:", texto, re.M))
    # rutas de app.js
    app = (APP / 'js' / 'app.js').read_text(encoding='utf-8')
    generales = re.findall(r"^\s*'?([a-z\-]+)'?: \{ (?:titulo|pintar)", app, re.M)
    del_curso = sorted(set(re.findall(r"seccion === '([a-z]+)'", app)))
    paginadas = re.search(r"PAGINADAS = new Set\(\[([^\]]+)\]", app)
    vistas = sorted(p.name for p in (APP / 'js' / 'vistas').glob('*.js'))
    juegos = sorted(p.stem for p in (APP / 'juegos').glob('*.js') if p.stem not in ('motor', 'catalogo', 'lista', 'ayuda-trozos', 'ejercicio'))
    css = sorted(p.name for p in (APP / 'css').glob('*.css'))
    return {
        'imports_rotos': rotos,
        'claves_usadas': len(usadas),
        'claves_en': len(definidas['en']), 'claves_vi': len(definidas['vi']),
        'faltan_en': sorted(k for k in usadas if k not in definidas['en'] and not k.endswith('.'))[:80],
        'faltan_vi': sorted(k for k in definidas['en'] if k not in definidas['vi'])[:80],
        'n_faltan_vi': len([k for k in definidas['en'] if k not in definidas['vi']]),
        'rutas_generales': generales,
        'rutas_curso': del_curso,
        'paginadas_movil': [x.strip().strip("'") for x in paginadas.group(1).split(',')] if paginadas else [],
        'vistas': vistas, 'juegos': juegos, 'css': css,
        'lineas_js': sum(len(f.read_text(encoding='utf-8', errors='replace').splitlines()) for f in js),
    }


def cursos():
    catalogo = (APP / 'js' / 'cursos.js').read_text(encoding='utf-8')
    ids = re.findall(r'"id": "([a-z]{2})"', catalogo)
    salida = []
    for cid in ids:
        base = APP / 'cursos' / cid
        lecciones = sorted((base / 'lessons').glob('[0-9][0-9][0-9].json'))
        esquema2 = con_juego = 0
        idiomas_trad = set()
        for f in lecciones:
            try:
                l = json.loads(f.read_text(encoding='utf-8'))
            except Exception:
                continue
            if l.get('esquema') == 2:
                esquema2 += 1
            tipos = {('texto' if b.get('esTexto') else b.get('tipo')) for b in l.get('bloques', [])}
            if {'dialogo', 'vocabulario', 'texto'} <= tipos:
                con_juego += 1
            # en qué idiomas viene explicado: claves de dos letras en los textos ({ "es": …, "en": … }) y titulo_xx
            def recorrer(x):
                if isinstance(x, dict):
                    for k, v in x.items():
                        if k in IDIOMAS_CONOCIDOS and isinstance(v, str):
                            idiomas_trad.add(k)
                        m = re.fullmatch(r'titulo_([a-z]{2})', k)
                        if m:
                            idiomas_trad.add(m.group(1))
                        recorrer(v)
                elif isinstance(x, list):
                    for v in x:
                        recorrer(v)
            if f.name in ('001.json', '050.json', '150.json'):
                recorrer(l)
        trad = base / 'traducciones'
        if trad.exists():
            idiomas_trad |= {p.name for p in trad.iterdir() if p.is_dir()}
        salida.append({
            'id': cid,
            'lecciones': len(lecciones),
            'esquema2': esquema2,
            'con_modo_juego': con_juego,
            'traducciones': sorted(idiomas_trad),
            'frases': (base / 'phrases' / 'frases.json').exists(),
            'indice': (base / 'indice' / 'lecciones.json').exists(),
            'tutora': (base / 'tutora.js').exists(),
            'guiones_juego': len(list((base / 'juegos').glob('[0-9]*.json'))) if (base / 'juegos').exists() else 0,
        })
    return salida


# ----------------------------------------------------------------- 2. En Chrome
class Cdp:
    def __init__(self, ancho, alto):
        import websocket  # websocket-client
        self.puerto = 9800 + int(time.time()) % 150
        perfil = Path(os.environ.get('TEMP', '.')) / f'cdp-py-{self.puerto}'
        self.chrome = subprocess.Popen([CHROME, '--headless=new', f'--remote-debugging-port={self.puerto}',
                                        f'--window-size={ancho},{alto}', '--hide-scrollbars', f'--user-data-dir={perfil}', 'about:blank'])
        for _ in range(60):
            time.sleep(0.25)
            try:
                lista = json.load(urllib.request.urlopen(f'http://127.0.0.1:{self.puerto}/json'))
                break
            except Exception:
                continue
        pagina = next(x for x in lista if x['type'] == 'page')
        self.ws = websocket.create_connection(pagina['webSocketDebuggerUrl'], timeout=30, suppress_origin=True)
        self.n = 0
        self.errores = []
        self.manda('Runtime.enable'); self.manda('Page.enable'); self.manda('Network.enable')
        self.manda('Emulation.setDeviceMetricsOverride', {'width': ancho, 'height': alto, 'deviceScaleFactor': 1, 'mobile': ancho < 768})

    def manda(self, metodo, params=None):
        self.n += 1
        mio = self.n
        self.ws.send(json.dumps({'id': mio, 'method': metodo, 'params': params or {}}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get('id') == mio:
                return m.get('result', {})
            self._suceso(m)

    def _suceso(self, m):
        metodo = m.get('method')
        p = m.get('params', {})
        if metodo == 'Runtime.exceptionThrown':
            d = p['exceptionDetails']
            self.errores.append((d.get('exception', {}).get('description') or d.get('text', '')).split('\n')[0][:160])
        elif metodo == 'Runtime.consoleAPICalled' and p.get('type') in ('error', 'warning'):
            texto = ' '.join(str(a.get('value', a.get('description', ''))) for a in p.get('args', []))[:160]
            if 'Supabase' not in texto:
                self.errores.append(texto)
        elif metodo == 'Network.responseReceived':
            r = p['response']
            if r['status'] >= 400 and 'supabase.co' not in r['url']:
                self.errores.append(f"{r['status']} {r['url'].replace(f'http://localhost:{PUERTO}/', '')}")

    def js(self, expr):
        r = self.manda('Runtime.evaluate', {'expression': expr, 'awaitPromise': True, 'returnByValue': True, 'replMode': True})
        return r.get('result', {}).get('value')

    def espera(self, s):
        fin = time.time() + s
        self.ws.settimeout(0.2)
        while time.time() < fin:
            try:
                self._suceso(json.loads(self.ws.recv()))
            except Exception:
                pass
        self.ws.settimeout(30)

    def cerrar(self):
        try:
            self.ws.close()
        finally:
            self.chrome.kill()


MEDIR = """(() => {
  const d = document.documentElement;
  const alto = Math.max(d.scrollHeight, document.body.scrollHeight);
  return { titulo: document.title, alto, ventana: innerHeight, pantallas: +(alto / innerHeight).toFixed(2),
           desborda: d.scrollWidth > innerWidth + 1 ? d.scrollWidth : 0,
           paginada: d.classList.contains('pm-activo'), paginas: document.querySelectorAll('.pm-puntos > *').length };
})()"""


def navegador():
    resultado = {'sin_curso': [], 'curso_es': [], 'curso_fr': [], 'pasos_juego': []}
    generales = ['inicio', 'idiomas', 'entrar', 'precios', 'sobre', 'social', 'contacto', 'producto', 'escuelas', 'empresas',
                 'regala-max', 'tienda', 'guias', 'faq', 'laboratorio', 'creditos', 'legal', 'no-existe']
    del_curso = ['inicio', 'bienvenida', 'lecciones', 'leccion/001', 'practica', 'frases', 'cuaderno', 'repaso', 'reto', 'perfil', 'entrar', 'precios']
    for clave_curso, rutas, destino in ((None, generales, 'sin_curso'), ('es', del_curso, 'curso_es'), ('fr', del_curso, 'curso_fr')):
        c = Cdp(390, 844)
        previo = "sessionStorage.setItem('idiomas-abierta','1');localStorage.setItem('idiomas-ajustes',JSON.stringify({idioma:'en',efectos:false,vozTutora:false}));"
        if clave_curso:
            previo += f"localStorage.setItem('idiomas-curso','{clave_curso}');localStorage.setItem('idiomas-beta-{clave_curso}','1');"
        c.manda('Page.addScriptToEvaluateOnNewDocument', {'source': f'try{{{previo}}}catch{{}}'})
        c.manda('Page.navigate', {'url': f'http://localhost:{PUERTO}/index.html'})
        c.espera(4)
        for r in rutas:
            c.errores = []
            c.js(f"location.hash = '#/{r}'; 1")
            c.espera(2.6)
            medida = c.js(MEDIR) or {}
            medida.update({'ruta': r, 'errores': sorted(set(c.errores))[:4]})
            resultado[destino].append(medida)
            print(f"  {destino:9} {r:13} {medida.get('pantallas')} pantallas {'· PAGINADA' if medida.get('paginada') else ''} {'· ERRORES ' + str(medida['errores']) if medida['errores'] else ''}", flush=True)
        c.cerrar()

    # una lección de español en modo juego: cuánto mide cada paso en el móvil
    c = Cdp(390, 844)
    c.manda('Page.addScriptToEvaluateOnNewDocument', {'source': "try{sessionStorage.setItem('idiomas-abierta','1');localStorage.setItem('idiomas-curso','es');localStorage.setItem('idiomas-ajustes',JSON.stringify({idioma:'en',efectos:false,vozTutora:false}));localStorage.setItem('paglot-juego-forzado',JSON.stringify({saltar:true,paso:0}))}catch{}"})
    for leccion in ('001', '150'):
        c.manda('Page.navigate', {'url': f'http://localhost:{PUERTO}/index.html#/leccion/{leccion}'})
        c.espera(4)
        for _ in range(16):
            m = c.js("""(() => { const p = document.querySelector('.jg-paso'); if (!p) return null;
              return { juego: (p.className.match(/jg-juego-(\\S+)/) || [])[1], pantallas: +(document.documentElement.scrollHeight / innerHeight).toFixed(2) }; })()""")
            if not m:
                break
            m['leccion'] = leccion
            resultado['pasos_juego'].append(m)
            c.js("[...document.querySelectorAll('.jg-pie .es-boton')].at(-1)?.click(); 1")
            c.espera(0.9)
    c.cerrar()
    return resultado


if __name__ == '__main__':
    print('1. Revisión estática…', flush=True)
    informe['estatica'] = estatica()
    informe['cursos'] = cursos()
    e = informe['estatica']
    print(f"   imports rotos: {len(e['imports_rotos'])} · claves usadas {e['claves_usadas']} · en {e['claves_en']} · vi {e['claves_vi']} (faltan en vi: {e['n_faltan_vi']})")
    for cu in informe['cursos']:
        print(f"   {cu['id']}: {cu['lecciones']} lecciones · v2 {cu['esquema2']} · juego {cu['con_modo_juego']} · trad {','.join(cu['traducciones'])} · frases {cu['frases']}")
    SALIDA.write_text(json.dumps(informe, ensure_ascii=False, indent=1), encoding='utf-8')
    if '--sin-navegador' not in sys.argv:
        print('2. En Chrome (móvil 390×844)…', flush=True)
        informe['navegador'] = navegador()
    SALIDA.write_text(json.dumps(informe, ensure_ascii=False, indent=1), encoding='utf-8')
    print('Hecho:', SALIDA)
