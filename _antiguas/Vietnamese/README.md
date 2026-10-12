# Libro interactivo de vietnamita

Web estática para aprender vietnamita como un libro: lecciones con explicaciones, diálogos y
ejercicios, y una tutora chibi en pixel art que explica cada frase. Sin servidor ni dependencias;
se publica en GitHub Pages.

## Abrirla en local
- **Windows:** doble clic en `iniciar.cmd` (arranca un pequeño servidor en PowerShell).
- **Con Python o Node:** `python -m http.server` o `npx serve` en esta carpeta, y abrir la dirección que indique.

Abrir `index.html` con doble clic no funciona: el navegador no deja cargar las lecciones sin servidor.

## Añadir o editar lecciones
Cada lección es un archivo en `lecciones/` (`001.json`, `002.json`…). El formato está en
[`notes/formato-lecciones.md`](notes/formato-lecciones.md).

Para comprobarlas todas de golpe (hace falta Node):

```
node scripts/comprobar-lecciones.mjs
```

GitHub lo hace solo en cada subida: si una lección tiene errores, la web no se publica
y en la pestaña **Actions** sale el archivo y la línea exacta.

## Otras notas
- [`ENCARGO.md`](ENCARGO.md): qué es el proyecto y cómo se trabaja en él.
- [`notes/dudas.md`](notes/dudas.md): puntos de vietnamita pendientes de revisar con un nativo.
- [`notes/supabase.md`](notes/supabase.md): cuentas y progreso en la nube.
