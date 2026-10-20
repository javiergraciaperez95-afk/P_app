# Lo que comparten los scripts de los modelos de lección (ver LEEME.txt de esta carpeta).
# - Los cursos, sus carpetas por idioma del alumno y los modelos (explicar siempre primero).
# - Las claves fijas de cada parte de una lección (la estructura estricta).
# - validar_leccion(): la comprobación que tiene que pasar cada JSON.

import json
import os
import re

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
CURSOS_DIR = os.path.join(RAIZ, 'cursos')
TRABAJO = os.path.join(RAIZ, '_trabajo')

FORMATO = 'paglot-modelo-1'

# Código del curso → campo con el que sus lecciones antiguas guardan el texto del idioma (ver js/cursos.js).
CURSOS = ['da', 'de', 'el', 'en', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sv', 'th', 'tr', 'vi', 'zh']
CAMPO = {c: ('ind' if c == 'id' else c) for c in CURSOS}
NOMBRE = {
    'da': 'danés', 'de': 'alemán', 'el': 'griego', 'en': 'inglés', 'es': 'español', 'fr': 'francés', 'id': 'indonesio',
    'it': 'italiano', 'ja': 'japonés', 'ko': 'coreano', 'nl': 'neerlandés', 'no': 'noruego', 'pl': 'polaco',
    'pt': 'portugués', 'ro': 'rumano', 'ru': 'ruso', 'sv': 'sueco', 'th': 'tailandés', 'tr': 'turco', 'vi': 'vietnamita',
    'zh': 'chino',
}
NOMBRE_ALUMNO = {'es': 'hispanohablantes (español)', 'en': 'angloparlantes (inglés)', 'vi': 'vietnamitas (vietnamita)'}


def lenguas_de(c):
    """Carpetas de un curso: una por idioma del alumno, sin la del propio idioma del curso."""
    return [l for l in ('es', 'en', 'vi') if l != c]


# Los modelos: el orden de las cuatro etapas. El orden es sagrado: EXPLICAR va siempre primero y PRACTICAR siempre al
# final (en el modo juego las palabras y la lectura también son juegos que preguntan, así que nada se juega antes de
# que se haya explicado). Solo cambia el orden de palabras y leer.
# Hasta el 20-10-2026 hubo 6 modelos (3-6 ponían palabras o leer antes de explicar): se pasaron al 1 o al 2
# conservando el orden de palabras y leer (ordenar_etapas.py).
MODELOS = {
    1: ('clasica', ['explicar', 'palabras', 'leer', 'practicar']),
    2: ('explicar-y-leer', ['explicar', 'leer', 'palabras', 'practicar']),
}
ORDEN_SAGRADO = ('explicar', 'practicar')   # primera y última etapa de todos los modelos
assert all(e[0] == ORDEN_SAGRADO[0] and e[-1] == ORDEN_SAGRADO[1] for _, e in MODELOS.values())
ETAPA_DE = {
    'explicacion': 'explicar', 'gramatica': 'explicar', 'tabla': 'explicar',
    'vocabulario': 'palabras',
    'dialogo': 'leer', 'texto': 'leer',
    'test': 'practicar', 'traduccion': 'practicar', 'huecos': 'practicar', 'ordenar': 'practicar', 'escribir': 'practicar',
}
EJERCICIOS = ['test', 'traduccion', 'huecos', 'ordenar', 'escribir']

# ---------------------------------------------------------------------------
# Las claves fijas, en su orden. Siempre están todas (vacías si no hacen falta: "", [], false).
# ---------------------------------------------------------------------------
CLAVES_LECCION = ['formato', 'modelo', 'nombre_modelo', 'curso', 'alumno', 'id', 'numero', 'orden', 'capitulo',
                  'titulo', 'intro', 'palabras', 'etapas']
CLAVES_TITULO = ['estudio', 'alumno']
CLAVES_PALABRA = ['palabra', 'significado', 'pron', 'ipa', 'cat', 'genero', 'plural', 'definida', 'consejo', 'nota', 'oculta']
CLAVES_ETAPA = ['etapa', 'piezas']
CLAVES_MIXTO = ['texto', 'lengua']           # un texto que puede estar en el idioma estudiado o en el del alumno
CLAVES_FRASE = ['quien', 'estudio', 'alumno', 'literal', 'estructura', 'nota', 'analisis', 'parrafo']
CLAVES_OPCION = ['texto', 'lengua', 'explicacion', 'correcta']
CLAVES_RESPUESTAS = ['lengua', 'textos']
CLAVES_EJERCICIO = ['tipo', 'id', 'pregunta', 'frase', 'traduccion', 'audio', 'oir_frase', 'opciones', 'respuestas',
                    'explicacion', 'autoevaluacion']
CLAVES_PIEZA = {
    'explicacion': ['tipo', 'titulo', 'texto', 'tutora'],
    'gramatica': ['tipo', 'titulo', 'texto', 'ejemplos', 'tutora'],
    'tabla': ['tipo', 'titulo', 'columnas', 'filas', 'nota', 'tutora'],
    'vocabulario': ['tipo', 'titulo', 'palabras'],
    'dialogo': ['tipo', 'titulo', 'frases'],
    'texto': ['tipo', 'titulo', 'frases'],
    **{t: CLAVES_EJERCICIO for t in EJERCICIOS},
}
CLAVES_CAPITULO = ['numero', 'nivel', 'titulo', 'descripcion']
LENGUAS_TEXTO = ('estudio', 'alumno')


def mixto(texto='', lengua='alumno'):
    return {'texto': texto, 'lengua': lengua}


def pieza_vacia(tipo):
    """Una pieza con todas sus claves y los valores vacíos."""
    base = {
        'tipo': tipo, 'titulo': '', 'texto': [], 'tutora': '', 'ejemplos': [], 'columnas': [], 'filas': [], 'nota': '',
        'palabras': [], 'frases': [], 'id': '', 'pregunta': mixto(), 'frase': mixto(), 'traduccion': '', 'audio': '',
        'oir_frase': False, 'opciones': [], 'respuestas': {'lengua': 'estudio', 'textos': []}, 'explicacion': '',
        'autoevaluacion': False,
    }
    return {k: base[k] for k in CLAVES_PIEZA[tipo]}


def frase_vacia():
    return {'quien': mixto(), 'estudio': '', 'alumno': '', 'literal': '', 'estructura': '', 'nota': [], 'analisis': [],
            'parrafo': 0}


def palabra_vacia():
    return {'palabra': '', 'significado': '', 'pron': '', 'ipa': '', 'cat': '', 'genero': '', 'plural': '',
            'definida': '', 'consejo': '', 'nota': '', 'oculta': False}


def leccion_vacia(c, l, id_, modelo):
    nombre, etapas = MODELOS[modelo]
    return {
        'formato': FORMATO, 'modelo': modelo, 'nombre_modelo': nombre, 'curso': c, 'alumno': l, 'id': id_,
        'numero': int(id_), 'orden': int(id_), 'capitulo': 0,
        'titulo': {'estudio': '', 'alumno': ''}, 'intro': '', 'palabras': [],
        'etapas': [{'etapa': e, 'piezas': []} for e in etapas],
    }


# ---------------------------------------------------------------------------
# Lectura y escritura
# ---------------------------------------------------------------------------
def leer_json(ruta):
    with open(ruta, encoding='utf-8-sig') as f:
        return json.load(f)


def escribir_json(ruta, datos, sangria=1):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    tmp = ruta + '.tmp'
    with open(tmp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(datos, f, ensure_ascii=False, indent=sangria)
        f.write('\n')
    os.replace(tmp, ruta)


def ids_originales(c):
    # las lecciones originales (lessons/) se archivaron el 20-10-2026: si ya no están, valen las de la primera carpeta
    carpeta = os.path.join(CURSOS_DIR, c, 'lessons')
    if not os.path.isdir(carpeta):
        carpeta = os.path.join(CURSOS_DIR, c, lenguas_de(c)[0])
    return sorted(n[:-5] for n in os.listdir(carpeta) if re.fullmatch(r'\d{3}\.json', n))


def ruta_leccion(c, l, id_):
    return os.path.join(CURSOS_DIR, c, l, f'{id_}.json')


# ---------------------------------------------------------------------------
# Validación estricta
# ---------------------------------------------------------------------------
def _es_texto(v):
    return isinstance(v, str)


def _lleno(v):
    return isinstance(v, str) and v.strip() != ''


class Fallos(list):
    def __call__(self, donde, mensaje):
        self.append(f'{donde}: {mensaje}')


def _claves(obj, esperadas, donde, fallos):
    if not isinstance(obj, dict):
        fallos(donde, 'tiene que ser un objeto {…}')
        return False
    if list(obj.keys()) != esperadas:
        faltan = [k for k in esperadas if k not in obj]
        sobran = [k for k in obj if k not in esperadas]
        if faltan or sobran:
            fallos(donde, f'claves distintas de la plantilla (faltan {faltan or "-"}, sobran {sobran or "-"})')
        else:
            fallos(donde, f'claves en otro orden: tienen que ir así {esperadas}')
        return False
    return True


def _mixto(v, donde, fallos, completa, obligatorio=False):
    if not _claves(v, CLAVES_MIXTO, donde, fallos):
        return
    if not _es_texto(v['texto']):
        fallos(donde, '«texto» tiene que ser un texto')
    if v['lengua'] not in LENGUAS_TEXTO:
        fallos(donde, '«lengua» tiene que ser "estudio" o "alumno"')
    if completa and obligatorio and not _lleno(v['texto']):
        fallos(donde, 'está vacío')


def _texto(v, donde, fallos, completa, obligatorio=False):
    if not _es_texto(v):
        fallos(donde, 'tiene que ser un texto')
    elif completa and obligatorio and not v.strip():
        fallos(donde, 'está vacío')


def _lista_textos(v, donde, fallos, completa, obligatorio=False):
    if not isinstance(v, list) or not all(_es_texto(x) for x in v):
        fallos(donde, 'tiene que ser una lista de textos')
        return
    if completa:
        if obligatorio and not v:
            fallos(donde, 'está vacía')
        for i, x in enumerate(v):
            if not x.strip():
                fallos(f'{donde}[{i}]', 'está vacío')


def _frase(f, donde, fallos, completa):
    if not _claves(f, CLAVES_FRASE, donde, fallos):
        return
    _mixto(f['quien'], f'{donde}.quien', fallos, completa)
    _texto(f['estudio'], f'{donde}.estudio', fallos, completa, True)
    _texto(f['alumno'], f'{donde}.alumno', fallos, completa)
    _texto(f['literal'], f'{donde}.literal', fallos, completa)
    _texto(f['estructura'], f'{donde}.estructura', fallos, completa)
    _lista_textos(f['nota'], f'{donde}.nota', fallos, completa)
    if not isinstance(f['analisis'], list):
        fallos(f'{donde}.analisis', 'tiene que ser una lista')
    else:
        for i, par in enumerate(f['analisis']):
            if not (isinstance(par, list) and len(par) == 2 and all(_es_texto(x) for x in par)):
                fallos(f'{donde}.analisis[{i}]', 'tiene que ser ["trozo de la frase", "función"]')
            elif completa and not (par[0].strip() and par[1].strip()):
                fallos(f'{donde}.analisis[{i}]', 'tiene un texto vacío')
    if f['parrafo'] not in (0, 1):
        fallos(f'{donde}.parrafo', 'tiene que ser 0 o 1')


def _pieza(p, donde, fallos, completa, ids):
    if not isinstance(p, dict) or p.get('tipo') not in CLAVES_PIEZA:
        fallos(donde, f'tipo de pieza desconocido: {p.get("tipo") if isinstance(p, dict) else p!r}')
        return
    tipo = p['tipo']
    donde = f'{donde}({tipo})'
    if not _claves(p, CLAVES_PIEZA[tipo], donde, fallos):
        return
    if tipo in ('explicacion', 'gramatica', 'tabla'):
        _texto(p['titulo'], f'{donde}.titulo', fallos, completa)
        _texto(p['tutora'], f'{donde}.tutora', fallos, completa)
    if tipo in ('explicacion', 'gramatica'):
        # puede ir vacía: hay explicaciones originales con solo título (se conservan; ver avisos_leccion())
        _lista_textos(p['texto'], f'{donde}.texto', fallos, completa)
    if tipo == 'gramatica':
        if not isinstance(p['ejemplos'], list):
            fallos(f'{donde}.ejemplos', 'tiene que ser una lista')
        else:
            for i, f in enumerate(p['ejemplos']):
                _frase(f, f'{donde}.ejemplos[{i}]', fallos, completa)
    if tipo == 'tabla':
        _texto(p['nota'], f'{donde}.nota', fallos, completa)
        for i, cel in enumerate(p['columnas'] if isinstance(p['columnas'], list) else []):
            _mixto(cel, f'{donde}.columnas[{i}]', fallos, False)
        if not isinstance(p['columnas'], list):
            fallos(f'{donde}.columnas', 'tiene que ser una lista')
        if not isinstance(p['filas'], list) or (completa and not p['filas']):
            fallos(f'{donde}.filas', 'tiene que ser una lista con filas')
        else:
            for i, fila in enumerate(p['filas']):
                if not isinstance(fila, list):
                    fallos(f'{donde}.filas[{i}]', 'tiene que ser una lista')
                    continue
                for j, cel in enumerate(fila):
                    _mixto(cel, f'{donde}.filas[{i}][{j}]', fallos, False)
    if tipo == 'vocabulario':
        _texto(p['titulo'], f'{donde}.titulo', fallos, completa)
        # puede ir vacía: algunas lecciones originales traen un bloque de vocabulario sin palabras (se conserva tal cual;
        # la app no lo juega). Ver avisos_leccion().
        _lista_textos(p['palabras'], f'{donde}.palabras', fallos, completa)
    if tipo in ('dialogo', 'texto'):
        _texto(p['titulo'], f'{donde}.titulo', fallos, completa)
        if not isinstance(p['frases'], list) or (completa and not p['frases']):
            fallos(f'{donde}.frases', 'tiene que ser una lista con frases')
        else:
            for i, f in enumerate(p['frases']):
                _frase(f, f'{donde}.frases[{i}]', fallos, completa)
                if completa and tipo == 'dialogo' and isinstance(f, dict) and not _lleno(f.get('alumno')):
                    fallos(f'{donde}.frases[{i}].alumno', 'falta la traducción')
    if tipo in EJERCICIOS:
        if not _lleno(p['id']):
            fallos(f'{donde}.id', 'falta el identificador')
        elif p['id'] in ids:
            fallos(f'{donde}.id', f'identificador repetido «{p["id"]}»')
        else:
            ids.add(p['id'])
        _mixto(p['pregunta'], f'{donde}.pregunta', fallos, completa, obligatorio=(tipo in ('test', 'escribir')))
        _mixto(p['frase'], f'{donde}.frase', fallos, completa, obligatorio=(tipo in ('huecos', 'ordenar')))
        _texto(p['traduccion'], f'{donde}.traduccion', fallos, completa)
        _texto(p['audio'], f'{donde}.audio', fallos, completa)
        _texto(p['explicacion'], f'{donde}.explicacion', fallos, completa)
        if not isinstance(p['oir_frase'], bool):
            fallos(f'{donde}.oir_frase', 'tiene que ser true o false')
        if not isinstance(p['autoevaluacion'], bool):
            fallos(f'{donde}.autoevaluacion', 'tiene que ser true o false')
        if not isinstance(p['opciones'], list):
            fallos(f'{donde}.opciones', 'tiene que ser una lista')
        else:
            for i, o in enumerate(p['opciones']):
                if _claves(o, CLAVES_OPCION, f'{donde}.opciones[{i}]', fallos):
                    _texto(o['texto'], f'{donde}.opciones[{i}].texto', fallos, completa, True)
                    if o['lengua'] not in LENGUAS_TEXTO:
                        fallos(f'{donde}.opciones[{i}].lengua', 'tiene que ser "estudio" o "alumno"')
                    _texto(o['explicacion'], f'{donde}.opciones[{i}].explicacion', fallos, completa)
                    if not isinstance(o['correcta'], bool):
                        fallos(f'{donde}.opciones[{i}].correcta', 'tiene que ser true o false')
        r = p['respuestas']
        if _claves(r, CLAVES_RESPUESTAS, f'{donde}.respuestas', fallos):
            if r['lengua'] not in LENGUAS_TEXTO:
                fallos(f'{donde}.respuestas.lengua', 'tiene que ser "estudio" o "alumno"')
            _lista_textos(r['textos'], f'{donde}.respuestas.textos', fallos, completa, obligatorio=(tipo == 'escribir'))
        # lo que necesita cada ejercicio para poder jugarse
        if completa:
            if tipo in ('test', 'traduccion', 'huecos'):
                ops = p['opciones'] if isinstance(p['opciones'], list) else []
                if len(ops) < 2:
                    fallos(f'{donde}.opciones', 'necesita al menos 2 opciones')
                if sum(1 for o in ops if isinstance(o, dict) and o.get('correcta') is True) != 1:
                    fallos(f'{donde}.opciones', 'necesita exactamente una opción correcta')
            elif p['opciones']:
                fallos(f'{donde}.opciones', f'un ejercicio «{tipo}» no lleva opciones')
            if tipo == 'huecos' and isinstance(p['frase'], dict) and '__' not in p['frase'].get('texto', ''):
                fallos(f'{donde}.frase', 'la frase de un hueco tiene que llevar ___')
            if tipo == 'traduccion' and isinstance(p['pregunta'], dict) and isinstance(p['frase'], dict) \
                    and not (_lleno(p['pregunta']['texto']) or _lleno(p['frase']['texto'])):
                fallos(donde, 'una traducción necesita pregunta o frase')
            if tipo != 'escribir' and isinstance(r, dict) and r.get('textos'):
                fallos(f'{donde}.respuestas', f'un ejercicio «{tipo}» no lleva respuestas escritas')


def validar_leccion(L, c=None, l=None, id_=None, completa=True):
    """Devuelve la lista de fallos (vacía si el JSON cumple la plantilla). completa=False: solo la forma, sin exigir
    textos llenos (para los esqueletos recién creados)."""
    fallos = Fallos()
    if not _claves(L, CLAVES_LECCION, 'lección', fallos):
        return fallos
    if L['formato'] != FORMATO:
        fallos('formato', f'tiene que ser "{FORMATO}"')
    if L['modelo'] not in MODELOS:
        fallos('modelo', f'tiene que ser uno de estos: {list(MODELOS)} (explicar siempre primero)')
        return fallos
    nombre, etapas = MODELOS[L['modelo']]
    if L['nombre_modelo'] != nombre:
        fallos('nombre_modelo', f'el modelo {L["modelo"]} se llama "{nombre}"')
    if c is not None and L['curso'] != c:
        fallos('curso', f'tiene que ser "{c}"')
    if l is not None and L['alumno'] != l:
        fallos('alumno', f'tiene que ser "{l}"')
    if L['alumno'] not in ('es', 'en', 'vi') or L['alumno'] == L['curso']:
        fallos('alumno', 'idioma del alumno no válido')
    if id_ is not None and L['id'] != id_:
        fallos('id', f'tiene que ser "{id_}"')
    for k in ('numero', 'capitulo'):
        if not isinstance(L[k], int) or isinstance(L[k], bool):
            fallos(k, 'tiene que ser un número entero')
    if not isinstance(L['orden'], (int, float)) or isinstance(L['orden'], bool):
        fallos('orden', 'tiene que ser un número')
    if _claves(L['titulo'], CLAVES_TITULO, 'titulo', fallos):
        _texto(L['titulo']['estudio'], 'titulo.estudio', fallos, completa, True)
        _texto(L['titulo']['alumno'], 'titulo.alumno', fallos, completa, True)
    _texto(L['intro'], 'intro', fallos, completa)
    if not isinstance(L['palabras'], list):
        fallos('palabras', 'tiene que ser una lista')
    else:
        vistas = set()
        for i, p in enumerate(L['palabras']):
            donde = f'palabras[{i}]'
            if not _claves(p, CLAVES_PALABRA, donde, fallos):
                continue
            for k in CLAVES_PALABRA[:-1]:
                _texto(p[k], f'{donde}.{k}', fallos, completa, obligatorio=(k in ('palabra', 'significado')))
            if not isinstance(p['oculta'], bool):
                fallos(f'{donde}.oculta', 'tiene que ser true o false')
            if p['palabra'] in vistas:
                fallos(donde, f'palabra repetida «{p["palabra"]}»')
            vistas.add(p['palabra'])
    if not isinstance(L['etapas'], list) or [e.get('etapa') if isinstance(e, dict) else None for e in L['etapas']] != etapas:
        fallos('etapas', f'el modelo {L["modelo"]} lleva exactamente estas etapas en este orden: {etapas}')
        return fallos
    ids = set()
    piezas = 0
    for i, e in enumerate(L['etapas']):
        donde = f'etapas[{i}]'
        if not _claves(e, CLAVES_ETAPA, donde, fallos):
            continue
        if not isinstance(e['piezas'], list):
            fallos(f'{donde}.piezas', 'tiene que ser una lista')
            continue
        for j, p in enumerate(e['piezas']):
            if isinstance(p, dict) and ETAPA_DE.get(p.get('tipo')) not in (None, e['etapa']):
                fallos(f'{donde}.piezas[{j}]', f'una pieza «{p["tipo"]}» no puede ir en la etapa «{e["etapa"]}»')
            _pieza(p, f'{donde}.piezas[{j}]', fallos, completa, ids)
            piezas += 1
    if completa and piezas == 0:
        fallos('etapas', 'la lección no tiene ninguna pieza')
    if completa and L['etapas'][-1]['piezas'] == []:
        fallos('etapas', 'la lección no tiene ningún ejercicio')
    return fallos


def avisos_leccion(L):
    """Lo que se conserva del original aunque la app no lo pueda jugar (no es un fallo de la plantilla)."""
    avisos = []
    for e in L.get('etapas', []):
        for p in e.get('piezas', []):
            if p.get('tipo') == 'explicacion' and not p.get('texto'):
                avisos.append('explicación sin texto, solo con título (ya venía así)')
            if p.get('tipo') == 'vocabulario' and not p.get('palabras'):
                avisos.append('bloque de vocabulario sin palabras (ya venía así)')
            if p.get('tipo') == 'ordenar' and len(p.get('frase', {}).get('texto', '').split()) < 2:
                avisos.append(f'ordenar {p.get("id")}: la frase es una sola palabra y no se puede ordenar (ya venía así)')
    return avisos


def validar_capitulos(caps, completa=True):
    fallos = Fallos()
    if not isinstance(caps, list):
        fallos('capítulos', 'tiene que ser una lista')
        return fallos
    for i, cap in enumerate(caps):
        donde = f'capítulo[{i}]'
        if not _claves(cap, CLAVES_CAPITULO, donde, fallos):
            continue
        if not isinstance(cap['numero'], int):
            fallos(f'{donde}.numero', 'tiene que ser un número entero')
        _texto(cap['nivel'], f'{donde}.nivel', fallos, completa)
        if _claves(cap['titulo'], CLAVES_TITULO, f'{donde}.titulo', fallos):
            _texto(cap['titulo']['estudio'], f'{donde}.titulo.estudio', fallos, completa)
            _texto(cap['titulo']['alumno'], f'{donde}.titulo.alumno', fallos, completa, True)
        _texto(cap['descripcion'], f'{donde}.descripcion', fallos, completa)
    return fallos
