# Auditoría curricular del curso de polaco

**Fecha:** 19 de octubre de 2026  
**Alcance:** `cursos/pl` completo; las 229 lecciones numéricas existentes, índice, diccionario, capítulos, frases, juegos y tutora.  
**Estado:** inspección estática completa; la revisión lingüística y curricular de persona competente en polaco sigue pendiente.

## Inventario y estructura

- `lessons/` contiene 229 JSON numerados sin huecos del 001 al 229 y `capitulos.json`; faltan 230–299 para la meta. No había carpeta `plantillas/` ni documentación curricular local antes de esta auditoría.
- Recursos: `indice/lecciones.json` (229 entradas), `indice/diccionario.json`, `phrases/frases.json`, `juegos/index.json` (vacío) y `tutora.js`.
- Los 234 archivos `.json` del curso se pueden parsear. En 229 lecciones hay 2.818 bloques; 1.904 ejercicios con ID fijo, sin IDs duplicados y sin ejercicios sin ID. La comprobación del vínculo índice↔bloque queda para validación final.
- Los capítulos existentes son 25 y todos los valores `capitulo` apuntan a una entrada existente. Sin embargo, los capítulos y niveles aparecen fuera del orden de las lecciones: 049–054 y 055–063 se asignan a capítulos B1 aunque sus contenidos son de gramática básica; 064–069 figuran en un capítulo B1; el examen A2 (143) aparece después de las lecciones 101–142; material de capítulos B2 (131–142 y 174–197) precede al examen B1 (198) y a las unidades 199–229. La numeración de lección y el orden curricular no reflejan los niveles de los capítulos.

## Lo que conviene conservar

- Las 229 lecciones ofrecen una base amplia y contextualizada: presentaciones, vivienda, compras, transporte, salud, estudio y trabajo, narración, aspecto verbal, casos, cortesía, medios, cultura y mediación.
- Hay explicaciones, ejemplos contextualizados, vocabulario, diálogos/textos y ejercicios con corrección automática. Los IDs existentes son únicos y deben preservarse durante la edición editorial.
- Hay contenido aprovechable sobre acusativo/genitivo, locativo e instrumental, formas impersonales, aspecto verbal, condicional, conectores y registro formal; requiere corrección puntual, no regeneración total.

## Problemas demostrados

- **Contaminación de traducción y caracteres:** 24 archivos contienen al menos uno de los patrones comprobados de corrupción (`ņ`, `�` o marcador `Cap. N` en contenido). Se hallaron 32 apariciones de `ņ`/`�` y 158 apariciones de `Cap. N`, muchas dentro de preguntas, frases y opciones de repasos. Ejemplos: 001 «Jak siņmasz?»; 012 «kładē siņspić»; 058 «myjęsił»; 070 inserta «Cap. 1»–«Cap. 16» en ejercicios de A1; 229 inserta «Cap. 77»–«Cap. 86» en el repaso B2.
- **Inglés defectuoso:** el error “genius” por *genitive* aparece desde 002 y vuelve en 013, 038, 044, 046–048, 054, 056, 065, 067, 222, 227–229. “Prayer” por *sentence* aparece, por ejemplo, en 032, 221, 224 y 225; “infinite” por *infinitive* en 229. Hay falsos sentidos y frases sin naturalidad: en 001 “ń remembers «-»” y “The final ę is usually almost as e”; en 229 “Prayer deals with urban traffic.”
- **Polaco y traducción española:** la corrupción de caracteres afecta formas polacas y explicaciones. En 013 se debe verificar *lubię/mięsa* y el caso tras negación; en 058, separación y forma de verbos reflexivos; en 070 y 229, retirar las etiquetas de capítulo y reconstruir cada ejercicio para que la consigna, el estímulo y la respuesta concuerden. Son ejemplos concretos, no una lista exhaustiva de errores lingüísticos.
- **Progresión y capítulos:** el material de A1, A2, B1 y B2 está intercalado según los metadatos actuales. La distribución actual de temas y exámenes no permite una progresión lineal fiable. Hace falta reasignar capítulos al rango numérico del plan y revisar el nivel de tareas donde el tema o la estructura exceda el nivel del tramo.
- **Destrezas:** predomina el ejercicio cerrado; una lección corriente suele ofrecer test, traducción, huecos, ordenar y una producción escrita breve, sin respuesta oral del alumno. Los diálogos y textos permiten lectura; el campo `audio` es texto que la app pasa a la voz disponible en el dispositivo, no una grabación. No hay práctica de comprensión auditiva con audio humano ni evaluación automática de interacción oral.
- **Técnica:** el cargador en `js/lessons.js` admite `explicacion`, `gramatica`, `dialogo`/`texto`, `vocabulario`, `tabla`, `imagen`, `test`, `traduccion`, `huecos`, `escribir` y `ordenar`. Las lecciones suelen usar un subconjunto válido. La tutora del curso es JavaScript, no JSON. Se inspeccionaron `agrupar_capitulos.py` y `anadir_ordenar.py`; no se ejecutaron. El primero reagruparía según el orden actual y asignaría niveles por posición relativa al curso español, por lo que no es seguro para este plan sin adaptación.
- **Neutralidad e inclusión:** aparecen los temas sociedad, política pública, medioambiente y cambio político. El objetivo observado es lingüístico; los ejemplos deberán mantenerse cotidianos y descriptivos, sin defensa de partidos, campañas ni estereotipos. Debe revisarse específicamente el vocabulario de opiniones y los personajes de diálogos durante la edición.

## Cobertura por desarrollar

- Consolidar en espiral las siete declinaciones y sus funciones, alternancias, preposiciones y excepciones frecuentes; distinguir formas animadas/inanimadas donde corresponda.
- Cubrir aspecto perfectivo/imperfectivo a través de pasado, presente y futuro; prefijación, colocaciones y restricciones de uso.
- Reforzar pronunciación y ortografía: contrastes sz/ś, cz/ć, ż/rz, u/ó, h/ch, consonantes sonoras al final, grupos consonánticos y acento con excepciones pertinentes.
- Equilibrar recepción (texto y voz sintética), producción escrita guiada y abierta, interacción modelada en diálogos y mediación/resumen. La aplicación no permite afirmar que el alumno escucha audio real o graba producción oral.
- Completar B2 con comprensión de argumentos largos, matización, inferencia, registro, síntesis y mediación sobre textos accesibles, no con solo traducción de frases.

## Verificación especializada recomendada

Una persona competente en polaco debe revisar declinación y gobierno preposicional (sobre todo 038, 044, 046–048, 054, 056, 065, 067 y 229), aspecto y prefijos (096, 113–118, 200 y 229), concordancia de género animado/personal, condicional y formas impersonales, pronunciación aproximada y naturalidad de los diálogos. También debe verificar las traducciones al inglés afectadas por la traducción automática y resolver ambigüedades de variante/register. La auditoría no certifica corrección nativa.

## Referencias curriculares

El MCER se emplea como guía para redactar objetivos observables de recepción, producción, interacción y mediación, no como equivalencia de examen ni certificación. El Consejo de Europa explica que los descriptores ilustrativos organizan niveles comunes y que el MCER no valida por sí mismo exámenes o diplomas: [descriptores del MCER](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors), [introducción y contexto](https://www.coe.int/en/web/common-european-framework-reference-languages/introduction-and-context). La edición de 2020 del volumen complementario añade escalas de mediación y actualiza descriptores: [volumen complementario 2020](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4).

## Límites de esta fase

Esta auditoría registra evidencia estructural y patrones reproducibles de texto. No afirma haber probado la naturalidad de cada oración polaca ni la equivalencia de cada traducción; esas comprobaciones se harán durante la revisión lección por lección y las dudas se marcarán para revisión humana.

## Actualización tras completar la secuencia — 19 de octubre de 2026

La auditoría inicial registró 229 lecciones. Se añadieron 230–299, se fijó el curso en 31 capítulos y se sincronizaron `lessons/capitulos.json`, los metadatos `capitulo` de las 299 lecciones y `indice/lecciones.json`. El índice tiene 299 entradas; el diccionario incluye los términos nuevos. La secuencia final cumple A1 001–070, A2 071–146, B1 147–222 y B2 223–299.

Se ejecutó una validación automatizada de JSON, numeración, tipos admitidos, IDs, respuestas correctas de ejercicios cerrados, referencias de vocabulario y concordancia índice↔lecciones. Los conteos finales aparecen en `plantillas/INFORME_CALIDAD_FINAL.md`. Las correcciones editoriales iniciales se mantuvieron. La lectura curricular detallada se utilizó para definir el plan; la evaluación lingüística oración por oración de las 229 lecciones preexistentes y el cotejo competente del polaco nuevo quedan pendientes y no se consideran certificados.


## Hallazgos confirmados en la revisión final (19-10-2026)

- Un barrido de los JSON encontró 62 campos dañados por sustituciones de caracteres en 42 lecciones. La mayoría eran glosas inglesas con formas polacas truncadas (por ejemplo, 067, 070, 119 y 143); se corrigieron y se volvió a escanear sin resultados.
- Se encontraron tareas de producción final demasiado breves para varios objetivos B1/B2, con traducciones de una palabra como salida final. Se sustituyeron por tareas contextuales con modelos y criterios, manteniendo los IDs.
- La lección 056 repetía una traducción española entre dos distractores; se reemplazaron por opciones distintas y plausibles. El examen B2 229 carecía de producción abierta; se añadió y enlazó una síntesis argumentada.
- La calidad de los textos propios requiere cotejo por hablante competente. La validación JSON no evalúa por sí sola la naturalidad del polaco, la prosodia ni el comportamiento visual de la aplicación.
