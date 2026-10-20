"""Junta las preguntas del Manual CCSE 2026 (contenido/ccse_bruto.json) con su traducción al vietnamita (contenido/ccse_vi/)
en datos/ccse.json, que es lo que lee la app.

Uso: python -I _herramientas/ccse_montar.py
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CONTENIDO = RAIZ / '_herramientas/contenido'
bruto = json.loads((CONTENIDO / 'ccse_bruto.json').read_text(encoding='utf-8'))
vi = {}
for f in sorted((CONTENIDO / 'ccse_vi').glob('vi_*.json')):
    vi.update(json.loads(f.read_text(encoding='utf-8')))

# la tarea 3 empieza en el PDF con su teoría pegada a la primera pregunta (y otra lleva el título de la página)
ARREGLOS = {
    '3001': '¿Dónde están Cáceres y Badajoz?',
    '3009': 'La capital de la comunidad autónoma de Galicia es…',
}
ERRATAS = [('municiales', 'municipales'), ('Consejo Superior de investigaciones', 'Consejo Superior de Investigaciones'),
           ('La sociedad General', 'La Sociedad General'), ('el Quijote', 'el *Quijote*')]


def limpiar(texto):
    texto = re.sub(r'\s+', ' ', texto).strip()
    texto = re.sub(r'\.{3,}|…\.?', '…', texto)
    texto = texto.replace('’', "'")
    for mal, bien in ERRATAS:
        texto = texto.replace(mal, bien)
    return texto.replace('*', '')


TAREAS = [
    {'n': 1, 'es': 'Gobierno, legislación y participación ciudadana', 'vi': 'Chính phủ, pháp luật và sự tham gia của công dân', 'examen': 10},
    {'n': 2, 'es': 'Derechos y deberes fundamentales', 'vi': 'Quyền và nghĩa vụ cơ bản', 'examen': 3},
    {'n': 3, 'es': 'Organización territorial de España. Geografía física y política', 'vi': 'Tổ chức lãnh thổ. Địa lý tự nhiên và chính trị', 'examen': 2},
    {'n': 4, 'es': 'Cultura e historia de España', 'vi': 'Văn hóa và lịch sử Tây Ban Nha', 'examen': 3},
    {'n': 5, 'es': 'Sociedad española', 'vi': 'Xã hội Tây Ban Nha', 'examen': 7},
]

preguntas = []
for q in bruto:
    id_ = q['id']
    t = vi.get(id_)
    if not t:
        raise SystemExit(f'Falta la traducción de {id_}')
    enunciado = limpiar(ARREGLOS.get(id_, q['pregunta']))
    opciones = [limpiar(o) for o in q['opciones']]
    if q['tarea'] == 2:
        opciones = ['Verdadero.', 'Falso.']
        ov = ['Đúng.', 'Sai.']
    else:
        opciones = [o if re.search(r'[.?!)»]$', o) else o + '.' for o in opciones]
        ov = t['o']
    if len(ov) != len(opciones):
        raise SystemExit(f'{id_}: {len(opciones)} opciones y {len(ov)} traducidas')
    if len(enunciado) > 200:
        raise SystemExit(f'{id_}: enunciado sospechoso: {enunciado[:120]}…')
    preguntas.append({'id': id_, 't': q['tarea'], 'p': enunciado, 'o': opciones, 'c': q['correcta'],
                      'pv': t['p'], 'ov': ov, 'x': t['x']})

sobran = sorted(set(vi) - {q['id'] for q in bruto})
if sobran:
    raise SystemExit(f'Traducciones sin pregunta: {sobran}')
cuantas = {n: sum(1 for q in preguntas if q['t'] == n) for n in range(1, 6)}
assert cuantas == {1: 120, 2: 36, 3: 24, 4: 36, 5: 84}, cuantas

salida = {
    'version': 1,
    'fuente': 'Manual de preparación de la prueba CCSE 2026 · Instituto Cervantes',
    'examen': {'preguntas': 25, 'minutos': 45, 'aprobado': 15},
    'tareas': TAREAS,
    'preguntas': preguntas,
}
destino = RAIZ / 'datos/ccse.json'
destino.parent.mkdir(exist_ok=True)
destino.write_text(json.dumps(salida, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('datos/ccse.json:', len(preguntas), 'preguntas,', destino.stat().st_size, 'bytes')
