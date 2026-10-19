"""Genera cursos/es/phrases/frases.json (la pantalla «Frases») a partir de los diálogos de las lecciones v2.

    python _herramientas/generar_frases_es.py

Una categoría por capítulo y, dentro, un grupo por lección con las frases de su diálogo: el español y sus traducciones
(inglés y vietnamita) salen de los catálogos cursos/es/traducciones/<idioma>/NNN.json («bX.fN.texto»).
"""
import json
from pathlib import Path

CURSO = Path(__file__).resolve().parent.parent / 'cursos' / 'es'
leer = lambda p: json.loads(p.read_text(encoding='utf-8'))

capitulos = leer(CURSO / 'lessons' / 'capitulos.json')
catalogo = {}
def textos(idioma, id_):
    clave = (idioma, id_)
    if clave not in catalogo:
        ruta = CURSO / 'traducciones' / idioma / f'{id_}.json'
        catalogo[clave] = leer(ruta) if ruta.exists() else {}
    return catalogo[clave]

lecciones = []
for f in sorted((CURSO / 'lessons').glob('[0-9][0-9][0-9].json')):
    l = leer(f)
    lecciones.append((l.get('orden_curso', 0), f.stem, l))
lecciones.sort()

grupos_por_capitulo = {}
total = 0
for _, id_, l in lecciones:
    es, en, vi = textos('es', id_), textos('en', id_), textos('vi', id_)
    frases = []
    for b in l.get('bloques', []):
        if b.get('tipo') != 'dialogo' or b.get('esTexto'):
            continue
        for n, linea in enumerate(b.get('frases', [])):
            clave = f"{b['id']}.f{n}.texto"
            texto = es.get(clave)
            if not texto:
                continue
            frase = {'es': texto}
            if en.get(clave):
                frase['en'] = en[clave]
            if vi.get(clave):
                frase['vi'] = vi[clave]
            if linea.get('quien'):
                frase['quien'] = linea['quien']
            frases.append(frase)
    if not frases:
        continue
    titulo = {k: v for k, v in (('en', en.get('titulo')), ('vi', vi.get('titulo'))) if v}
    grupos_por_capitulo.setdefault(l.get('capitulo'), []).append({
        'titulo': titulo or es.get('titulo', id_),
        'tarea': es.get('titulo', ''),
        'leccion': id_,
        'frases': frases,
    })
    total += len(frases)

categorias = []
for c in capitulos:
    grupos = grupos_por_capitulo.get(c['numero'])
    if grupos:
        categorias.append({'titulo': c.get('titulo') or c.get('titulo_es'), 'descripcion': c.get('descripcion', ''), 'grupos': grupos})

salida = CURSO / 'phrases' / 'frases.json'
salida.parent.mkdir(exist_ok=True)
salida.write_text(json.dumps({'categorias': categorias}, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'{salida}: {len(categorias)} capítulos, {sum(len(c["grupos"]) for c in categorias)} lecciones, {total} frases')
