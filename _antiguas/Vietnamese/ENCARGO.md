# ENCARGO · Libro interactivo de vietnamita con tutora chibi (pixel art)

> Lee este documento entero antes de tocar nada. Es el punto de partida de cada sesión.
> Trabajamos POCO A POCO: no construyas todo de golpe. Al terminar cada fase, PARA,
> explica qué has hecho y espera mi revisión antes de seguir.

## 1. Qué es
Una web estática (GitHub Pages, sin servidor, sin frameworks) para aprender **vietnamita**
como si fuera un **libro interactivo**. Yo te pasaré el contenido de unos libros y lo
organizaremos en **lecciones**. Cada lección es como un capítulo: mezcla explicaciones,
textos/diálogos y **ejercicios dentro de la propia lección**, en el orden en que aparecen
en el libro. Una **tutora chibi en pixel art** acompaña todo: explica cada frase
(traducción, palabra por palabra, pronunciación y gramática) y corrige los ejercicios.

Soy hispanohablante y no soy programador: **toda la interfaz y las explicaciones van en español**,
claras y sin jerga. Responde siempre en español, de forma breve.

## 2. Referencia: proyecto anterior
Ya hice uno parecido para chino (HSK). Reutilizamos las ideas, NO el código a ciegas:
- Datos separados del motor: **cada lección es un JSON** que escribo yo a mano. Formato
  SENCILLO de editar a mano (frases en una línea, pocos campos obligatorios).
- La web descubre sola las lecciones nuevas (001.json, 002.json…) sin scripts.
- Si un JSON tiene errores, la web los muestra en pantalla con el lugar exacto, no se rompe.
- JavaScript vanilla con módulos ES, sin dependencias. Probar en local con un servidor
  (en Windows sin Python ni Node: un pequeño servidor en PowerShell + un .cmd de doble clic).
- Estética pixel art: bordes escalonados, sombras duras, sin bordes redondeados, modo oscuro,
  responsive real (probar a 360 px), accesible (foco visible, botones reales).
- La tutora habla con efecto máquina de escribir en un cuadro de diálogo, abajo, con ella a la
  derecha. Personalidad: segura de sí misma, algo vanidosa, cariñosa y didáctica. Nunca humilla.

## 3. Cómo es una lección (libro interactivo)
Una lección es una **secuencia de bloques** que se leen de arriba abajo, como las páginas de un libro:
- **Explicación**: texto breve en español (gramática, cultura, pronunciación).
- **Texto / diálogo**: frases en vietnamita. Cada frase tiene un sello: al pulsarlo, la tutora
  la explica. Cada palabra muestra al pasar/tocar: palabra, traducción y pronunciación aproximada.
- **Vocabulario**: lista de palabras de la lección.
- **Ejercicio** (dentro de la lección, donde toque según el libro). Tipos para empezar:
  - test de 4 opciones;
  - traducir / elegir el significado de una frase;
  - completar el hueco eligiendo la palabra correcta.
  Cada opción lleva su explicación; si fallas, la tutora te dice por qué.
- La lección se marca como terminada cuando se completan sus ejercicios (o con un botón).

## 4. Lo que hay que hacer AHORA (Fase 1, lo básico)
1. Estructura del proyecto y servidor local.
2. Pantalla inicial: lista de lecciones (título vietnamita + español, marca de "hecha").
3. Vista de lección con los bloques del punto 3 (explicación, texto/diálogo con análisis
   de frases y palabras, vocabulario y los 3 tipos de ejercicio), diálogo de la tutora abajo.
4. Progreso guardado en localStorage (lecciones terminadas, aciertos de los ejercicios).
5. Formato JSON de lección: propón uno sencillo y **explícamelo antes de usarlo**.
   Ojo con el vietnamita: muchas palabras son de 2 sílabas (học sinh, Việt Nam); los tonos
   van en las letras (á, à, ả, ã, ạ).
6. **Dos lecciones de muestra** cortas (por ejemplo, saludos y presentarse), cada una con
   explicación, diálogo, vocabulario y al menos un ejercicio de cada tipo. Si dudas de una
   traducción o un matiz, márcalo en notes/dudas.md, no te lo inventes.
7. Tutora chibi en pixel art dibujada por código en un <canvas> (pequeño, escalado con
   image-rendering: pixelated), animada: respira, parpadea, mueve la boca al hablar, y
   expresiones (normal, pensando, contenta, apurada). Te pasaré imágenes de referencia
   del personaje: úsalas como inspiración de estilo y rasgos; no copies logos ni marcas.

Al terminar la Fase 1: PARA y espera mi revisión.

## 5. Funcionalidades FUTURAS (NO las hagas todavía; solo tenlas en cuenta en el diseño)
- Pronunciación con la voz del navegador (speechSynthesis, voz vi-VN; Edge funciona mejor),
  con aviso y guía si el navegador no tiene voz vietnamita. Ejercicios de escucha.
- Más tipos de ejercicio (ordenar palabras, emparejar, dictado).
- Cuaderno de vocabulario con repaso tipo Anki (repetición espaciada, notas 1–4).
- Medidores de progreso en todas las secciones; perfil (foto, nombre, progreso).
- Cuentas de usuario con Supabase (progreso y cuaderno en la nube) y copia de seguridad en archivo.
- Sonidos 8 bits, ropa intercambiable para la tutora.
- Validador y asistente para escribir los JSON de lecciones más rápido.

## 6. Reglas
- Antes de cambios grandes, resume el plan en pocas líneas y espera mi visto bueno.
- Nada de frameworks ni dependencias. Rutas relativas (para GitHub Pages).
- No generes lecciones en masa: el contenido lo voy metiendo yo; tú, solo las 2 de muestra.
- Si algo choca con este documento, pregunta antes de decidir.
- Al terminar cada fase: qué se hizo, qué falta y cómo probarlo (paso exacto).
- **Sube los cambios directamente a `main`**, sin pull requests (permiso dado por mí). Antes, prueba el cambio y ejecuta `node scripts/comprobar-lecciones.mjs`.

## Referencia visual de la tutora
Chica chibi de pelo largo castaño oscuro con raya al medio, ojos grandes marrones, mejillas
sonrosadas, áo dài color crema con flores de loto rosas y hojas verdes, pantalón lila claro,
zapatos oscuros. Suele llevar un libro verde ("Tiếng Việt") en brazos. Poses: saludando con
puntero, pensando, celebrando, con mochila, abrazando el libro.
