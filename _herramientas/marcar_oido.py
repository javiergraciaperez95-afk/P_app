"""Marca en el índice de cada curso los ejercicios que solo son de oído (19-10-2026).

Sin voz en el dispositivo, todo lo que hay que escuchar desaparece: para el alumno es como si no existiera
(decisión del 19-10). Un ejercicio con «audio» (un texto que se escucha) es de oído, igual que en js/lessons.js
(marcarId). El índice (indice/lecciones.json) apunta cada ejercicio como ["id"] o, si es de oído, ["id", 1]: así el
mapa no cuenta como pendientes los que no se pueden hacer sin voz.

Los ejercicios del índice van en el mismo orden que los bloques de ejercicio de la lección; si una lección no
cuadra, se avisa y no se toca.

    python _herramientas/marcar_oido.py [cursos…]      (sin cursos: todos menos zh y th, que lleva otro agente)
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TIPOS_EJERCICIO = ('test', 'traduccion', 'huecos', 'escribir', 'ordenar')
leer = lambda p: json.loads(Path(p).read_text(encoding='utf-8-sig'))
escribir = lambda p, d: Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')


def de_oido(bloque):
    audio = bloque.get('audio')
    return isinstance(audio, str) and audio.strip() != ''


def main():
    cursos = sys.argv[1:] or sorted(p.name for p in (RAIZ / 'cursos').iterdir()
                                    if p.is_dir() and p.name not in ('zh', 'th') and not p.name.startswith('_'))
    for curso in cursos:
        base = RAIZ / 'cursos' / curso
        findice = base / 'indice' / 'lecciones.json'
        indice = leer(findice)
        marcadas = descuadradas = 0
        for e in indice['lecciones']:
            f = base / 'lessons' / f"{e['id']}.json"
            if not f.exists() or 'ejerciciosPorIdioma' in e:
                continue
            d = leer(f)
            if d.get('esquema') == 2:
                continue
            bloques = [b for b in d.get('bloques', []) if isinstance(b, dict) and b.get('tipo') in TIPOS_EJERCICIO]
            lista = e.get('ejercicios', [])
            if len(bloques) != len(lista) or any(b.get('id') and x[0] != f"id|{b['id']}" for b, x in zip(bloques, lista)):
                descuadradas += 1
                continue
            nueva = [[x[0], 1] if de_oido(b) else [x[0]] for b, x in zip(bloques, lista)]
            marcadas += sum(len(x) == 2 for x in nueva)
            e['ejercicios'] = nueva
        escribir(findice, indice)
        print(f'{curso}: {marcadas} ejercicios de oído' + (f' · {descuadradas} lecciones sin cuadrar (no se tocan)' if descuadradas else ''))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
