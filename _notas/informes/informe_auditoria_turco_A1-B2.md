# Auditoría Curricular Integral A1–B2: Curso de Turco (`tr`)

**Fecha de emisión:** 16 de octubre de 2026  
**Especialidad:** Lingüística Aplicada, Diseño Curricular MCER / TÖMER / Yunus Emre Enstitüsü y Desarrollo de Contenidos Paglot  
**Ámbito de aplicación:** Curso completo de turco (`_herramientas/cursos/tr/`, `a1_fuentes/`, `a2_fuentes/`, `b1_fuentes/` e `Idiomas/cursos/tr/lessons/001.json` a `295.json`)  
**Documentos y fuentes de referencia inspeccionados:**
- `_herramientas/cursos/tr/capitulos.txt` y fuentes base `a1_fuentes/` (01–10.txt), `a2_fuentes/` (11–20.txt), `b1_fuentes/` (21–30.txt) y fuentes directas `31.txt` a `38.txt`.
- Fuentes de ampliación `39.txt` a `76.txt`.
- `_herramientas/cursos/tr/generar_ampliacion.py` (script generador de lecciones).
- `informe_auditoria_turco_A1-B2.md` previo en raíz del proyecto (auditoría estática del 14 de octubre de 2026).
- `Idiomas/cursos/tr/lessons/capitulos.json` e inventario exhaustivo de los 295 archivos `.json` publicados.
- Marcos de referencia oficiales: *Marco Común Europeo de Referencia para las Lenguas (MCER / Consejo de Europa)* y los estándares de enseñanza del turco para extranjeros de las instituciones de referencia de la República de Turquía:
  * **Ankara Üniversitesi TÖMER** (*Türkçe ve Yabancı Dil Uygulama ve Araştırma Merkezi*): niveles Temel (A1, A2), Orta (B1, B2) e İleri (C1).
  * **Yunus Emre Enstitüsü (YEE)**: conjunto curricular y manuales de referencia *Yedi İklim Türkçe* (A1, A2, B1, B2).
  * **T.C. Millî Eğitim Bakanlığı (MEB)**: *Yabancı Dil Olarak Türkçe Öğretimi Programı*.
- Obras gramaticales y lingüísticas de referencia:
  * Göksel, A. & Kerslake, C. (2005): *Turkish: A Comprehensive Grammar*. Routledge.
  * Ketrez, F. N. (2012): *A Student Grammar of Turkish*. Cambridge University Press.
  * Kornfilt, J. (1997): *Turkish*. Descriptive Grammars, Routledge.
  * Banguoğlu, T. (2000): *Türkçenin Grameri*. Türk Dil Kurumu Yayınları.

---

## 1. Resumen Ejecutivo y Diagnóstico Global

El curso de turco de Paglot consta actualmente de **295 lecciones distribuidas en 38 capítulos**, concebido para cubrir el itinerario completo desde el nivel Acceso (A1) hasta el nivel Avanzado (B2) según el Marco Común Europeo de Referencia (MCER).

Tras una auditoría lingüística forense y un análisis técnico integral de las fuentes de autoría, los algoritmos de generación y los 295 archivos JSON publicados, se dictamina que el curso presenta una **grave fractura metodológica, arquitectónica y pedagógica**, caracterizada por:

1. **Un núcleo base funcional pero limitado (127 lecciones | 43,1% del curso):** Creado originalmente en cuatro bloques (A1: 31, A2: 32, B1: 32, B2: 32). Posee explicaciones gramaticales útiles y situaciones comunicativas reconocibles. No obstante, arrastra un **defecto técnico crítico de compilación con 288 ejercicios duplicados en 824 instancias** (`tr001-1` a `tr032-9`), un pronunciado déficit de comprensión lectora (solo 11 textos de lectura en 127 lecciones) y un descalabro de complejidad en B2, donde los turnos de diálogo son más breves que en B1.
2. **Una ampliación masiva automatizada con plantillas clónicas (168 lecciones | 56,9% del curso):** Realizada para alcanzar el objetivo de 295 lecciones. Mientras que las lecciones 128 a 154 (27 lecciones, Caps. 1–6) contienen contenidos fonéticos y gramaticales manuales, **141 lecciones (83,9% de la ampliación y 47,8% del total del curso, L155 a L295) fueron producidas algorítmicamente mediante `generar_ampliacion.py` bajo un molde invariable y mecánico**:
   - En lugar de explicaciones lingüísticas, el campo de explicación repite el objetivo pedagógico dos veces de forma tautológica (`E {title} :: {objective} :: {objective}`).
   - Diálogos falsos consistentes en 4 oraciones declarativas desconectadas leídas por 4 personajes sin interacción ni réplica comunicativa.
   - Pobreza extrema de vocabulario: apenas **319 palabras visibles en 168 lecciones** (media de 1,9 palabras/lección).
   - Un bucle idéntico de 6 actividades que evalúa de forma tautológica y cíclica las mismas 4 frases.
3. **Desconexión y colisión masiva de identificadores:** Las lecciones base 001–127 reutilizan los identificadores `tr001` a `tr032` cuatro veces entre niveles (A1, A2, B1 y B2). Por su parte, la ampliación se compiló comenzando en `tr033` hasta `tr200`, lo que provoca que la lección 128 tenga el ID `tr033` y la lección 295 tenga el ID `tr200`, rompiendo por completo la correspondencia biunívoca entre número de lección y código de ejercicio.
4. **Fractura severa de la navegación lineal:** Al igual que en otros idiomas de la plataforma, las 168 lecciones de ampliación se compilaron con numeración 128 a 295 pero asignadas a los capítulos 1 al 38. Un estudiante que avance secuencialmente por número de lección (1 → 295) llega a B2 en la lección 127 y, súbitamente, en la lección 128 se encuentra aprendiendo a distinguir las vocales *ı/i* y *o/ö* del Capítulo 1 (A1).
5. **Vacíos curriculares profundos respecto al estándar TÖMER / MCER:**
   - **Ausencia práctica del Aoristo (*Geniş Zaman* en -(e/i)r / -z):** Una de las estructuras más vitales del turco B1, presente en solo 1 lección de las 295.
   - **Omisión de participios de sujeto en -(y)en / -(y)an** y derivación verbal causativa/reflexiva en B1.
   - **Ausencia de nominalizaciones complejas en -dik / -(y)ecek + posesivo** en el tramo de ampliación y tratamiento superficial en la base.
   - **Inexistencia de un módulo estructurado de examen final B2.**

```
Estructura Real del Curso de Turco (tr): 295 Lecciones
┌───────────────────────────────┬────────────────────────────────────────┐
│      Base Auténtica: 127      │        Ampliación Mixta: 168           │
│            (43,1%)            │                (56,9%)                 │
└───────────────────────────────┴────────────────────────────────────────┘
│ Diálogos situacionales reales │ • 27 leccs fonético/manuales (128-154) │
│ Explicaciones contrastivas    │ • 141 leccs plantilla clónica (155-295)│
│ Defecto: 288 IDs reciclados   │ Explicaciones que repiten el objetivo  │
│ Déficit de lectura (11 textos)│ Diálogos de 4 frases inconexas         │
│ Desajuste de longitud en B2   │ Cero riqueza léxica (1,9 pal/lección)  │
```

---

### 1.1. Balance Cuantitativo Global

| Componente | Lecciones | % del Curso | Palabras Visibles | Palabras Ocultas | Diálogos Base | Diálogos Inconexos | Textos Lectura Base | Textos Micro-Plantilla | Ejercicios Totales | IDs Únicos |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Lecciones Base (001–127)** | 127 | 43,1% | 1.250 | 741 | 121 | 0 | 11 | 0 | 1.112 | 288* |
| **Ampliación Manual (128–154)** | 27 | 9,1% | 154 | 128 | 27 | 0 | 0 | 0 | 189 | 189 |
| **Ampliación Algorítmica (155–295)** | 141 | 47,8% | 165 | 1.021 | 0 | 141 | 0 | 76 | 846 | 846 |
| **TOTAL CURSO** | **295** | **100%** | **1.569** | **1.890** | **148** | **141** | **11** | **76** | **2.147** | **1.323** |

*\*Nota de integridad técnica:* Los 1.112 ejercicios de la base comparten tan solo 288 identificadores únicos porque se numeraron repetidamente del `tr001-1` al `tr032-9` en cada nivel.

---

### 1.2. Distribución de Recursos por Nivel MCER / TÖMER

| Nivel MCER / TÖMER | Capítulos | Total Lecc. | Base (Sólidas) | Ampliación Manual | Plantillas Clónicas | % Plantillas | Palabras Visibles | Palabras Ocultas | Promedio Turno Diálogo | Bloques Lectura | Promedio Palabras Lectura |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **A1** *(Temel 1–2)* | Caps. 01–10 | 75 | 31 | 27 | 17 | **22,7%** | 531 | 283 | 3,0 pal. | 9 | 13,6 pal. |
| **A2** *(Temel 3–4)* | Caps. 11–20 | 76 | 32 | 0 | 44 | **57,9%** | 362 | 339 | 4,2 pal. | 14 | 16,4 pal. |
| **B1** *(Orta 1–2)* | Caps. 21–30 | 74 | 32 | 0 | 42 | **56,8%** | 474 | 561 | 5,0 pal. | 21 | 23,7 pal. |
| **B2** *(Orta 3–4 / Yüksek 1)* | Caps. 31–38 | 70 | 32 | 0 | 38 | **54,3%** | 202 | 707 | 4,4 pal. | 45 | 40,2 pal. |
| **TOTAL** | **38 Capítulos** | **295** | **127** | **27** | **141** | **47,8%** | **1.569** | **1.890** | **4,1 pal.** | **89** | **28,2 pal.** |

---

## 2. Auditoría Técnica y Diagnóstico de Vicios de Construcción

### 2.1. Colisión Masiva de Identificadores (288 IDs duplicados en 824 instancias)

La inspección forense de los archivos compilados en `Idiomas/cursos/tr/lessons/` revela un fallo estructural idéntico al observado en griego, alemán y ruso:

- **En A1 (L001 a L031):** Se compilaron ejercicios con prefijos `tr001-*` a `tr031-*`.
- **En A2 (L032 a L063):** Se compilaron desde carpetas independientes sin pasar la numeración global acumulada, volviendo a generar identificadores `tr001-*` a `tr032-*`.
- **En B1 (L064 a L095):** Se repitió el mismo patrón, generando nuevamente `tr001-*` a `tr032-*`.
- **En B2 (L096 a L127):** Se repitió por cuarta vez, generando una vez más `tr001-*` a `tr032-*`.

```
Impacto del Error de Compilación en las Lecciones Base
┌────────────────────────────────────────────────────────────────────────┐
│ Lección 001 (A1): tr001-1, tr001-2, tr001-3, tr001-4, tr001-5...       │
│ Lección 032 (A2): tr001-1, tr001-2, tr001-3, tr001-4, tr001-5... (DUP) │
│ Lección 064 (B1): tr001-1, tr001-2, tr001-3, tr001-4, tr001-5... (DUP) │
│ Lección 096 (B2): tr001-1, tr001-2, tr001-3, tr001-4, tr001-5... (DUP) │
└────────────────────────────────────────────────────────────────────────┘
Resultado: Una misma clave de ejercicio identifica a 4 preguntas radicalmente distintas.
```

**Consecuencias técnicas directas:**
- El sistema de repetición espaciada (SRS) y el registro de progreso del usuario quedan completamente desconfigurados: si el alumno responde el ejercicio `tr001-1` en A1, la base de datos lo marca erróneamente como superado en A2, B1 y B2.
- Las estadísticas de acierto/error quedan mezcladas entre niveles elementales y avanzados.
- En la ampliación (L128 a L295), el compilador comenzó a asignar IDs desde `tr033` hasta `tr200`, creando una desincronización insalvable: la lección 295 contiene ejercicios etiquetados como `tr200-*`.

---

### 2.2. Anatomía Forense de `generar_ampliacion.py` (141 Lecciones Clónicas)

El análisis del script generador `_herramientas/cursos/tr/generar_ampliacion.py` demuestra que las lecciones 155 a 295 no fueron diseñadas mediante planificación didáctica real, sino mediante un script determinista que ensambla fichas a partir de tuplas mínimas:

1. **Explicaciones tautológicas duplicadas:**
   El código en la función `source()` genera la explicación gramatical de forma automática mediante la línea:
   ```python
   lines.append(f"E {es_title} :: {objective} :: {objective}")
   ```
   Esto produce en los 141 archivos JSON bloques de explicación como el de la Lección 258:
   > *«Fundamentar una crítica con evidencias :: Separa descripción, interpretación y valoración al comentar una obra visual. :: Separa descripción, interpretación y valoración al comentar una obra visual.»*
   El estudiante no recibe ninguna regla morfológica, ningún cuadro de sufijos aglutinantes ni ningún análisis sintáctico.

2. **Diálogos falsos de 4 oraciones inconexas:**
   El script genera un diálogo asignando una frase de la lista a cada uno de los 4 personajes configurados (`Anna`, `Ali`, `Ece`, `Mert`):
   ```python
   for i, (tr, es) in enumerate(phrases):
       lines.append(f"{NAMES[(number + i) % len(NAMES)]}: {tr} = {es}")
   ```
   Ejemplo real de la Lección 155 (Capítulo 7, Colores y ropa):
   - *Ali: «Bu gömlek mavi.»* (Esta camisa es azul.)
   - *Ece: «Şu pantolon çok uzun.»* (Ese pantalón es muy largo.)
   - *Mert: «Bu ayakkabı daha rahat.»* (Este zapato es más cómodo.)
   - *Elif: «Ali uzun ve Ece kısa.»* (Ali es alto y Ece baja.)
   No existe hilo narrativo ni contexto comunicativo alguno; son simplemente 4 oraciones aisladas leídas sucesivamente.

3. **La rueda cerrada de 6 ejercicios:**
   Las 6 actividades interrogan de forma cerrada sobre las mismas 4 frases del diálogo:
   - **Q (Test):** Pregunta por la Frase 0 (`«¿Qué comunica 'Bu gömlek mavi.'?»`). Las opciones incorrectas son literalmente las Frases 1 y 2.
   - **R (Traducción):** Pide traducir la Frase 1 (`«Şu pantolon çok uzun.»`). Las opciones incorrectas son las Frases 0 y 3.
   - **H (Huecos):** Toma la Frase 2 (`«Bu ayakkabı daha rahat.»`), corta la última palabra (`rahat`) y genera distractores con las últimas palabras de las otras frases o palabras fijas inyectadas (`değil`, `daha`, `var`, `mi`).
   - **A (Audio):** Reproduce la Frase 3 (`«Ali uzun ve Ece kısa.»`) y pregunta por su significado, usando como opciones las Frases 0 y 2.
   - **O (Ordenar):** Pide desordenar y reordenar la Frase 0.
   - **X (Escribir):** Pide escribir en turco la Frase 2.

```
Circuito Cerrado de la Lección Plantilla (141 Lecciones)
                    ┌─────────────────────────┐
                    │ Frase 0: "Bu gömlek..." │ ──► Q (Test) & O (Ordenar)
                    │ Frase 1: "Şu pantolon.."│ ──► R (Traducción)
                    │ Frase 2: "Bu ayakkabı.."│ ──► H (Huecos) & X (Escribir)
                    │ Frase 3: "Ali uzun ve.."│ ──► A (Audio)
                    └─────────────────────────┘
         Ninguna inferencia exterior, cero léxico complementario,
         cero producción libre guiada.
```

4. **El artificio de los distractores fijos:**
   En la línea 915 de `generar_ampliacion.py`, el script inyecta la lista de rescate:
   ```python
   candidates.extend(["değil", "daha", "var", "mi"])
   ```
   Esto provocó que el comparativo `daha` aparezca en los distractores de **251 de las 295 lecciones del curso**, falseando las estadísticas de cobertura del comparativo y ofreciendo pistas evidentes al estudiante por incompatibilidad sintáctica o semántica.

---

### 2.3. La Fractura de Navegación Curricular

La arquitectura de compilación del curso generó una anomalía severa en el orden de los contenidos:

| ID de Lección | Capítulo Asignado | Título de la Lección | Nivel Teórico | Nivel Práctico del Contenido |
|:---:|:---:|:---|:---:|:---|
| **001 – 003** | Cap. 01 | Primeros pasos: Alfabeto y saludos | A1 | A1 Inicial |
| ... | ... | ... | ... | ... |
| **096 – 127** | Caps. 31–38 | Arte, derechos humanos, crónicas y ensayo | B2 | B2 Base |
| **128** | **Cap. 01** | **Distinguir vocales (gül/göl, kır/kir)** | **A1** | **¡Regresión a A1 Inicial!** |
| **129** | **Cap. 01** | **Sílabas y acento (ki-tap, ar-ka-daş)** | **A1** | **¡Regresión a A1 Inicial!** |
| **130** | **Cap. 01** | **El teclado turco (ç, ğ, ı, ö, ş, ü)** | **A1** | **¡Regresión a A1 Inicial!** |
| ... | ... | ... | ... | ... |
| **292 – 295** | Cap. 38 | Comparar rutas turísticas con tres fuentes | B2 | B2 Plantilla |

**Impacto en la experiencia del alumno:**
- Si el usuario sigue la ruta lineal por lección (1 → 295), al completar la lección 127 (B2) sufre un salto abrupto e incomprensible a la lección 128, donde la app le enseña cómo usar el teclado turco y pronunciar las letras *ç* y *ğ*.
- Si el usuario navega por capítulos en el menú, se encuentra con una estructura fragmentada donde cada capítulo tiene 3 o 4 lecciones base y luego un bloque de lecciones de ampliación que duplican temas con un estilo pedagógico totalmente disonante.

---

## 3. Diagnóstico Curricular Nivel por Nivel (MCER / TÖMER)

---

### 3.1. Nivel A1 (Temel 1 – Temel 2 | Acceso)
**Capítulos 01 al 10 | 75 Lecciones (31 Base + 44 Ampliadas)**

#### Fortalezas pedagógicas identificadas:
- Las 31 lecciones base cubren con corrección los aspectos funcionales indispensables de supervivencia: saludos (`Merhaba`, `Günaydın`), fórmulas de cortesía (`Lütfen`, `Teşekkürler`), datos personales (`Adım...`, `Nerelisin?`) y el orden básico de la oración (S-O-V).
- Las lecciones de ampliación 128 a 135 (Capítulos 1 y 2) aportan una excelente introducción fonética y ortográfica: pares mínimos de vocales (*gül/göl*, *kır/kir*), división silábica y uso del teclado turco.
- Presentación adecuada del presente continuo en `-iyor` en el Capítulo 4 (L010–012 y L140–144), distinguiendo afirmativa, negativa y preguntas.

#### Carencias y desajustes graves:
1. **Armonía vocálica incompleta:**
   - La distinción formal entre **armonía vocálica mayor (cuádruple: *-ı, -i, -u, -ü*)** y **armonía vocálica menor (doble: *-a, -e*)** no se formaliza como un sistema estructural transversal, provocando dudas continuas en la elección de sufijos.
2. **Tratamiento deficiente del caso acusativo definido (`-(y)i / -(y)ı / -(y)u / -(y)ü`):**
   - El acusativo definido (*Belirtme hâli*) es uno de los mayores obstáculos para hispanohablantes. En el curso se confunde frecuentemente con el objeto directo indeterminado en caso absolutivo (*Yalın hâl*). No se explica con suficiente claridad cuándo un sustantivo debe recibir el sufijo acusativo (sustantivos propios, pronombres, sustantivos con demostrativos o posesivos).
3. **Ausencia de consolidación de consonantes amortiguadoras (*kaynaştırma harfleri*):**
   - La alternancia de amortiguadores (`y, s, ş, n` en la regla mnemotécnica *YaŞaSıN*) se presenta de forma dispersa sin una tabla integradora (ej. cuándo usar *-ya* vs *-na* con posesivos de 3.ª persona).
4. **Cero textos de lectura en la base:**
   - En las 31 lecciones base de A1 hay **0 bloques de texto de lectura**. La comprensión escrita se reduce exclusivamente a turnos de diálogo de 3 palabras.

---

### 3.2. Nivel A2 (Temel 3 – Temel 4 | Plataforma)
**Capítulos 11 al 20 | 76 Lecciones (32 Base + 44 Ampliadas)**

#### Fortalezas pedagógicas identificadas:
- Introducción funcional del pasado determinado / testimonial en `-DI` (`-dı, -di, -du, -dü, -tı, -ti, -tu, -tü`) en el Capítulo 17 (L050–052).
- Tratamiento claro del futuro categórico en `-(y)ecek / -(y)acak` en el Capítulo 18 (L053–055).
- Introducción de la modalidad de obligación y necesidad con `lazım`, `gerek` y el sufijo `-malı / -meli`.

#### Carencias y desajustes graves:
1. **Confusión en las construcciones genitivo-posesivas (*İsim Tamlamaları*):**
   - El contraste entre la construcción posesiva definida (*Belirtili isim tamlaması*: *Ahmet'in arabası*) y la construcción compuesta indefinida (*Belirtisiz isim tamlaması*: *Türk kahvesi*, *otobüs durağı*) es fundamental en A2 y está prácticamente ausente o se trata de manera puramente incidental.
2. **Marginación del sufijo temporal simultáneo `-(y)ken`:**
   - Solo aparece de forma explícita en 1 lección del curso (L202), sin ejercitar sus peculiaridades fonéticas (no sigue la armonía vocálica) ni su aplicación tanto a verbos como a adjetivos/sustantivos (*çocukken*, *öğrenciyken*).
3. **Apagón de comprensión lectora en la base:**
   - En 32 lecciones base de A2 hay **un único texto de lectura de 27 palabras**. Las 44 lecciones de ampliación aportan micro-textos de apenas 15 palabras de media, insuficientes para procesar folletos turísticos, menús completos, avisos de transporte o descripciones de apartamentos.
4. **Plantillas clónicas invasivas:**
   - El 57,9% del nivel A2 (44 lecciones) son plantillas automáticas generadas por `generar_ampliacion.py` con explicaciones duplicadas y diálogos sin interacción.

---

### 3.3. Nivel B1 (Orta 1 – Orta 2 | Umbral)
**Capítulos 21 al 30 | 74 Lecciones (32 Base + 42 Ampliadas)**

#### Fortalezas pedagógicas identificadas:
- Diálogos base con mayor extensión natural (media de 6,2 palabras por turno).
- Buena introducción del pasado no testimonial / inferencial en `-miş` (`-mış, -miş, -muş, -müş`) para transmitir información de segunda mano, rumores o sorpresas inmediatas en el Capítulo 29 (L088–090).
- Introducción de oraciones causales con `-dığı için` y `çünkü`.

#### Carencias y desajustes graves:
1. **La gran omisión del turco B1: El Aoristo o Presente Amplio (*Geniş Zaman* en `-(e/i)r / -z`):**
   - Es incomprensible que en un curso B1 de 74 lecciones, el tiempo verbal más característico del turco para expresar rutinas atemporales, leyes de la naturaleza, promesas inmediatas (*Yaparım* = «Lo haré enseguida»), peticiones corteses (*Bakar mısınız?*) y proverbios (*atasözleri*) esté completamente ausente, con **una única mención marginal en la lección 180**.
2. **Ausencia de los participios de sujeto en `-(y)en / -(y)an` (*Ortaçlar / Sıfat-Fiiller*):**
   - La formación de cláusulas relativas en turco es una de las mayores dificultades de la lengua al no existir un pronombre relativo equivalente al «que» español. En B1 es preceptivo dominar el participio activo de sujeto: *Oraya giden tren* («El tren que va allí»), *Türkçe öğrenen öğrenciler* («Los estudiantes que aprenden turco»). Su ausencia deja al alumno incapacitado para formar oraciones complejas.
3. **Omisión de la morfología derivativa verbal (Causativo y Reflexivo/Recíproco):**
   - No se enseña la formación de verbos causativos (*-dir, -t, -ir*: *yapmak → yaptırmak*, *pişmek → pişirmek*) ni recíprocos/reflexivos (*-iş, -in*: *görüşmek*, *yıkanmak*).
4. **Escasez de lectura genuina:**
   - Solo 2 textos de lectura en toda la base de B1. Las lecciones de ampliación proporcionan textos breves de 23 palabras que no permiten trabajar noticias de prensa, reseñas ni correspondencia formal.

---

### 3.4. Nivel B2 (Orta 3 – Orta 4 / Yüksek 1 | Avanzado)
**Capítulos 31 al 38 | 70 Lecciones (32 Base + 38 Ampliadas)**

#### Fortalezas pedagógicas identificadas:
- Temáticas sofisticadas acordes al MCER y al programa del MEB: crítica de arte, historias de vida, cambio climático, derechos humanos, medios de comunicación y crónicas de viajes.
- Introducción preliminar de nominalizaciones con `-dık / -dik` y `-(y)ecek` en las lecciones 096 y 097.

#### Carencias y desajustes graves:
1. **Descalabro de la progresión de dificultad:**
   - La longitud media de los turnos de diálogo en B2 Base cae a **4,6 palabras por turno** (y 4,2 en la ampliación), siendo inferior a la de B1 Base (6,2 palabras). Los personajes en B2 hablan mediante frases cortas y simples en presente o pasado simple, sin la subordinación ni la articulación discursiva exigidas en este nivel.
2. **Deficiencia en la enseñanza de las subordinadas sustantivas y completivas con `-dik` y `-(y)ecek` + Posesivo + Caso:**
   - Esta estructura representa la espina dorsal del nivel B2 en turco según los programas de Ankara TÖMER y Yunus Emre:
     * Completivas de objeto: *Geleceğini söyledi* («Dijo que vendría»), *Bunu yaptığını biliyorum* («Sé que hiciste esto»).
     * Cláusulas relativas con sujeto no idéntico: *Okuduğum kitap* («El libro que leí»), *Gittiğimiz yer* («El lugar al que fuimos»).
     En el curso actual, tras mencionarse brevemente en las lecciones 096–098, desaparecen de la práctica sistemática y no vuelven a ejercitarse en las 38 lecciones de ampliación.
3. **Ausencia casi total de la Voz Pasiva (*Edilgen Çatı* en `-(i)l / -(i)n`):**
   - Solo aparece registrada en 5 lecciones de forma anecdótica, sin tablas de conjugación ni ejercicios dedicados a transformar oraciones activas a pasivas en contextos formales o periodísticos (*Toplantı iptal edildi*, *Yeni kararlar açıklandı*).
4. **Carencia de gerundios temporales y modales avanzados (*Zarf-Fiiller*):**
   - Estructuras indispensables como `-(y)ince` (al momento de...), `-dikten sonra` (después de...), `-meden önce` (antes de...), `-dıkça` (a medida que...), `-(y)erek` (haciendo...) no tienen lecciones estructuradas.
5. **Inexistencia de un módulo integrador de examen final B2:**
   - El curso concluye en el Capítulo 38 con ejercicios plantilla idénticos a los de capítulos anteriores, sin una prueba integral de nivel que evalúe comprensión lectora de textos largos, análisis crítico, mediación conceptual y redacción formal.

---

## 4. Comparativa Estructural: Base vs. Ampliación

```
Comparativa de Vocabulario y Textos por Nivel
Palabras Visibles por Nivel:
A1   [██████████████████████████ 471 Base ] [███ 60 Ampl. ]
A2   [███████████████ 275 Base           ] [████ 87 Ampl. ]
B1   [█████████████████████ 378 Base     ] [█████ 96 Ampl.]
B2   [███████ 126 Base                   ] [████ 76 Ampl. ]

Textos de Lectura (Recuento de Bloques):
A1   [ 0 Base ] [█████████ 9 Ampliación ]
A2   [█ 1 Base] [█████████████ 13 Ampl. ]
B1   [██ 2 Base] [███████████████████ 19 Ampl.]
B2   [████████ 8 Base] [█████████████████████████████████████ 37 Ampl.]
```

### 4.1. Análisis Crítico del Contraste
1. **La paradoja del vocabulario:** Mientras que las lecciones base incorporaron un promedio de 9,8 palabras visibles por lección con explicaciones pedagógicas completas, la ampliación cayó en una escasez casi total: 1,9 palabras por lección. En la ampliación, los sustantivos y verbos se esconden como oraciones completas en el campo `"oculta": true`, impidiendo al alumno estudiar fichas de léxico aisladas.
2. **La paradoja de los textos:** La base prácticamente no contiene lecturas (solo 11 en 127 lecciones). La ampliación intentó subsanarlo introduciendo bloques de lectura en B1 y B2, pero lo hizo mediante micro-textos sintéticos de 3 a 10 oraciones simples descohesionadas, sin vocabulario ensayístico ni complejidad estilística.

---

## 5. Matriz de Cobertura Curricular MCER / TÖMER

| Estructura Lingüística Esencial | Nivel Oficial | Presencia en Curso | Diagnóstico Lingüístico Forense |
|:---|:---:|:---:|:---|
| **Alfabeto, pares mínimos y armonía vocálica** | A1 | Sólida | Bien cubierto en base y en L128–135. Requiere reforzar la tabla unificada de armonía cuádruple. |
| **Sufijos de caso: Locativo (-de), Dativo (-e), Ablativo (-den)** | A1 | Aceptable | Frecuentes en oraciones modelo; falta sistematizar la mutación consonántica (*p, ç, t, k → b, c, d, ğ*). |
| **Acusativo definido (`-(y)i / -(y)ı / -(y)u / -(y)ü`)** | A1–A2 | **Deficiente** | Apenas formalizado. Los ejercicios no obligan a contrastar acusativo definido vs indefinido. |
| **Existencia y posesión básica (`var / yok`, `değil`)** | A1 | Sólida | Presente en 43 lecciones. Muy consolidado en contextos cotidianos. |
| **Presente continuo (`-iyor`)** | A1 | Sólida | Bien estructurado en afirmación, negación y pregunta con estrechamiento vocálico (*başlıyor, bekliyor*). |
| **Sufijos posesivos e *İsim Tamlamaları*** | A2 | **Deficiente** | Posesivos simples presentes, pero la distinción entre compuestos definidos e indefinidos está confusa. |
| **Pasado definido / testimonial (`-DI`)** | A2 | Aceptable | Bien introducido en Cap. 17, pero con poca práctica de narración continua. |
| **Futuro categórico (`-(y)ecek / -(y)acak`)** | A2 | Aceptable | Cubierto en Cap. 18; requiere más práctica de planes, intenciones y predicciones. |
| **Modalidad de obligación (`-malı`, `gerek`, `lazım`, `zorunda`)** | A2 | Aceptable | Presente en 29 lecciones, aunque diluido por falta de contextos de contraste formal. |
| **Sufijo simultáneo `-(y)ken`** | A2 | **Crítica** | **Solo 1 lección (L202)**. Requiere un tratamiento didáctico integral. |
| **Pasado no testimonial / inferencial (`-miş`)** | B1 | Aceptable | Bien enfocado temáticamente en el Cap. 29, pero escaso en la ampliación. |
| **Aoristo / Presente Amplio (`-(e/i)r / -z` - *Geniş Zaman*)** | B1 | **GRAVE OMISIÓN** | **Solo 1 lección (L180)**. Es el vacío pedagógico más grave del nivel B1. |
| **Participio de sujeto activo (`-(y)en / -(y)an`)** | B1 | **GRAVE OMISIÓN** | **0 lecciones dedicadas**. Ausencia de relativas de sujeto (*Gelen adam, çalışan kadın*). |
| **Morfología derivativa verbal (Causativo y Reflexivo)** | B1 | **GRAVE OMISIÓN** | **0 lecciones dedicadas**. Los sufijos *-dir/-t* y *-in/-iş* no se enseñan de forma sistemática. |
| **Oraciones condicionales (`-se / -sa` - *Şart Kipi*)** | B1 | Parcial | Aparece en 13 lecciones dispersas, pero falta sistematizar hipótesis reales vs irreales. |
| **Nominalizaciones en `-DIK` y `-(y)ecek` + Posesivo** | B2 | **Deficiente** | Presente solo en 6 lecciones de B2 Base; nulo en las 38 lecciones de B2 Ampliación. |
| **Voz Pasiva (`-(i)l / -(i)n` - *Edilgen Çatı*)** | B2 | **Crítica** | Solo 5 lecciones con menciones accidentales; falta práctica sistemática. |
| **Subordinadas temporales y gerundios (`-(y)ince, -dıkça, -dikten sonra`)** | B2 | **Deficiente** | Muy escaso. Solo una mención aislada en L087. |
| **Conectores discursivos avanzados (`rağmen, oysa, halbuki, meğerse`)** | B2 | Aceptable | Aparecen en 13 lecciones base, pero sin explotación argumentativa en textos extensos. |
| **Textos periodísticos, ensayos y examen B2** | B2 | **GRAVE OMISIÓN** | Lecturas de 40 palabras; ausencia de examen final o proyecto integrador B2. |

---

## 6. Plan de Acción y División en 8 Bloques para la Fase 4

Para transformar el curso de turco en un itinerario riguroso, robusto y alineado con los estándares del MCER, TÖMER y Yunus Emre Enstitüsü, la reescritura curricular de la Fase 4 debe articularse en **8 bloques homogéneos de trabajo**.

```
Arquitectura de Ejecución en 8 Bloques (Fase 4)
┌────────────────────────────────────────────────────────────────────────┐
│  B1: A1 Inicial (Caps 01–05 | 38 leccs) -> Fonética, Casos y Presente │
│  B2: A1 Consolidación (Caps 06–10 | 37 leccs) -> Rutinas y Cierre A1   │
│  B3: A2 Inicial (Caps 11–15 | 38 leccs) -> Posesión, Entorno y Rutina  │
│  B4: A2 Consolidación (Caps 16–20 | 38 leccs) -> Pasado, Futuro y -(y)ken│
│  B5: B1 Inicial (Caps 21–25 | 37 leccs) -> Aoristo, Pasado -miş, Causa │
│  B6: B1 Consolidación (Caps 26–30 | 37 leccs) -> Participios y Causativo│
│  B7: B2 Inicial (Caps 31–34 | 36 leccs) -> Nominalizaciones y Pasiva   │
│  B8: B2 Consolidación (Caps 35–38 | 34 leccs) -> Discurso y Examen B2 │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 6.1. Detalle Operativo de los Bloques

#### Bloque 1: A1 Inicial — Fonética, Armonía Vocálica, Identidad y Presente Continuo
- **Alcance:** Capítulos 01 al 05 (Lecciones 001–015 base + Lecciones 128–149 ampliadas = **38 lecciones**).
- **Prioridades lingüísticas y estructurales:**
  * Consolidar las lecciones fonéticas de apertura (pares mínimos *gül/göl*, amortiguadores *y, s, ş, n*).
  * Formalizar la tabla de la **armonía vocálica cuádruple (*Dörtlü Ünlü Uyumu*)** y **doble (*İkili Ünlü Uyumu*)**.
  * Desmantelar las 17 plantillas clónicas de los capítulos 3 al 5: dotarlas de explicaciones gramaticales genuinas y diálogos interactivos naturales.
  * Enseñar con rigor el sufijo de caso locativo (`-de/-da/-te/-ta`), ablativo (`-den/-dan/-ten/-tan`) y dativo (`-(y)e/-(y)a`).
  * Estructurar el presente continuo (`-iyor`) en todas sus variantes con mutaciones vocálicas de raíz verbal (*başlamak → başlıyor*, *yemek → yiyor*).
  * Corregir la colisión de identificadores en las lecciones base 001–015.

#### Bloque 2: A1 Consolidación — Movilidad Urbana, Compras, Salud y Evaluación A1
- **Alcance:** Capítulos 06 al 10 (Lecciones 016–031 base + Lecciones 150–171 ampliadas = **37 lecciones**).
- **Prioridades lingüísticas y estructurales:**
  * Desmantelar las 22 plantillas clónicas de los capítulos 7 al 10.
  * Introducir sistemáticamente el **caso acusativo definido (`-(y)i/-(y)ı/-(y)u/-(y)ü`)** contrastándolo con el objeto indeterminado (*Kitap okuyorum* vs *Kitabı okuyorum*).
  * Practicar situaciones comunicativas de interacción real: pedir direcciones en Estambul, comprar en un mercado regateando cantidades y precios, pedir medicamentos en la farmacia describiendo dolencias.
  * Consolidar el pasado básico testimonial (`-DI`) para relatar sucesos del día anterior.
  * Transformar la lección 171 en una **evaluación integradora de nivel A1** según los descriptores TÖMER Temel 1–2.

#### Bloque 3: A2 Inicial — Posesión, Vivienda, Rutinas y Modalidad
- **Alcance:** Capítulos 11 al 15 (Lecciones 032–046 base + Lecciones 172–193 ampliadas = **38 lecciones**).
- **Prioridades lingüísticas y estructurales:**
  * Corregir los identificadores reciclados (`tr001-*` a `tr015-*`) en las lecciones base 032 a 046.
  * Desmantelar las 22 plantillas mecánicas de los capítulos 11 al 15.
  * Desarrollar de forma sistemática las **construcciones posesivas (*İsim Tamlamaları*)**:
    - *Belirtili tamlama*: *Evin kapısı, Ayşe'nin kardeşi*.
    - *Belirtisiz tamlama*: *Yatak odası, Türkçe öğretmeni*.
  * Introducir textos de lectura auténticos en A2 (anuncios de alquiler, planos de apartamentos, mensajes de WhatsApp entre amigos).
  * Estructurar los verbos modales de necesidad y consejo: `-malı/-meli`, `zorunda olmak`, `gerek / lazım`.

#### Bloque 4: A2 Consolidación — Pasado -DI, Futuro, Temporal -(y)ken y Cierre A2
- **Alcance:** Capítulos 16 al 20 (Lecciones 047–063 base + Lecciones 194–215 ampliadas = **38 lecciones**).
- **Prioridades lingüísticas y estructurales:**
  * Corregir los identificadores reciclados (`tr016-*` a `tr032-*`) en las lecciones base 047 a 063.
  * Desmantelar las 22 plantillas automáticas de los capítulos 16 al 20.
  * Consolidar la narración en pasado testimonial (`-DI`) combinada con marcadores temporales (*dün, geçen yıl, iki gün önce*).
  * Trabajar el futuro categórico en `-(y)ecek / -(y)acak` con las alternancias consonánticas de 1.ª persona (*gideceğim, yapacağım*).
  * Dedicar lecciones específicas al sufijo temporal simultáneo **`-(y)ken`** con sustantivos, adjetivos y verbos.
  * Diseñar una **evaluación integrada A2** en el Capítulo 20 con autoevaluación guiada.

#### Bloque 5: B1 Inicial — El Salto Narrativo: Aoristo (*Geniş Zaman*), Pasado -miş y Causa
- **Alcance:** Capítulos 21 al 25 (Lecciones 064–078 base + Lecciones 216–237 ampliadas = **37 lecciones**).
- **Prioridades lingüísticas y estructurales:**
  * Corregir los identificadores duplicados en las lecciones base 064 a 078.
  * Desmantelar las 22 plantillas mecánicas de los capítulos 21 al 25.
  * **Incorporar y desarrollar exhaustivamente el Aoristo (*Geniş Zaman*):**
    - Formación regular e irregular (los 13 verbos irregulares de raíz monosilábica: *alır, verir, gelir, bilir...*).
    - Usos pragmáticos: peticiones de cortesía (*Bakar mısınız?*), ofrecimientos (*Yardım edeyim mi?*) y promesas inmediatas.
  * Consolidar el pasado no testimonial / inferencial (`-miş`) distinguiendo hecho presenciado vs información de segunda mano o deducción.
  * Trabajar conectores de causa y consecuencia: `-dığı için`, `-dığından dolayı`, `bu yüzden`, `bu nedenle`.

#### Bloque 6: B1 Consolidación — Participios -(y)en, Causativos, Condicional y Cierre B1
- **Alcance:** Capítulos 26 al 30 (Lecciones 079–095 base + Lecciones 238–257 ampliadas = **37 lecciones**).
- **Prioridades lingüísticas y estructurales:**
  * Corregir los identificadores duplicados en las lecciones base 079 a 095.
  * Desmantelar las 20 plantillas de los capítulos 26 al 30.
  * **Tratamiento intensivo de los participios adjetivales de sujeto (`-(y)en / -(y)an`):**
    - Construcción de relativas activas: *Toplantıya katılan üyeler*, *Sorunu çözen mühendis*.
  * **Morfología derivativa verbal:**
    - Sufijos causativos: `-dir/-dır/-tir`, `-t`, `-ir`.
    - Sufijos reflexivos y recíprocos: `-in`, `-iş`.
  * Condicional real e hipotético simple con `-se / -sa`.
  * Dotar a cada capítulo de lecturas extensas de 100–150 palabras (noticias breves, biografías, crónicas históricas) y una **prueba integradora B1**.

#### Bloque 7: B2 Inicial — Nominalizaciones en -DIK/-(y)ecek, Voz Pasiva y Crítica Cultural
- **Alcance:** Capítulos 31 al 34 (Lecciones 096–111 base + Lecciones 258–277 ampliadas = **36 lecciones**).
- **Prioridades lingüísticas y estructurales:**
  * Corregir los identificadores duplicados en las lecciones base 096 a 111.
  * Desmantelar las 20 plantillas algorítmicas de los capítulos 31 al 34.
  * **Dominio sistemático de las cláusulas completivas y relativas en `-DIK` y `-(y)ecek` + Posesivo:**
    - Cláusulas de relativo con agente: *Okuduğum roman*, *Önerdiğiniz çözüm*.
    - Oraciones sustantivas subordinadas con caso: *Geleceğini biliyorum* (acusativo), *Katıldığına sevindim* (dativo), *Gittiğinden haberdarım* (ablativo).
  * **Voz Pasiva (*Edilgen Çatı*):** Formación con `-il / -in` (*yapıldı, yazıldı, temizlendi*) en discursos formales y periodísticos.
  * Textos de lectura B2 auténticos de 200–300 palabras sobre arte, arquitectura y problemas climáticos.

#### Bloque 8: B2 Consolidación — Gerundios Avanzados, Discurso Formal, Medios y Examen B2
- **Alcance:** Capítulos 35 al 38 (Lecciones 112–127 base + Lecciones 278–295 ampliadas = **34 lecciones**).
- **Prioridades lingüísticas y estructurales:**
  * Corregir los identificadores duplicados en las lecciones base 112 a 127.
  * Desmantelar las 18 plantillas mecánicas de los capítulos 35 al 38.
  * **Sistematización de gerundios temporales y modales (*Zarf-Fiiller*):**
    - `-(y)ince` (en cuanto...), `-dikten sonra` (después de haber...), `-meden önce` (antes de...), `-dıkça` (a medida que...), `-(y)erek` (mediante/haciendo).
  * Conectores de contraste formal y concesión: *buna rağmen, oysa, halbuki, ne var ki, meğerse*.
  * Estilo indirecto formal (*aktarma sözler* con *ifade etti, belirtti, savundu*).
  * **Examen Final Integral de Nivel B2 (TÖMER / Yunus Emre):** Comprensión de textos complejos, resolución de ambigüedades, identificación de tono e ironía, y redacción de un ensayo argumentativo estructurado.

---

## 7. Criterios de Aceptación y Validación Técnica para la Fase 4

Para asegurar que la implementación de los 8 bloques cumpla los estándares de calidad lingüística y estabilidad técnica, cada lección modificada o creada deberá superar obligatoriamente los siguientes controles:

1. **Erradicación de plantillas tautológicas:**
   - Queda estrictamente prohibido duplicar el texto del objetivo pedagógico en el bloque de explicación (`E {title} :: {objective} :: {objective}`). Cada explicación debe aportar reglas claras, tablas morfológicas y ejemplos contrastivos en turco y español.
   - Prohibidos los diálogos de oraciones sueltas sin interacción. Los diálogos deben tener entre 4 y 8 turnos de conversación auténtica y verosímil entre hablantes turcos.
2. **Corrección total de identificadores de ejercicio:**
   - Todos los identificadores deben ser únicos y seguir el estándar global `tr{leccion:03d}-{ejercicio}` (desde `tr001-1` hasta `tr295-8`). Ningún ID de ejercicio podrá repetirse entre lecciones distintas.
3. **Riqueza léxica equilibrada:**
   - Cada lección debe contener entre **8 y 15 palabras visibles** en A1–A2, y entre **10 y 18 palabras visibles** en B1–B2, todas provistas de traducción rigurosa, indicación de acento fonético o guía de pronunciación y notas de uso en caso de sufijos especiales.
4. **Respeto a las normas ortográficas del Türk Dil Kurumu (TDK):**
   - Uso preceptivo de las 29 letras normativas: `ç, ğ, ı, İ, ö, ş, ü`.
   - Distinción rigurosa de mayúsculas y minúsculas con punto: **i → İ** y **ı → I** (prohibido escribir *istanbul* con *i* minúscula o *İstanbul* con *I* sin punto).
   - Uso normativo del apóstrofo (*kesme işareti*) tras nombres propios antes de sufijos de caso (*Ahmet'e, Ankara'da, Türkiye'nin*), y su omisión en sufijos de plural o derivativos (*Ahmetler, Türkçenin*).
   - Aplicación estricta de la mutación consonántica en sufijos (*k → ğ*, *t → d*, etc.).
5. **Validación de la escritura abierta y comprensión lectora:**
   - Los ejercicios de escritura (`escribir` / `X`) deben admitir variantes ortográficas legítimas mediante matrices de respuestas (`respuestas: [...]`), evitando fallos por diferencias de puntuación o apóstrofos opcionales en expresiones compuestas.
   - Todos los capítulos de B1 y B2 deben contener al menos un texto de lectura continuo de entre 100 y 300 palabras con actividades de inferencia y comprensión global.
