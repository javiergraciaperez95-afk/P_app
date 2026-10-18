"""Traduce al inglés (máquina, BETA) las explicaciones de los cursos antiguos, que vienen en español.

    python _herramientas/traducir_cursos_en.py                 # los 18 cursos
    python _herramientas/traducir_cursos_en.py fr de --prueba 3 --salida C:/tmp/prueba   # 3 lecciones, sin tocar Paglot

Motor: el modelo es→en de Argos (OPUS-MT) con CTranslate2, sin conexión. Modelo en ARGOS_MODELO (por defecto
%TEMP%/argos/translate-es_en-1_9). La compresión int8 da basura con este modelo: se usa float32.

Qué se traduce (formato antiguo, v1: el idioma que se estudia va bajo su código, el español bajo «es»):
- todo diccionario con «es» (significados, traducciones de frases y ejemplos): se AÑADE «en» y se deja el español;
- los textos de explicación (titulo, texto, pregunta, explicacion, traduccion, descripcion, consejo, nota, intro,
  tarea, literal, titulo_es): se SUSTITUYEN por el inglés (la interfaz solo está en inglés y vietnamita);
- las etiquetas del análisis ([palabra, «verbo (ir)»]) y las celdas de tablas y opciones que estén en español
  (se decide con los diccionarios del curso y del español).
Las palabras del idioma que se estudia se protegen: lo que va en **negrita**, «comillas» o "comillas" no se traduce.
En los índices (indice/lecciones.json, indice/diccionario.json) los nombres ya están en la forma interna de la app.
Lo traducido se guarda en una caché (se puede cortar y seguir). Español, vietnamita (va con español) e inglés no se tocan.
"""
import argparse
import codecs
import json
import os
import re
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
APP = RAIZ / 'Paglot'
CURSOS = ['fr', 'de', 'ja', 'it', 'ko', 'zh', 'pt', 'ru', 'tr', 'nl', 'sv', 'el', 'pl', 'no', 'id', 'da', 'ro', 'th']
NO_LATINOS = {'ja', 'zh', 'ko', 'ru', 'el', 'th'}
MODELO = Path(os.environ.get('ARGOS_MODELO', Path(os.environ.get('TEMP', '.')) / 'argos' / 'translate-es_en-1_9'))
CACHE = MODELO.parent / 'cache_es_en.json'

ESPANOL_PLANO = {'titulo', 'texto', 'pregunta', 'explicacion', 'traduccion', 'descripcion', 'consejo', 'nota', 'intro',
                 'tarea', 'literal', 'titulo_es', 'enunciado', 'pista'}
# términos de gramática que el modelo traduce mal (masculino → «male»): salen fijos
GLOSARIO = [(r'\bmasculin[oa]s?\b', 'masculine'), (r'\bfemenin[oa]s?\b', 'feminine'), (r'\bsingular(es)?\b', 'singular')]

leer = lambda p: json.loads(Path(p).read_text(encoding='utf-8-sig'))
escribir = lambda p, d: Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding='utf-8')

# ---------------------------------------------------------------- ¿está en español?
VOCAB_ES = set()
try:
    VOCAB_ES = {k.lower() for k in leer(APP / 'cursos' / 'es' / 'indice' / 'diccionario.json')}
except Exception:
    pass
VOCAB_ES |= set('el la los las un una unos unas de del al y o que en es son con por para no se su sus mi tu lo le me te nos muy más también esto este esta eso qué cómo cuándo dónde quién cuál'.split())
PALABRA = re.compile(r"[^\W\d_]+(?:['’][^\W\d_]+)?", re.U)
ESCRITURA = {'ja': r'[\u3040-\u30ff\u4e00-\u9fff]', 'zh': r'[\u4e00-\u9fff]', 'ko': r'[\uac00-\ud7af]', 'ru': r'[\u0400-\u04ff]',
             'el': r'[\u0370-\u03ff]', 'th': r'[\u0e00-\u0e7f]'}


def es_espanol(texto, curso, vocab_curso):
    if not isinstance(texto, str) or not texto.strip():
        return False
    if curso in NO_LATINOS and re.search(ESCRITURA[curso], texto):
        return False
    palabras = [p.lower() for p in PALABRA.findall(texto)]
    if not palabras:
        return False
    if re.search('[¿¡ñ]', texto):
        return True
    es = sum(p in VOCAB_ES for p in palabras) / len(palabras)
    if curso in NO_LATINOS:
        return es >= 0.5
    tg = sum(p in vocab_curso for p in palabras) / len(palabras)
    return es >= 0.6 and es > tg + 0.15


# ---------------------------------------------------------------- partir, proteger y volver a montar
PROTEGIDO = re.compile(r'\*\*.+?\*\*|«[^»]*»|"[^"]*"|`[^`]*`')


def preparar(frase, curso, vocab_curso, extra):
    """Sustituye lo protegido por ZQX0, ZQX1… Devuelve (texto con marcas, lista de lo protegido).
    Lo protegido que esté en español (p. ej. «decir u») se traduce aparte y se apunta en «extra»."""
    trozos = []
    def marca(m):
        s = m.group(0)
        dentro = s[2:-2] if s.startswith('**') else s[1:-1]
        if not s.startswith('**') and es_espanol(dentro, curso, vocab_curso) and (len(dentro.split()) > 1 or dentro.lower() not in vocab_curso):
            extra.add(dentro)
            trozos.append(('trad', s, dentro))
        else:
            trozos.append(('fijo', s, None))
        return f'ZQX{len(trozos) - 1}'
    texto = PROTEGIDO.sub(marca, frase)
    for patron, ingles in GLOSARIO:
        def g(m, ingles=ingles):
            trozos.append(('fijo', ingles, None))
            return f'ZQX{len(trozos) - 1}'
        texto = re.sub(patron, g, texto, flags=re.I)
    return texto, trozos


def partes(texto):
    """Divide un texto en líneas y frases (lo que se traduce de una en una). Devuelve [(prefijo, frase, sufijo)]."""
    salida = []
    for linea in texto.split('\n'):
        m = re.match(r'^(\s*(?:[-•*]\s+|\d+[.)]\s+)?)(.*?)(\s*)$', linea)
        pre, cuerpo, suf = m.group(1), m.group(2), m.group(3)
        frases = re.split(r'(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÑ¿¡«"*])', cuerpo) if cuerpo else ['']
        salida.append((pre, frases, suf))
    return salida


# ---------------------------------------------------------------- el motor
class Traductor:
    def __init__(self):
        import ctranslate2
        from subword_nmt.apply_bpe import BPE
        from sacremoses import MosesTokenizer, MosesDetokenizer
        self.tr = ctranslate2.Translator(str(MODELO / 'model'), device='cpu', compute_type='float32', intra_threads=os.cpu_count() or 4)
        self.bpe = BPE(codecs.open(str(MODELO / 'bpe.model'), encoding='utf-8'))
        self.tok = MosesTokenizer(lang='es')
        self.detok = MosesDetokenizer(lang='en')
        self.cache = leer(CACHE) if CACHE.exists() else {}

    def lote(self, frases):
        nuevas = [f for f in dict.fromkeys(frases) if f not in self.cache and f.strip()]
        inicio = time.time()
        for i in range(0, len(nuevas), 256):
            trozo = nuevas[i:i + 256]
            toks = [self.bpe.process_line(self.tok.tokenize(f, return_str=True, escape=False)).split() for f in trozo]
            res = self.tr.translate_batch(toks, beam_size=2, max_decoding_length=256, max_batch_size=64)
            for f, r in zip(trozo, res):
                self.cache[f] = self.detok.detokenize(' '.join(r.hypotheses[0]).replace('@@ ', '').replace('@@', '').split())
            hechas = i + len(trozo)
            if hechas % 2560 < 256 or hechas == len(nuevas):
                escribir(CACHE, self.cache)
                ritmo = hechas / max(time.time() - inicio, 1)
                print(f'   {hechas}/{len(nuevas)} frases · {ritmo:.0f}/s · faltan ~{(len(nuevas) - hechas) / max(ritmo, 1) / 60:.0f} min', flush=True)


# ---------------------------------------------------------------- recorrer los archivos
def recorrer(dato, curso, vocab, accion, interno=False, clave=None):
    """Va por todo el JSON y llama a accion(tipo, valor) en lo que hay que traducir; devuelve el JSON cambiado."""
    if isinstance(dato, dict):
        nuevo = {}
        for k, v in dato.items():
            if k in ('palabras',) and isinstance(v, dict):
                nuevo[k] = {p: recorrer(x, curso, vocab, accion, interno, '') for p, x in v.items()}
            elif k == 'es' and isinstance(v, str) and not interno:
                nuevo[k] = v
                ingles = accion('frase', v)
                if ingles and 'en' not in dato:
                    nuevo['en'] = ingles
            elif k == 'trad' and isinstance(v, dict) and isinstance(v.get('es'), str):
                nuevo[k] = dict(v)
                ingles = accion('frase', v['es'])
                if ingles and 'en' not in v:
                    nuevo[k]['en'] = ingles
            elif k == 'analisis' and isinstance(v, list):
                nuevo[k] = [[p[0], accion('frase', p[1]) or p[1], *p[2:]] if isinstance(p, list) and len(p) >= 2 and isinstance(p[1], str) else p for p in v]
            elif k in ('columnas', 'filas') or (k == 'texto' and clave == 'opciones'):
                nuevo[k] = recorrer(v, curso, vocab, lambda t, s: accion(t, s) if es_espanol(s, curso, vocab) else None, interno, 'celda') \
                    if k != 'texto' else (accion('plano', v) if es_espanol(v, curso, vocab) else v) or v
            elif k in ESPANOL_PLANO and not (interno and k == 'titulo_es'):
                if isinstance(v, str):
                    nuevo[k] = accion('plano', v) or v
                elif isinstance(v, list) and all(isinstance(x, str) for x in v):
                    nuevo[k] = [accion('plano', x) or x for x in v]
                else:
                    nuevo[k] = recorrer(v, curso, vocab, accion, interno, k)
            else:
                nuevo[k] = recorrer(v, curso, vocab, accion, interno, k)
        return nuevo
    if isinstance(dato, list):
        return [recorrer(x, curso, vocab, accion, interno, clave) for x in dato]
    if isinstance(dato, str) and clave == 'celda':
        return accion('plano', dato) or dato
    return dato


def archivos(curso, prueba):
    base = APP / 'cursos' / curso
    lecciones = sorted((base / 'lessons').glob('[0-9][0-9][0-9].json'))
    if prueba:
        lecciones = lecciones[:prueba]
        return [(f, False) for f in lecciones]
    otros = [(base / 'lessons' / 'capitulos.json', False), (base / 'phrases' / 'frases.json', False),
             (base / 'indice' / 'lecciones.json', True), (base / 'indice' / 'diccionario.json', True)]
    return [(f, False) for f in lecciones] + [(f, i) for f, i in otros if f.exists()]


def vocabulario(curso):
    vocab = set()
    try:
        vocab = {k.lower() for k in leer(APP / 'cursos' / curso / 'indice' / 'diccionario.json')}
    except Exception:
        pass
    return {w for k in vocab for w in PALABRA.findall(k)} | vocab


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cursos', nargs='*', default=CURSOS)
    ap.add_argument('--prueba', type=int, default=0)
    ap.add_argument('--salida', default='')
    args = ap.parse_args()
    motor = Traductor()
    for curso in args.cursos:
        vocab = vocabulario(curso)
        lista = archivos(curso, args.prueba)
        # 1) qué frases hay que traducir
        pendientes, extra = [], set()
        def recoger(tipo, s):
            for _, frases, _ in partes(s):
                for f in frases:
                    texto, _ = preparar(f, curso, vocab, extra)
                    if re.search('[^\\W\\d_]', texto.replace('ZQX', '')):
                        pendientes.append(texto)
            return None
        for f, interno in lista:
            recorrer(leer(f), curso, vocab, recoger, interno)
        pendientes += list(extra)
        print(f'{curso}: {len(lista)} archivos · {len(set(pendientes))} frases distintas', flush=True)
        # 2) traducirlas (lo que ya está en la caché no se repite)
        motor.lote(pendientes)
        # 3) montar el inglés y escribir
        fallos = [0]
        def traducir(tipo, s):
            lineas = []
            for pre, frases, suf in partes(s):
                hechas = []
                for f in frases:
                    texto, trozos = preparar(f, curso, vocab, set())
                    if not re.search('[^\\W\\d_]', texto.replace('ZQX', '')):
                        hechas.append(f)
                        continue
                    ingles = motor.cache.get(texto, '')
                    marcas = re.findall(r'ZQX(\d+)', ingles)
                    if sorted(map(int, marcas)) != list(range(len(trozos))):
                        fallos[0] += 1
                        hechas.append(f)  # no se fía: se deja en español
                        continue
                    def poner(m):
                        t, original, dentro = trozos[int(m.group(1))]
                        if t == 'trad':
                            abre, cierra = original[0], original[-1]
                            return f'{abre}{motor.cache.get(dentro, dentro)}{cierra}'
                        return original
                    hechas.append(re.sub(r'ZQX(\d+)', poner, ingles))
                lineas.append(pre + ' '.join(hechas) + suf)
            return '\n'.join(lineas)
        for f, interno in lista:
            nuevo = recorrer(leer(f), curso, vocab, traducir, interno)
            destino = Path(args.salida) / curso / f.relative_to(APP / 'cursos' / curso) if args.salida else f
            destino.parent.mkdir(parents=True, exist_ok=True)
            escribir(destino, nuevo)
        print(f'{curso}: hecho · {fallos[0]} frases se quedan en español (marcas perdidas)', flush=True)
    escribir(CACHE, motor.cache)
    print('Fin.')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
