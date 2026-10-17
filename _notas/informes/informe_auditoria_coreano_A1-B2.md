# Auditoría Curricular Integral A1–B2: Curso de Coreano (`ko`)

**Fecha de emisión:** 16 de octubre de 2026  
**Especialidad:** Lingüística Aplicada, Diseño Curricular MCER / TOPIK (*National Institute of Korean Language* / 국립국어원) y Desarrollo de Contenidos Paglot  
**Ámbito de aplicación:** Curso completo de coreano (`_herramientas/cursos/ko/`, `coreano.py`, `01.txt` a `40.txt`, `01a.txt` a `40a.txt` e `Idiomas/cursos/ko/lessons/001.json` a `300.json`)  
**Documentos y marcos de referencia inspeccionados:**
- Fuentes maestras del curso: `_herramientas/cursos/ko/capitulos.txt`, `_herramientas/cursos/ko/ESTADO.txt`, `_herramientas/cursos/coreano.py` y los 80 archivos capitulares fuente (`01.txt` a `40.txt` y `01a.txt` a `40a.txt`).
- Compilador oficial: `_herramientas/cursos/compilar.py`.
- Base de datos compilada: `Idiomas/cursos/ko/lessons/001.json` a `300.json` (junto con `capitulos.json`).
- Marcos de referencia oficiales:
  * **Marco Común Europeo de Referencia para las Lenguas (MCER / CEFR Companion Volume 2018/2020)**: niveles de competencia lingüística A1, A2, B1 y B2.
  * **Test of Proficiency in Korean (TOPIK / 한국어능력시험)** del Instituto Nacional para la Educación Internacional de Corea (NIIED / 국립국제교육원): TOPIK I (Nivel 1 = A1, Nivel 2 = A2) y TOPIK II (Nivel 3 = B1, Nivel 4 = B2).
  * **Currículo Estándar Internacional de Lengua Coreana (국제 통용 한국어 교육과정 표준화)** del Instituto Nacional de la Lengua Coreana (National Institute of Korean Language / 국립국어원).
  * Programas de referencia académica internacional: *Sejong Korean* (세종한국어, King Sejong Institute Foundation / 세종학당재단), *Integrated Korean* (KLEAR, University of Hawaii Press), y *Korean Grammar in Use* (Darakwon: Beginning A1/A2, Intermediate B1/B2, Advanced).

---

## 1. Resumen Ejecutivo y Diagnóstico Global

El curso de coreano de Paglot comprende actualmente **300 lecciones distribuidas en 40 capítulos**, estructurado formalmente para cubrir el itinerario completo desde el nivel Acceso (A1 / TOPIK 1) hasta el nivel Avanzado (B2 / TOPIK 4).

Tras una auditoría lingüística forense y un análisis algorítmico exhaustivo de los 80 archivos fuente y los 300 archivos JSON compilados, se emite el siguiente dictamen pericial:

```
                  Arquitectura Real del Curso de Coreano (ko)
┌──────────────────────────────────────┬──────────────────────────────────────┐
│        Lecciones Base: 142           │       Lecciones Ampliación: 158      │
│               (47,3%)                │               (52,7%)                │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Diálogos interactivos con glosa    │ • Plantilla modular fija de 6 ítems  │
│ • Fonética sistemática del Hangul    │ • Prompts clónicos recurrentes       │
│ • Enlace y cambios de sonido         │ • 58 lecciones con "¿Qué significa   │
│ • 26 lecciones con huecos duplicados │   esta frase?" pegado dos veces      │
│ • 22 lecciones con audio duplicado   │ • Distractores perezosos universales │
│ • Exámenes de nivel al final de base │   ("niño/pepino" y "No se determina")│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Principales Hallazgos de la Auditoría:

1. **Resolución Matemática de las 91/92 Lecciones con Preguntas Duplicadas:**
   El escaneo inicial reportó 91 lecciones con preguntas duplicadas. El análisis forense confirma con absoluta precisión que existen **92 lecciones únicas** con duplicidades internas en su atributo `pregunta` (o 91 si se descuenta el ejercicio de ordenar palabras de la L157 por tratarse de un prompt de sistema invariable sin opciones). Estas duplicidades se originan en **7 causas técnicas y autorales específicas**:
   - **58 lecciones** (todas pertenecientes a la ampliación `*a.txt`) contienen dos ejercicios de traducción (`R`) con el prompt idéntico explícito: `'¿Qué significa esta frase?'`.
   - **26 lecciones** (todas de la base inicial de A1 en Capítulos 2 a 10) contienen dos ejercicios de huecos (`H`) a los que el compilador les asignó el prompt por defecto `'Completa la frase.'` al carecer de enunciado personalizado.
   - **22 lecciones** (de la base inicial de A1) contienen dos pruebas auditivas (`A`) con el prompt por defecto `'Escucha. ¿Qué significa?'`.
   - **6 lecciones** contienen ejercicios de traducción (`R`) sin enunciado, asignándoseles por omisión `'¿Qué significa?'`.
   - **2 lecciones** (L001 y L002) contienen pruebas auditivas (`A`) con el prompt por omisión `'Escucha. ¿Qué palabra es?'`.
   - **1 lección (L157)** contiene dos ejercicios de ordenar (`O`) con el prompt fijo `'Ordena las palabras.'`.
   - **1 lección (L186)** contiene dos ejercicios de huecos (`H`) con el prompt idéntico escrito a mano `'cuanto más'`.

2. **Grave Desajuste Estructural en la Secuencia de Compilación:**
   Debido al criterio de ordenación alfabética de archivos en `compilar.py` (`10.txt` antes de `10a.txt`, `20.txt` antes de `20a.txt`, `30.txt` antes de `30a.txt`, `40.txt` antes de `40a.txt`), **los exámenes finales de nivel quedaron ubicados ANTES de las lecciones de consolidación y lectura de la ampliación**:
   - En **A1 (Capítulo 10)**: El *Examen final de A1* está en la lección **062**, quedando las lecciones 063 y 064 (repaso integrado) *después* del examen.
   - En **A2 (Capítulo 20)**: El *Examen final de A2* está en la lección **132**, dejando 4 lecciones de lectura (133–136) *después* del examen.
   - En **B1 (Capítulo 30)**: El *Examen final de B1* está en la lección **202**, ¡dejando nada menos que **14 lecciones completas (203 a 216)** de lectura y síntesis *después* del examen final del nivel!
   - En **B2 (Capítulo 40)**: El *Examen final de B2* está en la lección **295**, dejando 5 lecciones de evaluación integrada y lectura editorial (296 a 300) *después* del examen final de graduación del curso.

3. **Vacío Curricular Crítico en B1: Ausencia Total del Estilo Informal No Cortés (*Banmal* / 반말):**
   A pesar de ser una competencia nuclear e irrenunciable del nivel B1 (TOPIK II Nivel 3) según el MCER y el estándar del NIKL, **no existe una sola lección ni mención explícita al estilo *banmal* (반말 / 해체)** en todo el curso. Incluso en lecciones tituladas *"amigos"* (como la L294), los personajes continúan tratándose formalmente en estilo cortés (*해요체*) y tratándose de *씨*. El estudiante finaliza el curso B2 sin saber conjugar ni comprender el registro coloquial íntimo entre iguales, familiares o jóvenes.

4. **Vicio Evaluativo Sistémico en las 158 Lecciones de Ampliación:**
   Las lecciones añadidas (`01a.txt` a `40a.txt`) recurrieron a un algoritmo generador con distractores de relleno clónicos:
   - Las palabras **pepino (오이)** y **niño/niña (아이)** —introducidas en la lección 001— aparecen **158 y 193 veces respectivamente como opciones distractoras** a lo largo de todo el curso, incluso en lecciones avanzadas de B2 sobre economía y editoriales periodísticas.
   - La opción comodín **"No se puede determinar a partir de esta frase."** aparece **100 veces** en pruebas de comprensión gramatical.
   - La opción **"La frase expresa una idea diferente."** / **"다른 문장입니다."** aparece **23 veces**.

5. **Evaluación de la Cobertura Gramatical (MCER / TOPIK):**
   - **A1 / TOPIK 1 (L001–064): EXCELENTE Y ROBUSTO.** Cobertura modélica del Hangul, las 7 consonantes de *batchim*, enlaces silábicos, nasalización, partículas nucleares (은/는, 이/가, 을/를, 에, 에서, 하고, 도), números nativos y sino-coreanos con contadores, cópula y tiempos presente y pasado.
   - **A2 / TOPIK 2 (L065–136): MUY COMPLETO.** Progresión sólida de conectores (-고, -지만, -아서/어서 vs -(으)니까, -(으)면), modificadores adnominales (-(으)ㄴ, -는, -(으)ㄹ), capacidad, deseo, estilo formal cortés (-(스)ㅂ니다) y honorífico -(으)시-.
   - **B1 / TOPIK 3 (L137–216): NOTABLE EN GRAMÁTICA FORMAL, PERO CON LA BRECHA DE BANMAL.** Trata con rigor el estilo indirecto básico (-다고 하다), voz pasiva léxica (-이/히/리/기-), cambio de estado (-아/어지다, -게 되다), conjeturas (-(으)ㄴ/는 것 같다, -나 보다) y recuerdos (-던, -았/었던).
   - **B2 / TOPIK 4 (L217–300): RICO EN ESTRUCTURAS DISCURSIVAS, DÉFICIT EN HANJA.** Cubre exhaustivamente las fórmulas de TOPIK 4 (-기 마련이다, -(으)ㄹ 수밖에 없다, -느니 차라리, -(으)ㄹ 뿐만 아니라, causativos, contrafactuales con -았/었더라면). No obstante, el corpus léxico de B2 (2.810 palabras únicas acumuladas) queda por debajo de las ~4.500–5.000 palabras de TOPIK II Nivel 4, careciendo de un módulo de raíces sino-coreanas (*Hanja* / 한자어) que permita al estudiante inferir familias léxicas.

---

### 1.1. Balance Cuantitativo Global del Curso

| Nivel MCER / TOPIK | Capítulos | Total Lecc. | Lecc. Base | Lecc. Ampliación | Vocabulario Visible | Vocabulario Oculto | Total Vocab. Único | Acumulado Único | Meta Léxica TOPIK | Ejercicios Totales | Textos Lectura | Diálogos | Explicaciones | Tablas |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1 / TOPIK 1** | 01–10 | 64 | 32 | 32 | 605 | 428 | 1.006 | 1.006 | ~800–1.000 | 512 | 30 | 31 | 124 | 32 |
| **A2 / TOPIK 2** | 11–20 | 72 | 31 | 41 | 365 | 164 | 522 | 1.466 | ~1.500–2.000 | 510 | 12 | 30 | 98 | 29 |
| **B1 / TOPIK 3** | 21–30 | 80 | 41 | 39 | 517 | 240 | 751 | 2.148 | ~3.000 | 562 | 29 | 30 | 100 | 30 |
| **B2 / TOPIK 4** | 31–40 | 84 | 38 | 46 | 533 | 220 | 740 | **2.810** | **~4.500–5.000** | 586 | 27 | 33 | 114 | 32 |
| **TOTAL** | **40 Caps.** | **300** | **142 (47,3%)** | **158 (52,7%)** | **2.020** | **1.052** | — | **2.810** | — | **2.170** | **98** | **124** | **436** | **123** |

---

### 1.2. Tipología y Distribución de Ejercicios por Nivel

| Nivel MCER | Opción Múltiple (`test`) | Huecos (`huecos`) | Traducción (`traduccion`) | Ordenar Palabras (`ordenar`) | Escribir / Resp. Libre | Total Ejercicios | Promedio Ejerc./Lecc. |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1** | 313 (61,1%) | 96 (18,8%) | 73 (14,3%) | 30 (5,9%) | 0 (0,0%) | 512 | 8,00 |
| **A2** | 287 (56,3%) | 107 (21,0%) | 85 (16,7%) | 31 (6,1%) | 0 (0,0%) | 510 | 7,08 |
| **B1** | 319 (56,8%) | 115 (20,5%) | 88 (15,7%) | 40 (7,1%) | 0 (0,0%) | 562 | 7,03 |
| **B2** | 321 (54,8%) | 123 (21,0%) | 105 (17,9%) | 37 (6,3%) | 0 (0,0%) | 586 | 6,98 |
| **TOTAL** | **1.240 (57,1%)** | **441 (20,3%)** | **351 (16,2%)** | **138 (6,4%)** | **0 (0,0%)** | **2.170** | **7,23** |

> [!NOTE]
> De conformidad con la arquitectura técnica de la aplicación Paglot (optimizada para dispositivos móviles sin reconocimiento de voz libre ni corrección de redacción abierta no parametrizada), no se incluyen destrezas de producción oral libre ni redacción no guiada. Se evalúa con rigor la comprensión auditiva focalizada (*deudgi* / 듣기), comprensión lectora contextualizada (*ilgi* / 읽기) y precisión léxico-gramatical (*eohwi/munbeop* / 어휘·문법).

---

## 2. Diagnóstico Forense: Causa Exacta de las 91/92 Lecciones con Duplicidades

El análisis minucioso de la base compilada frente a `compilar.py` y los archivos fuente en `_herramientas/cursos/ko/` aclara el motivo por el cual el escaneo inicial detectó 91 lecciones con preguntas duplicadas. Existen en realidad **92 lecciones afectadas** (o 91 si se descuenta L157, que solo duplica el prompt fijo `'Ordena las palabras.'`).

```
           Desglose Forense de las Lecciones con Prompts Duplicados
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ Causa y Cadena de Prompt Duplicada                          │ Lecciones    │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ 1. Traducciones `R` con prompt explícito duplicado          │ 58 lecciones │
│    '¿Qué significa esta frase?' en lecciones de ampliación  │              │
│ 2. Huecos `H` sin enunciado → 'Completa la frase.'          │ 26 lecciones │
│ 3. Pruebas de audio `A` sin enunciado → 'Escucha. ¿Qué...?' │ 22 lecciones │
│ 4. Traducciones `R` sin enunciado → '¿Qué significa?'       │ 6 lecciones  │
│ 5. Pruebas de audio `A` cortas → 'Escucha. ¿Qué palabra es?'│ 2 lecciones  │
│ 6. Ejercicios `O` duplicados en L157 → 'Ordena las palabras.'│ 1 lección    │
│ 7. Huecos `H` con prompt duplicado en L186 → 'cuanto más'   │ 1 lección    │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ TOTAL LECCIONES ÚNICAS AFECTADAS (unión matemática)         │ 92 lecciones │
└─────────────────────────────────────────────────────────────┴──────────────┘
```

### 2.1. Desglose Detallado de las 7 Causas

#### Causa 1: Duplicación Explícita de `'¿Qué significa esta frase?'` (58 lecciones)
En 58 lecciones de ampliación (`*a.txt`), el generador de contenido insertó dos líneas consecutivas de tipo `R`:
```text
R frase 1 :: ¿Qué significa esta frase?
R frase 2 :: ¿Qué significa esta frase?
```
Al tener ambas frases exactamente el mismo texto de pregunta, la interfaz de usuario presenta dos pantallas sucesivas con el mismo enunciado idéntico.
- **Lecciones afectadas (58):** 14, 33, 45, 51, 52, 64, 71, 78, 85, 92, 99, 107, 114, 121, 128, 135, 136, 144, 145, 191, 196, 197, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 222, 223, 229, 230, 237, 238, 246, 247, 253, 254, 261, 262, 268, 269, 280, 281, 289, 290, 291, 298, 299, 300.
- Nótese que en el nivel B2, **los 10 capítulos contienen lecciones con este defecto** en sus ejercicios de lectura final.

#### Causa 2: Omisión de Parámetro en Huecos `H` (26 lecciones)
El compilador (`compilar.py`, línea 199) define:
```python
ejercicio('huecos', pregunta=q or 'Completa la frase.', frase=f)
```
En 26 lecciones base de A1, el autor escribió dos líneas `H frase ___` sin especificar la pregunta tras `::`. Ambas recibieron el prompt fallback `'Completa la frase.'`.
- **Lecciones afectadas (26):** 8, 9, 10, 16, 17, 20, 21, 22, 27, 28, 29, 34, 35, 36, 41, 42, 43, 46, 47, 48, 53, 54, 55, 58, 59, 60.

#### Causa 3: Omisión de Parámetro en Ejercicios de Audio `A` (22 lecciones)
El compilador (`compilar.py`, línea 204) define:
```python
ejercicio('test', pregunta=q or 'Escucha. ¿Qué significa?', audio=f)
```
Al haber dos ejercicios de escucha por lección sin prompt en la base de A1, ambos heredan `'Escucha. ¿Qué significa?'`.
- **Lecciones afectadas (22):** 9, 20, 21, 22, 27, 28, 29, 34, 36, 41, 42, 43, 46, 47, 48, 53, 54, 55, 58, 59, 60, 61.

#### Causa 4: Omisión de Parámetro en Traducciones `R` (6 lecciones)
El compilador (`compilar.py`, línea 190) define:
```python
ejercicio('traduccion', pregunta=q or '¿Qué significa?', frase=f)
```
- **Lecciones afectadas (6):** 1, 2, 3, 10, 87, 93.

#### Causa 5: Audio de Vocabulario en A1 (2 lecciones)
En L001 y L002, dos ejercicios de escucha de palabras sueltas sin parámetro recibieron `'Escucha. ¿Qué palabra es?'`.
- **Lecciones afectadas (2):** 1, 2.

#### Causa 6: Prompt Fijo en Ordenar `O` (1 lección: L157)
El compilador (`compilar.py`, línea 209) hardcodea:
```python
'pregunta': 'Ordena las palabras.'
```
En la lección 157 (`23.txt`), el autor introdujo dos ejercicios de ordenar palabras seguidos:
1) `시간이 부족하다면 박물관에 갈 거예요`
2) `맛있을지도 몰라요`
Ambos recibieron forzosamente `'Ordena las palabras.'`.

#### Causa 7: Prompt Explícito Duplicado en Huecos (1 lección: L186)
En la lección 186 (`28.txt`), el autor escribió a mano `cuanto más` como pregunta en dos ejercicios de huecos consecutivos:
1) `H 한국어는 공부 ___ 재미있어요. :: cuanto más` (+ 할수록)
2) `H 시간이 지날 ___ 점점 좋아져요. :: cuanto más` (+ 수록)

---

### 2.2. Mapa de Coincidencias e Intersección de Causas

La superposición exacta entre causas explica por qué el número total de lecciones no es la suma aritmética directa:
- **58 lecciones** presentan exclusivamente la Causa 1 (`¿Qué significa esta frase?`).
- **21 lecciones** presentan simultáneamente la Causa 2 (`Completa la frase.`) y la Causa 3 (`Escucha. ¿Qué significa?`).
- **4 lecciones** presentan únicamente la Causa 2.
- **3 lecciones** presentan únicamente la Causa 4 (`¿Qué significa?`).
- **2 lecciones** (L001 y L002) combinan la Causa 4 y la Causa 5.
- **1 lección** (L010) combina la Causa 2 y la Causa 4.
- **1 lección** (L061) presenta únicamente la Causa 3.
- **1 lección** (L157) presenta la Causa 6.
- **1 lección** (L186) presenta la Causa 7.
- **Total neto de lecciones únicas afectadas:** **92 lecciones** (36 en A1, 13 en A2, 21 en B1 y 22 en B2).

---

## 3. Diagnóstico de Lecciones Plantilla y Vicios Evaluativos

### 3.1. El Molde Rígido de las 158 Lecciones de Ampliación (`*a.txt`)

Mientras que las 142 lecciones originales (archivos base `01.txt` a `40.txt`) presentan diálogos interactivos ricos, análisis desglosados con el operador `>` y variedad de actividades, las 158 lecciones añadidas (`01a.txt` a `40a.txt`) se ciñen a un esquema clónico de producción industrial:

```
                  Estructura Invariable de una Lección de Ampliación
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Encabezado `@ cap | título_ko | título_es`                                │
│ 2. `E Idea clave :: teoría :: frase_ejemplo = traducción`                   │
│ 3. `W palabra1 = traducción` / `W palabra2 = traducción` (1 o 2 visibles)   │
│ 4. `V Vocabulario clave`                                                    │
│ 5. `Q Pregunta conceptual sobre la idea clave`                              │
│ 6. `R frase_ejemplo :: ¿Qué significa esta frase?` (traducción idéntica)   │
│ 7. `H frase_con_hueco :: Completa con la forma adecuada.`                   │
│ 8. `Q ¿Qué frase expresa «traducción»?` (pregunta espejo inversa)           │
│ 9. `Q ¿Qué significa «palabra1»?` (pregunta tautológica de vocabulario)     │
│ 10. `Q ¿Qué palabra significa «traducción»?` (pregunta inversa vocabulario) │
└─────────────────────────────────────────────────────────────────────────────┘
```

Este esquema genera una **evaluación en circuito cerrado**: el alumno estudia una única frase en la explicación y los 6 ejercicios siguientes le preguntan repetidamente sobre la misma frase y las mismas dos palabras, limitando la transferencia de aprendizaje.

### 3.2. El Vicio de los Distractores Perezosos Universales

En las 158 lecciones de ampliación, el generador recurrió a un conjunto estático de opciones falsas que destruyen la discriminación cognitiva:

1. **La invasión de `niño/niña` y `pepino`:**
   - En las preguntas de vocabulario (`Q ¿Qué significa «...»?`), el distractor incorrecto por defecto asignado fue:
     `- niño, niña :: Esa traducción corresponde a otra palabra.` (193 veces)
     `- pepino :: Esa traducción corresponde a otra palabra.` (158 veces)
   - Y en las preguntas inversas en coreano:
     `- 아이 :: Esa palabra tiene otra traducción.`
     `- 오이 :: Esa palabra tiene otra traducción.`
   - **Impacto pedagógico:** En el nivel B2 (e.g. L299 y L300), cuando se evalúa la comprensión de términos periodísticos como `사설` (editorial) o `보고서` (informe técnico), las opciones falsas que se le ofrecen al estudiante son `niño` y `pepino`, permitiendo acertar por simple descarte obvio sin necesidad de conocer el idioma.

2. **La opción de descarte "No se puede determinar":**
   - En las preguntas conceptuales (`Q`), la tercera opción es invariablemente:
     `- No se puede determinar a partir de esta frase. :: La frase permite identificar la opción correcta.` (100 veces en total).

3. **El comodín de traducción ajena:**
   - `- La frase expresa una idea diferente. :: Esta traducción cambia el sentido de la frase.` (23 veces).
   - `- 다른 문장입니다. :: Esta frase expresa otra idea.`

### 3.3. Anomalía Posicional Crítica: Exámenes Finales Antes de las Ampliaciones

El error más grave de diseño curricular radica en el desajuste de orden entre los archivos base (`N.txt`) y de ampliación (`Na.txt`). El compilador procesa `10.txt` y luego `10a.txt`. Dado que en la versión original el examen final del nivel cerraba el archivo `N.txt`:

```
                 Desajuste de Secuencia en los Exámenes de Nivel
Capítulo 10 (A1):
   L060: Coreano formal -(스)ㅂ니다
   L061: Lectura integrada A1
   L062: [!] EXAMEN FINAL DE A1 (32 ejercicios)  <-- ¡Examen prematuro!
   L063: 10a.txt: Vocabulario hospitalario
   L064: 10a.txt: Repaso integrado A1: un plan sencillo

Capítulo 20 (A2):
   L131: Repaso: un viaje a Jeju
   L132: [!] EXAMEN FINAL DE A2 (30 ejercicios)  <-- ¡Examen prematuro!
   L133–136: 20a.txt: 4 lecciones de lectura de avisos y correos cotidianos

Capítulo 30 (B1):
   L201: Repaso gramatical B1
   L202: [!] EXAMEN FINAL DE B1 (26 ejercicios)  <-- ¡Examen prematuro!
   L203–216: 30a.txt: ¡¡14 LECCIONES COMPLETAS DE LECTURA DE B1 QUEDAN DETRÁS DEL EXAMEN!!

Capítulo 40 (B2):
   L294: Amigos y mensajes
   L295: [!] EXAMEN FINAL DE B2 / GRADUACIÓN (30 ejercicios) <-- ¡Examen prematuro!
   L296–300: 40a.txt: 5 lecciones de lectura editorial y evaluación integrada
```

Este defecto significa que **el alumno se gradúa del nivel (o del curso) antes de haber cursado entre el 15% y el 20% del contenido pedagógico y de lectura de dicho nivel**.

---

## 4. Evaluación Curricular Nivel por Nivel (MCER vs. TOPIK)

### 4.1. Nivel A1 / TOPIK I Nivel 1 (Capítulos 01 a 10 | Lecciones 001–064)
- **Calificación Curricular:** **SOBRESALIENTE (9,2 / 10)** (con corrección de prompts y orden de examen).
- **Competencias evaluadas según el MCER / TOPIK:**
  * **Sistema de escritura Hangul (한글):** Introducción ejemplar en los Capítulos 1 y 2. Desglose analítico de consonantes simples, aspiradas y dobles/tensas. Vocales verticales, horizontales y diptongos.
  * **Fonotáctica y *Batchim* (받침):** Las 7 consonantes finales neutralizadas ([ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ]). Reglas de enlace intersilábico (*yeon-eum* / 연음) como en `옷이` -> `[오시]`.
  * **Cambios fonéticos iniciales:** Nasalización en cópulas y formales (`합니다` -> `[함니다]`).
  * **Partículas nucleares:** Tema (*은/는*), Sujeto (*이/가*), Objeto (*을/를*), Lugar y tiempo (*에*, *에서*), Adición y compañía (*하고*, *도*).
  * **Predicación básica y Cópula:** *이에요/예요*, negación *이/가 아니에요* / *아닙니다*. Verbos de existencia *있어요/없어요*.
  * **Conjugación:** Presente informal cortés (*해요체*: regla de armonía vocálica -아요/-어요) y Pasado (*-았/었어요*).
  * **Sistemas de numeración:** Diferenciación funcional entre números nativos (horas, personas, cosas) y sino-coreanos (fechas, minutos, dinero, teléfonos) junto a los contadores obligatorios (*개, 명, 병, 잔, 권, 마리, 시, 분, 원*).
  * **Cortesía inicial:** Honorífico básico *-시-* / *-으시-* en L058–059.
- **Carencias detectadas en A1:**
  * 36 lecciones afectadas por duplicación de prompts (`Completa la frase.` y `Escucha. ¿Qué significa?`).
  * El Examen Final de A1 se ubica en la lección 062, dejando descolgadas las lecciones 063 y 064.

---

### 4.2. Nivel A2 / TOPIK I Nivel 2 (Capítulos 11 a 20 | Lecciones 065–136)
- **Calificación Curricular:** **NOTABLE ALTO (8,8 / 10)**.
- **Competencias evaluadas según el MCER / TOPIK:**
  * **Conectores oracionales:**
    - Coordinación y sucesión: *-고*.
    - Contraste: *-지만*.
    - Causa y justificación: Distinción contrastiva rigurosa entre *-아서/어서* (causa objetiva, temporalidad, incompatible con imperativos) y *-(으)니까* (causa subjetiva, premisa para propuestas e imperativos).
    - Condición: *-(으)면*.
  * **Modificadores adnominales (형용사/동사 관형사형):** Estructura fundamental del coreano para calificar nombres: adjetivos en *-(으)ㄴ*, verbos en presente *-는*, verbos en pasado *-(으)ㄴ* y verbos en futuro *-(으)ㄹ*. Cobertura clara en el Capítulo 14.
  * **Modalidad y actos de habla:**
    - Capacidad e incapacidad: *-(으)ㄹ 수 있다/없다*.
    - Intención y planes: *-(으)려고 하다* y desplazamiento con propósito *-(으)러 가다/오다*.
    - Deseos propios y ajenos: *-고 싶다* frente a *-고 싶어하다*.
    - Obligación y permiso: *-아/어야 하다* (deber) y *-아/어도 되다* (poder/permiso). Prohibición con *-(으)면 안 되다* y *-지 마세요*.
    - Peticiones y favores: *-아/어 주다 / 드리다*, *-아/어 주세요*.
    - Estilo formal cortés (*하십시오체*): *-(스)ㅂ니다 / -(스)ㅂ니까*, consolidado en situaciones de viaje, hotel y transporte (Capítulos 11 y 20).
    - Compromiso en 1ª persona: *-(으)ㄹ게요*.
    - Decisión previa: *-기로 하다*.
- **Carencias detectadas en A2:**
  * 13 lecciones afectadas por prompts duplicados (`¿Qué significa esta frase?`).
  * El Examen Final de A2 está en la lección 132, antes de las lecturas 133–136.

---

### 4.3. Nivel B1 / TOPIK II Nivel 3 (Capítulos 21 a 30 | Lecciones 137–216)
- **Calificación Curricular:** **BIEN (7,0 / 10)** (Lastrado por el vacío de Banmal y el caos posicional del examen).
- **Competencias cubiertas con solvencia:**
  * **Estilo indirecto básico (간접 인용):** Asimilación sistemática del estilo indirecto declarativo (*-다고 하다* / *-(이)라고 하다*), preguntas (*-냐고 하다*), órdenes (*-(으)라고 하다*) y propuestas (*-자고 하다*). Identificación de formas contraídas habituales en mensajes (*-대요, -래요, -재요*).
  * **Voz Pasiva e Indirecta:** Verbos pasivos léxicos con sufijo *-이/히/리/기-* (열리다, 잡히다, 들리다, 닫히다) en el Capítulo 24.
  * **Transformación y cambio:** Distinción entre cambio de cualidad (*-아/어지다*), devenir circunstancial independiente del sujeto (*-게 되다*) y transformación nominal (*N이/가 되다*).
  * **Hábitos y memorias pasadas:** Matices de evocación retrospectiva con *-던*, hábitos reiterativos con *-곤 하다*, y pasado remoto/desconectado con *-았/었던*.
  * **Conjetura y justificación atenuada:** El conector de trasfondo *-는데 / -(으)ㄴ데*; conjetura basada en indicios con *-(으)ㄴ/는 것 같다*, *-나 보다* y *-(으)ㄴ/는 모양이다*.
  * **Concesión y contraste:** *-(으)ㄴ데도* (a pesar de), *-더라도* (incluso si), y observación retrospectiva con *-더니 / -았더니*.
- **Carencias y fracturas críticas en B1:**
  1. **VACÍO ABSOLUTO DE BANMAL (반말):** Ninguna lección enseña la conjugación ni el uso pragmático del habla informal entre iguales o hacia menores. Este es un error pedagógico grave en un nivel B1.
  2. **Colapso posicional del Examen Final:** La lección 202 es el examen de B1, y a continuación vienen **14 lecciones consecutivas (203 a 216)** de ampliación.
  3. **Monotonía en L203–216:** Las 14 lecciones posteriores al examen adolecen todas del prompt duplicado `'¿Qué significa esta frase?'`.

---

### 4.4. Nivel B2 / TOPIK II Nivel 4 (Capítulos 31 a 40 | Lecciones 217–300)
- **Calificación Curricular:** **NOTABLE (8,0 / 10)** (Excelente catálogo gramatical avanzado, pero lastrado por distractores clónicos y brecha de Hanja).
- **Competencias cubiertas con solvencia:**
  * **Estructuras gramaticales complejas de TOPIK II Nivel 4:**
    - Causalidad negativa / inesperada: *-는 바람에* (por culpa de), *-탓에*.
    - Inevitabilidad y generalidad: *-기 마련이다* (es natural/inevitable que), *-(으)ㄹ 수밖에 없다* (no queda otra opción que).
    - Restricción y adición argumentativa: *-(으)ㄹ 뿐이다* (solo), *-(으)ㄹ 뿐만 아니라* (no solo... sino también).
    - Preferencia radical: *-(으)느니 차라리* (antes de hacer X, prefiero Y).
    - Inutilidad y contraste: *-(으)나 마나* (hacerlo no sirve de nada), *-기는커녕* (lejos de... ni siquiera).
    - Contraste formal: *-(으)ㄴ/는 반면에* (por el contrario).
    - Evidencia predictiva: *-(으)ㄹ 게 뻔하다* (es cantado que...).
    - Descubrimiento retrospectivo: *-고 보니* (al hacerlo descubrí que...), proceso continuo *-다 보면* (si sigues haciendo...).
    - Simulación y conjetura sutil: *-는 척하다* (fingir que), *-(으)ㄴ/는/ㄹ 듯하다* (parece que), *-듯이* (como si).
    - Expresión de sorpresa: *-다니(요)*, *-다니까(요)*.
    - Contrafactuales de alta hipótesis: *-았/었더라면* (si hubiera pasado...).
    - Registro formal escrito: Nominalización con *-(으)ㅁ* (`알려 드립니다`) y coordinación en *-(으)며*.
    - Énfasis estilístico: *N(이)야말로*, *여간 ~지 않다*.
    - Causativos morfológicos (*사동*): raíces verbales con infijos *-이/히/리/기/우/추-*.
- **Carencias y fracturas críticas en B2:**
  1. **Brecha léxica de Hanja (한자어):** En B2, el estudiante coreano debe dominar la formación de palabras a través de morfemas sino-coreanos (como *학, 생, 교, 국, 대, 회, 심, 감, 기, 원, 실*). El curso no ofrece ninguna tabla ni explicación etimológica de estos morfemas, obligando al estudiante a memorizar las palabras avanzadas como cadenas aisladas.
  2. **Examen Final fuera de lugar:** El examen de B2 está en L295, dejando 5 lecciones de evaluación final (296 a 300) después de graduarse.
  3. **Distractores ridículos:** En lecturas de editoriales y política de transporte, los distractores siguen ofreciendo "pepino", "niño", "아이" y "오이".

---

## 5. Análisis de Vocabulario y Competencia Textual (*Dokkai* / 읽기)

### 5.1. Comparativa del Corpus Léxico frente al Estándar TOPIK

```
                  Corpus Léxico Paglot vs. Estándar Oficial TOPIK
┌──────────────┬──────────────────┬──────────────────┬────────────────────────┐
│ Nivel        │ Vocabulario Real │ Estándar Oficial │ Diagnóstico            │
│              │ Acumulado Paglot │ TOPIK (NIIED)    │                        │
├──────────────┼──────────────────┼──────────────────┼────────────────────────┤
│ A1 (TOPIK 1) │ 1.006 palabras   │ ~800–1.000 pal.  │ Cumplimiento óptimo    │
│ A2 (TOPIK 2) │ 1.466 palabras   │ ~1.500–2.000 pal.│ Rozando el mínimo      │
│ B1 (TOPIK 3) │ 2.148 palabras   │ ~3.000 palabras  │ Déficit de ~850 pal.   │
│ B2 (TOPIK 4) │ 2.810 palabras   │ ~4.500–5.000 pal.│ Brecha de ~1.700 pal.  │
└──────────────┴──────────────────┴──────────────────┴────────────────────────┘
```

El curso presenta una base léxica muy sólida en A1 (con 1.006 palabras únicas perfectamente glosadas), pero a medida que avanza hacia B1 y B2, la densidad de nuevo vocabulario visible por lección decrece drásticamente (promediando apenas 2 a 3 palabras nuevas por lección en la ampliación).

### 5.2. Evaluación de los Textos de Lectura (읽기)

- **A1 y A2:** Textos breves (30–60 palabras), avisos de transporte, billetes de tren Seúl-Busan, menús de restaurante, notas de compra. Excelente realismo y correspondencia con las preguntas de lectura de TOPIK I.
- **B1 y B2:** Avisos de cambios de servicio, correos formales de empresa, fragmentos de noticias locales y reseñas culturales. Los textos son lingüísticamente correctos y reproducen la prosa coreana auténtica, pero su extensión (60–100 palabras) es inferior a los textos de lectura larga de TOPIK II (200–350 palabras con preguntas de deducción de postura del autor).

---

## 6. Plan de Acción y División en Bloques para la Fase 4

Para subsanar de forma sistemática y rigurosa todas las anomalías detectadas, se establece un plan operativo dividido en **4 Bloques de Trabajo secuenciales**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PLAN DE ACCIÓN - FASE 4 (COREANO)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bloque 1: Nivel A1 (Caps. 01–10 | Lecciones 001–064)                        │
│ • Diferenciar prompts en las 36 lecciones con duplicidades (huecos y audio).│
│ • Reemplazar los distractores mecánicos ("pepino/niño") por opciones reales.│
│ • Reordenar el Capítulo 10 para situar el Examen Final en la Lección 064.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bloque 2: Nivel A2 (Caps. 11–20 | Lecciones 065–136)                        │
│ • Personalizar los prompts de traducción en las 13 lecciones afectadas.     │
│ • Diversificar las opciones en ejercicios de ampliación de los Caps. 11–20. │
│ • Reordenar el Capítulo 20 para situar el Examen Final en la Lección 136.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bloque 3: Nivel B1 (Caps. 21–30 | Lecciones 137–216)                        │
│ • INCORPORAR MÓDULO DE BANMAL (반말 / 해체): crear lecciones dedicadas al    │
│   registro informal íntimo y su contraste con 해요체 y 하십시오체.           │
│ • Reestructurar radicalmente el Capítulo 30: mover el Examen de B1 (L202)   │
│   a la lección final del capítulo (L216), integrando las 14 lecturas previas│
│ • Diferenciar prompts en las 21 lecciones afectadas de B1.                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bloque 4: Nivel B2 (Caps. 31–40 | Lecciones 217–300)                        │
│ • Reordenar el Capítulo 40: mover el Examen de B2 (L295) a la Lección 300.  │
│ • Erradicar definitivamente los distractores "pepino/niño" en las lecturas. │
│ • Incorporar módulo de formación léxica basada en raíces Hanja (한자어).     │
│ • Personalizar prompts de traducción en las 22 lecciones de lectura de B2.  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Detalle del Bloque 1 (A1: Capítulos 01 a 10 | L001 a L064)
- **Alcance:** 64 lecciones (32 base + 32 ampliación).
- **Intervenciones Prioritarias:**
  1. Personalizar los enunciados de las 26 lecciones con huecos duplicados: sustituir `'Completa la frase.'` por indicaciones gramaticales precisas (*"Elige la partícula de sujeto adecuada", "Completa con la forma correcta de presente"*).
  2. Personalizar las 22 pruebas auditivas: sustituir `'Escucha. ¿Qué significa?'` por preguntas de comprensión (*"¿Qué relación familiar se menciona?", "¿A qué hora sale el tren?"*).
  3. Reemplazar los distractores clónicos en las 32 lecciones de ampliación de A1.
  4. Mover el examen de A1 al final del capítulo 10 (L064).

### 6.2. Detalle del Bloque 2 (A2: Capítulos 11 a 20 | L065 a L136)
- **Alcance:** 72 lecciones (31 base + 41 ampliación).
- **Intervenciones Prioritarias:**
  1. Subsanar las 13 lecciones con prompts de traducción duplicados (`¿Qué significa esta frase?`), personalizando cada prompt según la situación comunicativa.
  2. Enriquecer las opciones en las lecciones de conectores (*-아서/어서* vs *-(으)니까*, *-(으)면*) en los Capítulos 13 y 18.
  3. Mover el examen final de A2 al final del capítulo 20 (L136).

### 6.3. Detalle del Bloque 3 (B1: Capítulos 21 a 30 | L137 a L216)
- **Alcance:** 80 lecciones (41 base + 39 ampliación).
- **Intervenciones Críticas:**
  1. **Creación del Módulo de Banmal (반말):** Adaptar lecciones en el Capítulo 21 o 22 para introducir formalmente las terminaciones de habla informal no cortés (*-아/어, -지, -자, -냐, -(으)ㄹ래*), fundamentales para la interacción real en Corea.
  2. **Subsanación de la Anomalía del Examen B1:** Reorganizar los archivos fuente de modo que las 14 lecciones de lectura de `30a.txt` se cursen antes del examen final, y el Examen B1 quede fijado en la lección 216.
  3. **Corrección de Duplicidades:** Resolver los prompts repetidos en las 21 lecciones afectadas, incluyendo la corrección específica de L157 (ordenar palabras) y L186 (huecos con prompt `'cuanto más'`).

### 6.4. Detalle del Bloque 4 (B2: Capítulos 31 a 40 | L217 a L300)
- **Alcance:** 84 lecciones (38 base + 46 ampliación).
- **Intervenciones Críticas:**
  1. **Reubicación del Examen Final de Graduación:** Mover el examen de B2 de la lección 295 a la lección 300, convirtiéndola en la prueba cumbre del curso.
  2. **Erradicación de Distractores Absurdos:** Purgar todas las referencias a `pepino`, `niño`, `아이` y `오이` en las lecciones 217 a 300, sustituyéndolas por distractores con interferencia léxica o sintáctica verosímil de nivel TOPIK 4.
  3. **Módulo de Raíces Sino-Coreanas (Hanja / 한자어):** Introducir tablas explicativas de los 20 morfemas hanja más prolíficos en textos formales (p. ej., 学/생, 国/국, 会/회, 的/적, 化/화) para impulsar la comprensión lectora autónoma del alumno.
  4. **Subsanar las 22 lecciones de B2** que repiten el prompt `'¿Qué significa esta frase?'` en sus ejercicios de lectura final.

---

## 7. Conclusión y Dictamen Final

El curso de coreano (`ko`) de Paglot exhibe una base pedagógica y lingüística de altísimo nivel en la enseñanza del Hangul, las normas ortofónicas de enlace y nasalización, el sistema de partículas y el repertorio de estructuras gramaticales intermedias y avanzadas de TOPIK II.

Sin embargo, la efectividad global del curso se encuentra comprometida por **tres problemas de arquitectura editorial y técnica**:
1. **La duplicidad de prompts en 92 lecciones**, producto de omisiones de parámetros en la base y generación clónica en la ampliación.
2. **La colocación prematura de los 4 exámenes de nivel** (especialmente en B1 y B2), que deja decenas de lecciones de lectura situadas erróneamente con posterioridad a los exámenes.
3. **La omisión absoluta del registro coloquial íntimo (*banmal*)** en B1 y la ausencia de formación léxica sino-coreana (*hanja*) en B2, junto al empleo recurrente de distractores infantiles en textos avanzados.

El presente informe proporciona el diagnóstico exhaustivo y la hoja de ruta precisa en cuatro bloques para acometer con el máximo rigor la **Fase 4 de Reestructuración y Saneamiento Curricular**.
