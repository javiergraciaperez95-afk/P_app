# Auditoría crítica del curso de sueco A1–B2

**Fecha:** 14 de octubre de 2026  
**Estado inicial de la auditoría:** 124 lecciones, 40 capítulos, 806 ejercicios y 1.741 fichas de vocabulario.
**Estado tras la implementación:** 304 lecciones, 40 capítulos, 2.066 ejercicios y 1.931 fichas visibles de vocabulario.

## Resumen ejecutivo

El curso ofrece una base útil para situaciones cotidianas y una progresión temática reconocible: presentaciones y necesidades inmediatas en A1; más independencia en A2; narración, gestiones y opiniones en B1; y argumentación, fuentes y registro en B2. La arquitectura es consistente y el contenido se integra en el formato existente.

La auditoría inicial encontró que la cantidad de lecciones y la regularidad del formato no equivalían a una cobertura suficiente de los niveles. El curso no incluye grabaciones propias: sí puede leer frases con la voz sueca sintetizada del dispositivo cuando está disponible. También encontré que las actividades originales priorizaban respuestas breves y que B2 contenía errores editoriales y fichas de vocabulario añadidas principalmente para satisfacer el validador.

Propuse ampliar el curso a **304 lecciones**: añadir 45 a cada nivel. Para conservar la navegación y los identificadores de los 40 capítulos existentes, integré los nuevos temas como lecciones dentro de capítulos del mismo nivel y asunto, en vez de crear capítulos 41–100 que aparecerían detrás del B2. El plan temático aparece al final de este informe.

## Alcance y criterio

Revisé los 40 archivos fuente originales y los 124 identificadores de lección. Después añadí 180 lecciones temáticas, 45 por nivel, y comprobé la estructura JSON generada, los tipos de ejercicios, el orden de capítulos y el catálogo del curso. La compilación final declara cero avisos de estructura/vocabulario; eso no demuestra por sí solo que cada explicación o traducción sea perfecta.

Usé los [descriptores del MCER](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4) para juzgar la progresión. En B2 se esperan, entre otras cosas, comprensión de textos complejos, interacción con fluidez, y producción de textos claros y detallados que sinteticen y valoren información de varias fuentes. El [plan de estudios de SFI de Skolverket](https://syllabuswebb.skolverket.se/subject/SFI/11/pdf) plantea además cinco ámbitos que deben evaluarse de forma integrada: comprensión auditiva, comprensión lectora, interacción oral, producción oral y escritura. Su curso SFI D fue una referencia de contenidos en sueco, **no una equivalencia oficial con B2**: Skolverket dice expresamente que los criterios de sus cursos SFI no están vinculados a niveles concretos de la escala europea ([aclaración oficial](https://www.skolverket.se/kompetensutveckling/stod-i-arbetet/gemensam-europeisk-referensram-for-sprak-gers)).

## Hallazgos iniciales

Los hallazgos de esta sección describen el curso antes de añadir las nuevas lecciones.

### 1. Desbalance entre cobertura y capacidades

Los cuatro niveles tienen 31 lecciones cada uno. Los temas cotidianos están presentes, pero el número de lecciones no reserva suficiente espacio para volver sobre ellos con textos más largos, lenguaje menos predecible y tareas que integren varias destrezas. Un título como «evaluar fuentes» no basta para acreditar esa habilidad si el material es un párrafo creado para el ejercicio y la respuesta consiste en elegir una opción.

### 2. Falta comprensión auditiva y pronunciación practicable

El catálogo sueco declara `audio: false`, que en esta app significa que el curso no incluye grabaciones propias. La app puede usar síntesis de voz del dispositivo, pero la disponibilidad depende de que haya una voz sueca instalada. A1 incluía «Escucha el saludo» (01.txt, línea 4) y «Escucha expresiones cortas» (07.txt, línea 109), sin aclarar esa dependencia. Corregí esas instrucciones para que pidan leer y practicar; las lecciones nuevas incluyen una actividad de escucha con voz sintetizada. Esto permite una práctica básica, pero no sustituye grabaciones naturales ni evaluación de producción oral.

### 3. Producción e interacción demasiado breves

El patrón dominante era predecible: diálogo o texto corto, preguntas cerradas, traducción, hueco, ordenar una frase y escribir una frase modelo. La ampliación añade situaciones y diálogos progresivos de aclaración, además de escucha sintetizada. Siguen faltando turnos espontáneos, monólogos largos, redacción extensa y revisión con rúbrica; esta app no registra producción oral. El volumen de ejercicios no equivale por sí solo a evaluación de nivel.

### 4. Problemas concretos de calidad detectados

- **B2, capítulo 33:** el objetivo de la primera lección está en inglés: “Resume two positions in a meeting and move the group toward a concrete decision” (33.txt, línea 2).
- **B2, capítulo 35:** la introducción mezcla español y sueco con «reklam» (35.txt, línea 2). La explicación completa está en sueco, sin indicar el cambio de idioma (línea 3).
- **B2, capítulo 39:** otra explicación completa está en sueco, también sin indicación de cambio de idioma (39.txt, línea 87).
- **B2, capítulo 38:** «Alterna imperfecto y pretérito» traslada categorías del español de forma confusa a la descripción de los tiempos suecos (38.txt, línea 87). Conviene explicar los usos del preteritum y del perfecto suecos con ejemplos, sin presentarlos como equivalentes mecánicos del imperfecto y el pretérito españoles.
- **B2, capítulo 34:** la ficha «en sambandet» combina artículo y forma definida de manera incorrecta. La entrada debe ser **ett samband** o **sambandet**, según se quiera enseñar la forma indefinida o definida. SAOL registra samband como neutro, con forma definida sambandet.
- **B2, capítulo 36:** «en trovärdig = creíble» presenta un artículo delante de un adjetivo como si fuera una unidad léxica independiente. Debe enseñarse **trovärdig** como adjetivo o incluir un sustantivo: **en trovärdig källa**.

Estos errores se corrigieron en las fuentes originales. También ajusté la explicación de los tiempos suecos, retiré una ficha duplicada del adjetivo **trovärdig** y mantuve una ficha contextual correcta en la lección donde se usa.

### 5. El recuento de vocabulario no es una medida fiable de progresión

Al inicio de la auditoría, el curso tenía 1.741 fichas por lección. La distribución era irregular: A1 tenía 495, A2 285, B1 463 y B2 498. No eran 1.741 palabras únicas; se repetían entradas y se mezclaban lemas con formas flexionadas como bilen, förslaget, dagar o tydligare. Durante la producción de B2 se agregaron muchas fichas a partir de palabras de ejercicios para eliminar avisos automáticos, lo que infló el glosario. La ampliación posterior mantuvo un vocabulario más acotado: sus expresiones se incluyen con una traducción contextual. **Cero avisos no es una revisión lingüística.**

### 6. Faltan fuentes y evaluación en temas sensibles o de actualidad

Los ejemplos de salud, contratos y consentimiento digital son ficticios y breves. Funcionan como práctica lingüística, pero no son recomendaciones médicas, legales o de privacidad. La ampliación mantiene esa separación: las frases de ejemplo no afirman reglas o consejos vigentes. Si en el futuro se añaden afirmaciones factuales, deben apoyarse en fuentes oficiales suecas y enseñar a distinguir información, consejo y obligación.

### 7. Diagnóstico por nivel

| Nivel | Lo que ya cubre | Qué falta reforzar |
|---|---|---|
| **A1** | Presentaciones, casa, comida, compras, ciudad, salud y mensajes simples. | Alfabeto y pronunciación sistemáticos; números, fechas y deletreo; plural y concordancia; negación y preguntas; lectura de rótulos; escucha guiada real. |
| **A2** | Rutinas, tiendas, trabajo, salud, viajes, pasado y mensajes. | Más autonomía con anuncios, horarios, instrucciones y cartas; narraciones algo más largas; planes y cambios de planes; variedad de interlocutores y comprensión auditiva. |
| **B1** | Relatos, opiniones, noticias breves, gestiones, reclamaciones, cultura y escritura. | Orden en subordinadas y posición de inte; tiempos y aspecto, relativas, pasiva y partículas; comprensión de textos/noticias más extensos; interacción y escritura con borrador y revisión. |
| **B2** | Argumentación, contraste de fuentes, reuniones, informes, reseñas, medioambiente y registro. | Comprensión de audio natural; textos auténticos y extensos; síntesis real de varias fuentes; producción oral y escrita sostenida; gramática avanzada sistemática, idiomatismos, pragmática y cultura sueca más amplia. |

## Objetivo recomendado: 304 lecciones

El curso tenía 124 lecciones. Añadir **180** lo lleva a **304**, dentro del rango solicitado. La propuesta agrupó 45 lecciones por nivel en 15 unidades temáticas de tres lecciones. En la implementación esas unidades temáticas se integraron como lecciones dentro de los capítulos existentes para conservar la navegación y los identificadores.

| Nivel | Lecciones iniciales | Nuevas | Total actual | Unidades temáticas propuestas |
|---|---:|---:|---:|---|
| A1 | 31 | 45 | 76 | 41–55 |
| A2 | 31 | 45 | 76 | 56–70 |
| B1 | 31 | 45 | 76 | 71–85 |
| B2 | 31 | 45 | 76 | 86–100 |
| **Total** | **124** | **180** | **304** | **60 unidades temáticas; 40 capítulos en la app** |

Los números 41–100 de las tablas identifican unidades temáticas de este plan, no capítulos visibles en la web. Las nuevas lecciones se integraron en capítulos 1–40 relacionados por nivel y tema.

## Lecciones propuestas para añadir

Cada fila representa un capítulo de tres lecciones. El último capítulo de cada nivel debe funcionar como integración y autoevaluación dentro de esas tres lecciones.

### A1 — 45 lecciones nuevas

| Cap. | Lección 1 | Lección 2 | Lección 3 |
|---|---|---|---|
| 41 | Reconocer y pronunciar å, ä y ö | Distinguir vocales largas y breves | Practicar acento y ritmo en palabras frecuentes |
| 42 | Deletrear nombres y apellidos | Dar teléfonos, direcciones y correos | Decir números, precios y cantidades sencillas |
| 43 | Presentar a otra persona | Decir nacionalidad e idiomas | Completar una ficha personal breve |
| 44 | Formar plurales frecuentes | Contrastar forma indefinida y definida | Concordar adjetivos con en, ett y plural |
| 45 | Usar pronombres y presente | Formar preguntas sencillas | Colocar inte y dar instrucciones breves |
| 46 | Decir horas y cuartos de hora | Nombrar meses y fechas | Leer un calendario y un horario simple |
| 47 | Nombrar muebles y objetos | Usar preposiciones de lugar | Describir una habitación con frases conectadas |
| 48 | Comprar cantidades y envases | Preguntar por ingredientes | Entender una receta de pocos pasos |
| 49 | Preguntar por tallas y colores | Comprar o cambiar una prenda | Describir el tiempo y elegir ropa apropiada |
| 50 | Leer rótulos del barrio | Preguntar por un lugar con referencias | Seguir un recorrido en un mapa sencillo |
| 51 | Leer un horario de transporte | Comprar un billete y confirmar destino | Comprender un aviso sencillo de retraso |
| 52 | Nombrar partes del cuerpo y síntomas | Pedir una cita | Entender instrucciones sencillas y pedir aclaración |
| 53 | Decir ocupación y lugar de trabajo | Describir tareas y horarios | Pedir ayuda en clase o en el trabajo |
| 54 | Invitar, aceptar y rechazar con cortesía | Cambiar una cita por teléfono | Escribir un mensaje breve con lugar y hora |
| 55 | Explicar qué habitación buscas | Pedir ayuda con cortesía | Escribir un mensaje corto para una situación cotidiana |

### A2 — 45 lecciones nuevas

| Cap. | Lección 1 | Lección 2 | Lección 3 |
|---|---|---|---|
| 56 | Entender un anuncio de alquiler | Describir un problema de vivienda | Acordar una reparación con el propietario |
| 57 | Comparar precio y calidad | Devolver un producto y explicar por qué | Presentar una queja sencilla por un servicio |
| 58 | Explicar preferencias de comida | Preguntar por ingredientes y alergias | Seguir y contar una receta sencilla |
| 59 | Comparar rutas y horarios | Reservar alojamiento con fechas concretas | Resolver un cambio de viaje |
| 60 | Describir una rutina semanal | Proponer una hora y confirmar disponibilidad | Avisar que llegarás tarde o cambiarás el plan |
| 61 | Contar qué pasó ayer | Ordenar una historia con primero, después y al final | Diferenciar experiencia reciente y momento pasado |
| 62 | Hablar de planes con ska y tänker | Expresar una condición sencilla | Organizar un plan alternativo si algo cambia |
| 63 | Explicar tareas habituales de trabajo | Entender instrucciones y normas sencillas | Pedir un cambio de turno |
| 64 | Comprender información de un curso | Preguntar por requisitos y fechas | Escribir al profesor para pedir información |
| 65 | Completar un formulario de servicio | Entender una carta o aviso municipal sencillo | Llamar para preguntar qué documentos se necesitan |
| 66 | Explicar desde cuándo tienes un síntoma | Comprender indicaciones sencillas de cuidado | Describir hábitos y cambios en una consulta |
| 67 | Hablar de relaciones y planes sociales | Discrepar con cortesía | Expresar sentimientos y preferencias |
| 68 | Leer una noticia breve conocida | Interpretar una tabla de horarios o precios | Comparar dos avisos y encontrar el dato útil |
| 69 | Escribir un correo informal | Escribir una solicitud breve y cortés | Redactar instrucciones o un relato corto |
| 70 | Comprender un cambio de viaje | Contar una experiencia conectada | Repaso A2: comprender, escuchar y escribir frases de viaje |

### B1 — 45 lecciones nuevas

| Cap. | Lección 1 | Lección 2 | Lección 3 |
|---|---|---|---|
| 71 | Relatar un acontecimiento con contexto | Narrar acciones paralelas y un cambio | Cerrar un relato con reflexión personal |
| 72 | Contrastar pretérito y perfecto en contexto | Hablar de hábitos pasados y cambios | Introducir anterioridad con pluskvamperfekt |
| 73 | Mantener el orden en subordinadas | Colocar inte y adverbios frecuentes | Formular preguntas indirectas |
| 74 | Usar relativas con som | Hablar de personas y objetos con pronombres | Combinar oraciones sin repetir sustantivos |
| 75 | Expresar obligación, posibilidad y consejo | Plantear hipótesis y consecuencias | Reconocer pasiva en noticias e instrucciones |
| 76 | Aprender verbos con partículas frecuentes | Usar verbos y preposiciones en contexto | Ampliar colocaciones de trabajo y vida diaria |
| 77 | Comprender expresiones de una entrevista | Identificar la pregunta y la información principal | Distinguir una valoración de un dato |
| 78 | Leer instrucciones y normas sencillas | Interpretar gráficos y datos cotidianos | Resumir un artículo factual más extenso |
| 79 | Mantener una conversación de varios turnos | Pedir aclaración y reformular | Resolver una tarea en grupo y resumir acuerdos |
| 80 | Escribir una reclamación con argumentos | Redactar un informe de una página | Revisar cohesión, registro y errores frecuentes |
| 81 | Preparar una entrevista de trabajo | Explicar un proyecto y sus resultados | Presentar una propuesta y responder preguntas |
| 82 | Leer un requisito de un servicio público | Preguntar dónde enviar una solicitud | Encontrar una actualización en un aviso digital |
| 83 | Leer un relato breve y comentar personajes | Hablar de una costumbre sueca con contexto | Escribir una reseña con ejemplos |
| 84 | Evaluar una publicación en línea | Adaptar un mensaje al destinatario | Participar en un intercambio digital con cortesía |
| 85 | Comprender una noticia y explicarla oralmente | Escribir un texto conectado con revisión | Repaso B1 con autoevaluación por destreza |

### B2 — 45 lecciones nuevas

| Cap. | Lección 1 | Lección 2 | Lección 3 |
|---|---|---|---|
| 86 | Identificar la idea principal de una intervención | Comprender la función de una objeción | Reconocer una expresión de duda en voz sintetizada |
| 87 | Leer un artículo de opinión extenso | Comprender una crónica o ensayo cultural | Analizar instrucciones complejas del ámbito propio |
| 88 | Orden de palabras en subordinadas extensas | Posición de adverbios y negación | Transformar preguntas directas e indirectas |
| 89 | Usar pasiva y formas impersonales | Nominalizar para resumir información | Elegir entre formas verbales y nominales |
| 90 | Dominar verbos con partículas por significado | Aprender colocaciones y preposiciones | Reconocer idiomatismos frecuentes y registro |
| 91 | Interrumpir, retomar y ceder la palabra | Matizar desacuerdo sin perder claridad | Reparar malentendidos y comprobar interpretación |
| 92 | Construir un argumento con datos | Responder a objeciones en un debate | Moderar una discusión y cerrar con síntesis |
| 93 | Contrastar afirmaciones de dos fuentes | Parafrasear y atribuir una idea | Señalar incertidumbre compartida por dos estudios |
| 94 | Planificar un ensayo de varias partes | Desarrollar razones y contraargumentos | Revisar estructura, cohesión y precisión |
| 95 | Redactar una reclamación formal compleja | Escribir una solicitud profesional | Ajustar tono, cortesía y nivel de formalidad |
| 96 | Comprender textos sobre instituciones suecas | Comparar costumbres con perspectiva intercultural | Explicar una tradición con fuentes verificables |
| 97 | Participar en una reunión de proyecto | Presentar resultados con gráficos | Redactar un informe profesional con recomendación |
| 98 | Evaluar una noticia de salud o ciencia | Explicar incertidumbre y límites de datos | Comparar impactos de una medida ambiental |
| 99 | Comprender ironía y postura en línea | Escribir una publicación para distintos públicos | Debatir privacidad y tecnología con fuentes |
| 100 | Reconocer afirmaciones que discrepan | Formular por escrito una defensa breve | Repasar una propuesta y fijar un objetivo de aprendizaje |

## Implementación y resultado

Se añadieron 180 lecciones: 45 a cada nivel. El curso queda en 304 lecciones, con 76 por nivel. Las nuevas unidades temáticas se alojan dentro de los 40 capítulos existentes para que la web siga presentando primero A1 (capítulos 1–10), luego A2 (11–20), B1 (21–30) y B2 (31–40), sin renumerar el material original. Los números 41–100 identifican los bloques fuente temáticos; cada línea `@` apunta al capítulo visible correspondiente.

Cada lección nueva practica una expresión en contexto con vocabulario, un diálogo de aclaración graduado, comprensión, traducción, completar, ordenar, escritura breve y una actividad de escucha sintetizada. Las frases de cada unidad se incorporan de forma progresiva. La compilación final genera 2.066 ejercicios y 1.931 fichas visibles, y termina con cero avisos.

También corregí los problemas editoriales de B2 descritos arriba, aclaré los usos de *preteritum* y *perfekt* suecos y cambié las instrucciones de A1 que prometían escuchar sin explicitar la dependencia de una voz del dispositivo.

La ampliación no convierte la app en un curso con grabaciones naturales, evaluación de pronunciación, turnos de habla grabados, ensayos largos ni análisis de documentos reales. Los ejercicios siguen el formato breve de la página. Por eso, las nuevas lecciones mejoran la cobertura y la práctica, pero no demuestran por sí solas el dominio completo de cada nivel del MCER.

## Fuentes consultadas

- [Consejo de Europa: CEFR Companion Volume (2020)](https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4). Referencia de descriptores para comprensión, interacción, producción y mediación.
- [Skolverket: plan de estudios oficial de SFI](https://syllabuswebb.skolverket.se/subject/SFI/11/pdf). Incluye pronunciación, comprensión oral y escrita, interacción, producción, escritura, estrategias, fuentes y herramientas digitales.
- [Skolverket: relación entre GERS/MCER y los cursos SFI](https://www.skolverket.se/kompetensutveckling/stod-i-arbetet/gemensam-europeisk-referensram-for-sprak-gers). Aclara que los criterios de aprobación de SFI no corresponden a niveles concretos del MCER.
- [Institutet för språk och folkminnen: las letras å, ä y ö](https://frageladan.isof.se/faqs/27384). Referencia oficial para el alfabeto sueco.
- [Konsumentverket: permanencia y cancelación de contratos de telecomunicaciones](https://www.konsumentverket.se/varor-och-tjanster/bindningstid-och-uppsagningstid/). Fuente pública para el vocabulario temático sobre contratos; los diálogos del curso son ejemplos ficticios y no resumen el asesoramiento legal.
- [IMY: consentimiento como base jurídica para tratar datos personales](https://www.imy.se/verksamhet/dataskydd/det-har-galler-enligt-gdpr/rattslig-grund/samtycke/). Referencia oficial de privacidad para el vocabulario sobre consentimiento; los ejemplos son ficticios.
- [Folkuniversitetet: curso de sueco B2](https://www.folkuniversitetet.se/kurser-utbildningar/sprak/svenskaswedish/svenska-b2/svenska-b2-tva-tre-dagar-i-veckan/malmo/93317/). Referencia práctica no oficial: combina conversación, pronunciación, comprensión auditiva, lectura, escritura, gramática y cultura.
- [Svenska Akademiens ordböcker: samband](https://svenska.se/?activeTab=alla&q=samband). Verificación de la forma nominal samband/sambandet.
