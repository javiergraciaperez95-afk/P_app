"""Hace los iconos de Phuong App con el dibujo de Lucía (la tutora), sacado del mismo código que la pinta en la app.

    node _herramientas/tutora_rejilla.mjs     (escribe _herramientas/tutora.json)
    python _herramientas/iconos.py

Escribe:
  assets/logo.svg, assets/favicon.svg                         el logo (Lucía sobre el sol dorado, fondo rojo)
  assets/icono-192.png, icono-512.png, icono-512-maskable.png, apple-touch-icon.png, favicon-32.png
  _apk/android/app/src/main/res/mipmap-*/ic_launcher*.png    el icono del teléfono (también el adaptativo)
  _apk/android/app/src/main/res/drawable-*/ic_stat_phuong.png  el icono pequeño (blanco) de las notificaciones
  _apk/android/app/src/main/res/drawable*/splash.png          la pantalla de arranque
Los colores: el rojo y el oro de las banderas de España y de Vietnam.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
RES = RAIZ / '_apk/android/app/src/main/res'
ROJO = (200, 16, 46)
ROJO_OSCURO = (138, 10, 30)
ORO = (255, 199, 44)
ORO_CLARO = (255, 226, 130)
FONDO_ARRANQUE = (42, 22, 32)

datos = json.loads((RAIZ / '_herramientas/tutora.json').read_text(encoding='utf-8'))


def limpia(rejilla):
    """Solo el dibujo (sin los destellos sueltos de alrededor): la mancha más grande de píxeles pintados."""
    alto, ancho = len(rejilla), len(rejilla[0])
    vista = [[False] * ancho for _ in range(alto)]
    mejor = []
    for y in range(alto):
        for x in range(ancho):
            if not rejilla[y][x] or vista[y][x]:
                continue
            pila, mancha = [(x, y)], []
            vista[y][x] = True
            while pila:
                cx, cy = pila.pop()
                mancha.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < ancho and 0 <= ny < alto and rejilla[ny][nx] and not vista[ny][nx]:
                        vista[ny][nx] = True
                        pila.append((nx, ny))
            if len(mancha) > len(mejor):
                mejor = mancha
    dentro = set(mejor)
    return [[c if (x, y) in dentro else None for x, c in enumerate(fila)] for y, fila in enumerate(rejilla)]


def color(texto):
    texto = texto.lstrip('#')
    return tuple(int(texto[i:i + 2], 16) for i in (0, 2, 4))


TUTORA = limpia(datos['contenta'])
# el busto: de la coronilla a la cintura (con el libro)
ARRIBA, ABAJO = 6, 48
BUSTO = TUTORA[ARRIBA:ABAJO]


def tutora(escala, blanca=False):
    """Lucía (el busto) en una imagen RGBA, cada píxel del dibujo de escala × escala."""
    alto, ancho = len(BUSTO), len(BUSTO[0])
    img = Image.new('RGBA', (ancho * escala, alto * escala), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for y, fila in enumerate(BUSTO):
        for x, c in enumerate(fila):
            if c:
                d.rectangle([x * escala, y * escala, (x + 1) * escala - 1, (y + 1) * escala - 1],
                            fill=(255, 255, 255, 255) if blanca else color(c) + (255,))
    return img


def sol(lado, radio, centro):
    """El fondo: rojo con un sol dorado de píxeles (un círculo escalonado) detrás de la cabeza."""
    img = Image.new('RGBA', (lado, lado), ROJO + (255,))
    d = ImageDraw.Draw(img)
    paso = max(1, lado // 64)
    cx, cy = centro
    for y in range(0, lado, paso):
        for x in range(0, lado, paso):
            dist = ((x + paso / 2 - cx) ** 2 + (y + paso / 2 - cy) ** 2) ** 0.5
            if dist <= radio:
                d.rectangle([x, y, x + paso - 1, y + paso - 1], fill=(ORO_CLARO if dist <= radio * 0.62 else ORO) + (255,))
            elif dist <= radio * 1.12:
                d.rectangle([x, y, x + paso - 1, y + paso - 1], fill=ROJO_OSCURO + (255,))
    return img


def icono(lado, *, margen=0.08, redondo=False, esquinas=0.0, fondo=True):
    """El icono entero, como un retrato: el busto de Lucía apoyado abajo y un sol dorado detrás de la cabeza.
    margen: lo que el teléfono puede recortar por cada lado (en los adaptativos, casi un 17 %)."""
    util = lado * (1 - 2 * margen)
    escala = max(1, int(util * 0.8 // len(BUSTO[0])))
    t = tutora(escala)
    x = (lado - t.width) // 2
    y = int(lado - lado * margen * (0.9 if margen > 0.15 else 0.6) - t.height)
    cabeza = (lado / 2, y + 13 * escala)
    lienzo = sol(lado, util * 0.4, cabeza) if fondo else Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    lienzo.alpha_composite(t, (x, max(0, y)))
    if redondo or esquinas:
        mascara = Image.new('L', (lado, lado), 0)
        dm = ImageDraw.Draw(mascara)
        if redondo:
            dm.ellipse([0, 0, lado - 1, lado - 1], fill=255)
        else:
            dm.rounded_rectangle([0, 0, lado - 1, lado - 1], radius=int(lado * esquinas), fill=255)
        lienzo.putalpha(mascara)
    return lienzo


def guardar(img, ruta):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    img.save(ruta, optimize=True)
    print(ruta.relative_to(RAIZ), img.size)


# ----- La web -----
guardar(icono(512, margen=0.06, esquinas=0.22), RAIZ / 'assets/icono-512.png')
guardar(icono(192, margen=0.06, esquinas=0.22), RAIZ / 'assets/icono-192.png')
guardar(icono(512, margen=0.2), RAIZ / 'assets/icono-512-maskable.png')
guardar(icono(180, margen=0.06).convert('RGB'), RAIZ / 'assets/apple-touch-icon.png')
guardar(icono(64, margen=0.02, esquinas=0.2).resize((32, 32), Image.NEAREST), RAIZ / 'assets/favicon-32.png')

# ----- Android: el icono del lanzador (normal, redondo y adaptativo: fondo de color + primer plano) -----
for carpeta, lado in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    guardar(icono(lado, margen=0.06, esquinas=0.2), RES / f'mipmap-{carpeta}/ic_launcher.png')
    guardar(icono(lado, margen=0.1, redondo=True), RES / f'mipmap-{carpeta}/ic_launcher_round.png')
for carpeta, lado in {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}.items():
    # el adaptativo: el teléfono recorta hasta el 66 % central, así que el dibujo va dentro de esa zona
    guardar(icono(lado, margen=0.2), RES / f'mipmap-{carpeta}/ic_launcher_foreground.png')

# ----- Android: el icono de las notificaciones (blanco sobre transparente, solo la silueta) -----
for carpeta, lado in {'mdpi': 24, 'hdpi': 36, 'xhdpi': 48, 'xxhdpi': 72, 'xxxhdpi': 96}.items():
    escala = max(1, int(lado * 0.92 // len(BUSTO)))
    t = tutora(escala, blanca=True)
    img = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    img.alpha_composite(t, ((lado - t.width) // 2, (lado - t.height) // 2))
    guardar(img, RES / f'drawable-{carpeta}/ic_stat_phuong.png')

# ----- Android: la pantalla de arranque (Lucía sobre el fondo oscuro de la app) -----
def arranque(ancho, alto):
    img = Image.new('RGB', (ancho, alto), FONDO_ARRANQUE)
    lado = int(min(ancho, alto) * 0.42)
    img.paste(icono(lado, margen=0.06, esquinas=0.22), ((ancho - lado) // 2, (alto - lado) // 2), icono(lado, margen=0.06, esquinas=0.22))
    return img


TAMANOS = {'mdpi': (320, 480), 'hdpi': (480, 800), 'xhdpi': (720, 1280), 'xxhdpi': (960, 1600), 'xxxhdpi': (1280, 1920)}
for carpeta, (ancho, alto) in TAMANOS.items():
    guardar(arranque(ancho, alto), RES / f'drawable-port-{carpeta}/splash.png')
    guardar(arranque(alto, ancho), RES / f'drawable-land-{carpeta}/splash.png')
guardar(arranque(480, 800), RES / 'drawable/splash.png')

# ----- El logo en SVG (la app y el navegador): un trazo por color, con los tramos seguidos de cada fila -----
def svg():
    alto, ancho = len(BUSTO), len(BUSTO[0])
    ox, oy = (64 - ancho) // 2, 64 - alto
    trazos = {}

    def tramo(x, y, largo, tono):
        trazos.setdefault(tono, []).append(f'M{x} {y}h{largo}v1h-{largo}z')

    for y in range(64):
        fila = []
        for x in range(64):
            dist = ((x + .5 - 32) ** 2 + (y + .5 - (oy + 13)) ** 2) ** .5
            fila.append('#' + bytes(ORO_CLARO if dist <= 12 else ORO if dist <= 19 else ROJO_OSCURO if dist <= 21.5 else ROJO).hex())
        x = 0
        while x < 64:
            fin = x
            while fin < 64 and fila[fin] == fila[x]:
                fin += 1
            if fila[x] != '#' + bytes(ROJO).hex():
                tramo(x, y, fin - x, fila[x])
            x = fin
    for y, fila in enumerate(BUSTO):
        x = 0
        while x < ancho:
            c = fila[x]
            if not c:
                x += 1
                continue
            fin = x
            while fin < ancho and fila[fin] == c:
                fin += 1
            tramo(ox + x, oy + y, fin - x, c)
            x = fin
    cuerpo = ''.join(f'<path fill="{tono}" d="{"".join(d)}"/>' for tono, d in trazos.items())
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" shape-rendering="crispEdges">'
            f'<rect width="64" height="64" rx="14" fill="#{bytes(ROJO).hex()}"/>{cuerpo}</svg>')


for nombre in ('logo.svg', 'favicon.svg'):
    (RAIZ / 'assets' / nombre).write_text(svg(), encoding='utf-8')
    print('assets/' + nombre)