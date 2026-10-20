"""Genera css/paletas.css: los temas de color de pago (Plus y Max) para toda la app.

    py _herramientas/paletas.py

Cada paleta cambia el TONO de los fondos, paneles y papeles (los de la app y los de las escenas) y deja igual la
luminosidad y los colores del texto: así el contraste sigue siendo el que ya se comprobó (AA en los dos temas).
Las paletas se eligen en Perfil → Ajustes (js/paletas.js dice cuáles da cada plan).
"""
import colorsys
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# las variables que tiñe cada paleta, con su color de siempre (el de «Paglot», morado de noche y crema de día)
OSCURO = {
    '--fondo': '#463c58', '--fondo-punto': '#54486a', '--panel': '#574a6c', '--panel-2': '#66587e', '--panel-hover': '#71628a',
    '--sombra': '#2a2136', '--retrato': '#6a5c86',
    '--h-fondo': '#4a3f5e', '--h-trama': '#54486a', '--h-papel': '#5a4d70', '--h-papel-2': '#6a5c82', '--h-borde': '#2a2136',
    '--h-sombra': '#2e2540', '--h-cielo': '#5c4d7a',
}
CLARO = {
    '--fondo': '#efe4cc', '--fondo-punto': '#e2d3b3', '--panel': '#fffaf0', '--panel-2': '#f3e7cd', '--panel-hover': '#ead9b4',
    '--retrato': '#d9c7a3',
    '--h-fondo': '#efe6d2', '--h-trama': '#e8dcc3', '--h-papel': '#fffaf0', '--h-papel-2': '#f4ead6', '--h-sombra': '#b9a383',
    '--h-cielo': '#f7d9a8',
}

# nombre: (tono 0-360, cuánta saturación se conserva, plan)
PALETAS = {
    'bosque': (150, 1.0, 'plus'),
    'oceano': (205, 1.1, 'plus'),
    'cereza': (338, 1.0, 'max'),
    'atardecer': (18, 1.05, 'max'),
    'carbon': (230, 0.25, 'max'),
}
CONTENEDORES = ['', ' .cabecera', ' .pie-sitio', ' .inicio', ' .precios', ' .academia-entrada', ' .teatro-idiomas', ' .escena-web']


def teñir(hexa, tono, sat):
    r, g, b = (int(hexa[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    r2, g2, b2 = colorsys.hls_to_rgb(tono / 360, l, min(1, s * sat))
    return '#%02x%02x%02x' % tuple(round(x * 255) for x in (r2, g2, b2))


def bloque(nombre, tema, base, tono, sat):
    selectores = ', '.join(f':root[data-paleta="{nombre}"][data-tema="{tema}"]{c}' for c in CONTENEDORES)
    cuerpo = ''.join(f'  {k}: {teñir(v, tono, sat)};\n' for k, v in base.items())
    return f'{selectores} {{\n{cuerpo}}}\n'


css = ['/* Temas de color (paletas) de pago: los genera _herramientas/paletas.py; no se toca a mano.\n'
       '   Solo cambian el tono de fondos y papeles; textos y contraste, los de siempre. */\n']
for nombre, (tono, sat, plan) in PALETAS.items():
    css.append(f'/* {nombre} ({plan}) */\n')
    css.append(bloque(nombre, 'oscuro', OSCURO, tono, sat))
    css.append(bloque(nombre, 'claro', CLARO, tono, min(sat, 0.8)))
    # la muestra de la paleta en los ajustes: su color de noche
    css.append(f'.paleta-muestra[data-paleta-muestra="{nombre}"] {{ background: {teñir(OSCURO["--panel-2"], tono, sat)}; }}\n')
css.append('.paleta-muestra[data-paleta-muestra="paglot"] { background: #66587e; }\n')
open(os.path.join(RAIZ, 'css', 'paletas.css'), 'w', encoding='utf-8', newline='\n').write(''.join(css))
print('css/paletas.css:', len(PALETAS), 'paletas')
