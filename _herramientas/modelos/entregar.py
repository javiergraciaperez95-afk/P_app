# Comprueba la respuesta de un subagente y, si está bien, la mete en el JSON de la lección.
# Uso: py -X utf8 _herramientas/modelos/entregar.py <curso> <alumno> <id>      (id: 001… o «capitulos»)
# Si algo falla, dice qué y no toca nada: hay que corregir el archivo de respuesta y volver a entregar.
# Si todo va bien, enseña la siguiente hoja del curso.

import os
import sys

from comun import CURSOS_DIR, leer_json, escribir_json, ruta_leccion, validar_leccion, validar_capitulos
from hojas import ruta_mapa, ruta_respuesta, ruta_ok, leer_respuesta, comprobar, relativa
from siguiente import ensenar

sys.stdout.reconfigure(encoding='utf-8')


def poner(datos, ruta, valor):
    d = datos
    for k in ruta[:-1]:
        d = d[k]
    d[ruta[-1]] = valor


def entregar(c, l, id_):
    if not os.path.exists(ruta_mapa(c, l, id_)):
        print(f'NO EXISTE la hoja {c}/{l}/{id_}')
        return False
    mapa = leer_json(ruta_mapa(c, l, id_))
    respuesta = ruta_respuesta(c, l, id_)
    if not os.path.exists(respuesta):
        print(f'FALTA la respuesta: escribe {relativa(respuesta)}')
        return False
    with open(respuesta, encoding='utf-8') as f:
        bruto = f.read()
    try:
        textos = leer_respuesta(bruto)
    except ValueError as e:
        print(f'MAL ESCRITO {relativa(respuesta)}: {e}')
        return False
    errores, avisos = comprobar(mapa, textos)
    if errores:
        print(f'NO ENTREGADO {c}/{l}/{id_}: corrige esto en {relativa(respuesta)} y vuelve a entregar:')
        for e in errores[:40]:
            print(f'  - {e}')
        if len(errores) > 40:
            print(f'  … y {len(errores) - 40} más')
        return False
    ruta_json = os.path.join(CURSOS_DIR, c, l, 'capitulos.json') if id_ == 'capitulos' else ruta_leccion(c, l, id_)
    datos = leer_json(ruta_json)
    for e in mapa['entradas']:
        poner(datos, e['ruta'], textos[e['n']])
    fallos = validar_capitulos(datos) if id_ == 'capitulos' else validar_leccion(datos, c, l, id_)
    if fallos:
        print(f'NO ENTREGADO {c}/{l}/{id_}: el JSON no cumple la plantilla (avisa a quien te mandó la tarea):')
        for f in fallos[:20]:
            print(f'  - {f}')
        return False
    escribir_json(ruta_json, datos)
    open(ruta_ok(c, l, id_), 'w').close()
    with open(os.path.join(os.path.dirname(ruta_ok(c, l, id_)), '_avisos.txt'), 'a', encoding='utf-8') as f:
        for a in avisos:
            f.write(f'{id_} {a}\n')
    print(f'OK {c}/{l}/{id_} entregada ({len(textos)} textos).' + (f' Avisos (revísalos en la próxima): {"; ".join(avisos[:5])}' if avisos else ''))
    return True


if __name__ == '__main__':
    if len(sys.argv) != 4:
        raise SystemExit('uso: entregar.py <curso> <alumno> <id>')
    c, l, id_ = sys.argv[1:]
    if entregar(c, l, id_):
        print()
        ensenar(c)
