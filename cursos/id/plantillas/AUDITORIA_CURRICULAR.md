> **Nota de vigencia:** este archivo documenta la auditoría de partida cuando el curso tenía 124 lecciones; no describe por sí solo el estado actual. Las correcciones y el resultado auditado para 287 archivos constan en [INFORME_CALIDAD_287.md](INFORME_CALIDAD_287.md) y [PROGRESO_REVISION.md](PROGRESO_REVISION.md).

# Auditoría curricular del curso de indonesio

Fecha de inspección: 19 de octubre de 2026

## Alcance y método

Se inventariaron todos los archivos de `cursos/id`, se leyeron y analizaron los 124 JSON de `lessons/001.json` a `lessons/124.json`, el índice, el diccionario, `lessons/capitulos.json`, las frases, el recurso de juegos y la tutora. También se consultó el lector y validador de lecciones de `js/lessons.js`, el renderizador de ejercicios de `js/exercises.js` y el módulo de voz. No se ejecutó ningún generador.

La aplicación descubre lecciones por el nombre de archivo de tres cifras. El esquema heredado acepta los campos `capitulo`, `titulo_ind`, `titulo_es`, `palabras`, `bloques` e `intro`. Los bloques informativos admitidos son `explicacion`, `dialogo`, `texto`, `vocabulario`, `tabla` e `imagen`; los ejercicios admitidos son `test`, `traduccion`, `huecos`, `escribir` y `ordenar`. Las traducciones del curso usan objetos `{"@es":"…","@en":"…"}`. Los ejercicios automáticos usan opciones con una respuesta `correcta`; `escribir` admite respuestas modelo. El campo `audio` contiene texto que la aplicación pronuncia con la voz disponible en el dispositivo: no implica una grabación de hablante nativo.

## Estado cuantificado

- Hay 124 lecciones, consecutivas y sin huecos, numeradas 001–124. El índice contiene también 124 entradas.
- Los archivos se agrupan en 13 capítulos temáticos. La distribución de nivel implícita en los títulos de evaluación es de 31 lecciones por nivel: 001–031 A1, 032–062 A2, 063–093 B1 y 094–124 B2.
- Hay 1.583 bloques: 222 explicaciones, 120 bloques de vocabulario, 89 diálogos, 67 lecturas, 22 tablas y 1.063 ejercicios. Los ejercicios incluyen 462 `test`, 267 `traduccion`, 179 `huecos`, 124 `ordenar` y 31 `escribir`.
- Los 124 JSON se pueden parsear. Los identificadores de ejercicios existentes no presentan duplicados en la inspección.
- Las lecciones 062, 093 y 124, que son evaluaciones de cierre, no tienen `palabras`; tampoco incluyen introducción 42 lecciones. La ausencia de `intro` no es un error del esquema, aunque deja entradas sin orientación inicial. En las tres evaluaciones sin vocabulario conviene comprobar si las palabras se presentan de forma suficiente dentro de las preguntas.

## Fortalezas que conviene conservar

- La secuencia incluye situaciones concretas y variadas: presentaciones (001–006), rutinas y familia (010–018), pedidos y direcciones (019–030), clima y salud (032–037), servicios, medios, ocio y escuela (038–055), biblioteca y prácticas culturales (056–062), ambiente, cine y alimentación (063–074), quejas y vida cotidiana (075–083), fenómenos naturales y relatos (084–093), empleo, opinión, patrimonio, noticias, turismo, salud, biografía y exposición (094–123).
- Se explican contrastes útiles sin reducirlos a equivalencias rígidas. En 001 se distinguen `saya`, `aku`, `kamu` y `Anda` según relación y situación; en 002 se advierte que `Bapak`, `Ibu`, `Mas` y `Mbak` dependen del contexto.
- Hay exposición a afijos y formación de palabras, por ejemplo `-i` (070), reduplicación (098), `meng-…-i` (107), nominalización (113) y `meng-…-kan` (119), además de actividades comunicativas aplicadas.
- La mayoría de las lecciones combina explicación, vocabulario contextual y más de un tipo de práctica. Los cierres 031, 062, 093 y 124 pueden conservarse como evaluaciones de repaso, una vez alineados con sus respectivas unidades.

## Problemas localizados

### Coherencia curricular y técnica

- `lessons/capitulos.json` solo define 13 capítulos y asigna niveles A1 a 1–6, A2 a 7–12 y B1 al 13. No define B2, pese a que 124 se titula «Examen final B2» y las lecciones 094–123 contienen objetivos de nivel avanzado. El índice `indice/lecciones.json` tiene 124 entradas. El lector de la app usa el ID del archivo para progreso y acepta `numero_curso` y `orden_curso` para ordenar; por ello se pueden conservar los IDs estables y asignar una numeración visible independiente.
- El capítulo 13 agrupa salud, recursos narrativos, medioambiente y biografía, y contiene tanto objetivos B1 como B2 (112–124). La etiqueta actual no refleja la progresión real.
- 093 presenta preguntas sobre «Cap. 21»–«Cap. 30», y 124 sobre «Cap. 31»–«Cap. 40», aunque los capítulos reales son 10 y 13. Son referencias residuales que confunden al estudiante y deben quitarse o enlazarse con la numeración curricular vigente.
- 062, 093 y 124 carecen del campo `palabras`. En particular, 093 y 124 son pruebas extensas de repaso sin introducción o glosario propio. Deben relacionarse con los objetivos y el vocabulario enseñados antes.
- Las lecciones 001–124 tienen principalmente una secuencia casi fija de selección, traducción, huecos y ordenar. La práctica abierta `escribir` aparece solo 31 veces; no hay un bloque específico de interacción oral. Los diálogos sí ofrecen modelos de conversación, pero la aplicación no evalúa turnos hablados.

### Calidad de lengua y traducción

- En 001, algunas glosas inglesas no transmiten el sentido previsto: `aku` aparece como “trustworthy” aunque la glosa española dice «de confianza» en el sentido de relación cercana; `saya` aparece como “me” donde se explica el pronombre de primera persona. Debe corregirse en palabra, explicación y banco cuando proceda.
- En 001–003 y en distintas entradas del diccionario hay calcos de inglés o traducciones poco naturales; por ejemplo, en la ficha de 002 `baik` figura “Well, well.” y la entrada inglesa de `kabar` repite “news; news”.
- En 124, títulos ingleses del índice como “Final review B2” no reflejan con precisión una evaluación final, y a lo largo de los materiales se encuentran calcos como “the course of a narrative change” (pregunta 15) y “on pilotes” (traducción de la 16). Hace falta una revisión integral del inglés y del español, además de la revisión del indonesio.
- La lección 001 usa una convención de pronunciación aproximada escrita para hispanohablantes, pero no explica su alcance ni marca con IPA los contrastes. Debe advertirse que el acento gráfico indica una aproximación pedagógica y no una transcripción fonética universal.
- El curso necesita una progresión explícita de pronunciación y ortografía: valores de letras, sílabas y acento prosódico, préstamos, separación de afijos y reduplicación aparecen dispersos, sin una secuencia equilibrada.

### Cobertura de destrezas y nivel

- Las 89 lecciones con diálogo y 67 con lectura dan modelos para comprensión, pero las tareas se concentran en reconocer respuestas. Las actividades de lectura extensa y comprensión de información implícita deben aumentar gradualmente en B1–B2.
- La escritura está infrarrepresentada frente a ejercicios cerrados: 31 de 971 bloques de práctica son `escribir`; incluso estas tareas requieren modelos y criterios visibles para producir respuestas útiles.
- No se puede afirmar que haya audio grabado ni escucha de acentos reales. La voz de la aplicación es síntesis del sistema. La comprensión oral debe diseñarse como escucha de texto sintético y, donde se requiera variación de voces o prosodia natural, anotarse como necesidad de revisión/producción externa.
- Hay núcleos valiosos de morfología, pero falta una secuencia acumulativa que contraste formas activas y pasivas, familias de afijos, alternancias de raíz, reduplicación parcial/total y registros escrito y coloquial. Se deben matizar las reglas y añadir ejemplos con contexto.

## Repetición, compatibilidad e inclusión

- La estructura común de ejercicio hace previsible el ritmo. La repetición de los tipos es útil para navegar la app, pero no debe traducirse en repetir preguntas, traducciones, distractores o modelos con sustitución de una palabra. Se requiere una revisión automática de duplicados exactos y una lectura de similitud temática de los textos.
- El validador descarta o avisa de campos desconocidos; por eso no se añadirá un formato nuevo ni una etiqueta de nivel que la aplicación no lea. Nivel y capítulo se resolverán en el índice curricular ya existente y los metadatos soportados.
- El contenido examinado es principalmente cotidiano, educativo y cultural. La referencia a “políticas escolares” de 105 puede mantenerse como comunicación sobre normas del centro, con una situación neutral y no partidista. Las lecciones sobre figuras y celebraciones nacionales deben usar fuentes y ejemplos descriptivos, sin propaganda ni generalizaciones sobre identidades.

## Laguna y prioridades de producción

El curso tiene una base aprovechable de 124 lecciones, pero necesita 163 lecciones nuevas para alcanzar 287. La ampliación debe distribuirse dentro de cada nivel para que cada tramo tenga práctica y evaluación equilibradas, no concentrarse al final. La propuesta es 71 lecciones A1 y 72 en cada uno de A2, B1 y B2. Se reforzarán: fonología y ortografía; interacción de supervivencia; transacciones, servicios y narración cotidiana; comprensión de textos y mensajes; morfología verbal y nominal; registro; producción escrita; y comprensión/producción de exposiciones y argumentos.

La distribución existente está organizada como cuatro tramos de 31 lecciones. Para intercalar contenido y formar rangos equilibrados se conserva el ID de archivo y se asigna una posición visible mediante `numero_curso` y `orden_curso`, campos admitidos por el lector. Los IDs internos de ejercicios también se preservan. Se actualizarán los archivos originales con esos metadatos y el índice se ordenará por número de curso.

## Revisión competente recomendada

Solicitar a una persona competente en indonesio que revise las formas y traducciones marcadas en el plan y, en particular, los afijos `meng-…-kan`, `meng-…-i`, `ber-…-an`, la pasiva, reduplicación, partículas conversacionales, tratamientos y coloquialismos regionales, expresiones culturales, pronunciación aproximada y naturalidad de diálogos. Esta auditoría no sustituye esa revisión. El indonesio estándar y el uso coloquial varían por contexto, región, edad y relación entre hablantes.
