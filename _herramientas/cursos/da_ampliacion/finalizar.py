# -*- coding: utf-8 -*-
"""Apply Danish course order after compiling the extension sources.

Run after compilar.py. Internal lesson filenames remain stable so existing progress
is preserved; numero_curso controls the visible course sequence.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parents[2]
LESSONS = ROOT / 'Idiomas' / 'cursos' / 'da' / 'lessons'

CHAPTER_ORDER = (
    *range(0, 7), *range(38, 49),       # A1
    *range(7, 17), *range(49, 59),      # A2
    *range(17, 20), *range(59, 62),     # A2+ bridge
    *range(20, 26), *range(62, 82),    # B1
    *range(26, 38), *range(82, 96),    # B2
)
LESSON_ORDER = {
    17: (58, 124, 59, 60, 125, 126),
    18: (61, 62, 63, 127, 128),
    19: (68, 129, 69, 130),
}


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')


def main():
    files = sorted(LESSONS.glob('[0-9][0-9][0-9].json'))
    if len(files) != 304:
        raise SystemExit(f'Expected 304 lesson files, found {len(files)}')
    by_chapter = {}
    for path in files:
        data = read_json(path)
        by_chapter.setdefault(int(data['capitulo']), []).append((int(path.stem), path, data))
    if set(by_chapter) != set(CHAPTER_ORDER):
        raise SystemExit('Lesson chapters do not match the declared A1–B2 chapter sequence')

    numbered = 0
    for chapter in CHAPTER_ORDER:
        rows = by_chapter[chapter]
        wanted = LESSON_ORDER.get(chapter)
        if wanted:
            row_by_id = {lesson_id: (lesson_id, path, data) for lesson_id, path, data in rows}
            if set(row_by_id) != set(wanted):
                raise SystemExit(f'Unexpected lessons in split chapter {chapter}: {sorted(row_by_id)}')
            rows = [row_by_id[lesson_id] for lesson_id in wanted]
        else:
            rows.sort(key=lambda row: row[0])
        for _, path, data in rows:
            numbered += 1
            data['numero_curso'] = numbered
            write_json(path, data)

    cap_path = LESSONS / 'capitulos.json'
    caps = read_json(cap_path)
    cap_by_id = {int(c['numero']): c for c in caps}
    if set(cap_by_id) != set(CHAPTER_ORDER):
        raise SystemExit('Chapter metadata does not match the declared A1–B2 chapter sequence')
    write_json(cap_path, [cap_by_id[n] for n in CHAPTER_ORDER])
    print(f'Orden A1–B2 aplicado: {numbered} lecciones, {len(CHAPTER_ORDER)} capítulos.')


if __name__ == '__main__':
    main()
