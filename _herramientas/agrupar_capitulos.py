"""Junta los capítulos pequeños de los cursos beta y les pone nivel (19-10-2026).

Muchos cursos traían capítulos de 2 o 3 lecciones (98 en el de francés): el mapa era larguísimo y los cofres no
significaban nada. Aquí se juntan capítulos seguidos hasta tener entre 8 y 12 lecciones, y cada capítulo lleva su nivel
(A1, A2, B1, B2) según el punto del curso en que está, con los mismos cortes que el curso de español (que llega a B2 en
unas 300 lecciones): así un curso a medio hacer no dice B2 antes de tiempo.

El capítulo nuevo se llama como el primero de los que junta y su descripción enumera todos (si los títulos eran
«Capítulo N», se numeran de nuevo y se juntan las descripciones). Se cambian lessons/capitulos.json, el «capitulo» de
cada lección y el índice (indice/lecciones.json). El de español no se toca.

    python _herramientas/agrupar_capitulos.py [cursos…]      (sin cursos: todos menos es)
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MINIMO, BUENO, MAXIMO = 6, 8, 12
leer = lambda p: json.loads(Path(p).read_text(encoding='utf-8-sig'))
escribir = lambda p, d: Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')


def cortes_del_espanol():
    """Dónde empieza cada nivel en el curso de español, en fracción de 300 lecciones."""
    caps = {str(c['numero']): c.get('nivel') for c in leer(RAIZ / 'cursos/es/lessons/capitulos.json')}
    lecciones = leer(RAIZ / 'cursos/es/indice/lecciones.json')['lecciones']
    cortes = {}
    for i, e in enumerate(lecciones):
        nivel = caps.get(str(e.get('capitulo')))
        if nivel and nivel not in cortes:
            cortes[nivel] = i * 300 / len(lecciones)
    return sorted(cortes.items(), key=lambda x: x[1])


def nivel_en(posicion, cortes):
    nivel = cortes[0][0]
    for n, desde in cortes:
        if posicion >= desde:
            nivel = n
    return nivel


def texto(v, idioma):
    if isinstance(v, dict):
        return v.get(f'@{idioma}') or v.get(idioma) or next(iter(v.values()), '')
    return v or ''


def generico(v):
    return bool(re.fullmatch(r'(Capítulo|Chapter|Chương)\s*\d+', texto(v, 'es').strip()))


def juntar(valores, sep=' · '):
    """Une textos que pueden ser {"@es", "@en"}."""
    if any(isinstance(v, dict) for v in valores):
        return {'@es': sep.join(texto(v, 'es') for v in valores if texto(v, 'es')),
                '@en': sep.join(texto(v, 'en') for v in valores if texto(v, 'en'))}
    return sep.join(v for v in valores if v)


def agrupar(curso, cortes):
    base = RAIZ / 'cursos' / curso
    fcap = base / 'lessons' / 'capitulos.json'
    datos = leer(fcap)
    capitulos = datos if isinstance(datos, list) else datos['capitulos']
    findice = base / 'indice' / 'lecciones.json'
    indice = leer(findice)
    cuantas = {}
    for e in indice['lecciones']:
        cuantas[str(e.get('capitulo'))] = cuantas.get(str(e.get('capitulo')), 0) + 1

    # grupos de capítulos seguidos
    grupos, actual, n = [], [], 0
    for c in capitulos:
        k = cuantas.get(str(c['numero']), 0)
        if actual and (n >= BUENO or (n >= MINIMO and n + k > MAXIMO)):
            grupos.append(actual)
            actual, n = [], 0
        actual.append(c)
        n += k
    if actual:
        if grupos and n < MINIMO:
            grupos[-1].extend(actual)
        else:
            grupos.append(actual)

    # el capítulo nuevo de cada antiguo, y el punto del curso donde empieza cada grupo (para el nivel)
    nuevo_de = {}
    for i, g in enumerate(grupos, 1):
        for c in g:
            nuevo_de[str(c['numero'])] = i
    # (en el orden del mapa, que va por capítulos: en algunos cursos las lecciones no van numeradas en ese orden)
    primera, llevadas = {}, 0
    for i, g in enumerate(grupos, 1):
        primera[i] = llevadas
        llevadas += sum(cuantas.get(str(c['numero']), 0) for c in g)

    campo = next((k for k in capitulos[0] if k.startswith('titulo_') and k != 'titulo_es'), None)
    nuevos = []
    for i, g in enumerate(grupos, 1):
        c0 = g[0]
        cap = {k: v for k, v in c0.items() if k not in ('numero', 'nivel', 'descripcion')}
        cap['numero'] = i
        if generico(c0.get('titulo_es')):
            cap['titulo_es'] = {'@es': f'Capítulo {i}', '@en': f'Chapter {i}'} if isinstance(c0.get('titulo_es'), dict) else f'Capítulo {i}'
            if campo and re.search(r'\d+', str(c0.get(campo, ''))):
                cap[campo] = re.sub(r'\d+', str(i), str(c0[campo]), count=1)
            cap['descripcion'] = juntar([c.get('descripcion') for c in g], ' ')
        else:
            cap['descripcion'] = juntar([c.get('titulo_es') for c in g]) if len(g) > 1 else c0.get('descripcion', '')
        cap['nivel'] = nivel_en(primera.get(i, 0), cortes)
        nuevos.append(cap)

    # las lecciones y el índice
    for e in indice['lecciones']:
        e['capitulo'] = nuevo_de.get(str(e.get('capitulo')), e.get('capitulo'))
    cambiadas = 0
    for f in sorted((base / 'lessons').glob('[0-9][0-9][0-9].json')):
        d = leer(f)
        viejo = str(d.get('capitulo'))
        if viejo in nuevo_de and d['capitulo'] != nuevo_de[viejo]:
            d['capitulo'] = nuevo_de[viejo]
            escribir(f, d)
            cambiadas += 1
    escribir(fcap, nuevos if isinstance(datos, list) else {**datos, 'capitulos': nuevos})
    escribir(findice, indice)
    tam = [sum(cuantas.get(str(c['numero']), 0) for c in g) for g in grupos]
    niveles = {}
    for c in nuevos:
        niveles[c['nivel']] = niveles.get(c['nivel'], 0) + 1
    print(f'{curso}: {len(capitulos)} → {len(grupos)} capítulos (de {min(tam)} a {max(tam)} lecciones) · {niveles} · {cambiadas} lecciones cambiadas')


def main():
    cursos = sys.argv[1:] or sorted(p.name for p in (RAIZ / 'cursos').iterdir() if p.is_dir() and p.name not in ('es', 'th') and not p.name.startswith('_'))
    cortes = cortes_del_espanol()
    print('cortes del español (sobre 300 lecciones):', [(n, round(x)) for n, x in cortes])
    for c in cursos:
        agrupar(c, cortes)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
