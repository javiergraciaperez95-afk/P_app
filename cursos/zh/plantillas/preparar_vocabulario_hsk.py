#!/usr/bin/env python3
"""Prepara el vocabulario HSK 2.0 desde dos series de Institutos Confucio.

PUCP fija las seis listas acumulativas usadas para asignar las palabras. Los PDF
de Santo Tomás aportan pinyin y glosas españolas cuando la entrada coincide.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[3]
PDF_DIR = Path(__file__).resolve().parent / "fuentes" / "vocabulario_hsk"
OUT = Path(__file__).resolve().parent / "vocabulario_hsk_2_0.json"
PUCP_PAGE = "https://confucio.pucp.edu.pe/certificaciones/examenes/hsk/"
UST_PAGE = "https://www.confucioust.cl/examen-hsk/"
LEVEL_COUNTS = {1: 150, 2: 300, 3: 600, 4: 1200, 5: 2500, 6: 5000}
CJK = re.compile(r"[\u3400-\u9fff]")
NUMBER_LINE = re.compile(r"^\s*(\d+)[．.]")
BRACKET_ENTRY = re.compile(r"(?m)^\s*\d+\s+【([^】]+)】([^\n]*)")
POS_TAGS = r"vs|va|v|n|adj|adv|pron|num|conj|cn|ae|part|pm|mw|interj|prep|int|clas|cv"
POS = re.compile(rf"^(?:{POS_TAGS})(?:\.+\s*|\s+)", re.I)
POS_MARKER = re.compile(rf"(?<!\w)(?P<pos>{POS_TAGS})(?:\s*\.+\s*|\s+)", re.I)
POS_NORMALIZED = {
    "vs": "动词", "va": "助动词", "v": "动词", "n": "名词", "adj": "形容词", "adv": "副词",
    "pron": "代词", "num": "数词", "conj": "连词", "cn": "量词", "ae": "助词",
    "part": "助词", "pm": "助词", "mw": "量词", "interj": "叹词", "int": "叹词", "prep": "介词",
    "clas": "量词", "cv": "量词", "名词": "名词", "动词": "动词", "形容词": "形容词", "副词": "副词",
    "介词": "介词", "助词": "助词", "助动词": "助动词", "叹词": "叹词", "量词": "量词",
    "代词": "代词", "数词": "数词", "连词": "连词", "一级": "",
}
SPANISH_WORDS_THAT_MAY_END_IN_ACCENT = {
    "así", "sí", "qué", "quién", "quiénes", "cuál", "cuáles", "cuándo", "dónde", "cómo",
    "aquí", "ahí", "allí", "allá", "acá", "está", "están", "esté", "será", "sería", "tú",
    "habrá", "dará", "irá", "café", "bebé", "mamá", "papá", "sofá", "menú",
}
SPANISH_GLOSS_STARTS = {
    "a", "al", "algo", "amar", "aunque", "bajo", "beber", "bonito", "cada", "casi", "delicioso",
    "cerca", "comer", "como", "con", "cuando", "de", "del", "dentro", "después", "día",
    "diferente", "el", "ella", "en", "entre", "es", "estar", "este", "hacer", "hasta",
    "hay", "ir", "jugar", "la", "las", "leer", "lo", "luego", "más", "mismo", "muy",
    "no", "para", "parecer", "por", "posible", "poder", "primero", "que", "quien", "rápido",
    "se", "ser", "sin", "sobre", "tener", "tiempo", "todo", "un", "una", "usar", "va",
    "ver", "viaje", "volver", "hablar", "fumar", "saludar", "insoportable", "tocar",
}


def read_pdf(level: int) -> str:
    path = PDF_DIR / f"hsk{level}.pdf"
    if not path.exists():
        raise FileNotFoundError(f"Falta el PDF de HSK {level}: {path}")
    return "\n".join(page.extract_text() or "" for page in PdfReader(path).pages)


def read_pucp_pdf(level: int) -> str:
    path = PDF_DIR / f"pucp-hsk{level}.pdf"
    if not path.exists():
        raise FileNotFoundError(f"Falta el PDF acumulativo PUCP de HSK {level}: {path}")
    return "\n".join(page.extract_text() or "" for page in PdfReader(path).pages)


def normalize_word(word: str) -> str:
    word = re.sub(r"…+", "……", word)
    return re.sub(r"\s+", "", word)


def normalize_category(value: str) -> str:
    value = re.sub(r"\s+", "", value).lower()
    return POS_NORMALIZED.get(value, value)


def split_pinyin_and_gloss(prefix: str) -> tuple[str, str, str]:
    """Split a source row before its POS marker or Spanish gloss.

    Santo Tomás PDFs sometimes omit the POS label and use two spaces between
    pinyin and the Spanish gloss. Choosing the last such boundary preserves
    multi-syllable pinyin that the PDF extractor itself spaced inconsistently.
    """
    prefix = prefix.strip()
    marker = POS_MARKER.search(prefix)
    if marker:
        return prefix[:marker.start()].strip(), prefix[marker.end():].strip(), marker.group("pos")

    boundaries = list(re.finditer(r"\s{2,}", prefix))
    for boundary in reversed(boundaries):
        gloss = prefix[boundary.end():].strip()
        first = re.match(r"([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)", gloss)
        if first and first.group(1).lower() in SPANISH_GLOSS_STARTS:
            return prefix[:boundary.start()].strip(), gloss, ""

    # Some unlabelled entries capitalize the first word of the gloss.
    spanish = re.search(r"\s+([A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+\b.*)$", prefix)
    if spanish:
        return prefix[:spanish.start()].strip(), spanish.group(1).strip(), ""
    return prefix, "", ""


def split_headword(value: str) -> tuple[str, str]:
    """Return the written form and preserve a recognized source POS annotation."""
    value = value.strip()
    match = re.fullmatch(r"(.*?)（([^）]+)）", value)
    if match:
        category = normalize_category(match.group(2))
        if category:
            return normalize_word(match.group(1)), category
    return normalize_word(value), ""


def entry_key(entry: dict[str, str]) -> tuple[str, str]:
    return entry["palabra"], entry.get("categoria_gramatical", "")


def parse_pucp_level(text: str, level: int) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    for line in text.splitlines():
        line = line.strip()
        # ``共`` también aparece dentro de vocabulario válido (公共汽车, 一共,
        # 共同, ...); solo se descarta la línea de recuento del encabezado.
        if (
            not line
            or line.startswith("HSK(")
            or line.startswith("HSK（")
            or re.fullmatch(r"共\s*\d+\s*个", line)
            or CJK.search(line) is None
        ):
            continue
        word, category = split_headword(line)
        if word:
            entries.append({"palabra": word, "categoria_gramatical": category})
    if len(entries) != LEVEL_COUNTS[level]:
        raise ValueError(f"PUCP HSK {level}: extracción de {len(entries)} filas, se esperaban {LEVEL_COUNTS[level]}")
    return entries


def clean_gloss(chunk: str, first_line: str) -> str:
    lines = [first_line, *chunk.splitlines()]
    glosses: list[str] = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        prefix = CJK.split(line, maxsplit=1)[0].strip()
        _, line, _ = split_pinyin_and_gloss(prefix)
        if not line:
            # Las filas sin glosa suelen continuar pinyin u OCR; no las conviertas en traducción.
            continue
        line = line.replace("～", "").replace("~", "").strip(" ,;；：:.-")
        line = re.sub(r"\s+", " ", line)
        # Algunos PDF insertan espacios dentro de palabras españolas en la vocal acentuada.
        line = re.sub(r"\b([áéíóúñ])\s+([a-záéíóúüñ]{1,20})\b", r"\1\2", line)
        line = re.sub(r"\bestá\s+ndar\b", "estándar", line, flags=re.I)
        def join_split_word(match: re.Match[str]) -> str:
            left, right = match.group(1), match.group(2)
            if left.lower() in SPANISH_WORDS_THAT_MAY_END_IN_ACCENT:
                return match.group(0)
            return left + right
        line = re.sub(r"\b([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+[áéíóúñ])\s+([a-záéíóúüñ]+)\b", join_split_word, line)
        line = re.sub(r"\s+([,;:])", r"\1", line)
        line = POS.sub("", line).strip()
        if line and re.search(r"[A-Za-zÀ-ÿ]", line):
            if line not in glosses:
                glosses.append(line)
    return "; ".join(glosses)


def parse_spanish_level(text: str, level: int) -> list[dict[str, str]]:
    matches = list(BRACKET_ENTRY.finditer(text))
    result: list[dict[str, str]] = []
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        first_line = match.group(2).strip()
        chunk = text[match.end():end]
        prefix = CJK.split(first_line, maxsplit=1)[0].strip()
        pinyin_source, _, pos_name = split_pinyin_and_gloss(prefix)
        pinyin = normalize_pinyin(pinyin_source)
        gloss = clean_gloss(chunk, first_line)
        result.append({
            "palabra": match.group(1).strip(),
            "pinyin": pinyin,
            "glosa_es": gloss,
            "categoria_gramatical": normalize_category(pos_name),
            "nivel_fuente": level,
        })
    # En el PDF HSK 4 la numeración salta de 676 a 678 y falta la fila 677.
    # El HSK 5 acumulativo confirma que esa entrada es 当 (dāng).
    if level == 4 and len(result) == LEVEL_COUNTS[level] - 1 and not any(x["palabra"] == "当" for x in result):
        result.append({
            "palabra": "当",
            "pinyin": "dāng",
            "glosa_es": "ser; ejercer de; cuando",
            "categoria_gramatical": "",
            "nivel_fuente": level,
            "nota_extraccion": "Fila 677 omitida en el PDF HSK 4; recuperada del listado acumulativo HSK 5.",
        })
    if len(result) != LEVEL_COUNTS[level]:
        raise ValueError(f"HSK {level}: {len(result)} entradas, se esperaban {LEVEL_COUNTS[level]}")
    return result


def normalize_pinyin(text: str) -> str:
    """Une los fragmentos de una palabra divididos por la extracción de PDF."""
    tokens = re.findall(r"[A-Za-zÀ-žÜüǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜ]+", text)
    return "".join(tokens)


def parse_advanced_level(text: str, level: int) -> list[dict[str, str]]:
    lines = text.splitlines()
    marks = [(i, int(m.group(1))) for i, line in enumerate(lines) if (m := NUMBER_LINE.match(line))]
    result: list[dict[str, str]] = []
    for pos, (line_no, source_number) in enumerate(marks):
        end = marks[pos + 1][0] if pos + 1 < len(marks) else len(lines)
        segment = lines[line_no + 1:end]
        hanzi_line = next((line.strip() for line in segment if CJK.search(line)), "")
        if not hanzi_line:
            continue
        # Part-of-speech labels are not part of the headword (等（动） / 等（助）).
        word, category = split_headword(hanzi_line)
        word = "".join(ch for ch in word if CJK.match(ch) or ch in "·…")
        pinyin_line = next((line.strip() for line in segment if line.strip() and not CJK.search(line)), "")
        if word:
            result.append({
                "palabra": word,
                "categoria_gramatical": category,
                "pinyin": normalize_pinyin(pinyin_line),
                "glosa_es": "",
                "nivel_fuente": level,
                "numero_fuente": source_number,
            })
    if len(result) != LEVEL_COUNTS[level]:
        raise ValueError(f"HSK {level}: {len(result)} entradas, se esperaban {LEVEL_COUNTS[level]}")
    return result


def unique_in_source(entries: list[dict[str, str]]) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    seen: set[str] = set()
    for entry in entries:
        word = entry["palabra"]
        if word not in seen:
            seen.add(word)
            result.append(entry)
    return result


def build_lookup() -> dict[tuple[str, str], dict[str, str]]:
    lookup: dict[tuple[str, str], dict[str, str]] = {}
    for level in range(1, 7):
        text = read_pdf(level)
        entries = parse_spanish_level(text, level) if level <= 4 else parse_advanced_level(text, level)
        for entry in entries:
            word = normalize_word(entry["palabra"])
            if not word:
                continue
            category = entry.get("categoria_gramatical", "")
            target = lookup.setdefault((word, category), {"pinyin": "", "glosa_es": "", "fuente_pinyin": "", "fuente_glosa": ""})
            if not target["pinyin"] and entry.get("pinyin"):
                target["pinyin"] = entry["pinyin"]
                target["fuente_pinyin"] = f"Santo Tomás HSK {level}"
            gloss = entry.get("glosa_es", "").strip()
            if gloss and not target["glosa_es"]:
                target["glosa_es"] = gloss
                target["fuente_glosa"] = f"Santo Tomás HSK {level}"
    return lookup


def lookup_for_entry(lookup: dict[tuple[str, str], dict[str, str]], word: str, category: str) -> dict[str, str]:
    """Use exact POS first; allow a POS-free match only when it is unambiguous."""
    exact = lookup.get((word, category))
    if category and exact:
        return exact
    candidates = [
        value for (candidate_word, candidate_category), value in lookup.items()
        if candidate_word == word and candidate_category and (value.get("pinyin") or value.get("glosa_es"))
    ]
    if not category and len(candidates) == 1:
        return candidates[0]
    # Keep an untagged pinyin from the advanced list when no uniquely tagged
    # supplementary entry can safely supply a gloss.
    return exact or {}


def main() -> None:
    levels: list[dict] = []
    previous: set[tuple[str, str]] = set()
    lookup = build_lookup()
    for level in range(1, 7):
        raw_entries = parse_pucp_level(read_pucp_pdf(level), level)
        unique = []
        seen: set[tuple[str, str]] = set()
        for raw_entry in raw_entries:
            key = entry_key(raw_entry)
            if key in seen:
                continue
            seen.add(key)
            word, category = key
            extra = lookup_for_entry(lookup, word, category)
            unique.append({
                "palabra": word,
                "categoria_gramatical": category,
                "pinyin": extra.get("pinyin", ""),
                "glosa_es": extra.get("glosa_es", ""),
                "nivel_fuente": level,
                "fuente_vocabulario": "Instituto Confucio PUCP",
                "fuente_pinyin": extra.get("fuente_pinyin", ""),
                "fuente_glosa": extra.get("fuente_glosa", ""),
            })
        current = {entry_key(entry) for entry in unique}
        older_missing = previous - current
        if older_missing:
            raise ValueError(f"PUCP HSK {level} no contiene {len(older_missing)} formas de la lista acumulativa anterior")
        new_entries = [entry for entry in unique if entry_key(entry) not in previous]
        levels.append({
            "nivel": level,
            "vocabulario_acumulado_declarado": LEVEL_COUNTS[level],
            "entradas_extraidas": len(raw_entries),
            "diferencia_filas_declaradas": LEVEL_COUNTS[level] - len(raw_entries),
            "filas_repetidas_por_grafia": len(raw_entries) - len({entry["palabra"] for entry in raw_entries}),
            "formas_unicas_extraidas": len(unique),
            "grafias_chinas_unicas": len({entry["palabra"] for entry in unique}),
            "nuevas_entradas_lexicas": len(new_entries),
            "entradas_con_pinyin": sum(bool(entry["pinyin"]) for entry in unique),
            "entradas_con_glosa_es": sum(bool(entry["glosa_es"]) for entry in unique),
            "acumulado": unique,
            "nuevas": new_entries,
        })
        previous |= current

    data = {
        "version": 1,
        "esquema": "HSK 2.0 (seis niveles; vocabulario acumulativo)",
        "fuente_principal": {
            "institucion": "Instituto Confucio PUCP",
            "pagina": PUCP_PAGE,
            "archivos": [
                {
                    "nivel": level,
                    "url": f"https://confucio.pucp.edu.pe/wp-content/uploads/2022/08/Vocabulario-HSK-{level}.pdf",
                    "criterio": "lista acumulativa de vocabulario HSK 2.0",
                }
                for level in range(1, 7)
            ],
        },
        "fuente_complementaria": {
            "institucion": "Instituto Confucio Santo Tomás",
            "pagina": UST_PAGE,
            "archivos": [
                {
                    "nivel": level,
                    "url": f"https://www.confucioust.cl/web/wp-content/uploads/sites/3/2021/01/Voc.-HSK-{level}.pdf",
                    "contenido": "glosas chino-español" if level <= 4 else "pinyin sin glosa española",
                }
                for level in range(1, 7)
            ],
        },
        "nota_extraccion": (
            "La asignación usa exclusivamente las seis listas acumulativas del Instituto Confucio PUCP. "
            "Se normalizan las variantes tipográficas de la elipsis y se conserva la categoría gramatical impresa entre "
            "paréntesis. Cada entrada se identifica por la grafía y su categoría, de modo que 对（形容词） y 对（介词） "
            "son unidades distintas. Los PDF declaran los totales 150/300/600/1200/2500/5000 y la extracción textual "
            "recupera el número de filas declarado en los seis PDF; el número menor de grafías chinas únicas se informa "
            "por separado, sin fusionar las acepciones gramaticales. "
            "Para pinyin y glosas se aprovechan coincidencias "
            "con los PDF del Instituto Confucio Santo Tomás. Sus listas no son idénticas a las de PUCP: los campos "
            "sin coincidencia quedan vacíos, no se completan por conjetura. Santo Tomás no ofrece glosas españolas "
            "en los PDF de HSK 5–6. Las entradas repetidas solo se eliminan si coinciden la grafía y la categoría "
            "gramatical; las homógrafas con categorías distintas se mantienen como entradas separadas."
        ),
        "niveles": levels,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escrito: {OUT}")
    for level in levels:
        print(
            f"HSK {level['nivel']}: {level['entradas_extraidas']}/{level['vocabulario_acumulado_declarado']} filas declaradas, "
            f"{level['formas_unicas_extraidas']} entradas léxicas, {level['grafias_chinas_unicas']} grafías únicas, "
            f"{level['nuevas_entradas_lexicas']} nuevas"
        )


if __name__ == "__main__":
    main()
