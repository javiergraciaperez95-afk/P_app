# Informe de calidad final · Curso de noruego

**Producción: completa. Revisión semántica ampliada: en curso.** Hay 279 lecciones consecutivas, de A1 a B2. La primera matriz fue automatizada y estructural; una segunda pasada JSON por JSON comenzó tras detectar errores de traducción que aquella no podía encontrar. No se presenta el curso como lingüísticamente validado por especialistas ni como certificación MCER.

## 1. Cobertura y conservación

| Nivel editorial | Rango | Lecciones | Capítulos |
|---|---:|---:|---:|
| A1 | 001–064 | 64 | 1–8 |
| A2 | 065–134 | 70 | 9–16 |
| B1 | 135–209 | 75 | 17–26 |
| B2 | 210–279 | 70 | 27–36 |
| **Total** | **001–279** | **279** | **36** |

Se conservaron las 157 lecciones preexistentes, reubicándolas donde lo requería el plan. Se completaron **122 lecciones** para cerrar los huecos: 116 unidades nuevas y seis borradores previos desarrollados e integrados. Las adiciones se encuentran en A2 095–133 (39), B1 165–208 (44) y B2 240–278 (39). El plan y su secuencia por capítulo están en `PLAN_CURRICULAR.md`.

## 2. Cambios editoriales sobre material existente

- **139–141:** se sustituyeron los escenarios electorales y de campaña por tareas colaborativas de barrio, estudio y trabajo; se conservaron propuesta, concesión, contraste, razones y argumentación.
- **001 y 031:** se corrigieron glosas y notas de pronunciación identificadas.
- **020, 049 y 085:** se corrigieron títulos ingleses que no correspondían al tema.
- **008:** se restableció en el índice la referencia al ejercicio `no008-7`.
- **134, 209 y 279:** se actualizaron los repasos finales para su posición y cantidad de actividades definitivas. La puntuación se describe como orientativa, no como certificación del nivel.

## 3. Resultado de la revisión archivo por archivo

Se inspeccionaron individualmente los JSON `001`–`279` frente al plan y a los datos que usa la aplicación. La matriz completa, con nivel, títulos, cantidad de bloques y ejercicios y resultado de cada archivo, está en `REVISION_279_LECCIONES.md`.

Controles realizados en cada archivo: título bokmål y títulos español/inglés frente al plan; asignación de capítulo; tipos de bloque compatibles; IDs y coincidencia con el índice; presencia de glosas de vocabulario en español e inglés, sus referencias y presencia en el diccionario; una sola respuesta correcta en ejercicios cerrados; modelos de escritura; presencia de traducciones NO/ES/EN en diálogos y lecturas; campos localizados no vacíos. **No se comprobó automáticamente la equivalencia semántica ni la naturalidad de cada traducción.**

**Resultado: 279/279 sin incidencias en estos controles.**

## 4. Validación agregada

- 279 archivos JSON numerados consecutivamente y 279 entradas de índice.
- 36 capítulos con capítulos de lección e índice alineados.
- 3.771 entradas de diccionario y cobertura de todas las palabras listadas por las lecciones.
- 1.600 IDs de ejercicio; cero duplicados.
- Cero bloques incompatibles, errores de respuestas cerradas, modelos abiertos ausentes, traducciones faltantes, errores de esquema, discrepancias de índice o títulos fuera del plan.
- Cero alertas en el control léxico de neutralidad y cero caracteres de reemplazo en los JSON.
- Se detectaron dos frases breves idénticas heredadas: **«Ha det!»** en 001/003 y **«Ja, her er den.»** en 049/058. Son fórmulas funcionales; no se encontraron lecturas o diálogos completos duplicados en el control exacto.

La revisión de neutralidad es una búsqueda de términos y una inspección focalizada de 139–141; no pretende decidir qué temas pueden estudiarse en un curso de idiomas.

## 5. Revisión lingüística humana pendiente

La comprobación anterior verifica estructura, referencias y presencia de traducciones; no asegura su equivalencia semántica ni la naturalidad del noruego. En una auditoría autocrítica posterior encontré y corregí errores claros en ejemplos de 031, 134, 139, 141, 230 y 279 (entre ellos, *vocal* por *vowel*, una traducción incorrecta de **ta hensyn til**, y una glosa errónea de **forbehold**). Esto demuestra que el pase de 279/279 era estructural y no una revisión lingüística real. Es probable que queden errores similares en otras lecciones, especialmente en material heredado. Conviene una revisión semántica completa por una persona competente; no se ha realizado.

La variedad de producción propuesta es bokmål escrito. Nynorsk aparece solo en comparaciones señaladas; los dialectos se presentan como variación legítima. Los niveles son una organización editorial inspirada en descriptores comunicativos y no una acreditación MCER.

## 6. Archivos de seguimiento

- `AUDITORIA_CURRICULAR.md`: hallazgos iniciales y criterios de intervención.
- `PLAN_CURRICULAR.md`: mapa de objetivos y títulos de las 279 lecciones.
- `REVISION_279_LECCIONES.md`: matriz individual de los 279 JSON.
- `REVISION_SEMANTICA.md`: bitácora de la segunda pasada editorial por lección; avance actual 005/279.
- `PROGRESO_REVISION.md`: estado resumido y límite pendiente de revisión experta.
