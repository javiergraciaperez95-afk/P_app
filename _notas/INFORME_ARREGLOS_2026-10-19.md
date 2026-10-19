# Paglot · Informe de arreglos (19-10-2026)

Análisis en profundidad de la app en 30 áreas, con datos medidos y comparado con Duolingo, LingoDeer y similares.
Está pensado para dos lectores: **tú**, que decides, y **el ultracode**, que arregla. Cada problema termina en
tareas con identificador (T01, T02…), prioridad, tipo, archivos y cómo comprobar que está bien.

---

## 0. Instrucciones para el ultracode (léelas antes de tocar nada)

**Dónde está todo.** La app web está en la raíz del repo: `index.html`, `js/`, `css/`, `juegos/`, `cursos/`, `assets/`.
`_apk/` es la APK (Capacitor), `_herramientas/` los scripts, `_notas/` los informes. No crees subcarpetas para la app.

**Cómo se prueba.** Servidor estático: `node <scratchpad>/estatico.mjs <raíz> 8300` o «Abrir Paglot.cmd» (puerto 8100).
Hay dos auditorías que hay que volver a pasar al terminar y que no deben empeorar:
- `python _herramientas/auditar_estatico.py` → `_notas/auditoria/estatico.json`
- `node _herramientas/auditar_navegador.mjs 8300` → `_notas/auditoria/navegador.json`

**Reglas que no se negocian** (vienen del usuario; romperlas es peor que no arreglar):
1. **Móvil (≤ 700 px) = diapositivas, sin scroll de página, las que hagan falta pero sin cargarse el arte** (corregido
   por el usuario el 19-10: no hay un máximo de 5). Cada diapositiva es una escena de
   la web **recolocada** para el formato vertical, de borde a borde y del alto exacto entre la cabecera y la barra ◀ ▶
   (`--pm-alto`). **Nunca se arregla encogiendo**: si `paginas-movil.js` aplica `zoom`, salen franjas a los lados y eso es
   un fallo. Los tamaños se calculan con el alto (`clamp(min, calc(var(--h) * k), max)`). Se agrupa con `DIAPOSITIVAS`
   en `js/app.js` y el CSS va en `css/movil.css` bajo `html.pm-activo`. Ejemplo bueno: la portada (5 diapositivas).
2. **Animaciones solo con `transform` y `opacity`.** En el ordenador se mantiene el estilo «a saltos» (`steps()`); en el
   móvil `js/suave.js` lo suaviza solo.
3. **Textos siempre con `t('clave')`** y la clave en `js/i18n/en.js`, `es.js` **y** `vi.js`. Cada curso se explica en
   dos idiomas: **el de español, en inglés y vietnamita; todos los demás, en español e inglés** (regla del 19-10). El
   contenido de los cursos lleva `{"@es": …, "@en": …}` donde cambia (ver `js/lessons.js`, `elegirIdiomaContenido`).
4. **Pensado para personas con déficit de atención**: todo lo que se pulsa responde (sonido + animación), nada se completa
   solo con tocar, lo fallado vuelve; sin culpa ni presión (nada de «has perdido tu racha»). La tutora no pone cara
   «apurada» ante un error del alumno.
5. **Traducciones automáticas = beta**, y se dice.
6. Comprueba en **322×645, 360×740, 390×844 y 412×915**, con tema claro y oscuro, y en escritorio 1280×900.

**Tipos de tarea:** **[M]** mecánica, la puede hacer el ultracode de una vez · **[V]** visual, hacer y enseñar captura
antes/después para aprobar · **[D]** necesita una decisión del usuario antes de tocar nada.
**Prioridad:** **P0** rompe la experiencia o pierde datos · **P1** importante · **P2** mejora clara · **P3** detalle.

---

## 1. Resumen: lo más importante que está mal

| # | Problema | Dato | Tarea |
|---|---|---|---|
| 1 | **El modo juego casi no existe fuera del español.** Solo se activa si la lección tiene diálogo + vocabulario + lectura a la vez | Lecciones con modo juego: es 100 %, zh 94 %, el 79 %, ro 73 %, sv 60 % … fr 5 %, ru 5 %, en 6 %, ko 7 %, it 2 %, da 2 %, vi 2 %, pl 2 %, nl 0 % | T01 |
| 2 | **En modo juego se saltan bloques enteros**: los de traducción y las tablas no tienen juego y desaparecen | 6.288 bloques `traduccion` + 1.555 `tabla` (≈13 % del contenido) | T02, T03 |
| 3 | **El curso de vietnamita está 100 % en español** y el de inglés en un 71 %, pero la interfaz solo es inglés o vietnamita | vi: 14.409 textos sin inglés; en: 3.716 de 5.253 | T10 |
| 4 | **Las explicaciones beta comparan con el español** («le (el), la (la)», «como en español») aunque el alumno lee en inglés | Visto en fr/010; patrón en los 18 cursos traducidos | T11 |
| 5 | **La nube puede borrar progreso de otro dispositivo**: al subir manda la copia de todos los cursos tal como se bajó al abrir | `js/nube.js` · `paraSubir()` usa `cursosNube` del arranque | T20 |
| 6 | **Cada pantalla descarga 5,3 MB y ~180 peticiones en frío**, también la portada | `diccionario.json` 2,6 MB, `lecciones.json` 484 KB, los dos idiomas de interfaz (274 KB), 54 hojas CSS, 103 módulos JS | T30–T33 |
| 7 | **Pantallas del móvil que se pasan de 5 diapositivas o se encogen** | sobre 12 (zoom 0,78) · escuelas 10 (0,83) · empresas 10 (0,74) · perfil 11 · tienda 7 · contacto (0,80) · mapa 26 capítulos · frases 50 páginas | T40–T47 |
| 8 | **El globo de la tutora tapa el contenido** en el móvil (mapa, perfil, repaso, lección) y en la lección de escritorio | capturas | T48 |
| 9 | **No hay cobros, ni analítica, ni avisos de errores, ni tests, ni CI** | 0 tests · 0 analítica · precios «Muy pronto» | T60–T66 |
| 10 | **Cursos muy desiguales** y sin nivel MCER por lección fuera del español | th 3 lecciones · zh 93 · id 124 · ro 124 · no 157 · pl 229 · fr/nl/da con 96–98 «capítulos» para 300 lecciones | T12–T14 |

Lo que está **bien** y hay que conservar: 21 cursos con 93–325 lecciones (salvo th), 34 minijuegos, tutoras por idioma,
portada móvil a pantalla completa, cuentas sin correo (número de 16 cifras), repaso espaciado, modo calma y texto grande,
1.910 textos de interfaz idénticos en inglés y vietnamita, 0 imports rotos, 0 errores de JSON en 6.000+ lecciones.

---

## 1 bis. Ya arreglado el 19-10 (mientras terminaba la auditoría)

| ID | Qué | Comprobado |
|---|---|---|
| T01 | `hayJuego()`: modo juego en toda lección con algo que jugar | fr/010, ko/050, ru/120, da/200, nl/010, it/100, pl/030, ja/050, vi/100, th/002 abren en modo juego sin errores |
| T02 | Los bloques `traduccion` se juegan: ejercicio, puertas y dianas | fr/010, paso 10 (puertas) |
| T03 | Juego nuevo «tabla» (`juegos/tabla.js`): se toca cada fila para leerla y luego «Entendido» | fr/010, paso 2 |
| T05 | Con T02 y T03 ningún tipo de bloque se queda sin juego (salvo `imagen`, que no se usa) | pasos = bloques en las lecciones probadas |
| T10 | Explicaciones de los cursos vi y en traducidas al inglés con Argos (beta) | ver `auditar_estatico.py` |
| T20 | La nube relee los demás cursos justo antes de subir | `probar_nube.py`: todo bien |
| T21 | El SQL de las cuentas vuelve al repo: `_herramientas/supabase-cuentas.sql` | — |
| T18 | Falsa alarma: «Empezar repaso» ya está desactivado sin tarjetas (solo se parece al activo) | — |

Nuevo visto al probar: en las tablas de los cursos beta las cabeceras siguen en español («Masculino, Femenino») y hay
traducciones flojas («un/une» → «a, a»). Entra en T11.

## 1 ter. Estado al cierre del 19-10 (segunda tanda de arreglos)

### Hecho

| Qué | Tareas |
|---|---|
| **Todos los cursos en español e inglés** (el de español, en inglés y vietnamita): interfaz en español nueva (`js/i18n/es.js`), el español original de las explicaciones recuperado de git y el inglés de máquina al lado (beta), elegido al cargar según la interfaz | T10 y regla nueva |
| Inglés de máquina rehecho donde estropeaba las letras del curso (ja, ko, zh, ru, el, th, vi: unas 12.000 explicaciones) y sin inventos en los títulos que ya estaban en el idioma del curso | — |
| Modo juego en toda lección jugable; juegos para traducción y tablas | T01 T02 T03 T05 |
| La nube relee los demás cursos antes de subir; límites de escritura en el SQL (falta ejecutarlo en Supabase) | T20 T21 T23 |
| Portada en frío más ligera: el diccionario (2,6 MB) solo en lección, cuaderno y bienvenida; páginas y pantallas menos usadas con `import()`; solo el idioma de interfaz en uso | T30 T31 T32 |
| CSP con hashes, service worker con versión y límite, comprobaciones en GitHub Actions (`comprobar.py`, también la CSP) y prueba de humo (una lección de cada curso en sus dos idiomas, en Chrome), `publicar.py` (una hoja de estilos y la versión puesta); las pruebas automáticas ya no crean cuentas en la nube | T22 T33 T35 T60 T61 |
| 15 animaciones a `transform`/`opacity`; fuente pixel en woff2 | T34 T37 |
| Frases: de 31.646 a 536 nodos; Repaso: el motivo junto al botón desactivado | T38 T18 |
| Móvil sin encoger en 322×645, 360×740 y 390×844 (y 412×915): Sobre, Escuelas, Empresas, Tienda (vuelve la puerta con la tendera), Contacto, Perfil, Precios, FAQ, Guías, Laboratorio, Social, Regala Max, Legal y Créditos; texto y escena en diapositivas distintas en los móviles bajitos; las reglas de la portada ya no se cuelan en otras páginas | T39 T40 T41 T42 T43 T44 T45 |
| La tutora deja abajo el hueco que ocupa de verdad y, en el móvil, se pliega a solo su cara al rato de hablar | T48 T29 |
| Mapa del móvil: índice de capítulos desde la barra ◀ ▶ | T47 |
| Prueba de nivel opcional (`#/prueba`), ofrecida en el mapa mientras hay menos de tres lecciones hechas | T50 |
| Capítulos de 8–12 lecciones y nivel A1–B2 en los cursos beta (francés: de 98 a 33 capítulos) | T12 |
| «Ordena las palabras» en 530 lecciones beta que no tenían ejercicio de producción | T14 |
| Un día de descanso por semana en la racha; sin contador de fallos a la vista en la lección | T53 T58 |
| Avisos de la APK para cualquier curso en es/en/vi y hora del recordatorio elegible en Ajustes | T52 |
| Herramientas nuevas: `probar_cursos.mjs` (una lección de cada curso en sus dos idiomas), `diapositivas.mjs` (hoja de contactos de las diapositivas), `foto.mjs`, `juntar_es_en.py`, `retraducir_protegido.py`, `sin_traducir_lo_ajeno.py`, `agrupar_capitulos.py`, `anadir_ordenar.py` | — |

Ya estaban hechos: T17 (la tutora explica cómo instalar la voz al pulsar escuchar; el Perfil dice si la hay), T19 (cada
tarjeta del cuaderno enseña su nivel con puntos), T59 (0 botones sin nombre en la auditoría).

### Pendiente de ti (no se puede hacer sin tu decisión o tus cuentas)

- **T90–T92, T94, T95, T64, T24** de la sección 6: mensaje, precios, pasarela, social, appId, hosting y aviso legal.
- **T23**: ejecutar `_herramientas/supabase-cuentas.sql` en Supabase (SQL Editor → pegar todo → Run).
- **T62**: APK de publicación firmada (necesita tu clave de firma y tu cuenta de Google Play). La de prueba está rehecha.
- **T65** analítica (después de elegir hosting) y **T63** prueba en móviles reales.
- **T13**: el curso de tailandés tiene 3 lecciones; ¿se oculta o se queda como «en construcción»?
- Las lecciones de chino y tailandés las está escribiendo otro agente: esta sesión no las ha tocado ni subido.

### Para más adelante (no urgente)

T04 más juegos, T15 listado de lecturas difíciles, T16 «repite en voz alta», T36 tokens de color, T55 compartir,
T56 claves de almacenamiento, T57 páginas por curso y sitemap, T66 informe de errores anónimo (decidir antes si se
mandan datos); revisar las 1.916 explicaciones en inglés que hablan del español (listadas en
`_notas/auditoria/explicaciones_es.json`, T11); en el móvil, la lección en modo libro aún se encoge un 3–8 % en
algunas diapositivas de 322×645 (el modo juego, que es el de siempre, no).

---

## 2. Método

1. **30 áreas** (abajo), en cinco bloques: producto y mercado, contenido, lecciones y juegos, front, técnica.
2. **Análisis de la app con scripts** (repetibles):
   - `_herramientas/auditar_estatico.py`: 103 archivos JS (27.843 líneas), 54 CSS (13.341 líneas), i18n, 21 cursos
     (6.213 lecciones, ≈59.500 bloques), juegos, pesos, `index.html`, config, APK.
   - `_herramientas/auditar_navegador.mjs`: Chrome sin ventana, 28 pantallas × 4 tamaños (390×844, 322×645, 768×1024,
     1280×900): errores, diapositivas y zoom, desbordes, imágenes rotas, botones sin nombre, peticiones y peso; y lecciones
     de 8 cursos en modo juego (bloques frente a pasos). Resultados en el **anexo A**.
   - Lectura del código de los puntos críticos: motor de lección, catálogo de juegos, nube, repaso, voz, avisos, SW.
   - Capturas en el móvil de lección, mapa, perfil, precios, idiomas y repaso.
3. **Referencias de mercado** buscadas en internet (anexo B): Duolingo, LingoDeer, Busuu, Babbel, Memrise, Drops, Mondly.
4. **Razonamiento**: para cada área, qué hay, qué hacen los referentes, qué está mal y por qué, y qué hacer.

---

## 3. Los referentes en una tabla

| | Duolingo | LingoDeer | Busuu | Babbel | Memrise / Drops / Mondly | **Paglot hoy** |
|---|---|---|---|---|---|---|
| Escala | 58,7 M usuarios/día, 12,7 M de pago (T2 2026); 1.040 M$ de ingresos 2025 | 4,8★ App Store (27 k), 4,4★ Play (448 k) | — | — | Drops: 50 idiomas | sin usuarios aún |
| Precio | Super ≈ 60–96 $/año; Max ≈ 168 $/año | 14,99 $/mes · 79,99 $/año · 159,99 $ de por vida | plan gratis + Premium | ≈ 8,95 $/mes (anual) · ≈ 300 € de por vida | — | Plus 14,99 €/año · **Max 399 €/año** · «Muy pronto» |
| Primera sesión | lección **antes** de crear cuenta; elegir nivel / prueba | prueba de nivel | prueba de nivel | prueba de nivel | — | bienvenida + elegir idioma; **sin prueba de nivel** |
| Formato de lección | una acción por pantalla, barra de progreso, «Comprobar» abajo, sonido y animación en cada respuesta | ejercicios variados, «Test out» | — | — | Drops: 5 min visuales | 34 minijuegos (solo en ≈ 20 % de lecciones fuera del español) |
| Gramática | «Explain My Answer» gratis desde el 1-1-2026 en los cursos grandes | **su punto fuerte**: explicaciones claras | — | — | Drops: sin gramática | explicaciones largas (modo libro), la tutora explica cada frase |
| Hablar | Video Call y Roleplay con IA (Max) | práctica de habla | compañero de conversación IA (2026), correcciones de nativos | Babbel Speak (IA) | Mondly: reconocimiento de voz | **nada** (solo escuchar con la voz del dispositivo) |
| Repaso | regresión de vida media (HLR, +12 % de actividad en su A/B) | repaso personalizado | — | — | — | SM-2 simplificado |
| Hábito | racha, protector, ligas semanales, **rachas con amigos** (+22 % de lección diaria) | — | — | — | — | racha, hucha, cofres, logros, reto; **sin amigos**, aviso fijo a las 19:00 |
| Nivel | Duolingo Score + MCER (A1–A2 completos, B1 en curso) | — | **certificados MCER** (es/en/fr A1–C1) | — | — | MCER solo en español |
| Sin conexión | sí (Super) | sí | sí (IA offline 2026) | — | — | APK sí; web: lo ya abierto |

Lo que **no** hay que copiar: la presión de la racha y las ligas (un estudio de IDC 2026 sobre Duolingo habla de
«obligación gamificada» y «deriva del objetivo»: se acaba jugando para no perder la racha, no para aprender), los muros de
pago agresivos (la queja n.º 1 de LingoDeer) y vender caro contenido sin revisar.

---

## 4. Las 30 áreas

Formato: **Estado** (datos) · **Referencia** · **Qué está mal y por qué** · **Tareas**.

### A. Producto y mercado

#### 1. Propuesta de valor y posicionamiento
- **Estado.** Paglot = tutora pixel que explica cada frase + minijuegos + pensado para déficit de atención + cuenta sin correo.
  21 idiomas, interfaz en inglés y vietnamita.
- **Referencia.** Duolingo gana en hábito y escala; LingoDeer en gramática clara; Busuu en certificados y nativos.
- **Mal.** La promesa diferencial («la tutora te explica cada frase», «sin presión») solo se cumple en el curso de español:
  en 20 cursos el alumno ve un libro estático en un 80–100 % de las lecciones y explicaciones pensadas para hispanohablantes.
  Hoy el producto real es «un buen curso de español para anglófonos y vietnamitas + 20 cursos beta».
- **Tareas.** **T90 [D] P1** decidir el mensaje: ¿«aprende español» (lo que está terminado) con los demás como beta
  visible, o «21 idiomas»? Recomiendo lo primero hasta cerrar T01–T03 y T10–T11.

#### 2. Precios y monetización
- **Estado.** Gratis / Plus 14,99 €/año / Max 399 €/año, pagos «Muy pronto», hucha (días de Plus con anuncios), tienda,
  regalos. Precios por región.
- **Referencia.** Duolingo Max ≈ 168 $/año; LingoDeer 79,99 $/año y 159,99 $ de por vida; Babbel ≈ 300 € de por vida.
  Google Play permite desde el 30-6-2026 cobro alternativo/enlace web en EE. UU., Reino Unido y EEE con 10 % en suscripciones
  (15 % con Play Billing); Apple anuncia tarifas más bajas en la UE con pagos alternativos desde el 1-10-2026 (sin confirmar).
- **Mal.** Max a 399 €/año está 2,4× por encima de Duolingo Max sobre contenido beta; la hucha necesita ≈ 1.000 anuncios al
  año por usuario y choca con la promesa de privacidad (ya señalado el 18-10). Sin pasarela no hay ingresos.
- **Tareas.** **T91 [D] P1** fijar precios (propuesta: Plus 39–59 €/año, Max ≤ 149 €/año o quitar Max hasta que haya
  contenido propio) · **T92 [D] P2** pasarela: comerciante registrado en web (Paddle / Lemon Squeezy) + facturación
  alternativa de Play · **T93 [M] P2** cuando haya decisión: botones de pago reales y límites de Plus, detrás de una
  bandera en `js/config.js`.

#### 3. Onboarding y primera sesión
- **Estado.** Portada → «Empezar» → bienvenida (paseo) → elegir idioma → mapa. Cuenta anónima automática (bien). No hay
  prueba de nivel ni objetivo diario.
- **Referencia.** Duolingo: lección antes de cuenta; elegir nivel o prueba; objetivo diario. LingoDeer/Busuu/Babbel: prueba.
- **Mal.** Quien ya sabe algo empieza en «¡Hola!» y se aburre en la lección 1 (abandono temprano). Hay muchas pantallas
  antes de la primera acción real.
- **Tareas.** **T50 [M] P1** prueba de nivel opcional («Ya sé algo»): 12–15 preguntas sacadas de los ejercicios existentes
  de cada capítulo, que salta al capítulo adecuado · **T51 [V] P2** acortar el camino portada → primera lección a 2 toques
  (la bienvenida, después de la primera lección).

#### 4. Retención y hábito
- **Estado.** Racha, hucha, cofres, logros, misiones, reto, repaso diario. APK: aviso fijo a las 19:00.
- **Referencia.** Duolingo: racha + protector + rachas con amigos (+22 %); limitan las notificaciones.
- **Mal.** Hora del aviso fija (no sirve a quien estudia por la mañana); no hay «racha sin culpa» (protector/descanso
  automático); no se puede elegir objetivo diario pequeño (2–5 min), clave para déficit de atención.
- **Tareas.** **T52 [M] P1** hora del aviso elegible en Ajustes y textos sin culpa · **T53 [M] P2** días de descanso
  (la racha se pausa, no se rompe) · **T54 [M] P2** objetivo diario (1 lección / 5 min / 10 min).

#### 5. Social y comunidad
- **Estado.** Páginas «Social» y «Comunidad» son estáticas; no hay amigos ni compartir progreso.
- **Referencia.** Rachas con amigos (Duolingo), correcciones de nativos (Busuu).
- **Mal.** Nada social real; la página «Social» promete más de lo que hay.
- **Tareas.** **T94 [D] P3** decidir si hay social en la v1. Mínimo barato: **T55 [M] P3** «compartir mi racha/logro»
  con imagen generada (Web Share API), sin cuentas de amigos.

#### 6. Marca e identidad
- **Estado.** Paglot, pixel art, tutoras por idioma. Restos del nombre antiguo: appId `com.javiergp.idiomas`, repo
  `Learning_language_app`, 19 claves de almacenamiento mezcladas `idiomas-*` / `paglot-*`.
- **Mal.** El appId no se puede cambiar después de publicar en Play.
- **Tareas.** **T95 [D] P1** decidir el appId definitivo antes de subir a Play (p. ej. `app.paglot`) · **T56 [M] P3**
  unificar claves de almacenamiento con migración (leer las viejas una vez y borrarlas).

#### 7. SEO, ASO y adquisición
- **Estado.** SPA con rutas `#/…` (no indexables), `meta description` y Open Graph sí, sin `sitemap`, sin páginas por idioma.
- **Referencia.** Mercado ≈ 24.000 M$ (2026), 316 M de descargas de apps de idiomas en 2024: se compite en tiendas y SEO.
- **Mal.** Google no ve «Aprender coreano gratis» ni ninguna página de curso; sin ficha de tienda preparada.
- **Tareas.** **T57 [M] P3** generar páginas estáticas por curso (`/aprender/<idioma>/`) con título, descripción y
  enlace a la app, más `sitemap.xml` · **T96 [D] P3** textos e imágenes de la ficha de Play.

### B. Contenido pedagógico

#### 8. Currículo y progresión MCER
- **Estado.** es: 320 lecciones en 26 capítulos con nivel A1–B2 por lección. Resto: 93–325 lecciones, `nivel` vacío,
  capítulos irregulares (fr 98, nl 98, da 96, pl 79 «capítulos» para 229–304 lecciones; th 1 capítulo de 3 lecciones).
- **Referencia.** Duolingo y Busuu alinean con MCER y lo enseñan; Busuu da certificados.
- **Mal.** Sin nivel no se puede decir «estás en A2», ni hacer prueba de nivel por capítulo; capítulos de 3 lecciones
  rompen el mapa (26–98 diapositivas en el móvil).
- **Tareas.** **T12 [M] P2** reagrupar los capítulos de los cursos beta en bloques de 8–12 lecciones y asignar nivel MCER
  por posición (y comprobar con el vocabulario), en `cursos/<c>/indice/lecciones.json` · **T13 [D] P1** qué hacer con th
  (3 lecciones) y los cursos < 150 (zh, id, ro, no): ocultar, «en construcción» o completar.

#### 9. Calidad de las lecciones
- **Estado.** 0 JSON rotos. Media 10–13 bloques por lección. Reparto global: test 17.610 · huecos 7.972 · explicación
  7.355 · traducción 6.288 · vocabulario 5.080 · ordenar 4.200 · diálogo 3.710 · texto 2.954 · escribir 2.480 · tabla 1.555.
- **Mal.** Demasiado reconocimiento (test = 30 %) y muy poca producción: fr tiene 1 ejercicio de escribir en 300
  lecciones, vi 0. Ya se vio (18-10) que hay lecturas A1 con gramática de B1 en español.
- **Tareas.** **T14 [M] P2** generar ejercicios de producción (escribir/ordenar) a partir del vocabulario y los diálogos de
  cada lección en los cursos que tengan < 1 por lección · **T15 [M] P2** revisar con script las lecturas cuyo vocabulario
  o gramática supere el nivel del capítulo.

#### 10. Traducciones e idioma de las explicaciones
- **Estado.** 18 cursos traducidos es→en con Argos (beta). **vi y en no se tradujeron**: sus explicaciones siguen en
  español (vi: 14.409 textos; en: 3.716 de 5.253). Interfaz: 1.910 claves en en y vi, idénticas (bien).
- **Mal.** Un usuario con la interfaz en inglés que elige vietnamita no entiende nada; uno con la interfaz en vietnamita
  no tiene ningún curso explicado en vietnamita salvo el de español.
- **Tareas.** **T10 [M] P0** pasar `_herramientas/traducir_cursos_en.py` al curso vi (es→en) y al curso en (es→en, las
  explicaciones), con la etiqueta beta · **T97 [D] P2** ¿explicaciones en vietnamita para los cursos (es→vi o en→vi)?

#### 11. Explicaciones pensadas para hispanohablantes
- **Estado.** Las explicaciones de los cursos beta comparan con el español: «le (el), la (la), les (los, las)», «h muda»,
  «como en español».
- **Mal.** Al traducirlas al inglés quedan comparaciones sin sentido para quien no sabe español.
- **Tareas.** **T11 [M] P1** script que detecte en los campos de explicación traducidos: paréntesis con artículos o
  palabras españolas, «Spanish/español», «h muda», etc.; quitar los paréntesis con equivalencias españolas y marcar el
  resto en un listado para revisión (`_notas/auditoria/explicaciones_es.json`).

#### 12. Audio y pronunciación
- **Estado.** Sin grabaciones: voz del dispositivo (`speechSynthesis`); si no hay voz para el idioma, los botones de
  escuchar se ocultan. Sin reconocimiento de voz.
- **Referencia.** Todos los grandes tienen práctica oral (Babbel Speak, Busuu IA, Duolingo Video Call, Mondly).
  `webkitSpeechRecognition` funciona en Chrome (también Android) mandando el audio a Google; no en todos los navegadores.
- **Mal.** Hablar es la habilidad que más se echa en falta (ya salió en el informe del 18-10). En muchos Android faltan
  voces de th, el, ro…: el curso queda mudo sin avisar.
- **Tareas.** **T16 [M] P2** ejercicio «Repite en voz alta» con reconocimiento cuando exista (detectado, nunca obligatorio,
  sin puntuar mal por el reconocedor) · **T17 [M] P2** aviso claro y enlace a instalar la voz cuando el curso no tiene voz.

#### 13. Repaso espaciado y cuaderno
- **Estado.** SM-2 simplificado; tarjetas por palabra guardada; reto de velocidad con 8+ palabras.
- **Referencia.** Duolingo usa regresión de vida media y la enseña como «fuerza» de cada palabra.
- **Mal.** Funciona, pero el alumno no ve la fuerza de sus palabras; el botón «Empezar repaso» parece activo con 0 tarjetas.
- **Tareas.** **T18 [M] P3** desactivar «Empezar repaso» sin tarjetas · **T19 [M] P3** barra de fuerza por palabra en el cuaderno.

#### 14. Práctica, frases, reto y conversación
- **Estado.** Práctica, Frases (2.596 en español; 50 «páginas» en el móvil), Reto, Cuaderno.
- **Mal.** Frases en 50 diapositivas no es usable; no hay práctica de conversación guiada.
- **Tareas.** **T45 [V] P1** Frases en el móvil: buscador + temas + una frase por tarjeta, ≤ 5 diapositivas por tema.

### C. Lecciones y juegos

#### 15. Catálogo de minijuegos
- **Estado.** 34 módulos, todos registrados. Juegos por tipo de bloque: diálogo 6 · vocabulario 5 · texto 5 · gramática 4 ·
  explicación 2 · test 2 · huecos 2 · ordenar 1 · escribir 1 · **traducción 0 · tabla 0**.
- **Mal.** Los tipos más frecuentes (test 30 %, huecos 13 %, traducción 11 %) son los que menos juegos tienen; los
  diálogos (6 %) tienen 6. Se repite siempre lo mismo justo en los ejercicios.
- **Tareas.** **T02 [M] P0** juego para `traduccion` (reutilizar `ejercicio.js` como test/escribir según tenga opciones) ·
  **T03 [M] P0** juego para `tabla` (pizarra con la tabla, paso de lectura que se completa al tocar cada fila) ·
  **T04 [M] P2** 2–3 juegos más para test/huecos/ordenar reutilizando mecánicas ya hechas (dianas, globos, tren…).

#### 16. Motor de la lección
- **Estado.** `juegos/motor.js`: pasos, pausa, «Paso X de Y», estrellas por fallos, lo fallado vuelve. `hayJuego()` exige
  diálogo + vocabulario + texto; si un bloque no tiene juego, `continue` (se pierde).
- **Mal.** Ver resumen 1 y 2. Además, en el móvil queda un hueco grande entre el paso y «Atrás / Siguiente», y la fila de
  pasos se sale por la derecha.
- **Tareas.** **T01 [M] P0** `hayJuego()`: modo juego en toda lección con ≥ 1 bloque jugable · **T05 [M] P0** el motor
  nunca descarta un bloque: si no hay juego, paso de lectura genérico · **T46 [V] P1** lección en el móvil a pantalla
  completa (paso + botones pegados, fila de pasos compacta) siguiendo la regla 1.

#### 17. Gamificación
- **Estado.** Hucha (moneda «0» en la cabecera), cofres, logros, estrellas, misiones.
- **Mal.** En la cabecera del curso, «0» y «⇄» no se explican (¿qué es? ¿qué hace?). En el escritorio el aviso de
  progreso de la lección («Exercises 0/8 · Correct 0 · Mistakes 0») contradice el «sin presión».
- **Tareas.** **T58 [M] P2** etiquetas y `title`/`aria-label` claros en la hucha y el cambio de curso; texto «Ejercicios
  0/8» sin contar fallos a la vista.

#### 18. Accesibilidad
- **Estado.** `lang` dinámico (bien), modo calma, texto grande, `prefers-reduced-motion`. Ver anexo A para botones sin
  nombre.
- **Referencia.** Hay quejas documentadas de Duolingo con lectores de pantalla («Siguiente» sin contexto).
- **Mal.** Las diapositivas no anuncian el cambio de página; la pausa (`<dialog>`) no devuelve el foco; feedback de
  acierto/fallo solo visual y sonoro.
- **Tareas.** **T59 [M] P2** `aria-live` para «Diapositiva n de N» y para acierto/fallo; devolver el foco al cerrar
  diálogos; nombre accesible en todos los botones de icono.

### D. Front

#### 19. Móvil en diapositivas
- **Estado.** Portada: 5 diapositivas a pantalla completa (modelo a seguir). Resto: ver anexo A (diapositivas y zoom).
- **Mal.** En 390×844: sobre 12 (zoom mín. 0,78), escuelas 10 (0,83), empresas 10 (0,74), perfil 11 (0,91), tienda 7
  (0,85), contacto (0,80), guías (0,86), FAQ (0,83), laboratorio (0,61), mapa 26 capítulos, frases 50. En 322×645 es
  bastante peor: sobre 20, perfil 21, empresas 16, escuelas 12, tienda 11, legal 11, contacto (0,53), laboratorio (0,54),
  regala-max (0,63), social (0,72), y repaso y reto se desplazan. Precios cabe porque se encoge solo (mismo problema).
- **Tareas (todas [V], regla 1, una pantalla por entrega con capturas):** **T40 P1** Sobre · **T41 P1** Escuelas ·
  **T42 P1** Empresas · **T43 P1** Perfil (identidad y racha · cuenta · ajustes y comodidad · logros · datos) ·
  **T44 P2** Tienda · **T45 P1** Frases · **T47 P1** Mapa de lecciones: un selector de capítulos en vez de 26
  diapositivas (capítulo actual + lista compacta) · **T39 P1** Contacto, Guías, FAQ, Laboratorio, Social, Regala Max,
  Legal y Precios sin zoom en 322×645 · **T29 P1** Repaso y Reto sin scroll en 322×645.

#### 20. Escritorio y tableta
- **Estado.** Escritorio correcto en general. Tableta (701–980 px): sin diapositivas; ver anexo A.
- **Mal.** En la lección de escritorio el globo de la tutora tapa el final del contenido.
- **Tareas.** **T48 [M] P1** el globo de la tutora nunca tapa: reservar su hueco abajo (`padding-bottom` del alto real
  del globo) o plegarlo a solo la cara tras unos segundos, en móvil y escritorio.

#### 21. Navegación y arquitectura de información
- **Estado.** Curso: «Lecciones · Cuaderno · Repaso» + hucha + ⇄ + Ajustes + Cuenta. Práctica, Frases, Reto y Perfil
  quedan escondidos. El manual pedía «Aprender · Practicar · Cuaderno».
- **Tareas.** **T98 [D] P2** decidir la navegación del curso; **T49 [V] P2** aplicarla (en el móvil, barra inferior de
  3–4 iconos grandes).

#### 22. Animación y fluidez
- **Estado.** 254 `@keyframes`, 402 `steps()`; 15 animaciones mueven propiedades que recalculan la página (anchos,
  márgenes, sombras, `clip-path`…): `ac-hoy, aleteo, bv-avanza, cm-cofre-aviso, inicio-polvo, jg-brillo, pr-desenrolla,
  pr-despliega, pr-firmar, pr-llenar, pr-subraya, rc-barra, rc-bombillas, rc-linea, rp-pista`.
- **Tareas.** **T34 [M] P2** pasar esas 15 a `transform`/`opacity` (regla 2).

#### 23. Estados vacíos, errores, carga y sin conexión
- **Estado.** Vista de error genérica; repaso vacío bien explicado; SW «primero la red» que guarda todo lo que se abre.
- **Mal.** Sin conexión en la web solo funciona lo ya abierto, sin aviso; la caché crece sin límite (los cursos pesan 83 MB).
- **Tareas.** **T35 [M] P2** SW con versión, precarga del armazón (HTML, CSS, JS, fuentes) y límite de caché para cursos;
  aviso «sin conexión» cuando falle una lección no guardada.

### E. Técnica

#### 24. Arquitectura del código
- **Estado.** ES modules sin empaquetar: 103 JS (27.843 líneas), 54 CSS (13.341). Más grandes: `i18n/vi.js` y `en.js`
  (2.0 k líneas cada uno), `styles.css` (1.8 k), `precios.css` (1.2 k), `inicio.css` (1.2 k), `lessons.js` (1.1 k).
  `app.js` mezcla rutas, cabecera, diapositivas y pie. 0 imports rotos, 0 `console.log`, 9 `innerHTML` (datos propios).
- **Mal.** Todo se importa al arrancar (también la vista de precios en la portada); 986 colores hex distintos y 155
  `!important` (difícil de mantener el tema).
- **Tareas.** **T31 [M] P1** `import()` dinámico por ruta en `GENERALES` y en las vistas del curso · **T36 [M] P3**
  tokens de color en `css/cabecera.css` y sustituir los hex repetidos.

#### 25. Rendimiento de carga
- **Estado.** En frío, cualquier pantalla: ≈ 180 peticiones, ≈ 5,3 MB (JSON 3,1 MB, JS 1,4 MB, CSS 0,7 MB). El
  `?v=__VERSION__` no se sustituye en la web (solo en la APK).
- **Referencia.** Una portada de app debería pesar < 1 MB.
- **Tareas.** **T30 [M] P0** no cargar `diccionario.json` ni `lecciones.json` del curso en las pantallas generales; partir
  el diccionario por capítulo o cargarlo al abrir la primera lección · **T32 [M] P1** cargar solo el idioma de interfaz
  activo (`i18n/en.js` o `vi.js`) · **T33 [M] P1** paso de publicación: concatenar/minificar CSS y JS (esbuild) con hash
  en el nombre, y sustituir `__VERSION__` · **T37 [M] P2** fuentes en `woff2` (PixelifySans es `ttf`, 77 KB).

#### 26. Cuentas, nube y sincronización
- **Estado.** Número de 16 cifras, progreso por curso en Supabase (`{version:3, cursos:{}}`), unión sin pérdidas dentro
  de un curso (mejores estrellas, cofres, logros).
- **Mal.** `paraSubir()` manda los demás cursos tal como estaban al arrancar: un segundo dispositivo puede pisarlos. El
  SQL de Supabase no está en el repo.
- **Tareas.** **T20 [M] P0** subir solo el curso cambiado (RPC `paglot_guardar_curso(p_numero, p_curso, p_datos)` que
  actualiza `datos->'cursos'->curso` en el servidor) o releer y unir antes de escribir · **T21 [M] P1** guardar el SQL
  en `_herramientas/supabase.sql` y ampliar `probar_nube.py` con la prueba de dos dispositivos.

#### 27. Seguridad y legal
- **Estado.** Sin CSP; clave pública de Supabase en `js/config.js` (normal); funciones `paglot_*`; aviso de datos sin
  cookies de seguimiento.
- **Mal.** Sin CSP; sin límite de peticiones a las funciones (un bot puede probar números o llenar la base).
- **Tareas.** **T22 [M] P1** CSP en `index.html` (solo el propio origen + Supabase) · **T23 [M] P1** límite por IP / número
  en las funciones SQL y tamaño máximo de `p_datos` · **T24 [D] P1** revisar el aviso legal con las cuentas por número
  y la región de Supabase.

#### 28. Calidad, tests y CI
- **Estado.** 0 tests, 0 CI. Hay scripts sueltos de revisión.
- **Tareas.** **T60 [M] P1** GitHub Actions: `node --check` de todos los JS, paridad de claves en/vi, validación de
  lecciones (`auditar_estatico.py` con umbrales que fallen) · **T61 [M] P2** prueba de humo en Chrome sin ventana
  (`auditar_navegador.mjs` reducido: 0 errores de consola, 0 zoom en móvil, ≤ 5 diapositivas).

#### 29. APK y PWA
- **Estado.** Capacitor, `com.javiergp.idiomas`, versionCode 4 / 1.0.3, solo build de depuración (27 MB), aviso diario
  fijo, voz con plugin TTS.
- **Tareas.** **T95 [D] P1** appId definitivo · **T62 [M] P1** build de publicación firmada (keystore fuera del repo),
  versionCode automático, `generar-apk.cmd` que lo haga todo · **T63 [M] P2** probar en 2 móviles reales (voz, avisos,
  sin conexión).

#### 30. Analítica y operación
- **Estado.** Sin analítica, sin informes de errores, sin despliegue automático de la web; dónde se publica la web no
  está decidido (hay `.nojekyll`: GitHub Pages, pero el repo es privado).
- **Mal.** Sin datos no se puede saber dónde se abandona.
- **Tareas.** **T64 [D] P1** hosting de la web (propuesta: Cloudflare Pages, gratis, con brotli y cabeceras) ·
  **T65 [M] P1** analítica sin cookies (Plausible/Umami) con 6 eventos: abrir, empezar lección, terminar lección, repaso,
  día 1 y día 7 · **T66 [M] P2** `window.onerror` → tabla `paglot_errores` (anónima, sin datos personales).

---

## 5. Lista de tareas para el ultracode, en orden

Primero P0 mecánicas, luego P1 mecánicas. Las [V] se hacen de una en una con capturas; las [D] no se tocan hasta que
el usuario decida.

| ID | P | Tipo | Qué | Archivos | Hecho cuando… |
|---|---|---|---|---|---|
| T01 | P0 | M | Modo juego en toda lección con ≥ 1 bloque jugable | `juegos/motor.js` (`hayJuego`) | % de lecciones con modo juego = 100 % en los 21 cursos (script) |
| T05 | P0 | M | El motor nunca descarta un bloque (paso de lectura si no hay juego) | `juegos/motor.js` | pasos = bloques en todas las lecciones (script) |
| T02 | P0 | M | Juego para `traduccion` | `juegos/catalogo.js`, `juegos/ejercicio.js` | fr/010 muestra su bloque de traducción en modo juego |
| T03 | P0 | M | Juego para `tabla` | `juegos/catalogo.js`, `juegos/pizarra.js` | fr/010 muestra la tabla de artículos en modo juego |
| T10 | P0 | M | Traducir al inglés las explicaciones de los cursos vi y en (beta) | `_herramientas/traducir_cursos_en.py`, `cursos/vi`, `cursos/en` | `trad_en_falta` = 0 en vi y en |
| T20 | P0 | M | La nube sube solo el curso cambiado | `js/nube.js`, SQL | prueba de dos dispositivos en `probar_nube.py` |
| T30 | P0 | M | Diccionario y lecciones del curso solo cuando hacen falta | `js/app.js`, `js/lessons.js`, `js/curso.js` | portada en frío < 1 MB |
| T11 | P1 | M | Quitar equivalencias españolas de las explicaciones traducidas y listar el resto | script nuevo, `cursos/*/lessons` | listado en `_notas/auditoria/explicaciones_es.json` |
| T31 | P1 | M | Vistas con `import()` por ruta | `js/app.js` | la portada no pide `precios.js` |
| T32 | P1 | M | Solo el idioma de interfaz activo | `js/i18n.js` | no se pide `vi.js` con la interfaz en inglés |
| T33 | P1 | M | Publicación: CSS/JS empaquetados con hash; `__VERSION__` sustituido | script nuevo, `index.html` | ≤ 10 peticiones de CSS/JS en frío |
| T38 | P1 | M | Frases: paginar o virtualizar la lista (2.596 frases, 31.640 nodos) | `js/vistas/frases.js` | < 2.000 nodos en Frases |
| T48 | P1 | M | El globo de la tutora nunca tapa contenido | `css/movil.css`, `js/tutor.js` | ningún botón ni texto bajo el globo en las 28 pantallas |
| T50 | P1 | M | Prueba de nivel opcional | vista nueva, `js/app.js` | lleva al capítulo según aciertos |
| T52 | P1 | M | Hora del aviso elegible, textos sin culpa | `_apk/puente.js`, Ajustes | se guarda y reprograma |
| T21 | P1 | M | SQL en el repo + prueba de dos dispositivos | `_herramientas/` | — |
| T22 | P1 | M | CSP | `index.html` | 0 errores de CSP en la auditoría |
| T23 | P1 | M | Límites en las funciones de Supabase | SQL | — |
| T60 | P1 | M | CI en GitHub Actions | `.github/workflows/` | falla si hay JSON roto o claves sin traducir |
| T62 | P1 | M | APK de publicación firmada | `_apk/` | `app-release.apk` firmada |
| T65 | P1 | M | Analítica sin cookies (tras T64) | `index.html`, `js/app.js` | eventos visibles en el panel |
| T12 | P2 | M | Capítulos de 8–12 lecciones y nivel MCER en los cursos beta | `cursos/*/indice/lecciones.json` | ningún capítulo < 6 lecciones |
| T14 | P2 | M | Ejercicios de producción donde falten | script, `cursos/*/lessons` | ≥ 1 escribir/ordenar por lección |
| T15 | P2 | M | Detectar lecturas por encima del nivel | script | listado |
| T16 | P2 | M | «Repite en voz alta» con reconocimiento opcional | juego nuevo | se oculta si no hay reconocimiento |
| T17 | P2 | M | Aviso cuando falta la voz del curso | `js/sonidos.js` | — |
| T34 | P2 | M | 15 animaciones a `transform`/`opacity` | `css/*` | `animaciones_no_transform` vacío |
| T35 | P2 | M | SW con versión, armazón y límite | `sw.js` | — |
| T37 | P2 | M | Fuente pixel en `woff2` | `assets/fonts` | — |
| T53 | P2 | M | Días de descanso de la racha | `js/progress.js` | — |
| T54 | P2 | M | Objetivo diario | Ajustes | — |
| T58 | P2 | M | Hucha y ⇄ explicados; sin contador de fallos a la vista | `js/cabecera.js` | — |
| T59 | P2 | M | `aria-live`, foco en diálogos, nombres accesibles | varios | `sinNombre` = 0 en la auditoría |
| T61 | P2 | M | Prueba de humo en CI | `.github/` | — |
| T63 | P2 | M | Prueba en móviles reales | — | — |
| T66 | P2 | M | Informe de errores anónimo | `js/app.js`, SQL | — |
| T04 | P2 | M | 2–3 juegos más para test/huecos/ordenar | `juegos/` | — |
| T18 | P3 | M | «Empezar repaso» desactivado sin tarjetas | `js/vistas/repaso.js` | — |
| T19 | P3 | M | Fuerza por palabra en el cuaderno | `js/vistas/cuaderno.js` | — |
| T36 | P3 | M | Tokens de color | `css/` | — |
| T55 | P3 | M | Compartir racha/logro | — | — |
| T56 | P3 | M | Unificar claves de almacenamiento | `js/*` | — |
| T57 | P3 | M | Páginas estáticas por curso + sitemap | script | — |
| T29, T39–T47, T49, T51 | P1–P2 | V | Pantallas del móvil y navegación (ver áreas 19 y 21) | `css/movil.css`, `js/app.js` | regla 1, capturas aprobadas |

## 6. Decisiones que necesito de ti

| ID | Decisión | Mi recomendación |
|---|---|---|
| T90 | Mensaje: «aprende español» o «21 idiomas» | español primero, el resto como beta visible |
| T91 | Precios | Plus 39–59 €/año; Max ≤ 149 €/año o sin Max hasta tener contenido propio |
| T92 | Pasarela | comerciante registrado (Paddle o Lemon Squeezy) + cobro alternativo de Play |
| T13 | Cursos pequeños (th 3, zh 93, id 124, ro 124, no 157) | ocultar th; el resto «en construcción» |
| T95 | appId de Android | `app.paglot` (antes de publicar) |
| T97 | Explicaciones en vietnamita | más adelante; antes, inglés en todo |
| T98 | Navegación del curso | Aprender · Practicar · Cuaderno · Perfil |
| T64 | Hosting de la web | Cloudflare Pages |
| T94 | Social en la v1 | solo «compartir» |
| T24 | Revisión del aviso legal | sí, antes de publicar |

---

## Anexo A. Medidas en el navegador

Chrome sin ventana, sin caché, curso de español, interfaz en inglés, 28 pantallas × 4 tamaños (`_notas/auditoria/navegador.json`).
⚠ = más de 5 diapositivas, se encoge (zoom < 1) o la página se desplaza en el móvil.

| Pantalla | Móvil 390×844 | Móvil 322×645 | Tableta 768 (alto) | Escritorio (alto · nodos) | Errores | Sin nombre |
|---|---|---|---|---|---|---|
| inicio | 5 diap. · zoom 1.00 | 5 diap. · zoom 1.00 | 4502 px | 4139 px · 2104 | 0 | 0 |
| entrar | 1 pantalla | 1 pantalla | 1982 px | 1869 px · 565 | 0 | 0 |
| precios | 1 pantalla | 1 pantalla | 6133 px | 5656 px · 1075 | 0 | 0 |
| sobre | 12 diap. · zoom 0.78 ⚠ | 20 diap. · zoom 0.71 ⚠ | 8372 px | 6203 px · 824 | 0 | 0 |
| social | 4 diap. · zoom 1.00 | 4 diap. · zoom 0.72 ⚠ | 2354 px | 2376 px · 602 | 0 | 0 |
| contacto | 3 diap. · zoom 0.80 ⚠ | 4 diap. · zoom 0.53 ⚠ | 2479 px | 2205 px · 549 | 0 | 0 |
| producto | 2 diap. · zoom 1.00 | 4 diap. · zoom 1.00 | 2116 px | 2101 px · 439 | 0 | 0 |
| escuelas | 10 diap. · zoom 0.83 ⚠ | 12 diap. · zoom 0.65 ⚠ | 4858 px | 4191 px · 675 | 0 | 0 |
| empresas | 10 diap. · zoom 0.74 ⚠ | 16 diap. · zoom 0.62 ⚠ | 5440 px | 4659 px · 668 | 0 | 0 |
| regala-max | 4 diap. · zoom 1.00 | 6 diap. · zoom 0.63 ⚠ | 2965 px | 2309 px · 525 | 0 | 0 |
| tienda | 7 diap. · zoom 0.85 ⚠ | 11 diap. · zoom 0.77 ⚠ | 5157 px | 4040 px · 715 | 0 | 0 |
| guias | 3 diap. · zoom 0.86 ⚠ | 7 diap. · zoom 0.76 ⚠ | 2420 px | 2105 px · 552 | 0 | 0 |
| faq | 2 diap. · zoom 0.83 ⚠ | 4 diap. · zoom 0.80 ⚠ | 2289 px | 2210 px · 480 | 0 | 0 |
| laboratorio | 2 diap. · zoom 0.61 ⚠ | 3 diap. · zoom 0.54 ⚠ | 2334 px | 2384 px · 544 | 0 | 0 |
| idiomas | 1 pantalla | 1 pantalla | 1024 px | 900 px · 772 | 0 | 0 |
| creditos | 1 pantalla | 2 diap. · zoom 1.00 | 1545 px | 1530 px · 431 | 0 | 0 |
| legal | 5 diap. · zoom 0.99 | 11 diap. · zoom 0.98 ⚠ | 3373 px | 3306 px · 474 | 0 | 0 |
| bienvenida | 1 pantalla | 1 pantalla | 1024 px | 900 px · 593 | 0 | 0 |
| no-existe | 1 pantalla | 1 pantalla | 1511 px | 1522 px · 419 | 0 | 0 |
| lecciones | 26 diap. · zoom 1.00 ⚠ | 26 diap. · zoom 1.00 ⚠ | 4442 px | 3897 px · 886 | 0 | 0 |
| leccion/001 | 1 pantalla | 1 pantalla | 1024 px | 900 px · 483 | 0 | 0 |
| leccion/150 | 1 pantalla | 1 pantalla | 1024 px | 900 px · 492 | 0 | 0 |
| practica | 1 pantalla | 1 pantalla | 1024 px | 900 px · 421 | 0 | 0 |
| frases | 50 diap. · zoom 0.96 ⚠ | 91 diap. · zoom 0.92 ⚠ | 28329 px | 28132 px · 31640 | 0 | 0 |
| cuaderno | 2 diap. · zoom 1.00 | 3 diap. · zoom 0.99 ⚠ | 1024 px | 900 px · 451 | 0 | 0 |
| repaso | 1 pantalla | scroll 870 px ⚠ | 1024 px | 900 px · 436 | 0 | 0 |
| reto | 1 pantalla | scroll 712 px ⚠ | 1024 px | 900 px · 424 | 0 | 0 |
| perfil | 11 diap. · zoom 0.91 ⚠ | 21 diap. · zoom 0.86 ⚠ | 4069 px | 3770 px · 762 | 0 | 0 |

**Otras alertas**

- Ninguna: 0 errores de consola, 0 imágenes rotas, 0 desbordes laterales y 0 botones sin nombre en las 28 pantallas y los 4 tamaños.

**Lecturas.**
1. Todas las pantallas cargan ≈ 5,3 MB y 172–204 peticiones en frío (área 25).
2. Frases pinta las 2.596 frases a la vez: 31.640 nodos y 28.000 px de alto en escritorio. Ver el área 14, la tarea T45 y
   **T38 [M] P1**: paginar o virtualizar la lista.
3. Los fallos son de diseño y peso, no de código: la base está sana.

**Modo juego por curso** (lecciones con diálogo + vocabulario + texto, condición actual de `hayJuego()`):
es 100 % · zh 94 % · el 79 % · ro 73 % · th 67 % · sv 60 % · id 29 % · ja 27 % · de 24 % · tr 21 % · pt 9 % · ko 7 % ·
en 6 % · fr 5 % · ru 5 % · no 3 % · da 2 % · it 2 % · pl 2 % · vi 2 % · nl 0 %.

## Anexo B. Fuentes

- Duolingo Max y funciones: [blog.duolingo.com/duolingo-max](https://blog.duolingo.com/duolingo-max) ·
  [StoryLearning, Duolingo Max review](https://storylearning.com/duolingo-max-review) ·
  [Video Call para Super (prueba)](https://duolingoguides.com/duolingo-video-call-super-subscribers/) ·
  [Duolingo updates](https://blog.duolingo.com/duolingo-updates/)
- Métricas de Duolingo: [carta a accionistas](https://duolingo.gcs-web.com/static-files/3c8277ee-bc94-4f5d-9b77-0db3e46f88b8) ·
  [Q2 2026](https://allmind.ai/earnings/event/2940676) · [estadísticas 2026](https://voxbooster.com/blog/language-learning-statistics-2026)
- Rachas y amigos: [Friend Streak](https://blog.duolingo.com/friend-streak/) · [funciones sociales](https://blog.duolingo.com/friends-social-features/) ·
  [Lenny's Newsletter, rachas](https://lennysnewsletter.com/p/behind-the-product-duolingo-streaks)
- Repaso espaciado: [How we learn how you learn](https://blog.duolingo.com/how-we-learn-how-you-learn) ·
  [Settles y Meeder, ACL 2016](https://preview.aclanthology.org/fix_video/P16-1174.pdf) · [Ilídio et al. 2026](https://proceedings.mlr.press/v339/ilidio26a.html)
- Onboarding: [Appcues, onboarding de Duolingo](https://goodux.appcues.com/blog/duolingo-user-onboarding) ·
  [UX Planet](https://uxplanet.org/duolingo-ux-analysis-9631ff3f4eb1) · [925studios 2026](https://www.925studios.co/blog/duolingo-design-breakdown)
- Diseño de la lección: [Pratt IxD](https://ixd.prattsi.org/2021/09/design-critique-duolingo-web-app/) ·
  [uxdesign.cc](https://uxdesign.cc/duolingos-usability-analyzed-6bb44b0f2366) · [accesibilidad con lector de pantalla](https://inviocean.com/learn/language-sounds-the-blind-experience-with-duolingo/)
- MCER: [Duolingo Score](https://blog.duolingo.com/duolingo-score/) · [certificados de Busuu](https://help.busuu.com/hc/en-us/articles/16559434818321-What-are-Certificates-and-how-can-I-get-them)
- LingoDeer: [Common Sense Media](https://www.commonsensemedia.org/app-reviews/lingodeer-learn-languages) ·
  [Actual Fluency](https://actualfluency.com/lingodeer-review) · [precios](https://apppricinglab.com/app/apple/1261193709) ·
  [iTechGuides](https://www.itechguides.com/best/language-learning-apps/compare/lingodeer-vs-assimil/)
- Busuu, Babbel, Memrise: [Toolradar](https://toolradar.com/compare/busuu-vs-babbel) · [Babbel, precios](https://testprepinsight.com/resources/how-much-does-babbel-cost/) ·
  [Duolingo, precios](https://toolradar.com/tools/duolingo/pricing)
- Drops y Mondly: [Drops](https://www.alllanguageresources.com/language-drops-app/) · [Mondly 2026](https://lingopie.com/blog/mondly-review/)
- Reconocimiento de voz en el navegador: [soporte de la API](https://www.testmuai.com/learning-hub/speech-recognition-api-browser-support/)
- Críticas a la gamificación: [Deceptive Patterns, IDC](https://deceptive.design/articles/the-evil-bird-and-the-right-to-disconnect-children-s-vulnerability-to-exit-dark-patterns-in-gamified-educational-apps)
- Tiendas: [Google Play, nuevas reglas de cobro](https://adapty.io/blog/google-play-billing-changes-subscriptions-fees) ·
  [Apple/Google en la UE](https://www.makeinfluence.com/en/academy/apple-and-googles-eu-app-store-fee-overhaul-what-it-means-for-creator-subscription-and-tipping-apps)
- Mercado: [Luminix 2026](https://www.useluminix.com/reports/industry-analysis/competitive-landscape-language-learning-apps-and-platforms-2026)

Las cifras de terceros (precios, métricas que no son de Duolingo) cambian por región y promoción: tómalas como orientativas.
