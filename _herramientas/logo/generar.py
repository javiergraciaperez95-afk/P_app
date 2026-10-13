"""Dibuja el logotipo de Holaglot (un bocadillo de cómic con cara, en pixel art) y saca todos los iconos.

Uso:  py -X utf8 _herramientas/logo/generar.py            escribe los iconos de la web y de la APK
      py -X utf8 _herramientas/logo/generar.py prueba.png  solo una lámina de prueba para mirar el dibujo

El dibujo está aquí, en texto: para retocarlo se cambian las rejillas LOGO_32 / LOGO_16 o los colores
y se vuelve a lanzar. No necesita ninguna biblioteca (escribe los PNG a mano).
"""
import struct
import sys
import zlib
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
WEB = RAIZ / 'Idiomas' / 'assets'
ANDROID = RAIZ / '_apk' / 'android' / 'app' / 'src' / 'main' / 'res'

# ---------------------------------------------------------------------------
# Colores
# ---------------------------------------------------------------------------
FONDO = '#14111c'        # el fondo oscuro de la app
FONDO_ICONO = '#2f2843'  # el morado de los paneles: fondo del icono
PUNTO_ICONO = '#3b3256'  # trama de puntos sobre ese fondo
COLORES = {
    'K': '#1a1424',  # contorno
    'W': '#fff4dc',  # bocadillo
    'H': '#ffffff',  # brillo
    'S': '#efd3a4',  # sombra del bocadillo
    'E': '#2b1d33',  # ojos y boca
    'P': '#ff9aa8',  # mofletes
    'R': '#e2464e',  # lengua («glot» viene de lengua)
    'D': '#b02a35',  # sombra de la lengua
    'G': '#f4c84a',  # oro: destello y parte del nombre
}


def rgba(c, alfa=255):
    c = c.lstrip('#')
    return (int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16), alfa)


# ---------------------------------------------------------------------------
# El dibujo. Cada letra es un color de COLORES; el punto es transparente.
# ---------------------------------------------------------------------------
def bocadillo(ancho, alto, x0, y0, x1, y1, esquina, cola):
    """Máscara del bocadillo: un rectángulo de esquinas escalonadas y la cola (lista de (y, xa, xb))."""
    m = [[False] * ancho for _ in range(alto)]
    for y in range(y0, y1 + 1):
        d = min(y - y0, y1 - y)
        corte = esquina[d] if d < len(esquina) else 0
        for x in range(x0 + corte, x1 - corte + 1):
            m[y][x] = True
    for y, xa, xb in cola:
        for x in range(xa, xb + 1):
            m[y][x] = True
    return m


def pintar(m, detalles, sombra_abajo=0, brillo=()):
    alto, ancho = len(m), len(m[0])
    dentro = lambda x, y: 0 <= x < ancho and 0 <= y < alto and m[y][x]
    g = [['.'] * ancho for _ in range(alto)]
    for y in range(alto):
        for x in range(ancho):
            if not m[y][x]:
                continue
            borde = not all(dentro(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            g[y][x] = 'K' if borde else 'W'
    # Sombra: las filas de dentro que tienen el contorno justo debajo (o a «sombra_abajo» píxeles).
    for y in range(alto):
        for x in range(ancho):
            if g[y][x] != 'W':
                continue
            if any(dentro(x, y + k) and g[y + k][x] == 'K' for k in range(1, sombra_abajo + 1)):
                g[y][x] = 'S'
    for x, y in brillo:
        if g[y][x] == 'W':
            g[y][x] = 'H'
    for color, puntos in detalles.items():
        for x, y in puntos:
            g[y][x] = color
    return [''.join(f) for f in g]


def caja(xa, ya, xb, yb):
    return [(x, y) for y in range(ya, yb + 1) for x in range(xa, xb + 1)]


def logo_32():
    m = bocadillo(32, 32, 2, 3, 29, 23, [4, 2, 1, 1],
                  [(24, 7, 13), (25, 7, 12), (26, 7, 11), (27, 7, 10), (28, 7, 9), (29, 7, 8)])
    # El contorno de abajo del cuerpo no debe cruzar la cola: la unión queda abierta.
    detalles = {
        'E': caja(10, 9, 12, 14) + caja(19, 9, 21, 14)          # ojos
             + [(12, 16), (19, 16)] + caja(13, 17, 18, 17),      # sonrisa
        'H': [(10, 9), (11, 9), (10, 10), (19, 9), (20, 9), (19, 10)],  # brillo de los ojos
        'P': caja(6, 15, 8, 16) + caja(23, 15, 25, 16),          # mofletes
        'R': caja(15, 18, 17, 19) + [(15, 20), (16, 20)],        # lengua
        'D': [(17, 19), (16, 20)],
    }
    g = pintar(m, detalles, sombra_abajo=2, brillo=[(5, 6), (6, 5), (7, 5), (8, 5), (5, 7)])
    # Dentro de la unión con la cola no hay contorno ni sombra.
    g = [list(f) for f in g]
    for x in range(8, 13):
        g[23][x] = 'W'
    for y in (21, 22):
        for x in range(8, 13):
            g[y][x] = 'W'
    return [''.join(f) for f in g]


def logo_16():
    m = bocadillo(16, 16, 0, 1, 15, 11, [2, 1], [(12, 3, 7), (13, 3, 6), (14, 3, 5), (15, 3, 4)])
    detalles = {
        'E': caja(4, 4, 5, 6) + caja(10, 4, 11, 6) + [(6, 8), (9, 8), (7, 9), (8, 9)],
        'H': [(4, 4), (10, 4)],
        'P': [(2, 7), (3, 7), (12, 7), (13, 7)],
        'R': [(8, 10), (9, 10)],
    }
    g = pintar(m, detalles, sombra_abajo=0)
    g = [list(f) for f in g]
    for x in range(4, 7):
        g[11][x] = 'W'
    return [''.join(f) for f in g]


# Letras del nombre, en píxeles (7 de alto más 2 de rabo para la g).
LETRAS = {
    'H': ['X...X', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X', '.....', '.....'],
    'a': ['.....', '.....', '.XXX.', '....X', '.XXXX', 'X...X', '.XXXX', '.....', '.....'],
    'i': ['X', '.', 'X', 'X', 'X', 'X', 'X', '.', '.'],
    'x': ['.....', '.....', 'X...X', '.X.X.', '..X..', '.X.X.', 'X...X', '.....', '.....'],
    'g': ['.....', '.....', '.XXXX', 'X...X', 'X...X', 'X...X', '.XXXX', '....X', '.XXX.'],
    'l': ['X', 'X', 'X', 'X', 'X', 'X', 'X', '.', '.'],
    'o': ['.....', '.....', '.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.', '.....', '.....'],
    't': ['.X..', '.X..', 'XXXX', '.X..', '.X..', '.X..', '..XX', '....', '....'],
}


def negrita(letra):
    """Engorda una letra un píxel hacia la derecha (trazos de dos píxeles)."""
    return [''.join('X' if (x < len(f) and f[x] == 'X') or (x > 0 and f[x - 1] == 'X') else '.' for x in range(len(f) + 1))
            for f in letra]


def nombre_en_pixeles(texto='Holaglot', oro_desde=4):
    """El nombre como rejilla: «Hola» en claro (W) y «glot» en oro (G)."""
    filas = [''] * 9
    for i, letra in enumerate(texto):
        color = 'G' if i >= oro_desde else 'W'
        dibujo = negrita(LETRAS[letra])
        for y in range(9):
            filas[y] += dibujo[y].replace('X', color) + ('.' if i < len(texto) - 1 else '')
    return filas


# ---------------------------------------------------------------------------
# Imágenes: una lista de filas de (r, g, b, a)
# ---------------------------------------------------------------------------
def lienzo(ancho, alto, color=(0, 0, 0, 0)):
    return [[color] * ancho for _ in range(alto)]


def estampar(img, rejilla, x0, y0, k):
    """Pinta una rejilla sobre la imagen, con cada píxel del dibujo de k×k."""
    for y, fila in enumerate(rejilla):
        for x, c in enumerate(fila):
            if c == '.':
                continue
            color = rgba(COLORES[c])
            for yy in range(y0 + y * k, y0 + (y + 1) * k):
                if 0 <= yy < len(img):
                    fila_img = img[yy]
                    for xx in range(x0 + x * k, x0 + (x + 1) * k):
                        if 0 <= xx < len(fila_img):
                            fila_img[xx] = color


def centrar(img, rejilla, k, dy=0):
    alto, ancho = len(img), len(img[0])
    estampar(img, rejilla, (ancho - len(rejilla[0]) * k) // 2, (alto - len(rejilla) * k) // 2 + dy, k)


def fondo_icono(lado, forma, k):
    """Fondo morado con trama de puntos. forma: 'cuadrado', 'redondeado' (esquinas escalonadas) o 'circulo'."""
    img = lienzo(lado, lado)
    base, punto = rgba(FONDO_ICONO), rgba(PUNTO_ICONO)
    r = lado / 2
    escalon = [5, 3, 2, 1, 1]  # esquina, en píxeles de dibujo
    for y in range(lado):
        for x in range(lado):
            if forma == 'circulo':
                if (x + .5 - r) ** 2 + (y + .5 - r) ** 2 > r * r:
                    continue
            elif forma == 'redondeado':
                dy = min(y, lado - 1 - y) // k
                corte = escalon[dy] * k if dy < len(escalon) else 0
                if x < corte or x >= lado - corte:
                    continue
            # un punto de k×k cada 4 píxeles de dibujo
            img[y][x] = punto if (x // k) % 4 == 1 and (y // k) % 4 == 1 else base
    return img


def guardar_png(img, ruta):
    alto, ancho = len(img), len(img[0])
    crudo = b''.join(b'\x00' + bytes(v for px in fila for v in px) for fila in img)

    def trozo(tipo, datos):
        return struct.pack('>I', len(datos)) + tipo + datos + struct.pack('>I', zlib.crc32(tipo + datos) & 0xffffffff)

    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_bytes(b'\x89PNG\r\n\x1a\n' + trozo(b'IHDR', struct.pack('>IIBBBBB', ancho, alto, 8, 6, 0, 0, 0))
                     + trozo(b'IDAT', zlib.compress(crudo, 9)) + trozo(b'IEND', b''))


def guardar_svg(rejilla, ruta):
    """SVG con un rectángulo por cada tramo de píxeles del mismo color (se ve nítido a cualquier tamaño)."""
    alto, ancho = len(rejilla), len(rejilla[0])
    piezas = []
    for y, fila in enumerate(rejilla):
        x = 0
        while x < ancho:
            c = fila[x]
            fin = x
            while fin + 1 < ancho and fila[fin + 1] == c:
                fin += 1
            if c != '.':
                piezas.append(f'<rect x="{x}" y="{y}" width="{fin - x + 1}" height="1" fill="{COLORES[c]}"/>')
            x = fin + 1
    ruta.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho} {alto}" shape-rendering="crispEdges">'
                    + ''.join(piezas) + '</svg>\n', encoding='utf-8', newline='\n')


# ---------------------------------------------------------------------------
# Lo que se genera
# ---------------------------------------------------------------------------
def icono(lado, k_logo, forma, k_fondo=None):
    img = fondo_icono(lado, forma, k_fondo or max(1, lado // 64))
    centrar(img, logo_32(), k_logo)
    return img


def icono_pequeno(lado, forma):
    """Icono de la APK: el dibujo ocupa unos dos tercios; en los tamaños pequeños entra mejor el de 16."""
    img = fondo_icono(lado, forma, max(1, lado // 48))
    opciones = [(abs(g * k - lado * .67), -g, g, k) for g in (32, 16) for k in range(1, 9) if g * k <= lado * .72]
    _, _, rejilla, k = min(opciones)
    centrar(img, logo_32() if rejilla == 32 else logo_16(), k)
    return img


def suelto(lado, rejilla, k):
    img = lienzo(lado, lado)
    centrar(img, rejilla, k)
    return img


def arranque(ancho, alto):
    """Pantalla de arranque de la APK: el logotipo y el nombre sobre el fondo de la app."""
    img = lienzo(ancho, alto, rgba(FONDO))
    corto = min(ancho, alto)
    k = max(2, round(corto * .36 / 32))
    k_nombre = max(1, round(k * .7))
    nombre = nombre_en_pixeles()
    total = 32 * k + 5 * k + 9 * k_nombre
    arriba = (alto - total) // 2
    estampar(img, logo_32(), (ancho - 32 * k) // 2, arriba, k)
    estampar(img, nombre, (ancho - len(nombre[0]) * k_nombre) // 2, arriba + 37 * k, k_nombre)
    return img


def lamina(ruta):
    """Lámina de prueba: el dibujo en grande y en pequeño, sobre fondo oscuro y claro."""
    img = lienzo(1100, 760, rgba('#807a8c'))
    for y in range(0, 760):
        for x in range(0, 550):
            img[y][x] = rgba(FONDO)
        for x in range(550, 1100):
            img[y][x] = rgba('#efe4cc')
    estampar(img, logo_32(), 30, 20, 10)
    estampar(img, logo_32(), 580, 20, 10)
    estampar(img, logo_16(), 370, 30, 8)
    estampar(img, logo_16(), 920, 30, 8)
    for i, k in enumerate((1, 2, 3)):
        estampar(img, logo_16(), 370 + i * 60, 190, k)
        estampar(img, logo_16(), 920 + i * 60, 190, k)
    estampar(img, logo_32(), 370, 260, 2)
    estampar(img, logo_32(), 920, 260, 2)
    estampar(img, nombre_en_pixeles(), 30, 360, 6)
    nombre = nombre_en_pixeles()
    estampar(img, nombre, 580, 360, 6)
    for i, (forma, lado, kl) in enumerate((('redondeado', 192, 4), ('circulo', 192, 4), ('cuadrado', 180, 4))):
        ic = icono(lado, kl, forma)
        for y, fila in enumerate(ic):
            for x, px in enumerate(fila):
                if px[3]:
                    img[440 + y][30 + i * 220 + x] = px
    sp = arranque(360, 640)
    for y, fila in enumerate(sp):
        for x, px in enumerate(fila):
            if y % 2 == 0 and x % 2 == 0:
                img[440 + y // 2][720 + x // 2] = px
    guardar_png(img, Path(ruta))


def main():
    if len(sys.argv) > 1:
        lamina(sys.argv[1])
        print('Lámina de prueba en', sys.argv[1])
        return

    # --- Web ---
    guardar_svg(logo_16(), WEB / 'favicon.svg')
    guardar_svg(logo_32(), WEB / 'logo.svg')
    guardar_png(suelto(32, logo_16(), 2), WEB / 'favicon-32.png')
    guardar_png(icono(180, 4, 'cuadrado', 3), WEB / 'apple-touch-icon.png')
    guardar_png(icono(192, 4, 'redondeado'), WEB / 'icono-192.png')
    guardar_png(icono(512, 11, 'redondeado'), WEB / 'icono-512.png')
    guardar_png(icono(512, 9, 'cuadrado'), WEB / 'icono-512-maskable.png')

    # --- APK (Android) ---
    for carpeta, lado in (('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)):
        d = ANDROID / f'mipmap-{carpeta}'
        guardar_png(icono_pequeno(lado, 'redondeado'), d / 'ic_launcher.png')
        guardar_png(icono_pequeno(lado, 'circulo'), d / 'ic_launcher_round.png')
        frente = lado * 108 // 48
        guardar_png(suelto(frente, logo_32(), max(1, frente // 54)), d / 'ic_launcher_foreground.png')
    for carpeta, (ancho, alto) in {
        'drawable': (480, 320), 'drawable-land-mdpi': (480, 320), 'drawable-land-hdpi': (800, 480),
        'drawable-land-xhdpi': (1280, 720), 'drawable-land-xxhdpi': (1600, 960), 'drawable-land-xxxhdpi': (1920, 1280),
        'drawable-port-mdpi': (320, 480), 'drawable-port-hdpi': (480, 800), 'drawable-port-xhdpi': (720, 1280),
        'drawable-port-xxhdpi': (960, 1600), 'drawable-port-xxxhdpi': (1280, 1920),
    }.items():
        guardar_png(arranque(ancho, alto), ANDROID / carpeta / 'splash.png')
    print('Iconos escritos en', WEB, 'y en', ANDROID)


if __name__ == '__main__':
    main()
