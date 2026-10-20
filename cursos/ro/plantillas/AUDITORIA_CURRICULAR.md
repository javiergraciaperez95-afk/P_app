# Auditoría curricular del curso de rumano

**Alcance inspeccionado:** parseo individual de los 124 JSON numerados, sus títulos, propiedades, palabras, bloques e IDs; lectura de `capitulos.json`, índice, diccionario, frases, juegos y `tutora.js`; consulta de `js/lessons.js`, `js/exercises.js` y `js/vistas/leccion.js` para cotejar el formato de datos. El análisis automatizado comprobó estructura y cadenas; esto no sustituye la revisión profesional de cada frase rumana.

## Fortalezas que conviene conservar

- Secuencia existente completa 001–124, sin huecos en los nombres de archivo; 13 capítulos con progresión temática reconocible desde saludos y vida diaria hacia proyectos, noticias y argumentación.
- Todos los 124 archivos se pudieron parsear como JSON. La estructura dominante se mantiene estable: `capitulo`, `titulo_ro`, `titulo_es`, `palabras`, `bloques`, `intro`; cuatro evaluaciones omiten `palabras`.
- Contenido variado: explicación, vocabulario, diálogo, lectura, tabla y ejercicios cerrados/abiertos. Conteos observados: `test` 399, `traduccion` 251, `explicacion` 242, `huecos` 168, `ordenar` 124, `vocabulario` 120, `escribir` 120, `dialogo` 119, `texto` 91, `tabla` 18.
- Hay 91 bloques de tipo `texto` y 119 diálogos; estos son base aprovechable para comprensión e interacción, sujeto a verificación lingüística y de traducción.
- El diccionario contiene 2.247 entradas y hay índice de lecciones con orden, IDs de ejercicios y referencias a audio; mantenerlos y reconciliarlos con las nuevas lecciones.

## Problemas demostrados y ejemplos

- **Error gramatical en glosa:** en `001.json`, consejo de `sunt` dice que es la forma de «a fi» para yo y ellos/ellas; omite «noi» (nosotros). Debe corregirse y revisar glosas equivalentes.
- **Inglés poco natural o inexacto:** en lección 001, `How do you do?` traduce «Încântată/Încântat» con una fórmula rígida poco equivalente a «¡Encantada/o!» en el diálogo; la traducción de `sunt` como `I am; I am` en el diccionario borra personas y sentidos. En `frases.json`, `Ce mai faci?` se analiza como `Adverse (more)` para `mai`, error léxico de traducción de “adverb”.
- **Calidad bilingüe sistemática:** el ejemplo anterior y los textos inspeccionados de 031/124 muestran traducciones inglesas literales o erróneas, por ejemplo `It's 9: 00.` para «Son las nueve menos cuarto» en 031; `The news` tratado en plural en 124 (`a news`) y `Prayer doesn't say.` por error de referente. Requiere revisión global del inglés y, cuando corresponda, del español.
- **Etiquetado curricular incoherente:** `capitulos.json` rotula el capítulo 13 como B1; `124.json` se llama examen final B2. La lección 093 se llama examen final B1 aunque está en un capítulo marcado A2. Son señales de revisión de nivel, no evidencia de que sus tareas demuestren esos niveles.
- **Evaluaciones con problemas de diseño:** 031 y 124 son bloques de selección/traducción que cubren temas de múltiples capítulos y contienen consignas muy parecidas; 124 tiene 26 bloques, pero no demuestra producción B2 suficiente por reconocimiento y traducción de frases aisladas. 093 es también un examen de selección con 26 bloques. Revisar tarea integradora y criterios de producción.
- **Vocabulario omitido en exámenes:** 031, 062, 093 y 124 no tienen `palabras`; no es defecto técnico probado, pero el índice/diccionario puede dejar de incorporar términos nuevos de esas lecciones.
- **IDs y esquema:** los 124 JSON no llevan `id` de lección; el ID de archivo y los IDs de ejercicio `roNNN-*` son el patrón utilizado. No añadir un `id` de nivel superior sin necesidad. Los tipos observados coinciden con el parser de `js/lessons.js` y el renderizador; además el parser contempla `gramatica` e `imagen`, aunque no aparecen en el corpus rumano examinado.
- **Audio:** el índice incluye `audio: 1` en lecciones y los ejercicios pueden incluir texto `audio`; el código ofrece reproducción por voz sintetizada. El paquete no demuestra que existan grabaciones de audio de hablantes.

## Progresión y cobertura

- A1 y A2 aparecen en los metadatos actuales, pero sin asignación uniforme basada en resultados observables. El capítulo 13 sube a B1 y el nombre de la lección 124 salta a B2 sin justificación de tarea.
- Gramática y vocabulario parecen estar representados en todas las lecciones ordinarias por sus bloques, pero la presencia de bloques no acredita progresión. La secuencia visible no documenta suficientemente el reciclaje espaciado ni objetivos de pronunciación, ortografía, escritura extensa, comprensión auditiva auténtica o mediación.
- Se observan oportunidades de conversación en diálogos, pero las actividades de respuesta abierta no garantizan interlocución real; diseñar modelos/criterios. Lecturas de tipo `texto` permiten comprensión escrita; deben graduarse en longitud, densidad e inferencia.
- Conteo: 399 `test`, 251 `traduccion`, 168 `huecos`, 124 `ordenar`, 120 `escribir`, 119 `dialogo`, 91 `texto`, 18 `tabla`. La evaluación está muy cargada hacia reconocimiento/elección frente a tareas productivas, y las tablas son escasas.
- No se detectaron textos exactos repetidos cuatro o más veces en campos comparados automáticamente; esta comprobación no detecta paráfrasis ni ejercicios estructuralmente redundantes.

## Compatibilidad técnica

- Los 124 JSON numerados parsean; las claves y los diez tipos de bloque observados son reconocidos por el código. La aplicación usa `titulo_ro`, `titulo_es`, `palabras`, `bloques`, `intro` y IDs internos de ejercicio.
- `capitulos.json` contiene 13 capítulos; el índice tiene 124 entradas, el diccionario 2.247 claves y `juegos/index.json` está vacío (`[]`). Las referencias se deben reconciliar al ampliar a 278.
- No se ha demostrado un fallo de compatibilidad en los 124 archivos. Hay que validar IDs de ejercicios, grupos de ejercicios, `audio`, capítulo y orden del índice tras producir los nuevos archivos.

## Revisión humana prioritaria

Una persona competente en rumano debe confirmar naturalidad de diálogos y colocaciones, inflexión y concordancia, casos y clíticos, aspecto/tiempos pasados, régimen preposicional, tono y cortesía. Un revisor competente en español e inglés debe corregir equivalencias y traducciones; las guías aproximadas de pronunciación también necesitan revisión. El análisis no atribuye oficialidad MCER ni certificación.

## Evidencia de esta pasada

- Archivos numerados parseados: 124; estructura faltante: 0; errores JSON: 0.
- Recursos JSON leídos: 13 capítulos; 124 registros de índice; 2247 entradas del diccionario; archivo de frases con 1 categorías; índice de juegos con 0 juegos.
- Archivos de aplicación consultados: `js/lessons.js`, `js/exercises.js`, `js/vistas/leccion.js`. No se modificó el código general.

## Límites y trabajo pendiente

- Esta auditoría se apoya en parseo completo y en revisión detallada de ejemplos representativos, además de métricas de los 124. No declara verificadas manualmente todas las oraciones rumanas.
- Continuar con la revisión individual, aplicar el plan de 278 lecciones y validar esquema, índices, capítulos, IDs, respuestas, traducciones, repeticiones, neutralidad e inclusión.
- El nivel se propone con descriptores oficiales generales del Consejo de Europa, sin afirmar correspondencia certificada de rumano ni reconocimiento oficial del curso.

## Correcciones aplicadas tras la auditoría

- En `lessons/001.json` y `indice/diccionario.json` se corrigieron las traducciones y la explicación de `sunt`, incluyendo las formas de primera persona plural y tercera persona plural. También se aclararon las glosas de `încântat`/`încântată` y se corrigió `Adverse` por `adverb` en el análisis de frases. El resto de los hallazgos sigue pendiente.

- En la lección 003 se afinó la explicación de la ortografía â/î tras contrastarla con la sección oficial del DOOM3 (Institutul de Lingvistică al Academiei Române): [Reguli de scriere și pronunțare](https://doom.lingv.ro/studiu_introductiv/reguli_scriere_pronuntare). La regla general necesita excepciones en compuestos y derivados.


## Cierre de producción (19-10-2026)

- Se completaron 278 lecciones en secuencia y se armonizaron las 124 existentes en una primera pasada. Los repasos 031, 062, 093 y 124 ya no se presentan como exámenes finales de nivel.
- Reparto curricular propuesto: A1 55 (001–055), A2 56 (056–111), B1 82 (112–193) y B2 85 (194–278). La distribución responde a la amplitud de los objetivos y a la autonomía comunicativa prevista; no representa una duración de estudio ni certifica el nivel.
- Se contrastaron los archivos numerados, los registros del índice, las referencias a IDs de ejercicios, los capítulos y el reparto de niveles. No se detectaron huecos, duplicados de IDs de índice/ejercicios ni desacuerdos entre títulos del plan y archivos nuevos.
- La pasada automatizada no sustituye la revisión de una persona competente en rumano y en las lenguas de apoyo. Naturalidad, adecuación de nivel y matices de traducción siguen siendo puntos de revisión editorial antes de una publicación académica.


## Actualización tras la reescritura de 185–278

- Las 94 lecciones de 185–278 ahora tienen lecturas y diálogos distintos; sus prácticas de traducción se basan en el diálogo y sus consignas abiertas se alinean con el foco del capítulo.
- Se alinearon las metas del plan de las lecciones 001–124 con sus introducciones. El índice se reconcilió con todos los IDs de ejercicios y se añadieron al diccionario 23 términos que aparecían en lecciones sin entrada.
- La auditoría posterior encontró un campo de opciones mal nombrado en el ejercicio de huecos `ro162-3`; se corrigió y se marcó explícitamente una respuesta correcta. La pasada completa encontró 1.683 ejercicios con prompt e ID, claves cerradas unívocas y respuestas modelo para las actividades abiertas.
- Estas comprobaciones no constituyen revisión de una persona hablante competente ni prueba con estudiantes. La reevaluación editorial actual del curso es 74/100; el 75/100 queda pendiente de una revisión lingüística independiente.
