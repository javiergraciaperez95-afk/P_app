# Informe de calidad final — curso de polaco

**Fecha:** 19 de octubre de 2026  
**Alcance:** `cursos/pl`, lecciones 001–299

## Resultado y autoevaluación

El curso conserva exactamente 299 lecciones consecutivas, de `001.json` a `299.json`, organizadas como A1 (001–070, 70), A2 (071–146, 76), B1 (147–222, 76) y B2 (223–299, 77). La nota editorial recalificada de las 299 unidades es **7,52/10**, de acuerdo con la rúbrica del plan: corrección lingüística y ejemplos (4), pedagogía (2), localización (2) y ejercicios/JSON (2). Es una autoevaluación del material revisado, no una acreditación oficial ni una equivalencia de examen.

## 1. Lecciones existentes conservadas

Se mantuvieron las 229 lecciones de partida (001–229), sus temas aprovechables y los IDs existentes. Se revisaron de nuevo textos, explicaciones, tareas abiertas, traducciones y glosas. Se añadieron únicamente la actividad abierta `pl229-26` al examen final B2 y un diálogo sin ID a 295, según los formatos ya usados por la aplicación.

## 2. Lecciones existentes revisadas

Las 229 unidades de partida fueron conservadas y revisadas. La revisión final contextualizó tareas abiertas débiles, en especial las traducciones de una sola palabra al final de lecciones B1/B2. Se corrigieron 62 campos de texto dañados por codificación en 42 lecciones —con ejemplos en 002, 067, 070, 119, 143, 171, 219 y 222— y traducciones inglesas equivocadas. En 056 se cambió un distractor que duplicaba la traducción española correcta.

Las tareas de 223–228 ahora piden mensajes, recomendaciones, síntesis y resúmenes funcionales; 229 incorpora producción argumentada. En 295–299 se mejoraron diálogo, mediación, lectura argumentativa, autoevaluación y síntesis integrada. Los modelos ofrecen criterios específicos y no presentan TTS como interacción oral real.

## 3. Lecciones nuevas creadas

Se crearon 70 unidades (230–299) para cubrir el tramo B2 y cerrar la secuencia. Las cinco últimas se revisaron individualmente en esta pasada y se calificaron entre 7,6 y 7,9/10.

## 4. Validaciones ejecutadas

- Hay 299 JSON de lección y 299 entradas del índice, en orden consecutivo.
- Los 299 JSON se analizan; suman 3.312 bloques y usan los tipos de bloque de la aplicación, incluidos `tabla`, `dialogo`, `ordenar` y `escribir`.
- Hay 2.185 IDs de ejercicio únicos; el índice coincide con los IDs y capítulos de cada lección. La entrada `pl229-26` también está enlazada.
- Los 1.659 ejercicios cerrados de tipos test, traducción y huecos tienen una sola respuesta correcta; no quedan opciones españolas duplicadas.
- Un barrido de los caracteres de corrupción identificados no encontró más cadenas afectadas. El distractor duplicado de `pl056-4` quedó corregido.
- Se mantienen 31 capítulos y la distribución por nivel y rango indicada arriba. El diccionario contiene 4.843 entradas.
- La validación fue estática; no se ejecutó el curso dentro de un navegador ni se comprobó la salida de voz.

**Recuperación del plan:** durante una actualización automática de notas se omitieron filas del plan. La tabla se reconstruyó y ahora contiene los 299 números: se conservaron las 146 descripciones presentes y se restauraron 153 a partir de los JSON (título, tarea abierta, estructuras/lexicón y destreza). Estas 153 descripciones son derivadas del material actual y no reproducen literalmente el texto previo del plan.

## 5. Revisión por una persona competente en polaco

Se recomienda cotejar la naturalidad de los modelos de producción, el gobierno de casos, el aspecto verbal, las formas impersonales y pasivas, el registro y las variedades de uso. La guía de pronunciación es textual y la voz disponible es TTS; no sustituye audio humano ni evaluación fonética.

## 6. Trabajo pendiente

- Revisión lingüística nativa o especializada de las 299 lecciones, especialmente de los modelos nuevos y de las construcciones de nivel B2.
- Prueba funcional de navegación, presentación de opciones, análisis y voz dentro de la aplicación.
- No se atribuye certificación, equivalencia de examen ni validación oficial del MCER.

El diagnóstico inicial permanece en `plantillas/AUDITORIA_CURRICULAR.md`, el plan secuencial completo en `plantillas/PLAN_CURRICULAR_299.md` y el registro detallado en `plantillas/PROGRESO_REVISION.md`.
