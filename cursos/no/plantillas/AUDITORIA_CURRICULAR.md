# Auditoría curricular del curso de noruego

Fecha: 19 de octubre de 2026. Se inspeccionó el árbol completo de `cursos/no`, se leyeron mediante análisis automatizado las 157 lecciones JSON originales y se revisaron índice, diccionario, capítulos, frases, tutora y código de carga/renderizado. No se ejecutaron generadores preexistentes del curso. Para componer el plan y la revisión neutral se usaron dos scripts auxiliares temporales, creados y luego retirados; no se tocaron generadores de la aplicación.

## Inventario y compatibilidad

- Hay 157 lecciones (`001`–`157`), 17 capítulos, 1.903 bloques, 1.326 IDs de ejercicio únicos y 3.262 entradas en el diccionario. El índice contiene las 157 lecciones y coincide en identificadores y títulos.
- Todos los JSON existentes se pueden parsear. Las diez clases halladas (`explicacion`, `vocabulario`, `dialogo`, `texto`, `tabla`, `test`, `huecos`, `traduccion`, `ordenar`, `escribir`) están soportadas por `js/lessons.js` y `js/vistas/leccion.js`. Los ejercicios cerrados tienen una respuesta marcada y las actividades abiertas contienen modelos. El vocabulario de cada bloque remite a una ficha existente.
- El formato es el esquema heredado: `capitulo`, `titulo_no`, `titulo_es` con `@es`/`@en`, `palabras`, `bloques`; los ejercicios llevan IDs `noNNN-N`. No se hallaron plantillas ni generadores preexistentes propios de `cursos/no`. El generador general de índices no se ejecutó.
- El índice sirve orden, capítulos y referencias de ejercicios; el diccionario se carga como mapa de fichas; `lessons/capitulos.json` alimenta agrupación y niveles. `phrases/frases.json` es otro recurso del curso y `juegos/index.json` está vacío.

## Aciertos que conviene conservar

- La secuencia de 157 archivos e IDs es continua y única. Se conservarán las lecciones útiles y solo se cambiarán sus nombres/IDs internos donde haya que insertar contenido.
- Hay una progresión temática desde saludos y datos personales (001–009), vivienda y vida cotidiana, hasta estudio, trabajo, lectura crítica y comunicación profesional (127–156).
- Las lecciones combinan explicación, vocabulario, diálogos, lecturas y ejercicios autocorregibles; existen respuestas modelo en escritura. Los repasos indican que no certifican por sí solos el nivel.

## Hallazgos que requieren intervención

- **Niveles y capítulos:** hay 17 capítulos para cuatro niveles, sin segmentación A1–B2 estable. El capítulo 17 se etiqueta B1 aunque contiene el cierre B2. La distribución actual de los capítulos no representa bien el salto temático a B1 que comienza alrededor de la lección 096.
- **Repasos desalineados:** `095.json` anuncia capítulos 11–20, pero sus preguntas señalan capítulos 26–40; el curso solo cuenta con capítulos 1–17. Los repasos `126.json` y `157.json` también citan tramos que no corresponden al índice real. Se deben volver a vincular con el contenido real, sin capítulos ficticios.
- **Cobertura:** A1 tiene una base funcional y pronunciación en 031–033; lectoescritura y alfabeto aparecen dispersos. A2 tiene solo unas 30 lecciones didácticas antes del examen. B1 y B2 cubren dominios útiles, pero requieren más práctica de lectura extensa, síntesis, interacción sostenida, mediación, registro y variación.
- **Destrezas:** predominan selección múltiple, huecos y traducción. Hay 140 bloques de escritura que requieren revisión de dificultad y criterios. Los diálogos y lecturas se muestran como texto. Aunque 156 ejercicios declaran audio, la aplicación depende de voz sintética del dispositivo y el curso no incluye archivos de audio; no se debe afirmar que hay grabaciones o escucha auténtica.
- **Repetición:** la comparación exacta solo halló unas pocas repeticiones entre lecciones (por ejemplo `ha det!` en 001/003 y una frase reutilizada en 049/058). Esta comprobación no detecta paráfrasis ni estructuras didácticas demasiado similares; las lecciones nuevas deben tener tareas y textos propios.
- **Traducción/ejemplos concretos:** en 001 `heter` se glosa en inglés como “My name is; it's called” y la nota de `jeg` termina con “the and «I»”. En 031 `stavelse` figura como “silica” en español; `en kort vokal` se traduce “a short vocal” en inglés; otras glosas inglesas son literales o poco naturales. En 085 el título inglés “You were at home.” no corresponde a “Averías en casa”. Debe hacerse una revisión bilingüe sistemática.
- **Neutralidad:** 139–141 tratan elecciones, prioridades y argumentación política. Se conservarán sus objetivos lingüísticos (opinión, razones, concesión, argumentación) y se trasladarán a situaciones cotidianas, educativas, culturales o profesionales neutrales.
- **Calidad de títulos:** por ejemplo, 020 “Tables and prices” y 049 “Change Size” no son traducciones adecuadas. Hay que comparar bokmål, español e inglés de forma consistente.

## Progresión y lagunas

Ampliar A2 con situaciones funcionales y narración breve; B1 con lectura de documentos, mediación, cohesión escrita, noticias atribuidas y comunicación laboral; B2 con síntesis de fuentes, argumentación matizada, exposición sostenida, registro y análisis discursivo. Pronunciación se abordará mediante guías textuales, sin presentarlas como sustituto del audio o una evaluación oral.

La variedad escrita principal será **bokmål**. Nynorsk aparecerá solo en comparaciones explícitas, sin mezclar formas en ejercicios de producción bokmål. Los dialectos se describirán como variación legítima; su representación escrita no permite deducir por sí sola la pronunciación. Naturalidad, paradigmas, colocaciones y transcripción fonética necesitan revisión por alguien competente en noruego.

El MCER se empleará como referencia para objetivos comunicativos, no como certificación. El Consejo de Europa describe sus niveles mediante descriptores y explica que el marco orienta programas y materiales, mientras que la vinculación de exámenes concretos exige controles de calidad: [descriptores del MCER](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors), [marco y contexto](https://www.coe.int/en/web/common-european-framework-reference-languages/introduction-and-context).

Para distinguir las dos normas escritas y el habla, se consultó Språkrådet: sus normas oficiales se aplican a bokmål y nynorsk escritos, y considera equivalentes las variedades dialectales establecidas: [normas de bokmål y nynorsk](https://sprakradet.no/nyord-og-rettskrivingsendringer/normering-av-norsk/normering/), [consejos de pronunciación](https://sprakradet.no/godt-og-korrekt-sprak/praktisk-sprakbruk/uttalerad/). La entrada de Bokmålsordboka confirma el uso **ha lyst til å** antes de infinitivo, empleado en la nueva lección de invitaciones: [lyst](https://ordbokene.no/nob/bm/lyst). Estas referencias apoyan el alcance descrito, pero no sustituyen la lectura experta de todo el curso.

## Resolución de la auditoría

La auditoría anterior describe el inventario de partida de 157 lecciones. El trabajo posterior completó el plan y la integración final: ahora existen 279 lecciones, 36 capítulos, índice sincronizado y diccionario ampliado. Se cubrieron los huecos A2 095–133, B1 165–208 y B2 240–278, se revisaron los repasos de 134, 209 y 279 y se neutralizaron los escenarios de 139–141 conservando sus objetivos lingüísticos.

La revisión individual de los 279 archivos figura en `REVISION_279_LECCIONES.md`; su matriz no registra incidencias estructurales/editoriales según los controles detallados allí. Las cifras y limitaciones finales están en `INFORME_CALIDAD_FINAL.md`. Sigue pendiente una lectura de una persona competente en noruego para validar naturalidad, colocaciones, pronunciación aproximada, referencias de variedad y equivalencias de traducción; no se declara revisión humana ni certificación MCER.
