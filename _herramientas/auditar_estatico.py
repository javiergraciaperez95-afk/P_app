"""Auditoría estática de Paglot para el informe de arreglos (19-10-2026).

    python _herramientas/auditar_estatico.py

Mira el código, los estilos, los textos (en / vi), los 21 cursos (lecciones, bloques, juegos, traducciones beta)
y los archivos, sin abrir el navegador. Escribe _notas/auditoria/estatico.json y un resumen por pantalla.
"""
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / '_notas' / 'auditoria'
SALIDA.mkdir(parents=True, exist_ok=True)
APP = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'juegos', 'cursos', 'assets']
r = {}


def leer(p):
    return p.read_text(encoding='utf-8', errors='replace')


def archivos(*extensiones, sin_cursos=True):
    for parte in APP:
        base = RAIZ / parte
        lista = [base] if base.is_file() else base.rglob('*')
        for p in lista:
            if p.is_file() and p.suffix in extensiones and not (sin_cursos and 'cursos' in p.relative_to(RAIZ).parts[:1]):
                yield p


# ------------------------------------------------------------ código
js = list(archivos('.js'))
css = list(archivos('.css'))
lineas = {str(p.relative_to(RAIZ)).replace('\\', '/'): leer(p).count('\n') + 1 for p in js + css}
r['codigo'] = {
    'archivos_js': len(js), 'archivos_css': len(css),
    'lineas_js': sum(v for k, v in lineas.items() if k.endswith('.js')),
    'lineas_css': sum(v for k, v in lineas.items() if k.endswith('.css')),
    'kb_js': round(sum(p.stat().st_size for p in js) / 1024),
    'kb_css': round(sum(p.stat().st_size for p in css) / 1024),
    'mas_grandes': sorted(lineas.items(), key=lambda x: -x[1])[:15],
}
texto_js = {p: leer(p) for p in js}
rotos = []
for p, t in texto_js.items():
    for m in re.finditer(r"""(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]""", t):
        if not (p.parent / m.group(1)).resolve().exists():
            rotos.append(f'{p.relative_to(RAIZ)} → {m.group(1)}')
r['codigo']['imports_rotos'] = rotos
r['codigo']['todo_fixme'] = [f'{p.relative_to(RAIZ)}:{t[:m.start()].count(chr(10)) + 1}' for p, t in texto_js.items()
                             for m in re.finditer(r'\b(TODO|FIXME|XXX|HACK)\b', t)]
r['codigo']['console_log'] = sum(t.count('console.log(') for t in texto_js.values())
r['codigo']['innerHTML'] = sorted(f'{p.relative_to(RAIZ)}:{t[:m.start()].count(chr(10)) + 1}'
                                  for p, t in texto_js.items() for m in re.finditer(r'\.innerHTML\s*=', t))
claves_ls = Counter(m.group(1) for t in texto_js.values() for m in re.finditer(r"""['"`](idiomas-[a-z0-9-]+|paglot-[a-z0-9-]+)['"`]""", t))
r['codigo']['claves_localstorage'] = sorted(claves_ls)
r['codigo']['setInterval'] = sum(t.count('setInterval(') for t in texto_js.values())
r['codigo']['addEventListener'] = sum(t.count('addEventListener(') for t in texto_js.values())
r['codigo']['removeEventListener'] = sum(t.count('removeEventListener(') for t in texto_js.values())
texto_css = '\n'.join(leer(p) for p in css)
r['css'] = {
    'important': texto_css.count('!important'),
    'media_queries': len(re.findall(r'@media', texto_css)),
    'steps': len(re.findall(r'steps\(', texto_css)),
    'keyframes': len(re.findall(r'@keyframes', texto_css)),
    'animaciones_no_transform': sorted(set(m.group(1) for m in re.finditer(
        r'@keyframes\s+([\w-]+)\s*\{([^{}]*\{[^{}]*\})*[^{}]*\}', texto_css)
        if re.search(r'(width|height|top|left|right|bottom|margin|padding|box-shadow|background-position|filter|clip-path)\s*:', m.group(0)))),
    'z_index_max': max((int(x) for x in re.findall(r'z-index:\s*(\d+)', texto_css)), default=0),
    'colores_hex_distintos': len(set(re.findall(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b', texto_css))),
}

# ------------------------------------------------------------ textos (i18n)
def claves_de(archivo):
    t = leer(RAIZ / 'js' / 'i18n' / archivo)
    return set(re.findall(r"^\s*'([\w.\-]+)'\s*:", t, re.M))


en, vi = claves_de('en.js'), claves_de('vi.js')
usadas = set()
for t in texto_js.values():
    usadas |= set(re.findall(r"""\bt\(\s*['"]([\w.\-]+)['"]""", t))
    usadas |= set(re.findall(r"""\bt\(\s*`([\w.\-]+)`""", t))
dinamicas = set()
for t in texto_js.values():
    dinamicas |= set(m.group(1) for m in re.finditer(r"""\bt\(\s*`([\w.\-]+)\.\$\{""", t))
r['i18n'] = {
    'claves_en': len(en), 'claves_vi': len(vi),
    'faltan_en_vi': sorted(en - vi)[:80], 'n_faltan_en_vi': len(en - vi),
    'faltan_en_en': sorted(vi - en)[:80], 'n_faltan_en_en': len(vi - en),
    'usadas_sin_definir': sorted(k for k in usadas - en if not any(k.startswith(d) for d in dinamicas))[:80],
    'definidas_sin_usar_aprox': len([k for k in en if k not in usadas and not any(k.startswith(d + '.') for d in dinamicas)]),
}
# textos escritos a mano en el código (posibles textos sin traducir)
sueltos = []
for p, t in texto_js.items():
    if '/i18n/' in str(p).replace('\\', '/'):
        continue
    for m in re.finditer(r"""el\([^)]*?,\s*['"]([A-ZÁÉÍÓÚ¡¿][^'"]{12,})['"]\)""", t):
        sueltos.append(f'{p.relative_to(RAIZ)}:{t[:m.start()].count(chr(10)) + 1}: {m.group(1)[:60]}')
r['i18n']['textos_a_mano'] = sueltos[:60]
r['i18n']['n_textos_a_mano'] = len(sueltos)

# ------------------------------------------------------------ cursos
ESPANOL = re.compile(r'\b(el|la|los|las|que|de la|del|una|para|con|por|es|son|está|también|cuando|porque|pero|muy)\b', re.I)
cursos = {}
uso_tipos = Counter()
for c in sorted(p.name for p in (RAIZ / 'cursos').iterdir() if p.is_dir()):
    base = RAIZ / 'cursos' / c
    lecciones = sorted((base / 'lessons').glob('[0-9][0-9][0-9].json'))
    tipos = Counter()
    bloques_por_leccion = []
    malas = []
    cuenta = Counter()
    niveles = Counter()
    for f in lecciones:
        try:
            d = json.loads(leer(f))
        except Exception as e:
            malas.append(f'{f.name}: {e}'[:120])
            continue
        b = d.get('bloques') or []
        bloques_por_leccion.append(len(b))
        niveles[d.get('nivel') or '?'] += 1
        for x in b:
            if isinstance(x, dict):
                tipos[x.get('tipo', '?')] += 1
        # traducciones al inglés de los cursos beta: diccionarios con «es» y sin «en»
        def mirar(o):
            if isinstance(o, dict):
                if 'es' in o and isinstance(o['es'], str) and c not in ('es',):
                    cuenta['total'] += 1
                    if not o.get('en'):
                        cuenta['falta'] += 1
                    elif len(ESPANOL.findall(o['en'])) >= 3:
                        cuenta['espanol'] += 1
                for v in o.values():
                    mirar(v)
            elif isinstance(o, list):
                for v in o:
                    mirar(v)
        mirar(d)
    uso_tipos.update(tipos)
    try:
        idx = json.loads(leer(base / 'indice' / 'lecciones.json'))
        en_indice = len(idx.get('lecciones', []))
        capitulos = len({x.get('capitulo') for x in idx.get('lecciones', [])})
    except Exception:
        en_indice, capitulos = 0, 0
    frases = 0
    for fp in (base / 'phrases').glob('*.json'):
        try:
            v = json.loads(leer(fp))
            frases += len(v) if isinstance(v, list) else len(v.get('frases', v))
        except Exception:
            pass
    cursos[c] = {
        'lecciones': len(lecciones), 'en_indice': en_indice, 'capitulos': capitulos,
        'guiones_juego': len(list((base / 'juegos').glob('*.json'))) if (base / 'juegos').exists() else 0,
        'bloques_media': round(sum(bloques_por_leccion) / max(1, len(bloques_por_leccion)), 1),
        'bloques_min': min(bloques_por_leccion, default=0), 'bloques_max': max(bloques_por_leccion, default=0),
        'tipos': dict(tipos.most_common()), 'niveles': dict(niveles),
        'json_malos': malas[:5], 'frases': frases,
        'trad_en_total': cuenta['total'], 'trad_en_falta': cuenta['falta'], 'trad_en_con_espanol': cuenta['espanol'],
        'kb': round(sum(p.stat().st_size for p in base.rglob('*') if p.is_file()) / 1024),
        'tutora': (base / 'tutora.js').exists(),
    }
r['cursos'] = cursos
r['tipos_de_bloque_total'] = dict(uso_tipos.most_common())

# ------------------------------------------------------------ juegos
cat = leer(RAIZ / 'juegos' / 'catalogo.js')
modulos = sorted(p.stem for p in (RAIZ / 'juegos').glob('*.js'))
r['juegos'] = {
    'modulos': modulos,
    'en_catalogo': sorted(set(re.findall(r"import \* as (\w+) from", cat))),
    'tipos_por_juego': {},
}
for m in modulos:
    t = leer(RAIZ / 'juegos' / f'{m}.js')
    tipos = re.search(r"tipos:\s*\[([^\]]*)\]", t)
    if tipos:
        r['juegos']['tipos_por_juego'][m] = re.findall(r"'(\w+)'", tipos.group(1))
r['juegos']['sin_catalogo'] = [m for m in modulos if m not in r['juegos']['en_catalogo'] and m not in ('catalogo', 'motor', 'lista', 'ayuda-trozos')]
# lista.js registra el resto
lista = leer(RAIZ / 'juegos' / 'lista.js') if (RAIZ / 'juegos' / 'lista.js').exists() else ''
r['juegos']['registrados_en_lista'] = sorted(set(re.findall(r"from '\./(\w+)\.js'", lista)))
r['juegos']['bloques_por_juego'] = {t: [j for j, ts in r['juegos']['tipos_por_juego'].items() if t in ts] for t in uso_tipos}

# ------------------------------------------------------------ archivos y pesos
pesos = defaultdict(int)
for parte in APP:
    base = RAIZ / parte
    for p in ([base] if base.is_file() else base.rglob('*')):
        if p.is_file():
            pesos[parte] += p.stat().st_size
r['pesos_kb'] = {k: round(v / 1024) for k, v in sorted(pesos.items(), key=lambda x: -x[1])}
html = leer(RAIZ / 'index.html')
r['index'] = {
    'scripts': len(re.findall(r'<script', html)), 'hojas_css': len(re.findall(r'rel="stylesheet"', html)),
    'meta_description': bool(re.search(r'name="description"', html)), 'og': bool(re.search(r'property="og:', html)),
    'csp': 'Content-Security-Policy' in html, 'lang': re.search(r'<html[^>]*lang="([^"]+)"', html).group(1) if re.search(r'<html[^>]*lang="([^"]+)"', html) else None,
    'preload': len(re.findall(r'rel="preload"', html)), 'modulepreload': len(re.findall(r'rel="modulepreload"', html)),
}
cfg = leer(RAIZ / 'js' / 'config.js')
r['config'] = {'supabase_url': bool(re.search(r'supabase\.co', cfg)), 'clave_anon_en_codigo': bool(re.search(r'eyJ[\w-]{20,}', cfg)),
               'titular_legal_vacio': bool(re.search(r"titular\w*\s*:\s*['\"]\s*['\"]", cfg))}
apk = RAIZ / '_apk'
r['apk'] = {
    'capacitor': json.loads(leer(apk / 'capacitor.config.json')) if (apk / 'capacitor.config.json').exists() else None,
    'gradle_version': re.findall(r'(versionCode \d+|versionName "[^"]+")', leer(apk / 'android' / 'app' / 'build.gradle')) if (apk / 'android' / 'app' / 'build.gradle').exists() else None,
}
r['tests'] = sorted(str(p.relative_to(RAIZ)) for p in RAIZ.rglob('*') if p.is_file() and re.search(r'(\.test\.|\.spec\.|^test_)', p.name) and 'node_modules' not in p.parts)

(SALIDA / 'estatico.json').write_text(json.dumps(r, ensure_ascii=False, indent=1), encoding='utf-8')
print('código:', r['codigo']['archivos_js'], 'js /', r['codigo']['lineas_js'], 'líneas;', r['codigo']['archivos_css'], 'css /', r['codigo']['lineas_css'], 'líneas')
print('imports rotos:', len(rotos), '· TODO:', len(r['codigo']['todo_fixme']), '· innerHTML:', len(r['codigo']['innerHTML']), '· console.log:', r['codigo']['console_log'])
print('i18n: en', len(en), 'vi', len(vi), '· faltan en vi', len(en - vi), '· faltan en en', len(vi - en), '· usadas sin definir', len(r['i18n']['usadas_sin_definir']), '· textos a mano', len(sueltos))
for c, v in cursos.items():
    print(f"  {c}: {v['lecciones']} lecc ({v['en_indice']} índice, {v['capitulos']} cap), bloques {v['bloques_media']}, guiones {v['guiones_juego']}, frases {v['frases']}, en falta {v['trad_en_falta']}/{v['trad_en_total']}, malos {len(v['json_malos'])}, {v['kb']} KB")
print('juegos:', len(modulos), '· sin catálogo/lista:', [m for m in r['juegos']['sin_catalogo'] if m not in r['juegos']['registrados_en_lista']])
print('pesos KB:', r['pesos_kb'])
print('index:', r['index'], '· config:', r['config'], '· tests:', len(r['tests']))
