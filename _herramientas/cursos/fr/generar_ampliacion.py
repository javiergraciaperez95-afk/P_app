"""Amplía el curso de francés con lecturas graduadas y conserva los IDs de progreso."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
LESSONS = ROOT / "Idiomas" / "cursos" / "fr" / "lessons"

# Registro compacto: título FR/ES, objetivo, punto de lengua, vocabulario y cuatro
# frases paralelas. Las tres lecciones de cada capítulo guían la relectura por pasos.
RAW = r"""
[A1]
Les sons dans les mots¦Grafías y sonidos frecuentes¦Lee combinaciones frecuentes y finales mudas en palabras conocidas.¦Ou, oi y au/eau tienen correspondencias frecuentes; la pronunciación de ai varía según la palabra; muchas consonantes finales son mudas, con excepciones.¦bonjour=hola; eau=agua; aujourd'hui=hoy; maison=casa; français=francés¦Le mot « bonjour » commence par « bon ».~La palabra « bonjour » empieza por « bon ».§Dans « maison », « ai » se prononce comme un son e ouvert.~En « maison », « ai » se pronuncia como una e abierta.§« Eau » et « au » se prononcent souvent de la même façon.~« Eau » y « au » suelen pronunciarse de la misma manera.§Dans « petit », le t final ne s'entend pas, mais il existe des exceptions.~En « petit », la t final no se oye, aunque hay excepciones.
Une fiche personnelle¦Una ficha personal¦Localiza nombre, edad, ciudad e idiomas en una ficha breve.¦Las preguntas de formulario suelen ir seguidas por nombres, cifras o respuestas de una palabra.¦prénom=nombre; âge=edad; ville=ciudad; langue=idioma; habiter=vivir¦Prénom : Inès. Âge : vingt ans. Ville : Lille.~Nombre: Inès. Edad: veinte años. Ciudad: Lille.§Inès habite avec sa sœur et parle français et espagnol.~Inès vive con su hermana y habla francés y español.§Son adresse est rue des Lilas, au numéro huit.~Su dirección es calle de los Lilas, en el número ocho.§Elle préfère recevoir les messages par courriel.~Prefiere recibir los mensajes por correo electrónico.
Un profil personnel¦Un perfil personal¦Comprende una presentación corta y distingue datos personales de preferencias.¦Los posesivos y los verbos en presente ayudan a seguir quién presenta a quién y qué le gusta.¦profil=perfil; étudiante=estudiante; aimer=gustar; frère=hermano; lire=leer¦Voici Malik, étudiant à Nantes. Il a dix-neuf ans.~Este es Malik, estudiante en Nantes. Tiene diecinueve años.§Il vit avec son frère et aime les films comiques.~Vive con su hermano y le gustan las películas cómicas.§Le samedi, il lit au café près de la gare.~Los sábados lee en el café cerca de la estación.§Il n'aime pas le café, mais il adore le chocolat chaud.~No le gusta el café, pero le encanta el chocolate caliente.
Les panneaux utiles¦Carteles y señales útiles¦Reconoce prohibiciones, obligaciones y servicios básicos en espacios públicos.¦En una señal, el imperativo o « interdit » suele expresar una regla; el icono y el lugar aportan contexto.¦entrée=entrada; sortie=salida; interdit=prohibido; ouvert=abierto; toilettes=baños¦À l'entrée du parc, un panneau indique « Ouvert de 8 h à 18 h ».~En la entrada del parque, un cartel indica «Abierto de 8 a 18».§Les chiens doivent rester en laisse près du jardin.~Los perros deben ir con correa cerca del jardín.§La sortie se trouve derrière le café, à gauche.~La salida está detrás del café, a la izquierda.§Les toilettes sont gratuites et ouvertes au public.~Los baños son gratuitos y están abiertos al público.
Une affiche de quartier¦Un cartel del barrio¦Extrae lugar, fecha, hora y precio de un anuncio de evento.¦Las preposiciones « à » y « au » acompañan horas y lugares; una cifra puede indicar entrada o edad.¦affiche=cartel; concert=concierto; samedi=sábado; entrée=entrada; gratuit=gratuito¦L'affiche annonce un concert au parc samedi prochain.~El cartel anuncia un concierto en el parque el próximo sábado.§La musique commence à dix-huit heures près de la fontaine.~La música empieza a las seis de la tarde cerca de la fuente.§L'entrée est gratuite pour les enfants et coûte cinq euros pour les adultes.~La entrada es gratuita para los niños y cuesta cinco euros para los adultos.§En cas de pluie, le concert a lieu dans la salle municipale.~Si llueve, el concierto tiene lugar en la sala municipal.
Lire un menu¦Leer un menú¦Identifica platos, bebidas y opciones sencillas en un menú de cafetería.¦« Avec » introduce acompañamientos y « ou » presenta una alternativa; los precios se leen junto al plato.¦menu=menú; soupe=sopa; salade=ensalada; avec=con; boisson=bebida¦La soupe du jour est aux légumes et coûte six euros.~La sopa del día es de verduras y cuesta seis euros.§Le menu comprend une salade ou un sandwich, avec une boisson.~El menú incluye una ensalada o un sándwich, con una bebida.§Le gâteau au chocolat est servi après le déjeuner.~El pastel de chocolate se sirve después del almuerzo.§Les plats végétariens sont indiqués par une feuille verte.~Los platos vegetarianos se indican con una hoja verde.
Une étiquette de produit¦Una etiqueta de producto¦Interpreta cantidades, precios y datos básicos de una etiqueta.¦Unidades como « g », « kg » y « ml » completan el nombre del producto; « par » expresa el precio unitario.¦étiquette=etiqueta; poids=peso; farine=harina; paquet=paquete; prix=precio¦Sur l'étiquette, ce paquet de farine pèse un kilo.~En la etiqueta, este paquete de harina pesa un kilo.§Le prix est de deux euros cinquante par paquet.~El precio es de dos euros con cincuenta por paquete.§La farine vient d'un moulin près de la ville.~La harina viene de un molino cerca de la ciudad.§Après ouverture, il faut garder le paquet dans un endroit sec.~Después de abrirlo, hay que guardar el paquete en un lugar seco.
Une petite annonce¦Un anuncio clasificado¦Busca precio, características y condiciones en un anuncio sencillo.¦Los adjetivos y las cantidades describen el objeto; « à vendre » señala una venta.¦annonce=anuncio; vendre=vender; vélo=bicicleta; prix=precio; état=estado¦À vendre : vélo bleu, trois vitesses, en bon état.~Se vende: bicicleta azul, con tres velocidades y en buen estado.§Le vélo est disponible à Tours pour quarante euros.~La bicicleta está disponible en Tours por cuarenta euros.§Le vendeur donne aussi un casque de taille moyenne.~El vendedor también regala un casco de talla mediana.§Pour voir le vélo, envoyer un message après dix-sept heures.~Para ver la bicicleta, envíe un mensaje después de las cinco de la tarde.
Lire un horaire¦Leer un horario¦Relaciona actividad y hora en un horario cotidiano.¦« De… à… » marca el intervalo y « le » puede señalar los días en que se repite una actividad.¦horaire=horario; commencer=empezar; finir=terminar; lundi=lunes; bibliothèque=biblioteca¦La bibliothèque ouvre à neuf heures du lundi au vendredi.~La biblioteca abre a las nueve de lunes a viernes.§Le mercredi, l'atelier de lecture commence à quinze heures.~El miércoles, el taller de lectura empieza a las tres de la tarde.§La bibliothèque ferme à dix-huit heures, sauf le samedi.~La biblioteca cierra a las seis, excepto los sábados.§Le samedi, elle ferme à midi et reste fermée le dimanche.~El sábado cierra al mediodía y permanece cerrada el domingo.
Un plan pour les visiteurs¦Un plano para visitantes¦Sigue indicaciones sencillas y localiza puntos de interés en un plano.¦« À côté de », « devant » y « derrière » describen la posición de un lugar respecto a otro.¦plan=plano; musée=museo; pont=puente; devant=delante; tourner=girar¦Le musée se trouve devant le grand pont, au bord de la rivière.~El museo está delante del puente grande, a la orilla del río.§Depuis la place, tourne à gauche après la boulangerie.~Desde la plaza, gira a la izquierda después de la panadería.§Le jardin public est derrière le musée et près de l'arrêt de bus.~El jardín público está detrás del museo y cerca de la parada de autobús.§Le plan indique aussi une fontaine et un accès sans marches.~El plano también indica una fuente y un acceso sin escaleras.
À l'hôtel¦En el alojamiento¦Comprende datos de una reserva y normas básicas de alojamiento.¦Las fechas indican entrada y salida; « compris » precisa qué servicios están incluidos.¦réservation=reserva; chambre=habitación; nuit=noche; compris=incluido; calme=tranquilo¦La réservation de Nora est pour une chambre double, du 12 au 14 juin.~La reserva de Nora es para una habitación doble, del 12 al 14 de junio.§Le petit déjeuner est compris et servi de sept à dix heures.~El desayuno está incluido y se sirve de siete a diez.§La réception se trouve au rez-de-chaussée, près de l'entrée.~La recepción está en la planta baja, cerca de la entrada.§Après vingt-deux heures, les clients doivent garder le calme.~Después de las diez de la noche, los clientes deben guardar silencio.
Un avis de santé¦Un aviso de salud¦Lee instrucciones breves de una consulta sin confundir síntomas, hora y lugar.¦Las instrucciones usan el imperativo; una frecuencia como « deux fois par jour » acompaña la acción.¦rendez-vous=cita; médecin=médico; matin=mañana; repos=descanso; appeler=llamar¦Le centre médical reçoit les patients sur rendez-vous le matin.~El centro médico atiende a pacientes con cita por la mañana.§Pour prendre rendez-vous, appelez le numéro indiqué sur la porte.~Para pedir cita, llame al número indicado en la puerta.§La salle d'attente se trouve au premier étage, à droite.~La sala de espera está en el primer piso, a la derecha.§En cas d'urgence, adressez-vous à l'accueil de l'hôpital.~En caso de urgencia, diríjase a recepción del hospital.
La météo du jour¦El tiempo de hoy¦Interpreta una previsión sencilla y relaciona clima, momento y recomendación.¦« Il fait » describe el tiempo; « demain » y « l'après-midi » sitúan la previsión.¦météo=tiempo; pluie=lluvia; soleil=sol; demain=mañana; prendre=llevar¦Demain, le ciel sera couvert dans le nord et il fera frais.~Mañana el cielo estará nublado en el norte y hará fresco.§Une pluie légère est prévue à Lille pendant la matinée.~Se prevé una lluvia ligera en Lille durante la mañana.§Dans le sud, le soleil reviendra dans l'après-midi et le vent restera faible.~En el sur, volverá el sol después del mediodía y el viento seguirá flojo.§Pensez à prendre un manteau si vous sortez tôt.~Acuérdese de llevar un abrigo si sale temprano.
Un message pratique¦Un mensaje práctico¦Comprende mensajes cortos sobre un cambio de plan, una hora o una tarea.¦« Parce que » da una causa y « alors » introduce una consecuencia en un mensaje informal.¦message=mensaje; retard=retraso; attendre=esperar; prévenir=avisar; bientôt=pronto¦Salut, le bus a du retard et j'arriverai vers dix-huit heures.~Hola, el autobús lleva retraso y llegaré sobre las seis.§Attends-moi devant le cinéma, je t'envoie un message en arrivant.~Espérame delante del cine; te envío un mensaje al llegar.§La séance commence à dix-huit heures trente, alors nous avons le temps.~La sesión empieza a las seis y media, así que tenemos tiempo.§Préviens aussi Lina parce qu'elle vient directement du travail.~Avisa también a Lina porque viene directamente del trabajo.
Lire plusieurs documents¦Lectura funcional integrada¦Integra datos de un cartel, un horario y un mensaje corto.¦Compara fecha, lugar y condición entre documentos; no supongas que dos cifras parecidas se refieren a lo mismo.¦document=documento; samedi=sábado; adresse=dirección; heure=hora; confirmer=confirmar¦L'affiche annonce une visite du musée samedi à onze heures.~El cartel anuncia una visita al museo el sábado a las once.§Le billet coûte quatre euros et le rendez-vous est devant l'entrée principale.~El billete cuesta cuatro euros y el punto de encuentro está delante de la entrada principal.§Le musée ferme à dix-sept heures; la visite dure une heure.~El museo cierra a las cinco; la visita dura una hora.§Un message précise que la sortie est maintenue même s'il pleut.~Un mensaje precisa que la visita se mantiene aunque llueva.
[A2]
Un courriel de confirmation¦Un correo de confirmación¦Distingue el motivo del correo, la fecha y la acción que debe hacer el destinatario.¦En los correos, asunto, saludo y fórmula final orientan la lectura; los pronombres sustituyen información ya mencionada.¦confirmation=confirmación; confirmer=confirmar; pièce jointe=archivo adjunto; avant=antes; répondre=responder¦Objet : confirmation. Votre réservation est bien enregistrée pour le 18 septembre.~Asunto: confirmación. Su reserva está registrada para el 18 de septiembre.§Le paiement se fera à l'arrivée; le petit déjeuner n'est pas compris.~El pago se hará a la llegada; el desayuno no está incluido.§Vous trouverez le plan de l'hôtel en pièce jointe. Merci de répondre avant lundi.~Encontrará el plano del hotel adjunto. Por favor, responda antes del lunes.§Cordialement, l'équipe de l'accueil.~Atentamente, el equipo de recepción.
Réserver par écrit¦Reservar por escrito¦Interpreta solicitudes, disponibilidad y condiciones en mensajes de reserva.¦« Serait-il possible de… » suaviza una petición; los datos de fecha y duración limitan el alcance de la respuesta.¦disponible=disponible; séjour=estancia; demander=preguntar; réduction=descuento; préciser=precisar¦Bonjour, je voudrais réserver deux nuits à partir du 6 octobre.~Hola, quisiera reservar dos noches a partir del 6 de octubre.§Une chambre avec deux lits est-elle disponible ?~¿Hay una habitación disponible con dos camas?§L'hôtel répond qu'il reste une chambre, mais sans vue sur la mer.~El hotel responde que queda una habitación, pero sin vistas al mar.§Le tarif inclut le parking; la réservation sera définitive après le versement d'un acompte.~La tarifa incluye el aparcamiento; la reserva será definitiva tras pagar un anticipo.
Suivre une procédure¦Seguir instrucciones¦Sigue pasos de una instrucción sencilla y distingue orden, condición y resultado.¦Los conectores « d'abord », « ensuite » y « enfin » ordenan los pasos; « si » introduce una condición.¦d'abord=primero; ensuite=después; verser=verter; mélanger=mezclar; refroidir=enfriar¦Pour préparer la soupe, lavez d'abord les légumes et coupez-les en petits morceaux.~Para preparar la sopa, lave primero las verduras y córtelas en trozos pequeños.§Faites chauffer l'huile, puis ajoutez les légumes et un litre d'eau.~Caliente el aceite y después añada las verduras y un litro de agua.§Laissez cuire vingt minutes; si la soupe est trop épaisse, ajoutez un peu d'eau.~Déjela cocer veinte minutos; si la sopa está demasiado espesa, añada un poco de agua.§Mixez enfin la préparation et servez-la avec du pain grillé.~Por último, triture la preparación y sírvala con pan tostado.
Un guide de visite¦Una guía de visita¦Relaciona horarios, servicios y condiciones de acceso en una guía turística.¦Los relativos « qui » y « où » conectan una atracción con una característica o un lugar.¦guide=guía; visite=visita; ouvert=abierto; entrée=entrada; accessible=accesible¦Le musée des Arts, qui se trouve près du canal, est ouvert tous les jours sauf le mardi.~El museo de Artes, que está cerca del canal, abre todos los días excepto el martes.§La visite guidée commence à onze heures et dure environ cinquante minutes.~La visita guiada empieza a las once y dura unos cincuenta minutos.§L'entrée est gratuite pour les moins de dix-huit ans; le billet s'achète à l'accueil.~La entrada es gratuita para menores de dieciocho años; el billete se compra en recepción.§Un ascenseur permet d'accéder aux salles du premier étage.~Un ascensor permite acceder a las salas de la primera planta.
Comparer deux offres¦Comparar dos ofertas¦Compara prestaciones, precio y límites en dos descripciones de producto.¦« Moins cher » compara precio; « pourtant » puede introducir una ventaja que compensa un inconveniente.¦offre=oferta; garantie=garantía; livraison=entrega; pourtant=sin embargo; choisir=elegir¦L'offre A propose un vélo électrique à 890 euros, avec une garantie de deux ans.~La oferta A propone una bicicleta eléctrica por 890 euros, con dos años de garantía.§L'offre B coûte 760 euros, mais sa batterie a une autonomie plus courte.~La oferta B cuesta 760 euros, pero su batería tiene menos autonomía.§La livraison est gratuite pour les deux modèles jusqu'à la fin du mois.~La entrega es gratuita para los dos modelos hasta fin de mes.§Le vendeur conseille le modèle A aux personnes qui parcourent de longues distances.~El vendedor recomienda el modelo A a las personas que recorren largas distancias.
Une brève locale¦Una noticia local breve¦Extrae qué ocurrió, dónde y cuándo de una noticia local.¦El passé composé presenta el suceso; el imparfait puede describir el contexto que ya estaba en curso.¦quartier=barrio; travaux=obras; ouvrir=abrir; circulation=tráfico; détour=desvío¦La mairie a ouvert un nouvel espace vert dans le quartier Saint-Roch samedi dernier.~El ayuntamiento abrió un nuevo espacio verde en el barrio de Saint-Roch el sábado pasado.§Les travaux ont duré six mois et ont coûté moins cher que prévu.~Las obras duraron seis meses y costaron menos de lo previsto.§Pendant la cérémonie, les habitants ont planté des arbres et visité le jardin.~Durante la ceremonia, los vecinos plantaron árboles y visitaron el jardín.§La rue reste fermée aux voitures jusqu'à vendredi; les bus suivent un détour.~La calle sigue cerrada a los coches hasta el viernes; los autobuses siguen un desvío.
Lire une consigne de santé¦Leer indicaciones de salud¦Comprende frecuencia, duración y precauciones en una recomendación sanitaria general.¦« Depuis », « pendant » y « avant de » sitúan duración y orden; no conviertas una recomendación general en diagnóstico.¦notice=prospecto; dose=dosis; pendant=durante; éviter=evitar; pharmacie=farmacia¦La notice indique de prendre un comprimé après le repas, deux fois par jour.~El prospecto indica tomar un comprimido después de la comida, dos veces al día.§Le traitement dure cinq jours; il faut lire les précautions avant de commencer.~El tratamiento dura cinco días; hay que leer las precauciones antes de empezar.§Évitez de conduire si le médicament provoque de la somnolence.~Evite conducir si el medicamento provoca somnolencia.§En cas de doute ou d'effet inattendu, demandez conseil à un professionnel de santé.~En caso de duda o de un efecto inesperado, pida consejo a un profesional de salud.
Une annonce de formation¦Un aviso de formación¦Localiza requisitos, fechas y modalidad en un anuncio de curso.¦« Il faut » expresa un requisito; « avoir lieu » indica dónde o cuándo se celebra algo.¦formation=formación; candidature=candidatura; niveau=nivel; avoir lieu=tener lugar; avant=antes¦Le centre propose une formation de photographie pour les adultes débutants.~El centro ofrece un curso de fotografía para adultos principiantes.§Les cours ont lieu le mardi soir, du 3 novembre au 15 décembre.~Las clases tienen lugar los martes por la tarde, del 3 de noviembre al 15 de diciembre.§Il faut apporter un appareil photo; les candidatures sont ouvertes jusqu'au 20 octobre.~Hay que traer una cámara; las candidaturas están abiertas hasta el 20 de octubre.§Le premier cours aura lieu dans la salle 4, au deuxième étage.~La primera clase será en el aula 4, en la segunda planta.
Un itinéraire modifié¦Un itinerario modificado¦Entiende un cambio de transporte y busca la consecuencia práctica para el viaje.¦« À cause de » presenta la causa; « donc » y « en revanche » conectan sus consecuencias.¦retard=retraso; correspondance=conexión; prévenir=avisar; quai=andén; remplacer=sustituir¦En raison d'un incident, le train pour Dijon partira avec vingt minutes de retard.~Debido a un incidente, el tren a Dijon saldrá con veinte minutos de retraso.§La correspondance de 14 h 10 est donc impossible; un autre train part à 15 h.~Por eso, no se podrá tomar la conexión de las 14:10; otro tren sale a las 15.§Les voyageurs doivent consulter les écrans avant de rejoindre le quai.~Los viajeros deben consultar las pantallas antes de dirigirse al andén.§Le billet reste valable pour le départ suivant, mais aucune place assise n'est garantie.~El billete sigue siendo válido para la salida siguiente, pero no se garantiza asiento.
Une page sur la vie locale¦Una página sobre la vida local¦Distingue información descriptiva, opinión y dato concreto en un texto cultural.¦Los adverbios de frecuencia y los conectores de contraste matizan una descripción habitual.¦habitude=hábito; pourtant=sin embargo; voisin=vecino; marché=mercado; fréquenter=frecuentar¦Chaque dimanche, le marché de la place attire les habitants des villages voisins.~Cada domingo, el mercado de la plaza atrae a habitantes de los pueblos cercanos.§On y trouve du fromage, des légumes et des objets fabriqués dans la région.~Allí se encuentran queso, verduras y objetos fabricados en la región.§Le marché est souvent très animé; pourtant, les commerçants rangent leurs stands avant midi.~El mercado suele estar muy animado; sin embargo, los comerciantes recogen sus puestos antes del mediodía.§Pour beaucoup de familles, cette sortie est aussi une occasion de se retrouver.~Para muchas familias, esta salida también es una ocasión para reunirse.
Raconter une expérience¦Contar una experiencia¦Sigue una experiencia pasada y reconoce el contraste entre fondo y acciones sucesivas.¦El imparfait describe una situación o costumbre; el passé composé relata hechos delimitados.¦souvenir=recuerdo; autrefois=antes; randonnée=excursión; soudain=de repente; rentrer=volver¦Quand j'étais enfant, nous passions souvent les vacances chez mes grands-parents.~Cuando era niño, pasábamos a menudo las vacaciones en casa de mis abuelos.§Un été, nous avons fait une randonnée dans les Alpes et nous avons perdu le chemin.~Un verano hicimos una excursión en los Alpes y perdimos el camino.§Il commençait à pleuvoir quand un berger nous a indiqué le sentier du village.~Empezaba a llover cuando un pastor nos indicó el sendero del pueblo.§Nous sommes rentrés tard, mais cette journée reste un très bon souvenir.~Volvimos tarde, pero ese día sigue siendo un recuerdo muy bueno.
Un échange en ligne¦Un intercambio en línea¦Interpreta intención, referencias y respuestas en una conversación escrita breve.¦El pronombre « y » puede retomar un lugar o una actividad; « en » puede sustituir una cantidad ya mencionada.¦forum=foro; répondre=responder; y=allí; en=de eso; avis=opinión¦Camille : « Le nouvel atelier de céramique est complet. Vous y êtes déjà allé ? »~Camille: «El nuevo taller de cerámica está completo. ¿Ya has ido?»§Nabil : « Oui, j'y suis allé mardi; on y apprend à fabriquer une tasse. »~Nabil: «Sí, fui el martes; allí se aprende a fabricar una taza.»§Camille : « J'en ai entendu parler, mais je n'ai pas encore réservé. »~Camille: «He oído hablar de él, pero todavía no he reservado.»§Nabil : « Les places partent vite; il en reste seulement deux pour décembre. »~Nabil: «Las plazas se agotan rápido; solo quedan dos para diciembre.»
Repérer la grammaire en contexte¦Gramática dentro del texto¦Usa artículos, pronombres y negación para interpretar un mensaje cotidiano.¦En la lectura, el artículo definido puede hablar de una categoría; los pronombres retoman un nombre anterior y la negación cambia con la estructura.¦aucun=ningún; rien=nada; personne=nadie; article=artículo; reprise=referencia¦Au club, les membres peuvent emprunter des raquettes; les débutants n'en ont pas besoin.~En el club, los socios pueden pedir raquetas; los principiantes no las necesitan.§L'entraîneuse leur explique les règles et leur montre le terrain.~La entrenadora les explica las reglas y les enseña la pista.§Personne ne doit entrer sur le court avec des chaussures de ville.~Nadie debe entrar en la pista con zapatos de calle.§Aucun équipement n'est prêté après vingt heures, car le local ferme.~No se presta ningún equipo después de las ocho porque cierra el local.
Lire un dossier complet¦Lectura integrada de varios documentos¦Cruza información de un correo, un anuncio y un horario para resolver una tarea cotidiana.¦Contrasta quién escribe, a qué documento se refiere y qué acción o fecha sigue vigente.¦courriel=correo; billet=billete; réservation=reserva; entrée=entrada; confirmer=confirmar¦Un courriel confirme une visite guidée du château pour samedi à quatorze heures.~Un correo confirma una visita guiada al castillo para el sábado a las dos.§L'annonce précise que le billet coûte huit euros et que la réservation est obligatoire.~El anuncio precisa que el billete cuesta ocho euros y que la reserva es obligatoria.§Un second message annonce que l'entrée se fera par la porte nord, à cause des travaux.~Un segundo mensaje anuncia que la entrada será por la puerta norte debido a las obras.§Le dernier bus repart à dix-sept heures trente; la visite se termine à quinze heures trente.~El último autobús sale a las cinco y media; la visita termina a las tres y media.
[B1]
Un courriel personnel¦Correspondencia personal¦Sigue el motivo de un correo y distingue petición, explicación y propuesta de respuesta.¦El condicional de cortesía suaviza una petición; los conectores explican por qué se propone otra fecha.¦disponibilité=disponibilidad; proposer=proponer; prévenir=avisar; pourtant=sin embargo; répondre=responder¦Bonjour Claire, pourrais-tu me confirmer ta disponibilité pour le week-end du 12 ?~Hola, Claire: ¿podrías confirmarme si estás disponible el fin de semana del 12?§Je voudrais réserver la salle avant jeudi, car le tarif augmente ensuite.~Quisiera reservar la sala antes del jueves porque después sube la tarifa.§Si tu ne peux pas venir samedi, on pourrait organiser la rencontre dimanche matin.~Si no puedes venir el sábado, podríamos organizar el encuentro el domingo por la mañana.§Tiens-moi au courant; j'ai déjà prévenu les autres membres du groupe.~Avísame; ya he avisado a los demás miembros del grupo.
Une lettre de réclamation¦Una reclamación formal¦Reconoce el problema, las pruebas citadas y la solución solicitada en una reclamación.¦Las fórmulas de cortesía mantienen el registro formal; « en effet » introduce una prueba y « par conséquent » una petición.¦réclamation=reclamación; reçu=recibo; remboursement=reembolso; joindre=adjuntar; délai=plazo¦Madame, je vous écris au sujet de la commande reçue le 4 avril, dont l'emballage était endommagé.~Señora: le escribo acerca del pedido recibido el 4 de abril, cuyo embalaje estaba dañado.§J'ai joint une photographie ainsi qu'une copie du reçu à ce message.~He adjuntado una fotografía y una copia del recibo a este mensaje.§Le produit fonctionne, mais son écran est rayé; je souhaiterais donc un remplacement.~El producto funciona, pero su pantalla está rayada; por eso desearía un reemplazo.§Je vous remercie de m'indiquer la procédure et le délai de traitement de ma demande.~Le agradecería que me indicara el procedimiento y el plazo para tramitar mi solicitud.
Un formulaire administratif¦Un formulario administrativo¦Interpreta campos, instrucciones y documentos que acompañan una solicitud.¦Los infinitivos en instrucciones nombran acciones; « obligatoire » y « facultatif » separan requisito y opción.¦formulaire=formulario; justificatif=justificante; obligatoire=obligatorio; joindre=adjuntar; signature=firma¦Le formulaire d'inscription doit être rempli en lettres majuscules et signé à la dernière page.~El formulario de inscripción debe rellenarse en mayúsculas y firmarse en la última página.§Le justificatif de domicile est obligatoire; une photo récente est facultative.~El justificante de domicilio es obligatorio; una foto reciente es opcional.§Joignez les deux documents à votre dossier avant le 30 septembre.~Adjunte los dos documentos a su expediente antes del 30 de septiembre.§La mairie enverra une confirmation par courriel après vérification des pièces.~El ayuntamiento enviará una confirmación por correo electrónico después de revisar los documentos.
Un mode d'emploi¦Un manual de instrucciones¦Ordena pasos y condiciones para utilizar un aparato de forma segura.¦El imperativo da instrucciones directas; « avant de » y « après avoir » ordenan acciones.¦mode d'emploi=manual; brancher=conectar; voyant=indicador; débrancher=desconectar; consigne=indicación¦Avant de brancher l'appareil, vérifiez que le réservoir d'eau est correctement installé.~Antes de conectar el aparato, compruebe que el depósito de agua está bien colocado.§Appuyez sur le bouton principal et attendez que le voyant vert s'allume.~Pulse el botón principal y espere a que se encienda el indicador verde.§Après avoir terminé, débranchez la machine et laissez-la refroidir dix minutes.~Al terminar, desenchufe la máquina y déjela enfriar diez minutos.§N'ouvrez jamais le couvercle lorsque l'appareil est en marche.~No abra nunca la tapa mientras el aparato esté en funcionamiento.
Lire une étiquette sanitaire¦Leer una etiqueta sanitaria¦Busca indicación, advertencia y circunstancia de uso en una etiqueta informativa.¦Las construcciones impersonales y los pronombres de objeto precisan qué se debe hacer o evitar.¦étiquette=etiqueta; somnolence=somnolencia; conserver=conservar; usage=uso; avertissement=advertencia¦L'étiquette précise que ce produit peut provoquer une légère somnolence chez certaines personnes.~La etiqueta precisa que este producto puede provocar somnolencia leve en algunas personas.§Il est conseillé de le prendre le soir, sauf indication différente d'un professionnel.~Se aconseja tomarlo por la noche, salvo que un profesional indique otra cosa.§Conservez le flacon à température ambiante et hors de portée des enfants.~Conserve el frasco a temperatura ambiente y fuera del alcance de los niños.§Si un effet inattendu apparaît, arrêtez l'utilisation et demandez conseil à un pharmacien.~Si aparece un efecto inesperado, deje de usarlo y consulte a un farmacéutico.
Une nouvelle de quartier¦Una noticia del barrio¦Distingue hecho principal, contexto y consecuencias en una noticia local.¦El passé composé presenta hechos; el imparfait describe el escenario y los conectores enlazan consecuencias.¦inaugurer=inaugurar; chantier=obra; riverain=vecino; réduire=reducir; circulation=tráfico¦La ville a inauguré lundi une piste cyclable de quatre kilomètres entre la gare et le campus.~La ciudad inauguró el lunes un carril bici de cuatro kilómetros entre la estación y el campus.§Le chantier avait commencé au printemps, alors que la rue restait ouverte aux bus.~Las obras habían empezado en primavera, mientras la calle seguía abierta a los autobuses.§Selon la mairie, le nouvel itinéraire réduira le trafic près des écoles.~Según el ayuntamiento, el nuevo itinerario reducirá el tráfico cerca de las escuelas.§Des riverains demandent cependant davantage de places pour les vélos autour de la gare.~Sin embargo, algunos vecinos piden más aparcamientos para bicicletas alrededor de la estación.
Un récit à remettre en ordre¦Un relato que hay que ordenar¦Reconstruye la secuencia de un relato y distingue causa, descubrimiento y resultado.¦« Dès que », « pendant que » y « finalement » expresan relaciones temporales; los pronombres relativos retoman elementos anteriores.¦soudain=de repente; retrouver=reencontrar; pendant=durante; finalement=finalmente; chemin=camino¦Alors que nous rentrions du marché, une pluie soudaine nous a obligés à chercher un abri.~Cuando volvíamos del mercado, una lluvia repentina nos obligó a buscar refugio.§Nous sommes entrés dans une vieille librairie qui se trouvait au coin de la rue.~Entramos en una librería antigua que estaba en la esquina.§Pendant que nous attendions, la libraire a reconnu le sac que j'avais perdu la veille.~Mientras esperábamos, la librera reconoció el bolso que yo había perdido el día anterior.§Finalement, nous sommes rentrés avec le sac et un roman recommandé par la libraire.~Al final volvimos con el bolso y una novela que nos recomendó la librera.
Des avis sur le forum¦Opiniones en un foro¦Identifica postura, razón y concesión en opiniones escritas sobre un tema cotidiano.¦« À mon avis » introduce una postura; « même si » concede un punto sin abandonar la idea principal.¦avis=opinión; pratique=práctico; pourtant=sin embargo; même si=aunque; trajet=trayecto¦À mon avis, le télétravail facilite l'organisation des journées, surtout pour les longs trajets.~En mi opinión, el teletrabajo facilita organizar los días, sobre todo cuando hay trayectos largos.§Même si les échanges à distance sont pratiques, certaines décisions demandent une discussion en personne.~Aunque los intercambios a distancia son prácticos, algunas decisiones requieren hablar en persona.§Je préfère donc travailler chez moi deux jours par semaine et retrouver l'équipe les autres jours.~Por eso prefiero trabajar en casa dos días a la semana y reunirme con el equipo los demás días.§D'autres membres du forum estiment que le bureau aide à séparer le travail et la vie privée.~Otros miembros del foro consideran que la oficina ayuda a separar el trabajo y la vida privada.
Un article qui propose des solutions¦Un artículo con propuestas¦Relaciona un problema social con sus causas, propuestas y posibles límites.¦Los conectores causales y concesivos organizan un razonamiento; el condicional puede presentar propuestas prudentes.¦déchets=residuos; collecte=recogida; réutiliser=reutilizar; quartier=barrio; mesure=medida¦Dans plusieurs quartiers, les habitants produisent davantage de déchets depuis que les livraisons à domicile se sont développées.~En varios barrios, los vecinos producen más residuos desde que se extendieron los repartos a domicilio.§Une association propose des points de collecte où l'on peut déposer les emballages réutilisables.~Una asociación propone puntos de recogida donde se pueden dejar los envases reutilizables.§La mesure réduirait le plastique, à condition que les commerces acceptent de participer.~La medida reduciría el plástico, siempre que los comercios aceptaran participar.§Cependant, la mairie doit préciser qui nettoiera les points et comment les coûts seront partagés.~Sin embargo, el ayuntamiento debe precisar quién limpiará los puntos y cómo se repartirán los costes.
Comparer des sources¦Comparar fuentes¦Contrasta datos que coinciden y difieren en dos fuentes sobre el mismo acontecimiento.¦Distingue fuente, fecha y alcance; dos textos pueden usar cifras distintas porque miden periodos diferentes.¦source=fuente; enquête=encuesta; chiffre=cifra; période=periodo; confirmer=confirmar¦Le journal municipal affirme que 62 % des habitants utilisent le parc chaque semaine.~El periódico municipal afirma que el 62 % de los vecinos utiliza el parque cada semana.§Une enquête publiée en juin donne 55 %, mais elle interroge uniquement les résidents du centre.~Una encuesta publicada en junio da un 55 %, pero solo pregunta a los residentes del centro.§Les deux textes confirment que la fréquentation augmente depuis l'ouverture de la nouvelle aire de jeux.~Ambos textos confirman que las visitas aumentan desde que se abrió la nueva zona de juegos.§La différence s'explique peut-être par la date et par le groupe interrogé.~La diferencia quizá se explica por la fecha y por el grupo encuestado.
Une chronique culturelle¦Una crónica cultural¦Distingue descripción, ejemplo y opinión en una crónica sobre una práctica cultural.¦Las relativas especifican a qué persona o actividad se refiere el texto; los marcadores de opinión indican interpretación.¦chronique=crónica; bénévole=voluntario; transmettre=transmitir; atelier=taller; patrimoine=patrimonio¦Dans le village de Saint-Loup, des bénévoles organisent chaque été un atelier de fabrication de masques.~En el pueblo de Saint-Loup, voluntarios organizan cada verano un taller de fabricación de máscaras.§Cette tradition, qui se transmet depuis plusieurs générations, attire aussi des visiteurs.~Esta tradición, que se transmite desde hace varias generaciones, también atrae a visitantes.§Les participants apprennent à travailler le bois avant de décorer leur création.~Los participantes aprenden a trabajar la madera antes de decorar su creación.§Pour la chroniqueuse, ces rencontres préservent un savoir-faire tout en créant des liens entre voisins.~Para la cronista, estos encuentros preservan un saber hacer y crean vínculos entre vecinos.
Une annonce d'études et d'emploi¦Un aviso de estudios y trabajo¦Extrae perfil solicitado, tareas, horario y plazo de candidatura en una oferta.¦Las proposiciones relativas especifican el puesto; « dont » puede retomar un nombre introducido por « de ».¦candidature=candidatura; poste=puesto; expérience=experiencia; dont=de los que; horaires=horarios¦La médiathèque recherche un étudiant qui connaît bien les outils numériques pour aider le public.~La mediateca busca a un estudiante que conozca bien las herramientas digitales para ayudar al público.§Le poste comprend l'accueil des visiteurs et la préparation d'ateliers, dont un rendez-vous hebdomadaire pour les débutants.~El puesto incluye atender a los visitantes y preparar talleres, uno de ellos semanal para principiantes.§Les horaires sont répartis sur deux après-midi et le samedi matin.~El horario se reparte entre dos tardes y el sábado por la mañana.§Les candidatures, accompagnées d'un CV, doivent parvenir avant le 8 mai.~Las candidaturas, acompañadas de un currículum, deben llegar antes del 8 de mayo.
Les formes dans le texte¦Las formas dentro del texto¦Usa concordancia, relativos y formas verbales para resolver referencias en un documento.¦Comprueba el antecedente del pronombre y el sujeto del verbo; la terminación escrita puede aportar género y número aunque no se oiga.¦dossier=expediente; antécédent=antecedente; lequel=el cual; pourtant=sin embargo; candidature=candidatura¦Les dossiers que la commission a reçus hier seront examinés par deux personnes.~Los expedientes que recibió ayer la comisión serán examinados por dos personas.§Les membres, dont plusieurs travaillent à distance, se réuniront jeudi matin.~Los miembros, varios de los cuales trabajan a distancia, se reunirán el jueves por la mañana.§La candidate que vous avez appelée a confirmé qu'elle serait disponible.~La candidata a la que llamó confirmó que estaría disponible.§Les résultats seront publiés dès que le comité aura terminé la vérification.~Los resultados se publicarán cuando el comité haya terminado la verificación.
Lire un dossier de presse¦Lectura integrada de prensa¦Integra una noticia, una reacción institucional y el testimonio de una persona afectada.¦Separa hechos confirmados, declaraciones y previsiones; atribuye cada afirmación a su fuente.¦témoignage=testimonio; déclaration=declaración; annoncé=anunciado; conséquence=consecuencia; source=fuente¦La région a annoncé la fermeture temporaire du pont après une inspection menée mardi matin.~La región anunció el cierre temporal del puente tras una inspección realizada el martes por la mañana.§Un communiqué précise que les bus seront déviés pendant trois semaines, le temps de renforcer la structure.~Un comunicado precisa que los autobuses se desviarán durante tres semanas mientras se refuerza la estructura.§Une commerçante explique que les livraisons sont déjà retardées et demande une signalisation plus claire.~Una comerciante explica que los repartos ya se retrasan y pide una señalización más clara.§Les autorités promettent un nouvel examen du pont avant sa réouverture, sans annoncer de date précise.~Las autoridades prometen una nueva inspección del puente antes de reabrirlo, pero no anuncian una fecha concreta.
[B2]
Un article de presse¦Un artículo de prensa¦Localiza tesis, datos y voces citadas en un artículo de prensa de actualidad.¦Un título accrocheur no sustituye la tesis; atribuye cifras y valoraciones a quien las formula.¦article=artículo; enquête=encuesta; recul=descenso; selon=según; toutefois=sin embargo¦L'article présente la baisse de fréquentation des centres-villes comme un phénomène récent, mais souligne que les chiffres varient selon les quartiers.~El artículo presenta la caída de visitas a los centros urbanos como un fenómeno reciente, pero señala que las cifras varían según los barrios.§Une enquête menée auprès de 1 200 commerçants associe ce recul à la hausse des loyers et à l'évolution des habitudes d'achat.~Una encuesta realizada a 1.200 comerciantes relaciona este descenso con la subida de los alquileres y el cambio en los hábitos de compra.§La municipalité rappelle toutefois que les rues piétonnes attirent davantage de visiteurs les jours de marché.~Sin embargo, el ayuntamiento recuerda que las calles peatonales atraen a más visitantes los días de mercado.§L'auteur conclut que ces données ne permettent pas, à elles seules, d'établir une cause unique.~El autor concluye que esos datos, por sí solos, no permiten establecer una causa única.
Une correspondance formelle¦Correspondencia formal¦Interpreta tono, propósito y matices de una carta profesional.¦Las fórmulas convencionales enmarcan el intercambio; el condicional y las nominalizaciones ajustan la cortesía y la distancia.¦convention=convenio; échéance=plazo; convenir=convenir; veuillez=tenga la amabilidad; démarche=gestión¦Madame, je reviens vers vous au sujet de la convention transmise le 3 mai, dont la date d'effet reste à confirmer.~Señora: le escribo de nuevo en relación con el convenio enviado el 3 de mayo, cuya fecha de entrada en vigor aún está por confirmar.§Afin de respecter l'échéance prévue, pourriez-vous nous indiquer si les annexes doivent être paraphées séparément ?~Para respetar el plazo previsto, ¿podría indicarnos si los anexos deben rubricarse por separado?§Nous avons d'ores et déjà fait parvenir les pièces justificatives demandées, à l'exception du relevé qui vous sera adressé demain.~Ya hemos enviado los justificantes solicitados, salvo el extracto que le haremos llegar mañana.§Dans l'attente de votre retour, je vous prie d'agréer, Madame, l'expression de mes salutations distinguées.~A la espera de su respuesta, le saludo atentamente, señora.
Informer ou convaincre¦Informar o persuadir¦Distingue datos verificables, selección de información y recursos de persuasión.¦Los adjetivos valorativos, las preguntas retóricas y los datos sin fuente orientan la lectura sin demostrar una afirmación.¦entreprise=empresa; fiable=fiable; séduisant=atractivo; preuve=prueba; prétendre=afirmar¦Le dossier d'une entreprise qualifie son nouveau service de « révolutionnaire » et promet une livraison sans attente.~El dossier de una empresa califica su nuevo servicio de «revolucionario» y promete una entrega sin esperas.§Il cite un délai moyen de douze minutes, sans préciser la période ni l'origine de la mesure.~Cita un tiempo medio de doce minutos, sin precisar el periodo ni el origen de la medición.§Une association indépendante relève, sur un échantillon plus large, des écarts importants selon l'heure et la zone.~Una asociación independiente observa, en una muestra mayor, diferencias importantes según la hora y la zona.§Le premier texte cherche à séduire; le second explicite davantage la méthode, sans pour autant répondre à toutes les questions.~El primer texto busca atraer; el segundo explica mejor el método, aunque tampoco responde a todas las preguntas.
Peser des arguments¦Sopesar argumentos¦Reconstruye una argumentación con tesis, objeción, concesión y conclusión.¦« Certes » concede un punto; « néanmoins » introduce un límite y « dès lors » señala una consecuencia.¦abonnement=suscripción; certes=ciertamente; néanmoins=no obstante; tarif=tarifa; renoncer=renunciar¦La ville envisage un abonnement unique qui donnerait accès aux bus, aux tramways et aux vélos partagés.~La ciudad estudia una suscripción única que daría acceso a autobuses, tranvías y bicicletas compartidas.§Certes, la formule simplifierait les déplacements et pourrait réduire l'usage de la voiture dans le centre.~Ciertamente, la fórmula simplificaría los desplazamientos y podría reducir el uso del coche en el centro.§Néanmoins, le tarif proposé reste élevé pour les ménages qui n'utilisent les transports qu'occasionnellement.~No obstante, la tarifa propuesta sigue siendo elevada para los hogares que solo utilizan el transporte de vez en cuando.§Dès lors, les associations demandent une option à la journée et une réduction selon le revenu.~Por ello, las asociaciones piden una opción diaria y una reducción según los ingresos.
Un rapport avec recommandations¦Un informe con recomendaciones¦Lee metodología, resultados y recomendaciones en un informe breve.¦Separa hallazgo de recomendación; los verbos modales y condicionales expresan grado de certeza o propuesta.¦rapport=informe; échantillon=muestra; constat=hallazgo; recommandation=recomendación; mettre en œuvre=aplicar¦Le rapport examine les déplacements de 340 salariés pendant six semaines, au moyen d'un journal de trajet quotidien.~El informe analiza los desplazamientos de 340 empleados durante seis semanas mediante un registro diario de trayectos.§Il constate que les horaires flexibles diminuent les retards, sans réduire le nombre de réunions manquées.~Observa que los horarios flexibles reducen los retrasos, pero no el número de reuniones perdidas.§Les auteurs recommandent d'étendre l'essai aux équipes qui accueillent du public avant d'en généraliser les résultats.~Los autores recomiendan ampliar el ensayo a los equipos que atienden al público antes de generalizar los resultados.§Ils précisent que l'échantillon ne permet pas d'évaluer les effets sur la satisfaction à long terme.~Precisan que la muestra no permite evaluar los efectos en la satisfacción a largo plazo.
Confronter plusieurs sources¦Contrastar varias fuentes¦Sintetiza coincidencias y diferencias entre tres documentos con alcances distintos.¦Comprueba autoría, fecha, población y método antes de comparar cifras o inferir una tendencia.¦source=fuente; sondage=sondeo; échantillon=muestra; recouper=contrastar; tendance=tendencia¦La note municipale fait état d'une hausse de 18 % des trajets à vélo entre avril et juin.~La nota municipal informa de un aumento del 18 % de los trayectos en bicicleta entre abril y junio.§Un sondage national, publié la même semaine, indique une progression de 11 % sur l'année entière.~Un sondeo nacional, publicado esa misma semana, señala una subida del 11 % durante todo el año.§Un collectif local conteste la comparaison, car le nouveau comptage ne couvre que les axes réaménagés.~Un colectivo local cuestiona la comparación porque el nuevo recuento solo cubre las vías remodeladas.§Les sources convergent sur une hausse, mais elles ne mesurent ni la même période ni le même territoire.~Las fuentes coinciden en que hay un aumento, pero no miden el mismo periodo ni el mismo territorio.
Un article spécialisé¦Un artículo especializado¦Deduce términos especializados por su contexto y sigue la explicación de un mecanismo.¦Las definiciones, ejemplos y reformulaciones pueden aclarar léxico técnico sin traducir cada palabra.¦biodiversité=biodiversidad; habitat=hábitat; restaurer=restaurar; espèce=especie; milieu=entorno¦L'article explique comment la restauration des zones humides améliore la biodiversité, en particulier dans les plaines agricoles.~El artículo explica cómo la restauración de zonas húmedas mejora la biodiversidad, especialmente en las llanuras agrícolas.§Ces milieux retiennent l'eau lors des pluies fortes et ralentissent son écoulement vers les cours d'eau.~Estos entornos retienen agua durante las lluvias intensas y ralentizan su flujo hacia los cursos de agua.§Ils offrent également un habitat à des espèces qui ne trouvent plus assez de nourriture dans les champs cultivés.~También ofrecen hábitat a especies que ya no encuentran suficiente alimento en los campos de cultivo.§Les chercheurs précisent cependant que la seule plantation de roseaux ne suffit pas à rétablir l'équilibre écologique.~Sin embargo, los investigadores precisan que plantar carrizos por sí solo no basta para restablecer el equilibrio ecológico.
Des consignes à plusieurs étapes¦Instrucciones de varios pasos¦Sigue una instrucción compleja y reconoce excepciones, condiciones y orden temporal.¦Las subordinadas condicionales y temporales delimitan cuándo se aplica cada instrucción; atiende a negaciones de alcance.¦consigne=instrucción; préalable=requisito previo; sauf=salvo; joindre=adjuntar; valider=validar¦Avant de valider le dossier, vérifiez que chaque pièce porte le numéro de référence indiqué sur la première page.~Antes de validar el expediente, compruebe que cada documento lleva el número de referencia indicado en la primera página.§Joignez les annexes dans l'ordre demandé, sauf celles qui contiennent des données confidentielles; celles-ci doivent être déposées séparément.~Adjunte los anexos en el orden solicitado, salvo los que contengan datos confidenciales; estos deben presentarse por separado.§Si une pièce manque, enregistrez le brouillon sans l'envoyer et ajoutez une note précisant le délai prévu.~Si falta un documento, guarde el borrador sin enviarlo y añada una nota que indique el plazo previsto.§Une fois le dépôt confirmé, le système bloque toute modification; contactez le service compétent en cas d'erreur.~Una vez confirmado el envío, el sistema bloquea cualquier modificación; contacte con el servicio correspondiente si hay un error.
Nuances et expressions¦Matices y expresiones¦Interpreta connotación, registro y expresiones idiomáticas por el contexto.¦Una expresión idiomática puede apartarse de su sentido literal; identifica quién la usa y con qué intención.¦nuance=matiz; prendre du recul=tomar distancia; au pied de la lettre=al pie de la letra; détour=desvío; reproche=reproche¦Dans son éditorial, la journaliste invite les lecteurs à prendre du recul avant de réagir à la première alerte.~En su editorial, la periodista invita a los lectores a tomar distancia antes de reaccionar ante la primera alerta.§Elle rappelle que les titres accrocheurs ne doivent pas toujours être pris au pied de la lettre.~Recuerda que los titulares llamativos no siempre deben tomarse al pie de la letra.§L'expression n'est pas un reproche adressé au public, mais une mise en garde contre les conclusions hâtives.~La expresión no es un reproche al público, sino una advertencia contra las conclusiones precipitadas.§Le texte oppose ainsi le doute méthodique à la méfiance systématique envers toute information.~Así, el texto opone la duda metódica a la desconfianza sistemática hacia cualquier información.
Suivre les reprises dans un texte¦Seguir referencias en un texto¦Identifica antecedentes, elipsis y relaciones entre párrafos en un texto cohesionado.¦Los pronombres y las nominalizaciones retoman ideas previas; verifica el referente antes de atribuir una acción.¦reprise=referencia; antécédent=antecedente; celle-ci=esta; dispositif=medida; en revanche=en cambio¦La région a lancé une aide destinée aux petites librairies, dont plusieurs risquaient de fermer avant l'été.~La región puso en marcha una ayuda destinada a pequeñas librerías, varias de las cuales corrían el riesgo de cerrar antes del verano.§Celles-ci pourront financer des travaux, à condition de maintenir leurs horaires d'ouverture au moins un an.~Estas podrán financiar obras, siempre que mantengan sus horarios de apertura durante al menos un año.§Le dispositif, présenté au paragraphe précédent, vise aussi à préserver l'emploi dans les centres-bourgs.~La medida, presentada en el párrafo anterior, también pretende preservar el empleo en los centros urbanos pequeños.§En revanche, les librairies qui appartiennent à une grande chaîne ne peuvent pas en bénéficier.~En cambio, las librerías que pertenecen a una gran cadena no pueden beneficiarse de ella.
Lire un débat contemporain¦Leer un debate contemporáneo¦Reconstruye el debate y separa dato, valoración y propuesta en textos sobre un tema actual.¦Las atribuciones verbales y los marcadores de reserva indican cuánto respalda cada fuente una afirmación.¦débat=debate; réserve=reserva; accès=acceso; arbitrage=decisión; néanmoins=no obstante¦Le débat sur les bibliothèques ouvertes le soir porte autant sur l'accès aux services que sur les conditions de travail.~El debate sobre abrir las bibliotecas por la noche trata tanto del acceso a los servicios como de las condiciones laborales.§Les usagers interrogés estiment que ces horaires faciliteraient les études, notamment pour les personnes salariées.~Los usuarios entrevistados consideran que esos horarios facilitarían los estudios, especialmente para quienes trabajan.§Le personnel exprime des réserves, faute d'effectifs suffisants pour assurer les permanences supplémentaires.~El personal expresa reservas por falta de plantilla suficiente para cubrir los turnos adicionales.§La mairie annonce une expérimentation limitée à deux établissements avant tout arbitrage définitif.~El ayuntamiento anuncia una prueba limitada a dos centros antes de tomar una decisión definitiva.
La grammaire au service du sens¦La gramática al servicio del sentido¦Interpreta anterioridad, hipótesis y valoración por la forma verbal elegida.¦Reconoce qué hecho precede a otro, si el autor plantea una posibilidad y qué verbo rige el subjuntivo.¦bien que=aunque; hypothèse=hipótesis; rapport=informe; démarche=procedimiento; aboutir=culminar¦Bien que la commission ait reçu tous les avis, elle n'a pas encore arrêté sa décision.~Aunque la comisión ha recibido todas las opiniones, todavía no ha tomado una decisión.§Le rapport, qui avait été rédigé avant la consultation, sera complété par une annexe.~El informe, que se había redactado antes de la consulta, se completará con un anexo.§Si le financement était confirmé, les travaux pourraient commencer dès le mois de juin.~Si se confirmara la financiación, las obras podrían comenzar en junio mismo.§Les responsables souhaitent que le nouveau dispositif réponde aux besoins qui ont été signalés.~Los responsables desean que el nuevo sistema responda a las necesidades que se han señalado.
Une synthèse multi-documents¦Síntesis de varios documentos¦Resuelve una lectura integrada con documentos informativos, una opinión y un dato sujeto a condición.¦Sintetiza sin borrar las reservas: separa lo decidido, lo propuesto y lo que depende de una evaluación posterior.¦synthèse=síntesis; réserve=reserva; échéance=plazo; évaluer=evaluar; sous réserve de=a reserva de¦Le conseil a voté la rénovation de la gare, mais le calendrier définitif dépend encore de l'appel d'offres.~El consejo aprobó la renovación de la estación, pero el calendario definitivo aún depende del concurso público.§La note technique prévoit une fermeture partielle de six mois et recommande de maintenir un accès aux quais.~La nota técnica prevé un cierre parcial de seis meses y recomienda mantener el acceso a los andenes.§Une association de voyageurs soutient le projet, tout en demandant une solution pour les personnes à mobilité réduite.~Una asociación de viajeros apoya el proyecto, pero pide una solución para las personas con movilidad reducida.§Le financement est annoncé sous réserve d'une évaluation des coûts, qui sera publiée avant la fin de l'année.~La financiación se anuncia sujeta a una evaluación de costes que se publicará antes de fin de año.

"""  # B1 y B2 se añaden en bloques posteriores.


def parse_unit(line: str) -> dict:
    fields = line.split("¦")
    if len(fields) != 6:
        raise ValueError(f"Registro de capítulo incompleto: {line[:80]}")
    fr, es, desc, point, raw_words, raw_sentences = (field.strip() for field in fields)
    point = point.rstrip(". ")
    words = [tuple(part.strip() for part in item.split("=", 1)) for item in raw_words.split(";")]
    sentences = [tuple(part.strip() for part in item.split("~", 1)) for item in raw_sentences.split("§")]
    if len(sentences) != 4 or any(len(pair) != 2 for pair in sentences):
        raise ValueError(f"El capítulo {fr} debe tener cuatro pares de frases")
    return {"fr": fr, "es": es, "desc": desc, "point": point, "words": words, "sentences": sentences}


def load_units() -> dict[str, list[dict]]:
    groups = {"A1": [], "A2": [], "B1": [], "B2": []}
    current = None
    for raw in RAW.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("[") and line.endswith("]"):
            current = line[1:-1]
            continue
        if current not in groups:
            raise ValueError(f"Nivel desconocido antes de: {line[:60]}")
        groups[current].append(parse_unit(line))
    expected = {"A1": 15, "A2": 14, "B1": 14, "B2": 13}
    for level, count in expected.items():
        if len(groups[level]) != count:
            raise ValueError(f"{level}: se esperaban {count} capítulos nuevos, hay {len(groups[level])}")
    return groups


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")


def renumber_existing() -> list[dict]:
    # La lista editorial conserva los 42 capítulos originales y hace la generación idempotente.
    source = ROOT / "_herramientas" / "cursos" / "fr" / "capitulos_base.txt"
    chapters = []
    for line in source.read_text(encoding="utf-8-sig").splitlines():
        if not line[:1].isdigit():
            continue
        fields = line.split(" | ", 3)
        if len(fields) == 4:
            chapters.append({"numero": int(fields[0]), "titulo_fr": fields[1], "titulo_es": fields[2], "descripcion": fields[3]})
    if len(chapters) != 42:
        raise ValueError(f"La fuente editorial debe contener 42 capítulos; contiene {len(chapters)}")
    for chapter in chapters:
        old = int(chapter["numero"])
        if 11 <= old <= 20:
            chapter["numero"] = old + 15
        elif 21 <= old <= 30:
            chapter["numero"] = old + 29
        elif 31 <= old <= 42:
            chapter["numero"] = old + 43

    for path in sorted(LESSONS.glob("[0-9][0-9][0-9].json")):
        lesson_id = int(path.stem)
        if lesson_id > 132:
            continue
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        if lesson_id <= 34:
            # A1 ya conserva sus capítulos originales.
            data["numero_curso"] = lesson_id
        elif lesson_id == 35:
            data["capitulo"] = 25
            data["numero_curso"] = 80
        elif lesson_id <= 65:
            data["capitulo"] = 26 + min((lesson_id - 36) // 3, 9)
            data["numero_curso"] = lesson_id + 45
        elif lesson_id == 66:
            data["capitulo"] = 49
            data["numero_curso"] = 153
        elif lesson_id <= 96:
            data["capitulo"] = 50 + min((lesson_id - 67) // 3, 9)
            data["numero_curso"] = lesson_id + 87
        elif lesson_id == 97:
            data["capitulo"] = 73
            data["numero_curso"] = 226
        elif lesson_id <= 131:
            data["capitulo"] = 74 + min((lesson_id - 98) // 3, 11)
            data["numero_curso"] = lesson_id + 129
        else:
            data["capitulo"] = 98
            data["numero_curso"] = 300
        write_json(path, data)
    return chapters


def build_lesson(level: str, chapter: int, course_no: int, unit: dict, index: int, file_id: int) -> dict:
    focuses = [
        ("Repérer les informations", "Localizar datos explícitos", [0, 1]),
        ("Observer les formes", "Leer el vocabulario y las formas", [1, 2]),
        ("Lire l'ensemble", "Integrar la lectura", [0, 1, 2, 3]),
    ]
    fr_focus, es_focus, selected = focuses[index]
    fr_titles = ["Repérer les informations", "Observer les formes", "Lire l'ensemble"]
    es_titles = ["Encontrar datos", "Vocabulario y formas", "Lectura integrada"]
    title_fr = f"{unit['fr']} : {fr_titles[index]}"
    title_es = f"{unit['es']}: {es_titles[index]}"
    selected_sentences = [unit["sentences"][i] for i in selected]
    sentence_fr, sentence_es = selected_sentences[0]
    # Usa una palabra real del fragmento, evitando coincidencias dentro de otras palabras.
    contains = lambda text, word: re.search(rf"(?<!\w){re.escape(word)}(?!\w)", text, re.IGNORECASE) is not None
    target = next((w for w, _ in unit["words"] if any(contains(fr, w) for fr, _ in selected_sentences)), None)
    if target is None:
        target = next((w for w, _ in unit["words"] if any(contains(fr, w) for fr, _ in unit["sentences"])), None)
        if target is not None:
            gap_pair = next(pair for pair in unit["sentences"] if contains(pair[0], target))
            if gap_pair not in selected_sentences:
                selected_sentences.append(gap_pair)
    if target is None:
        target = sentence_fr.rstrip(".?!:; ").split()[-1].strip("«»\"'()")
        word_translation = "la palabra final de la frase"
        gap_sentence = sentence_fr.replace(target, "___", 1)
    else:
        gap_source = next(fr for fr, _ in selected_sentences if contains(fr, target))
        gap_sentence = re.sub(re.escape(target), "___", gap_source, count=1, flags=re.IGNORECASE)
        word_translation = dict(unit["words"])[target]
    wrong_words = [es for fr, es in unit["words"] if fr != target][:2]
    if len(wrong_words) < 2:
        wrong_words = ["otro dato del documento", "una palabra distinta"]

    # Distractores de lectura tomados de frases cercanas del mismo documento.
    translations = [es for _, es in selected_sentences if es != sentence_es]
    distractors = translations[:2]
    while len(distractors) < 2:
        distractors.append("El documento no aporta esa información.")
    options = []
    for n, text in enumerate([sentence_es, *distractors]):
        options.append({"texto": text, "explicacion": "La frase del documento dice esto." if n == 0 else "Este dato pertenece a otra frase o no aparece aquí.", "correcta": n == 0})
    vocab_options = [
        {"texto": word_translation, "explicacion": f"«{target}» significa «{word_translation}».", "correcta": True},
        {"texto": wrong_words[0], "explicacion": "No corresponde a esta palabra."},
        {"texto": wrong_words[1], "explicacion": "No corresponde a esta palabra."},
    ]
    gap_options = [
        {"texto": target, "explicacion": f"La frase del texto contiene «{target}».", "correcta": True},
        {"texto": next(w for w, _ in unit["words"] if w != target), "explicacion": "No encaja en la frase del documento."},
        {"texto": next(w for w, _ in unit["words"] if w != target and w != next(x for x, _ in unit["words"] if x != target)), "explicacion": "No encaja en la frase del documento."},
    ]
    if index % 2:
        options.reverse()
        vocab_options.reverse()
        gap_options.reverse()
        for group in (options, vocab_options, gap_options):
            # Mantiene una única respuesta correcta después de barajar.
            group.sort(key=lambda option: option.get("correcta", False))

    intro = f"{unit['desc']} Lee primero el francés; abre la traducción cuando quieras comprobar tu comprensión."
    strategies = {
        "A1": "Busca primero nombres, días, lugares y cifras: en avisos y fichas suelen ser datos fáciles de localizar.",
        "A2": "Relaciona el asunto con la petición y comprueba fechas, condiciones y acciones que el mensaje pide realizar.",
        "B1": "Separa el hecho de su contexto: los tiempos verbales, conectores y atribuciones indican cuándo y quién aporta cada dato.",
        "B2": "Distingue afirmaciones, pruebas y reservas; atribuye cada dato a su fuente antes de formular una conclusión.",
    }
    explanation = [
        f"{unit['desc']} {strategies[level]}",
        f"Punto de atención: {unit['point']}. En este fragmento, «{target}» significa «{word_translation}».",
    ]
    reading = {"tipo": "texto", "titulo": unit["fr"], "frases": [{"fr": fr, "es": es} for fr, es in selected_sentences]}
    exercise_id = f"fr{file_id:03d}"
    question = f"Según el texto «{unit['es']}», ¿qué dice esta frase?"
    blocks = [
        {"tipo": "explicacion", "titulo": es_focus, "texto": explanation},
        {"tipo": "vocabulario", "titulo": f"Palabras clave: {unit['es'].lower()}", "palabras": [fr for fr, _ in unit["words"]]},
        reading,
        {"tipo": "test", "pregunta": question, "frase": sentence_fr, "id": f"{exercise_id}-1", "opciones": options},
        {"tipo": "test", "pregunta": f"En el contexto, ¿qué significa «{target}»?", "frase": target, "id": f"{exercise_id}-2", "opciones": vocab_options},
        {"tipo": "huecos", "pregunta": "Completa la frase del documento.", "frase": gap_sentence, "id": f"{exercise_id}-3", "opciones": gap_options},
        {"tipo": "traduccion", "pregunta": "¿Qué significa esta frase del texto?", "frase": selected_sentences[1][0], "id": f"{exercise_id}-4", "opciones": [
            {"texto": selected_sentences[1][1], "explicacion": "La traducción conserva la información de la frase.", "correcta": True},
            {"texto": selected_sentences[0][1], "explicacion": "Esa es otra frase del fragmento."},
            {"texto": "El documento no aporta esa información.", "explicacion": "Esta opción no corresponde a la frase."},
        ]},
    ]
    return {
        "capitulo": chapter,
        "numero_curso": course_no,
        "titulo_fr": title_fr,
        "titulo_es": title_es,
        "intro": intro,
        "palabras": {fr: {"es": es} for fr, es in unit["words"]},
        "bloques": blocks,
    }


def add_new_units(chapters: list[dict], groups: dict[str, list[dict]]) -> None:
    ranges = {
        "A1": (11, 133, 35),
        "A2": (36, 178, 111),
        "B1": (60, 220, 184),
        "B2": (86, 262, 261),
    }
    for level, units in groups.items():
        first_chapter, file_id, course_no = ranges[level]
        chapter_no = first_chapter
        for unit in units:
            chapters.append({
                "numero": chapter_no,
                "titulo_fr": unit["fr"],
                "titulo_es": unit["es"],
                "descripcion": unit["desc"],
            })
            for index in range(3):
                write_json(LESSONS / f"{file_id:03d}.json", build_lesson(level, chapter_no, course_no, unit, index, file_id))
                file_id += 1
                course_no += 1
            chapter_no += 1


def extend_final_reviews(groups: dict[str, list[dict]]) -> None:
    exams = {"A1": 35, "A2": 66, "B1": 97, "B2": 132}
    first_chapters = {"A1": 11, "A2": 36, "B1": 60, "B2": 86}
    for level, units in groups.items():
        exam_id = exams[level]
        path = LESSONS / f"{exam_id:03d}.json"
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        prefix = f"fr{exam_id:03d}-ampliacion-"
        data["bloques"] = [b for b in data["bloques"] if not str(b.get("id", "")).startswith(prefix)]
        for offset, unit in enumerate(units):
            chapter = first_chapters[level] + offset
            phrase, correct = unit["sentences"][0]
            distractors = [es for _, es in unit["sentences"][1:4] if es != correct][:2]
            while len(distractors) < 2:
                distractors.append("El texto no aporta esa información.")
            options = [{"texto": correct, "explicacion": "Esta es la información de la frase francesa.", "correcta": True}]
            options.extend({"texto": text, "explicacion": "Ese significado pertenece a otra frase del capítulo."} for text in distractors)
            if offset % 2:
                options = options[1:] + options[:1]
            data["bloques"].append({
                "tipo": "test",
                "pregunta": f"Cap. {chapter}. Lectura de «{unit['es']}»: elige el significado correcto.",
                "frase": phrase,
                "id": f"fr{exam_id:03d}-ampliacion-{chapter}",
                "opciones": options,
            })
        write_json(path, data)


def correct_existing() -> None:
    def edit(lesson_id: int, callback) -> None:
        path = LESSONS / f"{lesson_id:03d}.json"
        data = json.loads(path.read_text(encoding="utf-8-sig"))
        callback(data)
        write_json(path, data)

    def replace_text(lesson_id: int, old: str, new: str) -> None:
        def change(data):
            for block in data["bloques"]:
                if block.get("tipo") == "explicacion":
                    block["texto"] = [s.replace(old, new) if isinstance(s, str) else s for s in block["texto"]]
        edit(lesson_id, change)

    replace_text(1, "Con desconocidos adultos se usa siempre **vous**.", "Con un adulto que no conoces, **vous** es una opción cortés y segura; las costumbres pueden variar según la relación y el contexto.")
    replace_text(3, "**Uno:** la consonante final casi nunca se pronuncia: Paris se dice «pa-rí», salut «sa-lü», vous «vu».", "**Uno:** muchas consonantes finales no se pronuncian, pero hay excepciones y conviene aprenderlas con cada palabra: en **Paris**, **salut** y **vous** la consonante final es muda.")
    replace_text(3, "**Tres:** las vocales nasales. Delante de n o m, la vocal se dice por la nariz y la n no suena: **bon**, **enchanté**, **bien**.", "**Tres:** algunas secuencias con **n** o **m** son nasales cuando la consonante no va seguida de otra vocal: **bon**, **enchanté**, **bien**. Compara **bon** / **bonne**: la segunda vocal es oral y la consonante se oye.")
    replace_text(8, "En la negación, **un, une, des** se convierten en **de**: **Je n'ai pas de sœur** (no tengo hermana).", "Con muchos verbos, **un, une, des** pasan a **de** en la negación: **Je n'ai pas de sœur**. Tras **être** se conserva normalmente el artículo: **Ce n'est pas une sœur, c'est une amie**.")
    replace_text(18, "En negativo, todos se convierten en **de**: **Je ne prends pas de café**.", "Con muchos verbos, el partitivo pasa a **de** en negativo: **Je ne prends pas de café**. Se conserva en algunos contrastes con **être** (**Ce n'est pas du café**) y el artículo definido de **aimer** sigue presente: **Je n'aime pas le café**.")

    def fix_044(data):
        for block in data["bloques"]:
            for option in block.get("opciones", []):
                if option.get("texto") == "Acheter une voiture.":
                    option["texto"] = "Prendre un comprimé deux fois par jour."
                    option["explicacion"] = "C'est une consigne plausible, mais elle ne figure pas dans cet avis."
    edit(44, fix_044)

    for lesson_id, level, count, threshold in ((35, "A1", "Veintinueve", "veinticuatro"), (66, "A2", "Treinta y una", "veintisiete")):
        def fix_exam(data, level=level):
            data["bloques"][0]["texto"] = [
                f"Prueba formativa de los contenidos trabajados en {level}. Incluye comprensión lectora de cada capítulo de ampliación; la puntuación orienta el repaso y no certifica por sí sola el nivel CECRL.",
                "Cada pregunta indica su capítulo para que puedas volver a la explicación correspondiente.",
            ]
            data["intro"] = f"Repaso formativo de los contenidos de {level}. Usa los resultados para elegir qué volver a estudiar."
        edit(lesson_id, fix_exam)

    def fix_b1(data):
        data["bloques"][0]["texto"] = [
            "Prueba formativa de gramática, vocabulario y comprensión lectora de este curso B1, con una lectura de cada capítulo de ampliación. La puntuación orienta el repaso y no certifica el nivel CECRL.",
            "Cada pregunta indica el capítulo o el texto relacionado.",
        ]
        data["intro"] = "Repaso formativo de los contenidos de B1; no sustituye una evaluación completa del nivel."
    edit(97, fix_b1)

    def fix_b2(data):
        data["bloques"][0]["texto"] = [
            "Prueba formativa de gramática, vocabulario y comprensión lectora de este curso B2, con una lectura de cada capítulo de ampliación. La puntuación orienta el repaso y no certifica el nivel CECRL.",
            "Cada pregunta indica el capítulo o el texto relacionado.",
        ]
        data["intro"] = "Repaso formativo de los contenidos de B2, incluidos los textos de ampliación; no sustituye una evaluación completa del nivel."
    edit(132, fix_b2)

    def fix_a2_reading(data):
        for block in data["bloques"]:
            if block.get("tipo") == "texto":
                block["titulo"] = "Aviso de la mediateca"
                block["frases"] = [
                    {"fr": "À la médiathèque : atelier de lecture samedi à 10 h, salle 2.", "es": "En la mediateca: taller de lectura el sábado a las 10, sala 2."},
                    {"fr": "Inscription gratuite avant vendredi à l'accueil.", "es": "Inscripción gratuita antes del viernes en recepción."},
                    {"fr": "Le groupe est limité à douze personnes.", "es": "El grupo está limitado a doce personas."},
                ]
        for block in data["bloques"]:
            if block.get("id") == "fr066-30":
                block["id"] = "fr066-lectura-mediateca-1"
                block["pregunta"] = "Cap. 35. ¿A qué hora empieza el taller de lectura?"
                block["opciones"] = [
                    {"texto": "À 10 h.", "explicacion": "El aviso fija el taller a las diez.", "correcta": True},
                    {"texto": "À 9 h 25.", "explicacion": "Esa hora pertenecía a un horario de tren anterior."},
                    {"texto": "À 14 h.", "explicacion": "El aviso no indica esa hora."},
                ]
            elif block.get("id") == "fr066-31":
                block["id"] = "fr066-lectura-mediateca-2"
                block["pregunta"] = "Cap. 35. ¿En qué sala tiene lugar el taller?"
                block["opciones"] = [
                    {"texto": "Dans la salle 2.", "explicacion": "El aviso indica «salle 2».", "correcta": True},
                    {"texto": "Dans la salle 1.", "explicacion": "El aviso indica otra sala."},
                    {"texto": "À l'accueil.", "explicacion": "Allí se realiza la inscripción, no el taller."},
                ]
    edit(66, fix_a2_reading)

    # Los exámenes se sitúan al final de cada tramo y sus referencias siguen los capítulos nuevos.
    for lesson_id, minimum, maximum, offset in ((66, 11, 20, 15), (97, 21, 30, 29), (132, 31, 42, 43)):
        def remap_exam_chapters(data, minimum=minimum, maximum=maximum, offset=offset):
            for block in data["bloques"]:
                question = block.get("pregunta")
                if not isinstance(question, str):
                    continue
                def replace(match):
                    number = int(match.group(2))
                    if minimum <= number <= maximum:
                        return f"{match.group(1)}{number + offset}{match.group(3)}"
                    return match.group(0)
                block["pregunta"] = re.sub(r"(Cap\.\s*)(\d+)(\.)", replace, question)
        edit(lesson_id, remap_exam_chapters)


def main() -> None:
    groups = load_units()
    chapters = renumber_existing()
    correct_existing()
    add_new_units(chapters, groups)
    extend_final_reviews(groups)
    chapters.sort(key=lambda c: int(c["numero"]))
    write_json(LESSONS / "capitulos.json", chapters)
    catalog = ["# número | título en francés | título en español | descripción"]
    catalog.extend(
        f"{c['numero']} | {c['titulo_fr']} | {c['titulo_es']} | {c.get('descripcion', '')}"
        for c in chapters
    )
    (ROOT / "_herramientas" / "cursos" / "fr" / "capitulos.txt").write_text("\n".join(catalog) + "\n", encoding="utf-8", newline="\n")
    print("Generadas 300 lecciones, 98 capítulos; 56 capítulos de ampliación.")


if __name__ == "__main__":
    main()
