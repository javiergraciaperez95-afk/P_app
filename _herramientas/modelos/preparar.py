# Paso 3: rellena los esqueletos de cursos/<c>/<alumno>/NNN.json con la lección original.
#   - Lo del idioma estudiado (palabras, frases, opciones, respuestas, audio…) se copia tal cual, sin pasar por nadie.
#   - Los textos para el alumno se copian cuando ya existen en su idioma (el español de los cursos, que se escribieron
#     para hispanohablantes, y el inglés y el vietnamita de los catálogos del curso de español). Los demás se dejan
#     vacíos y van a una hoja de _trabajo/ para que un subagente los adapte (ver hojas.py y entregar.py).
#   - Las piezas se colocan en las etapas del modelo que le tocó a la lección, conservando su orden dentro de cada etapa.
# Uso: py -X utf8 _herramientas/modelos/preparar.py [cursos…] [--forzar]
# Sin --forzar no toca las lecciones ya entregadas (las que tienen su .ok).

import os
import re
import sys

from comun import (CURSOS, MODELOS, ETAPA_DE, CURSOS_DIR, leer_json, escribir_json, lenguas_de, ids_originales,
                   ruta_leccion, leccion_vacia, validar_leccion, validar_capitulos)
from normalizar import Fuente, normalizar, normalizar_capitulos, lexicos, espanol_para, tokens, parece_espanol
from hojas import ruta_mapa, ruta_ok, ruta_respuesta, carpeta, texto_hoja, delata_espanol

# Referencias al orden de la lección (en español, que es el idioma de los originales)
ORDEN_RE = re.compile(r'\b((más|aquí|de) (arriba|abajo)|anteriores?|siguientes?|acabas? de (ver|leer|oír|escuchar|aprender)|'
                      r'has (visto|leído|oído|escuchado|aprendido)|vas a (ver|leer|oír|escuchar|aprender|conocer)|verás|leerás|'
                      r'escucharás|a continuación|más adelante|ahora (lee|escucha|mira|vas a)|antes de (leer|escuchar)|'
                      r'después de (leer|escuchar))\b', re.IGNORECASE)
ORDEN_RE_EN = re.compile(r'\b(above|below|previous|you have (seen|read|heard|learned)|you just (saw|read|heard)|'
                         r"you will (see|read|hear|meet)|you'll (see|read|hear|meet)|later on|before (reading|listening)|"
                         r'after (reading|listening))\b', re.IGNORECASE)
FRAG = re.compile(r'\*\*(.+?)\*\*|«([^»]+)»')


def mecanico(c, l):
    """Carpetas que no necesitan subagente para traducir: los textos ya existen en ese idioma."""
    return c == 'es' or l == 'es'


def fragmentos_estudio(c, f):
    """Trozos entre «» o en negrita del original que están en el idioma estudiado: se tienen que copiar igual."""
    salida = []
    textos = list(f.v.values())
    base = f.v.get('es') or next(iter(f.v.values()), '')
    esp = espanol_para(c) if c != 'es' else set()
    est = lexicos()['estudio_puro'][c]
    for m in FRAG.finditer(base):
        frag = (m.group(1) or m.group(2) or '').strip()
        if len(frag) < 2 or frag in salida:
            continue
        ts = tokens(frag)
        if c == 'es':
            # en el curso de español los textos vienen en inglés y en vietnamita: lo que está igual en los dos es español
            ok = len(textos) > 1 and all(frag in t for t in textos)
        else:
            # el inglés de máquina dejó sin traducir muchas negritas españolas: aquí solo vale que sean palabras del curso
            ok = bool(ts) and all(t in est and t not in esp for t in ts)
        if ok:
            salida.append(frag)
    return salida


def solo_nombres(c, s):
    """Si las palabras «españolas» de un texto son todas nombres propios (Pedro, Madrid…)."""
    palabras = re.findall(r"[^\W\d_]+", s)
    esp = espanol_para(c)
    marcadas = [p for p in palabras if p.lower() in esp]
    return bool(marcadas) and all(p[:1].isupper() for p in marcadas)


def construir(c, l, id_, modelo, N, orden_original, reordenada):
    """La lección para la carpeta l y la lista de textos que tiene que adaptar un subagente."""
    L = leccion_vacia(c, l, id_, modelo)
    L['numero'] = int(N['numero'])
    L['orden'] = N['orden']
    L['capitulo'] = int(N['capitulo'] or 0)
    L['titulo'] = dict(N['titulo'])
    L['intro'] = N['intro']
    L['palabras'] = N['palabras']
    etapas = {e['etapa']: e for e in L['etapas']}
    for p in N['piezas']:
        etapas[ETAPA_DE[p['tipo']]]['piezas'].append(p)
    entradas = []
    mec = mecanico(c, l)

    def resolver(v, ruta, en_explicacion=False):
        if isinstance(v, Fuente):
            if not v:
                return ''
            # se mira el original: el español (o, en el curso de español, el inglés de sus catálogos)
            habla_orden = reordenada and (ORDEN_RE.search(v.v['es']) if 'es' in v.v else ORDEN_RE_EN.search(v.v.get('en', '')))
            if mec and v.v.get(l):
                valor = v.v[l]
                if habla_orden and en_explicacion:
                    entradas.append({'ruta': ruta, 'tipo': 'orden', 'fuente_lengua': l, 'fuente': valor, 'd': v.d, 'ctx': v.ctx,
                                     'fragmentos': []})
                return valor
            fl = 'es' if v.v.get('es') else ('en' if v.v.get('en') else next(iter(v.v)))
            fuente_txt = v.v[fl]
            entradas.append({'ruta': ruta, 'tipo': 'traducir', 'fuente_lengua': fl, 'fuente': fuente_txt, 'd': v.d,
                             'ctx': v.ctx, 'clase': v.clase,
                             'fragmentos': [] if v.clase == 'pron' else fragmentos_estudio(c, v),
                             'aviso_orden': bool(habla_orden and en_explicacion),
                             'espanol': fl == 'es' and v.clase != 'pron' and delata_espanol(c, fuente_txt)})
            return ''
        if isinstance(v, dict):
            # lo que puede hablar del orden: la introducción y las explicaciones (los ejercicios van siempre al final)
            explic = en_explicacion or v.get('tipo') in ('explicacion', 'gramatica', 'tabla')
            return {k: resolver(x, ruta + [k], explic or ruta + [k] == ['intro']) for k, x in v.items()}
        if isinstance(v, list):
            return [resolver(x, ruta + [i], en_explicacion) for i, x in enumerate(v)]
        return v

    L = resolver(L, [])
    for i, e in enumerate(entradas):
        e['n'] = i + 1
    return L, entradas


def orden_de(N):
    vistos = []
    for p in N['piezas']:
        e = ETAPA_DE[p['tipo']]
        if e != 'practicar' and e not in vistos:
            vistos.append(e)
    return vistos


def escribir_hoja(c, l, id_, mapa):
    os.makedirs(carpeta(c, l), exist_ok=True)
    escribir_json(ruta_mapa(c, l, id_), mapa)
    with open(os.path.join(carpeta(c, l), f'{id_}.hoja.txt'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(texto_hoja(mapa))


def marcar_hecho(c, l, id_):
    os.makedirs(carpeta(c, l), exist_ok=True)
    open(ruta_ok(c, l, id_), 'w').close()


def preparar_curso(c, forzar=False):
    ids = ids_originales(c)
    hechas = pendientes = 0
    for id_ in ids:
        N = normalizar(c, id_)
        orden = orden_de(N)
        for l in lenguas_de(c):
            ruta = ruta_leccion(c, l, id_)
            if os.path.exists(ruta_ok(c, l, id_)) and not forzar and os.path.exists(ruta_mapa(c, l, id_)):
                continue
            esqueleto = leer_json(ruta)
            modelo = esqueleto['modelo']
            etapas_modelo = [e for e in MODELOS[modelo][1] if e in orden]
            reordenada = etapas_modelo != orden
            L, entradas = construir(c, l, id_, modelo, N, orden, reordenada)
            fallos = validar_leccion(L, c, l, id_, completa=False)
            if fallos:
                raise SystemExit(f'{c}/{l}/{id_}: el JSON preparado no cumple la plantilla:\n  ' + '\n  '.join(fallos[:20]))
            escribir_json(ruta, L)
            for viejo in (ruta_ok(c, l, id_), ruta_respuesta(c, l, id_)):
                if os.path.exists(viejo) and forzar:
                    os.remove(viejo)
            mapa = {'curso': c, 'alumno': l, 'id': id_, 'modelo': modelo, 'reordenada': reordenada,
                    'orden_original': orden, 'entradas': entradas}
            if entradas:
                escribir_hoja(c, l, id_, mapa)
                pendientes += 1
            else:
                escribir_json(ruta_mapa(c, l, id_), mapa)
                marcar_hecho(c, l, id_)
                hechas += 1
    # los capítulos de cada carpeta
    caps = normalizar_capitulos(c)
    for l in lenguas_de(c):
        if os.path.exists(ruta_ok(c, l, 'capitulos')) and not forzar:
            continue
        entradas = []
        mec = mecanico(c, l)

        def resolver(v, ruta):
            if isinstance(v, Fuente):
                if not v:
                    return ''
                if mec and v.v.get(l):
                    return v.v[l]
                fl = 'es' if v.v.get('es') else ('en' if v.v.get('en') else next(iter(v.v)))
                entradas.append({'ruta': ruta, 'tipo': 'traducir', 'fuente_lengua': fl, 'fuente': v.v[fl], 'd': v.d,
                                 'ctx': v.ctx, 'fragmentos': fragmentos_estudio(c, v), 'espanol': fl == 'es' and delata_espanol(c, v.v[fl])})
                return ''
            if isinstance(v, dict):
                return {k: resolver(x, ruta + [k]) for k, x in v.items()}
            if isinstance(v, list):
                return [resolver(x, ruta + [i]) for i, x in enumerate(v)]
            return v

        datos = resolver(caps, [])
        fallos = validar_capitulos(datos, completa=False)
        if fallos:
            raise SystemExit(f'{c}/{l}/capitulos: ' + '; '.join(fallos[:10]))
        escribir_json(os.path.join(CURSOS_DIR, c, l, 'capitulos.json'), datos)
        for i, e in enumerate(entradas):
            e['n'] = i + 1
        mapa = {'curso': c, 'alumno': l, 'id': 'capitulos', 'modelo': None, 'entradas': entradas}
        if entradas:
            escribir_hoja(c, l, 'capitulos', mapa)
        else:
            escribir_json(ruta_mapa(c, l, 'capitulos'), mapa)
            marcar_hecho(c, l, 'capitulos')
    return hechas, pendientes


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    forzar = '--forzar' in sys.argv
    lexicos()
    for c in (args or CURSOS):
        h, p = preparar_curso(c, forzar)
        print(f'{c}: {h} lecciones listas sin subagente, {p} con hoja para el subagente', flush=True)
