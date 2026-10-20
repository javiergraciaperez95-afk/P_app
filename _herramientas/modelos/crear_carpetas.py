# Paso 2: crea las carpetas por idioma del alumno de cada curso y, dentro, un JSON por lección con la plantilla de su
# modelo (vacía). El modelo se sortea para cada lección (con semilla fija: se puede repetir igual) y es el mismo en las
# carpetas de esa lección; nunca toca el mismo modelo dos lecciones seguidas.
#   cursos/<curso>/es/NNN.json   para hispanohablantes   (no existe en el curso de español)
#   cursos/<curso>/en/NNN.json   para angloparlantes     (no existe en el curso de inglés)
#   cursos/<curso>/vi/NNN.json   para vietnamitas        (no existe en el curso de vietnamita)
# Hay tantos JSON como lecciones tiene el curso original (cursos/<curso>/lessons/NNN.json).
# Uso: py -X utf8 _herramientas/modelos/crear_carpetas.py [--forzar]   (sin --forzar no pisa JSON que ya existan)

import os
import random
import sys

from comun import CURSOS, MODELOS, CURSOS_DIR, lenguas_de, ids_originales, ruta_leccion, leccion_vacia, escribir_json, \
    validar_leccion, leer_json

SEMILLA = 20261019


def sortear(c, ids):
    azar = random.Random(f'{SEMILLA}-{c}')
    modelos, anterior = {}, None
    for id_ in ids:
        m = azar.choice([x for x in MODELOS if x != anterior])
        modelos[id_] = anterior = m
    return modelos


def main():
    forzar = '--forzar' in sys.argv
    total = 0
    print(f'{"curso":6} {"lecciones":>9}  carpetas      modelos 1-2')
    for c in CURSOS:
        ids = ids_originales(c)
        modelos = sortear(c, ids)
        for l in lenguas_de(c):
            for id_ in ids:
                ruta = ruta_leccion(c, l, id_)
                if os.path.exists(ruta) and not forzar:
                    if leer_json(ruta).get('modelo') != modelos[id_]:
                        raise SystemExit(f'{ruta} ya existe con otro modelo: usa --forzar para rehacerlo')
                    continue
                L = leccion_vacia(c, l, id_, modelos[id_])
                assert not validar_leccion(L, c, l, id_, completa=False)
                escribir_json(ruta, L)
                total += 1
        cuenta = [sum(1 for m in modelos.values() if m == k) for k in MODELOS]
        print(f'{c:6} {len(ids):9}  {", ".join(lenguas_de(c)):12}  {cuenta}')
    print(f'JSON nuevos: {total}')


if __name__ == '__main__':
    main()
