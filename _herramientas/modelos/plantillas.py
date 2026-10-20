# Paso 1: escribe las plantillas (plantillas/modelo-N.json). Cada una enseña la estructura completa de su modelo con
# una pieza vacía de cada tipo que admite cada etapa. Todas las lecciones nuevas tienen exactamente estas claves, en este
# orden (las listas pueden crecer: más palabras, más piezas, más frases, más opciones…).
# Uso: py -X utf8 _herramientas/modelos/plantillas.py

import os

from comun import MODELOS, ETAPA_DE, leccion_vacia, palabra_vacia, pieza_vacia, frase_vacia, mixto, escribir_json, validar_leccion

CARPETA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'plantillas')


def ejemplo(tipo):
    p = pieza_vacia(tipo)
    if tipo in ('explicacion', 'gramatica'):
        p['texto'] = ['']
    if tipo == 'gramatica' or tipo in ('dialogo', 'texto'):
        f = frase_vacia()
        f['nota'] = ['']
        f['analisis'] = [['', '']]
        p['ejemplos' if tipo == 'gramatica' else 'frases'] = [f]
    if tipo == 'tabla':
        p['columnas'] = [mixto('', 'alumno')]
        p['filas'] = [[mixto('', 'estudio')]]
    if tipo == 'vocabulario':
        p['palabras'] = ['']
    if tipo in ('test', 'traduccion', 'huecos'):
        p['opciones'] = [{'texto': '', 'lengua': 'estudio', 'explicacion': '', 'correcta': True},
                         {'texto': '', 'lengua': 'estudio', 'explicacion': '', 'correcta': False}]
    if tipo == 'escribir':
        p['respuestas'] = {'lengua': 'estudio', 'textos': ['']}
    return p


def main():
    os.makedirs(CARPETA, exist_ok=True)
    for m, (nombre, etapas) in MODELOS.items():
        L = leccion_vacia('xx', 'es', '000', m)
        L['palabras'] = [palabra_vacia()]
        for e in L['etapas']:
            e['piezas'] = [ejemplo(t) for t, et in ETAPA_DE.items() if et == e['etapa']]
        for p in L['etapas'][-1]['piezas']:
            p['id'] = f'<id único en la lección: {p["tipo"]}>'
        assert not validar_leccion(L, completa=False), validar_leccion(L, completa=False)
        L['curso'], L['alumno'], L['id'] = '<código del curso>', '<es | en | vi>', '<NNN>'
        escribir_json(os.path.join(CARPETA, f'modelo-{m}.json'), L, sangria=2)
        print(f'modelo-{m}.json  {nombre:22} {" → ".join(etapas)}')


if __name__ == '__main__':
    main()
