"""Pasa un informe en Markdown de _notas a PDF (vía HTML y Chrome sin ventana).

    python _herramientas/informe_a_pdf.py _notas/INFORME_ARREGLOS_2026-10-19.md
"""
import re
import subprocess
import sys
from pathlib import Path

import markdown

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
origen = Path(sys.argv[1]).resolve()
html = origen.with_suffix('.html')
pdf = origen.with_suffix('.pdf')

# Python-Markdown pide una línea en blanco antes de una lista; en los informes se escribe pegada al párrafo
lista = re.compile(r'^\s*([-*]|\d+\.)\s')
lineas = []
for linea in origen.read_text(encoding='utf-8').splitlines():
    # y las sublistas, con cuatro espacios (en los informes van con dos o tres)
    if re.match(r'^ {2,3}[-*] ', linea):
        linea = '    ' + linea.lstrip()
    if lista.match(linea) and lineas and lineas[-1].strip() and not lista.match(lineas[-1]) and not lineas[-1].startswith((' ', '|')):
        lineas.append('')
    lineas.append(linea)
cuerpo = markdown.markdown('\n'.join(lineas), extensions=['tables', 'sane_lists'])
titulo = origen.read_text(encoding='utf-8').splitlines()[0].lstrip('# ').strip()
estilo = """
@page { size: A4; margin: 16mm 14mm 16mm; }
:root { --tinta: #241b33; --suave: #5b4f6e; --rosa: #c8445a; --oro: #b8862b; --papel: #fbf7ef; --linea: #ded3c2; }
* { box-sizing: border-box; }
body { margin: 0; font: 10.2pt/1.45 "Segoe UI", system-ui, sans-serif; color: var(--tinta); }
h1 { margin: 0 0 6px; font-size: 22pt; color: var(--rosa); }
h1 + p { margin-top: 0; color: var(--suave); font-size: 11pt; }
h2 { margin: 26px 0 8px; padding: 6px 10px; font-size: 14.5pt; color: #fff; background: var(--tinta); break-after: avoid; }
h3 { margin: 18px 0 6px; font-size: 12.5pt; color: var(--rosa); border-bottom: 2px solid var(--linea); padding-bottom: 3px; break-after: avoid; }
h4 { margin: 14px 0 4px; font-size: 11pt; color: var(--tinta); break-after: avoid; }
p, li { orphans: 3; widows: 3; }
ul, ol { margin: 4px 0 8px; padding-left: 20px; }
li { margin: 2px 0; }
strong { color: #000; }
code { font: 8.8pt Consolas, monospace; background: #f1ecf7; padding: 0 3px; border-radius: 2px; }
a { color: #6a3fb0; text-decoration: none; word-break: break-word; }
hr { border: 0; border-top: 2px solid var(--linea); margin: 18px 0; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 8.6pt; break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th { background: var(--papel); text-align: left; border-bottom: 2px solid var(--tinta); padding: 4px 5px; }
td { border-bottom: 1px solid var(--linea); padding: 3px 5px; vertical-align: top; }
tr:nth-child(even) td { background: #fdfbf7; }
"""
html.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{titulo}</title>'
                f'<style>{estilo}</style></head><body>{cuerpo}</body></html>', encoding='utf-8')
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf}', html.as_uri()],
               check=True, timeout=120, capture_output=True)
print(pdf, round(pdf.stat().st_size / 1024), 'KB')
