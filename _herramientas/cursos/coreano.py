# -*- coding: utf-8 -*-
"""Ayudas del compilador para el curso de coreano.

pron('학교에')  → 'hak-kyo-e'   pronunciación aproximada, con los cambios de sonido habituales
partir('학교에', conocidas) → ('학교', '에', 'a, en')   palabra conocida + partícula

La pronunciación sigue la romanización oficial con tres cambios pensados para quien habla español:
ㅓ = ŏ y ㅡ = ŭ (en vez de «eo» y «eu», que se leerían como dos vocales), ㅐ y ㅔ = e, y 시 = shi.
"""

INICIALES = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
VOCALES = ['a', 'e', 'ya', 'ye', 'ŏ', 'e', 'yŏ', 'ye', 'o', 'wa', 'we', 'we', 'yo', 'u', 'wŏ', 'we', 'wi', 'yu', 'ŭ', 'ŭi', 'i']
FINALES = ['', 'ㄱ', 'ㄲ', 'ㄱㅅ', 'ㄴ', 'ㄴㅈ', 'ㄴㅎ', 'ㄷ', 'ㄹ', 'ㄹㄱ', 'ㄹㅁ', 'ㄹㅂ', 'ㄹㅅ', 'ㄹㅌ', 'ㄹㅍ', 'ㄹㅎ', 'ㅁ', 'ㅂ', 'ㅂㅅ',
           'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
LETRA = {'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt', 'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's', 'ㅆ': 'ss',
         'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'}
# Cómo suena una consonante al final de sílaba.
CIERRE = {'ㄱ': 'k', 'ㄲ': 'k', 'ㅋ': 'k', 'ㄱㅅ': 'k', 'ㄹㄱ': 'k', 'ㄴ': 'n', 'ㄴㅈ': 'n', 'ㄴㅎ': 'n',
          'ㄷ': 't', 'ㅅ': 't', 'ㅆ': 't', 'ㅈ': 't', 'ㅊ': 't', 'ㅌ': 't', 'ㅎ': 't',
          'ㄹ': 'l', 'ㄹㅂ': 'l', 'ㄹㅅ': 'l', 'ㄹㅌ': 'l', 'ㄹㅎ': 'l', 'ㅁ': 'm', 'ㄹㅁ': 'm',
          'ㅂ': 'p', 'ㅍ': 'p', 'ㅂㅅ': 'p', 'ㄹㅍ': 'p', 'ㅇ': 'ng'}
ASPIRADA = {'ㄱ': 'ㅋ', 'ㄷ': 'ㅌ', 'ㅈ': 'ㅊ', 'ㅂ': 'ㅍ'}
SORDA = {'ㄱ': 'k', 'ㄷ': 't', 'ㅂ': 'p'}


def es_hangul(c):
    return '가' <= c <= '힣'


def _palabra(texto):
    """Una palabra (sin espacios) → lista de sílabas romanizadas, o el texto tal cual si no es hangul."""
    sil = []
    for c in texto:
        if es_hangul(c):
            n = ord(c) - 0xAC00
            sil.append({'ini': INICIALES[n // 588], 'voc': (n % 588) // 28, 'fin': FINALES[n % 28], 'son': None, 'sorda': False})
        else:
            sil.append({'otro': c})
    for a, b in zip(sil, sil[1:]):
        if 'otro' in a or 'otro' in b or not a['fin']:
            continue
        f = a['fin']
        if b['ini'] == 'ㅇ':  # la consonante final pasa a la sílaba siguiente
            if f == 'ㅇ':
                continue
            if f == 'ㅎ':
                a['fin'] = ''
            elif len(f) == 2 and f[1] == 'ㅎ':
                a['fin'], b['ini'] = '', f[0]
            elif len(f) == 2:
                a['fin'], b['ini'] = f[0], f[1]
            else:
                if VOCALES[b['voc']] == 'i' and f in 'ㄷㅌ':
                    f = 'ㅈ' if f == 'ㄷ' else 'ㅊ'
                a['fin'], b['ini'] = '', f
            continue
        if f[-1] == 'ㅎ':
            if b['ini'] in 'ㄱㄷㅈ':
                a['fin'], b['ini'] = f[:-1], ASPIRADA[b['ini']]
                continue
            if b['ini'] == 'ㅅ':
                a['fin'], b['ini'] = f[:-1], 'ㅆ'
                continue
        cierre = CIERRE[f]
        if b['ini'] == 'ㅎ' and cierre in 'ktp':
            b['ini'] = 'ㅊ' if f in ('ㅈ', 'ㄴㅈ') else {'k': 'ㅋ', 't': 'ㅌ', 'p': 'ㅍ'}[cierre]
            a['fin'] = f[0] if len(f) == 2 and f[0] in 'ㄴㄹ' else ''
            continue
        if b['ini'] in 'ㄴㅁ':
            cierre = {'k': 'ng', 't': 'n', 'p': 'm'}.get(cierre, cierre)
            if cierre == 'l' and b['ini'] == 'ㄴ':
                b['ini'] = 'ㄹ'
        elif b['ini'] == 'ㄹ':
            if cierre == 'n':
                cierre = 'l'
            elif cierre != 'l':
                cierre = {'k': 'ng', 't': 'n', 'p': 'm'}.get(cierre, cierre)
                b['ini'] = 'ㄴ'
        elif cierre in 'ktp' and b['ini'] in SORDA:
            b['sorda'] = True
        elif cierre == 't' and b['ini'] == 'ㅅ':  # 있습니다 → i-ssŭm-ni-da
            cierre, b['ini'] = '', 'ㅆ'
        a['son'] = cierre
    salida, antes = [], None
    for s in sil:
        if 'otro' in s:
            salida.append(s['otro'])
            antes = None
            continue
        v = VOCALES[s['voc']]
        ini = s['ini']
        if ini == 'ㅅ' and (v == 'i' or v == 'wi' or v[0] == 'y'):
            c, v = 'sh', (v[1:] if v[0] == 'y' else v)
        elif ini == 'ㄹ' and antes == 'l':
            c = 'l'
        elif ini in 'ㅈㅉㅊ' and v[0] == 'y':  # 쳐 suena «chŏ», no «chyŏ»
            c, v = LETRA[ini], v[1:]
        elif s['sorda']:
            c = SORDA[ini]
        else:
            c = LETRA[ini]
        fin = s['son'] if s['son'] is not None else (CIERRE[s['fin']] if s['fin'] else '')
        salida.append(c + v + fin)
        antes = fin
    return salida


# Palabras que no se dicen como se escriben: se reescriben tal como suenan antes de romanizar.
SUENA = [('지하철역', '지하철력'), ('서울역', '서울력'), ('편의점', '펴니점'), ('스물여', '스물려'), ('맛없', '마덦'), ('흰', '힌'), ('십육', '심뉵')]


def pron(texto):
    """Pronunciación aproximada de un texto en hangul; las sílabas van separadas con guiones."""
    palabras = []
    for a, b in SUENA:
        texto = texto.replace(a, b)
    for p in texto.split():
        trozos, grupo = [], []
        for s, c in zip(_palabra(p), p):
            if es_hangul(c):
                grupo.append(s)
            else:
                if grupo:
                    trozos.append('-'.join(grupo))
                    grupo = []
                trozos.append(s)
        if grupo:
            trozos.append('-'.join(grupo))
        palabras.append(''.join(trozos))
    return ' '.join(palabras)


# Partículas que van pegadas a la palabra: (partícula, qué indica, cuándo: 'c' tras consonante, 'v' tras vocal, '' siempre).
PARTICULAS = [
    ('은', 'tema', 'c'), ('는', 'tema', 'v'), ('이', 'sujeto', 'c'), ('가', 'sujeto', 'v'), ('을', 'objeto', 'c'), ('를', 'objeto', 'v'),
    ('에', 'a, en', ''), ('에서', 'en, desde un lugar', ''), ('도', 'también', ''), ('의', 'de', ''), ('만', 'solo', ''),
    ('하고', 'y, con', ''), ('와', 'y, con', 'v'), ('과', 'y, con', 'c'), ('랑', 'y, con', 'v'), ('이랑', 'y, con', 'c'),
    ('로', 'hacia; con, en', 'vl'), ('으로', 'hacia; con, en', 'c'), ('부터', 'desde', ''), ('까지', 'hasta', ''),
    ('에게', 'a alguien', ''), ('한테', 'a alguien', ''), ('보다', 'que, al comparar', ''), ('마다', 'cada', ''), ('쯤', 'más o menos', ''),
    ('에는', 'a, en; tema', ''), ('에도', 'a, en; también', ''), ('에서는', 'en; tema', ''), ('에서도', 'en; también', ''),
    ('이에요', 'es', 'c'), ('예요', 'es', 'v'), ('입니다', 'es, formal', ''), ('입니까', '¿es?, formal', ''),
    ('이었어요', 'era, fue', 'c'), ('였어요', 'era, fue', 'v'),
]
PARTICULAS.sort(key=lambda p: -len(p[0]))


def partir(palabra, conocida):
    """Si la palabra es «conocida + partícula», devuelve (base, partícula, glosa). conocida(base) dice si hay ficha."""
    for part, glosa, cuando in PARTICULAS:
        base = palabra[:-len(part)]
        if not base or not palabra.endswith(part) or not es_hangul(base[-1]) or not conocida(base):
            continue
        fin = FINALES[(ord(base[-1]) - 0xAC00) % 28]
        if cuando == 'c' and not fin:
            continue
        if cuando == 'v' and fin:
            continue
        if cuando == 'vl' and fin and fin != 'ㄹ':
            continue
        if cuando == 'c' and part == '으로' and fin == 'ㄹ':
            continue
        return base, part, glosa
    return None


def pron_con_particula(palabra, part):
    """La partícula 의 se pronuncia «e»."""
    if part == '의':
        return pron(palabra[:-1]) + '-e'
    return pron(palabra)


if __name__ == '__main__':
    import sys
    for w in sys.argv[1:] or ['안녕하세요', '감사합니다', '한국어', '학교에', '있어요', '없어요', '좋아요', '좋아해요', '괜찮아요', '어떻게',
                             '같이', '읽어요', '많아요', '싫어요', '못해요', '축하해요', '반갑습니다', '한국말', '십이', '여덟', '설날', '음료수',
                             '식당', '숙제', '맛있어요', '꽃이', '옷이', '앉으세요', '시', '쉬어요', '일어나요', '몰라요', '빨리', '연락', '입구',
                             '저는 학생이에요', '뭐 해요?', '백화점', '영어', '고기', '여기', '책상', '먹고', '닭', '값이', '끝나요', '놓아요']:
        print(w, '→', pron(w))
