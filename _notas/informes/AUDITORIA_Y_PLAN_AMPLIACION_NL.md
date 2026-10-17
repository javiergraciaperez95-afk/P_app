# Auditoría del curso de neerlandés y propuesta de ampliación

**Fecha:** 14 de octubre de 2026  
**Alcance:** revisión de las 126 lecciones compiladas, los 40 capítulos y las fuentes de autoría `_herramientas/cursos/nl/01.txt`–`40.txt`. La auditoría no modifica el curso.

## Dictamen

El curso tiene una progresión temática reconocible y cubre situaciones útiles, pero todavía no justifica presentar sus cuatro tramos como una ruta completa de A1 a B2. La debilidad principal no es la cantidad actual, sino el tipo de práctica: casi todas las lecciones usan el mismo diálogo breve y el mismo bloque de ejercicios cerrados. En particular, B2 carece de textos y audios extensos, escritura libre, síntesis entre fuentes y evaluación de desempeño. Además, cuatro ejercicios de completar de B2 tienen respuestas incorrectas o huecos mal construidos.

Recomiendo ampliar a **300 lecciones** mediante **174 lecciones nuevas**: 39 para A1, 42 para A2, 45 para B1 y 48 para B2. Es una decisión de diseño para dar espacio a más destrezas y tareas, no una cifra oficial del ERK.

## Qué contrasté

- Los 126 JSON de lección, sus títulos, palabras, bloques y ejercicios; y el recuento de lecciones por capítulo.
- Las 40 fuentes de autoría y la estructura repetida de las lecciones. Revisé manualmente la correspondencia entre diálogo y respuesta de los 33 ejercicios de huecos de B2.
- Los criterios públicos del Consejo de Europa y la Nederlandse Taalunie para descriptores, destrezas y tareas de neerlandés como lengua extranjera.

La distribución actual es **A1: 31; A2: 31; B1: 31; B2: 33**, total **126**. Hay 40 capítulos: diez por nivel. El capítulo de cierre de cada uno de los tres primeros niveles tiene una lección adicional; el cierre B2 tiene seis.

## Hallazgos

### 1. Cuatro respuestas de hueco de B2 no coinciden con el diálogo

La comprobación de cada respuesta contra la frase fuente detecta estos fallos concretos:

| Lección | Problema | Corrección que debería revisarse |
| --- | --- | --- |
| 103, «Elegir críticamente una formación» | El hueco pregunta «Heb je ook naar de ___ gekeken?», pero la respuesta es `toelatingseisen`; en el diálogo la frase usa `studielast`. | Cambiar la respuesta a `studielast`, o cambiar el ejercicio para que pregunte «Je moet wel aan de ___ voldoen» y acepte `toelatingseisen`. |
| 113, «Valorar una película con matices» | El hueco reproduce «vond je hem ___?», cuya palabra en el diálogo es `overtuigend`; figura `gelaagd`. | Usar `overtuigend`. |
| 120, «Comparar experiencias y expectativas» | El hueco acaba en `___en`, pero la respuesta ya es `verwachtingen`; al insertarla se duplica la terminación. | Dejar `___` para que la respuesta completa sea `verwachtingen`. |
| 122, «Resumir varias perspectivas» | La frase es «rekening houden met beide ___» y el diálogo dice `belangen`; figura `groepen`. | Usar `belangen`. |

Esto requiere una pasada editorial de ejercicios sobre todos los niveles, no solo confiar en que la compilación detecte problemas de significado.

### 2. Las cinco destrezas del ERK no están equilibradas

En los cuatro niveles cada lección tiene la misma combinación general: explicación, lista de vocabulario, diálogo, tres preguntas de opción múltiple, dos ejercicios de traducción/reconocimiento, un hueco, ordenar una frase y reproducir una respuesta. Los bloques JSON muestran **cero lecturas independientes (`T`)** en el curso revisado.

El bloque de escritura `X` pide traducir al neerlandés una oración cuya respuesta ya aparece en el diálogo. No evalúa un correo, relato, reseña, argumento o respuesta propia. El audio `A` trabaja una frase del mismo diálogo y elige su traducción; no hay escucha de discurso largo, entrevista, anuncio extenso ni toma de notas.

Eso deja poco espacio para leer, escuchar y producir textos completos, hablar sin guion o mantener una interacción real. La falta es más grave en B1/B2: el descriptor B2 incluye comprender textos complejos, interactuar con fluidez y producir textos detallados con razones y ventajas/inconvenientes, según la [escala global del Consejo de Europa](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale/).

### 3. El molde didáctico se repite incluso cuando sube el nivel

Las 33 lecciones B2 conservan diálogos de seis intervenciones y los mismos ocho ejercicios. La explicación añade un objetivo propio de cada tema, pero repite en todas la misma instrucción genérica sobre conectores y subordinadas. No enseña ni comprueba de forma progresiva recursos como concesión, atribución de fuentes, cohesión entre párrafos, registro, reformulación o argumentación extensa.

El número medio de palabras visibles de vocabulario baja de aproximadamente 13 en A1, 10,5 en A2 y 9,9 en B1 a **6 en B2**. En la compilación final de B2 quedaron **328 avisos de palabras sin ficha de apoyo** o de ejercicios que heredan esa falta. Para un nivel que necesita matizar y comprender temas abstractos, el vocabulario y sus ejemplos necesitan una revisión deliberada.

### 4. «Repaso final» no equivale todavía a evaluación de nivel

Los cierres A1–B2 siguen siendo lecciones del mismo tipo que las anteriores. El B2 termina con diálogo y ejercicios de opción múltiple, ordenación y traducción exacta; no hay una tarea final abierta con criterios para comprensión, producción, interacción y mediación. Conviene llamar a estas unidades «repaso» hasta que incluyan evidencia de desempeño y una pauta de evaluación.

### 5. El alineamiento con fuentes oficiales se debe describir con precisión

El ERK describe lo que una persona puede hacer en distintos niveles; no prescribe un número oficial de lecciones ni un índice único de temas de neerlandés. La Taalunie presenta sus [leerlijnen de neerlandés como lengua extranjera](https://taalunie.org/informatie/378/leerlijnen-nederlands-als-vreemde-taal) como una guía de objetivos y materiales, y su [banco ERK](https://erk-nederlands.taalunie.org/voorbeelden-van-taken-en-prestaties/) ofrece tareas por nivel y destreza. Por eso, la ruta actual puede llamarse **inspirada/alineada de forma general con el ERK**, pero no un temario oficial cerrado ni una certificación de nivel.

### 6. Revisión lingüística y traducción

Los diálogos cubren contextos variados y en general son comprensibles, pero el curso necesita una pasada de neerlandés nativo y de correspondencia neerlandés-español antes de ampliarse. Hay expresiones cuya naturalidad o matiz merece validación contextual. Por ejemplo, la pregunta B2 «Viel de conferentie mee met je verwachtingen?» se traduce como «¿Estuvo a la altura de tus expectativas?», que puede perder el matiz de `meevallen` («resultar mejor/menos mal de lo esperado»). No la contaría como error definitivo sin una revisión lingüística contextual, pero sí como punto editorial que debe verificarse.

## Lo que sí funciona

- La progresión temática va de necesidades concretas y vida diaria (A1/A2) a experiencias, trabajo, comunidad y opiniones (B1), y luego a argumentación, información y negociación (B2).
- Se reutilizan temas entre niveles —trabajo, viajes, medios, sostenibilidad, cultura y participación local—, lo que permite una progresión en espiral si las tareas se vuelven más exigentes.
- La estructura de datos es consistente: 126 archivos de lección y 40 capítulos, con títulos y contenidos diferenciados por nivel.
- Hay práctica recurrente de comprensión de frases, vocabulario, huecos y orden de palabras; es útil como andamiaje inicial, aunque no basta como práctica completa de nivel.

## Plan recomendado para llegar a 300

La ampliación añade **58 unidades de tres lecciones cada una** (174 en total). Las cifras de cada nivel resultante sirven para planificar cobertura; no son cuotas del Consejo de Europa ni de la Taalunie. La unidad de tres lecciones debería variar los modos de trabajo: una tarea receptiva, una de práctica guiada y una de producción/interacción, en vez de repetir tres diálogos equivalentes.

| Nivel | Actual | Añadir | Total propuesto | Unidades nuevas |
| --- | ---: | ---: | ---: | ---: |
| A1 | 31 | 39 | 70 | 13 |
| A2 | 31 | 42 | 73 | 14 |
| B1 | 31 | 45 | 76 | 15 |
| B2 | 33 | 48 | 81 | 16 |
| **Total** | **126** | **174** | **300** | **58** |

### A1 — añadir 39 lecciones (13 unidades)

1. **Sonidos y pronunciación:** Distinguir vocales neerlandesas; practicar `g`, `ch` y `sch`; reconocer acento y deletrear nombres difíciles.
2. **Verbos básicos y orden:** Conjugar `zijn` en frases y preguntas; usar `hebben` para posesión; construir oraciones con verbos frecuentes en presente.
3. **Artículos y nombres:** Elegir `de` o `het` con apoyo; formar plurales habituales; combinar sustantivos con adjetivos y demostrativos sencillos.
4. **Preguntas y negación:** Hacer preguntas de sí/no; preguntar con `wie`, `wat`, `waar` y `wanneer`; distinguir `niet` y `geen` en frases cotidianas.
5. **Datos personales y formularios:** Completar nombre y contacto; escribir dirección, fecha y nacionalidad; pedir que repitan o corrijan un dato.
6. **Fechas, precios y recibos:** Leer fechas y calendarios; preguntar precios y cantidades; entender los datos principales de un recibo sencillo.
7. **Casa y barrio:** Localizar objetos y habitaciones; describir una vivienda; comunicar una avería sencilla y pedir ayuda.
8. **Comida y necesidades:** Leer un menú básico; pedir aclaraciones sobre ingredientes o alergias; pedir la cuenta y pagar.
9. **Cuerpo y salud inmediata:** Nombrar partes del cuerpo; explicar un síntoma básico y su duración; comprender instrucciones simples de farmacia.
10. **Transporte cotidiano:** Consultar horarios sencillos; comprar un billete y preguntar por el andén; comprender indicaciones y señales habituales.
11. **Interacción social básica:** Pedir que hablen más despacio; disculparse y agradecer en situaciones comunes; aceptar o rechazar una invitación brevemente.
12. **Mensajes y servicios básicos:** Comprender un SMS breve; escribir una nota sencilla; pedir ayuda en una ventanilla o servicio local.
13. **Repaso A1 por tareas:** Comprender un horario y un anuncio; presentarse y resolver una necesidad en una conversación; escribir un mensaje personal breve.

### A2 — añadir 42 lecciones (14 unidades)

1. **Contar experiencias recientes:** Formar el perfecto con verbos regulares; practicar participios frecuentes irregulares; preguntar y responder sobre experiencias recientes.
2. **Pasado y descripción:** Contrastar perfecto e imperfecto; describir hábitos y situaciones pasadas; narrar un recuerdo con principio, desarrollo y final.
3. **Conectores y causa:** Ordenar eventos con conectores temporales; explicar causas con `omdat`; expresar resultados y contrastes sencillos.
4. **Citas y llamadas:** Concertar o cambiar una cita por teléfono; dejar un mensaje con los datos necesarios; confirmar fecha, hora y lugar.
5. **Viaje con varios pasos:** Leer una reserva y un itinerario; resolver un cambio de tren; explicar una incidencia en alojamiento.
6. **Vivienda y convivencia:** Entender normas básicas de alquiler; pedir una reparación con detalles; negociar tareas y horarios en casa.
7. **Servicios y trámites:** Completar un formulario común; pedir información en una oficina; entender una carta breve sobre una cita o solicitud.
8. **Trabajo diario:** Comprender instrucciones de una tarea; explicar un horario o ausencia; escribir un mensaje breve a un compañero o supervisor.
9. **Cursos y formación:** Comparar dos cursos por horario y contenido; preguntar por requisitos; explicar una elección con razones sencillas.
10. **Pagos y servicios:** Comprender una factura; preguntar por un cargo o fecha de pago; solicitar una devolución o corrección sencilla.
11. **Salud y seguimiento:** Describir evolución de síntomas; entender una recomendación y su frecuencia; explicar cómo ha seguido un consejo.
12. **Recetas e instrucciones:** Comprender una receta; ordenar pasos y cantidades; explicar un procedimiento doméstico sencillo.
13. **Lectura práctica:** Extraer datos de anuncios; identificar la acción pedida en un correo; comparar información de dos avisos breves.
14. **Escritura y simulación A2:** Escribir una petición por correo; contar una experiencia en un texto conectado; completar una simulación de viaje/servicio con lectura, escucha e interacción.

### B1 — añadir 45 lecciones (15 unidades)

1. **Relatos conectados:** Narrar un acontecimiento en varios párrafos; explicar un cambio de planes; cerrar una historia con reflexión y detalles relevantes.
2. **Explicar cómo se hace algo:** Dar instrucciones por etapas; comprobar que otra persona entendió; redactar un procedimiento claro.
3. **Viajes e imprevistos complejos:** Comparar alternativas de transporte; llamar para resolver una incidencia; redactar una reclamación con hechos y petición.
4. **Reuniones de trabajo:** Presentar avances y problemas; pedir aclaraciones y resumir acuerdos; dar y recibir comentarios con ejemplos.
5. **Empleo y selección:** Preparar una presentación personal; redactar un correo para una candidatura; responder preguntas de entrevista con ejemplos.
6. **Estudios y proyectos:** Explicar un objetivo de formación; resumir fuentes de un proyecto; presentar método, resultados y límites de forma sencilla.
7. **Servicios públicos:** Describir un problema a una oficina; completar una solicitud con explicación; proponer una solución y justificarla.
8. **Noticias y fuentes:** Resumir una noticia; separar dato y opinión; atribuir afirmaciones y explicar qué información falta.
9. **Debate y argumentos:** Defender una opinión con razones; reconocer y contestar una objeción; matizar una conclusión según la evidencia.
10. **Escritura funcional B1:** Redactar un correo formal breve; escribir una queja ordenada; preparar un informe corto de un incidente.
11. **Consulta y bienestar:** Describir síntomas y su impacto; comparar dos consejos; resumir instrucciones de seguimiento a otra persona.
12. **Consumo y sostenibilidad:** Comparar opciones con criterios claros; explicar costes y consecuencias; recomendar una medida con reservas.
13. **Reseñas y cultura:** Resumir una obra; sostener una valoración con ejemplos; comparar dos interpretaciones sin perder el hilo.
14. **Comunicación digital:** Participar en un intercambio escrito; evaluar una fuente sencilla; responder a un desacuerdo con tono adecuado.
15. **Repaso B1 por desempeño:** Escuchar y resumir información; escribir un texto conectado de opinión o experiencia; participar en una conversación con preguntas imprevistas.

### B2 — añadir 48 lecciones (16 unidades)

1. **Artículos y opiniones implícitas:** Identificar tesis y tono; inferir presupuestos y postura del autor; contrastar editoriales sobre el mismo asunto.
2. **Informes y datos:** Leer un informe y una gráfica; distinguir evidencia de interpretación; explicar límites de una conclusión estadística.
3. **Escucha extensa:** Seguir una entrevista con argumentos; tomar notas de una charla; resumir un pódcast atribuyendo cada postura.
4. **Debate oral y seguimiento:** Presentar una postura con estructura; responder preguntas no preparadas; reformular o conceder un punto sin abandonar la tesis.
5. **Mediación entre fuentes:** Combinar dos textos y una tabla; transmitir información a un público distinto; resumir acuerdos y desacuerdos con atribución.
6. **Ensayo argumentativo:** Redactar introducción y tesis; desarrollar razones y contraargumento; cerrar con una recomendación proporcional a la evidencia.
7. **Informes y propuestas:** Escribir un informe comparativo; proponer opciones con costes y consecuencias; redactar recomendaciones con límites y condiciones.
8. **Correspondencia formal avanzada:** Ajustar cortesía y registro; redactar una reclamación o solicitud documentada; responder a una objeción formal.
9. **Exposición profesional:** Diseñar una presentación clara; resumir material técnico de la especialidad; contestar preguntas y corregir una respuesta imprecisa.
10. **Interacción espontánea:** Entrar y salir de una discusión; invitar a otras personas a intervenir; negociar turnos y desacuerdos con naturalidad.
11. **Negociar opciones:** Identificar intereses y condiciones; proponer concesiones recíprocas; documentar el acuerdo y los asuntos pendientes.
12. **Matiz y postura:** Practicar concesión y reserva; expresar probabilidad y grado de certeza; sostener una postura sin afirmaciones absolutas.
13. **Sintaxis avanzada en uso:** Controlar orden verbal en subordinadas; usar pasiva y estilo indirecto; revisar referencias pronominales y estructuras largas.
14. **Cohesión, registro y colocaciones:** Enlazar párrafos con variedad; elegir colocaciones y expresiones idiomáticas en contexto; distinguir registro formal e informal.
15. **Variación y temas sociales:** Comparar usos de Países Bajos y Flandes; debatir tecnología, privacidad o educación; mediar entre perspectivas culturales distintas.
16. **Evaluación integrada B2:** Leer un texto complejo y escuchar una entrevista; redactar una síntesis argumentada con fuentes; presentar y defender conclusiones en interacción abierta.

## Orden de trabajo antes de publicar la ampliación

1. Corregir los cuatro ejercicios B2 señalados y revisar que todos los huecos tengan una única respuesta que coincida literalmente con su frase fuente.
2. Añadir fichas de apoyo traducidas para el vocabulario realmente necesario; volver a compilar y clasificar cada aviso restante como error o decisión pedagógica intencional.
3. Variar los tipos de tarea por destreza y por nivel; reservar las preguntas de opción múltiple como una parte del curso, no como formato dominante.
4. Revisar nivel, neerlandés idiomático y traducción española con una persona competente en neerlandés, sobre todo en B2 y en diferencias Países Bajos/Flandes.
5. Convertir las unidades finales de cada nivel en tareas abiertas con criterios observables, incluyendo comprensión, escritura, habla, conversación e integración de información.

## Referencias consultadas

- [Consejo de Europa: escala global del MCER/CEFR](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale/)
- [Consejo de Europa: aspectos cualitativos de la interacción oral](https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use)
- [Taalunie: leerlijnen Nederlands als Vreemde Taal](https://taalunie.org/informatie/378/leerlijnen-nederlands-als-vreemde-taal)
- [Taalunie: ejemplos de tareas y desempeños por destreza](https://erk-nederlands.taalunie.org/voorbeelden-van-taken-en-prestaties/)
- [Taalunie: explicación del ERK y sus cinco destrezas](https://erk-nederlands.taalunie.org/over-het-erk/)
- [Taalunie: material de expresión oral para neerlandés como lengua extranjera](https://taalunie.org/feeds/download/nvt-leerlijn-spreekvaardigheid-63873.pdf/nvt-leerlijn-spreekvaardigheid-63873/original)
