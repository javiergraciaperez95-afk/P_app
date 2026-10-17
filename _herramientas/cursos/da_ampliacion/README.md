# Ampliación del curso de danés

`generar.py` crea las fuentes de autoría para las lecciones nuevas. La compilación conserva los archivos históricos 001–123 y reemplaza solo 124–304.

Secuencia de trabajo desde la raíz del proyecto:

```powershell
py -X utf8 _herramientas/cursos/da_ampliacion/generar.py
py -X utf8 _herramientas/cursos/compilar.py da --fuente _herramientas/cursos/da_ampliacion --ids-globales
py -X utf8 _herramientas/cursos/da_ampliacion/finalizar.py
```

`finalizar.py` conserva los identificadores de archivo para no romper rutas ni progreso, asigna la numeración visible A1→B2 y ordena la metadata de capítulos. Los textos nuevos son materiales didácticos originales; usan ejemplos ficticios o datos históricos estables y se centran en lectura, vocabulario, comprensión literal y ejercicios objetivos. Cada lección nueva incluye un microtexto y una pregunta de comprensión, además de práctica de vocabulario y gramática.
