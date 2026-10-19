"""Prueba las funciones de Supabase de las cuentas con número (Para_lodriga/paglot-cuentas.sql) sin abrir la app.

    python _herramientas/probar_nube.py

Crea una cuenta de prueba con un número al azar, guarda progreso con el formato de varios cursos, lo lee, comprueba
que existe, que no tiene correo, que las funciones de correo exigen sesión, y la borra al final.
"""
import json
import random
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

CONFIG = (Path(__file__).resolve().parent.parent / 'js' / 'config.js').read_text(encoding='utf-8')
URL = re.search(r"SUPABASE_URL = '([^']+)'", CONFIG).group(1)
CLAVE = re.search(r"SUPABASE_CLAVE_PUBLICA = '([^']+)'", CONFIG).group(1)


def rpc(funcion, datos=None):
    peticion = urllib.request.Request(f'{URL}/rest/v1/rpc/{funcion}', data=json.dumps(datos or {}).encode(),
                                      headers={'apikey': CLAVE, 'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(peticion, timeout=15) as r:
            texto = r.read().decode()
            return r.status, (json.loads(texto) if texto else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]


fallos = 0
def comprobar(nombre, condicion, detalle=''):
    global fallos
    print(('✓ ' if condicion else '✗ ') + nombre + (f'  ({detalle})' if detalle and not condicion else ''))
    fallos += 0 if condicion else 1


numero = str(random.randint(1, 9)) + ''.join(random.choice('0123456789') for _ in range(15))
copia = {'version': 3, 'cursos': {'es': {'version': 2, 'prueba': True}, 'fr': {'version': 2, 'prueba': 'fr'}}}

estado, r = rpc('paglot_existe', {'p_numero': numero})
comprobar('paglot_existe responde (cuenta nueva no existe)', estado == 200 and r is False, f'{estado} {r}')
estado, r = rpc('paglot_guardar', {'p_numero': numero, 'p_datos': copia})
comprobar('paglot_guardar crea la cuenta', estado == 200 and r is True, f'{estado} {r}')
estado, r = rpc('paglot_leer', {'p_numero': numero})
comprobar('paglot_leer devuelve lo guardado (dos cursos)', estado == 200 and r == copia, f'{estado} {r}')
estado, r = rpc('paglot_existe', {'p_numero': numero})
comprobar('paglot_existe ya la encuentra', estado == 200 and r is True, f'{estado} {r}')
estado, r = rpc('paglot_correo', {'p_numero': numero})
comprobar('paglot_correo: sin correo unido', estado == 200 and r is None, f'{estado} {r}')
estado, r = rpc('paglot_guardar', {'p_numero': '123', 'p_datos': {}})
comprobar('paglot_guardar rechaza un número mal formado', estado != 200, f'{estado} {r}')
estado, r = rpc('paglot_vincular', {'p_numero': numero})
comprobar('paglot_vincular exige haber verificado el correo', estado != 200, f'{estado} {r}')
estado, r = rpc('paglot_limpiar')
comprobar('paglot_limpiar no se puede llamar desde fuera', estado != 200, f'{estado} {r}')
estado, r = rpc('paglot_borrar', {'p_numero': numero})
comprobar('paglot_borrar la borra', estado == 200 and r is True, f'{estado} {r}')
estado, r = rpc('paglot_existe', {'p_numero': numero})
comprobar('ya no existe tras borrarla', estado == 200 and r is False, f'{estado} {r}')

# la tabla no se puede leer directamente con la clave pública
peticion = urllib.request.Request(f'{URL}/rest/v1/paglot_cuentas?select=*', headers={'apikey': CLAVE})
try:
    with urllib.request.urlopen(peticion, timeout=15) as r:
        cuerpo = r.read().decode()
        comprobar('la tabla no se puede leer directamente', cuerpo.strip() in ('[]', ''), cuerpo[:120])
except urllib.error.HTTPError as e:
    comprobar('la tabla no se puede leer directamente', True)

print('\nTodo bien.' if not fallos else f'\n{fallos} fallos.')
sys.exit(1 if fallos else 0)
