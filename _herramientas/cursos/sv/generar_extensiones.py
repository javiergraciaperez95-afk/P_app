from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[3]
SRC = Path(__file__).resolve().parent
REPORT = SRC / 'auditoria_curriculo_2026-10-14.md'

# Capítulo | sueco | español | descripción | tres expresiones de práctica (SV/ES)
DATA = r'''
41~Bokstäver och uttal~Letras y pronunciación~Reconocer las letras suecas y observar patrones de pronunciación.~Å, ä och ö~å, ä y ö~Lång vokal ändrar ord~Una vocal larga puede cambiar una palabra~Betona rätt stavelse~Marca la sílaba correcta
42~Namn och kontaktuppgifter~Nombres y datos de contacto~Deletrear y comunicar información personal básica.~Mitt namn stavas så~Mi nombre se escribe así~Mitt nummer är 07123~Mi número es 07123~Det kostar femtio kronor~Cuesta cincuenta coronas
43~Personer och språk~Personas e idiomas~Presentar a otra persona y completar datos personales sencillos.~Hon kommer från Chile~Ella viene de Chile~Han talar svenska hemma~Él habla sueco en casa~Vi fyller i formuläret~Rellenamos el formulario
44~Substantiv och adjektiv~Sustantivos y adjetivos~Usar plurales frecuentes y concordar adjetivos sencillos.~Två böcker ligger här~Hay dos libros aquí~Det stora huset är vitt~La casa grande es blanca~Nya bilar står utanför~Hay coches nuevos fuera
45~Frågor och meningar~Preguntas y frases~Construir preguntas y frases afirmativas o negativas en presente.~Var arbetar din syster?~¿Dónde trabaja tu hermana?~Jag arbetar inte idag~Hoy no trabajo~Öppna dörren försiktigt~Abre la puerta con cuidado
46~Klockan och kalendern~La hora y el calendario~Decir horas, fechas y momentos del día con apoyo de un calendario.~Klockan är halv tre~Son las dos y media~Mötet är på fredag~La reunión es el viernes~Min födelsedag är i juni~Mi cumpleaños es en junio
47~Möbler och rum~Muebles y habitaciones~Nombrar objetos y describir dónde están en una habitación.~Stolen står bredvid bordet~La silla está junto a la mesa~Nyckeln ligger på hyllan~La llave está en la estantería~Sovrummet har ett fönster~El dormitorio tiene una ventana
48~Mat och recept~Comida y recetas~Comprar cantidades, preguntar por ingredientes y seguir pasos breves.~En påse mjöl tack~Una bolsa de harina, por favor~Innehåller rätten nötter?~¿El plato contiene frutos secos?~Blanda mjöl och vatten~Mezcla harina y agua
49~Kläder och väder~Ropa y clima~Preguntar por tallas y cambios y elegir ropa según el tiempo.~Har ni storlek medium~¿Tienen la talla mediana?~Jag vill byta tröjan~Quiero cambiar el jersey~Ta med en varm jacka~Lleva una chaqueta abrigada
50~Skyltar och riktningar~Rótulos e indicaciones~Leer señales y comprender direcciones sencillas en el barrio.~Biblioteket ligger nära torget~La biblioteca está cerca de la plaza~Gå rakt fram till bron~Sigue recto hasta el puente~Sväng vänster vid korsningen~Gira a la izquierda en el cruce
51~Tidtabell och biljetter~Horarios y billetes~Leer horarios, confirmar destinos y entender avisos simples de transporte.~Bussen avgår klockan åtta~El autobús sale a las ocho~En biljett till Uppsala~Un billete a Uppsala~Tåget är försenat idag~El tren llega con retraso hoy
52~Kroppen och vården~El cuerpo y la atención sanitaria~Nombrar síntomas, pedir una cita y solicitar que repitan una indicación.~Jag har ont i ryggen~Me duele la espalda~Kan jag boka en tid?~¿Puedo pedir una cita?~Kan du säga det igen~¿Puedes repetirlo?
53~Arbete och studier~Trabajo y estudios~Describir ocupaciones, tareas, horarios y necesidades de ayuda.~Jag arbetar på ett kontor~Trabajo en una oficina~Mitt pass börjar klockan nio~Mi turno empieza a las nueve~Kan du visa uppgiften~¿Puedes mostrarme la tarea?
54~Inbjudningar och planer~Invitaciones y planes~Invitar, aceptar o rechazar con cortesía y proponer otro momento.~Vill du fika med oss?~¿Quieres tomar un café con nosotros?~Tyvärr kan jag inte komma~Lo siento, no puedo ir~Vi ses på lördag istället~Nos vemos el sábado en su lugar
55~Vardaglig repetition~Repaso de situaciones cotidianas~Integrar lectura, interacción y escritura en una situación cotidiana breve.~Jag söker ett rum~Estoy buscando una habitación~Kan du hjälpa mig idag~¿Puedes ayudarme hoy?~Jag skriver ett kort meddelande~Escribo un mensaje corto
56~Bostad och reparationer~Vivienda y reparaciones~Comprender anuncios de alquiler y acordar cómo resolver un problema doméstico.~Lägenheten har två rum~El apartamento tiene dos habitaciones~Kranen läcker under diskhon~El grifo gotea debajo del fregadero~Kan vi boka en reparation~¿Podemos concertar una reparación?
57~Köp och reklamationer~Compras y reclamaciones~Comparar productos y explicar con claridad el motivo de una devolución o queja.~Den här varan är billigare~Este producto es más barato~Jag vill lämna tillbaka den~Quiero devolverlo~Kvitto saknas i paketet~Falta el recibo en el paquete
58~Matvanor och recept~Hábitos y recetas~Expresar preferencias y restricciones y explicar una receta sencilla.~Jag äter helst vegetarisk mat~Prefiero comer comida vegetariana~Rätten innehåller inga ägg~El plato no contiene huevos~Lägg till lite mer salt~Añade un poco más de sal
59~Resor och bokningar~Viajes y reservas~Comparar rutas y resolver cambios de fecha u horario en un viaje.~Vilken väg tar kortast tid?~¿Qué ruta lleva menos tiempo?~Vi har bokat ett dubbelrum~Hemos reservado una habitación doble~Avgången flyttas till kvällen~La salida se cambia a la tarde
60~Veckoplaner och tider~Planes semanales y horarios~Organizar la semana, confirmar disponibilidad y avisar de un cambio.~Ledig efter klockan fyra~Estoy libre después de las cuatro~Passar torsdag eftermiddag dig?~¿Te viene bien el jueves por la tarde?~Jag blir tio minuter sen~Llegaré diez minutos tarde
61~Berätta om gårdagen~Contar lo que pasó ayer~Ordenar hechos pasados y distinguir el relato de una experiencia reciente.~Först missade jag bussen~Primero perdí el autobús~Sedan ringde jag min vän~Después llamé a mi amigo~Till slut kom jag hem~Al final llegué a casa
62~Framtidsplaner~Planes de futuro~Hablar de planes y preparar una alternativa si cambian las condiciones.~Vi ska resa nästa vecka~Viajaremos la semana que viene~Regnar det stannar vi hemma~Si llueve, nos quedamos en casa~Annars tar vi tåget~Si no, tomamos el tren
63~Arbetsuppgifter och skift~Tareas y turnos de trabajo~Entender instrucciones laborales y pedir un cambio de turno con cortesía.~Jag ansvarar för beställningarna~Me encargo de los pedidos~Kan vi byta arbetspass~¿Podemos cambiar el turno?~Kontrollera listan före lunch~Revisa la lista antes del almuerzo
64~Kurser och studier~Cursos y estudios~Encontrar requisitos y fechas en la información de un curso y pedir detalles.~Kursen börjar i september~El curso empieza en septiembre~Du behöver inga förkunskaper~No necesitas conocimientos previos~När är sista ansökningsdagen?~¿Cuándo es el último día para solicitar?
65~Blanketter och service~Formularios y servicios~Completar una solicitud y preguntar qué documentos hacen falta.~Fyll i alla obligatoriska fält~Rellena todos los campos obligatorios~Jag saknar ett intyg~Me falta un certificado~Vilka handlingar behöver ni?~¿Qué documentos necesitan?
66~Hälsa och vanor~Salud y hábitos~Describir desde cuándo existe un síntoma y comentar hábitos en una consulta.~Besvären började i måndags~Las molestias empezaron el lunes~Jag sov dåligt i veckan~Dormí mal esta semana~Hur länge ska jag vila~¿Cuánto tiempo debo descansar?
67~Vänner och känslor~Amistad y emociones~Expresar preferencias y sentimientos y discrepar de forma respetuosa.~Jag uppskattar din hjälp~Agradezco tu ayuda~Jag ser saken annorlunda~Lo veo de otra manera~Det känns viktigt för mig~Me parece importante
68~Nyheter och information~Noticias e información~Localizar información útil y comparar datos de dos avisos breves.~Enligt meddelandet börjar mötet nio~Según el aviso, la reunión empieza a las nueve~Priset gäller till fredag~El precio es válido hasta el viernes~Tabellen visar två alternativ~La tabla muestra dos opciones
69~Meddelanden i vardagen~Mensajes cotidianos~Escribir mensajes y solicitudes breves con tono apropiado y orden claro.~Jag skriver om min fråga~Escribo porque tengo una pregunta~Skulle du kunna skicka schemat~¿Podrías enviar el horario?~Tack på förhand för hjälpen~Gracias de antemano por la ayuda
70~A2 i praktiken~A2 en la práctica~Resolver una situación de viaje y contarla de forma conectada.~Tåget går från spår fyra~El tren sale del andén cuatro~Vi väljer en annan rutt~Tenemos que elegir otra ruta~Resan blev bättre än väntat~El viaje salió mejor de lo esperado
71~Händelser med sammanhang~Acontecimientos con contexto~Narrar un acontecimiento, ubicarlo y cerrar con una reflexión.~Medan jag väntade regnade det~Mientras esperaba, empezó a llover~Jag hittade vägen på kartan~Encontré el camino con un mapa~Efteråt förstod jag varför~Después entendí por qué
72~Tider och erfarenheter~Tiempos y experiencias~Elegir entre formas verbales de pasado según el significado y el marco temporal.~Jag har aldrig sett norrsken~Nunca he visto la aurora boreal~Förr bodde vi nära stationen~Antes vivíamos cerca de la estación~Mötet hade redan startat~La reunión ya había empezado
73~Ordföljd i bisatser~Orden de palabras en subordinadas~Mantener el orden de palabras en subordinadas y preguntas indirectas.~Att hon inte kan komma~Que ella no puede venir~Jag undrar när tåget går~Me pregunto cuándo sale el tren~Om butiken är öppen~Si la tienda está abierta
74~Relativa satser~Oraciones de relativo~Unir ideas con relativas y evitar repetir el mismo sustantivo.~Boken som ligger här~El libro que está aquí~Kvinnan som ringde söker dig~La mujer que llamó te busca~Huset som har balkong~La casa que tiene balcón
75~Möjlighet och skyldighet~Posibilidad y obligación~Expresar obligación, posibilidad, consejo y consecuencias con precisión.~Du bör kontrollera uppgiften~Deberías comprobar el dato~Väntar vi blir det billigare~Si esperamos, será más barato~Rapporten skrivs efter mötet~El informe se escribe después de la reunión
76~Partikelverb och uttryck~Verbos con partículas y expresiones~Reconocer verbos con partículas y combinarlos con preposiciones frecuentes.~Vi kom överens om tiden~Nos pusimos de acuerdo sobre la hora~Hon tog reda på orsaken~Averiguó la causa~Jag ser fram emot besöket~Espero con ilusión la visita
77~Intervjuer och nyheter~Entrevistas y noticias~Identificar idea principal, detalles y actitud en textos informativos leídos o escuchados.~Intervjun handlar om nya arbetstider~La entrevista trata de nuevos horarios laborales~Reportern frågar efter exempel~El periodista pide ejemplos~Gästen verkar tveksam till förslaget~El invitado parece dudar de la propuesta
78~Instruktioner och fakta~Instrucciones y datos~Interpretar instrucciones, gráficos y un artículo factual más extenso.~Diagrammet visar en tydlig ökning~El gráfico muestra un aumento claro~Läs varningen innan du börjar~Lee la advertencia antes de empezar~Artikeln beskriver tre orsaker~El artículo describe tres causas
79~Samarbete och samtal~Colaboración y conversación~Mantener turnos, pedir aclaración y resumir un acuerdo de grupo.~Kan du förklara det~¿Puedes explicar qué quieres decir?~Jag håller med om delen~Estoy de acuerdo con esa parte~Vi sammanfattar våra beslut~Resumimos nuestras decisiones
80~Skriva och revidera~Escribir y revisar~Redactar una reclamación y un informe breve y revisar cohesión y registro.~Jag vill lämna ett klagomål~Quiero presentar una queja~Förslaget behöver ett tydligt skäl~La propuesta necesita un motivo claro~Jag ändrade sista delen~He cambiado la última parte
81~Arbete och presentationer~Trabajo y presentaciones~Explicar responsabilidades y resultados y responder preguntas sobre una propuesta.~Projektet minskade väntetiden~El proyecto redujo el tiempo de espera~Min viktigaste uppgift var planering~Mi tarea principal era la planificación~Mitt förslag till nästa steg~Esta es mi propuesta para el siguiente paso
82~Samhällsservice och ärenden~Servicios públicos y gestiones~Pedir información administrativa y comparar instrucciones de fuentes públicas.~Kommunen kräver ett giltigt intyg~El municipio requiere un certificado válido~Vart skickar jag ansökan?~¿Adónde envío la solicitud?~Webbplatsen uppdaterades i går~El sitio web se actualizó ayer
83~Kultur och recensioner~Cultura y reseñas~Comentar personajes, contexto cultural y una obra con ejemplos concretos.~Huvudpersonen ändrar sig gradvis~El protagonista cambia poco a poco~Traditionen firas varje vår~La tradición se celebra cada primavera~Berättelsen lämnar flera frågor öppna~La historia deja varias preguntas abiertas
84~Digital kommunikation~Comunicación digital~Evaluar una publicación y adaptar un mensaje al destinatario y al medio.~Inlägget saknar en tydlig källa~La publicación carece de una fuente clara~Skriv det mer formellt~¿Puedes escribirlo de forma más formal?~Länken kontrolleras före svar~Se comprueba el enlace antes de responder
85~B1 i praktiken~B1 en la práctica~Explicar una noticia, producir un texto conectado y revisar el resultado.~Nyheten väckte många frågor~La noticia suscitó muchas preguntas~Först kontrollerade jag källan~Primero comprobé la fuente~Min slutsats bygger på exempel~Mi conclusión se basa en dos ejemplos
86~Samtal och debatt~Conversación y debate~Seguir posturas y matices en una conversación leída o reproducida por voz sintética.~Anteckna huvudpoängen~Anota la idea principal~Invändningen gäller främst kostnaden~La objeción se refiere sobre todo al coste~Tonfallet antyder viss tvekan~El tono sugiere cierta duda
87~Längre texter~Textos extensos~Analizar la postura de un artículo y distinguir descripción, argumento e instrucción.~Författaren ifrågasätter den rådande bilden~El autor cuestiona la visión dominante~Analys och exempel växlar~El análisis y los ejemplos se alternan~Anvisningen gäller samtliga deltagare~La instrucción se aplica a todas las personas participantes
88~Ordföljd och betoning~Orden de palabras y énfasis~Controlar orden, negación y adverbios en subordinadas extensas.~Varför beslutet inte kunde vänta~Explicó por qué la decisión no podía esperar~Om rapporten redan publicerats~Me pregunto si el informe ya se ha publicado~Gruppen granskade materialet trots tidspress~Aunque había poco tiempo, el grupo alcanzó a revisar el material
89~Passiv och nominalisering~Pasiva y nominalización~Elegir formas impersonales y nominales al resumir procedimientos.~Ansökan behandlas inom tre veckor~La solicitud se tramita en un plazo de tres semanas~En granskning av uppgifterna pågår~Está en curso una revisión de los datos~Beslutet fattades efter samråd~La decisión se tomó tras una consulta
90~Partikelverb och idiom~Verbos con partículas e idiomatismos~Interpretar colocaciones, partículas y expresiones según contexto y registro.~Hon tog upp frågan igen~Volvió a plantear el asunto~Det ligger nära till hands~Es lo que viene a la mente de forma natural~Vi får se resultatet~Ya veremos cómo sale
91~Samtalsstrategier~Estrategias conversacionales~Interrumpir con cortesía, retomar el turno y comprobar que se ha entendido.~Jag vill lägga till något~¿Puedo añadir una cosa?~Om jag förstår dig rätt~Si te entiendo bien, la pregunta se refiere al calendario~Jag återkommer till punkten~Permíteme volver a ese punto
92~Argument och motargument~Argumentos y contraargumentos~Construir argumentos con datos y responder a objeciones relevantes.~Undersökningen stöder den tolkningen~El estudio respalda esa interpretación~En möjlig invändning är kostnaden~Una objeción posible es el coste~Sammantaget väger fördelarna tyngre~En conjunto, las ventajas pesan más
93~Källor och syntes~Fuentes y síntesis~Atribuir ideas y resumir coincidencias y discrepancias entre fuentes.~Enligt rapporten ökade efterfrågan~Según el informe, aumentó la demanda~Den andra källan nyanserar bilden~La segunda fuente matiza el panorama~Båda studierna pekar på osäkerhet~Ambos estudios señalan incertidumbre
94~Resonerande texter~Textos argumentativos~Planificar un ensayo, desarrollar razones y revisar su cohesión.~Inledningen presenterar huvudfrågan~La introducción presenta la cuestión principal~Ett motargument bör bemötas sakligt~Conviene responder al contraargumento con objetividad~Avslutningen knyter ihop resonemanget~La conclusión cierra el razonamiento
95~Formell kommunikation~Comunicación formal~Redactar reclamaciones y solicitudes con tono, cortesía y datos precisos.~Jag önskar få ärendet omprövat~Deseo que se vuelva a examinar el caso~Vänligen bekräfta mottagandet skriftligen~Por favor, confirme la recepción por escrito~Jag bifogar relevanta handlingar~Adjunto los documentos pertinentes
96~Svenskt samhälle och kultur~Sociedad y cultura suecas~Consultar fuentes sobre instituciones y explicar prácticas desde una perspectiva intercultural.~Riksdagen stiftar Sveriges lagar~El Parlamento aprueba las leyes de Suecia~Traditionen varierar mellan regioner~La tradición varía entre regiones~Jämförelsen kräver ett historiskt sammanhang~La comparación requiere un contexto histórico
97~Projekt och rapporter~Proyectos e informes~Presentar resultados y gráficos y formular una recomendación profesional.~Diagrammet visar en stabil utveckling~El gráfico muestra una evolución estable~Resultatet överträffade den ursprungliga prognosen~El resultado superó la previsión inicial~Vi rekommenderar en begränsad försöksperiod~Recomendamos un periodo de prueba limitado
98~Vetenskap och samhälle~Ciencia y sociedad~Explicar incertidumbre, límites de datos e impactos de una medida pública.~Resultatet tyder på samband~El resultado apunta a una posible relación~Otillräckligt underlag för slutsats~Base insuficiente para una conclusión~Åtgärden påverkar flera grupper~La medida puede afectar a varios grupos
99~Teknik och offentlighet~Tecnología y esfera pública~Analizar ironía, privacidad y adaptación de mensajes a distintos públicos.~Formuleringen kan läsas ironiskt~La formulación puede leerse con ironía~Personuppgifter bör hanteras varsamt~Los datos personales deben tratarse con cuidado~Budskapet behöver anpassas efter mottagaren~El mensaje debe adaptarse a quien lo recibe
100~B2 i praktiken~B2 en la práctica~Integrar lectura de fuentes, exposición oral, argumentación y autoevaluación.~Dossiern innehåller tre motstridiga källor~El dosier contiene tres fuentes contradictorias~Två belägg stöder förslaget~Defiendo la propuesta con dos pruebas~Självutvärderingen visar nästa utvecklingsmål~La autoevaluación muestra el siguiente objetivo de desarrollo
'''.strip()

LEVEL_NOTES = {
    'A1': 'Lee la expresión como una unidad, identifica la palabra principal y úsala en una situación cotidiana. Si tu dispositivo tiene voz sueca, escucha el ejemplo y repítelo.',
    'A2': 'Observa cómo la expresión sirve para resolver una tarea real. Comprueba quién habla, qué necesita y qué dato permite continuar la conversación.',
    'B1': 'Relaciona la expresión con el propósito del texto. Fíjate en los conectores y reformula la idea con tus propias palabras antes de responder.',
    'B2': 'Analiza el alcance y el registro de la expresión. Distingue el dato de la interpretación, comprueba qué evidencia la sostiene y practica una paráfrasis precisa.',
}

DIALOGUES = {
    'A1': [('Kan du säga det igen', '¿Puedes repetirlo?'), ('Tack', 'Gracias')],
    'A2': [('Kan du läsa uttrycket igen', '¿Puedes leer la expresión otra vez?'), ('Nu förstår jag bättre', 'Ahora lo entiendo mejor')],
    'B1': [('Kan du formulera uttrycket', '¿Puedes formular la expresión?'), ('Nu förstår jag sambandet', 'Ahora entiendo la relación')],
    'B2': [('Kan du precisera formuleringen', '¿Puedes precisar la formulación?'), ('Nu tolkar jag uttrycket', 'Ahora interpreto la expresión')],
}

# Los temas nuevos se alojan en capítulos existentes para que la web conserve la secuencia A1→B2.
CHAPTER_MAP = {
    **dict(zip(range(41, 56), [1, 2, 2, 2, 1, 4, 3, 5, 6, 7, 7, 9, 2, 8, 10])),
    **dict(zip(range(56, 71), [15, 13, 12, 17, 11, 19, 11, 14, 14, 20, 16, 18, 20, 20, 19])),
    **dict(zip(range(71, 86), [21, 21, 30, 21, 24, 24, 23, 23, 22, 30, 24, 25, 28, 23, 30])),
    **dict(zip(range(86, 101), [32, 32, 40, 34, 38, 33, 31, 32, 40, 33, 36, 33, [35, 35, 37], 39, 40])),
}

def lesson_titles():
    text = REPORT.read_text(encoding='utf-8')
    section = None
    titles = {}
    for line in text.splitlines():
        if line.startswith('### '):
            section = line[4:].split(' ')[0]
        if section in {'A1', 'A2', 'B1', 'B2'} and line.startswith('|') and not line.startswith('|---'):
            cells = [x.strip() for x in line.strip('|').split('|')]
            if cells and cells[0].isdigit() and len(cells) >= 4:
                titles[int(cells[0])] = (section, cells[1:4])
    return titles

def main():
    title_map = lesson_titles()
    chapters = []
    for line in DATA.splitlines():
        fields = line.split('~')
        if len(fields) != 10:
            raise SystemExit(f'Fila inválida de datos: {line[:80]}')
        n = int(fields[0])
        chapters.append((n, *fields[1:]))

    for n, cap_sv, cap_es, desc, *expressions in chapters:
        level, es_titles = title_map[n]
        rows = list(zip(expressions[0::2], expressions[1::2]))
        if len(rows) != 3:
            raise SystemExit(f'El capítulo {n} no tiene tres expresiones.')
        out = ['N Anna, Erik']
        for i, ((phrase, translation), es_title) in enumerate(zip(rows, es_titles), 1):
            mapped = CHAPTER_MAP[n]
            capitulo_app = mapped[i-1] if isinstance(mapped, list) else mapped
            if len(re.findall(r'[^\W_]+', phrase)) > 5:
                raise SystemExit(f'La expresión del capítulo {n} excede cinco palabras: {phrase}')
            title_sv = phrase[0].upper() + phrase[1:] if phrase else cap_sv
            vocab_lines = [f'W {phrase.rstrip("?!.,;:")} = {translation}']
            if n == 41 and i == 1:
                vocab_lines = ['W å = letra å', 'W ä = letra ä', 'W ö = letra ö']
            if n == {'A1': 41, 'A2': 56, 'B1': 71, 'B2': 86}[level] and i == 1:
                vocab_lines.extend(f'W {v} = {es}' for v, es in DIALOGUES[level])
            out.extend([
                f'@ {capitulo_app} | {title_sv} | {es_title}',
                f'I Objetivo: {es_title}.',
                f'E {cap_es} :: {desc} **{phrase}** significa «{translation}». {LEVEL_NOTES[level]} Secuencia {i} de 3: incorpora esta expresión y repasa las anteriores.',
                *vocab_lines,
                'V Vocabulario y expresiones clave',
                'T Expresiones de la unidad',
            ])
            # Progresión acumulativa: la unidad reutiliza lo presentado en las lecciones anteriores.
            for seen_phrase, seen_translation in rows[:i]:
                out.append(f'- {seen_phrase} = {seen_translation}')
            dialogue = DIALOGUES[level]
            out.extend([
                '',
                'D Pedir que repitan la expresión',
                f'Anna: {dialogue[0][0]}? = {dialogue[0][1]}',
                f'Erik: {phrase} = {translation}',
                f'Anna: {dialogue[1][0]} = {dialogue[1][1]}',
            ])
            distractors = [tr for j, (_, tr) in enumerate(rows) if j != i-1]
            if len(distractors) < 2:
                distractors = [translation + ' (no)', 'otra expresión']
            answer = translation
            out.extend([
                f'Q ¿Qué significa «{phrase}»?',
                f'+ {answer} :: Es la traducción de la expresión modelo.',
                f'- {distractors[0]} :: Esa traducción corresponde a otra expresión.',
                f'- {distractors[1]} :: Esa traducción corresponde a otra expresión.',
                f'Q ¿Qué expresión corresponde a «{answer}»?',
                f'+ {phrase} :: La frase aparece en el ejemplo.',
                f'- {rows[(i) % 3][0]} :: Esta expresión tiene otro significado.',
                f'- {rows[(i+1) % 3][0]} :: Esta expresión tiene otro significado.',
                f'R {phrase} :: ¿Qué significa?',
                f'+ {answer} :: Traducción de la expresión.',
                f'- {distractors[0]} :: Traducción de otra expresión.',
                f'- {distractors[1]} :: Traducción de otra expresión.',
            ])
            words = re.findall(r'[^\W_]+', phrase)
            hole = words[-1]
            blanked = re.sub(r'(?<!\w)' + re.escape(hole) + r'(?!\w)', '___', phrase, count=1)
            other_words = [re.findall(r'[^\W_]+', x[0])[-1] for j, x in enumerate(rows) if j != i-1]
            while len(other_words) < 2:
                other_words.append('ordet')
            out.extend([
                f'H {blanked} :: Completa la expresión.',
                f'+ {hole} :: Es la última palabra de la expresión modelo.',
                f'- {other_words[0]} :: Esa palabra pertenece a otra expresión.',
                f'- {other_words[1]} :: Esa palabra pertenece a otra expresión.',
                f'O {rows[i-2][0] if i > 1 else phrase} :: {rows[i-2][1] if i > 1 else translation} :: Lee la expresión como una unidad de significado.',
                f'X Escribe en sueco: «{translation}» :: {phrase}',
                f'A {phrase} :: Escucha la expresión y elige su significado.',
                f'+ {answer} :: Coincide con la expresión escuchada.',
                f'- {distractors[0]} :: Corresponde a otra expresión.',
                f'- {distractors[1]} :: Corresponde a otra expresión.',
                '',
            ])
        (SRC / f'{n:02d}.txt').write_text('\n'.join(out).rstrip() + '\n', encoding='utf-8', newline='\n')

    print(f'Escritos {len(chapters)} unidades temáticas y {len(chapters) * 3} lecciones fuente.')

if __name__ == '__main__':
    main()
