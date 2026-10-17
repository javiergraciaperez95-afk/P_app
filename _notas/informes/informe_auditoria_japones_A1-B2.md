# Auditoría Curricular Integral A1–B2: Curso de Japonés (`ja`)

**Fecha de emisión:** 16 de octubre de 2026  
**Especialidad:** Lingüística Aplicada, Diseño Curricular MCER / JLPT (*The Japan Foundation* / *JEES*) y Desarrollo de Contenidos Paglot  
**Ámbito de aplicación:** Curso completo de japonés (`_herramientas/cursos/ja/`, `01.txt` a `40.txt` e `Idiomas/cursos/ja/lessons/001.json` a `300.json`)  
**Documentos y fuentes de referencia inspeccionados:**
- Fuentes maestras del curso: `_herramientas/cursos/ja/capitulos.txt`, `_herramientas/cursos/ja/ESTADO.txt` y los 40 archivos capitulares fuente (`01.txt` a `40.txt`).
- Compilador oficial: `_herramientas/cursos/compilar.py`.
- Base de datos compilada: `Idiomas/cursos/ja/lessons/001.json` a `300.json`.
- Marcos de referencia oficiales:
  * **JF Standard for Japanese-Language Education** (*The Japan Foundation* / Fundación Japón), marco pedagógico de referencia basado en el MCER del Consejo de Europa.
  * **Japanese-Language Proficiency Test (JLPT / 日本語能力試験)** (*The Japan Foundation* y *Japan Educational Exchanges and Services*): niveles N5 (A1), N4 (A2), N3 (B1) y N2 (B2).
  * Manuales y programas de referencia: *Irodori: Japanese for Life in Japan* (A1/A2, Fundación Japón), *Marugoto: Japanese Language and Culture* (Starter A1 a Intermediate B1, Fundación Japón) y *Shin Kanzen Master* (新完全マスター) series N4 a N2 (3A Corporation).
  * Obras gramaticales y lingüísticas de referencia:
    - Makino, S. & Tsutsui, M.: *A Dictionary of Basic Japanese Grammar* (N5–N4), *A Dictionary of Intermediate Japanese Grammar* (N3) y *A Dictionary of Advanced Japanese Grammar* (N2). The Japan Times.
    - Kaiser, S. et al. (2013): *Japanese: A Comprehensive Grammar*. Routledge.
    - Iwasaki, S. (2013): *Japanese*. John Benjamins.

---

## 1. Resumen Ejecutivo y Diagnóstico Global

El curso de japonés de Paglot comprende actualmente **300 lecciones distribuidas en 40 capítulos**, estructurado formalmente para cubrir el itinerario completo desde el nivel Acceso (A1 / JLPT N5) hasta el nivel Avanzado (B2 / JLPT N2).

Tras una auditoría lingüística forense y un análisis algorítmico exhaustivo de los 40 archivos fuente y los 300 archivos JSON compilados, se emite el siguiente dictamen pericial:

```
                  Arquitectura Real del Curso de Japonés (ja)
┌──────────────────────────────────────┬──────────────────────────────────────┐
│        Lecciones Base: 135           │       Lecciones Ampliación: 165      │
│               (45,0%)                │               (55,0%)                │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Diálogos interactivos auténticos   │ • Plantilla clónica de 7 bloques     │
│ • Introducción gradual de silabarios │ • 2 únicas frases por lección        │
│ • Explicaciones contrastivas útiles  │ • Ejercicios circulares de huecos    │
│ • Defecto: 171 prompts omitidos (R)  │ • Prompt idéntico en 165 lecciones   │
│ • 2 errores verbatim copy-paste (B2) │ • Monotonía estructural mecánica     │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Principales Hallazgos de la Auditoría:

1. **Resolución de la Incidencia Técnica Inicial (196 Lecciones con Preguntas Duplicadas):**
   El escaneo inicial reportó 196 lecciones con preguntas duplicadas. El análisis forense confirma que esta cifra obedece a la confluencia de **cuatro factores generativos y dos errores humanos críticos**:
   - **171 lecciones** presentan dos o más ejercicios de traducción (`R`) sin parámetro de pregunta, lo que provocó que el compilador `compilar.py` les asignara automáticamente el prompt por defecto `'¿Qué significa?'`.
   - **165 lecciones** (la totalidad de la ampliación) contienen dos ejercicios de huecos (`H`) con el prompt idéntico hardcodeado: `'Completa con el patrón de la lección.'` (330 instancias en total).
   - **23 lecciones** contienen ejercicios de huecos (`H`) sin enunciado, recibiendo por defecto `'Completa la frase.'`.
   - **3 lecciones** (002, 008, 009) contienen ejercicios de audio (`A`) con prompts por defecto duplicados (`'Escucha. ¿Qué palabra es?'` y `'Escucha. ¿Qué significa?'`).
   - **2 lecciones (259 y 267 en Capítulos 36 y 37, B2) contienen duplicados verbatim absolutos**: preguntas de comprensión lectora con sus 3 opciones y retroalimentaciones pegadas dos veces consecutivas por error humano de autoría.
   La intersección de estos conjuntos produce con exactitud matemática las **196 lecciones detectadas**.

2. **Dicotomía Arquitectónica: 135 Lecciones Base frente a 165 Lecciones Plantilla:**
   - **Base (135 lecciones, 45,0%):** Posee excelente contextualización comunicativa, explicaciones pedagógicas bien redactadas y progresión sólida de silabarios (hiragana y katakana) y kanji iniciales.
   - **Ampliación (165 lecciones, 55,0%):** Diseñada para elevar el curso a 300 lecciones, sigue un patrón clónico invariable: 2 oraciones de ejemplo, 2 palabras de vocabulario visible, 1 test conceptual, 1 test factual, 2 huecos con prompt fijo y 2 traducciones. Si bien el contenido lingüístico japonés es correcto, la monotonía evaluativa es extrema y evalúa en circuito cerrado las mismas dos frases.

3. **Evaluación Curricular Nivel por Nivel (MCER vs. JLPT):**
   - **A1 / JLPT N5 (L001–070, Caps. 01–10): SÓLIDO Y EJEMPLAR.** Cobertura impecable de hiragana, katakana, 109 kanji (meta N5: ~100), partículas básicas (は, が, を, に, で, へ, と, も, から, まで, ね, よ), cópula formal (です/だ/でした/ではありません) y adjetivos -i / -na.
   - **A2 / JLPT N4 (L071–140, Caps. 11–20): COMPLETO Y COHERENTE.** Forma て (te-form) para peticiones, estado continuo y permisos; dar y recibir (あげる, くれる, もらう); registro llano / informal (辞書形, ない形, た形); potencial; condicionales (たら, と); deseo (たい) y 326 kanji acumulados (meta N4: ~300).
   - **B1 / JLPT N3 (L141–215, Caps. 21–30): NOTABLE PERO CON HUECOS CLAVE.** Progresión sólida en conectores lógicos (おかげで, せいで, ために, ように, のに), certeza (にちがいない, はずがない) y 596 kanji acumulados (meta N3: ~650). Sin embargo, presenta un **vacío crítico en el tratamiento de la voz pasiva (れる/られる), causativa (せる/させる) y causativa-pasiva (させられる)**, pilares nucleares del nivel N3.
   - **B2 / JLPT N2 (L216–300, Caps. 31–40): FRACTURA SEVERA EN KANJI Y REGISTRO KEIGO.**
     * **Brecha crítica de Kanji:** Acumula solo **719 kanji**, frente a los **~1.000 a 1.020 kanji requeridos por el estándar oficial JLPT N2** (déficit de 281 kanji).
     * **Omisión sistemática del Keigo (敬語):** El registro honorífico formal (sonkeigo 尊敬語 y kenjōgo 謙譲語), elemento distintivo de N2, apenas cuenta con menciones testimoniales aisladas.
     * **Vicio de distractores perezosos en el Examen Final:** En el Capítulo 40 se reitera de forma abusiva la opción `- ために :: Eso sería para.` y `- ながら :: Eso sería mientras.` en múltiples preguntas.

---

### 1.1. Balance Cuantitativo Global del Curso

| Nivel MCER / JLPT | Capítulos | Total Lecc. | Lecc. Base | Lecc. Ampliación | Palabras Visibles | Palabras Ocultas | Total Vocabulario | Ejercicios Totales | Textos Lectura | Diálogos | Kanji Nivel | Kanji Acumulados | Meta Kanji JLPT |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1 / N5** | 01–10 | 70 | 32 | 38 | 560 | 118 | 678 | 521 | 73 | 26 | 109 | 109 | ~100 |
| **A2 / N4** | 11–20 | 70 | 31 | 39 | 447 | 90 | 537 | 526 | 67 | 20 | 282 | 326 | ~300 |
| **B1 / N3** | 21–30 | 75 | 31 | 44 | 438 | 440 | 878 | 594 | 92 | 21 | 498 | 596 | ~650 |
| **B2 / N2** | 31–40 | 85 | 41 | 44 | 333 | 556 | 889 | 596 | 86 | 27 | 493 | **719** | **~1.000** |
| **TOTAL** | **40 Caps.** | **300** | **135** | **165** | **1.778** | **1.204** | **2.982** | **2.237** | **318** | **94** | — | **719** | — |

---

### 1.2. Tipología y Distribución de Ejercicios por Nivel

| Nivel MCER | Opción Múltiple (`test`) | Huecos (`huecos`) | Traducción (`traduccion`) | Ordenar Palabras (`ordenar`) | Escribir / Resp. Libre | Total Ejercicios | Promedio Ejerc./Lecc. |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1** | 246 | 133 | 113 | 29 | 0 | 521 | 7,4 |
| **A2** | 231 | 157 | 108 | 30 | 0 | 526 | 7,5 |
| **B1** | 277 | 169 | 118 | 30 | 0 | 594 | 7,9 |
| **B2** | 278 | 170 | 118 | 30 | 0 | 596 | 7,0 |
| **TOTAL** | **1.032 (46,1%)** | **629 (28,1%)** | **457 (20,4%)** | **119 (5,3%)** | **0 (0,0%)** | **2.237** | **7,5** |

> [!NOTE]
> De conformidad con las especificaciones de la plataforma Paglot para dispositivos móviles y entornos asistidos, no se incluyen ejercicios de entrada libre abierta no restringida ni destrezas orales libres, evaluándose de forma rigurosa la comprensión lectora (*dokkai*), reconocimiento ortográfico y gramatical (*moji/goi/bunpō*) y discriminación auditiva focalizada (*chōkai*).

---

## 2. Diagnóstico Forense: Causa Exacta de las 196 Lecciones con Duplicidades

El análisis minucioso de la base compilada frente al código fuente en `_herramientas/cursos/compilar.py` y los archivos `01.txt` a `40.txt` revela con precisión técnica por qué 196 lecciones presentan duplicidad interna en el atributo `pregunta` (o prompt).

```
          Desglose de las 196 Lecciones con Preguntas Duplicadas
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ Causa y Cadena Duplicada                                    │ Impacto      │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ 1. Traducciones `R` sin parámetro → '¿Qué significa?'       │ 171 lecciones│
│ 2. Huecos de ampliación con plantilla fija hardcodeada      │ 165 lecciones│
│ 3. Huecos `H` sin parámetro → 'Completa la frase.'          │ 23 lecciones │
│ 4. Pruebas de audio `A` por omisión                         │ 3 lecciones  │
│ 5. Error humano de copy-paste íntegro en B2 (L259 y L267)   │ 2 lecciones  │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ TOTAL LECCIONES ÚNICAS AFECTADAS (unión matemática)         │ 196 lecciones│
└─────────────────────────────────────────────────────────────┴──────────────┘
```

### 2.1. Causa 1: Omisión del Prompt en Ejercicios `R` (171 lecciones)

En la sintaxis del compilador de Paglot (`compilar.py`, líneas 188–190):
```python
elif marca == 'R':
    f, q = partes(resto, 2)
    ejercicio('traduccion', pregunta=q or '¿Qué significa?', frase=f)
```
Cuando el autor escribe en la fuente:
```text
R ねこ
+ gato :: Ne-ko.
- perro :: Perro es いぬ.
- pescado :: Pescado es さかな.
R さかな
+ pescado :: Sa-ka-na.
- carne :: Carne es にく.
- sushi :: Sushi es すし.
```
Al no incluir `:: enunciado personalizado`, el compilador inyecta `'¿Qué significa?'` en ambas preguntas. Como la inmensa mayoría de lecciones (tanto base como ampliación) evalúan 2 términos o 2 oraciones traducidas, el alumno recibe dos ejercicios contiguos con exactamente el mismo enunciado en pantalla.

### 2.2. Causa 2: Plantilla Rígida en Ejercicios `H` de Ampliación (165 lecciones)

En las 165 lecciones añadidas durante la fase de ampliación, el autor o generador insertó sistemáticamente dos bloques de huecos por lección con la cadena literal:
`:: Completa con el patrón de la lección.` (330 ocurrencias exactas).

Ejemplo representativo (`04.txt`, lección 24):
```text
H これ ___ ほんです。 :: Completa con el patrón de la lección.
+ は :: Es la forma que completa la frase.
- が :: No expresa el patrón de esta frase.
- を :: No expresa el patrón de esta frase.
H それ ___ なんですか。 :: Completa con el patrón de la lección.
+ は :: Es la forma que completa la frase.
- が :: No expresa el patrón de esta frase.
- を :: No expresa el patrón de esta frase.
```

### 2.3. Causa 3: Omisión del Prompt en Ejercicios `H` Base (23 lecciones)

En `compilar.py` (línea 199):
```python
ejercicio('huecos', pregunta=q or 'Completa la frase.', frase=f)
```
En 23 lecciones del núcleo base se incluyeron dos ejercicios `H` sin especificar pregunta, resultando en dos bloques con el enunciado idéntico `'Completa la frase.'`.

### 2.4. Causa 4: Prompts Duplicados en Comprensión Auditiva `A` (3 lecciones)

En las lecciones 008 y 009 se introducen dos ejercicios `A` contiguos con `'Escucha. ¿Qué palabra es?'`, y en la lección 002 con `'Escucha. ¿Qué significa?'`.

### 2.5. Causa 5: Error Grave de Copia Verbatim en B2 (Lecciones 259 y 267)

A diferencia de las causas anteriores (que son prompts genéricos compartidos por diferentes frases), en las lecciones 259 y 267 existen **duplicados idénticos de preguntas completas (pregunta + 3 opciones + retroalimentaciones)** debidos a un fallo manual de edición:

1. **Lección 259 (`36.txt`, líneas 216 a 223):**
   ```text
   216: Q ¿Qué información comprobó el narrador en el panel?
   217: + La información necesaria para localizar el andén correcto. :: Después el empleado confirmó cuál era.
   218: - El precio del billete. :: No se menciona el precio.
   219: - El horario del día siguiente. :: La situación trata del último tren de esa noche.
   220: Q ¿Qué información comprobó el narrador en el panel?
   221: + La información necesaria para localizar el andén correcto. :: Después el empleado confirmó cuál era.
   222: - El precio del billete. :: No se menciona el precio.
   223: - El horario del día siguiente. :: La situación trata del último tren de esa noche.
   ```
2. **Lección 267 (`37.txt`, líneas 220 a 227):**
   ```text
   220: Q ¿Qué hicieron los voluntarios después de escuchar a los residentes?
   221: + Entregaron los artículos necesarios. :: La cuarta oración indica esa acción.
   222: - Cerraron la carretera. :: La carretera ya estaba cerrada por la lluvia.
   223: - Llevaron a la familia a otra casa. :: No se menciona ese traslado.
   224: Q ¿Qué hicieron los voluntarios después de escuchar a los residentes?
   225: + Entregaron los artículos necesarios. :: La cuarta oración indica esa acción.
   226: - Cerraron la carretera. :: La carretera ya estaba cerrada por la lluvia.
   227: - Llevaron a la familia a otra casa. :: No se menciona ese traslado.
   ```

---

## 3. Radiografía Arquitectónica: Lecciones Base vs. Ampliación

### 3.1. Las 135 Lecciones Base (45,0% del curso)
Constituyen el corazón pedagógico original del curso.
- **Fortalezas:**
  * Diálogos contextuales con intercambio de roles y turnos naturales (94 diálogos).
  * Explicaciones lingüísticas bien estructuradas con tablas gramaticales ilustrativas (`B`).
  * Desglose analítico línea a línea (`> trozo = glosa`).
  * Presentación progresiva de kanji con lecturas on'yomi y kun'yomi claramente contextualizadas.
- **Debilidades:**
  * Carencia de prompts diferenciados en ejercicios `R` (171 lecciones arrastran el vicio).
  * Escasa presencia de ejercicios de reordenación de palabras (`ordenar`) fuera del cierre de lección (solo 119 en todo el curso).

### 3.2. Las 165 Lecciones de Ampliación (55,0% del curso)
Fueron incorporadas para expandir la oferta del curso de 135 a 300 lecciones (distribuidas en: +38 en A1, +39 en A2, +44 en B1, +44 en B2).
- **Estructura Estereotipada Invariable:**
  Cada una de las 165 lecciones de ampliación está clonada bajo un esquema mecánico de 7 bloques:
  ```
  1. I (Intro estándar: "Observa el patrón en ejemplos breves...")
  2. E (Explicación breve que culmina con 2 frases de ejemplo: Frase A y Frase B)
  3. W / w (2 palabras visibles nuevas + 5-8 palabras ocultas de soporte)
  4. T (Texto formado exclusivamente por la Frase A y la Frase B)
  5. Q1 ("¿Qué expresa «...» en estos ejemplos?" → copia la explicación teórica)
  6. Q2 ("¿Qué información da la segunda frase?" → evalúa Frase B)
  7. H1 ("H Frase A con ___ :: Completa con el patrón de la lección.")
  8. H2 ("H Frase B con ___ :: Completa con el patrón de la lección.")
  9. R1 ("R Frase A :: ¿Qué significa?")
  10. R2 ("R Frase B :: ¿Qué significa?")
  ```
- **Consecuencias Didácticas:**
  * **Cero riqueza léxica adicional:** El vocabulario nuevo visible es de apenas 2 palabras por lección.
  * **Tautología evaluativa:** El estudiante responde 6 ejercicios consecutivos basados en exactamente las mismas 2 oraciones cortas.
  * **Predecibilidad absoluta:** Las opciones distractoras en los ejercicios `Q` y `R` suelen ser la traducción de la otra frase o una negación absurda inventada (p. ej. *"La escuela está cerrada y nadie estudia"*), anulando el esfuerzo cognitivo real.

---

## 4. Auditoría Curricular Detallada Nivel por Nivel

### 4.1. Nivel A1 / JLPT N5 (Capítulos 01 a 10 | Lecciones 001 a 070)

```
                            Itinerario Curricular A1 / N5
┌─────────────────┬───────────────────────────────────────────┬───────────────┐
│ Capítulo        │ Contenido Pedagógico Central              │ Estado Curric.│
├─────────────────┼───────────────────────────────────────────┼───────────────┤
│ Cap. 01         │ Hiragana: silabario básico (46 signos)    │ Excelente     │
│ Cap. 02         │ Katakana y palabras de origen extranjero  │ Excelente     │
│ Cap. 03         │ Presentaciones, nacionalidad, cópula です │ Completo      │
│ Cap. 04         │ Demostrativos (これ/それ/あれ), posesión  │ Completo      │
│ Cap. 05         │ Verbos en -masu, hora, días, frecuencia   │ Sólido        │
│ Cap. 06         │ Comida, restaurante, contadores básicos   │ Sólido        │
│ Cap. 07         │ Adjetivos -i y -na, colores, compras      │ Riguroso      │
│ Cap. 08         │ Ciudad, transporte, partícula に/で/へ    │ Completo      │
│ Cap. 09         │ Tiempo libre, invitaciones, deseo (たい)  │ Bien graduado │
│ Cap. 10         │ Pasado formal (-ました/-でした), viaje    │ Examen A1     │
└─────────────────┴───────────────────────────────────────────┴───────────────┘
```

#### Análisis Lingüístico A1:
- **Silabarios (Kana):** La progresión de hiragana (Cap. 1) y katakana (Cap. 2) es metódica y pedagógicamente impecable. Se explican con claridad los rasgos fonéticos críticos: consonantes dobles oclusivas (*sokuon* っ), vocales largas (*chōon* う/ー), combinaciones palatales (*yōon* きゃ/しゅ/ちょ) y alternancias sordas/sonoras (*dakuten* ゛ y *handakuten* ゜).
- **Kanji A1:** Se introducen **109 kanji**, cumpliendo con la exigencia estándar de JLPT N5 (~100 kanji: 一, 二, 三, 日, 月, 木, 水, 火, 土, 金, 人, 年, 大, 中, 小, 本, 語, 行, 来, 食, 見, 書, etc.).
- **Partículas:** Se cubren con precisión contrastiva:
  * は (*wa*): marcador de tema y contraste.
  * が (*ga*): sujeto gramatical y foco de información nueva.
  * を (*o*): objeto directo de verbos transitivos.
  * に (*ni*): tiempo específico, punto de llegada, destinatario y existencia estática.
  * で (*de*): lugar donde se desarrolla una acción e instrumento/medio.
  * へ (*e*): dirección del movimiento.
  * と (*to*): compañía ("con") y enumeración copulativa cerrada.
  * も (*mo*): inclusión ("también").
  * から (*kara*) / まで (*made*): punto de partida y límite espacio-temporal.
  * ね (*ne*) / よ (*yo*): búsqueda de confirmación y aporte de información nueva.
- **Sintaxis Verbal y Cópula:** Cópula presente afirmativa (です) y negativa (ではありません / じゃありません); pasado afirmativo (でした) y negativo (ではありませんでした). Verbos en presente/futuro (-ます / -ません) y pasado (-ました / -ませんでした).
- **Adjetivos:** Tratamiento riguroso de adjetivos en -i (い) y adjetivos nominales en -na (な), con sus respectivas conjugaciones (高い → 高くない → 高かった → 高くなかった; 静か → 静かではない → 静かだった).

---

### 4.2. Nivel A2 / JLPT N4 (Capítulos 11 a 20 | Lecciones 071 a 140)

```
                            Itinerario Curricular A2 / N4
┌─────────────────┬───────────────────────────────────────────┬───────────────┐
│ Capítulo        │ Contenido Pedagógico Central              │ Estado Curric.│
├─────────────────┼───────────────────────────────────────────┼───────────────┤
│ Cap. 11         │ Forma て: peticiones, continuo, permiso   │ Sobresaliente │
│ Cap. 12         │ Dar y recibir: あげる, くれる, もらう     │ Bien explicado│
│ Cap. 13         │ Temporalidad: とき, まえに, あとで, ながら│ Completo      │
│ Cap. 14         │ Condicionales: 〜たら, 〜と; consejos     │ Sólido        │
│ Cap. 15         │ Obligación (なければ) y permiso (なくても)│ Riguroso      │
│ Cap. 16         │ Opinión (と思う), conjetura (でしょう/そう)│ Bien graduado │
│ Cap. 17         │ Potencial (れる/られる), poder, gusto     │ Completo      │
│ Cap. 18         │ Planes: つもり, 予定, ことにする, ために  │ Sólido        │
│ Cap. 19         │ Forma llana / informal; registro coloquial│ Muy bueno     │
│ Cap. 20         │ Comparaciones (より/ほう), examen A2      │ Sólido        │
└─────────────────┴───────────────────────────────────────────┴───────────────┘
```

#### Análisis Lingüístico A2:
- **La Forma て (Te-form):** Es el eje vertebrador del nivel A2 japonés. El curso desglosa con acierto las reglas de formación morfofonológica según los grupos verbales (Godan, Ichidan y los irregulares する / くる) y sus aplicaciones comunicativas:
  * Petición cortés: 〜てください.
  * Acción continua y estado resultante: 〜ている.
  * Permiso y concesión: 〜てもいい.
  * Prohibición tajante: 〜てはいけない.
  * Acción preparatoria y finalización: 〜ておく, 〜てしまう.
- **Dar y Recibir (Yuju Hyōgen - 授受表現):** Aborda con claridad el sistema de perspectiva psicológica en intercambios de bienes y favores:
  * あげる (dar hacia afuera) y 〜てあげる (hacer un favor a alguien).
  * くれる (dar hacia el hablante/grupo propio) y 〜てくれる.
  * もらう (recibir) y 〜てもらう.
- **Forma Plana (Futsuutai - 普通体) y Registro Informal:** Introducción metódica de la forma de diccionario (jishokei), forma negativa informal (nai-kei), forma pasada informal (ta-kei) y pasada negativa (nakatta-kei). Incorporación de 〜んです / 〜のだ para dar explicaciones o justificaciones.
- **Kanji A2:** Se alcanzan **326 kanji acumulados** (282 nuevos en el nivel), superando holgadamente los ~300 kanji prescritos para JLPT N4.
- **Examen A2 (Cap. 20):** La prueba final evalúa adecuadamente los 10 capítulos previos mediante ejercicios combinados de huecos, lectura comparativa y selección múltiple.

---

### 4.3. Nivel B1 / JLPT N3 (Capítulos 21 a 30 | Lecciones 141 a 215)

```
                            Itinerario Curricular B1 / N3
┌─────────────────┬───────────────────────────────────────────┬───────────────┐
│ Capítulo        │ Contenido Pedagógico Central              │ Estado Curric.│
├─────────────────┼───────────────────────────────────────────┼───────────────┤
│ Cap. 21         │ Causa y efecto: ので, おかげで, せいで    │ Muy bueno     │
│ Cap. 22         │ Contraste y concesión: のに, にもかかわらず│ Sólido        │
│ Cap. 23         │ Transmisión de datos: によると, について  │ Completo      │
│ Cap. 24         │ Hábitos y reglas: たものだ, たびに, ごとに│ Bien explicado│
│ Cap. 25         │ Necesidad y deber: べき, わけにはいかない │ Sólido        │
│ Cap. 26         │ Certeza y suposición: にちがいない, はず  │ Sólido        │
│ Cap. 27         │ Aspecto y proximidad: ようとする, ところ  │ Muy bueno     │
│ Cap. 28         │ Giros y resultados: やっと, ついに, かえって│ Explicativo   │
│ Cap. 29         │ Citas y definiciones: という, といえば    │ Completo      │
│ Cap. 30         │ Repaso general y lecturas B1              │ Integrador    │
└─────────────────┴───────────────────────────────────────────┴───────────────┘
```

#### Análisis Lingüístico B1 y Vacíos Curriculares:
- **Estructuras Gramaticales Logradas:** Excelente cobertura de conectores causales matizados (おかげで para resultados positivos, せいで para atribución de culpa o perjuicio, ために para causas objetivas y ように para propósitos orientados a estados incontrolables).
- **Expresiones de Convicción y Deber:**〜べき (deber moral), 〜わけにはいかない (imposibilidad moral o circunstancial de actuar), 〜にちがいない (deducción categórica) y 〜はずがない (imposibilidad lógica).
- **Kanji B1:** 596 kanji acumulados. Aunque representa un volumen notable, queda ligeramente por debajo de la cota oficial JLPT N3 (~650 kanji), faltando unos 54 caracteres intermedios de alta frecuencia.
- **Carencia Crítica 1: Desatención de la Voz Pasiva (受身 - Ukemi) y Causativa (使役 - Shieki):**
  * En el estándar JLPT N3, la flexión pasiva (Grupo 1: -areru; Grupo 2: -rareru) y causativa (Grupo 1: -aseru; Grupo 2: -saseru) constituyen uno de los bloques evaluativos más densos del examen, especialmente la **pasiva de molestia (*meiwaku no ukemi*)** (p. ej. 雨に降られた - "me pilló la lluvia y me fastidió") y la **pasiva-causativa (*shieki-ukemi*)** (〜させられた - "me obligaron a hacer").
  * En el curso de Paglot, estas formas aparecen de forma marginal y diluida, sin lecciones monográficas específicas que ejerciten las alternancias de partículas de agente y experimentador (に vs. を).
- **Carencia Crítica 2: Condicional en ば (-ba):**
  * La flexión condicional en -ba (書けば, 読めば, よければ) se menciona tangencialmente pero carece del tratamiento sistemático requerido para N3 en construcciones compuestas como 〜ば〜ほど (*cuanto más... más...*).

---

### 4.4. Nivel B2 / JLPT N2 (Capítulos 31 a 40 | Lecciones 216 a 300)

```
                            Itinerario Curricular B2 / N2
┌─────────────────┬───────────────────────────────────────────┬───────────────┐
│ Capítulo        │ Contenido Pedagógico Central              │ Estado Curric.│
├─────────────────┼───────────────────────────────────────────┼───────────────┤
│ Cap. 31         │ Tendencia y evolución: ついでに, つつある │ Sólido        │
│ Cap. 32         │ Límites: からには, にかけて, ことには     │ Riguroso      │
│ Cap. 33         │ Concesión avanzada: ものの, とはいえ      │ Muy bueno     │
│ Cap. 34         │ Emoción y juicio: ものだ, ものか, ものなら│ Completo      │
│ Cap. 35         │ Hipótesis formal: としたら, としても      │ Sólido        │
│ Cap. 36         │ Inmediatez: かと思ったら, たとたん, や否や │ Con duplicado │
│ Cap. 37         │ Persistencia y estado: まま, っぱなし     │ Con duplicado │
│ Cap. 38         │ Lenguaje formal: にわたって, に基づいて   │ Sólido        │
│ Cap. 39         │ Limitación y negación: にすぎない, まい   │ Muy bueno     │
│ Cap. 40         │ Examen Final B2 y Textos Informativos     │ Defectuoso    │
└─────────────────┴───────────────────────────────────────────┴───────────────┘
```

#### Análisis Lingüístico B2 y Defectos Estructurales Críticos:

1. **Déficit Severo de Caracteres Kanji (Déficit de 281 Kanji):**
   * El estándar oficial internacional **JLPT N2 exige el dominio de aproximadamente 1.000 a 1.020 kanji** (los kanji de uso cotidiano *jōyō kanji* de educación primaria más secundaria inicial).
   * El curso de Paglot alcanza únicamente **719 kanji acumulados**. Esto significa que **más del 27% del corpus de kanji exigido para el nivel B2 está completamente ausente**. Un estudiante que apruebe el curso en la app se encontrará en clara desventaja técnica frente a una prueba oficial N2.

2. **Ausencia Práctica del Registro Honorífico Empresarial (Keigo - 敬語):**
   * El examen JLPT N2 dedica una sección fundamental a la discriminación de registros pragmáticos: **Sonkeigo (尊敬語)** para elevar al interlocutor/cliente y **Kenjōgo (謙譲語)** para rebajar humildemente las acciones propias o de la propia empresa (*uchi* vs. *soto*).
   * En las 85 lecciones de B2 de Paglot, formas cardinales como:
     - Sonkeigo: いらっしゃる (estar/ir/venir), おっしゃる (decir), なさる (hacer), 召し上がる (comer/beber), ご覧になる (mirar), お〜になる.
     - Kenjōgo: 参る (ir/venir), 申す / 申し上げる (decir), いたす (hacer), いただく (recibir/comer), 拝見する (mirar), お〜する / お〜いたす.
     apenas reciben una mención esporádica en fichas léxicas secundarias, sin ejercicios prácticos de transformación de registros ni simulaciones de correspondencia comercial (*bījinēsu mēru*).

3. **Comprensión Lectora Subdimensionada en Extensión:**
   * La longitud media de los textos de lectura en B2 es de 102 caracteres, con un máximo absoluto de 371 caracteres en el Cap. 40.
   * Los textos de nivel N2 en la vida real (artículos de prensa en periódicos como *Asahi Shimbun* o editoriales socioeconómicos) constan de 400 a 700 caracteres organizados en varios párrafos lógicos con marcadores argumentativos complejos. Los textos actuales de Paglot en B2 siguen estructurados como microlecturas de 3 o 4 oraciones breves.

4. **Vicio Metodológico de "Distractores Perezosos" en el Examen Final (Capítulo 40):**
   En la evaluación de cierre del curso (lecciones 299 y 300), en lugar de ofrecer distractores gramaticalmente verosímiles que obliguen al alumno a discernir entre matices sutiles de N2, se copió repetidamente la misma justificación trivial en más de 8 preguntas:
   ```text
   - ために :: Eso sería para.
   - ながら :: Eso sería mientras.
   ```
   Un estudiante de nivel B2 no confunde un conector formal de período acumulativo (`にわたって`) o un conector de simultaneidad secundaria (`のかたわら`) con un simple `ために` (estudiado en A2).

---

## 5. Auditoría de Destrezas según los Límites Técnicos de Paglot

Teniendo en cuenta que Paglot no incluye módulos de expresión oral libre (grabación y reconocimiento libre de voz) ni redacción abierta no restringida por limitaciones de arquitectura de la aplicación, se ha auditado con rigor la efectividad de las destrezas operativas implementadas:

```
                            Matriz de Destrezas en Paglot
┌─────────────────────────────────┬───────────────────┬───────────────────────┐
│ Destreza Evaluada               │ Implementación    │ Calidad Metodológica  │
├─────────────────────────────────┼───────────────────┼───────────────────────┤
│ Comprensión Lectora (Dokkai)    │ 318 textos        │ Buena en A1-B1;       │
│                                 │ graduados         │ insuficiente en B2    │
├─────────────────────────────────┼───────────────────┼───────────────────────┤
│ Reconocimiento Ortográfico/     │ 719 kanji / kana  │ Excelente en A1-A2;   │
│ Vocabulario (Moji/Goi)          │ 2.982 fichas      │ déficit del 27% en B2 │
├─────────────────────────────────┼───────────────────┼───────────────────────┤
│ Gramática y Sintaxis (Bunpō)    │ 2.237 ejercicios  │ Muy sólida; afectada  │
│                                 │ interactivos      │ por 165 plantillas    │
├─────────────────────────────────┼───────────────────┼───────────────────────┤
│ Discriminación Auditiva Focal   │ Tests con audio   │ Buena en fonemas;     │
│ (Chōkai Pasivo)                 │ de oraciones      │ escasa en B1-B2       │
└─────────────────────────────────┴───────────────────┴───────────────────────┘
```

1. **Comprensión Lectora (*Dokkai*):**
   - En A1 y A2, los textos graduados (carteles, horarios, notas de avisos, correos informales) son realistas y proporcionan una inmersión excelente en la escritura japonesa con espaciado pedagógico (*wakachigaki*).
   - En B1 y B2 se retira progresivamente el espaciado artificial, aproximando al alumno a la lectura auténtica. Sin embargo, en B2 faltan textos de opinión argumentativa y análisis de gráficos o instrucciones de servicio público habituales en el JLPT N2.

2. **Reconocimiento de Caracteres y Vocabulario (*Moji/Goi*):**
   - El sistema de fichas visibles (1.778) y fichas ocultas (1.204) es una solución técnica muy eficaz que permite anotar expresiones compuestas y kanji secundarios sin sobrecargar el cuaderno de estudio del usuario.

3. **Discriminación Auditiva (*Chōkai*):**
   - Los ejercicios de audio (`A` y `HA`) cumplen la función de asociar la pronunciación estándar (*hyōjungo*) con la grafía kana/kanji. Se echa en falta mayor presencia de clips de escucha conversacional en B1 y B2 (donde solo hay pruebas de lectura textual).

---

## 6. Plan de Acción y División en Bloques para la Fase 4

Para subsanar las 196 lecciones con duplicidades, eliminar la monotonía de las 165 lecciones plantilla, cubrir los vacíos curriculares de pasiva/causativa/Keigo y cerrar la brecha de kanji en B2, se establece la siguiente división operativa en **cuatro bloques de trabajo secuenciales** para la Fase 4:

```
                            Hoja de Ruta - Fase 4
┌─────────────────────────────────────────────────────────────────────────────┐
│ Bloque 1: Nivel A1 (Caps. 01–10 | Lecciones 001–070)                        │
│ • Personalizar prompts de 67 lecciones con duplicidades (R y H).            │
│ • Dinamizar las 38 lecciones de ampliación (preguntas y distractores).      │
│ • Revisión ortográfica de hiragana/katakana y consolidación de 109 kanji.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bloque 2: Nivel A2 (Caps. 11–20 | Lecciones 071–140)                        │
│ • Personalizar prompts de 39 lecciones con duplicidades.                    │
│ • Diversificar las 39 lecciones de ampliación de la forma て y dar/recibir. │
│ • Consolidar kanji N4 (326 kanji) y perfeccionar distractores en Examen A2. │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bloque 3: Nivel B1 (Caps. 21–30 | Lecciones 141–215)                        │
│ • Subsanar duplicidades en 44 lecciones.                                    │
│ • Incorporar módulo reforzado de Voz Pasiva (れる/られる) y Causativa (せる). │
│ • Añadir 54 kanji N3 para alcanzar los ~650 kanji prescritos.               │
│ • Reemplazar preguntas tautológicas en 44 lecciones de ampliación.          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bloque 4: Nivel B2 (Caps. 31–40 | Lecciones 216–300)                        │
│ • CORRECCIÓN INMEDIATA de los duplicados verbatim en L259 y L267.           │
│ • Subsanar duplicidades en 46 lecciones de B2.                              │
│ • CERRAR BRECHA DE KANJI: incorporar los 281 kanji faltantes para ~1.000.  │
│ • Crear unidad curricular dedicada a Keigo empresarial (sonkeigo/kenjōgo).  │
│ • Ampliar lecturas a textos de 400-600 caracteres de ensayo y prensa.      │
│ • Reemplazar distractores perezosos ("ために/ながら") en Examen N2 (Cap. 40).│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Detalle del Bloque 1 (A1: Capítulos 01 a 10 | L001 a L070)
- **Alcance:** 70 lecciones (32 base + 38 ampliación).
- **Intervenciones Prioritarias:**
  1. Diferenciar enunciados en 67 lecciones: sustituir `'¿Qué significa?'` por prompts específicos según contexto (p. ej. *"¿Qué alimento es este?", "¿Qué medio de transporte indica?", "¿Cómo se traduce esta indicación?"*).
  2. Sustituir `'Completa con el patrón de la lección.'` por indicaciones pedagógicas claras (*"Elige la partícula adecuada para el sujeto", "Completa con la forma correcta de cortesía"*).
  3. Enriquecer los distractores de las 38 lecciones plantilla de A1 eliminando las opciones absurdas o genéricas.

### 6.2. Detalle del Bloque 2 (A2: Capítulos 11 a 20 | L071 a L140)
- **Alcance:** 70 lecciones (31 base + 39 ampliación).
- **Intervenciones Prioritarias:**
  1. Personalizar enunciados en las 39 lecciones con duplicidades de A2.
  2. Dinamizar la evaluación de la forma て y dar/recibir en los Capítulos 11 y 12.
  3. Dotar a las 39 lecciones de ampliación de una tercera frase de contexto y ampliar el léxico activo de 2 a 4 palabras útiles.
  4. Pulir las explicaciones de respuesta incorrecta en el simulacro de examen final A2 (Cap. 20).

### 6.3. Detalle del Bloque 3 (B1: Capítulos 21 a 30 | L141 a L215)
- **Alcance:** 75 lecciones (31 base + 44 ampliación).
- **Intervenciones Prioritarias:**
  1. Personalizar enunciados en las 44 lecciones con duplicidades.
  2. **Subsanar el hueco curricular de Voz Pasiva, Causativa y Pasiva-Causativa:**
     - Introducir en los Capítulos 24 o 27 lecciones dedicadas al contraste entre pasiva directa y pasiva indirecta/de molestia (*meiwaku no ukemi*).
     - Ejercitar la forma causativa (〜せる / 〜させる) en contextos de permiso y mandato laboral o familiar.
  3. Incrementar el corpus de kanji en 54 caracteres hasta alcanzar los 650 kanji estándar de N3.
  4. Mejorar la calidad de las preguntas de comprensión lectora en los Capítulos 28 a 30.

### 6.4. Detalle del Bloque 4 (B2: Capítulos 31 a 40 | L216 a L300)
- **Alcance:** 85 lecciones (41 base + 44 ampliación).
- **Intervenciones Críticas Urgentes:**
  1. **Subsanación inmediata de L259 (`36.txt`) y L267 (`37.txt`):** eliminar las preguntas duplicadas verbatim e incorporar en su lugar preguntas de inferencia analítica sobre el texto de lectura.
  2. **Cierre de la Brecha de Kanji N2:**
     - Identificar e incorporar los 281 kanji fundamentales del JLPT N2 que faltan en el curso actual (p. ej. 貿, 易, 輸, 構, 企, 財, 経, 済, 雇, 障, 憲, 衆, 審, 評, 批, 警, 署, 庁, 派, 遣, 裁, 拠, 傾, 震, 災, etc.).
     - Distribuir estos caracteres a lo largo de los Capítulos 31 a 40 en lecturas temáticas de economía, sociedad, ciencia, medio ambiente y administración pública.
  3. **Módulo de Keigo Formal y Empresarial (敬語):**
     - Desarrollar en el Capítulo 38 o 39 un bloque sistemático de honoríficos: transformación de verbos neutros a *sonkeigo* y *kenjōgo*, fórmulas de cortesía telefónica y redacción epistolar formal.
  4. **Ampliación de Textos de Comprensión Lectora:**
     - Extender los textos de lectura de B2 de las actuales 80–120 palabras a fragmentos reales graduados de 200–350 palabras (400–600 caracteres kanji/kana).
  5. **Reestructuración Integral del Examen Final B2 (Capítulo 40):**
     - Erradicar por completo los distractores repetitivos `ために` y `ながら`.
     - Introducir distractores de nivel N2 basados en interferencias sintácticas reales (p. ej. contrastar `にわたって` con `を通じて` y `において`; `ものなら` con `ことなら` y `ばかりに`).

---

## 7. Conclusión y Dictamen Final

El curso de japonés (`ja`) de Paglot cuenta con una base metodológica de excelente rigor fonético y sintáctico en sus niveles iniciales (A1 y A2), con una integración impecable de los silabarios hiragana y katakana y una cobertura de kanji adecuada para N5 y N4.

No obstante, el curso experimenta una **pérdida progresiva de solidez en B1 y B2**, agravada por:
1. El recurso mecánico a un molde clónico en 165 lecciones de ampliación.
2. La existencia de 196 lecciones con preguntas y prompts duplicados, incluyendo dos casos flagrantes de copy-paste en B2.
3. Una brecha insalvable en el estado actual de 281 kanji para el estándar oficial JLPT N2.
4. La ausencia de un tratamiento metódico del Keigo y la voz pasiva/causativa.

El presente diagnóstico proporciona la base forense exacta y la hoja de ruta en 4 bloques requerida para acometer con el máximo rigor la **Fase 4 de Reestructuración y Saneamiento Curricular**.
