"""Lista los .js y .css de Paglot a los que no nombra ningún otro archivo (posible código muerto)."""
import pathlib, re
raiz = pathlib.Path(__file__).resolve().parent.parent
APP = ('index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'juegos', 'cursos')
todo = [p for p in raiz.rglob('*') if p.relative_to(raiz).parts[0] in APP]
codigo = [p for p in todo if p.suffix in ('.js', '.css', '.html', '.json', '.webmanifest') and 'cursos' not in p.parts or p.name in ('curso.js', 'tutora.js')]
texto = '\n'.join(p.read_text(encoding='utf-8', errors='ignore') for p in codigo if p.suffix != '.json')
for p in sorted(todo):
    if p.suffix not in ('.js', '.css') or p.name == 'sw.js':
        continue
    if 'cursos' in p.parts:
        continue
    nombre = p.name
    usos = len(re.findall(re.escape(nombre), texto)) - texto.count(f'// {nombre}')
    if usos <= 0:
        print('sin usar:', p.relative_to(raiz))
