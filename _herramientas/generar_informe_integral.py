"""Informe integral de Paglot: competencia, qué está mal (app, plan de negocio y manual) y planificación completa.

    python _herramientas/generar_informe_integral.py

Lee _notas/revision_paglot.json (de revisar_paglot.py) y escribe _notas/Informe_Integral_Paglot_2026-10-18.pdf (+ .html).
Fuentes internas: Paglot_Plan_de_Negocio.pdf y Paglot_Manual_Integral.pdf (Documents/Paglot/Documentación).
"""
import json
import re
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = json.loads((RAIZ / '_notas' / 'revision_paglot.json').read_text(encoding='utf-8'))
HTML = RAIZ / '_notas' / 'Informe_Integral_Paglot_2026-10-18.html'
PDF = RAIZ / '_notas' / 'Informe_Integral_Paglot_2026-10-18.pdf'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

NOMBRES = {'en': 'Inglés', 'es': 'Español', 'fr': 'Francés', 'de': 'Alemán', 'ja': 'Japonés', 'it': 'Italiano', 'ko': 'Coreano',
           'zh': 'Chino', 'pt': 'Portugués', 'ru': 'Ruso', 'tr': 'Turco', 'nl': 'Neerlandés', 'sv': 'Sueco', 'el': 'Griego',
           'pl': 'Polaco', 'no': 'Noruego', 'vi': 'Vietnamita', 'id': 'Indonesio', 'da': 'Danés', 'ro': 'Rumano', 'th': 'Tailandés'}


def tabla(cabeza, filas, clase=''):
    th = ''.join(f'<th>{c}</th>' for c in cabeza)
    tr = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in f) + '</tr>' for f in filas)
    return f'<table class="{clase}"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>'


P0, P1, P2 = '<span class="p0">P0</span>', '<span class="p1">P1</span>', '<span class="p2">P2</span>'
SI, NO, PARC = '<span class="si">Sí</span>', '<span class="no">No</span>', '<span class="parc">Parcial</span>'

cursos = DATOS['cursos']
otros = [c for c in cursos if c['id'] != 'es']
total_otros = sum(c['lecciones'] for c in otros)
juego_otros = sum(c['con_modo_juego'] for c in otros)
est = DATOS['estatica']
nav = DATOS['navegador']

filas_cursos = []
for c in cursos:
    explicado = [x for x in c['traducciones'] if x != c['id']]
    filas_cursos.append([f"<b>{NOMBRES[c['id']]}</b>", c['lecciones'], 'v2' if c['esquema2'] == c['lecciones'] else 'v1',
                         f"{c['con_modo_juego']} ({round(100 * c['con_modo_juego'] / max(c['lecciones'], 1))} %)",
                         ', '.join(explicado) or '—', '✓' if c['frases'] else 'falta'])


def filas_movil(lista):
    salida = []
    for m in lista:
        p = m.get('pantallas') or 0
        que = 'paginada ✓' if m.get('paginada') else ('cabe ✓' if p <= 1.05 else ('compactar' if p <= 1.5 else f'diapositivas (~{max(2, round(p))})'))
        salida.append([f"#/{m['ruta']}", p, que])
    return salida


cuerpo = f"""
<section class="portada">
<p class="sello">INFORME INTEGRAL · 18-10-2026</p>
<h1>Paglot</h1>
<p class="sub">Competencia, qué está mal (en la app, en el plan de negocio y frente al manual) y la planificación completa
para tener la app terminada.</p>
<p>Base: la carpeta <code>Paglot</code> medida con scripts de Python, el <b>Plan de Negocio 1.0</b> y el <b>Manual Integral 1.0</b>
(octubre 2026), y una investigación pública de 13 apps (todas las del sector menos Preply e italki).</p>
<p class="nota">Las cifras de la competencia salen de informes oficiales cuando existen (Duolingo) y, si no, de reseñas y
agregadores de precios: son orientativas y cambian por país.</p>
</section>

<section>
<h2>0. Resumen en una página</h2>
<h3>Dónde estamos</h3>
<ul>
<li>La app ya tiene mucho: 21 cursos ({total_otros + 320:,} lecciones), 30 pantallas, 29 minijuegos, mapa con estrellas, logros, repaso
espaciado, reto, cuentas al estilo Mullvad con nube por curso, y todas las páginas de la web (precios, tienda, regalos, escuelas…).</li>
<li>Pero <b>solo el curso de español está terminado</b>. Los otros 20 están en formato antiguo, <b>explicados en español</b> (no en inglés)
y solo el {round(100 * juego_otros / total_otros)} % de sus lecciones tiene modo juego.</li>
<li><b>Nada cobra todavía</b>: precios, Plus, Max, Familia, Fundadores, Hucha, regalos y tienda son pantallas sin sistema de pagos detrás.</li>
<li>El <b>móvil</b> tiene 8 pantallas que no caben (hay que pasarlas a diapositivas) y 7 que hay que compactar.</li>
</ul>
<h3>Lo más importante que está mal</h3>
<ol>
<li><b>El plan vende Max (399 €/año, 6 libros) sobre contenido que no existe revisado</b>: los libros salen de las lecciones, y 20 de 21 cursos
son beta. Vender caro algo hecho deprisa es justo lo que le costó la polémica a Duolingo en 2025.</li>
<li><b>Los precios mensuales baratos no salen a cuenta en la web</b>: una pasarela «vendedor registrado» cobra ~5 % + 0,50 €; en un Plus
de 2,49 € al mes eso es el 25 %, y en la zona D (0,49 €) cuesta más que el propio precio.</li>
<li><b>La Hucha necesita muchísimos anuncios</b>: con lo que suele pagar un anuncio con recompensa, llenar un Plus anual son del orden
de <b>1.000 anuncios al año</b> (3 al día). Y choca con la promesa de privacidad de las cuentas sin correo.</li>
<li><b>El 4 % de conversión y el 0,2 % de Max son optimistas</b> para empezar: la media del sector ronda el 2 % y Duolingo llega al ~9 %
después de diez años y con todo su marketing.</li>
<li><b>La app no cumple aún varias reglas del manual</b>: la tutora pone cara «apurada» ante errores, hay animaciones continuas, la
navegación no es «Aprender · Practicar · Cuaderno», falta el botón Pausar y los ajustes de texto grande y modo concentración.</li>
</ol>
<h3>Qué propongo</h3>
<p>Seguir el orden del propio plan (llenar la casa → abrir la caja → lanzar Max → acelerar), pero con <b>Max solo para los cursos
revisados</b> (empezar por español), <b>pagos web solo anuales</b>, la Hucha como «días de Plus por anuncio» (no como pagar el año
entero) y <b>medir antes de prometer</b>. El trabajo está repartido en 10 bloques (apartado 4) y 4 fases (apartado 5): unas 395–635 horas
de desarrollo mío, más trabajo externo (revisión nativa, imprenta, asesoría legal).</p>
</section>

<section>
<h2>1. Punto de partida: lo que dicen el plan y el manual frente a lo que hay</h2>
{tabla(['Tema', 'Plan / Manual', 'Hoy en la carpeta Paglot', 'Hueco'], [
 ['Idiomas', '21 idiomas, todos los niveles', '21 cursos; solo español completo y revisado (v2, 320 lecciones)', '20 cursos en v1, explicados en español, modo juego en el 20 %'],
 ['Interfaz', '12 idiomas de interfaz', 'Inglés y vietnamita (tú pediste solo inglés)', 'Decidir: 1, 2 o 12'],
 ['Plan Gratis', 'Todo el curso, 3 lecciones nuevas al día, repaso sin límite, sin anuncios, sin vidas', 'Todo gratis y sin límite; sin anuncios; sin vidas', 'Falta el límite diario (y probar 3 frente a 5)'],
 ['Plus', '14,99 €/año, 2,49 €/mes, Familia 24,99 €, Fundadores 39,99 €, 7 días de prueba, precio congelado', 'Pantalla de precios con zonas A–D; botones «Próximamente»', 'Sin cobros, sin permisos de plan, sin prueba'],
 ['Max', '399 €/año o 34,99 €/mes con 12 meses; 6 libros; simulacros; certificados', 'Solo la pantalla', 'Libros, simulacros, certificados, direcciones, imprenta'],
 ['Hucha', 'Anuncios voluntarios que pagan Plus', 'No existe', 'AdMob, consentimiento, crédito'],
 ['Cuenta y nube', 'Cuenta y nube', 'Número de 16 cifras + correo opcional (Supabase); SQL listo', 'Probar con la base real; caducidad 7 días'],
 ['Cobro', 'Web con «vendedor registrado» (Paddle/Lemon Squeezy), Google Play, App Store después', 'Nada', 'Todo'],
 ['Crecimiento', 'Referidos, Familia, vídeos, tarjetas de racha, páginas SEO, creadores 30 %, aulas, fichas de tienda', 'Nada de eso', 'Todo'],
 ['Otras fuentes', 'Libros en Amazon, colegios, empresas, regalos, tienda, caprichos', 'Pantallas de escuelas, empresas, regala Max y tienda (decorado)', 'Servidor, pagos, contenidos'],
 ['Cuadro de mandos', '8 números cada lunes (MAU, D30, 4 %, 0,2 %, 70 % anual, 0,50 €/usuario, 19 €/libro, 0,3 amigos)', 'No se mide nada', 'Analítica respetuosa con la privacidad'],
 ['Manual: lección móvil', 'Una columna, «Paso 1 de 4», Pausar, acción a ancho completo; el contenido «puede desplazarse»', 'Modo juego con pasos, pie fijo con Siguiente; sin Pausar', 'Pausar, progreso escrito; y tu regla: sin scroll (manda sobre el manual)'],
 ['Manual: navegación', 'Aprender · Practicar · Cuaderno; Frases y Repaso dentro de Practicar; Perfil en la cabecera', 'Lecciones · Cuaderno · Repaso; Práctica y Frases sueltas', 'Reordenar'],
 ['Manual: preferencias', 'Tema, movimiento reducido, voz, música, tamaño de texto, modo concentración', 'Tema, sonido, voz; respeta movimiento reducido del sistema', 'Tamaño de texto, modo concentración, música'],
 ['Manual: accesibilidad', 'WCAG 2.2 AA, 48 × 48 px táctil, texto al 200 %, reflujo a 320 px', 'Sin auditar', 'Auditoría y arreglos'],
])}
</section>

<section>
<h2>2. La competencia (todas menos Preply e italki)</h2>
<h3>2.1 Ficha por app</h3>
{tabla(['App', 'Modelo y precio orientativo', 'Lo que hace bien', 'Lo que hace mal / quejas', 'Qué cogemos · qué evitamos'], [
 ['<b>Duolingo</b>', 'Gratis con anuncios y energía · Super ~13 $/mes u ~84 $/año (EE. UU., con mucho A/B y precio por país) · Familia ~120 $/año (6) · Max ~30 $/mes o ~168 $/año (IA: videollamada, roleplay). 2025: 1.037,6 M$ de ingresos, 52,7 M de usuarios diarios, 12,2 M de pago (~9 %).',
  'Hábito: lecciones de ~15 ejercicios, racha, ligas, misiones, cofres, notificaciones. Camino por niveles MCER. Plan familiar (muy rentable).',
  'Energía/corazones frustran (hubo peticiones contra la energía); presión para pagar; 2025: polémica «AI-first» y críticas de calidad por cursos hechos con IA; poca gramática explicada.',
  'Coger: lección corta, racha con protector, familia, precio por país. Evitar: castigar el error, inflar cursos con IA sin revisar.'],
 ['<b>Babbel</b>', 'Suscripción (~14 $/mes, ~83 $/año) y vitalicia (~200–300 $). Babbel Live: clases en grupo ilimitadas (~99 $/trimestre). Primera lección gratis.',
  'Cursos hechos por lingüistas, diálogos realistas, repaso, gramática explicada.', 'Muro de pago desde la segunda lección; pocos idiomas; menos «juego».',
  'Coger: la vitalicia (= Fundadores) y la explicación clara. Evitar: muro de pago temprano (Paglot da todo gratis con ritmo).'],
 ['<b>Busuu</b> (Chegg)', 'Gratis + Premium / Premium Plus (~10–14 $/mes).', 'Correcciones de hablantes nativos (comunidad); conversación con IA en Premium Plus; certificados por nivel para usuarios de pago.',
  'Reseñas: explicaciones gramaticales insuficientes; caro para lo que añade.', 'Coger: la corrección entre alumnos (encaja en «Social») y el certificado incluido. Evitar: cobrar extra por lo básico.'],
 ['<b>Memrise</b>', 'Gratis + Pro (~9 $/mes, ~60 $/año).', 'Vídeos de nativos, repaso espaciado, chat con IA (MemBot), sin conexión.', 'Cambió mucho de enfoque; menos contenido de la comunidad.',
  'Coger: clips cortos de nativos para el cuaderno. Evitar: depender de la IA para todo.'],
 ['<b>Lingoda</b>', 'Escuela online: paquetes de clases en directo; grupo ~11–23 $/clase, individual ~23–48 $. Sprint: reto de asistencia con devolución del 50 %.',
  'Profesores titulados, temario MCER, compromiso real (el Sprint).', 'Horarios fijos, no eliges profe en grupo, poco tiempo de habla, pocos idiomas, caro; el Sprint se pierde por faltar a una clase.',
  'Coger: un «reto de 30 días» con premio (sin dinero). Evitar: castigos duros.'],
 ['<b>Speak</b>', 'Suscripción ~20 $/mes. Tutor de IA para hablar. Valor 1.000 M$ (ronda C de 78 M$, dic. 2024).', 'Práctica oral muy natural; tecnología.', 'Caro; pocos idiomas; poca gramática.',
  'Coger (más adelante): hablar con la tutora como extra de pago. Evitar: costes de IA por uso sin precio que los cubra.'],
 ['<b>Rosetta Stone</b>', '3 meses ~45 $, 12 meses ~131 $, vitalicia 399 $ (casi siempre rebajada a 149–219 $).', 'Inmersión, marca conocida, vitalicia.', 'Sin traducciones (frustra a principiantes); producto anticuado; descuentos permanentes.',
  'Coger: vitalicia limitada. Evitar: «precio de mentira» siempre rebajado.'],
 ['<b>Mondly</b>', '~10 $/mes, ~48 $/año, vitalicia ~99 $, familia. 41 idiomas, también VR.', 'Muchos idiomas a la vez (como Paglot).', 'Contenido poco profundo; promociones agresivas (-95 %).',
  'Coger: todos los idiomas en el mismo plan. Evitar: superficialidad en cursos poco cuidados.'],
 ['<b>LingQ</b>', 'Gratis limitado; Premium ~15 $/mes; Premium Plus ~42 $/mes; vitalicia ~229 $ por idioma.', 'Aprender leyendo textos reales con palabras pulsables.', 'Interfaz recargada; poco para principiantes.',
  'Coger: lectura graduada (ya hay linterna y palabras pulsables). Evitar: interfaces densas.'],
 ['<b>HelloTalk / Tandem</b>', 'Gratis + VIP/Pro (~5–14 $/mes).', 'Intercambio con nativos, comunidad.', 'Moderación difícil, contactos no deseados.',
  'No ahora: exige moderación y seguridad (menores).'],
 ['<b>Assimil</b>', 'Libro + audio ~50–75 € por idioma; app ~50 € por curso, 7 lecciones gratis.', 'El libro como producto premium; método serio hasta B2.', 'Poca interacción; el audio y el libro van aparte.',
  'Es la mejor referencia para Max: un pack de libros de un idioma vale ~50–75 € en tienda. 6 libros ≈ 300 € de valor percibido.'],
 ['<b>Pimsleur</b>', 'Suscripción de audio (más cara que Rosetta Stone, según reseñas).', 'Método oral por audio.', 'Poco visual; caro.', 'Referencia de precio alto para quien va en serio.'],
])}

<h3>2.2 Comparativa de funciones</h3>
{tabla(['Función', 'Paglot (plan)', 'Duolingo', 'Babbel', 'Busuu', 'Memrise', 'Lingoda', 'Speak', 'Rosetta', 'Mondly'], [
 ['Curso completo gratis', SI, SI, NO, PARC, PARC, NO, NO, NO, NO],
 ['Sin anuncios en el plan gratis', SI, NO, '—', PARC, PARC, '—', '—', '—', PARC],
 ['Sin vidas/energía', SI, NO, SI, SI, SI, '—', SI, SI, SI],
 ['Límite diario en gratis', '3 lecciones', 'energía', 'muro de pago', 'sí', 'sí', '—', '—', '—', 'sí'],
 ['Precio anual base (aprox.)', '14,99 €', '~84 $', '~83 $', '~83 $', '~60 $', 'por clases', '~240 $', '~131 $', '~48 $'],
 ['Precio por país', SI, SI, PARC, PARC, PARC, NO, PARC, NO, PARC],
 ['Plan familiar', SI, SI, NO, NO, NO, NO, NO, NO, SI],
 ['Vitalicia', 'Fundadores', NO, SI, NO, NO, NO, NO, SI, SI],
 ['Conversación con IA', 'futuro', 'Max', NO, 'Plus', SI, NO, SI, NO, PARC],
 ['Profesores reales', NO, NO, 'Live', NO, NO, SI, NO, PARC, NO],
 ['Libros en papel', '<b>Max</b>', NO, NO, NO, NO, NO, NO, NO, NO],
 ['Certificado de nivel', 'Plus 4,99 € / Max', 'examen DET', PARC, SI, NO, SI, NO, NO, NO],
 ['Simulacros de exámenes', 'Plus 1/mes, Max ∞', NO, NO, NO, NO, NO, NO, NO, NO],
 ['Sin conexión', 'Plus', 'Super', SI, SI, 'Pro', NO, NO, SI, SI],
 ['Nº de idiomas', '21', '40+', '~14', '~14', '~20', '~5', '~10', '25', '41'],
 ['Cuenta sin correo (privacidad)', '<b>Sí</b>', NO, NO, NO, NO, NO, NO, NO, NO],
 ['Pensada para TDAH', '<b>Sí</b>', NO, NO, NO, NO, NO, NO, NO, NO],
])}
<p><b>Lo que nadie más tiene y Paglot sí</b>: libros físicos con la suscripción, cuenta sin correo, diseño para déficit de atención y
tutoras pixel por idioma. <b>Lo que todos tienen y Paglot no</b>: un sistema de pagos funcionando, audio de calidad y contenido revisado
en todos sus idiomas.</p>

<h3>2.3 Datos de mercado que importan</h3>
<ul>
<li>Duolingo: ~9 % de usuarios de pago, crece por mezcla hacia planes caros (Max y Familia), espera +20 % de usuarios diarios en 2026.</li>
<li>Tiendas: Google Play cobra 15 % en suscripciones desde el primer día; Apple 15 % con el programa de pequeños desarrolladores (y en
suscripciones a partir del segundo año).</li>
<li>Pasarelas «vendedor registrado» (Paddle, Lemon Squeezy): ~5 % + 0,50 $ por cobro, y gestionan el IVA de cada país.</li>
<li>Pruebas gratis: cuanto más larga, más convierte (datos de RevenueCat: ~24 % con pruebas de ≤4 días frente a ~45 % con 17–32 días).</li>
<li>Anuncios con recompensa: paga mucho más un anuncio visto en Norteamérica o Europa occidental (del orden de 9 $ por mil) que en el
Sudeste Asiático, Oriente Medio o África (1–4 $ por mil).</li>
<li>Libros: un pack de Assimil (libro + audio) cuesta ~50–75 €; la impresión bajo demanda hay que presupuestarla con la calculadora de
Lulu (los datos públicos que encontré son antiguos).</li>
</ul>
</section>

<section>
<h2>3. Qué está mal</h2>
<h3>3.1 En la app (carpeta Paglot)</h3>
{tabla(['', 'Problema', 'Detalle'], [
 [P0, 'Nube sin probar', 'El SQL que te he pasado activa las cuentas. Falta probar subir, entrar con número, correo, recuperar, borrar y caducidad.'],
 [P0, 'Git desordenado', 'Paglot (93 MB) no tiene commit; Git ve ~1.600 archivos borrados en la raíz (los moviste a posible_old).'],
 [P0, 'APK desde Idiomas', '<code>_apk/copiar.mjs</code> copia la carpeta vieja. Con 21 cursos la APK pasará a ~50–60 MB.'],
 [P0, 'Cursos explicados en español', f'Los 20 cursos recuperados traen explicaciones, significados y traducciones en español; tú quieres inglés. {total_otros:,} lecciones.'],
 [P1, 'Modo juego solo en el 20 %', f'{juego_otros} de {total_otros:,} lecciones de esos cursos tienen la estructura que pide el motor (diálogo + vocabulario + lectura).'],
 [P1, 'Cursos incompletos', 'Tailandés 3 lecciones, chino 93, indonesio y rumano 124, noruego 157.'],
 [P1, 'Frases del español', 'Falta <code>cursos/es/phrases/frases.json</code>: la pantalla Frases sale vacía en español.'],
 [P1, 'Error en japonés', 'Lección 050: <code>tr(...).split is not a function</code>.'],
 [P1, 'Portada larga en el móvil', 'La portada recuperada mide 7,2 pantallas; la de solo-español cabía en una.'],
 [P1, 'Pantallas «decorado»', 'Precios, tienda, regalos, contacto, escuelas, empresas, laboratorio: no envían ni cobran nada. El contacto dice «enviado» sin enviar.'],
 [P1, 'Aviso legal antiguo', 'Habla de correo + contraseña y API propia; titular vacío. Hay que reescribirlo para cuentas por número y Supabase.'],
 [P1, 'Móvil con scroll', '8 vistas a diapositivas (portada, mapa, perfil, legal, créditos, página perdida, lección en libro, cuaderno) y 7 a compactar.'],
 [P2, 'Perfil y Entrar duplican la cuenta', 'Dejar la gestión en una y un resumen en la otra.'],
 [P2, 'Voz del dispositivo', 'Sin voz de algunos idiomas en muchos móviles (tailandés, vietnamita, griego…).'],
])}

<h3>3.2 En el plan de negocio</h3>
{tabla(['', 'Punto del plan', 'Qué falla', 'Propuesta'], [
 [P0, 'Max 399 €/año con 6 libros por idioma (126 libros)', 'Los libros se sacan de las lecciones, y solo el español está revisado. Vender 399 € de libros hechos deprisa es un riesgo de reputación y de reembolsos. Además 126 libros son mucho trabajo de maquetación y revisión.', 'Lanzar Max solo con español (y luego vietnamita o inglés). Libro por libro: A1 y Gramática primero, como dice el envío por niveles. Lista de espera para el resto.'],
 [P0, 'Plus mensual 2,49 € (y 0,49–1,49 € en zonas B–D) cobrado en la web', 'Con 5 % + 0,50 € por cobro: 25 % de comisión a 2,49 €; más del 100 % a 0,49 €.', 'En la web, solo planes anuales. Los mensuales baratos, solo en Google Play (15 %).'],
 [P0, 'Max mensual 34,99 € «con compromiso de 12 meses»', 'Las tiendas no gestionan bien permanencias en suscripciones mensuales, y en la UE hay que informar con mucho cuidado. Si se va a mitad de año con libros enviados, hay que reclamar.', 'Max mensual sin permanencia, con los libros de premio por nivel (como ya dice el plan); el compromiso, solo en el pago anual.'],
 [P1, 'La Hucha paga Plus con anuncios', 'A ~9 $ por mil anuncios (Europa), cubrir lo que deja un Plus anual son del orden de 1.000 anuncios al año (~3 al día todo el año); en la zona D, parecido o peor. Y los anuncios personalizados piden consentimiento (RGPD) y rastreo, que choca con la cuenta sin correo.', 'Que cada anuncio dé <b>días de Plus</b> (p. ej. 3 anuncios = 1 día sin límite) y no el año entero. Anuncios no personalizados por defecto. Medir antes de prometer.'],
 [P1, '4 % paga Plus, 0,2 % paga Max', 'Optimista al empezar: la media del sector es ~2 %; Duolingo llega al ~9 % tras diez años. Max a 399 € no tiene comparable directo (el más parecido, Lingoda, cobra por clases con profesor).', 'Hacer las cuentas con 1,5 % / 3 % / 4 % y 0,05 % / 0,1 % / 0,2 %. Decidir gastos con el escenario bajo.'],
 [P1, 'Simulacros «oficiales» (DELE, IELTS, JLPT…)', 'Son marcas registradas; no se puede decir «oficial». Hacer simulacros fieles de 10–15 exámenes es mucho contenido.', '«Simulacro tipo DELE». Empezar por 1 examen (DELE A2/B1 para el curso de español).'],
 [P1, 'Certificado Paglot verificable', 'El propio manual dice: no sugerir una acreditación que no existe.', 'Certificado «de progreso», con examen final dentro de la app y enlace de verificación.'],
 [P1, 'Regla «menos de 0,50 € por instalación»', 'En las zonas A (Europa, EE. UU.) una instalación de app de educación suele costar bastante más.', 'Anuncios pagados al principio solo en zonas C–D y para Max en A, midiendo el valor real de cada usuario.'],
 [P1, '12 idiomas de interfaz', 'Hoy hay 2 y pediste solo inglés. 12 interfaces multiplican el trabajo de textos de 30 pantallas.', 'Inglés primero; vietnamita ya está; los demás cuando haya usuarios de ese país.'],
 [P2, 'Fundadores: Plus para siempre a 39,99 €', 'Es una deuda de servidor sin fin; con 2.000 plazas es asumible.', 'Mantener el límite de 2.000 y el compromiso de «copia de la app si cerramos» (la app ya funciona sin conexión).'],
 [P2, 'Creadores: 30 % del primer año', 'Hace falta seguimiento de enlaces y pagos a terceros (facturas, impuestos).', 'Con la pasarela de la web (algunas tienen afiliados integrados).'],
])}

<h3>3.3 Frente al Manual Integral</h3>
<ul>
<li><b>Errores</b>: el manual pide cara neutral o amable ante un fallo; la app usa la expresión «apurada» en algunos avisos y fallos. Cambiarlo.</li>
<li><b>Movimiento</b>: el manual pide reposo quieto y sin partículas continuas; la app tiene pétalos, saludos simultáneos en la portada y
botones que laten sin parar. Con «modo concentración» se pueden apagar.</li>
<li><b>Navegación</b>: el manual propone Aprender · Practicar · Cuaderno, con Frases y Repaso dentro de Practicar y el Perfil en la cabecera.</li>
<li><b>Lección</b>: faltan «Pausar» y el progreso escrito («Paso 1 de 4»); el pie no debe tapar nada (ya mide la tutora).</li>
<li><b>Preferencias</b>: faltan tamaño de texto, música (apagada de inicio) y modo concentración.</li>
<li><b>Accesibilidad</b>: objetivo WCAG 2.2 AA; táctil de 48 px; texto al 200 %; sin auditar todavía.</li>
<li><b>Conflicto a decidir</b>: el manual acepta que la lección móvil se desplace; tu regla es sin scroll. Propongo que mande tu regla
(diapositivas) y actualizar el manual.</li>
<li><b>Tono</b>: «Llevas días sin venir» está prohibido; revisar los textos de racha y avisos para que nunca culpen.</li>
</ul>
</section>

<section>
<h2>4. Cómo debe ser la app completa</h2>
<h3>4.1 Producto final por plan</h3>
{tabla(['Función', 'Gratis', 'Plus', 'Max', 'Qué hace falta construir'], [
 ['21 cursos, todos los niveles, repaso sin límite', '✓', '✓', '✓', 'Cursos en v2, en inglés, revisados y con modo juego'],
 ['Lecciones nuevas', '3 al día', 'Sin límite', 'Sin límite', 'Contador diario + permisos del plan en Supabase'],
 ['Cuenta y nube', '✓', '✓', '✓', 'Hecho (probar)'],
 ['Sin conexión', '—', '✓', '✓', 'Service worker que guarde el curso; en la APK ya va dentro'],
 ['Simulacros de examen', '—', '1 al mes', 'Sin límite', 'Motor de examen cronometrado + bancos de preguntas por examen'],
 ['Certificado de progreso', '—', '4,99 € c/u', '✓', 'Examen final de nivel, PDF con código, página pública de verificación'],
 ['Lecciones en PDF', '—', '—', '✓', 'Exportar lección a PDF con la maqueta del manual'],
 ['Trajes y juegos de capricho', 'de pago', 'de pago', 'todos', 'Tienda dentro de la app (compras sueltas)'],
 ['La Hucha', '✓', '—', '—', 'AdMob con recompensa → días de Plus'],
 ['Familia (6)', '—', '+10 €/año', 'incluida', 'Grupo de cuentas por número, invitación con código'],
 ['6 libros', '—', '—', '✓', 'Maquetación A5, PDF con marca de agua, imprenta bajo demanda, direcciones'],
 ['Acceso anticipado, voto doble, créditos', '—', '—', '✓', 'Laboratorio con votos en Supabase'],
])}

<h3>4.2 Bloques de trabajo (épicas)</h3>
{tabla(['Bloque', 'Qué incluye', 'Horas (mías)', 'Externo'], [
 ['<b>E1 · Base técnica</b>', 'Probar la nube; tabla de <i>planes y permisos</i> en Supabase (quién es Plus/Max, hasta cuándo); límite de 3 lecciones; APK desde Paglot; descarga de cursos bajo demanda; service worker sin conexión; auditoría automática en cada cambio; arreglos (frases es, japonés 050, textos vi).', '35–50', '—'],
 ['<b>E2 · Móvil y manual</b>', 'Módulo de diapositivas + 8 vistas + 7 a compactar + 8 minijuegos; navegación Aprender/Practicar/Cuaderno; Pausar y «Paso X de Y»; preferencias (texto grande, música, modo concentración); tono sin culpa; auditoría WCAG 2.2 AA.', '60–80', 'Pruebas con personas con TDAH'],
 ['<b>E3 · Contenido</b>', 'Pasar 20 cursos a v2; explicaciones en inglés; modo juego para todas las lecciones (corto primero, completo después); completar o esconder los incompletos; frases por curso; usar las v2 de vietnamita y danés de la fábrica.', '80–140 (casi todo por scripts)', 'Revisión nativa (como mínimo por muestreo)'],
 ['<b>E4 · Cobros</b>', 'Google Play Billing (recomiendo RevenueCat para no escribir la parte de recibos), pasarela web anual (Lemon Squeezy o Paddle), webhooks → permisos en Supabase, precios por país en la consola, prueba de 7 días, Familia, Fundadores (contador real), cancelar en 1 botón, restaurar compras con el número de cuenta.', '40–60', 'Alta en Google Play Console, cuenta bancaria, datos fiscales'],
 ['<b>E5 · Max</b>', 'Generar los libros desde las lecciones con la maqueta A5 del manual (Source Sans 3, Pixelify, 112 × 170 mm); PDF con marca de agua por alumno; pedidos a la imprenta por API (Lulu) con envío por niveles; formulario de dirección; simulacros y certificados.', '80–120 (español)', 'Revisión editorial, presupuesto de imprenta, pruebas físicas'],
 ['<b>E6 · Crecimiento</b>', 'Referidos (1 mes de Plus para los dos tras 3 lecciones); tarjetas de racha para compartir; páginas públicas de frases para buscadores; fichas de tienda; vídeos cortos de tutoras; enlaces de creadores.', '30–45', 'Vídeos y redes'],
 ['<b>E7 · Web de verdad</b>', 'Contacto con Supabase (con antispam); regalos (códigos, compra y canje); laboratorio con votos; escuelas (alta de profesor, aulas, progreso) y empresas (licencias); tienda con impresión bajo demanda si se decide.', '40–90', 'Proveedor de merchandising'],
 ['<b>E8 · Legal</b>', 'Aviso legal, privacidad y términos nuevos; reembolsos (libros enviados no se devuelven); IVA (la pasarela «vendedor registrado» lo resuelve en la web); ficha de datos de Google Play; borrado de cuenta (hecho); edad mínima y menores; consentimiento de anuncios (solo en la Hucha); marcas de exámenes.', '10–15', 'Asesoría legal recomendable'],
 ['<b>E9 · Cuadro de mandos</b>', 'Eventos anónimos en Supabase (sin terceros): activos al mes, D30, conversión, % anual, coste por usuario, coste por libro, amigos por usuario. Panel privado para mirar los lunes.', '15–20', '—'],
 ['<b>E10 · Interfaz</b>', 'Inglés completo y revisado; vietnamita mantenido; más idiomas solo cuando haya demanda.', '5–15 por idioma', 'Traducción revisada'],
])}
<p><b>Total aproximado de trabajo mío: 395–635 horas</b>, más lo externo. Muchas partes van en paralelo (contenido por scripts mientras se
hace el código de las pantallas).</p>
</section>

<section>
<h2>5. Planificación por fases</h2>
<p>Las fases del Plan de Negocio, con lo que hay que construir en cada una y la condición para pasar a la siguiente.</p>
{tabla(['Fase', 'Cuándo', 'Qué se hace', 'Para pasar de fase'], [
 ['<b>0 · Llenar la casa</b>', 'Ahora → mes 1', 'E1 entero (nube probada, APK desde Paglot, arreglos, git limpio). E2: diapositivas + manual. E3: español y vietnamita perfectos; los otros 19 visibles como beta con aviso; modo juego corto para todos. E9 mínimo (medir activos y D30). Lista de espera de Max. Publicar la APK en Google Play (gratis).', 'App estable; D30 medido; ≥1.000 usuarios activos'],
 ['<b>1 · Abrir la caja</b>', 'Mes 1–3', 'E4: Plus anual + mensual en Google Play, anual en la web; Familia; Fundadores; límite de 3 lecciones (probar 3 frente a 5); prueba de 7 días. E6: referidos y tarjetas de racha. E8: textos legales. Hucha (versión «días de Plus») solo si los números salen.', 'Conversión medida; ≥70 % de pagos anuales; reembolsos bajos'],
 ['<b>2 · Lanzar Max</b>', 'Mes 3–6', 'E5 para español: libros A1 + Gramática en PDF, luego impresos en zonas A–B; simulacro tipo DELE; certificado de progreso. E3: inglés en 5–8 cursos más con revisión.', 'Primeras ventas de Max; coste real por libro ≤ 19 €'],
 ['<b>3 · Acelerar</b>', 'Mes 6–12', 'Anuncios pagados con la caja de Max (regla del euro medida, no supuesta). E7: escuelas, empresas, regalos. App Store. Libros en Amazon con QR a la app. Más colecciones de Max.', 'Crecimiento con beneficio'],
])}

<h3>5.1 Decisiones que necesito de ti</h3>
<ol>
<li><b>Carpeta</b>: ¿Paglot sustituye a Idiomas y se saca posible_old del repositorio?</li>
<li><b>Interfaz</b>: ¿solo inglés, inglés + vietnamita, o los 12 del plan?</li>
<li><b>Cursos beta</b>: ¿se publican los 19 con aviso desde el principio, o solo los que pasen la auditoría y estén en inglés?</li>
<li><b>Max</b>: ¿de acuerdo con lanzarlo solo en español al principio?</li>
<li><b>Hucha</b>: ¿anuncios sí o no? Si sí, ¿«días de Plus» en vez de pagar el año?</li>
<li><b>Pagos</b>: ¿Lemon Squeezy o Paddle en la web? ¿RevenueCat para Google Play?</li>
<li><b>Tienda física y merchandising</b>: ¿ahora, o cuando haya usuarios?</li>
<li><b>Datos legales</b>: titular, NIF, dirección y correo de contacto para el aviso legal.</li>
</ol>

<h3>5.2 Riesgos principales</h3>
{tabla(['Riesgo', 'Qué hacer'], [
 ['Cursos beta de mala calidad dañan la marca (lo que le pasó a Duolingo en 2025)', 'Aviso beta visible, revisión por muestreo, Max solo en cursos revisados'],
 ['Pocos pagan', 'Escenario bajo para decidir gastos; probar límites y precios con pruebas A/B'],
 ['La Hucha no rinde o molesta', 'Días de Plus; medir eCPM real por país antes de prometer'],
 ['Imprimir y enviar sale caro', 'PDF primero; presupuesto de Lulu/KDP antes de vender; envío por niveles'],
 ['Comisiones se comen los precios bajos', 'Anual en la web; mensual solo en Google Play'],
 ['Privacidad: anuncios y analítica contra la cuenta sin correo', 'Analítica propia y anónima; anuncios solo dentro de la Hucha y sin personalizar por defecto'],
 ['Trabajo excesivo (una persona)', 'Seguir las fases; no abrir Max, tienda y escuelas a la vez'],
])}
</section>

<section>
<h2>6. Anexo: datos medidos</h2>
<h3>6.1 Cursos</h3>
{tabla(['Curso', 'Lecciones', 'Formato', 'Con modo juego', 'Explicado en', 'Frases'], filas_cursos, 'mini')}
<h3>6.2 Móvil (390 × 844): pantallas de alto</h3>
<div class="dos">
{tabla(['Sin curso', 'Pantallas', 'Qué hacer'], filas_movil(nav['sin_curso']), 'mini')}
{tabla(['Curso de español', 'Pantallas', 'Qué hacer'], filas_movil(nav['curso_es']), 'mini')}
</div>
<h3>6.3 Fuentes</h3>
<ul class="fuentes">
<li>Internas: Paglot_Plan_de_Negocio.pdf (1.0, oct. 2026) y Paglot_Manual_Integral.pdf (1.0, oct. 2026).</li>
<li>Duolingo 10-K FY2025 (SEC): https://www.sec.gov/Archives/edgar/data/1562088/000162828026012494/duol-20251231.htm</li>
<li>Duolingo, energía: https://blog.duolingo.com/duolingo-energy/ · UX: https://uxdesign.cc/duolingos-small-ui-switch-that-changes-everything-fae257203633</li>
<li>Duolingo, precios: https://www.mindomax.com/duolingo-cost · https://dealnews.com/features/duolingo/promo-codes · Max: https://storylearning.com/duolingo-max-review</li>
<li>Duolingo, polémica IA: https://www.techrepublic.com/article/news-duolingo-ai-strategy-backlash/ · https://fortune.com/2025/08/18/duolingo-ceo-admits-controversial-ai-memo-did-not-give-enough-context-insists-company-never-laid-off-full-time-employees</li>
<li>Duolingo, estructura de cursos (no oficial): https://duolingodata.com/ · Product highlights: https://blog.duolingo.com/product-highlights/</li>
<li>Lingoda: https://www.lingoda.com/en/retargeting-sprint/ · https://learnenglish.life/reviews/lingoda/ · https://freakingnomads.com/lingoda-review/</li>
<li>Babbel: https://dealnews.com/features/babbel/plan-pricing · https://subger.com/en/service/babbel-live</li>
<li>Busuu y Memrise: https://subger.com/en/service/busuu · https://makeheadway.com/blog/busuu-review/ · https://www.g2.com/products/busuu/pricing · https://subger.com/en/service/memrise · https://en.wikipedia.org/wiki/Busuu</li>
<li>Speak: https://www.maginative.com/article/ai-language-tutor-speak-hits-unicorn-status-with-78m-series-c</li>
<li>Rosetta Stone: https://testprepinsight.com/?p=7672 · https://slickdeals.net/f/18890599</li>
<li>Mondly y LingQ: https://subger.com/en/service/mondly · https://makeheadway.com/blog/lingq-review/</li>
<li>HelloTalk y Tandem: https://www.hellotalk.com/blog/language-app-subscription-worth-it-2026 · https://toolradar.com/tools/tandem/pricing</li>
<li>Assimil: https://apps.apple.com/fr/app/assimil-apprenez-des-langues/id1438616898 · https://assimil.tiz.fr/en/perfect-your-skills/591-using-french-9782700580549.html</li>
<li>Comisiones de tiendas: https://appleinsider.com/articles/21/10/21/google-play-drops-all-subscription-commissions-to-15-from-day-one · https://www.revenuecat.com/blog/engineering/small-business-program</li>
<li>Pasarelas: https://dodopayments.com/blogs/paddle-vs-lemon-squeezy/ · https://fungies.io/lemonsqueezy-vs-paddle</li>
<li>Pruebas gratis y conversión: https://saastr.com/what-17000-subscription-apps-tell-us-about-free-trial-length-annual-plans-convert-86-better-with-30-day-trials-monthly-tops-out-at-two-weeks-and-ai-apps-hit-a-wall-at-16-days · https://revenuecat.com/state-of-subscription-apps-2025</li>
<li>Anuncios con recompensa: https://globalgamesforum.com/features/how-is-your-ecpm-doing-a-six-month-trend-analysis · https://appodeal.com/the-mobile-ecpm-report-updated-q4-2024-view</li>
<li>Imprenta: https://www.lulu.com/create/print-books · https://networkcultures.org/makingpublic/2021/03/02/print-on-demand-reflections-publit-vs-lulu/</li>
<li>Mercado: https://www.businessofapps.com/?p=95464 · https://voxbooster.com/es/blog/language-learning-statistics-2026/</li>
</ul>
</section>
"""

estilo = """
@page { size: A4; margin: 15mm 13mm; }
* { box-sizing: border-box; }
body { font: 10pt/1.45 "Segoe UI", system-ui, sans-serif; color: #231c2b; }
h2 { margin: 0 0 10px; padding-bottom: 4px; font-size: 16pt; border-bottom: 3px solid #c4262e; }
h3 { margin: 16px 0 6px; font-size: 12pt; color: #7a1f26; }
section { page-break-before: always; }
section.portada { page-break-before: auto; padding: 60mm 10mm 0; }
.portada h1 { margin: 8px 0; font-size: 52pt; }
.portada .sub { font-size: 15pt; }
.sello { display: inline-block; padding: 4px 10px; font-weight: 700; color: #fff; background: #c4262e; }
table { width: 100%; margin: 6px 0 12px; border-collapse: collapse; font-size: 8.6pt; }
tr { page-break-inside: avoid; }
th { padding: 4px 5px; text-align: left; color: #fff; background: #2b2233; }
td { padding: 4px 5px; vertical-align: top; border-bottom: 1px solid #d9cbb0; }
tbody tr:nth-child(even) td { background: #faf4e6; }
table.mini { font-size: 8pt; }
.dos { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.p0, .p1, .p2 { display: inline-block; padding: 1px 5px; font-weight: 700; font-size: 7.5pt; color: #fff; }
.p0 { background: #c4262e; } .p1 { background: #b8741a; } .p2 { background: #2f7fbf; }
.si { color: #1d6b34; font-weight: 700; } .no { color: #a8222a; } .parc { color: #b8741a; }
code { font: 8pt Consolas, monospace; background: #f1e8d6; padding: 0 3px; }
.nota { font-size: 9pt; color: #5d5168; }
.fuentes li { font-size: 8pt; word-break: break-all; margin-bottom: 2px; }
li { margin-bottom: 3px; }
"""

cuerpo = re.sub(r'(?<=\d),(?=\d{3})', '.', cuerpo)
HTML.write_text(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe integral Paglot</title><style>{estilo}</style></head><body>{cuerpo}</body></html>', encoding='utf-8')
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={PDF}', HTML.as_uri()], check=True, timeout=120)
print('PDF:', PDF, PDF.stat().st_size, 'bytes')
