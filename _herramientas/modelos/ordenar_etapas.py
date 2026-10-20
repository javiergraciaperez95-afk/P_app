# El orden es sagrado: en todas las lecciones, primero EXPLICAR y al final PRACTICAR (ver MODELOS en comun.py).
# Pasa las lecciones de los antiguos modelos 3-6 (que ponían palabras o leer antes de explicar) al 1 o al 2,
# conservando el orden que tenían palabras y leer; actualiza el «modelo» de cada indice.json. No toca ningún texto.
# Uso: py -X utf8 _herramientas/modelos/ordenar_etapas.py [curso…]   (sin cursos: los 21)

import glob
import os
import sys

from comun import CURSOS, CURSOS_DIR, MODELOS, leer_json, escribir_json, lenguas_de, validar_leccion


def modelo_para(etapas):
    """El modelo (1 o 2) que conserva el orden de palabras y leer de estas etapas."""
    medio = [e for e in etapas if e not in ('explicar', 'practicar')]
    for m, (_, orden) in MODELOS.items():
        if orden[1:-1] == medio:
            return m
    raise ValueError(f'etapas desconocidas: {etapas}')


def main():
    cursos = sys.argv[1:] or CURSOS
    total = cambiadas = 0
    for c in cursos:
        for l in lenguas_de(c):
            carpeta = os.path.join(CURSOS_DIR, c, l)
            nuevos = {}
            for ruta in sorted(glob.glob(os.path.join(carpeta, '[0-9]*.json'))):
                L = leer_json(ruta)
                total += 1
                etapas = [e['etapa'] for e in L['etapas']]
                m = modelo_para(etapas)
                nombre, orden = MODELOS[m]
                if L['modelo'] == m and L['nombre_modelo'] == nombre and etapas == orden:
                    continue
                por_etapa = {e['etapa']: e for e in L['etapas']}
                L['modelo'], L['nombre_modelo'] = m, nombre
                L['etapas'] = [por_etapa[e] for e in orden]
                fallos = validar_leccion(L, c, l, L['id'], completa=False)
                if fallos:
                    raise SystemExit(f'{ruta}:\n  ' + '\n  '.join(fallos[:10]))
                escribir_json(ruta, L)
                nuevos[L['id']] = m
                cambiadas += 1
            indice = os.path.join(carpeta, 'indice.json')
            if nuevos and os.path.exists(indice):
                I = leer_json(indice)
                for x in I['lecciones']:
                    if x['id'] in nuevos:
                        x['modelo'] = nuevos[x['id']]
                escribir_json(indice, I, sangria=None)
            print(f'{c}/{l}: {len(nuevos)} reordenadas', flush=True)
    print(f'{cambiadas} de {total} lecciones reordenadas: explicar va siempre primero')


if __name__ == '__main__':
    main()
