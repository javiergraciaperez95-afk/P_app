# Progreso de revisión del curso de polaco

**Actualizado:** 19 de octubre de 2026

## Estado

- [x] Inspección recursiva de todos los archivos de `cursos/pl`; inventario real de `lessons/` y recursos.
- [x] Lectura automatizada de las 229 lecciones completas y perfil de bloques, IDs, capítulos y marcadores de corrupción.
- [x] Lectura del índice, diccionario, capítulos, frases, juegos y tutora del curso.
- [x] Lectura del cargador/validador de bloques en `js/lessons.js` y revisión de utilidades de capítulos y ejercicios. No se ejecutaron generadores.
- [x] Auditoría curricular guardada en `plantillas/AUDITORIA_CURRICULAR.md`.
- [x] Terminar plan 299 por lección y fijar los rangos de capítulos antes de editar contenido.
- [ ] Revisar las lecciones restantes una por una, conservando IDs y anotando mejoras y nota. Revisadas en profundidad 001–020; 021–229 y el cotejo de nueva autoría siguen pendientes.
- [x] Crear las 70 lecciones faltantes (230–299) con contenido contextual y tareas por tema.
- [x] Sincronizar `capitulos.json`, `capitulo` de las lecciones, índice y diccionario.
- [x] Validación estructural global: secuencia, JSON, tipos de bloque, IDs, referencias de vocabulario e índice.
- [x] Preparar `INFORME_CALIDAD_FINAL.md` con hallazgos y límites de revisión.
- [ ] Cotejo lingüístico individual por persona competente en polaco; no se presenta como completado.

## Conteos verificados al inicio

- 229/299 lecciones; presentes 001–229, faltantes 230–299.
- 234 JSON en el curso, todos parseables; 25 capítulos actuales.
- 2.818 bloques en lecciones; 1.904 ejercicios con ID fijo, sin IDs duplicados y sin bloques de ejercicio sin ID.
- Antes de editar: 24 lecciones mostraban patrones de corrupción textual; 158 marcadores `Cap. N` y 32 caracteres problemáticos `ņ`/`�`. Tras el lote inicial: esos marcadores y caracteres ya no aparecen en las lecciones.

**Estado actual:** 299/299 lecciones presentes; 70 nuevas (230–299); 31 capítulos en los rangos planificados; índice y diccionario sincronizados. La revisión lingüística integral, incluida la naturalidad del polaco y la equivalencia completa de las traducciones, sigue pendiente de cotejo humano.

## Lote editorial 1 — terminado

- Se conservaron los archivos y se repararon traducciones inglesas concretas en 001, 002 y 004.
- Se corrigieron las 32 cadenas observadas con `ņ`/`�` en 22 archivos y se retiraron los 158 rótulos editoriales `Cap. N` de los cuatro repasos (070, 143, 198 y 229).
- Se corrigieron 131 usos ingleses de *genius*, *prayer/Prayer* e *infinite* cuando eran traducciones de términos gramaticales (*genitive*, *sentence*, *infinitive*), distribuidos en 69 lecciones.
- Los IDs de bloques no se cambiaron. La validación sintáctica y de referencias se repetirá al cerrar la producción; aún no se considera revisada por completo ninguna lección salvo los pasajes concretos anotados.
- El plan fija 31 capítulos consecutivos: A1 001–070 (70), A2 071–146 (76), B1 147–222 (76), B2 223–299 (77). Falta sincronizar `capitulo`, `capitulos.json` e índice cuando se complete la secuencia y se confirme cada lote.

**Corte histórico tras el lote editorial inicial:** auditoría, plan 299 completo y reparaciones textuales puntuales. En ese momento aún no se habían creado lecciones nuevas; la revisión lingüística integral continúa pendiente.

## Registro de lotes (conteos históricos de cada corte)

## Producción — lote B2 230–234

- Nuevas: 230–234 (5 de 70). Cada una contiene explicación bilingüe, vocabulario propio, texto polaco con traducción ES/EN y cuatro tareas con ID único y respuesta/corrección explícita.
- Temas: inferencia contextual; hechos, opiniones e interpretación; cautela al formular hipótesis; tesis y evidencia; lectura de datos porcentuales.
- Validación del lote: JSON parseable, tipos de bloque permitidos, un ID por ejercicio, una respuesta correcta en cada ejercicio cerrado y capítulos 24/25 acordes con el plan.
- Revisión humana: las formas polacas nuevas son de autoría propia, pero aún necesitan cotejo de una persona competente. No se ha actualizado el índice porque se integrarán las 299 referencias de manera coherente al terminar la secuencia.

**Conteo actual:** 234 lecciones presentes (001–234); 65 faltan (235–299). No se marcará el curso como terminado hasta cerrar revisión, producción, capítulos/índice y validación final.

## Producción — lote B2 235–239

- Nuevas acumuladas: 230–239 (10 de 70). Este lote añade inferencia causal, síntesis de hallazgos, evaluación de fuentes, encuadre de titulares y voz pasiva en procesos.
- Se crearon ejercicios diferenciados de lectura, traducción contextual, selección, completación y producción escrita con modelos y criterios. Los textos se entregan en polaco y con traducciones al español e inglés.
- Comprobación de 230–239: 10 JSON parseables; 71 bloques permitidos; 40 ejercicios con IDs únicos y una sola correcta en los cerrados; vocabularios enlazados; capítulos 24/25 concordantes con el plan.
- Pendiente: revisión completa de 001–229, producir 240–299, sincronizar el índice y los capítulos, revisar el diccionario si el cargador lo requiere y ejecutar validación integral.

**Conteo actual:** 239 lecciones presentes (001–239); 60 faltan (240–299). El trabajo sigue incompleto.

## Producción — lote B2 240–244

- Nuevas acumuladas: 230–244 (15 de 70). Se añadieron instrucciones impersonales, participios, subordinación, condicionales y concesión.
- Cada unidad ofrece texto contextual en polaco con traducciones ES/EN, vocabulario, explicación y cuatro ejercicios con respuesta/modelo. Los bloques usan formatos existentes en la aplicación.
- Comprobación de 240–244: 5 JSON parseables; capítulos 25/26 correctos; 20 IDs de ejercicio únicos; bloques válidos, vocabulario enlazado y una correcta por ejercicio cerrado.

**Conteo actual:** 244 lecciones presentes (001–244); 55 faltan (245–299). El curso sigue incompleto.

## Producción — lote B2 245–249

- Nuevas acumuladas: 230–249 (20 de 70). Temas añadidos: aspecto y resultado, gobierno verbal, prefijos, registro formal e informal, y colocaciones.
- Las lecciones usan explicaciones, vocabularios, textos y tareas de formatos que admite la app. Los modelos de producción están en polaco y llevan criterios en ES/EN.
- Validación acumulada 230–249: 20 JSON parseables, 141 bloques permitidos, 80 IDs únicos, una respuesta correcta por ejercicio cerrado, palabras de vocabulario enlazadas y capítulos 24–26 conformes al plan.

**Conteo actual:** 249 lecciones presentes (001–249); 50 faltan (250–299). No se han sincronizado aún capítulos, índice ni diccionario global.

## Cierre estructural y de metadatos — 19 de octubre de 2026

- La secuencia numérica contiene exactamente 001–299; las cuatro bandas son A1 70, A2 76, B1 76 y B2 77. `lessons/capitulos.json` contiene 31 capítulos y cada valor `capitulo` concuerda con el plan.
- El índice contiene 299 referencias ordenadas; sus IDs de ejercicios coinciden con los IDs presentes en bloques. Se conservaron los IDs preexistentes.
- El diccionario cubre las palabras de todas las lecciones: 4.839 entradas y cero referencias léxicas ausentes.
- Las 299 lecciones son JSON parseable; 3.309 bloques usan tipos admitidos; 2.184 IDs de bloque son únicos. Los ejercicios cerrados validados tienen una respuesta correcta y las referencias de vocabulario de los bloques resuelven.
- Las 70 nuevas incluyen lectura original en polaco con traducciones ES/EN, vocabulario y tareas. En 252–299, la tarea de huecos recupera una palabra de la segunda frase del texto.
- Esta validación es automatizada y estructural. No certifica la naturalidad de cada oración polaca ni la calidad de cada distractor; el cotejo lingüístico completo sigue pendiente.


## Segunda pasada editorial — lote 001–010

Se revisó cada archivo individualmente: polaco de ejemplos, sentido de traducciones, explicaciones, glosarios, respuestas y coherencia de bloques. Se corrigieron traducciones inglesas manifiestamente defectuosas, entre ellas falsos sentidos de *mieszkać*, *jeść*, *pić*, *piętro*, *mieszkanie* y *rachunek*; se aclararon las etiquetas del locativo e instrumental y se sincronizó el diccionario con los glosarios revisados. Se conservaron los IDs.

**Rúbrica de nota (0–10):** corrección lingüística y adecuación de ejemplos (4); claridad y progresión pedagógica (2); traducción/localización (2); calidad y coherencia de ejercicios y JSON (2).

| Lección | Nota provisional |
|---:|---:|
| 001 | 7,8 |
| 002 | 7,8 |
| 003 | 7,8 |
| 004 | 7,8 |
| 005 | 8,1 |
| 006 | 8,0 |
| 007 | 8,0 |
| 008 | 7,9 |
| 009 | 7,9 |
| 010 | 7,8 |
| **Media del lote** | **7.89** |

La media corresponde solo al primer lote y no sustituye la nota global. La meta de trabajo sigue siendo una media de al menos 7,5 tras revisar la secuencia completa.

## Segunda pasada editorial — lote 011–020

Se revisaron individualmente 011–020. Se corrigieron localizaciones y falsos sentidos en horas y días, verbos reflexivos, comida y negación, acusativo, demostrativos, precios, pagos, direcciones y transporte; se actualizaron las entradas de diccionario correspondientes. Se conservaron los IDs y se revalidaron respuestas cerradas, referencias y enlaces del índice.

| Lección | Nota |
|---:|---:|
| 011 | 7,8 |
| 012 | 7,6 |
| 013 | 8,0 |
| 014 | 7,8 |
| 015 | 8,1 |
| 016 | 7,7 |
| 017 | 7,8 |
| 018 | 7,8 |
| 019 | 8,0 |
| 020 | 7,7 |
| **Media del lote** | **7,83** |
| **Media acumulada 001–020** | **7.86** |

La valoración sigue siendo provisional hasta revisar toda la secuencia.


## Segunda pasada editorial — lote 021–025

Se revisaron las cinco lecciones, incluidos glosarios, explicaciones, ejemplos, análisis palabra por palabra, consignas y distractores en español e inglés. Se corrigieron falsos sentidos y errores de traducción en horarios y transporte (021), aficiones y acusativo (022), expresiones meteorológicas (023), formas instrumentales de las estaciones (024) y profesiones e instrumental tras **jestem** (025). Se repararon además cadenas polacas dañadas en glosas y opciones. El diccionario se sincronizó con los glosarios; se conservaron IDs y estructura.

| Lección | Nota provisional |
|---:|---:|
| 021 | 7,7 |
| 022 | 7,6 |
| 023 | 7,7 |
| 024 | 7,8 |
| 025 | 7,8 |
| **Media del lote** | **7.72** |
| **Media acumulada 001–025** | **7.83** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 026–030

Se revisaron explicaciones, léxico, diálogos, traducciones, distractores y consignas. Se aclaró la distinción entre **student** (estudiante universitario) y **uczeń** (alumno escolar), se corrigieron glosas de síntomas y formas de pasado con género gramatical y se normalizó el futuro de **być** + infinitivo. Se ajustaron las traducciones inglesas al sujeto de cada frase y se sincronizó el diccionario donde había entradas coincidentes. Se conservaron los IDs.

| Lección | Nota provisional |
|---:|---:|
| 026 | 7,8 |
| 027 | 7,6 |
| 028 | 7,8 |
| 029 | 7,7 |
| 030 | 7,7 |
| **Media del lote** | **7.72** |
| **Media acumulada 001–030** | **7.81** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 031–035

Se revisaron explicaciones, glosario, transcripciones, ejemplos y ejercicios de pronunciación. Se corrigieron traducciones inglesas corruptas en los contenidos sobre vocales nasales, acento, división silábica y consonantes; se recuperaron grafías polacas dañadas como **dźwięk**, **wyraźnie** y **różnicę**, y se afinó la descripción de las formas instrumentales y de los dígrafos. Se mantuvieron las notas como pautas de pronunciación, no como transcripciones fonéticas completas. Diccionario sincronizado; IDs conservados.

| Lección | Nota provisional |
|---:|---:|
| 031 | 7,6 |
| 032 | 7,7 |
| 033 | 7,6 |
| 034 | 7,6 |
| 035 | 7,6 |
| **Media del lote** | **7.62** |
| **Media acumulada 001–035** | **7.79** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 036–040

Se revisaron homófonos y ortografía, deletreo y direcciones electrónicas, números de contacto, formularios y concordancia adjetival. En 036 se corrigió una clave que confundía “mar” con “río”; en 037–039 se repararon falsos sentidos en correo, códigos telefónicos y consignas; en 040 se precisó el género neutro como categoría gramatical y la concordancia. Se sincronizaron las entradas correspondientes del diccionario y se comprobaron IDs y respuestas.

| Lección | Nota provisional |
|---:|---:|
| 036 | 7,5 |
| 037 | 7,5 |
| 038 | 7,6 |
| 039 | 7,6 |
| 040 | 7,6 |
| **Media del lote** | **7.56** |
| **Media acumulada 001–040** | **7.75** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 041–045

Se revisaron demostrativos, posesivos, acusativo femenino, acusativo masculino animado/inanimado y acusativo neutro. Se corrigieron errores de concordancia en inglés, terminología gramatical dañada (**accuser**, **-Ω**, **nominee**) y traducciones que no seguían el género gramatical polaco. En 036–040 también se corrigió una respuesta clave que asociaba *morze* con «río» y se repararon expresiones de contacto y formularios. Se conservaron los IDs y se comprobaron los ejercicios cerrados.

| Lección | Nota provisional |
|---:|---:|
| 041 | 7,8 |
| 042 | 7,8 |
| 043 | 7,6 |
| 044 | 7,6 |
| 045 | 7,7 |
| **Media del lote** | **7.70** |
| **Media acumulada 001–045** | **7.75** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 046–050

Se revisaron negación y genitivo, expresiones de cantidad, preposiciones **z/do/bez**, locativo y usos del instrumental. Se reemplazaron calcos como “transient verbs”, “origin and membership”, “the accuser” y “instrument forms”; se precisaron ejemplos de ausencia, cantidades, origen, mercado y compañía. En la lección 050 se eliminó un distractor duplicado. Se conservaron los IDs y las respuestas cerradas tienen una sola clave correcta.

| Lección | Nota provisional |
|---:|---:|
| 046 | 7,7 |
| 047 | 7,8 |
| 048 | 7,7 |
| 049 | 7,6 |
| 050 | 7,8 |
| **Media del lote** | **7.72** |
| **Media acumulada 001–050** | **7.75** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 051–055

Se revisaron instrumental de medios y herramientas, destinos con **do/w/na**, horarios, orientación urbana y compras. Se corrigieron traducciones de movimiento y destino, formas de hora y términos de caso; se alineó el hueco de la lección 051 con su consigna y se reemplazaron distractores duplicados en 053–055 por opciones distintas. Se aclaró el imperativo informal y su alternativa cortés. Se conservaron los IDs y se validaron las claves cerradas.

| Lección | Nota provisional |
|---:|---:|
| 051 | 7,8 |
| 052 | 7,6 |
| 053 | 7,5 |
| 054 | 7,6 |
| 055 | 7,5 |
| **Media del lote** | **7.60** |
| **Media acumulada 001–055** | **7.73** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 056–060

Se revisaron medidas y genitivo, cambios y devoluciones, rutinas reflexivas, frecuencia y propuestas sociales. Se corrigieron errores importantes de alineación: el hueco 056 ahora pide **jabłek** en «medio kilo de manzanas»; el 057 pide **gotówką** en la frase sobre pagar en efectivo. Se sustituyeron opciones duplicadas y se repararon las formas **wstaję**, **sobotę** y **mogę** dañadas en consignas. Se mantuvieron IDs y se validaron las respuestas cerradas.

| Lección | Nota provisional |
|---:|---:|
| 056 | 7,2 |
| 057 | 7,5 |
| 058 | 7,5 |
| 059 | 7,6 |
| 060 | 7,4 |
| **Media del lote** | **7.44** |
| **Media acumulada 001–060** | **7.71** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 061–065

Se revisaron el futuro imperfectivo con **być**, el pronóstico, los planes de viaje, los síntomas y la consulta médica. Se corrigió la terminología del futuro, las traducciones meteorológicas y las consignas con grafías dañadas. Se realinearon dos huecos cuyo enunciado no correspondía a la frase objetivo (runny nose/rana en 064; «desde hace dos días»/dni en 065) y se diversificaron distractores duplicados. Se conservaron los IDs y se revisaron las claves cerradas.

| Lección | Nota provisional |
|---:|---:|
| 061 | 7,5 |
| 062 | 7,4 |
| 063 | 7,4 |
| 064 | 7,2 |
| 065 | 7,3 |
| **Media del lote** | **7.36** |
| **Media acumulada 001–065** | **7.68** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 066–070

Se revisaron farmacia, peticiones de aclaración, hotel, llamadas y el examen integrador A1. Se corrigieron usos de **prospectus**, **the account**, **the exit**, entre otros; se realineó el hueco del hotel con la frase sobre la temperatura, se eliminaron opciones duplicadas y se repararon grafías y traducciones de peticiones. En la lección 070 se actualizó el alcance declarado del repaso a los capítulos A1 (1–7). La marca oculta `Cap` se conservó tras comprobar que no forma parte del vocabulario visible. Se validaron respuestas e IDs.

| Lección | Nota provisional |
|---:|---:|
| 066 | 7,4 |
| 067 | 7,5 |
| 068 | 7,5 |
| 069 | 7,6 |
| 070 | 7,4 |
| **Media del lote** | **7.48** |
| **Media acumulada 001–070** | **7.67** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 071–075

Se revisaron invitaciones, respuestas, mensajes y vivienda. Se corrigieron traducciones de **przyjść**, **spotkać się**, **wolny wieczór**, **mieszkanie** y el vocabulario de contrato y gastos. Se repararon explicaciones inglesas con letras sustituidas y calcos que habían sobrevivido a la primera comprobación; el diccionario se mantuvo sincronizado. Se validaron JSON, claves cerradas e IDs.

| Lección | Nota provisional |
|---:|---:|
| 071 | 7,6 |
| 072 | 7,6 |
| 073 | 7,5 |
| 074 | 7,3 |
| 075 | 7,4 |
| **Media del lote** | **7.48** |
| **Media acumulada 001–075** | **7.66** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 076–080

Se revisaron ubicación de muebles, sabor, cantidades en restaurante, recomendaciones y síntomas. Se corrigieron los regímenes de **przed/między** (instrumental) y **obok** (genitivo), los usos de **smakować**, las formas de cantidad con genitivo, la concordancia de **wegetariańskie** y expresiones médicas. También se repararon calcos y errores de traducción ingleses (entre ellos *jar* por *runny nose* y *REQUIREMENTS* por *you recommend*). Se sincronizó el diccionario y se validaron JSON, claves cerradas e IDs.

| Lección | Nota provisional |
|---:|---:|
| 076 | 7,4 |
| 077 | 7,3 |
| 078 | 7,4 |
| 079 | 7,1 |
| 080 | 7,2 |
| **Media del lote** | **7.28** |
| **Media acumulada 001–080** | **7.63** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 081–085

Se revisaron consejos de salud, instrucciones en farmacia, CV, formación académica y tareas en el trabajo. Se aclararon las formas de **powinien/powinnam**, los imperativos de aspecto **weź/bierz**, el vocabulario profesional y la diferencia entre **umieć** y **znać**. Se repararon traducciones inglesas poco naturales o erróneas, incluidos *baby* por *drink* y *equipment* por *team*. Se sincronizó el diccionario y se comprobaron JSON, respuestas cerradas e IDs.

| Lección | Nota provisional |
|---:|---:|
| 081 | 7,5 |
| 082 | 7,4 |
| 083 | 7,4 |
| 084 | 7,3 |
| 085 | 7,3 |
| **Media del lote** | **7.38** |
| **Media acumulada 001–085** | **7.62** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 086–090

Se revisaron aeropuerto, planes de vacaciones, aspecto en pasado, oficina de correos y operaciones bancarias. Se corrigieron términos clave como **bramka** (puerta de embarque), **list polecony** (carta certificada), **ważyć** (pesar) y **bankomat** (cajero automático); también se ajustaron preposiciones, casos y las formas de futuro perfectivo e imperfectivo. Se repararon opciones y análisis donde aparecían «pregnancy», «cashier», «Slots» y otros calcos; se sincronizó el diccionario. JSON, claves cerradas, IDs y referencias revisados.

| Lección | Nota provisional |
|---:|---:|
| 086 | 7,5 |
| 087 | 7,4 |
| 088 | 7,3 |
| 089 | 7,2 |
| 090 | 7,3 |
| **Media del lote** | **7.34** |
| **Media acumulada 001–090** | **7.60** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 091–095

Se revisaron biblioteca y droguería, comparativos, costumbres de Nochebuena y Pascua, planes culturales y pasado femenino. Se repararon la correspondencia de varias líneas del diálogo de 093, las traducciones de **szampon**, **wystawa**, **ciekawsza**, **spotkałyście** y **spotkałam się**, y las notas sobre dirección y ubicación. Se revisaron textos de ejercicio, análisis, tabla y diccionario; IDs y claves cerradas validados.

| Lección | Nota provisional |
|---:|---:|
| 091 | 7,6 |
| 092 | 7,5 |
| 093 | 7,4 |
| 094 | 7,5 |
| 095 | 7,4 |
| **Media del lote** | **7.48** |
| **Media acumulada 001–095** | **7.60** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 096–100

Se revisaron aspecto perfectivo e imperfectivo en pasado, relato del fin de semana, vocabulario de naturaleza, cuidado ambiental y seguridad en una excursión. Se corrigieron traducciones inglesas de las formas femeninas, los verbos de regreso y encuentro, **śmieci**, **warto**, el pronóstico y las expresiones de prohibición. También se ajustaron la pregunta del fin de semana, formas de tiempo y una opción sobre el sendero. Diccionario, JSON, claves cerradas, IDs y referencias comprobados.

| Lección | Nota provisional |
|---:|---:|
| 096 | 7,3 |
| 097 | 7,3 |
| 098 | 7,5 |
| 099 | 7,3 |
| 100 | 7,1 |
| **Media del lote** | **7.30** |
| **Media acumulada 001–100** | **7.58** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 101–105

Se revisaron marcadores de secuencia, narración con aspecto verbal, emociones y recuerdos, cambios entre pasado y presente, y **już/jeszcze**. Se corrigieron discordancias de género entre nombres y formas verbales, explicaciones inglesas genéricas, un caso donde «checking the weather» se había convertido en «checking the time», distractores duplicados y varias consignas de escritura cuya respuesta no correspondía al enunciado. En 105 se alineó la forma completiva femenina y el ejercicio de enviar el mensaje. Se sincronizó el diccionario y se validaron claves, IDs y referencias.

| Lección | Nota provisional |
|---:|---:|
| 101 | 7,5 |
| 102 | 7,4 |
| 103 | 7,4 |
| 104 | 7,3 |
| 105 | 7,5 |
| **Media del lote** | **7.42** |
| **Media acumulada 001–105** | **7.57** |

La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 106–110

Se revisaron cambios vitales y duración, comparativos, superlativos, comparación de ofertas, e imperativos y propuestas. Se alinearon tres respuestas abiertas con sus consignas (tren más rápido, libro más interesante y modelo que funciona más rápido), se completó la puntuación interrogativa en *Od kiedy…?* y se corrigieron concordancias y traducciones inglesas. Se repararon explicaciones heredadas que mencionaban frases ajenas al ejercicio, incluida la explicación de *najdłużej*, y se reemplazaron varios distractores duplicados o retroalimentación genérica. Diccionario actualizado con el léxico de 106–110.

| Lección | Nota provisional |
|---:|---:|
| 106 | 7,4 |
| 107 | 7,4 |
| 108 | 7,3 |
| 109 | 7,2 |
| 110 | 7,2 |
| **Media del lote** | **7.30** |
| **Media acumulada 001–110** | **7.56** |

Validación estática del lote: cinco JSON analizables, 30 ejercicios cerrados con una única respuesta correcta, IDs únicos y referencias de vocabulario resueltas. La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 111–115

Se revisaron prohibiciones, peticiones corteses, aspecto perfectivo e imperfectivo en pasado y futuro, y acciones futuras presentadas como completadas. Se corrigieron las respuestas desalineadas de 112, 113, 114 y 115; una actividad de huecos mezclaba el enunciado de esperar con la frase de sentarse junto a la ventana. Se armonizaron los géneros de Tom y Kasia con sus formas verbales, se repararon traducciones con sujeto o aspecto incorrectos, los ejemplos de *słuchać/wysłuchać* y errores de inglés con caracteres corruptos. Se mejoró retroalimentación de claves, se sincronizaron las traducciones y se revisaron referencias e IDs.

| Lección | Nota provisional |
|---:|---:|
| 111 | 7,2 |
| 112 | 6,8 |
| 113 | 7,0 |
| 114 | 7,1 |
| 115 | 7,0 |
| **Media del lote** | **7.02** |
| **Media acumulada 001–115** | **7.54** |

Validación estática del lote: cinco JSON analizables, 30 ejercicios cerrados con una única respuesta correcta, 40 IDs únicos y referencias de vocabulario resueltas en el curso y diccionario. La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 116–120

Se revisaron peticiones condicionales, preferencias, hipótesis sencillas, pronombres átonos y formas tónicas tras preposición. Se arreglaron respuestas abiertas cruzadas en las cinco unidades, una pregunta de huecos que mezclaba dos frases, y una opción de genitivo que tenía como clave el plural en vez del singular solicitado. También se corrigieron opciones duplicadas, varias traducciones del inglés que cambiaban persona o tiempo verbal, y retroalimentación que mencionaba un ejemplo ajeno. Se armonizaron casos, concordancias y traducciones del diálogo con el glosario y el diccionario.

| Lección | Nota provisional |
|---:|---:|
| 116 | 7,0 |
| 117 | 6,9 |
| 118 | 6,8 |
| 119 | 6,6 |
| 120 | 6,8 |
| **Media del lote** | **6.82** |
| **Media acumulada 001–120** | **7.51** |

Validación estática del lote: cinco JSON analizables, 30 ejercicios cerrados con una única respuesta correcta, 40 IDs únicos y referencias al glosario y al diccionario resueltas. La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 121–125

Se revisaron los pronombres tónicos y átonos, expresiones de duración y plazos, días y rutinas semanales, secuenciadores y numerales. Se corrigieron tres consignas de huecos con la frase o respuesta intercambiada, dos respuestas abiertas cruzadas, una clave con forma y caso incorrectos, y traducciones de billetes, manzanas y expresiones de plazo. También se repararon sujetos ingleses erróneos, duplicados entre opciones y explicaciones que mencionaban otros ejemplos. Diccionario sincronizado con los cambios.

| Lección | Nota provisional |
|---:|---:|
| 121 | 6,8 |
| 122 | 6,9 |
| 123 | 6,5 |
| 124 | 6,7 |
| 125 | 6,5 |
| **Media del lote** | **6.68** |
| **Media acumulada 001–125** | **7.47** |

Validación estática del lote: cinco JSON analizables, 30 ejercicios cerrados con una única respuesta correcta, 40 IDs únicos y referencias al glosario y al diccionario resueltas. La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 126–130

Se revisaron fechas ordinales, pisos y horarios, opiniones, causas y concesiones, y selección razonada de soluciones. Se realinearon ejercicios de huecos sobre mes de nacimiento, tercer piso y expresión de dudas; se corrigió una respuesta abierta sobre el inicio de curso y se repararon traducciones de género, ordinales y frases causales. También se ajustaron términos ingleses como *apples*, *tickets* y *traffic jams*, una traducción de causa literal, errores de forma en preguntas y explicaciones que describían otra frase. Se sincronizó el diccionario.

| Lección | Nota provisional |
|---:|---:|
| 126 | 6,8 |
| 127 | 6,7 |
| 128 | 6,8 |
| 129 | 7,0 |
| 130 | 6,8 |
| **Media del lote** | **6.82** |
| **Media acumulada 001–130** | **7.45** |

Validación estática del lote: cinco JSON analizables, 30 ejercicios cerrados con una única respuesta correcta, 40 IDs únicos y referencias al glosario y al diccionario resueltas. La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 131–135

Se revisaron un mensaje personal, un correo formal, reclamaciones, construcciones impersonales de permiso y obligación, y preguntas sobre normas. Se corrigieron traducciones de *daj znać*, despedidas epistolares, retrasos y solicitudes formales, además de errores que hacían parecer que el autobús validaba el billete o que el teléfono pagaba «con» el aparato. Se afinó el registro de saludos y cierres, se alinearon explicaciones con sus frases y se reemplazó una opción duplicada. Diccionario sincronizado.

| Lección | Nota provisional |
|---:|---:|
| 131 | 7,0 |
| 132 | 6,8 |
| 133 | 7,0 |
| 134 | 6,9 |
| 135 | 7,1 |
| **Media del lote** | **6.96** |
| **Media acumulada 001–135** | **7.43** |

Validación estática del lote: cinco JSON analizables, 30 ejercicios cerrados con una única respuesta correcta, 40 IDs únicos y referencias al glosario y al diccionario resueltas. La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 136–140

Se revisaron trámites presenciales, tecnología, fiabilidad de fuentes, hábitos de pantalla y tareas domésticas. Se corrigieron una respuesta abierta que no contestaba la consigna, errores en traducciones de taquilla, copias de seguridad, datos confidenciales, escuchar frente a oír y descargar un archivo, y mensajes con el sujeto/acción en inglés incorrectos. Se reparó una explicación en inglés con una larga cadena corrupta y se sincronizó el diccionario.

| Lección | Nota provisional |
|---:|---:|
| 136 | 6,5 |
| 137 | 6,9 |
| 138 | 6,8 |
| 139 | 6,7 |
| 140 | 6,5 |
| **Media del lote** | **6.68** |
| **Media acumulada 001–140** | **7.40** |

Validación estática del lote: cinco JSON analizables, 30 ejercicios cerrados con una única respuesta correcta, 40 IDs únicos y referencias al glosario y al diccionario resueltas. La valoración sigue siendo provisional; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 141–145

Se revisaron acuerdos vecinales, vivienda compartida, repaso final A2, rasgos personales y familia. Se corrigieron explicaciones marcadas literalmente como «undefined», ejercicios de silencio nocturno y copia de contrato con huecos cruzados, y una respuesta escrita fuera de tema. El repaso A2 recibió una pasada de traducción en veinticinco ítems: se corrigieron varios errores de tiempo, caso y sentido, como *smakuje mi*, *o ósmej*, y expresiones de correo, costumbres navideñas y trámites. Se ajustaron las traducciones de *kaucja*, parentesco y pronombres, y se eliminaron opciones idénticas.

| Lección | Nota provisional |
|---:|---:|
| 141 | 6,6 |
| 142 | 6,6 |
| 143 | 7,1 |
| 144 | 7,1 |
| 145 | 6,7 |
| **Media del lote** | **6.82** |
| **Media acumulada 001–145** | **7.38** |

Validación estática del lote: cinco JSON analizables, 49 ejercicios cerrados con clave única, 58 IDs únicos y sin opciones duplicadas ni explicaciones «undefined». La revisión continúa en orden numérico.


## Segunda pasada editorial — lección 146 (cierre A2)

Se revisaron desacuerdo, motivos, disculpas y compromisos. Se corrigieron formas inglesas para acuerdo, discusión y disculpa en pasado; se aclararon *kompromis/kompromisu* y expresiones de reciprocidad, y se repararon explicaciones de causa y contraste.

| Lección | Nota provisional |
|---:|---:|
| 146 | 7,0 |
| **Media acumulada 001–146** | **7.38** |

Validación estática: JSON analizable, 6 ejercicios cerrados con clave única, 8 IDs únicos y referencias de glosario/diccionario resueltas. Se completa el tramo A2; continúa la revisión en orden numérico.


## Segunda pasada editorial — lote 147–151

Inició la revisión B1 con cursos y formación, estrategias de estudio, preparación de exámenes, entrevistas y condiciones laborales. Se corrigieron sentidos falsos en términos de enseñanza y selección, *nauczyć się*, *robię postępy*, *zdać egzamin*, *samodzielnie*, *oferta pracy*, *list motywacyjny*, *pełny etat* y *pół etatu*. Se realinearon los ejemplos ingleses de preguntas y acciones, se repararon una explicación contaminada por transliteración y varias consignas en tercera persona, y se sincronizó el diccionario.

| Lección | Nota provisional |
|---:|---:|
| 147 | 6,7 |
| 148 | 7,0 |
| 149 | 6,7 |
| 150 | 6,8 |
| 151 | 6,8 |
| **Media del lote** | **6.80** |
| **Media acumulada 001–151** | **7.36** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos y referencias de glosario/diccionario resueltas. La revisión continúa en orden numérico.


## Segunda pasada editorial — lote 152–156

Se revisaron colaboración laboral, reparaciones, consumo doméstico, convivencia vecinal y viajes en tren. Se corrigieron calcos y errores del inglés en análisis y distractores (por ejemplo *quiet hours*, *change trains*, *platform*, *reported*), traducciones de términos de vivienda y transporte, matices de *termin* y *peron*, y consignas de escritura. Se sincronizaron traducciones existentes del diccionario y se conservaron las claves, los números y los IDs de ejercicios.

| Lección | Nota provisional |
|---:|---:|
| 152 | 6,8 |
| 153 | 6,6 |
| 154 | 6,8 |
| 155 | 6,9 |
| 156 | 6,5 |
| **Media del lote** | **6,72** |
| **Media acumulada 001–156** | **7.34** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos y referencias de glosario/diccionario resueltas. Se corrigieron traducciones de explicación y consignas en inglés; quedan pendientes validación con audio real y cotejo por persona competente en polaco. La revisión continúa en orden numérico.


## Segunda pasada editorial — lote 157–161

Se revisaron incidencias de equipaje, reclamaciones, consultas médicas como contexto lingüístico, indicaciones de tratamiento y bienestar diario. Se corrigieron falsos sentidos ingleses (*report number*, *dosage*, *referral*, *well-rested*), consignas deformadas, calcos de pregunta y términos como *zaginięcie*, *przysługuje*, *wyspać się* y *dolegliwość*. En 161 se hizo más natural la frase sobre dormir poco y se alinearon sus traducciones. Se actualizaron entradas existentes del diccionario, conservando estructura e IDs.

| Lección | Nota provisional |
|---:|---:|
| 157 | 6,6 |
| 158 | 6,8 |
| 159 | 7,0 |
| 160 | 6,8 |
| 161 | 6,7 |
| **Media del lote** | **6,78** |
| **Media acumulada 001–161** | **7.32** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos y referencias del glosario al diccionario resueltas. La lección 159 aporta vocabulario sanitario en una conversación breve, pero no sustituye orientación médica; el contenido sigue siendo una actividad lingüística. La revisión continúa en orden numérico.


## Segunda pasada editorial — lote 162–166

Se revisaron privacidad digital, lectura crítica de noticias, ciencia, cine y visitas culturales. Se corrigieron falsos amigos y errores de significado en permisos y audiencia, *według redakcji* (equipo editorial), el uso de pasiva impersonal en ciencia y *fabuła* (trama). Se realineó la pregunta sobre consumo energético y se repararon varias consignas deformadas y opciones en inglés. El contenido sobre privacidad se mantiene como práctica lingüística cotidiana, sin formular reglas legales. Diccionario sincronizado para las entradas revisadas.

| Lección | Nota provisional |
|---:|---:|
| 162 | 7,0 |
| 163 | 6,8 |
| 164 | 6,8 |
| 165 | 7,0 |
| 166 | 7,1 |
| **Media del lote** | **6,94** |
| **Media acumulada 001–166** | **7.31** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos y referencias del glosario al diccionario resueltas. Se conservó la estructura de los ejercicios y se verificó la alineación de pregunta, clave y traducción en los cambios. La revisión sigue en orden numérico.


## Segunda pasada editorial — lote 167–171

Se revisaron resultados deportivos, trámites y certificados, vocabulario cívico, voluntariado vecinal y clima. Se corrigieron calcos como *was classified*, *according to the wording*, *the water level is low* y varias consignas de escritura; se ajustó la conversación del certificado para distinguir entrega, presentación y recogida presencial, y se incorporó *emisja* al glosario y al diccionario. También se pulieron formas de trato y vocabulario de la actividad ciudadana.

| Lección | Nota provisional |
|---:|---:|
| 167 | 6,8 |
| 168 | 6,6 |
| 169 | 7,0 |
| 170 | 6,9 |
| 171 | 6,9 |
| **Media del lote** | **6,84** |
| **Media acumulada 001–171** | **7.30** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos y vocabulario resuelto en el diccionario tras añadir *emisja*. La revisión continúa en orden numérico.


## Segunda pasada editorial — lote 172–176

Se revisaron transporte y sostenibilidad, argumentación, rutinas de estudio, toma de notas y estrategias para pedir aclaraciones. Se corrigieron calcos de inglés y errores de foco en actividades abiertas: los huecos ahora corresponden a la frase mostrada, y los modelos de escritura responden a la consigna. En 174–176 se repararon además explicaciones genéricas repetidas, opciones duplicadas, puntuación de preguntas y contenido cruzado entre ejercicios. Se preservaron los IDs y se mantuvieron los bloques compatibles.

| Lección | Nota provisional |
|---:|---:|
| 172 | 6,9 |
| 173 | 6,9 |
| 174 | 7,0 |
| 175 | 6,8 |
| 176 | 6,9 |
| **Media del lote** | **6,90** |
| **Media acumulada 001–176** | **7.29** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin opciones españolas duplicadas y vocabulario resuelto en el diccionario. La revisión continúa en orden numérico.


## Segunda pasada editorial — lote 177–181

Se revisaron correos formales, solicitudes administrativas, llamadas telefónicas, descripciones de estilo y comparaciones. Se repararon varios bloques cruzados (la frase con hueco no correspondía a la consigna), modelos de escritura sin relación con el objetivo, traducciones inglesas con pronombres o sentidos incorrectos y opciones duplicadas. En 179 se eliminaron seis campos con el texto literal `undefined`; en 180–181 se alinearon los comparativos y descripciones. Se corrigió la puntuación de preguntas y se mantuvieron los IDs.

| Lección | Nota provisional |
|---:|---:|
| 177 | 7,0 |
| 178 | 6,8 |
| 179 | 6,5 |
| 180 | 6,9 |
| 181 | 6,8 |
| **Media del lote** | **6,80** |
| **Media acumulada 001–181** | **7.27** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin duplicados en opciones españolas, sin `undefined` y con todas las palabras del glosario presentes en el diccionario. Se continúa en orden numérico.


## Segunda pasada editorial — lote 182–186

Se revisaron elogios, salarios y jornada, condiciones laborales, negociación profesional y convivencia intercultural. Se realinearon consignas y respuestas en actividades abiertas, se eliminó una opción duplicada y se corrigieron calcos en horas extra, experiencia, expectativa salarial y pertenencia a una comunidad. También se armonizaron las formas de género gramatical y varios ejemplos de plural, genitivo e instrumental. Las referencias del glosario ya existían en el diccionario.

| Lección | Nota provisional |
|---:|---:|
| 182 | 7,2 |
| 183 | 7,0 |
| 184 | 7,0 |
| 185 | 6,7 |
| 186 | 7,0 |
| **Media del lote** | **6,98** |
| **Media acumulada 001–186** | **7.27** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin opciones españolas repetidas y con vocabulario resuelto en el diccionario. Continúa la revisión secuencial.


## Segunda pasada editorial — lote 187–191

Se revisaron apoyo comunitario, costumbres interculturales, formularios de residencia, trámites y notificaciones administrativas. Se realinearon los huecos y modelos de respuesta con sus frases, se corrigieron tiempos verbales y expresiones de la oficina de información, letras de imprenta, números personales y fórmulas de entrega o conservación de documentos. Se eliminaron opciones duplicadas y se ajustaron varios calcos ingleses.

| Lección | Nota provisional |
|---:|---:|
| 187 | 7,0 |
| 188 | 6,9 |
| 189 | 6,8 |
| 190 | 6,8 |
| 191 | 7,0 |
| **Media del lote** | **6,90** |
| **Media acumulada 001–191** | **7.26** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin opciones españolas duplicadas y referencias de vocabulario resueltas en el diccionario. Se continúa por número de lección.


## Segunda pasada editorial — lote 192–196

Se revisaron citas de servicio, presupuestos, reparaciones, productos defectuosos y vías de reclamación. Se corrigieron traducciones de pago por transferencia, entrega y recogida, se realinearon tres huecos y dos modelos de escritura con su consigna, y se eliminaron duplicados en opciones. Se revisaron vocabulario de garantía, reparación gratuita, devolución y sustitución de productos, manteniendo los ejemplos como práctica lingüística sin añadir afirmaciones de asesoramiento legal.

| Lección | Nota provisional |
|---:|---:|
| 192 | 6,8 |
| 193 | 6,8 |
| 194 | 6,9 |
| 195 | 6,8 |
| 196 | 6,9 |
| **Media del lote** | **6,84** |
| **Media acumulada 001–196** | **7.25** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin opciones españolas duplicadas y todas las palabras del glosario resueltas en el diccionario. Revisión secuencial en curso.


## Segunda pasada editorial — lote 197–201

Se revisaron reparación de automóviles, un repaso integrado de contenidos, argumentación, relaciones de condición y consecuencia, y participación en debates. Se corrigieron modelos de escritura cruzados, términos mecánicos, preguntas del repaso y calcos como *two evidence*, *the deadline shall be maintained* y *according to the wording*. La lección 198 contiene 25 ejercicios breves más una actividad de ordenación y conserva 26 IDs únicos; las otras cuatro conservan ocho IDs cada una.

| Lección | Nota provisional |
|---:|---:|
| 197 | 7,0 |
| 198 | 7,0 |
| 199 | 7,0 |
| 200 | 7,0 |
| 201 | 6,9 |
| **Media del lote** | **6,98** |
| **Media acumulada 001–201** | **7.24** |

Validación estática: cinco JSON analizables, 49 ejercicios cerrados con clave única, 58 IDs únicos en total y todas las referencias de glosario presentes en el diccionario; no se hallaron opciones duplicadas ni `undefined`. La revisión secuencial continúa.


## Segunda pasada editorial — lote 202–206

Se revisaron cambios generacionales, accesibilidad, cooperación entre grupos, lectura crítica y encuestas. Se pulieron explicaciones en inglés, una referencia pronominal ambigua a “este apoyo”, consignas de escritura y un error en la indicación de idioma de una actividad. El vocabulario sobre discapacidad se mantuvo centrado en accesibilidad y formulación respetuosa; se añadió una nota de género gramatical para *trzej eksperci* y *trzy ekspertki*.

| Lección | Nota provisional |
|---:|---:|
| 202 | 6,8 |
| 203 | 7,0 |
| 204 | 6,8 |
| 205 | 7,0 |
| 206 | 6,8 |
| **Media del lote** | **6,88** |
| **Media acumulada 001–206** | **7.23** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos y referencias del glosario resueltas. No se hallaron opciones duplicadas. La revisión continúa en orden secuencial.


## Segunda pasada editorial — lote 207–211

Se revisaron verificación de noticias, datos de formularios, desarrollo profesional, correspondencia formal y sistemas informáticos. Se corrigieron consignas y calcos, traducciones de *sprostowanie*, *imienia* y *serwer został wyłączony*, y el registro inclusivo de un saludo profesional. Se ajustó la forma de expresar lo que se sabe o se pide en inglés y se conservaron los objetivos gramaticales y las claves.

| Lección | Nota provisional |
|---:|---:|
| 207 | 6,9 |
| 208 | 6,8 |
| 209 | 7,0 |
| 210 | 6,8 |
| 211 | 7,0 |
| **Media del lote** | **6,90** |
| **Media acumulada 001–211** | **7.22** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin opciones duplicadas y con las referencias del glosario presentes en el diccionario. La revisión continúa en orden secuencial.


## Segunda pasada editorial — lote 212–216

Se revisaron consentimiento y privacidad, tratamiento de datos, contaminación urbana, transición energética y propuestas públicas. Se corrigieron pasivas inglesas, un falso amigo en *zebrane w badaniu*, el texto deformado sobre “el futuro” y una pregunta traducida como “What’s up?”. Se convirtió un fragmento en una frase completa en la actividad de ordenación y se armonizaron las traducciones sobre emisiones y aire limpio.

| Lección | Nota provisional |
|---:|---:|
| 212 | 7,0 |
| 213 | 6,8 |
| 214 | 6,8 |
| 215 | 7,0 |
| 216 | 6,8 |
| **Media del lote** | **6,88** |
| **Media acumulada 001–216** | **7.22** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin opciones españolas repetidas y con referencias de glosario resueltas. Revisión secuencial en curso.


## Segunda pasada editorial — lote 217–221

Se revisaron narración literaria, reseñas, acceso a la cultura, patrimonio y fuentes históricas. Se corrigieron traducciones inglesas calcadas o erróneas (*symbolic reason*, *file document*, falsas equivalencias de *rozliczana*), explicaciones gramaticales, consignas de escritura y prompts de huecos desalineados. Se armonizó *recenzentka* como «reseñista / reviewer» y se sincronizaron las entradas de vocabulario con el diccionario.

| Lección | Nota provisional |
|---:|---:|
| 217 | 6,7 |
| 218 | 6,8 |
| 219 | 6,5 |
| 220 | 6,8 |
| 221 | 6,7 |
| **Media del lote** | **6,70** |
| **Media acumulada 001–221** | **7.20** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin opciones duplicadas y con todas las palabras de lección localizadas en el diccionario. La revisión continúa en orden secuencial.


## Segunda pasada editorial — lote 222–226

Se revisaron turismo y residentes, interpretación de resultados, bienestar laboral, recomendaciones generales de salud y correspondencia formal. Se ajustaron tiempos verbales, terminología financiera, expresiones idiomáticas inglesas y explicaciones de aspecto y casos. En la lección de salud se aclaró el sentido condicional de «si los síntomas empeoran» y se mantuvo la advertencia general de no cambiar la dosis sin asesoramiento profesional. Se corrigieron también traducciones del registro formal y se sincronizaron entradas del diccionario.

| Lección | Nota provisional |
|---:|---:|
| 222 | 6,6 |
| 223 | 6,7 |
| 224 | 7,0 |
| 225 | 6,8 |
| 226 | 6,5 |
| **Media del lote** | **6,72** |
| **Media acumulada 001–226** | **7.19** |

Validación estática: cinco JSON analizables, 30 ejercicios cerrados con clave única, 40 IDs únicos, sin opciones duplicadas y con todas las palabras de lección localizadas en el diccionario. Revisión secuencial en curso.


## Segunda pasada editorial — lote 227–229

Se revisaron síntesis de datos, acuerdos entre instituciones y el examen final B2. Se corrigieron calcos como *data submitted*, errores de concordancia y opciones que describían mal el estado o la acción; se alinearon consignas de huecos con sus respuestas y se reparó la errata *anonimized*. La revisión final abarca contenidos anteriores del curso y conserva sus IDs.

| Lección | Nota provisional |
|---:|---:|
| 227 | 6,7 |
| 228 | 6,9 |
| 229 | 6,2 |
| **Media del lote** | **6,60** |
| **Media acumulada 001–229** | **7.18** |

Validación estática: tres JSON analizables, 37 ejercicios cerrados con clave única, 42 IDs únicos, sin opciones duplicadas y referencias de vocabulario resueltas. Las lecciones 001–229 ya cuentan con segunda pasada individual; empieza la revisión detallada de 230–299.


## Segunda pasada editorial — lote 230–234

Se revisaron inferencia contextual, distinción entre hechos y opiniones, afirmaciones prudentes, relación entre tesis y evidencia e interpretación de gráficos. Se corrigieron cinco consignas inglesas que pedían traducir al idioma equivocado, una actividad de huecos que daba por cerrada la sala equivocada y tres opciones de traducción que no cubrían el texto objetivo. También se comprobó que la tabla, los porcentajes y las conclusiones no sugirieran causalidad no demostrada.

| Lección | Nota provisional |
|---:|---:|
| 230 | 7,2 |
| 231 | 7,2 |
| 232 | 7,0 |
| 233 | 7,1 |
| 234 | 7,4 |
| **Media del lote** | **7,18** |
| **Media acumulada 001–234** | **7.18** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos y todas las palabras del glosario localizadas en el diccionario. No se encontraron opciones repetidas.


## Segunda pasada editorial — lote 235–239

Se revisaron correlación y causalidad, síntesis de resultados, evaluación de fuentes, encuadre de titulares y voz pasiva en procesos. Se corrigieron las consignas inglesas de traducción que apuntaban al idioma equivocado, se explicitó el contraste entre dos titulares y se alinearon traducciones con su frase polaca completa. Se mantuvo la cautela sobre inferencias y causalidad a lo largo del bloque.

| Lección | Nota provisional |
|---:|---:|
| 235 | 7,4 |
| 236 | 7,2 |
| 237 | 7,4 |
| 238 | 7,2 |
| 239 | 7,3 |
| **Media del lote** | **7,30** |
| **Media acumulada 001–239** | **7.19** |

Validación estática: cinco JSON analizables, 14 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones repetidas y sin referencias de glosario ausentes.


## Segunda pasada editorial — lote 240–244

Se revisaron instrucciones impersonales, participios, subordinación, condicionales y concesión. Se reparó una serialización defectuosa que mezclaba español e inglés en listas dentro de las opciones de respuesta; se localizaron las opciones y se mantuvieron los términos polacos cuando eran el objeto de la pregunta. También se alinearon consignas y modelos, y se precisaron traducciones de plazo, disponibilidad y condiciones.

| Lección | Nota provisional |
|---:|---:|
| 240 | 6,9 |
| 241 | 7,1 |
| 242 | 7,2 |
| 243 | 7,3 |
| 244 | 7,0 |
| **Media del lote** | **7,10** |
| **Media acumulada 001–244** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, opciones de selección correctamente localizadas y referencias léxicas resueltas.


## Segunda pasada editorial — lote 245–249

Se revisaron aspecto verbal, régimen de verbos, prefijos, registro formal y colocaciones. Se repararon las consignas que indicaban el idioma de traducción equivocado, una traducción que perdía la relación temporal «antes de» y un plazo que sugería entregar antes del día indicado. También se ajustó la tarea de escritura para que coincidiera con su modelo.

| Lección | Nota provisional |
|---:|---:|
| 245 | 7,4 |
| 246 | 7,4 |
| 247 | 7,1 |
| 248 | 7,4 |
| 249 | 7,2 |
| **Media del lote** | **7,30** |
| **Media acumulada 001–249** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin traducciones con localización defectuosa ni referencias de glosario ausentes.


## Segunda pasada editorial — lote 250–254

Se revisaron nominalizaciones profesionales, puntuación, pronunciación, reseñas y comparación de fuentes. Se reemplazó una combinación impropia de «experiencia en contratación», se corrigió una respuesta modelo que mezclaba infinitivo y sustantivo derivado, se orientó la actividad de pronunciación al objetivo de la lección y se aclaró el plazo inclusivo «a más tardar el viernes». También se corrigieron las consignas inglesas de traducción.

| Lección | Nota provisional |
|---:|---:|
| 250 | 7,4 |
| 251 | 7,4 |
| 252 | 6,8 |
| 253 | 7,3 |
| 254 | 7,2 |
| **Media del lote** | **7,22** |
| **Media acumulada 001–254** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, localizaciones completas y glosario resuelto. Las opciones con signos de puntuación se mantienen como alternativas simbólicas distintas.


## Segunda pasada editorial — lote 255–259

Se revisaron conversación sobre normas, negociación, actas, correo profesional complejo y solicitudes justificadas. Se personalizaron notas que repetían una plantilla genérica, se hizo más específica la práctica de escritura y se ajustaron expresiones de plazo, responsables, peticiones formales y adjuntos. Se mantuvieron ejemplos respetuosos y con registro adecuado al contexto.

| Lección | Nota provisional |
|---:|---:|
| 255 | 7,2 |
| 256 | 7,1 |
| 257 | 7,2 |
| 258 | 7,3 |
| 259 | 7,2 |
| **Media del lote** | **7,20** |
| **Media acumulada 001–259** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones duplicadas y sin palabras ausentes del diccionario.


## Segunda pasada editorial — lote 260–264

Se revisaron informes de incidencias, lectura de gráficos, respuestas a críticas, contraargumentos y acuerdo parcial. Se sustituyeron explicaciones genéricas por orientación específica para cada objetivo y se redactaron consignas de escritura más concretas. La lección de gráficos ahora identifica explícitamente el número de préstamos como magnitud y evita atribuir una causa que los datos no ofrecen.

| Lección | Nota provisional |
|---:|---:|
| 260 | 7,2 |
| 261 | 7,0 |
| 262 | 7,3 |
| 263 | 7,3 |
| 264 | 7,3 |
| **Media del lote** | **7,22** |
| **Media acumulada 001–264** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones repetidas y referencias léxicas resueltas.


## Segunda pasada editorial — lote 265–269

Se revisaron matices de valoración, persuasión comercial, interpretación del tono, ambigüedad pronominal y reclamaciones. Se sustituyeron las notas genéricas por explicaciones centradas en el uso, y se concretaron las tareas de escritura para que practiquen valoración prudente, verificación de promesas, desambiguación y solicitudes de reparación o reembolso. Se ajustó además la traducción de una reclamación formal.

| Lección | Nota provisional |
|---:|---:|
| 265 | 7,3 |
| 266 | 7,4 |
| 267 | 7,1 |
| 268 | 7,2 |
| 269 | 7,3 |
| **Media del lote** | **7,26** |
| **Media acumulada 001–269** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones repetidas y glosario resuelto.


## Segunda pasada editorial — lote 270–274

Se revisaron instrucciones paso a paso, divulgación, artículos analíticos, crónicas con distintas fuentes e información pendiente de confirmación. Se reemplazaron las notas y consignas genéricas por tareas específicas de secuenciación, cautela causal, estructura argumentativa, atribución y consultas formales. Se corrigió también un artículo omitido en español.

| Lección | Nota provisional |
|---:|---:|
| 270 | 7,2 |
| 271 | 7,3 |
| 272 | 7,2 |
| 273 | 7,3 |
| 274 | 7,4 |
| **Media del lote** | **7,28** |
| **Media acumulada 001–274** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones duplicadas y con el glosario resuelto.


## Segunda pasada editorial — lote 275–279

Se revisaron grados de certeza, cambios de movilidad, secuencia narrativa, decisiones de transporte y evaluación de una aplicación. Se adaptaron notas y consignas a cada objetivo. Se corrigió *przypuszczenie* como «estimación» en el contexto de entrega, se aclaró el transbordo en español y se hizo explícita la navegación por teclado como condición de accesibilidad.

| Lección | Nota provisional |
|---:|---:|
| 275 | 7,3 |
| 276 | 7,2 |
| 277 | 7,2 |
| 278 | 7,3 |
| 279 | 7,3 |
| **Media del lote** | **7,26** |
| **Media acumulada 001–279** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones duplicadas y glosario resuelto.


## Segunda pasada editorial — lote 280–284

Se revisaron decisiones ambientales locales, patrimonio, costumbres domésticas, accesibilidad y mediación de normas. Se adaptaron notas y consignas; se evitó generalizar una costumbre a toda una cultura, se destacó la necesidad de cotejar fechas históricas y se pidió información concreta sobre apoyos de acceso. Se aclararon también dos traducciones al español e inglés.

| Lección | Nota provisional |
|---:|---:|
| 280 | 7,3 |
| 281 | 7,2 |
| 282 | 7,4 |
| 283 | 7,3 |
| 284 | 7,2 |
| **Media del lote** | **7,28** |
| **Media acumulada 001–284** | **7.19** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones duplicadas y glosario resuelto.


## Segunda pasada editorial — lote 285–289

Se revisaron mediación de posturas, decisiones conjuntas, actas, comparación de ofertas y lectura de reglamentos. Se hicieron las tareas de escritura específicas para cada objetivo, se aclararon costes de personal y una avería imprevista, y se precisó el vocabulario de reembolso de tarifas.

| Lección | Nota provisional |
|---:|---:|
| 285 | 7,4 |
| 286 | 7,3 |
| 287 | 7,3 |
| 288 | 7,3 |
| 289 | 7,3 |
| **Media del lote** | **7,32** |
| **Media acumulada 001–289** | **7.20** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones duplicadas y con referencias léxicas resueltas.


## Segunda pasada editorial — lote 290–294

Se revisaron contratos, informes con recomendaciones, síntesis de fuentes, exposiciones y portafolios profesionales. Se personalizaron las consignas y notas, se precisó el plazo de pago y se ordenó la atribución de causas a las tres fuentes. Se preservó la cautela sobre lo que puede inferirse de los datos.

| Lección | Nota provisional |
|---:|---:|
| 290 | 7,2 |
| 291 | 7,3 |
| 292 | 7,2 |
| 293 | 7,2 |
| 294 | 7,3 |
| **Media del lote** | **7,24** |
| **Media acumulada 001–294** | **7.20** |

Validación estática: cinco JSON analizables, 15 ejercicios cerrados con clave única, 20 IDs únicos, sin opciones duplicadas y referencias de vocabulario resueltas.


## Cierre editorial, reconstrucción del plan y evaluación final — 19 de octubre de 2026

Se completó la revisión secuencial hasta 299. Se contextualizaron 122 tareas/modelos de escritura, se añadió un diálogo a 295 y se incorporó a 229 el ejercicio abierto `pl229-26`, enlazado en el índice. Las lecciones 295–299 quedaron revisadas y calificadas.

El plan había perdido filas durante la actualización automática de notas. Se reconstruyó la tabla completa 001–299: se conservaron las 146 filas cuyo contenido seguía presente y se restauraron las otras 153 a partir de los JSON actuales (título, objetivo de producción cuando existía, estructuras/lexicón y destreza prioritaria). Los 299 números y calificaciones están ahora representados, pero las descripciones de esas 153 filas son una reconstrucción derivada de la lección, no una copia textual del plan previo.

Se corrigieron 62 campos con texto dañado por codificación en 42 lecciones, traducciones inglesas inequívocamente erróneas y el distractor español duplicado de `pl056-4`. Se conservaron los IDs existentes salvo el nuevo `pl229-26`, añadido para completar la producción escrita del examen final.

Validación posterior: 299 JSON parseables, 3.312 bloques, 2.185 IDs de ejercicio únicos, 1.659 ejercicios cerrados con exactamente una clave, 299 entradas del índice y referencias de ejercicios coincidentes; cero duplicados españoles entre opciones y cero cadenas con los caracteres de corrupción detectados. La media de la rúbrica editorial recalificada sobre 299 lecciones es **7.52/10**.

La nota mide esta evaluación editorial y no confirma corrección nativa del polaco ni equivalencia MCER. Sigue pendiente el cotejo de naturalidad, casos, aspecto, concordancia y pronunciación por una persona competente en polaco, además de una prueba dentro de la aplicación.
