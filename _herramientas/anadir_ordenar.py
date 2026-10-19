"""Pone un ejercicio de producción («ordena las palabras») en las lecciones que no tienen ninguno (19-10-2026).

En los cursos beta había lecciones que solo se contestaban eligiendo (test, huecos, traducción): sin escribir ni
ordenar no se produce nada. Aquí se toma una frase de la propia lección (de su diálogo o su texto, y si no, de un
ejercicio de traducción) de 3 a 7 palabras,
con su traducción, y se añade al final un bloque «ordenar», como los que ya tienen las demás lecciones. Las palabras
van separadas por espacios (en japonés y chino las frases ya los llevan). También se apunta en el índice
(indice/lecciones.json), que es lo que cuenta el progreso.

    python _herramientas/anadir_ordenar.py [cursos…]      (sin cursos: todos menos es)
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
leer = lambda p: json.loads(Path(p).read_text(encoding='utf-8-sig'))
escribir = lambda p, d: Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')
PREGUNTA = {'@es': 'Ordena las palabras.', '@en': 'Put the words in order.'}
FINAL = re.compile(r'[\s.!?¡¿。！？…«»"“”]+$')


def candidata(frase, campo, curso):
    """La frase lista para ordenar, o None si no vale."""
    texto = frase.get(campo)
    es = frase.get('es')
    en = frase.get('en') if curso != 'en' else None  # en el curso de inglés, «en» es la frase misma
    if not isinstance(texto, str) or not isinstance(es, str) or not es.strip():
        return None
    limpia = FINAL.sub('', texto.strip()).lstrip('¡¿«"“ ')
    palabras = limpia.split()
    if not 3 <= len(palabras) <= 7 or len(limpia) > 48 or any(len(p) > 18 for p in palabras):
        return None
    traduccion = {'@es': es.strip(), '@en': en.strip()} if isinstance(en, str) and en.strip() else es.strip()
    return limpia, traduccion, abs(len(palabras) - 5)


def main():
    cursos = sys.argv[1:] or sorted(p.name for p in (RAIZ / 'cursos').iterdir() if p.is_dir() and p.name != 'es' and not p.name.startswith('_'))
    for curso in cursos:
        base = RAIZ / 'cursos' / curso
        findice = base / 'indice' / 'lecciones.json'
        indice = leer(findice)
        entradas = {e['id']: e for e in indice['lecciones']}
        puestas = saltadas = 0
        for f in sorted((base / 'lessons').glob('[0-9][0-9][0-9].json')):
            d = leer(f)
            bloques = d.get('bloques', [])
            if d.get('esquema') == 2 or any(b.get('tipo') in ('ordenar', 'escribir') for b in bloques):
                continue
            opciones = [c for b in bloques if b.get('tipo') in ('dialogo', 'texto') for fr in b.get('frases', [])
                        if isinstance(fr, dict) and (c := candidata(fr, curso, curso))]
            # si no, de un ejercicio de traducción: su frase y la opción buena son una frase con su traducción
            if not opciones:
                for b in bloques:
                    buena = next((o for o in b.get('opciones', []) if isinstance(o, dict) and o.get('correcta')), None)
                    if b.get('tipo') != 'traduccion' or not isinstance(b.get('frase'), str) or not buena:
                        continue
                    trad = buena.get('texto')
                    es, en = (trad.get('@es'), trad.get('@en')) if isinstance(trad, dict) else (trad, None)
                    if c := candidata({curso: b['frase'], 'es': es, 'en': en}, curso, curso):
                        opciones.append(c)
            if not opciones:
                saltadas += 1
                continue
            frase, traduccion, _ = min(opciones, key=lambda o: o[2])
            ident = f'{curso}{f.stem}-ord'
            bloques.append({'tipo': 'ordenar', 'pregunta': PREGUNTA, 'frase': frase, 'traduccion': traduccion, 'id': ident})
            escribir(f, d)
            entrada = entradas.get(f.stem)
            if entrada is not None:
                entrada.setdefault('ejercicios', []).append([f'id|{ident}'])
            puestas += 1
        escribir(findice, indice)
        print(f'{curso}: {puestas} lecciones con «ordena las palabras» nuevo · {saltadas} sin frase que valga')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
