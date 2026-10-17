# -*- coding: utf-8 -*-
"""Pone al día el número de lecciones de cada curso en Idiomas/js/cursos.js contando los archivos de verdad
(Idiomas/cursos/<curso>/lessons/NNN.json). Es lo que se ve en la pantalla de elegir idioma.

Uso:  py -X utf8 _herramientas/contar_lecciones.py

compilar.py ya lo hace con el curso que compila; esto sirve después de tocar lecciones a mano o de
compilar varios cursos con «--sin-lista». El resto de cursos.js (nombres, banderas, voces…) se edita a mano.
"""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CURSOS_JS = RAIZ / 'Idiomas' / 'js' / 'cursos.js'
CARPETA = RAIZ / 'Idiomas' / 'cursos'

texto = CURSOS_JS.read_text(encoding='utf-8')
nuevo = texto
for m in re.finditer(r'"id": "([a-z]+)"', texto):
    curso = m.group(1)
    lecciones = CARPETA / curso / 'lessons'
    n = len(list(lecciones.glob('[0-9][0-9][0-9].json'))) if lecciones.is_dir() else 0
    inicio = nuevo.index(f'"id": "{curso}"')
    j = nuevo.index('"lecciones":', inicio)
    antes = int(re.match(r'"lecciones": (\d+)', nuevo[j:]).group(1))
    if antes != n:
        print(f'{curso}: {antes} → {n}')
        nuevo = nuevo[:j] + re.sub(r'"lecciones": \d+', f'"lecciones": {n}', nuevo[j:], count=1)
if nuevo != texto:
    CURSOS_JS.write_text(nuevo, encoding='utf-8', newline='\n')
else:
    print('Todo cuadra: no hay nada que cambiar.')
