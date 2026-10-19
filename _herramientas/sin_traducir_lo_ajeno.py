"""Quita el inglés de máquina de los textos que no estaban en español (19-10-2026).

En los {"@es", "@en"} cuyo «español» en realidad está en el idioma del curso («Un, une, des», «Qu'est-ce que c'est ?»),
el modelo es→en se inventó algo («One, one, two, two.»). Ahí se deja el texto original para los dos idiomas.
Se mira solo en textos cortos (hasta 8 palabras), que es donde pasa (ver es_ajeno).

    python _herramientas/sin_traducir_lo_ajeno.py [--ver] fr de …
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import traducir_cursos_en as base  # noqa: E402
from juntar_es_en import leer, escribir  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent


def es_ajeno(texto, curso, vocab):
    """¿Está entero en el idioma del curso? Fuera de «comillas» y **negrita**: todas sus palabras son del curso y alguna
    no es española (o, en los cursos de otra escritura, no queda ninguna palabra en letras latinas)."""
    palabras = [w.lower() for w in base.PALABRA.findall(base.PROTEGIDO.sub(' ', texto))]
    if curso in base.NO_LATINOS:
        return not any(re.fullmatch(r"[a-záéíóúüñ']+", w) for w in palabras)
    return bool(palabras) and all(w in vocab for w in palabras) and any(w not in base.VOCAB_ES for w in palabras)


def main():
    ver = '--ver' in sys.argv
    for curso in [a for a in sys.argv[1:] if not a.startswith('--')]:
        vocab = base.vocabulario(curso)
        cuantos, ejemplos = 0, []

        def andar(d):
            nonlocal cuantos
            if isinstance(d, list):
                return [andar(x) for x in d]
            if not isinstance(d, dict):
                return d
            if set(d) == {'@es', '@en'}:
                es = d['@es']
                if len(base.PALABRA.findall(es)) <= 8 and re.search(r'[^\W\d_]', es) and es_ajeno(es, curso, vocab):
                    cuantos += 1
                    if len(ejemplos) < 12:
                        ejemplos.append(f"{es[:50]!r} → {d['@en'][:50]!r}")
                    return es
                return d
            return {k: andar(v) for k, v in d.items()}

        for f in sorted((RAIZ / 'cursos' / curso).rglob('*.json')):
            d = leer(f)
            nuevo = andar(d)
            if not ver and nuevo != d:
                escribir(f, nuevo)
        print(f'{curso}: {cuantos} textos sin traducir')
        if ver:
            for e in ejemplos:
                print('    ', e)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
