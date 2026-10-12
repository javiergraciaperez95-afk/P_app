# Genera con Piper los audios de los cursos de la app única (todos menos el de español, que usa generar.py)
# y los deja en Idiomas/cursos/<id>/audio/ como MP3, con el índice que consulta la app.
#
# Uso:  python generar_apps.py                → todas las apps de la lista
#       python generar_apps.py fr de           → solo esos cursos
# Descarga las voces que falten. Lo que ya está generado no se repite.
import json, re, subprocess, sys, urllib.parse, urllib.request, wave
from pathlib import Path

import numpy as np

from generar import a_mp3, clave, normalizar, PIPER

AQUI = Path(__file__).parent
RAIZ = AQUI.parent
CURSOS = RAIZ / 'Idiomas' / 'cursos'
VOCES = AQUI / 'voces'
BASE = 'https://huggingface.co/rhasspy/piper-voices/resolve/main'
RITMO = '1.12'

# Voz principal (la de la tutora) y segunda voz (el otro personaje de los diálogos), con su licencia.
# Hablante: un número, None (voz de un solo hablante) o 'm' / 'f' para elegirlo por lo grave o agudo que suena.
APPS = {
    'da': dict(voz=('da_DK-talesyntese-medium', None), licencia='CC0'),
    'nl': dict(voz=('nl_NL-mls-medium', 0), otra=('nl_NL-mls-medium', 'otro'), licencia='CC BY 4.0'),
    'en': dict(voz=('en_GB-cori-medium', None), otra=('en_GB-vctk-medium', 'm'), licencia='dominio público / CC BY 4.0'),
    'fr': dict(voz=('fr_FR-siwis-medium', None), otra=('fr_FR-mls-medium', 'm'), licencia='CC BY 4.0'),
    'de': dict(voz=('de_DE-thorsten-medium', None), otra=('de_DE-mls-medium', 'f'), licencia='CC0 / CC BY 4.0'),
    'el': dict(voz=('el_GR-rapunzelina-medium', None), licencia='CC0'),
    'it': dict(voz=('it_IT-serena-medium', None), licencia='CC BY 4.0'),
    'no': dict(voz=('no_NO-talesyntese-medium', None), otra=('no_NO-nvcc-medium', 'otro'), licencia='CC0'),
    'pl': dict(voz=('pl_PL-gosia-medium', None), otra=('pl_PL-darkman-medium', None), licencia='CC0'),
    'pt': dict(voz=('pt_PT-tugão-medium', None), licencia='CC0'),
    'ro': dict(voz=('ro_RO-mihai-medium', None), licencia='CC0'),
    'ru': dict(voz=('ru_RU-denis-medium', None), otra=('ru_RU-dmitri-medium', None), licencia='CC0'),
    'sv': dict(voz=('sv_SE-nst-medium', None), licencia='CC0'),
    'vi': dict(voz=('vi_VN-vais1000-medium', None), licencia='CC BY 4.0'),
}
PRUEBA = {'da': 'Hej, hvordan har du det?', 'nl': 'Hallo, hoe gaat het?', 'en': 'Hello, how are you today?', 'fr': 'Bonjour, comment ça va ?',
          'de': 'Hallo, wie geht es dir?', 'no': 'Hei, hvordan har du det?', 'pl': 'Cześć, jak się masz?'}


def modelo(voz):
    """Ruta del modelo, descargándolo si falta. Los nombres con tilde se guardan sin ella (Piper no los abre)."""
    limpio = voz.replace('ã', 'a')
    codigo, nombre, calidad = voz.split('-')
    for ext in ('.onnx', '.onnx.json'):
        destino = VOCES / (limpio + ext)
        if not destino.exists() or destino.stat().st_size < 1000:
            url = f'{BASE}/{codigo.split("_")[0]}/{codigo}/{urllib.parse.quote(nombre)}/{calidad}/{urllib.parse.quote(voz)}{ext}'
            urllib.request.urlretrieve(url, destino)
    return VOCES / (limpio + '.onnx')


def piper(voz, pedidos):
    """pedidos: lista de (texto, hablante, wav)."""
    entrada = ''
    for texto, hablante, wav in pedidos:
        d = {'text': texto, 'output_file': str(wav)}
        if hablante is not None:
            d['speaker_id'] = hablante
        entrada += json.dumps(d, ensure_ascii=False) + '\n'
    r = subprocess.run([str(PIPER), '-m', str(modelo(voz)), '--json-input', '--length_scale', RITMO, '--sentence_silence', '0.25'],
                       input=entrada.encode('utf-8'), capture_output=True)
    if r.returncode:
        # Las voces más recientes no las abre el Piper antiguo: se usa el nuevo (pip install piper-tts).
        from piper import PiperVoice, SynthesisConfig
        v = PiperVoice.load(str(modelo(voz)))
        for texto, hablante, wav in pedidos:
            with wave.open(str(wav), 'wb') as w:
                v.synthesize_wav(texto, w, syn_config=SynthesisConfig(length_scale=float(RITMO), speaker_id=hablante))


def tono(wav):
    """Altura media de la voz en Hz (grave ≈ hombre, aguda ≈ mujer)."""
    with wave.open(str(wav), 'rb') as w:
        fs = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
    alturas = []
    for i in range(0, len(x) - 2048, 1024):
        t = x[i:i + 2048] - x[i:i + 2048].mean()
        if np.sqrt((t ** 2).mean()) < 500:
            continue
        ac = np.correlate(t, t, 'full')[2047:]
        lo, hi = fs // 400, fs // 70
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.3 * ac[0]:
            alturas.append(fs / k)
    return float(np.median(alturas)) if alturas else 0.0


def elegir_hablante(voz, quiero, frase, tono_principal):
    """Prueba los primeros hablantes de una voz múltiple y devuelve el primero grave ('m') o agudo ('f')."""
    if quiero == 'otro':
        quiero = 'm' if tono_principal > 165 else 'f'
    cfg = json.loads(modelo(voz).with_suffix('.onnx.json').read_text(encoding='utf-8'))
    n = min(cfg.get('num_speakers', 1), 14)
    pruebas = [(frase, i, AQUI / f'_prueba_{i}.wav') for i in range(n)]
    piper(voz, pruebas)
    medidas = [(i, tono(w)) for _, i, w in pruebas]
    for _, _, w in pruebas:
        w.unlink(missing_ok=True)
    buenos = [i for i, hz in medidas if (90 < hz < 145 if quiero == 'm' else 175 < hz < 290)]
    return (buenos[0] if buenos else None), quiero, medidas


def textos_de(app):
    campo = 'ind' if app == 'id' else app  # la clave del texto del idioma en los archivos del curso
    todos, dialogo = set(), set()

    def vale(t):
        return len(t) > 0 and '_' not in t and any(c.isalpha() for c in t)

    def andar(o, k=''):
        if isinstance(o, dict):
            if 'quien' in o and isinstance(o.get(campo), str):
                dialogo.add(normalizar(o[campo]))
            # Ordenar: se oye la frase. Huecos con «audio»: true: se oye la frase con la respuesta buena en su sitio.
            if o.get('tipo') == 'ordenar' and isinstance(o.get('frase'), str):
                todos.add(normalizar(o['frase']))
            if o.get('tipo') == 'huecos' and o.get('audio') is True and isinstance(o.get('frase'), str):
                buena = next((x.get('texto') for x in o.get('opciones', []) if isinstance(x, dict) and x.get('correcta')), None)
                if isinstance(buena, str):
                    entera = re.sub(r'\s+', ' ', re.sub(r'_{2,}', buena, re.sub(r'\s*\([^)]*\)', '', o['frase']))).strip()
                    if vale(entera):
                        todos.add(normalizar(entera))
            for a, b in o.items():
                if a == 'palabras' and isinstance(b, dict):
                    todos.update(normalizar(p) for p in b if vale(p))
                andar(b, a)
        elif isinstance(o, list):
            for x in o:
                andar(x, k)
        elif isinstance(o, str) and k in (campo, 'audio', 'palabras') and vale(o):
            todos.add(normalizar(o))

    for carpeta in ('lessons', 'phrases'):
        for f in sorted((CURSOS / app / carpeta).glob('*.json')):
            andar(json.loads(f.read_text(encoding='utf-8')))
    return todos, dialogo & todos


def generar(app):
    cfg = APPS[app]
    todos, dialogo = textos_de(app)
    salida = CURSOS / app / 'audio'
    salida.mkdir(exist_ok=True)
    voz, hablante = cfg['voz']
    nota = ''

    faltan = [(t, hablante, salida / f'{clave(t)}.wav') for t in sorted(todos) if not (salida / f'{clave(t)}.mp3').exists()]
    if faltan:
        piper(voz, faltan)
        for _, _, w in faltan:
            a_mp3(w, w.with_suffix('.mp3'))

    if cfg.get('otra') and dialogo:
        voz2, hablante2 = cfg['otra']
        if isinstance(hablante2, str):
            idioma = voz.split('_')[0]
            muestra = AQUI / '_principal.wav'
            piper(voz, [(PRUEBA[idioma], hablante, muestra)])
            hz = tono(muestra)
            muestra.unlink(missing_ok=True)
            hablante2, quiero, medidas = elegir_hablante(voz2, hablante2, PRUEBA[idioma], hz)
            nota = f' principal {hz:.0f} Hz; segunda voz ({quiero}) hablante {hablante2}'
        if hablante2 is not None or not isinstance(cfg['otra'][1], str):
            faltan2 = [(t, hablante2, salida / f'{clave(t)}-m.wav') for t in sorted(dialogo) if not (salida / f'{clave(t)}-m.mp3').exists()]
            if faltan2:
                piper(voz2, faltan2)
                for _, _, w in faltan2:
                    a_mp3(w, w.with_suffix('.mp3'))

    indice = {'f': sorted(p.stem for p in salida.glob('*.mp3') if not p.stem.endswith('-m')),
              'm': sorted(p.stem[:-2] for p in salida.glob('*-m.mp3'))}
    (salida / 'indice.json').write_text(json.dumps(indice, separators=(',', ':')), encoding='utf-8')
    peso = sum(p.stat().st_size for p in salida.glob('*.mp3')) / 1024
    print(f'{app:11} {len(indice["f"]):5} audios + {len(indice["m"]):3} de segunda voz, {peso:6.0f} KB.{nota}', flush=True)


if __name__ == '__main__':
    for app in sys.argv[1:] or APPS:
        try:
            generar(app)
        except Exception as e:
            print(f'{app:11} FALLO: {type(e).__name__}: {e}'[:230], flush=True)
