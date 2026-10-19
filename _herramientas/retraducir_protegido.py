"""Vuelve a traducir al inglés las explicaciones cuyo inglés perdió letras del idioma que se estudia (19-10-2026).

El modelo es→en estropea lo que no es español: «Verbo irregular: くる → きて» salía «Irregular verb: h. h. h.».
Aquí, antes de traducir, se tapan los trozos escritos en el idioma del curso (kana y kanji, hangul, cirílico, griego,
tailandés, palabras vietnamitas) y después se vuelven a poner tal cual. Solo se tocan los {"@es", "@en"} cuyo inglés
no conserva esas letras; si el modelo pierde una marca, el inglés se queda en el español original.

    python _herramientas/retraducir_protegido.py ja ko zh ru el th vi
    python _herramientas/retraducir_protegido.py --trozos ja ko zh ru el th vi   # 2.ª vuelta, ver a_trozos()
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import traducir_cursos_en as base  # noqa: E402
from juntar_es_en import ESCRITURA, leer, escribir  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
VI_LETRA = ESCRITURA['vi'][1:-1]


def patron_de(curso):
    """Trozos que no se traducen: seguidos de letras del curso, con lo que va entre ellos (espacios, guiones, ~…)."""
    if curso == 'vi':
        palabra = rf"[A-Za-z{VI_LETRA}]*[{VI_LETRA}][A-Za-z{VI_LETRA}]*"
        return re.compile(rf"{palabra}(?:[ \-]+{palabra})*")
    letra = ESCRITURA[curso]
    return re.compile(rf"{letra}+(?:[\s\-~・·/]*{letra}+)*")


def perdio(curso, es, en):
    letras = ESCRITURA[curso]
    return sorted(re.findall(letras, es)) != sorted(re.findall(letras, en))


def tapar(frase, patron, curso, vocab):
    tapados = []
    def marca(m):
        tapados.append(m.group(0))
        return f'ZQY{len(tapados) - 1}'
    texto = patron.sub(marca, frase)
    texto, trozos = base.preparar(texto, curso, vocab, set())
    return texto, trozos, tapados


def a_trozos(cursos, motor):
    """Segunda vuelta: los que se quedaron en español porque el modelo perdía una marca se traducen a trozos, lo que
    hay entre lo tapado por separado (peor que la frase entera, pero mejor que dejarlo en español)."""
    for curso in cursos:
        patron = patron_de(curso)
        vocab = base.vocabulario(curso)
        datos = {f: leer(f) for f in sorted((RAIZ / 'cursos' / curso).rglob('*.json'))}
        pares = []

        def buscar(d, f):
            if isinstance(d, dict):
                if set(d) == {'@es', '@en'}:
                    if d['@es'] == d['@en']:
                        pares.append((f, d))
                    return
                for v in d.values():
                    buscar(v, f)
            elif isinstance(d, list):
                for v in d:
                    buscar(v, f)

        for f, d in datos.items():
            buscar(d, f)
        hay_letras = lambda x: re.search(r'[^\W\d_]', x)

        def piezas(par):
            for pre, frases, suf in base.partes(par['@es']):
                for frase in frases:
                    texto, trozos_, tapados = tapar(frase, patron, curso, vocab)
                    yield pre, frase, suf, re.split(r'(ZQ[XY]\d+)', texto), trozos_, tapados

        motor.lote([x.strip() for par in (p for _, p in pares) for *_, partes_, _, _ in piezas(par)
                    for x in partes_ if not re.fullmatch(r'ZQ[XY]\d+', x) and hay_letras(x)])
        for _, par in pares:
            lineas, linea, ultimo = [], [], None
            for pre, frase, suf, partes_, trozos_, tapados in piezas(par):
                hecho = []
                for x in partes_:
                    if (m := re.fullmatch(r'ZQX(\d+)', x)):
                        hecho.append(re.sub(r'ZQY(\d+)', lambda n: tapados[int(n.group(1))], trozos_[int(m.group(1))][1]))
                    elif (m := re.fullmatch(r'ZQY(\d+)', x)):
                        hecho.append(tapados[int(m.group(1))])
                    elif hay_letras(x):
                        ingles = motor.cache.get(x.strip(), x.strip()).rstrip('.') if not x.strip().endswith('.') else motor.cache.get(x.strip(), x.strip())
                        hecho.append(x[:len(x) - len(x.lstrip())] + ingles + x[len(x.rstrip()):])
                    else:
                        hecho.append(x)
                if ultimo is not None and ultimo != (pre, suf):
                    lineas.append(ultimo[0] + ' '.join(linea) + ultimo[1])
                    linea = []
                linea.append(''.join(hecho))
                ultimo = (pre, suf)
            if ultimo is not None:
                lineas.append(ultimo[0] + ' '.join(linea) + ultimo[1])
            par['@en'] = '\n'.join(lineas)
        for f in {f for f, _ in pares}:
            escribir(f, datos[f])
        print(f'{curso}: {len(pares)} traducidos a trozos', flush=True)


def main():
    cursos = [a for a in sys.argv[1:] if not a.startswith('--')]
    motor = base.Traductor()
    if '--trozos' in sys.argv:
        a_trozos(cursos, motor)
        base.escribir(base.CACHE, motor.cache)
        return
    for curso in cursos:
        patron = patron_de(curso)
        vocab = base.vocabulario(curso)
        archivos = sorted((RAIZ / 'cursos' / curso).rglob('*.json'))
        pares = []  # (archivo, objeto {@es, @en}) que hay que rehacer

        def buscar(d, f):
            if isinstance(d, dict):
                if set(d) == {'@es', '@en'}:
                    if perdio(curso, d['@es'], d['@en']):
                        pares.append((f, d))
                    return
                for v in d.values():
                    buscar(v, f)
            elif isinstance(d, list):
                for v in d:
                    buscar(v, f)

        datos = {f: leer(f) for f in archivos}
        for f, d in datos.items():
            buscar(d, f)
        # 1) qué frases hay que traducir
        pendientes = []
        for _, par in pares:
            for _, frases, _ in base.partes(par['@es']):
                for frase in frases:
                    texto, _, _ = tapar(frase, patron, curso, vocab)
                    if re.search(r'[^\W\d_]', re.sub(r'ZQ[XY]\d+', '', texto)):
                        pendientes.append(texto)
        print(f'{curso}: {len(pares)} explicaciones · {len(set(pendientes))} frases', flush=True)
        motor.lote(pendientes)
        # 2) montar el inglés
        fallos = 0
        for _, par in pares:
            lineas, ok = [], True
            for pre, frases, suf in base.partes(par['@es']):
                hechas = []
                for frase in frases:
                    texto, trozos, tapados = tapar(frase, patron, curso, vocab)
                    if not re.search(r'[^\W\d_]', re.sub(r'ZQ[XY]\d+', '', texto)):
                        hechas.append(frase)
                        continue
                    ingles = motor.cache.get(texto, '')
                    if sorted(map(int, re.findall(r'ZQX(\d+)', ingles))) != list(range(len(trozos))) or \
                            sorted(map(int, re.findall(r'ZQY(\d+)', ingles))) != list(range(len(tapados))):
                        ok = False
                        break
                    def poner(m):
                        t, original, dentro = trozos[int(m.group(1))]
                        if t == 'trad':
                            return f'{original[0]}{motor.cache.get(dentro, dentro)}{original[-1]}'
                        return original
                    ingles = re.sub(r'ZQX(\d+)', poner, ingles)
                    hechas.append(re.sub(r'ZQY(\d+)', lambda m: tapados[int(m.group(1))], ingles))
                if not ok:
                    break
                lineas.append(pre + ' '.join(hechas) + suf)
            if ok:
                par['@en'] = '\n'.join(lineas)
            else:
                fallos += 1
                par['@en'] = par['@es']
        for f in {f for f, _ in pares}:
            escribir(f, datos[f])
        print(f'{curso}: hecho · {fallos} se quedan en español (el modelo perdió una marca)', flush=True)
    base.escribir(base.CACHE, motor.cache)
    print('Fin.')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
