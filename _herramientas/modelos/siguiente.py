# Enseña la siguiente hoja sin terminar de un curso (la lee el subagente de ese curso).
# Uso: py -X utf8 _herramientas/modelos/siguiente.py <curso> [alumno]

import os
import sys

from comun import leer_json
from hojas import pendientes, ruta_mapa, texto_hoja

sys.stdout.reconfigure(encoding='utf-8')


def ensenar(c, solo=None):
    quedan = pendientes(c, solo)
    if not quedan:
        print(f'TERMINADO: no quedan hojas en el curso {c}{"/" + solo if solo else ""}.')
        return False
    l, id_ = quedan[0]
    print(texto_hoja(leer_json(ruta_mapa(c, l, id_))))
    print(f'# (quedan {len(quedan)} hojas en el curso {c}; esta es {c}/{l}/{id_})')
    return True


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit('uso: siguiente.py <curso> [alumno]')
    ensenar(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
