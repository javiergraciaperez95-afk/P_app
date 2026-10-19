"""Comprueba que el SQL de Supabase está aplicado, sin guardar nada (19-10-2026).

    py -3 _herramientas/comprobar_supabase.py

Llama a cada función con datos que no escriben: un número que no existe, un error vacío, una idea con un enlace (se
rechaza antes de guardarse). Lee la dirección y la clave pública de js/config.js.
"""
import json
import re
import secrets
import sys
import urllib.error
import urllib.request
from pathlib import Path

config = (Path(__file__).resolve().parent.parent / 'js' / 'config.js').read_text(encoding='utf-8')
URL = re.search(r"SUPABASE_URL = '([^']+)'", config).group(1)
CLAVE = re.search(r"SUPABASE_CLAVE_PUBLICA = '([^']+)'", config).group(1)


def rpc(funcion, datos):
    peticion = urllib.request.Request(f'{URL}/rest/v1/rpc/{funcion}', data=json.dumps(datos).encode(), method='POST',
                                      headers={'apikey': CLAVE, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(peticion, timeout=15) as r:
            texto = r.read().decode()
            return r.status, json.loads(texto) if texto else None
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or 'null')


numero = '9' + ''.join(secrets.choice('0123456789') for _ in range(15))  # casi seguro que no existe
quien = '0' * 32
PRUEBAS = [
    ('Cuentas: leer un número que no existe', 'paglot_leer', {'p_numero': numero}, lambda s, r: s == 200 and r is None),
    ('Cuentas: existe → no', 'paglot_existe', {'p_numero': numero}, lambda s, r: s == 200 and r is False),
    ('Cuentas: correo (tapado) de un número que no existe', 'paglot_correo', {'p_numero': numero}, lambda s, r: s == 200 and r is None),
    ('Errores: la función está (un error vacío no se guarda)', 'paglot_error', {'p': {'mensaje': ''}}, lambda s, r: s in (200, 204)),
    ('Laboratorio: ver las ideas', 'paglot_ideas_ver', {'p_quien': quien}, lambda s, r: s == 200 and isinstance(r, list)),
    ('Laboratorio: una idea con enlace se rechaza', 'paglot_idea_nueva', {'p_quien': quien, 'p_texto': 'mira www.ejemplo.com', 'p_autora': ''},
     lambda s, r: s >= 400 and 'enlace' in json.dumps(r)),
]

sys.stdout.reconfigure(encoding='utf-8')
fallos = 0
for nombre, funcion, datos, bien in PRUEBAS:
    estado, respuesta = rpc(funcion, datos)
    ok = bien(estado, respuesta)
    fallos += not ok
    print(f"{'OK   ' if ok else 'FALLA'} {nombre}" + ('' if ok else f'  ({estado}: {json.dumps(respuesta, ensure_ascii=False)[:160]})'))
print('Todo bien: el SQL está aplicado.' if not fallos else f'{fallos} prueba(s) fallan.')
sys.exit(1 if fallos else 0)
