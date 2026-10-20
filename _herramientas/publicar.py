"""Prepara una copia de Paglot lista para subir a internet. No cambia el proyecto: todo se hace en la copia.

    python _herramientas/publicar.py [carpeta_salida]
    python _herramientas/publicar.py --csp      # solo pone al día la CSP del index.html del proyecto (ver abajo)

Copia index.html, manifest.webmanifest, sw.js, .nojekyll, assets, css, cursos, js, juegos, api (sin config.php),
simulacros, muestras, robots.txt, sitemap.xml y pago.html a la carpeta de salida
(por defecto %TEMP%/paglot-publicar, que se vacía antes). Y solo en la copia:
- cambia __VERSION__ por <código corto de git>-<aaaammddHHMM> en los .html, .js y .css;
- une en una sola las hojas de estilo que enlaza index.html (css/paglot-<versión>.css) y ajusta sus url(...);
- recalcula los hashes sha256 de los <script> en línea que lleva la CSP de index.html.
No une JavaScript.

La CSP lleva el hash de cada <script> en línea de index.html: si se cambia uno (el del tema, el importmap…), la app no
arranca hasta rehacerla con --csp. _herramientas/comprobar.py avisa si no coinciden.
"""
import base64
import hashlib
import posixpath
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
LISTA = ['index.html', 'manifest.webmanifest', 'sw.js', '.nojekyll', 'assets', 'css', 'cursos', 'js', 'juegos',
         'api', 'simulacros', 'muestras', 'robots.txt', 'sitemap.xml', 'pago.html']
# una línea entera con <link rel="stylesheet">, con su sangría y su salto de línea
ENLACE_CSS = re.compile(r'[ \t]*<link\b[^>]*\brel="stylesheet"[^>]*>\n?')
HREF = re.compile(r'\bhref="([^"]+)"')
# los comentarios se buscan también, para saltarse un <script> que se mencione dentro de uno
SCRIPT = re.compile(r'<!--.*?-->|<script\b([^>]*)>(.*?)</script>', re.S)
CSP = re.compile(r'(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(">)')
URL_CSS = re.compile(r"""url\(\s*(['"]?)([^'"()]+?)\1\s*\)""")
AVISOS = []


def leer(ruta):
    """Texto de un archivo, con los saltos de línea de la web (LF), como los ve el navegador."""
    return ruta.read_bytes().decode('utf-8').replace('\r\n', '\n')


def version_actual():
    """Código corto del último cambio de git y la fecha y hora de publicar."""
    try:
        codigo = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=RAIZ, capture_output=True,
                                text=True, check=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        codigo = 'sin-git'
    return f"{codigo}-{datetime.now().strftime('%Y%m%d%H%M')}"


def copiar(destino):
    for nombre in LISTA:
        origen = RAIZ / nombre
        if not origen.exists():
            continue
        if origen.is_dir():
            # la configuración del servidor (con sus claves) no sale nunca del servidor
            shutil.copytree(origen, destino / nombre, ignore=shutil.ignore_patterns('config.php'))
        else:
            shutil.copy2(origen, destino / nombre)


def poner_version(destino, version):
    """Cambia __VERSION__ en los .html, .js y .css de la copia. Devuelve cuántos archivos cambió."""
    marca = b'__VERSION__'
    cambiados = 0
    for ruta in destino.rglob('*'):
        if ruta.is_file() and ruta.suffix in ('.html', '.js', '.css'):
            bruto = ruta.read_bytes()
            if marca in bruto:
                ruta.write_bytes(bruto.replace(marca, version.encode('ascii')))
                cambiados += 1
    return cambiados


def rebasar_urls(texto, carpeta, destino):
    """Cambia cada url(...) de una hoja de css/ o juegos/css/ para que funcione desde css/ (la hoja unida)."""
    def cambiar(m):
        comillas, ruta = m.group(1), m.group(2)
        if ruta.startswith(('data:', 'http:', 'https:', '//', '/', '#')):
            return m.group(0)
        ruta_archivo, resto = re.match(r'([^?#]*)(.*)', ruta).groups()
        dentro = posixpath.normpath(posixpath.join(carpeta, ruta_archivo))
        if not (destino / dentro).exists():
            AVISOS.append(f'url que no existe en la copia ({carpeta}/): {ruta}')
        return f'url({comillas}{posixpath.relpath(dentro, "css")}{resto}{comillas})'
    return URL_CSS.sub(cambiar, texto)


def unir_css(destino, html, version):
    """Une las hojas enlazadas en index.html, en orden, en css/paglot-<versión>.css.

    Devuelve el html nuevo, cuántas peticiones de CSS había y el nombre de la hoja unida.
    """
    enlaces = ENLACE_CSS.findall(html)
    partes = []
    for enlace in enlaces:
        href = HREF.search(enlace).group(1).split('?')[0].split('#')[0]
        origen = destino / href
        if not origen.is_file():
            sys.exit(f'No existe la hoja de estilo {href}')
        texto = leer(origen)
        if '@import' in texto:
            sys.exit(f'{href} usa @import: no se puede unir sin cambiarlo a mano')
        carpeta = origen.parent.relative_to(destino).as_posix()
        partes.append(f'/* {href} */\n' + rebasar_urls(texto, carpeta, destino))
    nombre = f'css/paglot-{version}.css'
    (destino / nombre).write_bytes('\n'.join(partes).encode('utf-8'))
    # el primer enlace pasa a ser el de la hoja unida; los demás se quitan
    vistos = []

    def cambiar(_):
        vistos.append(1)
        return f'  <link rel="stylesheet" href="{nombre}">\n' if len(vistos) == 1 else ''
    return ENLACE_CSS.sub(cambiar, html), len(enlaces), nombre


def recalcular_csp(html):
    """Pone en script-src los hashes de los <script> en línea tal como quedan en la copia."""
    hashes = []
    for m in SCRIPT.finditer(html):
        if m.group(1) is None or re.search(r'\bsrc\s*=', m.group(1)):
            continue
        digest = hashlib.sha256(m.group(2).encode('utf-8')).digest()
        hashes.append("'sha256-" + base64.b64encode(digest).decode('ascii') + "'")

    def cambiar(m):
        nuevas = []
        for directiva in (d.strip() for d in m.group(2).split(';') if d.strip()):
            partes = directiva.split()
            if partes[0] == 'script-src':
                partes = [p for p in partes if not p.startswith("'sha256-")] + hashes
            nuevas.append(' '.join(partes))
        return m.group(1) + '; '.join(nuevas) + m.group(3)
    html, encontradas = CSP.subn(cambiar, html)
    if encontradas != 1:
        sys.exit('index.html tiene que llevar una CSP en <meta http-equiv="Content-Security-Policy">')
    return html, len(hashes)


def main():
    if sys.argv[1:] == ['--csp']:
        index = RAIZ / 'index.html'
        html = leer(index)
        nuevo, hashes = recalcular_csp(html)
        if nuevo != html:
            index.write_bytes(nuevo.encode('utf-8'))
        print(f'CSP de index.html {"rehecha" if nuevo != html else "ya al día"} ({hashes} hashes)')
        return
    destino = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(tempfile.gettempdir()) / 'paglot-publicar'
    destino = destino.resolve()
    if destino == RAIZ or RAIZ in destino.parents or destino in RAIZ.parents:
        sys.exit(f'La carpeta de salida tiene que estar fuera del proyecto: {destino}')
    if destino.exists():
        shutil.rmtree(destino)
    destino.mkdir(parents=True)
    copiar(destino)

    version = version_actual()
    cambiados = poner_version(destino, version)
    index = destino / 'index.html'
    html = leer(index)
    html, antes, css = unir_css(destino, html, version)
    html, hashes = recalcular_csp(html)
    index.write_bytes(html.encode('utf-8'))

    print(f'Carpeta: {destino}')
    print(f'Versión: {version} (__VERSION__ cambiado en {cambiados} archivos)')
    print(f'Peticiones de CSS: {antes} antes, {len(ENLACE_CSS.findall(html))} después ({css}, '
          f'{(destino / css).stat().st_size // 1024} KB)')
    print(f'CSP: {hashes} hashes de <script> en línea en script-src')
    for aviso in sorted(set(AVISOS)):
        print('AVISO', aviso)


if __name__ == '__main__':
    main()
