# Auditoría Curricular Integral A1–B2: Curso de Griego Moderno (`el`)

**Fecha de emisión:** 16 de octubre de 2026  
**Especialidad:** Lingüística Aplicada, Diseño Curricular MCER / Πιστοποιητικό Ελληνομάθειας y Desarrollo de Contenidos Paglot  
**Ámbito de aplicación:** Curso completo de griego moderno (`_herramientas/cursos/el/`, `el_a2/`, `el_b1/`, `el_b2/`, `ampliacion_griego/` / `Idiomas/cursos/el/lessons/001.json` a `300.json`)  
**Documentos y fuentes de referencia inspeccionados:**
- `_herramientas/cursos/el/capitulos.txt` y `ESTADO.txt`
- `_herramientas/cursos/el_a2/el/capitulos.txt`, `el_b1/el/capitulos.txt`, `el_b2/el/capitulos.txt`
- `_herramientas/cursos/INFORME_AUDITORIA_GRIEGO_A1-B2.md` (informe preliminar de auditoría estática)
- `_herramientas/cursos/generar_ampliacion_griego.py` (script automatizado de generación)
- `_herramientas/cursos/compilar.py`
- `Idiomas/cursos/el/lessons/capitulos.json` e inventario exhaustivo de los 300 archivos `.json`
- Marcos de referencia oficiales: *Marco Común Europeo de Referencia para las Lenguas (MCER / Consejo de Europa)* y el sistema oficial de certificación de la República Helénica **Πιστοποιητικό Επάρκειας της Ελληνομάθειας** administrado por el Centro de Lengua Griega (**Κέντρο Ελληνικής Γλώσσας - ΚΕΓ**, Ministerio de Educación de Grecia):
  * **Επίπεδο Α1** (Στοιχειώδης Γνώση / Acceso)
  * **Επίπεδο Α2** (Βασική Γνώση / Plataforma)
  * **Επίπεδο Β1** (Μέτρια Γνώση / Umbral)
  * **Επίπεδο Β2** (Καλή Γνώση / Avanzado)
- Gramáticas de referencia de griego moderno: *Νεοελληνική Γραμματική (Τριανταφυλλίδη)*, *Modern Greek: A Comprehensive Grammar of the Modern Language (Holton, Mackridge & Philippaki-Warburton)* y las directrices curriculares del *Διαπολιτισμικό Πρόγραμμα Διδασκαλίας της Νέας Ελληνικής ως Ξένης Γλώσσας* (Universidad de Atenas / Universidad Aristóteles de Salónica).

---

## 1. Resumen Ejecutivo y Diagnóstico Global

El curso de griego moderno de Paglot consta actualmente de **300 lecciones distribuidas en 40 capítulos**, con el objetivo de cubrir la progresión desde el nivel A1 hasta el nivel B2.

Tras una auditoría lingüística y técnica minuciosa de las fuentes de autoría, los scripts de generación y compilación, y los 300 archivos publicados en producción, se dictamina que el curso presenta una **profunda fractura metodológica, estructural y pedagógica**, caracterizada por:

1. **Un núcleo base valioso pero incompleto (124 lecciones | 41,3% del curso):** Creado en cuatro bloques independientes de 31 lecciones por nivel. Posee explicaciones gramaticales contrastivas de buen nivel, diálogos naturales y una progresión lógica inicial. Sin embargo, sufre de un grave defecto técnico heredado: **589 ejercicios con identificadores duplicados/mismatched** (`el001-1` a `el031-7`) y un pronunciado déficit de lectura en A2 y B1.
2. **Una ampliación mecánica hiper-repetitiva (176 lecciones | 58,7% del curso):** Añadida para alcanzar la cuota de 300 lecciones mediante el script `generar_ampliacion_griego.py`. La totalidad de estas 176 lecciones responde a un **molde automatizado clónico y monótono**: exactamente 1 palabra nueva visible por lección, un diálogo falso de metadatos (Μαρία/Νίκος, Μαρία/Πέτρος, Ελένη/Πέτρος, Συντονίστρια/Αναλυτής), una lectura artificial de 3 frases inconexas y 6 actividades que interrogan en bucle a la primera frase del texto.
3. **El espejismo del escaneo previo de duplicidades:** Mientras que en otros idiomas el detector superficial arrojó cientos de duplicidades, en griego reportó **0 lecciones con duplicidades internas**. Esto no se debe a una mayor variedad didáctica, sino a un artefacto técnico: el generador utilizó 6 cadenas de texto de consigna diferentes por lección, ocultando que el contenido pedagógico de los ejercicios es 100% idéntico y tautológico.
4. **Una grave fractura de navegación y orden pedagógico:** Las 176 lecciones de ampliación se compilaron como las lecciones 125 a 300, pero fueron asignadas a los capítulos 1 al 40. Si el alumno avanza numéricamente (1 → 300), recorre A1, A2, B1, B2, aprueba el examen final B2 en la lección 124 y, súbitamente, en la lección 125 regresa a aprender el sonido de la letra «η» de A1. Si navega por capítulos, encuentra una asimetría caótica: el capítulo 11 tiene 3 lecciones, mientras que el capítulo 20 tiene 22 lecciones.

```
Total Curso de Griego Moderno: 300 Lecciones
┌───────────────────────────────┬────────────────────────────────────────┐
│      Base Auténtica: 124      │        Plantillas Clónicas: 176        │
│            (41,3%)            │                (58,7%)                 │
└───────────────────────────────┴────────────────────────────────────────┘
│ Progresión comunicativa real  │ Molde algorítmico rígido de 3 frases   │
│ Explicaciones contrastivas    │ Diálogos plantilla "Μαρία/Νίκος"       │
│ Defecto: 589 IDs reciclados   │ Exactamente 1 palabra visible/lección  │
```

### 1.1. Balance Cuantitativo Global

| Componente | Lecciones | % del Curso | Palabras Visibles | Palabras Ocultas | Diálogos Comunicativos | Diálogos Plantilla | Textos Lectura Genuinos | Textos Micro-Plantilla |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Lecciones Base (001–124)** | 124 | 41,3% | 1.156 | 614 | 121 | 0 | 62 | 0 |
| **Ampliación (125–300)** | 176 | 58,7% | 176 | 704 | 0 | 176 | 0 | 176 |
| **TOTAL CURSO** | **300** | **100%** | **1.332** | **1.318** | **121** | **176** | **62** | **176** |

### 1.2. Distribución de Recursos por Nivel MCER / Πιστοποιητικό Ελληνομάθειας

| Nivel MCER / Certificación | Capítulos | Total Lecc. | Base (Sólidas) | Plantillas Clónicas | % Plantillas | Palabras Visibles | Palabras Ocultas (`w`) | Diálogos Base | Textos Lectura Base |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1** *(Στοιχειώδης)* | Caps. 01–10 | 67 | 31 | 36 | **53,7%** | 527 | 144 | 29 | 29 |
| **A2** *(Βασική)* | Caps. 11–20 | 73 | 31 | 42 | **57,5%** | 337 | 202 | 30 | 2 |
| **B1** *(Μέτρια)* | Caps. 21–30 | 77 | 31 | 46 | **59,7%** | 202 | 433 | 31 | 0 |
| **B2** *(Καλή)* | Caps. 31–40 | 83 | 31 | 52 | **62,7%** | 266 | 539 | 31 | 31* |
| **TOTAL** | **40 Capítulos** | **300** | **124** | **176** | **58,7%** | **1.332** | **1.318** | **121** | **62** |

*\*Nota sobre B2 Base:* Los 31 bloques de texto de B2 Base no aportan lecturas independientes auténticas; en su versión original duplicaban de forma literal las frases de los diálogos de la misma lección.

---

## 2. Esclarecimiento Técnico del Escaneo Previo: El Espejismo de las «0 Duplicidades»

El escaneo preliminar automático arrojó un resultado sorprendente: **cero lecciones con preguntas duplicadas**. Sin embargo, la auditoría forense demuestra que este indicador es un espejismo técnico que oculta vicios pedagógicos severos:

```
Diagnóstico del Escaneo Superficial vs. Realidad Forense
┌──────────────────────────────────────┬──────────────────────────────────────┐
│       Escaneo Superficial            │           Realidad Forense           │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 0 lecciones con preguntas repetidas  │ Las 6 actividades de cada plantilla  │
│ (Se evaluaron cadenas exactas de     │ interrogan a la MISMA frase (#1)     │
│ la propiedad "pregunta")             │ con enunciados fijos diferenciados.  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Sin colisiones de consignas          │ 589 ejercicios con IDs reciclados    │
│ detectadas en el validador JSON      │ de A1 (el001-1 a el031-7) en A2,     │
│                                      │ B1 y B2 (Lecciones 032 a 124).       │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 2.1. El mecanismo del falso negativo en la ampliación
En cursos como portugués o alemán, el generador produjo múltiples ejercicios de tipo `traduccion` o `huecos` con la misma consigna (`"Elige la traducción más fiel."` o `"Completa la frase."`), lo que activó las alarmas del detector.

En griego, el desarrollador de `generar_ampliacion_griego.py` asignó un texto de consigna distinto a cada tipología dentro de la misma lección:
1. `test` (escucha): `"Escucha el ejemplo y reconoce el sonido o la entonación que se practica."`
2. `test` (lectura): `"¿Qué información presenta directamente el texto?"`
3. `traduccion`: `"¿Qué significa esta frase?"`
4. `huecos`: `"Completa la frase con la forma que corresponde al ejemplo."`
5. `ordenar`: `"Ordena las palabras."`
6. `escribir`: `"Escribe una frase breve en griego sobre «[Título]» e incluye «[Palabra]»."`

Aunque las 6 cadenas son formalmente distintas (0 duplicidades léxicas en `"pregunta"`), **el 100% de los 6 ejercicios evalúa exactamente la misma frase número 1 del texto**. No hay variación de contenido, ni profundización conceptual, ni evaluación de destrezas complementarias.

### 2.2. El problema crítico no detectado: 589 Identificadores de Ejercicio Reciclados
Una auditoría integral del código compilado en `Idiomas/cursos/el/lessons/` ha sacado a la luz un error de compilación sistemático en la base:

- **Lecciones 001 a 031 (A1):** Los ejercicios se identifican correctamente como `el001-1` a `el031-7`.
- **Lecciones 032 a 062 (A2):** Los ejercicios **vuelven a numerarse como `el001-1` a `el031-7`** en lugar de `el032-1` a `el062-7`.
- **Lecciones 063 a 093 (B1):** Los ejercicios **vuelven a numerarse como `el001-1` a `el031-7`** en lugar de `el063-1` a `el093-7`.
- **Lecciones 094 a 124 (B2):** Los ejercicios **vuelven a numerarse como `el001-1` a `el031-7`** en lugar de `el094-1` a `el124-7`.

**Causa raíz técnica:** Las carpetas fuente `_herramientas/cursos/el_a2/el/`, `el_b1/el/` y `el_b2/el/` fueron compiladas individualmente sin pasar el parámetro `--ids-globales` al script `compilar.py`. Esto genera un total de **589 identificadores duplicados entre niveles**, lo que compromete el seguimiento de progreso por ejercicio, la analítica del motor SRS y la persistencia de respuestas en bases de datos externas.

### 2.3. Comprobación de incidencias previas: Huecos con distractores en español en B1
El informe preliminar señalaba que en B1 las lecciones tenían distractores en español dentro de los ejercicios de huecos (ej. en la lección 063 se completaba «Ελπίζω να έχω περισσότερο ___» con distractores como «Porque quiere estudiar en Atenas»).

La inspección forense actual confirma que **esta incidencia fue subsanada satisfactoriamente** en los JSON publicados:
- En `063.json`, el ejercicio de huecos ofrece ahora: `χρόνο` (correcta), `χώρο` (distractor griego), `θόρυβο` (distractor griego).
- Un barrido sobre las 31 lecciones de B1 arrojó **0 ocurrencias de caracteres latinos o español en las opciones de huecos**.

---

## 3. Anatomía Forense de las 176 Lecciones Plantilla (`generar_ampliacion_griego.py`)

Las 176 lecciones de ampliación (L125 a L300) se generaron mediante un script determinista que replica un único esquema en 4 niveles de dificultad:

### 3.1. Esquema invariante de la lección plantilla
Cada una de las 176 lecciones contiene con exactitud matemática:
1. **Ficha de vocabulario raquítica:** Exactamente 1 palabra visible y 4 palabras ocultas (`"oculta": true`). La palabra visible es la que se retira en el ejercicio de huecos.
2. **Diálogo metalingüístico ficticio (`DIALOGUE_FRAMES`):** En lugar de una conversación entre dos hablantes nativos en una situación real (comprar en el mercado, pedir indicaciones, debatir en el trabajo), el script genera un intercambio forzado y artificial sobre la palabra clave de la lección:
   - **En A1:**
     * Μαρία: *«Ποια λέξη μαθαίνουμε σήμερα;»* (¿Qué palabra aprendemos hoy?)
     * Νίκος: *«Σήμερα μαθαίνουμε τη λέξη «[palabra]».»* (Hoy aprendemos la palabra «[palabra]».)
   - **En A2:**
     * Μαρία: *«Ποια λέξη είναι χρήσιμη εδώ;»* (¿Qué palabra es útil aquí?)
     * Πέτρος: *«Εδώ είναι χρήσιμη η λέξη «[palabra]».»* (Aquí es útil la palabra «[palabra]».)
   - **En B1:**
     * Ελένη: *«Ποιος όρος είναι σημαντικός για το θέμα;»* (¿Qué término es importante para el tema?)
     * Πέτρος: *«Ο όρος «[palabra]» είναι σημαντικός για το θέμα.»* (El término «[palabra]» es importante para el tema.)
   - **En B2:**
     * Συντονίστρια: *«Ποιος όρος είναι καθοριστικός για την ερμηνεία;»* (¿Qué término es decisivo para la interpretación?)
     * Αναλυτής: *«Ο όρος «[palabra]» είναι καθοριστικός για την ερμηνεία.»* (El término «[palabra]» es decisivo para la interpretación.)
3. **Micro-texto de 3 frases:** Tres frases independientes concatenadas artificialmente.
4. **Bucle de 6 ejercicios centrados en la Frase 1:**
   - Ejercicio 1 (Test / Escucha): Se reproduce el audio de las 3 frases concatenadas y se pregunta por la Frase 1.
   - Ejercicio 2 (Test / Lectura): Se muestra el texto de 3 frases y se vuelve a preguntar por la Frase 1.
   - Ejercicio 3 (Traducción): Se pide traducir la Frase 1 al español.
   - Ejercicio 4 (Huecos): Se toma la Frase 1, se oculta la palabra clave y se completa.
   - Ejercicio 5 (Ordenar): Se desordenan las palabras de la Frase 1.
   - Ejercicio 6 (Escribir): Se pide escribir una frase con la palabra clave y el único modelo admitido es, una vez más, la Frase 1.

### 3.2. Vicios Pedagógicos Críticos de este Enfoque
- **Cero transferencia pragmática:** El estudiante aprende a reaccionar a una única frase memorizada en 6 pasos sucesivos. No hay inferencia, no hay diálogo situacional, no hay comprensión global de textos extensos.
- **Pobreza de input:** En un nivel B2 (MCER), donde el alumno debería analizar columnas periodísticas de 300 palabras con subordinadas complejas y vocabulario abstracto, se le presentan 3 frases aisladas y se le enseña 1 sola palabra por lección.
- **Monotonía y fatiga cognitiva:** Al cabo de 10 lecciones, el estudiante descubre el patrón de respuesta inmediata (siempre la primera frase, siempre la palabra clave del título) y deja de procesar el griego lingüísticamente.

---

## 4. Anomalía Estructural en el Sistema de Archivos, Capítulos y Numeración

### 4.1. La Fractura de la Progresión Lineal
La ordenación de archivos en Paglot sigue un esquema de descubrimiento numérico continuo: `001.json`, `002.json`, ... `300.json`.

Al compilarse la ampliación como las lecciones 125 a 300, se produjo una inversión pedagógica inaceptable:
```
Progreso Real del Alumno según la Numeración de Archivos (001 a 300):
┌───────────┬───────────┬───────────┬───────────┬────────────────────────────────────────┐
│  001–031  │  032–062  │  063–093  │  094–124  │                125–300                 │
│    A1     │    A2     │    B1     │    B2     │       REGRESIÓN CÍCLICA TOTAL          │
├───────────┼───────────┼───────────┼───────────┼───────────┬───────────┬──────────┬─────┤
│ Base A1   │ Base A2   │ Base B1   │ Base B2   │  125–160  │  161–202  │ 203–248  │249– │
│           │           │           │ (Examen)  │  Amp A1   │  Amp A2   │ Amp B1   │ 300 │
└───────────┴───────────┴───────────┴───────────┴───────────┴───────────┴──────────┴─────┘
                                                ▲
                    ¡El alumno termina B2 y vuelve a aprender el alfabeto A1!
```
Un usuario que completa el curso de manera secuencial alcanza el nivel de dominio B2 en la lección 124 (*«Repaso final B2: Estrategias para B2»*), y al pasar a la lección 125 se encuentra repentinamente con la frase: *«Το γράμμα «η» ακούγεται σαν «ι»»* (Lección 125: Distinguir vocales y consonantes parecidas al oído).

### 4.2. Asimetría Extrema en la Distribución de Capítulos
En lugar de estructurar un nuevo marco de capítulos o integrar las lecciones de forma armónica (p. ej. 7 u 8 lecciones por capítulo), el script de ampliación «inyectó» las nuevas lecciones según coincidencias temáticas sueltas:

- En A2: El **Capítulo 20** (*Estudios, trabajo y gestiones*) recibió **18 lecciones de golpe**, pasando a tener **22 lecciones en total**, mientras que el Capítulo 11 y el Capítulo 13 se quedaron con solo 3 lecciones.
- En B1: El **Capítulo 30** (*Historias y experiencias*) acumuló **17 lecciones**, mientras que otros capítulos tienen 5 o 6.
- En B2: El **Capítulo 35** acumuló **14 lecciones** y el **Capítulo 40** acumuló **17 lecciones**, mientras que el Capítulo 34 y el Capítulo 37 se quedaron con solo 4 lecciones.

Esta desproporción desvirtúa por completo el ritmo de avance por unidades didácticas.

---

## 5. Diagnóstico Curricular Nivel a Nivel (MCER / Πιστοποιητικό Ελληνομάθειας)

### 5.1. Nivel A1 — Inicial / Acceso (Caps. 01–10 | 67 lecciones: 31 base, 36 plantillas)
*Marco oficial de contraste: Πιστοποιητικό Επάρκειας της Ελληνομάθειας - Επίπεδο Α1 (Κέντρο Ελληνικής Γλώσσας).*

#### A. Gramática y Morfosintaxis
- **Alfabeto, fonología y ortografía:**
  * *Fortalezas:* Buena presentación inicial de vocales y consonantes en L001 y L002. Tratamiento adecuado de dígrafos vocálicos (αι /e/, ει, οι, υι /i/, ου /u/) y combinaciones consonánticas (μπ /b/, ντ /d/, γκ/γγ /g/, τσ /ts/, τζ /dz/). Explicación del acento tónico ortográfico (**τόνος**).
  * *Carencias:* No se sistematiza la regla de los diptongos con diéresis (**διαλυτικά**: π.χ. μάιος vs μαϊμού), ni las combinaciones **αυ** y **ευ** ante vocal/sonora (/av/, /ev/) vs ante sorda (/af/, /ef/), que se tocan sólo de pasada. Se debe formalizar la puntuación griega (el punto y coma como interrogación `;` y el punto alto `·`).
- **Sistema nominal y casos:**
  * *Fortalezas:* Se presentan los artículos definidos nominativos (**ο, η, το**) e indefinidos (**ένας, μία, ένα**).
  * *Carencias críticas:* El caso acusativo singular (**τον, την, το**) se introduce tarde y sin insistir en la regla eufónica obligatoria de la **-ν final** (se mantiene en *τον/την* ante vocal y oclusivas *κ, π, τ, μπ, ντ, γκ, ξ, ψ*; se elide en *τη* ante fricativas y continuas en el estándar moderno normativo). La flexión de plural (masculinos en *-οι/-ους*, femeninos en *-ες*, neutros en *-ια/-η*) carece de tablas de contraste claras.
- **Sistema verbal:**
  * *Fortalezas:* Presente del verbo copulativo **είμαι** y posesivo **έχω**. Verbos regulares de la 1.ª conjugación (Grupo A en **-ω**: μένω, κάνω, διαβάζω, γράφω).
  * *Carencias:* Escasa presencia de la 2.ª conjugación (Grupo B1 en **-άω/-ώ**: μιλάω, αγαπάω, y Grupo B2 en **-ώ/-είς**: μπορώ, ζω). El estudiante llega a A2 sin saber conjugar verbos tan vitales como *μιλάω* o *αγαπώ*.

#### B. Vocabulario y Comprensión Lectora
- *Base sólida:* Excelente cobertura léxica temática en las 31 lecciones base: saludos, origen y nacionalidad, números (1 al 100), familia, casa, café/restaurante, compras, ciudad y direcciones. 29 lecciones base incluyen un texto de lectura breve.
- *Plantillas degradadas:* Las 36 lecciones ampliadas aportan únicamente 36 palabras visibles (una por lección). Vocabulario esencial como comidas comunes, prendas de vestir y transporte queda diluido en ejercicios tautológicos.

---

### 5.2. Nivel A2 — Elemental / Plataforma (Caps. 11–20 | 73 lecciones: 31 base, 42 plantillas)
*Marco oficial de contraste: Πιστοποιητικό Επάρκειας της Ελληνομάθειας - Επίπεδο Α2 (ΚΕΓ).*

#### A. Gramática y Morfosintaxis
- **El núcleo del A2 griego: El Pasado Aoristo Activo (Αόριστος):**
  * *Diagnóstico:* El Aoristo es la piedra angular del nivel A2 en griego moderno. En la base se introduce en L050 (*«Τι έκανα χτες»*), pero su tratamiento es muy superficial.
  * *Carencias críticas:* No se explican con claridad los cambios morfológicos de raíz y desinencia:
    1. Verbos en labial (*-π-, -β-, -φ-, -πτ-*) → **-ψα** (*γράφω → έγραψα*, *ανάβω → άναψα*).
    2. Verbos en dental (*-τ-, -δ-, -θ-*) → **-σα** (*κοιτάζω → κοίταξα*, *διαβάζω → διάβασα*).
    3. Verbos en velar (*-κ-, -γ-, -χ-, -χν-*) → **-ξα** (*ανοίγω → άνοιξα*, *μαγειρεύω → μαγείρεψα*).
    4. Los aoristos irregulares más frecuentes del idioma están casi ausentes en la práctica sistemática: **είδα** (ver), **είπα** (decir), **ήπια** (beber), **έφαγα** (comer), **βρήκα** (encontrar), **μπήκα/βγήκα** (entrar/salir), **πήρα** (coger/tomar), **ήρθα** (venir). En las lecciones base, *έφαγα* aparece 1 vez, *ήπια* 0 veces, *ήρθα* 0 veces y *έγραψα* 0 veces.
- **El Futuro Simple (Στιγμιαίος Μέλλοντας):**
  * Se forma con la partícula **θα** + tema de aoristo/subjuntivo (*θα γράψω, θα πάω, θα φάω*). Aparece de forma dispersa sin consolidar la correspondencia de temas con el aoristo.
- **Pronombres Clíticos y el Caso Genitivo:**
  * Falta un tratamiento sistemático del genitivo singular (*του, της, του*) para expresar posesión y relaciones personales.
  * Los pronombres personales débiles de objeto directo (acusativo: *με, σε, τον, την, το, μας, σας, τους, τις, τα*) e indirecto (genitivo: *μου, σου, του, της, μας, σας, τους*) se usan en frases fijas, pero no se enseña su colocación preverbal (*του το λέω*) vs postverbal en imperativo (*πες μου*).
- **Verbos modales e infinitivo supletorio:**
  * Uso de **πρέπει να** (debo/hay que) y **μπορώ να** (puedo). Falta ejercitar la selección modal con subjuntivo simple vs continuo.

#### B. Vocabulario y Comprensión Lectora
- **Apagón lector en la base:** De las 31 lecciones base de A2, **¡solo 2 lecciones (L032 y L033) contienen un bloque de lectura (`texto`)!** Las otras 29 lecciones no tienen lectura continua, limitándose al diálogo corto.
- Los temas requeridos por el KEG para A2 (anuncios de alquiler, horarios de tren/barco, partes meteorológicos breves, notas en el trabajo, recetas e instrucciones de medicamentos) no se practican en formatos realistas.

---

### 5.3. Nivel B1 — Intermedio / Umbral (Caps. 21–30 | 77 lecciones: 31 base, 46 plantillas)
*Marco oficial de contraste: Πιστοποιητικό Επάρκειας της Ελληνομάθειας - Επίπεδο Β1 (ΚΕΓ).*

#### A. Gramática y Morfosintaxis
- **La gran fractura curricular: Voz Pasiva y Verbos Deponentes (Παθητική Φωνή):**
  * *Diagnóstico:* En griego moderno, la voz pasiva no es una curiosidad estilística: es un pilar morfológico que engloba verbos deponentes cotidianos y la formación de acciones reflexivas y recíprocas.
  * *Evidencia forense:* En todo el nivel B1 (tanto en las 31 lecciones base como en las 46 de ampliación), **la voz pasiva tiene CERO presencia pedagógica estructurada**.
  * No se enseña la conjugación en presente pasivo en **-ομαι, -εσαι, -εται, -όμαστε, -εστε, -ονται** (*έρχομαι, χρειάζομαι, αισθάνομαι, σκέφτομαι, θυμάμαι, κοιμάμαι*).
  * No se enseña el Aoristo Pasivo en **-θηκα, -τηκες, -τηκε, -θήκαμε, -θήκατε, -θηκαν** (*γεννήθηκα, κοιμήθηκα, κουράστηκα, χάρηκα, στάθηκα, πληρώθηκα*). Términos como *γεννήθηκα* o *κοιμήθηκα* tienen 0 ocurrencias en B1.
- **Participios Pasados en -μένος/-μένη/-μένο:**
  * Los participios perfectos pasivos (*κουρασμένος, κλεισμένος, ευχαριστημένος, προβληματισμένος*) son indispensables en B1 para descripciones y tiempos compuestos. Aparecen 0 veces en B1.
- **Aspecto Verbal en el Subjuntivo (Υποτακτική):**
  * La diferencia conceptual entre el subjuntivo continuo (**να διαβάζω** - proceso habitual o durativo) y el subjuntivo simple (**να διαβάσω** - acción puntual o completa) no se formaliza, provocando que los estudiantes utilicen indiscriminadamente ambas formas.
- **Oraciones Condicionales y Estilo Indirecto:**
  * Se tocan condicionales de tipo 1 (*αν + presente/aoristo, futuro*), pero faltan las de tipo 2 (irreales: *αν είχα χρόνο, θα ερχόμουν* con παρατατικός).
  * El estilo indirecto con **ότι / πως** (*μου είπε ότι...*) y con **να** (*μου ζήτησε να...*) requiere mucha más ejercitación contrastiva.

#### B. Vocabulario y Comprensión Lectora
- **Apagón lector total en la base B1:** Las 31 lecciones base de B1 contienen **exactamente 0 bloques de lectura (`texto`)**. Todo el material lingüístico se reduce a diálogos breves de 4 a 6 líneas.
- **Déficit léxico visible:** B1 Base solo expone 156 palabras visibles (apenas 5 palabras por lección), mientras que oculta 249 palabras en las frases. El alumno no dispone de fichas ni explicaciones para la mitad del vocabulario que aparece en pantalla.

---

### 5.4. Nivel B2 — Avanzado / Ventaja (Caps. 31–40 | 83 lecciones: 31 base, 52 plantillas)
*Marco oficial de contraste: Πιστοποιητικό Επάρκειας της Ελληνομάθειας - Επίπεδο Β2 (ΚΕΓ).*

#### A. Gramática y Morfosintaxis
- **Subordinación compleja y conectores avanzados:**
  * En B2, el MCER y el examen oficial del KEG exigen dominio de la argumentación, la concesión y la causalidad elaborada.
  * La inspección léxica revela carencias críticas:
    * **μολονότι** (a pesar de que / aunque formal): **0 ocurrencias** en todo el curso.
    * **παρόλο που** (a pesar de que): **1 sola ocurrencia** en 83 lecciones.
    * **καθώς** (a medida que / puesto que): **1 sola ocurrencia**.
    * **εφόσον** (siempre que / dado que): solo 3 menciones en la base.
    * **υπό την προϋπόθεση ότι** (a condición de que): 2 menciones.
- **Adjetivos cultos y declinaciones contractas:**
  * No se estudian los paradigmas de adjetivos formales en **-ης, -ης, -ες** (*διεθνής, συνεπής, σαφής, πλήρης*). *διεθνής* y *συνεπής* tienen **0 apariciones** en B2.
  * No se estudian los adjetivos en **-υς, -ια, -υ** (*βαθύς, βαρύς, πλατύς, ελαφρύς*), fundamentales en la lengua culta y descriptiva (0 apariciones).
- **Voz pasiva avanzada, participios activos y nominalizaciones:**
  * Falta el participio activo de gerundio en **-οντας / -ώντας** (*τρέχοντας, διαβάζοντας*).
  * Falta la ejercitación sistemática de nominalizaciones formales (*η διατήρηση, η διεξαγωγή, η εφαρμογή, η εκτίμηση*), omnipresentes en el registro administrativo y periodístico.

#### B. Vocabulario, Prensa Escrita y Cohesión Textual
- **Ausencia de prosa periodística real:** Aunque los títulos de los capítulos de B2 son pertinentes (teletrabajo, medios, medioambiente, inteligencia artificial, patrimonio cultural), los textos ofrecidos son embrionarios: 3 frases sueltas en la ampliación, o réplicas del diálogo en la base.
- No hay artículos de opinión al estilo de diarios de referencia griegos (**Καθημερινή**, **Το Βήμα**, **Τα Νέα**), ni cartas formales auténticas, ni informes técnicos estructurados.
- **El simulacro del Examen B2:** Las lecciones finales 124 y 300 prometen una síntesis discursiva integral, pero se resuelven mediante preguntas de opción múltiple descontextualizadas o un ejercicio de escritura libre corregido por coincidencia exacta de caracteres.

---

## 6. Inventario Exhaustivo Capítulo por Capítulo (01 al 40)

| Cap | Nivel | Título en Español | Título en Griego | Lecciones Base | Lecciones Ampliación | Total Lecc. | Vocab. Visible | Vocab. Oculto | Diagnóstico y Prioridad de Intervención en Fase 4 |
|:---:|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **01** | A1 | Primeros pasos | Πρώτα βήματα | 3 (001–003) | 6 (125–130) | **9** | 53 | 24 | Alfabeto y fonología. Reemplazar 6 plantillas de sonidos por diálogos de deletreo y cortesía. |
| **02** | A1 | Yo y los demás | Εγώ και οι άλλοι | 3 (004–006) | 3 (131–133) | **6** | 56 | 12 | Presentaciones y verbo είμαι. Crear diálogos reales de registro informal y formal. |
| **03** | A1 | Familia y números | Οικογένεια και αριθμοί | 3 (007–009) | 3 (134–136) | **6** | 63 | 12 | Posesivos y verbo έχω. Eliminar diálogos clónicos; introducir árboles genealógicos y edades. |
| **04** | A1 | La casa y el barrio | Το σπίτι και η γειτονιά | 3 (010–012) | 3 (137–139) | **6** | 47 | 12 | Artículos y preposiciones de lugar (σε + acusativo). Añadir anuncios de habitaciones reales. |
| **05** | A1 | La vida diaria | Η καθημερινή ζωή | 3 (013–015) | 3 (140–142) | **6** | 58 | 12 | Presente en -ω (Grupo A) y horas. Crear lecturas sobre rutinas semanales auténticas. |
| **06** | A1 | En el café y el restaurante | Στο καφέ και στο εστιατόριο | 3 (016–018) | 0 | **3** | 49 | 0 | Capítulo base bien diseñado. Requiere 3-4 lecciones adicionales sobre pedidos y pagos. |
| **07** | A1 | Compras y ropa | Ψώνια και ρούχα | 3 (019–021) | 3 (143–145) | **6** | 55 | 12 | Precios, colores y acusativo. Sustituir plantillas por compras reales en tiendas y mercados. |
| **08** | A1 | En la ciudad y desplazamientos | Στην πόλη και στις μετακινήσεις | 3 (022–024) | 6 (146–151) | **9** | 49 | 24 | Indicaciones y transporte. 6 plantillas a transformar en mapas, paradas de metro y horarios. |
| **09** | A1 | Tiempo libre y clima | Ελεύθερος χρόνος και καιρός | 3 (025–027) | 3 (152–154) | **6** | 55 | 12 | Verbo μου αρέσει + να e invitaciones. Reemplazar plantillas por mensajes de mensajería real. |
| **10** | A1 | Salud, viajes y repaso | Υγεία, ταξίδια και επανάληψη | 4 (028–031) | 6 (155–160) | **10** | 42 | 24 | Repaso final A1. 6 plantillas de cierre a transformar en prueba integrada A1 con rúbricas. |
| **11** | A2 | Personas y relaciones | Άνθρωποι και σχέσεις | 3 (032–034) | 0 | **3** | 31 | 1 | Descripción física y de carácter. Corregir IDs reciclados; añadir lecturas sobre biografías. |
| **12** | A2 | Vivienda y barrio | Ένα σπίτι για μένα | 3 (035–037) | 3 (161–163) | **6** | 25 | 12 | Comparar viviendas. Reemplazar plantillas por contratos sencillos y avisos de averías. |
| **13** | A2 | Rutinas y tareas | Η καθημερινότητά μου | 3 (038–040) | 0 | **3** | 22 | 10 | Verbos modales μπορώ/πρέπει. Añadir lecciones con textos de lectura (apagón actual). |
| **14** | A2 | Alimentación | Τρώμε καλά | 3 (041–043) | 1 (164) | **4** | 26 | 4 | Hábitos culinarios y recetas griegas tradicionales. Ampliar con menús de taberna auténticos. |
| **15** | A2 | Compras y servicios | Ψώνια και υπηρεσίες | 3 (044–046) | 2 (165–166) | **5** | 39 | 10 | Cambios y devoluciones. Transformar plantillas en reclamaciones en tiendas reales. |
| **16** | A2 | Tiempo libre | Ελεύθερος χρόνος | 3 (047–049) | 6 (167–172) | **9** | 36 | 32 | Invitaciones y espectáculos. 6 plantillas clónicas a reescribir con carteleras y planes culturales. |
| **17** | A2 | Experiencias pasadas | Τι έκανα χτες | 3 (050–052) | 3 (173–175) | **6** | 30 | 18 | **Núcleo del Aoristo Activo.** Reestructurar a fondo la morfología de temas (-σα, -ξα, -ψα, irregulares). |
| **18** | A2 | Viajes y alojamiento | Ταξίδια και διαμονή | 3 (053–055) | 6 (176–181) | **9** | 30 | 28 | Billetes y problemas de viaje. Sustituir 6 plantillas por reclamaciones de retrasos de ferry/tren. |
| **19** | A2 | Salud y cuidados | Υγεία και φροντίδα | 3 (056–058) | 3 (182–184) | **6** | 31 | 13 | Farmacia y médico. Reemplazar plantillas por prospectos de medicamentos y síntomas reales. |
| **20** | A2 | Estudios, trabajo y gestiones | Σπουδές, δουλειά και επικοινωνία | 4 (059–062) | 18 (185–202) | **22** | 67 | 74 | **Hipertrofia crítica (18 plantillas).** Desmantelar el vertedero de plantillas; redistribuir y crear trámites reales. |
| **21** | B1 | Nuevos comienzos | Μια νέα αρχή | 3 (063–065) | 3 (203–205) | **6** | 19 | 43 | Decisiones y cambios de vida. Introducir contraste παρατατικός / αόριστος con lecturas. |
| **22** | B1 | Buscar trabajo | Η αναζήτηση εργασίας | 3 (066–068) | 3 (206–208) | **6** | 18 | 33 | Anuncios de empleo. Sustituir plantillas por CVs en formato griego y entrevistas de trabajo. |
| **23** | B1 | Aprender toda la vida | Μαθαίνω σε όλη μου τη ζωή | 3 (069–071) | 3 (209–211) | **6** | 16 | 35 | Formación y cursos. Reemplazar plantillas por reglamentos universitarios y solicitudes. |
| **24** | B1 | La vida en el barrio | Η γειτονιά αλλάζει | 3 (072–074) | 4 (212–215) | **7** | 19 | 37 | Problemas comunitarios. Crear debates sobre obras públicas y asociaciones de vecinos. |
| **25** | B1 | Viajes con imprevistos | Ένα ταξίδι με απρόοπτα | 3 (075–077) | 2 (216–217) | **5** | 13 | 38 | Narración de imprevistos. Sustituir plantillas por narraciones de viajes con aoristos pasivos. |
| **26** | B1 | Cultura y tiempo libre | Πολιτισμός και ελεύθερος χρόνος | 3 (078–080) | 3 (218–220) | **6** | 19 | 35 | Reseñas de libros y cine griego. Reemplazar plantillas por sinopsis y críticas culturales. |
| **27** | B1 | Ciudad y medioambiente | Η πόλη και το περιβάλλον | 3 (081–083) | 3 (221–223) | **6** | 20 | 36 | Causas y consecuencias medioambientales. Reemplazar plantillas por textos sobre reciclaje y transporte. |
| **28** | B1 | Consumo y servicios | Καταναλωτές και υπηρεσίες | 3 (084–086) | 6 (224–229) | **9** | 21 | 49 | Incidencias y quejas formales. 6 plantillas a transformar en cartas de reclamación oficiales. |
| **29** | B1 | Comunicación y vida social | Επικοινωνία και κοινωνική ζωή | 3 (087–089) | 6 (230–235) | **9** | 21 | 41 | Tacto y rechazo cortés. Transformar 6 plantillas en correos formales y mensajes sociales. |
| **30** | B1 | Historias y experiencias | Ιστορίες και εμπειρίες | 4 (090–093) | 13 (236–248) | **17** | 36 | 86 | **Hipertrofia de 13 plantillas.** Introducir urgentemente la **voz pasiva en -ομαι y -θηκα** y participios en -μένος. |
| **31** | B2 | Argumentar con fundamento | Συζητώντας με επιχειρήματα | 3 (094–096) | 10 (249–258) | **13** | 32 | 78 | 10 plantillas a reescribir. Incorporar conectores: *παρόλο που, μολονότι, εφόσον, υπό την προϋπόθεση*. |
| **32** | B2 | Noticias y medios | Ειδήσεις και ενημέρωση | 3 (097–099) | 6 (259–264) | **9** | 29 | 57 | Distinción hecho/opinión. Reemplazar plantillas por fragmentos reales de Kathimerini / To Vima. |
| **33** | B2 | Tecnología y vida diaria | Τεχνολογία και καθημερινή ζωή | 3 (100–102) | 3 (265–267) | **6** | 23 | 55 | Privacidad y datos. Reemplazar plantillas por contratos de licencias digitales y condiciones de uso. |
| **34** | B2 | Medioambiente y sostenibilidad | Περιβάλλον και βιώσιμες επιλογές | 3 (103–105) | 1 (268) | **4** | 22 | 43 | Políticas ambientales y transición energética. Añadir artículos de fondo sobre el clima en Grecia. |
| **35** | B2 | Trabajo y comunicación profesional | Εργασία και επαγγελματική επικοινωνία | 3 (106–108) | 11 (269–279) | **14** | 30 | 73 | 11 plantillas acumuladas. Reemplazar por actas de reuniones, informes formales y correspondencia corporativa. |
| **36** | B2 | Educación y sociedad | Εκπαίδευση και κοινωνία | 3 (109–111) | 2 (280–281) | **5** | 25 | 39 | Modelos educativos y debate. Reemplazar plantillas por ensayos sobre el sistema escolar y universitario. |
| **37** | B2 | Cultura, arte e identidad | Πολιτισμός, τέχνη και ταυτότητα | 3 (112–114) | 1 (282) | **4** | 22 | 38 | Interpretación de patrimonio y arte contemporáneo. Introducir adjetivos cultos en -ης/-ες. |
| **38** | B2 | Salud, servicios y calidad de vida | Υγεία, υπηρεσίες και ποιότητα ζωής | 3 (115–117) | 2 (283–284) | **5** | 23 | 38 | Sanidad pública y decisiones colectivas. Reemplazar plantillas por informes sociosanitarios oficiales. |
| **39** | B2 | Viajes, patrimonio y turismo | Ταξίδια, κληρονομιά και τουρισμός | 3 (118–120) | 3 (285–287) | **6** | 25 | 37 | Impacto del turismo en las islas y patrimonio protegido. Sustituir plantillas por debates turísticos. |
| **40** | B2 | Sintetizar y defender una postura | Παρουσιάζω, συνθέτω, υποστηρίζω | 4 (121–124) | 13 (288–300) | **17** | 35 | 81 | **Hipertrofia de 13 plantillas.** Crear un verdadero bloque de examen B2 del KEG con síntesis multifuente. |

---

## 7. Plan Operativo de Ejecución y Hoja de Ruta para la Fase 4

Para asegurar una reconstrucción rigurosa y manejable del curso de griego, se divide el trabajo de la **Fase 4** en **8 Bloques Operativos balanceados**. 

Cada bloque aborda medio nivel MCER (5 capítulos) combinando la consolidación y corrección de las lecciones base con la **reescritura integral desde cero de las lecciones plantilla clónicas**:

```
Estructura Operativa de la Fase 4 (8 Bloques de Trabajo)
┌───────────────┬────────────────────────────────────────────────────────┐
│ NIVEL A1      │ Bloque 1: Caps. 01–05 (33 lecciones | 18 plantillas)   │
│               │ Bloque 2: Caps. 06–10 (34 lecciones | 18 plantillas)   │
├───────────────┼────────────────────────────────────────────────────────┤
│ NIVEL A2      │ Bloque 3: Caps. 11–15 (23 lecciones |  8 plantillas)   │
│               │ Bloque 4: Caps. 16–20 (50 lecciones | 34 plantillas)   │
├───────────────┼────────────────────────────────────────────────────────┤
│ NIVEL B1      │ Bloque 5: Caps. 21–25 (30 lecciones | 15 plantillas)   │
│               │ Bloque 6: Caps. 26–30 (47 lecciones | 31 plantillas)   │
├───────────────┼────────────────────────────────────────────────────────┤
│ NIVEL B2      │ Bloque 7: Caps. 31–35 (46 lecciones | 31 plantillas)   │
│               │ Bloque 8: Caps. 36–40 (37 lecciones | 21 plantillas)   │
└───────────────┴────────────────────────────────────────────────────────┘
Total: 300 lecciones (124 base consolidadas + 176 plantillas desmanteladas y reescritas)
```

### 7.1. Detalle de los 8 Bloques de Trabajo

#### Bloque 1: A1 Inicial — Fonética, Identidad y Entorno Inmediato
- **Alcance:** Capítulos 01 al 05 (Lecciones 001–015 base + 18 plantillas [125–142] = **33 lecciones**).
- **Objetivos de reescritura pedagógica:**
  * Desmantelar las 18 plantillas clónicas de sonidos y presentaciones.
  * Dotar a cada lección de diálogos situacionales auténticos (saludos formales con *Γεια σας*, presentaciones en la secretaría de la escuela, formularios de inscripción).
  * Explicar y ejercitar la eufonía de la **-ν final** en el acusativo (*τον/την*).
  * Consolidar el presente activo de verbos regulares en **-ω** (Grupo A) con sujetos explícitos y elididos.
  * Incorporar un mínimo de 8 a 12 palabras visibles con pronunciación fonética por lección.

#### Bloque 2: A1 Consolidación — Vida Diaria, Consumo y Cierre A1
- **Alcance:** Capítulos 06 al 10 (Lecciones 016–031 base + 18 plantillas [143–160] = **34 lecciones**).
- **Objetivos de reescritura pedagógica:**
  * Desmantelar las 18 plantillas de compras, clima y transporte.
  * Introducir los verbos contractos más frecuentes de la 2.ª conjugación (Grupo B1: *μιλάω*, *πεινάω*, *διψάω*).
  * Diseñar situaciones comunicativas reales: pedir comida en una taberna (*παραγγελία*), comprar ropa indicando talla y color, comprar billetes de autobús y metro.
  * Reconstruir la lección de cierre A1 (antigua L031/L160) como una evaluación comunicativa integral con rúbrica cualitativa en lugar de selección mecánica.

#### Bloque 3: A2 Básico — Relaciones Personales, Vivienda y Rutinas
- **Alcance:** Capítulos 11 al 15 (Lecciones 032–046 base + 8 plantillas [161–166, etc.] = **23 lecciones**).
- **Objetivos de reescritura pedagógica:**
  * Corregir los identificadores reciclados (`el001-*`) de las lecciones base 032–046 asignándoles sus IDs globales correctos.
  * Romper el apagón de lectura en A2: crear bloques de lectura (`texto`) auténticos para las lecciones que carecen de ellos (anuncios de alquiler de pisos, normas de convivencia, recetas).
  * Consolidar la flexión del acusativo plural (*τους φίλους, τις πόλεις, τα σπίτια*) y los adjetivos calificativos en *-ος, -η/-α, -ο*.
  * Introducir los verbos modales **πρέπει να** y **μπορώ να** con complementos verbales reales.

#### Bloque 4: A2 Avanzado — El Aoristo Activo y la Autonomía Cotidiana
- **Alcance:** Capítulos 16 al 20 (Lecciones 047–062 base + 34 plantillas [167–202] = **50 lecciones**).
- **Objetivos de reescritura pedagógica:**
  * **Tratamiento intensivo y sistemático del Pasado Aoristo Activo (Αόριστος):**
    * Reglas de formación de raíz: dentales → **-σα**, labiales → **-ψα**, velares → **-ξα**.
    * Práctica rigurosa de los aoristos irregulares indispensables: *είδα, είπα, ήπια, έφαγα, βρήκα, πήγα, ήρθα, πήρα, έμαθα*.
  * Desmantelar el vertedero de 18 plantillas acumuladas en el Capítulo 20; redistribuir contenidos y crear situaciones prácticas de gestiones cotidianas (banco, farmacia, consultas médicas, incidencias de viaje).
  * Corregir los IDs erróneos de las lecciones base 047–062.

#### Bloque 5: B1 Inicial — El Salto Narrativo y la Vida Laboral
- **Alcance:** Capítulos 21 al 25 (Lecciones 063–077 base + 15 plantillas [203–217] = **30 lecciones**).
- **Objetivos de reescritura pedagógica:**
  * Corregir los IDs reciclados en las lecciones base 063–077.
  * Dotar a las lecciones de B1 de textos de lectura continua genuinos (artículos de blogs, anuncios de trabajo elaborados, correspondencia entre amigos contando viajes).
  * Explicar el contraste de tiempos del pasado: **Παρατατικός** (imperfecto durativo/habitual) frente a **Αόριστος** (acción terminada y puntual).
  * Introducir las oraciones temporales complejas con **ενώ**, **καθώς**, **όταν** y **αφού**.

#### Bloque 6: B1 Consolidación — Voz Pasiva, Deponentes y Aspecto Verbal
- **Alcance:** Capítulos 26 al 30 (Lecciones 078–093 base + 31 plantillas [218–248] = **47 lecciones**).
- **Objetivos de reescritura pedagógica:**
  * **Resolver la gran omisión del curso: La Voz Pasiva y Deponente:**
    * Conjugación del presente pasivo en **-ομαι, -εσαι, -εται, -όμαστε, -εστε, -ονται** (*έρχομαι, χρειάζομαι, αισθάνομαι, σκέφτομαι, θυμάμαι*).
    * Conjugación del aoristo pasivo en **-θηκα** (*γεννήθηκα, κοιμήθηκα, κουράστηκα, πληρώθηκα*).
  * Incorporar y ejercitar los **participios pasados en -μένος/-μένη/-μένο**.
  * Formalizar la distinción de aspecto en el subjuntivo: continuo (**να διαβάζω**) vs simple (**να διαβάσω**).
  * Desmantelar las 13 plantillas del Capítulo 30 y transformarlas en narraciones de experiencias ricas y expresivas.

#### Bloque 7: B2 Inicial — Argumentación, Prensa Escrita y Subordinación Formal
- **Alcance:** Capítulos 31 al 35 (Lecciones 094–108 base + 31 plantillas [249–279] = **46 lecciones**).
- **Objetivos de reescritura pedagógica:**
  * Corregir los IDs reciclados en las lecciones base 094–108.
  * Incorporar fragmentos auténticos o adaptados de artículos periodísticos griegos (*Το Βήμα, Η Καθημερινή*).
  * Practicar exhaustivamente la subordinación formal y conectores avanzados: **μολονότι**, **παρόλο που**, **εφόσον**, **υπό την προϋπόθεση ότι**, **σε περίπτωση που**, **προκειμένου να**.
  * Introducir la declinación de adjetivos formales en **-ης, -ης, -ες** (*διεθνής, συνεπής, σαφής*) y nominalizaciones en **-ση/-ξη/-ψη**.

#### Bloque 8: B2 Consolidación — Registro Formal, Síntesis y Examen B2
- **Alcance:** Capítulos 36 al 40 (Lecciones 109–124 base + 21 plantillas [280–300] = **37 lecciones**).
- **Objetivos de reescritura pedagógica:**
  * Introducir adjetivos en **-υς, -ια, -υ** (*βαθύς, βαρύς, πλατύς*) y el gerundio activo en **-οντας/-ώντας**.
  * Practicar géneros discursivos formales: cartas oficiales al ayuntamiento, informes ejecutivos, síntesis de dos opiniones divergentes.
  * Sustituir las 13 plantillas del Capítulo 40 por un **módulo genuino de preparación para el examen oficial B2 del KEG** (comprensión lectora de textos complejos, mediación lingüística, producción escrita guiada con criterios de evaluación objetivos).

---

## 8. Criterios de Aceptación y Validación Técnica Continua

Para garantizar la máxima calidad editorial y lingüística durante la ejecución de la Fase 4, cada lección modificada o creada deberá cumplir estrictamente los siguientes criterios:

1. **Erradicación total de plantillas clónicas:**
   - Queda terminantemente prohibido el uso de diálogos metalingüísticos del tipo *«Μαρία: Ποια λέξη μαθαίνουμε σήμερα;»*. Cada diálogo debe representar una situación comunicativa real con personajes verosímiles y objetivos pragmáticos concretos.
   - Cada lección debe contener una riqueza léxica equilibrada: entre **6 y 15 palabras visibles** en A1–A2, y entre **8 y 18 palabras visibles** en B1–B2, todas con traducción precisa, pronunciación fonética y categoría gramatical.
2. **Solución a la integridad de identificadores:**
   - Todos los ejercicios deben poseer identificadores unívocos globales (`el001-1` a `el300-7`). Los 589 ejercicios con numeración reciclada en A2, B1 y B2 deben ser refactorizados y validados con `compilar.py --ids-globales`.
3. **Restauración de la comprensión lectora:**
   - Todos los capítulos de A2, B1 y B2 deben incluir textos de lectura independientes del diálogo, que representen la tipología textual exigida por el KEG (anuncios, correos, noticias, normativas, artículos de opinión).
4. **Validación ortotipográfica y diacríticos:**
   - Respeto riguroso de la acentuación monotónica griega (**μονοτονικό σύστημα**). Cada palabra polisílaba debe llevar su correspondiente tilde (**τόνος**).
   - Uso normativo de los signos de puntuación griegos (`;` para interrogación, `·` para punto alto).
   - Aplicación estricta de la regla de la **-ν eufónica** en artículos y partículas según la normativa gramatical contemporánea.
5. **Corrección de la escritura abierta:**
   - Los ejercicios de producción escrita en niveles avanzados (B1 y B2) no deben depender de la coincidencia exacta de una única cadena rígida. Deben implementarse mediante consignas claras con varias alternativas válidas (`respuestas: [...]`) o mediante autoevaluación guiada con criterios morfosintácticos explícitos.
