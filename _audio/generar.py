# Genera los audios en español de las lecciones con Piper (voz artificial que funciona en este ordenador)
# y los deja en Idiomas/cursos/es/audio/ como MP3, con un índice que la app consulta.
#
# Uso:  python generar.py 1            → la lección 1
#       python generar.py 1 7          → de la 1 a la 7
# Lo que ya está generado no se repite.
import hashlib, json, subprocess, sys, unicodedata, wave
from pathlib import Path

import lameenc

AQUI = Path(__file__).parent
APP = AQUI.parent / 'Idiomas' / 'cursos' / 'es'
SALIDA = APP / 'audio'
PIPER = AQUI / 'piper' / 'piper.exe'
MODELO = AQUI / 'voces' / 'es_ES-sharvard-medium.onnx'   # licencia CC BY 3.0 (hay que citarla en los créditos)
VOCES = {'f': 1, 'm': 0}                                 # f: voz de la tutora; m: segunda voz para los diálogos
RITMO = '1.12'                                           # algo más despacio que el natural, para quien aprende

# Campos de las lecciones y de los juegos que llevan texto en español que la app puede leer en voz alta.
CAMPOS = {'titulo_es', 'es', 'analisis', 'palabras', 'correcta', 'frase', 'respuestas', 'distractores', 'escucha', 'palabra'}
EXTRA = ['¡Hola! ¿Qué tal estás?']                        # la frase de prueba de Ajustes


def normalizar(texto):
    return ' '.join(unicodedata.normalize('NFC', texto).split())


def clave(texto):
    """La misma cuenta que hace js/sonidos.js para saber qué archivo le toca a cada texto."""
    datos = normalizar(texto).encode('utf-8')
    partes = []
    for semilla in (0x811C9DC5, 0x01000193):
        h = semilla
        for b in datos:
            h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
        partes.append(f'{h:08x}')
    return ''.join(partes)


def textos_de(ruta):
    """Devuelve (todos los textos, los que son líneas de diálogo)."""
    todos, dialogo = set(), set()

    def andar(o, campo=''):
        if isinstance(o, dict):
            if 'quien' in o and isinstance(o.get('es'), str):
                dialogo.add(normalizar(o['es']))
            for k, v in o.items():
                andar(v, k)
        elif isinstance(o, list):
            for x in o:
                andar(x, campo)
        elif isinstance(o, str) and campo in CAMPOS:
            t = normalizar(o)
            if len(t) > 1 and '{' not in t and any(c.isalpha() for c in t):
                todos.add(t)

    if ruta.exists():
        andar(json.loads(ruta.read_text(encoding='utf-8')))
    return todos, dialogo


def a_mp3(wav, mp3):
    with wave.open(str(wav), 'rb') as w:
        cod = lameenc.Encoder()
        cod.set_bit_rate(48)
        cod.set_in_sample_rate(w.getframerate())
        cod.set_channels(w.getnchannels())
        cod.set_quality(2)
        mp3.write_bytes(cod.encode(w.readframes(w.getnframes())) + cod.flush())
    wav.unlink()


def main():
    nums = [int(a) for a in sys.argv[1:]] or [1]
    desde, hasta = nums[0], nums[-1]
    todos, dialogo = set(EXTRA), set()
    for n in range(desde, hasta + 1):
        for carpeta in ('lessons', 'juegos'):
            t, d = textos_de(APP / carpeta / f'{n:03d}.json')
            todos |= t
            dialogo |= d

    SALIDA.mkdir(exist_ok=True)
    pedidos = []
    for voz, textos in (('f', todos), ('m', dialogo)):
        for t in sorted(textos):
            destino = SALIDA / f'{clave(t)}{"-m" if voz == "m" else ""}.mp3'
            if not destino.exists():
                pedidos.append((t, voz, destino))

    if pedidos:
        entrada = '\n'.join(json.dumps({'text': t, 'speaker_id': VOCES[v], 'output_file': str(d.with_suffix('.wav'))}, ensure_ascii=False)
                            for t, v, d in pedidos) + '\n'
        r = subprocess.run([str(PIPER), '-m', str(MODELO), '--json-input', '--length_scale', RITMO, '--sentence_silence', '0.25'],
                           input=entrada.encode('utf-8'), capture_output=True)
        if r.returncode:
            sys.exit(r.stderr.decode('utf-8', 'replace')[-800:])
        for _, _, d in pedidos:
            a_mp3(d.with_suffix('.wav'), d)

    indice = {'f': sorted(p.stem for p in SALIDA.glob('*.mp3') if not p.stem.endswith('-m')),
              'm': sorted(p.stem[:-2] for p in SALIDA.glob('*-m.mp3'))}
    (SALIDA / 'indice.json').write_text(json.dumps(indice, separators=(',', ':')), encoding='utf-8')
    peso = sum(p.stat().st_size for p in SALIDA.glob('*.mp3'))
    print(f'Lecciones {desde}-{hasta}: {len(todos)} textos, {len(dialogo)} de diálogo. Nuevos: {len(pedidos)}. '
          f'En total {len(indice["f"]) + len(indice["m"])} audios, {peso / 1024:.0f} KB.')


if __name__ == '__main__':
    main()
