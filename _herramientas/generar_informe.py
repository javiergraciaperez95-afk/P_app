"""Genera el informe en PDF de Paglot (estado, lo que falta, móvil en diapositivas e investigación de mercado).

    python _herramientas/generar_informe.py

Lee _notas/revision_paglot.json (lo escribe revisar_paglot.py), monta un HTML y lo imprime a PDF con Chrome sin ventana.
Salida: _notas/Informe_Paglot_2026-10-18.pdf (y el .html al lado).
"""
import html
import json
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = json.loads((RAIZ / '_notas' / 'revision_paglot.json').read_text(encoding='utf-8'))
HTML = RAIZ / '_notas' / 'Informe_Paglot_2026-10-18.html'
PDF = RAIZ / '_notas' / 'Informe_Paglot_2026-10-18.pdf'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

NOMBRES = {'en': 'Inglés', 'es': 'Español', 'fr': 'Francés', 'de': 'Alemán', 'ja': 'Japonés', 'it': 'Italiano', 'ko': 'Coreano',
           'zh': 'Chino', 'pt': 'Portugués', 'ru': 'Ruso', 'tr': 'Turco', 'nl': 'Neerlandés', 'sv': 'Sueco', 'el': 'Griego',
           'pl': 'Polaco', 'no': 'Noruego', 'vi': 'Vietnamita', 'id': 'Indonesio', 'da': 'Danés', 'ro': 'Rumano', 'th': 'Tailandés'}
e = html.escape


def tabla(cabeza, filas, clase=''):
    th = ''.join(f'<th>{c}</th>' for c in cabeza)
    tr = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in f) + '</tr>' for f in filas)
    return f'<table class="{clase}"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'


# ---------------------------------------------------------------- tablas con los datos medidos
cursos = DATOS['cursos']
otros = [c for c in cursos if c['id'] != 'es']
total_otros = sum(c['lecciones'] for c in otros)
juego_otros = sum(c['con_modo_juego'] for c in otros)
filas_cursos = []
for c in cursos:
    explicado = [x for x in c['traducciones'] if x != c['id']]
    estado = 'Revisado (v2)' if c['esquema2'] == c['lecciones'] else ('Incompleto' if c['lecciones'] < 200 else 'Beta (v1)')
    filas_cursos.append([
        f"<b>{NOMBRES.get(c['id'], c['id'])}</b> ({c['id']})", c['lecciones'], c['esquema2'],
        f"{c['con_modo_juego']} ({round(100 * c['con_modo_juego'] / max(c['lecciones'], 1))} %)",
        ', '.join(explicado) or '—', '✓' if c['frases'] else '<span class="mal">falta</span>', estado])

nav = DATOS['navegador']


def pantallas(lista, nombre):
    filas = []
    for m in lista:
        p = m.get('pantallas') or 0
        if m.get('paginada'):
            nota, clase = 'Ya va por diapositivas', 'bien'
        elif p <= 1.05:
            nota, clase = 'Cabe en una pantalla', 'bien'
        elif p <= 1.5:
            nota, clase = 'Sobra un poco: compactar', 'regular'
        else:
            nota, clase = f'Pasar a diapositivas (~{max(2, round(p))})', 'mal'
        err = '<br>'.join(e(x) for x in m.get('errores', []))
        filas.append([f'#/{m["ruta"]}', f'<span class="{clase}">{p}</span>', nota, err or '—'])
    return f'<h3>{nombre}</h3>' + tabla(['Ruta', 'Pantallas de alto', 'Qué hacer', 'Errores'], filas, 'mini')


pasos = nav['pasos_juego']
filas_pasos = [[f"{p['leccion']}", p['juego'], f"<span class=\"{'bien' if p['pantallas'] <= 1.05 else 'regular'}\">{p['pantallas']}</span>"] for p in pasos]

est = DATOS['estatica']

# ---------------------------------------------------------------- el documento
cuerpo = f"""
<section class="portada">
  <p class="sello">INFORME · 18 de octubre de 2026</p>
  <h1>Paglot</h1>
  <p class="sub">Estado de la app, todo lo que falta por implementar, plan para el móvil en diapositivas
  e investigación de Duolingo, Lingoda y apps parecidas.</p>
  <ul class="datos-portada">
    <li><b>{len(cursos)}</b> cursos · <b>{total_otros + 320:,}</b> lecciones</li>
    <li><b>{len(est['vistas'])}</b> vistas · <b>{len(est['juegos'])}</b> minijuegos · <b>{est['lineas_js']:,}</b> líneas de JS</li>
    <li>Carpeta revisada: <code>Aplicaciones de idiomas desarrolladas\\Paglot</code></li>
  </ul>
  <p class="nota">Datos medidos con <code>_herramientas/revisar_paglot.py</code> (revisión del código y Chrome sin ventana con
  tamaño de móvil 390 × 844). Precios y cifras de la competencia: fuentes públicas a octubre de 2026, con las dudas indicadas.</p>
</section>

<section>
<h2>1. Resumen</h2>
<div class="cajas">
  <div class="caja verde"><h4>Lo que ya está</h4><ul>
    <li>La app completa vuelve a estar montada en <code>Paglot/</code>: los 21 cursos, las {len(est['vistas'])} vistas (las viejas y las nuevas) y los {len(est['juegos'])} minijuegos.</li>
    <li>Lo nuevo se conserva: mapa-camino, estrellas, logros, reto, repaso activo, lecciones más ligeras.</li>
    <li>Cuentas al estilo Mullvad (número de 16 cifras + correo opcional) en <i>Entrar</i> y en el <i>Perfil</i>, con la nube separada por curso.</li>
    <li>Aviso de «beta» la primera vez que se entra en un curso no revisado.</li>
    <li>0 imports rotos. Textos de la interfaz: {est['claves_en']} en inglés, {est['claves_vi']} en vietnamita.</li>
  </ul></div>
  <div class="caja roja"><h4>Lo que más urge</h4><ul>
    <li><b>Supabase</b>: falta ejecutar el SQL y poner <code>{{{{ .Token }}}}</code> en los correos. Sin eso, la nube no funciona.</li>
    <li><b>Los 19 cursos «beta» están explicados en español, no en inglés.</b> Hay que traducirlos (unas {total_otros:,} lecciones).</li>
    <li>Solo <b>{juego_otros} de {total_otros:,}</b> lecciones de esos cursos ({round(100 * juego_otros / total_otros)} %) tienen modo juego; el resto solo se ve como libro.</li>
    <li>En el móvil, <b>8 vistas</b> no caben en la pantalla y hay que pasarlas a diapositivas, y otras 7 hay que compactarlas.</li>
    <li>Precios, tienda, regalos, contacto, escuelas y empresas son <b>decorado</b>: no cobran ni envían nada.</li>
    <li>La APK todavía copia la carpeta <code>Idiomas</code>, no <code>Paglot</code>.</li>
  </ul></div>
</div>
<p><b>Orden que recomiendo</b> (detalle en el apartado 6): 1) cerrar la base (Supabase, errores, commit, APK); 2) el sistema
de diapositivas del móvil y las 8 vistas largas; 3) los cursos en inglés y con modo juego; 4) cobrar (Paglot Max) con la
tienda de Google; 5) dar servidor a contacto, regalos, escuelas y empresas. La investigación de mercado (apartado 5) apoya
este orden: lo que retiene a la gente es la lección diaria corta y la racha, y lo que paga es una suscripción sin límites.</p>
</section>

<section>
<h2>2. Estado actual de la carpeta Paglot</h2>
<h3>2.1 Pantallas (rutas)</h3>
<p><b>De la web</b> (sin curso elegido también existen): {', '.join('#/' + r for r in est['rutas_generales'])}.</p>
<p><b>Del curso</b>: lecciones, lección, práctica, frases, cuaderno, repaso, reto, perfil, bienvenida (y #/desarrollador).</p>
<p><b>Ya van por diapositivas en el móvil</b> (js/paginas-movil.js): {', '.join(est['paginadas_movil'])}.</p>

<h3>2.2 Los 21 cursos</h3>
<p>«v2» es el formato nuevo (catálogos de traducción aparte, el del español). «Modo juego» = la lección trae diálogo,
vocabulario y lectura, que es lo que pide el motor de minijuegos; las demás solo se ven en modo libro.
«Explicado en» = idiomas en los que vienen las explicaciones y los significados (sin contar el idioma que se estudia).</p>
{tabla(['Curso', 'Lecciones', 'v2', 'Con modo juego', 'Explicado en', 'Frases', 'Estado'], filas_cursos, 'cursos')}
<p class="nota">Según mis notas del 18-10, había versiones v2 del vietnamita (300 lecciones) y del danés (304) hechas con
scripts en <code>_fabrica</code> (ahora en <code>posible_old/Nueva carpeta</code>). Podrían sustituir a las v1 de esos dos cursos.</p>
</section>

<section>
<h2>3. Lo que falta por implementar</h2>
<p>Prioridad: <span class="p0">P0</span> bloquea el uso o puede perder datos · <span class="p1">P1</span> necesario para publicar ·
<span class="p2">P2</span> mejora. Las horas son una estimación de trabajo mío, con margen.</p>

<h3>3.1 Base técnica</h3>
{tabla(['', 'Qué falta', 'Detalle', 'Horas'], [
 ['<span class="p0">P0</span>', 'Activar Supabase', 'Ejecutar <code>Para_lodriga/paglot-cuentas.sql</code> (ahora en posible_old) en el SQL Editor y poner <code>{{ .Token }}</code> en las plantillas «Magic Link» y «Confirm signup». Hasta entonces todas las llamadas devuelven 404 y el progreso solo vive en el móvil. Lo tienes que hacer tú (3 minutos).', '0,1 (tú)'],
 ['<span class="p0">P0</span>', 'Probar la nube de verdad', 'Con el SQL puesto: subir, entrar con número en otro dispositivo, unir correo, recuperar, borrar, caducidad de 7 días. El formato nuevo guarda cada curso por separado (<code>{{version: 3, cursos: {{…}}}}</code>) y lee el antiguo como español. Sin probar contra la base real.', '2'],
 ['<span class="p0">P0</span>', 'Decidir qué carpeta manda y hacer commit', 'Paglot es una copia de Idiomas con lo recuperado (93 MB). Git ve además ~1.600 archivos borrados en la raíz (_herramientas, _notas, Para_lodriga…), que se movieron a <code>posible_old</code>. Propuesta: Paglot sustituye a Idiomas, y lo de posible_old se saca del repositorio o se ignora.', '1'],
 ['<span class="p0">P0</span>', 'APK desde Paglot', '<code>_apk/copiar.mjs</code> copia <code>../Idiomas</code>. Cambiarlo a Paglot. Con 21 cursos la APK pasa de ~12 MB a ~50–60 MB; a medio plazo, descargar cada curso al elegirlo.', '1 + 6'],
 ['<span class="p1">P1</span>', 'Frases del español', '<code>cursos/es/phrases/frases.json</code> no existe: la pantalla Frases sale vacía en español (404). Generarla desde las lecciones v2 o quitar la pestaña en ese curso.', '2'],
 ['<span class="p1">P1</span>', 'Error en una lección de japonés', '<code>#/leccion/050</code> de japonés: <code>tr(...).split is not a function</code> (un texto viene con un formato que no espera). Revisar con la auditoría de todo el curso.', '1'],
 ['<span class="p1">P1</span>', 'Portada en el móvil', 'Se recuperó la portada vieja (teatro de idiomas) y mide 7,2 pantallas en el móvil. La de la versión solo-español cabía en una. Hay que juntar las dos (ver apartado 4).', '4'],
 ['<span class="p1">P1</span>', 'Textos sin traducir', f"Faltan {est['n_faltan_vi']} textos en vietnamita ({', '.join(est['faltan_vi'][:7])}). La interfaz está en inglés y vietnamita; los otros 10 idiomas de interfaz de antes no se recuperaron (pediste solo inglés).", '0,5'],
 ['<span class="p1">P1</span>', 'Auditoría completa', 'La de español pasó entera en inglés (320/320) antes de recuperar las pantallas; la vietnamita se cortó en la 212 por mis cambios. Falta pasarla otra vez y pasarla a los 20 cursos recuperados.', '3 (máquina)'],
 ['<span class="p2">P2</span>', 'Perfil y Entrar duplican la cuenta', 'Las dos pantallas enseñan el número y el correo. Dejar la gestión completa en Entrar y en el Perfil solo un resumen con enlace.', '1'],
])}

<h3>3.2 Contenido de los cursos</h3>
{tabla(['', 'Qué falta', 'Detalle', 'Horas'], [
 ['<span class="p0">P0</span>', 'Explicaciones en inglés', f'Pediste que los 19 cursos vayan con traducción al inglés, pero vienen explicados en español (títulos, explicaciones, significados de las palabras, traducciones de diálogos y ejercicios). Son {total_otros:,} lecciones. Plan: pasar cada curso a v2 (catálogos aparte, como el español) y generar <code>traducciones/en</code> con los scripts de la fábrica y el «botón rojo», revisando por muestreo. El curso de vietnamita ya tiene la explicación en español (el par es↔vi que querías).', '30–60 (casi todo máquina)'],
 ['<span class="p1">P1</span>', 'Modo juego para todos', f'Solo {juego_otros} lecciones de los cursos beta traen diálogo + vocabulario + lectura. Las demás no tienen modo juego. Opciones: a) reestructurar cada lección a la estructura fija de 12 bloques (como el español); b) que el motor monte un modo juego más corto con lo que haya (vocabulario + ejercicios). Recomiendo b) ya y a) curso a curso.', 'b) 8 · a) 20–40 por curso'],
 ['<span class="p1">P1</span>', 'Cursos incompletos', 'Tailandés (3 lecciones), chino (93), indonesio y rumano (124), noruego (157). Marcarlos «próximamente» o avisar en el aviso beta de cuántas lecciones hay.', '1'],
 ['<span class="p1">P1</span>', 'Revisión nativa', 'Español y vietnamita: revisión por nativos (pendiente desde antes). Resto: al menos un muestreo por curso antes de quitar el aviso beta.', 'externo'],
 ['<span class="p2">P2</span>', 'Voz', 'La app lee con la voz del dispositivo. En algunos móviles no hay voz de tailandés, vietnamita o griego; ya hay un aviso. Audio grabado o voz en la nube sería de pago.', '—'],
])}

<h3>3.3 Pantallas recuperadas que ahora son solo decorado</h3>
<p>Se ven y se pueden tocar, pero no tienen nada detrás (ni servidor ni pagos). Lo marco para que no se publiquen como si funcionaran.</p>
{tabla(['', 'Pantalla', 'Qué hace hoy', 'Qué haría falta', 'Horas'], [
 ['<span class="p1">P1</span>', 'Precios / Paglot Max', 'Planes por zona (ZONAS en config.js), comparativa y botones «Próximamente». El límite gratis de 3 lecciones nuevas al día no se aplica.', 'Google Play Billing (y App Store si hay iOS) para suscripciones; en la web, Stripe. Guardar el plan en Supabase y aplicar los límites. Plazas «Fundadores» reales.', '20–30'],
 ['<span class="p1">P1</span>', 'Contacto', 'El formulario valida y dice que se ha enviado, pero no manda nada.', 'Tabla en Supabase con una función que solo inserte, o un servicio de correo (p. ej. Resend). Protección contra spam.', '3'],
 ['<span class="p1">P1</span>', 'Aviso legal y privacidad', 'Titular vacío (TITULAR en config.js) y texto del sistema viejo (correo + contraseña, API propia).', 'Reescribir para cuentas por número, Supabase como encargado, borrado a los 7 días, correo opcional, datos en el dispositivo. Rellenar el titular. Ficha de datos de Google Play.', '4 + tus datos'],
 ['<span class="p2">P2</span>', 'Tienda', 'Catálogo y cesta, sin pago ni envío; los productos no existen.', 'Decidir si hay tienda. Si sí: Shopify/Stripe Checkout + impresión bajo demanda.', '15+'],
 ['<span class="p2">P2</span>', 'Regala Max', 'Elegir regalo y ver la caja; no genera ni canjea códigos.', 'Códigos en Supabase, compra con Stripe, canje en Entrar.', '8'],
 ['<span class="p2">P2</span>', 'Escuelas / Empresas', 'Calculadora de precios por tramos.', 'Formulario de contacto comercial, panel de profesor (grupos, progreso), facturación.', '40+'],
 ['<span class="p2">P2</span>', 'Laboratorio de ideas, Social, Guías, FAQ', 'Contenido fijo.', 'Votos guardados en Supabase; enlaces reales a redes; revisar la FAQ para las cuentas con número.', '6'],
])}
</section>

<section>
<h2>4. El móvil en diapositivas (sin scroll)</h2>
<p>Regla: en el teléfono ninguna pantalla se desplaza. Lo que no cabe se reparte en <b>diapositivas</b> del alto de la pantalla,
con ◀ ▶, puntos de posición y deslizar el dedo. Ya existe <code>js/paginas-movil.js</code> y lo usan 11 páginas. Medido con Python
en un móvil de 390 × 844:</p>
<div class="dos">
{pantallas(nav['sin_curso'], 'Sin curso elegido')}
{pantallas(nav['curso_es'], 'Dentro del curso de español')}
</div>
{pantallas(nav['curso_fr'], 'Dentro del curso de francés (formato v1)')}

<h3>4.1 Recuento</h3>
{tabla(['Grupo', 'Vistas', 'Cuántas', 'Cómo'], [
 ['<span class="mal">Pasar a diapositivas</span>', 'Portada (7,2), Lecciones/mapa (5,2 en español, 10,1 en francés), Perfil (6,1), Aviso legal (5,7), Créditos (2,8), Página perdida (2,5), Lección en modo libro (11,8 en francés), Cuaderno (lista larga con muchas tarjetas)', '<b>8</b>', 'Ver 4.2'],
 ['<span class="regular">Compactar</span>', 'Elegir idioma (1,18), Precios (1,17), Repaso (1,13), Frases (1,15), Cuaderno vacío (1,38), Entrar en móviles bajos, Bienvenida en móviles bajos', '<b>7</b>', 'Menos márgenes, tutora más pequeña, textos en desplegables'],
 ['<span class="regular">Pasos de minijuego</span>', 'Desorden (1,40), Teléfono (1,24), Máquina (1,23), Subrayador (1,20), Dianas (1,19), Escucha (1,13), Tren (1,12), Rescate (1,11)', '<b>8 juegos</b>', 'Tablero flexible que se encoge; el pie ya va fijo'],
 ['<span class="bien">Ya caben</span>', 'Las 11 páginas paginadas, Entrar, Práctica, Reto, Bienvenida, Lección en modo juego (1,05)', '<b>16</b>', '—'],
])}

<h3>4.2 Cómo lo haría</h3>
<ol>
<li><b>Un solo módulo de diapositivas</b> (evolución de <code>paginas-movil.js</code>): la vista marca sus trozos con
<code>data-diapo</code> y el módulo los reparte midiendo el alto real (si un trozo no cabe, se parte en dos). Navegación con
◀ ▶, puntos, deslizar el dedo (pointer events), flechas del teclado y el botón «atrás» del móvil (la diapositiva va en la
dirección, <code>#/perfil?d=3</code>). Animación solo con <code>transform</code>/<code>opacity</code>, con sonido al pasar
(<code>data-sonido</code>), y sin animación si el sistema pide movimiento reducido.</li>
<li><b>Mapa de lecciones</b>: una diapositiva por capítulo (el camino del capítulo entero), con deslizar a izquierda/derecha
para cambiar de capítulo y el panel de misiones/cofres como primera diapositiva.</li>
<li><b>Perfil</b>: una diapositiva por sección: cuenta · actividad (calendario) · niveles · logros · ajustes.</li>
<li><b>Cuaderno</b>: las tarjetas en «mazos» de 6 por diapositiva, con el buscador fijo arriba.</li>
<li><b>Lección en modo libro</b>: un bloque por diapositiva (explicación, diálogo, vocabulario…), que es como ya funciona el modo juego.</li>
<li><b>Portada</b>: recuperar la versión del móvil sin scroll de la app solo-español (<code>inicioMovil</code>) y añadirle el teatro de idiomas como segunda diapositiva.</li>
<li><b>Aviso legal y créditos</b>: un apartado por diapositiva con un índice como primera.</li>
<li><b>Comprobación automática</b>: ampliar <code>revisar_paglot.py</code> para que falle si alguna ruta mide más de 1,02 pantallas en 360 × 640, 390 × 844 y 412 × 915.</li>
</ol>
<p><b>Estimación</b>: módulo 6 h · mapa 6 h · perfil 3 h · cuaderno 4 h · libro 3 h · portada 4 h · legal y créditos 2 h ·
compactar 7 vistas 5 h · 8 minijuegos 6 h · comprobación 2 h. <b>Total ≈ 41 h.</b></p>

<h3>4.3 Pasos de minijuego medidos (español, lecciones 001 y 150)</h3>
{tabla(['Lección', 'Juego', 'Pantallas'], filas_pasos, 'mini')}
</section>

<section>
<h2>5. Investigación: Duolingo, Lingoda y apps parecidas</h2>

<h3>5.1 Duolingo (el líder)</h3>
<ul>
<li><b>Cifras 2025</b> (informe anual a la SEC): ingresos de <b>1.037,6 M$</b> (+39 %), reservas de 1.158,4 M$, ~<b>52,7 M</b> de usuarios
diarios en el 4.º trimestre (+30 %) y <b>12,2 M</b> de suscriptores de pago (~9 % de los usuarios). Para 2026 esperan +20 % de usuarios diarios.</li>
<li><b>Cómo gana dinero</b>: suscripciones (la gran mayoría), anuncios en el plan gratis, el examen Duolingo English Test y compras
dentro de la app (gemas). Crece porque la gente se pasa a planes más caros (Max y Familia).</li>
<li><b>Planes</b>: Gratis (todo el curso, con anuncios y energía limitada) · <b>Super</b> (sin anuncios, energía ilimitada, sin
conexión; en EE. UU. ~12,99 $/mes u ~84 $/año, con mucho A/B testing y precios por país) · <b>Familia</b> (~120 $/año, hasta 6
cuentas) · <b>Max</b> (~30 $/mes o ~168 $/año: videollamada con una IA, «Roleplay» y «Explícame mi respuesta»).</li>
<li><b>Mecánicas</b>: un camino de unidades por niveles del MCER, lecciones cortas (normalmente 15 ejercicios), racha diaria con
protectores, ligas semanales por XP, misiones diarias y con amigos, gemas, cofres y la «Duolingo Score». En 2025 cambió los
<b>corazones</b> (perder uno por fallo) por <b>energía</b> (se gasta al hacer ejercicios y se recupera con el tiempo o acertando seguido),
porque los corazones frustraban a los principiantes.</li>
<li><b>Polémica 2025</b>: anunció ser «AI-first» y dejar de usar colaboradores externos para lo que pudiera hacer la IA; dobló el número
de cursos en menos de un año con IA. Hubo mucha crítica por calidad y por los trabajadores, y el CEO tuvo que matizar.</li>
<li><b>Lección para Paglot</b>: lo que retiene es el hábito (lección corta + racha + recordatorio). Los cursos hechos deprisa con
IA se critican: el aviso de «beta» de Paglot va en la buena dirección, pero conviene revisarlos antes de promocionarlos.</li>
</ul>

<h3>5.2 Lingoda (escuela online con profesores)</h3>
<ul>
<li>Clases en directo con profesores titulados, en grupos pequeños o individuales, con temario por niveles del MCER.
Pocos idiomas (inglés, alemán, francés, español, a veces italiano e inglés de negocios).</li>
<li>Se paga por paquetes mensuales de clases. Orientativo: grupo ~11–23 $ por clase, individual ~23–48 $. El alemán y el inglés de negocios cuestan más.</li>
<li><b>Sprint</b>: un reto de asistencia; si vas a todas las clases del mes te devuelven el 50 % (si faltas a una, lo pierdes).
Es una forma muy eficaz de comprometer al alumno con dinero.</li>
<li>Lección para Paglot: los profesores reales son caros de montar. Un «Sprint» sin dinero (reto de 30 días con premio) sí se puede copiar.</li>
</ul>

<h3>5.3 Otras apps</h3>
{tabla(['App', 'Modelo', 'Precio orientativo', 'Lo que tienen', 'Para Paglot'], [
 ['<b>Babbel</b>', 'Suscripción; primera lección gratis; vitalicia', '~14 $/mes · ~83 $/año · vitalicia 200–300 $ · Babbel Live (clases en grupo ilimitadas) ~99 $/trimestre', 'Cursos hechos por lingüistas, diálogos realistas, repaso', 'La vitalicia «Fundadores» ya está pensada en Paglot'],
 ['<b>Busuu</b> (Chegg)', 'Freemium + Premium / Premium Plus', '~10–14 $/mes', 'Correcciones de hablantes nativos (comunidad), IA de conversación en Premium Plus', 'La comunidad que corrige encaja con «Social»'],
 ['<b>Memrise</b>', 'Freemium + Pro', '~9 $/mes · ~60 $/año', 'Vídeos de nativos, repaso espaciado, chat con IA (MemBot)', 'Vídeos cortos de nativos en el cuaderno'],
 ['<b>Speak</b>', 'Suscripción', '~20 $/mes', 'Tutor de IA para hablar; vale 1.000 M$ (dic. 2024, 78 M$ de ronda C)', 'Hablar con la tutora sería el «Max» de Paglot, pero cuesta dinero por uso'],
 ['<b>Preply / italki</b>', 'Mercado de profesores, cobran comisión', 'Preply: 100 % de la clase de prueba y 18–33 % después; italki ~15–21 %', 'Profesores particulares', 'Una sección «busca profe» con comisión, a largo plazo'],
 ['<b>Rosetta Stone</b>', 'Suscripción y vitalicia', '3 meses ~45 $ · 12 meses ~131 $ · vitalicia 399 $ (a menudo 149–219 $)', 'Inmersión sin traducción', 'Las vitalicias se venden con descuentos frecuentes'],
 ['<b>Mondly</b>', 'Suscripción, vitalicia, familia', '~10 $/mes · ~48 $/año · vitalicia ~99 $', '41 idiomas, lecciones diarias, VR', 'Muchos idiomas a la vez, como Paglot'],
 ['<b>LingQ</b>', 'Freemium + Premium', '~15 $/mes · Premium Plus ~42 $/mes', 'Aprender leyendo textos reales e importados', 'La lectura con palabras pulsables ya existe en Paglot'],
 ['<b>HelloTalk / Tandem</b>', 'Gratis + VIP/Pro', '~5–14 $/mes', 'Intercambio con nativos (chat, llamadas)', 'Requiere moderación; no ahora'],
])}

<h3>5.4 Comisiones de las tiendas</h3>
<ul>
<li><b>Google Play</b>: 15 % en suscripciones desde el primer día (desde 2022).</li>
<li><b>App Store</b>: 15 % con el Small Business Program (primer millón al año); las suscripciones bajan al 15 % a partir del segundo año.</li>
<li>Vender en la web (Stripe) cuesta ~1,5–3 %, pero en las apps las tiendas obligan a usar su sistema para lo digital.</li>
</ul>

<h3>5.5 Qué haría con todo esto en Paglot</h3>
<ol>
<li><b>Gratis de verdad</b> lo básico (como Duolingo): todas las lecciones, repaso y racha. Sin anuncios: es una app pensada para
gente con déficit de atención y los anuncios rompen la concentración.</li>
<li><b>Paglot Max</b> por suscripción con <b>precios por país</b> (ya diseñados en <code>config.js</code>, zonas A–D), plan
<b>Familia</b> y plaza <b>Fundadores</b> vitalicia limitada. Qué da: sin límite de lecciones nuevas al día, todos los cursos
a la vez, modo sin conexión, estadísticas, tutoras y temas extra.</li>
<li><b>Hábito antes que castigo</b>: energía y no corazones; racha con protector; misiones diarias y cofres (ya hay); un
<b>reto de 30 días</b> tipo Sprint con medalla.</li>
<li><b>Diferenciarse</b>: privacidad (cuentas sin correo, al estilo Mullvad), tutoras pixel que reaccionan a todo, pensada
para el TDAH, sin scroll en el móvil. Ese mensaje no lo tiene nadie.</li>
<li><b>Más adelante</b>: hablar con la tutora (IA) como extra de Max, clases con profesores mediante comisión, y escuelas/empresas.</li>
</ol>
</section>

<section>
<h2>6. Orden recomendado</h2>
{tabla(['Fase', 'Qué', 'Horas', 'Resultado'], [
 ['<b>0</b>', 'Decidir Paglot = la app; limpiar git (posible_old fuera); commit', '1', 'Una sola carpeta buena'],
 ['<b>1</b>', 'Supabase (tú) + probar la nube · Frases del español · error del japonés · textos vi · APK desde Paglot · auditoría completa', '10', 'App estable en el móvil'],
 ['<b>2</b>', 'Módulo de diapositivas + 8 vistas largas + compactar 7 + 8 minijuegos + comprobación automática', '41', 'Nada se desplaza en el teléfono'],
 ['<b>3</b>', 'Cursos: modo juego corto para todas las lecciones; inglés en los 19 cursos (v2); marcar incompletos', '40–70', '21 cursos jugables y en inglés'],
 ['<b>4</b>', 'Aviso legal real; Paglot Max con Google Play Billing; límites del plan gratis', '30', 'Se puede publicar y cobrar'],
 ['<b>5</b>', 'Contacto, regalos, laboratorio con Supabase; tienda y escuelas si se deciden', '20–60', 'Las pantallas de la web funcionan de verdad'],
])}
<p>Las fases 2 y 3 se pueden hacer a la vez (una toca el código de las vistas y la otra el contenido).</p>
</section>

<section class="fuentes">
<h2>Fuentes</h2>
<ul>
<li>Duolingo, Form 10-K FY2025 (SEC): https://www.sec.gov/Archives/edgar/data/1562088/000162828026012494/duol-20251231.htm</li>
<li>Motley Fool, «3 key takeaways from Duolingo's 2025»: https://www.fool.com/investing/2026/02/16/3-key-takeaways-from-duolingos-2025/</li>
<li>Duolingo Blog, «Duolingo Energy»: https://blog.duolingo.com/duolingo-energy/</li>
<li>UX Collective, «Duolingo's small UI switch that changes everything»: https://uxdesign.cc/duolingos-small-ui-switch-that-changes-everything-fae257203633</li>
<li>Duolingo Blog, «Product highlights»: https://blog.duolingo.com/product-highlights/</li>
<li>Duolingo Data (estructura de cursos, no oficial): https://duolingodata.com/</li>
<li>StoryLearning, «Duolingo Max review»: https://storylearning.com/duolingo-max-review</li>
<li>DealNews, precios de Super Duolingo y plan Familia: https://dealnews.com/features/duolingo/promo-codes</li>
<li>Mindomax, «Duolingo cost»: https://www.mindomax.com/duolingo-cost</li>
<li>TechRepublic, «Duolingo CEO clarifies AI-first plan»: https://www.techrepublic.com/article/news-duolingo-ai-strategy-backlash/</li>
<li>Fortune, 18-08-2025, entrevista al CEO de Duolingo: https://fortune.com/2025/08/18/duolingo-ceo-admits-controversial-ai-memo-did-not-give-enough-context-insists-company-never-laid-off-full-time-employees</li>
<li>Lingoda Sprint: https://www.lingoda.com/en/retargeting-sprint/ · reseña: https://learnenglish.life/reviews/lingoda/ · https://freakingnomads.com/lingoda-review/</li>
<li>Babbel, precios: https://dealnews.com/features/babbel/plan-pricing · https://subger.com/en/service/babbel-live</li>
<li>Busuu y Memrise: https://subger.com/en/service/busuu · https://makeheadway.com/blog/busuu-review/ · https://subger.com/en/service/memrise</li>
<li>Speak, ronda C: https://www.maginative.com/article/ai-language-tutor-speak-hits-unicorn-status-with-78m-series-c</li>
<li>Preply e italki, comisiones: https://www.sharetribe.com/how-to-build/website-like-preply/ · https://pensight.com/post/italki-commission-teachers · https://yespress.io/preply</li>
<li>Rosetta Stone: https://testprepinsight.com/?p=7672 · https://slickdeals.net/f/18890599</li>
<li>Mondly y LingQ: https://subger.com/en/service/mondly · https://makeheadway.com/blog/lingq-review/</li>
<li>HelloTalk y Tandem: https://www.hellotalk.com/blog/language-app-subscription-worth-it-2026 · https://toolradar.com/tools/tandem/pricing</li>
<li>Comisiones de las tiendas: https://appleinsider.com/articles/21/10/21/google-play-drops-all-subscription-commissions-to-15-from-day-one · https://www.revenuecat.com/blog/engineering/small-business-program</li>
<li>Mercado: https://www.businessofapps.com/?p=95464 · https://voxbooster.com/es/blog/language-learning-statistics-2026/</li>
</ul>
<p class="nota">Muchas cifras de precios vienen de agregadores y cambian por país y por pruebas A/B: son orientativas.
Las de Duolingo salen de sus informes oficiales.</p>
</section>
"""

estilo = """
@page { size: A4; margin: 16mm 14mm; }
* { box-sizing: border-box; }
body { font: 10.5pt/1.45 "Segoe UI", system-ui, sans-serif; color: #231c2b; }
h1, h2, h3, h4 { font-family: "Segoe UI", sans-serif; color: #2b2233; }
h2 { margin: 0 0 10px; padding-bottom: 4px; font-size: 17pt; border-bottom: 3px solid #c4262e; }
h3 { margin: 18px 0 6px; font-size: 12.5pt; color: #7a1f26; }
h4 { margin: 0 0 6px; }
section { page-break-before: always; }
section.portada { page-break-before: auto; display: flex; flex-direction: column; justify-content: center; min-height: 250mm; padding: 0 10mm;
  background: linear-gradient(160deg, #fff6e2, #efe4cc); border: 4px solid #2b2233; }
.portada h1 { margin: 6px 0; font-size: 54pt; letter-spacing: -1px; }
.portada .sub { font-size: 15pt; max-width: 150mm; }
.sello { display: inline-block; align-self: flex-start; padding: 4px 10px; font-weight: 700; color: #fff; background: #c4262e; }
.datos-portada { padding-left: 18px; font-size: 12pt; }
table { width: 100%; margin: 8px 0 12px; border-collapse: collapse; font-size: 9pt; page-break-inside: auto; }
tr { page-break-inside: avoid; }
th { padding: 5px 6px; text-align: left; color: #fff; background: #2b2233; }
td { padding: 5px 6px; vertical-align: top; border-bottom: 1px solid #d9cbb0; }
tbody tr:nth-child(even) td { background: #faf4e6; }
table.mini { font-size: 8.5pt; }
.dos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cajas { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 10px 0; }
.caja { padding: 10px 12px; border: 2px solid; }
.caja ul { margin: 0; padding-left: 16px; }
.caja li { margin-bottom: 4px; }
.verde { border-color: #1d6b34; background: #eef8ef; }
.roja { border-color: #c4262e; background: #fdf0f0; }
.p0, .p1, .p2 { display: inline-block; padding: 1px 6px; font-weight: 700; font-size: 8pt; color: #fff; }
.p0 { background: #c4262e; } .p1 { background: #b8741a; } .p2 { background: #2f7fbf; }
.bien { color: #1d6b34; font-weight: 700; } .regular { color: #b8741a; font-weight: 700; } .mal { color: #c4262e; font-weight: 700; }
code { font: 8.5pt Consolas, monospace; background: #f1e8d6; padding: 0 3px; }
.nota { font-size: 9pt; color: #5d5168; }
.fuentes li { font-size: 8.5pt; word-break: break-all; margin-bottom: 3px; }
ol li, ul li { margin-bottom: 3px; }
"""

cuerpo = __import__('re').sub(r'(?<=\d),(?=\d{3})', '.', cuerpo)
HTML.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe Paglot</title><style>{estilo}</style></head><body>{cuerpo}</body></html>', encoding='utf-8')
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={PDF}', HTML.as_uri()], check=True, timeout=120)
print('PDF:', PDF, PDF.stat().st_size, 'bytes')
