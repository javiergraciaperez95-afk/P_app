# Progreso de revisión de lecciones de inglés

- Lista completa leída: sí (301 entradas, en el orden original: `001.json`–`300.json`, después `capitulos.json`).
- Nombre de lista encontrado: `Notas_archivos_noafectaalcodigo\review-list-English.txt.txt`; la ruta solicitada con un solo `.txt` no existe. La lista existente se mantiene intacta.
- Alcance: revisar cada JSON en `Idiomas\cursos\en\lessons\` y al final `Idiomas\cursos\en\capitulos.json`.
- Estado: completado (301/301 entradas revisadas).
- Último archivo completado: `capitulos.json`.
- Siguiente archivo pendiente: ninguno (revisión de inglés finalizada).

## Registro por archivo

### 1/301 — `Idiomas/cursos/en/lessons/001.json`
- **Ruta:** `Idiomas/cursos/en/lessons/001.json`
- **Estado:** corregido.
- **Problemas encontrados:** la traducción de «What's your name?» usaba tratamiento formal mientras el análisis daba «tu nombre»; «thanks» se aceptaba como respuesta de escritura antes de enseñarse.
- **Cambios realizados:** ajusté la traducción a «¿Cómo te llamas?» y limité la respuesta aceptada a «thank you». Sincronicé la fuente editable `_herramientas/cursos/en/01.txt`.
- **Pruebas/comprobaciones:** JSON parseado; comprobé 8 ejercicios, IDs únicos, opciones válidas con una respuesta correcta, solución escrita presente y sincronización de los cambios con la fuente.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `001.json`.
- **Siguiente archivo pendiente:** `002.json`.

### 2/301 — `Idiomas/cursos/en/lessons/002.json`
- **Ruta:** `Idiomas/cursos/en/lessons/002.json`
- **Estado:** corregido.
- **Problemas encontrados:** el análisis decía «no mal», traducción defectuosa de «Not bad»; el desglose «are you» expresaba la inversión de forma poco natural en español.
- **Cambios realizados:** corregí el desglose a «estás (en la pregunta, “are” va antes de “you”)» y «Not bad = no estoy mal» en el JSON y su fuente editable `01.txt`.
- **Pruebas/comprobaciones:** JSON parseado; 8 ejercicios y 8 IDs únicos; las 7 preguntas con opciones tienen una sola respuesta correcta; solución y datos de ordenar presentes; diálogo y análisis leídos junto a la fuente.
- **Resultado:** correcto tras los cambios. Ajusté una comprobación local que asumía que el nombre del hablante se incluía dentro del texto de diálogo; el esquema lo guarda en un campo separado.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `002.json`.
- **Siguiente archivo pendiente:** `003.json`.

### 3/301 — `Idiomas/cursos/en/lessons/003.json`
- **Ruta:** `Idiomas/cursos/en/lessons/003.json`
- **Estado:** corregido.
- **Problemas encontrados:** la explicación exageraba al afirmar que el inglés «no se escribe como suena» y que A, E e I son «las que más se confunden»; dos intervenciones del diálogo de recepción eran elípticas y «first name» quedaba como «nombre» sin distinguirlo de apellido.
- **Cambios realizados:** precisé la explicación sobre la correspondencia entre grafía y sonido; hice explícito el contraste de nombres de letras; naturalicé el saludo formal como «Buenas noches. ¿Cuál es su apellido, por favor?» y aclaré «nombre de pila». Sincronicé `_herramientas/cursos/en/01.txt`.
- **Pruebas/comprobaciones:** JSON parseado; tabla verificada con las 26 letras A–Z exactamente una vez; 8 ejercicios e IDs; todas las preguntas de opción tienen una correcta; comprobé traducción y presencia de campos en diálogos/texto.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `003.json`.
- **Siguiente archivo pendiente:** `004.json`.

### 4/301 — `Idiomas/cursos/en/lessons/004.json`
- **Ruta:** `Idiomas/cursos/en/lessons/004.json`
- **Estado:** corregido.
- **Problemas encontrados:** dos ejercicios de huecos tenían distractores semánticamente válidos («I have a pencil» y «open/close this page»); la ficha de «read» daba una aproximación de la vocal corta, propia del pasado, aunque el ejemplo usa el presente /riːd/.
- **Cambios realizados:** di una pista contextual para «question», convertí el segundo hueco en una elección de forma imperativa (Read/Reads/Reading) y corregí la pronunciación aproximada a «ríd». Sincronicé `_herramientas/cursos/en/01.txt`.
- **Pruebas/comprobaciones:** JSON parseado; 8 ejercicios, IDs únicos y una opción correcta en cada pregunta; confirmé las opciones nuevas, la ficha de pronunciación y los campos de ordenar.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `004.json`.
- **Siguiente archivo pendiente:** `005.json`.

### 5/301 — `Idiomas/cursos/en/lessons/005.json`
- **Ruta:** `Idiomas/cursos/en/lessons/005.json`
- **Estado:** corregido.
- **Problemas encontrados:** la lección afirmaba enseñar preguntas con **be** y **do**, pero solo mostraba y evaluaba «Where do you live?»; además repetía el mismo hueco dos veces y no ofrecía un ejemplo de inversión con **be**.
- **Cambios realizados:** añadí ejemplos de pregunta con **be** y conservé uno con **do**; cambié el segundo hueco por «Who is your teacher?», la traducción por esa misma estructura y el ejercicio de ordenar por «Where are you?». Sincronicé `_herramientas/cursos/en/01.txt`.
- **Pruebas/comprobaciones:** JSON parseado; 6 ejercicios con IDs únicos; cada pregunta de opciones tiene una respuesta correcta; comprobé los dos patrones y la presencia de solución y traducción en los ejercicios correspondientes.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `005.json`.
- **Siguiente archivo pendiente:** `006.json`.

### 6/301 — `Idiomas/cursos/en/lessons/006.json`
- **Ruta:** `Idiomas/cursos/en/lessons/006.json`
- **Estado:** corregido.
- **Problemas encontrados:** la lección se titulaba «Be or do?» pero solo evaluaba preguntas con **be** y repetía «Are you ready?» en cinco tareas; «shop» aparecía como ficha sin uso en la lección.
- **Cambios realizados:** añadí práctica contrastiva: **be** con el estado «ready» y **do** con la acción «work»; sustituí la ficha no usada por la ficha visible de **do** y diversifiqué los ejercicios. Sincronicé `_herramientas/cursos/en/01.txt`.
- **Pruebas/comprobaciones:** JSON parseado; 6 ejercicios, IDs únicos, opciones con una única respuesta correcta, solución de escritura, y comprobación de presencia de ambos patrones.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `006.json`.
- **Siguiente archivo pendiente:** `007.json`.

### 7/301 — `Idiomas/cursos/en/lessons/007.json`
- **Ruta:** `Idiomas/cursos/en/lessons/007.json`
- **Estado:** corregido.
- **Problemas encontrados:** las tareas repetían respuestas afirmativas con «I am» y apenas practicaban «is» con he/she; la nota léxica marcaba «tired» en masculino pese al ejemplo femenino y repetía vocabulario ya presentado.
- **Cambios realizados:** amplié la explicación a respuestas afirmativas y negativas con «I/am» y «she/is», añadí práctica diferenciada y traducción contextual, corregí las soluciones y retiré las fichas léxicas redundantes. Sincronicé `_herramientas/cursos/en/01.txt`.
- **Pruebas/comprobaciones:** UTF-8 sin caracteres de reemplazo; JSON parseado; 6 tareas con IDs únicos; opciones de elección con exactamente una solución y campos de respuesta completos para ordenar/escribir.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `007.json`.
- **Siguiente archivo pendiente:** `008.json`.

### 8/301 — `Idiomas/cursos/en/lessons/008.json`
- **Ruta:** `Idiomas/cursos/en/lessons/008.json`
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis ejercicios reutilizaban casi la misma pregunta sobre deletrear el apellido; la petición para que repitan («Can you say that again, please?»), anunciada en la explicación, no tenía práctica ni comprobación de comprensión.
- **Cambios realizados:** repartí las tareas entre deletrear, pedir que repitan, reconocer «again» y comprender ambas preguntas; añadí la ficha de «say». Mantuve ocultas las fichas de «surname» y «do», ya presentadas antes. Sincronicé la fuente `_herramientas/cursos/en/01.txt` y recompilé únicamente esta lección.
- **Pruebas/comprobaciones:** generé en memoria la lección desde la fuente y comprobé los avisos del compilador; JSON parseado; 6 IDs únicos; cada ejercicio de opciones tiene una sola respuesta correcta; campos de ordenar/escribir y fichas léxicas presentes; UTF-8 sin caracteres de reemplazo.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `008.json`.
- **Siguiente archivo pendiente:** `009.json`.

### 9/301 — `Idiomas/cursos/en/lessons/009.json`
- **Ruta:** `Idiomas/cursos/en/lessons/009.json`
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** no encontré errores claros. Las formas de país/nacionalidad, mayúsculas, negación y preguntas con «be» son coherentes; la guía de «country» ya usa «KÁN-tri» en la fuente.
- **Cambios realizados:** ninguno.
- **Pruebas/comprobaciones:** comparé el JSON con la lección generada en memoria desde `02.txt`; compilador sin avisos; JSON válido; UTF-8 limpio; 8 tareas con IDs únicos y una respuesta correcta por pregunta de selección.
- **Resultado:** correcto; no requiere cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `009.json`.
- **Siguiente archivo pendiente:** `010.json`.

### 10/301 — `Idiomas/cursos/en/lessons/010.json`
- **Ruta:** `Idiomas/cursos/en/lessons/010.json`
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** no encontré errores claros de gramática, traducción, respuestas o estructura. La lección enlaza profesiones con «a/an» y amplía «be» al plural sin contradicciones internas.
- **Cambios realizados:** ninguno.
- **Pruebas/comprobaciones:** comparé el JSON con la compilación en memoria desde `02.txt`; compilador sin avisos; JSON válido; UTF-8 limpio; 8 ejercicios con IDs únicos y soluciones completas; 21 fichas léxicas.
- **Resultado:** correcto; no requiere cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `010.json`.
- **Siguiente archivo pendiente:** `011.json`.

### 11/301 — `Idiomas/cursos/en/lessons/011.json`
- **Ruta:** `Idiomas/cursos/en/lessons/011.json`
- **Estado:** corregido.
- **Problemas encontrados:** la conversación mantenía el tratamiento formal «usted» en las preguntas y peticiones, pero una frase traducía «your» como «tu»; la traducción de «Can you speak slowly, please?» omitía «please».
- **Cambios realizados:** cambié «Tu inglés» por «Su inglés» y añadí «por favor» a la traducción de la petición, incluido el análisis de frase. Sincronicé `02.txt` y recompilé únicamente esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; 8 IDs únicos y una respuesta correcta por actividad de selección.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `011.json`.
- **Siguiente archivo pendiente:** `012.json`.

### 12/301 — `Idiomas/cursos/en/lessons/012.json`
- **Ruta:** `Idiomas/cursos/en/lessons/012.json`
- **Estado:** corregido.
- **Problemas encontrados:** seis tareas prácticamente repetían «He doesn't drive to work»; la lección anunciaba «don't» y «doesn't» pero solo practicaba «doesn't»; «early» y «weekday» estaban en las fichas sin aparecer en ningún ejemplo.
- **Cambios realizados:** expliqué la contracción «doesn't» y la forma base del verbo, contrasté sujetos plurales con singulares y diversifiqué las seis tareas. Integré «early» y «weekdays» en ejemplos y ejercicios. Sincronicé `02.txt` y recompilé solo esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; 6 tareas con IDs únicos y respuestas verificadas; ambos patrones negativos y el vocabulario objetivo están presentes.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `012.json`.
- **Siguiente archivo pendiente:** `013.json`.

### 13/301 — `Idiomas/cursos/en/lessons/013.json`
- **Ruta:** `Idiomas/cursos/en/lessons/013.json`
- **Estado:** corregido.
- **Problemas encontrados:** la lección titulada «Do and does in questions» repetía «Where do your friends study?» en cuatro tareas y solo practicaba preguntas con «do»; «nearby» figuraba como vocabulario sin aparecer en las actividades.
- **Cambios realizados:** añadí práctica equilibrada de preguntas con «do» y «does», incluida la forma base del verbo tras «does»; diversifiqué los ejercicios y usé «nearby» en ejemplos. Sincronicé `02.txt` y recompilé solo esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; 6 IDs únicos y una opción correcta por pregunta de selección; ambos patrones y el vocabulario objetivo comprobados.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `013.json`.
- **Siguiente archivo pendiente:** `014.json`.

### 14/301 — `Idiomas/cursos/en/lessons/014.json`
- **Ruta:** `Idiomas/cursos/en/lessons/014.json`
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis ejercicios repetían «She has got two brothers»; pese a mencionar la inversión en preguntas, no había ejemplos ni práctica interrogativa; «address» y «bicycle» aparecían en las fichas pero no en las tareas.
- **Cambios realizados:** añadí ejemplos de afirmación, contracciones y preguntas con «have/has»; varié la práctica y usé las fichas léxicas en contexto. Sincronicé `02.txt` y recompilé solo esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; 6 IDs únicos, opciones con una sola respuesta correcta y soluciones de ordenar/escribir; contenido gramatical y vocabulario comprobados.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `014.json`.
- **Siguiente archivo pendiente:** `015.json`.

### 15/301 — `Idiomas/cursos/en/lessons/015.json`
- **Ruta:** `Idiomas/cursos/en/lessons/015.json`
- **Estado:** corregido.
- **Problemas encontrados:** el formulario de Lucy usaba «his» para una mujer; el código postal de cinco cifras correspondía al formato estadounidense pese al contexto británico; la fecha de nacimiento no incluía el año; «April», «town», teléfono y pronombre aparecían como vocabulario oculto pese a ser nuevos; seis tareas repetían el mismo código postal.
- **Cambios realizados:** cambié a «her», añadí fichas visibles para los campos y el pronombre, completé la fecha con año y usé el formato alfanumérico «OX1 5AA». Diversifiqué comprensión lectora, traducción y práctica del vocabulario. Mantuve el número 020 7946 0182, que está dentro del rango de ficción que Ofcom reserva para Londres. Sincronicé `02.txt` y recompilé solo esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; 8 tareas con IDs únicos y soluciones completas; comprobé el formato de postcode en un ejemplo de Royal Mail y el rango de teléfono en Ofcom ([Royal Mail](https://www.royalmail.com/door-door-demo/check-availability/3), [Ofcom](https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama)).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `015.json`.
- **Siguiente archivo pendiente:** `016.json`.

### 16/301 — `Idiomas/cursos/en/lessons/016.json`
- **Ruta:** `Idiomas/cursos/en/lessons/016.json`
- **Estado:** corregido.
- **Problemas encontrados:** el cero se presentaba como «oh» de forma demasiado general; el teléfono de ejemplo no estaba en un rango ficticio reservado; las traducciones de direcciones conservaban el orden inglés; «old» no reflejaba bien su uso en la pregunta por la edad.
- **Cambios realizados:** matizé «zero/oh», sustituí el móvil por `07700 900 182`, pasé las direcciones a un orden natural en español y aclaré «old» como «de edad; viejo, mayor». Conservé completa la tabla del 0 al 20. Sincronicé `03.txt` y recompilé solo esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; 8 tareas con IDs únicos y respuestas verificadas; confirmé con Ofcom que `07700 900000–900999` es el rango móvil para ficción ([Ofcom](https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama)).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `016.json`.
- **Siguiente archivo pendiente:** `017.json`.

### 17/301 — `Idiomas/cursos/en/lessons/017.json`
- **Ruta:** `Idiomas/cursos/en/lessons/017.json`
- **Estado:** corregido.
- **Problemas encontrados:** la tabla tenía tres datos por fila pero solo dos encabezados; aparecían «haven't» y «hasn't» sin explicar cuándo se usan; «haven't» y «I've» tenían equivalencias españolas engañosas en el contexto de posesión; «his» era una ficha sin uso; los ejercicios repetían varias veces las mismas frases.
- **Cambios realizados:** reparé la tabla con columnas de persona, afirmativa, negativa y ejemplo; expliqué las formas negativas y las respuestas cortas, ajusté las fichas de contracciones, eliminé «his» sin uso y diversifiqué la práctica de vocabulario y gramática. Añadí una nota regional breve sobre «have got», acorde con Cambridge. Sincronicé `03.txt` y recompilé solo esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; tabla rectangular de 4 columnas; 8 tareas con IDs únicos y soluciones verificadas.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

### 18/301 — `Idiomas/cursos/en/lessons/018.json`
- **Ruta:** `Idiomas/cursos/en/lessons/018.json`
- **Estado:** corregido.
- **Problemas encontrados:** la tabla tenía cuatro celdas por fila y solo tres encabezados; la explicación decía que «any» nunca se traduce; el negativo «He hasn't got children» omitía el «any» que la misma lección enseñaba; la traducción de «we've/they've» daba «hemos/han» en lugar de «tenemos/tienen»; además, David decía ser hijo único pese a haber dicho que tenía una hermana.
- **Cambios realizados:** reparé la tabla, matizé la regla de «any», corregí glosas y traducciones, hice coherente el diálogo cambiando a la esposa de David como hija única, cambié «No tengo hermana» por «No tengo hermanas» y reemplacé un ejercicio duplicado de respuesta negativa por uno afirmativo. Sincronicé `03.txt` y recompilé solo esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; tabla rectangular de 4 columnas; 8 tareas con IDs únicos y soluciones completas; coherencia interna del diálogo comprobada.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `018.json`.
- **Siguiente archivo pendiente:** `019.json`.

### 19/301 — `Idiomas/cursos/en/lessons/019.json`
- **Ruta:** `Idiomas/cursos/en/lessons/019.json`
- **Estado:** corregido.
- **Problemas encontrados:** los ejemplos no aclaraban que el posesivo inglés no cambia con el número del sustantivo; «our» y «their» omitían formas plurales en español; la ficha nueva «his» faltaba; la pregunta sobre Sara usaba «His wife» sin referente explícito; había vocabulario de descripción sin ejemplo.
- **Cambios realizados:** precisé la regla de posesivos con singular/plural y el uso de «'s» con nombres singulares; amplié las traducciones, añadí «his», aclaré la pregunta sobre Sara, contextualicé «boy/girl/young» y cambié «la mujer de Jack» por «la esposa de Jack». Sincronicé `03.txt` y recompilé solo esta lección.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; tabla rectangular de 3 columnas; 8 tareas con IDs únicos y soluciones verificadas; vocabulario y posesivos comprobados.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `019.json`.
- **Siguiente archivo pendiente:** `020.json`.

### 20/301 — `Idiomas/cursos/en/lessons/020.json`
- **Ruta:** `Idiomas/cursos/en/lessons/020.json`
- **Estado:** corregido.
- **Problemas encontrados:** el teléfono ficticio era un número español con apariencia válida; el formato numérico de la fecha no explicaba si era día/mes o mes/día; la pregunta decía «ciudad» aunque la ficha y la etiqueta enseñan «town/localidad».
- **Cambios realizados:** enmascaré el móvil con `X` y expliqué el marcador, indiqué el orden día/mes/año, ajusté la pregunta a «localidad» y pulí las guías de pronunciación de «form» y «blank».
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; 8 tareas con IDs únicos y una opción correcta por ejercicio de selección; comprobé que no queda el número móvil original.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `020.json`.
- **Siguiente archivo pendiente:** `021.json`.

### 21/301 — `Idiomas/cursos/en/lessons/021.json`
- **Ruta:** `Idiomas/cursos/en/lessons/021.json`
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis tareas repetían «Those keys are yours»; la explicación decía que el pronombre sustituye al nombre, cuando sustituye al grupo posesivo completo; faltaban «his», «hers» y «ours»; «keys» y «those» eran vocabulario nuevo marcado como oculto; las traducciones omitían concordancia española.
- **Cambios realizados:** expliqué la diferencia entre determinante y pronombre, añadí una tabla con los seis pronombres posesivos y sus ejemplos, amplié las traducciones para género y número, hice visibles «keys» y «those» y diversifiqué los ejercicios.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; tabla rectangular; 6 tareas con IDs únicos y soluciones completas.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `021.json`.
- **Siguiente archivo pendiente:** `022.json`.

### 22/301 — `Idiomas/cursos/en/lessons/022.json`
- **Ruta:** `Idiomas/cursos/en/lessons/022.json`
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis ejercicios se centraban en «Three women work at the school»; aunque la explicación nombraba cuatro pares irregulares, solo practicaba «woman/women» y «child»; faltaban fichas visibles para «women», «men», «person» y «people»; «at» aparecía oculto pese a ser nuevo.
- **Cambios realizados:** añadí una tabla de singular/plural y ejemplos para los cuatro pares, incorporé práctica variada de «women», «children», «men» y «people» y mostré las fichas léxicas que se introducen aquí.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; tabla rectangular; 6 tareas con IDs únicos y soluciones verificadas.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `022.json`.
- **Siguiente archivo pendiente:** `023.json`.

### 23/301 — `Idiomas/cursos/en/lessons/023.json`
- **Ruta:** `Idiomas/cursos/en/lessons/023.json`
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis tareas repetían «Have you got any cousins?» sin practicar respuestas; el plural «cousins» era una ficha oculta aunque era nuevo; el título prometía preguntas y respuestas, pero no daba modelos de respuesta breve.
- **Cambios realizados:** añadí un diálogo breve con respuestas afirmativas y negativas, expliqué cuándo usar «any», hice visible «cousins» y diversifiqué vocabulario, traducción, comprensión y producción objetiva.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; diálogo de cuatro turnos; 6 tareas con IDs únicos y soluciones verificadas.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `023.json`.
- **Siguiente archivo pendiente:** `024.json`.

### 24/301 — `Idiomas/cursos/en/lessons/024.json`
- **Ruta:** `Idiomas/cursos/en/lessons/024.json`
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis tareas repetían «It's Jack's, not mine»; la explicación describía «whose» pero no lo practicaba en una pregunta; «umbrella» figuraba en vocabulario pero no aparecía en el contenido.
- **Cambios realizados:** añadí un diálogo breve que practica «Whose…?» y respuestas con nombre + «'s» y con pronombre posesivo; usé los dos sustantivos objetivo y varié los ejercicios.
- **Pruebas/comprobaciones:** compilador sin avisos; JSON válido y coincidente con la fuente; UTF-8 limpio; diálogo revisado; 6 tareas con IDs únicos y soluciones completas.
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.

- **Último archivo completado:** `024.json`.
- **Siguiente archivo pendiente:** `025.json`.

### 25/301 — Idiomas/cursos/en/lessons/025.json
- **Ruta:** Idiomas/cursos/en/lessons/025.json
- **Estado:** corregido.
- **Problemas encontrados:** la tabla de demostrativos no tenía encabezado para la columna de singular/plural; algunos ejemplos y traducciones no fijaban el género o la distancia; la aproximación de «these» y «keys» no reflejaba la vocal larga; una frase para completar no aclaraba que las llaves estaban cerca; el plural explicaba las terminaciones -es, -ies y el irregular «children» sin ejercicios para practicarlos.
- **Cambios realizados:** completé los encabezados y las glosas españolas; afiné las aproximaciones de pronunciación y la pista de proximidad; hice visible «child/children» y añadí tres ejercicios cortos sobre «watches», «families» y «children»; indiqué que las reglas de plural descritas son frecuentes y tienen excepciones; actualicé tanto la fuente como el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación de la lección; comparación exacta entre la fuente compilada y el JSON; lectura JSON/UTF-8; verificación de que la tabla sea rectangular; revisión de las frases del diálogo; comprobación de 11 ejercicios, IDs únicos y exactamente una solución en cada ejercicio con opciones.
- **Resultado de las pruebas:** correcto; compilación sin avisos asociados a esta lección, fuente y JSON coincidentes, tabla válida, 11 ejercicios resueltos e IDs únicos; sin caracteres de reemplazo UTF-8.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 025.json.
- **Siguiente archivo pendiente:** 026.json.

### 26/301 — Idiomas/cursos/en/lessons/026.json
- **Ruta:** Idiomas/cursos/en/lessons/026.json
- **Estado:** corregido.
- **Problemas encontrados:** la tabla tenía vacío el encabezado de la primera columna; el anuncio de lectura podía confundirse con el piso del diálogo pese a describir una vivienda distinta; dos traducciones del diálogo eran poco naturales o imprecisas; un distractor sobre «some» admitía lecturas contextuales y no era una opción inequívocamente incorrecta; faltaba una ficha visible para «there are».
- **Cambios realizados:** etiqueté la columna como «Forma»; titulé la lectura «Anuncio de otro piso»; ajusté «It's nice» y «Is there a garden?» al español; reformulé la pregunta sobre «There aren't any chairs» y añadí la ficha de «there are»; actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación de la lección; comparación exacta fuente/JSON; lectura JSON y UTF-8; revisión de tabla, diálogo, lectura, traducciones, ocho ejercicios, IDs únicos y solución única por ejercicio.
- **Resultado de las pruebas:** correcto; sin avisos asociados a la lección, fuente y JSON coincidentes, tabla rectangular, traducciones presentes y ocho ejercicios resueltos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 026.json.
- **Siguiente archivo pendiente:** 027.json.

### 27/301 — Idiomas/cursos/en/lessons/027.json
- **Ruta:** Idiomas/cursos/en/lessons/027.json
- **Estado:** corregido.
- **Problemas encontrados:** dos explicaciones de distractores afirmaban erróneamente que «next to» y «behind» solo se usan con una cosa; la explicación de «am» era únicamente «No.»; el título «Mi mascota» estaba en singular pese a que el diálogo enumera tres.
- **Cambios realizados:** corregí las dos explicaciones de preposiciones, aclaré que «am» se usa con «I» y puse el título del diálogo en plural; actualicé la fuente y el JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación de la lección; comparación exacta fuente/JSON; lectura JSON y UTF-8; tabla rectangular; revisión de traducciones de diálogo; ocho ejercicios con IDs únicos y una solución cada uno.
- **Resultado de las pruebas:** correcto; compilación sin avisos asociados, fuente y JSON coincidentes y comprobaciones estructurales satisfactorias.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 027.json.
- **Siguiente archivo pendiente:** 028.json.

### 28/301 — Idiomas/cursos/en/lessons/028.json
- **Ruta:** Idiomas/cursos/en/lessons/028.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis actividades repetían «She has an umbrella», sin practicar «a university» ni el uso de «the» al volver a mencionar algo; las explicaciones de dos distractores no justificaban la respuesta; la tarea de escritura decía «Tiene un paraguas», sin especificar quién; «umbrella» estaba oculto en vocabulario pese a ser el ejemplo central.
- **Cambios realizados:** reorganicé las seis actividades para practicar «a/an» por sonido inicial, primera mención y «the» para algo conocido; mejoré explicaciones y traducciones; precisé el sujeto «Ella» en la consigna de escritura; mostré «umbrella» en vocabulario; actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación; comparación exacta fuente/JSON; JSON y UTF-8; seis ejercicios con IDs únicos y soluciones verificadas; verificación de variedad y presencia de las tres pautas de artículos.
- **Resultado de las pruebas:** correcto; compilación sin avisos asociados, fuente y JSON coincidentes y seis ejercicios resueltos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 028.json.
- **Siguiente archivo pendiente:** 029.json.

### 29/301 — Idiomas/cursos/en/lessons/029.json
- **Ruta:** Idiomas/cursos/en/lessons/029.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis actividades repetían la misma oración plural; el título prometía contrastar singular y plural, pero no había práctica de «there is» con singular, incontable o preguntas; el bloque de vocabulario estaba vacío.
- **Cambios realizados:** añadí ejemplos y práctica diferenciada para sustantivos singulares, plurales e incontables, además de preguntas; diversifiqué las seis actividades; incorporé «water» como vocabulario visible y dejé un bloque no vacío; actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación; comparación exacta fuente/JSON; verificación JSON/UTF-8; seis ejercicios con IDs únicos y soluciones; comprobación de contraste singular/plural/incontable, inversión interrogativa y vocabulario.
- **Resultado de las pruebas:** correcto; sin avisos asociados a la lección, fuente/JSON coincidentes y seis ejercicios con solución.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 029.json.
- **Siguiente archivo pendiente:** 030.json.

### 30/301 — Idiomas/cursos/en/lessons/030.json
- **Ruta:** Idiomas/cursos/en/lessons/030.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis actividades repetían «The shoes are under the bed»; solo se practicaba «under» aunque la lección enumera varias preposiciones; el bloque de vocabulario estaba vacío y «shoe/shoes» quedaba oculto.
- **Cambios realizados:** reemplacé las tareas repetidas por siete ejercicios breves que practican «in», «on», «under», «next to», «behind», «between» e «in front of»; hice visibles «shoe/shoes» con pronunciación aproximada; mantuve el ejemplo original y completé la explicación.
- **Pruebas o comprobaciones ejecutadas:** compilación; fuente compilada comparada con el JSON; lectura UTF-8/JSON; revisión de siete ejercicios, IDs únicos y soluciones; comprobación de vocabulario no vacío y presencia de las siete preposiciones.
- **Resultado de las pruebas:** correcto; compilación sin avisos asociados y fuente/JSON coincidentes.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 030.json.
- **Siguiente archivo pendiente:** 031.json.

### 31/301 — Idiomas/cursos/en/lessons/031.json
- **Ruta:** Idiomas/cursos/en/lessons/031.json
- **Estado:** corregido.
- **Problemas encontrados:** «in the night» aparecía como distractor aunque es válido en contextos concretos; el ejercicio de desayuno no delimitaba el sentido de «have» frente a «make/get»; la lectura no usaba «have lunch», «in the afternoon» ni «go home» pese a incluirlos en vocabulario; dos análisis traducían expresiones de manera demasiado literal.
- **Cambios realizados:** contextualicé «at night» como expresión habitual de rutina; precisé el contraste entre desayunar y preparar el desayuno; añadí el almuerzo a la una y la vuelta a casa a la lectura; corregí los análisis de «have breakfast», «in the evening» y «go to bed»; aclaré otros distractores.
- **Pruebas o comprobaciones ejecutadas:** compilación; comparación fuente/JSON; tabla rectangular; JSON/UTF-8; ocho ejercicios con IDs únicos y solución; revisión de traducciones de las siete frases de lectura.
- **Resultado de las pruebas:** correcto; compilador sin avisos asociados, fuente y JSON coincidentes; ocho tareas con solución y siete frases de lectura traducidas.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 031.json.
- **Siguiente archivo pendiente:** 032.json.

### 32/301 — Idiomas/cursos/en/lessons/032.json
- **Ruta:** Idiomas/cursos/en/lessons/032.json
- **Estado:** corregido.
- **Problemas encontrados:** la tabla y el título español anunciaban «it», pero no lo mostraban; se explicaba el cambio consonante + «y» a «-ies» sin practicarlo; la respuesta breve permitía tanto la forma corta como la larga aunque el hueco solo daba opciones cortas.
- **Cambios realizados:** añadí la fila afirmativa, negativa e interrogativa de «it»; alineé el título español; incorporé una pregunta sobre «study → studies» y su ficha; indiqué que la respuesta breve debe ser contraída; afiné la explicación de «go → goes».
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación fuente/JSON; JSON/UTF-8; tabla rectangular con fila de «it»; nueve ejercicios con IDs únicos y solución verificada; revisión de texto y diálogo.
- **Resultado de las pruebas:** correcto; compilación sin avisos asociados, fuente y JSON coincidentes y nueve ejercicios completos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 032.json.
- **Siguiente archivo pendiente:** 033.json.

### 33/301 — Idiomas/cursos/en/lessons/033.json
- **Ruta:** Idiomas/cursos/en/lessons/033.json
- **Estado:** corregido.
- **Problemas encontrados:** el título del horario semanal podía sugerir que incluía los siete días aunque solo mostraba cuatro; una nota sobre «I'm late» incluía la traducción no natural «estoy tarde»; no había práctica de la posición de los adverbios con «to be».
- **Cambios realizados:** aclaré que la lectura recoge algunos días del horario; quité la nota literal confusa; cambié el ejercicio de ordenar para practicar «She is never late» y precisar la posición del adverbio con «to be».
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación fuente/JSON; tablas de horas y días; ocho ejercicios con IDs únicos y soluciones; traducciones de diálogo y lectura; UTF-8.
- **Resultado de las pruebas:** correcto; sin avisos asociados a la lección, fuente/JSON coincidentes, siete días en la tabla y todos los ejercicios resueltos.
- **Bloqueos, dudas o decisiones pendientes:** la lección agrupa hora, días y fin de semana, frecuencia y preposiciones temporales; valorar si dividirla requiere una decisión curricular y reajustar la secuencia. No la dividí en esta revisión porque alteraría la organización del curso.

- **Último archivo completado:** 033.json.
- **Siguiente archivo pendiente:** 034.json.

### 34/301 — Idiomas/cursos/en/lessons/034.json
- **Ruta:** Idiomas/cursos/en/lessons/034.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis actividades repetían «Today she is working from home», así que no practicaban el contraste prometido con el presente simple; se usaba «weekday» sin aparecer en el contenido; el vocabulario estaba vacío y «working», forma central, quedaba oculto.
- **Cambios realizados:** expliqué el presente simple para hábitos y el continuo como «am/is/are + -ing» para acciones en curso o situaciones temporales; reescribí las seis actividades para cubrir ambos tiempos; mostré «working» y retiré el término «weekday» que no se utilizaba; coloqué la pista del hueco en el campo correcto de la fuente.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación fuente/JSON; lectura JSON/UTF-8; seis ejercicios con IDs únicos y solución; comprobación de que la frase y la pista se compilen en campos separados.
- **Resultado de las pruebas:** correcto; compilación sin avisos asociados, fuente/JSON coincidentes y seis ejercicios con solución.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 034.json.
- **Siguiente archivo pendiente:** 035.json.

### 35/301 — Idiomas/cursos/en/lessons/035.json
- **Ruta:** Idiomas/cursos/en/lessons/035.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis actividades repetían «She isn't wearing her new coat»; el título y la explicación incluían preguntas, pero ningún ejercicio las practicaba; «coat» y «wearing» eran palabras nuevas ocultas.
- **Cambios realizados:** varié las tareas para practicar preguntas y negaciones con diferentes sujetos; mostré «coat», «wearing» y «waiting» en vocabulario; añadí formas -ing y soluciones claras; limité la consigna de escritura a «now» para concretar la respuesta esperada.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación fuente/JSON; lectura JSON/UTF-8; seis ejercicios con IDs únicos y soluciones; verificación de preguntas, negaciones, fichas visibles y consigna de escritura.
- **Resultado de las pruebas:** correcto; sin avisos asociados a la lección, fuente y JSON coincidentes y seis ejercicios resueltos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 035.json.
- **Siguiente archivo pendiente:** 036.json.

### 36/301 — Idiomas/cursos/en/lessons/036.json
- **Ruta:** Idiomas/cursos/en/lessons/036.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis actividades repetían «They are usually at home on Fridays»; no había práctica de la posición del adverbio ante un verbo principal ni de «never» sin «don't», pese a explicarse ambas reglas.
- **Cambios realizados:** varié las seis tareas para practicar «often» antes del verbo, adverbios después de «be» y la negación estándar con «never»; añadí «never» al diccionario oculto para permitir consultar su significado; precisé las explicaciones y consigna de escritura.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación fuente/JSON; JSON/UTF-8; seis ejercicios con IDs únicos y respuesta comprobada; revisión del contraste de orden y de la doble negación.
- **Resultado de las pruebas:** correcto; sin avisos asociados a la lección, fuente y JSON coincidentes y seis tareas resueltas.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 036.json.
- **Siguiente archivo pendiente:** 037.json.

### 37/301 — Idiomas/cursos/en/lessons/037.json
- **Ruta:** Idiomas/cursos/en/lessons/037.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis actividades repetían «My birthday is in October»; aunque el título incluía «in», «on» y «at», solo se practicaba «in»; «birthday» aparecía oculto y «appointment» no se usaba en una frase.
- **Cambios realizados:** reemplacé las repeticiones por ejercicios distintos sobre horas, días, meses, fechas y partes del día; usé «appointment» en ejemplos naturales; hice visibles «appointment», «birthday» y «October».
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación fuente/JSON; JSON/UTF-8; seis tareas con IDs únicos y soluciones; comprobación de «in/on/at», fecha, partes del día y vocabulario visible.
- **Resultado de las pruebas:** correcto; compilación sin avisos asociados, fuente/JSON coincidentes y seis tareas resueltas.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 037.json.
- **Siguiente archivo pendiente:** 038.json.

### 38/301 — Idiomas/cursos/en/lessons/038.json
- **Ruta:** Idiomas/cursos/en/lessons/038.json
- **Estado:** corregido.
- **Problemas encontrados:** la pregunta «Sara no toma café» no expresaba la misma preferencia que «I don't like coffee»; el hueco del desayuno aceptaba varias comidas posibles sin una pista; la oración para ordenar no llevaba signo de interrogación.
- **Cambios realizados:** cambié la consigna a «A Sara no le gusta el café»; limité el hueco a la información del diálogo y ajusté sus distractores; añadí el signo de interrogación a «Do you like coffee?».
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación fuente/JSON; JSON/UTF-8; nueve ejercicios con IDs únicos y soluciones; verificación de pregunta/traducción, contexto del desayuno, puntuación y traducciones del diálogo.
- **Resultado de las pruebas:** correcto; sin avisos asociados a la lección, fuente/JSON coincidentes y nueve tareas resueltas.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 038.json.
- **Siguiente archivo pendiente:** 039.json.

### 39/301 — Idiomas/cursos/en/lessons/039.json
- **Ruta:** Idiomas/cursos/en/lessons/039.json
- **Estado:** corregido.
- **Problemas encontrados:** algunos usos de «the» aparecían sin que el texto hubiese introducido antes el objeto; el hueco de «any milk» carecía de contexto neutro; «the egg is for ___» no identificaba el tipo de palabra esperado.
- **Cambios realizados:** introduje la ensalada y la leche/agua antes de volver a nombrarlas con «the»; precisé los contextos de «any» y del pronombre de objeto; amplié el ejercicio de audio para reutilizar «an», «some», «the» y «her».
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación fuente/JSON; JSON/UTF-8; tablas rectangulares; nueve ejercicios con IDs únicos y soluciones; secuencia primera mención/referencia conocida; traducciones del texto.
- **Resultado de las pruebas:** correcto; sin avisos asociados, fuente/JSON coincidentes y nueve ejercicios completos.
- **Bloqueos, dudas o decisiones pendientes:** la lección combina tres bloques extensos (artículos, cantidades con contables/incontables y pronombres de objeto), dos tablas, 19 fichas léxicas y nueve ejercicios. Valorar si dividirla requiere una decisión curricular y reajustar la secuencia; se deja para revisión manual y no se altera aquí la estructura.

### 40/301 — Idiomas/cursos/en/lessons/040.json
- **Ruta:** Idiomas/cursos/en/lessons/040.json
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo no coincidía con el café del título ni con el primer ejercicio; el pedido (té £2, sándwich £5 y agua) tenía una cuenta de £6, sin precio para el agua.
- **Cambios realizados:** cambié el pedido a café (£3), sándwich (£5) y vaso de agua (£1), añadí el agua a la carta y ajusté la cuenta a £9; adapté la traducción del pedido. Actualicé únicamente la fuente de la lección y su JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente; comparación exacta fuente/JSON; lectura UTF-8 y parseo JSON; revisión de traducciones en texto y diálogo; IDs únicos y soluciones; cálculo de los precios de la carta frente al pedido.
- **Resultado de las pruebas:** correcto; cero avisos asociados a esta lección, 13 bloques completos, ocho ejercicios con solución única y cuenta de £9 que coincide con la carta.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 41/301 — Idiomas/cursos/en/lessons/041.json
- **Ruta:** Idiomas/cursos/en/lessons/041.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** no se encontraron errores claros, contradicciones, traducciones incorrectas ni datos incompletos. La lista y el diálogo usan cantidades coherentes; los ejercicios practican contables e incontables.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente; comparación exacta fuente/JSON; parseo UTF-8/JSON; traducciones de lectura y diálogo; tabla rectangular; IDs únicos y solución única en preguntas de opción; inspección de los ejemplos de much/many/a lot of/not much/not many.
- **Resultado de las pruebas:** correcto; fuente y JSON coinciden, sin avisos asociados y ocho ejercicios con respuesta comprobable.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 42/301 — Idiomas/cursos/en/lessons/042.json
- **Ruta:** Idiomas/cursos/en/lessons/042.json
- **Estado:** corregido.
- **Problemas encontrados:** de seis ejercicios, cuatro repetían casi la misma oración «two bottles of water» y la lección apenas enseñaba la distinción nombrada en su título; bowl y piece aparecían en vocabulario, pero no se aplicaban.
- **Cambios realizados:** aclaré singular/plural de los contables, a/an con singular contable y cómo expresar porciones de incontables; añadí ejemplos con apple, rice, water y bread; sustituí las repeticiones por seis ejercicios variados sobre la regla y reutilicé bowl/piece en contexto. Actualicé la fuente y su JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente; comparación exacta fuente/JSON; parseo UTF-8/JSON; comprobación de vocabulario traducido, seis ejercicios distintos, IDs únicos, respuestas únicas y formas gramaticales previstas.
- **Resultado de las pruebas:** correcto; fuente y JSON coinciden, sin avisos asociados y seis ejercicios con respuesta comprobable.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 43/301 — Idiomas/cursos/en/lessons/043.json
- **Ruta:** Idiomas/cursos/en/lessons/043.json
- **Estado:** corregido.
- **Problemas encontrados:** cuatro de seis ejercicios repetían «There isn't any bread left»; no se contrastaba de forma práctica «some» con contables plurales e incontables ni se ejercitaban preguntas neutras y peticiones/ofrecimientos.
- **Cambios realizados:** aclaré los usos habituales de «some» y «any» en afirmativas, negativas y preguntas; incluí «some» en ofrecimientos y peticiones corteses; añadí ejemplos contables e incontables; reemplacé las repeticiones por seis ejercicios variados y añadí «fridge» como apoyo léxico oculto. Actualicé la fuente y su JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación desde fuente; comparación exacta fuente/JSON; parseo UTF-8/JSON; traducciones; seis ejercicios con IDs únicos y una solución correcta cada uno; comprobación de los patrones gramaticales declarados.
- **Resultado de las pruebas:** correcto; fuente y JSON coinciden, sin avisos asociados y seis ejercicios completos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 44/301 — Idiomas/cursos/en/lessons/044.json
- **Ruta:** Idiomas/cursos/en/lessons/044.json
- **Estado:** corregido.
- **Problemas encontrados:** cuatro ejercicios repetían «We bought a loaf of bread»; la lección adelantaba «bought», forma irregular enseñada más adelante; «menu» figuraba en el vocabulario sin contexto ni uso; faltaba aplicar «a slice of».
- **Cambios realizados:** centré la explicación en medidas y porciones contables con los alimentos incontables; añadí una lista con barra, lonchas y botella; cambié los ejemplos al presente ya aprendido, incorporé «slice» en contexto, retiré «menu» sin uso y varié los ejercicios. Corregí un distractor de traducción que se solapaba semánticamente con la respuesta. Actualicé la fuente y su JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta fuente/JSON; parseo UTF-8/JSON; traducciones del texto; seis ejercicios con IDs únicos y solución única; verificación de pluralización de recipiente/porción y de que no haya «bought» en la lección.
- **Resultado de las pruebas:** correcto; cero avisos asociados, fuente/JSON coincidentes y contenidos clave practicados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 45/301 — Idiomas/cursos/en/lessons/045.json
- **Ruta:** Idiomas/cursos/en/lessons/045.json
- **Estado:** corregido.
- **Problemas encontrados:** el texto no tenía formato ni datos de menú pese al título; las preguntas de ingredientes no practicaban «Does ... contain ...?»; tres ejercicios repetían la misma oración de ensalada y precio; faltaba una comprobación de precios.
- **Cambios realizados:** convertí la lectura en un menú bilingüe con precios e ingredientes consistentes; expliqué «Does + sujeto + contain» y «without»; varié los ejercicios para cubrir comprensión lectora, pregunta por ingredientes, petición, precio y traducción. Conservé el recordatorio de consultar al camarero por otros ingredientes. Actualicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación, comparación exacta fuente/JSON, parseo UTF-8/JSON, traducciones, ocho ejercicios con IDs únicos y respuesta única (más dos variantes aceptadas en escritura), cotejo de precios/ingredientes contra la lectura.
- **Resultado de las pruebas:** correcto; cero avisos asociados, menú y soluciones coherentes y todos los campos completos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 46/301 — Idiomas/cursos/en/lessons/046.json
- **Ruta:** Idiomas/cursos/en/lessons/046.json
- **Estado:** corregido.
- **Problemas encontrados:** la ficha léxica incluía «clothes», pero la explicación solo aclaraba el plural de «trousers», «jeans» y «shoes»; podía quedar sin explicar su concordancia plural.
- **Cambios realizados:** añadí que «clothes» va con verbo plural y un ejemplo con traducción. Actualicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; verificación de tabla y ocho turnos bilingües; ocho ejercicios con IDs únicos y una respuesta correcta; comprobación de las formas de presente continuo y concordancia plural.
- **Resultado de las pruebas:** correcto; cero avisos asociados y todo el material coincide con la fuente.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 47/301 — Idiomas/cursos/en/lessons/047.json
- **Ruta:** Idiomas/cursos/en/lessons/047.json
- **Estado:** corregido.
- **Problemas encontrados:** la lista de precios marcaba los zapatos a £35, pero el diálogo decía £80; la traducción reproducía el total incorrecto.
- **Cambios realizados:** cambié la respuesta del diálogo a «They're 35 pounds» y «Son 35 libras», para que coincida con la lista y las preguntas de lectura. Actualicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; revisión de tabla, traducciones y diálogo; cotejo automático del precio de zapatos; ocho ejercicios con IDs únicos y solución única.
- **Resultado de las pruebas:** correcto; cero avisos asociados y lista, diálogo y ejercicios coherentes.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 48/301 — Idiomas/cursos/en/lessons/048.json
- **Ruta:** Idiomas/cursos/en/lessons/048.json
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo cambiaba de referencias a móviles «this/that» a «black/white» sin que esos colores apareciesen en los datos; el precio del diálogo tampoco podía contrastarse con etiquetas que solo indicaban A/B; la afirmación «newer» no tenía apoyo en la ficha.
- **Cambios realizados:** hice que las etiquetas identifiquen Phone A y Phone B con precio, tamaño y antigüedad; adapté el diálogo para usar esos mismos nombres y precisé que «it» se refiere al móvil B. Actualicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; tabla rectangular y diálogo bilingüe; cotejo de precios, tamaño y antigüedad; siete ejercicios con IDs únicos y respuesta única.
- **Resultado de las pruebas:** correcto; cero avisos asociados y referencias del diálogo respaldadas por las etiquetas.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 49/301 — Idiomas/cursos/en/lessons/049.json
- **Ruta:** Idiomas/cursos/en/lessons/049.json
- **Estado:** corregido.
- **Problemas encontrados:** cuatro ejercicios repetían «The shoes cost thirty pounds»; pese al título no había precios para leer; los ejemplos de libras y dólares aparecían solo en una explicación sin práctica; faltaba distinguir el punto decimal £4.50/£3.05.
- **Cambios realizados:** añadí una lista breve de precios del Reino Unido y EE. UU.; expliqué y ejemplifiqué libras/peniques y dólares/centavos, incluidos ceros decimales; aclaré «price» como sustantivo y «cost» como verbo; reemplacé las repeticiones por ocho ejercicios de lectura y aplicación. Aclaré que el símbolo $ corresponde a dólares estadounidenses en estos ejemplos y mejoré las traducciones de la lista.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta fuente/JSON; parseo UTF-8/JSON; verificación de tres precios bilingües; comprobación de los ejemplos de moneda y ocho ejercicios con IDs únicos y respuestas.
- **Resultado de las pruebas:** correcto; cero avisos asociados, precios, símbolos y respuestas coherentes.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 50/301 — Idiomas/cursos/en/lessons/050.json
- **Ruta:** Idiomas/cursos/en/lessons/050.json
- **Estado:** corregido.
- **Problemas encontrados:** el mismo ejemplo sobre una camisa rebajada se repetía en cuatro ejercicios; «size» no se mostraba en el vocabulario; la lectura no especificaba que la política de devoluciones correspondía a una tienda concreta; el pasivo «cannot be returned» adelantaba una forma no explicada.
- **Cambios realizados:** rehice la lectura como una etiqueta y un aviso de tienda con talla, precio y temperatura; aclaré que las condiciones pertenecen a esa tienda; cambié el aviso a presente activo («We don't accept returns…»); añadí vocabulario visible de etiquetas y variedad de comprensión, léxico, traducción y escritura. Actualicé la fuente y su JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; cotejo de talla, precio, lavado y aviso con las preguntas; nueve ejercicios con IDs únicos y solución única (dos variantes aceptadas en escritura).
- **Resultado de las pruebas:** correcto; cero avisos asociados, campos/traducciones completos y preguntas coherentes con la lectura.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 51/301 — Idiomas/cursos/en/lessons/051.json
- **Ruta:** Idiomas/cursos/en/lessons/051.json
- **Estado:** corregido.
- **Problemas encontrados:** no había vocabulario visible ni datos de precio pese al título; cuatro de seis ejercicios repetían «The blue coat is bigger than the red one»; la lección duplicaba la regla del 048 sin práctica contextual de comparación de etiquetas.
- **Cambios realizados:** añadí etiquetas bilingües con talla y precio; centré la explicación en comparativos de precio/talla y en «one» para no repetir el sustantivo; reemplacé la repetición por ocho ejercicios variados de lectura, comparación, traducción, orden y escritura. Actualicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; cotejo de las tallas y precios con las respuestas; vocabulario traducido; ocho ejercicios con IDs únicos y una respuesta correcta (dos formas aceptadas en escritura).
- **Resultado de las pruebas:** correcto; cero avisos asociados y hechos, comparativos y soluciones coherentes.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 52/301 — Idiomas/cursos/en/lessons/052.json
- **Ruta:** Idiomas/cursos/en/lessons/052.json
- **Estado:** corregido.
- **Problemas encontrados:** la respuesta sobre la estación añadía «Turn right at the museum» sin un mapa o ruta que permitiera relacionar ese giro con el destino; el imperativo negativo aparecía sin traducción ni práctica.
- **Cambios realizados:** dejé la respuesta de ubicación en «It's opposite the park» para evitar una indicación espacial imposible de comprobar; añadí la traducción y un ejercicio del imperativo negativo. El resto de las referencias sí coincide con la ficha de visitantes. Actualicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; comprobación de traducciones, diálogo, datos de ubicación y ocho ejercicios con IDs únicos y respuesta única.
- **Resultado de las pruebas:** correcto; cero avisos asociados y referencias de ruta coherentes con la información disponible.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 53/301 — Idiomas/cursos/en/lessons/053.json
- **Ruta:** Idiomas/cursos/en/lessons/053.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** no se hallaron errores claros, contradicciones ni datos incompletos. Horarios, andenes, tarifas, diálogo y preguntas coinciden; las equivalencias de transporte y billetes son adecuadas.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta fuente/JSON; parseo UTF-8/JSON; revisión de traducciones de listas y diálogos; cotejo de horas, andenes y precios; ocho ejercicios con IDs únicos y solución única.
- **Resultado de las pruebas:** correcto; cero avisos asociados y ocho ejercicios completos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 54/301 — Idiomas/cursos/en/lessons/054.json
- **Ruta:** Idiomas/cursos/en/lessons/054.json
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo usaba «Can you help me?» como petición, pero la explicación solo presentaba las preguntas con «can» como preguntas sobre habilidades; no señalaba el cambio de función según el contexto.
- **Cambios realizados:** añadí una aclaración breve con traducción que contrasta pregunta de habilidad y petición. Actualicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; vocabulario traducido; siete turnos bilingües; seis ejercicios con IDs únicos y respuesta única; verificación de afirmativa, negativa, pregunta y petición.
- **Resultado de las pruebas:** correcto; cero avisos asociados y reglas/ejemplos completos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 55/301 — Idiomas/cursos/en/lessons/055.json
- **Ruta:** Idiomas/cursos/en/lessons/055.json
- **Estado:** corregido.
- **Problemas encontrados:** una pregunta decía qué objeto usa Ben para cargar el móvil y marcaba «socket»; el cargador es el dispositivo que lo carga y el enchufe es la toma de corriente. La escritura decía «pedir prestado un ordenador» aunque la respuesta pide permiso para usarlo. Había cuatro tarjetas de vocabulario que no se usaban en la lección.
- **Cambios realizados:** reformulé la comprensión para preguntar qué pide usar Ben justo antes de solicitar el cargador; ajusté el enunciado de escritura a la respuesta; precisé la diferencia entre pedir permiso («Can I…?») y pedir que alguien haga algo («Can you…?»); retiré las tarjetas sin contexto y usé «permission» en la explicación. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; diez términos de vocabulario traducidos; diálogo bilingüe; ocho ejercicios con IDs únicos y solución única; cotejo del referente de la pregunta sobre el enchufe.
- **Resultado de las pruebas:** correcto; cero avisos asociados y ejercicios coherentes con el diálogo.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 56/301 — Idiomas/cursos/en/lessons/056.json
- **Ruta:** Idiomas/cursos/en/lessons/056.json
- **Estado:** corregido.
- **Problemas encontrados:** cuatro de seis ejercicios repetían una sola instrucción; la pregunta para pedir una ruta y «cross the road» aparecían en la explicación, pero no se aplicaban a una ruta completa.
- **Cambios realizados:** añadí un diálogo breve desde la pregunta «How do I get to…?» hasta cruzar en el semáforo y localizar el museo a la derecha; incorporé el vocabulario de los pasos y reemplacé la repetición por ocho ejercicios de comprensión y uso. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; seis términos traducidos usados en contexto; diálogo bilingüe; ocho ejercicios con IDs únicos y solución única; cotejo de cada respuesta de ruta con el diálogo.
- **Resultado de las pruebas:** correcto; cero avisos asociados y secuencia de indicaciones coherente.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 57/301 — Idiomas/cursos/en/lessons/057.json
- **Ruta:** Idiomas/cursos/en/lessons/057.json
- **Estado:** corregido.
- **Problemas encontrados:** el supuesto horario era una lista de frases sin columnas de llegada; varios ejercicios preguntaban por una llegada de autobús ausente; se repetía esa frase en cuatro tareas. «The next train» tampoco tenía un punto de referencia que determinara cuál era el siguiente servicio.
- **Cambios realizados:** construí una tabla bilingüe con servicio, salida, llegada y andén para dos trenes a Oxford; vinculé cada pregunta a sus datos y fijé el ejercicio de llegada como Train 2. Reemplacé las repeticiones por ocho tareas diversas y quité dos entradas léxicas sin uso. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; tabla rectangular; cotejo de las cuatro horas y los dos andenes; seis términos traducidos; ocho ejercicios con IDs únicos y respuesta única (dos formatos horarios aceptados en escritura).
- **Resultado de las pruebas:** correcto; cero avisos asociados y todas las respuestas se verifican en la tabla.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 58/301 — Idiomas/cursos/en/lessons/058.json
- **Ruta:** Idiomas/cursos/en/lessons/058.json
- **Estado:** corregido.
- **Problemas encontrados:** la hora de salida del tren directo era 09:05 en el aviso, pero 09:10 en la explicación y cuatro ejercicios; «cancelled» se explicaba sin aparecer en la lectura; el significado de «direct» no estaba aclarado.
- **Cambios realizados:** rehice el aviso con servicios identificables: tren retrasado, autobús cancelado, transbordo en York y tren directo a Leeds a las 09:05; aclaré que «direct» significa que no se cambia de tren, aunque puede haber paradas. Reemplacé las repeticiones por ocho tareas diversas. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; cuatro avisos bilingües; cotejo de destinos y horas; vocabulario con traducción; ocho ejercicios con IDs únicos y una solución correcta.
- **Resultado de las pruebas:** correcto; cero avisos asociados y avisos/preguntas coherentes.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.


### 59/301 — Idiomas/cursos/en/lessons/059.json
- **Ruta:** Idiomas/cursos/en/lessons/059.json
- **Estado:** corregido.
- **Problemas encontrados:** «on Saturday» contradecía la traducción habitual «los sábados»; «Play, go y do» no enseñaba ningún ejemplo de «do»; «sport» no se usaba; «because» aparecía explicado pero no contextualizado; un ejercicio pedía un hábito semanal en singular.
- **Cambios realizados:** alineé el diálogo y el ejercicio con «on Saturdays/on Sundays»; añadí «do yoga» y su vocabulario; usé «sport» en un ejemplo y «because» en el diálogo; incorporé un ejercicio para distinguir play/go/do. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; diálogo bilingüe; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta de opción múltiple; cotejo de las formas meta y el vocabulario.
- **Resultado de las pruebas:** correcto; cero avisos asociados y las formas enseñadas aparecen aplicadas en contexto y ejercicios.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 60/301 — Idiomas/cursos/en/lessons/060.json
- **Ruta:** Idiomas/cursos/en/lessons/060.json
- **Estado:** corregido.
- **Problemas encontrados:** la traducción de «It's hot and sunny» omitía el segundo verbo y resultaba poco natural en español.
- **Cambios realizados:** ajusté la frase y su análisis a «Hace calor y hace sol». Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; vocabulario climático; diálogo bilingüe; ocho ejercicios con IDs únicos y solución única en cada pregunta cerrada; cotejo de la previsión con las preguntas.
- **Resultado de las pruebas:** correcto; cero avisos asociados y previsión/ejercicios coherentes.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 61/301 — Idiomas/cursos/en/lessons/061.json
- **Ruta:** Idiomas/cursos/en/lessons/061.json
- **Estado:** corregido.
- **Problemas encontrados:** Emma decía que su cumpleaños era en marzo y después que era en julio; además, la respuesta sobre el verano no contestaba con claridad la pregunta.
- **Cambios realizados:** rehice la respuesta como «Yes! I love summer, but my birthday is in March, in spring», conservando marzo y haciendo explícita la respuesta afirmativa. Actualicé la traducción y el análisis.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; los 12 meses presentes; diálogo bilingüe coherente; ocho ejercicios con IDs únicos y una respuesta válida por opción múltiple.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 62/301 — Idiomas/cursos/en/lessons/062.json
- **Ruta:** Idiomas/cursos/en/lessons/062.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; la tabla ordinal va del 1 al 20, el calendario y el diálogo concuerdan, y se distinguen formatos británicos y estadounidenses.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; tabla del 1 al 20 en orden; diálogo bilingüe; ocho ejercicios con IDs únicos y una respuesta correcta en cada pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 63/301 — Idiomas/cursos/en/lessons/063.json
- **Ruta:** Idiomas/cursos/en/lessons/063.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; se cubren las formas ordinales del 21 al 31 y las fechas del texto coinciden con las respuestas.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; presencia de los once ordinales 21–31; lista bilingüe; ocho ejercicios con IDs únicos y una solución correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 64/301 — Idiomas/cursos/en/lessons/064.json
- **Ruta:** Idiomas/cursos/en/lessons/064.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; las formas de «be going to», el mensaje de invitación y las respuestas están alineados.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de las cinco formas de «be going to»; mensaje bilingüe con fecha y hora consistentes; diálogo bilingüe; ocho ejercicios con IDs únicos y una respuesta correcta en cada pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 65/301 — Idiomas/cursos/en/lessons/065.json
- **Ruta:** Idiomas/cursos/en/lessons/065.json
- **Estado:** corregido.
- **Problemas encontrados:** se advertía que 04/05 cambia de significado según el orden regional, pero no se mostraban las dos lecturas; además, dos ejercicios seguidos practicaban la misma fecha y el mismo ordinal.
- **Cambios realizados:** expliqué que 04/05 puede significar 4 de mayo (día/mes) o 5 de abril (mes/día), y sustituí la pregunta repetida por una comprobación de esa ambigüedad. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; verificación de ambas interpretaciones y de la retirada del ejercicio duplicado; seis ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 66/301 — Idiomas/cursos/en/lessons/066.json
- **Ruta:** Idiomas/cursos/en/lessons/066.json
- **Estado:** corregido.
- **Problemas encontrados:** la lección pedía incluir día y hora en una invitación, pero no daba un ejemplo; un ejercicio de opción múltiple repetía exactamente el hueco siguiente.
- **Cambios realizados:** añadí una invitación con fecha y hora y su traducción; sustituí la pregunta duplicada por una práctica de «on» con día de la semana. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON; distinción de «on» para fecha/día y «at» para hora; traducción alineada; seis ejercicios con IDs únicos y una respuesta correcta en cada pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 67/301 — Idiomas/cursos/en/lessons/067.json
- **Ruta:** Idiomas/cursos/en/lessons/067.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; la conjugación, las respuestas breves, el diálogo y las expresiones de tiempo pasado concuerdan.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de was/were, respuesta «Yes, I was», explicación de «ago»; diálogo bilingüe; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 68/301 — Idiomas/cursos/en/lessons/068.json
- **Ruta:** Idiomas/cursos/en/lessons/068.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; las reglas de escritura y pronunciación de «-ed», así como las preguntas y negaciones con «did», concuerdan con los ejemplos.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de formas regulares y regla «did/didn't + verbo base»; diálogo bilingüe; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 69/301 — Idiomas/cursos/en/lessons/069.json
- **Ruta:** Idiomas/cursos/en/lessons/069.json
- **Estado:** corregido.
- **Problemas encontrados:** la respuesta sobre el domingo afirmaba que Ben tomó un taxi a casa y su explicación citaba «took a taxi home», aunque el diálogo dice que fue al hotel.
- **Cambios realizados:** corregí la respuesta y la cita para que indiquen «al hotel». La tabla y el vocabulario de «bought» ya distinguían correctamente «compré» y «compró»; no requirieron cambios.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de la pregunta con el diálogo; verificación de la traducción de «bought»; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 70/301 — Idiomas/cursos/en/lessons/070.json
- **Ruta:** Idiomas/cursos/en/lessons/070.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; los dos diálogos bilingües cubren recepción y malestar, y las respuestas de los ejercicios concuerdan con el contenido.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; revisión de las frases meta de hotel y salud; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 71/301 — Idiomas/cursos/en/lessons/071.json
- **Ruta:** Idiomas/cursos/en/lessons/071.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; repite algunas fórmulas de salud de la lección anterior, pero añade cuerpo, singular/plural y «hurts» como vocabulario nuevo, sin contradicción.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de formas singulares/plurales del cuerpo; diálogo bilingüe; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 72/301 — Idiomas/cursos/en/lessons/072.json
- **Ruta:** Idiomas/cursos/en/lessons/072.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; el horario, los avisos de devolución y las reglas de la biblioteca son coherentes.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; nueve líneas bilingües del aviso; verificación de horario y reglas; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 73/301 — Idiomas/cursos/en/lessons/073.json
- **Ruta:** Idiomas/cursos/en/lessons/073.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; remitente, destinataria, ubicación de Ben y lugar de encuentro se distinguen con claridad.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** compilación y comparación exacta con la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo del mensaje y el diálogo; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 74/301 — Idiomas/cursos/en/lessons/074.json
- **Ruta:** Idiomas/cursos/en/lessons/074.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; es un repaso general de identidad, posesivos, hogar y rutinas. No incluye vocabulario nuevo, por lo que `palabras` se omite válidamente en el JSON final.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** comparación normalizada con la salida final del compilador (omite el campo `palabras` vacío); parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de ocho temas previos; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 75/301 — Idiomas/cursos/en/lessons/075.json
- **Ruta:** Idiomas/cursos/en/lessons/075.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno verificable; el repaso comprueba comida, presente continuo, comparativos, indicaciones, transporte, fechas y pasado con respuestas congruentes.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** comparación normalizada con la salida final del compilador (vocabulario vacío omitido por diseño); parseo UTF-8/JSON y ausencia de U+FFFD; nueve temas de repaso presentes; nueve ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 76/301 — Idiomas/cursos/en/lessons/076.json
- **Ruta:** Idiomas/cursos/en/lessons/076.json
- **Estado:** corregido.
- **Problemas encontrados:** cuatro de seis tareas repetían la misma afirmación con «was»; «were», la negación y la inversión en preguntas se mencionaban sin práctica; «last night» aparecía en vocabulario y una pregunta, pero no en ningún ejemplo.
- **Cambios realizados:** actualicé la explicación con ejemplos de afirmación, negación y pregunta y con contexto temporal. Repartí las tareas para practicar «was», «were», «weren't» y el orden interrogativo. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de las cuatro formas en ejercicios; seis ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados y todas las formas anunciadas tienen práctica.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 77/301 — Idiomas/cursos/en/lessons/077.json
- **Ruta:** Idiomas/cursos/en/lessons/077.json
- **Estado:** corregido.
- **Problemas encontrados:** los dos primeros ejercicios repetían la misma negación; las preguntas con «Did» se explicaban sin práctica; «notice» aparecía en vocabulario y en una pregunta, pero no en un aviso de contexto.
- **Cambios realizados:** añadí un aviso de cierre del museo, expliqué pregunta y negación con verbo base y redistribuí las seis tareas para practicar pregunta, negación y comprensión del aviso. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de Did + base y didn't + base; aviso contextual; seis ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 78/301 — Idiomas/cursos/en/lessons/078.json
- **Ruta:** Idiomas/cursos/en/lessons/078.json
- **Estado:** corregido.
- **Problemas encontrados:** el relato no usaba los conectores de secuencia explicados; «finally» ni siquiera estaba en el vocabulario; dos ejercicios repetían la misma frase y sus distractores no encajaban gramaticalmente en el hueco.
- **Cambios realizados:** reescribí el relato para usar first, then, after that, before y finally en orden; añadí finally al vocabulario; reemplacé las tareas repetidas por prácticas de pasado y secuencia con opciones gramaticalmente compatibles. Incorporé «walked» al relato para que el vocabulario también tuviera contexto. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo cronológico y bilingüe de las cinco líneas; uso de cada palabra clave; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 79/301 — Idiomas/cursos/en/lessons/079.json
- **Ruta:** Idiomas/cursos/en/lessons/079.json
- **Estado:** bloqueado.
- **Problemas encontrados:** el archivo es válido, pero el «Examen final de A1» solo pregunta sobre dos lecturas de carteles y mensajes, reutilizadas de las lecciones 072 y 073; no comprueba de forma amplia los demás contenidos. La propia nota advierte que no certifica por sí solo A1.
- **Cambios realizados:** ninguno; ampliar el contenido cambiaría el alcance pedagógico del examen y requiere una decisión de diseño.
- **Pruebas o comprobaciones ejecutadas:** comparación normalizada con la salida final del compilador (vocabulario vacío omitido por diseño); parseo UTF-8/JSON y ausencia de U+FFFD; dos lecturas bilingües; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** archivo íntegro y respuestas correctas; cero avisos asociados. Pendiente decidir si debe conservarse como control de lectura final o ampliarse como examen global.
- **Bloqueos, dudas o decisiones pendientes:** revisar manualmente el alcance previsto antes de rediseñar el examen. Volver a intentar tras la primera pasada.

### 80/301 — Idiomas/cursos/en/lessons/080.json
- **Ruta:** Idiomas/cursos/en/lessons/080.json
- **Estado:** corregido.
- **Problemas encontrados:** la explicación afirmaba que los seis verbos del recuadro eran «los verbos más usados», una generalización excesiva.
- **Cambios realizados:** precisé que son algunos verbos irregulares frecuentes. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de ejemplos regulares e irregulares y diálogo bilingüe; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 81/301 — Idiomas/cursos/en/lessons/081.json
- **Ruta:** Idiomas/cursos/en/lessons/081.json
- **Estado:** corregido.
- **Problemas encontrados:** el distractor «desde hace dos semanas» atribuía a «for two weeks» una traducción dependiente del contexto y la explicación de «while» no ofrecía ejemplo ni práctica; además, una tarea pedía una acción ajena al relato.
- **Cambios realizados:** cambié el distractor a «durante dos semanas» y precisé que expresa duración; añadí un ejemplo y una práctica de simultaneidad con «while»; añadí first/then al vocabulario y al relato, y retiré «childhood», que no aparecía en contexto. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; contraste ago/for; uso y respuesta de while; diálogo bilingüe; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados. No se encontró contradicción narrativa en esta lección.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 82/301 — Idiomas/cursos/en/lessons/082.json
- **Ruta:** Idiomas/cursos/en/lessons/082.json
- **Estado:** corregido.
- **Problemas encontrados:** «My boss was hard» no expresaba de forma idiomática «mi jefe era exigente»; «The salary was small» no coincidía con la forma natural «sueldo bajo» usada en la traducción.
- **Cambios realizados:** cambié la primera frase a «My boss was hard on me» y alineé la traducción con «exigente conmigo»; cambié «small salary» a «low salary» y añadí «low» al vocabulario. Ajusté también la traducción de cake para que coincida con «some delicious cake».
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de las nuevas expresiones, su glosario y traducciones; ocho ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 83/301 — Idiomas/cursos/en/lessons/083.json
- **Ruta:** Idiomas/cursos/en/lessons/083.json
- **Estado:** corregido.
- **Problemas encontrados:** la mitad de las tareas repetía la misma frase sobre «waited»; no se practicaban las reglas explicadas para verbos terminados en «-e» ni consonante + «y», y no se diferenciaba la excepción de vocal + «y».
- **Cambios realizados:** aclaré «arrive → arrived», «carry → carried» y la excepción «play → played»; sustituí repeticiones por ejercicios distintos para arrive, carry, wait, play y work. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de las cuatro reglas de escritura; seis ejercicios con IDs y preguntas únicos, con una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 84/301 — Idiomas/cursos/en/lessons/084.json
- **Ruta:** Idiomas/cursos/en/lessons/084.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco tareas se centraban en la misma oración de «bought»; «go», «have» y «see» aparecían en la regla sin práctica ni contexto.
- **Cambios realizados:** añadí un relato breve que usa went, saw, had y bought; distribuí las tareas para practicar las cuatro formas y reduje la repetición de la oración sobre el regalo. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilación y paridad exacta fuente/JSON; parseo UTF-8/JSON y ausencia de U+FFFD; cotejo de las cuatro formas en contexto y ejercicios; seis preguntas y IDs únicos, con una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto; cero avisos asociados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 85/301 — Idiomas/cursos/en/lessons/085.json
- **Ruta:** Idiomas/cursos/en/lessons/085.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco ejercicios repetían «Did you visit the old town?» y apenas se practicaba el orden Did + sujeto + verbo base con otros verbos.
- **Cambios realizados:** varié las preguntas y tareas con enjoy, visit y like; añadí vocabulario contextualizado de viajes, una pregunta de comprensión y práctica de traducción, orden y producción breve. Actualicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON (omitiendo el campo vacío de palabras que la app elimina); cero avisos; seis IDs únicos y una respuesta correcta en cada ejercicio cerrado.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 86/301 — Idiomas/cursos/en/lessons/086.json
- **Ruta:** Idiomas/cursos/en/lessons/086.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** no encontré errores claros de gramática, traducción, estructura ni coherencia. La actividad marcada «Escucha» usa un campo de audio válido para la función de voz del dispositivo; si no hay voz, la app la presenta como lectura.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación de la fuente y comparación con el JSON generado; inspección del diálogo, vocabulario, ejercicios, IDs únicos y respuestas correctas; comprobación del tratamiento de audio en la app.
- **Resultado de las pruebas:** correcto; paridad fuente/JSON, cero avisos y ocho ejercicios íntegros.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 87/301 — Idiomas/cursos/en/lessons/087.json
- **Ruta:** Idiomas/cursos/en/lessons/087.json
- **Estado:** corregido.
- **Problemas encontrados:** la regla de escritura de -ing generalizaba la duplicación de consonante a todos los finales consonante-vocal-consonante, sin acotar el patrón; faltaba la relación completa de sujetos con was/were. En el diálogo se preguntaba por el gato, pero la respuesta hablaba de los niños. «I was running to the phone» estaba traducido de forma poco natural y «They were walking» tenía una traducción redundante.
- **Cambios realizados:** precisé was/were por sujeto y acoté la regla de duplicación a monosílabos con sus excepciones; hice coherente el intercambio sobre los niños; cambié la escena a «running to answer the phone when I fell» y mejoré las traducciones.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente; parseo UTF-8/JSON y ausencia de U+FFFD; paridad fuente/JSON; cero avisos; ocho IDs únicos y una clave correcta por ejercicio cerrado; revisión de la regla, diálogo y audio en la app.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 88/301 — Idiomas/cursos/en/lessons/088.json
- **Ruta:** Idiomas/cursos/en/lessons/088.json
- **Estado:** corregido.
- **Problemas encontrados:** el glosario contenía cinco entradas sin uso en la lección: «put», «away», «going out», «find» y «light». Las traducciones aisladas de put/away podían confundir con el significado conjunto de «put away», pese a que la explicación recomienda aprender cada verbo frasal como unidad.
- **Cambios realizados:** retiré esas cinco entradas del vocabulario; conservé «put away» como unidad, además de las otras expresiones practicadas y el término oculto «before» usado en el diálogo. Actualicé el JSON generado.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; siete ejercicios con IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 89/301 — Idiomas/cursos/en/lessons/089.json
- **Ruta:** Idiomas/cursos/en/lessons/089.json
- **Estado:** corregido.
- **Problemas encontrados:** la explicación afirmaba que una persona nunca puede ser «boring», aunque también se puede describir así a alguien que aburre. La nota de «passed» negaba el significado «pasar» sin limitarlo al contexto de exámenes; una opción de respuesta usaba «I passed by» sin objeto y quedaba imprecisa.
- **Cambios realizados:** aclaré la diferencia de perspectiva entre «bored» y «boring» y que ambas palabras pueden describir a una persona; limité «pass = aprobar» al contexto de exámenes y completé el ejemplo «I passed by the school».
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; ocho ejercicios con IDs únicos y una respuesta correcta en cada pregunta cerrada.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 90/301 — Idiomas/cursos/en/lessons/090.json
- **Ruta:** Idiomas/cursos/en/lessons/090.json
- **Estado:** corregido.
- **Problemas encontrados:** dos ejercicios consecutivos eran idénticos y otros tres reutilizaban la misma oración. El distractor «cooked always» no era inglés natural. La regla podía expresarse con más precisión como contraste entre una acción en curso y el hecho que sucede durante ella.
- **Cambios realizados:** varié los seis ejercicios con varios sujetos y situaciones, eliminé el distractor mal formado y precisé la explicación del contraste pasado simple/continuo.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; seis IDs únicos, cinco tipos de ejercicio, tres contextos y una respuesta correcta por ítem cerrado.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 91/301 — Idiomas/cursos/en/lessons/091.json
- **Ruta:** Idiomas/cursos/en/lessons/091.json
- **Estado:** corregido.
- **Problemas encontrados:** dos ejercicios repetían la misma frase y tres tareas reutilizaban el mismo ejemplo. La opción «walked every day» no era un distractor natural. Además, el bloque de vocabulario quedaba vacío porque todas sus entradas estaban ocultas, pero la app renderiza ese bloque igualmente.
- **Cambios realizados:** aclaré que el orden de las cláusulas puede cambiar, usé «it started to rain» en lugar de «the rain started», diversifiqué los seis ejercicios con distintos sujetos y situaciones, y eliminé el bloque de vocabulario vacío.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; seis IDs únicos, cinco tipos de ejercicio, tres contextos y una respuesta correcta por cada ejercicio cerrado; comprobación de que no queda vocabulario vacío.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 92/301 — Idiomas/cursos/en/lessons/092.json
- **Ruta:** Idiomas/cursos/en/lessons/092.json
- **Estado:** corregido.
- **Problemas encontrados:** seis ejercicios se concentraban en la misma oración afirmativa; no se practicaban la negación y la pregunta, aunque ambas se explicaban. La definición mezclaba hábitos y estados sin distinguirlos.
- **Cambios realizados:** precisé que «used to» describe hábitos o estados pasados que han cambiado; añadí práctica variada de la forma afirmativa, negativa y de pregunta, y ejemplos de costa/tierra adentro y otros hábitos.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; seis IDs únicos en cinco tipos de ejercicio y una respuesta correcta por ítem cerrado.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 93/301 — Idiomas/cursos/en/lessons/093.json
- **Ruta:** Idiomas/cursos/en/lessons/093.json
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** no encontré fallos claros de gramática, traducción, lógica, estructura ni presentación. El contraste de experiencias sin fecha frente a un momento fechado está explicado; los participios, el diálogo y los ejercicios son coherentes.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; ocho IDs únicos y una respuesta correcta por pregunta cerrada; comprobación del campo de audio.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 94/301 — Idiomas/cursos/en/lessons/094.json
- **Ruta:** Idiomas/cursos/en/lessons/094.json
- **Estado:** corregido.
- **Problemas encontrados:** «I'm hungry to eat» era una combinación poco idiomática; en el diálogo se proponía llamar al propio teléfono tras perder las llaves, y la línea final preguntaba si Anna había cenado sin respuesta. «I've got them» no era un ejemplo claro del presente perfecto de acción y resultado.
- **Cambios realizados:** hice que Tom sugiera llamar a un amigo por una llave de repuesto y que explique que encontró las llaves junto a la puerta; añadí la respuesta a la pregunta sobre la cena y el uso de «ready». Incorporé «found» al glosario, cambié el ejercicio a «I'm hungry, so let's eat» y alineé el audio con «I've lost my umbrella».
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; ocho IDs únicos y una respuesta correcta por pregunta cerrada; cotejo de las frases corregidas.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 95/301 — Idiomas/cursos/en/lessons/095.json
- **Ruta:** Idiomas/cursos/en/lessons/095.json
- **Estado:** corregido.
- **Problemas encontrados:** «Sensible» se explicaba como lo contrario de «emocional», una equivalencia demasiado simplificada; el ejercicio pedía una traducción única de «al final, con el tiempo», aunque «in the end» también es válida; «lesson» aparecía como respuesta pero no tenía ficha de vocabulario.
- **Cambios realizados:** aclaré «sensible/sensitive», añadí «lesson» al glosario y acepté «in the end» además de «eventually» en la respuesta escrita.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; ocho IDs únicos y una respuesta correcta por pregunta cerrada; comprobación de ambas respuestas aceptadas.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 96/301 — Idiomas/cursos/en/lessons/096.json
- **Ruta:** Idiomas/cursos/en/lessons/096.json
- **Estado:** corregido.
- **Problemas encontrados:** cuatro tareas reutilizaban la pregunta «Have you ever eaten sushi?»; no se practicaban las formas negativas pese al título y a que se explicaban. «Yet» solo aparecía como vocabulario y su traducción no distinguía pregunta de negativa.
- **Cambios realizados:** reorganicé la lección alrededor de preguntas y negativas con «yet», añadí práctica de have/has, haven't/hasn't y el lugar habitual de yet; quité la entrada oculta sobrante «ever» y acepté «film» y «movie» en la respuesta escrita.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; seis IDs únicos en cinco tipos y una respuesta correcta por ejercicio cerrado; comprobación de ambas respuestas de escritura.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 97/301 — Idiomas/cursos/en/lessons/097.json
- **Ruta:** Idiomas/cursos/en/lessons/097.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco ejercicios reutilizaban «I've just finished the report» y la práctica apenas cubría «just», aunque el título incluía ever, never, already y yet. La respuesta escrita para «already» no aceptaba su posición natural al final.
- **Cambios realizados:** diversifiqué las tareas para practicar ever en preguntas de experiencia, never, already, yet y just; aclaré que never ya expresa negación y que already también puede ir al final; añadí una segunda respuesta válida.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; seis IDs únicos y una respuesta correcta por pregunta cerrada; comprobación de las dos formas aceptadas con already.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 98/301 — Idiomas/cursos/en/lessons/098.json
- **Ruta:** Idiomas/cursos/en/lessons/098.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco ejercicios repetían «She has written the email», por lo que no se practicaban los otros participios explicados ni la formación regular.
- **Cambios realizados:** diversifiqué las tareas para practicar write/written, take/taken, see/seen y work/worked en pregunta, huecos, traducción, orden y escritura; añadí las dos traducciones naturales «film» y «movie».
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; seis IDs únicos en cinco tipos y una respuesta correcta por ítem cerrado; comprobación de las dos respuestas admitidas.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 99/301 — Idiomas/cursos/en/lessons/099.json
- **Ruta:** Idiomas/cursos/en/lessons/099.json
- **Estado:** corregido.
- **Problemas encontrados:** la explicación decía que «just» no significa «justo/equitativo», aunque también puede ser adjetivo con ese significado; el uso aislado de «Fair!» como «¡Vale!» resultaba poco claro. «Have you finished?» admitía «yet» y «already» según el matiz, pero la respuesta escrita aceptaba solo una forma. «Bag» se traducía literalmente como «bolsa» en una frase que significa hacer la maleta.
- **Cambios realizados:** precisé los usos de just/fair y el significado de «fair enough»; cambié la respuesta del diálogo a «Fair enough!»; traduje «packed my bag» como «hacer la maleta»; acepté ambas preguntas válidas con una nota sobre el matiz.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; ocho IDs únicos y una respuesta correcta por pregunta cerrada; comprobación de las dos respuestas escritas admitidas.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 100/301 — Idiomas/cursos/en/lessons/100.json
- **Ruta:** Idiomas/cursos/en/lessons/100.json
- **Estado:** corregido.
- **Problemas encontrados:** la nota de «sick» lo llamaba falso amigo de una palabra inexistente («sico»); un distractor afirmaba incorrectamente que «during» no puede usarse con un año. «Recently» y «forever» aparecían en el glosario sin uso, y «months» tampoco aparecía en ejemplos.
- **Cambios realizados:** corregí el uso de «sick»; expliqué que «during 2016» describe algo dentro de ese año y no un inicio que continúa; añadí «for three months», usé «months» en un ejercicio y retiré los dos términos sin uso.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; ocho IDs únicos y una respuesta correcta por ejercicio cerrado; comprobación de las reglas y frases modificadas.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 101/301 — Idiomas/cursos/en/lessons/101.json
- **Ruta:** Idiomas/cursos/en/lessons/101.json
- **Estado:** corregido.
- **Problemas encontrados:** el bloque de lectura «Una carrera» estaba completamente vacío. El diálogo saltaba del concierto a «pretender estar bien», sin relación clara; varias palabras visibles/ocultas del glosario no se usaban.
- **Cambios realizados:** añadí una lectura breve y bilingüe que contrasta experiencias sin fecha con un evento fechado; conecté el diálogo sobre la invitación con «intend» y «pretend»; quité «wedding», «concerts» y «lots», que quedaban sin uso.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; tres frases de lectura bilingües; ocho IDs únicos y una respuesta correcta por pregunta cerrada.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 102/301 — Idiomas/cursos/en/lessons/102.json
- **Ruta:** Idiomas/cursos/en/lessons/102.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco tareas repetían la misma frase con «since 2021» y no se practicaba «ago», aunque figuraba en el título y la explicación.
- **Cambios realizados:** varié los ejercicios para cubrir «for» con periodos, «since» con fechas de inicio y «ago» con pasado simple; incluí equivalentes con y sin contracción en la respuesta escrita.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; seis IDs únicos y una respuesta correcta por pregunta cerrada; comprobación de las dos formas escritas admitidas.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 103/301 — Idiomas/cursos/en/lessons/103.json
- **Ruta:** Idiomas/cursos/en/lessons/103.json
- **Estado:** corregido.
- **Problemas encontrados:** cinco ejercicios repetían la misma frase con «last year», así que casi no se practicaba el presente perfecto sin fecha. «Recently» aparecía en el glosario pero no en un ejemplo.
- **Cambios realizados:** añadí el contraste «I have seen that film recently» / «I saw that film last year» y diversifiqué los ejercicios para cubrir ambos tiempos; acepté la forma completa y la contracción en la respuesta escrita.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad fuente/JSON; cero avisos; seis IDs únicos y una respuesta correcta por ejercicio cerrado; comprobación de las dos formas admitidas.
- **Resultado de las pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 104/301 — Idiomas/cursos/en/lessons/104.json
- **Ruta:** Idiomas/cursos/en/lessons/104.json; fuente: _herramientas/cursos/en/14.txt.
- **Estado:** corregido.
- **Problemas encontrados:** dos ejercicios repetían exactamente la misma frase; la regla y los conectores cronológicos anunciados apenas se practicaban; «journey» y «finally» no aparecían en contexto; el título español no correspondía al título inglés.
- **Cambios realizados:** convertí la explicación en un relato breve de viaje que contrasta una experiencia sin fecha concreta con una visita fechada; integré first/later/finally y el vocabulario en el relato; diversifiqué los seis ejercicios para practicar secuencia, pasado simple, léxico, comprensión de lectura, orden y traducción; corregí el título español. Regeneré el JSON desde su fuente.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación de la fuente con cero avisos; paridad exacta fuente/JSON; seis IDs únicos; una respuesta correcta y explicaciones en cada ejercicio cerrado; comprobación de los campos de ordenar y escribir.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 105/301 — Idiomas/cursos/en/lessons/105.json
- **Ruta:** Idiomas/cursos/en/lessons/105.json; fuente: _herramientas/cursos/en/15.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación podía confundirse al presentar **-er** y **than** como una sola marca; la regla de duplicación consonántica estaba poco delimitada y no se practicaba; dos ejercicios probaban casi el mismo caso de **cheap**; el ejercicio de audio traducía **cousin** como «primo» aunque el diálogo identifica a la persona con **she**; **hotter** estaba en el vocabulario sin contexto.
- **Cambios realizados:** separé la formación del comparativo y el uso de **than**; precisé la duplicación de consonante con **big/hot**; cambié el ejercicio repetido por práctica de **hotter**; alineé el audio con la referencia a «she» y su traducción; integré **hotter** en la explicación y el ejercicio. Regeneré el JSON desde su fuente.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; nueve IDs únicos; una opción correcta y explicaciones en cada ejercicio cerrado; comprobación de respuestas y vocabulario usado en contenido sustantivo.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 106/301 — Idiomas/cursos/en/lessons/106.json
- **Ruta:** Idiomas/cursos/en/lessons/106.json; fuente: _herramientas/cursos/en/15.txt.
- **Estado:** corregido.
- **Problemas encontrados:** una explicación afirmaba erróneamente que «not more expensive than» significa «más caro que»; el diálogo omitía el segundo **as** en **not as…as**, no respondía con naturalidad a la pregunta inicial y terminaba con una comparación de comodidad que contradecía la igualdad anterior; un ejercicio afirmaba que el avión y el tren eran igual de rápidos pese a describir el tren como lento y el avión como rápido; «speed» no se usaba fuera del glosario.
- **Cambios realizados:** corregí las opciones y sus explicaciones; completé la forma **not as expensive as**; hice coherente el diálogo y la comparación de igualdad; cambié la práctica de velocidad por una comparación compatible; eliminé el término sin contexto «speed». Regeneré el JSON desde su fuente.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; una opción correcta y explicaciones en cada ejercicio cerrado; revisión de uso del vocabulario, distractores y coherencia del diálogo.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 107/301 — Idiomas/cursos/en/lessons/107.json
- **Ruta:** Idiomas/cursos/en/lessons/107.json; fuente: _herramientas/cursos/en/15.txt.
- **Estado:** corregido.
- **Problemas encontrados:** «more friendly» no seguía la regla de comparativos en **-y** enseñada antes; la explicación decía «comprensiva» pero la frase se traducía como «compasiva»; la concordancia y el análisis de «London is beautiful» eran masculinos pese a traducir la ciudad como «ciudad preciosa»; **cozy** y **trendy** no aparecían en el contenido; el texto no tenía pregunta de comprensión y el audio repetía la oración usada para enseñar **lecture**.
- **Cambios realizados:** cambié **more friendly** por **friendlier**; alineé traducción y anotaciones de **beautiful/sympathetic**; enmarqué la comparación urbana como opinión personal; quité el vocabulario sin contexto y sustituí el audio repetido por una pregunta breve de comprensión del texto. Regeneré el JSON desde su fuente.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; una opción correcta y explicaciones en cada ejercicio cerrado; revisión del glosario, la concordancia bilingüe y la respuesta de comprensión. Consulté [Cambridge Grammar: comparison of adjectives](https://dictionary.cambridge.org/grammar/british-grammar/comparison-adjectives-bigger-biggest-more-interesting) sobre adjetivos en **-y** y [Cambridge Dictionary: sympathetic](https://dictionary.cambridge.org/dictionary/english-spanish/sympathetic) sobre significado y traducción.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 108/301 — Idiomas/cursos/en/lessons/108.json
- **Ruta:** Idiomas/cursos/en/lessons/108.json; fuente: _herramientas/cursos/en/15.txt.
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis ejercicios repetían la comparación «The train is faster than the bus»; casi no había práctica de **more + adjetivo** pese a estar en la explicación; se anunciaban comparaciones entre personas y cosas, pero solo se practicaban objetos; varias respuestas incorrectas tenían explicaciones genéricas.
- **Cambios realizados:** sustituí repeticiones por práctica de **more convenient**, traducción de una comparación distinta y orden de otra frase; añadí una comparación entre personas y acepté dos formas correctas tras **than**; precisé las explicaciones de los distractores. Regeneré el JSON desde su fuente.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; seis IDs únicos; campos y respuestas completos; una opción correcta por ejercicio cerrado; comprobación de las dos respuestas escritas aceptadas.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 109/301 — Idiomas/cursos/en/lessons/109.json
- **Ruta:** Idiomas/cursos/en/lessons/109.json; fuente: _herramientas/cursos/en/15.txt.
- **Estado:** corregido.
- **Problemas encontrados:** cinco ejercicios giraban alrededor de una sola frase positiva; el patrón negativo **not as…as** aparecía en la explicación, pero no se practicaba; las explicaciones de los distractores no aclaraban bien las estructuras.
- **Cambios realizados:** varié las frases y actividades; añadí ejercicios explícitos de igualdad y de **not as…as**, con traducción y orden; ajusté las explicaciones de los distractores; acepté la contracción y la forma completa en la respuesta escrita.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; seis IDs únicos; respuestas y explicaciones completas; una opción correcta por ejercicio cerrado; comprobación de práctica positiva y negativa y de las dos formas escritas.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 110/301 — Idiomas/cursos/en/lessons/110.json
- **Ruta:** Idiomas/cursos/en/lessons/110.json; fuente: _herramientas/cursos/en/15.txt.
- **Estado:** corregido.
- **Problemas encontrados:** todos los ejercicios repetían «She speaks English fluently»; la distinción entre adjetivo y adverbio se mencionaba, pero no se practicaba; **fast** aparecía como excepción sin ejemplo.
- **Cambios realizados:** añadí contraste de adjetivo y adverbio con **careful/carefully**; integré **fast** como adjetivo y adverbio, lo añadí al vocabulario y lo practiqué en dos contextos; varié las seis actividades y aclaré las explicaciones de las opciones.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; seis IDs únicos; una respuesta correcta y explicaciones por pregunta cerrada; campos requeridos presentes; comprobación de que todo el vocabulario se usa en contexto.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 111/301 — Idiomas/cursos/en/lessons/111.json
- **Ruta:** Idiomas/cursos/en/lessons/111.json; fuente: _herramientas/cursos/en/16.txt.
- **Estado:** corregido.
- **Problemas encontrados:** el título e intro anunciaban solo superlativos cortos, aunque también se explicaban los largos e irregulares; dos ejercicios probaban **biggest**; **assume** se marcaba como un falso amigo absoluto aunque también puede significar «asumir» en ciertos contextos; **healthy** y **longest** no aparecían en el contenido; la ciudad «más grande» no especificaba el criterio; una traducción con **I** atribuía género que la frase inglesa no especifica; dos anotaciones no coincidían exactamente con el texto traducido.
- **Cambios realizados:** ajusté el título y el intro al contenido; sustituí una repetición por práctica de **the most + adjetivo**; expliqué el matiz contextual de **assume**; quité las palabras sin contexto; aclaré que «biggest city» se refiere a población; neutralicé la frase de audio y su traducción; reparé las anotaciones de lectura y diálogo.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; una opción correcta y explicaciones por ejercicio cerrado; campos completos; todo el vocabulario usado; referencias de análisis presentes en ambas líneas; comprobación en [INE, población municipal a 1 de enero de 2025](https://www.ine.es/infografias/infografia_censo.pdf) y [Cambridge Dictionary: assume](https://dictionary.cambridge.org/dictionary/english-spanish/assume).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 112/301 — Idiomas/cursos/en/lessons/112.json
- **Ruta:** Idiomas/cursos/en/lessons/112.json; fuente: _herramientas/cursos/en/16.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la pregunta sobre «the best view» recibía como respuesta un «most historic place» sin relación clara; la afirmación sobre Kyoto se presentaba como hecho absoluto; «quality» no aparecía en el contenido; **delicious** aparecía en texto y ejercicio, pero faltaba en el glosario; dos anotaciones no coincidían con sus traducciones; no había práctica de **of** con grupos.
- **Cambios realizados:** reescribí la pregunta y respuesta del diálogo para que fueran coherentes y expresaran opinión; alineé las anotaciones; añadí **delicious** al glosario y quité términos sin contexto; añadí práctica explícita de **of** con grupos y **in** con lugares.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; una opción correcta y explicaciones por ejercicio cerrado; campos completos; vocabulario contextualizado; referencias de análisis presentes en ambas traducciones; ejercicios verificados para **in/of**.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 113/301 — Idiomas/cursos/en/lessons/113.json
- **Ruta:** Idiomas/cursos/en/lessons/113.json; fuente: _herramientas/cursos/en/16.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la entrada de **pie** llevaba a una traducción potencialmente equívoca y no distinguía el falso amigo «pie» del cuerpo; el ejemplo final «My life is lovely» sonaba poco natural; faltaba una pregunta de comprensión lectora pese al título de texto; una traducción repetía el contenido sin comprobar comprensión.
- **Cambios realizados:** precisé el uso de **pie** en **fish pie** como «pastel de pescado» y lo distinguí de **foot**; reescribí el ejemplo final como «The trip was lovely and unforgettable»; reemplacé la actividad de traducción repetida por una pregunta cuya respuesta se encuentra en el texto; enfoqué otra traducción en **fish pie**.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; respuestas y explicaciones completas; una respuesta correcta por ejercicio cerrado; referencias de análisis presentes en las dos lenguas; todo el vocabulario aparece en el contenido; consulta de [Cambridge Dictionary: pie](https://dictionary.cambridge.org/us/dictionary/english-spanish/pie) y [BBC, receta de fish pie](https://downloads.bbc.co.uk/berkshire/pdf/fish_pie.pdf).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 114/301 — Idiomas/cursos/en/lessons/114.json
- **Ruta:** Idiomas/cursos/en/lessons/114.json; fuente: _herramientas/cursos/en/16.txt.
- **Estado:** corregido.
- **Problemas encontrados:** el título sugería abarcar todos los superlativos con adjetivos cortos, pero la explicación enseñaba solo la regla consonante + **y** → **-iest**; dos ejercicios eran idénticos; **building** aparecía solo como distractor y no se enseñaba en contexto.
- **Cambios realizados:** precisé título e introducción para indicar el alcance; expliqué el cambio de **y** a **i** y añadí el ejemplo **easy → easiest**; reemplacé la repetición por práctica de la regla, otra palabra y tareas variadas; quité vocabulario sin contexto.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; seis IDs únicos; una respuesta correcta y explicación por ejercicio cerrado; campos completos y vocabulario contextualizado; comprobé la regla en [British Council LearnEnglish: comparative and superlative adjectives](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/comparative-superlative-adjectives).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 115/301 — Idiomas/cursos/en/lessons/115.json
- **Ruta:** Idiomas/cursos/en/lessons/115.json; fuente: _herramientas/cursos/en/16.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la lección anunciaba **a/an**, **the** y ausencia de artículo, pero solo explicaba y practicaba **the**; repetía el mismo ejercicio de huecos; **advice** aparecía solo como distractor y faltaban ejemplos para **a/an** y para los incontables.
- **Cambios realizados:** aclaré el uso de **a/an** según el sonido inicial y añadí ejemplos de primera mención; expliqué **the** con un referente ya identificado; añadí práctica de ausencia de artículo con plurales e incontables; varié los ejercicios y contextualicé todo el vocabulario.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; seis IDs únicos; una respuesta correcta y explicación por pregunta cerrada; campos completos y vocabulario contextualizado; cobertura de **a/an**, **the** y ausencia de artículo; consulta de [British Council LearnEnglish: articles](https://learnenglish.britishcouncil.org/comment/197684).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 116/301 — Idiomas/cursos/en/lessons/116.json
- **Ruta:** Idiomas/cursos/en/lessons/116.json; fuente: _herramientas/cursos/en/16.txt.
- **Estado:** corregido.
- **Problemas encontrados:** aunque el tema incluía **many**, **much**, **a few** y **a little**, casi toda la lección repetía el mismo ejemplo con **a little**; no practicaba los otros cuantificadores y **question/ticket** aparecían solo en el glosario o distractores.
- **Cambios realizados:** añadí práctica diferenciada de **many** con contables, **much** con incontables, **a few** y **a little**; mantuve **a lot of** como alternativa frecuente en afirmativas; reemplacé las repeticiones e incorporé **train** al vocabulario de contexto.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; seis IDs únicos; una respuesta correcta y explicación por pregunta cerrada; campos completos; vocabulario contextualizado; comprobé los cuatro cuantificadores y la alternativa **a lot of** según [British Council LearnEnglish: countable and uncountable nouns](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/nouns-countable-uncountable?page=1) y [quantifiers: a few and a little](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2-grammar/quantifiers-few-a-few-little-a-bit).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 117/301 — Idiomas/cursos/en/lessons/117.json
- **Ruta:** Idiomas/cursos/en/lessons/117.json; fuente: _herramientas/cursos/en/17.txt.
- **Estado:** corregido.
- **Problemas encontrados:** el encabezado llamaba a **will** «la forma más general» y la sección «predicción sin pruebas» daba una distinción demasiado absoluta; la ubicación de adverbios se presentaba como rígida; «No voy» podía significar futuro; «seguramente» podía acercarse al sentido de **maybe**; el diálogo era inconexo, faltaban **sunny/forecast** en el vocabulario y cinco anotaciones no coincidían exactamente con sus frases.
- **Cambios realizados:** precisé el alcance de **will** y la posición habitual de los adverbios; cambié distractores ambiguos; conecté el diálogo con comprobar el pronóstico y quedar más adelante; añadí **sunny/forecast**, quité **future** sin contexto inglés, reemplacé un hueco repetido por comprensión lectora y alineé las anotaciones.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; una respuesta correcta y explicación por pregunta cerrada; campos completos; vocabulario contextualizado; diez referencias de análisis cotejadas; contraste con [Cambridge Grammar: will or be going to](https://dictionary.cambridge.org/grammar/british-grammar/will-or-be-going-to) y [posición de adverbios](https://dictionary.cambridge.org/uk/grammar/british-grammar/adverbs-and-adverb-phrases-position).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 118/301 — Idiomas/cursos/en/lessons/118.json
- **Ruta:** Idiomas/cursos/en/lessons/118.json; fuente: _herramientas/cursos/en/17.txt.
- **Estado:** corregido.
- **Problemas encontrados:** las explicaciones presentaban como exclusivas la predicción con **going to** y la predicción con **will**; un distractor de traducción confundía las equivalencias posibles en español; la conversación saltaba del clima a planes domésticos sin hilo; algunas anotaciones diferían en mayúsculas; había vocabulario sin uso; la respuesta de audio incluía «mañana», pero el audio no.
- **Cambios realizados:** aclaré que las reglas describen usos frecuentes y que **will** también sirve para predicciones; reemplacé la traducción ambigua con una pregunta basada en las señales visibles; reescribí el diálogo alrededor de la lluvia, la visita familiar y las decisiones del momento; corregí anotaciones, quité **decide** sin contexto y alineé el audio con su traducción.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; respuestas y explicaciones completas; una respuesta correcta por pregunta cerrada; vocabulario contextualizado; diez referencias de análisis cotejadas; audio cotejado con la respuesta correcta; consulta de [Cambridge Grammar: will or be going to](https://dictionary.cambridge.org/grammar/british-grammar/will-or-be-going-to) y [will](https://dictionary.cambridge.org/us/grammar/british-grammar/will).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 119/301 — Idiomas/cursos/en/lessons/119.json
- **Ruta:** Idiomas/cursos/en/lessons/119.json; fuente: _herramientas/cursos/en/17.txt.
- **Estado:** corregido.
- **Problemas encontrados:** **forecast** aparecía dentro de la lista de falsos amigos aunque no lo es; la explicación de **notice** era demasiado absoluta; «The exit from the park is far» quedaba poco idiomático; un texto con título de lectura no tenía pregunta de comprensión y repetía dos preguntas de vocabulario.
- **Cambios realizados:** separé **forecast** como palabra clave; precisé **notice** en el ejemplo «I notice» y lo contrasté con **notify**; cambié la frase a **far away** y pulí la frase del pronóstico; reemplacé una pregunta de vocabulario por comprensión lectora.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; respuestas y explicaciones completas; una respuesta correcta por pregunta cerrada; vocabulario contextualizado; trece anotaciones cotejadas; comprobación con [Cambridge Dictionary: exit](https://dictionary.cambridge.org/es/diccionario/ingles-espanol/exit), [notice](https://dictionary.cambridge.org/us/dictionary/english-spanish/notice), [notify](https://dictionary.cambridge.org/dictionary/english-spanish/notify) y [forecast](https://dictionary.cambridge.org/es/diccionario/ingles-espanol/forecast).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 120/301 — Idiomas/cursos/en/lessons/120.json
- **Ruta:** Idiomas/cursos/en/lessons/120.json; fuente: _herramientas/cursos/en/17.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la pregunta de horario aceptaba potencialmente presente simple y continuo; la respuesta escrita solo aceptaba la contracción **I'd like to book**; seis anotaciones no coincidían exactamente con las frases del diálogo.
- **Cambios realizados:** precisé el horario como rutina diaria y cambié distractores para dejar una respuesta inequívoca; acepté tanto **I'd like to book** como **I would like to book**; alineé las seis anotaciones.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; ocho IDs únicos; respuestas y explicaciones completas; una respuesta correcta por pregunta cerrada; vocabulario contextualizado; seis referencias de análisis cotejadas; contraste con [British Council LearnEnglish: present continuous](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/present-continuous) y [Cambridge Grammar: present simple for schedules](https://dictionary.cambridge.org/us/grammar/british-grammar/simple-future).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 121/301 — Idiomas/cursos/en/lessons/121.json
- **Ruta:** Idiomas/cursos/en/lessons/121.json; fuente: _herramientas/cursos/en/17.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la lección titulada **Will or going to?** solo practicaba una predicción con nubes; repetía el mismo hueco y la misma traducción/orden/redacción; no comprobaba **will** para una decisión inmediata; **decision** aparecía sin contexto.
- **Cambios realizados:** añadí una comparación breve de decisión inmediata, plan previo y predicción con señales; varié las seis actividades para practicar los tres usos; quité **decision** del glosario porque no se usaba en inglés.
- **Pruebas o comprobaciones ejecutadas:** parseo UTF-8/JSON y ausencia de U+FFFD; compilación y paridad exacta fuente/JSON; cero avisos; seis IDs únicos; respuestas y explicaciones completas; una respuesta correcta por pregunta cerrada; vocabulario contextualizado; contraste con [British Council LearnEnglish: future forms](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/future-forms-will-be-going-present-continuous) y [talking about the future](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/talking-about-future?page=1).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 122/301 — Idiomas/cursos/en/lessons/122.json
- **Ruta:** Idiomas/cursos/en/lessons/122.json; fuente: _herramientas/cursos/en/17.txt.
- **Estado:** corregido.
- **Problemas encontrados:** ejercicio de hueco duplicado; traducción literal de **see the dentist** no explicaba su sentido de cita médica; tres ejercicios repetían exactamente la misma oración; faltaba comprobar la diferencia entre arreglo futuro y horario o predicción.
- **Cambios realizados:** precisé el uso del presente continuo para arreglos confirmados; expliqué **arrangement** y el sentido contextual de **see the dentist**; sustituí los ejercicios repetidos por selección de uso, formación, traducción y pregunta.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente editable y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; ocho bloques, seis ejercicios con IDs únicos; solución y explicación en todos los ejercicios y una respuesta correcta por pregunta cerrada; contraste con [British Council LearnEnglish: present continuous](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/present-continuous) y [future forms](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/future-forms-will-be-going-present-continuous).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 123/301 — Idiomas/cursos/en/lessons/123.json
- **Ruta:** Idiomas/cursos/en/lessons/123.json; fuente: _herramientas/cursos/en/17.txt.
- **Estado:** corregido.
- **Problemas encontrados:** dos ejercicios de hueco repetían la misma frase; comprensión, orden y escritura reutilizaban el mismo ejemplo; el significado de **departure** no se practicaba y **entrance** era vocabulario sin contexto; no había comprensión real de un horario.
- **Cambios realizados:** añadí una tabla breve de salidas con dos destinos, una pregunta de lectura de la tabla y ejercicios distintos de forma verbal, vocabulario, traducción, orden y escritura; quité **entrance**, que no se necesitaba.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; nueve bloques, incluida la tabla con dos filas; seis ejercicios con IDs únicos, soluciones y explicaciones; una respuesta correcta en cada pregunta cerrada; contraste con [Cambridge Grammar: future present simple](https://dictionary.cambridge.org/grammar/british-grammar/simple-future) y [present simple](https://dictionary.cambridge.org/grammar/british-grammar/present-simple).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 124/301 — Idiomas/cursos/en/lessons/124.json
- **Ruta:** Idiomas/cursos/en/lessons/124.json; fuente: _herramientas/cursos/en/18.txt.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo cambiaba sin transición de la bicicleta al coche; **health** y **exercise** no aparecían en contexto; **smoke** daba una acepción innecesaria; **warn/advise** se llamaban falsos amigos sin serlo; una pregunta de traducción reducía **must** a una sola paráfrasis.
- **Cambios realizados:** cambié el diálogo por uno breve y coherente sobre seguridad vial; aclaré el sentido de **must** y **mustn't** y su diferencia con **don't have to**; renombré la sección **warn/advise** como distinción léxica, quité vocabulario sobrante y enfoqué las preguntas en significado y uso.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; 13 bloques, ocho ejercicios resueltos con IDs únicos y una respuesta explicada por pregunta cerrada; seis líneas bilingües con análisis cotejado; contraste con [Cambridge Grammar: must](https://dictionary.cambridge.org/grammar/british-grammar/must), [Cambridge Grammar: have to](https://dictionary.cambridge.org/grammar/british-grammar/have-got-to) y [British Council: modals of permission and obligation](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-permission-obligation).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 125/301 — Idiomas/cursos/en/lessons/125.json
- **Ruta:** Idiomas/cursos/en/lessons/125.json; fuente: _herramientas/cursos/en/18.txt.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo sobre trabajo, descanso y sueño no fluía; varias fichas (**meeting**, **junk**, **tooth**, **afford**) no tenían uso en la lección; **rest** incluía una acepción irrelevante; se etiquetaba **advice/advise** como falso amigo y ambas guías de pronunciación ocultaban la diferencia final /s/–/z/.
- **Cambios realizados:** hice más coherente el diálogo; eliminé vocabulario sin contexto; acoté el sentido de **rest**; precisé que **advice** es incontable y sustantivo, **advise** verbo, y diferencié sus sonidos finales; ajusté la explicación de **don't have to** para separarla de la prohibición **mustn't**.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; 14 bloques, ocho ejercicios completos con IDs únicos y una respuesta explicada por pregunta cerrada; ocho líneas de diálogo bilingües con análisis cotejado; contraste con [Cambridge Grammar: advice or advise](https://dictionary.cambridge.org/grammar/british-grammar/advice-or-advise), [Cambridge Grammar: have to](https://dictionary.cambridge.org/grammar/british-grammar/have-got-to) y [British Council: modals of permission and obligation](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-permission-obligation).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 126/301 — Idiomas/cursos/en/lessons/126.json
- **Ruta:** Idiomas/cursos/en/lessons/126.json; fuente: _herramientas/cursos/en/18.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la nota sobre **constipated/constipado** ignoraba variantes regionales; **pain** se clasificaba como falso amigo frente a «pena» de manera demasiado tajante; **tip** se mezclaba con falsos amigos aunque era un caso de varios sentidos; **balanced** y **vitamin** estaban en el vocabulario sin aparecer en el texto; «Stress is bad for your health» generalizaba.
- **Cambios realizados:** matizé el uso regional de «constipado» y puse la palabra en una frase de contexto; expliqué **injury** como lesión física y distinguí los varios sentidos de **tip**; precisé **pain/hurt**; incorporé dieta equilibrada y vitaminas al texto; cambié la afirmación sobre el estrés a una formulación posible y acotada, y mejoré la frase sobre dormir.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; 12 bloques, texto bilingüe de diez líneas con análisis cotejado; ocho ejercicios completos con IDs únicos y una respuesta explicada por pregunta cerrada; contraste con [Cambridge Dictionary: constipated](https://dictionary.cambridge.org/dictionary/english-spanish/constipated), [injury](https://dictionary.cambridge.org/dictionary/english-spanish/injury), [tip](https://dictionary.cambridge.org/dictionary/english/tip), [NHS: balanced diet](https://www.nhs.uk/Live-well/eat-well/how-to-eat-a-balanced-diet/eating-a-balanced-diet/) y [NHS: stress](https://www.nhs.uk/every-mind-matters/mental-health-issues/stress/).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 127/301 — Idiomas/cursos/en/lessons/127.json
- **Ruta:** Idiomas/cursos/en/lessons/127.json; fuente: _herramientas/cursos/en/18.txt.
- **Estado:** corregido.
- **Problemas encontrados:** pese al título **Must, have to and should**, todos los ejercicios practicaban el mismo ejemplo de **have to**; no se comprobaban **must** ni **should**, y faltaba la estructura **has to** en tercera persona.
- **Cambios realizados:** añadí una comparación breve y matizada de obligación personal, regla externa y consejo; aclaré las formas **must/should + verbo base**, **have to** y **has to**; reemplacé las tareas duplicadas con seis ejercicios variados que cubren los tres modales, una regla, la tercera persona, vocabulario, comprensión, orden y escritura.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; nueve bloques, seis ejercicios con IDs únicos, respuestas y explicaciones completas y una opción correcta por pregunta cerrada; contraste con [Cambridge Grammar: must](https://dictionary.cambridge.org/grammar/british-grammar/must), [Cambridge Grammar: have to](https://dictionary.cambridge.org/grammar/british-grammar/have-got-to) y [British Council: modals of permission and obligation](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-permission-obligation).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 128/301 — Idiomas/cursos/en/lessons/128.json
- **Ruta:** Idiomas/cursos/en/lessons/128.json; fuente: _herramientas/cursos/en/18.txt.
- **Estado:** corregido.
- **Problemas encontrados:** seis ejercicios repetían **You mustn't park here. It's forbidden**; la explicación mencionaba **don't have to** pero no daba un ejemplo positivo de acción opcional ni practicaba esa forma.
- **Cambios realizados:** añadí el contraste explícito entre prohibición, falta de obligación y permiso; diversifiqué los ejemplos y ejercicios para practicar ambas estructuras y sus sentidos; acepté en escritura las formas contraída y completa.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; nueve bloques, seis ejercicios con IDs únicos, respuestas y explicaciones completas y una opción correcta por pregunta cerrada; contraste con [Cambridge Grammar: must](https://dictionary.cambridge.org/grammar/british-grammar/must) y [British Council: modals of permission and obligation](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-permission-obligation).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 129/301 — Idiomas/cursos/en/lessons/129.json
- **Ruta:** Idiomas/cursos/en/lessons/129.json; fuente: _herramientas/cursos/en/18.txt.
- **Estado:** corregido.
- **Problemas encontrados:** las seis tareas repetían el mismo logro con **were able to** y ninguna practicaba **could**; **I could swim at six** era ambiguo entre edad y hora; no se explicaba cómo hablar de un intento concreto que no se consiguió.
- **Cambios realizados:** distinguí habilidad general (**could/couldn't**), logro concreto (**was/were able to**, también **managed to**) e intento fallido (**couldn't/wasn't able to**); aclaré el ejemplo de edad; varié los ejercicios para comprobar las tres situaciones y precisé **catch** según el contexto de autobús.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; nueve bloques, seis ejercicios distintos con IDs únicos, opciones sin duplicados, respuestas y explicaciones completas y una opción correcta por pregunta cerrada; contraste con [Cambridge Grammar: could](https://dictionary.cambridge.org/grammar/british-grammar/could%3A), [Cambridge Grammar: be able to](https://dictionary.cambridge.org/uk/grammar/british-grammar/be-expressions-be-able-to-be-due-to) y [British Council: past ability](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/past-ability).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 130/301 — Idiomas/cursos/en/lessons/130.json
- **Ruta:** Idiomas/cursos/en/lessons/130.json; fuente: _herramientas/cursos/en/19.txt.
- **Estado:** corregido.
- **Problemas encontrados:** se etiquetaba **hope/wait** como falso amigo pese a que se trata de dos sentidos de «esperar»; **wish**, **lose**, **result** y **rich** no aparecían en contexto; el diálogo usaba **unless you hate them / I won't hate them** de forma poco natural; no se practicaba **unless** dentro de una oración.
- **Cambios realizados:** expliqué **hope** (desear que algo pase) frente a **wait** (aguardar); eliminé vocabulario sin uso; rehice el intercambio con **unless you say no** e incluí una respuesta completa con la condición soleada; reemplacé la traducción aislada de **unless** por escritura de la estructura completa, aceptando contracción y forma plena.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente y paridad estructural exacta; cero avisos; parseo UTF-8/JSON y ausencia de U+FFFD; 14 bloques, ocho ejercicios con IDs únicos, soluciones y explicaciones completas y una respuesta correcta por pregunta cerrada; ocho líneas bilingües con análisis cotejado; contraste con [British Council: conditionals zero, first and second](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-zero-first-second), [Cambridge Grammar: unless](https://dictionary.cambridge.org/grammar/british-grammar/unless), [Cambridge Dictionary: hope](https://dictionary.cambridge.org/us/dictionary/english-spanish/hope) y [wait](https://dictionary.cambridge.org/us/dictionary/english-spanish/wait).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** 130.json.
- **Siguiente archivo pendiente:** 131.json.

### 131/301 — Idiomas/cursos/en/lessons/131.json
- **Ruta:** Idiomas/cursos/en/lessons/131.json; fuente: _herramientas/cursos/en/19.txt.
- **Estado:** corregido.
- **Problemas encontrados:** se clasificaba **also** como falso amigo, pese a que es un adverbio para añadir información; también se sugería erróneamente que **lucky** podía confundirse con «lúcido». El diálogo mezclaba la cancelación del tren, caminar y coger un autobús sin continuidad; **jam**, **mood** y **dream** aparecían en el vocabulario sin practicarse, y el resumen inicial no incluía **also**.
- **Cambios realizados:** aclaré las funciones de **because**, **so**, **but** y **also**, con el contraste correcto entre causa y resultado; quité las falsas etiquetas; rehice el diálogo como una secuencia de cancelación del tren, viaje en autobús y atasco; integré **traffic jam**, **delay**, **lucky**, **rush**, **huge** y **crowd** en contexto, y eliminé **mood** y **dream** por no ser necesarios. La práctica ahora incluye **also**.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente editable con cero avisos; igualdad estructural exacta del JSON respecto al resultado del compilador; parseo UTF-8/JSON y ausencia de U+FFFD; 14 bloques, 8 ejercicios con IDs únicos y completos, una respuesta correcta por pregunta cerrada, explicaciones en opciones y respuestas abiertas, y 9 intervenciones bilingües con análisis; contraste con [Cambridge Grammar: conjunctions](https://dictionary.cambridge.org/grammar/british-grammar/coordinating-conjunctions) y [Cambridge Grammar: also, as well or too](https://dictionary.cambridge.org/grammar/british-grammar/also-as-well-or-too.).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `131.json`.
- **Siguiente archivo pendiente:** `132.json`.

### 132/301 — Idiomas/cursos/en/lessons/132.json
- **Ruta:** Idiomas/cursos/en/lessons/132.json; fuente: _herramientas/cursos/en/19.txt.
- **Estado:** corregido.
- **Problemas encontrados:** **bill** se presentaba como si nunca significara «billete», aunque ese uso es normal en inglés estadounidense; se describía **gift** como distinto de «don» sin reconocer el sentido de talento; el texto era una serie de frases poco conectadas y **surprise**, **candle**, **invitation** y **present** estaban en el vocabulario sin aparecer en la lectura. «The bill will be big, unless you help» no daba contexto y el significado de **compromise** quedaba sin explicar.
- **Cambios realizados:** precisé los sentidos de **gift**, **present** y **bill** por contexto y variante regional; expliqué **compromise** como acuerdo en el que ambas partes ceden algo; convertí las frases en una lectura breve y coherente que integra todas las palabras del glosario y practica el primer condicional y **unless**. Reemplacé un ejercicio repetitivo por una pregunta de comprensión lectora.
- **Pruebas o comprobaciones ejecutadas:** compilación desde fuente con cero avisos; igualdad estructural exacta con el JSON compilado; parseo UTF-8/JSON y ausencia de U+FFFD; 12 bloques, 8 ejercicios con IDs únicos, opciones completas y exactamente una respuesta correcta por pregunta cerrada; 9 líneas de lectura bilingües con análisis y todas las 12 palabras del glosario presentes en contexto. Contraste con [Cambridge Dictionary: bill](https://dictionary.cambridge.org/us/dictionary/english/bill), [banknote](https://dictionary.cambridge.org/dictionary/english/banknote), [gift](https://dictionary.cambridge.org/dictionary/english/gift), [present](https://dictionary.cambridge.org/dictionary/english/present), [compromise](https://dictionary.cambridge.org/dictionary/english/compromise) y [conditionals](https://dictionary.cambridge.org/grammar/british-grammar/conditionals).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `132.json`.
- **Siguiente archivo pendiente:** `133.json`.

### 133/301 — Idiomas/cursos/en/lessons/133.json
- **Ruta:** Idiomas/cursos/en/lessons/133.json; fuente: _herramientas/cursos/en/19.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la intro sugería que el condicional cero solo cubre cosas que son siempre ciertas; **ground** y **gets** estaban en el glosario sin uso; dos ejercicios ofrecían alternativas con **will** en frases sin contexto temporal suficiente, por lo que podían leerse como predicciones de futuro en vez de hábitos generales.
- **Cambios realizados:** aclaré que el condicional cero también expresa hábitos y regularidades; añadí **If it rains, the ground gets wet** para contextualizar el vocabulario; rehice los huecos con presente simple y un contexto explícitamente habitual; mantuve el contraste con el primer condicional y el uso de **when** para situaciones repetidas.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente con cero avisos; igualdad estructural exacta con el JSON compilado; UTF-8/JSON válido, sin U+FFFD; 12 bloques, 8 ejercicios con IDs únicos, una respuesta correcta en cada pregunta cerrada, explicaciones y respuesta abierta; diálogo de 6 intervenciones bilingües con análisis; contraste con [British Council: conditionals, zero/first/second](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-zero-first-second) y [Cambridge Grammar: conditionals](https://dictionary.cambridge.org/grammar/british-grammar/conditionals).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `133.json`.
- **Siguiente archivo pendiente:** `134.json`.

### 134/301 — Idiomas/cursos/en/lessons/134.json
- **Ruta:** Idiomas/cursos/en/lessons/134.json; fuente: _herramientas/cursos/en/19.txt.
- **Estado:** corregido.
- **Problemas encontrados:** el objetivo era distinguir condicional cero y primero, pero 4 de 6 ejercicios repetían exactamente «If you heat ice, it melts» y no se practicaba ninguna estructura del primer condicional. La misma frase se repetía en explicación, ejercicio de huecos, traducción, ordenar y escritura.
- **Cambios realizados:** resumí las reglas en dos explicaciones breves y contrastadas; practiqué ambos condicionales con ejemplos distintos; añadí huecos para el presente tras **if** y **will + verbo base** en el resultado futuro, además de distractores con retroalimentación específica. La lección queda en 8 actividades variadas.
- **Pruebas o comprobaciones ejecutadas:** compilación de fuente con cero avisos; igualdad estructural del JSON con el compilador; UTF-8/JSON válido y sin U+FFFD; 11 bloques, 8 IDs únicos y completos, una respuesta correcta por pregunta cerrada, explicaciones y respuestas de escritura; revisión de las formas verbales y traducciones frente a [British Council: zero, first and second conditionals](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-zero-first-second) y [Cambridge Grammar: conditionals](https://dictionary.cambridge.org/grammar/british-grammar/conditionals).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `134.json`.
- **Siguiente archivo pendiente:** `135.json`.

### 135/301 — Idiomas/cursos/en/lessons/135.json
- **Ruta:** Idiomas/cursos/en/lessons/135.json; fuente: _herramientas/cursos/en/19.txt.
- **Estado:** corregido.
- **Problemas encontrados:** 5 de las 6 actividades repetían **Unless the shop is closed, we'll buy the tickets there**; no había diálogo ni aplicación a otra situación. La intro definía **unless** como una condición que siempre debía cumplirse para evitar un resultado, formulación demasiado estrecha.
- **Cambios realizados:** precisé que **unless** suele equivaler a **if ... not** y expresa una excepción/condición; mantuve la regla de presente simple después de **unless** para una posibilidad futura; añadí un intercambio breve en una taquilla y diversifiqué las tareas entre equivalencia, forma verbal, traducción y comprensión.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente con cero avisos; igualdad exacta con el JSON generado; UTF-8/JSON válido y sin U+FFFD; 12 bloques, 8 ejercicios con IDs únicos y completos, una respuesta correcta por ejercicio cerrado y retroalimentación; diálogo de 4 intervenciones bilingües con análisis. Contraste con [Cambridge Grammar: unless](https://dictionary.cambridge.org/grammar/british-grammar/unless), que confirma el sentido de excepción/«if ... not» y el presente simple en la subordinada.
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `135.json`.
- **Siguiente archivo pendiente:** `136.json`.

### 136/301 — Idiomas/cursos/en/lessons/136.json
- **Ruta:** Idiomas/cursos/en/lessons/136.json; fuente: _herramientas/cursos/en/20.txt.
- **Estado:** corregido.
- **Problemas encontrados:** se explicaba **which** solo para cosas, aunque el ejemplo lo usaba con un loro; la nota «no repitas el sujeto» podía generalizarse indebidamente a todas las relativas y no diferenciaba cuando el pronombre relativo es objeto. La nota sobre **trainers** no indicaba que el sentido de calzado es británico; la conversación también tenía una colocación poco natural («where he has the fish»).
- **Cambios realizados:** aclaré que **which** sirve para animales y cosas y que **that** también puede introducir relativas identificativas de personas, animales y cosas; precisé cuándo no se duplica el sujeto y cuándo sí aparece un sujeto tras **who**; indiqué la diferencia UK/US de **trainers/sneakers**; ajusté el diálogo para que el garaje y la nevera tengan sentido y practiqué **that** en vez de repetir otra pregunta sobre **who**.
- **Pruebas o comprobaciones ejecutadas:** compilación desde la fuente sin avisos y paridad estructural exacta con el JSON; UTF-8/JSON válido; 13 bloques, 8 ejercicios con IDs únicos y completos, una respuesta correcta y explicación por cada pregunta cerrada; diálogo de 10 intervenciones con traducciones y análisis. Contraste con [Cambridge Grammar: relative pronouns](https://dictionary.cambridge.org/grammar/british-grammar/relative-pronouns/) y [Cambridge Dictionary: trainer](https://dictionary.cambridge.org/dictionary/english/trainer).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `136.json`.
- **Siguiente archivo pendiente:** `137.json`.

### 137/301 — Idiomas/cursos/en/lessons/137.json
- **Ruta:** Idiomas/cursos/en/lessons/137.json; fuente: _herramientas/cursos/en/20.txt.
- **Estado:** corregido.
- **Problemas encontrados:** el falso amigo **excited** se definía demasiado tajantemente; había ocho términos del glosario que no se usaban y faltaban **bored**, **boring**, **tired** y **expensive**, presentes en ejercicios. La explicación de **too much/many** no distinguía sustantivos incontables de plurales contables ni daba ejemplos; **enough** se describía sin limitar la regla a adjetivos y no se explicaba **too + adjective + to + verb**. Una traducción de **I'm surprised** era «me sorprende», que no conserva el significado.
- **Cambios realizados:** precisé **excited** como emoción positiva frente a **nervous**; expliqué de forma compacta **too + adjetivo (+ to + verbo)**, **enough** después de adjetivos y antes de nombres, y **too much** frente a **too many**; añadí una práctica de cantidades, depuré el vocabulario y rehice el diálogo para que la película, el regreso a casa y el transporte formen una secuencia natural. Corregí la traducción de **I'm surprised**.
- **Pruebas o comprobaciones ejecutadas:** compilación desde fuente con cero avisos; paridad estructural exacta del JSON; UTF-8/JSON válido, sin U+FFFD; 14 bloques, 8 ejercicios con IDs únicos y completos, una respuesta correcta por pregunta cerrada, retroalimentación y respuesta abierta; 7 intervenciones bilingües con análisis; contraste con [Cambridge Dictionary: excited](https://dictionary.cambridge.org/dictionary/english-spanish/excited), [too](https://dictionary.cambridge.org/grammar/british-grammar/too-enough) y [enough](https://dictionary.cambridge.org/grammar/british-grammar/enough).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `137.json`.
- **Siguiente archivo pendiente:** `138.json`.

### 138/301 — Idiomas/cursos/en/lessons/138.json
- **Ruta:** Idiomas/cursos/en/lessons/138.json; fuente: _herramientas/cursos/en/20.txt.
- **Estado:** corregido.
- **Problemas encontrados:** había un error tipográfico en el encabezado «Falsos amigo»; la descripción «el castillo es un palacio que es famoso» era poco natural y varias palabras del glosario (island, river) no aparecían en contexto. La lectura no explicaba que las relativas entre comas añaden información y no admiten **that**; la misma distinción se necesitaba para la frase de **neighbour**.
- **Cambios realizados:** corregí el encabezado; rehice la lectura para que el pueblo, la isla, el río, el puente, el castillo y el mercado formen una descripción coherente; incorporé una explicación breve de relativas entre comas y ajusté la práctica para comprobar que **that** no se usa allí. Añadí una pregunta de comprensión lectora.
- **Pruebas o comprobaciones ejecutadas:** compilación de fuente sin avisos y paridad JSON exacta; UTF-8/JSON válido, sin U+FFFD; 14 bloques, 8 IDs únicos, preguntas cerradas con una respuesta correcta y explicación, y 8 líneas bilingües de lectura con análisis; contraste con [Cambridge Grammar: relative clauses, defining and non-defining](https://dictionary.cambridge.org/grammar/british-grammar/relative-clauses-defining-and-non-defining), [relative pronouns](https://dictionary.cambridge.org/grammar/british-grammar/relative-pronouns/) y [Cambridge Dictionary: coach](https://dictionary.cambridge.org/dictionary/english/coach).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `138.json`.
- **Siguiente archivo pendiente:** `139.json`.

### 139/301 — Idiomas/cursos/en/lessons/139.json
- **Ruta:** Idiomas/cursos/en/lessons/139.json; fuente: _herramientas/cursos/en/20.txt.
- **Estado:** corregido.
- **Problemas encontrados:** de 6 actividades, 5 repetían **The book that you lent me was excellent**; **which** no aparecía en ningún ejercicio pese al título, y **borrow** figuraba como palabra clave aunque no se explicaba frente a **lend**.
- **Cambios realizados:** contrasté **who**, **which** y **that** en relativas que identifican personas o cosas y señalé el límite de **that** en relativas entre comas; añadí la distinción **borrow/lend**; diversifiqué los ejercicios para practicar los tres relativos, el vocabulario, una traducción, ordenar y escribir.
- **Pruebas o comprobaciones ejecutadas:** compilación de fuente sin avisos; paridad estructural exacta JSON/fuente; UTF-8/JSON válido y sin U+FFFD; 11 bloques, 8 ejercicios con IDs únicos y completos, una respuesta correcta por pregunta cerrada y explicaciones; revisión con [Cambridge Grammar: defining and non-defining relative clauses](https://dictionary.cambridge.org/grammar/british-grammar/relative-clauses-defining-and-non-defining), [relative pronouns](https://dictionary.cambridge.org/grammar/british-grammar/relative-pronouns/) y [borrow or lend](https://dictionary.cambridge.org/grammar/british-grammar/borrow-or-lend).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `139.json`.
- **Siguiente archivo pendiente:** `140.json`.

### 140/301 — Idiomas/cursos/en/lessons/140.json
- **Ruta:** Idiomas/cursos/en/lessons/140.json; fuente: _herramientas/cursos/en/20.txt.
- **Estado:** corregido.
- **Problemas encontrados:** las 6 actividades repetían **The bag is too heavy to carry**; aunque se mencionaban **adjective + enough + to** y **interested in + -ing**, no se explicaban con ejemplo ni se practicaban. La fuente tampoco precisaba que **interested in** lleva verbo en **-ing** cuando después viene un verbo.
- **Cambios realizados:** organicé la lección en tres patrones breves (**too + adjective + to**, **adjective + enough + to**, **interested in + -ing**) con ejemplos; aclaré la posición de **enough** y añadí tareas variadas de completar, traducir, ordenar y escribir. Cambié un distractor de traducción para evitar que **lift** y «cargar» pareciesen equivalentes en ese contexto.
- **Pruebas o comprobaciones ejecutadas:** compilación de fuente sin avisos y paridad estructural exacta con el JSON; UTF-8/JSON válido, sin U+FFFD; 12 bloques, 8 IDs únicos y completos, una respuesta correcta y explicación por pregunta cerrada, solución abierta presente; contraste con [Cambridge Grammar: too](https://dictionary.cambridge.org/grammar/british-grammar/too-enough), [enough](https://dictionary.cambridge.org/grammar/british-grammar/enough) y [interested](https://dictionary.cambridge.org/grammar/british-grammar/word-patterns-interested).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `140.json`.
- **Siguiente archivo pendiente:** `141.json`.

### 141/301 — Idiomas/cursos/en/lessons/141.json
- **Ruta:** Idiomas/cursos/en/lessons/141.json; fuente: _herramientas/cursos/en/21.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la intro afirmaba que la pasiva no dice quién actúa, aunque luego enseñaba **by**; el ejemplo **The garden is opened in summer** carecía de contexto y **The door is closed at night** podía leerse como estado; **rebuilt** aparecía sin explicación y varios participios del vocabulario no se practicaban. Dos actividades repetían la traducción de las ventanas; faltaba practicar **were** con sujeto plural en pasado.
- **Cambios realizados:** precisé que la pasiva centra la frase en quien recibe la acción y que el agente puede omitirse o añadirse con **by**; di contexto al jardín y al cierre con llave para que sean pasivas claras; reemplacé **rebuilt** y eliminé participios sin uso; añadí práctica de **was/were** con un sujeto plural y una traducción completa en pasado.
- **Pruebas o comprobaciones ejecutadas:** compilación desde fuente sin avisos; paridad estructural exacta del JSON; UTF-8/JSON válido y sin U+FFFD; 13 bloques, 8 IDs únicos, preguntas cerradas con una respuesta correcta y explicación, respuesta abierta completa; diálogo de 9 líneas con traducción y análisis; contraste con [Cambridge Grammar: passive forms](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms) y [British Council: active and passive voice](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/active-passive-voice).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `141.json`.
- **Siguiente archivo pendiente:** `142.json`.

### 142/301 — Idiomas/cursos/en/lessons/142.json
- **Ruta:** Idiomas/cursos/en/lessons/142.json; fuente: _herramientas/cursos/en/21.txt.
- **Estado:** corregido.
- **Problemas encontrados:** **have got to** se describía como obligación «fuerte», aunque Cambridge indica que tiene el mismo significado que **have to** y es más informal. **Needn't** se ejemplificaba como **needn't have one**, forma válida pero ambigua para este nivel por su parecido con **needn't have + participio** (acción pasada innecesaria). El ejercicio también repetía esa construcción; el diálogo no aclaraba que **needn't** lleva verbo base sin **to**.
- **Cambios realizados:** precisé **have got to/have to**; expliqué el patrón **needn't + verbo base** y lo contrasté con **mustn't**, además de conectarlo con **don't have to** ya visto; cambié el ejemplo ambiguo por **needn't get a visa** y depuré una palabra del glosario sin uso.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente con cero avisos; paridad estructural JSON/fuente; UTF-8/JSON válido y sin U+FFFD; 13 bloques, 8 IDs únicos y completos, una respuesta correcta y explicación por pregunta cerrada; diálogo de 8 turnos bilingües con análisis; contraste con [Cambridge Grammar: have got to and have to](https://dictionary.cambridge.org/grammar/british-grammar/have-got-to), [need](https://dictionary.cambridge.org/grammar/british-grammar/need) y [must](https://dictionary.cambridge.org/grammar/british-grammar/must).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 143/301 — Idiomas/cursos/en/lessons/143.json
- **Ruta:** Idiomas/cursos/en/lessons/143.json; fuente: _herramientas/cursos/en/21.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación de **by** decía que se usa simplemente cuando se sabe quién hizo la acción, sin explicar que se puede omitir al agente si no es conocido o relevante. **Old town** se traducía literalmente como «ciudad vieja» en vez de «casco antiguo». La lectura mezclaba referencias vagas ("here") y una frase poco natural (**The statue was visited by my friends**); faltaba una pregunta de comprensión. El ejercicio traducía **wall** como «pared» pese a usar «muralla» en el texto. Además, la explicación de **support** generalizaba **bear/stand** como traducción de «soportar» sin acotar el contexto.
- **Cambios realizados:** precisé la formación de la pasiva y el uso de **by + agente** frente a la omisión del agente; corregí **old town = casco antiguo**; reescribí el texto como lectura breve y coherente con vocabulario contextualizado; añadí una comprobación directa de comprensión; armonicé «muralla» en texto y ejercicio; acoté **support a project = apoyar** y diferencié «aguantar» como **put up with / tolerate**.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente sin avisos y paridad estructural exacta JSON/fuente; UTF-8/JSON válido, sin U+FFFD; 13 bloques, 9 IDs únicos, 8 frases bilingües con análisis y pregunta de comprensión; cada pregunta cerrada tiene exactamente una respuesta correcta y explicaciones, y el ejercicio abierto incluye solución y explicación. Contraste con [Cambridge Grammar: passives with and without an agent](https://dictionary.cambridge.org/uk/grammar/british-grammar/passives-with-and-), [Cambridge Dictionary: old town](https://dictionary.cambridge.org/us/dictionary/english/old-town), [support (English–Spanish)](https://dictionary.cambridge.org/dictionary/english-spanish/support) y [location](https://dictionary.cambridge.org/dictionary/english/location).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 144/301 — Idiomas/cursos/en/lessons/144.json
- **Ruta:** Idiomas/cursos/en/lessons/144.json; fuente: _herramientas/cursos/en/21.txt.
- **Estado:** corregido.
- **Problemas encontrados:** pese al título «presente y pasado», solo se enseñaba **was built**. Cinco de las seis tareas reutilizaban esa misma frase, sin practicar el presente ni la concordancia singular/plural. **Built** aparecía como vocabulario sin explicar que es el participio irregular de **build**.
- **Cambios realizados:** aclaré que la pasiva es **be + participio**, que **be** marca el tiempo y concuerda con el sujeto y que el participio se mantiene; añadí presente plural (**are made**), pasado singular (**was built**) y pasado plural (**were built**), con una nota breve **build–built–built**. Diversifiqué las tareas de selección, completar, traducción, comprensión auditiva, orden y producción.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente sin avisos; paridad estructural exacta JSON/fuente; UTF-8/JSON válido y sin U+FFFD; 12 bloques, 8 IDs únicos, ejemplos de pasiva en presente y pasado; una respuesta correcta y explicación por ejercicio cerrado, solución y explicación para el abierto. Contraste con [Cambridge Grammar: passive forms](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms) y [British Council: passives](https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/passives).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 145/301 — Idiomas/cursos/en/lessons/145.json
- **Ruta:** Idiomas/cursos/en/lessons/145.json; fuente: _herramientas/cursos/en/21.txt.
- **Estado:** corregido.
- **Problemas encontrados:** las seis actividades reutilizaban **The picture was painted by Lee**, aunque el título también promete **needn't** y **have to**. No se practicaban estos modales ni se explicaba que **needn't** va seguido del verbo base sin **to**, que **have to/has to** expresa obligación, o que **mustn't** es prohibición. Tampoco se explicaba que se puede omitir el agente de la pasiva cuando se desconoce o no importa.
- **Cambios realizados:** añadí una explicación breve de **by + agente** y cuándo omitirlo; contrasté **needn't**, **have to/has to** y **mustn't**; incorporé ejemplos cotidianos y actividades separadas para cada punto. Varié las frases, acoté el contexto para que «opcional» no se confunda con «prohibido» y eliminé una respuesta abierta duplicada.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente sin avisos; paridad estructural exacta JSON/fuente; UTF-8/JSON válido y sin U+FFFD; 11 bloques y 7 IDs únicos; cada ejercicio cerrado tiene una sola respuesta correcta y todas las opciones tienen explicación; el ejercicio abierto contiene solución y explicación. Contraste con [Cambridge Grammar: passive agents](https://dictionary.cambridge.org/grammar/british-grammar/passives-with-and-), [need](https://dictionary.cambridge.org/grammar/british-grammar/need) y [must](https://dictionary.cambridge.org/grammar/british-grammar/must).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 146/301 — Idiomas/cursos/en/lessons/146.json
- **Ruta:** Idiomas/cursos/en/lessons/146.json; fuente: _herramientas/cursos/en/22.txt.
- **Estado:** corregido.
- **Problemas encontrados:** **May** se explicaba solo como posibilidad, aunque el diálogo lo usaba para pedir permiso. **Could I have a table?** se traducía literalmente y no explicaba que **could** suaviza una petición presente. El diálogo sobre la reserva mezclaba disponibilidad, permiso y una oferta sin suficiente contexto. **Do you mind waiting** aparecía sin explicar **mind + -ing** ni cómo entender **No, not at all**; algunas tareas repetían **I'm afraid** y no había una pregunta de comprensión de la lectura. **Wrong** y la entrada oculta **able** no se usaban en el contenido.
- **Cambios realizados:** expliqué **could** como petición cortés, añadí los dos usos de **may** (posibilidad y permiso), aclaré **would you like**, **shall I**, **I'm afraid** y **Do you mind + -ing**; reescribí el diálogo de reserva con secuencia clara y traducción natural de la petición de mesa; retiré vocabulario sin uso; varié las actividades y añadí comprensión lectora.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente sin avisos y paridad estructural exacta JSON/fuente; UTF-8/JSON válido, sin U+FFFD; 14 bloques, 9 IDs únicos y diálogo de 7 turnos bilingües; una respuesta correcta y explicaciones en cada tarea cerrada, solución y explicación en la abierta. Contraste con [Cambridge Grammar: can, could or may](https://dictionary.cambridge.org/grammar/british-grammar/can-could), [may](https://dictionary.cambridge.org/grammar/british-grammar/may.), [shall](https://dictionary.cambridge.org/us/grammar/british-grammar/shall), [mind](https://dictionary.cambridge.org/us/grammar/british-grammar/mind) y [afraid](https://dictionary.cambridge.org/uk/grammar/british-grammar/afraid).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 147/301 — Idiomas/cursos/en/lessons/147.json
- **Ruta:** Idiomas/cursos/en/lessons/147.json; fuente: _herramientas/cursos/en/22.txt.
- **Estado:** corregido.
- **Problemas encontrados:** **at five** en el título podía interpretarse como una hora, no una edad. La explicación cubría bien la capacidad general pasada con **could**, pero no delimitaba los logros conseguidos en una ocasión concreta. El diálogo no tenía una pregunta directa de comprensión.
- **Cambios realizados:** precisé el título como **when I was five**; añadí una nota concisa con **was/were able to** y **managed to** para un logro concreto, aclarando que **couldn't** también puede describir una ocasión fallida; añadí una pregunta de comprensión sobre lo que el hermano no sabía hacer y ajusté el título del diálogo.
- **Pruebas o comprobaciones ejecutadas:** compilación sin avisos y paridad estructural JSON/fuente; UTF-8/JSON válido, sin U+FFFD; 14 bloques, 9 IDs únicos, diálogo bilingüe; cada ejercicio cerrado tiene una sola respuesta correcta y explicaciones, y el abierto tiene solución y explicación. Contraste con [Cambridge Grammar: could](https://dictionary.cambridge.org/grammar/british-grammar/could%3A) y [British Council: past ability](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/past-ability).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 148/301 — Idiomas/cursos/en/lessons/148.json
- **Ruta:** Idiomas/cursos/en/lessons/148.json; fuente: _herramientas/cursos/en/22.txt.
- **Estado:** corregido.
- **Problemas encontrados:** la regla decía «nunca se pone **to** después de preposición», formulación que confundía el marcador del infinitivo con la preposición **to**; la cabecera de adjetivo + infinitivo podía parecer universal. En el diálogo, el tren salía primero a las cinco y la supuesta corrección volvía a decir las cinco. La opción «El tren saldrá a las cinco» también era una traducción válida del horario, así que la pregunta tenía más de una respuesta razonable. Tres entradas de vocabulario (**opens**, **dancing**, **prepared**) no aparecían en el contenido ni se practicaban; no había una pregunta de comprensión lectora.
- **Cambios realizados:** precisé que tras una preposición se usa **-ing**, no el infinitivo con **to**, y que solo algunos adjetivos siguen el patrón **to + verbo**; matizé que **going to** sirve para intenciones, sin presentarlo como única forma de futuro personal; corregí la secuencia de salida del tren y añadí lectura con comprensión; reemplacé el distractor de traducción ambiguo por otro inequívocamente incorrecto y retiré vocabulario sin uso.
- **Pruebas o comprobaciones ejecutadas:** compilación de la fuente sin avisos y paridad estructural exacta JSON/fuente; UTF-8/JSON válido, sin U+FFFD; 14 bloques, 9 IDs únicos, diálogo bilingüe de 8 turnos con secuencia temporal revisada y pregunta de comprensión; todos los ejercicios cerrados tienen una respuesta correcta y explicaciones, y el abierto incluye solución y explicación. Contraste con [Cambridge Grammar: verb + -ing / infinitive](https://dictionary.cambridge.org/us/grammar/british-grammar/infinitive-verbs), [interested](https://dictionary.cambridge.org/grammar/british-grammar/word-patterns-interested), [present simple for timetables](https://dictionary.cambridge.org/grammar/british-grammar/simple-future), [be going to](https://dictionary.cambridge.org/uk/grammar/british-grammar/will-or-be-going-to) y [Cambridge Dictionary: timetable](https://dictionary.cambridge.org/dictionary/english-spanish/timetable).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `148.json`.
- **Siguiente archivo pendiente:** `149.json`.


### 149/301 — `Idiomas/cursos/en/lessons/149.json`
- **Ruta:** `Idiomas/cursos/en/lessons/149.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación presentaba **-ly** y la posición final como reglas demasiado generales; omitía que **who’s** también contrae **who has**; la nota de **mayor** no distinguía con suficiente precisión los sentidos inglés y español; la traducción de **charity shop** era imprecisa; el ejemplo decía *clean the bin* donde la acción prevista era vaciarlo. La lección no contenía una pregunta directa sobre el texto de lectura.
- **Cambios realizados:** acoté la regla de los adverbios; amplié la nota de **who’s** y precisé el falso amigo **mayor**; afiné la traducción de **charity shop**; cambié *clean* por *empty* con la traducción correspondiente; añadí una pregunta de comprensión lectora con distractores diferenciados y explicación de cada opción.
- **Pruebas o comprobaciones ejecutadas:** recompilación de la fuente sin avisos y paridad estructural exacta entre fuente y JSON; JSON UTF-8 válido; 15 bloques, 10 IDs únicos, lectura de 8 frases y 10 actividades; preguntas cerradas con una sola respuesta correcta y explicación para cada opción; actividad abierta con solución aceptada y explicación. Contraste con [Cambridge: adverb forms](https://dictionary.cambridge.org/uk/grammar/british-grammar/adverbs-forms), [adverb position](https://dictionary.cambridge.org/uk/grammar/british-grammar/adverbs-and-adverb-phrases), [who’s](https://dictionary.cambridge.org/dictionary/english/who-s), [whose](https://dictionary.cambridge.org/grammar/british-grammar/whose), [charity shop](https://dictionary.cambridge.org/dictionary/english-spanish/charity-shop) y [mayor](https://dictionary.cambridge.org/dictionary/english/mayor).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `149.json`.
- **Siguiente archivo pendiente:** `150.json`.


### 150/301 — `Idiomas/cursos/en/lessons/150.json`
- **Ruta:** `Idiomas/cursos/en/lessons/150.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la traducción de *They were walking to school* era poco natural y el enunciado pedía solo “qué significa”, aunque un distractor en pasado simple podía resultar una traducción válida sin contexto suficiente. La explicación del distractor **gone** no vinculaba claramente el participio con el marcador temporal **last year**.
- **Cambios realizados:** alineé la traducción con la lección del capítulo 12 (**Estaban caminando al colegio**) y reformulé la consigna para preguntar por la acción en curso; las explicaciones distinguen presente y hecho completo en pasado. Precisé por qué **last year** exige **went**, no el participio **gone**.
- **Pruebas o comprobaciones ejecutadas:** fuente compilada sin avisos y JSON regenerado; paridad estructural exacta fuente/JSON; JSON UTF-8 válido; 10 bloques con 10 IDs únicos; cada ejercicio cerrado tiene exactamente una respuesta correcta y explicación para todas las opciones; los ejercicios abiertos incluyen respuesta y explicación. Contraste con [Cambridge: irregular verbs](https://dictionary.cambridge.org/grammar/british-grammar/irregular-verbs), [used to](https://dictionary.cambridge.org/us/grammar/british-grammar/used-to%C2%A0), [past continuous or past simple](https://dictionary.cambridge.org/grammar/british-grammar/past-continuous-or-past-simple), [present perfect simple](https://dictionary.cambridge.org/grammar/british-grammar/present-perfect-simple-i-) y [walk, inglés-español](https://dictionary.cambridge.org/dictionary/english-spanish/walk).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `150.json`.
- **Siguiente archivo pendiente:** `151.json`.


### 151/301 — `Idiomas/cursos/en/lessons/151.json`
- **Ruta:** `Idiomas/cursos/en/lessons/151.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación de **will** como futuro «sin pruebas» contradecía el capítulo 17, que reconoce que **will** también puede expresar predicciones y opiniones, según el contexto. Además, «¿qué significa *It’s going to rain*?» admitía «Lloverá» como traducción posible, por lo que la clave no comprobaba la forma objetivo de manera inequívoca.
- **Cambios realizados:** convertí la pregunta en identificación de la estructura **be going to + verbo base** y reemplacé las opciones por otras formas verbales inequívocas, con explicaciones. Revisé el resto: comparativo y superlativo, toma de decisión con **I’ll have**, prohibición frente a falta de obligación y contraste con **but** son correctos.
- **Pruebas o comprobaciones ejecutadas:** fuente recompilada sin avisos; paridad estructural exacta fuente/JSON; JSON UTF-8 válido; 7 bloques, 7 IDs únicos; cada actividad cerrada tiene exactamente una respuesta correcta y las tres opciones incluyen explicación. Contraste con [Cambridge: comparación de adjetivos](https://dictionary.cambridge.org/grammar/british-grammar/comparison-adjectives-bigger-biggest-more-interesting), [will o be going to](https://dictionary.cambridge.org/grammar/british-grammar/will-or-be-going-to), [must / mustn’t](https://dictionary.cambridge.org/grammar/british-grammar/must) y [but](https://dictionary.cambridge.org/grammar/british-grammar/conjunctions-contrasting).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `151.json`.
- **Siguiente archivo pendiente:** `152.json`.


### 152/301 — `Idiomas/cursos/en/lessons/152.json`
- **Ruta:** `Idiomas/cursos/en/lessons/152.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la pregunta abierta «¿Cómo se dice no hace falta que vengas?» podía tener otras respuestas correctas aparte de **You needn’t come**; la traducción «El tren sale a las cinco» daba como incorrecta «El tren saldrá a las cinco», aunque ambas pueden expresar el mismo horario en español. La explicación de **ready for to go** mezclaba la construcción **ready + infinitivo** con una regla general de preposición; además, **who’s** se reducía a **who is** pese a poder significar también **who has**.
- **Cambios realizados:** hice que la respuesta abierta pidiera explícitamente usar **needn’t**; reformulé el ejercicio del tren para reconocer el presente simple en un horario fijo; ajusté las explicaciones de **ready to** e **interested in + -ing**, y completé la nota sobre **who’s**.
- **Pruebas o comprobaciones ejecutadas:** recompilación sin avisos y paridad estructural exacta fuente/JSON; JSON UTF-8 válido; 13 bloques, 13 IDs únicos; todas las actividades cerradas tienen una respuesta correcta y explicación por opción; el ejercicio abierto conserva respuesta y explicación. Contraste con [Cambridge: relative clauses](https://dictionary.cambridge.org/grammar/british-grammar/relative-clauses-defining-and-non-defining), [passive forms](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms), [need](https://dictionary.cambridge.org/grammar/british-grammar/need), [mind](https://dictionary.cambridge.org/us/grammar/british-grammar/mind), [interested](https://dictionary.cambridge.org/grammar/british-grammar/word-patterns-interested), [ready](https://dictionary.cambridge.org/dictionary/english/ready) y [present simple for timetables](https://dictionary.cambridge.org/grammar/british-grammar/simple-future).
- **Resultado de esas pruebas:** correcto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `152.json`.
- **Siguiente archivo pendiente:** `153.json`.


### 153/301 — `Idiomas/cursos/en/lessons/153.json`
- **Ruta:** `Idiomas/cursos/en/lessons/153.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** no encontré errores de traducción, incoherencias horarias ni preguntas con más de una respuesta correcta. Los dos textos cubren el mensaje de invitación y el aviso de andén/retraso; las preguntas recuperan propósito, día, hora, lugar y datos concretos.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** JSON UTF-8 válido y sin U+FFFD; fuente recompilada sin avisos y paridad exacta fuente/JSON; 14 bloques, dos textos y 11 IDs únicos; todas las actividades cerradas tienen una clave correcta y explicación por opción; las abiertas y de ordenar incluyen respuesta/traducción y explicación. Contrasté **if** en preguntas indirectas con [Cambridge: if or whether](https://dictionary.cambridge.org/es/gramatica/gramatica-britanica/if-or-whether) y la expresión de horarios con [Cambridge: present simple for future timetables](https://dictionary.cambridge.org/grammar/british-grammar/simple-future); comprobé también [tell](https://dictionary.cambridge.org/dictionary/english-spanish/tell), [vegetarian](https://dictionary.cambridge.org/dictionary/english-spanish/vegetarian) y [platform](https://dictionary.cambridge.org/dictionary/english-spanish/platform).
- **Resultado de esas pruebas:** correcto; todos los datos de lectura coinciden con las preguntas y sus claves.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `153.json`.
- **Siguiente archivo pendiente:** `154.json`.


### 154/301 — `Idiomas/cursos/en/lessons/154.json`
- **Ruta:** `Idiomas/cursos/en/lessons/154.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** dos ejercicios seguidos repetían literalmente el mismo hueco; **look for**, que aparecía en el vocabulario, no se practicaba; la regla de posición no contrastaba **look for** con el phrasal verb separable **turn off**; la pregunta aislada sobre **turn off** no fijaba contexto pese a que la expresión tiene más de un sentido; la respuesta abierta solo admitía la contracción **I’m**, aunque la forma completa también es correcta.
- **Cambios realizados:** acoté la regla de **turn off** y la contrasté con **look for**, cuya preposición no se separa; sustituí el ejercicio duplicado por práctica de **look for + pronombre**; contextualicé **turn off** con **the TV**; cambié una traducción para practicar **look for** y añadí ambas respuestas válidas (**I’m / I am**).
- **Pruebas o comprobaciones ejecutadas:** recompilación sin avisos y paridad exacta fuente/JSON; JSON UTF-8 válido; 8 bloques, 6 IDs únicos; cada actividad cerrada tiene una clave correcta y explicación para cada opción; la actividad abierta admite las dos respuestas comprobadas. Contraste con [Cambridge: phrasal verbs y posición del objeto](https://dictionary.cambridge.org/grammar/british-grammar/verbs-multi-word-verbs), [look for](https://dictionary.cambridge.org/dictionary/english/look-for) y [turn off](https://dictionary.cambridge.org/dictionary/english/turn-off).
- **Resultado de esas pruebas:** correcto; la lección practica ambos patrones sin duplicar el mismo ejercicio.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `154.json`.
- **Siguiente archivo pendiente:** `155.json`.


### 155/301 — `Idiomas/cursos/en/lessons/155.json`
- **Ruta:** `Idiomas/cursos/en/lessons/155.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la introducción pedía comparar el itinerario con un «mensaje de cambio» inexistente y buscar un número de reserva que el texto no contenía. Un test de huecos reutilizaba como distractores fechas y horas ajenas a esa frase; el siguiente ejercicio repetía el mismo hueco. También se repetía el ejemplo de las dos noches en traducción, ordenación y escritura, y se listaba **arrival** como palabra oculta sin usarla.
- **Cambios realizados:** ajusté la instrucción a los datos que sí aparecen; retiré **arrival** sin uso; convertí la pregunta repetida en comprensión sobre la duración y usé el hueco siguiente para practicar la hora de salida del tren, con distractores plausibles; cambié la traducción a la fecha/hora de check-in y la respuesta abierta a la frase del tren, reduciendo la repetición.
- **Pruebas o comprobaciones ejecutadas:** recompilación sin avisos y paridad exacta fuente/JSON; JSON UTF-8 válido; 11 bloques y 8 IDs únicos; todos los tests y huecos tienen una sola respuesta correcta y explicaciones en cada opción; ordenar y escribir conservan frase/solución y explicación. Contrasté [Cambridge: check in](https://dictionary.cambridge.org/dictionary/english-spanish/check-in-check-into), [arrive](https://dictionary.cambridge.org/dictionary/english/arrive), [arrival](https://dictionary.cambridge.org/dictionary/english/arrival), [leave](https://dictionary.cambridge.org/dictionary/english/leave) y el [presente simple en horarios](https://dictionary.cambridge.org/grammar/british-grammar/simple-future).
- **Resultado de esas pruebas:** correcto; cada pregunta se responde con un dato explícito y los ejercicios no intercambian hora de llegada y de salida.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `155.json`.
- **Siguiente archivo pendiente:** `156.json`.

### 156/301 — `Idiomas/cursos/en/lessons/156.json`
- **Ruta:** `Idiomas/cursos/en/lessons/156.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** un distractor decía que el aviso era sobre una reparación, dato que no aparece; dos ejercicios probaban el mismo hueco de «unavailable until Friday»; esa palabra está por encima del nivel previsto para una lectura A2 (Cambridge la etiqueta B2); no se comprobaban los días ni el precio del curso, datos centrales del anuncio.
- **Cambios realizados:** reescribí el aviso con «There is no hot water until Friday»; retiré «unavailable» del vocabulario objetivo; corregí el distractor para que no invente una reparación; varié la práctica para comprobar qué se anuncia, los días y la cuota mensual, y revisé la pregunta de días. Conservé un ejercicio de traducción y usé la ordenación para la petición de llamar a la oficina.
- **Pruebas o comprobaciones ejecutadas:** recompilé desde `_herramientas/cursos/en/22.txt`; paridad exacta fuente/JSON; JSON UTF-8 válido y lectura posterior satisfactoria; cero avisos; 11 bloques, 8 IDs únicos; cada test/hueco tiene exactamente una respuesta correcta y todas las opciones explican el feedback; datos completos para ordenar/escribir. El intento de `git diff --check` no se pudo aplicar porque esta carpeta no es un repositorio Git. Contrasté el tipo de lectura con el [formato oficial A2 Key de Cambridge](https://www.cambridgeenglish.org/exams-and-tests/qualifications/key/format/?skill=reading), las características de lectura breve A2 del [CEFR Companion Volume](https://rm.coe.int/cefr-companion-volumewith-new-descriptors-2018/1680787989), la entrada de Cambridge para [unavailable](https://dictionary.cambridge.org/dictionary/english/unavailable) y la gramática de [until](https://dictionary.cambridge.org/us/grammar/british-grammar/until).
- **Resultado de esas pruebas:** correcto; la lectura y sus preguntas se limitan a información explícita de los avisos, y las tareas ya no repiten el mismo hueco.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `156.json`.
- **Siguiente archivo pendiente:** `157.json`.

### 157/301 — `Idiomas/cursos/en/lessons/157.json`
- **Ruta:** `Idiomas/cursos/en/lessons/157.json`; fuente editable: `_herramientas/cursos/en/22.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el correo no identificaba a Anna aunque las instrucciones y preguntas la nombraban como remitente; la explicación pedía distinguir la fecha de envío de la actividad, pero el texto no incluía fecha de envío; cuatro ejercicios repetían la misma oración sobre encontrarse en la estación; «ticket» no aclaraba si era entrada del museo o billete de transporte; la guía de pronunciación de **meet** no mostraba la vocal larga /iː/.
- **Cambios realizados:** identifiqué a Anna en el saludo y añadí un cierre breve; centré la explicación en los detalles que sí contiene el correo; varié las tareas para comprobar motivo, día, lugar, qué llevar y hora; precisé que el descuento es para una entrada del museo; cambié la traducción de **meet** a «reunirse con; quedar con» y la aproximación de pronunciación a «míit».
- **Pruebas o comprobaciones ejecutadas:** recompilé desde `_herramientas/cursos/en/22.txt`; paridad exacta fuente/JSON; JSON UTF-8 válido y sin caracteres de reemplazo; cero avisos; 11 bloques, 8 IDs únicos; una respuesta correcta y feedback por opción en todos los ejercicios cerrados; respuestas completas en ordenar/escribir. Consulté el [formato oficial A2 Key de Cambridge](https://www.cambridgeenglish.org/exams-and-tests/qualifications/key/format/?skill=reading), el descriptor A2 de lectura del [CEFR Companion Volume](https://rm.coe.int/cefr-companion-volumewith-new-descriptors-2018/1680787989), Cambridge Learner’s Dictionary para [trip (A2)](https://dictionary.cambridge.org/dictionary/learner-english/trip) y la pronunciación /miːt/ de [meet](https://dictionary.cambridge.org/pronunciation/english/meet).
- **Resultado de esas pruebas:** correcto; el remitente y los detalles preguntados están respaldados por el correo, y la secuencia de ejercicios comprueba datos distintos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `157.json`.
- **Siguiente archivo pendiente:** `158.json`.

### 158/301 — `Idiomas/cursos/en/lessons/158.json`
- **Ruta:** `Idiomas/cursos/en/lessons/158.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el ejemplo de «no retroceder» usaba **says** en presente en lugar de un verbo de reporte en pasado; una explicación identificaba erróneamente una traducción en presente como estilo directo; los huecos **can/could** y **will/would** no especificaban el retroceso esperado y admitían formas válidas sin retroceso según el contexto; la traducción de **the bus was late** no reflejaba bien que iba con retraso; una frase de diálogo con **ordinary** sonaba ilógica, su nota de falso amigo era demasiado tajante y **confused** aparecía como vocabulario sin usarse.
- **Cambios realizados:** expliqué que el retroceso es habitual pero no automático y añadí un ejemplo correcto con **said**; corregí el feedback y precisé los huecos para pedir explícitamente el retroceso habitual, reconociendo cuándo una forma sin retroceso también puede ser válida; afiné la explicación de **say/tell**, la traducción del autobús y el uso de **complain + that**; contextualicé **ordinary** y retiré **confused** del vocabulario no usado.
- **Pruebas o comprobaciones ejecutadas:** recompilé desde `_herramientas/cursos/en/23.txt`; paridad exacta fuente/JSON; JSON UTF-8 válido y sin caracteres de reemplazo; cero avisos; 14 bloques, 8 IDs únicos; todos los ejercicios cerrados tienen una respuesta correcta y feedback por opción; campos de ordenar/escribir completos. La primera aserción auxiliar miró el índice de bloque equivocado; la corregí para seleccionar el ejercicio por ID y la validación pasó. Contrasté la regla y la excepción con [Cambridge Grammar: reported speech](https://dictionary.cambridge.org/grammar/british-grammar/reported-speech-indirect-speech), **say/tell** con [Cambridge Grammar](https://dictionary.cambridge.org/grammar/british-grammar/word-choice-say-or-tell), los verbos que admiten cláusula con **that** con [Cambridge Grammar](https://dictionary.cambridge.org/grammar/british-grammar/that-clause) y la traducción de **ordinary** con el [Cambridge English–Spanish Dictionary](https://dictionary.cambridge.org/es/diccionario/ingles-espanol/ordinary).
- **Resultado de esas pruebas:** correcto; las preguntas especifican la transformación que evalúan y los ejemplos ya no presentan como regla absoluta un cambio que depende del contexto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `158.json`.
- **Siguiente archivo pendiente:** `159.json`.

### 159/301 — `Idiomas/cursos/en/lessons/159.json`
- **Ruta:** `Idiomas/cursos/en/lessons/159.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la introducción decía que las preguntas indirectas nunca llevan signo de interrogación, aunque el ejemplo **Do you know whether the bus is late?** es una pregunta completa; la regla de orden y retroceso necesitaba acotarse a la cláusula indirecta y presentarse como retroceso habitual; la traducción de **we were lost** como «nos habíamos perdido» cambiaba el estado por un hecho anterior; **ask** tenía la grafía como pronunciación; un distractor en español era poco natural y no se evaluaba directamente el orden sujeto-verbo en una pregunta indirecta.
- **Cambios realizados:** aclaré que el signo depende de la oración completa y reforcé **if/whether + sujeto + verbo**; precisé que el retroceso suele ocurrir con un verbo de reporte pasado; corregí **estábamos perdidos**, la aproximación de **ask** y el distractor; añadí una pregunta que contrasta el orden correcto con la inversión propia de una pregunta directa y adapté ordenación/escritura para evitar la ambigüedad de género de «lista».
- **Pruebas o comprobaciones ejecutadas:** recompilé desde `_herramientas/cursos/en/23.txt`; paridad exacta fuente/JSON; JSON UTF-8 válido y sin caracteres de reemplazo; cero avisos; 14 bloques y 9 IDs únicos; todos los ejercicios cerrados tienen una sola respuesta correcta y feedback por opción; ordenar/escribir incluyen frase, traducción/respuesta y explicación. Contrasté el orden y puntuación con [Cambridge Grammar: reported questions](https://dictionary.cambridge.org/grammar/british-grammar/reported-speech-indirect-speech), **if/whether** con [Cambridge Grammar](https://dictionary.cambridge.org/us/grammar/british-grammar/if-or-whether) y la pronunciación /ɑːsk/ de [ask](https://dictionary.cambridge.org/pronunciation/english/ask).
- **Resultado de esas pruebas:** correcto; el ejemplo distingue una cláusula indirecta de una pregunta completa y las actividades comprueban directamente el orden sujeto-verbo.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `159.json`.
- **Siguiente archivo pendiente:** `160.json`.

### 160/301 — `Idiomas/cursos/en/lessons/160.json`
- **Ruta:** `Idiomas/cursos/en/lessons/160.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** las definiciones trataban **contest** y **sympathy** como equivalencias absolutas; la pronunciación figurada de **sympathy** reemplazaba /θ/ por /t/; la nota de **report** era confusa y no reflejaba el uso regional de **reportar**; el texto afirmaba que el resultado era justo y luego lo llamaba poco claro sin explicar la discrepancia; **tournament** aparecía en el glosario y el feedback, pero no se enseñaba en el texto; faltaba probar directamente el orden del estilo indirecto.
- **Cambios realizados:** acoté **contest** como sustantivo y distinguí su uso verbal; limité **sympathy** a su sentido contextual de compasión y añadí la guía /θ/; expliqué los distintos sentidos y usos regionales de **report/reportar**; hice explícito el desacuerdo sobre la imparcialidad, añadí **fair** y **unclear** al vocabulario, retiré **tournament** y cambié una actividad de ordenar para practicar la cláusula indirecta.
- **Pruebas o comprobaciones ejecutadas:** compilé con el cargador de cursos sin avisos; JSON UTF-8 válido y paridad exacta con la fuente; 15 bloques y 10 IDs únicos; ocho ejercicios cerrados con una sola respuesta correcta y explicación por opción; campos obligatorios de ordenar/escribir completos; vocabulario y coherencia del relato comprobados. Contraste con [Cambridge: reported speech](https://dictionary.cambridge.org/us/grammar/british-grammar/reporting-verbs), [contest](https://dictionary.cambridge.org/dictionary/english/contest), [contest inglés-español](https://dictionary.cambridge.org/dictionary/english-spanish/contest), [sympathy y pronunciación](https://dictionary.cambridge.org/dictionary/english-spanish/sympathy), [report inglés-español](https://dictionary.cambridge.org/dictionary/english-spanish/report) y [reportar](https://dictionary.cambridge.org/dictionary/spanish-english/reportar).
- **Resultado de esas pruebas:** correcto; la explicación y los ejercicios coinciden con el texto y la distinción entre cita directa y resumen indirecto queda contextualizada.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `160.json`.
- **Siguiente archivo pendiente:** `161.json`.

### 161/301 — `Idiomas/cursos/en/lessons/161.json`
- **Ruta:** `Idiomas/cursos/en/lessons/161.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** **not to leave** solo se traducía como «no irse», pero en el diálogo se refiere a no dejar atrás el equipaje; **bags** mostraba su grafía como pronunciación y solo «bolsas», poco natural en un hotel; **warned** y **touch** tenían glosas poco adecuadas al ejemplo; una nota analítica cambiaba el subjuntivo de pasado al presente; el ejercicio de advertencia usaba **it** sin referente y la consigna escrita omitía el sujeto femenino de la respuesta única.
- **Cambios realizados:** acoté la explicación de **tell/ask + persona + to** y la negación con **not**; amplié los sentidos de **not to leave**, adapté **bags** a maletas/equipaje, corregí **warned**, **touch** y su guía de pronunciación, alineé la nota con **te sentaras**, cambié la traducción del recordatorio a «que pregunte» y di referente explícito a **wet paint**; precisé «ella» en la consigna de escritura.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON válido, UTF-8 limpio y paridad exacta con la fuente; 10 bloques y 7 IDs únicos; 5 ejercicios cerrados con una respuesta correcta y feedback en cada opción; campos completos para ordenar y escribir. Contraste con [Cambridge: say/tell y órdenes](https://dictionary.cambridge.org/grammar/british-grammar/say-or-tell), [ask + objeto + infinitivo](https://dictionary.cambridge.org/grammar/british-grammar/ask-and-ask-for), [remind](https://dictionary.cambridge.org/dictionary/english-spanish/remind), [warn](https://dictionary.cambridge.org/dictionary/english-spanish/warn), [bag](https://dictionary.cambridge.org/dictionary/english-spanish/bag) y [touch](https://dictionary.cambridge.org/us/dictionary/english-spanish/touch).
- **Resultado de esas pruebas:** correcto; las instrucciones, el diálogo y las traducciones practican el mismo patrón sin referentes ambiguos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `161.json`.
- **Siguiente archivo pendiente:** `162.json`.

### 162/301 — `Idiomas/cursos/en/lessons/162.json`
- **Ruta:** `Idiomas/cursos/en/lessons/162.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** **missed** se glosaba como «se perdió» en el contexto de perder un tren; **reached** omitía la traducción contextual «llegó a» y no advertía que **reach + lugar** no lleva **to**; la cronología de compra de billetes no era explícita, un distractor dependía de inferirla y el único ejercicio escrito apenas comprobaba **by the time**, no el pasado perfecto.
- **Cambios realizados:** afiné la explicación del pasado perfecto y añadí un ejemplo sencillo con **before**; aclaré los sentidos de **missed** y **reached**; precisé que los billetes se habían comprado antes de llegar; contextualicé el olvido de mirar la hora de salida y convertí la consigna final en una traducción completa que practica **By the time + pasado simple** junto con el hecho anterior en pasado perfecto.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 10 bloques y 7 IDs únicos; 5 ejercicios cerrados con una sola respuesta correcta y feedback para cada opción; campos de ordenar/escribir completos; cronología comprobada. Contraste con [Cambridge Grammar: past perfect o past simple](https://dictionary.cambridge.org/us/grammar/british-grammar/past-perfect-simple), [uso del pasado perfecto](https://dictionary.cambridge.org/grammar/british-grammar/past-perfect-i-), [by the time](https://dictionary.cambridge.org/grammar/british-grammar/by), [before/after](https://dictionary.cambridge.org/grammar/british-grammar/conjunctions-time), [miss](https://dictionary.cambridge.org/us/grammar/british-grammar/miss) y [reach, inglés-español](https://dictionary.cambridge.org/es/diccionario/ingles-espanol/reach).
- **Resultado de esas pruebas:** correcto; la secuencia temporal se entiende sin depender de un distractor ambiguo y el pasado perfecto se practica en una respuesta completa.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `162.json`.
- **Siguiente archivo pendiente:** `163.json`.

### 163/301 — `Idiomas/cursos/en/lessons/163.json`
- **Ruta:** `Idiomas/cursos/en/lessons/163.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** tres actividades repetían la misma frase y solo se mostraba el cambio **present → past**, pese a que el título anunciaba varios cambios de tiempo; no se explicaba que el retroceso es habitual, pero no obligatorio cuando la información sigue vigente; **journey** se glosaba solo como «trayecto» aunque el ejemplo usaba «viaje».
- **Cambios realizados:** organicé ejemplos separados para **present → past**, **will → would** con cambio de referencia temporal y **past simple → past perfect**; añadí la excepción de información todavía cierta o relevante; varié comprensión, huecos, traducción, ordenar y escritura, y amplié **journey** a «viaje; trayecto».
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 9 bloques y 6 IDs únicos; 4 ejercicios cerrados con una respuesta correcta y feedback en cada opción; campos de ordenar/escribir completos; tres patrones de cambio comprobados. Contraste con [Cambridge Grammar: reported speech](https://dictionary.cambridge.org/grammar/british-grammar/reported-speech-indirect-speech), [would en estilo indirecto](https://dictionary.cambridge.org/grammar/british-grammar/would) y [exhausted](https://dictionary.cambridge.org/dictionary/english-spanish/exhausted).
- **Resultado de esas pruebas:** correcto; se practican varios retrocesos con contexto temporal, sin presentar la regla como absoluta.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `163.json`.
- **Siguiente archivo pendiente:** `164.json`.

### 164/301 — `Idiomas/cursos/en/lessons/164.json`
- **Ruta:** `Idiomas/cursos/en/lessons/164.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** varias actividades repetían casi palabra por palabra **He asked me if I agreed with the proposal**; **whether** aparecía en el glosario, pero apenas se enseñaba ni se practicaba; faltaba explicar de forma directa que las dos formas introducen preguntas indirectas de sí/no y que dentro de la cláusula se usa orden sujeto + verbo.
- **Cambios realizados:** separé la explicación del orden y del uso de **if/whether**, indiqué que **if** es más frecuente y añadí ejemplos distintos; reemplacé las repeticiones por actividades variadas que practican inversión, retroceso habitual, sustitución **whether/if**, traducción, ordenación y producción con **whether**.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 10 bloques y 7 IDs únicos; 5 ejercicios cerrados con una respuesta correcta y feedback por opción; campos de ordenar/escribir completos; prompts no repetidos. Contraste con [Cambridge Grammar: reported yes/no questions](https://dictionary.cambridge.org/uk/grammar/british-grammar/reported-speech-indirect-speech), [if or whether](https://dictionary.cambridge.org/us/grammar/british-grammar/if-or-whether), [whether](https://dictionary.cambridge.org/grammar/british-grammar/whether) y [agree](https://dictionary.cambridge.org/dictionary/english-spanish/agree).
- **Resultado de esas pruebas:** correcto; se comprueba tanto la forma como la diferencia entre el orden de una pregunta directa y el de su cláusula indirecta.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `164.json`.
- **Siguiente archivo pendiente:** `165.json`.

### 165/301 — `Idiomas/cursos/en/lessons/165.json`
- **Ruta:** `Idiomas/cursos/en/lessons/165.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco actividades repetían **The guard told us not to open the door**; **warn** figuraba en el vocabulario, pero no se enseñaba ni se practicaba; **permission** aparecía oculto en la ficha sin usarse; faltaba separar con claridad peticiones, instrucciones y advertencias.
- **Cambios realizados:** diferencié **ask + persona + to** para peticiones, **tell + persona + to** para instrucciones y **warn + persona + not to** para advertencias; conservé **not to** para la forma negativa; añadí ejemplos y ejercicios distintos para cada uso y quité **permission** sin contexto.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 9 bloques y 6 IDs únicos; 4 ejercicios cerrados con una respuesta correcta y feedback por opción; campos de ordenar/escribir completos; prompts no repetidos. Contraste con [Cambridge Grammar: tell + persona + infinitivo](https://dictionary.cambridge.org/grammar/british-grammar/say-or-tell), [ask + objeto + infinitivo](https://dictionary.cambridge.org/grammar/british-grammar/ask-and-ask-for), [reported commands](https://dictionary.cambridge.org/grammar/british-grammar/reported-speech-indirect-speech) y [warn](https://dictionary.cambridge.org/dictionary/english-spanish/warn).
- **Resultado de esas pruebas:** correcto; las instrucciones, peticiones y advertencias tienen ejemplos y práctica diferenciados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `165.json`.
- **Siguiente archivo pendiente:** `166.json`.

### 166/301 — `Idiomas/cursos/en/lessons/166.json`
- **Ruta:** `Idiomas/cursos/en/lessons/166.json`; fuente editable: `_herramientas/cursos/en/23.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco actividades repetían la frase **She told us that the room was ready**; aunque el título enumeraba **say, tell, explain, ask**, no se practicaba **ask**; la explicación no aclaraba el orden de **explain + contenido + to + persona** y **report** aparecía como vocabulario sin contextualizar.
- **Cambios realizados:** precisé los patrones de **say** (contenido y **to** para el destinatario), **tell** (persona + contenido), **explain** (contenido + **to** + persona) y **ask** (pregunta o petición); eliminé **report** no usado, añadí fichas para los cuatro verbos y varié las actividades.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 9 bloques y 6 IDs únicos; 4 ejercicios cerrados con una respuesta correcta y feedback por opción; campos de ordenar/escribir completos; prompts no repetidos. Contraste con [Cambridge Grammar: say/tell](https://dictionary.cambridge.org/grammar/british-grammar/word-choice-say-or-tell), [explain](https://dictionary.cambridge.org/grammar/british-grammar/explain), [ask](https://dictionary.cambridge.org/grammar/british-grammar/ask-and-ask-for) y [report](https://dictionary.cambridge.org/dictionary/english-spanish/report).
- **Resultado de esas pruebas:** correcto; los cuatro verbos tienen patrones diferenciados y actividades específicas.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `166.json`.
- **Siguiente archivo pendiente:** `167.json`.

### 167/301 — `Idiomas/cursos/en/lessons/167.json`
- **Ruta:** `Idiomas/cursos/en/lessons/167.json`; fuente editable: `_herramientas/cursos/en/24.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación afirmaba que el tipo 0 expresa siempre hechos sin excepciones y que **when** e **if** son intercambiables; el ejemplo **If you cool water, it freezes** omitía la condición de temperatura; se presentaban como generales resultados no garantizados (una semilla siempre crece); se mezclaban sin marcar el tipo 0, una construcción con **may** y el tipo 1. Había vocabulario huérfano, una actividad tautológica sobre el agua caliente y se pedía **melt** aunque solo aparecía su forma **melts**.
- **Cambios realizados:** limité la regla a su patrón básico y describí hechos y hábitos como generalizaciones sujetas a condiciones; añadí **enough** para acotar el ejemplo de congelación; expliqué con matiz el uso de **if/when** en situaciones repetidas; contrasté explícitamente el tipo 0 con una posibilidad futura del tipo 1; quité las frases irrelevantes y las fichas léxicas sin uso, añadí las formas base **melt/freeze**, y sustituí actividades repetidas o triviales por identificación, traducción, forma verbal y orden de cláusulas.
- **Pruebas o comprobaciones ejecutadas:** compilador real de cursos (`compilar.leer('en','en')`) sin avisos; JSON válido en UTF-8, sin caracteres de reemplazo y en paridad exacta con la fuente; 12 bloques, 8 ejercicios y 6 líneas de diálogo traducidas; IDs únicos; cada ejercicio cerrado tiene exactamente una respuesta correcta y feedback; campos de ordenar y escribir completos; vocabulario y afirmaciones retiradas ya no aparecen. Contraste con [Cambridge Grammar: real conditionals and present + present](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-if), [present simple for general facts](https://dictionary.cambridge.org/grammar/british-grammar/present), y [if or when in repeated/predictable situations](https://dictionary.cambridge.org/grammar/british-grammar/if-or-).
- **Resultado de esas pruebas:** correcto; la lección mantiene el objetivo del condicional cero y distingue la posibilidad futura sin presentar excepciones como errores absolutos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `167.json`.
- **Siguiente archivo pendiente:** `168.json`.

### 168/301 — `Idiomas/cursos/en/lessons/168.json`
- **Ruta:** `Idiomas/cursos/en/lessons/168.json`; fuente editable: `_herramientas/cursos/en/24.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el título hablaba de tener más tiempo pero el diálogo empezaba con más dinero; se equiparaba el segundo condicional con algo definitivamente falso, y se describía el tipo 1 como simplemente posible frente al tipo 2 como imposible; **were** se presentaba como única forma para todas las personas; **Suppose you change your job** no correspondía al patrón imaginado enseñado; **wild beach** era una combinación poco natural; y la nota de **retire** decía que nunca equivale a «retirar», sin limitar el contexto. Además, **pilot**, **lifestyle** y otras fichas no se usaban.
- **Cambios realizados:** alineé título, explicación y diálogo alrededor de situaciones imaginadas; aclaré que el pasado expresa distancia y que la probabilidad depende del punto de vista, no una falsedad garantizada; presenté **If I were you** como expresión convencional de consejo e indiqué que también aparece **was** en otras hipótesis; cambié el diálogo a ejemplos coherentes del tipo 2, usé **quiet beach**, acoté el sentido de **retire** al contexto laboral y eliminé fichas sin uso. Las actividades ahora practican tipo, pasado hipotético, traducción, el consejo con **were**, la forma base tras **would**, comprensión, orden de cláusulas y **would travel**.
- **Pruebas o comprobaciones ejecutadas:** compilador real de cursos (`compilar.leer('en','en')`) sin avisos; JSON válido en UTF-8, sin caracteres de reemplazo y en paridad exacta con la fuente; 13 bloques, 8 ejercicios y 8 líneas de diálogo traducidas; IDs únicos; cada ejercicio cerrado tiene exactamente una respuesta correcta y feedback; campos de ordenar y escribir completos; las fichas léxicas retiradas no aparecen.
- **Fuentes consultadas:** [Cambridge Grammar: second conditional, distancia respecto a la realidad y contraste con el tipo 1](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-if), [Cambridge: uso de “If I were you” para aconsejar](https://dictionary.cambridge.org/dictionary/english/if-i-were-you), [Cambridge Grammar: formas hipotéticas con pasado](https://dictionary.cambridge.org/grammar/british-grammar/past-verb-forms-referring-to-the-present) y [Cambridge Dictionary: sentidos de “retire”](https://dictionary.cambridge.org/dictionary/english/retire).
- **Resultado de esas pruebas:** correcto; la forma y el matiz del segundo condicional quedan diferenciados del tipo 1 sin afirmar que toda hipótesis sea imposible.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `168.json`.
- **Siguiente archivo pendiente:** `169.json`.

### 169/301 — `Idiomas/cursos/en/lessons/169.json`
- **Ruta:** `Idiomas/cursos/en/lessons/169.json`; fuente editable: `_herramientas/cursos/en/24.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** «No comas comida basura si te mareas» no daba un consejo relacionado con el mareo; pedirle al chef una dieta confundía la función de un chef con la de un profesional de nutrición. La guía de **soap** daba una pronunciación similar a **soup** sin explicar la diferencia vocálica; **dizzy** se aproximaba con /s/ en vez de /z/; los falsos amigos **bother** y **delete** no quedaban emparejados ni suficientemente practicados; la actividad final describía **diet** como «estar a dieta» sin la construcción **be on a diet**.
- **Cambios realizados:** cambié el consejo de mareo por sentarse o tumbarse; rehice las frases de salud para mantenerlas naturales y generales; definí los pares **soap/soup**, **chef/boss** y **bother/delete**; afiné las pronunciaciones de **soap**, **soup** y **dizzy**; añadí **sit down**, **lie down**, **worse**, **boss** y **delete** al vocabulario; corregí la explicación de **diet**; y ajusté las actividades para practicar **should**, el imperativo tras **if** y los falsos amigos.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 12 bloques, 8 ejercicios y 8 frases traducidas; IDs únicos; ejercicios cerrados con exactamente una respuesta correcta y feedback; ordenación y respuesta escrita completas; comprobaron vocabulario, transcripción de **dizzy** y ausencia del consejo retirado sobre comida basura.
- **Fuentes consultadas:** [Cambridge Grammar: conditionals and advice with “should”](https://dictionary.cambridge.org/grammar/british-grammar/should), [Cambridge: sentidos de “bother”](https://dictionary.cambridge.org/dictionary/english/bother), [Cambridge: “chef”](https://dictionary.cambridge.org/dictionary/english/chef), [Cambridge: pronunciación de “soap”](https://dictionary.cambridge.org/pronunciation/english/soap), [Cambridge: pronunciación de “dizzy”](https://dictionary.cambridge.org/pronunciation/english/dizzy), [NHS: autocuidado ante el dolor de garganta](https://www.nhs.uk/symptoms/sore-throat/) y [NHS: qué hacer al sentir mareo](https://www.nhs.uk/symptoms/dizziness/).
- **Resultado de esas pruebas:** correcto; gramática, traducciones, vocabulario y consejos de ejemplo son coherentes y la pronunciación de **dizzy** refleja la /z/ sonora.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `169.json`.
- **Siguiente archivo pendiente:** `170.json`.

### 170/301 — `Idiomas/cursos/en/lessons/170.json`
- **Ruta:** `Idiomas/cursos/en/lessons/170.json`; fuente editable: `_herramientas/cursos/en/24.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** **caught** aparecía solo como «cogió/atrapó» aunque es también participio; **found** tenía el mismo problema; las fichas de **would have caught/missed** no reflejaban el sujeto de las traducciones del diálogo; un distractor afirmaba vagamente que «las dos partes están invertidas» pese a contener dos errores diferentes; la actividad de ordenación repetía exactamente la oración principal; y la respuesta libre no indicaba que debía escribirse sin contracción. Faltaba un contraste breve con el segundo condicional.
- **Cambios realizados:** añadí las funciones de pasado y participio de **catch/find**, ajusté las glosas de las frases con **would have**, precisé la regla estándar para la cláusula con **if**, añadí la posibilidad de **could/might have** y comparé los tipos 2 y 3 con ejemplos paralelos; reescribí el distractor para probar reglas separadas, cambié la ordenación para invertir el orden de las cláusulas y especifiqué la respuesta larga sin contracción.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON válido en UTF-8, sin caracteres de reemplazo y en paridad exacta con la fuente; 11 bloques, 7 ejercicios y 4 líneas de diálogo traducidas; IDs únicos; cada ejercicio cerrado tiene una respuesta correcta y feedback; ejercicios de ordenación/escritura con sus campos completos; vocabulario de **catch/caught** y comparación tipológica verificados.
- **Fuentes consultadas:** [Cambridge Grammar: forma y uso del tercer condicional, incluido el contraste con el pasado que ocurrió](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-if), [Cambridge Grammar: auxiliares y formas modales en las cláusulas condicionales](https://dictionary.cambridge.org/grammar/british-grammar/conditional-sentences) y [Cambridge Grammar: posición de “would have” en el patrón estándar](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-typical-errors).
- **Resultado de esas pruebas:** correcto; el patrón estándar, sus participios y la diferencia con el tipo 2 quedan practicados sin afirmar que el pasado simple tenga siempre sentido pasado en condicionales.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `170.json`.
- **Siguiente archivo pendiente:** `171.json`.

### 171/301 — `Idiomas/cursos/en/lessons/171.json`
- **Ruta:** `Idiomas/cursos/en/lessons/171.json`; fuente editable: `_herramientas/cursos/en/24.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cuatro actividades reutilizaban casi literalmente **If we lived closer, we would visit more often**; una ficha de vocabulario estaba vacía y las palabras del bloque estaban ocultas; faltaban un contexto de lectura, práctica de la pregunta con **would** y variedad en el orden de las cláusulas.
- **Cambios realizados:** convertí el ejemplo en una conversación breve sobre visitar a una hermana que vive lejos; amplié la explicación para cubrir el matiz de probabilidad, las dos posiciones de la condición y las preguntas con **would**; hice visibles ocho términos pertinentes; y diversifiqué seis ejercicios para comprobar forma condicional, verbo base, frecuencia, comprensión, orden y producción escrita.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON válido en UTF-8, sin caracteres de reemplazo y en paridad exacta con la fuente; 10 bloques, 6 ejercicios, 6 líneas de diálogo traducidas y 8 fichas léxicas visibles; IDs únicos; ejercicios cerrados con exactamente una respuesta correcta y feedback; campos de ordenación y escritura completos.
- **Fuentes consultadas:** [Cambridge Grammar: probabilidad relativa del primer y segundo condicional](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-if), [Cambridge Dictionary: “nearby”](https://dictionary.cambridge.org/dictionary/english/nearby), [“often”](https://dictionary.cambridge.org/dictionary/english/often) y [“close/closer”](https://dictionary.cambridge.org/dictionary/english/close).
- **Resultado de esas pruebas:** correcto; la explicación contextualiza el tipo 2 y las actividades ya no repiten el mismo hueco.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `171.json`.
- **Siguiente archivo pendiente:** `172.json`.

### 172/301 — `Idiomas/cursos/en/lessons/172.json`
- **Ruta:** `Idiomas/cursos/en/lessons/172.json`; fuente editable: `_herramientas/cursos/en/24.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cuatro actividades repetían la misma oración sobre mirar un mapa y tomar el camino equivocado; el vocabulario de **map** permanecía oculto, aunque la lección lo preguntaba; solo aparecía **would have**, sin practicar **could/might have**; faltaba un contexto narrativo y una prueba de comprensión; **miss** no diferenciaba no asistir a un evento de otros sentidos.
- **Cambios realizados:** creé una conversación corta sobre perder una visita al museo, una carretera cerrada y rutas alternativas; expliqué **would/could/might have + participio**, la cláusula con **if** y el orden de las cláusulas; hice visibles 11 términos de viaje y pasado; cambié las seis actividades para cubrir lectura, past perfect, el sentido contextual de **miss**, traducción, orden y producción con **could have**.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON válido en UTF-8, sin caracteres de reemplazo y en paridad exacta con la fuente; 10 bloques, 6 ejercicios variados, 6 líneas de diálogo traducidas y 11 fichas visibles; IDs únicos; cada pregunta cerrada tiene exactamente una opción correcta y feedback; campos de ordenar y escribir completos.
- **Fuentes consultadas:** [Cambridge Grammar: forma y uso del tercer condicional](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-if), [Cambridge: “could have”](https://dictionary.cambridge.org/grammar/british-grammar/could%3A), [Cambridge Dictionary: “miss”](https://dictionary.cambridge.org/dictionary/english/miss) y [“route”](https://dictionary.cambridge.org/dictionary/english/route).
- **Resultado de esas pruebas:** correcto; el contexto ahora enseña las variaciones modales del resultado y las practica sin repetir seis veces la misma frase.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `172.json`.
- **Siguiente archivo pendiente:** `173.json`.

### 173/301 — `Idiomas/cursos/en/lessons/173.json`
- **Ruta:** `Idiomas/cursos/en/lessons/173.json`; fuente editable: `_herramientas/cursos/en/24.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la temperatura de ebullición de 100 °C se presentaba sin indicar la presión atmosférica; cinco de seis actividades repetían la misma frase; aunque el título prometía comparar los condicionales cero y primero, no había un ejemplo ni una práctica del primero; varias formas del ejemplo (**boil/boils/reaches**) estaban ocultas en el vocabulario.
- **Cambios realizados:** añadí la condición de presión atmosférica normal al dato científico; expliqué por separado el uso general del tipo 0 y la posibilidad concreta futura del tipo 1, con un diálogo de experimento; hice visibles 13 fichas sobre temperatura, presión y calentamiento; varié seis actividades para practicar el hecho general, el resultado futuro, vocabulario, traducción, orden de cláusulas y producción de una predicción.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 10 bloques, 6 ejercicios y 6 líneas traducidas; 13 términos visibles; IDs únicos; ejercicios cerrados con exactamente una respuesta correcta y feedback; campos de ordenación/escritura completos; ejemplo de 100 °C comprobado contra la presión indicada.
- **Fuentes consultadas:** [Cambridge Grammar: presente simple para hechos generales](https://dictionary.cambridge.org/grammar/british-grammar/present-simple), [Cambridge Grammar: estructura y uso de condicionales](https://dictionary.cambridge.org/grammar/british-grammar/conditional-sentences) y [NIST: punto de ebullición normal del agua, 100 °C a 101,325 kPa (1 atm)](https://nvlpubs.nist.gov/nistpubs/Legacy/IR/nbsir85-3133.pdf).
- **Resultado de esas pruebas:** correcto; el contraste entre regla general y predicción específica queda representado y practicado, y el ejemplo físico declara la condición de presión.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `173.json`.
- **Siguiente archivo pendiente:** `174.json`.

### 174/301 — `Idiomas/cursos/en/lessons/174.json`
- **Ruta:** `Idiomas/cursos/en/lessons/174.json`; fuente editable: `_herramientas/cursos/en/24.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco actividades repetían la misma frase sobre terminar un proyecto; **as long as** se explicaba solo como condición, aunque también expresa duración; **deadline**, **expected** y los conectores no se practicaban en contextos distintos; no se aclaraba que, en referencias futuras, se usa presente después de estos conectores.
- **Cambios realizados:** diferencié **even if** (el resultado se mantiene pese a la condición) de **as long as** como requisito, añadí su sentido de duración y precisé el presente en cláusulas referidas al futuro; reemplacé las frases repetidas por una conversación sobre un proyecto y seis prácticas distintas que comprueban ambos sentidos de **as long as**, **even if**, vocabulario, orden y producción.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 10 bloques, 6 ejercicios diferentes, 6 líneas de diálogo traducidas y 9 términos visibles; IDs únicos; respuestas y feedback completos; ejercicios de ordenar/escribir con sus campos.
- **Fuentes consultadas:** [Cambridge Grammar: “even if” para una condición inesperada](https://dictionary.cambridge.org/grammar/british-grammar/comparatives-and-), [“as long as” como condición](https://dictionary.cambridge.org/uk/grammar/british-grammar/conditionals-other), [“as long as” como duración](https://dictionary.cambridge.org/uk/grammar/british-grammar/as-long-) y [presente en cláusulas futuras introducidas por conjunciones](https://dictionary.cambridge.org/grammar/british-grammar/conjunctions-time).
- **Resultado de esas pruebas:** correcto; el alumno practica las dos conjunciones y los dos sentidos de **as long as** sin confundirlos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `174.json`.
- **Siguiente archivo pendiente:** `175.json`.

### 175/301 — `Idiomas/cursos/en/lessons/175.json`
- **Ruta:** `Idiomas/cursos/en/lessons/175.json`; fuente editable: `_herramientas/cursos/en/25.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación de **by** presentaba su omisión como si implicara que no se menciona al agente; varios ejemplos y ejercicios se desviaban de la pasiva con modales y contenían formulaciones poco naturales (**The garden is forbidden**) o poco relacionadas (**The trip was delayed**); una pregunta no contextualizaba si **can** expresaba posibilidad o permiso; una explicación de respuesta daba una razón incorrecta.
- **Cambios realizados:** precisé la estructura **modal + be + participio**, los matices de **can**, **must**, **should** y **mustn't**, y cuándo se omite o se incluye el agente con **by**; sustituí las frases desconectadas por un diálogo coherente de visita a un taller; revisé traducciones, vocabulario y feedback de los ejercicios para que practiquen formas y usos variados de la pasiva modal.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 12 bloques, 8 ejercicios, 12 términos léxicos y 8 líneas de diálogo; IDs únicos; cada ejercicio de opciones tiene una sola respuesta correcta; respuestas y campos estructurales presentes.
- **Fuentes consultadas:** [Cambridge Grammar: formas de la voz pasiva, incluida la forma con modales](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms), [Cambridge Grammar: pasiva con y sin agente](https://dictionary.cambridge.org/grammar/british-grammar/passives-with-and-without-an-agent), [Cambridge Grammar: usos de *can*](https://dictionary.cambridge.org/grammar/british-grammar/can-), [Cambridge Grammar: significados de los modales, incluida la recomendación con *should*](https://dictionary.cambridge.org/grammar/british-grammar/modality-meanings-and-uses).
- **Resultado de esas pruebas:** correcto; la explicación y las actividades se centran en la forma, el sentido modal y la elección del agente sin afirmar que el **by-phrase** sea obligatorio.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `175.json`.
- **Siguiente archivo pendiente:** `176.json`.

### 176/301 — `Idiomas/cursos/en/lessons/176.json`
- **Ruta:** `Idiomas/cursos/en/lessons/176.json`; fuente editable: `_herramientas/cursos/en/25.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la regla generalizaba el orden de todas las preguntas pasivas y no contemplaba preguntas cuyo **who** es el sujeto; se mezclaban pasado y participio de **steal** sin mostrar el paradigma completo; el diálogo original saltaba entre cartera, bolso, seguro y banco sin contexto claro; la entrada **credit** estaba incompleta para el significado pretendido y varias fichas léxicas no se practicaban.
- **Cambios realizados:** precisé el orden en preguntas de sí/no y con palabras interrogativas, añadí la excepción de **who** como sujeto y señalé la alternativa formal con **by whom**; mostré **keep–kept–kept** y **steal–stole–stolen**; reescribí el diálogo como denuncia coherente de una cartera perdida/robada y completé **credit card** como unidad léxica; mejoré traducciones y feedback para no confundir pasado simple con participio.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 12 bloques, 8 ejercicios, 12 fichas léxicas y 10 líneas traducidas de diálogo; IDs únicos; una respuesta correcta en cada ejercicio con opciones; campos de ejercicios estructurales presentes.
- **Fuentes consultadas:** [Cambridge Grammar: preguntas e inversión auxiliar–sujeto](https://dictionary.cambridge.org/grammar/british-grammar/questions), [Cambridge Grammar: preguntas con *wh-* y preposición final](https://dictionary.cambridge.org/grammar/british-grammar/wh-questions), [Cambridge Grammar: *by* como agente en la pasiva](https://dictionary.cambridge.org/grammar/british-grammar/by), [Cambridge Dictionary: paradigmas *steal–stole–stolen*](https://dictionary.cambridge.org/dictionary/english/steal).
- **Resultado de esas pruebas:** correcto; la lección distingue las preguntas pasivas habituales de las preguntas cuyo interrogativo es sujeto, y las respuestas breves mantienen el auxiliar y la concordancia.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `176.json`.
- **Siguiente archivo pendiente:** `177.json`.

### 177/301 — `Idiomas/cursos/en/lessons/177.json`
- **Ruta:** `Idiomas/cursos/en/lessons/177.json`; fuente editable: `_herramientas/cursos/en/25.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** se etiquetaba **factory** como falso amigo y se afirmaba erróneamente que **factoría** significaba una empresa de finca; la explicación de **quarter** omitía el sentido de «una cuarta parte» y presentaba «cuarto de hora» como si fuera un significado aislado; el texto usaba **by a machine** para nombrar una herramienta, aunque se enseña **with** para el instrumento; **delivery**, **ingredient** y **container** no aparecían en el texto, y la visita saltaba sin conexión entre fábrica, barrio y agente inmobiliario.
- **Cambios realizados:** distinguí los dos falsos amigos reales (**quarter**, **estate agent**) de **factory**, cuya traducción normal es «fábrica» y cuyo cognado **factoría** también es válido; añadí sentidos contextuales de **quarter** y la variante estadounidense **real estate agent**; corregí el contraste entre **by + agente** y **with + instrumento**; reescribí la lectura como una visita coherente al lugar de trabajo de Maya e incorporé el vocabulario de producción a la lectura y los ejercicios.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 12 bloques, 8 ejercicios, 12 fichas léxicas y 9 líneas de lectura traducidas; IDs únicos; una respuesta correcta en cada ejercicio con opciones.
- **Fuentes consultadas:** [RAE-ASALE, DLE: *factoría*](https://dle.rae.es/factor%C3%ADa), [Cambridge Dictionary: *factory*](https://dictionary.cambridge.org/dictionary/english/factory), [Cambridge Dictionary: *quarter*](https://dictionary.cambridge.org/dictionary/english/quarter), [Cambridge Dictionary: *estate agent*](https://dictionary.cambridge.org/dictionary/english/estate-agent), [Cambridge Grammar: agente y herramienta en la voz pasiva](https://dictionary.cambridge.org/grammar/british-grammar/passives-with-and-without-an-agent).
- **Resultado de esas pruebas:** correcto; se eliminaron afirmaciones léxicas incorrectas y el nuevo texto practica las palabras de fábrica con ejemplos pasivos claros.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `177.json`.
- **Siguiente archivo pendiente:** `178.json`.

### 178/301 — `Idiomas/cursos/en/lessons/178.json`
- **Ruta:** `Idiomas/cursos/en/lessons/178.json`; fuente editable: `_herramientas/cursos/en/25.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección repetía **All visitors must be registered at reception** en casi todas las actividades, sin diálogo ni práctica contextual; **registered** se traducía como «registrarse» aunque la ficha presenta el participio; el significado de **mustn't** frente a **doesn't have to** no se distinguía; la ficha oculta **all** daba una traducción incorrecta («todo el personal»).
- **Cambios realizados:** conservé la pasiva modal, pero convertí la lección en una conversación breve de recepción y laboratorio; añadí práctica variada de posibilidad (**can be downloaded**), obligación (**must be registered**), recomendación (**should be worn**), prohibición (**mustn't be taken**) y falta de necesidad (**doesn't have to be printed**); aclaré el contraste entre prohibición y opcionalidad; corregí el significado de **registered**, pronunciaciones aproximadas y el vocabulario visible.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 12 bloques, 8 ejercicios variados, 12 fichas léxicas y 8 líneas de diálogo; IDs únicos; una respuesta correcta en cada ejercicio con opciones.
- **Fuentes consultadas:** [Cambridge Grammar: formas de la pasiva, incluidas las pasivas con modales](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms), [Cambridge Grammar: *mustn't* (prohibición) frente a *don't have to* (no es necesario)](https://dictionary.cambridge.org/grammar/british-grammar/must), [Cambridge Grammar: *should* para consejo y recomendación](https://dictionary.cambridge.org/grammar/british-grammar/should), [Cambridge Dictionary: pronunciación de *laboratory*](https://dictionary.cambridge.org/pronunciation/english/laboratory).
- **Resultado de esas pruebas:** correcto; la lección ahora añade un contraste de significado útil y ejercicios distintos, sin repetir la misma frase una y otra vez.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `178.json`.
- **Siguiente archivo pendiente:** `179.json`.

### 179/301 — `Idiomas/cursos/en/lessons/179.json`
- **Ruta:** `Idiomas/cursos/en/lessons/179.json`; fuente editable: `_herramientas/cursos/en/25.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco de las seis actividades repetían la misma frase del puente; las opciones **by/for/with** no se explicaban por su función, y **for** podía ser gramatical en la frase sin contexto; **designed** aparecía traducido como el infinitivo «diseñar»; **design** no diferenciaba verbo y sustantivo; la traducción asignaba sin contexto género femenino a **engineer**.
- **Cambios realizados:** convertí la lección en una explicación de cuándo nombrar u omitir al agente; contrasté **by + agente**, **for + beneficiario** y **with + material/herramienta** con contexto; reemplacé la frase única por una lectura breve sobre el proyecto del puente y ocho ejercicios variados; corregí las fichas de **engineer**, **design** y **designed**.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 12 bloques, 8 ejercicios, 5 fichas léxicas y 5 líneas de lectura traducidas; IDs únicos; una respuesta correcta en cada ejercicio con opciones.
- **Fuentes consultadas:** [Cambridge Grammar: foco pasivo y agente opcional](https://dictionary.cambridge.org/grammar/british-grammar/passive-voice), [Cambridge Grammar: *by* para el agente y *with* para el instrumento](https://dictionary.cambridge.org/grammar/british-grammar/passives), [Cambridge Grammar: *for* para la persona que recibe algo](https://dictionary.cambridge.org/grammar/british-grammar/for).
- **Resultado de esas pruebas:** correcto; las preposiciones se practican según el papel que expresan y la lección ya no fuerza una única lectura de **for** fuera de contexto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `179.json`.
- **Siguiente archivo pendiente:** `180.json`.

### 180/301 — `Idiomas/cursos/en/lessons/180.json`
- **Ruta:** `Idiomas/cursos/en/lessons/180.json`; fuente editable: `_herramientas/cursos/en/25.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco de las seis actividades repetían **When were the results published?**; la lección no contenía un texto o diálogo donde practicar sus preguntas; **package** pertenecía a un ejemplo aislado de entrega, sin conexión con la publicación de resultados; no se trabajaban respuestas breves ni concordancia del pronombre, y el título no describía con precisión el contenido.
- **Cambios realizados:** centré la lección en preguntas sobre un informe publicado; añadí una conversación breve y coherente con preguntas sí/no, **when/where**, consulta por el agente y respuestas cortas singulares y plurales; aclaré el orden **be + sujeto**, el **by** final usual y la variante formal **by whom**; reemplacé **package** por vocabulario de informes, resultados, publicación y entrega; diversifiqué las ocho actividades.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, sin caracteres de reemplazo y en paridad exacta con la fuente; 12 bloques, 8 ejercicios, 10 fichas léxicas y 8 líneas traducidas de diálogo; IDs únicos; una respuesta correcta en cada ejercicio con opciones.
- **Fuentes consultadas:** [Cambridge Grammar: orden de palabras en preguntas](https://dictionary.cambridge.org/us/grammar/british-grammar/questions-typical-errors), [Cambridge Grammar: posición final de preposiciones y registro en preguntas *wh-*](https://dictionary.cambridge.org/grammar/british-grammar/wh-questions), [Cambridge Grammar: foco y omisión del agente en la pasiva](https://dictionary.cambridge.org/grammar/british-grammar/passive-uses), [Cambridge Dictionary: significado de *publish*](https://dictionary.cambridge.org/dictionary/english/publish).
- **Resultado de esas pruebas:** correcto; el alumno practica las preguntas con formas singulares y plurales, respuestas breves y preguntas por agente en contexto de publicación.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `180.json`.
- **Siguiente archivo pendiente:** `181.json`.

### 181/301 — `Idiomas/cursos/en/lessons/181.json`
- **Ruta:** `Idiomas/cursos/en/lessons/181.json`; fuente editable: `_herramientas/cursos/en/26.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación afirmaba que no existía ninguna regla lógica y presentaba listas absolutas; decía que *prefer -ing* era la forma más habitual; equiparaba demasiado los matices de *like/prefer* y no distinguía el infinitivo de la preposición en *look forward to*. El diálogo tenía frases poco naturales o aisladas, la traducción de *I enjoy swimming* no coincidía con su análisis y se repetía ese ejemplo en varios ejercicios. El ejercicio con *agreed* admitía otra lectura temporal.
- **Cambios realizados:** expliqué patrones frecuentes con sus matices y límites; aclaré *like/love/hate/prefer*, el uso de *would prefer*, *start* con ambas formas y la preposición *to*; reescribí el diálogo como una planificación de viaje breve, con traducciones y análisis alineados; sustituí actividades repetidas o ambiguas por ejercicios distintos y con una sola respuesta posible. Sincronicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 12 términos de vocabulario usados en el diálogo; 10 líneas de diálogo con traducción y análisis; 8 ejercicios con IDs únicos, opciones con una sola respuesta correcta y solución escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: patrones de verbo + infinitivo o -ing](https://dictionary.cambridge.org/uk/grammar/british-grammar/verb-patterns-verb-infinitive-or-verb-ing), [Cambridge Grammar: *hate, like, love and prefer*](https://dictionary.cambridge.org/grammar/british-grammar/hate-like-love-and-prefer), [Cambridge Grammar: *prefer*](https://dictionary.cambridge.org/grammar/british-grammar/prefer-would-prefer), [Cambridge Grammar: complementos de preposición](https://dictionary.cambridge.org/de/grammatik/british-grammar/prepositions-and-particles).
- **Resultado de esas pruebas:** correcto; las actividades practican formas -ing, infinitivo con *to*, verbos con ambas formas y comprensión/traducción en un contexto conectado.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `181.json`.
- **Siguiente archivo pendiente:** `182.json`.

### 182/301 — `Idiomas/cursos/en/lessons/182.json`
- **Ruta:** `Idiomas/cursos/en/lessons/182.json`; fuente editable: `_herramientas/cursos/en/26.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** una entrada léxica repetía *expect* en lugar de enseñar el lema; varios términos del vocabulario no aparecían en contexto; la lista y las actividades no desarrollaban algunos patrones clave del título. El ejercicio de audio daba prioridad a comprensión oral, que queda fuera del foco principal de esta revisión.
- **Cambios realizados:** reorganicé el vocabulario y escribí un diálogo de fiesta que contextualiza los 12 términos; expliqué con ejemplos el patrón **verbo + persona + to + forma base**, la diferencia entre *tell me that* y *tell me to*, y las excepciones de *allow*, *let* y *help*; varié las ocho actividades e incorporé práctica de *want, encourage, order, expect* y *persuade*. Alineé traducciones y análisis, y sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 12 palabras, 10 líneas dialogadas traducidas y analizadas; 8 ejercicios con IDs únicos, una respuesta correcta en cada actividad con opciones y respuesta escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: patrones de verbo + persona + infinitivo](https://dictionary.cambridge.org/us/grammar/british-grammar/infinitive-verbs), [Cambridge Grammar: infinitivos con y sin *to*](https://dictionary.cambridge.org/grammar/british-grammar/infinitives-with-and-without-to).
- **Resultado de esas pruebas:** correcto; las formas con *to* y sin *to* están diferenciadas y se practican en ejemplos afirmativos, preguntas, traducción y producción breve.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `182.json`.
- **Siguiente archivo pendiente:** `183.json`.

### 183/301 — `Idiomas/cursos/en/lessons/183.json`
- **Ruta:** `Idiomas/cursos/en/lessons/183.json`; fuente editable: `_herramientas/cursos/en/26.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** se afirmaba que *get something done* era exactamente lo mismo que *have something done*; una traducción («pintamos la casa») podía sugerir que el alumno hacía el trabajo; *I had it done* estaba traducido de forma reflexiva; la traducción de pantalones «me los haré limpiar» era poco natural; la nota de *pants* no explicaba el uso estadounidense. Había vocabulario de servicios sin contexto y un término ajeno al tema (*lawyer*).
- **Cambios realizados:** limité la regla al encargo de trabajos y precisé que **get + objeto + participio** es una alternativa normalmente más informal; alineé los ejemplos con el sentido causativo; rehice el texto para integrar peluquería, taller, revisión del coche, neumático, cita, dentista y limpieza de ropa; expliqué los sentidos británico y estadounidense de *pants*; sustituí *lawyer* por *garage* y mejoré el castellano de las traducciones. Fuente editable y JSON compilado sincronizados.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 13 términos léxicos; texto de 9 líneas con traducción y análisis; 8 ejercicios con IDs únicos, una respuesta correcta en cada actividad con opciones y respuesta escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: *have something done*](https://dictionary.cambridge.org/grammar/british-grammar/have-something-done), [Cambridge Dictionary: *get* causativo](https://dictionary.cambridge.org/dictionary/english/get), [Cambridge Dictionary: sentidos británico y estadounidense de *pants*](https://dictionary.cambridge.org/dictionary/english/pants), [Cambridge Dictionary: *garage*](https://dictionary.cambridge.org/dictionary/english/garage).
- **Resultado de esas pruebas:** correcto; las formas muestran quién realiza el trabajo, y las traducciones y ejercicios preservan el sentido causativo.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `183.json`.
- **Siguiente archivo pendiente:** `184.json`.

### 184/301 — `Idiomas/cursos/en/lessons/184.json`
- **Ruta:** `Idiomas/cursos/en/lessons/184.json`; fuente editable: `_herramientas/cursos/en/26.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cuatro de las seis actividades repetían literalmente la misma frase; la explicación apenas anunciaba que existían patrones, no los aclaraba ni los contrastaba; dos términos centrales (*avoid*, *decide*) estaban ocultos en el vocabulario y no había texto para practicar comprensión escrita.
- **Cambios realizados:** presenté de forma breve **avoid/finish + -ing** y **decide/hope + to + forma base**; mostré las tres palabras clave; añadí un texto de lectura corto con traducción y análisis; sustituí las repeticiones por ocho ejercicios diversos de lectura, vocabulario, formas verbales, traducción, orden y producción breve. Fuente editable y JSON compilado sincronizados.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 3 líneas de lectura con traducción y análisis; 8 actividades con IDs únicos, una respuesta correcta en cada actividad con opciones y solución escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: patrones de verbo + infinitivo o -ing](https://dictionary.cambridge.org/us/grammar/british-grammar/infinitive-verbs).
- **Resultado de esas pruebas:** correcto; los dos patrones se presentan en contexto y se practican con frases distintas, incluida comprensión escrita.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `184.json`.
- **Siguiente archivo pendiente:** `185.json`.

### 185/301 — `Idiomas/cursos/en/lessons/185.json`
- **Ruta:** `Idiomas/cursos/en/lessons/185.json`; fuente editable: `_herramientas/cursos/en/26.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cuatro actividades repetían una única oración; la regla era vaga y no aclaraba la posición de la persona antes de **to**; *invite*, *encouraged* y *questions* estaban incluidos como lemas, aunque dos eran formas flexionadas y solo se mostraban dos términos en el vocabulario. Faltaba practicar comprensión escrita.
- **Cambios realizados:** expliqué **verbo + persona + to + forma base** con *ask, tell, invite, encourage* y *want*; dejé como vocabulario los tres lemas útiles; añadí una lectura breve sobre un club de ciencias y ocho ejercicios distintos de comprensión, gramática, traducción, orden y producción escrita. Alineé traducciones y análisis, y sincronicé la fuente editable con el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 3 líneas de lectura traducidas y analizadas; 8 actividades con IDs únicos, una respuesta correcta en cada actividad con opciones y solución escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: patrones con objeto directo + infinitivo con *to*](https://dictionary.cambridge.org/us/grammar/british-grammar/infinitive-verbs).
- **Resultado de esas pruebas:** correcto; la persona aparece antes de **to + forma base** en lectura y ejercicios, con varias frases y sujetos.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `185.json`.
- **Siguiente archivo pendiente:** `186.json`.

### 186/301 — `Idiomas/cursos/en/lessons/186.json`
- **Ruta:** `Idiomas/cursos/en/lessons/186.json`; fuente editable: `_herramientas/cursos/en/26.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco de las seis actividades repetían literalmente la misma frase; aunque el título cubría *let, make* y *help*, casi toda la práctica se limitaba a *let*. Solo había una palabra visible en el vocabulario, con otras entradas ocultas en forma plural, y faltaba comprensión escrita.
- **Cambios realizados:** precisé el sentido de cada verbo y sus patrones en voz activa; aclaré que *help* admite las dos formas; sustituí vocabulario flexionado/repetido por ocho lemas útiles; añadí una lectura breve en el museo y ejercicios variados para comprensión, formas verbales, vocabulario, traducción, orden y escritura. Sincronicé la fuente editable con el JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 8 términos léxicos; 3 líneas de lectura traducidas y analizadas; 8 actividades con IDs únicos, una respuesta correcta en cada actividad con opciones y solución escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: infinitivos con y sin *to*](https://dictionary.cambridge.org/grammar/british-grammar/infinitives-with-and-without-to), [Cambridge Grammar: patrones con objeto + infinitivo](https://dictionary.cambridge.org/us/grammar/british-grammar/infinitive-verbs).
- **Resultado de esas pruebas:** correcto; la lectura y las actividades distinguen permiso (*let*), causa (*make*) y ayuda (*help*) sin repetir una sola frase.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `186.json`.
- **Siguiente archivo pendiente:** `187.json`.

### 187/301 — `Idiomas/cursos/en/lessons/187.json`
- **Ruta:** `Idiomas/cursos/en/lessons/187.json`; fuente editable: `_herramientas/cursos/en/27.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la pregunta decía *fit the door* en vez de *fit through the door* y su traducción no coincidía; **not big enough to fit** carecía de contexto; *This box is not strong enough to carry* atribuía al objeto la acción de cargar; el diálogo no explicaba quién realizaba la acción en **too + adjetivo + to**; *lift* estaba rotulado como falso amigo sin distinguir sustantivo y verbo; una actividad era solo de audio, y parte del diálogo era poco natural.
- **Cambios realizados:** aclaré **too + adjetivo + to**, la variante con **for + persona**, **adjetivo + enough + to** y la comparación **as...as**; reescribí el diálogo para que la mudanza fuera coherente y las frases tradujeran el sentido; precisé *lift* en inglés británico y cambié el ejercicio de audio por lectura de vocabulario.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 12 palabras; 9 intervenciones con traducción y análisis; 9 actividades con IDs únicos, una respuesta correcta en cada actividad con opciones y solución escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: *too* y *enough*](https://dictionary.cambridge.org/grammar/british-grammar/too-enough), [Cambridge Grammar: posición de *enough* tras el adjetivo](https://dictionary.cambridge.org/grammar/british-grammar/adjective-phrases-position), [Cambridge Grammar: comparaciones *as...as*](https://dictionary.cambridge.org/grammar/british-grammar/as-as), [Cambridge Dictionary: ejemplo *too heavy for me to carry*](https://dictionary.cambridge.org/dictionary/english/carry).
- **Resultado de esas pruebas:** correcto; las explicaciones y actividades distinguen exceso, suficiencia y comparación, con el sujeto de la acción indicado cuando hace falta.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `187.json`.
- **Siguiente archivo pendiente:** `188.json`.

### 188/301 — `Idiomas/cursos/en/lessons/188.json`
- **Ruta:** `Idiomas/cursos/en/lessons/188.json`; fuente editable: `_herramientas/cursos/en/27.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la introducción afirmaba que el orden de adjetivos era fijo, contradiciendo la explicación; faltaban categorías del orden habitual. La sección decía que los compuestos se escriben con guion, aunque **brand new** y **handmade** también se escriben separados o juntos. Parte del vocabulario de materiales estaba poco contextualizada y una actividad era solo de audio.
- **Cambios realizados:** precisé el orden habitual y lo presenté como guía flexible; distinguí compuestos con guion, abiertos y cerrados, con variantes documentadas; rehice el diálogo para contextualizar los materiales y los términos; sustituí el audio por comprensión escrita y alineé los ejemplos, traducciones y análisis.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 12 palabras; 7 líneas de diálogo con traducción y análisis; 8 actividades con IDs únicos, una respuesta correcta en cada actividad con opciones y solución escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: orden de los adjetivos](https://dictionary.cambridge.org/grammar/british-grammar/order-adjectives), [Cambridge Dictionary: *handmade* y *hand-made*](https://dictionary.cambridge.org/dictionary/english/handmade), [Cambridge Dictionary: *brand new*](https://dictionary.cambridge.org/dictionary/english/brand-new).
- **Resultado de esas pruebas:** correcto; el orden aparece como tendencia con matices y los compuestos ya no se presentan como si todos siguieran una sola regla ortográfica.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `188.json`.
- **Siguiente archivo pendiente:** `189.json`.

### 189/301 — `Idiomas/cursos/en/lessons/189.json`
- **Ruta:** `Idiomas/cursos/en/lessons/189.json`; fuente editable: `_herramientas/cursos/en/27.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la introducción decía que los adverbios tienen un lugar fijo; la regla de **-ly** era demasiado absoluta; no se explicaba la expresión del título **hardly ever**; el contraste *hard/hardly* y *fluent/fluid* estaba presentado como traducciones sueltas, sin contexto. La actividad escrita solo aceptaba *rarely*, aunque su propia explicación admitía *seldom* como otra respuesta válida, y una actividad era únicamente de audio.
- **Cambios realizados:** precisé las posiciones habituales de los adverbios; aclaré que **hard** es el adverbio de esfuerzo y **hardly** significa «apenas», y contextualicé **fluent/fluid**; incorporé *hardly ever* con su orden y sentido; hice visibles *fluently* y *hard*, eliminé la forma flexionada *speaks* como entrada léxica y cambié el ejercicio escrito por una respuesta única (*hardly ever* para «casi nunca»). Añadí un texto de lectura y sustituí la actividad de audio por comprensión escrita.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 13 términos léxicos; 4 líneas de lectura con traducción y análisis; 8 actividades con IDs únicos, una respuesta correcta en cada actividad con opciones y respuesta escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: posición de los adverbios](https://dictionary.cambridge.org/grammar/british-grammar/adverbs-and-adverb-phrases-position), [Cambridge Grammar: *hardly ever, rarely, scarcely, seldom*](https://dictionary.cambridge.org/uk/grammar/british-grammar/hardly-ever-), [Cambridge Grammar: diferencia entre *hard* y *hardly*](https://dictionary.cambridge.org/grammar/british-grammar/word-choice-hardly-or-hard), [Cambridge Dictionary: *fluent* y *fluid*](https://dictionary.cambridge.org/dictionary/english/fluent).
- **Resultado de esas pruebas:** correcto; las formas aparecen en contexto y las actividades tienen una solución no ambigua.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `189.json`.
- **Siguiente archivo pendiente:** `190.json`.

### 190/301 — `Idiomas/cursos/en/lessons/190.json`
- **Ruta:** `Idiomas/cursos/en/lessons/190.json`; fuente editable: `_herramientas/cursos/en/27.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación contenía **clear enough clear**, una frase mal formada que se repetía en la explicación, traducción, ordenar y producción escrita. Las seis actividades giraban en torno a esa misma frase; **carefully** y **extremely** estaban ocultos del vocabulario y no había texto de lectura.
- **Cambios realizados:** rehice la lección para distinguir adverbios de modo e intensificadores; aclaré **quite**, **extremely**, **too** frente a **very**, y **enough** después del adjetivo; incorporé una lectura breve sobre instrucciones en pantalla y ocho ejercicios diferentes de comprensión, vocabulario, completar, traducción, ordenar y escritura. Hice visibles las palabras clave y sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real (`compilar.leer('en','en')`) sin avisos; JSON UTF-8 válido, vuelta de lectura correcta y sin caracteres de reemplazo; 8 términos léxicos; 4 líneas de lectura traducidas y analizadas; 8 actividades con IDs únicos, una respuesta correcta en cada actividad con opciones y solución escrita presente.
- **Fuentes consultadas:** [Cambridge Grammar: adjetivos y adverbios](https://dictionary.cambridge.org/grammar/british-grammar/adjectives-and-adverbs), [Cambridge Grammar: intensificadores](https://dictionary.cambridge.org/grammar/british-grammar/intensifiers-very-at-all), [Cambridge Grammar: *too* y *enough*](https://dictionary.cambridge.org/grammar/british-grammar/too-enough), [Cambridge Grammar: orden de *enough*](https://dictionary.cambridge.org/grammar/british-grammar/word-order-enough).
- **Resultado de esas pruebas:** correcto; los ejemplos son gramaticales y las actividades practican cada patrón con soluciones no ambiguas.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `190.json`.
- **Siguiente archivo pendiente:** `191.json`.


### 191/301 — `Idiomas/cursos/en/lessons/191.json`
- **Ruta:** `Idiomas/cursos/en/lessons/191.json`; fuente editable: `_herramientas/cursos/en/27.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación solo presentaba dos ejemplos aislados y no daba contexto para interpretar prefijos; seis ejercicios repetían la misma frase, el vocabulario añadía palabras incidentales como `accounts` y `give`, y la traducción de `inconsistent` como «contradictorio» era demasiado tajante para dos fechas que simplemente no coinciden. Faltaba una lectura breve para comprobar el sentido en contexto.
- **Cambios realizados:** expliqué con cautela los prefijos `un-`, `in-` y `dis-` mediante familias `clear/unclear`, `complete/incomplete` y `agree/disagree`, aclarando que no se elige el prefijo por intuición. Añadí un texto breve de lectura sobre discrepancias en un formulario, con traducción y análisis, revisé el glosario y varié las ocho actividades para que midan comprensión, significado y uso. Sincronicé la fuente editable y el JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura correcta; 8 actividades con IDs únicos, una respuesta correcta en cada actividad de opción múltiple y solución escrita; las 4 líneas de lectura tienen traducción y análisis; 9 entradas léxicas; JSON UTF-8 válido y fuente recompilada sin avisos.
- **Fuentes consultadas:** [Cambridge Grammar: prefijos](https://dictionary.cambridge.org/grammar/british-grammar/prefixes), [Cambridge Dictionary: *inconsistent*](https://dictionary.cambridge.org/dictionary/english/inconsistent).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `192.json`.


### 192/301 — `Idiomas/cursos/en/lessons/192.json`
- **Ruta:** `Idiomas/cursos/en/lessons/192.json`; fuente editable: `_herramientas/cursos/en/27.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el objetivo combinaba orden de adverbios y adjetivos, pero no practicaba el orden de adjetivos; seis actividades se apoyaban en una misma oración y el vocabulario `accurate` no aparecía en el ejemplo. No había una lectura contextualizada.
- **Cambios realizados:** separé en explicaciones breves la posición habitual de adverbios de frecuencia y modo y la secuencia de adjetivos antes del nombre; añadí una lectura corta con traducción y análisis, vocabulario usado y ocho ejercicios distintos. Conservé la secuencia como pauta habitual, no como regla absoluta; sincronicé JSON y fuente.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura correcta; 8 actividades con IDs únicos, una solución correcta en cada pregunta de opción múltiple y respuesta escrita; las 4 líneas de lectura tienen traducción y análisis; 10 entradas léxicas usadas; revisión de espacios finales y marcadores de conflicto en fuente y JSON sin incidencias.
- **Fuentes consultadas:** [Cambridge Grammar: orden de adjetivos](https://dictionary.cambridge.org/grammar/british-grammar/order-adjectives), [Cambridge Grammar: posición de adverbios](https://dictionary.cambridge.org/uk/grammar/british-grammar/adverbs-and-adverb-phrases).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `193.json`.


### 193/301 — `Idiomas/cursos/en/lessons/193.json`
- **Ruta:** `Idiomas/cursos/en/lessons/193.json`; fuente editable: `_herramientas/cursos/en/28.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la regla de presente sin *will* después de conectores se presentaba sin limitarla a cláusulas temporales futuras, por lo que podía confundirse con preguntas indirectas; *during* se etiquetaba erróneamente como «falso amigo»; el diálogo saltaba entre situaciones inconexas y tenía una actividad de escucha sin práctica de lectura contextualizada. Además, el glosario incluía *wake* sin uso y escondía *arrive*, necesario para el objetivo.
- **Cambios realizados:** acoté la regla a cláusulas temporales sobre el futuro, añadí el contraste con una pregunta indirecta y aclaré los patrones **while + sujeto/verbo**, **meanwhile** como adverbio y **during + nombre/grupo nominal**. Sustituí el diálogo por una lectura breve y coherente de viaje que presenta todos los conectores en contexto; revisé el vocabulario y varié las ocho actividades. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura correcta; 8 actividades con IDs únicos y soluciones completas, una respuesta correcta por pregunta de opción múltiple; 8 líneas de lectura con traducción y análisis; revisión de espacios finales y marcadores de conflicto en fuente y JSON sin incidencias.
- **Fuentes consultadas:** [Cambridge Grammar: conectores temporales](https://dictionary.cambridge.org/uk/grammar/british-grammar/conjunctions-time), [Cambridge Grammar: *during*](https://dictionary.cambridge.org/grammar/british-grammar/during), [Cambridge Grammar: *while*](https://dictionary.cambridge.org/grammar/british-grammar/while-and-whilst), [Cambridge Grammar: *when*](https://dictionary.cambridge.org/grammar/british-grammar/when).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `194.json`.


### 194/301 — `Idiomas/cursos/en/lessons/194.json`
- **Ruta:** `Idiomas/cursos/en/lessons/194.json`; fuente editable: `_herramientas/cursos/en/28.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** *although* y *whereas* se agrupaban como si tuvieran el mismo uso y registro que *but*; se decía que *to* «solo sirve con un verbo», sin limitarlo al patrón de finalidad; la regla **such + a/an + adjective + noun** no distinguía el nombre contable singular; el diálogo mezclaba situaciones de viaje sin continuidad y usaba frases poco naturales como «The reason was the effort». Varios términos del glosario no tenían función en la lección.
- **Cambios realizados:** precisé los patrones de contraste, propósito (**to/in order to + infinitivo**, **so that + cláusula**) y resultado (**so + adjetivo/adverbio**, **such + grupo nominal**); aclaré que *although* no se combina con *but* en esa estructura y que *whereas* expresa contraste. Reemplacé el diálogo por una lectura breve coherente, añadí práctica separada para los patrones y ajusté título y vocabulario.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura correcta; 9 actividades con IDs únicos, soluciones escritas y una respuesta correcta por pregunta de opción múltiple; 7 líneas de lectura con traducción y análisis; revisión de espacios finales y marcadores de conflicto en fuente y JSON sin incidencias; título y JSON sincronizados.
- **Fuentes consultadas:** [Cambridge Grammar: contraste](https://dictionary.cambridge.org/us/grammar/british-grammar/conjunctions-contrasting), [Cambridge Grammar: *in order to*](https://dictionary.cambridge.org/uk/grammar/british-grammar/in-order-to), [Cambridge Grammar: *so that* y propósito](https://dictionary.cambridge.org/grammar/british-grammar/so-that...), [Cambridge Grammar: *so* y *such*](https://dictionary.cambridge.org/uk/grammar/british-grammar/such-or-so).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `195.json`.


### 195/301 — `Idiomas/cursos/en/lessons/195.json`
- **Ruta:** `Idiomas/cursos/en/lessons/195.json`; fuente editable: `_herramientas/cursos/en/28.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la regla de concordancia de *neither…nor* se formulaba como si siempre dependiera del segundo elemento, sin acotar los casos; faltaba distinguir **either…or** de **either** al final de una frase negativa y explicar que en **so/neither + auxiliar + sujeto** se repite el auxiliar adecuado. El diálogo original era una lista de frases sin hablantes identificados; *sensitive* aparecía en una combinación poco natural (*route is sensitive to the weather*); *grocery* se daba sin la diferencia entre el sustantivo singular de tienda y **groceries** (alimentos); y *decent* se agrupaba entre los falsos amigos aunque no lo es. La traducción de *timing* y varios ejemplos de comida/viaje carecían de contexto.
- **Cambios realizados:** precisé los patrones correlativos y la concordancia con sujetos cercanos de distinto número; expliqué respuestas afirmativas/negativas con **do** y **be** y el uso final de **either**. Aclaré *sensitive/sensible*, *grocery/groceries* y el matiz de *decent*. Reemplacé frases inconexas por un diálogo breve y coherente de viaje y cena, ajusté el vocabulario y preparé nueve ejercicios variados.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura correcta; 9 actividades con IDs únicos y respuesta correcta única por pregunta de opción múltiple; 11 líneas de diálogo, todas traducidas y analizadas; 15 entradas léxicas; revisión de espacios finales y marcadores de conflicto en fuente y JSON sin incidencias.
- **Fuentes consultadas:** [Cambridge Grammar: *neither*, *neither…nor* y *not…either*](https://dictionary.cambridge.org/grammar/british-grammar/neither-neither-nor-and-not-either_2), [Cambridge Grammar: *either*](https://dictionary.cambridge.org/grammar/british-grammar/either), [Lund University: concordancia con sujetos unidos por *either/or* y *neither/nor*](https://www.awelu.lu.se/language/common-problems-old/subject-verb-agreement/connected-singular-and-plural-noun-phrases/), [Cambridge Dictionary: *sensitive* y *sensible*](https://dictionary.cambridge.org/dictionary/english/sensitive), [Cambridge Dictionary: *grocery* y *groceries*](https://dictionary.cambridge.org/dictionary/english/grocery), [Cambridge Dictionary: *timing* y *decent*](https://dictionary.cambridge.org/dictionary/english/timing).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `196.json`.


### 196/301 — `Idiomas/cursos/en/lessons/196.json`
- **Ruta:** `Idiomas/cursos/en/lessons/196.json`; fuente editable: `_herramientas/cursos/en/28.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis actividades repetían el mismo ejemplo con *so*; *therefore* y *however* se agrupaban con conjunciones como si aceptaran la misma estructura y puntuación, pese a que funcionan como conectores adverbiales; faltaba una lectura que contrastara causa, resultado y concesión, y *since* no se distinguía de su uso temporal.
- **Cambios realizados:** separé las estructuras **because/since**, **so**, **therefore**, **although** y **however**; aclaré puntuación y la diferencia entre cláusula subordinada, conjunción coordinante y conector adverbial. Añadí una lectura breve de un viaje con desvío, glosario útil y nueve ejercicios variados, incluida la detección de un uso incorrecto de coma entre cláusulas independientes. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura correcta; 9 actividades con IDs únicos y solución única en cada pregunta de opción múltiple; 6 líneas de lectura traducidas y analizadas; revisión de espacios finales y marcadores de conflicto en fuente y JSON sin incidencias.
- **Fuentes consultadas:** [Cambridge Grammar: causas, razones y resultados](https://dictionary.cambridge.org/grammar/british-grammar/conjunctions-causes-reasons-results-and-purpose), [Cambridge Grammar: *because* y *since*](https://dictionary.cambridge.org/grammar/british-grammar/because), [Cambridge Grammar: *since*](https://dictionary.cambridge.org/grammar/british-grammar/since), [Cambridge Grammar: conjunciones](https://dictionary.cambridge.org/grammar/british-grammar/coordinating-conjunctions), [Cambridge Grammar: *although*](https://dictionary.cambridge.org/grammar/british-grammar/although), [Cambridge Grammar: puntuación](https://dictionary.cambridge.org/grammar/british-grammar/d).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `197.json`.


### 197/301 — `Idiomas/cursos/en/lessons/197.json`
- **Ruta:** `Idiomas/cursos/en/lessons/197.json`; fuente editable: `_herramientas/cursos/en/28.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** las actividades repetían el mismo patrón y practicaban preguntas indirectas con palabras interrogativas, pero no cubrían preguntas de sí/no con **if/whether**. La puntuación entre pregunta cortés y afirmación con cláusula indirecta requería aclaración. El vocabulario de *entrance* no estaba integrado y faltaba una lectura contextual; la consigna abierta en español admitía tanto *if* como *whether*, aunque el validador solo aceptaba una forma.
- **Cambios realizados:** expliqué el orden sujeto-verbo en cláusulas indirectas con palabra interrogativa y con **if/whether**, y aclaré el signo final según la oración principal. Añadí un texto breve en recepción de un centro de conferencias, traducción y análisis línea por línea, cuatro fichas léxicas y ocho ejercicios de comprensión, selección, huecos, traducción, orden y producción. Restringí la consigna final explícitamente a **whether** para que coincida con la única respuesta aceptada. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON parseado y vuelta de lectura válida; 8 ejercicios con IDs únicos y una respuesta correcta por test; 8 líneas de lectura con traducción y análisis; 4 entradas de vocabulario; fuente/JSON UTF-8 sin caracteres de reemplazo ni espacios finales.
- **Fuentes consultadas:** [Cambridge Grammar: preguntas indirectas](https://dictionary.cambridge.org/grammar/british-grammar/indirect-questions), [Cambridge Grammar: *if* o *whether*](https://dictionary.cambridge.org/us/grammar/british-grammar/if-or-whether), [Cambridge Grammar: estilo indirecto](https://dictionary.cambridge.org/grammar/british-grammar/reported-speech-indirect-speech), [Cambridge Grammar: *how* en preguntas indirectas](https://dictionary.cambridge.org/grammar/british-grammar/how).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `198.json`.


### 198/301 — `Idiomas/cursos/en/lessons/198.json`
- **Ruta:** `Idiomas/cursos/en/lessons/198.json`; fuente editable: `_herramientas/cursos/en/28.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis ejercicios reutilizaban una sola frase y la regla solo mencionaba **be** sin explicar la selección del auxiliar con presente/pasado simple ni los modales. El texto no distinguía la polaridad con **never/nobody** ni la forma habitual **aren't I?**; vocabulario y práctica estaban desconectados del uso.
- **Cambios realizados:** aclaré la inversión habitual de polaridad, el uso del auxiliar/modal existente y el apoyo de **do/does/did** cuando falta uno; añadí el matiz de **never/nobody**, **aren't I?** e intención inferida por entonación. Sustituí la frase repetida por una lectura contextual con **be**, modal, presente y pasado simple; añadí seis fichas léxicas y diez ejercicios variados de comprensión, forma, significado, orden y producción. Ajusté la pregunta de comprensión para que describiera con precisión que las luces aún no estaban encendidas. Sincronicé JSON y fuente.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 parseado y vuelto a leer; 10 ejercicios con IDs únicos y una clave correcta por test; 8 líneas de lectura con traducción y análisis; 6 entradas léxicas; revisión de espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *question tags*](https://dictionary.cambridge.org/grammar/british-grammar/question-tags), [British Council: *Question tags*](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/question-tags), [Cambridge Grammar: uso de *do* en *question tags*](https://dictionary.cambridge.org/grammar/british-grammar/do).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `199.json`.


### 199/301 — `Idiomas/cursos/en/lessons/199.json`
- **Ruta:** `Idiomas/cursos/en/lessons/199.json`; fuente editable: `_herramientas/cursos/en/29.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** **ought to** se describía como un consejo «fuerte» pese a que el contraste fiable con **should** es principalmente de registro y frecuencia. La comparación de **didn't have to** con **mustn't** no distinguía el tiempo, y no enseñaba una forma clara de prohibición pasada. **Policy** estaba rotulado como falso amigo y se decía que no podía significar «política», aunque ese sentido es correcto para planes oficiales de gobiernos o empresas. El diálogo juntaba frases inconexas y ocho ejercicios apenas comprobaban los mismos ejemplos.
- **Cambios realizados:** precisé que **ought to** expresa recomendación, es más formal y menos frecuente que **should**; separé obligación pasada (**had to**), ausencia de necesidad (**didn't have to**) y prohibición (**mustn't** en reglas vigentes; **wasn't/weren't allowed to** para una prohibición pasada; **couldn't** según contexto). Corregí el contraste de **policy/politics** y su traducción según contexto. Reemplacé el diálogo por una lectura de jornada laboral y tareas domésticas; organicé nueve palabras útiles y diez actividades distintas con comprensión, estructura, significado y producción. Sincronicé JSON y fuente.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; diez ejercicios con IDs únicos y una respuesta correcta por test; ocho líneas de lectura con traducción/análisis; nueve entradas léxicas; comprobación de espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *ought to*](https://dictionary.cambridge.org/grammar/british-grammar/ought-to), [Cambridge Grammar: *must* y obligación/prohibición](https://dictionary.cambridge.org/grammar/british-grammar/must), [Cambridge Grammar: *have to*](https://dictionary.cambridge.org/grammar/british-grammar/have-got-to), [Cambridge Dictionary: *policy*](https://dictionary.cambridge.org/dictionary/english/policy), [Cambridge Dictionary: *politics*](https://dictionary.cambridge.org/dictionary/english/politics).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `200.json`.


### 200/301 — `Idiomas/cursos/en/lessons/200.json`
- **Ruta:** `Idiomas/cursos/en/lessons/200.json`; fuente editable: `_herramientas/cursos/en/29.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo del examen mezclaba lluvia y capacidad con frases poco naturales o confusas (**It might be unlikely**, **Your skill is good**, **I'll succeed in helping you**). **Be able to** se describía como más formal y se oponía a **could** de forma demasiado general: faltaba separar capacidad habitual pasada de un logro concreto completado. **Certificate** aparecía como falso amigo, aunque significa «certificado»; lo que significa «certeza» es **certainty**. La mayoría de ejercicios no practicaba con contexto la distinción entre posibilidad y capacidad.
- **Cambios realizados:** acoté **may/might/could + forma base**, evité atribuirles porcentajes fijos y expliqué **likely/unlikely + to**, **chance of + sustantivo/-ing** y **be able to**. Separé capacidad general pasada (**could**) de logro concreto afirmativo (**was/were able to**), sin presentar **be able to** como sustituto simplemente más formal de **can**. Corregí la nota léxica **certificate/certainty** y reemplacé el diálogo inconexo por una lectura coherente sobre una prueba de socorrismo, con las nueve líneas traducidas y analizadas. Añadí diez entradas pertinentes y nueve ejercicios variados. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; nueve actividades con IDs únicos y una respuesta correcta por test; nueve líneas de lectura completas; diez entradas léxicas; comprobación de espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *may, might and could*](https://dictionary.cambridge.org/grammar/british-grammar/may-might-and-could), [Cambridge Grammar: *be able to* y logros pasados](https://dictionary.cambridge.org/us/grammar/british-grammar/be-expressions-be-able-to-be-due-to), [Cambridge Grammar: *could*](https://dictionary.cambridge.org/grammar/british-grammar/could), [Cambridge Grammar: *might*](https://dictionary.cambridge.org/grammar/british-grammar/might), [Cambridge Dictionary: *certainty*](https://dictionary.cambridge.org/dictionary/english/certainty).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `201.json`.


### 201/301 — `Idiomas/cursos/en/lessons/201.json`
- **Ruta:** `Idiomas/cursos/en/lessons/201.json`; fuente editable: `_herramientas/cursos/en/29.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el texto era una lista de frases sin continuidad; **My career is in food** y **Your skill is good** eran formulaciones poco naturales; se presentaban **career** e **income** como falsos amigos absolutos aunque «carrera profesional» y «ingresos» son traducciones válidas según el contexto. La explicación de **qualification/degree** no distinguía bien los términos; **income** se equiparaba a sueldo y su ejemplo repetía conceptos; la frase sobre que un conservante «es seguro» afirmaba una conclusión sin contexto. La mayoría de las doce palabras apenas se practicaba.
- **Cambios realizados:** aclaré **career/job/race**, el término específico **degree** frente a **qualification** (más amplio), el auténtico falso amigo **preservative/preservativo = condom**, el sentido contextual de **income** frente a **deposit**, y las colocaciones **apply for a job/vacancy**, **have a vacancy for** y **promote someone to a role**. Reemplacé la lista por una lectura coherente sobre una candidata a un puesto en la industria alimentaria; naturalicé ejemplos y traducciones, y añadí diez ejercicios de comprensión y práctica léxica. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 parseado y vuelto a leer; diez ejercicios con IDs únicos y una respuesta correcta por test; nueve líneas de lectura traducidas y analizadas; doce entradas léxicas; revisión de espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Dictionary: *career*](https://dictionary.cambridge.org/dictionary/english/career), [Cambridge Dictionary: *preservative*](https://dictionary.cambridge.org/dictionary/english/preservative), [Cambridge Dictionary: *qualification*](https://dictionary.cambridge.org/dictionary/english/qualification), [Cambridge Dictionary: *degree in something*](https://dictionary.cambridge.org/dictionary/english/degree-in), [Cambridge Dictionary: *apply for a job*](https://dictionary.cambridge.org/dictionary/english/apply-for-a-job), [Cambridge Dictionary: *vacancy*](https://dictionary.cambridge.org/dictionary/english/vacancy), [Cambridge Dictionary: *contract*](https://dictionary.cambridge.org/dictionary/english/contract), [Cambridge Dictionary: *promote*](https://dictionary.cambridge.org/dictionary/english/promote), [Cambridge Dictionary: *income*](https://dictionary.cambridge.org/us/dictionary/english/income).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `202.json`.


### 202/301 — `Idiomas/cursos/en/lessons/202.json`
- **Ruta:** `Idiomas/cursos/en/lessons/202.json`; fuente editable: `_herramientas/cursos/en/29.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el título giraba en torno a una llave que no aparecía en el diálogo; las preguntas de la llave estaban desconectadas del ejemplo principal. Las luces encendidas por sí solas no justificaban una deducción tan fuerte; la puerta abierta tampoco demostraba que Anna estuviera dentro. La práctica repetía un hogar vacío sin enlazar de manera consistente las pistas con **must/can't/might**.
- **Cambios realizados:** centré la lección en una búsqueda coherente de una llave y en deducciones basadas en pruebas concretas: se oyen voces, Tom está lejos, el coche de Anna está fuera, una llave no encaja y la otra abre la puerta. Aclaré que **must** expresa una conclusión afirmativa muy probable, **can't** una deducción negativa (no prohibición) y **might/may/could** una posibilidad, sin asignar porcentajes fijos. Ajusté el título, el vocabulario contextual y ocho actividades variadas; todas las líneas del diálogo tienen traducción y análisis. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; ocho actividades con IDs únicos y una respuesta correcta por test; ocho líneas de diálogo completas; ocho entradas léxicas; revisión de espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *must* para deducciones y *can't* como deducción negativa](https://dictionary.cambridge.org/grammar/british-grammar/must), [Cambridge Grammar: *may, might and could*](https://dictionary.cambridge.org/grammar/british-grammar/may-might-and-could), [Cambridge Grammar: *could* y la posibilidad presente/futura](https://dictionary.cambridge.org/grammar/british-grammar/could).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `203.json`.


### 203/301 — `Idiomas/cursos/en/lessons/203.json`
- **Ruta:** `Idiomas/cursos/en/lessons/203.json`; fuente editable: `_herramientas/cursos/en/29.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis ejercicios repetían **The lights are off and the house is empty. They can't be at home**, haciendo que la práctica no contrastara los tres modales. La casa «vacía» hacía circular la deducción; la lección se solapaba casi por completo con la 202 y no distinguía con claridad **can't** deductivo de **mustn't** prohibitivo.
- **Cambios realizados:** convertí la lección en práctica de contraste con un contexto breve de biblioteca: pistas que apoyan **must**, una ubicación posible con **might**, una inferencia negativa con **can't** y un cartel de acceso restringido con **mustn't**. Añadí la estructura modal + verbo base, precisé que los modales expresan grados de certeza según el contexto y separé conclusión de prohibición. Reemplacé los ejercicios duplicados por nueve actividades distintas. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; nueve actividades con IDs únicos y una respuesta correcta por test; siete líneas de diálogo traducidas y analizadas; nueve entradas léxicas; revisión de espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [British Council: deducciones con modales en presente](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-present), [Cambridge Grammar: *must* y deducciones negativas con *can't*](https://dictionary.cambridge.org/grammar/british-grammar/must), [Cambridge Grammar: *may, might and could*](https://dictionary.cambridge.org/grammar/british-grammar/may-might-and-could).
- **Resultado:** correcto tras los cambios.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `204.json`.

### 204/301 — `Idiomas/cursos/en/lessons/204.json`
- **Ruta:** `Idiomas/cursos/en/lessons/204.json`; fuente editable: `_herramientas/cursos/en/29.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección se titulaba «distinguir prohibición, opción y obligación pasada», confundiendo «no es obligatorio» con «es una opción». La explicación y casi todos los ejercicios se concentraban en la misma frase con **didn't have to**; apenas se practicaba la prohibición con **mustn't** ni la obligación pasada afirmativa **had to**. También faltaba explicar que **didn't have to** indica ausencia de necesidad, pero no determina por sí solo si la acción ocurrió.
- **Cambios realizados:** aclaré el contraste entre prohibición (**mustn't**), falta de necesidad presente (**don't/doesn't have to**) y obligación/no necesidad pasadas (**had to / didn't have to**); añadí la forma verbal base y el contraste **didn't have**, no **didn't had**. Reemplacé la práctica repetida por un texto breve de cuatro frases con traducción y análisis, más ocho ejercicios variados de regla, lectura, traducción, orden y producción. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; ocho actividades con IDs únicos; cada ejercicio de opción/hueco/traducción tiene una respuesta correcta y una explicación por opción; seis entradas de vocabulario; cuatro frases traducidas y analizadas; comprobación de separadores malformados, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *must*, prohibición y ausencia de obligación](https://dictionary.cambridge.org/grammar/british-grammar/must), [Cambridge Grammar: *have to* y *had to*](https://dictionary.cambridge.org/grammar/british-grammar/have-got-to), [British Council: permiso y obligación](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-permission-obligation).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `205.json`.

### 205/301 — `Idiomas/cursos/en/lessons/205.json`
- **Ruta:** `Idiomas/cursos/en/lessons/205.json`; fuente editable: `_herramientas/cursos/en/29.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis ejercicios giraban en torno al mismo logro pasado con **was able to**; la regla mencionaba **could** para habilidad general pasada, pero no daba una situación para practicarla. Tampoco se contrastaba con claridad la capacidad futura **will be able to**.
- **Cambios realizados:** expliqué y ejemplifiqué **can** para capacidad presente, **could** para capacidad general pasada, **was/were able to** o **managed to** para un logro afirmativo concreto pasado, y **will be able to** para el futuro; añadí las variantes negativas pasadas **couldn't / wasn't able to**. Incorporé una lectura breve de cinco líneas y nueve actividades variadas. Sincronicé fuente y JSON; quité una aproximación de pronunciación poco fiable para *injury*.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; nueve actividades con IDs únicos; una respuesta correcta y explicación por opción; cinco palabras de vocabulario; frases de lectura traducidas y análisis gramatical asociado a las tres estructuras centrales; comprobación de separadores malformados, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *could* y los logros pasados](https://dictionary.cambridge.org/grammar/british-grammar/could), [Cambridge Grammar: *be able to* y los logros pasados](https://dictionary.cambridge.org/uk/grammar/british-grammar/be-expressions-be-), [Cambridge Grammar: *can, could or may*](https://dictionary.cambridge.org/grammar/british-grammar/can-could).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `206.json`.

### 206/301 — `Idiomas/cursos/en/lessons/206.json`
- **Ruta:** `Idiomas/cursos/en/lessons/206.json`; fuente editable: `_herramientas/cursos/en/30.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la regla afirmaba que cualquier pronombre objeto va entre el verbo y la partícula, pero la lección incluía expresiones inseparables **look after**, **look for** y **run out of**; con ellas, el objeto permanece después de la preposición. El diálogo titulado «Cuidar la casa» saltaba sin contexto entre el perro, una luz, un tren, leche y un coche averiado. El título español también reducía todo a verbo + partícula pese a incluir combinaciones con preposición.
- **Cambios realizados:** precisé el alcance de la regla para verbos separables (**turn on/put on**) y añadí las formas correctas **look after it / look for it / run out of it**. Ajusté el título y la explicación para abarcar verbos de varias palabras con partículas y preposiciones. Reemplacé el diálogo inconexo por una lectura de ocho líneas sobre Tom cuidando al perro, con traducciones y análisis de los usos; pulí el ejercicio de orden. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; ocho actividades con IDs únicos y una respuesta correcta por pregunta cerrada; doce entradas léxicas; ocho líneas de lectura traducidas y analizadas; comprobación de la regla separable/inseparable, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: verbos de varias palabras y posición del objeto](https://dictionary.cambridge.org/us/grammar/british-grammar/phrasal-verbs-and-multi-word-verbs), [British Council: phrasal verbs separables e inseparables](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/phrasal-verbs), [British Council: orden de pronombres con verbos frasales](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/word-order-phrasal-verbs).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `207.json`.

### 207/301 — `Idiomas/cursos/en/lessons/207.json`
- **Ruta:** `Idiomas/cursos/en/lessons/207.json`; fuente editable: `_herramientas/cursos/en/30.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la introducción generalizaba que la preposición de un verbo «no cambia según el sentido», pese a que varios verbos admiten otras combinaciones. La explicación presentaba **hear** como algo involuntario y **listen to** como intencional sin matizar que ambos pueden describir el mismo sonido según el enfoque. El diálogo «Quedamos» alternaba entre temas sin una situación común. La actividad de escucha basada en **hear** también pedía distinguirlo de una traducción española que puede solaparse semánticamente.
- **Cambios realizados:** matizé que la preposición forma parte del patrón del significado concreto, pero que algunos verbos admiten otras combinaciones; aclaré **hear** frente a **listen to** y el uso de **to** con objeto. Convertí el diálogo en una planificación coherente de una excursión; añadí un ejercicio breve de comprensión, cambié una traducción ambigua por una pregunta de uso correcto y precisé **dream of + -ing** y **apologise for + -ing**. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; ocho actividades con IDs únicos y una respuesta correcta y explicación por opción; doce términos léxicos; nueve intervenciones traducidas y analizadas; prompts revisados para descartar separadores de campo malformados, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: patrones de verbos y preposiciones](https://dictionary.cambridge.org/grammar/british-grammar/verbs-multi-word-verbs), [Cambridge Grammar: *hear or listen to?*](https://dictionary.cambridge.org/grammar/british-grammar/hear-or-listen-to), [Cambridge Grammar: *depend on*](https://dictionary.cambridge.org/grammar/british-grammar/word-patterns-depend-on-something), [Cambridge Grammar: uso de *listen to*](https://dictionary.cambridge.org/grammar/british-grammar/word-patterns-listen).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `208.json`.

### 208/301 — `Idiomas/cursos/en/lessons/208.json`
- **Ruta:** `Idiomas/cursos/en/lessons/208.json`; fuente editable: `_herramientas/cursos/en/30.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el falso amigo se presentaba como absoluto: **introduce** no siempre significa «presentar»; también puede equivaler a «introducir/implantar» un sistema, norma o método. La lectura mezclaba registro de hotel y montar una tienda de campaña, trabajo sin relación con el viaje y frases sin continuidad. **Break in** aparecía como ficha aislada sin ejemplo ni práctica.
- **Cambios realizados:** precisé los sentidos de **introduce** según su objeto y distinguí **insert**; reescribí la lectura como excursión coherente con campamento, formulario, seguridad y transporte, usando las combinaciones en contexto; eliminé la ficha suelta **break in** y mantuve **go on** con un ejemplo natural. Añadí una pregunta de comprensión, actualicé la traducción de texto largo y la respuesta de **cheer up**. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; ocho actividades con IDs únicos y una respuesta correcta por pregunta cerrada; doce términos léxicos; nueve líneas traducidas y analizadas; comprobación de que la ficha ya no afirma que **introduce** nunca signifique «introducir», además de espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Dictionary: sentidos de *introduce*](https://dictionary.cambridge.org/dictionary/english/introduce), [Cambridge Dictionary: *check in*](https://dictionary.cambridge.org/dictionary/english/check-in-check-into?topic=tourism-and-holidays), [Cambridge Grammar: verbos de varias palabras](https://dictionary.cambridge.org/grammar/british-grammar/verbs-multi-word-verbs).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `209.json`.

### 209/301 — `Idiomas/cursos/en/lessons/209.json`
- **Ruta:** `Idiomas/cursos/en/lessons/209.json`; fuente editable: `_herramientas/cursos/en/30.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco de seis ejercicios repetían **Please pick them up after the meeting**; solo se practicaba **pick up** y no se contrastaba realmente con el ejemplo inseparable **look after**. El bloque «Palabras clave» estaba vacío porque todas las fichas se marcaban ocultas. Una pregunta sobre **them** no especificaba antecedente.
- **Cambios realizados:** distinguí expresamente verbos frasales separables de verbos preposicionales inseparables y precisé la colocación con nombres y pronombres: **pick the tickets up / pick them up**, frente a **look after the cat / look after it**. Añadí una lectura breve sobre recados de Maya y ocho actividades variadas de forma, contraste, traducción, orden, producción y comprensión. Hice visible **pick up** en el vocabulario y ajusté las preguntas para incluir antecedentes inequívocos. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; ocho actividades con IDs únicos y una respuesta correcta por pregunta cerrada; bloque de vocabulario no vacío; seis frases traducidas, análisis de los patrones principales; comprobación de antecedente de pronombres, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: verbos frasales, preposicionales y objetos](https://dictionary.cambridge.org/grammar/british-grammar/verbs-multi-word-verbs), [British Council: verbos de varias palabras separables e inseparables](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/phrasal-verbs), [British Council: orden de los pronombres](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/word-order-phrasal-verbs).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `210.json`.

### 210/301 — `Idiomas/cursos/en/lessons/210.json`
- **Ruta:** `Idiomas/cursos/en/lessons/210.json`; fuente editable: `_herramientas/cursos/en/30.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis ejercicios repetían **The final date depends on the venue**, de modo que la lección anunciaba tres combinaciones (**depend on**, **belong to**, **apologise for**) pero prácticamente solo enseñaba la primera. Se solapaba con la 207 y no aportaba contexto para las otras dos.
- **Cambios realizados:** convertí la lección en práctica breve de los tres patrones; aclaré **apologise to + persona for + motivo/forma -ing**. Añadí una lectura coherente sobre elegir fecha y recinto para un concierto, cuatro fichas visibles y nueve ejercicios variados con comprensión, vocabulario, huecos, traducción, orden y producción. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; nueve actividades con IDs únicos y una respuesta correcta y explicación por opción; cuatro términos léxicos; cinco líneas traducidas y análisis de los tres patrones; revisión de espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *depend on*](https://dictionary.cambridge.org/grammar/british-grammar/word-patterns-depend-on-something), [Cambridge Dictionary: *apologise for*](https://dictionary.cambridge.org/dictionary/english/apologize), [Cambridge Dictionary: *belong to*](https://dictionary.cambridge.org/dictionary/english/belong-to).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `211.json`.

### 211/301 — `Idiomas/cursos/en/lessons/211.json`
- **Ruta:** `Idiomas/cursos/en/lessons/211.json`; fuente editable: `_herramientas/cursos/en/30.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis de siete ejercicios practicaban **make a decision** con la misma oración, mientras que **take a break** y **heavy traffic** aparecían solo en una lista sin contexto ni ejercicios. Por ello, el objetivo de aprender tres colocaciones no se cumplía.
- **Cambios realizados:** expliqué colocaciones de forma sencilla y di contexto común a las tres expresiones mediante un viaje: decidir una ruta, ver tráfico intenso y descansar mientras esperan el tren. Reemplacé la práctica repetida con ocho ejercicios distintos que trabajan cada combinación y comprenden el texto. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y vuelta de lectura; ocho actividades con IDs únicos y una respuesta correcta y explicación por opción; las tres colocaciones aparecen en lectura y ejercicios; cinco líneas traducidas, análisis de las expresiones objetivo y revisión de espacios finales/caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: colocaciones](https://dictionary.cambridge.org/grammar/british-grammar/collocation), [Cambridge Dictionary: *make a decision*](https://dictionary.cambridge.org/dictionary/english/make-a-decision), [Cambridge Dictionary: *take a break*](https://dictionary.cambridge.org/dictionary/english/take-a-break), [Cambridge Dictionary: *heavy traffic*](https://dictionary.cambridge.org/dictionary/english/heavy-traffic).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `212.json`.

### 212/301 — `Idiomas/cursos/en/lessons/212.json`

- **Ruta:** `Idiomas/cursos/en/lessons/212.json`; fuente editable: `_herramientas/cursos/en/30.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** `by 12 June` estaba traducido como «antes del 12 de junio», que podía excluir el día límite. La palabra objetivo `deadline` no se usaba en el aviso y la mayoría de ejercicios repetían la primera frase; además, la explicación mencionaba recomendaciones que el aviso no contenía.
- **Cambios realizados:** reescribí el aviso en cuatro líneas breves para incluir `deadline`, la obligación (`must` + verbo base), el alcance, la duración y el canal de ayuda. Precisé que `by` con una fecha significa «a más tardar» e hice visible el vocabulario clave. Sustituí la repetición por nueve actividades variadas de comprensión, vocabulario, forma modal, fecha límite, traducción y orden de frase. Sincronicé la fuente y el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido; nueve actividades con IDs únicos; una opción correcta y explicaciones en todas las opciones cerradas; cuatro líneas de lectura traducidas; revisión de los objetivos, traducción del plazo, sincronía fuente/JSON, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *must*](https://dictionary.cambridge.org/grammar/british-grammar/must), [Cambridge Grammar: *by* y los plazos](https://dictionary.cambridge.org/grammar/british-grammar/by), [Cambridge Dictionary: *staff*](https://dictionary.cambridge.org/dictionary/english/staff), [Cambridge Dictionary: *accessible*](https://dictionary.cambridge.org/dictionary/english/accessible).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `213.json`.

### 213/301 — `Idiomas/cursos/en/lessons/213.json`

- **Ruta:** `Idiomas/cursos/en/lessons/213.json`; fuente editable: `_herramientas/cursos/en/31.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la diferencia entre el presente continuo, *be going to* y el presente simple para horarios se formulaba de forma demasiado tajante o vaga; además, se añadía *was going to* sin practicarlo, aunque la lección siguiente lo trabaja. El diálogo mezclaba una pregunta sobre viajar a España con una respuesta que no contestaba claramente y contenía vocabulario que no aparecía en contexto. La práctica apenas comprobaba las distinciones explicadas.
- **Cambios realizados:** centré la lección en planes ya organizados, intenciones con *be going to* y horarios fijos con presente simple, indicando que los usos pueden solaparse. Dejé *was going to* para la lección dedicada que sigue. Reescribí el diálogo como un viaje coherente, contextualicé las siete palabras retenidas y añadí diez actividades variadas de comprensión, gramática, vocabulario, traducción y orden. Actualicé la traducción al español y sincronicé la fuente con el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido; diez actividades con IDs únicos y solución explicada para cada opción cerrada; ocho intervenciones con traducción y análisis; cada palabra aparece en contexto; cobertura de los tres contrastes de futuro; comprobación de límites de la sección para preservar `214.json`, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: presente continuo para planes y acuerdos](https://dictionary.cambridge.org/uk/grammar/british-grammar/present-continuous-), [Cambridge Grammar: *be going to* y planes](https://dictionary.cambridge.org/grammar/british-grammar/will-or-be-going-to), [Cambridge Grammar: presente simple para horarios](https://dictionary.cambridge.org/grammar/british-grammar/simple-future), [Cambridge Dictionary: *fare*](https://dictionary.cambridge.org/dictionary/english/fare), [Cambridge Dictionary: *book* y reservas](https://dictionary.cambridge.org/us/dictionary/english/booked).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `214.json`.

### 214/301 — `Idiomas/cursos/en/lessons/214.json`

- **Ruta:** `Idiomas/cursos/en/lessons/214.json`; fuente editable: `_herramientas/cursos/en/31.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación y el ejercicio confundían **be due + to + infinitivo** («estar previsto») con **due to + sustantivo** («a causa de»). El aviso no explicaba que *was postponed* es pasiva ni que aplazar no equivale necesariamente a cancelar. El diálogo saltaba entre un concierto aplazado y otro a punto de empezar sin decir que lo habían reprogramado; varios vocablos no se trabajaban y había un ejercicio de escucha pese a que el foco acordado es lectura y texto.
- **Cambios realizados:** separé y practiqué las dos estructuras de *due to*, precisé **was/were going to + verbo base** y **be about to + verbo base**, y añadí una explicación breve de *was postponed* y *postpone*. Reescribí el diálogo para dar un motivo, una nueva fecha, una entrada disponible y un horario de vuelta coherentes. Ajusté el vocabulario a nueve términos contextualizados y reemplacé la actividad de escucha por ejercicios de lectura, gramática, léxico y traducción. Fuente y JSON quedaron sincronizados.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido; diez actividades con IDs únicos y soluciones explicadas en cada opción cerrada; ocho intervenciones traducidas y analizadas; nueve palabras de vocabulario en contexto; comprobación de ambas estructuras de *due*, límites con la lección 215, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: *was going to*](https://dictionary.cambridge.org/grammar/british-grammar/going-to.), [Cambridge Grammar: *be about to* y *be due to*](https://dictionary.cambridge.org/uk/grammar/british-grammar/be-), [Cambridge Dictionary: *due*](https://dictionary.cambridge.org/dictionary/english/due), [Cambridge Dictionary: *postpone*](https://dictionary.cambridge.org/dictionary/english/postpone), [Cambridge Dictionary: *sold out*](https://dictionary.cambridge.org/us/dictionary/english/sold-out), [Cambridge Dictionary: *reschedule*](https://dictionary.cambridge.org/us/dictionary/english/reschedule).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `215.json`.

### 215/301 — `Idiomas/cursos/en/lessons/215.json`

- **Ruta:** `Idiomas/cursos/en/lessons/215.json`; fuente editable: `_herramientas/cursos/en/31.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el texto consistía en frases aisladas y no tenía preguntas reales de comprensión; *headline* no aparecía en contexto. La explicación decía sin fundamento que *sound* podía confundirse con «sonda». Además, *warning* se reducía a «aviso» sin aclarar que también significa «advertencia de peligro», la lectura no era un anuncio verosímil y el ejercicio de **camp** describía de forma imprecisa *camping* como sustantivo.
- **Cambios realizados:** convertí el texto en un anuncio breve y coherente con titular, fecha, grupos, escenario, equipo de sonido, zona de acampada y consejos de seguridad. Corregí las asociaciones *advertisement*–anuncio/*warning*–advertencia y *stage*–escenario/*stadium*–estadio, eliminé la falsa explicación sobre *sound* y ajusté su práctica al significado real. Aclaré **camp** como verbo y sustituí la escucha por diez actividades de lectura, vocabulario, traducción y orden. También afiné la guía de pronunciación de *stage* según Cambridge. Fuente y JSON sincronizados.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido; diez actividades con IDs únicos y una respuesta explicada por opción cerrada; seis líneas bilingües con análisis; vocabulario objetivo integrado en el anuncio; comprobaciones de falso amigo, ejercicios, límite con `216.json`, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Dictionary: *advertisement*](https://dictionary.cambridge.org/us/dictionary/english/advertisement), [Cambridge Dictionary: *stage*](https://dictionary.cambridge.org/dictionary/english/stage?topic=production-direction-and-recording), [Cambridge pronunciation: *stage*](https://dictionary.cambridge.org/pronunciation/english/stage), [Cambridge Dictionary: *crowd*](https://dictionary.cambridge.org/dictionary/english/crowd), [Cambridge Dictionary: *sunscreen*](https://dictionary.cambridge.org/dictionary/english/sunscreen).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `216.json`.

### 216/301 — `Idiomas/cursos/en/lessons/216.json`

- **Ruta:** `Idiomas/cursos/en/lessons/216.json`; fuente editable: `_herramientas/cursos/en/31.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** una respuesta de huecos admitía potencialmente **am travelling**, que también puede referirse a un plan futuro; el contraste decía demasiado sobre **will** al llamarlo predicción o hecho sin matices. La regla mostraba sobre todo la afirmativa y no enseñaba la negativa; *at this time* no coincidía con **this time tomorrow**, y *having* no recogía el sentido de **having lunch**. La traducción de la pregunta sobre el hotel era demasiado literal.
- **Cambios realizados:** precisé la afirmativa, negativa y pregunta de **will be + -ing**; limité la explicación al progreso en un momento futuro y diferencié ese foco de una acción futura anunciada. Añadí la pregunta neutral/cortés por planes, rehice el hueco para que solo admita la forma objetivo, corregí el vocabulario contextual y naturalicé la traducción. Reemplacé la actividad de producción escrita por práctica de lectura, forma y comprensión. Fuente y JSON sincronizados.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido; nueve actividades con IDs únicos y una respuesta explicada para cada opción cerrada; cuatro intervenciones con traducción y análisis; revisión de formas afirmativa, negativa e interrogativa, ejemplos futuros, vocabulario, límite con `217.json`, espacios finales y caracteres de reemplazo.
- **Fuentes consultadas:** [Cambridge Grammar: futuro continuo, forma y acción en curso](https://dictionary.cambridge.org/grammar/british-grammar/future-continuous-i-will-be-working), [Cambridge Grammar: formas de futuro en inglés](https://dictionary.cambridge.org/grammar/british-grammar/future).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `217.json`.

### 217/301 — `Idiomas/cursos/en/lessons/217.json`

- **Ruta:** `Idiomas/cursos/en/lessons/217.json`; fuente editable: `_herramientas/cursos/en/31.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis de las actividades reutilizaban la misma frase sobre llamar y perder un número, con comprobación redundante de la misma forma. La lección no ofrecía una lectura continua que permitiera entender cómo cambió el plan; además, el vocabulario de número no servía al objetivo. Faltaba reforzar que **was/were going to** expresa una intención pasada y que el contexto, no la estructura por sí sola, aclara qué ocurrió después.
- **Cambios realizados:** reescribí la regla con **was/were + going to + verbo base** y la concordancia de **was/were**. Añadí una lectura breve sobre un viaje cuyo coche se avería y que finalmente hacen en tren; el texto muestra la intención inicial, el cambio y el resultado. Sustituí la práctica repetida por comprensión lectora, concordancia, verbo base, significado de *break down*, una pregunta sobre la intención pasada, traducción y orden. Ajusté el vocabulario a *plan*, *break down*, *cancel* e *instead*, y sincronicé la fuente con el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 válido y round-trip exacto con la fuente; nueve actividades e IDs únicos, con una respuesta correcta y feedback para cada opción cerrada; cuatro líneas de lectura con traducción y análisis; confirmé la posición 217/301 en la lista sin modificarla y que las lecciones vecinas 216 y 218 siguen compilando.
- **Fuentes consultadas:** [Cambridge Grammar: *was going to* para planes pasados que quizá cambiaron](https://dictionary.cambridge.org/grammar/british-grammar/going-to.), [Cambridge Grammar: *be going to* + verbo base](https://dictionary.cambridge.org/grammar/british-grammar/will-or-be-going-to), [Cambridge Learner’s Dictionary: *break down* (vehículo o máquina deja de funcionar)](https://dictionary.cambridge.org/dictionary/learner-english/break-down), [Cambridge Dictionary: *cancel*](https://dictionary.cambridge.org/dictionary/english/cancel), [Cambridge Dictionary: *instead*](https://dictionary.cambridge.org/dictionary/english/instead).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `218.json`.

### 218/301 — `Idiomas/cursos/en/lessons/218.json`

- **Ruta:** `Idiomas/cursos/en/lessons/218.json`; fuente editable: `_herramientas/cursos/en/31.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis ejercicios repetían la misma frase sobre volar sobre el Atlántico, incluida la repetición de un ejemplo casi idéntico en la lección 216. La explicación y el contenido léxico tampoco distinguían esta práctica de la lección previa: *flight* y *midnight* no aparecían en contexto, y *over* ofrecía dos sentidos sin precisar cuál se usaba.
- **Cambios realizados:** convertí la lección en una práctica aplicada del futuro continuo con una lectura breve sobre preparar una exposición. Incluí acciones afirmativas, una negativa y preguntas sobre lo que estará ocurriendo a horas concretas. Añadí un contraste cuidadoso de foco entre futuro simple y continuo y vocabulario contextualizado (*exhibition, set up, visitor, label*). Reemplacé las actividades redundantes con comprensión, formación negativa e interrogativa, vocabulario, traducción y orden; sincronicé la fuente con el JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 y round-trip exacto fuente/JSON; nueve actividades con IDs únicos, ocho ejercicios cerrados con una respuesta correcta y feedback completo; cuatro líneas bilingües con análisis; confirmación de la posición 218/301 y de la compilación limpia de las lecciones vecinas 217 y 219.
- **Fuentes consultadas:** [Cambridge Grammar: forma y usos del futuro continuo](https://dictionary.cambridge.org/grammar/british-grammar/future-be-), [Cambridge Dictionary: *exhibition*](https://dictionary.cambridge.org/dictionary/english/exhibition), [Cambridge Dictionary: *set up* en el sentido de preparar algo para usarlo](https://dictionary.cambridge.org/dictionary/english/set-up?topic=giving-providing-and-supplying), [Cambridge Dictionary: *visitor*](https://dictionary.cambridge.org/dictionary/english/visitor), [Cambridge Dictionary: *label*](https://dictionary.cambridge.org/dictionary/english/label).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `219.json`.

### 219/301 — `Idiomas/cursos/en/lessons/219.json`

- **Ruta:** `Idiomas/cursos/en/lessons/219.json`; fuente editable: `_herramientas/cursos/en/31.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el ejemplo y dos ejercicios afirmaban **The guests are about to arrive in five minutes**. Cambridge indica que **be about to** no se combina con expresiones que fijan el momento futuro; la lección daba como modelo una construcción que debía evitarse. La explicación tampoco diferenciaba con claridad «a punto de ocurrir» de una hora esperada, y las actividades repetían la misma frase sin lectura.
- **Cambios realizados:** cambié el objetivo a distinguir **be due to + verbo base** (previsto para una hora) de **be about to + verbo base** (inminente). Corregí el ejemplo de cinco minutos y añadí una nota explícita sobre no combinar **about to** con un plazo u hora concretos. Reescribí la lección como una breve escena de preparativos para una cena, con lectura y práctica variada de comprensión, elección de estructura, vocabulario, traducción y orden. Actualicé el título y sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 y round-trip exacto con la fuente; nueve actividades con IDs únicos, ocho opciones cerradas con una respuesta correcta y explicaciones; cuatro líneas bilingües con análisis; verifiqué la posición 219/301 y compilación limpia de las vecinas 218 y 220.
- **Fuentes consultadas:** [Cambridge Grammar: *be about to* no se combina con expresiones de tiempo](https://dictionary.cambridge.org/us/grammar/british-grammar/be-expressions-be-able-to-be-due-to), [Cambridge Grammar: *be due to* para eventos previstos a una hora](https://dictionary.cambridge.org/us/grammar/british-grammar/be-expressions-be-able-to-be-due-to), [Cambridge Grammar: otras expresiones de futuro y horarios previstos](https://dictionary.cambridge.org/us/grammar/british-grammar/future-other-expressions-to-talk-about-the-future), [Cambridge Dictionary: *due*](https://dictionary.cambridge.org/dictionary/english/due).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `220.json`.

### 220/301 — `Idiomas/cursos/en/lessons/220.json`

- **Ruta:** `Idiomas/cursos/en/lessons/220.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo cambiaba de tema sin responder naturalmente a **Do you play chess?**, y **I'm into knitting too** no tenía un referente claro para **too**. **I'm into photography** se traducía con una intensidad mayor que la necesaria; las fichas *rather* y *fond* se presentaban aisladas de las expresiones **would rather** y **be fond of**. Además, una actividad era de audio pese a que el objetivo útil aquí es comprender el texto y practicar gramática/léxico.
- **Cambios realizados:** rehice el objetivo como aficiones y preferencias; precisé **be into / be keen on / be fond of** con sustantivo o verbo en **-ing**, y **would rather + verbo base + than + verbo base** para el mismo sujeto. Naturalicé la traducción de **be into**, convertí las fichas en expresiones completas, e hice el diálogo coherente al conectar las aficiones con las respuestas. Sustituí la pregunta de audio por comprensión lectora, añadí comprobación explícita de la forma base tras **would rather** y mantuve la práctica en nueve actividades.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 y round-trip exacto fuente/JSON; nueve actividades con IDs únicos y feedback/opción correcta únicos; siete intervenciones traducidas y analizadas; comprobé que ya no queda actividad de audio, la posición 220/301 y compilación limpia de las lecciones 219 y 221.
- **Fuentes consultadas:** [Cambridge Grammar: *would rather* con verbo base cuando el sujeto es el mismo](https://dictionary.cambridge.org/us/grammar/british-grammar/would-rather-would-sooner), [Cambridge Grammar: *rather than*](https://dictionary.cambridge.org/grammar/british-grammar/rather), [Cambridge Dictionary: *keen on*](https://dictionary.cambridge.org/dictionary/english/keen-on), [Cambridge Dictionary: *be into* para expresar mucho interés](https://dictionary.cambridge.org/dictionary/english/into), [Cambridge Dictionary: *be fond of*](https://dictionary.cambridge.org/dictionary/english/fond), [Cambridge English-Spanish Dictionary: *hiking* / *go hiking*](https://dictionary.cambridge.org/us/dictionary/english-spanish/hiking).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `221.json`.

### 221/301 — `Idiomas/cursos/en/lessons/221.json`

- **Ruta:** `Idiomas/cursos/en/lessons/221.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación presentaba el presente perfecto, pero no distinguía **for** (duración) de **since** (punto de inicio), pese a que el título y los ejemplos dependían de ambos. El vocabulario de fiebre, síntomas y lesiones aparecía parcialmente desconectado de la lectura. Una actividad usaba audio; el ejemplo de lesión y un ejercicio de tos no encajaban bien con el diálogo.
- **Cambios realizados:** añadí la estructura **have/has + participio** y la diferencia explícita entre período e inicio. Reemplacé el diálogo irregular por una lectura breve de clínica que usa las trece palabras del vocabulario en contexto, incluidos *sprain*, *bruise*, *wrist* y *ache*. Aclaré **have a temperature** como «tener fiebre», ajusté *ache* para cubrir nombre y verbo y rehice la traducción de la lesión. Cambié la actividad de audio por comprensión lectora y diversifiqué la práctica de **for/since**, falsos amigos y detalles del texto.
- **Pruebas o comprobaciones ejecutadas:** compilador real sin avisos; JSON UTF-8 y round-trip exacto con la fuente; diez actividades e IDs únicos, ocho ejercicios cerrados con una respuesta correcta y feedback completo; cinco líneas bilingües con análisis; las trece fichas léxicas aparecen en la lectura; sin ejercicio solo de audio; posición 221/301 confirmada y compilación limpia de las lecciones 220 y 222.
- **Fuentes consultadas:** [Cambridge Grammar: presente perfecto simple con *for* y *since*](https://dictionary.cambridge.org/us/grammar/british-grammar/present-perfect-simple-i-have-worked), [Cambridge Grammar: diferencia entre *for* y *since*](https://dictionary.cambridge.org/grammar/british-grammar/for-or-since), [Cambridge Dictionary: *have a temperature*](https://dictionary.cambridge.org/dictionary/english/temperature), [Cambridge Dictionary: *prescription*](https://dictionary.cambridge.org/dictionary/english/prescription), [Cambridge Dictionary: *ache*](https://dictionary.cambridge.org/dictionary/english/ache), [Cambridge Dictionary: *sneeze* y pronunciación](https://dictionary.cambridge.org/dictionary/english/sneeze), [Cambridge Dictionary: *sprain*](https://dictionary.cambridge.org/dictionary/english/sprain), [Cambridge Dictionary: *bruise*](https://dictionary.cambridge.org/dictionary/english/bruise), [Cambridge English-Spanish Dictionary: *wrist*](https://dictionary.cambridge.org/es/diccionario/ingles-espanol/wrist).
- **Resultado:** correcto tras los cambios y las comprobaciones.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `222.json`.

### 222/301 — `Idiomas/cursos/en/lessons/222.json`

- **Ruta:** `Idiomas/cursos/en/lessons/222.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lectura original era una lista de frases inconexas y no tenía comprensión lectora real; *affordable* se contraponía a *expensive rent* de forma poco natural; *commuter* no aparecía en uso; el ejercicio de audio no podía resolverse desde el texto; se afirmaba que *bizarre* era un falso amigo absoluto, aunque el DLE también registra «raro, extravagante» para *bizarro*. Además, *Tube*, *chemist's*, *crude* y *raw* requerían distinguir contexto y variedad británica.
- **Cambios realizados:** consolidé el contenido en una lectura breve y coherente de un barrio londinense, integré las doce fichas léxicas en contexto, añadí cinco preguntas de comprensión y práctica variada, reemplacé la actividad solo de audio y precisé los sentidos británicos de *the Tube* y *the chemist's*, la diferencia *crude/raw* y los sentidos de *bizarre/bizarro*.
- **Pruebas o comprobaciones ejecutadas:** JSON parseado; comprobados 12 términos en la lectura, 10 ejercicios, IDs únicos, una respuesta correcta y feedback en cada ejercicio cerrado, y ausencia de bloques de audio. Compilador real ejecutado desde las fuentes de autoría; resultado del curso: 300 lecciones, 42 capítulos, 2.348 palabras, 2.314 ejercicios y 709 avisos generales. Verifiqué la restauración íntegra de los 300 JSON numerados y la secuencia correcta 220–223. Lista intacta: 301 entradas y posición 222 confirmada.
- **Incidencia de verificación:** una primera compilación temporal usó el índice inicial equivocado y reescribió/eliminó archivos posteriores. Lo detecté antes de continuar y reconstruí el curso completo a partir de sus fuentes; comprobé que existen de nuevo las 300 lecciones. No se avanzó al siguiente archivo hasta esta recuperación.
- **Fuentes consultadas:** [Cambridge Dictionary: *the Tube*](https://dictionary.cambridge.org/dictionary/english/tube), [*chemist*](https://dictionary.cambridge.org/dictionary/english/chemist), [*commute*](https://dictionary.cambridge.org/dictionary/english/commute), [*commuter*](https://dictionary.cambridge.org/dictionary/english/commuter), [*bizarre*](https://dictionary.cambridge.org/dictionary/english/bizarre), [*crude*](https://dictionary.cambridge.org/dictionary/english/crude), [*raw*](https://dictionary.cambridge.org/dictionary/english/raw), [*affordable*](https://dictionary.cambridge.org/dictionary/english/affordable) y [DLE de la RAE: *bizarro*](https://dle.rae.es/bizarro).
- **Resultado:** correcto tras la reparación, reconstrucción y comprobaciones.
- **Bloqueos/dudas/pendientes:** nota de nivel/diseño: Cambridge clasifica *commute* como C1 y *bizarre* como B2 (y *crude* como C2); se mantienen con glosas explícitas porque la fuente los enseña contextualizados, pero convendría decidir si se presentan como ampliación y no como léxico esencial del B1. No bloquea la comprensión de esta lección.
- **Siguiente archivo pendiente:** `223.json`.

### 223/301 — `Idiomas/cursos/en/lessons/223.json`

- **Ruta:** `Idiomas/cursos/en/lessons/223.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación solo desarrollaba la forma afirmativa y presentaba el contraste entre continuo (proceso/duración) y simple (resultado/cantidad) de manera demasiado absoluta. Dos huecos repetían la forma afirmativa y la actividad final pedía producir una frase, sin comprobar comprensión de la lectura.
- **Cambios realizados:** añadí en forma breve la construcción negativa e interrogativa; precisé que el contraste entre las dos formas perfectas no es absoluto e incluí un ejemplo de significado parecido. Reemplacé un hueco afirmativo redundante por una pregunta y el otro por una negación; cambié la respuesta libre final por una pregunta de comprensión del diálogo.
- **Pruebas o comprobaciones ejecutadas:** compilador real del curso completado correctamente: 300 lecciones y 42 capítulos; cero avisos asociados a la lección 223. JSON parseado; diálogo de cuatro líneas y seis fichas léxicas; ocho ejercicios con IDs únicos, siete ejercicios cerrados con una respuesta correcta y feedback, sin actividad de audio ni respuesta abierta. Confirmé que las formas añadidas aparecen en la fuente y en el JSON generado; lista intacta, posición 223/301 confirmada. La compilación completa informa 709 avisos generales en otras partes del curso, que no corresponden a este archivo.
- **Fuentes consultadas:** [Cambridge Grammar: forma, negación, preguntas y usos del presente perfecto continuo](https://dictionary.cambridge.org/grammar/british-grammar/present-perfect-continuous-i-have-been-working), [Cambridge Grammar: presente perfecto simple o continuo](https://dictionary.cambridge.org/us/grammar/british-grammar/present-perfect-simple-or-present-perfect-continuous) y [British Council LearnEnglish: presente perfecto simple y continuo (B1–B2)](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect-simple-continuous).
- **Resultado:** correcto tras los cambios; fuente y JSON compilado sincronizados.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `224.json`.

### 224/301 — `Idiomas/cursos/en/lessons/224.json`

- **Ruta:** `Idiomas/cursos/en/lessons/224.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la introducción anunciaba tres mensajes, pero la lectura tenía cuatro. *Return* figuraba en el vocabulario sin aparecer en la lectura, y faltaba la ficha de *renew*. La fecha *due back on Friday* se explicaba de forma imprecisa. El último ejercicio era una respuesta abierta breve y no comprobaba la comprensión funcional del aviso.
- **Cambios realizados:** alineé la introducción con los cuatro textos; añadí *return* en el correo y fichas para *due back* y *renew*; precisé que el libro debe devolverse como muy tarde el viernes. Reemplacé la respuesta abierta por una pregunta de comprensión sobre la indicación de usar las escaleras.
- **Pruebas o comprobaciones ejecutadas:** compilador real del curso completado correctamente: 300 lecciones y 42 capítulos; cero avisos asociados a 224. JSON parseado; cuatro mensajes, 11 fichas (todas aparecen en la lectura), ocho ejercicios con IDs únicos y siete ejercicios cerrados con una respuesta correcta y feedback; sin ejercicios de audio ni respuesta abierta. Fuente y JSON sincronizados; lista intacta y posición 224/301 confirmada.
- **Fuentes consultadas:** [Cambridge Grammar: órdenes, instrucciones y avisos públicos](https://dictionary.cambridge.org/grammar/british-grammar/commands-), [Cambridge Grammar: imperativos y uso de *please*](https://dictionary.cambridge.org/uk/grammar/british-grammar/imperative), [Cambridge Dictionary: *due*](https://dictionary.cambridge.org/dictionary/english/due), [*return*](https://dictionary.cambridge.org/dictionary/english/return), [*renew*](https://dictionary.cambridge.org/dictionary/english/renew) y [*out of order*](https://dictionary.cambridge.org/dictionary/english/out-of-order).
- **Resultado:** correcto tras los cambios; contenido funcional coherente y comprobado.
- **Bloqueos/dudas/pendientes:** Cambridge etiqueta *renew* como B2. Es vocabulario útil en un aviso bibliotecario y queda explicado; queda como posible vocabulario de ampliación en el capítulo de cierre B1.
- **Siguiente archivo pendiente:** `225.json`.

### 225/301 — `Idiomas/cursos/en/lessons/225.json`

- **Ruta:** `Idiomas/cursos/en/lessons/225.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** *community*, *borrow* y *waste* tenían ficha sin aparecer en la lectura; la comprensión dependía de inferirlos sin contexto suficiente. La tarjeta visible *volunteer* duplicaba la forma plural *volunteers*. La traducción añadía «algunos» donde el inglés no lo hacía, y «actividad que se reúne» resultaba poco natural en español. La última pregunta requería redactar una respuesta en vez de comprobar lectura.
- **Cambios realizados:** integré *community* y *borrow* en el primer párrafo y añadí una frase que contextualiza *waste*; convertí *volunteers* en ficha de apoyo oculta para no duplicar la tarjeta de *volunteer*. Ajusté la traducción de los vecinos y la pregunta sobre el club de lectura. Sustituí la respuesta abierta por una pregunta cerrada sobre la decisión del gerente. Añadí fichas ocultas para seis palabras de la lectura que el compilador detectaba sin apoyo léxico.
- **Pruebas o comprobaciones ejecutadas:** compilador real del curso completado correctamente: 300 lecciones y 42 capítulos; cero avisos asociados a 225. JSON parseado; cuatro párrafos bilingües, 32 fichas léxicas con apoyo contextual en la lectura, ocho ejercicios con IDs únicos, siete ejercicios cerrados con una respuesta correcta y feedback, sin actividad de audio ni de respuesta abierta. Fuente y JSON sincronizados; lista intacta y posición 225/301 confirmada.
- **Fuentes consultadas:** [Consejo de Europa, CEFR Companion Volume: comprensión de textos factuales B1](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2018/1680787989), [Cambridge English B1 Preliminary: textos breves, idea principal, detalle e inferencia](https://www.cambridgeenglish.org/exams-and-tests/preliminary/exam-format/?level=basic&skill=reading), [Cambridge Dictionary: *community*](https://dictionary.cambridge.org/us/dictionary/english/community), [*borrow*](https://dictionary.cambridge.org/dictionary/english/borrow), [*waste*](https://dictionary.cambridge.org/dictionary/english/waste) y [*donate*](https://dictionary.cambridge.org/dictionary/english/donate).
- **Resultado:** correcto tras los cambios; lectura, ejercicios y fichas léxicas revisados.
- **Bloqueos/dudas/pendientes:** nota de nivel/diseño: Cambridge marca *community* y *donate* como B2. Se mantienen contextualizados por su pertinencia temática y se explican en la lectura; queda por decidir si se presentan como vocabulario de ampliación del capítulo B1.
- **Siguiente archivo pendiente:** `226.json`.

### 226/301 — `Idiomas/cursos/en/lessons/226.json`

- **Ruta:** `Idiomas/cursos/en/lessons/226.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis actividades repetían prácticamente la misma frase de una hora escribiendo; aunque el título prometía comparar el presente perfecto simple y el continuo, solo se practicaba el continuo. La ficha *still* también duplicaba una palabra ya enseñada en 086.
- **Cambios realizados:** reemplacé la frase única por una lectura breve con resultado/cantidad (*has written three pages*), proceso/duración (*has been working*), una actividad en curso, una cantidad completada con *so far* y el verbo de estado *know*. Precisé la explicación y añadí ocho actividades variadas de detalle, contraste y forma. Convertí *still* en apoyo léxico oculto para evitar una tarjeta duplicada y añadí glosas contextuales para el resto de la lectura.
- **Pruebas o comprobaciones ejecutadas:** compilador real del curso completado correctamente: 300 lecciones y 42 capítulos; cero avisos asociados a 226. JSON parseado; cuatro frases bilingües, 15 fichas con apoyo en contexto, ocho ejercicios con IDs únicos, siete ejercicios cerrados con una respuesta correcta y feedback, sin actividad de audio ni respuesta abierta. Confirmé que aparecen ambas formas perfectas y que la lista sigue intacta en la posición 226/301.
- **Fuentes consultadas:** [Cambridge Grammar: presente perfecto simple o continuo](https://dictionary.cambridge.org/us/grammar/british-grammar/present-perfect-simple-or-present-perfect-continuous), [Cambridge Grammar: presente perfecto simple, *so far* y *yet*](https://dictionary.cambridge.org/us/grammar/british-grammar/present-perfect-simple-i-have-worked), [Cambridge Grammar: *still*, *yet* y negaciones](https://dictionary.cambridge.org/grammar/british-grammar/already-still-or-) y [British Council LearnEnglish: presente perfecto simple y continuo (B1–B2)](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect-simple-continuous).
- **Resultado:** correcto tras la revisión y reestructuración; curso completo recompilado desde su fuente.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `227.json`.

### 227/301 — `Idiomas/cursos/en/lessons/227.json`

- **Ruta:** `Idiomas/cursos/en/lessons/227.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis actividades giraban en torno a una sola frase; la tarjeta *recent* no aparecía en el texto y no se practicaba la elección con un periodo terminado. La regla omitía que el uso varía entre inglés británico y estadounidense.
- **Cambios realizados:** rehice el ejemplo como una conversación breve que contrapone **this week** con **last week/yesterday**, y añade una pregunta y respuesta con **yet**. Precisé que la regla refleja el inglés británico de los ejemplos y advertí brevemente de la variante estadounidense. Quité la ficha aislada *recent*, cambié *meeting* y formas repetidas a apoyos ocultos, añadí una ficha para *receive* y reemplacé la respuesta abierta por ejercicios de lectura y elección.
- **Pruebas o comprobaciones ejecutadas:** compilador real del curso completado correctamente: 300 lecciones y 42 capítulos; cero avisos asociados a 227. JSON parseado; cuatro intervenciones bilingües, diez fichas contextualizadas, siete actividades con IDs únicos, seis ejercicios cerrados con una respuesta correcta y feedback, sin audio ni respuesta abierta. Confirmé los ejemplos y el matiz dialectal contra las fuentes; lista intacta y posición 227/301 confirmada.
- **Fuentes consultadas:** [Cambridge Grammar: pasado simple o presente perfecto y tiempo terminado/no terminado](https://dictionary.cambridge.org/uk/grammar/british-grammar/past-simple-or-present-perfect), [Cambridge Grammar: diferencias entre inglés británico y estadounidense](https://dictionary.cambridge.org/grammar/british-grammar/british-and-american), [Cambridge Grammar: *yet* con el presente perfecto](https://dictionary.cambridge.org/us/grammar/british-grammar/present-perfect-simple-i-have-worked) y [Cambridge English B1 Preliminary Handbook: contenidos lingüísticos](https://www.cambridgeenglish.org/vn/Images/168150-b1-preliminary-teachers-handbook.pdf).
- **Resultado:** correcto tras la reestructuración; ejemplos, vocabulario y respuestas comprobados.
- **Bloqueos/dudas/pendientes:** ninguno.
- **Siguiente archivo pendiente:** `228.json`.

### 228/301 — `Idiomas/cursos/en/lessons/228.json`

- **Ruta:** `Idiomas/cursos/en/lessons/228.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** *moving* se traducía como «mudarse; mover», no como «conmovedor» en una reseña; la traducción española del título reducía *evidence* a «ejemplo». La reseña original era demasiado corta para distinguir bien opinión y apoyo concreto, varias tarjetas no aparecían en contexto y cinco actividades repetían una frase metalingüística casi idéntica.
- **Cambios realizados:** alineé el título con «opinión y evidencia», corregí *moving* y reescribí la lectura como una reseña breve que da detalles específicos para justificar sus valoraciones. Añadí preguntas distintas sobre opinión global, detalle, inferencia y vocabulario, y fichas ocultas de apoyo para las palabras que el compilador detectaba sin glosa.
- **Pruebas o comprobaciones ejecutadas:** compilador real del curso completado correctamente: 300 lecciones y 42 capítulos; cero avisos asociados a 228. JSON parseado; seis fragmentos bilingües, 25 fichas contextualizadas, nueve ejercicios cerrados con una sola respuesta correcta, feedback e IDs únicos; sin audio ni respuesta abierta. Fuente y JSON sincronizados; lista intacta y posición 228/301 confirmada.
- **Fuentes consultadas:** [Consejo de Europa, CEFR Companion Volume: comprensión lectora B1](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2018/1680787989), [Cambridge English B1 Preliminary: comprensión detallada, idea global, inferencia y actitud del autor](https://www.cambridgeenglish.org/exams-and-tests/preliminary/exam-format/?level=basic&skill=reading), [Cambridge Dictionary: *reviewer*](https://dictionary.cambridge.org/dictionary/english/reviewer), [*evidence*](https://dictionary.cambridge.org/dictionary/english/evidence), [*predictable*](https://dictionary.cambridge.org/dictionary/english/predictable) y [*moving*](https://dictionary.cambridge.org/dictionary/english/moving).
- **Resultado:** correcto tras la corrección y reestructuración; las opiniones tienen detalles de apoyo y las respuestas se verificaron contra el texto.
- **Bloqueos/dudas/pendientes:** nota de nivel/diseño: Cambridge etiqueta *evidence*, *predictable* y el sentido emocional de *moving* como B2. Quedan explicados y contextualizados como ampliación en esta lectura B1; conviene decidir si se etiquetan explícitamente como vocabulario avanzado.
- **Siguiente archivo pendiente:** `229.json`.

### 229/301 — `Idiomas/cursos/en/lessons/229.json`

- **Ruta:** `Idiomas/cursos/en/lessons/229.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el ejemplo parecía una noticia real aunque era inventado; el porcentaje de aumento no indicaba con qué mes se comparaba; la referencia a la causa no era suficientemente clara; varias preguntas repetían la misma frase; `needed` y `officials` tenían glosas incorrectas o incompletas; faltaban fichas para palabras usadas en el texto.
- **Cambios realizados:** marqué expresamente el texto como práctica ficticia, precisé que el uso del autobús aumentó un 12 % en mayo frente a abril, aclaré que la causa sigue sin confirmarse y atribuí opiniones a residentes concretos. Reemplacé tareas repetidas por preguntas variadas de comprensión factual, atribución, vocabulario e inferencia; corregí y completé las fichas léxicas.
- **Pruebas/comprobaciones:** compilación completa desde las fuentes oficiales del curso: 300 lecciones, 42 capítulos; cero avisos asociados a 229 y 702 avisos generales. JSON estricto válido; 11 bloques; 8 ejercicios con IDs únicos y soluciones/feedback en todas las opciones cerradas; 20/20 fichas contextualizadas; cuatro fragmentos de lectura; sin audio ni escritura abierta. La lista conserva las 301 entradas y `229.json` está en la posición 229; los 300 archivos numerados están presentes.
- **Fuentes consultadas:** [Consejo de Europa, CEFR Companion Volume, lectura B1 de información y textos factuales](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4), [Cambridge English B1 Preliminary, lectura: comprensión detallada, idea global, inferencia y opinión](https://www.cambridgeenglish.org/exams-and-tests/qualifications/preliminary/format/?level=basic&skill=reading), [Cambridge Dictionary, *survey*](https://dictionary.cambridge.org/dictionary/english/survey), [*council*](https://dictionary.cambridge.org/dictionary/english/council) e [*improvement*](https://dictionary.cambridge.org/us/dictionary/english/improvement).
- **Resultado:** correcto tras la revisión; el pasaje distingue los resultados informados de las opiniones atribuidas y evita afirmar una causa que el texto no demuestra.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `230.json`.

### 230/301 — `Idiomas/cursos/en/lessons/230.json`

- **Ruta:** `Idiomas/cursos/en/lessons/230.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lectura solo permitía recuperar una fecha; cuatro actividades repetían esa misma respuesta y no practicaban la inferencia anunciada. Algunas fichas eran imprecisas: `community` figuraba únicamente como «de la comunidad», `artists` estaba en singular y `evening` como «tarde» sin contexto.
- **Cambios realizados:** amplié la biografía ficticia con una secuencia breve y explícita (mudanza, estudios, galería, estudio y clases actuales); añadí marcadores temporales y una inferencia apoyada por la evolución de sus actividades. Sustituí la repetición por tareas diferentes sobre tema, cronología, secuencia, inferencia y comprensión de detalles; ajusté las glosas y añadí apoyo léxico oculto para todas las palabras del texto.
- **Pruebas/comprobaciones:** compilación completa del curso: 300 lecciones, 42 capítulos; cero avisos asociados a 230 y 702 avisos generales. JSON estricto válido; 11 bloques; 8 actividades con IDs únicos y feedback/solución en los ejercicios cerrados; 22/22 fichas contextualizadas; tres fragmentos de lectura; sin audio ni escritura abierta. La lista está intacta, el archivo ocupa la posición 230/301 y siguen presentes las 300 lecciones numeradas.
- **Fuentes consultadas:** [Consejo de Europa, CEFR Companion Volume, comprensión de textos factuales B1](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4), [Cambridge English B1 Preliminary, lectura: comprensión detallada, idea global e inferencia](https://www.cambridgeenglish.org/exams-and-tests/qualifications/preliminary/format/?level=basic&skill=reading).
- **Resultado:** correcto tras la revisión; la lectura ahora permite recuperar información en distintos puntos y justificar una inferencia sin añadir hechos no mencionados.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `231.json`.

### 231/301 — `Idiomas/cursos/en/lessons/231.json`

- **Ruta:** `Idiomas/cursos/en/lessons/231.json`; fuente editable: `_herramientas/cursos/en/32.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el condicional cero usaba «If you cool water, it freezes», que no expresa una verdad general completa; *ought to* se definía como consejo fuerte, como si fuera obligación; *a flu* no es la forma normal, ya que *flu* es incontable; el ejercicio de escritura rechazaba *while* pese a ser válido para contraste. También faltaba contexto para distinguir *due to arrive* de *about to arrive*, y había una referencia ambigua en *it was wet*.
- **Cambios realizados:** sustituí el ejemplo por «If you heat ice, it melts»; precisé que *ought to* suele expresar consejo o lo adecuado; cambié la frase a *the flu* y aclaré que también se usa sin artículo; acepté *whereas* y *while* como respuestas válidas; añadí el contexto del horario y especifiqué el suelo mojado. Ajusté la traducción del causativo y la pista de *before*.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones, 42 capítulos; cero avisos asociados a 231 y 698 avisos generales. JSON estricto válido; 23 preguntas exactas para los capítulos 23–32, IDs únicos, soluciones y feedback en todas las preguntas cerradas y dos respuestas válidas en el ejercicio escrito; una ficha contextualizada para `rich`. La lista y la presencia de las 300 lecciones se verificaron; posición 231/301.
- **Fuentes consultadas:** [British Council, condicionales cero/primero/segundo](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-zero-first-second), [Cambridge Grammar, contraste con *while/whereas*](https://dictionary.cambridge.org/grammar/british-grammar/while-and-whilst), [Cambridge Grammar, *ought to*](https://dictionary.cambridge.org/us/grammar/british-grammar/ought-to?q=ought), [Cambridge Dictionary, *flu*](https://dictionary.cambridge.org/dictionary/english/flu).
- **Resultado:** correcto tras los cambios; se repararon las respuestas y explicaciones que podían marcar como errónea una variante válida o enseñar una estructura incorrecta.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `232.json`.

### 232/301 — `Idiomas/cursos/en/lessons/232.json`

- **Ruta:** `Idiomas/cursos/en/lessons/232.json`; fuente editable: `_herramientas/cursos/en/33.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación mezclaba **Whatever you say** («digas lo que digas», lectura concesiva) con las subordinadas sustantivas; **you are tired** se traducía asignando género femenino; la explicación de las relativas no aclaraba que **whose** también puede aparecer en una relativa explicativa. Había discordancia singular/plural entre *the rule* y su traducción como «las normas», una referencia poco clara en *the big one* y varios ejemplos de trabajo poco naturales. No se practicaban las subordinadas con **that** ni **whatever**, aunque se explicaban.
- **Cambios realizados:** precisé las funciones de **what**, **that** y **whatever** mediante ejemplos completos y feedback en español; aclaré los pronombres admitidos en relativas explicativas y corregí las traducciones y ejemplos. Hice más natural la referencia a la sucursal, ajusté la guía de pronunciación de *branch* y reemplacé la escucha por una comprobación cerrada de subordinada con **that**; añadí práctica para **whatever**.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones, 42 capítulos; cero avisos asociados a 232 y 698 avisos generales. JSON estricto válido; 13 bloques; 9 ejercicios con IDs únicos y soluciones/feedback completos; 15/15 fichas presentes en contexto; subordinadas con **that** y **whatever** comprobadas; sin audio. Lista intacta y posición 232/301 confirmada; siguen presentes las 300 lecciones numeradas.
- **Fuentes consultadas:** [Cambridge Grammar, relativas especificativas y explicativas](https://dictionary.cambridge.org/us/grammar/british-grammar/relative-clauses-defining-and-non-defining), [*whose* y posesión](https://dictionary.cambridge.org/grammar/british-grammar/whose), [cláusulas con *that*](https://dictionary.cambridge.org/grammar/british-grammar/that-clauses) y [*whatever*](https://dictionary.cambridge.org/dictionary/english/whatever).
- **Resultado:** correcto tras los cambios; los conceptos explicados tienen ejemplos y ejercicios diferenciados, y las traducciones coinciden con el número y sentido del original.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `233.json`.

### 233/301 — `Idiomas/cursos/en/lessons/233.json`

- **Ruta:** `Idiomas/cursos/en/lessons/233.json`; fuente editable: `_herramientas/cursos/en/33.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** **Whatever you say, I don't agree** era una subordinada concesiva, no sustantiva, y se enseñaba bajo el objetivo equivocado; **whether** se reducía a una duda entre dos posibilidades sin explicar usos clave; la traducción de **you are tired** imponía género femenino. *Evidence* tenía una nota defectuosa, y **appear** podía responder a la pregunta sobre **seem** pero la solución solo aceptaba *seem*. Una actividad dependía del audio.
- **Cambios realizados:** contrasté **whatever** como sujeto («cualquier cosa que digas») con su uso concesivo («digas lo que digas»); añadí las reglas principales de **whether** frente a **if** y un ejercicio de **whether + to-infinitive**; neutralicé la traducción de **you**, corregí la glosa de *evidence*, acepté y contextualicé **seem/appear**, y cambié la pregunta de audio por lectura y vocabulario. Dejé **whatever** como ficha oculta de apoyo porque ya se presentó visiblemente en 232.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones, 42 capítulos; cero avisos asociados a 232 y 233, 698 avisos generales. JSON estricto válido; 13 bloques; 9 ejercicios con IDs únicos, solución y feedback completo; 13/13 fichas contextualizadas; sin audio ni respuesta abierta. Lista intacta y posición 233/301 confirmada; siguen presentes las 300 lecciones numeradas. Revalidé también 232 tras la compilación conjunta.
- **Fuentes consultadas:** [Cambridge Grammar, *whether*](https://dictionary.cambridge.org/grammar/british-grammar/whether), [*if or whether*](https://dictionary.cambridge.org/us/grammar/british-grammar/if-or-whether), [*whatever*](https://dictionary.cambridge.org/dictionary/english/whatever), [*seem*](https://dictionary.cambridge.org/dictionary/english/seem) y [*evidence*](https://dictionary.cambridge.org/dictionary/english/evidence).
- **Resultado:** correcto tras los cambios; la lección diferencia subordinadas sustantivas de concesivas, enseña las formas de **whether** con ejemplos y no rechaza una respuesta válida.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `234.json`.

### 234/301 — `Idiomas/cursos/en/lessons/234.json`

- **Ruta:** `Idiomas/cursos/en/lessons/234.json`; fuente editable: `_herramientas/cursos/en/33.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el informe llamaba *turnout* a una encuesta, aunque la idea era medir respuestas respecto de personas consultadas; las cifras carecían de denominador/comparación temporal claros y la conclusión sugería causalidad sin evidencia. El falso amigo *consistent* y *eventual* es vocabulario avanzado para B2 y no debía parecer requisito productivo.
- **Cambios realizados:** identifiqué el texto como ficticio, definí 1.000 personas consultadas y 800 respuestas (80 %); distinguí *response rate* de *questionnaire* y *turnout*; fijé la comparación entre 38 % el año pasado y 51 % este año (13 puntos porcentuales); aclaré que la encuesta no demuestra por qué eligió viajar cada persona; marqué los falsos amigos avanzados como ampliación de reconocimiento y afiné glosas/respuestas.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones y 42 capítulos; cero avisos asociados a 234, 706 avisos generales. JSON estricto válido; 14 bloques; 10 ejercicios con IDs únicos, solución y feedback; texto de 8 frases; sin audio ni respuesta abierta. Lista intacta, posición 234/301 confirmada y 300 lecciones numeradas presentes.
- **Fuentes consultadas:** [Cambridge Dictionary, *response rate*](https://dictionary.cambridge.org/dictionary/english/response-rate), [*eventual* (C2)](https://dictionary.cambridge.org/dictionary/english/eventual), [*consistent* (C2)](https://dictionary.cambridge.org/dictionary/english/consistent?q=consistent_1), [*percentage* (B2)](https://dictionary.cambridge.org/dictionary/english/percentage), [*résumé/resume* y CV](https://dictionary.cambridge.org/dictionary/english/resume).
- **Resultado:** correcto tras los cambios; las cifras y la conclusión son interpretables sin confundir tasa de respuesta, asistencia ni correlación con causalidad.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `235.json`.

### 235/301 — `Idiomas/cursos/en/lessons/235.json`

- **Ruta:** `Idiomas/cursos/en/lessons/235.json`; fuente editable: `_herramientas/cursos/en/33.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección solo mostraba **who** y reciclaba prácticamente la misma oración en casi todas las actividades; no enseñaba **which/whose**, la diferencia funcional de las comas, que **that** no se usa en estas relativas ni que el pronombre no se omite. No había práctica de comprensión lectora pese a que el contenido se prestaba a ella.
- **Cambios realizados:** expliqué de forma breve las relativas explicativas, **who/whom**, **which**, **whose + nombre**, el uso de comas y la diferencia con una relativa que identifica; añadí una nota corta de tres frases con ejemplos y práctica de **who/which/whose**, **that**, omisión del pronombre y detalles explícitos de lectura. Eliminé tareas repetidas y mejoré distractores y feedback.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones y 42 capítulos; cero avisos asociados a 235, 707 avisos generales. JSON estricto válido; 14 bloques; 10 ejercicios con IDs únicos, una solución y feedback; lectura de 3 frases; 22 fichas contextuales; sin audio ni redacción abierta. Lista intacta, posición 235/301 confirmada y 300 lecciones numeradas presentes.
- **Fuentes consultadas:** [Cambridge Grammar, relativas especificativas y explicativas: significado y comas](https://dictionary.cambridge.org/grammar/british-grammar/defining-and-non-defining), [pronombres relativos: *who, whom, whose, which*, restricciones de *that* y omisión](https://dictionary.cambridge.org/grammar/british-grammar/pronouns-relative), [*whose* posesivo](https://dictionary.cambridge.org/grammar/british-grammar/whose).
- **Resultado:** correcto tras los cambios; la regla se practica con pronombres distintos y la lectura permite comprobar comprensión de datos, no solo repetir una frase.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `236.json`.

### 236/301 — `Idiomas/cursos/en/lessons/236.json`

- **Ruta:** `Idiomas/cursos/en/lessons/236.json`; fuente editable: `_herramientas/cursos/en/33.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la regla daba una alternativa informal, pero no explicaba que puede conservarse u omitirse el pronombre objeto; seis tareas repetían la misma frase con **to whom** y no evaluaban el uso con cosas (**which**), la colocación de preposiciones en otra estructura ni la comprensión lectora. Algunas opciones incorrectas daban feedback genérico.
- **Cambios realizados:** contrasté el orden formal (**to whom/in which**) con el más habitual (preposición al final), aclaré la omisión del pronombre objeto en relativas especificativas y el límite de **that** tras preposición inicial. Añadí práctica con personas/lugares, un mensaje corto con **to which/to whom**, preguntas de detalle y traducción; precisé el feedback de pronombres y preposiciones.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones y 42 capítulos; cero avisos asociados a 236, 707 avisos generales. JSON estricto válido; 12 bloques; 8 ejercicios con IDs únicos, solución y feedback; 3 frases de lectura; 18 fichas; sin audio ni respuesta abierta. Lista intacta, posición 236/301 confirmada y las 300 lecciones numeradas presentes.
- **Fuentes consultadas:** [Cambridge Grammar, pronombres relativos: *whom/which* y preposición antes o al final](https://dictionary.cambridge.org/grammar/british-grammar/pronouns-relative), [posición de las preposiciones y registro](https://dictionary.cambridge.org/grammar/british-grammar/prepositions_2), [omisión del pronombre objeto en relativas especificativas](https://dictionary.cambridge.org/grammar/british-grammar/pronouns-relative).
- **Resultado:** correcto tras los cambios; queda explícita la equivalencia entre las dos posiciones y la práctica ya no se limita a repetir un único patrón.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `237.json`.

### 237/301 — `Idiomas/cursos/en/lessons/237.json`

- **Ruta:** `Idiomas/cursos/en/lessons/237.json`; fuente editable: `_herramientas/cursos/en/33.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** aunque el título prometía practicar **what** y **whether**, casi todo se limitaba a repetir **whether to accept**; **what** solo aparecía explicado, sin tarea propia. No se diferenciaban las cláusulas con **what** de las alternativas con **whether**, ni se enseñaba el orden normal de sujeto + verbo en una pregunta indirecta.
- **Cambios realizados:** aclaré que la cláusula con **what** puede funcionar como sujeto (**What matters…**) u objeto (**what she wants**); expliqué **whether + to-infinitive**, **whether + sujeto + verbo**, el orden de preguntas indirectas y el uso de **whether** tras preposición. Añadí una lectura breve sobre un viaje con usos contrastivos y comprensión de detalles, ejercicios distintos y feedback específico.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones y 42 capítulos; cero avisos asociados a 237, 707 avisos generales. JSON estricto válido; 13 bloques; 10 ejercicios con IDs únicos, una solución y feedback; lectura de 3 frases; 18 fichas; sin audio ni respuesta abierta. Lista intacta, posición 237/301 confirmada y 300 lecciones numeradas presentes.
- **Fuentes consultadas:** [Cambridge Grammar, *if or whether* (usos intercambiables, infinitivo y preposición)](https://dictionary.cambridge.org/us/grammar/british-grammar/if-or-whether), [*whether* en preguntas indirectas y alternativas](https://dictionary.cambridge.org/us/grammar/british-grammar/whether), [orden de palabras en preguntas indirectas](https://dictionary.cambridge.org/grammar/british-grammar/reported-speech-indirect-speech).
- **Resultado:** correcto tras los cambios; los dos objetivos anunciados se enseñan y se practican por separado, y la lectura comprueba comprensión escrita.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `238.json`.

### 238/301 — `Idiomas/cursos/en/lessons/238.json`

- **Ruta:** `Idiomas/cursos/en/lessons/238.json`; fuente editable: `_herramientas/cursos/en/34.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación limitaba **nevertheless** al comienzo de una frase y equiparaba **anyway** sin matiz; el diálogo traducía **I was happy** en femenino aunque lo dice Tom y usaba el giro poco natural **we had pride**. Una actividad dependía de audio y otra de producir texto; había poca comprobación de comprensión del diálogo.
- **Cambios realizados:** precisé **despite/in spite of + sustantivo/-ing**, **despite/in spite of the fact that + cláusula**, **although/even though + sujeto y verbo**, la coma tras la subordinada inicial y el uso de **nevertheless/anyway**. Cambié *had pride* por **took pride in our effort**, corregí la concordancia de Tom, ajusté *coach* al contexto deportivo y reemplacé audio/escritura abierta por preguntas cerradas de lectura.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones y 42 capítulos; cero avisos asociados a 238, 706 avisos generales. JSON estricto válido; 14 bloques; 9 ejercicios con IDs únicos, una solución y feedback; diálogo de 8 turnos con traducción en cada turno; 13 fichas; sin audio ni respuesta abierta. Lista intacta, posición 238/301 confirmada y 300 lecciones numeradas presentes.
- **Fuentes consultadas:** [Cambridge Grammar, *despite/in spite of*](https://dictionary.cambridge.org/grammar/british-grammar/in-spite-of...), [*although/even though* y puntuación](https://dictionary.cambridge.org/grammar/british-grammar/although), [conectores y linking adjuncts](https://dictionary.cambridge.org/grammar/british-grammar/conjunctions), [*nevertheless* (significado y pronunciación)](https://dictionary.cambridge.org/dictionary/english/nevertheless), [*anyway*](https://dictionary.cambridge.org/grammar/british-grammar/anyway), [*take pride in*](https://dictionary.cambridge.org/dictionary/english/take-pride-in).
- **Resultado:** correcto tras los cambios; reglas, ejemplos, traducciones y ejercicios no presentan las contradicciones detectadas, y la lección ya comprueba la lectura sin depender de audio.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `239.json`.

### 239/301 — `Idiomas/cursos/en/lessons/239.json`

- **Ruta:** `Idiomas/cursos/en/lessons/239.json`; fuente editable: `_herramientas/cursos/en/34.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** **unless = if not** aparecía sin límite de uso; faltaba distinguir **in case** (precaución) de **if** (condición); **as long as** podía confundirse con su sentido temporal; y **as if + were** se presentaba como regla general. La actividad abierta aceptaba **as long as** aunque su feedback reconocía **provided that** como respuesta equivalente. Un ejercicio era de audio y se preguntaba una ficha sin contexto lector.
- **Cambios realizados:** delimité **unless** a condiciones reales/posibles y al patrón de presente para futuro; contrasté **in case/if**, los sentidos condicional y temporal de **as long as**, y las lecturas hipotética y posible de **as if**. Cambié la pregunta abierta por comprobaciones cerradas con alternativas no ambiguas y sustituí audio por lectura/comprensión de la situación.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones y 42 capítulos; cero avisos asociados a 239, 706 avisos generales. JSON estricto válido; 15 bloques; 9 ejercicios con IDs únicos, una solución y feedback; diálogo de 8 turnos traducidos; 13 fichas; sin audio ni respuesta abierta. Lista intacta, posición 239/301 confirmada y 300 lecciones numeradas presentes.
- **Fuentes consultadas:** [Cambridge Grammar, *unless* y condiciones permitidas](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-other-expressions-), [*as long as* como condición o duración](https://dictionary.cambridge.org/uk/grammar/british-grammar/as-long-), [*in case* frente a *if*](https://dictionary.cambridge.org/uk/grammar/british-grammar/in-case-of), [*as if/as though*](https://dictionary.cambridge.org/grammar/british-grammar/as-if-and-as-), [condicional de futuro y forma verbal](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-).
- **Resultado:** correcto tras los cambios; las expresiones de condición, precaución, duración e hipótesis quedan separadas y practicadas.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `240.json`.

### 240/301 — `Idiomas/cursos/en/lessons/240.json`

- **Ruta:** `Idiomas/cursos/en/lessons/240.json`; fuente editable: `_herramientas/cursos/en/34.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el título prometía una expresión idiomática que la lectura no enseñaba; **idiom** se trataba como si nunca pudiera significar lengua/estilo; la explicación de **prospectus/prospect** ocultaba matices y hacía parecer incorrecto traducir *prospectus* como folleto/prospecto; *reimburse* estaba construido como si se reembolsaran directamente los gastos, sin la persona que los recibe. La lectura aplicaba la cláusula a un «cliente» en vez de la inquilina, asignaba género al agente sin contexto y no se identificaba como caso ficticio. Había un ejercicio de audio, uno de escritura abierta y otro sobre **although** sin relación con la lección.
- **Cambios realizados:** ajusté título e introducción; expliqué los sentidos habitual y formal de **idiom**, di el ejemplo B2 **break the ice**, y diferencié el documento **prospectus** del cliente potencial **prospect** sin negar que ambos tengan traducciones próximas según el contexto. Marqué la historia como ficticia; corregí **reimburse Nina for repair costs**, el uso de *tenant* y la traducción neutral de *agent*. Eliminé la actividad ajena y reemplacé audio/escritura por preguntas cerradas sobre significado y comprensión del texto.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones y 42 capítulos; cero avisos asociados a 240, 706 avisos generales. JSON estricto válido; 14 bloques; 10 ejercicios con IDs únicos, una solución y feedback; lectura de 7 frases traducidas; 33 fichas; sin audio ni respuesta abierta. Lista intacta, posición 240/301 confirmada y 300 lecciones numeradas presentes.
- **Fuentes consultadas:** [Cambridge Dictionary, *idiom* y sus sentidos](https://dictionary.cambridge.org/dictionary/english/idiom), [*break the ice* (B2)](https://dictionary.cambridge.org/dictionary/english/break-the-ice), [*prospectus*](https://dictionary.cambridge.org/dictionary/english/prospectus), [*prospect*: posibilidad y cliente potencial](https://dictionary.cambridge.org/dictionary/english/prospect), [*penalty clause*](https://dictionary.cambridge.org/dictionary/english/penalty-clause), [*reimburse*](https://dictionary.cambridge.org/dictionary/english/reimburse).
- **Resultado:** correcto tras los cambios; las definiciones admiten sus matices reales, los ejemplos de contrato son gramaticales y la comprensión se puede comprobar leyendo.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `241.json`.

### 241/301 — `Idiomas/cursos/en/lessons/241.json`

- **Ruta:** `Idiomas/cursos/en/lessons/241.json`; fuente editable: `_herramientas/cursos/en/34.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco actividades repetían la misma oración; la ficha `career` no aparecía en ningún ejemplo y el bloque de palabras clave quedaba vacío porque todas las fichas eran ocultas. La regla daba **would + verbo** sin mostrar un resultado presente en desarrollo ni diferenciar con claridad el resultado mixto del resultado completamente pasado. Solo había ejemplos gramaticales, sin lectura ni comprensión escrita.
- **Cambios realizados:** delimité el objetivo a una causa irreal pasada con resultado actual; añadí **would/could/might + verbo base**, el resultado progresivo **would be + -ing** y el contraste con **would have + participio** cuando el resultado también es pasado. Retiré la ficha y bloque vacíos; añadí una lectura breve con causa y situación actual, preguntas de comprensión distintas, práctica del patrón progresivo y una comprobación cerrada del contraste temporal.
- **Pruebas/comprobaciones:** compilación completa: 300 lecciones y 42 capítulos; cero avisos asociados a 241, 706 avisos generales. JSON estricto válido; 9 bloques; 7 ejercicios con IDs únicos, una solución y feedback; lectura de 3 frases traducidas; 17 fichas; sin audio ni respuesta abierta. Lista intacta, posición 241/301 confirmada y 300 lecciones numeradas presentes.
- **Fuentes consultadas:** [Cambridge Grammar, condicionales mixtas y resultados presentes](https://dictionary.cambridge.org/grammar/british-grammar/mixed-conditionals), [British Council, condicionales tercera y mixta](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-third-mixed).
- **Resultado:** correcto tras los cambios; los tiempos de la causa y el resultado se practican de manera diferenciada y la lectura verifica comprensión de la situación.
- **Bloqueos/dudas/decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `242.json`.

### 242/301 — `Idiomas/cursos/en/lessons/242.json`

- **Ruta:** `Idiomas/cursos/en/lessons/242.json`; fuente editable: `_herramientas/cursos/en/34.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección repetía casi toda la práctica sobre un solo ejemplo, no incluía comprensión lectora y pedía una respuesta abierta pese a las limitaciones de la aplicación. Su explicación no diferenciaba con suficiente precisión la condición hipotética actual del resultado pasado; además, al introducir un ejemplo con *invested* y *fund* sin fichas, el compilador señalaba vocabulario sin referencia.
- **Cambios realizados:** aclaré el patrón **if + past simple; would have + past participle** y su contraste con la lección anterior **if + past perfect; would + verbo base**. Añadí una lectura breve y traducida que permite identificar la situación real y la hipotética, variedad de ejercicios cerrados y fichas ocultas para el vocabulario necesario. Eliminé la escritura abierta y reduje la repetición.
- **Pruebas o comprobaciones ejecutadas:** compilación completa del curso: 300 lecciones, 42 capítulos y 2333 ejercicios; cero avisos asociados a 242 (707 avisos generales). JSON estricto válido; 11 bloques; 7 ejercicios con IDs únicos y solución/retroalimentación; 4 frases de lectura traducidas; vocabulario de *fund* e *invested* disponible; sin audio ni escritura abierta. Confirmados los 300 JSON numerados y la posición 242/301 en la lista intacta.
- **Fuentes consultadas:** [British Council, *Conditionals: third and mixed*](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-third-mixed) (distingue el patrón presente→pasado y presenta **if + past simple + would have + participle**); [Cambridge Dictionary, *Conditionals: if*](https://dictionary.cambridge.org/grammar/british-grammar/third-conditional) (contraste de estructuras condicionales).
- **Resultado:** correcto tras los cambios; la lectura distingue la condición estable de Leo, su decisión real y el resultado hipotético pasado, con práctica gramatical y comprensión escrita.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `243.json`.
### 243/301 — `Idiomas/cursos/en/lessons/243.json`

- **Ruta:** `Idiomas/cursos/en/lessons/243.json`; fuente editable: `_herramientas/cursos/en/34.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la práctica se repetía sobre la misma oración, no había lectura de comprensión y se pedía escritura abierta. La explicación apenas distinguía **in case** de **provided that/as long as**, sin separar con claridad la precaución anticipada de **if** como condición ni indicar el registro/formas verbales. Había fichas visibles de vocabulario ya enseñado y una forma flexionada de *return* sin ficha.
- **Cambios realizados:** reescribí la explicación en dos segmentos breves; aclaré la preparación anticipada con **in case**, la condición con **if** y el presente simple en cláusulas futuras, y el uso/registro de **provided that/as long as**. Añadí una lectura de cuatro oraciones y seis ejercicios cerrados variados para comprensión, traducción, elección verbal, matiz de registro y equivalencia condicional. Retiré la respuesta abierta y oculté las fichas de contexto ya conocidas; añadí la ficha oculta **returns**.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos y 2333 ejercicios; cero avisos asociados a 243 (707 avisos generales). JSON estricto válido; 10 bloques; 6 ejercicios con IDs únicos, una respuesta correcta/solución y retroalimentación; 4 frases de lectura traducidas; diferenciación de **in case / if / provided that / as long as** presente; sin audio ni escritura abierta. Confirmados los 300 JSON numerados y la posición 243/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *In case (of)*](https://dictionary.cambridge.org/grammar/british-grammar/in-case-of) (precaución anticipada; contraste con **if**); [Cambridge Grammar, *Conditionals: other expressions*](https://dictionary.cambridge.org/grammar/british-grammar/conditionals-other) (condiciones con **provided that**); [Cambridge Grammar, *As long as and so long as*](https://dictionary.cambridge.org/grammar/british-grammar/as-long-) (sentidos condicional y temporal, uso y registro).
- **Resultado:** correcto tras los cambios; la lectura y los ejercicios comprueban comprensión literal y distinción funcional de los conectores sin depender de producción abierta.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `244.json`.
### 244/301 — `Idiomas/cursos/en/lessons/244.json`

- **Ruta:** `Idiomas/cursos/en/lessons/244.json`; fuente editable: `_herramientas/cursos/en/35.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** parte del diálogo y del vocabulario (cálculo, descubrimiento, yacimiento, arqueología) era ajena al objetivo; faltaba comprensión lectora y varias actividades eran audio o escritura abierta. La segunda explicación decía **to be o to have** sin completar ni ejemplificar la forma, mezclaba las dos construcciones y no explicaba bien la concordancia plural ni que el reporte no certifica la verdad de lo dicho.
- **Cambios realizados:** centré la lección en **It + be + participio + that-clause** y **sujeto + be + participio + to-infinitive**, con pares equivalentes, estructura clara, concordancia singular/plural y breve nota de atribución, no certeza. Dejé el infinitivo perfecto para la lección posterior que lo enseña expresamente. Sustituí el diálogo disperso por una lectura breve de cuatro frases y siete actividades cerradas de comprensión, forma, equivalencia y traducción; eliminé audio, escritura abierta y vocabulario irrelevante.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos y 2332 ejercicios; cero avisos asociados a 244 (710 avisos generales). JSON estricto válido; 10 bloques; 7 ejercicios con IDs únicos, una solución y retroalimentación; 4 frases de lectura traducidas; 16 fichas léxicas contextuales; sin audio ni escritura abierta. Confirmados los 300 JSON numerados y la posición 244/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Passive: uses*](https://dictionary.cambridge.org/grammar/british-grammar/passive-uses) (uso impersonal de pasivas de opinión); [Cambridge Grammar, *It as an empty subject*](https://dictionary.cambridge.org/grammar/british-grammar/it-as-empty-subject) (uso anticipatorio/impersonal de *it*); [Cambridge Grammar, *Passive: forms*](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms) (formación y concordancia de la pasiva).
- **Resultado:** correcto tras los cambios; las dos construcciones quedan diferenciadas y el texto permite comprobar su comprensión sin depender de audio ni producción abierta.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `245.json`.
### 245/301 — `Idiomas/cursos/en/lessons/245.json`

- **Ruta:** `Idiomas/cursos/en/lessons/245.json`; fuente editable: `_herramientas/cursos/en/35.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo mezclaba presente continuo, perfecto, modal perfecto, pasado simple y futuro sin una secuencia didáctica; había vocabulario de obras que no aparecía (ladrillo, grava, cemento), actividades de audio y escritura abierta, y un ejercicio de pasado activo ajeno al objetivo. No había comprensión lectora real.
- **Cambios realizados:** limité la lección a tres formas y las expliqué en bloques breves: pasiva continua, pasiva de presente perfecto y pasiva modal perfecta (**should have been / might have been + participio**), con sus usos y concordancia. Añadí una lectura traducida de cuatro frases que distingue acción en curso, acciones ya completadas, expectativa incumplida y posibilidad pasada. Reemplacé actividades dispersas por siete ejercicios cerrados de forma y comprensión; retiré audio, escritura abierta y léxico no utilizado.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos y 2331 ejercicios; cero avisos asociados a 245 (707 avisos generales). JSON estricto válido; 12 bloques; 7 ejercicios con IDs únicos, solución y retroalimentación; 4 frases de lectura traducidas; 18 fichas léxicas; sin audio ni escritura abierta. Confirmados los 300 JSON numerados y la posición 245/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Passive: forms*](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms) (estructura de la pasiva continua, perfecta y modal perfecta); [Cambridge Grammar, *Should*](https://dictionary.cambridge.org/grammar/british-grammar/should) (uso de **should have + participio** para expectativas o acciones ideales del pasado que no ocurrieron).
- **Resultado:** correcto tras los cambios; las tres formas quedan separadas y se practican con ejemplos breves y comprensión de un texto traducido.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `246.json`.
### 246/301 — `Idiomas/cursos/en/lessons/246.json`

- **Ruta:** `Idiomas/cursos/en/lessons/246.json`; fuente editable: `_herramientas/cursos/en/35.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la advertencia sobre **mundane** era demasiado absoluta y una traducción lo convertía en «banal» incluso en un contexto donde «cotidiano y poco interesante» es más natural. La pregunta sobre el cierre se basaba en **after** («después de»), que no establece por sí solo causa. El ejercicio del archivo permitía más de una respuesta; una pregunta sobre lo legible en la escultura presuponía que hubiera visitantes aunque el edificio estaba cerrado. Había audio y escritura abierta, y una tarjeta de vocabulario sin uso.
- **Cambios realizados:** matizé el sentido de **mundane** y su diferencia contextual respecto a **worldly**, y mejoré la traducción del pasaje. Hice explícita la causa del cierre con **because**; di al ejercicio de *archive* una colocación inequívoca; formulé la comprensión lectora sin presuponer visitantes. Aclaré **town hall** (edificio) frente a **council** (órgano municipal), eliminé la tarjeta no usada y reemplacé audio/escritura abierta por comprensión y selección cerradas. Añadí fichas contextuales que faltaban para las referencias señaladas por el compilador.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos y 2331 ejercicios; cero avisos asociados a 246 (704 avisos generales). JSON estricto válido; 13 bloques; 9 ejercicios con IDs únicos, solución y retroalimentación; lectura de 9 frases traducidas (129 palabras); 40 fichas; sin audio ni escritura abierta. Confirmados los 300 JSON numerados y la posición 246/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Dictionary, *mundane*](https://dictionary.cambridge.org/dictionary/english/mundane) (ordinario y normalmente poco interesante); [*worldly*](https://dictionary.cambridge.org/dictionary/english/worldly) (relativo al mundo material/práctico); [*town hall*](https://dictionary.cambridge.org/dictionary/english/town-hall) (edificio municipal); [*council*](https://dictionary.cambridge.org/dictionary/english/council) (órgano o grupo que decide/gobierna).
- **Resultado:** correcto tras los cambios; el texto sostiene las inferencias de comprensión, el vocabulario distingue con más precisión los sentidos y las actividades se pueden realizar leyendo.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `247.json`.
### 247/301 — `Idiomas/cursos/en/lessons/247.json`

- **Ruta:** `Idiomas/cursos/en/lessons/247.json`; fuente editable: `_herramientas/cursos/en/35.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la regla decía **to have + participio** aunque su ejemplo era pasivo y necesitaba **to have been + participio**; no explicaba por qué aparece **been**. Cinco actividades repetían el mismo ejemplo y faltaba una lectura de comprensión. Había una ficha **attribute** no utilizada, respuesta abierta y contexto de guerra sin contexto histórico claro.
- **Cambios realizados:** corregí la fórmula de la pasiva perfecta de infinitivo y contrasté el infinitivo perfecto activo (**to have + participio**) con el pasivo (**to have been + participio**). Reemplacé el escenario impreciso por un caso ficticio breve de museo, con lectura traducida y preguntas que diferencian información atribuida de hecho confirmado. Eliminé vocabulario sin uso y respuesta abierta; añadí siete ejercicios cerrados variados.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos y 2332 ejercicios; cero avisos asociados a 247 (704 avisos generales). JSON estricto válido; 11 bloques; 7 ejercicios con IDs únicos, solución y retroalimentación; 4 frases de lectura traducidas; 13 fichas; sin audio ni escritura abierta. Confirmados los 300 JSON numerados y la posición 247/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Perfect infinitive with to*](https://dictionary.cambridge.org/grammar/british-grammar/infinitive-perfect) (forma y relación temporal del infinitivo perfecto); [Cambridge Grammar, *Passive: forms*](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms) (estructura pasiva); [Cambridge Grammar, *Passive: uses*](https://dictionary.cambridge.org/grammar/british-grammar/passive-uses) (pasivas de verbos de opinión como **believe**, **think** y **say**).
- **Resultado:** correcto tras los cambios; la forma pasiva perfecta y su contraste con el infinitivo activo quedan explicados y evaluados mediante una lectura breve.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `248.json`.
### 248/301 — `Idiomas/cursos/en/lessons/248.json`

- **Ruta:** `Idiomas/cursos/en/lessons/248.json`; fuente editable: `_herramientas/cursos/en/35.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección repetía la misma frase en casi todos los ejercicios y retomaba sin progresión el contraste ya introducido en 244; no contenía lectura de comprensión y pedía escritura abierta. **Unsafe** se traducía como «peligroso», y la ficha **structure** no se usaba.
- **Cambios realizados:** aclaré **It is reported that + oración conjugada** (con *it* impersonal) frente a **sujeto + is/are reported + to-infinitive**, y presenté su equivalencia con ejemplos. Corregí **unsafe** a «no seguro/inseguro», quité la ficha sin uso y el ejercicio abierto. Añadí un aviso ficticio corto y siete ejercicios cerrados para forma, equivalencia y comprensión escrita.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos y 2333 ejercicios; cero avisos asociados a 248 (704 avisos generales). JSON estricto válido; 11 bloques; 7 ejercicios con IDs únicos, solución y retroalimentación; lectura de 3 frases traducidas; 13 fichas; sin audio ni escritura abierta. Confirmados los 300 JSON numerados y la posición 248/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Passive: uses*](https://dictionary.cambridge.org/grammar/british-grammar/passive-uses) (pasivas de verbos de atribución); [Cambridge Grammar, *It as an empty subject*](https://dictionary.cambridge.org/grammar/british-grammar/it-as-empty-subject) (*it* impersonal y su uso con la pasiva); [Cambridge Dictionary, *unsafe*](https://dictionary.cambridge.org/dictionary/english/unsafe) (significado de «no seguro»).
- **Resultado:** correcto tras los cambios; se comprueba la distinción entre patrón impersonal y personal y la comprensión del aviso sin depender de audio ni respuesta abierta.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `249.json`.
### 249/301 — `Idiomas/cursos/en/lessons/249.json`

- **Ruta:** `Idiomas/cursos/en/lessons/249.json`; fuente editable: `_herramientas/cursos/en/35.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** las actividades repetían **She was given a refund** y no practicaban la segunda pasiva que el propio texto enseñaba, con la cosa como sujeto (**A prize was given to her**). No había comprensión lectora y se pedía escritura abierta. La ficha **award** no aparecía en los ejemplos.
- **Cambios realizados:** precisé el patrón activo con dos objetos y sus dos pasivas: persona como sujeto, sin preposición, y cosa como sujeto, con **to + destinatario**. Eliminé la ficha sin uso y creé un caso breve de reclamación en tienda; añadí siete actividades cerradas variadas que practican ambas formas, traducción y comprensión del caso. Eliminé la respuesta abierta.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos y 2334 ejercicios; cero avisos asociados a 249 (704 avisos generales). JSON estricto válido; 11 bloques; 7 ejercicios con IDs únicos, solución y retroalimentación; 4 frases de lectura traducidas; 14 fichas; sin audio ni escritura abierta. Confirmados los 300 JSON numerados y la posición 249/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Passive: forms*](https://dictionary.cambridge.org/grammar/british-grammar/passive-forms) (ambos objetos pueden ser sujeto de pasiva); [Cambridge Grammar, *Objects*](https://dictionary.cambridge.org/grammar/british-grammar/objects) (distinción entre objeto indirecto y directo).
- **Resultado:** correcto tras los cambios; el texto y los ejercicios permiten comprobar cuándo se antepone la persona y cuándo la cosa.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `250.json`.
### 250/301 — `Idiomas/cursos/en/lessons/250.json`

- **Ruta:** `Idiomas/cursos/en/lessons/250.json`; fuente editable: `_herramientas/cursos/en/36.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el JSON compilado estaba desactualizado respecto a una edición previa de la fuente; la lección mezclaba los patrones con ejemplos poco conectados, ejercicios repetitivos y vocabulario ajeno al objetivo. No tenía una lectura con preguntas de comprensión y practicaba de forma desigual **remember/forget/try/regret + -ing/to**. Una primera compilación del nuevo ejercicio combinado detectó sintaxis de dos huecos no admitida por el formato; se sustituyó por una pregunta cerrada de opción múltiple.
- **Cambios realizados:** sincronicé y regeneré la lección; aclaré las diferencias de significado de **stop**, **remember**, **forget**, **try** y **regret** con **-ing/to**; acoté **regret + to** a fórmulas formales de anuncio como *regret to inform*. Añadí una lectura breve traducida y actividades cerradas para practicar forma, significado y comprensión. Retiré vocabulario duplicado o irrelevante y actividades de audio/escritura abierta.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos, 2315 palabras, 2335 ejercicios y 708 avisos generales; cero avisos asociados a 250. JSON estricto válido; 10 ejercicios con IDs únicos, tres opciones y una respuesta correcta cada uno; cuatro frases de lectura bilingües; sin audio ni escritura abierta. Confirmé que los 300 JSON numerados parsean y que 250 ocupa la posición 250/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Verb patterns: verb + infinitive or verb + -ing?*](https://dictionary.cambridge.org/grammar/british-grammar/verbs-followed-by-ing-or-infinitive); [Cambridge Grammar, *Stop + -ing form or to-infinitive*](https://dictionary.cambridge.org/us/grammar/british-grammar/stop-ing-form-or-to-infinitive); [Cambridge Dictionary, *regret*](https://dictionary.cambridge.org/dictionary/english/regret). Las páginas gramaticales oficiales de Cambridge sustentan los cambios de significado de **stop/remember/try** y Cambridge marca como formal el patrón **regret + to-infinitive**.
- **Resultado:** correcto tras los cambios; los ejercicios ahora distinguen los dos significados y la lectura breve permite comprobar comprensión del patrón en contexto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `251.json`.

### 251/301 — `Idiomas/cursos/en/lessons/251.json`

- **Ruta:** `Idiomas/cursos/en/lessons/251.json`; fuente editable: `_herramientas/cursos/en/36.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación distinguía de manera muy escueta las tres expresiones, pero no aclaraba que **used to** también describe estados ni que **be/get used to** pueden llevar un nombre o pronombre además de **-ing**. Omitía las formas interrogativa y negativa de **used to**. El diálogo acumulaba ejemplos poco conectados, y «Get used to the habit» era una combinación poco natural; varios términos del vocabulario no eran prioritarios y había una actividad de audio y una respuesta abierta.
- **Cambios realizados:** reescribí las explicaciones para diferenciar el hábito/estado pasado, el estado de familiaridad y el proceso de acostumbrarse; añadí **Did ... use to...?** y **didn't use to**. Reemplacé el diálogo por una lectura breve traducida sobre un cambio de turno, con comprensión lectora y práctica cerrada de las tres formas, además de una lista léxica reducida y pertinente. Eliminé audio y escritura abierta.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos, 2308 palabras, 2337 ejercicios y 709 avisos generales; cero avisos asociados a 251. JSON estricto válido; 10 ejercicios con IDs únicos, tres opciones y una respuesta correcta cada uno; cinco frases bilingües; sin audio ni escritura abierta. Confirmé que los 300 JSON numerados parsean y que 251 ocupa la posición 251/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Used to*](https://dictionary.cambridge.org/grammar/british-grammar/used-to) (acciones o estados pasados, preguntas/negativas y contraste con **be used to**); [British Council LearnEnglish, *Different uses of used to*](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2-grammar/different-uses-used-to) (**used to + infinitive** frente a **be/get used to + nombre o -ing**).
- **Resultado:** correcto tras los cambios; las estructuras se explican y practican de forma contrastiva en contexto, con comprensión de lectura.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `252.json`.

### 252/301 — `Idiomas/cursos/en/lessons/252.json`

- **Ruta:** `Idiomas/cursos/en/lessons/252.json`; fuente editable: `_herramientas/cursos/en/36.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección etiquetaba **argument** como falso amigo sin destacar suficientemente que también significa «argumento/razones»; equiparaba **overseas** con «al otro lado del mar» sin matizar el uso general de «en otros países»; mezclaba **settle** y **settle in**. El diálogo largo acumulaba vocabulario, pero **friendship** y **adventure** no aparecían, y había actividades duplicadas sobre el mismo sentido de *argument*, una pregunta sobre *visa* sin presentar la palabra y actividades de audio y escritura abierta.
- **Cambios realizados:** precisé los dos sentidos de **argument** y el papel del contexto; aclaré el uso de **abroad** sin *to*, el alcance de **overseas**, y la diferencia entre **settle somewhere** y **settle in**. Ajusté traducciones, reduje el vocabulario activo y convertí el diálogo en una lectura breve. Añadí ejercicios cerrados de vocabulario, ambos sentidos de *argument* y comprensión lectora; eliminé audio y respuesta abierta.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos, 2304 palabras, 2338 ejercicios y 708 avisos generales; cero avisos asociados a 252. JSON estricto válido; 10 ejercicios con IDs únicos y soluciones; ocho frases bilingües; sin audio ni escritura abierta. Confirmé que los 300 JSON numerados parsean y que 252 ocupa la posición 252/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Dictionary, *argument*](https://dictionary.cambridge.org/dictionary/english/argument) (sentidos de desacuerdo y razones); [Cambridge Dictionary, *abroad*](https://dictionary.cambridge.org/dictionary/english/abroad) (uso en/hacia otro país y construcción gramatical); [Cambridge Dictionary, *overseas*](https://dictionary.cambridge.org/dictionary/english/overseas) (uso general referido a otros países y matiz «across the sea»); [Cambridge Dictionary, *settle in*](https://dictionary.cambridge.org/dictionary/english/settle-in) (acostumbrarse a un lugar nuevo y sentirse cómodo allí).
- **Resultado:** correcto tras los cambios; el vocabulario ya no induce equivalencias rígidas y la lectura se evalúa con preguntas cerradas de detalle e inferencia.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `253.json`.

### 253/301 — `Idiomas/cursos/en/lessons/253.json`

- **Ruta:** `Idiomas/cursos/en/lessons/253.json`; fuente editable: `_herramientas/cursos/en/36.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección explicaba la diferencia entre **would** y **used to**, pero no advertía que **would** no suele usarse en preguntas o negativas para hábitos pasados ni que el pasado simple también puede describir rutinas. Incluía **routinely** en el vocabulario sin usarlo en el texto. La traducción de *When I was a child* fijaba innecesariamente el género del narrador como masculino y había pocas preguntas de lectura.
- **Cambios realizados:** aclaré el marco pasado requerido, la diferencia con estados y el uso del pasado simple; añadí una nota breve sobre las formas interrogativas y negativas. Quité el término léxico sin uso, neutralicé la traducción inicial y añadí dos actividades cerradas para comprensión del texto y distinción del pasado simple.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos, 2303 palabras, 2340 ejercicios y 707 avisos generales; cero avisos asociados a 253. JSON estricto válido; ocho ejercicios con IDs únicos y solución; cinco frases bilingües; sin audio ni escritura abierta. Confirmé que los 300 JSON numerados parsean y que 253 ocupa la posición 253/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Would*](https://dictionary.cambridge.org/grammar/british-grammar/would) (acciones habituales narrativas, no estados); [British Council LearnEnglish, *Past habits: used to, would and the past simple*](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2-grammar/past-habits-used-to-would-past-simple) (hábitos, estados, pasado simple y restricciones de preguntas/negativas con **would**).
- **Resultado:** correcto tras los cambios; la explicación y las actividades diferencian las formas sin sugerir que **would** sea la única opción para rutinas pasadas.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `254.json`.

### 254/301 — `Idiomas/cursos/en/lessons/254.json`

- **Ruta:** `Idiomas/cursos/en/lessons/254.json`; fuente editable: `_herramientas/cursos/en/36.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cinco actividades repetían casi literalmente **He stopped to send a message**; no se practicaba **stop + -ing**, que expresa que una actividad cesa. La lección no incluía lectura ni comprensión lectora y pedía una respuesta escrita abierta; **purpose** e **interrupt** estaban en el vocabulario pero no se trabajaban en contexto.
- **Cambios realizados:** sustituí las repeticiones por una explicación contrastiva y una breve lectura sobre dejar de mirar el móvil y hacer una pausa para responder a un mensaje. Añadí nueve actividades cerradas que practican ambos patrones y comprueban detalles de lectura; centré el vocabulario en *pavement* y *urgent* y retiré la actividad abierta.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos, 2303 palabras, 2343 ejercicios y 707 avisos generales; cero avisos asociados a 254. JSON estricto válido; nueve ejercicios con IDs únicos y soluciones; cuatro frases bilingües; sin audio ni escritura abierta. Confirmé que los 300 JSON numerados parsean y que 254 ocupa la posición 254/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Stop + -ing form or to-infinitive*](https://dictionary.cambridge.org/grammar/british-grammar/stop-ing-form-or-to-) y [British Council LearnEnglish, *Verbs followed by -ing or infinitive to change meaning*](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/verbs-followed-ing-or-infinitive-change-meaning) (contraste entre cesar una actividad y parar con el propósito de hacer otra); [Cambridge Dictionary, *pavement*](https://dictionary.cambridge.org/dictionary/english/pavement) (uso británico «acera» frente al uso estadounidense «superficie de la calzada»; en EE. UU. se usa *sidewalk* para «acera»).
- **Resultado:** correcto tras los cambios; ambos patrones reciben práctica contrastiva y la historia permite verificar su sentido en contexto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `255.json`.

### 255/301 — `Idiomas/cursos/en/lessons/255.json`

- **Ruta:** `Idiomas/cursos/en/lessons/255.json`; fuente editable: `_herramientas/cursos/en/36.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** casi todas las actividades repetían **Please remember to include the attachment** y practicaban solo **remember + to**; el patrón **remember + -ing** apenas se definía y no se comprobaba. No había lectura ni comprensión lectora y se pedía escritura abierta. **Remind** aparecía como vocabulario, aunque no se utilizaba.
- **Cambios realizados:** precisé que **remember + -ing** evoca una acción pasada y que **remember + to + verbo** se refiere a recordar una tarea; añadí una lectura breve de correo que ilustra ambos casos, incluida la diferencia entre no recordar si algo ocurrió y recordar una tarea para hacerla. Sustituí las repeticiones por nueve actividades cerradas de gramática, traducción y comprensión y eliminé el término léxico sin uso y la actividad abierta.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos, 2305 palabras, 2346 ejercicios y 707 avisos generales; cero avisos asociados a 255. JSON estricto válido; nueve ejercicios con IDs únicos y soluciones; cinco frases bilingües; sin audio ni escritura abierta. Confirmé que los 300 JSON numerados parsean y que 255 ocupa la posición 255/301 en la lista intacta.
- **Fuentes consultadas:** [Cambridge Grammar, *Verb patterns: verb + infinitive or verb + -ing?*](https://dictionary.cambridge.org/grammar/british-grammar/verb-patterns-verb-infinitive) y [British Council LearnEnglish, *Verbs followed by -ing or infinitive to change meaning*](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/verbs-followed-ing-or-infinitive-change-meaning). Ambas fuentes distinguen **remember + -ing** como recuerdo de una acción pasada y **remember + to + infinitive** como recordar hacer una tarea.
- **Resultado:** correcto tras los cambios; la lectura y los ejercicios cubren los dos significados sin confundir «no recordar si ocurrió» con «olvidarse de hacerlo».
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `256.json`.

### 256/301 — `Idiomas/cursos/en/lessons/256.json`

- **Ruta:** `Idiomas/cursos/en/lessons/256.json`; fuente editable: `_herramientas/cursos/en/36.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** aunque el título prometía contrastar **used to** y **be used to**, el material se centraba casi por completo en *be used to working night shifts* y repetía esa misma oración en varias actividades. No había lectura ni comprensión lectora y se pedía una respuesta escrita abierta. **Familiar** se glosaba como «conocido» sin contexto, y **shift** duplicaba vocabulario ya aprendido.
- **Cambios realizados:** construí un contraste paralelo entre una rutina pasada en Londres (**used to take**) y la familiaridad actual con el trayecto (**be used to + nombre/-ing**). Añadí una lectura breve y diez actividades cerradas variadas, incluyendo comprensión del cambio de rutina y el uso británico de *the underground*. Retiré las fichas duplicadas y la actividad abierta.
- **Pruebas o comprobaciones ejecutadas:** compilación completa: 300 lecciones, 42 capítulos, 2304 palabras, 2350 ejercicios y 707 avisos generales; cero avisos asociados a 256. JSON estricto válido; diez ejercicios con IDs únicos y soluciones; cuatro frases bilingües; sin audio ni escritura abierta. Confirmé que los 300 JSON numerados parsean y que 256 ocupa la posición 256/301 en la lista intacta.
- **Fuentes consultadas:** [British Council LearnEnglish, *Different uses of used to*](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2-grammar/different-uses-of-used-to) (contraste entre **used to + infinitive** y **be used to + nombre/pronombre/-ing**); [Cambridge Grammar, *Word choice: used to and be used to*](https://dictionary.cambridge.org/grammar/british-grammar/word-choice-used-to-and-be-used-to); [Cambridge Dictionary, *underground*](https://dictionary.cambridge.org/dictionary/english/underground) (el sustantivo británico **the underground** para el sistema de trenes urbanos subterráneos).
- **Resultado:** correcto tras los cambios; los dos patrones se distinguen con significado, forma y lectura en contexto.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.
- **Siguiente archivo pendiente:** `257.json`.

### 257/301 — `Idiomas/cursos/en/lessons/257.json`
- **Ruta:** `Idiomas/cursos/en/lessons/257.json`; fuente sincronizada: `_herramientas/cursos/en/36.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis ejercicios practicaban casi la misma frase con *would*; faltaba lectura auténtica con comprensión, contraste claro con pasado simple y práctica de suceso único; había escritura libre que el formato de la app no puede corregir de forma fiable.
- **Cambios realizados:** precisé el uso narrativo de *would + verbo base*, sus límites con estados, preguntas y negativas, y el contraste con pasado simple y *used to*. Añadí una lectura breve de cuatro frases y diez actividades cerradas de forma y comprensión. Retiré escritura libre y oculté vocabulario repetido de unidades anteriores.
- **Pruebas/comprobaciones ejecutadas:** compilación oficial del curso inglés; parseo estricto de los 300 JSON numéricos; comprobación de 10 ejercicios con IDs únicos, tres opciones y una respuesta correcta cada uno; lectura bilingüe de cuatro líneas; orden 257/301; ausencia de audio y respuestas abiertas.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2305 palabras, 2354 ejercicios, 707 avisos globales y ninguno atribuido a la lección 257. La validación estructural pasó.
- **Fuentes consultadas:** [Cambridge Grammar: Would](https://dictionary.cambridge.org/grammar/british-grammar/would); [British Council: Past habits](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2-grammar/past-habits-used-to-would-past-simple).
- **Bloqueos/dudas/pendientes:** ninguno.

- Último archivo completado: `257.json`.
- Siguiente archivo pendiente: `258.json`.

### 258/301 — `Idiomas/cursos/en/lessons/258.json`
- **Ruta:** `Idiomas/cursos/en/lessons/258.json`; fuente sincronizada: `_herramientas/cursos/en/37.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo mezclaba participantes y deducciones incompatibles sin contexto; la práctica repetía traducciones y huecos, sin comprensión de lectura; faltaba distinguir deducción con **must have** de obligación pasada con **had to**; había audio y escritura libre; parte del vocabulario carecía de uso coherente.
- **Cambios realizados:** reescribí la explicación para diferenciar deducción fuerte, posibilidad y deducción negativa; añadí contraste con **had to** y matizé la forma negativa para no tratar **mustn't** como negativo directo universal. Sustituí el diálogo por una lectura breve de cinco líneas con indicios claros y añadí nueve actividades cerradas sobre forma, significado y comprensión. Sincronicé vocabulario, retiré audio y escritura abierta.
- **Pruebas/comprobaciones ejecutadas:** compilación oficial de inglés; parseo estricto de las 300 lecciones numéricas; verificación de 9 actividades con IDs únicos, tres opciones y una respuesta correcta; comprobación de una lectura de cinco líneas bilingües, ausencia de actividades de audio/escritura libre y posición 258/301.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2299 palabras, 2355 ejercicios y 706 avisos globales; ninguno atribuido a la lección 258. Validación estructural satisfactoria.
- **Fuentes consultadas:** [Cambridge Grammar: Must](https://dictionary.cambridge.org/grammar/british-grammar/must); [British Council: Modals, deductions about the past](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-past); [British Council: explicación y matices de la forma negativa](https://learnenglish.britishcouncil.org/comment/189888).
- **Bloqueos/dudas/pendientes:** ninguno.

- Último archivo completado: `258.json`.
- Siguiente archivo pendiente: `259.json`.

### 259/301 — `Idiomas/cursos/en/lessons/259.json`
- **Ruta:** `Idiomas/cursos/en/lessons/259.json`; fuente sincronizada: `_herramientas/cursos/en/37.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo yuxtaponía decisiones y arrepentimientos sin explicar qué ocurrió; faltaba lectura y comprensión; la explicación presentaba **could have** como alternativa no elegida sin matizar que eso depende del contexto; la traducción de **needn't have** no dejaba claro que la acción sí ocurrió; había audio y actividad de escritura libre.
- **Cambios realizados:** aclaré **should have** (lo que habría sido mejor, a menudo no realizado), **could have** (posibilidad pasada; el contexto decide si se realizó) y **needn't have** (acción realizada pero innecesaria). Añadí contraste breve con **didn't need to**, lectura bilingüe de cinco líneas y nueve actividades cerradas de gramática y comprensión; retiré audio/escritura libre y añadí las fichas de vocabulario que faltaban.
- **Pruebas/comprobaciones ejecutadas:** compilador oficial inglés; parseo estricto de las 300 lecciones; 9 actividades con IDs únicos, tres opciones y exactamente una correcta; una lectura bilingüe de cinco líneas; sin bloques de audio, ordenar ni escritura abierta; posición 259/301.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2291 palabras, 2356 ejercicios y 708 avisos globales; sin avisos asignados a 259. Validación estructural satisfactoria.
- **Fuentes consultadas:** [Cambridge Grammar: Should](https://dictionary.cambridge.org/grammar/british-grammar/should); [Cambridge Grammar: Could](https://dictionary.cambridge.org/grammar/british-grammar/could%3A); [Cambridge Grammar: Need](https://dictionary.cambridge.org/grammar/british-grammar/need); [Cambridge Grammar: Modality and past time](https://dictionary.cambridge.org/grammar/british-grammar/modality-tense).
- **Bloqueos/dudas/pendientes:** ninguno.

- Último archivo completado: `259.json`.
- Siguiente archivo pendiente: `260.json`.

### 260/301 — `Idiomas/cursos/en/lessons/260.json`
- **Ruta:** `Idiomas/cursos/en/lessons/260.json`; fuente sincronizada: `_herramientas/cursos/en/37.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el informe presentaba como falso amigo absoluto **particular**, aunque tiene usos relacionados en español; **gross** se trataba como si nunca pudiera significar «ofensivo» sin indicar variedad (Cambridge registra esa acepción en inglés estadounidense informal); el peso bruto de una bolsa no aportaba nada a la investigación; el testigo, la bolsa y la conclusión no quedaban suficientemente relacionados; había actividades de audio, ordenar y escritura abierta.
- **Cambios realizados:** reorienté el título a precisión léxica y matizé **particular** por contexto, además de distinguir los sentidos británicos y estadounidenses de **gross**. Conservé **gross weight** como ejemplo independiente y expliqué **footprint/footage/fingerprint**. Reescribí el informe en seis frases breves con pistas y límites explícitos, añadí comprensión cerrada y retiré audio, ordenar y escritura abierta; añadí fichas de apoyo ocultas.
- **Pruebas/comprobaciones ejecutadas:** compilación oficial inglesa; parseo estricto de 300 JSON; 9 ejercicios con IDs únicos, tres opciones y una respuesta correcta; lectura bilingüe de seis líneas; ausencia de actividades no compatibles; orden 260/301.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2288 palabras, 2356 ejercicios, 707 avisos globales y ninguno asociado a 260. Validación estructural satisfactoria.
- **Fuentes consultadas:** [Cambridge Dictionary: particular](https://dictionary.cambridge.org/dictionary/english/particular); [Cambridge Dictionary: gross](https://dictionary.cambridge.org/dictionary/english/gross); [Cambridge Dictionary: gross weight](https://dictionary.cambridge.org/dictionary/english/gross-weight); [Cambridge Dictionary: footage](https://dictionary.cambridge.org/dictionary/english/footage); [Cambridge Dictionary: footprint](https://dictionary.cambridge.org/dictionary/english/footprint).
- **Bloqueos/dudas/pendientes:** ninguno.

- Último archivo completado: `260.json`.
- Siguiente archivo pendiente: `261.json`.

### 261/301 — `Idiomas/cursos/en/lessons/261.json`
- **Ruta:** `Idiomas/cursos/en/lessons/261.json`; fuente sincronizada: `_herramientas/cursos/en/37.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** era un resumen duplicado muy corto de **must/might/can't have**, con dos ejercicios idénticos y un solo ejemplo; no distinguía una posibilidad de que algo no ocurriera (**might not have**) de una deducción negativa fuerte (**can't have**). Incluía audio, ordenar y escritura abierta.
- **Cambios realizados:** convertí la lección en un microtema complementario sobre **might not have** frente a **can't have**, con evidencia de distinto grado, lectura breve sobre una señal y un puente bloqueado, y siete ejercicios cerrados de gramática y comprensión. Retiré actividades incompatibles y añadí fichas de apoyo ocultas.
- **Pruebas/comprobaciones ejecutadas:** compilador oficial inglés; parseo estricto de las 300 lecciones numéricas; 7 actividades con IDs únicos, tres opciones y una respuesta correcta; cuatro frases bilingües; sin audio, ordenar ni escritura libre; orden 261/301.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2288 palabras, 2357 ejercicios y 704 avisos globales; ninguno atribuido a 261. Validación estructural satisfactoria.
- **Fuentes consultadas:** [British Council: Modals—deductions about the past](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-past); [British Council: Modals with “have”](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/modals-have); [Cambridge Grammar: Must](https://dictionary.cambridge.org/grammar/british-grammar/must); [Cambridge Grammar: Could](https://dictionary.cambridge.org/grammar/british-grammar/could%3A).
- **Bloqueos/dudas/pendientes:** ninguno.

- Último archivo completado: `261.json`.
- Siguiente archivo pendiente: `262.json`.

### 262/301 — `Idiomas/cursos/en/lessons/262.json`
- **Ruta:** `Idiomas/cursos/en/lessons/262.json`; fuente sincronizada: `_herramientas/cursos/en/37.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección duplicaba el ejemplo y los dos ejercicios de rellenar de 259, pero no incluía un contexto que mostrara la diferencia entre acción realizada y acción no realizada; además tenía actividad de ordenar y respuesta escrita abierta.
- **Cambios realizados:** centré la unidad en el contraste contextual: **needn't have + participio** para acción realizada e innecesaria; **didn't need to + verbo base** para falta de necesidad, sin que la forma sola indique si se realizó. Añadí ejemplos explícitos para ambos resultados, lectura breve de cuatro frases y ocho actividades cerradas variadas. Quité ordenar y escritura abierta; limpié y oculté vocabulario de apoyo.
- **Pruebas/comprobaciones ejecutadas:** compilación oficial inglesa; parseo estricto de todas las 300 lecciones numéricas; 8 actividades con IDs únicos, tres opciones y una correcta; lectura bilingüe de cuatro frases; ausencia de audio, ordenar y respuesta libre; posición 262/301.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2287 palabras, 2359 ejercicios, 704 avisos globales y ninguno asignado a 262. Validación estructural satisfactoria.
- **Fuentes consultadas:** [Cambridge Grammar: Need—acciones innecesarias y pasado](https://dictionary.cambridge.org/grammar/british-grammar/need); [Cambridge Dictionary: Need—contraste contextual](https://dictionary.cambridge.org/dictionary/english/need).
- **Bloqueos/dudas/pendientes:** ninguno.

- Último archivo completado: `262.json`.
- Siguiente archivo pendiente: `263.json`.

### 263/301 — `Idiomas/cursos/en/lessons/263.json`
- **Ruta:** `Idiomas/cursos/en/lessons/263.json`; fuente sincronizada: `_herramientas/cursos/en/37.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** era una lección mínima duplicada del patrón de 259, repetía dos veces el mismo hueco, no ejercitaba **could have** ni el vocabulario *regret* y carecía de lectura. Había ordenar y escritura abierta; un ejercicio confundía una alternativa posible con lo aconsejable.
- **Cambios realizados:** reformulé la lección para contrastar **should have** como lo mejor que no se hizo (sin negar otros usos de expectativa) con **could have** como posibilidad pasada que, según el contexto, puede ser reproche. Añadí lectura bilingüe de cinco frases sobre perder un tren y alternativas, más nueve ejercicios cerrados. Eliminé actividades incompatibles y completé vocabulario de apoyo.
- **Pruebas/comprobaciones ejecutadas:** compilador oficial inglés; parseo estricto de las 300 lecciones; 9 actividades con IDs únicos, tres opciones y una respuesta correcta; lectura de cinco frases bilingües; sin audio, ordenar ni escritura abierta; posición 263/301.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2289 palabras, 2362 ejercicios, 704 avisos globales y ninguno asignado a 263. Validación estructural satisfactoria.
- **Fuentes consultadas:** [Cambridge Grammar: Should](https://dictionary.cambridge.org/grammar/british-grammar/should); [Cambridge Grammar: Could](https://dictionary.cambridge.org/grammar/british-grammar/could%3A); [Cambridge Grammar: Modality and past time](https://dictionary.cambridge.org/grammar/british-grammar/modality-tense).
- **Bloqueos/dudas/pendientes:** ninguno.

- Último archivo completado: `263.json`.
- Siguiente archivo pendiente: `264.json`.

### 264/301 — `Idiomas/cursos/en/lessons/264.json`
- **Ruta:** `Idiomas/cursos/en/lessons/264.json`; fuente sincronizada: `_herramientas/cursos/en/38.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación se acercaba a una regla obligatoria con **by the time** y presentaba **after/before** demasiado rígidamente; el diálogo encadenaba muchos pasados perfectos sin puntos de referencia útiles; varios términos de vocabulario estaban sin usar; había audio, ordenar y escritura abierta. El título no correspondía al ejemplo final tras la reorganización.
- **Cambios realizados:** aclaré que **had + participio** relaciona un hecho anterior con otro punto pasado y que **after/before** pueden bastar para secuencias claras. Reemplacé el diálogo por una lectura breve de cinco frases que deja explícita la cronología, nueve ejercicios cerrados de forma, uso y comprensión, y vocabulario pertinente. Eliminé actividades incompatibles y alineé el título con el texto.
- **Pruebas/comprobaciones ejecutadas:** compilación oficial inglesa; parseo estricto de las 300 lecciones numéricas; 9 actividades con IDs únicos, tres opciones y una respuesta correcta; lectura bilingüe de cinco frases; ausencia de audio, ordenar y escritura abierta; posición 264/301.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2280 palabras, 2363 ejercicios y 704 avisos globales; ninguno asignado a 264. Validación estructural satisfactoria.
- **Fuentes consultadas:** [British Council: Past perfect](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/past-perfect); [Cambridge Grammar: By the time](https://dictionary.cambridge.org/grammar/british-grammar/by); [British Council: cuándo puede bastar el pasado simple con conectores](https://learnenglish.britishcouncil.org/comment/180529).
- **Bloqueos/dudas/pendientes:** ninguno.

- Último archivo completado: `264.json`.
- Siguiente archivo pendiente: `265.json`.


### 265/301 — `Idiomas/cursos/en/lessons/265.json`
- **Ruta:** `Idiomas/cursos/en/lessons/265.json`; fuente editable: `_herramientas/cursos/en/38.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación del presente perfecto continuo lo limitaba demasiado a acciones que siguen ocurriendo, sin cubrir actividades recién terminadas con evidencia presente. Faltaba distinguir claramente `since` (punto de inicio) y `for` (duración), así como recordar que verbos de estado como `know` suelen usar el perfecto simple. La lectura anterior no daba suficiente contexto para contrastar el presente con un punto de referencia pasado; algunas preguntas y vocabulario no reforzaban bien el objetivo. Había actividades incompatibles con las limitaciones de la app.
- **Cambios realizados:** se precisaron ambos tiempos, su punto de referencia, la duración, `since/for`, el uso con verbos de estado y la lectura de actividades recién terminadas. Se sustituyó la lectura por una situación coherente de reforma doméstica con cinco frases bilingües y se dejaron ocho ejercicios cerrados, breves y con respuesta y explicación. Se retiraron audio, escritura abierta y ordenación.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis JSON de las 300 lecciones; comprobación de ocho ejercicios con identificadores únicos, tres opciones y exactamente una respuesta correcta por ejercicio; comprobación de cinco frases con inglés y español; verificación de posición 265/301 en la lista. Consulta gramatical con fuentes de Cambridge English Grammar y British Council.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.275 palabras, 2.363 ejercicios y 704 avisos globales; sin aviso ni error específico de la lección 265. Los 300 JSON se pueden analizar y las verificaciones estructurales de esta lección pasan.
- **Fuentes consultadas:** [Cambridge Grammar: present perfect simple or continuous](https://dictionary.cambridge.org/us/grammar/british-grammar/present-perfect-simple-or-present-perfect-continuous), [Cambridge Grammar: past perfect continuous](https://dictionary.cambridge.org/grammar/british-grammar/past-perfect-continuous), [British Council: present perfect simple and continuous](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/present-perfect-simple-continuous).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; conviene que la revisión final de hablantes nativos confirme naturalidad y adecuación pedagógica.


### 266/301 — `Idiomas/cursos/en/lessons/266.json`
- **Ruta:** `Idiomas/cursos/en/lessons/266.json`; fuente editable: `_herramientas/cursos/en/38.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el título no describía el texto; la ficha de **novel** podía sugerir que significa simplemente «nuevo», aunque como adjetivo significa «novedoso/original». **Costume** necesitaba distinguir el traje teatral de un disfraz, y la traducción de **one costume** como «un vestuario» resultaba ambigua. La lectura tenía una combinación de palabras sin ficha (**loud applause**). Había un ejercicio marcado como escucha y otro de respuesta abierta, poco adecuados para las capacidades priorizadas por la app, además de una tarea de ordenación prescindible para mantener la lección breve.
- **Cambios realizados:** el título ahora resume la adaptación de una novela al teatro. Se afinó la explicación de **novel** y la ficha de **costume**, y se hizo más clara la traducción del traje reparado. Se sustituyó la expresión no enseñada por **praised the cast**, alineando también la pregunta inferencial. El ejercicio de escucha se convirtió en traducción textual, se quitó la respuesta abierta y se reemplazó por selección múltiple; se retiró la ordenación. Quedaron nueve ejercicios cerrados y una lectura de ocho frases bilingües.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 300 JSON; comprobación de nueve ejercicios con identificadores únicos, tres opciones y exactamente una respuesta correcta por ejercicio; verificación de ocho frases bilingües y de la posición 266/301 en la lista.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.275 palabras, 2.362 ejercicios y 703 avisos globales; sin aviso ni error específico de la lección 266. Los 300 JSON se pueden analizar y las verificaciones estructurales de esta lección pasan.
- **Fuentes consultadas:** Cambridge Dictionary: [novel](https://dictionary.cambridge.org/dictionary/english/novel), [bachelor](https://dictionary.cambridge.org/dictionary/english/bachelor), [bachelor's degree](https://dictionary.cambridge.org/dictionary/english/bachelor-s-degree), [box office](https://dictionary.cambridge.org/dictionary/english/box-office), [costume](https://dictionary.cambridge.org/dictionary/english/costume), [cast](https://dictionary.cambridge.org/dictionary/english/cast), [premiere](https://dictionary.cambridge.org/dictionary/english/premiere).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; conviene que la revisión final de hablantes nativos confirme naturalidad y adecuación pedagógica.


### 267/301 — `Idiomas/cursos/en/lessons/267.json`
- **Ruta:** `Idiomas/cursos/en/lessons/267.json`; fuente editable: `_herramientas/cursos/en/38.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección tenía solo seis actividades y una era respuesta abierta; no practicaba la lectura del diálogo ni contrastaba el uso con verbos de estado o la cláusula temporal con **by the time**. El contraste simple/continuo usaba un ejemplo demasiado aislado. La fecha límite del diálogo (fin de mayo) no encajaba claramente con completar la primera fase para junio. Una ayuda en español traducía literalmente una estructura que requiere una formulación más natural.
- **Cambios realizados:** se amplió brevemente la explicación para incluir afirmativa, negativa, pregunta, contraste de resultado/duración, verbos de estado y presente simple después de **by the time** cuando se refiere al futuro. Se alinearon los ejemplos con esos puntos. Se armonizaron la fecha límite y la cronología del diálogo, y se corrigió la ayuda de traducción. La respuesta abierta se reemplazó por selección múltiple y se añadieron práctica del verbo de estado, la cláusula temporal y una pregunta de comprensión sobre la prórroga. Quedaron nueve actividades cerradas y seis turnos bilingües.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 300 JSON; comprobación de nueve actividades con IDs únicos, tres opciones y una sola respuesta correcta cada una; verificación de seis turnos bilingües y posición 267/301 en la lista.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.275 palabras, 2.365 ejercicios y 703 avisos globales; sin aviso ni error específico de la lección 267. Los 300 JSON se pueden analizar y las comprobaciones estructurales de esta lección pasan.
- **Fuentes consultadas:** [Cambridge Grammar: future perfect simple](https://dictionary.cambridge.org/us/grammar/british-grammar/future-perfect), [Cambridge Grammar: future perfect continuous](https://dictionary.cambridge.org/grammar/british-grammar/future-perfect-continuous), [British Council: future continuous and future perfect](https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar/future-continuous-and-future-perfect).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; queda la revisión final de hablantes nativos para validar naturalidad y adecuación pedagógica.


### 268/301 — `Idiomas/cursos/en/lessons/268.json`
- **Ruta:** `Idiomas/cursos/en/lessons/268.json`; fuente editable: `_herramientas/cursos/en/38.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección contenía solo tres palabras de vocabulario y repetía la misma oración en casi todos los ejercicios; no ofrecía una lectura breve ni comprensión lectora. La diferencia entre simple y continuo era demasiado esquemática y no aclaraba que el enfoque depende del contexto, que el continuo también puede explicar un resultado pasado, ni el uso normal del simple con verbos de estado. No se practicaban **for/since**; había ordenación y producción abierta, además de preguntas duplicadas.
- **Cambios realizados:** se precisó la forma y el uso de ambos tiempos, las formas negativa e interrogativa, el contraste de enfoque, el uso con verbos de estado y **for/since**. Se creó una lectura bilingüe de cinco frases sobre una mañana lluviosa, seguida de nueve ejercicios breves cerrados sobre forma, duración y detalles del texto. Se eliminaron las tareas abiertas y de ordenación repetitivas.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 300 JSON; validación de nueve actividades con IDs únicos, tres opciones y una única respuesta correcta cada una; comprobación de cinco frases bilingües y del orden 268/301 en la lista.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.275 palabras, 2.368 ejercicios y 703 avisos globales; sin aviso ni error específico de la lección 268. Los 300 JSON se pueden analizar y las comprobaciones estructurales de esta lección pasan.
- **Fuentes consultadas:** [Cambridge Grammar: past perfect simple or continuous](https://dictionary.cambridge.org/grammar/british-grammar/past-perfect-continuous), [Cambridge Grammar: past perfect simple or past simple](https://dictionary.cambridge.org/grammar/british-grammar/past-perfect-simple), [Cambridge Grammar: past perfect continuous](https://dictionary.cambridge.org/uk/grammar/british-grammar/past-perfect-continuous-i-had-been-working).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; se recomienda la revisión final de hablantes nativos para confirmar naturalidad y adecuación pedagógica.


### 269/301 — `Idiomas/cursos/en/lessons/269.json`
- **Ruta:** `Idiomas/cursos/en/lessons/269.json`; fuente editable: `_herramientas/cursos/en/38.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** pese al título sobre los dos futuros perfectos, casi toda la lección repetía una misma oración en continuo; ninguna actividad daba una respuesta correcta en futuro perfecto simple. Una opción incorrecta (`will have worked yesterday`) era defectuosa por mezclar un límite pasado con el futuro. No había lectura; una tarea era abierta y otra de ordenación. Tampoco se mostraban las formas negativa e interrogativa ni se reconocía que el simple también puede expresar un período de tiempo alcanzado.
- **Cambios realizados:** se aclaró la forma y el uso de ambos tiempos, incluida la diferencia de enfoque sin presentarla como una regla absoluta, y se añadieron ejemplos breves de formas negativa e interrogativa. Se reemplazó la oración repetida por una lectura bilingüe de cinco líneas sobre el aniversario laboral de Anna y se prepararon nueve ejercicios cerrados que incluyen resultado, duración, comprensión lectora y formación de preguntas/negativas. Se retiró el vocabulario redundante ya impartido como ficha visible.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 300 JSON; validación de nueve actividades con IDs únicos, tres opciones y una respuesta correcta cada una; comprobación de cinco frases bilingües y de la posición 269/301 en la lista.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.278 palabras, 2.371 ejercicios y 703 avisos globales; sin aviso ni error específico de la lección 269. Los 300 JSON se pueden analizar y las verificaciones estructurales de esta lección pasan.
- **Fuentes consultadas:** [Cambridge Grammar: future perfect simple](https://dictionary.cambridge.org/us/grammar/british-grammar/future-perfect), [Cambridge Grammar: future perfect continuous](https://dictionary.cambridge.org/grammar/british-grammar/future-perfect-continuous-i-will-have-been-working-here-ten-years), [Cambridge Grammar: future perfect quiz](https://dictionary.cambridge.org/us/plus/quiz/grammar/future-4).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; la revisión final de hablantes nativos podrá confirmar naturalidad y adecuación pedagógica.


### 270/301 — `Idiomas/cursos/en/lessons/270.json`
- **Ruta:** `Idiomas/cursos/en/lessons/270.json`; fuente editable: `_herramientas/cursos/en/38.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis actividades repetían la misma oración, con dos ejercicios duplicados y una única forma de lectura; faltaba una lectura breve que mostrara el pasado perfecto en contexto, el contraste con pasado simple, las formas negativas/interrogativas y el uso de adverbios. Había ejercicios de ordenación y respuesta abierta y solo dos fichas de vocabulario. La explicación no advertía que el pasado perfecto aporta una relación contextual entre hechos pasados y no se usa mecánicamente para todo lo anterior.
- **Cambios realizados:** se aclaró la formación y el uso contextual, se añadieron modelos de negativas, preguntas y adverbios frecuentes, y se creó una historia bilingüe de seis frases sobre una fiesta sorpresa. Se agregaron nueve ejercicios cerrados con comprobación de forma, orden narrativo y detalles de comprensión; se eliminaron las tareas abiertas y duplicadas. Se alinearon las glosas de vocabulario y el análisis de la frase coordinada.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 300 JSON; validación de nueve actividades con IDs únicos, tres opciones y una respuesta correcta cada una; comprobación de seis frases bilingües y de la posición 270/301 en la lista.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.280 palabras, 2.374 ejercicios y 705 avisos globales; sin aviso ni error específico de la lección 270. Los 300 JSON se pueden analizar y las verificaciones estructurales de esta lección pasan.
- **Fuentes consultadas:** [Cambridge Grammar: past perfect simple or past simple](https://dictionary.cambridge.org/grammar/british-grammar/past-perfect-simple), [British Council: past perfect](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/past-perfect), [Cambridge Grammar: past perfect simple](https://dictionary.cambridge.org/grammar/british-grammar/past-perfect-i).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; conviene que la revisión final de hablantes nativos confirme naturalidad y adecuación pedagógica.


### 271/301 — `Idiomas/cursos/en/lessons/271.json`
- **Ruta:** `Idiomas/cursos/en/lessons/271.json`; fuente editable: `_herramientas/cursos/en/39.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** **were** se presentaba como obligatorio en todos los registros, aunque el uso informal también admite **was** en algunas personas. El diálogo carecía de una situación coherente y mezclaba emociones sin contexto; la equivalencia entre **envy** y **jealous** podía resultar confusa. Varias fichas eran irrelevantes o no se practicaban. Había una pregunta de escucha, ordenación y respuesta abierta, sin lectura breve ni comprensión del texto.
- **Cambios realizados:** se precisó el valor de **wish + pasado**, **wish + would**, **hope** y **hopefully**, y se aclaró el uso formal de **were** frente al informal **was**. Se conservó y matizó el vocabulario **envy/jealous**. Se sustituyó el diálogo por una lectura bilingüe breve y coherente sobre un viaje condicionado por el tiempo, con contraste **annoying/annoyed**. Las ocho actividades ahora son cerradas y cubren gramática, vocabulario y comprensión.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 300 JSON; validación de ocho actividades con IDs únicos, tres opciones y una respuesta correcta cada una; comprobación de seis frases bilingües y de la posición 271/301 en la lista.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.276 palabras, 2.374 ejercicios y 693 avisos globales; sin aviso ni error específico de la lección 271. Los 300 JSON se pueden analizar y las verificaciones estructurales de esta lección pasan.
- **Fuentes consultadas:** [Cambridge Grammar: wish](https://dictionary.cambridge.org/grammar/british-grammar/wish), [Cambridge Grammar: if only](https://dictionary.cambridge.org/grammar/british-grammar/if-only), [Cambridge Grammar: hope](https://dictionary.cambridge.org/grammar/british-grammar/hope), [Cambridge Dictionary: envy](https://dictionary.cambridge.org/dictionary/english/envy), [Cambridge Dictionary: jealous](https://dictionary.cambridge.org/dictionary/english/jealous).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; se recomienda la revisión final de hablantes nativos para confirmar naturalidad y adecuación pedagógica.

### 272/301 — `Idiomas/cursos/en/lessons/272.json`
- **Ruta:** `Idiomas/cursos/en/lessons/272.json`; fuente editable: `_herramientas/cursos/en/39.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el contraste entre **I wish I had more time** y **I wish I had studied harder** estaba formulado de manera ambigua, y el ejercicio de hueco de **if only** tenía la respuesta correcta rota y opciones contradictorias. La lectura anterior no daba contexto suficiente al vocabulario de confianza; incluía fichas sin uso y actividades de escucha, ordenación y respuesta abierta sin comprobar comprensión lectora.
- **Cambios realizados:** aclaré **wish + pasado simple** para deseos presentes frente a **wish + pasado perfecto** para lamentos pasados, y precisé el valor más enfático de **if only**. Reconstruí la lectura como una situación breve y coherente de estudio, disculpa y confianza, con traducciones y apoyos de vocabulario para las formas flexionadas. Reemplacé las actividades por nueve ejercicios cerrados de gramática, traducción, vocabulario y comprensión lectora; afiné los sentidos de **trust** y **rely on**.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis JSON de los 301 archivos incluidos en la lista; verificación de la posición 272/301, capítulo y título, nueve ejercicios con IDs únicos, tres opciones distintas y una respuesta correcta por ejercicio; comprobación de siete pares de lectura bilingües y de que las fichas ocultas no aparecen en la lista visible de vocabulario.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.274 palabras, 2.375 ejercicios y 689 avisos globales; sin avisos ni errores específicos de la 272. Los 301 archivos de la lista se pudieron analizar y pasaron las comprobaciones estructurales previstas para esta lección. La lista de revisión no se modificó.
- **Fuentes consultadas:** [Cambridge Grammar: wish](https://dictionary.cambridge.org/grammar/british-grammar/wish%3A), [Cambridge Grammar: if only](https://dictionary.cambridge.org/grammar/british-grammar/if-only%29), [British Council: Wishes, “wish” and “if only”](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/wishes-wish-if-only).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; se recomienda revisión final de hablantes nativos para confirmar naturalidad y adecuación pedagógica.

### 273/301 — `Idiomas/cursos/en/lessons/273.json`
- **Ruta:** `Idiomas/cursos/en/lessons/273.json`; fuente editable: `_herramientas/cursos/en/39.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** **college** se traducía como «universidad» sin distinguir el uso estadounidense del británico; **application** aparecía como falso amigo sin limitar el sentido a solicitudes; **professor** y **tuition** no marcaban las diferencias regionales. El condicional mixto se presentaba sin explicar el contraste temporal. La lectura tenía actividades de audio, ordenar y escribir, y algunas fichas léxicas no se practicaban.
- **Cambios realizados:** contextualicé **college**, **application**, **professor** y **tuition** por país y sentido; añadí explicaciones compactas del formulario de solicitud y del condicional pasado-presente. Reescribí la lectura bilingüe como una situación coherente de solicitud universitaria y financiación, eliminé fichas irrelevantes y convertí la evaluación en once ejercicios cerrados de léxico, gramática y comprensión.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 301 archivos de la lista; comprobación de capítulo, título, 11 IDs únicos, tres opciones distintas y una respuesta correcta por ejercicio; lectura de siete pares bilingües con fragmentos de análisis presentes en el original; verificación de nueve fichas visibles y ausencia de actividades de audio, ordenación o respuesta libre. La primera aserción de validación esperaba por error 10 actividades; corregí el recuento y repetí toda la validación con 11.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.271 palabras, 2.376 ejercicios y 688 avisos globales; sin avisos ni errores específicos de la 273. Los 301 archivos se analizaron y las comprobaciones estructurales finales pasaron. La lista no se modificó.
- **Fuentes consultadas:** [Cambridge Grammar: mixed conditionals](https://dictionary.cambridge.org/grammar/british-grammar/third-conditional), [British Council: Conditionals: third and mixed](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-third-mixed), [Cambridge Dictionary: college](https://dictionary.cambridge.org/dictionary/english/college), [application](https://dictionary.cambridge.org/dictionary/english/application), [essay](https://dictionary.cambridge.org/dictionary/english/essay), [tuition fees](https://dictionary.cambridge.org/dictionary/english/tuition-fees), [professor](https://dictionary.cambridge.org/dictionary/english/professor), [scholarship](https://dictionary.cambridge.org/dictionary/english/scholarship) y [grant](https://dictionary.cambridge.org/dictionary/english/grant).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; se recomienda revisión final de hablantes nativos para confirmar naturalidad y adecuación pedagógica.

### 274/301 — `Idiomas/cursos/en/lessons/274.json`
- **Ruta:** `Idiomas/cursos/en/lessons/274.json`; fuente editable: `_herramientas/cursos/en/39.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** dos ejercicios repetían la misma frase y respuesta; **were** se presentaba como única forma, sin indicar que **was** también se usa informalmente. **Confident** se traducía solo como «seguro», lo que podía confundir el adjetivo con otros sentidos de *safe*. La lección carecía de lectura de apoyo y mezclaba comprensión con ordenar palabras y una respuesta escrita libre.
- **Cambios realizados:** precisé que **wish + pasado simple** imagina una situación presente o futura distinta y que la forma pasada no marca tiempo pasado. Matizé el uso hipotético de **were** y el uso informal de **was**; ajusté las fichas **confident/confidence**. Añadí una microlectura bilingüe de dos frases con comprensión y varié siete actividades cerradas para cubrir forma, registro, significado y lectura.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 301 JSON de la lista; comprobación de capítulo, título, siete IDs únicos, tres opciones diferentes y una respuesta correcta; lectura bilingüe y fragmentos de análisis; verificación de las cuatro fichas visibles y ausencia de actividades de audio, ordenación o respuesta libre.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.272 palabras, 2.377 ejercicios y 688 avisos globales; sin avisos ni errores específicos de la 274. Los 301 archivos se analizaron y las comprobaciones finales pasaron. La lista de revisión permanece intacta.
- **Fuentes consultadas:** [Cambridge Grammar: wish](https://dictionary.cambridge.org/grammar/british-grammar/wish), [Cambridge Dictionary: wish](https://dictionary.cambridge.org/dictionary/english/wish), [confident](https://dictionary.cambridge.org/dictionary/english/confident) y [confidence](https://dictionary.cambridge.org/dictionary/english/confidence).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; se recomienda revisión final de hablantes nativos para confirmar naturalidad y adecuación pedagógica.

### 275/301 — `Idiomas/cursos/en/lessons/275.json`
- **Ruta:** `Idiomas/cursos/en/lessons/275.json`; fuente editable: `_herramientas/cursos/en/39.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la forma **had taken** se evaluaba varias veces en la misma frase y no se explicaba con claridad la estructura **had + participio**, la negación ni la diferencia con **I wish I had more time** (deseo presente). No había contexto de lectura para **regret**, **earlier** y **figures**. Además, aparecía el nombre español «Ella» como palabra inglesa sin registrar.
- **Cambios realizados:** añadí explicación concisa de la forma positiva y negativa, contraste temporal y uso de **regret + -ing**. Reemplacé la frase aislada por una lectura bilingüe breve sobre cifras incorrectas en un informe y nueve ejercicios cerrados distintos. Matizé las traducciones de **regret/earlier/figure**, hice oculta la ficha de **earlier** porque ya se enseñó en la lección 170 y cambié el nombre inglés a **Amy**.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 301 JSON incluidos en la lista; comprobación de capítulo, título, nueve IDs únicos, tres opciones diferentes y una respuesta correcta; lectura bilingüe de cuatro frases con análisis presentes en el original; revisión de vocabulario visible y oculto.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.271 palabras, 2.380 ejercicios y 688 avisos globales; sin avisos ni errores específicos de la 275. Las comprobaciones estructurales finales pasaron y la lista de revisión no se modificó.
- **Fuentes consultadas:** [Cambridge Grammar: wish](https://dictionary.cambridge.org/grammar/british-grammar/wish), [British Council: Wishes, “wish” and “if only”](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/wishes-wish-if-only), [Cambridge Grammar: verb + -ing](https://dictionary.cambridge.org/us/grammar/british-grammar/verbs-followed-by-ing) y [Cambridge Learner’s Dictionary: regret](https://dictionary.cambridge.org/dictionary/learner-english/regret).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; se recomienda revisión final de hablantes nativos para confirmar naturalidad y adecuación pedagógica.

### 276/301 — `Idiomas/cursos/en/lessons/276.json`
- **Ruta:** `Idiomas/cursos/en/lessons/276.json`; fuente editable: `_herramientas/cursos/en/39.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la forma **would stop** se repetía dos veces en ejercicios consecutivos; faltaba explicar el uso de **wish + would** para quejas o cambios deseados y distinguirlo de **hope** para esperanzas normales. No había lectura ni comprensión, y **turn down** podía confundirse con su otro sentido de «rechazar».
- **Cambios realizados:** añadí la forma positiva y negativa **would/wouldn't + verbo base**, el contexto de queja sobre personas o máquinas y el contraste con **hope**. Incorporé una lectura bilingüe breve de una impresora y ruido vecinal, aclaré el sentido contextual de **turn down** y la grafía británica **neighbour**, y preparé ocho ejercicios cerrados variados.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 301 JSON de la lista; revisión de capítulo, título, ocho IDs únicos, opciones distintas y una solución por ejercicio; lectura de cuatro pares bilingües y sus fragmentos; comprobación de vocabulario y ausencia de audio, ordenación y respuesta libre.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.272 palabras, 2.382 ejercicios y 688 avisos globales; sin avisos ni errores específicos de la 276. Las comprobaciones finales pasaron y la lista de revisión permanece intacta.
- **Fuentes consultadas:** [Cambridge Grammar: wish](https://dictionary.cambridge.org/grammar/british-grammar/wish), [British Council: Wishes, “wish” and “if only”](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/wishes-wish-if-only), [Cambridge Dictionary: turn down](https://dictionary.cambridge.org/dictionary/english/turn-down) y [frustrated](https://dictionary.cambridge.org/dictionary/english/frustrated).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; se recomienda revisión final de hablantes nativos para confirmar naturalidad y adecuación pedagógica.

### 277/301 — `Idiomas/cursos/en/lessons/277.json`
- **Ruta:** `Idiomas/cursos/en/lessons/277.json`; fuente editable: `_herramientas/cursos/en/40.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lectura anterior mezclaba personajes y hechos sin una secuencia clara, y varias fichas no se practicaban. La explicación describía estos patrones vagamente como verbos para «reportar acciones». Había repeticiones de ejercicios y tareas de escucha, ordenación y escritura; además, la actividad de escritura pedía «admitir haber hecho algo» pero solo aceptaba **admit** como respuesta.
- **Cambios realizados:** precisé los patrones **suggest + -ing / that-clause**, **insist on + -ing**, **deny + -ing** y **admit + -ing / to + -ing**. Reemplacé el diálogo incoherente por una lectura bilingüe breve y conectada sobre un teléfono roto; normalicé el vocabulario y oculté apoyos de formas flexionadas. Añadí nueve ejercicios cerrados de patrones, significado y comprensión; eliminé actividades sin respuesta verificable y la ficha visible repetida **pay**, ya enseñada en la lección 047.
- **Pruebas o comprobaciones ejecutadas:** compilación inglesa; análisis de los 301 JSON de la lista; validación de capítulo, título, nueve IDs únicos, tres opciones distintas y una correcta por ejercicio; revisión de cinco pares de lectura bilingües y fragmentos alineados; comprobación de nueve palabras visibles y ausencia de audio, ordenación y respuesta libre.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.266 palabras, 2.383 ejercicios y 683 avisos globales; sin avisos ni errores específicos de la 277. Los 301 archivos pasaron el análisis JSON y las comprobaciones finales; la lista permanece intacta.
- **Fuentes consultadas:** [Cambridge Grammar: suggest](https://dictionary.cambridge.org/grammar/british-grammar/suggest), [Cambridge Grammar: word pattern suggest](https://dictionary.cambridge.org/grammar/british-grammar/word-patterns-suggest), [Cambridge Grammar: verb + -ing or infinitive](https://dictionary.cambridge.org/grammar/british-grammar/verbs-followed-by-ing-or-infinitive) y [Cambridge Dictionary: insist on doing something](https://dictionary.cambridge.org/dictionary/english/insist-on).
- **Bloqueos o decisiones pendientes:** ninguno para la revisión técnica; se recomienda revisión final de hablantes nativos para confirmar naturalidad y adecuación pedagógica.

### 278/301 — `Idiomas/cursos/en/lessons/278.json`
- **Ruta:** `Idiomas/cursos/en/lessons/278.json`; fuente editable: `_herramientas/cursos/en/40.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección reunía ejemplos sin una situación coherente, contenía expresiones poco naturales («The shock was big») y tarjetas de vocabulario que no se enseñaban ni practicaban. Mezclaba sin aclaración los sentidos de **shock** y **fire**; además, incluía una actividad de audio, una de ordenar y una respuesta abierta cuya solución («threaten to») no formaba una oración completa. La comprensión lectora no se evaluaba.
- **Cambios realizados:** reescribí la explicación breve para delimitar **warn + persona + not to + verbo base** y **promise/offer/agree/refuse/threaten + to + verbo base**. Reemplacé el diálogo inconexo por una lectura bilingüe de seis líneas sobre un enchufe dañado, reutilicé vocabulario pertinente y aclaré **electric shock**, **fire someone** y la variante estadounidense **outlet**. Añadí nueve ejercicios cerrados de forma, traducción, significado y comprensión, y retiré los formatos no verificables dentro de la app. Sincronicé la fuente editable y regeneré el JSON.
- **Pruebas o comprobaciones ejecutadas:** consulta de patrones y sentidos en Cambridge Dictionary/Grammar; compilación inglesa; parseo del JSON; verificación de que la lista sigue teniendo 301 entradas y que 278 ocupa la posición 278; comprobación del capítulo, título, 9 IDs únicos, 3 opciones distintas y una respuesta correcta explicada por ejercicio, 6 pares de lectura con traducción y fragmentos alineados, y ausencia de audio, ordenación y respuesta abierta.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.265 palabras, 2.384 ejercicios y 679 avisos globales; no hubo avisos específicos de la 278. Las comprobaciones estructurales y de contenido pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: verb patterns](https://dictionary.cambridge.org/grammar/british-grammar/verb-patterns-verb-infinitive-or), [Cambridge Dictionary: warn](https://dictionary.cambridge.org/dictionary/english/warn), [Cambridge Dictionary: electric shock](https://dictionary.cambridge.org/dictionary/english/electric-shock) y [Cambridge Dictionary: fire someone from something](https://dictionary.cambridge.org/dictionary/english/fire-from).
- **Bloqueos, dudas o decisiones pendientes:** ninguno para la revisión técnica; conviene que un hablante nativo confirme la naturalidad final de las traducciones y el nivel de dificultad.
### 279/301 — `Idiomas/cursos/en/lessons/279.json`
- **Ruta:** `Idiomas/cursos/en/lessons/279.json`; fuente editable: `_herramientas/cursos/en/40.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación clasificaba **agenda** como falso amigo pese a que su sentido «orden del día» coincide con el español, y presentaba **diary** como traducción universal de agenda personal sin matizar el uso británico. La nota sobre **resign** afirmaba que equivalía a **accept** y el ejercicio repetía ese error, sin distinguir **resign from a job** de **resign yourself to**. Se mezclaban **pay rise** británico y **raise** estadounidense sin indicar la variedad; el texto daba género femenino a **the chair** sin identificar a la persona, no se practicaba **wages**, y había actividades de audio, ordenar y respuesta libre.
- **Cambios realizados:** reformulé las notas para distinguir **agenda/diary/planner**, **the minutes/minutes**, los dos patrones de **resign**, **chair** como quien preside y las variantes **pay rise/pay raise**. Añadí el uso de **wages** en la lectura, neutralicé las traducciones sin género conocido y extendí el acta bilingüe a ocho líneas coherentes. Sustituí las actividades no verificables por 13 ejercicios cerrados de vocabulario, uso regional y comprensión. Añadí las fichas ocultas que faltaban y sincronicé la fuente editable con el JSON compilado.
- **Pruebas o comprobaciones ejecutadas:** consulta de sentidos y variantes en Cambridge Dictionary; compilación inglesa; parseo del JSON; comprobación de que la lista conserva 301 entradas y que 279 ocupa la posición 279; validación del capítulo y título, 13 IDs únicos, tres opciones distintas y una respuesta correcta explicada por ejercicio, ocho líneas bilingües con fragmentos de análisis presentes en el original, 12 palabras visibles sin duplicados y ausencia de audio, ordenar y respuesta abierta.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.266 palabras, 2.387 ejercicios y 678 avisos globales; sin avisos específicos de la 279. Las comprobaciones estructurales y de contenido pasaron.
- **Fuentes consultadas:** [Cambridge Dictionary: agenda](https://dictionary.cambridge.org/dictionary/english/agenda), [diary](https://dictionary.cambridge.org/dictionary/english/diary), [the minutes](https://dictionary.cambridge.org/dictionary/english/minutes), [resign](https://dictionary.cambridge.org/dictionary/english/resign), [resign yourself to](https://dictionary.cambridge.org/dictionary/english/resign-to), [pay rise](https://dictionary.cambridge.org/dictionary/english/pay-rise), [wage](https://dictionary.cambridge.org/dictionary/english/wage), [bonus](https://dictionary.cambridge.org/dictionary/english/bonus) y [chair](https://dictionary.cambridge.org/dictionary/english/chair).
- **Bloqueos, dudas o decisiones pendientes:** ninguno para la revisión técnica; conviene que un hablante nativo confirme la naturalidad final de las traducciones y el nivel de dificultad.
### 280/301 — `Idiomas/cursos/en/lessons/280.json`
- **Ruta:** `Idiomas/cursos/en/lessons/280.json`; fuente editable: `_herramientas/cursos/en/40.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección repetía casi exactamente el patrón **deny + -ing** y el ejemplo de cifras ya enseñados en la 277. Sus dos ejercicios de huecos eran duplicados; la traducción y la respuesta abierta repetían la misma oración. Aunque el título mencionaba **admit** y **suggest**, no los trabajaba de forma útil y carecía de lectura. No distinguía el sentido de **deny** «negar una acción/hecho» del sentido «denegar algo a alguien».
- **Cambios realizados:** enfoqué la lección en la distinción entre **deny + -ing / that-clause** y **deny someone access / deny a request**, con un contraste breve con **admit + -ing / that-clause**. Añadí una lectura bilingüe breve sobre una revisión contable, siete fichas léxicas relevantes y nueve ejercicios cerrados variados; el texto aclara que la auditoría no identificó quién cambió la cifra. Actualicé el título e introducción para enlazar explícitamente con el contenido de la 277 sin presentarlo como material nuevo. Añadí las fichas de apoyo que faltaban y regeneré el JSON desde la fuente editable.
- **Pruebas o comprobaciones ejecutadas:** cotejo con la lección 277; consulta de Cambridge Grammar y Cambridge Dictionary; compilación inglesa; parseo del JSON; comprobación de que la lista conserva 301 entradas y que 280 ocupa la posición 280; verificación de capítulo y título, nueve IDs únicos, tres opciones distintas y una respuesta correcta con explicación por ejercicio, cuatro líneas de lectura traducidas con fragmentos de análisis alineados, siete palabras visibles sin duplicados y ausencia de audio, ordenar y respuesta abierta.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.272 palabras, 2.390 ejercicios y 678 avisos globales; sin avisos específicos de la 280. Las comprobaciones estructurales y de contenido pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: verb + -ing or infinitive](https://dictionary.cambridge.org/grammar/british-grammar/verbs-followed-by-ing-or-infinitive), [Cambridge Dictionary: deny](https://dictionary.cambridge.org/dictionary/english/deny) y [admit](https://dictionary.cambridge.org/dictionary/english/admit).
- **Bloqueos, dudas o decisiones pendientes:** ninguno para la revisión técnica; conviene que un hablante nativo confirme la naturalidad final de las traducciones y el nivel de dificultad.
### 281/301 — `Idiomas/cursos/en/lessons/281.json`
- **Ruta:** `Idiomas/cursos/en/lessons/281.json`; fuente editable: `_herramientas/cursos/en/40.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección repetía la misma frase sobre un suelo mojado en dos ejercicios de huecos, una traducción, una tarea de ordenar y una de escritura. Aunque la explicación nombraba **advise**, **remind**, **warn** y **persuade**, solo ejemplificaba y practicaba **warn**; no había comprensión lectora. Además, el compilador detectó cinco fichas léxicas repetidas en lecciones anteriores y un fragmento de análisis que no coincidía con el texto.
- **Cambios realizados:** transformé la unidad en una práctica breve de los patrones **advise/remind/persuade + persona + to-infinitive** y **warn + persona + not to-infinitive**, y añadí una nota concisa para distinguir el verbo **advise** del nombre incontable **advice**. Creé una lectura bilingüe de cuatro líneas ambientada en un museo y ocho ejercicios cerrados distintos. Oculté las fichas ya enseñadas, mantuve **advice** como apoyo oculto por aparecer previamente en la lección 115 y alineé los fragmentos de análisis con las frases originales. Regeneré el JSON desde la fuente editable.
- **Pruebas o comprobaciones ejecutadas:** cotejo con Cambridge Grammar y British Council LearnEnglish; compilación inglesa; parseo del JSON; comprobación de que la lista conserva 301 entradas y que 281 ocupa la posición 281; validación de capítulo y título, ocho IDs únicos, tres opciones distintas y una respuesta correcta explicada por ejercicio, cuatro líneas bilingües con fragmentos alineados, seis palabras visibles sin duplicados y ausencia de audio, ordenar y respuesta abierta.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.277 palabras, 2.392 ejercicios y 678 avisos globales; sin avisos específicos de la 281. Las comprobaciones estructurales y de contenido pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: verbs followed by an object and to-infinitive](https://dictionary.cambridge.org/grammar/british-grammar/verbs-followed-by-ing-or-infinitive), [Cambridge Grammar: advice or advise](https://dictionary.cambridge.org/grammar/british-grammar/advice-or-advise) y [British Council LearnEnglish: reported speech and reporting verbs](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/reported-speech-reporting-verbs).
- **Bloqueos, dudas o decisiones pendientes:** ninguno para la revisión técnica; conviene que un hablante nativo confirme la naturalidad final de las traducciones y el nivel de dificultad.
### 282/301 — `Idiomas/cursos/en/lessons/282.json`
- **Ruta:** `Idiomas/cursos/en/lessons/282.json`; fuente editable: `_herramientas/cursos/en/40.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la unidad repetía el ejemplo **They offered to drive us to the airport** en dos huecos, una traducción, ordenar y escritura libre; solo practicaba **offer**, aunque la explicación enumeraba **promise, offer, agree** y **refuse**. No había lectura ni contraste semántico entre comprometerse, ofrecerse, aceptar y negarse. El material se solapaba con la 278 y no aprovechaba la secuencia sobre patrones con objeto de la 281.
- **Cambios realizados:** enfoqué la lección en el valor comunicativo de **promise/offer/agree/refuse + to-infinitive** y quién realiza la acción en estos patrones directos; contrasté **offer to do** con **advise someone to do**, enlazándolo con la 281. Reemplacé el ejemplo repetido por una lectura bilingüe breve sobre una cena de equipo y nueve ejercicios cerrados variados que practican los cuatro verbos, su significado y la comprensión del texto. Añadí fichas contextuales y generé de nuevo el JSON desde la fuente editable.
- **Pruebas o comprobaciones ejecutadas:** cotejo con Cambridge Grammar, British Council LearnEnglish y la lección 281; compilación inglesa; parseo del JSON; comprobación de que la lista conserva 301 entradas y que 282 ocupa la posición 282; validación de capítulo y título, nueve IDs únicos, tres opciones distintas y una respuesta correcta explicada por ejercicio, cuatro líneas bilingües con fragmentos de análisis alineados, cuatro fichas visibles distintas y ausencia de audio, ordenar y respuesta abierta.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.279 palabras, 2.395 ejercicios y 678 avisos globales; sin avisos específicos de la 282. Las comprobaciones estructurales y de contenido pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: verb + infinitive or -ing](https://dictionary.cambridge.org/grammar/british-grammar/verb-patterns-verb-infinitive-or), [Cambridge Grammar: promise](https://dictionary.cambridge.org/grammar/british-grammar/promise) y [British Council LearnEnglish: patterns with reporting verbs](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/patterns-reporting-verbs).
- **Bloqueos, dudas o decisiones pendientes:** ninguno para la revisión técnica; conviene que un hablante nativo confirme la naturalidad final de las traducciones y el nivel de dificultad.
### 283/301 — `Idiomas/cursos/en/lessons/283.json`
- **Ruta:** `Idiomas/cursos/en/lessons/283.json`; fuente editable: `_herramientas/cursos/en/41.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la explicación podía interpretarse como una regla absoluta de elección entre *make* y *do*; **progress** no se identificaba como incontable; las combinaciones con *take* y *pay* no se explicaban de forma suficientemente explícita; faltaba una lectura que contextualizara las colocaciones; varias actividades repetían el mismo material y tres preguntas volvían a evaluar contenidos ya comprobados. La traducción atribuía género a *a colleague* sin que el inglés lo indicara.
- **Cambios realizados:** aclaré que las combinaciones son frecuentes y que no hay una regla que prediga todos los nombres; añadí el uso incontable de **progress**, y las preposiciones de **take responsibility for**, **take care of**, **take part in** y **pay attention to**. Creé una lectura breve sobre un cambio de fecha con traducción y análisis; reduje las actividades redundantes de 13 a 10; neutralicé la traducción de *colleague*. Mantuve **make a decision** como práctica de repaso, sin duplicar su ficha visible porque ya se introduce en una lección anterior. Sincronicé fuente y JSON generado.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; comprobación de la posición 283 dentro de la lista intacta de 301 entradas; validación de capítulo, título, 6 frases bilingües, fragmentos de análisis presentes en su oración, 8 fichas visibles, 10 ejercicios cerrados, IDs únicos y exactamente una solución correcta con explicación por ejercicio.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.273 palabras, 2.397 ejercicios y 679 avisos globales; sin avisos específicos de la 283. Las verificaciones estructurales y de contenido pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: *Do or make?*](https://dictionary.cambridge.org/grammar/british-grammar/make-or-do), [Cambridge Grammar: *Progress*](https://dictionary.cambridge.org/grammar/british-grammar/progress), [Cambridge Dictionary: *make a decision*](https://dictionary.cambridge.org/dictionary/english/make-a-decision), [*responsibility*](https://dictionary.cambridge.org/dictionary/english/responsibility), [*take part*](https://dictionary.cambridge.org/dictionary/english/take-part) y [Cambridge Grammar: patrón *take part in*](https://dictionary.cambridge.org/grammar/british-grammar/word-patterns-take-part).
- **Bloqueos, dudas o decisiones pendientes:** ninguno para la revisión técnica; queda la revisión habitual de naturalidad por hablante nativo.

- **Último archivo completado:** `283.json`.
- **Siguiente archivo pendiente:** `284.json`.

### 284/301 — `Idiomas/cursos/en/lessons/284.json`
- **Ruta:** `Idiomas/cursos/en/lessons/284.json`; fuente editable: `_herramientas/cursos/en/41.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lectura anterior era una sucesión de frases sin una situación coherente; se agrupaban **similarly** y **in fact** como adición, aunque expresan semejanza y precisión/corrección, respectivamente; **otherwise** no se distinguía del resultado simple; faltaban ejemplos y práctica de varias palabras del glosario; una opción de «escucha» dependía de audio y la ficha de *however* duplicaba el término visible de la lección 196. La traducción de *bus shelter* como «techo» era poco precisa.
- **Cambios realizados:** aclaré las funciones y puntuación de los conectores; reconstruí una lectura breve, bilingüe y lógica sobre elegir transporte; añadí 11 ejercicios cerrados variados que comprueban comprensión, contraste, resultado, condición, adición, semejanza y énfasis; eliminé la actividad de audio; hice oculta la ficha duplicada de *however* y añadí apoyo léxico oculto para las palabras incidentales. Corregí *bus shelter* como «marquesina» y afiné el ejemplo de *in fact* para que la comparación sea explícita. Sincronicé fuente y JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; comprobación de la posición 284 en la lista intacta de 301 entradas; validación de título y capítulo, 6 líneas de lectura con traducción/análisis, 10 fichas visibles, 11 IDs únicos y una respuesta correcta explicada en cada ejercicio; ausencia de actividades de audio, ordenación y respuesta abierta.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.272 palabras, 2.401 ejercicios y 674 avisos globales; sin avisos específicos de la 284. Las verificaciones pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: conectores y posición](https://dictionary.cambridge.org/grammar/british-grammar/conjunctions-subordinating), [contraste](https://dictionary.cambridge.org/us/grammar/british-grammar/conjunctions-contrasting?q=Conjunc-), [Cambridge Dictionary: *otherwise*](https://dictionary.cambridge.org/dictionary/english/otherwise), [*moreover*](https://dictionary.cambridge.org/dictionary/english/moreover), [*similarly*](https://dictionary.cambridge.org/dictionary/english/similarly), [Cambridge Grammar: *in fact*](https://dictionary.cambridge.org/us/grammar/british-grammar/in-fact), [Cambridge Dictionary: *indeed*](https://dictionary.cambridge.org/dictionary/english/indeed), [*bus shelter*](https://dictionary.cambridge.org/us/dictionary/english/bus-shelter) y [*marquesina*](https://dictionary.cambridge.org/es/diccionario/espanol-ingles/marquesina).
- **Bloqueos, dudas o decisiones pendientes:** Cambridge marca *similarly* como C1. Se conserva en el contenido original, pero si el capítulo tiene un límite estricto B2, convendría decidir si dejarlo como extensión receptiva o retirarlo del vocabulario evaluable; esa decisión de currículo queda documentada para revisión.

- **Último archivo completado:** `284.json`.
- **Siguiente archivo pendiente:** `285.json`.

### 285/301 — `Idiomas/cursos/en/lessons/285.json`
- **Ruta:** `Idiomas/cursos/en/lessons/285.json`; fuente editable: `_herramientas/cursos/en/41.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la actividad decía **The cost of the plan is big**, una combinación poco natural para el sentido previsto; una frase aislada sobre *wealth* no se relacionaba con la lectura; el ejercicio de audio no practicaba comprensión escrita; faltaba apoyo léxico para algunas palabras del texto y los ejercicios. La lectura atribuía a un grupo vecinal una acusación de engaño sin dejar tan claro que era una acusación, y no conectaba explícitamente el temor a los alquileres con las zonas turísticas.
- **Cambios realizados:** sustituí la colocación por **the cost … is high**; incorporé *wealth* al objetivo de crecimiento sostenible y convertí el ejercicio aislado en comprensión del texto; reemplacé la actividad de audio por una pregunta cerrada sobre la primera frase; aclaré la preocupación por alquileres en zonas turísticas y formulé *deception* como una acusación atribuida al grupo; cambié la ordenación a una frase pertinente sobre turismo sostenible; añadí glosas ocultas para el vocabulario incidental y mantuve la práctica del falso amigo.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; comprobación de posición 285 en la lista intacta; validación de capítulo/título, 9 líneas bilingües con fragmentos de análisis incluidos, 11 IDs únicos, una respuesta correcta y feedback por ejercicio cerrado, campos completos de ordenación/escritura y ausencia de audio.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.272 palabras, 2.401 ejercicios y 666 avisos globales; sin avisos específicos de la 285. Las verificaciones pasaron.
- **Fuentes consultadas:** [Cambridge Dictionary: *deception*](https://dictionary.cambridge.org/dictionary/english/deception), [*disappointment*](https://dictionary.cambridge.org/dictionary/english/disappointment) y [ejemplo de *the cost is high*](https://dictionary.cambridge.org/example/english/meat).
- **Bloqueos, dudas o decisiones pendientes:** Cambridge clasifica *deception* como C2. Se mantiene porque es el falso amigo que da sentido a la lección, pero si este capítulo tiene un límite estricto B2, conviene confirmar si debe quedar como vocabulario de reconocimiento o si requiere un reemplazo; esa decisión de nivel queda documentada.

- **Último archivo completado:** `285.json`.
- **Siguiente archivo pendiente:** `286.json`.

### 286/301 — `Idiomas/cursos/en/lessons/286.json`
- **Ruta:** `Idiomas/cursos/en/lessons/286.json`; fuente editable: `_herramientas/cursos/en/41.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el título decía que se cancelaba una reunión, pero la lectura no cancela ninguna; la traducción de **figure out a new schedule** como «encontrará un nuevo calendario» era demasiado literal; **the chair** se traducía con género femenino no indicado en inglés; el ejemplo de *trial* carecía de ficha de apoyo. La explicación de posición podía distinguir con más precisión las partículas separables de la preposición en **look into**.
- **Cambios realizados:** renombré la lección para que coincida con la revisión de un proyecto; precisé que **turn down/call off** son separables y que **look into** lleva el objeto después de la preposición; cambié el ejemplo de **figure out** a **figure out what went wrong**, con traducción natural; hice explícito el sujeto **the council**, neutralicé **the chair** como «quien presidía la reunión» y añadí la glosa de *trial*. Sincronicé la fuente y el JSON.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; posición 286 verificada en la lista intacta; capítulo y título revisados; 7 líneas bilingües con análisis alineado; validación de 6 IDs únicos, tres opciones y una respuesta correcta explicada en cada ejercicio; explicación de orden de partículas comprobada; sin audio.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.272 palabras, 2.401 ejercicios y 666 avisos globales; sin avisos específicos de la 286. Las comprobaciones pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: verbos compuestos y posición del objeto](https://dictionary.cambridge.org/grammar/british-grammar/phrasal-), [Cambridge Dictionary: *call something off*](https://dictionary.cambridge.org/dictionary/english/call-off) y [*figure something out*](https://dictionary.cambridge.org/dictionary/english/figure-out?topic=understanding-and-comprehending).
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `286.json`.
- **Siguiente archivo pendiente:** `287.json`.

### 287/301 — `Idiomas/cursos/en/lessons/287.json`
- **Ruta:** `Idiomas/cursos/en/lessons/287.json`; fuente editable: `_herramientas/cursos/en/41.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el bloque de vocabulario estaba vacío porque todas las entradas estaban ocultas; cuatro actividades repetían prácticamente la misma frase sobre **reach an agreement**; las otras colocaciones del título (*make a decision*, *do research*, *take responsibility*) apenas se presentaban; una respuesta incorrecta marcaba **made an agreement** como errónea, aunque esa combinación puede ser válida; no se explicaba que **research** es incontable.
- **Cambios realizados:** centré la lección en las colocaciones nuevas **do research** y **reach an agreement**, con repaso contextual de **make a decision** y **take responsibility**. Añadí la regla de countability y una lectura coherente sobre un proyecto solar; hice visibles las dos colocaciones objetivo y varié siete ejercicios para evaluar su forma, significado y comprensión del texto. Retiré el distractor ambiguo y añadí glosas de apoyo ocultas.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; posición 287 en la lista intacta; capítulo y título; 5 líneas bilingües con análisis alineado; vocabulario visible no vacío; 7 IDs únicos; respuesta correcta y feedback en cada ejercicio con opciones; regla de sustantivo incontable presente; sin audio.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.274 palabras, 2.402 ejercicios y 666 avisos globales; sin avisos específicos de la 287. Las comprobaciones pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: countability of *research*](https://dictionary.cambridge.org/grammar/british-grammar/countability-research), [Cambridge Dictionary: *reach a decision/agreement/conclusion*](https://dictionary.cambridge.org/dictionary/english/reach-a-decision-agreement-conclusion-etc) y [*agreement*](https://dictionary.cambridge.org/dictionary/english/agreement).
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `287.json`.
- **Siguiente archivo pendiente:** `288.json`.

### 288/301 — `Idiomas/cursos/en/lessons/288.json`
- **Ruta:** `Idiomas/cursos/en/lessons/288.json`; fuente editable: `_herramientas/cursos/en/41.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** cuatro ejercicios repetían la misma oración; el título y la explicación cubrían más que el único ejemplo; el objeto largo aparecía antes de **out**, posición posible pero menos natural; la actividad no enseñaba esa preferencia ni diferenciaba con suficiente práctica la ubicación del pronombre. **Survey** ya tenía ficha visible en la lección 229 y el primer borrador quedó por debajo del mínimo de actividades del compilador.
- **Cambios realizados:** enfoqué la lección en **carry out a survey**; aclaré sus dos órdenes nominales, el lugar obligatorio del pronombre (**carry it out**) y que los complementos largos suelen ir después de la partícula. Añadí una lectura breve sobre una encuesta de autobuses, seis ejercicios distintos y respuestas justificadas. Dejé **survey** como glosa oculta para evitar duplicar su ficha visible.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; posición 288 en la lista intacta; título/capítulo; 3 líneas bilingües con análisis alineado; 2 fichas visibles; 6 IDs únicos y una respuesta correcta explicada por ejercicio con opciones; regla de posición comprobada; sin audio.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.274 palabras, 2.402 ejercicios y 666 avisos globales; sin avisos específicos de la 288. Las comprobaciones pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: verbos compuestos y posición del objeto](https://dictionary.cambridge.org/grammar/british-grammar/phrasal-) y [Cambridge Dictionary: *carry something out*](https://dictionary.cambridge.org/dictionary/english/carry-out).
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 289/301 — `Idiomas/cursos/en/lessons/289.json`
- **Ruta:** `Idiomas/cursos/en/lessons/289.json`; fuente editable: `_herramientas/cursos/en/41.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** casi todos los ejercicios repetían una sola oración; la explicación enumeraba cuatro matizadores sin distinguir su función; se preguntaba por **evidence** sin ficha visible; y faltaba atender su carácter incontable. También se repetía **likely**, ya presentado en la lección 200, y el borrador no daba contexto suficiente para interpretar los ejemplos.
- **Cambios realizados:** reorganicé la explicación en fragmentos breves y distinguí **may**, **appears to** (incluido **appears to have + participio**), **be likely to** y **tend to**. Añadí una lectura hipotética de cinco líneas que diferencia asociación de causalidad, y siete ejercicios variados sobre matiz, gramática, lectura y el uso incontable de **evidence**. Hice visible **evidence**, **claim** y **tend to**; dejé **likely** oculto porque ya se había enseñado.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; 10 bloques, 5 líneas bilingües de lectura, 3 fichas visibles y 7 ejercicios; IDs únicos; cada ejercicio con tres opciones, una sola respuesta correcta y explicación en cada opción; ausencia de avisos específicos de la lección.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.276 palabras, 2.403 ejercicios y 666 avisos globales. La lección 289 no produjo avisos propios; las comprobaciones estructurales pasaron.
- **Fuentes consultadas:** [Cambridge Grammar: *may*](https://dictionary.cambridge.org/grammar/british-grammar/may), [Cambridge Grammar: *appear*](https://dictionary.cambridge.org/grammar/british-grammar/appear), [Cambridge Dictionary: *likely*](https://dictionary.cambridge.org/dictionary/english/likely), [Cambridge Grammar: *usually* y *tend to*](https://dictionary.cambridge.org/uk/grammar/british-grammar/usually) y [Cambridge Grammar: sustantivos contables e incontables](https://dictionary.cambridge.org/grammar/british-grammar/countable-and-uncountable-nouns).
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 290/301 — `Idiomas/cursos/en/lessons/290.json`
- **Ruta:** `Idiomas/cursos/en/lessons/290.json`; fuente editable: `_herramientas/cursos/en/41.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** seis actividades se apoyaban en la misma oración y el ejemplo no mostraba un uso concreto del registro ni de una expresión idiomática. Los distractores eran expresiones informales ajenas a la frase, así que no comprobaban si el alumno elegía según el destinatario. **Idiom** ya tenía una ficha en la lección 240.
- **Cambios realizados:** sustituí el ejemplo aislado por dos versiones breves del mismo plan: un chat informal del equipo y un informe formal para un cliente. Expliqué el papel de **pull it off**, la contracción **we’re**, la claridad de **reschedule** y la elección según destinatario, propósito y género; aclaré que una expresión idiomática no es automáticamente inadecuada. Añadí seis ejercicios diversos de significado, lectura y elección de registro; mantuve visibles solo las fichas nuevas y oculté **idiom**, ya enseñado.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; orden 290 de la lista intacta; 9 bloques, 2 líneas bilingües, 3 fichas visibles y 6 ejercicios; IDs únicos; cada ejercicio con tres opciones, exactamente una correcta y retroalimentación en todas las opciones; sin audio ni avisos específicos de esta lección.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.276 palabras, 2.403 ejercicios y 666 avisos globales. Las comprobaciones estructurales pasaron; no quedaron avisos propios de 290.
- **Fuentes consultadas:** [Cambridge Grammar: registro formal e informal](https://dictionary.cambridge.org/uk/grammar/british-grammar/formal-language), [Cambridge Grammar: registro según lectores, propósito y situación](https://dictionary.cambridge.org/grammar/british-grammar/speech-into-writing) y [Cambridge Dictionary: *pull something off*](https://dictionary.cambridge.org/dictionary/english/pull-off).
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

### 291/301 — `Idiomas/cursos/en/lessons/291.json`
- **Ruta:** `Idiomas/cursos/en/lessons/291.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo juntaba frases inconexas: **One advantage is the time** no decía qué ventaja aportaba el tiempo; el coste de un coche no se relacionaba con el trabajo remoto; **While some argue that it is lonely, I do not** dejaba el contraargumento y la postura del hablante poco claros; y **Overall, it is crucial to have a rule** no identificaba ninguna regla. Además, un ejercicio decía «Escucha» sin aportar un recurso de audio.
- **Cambios realizados:** sustituí el diálogo por un párrafo de opinión breve y coherente, con postura delimitada, ahorro de desplazamientos, posible inconveniente, contraargumento y conclusión. Aclaré **issue**, **outweigh**, **pros/cons** y el uso contrastivo de **while** («aunque» en este contexto); añadí ocho ejercicios de lectura, vocabulario y matiz, sin el ejercicio de escucha textual.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; JSON parseado; posición 291 confirmada en la lista; 13 bloques, 6 frases bilingües, 10 fichas visibles y 8 ejercicios con IDs únicos, tres opciones, una respuesta correcta y explicación en cada opción; comprobación de traducciones; no quedan bloques de audio ni avisos propios de la lección.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.273 palabras, 2.404 ejercicios y 665 avisos globales. Las comprobaciones estructurales pasaron.
- **Fuentes consultadas:** [Cambridge Dictionary: *issue* como tema o problema](https://dictionary.cambridge.org/dictionary/english/issue), [Cambridge Dictionary: *outweigh*](https://dictionary.cambridge.org/dictionary/english/outweigh), [Cambridge Grammar: *while* para contraste o simultaneidad](https://dictionary.cambridge.org/grammar/british-grammar/while-and-whilst) y [Cambridge Dictionary: *lonely*](https://dictionary.cambridge.org/dictionary/english/lonely).
- **Bloqueos, dudas o decisiones pendientes:** Cambridge Dictionary clasifica **outweigh** como C1; se conserva porque ya forma parte del objetivo de esta lección B2. Queda por decidir en la revisión curricular final si se acepta como vocabulario de ampliación en B2 o se reubica en C1.

### 292/301 — `Idiomas/cursos/en/lessons/292.json`
- **Ruta:** `Idiomas/cursos/en/lessons/292.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el diálogo mezclaba una reseña de restaurante con frases sueltas de un informe y una carta, sin una situación común. **I would rate the place** estaba incompleta; **The portion is big** resultaba poco natural; **The findings of the report is good** tenía discordancia entre sujeto plural y verbo singular; **I'd like to highlight the menu** no destacaba un aspecto concreto; y se presentaba **attached** como exclusivo del correo y **enclosed** como exclusivo de la carta en papel. El ejercicio de escucha solo contenía una oración escrita.
- **Cambios realizados:** creé cinco muestras cortas y relacionadas de reseña, informe, email formal y carta en papel. La reseña ahora incluye razones y una puntuación; el informe emplea **findings** con concordancia plural y destaca aspectos concretos; el correo responde a una queja con una disculpa y un cierre formal. Aclaré que **enclose** se refiere a incluir algo en un sobre o paquete y que **attach** también puede usarse con cartas, además de archivos enviados por correo electrónico. Ajusté las traducciones de **rate**, **findings** y **worth it**, y añadí ocho ejercicios de lectura y vocabulario.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; JSON parseado; posición 292 confirmada en la lista; 13 bloques, 5 frases bilingües, 12 fichas visibles y 8 ejercicios con IDs únicos, tres opciones, una sola respuesta correcta y retroalimentación para cada opción; no quedan avisos específicos de 292.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.273 palabras, 2.405 ejercicios y 665 avisos globales. Las comprobaciones estructurales y de traducción pasaron.
- **Fuentes consultadas:** [Cambridge Dictionary: *worth it*](https://dictionary.cambridge.org/dictionary/english/worth-it), [Cambridge Dictionary: *rate*](https://dictionary.cambridge.org/dictionary/english/rate), [Cambridge Dictionary: *findings*](https://dictionary.cambridge.org/dictionary/english/finding), [Cambridge Dictionary: *enclose*](https://dictionary.cambridge.org/dictionary/english/enclose), [Cambridge Dictionary: *attach*](https://dictionary.cambridge.org/dictionary/english/attach), [Cambridge Dictionary: *Yours sincerely*](https://dictionary.cambridge.org/dictionary/english/yours-sincerely) y [Cambridge Grammar: uso de *staff*](https://dictionary.cambridge.org/us/grammar/british-grammar/word-choice-stuff-or-staff).
- **Bloqueos, dudas o decisiones pendientes:** Cambridge Dictionary etiqueta el uso evaluativo de **rate** como C1. Se conserva como vocabulario de ampliación dentro de la reseña B2; queda pendiente decidir en la revisión curricular final si esta ubicación es intencional o si debe pasar a C1.

### 293/301 — `Idiomas/cursos/en/lessons/293.json`
- **Ruta:** `Idiomas/cursos/en/lessons/293.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la conversación era contradictoria: Anna proponía el viernes y luego decía que ese día estaba ocupado; aceptaban el jueves antes de introducir sin contexto una preocupación por el coste; **The alternative is to walk** no especificaba a qué sustituía; y **Let's agree** no cerraba con naturalidad ese intercambio. Además, la ficha de pronunciación de **point** repetía la ortografía, y **outline**, **weekly** y **definitely** no encajaban en la lección.
- **Cambios realizados:** reescribí el diálogo como un plan coherente: desacuerdo por trabajo el viernes, propuesta del sábado, preocupación por el precio de la cafetería y acuerdo de quedar gratis en el parque. Aclaré **I'm afraid** como fórmula para suavizar un desacuerdo, **I suggest + sujeto + verbo base**, **Why not... instead?** y el uso de **alternative**. Corregí la guía de pronunciación de **point**, retiré vocabulario ajeno y sustituí el ejercicio de escucha basado solo en texto por nueve tareas de lectura y gramática.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; JSON parseado; posición 293 de la lista intacta; 13 bloques, 7 intervenciones bilingües, 8 fichas visibles y 9 ejercicios; campos de diálogo completos; IDs únicos; cada ejercicio con tres opciones, una correcta y explicaciones para todas; ausencia de audio y de avisos específicos de 293.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.269 palabras, 2.407 ejercicios y 664 avisos globales. Las comprobaciones estructurales pasaron.
- **Fuentes consultadas:** [Cambridge Dictionary: *I'm afraid* para introducir desacuerdo cortés](https://dictionary.cambridge.org/us/dictionary/english/i-m-afraid), [Cambridge Grammar: *why not* para proponer algo](https://dictionary.cambridge.org/grammar/british-grammar/suggestions), [Cambridge Dictionary: estructuras con *suggest*](https://dictionary.cambridge.org/dictionary/english/suggest?topic=suggestions-and-proposals), [Cambridge Dictionary: *alternative*](https://dictionary.cambridge.org/dictionary/english/alternative) y [Cambridge Pronunciation: *point*](https://dictionary.cambridge.org/pronunciation/english/point).
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `293.json`.
- **Siguiente archivo pendiente:** `294.json`.

### 294/301 — `Idiomas/cursos/en/lessons/294.json`
- **Ruta:** `Idiomas/cursos/en/lessons/294.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el texto parecía informar de un caso real aunque era un escenario inventado; la pregunta sobre el propósito podía leerse como si el puente no fuese a cerrar en absoluto; el agente de «Readers were invited» no quedaba claro; `source` aparecía como vocabulario visible sin usarse en inglés y `site`, que sí se repetía, carecía de ficha; el análisis de la última frase aún contenía `widely`, palabra retirada al reformularla.
- **Cambios realizados:** marqué explícitamente el relato como ficticio; afiné la estrategia para separar afirmaciones, datos atribuidos a fuentes y opiniones; hice explícito que el medio pidió compartir la corrección; ajusté la pregunta principal y su explicación para reflejar que los autobuses podían cruzar y los coches se desviaban seis semanas; cambié la ficha no usada `source` por `site` y corregí el análisis de `just as`.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; JSON parseado; posición 294 de la lista; 6 ejercicios, IDs únicos, una respuesta correcta por ejercicio y explicación en todas las opciones; revisión de traducciones, inferencias y correspondencia con la fuente; búsqueda de avisos específicos de 294.
- **Resultado:** compilación correcta: 300 lecciones, 42 capítulos, 2.269 palabras, 2.407 ejercicios y 662 avisos globales. Sin avisos específicos de 294; las seis tareas pasaron las comprobaciones estructurales.
- **Fuentes consultadas:** [Cambridge Dictionary: *claim*](https://dictionary.cambridge.org/dictionary/english/claim) respalda su uso para atribuir una afirmación no demostrada; [Cambridge Dictionary: *site*](https://dictionary.cambridge.org/dictionary/english/site) incluye el sentido de sitio web; [Associated Press: News Values and Principles](https://www.ap.org/about/news-values-and-principles/telling-the-story/) describe sus prácticas de precisión y de distribución de correcciones.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `294.json`.
- **Siguiente archivo pendiente:** `295.json`.

### 295/301 — `Idiomas/cursos/en/lessons/295.json`
- **Ruta:** `Idiomas/cursos/en/lessons/295.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el compilador señalaba `argues` sin ficha en la lectura y en un ejercicio; la ficha oculta `worthwhile` no aparecía en ningún punto de la lección; las frases de la lectura carecían de trozos de análisis (`>`); la glosa de `three-month` decía «tres meses» en vez de «de tres meses»; y los dos últimos ejercicios eran de ordenar una oración larga y de escritura libre.
- **Cambios realizados:** añadí la ficha oculta `argues`, corregí `three-month` a «de tres meses», retiré `worthwhile` sin uso, incorporé análisis bilingües alineados en las siete frases de la lectura y sustituí las tareas de ordenar/escribir por dos preguntas cerradas de comprensión sobre la condición para ampliar horarios y la alternativa si las visitas no justifican el gasto.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; 8 ejercicios cerrados con IDs únicos, tres opciones, una sola respuesta correcta y explicación en todas las opciones; 0 avisos del compilador en la 295.
- **Resultado:** correcto tras los cambios; fuente y JSON sincronizados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `295.json`.
- **Siguiente archivo pendiente:** `296.json`.

### 296/301 — `Idiomas/cursos/en/lessons/296.json`
- **Ruta:** `Idiomas/cursos/en/lessons/296.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección tenía estructura de plantilla sin revisar: el título en español empezaba en minúscula y no indicaba que era un ejemplo ficticio; `cause` figuraba como ficha visible duplicando la lección 229; `over` se glosaba erróneamente como «terminado; sobre» cuando en `over three months` significa «durante; a lo largo de»; las actividades 3 y 4 repetían exactamente la misma frase con distractores absurdos (`3 percent.`, `24 percent.` como complemento de `identify the ___`); las opciones incorrectas del ejercicio de traducción eran palabras sueltas (`encuesta`, `residente`); y terminaba con ordenar y escribir la misma oración.
- **Cambios realizados:** actualicé el título, la introducción y la explicación; pasé `cause` a ficha oculta y añadí como vocabulario visible `limitation` y `establish`; corregí la glosa de `over` y añadí análisis a las frases del informe; reemplacé los ejercicios repetitivos y con distractores defectuosos por seis actividades cerradas variadas de comprensión de cifras, contraste con el uso del coche, vocabulario en contexto y traducción.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; 6 ejercicios cerrados con IDs únicos y una respuesta correcta explicada por ejercicio; 0 avisos del compilador en la 296.
- **Resultado:** correcto tras los cambios; fuente y JSON sincronizados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `296.json`.
- **Siguiente archivo pendiente:** `297.json`.

### 297/301 — `Idiomas/cursos/en/lessons/297.json`
- **Ruta:** `Idiomas/cursos/en/lessons/297.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** la lección conservaba formato de plantilla automática: título en minúscula; fichas ocultas con traducciones erróneas o en infinitivo (`writer = escribir`, `makes = hacer`, `supports = apoyar; ayudar`); falta de fichas de apoyo para palabras del texto (`school`, `useful`, `better`, `buses`, `outside`); ejercicios 3 y 4 duplicados con `Writer A.` y `Writer C.` como opciones para el hueco `if ___ remains available`; ejercicio de traducción con palabras sueltas como distractores; y actividades redundantes de ordenar y escribir la misma frase.
- **Cambios realizados:** capitalicé el título y mejoré la introducción y explicación; corregí todas las glosas ocultas y añadí análisis a las tres intervenciones (A, B y C); reemplacé las tareas repetidas o defectuosas por seis ejercicios cerrados que evalúan la postura de cada autor (A, B y C), el conector condicional `provided that`, la razón de C y la traducción completa.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; 6 ejercicios cerrados con IDs únicos y retroalimentación específica; 0 avisos del compilador en la 297.
- **Resultado:** correcto tras los cambios; fuente y JSON sincronizados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `297.json`.
- **Siguiente archivo pendiente:** `298.json`.

### 298/301 — `Idiomas/cursos/en/lessons/298.json`
- **Ruta:** `Idiomas/cursos/en/lessons/298.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** título en español en minúscula; fichas ocultas `referent` y `doors` que no aparecían en el texto; falta de fichas ocultas para `school`, `increased` y `most`; inconsistencia entre el texto (`closed for a two-year renovation` / `have risen steadily`) y los ejercicios (`was closed for two years` / `have increased steadily`); ejercicios 3 y 4 duplicados; traducción con palabras sueltas como distractores (`reforma`, `referente`); y un ejercicio de ordenar de 22 palabras junto con uno de escritura libre larga.
- **Cambios realizados:** unifiqué el texto y las preguntas, retiré las fichas sin uso, añadí las fichas ocultas y los análisis por frase, y sustituí las actividades duplicadas o de plantilla por seis ejercicios cerrados sobre secuencia cronológica, antecedente cohesivo de `Since reopening`, inserción de oración en hueco, significado de `steadily`, comprensión de detalle (`school visits`) y traducción.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; 6 ejercicios cerrados con IDs únicos y una única opción correcta explicada; 0 avisos del compilador en la 298.
- **Resultado:** correcto tras los cambios; fuente y JSON sincronizados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `298.json`.
- **Siguiente archivo pendiente:** `299.json`.

### 299/301 — `Idiomas/cursos/en/lessons/299.json`
- **Ruta:** `Idiomas/cursos/en/lessons/299.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:** el compilador avisaba de que `explanation` no tenía ficha; faltaban también fichas ocultas para `requested`, `evidence` y `recommendation`; el título español estaba en minúscula; los ejercicios 3 y 4 eran idénticos; el ejercicio de traducción tenía palabras sueltas (`comité`, `decisión`) como distractores; y los dos últimos ejercicios repetían la misma oración en ordenar y escribir.
- **Cambios realizados:** añadí `explanation` como palabra clave visible con pronunciación y completé las fichas ocultas de apoyo; añadí análisis a las tres oraciones del informe; diferencié los ejercicios de formación de palabras (`decide → decision`, `recommend → recommendation`, `explain → explanation`) y corregí los distractores de comprensión y traducción.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; 6 ejercicios cerrados con IDs únicos y una única respuesta correcta explicada; 0 avisos del compilador en la 299.
- **Resultado:** correcto tras los cambios; fuente y JSON sincronizados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `299.json`.
- **Siguiente archivo pendiente:** `300.json`.

### 300/301 — `Idiomas/cursos/en/lessons/300.json`
- **Ruta:** `Idiomas/cursos/en/lessons/300.json`; fuente editable: `_herramientas/cursos/en/42.txt`.
- **Estado:** corregido.
- **Problemas encontrados:**1) La introducción decía «Son 29 preguntas», pero el examen tiene 28 preguntas (`en300-1` a `en300-28`). 2) La pregunta 28 tenía un error en el enunciado: `The council turned ___ the plan.` con la respuesta correcta `turned it down`, lo que producía el doble verbo agramatical `*The council turned turned it down the plan.`. 3) El compilador avisaba de que `construction` e `inspected` (en la pregunta 8) no tenían ficha en el curso.
- **Cambios realizados:** corregí la introducción a «Son 28 preguntas»; reformulé la pregunta 28 como `The plan was too expensive, so the council ___. :: Lo rechazó (usando it)` para evaluar limpiamente la posición del pronombre en `turned it down` frente a `turned down it` y `turned it off`; y añadí fichas ocultas para `construction` e `inspected`.
- **Pruebas o comprobaciones ejecutadas:** compilador inglés; parseo del JSON; verificación de las 28 preguntas (`en300-1` a `en300-28`), cobertura de los capítulos 33 a 42, tres opciones por pregunta con una única respuesta correcta y 0 avisos del compilador en la 300.
- **Resultado:** correcto tras los cambios; fuente y JSON sincronizados.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

- **Último archivo completado:** `300.json`.
- **Siguiente archivo pendiente:** `capitulos.json`.

### 301/301 — `Idiomas/cursos/en/lessons/capitulos.json`
- **Ruta:** `Idiomas/cursos/en/lessons/capitulos.json`; fuente editable: `_herramientas/cursos/en/capitulos.txt`.
- **Estado:** sin cambios necesarios.
- **Problemas encontrados:** ninguno. Los 42 capítulos están numerados correlativamente del 1 al 42, todos cuentan con `titulo_en`, `titulo_es` y `descripcion` precisos y alineados con el contenido real de las 300 lecciones (A1: caps. 1–10; A2: caps. 11–22; B1: caps. 23–32; B2: caps. 33–42), y el archivo coincide exactamente con el generado por `compilar.py`.
- **Cambios realizados:** ninguno.
- **Pruebas o comprobaciones ejecutadas:** comparación con `_herramientas/cursos/en/capitulos.txt`; verificación de que todos los capítulos usados en las 300 lecciones (1–42) están definidos sin avisos del compilador y con JSON válido en UTF-8.
- **Resultado:** correcto; auditoría de las 301 entradas de inglés completada.
- **Bloqueos, dudas o decisiones pendientes:** ninguno.

# Revisión metodológica de las lecciones de francés

- Inventario: completo; 301 archivos dentro de `Idiomas/cursos/fr/lessons` (300 lecciones y `capitulos.json`), enumerados en `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: en curso, revisión secuencial.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/010.json` (corregido; cargador real sin errores ni avisos; ejercicios, vocabulario y diálogo completos).
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/011.json`.
- Incidencia del archivo 001: distractor demasiado restrictivo para «salut», guía figurada potencialmente engañosa para /ʒ/ y una formulación anticuada sobre el uso de «vous» en la fuente editable. Corregidos en la lección y sincronizados con `_herramientas/cursos/fr/01.txt`; comprobaciones satisfactorias.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/002.json` (corregido; cargador real sin errores ni avisos, 20/20 referencias léxicas y 8 ejercicios íntegros).
- Incidencia del archivo 002: la tabla no aclaraba «vous» formal singular, la guía de /ʒ/ lo aproximaba a «y» y faltaba distinguir la -e muda de «amie». Corregidos y sincronizados con la fuente editable.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/003.json`.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/003.json` (corregido; cargador real sin errores/avisos; alfabeto A–Z íntegro; ejercicios, vocabulario y diálogo completos).
- Incidencia del archivo 003: ejemplos incorrectos para la regla de j/g, /ʒ/ aproximado como «y», regla demasiado absoluta sobre e final y transcripción del nombre de E sin matiz dialectal. Verifiqué los puntos fonéticos con OQLF y University of Florida; corregidos también en `_herramientas/cursos/fr/01.txt`.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/004.json`.

- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/004.json` (corregido; cargador real sin errores/avisos; ejercicios, vocabulario y diálogo completos).
- Incidencia del archivo 004: la explicación generalizaba mayúsculas y formación femenina, y la guía de française/anglaise indicaba /s/ donde corresponde /z/. Corregidos en el JSON y sincronizados con `_herramientas/cursos/fr/02.txt`; contraste de mayúsculas comprobado con OQLF.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/005.json`.

- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/005.json` (corregido; cargador real sin errores/avisos; ejercicios, vocabulario y diálogo completos).
- Incidencias del archivo 005: generalizaciones sobre artículos y plural; pregunta ambigua sobre profesiones; cambio de `tu` a `vous` sin contexto y discordancia singular/plural entre pregunta y respuesta. Acoté reglas, aclaré `vous` en la tabla y alineé diálogo, traducciones y análisis; fuente `_herramientas/cursos/fr/02.txt` sincronizada.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/006.json`.

- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/006.json` (corregido; cargador real sin errores/avisos; ejercicios, vocabulario, tabla y diálogo completos).
- Incidencia del archivo 006: generalización del modelo -er pese a la excepción `aller` y guía /ʒ/ transcrita como «y» en `je parle`/`j'habite`. Acoté la regla, indiqué la excepción y sincronicé la pronunciación corregida con `_herramientas/cursos/fr/02.txt`.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/007.json`.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/007.json` (corregido; cargador real sin errores/avisos; 21 números, 8 ejercicios, referencias léxicas y diálogo completos).
- Incidencia del archivo 007: pronunciaciones figuradas que confundían /s/ y /z/; aproximaciones imprecisas de /ʒ/ y /ʃ/; explicación absoluta de `ans`; respuesta del apellido discordante. Corregí los puntos, ajusté el diálogo y sincronicé `_herramientas/cursos/fr/03.txt`; las 36 comprobaciones terminaron correctamente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/011.json`.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/008.json` (corregido; cargador real sin errores/avisos; 8 ejercicios, 20 referencias léxicas y 7 líneas de diálogo completas).
- Incidencias del archivo 008: excepción `mon amie` ausente; fuente con una regla absoluta sobre `de`; distractor de negación demasiado tajante. Corregí el contenido y la fuente; carga, integridad y comprobaciones pedagógicas aprobadas.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/011.json`.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/009.json` (corregido; cargador real sin errores/avisos; 8 ejercicios y diálogos completos).
- Incidencias del archivo 009: regla de género y número demasiado amplia; `sympa` mal agrupado; pronunciación de `jeune` inconsistente con /ʒ/; faltaba ejemplo explícito de 69. Corregí y sincronicé JSON y fuente; todas las comprobaciones pasaron.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/011.json`.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/010.json` (corregido; cargador real sin errores/avisos; 21 referencias léxicas, 8 ejercicios y 8 líneas de diálogo).
- Incidencias del archivo 010: transcripción incorrecta de `rouge`; reglas de plural y colores sin matiz suficiente; glosa ambigua de `ton`; forma `blanche` sin ficha. Corregí el contenido y sincronizé la fuente; las comprobaciones pasaron.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/011.json`.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/011.json` (corregido; cargador real sin errores ni avisos; 25 entradas léxicas, 8 ejercicios y diálogo completo).
- Incidencias del archivo 011: pronunciaciones figuradas incorrectas; regla incompleta sobre `nouvel`; generalizaciones sobre posición de adjetivos y negación; `voici` faltaba del vocabulario; traducción mejorable y distractores/enunciados de ejercicios imprecisos. Corregí el JSON y sincronicé `_herramientas/cursos/fr/04.txt`; todas las comprobaciones finalizaron correctamente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/012.json`.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/012.json` (corregido; cargador real sin errores ni avisos; 14 referencias léxicas, 8 ejercicios y diálogo completo).
- Incidencias del archivo 012: faltaban `dans` y `sur` del vocabulario de repaso; traducciones ambiguas de `sur`; /ʒ/ aproximado como «y»; y ejercicios con formulación o feedback imprecisos. Corregí JSON y fuente `_herramientas/cursos/fr/04.txt`; validación estructural y pedagógica aprobada.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/013.json`.
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/013.json` (corregido; cargador real sin errores ni avisos; 34 palabras de vocabulario y texto completo).
- Incidencias del archivo 013: transcripciones /ʒ/ como «y»; generalización sobre preposiciones de tiempo; vocabulario usado en la lección que no tenía ficha; traducciones y feedback mejorables. Corregí y sincronicé JSON y fuente `_herramientas/cursos/fr/05.txt`; 34/34 entradas coinciden exactamente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/014.json`.
### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/014.json` (14/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido y validado con el cargador real; 0 avisos, 13 bloques, 8 ejercicios, 15 entradas de vocabulario y 7 líneas de diálogo.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/015.json`.

### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/015.json` (15/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido y validado con el cargador real; 0 avisos, 15 bloques, 8 ejercicios, 29 palabras y 7 líneas de diálogo; 29/29 entradas léxicas coinciden con la fuente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/016.json`.

### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/016.json` (16/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido y validado con el cargador real; 0 avisos, 11 bloques, 7 ejercicios, 10 palabras y 3 líneas de diálogo; 10/10 entradas léxicas coinciden con la fuente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/017.json`.

### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/017.json` (17/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: sin cambios necesarios; cargador real con 0 avisos; 11 bloques, 7 ejercicios, 10 palabras y 5 líneas de diálogo; 10/10 entradas léxicas coinciden con la fuente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/018.json`.

### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/018.json` (18/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido y validado con el cargador real; 0 avisos, 14 bloques, 8 ejercicios, 20 palabras y 7 líneas de diálogo; tabla correcta y 20/20 fichas léxicas coinciden con la fuente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/019.json`.

### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/019.json` (19/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido y validado con el cargador real; 0 avisos, 13 bloques, 8 ejercicios, 19 palabras y 9 líneas de diálogo; tabla correcta y 19/19 entradas léxicas coinciden con la fuente.
- Nota para segunda pasada, sin alterar el orden de la primera: revisar la aproximación fonética de «voudrais» en `017.json` para unificarla con /ɛ/ (`vu-DRÈ`), observada al cotejar la expresión `je voudrais` de la lección 019.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/020.json`.

### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/020.json` (20/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido y validado con el cargador real; 0 avisos, 13 bloques, 8 ejercicios, 21 palabras y 8 líneas de diálogo; tabla correcta y 21/21 entradas léxicas coinciden con la fuente.
- Nota de segunda pasada: al completar la primera pasada, volver a 017 para revisar la vocal de la pronunciación de «voudrais» y unificar con la forma /ɛ/ documentada al revisar 019.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/021.json`.

### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/021.json` (21/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido; cargador real sin errores ni avisos; 14 bloques, 8 ejercicios, 24 fichas léxicas y 9 líneas completas; tabla correcta y 24/24 fichas coinciden con la fuente editable.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/022.json`.
### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/022.json` (22/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido; cargador real sin errores ni avisos; 13 bloques, 8 ejercicios, 19 fichas léxicas y 9 líneas completas; tabla numérica 7 × 3 y 19/19 fichas coinciden con la fuente editable.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/023.json`.
### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/023.json` (23/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido; cargador real sin errores ni avisos; 12 bloques, 8 ejercicios, 8 fichas léxicas y 4 líneas completas; tabla comparativa 4 × 2 y 8/8 fichas coinciden con la fuente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/024.json`.
### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/024.json` (24/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido; cargador real sin errores ni avisos; 12 bloques, 8 ejercicios, 24 fichas léxicas y 8 líneas completas; 24/24 fichas coinciden con la fuente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/025.json`.
### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/025.json` (25/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido; cargador real sin errores ni avisos; 17 bloques, 10 ejercicios, 25 fichas léxicas y 9 líneas completas; horario, diálogo y ejercicios consistentes; 25/25 fichas coinciden con la fuente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/026.json`.
### Revisión francesa: progreso
- Último archivo completado y verificado: `Idiomas/cursos/fr/lessons/026.json` (26/301). Informe detallado añadido a `Notas_archivos_noafectaalcodigo/informe_frances.txt`.
- Estado: corregido; cargador real sin errores ni avisos; 13 bloques, 8 ejercicios, 22 fichas léxicas y 7 líneas completas; tabla de conjugación 6 × 4 y 22/22 fichas coinciden con la fuente.
- Siguiente archivo pendiente: `Idiomas/cursos/fr/lessons/027.json`.








