# Lee una lección original (cursos/<c>/lessons/NNN.json, en cualquiera de sus dos formatos) y la devuelve con la forma
# estricta de los modelos, pero con cada texto para el alumno guardado como Fuente: el texto en los idiomas que ya
# existen (español siempre; inglés de máquina; en el curso de español, inglés y vietnamita de sus catálogos).
# preparar.py decide después, carpeta a carpeta, qué se copia y qué tiene que adaptar un subagente.
#
# Formatos de origen:
#   v1  (todos los cursos menos el de español): el texto estudiado bajo el código del curso («da», «ind»…), la traducción
#       española bajo «es» y los textos de ayuda como {"@es": …, "@en": …}.
#   v2  (curso de español): solo la estructura en lessons/ y todos los textos en traducciones/<idioma>/NNN.json.

import os
import re
from collections import Counter

from comun import (CURSOS, CAMPO, CURSOS_DIR, TRABAJO, ETAPA_DE, EJERCICIOS, leer_json, escribir_json, mixto,
                   pieza_vacia, frase_vacia, palabra_vacia, ids_originales)


# Cursos cuyas pronunciaciones están escritas a la española (se adaptan para angloparlantes y vietnamitas). En chino,
# japonés y coreano son romanizaciones estándar (pinyin, Hepburn, McCune-Reischauer): valen para todos y no se tocan.
PRON_ADAPTABLE = {c for c in CURSOS if c not in ('zh', 'ja', 'ko', 'es')}


class Fuente:
    """Un texto para el alumno. v: {lengua: texto}. d: qué es (para el subagente). ctx: el texto estudiado al que
    acompaña, si lo hay."""
    __slots__ = ('v', 'd', 'ctx', 'clase')

    def __init__(self, d='', ctx='', clase='texto', **v):
        self.v = {k: x.strip('﻿') for k, x in v.items() if isinstance(x, str) and x.strip()}
        self.d = d
        self.ctx = ctx
        self.clase = clase

    def __bool__(self):
        return bool(self.v)

    def __repr__(self):
        return f'Fuente({self.d!r}, {self.v!r})'


def es_esen(v):
    return isinstance(v, dict) and '@es' in v and '@en' in v


def texto_de(v):
    if isinstance(v, str):
        return v
    if isinstance(v, list):
        return '\n\n'.join(x for x in v if isinstance(x, str))
    return ''


def fuente(v, d='', ctx=''):
    """Un valor de una lección v1 que es texto de ayuda (siempre en el idioma del alumno)."""
    if es_esen(v):
        return Fuente(d, ctx, es=texto_de(v['@es']), en=texto_de(v['@en']))
    if isinstance(v, str):
        return Fuente(d, ctx, es=v)
    return Fuente(d, ctx)


# ---------------------------------------------------------------------------
# ¿Está en español o en el idioma del curso? (para los textos sueltos que pueden ser de los dos)
# ---------------------------------------------------------------------------
TOKEN = re.compile(r"[^\W\d_]+", re.UNICODE)
NEGRITA_O_CITA = re.compile(r'\*\*.+?\*\*|«[^»]*»|"[^"]*"')


def tokens(s):
    return [t.lower() for t in TOKEN.findall(s or '')]


_LEX = None


def lexicos():
    """{'es': {curso: set de palabras españolas vistas en los textos de los OTROS cursos}, 'estudio': {curso: set}}.
    Se guarda en _trabajo/lexicos.json."""
    global _LEX
    if _LEX is not None:
        return _LEX
    ruta = os.path.join(TRABAJO, 'lexicos.json')
    if os.path.exists(ruta):
        datos = leer_json(ruta)
        _LEX = {'es_por_curso': {c: Counter(v) for c, v in datos['es_por_curso'].items()},
                'estudio': {c: set(v) for c, v in datos['estudio'].items()},
                'estudio_puro': {c: set(v) for c, v in datos['estudio_puro'].items()}}
        return _LEX
    es_por_curso = {c: Counter() for c in CURSOS}
    estudio = {c: set() for c in CURSOS}
    pron = {c: set() for c in CURSOS}   # las pronunciaciones escritas (a la española o romanizadas)

    def esp(c, s):
        if isinstance(s, str):
            es_por_curso[c].update(set(tokens(NEGRITA_O_CITA.sub(' ', s))))

    def andar_es(c, o, padre=''):
        if isinstance(o, dict):
            if es_esen(o):
                esp(c, texto_de(o['@es']))
                return
            for k, v in o.items():
                if padre == 'palabras':
                    andar_es(c, v, 'palabra')
                elif k == 'es' and padre in ('palabra', 'frase') and isinstance(v, str):
                    esp(c, v)
                else:
                    andar_es(c, v, 'frase' if k == 'frases' else k)
        elif isinstance(o, list):
            for x in o:
                andar_es(c, x, padre)

    for c in CURSOS:
        campo = CAMPO[c]
        if c == 'es':
            # el español estudiado también es español
            carpeta = os.path.join(CURSOS_DIR, 'es', 'traducciones', 'es')
            for n in os.listdir(carpeta):
                if n[0].isdigit():
                    for k, v in leer_json(os.path.join(carpeta, n)).items():
                        if isinstance(v, str) and k != 'idioma':
                            esp('es', v)
                            estudio['es'].update(tokens(v))
            continue
        for id_ in ids_originales(c):
            L = leer_json(os.path.join(CURSOS_DIR, c, 'lessons', f'{id_}.json'))
            andar_es(c, L)
            est = estudio[c]
            est.update(tokens(L.get(f'titulo_{campo}', '')))
            for k, v in (L.get('palabras') or {}).items():
                est.update(tokens(k))
                if isinstance(v, dict):
                    for campo2 in ('plural', 'definida'):
                        est.update(tokens(v.get(campo2, '')))
                    for campo2 in ('pron', 'ipa'):
                        pron[c].update(tokens(v.get(campo2, '')))
            for b in L.get('bloques', []):
                for f in b.get('frases', []) or []:
                    if isinstance(f, dict):
                        est.update(tokens(f.get(campo, '')))
                        for par in f.get('analisis', []) or []:
                            if isinstance(par, list) and par and isinstance(par[0], str):
                                est.update(tokens(par[0]))
                if b.get('tipo') in ('ordenar', 'huecos'):
                    est.update(tokens(b.get('frase', '')))
                if b.get('tipo') == 'huecos':
                    for o in b.get('opciones', []) or []:
                        if isinstance(o, dict) and isinstance(o.get('texto'), str):
                            est.update(tokens(o['texto']))
                if isinstance(b.get('audio'), str):
                    est.update(tokens(b['audio']))
    os.makedirs(TRABAJO, exist_ok=True)
    # «estudio» (para clasificar textos sueltos) cuenta también las pronunciaciones: en las tablas de chino, japonés o
    # coreano van romanizaciones. «estudio_puro» no: una pronunciación entre «» se adapta, no se copia.
    con_pron = {c: estudio[c] | pron[c] for c in CURSOS}
    escribir_json(ruta, {'es_por_curso': {c: dict(v) for c, v in es_por_curso.items()},
                         'estudio': {c: sorted(v) for c, v in con_pron.items()},
                         'estudio_puro': {c: sorted(v) for c, v in estudio.items()}}, sangria=None)
    _LEX = {'es_por_curso': es_por_curso, 'estudio': con_pron, 'estudio_puro': estudio}
    return _LEX


_ESP_CACHE = {}


def espanol_para(c):
    """Palabras españolas para clasificar textos del curso c: las vistas en los textos españoles de otros cursos."""
    if c not in _ESP_CACHE:
        total = Counter()
        for otro, cnt in lexicos()['es_por_curso'].items():
            if otro != c:
                for t in cnt:
                    total[t] += 1
        _ESP_CACHE[c] = {t for t, n in total.items() if n >= 1}
    return _ESP_CACHE[c]


def pistas(c, s):
    """(palabras que solo son españolas, palabras que solo son del idioma estudiado) en el texto s."""
    esp = espanol_para(c)
    est = lexicos()['estudio'][c]
    ts = tokens(s)
    solo_es = [t for t in ts if t in esp and t not in est]
    solo_est = [t for t in ts if t in est and t not in esp]
    return solo_es, solo_est


def parece_espanol(c, s):
    if not isinstance(s, str) or not s.strip():
        return False
    if '¿' in s or '¡' in s:
        return True
    solo_es, solo_est = pistas(c, s)
    return len(solo_es) > len(solo_est)


def lengua_de_texto_suelto(c, s):
    """Para un texto suelto (sin @es/@en) en un sitio que puede ser de las dos lenguas: 'alumno' si lleva algo
    de español, si no 'estudio'. Devuelve (lengua, dudoso)."""
    if not isinstance(s, str) or not s.strip():
        return 'estudio', False
    if '¿' in s or '¡' in s:
        return 'alumno', False
    solo_es, solo_est = pistas(c, s)
    if not solo_es:
        return 'estudio', False
    if solo_est:
        return 'alumno', True     # mezcla: el subagente conserva lo del idioma estudiado y traduce lo español
    return 'alumno', False


def mixto_v1(c, v, d='', ctx='', forzar=None):
    """Un texto que puede ser estudiado o de ayuda. Devuelve {'texto': str | Fuente, 'lengua': …}."""
    if v is None or v == '':
        return mixto('', forzar or 'alumno')
    if es_esen(v):
        return {'texto': fuente(v, d, ctx), 'lengua': 'alumno'}
    if not isinstance(v, str):
        v = texto_de(v)
    if forzar == 'estudio':
        return mixto(v, 'estudio')
    lengua, dudoso = lengua_de_texto_suelto(c, v)
    if lengua == 'estudio':
        return mixto(v, 'estudio')
    f = Fuente(d + (' (puede llevar trozos en el idioma estudiado: esos se copian igual)' if dudoso else ''), ctx, es=v)
    return {'texto': f, 'lengua': 'alumno'}


# ---------------------------------------------------------------------------
# v1
# ---------------------------------------------------------------------------
def corto(s, n=70):
    s = ' '.join(str(s).split())
    return s if len(s) <= n else s[:n - 1] + '…'


def frase_v1(c, f, donde):
    campo = CAMPO[c]
    r = frase_vacia()
    est = f.get(campo, '')
    est = est if isinstance(est, str) else texto_de(est)
    r['estudio'] = est
    ctx = corto(est, 90)
    q = f.get('quien')
    if isinstance(q, str) and q.strip():
        r['quien'] = mixto_v1(c, q, f'{donde} · quién habla', ctx)
    trad_es = f.get('es')
    trad_en = f.get('en') if campo != 'en' else None
    if es_esen(trad_es):
        r['alumno'] = Fuente(f'{donde} · traducción de la frase', ctx, es=texto_de(trad_es['@es']), en=texto_de(trad_es['@en']))
    else:
        r['alumno'] = Fuente(f'{donde} · traducción de la frase', ctx, es=trad_es if isinstance(trad_es, str) else '',
                             en=trad_en if isinstance(trad_en, str) else '')
    if f.get('literal') is not None:
        r['literal'] = fuente(f['literal'], f'{donde} · traducción literal', ctx)
    if f.get('estructura') is not None:
        r['estructura'] = fuente(f['estructura'], f'{donde} · explicación de la estructura', ctx)
    notas = f.get('nota')
    if notas is not None:
        lista = notas if isinstance(notas, list) else [notas]
        r['nota'] = [fuente(n, f'{donde} · nota', ctx) for n in lista if n]
    for par in f.get('analisis', []) or []:
        if isinstance(par, list) and len(par) >= 2 and isinstance(par[0], str):
            r['analisis'].append([par[0], fuente(par[1], f'{donde} · función gramatical de «{par[0]}»', ctx)])
    if f.get('parrafo') == 1:
        r['parrafo'] = 1
    return r


def opciones_v1(c, b, tipo, donde, pregunta_ctx):
    salida = []
    correcta = b.get('correcta')
    comparar = lambda x: str(x).strip().lower()
    forzar = 'estudio' if tipo == 'huecos' else None
    ops = b.get('opciones')
    if isinstance(ops, list) and any(isinstance(o, dict) for o in ops):
        for i, o in enumerate(o for o in ops if isinstance(o, dict)):
            m = mixto_v1(c, o.get('texto'), f'{donde} · opción {i + 1}', pregunta_ctx, forzar if not es_esen(o.get('texto')) else None)
            salida.append({'texto': m['texto'], 'lengua': m['lengua'],
                           'explicacion': fuente(o.get('explicacion'), f'{donde} · explicación de la opción {i + 1}', pregunta_ctx) if o.get('explicacion') else '',
                           'correcta': o.get('correcta') is True})
    elif isinstance(ops, list):
        for i, o in enumerate(ops):
            m = mixto_v1(c, str(o), f'{donde} · opción {i + 1}', pregunta_ctx, forzar)
            salida.append({'texto': m['texto'], 'lengua': m['lengua'], 'explicacion': '',
                           'correcta': correcta is not None and comparar(o) == comparar(correcta)})
    elif isinstance(ops, dict):
        for i, (texto, expl) in enumerate(ops.items()):
            m = mixto_v1(c, texto, f'{donde} · opción {i + 1}', pregunta_ctx, forzar)
            salida.append({'texto': m['texto'], 'lengua': m['lengua'],
                           'explicacion': fuente(expl, f'{donde} · explicación de la opción {i + 1}', pregunta_ctx) if expl else '',
                           'correcta': correcta is not None and comparar(texto) == comparar(correcta)})
    return salida


def pieza_v1(c, b, n_bloque, contadores):
    tipo = str(b.get('tipo', '')).strip().lower()
    if tipo not in ETAPA_DE:
        return None
    p = pieza_vacia(tipo)
    donde = f'{tipo} {n_bloque}'
    tit = b.get('titulo')
    if 'titulo' in p and tit:
        if tipo == 'tabla' or tipo in ('explicacion', 'gramatica', 'vocabulario', 'dialogo', 'texto'):
            p['titulo'] = fuente(tit, f'{donde} · título')
            donde = f'{tipo} «{corto(texto_de(tit["@es"]) if es_esen(tit) else tit, 40)}»'
    if 'tutora' in p and isinstance(b.get('tutora'), str):
        p['tutora'] = b['tutora']
    if tipo == 'explicacion':
        t = b.get('texto')
        lista = t if isinstance(t, list) else [t]
        p['texto'] = [fuente(x, f'{donde} · párrafo {i + 1}') for i, x in enumerate(lista) if x]
    elif tipo == 'gramatica':
        t = b.get('texto')
        lista = t if isinstance(t, list) else ([t] if t else [])
        p['texto'] = [fuente(x, f'{donde} · párrafo {i + 1}') for i, x in enumerate(lista) if x]
        p['ejemplos'] = [frase_v1(c, f, f'{donde} · ejemplo {i + 1}') for i, f in enumerate(b.get('ejemplos', []) or []) if isinstance(f, dict)]
    elif tipo == 'tabla':
        p['columnas'] = [mixto_v1(c, x, f'{donde} · cabecera de la columna {i + 1}') for i, x in enumerate(b.get('columnas', []) or [])]
        for i, fila in enumerate(b.get('filas', []) or []):
            p['filas'].append([mixto_v1(c, x, f'{donde} · fila {i + 1}, columna {j + 1}') for j, x in enumerate(fila)])
        if b.get('nota'):
            p['nota'] = fuente(b['nota'], f'{donde} · nota de la tabla')
    elif tipo == 'vocabulario':
        p['palabras'] = [str(x) for x in b.get('palabras', []) or []]
    elif tipo in ('dialogo', 'texto'):
        p['frases'] = [frase_v1(c, f, f'{donde} · frase {i + 1}') for i, f in enumerate(b.get('frases', []) or [])
                       if isinstance(f, dict) and isinstance(f.get(CAMPO[c]), str) and f[CAMPO[c]].strip()]
        if not p['frases']:
            return None
    else:  # ejercicios
        contadores[tipo] = contadores.get(tipo, 0) + 1
        p['id'] = str(b.get('id')) if b.get('id') not in (None, '') else ''
        donde = f'ejercicio {n_bloque} ({tipo})'
        frase = b.get('frase')
        if frase not in (None, ''):
            p['frase'] = mixto_v1(c, frase, f'{donde} · frase', forzar='estudio' if tipo in ('huecos', 'ordenar') else None)
        frase_ctx = corto(texto_de(frase), 90) if isinstance(frase, str) else ''
        preg = b.get('pregunta')
        if preg not in (None, ''):
            p['pregunta'] = mixto_v1(c, preg, f'{donde} · enunciado', frase_ctx)
        preg_txt = texto_de(preg['@es']) if es_esen(preg) else (preg if isinstance(preg, str) else '')
        ctx = corto(' · '.join(x for x in (preg_txt, frase_ctx) if x), 110)
        if b.get('traduccion') not in (None, ''):
            p['traduccion'] = fuente(b['traduccion'], f'{donde} · traducción de la frase', frase_ctx)
        if isinstance(b.get('audio'), str) and b['audio'].strip():
            p['audio'] = b['audio'].strip()
        elif b.get('audio') is True:
            p['oir_frase'] = True
        if tipo in ('test', 'traduccion', 'huecos'):
            p['opciones'] = opciones_v1(c, b, tipo, donde, ctx)
        if b.get('explicacion') not in (None, ''):
            p['explicacion'] = fuente(b['explicacion'], f'{donde} · explicación', ctx)
        if tipo == 'escribir':
            resp = [x for x in (b.get('respuestas') or []) if isinstance(x, str) and x.strip()]
            votos = Counter(lengua_de_texto_suelto(c, x)[0] for x in resp)
            lengua = 'alumno' if votos['alumno'] > votos['estudio'] else 'estudio'
            if lengua == 'alumno':
                p['respuestas'] = {'lengua': 'alumno', 'textos': [Fuente(f'{donde} · respuesta aceptada {i + 1}', ctx, es=x) for i, x in enumerate(resp)]}
            else:
                p['respuestas'] = {'lengua': 'estudio', 'textos': resp}
            p['autoevaluacion'] = b.get('autoevaluacion') is True
    return p


def normalizar_v1(c, L):
    campo = CAMPO[c]
    r = {
        'numero': L.get('numero_curso') if isinstance(L.get('numero_curso'), int) else None,
        'orden': L.get('orden_curso') if isinstance(L.get('orden_curso'), (int, float)) else None,
        'capitulo': L.get('capitulo') if isinstance(L.get('capitulo'), int) else 0,
        'titulo': {'estudio': texto_de(L.get(f'titulo_{campo}', '')), 'alumno': None},
        'intro': fuente(L.get('intro'), 'introducción de la lección (la dice la tutora al empezar)') if L.get('intro') else '',
        'palabras': [], 'piezas': [],
    }
    r['titulo']['alumno'] = fuente(L.get('titulo_es'), 'título de la lección', r['titulo']['estudio'])
    for clave, v in (L.get('palabras') or {}).items():
        w = palabra_vacia()
        w['palabra'] = clave
        if es_esen(v):
            w['significado'] = fuente(v, f'significado de «{clave}»')
            r['palabras'].append(w)
            continue
        if not isinstance(v, dict):
            w['significado'] = Fuente(f'significado de «{clave}»', es=str(v))
            r['palabras'].append(w)
            continue
        w['significado'] = Fuente(f'significado de la palabra «{clave}»', es=v.get('es') if isinstance(v.get('es'), str) else '',
                                  en=v.get('en') if campo != 'en' and isinstance(v.get('en'), str) else '')
        for k in ('ipa', 'genero', 'plural', 'definida'):
            if isinstance(v.get(k), str):
                w[k] = v[k]
        if isinstance(v.get('pron'), str) and v['pron'].strip():
            # escrita para hispanohablantes: en las carpetas en y vi se adapta (salvo las romanizaciones estándar)
            w['pron'] = Fuente(f'pronunciación aproximada de «{clave}» (escrita para hispanohablantes)', clase='pron', es=v['pron'])                 if c in PRON_ADAPTABLE else v['pron']
        if v.get('cat'):
            w['cat'] = fuente(v['cat'], f'categoría gramatical de «{clave}»')
        if v.get('consejo'):
            w['consejo'] = fuente(v['consejo'], f'consejo sobre «{clave}»')
        if v.get('nota'):
            w['nota'] = fuente(v['nota'], f'nota sobre «{clave}»')
        w['oculta'] = v.get('oculta') is True
        r['palabras'].append(w)
    contadores = {}
    for i, b in enumerate(L.get('bloques', []) or []):
        if isinstance(b, dict):
            p = pieza_v1(c, b, i + 1, contadores)
            if p:
                r['piezas'].append(p)
    return r


# ---------------------------------------------------------------------------
# v2 (curso de español)
# ---------------------------------------------------------------------------
_CAT = {}


def catalogo(l, id_):
    clave = (l, id_)
    if clave not in _CAT:
        ruta = os.path.join(CURSOS_DIR, 'es', 'traducciones', l, f'{id_}.json')
        _CAT[clave] = leer_json(ruta) if os.path.exists(ruta) else {}
    return _CAT[clave]


def normalizar_v2(L, id_):
    es, en, vi = catalogo('es', id_), catalogo('en', id_), catalogo('vi', id_)
    etq_en, etq_vi = catalogo('en', '_etiquetas'), catalogo('vi', '_etiquetas')

    def T(k, d, ctx=''):
        return Fuente(d, ctx, en=en.get(k, ''), vi=vi.get(k, ''))

    def CURSO(k):
        v = es.get(k, '')
        return v.strip() if isinstance(v, str) else ''

    def ETQ(grupo, codigo, d):
        return Fuente(d, '', en=etq_en.get(f'{grupo}.{codigo}', codigo), vi=etq_vi.get(f'{grupo}.{codigo}', codigo))

    def aplanar(unidades, frase, donde, salida=None):
        salida = [] if salida is None else salida
        for u in unidades or []:
            salida.append([u.get('texto', ''), ETQ('sintaxis', u.get('funcion', ''), f'{donde} · función gramatical de «{u.get("texto", "")}»')])
            if u.get('partes'):
                aplanar(u['partes'], frase, donde, salida)
        return salida

    def frase(k, f, donde):
        r = frase_vacia()
        r['estudio'] = CURSO(k)
        r['alumno'] = T(k, f'{donde} · traducción de la frase', corto(r['estudio'], 90))
        if isinstance(f.get('quien'), str) and f['quien'].strip():
            r['quien'] = mixto(f['quien'], 'estudio')
        r['analisis'] = aplanar((f.get('sintaxis') or {}).get('unidades'), r['estudio'], donde)
        if f.get('parrafo') == 1:
            r['parrafo'] = 1
        return r

    r = {
        'numero': L.get('numero_curso') if isinstance(L.get('numero_curso'), int) else None,
        'orden': L.get('orden_curso') if isinstance(L.get('orden_curso'), (int, float)) else None,
        'capitulo': L.get('capitulo') if isinstance(L.get('capitulo'), int) else 0,
        'titulo': {'estudio': CURSO('titulo'), 'alumno': T('titulo', 'título de la lección', CURSO('titulo'))},
        'intro': T('intro', 'introducción de la lección (la dice la tutora al empezar)'),
        'palabras': [], 'piezas': [],
    }
    for palabra, e in (L.get('palabras') or {}).items():
        if not isinstance(e, dict) or e.get('propio'):
            continue
        w = palabra_vacia()
        w['palabra'] = palabra
        w['significado'] = T(f'p.{palabra}.glosa', f'significado de la palabra «{palabra}»')
        w['pron'] = e.get('pron', '') or ''
        if e.get('cat'):
            w['cat'] = ETQ('cat', e['cat'], f'categoría gramatical de «{palabra}»')
        if e.get('genero'):
            w['genero'] = e['genero']
        w['consejo'] = T(f'p.{palabra}.consejo', f'consejo sobre «{palabra}»')
        r['palabras'].append(w)
    for n, b in enumerate(L.get('bloques', []) or []):
        tipo = b.get('tipo')
        if tipo not in ETAPA_DE:
            continue
        p = pieza_vacia(tipo)
        bid = b.get('id', f'b{n + 1}')
        donde = f'{tipo} {n + 1}'
        if 'titulo' in p:
            p['titulo'] = T(f'{bid}.titulo', f'{donde} · título')
        if tipo in ('explicacion', 'gramatica'):
            p['texto'] = [T(f'{bid}.texto', f'{donde} · texto')]
            if tipo == 'gramatica':
                p['ejemplos'] = [frase(f'{bid}.e{i}.texto', e, f'{donde} · ejemplo {i + 1}') for i, e in enumerate(b.get('ejemplos') or [])]
        elif tipo == 'vocabulario':
            p['palabras'] = [str(x) for x in b.get('palabras') or []]
        elif tipo == 'dialogo':
            p['frases'] = [frase(f'{bid}.f{i}.texto', f, f'{donde} · frase {i + 1}') for i, f in enumerate(b.get('frases') or [])]
        elif tipo == 'texto':
            if isinstance(b.get('frases'), list):
                p['frases'] = [frase(f'{bid}.f{i}.texto', f, f'{donde} · frase {i + 1}') for i, f in enumerate(b['frases'])]
            else:
                p['frases'] = [frase(f'{bid}.p{i}', {}, f'{donde} · párrafo {i + 1}') for i, _ in enumerate(b.get('parrafos') or [])]
        else:
            p['id'] = str(bid)
            donde = f'ejercicio {n + 1} ({tipo})'
            if es.get(f'{bid}.pregunta') or en.get(f'{bid}.pregunta'):
                p['pregunta'] = {'texto': T(f'{bid}.pregunta', f'{donde} · enunciado'), 'lengua': 'alumno'}
            if tipo in ('test', 'huecos'):
                p['opciones'] = [{'texto': CURSO(f'{bid}.o{i}'), 'lengua': 'estudio',
                                  'explicacion': T(f'{bid}.o{i}.refuerzo', f'{donde} · explicación de la opción {i + 1}'),
                                  'correcta': o.get('correcta') is True} for i, o in enumerate(b.get('opciones') or [])]
            if tipo == 'huecos':
                p['frase'] = mixto(CURSO(f'{bid}.frase'), 'estudio')
                p['traduccion'] = T(f'{bid}.frase', f'{donde} · traducción de la frase', CURSO(f'{bid}.frase'))
            if tipo == 'ordenar':
                p['frase'] = mixto(CURSO(f'{bid}.frase'), 'estudio')
                p['traduccion'] = T(f'{bid}.traduccion', f'{donde} · traducción de la frase', CURSO(f'{bid}.frase'))
            if tipo == 'escribir':
                p['respuestas'] = {'lengua': 'estudio', 'textos': [x for x in b.get('respuestas') or [] if isinstance(x, str) and x.strip()]}
        r['piezas'].append(p)
    return r


def normalizar(c, id_):
    L = leer_json(os.path.join(CURSOS_DIR, c, 'lessons', f'{id_}.json'))
    r = normalizar_v2(L, id_) if L.get('esquema') == 2 else normalizar_v1(c, L)
    # identificadores de ejercicio: los que faltan o se repiten se completan (el progreso guardado usa «id|<id>»)
    usados = set()
    k = 0
    for p in r['piezas']:
        if p['tipo'] not in EJERCICIOS:
            continue
        k += 1
        base = p['id'] or f'{c}{id_}-{p["tipo"]}{k}'
        idx, n = base, 2
        while idx in usados:
            idx = f'{base}-{n}'
            n += 1
        usados.add(idx)
        p['id'] = idx
    if r['numero'] is None:
        r['numero'] = int(id_)
    if r['orden'] is None:
        r['orden'] = r['numero']
    return r


def normalizar_capitulos(c):
    ruta = os.path.join(CURSOS_DIR, c, 'lessons', 'capitulos.json')
    datos = leer_json(ruta) if os.path.exists(ruta) else []
    lista = datos if isinstance(datos, list) else datos.get('capitulos', [])
    salida = []
    for i, cap in enumerate(x for x in lista if isinstance(x, dict)):
        numero = cap.get('numero', i + 1)
        if c == 'es':
            tit = cap.get('titulo') or {}
            des = cap.get('descripcion') or {}
            r = {'numero': numero, 'nivel': cap.get('nivel', '') or '',
                 'titulo': {'estudio': cap.get('titulo_es', '') or '',
                            'alumno': Fuente(f'capítulo {numero} · título', cap.get('titulo_es', ''), en=tit.get('en', ''), vi=tit.get('vi', ''))},
                 'descripcion': Fuente(f'capítulo {numero} · descripción', '', en=des.get('en', ''), vi=des.get('vi', ''))}
        else:
            campo = CAMPO[c]
            est = cap.get(f'titulo_{campo}', '') or ''
            r = {'numero': numero, 'nivel': cap.get('nivel', '') or '',
                 'titulo': {'estudio': est if isinstance(est, str) else '',
                            'alumno': fuente(cap.get('titulo_es', ''), f'capítulo {numero} · título', est if isinstance(est, str) else '')},
                 'descripcion': fuente(cap.get('descripcion', ''), f'capítulo {numero} · descripción') if cap.get('descripcion') else ''}
        salida.append(r)
    return salida
