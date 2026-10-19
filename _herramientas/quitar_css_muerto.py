"""Quita de un CSS las reglas cuyos selectores usan solo clases que ya no existen en la app.

    python _herramientas/quitar_css_muerto.py css/cabecera.css cuenta-avatar cabecera-crear …

Solo borra la regla entera (selectores + llaves) cuando TODOS sus selectores contienen alguna de las clases dadas;
no reformatea nada más. Al final quita los @media que se hayan quedado vacíos.
"""
import re
import sys
from pathlib import Path

archivo = Path(sys.argv[1])
muertas = sys.argv[2:]
texto = archivo.read_text(encoding='utf-8')
patron = re.compile(r'(^|(?<=[;}{]))(\s*)([^{}@;][^{}]*)\{[^{}]*\}', re.S)
quitadas = 0


def fuera(m):
    global quitadas
    selectores = [s.strip() for s in re.sub(r'/\*.*?\*/', '', m.group(3), flags=re.S).split(',') if s.strip()]
    def muerta(sel):
        return any(re.search(r'\.' + re.escape(c) + r'(?![\w-])', sel) for c in muertas)
    if selectores and all(muerta(s) for s in selectores):
        quitadas += 1
        return m.group(1)
    return m.group(0)


nuevo = patron.sub(fuera, texto)
nuevo = re.sub(r'@media[^{}]*\{\s*\}\n?', '', nuevo)
nuevo = re.sub(r'\n{3,}', '\n\n', nuevo)
archivo.write_text(nuevo, encoding='utf-8')
print(f'{archivo.name}: {quitadas} reglas quitadas · {len(texto)} → {len(nuevo)} caracteres')
