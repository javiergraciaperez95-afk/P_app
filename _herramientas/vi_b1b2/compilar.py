# -*- coding: utf-8 -*-
"""Convierte las lecciones de vietnamita B1-B2 escritas en formato corto (fuente/NNN.txt)
en los JSON del curso (Idiomas/cursos/vi/lessons/NNN.json).

Uso:  py -X utf8 _herramientas/vi_b1b2/compilar.py            (todas)
      py -X utf8 _herramientas/vi_b1b2/compilar.py 144 150    (de la 144 a la 150)

Formato de una lección (una cosa por línea; «::» separa campos):

  @ 26 | Bài 26 · Tiêu đề | Título en español
  E Título :: párrafo 1 :: párrafo 2            explicación (**negrita** permitida)
  D Hội thoại · Título                          diálogo; debajo, sus frases:
  Lan: Câu tiếng Việt. = Traducción.
    > trozo = qué es | otro trozo = qué es      análisis de la frase anterior (opcional)
  T Bài đọc · Título                            texto (sin personajes); debajo, sus frases:
  - Câu tiếng Việt. = Traducción.
  W từ mới = traducción                         palabra nueva (la pronunciación se pone sola)
  V Título                                      lista de vocabulario: todas las W que haya hasta ahí sin listar
  Q Pregunta                                    test          } debajo, las opciones:
  R Câu tiếng Việt :: pregunta (opcional)       traducción    }   + buena :: explicación
  H Câu có ___ :: pregunta o pista              hueco         }   - mala :: explicación
  A Câu để nghe :: pregunta                     test de escucha (suena la frase)
  O Câu ngắn :: traducción :: explicación       ordenar las palabras

Avisa de: sílabas sin ficha en el diccionario, trozos de análisis que no están en la frase,
ejercicios sin una única opción buena y palabras repetidas.
"""
import json, re, sys, unicodedata
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
CURSO = RAIZ / 'Idiomas' / 'cursos' / 'vi'
LECCIONES = CURSO / 'lessons'
PRIMERA = 144  # las anteriores vienen de la app antigua y no se tocan

# ---------------------------------------------------------------------------
# Pronunciación aproximada (acento del norte), con la misma convención que las lecciones 1-143
# ---------------------------------------------------------------------------
TONOS = {'́': '↗', '̀': '↘', '̉': '↘↗', '̃': '~↗', '̣': '↓'}
SILABAS = json.loads((AQUI.parent / 'vi_silabas.json').read_text(encoding='utf-8')) if (AQUI.parent / 'vi_silabas.json').exists() else {}
INICIOS = [('ngh', 'ng'), ('ng', 'ng'), ('nh', 'ñ'), ('gh', 'g'), ('gi', 'z'), ('kh', 'j'), ('ph', 'f'), ('th', 't'), ('tr', 'ch'),
           ('ch', 'ch'), ('qu', 'cu'), ('đ', 'd'), ('d', 'z'), ('r', 'z'), ('x', 's'), ('s', 's'), ('c', 'c'), ('k', 'k'), ('g', 'g')]
VOCALES = {'ă': 'a', 'â': 'e', 'ê': 'e', 'ô': 'o', 'ơ': 'e', 'ư': 'u', 'y': 'i'}


def pron_silaba(s):
    base = s.lower()
    if base in SILABAS:
        return SILABAS[base]
    d = unicodedata.normalize('NFD', base)
    tono = ''
    limpio = ''
    for c in d:
        if c in TONOS:
            tono = TONOS[c]
        else:
            limpio += c
    limpio = unicodedata.normalize('NFC', limpio)
    if not re.fullmatch(r'[a-zăâêôơưđ]+', limpio):
        return s  # nombres extranjeros, cifras…
    inicio = ''
    resto = limpio
    for a, b in INICIOS:
        if limpio.startswith(a) and len(limpio) > len(a):
            if a == 'gi' and len(limpio) > 2 and limpio[2] not in 'aăâeêioôơuưy':
                continue
            inicio, resto = b, limpio[len(a):]
            if a == 'gi' and not re.match(r'[aăâeêoôơuư]', resto):
                resto = 'i' + resto  # gì, gìn
            break
    if inicio == 'c' and resto[:1] in ('e', 'ê', 'i'):
        inicio = 'k'
    if inicio == 'g' and resto[:1] in ('e', 'ê', 'i'):
        inicio = 'gu'
    # finales
    final = ''
    for a, b in (('nh', 'ñ'), ('ch', 'ch'), ('ng', 'ng'), ('c', 'c'), ('m', 'm'), ('n', 'n'), ('p', 'p'), ('t', 't')):
        if resto.endswith(a) and len(resto) > len(a):
            final, resto = b, resto[:-len(a)]
            break
    if final in ('ñ', 'ch') and resto == 'a':
        resto = 'ai'
    if final == 'ch' and resto != 'ai':
        final = 'c'
    if final == 'ng' and resto in ('o', 'ô', 'u'):
        final = 'm'
    nucleo = ''.join(VOCALES.get(c, c) for c in resto)
    nucleo = nucleo.replace('ue', 'ue').replace('uo', 'uo').replace('ie', 'ie')
    return inicio + nucleo + final + tono


def pron(palabra):
    return ' '.join(pron_silaba(s) for s in re.sub(r"[.,!?…:;()«»\"“”]", '', palabra).split())


# ---------------------------------------------------------------------------
# Lectura del formato corto
# ---------------------------------------------------------------------------
class Fallo(Exception):
    pass


def partes(texto, n=None):
    p = [x.strip() for x in texto.split('::')]
    if n:
        p += [''] * (n - len(p))
    return p


def leer_fuente(ruta):
    numero = ruta.stem
    leccion = {'bloques': []}
    palabras = {}
    pendientes = []       # W aún no metidas en un bloque V
    actual = None         # bloque abierto (diálogo, texto o ejercicio)
    k = 0
    avisos = []

    def cerrar():
        nonlocal actual
        actual = None

    def ejercicio(tipo, **campos):
        nonlocal actual, k
        k += 1
        actual = {'tipo': tipo, **{a: b for a, b in campos.items() if b}, 'id': f'vb{numero}-{k}', 'opciones': []}
        leccion['bloques'].append(actual)

    for n, cruda in enumerate(ruta.read_text(encoding='utf-8').splitlines(), 1):
        linea = cruda.rstrip()
        if not linea.strip() or linea.lstrip().startswith('#'):
            continue
        donde = f'{ruta.name}:{n}'
        s = linea.strip()
        marca, _, resto = s.partition(' ')
        resto = resto.strip()
        if marca == '@':
            cap, vi, es = [x.strip() for x in resto.split('|')]
            leccion = {'capitulo': int(cap), 'titulo_vi': vi, 'titulo_es': es, 'palabras': palabras, 'bloques': leccion['bloques']}
        elif marca == 'E':
            cerrar()
            p = partes(resto)
            leccion['bloques'].append({'tipo': 'explicacion', 'titulo': p[0], 'texto': p[1:]})
        elif marca in ('D', 'T') and '=' not in resto:
            actual = {'tipo': 'dialogo' if marca == 'D' else 'texto', 'titulo': resto, 'frases': []}
            leccion['bloques'].append(actual)
        elif marca == 'W':
            w, _, es = resto.partition(' = ')
            w, es = w.strip(), es.strip()
            if not es:
                raise Fallo(f'{donde}: palabra sin traducción')
            if w.lower() in (x.lower() for x in palabras):
                avisos.append(f'{donde}: palabra repetida en la lección: {w}')
            palabras[w] = {'es': es, 'pron': pron(w)}
            pendientes.append(w)
        elif marca == 'V':
            cerrar()
            leccion['bloques'].append({'tipo': 'vocabulario', 'titulo': resto or 'Vocabulario', 'palabras': pendientes[:]})
            pendientes.clear()
        elif marca == 'Q':
            ejercicio('test', pregunta=resto)
        elif marca == 'R':
            f, q = partes(resto, 2)
            ejercicio('traduccion', pregunta=q or '¿Qué significa?', frase=f)
        elif marca == 'H':
            f, q = partes(resto, 2)
            if '___' not in f:
                raise Fallo(f'{donde}: el hueco se escribe ___')
            ejercicio('huecos', pregunta=q or 'Completa la frase.', frase=f)
            actual['audio'] = True
        elif marca == 'A':
            f, q = partes(resto, 2)
            ejercicio('test', pregunta=q or 'Escucha. ¿Qué has oído?', audio=f)
        elif marca == 'O':
            f, tr, ex = partes(resto, 3)
            k += 1
            cerrar()
            leccion['bloques'].append({'tipo': 'ordenar', 'pregunta': 'Ordena las palabras.', 'frase': f, 'traduccion': tr,
                                       **({'explicacion': ex} if ex else {}), 'id': f'vb{numero}-{k}'})
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
            vi, _, es = s.partition(' = ')
            frase = {}
            if actual['tipo'] == 'dialogo':
                quien, sep, dicho = vi.partition(': ')
                if not sep:
                    raise Fallo(f'{donde}: en un diálogo cada frase empieza por «Nombre: »')
                frase['quien'], vi = quien.strip(), dicho
            elif vi.startswith('- '):
                vi = vi[2:]
            frase.update(vi=vi.strip(), es=es.strip())
            actual['frases'].append(frase)
        else:
            raise Fallo(f'{donde}: no entiendo esta línea: {s[:60]}')

    if 'capitulo' not in leccion:
        raise Fallo(f'{ruta.name}: falta la línea @')
    if pendientes:
        leccion['bloques'].append({'tipo': 'vocabulario', 'titulo': 'Vocabulario', 'palabras': pendientes[:]})
    if not palabras:
        leccion.pop('palabras', None)
    return leccion, avisos


# ---------------------------------------------------------------------------
# Comprobaciones
# ---------------------------------------------------------------------------
def silabas(texto):
    return [x for x in re.findall(r"[^\W\d_]+", texto.lower())]


def revisar(numero, leccion, conocidas, avisos):
    for b in leccion['bloques']:
        if 'opciones' in b:
            buenas = sum(1 for o in b['opciones'] if o.get('correcta'))
            if buenas != 1 or len(b['opciones']) < 3:
                avisos.append(f'{numero}: «{b.get("pregunta") or b.get("frase")}»: {len(b["opciones"])} opciones, {buenas} buenas')
            textos = [o['texto'].lower() for o in b['opciones']]
            if len(set(textos)) != len(textos):
                avisos.append(f'{numero}: opciones repetidas en «{b.get("pregunta")}»')
        for f in b.get('frases', []):
            for trozo, _ in f.get('analisis', []):
                limpio = re.sub(r'[?!.]+$', '', trozo.lower())
                if limpio not in f['vi'].lower():
                    avisos.append(f'{numero}: el trozo «{trozo}» no está en «{f["vi"][:50]}»')
            faltan = [s for s in silabas(f['vi']) if s not in conocidas and len(s) > 1]
            # los nombres propios (con mayúscula en mitad de frase) no cuentan
            propios = {m.lower() for m in re.findall(r'(?<![.!?…:] )(?<!^)\b[A-ZĐÀ-Ỹ][\wà-ỹ]*', f['vi'])}
            faltan = [s for s in dict.fromkeys(faltan) if s not in propios]
            if faltan:
                avisos.append(f'{numero}: sin ficha: {", ".join(faltan)}  ← «{f["vi"][:60]}»')


def main():
    args = [int(a) for a in sys.argv[1:] if a.isdigit()]
    desde = args[0] if args else PRIMERA
    hasta = args[1] if len(args) > 1 else (args[0] if args else 999)
    # Sílabas que ya tienen ficha: las de las lecciones antiguas…
    conocidas = set()
    for f in sorted(LECCIONES.glob('[0-9]*.json')):
        if int(f.stem) < PRIMERA:
            for w in json.loads(f.read_text(encoding='utf-8-sig')).get('palabras', {}):
                conocidas.update(silabas(w))
    viejas = set(json.loads((AQUI / 'conocidas.json').read_text(encoding='utf-8')))
    todas_w = {}
    avisos, hechas, repes = [], 0, []
    for ruta in sorted((AQUI / 'fuente').glob('[0-9]*.txt')):
        numero = int(ruta.stem)
        try:
            leccion, av = leer_fuente(ruta)
        except Fallo as e:
            print('ERROR', e)
            continue
        for w in leccion.get('palabras', {}):
            if w.lower() in viejas:
                repes.append(w)  # no pasa nada: en esta lección manda la ficha nueva
            antes = todas_w.get(w.lower())
            if antes and numero != antes[0] and antes[1] == leccion['palabras'][w]['es']:
                av.append(f'{ruta.stem}: «{w}» ya se enseñó igual en la {antes[0]}')
            todas_w.setdefault(w.lower(), (numero, leccion['palabras'][w]['es']))
            conocidas.update(silabas(w))   # …y las de las lecciones nuevas, en orden
        if desde <= numero <= hasta:
            revisar(ruta.stem, leccion, conocidas, av)
            (LECCIONES / f'{ruta.stem}.json').write_text(json.dumps(leccion, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
            hechas += 1
            avisos += av

    # Capítulos: los 25 antiguos más los del temario.
    caps = [{'numero': c, 'titulo_vi': f'Chương {c}', 'titulo_es': f'Capítulo {c}'} for c in range(1, 26)]
    for linea in (AQUI / 'capitulos.txt').read_text(encoding='utf-8').splitlines():
        if linea.strip() and not linea.startswith('#'):
            c, vi, es, desc = [x.strip() for x in linea.split('|')]
            if list(LECCIONES.glob('[0-9]*.json')) and any(json.loads(f.read_text(encoding='utf-8')).get('capitulo') == int(c)
                                                           for f in LECCIONES.glob('[0-9]*.json') if int(f.stem) >= PRIMERA):
                caps.append({'numero': int(c), 'titulo_vi': vi, 'titulo_es': es, 'descripcion': desc})
    (LECCIONES / 'capitulos.json').write_text(json.dumps(caps, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')

    # Número de lecciones del curso en js/cursos.js
    total = len(list(LECCIONES.glob('[0-9]*.json')))
    cursos = RAIZ / 'Idiomas' / 'js' / 'cursos.js'
    t = cursos.read_text(encoding='utf-8')
    i = t.index('"id": "vi"')
    j = t.index('"lecciones":', i)
    t2 = t[:j] + re.sub(r'"lecciones": \d+', f'"lecciones": {total}', t[j:], count=1)
    if t2 != t:
        cursos.write_text(t2, encoding='utf-8', newline='\n')

    for a in avisos:
        print('AVISO', a)
    print(f'({len(repes)} palabras que ya estaban en 1-143) {hechas} lecciones compiladas, {len(avisos)} avisos, {len(todas_w)} palabras nuevas en total, curso con {total} lecciones')


if __name__ == '__main__':
    main()
