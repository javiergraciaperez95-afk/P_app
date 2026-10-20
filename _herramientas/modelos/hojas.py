# Las hojas de trabajo de los subagentes: qué textos de una lección hay que adaptar, cómo se les enseñan y cómo se
# comprueba lo que devuelven antes de meterlo en el JSON.
#
#   _trabajo/<curso>/<alumno>/<id>.mapa.json   lo que hay que hacer (ruta de cada texto en el JSON, el original…)
#   _trabajo/<curso>/<alumno>/<id>.txt         la respuesta del subagente: «[n]» en una línea y debajo el texto
#   _trabajo/<curso>/<alumno>/<id>.ok          hecho (el JSON de cursos/ ya lleva los textos)
# <id> es el número de la lección (001…) o «capitulos».

import os
import re

from comun import TRABAJO, NOMBRE, MODELOS, leer_json

NOMBRE_LENGUA = {'es': 'español', 'en': 'inglés', 'vi': 'vietnamita'}
PARA = {'es': 'hispanohablantes', 'en': 'angloparlantes', 'vi': 'vietnamitas'}


def carpeta(c, l):
    return os.path.join(TRABAJO, c, l)


def ruta_mapa(c, l, id_):
    return os.path.join(carpeta(c, l), f'{id_}.mapa.json')


def ruta_respuesta(c, l, id_):
    return os.path.join(carpeta(c, l), f'{id_}.txt')


def ruta_ok(c, l, id_):
    return os.path.join(carpeta(c, l), f'{id_}.ok')


def relativa(ruta):
    return os.path.relpath(ruta, os.path.dirname(TRABAJO)).replace('\\', '/')


# ---------------------------------------------------------------------------
# La hoja que lee el subagente
# ---------------------------------------------------------------------------
def texto_hoja(mapa):
    c, l, id_ = mapa['curso'], mapa['alumno'], mapa['id']
    lineas = []
    n = len(mapa['entradas'])
    if id_ == 'capitulos':
        lineas.append(f'# HOJA {c}/{l}/capitulos · curso de {NOMBRE[c]} para {PARA[l]} · títulos de los capítulos · {n} textos')
    else:
        nombre, etapas = MODELOS[mapa['modelo']]
        lineas.append(f'# HOJA {c}/{l}/{id_} · curso de {NOMBRE[c]} para {PARA[l]} · {n} textos')
        lineas.append(f'# Recorrido de esta lección (modelo {mapa["modelo"]}): {" → ".join(etapas)}.')
        if mapa.get('reordenada'):
            lineas.append(f'# OJO: en la lección original el orden era {" → ".join(mapa["orden_original"])} → practicar. '
                          'Los textos marcados con ⚠ hablan del orden («arriba», «en el diálogo que acabas de leer», «a continuación»…): '
                          'ajusta esa referencia para que valga con el recorrido nuevo, sin cambiar nada más.')
    solo_orden = all(e['tipo'] == 'orden' for e in mapa['entradas'])
    if solo_orden:
        lineas.append(f'# Estos textos ya están en {NOMBRE_LENGUA[l]}: devuélvelos IGUAL salvo la referencia al orden.')
    else:
        lineas.append(f'# Escribe cada texto en {NOMBRE_LENGUA[l].upper()}, adaptado a {PARA[l]}. Lo que esté en {NOMBRE[c]} '
                      f'(entre «», en **negrita** o suelto) se copia EXACTAMENTE igual.')
    lineas.append(f'# Escribe la respuesta (herramienta Write) en: {ruta_respuesta(c, l, id_)}')
    lineas.append(f'#   formato: una línea que solo dice [n] y debajo el texto; todas las n (1 a {n}), en orden.')
    lineas.append(f'# Después entrega: py -X utf8 "{os.path.join(os.path.dirname(os.path.abspath(__file__)), "entregar.py")}" {c} {l} {id_}')
    lineas.append('')
    grupo_antes = None
    for e in mapa['entradas']:
        # «diálogo 2 · frase 3 · traducción de la frase»: el grupo (y la frase en el idioma del curso) se escribe una vez
        grupo, _, campo = e['d'].rpartition(' · ')
        if not grupo:
            campo = e['d']
        clave_grupo = (grupo, e.get('ctx', ''))
        if grupo and clave_grupo != grupo_antes:
            lineas.append(f'— {grupo}' + (f' · {NOMBRE[c]}: «{e["ctx"]}»' if e.get('ctx') else ''))
        elif not grupo and e.get('ctx'):
            campo += f' · {NOMBRE[c]}: «{e["ctx"]}»'
        grupo_antes = clave_grupo if grupo else None
        cab = f'[{e["n"]}] {campo}'
        if e['tipo'] == 'orden' or e.get('aviso_orden'):
            cab += ' · ⚠ habla del orden'
        if e['fuente_lengua'] != 'es' and e['tipo'] != 'orden':
            cab += f' · (original en {NOMBRE_LENGUA[e["fuente_lengua"]]})'
        lineas.append(cab)
        lineas.append(e['fuente'])
        lineas.append('')
    return '\n'.join(lineas)


# ---------------------------------------------------------------------------
# La respuesta
# ---------------------------------------------------------------------------
CABECERA = re.compile(r'^\s*\[(\d+)\]\s*$')


def leer_respuesta(texto):
    """{n: texto}. Lanza ValueError con el motivo si el archivo está mal escrito."""
    textos = {}
    actual = None
    trozo = []
    antes = []

    def cerrar():
        if actual is not None:
            valor = '\n'.join(trozo).strip('\n').strip()
            if actual in textos:
                raise ValueError(f'el número [{actual}] sale dos veces')
            textos[actual] = valor

    for linea in texto.replace('\r\n', '\n').replace('﻿', '').split('\n'):
        m = CABECERA.match(linea)
        if m:
            cerrar()
            actual = int(m.group(1))
            trozo = []
        elif actual is None:
            if linea.strip():
                antes.append(linea)
        else:
            trozo.append(linea)
    cerrar()
    if not textos:
        raise ValueError('no hay ningún texto: cada uno empieza con una línea que solo dice [n]')
    return textos


# ---------------------------------------------------------------------------
# Comprobaciones de lo que devuelve el subagente
# ---------------------------------------------------------------------------
STOP_ES = set('''y o u de la el que en los las por con una un es del se para no al lo como más pero sus le ya este sí porque esta
entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante
ellos esto antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas
algunas algo nosotros mi mis tú te ti tu tus ellas vosotros os significa dice palabra frase cómo dónde cuándo cuál ejemplo
verbo sujeto también así aquí ahí allí eres soy está están estoy tiene tienen hace hacer decir ser fíjate mira escucha
recuerda'''.split()) - set('no me sin con ya ni mi te ti tu os ante e'.split())
_STOP = {}


def stop_para(c):
    """Las palabras que delatan español en un texto de este curso (sin las que también son del idioma estudiado)."""
    if c not in _STOP:
        from normalizar import lexicos
        _STOP[c] = STOP_ES - lexicos()['estudio_puro'].get(c, set())
    return _STOP[c]
LETRAS_VI = re.compile(r'[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]', re.IGNORECASE)
FRAG = re.compile(r'\*\*(.+?)\*\*|«([^»]+)»')
PALABRA = re.compile(r"[^\W\d_]+", re.UNICODE)


def sin_citas(s):
    return FRAG.sub(' ', s)


def palabras_es(s, stop=STOP_ES):
    """Palabras gramaticales españolas del texto (solo las escritas en minúscula: «Mira», «Ana» son nombres)."""
    return [w.lower() for w in PALABRA.findall(sin_citas(s)) if w[:1].islower() and w.lower() in stop]


# palabras en minúscula con tilde española (las de mayúscula suelen ser nombres: José, Müller…)
TILDE_ES = re.compile(r'(?<![^\W\d_])[a-zñ]*[áéíóúñ][a-záéíóúñ]*', re.UNICODE)


def delata_espanol(c, s):
    """Si un texto lleva algo que solo puede ser español (fuera de «» y negritas): palabras gramaticales, ¿¡ o
    palabras en minúscula con tilde española. Los nombres propios no cuentan."""
    limpio = sin_citas(s)
    from normalizar import lexicos
    propias = lexicos()['estudio_puro'].get(c, set())
    tildes = [w for w in TILDE_ES.findall(limpio) if w.lower() not in propias]
    return bool(palabras_es(limpio, stop_para(c))) or '¿' in limpio or '¡' in limpio or bool(tildes)


def proporcion_espanol(c, s, lengua='en'):
    """(palabras que delatan español, palabras en total, cuáles) en el texto entero, sin lo que va entre «» o en
    negrita. Delatan español las palabras gramaticales españolas en minúscula y las palabras con tilde española que no
    son del idioma estudiado."""
    from normalizar import lexicos
    propias = lexicos()['estudio_puro'].get(c, set())
    stop = stop_para(c)
    palabras = PALABRA.findall(sin_citas(s))
    cuales = []
    for w in palabras:
        b = w.lower()
        if not w[:1].islower() or b in propias:
            continue
        # en vietnamita las tildes son de su idioma: solo cuentan las palabras gramaticales españolas
        if b in stop or (lengua != 'vi' and TILDE_ES.fullmatch(b)):
            cuales.append(b)
    return len(cuales), len(palabras), cuales


def comprobar(mapa, textos):
    """Devuelve (errores, avisos). Los errores impiden entregar."""
    errores, avisos = [], []
    l = mapa['alumno']
    stop = stop_para(mapa['curso'])
    esperados = [e['n'] for e in mapa['entradas']]
    faltan = [n for n in esperados if n not in textos]
    sobran = [n for n in textos if n not in esperados]
    if faltan:
        errores.append(f'faltan los textos {faltan[:30]}{"…" if len(faltan) > 30 else ""} (hay que devolver los {len(esperados)})')
    if sobran:
        errores.append(f'sobran los números {sobran[:30]}: no están en la hoja')
    for e in mapa['entradas']:
        n = e['n']
        if n not in textos:
            continue
        t = textos[n]
        f = e['fuente']
        if not t.strip():
            errores.append(f'[{n}] está vacío')
            continue
        if re.search(r'^\s*\[\d+\]', t, re.M):
            errores.append(f'[{n}] lleva dentro una línea con [número]: separa bien cada texto')
        for frag in e.get('fragmentos', []):
            if frag not in t:
                errores.append(f'[{n}] falta «{frag}» tal cual (está en {NOMBRE[mapa["curso"]]} y se copia igual)')
        if e['tipo'] == 'orden':
            continue
        if e.get('clase') == 'pron':
            if '\n' in t or len(t) > 2 * len(f) + 20:
                errores.append(f'[{n}] una pronunciación es solo la palabra escrita como suena, en una línea')
            continue
        if l in ('en', 'vi') and e['fuente_lengua'] == 'es':
            # Se juzga el texto entero, no palabras sueltas (hay demasiados falsos amigos y nombres): solo se bloquea
            # cuando buena parte de la frase es español.
            limpio_t = sin_citas(t)
            if '¿' in limpio_t or '¡' in limpio_t:
                errores.append(f'[{n}] lleva ¿ o ¡: eso es español; escríbelo en {NOMBRE_LENGUA[l]}')
            n_es, n_tot, cuales = proporcion_espanol(mapa['curso'], t, l)
            if n_tot >= 4 and n_es >= 2 and n_es / n_tot >= 0.3:
                errores.append(f'[{n}] la frase parece seguir en español ({", ".join(cuales[:5])}): escríbela en {NOMBRE_LENGUA[l]} '
                               f'(solo se copia igual lo que esté en {NOMBRE[mapa["curso"]]})')
            elif t == f:
                fe, ft, _ = proporcion_espanol(mapa['curso'], f)
                if ft >= 3 and fe / ft >= 0.2:
                    errores.append(f'[{n}] es la frase española sin traducir')
                elif delata_espanol(mapa['curso'], f):
                    avisos.append(f'[{n}] se ha dejado igual que el original español ({f[:40]})')
        if l == 'vi' and len(PALABRA.findall(sin_citas(t))) >= 3 and not LETRAS_VI.search(sin_citas(t)) and t != f:
            errores.append(f'[{n}] no parece vietnamita (no lleva ninguna letra con tilde vietnamita)')
        if f.count('**') != t.count('**'):
            if t.count('**') % 2:
                errores.append(f'[{n}] tiene un ** sin cerrar')
            else:
                avisos.append(f'[{n}] tiene distinto número de negritas que el original')
        if f.count('\n- ') and not t.count('\n- ') and not t.startswith('- '):
            avisos.append(f'[{n}] el original era una lista con guiones')
        nums_f = re.findall(r'\d+', f)
        nums_t = re.findall(r'\d+', t)
        if sorted(nums_f) != sorted(nums_t) and l != 'es':
            avisos.append(f'[{n}] los números no coinciden con el original ({" ".join(nums_f)} → {" ".join(nums_t)})')
        if e.get('clase') != 'pron' and len(f) > 120 and len(t) < 0.4 * len(f):
            errores.append(f'[{n}] es mucho más corto que el original: tradúcelo ENTERO (el original completo está debajo de su [n] en la hoja; lo de la cabecera es solo contexto y puede ir cortado con «…»)')
        if len(t) > 3 * len(f) + 60:
            avisos.append(f'[{n}] es mucho más largo que el original: no añadas nada que no esté')
    return errores, avisos


def pendientes(c, solo_lengua=None):
    """Hojas sin terminar de un curso: [(l, id)], primero los capítulos de cada carpeta."""
    base = os.path.join(TRABAJO, c)
    salida = []
    if not os.path.isdir(base):
        return salida
    for l in sorted(os.listdir(base)):
        if solo_lengua and l != solo_lengua:
            continue
        d = os.path.join(base, l)
        if not os.path.isdir(d):
            continue
        ids = sorted(n[:-10] for n in os.listdir(d) if n.endswith('.mapa.json'))
        ids.sort(key=lambda x: (x != 'capitulos', x))
        for id_ in ids:
            if not os.path.exists(ruta_ok(c, l, id_)):
                salida.append((l, id_))
    return salida


def orden_lenguas(c):
    """Las carpetas que más trabajo llevan, primero (inglés, luego vietnamita, luego español)."""
    return [l for l in ('en', 'vi', 'es') if l != c]
