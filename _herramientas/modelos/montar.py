# Paso final: monta cada carpeta terminada para que la app la use.
#   cursos/<curso>/<alumno>/indice.json       la lista de lecciones (lo que pinta el mapa sin abrir cada lección)
#   cursos/<curso>/<alumno>/diccionario.json  todas las palabras del curso, para tocarlas en cualquier frase
# (capitulos.json ya lo deja preparar.py/entregar.py). La app (js/lessons.js) usa la carpeta en cuanto tiene su
# indice.json; mientras no, sigue con las lecciones antiguas de lessons/.
# Solo monta las carpetas con TODAS sus lecciones entregadas y válidas (o --prueba para montar aunque falten textos).
# Uso: py -X utf8 _herramientas/modelos/montar.py [curso o curso/alumno …] [--prueba]

import os
import re
import sys

from comun import CURSOS, CURSOS_DIR, leer_json, escribir_json, lenguas_de, ids_originales, ruta_leccion, \
    validar_leccion, validar_capitulos, EJERCICIOS
from hojas import pendientes

sys.stdout.reconfigure(encoding='utf-8')


def normalizar_palabra(s):
    return re.sub(r'\s+', ' ', s.strip().lower())


def montar(c, l, prueba=False):
    ids = ids_originales(c)
    faltan = [id_ for (ll, id_) in pendientes(c, l)]
    if faltan and not prueba:
        return f'sin montar: faltan {len(faltan)} hojas por entregar'
    malas = []
    lecciones = []
    diccionario = {}
    for id_ in ids:
        L = leer_json(ruta_leccion(c, l, id_))
        fallos = validar_leccion(L, c, l, id_, completa=not prueba)
        if fallos:
            malas.append((id_, fallos[:3]))
            continue
        ejercicios, audio = [], 0
        for e in L['etapas']:
            for p in e['piezas']:
                if p['tipo'] in EJERCICIOS:
                    # de oído = con un texto que se escucha (como marcarId en js/lessons.js); oir_frase no cuenta
                    oido = bool(p['audio'].strip())
                    audio += oido
                    ejercicios.append([f'id|{p["id"]}', 1] if oido else [f'id|{p["id"]}'])
        lecciones.append({'id': id_, 'titulo_es': L['titulo']['estudio'], 'titulo': L['titulo']['alumno'],
                          'capitulo': L['capitulo'], 'orden_curso': L['orden'], 'numero_curso': L['numero'],
                          'ejercicios': ejercicios, 'audio': audio, 'modelo': L['modelo']})
        for p in L['palabras']:
            clave = normalizar_palabra(p['palabra'])
            if clave in diccionario:
                continue
            ficha = {k: p[k] for k in ('pron', 'ipa', 'cat', 'genero', 'plural', 'definida', 'nota', 'consejo') if p[k]}
            ficha['trad'] = {l: p['significado']}
            ficha['es'] = p['palabra']
            diccionario[clave] = ficha
    if malas:
        return f'sin montar: {len(malas)} lecciones no pasan la plantilla, p. ej. {malas[:2]}'
    caps = leer_json(os.path.join(CURSOS_DIR, c, l, 'capitulos.json'))
    fallos = validar_capitulos(caps, completa=not prueba)
    if fallos:
        return f'sin montar: capitulos.json {fallos[:3]}'
    escribir_json(os.path.join(CURSOS_DIR, c, l, 'indice.json'), {'version': 2, 'formato': 'paglot-modelo-1', 'lecciones': lecciones}, sangria=None)
    escribir_json(os.path.join(CURSOS_DIR, c, l, 'diccionario.json'), diccionario, sangria=None)
    return f'montada: {len(lecciones)} lecciones, {len(diccionario)} palabras'


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    prueba = '--prueba' in sys.argv
    for a in (args or CURSOS):
        c, _, solo = a.partition('/')
        for l in ([solo] if solo else lenguas_de(c)):
            print(f'{c}/{l}: {montar(c, l, prueba)}', flush=True)
