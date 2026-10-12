# Genera muestras de voz de Piper para oír cómo suena cada idioma: un «hola», una frase corta
# y, en español, dos frases largas. Las deja en la carpeta «Muestras de voz» de la raíz.
# Descarga la voz de cada idioma si no está ya en voces/.
import json, subprocess, sys, urllib.parse, urllib.request
from pathlib import Path

from generar import a_mp3, PIPER

AQUI = Path(__file__).parent
VOCES = AQUI / 'voces'
SALIDA = AQUI.parent / 'Muestras de voz'
BASE = 'https://huggingface.co/rhasspy/piper-voices/resolve/main'

# app, voz de Piper, hablante (si la voz trae varios), hola, frase corta
IDIOMAS = [
    ('Chinese', 'zh_CN-huayan-medium', None, '你好', '你好！你好吗？很高兴认识你。'),
    ('Danish', 'da_DK-talesyntese-medium', None, 'Hej', 'Hej! Hvordan har du det? Rart at møde dig.'),
    ('Dutch', 'nl_NL-mls-medium', None, 'Hallo', 'Hallo! Hoe gaat het met je? Leuk je te ontmoeten.'),
    ('English', 'en_US-amy-medium', None, 'Hello', 'Hello! How are you? Nice to meet you.'),
    ('French', 'fr_FR-siwis-medium', None, 'Bonjour', 'Bonjour ! Comment ça va ? Enchanté de faire ta connaissance.'),
    ('German', 'de_DE-thorsten-medium', None, 'Hallo', 'Hallo! Wie geht es dir? Schön, dich kennenzulernen.'),
    ('Greek', 'el_GR-rapunzelina-medium', None, 'Γεια σου', 'Γεια σου! Τι κάνεις; Χαίρω πολύ.'),
    ('Indonesian', 'id_ID-news_tts-medium', None, 'Halo', 'Halo! Apa kabar? Senang bertemu denganmu.'),
    ('Italian', 'it_IT-paola-medium', None, 'Ciao', 'Ciao! Come stai? Piacere di conoscerti.'),
    ('Japanese', 'ja_JP-hi_fi_captain-medium', None, 'こんにちは', 'こんにちは！お元気ですか？はじめまして。'),
    ('Korean', 'ko_KR-kss-medium', None, '안녕하세요', '안녕하세요! 잘 지내세요? 만나서 반갑습니다.'),
    ('Norwegian', 'no_NO-talesyntese-medium', None, 'Hei', 'Hei! Hvordan har du det? Hyggelig å møte deg.'),
    ('Polish', 'pl_PL-gosia-medium', None, 'Cześć', 'Cześć! Jak się masz? Miło cię poznać.'),
    ('Portuguese', 'pt_PT-tugão-medium', None, 'Olá', 'Olá! Como estás? Prazer em conhecer-te.'),
    ('Romanian', 'ro_RO-mihai-medium', None, 'Bună', 'Bună! Ce mai faci? Îmi pare bine să te cunosc.'),
    ('Russian', 'ru_RU-irina-medium', None, 'Привет', 'Привет! Как дела? Приятно познакомиться.'),
    ('Spanish', 'es_ES-sharvard-medium', 1, 'Hola', '¡Hola! ¿Qué tal estás? Encantada de conocerte.'),
    ('Swedish', 'sv_SE-lisa-medium', None, 'Hej', 'Hej! Hur mår du? Trevligt att träffas.'),
    ('Thai', 'th_TH-tsync2-medium', None, 'สวัสดี', 'สวัสดีค่ะ สบายดีไหมคะ ยินดีที่ได้รู้จักค่ะ'),
    ('Turkish', 'tr_TR-dfki-medium', None, 'Merhaba', 'Merhaba! Nasılsın? Tanıştığımıza memnun oldum.'),
    ('Vietnamese', 'vi_VN-vais1000-medium', None, 'Xin chào', 'Xin chào! Bạn khỏe không? Rất vui được gặp bạn.'),
]
LARGAS = [
    ('Spanish - frase larga normal', 'Cuando era pequeña, mi abuela me contaba cada noche historias increíbles sobre un pueblo perdido entre montañas, '
     'donde los vecinos se reunían en la plaza para cantar, bailar y compartir la cena.'),
    ('Spanish - frase larga con trampas', 'El jueves 23 de octubre de 2026, a las 18:45, la doctora Íñiguez explicó en la UNED que el 37,5 % de los pingüinos '
     'de la Antártida prefiere un wifi rápido antes que un buen jamón ibérico.'),
]


def descargar(voz):
    codigo, nombre, calidad = voz.split('-')
    for ext in ('.onnx', '.onnx.json'):
        destino = VOCES / (voz + ext)
        if destino.exists() and destino.stat().st_size > 1000:
            continue
        url = f'{BASE}/{codigo.split("_")[0]}/{codigo}/{urllib.parse.quote(nombre)}/{calidad}/{urllib.parse.quote(voz)}{ext}'
        urllib.request.urlretrieve(url, destino)
    tarjeta = VOCES / f'{voz}-MODEL_CARD.txt'
    if not tarjeta.exists():
        try:
            urllib.request.urlretrieve(f'{BASE}/{codigo.split("_")[0]}/{codigo}/{urllib.parse.quote(nombre)}/{calidad}/MODEL_CARD', tarjeta)
        except Exception:
            pass


def hablar(voz, hablante, pedidos):
    """pedidos: lista de (texto, archivo mp3). Devuelve el error, o None si fue bien."""
    entrada = ''
    for texto, mp3 in pedidos:
        d = {'text': texto, 'output_file': str(mp3.with_suffix('.wav'))}
        if hablante is not None:
            d['speaker_id'] = hablante
        entrada += json.dumps(d, ensure_ascii=False) + '\n'
    r = subprocess.run([str(PIPER), '-m', str(VOCES / (voz + '.onnx')), '--json-input'], input=entrada.encode('utf-8'), capture_output=True)
    if r.returncode:
        return r.stderr.decode('utf-8', 'replace').strip().splitlines()[-1][:160]
    for _, mp3 in pedidos:
        wav = mp3.with_suffix('.wav')
        if not wav.exists() or wav.stat().st_size < 2000:
            return 'no ha generado audio'
        a_mp3(wav, mp3)
    return None


def main():
    SALIDA.mkdir(exist_ok=True)
    solo = set(sys.argv[1:])
    for app, voz, hablante, hola, frase in IDIOMAS:
        if solo and app not in solo:
            continue
        try:
            descargar(voz)
            error = hablar(voz, hablante, [(hola, SALIDA / f'{app} - hola.mp3'), (frase, SALIDA / f'{app} - frase.mp3')])
        except Exception as e:
            error = f'{type(e).__name__}: {e}'[:160]
        print(f'{app:11} {voz:28} {"OK" if not error else "FALLO: " + error}', flush=True)

    if not solo or 'Spanish' in solo:
        print('largas:', hablar('es_ES-sharvard-medium', 1, [(t, SALIDA / f'{n}.mp3') for n, t in LARGAS]) or 'OK')


if __name__ == '__main__':
    main()
