"""Simulacros de examen en PDF, hechos con el contenido real de las lecciones de cada curso.

    py _herramientas/pdf/simulacros.py [nivel=A1] [cursos...]

Para cada curso toma las lecciones del nivel (capitulos.json dice el nivel de cada capítulo), saca palabras, frases y
ejercicios y monta un examen de cinco partes (vocabulario, lectura, frases, completar y ordenar) más una de escritura
libre. Paglot NUNCA corrige ni puntúa los simulacros: son para practicar por cuenta propia, y las soluciones van al
final para comprobarlas. No hay parte oral.

Sale el HTML en _herramientas/pdf/salida/ y el PDF en simulacros/<curso>/<alumno>/<nivel>-muestra.pdf (lo imprime
imprimir.mjs con Chrome; hace falta el servidor local en el puerto 8300).
"""
import glob
import html
import json
import os
import random
import re
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(RAIZ, '_herramientas', 'pdf', 'salida')
NIVEL = sys.argv[1] if len(sys.argv) > 1 else 'A1'
ELEGIDOS = sys.argv[2:]

# los textos del examen en el idioma del alumno
TXT = {
    'es': {
        'tipo': 'Simulacro de examen · Muestra', 'nivel': 'Nivel', 'nombre': 'Nombre', 'fecha': 'Fecha',
        'instr': 'Instrucciones',
        'instr1': 'Este simulacro sirve para practicar a tu ritmo. <b>Paglot no lo corrige ni lo puntúa</b>: al final tienes las soluciones para que compruebes tus respuestas tú mismo.',
        'instr2': 'Tiempo orientativo: 60 minutos. No hay parte oral.',
        'instr3': 'Rodea la letra de la respuesta correcta, escribe en las líneas o une con flechas.',
        'p1': 'Vocabulario', 'p1i': '¿Qué significa? Rodea la opción correcta.',
        'p2': 'Lectura', 'p2i': 'Lee el texto y une cada frase con su traducción.',
        'p3': 'Frases', 'p3i': '¿Qué significa la frase? Rodea la opción correcta.',
        'p4': 'Completar', 'p4i': 'Elige la palabra que completa la frase.',
        'p5': 'Ordenar', 'p5i': 'Ordena las palabras para formar la frase. Pista: su traducción.',
        'p6': 'Escritura', 'p6i': 'Escribe en {idioma}. No hay una única respuesta buena: compara tu texto con las lecciones del curso.',
        'e1': 'Preséntate: cómo te llamas, de dónde eres y qué idiomas hablas (25-35 palabras).',
        'e2': 'Escribe un mensaje corto a un amigo para quedar: dónde, cuándo y para qué (20-30 palabras).',
        'sol': 'Soluciones', 'soli': 'Comprueba tus respuestas. Recuerda: esto es para practicar, no es una nota.',
        'pista': 'Pista', 'pie': 'Paglot · paglot.eu · Simulacro de práctica: Paglot no lo evalúa.',
    },
    'en': {
        'tipo': 'Mock exam · Sample', 'nivel': 'Level', 'nombre': 'Name', 'fecha': 'Date',
        'instr': 'Instructions',
        'instr1': 'This mock exam is for practising at your own pace. <b>Paglot doesn’t mark or grade it</b>: the answers are at the end so you can check them yourself.',
        'instr2': 'Suggested time: 60 minutes. There is no speaking part.',
        'instr3': 'Circle the letter of the correct answer, write on the lines or draw arrows.',
        'p1': 'Vocabulary', 'p1i': 'What does it mean? Circle the correct option.',
        'p2': 'Reading', 'p2i': 'Read the text and match each sentence with its translation.',
        'p3': 'Sentences', 'p3i': 'What does the sentence mean? Circle the correct option.',
        'p4': 'Fill in the gap', 'p4i': 'Choose the word that completes the sentence.',
        'p5': 'Word order', 'p5i': 'Put the words in order to make the sentence. Hint: its translation.',
        'p6': 'Writing', 'p6i': 'Write in {idioma}. There is no single right answer: compare your text with the course lessons.',
        'e1': 'Introduce yourself: your name, where you are from and which languages you speak (25-35 words).',
        'e2': 'Write a short message to a friend to meet up: where, when and why (20-30 words).',
        'sol': 'Answers', 'soli': 'Check your answers. Remember: this is practice, not a grade.',
        'pista': 'Hint', 'pie': 'Paglot · paglot.eu · Practice mock exam: Paglot does not assess it.',
    },
}


EQUIVALE = {'A1': {'HSK 1', 'Novice'}, 'A2': {'HSK 2'}, 'B1': {'HSK 3', 'Intermediate'}, 'B2': {'HSK 4'}}


def cursos():
    salida = subprocess.run(['node', '-e', "import('./js/cursos.js').then(m=>console.log(JSON.stringify(m.CURSOS.map(c=>({id:c.id,nombre:c.nombre,lang:c.lang})))))"],
                            cwd=RAIZ, capture_output=True, text=True, encoding='utf-8').stdout
    return json.loads(salida)


def texto(x):
    if isinstance(x, dict):
        return str(x.get('texto', '')).strip()
    return str(x or '').strip()


def leer_nivel(curso, alumno):
    carpeta = os.path.join(RAIZ, 'cursos', curso, alumno)
    caps = json.load(open(os.path.join(carpeta, 'capitulos.json'), encoding='utf-8'))
    # chino y tailandés no usan los niveles del MCER: su A1 es el HSK 1 y el «Novice» del ACTFL
    nombres = {NIVEL} | EQUIVALE.get(NIVEL, set())
    del_nivel = {c['numero'] for c in caps if c.get('nivel') in nombres}
    lecciones = []
    for p in sorted(glob.glob(os.path.join(carpeta, '[0-9]*.json'))):
        d = json.load(open(p, encoding='utf-8'))
        if isinstance(d, dict) and d.get('capitulo') in del_nivel:
            lecciones.append(d)
    return lecciones


def recoger(lecciones):
    palabras, test, traduccion, huecos, ordenar, textos = [], [], [], [], [], []
    vistas = set()
    for lec in lecciones:
        for w in lec.get('palabras', []):
            es, sig = str(w.get('palabra', '')).strip(), str(w.get('significado', '')).strip()
            if es and sig and not w.get('oculta') and es not in vistas and len(sig) <= 40 and not sig.startswith('(') and 'sílaba' not in sig:
                vistas.add(es)
                palabras.append((es, sig))
        for etapa in lec.get('etapas', []):
            for pz in etapa.get('piezas', []):
                t = pz.get('tipo')
                opciones = [(texto(o), bool(o.get('correcta'))) for o in pz.get('opciones', []) if texto(o)]
                buena = [o for o, c in opciones if c]
                if t == 'traduccion' and texto(pz.get('frase')) and len(buena) == 1 and len(opciones) >= 3:
                    traduccion.append((texto(pz['frase']), [o for o, _ in opciones], buena[0]))
                elif t == 'huecos' and '___' in texto(pz.get('frase')) and len(buena) == 1 and len(opciones) >= 3:
                    huecos.append((texto(pz['frase']), [o for o, _ in opciones], buena[0], str(pz.get('traduccion') or '')))
                elif t == 'ordenar' and 2 < len(texto(pz.get('frase')).split()) <= 9 and pz.get('traduccion'):
                    ordenar.append((texto(pz['frase']), str(pz['traduccion'])))
                elif t in ('dialogo', 'texto'):
                    frases = [(str(f.get('estudio', '')).strip(), str(f.get('alumno', '')).strip()) for f in pz.get('frases', [])]
                    frases = [f for f in frases if f[0] and f[1] and len(f[0]) <= 70]
                    # mejor un diálogo con frases de verdad que una lista de sílabas sueltas para leer en voz alta
                    largas = [f for f in frases if len(f[0].split()) >= 2 or len(f[0]) >= 6]
                    if len(largas) >= 4:
                        textos.append((t == 'dialogo', largas))
    return palabras, traduccion, huecos, ordenar, textos


LETRAS = 'abcd'
e = html.escape


def opciones_html(opciones, lang=None):
    attr = f' lang="{lang}"' if lang else ''
    return '<ol class="ops">' + ''.join(f'<li><b>{LETRAS[i]})</b> <span{attr}>{e(o)}</span></li>' for i, o in enumerate(opciones)) + '</ol>'


def hacer(curso, alumno):
    T = TXT[alumno]
    rnd = random.Random(f'{curso}-{alumno}-{NIVEL}')
    lecciones = leer_nivel(curso['id'], alumno)
    palabras, traduccion, huecos, ordenar, textos = recoger(lecciones)
    nombre = curso['nombre'][alumno].capitalize() if alumno in curso['nombre'] else curso['nombre']['en']
    caps = json.load(open(os.path.join(RAIZ, 'cursos', curso['id'], alumno, 'capitulos.json'), encoding='utf-8'))
    propio = next((c['nivel'] for c in caps if c.get('nivel') in EQUIVALE.get(NIVEL, set())), None)
    nivel = f'{NIVEL} · {propio}' if propio else NIVEL
    lang = curso['lang']
    sol = {}

    # 1. vocabulario: diez palabras, cada una con tres significados falsos de otras palabras del nivel
    voc = rnd.sample(palabras, min(10, len(palabras)))
    items = []
    sol['p1'] = []
    for n, (es, sig) in enumerate(voc, 1):
        falsos = rnd.sample([s for _, s in palabras if s != sig], 3)
        ops = falsos + [sig]
        rnd.shuffle(ops)
        sol['p1'].append(f'{n} {LETRAS[ops.index(sig)]}')
        items.append(f'<li><span class="estudio" lang="{lang}">{e(es)}</span>{opciones_html(ops)}</li>')
    p1 = f'<h2><span class="num">1</span>{T["p1"]}</h2><p class="instr">{T["p1i"]}</p><ol class="preguntas dos">{"".join(items)}</ol>'

    # 2. lectura: un texto o diálogo de seis frases; las traducciones, desordenadas, con letra
    lectura = max(textos, key=lambda x: (x[0], min(len(x[1]), 6), sum(len(f[0]) for f in x[1][:6])))[1][:6] if textos else []
    orden = list(range(len(lectura)))
    rnd.shuffle(orden)
    sol['p2'] = [f'{i + 1} {"abcdef"[orden.index(i)]}' for i in range(len(lectura))]
    p2 = ''
    if lectura:
        izq = ''.join(f'<li lang="{lang}">{e(f[0])}</li>' for f in lectura)
        der = ''.join(f'<li><b>{"abcdef"[k]})</b> {e(lectura[i][1])}</li>' for k, i in enumerate(orden))
        p2 = (f'<h2><span class="num">2</span>{T["p2"]}</h2><p class="instr">{T["p2i"]}</p>'
              f'<div class="relacionar"><ol class="caja">{izq}</ol><ul class="caja letras">{der}</ul></div>')

    # 3. frases: seis traducciones de opción múltiple
    fr = rnd.sample(traduccion, min(6, len(traduccion)))
    sol['p3'] = []
    items = []
    for n, (frase, ops, buena) in enumerate(fr, 1):
        ops = ops[:4]
        if buena not in ops:
            ops[-1] = buena
        rnd.shuffle(ops)
        sol['p3'].append(f'{n} {LETRAS[ops.index(buena)]}')
        items.append(f'<li><span class="estudio" lang="{lang}">{e(frase)}</span>{opciones_html(ops)}</li>')
    p3 = '' if not items else f'<h2><span class="num">3</span>{T["p3"]}</h2><p class="instr">{T["p3i"]}</p><ol class="preguntas">{"".join(items)}</ol>'

    # 4. completar: seis huecos
    hu = rnd.sample(huecos, min(6, len(huecos)))
    sol['p4'] = []
    items = []
    for n, (frase, ops, buena, trad) in enumerate(hu, 1):
        ops = ops[:4]
        if buena not in ops:
            ops[-1] = buena
        rnd.shuffle(ops)
        sol['p4'].append(f'{n} {LETRAS[ops.index(buena)]} ({buena})')
        items.append(f'<li><span class="estudio" lang="{lang}">{e(frase).replace("___", "<span class=hueco></span>")}</span>{opciones_html(ops, lang)}</li>')
    p4 = '' if not items else f'<h2><span class="num">4</span>{T["p4"]}</h2><p class="instr">{T["p4i"]}</p><ol class="preguntas dos">{"".join(items)}</ol>'

    # 5. ordenar: cinco frases con sus palabras barajadas y la traducción como pista
    orde = rnd.sample(ordenar, min(5, len(ordenar)))
    sol['p5'] = []
    items = []
    for n, (frase, trad) in enumerate(orde, 1):
        piezas = frase.split()
        mezcla = piezas[:]
        while mezcla == piezas and len(set(piezas)) > 1:
            rnd.shuffle(mezcla)
        sol['p5'].append(f'{n} {frase}')
        fichas = ''.join(f'<span class="ficha" lang="{lang}">{e(p)}</span>' for p in mezcla)
        items.append(f'<li><div class="fichas">{fichas}</div><small>{T["pista"]}: {e(trad)}</small><div class="linea"></div></li>')
    p5 = '' if not items else f'<h2><span class="num">5</span>{T["p5"]}</h2><p class="instr">{T["p5i"]}</p><ol class="preguntas">{"".join(items)}</ol>'

    # 6. escritura libre
    lineas = '<div class="linea"></div>' * 7
    p6 = (f'<h2><span class="num">6</span>{T["p6"]}</h2><p class="instr">{T["p6i"].format(idioma=nombre.lower() if alumno == "es" else nombre)}</p>'
          f'<h3>a) {T["e1"]}</h3>{lineas}<h3>b) {T["e2"]}</h3>{lineas}')

    def bloque_sol(clave, titulo):
        return f'<div class="sol"><h3>{titulo}</h3><p>{" · ".join(e(x) for x in sol.get(clave, []))}</p></div>' if sol.get(clave) else ''
    soluciones = (f'<h2><span class="num">✓</span>{T["sol"]}</h2><p class="instr">{T["soli"]}</p>'
                  + bloque_sol('p1', '1. ' + T['p1']) + bloque_sol('p2', '2. ' + T['p2']) + bloque_sol('p3', '3. ' + T['p3'])
                  + bloque_sol('p4', '4. ' + T['p4']) + bloque_sol('p5', '5. ' + T['p5']))

    membrete = (f'<header class="membrete"><span class="marca"><img src="/assets/favicon.svg" alt=""><span>Pa<i>glot</i></span></span>'
                f'<small>{T["tipo"]}<br>{e(nombre)} · {T["nivel"]} {e(nivel)}</small></header>')
    pie = lambda n: f'<footer class="pie-hoja"><span>{T["pie"]}</span><span>{n}</span></footer>'
    portada = (f'<span class="etiqueta">{T["tipo"]}</span><h1 class="titulo">{e(nombre)} · {e(nivel)}</h1>'
               f'<div class="datos"><span>{T["nombre"]}: <i></i></span><span>{T["fecha"]}: <i></i></span></div>'
               f'<div class="caja instrucciones"><h3>{T["instr"]}</h3><p>{T["instr1"]}</p><p>{T["instr2"]}</p><p>{T["instr3"]}</p></div>')
    # las partes se numeran según las que salen (el curso de español no tiene ejercicios de traducir)
    cuenta = iter(range(1, 10))
    numeros = {}
    def numerar(m):
        n = next(cuenta)
        numeros[m.group(1)] = n
        return f'<span class="num">{n}</span>'
    SEP = '<!--parte-->'
    partes = re.sub(r'<span class="num">(\d)</span>', numerar, p1 + SEP + p2 + SEP + p3 + SEP + p4 + SEP + p5 + SEP + p6).split(SEP)
    p1, p2, p3, p4, p5, p6 = partes
    soluciones = re.sub(r'<h3>(\d)\. ', lambda m: f'<h3>{numeros.get(m.group(1), m.group(1))}. ', soluciones)
    hojas = [portada + p1, p2 + p3, p4 + p5, p6, soluciones]
    cuerpo = ''.join(f'<section class="hoja">{membrete}{h}{pie(i + 1)}</section>' for i, h in enumerate(hojas) if h)
    pagina = f'''<!doctype html><html lang="{alumno}"><head><meta charset="utf-8"><title>Paglot · {e(nombre)} {NIVEL}</title>
<link rel="stylesheet" href="../paglot-pdf.css"><link rel="stylesheet" href="../simulacro.css"></head><body>{cuerpo}</body></html>'''
    os.makedirs(SALIDA, exist_ok=True)
    nombre_html = f'simulacro-{curso["id"]}-{alumno}-{NIVEL}.html'
    open(os.path.join(SALIDA, nombre_html), 'w', encoding='utf-8').write(pagina)
    cuenta = dict(vocabulario=len(voc), lectura=len(lectura), frases=len(fr), huecos=len(hu), ordenar=len(orde))
    return {'html': f'_herramientas/pdf/salida/{nombre_html}', 'pdf': f'simulacros/{curso["id"]}/{alumno}/{NIVEL}-muestra.pdf', 'cuenta': cuenta}


if __name__ == '__main__':
    lista = []
    for c in cursos():
        if ELEGIDOS and c['id'] not in ELEGIDOS:
            continue
        alumno = 'en' if c['id'] == 'es' else 'es'
        if not os.path.isdir(os.path.join(RAIZ, 'cursos', c['id'], alumno)):
            print('sin carpeta', c['id'], alumno)
            continue
        r = hacer(c, alumno)
        print(c['id'], alumno, r['cuenta'])
        lista.append({'html': r['html'], 'pdf': r['pdf']})
    # el índice que lee la app (#/simulacros): por curso y lengua del alumno, los PDF que hay
    indice_ruta = os.path.join(RAIZ, 'simulacros', 'indice.json')
    indice = json.load(open(indice_ruta, encoding='utf-8')) if os.path.exists(indice_ruta) else {}
    for item in lista:
        _, curso_id, alumno, archivo = item['pdf'].split('/')
        entradas = indice.setdefault(curso_id, {}).setdefault(alumno, [])
        nuevo = {'id': archivo[:-4], 'nivel': archivo.split('-')[0], 'archivo': archivo, 'muestra': archivo.endswith('-muestra.pdf')}
        entradas[:] = [x for x in entradas if x['id'] != nuevo['id']] + [nuevo]
    json.dump(indice, open(indice_ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
    ruta = os.path.join(SALIDA, 'lista-simulacros.json')
    json.dump(lista, open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    subprocess.run(['node', os.path.join('_herramientas', 'pdf', 'imprimir.mjs'), ruta], cwd=RAIZ)
