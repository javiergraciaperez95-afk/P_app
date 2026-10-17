# Auditoría Curricular Integral A1–B2: Curso de Español (`es`)

**Fecha de emisión:** 16 de octubre de 2026  
**Especialidad:** Lingüística Aplicada, Diseño Curricular MCER y Desarrollo de Contenidos Paglot  
**Ámbito de aplicación:** Curso completo de español (`Idiomas/cursos/es/lessons/001.json` a `320.json` y `capitulos.json`)  
**Documentos y fuentes de referencia inspeccionados:**
- `Idiomas/cursos/es/lessons/capitulos.json` e inventario completo de 320 lecciones JSON
- Registro histórico de revisión individual previa: `Notas_archivos_noafectaalcodigo/informe_espanol.txt`
- Motor de validación y cargador de lecciones: `Idiomas/js/lessons.js`
- Componentes de interfaz y agrupación de capítulos: `Idiomas/js/vistas/lecciones.js`, `Idiomas/js/vistas/leccion.js` y `Idiomas/js/juego/motor.js`
- Marcos de referencia oficiales: *Plan Curricular del Instituto Cervantes (PCIC: Niveles de Referencia A1–B2)*, especificaciones de examen *DELE (A1, A2, B1, B2)*, *Servicio Internacional de Evaluación de la Lengua Española (SIELE Global)*, descriptores ilustrativos del *Marco Común Europeo de Referencia para las lenguas (MCER / Companion Volume)*, *Diccionario de la lengua española (DLE / RAE-ASALE)* y *Diccionario panhispánico de dudas (DPD)*.

---

## 1. Resumen Ejecutivo y Diagnóstico Global

El curso de español para hablantes de otras lenguas consta actualmente de **320 lecciones estructuradas en 26 capítulos**, cubriendo el itinerario completo desde el nivel Acceso (**A1**) hasta el nivel Usuario Independiente Avanzado (**B2**).

A diferencia de los cursos de otras lenguas de la plataforma (como italiano o danés, donde más del 50% del catálogo fue generado mediante plantillas clónicas automatizadas con idéntica retroalimentación), el curso de español presenta una **calidad pedagógica, estilística y discursiva de partida sobresaliente**:
1. **Riqueza textual y variedad de actividades:** Cuenta con 1.920 ejercicios contextualizados (618 de opción múltiple, 719 de rellenar huecos, 303 de ordenar frases, 152 de traducción y 128 de respuesta construida/escritura).
2. **0 colisiones de preguntas duplicadas:** El escaneo formal confirma que no existen preguntas clonadas ni duplicadas dentro de una misma lección en ninguno de los 320 archivos.
3. **Amplio caudal léxico real:** El glosario general alcanza **5.306 entradas léxicas** correspondientes a **4.205 lemas únicos**, integrados en interacciones discursivas vivas, muestras dialectales de España e Hispanoamérica y textos periodísticos auténticos.

Sin embargo, la auditoría forense y curricular identifica **tres problemas estructurales y técnicos críticos** que deben ser subsanados en la Fase 4:

```
Total Curso: 320 Lecciones
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│        Lecciones Revisadas (001–175)          │         Lecciones Pendientes (176–320)        │
│              175 lecciones (54,7%)            │              145 lecciones (45,3%)            │
└───────────────────────────────────────────────┴───────────────────────────────────────────────┘
  • Vocabulario completo con categorías y género.  • Más de 1.100 palabras sin categoría gramatical.
  • Corrección fonética y sociolingüística fina.   • 17 lecciones con diccionario plano no conforme.
  • Notas contrastivas España / Hispanoamérica.   • Monolingües en inglés (sin soporte vi/zh).
```

### Métricas Generales del Curso
- **Archivos analizados:** 320 lecciones JSON (`001.json` a `320.json`) + 1 índice `capitulos.json`.
- **Lecciones revisadas exhaustivamente (Fase previa):** 175 lecciones (54,7% del curso).
- **Lecciones pendientes de revisión y armonización:** 145 lecciones (45,3% del curso).
- **Ejercicios evaluables:** 1.920 actividades interactivas (promedio de 6,0 ejercicios/lección).
- **Lecciones con bloque inoperable «Your turn: write and speak»:** 293 lecciones (91,6%).
- **Lecciones con vocabulario plano anómalo (string simple):** 17 lecciones (`304.json` a `320.json`).
- **Desarticulación secuencial por apéndice final:** 27 lecciones (`294.json` a `320.json`) asignadas dispersamente a capítulos anteriores sin ordenación numérica coherente.

---

## 2. Procedencia y Estado Histórico del Curso: El Hito de la Lección 175

El archivo histórico `Notas_archivos_noafectaalcodigo/informe_espanol.txt` atestigua el proceso editorial previo. En él se registró una revisión minuciosa lección a lección de los archivos `001.json` a `175.json`:
- **Trabajo completado en 001–175:**
  * Corrección de generalizaciones falsas sobre fonética (como la afirmación errónea de que la «h» es muda universalmente sin advertir préstamos o variaciones dialectales, o que la pronunciación interdental de «c/z» rige en todo el mundo hispanohablante).
  * Inclusión de distinciones sociolingüísticas indispensables (*tú*, *usted*, *vosotros*, *ustedes* y presencia del *voseo* en el Cono Sur y Centroamérica).
  * Asignación sistemática de categorías gramaticales (`sustantivo`, `verbo`, `adjetivo`, etc.) y género morfológico (`m` / `f`).
  * Armonización bidireccional entre la lista visible de vocabulario de la lección y el glosario interno de palabras.
- **Estado de las lecciones 176 a 320:**
  * En `informe_espanol.txt`, todas las lecciones a partir de la 176 figuran con `Estado: pendiente`.
  * Aunque las lecciones 176 a 293 fueron redactadas con rigor conceptual y cubren temáticas de gran madurez (economía, política, justicia, ciencia, arte, literatura y registros coloquial vs. formal), no recibieron el pulido de datos ni el cotejo de metadatos.
  * Como consecuencia directa, en este lote existen más de 1.100 palabras carentes del campo `cat`, sustantivos sin `genero` explícito y explicaciones gramaticales con pequeños desajustes normativos (como catalogar *personaje* con femenino *la personaje* en L176, en contra de la norma académica de sustantivo epiceno masculino).

---

## 3. Diagnóstico Técnico y Estructural

### 3.1. Inexistencia de Preguntas Clonadas y Ausencia de Plantillas Degenerativas
El análisis automatizado sobre los 1.920 ejercicios arrojó un resultado sobresaliente: **0 preguntas duplicadas dentro de una misma lección**.
A diferencia de otros idiomas donde se generaron lecciones con consignas metalingüísticas artificiales (*«¿Qué frase reproduce la forma del segundo ejemplo?»* o *«Completa con la forma adecuada»* repetida de forma indiscriminada), en español cada ejercicio cuenta con:
- Enunciados específicos y contextualizados.
- Opciones didácticas contrastivas con distractores plausibles.
- Ausencia del molde clónico de retroalimentación genérica (`El texto lo indica` / `El texto no afirma eso`).

### 3.2. La Anomalía de las Lecciones 304 a 320: Diccionario Plano no Conforme
El cargador oficial de la aplicación (`Idiomas/js/lessons.js`) define la estructura canónica del diccionario de una lección:
```json
"palabras": {
  "palabra": {
    "en": "translation",
    "pron": "fonetica",
    "cat": "sustantivo",
    "genero": "m",
    "nota": { "en": "explicación" }
  }
}
```
En las **17 lecciones que van de la 304 a la 320**, las entradas léxicas (145 términos en total) se introdujeron bajo un formato plano no estructurado:
```json
"palabras": {
  "vocal": "vowel",
  "letra": "letter",
  "sonido": "sound"
}
```
Aunque `lessons.js` implementa un mecanismo de tolerancia que parsea cadenas planas, esta degradación técnica:
1. Priva al alumno de la transcripción fonética simplificada (`pron`).
2. Impide categorizar gramaticalmente el término en el cuaderno de repaso (`cat`).
3. Oculta el género gramatical en sustantivos (`genero`), induciendo a errores de concordancia.
4. Anula las notas de uso contextual (`nota` / `consejo`).

### 3.3. El Bloque Inoperable «Your turn: write and speak» (293 lecciones)
En **293 de las 320 lecciones** se insertó sistemáticamente un bloque de tipo `explicacion` con el encabezado:
> `Your turn: write and speak`  
> `**The app cannot check this part.** For the writing, please use pen and paper. For the speaking, say it out loud and, if you can, practise with a native speaker or a teacher who can correct you...`

Este bloque plantea una contradicción de diseño de producto:
- La plataforma Paglot está concebida para la autoevaluación interactiva inmediata y no dispone de módulo de corrección de textos libres ni de reconocimiento de voz con retroalimentación cualitativa.
- Confesar al estudiante en el 91,6% de las lecciones que la aplicación es incapaz de evaluar la actividad genera frustración.
- **Recomendación técnica para la Fase 4:** Mantener estas propuestas comunicativas como sugerencias pedagógicas opcionales fuera de la barra de progreso evaluable o reconvertirlas progresivamente en actividades autocorregibles guiadas (reordenación de argumentos, selección del registro adecuado o pruebas de reescritura controlada).

### 3.4. Desarticulación Secuencial del Apéndice Final (Lecciones 294 a 320)
Las lecciones 294 a 320 se agregaron al repositorio como un apéndice final en lugar de intercalarse numéricamente dentro de sus capítulos naturales.
Debido a que ninguna lección del curso especifica los atributos `numero_curso` u `orden_curso`, el motor asigna por defecto el valor numérico del identificador del archivo (`Number(id)`):

| Cap. | Nivel | Título del Capítulo | Lecciones Base | Lecciones Añadidas al Final | Salto en la Interfaz |
|:---:|:---:|:---|:---:|:---:|:---|
| **01** | A1 | Primeros pasos | 001 a 006 | **304, 305** | Tras la lección 6, la tarjeta salta a la 304 |
| **06** | A1 | Compras y salud | 048 a 056 | **306** | Salto de la 56 a la 306 |
| **07** | A2 | Planes y pasado | 057 a 071 | **309** | Salto de la 71 a la 309 |
| **09** | A2 | Situaciones | 088 a 103 | **307, 310** | Salto de la 103 a la 307 y 310 |
| **10** | A2 | Vida y cultura | 104 a 115 | **308** | Salto de la 115 a la 308 |
| **11** | B1 | Opinar y prever | 116 a 124 | **294, 311** | Salto de la 124 a la 294 y 311 |
| **12** | B1 | El subjuntivo | 125 a 138 | **295, 315** | Salto de la 138 a la 295 y 315 |
| **13** | B1 | Contar y conectar | 139 a 152 | **314** | Salto de la 152 a la 314 |
| **14** | B1 | De tú a tú | 153 a 158 | **296** | Salto de la 158 a la 296 |
| **16** | B1 | Trabajo, viajes y ocio | 169 a 177 | **313** | Salto de la 177 a la 313 |
| **17** | B1 | El mundo | 178 a 186 | **312** | Salto de la 186 a la 312 |
| **19** | B2 | Hipótesis | 201 a 211 | **298** | Salto de la 211 a la 298 |
| **20** | B2 | Matices | 212 a 231 | **297** | Salto de la 231 a la 297 |
| **21** | B2 | Trato y conversación | 232 a 245 | **299** | Salto de la 245 a la 299 |
| **23** | B2 | La vida práctica | 253 a 261 | **316** | Salto de la 261 a la 316 |
| **24** | B2 | Sociedad y actualidad | 262 a 270 | **300, 302, 317, 318** | Salto de la 270 a la 300, 302, 317, 318 |
| **25** | B2 | Cultura y naturaleza | 271 a 280 | **301, 319** | Salto de la 280 a la 301 y 319 |
| **26** | B2 | Palabras y registro | 281 a 293 | **303, 320** | Salto de la 293 a la 303 y 320 |

Este desajuste provoca que un alumno que navegue por lecciones o capítulos experimente saltos absurdos de numeración (p. ej., estar en el Capítulo 1 de A1 elemental y ver las lecciones `006` y seguidamente la `304`). En la Fase 4 es imperativo reordenar de forma lógica o consolidar `numero_curso` para garantizar la continuidad pedagógica.

---

## 4. Auditoría Curricular Nivel a Nivel (MCER / PCIC / DELE / SIELE)

A continuación se evalúa la solidez del diseño curricular contrastando los contenidos reales del curso con los inventarios del *Plan Curricular del Instituto Cervantes* y las directrices del MCER.

```
Distribución Curricular del Curso de Español
┌───────────┬───────────┬───────────┬───────────┐
│  Nivel A1 │  Nivel A2 │  Nivel B1 │  Nivel B2 │
│  59 Lecc. │  63 Lecc. │  93 Lecc. │ 105 Lecc. │
│  (18,4%)  │  (19,7%)  │  (29,1%)  │  (32,8%)  │
└───────────┴───────────┴───────────┴───────────┘
```

### 4.1. Nivel A1: Acceso (Capítulos 01 al 06 | 59 lecciones)
- **Estado de revisión:** 56 lecciones corregidas (001 a 056); 3 lecciones pendientes (304, 305, 306).
- **Competencias Gramaticales y Funcionales Evaluadas:**
  * *Presentación e interacción elemental (Cap. 01):* Fórmulas de saludo y despedida por franjas horarias (L001), presentaciones con *llamarse* y pronombres sujeto (L002), deletreo y sonido de las letras (L003), números 0–100 (L004, L005), distinción pragmática *tú* / *usted* con mención al *voseo* (L006).
  * *Identificación, descripción y sintagma nominal (Cap. 02):* *Ser* para origen y nacionalidad (L007), artículos determinados/indeterminados y morfología de género/número con excepciones habituales como *el agua* (L008), concordancia adjetival (L009), *estar* para estados y ubicaciones elementales (L010), presente regular de indicativo de las tres conjugaciones (L011), léxico de familia (L013, L015), posesivos átonos (L014), interrogativos (L016), profesiones y descripción física con *tener* (L017, L018).
  * *Espacio urbano, vivienda y existencia (Cap. 03):* Oposición crucial *hay* (existencia indeterminada) vs. *está/están* (localización de elementos definidos) (L020, L021), demostrativos *este/ese/aquel* (L023), partes de la casa y mobiliario (L024, L025), movimiento con *ir a* y contracciones *al* / *del* (L027), expresión de la hora (L028).
  * *Gustos, preferencias y restauración (Cap. 04):* Verbo *gustar* singular/plural y pronombres indirectos (L031), *encantar* y gustar con infinitivo (L032), verbos de diptongación y modales *querer, poder, preferir* (L030), interacción transaccional en bar y restaurante (L029, L037).
  * *Rutina diaria y presente irregular (Cap. 05):* Verbos reflexivos y rutina (*levantarse, ducharse, vestirse*) (L038, L039), adverbios de frecuencia (L040), presentes de 1ª persona irregular en *-go* (*hago, salgo, pongo, tengo, vengo*) (L041), perífrasis de simultaneidad *estar + gerundio* (L042), obligación personal con *tener que + inf.* (L043), distinción *saber* vs. *conocer* (L044), fechas y clima con *hacer/haber/estar* (L045, L046), imperativo afirmativo regular de *tú* para instrucciones básicas de clase (L047).
  * *Comercio, cuerpo y salud elemental (Cap. 06):* Compras, precios y demostrativos en tienda (L048, L049), ropa y colores (L050, L051), numerales hasta el millón (L052), partes del cuerpo (L053), construcciones con *doler* (L054), estados físicos con *tener* (*hambre, sed, sueño, frío, calor*) (L055), cuantificadores indefinidos *mucho, poco, demasiado* (L056).
- **Lecciones Añadidas en A1 (Pendientes):**
  * L304 (*Letras y sonidos frecuentes*): Fonética contrastiva fundamental (b/v, r/rr, c/z, g/j, h, ñ). Necesita convertir vocabulario plano a estructurado.
  * L305 (*La sílaba tónica y la tilde*): Reglas de acentuación de palabras agudas, llanas y esdrújulas. Vocabulario plano a estructurado.
  * L306 (*Leer lo que necesitas*): Comprensión lectora de carteles, horarios y avisos públicos de A1. Vocabulario plano a estructurado.
- **Dictamen A1:** Excelente solidez metodológica y cobertura total de los requerimientos DELE A1.

---

### 4.2. Nivel A2: Plataforma (Capítulos 07 al 10 | 63 lecciones)
- **Estado de revisión:** 59 lecciones corregidas (057 a 115); 4 lecciones pendientes (307, 308, 309, 310).
- **Competencias Gramaticales y Funcionales Evaluadas:**
  * *Sistema de pasados y narración cronológica (Cap. 07):* Futuro perifrástico *ir a + infinitivo* (L057), pretérito indefinido regular (*-é/-í*) e irregularidades mayores (*fui, estuve, pude, dije, tuve, hice*) y cambios vocálicos en 3ª persona (*pidió, durmió*) (L059–L063), pretérito perfecto compuesto con *haber + participio* regular e irregular (L065), contraste aspectual pretérito perfecto vs. indefinido con marcadores temporales (*hoy/este año* vs. *ayer/el año pasado*) (L066), pretérito imperfecto morfológico y usos descriptivos/habituales (L067), contraste indefinido vs. imperfecto en la narración (L068), *estar + gerundio* en pasado para acciones interrumpidas (L069), marcadores de duración (*desde, hace, desde hace*) (L070) y conectores temporales de ordenación (*primero, luego, al final*) (L071).
  * *Sintaxis del pronombre, comparación y preposiciones (Cap. 08):* Pronombres de objeto directo (*lo/la/los/las*) (L072), pronombres de objeto indirecto (*le/les*) (L073), combinación de doble pronombre (*se lo / se la*) (L074), enclisis pronominal con imperativo afirmativo (*dámelo*) (L075), posesivos tónicos (*mío, tuyo, suyo*) (L076), comparación de superioridad, inferioridad e igualdad (*más que, menos que, tanto como*) (L077, L078), superlativo relativo y absoluto en *-ísimo* (L079), contraste sistemático *por* vs. *para* en sus funciones cardinales de causa, meta, plazo y destinatario (L080), indefinidos de polaridad negativa (*algo, nada, alguien, nadie*) (L081), pronombres con preposición (*conmigo, contigo*) (L083), oraciones de relativo simples con *que* y *donde* (L084), perífrasis *acabar de + inf.* (L086) y adverbios de aspecto *ya, todavía, aún* (L087).
  * *Interacciones situacionales y transaccionales (Cap. 09):* Peticiones de cortesía con condicional (*me gustaría reservar*) (L088), imperativo formal de cortesía *usted/ustedes* para direcciones urbanas (L089), transportes y metro (L090), consulta médica y vida sana (L091, L092), situaciones de emergencia (*¡Socorro!*) (L093), trámites de hotel, aeropuerto, teléfono y banco (L094, L095, L096, L099), vivienda y alquiler (L097), fórmulas de permiso y confirmación de citas (L100, L103).
  * *Cultura, sociedad y descripción avanzada (Cap. 10):* Rasgos de personalidad y carácter (L104), festividades del mundo hispano (L105), mercados tradicionales y recetas de cocina (L106, L107), cultura del tapeo (L108), medios de comunicación y titulares sencillos (L112, L113), geografía y paisajes de España y América (L114, L115).
- **Lecciones Añadidas en A2 (Pendientes):**
  * L307 (*Instrucciones, avisos y etiquetas*): Lectura pragmática orientada a la acción. Diccionario plano a estructurado.
  * L308 (*Una noticia breve*): Primer contacto con el género periodístico informativo en A2. Diccionario plano a estructurado.
  * L309 (*Tres pasados en una historia*): Integración narrativa de indefinido, imperfecto y perfecto. Diccionario plano a estructurado.
  * L310 (*Mensajes y confirmaciones*): Textos transaccionales breves habituales en pruebas DELE A2. Diccionario plano a estructurado.
- **Dictamen A2:** Impecable articulación curricular. El contraste entre los tres pasados y el sistema de pronombres átonos se encuentra perfectamente graduado.

---

### 4.3. Nivel B1: Umbral (Capítulos 11 al 18 | 93 lecciones)
- **Estado de revisión:** 60 lecciones corregidas (116 a 175); 33 lecciones pendientes (176 a 200 + L294, L295, L296, L311, L312, L313, L314, L315).
- **Competencias Gramaticales y Funcionales Evaluadas:**
  * *Futuro, condicional y líneas temporales (Cap. 11):* Futuro imperfecto regular e irregular (*habrá, sabré, podré, tendré, saldré*) (L116, L117), condicional simple para consejos e hipótesis (*yo que tú, descansaría*) (L118), futuro de probabilidad en el presente y condicional de probabilidad en el pasado (*serían las diez*) (L119), introducción al contraste indicativo/subjuntivo según la matriz afirmativa o negativa (*creo que viene / no creo que venga*) (L120), oraciones condicionales potenciales con *si + imperfecto de subjuntivo + condicional simple* (L122, L294), pretérito pluscuamperfecto de indicativo (*había salido*) y narración en planos temporales complejos (L123, L124, L311).
  * *El núcleo del modo Subjuntivo (Cap. 12):* Presente de subjuntivo regular e irregular (*vaya, sea, tenga, sepa, haya, esté*) (L125, L126), deseos con *ojalá, tal vez, quizás* (L127), peticiones y consejos (*te aconsejo que estudies*) (L128), reacciones y juicios de valor (*me extraña que, es importante que*) (L129, L131), duda (*dudo que*) (L130), oraciones temporales de futuro (*cuando termines, llámame*) (L132), oraciones finales (*para que lo entiendas*) (L133), oraciones de relativo con antecedente inespecífico (*busco una casa que tenga piscina*) (L134), imperativo negativo obligatorio con subjuntivo (*no fumes*) (L135), oraciones concesivas con *aunque* (L136), nexos que exigen subjuntivo (*sin que, antes de que*) (L137), deseo atenuado (*me gustaría que vinieras*) (L295) y análisis discursivo del subjuntivo en textos reales (L315).
  * *Cohesión textual, voz pasiva y estilo indirecto (Cap. 13):* Pronombres relativos compuestos (*que, quien, cuyo, lo que, donde*) (L139, L140, L141), pasiva refleja con *se* (*se vende piso*) (L142), construcciones impersonales con *se* (*se vive bien aquí*) (L143), estilo indirecto en pasado con correlación temporal de presente a imperfecto y de imperativo a imperfecto de subjuntivo (L144, L145), verbos de cambio o devenir (*ponerse, quedarse, volverse, hacerse, llegar a ser*) (L146, L147), conectores de causa (*por culpa de, gracias a*), consecuencia (*por tanto, así que*) y concesión (*a pesar de que*) (L148, L149, L150), adjetivos de significado alternante con *ser* y *estar* (*ser listo / estar listo, ser rico / estar rico*) (L151), verbos con régimen preposicional obligatorio (*acordarse de, soñar con, pensar en*) (L152) y marcadores discursivos de referencia (L314).
  * *Estrategias conversacionales y pragmática (Cap. 14):* Petición cortés de favores (*¿te importaría...?*) (L153), sugerencias, ofrecimientos y disculpas formales (L154, L155, L156), marcadores de control de turno (*por cierto, en fin, pues la verdad es que...*) (L157, L158), gestión de reclamaciones y cambios de reserva (L296).
  * *Vida cotidiana, sociedad, ocio y mundo laboral (Caps. 15, 16, 17, 18):* Relaciones de vecindad y convivencia (L159, L160), sistema sanitario de especialistas (L162), nutrición (L163), construcciones con *se* involuntario/accidental (*se me ha quemado la cena, se me cayeron las llaves*) (L164), contratos de alquiler e hipoteca (L165), mercado laboral, currículum y entrevistas de trabajo (L170), trámites legales de extranjería, padrón municipal y DNI (L171), hojas de reclamaciones de consumo (L172), normas de tráfico y seguridad vial (L174), cine, literatura y crítica cultural (L176), prensa, tecnologías digitales, economía doméstica e inflación, medio ambiente, migraciones y ONG (L178–L186, L312), léxico técnico de oficios, materiales, ciencias cotidianas y animales (L187–L200).
- **Dictamen B1:** Nivel extraordinariamente robusto. Cubre minuciosamente todos los descriptores del nivel Umbral del Instituto Cervantes. Requiere en la Fase 4 la revisión lingüística y formal de las 33 lecciones pendientes (L176 a L200 y las añadidas).

---

### 4.4. Nivel B2: Avanzado (Capítulos 19 al 26 | 105 lecciones)
- **Estado de revisión:** 0 lecciones corregidas en la fase previa; las 105 lecciones están **pendientes**.
- **Competencias Gramaticales y Funcionales Evaluadas:**
  * *Morfología avanzada de subjuntivo e hipótesis contrafácticas (Cap. 19):* Pretérito imperfecto de subjuntivo con dominio de las dos desinencias normativas (*-ra* y *-se*: *cantara/cantase*) (L202, L203), estilo indirecto con peticiones en pasado (L204), pretérito perfecto de subjuntivo (*haya llegado*) (L205), futuro compuesto y condicional compuesto (*habré terminado, habría ido*) para probabilidad pasada y anterioridad (L206, L210), oraciones condicionales irreales del pasado con *si + pluscuamperfecto de subjuntivo + condicional compuesto / pluscuamperfecto de subjuntivo* (*si hubiera sabido, te habría llamado / te hubiera llamado*) (L207, L298), deseos de realización imposible con *ojalá pudiera* (L208), estructuras de similitud hipotética con *como si + subjuntivo* (L209), nexos condicionales complejos con subjuntivo obligatorio (*siempre que, a no ser que, con tal de que, a condición de que*) (L211).
  * *Matices de articulación discursiva y sintaxis compleja (Cap. 20):* Organizadores de la información y contraargumentación (*por un lado, por otro; en cambio; no obstante*) (L212, L214), reformuladores explicativos (*es decir, o sea, mejor dicho*) (L213), conectores consecutivos de énfasis con subjuntivo (*de ahí que + subj.*) (L215), concesivas intensivas con subjuntivo (*por mucho que insistas, por más que digas*) (L216), oraciones de relativo complejas con preposición y artículo (*la persona a la que llamé, el asunto del cual hablamos*) (L217), relativo posesivo *cuyo/cuya/cuyos/cuyas* con concordancia con la cosa poseída (L218), construcciones hendidas y de relieve (*fue entonces cuando, es aquí donde*) (L220), contraste estilístico entre pasiva analítica con *ser + participio + por* y pasiva refleja con *se* en el lenguaje periodístico e institucional (L221, L222), cláusulas absolutas con infinitivo compuesto y gerundio compuesto (*al haber entrado, habiendo terminado*) (L223, L224), discurso referido y citas de autoridad (*según dice el informe, asegura haber visto*) (L225, L226), valor semántico de la posición del adjetivo antepuesto/pospuesto (*un viejo amigo / un amigo viejo; un gran hombre / un hombre grande; un pobre hombre / un hombre pobre*) (L227), cuantificación de precisión (*el doble de lo que pensaba*) (L228), sustantivos homónimos por género (*el orden / la orden, el frente / la frente, el parte / la parte, el cura / la cura*) (L229), tematización y reduplicación de pronombres de objeto directo antepuestos (*a Juan lo vi ayer*) (L230), fórmulas reduplicadas con valor concesivo-indefinido (*sea como sea, pase lo que pase, caiga quien caiga*) (L231) y relativas con matiz de especificidad (L297).
  * *Pragmática avanzada, negociación y registros comunicativos (Cap. 21):* Variación de registro (coloquial, estándar y formal) en peticiones de favores (*échame una mano / ¿le importaría ayudarme?*) (L232), rechazo cortés y asertivo (L233), concesión condicionada de permisos (*siempre y cuando*) (L234), sugerencias atenuadas (*¿y si fuéramos...?*) (L235), advertencias y reproches retrospectivos con condicional compuesto (*deberías haberlo dicho*) (L236, L237), lenguaje telefónico de centralitas corporativas (L243), correspondencia formal protocolaria (saludos, exposición de motivos, peticiones y despedidas) (L244, L299), estructuración de exposiciones y ponencias académicas (L245).
  * *Antropología personal, vida práctica y sociedad (Caps. 22, 23, 24):* Anatomía detallada y cinemática gestual (L246), modismos de temperamento e inteligencia (*no tener dos dedos de frente*) (L247), expresiones afectivas complejas (*hacerme ilusión*) (L248), familia política (*suegros, cuñados, yernos, nueras*) (L249), etapas vitales y ritos sociales (L250, L251), diagnósticos médicos especializados (L252), etiquetado nutricional e ingredientes (L253), técnicas culinarias precisas (L254), reparaciones y obras domésticas (L255), finanzas, préstamos e hipotecas (*estar en números rojos*) (L256, L257), derecho laboral, contratos indefinidos, despidos y huelgas (L258), educación universitaria y exámenes de oposición (L259), mecánica del motor, seguros y accidentes de tráfico (L260), viajes de larga distancia (L261), lectura crítica de contratos y condiciones generales de contratación (*la letra pequeña*) (L316), géneros periodísticos (editorial, crónica, columna de opinión) (L262), procesos electorales y partidos políticos (L263), justicia penal y juicios (L264), sociología de la desigualdad (L265), lanzamiento comercial y empresas emergentes (L266), ciberseguridad e informática (L267), divulgación del método científico y ensayos clínicos (L268), climatología extrema (L269), geopolítica, tratados internacionales y conflictos armados (L270), ensayo argumentativo de urbanismo (L300), y lectura crítica de datos frente a titulares tendenciosos (L302, L317, L318).
  * *Cultura, naturaleza, fraseología y variación panhispánica (Caps. 25 y 26):* Historia del arte (románico, gótico, barroco) (L271), análisis y crítica literaria (L272), cinematografía y guion (L273, L301), festivales musicales (L274), crónica deportiva (L275), religiones comparadas y mitología (L277), astronomía, meteorología y mundo rural (L278, L279, L280), detección de la ironía y tonos implícitos en textos argumentativos (L319), morfología léxica mediante prefijación y sufijación derivativa (*des-, in-, -ción, -dad*) (L281), sufijos apreciativos diminutivos y aumentativos y sus funciones pragmáticas de atenuación o afecto (*un cafecito*) (L282), acentuación diacrítica y casos especiales de tilde (L283), abreviaturas, siglas y acrónimos normativos (L284), falsos amigos frecuentes con el inglés (L285), léxico coloquial y partículas modales (*vale, venga, qué va*) (L286), paremiología y refranes tradicionales en su contexto de uso (L287), variación lingüística panhispánica: rasgos morfosintácticos y léxicos del español de América frente al de España (*voseo*, uso exclusivo de *ustedes*, léxico regional) (L288, L303), debate formal y defensa de posturas dialécticas (L289), lectura comprensiva de textos extensos de nivel DELE B2 (L291, L292), síntesis integradora de decisiones gramaticales (L293) y análisis contrastivo de una misma noticia en prensa de Argentina, México y España (L320).
- **Dictamen B2:** El currículo de B2 posee un nivel de excelencia académica y variedad léxica sin precedentes en la plataforma. Es plenamente equiparable al examen DELE B2 del Instituto Cervantes. Su debilidad es exclusivamente técnica: ninguna de las 105 lecciones ha sido validada formalmente en `informe_espanol.txt`, abundan los vacíos en categorías gramaticales (`cat`) y 6 lecciones sufren del formato plano de diccionario.

---

## 5. Plan de Acción y División en Bloques de Trabajo para la Fase 4

Para acometer la Fase 4 de saneamiento, corrección lingüística y homologación técnica del curso de español con el mismo estándar de calidad aplicado en las lecciones 001–175, se establece una división rigurosa en **4 bloques de trabajo homogéneos**:

```
Fase 4: 145 Lecciones Pendientes Organizadas en 4 Bloques
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│     BLOQUE 1     │     BLOQUE 2     │     BLOQUE 3     │     BLOQUE 4     │
│  Cierre de B1    │ B2 Gramatical y  │  B2 Pragmático,  │  B2 Textual,     │
│  y Anexos B1     │   Sintáctico     │ Social y Práctico│ Variedades y A1-A2│
│   33 lecciones   │   33 lecciones   │   32 lecciones   │   47 lecciones   │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

### Bloque 1: Cierre del Nivel B1 y Módulos de Lectura/Líneas Temporales
- **Alcance:** **33 lecciones**
  * Lecciones 176 a 200 (25 lecciones): Cine/libros (L176, L177), El mundo y sociedad contemporánea (L178 a L186), Léxico especializado de oficios, mercado y ciencia (L187 a L200).
  * Lecciones añadidas de B1 (8 lecciones): L294 (*Si tuviera tiempo*), L295 (*Me gustaría que vinieras*), L296 (*¿Podría cambiar la reserva?*), L311 (*Líneas temporales*), L312 (*Opiniones en foro*), L313 (*Instrucciones B1*), L314 (*Conectores en contexto*), L315 (*Subjuntivo en texto*).
- **Objetivos de Corrección:**
  1. Completar el 100% de categorías gramaticales (`cat`) y géneros (`genero`) faltantes en el vocabulario.
  2. Subsanar erratas lingüísticas (p. ej. corregir en L176 la descripción de *personaje* como epiceno masculino).
  3. Reestructurar las lecciones L311 a L315 para sustituir el diccionario plano por objetos JSON con pronunciación y categoría.
  4. Revisar la coherencia de los ejercicios de subjuntivo y condicional.

### Bloque 2: Núcleo Gramatical y Sintaxis Compleja de B2
- **Alcance:** **33 lecciones**
  * Lecciones 201 a 231 (31 lecciones): Capítulo 19 (*Hipótesis*: imperfecto de subjuntivo, condicional compuesto, condicionales irreales, nexos complejos) y Capítulo 20 (*Matices*: organizadores, conectores, pasivas, relativos, estilo indirecto, adjetivos y topicalización).
  * Lecciones añadidas correspondientes (2 lecciones): L297 (*Subjuntivo con antecedente indeterminado*) y L298 (*Narrativa contrafáctica de pasado*).
- **Objetivos de Corrección:**
  1. Asignar categorías morfológicas y marcas de régimen preposicional en el cuaderno léxico.
  2. Verificar la estricta concordancia temporal (*consecutio temporum*) en las explicaciones y distractores de todos los ejercicios de subjuntivo y condicional compuesto.
  3. Asegurar la precisión en los contrastes de pasiva refleja vs. pasiva analítica y la posición del adjetivo.

### Bloque 3: Pragmática Interaccional, Registros y Vida Práctica B2
- **Alcance:** **32 lecciones**
  * Lecciones 232 a 261 (30 lecciones): Capítulo 21 (*Trato y conversación*: peticiones en tres registros, disculpas, centralitas, correspondencia formal, ponencias), Capítulo 22 (*La persona*: anatomía, gestos, temperamento, afectos, etapas vitales) y Capítulo 23 (*La vida práctica*: cocina técnica, reformas, banca, contratos laborales, conducción, viajes).
  * Lecciones añadidas correspondientes (2 lecciones): L299 (*Respuesta a reclamación formal*) y L316 (*La letra pequeña: análisis contractual*).
- **Objetivos de Corrección:**
  1. Homogeneizar las fórmulas epistolares y comerciales con las normas profesionales del ámbito hispanohablante.
  2. Rellenar las categorías gramaticales ausentes en el léxico laboral, médico y financiero.
  3. Convertir el diccionario plano de L316 a formato canónico con glosas y notas.

### Bloque 4: Discurso Periodístico, Ensayo, Variedades Panhispánicas y Saneamiento de Anexos A1–A2
- **Alcance:** **47 lecciones**
  * Lecciones 262 a 293 (32 lecciones de B2): Capítulos 24 (*Sociedad y actualidad*: prensa, justicia, ciencia, medio ambiente), 25 (*Cultura y naturaleza*: arte, literatura, cine, astronomía) y 26 (*Palabras y registro*: sufijación, diminutivos, tildes, siglas, falsos amigos, coloquialismos, refranes, español de América y Repaso Final).
  * Lecciones añadidas de B2 (8 lecciones): L300 (*Ensayo urbano*), L301 (*Crítica de cine*), L302 (*Datos vs. opinión*), L303 (*Variedades del español*), L317 (*Contraste periodístico*), L318 (*Titular frente a datos*), L319 (*Ironía y postura implícita*), L320 (*Noticia en tres variedades*).
  * Lecciones anexas de A1 y A2 (7 lecciones): L304 (*Fonética A1*), L305 (*Tildes A1*), L306 (*Carteles A1*), L307 (*Etiquetas A2*), L308 (*Noticia A2*), L309 (*Tres pasados A2*), L310 (*Mensajes A2*).
- **Objetivos de Corrección:**
  1. Realizar la reestructuración técnica de las 12 lecciones con vocabulario plano (L304 a L310 y L317 a L320), proporcionando a cada uno de sus términos `{ en, pron, cat, genero, nota }`.
  2. Ajustar los análisis dialectales (seseo, ceceo, voseo pronominal y flexivo, léxico regional rioplatense, andino, caribeño y mexicano) con el máximo rigor del *Atlas Lingüístico de la Lengua Española* y la *Nueva gramática de la lengua española*.
  3. Establecer la solución de numeración definitiva (`numero_curso` en JSON o renumeración de archivos) para que las lecciones añadidas no rompan la navegación dentro de los capítulos de la aplicación.
  4. Actualizar `Notas_archivos_noafectaalcodigo/informe_espanol.txt` marcando el 100% del curso como `Estado: corregido`.

---

## 6. Conclusiones y Recomendaciones Lingüístico-Técnicas

1. **Patrimonio Pedagógico Excepcional:**  
   El curso de español no requiere ser reescrito desde cero. A diferencia de las lecciones plantilla detectadas en otros idiomas, el contenido de español posee una calidad lingüística, una adecuación al MCER y una riqueza temática de primer orden. No existen ejercicios clónicos con opciones vacías ni colisiones de preguntas dentro de las lecciones.
2. **Prioridad Técnica de la Fase 4:**  
   La intervención debe centrarse en:
   - Enriquecer los metadatos léxicos (`cat`, `genero`, `pron`) en las 145 lecciones pendientes.
   - Reemplazar el diccionario plano en las 17 lecciones anómalas (304–320).
   - Resolver la ordenación secuencial de las lecciones añadidas mediante la inyección del campo `numero_curso`.
   - Evaluar el destino didáctico de los bloques «Your turn: write and speak».
3. **Alineación Oficial:**  
   Una vez ejecutados los 4 bloques de la Fase 4, el curso de español de Paglot se consolidará como uno de los recursos de autoaprendizaje digital más completos, coherentes y rigurosos del mercado para la preparación de los certificados oficiales DELE y SIELE en los niveles A1, A2, B1 y B2.
