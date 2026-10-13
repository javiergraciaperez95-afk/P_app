# Monta las carpetas de curso de la app única (Idiomas/cursos/<id>/) a partir de las apps antiguas (_antiguas/)
# y genera Idiomas/js/cursos.js (la lista de cursos).
#
# Uso:  python montar_cursos.py            → todo
#       python montar_cursos.py fr vi      → solo esos cursos (la lista se regenera siempre)
#
# No toca el curso de español (cursos/es), que es el original del motor, ni borra nada de las apps antiguas
# salvo mover sus carpetas «audio» (generadas) a la app única.
import json, re, shutil, subprocess, sys
from pathlib import Path

RAIZ = Path(__file__).parent.parent
ANTIGUAS = RAIZ / '_antiguas'  # las 21 apps de antes, una por idioma
APP = RAIZ / 'Idiomas'
CURSOS = APP / 'cursos'
NODE = r'C:\Program Files\nodejs\node.exe'

# id, carpeta antigua, formato, voz, prefijo de guardado, tabla de Supabase, nombre propio,
# nombre en inglés / español / vietnamita / chino, saludo, letras especiales
L = [  # por popularidad: así salen en la pantalla de elegir idioma
    ('en', 'English', 'comun', 'en-GB', 'ingles', 'ingles_progreso', 'English', 'English', 'inglés', 'tiếng Anh', '英语', 'Hello!', ''),
    ('es', 'Spanish', 'motor', 'es-ES', 'espanol', 'espanol_progreso', 'Español', 'Spanish', 'español', 'tiếng Tây Ban Nha', '西班牙语', '¡Hola!', 'á é í ó ú ü ñ ¿ ¡'),
    ('fr', 'French', 'comun', 'fr-FR', 'francais', 'francais_progreso', 'Français', 'French', 'francés', 'tiếng Pháp', '法语', 'Bonjour !', 'é è ê ë à â ç ù û î ï ô œ'),
    ('de', 'German', 'comun', 'de-DE', 'aleman', 'aleman_progreso', 'Deutsch', 'German', 'alemán', 'tiếng Đức', '德语', 'Hallo!', 'ä ö ü ß'),
    ('ja', 'Japanese', 'comun', 'ja-JP', 'japones', 'japones_progreso', '日本語', 'Japanese', 'japonés', 'tiếng Nhật', '日语', 'こんにちは！', ''),
    ('it', 'Italian', 'comun', 'it-IT', 'italiano', 'italiano_progreso', 'Italiano', 'Italian', 'italiano', 'tiếng Ý', '意大利语', 'Ciao!', 'à è é ì ò ù'),
    ('ko', 'Korean', 'comun', 'ko-KR', 'coreano', 'coreano_progreso', '한국어', 'Korean', 'coreano', 'tiếng Hàn', '韩语', '안녕하세요!', ''),
    ('zh', 'Chinese', 'pendiente', 'zh-CN', 'chino', 'chino_progreso', '中文', 'Chinese', 'chino', 'tiếng Trung', '中文', '你好！', ''),
    ('pt', 'Portuguese', 'portugues', 'pt-PT', 'portugues', 'portugues_progreso', 'Português', 'Portuguese', 'portugués', 'tiếng Bồ Đào Nha', '葡萄牙语', 'Olá!', 'á à â ã é ê í ó ô õ ú ç'),
    ('ru', 'Russian', 'comun', 'ru-RU', 'ruso', 'ruso_progreso', 'Русский', 'Russian', 'ruso', 'tiếng Nga', '俄语', 'Привет!', ''),
    ('tr', 'Turkish', 'comun', 'tr-TR', 'turco', 'turco_progreso', 'Türkçe', 'Turkish', 'turco', 'tiếng Thổ Nhĩ Kỳ', '土耳其语', 'Merhaba!', 'ç ğ ı İ ö ş ü'),
    ('nl', 'Dutch', 'comun', 'nl-NL', 'holandes', 'holandes_progreso', 'Nederlands', 'Dutch', 'neerlandés', 'tiếng Hà Lan', '荷兰语', 'Hallo!', 'é ë ï ó'),
    ('sv', 'Swedish', 'comun', 'sv-SE', 'sueco', 'sueco_progreso', 'Svenska', 'Swedish', 'sueco', 'tiếng Thụy Điển', '瑞典语', 'Hej!', 'å ä ö'),
    ('el', 'Greek', 'comun', 'el-GR', 'griego', 'griego_progreso', 'Ελληνικά', 'Greek', 'griego', 'tiếng Hy Lạp', '希腊语', 'Γεια!', ''),
    ('pl', 'Polish', 'comun', 'pl-PL', 'polaco', 'polaco_progreso', 'Polski', 'Polish', 'polaco', 'tiếng Ba Lan', '波兰语', 'Cześć!', 'ą ć ę ł ń ó ś ź ż'),
    ('no', 'Norwegian', 'comun', 'nb-NO', 'noruego', 'noruego_progreso', 'Norsk', 'Norwegian', 'noruego', 'tiếng Na Uy', '挪威语', 'Hei!', 'æ ø å'),
    ('vi', 'Vietnamese', 'vietnamita', 'vi-VN', 'vietnamita', 'vietnamita_progreso', 'Tiếng Việt', 'Vietnamese', 'vietnamita', 'tiếng Việt', '越南语', 'Xin chào!', 'ă â đ ê ô ơ ư'),
    ('id', 'Indonesian', 'comun', 'id-ID', 'indonesio', 'indonesio_progreso', 'Bahasa Indonesia', 'Indonesian', 'indonesio', 'tiếng Indonesia', '印尼语', 'Halo!', ''),
    ('da', 'Danish', 'comun', 'da-DK', 'dansk', 'dansk_progreso', 'Dansk', 'Danish', 'danés', 'tiếng Đan Mạch', '丹麦语', 'Hej!', 'æ ø å'),
    ('ro', 'Romanian', 'comun', 'ro-RO', 'rumano', 'rumano_progreso', 'Română', 'Romanian', 'rumano', 'tiếng Romania', '罗马尼亚语', 'Salut!', 'ă â î ș ț'),
    ('th', 'Thai', 'comun', 'th-TH', 'tailandes', 'tailandes_progreso', 'ไทย', 'Thai', 'tailandés', 'tiếng Thái', '泰语', 'สวัสดี!', ''),
]


def leer(p):
    return json.loads(Path(p).read_text(encoding='utf-8-sig'))


def escribir(p, datos):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(datos, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')


def bandera(carpeta):
    m = re.search(r'<svg class="bandera".*?</svg>', (ANTIGUAS / carpeta / 'index.html').read_text(encoding='utf-8'), re.S)
    return re.sub(r'\s+', ' ', m.group(0)) if m else ''


# ---------------------------------------------------------------------------
# Apps con el formato común: el idioma iba en «da» (herencia de la primera app, la de danés)
# ---------------------------------------------------------------------------
def renombrar(o, cid, dentro=''):
    """Pone el texto del idioma bajo su propio código (fr, de…). En «palabras» y «opciones» las claves son palabras."""
    if isinstance(o, list):
        return [renombrar(x, cid, dentro) for x in o]
    if not isinstance(o, dict):
        return o
    literales = dentro in ('palabras', 'opciones')
    cambio = {} if literales else {'da': cid, 'titulo_da': f'titulo_{cid}'}
    return {cambio.get(k, k): renombrar(v, cid, '' if literales else k) for k, v in o.items()}


def campo_de(cid):
    """Clave del texto del idioma en los archivos. «id» (indonesio) no vale: ya es el identificador de los ejercicios."""
    return 'ind' if cid == 'id' else cid


def montar_comun(cid, carpeta):
    origen, destino = ANTIGUAS / carpeta, CURSOS / cid
    n = 0
    for f in sorted((origen / 'lessons').glob('*.json')):
        escribir(destino / 'lessons' / f.name, renombrar(leer(f), campo_de(cid)))
        n += f.stem.isdigit()
    if (origen / 'phrases' / 'frases.json').exists():
        escribir(destino / 'phrases' / 'frases.json', renombrar(leer(origen / 'phrases' / 'frases.json'), campo_de(cid)))
    return n


# ---------------------------------------------------------------------------
# Portugués: lecciones por unidades, con las traducciones dentro de «trad»
# ---------------------------------------------------------------------------
def aplanar(o):
    """{ pt, trad: { en, vi } } → { pt, en, vi }"""
    if isinstance(o, list):
        return [aplanar(x) for x in o]
    if not isinstance(o, dict):
        return o
    sal = {}
    for k, v in o.items():
        if k == 'trad' and isinstance(v, dict):
            sal.update(v)
        elif k == 'trad':
            sal['en'] = v
        else:
            sal[k] = aplanar(v)
    return sal


def montar_portugues(cid, carpeta):
    origen, destino = ANTIGUAS / carpeta, CURSOS / cid
    curso = leer(origen / 'lessons' / 'curso.json')
    capitulos, n = [], 0
    for u, unidad in enumerate(curso['unidades'], 1):
        capitulos.append({'numero': u, 'titulo_pt': unidad['titulo'], 'titulo': unidad.get('subtitulo', ''), 'descripcion': unidad.get('descripcion', '')})
        for nombre in unidad['lecciones']:
            n += 1
            l = aplanar(leer(origen / 'lessons' / f'{nombre}.json'))
            escribir(destino / 'lessons' / f'{n:03d}.json', {
                'capitulo': u, 'titulo_pt': l['titulo'], 'titulo': l.get('subtitulo', ''),
                **{k: l[k] for k in ('intro', 'palabras', 'bloques') if k in l}})
    escribir(destino / 'lessons' / 'capitulos.json', capitulos)
    for f in (origen / 'phrases').glob('*.json'):
        escribir(destino / 'phrases' / 'frases.json', aplanar(leer(f)))
    return n


# ---------------------------------------------------------------------------
# Vietnamita: formato propio, más compacto
# ---------------------------------------------------------------------------
def opciones_vi(lista):
    """«*texto | explicación» → { texto, explicacion, correcta }"""
    sal = []
    for o in lista:
        texto, expl = (re.split(r'\s*\|\s*', o, maxsplit=1) + [''])[:2]
        d = {'texto': texto.lstrip('*').strip()}
        if expl.strip():
            d['explicacion'] = expl.strip()
        if texto.startswith('*'):
            d['correcta'] = True
        sal.append(d)
    return sal


def analisis_vi(texto):
    partes = []
    for trozo in texto.split(' · '):
        a, sep, b = trozo.partition(': ')
        if sep and a.strip() and b.strip():
            partes.append([a.strip(), b.strip()])
    return partes


def frase_vi(f):
    d = {k: f[k] for k in ('quien', 'vi', 'es', 'nota') if k in f}
    if isinstance(f.get('analisis'), str):
        a = [p for p in analisis_vi(f['analisis']) if p[0].lower().rstrip('?!.,') in f['vi'].lower()]
        if a:
            d['analisis'] = a
    return d


def bloque_vi(b):
    t = b['tipo']
    if t == 'explicacion':
        return [{'tipo': t, 'titulo': b.get('titulo'), 'texto': b['texto']}]
    if t == 'vocabulario':
        return [{'tipo': t, 'titulo': b.get('titulo'), 'palabras': b['palabras']}]
    if t == 'dialogo':
        return [{'tipo': t, 'titulo': b.get('titulo'), 'frases': [frase_vi(f) for f in b['frases']]}]
    if t == 'practica':
        # Sílabas o palabras para escuchar: «ma=fantasma · má=madre»
        frases = []
        for linea in b['lineas']:
            for trozo in linea.split(' · '):
                vi, _, es = trozo.partition('=')
                if vi.strip():
                    frases.append({'vi': vi.strip(), **({'es': es.strip()} if es.strip() else {})})
        sal = []
        if b.get('texto'):
            sal.append({'tipo': 'explicacion', 'titulo': b.get('titulo'), 'texto': b['texto']})
        sal.append({'tipo': 'texto', 'titulo': b.get('titulo'), 'frases': frases})
        return sal
    comun = {'id': b['id'], 'opciones': opciones_vi(b['opciones'])}
    if t == 'test':
        return [{'tipo': 'test', 'pregunta': b['pregunta'], **comun}]
    if t == 'escucha':
        return [{'tipo': 'test', 'audio': b['audio'], 'pregunta': b.get('pregunta') or '¿Qué has oído?', **comun}]
    if t == 'traducir':
        return [{'tipo': 'traduccion', 'pregunta': b.get('pregunta') or '¿Qué significa?', 'frase': b['frase'], **comun}]
    if t == 'hueco':
        return [{'tipo': 'huecos', 'pregunta': b.get('pregunta') or f'Completa: «{b["es"]}»', 'frase': b['frase'], **comun}]
    raise ValueError(f'tipo de bloque desconocido: {t}')


def montar_vietnamita(cid, carpeta):
    origen, destino = ANTIGUAS / carpeta, CURSOS / cid
    capitulo, vistos, n = 1, [], 0
    for f in sorted((origen / 'lecciones').glob('[0-9]*.json')):
        l = leer(f)
        m = re.search(r'(?:Bài|phát âm)\s+(\d+)', l['titulo'])
        if m:
            capitulo = int(m.group(1))
        if capitulo not in vistos:
            vistos.append(capitulo)
        palabras = {}
        for palabra, valor in (l.get('palabras') or {}).items():
            es, pron = (re.split(r'\s*\|\s*', valor, maxsplit=1) + [''])[:2]
            palabras[palabra] = {'es': es.strip(), **({'pron': pron.strip()} if pron.strip() else {})}
        bloques = [nuevo for b in l['bloques'] for nuevo in bloque_vi(b)]
        escribir(destino / 'lessons' / f.name, {
            'capitulo': capitulo, 'titulo_vi': l['titulo'], 'titulo_es': l.get('tituloEs', ''),
            **({'palabras': palabras} if palabras else {}), 'bloques': [{k: v for k, v in b.items() if v is not None} for b in bloques]})
        n += 1
    escribir(destino / 'lessons' / 'capitulos.json', [{'numero': c, 'titulo_vi': f'Chương {c}', 'titulo_es': f'Capítulo {c}'} for c in vistos])
    # Frases útiles: están en un archivo de programa; se leen con Node.
    js = (origen / 'js' / 'frases-utiles.js').as_uri()
    r = subprocess.run([NODE, '--input-type=module', '-e', f"import('{js}').then(m => console.log(JSON.stringify(m.SECCIONES)))"],
                       capture_output=True, text=True, encoding='utf-8')
    if r.returncode == 0:
        categorias = [{'titulo': s['titulo'], 'grupos': [{'titulo': g['titulo'], 'leccion': g.get('leccion', ''),
                       'frases': [{'vi': vi, 'es': es} for es, vi in g['frases']]} for g in s['grupos']]} for s in json.loads(r.stdout)]
        escribir(destino / 'phrases' / 'frases.json', {'categorias': categorias})
    else:
        print('  frases de vietnamita: no se han podido leer:', r.stderr.strip()[-200:])
    return n


# ---------------------------------------------------------------------------
# Tutoras: el diseño de cada una (en _tutoras/disenos) envuelto como módulo
# ---------------------------------------------------------------------------
def montar_tutora(cid, carpeta):
    f = RAIZ / '_tutoras' / 'disenos' / f'{carpeta}.js'
    if not f.exists():
        return False
    lineas = f.read_text(encoding='utf-8').splitlines()
    n = next(i for i, l in enumerate(lineas) if not l.startswith('//'))
    cuerpo = '\n'.join('  ' + l if l.strip() else l for l in lineas[n:])
    texto = ('\n'.join(lineas[:n]) + '\n// Se genera con _herramientas/montar_cursos.py a partir de _tutoras/disenos: los cambios se hacen allí.\n\n'
             'export default ({ R, P, B, Rh, Ph, Bh, C, medias, mangas, mangaCorta, torso, falda, zapatos }) => {\n'
             + cuerpo + '\n  return DISENO;\n};\n')
    (CURSOS / cid).mkdir(parents=True, exist_ok=True)
    (CURSOS / cid / 'tutora.js').write_text(texto, encoding='utf-8', newline='\n')
    return True


def mover_audio(cid, carpeta):
    viejo, nuevo = ANTIGUAS / carpeta / 'audio', CURSOS / cid / 'audio'
    if viejo.exists() and cid != 'es':
        nuevo.mkdir(parents=True, exist_ok=True)
        for f in viejo.iterdir():
            shutil.move(str(f), str(nuevo / f.name))
        viejo.rmdir()
    return len(list(nuevo.glob('*.mp3'))) if nuevo.exists() else 0


def main():
    solo = set(sys.argv[1:])
    lista = []
    for (cid, carpeta, formato, voz, prefijo, tabla, nativo, en, es, vi, zh, hola, letras) in L:
        entrada = {
            'id': cid, 'carpeta': f'cursos/{cid}', 'campo': campo_de(cid), 'lang': voz.split('-')[0] if cid != 'no' else 'nb', 'voz': voz,
            'prefijo': prefijo, 'tabla': tabla, 'nativo': nativo, 'nombre': {'en': en, 'es': es, 'vi': vi, 'zh': zh},
            'hola': hola, 'letras': letras.split(), 'bandera': bandera(carpeta),
        }
        # Los cursos que ya se escriben aquí (_herramientas/cursos/<id>) no se vuelven a traer de la app antigua.
        propio = (RAIZ / '_herramientas' / 'cursos' / cid).is_dir() or cid == 'vi'
        if not solo or cid in solo:
            if propio:
                n = len(list((CURSOS / cid / 'lessons').glob('[0-9]*.json')))
            elif formato == 'comun':
                n = montar_comun(cid, carpeta)
            elif formato == 'portugues':
                n = montar_portugues(cid, carpeta)
            elif formato == 'vietnamita':
                n = montar_vietnamita(cid, carpeta)
            else:
                n = len(list((CURSOS / cid / 'lessons').glob('[0-9]*.json'))) if (CURSOS / cid / 'lessons').exists() else 0
            tutora = montar_tutora(cid, carpeta)
            audios = mover_audio(cid, carpeta)
            print(f'{cid}  {carpeta:11} {n:4} lecciones, {audios:5} audios, tutora {"sí" if tutora else "propia" if cid == "es" else "NO"}')
        if cid in ('es', 'zh'):  # traen su propio dibujo (tutor-sprite.js)
            entrada['sprite'] = 'propio'
        if formato == 'pendiente':
            entrada['proximamente'] = True
        entrada['lecciones'] = len(list((CURSOS / cid / 'lessons').glob('[0-9]*.json'))) if (CURSOS / cid / 'lessons').exists() else 0
        entrada['audio'] = (CURSOS / cid / 'audio' / 'indice.json').exists()
        lista.append(entrada)

    texto = ('// Los cursos de la app: uno por idioma. Se genera con _herramientas/montar_cursos.py (los datos están allí).\n'
             '// campo: clave bajo la que va el texto del idioma en sus archivos · voz: idioma de la voz · prefijo: con qué nombre\n'
             '// guarda su progreso en el dispositivo · tabla: su tabla en Supabase · letras: teclas de ayuda al escribir.\n\n'
             'export const CURSOS = ' + json.dumps(lista, ensure_ascii=False, indent=2) + ';\n')
    (APP / 'js' / 'cursos.js').write_text(texto, encoding='utf-8', newline='\n')
    print('cursos.js:', len(lista), 'cursos')


if __name__ == '__main__':
    main()
