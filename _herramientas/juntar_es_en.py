"""Deja los cursos explicados en español Y en inglés (19-10-2026).

traducir_cursos_en.py SUSTITUYÓ las explicaciones en español por el inglés de la máquina. Este script recupera el
español de antes (una copia de los archivos sin traducir) y pone los dos juntos donde hubo cambio:
    "texto": "Se dice así."   +   "texto": "It's said like this."   →   "texto": {"@es": "Se dice así.", "@en": "It's said like this."}
La app (js/lessons.js, elegirIdiomaContenido) se queda con uno de los dos al cargar, según el idioma de la interfaz.
Lo que ya llevaba «es» y «en» juntos (significados, traducciones de frases) no se toca.

    python _herramientas/juntar_es_en.py <carpeta con los cursos sin traducir> fr de ja …

Además cuenta las explicaciones cuyo inglés perdió letras del idioma que se estudia (el modelo es→en a veces
estropea las palabras japonesas, vietnamitas…): en esas el inglés lleva el trozo en su idioma tal cual estaba.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ESCRITURA = {'ja': r'[぀-ヿ一-鿿]', 'zh': r'[一-鿿]', 'ko': r'[가-힯]', 'ru': r'[Ѐ-ӿ]',
             'el': r'[Ͱ-Ͽ]', 'th': r'[฀-๿]',
             'vi': r'[àảãạăằẳẵặắâầẩẫậấèẻẽẹêềểễệếìỉĩịòỏõọôồổỗộốơờởỡợớùủũụưừửữựứỳỷỹỵđĐ]'}

leer = lambda p: json.loads(Path(p).read_text(encoding='utf-8-sig'))
escribir = lambda p, d: Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')


def juntar(o, n, cuenta, letras, curso='', clave='', padre=''):
    # En el curso de inglés, «en» es el idioma que se estudia: el «en» que la máquina añadió a los significados
    # («doctor» → «doctor, doctor») estorba, y las opciones de traducir al español se quedan en español.
    if curso == 'en' and clave == 'texto' and padre == 'opciones' and isinstance(o, str):
        return o
    if isinstance(o, dict) and isinstance(n, dict):
        if set(n) == {'@es', '@en'}:
            return n  # ya juntado
        return {k: juntar(o[k], v, cuenta, letras, curso, k, clave) if k in o else v
                for k, v in n.items() if k in o or not (curso == 'en' and k == 'en')}
    if isinstance(o, list) and isinstance(n, list) and len(o) == len(n):
        return [juntar(a, b, cuenta, letras, curso, clave, padre) for a, b in zip(o, n)]
    if isinstance(o, str) and isinstance(n, str):
        if o == n:
            return n
        cuenta['pares'] += 1
        if letras and sorted(re.findall(letras, o)) != sorted(re.findall(letras, n)):
            cuenta['estropeadas'] += 1
            if len(cuenta['ejemplos']) < 4:
                cuenta['ejemplos'].append((o[:90], n[:90]))
        return {'@es': o, '@en': n}
    if o != n:
        cuenta['distintas'] += 1
    return n


def main():
    origen = Path(sys.argv[1])
    for curso in sys.argv[2:]:
        base = RAIZ / 'cursos' / curso
        cuenta = {'pares': 0, 'estropeadas': 0, 'distintas': 0, 'archivos': 0, 'ejemplos': []}
        for f in sorted(base.rglob('*.json')):
            viejo = origen / curso / f.relative_to(base)
            if not viejo.exists():
                continue
            o, n = leer(viejo), leer(f)
            nuevo = juntar(o, n, cuenta, ESCRITURA.get(curso), curso)
            if nuevo != n:
                escribir(f, nuevo)
                cuenta['archivos'] += 1
        print(f"{curso}: {cuenta['archivos']} archivos · {cuenta['pares']} textos es+en · {cuenta['estropeadas']} con letras perdidas"
              f" · {cuenta['distintas']} diferencias raras")
        for e in cuenta['ejemplos']:
            print('     ', e)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
