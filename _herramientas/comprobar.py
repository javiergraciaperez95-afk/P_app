"""Comprobaciones de Paglot que se hacen en cada cambio (y en GitHub Actions, .github/workflows/comprobar.yml).

    python _herramientas/comprobar.py

1. Todos los .json de cursos/ se leen bien (utf-8, con o sin BOM).
2. js/i18n/en.js, es.js y vi.js tienen las mismas claves. Las que acaban en @es solo van en en.js y vi.js.
3. Ningún archivo de cursos/ tiene ZQX o ZQY seguido de cifras (texto de prueba que no debe llegar a la app).
4. Cada objeto JSON de cursos/ con @es o @en tiene solo esas dos claves, y las dos son texto.
5. La CSP de index.html lleva el hash de cada <script> en línea (si no, la app no arranca): se rehace con
   python _herramientas/publicar.py --csp
6. Todo lo que el código guarda en el dispositivo está en el aviso legal.
7. Las lecciones de cursos/<curso>/<es|en|vi>/ cumplen la plantilla estricta de su modelo (_herramientas/modelos/).

Sale con código 1 si algo falla y dice qué y dónde. No cambia ningún archivo.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CURSOS = RAIZ / 'cursos'
I18N = RAIZ / 'js' / 'i18n'
MAXIMO_LISTADO = 20  # cuántos fallos se escriben por comprobación
# Las claves empiezan la línea o van detrás de una coma (en en.js y vi.js hay dos en la misma línea).
CLAVE = re.compile(r"(?:^|,)\s*'([^']+)'\s*:", re.M)
ZQ = re.compile(rb'ZQ[XY][0-9]')


def relativa(ruta):
    return ruta.relative_to(RAIZ).as_posix()


def comprobar_i18n():
    """Mismas claves en los tres idiomas de la interfaz (las @es, solo en en.js y vi.js)."""
    errores = []
    claves = {}
    for idioma in ('en', 'es', 'vi'):
        texto = (I18N / f'{idioma}.js').read_text(encoding='utf-8')
        claves[idioma] = [m.group(1) for m in CLAVE.finditer(texto)]
    es, en, vi = (set(claves[i]) for i in ('es', 'en', 'vi'))
    arroba_es = sorted(k for k in es if k.endswith('@es'))
    if arroba_es:
        errores.append('es.js tiene claves que acaban en @es (solo deben ir en en.js y vi.js): ' + ', '.join(arroba_es))
    if en - vi:
        errores.append('solo en en.js: ' + ', '.join(sorted(en - vi)))
    if vi - en:
        errores.append('solo en vi.js: ' + ', '.join(sorted(vi - en)))
    # en.js y vi.js deben tener lo de es.js, salvo las claves @es, que no van en es.js
    sin_arroba = {k for k in en if not k.endswith('@es')}
    if es - sin_arroba:
        errores.append('solo en es.js: ' + ', '.join(sorted(es - sin_arroba)))
    if sin_arroba - es:
        errores.append('falta en es.js: ' + ', '.join(sorted(sin_arroba - es)))
    return errores, {i: len(c) for i, c in claves.items()}


def revisar_objetos(dato, camino, ruta, errores):
    """Recorre el JSON buscando objetos con @es o @en y comprueba sus claves."""
    if isinstance(dato, dict):
        if '@es' in dato or '@en' in dato:
            claves = set(dato)
            donde = f'{relativa(ruta)} {camino or "(raiz)"}'
            if claves != {'@es', '@en'}:
                errores.append(f'{donde}: claves {sorted(claves)} (deben ser solo @es y @en)')
            elif not (isinstance(dato['@es'], str) and isinstance(dato['@en'], str)):
                errores.append(f'{donde}: @es y @en deben ser texto')
        for clave, valor in dato.items():
            revisar_objetos(valor, f'{camino}.{clave}', ruta, errores)
    elif isinstance(dato, list):
        for n, valor in enumerate(dato):
            revisar_objetos(valor, f'{camino}[{n}]', ruta, errores)


def comprobar_cursos():
    """JSON legibles, sin marcas ZQX/ZQY y objetos @es/@en bien formados."""
    errores_json, errores_zq, errores_objetos = [], [], []
    total = 0
    for ruta in sorted(CURSOS.rglob('*')):
        if not ruta.is_file():
            continue
        bruto = ruta.read_bytes()
        for m in ZQ.finditer(bruto):
            linea = bruto.count(b'\n', 0, m.start()) + 1
            errores_zq.append(f'{relativa(ruta)}:{linea} {m.group().decode("ascii")}')
        if ruta.suffix != '.json':
            continue
        total += 1
        try:
            dato = json.loads(bruto.decode('utf-8-sig'))
        except (ValueError, UnicodeDecodeError) as fallo:
            errores_json.append(f'{relativa(ruta)}: no se lee como JSON ({fallo})')
            continue
        revisar_objetos(dato, '', ruta, errores_objetos)
    return (errores_json, total), errores_zq, errores_objetos


def comprobar_csp():
    """Los hashes de la CSP de index.html, comparados con los de sus <script> en línea de ahora."""
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from publicar import leer, recalcular_csp
    html = leer(RAIZ / 'index.html')
    return [] if recalcular_csp(html)[0] == html else ['index.html: rehazla con python _herramientas/publicar.py --csp']


def comprobar_datos_guardados():
    """Cada clave que el código guarda en el dispositivo está en la lista del aviso legal (DATOS_DISPOSITIVO de
    js/vistas/legal.js): «el usuario tiene que saber todos los datos que guardamos sobre él, sin excepciones»."""
    legal = (RAIZ / 'js' / 'vistas' / 'legal.js').read_text(encoding='utf-8')
    bloque = legal[legal.index('export const DATOS_DISPOSITIVO'):]
    bloque = bloque[:bloque.index('];')]
    listadas = set(re.findall(r"'([^']+)'", bloque))
    # «P-» es el prefijo de cada curso (espanol-, ingles-…) y «…» quiere decir «y lo que siga» (P-tarjeta:…)
    prefijos = set(re.findall(r'"prefijo": "([^"]+)"', (RAIZ / 'js' / 'cursos.js').read_text(encoding='utf-8')))
    abiertas = [x[:-1].rstrip(':') for x in listadas if x.endswith('…')]

    def esta(clave):
        if clave in listadas or any(clave.startswith(a) for a in abiertas):
            return True
        cabeza, _, resto = clave.partition('-')
        return cabeza in prefijos and bool(resto) and esta(f'P-{resto}')
    archivos = [*(RAIZ / 'js').rglob('*.js'), *(RAIZ / 'juegos').rglob('*.js'), RAIZ / '_apk' / 'puente.js']
    errores = []
    for archivo in archivos:
        if 'i18n' in archivo.parts or not archivo.exists():
            continue
        texto = archivo.read_text(encoding='utf-8')
        claves = set(re.findall(r"\bCLAVE[A-Z_]*\s*=\s*'([^']+)'", texto))
        claves |= set(re.findall(r"(?:localStorage|sessionStorage)\.(?:setItem|getItem|removeItem)\('([^']+)'", texto))
        claves |= {f'P-{c}' for c in re.findall(r"\bclave\('([^']+)'\)", texto)}
        for c in sorted(c for c in claves if not esta(c)):
            errores.append(f'{relativa(archivo)}: «{c}» no está en DATOS_DISPOSITIVO (js/vistas/legal.js) ni, por tanto, en el aviso legal')
    return errores


def comprobar_modelos():
    """Las lecciones de las carpetas por idioma del alumno (cursos/<curso>/<es|en|vi>/) cumplen su plantilla estricta
    (_herramientas/modelos/comun.py). Las carpetas montadas (con indice.json) tienen que estar completas."""
    sys.path.insert(0, str(Path(__file__).resolve().parent / 'modelos'))
    from comun import validar_leccion, lenguas_de, CURSOS as CODIGOS
    errores, total = [], 0
    for c in CODIGOS:
        for l in lenguas_de(c):
            carpeta = CURSOS / c / l
            if not carpeta.is_dir():
                continue
            montada = (carpeta / 'indice.json').exists()
            for ruta in sorted(carpeta.glob('[0-9][0-9][0-9].json')):
                total += 1
                try:
                    dato = json.loads(ruta.read_text(encoding='utf-8-sig'))
                except ValueError:
                    continue  # ya lo dice la comprobación 1
                for fallo in validar_leccion(dato, c, l, ruta.stem, completa=montada)[:2]:
                    errores.append(f'{relativa(ruta)}: {fallo}')
    return errores, total


def mostrar(titulo, errores, detalle=''):
    estado = 'OK' if not errores else f'FALLA ({len(errores)})'
    print(f'{titulo}: {estado}{detalle}')
    for error in errores[:MAXIMO_LISTADO]:
        print(f'   - {error}')
    if len(errores) > MAXIMO_LISTADO:
        print(f'   ... y {len(errores) - MAXIMO_LISTADO} más')


def main():
    fallos = 0
    (errores_json, total), errores_zq, errores_objetos = comprobar_cursos()
    mostrar('1. JSON de cursos/', errores_json, f' ({total} archivos)')
    errores_i18n, cuentas = comprobar_i18n()
    mostrar('2. Claves de en.js, es.js y vi.js', errores_i18n,
            ' (' + ', '.join(f'{i} {n}' for i, n in cuentas.items()) + ')')
    mostrar('3. Sin ZQX/ZQY seguido de cifras en cursos/', errores_zq)
    mostrar('4. Objetos con @es y @en', errores_objetos)
    errores_csp = comprobar_csp()
    mostrar('5. CSP de index.html al día', errores_csp)
    errores_datos = comprobar_datos_guardados()
    mostrar('6. Todo lo que se guarda, en el aviso legal', errores_datos)
    errores_modelos, total_modelos = comprobar_modelos()
    mostrar('7. Lecciones de los modelos (explicar primero)', errores_modelos, f' ({total_modelos} archivos)')
    for errores in (errores_json, errores_i18n, errores_zq, errores_objetos, errores_csp, errores_datos, errores_modelos):
        fallos += len(errores)
    print('Todo correcto.' if not fallos else f'{fallos} fallo(s).')
    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
