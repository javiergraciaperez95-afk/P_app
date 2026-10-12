# Genera el dibujo de la tutora de cada app antigua (_antiguas/<App>): base.js (lo común) + disenos/<App>.js (lo propio).
# Uso: python generar.py            → todas las que tengan diseño
#      python generar.py French     → solo esa
import sys
from pathlib import Path

AQUI = Path(__file__).parent
RAIZ = AQUI.parent
ANTIGUAS = RAIZ / '_antiguas'
base = (AQUI / 'base.js').read_text(encoding='utf-8')

apps = sys.argv[1:] or sorted(p.stem for p in (AQUI / 'disenos').glob('*.js'))
for app in apps:
    texto = (AQUI / 'disenos' / f'{app}.js').read_text(encoding='utf-8')
    lineas = texto.splitlines()
    n = next(i for i, l in enumerate(lineas) if not l.startswith('//'))
    salida = base.replace('//@@DESCRIPCION@@', '\n'.join(lineas[:n])).replace('//@@DISENO@@', '\n'.join(lineas[n:]))
    destino = ANTIGUAS / app / 'js' / 'tutor-sprite.js'
    destino.write_text(salida, encoding='utf-8', newline='\n')
    print('escrito', destino.relative_to(RAIZ))
