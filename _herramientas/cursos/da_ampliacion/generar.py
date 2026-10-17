# -*- coding: utf-8 -*-
"""Builds the editable Danish extension sources; compilar.py creates runtime JSON."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent
DA = ROOT / 'da'
NAMES = 'Sara, Maja, Ali, Emil, Anna, Jonas, Lea, Noor, Lucas, Sofia, Ida, Omar, Freja, Malik, Clara, Elias, Louise, Martin, Grundtvig, Rødding, Nørregade, Aarhus, Odense, Roskilde'

# Support vocabulary shown on tap but kept out of the visible word list. Target terms
# remain visible in each lesson; this map makes the surrounding reading text explorable.
EXTRA_WORDS = dict(line.split(' :: ', 1) for line in '''
æg :: huevo
ændret :: cambiado
ændringer :: cambios
afprøve :: probar
aftes :: anoche
aktiv :: activo
aktiviteter :: actividades
analyse :: análisis
analytikeren :: el analista
anmelderen :: el crítico
annoncen :: el anuncio
ansøgeren :: el solicitante
ansøgninger :: solicitudes
ansvaret :: la responsabilidad
arbejdsevne :: capacidad laboral
arbejdspladsen :: el lugar de trabajo
arbejdstiden :: el horario laboral
årsag :: causa
artiklen :: el artículo
bagagen :: el equipaje
barndomshjemmet :: la casa de la infancia
batterier :: baterías
beboeren :: el residente
beboerrådet :: el consejo vecinal
beder :: pedir
begrundelse :: justificación
begrundes :: justificarse
begyndte :: empezó
bekræfter :: confirma
beløbet :: la cantidad
beskeden :: el mensaje
beskrevne :: descritas
beskriver :: describe
beskytte :: proteger
besøget :: la visita
biblioteker :: bibliotecas
billede :: imagen
billedet :: la imagen
bog :: libro
bøger :: libros
bonen :: el recibo
borgmesteren :: el alcalde
brevet :: la carta
broer :: puentes
bukserne :: los pantalones
busser :: autobuses
busstoppestedet :: la parada de autobús
byer :: ciudades
cookies :: cookies
cykelstien :: el carril bici
danmarks :: de Dinamarca
dataene :: los datos
debatten :: el debate
deles :: compartirse
deltager :: participa
deltagere :: participantes
deltidsansatte :: empleados a tiempo parcial
design :: diseño
detaljer :: detalles
døgnet :: todo el día
drikke :: beber
drypper :: gotea
ejeren :: el dueño
elforbruget :: el consumo eléctrico
engangsvarer :: productos desechables
enig :: de acuerdo
enkel :: sencillo
ens :: iguales
erhvervserfaring :: experiencia laboral
fag :: asignatura
falde :: bajar
fast :: habitual
fastansatte :: empleados fijos
faste :: fijos
fastlandet :: tierra firme
fejlen :: el defecto
femogtyve :: veinticinco
femtende :: decimoquinto
finansiere :: financiar
flytter :: traslada
føler :: se siente
fordeles :: distribuirse
forebyggende :: preventivo
føres :: llevarse
forfatterne :: los autores
forhandleren :: el distribuidor
forhold :: condiciones
forskellen :: la diferencia
forskeren :: el investigador
forstod :: entendió
fortsatte :: continuó
fraflytning :: abandono de la vivienda
frigør :: libera
gæster :: invitados
gennem :: por medio de
gentager :: se repite
givet :: dado
gjort :: hecho
godkendt :: aprobado
grundig :: minuciosa
grupperne :: los grupos
havet :: el mar
historien :: la historia
historisk :: histórico
højere :: superior
højskole :: escuela popular
holdet :: el grupo
husk :: recuerda
hverdagen :: la vida cotidiana
hvile :: reposar
ideen :: la idea
idéen :: la idea
indeholde :: contener
inderste :: más céntrica
indfører :: introduce
indgang :: entrada
indgår :: se incluye
indkøbskurven :: el carrito de compra
indstillingerne :: los ajustes
installerer :: instala
jakken :: la chaqueta
kalder :: llama
kasse :: caja
kjole :: vestido
klagen :: la reclamación
klager :: reclamaciones
køb :: compra
købet :: la compra
køligt :: en un lugar fresco
komælk :: leche de vaca
kommentaren :: el comentario
kommunens :: del municipio
koncentrationen :: la concentración
konstitutionelt :: constitucional
kontakter :: contactos
kontoen :: la cuenta
kontrasten :: el contraste
kopi :: copia
kortere :: más breve
kortet :: la tarjeta
kraftigt :: considerablemente
kravene :: los requisitos
kriterier :: criterios
kritik :: críticas
kritikerne :: los críticos
kritiserer :: critica
kulturhuset :: el centro cultural
kulturhusets :: del centro cultural
kunden :: el cliente
kunderne :: los clientes
kunstnerens :: del artista
kurset :: el curso
lad :: deja
læsetid :: tiempo de lectura
lav :: bajo
legepladsen :: el parque infantil
løsningen :: la solución
løsninger :: soluciones
lugten :: el olor
lukning :: cierre
måler :: mide
målingen :: la medición
måltidet :: la comida
medarbejdernes :: de los empleados
medicinen :: el medicamento
mel :: harina
millioner :: millones
misforstået :: entendido mal
mødelokalet :: la sala de reuniones
modtaget :: recibido
musikken :: la música
naboernes :: de los vecinos
nær :: cerca
nærmere :: con más detalle
nederst :: al final
nedsat :: reducida
nødder :: frutos secos
normal :: normal
nyt :: nuevo
ofte :: a menudo
øge :: aumentar
øjekast :: vistazo
omkostningen :: el coste
opfyldt :: cumplidos
opgaven :: la tarea
oplysningerne :: la información
oprindelige :: original
opslaget :: la publicación
optager :: ocupa
ordene :: las palabras
ordforråd :: vocabulario
passagerer :: pasajeros
påvirker :: afecta
pladsen :: la plaza
planen :: el plan
planter :: árboles
posen :: la bolsa
præsentationen :: la presentación
prioriterer :: prioriza
priserne :: los precios
procent :: por ciento
produkter :: productos
produktet :: el producto
produktionen :: la producción
rådet :: el ayuntamiento
rådgivningen :: el asesoramiento
regler :: normas
reglerne :: las normas
regnskabet :: la contabilidad
renoveringen :: la renovación
reparerer :: repara
reserveret :: reservado
resultatet :: el resultado
rettes :: corregirse
risikerer :: corre el riesgo
romanen :: la novela
sænke :: reducir
særlige :: especiales
sættes :: se coloca
sal :: planta
salen :: la sala
sandwichen :: el sándwich
seksogtredive :: treinta y seis
send :: envía
senest :: como muy tarde
sensoren :: el sensor
ser :: parece
servicen :: el servicio
signalfejl :: fallo de señalización
skolens :: del centro escolar
skoletid :: después de clase
skriftlig :: por escrito
skriftligt :: por escrito
skriv :: escribe
slutningen :: el final
slutter :: termina
solparken :: el parque solar
søndagen :: los domingos
søsterhotellet :: el hotel asociado
søvn :: sueño
spiser :: come
sproget :: el idioma
sprogmiljøer :: entornos lingüísticos
steg :: subió
støjen :: el ruido
støjniveauet :: el nivel de ruido
støtten :: el apoyo
støtter :: apoya
styrke :: reforzar
suppe :: sopa
systemet :: el sistema
systemets :: del sistema
tæller :: cuenta
tæt :: cerca
tallet :: la cifra
teksten :: el texto
tekster :: textos
tidlige :: primeros
tidsplan :: el horario
tilbagebetales :: se devuelve
tilbyder :: ofrece
tiltaget :: la medida
time :: hora
tjenesten :: el servicio
tomt :: vacío
truffet :: tomado
tryggere :: más seguras
udgiften :: el gasto
udgifter :: gastos
uklart :: no está claro
underskrevet :: firmada
universitetet :: la universidad
upraktisk :: poco práctica
vådt :: mojado
værelserne :: las habitaciones
værker :: obras
vagt :: turno
vagter :: turnos
vagtplan :: cuadrante
valget :: la elección
vandhanen :: el grifo
vare :: artículo
varen :: el artículo
varer :: productos
varierer :: varían
varmeanlægget :: la calefacción
vedtog :: aprobó
ven :: amigo
vikarer :: sustitutos
vilkårene :: las condiciones
virke :: parecer
virksomheden :: la empresa
voksne :: adultos
weekenden :: el fin de semana
bror :: hermano
pakke :: paquete
læreren :: el profesor
eleverne :: los alumnos
læse :: leer
'''.strip().splitlines())

# Each unit has three short lessons. Each lesson has two original Danish reading lines;
# the final four fields are the headword and its Spanish meaning.
UNITS = [
 (38,'A1','Kontaktkort','Datos personales','A1 · Formularios básicos, datos de contacto, nacionalidad y preguntas personales.','En una ficha se busca primero el campo y después el dato. El sujeto suele aparecer antes del verbo; las preguntas de dato empiezan con la palabra interrogativa.','A1',[
  ('Et profilkort','Una ficha personal',('Jeg hedder Sara.','Me llamo Sara.','hedder','llamarse'),('Jeg bor i Aarhus.','Vivo en Aarhus.','bor','vivir')),
  ('Kontaktoplysninger','Datos de contacto',('Mit telefonnummer står her.','Mi número de teléfono está aquí.','telefonnummer','número de teléfono'),('Min adresse er Nørregade tolv.','Mi dirección es Nørregade doce.','adresse','dirección')),
  ('Spørgsmål i en formular','Preguntas de un formulario',('Hvor kommer du fra?','¿De dónde eres?','kommer','venir'),('Hvilket sprog taler du?','¿Qué idioma hablas?','sprog','idioma'))]),
 (39,'A1','Boligopslag','Vivienda y alquiler','A1 · Habitaciones, anuncios de vivienda, ubicación y expresiones sencillas para describir una casa.','En un anuncio localiza primero el tipo de vivienda, el precio y la fecha. Para indicar dónde está algo, el danés usa expresiones como i, på y ved.','A1',[
  ('Et værelse til leje','Una habitación en alquiler',('Værelset er lyst og møbleret.','La habitación es luminosa y está amueblada.','værelset','la habitación'),('Huslejen er fire tusind kroner om måneden.','El alquiler es de cuatro mil coronas al mes.','huslejen','el alquiler')),
  ('Rum i boligen','Estancias de la vivienda',('Køkkenet ligger ved siden af stuen.','La cocina está al lado del salón.','køkkenet','la cocina'),('Badeværelset er lille, men rent.','El baño es pequeño, pero limpio.','badeværelset','el baño')),
  ('En enkel boligbeskrivelse','Describir una vivienda',('Der er to værelser og en altan.','Hay dos habitaciones y un balcón.','altan','balcón'),('Lejligheden ligger tæt på stationen.','El piso está cerca de la estación.','lejligheden','el piso'))]),
 (40,'A1','Hverdag og tider','Rutinas y horarios','A1 · Actividades diarias, horas, días de la semana y lectura de un horario sencillo.','En una rutina, distingue la hora de la frecuencia: klokken otte indica cuándo; hver dag indica con qué frecuencia. En una frase principal afirmativa, el verbo conjugado ocupa el segundo lugar.','A1',[
  ('Morgenrutine','Rutina de mañana',('Jeg står op klokken syv.','Me levanto a las siete.','står op','levantarse'),('Bussen kører kvart over otte.','El autobús sale a las ocho y cuarto.','kører','circular; salir')),
  ('En dagsplan','Un plan del día',('Først spiser vi morgenmad.','Primero desayunamos.','først','primero'),('Derefter arbejder Lea på kontoret.','Después Lea trabaja en la oficina.','derefter','después')),
  ('Åbningstider','Horarios de apertura',('Biblioteket lukker klokken seksten.','La biblioteca cierra a las dieciséis.','lukker','cerrar'),('Om lørdagen åbner butikken senere.','Los sábados la tienda abre más tarde.','åbner','abrir'))]),
 (41,'A1','Mad og menukort','Comida y menús','A1 · Platos, bebidas, precios y lectura de un menú breve.','En un menú, el nombre del plato suele ir seguido de los ingredientes o del precio. Para pedir con cortesía puedes usar «Jeg vil gerne have …, tak»; tak funciona en esta fórmula, pero no es una traducción universal de «por favor».','A1',[
  ('En café','En una cafetería',('Jeg vil gerne have en kop te.','Quisiera una taza de té.','kop','taza'),('Sandwichen koster fyrre kroner.','El sándwich cuesta cuarenta coronas.','koster','costar')),
  ('Retter på menuen','Platos del menú',('Dagens suppe er med kartofler.','La sopa del día lleva patatas.','dagens','del día'),('Fisken serveres med salat.','El pescado se sirve con ensalada.','serveres','se sirve')),
  ('En enkel bestilling','Un pedido sencillo',('Vi deler en kage efter maden.','Compartimos un pastel después de comer.','deler','compartir'),('Vandet er gratis.','El agua es gratis.','gratis','gratis'))]),
 (42,'A1','Skilte i byen','Señales de la ciudad','A1 · Señales habituales, lugares de la ciudad, servicios y horarios.','Las señales suelen usar pocas palabras. Compara el sustantivo con el verbo para saber si indican un lugar, una prohibición o una acción.','A1',[
  ('Steder i byen','Lugares de la ciudad',('Apoteket ligger over for banken.','La farmacia está enfrente del banco.','apoteket','la farmacia'),('Torvet er åbent om søndagen.','La plaza está abierta los domingos.','torvet','la plaza')),
  ('Et skilt på døren','Un cartel en la puerta',('Indgangen er på den anden side.','La entrada está al otro lado.','indgangen','la entrada'),('Kontoret holder lukket i dag.','La oficina permanece cerrada hoy.','lukket','cerrado')),
  ('Find vej','Encontrar el camino',('Gå ligeud til lyskrydset.','Sigue recto hasta el semáforo.','lyskrydset','el semáforo'),('Drej til venstre ved kirken.','Gira a la izquierda junto a la iglesia.','drej','girar'))]),
 (43,'A1','Bus og tog','Autobuses y trenes','A1 · Transporte público, estaciones, destinos y lectura de una tabla de salidas.','En una tabla, busca la columna de destino y la hora. «Fra» señala el origen y «til» el destino. Las horas pueden escribirse con formato digital.','A1',[
  ('På stationen','En la estación',('Toget til Odense går fra spor tre.','El tren a Odense sale del andén tres.','spor','andén'),('Afgangen er klokken ni femogtyve.','La salida es a las nueve y veinticinco.','afgangen','la salida')),
  ('En busbillet','Un billete de autobús',('En billet gælder i en time.','Un billete es válido durante una hora.','billet','billete'),('Du kan købe kortet i automaten.','Puedes comprar la tarjeta en la máquina.','automaten','la máquina')),
  ('Skift undervejs','Transbordos',('Vi skifter tog i Roskilde.','Cambiamos de tren en Roskilde.','skifter','cambiar'),('Bussen standser ved rådhuset.','El autobús para junto al ayuntamiento.','standser','parar'))]),
 (44,'A1','Tøj og størrelser','Ropa y tallas','A1 · Prendas, colores, tallas, precios y frases de compra frecuentes.','Para entender una etiqueta, identifica primero la prenda y después la talla o el precio. El adjetivo cambia según el sustantivo: una forma frecuente ante nombres definidos es la terminación -e.','A1',[
  ('I tøjbutikken','En la tienda de ropa',('Den blå jakke koster fem hundrede kroner.','La chaqueta azul cuesta quinientas coronas.','jakke','chaqueta'),('Størrelsen er for lille til mig.','La talla es demasiado pequeña para mí.','størrelsen','la talla')),
  ('Prøverummet','El probador',('Må jeg prøve den sorte kjole?','¿Puedo probarme el vestido negro?','prøve','probar'),('Bukserne passer godt.','Los pantalones quedan bien.','passer','quedar; encajar')),
  ('En bon','Un recibo',('Kvitteringen ligger i posen.','El recibo está dentro de la bolsa.','kvitteringen','el recibo'),('Du kan bytte varen inden otte dage.','Puedes cambiar el artículo en ocho días.','bytte','cambiar'))]),
 (45,'A1','På apoteket','En la farmacia','A1 · Síntomas corrientes, partes del cuerpo, productos de farmacia e instrucciones breves.','En un envase, busca la dosis, el momento y la advertencia. «Må» puede expresar permiso o posibilidad; «skal» suele marcar una instrucción u obligación.','A1',[
  ('Et symptom','Un síntoma',('Jeg har ondt i halsen.','Me duele la garganta.','halsen','la garganta'),('Hun har feber og hoster.','Tiene fiebre y tose.','feber','fiebre')),
  ('Medicinens etiket','La etiqueta del medicamento',('Tag én tablet om aftenen.','Toma una pastilla por la noche.','tablet','pastilla'),('Medicinen skal opbevares køligt.','El medicamento debe guardarse en un lugar fresco.','opbevares','guardarse')),
  ('En aftale hos lægen','Una cita médica',('Lægen har tid på tirsdag.','El médico tiene cita disponible el martes.','lægen','el médico'),('Mødet begynder klokken halv ti.','La cita empieza a las nueve y media.','begynder','empezar'))]),
 (46,'A1','Fritid og arrangementer','Ocio y eventos','A1 · Carteles de actividades, fechas, lugares y planes sencillos de tiempo libre.','En un cartel de evento, localiza actividad, fecha, lugar y precio. «På fredag» sitúa algo en un día; «klokken» introduce la hora.','A1',[
  ('En koncertplakat','Un cartel de concierto',('Koncerten er på fredag i kulturhuset.','El concierto es el viernes en el centro cultural.','koncerten','el concierto'),('Dørene åbner klokken nitten.','Las puertas abren a las diecinueve.','dørene','las puertas')),
  ('Planer for weekenden','Planes para el fin de semana',('Vi besøger museet om lørdagen.','Visitamos el museo los sábados.','besøger','visitar'),('Billetten er gratis for børn.','La entrada es gratis para los niños.','billetten','la entrada')),
  ('En invitation','Una invitación',('Kommer du til festen på søndag?','¿Vienes a la fiesta el domingo?','festen','la fiesta'),('Jeg tager gerne en ven med.','Me llevo con gusto a un amigo.','med','con; llevar'))]),
 (47,'A1','Beskeder og opslag','Mensajes y avisos','A1 · Mensajes breves, avisos de edificio y consignas cotidianas.','Lee primero quién escribe y para quién. En una instrucción, el verbo suele aparecer al principio: «Luk døren» (cierra la puerta). «Venligst» aparece en solicitudes formales; en peticiones cotidianas son comunes otras fórmulas corteses.','A1',[
  ('En kort besked','Un mensaje breve',('Jeg kommer hjem efter arbejde.','Vuelvo a casa después del trabajo.','arbejde','trabajo'),('Maden står i køleskabet.','La comida está en el frigorífico.','køleskabet','el frigorífico')),
  ('Et opslag i opgangen','Un aviso en el portal',('Vaskerummet er optaget til klokken tolv.','La lavandería está ocupada hasta las doce.','vaskerummet','la lavandería'),('Husk at slukke lyset.','Recuerda apagar la luz.','slukke','apagar')),
  ('En enkel vejledning','Una instrucción sencilla',('Sæt kortet i automaten.','Introduce la tarjeta en la máquina.','sæt','poner; introducir'),('Tryk på den grønne knap.','Pulsa el botón verde.','knap','botón'))]),
 (48,'A1','Læsning fra hverdagen','Lecturas prácticas A1','A1 · Repaso de lectura funcional: perfiles, horarios, precios, instrucciones y avisos.','Para resolver una tarea cotidiana, combina el tipo de documento con la pregunta: una fecha se busca en el calendario, un precio en el menú y una acción en la instrucción. Vuelve al texto para confirmar el dato.','A1',[
  ('En åbningstid','Un horario de apertura',('Svømmehallen åbner klokken seks.','La piscina abre a las seis.','svømmehallen','la piscina'),('Sidste adgang er klokken tyve.','El último acceso es a las veinte.','adgang','el acceso')),
  ('En kvittering','Un recibo',('Brødet koster tolv kroner.','El pan cuesta doce coronas.','brødet','el pan'),('Den samlede pris er seksogtredive kroner.','El precio total es de treinta y seis coronas.','samlede','total')),
  ('En besked om et møde','Un mensaje sobre una cita',('Mødet er flyttet til torsdag.','La cita se ha cambiado al jueves.','flyttet','cambiado'),('Ring til kontoret efter klokken ti.','Llama a la oficina después de las diez.','ring','llamar'))]),

 (49,'A2','Arbejde og vagtplan','Trabajo y turnos','A2 · Leer turnos, tareas habituales, mensajes de trabajo y cambios de horario.','En un mensaje laboral distingue el turno previsto de un cambio ya acordado. El pasado se forma a menudo con -ede o -te, aunque algunos verbos son irregulares.','A2',[
  ('En vagtplan','Un cuadrante',('Maja arbejder fra otte til fire.','Maja trabaja de ocho a cuatro.','arbejder','trabajar'),('På fredag bytter hun vagt med Ali.','El viernes cambia el turno con Ali.','bytter','cambiar')),
  ('En besked fra lederen','Un mensaje de la responsable',('Lederen har flyttet mødet til mandag.','La responsable ha cambiado la reunión al lunes.','lederen','la persona responsable'),('Alle skal læse den nye plan.','Todos deben leer el nuevo plan.','plan','plan')),
  ('Arbejdsopgaver','Tareas de trabajo',('Først tager Jonas imod gæsterne.','Primero Jonas recibe a los visitantes.','gæsterne','los visitantes'),('Derefter rydder han mødelokalet.','Después ordena la sala de reuniones.','rydder','ordenar; despejar'))]),
 (50,'A2','På kursus','En clase y en un curso','A2 · Horarios de clase, tareas, avisos académicos y comprensión de instrucciones.','En las instrucciones, «skal» marca lo que hay que hacer; «kan» señala una posibilidad. Las subordinadas con «fordi» mantienen el sujeto antes del verbo conjugado.','A2',[
  ('Et kursusskema','Un horario de curso',('Danskkurset begynder klokken halv seks.','El curso de danés empieza a las cinco y media.','Danskkurset','curso de danés'),('Lokale fire ligger på første sal.','El aula cuatro está en la primera planta.','lokale','aula')),
  ('En opgave','Una tarea',('I skal læse teksten før timen.','Tenéis que leer el texto antes de la clase.','læse','leer'),('Læreren forklarer ordene, fordi de er nye.','El profesor explica las palabras porque son nuevas.','forklarer','explicar')),
  ('Fravær og besked','Ausencia y mensaje',('Lea var syg i går og blev hjemme.','Lea estuvo enferma ayer y se quedó en casa.','syg','enfermo'),('Hun sender opgaven i morgen.','Enviará la tarea mañana.','sender','enviar'))]),
 (51,'A2','Bolig og naboer','Vivienda y convivencia','A2 · Anuncios de alquiler, normas del edificio, reparaciones y comunicación con vecinos.','En un anuncio identifica condiciones, fecha y coste. En una queja breve, separa el problema de la petición. «Fordi» introduce la causa; «derfor» suele introducir una consecuencia y lleva inversión si abre la frase principal.','A2',[
  ('En boligannonce','Un anuncio de vivienda',('Lejligheden har tre værelser og en lille gårdhave.','El piso tiene tres habitaciones y un pequeño patio.','gårdhave','patio'),('Den er ledig fra første august.','Está disponible desde el uno de agosto.','ledig','disponible')),
  ('En besked til naboen','Un mensaje al vecino',('Musikken var høj i går aftes.','La música estaba alta anoche.','høj','alto'),('Kan du skrue ned efter klokken ti?','¿Puedes bajar el volumen después de las diez?','skrue ned','bajar el volumen')),
  ('En reparation','Una reparación',('Vandhanen drypper, så gulvet bliver vådt.','El grifo gotea, así que el suelo se moja.','vandhane','grifo'),('Viceværten kommer på onsdag.','El encargado viene el miércoles.','viceværten','el encargado'))]),
 (52,'A2','Rejse og hotel','Viajes y alojamiento','A2 · Reservas, horarios, instalaciones del hotel y preguntas indirectas frecuentes.','En una confirmación de reserva comprueba nombre, fechas, tipo de habitación y condiciones. En una pregunta indirecta, el orden suele ser el de una oración subordinada: «Jeg vil gerne vide, hvornår toget går».','A2',[
  ('En hotelreservation','Una reserva de hotel',('Vi har reserveret et dobbeltværelse i tre nætter.','Hemos reservado una habitación doble para tres noches.','dobbeltværelse','habitación doble'),('Morgenmad er inkluderet i prisen.','El desayuno está incluido en el precio.','inkluderet','incluido')),
  ('Hotellets oplysninger','Información del hotel',('Receptionen er åben hele døgnet.','La recepción está abierta todo el día.','receptionen','la recepción'),('Gæsterne kan opbevare bagagen her.','Los huéspedes pueden dejar el equipaje aquí.','opbevare','guardar')),
  ('En ændring af rejsen','Un cambio de viaje',('Jeg vil gerne vide, hvornår bussen kører.','Quisiera saber cuándo sale el autobús.','hvornår','cuándo'),('Hotellet bekræfter ændringen på e-mail.','El hotel confirma el cambio por correo electrónico.','ændringen','el cambio'))]),
 (53,'A2','Forsinkelser og nye planer','Retrasos y cambios de planes','A2 · Leer avisos de transporte, entender causas y localizar alternativas y nuevos horarios.','Un aviso de retraso contiene el servicio afectado, el motivo si se conoce y la alternativa. «På grund af» va seguido de un sustantivo; «fordi» introduce una oración con verbo.','A2',[
  ('En forsinkelse','Un retraso',('Toget er forsinket på grund af signalfejl.','El tren lleva retraso por un fallo de señalización.','forsinket','retrasado'),('Det næste tog kører om tyve minutter.','El siguiente tren sale dentro de veinte minutos.','næste','siguiente')),
  ('En aflysning','Una cancelación',('Afgangen er aflyst, fordi vejen er lukket.','La salida se ha cancelado porque la carretera está cerrada.','aflyst','cancelado'),('Passagererne kan tage en anden bus.','Los pasajeros pueden tomar otro autobús.','passagererne','los pasajeros')),
  ('En ny aftale','Un nuevo plan',('Vi kommer senere end planlagt.','Llegaremos más tarde de lo previsto.','planlagt','previsto'),('Kan vi mødes efter klokken syv i stedet?','¿Podemos quedar después de las siete en su lugar?','i stedet','en su lugar'))]),
 (54,'A2','Køb, retur og garanti','Compras, devoluciones y garantía','A2 · Recibos, devoluciones, defectos, plazos y condiciones de compra.','Al leer una política de devolución, separa el plazo, el estado exigido del artículo y el comprobante. «Hvis» puede introducir una condición; el orden de la oración depende de si es principal o subordinada.','A2',[
  ('En kvittering','Un recibo',('Jakken kostede seks hundrede kroner.','La chaqueta costó seiscientas coronas.','kostede','costar'),('Købsdatoen står nederst på bonen.','La fecha de compra aparece al final del recibo.','købsdatoen','fecha de compra')),
  ('En returregel','Una norma de devolución',('Du kan bytte varen inden tredive dage.','Puedes cambiar el artículo en treinta días.','bytte','cambiar'),('Hvis mærket sidder på, får du pengene tilbage.','Si conserva la etiqueta, te devuelven el dinero.','mærket','la etiqueta')),
  ('En reklamation','Una reclamación',('Glasset gik i stykker efter to dage.','El vaso se rompió después de dos días.','gik i stykker','romperse'),('Butikken undersøger fejlen og svarer skriftligt.','La tienda revisa el defecto y responde por escrito.','undersøger','examinar'))]),
 (55,'A2','Opskrifter og allergener','Recetas y alérgenos','A2 · Ingredientes, cantidades, pasos de una receta y advertencias alimentarias.','Las recetas suelen expresar instrucciones con imperativo y cantidades con unidades. En una etiqueta, busca «indeholder» (contiene) y «kan indeholde» (puede contener): no expresan el mismo grado de certeza.','A2',[
  ('En kort opskrift','Una receta breve',('Bland mel og mælk i en skål.','Mezcla harina y leche en un cuenco.','bland','mezclar'),('Lad dejen hvile i ti minutter.','Deja reposar la masa diez minutos.','dejen','la masa')),
  ('Ingredienser på pakken','Ingredientes del envase',('Produktet indeholder mælk og nødder.','El producto contiene leche y frutos secos.','indeholder','contener'),('Det kan også indeholde spor af æg.','También puede contener trazas de huevo.','spor','trazas')),
  ('En ændring af opskriften','Un cambio en la receta',('Vi bruger havremælk i stedet for komælk.','Usamos leche de avena en lugar de leche de vaca.','havremælk','leche de avena'),('Derfor passer kagen til flere gæster.','Por eso el pastel es apto para más invitados.','passer','ser adecuado'))]),
 (56,'A2','Sundhed og vejledning','Salud e instrucciones','A2 · Citas, recomendaciones, dosis, indicaciones y mensajes de salud cotidianos.','En una instrucción médica, distingue recomendación de obligación: «bør» aconseja; «skal» indica una pauta que se debe seguir. Comprueba la frecuencia y la duración además del medicamento.','A2',[
  ('En lægetid','Una cita médica',('Klinikken har givet Lea en tid.','La clínica le ha dado una cita a Lea.','klinikken','la clínica'),('Hun skal møde fastende klokken otte.','Debe acudir en ayunas a las ocho.','fastende','en ayunas')),
  ('En vejledning','Una indicación',('Tag medicinen efter måltidet.','Toma el medicamento después de la comida.','medicinen','medicamento'),('Du bør drikke vand i løbet af dagen.','Deberías beber agua a lo largo del día.','dagen','el día')),
  ('Et svar fra klinikken','Una respuesta de la clínica',('Prøven var normal, men lægen vil tale med dig.','La prueba fue normal, pero el médico quiere hablar contigo.','prøven','la prueba'),('Ring til klinikken, hvis du får feber.','Llama a la clínica si tienes fiebre.','feber','fiebre'))]),
 (57,'A2','Skemaer og offentlige beskeder','Formularios y avisos públicos','A2 · Formularios sencillos, plazos, datos requeridos y comunicaciones de servicios.','En un formulario, lee la etiqueta de cada campo y no confundas el plazo con la fecha de emisión. Los textos administrativos usan con frecuencia sustantivos compactos como «ansøgning» (solicitud).','A2',[
  ('Et digitalt skema','Un formulario digital',('Skriv din adresse i det første felt.','Escribe tu dirección en el primer campo.','felt','campo'),('Du skal også vælge din kommune.','También debes elegir tu municipio.','kommune','municipio')),
  ('Et brev fra kommunen','Una carta del municipio',('Kommunen mangler en kopi af dit pas.','Al municipio le falta una copia de tu pasaporte.','mangler','faltar'),('Send dokumentet inden den femtende maj.','Envía el documento antes del quince de mayo.','dokumentet','el documento')),
  ('En digital kvittering','Un comprobante digital',('Din ansøgning er modtaget.','Tu solicitud ha sido recibida.','ansøgning','solicitud'),('Du får svar inden for fire uger.','Recibirás una respuesta en un plazo de cuatro semanas.','svar','respuesta'))]),
 (58,'A2','Kultur og fritid','Cultura y ocio','A2 · Carteleras culturales, reseñas breves, opiniones y detalles de una actividad.','En una reseña sencilla separa la información (qué, dónde y cuándo) de la valoración. Adjetivos como «spændende» y «kedelig» expresan opinión; el comparativo permite contrastar dos propuestas.','A2',[
  ('En museumsplakat','Un cartel de museo',('Udstillingen viser moderne dansk design.','La exposición muestra diseño danés contemporáneo.','Udstillingen','la exposición'),('Museet lukker tidligere på mandag.','El museo cierra más temprano el lunes.','tidligere','más temprano')),
  ('En kort anmeldelse','Una reseña breve',('Forestillingen var spændende, men lidt lang.','El espectáculo fue emocionante, pero un poco largo.','forestillingen','el espectáculo'),('Musikken var bedre end forventet.','La música fue mejor de lo esperado.','forventet','esperado')),
  ('Vælg en aktivitet','Elegir una actividad',('Fotoudstillingen er billigere end koncerten.','La exposición fotográfica es más barata que el concierto.','fotoudstillingen','la exposición fotográfica'),('Begge arrangementer begynder klokken syv.','Los dos eventos empiezan a las siete.','arrangementer','eventos'))]),

 (59,'A2+','Danmark i korte faktatekster','Dinamarca en textos breves','A2+ · Textos factuales breves sobre geografía, vida cotidiana y sociedad danesa.','En un texto factual breve, distingue el dato verificable de la explicación. Fíjate en nombres propios, fechas y conectores temporales; no deduzcas una regla general a partir de un único ejemplo.','A2+',[
  ('Geografi i korte træk','Geografía en pocas palabras',('Danmark består af Jylland og mange øer.','Dinamarca está formada por Jutlandia y muchas islas.','består af','estar formado por'),('Broer forbinder flere øer med fastlandet.','Los puentes conectan varias islas con tierra firme.','forbinder','conectar')),
  ('Hverdagsliv og foreninger','Vida cotidiana y asociaciones',('Mange mødes i en lokal forening efter arbejde.','Muchas personas se reúnen en una asociación local después del trabajo.','forening','asociación'),('Frivillige hjælper med aktiviteter for børn.','Los voluntarios ayudan con actividades para niños.','frivillige','voluntarios')),
  ('Et historisk faktum','Un dato histórico',('Danmarks grundlov blev underskrevet i 1849.','La Constitución de Dinamarca se firmó en 1849.','grundlov','Constitución'),('Siden da har landet været et konstitutionelt monarki.','Desde entonces el país ha sido una monarquía constitucional.','monarki','monarquía'))]),
 (60,'A2+','To korte synspunkter','Dos opiniones breves','A2+ · Identificar opiniones, razones y diferencias entre dos textos cortos sobre un tema común.','Una opinión puede reconocerse por «jeg synes» o «efter min mening». Busca la razón que la acompaña y comprueba si el segundo texto está de acuerdo, matiza o discrepa.','A2+',[
  ('Cykler i byen','Bicicletas en la ciudad',('Maja mener, at flere cykelstier gør byen tryggere.','Maja opina que más carriles bici hacen la ciudad más segura.','cykelstier','carriles bici'),('Ali er enig, men han ønsker bedre belysning.','Ali está de acuerdo, pero quiere mejor iluminación.','belysning','iluminación')),
  ('Madspild','Desperdicio de comida',('Lea køber varer tæt på udløbsdatoen for at spare penge.','Lea compra productos próximos a caducar para ahorrar dinero.','udløbsdatoen','fecha de caducidad'),('Jonas synes, at butikkerne også har et ansvar.','Jonas cree que las tiendas también tienen responsabilidad.','ansvar','responsabilidad')),
  ('En fælles løsning','Una solución compartida',('Begge tekster foreslår, at kommunen planter flere træer.','Ambos textos proponen que el municipio plante más árboles.','foreslår','proponer'),('Den ene tekst nævner prisen, mens den anden taler om skygge.','Un texto menciona el coste, mientras que el otro habla de sombra.','skygge','sombra'))]),
 (61,'A2+','Læsning med flere trin','Lectura A2+ integrada','A2+ · Integrar datos, secuencia, causa y postura en textos breves de la vida pública.','Lee la pregunta antes de releer. Para una fecha o cantidad, localiza el dato literal; para una conclusión, reúne dos pistas del texto y evita añadir información que no aparece.','A2+',[
  ('Find dato og tidspunkt','Localizar un dato y una hora',('Svømmehallen ændrer åbningstid fra den første oktober.','La piscina cambia su horario desde el uno de octubre.','åbningstid','horario de apertura'),('På hverdage lukker den nu klokken tyve.','Ahora cierra a las veinte los días laborables.','hverdage','días laborables')),
  ('Følg årsag og resultat','Seguir causa y resultado',('Biblioteket lukker en uge, fordi taget skal repareres.','La biblioteca cierra una semana porque hay que reparar el tejado.','taget','el tejado'),('Bøger kan afleveres i den udvendige kasse.','Los libros se pueden devolver en el buzón exterior.','afleveres','devolverse')),
  ('Skeln mellem fakta og mening','Distinguir hechos y opiniones',('Rådet oplyser, at parken får nye bænke i juni.','El ayuntamiento informa de que el parque tendrá bancos nuevos en junio.','oplyser','informar'),('En beboer synes, at arbejdet burde begynde tidligere.','Un residente opina que las obras deberían empezar antes.','beboer','residente'))]),
]

SPLITS = [
 (17,'A2+','Partikler i en samtale','Matices de las partículas','Partículas modales frecuentes en mensajes y diálogos escritos.','Las partículas no tienen una traducción fija. «Nok» puede presentar una expectativa; «da» puede suavizar una propuesta o recordar algo compartido. El contexto decide la interpretación.','A2+',[('Forventning og forslag','Expectativa y propuesta',('Louise kommer nok lidt senere.','Louise seguramente llegará un poco más tarde.','nok','seguramente'),('Du kan da spørge Martin først.','Pero puedes preguntarle primero a Martin.','da','partícula de propuesta'))]),
 (17,'A2+','Få nogen til at gøre noget','Hacer que alguien haga algo','Comprender la construcción causativa få nogen til at + infinitivo en ejemplos breves.','La construcción «få nogen til at + infinitivo» expresa que alguien consigue o provoca que otra persona haga algo. El verbo principal aparece en infinitivo después de «til at».','A2+',[('En opgave der bliver gjort','Una tarea que alguien hace',('Lea fik sin bror til at hente en pakke.','Lea consiguió que su hermano recogiera un paquete.','fik','consiguió que'),('Læreren får eleverne til at læse teksten.','El profesor hace que los alumnos lean el texto.','får','hace que'))]),
 (17,'A2+','Historie i en tidslinje','Historia en una cronología','Leer una cronología breve y distinguir hechos históricos de descripciones generales.','Una cronología ordena hechos, pero no demuestra por sí sola que uno causara el siguiente. Las fechas y los marcadores «senere» y «siden» ayudan a seguir el periodo. No conviertas un dato de una época en una afirmación sobre la actualidad.','A2+',[('En kort tidslinje','Una cronología breve',('Grundtvig nævnte ideen om en højskole i 1831.','Grundtvig mencionó la idea de una escuela popular en 1831.','nævnte','mencionar'),('Rødding Højskole åbnede i 1844.','La escuela popular de Rødding abrió en 1844.','åbnede','abrir'))]),
 (18,'A2+','Annoncer med korte oplysninger','Anuncios con información breve','Leer anuncios de servicios, horarios y disponibilidad sin depender de afirmaciones actuales no fechadas.','En un anuncio localiza qué se ofrece, desde cuándo y cómo responder. Las formas pasivas en «-s» son habituales en carteles: «sælges» = se vende.','A2+',[('Et opslag til salg','Un anuncio de venta',('Brugte cykler sælges ved stationen.','Se venden bicicletas usadas junto a la estación.','sælges','se venden'),('Annoncen gælder til den første juni.','El anuncio es válido hasta el uno de junio.','gælder','ser válido'))]),
 (18,'A2+','Regler og åbningstider','Normas y horarios','Interpretar carteles breves, restricciones, horarios y pasivas impersonales.','Los carteles omiten a menudo el sujeto porque la norma se aplica a todas las personas. «Må ikke» expresa prohibición; comprueba también las excepciones y los horarios.','A2+',[('Regler i parken','Normas del parque',('Hunde skal føres i snor nær legepladsen.','Los perros deben ir con correa cerca del parque infantil.','snor','correa'),('Parken lukkes klokken toogtyve.','El parque cierra a las veintidós.','lukkes','se cierra'))]),
 (19,'A2+','Stedord og ejerskab','Pronombres y posesión','Repasar pronombres personales, posesivos, reflexivos y relativos en frases breves.','El posesivo reflexivo «sin/sit/sine» remite al sujeto de la misma oración; «hans/hendes/deres» suele remitir a otra persona. «Der/som» puede introducir una relativa.','A2+',[('Hvem ejer hvad?','¿Quién posee qué?',('Maja tager sin bog med til kurset.','Maja lleva su propio libro al curso.','sin','su propio'),('Hun møder en lærer, som arbejder på biblioteket.','Conoce a un profesor que trabaja en la biblioteca.','som','que'))]),
 (19,'A2+','Verber, passiv og ordstilling','Verbos, pasiva y orden','Repasar formas verbales, modales, pasiva y orden principal/subordinado en un aviso.','En una oración principal afirmativa, el verbo conjugado suele ocupar la segunda posición. En subordinadas habituales, «ikke» aparece antes del verbo conjugado. La pasiva puede formarse con «blive + participio» o con «-s».','A2+',[('Læs en besked','Leer un mensaje',('I morgen bliver pakken sendt fra kontoret.','Mañana se enviará el paquete desde la oficina.','sendt','enviado'),('Vi håber, at den ikke bliver forsinket.','Esperamos que no se retrase.','forsinket','retrasado'))]),
]

UNITS += [
 (62,'B1','En fortælling i rækkefølge','Narrar hechos en orden','B1 · Seguir una narración con marcadores temporales, acciones anteriores y consecuencias.','Una narración organiza los hechos con «først», «bagefter» y «til sidst». Comprueba qué ocurrió antes y qué cambió después; el orden de las frases no siempre coincide con el orden temporal.','B1',[
  ('Først og bagefter','Primero y después',('Da Maja kom hjem, ringede hendes søster.','Cuando Maja llegó a casa, llamó su hermana.','ringede','llamó'),('Efter samtalen skrev Maja en besked.','Después de la conversación, Maja escribió un mensaje.','samtalen','la conversación')),
  ('En plan der ændrer sig','Un plan que cambia',('Først ville Jonas tage toget.','Al principio Jonas quería ir en tren.','først','al principio'),('Bagefter fandt han en hurtigere bus.','Después encontró un autobús más rápido.','hurtigere','más rápido')),
  ('En afslutning','Un desenlace',('Til sidst fandt de den rigtige adresse.','Al final encontraron la dirección correcta.','til sidst','al final'),('Derfor nåede de mødet til tiden.','Por eso llegaron a tiempo a la reunión.','nåede','llegar a'))]),
 (63,'B1','Hvad var sket før?','Lo que había ocurrido antes','B1 · Distinguir pasado anterior y pasado simple en relatos y explicaciones.','Usa el pluscuamperfecto danés «havde/var + participio» para señalar una acción anterior a otro momento pasado. El auxiliar depende del verbo y del sentido; aprende los usos frecuentes en contexto.','B1',[
  ('En tidligere beslutning','Una decisión anterior',('Mødet var begyndt, før Lea kom.','La reunión había empezado antes de que llegara Lea.','begyndt','empezado'),('Hun havde læst dagsordenen hjemme.','Había leído el orden del día en casa.','dagsordenen','el orden del día')),
  ('En forklaring i fortiden','Una explicación en pasado',('Bussen var kørt, da vi nåede stoppestedet.','El autobús se había marchado cuando llegamos a la parada.','stoppestedet','la parada'),('Vi havde misforstået den nye køreplan.','Habíamos entendido mal el nuevo horario.','køreplan','horario')),
  ('Et tilbageblik','Una mirada retrospectiva',('Han havde aldrig set havet før den rejse.','Nunca había visto el mar antes de ese viaje.','aldrig','nunca'),('Efter turen forstod han, hvorfor hun savnede øen.','Después del viaje entendió por qué ella echaba de menos la isla.','savnede','echar de menos'))]),
 (64,'B1','Mulighed og betingelse','Posibilidad y condición','B1 · Interpretar condiciones reales, probables e hipotéticas en textos cotidianos.','«Hvis» introduce una condición. En una posibilidad abierta se usa normalmente el presente; en una situación imaginaria puede aparecer el pretérito con «ville» en la principal. Atiende al contexto, no solo a la forma verbal.','B1',[
  ('En reel mulighed','Una posibilidad real',('Hvis det regner, tager vi bussen.','Si llueve, tomamos el autobús.','regner','llover'),('Vi går til stationen, hvis vejret bliver bedre.','Iremos a la estación si mejora el tiempo.','vejret','el tiempo')),
  ('En tænkt situation','Una situación imaginaria',('Hvis hun havde mere tid, ville hun læse rapporten.','Si tuviera más tiempo, leería el informe.','rapporten','el informe'),('Hun ville også tale med naboerne.','También hablaría con los vecinos.','naboerne','los vecinos')),
  ('En betingelse i et opslag','Una condición en un aviso',('Du får adgang, hvis du viser dit kort.','Podrás entrar si muestras tu tarjeta.','adgang','acceso'),('Hvis kortet er udløbet, skal du bestille et nyt.','Si la tarjeta ha caducado, debes pedir una nueva.','udløbet','caducado'))]),
 (65,'B1','Han sagde, at …','Dijo que…','B1 · Comprender estilo indirecto, atribución de palabras y preguntas indirectas.','En el estilo indirecto, «at» introduce una afirmación y «om» puede introducir una pregunta de sí/no. Los tiempos no cambian de manera mecánica: conserva el sentido y la referencia temporal del texto.','B1',[
  ('En besked bliver gengivet','Se reproduce un mensaje',('Lea siger, at hun kommer efter arbejde.','Lea dice que vendrá después del trabajo.','siger','decir'),('Hun fortæller også, at toget er forsinket.','También cuenta que el tren lleva retraso.','fortæller','contar')),
  ('Et spørgsmål indirekte','Una pregunta indirecta',('Jonas spørger, om mødet stadig finder sted.','Jonas pregunta si la reunión sigue teniendo lugar.','spørger','preguntar'),('Han vil vide, hvornår rapporten bliver sendt.','Quiere saber cuándo se enviará el informe.','hvornår','cuándo')),
  ('Kilde og udsagn','Fuente y afirmación',('Ifølge lederen bliver planen ændret i juni.','Según la responsable, el plan cambiará en junio.','ifølge','según'),('Medarbejderne siger, at de mangler flere oplysninger.','Los empleados dicen que necesitan más información.','oplysninger','información'))]),
 (66,'B1','Årsag, følge og indrømmelse','Causa, consecuencia y concesión','B1 · Seguir relaciones lógicas con porque, por eso, aunque y a pesar de.','«Fordi» introduce una causa con oración; «derfor» presenta una consecuencia y, al comenzar una principal, provoca inversión. «Selvom» presenta una dificultad que no invalida la idea principal.','B1',[
  ('En tydelig årsag','Una causa explícita',('Værkstedet er lukket, fordi ejeren er syg.','El taller está cerrado porque el dueño está enfermo.','værkstedet','el taller'),('Derfor må kunderne bestille en ny tid.','Por eso los clientes tienen que pedir otra cita.','bestille','reservar')),
  ('En indrømmelse','Una concesión',('Selvom rapporten er kort, indeholder den mange detaljer.','Aunque el informe es breve, contiene muchos detalles.','indeholder','contener'),('På trods af forsinkelsen nåede holdet frem.','A pesar del retraso, el grupo llegó.','forsinkelsen','el retraso')),
  ('Forbindelser i en forklaring','Conectores en una explicación',('Prisen steg, fordi efterspørgslen blev større.','El precio subió porque aumentó la demanda.','efterspørgslen','la demanda'),('Alligevel fortsatte flere med at købe produktet.','Aun así, varias personas siguieron comprando el producto.','alligevel','aun así'))]),
 (67,'B1','Fakta, vurdering og kommentar','Hechos, valoración y comentario','B1 · Distinguir información comprobable, interpretación y opinión en noticias breves.','Una fecha, una cifra o una decisión puede verificarse. Una valoración suele incluir palabras como «vigtigt», «for dyrt» o «heldigvis». Comprueba quién sostiene cada afirmación.','B1',[
  ('En nyhed med tal','Una noticia con cifras',('Kommunen åbner et nyt bibliotek den tredje september.','El municipio abrirá una biblioteca nueva el tres de septiembre.','kommunen','el municipio'),('Byggeriet kostede tolv millioner kroner.','La construcción costó doce millones de coronas.','byggeriet','la construcción')),
  ('En kommentar til beslutningen','Un comentario sobre la decisión',('En beboer kalder placeringen upraktisk.','Un residente considera poco práctica la ubicación.','placeringen','la ubicación'),('En anden synes, at projektet er nødvendigt.','Otra persona cree que el proyecto es necesario.','nødvendigt','necesario')),
  ('Hvem mener hvad?','¿Quién opina qué?',('Avisen citerer både forskeren og borgmesteren.','El periódico cita tanto al investigador como al alcalde.','citerer','citar'),('Deres vurderinger af resultatet er forskellige.','Sus valoraciones del resultado son distintas.','vurderinger','valoraciones'))]),
 (68,'B1','Vilkår på arbejdspladsen','Condiciones en el trabajo','B1 · Comprender reglas laborales, turnos, cambios y solicitudes en mensajes internos.','En un texto laboral identifica a quién se aplica una regla, desde cuándo y si admite excepciones. «Skal» puede expresar obligación o un plan acordado; el contexto ayuda a precisar su valor.','B1',[
  ('En ny vagtplan','Un nuevo cuadrante',('Den nye vagtplan gælder fra første november.','El nuevo cuadrante se aplica desde el uno de noviembre.','gælder','aplicarse'),('Medarbejderne kan bytte vagter efter aftale.','Los empleados pueden cambiar turnos si hay acuerdo.','efter aftale','previo acuerdo')),
  ('En intern besked','Un aviso interno',('Alle skal registrere arbejdstiden digitalt.','Todos deben registrar las horas de trabajo digitalmente.','registrere','registrar'),('Hvis systemet ikke virker, skal lederen kontaktes.','Si el sistema no funciona, hay que contactar con la responsable.','kontaktes','ser contactado')),
  ('En undtagelse','Una excepción',('Aftenvagten slutter normalt klokken elleve.','El turno de tarde normalmente termina a las once.','aftenvagten','el turno de tarde'),('På helligdage begynder den en time senere.','Los días festivos empieza una hora más tarde.','helligdage','días festivos'))]),
 (69,'B1','Lejekontrakt og boligregler','Contrato de alquiler y normas','B1 · Leer condiciones de alquiler, responsabilidades y avisos de mantenimiento.','En un contrato distingue las obligaciones del inquilino y del arrendador. Las palabras «skal», «må» y «kan» expresan obligación, permiso o posibilidad según la frase.','B1',[
  ('Et vilkår i kontrakten','Una cláusula del contrato',('Lejeren skal betale husleje senest den første.','El inquilino debe pagar el alquiler como muy tarde el día uno.','lejeren','el inquilino'),('Depositummet tilbagebetales efter fraflytning.','El depósito se devuelve después de abandonar la vivienda.','depositummet','el depósito')),
  ('Vedligeholdelse','Mantenimiento',('Udlejeren reparerer varmeanlægget i næste uge.','El arrendador reparará la calefacción la semana que viene.','udlejeren','el arrendador'),('Beboerne får besked, før arbejdet begynder.','Los residentes recibirán un aviso antes de que empiecen las obras.','besked','aviso')),
  ('En fælles regel','Una norma común',('Cykler må ikke stå foran nødudgangen.','Las bicicletas no pueden dejarse delante de la salida de emergencia.','nødudgangen','la salida de emergencia'),('Storskrald sættes ud efter den aftalte tidsplan.','Los residuos voluminosos se dejan fuera según el horario acordado.','storskrald','residuos voluminosos'))]),
 (70,'B1','En klage med dokumentation','Una reclamación documentada','B1 · Comprender reclamaciones, pruebas, solicitudes de reparación y respuestas formales.','Una reclamación eficaz identifica compra o servicio, fecha, problema y solución solicitada. Distingue una afirmación del cliente de una respuesta verificada por la empresa.','B1',[
  ('En reklamation','Una reclamación',('Kunden klager over, at varen gik i stykker efter en uge.','El cliente se queja de que el artículo se rompió después de una semana.','klager over','quejarse de'),('Kvitteringen viser, hvornår købet fandt sted.','El recibo muestra cuándo se realizó la compra.','fandt sted','tener lugar')),
  ('Et svar fra butikken','Una respuesta de la tienda',('Butikken beder om billeder af skaden.','La tienda pide fotos del daño.','skaden','el daño'),('Derefter vurderer teknikeren, om varen kan repareres.','Después el técnico evalúa si el artículo se puede reparar.','vurderer','evaluar')),
  ('En løsning','Una solución',('Hvis fejlen ikke kan rettes, tilbyder butikken en ny vare.','Si no se puede corregir el defecto, la tienda ofrece un artículo nuevo.','fejlen','el defecto'),('Kunden accepterer tilbuddet skriftligt.','El cliente acepta la oferta por escrito.','tilbuddet','la oferta'))]),
 (71,'B1','Uddannelse og nye muligheder','Educación y nuevas oportunidades','B1 · Comprender requisitos, itinerarios educativos, solicitudes y decisiones de admisión.','En una convocatoria, localiza requisitos, plazo y criterio de selección. «Selvom» introduce un obstáculo o concesión; «derfor» suele conectar una causa con su consecuencia.','B1',[
  ('Et kursusopslag','Un anuncio de curso',('Kurset henvender sig til voksne med erhvervserfaring.','El curso está dirigido a adultos con experiencia laboral.','henvender sig til','estar dirigido a'),('Ansøgere skal sende dokumentation inden fristen.','Los solicitantes deben enviar documentación antes del plazo.','ansøgere','solicitantes')),
  ('En optagelse','Una admisión',('Selvom Lea mangler et fag, kan hun søge om optagelse.','Aunque a Lea le falta una asignatura, puede solicitar la admisión.','optagelse','admisión'),('Skolen vurderer hendes erfaring individuelt.','El centro evalúa su experiencia de forma individual.','individuelt','individualmente')),
  ('Efteruddannelse','Formación continua',('Flere ansatte deltager i et digitalt kursus.','Varios empleados participan en un curso digital.','ansatte','empleados'),('Derfor kan de søge nye opgaver på arbejdspladsen.','Por eso pueden optar a nuevas tareas en el trabajo.','søge','solicitar'))]),
 (72,'B1','Sundhed og velfærd','Salud y bienestar social','B1 · Interpretar información pública de salud, citas, servicios y propuestas de bienestar.','Las recomendaciones públicas distinguen entre datos, consejos y requisitos. Busca modales como «bør» y «skal», y comprueba qué grupo de personas menciona el texto.','B1',[
  ('Information fra klinikken','Información de la clínica',('Klinikken anbefaler, at ældre bestiller tid før besøget.','La clínica recomienda que las personas mayores pidan cita antes de la visita.','anbefaler','recomendar'),('Patienter med feber bør ringe først.','Los pacientes con fiebre deberían llamar primero.','patienter','pacientes')),
  ('En offentlig ordning','Un servicio público',('Ordningen giver støtte til personer med nedsat arbejdsevne.','El programa ofrece apoyo a personas con capacidad laboral reducida.','ordningen','el programa'),('Kommunen vurderer hver ansøgning for sig.','El municipio evalúa cada solicitud por separado.','vurderer','evaluar')),
  ('En debat om tilbud','Un debate sobre servicios',('Forslaget skal gøre rådgivning lettere at få.','La propuesta pretende facilitar el acceso al asesoramiento.','rådgivning','asesoramiento'),('Kritikerne spørger, hvordan udgiften skal dækkes.','Los críticos preguntan cómo se cubrirá el gasto.','dækkes','cubrirse'))]),
 (73,'B1','Rejser med ændringer','Viajes con cambios','B1 · Leer avisos de viaje, entender alternativas y reconstruir cambios en un itinerario.','Compara el itinerario original con la actualización. «I stedet for» señala sustitución; «mens» puede presentar hechos simultáneos o contrastados.','B1',[
  ('En ændret rute','Una ruta modificada',('På grund af sporarbejde standser toget ikke i Roskilde.','Debido a obras en la vía, el tren no para en Roskilde.','sporarbejde','obras en la vía'),('Passagerer skal i stedet tage en regionalbus.','Los pasajeros deben tomar un autobús regional en su lugar.','regionalbus','autobús regional')),
  ('En besked til gæsterne','Un aviso a los huéspedes',('Hotellet flytter reservationen til søsterhotellet.','El hotel traslada la reserva al hotel asociado.','reservationen','la reserva'),('Gæsterne får transport, mens værelserne bliver gjort klar.','Los huéspedes reciben transporte mientras se preparan las habitaciones.','transport','transporte')),
  ('Et valg mellem planer','Elegir entre planes',('Lea tager den tidlige færge for at nå mødet.','Lea toma el ferry temprano para llegar a la reunión.','færge','ferry'),('Selvom turen tager længere tid, vælger Jonas toget.','Aunque el viaje tarda más, Jonas elige el tren.','vælger','elegir'))]),
 (74,'B1','Klima og energi i hverdagen','Clima y energía en la vida diaria','B1 · Comprender textos factuales sobre consumo, medidas climáticas y consecuencias locales.','Un texto sobre clima puede combinar mediciones, previsiones y recomendaciones. Identifica la fuente y el grado de certeza; un efecto observado no prueba por sí solo una causa única.','B1',[
  ('Et lokalt energiprojekt','Un proyecto energético local',('Skolen installerer solceller på taget til sommer.','El centro instalará paneles solares en el tejado en verano.','solceller','paneles solares'),('Projektet skal mindske skolens køb af strøm.','El proyecto pretende reducir la compra de electricidad del centro.','mindske','reducir')),
  ('En rapport om varme','Un informe sobre calor',('Målingerne viser flere varme nætter end tidligere.','Las mediciones muestran más noches cálidas que antes.','målingerne','las mediciones'),('Forskerne understreger, at tallene varierer fra år til år.','Los investigadores subrayan que las cifras varían de un año a otro.','understreger','subrayar')),
  ('Et forslag til transport','Una propuesta de transporte',('Kommunen foreslår hyppigere busser i weekenden.','El municipio propone autobuses más frecuentes el fin de semana.','hyppigere','más frecuentes'),('Beboerne støtter idéen, hvis billetprisen ikke stiger.','Los residentes apoyan la idea si no sube el precio del billete.','billetprisen','el precio del billete'))]),
 (75,'B1','Privatliv på nettet','Privacidad en internet','B1 · Leer permisos, avisos de privacidad y explicaciones sencillas sobre datos personales.','Un aviso de privacidad indica qué datos se recogen, para qué y durante cuánto tiempo. Distingue permiso necesario de opción voluntaria y busca quién recibe la información.','B1',[
  ('En app beder om adgang','Una aplicación solicita acceso',('Appen beder om adgang til dine kontakter.','La aplicación pide acceso a tus contactos.','adgang','acceso'),('Du kan stadig bruge tjenesten uden at dele dem.','Aún puedes usar el servicio sin compartirlos.','dele','compartir')),
  ('En privatlivspolitik','Una política de privacidad',('Oplysningerne gemmes, så længe kontoen er aktiv.','La información se conserva mientras la cuenta esté activa.','gemmes','se conserva'),('Efter lukning slettes dataene normalt inden for tredive dage.','Tras cerrar la cuenta, los datos suelen borrarse en treinta días.','slettes','borrarse')),
  ('Et valg om cookies','Elegir sobre las cookies',('Nødvendige cookies holder indkøbskurven åben.','Las cookies necesarias mantienen abierto el carrito.','nødvendige','necesarias'),('Analyse kan fravælges i indstillingerne.','El análisis puede desactivarse en los ajustes.','fravælges','desactivarse'))]),
 (76,'B1','Medier og kilder','Medios y fuentes','B1 · Identificar autoría, atribución, propósito y alcance en artículos y publicaciones.','Comprueba autor, fecha, enlace a la fuente y tipo de evidencia. Una cita reproduce una voz; un titular resume y puede simplificar. Distingue «kilden siger» de lo que el medio concluye.','B1',[
  ('En artikel og dens kilde','Un artículo y su fuente',('Artiklen henviser til en undersøgelse fra universitetet.','El artículo remite a un estudio de la universidad.','henviser til','remitir a'),('Undersøgelsen omfattede kun deltagere fra to byer.','El estudio solo incluyó participantes de dos ciudades.','omfattede','incluir')),
  ('En overskrift','Un titular',('Overskriften siger, at priserne falder kraftigt.','El titular dice que los precios bajan mucho.','overskriften','el titular'),('I selve artiklen gælder faldet kun én varegruppe.','En el artículo, la bajada solo afecta a un grupo de productos.','varegruppe','grupo de productos')),
  ('En kilde på sociale medier','Una fuente en redes sociales',('Opslaget deler et billede uden dato eller afsender.','La publicación comparte una imagen sin fecha ni autor.','afsender','autor'),('Derfor kan oplysningerne ikke bekræftes endnu.','Por eso la información aún no se puede confirmar.','bekræftes','confirmar'))]),
 (77,'B1','Anmeldelser og kultur','Reseñas y cultura','B1 · Comprender reseñas, valoraciones, razones y recomendaciones culturales.','Una reseña suele combinar resumen y valoración. Busca qué aspecto evalúa el autor y qué razón aporta; «selvom» puede introducir una reserva antes de la conclusión.','B1',[
  ('En anmeldelse af en roman','Una reseña de una novela',('Romanen følger en familie gennem tre generationer.','La novela sigue a una familia a lo largo de tres generaciones.','generationer','generaciones'),('Anmelderen roser sproget, men kritiserer slutningen.','La crítica elogia el lenguaje, pero critica el final.','roser','elogiar')),
  ('En udstilling','Una exposición',('Udstillingen samler værker fra kunstnerens tidlige år.','La exposición reúne obras de los primeros años del artista.','samler','reunir'),('Selvom rummet er lille, virker præsentationen overskuelig.','Aunque la sala es pequeña, la presentación resulta clara.','overskuelig','claro; manejable')),
  ('En anbefaling','Una recomendación',('Forestillingen passer bedst til gæster, der kender historien.','El espectáculo es más adecuado para quienes conocen la historia.','passer bedst','ser más adecuado'),('Anmelderen anbefaler den alligevel på grund af musikken.','Aun así, la crítica lo recomienda por la música.','alligevel','aun así'))]),
 (78,'B1','Samfund og forskellige behov','Sociedad y necesidades diversas','B1 · Seguir argumentos breves sobre servicios locales, accesibilidad e intereses sociales.','En una discusión pública identifica los grupos afectados y las razones de cada postura. Una propuesta no es todavía una decisión; observa verbos como «foreslår», «beslutter» y «undersøger».','B1',[
  ('Et forslag om adgang','Una propuesta de accesibilidad',('Rådet foreslår en rampe ved kulturhusets indgang.','El ayuntamiento propone una rampa en la entrada del centro cultural.','rampe','rampa'),('Forslaget skal gøre salen tilgængelig for flere.','La propuesta pretende hacer la sala accesible a más personas.','tilgængelig','accesible')),
  ('Forskellige erfaringer','Experiencias distintas',('Nogle beboere bruger pladsen hver dag.','Algunos residentes usan la plaza todos los días.','beboere','residentes'),('Andre ønsker mere ro om aftenen.','Otros quieren más tranquilidad por la noche.','ro','tranquilidad')),
  ('En beslutning udsættes','Se aplaza una decisión',('Udvalget undersøger først støjniveauet om natten.','El comité primero estudia el nivel de ruido por la noche.','udvalget','el comité'),('Beslutningen bliver derfor udsat til næste måned.','Por eso la decisión se aplaza hasta el mes siguiente.','udsat','aplazada'))]),
 (79,'B1','Sammensatte ord og henvisninger','Palabras compuestas y referencias','B1 · Analizar compuestos frecuentes, familias de palabras y referencias dentro de un texto.','En danés, muchas palabras se unen y el último elemento suele determinar el tipo de cosa: «arbejdsplads» es un lugar de trabajo. Para una referencia, busca el sustantivo al que remiten «den», «det» o «de».','B1',[
  ('Et sammensat ord','Una palabra compuesta',('Arbejdspladsen indfører en ny tidsplan.','El lugar de trabajo introduce un horario nuevo.','arbejdspladsen','el lugar de trabajo'),('Medarbejderne får besked i deres indbakke.','Los empleados reciben el aviso en su bandeja de entrada.','indbakke','bandeja de entrada')),
  ('En henvisning i teksten','Una referencia en el texto',('Kommunen åbner et læseværksted for unge.','El municipio abre un taller de lectura para jóvenes.','læseværksted','taller de lectura'),('Det foregår på biblioteket hver onsdag.','Se celebra en la biblioteca cada miércoles.','foregår','tener lugar')),
  ('En ordstamme','Una familia de palabras',('Virksomheden undersøger medarbejdernes arbejdsmiljø.','La empresa estudia el entorno laboral de sus empleados.','arbejdsmiljø','entorno laboral'),('Undersøgelsen skal føre til konkrete ændringer.','El estudio debe conducir a cambios concretos.','konkrete','concretos'))]),
 (80,'B1','Find tekstens struktur','Encontrar la estructura del texto','B1 · Usar títulos, párrafos, conectores y referencias para localizar información relevante.','Un título anticipa el tema, mientras que la primera frase de un párrafo puede presentar su idea central. Usa conectores y pronombres para reconstruir la relación entre partes del texto.','B1',[
  ('Et afsnit med en pointe','Un párrafo con una idea central',('Rapporten sammenligner tre løsninger på problemet.','El informe compara tres soluciones al problema.','sammenligner','comparar'),('Den første er billig, mens den anden kan indføres hurtigere.','La primera es barata, mientras que la segunda puede aplicarse más rápido.','indføres','aplicarse')),
  ('En overskrift hjælper','Un título orienta',('Afsnittet hedder “Hvem har ansvaret?”.','El apartado se titula «¿Quién es responsable?».','afsnittet','el apartado'),('Derefter forklarer teksten både regler og undtagelser.','Después el texto explica tanto las reglas como las excepciones.','undtagelser','excepciones')),
  ('En henvisning binder sammen','Una referencia conecta',('Flere familier bruger tilbuddet efter skoletid.','Varias familias usan el servicio después de clase.','tilbuddet','el servicio'),('De fortæller, at det gør hverdagen lettere.','Cuentan que este les facilita la vida diaria.','lettere','más fácil'))]),
 (81,'B1','Samlet læsning B1','Lectura integrada B1','B1 · Integrar comprensión de narraciones, avisos, argumentos, hechos y relaciones gramaticales.','En una lectura integrada, define primero qué te pide la pregunta. Para un dato, busca evidencia explícita; para una inferencia, combina pistas y descarta conclusiones que el texto no sostiene.','B1',[
  ('En beslutning og dens følge','Una decisión y su consecuencia',('Beboerrådet vedtog en prøveordning i marts.','El consejo vecinal aprobó un programa piloto en marzo.','prøveordning','programa piloto'),('Efter seks måneder skal resultaterne vurderes.','Después de seis meses se evaluarán los resultados.','vurderes','evaluarse')),
  ('En erfaring og en begrundelse','Una experiencia y su motivo',('Lea skiftede kursus, fordi undervisningen lå sent.','Lea cambió de curso porque las clases eran tarde.','undervisningen','la enseñanza'),('Hun siger, at det nye hold passer bedre.','Dice que el nuevo grupo le viene mejor.','hold','grupo')),
  ('En tekst med flere stemmer','Un texto con varias voces',('Artiklen gengiver både kommunens svar og naboernes kritik.','El artículo reproduce tanto la respuesta del municipio como las críticas de los vecinos.','gengiver','reproducir'),('Den viser, at parterne er enige om problemet, men ikke om løsningen.','Muestra que las partes coinciden en el problema, pero no en la solución.','parterne','las partes'))]),

 (82,'B2','Energiomstilling og afvejninger','Transición energética y decisiones','B2 · Analizar argumentos sobre energía, costes, efectos y grupos afectados.','Los textos sobre transición energética comparan objetivos y limitaciones. Distingue datos medidos, previsiones y prioridades; una concesión reconoce un coste sin abandonar necesariamente la tesis.','B2',[
  ('To hensyn i samme forslag','Dos criterios en una propuesta',('Solparken kan øge produktionen, selvom den optager landbrugsjord.','El parque solar puede aumentar la producción aunque ocupe suelo agrícola.','landbrugsjord','suelo agrícola'),('Kommunen vil derfor undersøge placeringen nærmere.','Por eso el municipio estudiará con más detalle la ubicación.','placeringen','ubicación')),
  ('Et regnestykke med forbehold','Un cálculo con reservas',('Rapporten anslår, at udledningen falder med otte procent.','El informe calcula que las emisiones bajarán un ocho por ciento.','anslår','calcular'),('Resultatet afhænger dog af elforbruget om vinteren.','Sin embargo, el resultado depende del consumo eléctrico en invierno.','afhænger','depender')),
  ('Fordele og omkostninger','Ventajas y costes',('Batterier kan lagre strøm, når efterspørgslen er lav.','Las baterías pueden almacenar electricidad cuando la demanda es baja.','lagre','almacenar'),('Til gengæld kræver produktionen råstoffer og energi.','A cambio, la producción requiere materias primas y energía.','råstoffer','materias primas'))]),
 (83,'B2','Automatisering og arbejdsliv','Automatización y trabajo','B2 · Evaluar textos sobre automatización, productividad, cualificación y empleo.','Un texto sobre tecnología laboral puede presentar productividad como objetivo y empleo como efecto incierto. Atiende a expresiones de probabilidad y a quién asume el coste de la transición.','B2',[
  ('Rutiner bliver automatiseret','Se automatizan tareas rutinarias',('Systemet sorterer ansøgninger efter faste kriterier.','El sistema ordena solicitudes según criterios fijos.','sorterer','ordenar'),('Det frigør tid, men kræver løbende kontrol.','Libera tiempo, pero requiere supervisión continua.','løbende','continuo')),
  ('Nye kompetencer','Nuevas competencias',('Medarbejderne skal lære at fortolke systemets forslag.','Los empleados deben aprender a interpretar las propuestas del sistema.','fortolke','interpretar'),('Ellers risikerer virksomheden at overse særlige tilfælde.','De lo contrario, la empresa corre el riesgo de pasar por alto casos especiales.','overse','pasar por alto')),
  ('Produktivitet og ansvar','Productividad y responsabilidad',('Ledelsen måler tidsforbruget før og efter ændringen.','La dirección mide el tiempo empleado antes y después del cambio.','tidsforbruget','el tiempo empleado'),('Tallene siger dog ikke alt om kvaliteten af arbejdet.','Sin embargo, las cifras no lo dicen todo sobre la calidad del trabajo.','kvaliteten','la calidad'))]),
 (84,'B2','Velfærd, adgang og prioritering','Bienestar, acceso y prioridades','B2 · Comprender propuestas de política social, criterios de acceso y límites presupuestarios.','En propuestas de servicios públicos distingue objetivo, medida, población destinataria y financiación. Una cifra presupuestaria describe un coste estimado; no decide por sí misma si la medida es eficaz.','B2',[
  ('En ny rådgivning','Un nuevo servicio de asesoramiento',('Forslaget udvider rådgivningen til borgere uden fast læge.','La propuesta amplía el asesoramiento a personas sin médico asignado.','udvider','ampliar'),('Det er uklart, hvor mange ekstra medarbejdere der kræves.','No está claro cuántos empleados más harán falta.','kræves','ser necesarios')),
  ('Kriterier for støtte','Criterios para recibir apoyo',('Støtten afhænger af husstandens samlede indkomst.','La ayuda depende de los ingresos totales del hogar.','husstandens','del hogar'),('Ansøgere kan klage, hvis oplysningerne er forkerte.','Los solicitantes pueden reclamar si la información es incorrecta.','klage','reclamar')),
  ('Prioritering under pres','Prioridades bajo presión',('Udvalget vil beskytte den forebyggende indsats.','El comité quiere proteger la labor preventiva.','indsats','labor'),('Kritikerne spørger, hvilke andre tilbud der må vente.','Los críticos preguntan qué otros servicios tendrán que esperar.','tilbud','servicio'))]),
 (85,'B2','Byplanlægning og mobilitet','Planificación urbana y movilidad','B2 · Comparar objetivos de transporte, espacio urbano, accesibilidad y efectos locales.','Las propuestas urbanas equilibran movilidad, ruido, coste y acceso. Revisa qué grupo o zona se beneficia, qué inconveniente se reconoce y qué medida se propone para mitigarlo.','B2',[
  ('En gade får ny funktion','Una calle cambia de función',('Kommunen vil gøre den inderste gade bilfri i weekenden.','El municipio quiere hacer peatonal la calle interior los fines de semana.','bilfri','sin coches'),('Handlende frygter, at færre kunder vil komme forbi.','Los comerciantes temen que pasen menos clientes.','handlende','comerciantes')),
  ('Plads til flere transportformer','Espacio para varios medios',('Planen udvider cykelstien og flytter busstoppestedet.','El plan amplía el carril bici y mueve la parada de autobús.','udvider','ampliar'),('Passagerer skal derfor gå længere til toget.','Por eso los pasajeros tendrán que caminar más hasta el tren.','passagerer','pasajeros')),
  ('En vurdering af virkningen','Evaluar el efecto',('En prøveperiode skal vise, om støjen bliver mindre.','Un periodo de prueba mostrará si el ruido disminuye.','prøveperiode','periodo de prueba'),('Målingen sammenlignes med samme måneder sidste år.','La medición se compara con los mismos meses del año pasado.','sammenlignes','compararse'))]),
 (86,'B2','Uddannelse, identitet og sprog','Educación, identidad y lengua','B2 · Interpretar argumentos sobre educación, pertenencia, lengua y acceso a oportunidades.','Los textos de educación pueden presentar resultados distintos para grupos distintos. Separa la experiencia individual de una generalización y comprueba qué datos respaldan la afirmación.','B2',[
  ('Sprog i undervisningen','Lengua en la enseñanza',('Skolen tilbyder ekstra støtte, når eleverne møder nye fagord.','La escuela ofrece apoyo extra cuando los alumnos encuentran vocabulario académico nuevo.','fagord','términos académicos'),('Tiltaget skal styrke deltagelsen uden at sænke kravene.','La medida pretende reforzar la participación sin rebajar las exigencias.','deltagelsen','la participación')),
  ('Erfaring og tilhørsforhold','Experiencia y pertenencia',('Nogle elever føler sig hjemme i begge sprogmiljøer.','Algunos alumnos se sienten en casa en ambos entornos lingüísticos.','elever','alumnos'),('Andre savner, at deres erfaringer indgår i undervisningen.','Otros echan de menos que sus experiencias se incluyan en la enseñanza.','savner','echar de menos')),
  ('Et resultat kræver fortolkning','Un resultado requiere interpretación',('Undersøgelsen finder en sammenhæng mellem læsetid og ordforråd.','El estudio encuentra una relación entre tiempo de lectura y vocabulario.','sammenhæng','relación'),('Den viser ikke i sig selv, hvad der forårsager forskellen.','Por sí sola no muestra qué causa la diferencia.','forårsager','causar'))]),
 (87,'B2','Forbrug, priser og økonomi','Consumo, precios y economía','B2 · Leer análisis sobre precios, hábitos de consumo, incentivos y distribución de costes.','Un análisis económico puede mostrar una correlación o plantear una causa. Comprueba el periodo, la población y la base de comparación antes de generalizar.','B2',[
  ('En pris ændrer sig','Un precio cambia',('Prisen steg efter, at transportudgiften blev højere.','El precio subió después de que aumentara el coste del transporte.','transportudgiften','el coste del transporte'),('Forhandleren peger også på lavere lagerbeholdning.','El distribuidor también señala unas existencias menores.','lagerbeholdning','existencias')),
  ('Et forbrugsvalg','Una decisión de consumo',('Flere kunder vælger reparerbare produkter frem for engangsvarer.','Más clientes eligen productos reparables en vez de desechables.','reparerbare','reparables'),('Valget afhænger dog ofte af pris og adgang til reservedele.','La decisión, sin embargo, suele depender del precio y del acceso a repuestos.','reservedele','repuestos')),
  ('Hvem betaler?','¿Quién paga?',('Afgiften skal finansiere en grøn omstilling.','El impuesto debe financiar una transición ecológica.','afgiften','el impuesto'),('Debatten handler især om, hvordan byrden fordeles.','El debate trata sobre todo de cómo se distribuye la carga.','byrden','la carga'))]),
 (88,'B2','Videnskabelige resultater og forbehold','Resultados científicos y reservas','B2 · Distinguir hallazgo, método, limitación e interpretación en textos de divulgación.','Lee qué midió el estudio, en qué muestra y con qué limitaciones. «Tyder på» expresa indicio; «viser» puede sonar más concluyente, pero el alcance depende del método.','B2',[
  ('Et forsøgs resultat','Resultado de un experimento',('Forsøget tyder på, at søvn påvirker koncentrationen.','El experimento indica que el sueño afecta a la concentración.','forsøget','el experimento'),('Forskerne understreger, at deltagergruppen var lille.','Los investigadores subrayan que el grupo de participantes era pequeño.','deltagergruppen','el grupo de participantes')),
  ('Metode og måling','Método y medición',('Holdet målte temperaturen hvert femte minut.','El equipo midió la temperatura cada cinco minutos.','målte','midió'),('Sensoren blev kalibreret før forsøget begyndte.','El sensor se calibró antes de que comenzara el experimento.','kalibreret','calibrado')),
  ('En konklusion med grænser','Una conclusión con límites',('Resultatet gælder kun under de beskrevne forhold.','El resultado solo se aplica bajo las condiciones descritas.','gælder','aplicarse'),('En ny undersøgelse må afprøve, om mønstret gentager sig.','Un nuevo estudio debe comprobar si el patrón se repite.','mønstret','el patrón'))]),
 (89,'B2','Digitale medier og retorik','Medios digitales y retórica','B2 · Analizar titulares, encuadres, atribución y recursos persuasivos en publicaciones digitales.','Un titular selecciona un aspecto y puede intensificarlo. Busca omisiones, comparaciones y palabras valorativas; distingue una cita de la voz editorial y verifica si el enlace respalda el resumen.','B2',[
  ('Et skarpt formuleret opslag','Una publicación contundente',('Opslaget kalder ændringen et “historisk nederlag”.','La publicación llama al cambio «una derrota histórica».','nederlag','derrota'),('Selve beslutningen beskriver en mindre justering af reglerne.','La decisión en sí describe un ajuste menor de las normas.','justering','ajuste')),
  ('En påstand deles videre','Se comparte una afirmación',('Billedet deles uden henvisning til den oprindelige rapport.','La imagen se comparte sin referencia al informe original.','henvisning','referencia'),('Flere gengiver tallet, men ingen forklarer beregningen.','Varios reproducen la cifra, pero nadie explica el cálculo.','beregningen','el cálculo')),
  ('En retorisk kontrast','Un contraste retórico',('Forfatteren stiller hurtig adgang over for grundig kontrol.','El autor contrapone el acceso rápido a una revisión minuciosa.','stiller','contraponer'),('Kontrasten får den foreslåede løsning til at virke enkel.','El contraste hace que la solución propuesta parezca sencilla.','foreslåede','propuesta'))]),
 (90,'B2','Fortæller og perspektiv i prosa','Narrador y perspectiva en prosa','B2 · Comprender perspectiva, elipsis, referencias y cambios de ritmo en prosa contemporánea breve.','En prosa, separa quién narra de quién percibe. Una escena puede omitir explicaciones y dejar que el lector infiera un motivo a partir de gestos, referencias y cambios de tiempo.','B2',[
  ('Et tilbageblik','Un recuerdo',('Da døren gik op, genkendte hun lugten fra barndomshjemmet.','Cuando se abrió la puerta, reconoció el olor de la casa de su infancia.','genkendte','reconocer'),('Alligevel kunne hun ikke huske, hvem der havde været der.','Aun así, no podía recordar quién había estado allí.','kunne','poder')),
  ('En begrænset synsvinkel','Una perspectiva limitada',('Han så lyset i vinduet, men hørte ingen stemmer.','Vio la luz en la ventana, pero no oyó voces.','lyset','la luz'),('Derfor gættede han på, at huset var tomt.','Por eso supuso que la casa estaba vacía.','gættede','suponer')),
  ('En udeladt forklaring','Una explicación omitida',('Hun lagde nøglen på bordet og gik uden at se tilbage.','Dejó la llave sobre la mesa y se marchó sin mirar atrás.','lagde','dejó'),('Teksten fortæller ikke, hvorfor hun tog af sted.','El texto no cuenta por qué se marchó.','fortæller','contar'))]),
 (91,'B2','Offentlige dokumenter og beslutninger','Documentos públicos y decisiones','B2 · Interpretar documentos administrativos, alcance de resoluciones, plazos y vías de revisión.','En un documento público localiza autoridad, decisión, fecha de entrada en vigor, personas afectadas y recurso disponible. El estilo nominal condensa acciones; identifica quién debe realizarlas.','B2',[
  ('En afgørelse','Una resolución',('Kommunen har truffet afgørelse om støtte til renoveringen.','El municipio ha resuelto conceder ayuda para la renovación.','afgørelse','resolución'),('Beløbet udbetales, når regnskabet er godkendt.','La cantidad se abona cuando se aprueba la contabilidad.','udbetales','abonarse')),
  ('En frist og en klagevej','Un plazo y un recurso',('Afgørelsen kan påklages inden fire uger.','La resolución se puede recurrir en un plazo de cuatro semanas.','påklages','recurrirse'),('Klagen skal begrundes og sendes til samme myndighed.','El recurso debe justificarse y enviarse a la misma autoridad.','myndighed','autoridad')),
  ('Hvem gør hvad?','¿Quién hace qué?',('Ansøgeren skal indsende den manglende dokumentation.','El solicitante debe presentar la documentación que falta.','indsende','presentar'),('Sagsbehandleren vurderer derefter, om vilkårene er opfyldt.','Después, el gestor evalúa si se cumplen las condiciones.','sagsbehandleren','el gestor'))]),
 (92,'B2','Sammenlign kilder og tal','Comparar fuentes y cifras','B2 · Comparar dos fuentes, atender a fecha, método, cobertura y diferencias de propósito.','Al comparar fuentes, alinea periodo, definición y población antes de contrastar cifras. Una diferencia puede deberse a método o alcance, no necesariamente a un error o desacuerdo.','B2',[
  ('To opgørelser','Dos recuentos',('Den ene opgørelse tæller kun fastansatte.','Un recuento incluye solo a empleados fijos.','opgørelse','recuento'),('Den anden medregner også vikarer og deltidsansatte.','El otro incluye también sustitutos y empleados a tiempo parcial.','medregner','incluir en el recuento')),
  ('Dato og metode','Fecha y método',('Rapport A bygger på svar fra sidste forår.','El informe A se basa en respuestas de la primavera pasada.','bygger på','basarse en'),('Rapport B bruger registerdata fra hele året.','El informe B usa datos administrativos de todo el año.','registerdata','datos administrativos')),
  ('En forskel forklares','Se explica una diferencia',('Tallene ser modstridende ud ved første øjekast.','Las cifras parecen contradictorias a primera vista.','modstridende','contradictorios'),('Når grupperne afgrænses ens, bliver forskellen mindre.','Cuando se definen los grupos de la misma manera, la diferencia se reduce.','afgrænses','delimitarse'))]),
 (93,'B2','Påstand, belæg og modargument','Tesis, evidencia y contraargumento','B2 · Reconstruir argumentos complejos, evidencia, concesiones y refutaciones.','Localiza la tesis, las razones y la evidencia. Un contraargumento puede concederse parcialmente y luego limitarse; «dog», «imidlertid» y «alligevel» guían esa relación.','B2',[
  ('En hovedpåstand','Una tesis principal',('Forfatteren hævder, at biblioteket bør holde længere åbent.','El autor sostiene que la biblioteca debería abrir hasta más tarde.','hævder','sostener'),('Som belæg nævner hun ventelister efter arbejdstid.','Como prueba, menciona listas de espera después del horario laboral.','belæg','evidencia')),
  ('Et modargument','Un contraargumento',('Kritikerne peger på udgiften til ekstra personale.','Los críticos señalan el coste del personal adicional.','peger på','señalar'),('Forfatteren anerkender omkostningen, men foreslår en prøveperiode.','El autor reconoce el coste, pero propone un periodo de prueba.','anerkender','reconocer')),
  ('En begrænset konklusion','Una conclusión matizada',('En forsøgsordning kan vise, hvem der bruger tilbuddet.','Un programa piloto puede mostrar quién usa el servicio.','forsøgsordning','programa piloto'),('Resultatet bør dog ikke uden videre gælde for alle biblioteker.','Sin embargo, el resultado no debería aplicarse sin más a todas las bibliotecas.','uden videre','sin más'))]),
 (94,'B2','Nuancer, register og idiomer','Matices, registro e idiomatismos','B2 · Interpretar grados de certeza, registro, colocaciones y sentidos dependientes del contexto.','Una palabra cambia de fuerza según el registro y el contexto. Compara «måske», «sandsynligvis» y «vist»; aprende colocaciones completas y evita traducir partículas de forma aislada.','B2',[
  ('Et forsigtigt skøn','Una estimación prudente',('Prisen ventes muligvis at falde til efteråret.','Es posible que el precio baje en otoño.','muligvis','posiblemente'),('Analytikeren vurderer dog, at faldet bliver begrænset.','Sin embargo, el analista considera que la bajada será limitada.','begrænset','limitada')),
  ('Formelt og uformelt','Formal e informal',('I brevet anmoder beboeren om en skriftlig begrundelse.','En la carta, el residente solicita una justificación por escrito.','anmoder','solicitar formalmente'),('I beskeden spørger hun bare, hvorfor svaret mangler.','En el mensaje solo pregunta por qué falta la respuesta.','svaret','respuesta')),
  ('En fast vending','Una expresión fija',('Virksomheden tog højde for ekstra udgifter.','La empresa tuvo en cuenta gastos adicionales.','tog højde for','tener en cuenta'),('Derfor kom ændringen ikke som en overraskelse.','Por eso el cambio no fue una sorpresa.','overraskelse','sorpresa'))]),
 (95,'B2','Afsluttende læsning B2','Evaluación final de lectura B2','B2 · Evaluar lectura independiente: prosa, argumentos, documentos y comparación crítica de fuentes.','En la evaluación final, ajusta la lectura a la tarea. Comprueba quién afirma cada cosa, qué evidencia ofrece y qué límites reconoce; distingue una inferencia razonable de una conclusión que excede el texto.','B2',[
  ('En rapport og en kommentar','Un informe y un comentario',('Rapporten beskriver færre klager efter den nye ordning.','El informe describe menos quejas tras el nuevo sistema.','ordning','sistema'),('Kommentaren spørger, om ændringen også forbedrede servicen.','El comentario pregunta si el cambio también mejoró el servicio.','forbedrede','mejoró')),
  ('En kilde med forbehold','Una fuente con reservas',('Undersøgelsen peger på en sammenhæng, men ikke en sikker årsag.','El estudio apunta a una relación, pero no a una causa segura.','sammenhæng','relación'),('Forfatterne anbefaler derfor flere målinger.','Por eso los autores recomiendan más mediciones.','målinger','mediciones')),
  ('En samlet vurdering','Una valoración integrada',('Begge tekster ønsker kortere ventetid, men foreslår forskellige midler.','Ambos textos quieren reducir la espera, pero proponen medidas distintas.','midler','medidas'),('Den ene prioriterer kapacitet, mens den anden fremhæver forebyggelse.','Uno prioriza la capacidad, mientras que el otro destaca la prevención.','forebyggelse','prevención'))]),
]

SLOT_GUIDES = [
 'Lee el encabezado y localiza el dato que responde a la pregunta.',
 'Observa qué forma expresa la relación y vuelve a la frase para comprobarla.',
 'Compara las dos pistas y distingue lo que el texto dice de lo que solo parece sugerir.',
]

def qline(good, bad, explanation):
    lines = [f'+ {good} :: {explanation}']
    lines.extend(f'- {x} :: No corresponde a esta frase; vuelve al contexto.' for x in bad)
    return lines

def options_from(pool, correct, count=3):
    picked = []
    for x in pool:
        if x != correct and x not in picked:
            picked.append(x)
        if len(picked) == count:
            break
    return picked

def render_lesson(unit, slot_i, slot, pools, seen):
    cap, level, chapter_da, chapter_es, desc, focus, _, _ = unit
    sub_da, sub_es, first, second = slot
    phrases = [first, second]
    (d1, e1, w1, g1), (d2, e2, w2, g2) = phrases
    available = []
    for s in unit[-1]:
        available.extend((s[2][2], s[3][2]))
    cloze_pool = list(dict.fromkeys(available + pools['words']))
    bad1 = options_from(pools['glosses'], g1)
    b1 = options_from(cloze_pool, w1)
    b2 = options_from(cloze_pool[::-1], w2)
    all_translations = list(pools['translations'])
    for s in unit[-1]:
        all_translations.extend((s[2][1], s[3][1]))
    r_bad = options_from(all_translations, e1)
    reading_bad = options_from(all_translations, e2)

    title_da = f'Læsning {slot_i + 1} · {chapter_da}'
    title_es = f'{sub_es} · {chapter_es}'
    opening = SLOT_GUIDES[slot_i]
    chunks = [
        f'N {NAMES}',
        f'@ {cap} | {title_da} | {title_es}',
        f'I Parte {slot_i + 1}: {sub_es.lower()}. {opening}',
        f'E {sub_es} :: {focus} :: {opening}',
    ]
    visible_count = 0
    for word, gloss in ((w1, g1), (w2, g2)):
        marker = 'w' if seen.get(word.lower()) == gloss else 'W'
        if marker == 'W':
            visible_count += 1
        chunks.append(f'{marker} {word} = {gloss}')
        seen.setdefault(word.lower(), gloss)
    target_tokens = {x.lower() for x in re.findall(r"[^\W_]+(?:['’\-][^\W_]+)*", f'{w1} {w2}', flags=re.UNICODE)}
    hidden = {}
    for token in re.findall(r"[^\W_]+(?:['’\-][^\W_]+)*", f'{d1} {d2}', flags=re.UNICODE):
        key = token.lower()
        if key not in target_tokens and key in EXTRA_WORDS and key not in {x.lower() for x in NAMES.split(', ')}:
            hidden.setdefault(key, EXTRA_WORDS[key])
    for word, gloss in hidden.items():
        chunks.append(f'w {word} = {gloss}')
        seen.setdefault(word, gloss)
    if visible_count:
        chunks.append('V Vocabulario clave')
    chunks.extend((
        f'T {sub_da}',
        f'- {d1} = {e1}',
        f'- {d2} = {e2}',
        f'Q ¿Qué significa «{w1}» en el texto?',
    ))
    chunks.extend(qline(g1, bad1, f'En esta frase, «{w1}» significa «{g1}».'))
    chunks.append('Q ¿Qué información da la segunda frase del texto?')
    chunks.extend(qline(e2, reading_bad, f'La segunda frase dice: «{e2}».'))
    cloze1 = __import__('re').sub(__import__('re').escape(w1), '___', d1, count=1, flags=__import__('re').I)
    cloze2 = __import__('re').sub(__import__('re').escape(w2), '___', d2, count=1, flags=__import__('re').I)
    chunks.append(f'H {cloze1} :: Completa con la palabra que aparece en el texto.')
    chunks.extend(qline(w1, b1, f'La palabra correcta es «{w1}».'))
    chunks.append(f'H {cloze2} :: Completa con la palabra que aparece en el texto.')
    chunks.extend(qline(w2, b2, f'La palabra correcta es «{w2}».'))
    chunks.append(f'R {d1} :: Traduce la frase completa.')
    chunks.extend(qline(e1, r_bad, 'La traducción conserva la información de la frase.'))
    chunks.append(f'O {d2} :: {e2} :: Comprueba el orden de la frase principal o subordinada.')
    return '\n'.join(chunks)

def build():
    assert len(UNITS) == 58, f'Expected 58 new chapters, got {len(UNITS)}'
    assert [u[0] for u in UNITS] == list(range(38, 96))
    pools_by_level = {}
    for u in UNITS + SPLITS:
        pools = pools_by_level.setdefault(u[1], {'glosses': [], 'words': [], 'translations': []})
        for slot in u[-1]:
            pools['glosses'].extend((slot[2][3], slot[3][3]))
            pools['words'].extend((slot[2][2], slot[3][2]))
            pools['translations'].extend((slot[2][1], slot[3][1]))
    for level, minimum in [('A1', 20), ('A2', 20), ('A2+', 20), ('B1', 20), ('B2', 20)]:
        assert len(set(pools_by_level[level]['glosses'])) >= minimum, f'Not enough distractors for {level}'

    project_root = ROOT.parents[2]
    lesson_dir = project_root / 'Idiomas' / 'cursos' / 'da' / 'lessons'
    seen = {}
    for n in range(1, 124):
        path = lesson_dir / f'{n:03d}.json'
        if not path.exists():
            continue
        old = json.loads(path.read_text(encoding='utf-8'))
        for word, entry in old.get('palabras', {}).items():
            gloss = entry.get('es', '') if isinstance(entry, dict) else str(entry)
            seen.setdefault(word.lower(), gloss)

    # The split lessons are compiled first, followed by new chapters A1 to B2.
    grouped = {}
    for unit in SPLITS:
        for i, slot in enumerate(unit[-1]):
            grouped.setdefault(unit[0], []).append(('split', unit, i, slot))
    for unit in UNITS:
        for i, slot in enumerate(unit[-1]):
            grouped.setdefault(unit[0], []).append(('new', unit, i, slot))

    for cap, rows in grouped.items():
        body = [f'N {NAMES}']
        for row in rows:
            if row[0] in ('new', 'split'):
                _, unit, i, slot = row
                body.append(render_lesson(unit, i, slot, pools_by_level[unit[1]], seen))
        (DA / f'{cap}.txt').write_text('\n\n'.join(body) + '\n', encoding='utf-8')

    caps = [
        '17 | Hvad skete der? | ¿Qué pasó? | A2+ · Lecciones divididas: percepción y partículas, usos de få/have e historia en textos breves.',
        '18 | Lad os gå ud! | ¡Salgamos! | A2+ · Lecciones divididas: titulares, anuncios, pasivas, reglas y horarios.',
        '19 | Grammatik på et øjeblik | La gramática de un vistazo | A2+ · Repaso dividido: nombres, pronombres, verbos, pasiva y orden de palabras.',
    ]
    for unit in UNITS:
        caps.append(f'{unit[0]} | {unit[2]} | {unit[3]} | {unit[4]}')
    (DA / 'capitulos.txt').write_text('# número | título en danés | título en español | descripción\n' + '\n'.join(caps) + '\n', encoding='utf-8')
    (DA / 'desde.txt').write_text('124\n', encoding='utf-8')

if __name__ == '__main__':
    build()


