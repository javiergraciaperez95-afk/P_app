# Auditoría del curso de griego moderno A1–B2

**Auditoría inicial:** 14 de octubre de 2026 · **ampliación y cierre:** 15 de octubre de 2026  
**Resultado:** ampliación implementada: 300 lecciones en total, con 176 nuevas distribuidas entre A1 y B2.

## Dictamen

El curso tiene una progresión reconocible y una buena selección inicial de situaciones cotidianas. A1 es el tramo más completo en amplitud temática. Sin embargo, el conjunto todavía funciona como prototipo de lecciones y no como recorrido equilibrado de práctica o preparación para una certificación. A medida que sube el nivel, faltan textos independientes, formatos de escucha variados y oportunidades para producir griego con respuestas aceptables diversas. Además, hay un error concreto en los ejercicios de huecos de B1.

Recomiendo llegar a **300 lecciones**, dentro del margen solicitado. El número oficial de lecciones no lo fija el Centro de Lengua Griega: 300 es una decisión editorial para dar espacio a las cuatro destrezas, consolidar la gramática y añadir tareas de comprensión y producción más realistas. La distribución propuesta es A1 67, A2 73, B1 77 y B2 83.

## Alcance de la revisión

Leí las 124 lecciones JSON (001–124), los textos fuente de autoría de A1, A2, B1 y B2, los títulos de los 40 capítulos y las partes del reproductor que determinan cómo se evalúan los ejercicios de escritura. Contrasté la cobertura con los descriptores y muestras oficiales del Centro de Lengua Griega y con el Volumen complementario del MCER del Consejo de Europa.

La revisión inicial fue estática. Después se generaron las lecciones planificadas y se corrigieron los defectos funcionales descritos en este informe. La comprobación final también fue estática: se verificaron la numeración, el JSON, los identificadores, los ejercicios señalados y los bloques de lectura. No sustituye una corrección lingüística final por un docente de griego moderno; no encontré registro de una revisión externa.

## Lo que funciona

- Hay 31 lecciones y 10 capítulos por nivel, con la secuencia A1 → A2 → B1 → B2 intacta.
- A1 presenta pronto el alfabeto, el acento y varias combinaciones de letras; después avanza hacia presentaciones, rutinas y necesidades habituales.
- Los temas pasan de la vida cotidiana a experiencias, servicios, argumentos y escritura profesional.
- La mayoría de las lecciones combina explicación breve, vocabulario, diálogo y práctica. El material aporta traducción y contexto en español.
- B1 incluye temas pertinentes —trabajo, formación, viajes, barrio, consumo y vida social—; B2 incorpora temas actuales como medios, tecnología, medioambiente y cultura.

## Qué está mal o se queda corto

### 1. Error funcional en los huecos de B1

Las 31 lecciones B1 tienen un ejercicio de huecos con tres opciones. En cada uno, la opción correcta está en griego, pero **las otras dos están en español**: 62 de las 93 opciones analizadas no contienen caracteres griegos. Por ejemplo, en la lección 063 se completa «Ελπίζω να έχω περισσότερο ___» y se ofrecen como distractores «Porque quiere estudiar en Atenas» y «Porque su familia vive en una isla». No son alternativas gramaticales ni comparables con la respuesta griega. Esas opciones hacen que el ejercicio resulte absurdo y revelan que se reutilizó una plantilla sin adaptar las respuestas.

Evidencia local: `Idiomas/cursos/el/lessons/063.json`.

### 2. La escritura abierta se corrige como si tuviera una única solución

Las 31 tareas de escritura de B1 y las 31 de B2 dan una sola respuesta modelo. Muchas consignas piden redactar ideas propias —por ejemplo, explicar una decisión, resumir un resultado o defender una postura—. La app compara el texto escrito con la respuesta modelo tras normalizar mayúsculas, puntuación y espacios; no acepta automáticamente otras formulaciones correctas. Una respuesta gramatical y adecuada puede marcarse como incorrecta por diferir de la frase de muestra. Para escritura libre hace falta una misión autoevaluada, una rúbrica o varias respuestas aceptadas; el formato actual sirve mejor para traducción o producción muy acotada.

Evidencia local: `Idiomas/js/exercises.js`, función `pintarEscribir`.

### 3. La lectura independiente cae después de A1

Conteo del bloque «texto» en los archivos publicados:

| Nivel | Lecciones | Bloques de texto | Observación |
|---|---:|---:|---|
| A1 | 31 | 29 | Presencia regular, aunque los textos son cortos. |
| A2 | 31 | 2 | Solo 8 líneas de texto en total. |
| B1 | 31 | 0 | Ningún bloque de lectura independiente. |
| B2 | 31 | 10 | Las 44 líneas reproducen líneas que ya aparecen en los diálogos de sus lecciones. |

Como medida adicional, sumé las entradas de vocabulario visibles por lección, sin deduplicar palabras repetidas: A1 491, A2 295, B1 156 y B2 214. Hay además 249 formas ocultas en B1 y 331 en B2. No son recuentos de vocabulario único, pero sí muestran que en los niveles avanzados se muestran pocas tarjetas por lección mientras aparecen muchas formas adicionales en los textos. Conviene decidir cuáles de esas formas requieren explicación o una entrada visible.

En A2 el currículo oficial contempla, entre otros, anuncios, horarios, mensajes, billetes, carteles, instrucciones y correspondencia breve. En B1 y B2 se amplía hacia información pública, noticias, artículos, reglamentos, cartas formales e informes. Las lecciones actuales suelen pedir comprensión de un diálogo breve, pero no practican suficientemente la lectura de esos géneros. El B2 final anuncia «lectura, escucha, síntesis, debate y escritura», aunque esa lección no contiene texto independiente ni tareas de síntesis a partir de dos fuentes.

### 4. La escucha mantiene un único molde

Cada nivel tiene 31 ejercicios con audio, uno por lección. En todos, la tarea es reconocer una frase y elegir su significado. El contenido no diferencia de forma suficiente entre anuncios, mensajes telefónicos, conversaciones de varias personas, noticias, charlas largas o información con datos clave. Esto queda especialmente lejos de B2: la descripción oficial contempla discursos y argumentos extensos, noticias y conversaciones con cuatro o más hablantes, además del uso del tono, el énfasis y las pausas como pistas.

### 5. Patrón de ejercicios demasiado predecible

A1 y A2 repiten siete ejercicios por lección; B1 y B2 repiten seis. La secuencia cambia poco: selección de respuesta, traducción, huecos, escucha, ordenar y escribir. Esa regularidad facilita entender la interfaz, pero no aporta la variedad de tareas que requieren los géneros oficiales ni ayuda a diagnosticar bien qué habilidad domina el estudiante. En B2, incluso el texto de lectura reutiliza el diálogo y alimenta las mismas preguntas.

### 6. Pronunciación inconsistente en B2

Las 214 entradas de vocabulario visibles de B2 carecen de guía de pronunciación. En A1, A2 y B1 las entradas visibles sí incluyen esa ayuda. En griego, la escritura y la pronunciación no se corresponden de forma transparente para un principiante; quitar la guía justo en el tramo con vocabulario más especializado hace que el aprendizaje sea menos uniforme. Las transliteraciones de niveles anteriores también deberían revisarse con una convención única y una validación experta.

### 7. Identificadores de ejercicio reciclados

Los ejercicios en A2, B1 y B2 conservan identificadores locales del tipo «el001-1» a «el031-7», los mismos que aparecen en A1: son 589 bloques de ejercicio con numeración no alineada con sus archivos 032–124. El seguimiento de progreso que revisé combina identificador de lección e identificador de ejercicio, así que no encontré evidencia suficiente para afirmar que el progreso actual se mezcle. Aun así, la numeración inconsistente es un riesgo de mantenimiento y de exportación de datos; conviene corregirla antes de ampliar el curso y mantener una clave estable por ejercicio.

### 8. Falta una comprobación editorial registrada

Los archivos no indican quién revisó las traducciones, la naturalidad de los diálogos, el uso de formas corteses, la morfología de los distractores o las guías de pronunciación. No afirmo que todo el griego esté mal; afirmo que no hay evidencia de una revisión lingüística independiente. Para publicar un curso que enseñe formas idiomáticas y diferencias de registro, esa revisión debe ser un paso de aceptación, no una suposición.

## Diagnóstico por nivel

### A1 — buena cobertura inicial; necesita práctica de recuperación y consolidación

Las 31 lecciones cubren alfabeto, datos personales, familia, vivienda, tiempo, comidas, compras, ciudad, ocio, invitaciones, salud y viaje. Es la base más amplia. Conviene reforzar comprensión de formatos breves, deletreo, pronunciación, género/plural y producción de mensajes. El descriptor oficial A1 combina comprensión y producción oral y escrita, presentaciones, datos personales y necesidades inmediatas.

### A2 — temas útiles; faltan textos prácticos y más funciones de autonomía

Sus 31 lecciones cubren vivienda, rutinas, comidas, compras, ocio, pasado, viaje, salud, trabajo y gestiones. El problema más visible es que apenas hay lectura continua. Hay que añadir práctica con anuncios, horarios, mensajes, billetes, recetas, formularios y breves intercambios telefónicos; también pedir repetición o aclaración cuando no se entiende. El descriptor oficial A2 incluye intercambios sencillos sobre temas habituales, lectura de información previsible y escritura breve en tono formal o familiar.

### B1 — buen repertorio temático; corregir primero la plantilla de huecos

Los temas actuales son adecuados para el nivel, pero los diálogos cortos concentran casi todo el material de comprensión. Faltan textos independientes, anuncios y noticias de interés, información de transporte/servicios, audios con detalles y práctica explícita de cómo tomar el turno, dirigirse a alguien, elegir familiaridad o formalidad y cerrar una interacción. Los criterios oficiales B1 ponen énfasis tanto en esa autonomía cotidiana como en las convenciones sociales y no verbales.

### B2 — temas ambiciosos; falta la densidad de discurso y de géneros que exige el nivel

El repertorio de temas es un punto fuerte. Sin embargo, las interacciones son diálogos de cuatro o cinco líneas y los textos «de lectura» son esas mismas líneas. Para B2 hace falta más discurso extendido, lectura de fuentes diversas, comparación de posturas, matices, corrección propia, colocaciones, expresiones idiomáticas y diferencias de registro. Las muestras oficiales B2 incluyen cinco destrezas: comprensión lectora, uso de la lengua, comprensión oral, producción escrita y producción oral. La app cubre la interacción por selección y escritura acotada con más facilidad que una producción abierta o hablada; eso limita cualquier afirmación de preparación integral para el examen.

## Ampliación implementada hasta 300 lecciones

Las listas siguientes identifican las **176 lecciones nuevas generadas**. La ampliación trabaja los huecos anteriores con nuevos textos, diálogos y tareas; se añadieron al capítulo correspondiente sin renumerar las 124 lecciones originales.

| Nivel | Ahora | Añadir | Total del nivel |
|---|---:|---:|---:|
| A1 | 31 | 36 | 67 |
| A2 | 31 | 42 | 73 |
| B1 | 31 | 46 | 77 |
| B2 | 31 | 52 | 83 |
| **Total** | **124** | **176** | **300** |

### A1 — añadir 36 lecciones

**Sonidos y escritura**

1. Distinguir vocales y consonantes parecidas al oído
2. Leer combinaciones de letras dentro de palabras cotidianas
3. Marcar el acento y reconocer la entonación de preguntas

**Pedir ayuda y confirmar**

4. Decir que no se ha entendido y pedir que repitan
5. Deletrear un nombre y anotar un teléfono
6. Confirmar datos antes de terminar una gestión

**Presentaciones y datos**

7. Completar un formulario sencillo de llegada
8. Presentar a un compañero con nombre, origen y ocupación
9. Escribir un perfil personal de cinco frases

**Consolidar gramática básica**

10. Elegir artículo y género con sustantivos frecuentes
11. Formar plurales frecuentes y concordar adjetivos
12. Preguntar y negar en conversaciones cortas

**Calendario y horarios**

13. Encontrar una fecha en un calendario
14. Entender horarios de apertura y cierre
15. Concertar o cambiar una cita sencilla

**Casa y ubicación**

16. Describir los muebles de una habitación
17. Explicar dónde está un objeto en casa
18. Leer un anuncio breve de una habitación

**Compras prácticas**

19. Preguntar cuánto cuesta una cantidad concreta
20. Pedir una talla y decir que algo no queda bien
21. Explicar que se busca cambiar un producto

**Salud básica**

22. Decir qué duele y desde cuándo
23. Entender una instrucción sencilla de farmacia
24. Concertar una consulta y dar los datos necesarios

**Transporte**

25. Encontrar hora y andén en un horario
26. Entender un anuncio simple de cambio o retraso
27. Pedir indicaciones y comprobar que se han entendido

**Mensajes sociales**

28. Invitar por mensaje e indicar hora y lugar
29. Aceptar o rechazar una invitación con cortesía
30. Cambiar un plan con una llamada breve

**Lectura y escucha breve**

31. Encontrar quién, dónde y cuándo en un cartel
32. Escuchar un mensaje y anotar un dato clave
33. Seguir indicaciones breves con un plano sencillo

**Cierre A1**

34. Presentarse en un intercambio guiado de principio a fin
35. Escribir una postal breve sobre un día habitual
36. Repaso integrado A1: información personal y necesidades inmediatas

### A2 — añadir 42 lecciones

**Pasado y secuencia**

1. Distinguir una acción terminada de una situación habitual pasada
2. Ordenar una anécdota con expresiones temporales
3. Contar un imprevisto y explicar cómo terminó

**Planes y cambios**

4. Hablar de planes próximos con fecha y hora
5. Acordar un encuentro y confirmar los detalles
6. Avisar de un cambio de plan por mensaje o teléfono

**Vivienda y mantenimiento**

7. Comparar dos anuncios de alquiler
8. Preguntar por gastos, servicios y transporte cercano
9. Explicar una avería sencilla y pedir que la arreglen

**Consulta y farmacia**

10. Describir síntomas con duración y frecuencia
11. Pedir al médico que aclare una instrucción
12. Comprender cómo y cuándo tomar un medicamento

**Compras y reclamaciones simples**

13. Preguntar por ingredientes y cantidades
14. Comparar dos productos por precio y calidad
15. Devolver un producto y explicar el motivo

**Viajes y reservas**

16. Comparar dos opciones de transporte
17. Reservar alojamiento y confirmar condiciones
18. Resolver una demora o un cambio de billete

**Trabajo y estudios**

19. Entender un horario de trabajo o de clase
20. Dejar un mensaje con motivo y datos de contacto
21. Pedir que repitan una instrucción de trabajo

**Gestiones y formularios**

22. Rellenar un formulario de alojamiento
23. Enviar un paquete y preguntar por el coste
24. Comprender un pago, recibo o movimiento bancario sencillo

**Textos cotidianos**

25. Leer un anuncio de actividad y localizar sus condiciones
26. Entender un horario, billete o aviso de servicio
27. Leer una nota personal e inferir una palabra por contexto

**Escucha cotidiana**

28. Comprender un mensaje de voz con dos datos concretos
29. Entender una previsión meteorológica breve
30. Seguir un anuncio público de transporte

**Relaciones sociales**

31. Hacer una invitación con una alternativa de fecha
32. Felicitar y responder a una felicitación
33. Rechazar una invitación y proponer otro plan

**Escritura breve**

34. Escribir un correo para reservar una habitación
35. Escribir una nota de agradecimiento
36. Contar por mensaje qué se hizo durante el fin de semana

**Cierre A2**

37. Describir una vivienda y justificar una preferencia
38. Narrar un día pasado con orden claro
39. Pedir información y resolver un problema de viaje
40. Comprender un conjunto de cartel, horario y mensaje
41. Miniinteracción A2: servicio, aclaración y cierre cortés
42. Repaso integrado A2: temas familiares y necesidades habituales

### B1 — añadir 46 lecciones

**Convenciones sociales y turnos**

1. Llamar la atención e iniciar una consulta con naturalidad
2. Tomar el turno, interrumpir con tacto y cerrar una conversación
3. Elegir entre formas familiares y corteses según la situación

**Servicios y problemas inesperados**

4. Explicar un problema en una oficina y pedir opciones
5. Entender condiciones, plazos y documentos necesarios
6. Negociar una solución y comprobar los próximos pasos

**Información pública**

7. Comprender un cambio de andén y sus consecuencias
8. Escuchar información de tráfico o meteorología y extraer detalles
9. Dejar y recuperar un mensaje telefónico completo

**Conversaciones de varias personas**

10. Identificar quién sostiene cada opinión
11. Separar idea principal y detalles de apoyo
12. Pedir una aclaración y reformular lo entendido

**Noticias y actualidad**

13. Comprender la noticia principal de un boletín breve
14. Distinguir un hecho de un comentario personal
15. Contar una noticia con palabras propias

**Vida laboral**

16. Relatar experiencia y responsabilidades en una entrevista
17. Preguntar por horarios, condiciones y tareas
18. Explicar un desacuerdo de trabajo de manera respetuosa

**Formación**

19. Comprender normas de un curso y sus fechas
20. Explicar una dificultad y pedir una prórroga
21. Comparar dos opciones de formación y justificarlas

**Narración y pasado**

22. Alternar contexto y hechos terminados en un relato
23. Contar un incidente con principio, problema y desenlace
24. Transmitir lo que otra persona dijo o pidió

**Consejos y decisiones**

25. Explicar un problema cotidiano y pedir consejo
26. Proponer dos soluciones y comparar sus efectos
27. Recomendar una opción con una razón y una condición

**Consumo y reclamaciones**

28. Describir un defecto y aportar información comprobable
29. Responder a una reclamación con tono apropiado
30. Escribir una queja clara y pedir una solución concreta

**Ciudad y entorno**

31. Entender una propuesta vecinal y sus condiciones
32. Explicar las causas de un problema local
33. Presentar una mejora y anticipar una objeción

**Cultura y ocio**

34. Resumir el argumento de una película o un libro
35. Escribir una reseña con valoración y ejemplos
36. Recomendar una actividad según los intereses de otra persona

**Lectura funcional**

37. Interpretar un anuncio o reglamento breve
38. Leer una noticia y localizar sus datos principales
39. Comprender un correo semiformal y responder en el registro adecuado

**Mediación y reformulación**

40. Explicar a otra persona la información esencial de un aviso
41. Resumir dos mensajes y señalar en qué difieren
42. Explicar con palabras sencillas un término desconocido

**Cierre B1**

43. Simulación de llamada: problema, aclaración y solución
44. Simulación social: iniciar, mantener y cerrar una conversación
45. Repaso de escritura B1 con propósito, destinatario y registro
46. Repaso integrado B1: comprensión y respuesta a una situación nueva

### B2 — añadir 52 lecciones

**Escucha extensa**

1. Seguir una charla estructurada y distinguir tesis y ejemplos
2. Comprender un argumento con concesión y contraargumento
3. Tomar notas y resumir una exposición breve

**Debate y varias voces**

4. Seguir un debate de varias personas e identificar posturas
5. Reconocer desacuerdo implícito, énfasis y matices del tono
6. Intervenir, ceder el turno y responder espontáneamente

**Lectura de prensa y fuentes**

7. Analizar propósito y postura en un artículo de opinión
8. Comparar la cobertura del mismo hecho en dos fuentes
9. Distinguir información, interpretación y lenguaje persuasivo

**Datos y evidencia**

10. Interpretar una tabla o gráfico con cautela
11. Explicar límites de una muestra y evitar generalizaciones
12. Relacionar datos de dos documentos para llegar a una conclusión

**Argumentación avanzada**

13. Construir una tesis con evidencia y ejemplos pertinentes
14. Conceder un punto sin abandonar la postura propia
15. Responder a una objeción con matices y una conclusión

**Registro y expresiones**

16. Reformular una petición coloquial en registro formal
17. Reconocer colocaciones y expresiones idiomáticas en contexto
18. Detectar ironía, exageración y cortesía indirecta

**Temas técnicos y abstractos**

19. Entender una explicación técnica de un tema familiar
20. Explicar un concepto especializado a un público general
21. Debatir una cuestión ética con argumentos contrapuestos

**Políticas y sociedad**

22. Evaluar ventajas y costes de una medida pública
23. Comparar soluciones ante un problema social
24. Presentar una recomendación con condiciones de seguimiento

**Informes y propuestas**

25. Organizar un informe con propósito, hallazgos y conclusión
26. Redactar una propuesta apoyada en datos
27. Revisar cohesión, precisión y tono en un informe

**Correspondencia profesional**

28. Redactar una petición formal con contexto y objetivo
29. Responder a una queja o desacuerdo profesional
30. Ajustar una carta según destinatario y grado de formalidad

**Presentaciones orales**

31. Estructurar una exposición con introducción, desarrollo y cierre
32. Explicar los datos de una presentación sin leerlos literalmente
33. Responder preguntas y reconocer límites de la propuesta

**Cultura y textos creativos**

34. Interpretar un fragmento narrativo con apoyo en el texto
35. Reconocer perspectiva, metáfora y efecto de una elección verbal
36. Comparar dos interpretaciones de una obra

**Mediación entre fuentes**

37. Sintetizar dos posturas sin borrar sus diferencias
38. Atribuir ideas y distinguir cita, paráfrasis e inferencia
39. Transmitir a un público concreto una información compleja

**Comprensión de documentos**

40. Leer un reglamento e identificar propósito y excepciones
41. Comprender una carta formal y localizar obligaciones
42. Analizar un informe y separar conclusión de evidencia

**Corrección y precisión**

43. Corregir concordancia y selección de preposición en contexto
44. Sustituir repeticiones por referencias claras
45. Revisar conectores para que expresen la relación lógica correcta

**Cierre B2**

46. Escribir un texto argumentativo equilibrado
47. Debatir una propuesta y resumir el acuerdo alcanzado
48. Sintetizar lectura y escucha en una respuesta estructurada
49. Simular una tarea de uso de la lengua en contexto
50. Repaso de registro formal, familiar e idiomático
51. Repaso de autocorrección y reformulación espontánea
52. Simulación integrada B2 de las cinco destrezas

## Resultado y comprobaciones

- El curso queda en **A1: 67**, **A2: 73**, **B1: 77** y **B2: 83** lecciones; los archivos 001–300 están presentes y la metadata del curso indica 300.
- Se generaron seis ejercicios por lección nueva. Las nuevas tareas de escritura —y las tareas abiertas heredadas de B1 y B2— se guardan como autoevaluación: muestran criterios y un modelo posible, aceptan cualquier producción y no la puntúan como acierto o error. Los ejercicios nuevos tienen identificadores globales; los heredados mantienen sus claves para no perder el progreso.
- Los 31 huecos B1 heredados se corrigieron: todas sus opciones son griegas. La comprobación encontró **cero** distractores en español en esos huecos y en los nuevos huecos B1.
- Las 176 lecciones nuevas incluyen un bloque de lectura de tres frases temáticas y un guion de escucha distinto por lección. La escucha aparece antes del texto de apoyo; diálogo y lectura no repiten frases literalmente. También se sustituyeron las lecturas copiadas del diálogo en las 31 lecciones B2 existentes. La revisión estática no encontró solapamientos exactos entre diálogo y lectura en las ampliaciones ni en el B2 heredado.
- Las 214 palabras visibles de B2 que ya existían recibieron una guía de pronunciación aproximada; las palabras visibles de B2 nuevas también tienen guía. La comprobación encontró **cero** tarjetas visibles sin pronunciación en B2.
- El compilador produjo JSON válido para todos los lotes, sin opciones repetidas. Sus avisos fueron léxicos: ampliación A1 **272** (256 palabras sin ficha individual y 16 ya enseñadas), A2 **261** (239 y 22), B1 **397** (387 y 10) y B2 **472** (457 y 15); regenerar las 31 lecciones heredadas de B2 añade 93 palabras sin ficha. Cada frase tiene traducción española y la ampliación incorpora una palabra visible por lección, pero la cobertura de tarjetas para guardar sigue incompleta; hace falta una pasada de vocabulario antes de considerar el curso editorialmente cerrado.
- La escucha nueva varía el contenido por lección, aunque el ejercicio sigue usando selección de respuesta y texto griego como entrada. La app no evalúa producción oral ni sustituye una valoración humana. Para afirmar preparación integral del examen B2, hacen falta tareas orales y una revisión lingüística externa con registro de cambios y aprobación por nivel.

## Fuentes oficiales consultadas

- [Centro de Lengua Griega: A1 para adolescentes y adultos](https://www.greek-language.gr/certification/node/97.html)
- [Centro de Lengua Griega: nivel A2](https://www.greek-language.gr/certification/node/98.html)
- [Centro de Lengua Griega: nivel B1](https://www.greek-language.gr/certification/node/99.html)
- [Centro de Lengua Griega: nivel B2](https://www.greek-language.gr/certification/node/101.html)
- [Centro de Lengua Griega: estructura de los exámenes](https://www.greek-language.gr/certification/node/119.html)
- [Centro de Lengua Griega: muestras B1](https://www.greek-language.gr/certification/node/142.html)
- [Centro de Lengua Griega: muestras B2 y cinco destrezas examinadas](https://www.greek-language.gr/certification/node/149.html)
- [Consejo de Europa: Volumen complementario del MCER (2020)](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4)

Las páginas del Centro de Lengua Griega consultadas describen objetivos oficiales por nivel y enlazan estructuras y muestras de examen; no establecen un número obligatorio de lecciones para un curso.
