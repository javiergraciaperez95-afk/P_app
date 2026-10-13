# -*- coding: utf-8 -*-
"""Convierte las lecciones escritas en formato corto (_herramientas/cursos/<curso>/*.txt)
en los JSON del curso (Idiomas/cursos/<curso>/lessons/NNN.json).

Uso:  py -X utf8 _herramientas/cursos/compilar.py fr

Cada archivo .txt lleva una o varias lecciones (lo normal: un archivo por capítulo). Se numeran solas,
por orden de archivo y de aparición: 001, 002… Las lecciones que hubiera antes en el curso se sustituyen.
Los capítulos van en <curso>/capitulos.txt:   número | título en el idioma | título en español | descripción

Formato de una lección (una cosa por línea; «::» separa campos):

  N Anna, Tom                                   nombres propios (no necesitan ficha); valen para todo el curso
  @ 1 | Title in the language | Título en español
  I Lo que dice la tutora al abrir la lección   (opcional)
  E Título :: párrafo 1 :: párrafo 2            explicación (**negrita** permitida)
  B Título | columna 1 | columna 2              tabla; debajo, sus filas:
  | casilla | casilla
  D Título                                      diálogo; debajo, sus frases:
  Anna: Sentence. = Traducción.
    > trozo = qué es | otro trozo = qué es      análisis de la frase anterior (opcional)
  T Título                                      texto (sin personajes); debajo, sus frases:
  - Sentence. = Traducción.
  W word = traducción | pronunciación | consejo palabra nueva (pronunciación y consejo, opcionales)
  w word = traducción | pronunciación           ficha oculta: se puede tocar en las frases, pero no sale en las
                                                listas de vocabulario ni va al cuaderno (nombres, formas sueltas)
  V Título                                      lista de vocabulario: las W que haya hasta ahí sin listar
  Q Pregunta                                    test            } debajo, las opciones:
  R Sentence :: pregunta (opcional)             traducción      }   + buena :: explicación
  H Sentence with ___ :: pregunta o pista       hueco           }   - mala :: explicación
  HA Sentence with ___ :: pista                 hueco con audio (se oye la frase entera)
  A Sentence to hear :: pregunta                test de escucha (suena la frase)
  O Short sentence :: traducción :: explicación ordenar las palabras
  X Pregunta :: respuesta | otra válida :: explicación     escribir la respuesta

Avisa de: palabras de las frases sin ficha, trozos de análisis que no están en la frase,
ejercicios sin una única opción buena y palabras repetidas.

Coreano: la pronunciación se calcula sola si no se escribe, y las palabras con partícula pegada
(학교에, 저는…) reciben una ficha oculta automática si la palabra base ya tiene ficha (ver coreano.py).
Con «-v» detrás del curso se listan esas fichas automáticas.

Con «--sin-lista» detrás del curso no se actualiza js/cursos.js (para cuando se escriben varios cursos
a la vez: la lista la pone al día la compilación final, sin esa opción).
"""
import json, re, sys, time
from pathlib import Path

import coreano

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent

# Lo mismo que hace la app (vistas/leccion.js) para partir una frase en palabras.
PALABRA = re.compile(r"[^\W_]+(?:['’\-][^\W_]+)*")
MAX_EXPRESION = 5


class Fallo(Exception):
    pass


def escribir(ruta, texto):
    """Guarda un archivo. En Windows a veces otro programa lo tiene cogido un instante: se reintenta."""
    for intento in range(40):
        try:
            if ruta.exists() and ruta.read_bytes() == texto.encode('utf-8'):
                return  # ya está igual: no se toca
            ruta.write_text(texto, encoding='utf-8', newline='\n')
            return
        except OSError:
            if intento == 39:
                raise
            time.sleep(0.4)


def partes(texto, n=None):
    p = [x.strip() for x in texto.split('::')]
    if n:
        p += [''] * (n - len(p))
    return p


def normal(texto):
    return ' '.join(texto.strip().lower().split())


def leer(curso, campo):
    """Devuelve (lecciones, nombres). Cada lección: (origen, dict, avisos)."""
    carpeta = AQUI / curso
    lecciones, nombres = [], set()
    for ruta in sorted(carpeta.glob('[0-9]*.txt')):
        leccion = palabras = pendientes = actual = None
        avisos = []
        k = 0

        def cerrar_leccion():
            if leccion is None:
                return
            if pendientes:
                leccion['bloques'].append({'tipo': 'vocabulario', 'titulo': 'Vocabulario', 'palabras': pendientes[:]})
            lecciones.append((ruta.name, leccion, avisos))

        for n, cruda in enumerate(ruta.read_text(encoding='utf-8').splitlines(), 1):
            s = cruda.strip()
            if not s or s.startswith('#'):
                continue
            donde = f'{ruta.name}:{n}'
            marca, _, resto = s.partition(' ')
            resto = resto.strip()
            if marca == 'N':
                nombres.update(normal(x) for x in resto.split(',') if x.strip())
                continue
            if marca == '@':
                cerrar_leccion()
                cap, titulo, es = [x.strip() for x in resto.split('|')]
                palabras, pendientes, actual, avisos, k = {}, [], None, [], 0
                leccion = {'capitulo': int(cap), f'titulo_{campo}': titulo, 'titulo_es': es, 'palabras': palabras, 'bloques': []}
                continue
            if leccion is None:
                raise Fallo(f'{donde}: falta la línea @ antes de esto')
            num = len(lecciones) + 1

            def ejercicio(tipo, **campos):
                nonlocal actual, k
                k += 1
                actual = {'tipo': tipo, **{a: b for a, b in campos.items() if b}, 'id': f'{curso}{num:03d}-{k}', 'opciones': []}
                leccion['bloques'].append(actual)

            if marca == 'I':
                leccion['intro'] = resto
            elif marca == 'E':
                actual = None
                p = partes(resto)
                leccion['bloques'].append({'tipo': 'explicacion', 'titulo': p[0], 'texto': p[1:]})
            elif marca == 'B':
                p = [x.strip() for x in resto.split('|')]
                actual = {'tipo': 'tabla', 'titulo': p[0], 'filas': []}
                if len(p) > 1:
                    actual['columnas'] = p[1:]
                leccion['bloques'].append(actual)
            elif marca == '|' and actual and actual.get('tipo') == 'tabla':
                actual['filas'].append([x.strip() for x in resto.split('|')])
            elif marca in ('D', 'T') and ' = ' not in resto:
                actual = {'tipo': 'dialogo' if marca == 'D' else 'texto', 'titulo': resto, 'frases': []}
                leccion['bloques'].append(actual)
            elif marca in ('W', 'w'):
                w, _, resto2 = resto.partition(' = ')
                w = w.strip()
                trozos = [x.strip() for x in resto2.split('|')]
                if not trozos[0]:
                    raise Fallo(f'{donde}: palabra sin traducción')
                if normal(w) in (normal(x) for x in palabras):
                    avisos.append(f'{donde}: palabra repetida en la lección: {w}')
                ficha = {'es': trozos[0]}
                if len(trozos) > 1 and trozos[1]:
                    ficha['pron'] = trozos[1]
                elif curso == 'ko':
                    ficha['pron'] = coreano.pron(w)
                if len(trozos) > 2 and trozos[2]:
                    ficha['consejo'] = trozos[2]
                palabras[w] = ficha
                if marca == 'w':
                    ficha['oculta'] = True
                else:
                    pendientes.append(w)
            elif marca == 'V':
                actual = None
                leccion['bloques'].append({'tipo': 'vocabulario', 'titulo': resto or 'Vocabulario', 'palabras': pendientes[:]})
                pendientes.clear()
            elif marca == 'Q':
                ejercicio('test', pregunta=resto)
            elif marca == 'R':
                f, q = partes(resto, 2)
                ejercicio('traduccion', pregunta=q or '¿Qué significa?', frase=f)
            elif marca in ('H', 'HA'):
                f, q = partes(resto, 2)
                # En los exámenes: «Cap. 3. Frase ___» → el capítulo pasa a la pregunta.
                m = re.match(r'(Cap\. \d+\.) (.+)', f)
                if m:
                    f, q = m.group(2), f'{m.group(1)} {q or "Completa la frase."}'
                if '___' not in f:
                    raise Fallo(f'{donde}: el hueco se escribe ___')
                ejercicio('huecos', pregunta=q or 'Completa la frase.', frase=f)
                if marca == 'HA':
                    actual['audio'] = True
            elif marca == 'A':
                f, q = partes(resto, 2)
                ejercicio('test', pregunta=q or 'Escucha. ¿Qué significa?', audio=f)
            elif marca == 'O':
                f, tr, ex = partes(resto, 3)
                k += 1
                actual = None
                leccion['bloques'].append({'tipo': 'ordenar', 'pregunta': 'Ordena las palabras.', 'frase': f, 'traduccion': tr,
                                           **({'explicacion': ex} if ex else {}), 'id': f'{curso}{num:03d}-{k}'})
            elif marca == 'X':
                q, r, ex = partes(resto, 3)
                k += 1
                actual = None
                leccion['bloques'].append({'tipo': 'escribir', 'pregunta': q, 'respuestas': [x.strip() for x in r.split(' | ') if x.strip()],
                                           **({'explicacion': ex} if ex else {}), 'id': f'{curso}{num:03d}-{k}'})
            elif marca in ('+', '-') and actual and 'opciones' in actual:
                texto, ex = partes(resto, 2)
                o = {'texto': texto, 'explicacion': ex or ('Correcto.' if marca == '+' else 'No.')}
                if marca == '+':
                    o['correcta'] = True
                actual['opciones'].append(o)
            elif marca == '>' and actual and actual.get('frases'):
                trozos = []
                for t in resto.split(' | '):
                    a, _, b = t.partition(' = ')
                    if not b.strip():
                        raise Fallo(f'{donde}: trozo de análisis sin explicación: {t}')
                    trozos.append([a.strip(), b.strip()])
                actual['frases'][-1]['analisis'] = trozos
            elif actual and 'frases' in actual and ' = ' in s:
                texto, _, es = s.partition(' = ')
                frase = {}
                if actual['tipo'] == 'dialogo':
                    quien, sep, dicho = texto.partition(': ')
                    if not sep:
                        raise Fallo(f'{donde}: en un diálogo cada frase empieza por «Nombre: »')
                    frase['quien'], texto = quien.strip(), dicho
                elif texto.startswith('- '):
                    texto = texto[2:]
                frase[campo] = texto.strip()
                frase['es'] = es.strip()
                actual['frases'].append(frase)
            else:
                raise Fallo(f'{donde}: no entiendo esta línea: {s[:70]}')
        cerrar_leccion()
    return lecciones, nombres


def sin_ficha(frase, conocidas, nombres, auto=None):
    """Palabras de la frase que no tienen ficha (ni solas ni dentro de una expresión), como las vería la app.
    auto(palabra): en coreano, intenta crear la ficha de «palabra + partícula»; devuelve si lo ha logrado."""
    fichas = [(m.group(0), m.start(), m.end()) for m in PALABRA.finditer(frase)]
    faltan, i = [], 0
    while i < len(fichas):
        hallada = 0
        for n in range(min(MAX_EXPRESION, len(fichas) - i), 0, -1):
            grupo = fichas[i:i + n]
            if any(frase[grupo[j][2]:grupo[j + 1][1]].strip() for j in range(n - 1)):
                continue
            if normal(' '.join(g[0] for g in grupo)) in conocidas:
                hallada = n
                break
        if hallada:
            i += hallada
            continue
        w = fichas[i][0]
        base = re.sub(r"['’]s$", '', w)  # posesivo inglés: Jack's, sister's
        if base != w and (normal(base) in conocidas or normal(base) in nombres):
            i += 1
            continue
        suelta = len(w) == 1 and w.isupper()  # una letra al deletrear
        if auto and auto(w):
            i += 1
            continue
        if not w.isdigit() and not suelta and normal(w) not in nombres:
            faltan.append(w)
        i += 1
    return list(dict.fromkeys(faltan))


def revisar(num, leccion, campo, conocidas, nombres, avisos, auto=None):
    ejercicios = 0
    for b in leccion['bloques']:
        if b['tipo'] in ('test', 'traduccion', 'huecos', 'ordenar', 'escribir'):
            ejercicios += 1
        if 'opciones' in b:
            buenas = [o for o in b['opciones'] if o.get('correcta')]
            if len(buenas) != 1 or len(b['opciones']) < 3:
                avisos.append(f'{num}: «{b.get("pregunta") or b.get("frase")}»: {len(b["opciones"])} opciones, {len(buenas)} buenas')
            textos = [normal(o['texto']) for o in b['opciones']]
            if len(set(textos)) != len(textos):
                avisos.append(f'{num}: opciones repetidas en «{b.get("pregunta")}»')
        for f in b.get('frases', []):
            for trozo, _ in f.get('analisis', []):
                limpio = re.sub(r'^[¿¡]+', '', re.sub(r'[?!.]+$', '', trozo.lower()))
                if limpio not in f[campo].lower():
                    avisos.append(f'{num}: el trozo «{trozo}» no está en «{f[campo][:50]}»')
            faltan = sin_ficha(f[campo], conocidas, nombres, auto)
            if faltan:
                avisos.append(f'{num}: sin ficha: {", ".join(faltan)}  ← «{f[campo][:60]}»')
        # Los ejercicios solo deberían usar palabras ya enseñadas.
        frase = b.get('audio') if isinstance(b.get('audio'), str) else b.get('frase') if b['tipo'] in ('traduccion', 'huecos', 'ordenar') else None
        if frase:
            if '___' in frase:
                buena = next((o['texto'] for o in b.get('opciones', []) if o.get('correcta')), '')
                frase = frase.replace('___', buena)
            frase = re.sub(r'\([^)]*\)', '', frase)
            faltan = sin_ficha(frase, conocidas, nombres, auto)
            if faltan:
                avisos.append(f'{num}: ejercicio con palabras sin ficha: {", ".join(faltan)}  ← «{frase[:60]}»')
    if ejercicios < 6:
        avisos.append(f'{num}: solo {ejercicios} ejercicios')


def main():
    if len(sys.argv) < 2:
        sys.exit('Falta el curso: py -X utf8 compilar.py fr')
    curso = sys.argv[1]
    campo = 'ind' if curso == 'id' else curso
    destino = RAIZ / 'Idiomas' / 'cursos' / curso / 'lessons'
    if not (AQUI / curso).is_dir() or not destino.parent.is_dir():
        sys.exit(f'No existe el curso «{curso}»')
    try:
        lecciones, nombres = leer(curso, campo)
    except Fallo as e:
        sys.exit(f'ERROR {e}')
    if not lecciones:
        sys.exit('No hay lecciones')

    conocidas, vistas, avisos, automaticas = set(), {}, [], []
    for i, (origen, leccion, av) in enumerate(lecciones, 1):
        num = f'{i:03d}'
        for w, ficha in leccion['palabras'].items():
            antes = vistas.get(normal(w))
            if antes and antes[1] == ficha['es']:
                av.append(f'{num}: «{w}» ya se enseñó igual en la {antes[0]}')
            vistas.setdefault(normal(w), (num, ficha['es']))
            conocidas.add(normal(w))

        def auto(w, leccion=leccion, num=num):
            """Coreano: «palabra conocida + partícula» → ficha oculta en esta lección."""
            trozo = coreano.partir(w, lambda base: normal(base) in vistas)
            if not trozo:
                return False
            base, part, glosa = trozo
            propia = next((f for w2, f in leccion['palabras'].items() if normal(w2) == normal(base)), None)
            # Si la base se enseña en esta lección, vale su primer sentido («día; uno; trabajo» → día).
            entera = propia['es'].split(';')[0].strip() if propia else vistas[normal(base)][1]
            es = re.sub(r'\s*\([^)]*\)$', '', entera)
            if not es:  # la traducción entera iba entre paréntesis: «(contador de personas)»
                es = entera.split(';')[0].strip('() ')
            leccion['palabras'][w] = {'es': f'{es} + {part} ({glosa})', 'pron': coreano.pron_con_particula(w, part), 'oculta': True}
            vistas[normal(w)] = (num, '')
            conocidas.add(normal(w))
            automaticas.append(f'{num}  {w} = {es} + {part} ({glosa})')
            return True

        revisar(num, leccion, campo, conocidas, nombres, av, auto if curso == 'ko' else None)
        avisos += av
        if not leccion['palabras']:
            del leccion['palabras']

    destino.mkdir(exist_ok=True)
    # Sobran las lecciones antiguas con un número mayor que la última de ahora (las demás se sobrescriben).
    for viejo in destino.glob('[0-9]*.json'):
        if int(viejo.stem) > len(lecciones):
            viejo.unlink()
    for i, (_, leccion, _) in enumerate(lecciones, 1):
        escribir(destino / f'{i:03d}.json', json.dumps(leccion, ensure_ascii=False, indent=1) + '\n')

    usados = {l['capitulo'] for _, l, _ in lecciones}
    caps = []
    for linea in (AQUI / curso / 'capitulos.txt').read_text(encoding='utf-8').splitlines():
        if linea.strip() and not linea.startswith('#'):
            c, titulo, es, desc = [x.strip() for x in linea.split('|')]
            if int(c) in usados:
                caps.append({'numero': int(c), f'titulo_{campo}': titulo, 'titulo_es': es, 'descripcion': desc})
    faltan = usados - {c['numero'] for c in caps}
    if faltan:
        avisos.append(f'capítulos sin título en capitulos.txt: {sorted(faltan)}')
    escribir(destino / 'capitulos.json', json.dumps(caps, ensure_ascii=False, indent=1) + '\n')

    # Número de lecciones del curso en js/cursos.js. Con «--sin-lista» no se toca: es un archivo común a todos
    # los cursos y, si se escriben varios a la vez, solo debe actualizarlo quien haga la compilación final.
    if '--sin-lista' not in sys.argv:
        cursos = RAIZ / 'Idiomas' / 'js' / 'cursos.js'
        t = cursos.read_text(encoding='utf-8')
        j = t.index('"lecciones":', t.index(f'"id": "{curso}"'))
        t2 = t[:j] + re.sub(r'"lecciones": \d+', f'"lecciones": {len(lecciones)}', t[j:], count=1)
        if t2 != t:
            escribir(cursos, t2)

    if '-v' in sys.argv:
        for a in automaticas:
            print('auto', a)
    for a in avisos:
        print('AVISO', a)
    ej = sum(1 for _, l, _ in lecciones for b in l['bloques'] if b['tipo'] in ('test', 'traduccion', 'huecos', 'ordenar', 'escribir'))
    enseñadas = sum(1 for _, l, _ in lecciones for f in l.get('palabras', {}).values() if not f.get('oculta'))
    print(f'{curso}: {len(lecciones)} lecciones, {len(caps)} capítulos, {enseñadas} palabras, {ej} ejercicios, {len(avisos)} avisos')


if __name__ == '__main__':
    main()
