#!/usr/bin/env python3
"""Crea borradores de lección que falten, sin sobrescribir archivos existentes."""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LECCIONES = ROOT / "lessons"
PLANTILLA = Path(__file__).with_name("plantilla_leccion.json")
TOTAL = 298
PATRON_NUMERICO = re.compile(r"^(\d{3})\.json$")


def cargar_plantilla() -> dict:
    with PLANTILLA.open("r", encoding="utf-8") as archivo:
        return json.load(archivo)


def crear_borrador(base: dict, numero: int) -> dict:
    """Conserva los campos de lección, omite la guía y marca el archivo como borrador."""
    datos = {clave: valor for clave, valor in base.items() if not clave.startswith("_")}
    datos["titulo_zh"] = "待编写"
    datos["titulo_es"] = {
        "@es": f"Borrador de lección {numero:03d}",
        "@en": f"Lesson draft {numero:03d}",
    }
    datos["intro"] = {
        "@es": "Borrador automático: completa esta lección con la plantilla reutilizable.",
        "@en": "Automatic draft: complete this lesson using the reusable template.",
    }
    datos["bloques"] = [
        {
            "tipo": "explicacion",
            "titulo": {"@es": "Pendiente de completar", "@en": "Draft to complete"},
            "texto": [
                {
                    "@es": "Este archivo es un borrador generado automáticamente. Sustituye este bloque y añade el contenido y los ejercicios de la lección.",
                    "@en": "This file is an automatically generated draft. Replace this block and add the lesson content and exercises.",
                }
            ],
        }
    ]
    datos["borrador"] = True
    return datos


def main() -> None:
    LECCIONES.mkdir(parents=True, exist_ok=True)
    plantilla = cargar_plantilla()
    creados = []
    existentes = []

    for numero in range(1, TOTAL + 1):
        destino = LECCIONES / f"{numero:03d}.json"
        if destino.exists():
            existentes.append(destino.name)
            continue
        contenido = crear_borrador(plantilla, numero)
        with destino.open("x", encoding="utf-8", newline="\n") as archivo:
            json.dump(contenido, archivo, ensure_ascii=False, indent=2)
            archivo.write("\n")
        creados.append(destino.name)

    numericos = sorted(
        nombre
        for ruta in LECCIONES.iterdir()
        if ruta.is_file() and (coincidencia := PATRON_NUMERICO.fullmatch(ruta.name))
        and 1 <= int(coincidencia.group(1)) <= TOTAL
        for nombre in [ruta.name]
    )
    print(f"Plantilla usada: {PLANTILLA}")
    print(f"Borradores creados: {len(creados)}")
    if creados:
        print(f"Rango nuevo: {creados[0]}–{creados[-1]}")
    print(f"Archivos existentes conservados: {len(existentes)}")
    print(f"Lecciones numeradas presentes dentro de 001–{TOTAL:03d}: {len(numericos)}")
    if len(numericos) != TOTAL:
        raise SystemExit(f"Error: se esperaban {TOTAL} archivos numerados y hay {len(numericos)}.")


if __name__ == "__main__":
    main()
