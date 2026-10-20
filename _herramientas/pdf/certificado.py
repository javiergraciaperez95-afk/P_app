"""Certificado de nivel Paglot en PDF (A4 apaisado), con el diseño de la app.

    py _herramientas/pdf/certificado.py                      → la muestra (muestras/certificado-muestra.pdf)
    py _herramientas/pdf/certificado.py "Nombre" ko A1 es    → uno de verdad (en _certificados/, que no se sube)

El certificado solo dice que se ha completado un nivel dentro de Paglot. Lleva SIEMPRE, abajo a la derecha y bien
visible, que no tiene validez legal ni académica alguna. Cada uno lleva un código para comprobar que es de Paglot.
"""
import datetime
import hashlib
import html
import json
import os
import subprocess
import sys

import segno

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(RAIZ, '_herramientas', 'pdf', 'salida')
e = html.escape

TXT = {
    'es': {
        'titulo': 'Certificado de nivel', 'certifica': 'Paglot certifica que', 'completado': 'ha completado en Paglot el nivel',
        'de': 'de', 'fecha': 'Fecha', 'codigo': 'Código', 'comprobar': 'Compruébalo en paglot.eu',
        'leyenda': 'Sin validez legal ni académica alguna', 'leyenda2': 'Acredita solo el progreso dentro de la app Paglot. No es un título oficial.',
        'muestra': 'MUESTRA', 'tutora': 'Tu tutora',
    },
    'en': {
        'titulo': 'Level certificate', 'certifica': 'Paglot certifies that', 'completado': 'has completed on Paglot level',
        'de': 'of', 'fecha': 'Date', 'codigo': 'Code', 'comprobar': 'Check it at paglot.eu',
        'leyenda': 'No legal or academic validity whatsoever', 'leyenda2': 'It only shows progress inside the Paglot app. It is not an official qualification.',
        'muestra': 'SAMPLE', 'tutora': 'Your tutor',
    },
}


def nombres_cursos():
    salida = subprocess.run(['node', '-e', "import('./js/cursos.js').then(m=>console.log(JSON.stringify(Object.fromEntries(m.CURSOS.map(c=>[c.id,c.nombre])))))"],
                            cwd=RAIZ, capture_output=True, text=True, encoding='utf-8').stdout
    return json.loads(salida)


def hacer(nombre, curso, nivel, lengua, muestra):
    T = TXT[lengua]
    idioma = nombres_cursos()[curso][lengua]
    fecha = datetime.date.today().strftime('%d-%m-%Y')
    # el código: corto, sin letras que se confundan, y que sale siempre igual con los mismos datos
    huella = hashlib.sha256(f'{nombre}|{curso}|{nivel}|{fecha}'.encode()).hexdigest().upper()
    codigo = 'MUESTRA' if muestra else f'PGC-{huella[:4]}-{huella[4:8]}'
    qr = segno.make('https://paglot.eu', error='m').svg_inline(scale=3, dark='#2b2136', light=None, border=0)
    sello_muestra = f'<div class="marca-agua">{T["muestra"]}</div>' if muestra else ''
    pagina = f'''<!doctype html><html lang="{lengua}"><head><meta charset="utf-8"><title>Paglot · {e(T["titulo"])}</title>
<link rel="stylesheet" href="../paglot-pdf.css"><link rel="stylesheet" href="../certificado.css"></head><body>
<section class="hoja apaisada">
  {sello_muestra}
  <header class="membrete"><span class="marca"><img src="/assets/favicon.svg" alt=""><span>Pa<i>glot</i></span></span><small>paglot.eu</small></header>
  <div class="centro">
    <span class="etiqueta">{e(T["titulo"])}</span>
    <p class="certifica">{e(T["certifica"])}</p>
    <h1 class="nombre">{e(nombre)}</h1>
    <p class="certifica">{e(T["completado"])}</p>
    <p class="nivel"><b>{e(nivel)}</b> <span>{e(T["de"])} {e(idioma)}</span></p>
  </div>
  <div class="sello" aria-hidden="true"><span>{e(nivel)}</span><small>Paglot</small></div>
  <footer class="pie-cert">
    <div class="firma"><span class="firma-nombre">Pa<i>glot</i></span><span class="firma-linea"></span><small>{e(T["fecha"])}: {fecha}</small></div>
    <div class="qr">{qr}<small>{e(T["codigo"])}: <b>{codigo}</b><br>{e(T["comprobar"])}</small></div>
    <div class="leyenda"><strong>{e(T["leyenda"])}</strong><small>{e(T["leyenda2"])}</small></div>
  </footer>
</section></body></html>'''
    os.makedirs(SALIDA, exist_ok=True)
    nombre_html = 'certificado-muestra.html' if muestra else f'certificado-{codigo}.html'
    open(os.path.join(SALIDA, nombre_html), 'w', encoding='utf-8').write(pagina)
    pdf = 'muestras/certificado-muestra.pdf' if muestra else f'_certificados/{codigo}.pdf'
    lista = os.path.join(SALIDA, 'lista-certificado.json')
    json.dump([{'html': f'_herramientas/pdf/salida/{nombre_html}', 'pdf': pdf}], open(lista, 'w', encoding='utf-8'))
    subprocess.run(['node', os.path.join('_herramientas', 'pdf', 'imprimir.mjs'), lista], cwd=RAIZ)
    return pdf, codigo


if __name__ == '__main__':
    if len(sys.argv) >= 4:
        print(hacer(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else 'es', False))
    else:
        print(hacer('Alex Ejemplo', 'ko', 'A1', 'es', True))
