"""Junta los niveles del DELE y los exámenes de práctica (contenido/dele/*.json) en datos/dele.json.

Uso: python -I _herramientas/dele_montar.py
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# La estructura de cada examen, según las guías del Instituto Cervantes (DELE A1 y A2 de 2020, B1 de 2020, B2 de 2019).
P = lambda id_, minutos, tareas, items=None, prep=None: {k: v for k, v in
    {'id': id_, 'minutos': minutos, 'tareas': tareas, 'items': items, 'preparacion': prep}.items() if v is not None}
NIVELES = [
    {'id': 'A1', 'capitulos': [1, 6],
     'es': 'Comprender y usar expresiones muy frecuentes: presentarse, pedir y dar información personal básica, comprar.',
     'vi': 'Hiểu và dùng những câu rất thông dụng: tự giới thiệu, hỏi và cung cấp thông tin cá nhân cơ bản, mua sắm.',
     'pruebas': [P('lectura', 45, 4, 25), P('auditiva', 25, 4, 25), P('escrita', 25, 2), P('oral', 15, 4, prep=15)]},
    {'id': 'A2', 'capitulos': [7, 10], 'objetivo': True,
     'es': 'Comunicarse en situaciones cotidianas: familia, compras, trabajo, el barrio; contar en pasado de forma sencilla. Es el nivel mínimo para la nacionalidad española.',
     'vi': 'Giao tiếp trong các tình huống hằng ngày: gia đình, mua sắm, công việc, khu phố; kể chuyện quá khứ đơn giản. Đây là trình độ tối thiểu để xin quốc tịch Tây Ban Nha.',
     'pruebas': [P('lectura', 60, 4, 25), P('auditiva', 40, 4, 25), P('escrita', 45, 2), P('oral', 12, 3, prep=12)]},
    {'id': 'B1', 'capitulos': [11, 18],
     'es': 'Entender lo principal de textos sobre temas conocidos, desenvolverse en viajes y dar opiniones y planes.',
     'vi': 'Hiểu ý chính của các văn bản về chủ đề quen thuộc, xoay xở khi đi lại, nêu ý kiến và kế hoạch.',
     'pruebas': [P('lectura', 70, 5, 30), P('auditiva', 40, 5, 30), P('escrita', 60, 2), P('oral', 15, 4, prep=15)]},
    {'id': 'B2', 'capitulos': [19, 26],
     'es': 'Entender textos complejos y conversar con fluidez y naturalidad sobre temas variados.',
     'vi': 'Hiểu các văn bản phức tạp và trò chuyện trôi chảy, tự nhiên về nhiều chủ đề.',
     'pruebas': [P('lectura', 70, 4, 36), P('auditiva', 40, 5, 30), P('escrita', 80, 2), P('oral', 20, 3, prep=20)]},
]

examenes = [json.loads(f.read_text(encoding='utf-8')) for f in sorted((RAIZ / '_herramientas/contenido/dele').glob('*.json'))]

# comprobaciones: 25 ítems en lectura y en auditiva, como en el examen de verdad
for ex in examenes:
    for prueba in ('lectura', 'auditiva'):
        n = sum(len(t['items']) for t in ex['pruebas'][prueba]['tareas'])
        assert n == 25, f"{ex['id']} {prueba}: {n} ítems"
        for t in ex['pruebas'][prueba]['tareas']:
            for it in t['items']:
                if 'o' in it:
                    assert 0 <= it['c'] < len(it['o']), (ex['id'], prueba, t['id'], it['p'])
                elif t['tipo'] == 'relacionar':
                    assert it['c'] in [x['letra'] for x in t['textos']]
                elif t['tipo'] == 'personas':
                    assert it['c'] in t['personas']
                elif t['tipo'] == 'mensajes':
                    assert it['c'] in t['enunciados']
    usadas = [it['c'] for t in ex['pruebas']['auditiva']['tareas'] if t['tipo'] == 'mensajes' for it in t['items']]
    assert len(set(usadas)) == len(usadas), f"{ex['id']}: enunciados repetidos {usadas}"

salida = {'version': 1, 'niveles': NIVELES, 'examenes': examenes}
destino = RAIZ / 'datos/dele.json'
destino.write_text(json.dumps(salida, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('datos/dele.json:', len(examenes), 'exámenes,', destino.stat().st_size, 'bytes')
