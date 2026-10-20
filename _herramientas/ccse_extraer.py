"""Saca las preguntas y la clave del Manual CCSE 2026 (texto de pdftotext sin -layout).

Uso (con el PDF del manual pasado a texto con «pdftotext manual.pdf manual.txt»):
    python -I _herramientas/ccse_extraer.py manual.txt _herramientas/contenido/ccse_bruto.json
"""
import json
import re
import sys
from pathlib import Path

texto = Path(sys.argv[1]).read_text(encoding='utf-8')
lineas = texto.splitlines()

fin = next(i for i, l in enumerate(lineas) if l.strip() == 'SOLUCIONES')
# solo los tramos de preguntas: de cada «PREGUNTAS» al principio de la tarea siguiente (su teoría) o a la clave
tramos = []
dentro = False
for l in lineas[:fin]:
    s = l.strip()
    if s == 'PREGUNTAS':
        dentro = True
    elif re.match(r'^\d TAREA$', s):
        dentro = False
    elif dentro:
        tramos.append(l)

RUIDO = re.compile(
    r'^(Instituto Cervantes|Manual de preparación de la prueba CCSE|\d{1,3}|PREGUNTAS|Tarea \d|'
    r'Gobierno, legislación y participación ciudadana|Derechos y deberes fundamentales|'
    r'Organización territorial de España\.?|Geografía física y política|Cultura e historia de España|Sociedad española)$')
IDS = re.compile(r'^([1-5][01]\d\d)(\s+[1-5][01]\d\d)*(\s+\d{1,3})?$')

def completa(b):
    if not re.search(r'(^|\s)a\.\s', b) or not re.search(r'\sb\.\s', b):
        return False
    if re.search(r'\sb\.\s*Falso\.?$', b):
        return True
    m = re.search(r'\sc\.\s(.+)$', b)
    return bool(m) and re.search(r'[.?)»]$', b.strip()) is not None

cola = []
preguntas = []
buffer = ''
anterior = ''
for l in tramos:
    s = l.strip().replace(' ', ' ')
    if not s:
        continue
    cabecera = s == '2026' and anterior == 'Manual de preparación de la prueba CCSE'
    anterior = s
    if RUIDO.match(s) or cabecera:
        continue
    if IDS.match(s):
        cola.extend(x for x in s.split() if len(x) == 4)
        continue
    if buffer and completa(buffer):
        preguntas.append(buffer)
        buffer = ''
    buffer = f'{buffer} {s}'.strip() if buffer else s
if buffer:
    preguntas.append(buffer)

ids = list(cola)
print('ids', len(ids), 'preguntas', len(preguntas))

def partir(b):
    m = re.match(r'^(.*?)\s+a\.\s+(.*?)\s+b\.\s+(.*?)(?:\s+c\.\s+(.*))?$', b)
    if not m:
        raise ValueError(b)
    enunciado, a, bb, c = m.groups()
    ops = [a, bb] + ([c] if c else [])
    return enunciado.strip(), [o.strip() for o in ops]

# la clave
sol = ' '.join(lineas[fin + 1:])
clave = dict(re.findall(r'\b([1-5][01]\d\d)\s+([abc])\b', sol))
print('clave', len(clave))

salida = []
for id_, b in zip(ids, preguntas):
    enunciado, ops = partir(b)
    salida.append({'id': id_, 'tarea': int(id_[0]), 'pregunta': enunciado, 'opciones': ops, 'correcta': 'abc'.index(clave[id_])})
problemas = [s for s in salida if len(s['opciones']) not in (2, 3) or re.search(r'\s[abc]\.\s', ' '.join(s['opciones']))]
print('problemas', len(problemas))
for p in problemas:
    print(p)
faltan = sorted(set(clave) - {s['id'] for s in salida})
print('sin pregunta', faltan)
Path(sys.argv[2]).write_text(json.dumps(sorted(salida, key=lambda s: s['id']), ensure_ascii=False, indent=1), encoding='utf-8')
