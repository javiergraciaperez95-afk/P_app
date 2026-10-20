"""Códigos de regalo de Paglot Max en PDF, con un QR a paglot.eu.

    py _herramientas/pdf/regalos.py                    → la muestra (muestras/regalo-muestra.pdf)
    py _herramientas/pdf/regalos.py max-ano 10 es      → 10 regalos de un año, con su PDF cada uno
    py _herramientas/pdf/regalos.py max-mes 1 en       → 1 regalo de un mes, en inglés

Cada código es único y de un solo uso: PGM-XXXX-XXXX-XXXX (12 letras y cifras sin las que se confunden: 60 bits al azar,
imposibles de adivinar). Los PDF y la lista de códigos van a _regalos/<lote>/, que NO se sube a GitHub. Para el servidor
salen también codigos.sql (MySQL) y codigos-supabase.sql, que guardan solo la huella SHA-256 de cada código (nunca el código): al canjearlo, el servidor
comprueba la huella y lo marca como usado, así no se puede usar dos veces (ver api/ y PAYWALLS.txt).
"""
import datetime
import hashlib
import html
import json
import os
import secrets
import subprocess
import sys

import segno

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(RAIZ, '_herramientas', 'pdf', 'salida')
ALFABETO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'  # Crockford: sin I, L, O ni U
e = html.escape

TXT = {
    'es': {
        'etiqueta': 'Un regalo para ti', 'titulo': 'Paglot Max', 'max-ano': '1 año de Paglot Max', 'max-mes': '1 mes de Paglot Max',
        'para': 'Para', 'de': 'De', 'mensaje': 'Mensaje',
        'incluye': 'Todos los idiomas y lecciones sin límite, todos los simulacros de examen en PDF, el certificado de nivel y, con el año, los seis libros del idioma.',
        'como': 'Cómo canjearlo', 'paso1': 'Entra en paglot.eu (o escanea el código QR).', 'paso2': 'Abre tu Perfil y toca «Canjear un regalo».',
        'paso3': 'Escribe el código. El plan empieza ese día, no antes: puedes guardarlo para cuando quieras.',
        'codigo': 'Tu código', 'una': 'Solo se puede usar una vez. Guárdalo como si fuera dinero.', 'pie': 'Paglot · paglot.eu',
        'muestra': 'MUESTRA', 'disfruta': '¡Que lo disfrutes! Tus tutoras ya te están esperando.',
    },
    'en': {
        'etiqueta': 'A gift for you', 'titulo': 'Paglot Max', 'max-ano': '1 year of Paglot Max', 'max-mes': '1 month of Paglot Max',
        'para': 'To', 'de': 'From', 'mensaje': 'Message',
        'incluye': 'Every language and unlimited lessons, all the mock exams as PDFs, the level certificate and, with the year, the language’s six books.',
        'como': 'How to redeem it', 'paso1': 'Go to paglot.eu (or scan the QR code).', 'paso2': 'Open your Profile and tap “Redeem a gift”.',
        'paso3': 'Type the code. The plan starts that day, not before: you can keep it for whenever you like.',
        'codigo': 'Your code', 'una': 'It can only be used once. Keep it as if it were money.', 'pie': 'Paglot · paglot.eu',
        'muestra': 'SAMPLE', 'disfruta': 'Enjoy it! Your tutors are already waiting for you.',
    },
}


def nuevo_codigo():
    letras = ''.join(secrets.choice(ALFABETO) for _ in range(12))
    return f'PGM-{letras[:4]}-{letras[4:8]}-{letras[8:]}'


def huella(codigo):
    return hashlib.sha256(codigo.replace('-', '').upper().encode()).hexdigest()


def pagina(codigo, tipo, lengua, muestra):
    T = TXT[lengua]
    qr = segno.make('https://paglot.eu', error='m').svg_inline(scale=4, dark='#2b2136', light=None, border=0)
    agua = f'<div class="marca-agua">{T["muestra"]}</div>' if muestra else ''
    return f'''<!doctype html><html lang="{lengua}"><head><meta charset="utf-8"><title>Paglot · {e(T[tipo])}</title>
<link rel="stylesheet" href="../paglot-pdf.css"><link rel="stylesheet" href="../regalo.css"></head><body>
<section class="hoja">
  {agua}
  <header class="membrete"><span class="marca"><img src="/assets/favicon.svg" alt=""><span>Pa<i>glot</i></span></span><small>paglot.eu</small></header>
  <div class="lazo" aria-hidden="true"><i></i><i></i><b></b></div>
  <span class="etiqueta">{e(T["etiqueta"])}</span>
  <h1 class="titulo-regalo">{e(T[tipo])}</h1>
  <p class="incluye">{e(T["incluye"])}</p>
  <div class="dedicatoria caja">
    <p><b>{e(T["para"])}:</b><i></i></p><p><b>{e(T["de"])}:</b><i></i></p>
    <p class="mensaje"><b>{e(T["mensaje"])}:</b><i></i></p><p class="mensaje"><i></i></p>
  </div>
  <div class="canje">
    <div class="codigo-caja"><small>{e(T["codigo"])}</small><strong>{e(codigo)}</strong><small>{e(T["una"])}</small></div>
    <div class="qr-regalo">{qr}<small>paglot.eu</small></div>
  </div>
  <h3>{e(T["como"])}</h3>
  <ol class="pasos"><li>{e(T["paso1"])}</li><li>{e(T["paso2"])}</li><li>{e(T["paso3"])}</li></ol>
  <div class="regalo-dibujo" aria-hidden="true"><span class="tapa"></span><span class="caja-r"></span><span class="cinta-v"></span><span class="cinta-h"></span><span class="nudo"></span></div>
  <p class="disfruta">{e(T["disfruta"])}</p>
  <footer class="pie-hoja"><span>{e(T["pie"])}</span><span>{e(T[tipo])}</span></footer>
</section></body></html>'''


def generar(tipo, cuantos, lengua):
    lote = datetime.datetime.now().strftime('%Y%m%d-%H%M%S') + f'-{tipo}'
    carpeta = os.path.join(RAIZ, '_regalos', lote)
    os.makedirs(carpeta, exist_ok=True)
    os.makedirs(SALIDA, exist_ok=True)
    lista, filas = [], []
    for _ in range(cuantos):
        codigo = nuevo_codigo()
        nombre = f'regalo-{codigo}.html'
        open(os.path.join(SALIDA, nombre), 'w', encoding='utf-8').write(pagina(codigo, tipo, lengua, False))
        lista.append({'html': f'_herramientas/pdf/salida/{nombre}', 'pdf': f'_regalos/{lote}/{codigo}.pdf'})
        filas.append((codigo, huella(codigo)))
    # el SQL para el servidor: solo las huellas (el código en claro no se guarda nunca en la base de datos)
    sql = ''.join(f"INSERT INTO regalos (huella, tipo, lote) VALUES ('{h}', '{tipo}', '{lote}');\n" for _, h in filas)
    open(os.path.join(carpeta, 'codigos.sql'), 'w', encoding='utf-8').write(sql)
    # lo mismo para Supabase (en local los regalos se canjean allí: paglot_canjear)
    sql_supabase = ''.join(f"insert into paglot_regalos (huella, tipo, lote) values ('{h}', '{tipo}', '{lote}') on conflict do nothing;\n" for _, h in filas)
    open(os.path.join(carpeta, 'codigos-supabase.sql'), 'w', encoding='utf-8').write(sql_supabase)
    open(os.path.join(carpeta, 'codigos.txt'), 'w', encoding='utf-8').write(''.join(f'{c}\n' for c, _ in filas))
    ruta = os.path.join(SALIDA, 'lista-regalos.json')
    json.dump(lista, open(ruta, 'w', encoding='utf-8'))
    subprocess.run(['node', os.path.join('_herramientas', 'pdf', 'imprimir.mjs'), ruta], cwd=RAIZ)
    print(f'{cuantos} regalos en _regalos/{lote}/ (sube codigos.sql al servidor)')


if __name__ == '__main__':
    if len(sys.argv) >= 3:
        generar(sys.argv[1], int(sys.argv[2]), sys.argv[3] if len(sys.argv) > 3 else 'es')
    else:
        open(os.path.join(SALIDA, 'regalo-muestra.html'), 'w', encoding='utf-8').write(pagina('PGM-MUES-TRA0-0000', 'max-ano', 'es', True))
        ruta = os.path.join(SALIDA, 'lista-regalos.json')
        json.dump([{'html': '_herramientas/pdf/salida/regalo-muestra.html', 'pdf': 'muestras/regalo-muestra.pdf'}], open(ruta, 'w', encoding='utf-8'))
        subprocess.run(['node', os.path.join('_herramientas', 'pdf', 'imprimir.mjs'), ruta], cwd=RAIZ)
