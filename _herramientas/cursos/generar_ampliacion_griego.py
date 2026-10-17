# -*- coding: utf-8 -*-
"""Prepara fuentes de ampliación del griego A1–B2 desde el plan de auditoría.

Las fuentes siguen el formato corto de compilar.py y viven separadas de las
fuentes existentes. Al compilar cada carpeta se conservan las lecciones previas.
"""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / '_herramientas' / 'cursos' / 'INFORME_AUDITORIA_GRIEGO_A1-B2.md'
LESSONS = ROOT / 'Idiomas' / 'cursos' / 'el' / 'lessons'
OUT = ROOT / '_herramientas' / 'cursos' / 'ampliacion_griego'

STARTS = {'A1': 125, 'A2': 161, 'B1': 203, 'B2': 249}
LEVELS = {'A1': (1, 36), 'A2': (11, 42), 'B1': (21, 46), 'B2': (31, 52)}

# Lección de muestra propia para cada bloque temático del plan: frase, traducción,
# palabra clave y su sentido. Los géneros de lectura y las tareas cambian con el nivel.
CORE = {
 'A1': {
  'Sonidos y escritura': ('Το «αι» ακούγεται σαν «ε» στη λέξη καιρός.', 'La combinación «αι» suena como «e» en la palabra καιρός.', 'καιρός', 'tiempo'),
  'Pedir ayuda y confirmar': ('Μπορείτε να επαναλάβετε το επώνυμό σας, παρακαλώ;', '¿Puede repetir su apellido, por favor?', 'επώνυμο', 'apellido'),
  'Presentaciones y datos': ('Η Άννα είναι από τη Θεσσαλονίκη και δουλεύει σε ξενοδοχείο.', 'Anna es de Salónica y trabaja en un hotel.', 'Θεσσαλονίκη', 'Salónica'),
  'Consolidar gramática básica': ('Το μικρό σπίτι έχει δύο δωμάτια και φωτεινά παράθυρα.', 'La casa pequeña tiene dos habitaciones y ventanas luminosas.', 'δωμάτια', 'habitaciones'),
  'Calendario y horarios': ('Το ραντεβού είναι την Πέμπτη, στις έξι και μισή.', 'La cita es el jueves a las seis y media.', 'ραντεβού', 'cita'),
  'Casa y ubicación': ('Η καρέκλα βρίσκεται δίπλα στο γραφείο.', 'La silla está junto al escritorio.', 'καρέκλα', 'silla'),
  'Compras prácticas': ('Αυτή η μπλούζα είναι μεγάλη· έχετε μικρότερο μέγεθος;', 'Esta blusa es grande; ¿tiene una talla más pequeña?', 'μέγεθος', 'talla'),
  'Salud básica': ('Με πονάει ο λαιμός από χθες και χρειάζομαι ένα ραντεβού.', 'Me duele la garganta desde ayer y necesito una cita.', 'λαιμός', 'garganta'),
  'Transporte': ('Το λεωφορείο για το κέντρο φεύγει στις οκτώ από την πλατεία.', 'El autobús al centro sale a las ocho desde la plaza.', 'λεωφορείο', 'autobús'),
  'Mensajes sociales': ('Θέλεις να πάμε για καφέ το Σάββατο στις επτά;', '¿Quieres que vayamos a tomar un café el sábado a las siete?', 'καφέ', 'café'),
  'Lectura y escucha breve': ('Η ανακοίνωση λέει ότι η βιβλιοθήκη κλείνει στις πέντε σήμερα.', 'El aviso dice que la biblioteca cierra hoy a las cinco.', 'ανακοίνωση', 'aviso'),
  'Cierre A1': ('Σήμερα παρουσιάζω τον εαυτό μου και ζητώ πληροφορίες για την πόλη.', 'Hoy me presento y pido información sobre la ciudad.', 'πόλη', 'ciudad'),
 },
 'A2': {
  'Pasado y secuencia': ('Πρώτα χάσαμε το λεωφορείο, αλλά τελικά φτάσαμε στην ώρα μας.', 'Primero perdimos el autobús, pero al final llegamos a tiempo.', 'τελικά', 'al final'),
  'Planes y cambios': ('Ας συναντηθούμε την Παρασκευή στις έξι· θα επιβεβαιώσω το μέρος με μήνυμα.', 'Quedemos el viernes a las seis; confirmaré el lugar por mensaje.', 'μήνυμα', 'mensaje'),
  'Vivienda y mantenimiento': ('Κάτω από τον νεροχύτη υπάρχει διαρροή και χρειάζεται επισκευή.', 'Hay una fuga debajo del fregadero y hace falta repararla.', 'διαρροή', 'fuga'),
  'Consulta y farmacia': ('Ο γιατρός συνέστησε το σιρόπι μετά το φαγητό για τρεις ημέρες.', 'El médico recomendó el jarabe después de comer durante tres días.', 'σιρόπι', 'jarabe'),
  'Compras y reclamaciones simples': ('Το προϊόν είναι ακριβότερο, αλλά έχει μεγαλύτερη διάρκεια εγγύησης.', 'El producto es más caro, pero tiene un periodo de garantía más largo.', 'εγγύησης', 'garantía'),
  'Viajes y reservas': ('Η κράτηση ισχύει για δύο νύχτες και περιλαμβάνει πρωινό.', 'La reserva es válida para dos noches e incluye desayuno.', 'κράτηση', 'reserva'),
  'Trabajo y estudios': ('Η βάρδια αρχίζει στις οκτώ και αλλάζει κάθε δεύτερη εβδομάδα.', 'El turno empieza a las ocho y cambia cada dos semanas.', 'βάρδια', 'turno'),
  'Gestiones y formularios': ('Συμπληρώστε τα στοιχεία επικοινωνίας και υπογράψτε στο τέλος.', 'Rellene los datos de contacto y firme al final.', 'επικοινωνίας', 'contacto'),
  'Textos cotidianos': ('Η ανακοίνωση αναφέρει την ώρα, τον τόπο και την προθεσμία εγγραφής.', 'El aviso indica la hora, el lugar y el plazo de inscripción.', 'προθεσμία', 'plazo'),
  'Escucha cotidiana': ('Το δρομολόγιο αλλάζει σήμερα λόγω της κακοκαιρίας.', 'El recorrido cambia hoy debido al mal tiempo.', 'δρομολόγιο', 'recorrido'),
  'Relaciones sociales': ('Δεν μπορώ την Κυριακή, αλλά μπορώ να έρθω τη Δευτέρα.', 'No puedo el domingo, pero sí puedo ir el lunes.', 'Κυριακή', 'domingo'),
  'Escritura breve': ('Σας γράφω για να επιβεβαιώσω την κράτηση για το Σάββατο.', 'Le escribo para confirmar la reserva para el sábado.', 'επιβεβαιώσω', 'confirmar'),
  'Cierre A2': ('Χθες περιέγραψα το πρόβλημα και συμφωνήσαμε το επόμενο βήμα.', 'Ayer describí el problema y acordamos el siguiente paso.', 'βήμα', 'paso'),
 },
 'B1': {
  'Convenciones sociales y turnos': ('Θα ήθελα να σας ρωτήσω κάτι, αν έχετε λίγο χρόνο.', 'Quisiera preguntarle algo, si tiene un momento.', 'ρωτήσω', 'preguntar'),
  'Servicios y problemas inesperados': ('Παρακαλώ εξηγήστε μου ποιες επιλογές έχω και μέχρι πότε.', 'Por favor, explíqueme qué opciones tengo y hasta cuándo.', 'επιλογές', 'opciones'),
  'Información pública': ('Η αναχώρηση καθυστερεί είκοσι λεπτά· οι επιβάτες να περιμένουν στην αίθουσα.', 'La salida se retrasa veinte minutos; los pasajeros deben esperar en la sala.', 'αναχώρηση', 'salida'),
  'Conversaciones de varias personas': ('Ο πρώτος ομιλητής συμφωνεί με το μέτρο, ενώ η δεύτερη επισημαίνει το κόστος.', 'El primer hablante está de acuerdo con la medida, mientras que la segunda señala el coste.', 'ομιλητής', 'hablante'),
  'Noticias y actualidad': ('Το δημοτικό συμβούλιο ανακοίνωσε την αλλαγή μετά τη χθεσινή συνεδρίαση.', 'El ayuntamiento anunció el cambio tras la sesión de ayer.', 'συνεδρίαση', 'sesión'),
  'Vida laboral': ('Στην προηγούμενη θέση μου συντόνιζα βάρδιες και εκπαίδευα νέους συναδέλφους.', 'En mi puesto anterior coordinaba turnos y formaba a nuevos compañeros.', 'συναδέλφους', 'compañeros'),
  'Formación': ('Αν παραδώσω την εργασία μέχρι την Παρασκευή, θα μπορέσω να συμμετάσχω στις εξετάσεις.', 'Si entrego el trabajo antes del viernes, podré presentarme a los exámenes.', 'εξετάσεις', 'exámenes'),
  'Narración y pasado': ('Ενώ περιμέναμε στην αποβάθρα, ανακοινώθηκε ότι το τρένο είχε αλλάξει γραμμή.', 'Mientras esperábamos en el andén, anunciaron que el tren había cambiado de vía.', 'αποβάθρα', 'andén'),
  'Consejos y decisiones': ('Αν οργανώσουμε το πρόγραμμα νωρίτερα, θα αποφύγουμε τη σύγχυση και τις καθυστερήσεις.', 'Si organizamos el programa antes, evitaremos la confusión y los retrasos.', 'καθυστερήσεις', 'retrasos'),
  'Consumo y reclamaciones': ('Παρέλαβα το προϊόν στις 12 Ιουνίου, όμως το εξάρτημα δεν λειτουργεί.', 'Recibí el producto el 12 de junio, pero la pieza no funciona.', 'εξάρτημα', 'pieza'),
  'Ciudad y entorno': ('Οι κάτοικοι ζητούν περισσότερα δέντρα επειδή το καλοκαίρι η περιοχή ζεσταίνεται πολύ.', 'Los vecinos piden más árboles porque en verano la zona se calienta mucho.', 'κάτοικοι', 'vecinos'),
  'Cultura y ocio': ('Η ταινία παρουσιάζει μια οικογένεια που μετακομίζει από το νησί στην Αθήνα.', 'La película presenta a una familia que se muda de la isla a Atenas.', 'μετακομίζει', 'se muda'),
  'Lectura funcional': ('Το ηλεκτρονικό μήνυμα εξηγεί την αλλαγή, αναφέρει την προθεσμία και ζητά απάντηση.', 'El correo electrónico explica el cambio, indica el plazo y pide una respuesta.', 'προθεσμία', 'plazo'),
  'Mediación y reformulación': ('Με λίγα λόγια, πρέπει να φτάσεις νωρίτερα και να έχεις μαζί σου την ταυτότητα.', 'En pocas palabras, tienes que llegar antes y llevar contigo el documento de identidad.', 'ταυτότητα', 'documento de identidad'),
  'Cierre B1': ('Αρχικά διαπιστώσαμε το πρόβλημα, εξετάσαμε δύο λύσεις και συμφωνήσαμε στο επόμενο βήμα.', 'Primero identificamos el problema, examinamos dos soluciones y acordamos el siguiente paso.', 'διαπιστώσαμε', 'identificamos'),
 },
 'B2': {
  'Escucha extensa': ('Η ομιλήτρια υποστηρίζει ότι η πρόταση μειώνει το κόστος, υπό την προϋπόθεση ότι υπάρχουν αρκετά δεδομένα.', 'La ponente sostiene que la propuesta reduce el coste, siempre que haya datos suficientes.', 'προϋπόθεση', 'condición'),
  'Debate y varias voces': ('Παρότι η πρώτη λύση είναι ταχύτερη, η δεύτερη φαίνεται βιωσιμότερη μακροπρόθεσμα.', 'Aunque la primera solución es más rápida, la segunda parece más sostenible a largo plazo.', 'βιωσιμότερη', 'más sostenible'),
  'Lectura de prensa y fuentes': ('Το άρθρο αναγνωρίζει τη σημασία του μέτρου, αλλά αμφισβητεί αν τα στοιχεία αρκούν για γενίκευση.', 'El artículo reconoce la importancia de la medida, pero cuestiona si los datos bastan para generalizar.', 'γενίκευση', 'generalización'),
  'Datos y evidencia': ('Το δείγμα περιλαμβάνει τετρακόσιους κατοίκους· τα αποτελέσματα αποτυπώνουν τάση, όχι βεβαιότητα.', 'La muestra incluye a cuatrocientos residentes; los resultados reflejan una tendencia, no una certeza.', 'δείγμα', 'muestra'),
  'Argumentación avanzada': ('Η θέση μου στηρίζεται σε δύο στοιχεία, χωρίς να αγνοώ το κόστος εφαρμογής.', 'Mi postura se apoya en dos datos, sin ignorar el coste de aplicación.', 'στηρίζεται', 'se apoya'),
  'Registro y expresiones': ('Παρακαλώ, θα μπορούσατε να μου αποστείλετε την αναθεωρημένη πρόταση έως την Παρασκευή;', '¿Podría enviarme la propuesta revisada antes del viernes, por favor?', 'αποστείλετε', 'enviar'),
  'Temas técnicos y abstractos': ('Το σύστημα κρυπτογραφεί τα δεδομένα πριν από τη μετάδοση, ώστε να περιορίσει την πρόσβαση τρίτων.', 'El sistema cifra los datos antes de transmitirlos para limitar el acceso de terceros.', 'κρυπτογραφεί', 'cifra'),
  'Políticas y sociedad': ('Η επιδότηση μπορεί να μειώσει τις εκπομπές, εφόσον συνοδευτεί από αξιολόγηση και σαφές χρονοδιάγραμμα.', 'La subvención puede reducir las emisiones, siempre que vaya acompañada de una evaluación y un calendario claro.', 'επιδότηση', 'subvención'),
  'Informes y propuestas': ('Η παρούσα έκθεση συνοψίζει τα ευρήματα, τις μεθόδους και τους βασικούς περιορισμούς της έρευνας.', 'Este informe resume los hallazgos, los métodos y las principales limitaciones de la investigación.', 'ευρήματα', 'hallazgos'),
  'Correspondencia profesional': ('Σε συνέχεια της επικοινωνίας μας, θα θέλαμε να επιβεβαιώσουμε τους όρους της συνεργασίας.', 'En seguimiento de nuestra comunicación, quisiéramos confirmar las condiciones de la colaboración.', 'συνεργασίας', 'colaboración'),
  'Presentaciones orales': ('Αρχικά θα παρουσιάσω τα δεδομένα και στη συνέχεια θα εξηγήσω πώς επηρεάζουν την πρόταση.', 'Primero presentaré los datos y después explicaré cómo afectan a la propuesta.', 'επηρεάζουν', 'afectan'),
  'Cultura y textos creativos': ('Η αφηγήτρια περιγράφει την επιστροφή της στον τόπο όπου μεγάλωσε, χωρίς να εξιδανικεύει το παρελθόν.', 'La narradora describe su regreso al lugar donde creció, sin idealizar el pasado.', 'αφηγήτρια', 'narradora'),
  'Mediación entre fuentes': ('Οι δύο πηγές συμφωνούν ως προς τον στόχο, αλλά διαφωνούν για το χρονοδιάγραμμα και το κόστος.', 'Las dos fuentes coinciden en el objetivo, pero discrepan sobre el calendario y el coste.', 'χρονοδιάγραμμα', 'calendario'),
  'Comprensión de documentos': ('Ο κανονισμός προβλέπει εξαίρεση όταν η αίτηση υποβάλλεται πριν από την προθεσμία.', 'El reglamento prevé una excepción cuando la solicitud se presenta antes del plazo.', 'εξαίρεση', 'excepción'),
  'Corrección y precisión': ('Η πρόταση αφορά την πλειονότητα των συμμετεχόντων, όχι κατ’ ανάγκη κάθε περίπτωση.', 'La propuesta se refiere a la mayoría de los participantes, no necesariamente a todos los casos.', 'πλειονότητα', 'mayoría'),
  'Cierre B2': ('Συνολικά, τα διαθέσιμα στοιχεία στηρίζουν σταδιακή εφαρμογή και επανεξέταση των αποτελεσμάτων.', 'En conjunto, los datos disponibles respaldan una aplicación gradual y una revisión de los resultados.', 'σταδιακή', 'gradual'),
 },
 '__B1_VARIANTS__': {
  'Convenciones sociales y turnos': [
   ('Συγγνώμη, θα μπορούσατε να με βοηθήσετε με την αίτηση;', 'Disculpe, ¿podría ayudarme con la solicitud?', 'αίτηση', 'solicitud'),
   ('Συγγνώμη που σας διακόπτω· θα ήθελα να προσθέσω κάτι.', 'Perdone que le interrumpa; quisiera añadir algo.', 'διακόπτω', 'interrumpo'),
   ('Θα σας τηλεφωνήσω αύριο, κύριε Παπαδόπουλε.', 'Le llamaré mañana, señor Papadópulos.', 'τηλεφωνήσω', 'llamaré'),
  ],
  'Servicios y problemas inesperados': [
   ('Η αίτησή μου απορρίφθηκε· θα ήθελα να μάθω τον λόγο.', 'Han rechazado mi solicitud; quisiera saber el motivo.', 'απορρίφθηκε', 'fue rechazada'),
   ('Χρειάζεστε αντίγραφο ταυτότητας και αποδεικτικό διεύθυνσης μέχρι τις 30 Ιουνίου.', 'Necesita una copia del documento de identidad y un justificante de domicilio antes del 30 de junio.', 'αποδεικτικό', 'justificante'),
   ('Μπορώ να φέρω το έγγραφο αύριο, αν μου δώσετε νέα προθεσμία.', 'Puedo traer el documento mañana si me concede un nuevo plazo.', 'προθεσμία', 'plazo'),
  ],
  'Información pública': [
   ('Το τρένο για την Πάτρα αναχωρεί τώρα από την αποβάθρα τέσσερα.', 'El tren a Patras sale ahora del andén cuatro.', 'αποβάθρα', 'andén'),
   ('Λόγω δυνατής βροχής, η κίνηση στο κέντρο είναι πιο αργή από το συνηθισμένο.', 'Debido a la lluvia intensa, el tráfico en el centro es más lento de lo habitual.', 'κίνηση', 'tráfico'),
   ('Καλησπέρα, τηλεφωνώ για το ραντεβού· καλέστε με πριν από τις έξι.', 'Buenas tardes, llamo por la cita; llámeme antes de las seis.', 'ραντεβού', 'cita'),
  ],
  'Conversaciones de varias personas': [
   ('Η Άννα υποστηρίζει το έργο, ενώ ο Μάριος ανησυχεί για το κόστος.', 'Anna apoya el proyecto, mientras que Marios se preocupa por el coste.', 'ανησυχεί', 'se preocupa'),
   ('Συμφωνώ με την αλλαγή, επειδή θα μειώσει τον χρόνο αναμονής.', 'Estoy de acuerdo con el cambio porque reducirá el tiempo de espera.', 'αναμονής', 'espera'),
   ('Αν κατάλαβα σωστά, προτείνεις να αλλάξει η ώρα της συνάντησης.', 'Si lo he entendido bien, propones cambiar la hora de la reunión.', 'συνάντησης', 'reunión'),
  ],
  'Noticias y actualidad': [
   ('Το δημοτικό συμβούλιο άνοιξε χθες έναν νέο χώρο για τους κατοίκους.', 'Ayer el ayuntamiento abrió un espacio nuevo para los vecinos.', 'χώρο', 'espacio'),
   ('Η βιβλιοθήκη θα παραμείνει κλειστή τη Δευτέρα, σύμφωνα με την ανακοίνωση.', 'La biblioteca permanecerá cerrada el lunes, según el aviso.', 'ανακοίνωση', 'aviso'),
   ('Η πόλη άνοιξε νέο πάρκο στο κέντρο, όπου θα φυτευτούν εκατό δέντρα.', 'La ciudad abrió un parque nuevo en el centro, donde se plantarán cien árboles.', 'φυτευτούν', 'se plantarán'),
  ],
  'Vida laboral': [
   ('Στην προηγούμενη θέση μου συντόνιζα βάρδιες και εκπαίδευα νέους συναδέλφους.', 'En mi puesto anterior coordinaba turnos y formaba a nuevos compañeros.', 'συντόνιζα', 'coordinaba'),
   ('Θα ήθελα να μάθω ποιες είναι οι αρμοδιότητες και το ωράριο της θέσης.', 'Quisiera saber cuáles son las responsabilidades y el horario del puesto.', 'αρμοδιότητες', 'responsabilidades'),
   ('Όταν διαφωνώ με έναν συνάδελφο, προσπαθώ να εξηγήσω ήρεμα την άποψή μου.', 'Cuando discrepo con un compañero, intento explicar mi opinión con calma.', 'συνάδελφο', 'compañero'),
  ],
  'Formación': [
   ('Το σεμινάριο αρχίζει στις 5 Μαΐου και οι εγγραφές τελειώνουν την Παρασκευή.', 'El curso empieza el 5 de mayo y la inscripción termina el viernes.', 'εγγραφές', 'inscripción'),
   ('Δυσκολεύομαι να τελειώσω την εργασία· θα μπορούσα να ζητήσω παράταση;', 'Me cuesta terminar el trabajo; ¿podría pedir una prórroga?', 'παράταση', 'prórroga'),
   ('Το δεύτερο πρόγραμμα είναι πιο πρακτικό, ενώ το πρώτο κοστίζει λιγότερο.', 'El segundo programa es más práctico, mientras que el primero cuesta menos.', 'πρόγραμμα', 'programa'),
  ],
  'Narración y pasado': [
   ('Ενώ περίμενα στην αποβάθρα, ανακοινώθηκε ότι το τρένο είχε αλλάξει γραμμή.', 'Mientras esperaba en el andén, anunciaron que el tren había cambiado de vía.', 'περίμενα', 'esperaba'),
   ('Πρώτα έχασα το πορτοφόλι μου, αλλά ένας υπάλληλος το βρήκε και μου το επέστρεψε.', 'Primero perdí la cartera, pero un empleado la encontró y me la devolvió.', 'επέστρεψε', 'devolvió'),
   ('Η υπεύθυνη είπε ότι η συνάντηση θα άρχιζε νωρίτερα και ζήτησε να φτάσουμε στην ώρα μας.', 'La responsable dijo que la reunión empezaría antes y pidió que llegáramos puntuales.', 'ζήτησε', 'pidió'),
  ],
  'Consejos y decisiones': [
   ('Δεν ξέρω αν πρέπει να αλλάξω σπίτι· τι θα μου προτείνατε;', 'No sé si debería cambiar de casa; ¿qué me recomendaría?', 'προτείνατε', 'recomendaría'),
   ('Αν οργανώσουμε το πρόγραμμα νωρίτερα, θα αποφύγουμε καθυστερήσεις.', 'Si organizamos el programa con antelación, evitaremos retrasos.', 'καθυστερήσεις', 'retrasos'),
   ('Θα διάλεγα το τρένο, εφόσον η τιμή του εισιτηρίου δεν είναι πολύ υψηλή.', 'Elegiría el tren, siempre que el precio del billete no sea demasiado alto.', 'εισιτηρίου', 'billete'),
  ],
  'Consumo y reclamaciones': [
   ('Παρέλαβα το προϊόν στις 12 Ιουνίου, όμως το εξάρτημα δεν λειτουργεί.', 'Recibí el producto el 12 de junio, pero la pieza no funciona.', 'εξάρτημα', 'pieza'),
   ('Λυπούμαστε για την καθυστέρηση· θα σας επιστρέψουμε τα έξοδα αποστολής.', 'Lamentamos el retraso; le devolveremos los gastos de envío.', 'επιστρέψουμε', 'devolveremos'),
   ('Παρακαλώ αντικαταστήστε το ελαττωματικό προϊόν ή επιστρέψτε μου τα χρήματα.', 'Por favor, sustituyan el producto defectuoso o devuélvanme el dinero.', 'ελαττωματικό', 'defectuoso'),
  ],
  'Ciudad y entorno': [
   ('Οι κάτοικοι ζητούν περισσότερα δέντρα, επειδή η περιοχή ζεσταίνεται πολύ το καλοκαίρι.', 'Los vecinos piden más árboles porque la zona se calienta mucho en verano.', 'κάτοικοι', 'vecinos'),
   ('Το σχέδιο προβλέπει ποδηλατόδρομο, αλλά δεν εξηγεί πώς θα αλλάξει η κυκλοφορία.', 'El plan prevé un carril bici, pero no explica cómo cambiará el tráfico.', 'ποδηλατόδρομο', 'carril bici'),
   ('Προτείνουμε μια νέα στάση λεωφορείου· ίσως, όμως, χρειαστεί να μετακινηθεί το πάρκινγκ.', 'Proponemos una parada de autobús nueva; quizá haya que trasladar el aparcamiento.', 'μετακινηθεί', 'trasladarse'),
  ],
  'Cultura y ocio': [
   ('Η ταινία παρουσιάζει μια οικογένεια που μετακομίζει από το νησί στην Αθήνα.', 'La película presenta a una familia que se muda de la isla a Atenas.', 'ταινία', 'película'),
   ('Η κριτική επαινεί τις ερμηνείες, αλλά θεωρεί το τέλος υπερβολικά απότομο.', 'La reseña elogia las interpretaciones, pero considera que el final es demasiado abrupto.', 'ερμηνείες', 'interpretaciones'),
   ('Αν αγαπάς την ιστορία, θα σου πρότεινα την έκθεση για τα παλιά λιμάνια.', 'Si te interesa la historia, te recomendaría la exposición sobre los puertos antiguos.', 'έκθεση', 'exposición'),
  ],
  'Lectura funcional': [
   ('Το γυμναστήριο λειτουργεί από τις επτά έως τις δέκα, εκτός από τις Κυριακές.', 'El gimnasio abre de siete a diez, excepto los domingos.', 'Κυριακές', 'domingos'),
   ('Σύμφωνα με το άρθρο, το σχολείο άνοιξε νέα βιβλιοθήκη τον Σεπτέμβριο.', 'Según el artículo, la escuela abrió una biblioteca nueva en septiembre.', 'Σεπτέμβριο', 'septiembre'),
   ('Σας γράφω σχετικά με την αλλαγή του ωραρίου και θα ήθελα να μάθω αν σας εξυπηρετεί.', 'Le escribo sobre el cambio de horario y quisiera saber si le viene bien.', 'ωραρίου', 'horario'),
  ],
  'Mediación y reformulación': [
   ('Με λίγα λόγια, πρέπει να φτάσεις νωρίτερα και να έχεις μαζί σου την ταυτότητα.', 'En pocas palabras, tienes que llegar antes y llevar contigo el documento de identidad.', 'ταυτότητα', 'documento de identidad'),
   ('Τα δύο μηνύματα συμφωνούν στην ώρα, αλλά διαφέρουν ως προς την είσοδο.', 'Los dos mensajes coinciden en la hora, pero difieren en cuanto a la entrada.', 'διαφέρουν', 'difieren'),
   ('Είναι μια προσωρινή διακοπή της υπηρεσίας, δηλαδή δεν θα λειτουργεί για λίγες ώρες.', 'Es una interrupción temporal del servicio; es decir, no funcionará durante unas horas.', 'προσωρινή', 'temporal'),
  ],
  'Cierre B1': [
   ('Πριν κλείσουμε το ραντεβού, θα ήθελα να επιβεβαιώσω τη διεύθυνση και την ώρα.', 'Antes de cerrar la cita, quisiera confirmar la dirección y la hora.', 'διεύθυνση', 'dirección'),
   ('Χάρηκα που σε γνώρισα· θα τα πούμε σύντομα και θα κανονίσουμε την επόμενη συνάντηση.', 'Me alegró conocerte; hablaremos pronto y organizaremos la siguiente reunión.', 'κανονίσουμε', 'organizaremos'),
   ('Η επιστολή εξηγεί το πρόβλημα, αναφέρει την ημερομηνία και ζητά συγκεκριμένη λύση.', 'La carta explica el problema, indica la fecha y pide una solución concreta.', 'συγκεκριμένη', 'concreta'),
   ('Αρχικά διαπιστώσαμε το πρόβλημα, εξετάσαμε δύο λύσεις και συμφωνήσαμε στο επόμενο βήμα.', 'Primero identificamos el problema, examinamos dos soluciones y acordamos el siguiente paso.', 'συμφωνήσαμε', 'acordamos'),
  ],
 },
 '__B2_VARIANTS__': {
  'Escucha extensa': [
   ('Η ομιλήτρια παρουσιάζει πρώτα τη θέση της και έπειτα δίνει δύο παραδείγματα.', 'La ponente presenta primero su tesis y después ofrece dos ejemplos.', 'παραδείγματα', 'ejemplos'),
   ('Παρότι αναγνωρίζει τα οφέλη, ο ομιλητής επισημαίνει το κόστος εφαρμογής.', 'Aunque reconoce los beneficios, el ponente señala el coste de aplicación.', 'εφαρμογής', 'aplicación'),
   ('Στην ομιλία ακούγονται τρία βασικά σημεία: πρόσβαση, αξιολόγηση και χρηματοδότηση.', 'En la charla se presentan tres puntos centrales: acceso, evaluación y financiación.', 'χρηματοδότηση', 'financiación'),
  ],
  'Debate y varias voces': [
   ('Η πρώτη ομιλήτρια υποστηρίζει την πρόταση, ενώ ο δεύτερος ομιλητής ζητά περισσότερα στοιχεία.', 'La primera ponente apoya la propuesta, mientras que el segundo pide más datos.', 'πρόταση', 'propuesta'),
   ('Η έμφαση στη λέξη «μόνο» δείχνει ότι η διαφωνία αφορά το εύρος του μέτρου.', 'El énfasis en la palabra «solo» indica que el desacuerdo se refiere al alcance de la medida.', 'έμφαση', 'énfasis'),
   ('Θα ήθελα να προσθέσω ένα σημείο και μετά να ακούσω την αντίθετη άποψη.', 'Quisiera añadir un punto y después escuchar la postura contraria.', 'αντίθετη', 'contraria'),
  ],
  'Lectura de prensa y fuentes': [
   ('Το άρθρο υποστηρίζει ότι η αλλαγή είναι αναγκαία, αλλά δεν εξηγεί ποια δεδομένα τη στηρίζουν.', 'El artículo sostiene que el cambio es necesario, pero no explica qué datos lo respaldan.', 'δεδομένα', 'datos'),
   ('Οι δύο εφημερίδες περιγράφουν το ίδιο γεγονός, αλλά επιλέγουν διαφορετικές λεπτομέρειες.', 'Los dos periódicos describen el mismo hecho, pero seleccionan detalles diferentes.', 'γεγονός', 'hecho'),
   ('Η φράση «ιστορική ευκαιρία» είναι αξιολογική και επιδιώκει να επηρεάσει τον αναγνώστη.', 'La expresión «oportunidad histórica» es valorativa y busca influir en el lector.', 'αναγνώστη', 'lector'),
  ],
  'Datos y evidencia': [
   ('Ο πίνακας δείχνει αύξηση δώδεκα τοις εκατό, όχι όμως την αιτία της.', 'La tabla muestra un aumento del doce por ciento, pero no su causa.', 'αιτία', 'causa'),
   ('Το δείγμα είναι μικρό και δεν περιλαμβάνει κατοίκους από αγροτικές περιοχές.', 'La muestra es pequeña y no incluye a residentes de zonas rurales.', 'αγροτικές', 'rurales'),
   ('Συνδυάζοντας τις δύο πηγές, βλέπουμε κοινή τάση αλλά διαφορετική περίοδο μέτρησης.', 'Al combinar las dos fuentes, vemos una tendencia común, pero periodos de medición distintos.', 'μέτρησης', 'medición'),
  ],
  'Argumentación avanzada': [
   ('Η θέση μου είναι ότι η πρόσβαση πρέπει να βελτιωθεί, όπως δείχνουν τα στοιχεία της έρευνας.', 'Mi tesis es que debe mejorarse el acceso, como muestran los datos del estudio.', 'στοιχεία', 'datos'),
   ('Αναγνωρίζω ότι η αλλαγή έχει κόστος, ωστόσο το σημερινό σύστημα αποκλείει πολλούς χρήστες.', 'Reconozco que el cambio tiene un coste; sin embargo, el sistema actual excluye a muchos usuarios.', 'αποκλείει', 'excluye'),
   ('Το επιχείρημα δεν απαντά στην ένσταση για τον χρόνο· χρειάζεται να εξετάσουμε και αυτή την παράμετρο.', 'El argumento no responde a la objeción sobre el plazo; también hay que examinar ese factor.', 'ένσταση', 'objeción'),
  ],
  'Registro y expresiones': [
   ('«Στείλτε μου το σχέδιο σήμερα» γίνεται «Θα σας ήμουν ευγνώμων αν μου αποστέλλατε το σχέδιο σήμερα».', '«Envíeme el plan hoy» pasa a «Le agradecería que me enviara el plan hoy».', 'ευγνώμων', 'agradecido'),
   ('Η έκφραση «κρατώ μικρό καλάθι» δηλώνει επιφύλαξη, όχι κυριολεκτική ενέργεια.', 'La expresión «mantengo baja la cesta» indica cautela, no una acción literal.', 'επιφύλαξη', 'cautela'),
   ('Η απάντηση «πολύ πρωτότυπη ιδέα» μπορεί να είναι ειρωνική, ανάλογα με τον τόνο.', 'La respuesta «idea muy original» puede ser irónica, según el tono.', 'ειρωνική', 'irónica'),
  ],
  'Temas técnicos y abstractos': [
   ('Η εφαρμογή κρυπτογραφεί τα αρχεία πριν από τη μετάδοση και αποθηκεύει το κλειδί χωριστά.', 'La aplicación cifra los archivos antes de transmitirlos y guarda la clave por separado.', 'κρυπτογραφεί', 'cifra'),
   ('Με απλά λόγια, η ενεργειακή απόδοση δείχνει πόση ενέργεια χρειάζεται για το ίδιο αποτέλεσμα.', 'En términos sencillos, la eficiencia energética indica cuánta energía hace falta para lograr el mismo resultado.', 'απόδοση', 'eficiencia'),
   ('Το ερώτημα είναι αν η ευκολία δικαιολογεί τη συλλογή προσωπικών δεδομένων χωρίς σαφή συναίνεση.', 'La cuestión es si la comodidad justifica recoger datos personales sin un consentimiento claro.', 'συναίνεση', 'consentimiento'),
  ],
  'Políticas y sociedad': [
   ('Η επιδότηση μειώνει το αρχικό κόστος, αλλά απαιτεί σταθερή χρηματοδότηση για πολλά χρόνια.', 'La subvención reduce el coste inicial, pero exige financiación estable durante muchos años.', 'χρηματοδότηση', 'financiación'),
   ('Η πρώτη λύση έχει χαμηλό κόστος, ενώ η δεύτερη προσφέρει ευρύτερη πρόσβαση.', 'La primera solución tiene un coste bajo, mientras que la segunda ofrece un acceso más amplio.', 'πρόσβαση', 'acceso'),
   ('Προτείνουμε πιλοτική εφαρμογή και αξιολόγηση των αποτελεσμάτων μετά από έξι μήνες.', 'Proponemos una aplicación piloto y evaluar los resultados al cabo de seis meses.', 'πιλοτική', 'piloto'),
  ],
  'Informes y propuestas': [
   ('Η έκθεση παρουσιάζει τον σκοπό, τη μέθοδο, τα ευρήματα και τους περιορισμούς της έρευνας.', 'El informe presenta el objetivo, el método, los hallazgos y las limitaciones del estudio.', 'περιορισμούς', 'limitaciones'),
   ('Η πρόταση βασίζεται σε στοιχεία κόστους και προβλέπει δύο στάδια εφαρμογής.', 'La propuesta se basa en datos de costes y prevé dos fases de aplicación.', 'στάδια', 'fases'),
   ('Αντικαθιστώντας τις επαναλήψεις με σαφείς αναφορές, το κείμενο γίνεται πιο συνεκτικό.', 'Al sustituir las repeticiones por referencias claras, el texto gana cohesión.', 'συνεκτικό', 'cohesionado'),
  ],
  'Correspondencia profesional': [
   ('Θα εκτιμούσαμε αν μας αποστέλλατε το αναθεωρημένο χρονοδιάγραμμα έως τις 15 Μαΐου.', 'Le agradeceríamos que nos enviara el calendario revisado antes del 15 de mayo.', 'χρονοδιάγραμμα', 'calendario'),
   ('Λυπούμαστε για τη διαφωνία σχετικά με την παράδοση και προτείνουμε νέα ημερομηνία.', 'Lamentamos el desacuerdo sobre la entrega y proponemos una nueva fecha.', 'παράδοση', 'entrega'),
   ('Η επιστολή προς τη διευθύντρια χρειάζεται πιο επίσημο τόνο από το μήνυμα προς την ομάδα.', 'La carta dirigida a la directora requiere un tono más formal que el mensaje al equipo.', 'διευθύντρια', 'directora'),
  ],
  'Presentaciones orales': [
   ('Η παρουσίαση αρχίζει με το ερώτημα, εξετάζει τα δεδομένα και κλείνει με μια πρόταση.', 'La presentación empieza con la pregunta, examina los datos y termina con una propuesta.', 'παρουσίαση', 'presentación'),
   ('Το γράφημα δείχνει πτώση στις αιτήσεις, αλλά όχι τους λόγους για τους οποίους μειώθηκαν.', 'El gráfico muestra un descenso de las solicitudes, pero no por qué disminuyeron.', 'γράφημα', 'gráfico'),
   ('Δεν έχουμε ακόμη στοιχεία για το κόστος· θα το υπολογίσουμε στο επόμενο στάδιο.', 'Todavía no tenemos datos sobre el coste; lo calcularemos en la siguiente fase.', 'στάδιο', 'fase'),
  ],
  'Cultura y textos creativos': [
   ('Η αφηγήτρια επιστρέφει στο χωριό της και παρατηρεί πόσο έχει αλλάξει ο τόπος.', 'La narradora vuelve a su pueblo y observa cuánto ha cambiado el lugar.', 'αφηγήτρια', 'narradora'),
   ('Η μεταφορά του «κλειστού παραθύρου» υπογραμμίζει την απομόνωση του πρωταγωνιστή.', 'La metáfora de la «ventana cerrada» subraya el aislamiento del protagonista.', 'μεταφορά', 'metáfora'),
   ('Η πρώτη ερμηνεία δίνει έμφαση στη μνήμη, ενώ η δεύτερη στη σχέση με την κοινότητα.', 'La primera interpretación destaca la memoria y la segunda, la relación con la comunidad.', 'ερμηνεία', 'interpretación'),
  ],
  'Mediación entre fuentes': [
   ('Οι δύο πηγές υποστηρίζουν τον ίδιο στόχο, αλλά διαφέρουν ως προς τα μέσα.', 'Las dos fuentes apoyan el mismo objetivo, pero difieren en los medios.', 'πηγές', 'fuentes'),
   ('Η δήμαρχος υποστηρίζει ότι το έργο θα μειώσει την κίνηση· αυτό αποτελεί ισχυρισμό, όχι δεδομένο.', 'La alcaldesa sostiene que el proyecto reducirá el tráfico; es una afirmación, no un dato.', 'ισχυρισμό', 'afirmación'),
   ('Για τους κατοίκους αρκεί να μεταφέρουμε την προθεσμία και τις δύο διαθέσιμες επιλογές.', 'Para los vecinos basta con comunicar el plazo y las dos opciones disponibles.', 'προθεσμία', 'plazo'),
  ],
  'Comprensión de documentos': [
   ('Ο κανονισμός επιτρέπει εξαίρεση μόνο όταν η αίτηση κατατεθεί πριν από την προθεσμία.', 'El reglamento permite una excepción solo si la solicitud se presenta antes del plazo.', 'εξαίρεση', 'excepción'),
   ('Η επιστολή ζητά την επιστροφή του ποσού και απαιτεί απάντηση μέσα σε δέκα ημέρες.', 'La carta pide el reembolso del importe y exige una respuesta en diez días.', 'επιστροφή', 'reembolso'),
   ('Το συμπέρασμα της έκθεσης συμφωνεί με τα στοιχεία, αλλά η αιτιολόγηση χρειάζεται έλεγχο.', 'La conclusión del informe concuerda con los datos, pero la justificación debe revisarse.', 'αιτιολόγηση', 'justificación'),
  ],
  'Corrección y precisión': [
   ('Η πρόσβαση στην υπηρεσία βελτιώθηκε μετά την αλλαγή του ωραρίου.', 'El acceso al servicio mejoró después del cambio de horario.', 'πρόσβαση', 'acceso'),
   ('Η ομάδα συνέκρινε τις δύο λύσεις και κατέγραψε τα πλεονεκτήματά τους.', 'El equipo comparó las dos soluciones y anotó sus ventajas.', 'πλεονεκτήματα', 'ventajas'),
   ('Επομένως, η δεύτερη επιλογή είναι προτιμότερη· δεν προσθέτει νέο κόστος.', 'Por lo tanto, la segunda opción es preferible; no añade un coste nuevo.', 'Επομένως', 'por lo tanto'),
  ],
  'Cierre B2': [
   ('Το άρθρο υπερασπίζεται σταδιακή αλλαγή, αναγνωρίζοντας το κόστος και τις αβεβαιότητες.', 'El artículo defiende un cambio gradual y reconoce sus costes e incertidumbres.', 'αβεβαιότητες', 'incertidumbres'),
   ('Στη συζήτηση συμφωνήσαμε στον στόχο, αλλά αφήσαμε ανοιχτό το χρονοδιάγραμμα.', 'En el debate acordamos el objetivo, pero dejamos abierto el calendario.', 'χρονοδιάγραμμα', 'calendario'),
   ('Η απάντηση συνδυάζει την ιδέα του άρθρου με ένα στοιχείο από την ομιλία.', 'La respuesta combina la idea del artículo con un dato de la charla.', 'συνδυάζει', 'combina'),
   ('Στο πλαίσιο της πρότασης, η λέξη «μέτρο» αναφέρεται σε συγκεκριμένη πολιτική αλλαγή.', 'En el contexto de la propuesta, la palabra «medida» se refiere a un cambio concreto de política.', 'μέτρο', 'medida'),
   ('Παρότι η πρώτη διατύπωση είναι οικεία, η δεύτερη ταιριάζει καλύτερα σε επίσημη επιστολή.', 'Aunque la primera formulación es coloquial, la segunda encaja mejor en una carta formal.', 'διατύπωση', 'formulación'),
   ('Ξαναδιαβάζοντας το κείμενο, εντόπισα επανάληψη και άλλαξα τον σύνδεσμο.', 'Al releer el texto, detecté una repetición y cambié el conector.', 'σύνδεσμο', 'conector'),
   ('Συνολικά, τα στοιχεία στηρίζουν σταδιακή εφαρμογή και τακτική επανεξέταση.', 'En conjunto, los datos respaldan una aplicación gradual y una revisión periódica.', 'επανεξέταση', 'revisión'),
  ],
 },
}

B1_VARIANT_DATA = CORE.pop('__B1_VARIANTS__')
B2_VARIANT_DATA = CORE.pop('__B2_VARIANTS__')

VARIANT_CORE = {
 'A1': {
  'Sonidos y escritura': [
   ('Το γράμμα «η» ακούγεται σαν «ι».', 'La letra «η» suena como «ι».', 'γράμμα', 'letra'),
   ('Στη λέξη «ευχαριστώ», τα γράμματα «ευ» ακούγονται «ef».', 'En la palabra «ευχαριστώ», las letras «ευ» suenan «ef».', 'λέξη', 'palabra'),
   ('Στην ερώτηση «Πού μένεις;», η φωνή ανεβαίνει στο τέλος.', 'En la pregunta «¿Dónde vives?», la voz sube al final.', 'ερώτηση', 'pregunta'),
  ],
  'Pedir ayuda y confirmar': [
   ('Μπορείτε να επαναλάβετε το επώνυμό σας, παρακαλώ;', '¿Puede repetir su apellido, por favor?', 'επώνυμο', 'apellido'),
   ('Πώς γράφεται το όνομά σας; Με άλφα, νι και άλφα.', '¿Cómo se escribe su nombre? Con alfa, ni y alfa.', 'όνομά', 'nombre'),
   ('Το τηλέφωνό μου είναι 69 1234 5678. Είναι σωστό;', 'Mi teléfono es 69 1234 5678. ¿Es correcto?', 'τηλέφωνό', 'teléfono'),
  ],
  'Presentaciones y datos': [
   ('Ο Νίκος είναι από την Πάτρα και δουλεύει σε ξενοδοχείο.', 'Nikos es de Patras y trabaja en un hotel.', 'Πάτρα', 'Patras'),
   ('Αυτή είναι η Μαρία, η νέα μου συνάδελφος. Είναι από τη Λάρισα.', 'Esta es María, mi nueva compañera. Es de Larisa.', 'συνάδελφος', 'compañera'),
   ('Με λένε Άννα, είμαι από την Αθήνα και μιλάω ελληνικά και ισπανικά.', 'Me llamo Anna, soy de Atenas y hablo griego y español.', 'ισπανικά', 'español'),
  ],
  'Consolidar gramática básica': [
   ('Ο φίλος μου μένει σε ένα μικρό σπίτι.', 'Mi amigo vive en una casa pequeña.', 'φίλος', 'amigo'),
   ('Τα παιδιά έχουν δύο κόκκινα ποδήλατα.', 'Los niños tienen dos bicicletas rojas.', 'ποδήλατα', 'bicicletas'),
   ('Δεν δουλεύω σήμερα. Πού είναι το λεωφορείο;', 'Hoy no trabajo. ¿Dónde está el autobús?', 'σήμερα', 'hoy'),
  ],
  'Calendario y horarios': [
   ('Το ραντεβού είναι την Πέμπτη, στις έξι και μισή.', 'La cita es el jueves a las seis y media.', 'Πέμπτη', 'jueves'),
   ('Το μουσείο ανοίγει στις εννέα και κλείνει στις πέντε.', 'El museo abre a las nueve y cierra a las cinco.', 'μουσείο', 'museo'),
   ('Μπορούμε να αλλάξουμε το ραντεβού για την Παρασκευή;', '¿Podemos cambiar la cita al viernes?', 'Παρασκευή', 'viernes'),
  ],
  'Casa y ubicación': [
   ('Στο δωμάτιο υπάρχει ένα κρεβάτι και μια ντουλάπα.', 'En la habitación hay una cama y un armario.', 'ντουλάπα', 'armario'),
   ('Τα κλειδιά είναι πάνω στο τραπέζι, δίπλα στην πόρτα.', 'Las llaves están sobre la mesa, junto a la puerta.', 'κλειδιά', 'llaves'),
   ('Το δωμάτιο νοικιάζεται από τον Ιούνιο και έχει μπαλκόνι.', 'La habitación se alquila desde junio y tiene balcón.', 'μπαλκόνι', 'balcón'),
  ],
  'Compras prácticas': [
   ('Πόσο κάνει μισό κιλό μήλα;', '¿Cuánto cuesta medio kilo de manzanas?', 'μήλα', 'manzanas'),
   ('Έχετε αυτό το πουκάμισο σε μεγαλύτερο μέγεθος;', '¿Tiene esta camisa en una talla más grande?', 'πουκάμισο', 'camisa'),
   ('Το φερμουάρ δεν λειτουργεί. Μπορώ να αλλάξω το προϊόν;', 'La cremallera no funciona. ¿Puedo cambiar el producto?', 'φερμουάρ', 'cremallera'),
  ],
  'Salud básica': [
   ('Με πονάει ο λαιμός από χθες το βράδυ.', 'Me duele la garganta desde anoche.', 'λαιμός', 'garganta'),
   ('Πάρτε αυτό το σιρόπι μετά το φαγητό.', 'Tome este jarabe después de comer.', 'σιρόπι', 'jarabe'),
   ('Θα ήθελα να κλείσω ένα ραντεβού με τον γιατρό.', 'Quisiera pedir una cita con el médico.', 'γιατρό', 'médico'),
  ],
  'Transporte': [
   ('Το τρένο φεύγει στις δέκα από την τρίτη αποβάθρα.', 'El tren sale a las diez del andén tres.', 'αποβάθρα', 'andén'),
   ('Η αναχώρηση για την Αθήνα καθυστερεί δέκα λεπτά.', 'La salida hacia Atenas se retrasa diez minutos.', 'καθυστερεί', 'se retrasa'),
   ('Περνάς τη γέφυρα και το φαρμακείο είναι στα δεξιά.', 'Cruzas el puente y la farmacia está a la derecha.', 'γέφυρα', 'puente'),
  ],
  'Mensajes sociales': [
   ('Θέλεις να έρθεις για καφέ το Σάββατο στις επτά;', '¿Quieres venir a tomar un café el sábado a las siete?', 'Σάββατο', 'sábado'),
   ('Ευχαριστώ για την πρόσκληση. Θα έρθω με χαρά.', 'Gracias por la invitación. Iré encantada.', 'πρόσκληση', 'invitación'),
   ('Δεν μπορώ απόψε· μπορούμε να συναντηθούμε αύριο;', 'No puedo esta noche; ¿podemos vernos mañana?', 'αύριο', 'mañana'),
  ],
  'Lectura y escucha breve': [
   ('Η βιβλιοθήκη είναι ανοιχτή από τις εννέα έως τις πέντε.', 'La biblioteca está abierta de nueve a cinco.', 'βιβλιοθήκη', 'biblioteca'),
   ('Έχω μάθημα στις έξι και μετά θα πάρω το λεωφορείο.', 'Tengo clase a las seis y después cogeré el autobús.', 'μάθημα', 'clase'),
   ('Περνάς τη γέφυρα και το φαρμακείο είναι στα δεξιά.', 'Cruzas el puente y la farmacia está a la derecha.', 'φαρμακείο', 'farmacia'),
  ],
  'Cierre A1': [
   ('Με λένε Άννα. Είμαι από τη Θεσσαλονίκη και μαθαίνω ελληνικά.', 'Me llamo Anna. Soy de Salónica y aprendo griego.', 'μαθαίνω', 'aprendo'),
   ('Αγαπητή Μαρία, είμαι καλά. Σήμερα έχει ήλιο και περπατώ στο κέντρο.', 'Querida María: estoy bien. Hoy hace sol y paseo por el centro.', 'ήλιο', 'sol'),
   ('Συνήθως ξυπνώ στις επτά, δουλεύω το πρωί και μαγειρεύω το βράδυ.', 'Normalmente me despierto a las siete, trabajo por la mañana y cocino por la noche.', 'ξυπνώ', 'me despierto'),
  ],
 },
 'A2': {
  'Pasado y secuencia': [
   ('Το περασμένο Σάββατο επισκέφθηκα ένα μικρό μουσείο στο κέντρο.', 'El sábado pasado visité un museo pequeño en el centro.', 'μουσείο', 'museo'),
   ('Όταν ήμουν παιδί, πήγαινα κάθε καλοκαίρι στο χωριό της γιαγιάς μου.', 'Cuando era niño, iba cada verano al pueblo de mi abuela.', 'καλοκαίρι', 'verano'),
   ('Χάσαμε το λεωφορείο, τηλεφωνήσαμε στο ξενοδοχείο και φτάσαμε αργότερα.', 'Perdimos el autobús, llamamos al hotel y llegamos más tarde.', 'αργότερα', 'más tarde'),
  ],
  'Planes y cambios': [
   ('Το επόμενο Σαββατοκύριακο θα επισκεφτούμε τους φίλους μας στην Πάτρα.', 'El próximo fin de semana visitaremos a nuestros amigos en Patras.', 'Σαββατοκύριακο', 'fin de semana'),
   ('Ας συναντηθούμε την Παρασκευή στις έξι και ας επιβεβαιώσουμε το μέρος.', 'Quedemos el viernes a las seis y confirmemos el lugar.', 'επιβεβαιώσουμε', 'confirmemos'),
   ('Δεν θα προλάβω το λεωφορείο· μπορούμε να συναντηθούμε μισή ώρα αργότερα;', 'No llegaré a tiempo para el autobús; ¿podemos vernos media hora más tarde?', 'αργότερα', 'más tarde'),
  ],
  'Vivienda y mantenimiento': [
   ('Το πρώτο διαμέρισμα είναι φθηνότερο, αλλά έχει μικρή κουζίνα.', 'El primer piso es más barato, pero tiene una cocina pequeña.', 'κουζίνα', 'cocina'),
   ('Στην τιμή περιλαμβάνονται τα κοινόχρηστα, αλλά όχι το διαδίκτυο.', 'El precio incluye los gastos comunitarios, pero no internet.', 'περιλαμβάνονται', 'se incluyen'),
   ('Ο νεροχύτης έχει διαρροή και ο ιδιοκτήτης θα στείλει τεχνικό αύριο.', 'El fregadero tiene una fuga y el propietario enviará mañana a un técnico.', 'νεροχύτης', 'fregadero'),
  ],
  'Consulta y farmacia': [
   ('Έχω βήχα εδώ και τρεις ημέρες και κοιμάμαι άσχημα τη νύχτα.', 'Tengo tos desde hace tres días y duermo mal por la noche.', 'βήχα', 'tos'),
   ('Μπορείτε να μου εξηγήσετε πότε πρέπει να πάρω αυτό το φάρμακο;', '¿Puede explicarme cuándo debo tomar este medicamento?', 'φάρμακο', 'medicamento'),
   ('Πάρτε το χάπι μετά το φαγητό και πιείτε αρκετό νερό.', 'Tome la pastilla después de comer y beba suficiente agua.', 'χάπι', 'pastilla'),
  ],
  'Compras y reclamaciones simples': [
   ('Θα ήθελα ψωμί χωρίς γλουτένη και ένα κιλό ντομάτες.', 'Quisiera pan sin gluten y un kilo de tomates.', 'γλουτένη', 'gluten'),
   ('Το δεύτερο προϊόν κοστίζει λιγότερο, αλλά έχει μικρότερη εγγύηση.', 'El segundo producto cuesta menos, pero tiene una garantía más corta.', 'εγγύηση', 'garantía'),
   ('Θέλω να επιστρέψω το πουκάμισο, επειδή το μέγεθος δεν μου ταιριάζει.', 'Quiero devolver la camisa porque la talla no me queda bien.', 'επιστρέψω', 'devolver'),
  ],
  'Viajes y reservas': [
   ('Το τρένο διαρκεί δύο ώρες, ενώ το λεωφορείο κάνει σχεδόν τρεις.', 'El tren tarda dos horas, mientras que el autobús tarda casi tres.', 'διαρκεί', 'dura'),
   ('Θα ήθελα ένα δωμάτιο για δύο άτομα, με πρωινό και δωρεάν ακύρωση.', 'Quisiera una habitación para dos personas, con desayuno y cancelación gratuita.', 'ακύρωση', 'cancelación'),
   ('Η πτήση ακυρώθηκε· πότε μπορώ να πάρω το καινούριο εισιτήριο;', 'El vuelo se canceló; ¿cuándo puedo recoger el billete nuevo?', 'ακυρώθηκε', 'se canceló'),
  ],
  'Trabajo y estudios': [
   ('Το μάθημα αρχίζει στις εννέα και τελειώνει στις δύο κάθε Τρίτη.', 'La clase empieza a las nueve y termina a las dos todos los martes.', 'μάθημα', 'clase'),
   ('Σας αφήνω μήνυμα: το τηλέφωνό μου είναι 210 555 0180.', 'Le dejo un mensaje: mi teléfono es 210 555 0180.', 'μήνυμα', 'mensaje'),
   ('Μπορείτε να επαναλάβετε την οδηγία; Δεν κατάλαβα ποιο αρχείο χρειάζεστε.', '¿Puede repetir la instrucción? No entendí qué archivo necesita.', 'οδηγία', 'instrucción'),
  ],
  'Gestiones y formularios': [
   ('Στο έντυπο διαμονής γράψτε τη διεύθυνση και τις ημερομηνίες.', 'En el formulario de alojamiento, escriba la dirección y las fechas.', 'έντυπο', 'formulario'),
   ('Πόσο κοστίζει να στείλω αυτό το δέμα στην Κρήτη;', '¿Cuánto cuesta enviar este paquete a Creta?', 'δέμα', 'paquete'),
   ('Η απόδειξη δείχνει ότι η πληρωμή έγινε χθες το απόγευμα.', 'El recibo indica que el pago se hizo ayer por la tarde.', 'απόδειξη', 'recibo'),
  ],
  'Textos cotidianos': [
   ('Η εκδρομή αρχίζει στις δέκα, αλλά η εγγραφή τελειώνει την Πέμπτη.', 'La excursión empieza a las diez, pero la inscripción termina el jueves.', 'εγγραφή', 'inscripción'),
   ('Το εισιτήριο ισχύει μόνο για το δρομολόγιο των οκτώ και τέταρτο.', 'El billete solo es válido para el trayecto de las ocho y cuarto.', 'εισιτήριο', 'billete'),
   ('Η Μαρία γράφει ότι θα αργήσει, επειδή το λεωφορείο δεν ήρθε.', 'María escribe que llegará tarde porque el autobús no vino.', 'αργήσει', 'llegará tarde'),
  ],
  'Escucha cotidiana': [
   ('Άφησα μήνυμα στον τηλεφωνητή: θα φτάσω στις επτά, στην είσοδο του σταθμού.', 'Dejé un mensaje en el contestador: llegaré a las siete, a la entrada de la estación.', 'τηλεφωνητή', 'contestador'),
   ('Αύριο θα έχει συννεφιά το πρωί και δυνατή βροχή το απόγευμα.', 'Mañana estará nublado por la mañana y lloverá mucho por la tarde.', 'συννεφιά', 'cielo nublado'),
   ('Προσοχή: το λεωφορείο για το λιμάνι αναχωρεί από τη στάση απέναντι.', 'Atención: el autobús al puerto sale de la parada de enfrente.', 'λιμάνι', 'puerto'),
  ],
  'Relaciones sociales': [
   ('Θέλεις να έρθεις στο δείπνο την Παρασκευή ή σε βολεύει καλύτερα το Σάββατο;', '¿Quieres venir a cenar el viernes o te viene mejor el sábado?', 'δείπνο', 'cena'),
   ('Χρόνια πολλά για τα γενέθλιά σου! Εύχομαι να περάσεις υπέροχα.', '¡Feliz cumpleaños! Espero que lo pases muy bien.', 'γενέθλιά', 'cumpleaños'),
   ('Σε ευχαριστώ για την πρόσκληση, αλλά δεν μπορώ· πάμε την άλλη εβδομάδα;', 'Gracias por la invitación, pero no puedo; ¿vamos la semana que viene?', 'πρόσκληση', 'invitación'),
  ],
  'Escritura breve': [
   ('Σας γράφω για να κλείσω ένα δωμάτιο από τις 10 έως τις 13 Αυγούστου.', 'Le escribo para reservar una habitación del 10 al 13 de agosto.', 'κλείσω', 'reservar'),
   ('Σε ευχαριστώ για τη βοήθεια και για τον χρόνο που μου αφιέρωσες.', 'Te agradezco la ayuda y el tiempo que me dedicaste.', 'βοήθεια', 'ayuda'),
   ('Το Σαββατοκύριακο πήγαμε στη θάλασσα, φάγαμε με φίλους και ξεκουραστήκαμε.', 'El fin de semana fuimos al mar, comimos con amigos y descansamos.', 'ξεκουραστήκαμε', 'descansamos'),
  ],
  'Cierre A2': [
   ('Το σπίτι έχει δύο υπνοδωμάτια και μεγάλη βεράντα, αλλά είναι μακριά από το κέντρο.', 'La vivienda tiene dos dormitorios y una terraza grande, pero está lejos del centro.', 'βεράντα', 'terraza'),
   ('Πρώτα χάσαμε το λεωφορείο, μετά τηλεφωνήσαμε στο ξενοδοχείο και τελικά φτάσαμε.', 'Primero perdimos el autobús, después llamamos al hotel y al final llegamos.', 'τελικά', 'al final'),
   ('Θα ήθελα να μάθω αν το εισιτήριο αλλάζει και πόσο κοστίζει η νέα κράτηση.', 'Quisiera saber si se puede cambiar el billete y cuánto cuesta la nueva reserva.', 'εισιτήριο', 'billete'),
   ('Στην πινακίδα βλέπω την ώρα αναχώρησης· το μήνυμα λέει ότι η αποβάθρα άλλαξε.', 'En el cartel veo la hora de salida; el mensaje dice que cambió el andén.', 'αποβάθρα', 'andén'),
   ('Συγγνώμη, μπορείτε να εξηγήσετε ξανά τη διαδικασία; Θα ακολουθήσω τις οδηγίες.', 'Disculpe, ¿puede explicar de nuevo el proceso? Seguiré las instrucciones.', 'διαδικασία', 'proceso'),
   ('Χθες λύσαμε ένα πρόβλημα, επιβεβαιώσαμε τα στοιχεία και συμφωνήσαμε την επόμενη συνάντηση.', 'Ayer resolvimos un problema, confirmamos los datos y acordamos la siguiente cita.', 'συνάντηση', 'cita'),
  ],
 },
}

VARIANT_CORE['B1'] = B1_VARIANT_DATA
VARIANT_CORE['B2'] = B2_VARIANT_DATA

CHAPTERS = {
 'A1': [1,1,2,3,5,4,7,10,8,9,8,10],
 'A2': [17,16,12,19,15,18,20,20,20,18,16,20,20],
 'B1': [29,28,24,29,30,22,23,30,21,28,27,26,24,30,30],
 'B2': [32,31,32,31,31,35,33,34,35,35,31,37,40,35,40,40],
}

CHAPTER_VARIANTS = {
 ('A2', 'Compras y reclamaciones simples'): [14, 15, 15],
 ('B1', 'Información pública'): [25, 24, 25],
 ('B2', 'Políticas y sociedad'): [34, 36, 38],
 ('B2', 'Presentaciones orales'): [31, 35, 36],
 ('B2', 'Cultura y textos creativos'): [37, 39, 39],
 ('B2', 'Comprensión de documentos'): [35, 38, 39],
}

DIALOGUES = {
 'A1': [
  [('Νίκος', 'Συγγνώμη, δεν άκουσα καλά.', 'Perdón, no he oído bien.'), ('Άννα', 'Μπορείτε να το επαναλάβετε, παρακαλώ;', '¿Puede repetirlo, por favor?')],
  [('Άννα', 'Πώς γράφεται το επώνυμό σας;', '¿Cómo se escribe su apellido?'), ('Νίκος', 'Με ελληνικά γράμματα. Θα το γράψω αργά.', 'Con letras griegas. Lo escribiré despacio.')],
  [('Νίκος', 'Είναι σωστά τα στοιχεία μου;', '¿Están bien mis datos?'), ('Άννα', 'Ναι, το όνομα και το τηλέφωνο είναι σωστά.', 'Sí, el nombre y el teléfono están bien.')],
 ],
 'A2': [
  [('Μαρία', 'Διάβασα το μήνυμα, αλλά έχω μια απορία.', 'He leído el mensaje, pero tengo una duda.'), ('Πέτρος', 'Πείτε μου ποιο σημείο δεν είναι σαφές.', 'Dígame qué parte no está clara.')],
  [('Πέτρος', 'Μπορείτε να μου επαναλάβετε την ώρα;', '¿Puede repetirme la hora?'), ('Μαρία', 'Βεβαίως, αρχίζει στις έξι και μισή.', 'Claro, empieza a las seis y media.')],
  [('Μαρία', 'Τι πρέπει να κάνω μετά;', '¿Qué tengo que hacer después?'), ('Πέτρος', 'Συμπληρώστε τη φόρμα και υπογράψτε στο τέλος.', 'Rellene el formulario y firme al final.')],
 ],
 'B1': [
  [('Ελένη', 'Θα ήθελα να διευκρινίσω έναν όρο πριν αποφασίσω.', 'Quisiera aclarar una condición antes de decidir.'), ('Υπάλληλος', 'Βεβαίως, ας εξετάσουμε τις διαθέσιμες επιλογές.', 'Por supuesto, examinemos las opciones disponibles.')],
  [('Πέτρος', 'Αν κατάλαβα σωστά, η προθεσμία είναι την Παρασκευή.', 'Si lo he entendido bien, el plazo termina el viernes.'), ('Ελένη', 'Ακριβώς· έπειτα θα λάβετε γραπτή επιβεβαίωση.', 'Exactamente; después recibirá una confirmación por escrito.')],
  [('Ελένη', 'Δεν είμαι βέβαιη ότι κατάλαβα το βασικό σημείο.', 'No estoy segura de haber entendido el punto principal.'), ('Πέτρος', 'Μπορώ να το διατυπώσω με διαφορετικό τρόπο.', 'Puedo expresarlo de otra manera.')],
 ],
 'B2': [
  [('Συντονίστρια', 'Θα ήθελα να εξετάσουμε και τον περιορισμό αυτό.', 'Quisiera que examináramos también esta limitación.'), ('Αναλυτής', 'Ας διακρίνουμε τα δεδομένα από την ερμηνεία.', 'Distingamos los datos de su interpretación.')],
  [('Αναλύτρια', 'Δεν απορρίπτω το επιχείρημα, αλλά αμφισβητώ το εύρος του.', 'No rechazo el argumento, pero cuestiono su alcance.'), ('Συντονιστής', 'Είναι εύλογη επιφύλαξη, ιδίως με τόσο μικρό δείγμα.', 'Es una reserva razonable, especialmente con una muestra tan pequeña.')],
  [('Συντονίστρια', 'Αν σας κατάλαβα σωστά, προτείνετε σταδιακή εφαρμογή.', 'Si le he entendido bien, propone una aplicación gradual.'), ('Αναλυτής', 'Ναι, με σαφή κριτήρια και τακτική αξιολόγηση.', 'Sí, con criterios claros y una evaluación periódica.')],
 ],
}

READING_TAILS = {
 'A1': [
  ('Έλεγξε την ώρα και το μέρος πριν φύγεις.', 'Comprueba la hora y el lugar antes de salir.'),
  ('Αν δεν καταλάβεις, μπορείς να ρωτήσεις ξανά.', 'Si no entiendes, puedes volver a preguntar.'),
  ('Κράτησε τη σημείωση για αργότερα.', 'Guarda la nota para más tarde.'),
 ],
 'A2': [
  ('Πριν αποφασίσετε, ελέγξτε τις πληροφορίες και την προθεσμία.', 'Antes de decidir, compruebe la información y el plazo.'),
  ('Αν κάτι δεν είναι σαφές, ζητήστε περισσότερες λεπτομέρειες.', 'Si algo no está claro, pida más detalles.'),
  ('Έτσι θα ξέρετε ποιο βήμα ακολουθεί.', 'Así sabrá cuál es el siguiente paso.'),
 ],
 'B1': [
  ('Η πληροφορία βοηθά τον αναγνώστη να αποφασίσει ποιο βήμα θα ακολουθήσει.', 'La información ayuda al lector a decidir qué paso dar a continuación.'),
  ('Πριν επιλέξουν λύση, οι ενδιαφερόμενοι μπορούν να ζητήσουν διευκρινίσεις.', 'Antes de elegir una solución, las personas interesadas pueden pedir aclaraciones.'),
  ('Η τελική απόφαση εξαρτάται από τις συνθήκες και τις ανάγκες τους.', 'La decisión final depende de las circunstancias y de sus necesidades.'),
 ],
 'B2': [
  ('Η διατύπωση παρουσιάζει ένα βασικό εύρημα, χωρίς να καλύπτει όλες τις περιπτώσεις.', 'La formulación presenta un hallazgo central, sin abarcar todos los casos.'),
  ('Ωστόσο, η ερμηνεία πρέπει να λαμβάνει υπόψη τους περιορισμούς της πηγής.', 'Sin embargo, la interpretación debe tener en cuenta las limitaciones de la fuente.'),
  ('Συνεπώς, τα δεδομένα στηρίζουν μια επιλογή, αλλά δεν προκαθορίζουν κάθε αποτέλεσμα.', 'Por tanto, los datos respaldan una opción, pero no predeterminan todos los resultados.'),
 ],
}

OPEN_TASK = {
 'A1': ('Escribe una frase breve en griego sobre «{title}» e incluye «{key}».', 'Comprueba que la frase expresa una idea comprensible, usa la palabra indicada y mantiene un orden básico.'),
 'A2': ('Escribe un mensaje breve de dos frases en griego sobre «{title}» e incluye «{key}».', 'Comprueba que el mensaje incluye un dato concreto, mantiene el orden temporal o lógico y termina de forma adecuada.'),
 'B1': ('Escribe una respuesta breve en griego sobre «{title}»: presenta la situación y añade una razón o un siguiente paso. Incluye «{key}».', 'Comprueba que la respuesta tiene un propósito claro, detalles pertinentes, conectores y un registro adecuado.'),
 'B2': ('Redacta en griego una respuesta de tres frases sobre «{title}». Expón una idea, apóyala con un detalle y añade un matiz. Incluye «{key}».', 'Valora la claridad de la idea, la pertinencia del detalle y el matiz; revisa cohesión, precisión léxica y registro.'),
}

# Pautas didácticas ligadas a los grupos temáticos del plan. La instrucción de
# escucha también cambia por grupo para que no se repita una misma consigna vacía.
FOCUS = {
 'A1': {
  'Sonidos y escritura': ('Compara el sonido del ejemplo con una palabra conocida; fíjate en la vocal, la combinación de letras y la sílaba tónica.', 'Escucha el ejemplo y reconoce el sonido o la entonación que se practica.'),
  'Pedir ayuda y confirmar': ('Pide que repitan o deletreen con cortesía; confirma el dato antes de terminar el intercambio.', 'Escucha la petición y elige qué dato necesita confirmación.'),
  'Presentaciones y datos': ('Localiza nombre, procedencia y ocupación; reutiliza esos datos para presentar a otra persona.', 'Escucha la presentación y selecciona el dato personal que aparece.'),
  'Consolidar gramática básica': ('Observa artículo, género y número; comprueba que el adjetivo concuerda con el sustantivo.', 'Escucha la frase y reconoce la relación entre las palabras.'),
  'Calendario y horarios': ('Busca primero el día y la hora; después confirma la fecha o el horario completo.', 'Escucha el aviso y localiza el día, la hora o el horario.'),
  'Casa y ubicación': ('Usa hay para presentar un objeto y expresiones de lugar para explicar dónde está.', 'Escucha la descripción y localiza el objeto o el lugar.'),
  'Compras prácticas': ('Indica el producto y la característica que buscas; pregunta precio, talla o posibilidad de cambio.', 'Escucha la consulta y reconoce qué producto o característica se busca.'),
  'Salud básica': ('Nombra el síntoma, la parte del cuerpo y desde cuándo ocurre; pide que repitan una indicación si hace falta.', 'Escucha la consulta y localiza el síntoma o el momento indicado.'),
  'Transporte': ('Relaciona destino, hora y lugar de salida; comprueba si el aviso modifica alguno de esos datos.', 'Escucha el aviso y selecciona el destino, la hora o el cambio anunciado.'),
  'Mensajes sociales': ('Identifica la actividad, el día y la hora; responde a una invitación con claridad y cortesía.', 'Escucha la invitación y reconoce el plan propuesto.'),
  'Lectura y escucha breve': ('Busca quién, dónde y cuándo; distingue el dato principal de las instrucciones complementarias.', 'Escucha el mensaje y anota el dato práctico más importante.'),
  'Cierre A1': ('Combina presentación, datos personales y una petición sencilla en un intercambio breve.', 'Escucha la presentación y reconoce qué información personal comparte.'),
 },
 'A2': {
  'Pasado y secuencia': ('Ordena los hechos con primero, después y al final; separa el contexto habitual de lo que ocurrió una vez.', 'Escucha el relato y ordena los hechos según las expresiones temporales.'),
  'Planes y cambios': ('Confirma día, hora y lugar; si algo cambia, comunica el nuevo plan y comprueba que se entendió.', 'Escucha el mensaje y localiza qué dato del plan se confirma o cambia.'),
  'Vivienda y mantenimiento': ('Compara precio, gastos y ubicación; para una avería, describe dónde está y qué necesita reparación.', 'Escucha la llamada y reconoce la avería o la condición del alojamiento.'),
  'Consulta y farmacia': ('Describe duración y frecuencia de los síntomas; comprueba cómo y cuándo seguir una instrucción.', 'Escucha la explicación y selecciona la indicación o duración correcta.'),
  'Compras y reclamaciones simples': ('Compara precio, cantidad y garantía; al reclamar, explica el motivo y pide una solución concreta.', 'Escucha la reclamación y localiza el motivo o la solución solicitada.'),
  'Viajes y reservas': ('Comprueba fechas, duración y condiciones; distingue una reserva confirmada de una opción disponible.', 'Escucha el aviso y reconoce el cambio en el viaje o la reserva.'),
  'Trabajo y estudios': ('Extrae del horario las horas y tareas; cuando una instrucción no está clara, pide que la repitan.', 'Escucha el mensaje y anota el horario, la tarea o el dato de contacto.'),
  'Gestiones y formularios': ('Identifica qué datos pide el formulario y en qué orden; revisa también importe, plazo y justificante.', 'Escucha las instrucciones y reconoce el dato que hay que completar o comprobar.'),
  'Textos cotidianos': ('Localiza propósito, fecha, lugar y condiciones; usa el contexto para inferir una palabra conocida.', 'Escucha el aviso y selecciona la condición o el dato práctico.'),
  'Escucha cotidiana': ('Anota primero el dato concreto —hora, lugar o cambio— y después la razón que ofrece el mensaje.', 'Escucha el mensaje público y reconoce el cambio y su motivo.'),
  'Relaciones sociales': ('Acepta o rechaza una propuesta con cortesía y ofrece una alternativa concreta cuando sea posible.', 'Escucha el intercambio y reconoce qué día o actividad acuerdan.'),
  'Escritura breve': ('Adapta saludo y despedida al destinatario; deja claro el motivo y la información que necesitas confirmar.', 'Escucha la petición y localiza qué reserva o dato se quiere confirmar.'),
  'Cierre A2': ('Integra descripción, pasado y petición de información; verifica qué paso sigue antes de cerrar la gestión.', 'Escucha el intercambio y selecciona el problema y el paso acordado.'),
 },
 'B1': {
  'Convenciones sociales y turnos': ('Inicia el intercambio según la situación; usa una fórmula cortés para tomar la palabra, interrumpir o despedirte.', 'Escucha cómo se inicia o cierra la interacción y reconoce la estrategia social.'),
  'Servicios y problemas inesperados': ('Expón el problema con datos comprobables; pregunta por opciones, plazos y documentos antes de aceptar una solución.', 'Escucha la respuesta y localiza la condición, el plazo o la opción disponible.'),
  'Información pública': ('Separa el cambio anunciado de sus consecuencias prácticas; anota lugar, hora y alternativa.', 'Escucha el aviso y determina qué cambia y qué deben hacer los usuarios.'),
  'Conversaciones de varias personas': ('Asocia cada opinión con quien la expresa; distingue acuerdo, objeción y razón.', 'Escucha las intervenciones e identifica quién sostiene cada postura.'),
  'Noticias y actualidad': ('Resume primero el hecho verificable; separa después comentarios, valoraciones y consecuencias.', 'Escucha el boletín y reconoce el hecho principal o la valoración.'),
  'Vida laboral': ('Describe responsabilidades con verbos concretos; pregunta por tareas y condiciones con un tono respetuoso.', 'Escucha la entrevista y selecciona la responsabilidad o condición mencionada.'),
  'Formación': ('Comprueba fechas y requisitos; explica la dificultad y formula una petición realista con una razón.', 'Escucha la explicación del curso y localiza la fecha o el requisito.'),
  'Narración y pasado': ('Presenta el contexto con una acción en curso y ordena los hechos terminados hasta el desenlace.', 'Escucha el relato y distingue el contexto del hecho que cambió la situación.'),
  'Consejos y decisiones': ('Compara dos opciones por sus efectos; recomienda una con una razón y una condición explícita.', 'Escucha el consejo y reconoce la opción recomendada y su motivo.'),
  'Consumo y reclamaciones': ('Describe el defecto con fecha y evidencia; solicita una solución clara y adecuada al destinatario.', 'Escucha la reclamación y selecciona el defecto o la solución que se pide.'),
  'Ciudad y entorno': ('Expón causa y efecto del problema local; anticipa una objeción antes de presentar la mejora.', 'Escucha la propuesta vecinal y reconoce su condición o posible objeción.'),
  'Cultura y ocio': ('Resume el argumento sin contar cada detalle; apoya la valoración con un ejemplo pertinente.', 'Escucha la recomendación y localiza la valoración y su razón.'),
  'Lectura funcional': ('Identifica propósito, destinatario y condición; responde manteniendo el grado de formalidad del texto.', 'Escucha el mensaje y reconoce a quién va dirigido y qué acción solicita.'),
  'Mediación y reformulación': ('Conserva la información esencial al resumir; señala con claridad cualquier diferencia entre las fuentes.', 'Escucha la explicación y selecciona la información común o la discrepancia.'),
  'Cierre B1': ('Ordena situación, aclaración y solución; adapta la respuesta al registro y al propósito de la interacción.', 'Escucha la interacción y reconoce el problema, la aclaración y el acuerdo.'),
 },
 'B2': {
  'Escucha extensa': ('Localiza la tesis y sus pruebas; anota también concesiones y límites para no confundir afirmación con evidencia.', 'Escucha la exposición e identifica la tesis, un ejemplo o una reserva.'),
  'Debate y varias voces': ('Asocia cada argumento con su hablante; reconoce desacuerdo implícito, énfasis y cambios de turno.', 'Escucha el debate y distingue las posturas y el matiz del desacuerdo.'),
  'Lectura de prensa y fuentes': ('Compara propósito, selección de hechos y lenguaje valorativo; comprueba qué afirmaciones atribuye cada fuente.', 'Escucha la comparación y reconoce cómo difieren las fuentes.'),
  'Datos y evidencia': ('Describe tendencia y muestra por separado; evita atribuir causalidad cuando los datos solo muestran asociación.', 'Escucha la presentación y selecciona qué permiten concluir los datos.'),
  'Argumentación avanzada': ('Formula una tesis, ofrece evidencia y responde a una objeción sin borrar sus límites.', 'Escucha el argumento y reconoce la tesis, la evidencia o la concesión.'),
  'Registro y expresiones': ('Interpreta la frase en contexto; distingue significado literal, intención indirecta y grado de formalidad.', 'Escucha la frase y reconoce su intención o registro.'),
  'Temas técnicos y abstractos': ('Sigue la relación entre proceso y resultado; reformula el concepto con términos comprensibles para el público.', 'Escucha la explicación y reconoce el proceso o la condición técnica.'),
  'Políticas y sociedad': ('Compara beneficios, costes y grupos afectados; formula una condición para evaluar la medida.', 'Escucha la propuesta y localiza el beneficio, el coste o la condición.'),
  'Informes y propuestas': ('Distingue objetivo, método, hallazgo y limitación; comprueba que la recomendación se apoya en los resultados.', 'Escucha el resumen y reconoce un hallazgo o una limitación del informe.'),
  'Correspondencia profesional': ('Ajusta petición, tratamiento y cierre al destinatario; formula el objetivo sin ambigüedad.', 'Escucha la petición profesional y reconoce su objetivo y el plazo.'),
  'Presentaciones orales': ('Organiza la exposición en pregunta, evidencia y conclusión; responde sin repetir literalmente los datos.', 'Escucha la presentación y distingue la conclusión de los datos que la apoyan.'),
  'Cultura y textos creativos': ('Apoya la interpretación en indicios del texto; diferencia la perspectiva narrativa de la valoración propia.', 'Escucha la interpretación y reconoce la perspectiva o el recurso expresivo.'),
  'Mediación entre fuentes': ('Conserva los puntos comunes y atribuye las diferencias; separa cita, paráfrasis e inferencia.', 'Escucha la síntesis y localiza el acuerdo y la diferencia entre fuentes.'),
  'Comprensión de documentos': ('Busca obligación, excepción y plazo; no conviertas una condición limitada en una regla general.', 'Escucha la explicación y reconoce la obligación, la excepción o el plazo.'),
  'Corrección y precisión': ('Revisa concordancia, referencias y conectores; comprueba que cada enlace expresa la relación lógica prevista.', 'Escucha la revisión y reconoce qué relación lógica expresa el conector.'),
  'Cierre B2': ('Integra comprensión, argumentación y revisión; distingue lo que apoyan las fuentes de lo que aún queda incierto.', 'Escucha la síntesis y reconoce cómo se combinan la postura y la evidencia.'),
 },
}

DIALOGUE_FRAMES = {
 'A1': ('Μαρία', 'Ποια λέξη μαθαίνουμε σήμερα;', '¿Qué palabra aprendemos hoy?', 'Νίκος', 'Σήμερα μαθαίνουμε τη λέξη «{key}».', 'Hoy aprendemos la palabra «{key}».'),
 'A2': ('Μαρία', 'Ποια λέξη είναι χρήσιμη εδώ;', '¿Qué palabra es útil aquí?', 'Πέτρος', 'Εδώ είναι χρήσιμη η λέξη «{key}».', 'Aquí es útil la palabra «{key}».'),
 'B1': ('Ελένη', 'Ποιος όρος είναι σημαντικός για το θέμα;', '¿Qué término es importante para el tema?', 'Πέτρος', 'Ο όρος «{key}» είναι σημαντικός για το θέμα.', 'El término «{key}» es importante para el tema.'),
 'B2': ('Συντονίστρια', 'Ποιος όρος είναι καθοριστικός για την ερμηνεία;', '¿Qué término es decisivo para la interpretación?', 'Αναλυτής', 'Ο όρος «{key}» είναι καθοριστικός για την ερμηνεία.', 'El término «{key}» es decisivo para la interpretación.'),
}

# Sustituye en B2 los diez bloques de lectura que repetían el diálogo y crea
# lecturas originales en las otras lecciones heredadas. Los diálogos no cambian.
B2_OLD_READINGS = {
 'Teletrabajo: ventajas y límites': [
  ('Η εργασία από το σπίτι προσφέρει ευελιξία και μειώνει τον χρόνο μετακίνησης.', 'Trabajar desde casa ofrece flexibilidad y reduce el tiempo de desplazamiento.'),
  ('Χωρίς κοινά όρια, όμως, η απομόνωση μπορεί να δυσκολέψει τη συνεργασία.', 'Sin límites compartidos, sin embargo, el aislamiento puede dificultar la colaboración.'),
  ('Μια ισορροπημένη λύση χρειάζεται σαφή επικοινωνία και τακτικές συναντήσεις.', 'Una solución equilibrada requiere comunicación clara y reuniones periódicas.'),
 ],
 'Datos y conclusiones': [
  ('Η έρευνα περιλαμβάνει τετρακόσιους κατοίκους από τρεις περιοχές.', 'El estudio incluye a cuatrocientos residentes de tres zonas.'),
  ('Τα αποτελέσματα δείχνουν μια τάση, αλλά το δείγμα δεν εκπροσωπεί ολόκληρη τη χώρα.', 'Los resultados muestran una tendencia, pero la muestra no representa a todo el país.'),
  ('Οι συντάκτες προτείνουν νέα μέτρηση πριν εξαχθεί γενικό συμπέρασμα.', 'Los autores proponen realizar otra medición antes de extraer una conclusión general.'),
 ],
 'Objeción y respuesta': [
  ('Η πρόταση θα μπορούσε να μειώσει το κόστος, αν εφαρμοστεί σταδιακά.', 'La propuesta podría reducir costes si se aplica gradualmente.'),
  ('Οι επικριτές ανησυχούν για τη χρηματοδότηση και ζητούν λεπτομερή αξιολόγηση.', 'Quienes la critican se preocupan por la financiación y piden una evaluación detallada.'),
  ('Μια πιλοτική δοκιμή θα έδειχνε αν τα οφέλη δικαιολογούν την επένδυση.', 'Una prueba piloto mostraría si los beneficios justifican la inversión.'),
 ],
 '¿Noticia u opinión?': [
  ('Η είδηση αναφέρει ότι το δημοτικό συμβούλιο ενέκρινε νέο κανονισμό την Τρίτη.', 'La noticia indica que el ayuntamiento aprobó un reglamento nuevo el martes.'),
  ('Η φράση «σημαντική επιτυχία» αποτελεί αξιολόγηση, όχι επαληθεύσιμο γεγονός.', 'La frase «éxito importante» es una valoración, no un hecho verificable.'),
  ('Για να ξεχωρίσουμε τα δύο, αναζητούμε πηγή, ημερομηνία και συγκεκριμένα στοιχεία.', 'Para distinguir ambos, buscamos la fuente, la fecha y datos concretos.'),
 ],
 'Comprobar las fuentes': [
  ('Δύο ιστοσελίδες περιγράφουν την ίδια αλλαγή, αλλά παραπέμπουν σε διαφορετικές πηγές.', 'Dos sitios web describen el mismo cambio, pero remiten a fuentes distintas.'),
  ('Η επίσημη ανακοίνωση δημοσιεύτηκε την ίδια ημέρα με την απόφαση.', 'El comunicado oficial se publicó el mismo día que la decisión.'),
  ('Η σύγκριση των ημερομηνιών και των παραπομπών βοηθά να ελέγξουμε την αξιοπιστία.', 'Comparar fechas y referencias ayuda a comprobar la fiabilidad.'),
 ],
 'Resumir una noticia': [
  ('Η πόλη εγκαινίασε έναν νέο σταθμό ποδηλάτων κοντά στο πανεπιστήμιο.', 'La ciudad inauguró una nueva estación de bicicletas cerca de la universidad.'),
  ('Η κύρια είδηση είναι η έναρξη της υπηρεσίας· οι λεπτομέρειες αφορούν το ωράριο και το κόστος.', 'La noticia principal es el inicio del servicio; los detalles se refieren al horario y al coste.'),
  ('Μια σύντομη περίληψη κρατά τα βασικά στοιχεία και παραλείπει τις επαναλήψεις.', 'Un resumen breve conserva los datos centrales y omite las repeticiones.'),
 ],
 '¿Quién controla los datos?': [
  ('Η εφαρμογή αποθηκεύει πληροφορίες τοποθεσίας για να προτείνει κοντινές υπηρεσίες.', 'La aplicación guarda datos de ubicación para recomendar servicios cercanos.'),
  ('Οι χρήστες μπορούν να αλλάξουν τις ρυθμίσεις, αλλά δεν γνωρίζουν πάντα ποιος λαμβάνει τα δεδομένα.', 'Los usuarios pueden cambiar la configuración, pero no siempre saben quién recibe los datos.'),
  ('Η σαφής ενημέρωση και η συγκατάθεση περιορίζουν την αβεβαιότητα.', 'La información clara y el consentimiento reducen la incertidumbre.'),
 ],
 'Automatización y empleo': [
  ('Τα αυτοματοποιημένα συστήματα αναλαμβάνουν επαναλαμβανόμενες εργασίες σε πολλές επιχειρήσεις.', 'Los sistemas automatizados asumen tareas repetitivas en muchas empresas.'),
  ('Οι εργαζόμενοι χρειάζονται χρόνο και κατάρτιση για να αναλάβουν νέες αρμοδιότητες.', 'Los trabajadores necesitan tiempo y formación para asumir nuevas responsabilidades.'),
  ('Η επίδραση στην απασχόληση εξαρτάται από τον κλάδο και τον τρόπο εφαρμογής.', 'El efecto sobre el empleo depende del sector y de cómo se aplique.'),
 ],
 'Entender condiciones digitales': [
  ('Η υπηρεσία επιτρέπει τη διαγραφή λογαριασμού, όμως το αίτημα μπορεί να χρειαστεί αρκετές ημέρες.', 'El servicio permite borrar la cuenta, aunque la solicitud puede tardar varios días.'),
  ('Οι όροι εξηγούν ποια δεδομένα διατηρούνται και για ποιο χρονικό διάστημα.', 'Las condiciones explican qué datos se conservan y durante cuánto tiempo.'),
  ('Πριν αποδεχτούμε, ελέγχουμε τις εξαιρέσεις και τις επιλογές επικοινωνίας.', 'Antes de aceptar, comprobamos las excepciones y las opciones de contacto.'),
 ],
 'La transición energética': [
  ('Οι ανανεώσιμες πηγές μειώνουν τις εκπομπές, αλλά απαιτούν υποδομές και αποθήκευση.', 'Las fuentes renovables reducen las emisiones, pero requieren infraestructuras y almacenamiento.'),
  ('Το κόστος της μετάβασης κατανέμεται διαφορετικά ανάμεσα στα νοικοκυριά και στις επιχειρήσεις.', 'El coste de la transición se reparte de forma distinta entre hogares y empresas.'),
  ('Η αξιολόγηση χρειάζεται να εξετάζει τόσο την αποτελεσματικότητα όσο και την ισότητα.', 'La evaluación debe examinar tanto la eficacia como la equidad.'),
 ],
 'Políticas de residuos': [
  ('Ο νέος κανονισμός απαιτεί τη διαλογή των συσκευασιών σε τρεις κάδους.', 'El nuevo reglamento obliga a separar los envases en tres contenedores.'),
  ('Το μέτρο είναι πιο αποτελεσματικό όταν υπάρχουν προσβάσιμα σημεία συλλογής.', 'La medida es más eficaz cuando existen puntos de recogida accesibles.'),
  ('Ο δήμος θα επανεξετάσει τα αποτελέσματα ύστερα από έξι μήνες.', 'El ayuntamiento revisará los resultados al cabo de seis meses.'),
 ],
 'La ciudad frente al calor': [
  ('Οι μεγαλύτερες θερμοκρασίες επηρεάζουν περισσότερο τις γειτονιές με λίγα δέντρα.', 'Las temperaturas más altas afectan más a los barrios con pocos árboles.'),
  ('Σκιερά πεζοδρόμια και δημόσιες βρύσες βοηθούν τους κατοίκους κατά τις ζεστές ημέρες.', 'Las aceras con sombra y las fuentes públicas ayudan a los vecinos durante los días calurosos.'),
  ('Οι σχεδιαστές εξετάζουν ποια μέτρα προσφέρουν προστασία χωρίς να περιορίζουν την πρόσβαση.', 'Los planificadores estudian qué medidas protegen sin limitar el acceso.'),
 ],
 'Redactar un informe': [
  ('Η έκθεση αρχίζει με τον σκοπό και περιγράφει έπειτα τη μέθοδο συλλογής στοιχείων.', 'El informe empieza con el objetivo y después describe el método de recogida de datos.'),
  ('Τα ευρήματα παρουσιάζονται χωριστά από τις ερμηνείες και τις προτάσεις.', 'Los hallazgos se presentan por separado de las interpretaciones y las propuestas.'),
  ('Ένας σαφής τίτλος και μια σύντομη σύνοψη διευκολύνουν τον αναγνώστη.', 'Un título claro y un resumen breve facilitan la lectura.'),
 ],
 'Proponer un cambio': [
  ('Η ομάδα προτείνει να μεταφερθεί η στάση κοντά στην είσοδο του νοσοκομείου.', 'El equipo propone trasladar la parada cerca de la entrada del hospital.'),
  ('Η αλλαγή θα βοηθούσε τους επισκέπτες, αλλά χρειάζεται να ελεγχθεί η κυκλοφορία.', 'El cambio ayudaría a los visitantes, pero es necesario revisar el tráfico.'),
  ('Η πρόταση ορίζει υπεύθυνους, προθεσμία και τρόπο αξιολόγησης.', 'La propuesta establece responsables, plazo y forma de evaluación.'),
 ],
 'Una carta formal': [
  ('Σας απευθύνομαι σχετικά με την καθυστέρηση στην παράδοση του εξοπλισμού.', 'Me dirijo a ustedes por el retraso en la entrega del equipo.'),
  ('Παρακαλώ ενημερώστε με για τη νέα ημερομηνία και τις διαθέσιμες λύσεις.', 'Les ruego que me informen de la nueva fecha y de las soluciones disponibles.'),
  ('Κλείνω την επιστολή με ευχαριστίες και τα στοιχεία επικοινωνίας μου.', 'Cierro la carta con un agradecimiento y mis datos de contacto.'),
 ],
 'Igualdad de oportunidades educativas': [
  ('Οι μαθητές δεν έχουν πάντα την ίδια πρόσβαση σε βιβλία, σύνδεση και υποστήριξη.', 'Los estudiantes no siempre tienen el mismo acceso a libros, conexión y apoyo.'),
  ('Ένα πρόγραμμα υποτροφιών μπορεί να μειώσει ορισμένα εμπόδια, αλλά δεν τα εξαλείφει όλα.', 'Un programa de becas puede reducir algunas barreras, pero no eliminarlas todas.'),
  ('Η αξιολόγηση εξετάζει ποιοι συμμετέχουν και ποιοι μένουν εκτός.', 'La evaluación analiza quién participa y quién queda excluido.'),
 ],
 'Aprender a cualquier edad': [
  ('Οι ενήλικες επιστρέφουν στις σπουδές για διαφορετικούς επαγγελματικούς και προσωπικούς λόγους.', 'Los adultos retoman los estudios por motivos laborales y personales diversos.'),
  ('Τα ευέλικτα ωράρια βοηθούν, αν και η αναγνώριση προηγούμενης εμπειρίας παραμένει άνιση.', 'Los horarios flexibles ayudan, aunque el reconocimiento de la experiencia previa sigue siendo desigual.'),
  ('Η συμβουλευτική υπηρεσία προτείνει μαθήματα που ταιριάζουν στους στόχους κάθε εκπαιδευόμενου.', 'El servicio de orientación recomienda cursos acordes con los objetivos de cada estudiante.'),
 ],
 'Debatir en clase': [
  ('Η συζήτηση ξεκινά με έναν κοινό κανόνα: ακούμε το επιχείρημα πριν απαντήσουμε.', 'El debate empieza con una regla común: escuchamos el argumento antes de responder.'),
  ('Μερικοί μαθητές προτιμούν παραδείγματα, ενώ άλλοι ζητούν στοιχεία από έρευνες.', 'Algunos estudiantes prefieren ejemplos, mientras que otros piden datos de estudios.'),
  ('Η ανακεφαλαίωση στο τέλος ξεχωρίζει τα σημεία συμφωνίας από τις διαφωνίες.', 'El resumen final separa los puntos de acuerdo de los desacuerdos.'),
 ],
 'Cómo interpretar una obra': [
  ('Ένα έργο μπορεί να συνδυάζει πραγματικά γεγονότα με φανταστικές λεπτομέρειες.', 'Una obra puede combinar hechos reales con detalles imaginarios.'),
  ('Το χρώμα, η οπτική γωνία και οι σιωπές επηρεάζουν την ερμηνεία του θεατή.', 'El color, la perspectiva y los silencios influyen en la interpretación del espectador.'),
  ('Η ανάλυση στηρίζεται σε στοιχεία του έργου και όχι μόνο στην προσωπική προτίμηση.', 'El análisis se apoya en elementos de la obra y no solo en gustos personales.'),
 ],
 'Qué historia contamos': [
  ('Η ίδια γειτονιά εμφανίζεται διαφορετική όταν την περιγράφει ένας νέος κάτοικος.', 'El mismo barrio parece distinto cuando lo describe un residente recién llegado.'),
  ('Η επιλογή του αφηγητή καθορίζει ποιες εμπειρίες γίνονται ορατές.', 'La elección de quien narra determina qué experiencias se hacen visibles.'),
  ('Συγκρίνοντας τις αφηγήσεις, αναγνωρίζουμε κοινές μνήμες και διαφορετικές οπτικές.', 'Al comparar relatos, reconocemos recuerdos compartidos y perspectivas distintas.'),
 ],
 'Cultura y financiación': [
  ('Το δημοτικό θέατρο ζητά χρηματοδότηση για να προσφέρει παραστάσεις σε σχολεία.', 'El teatro municipal solicita financiación para ofrecer funciones en escuelas.'),
  ('Η επιτροπή αξιολογεί το κοινό, το κόστος και τη διάρκεια κάθε πρότασης.', 'El comité evalúa el público, el coste y la duración de cada propuesta.'),
  ('Η διαφάνεια στα κριτήρια ενισχύει την εμπιστοσύνη των δημιουργών.', 'La transparencia de los criterios refuerza la confianza de los creadores.'),
 ],
 'Información sanitaria fiable': [
  ('Η ανακοίνωση του νοσοκομείου παραπέμπει σε οδηγίες που αναθεωρήθηκαν τον Μάρτιο.', 'El comunicado del hospital remite a unas indicaciones revisadas en marzo.'),
  ('Οι ειδικοί ζητούν να ελέγχουμε την ημερομηνία και τον φορέα που δημοσίευσε το κείμενο.', 'Los especialistas recomiendan comprobar la fecha y la entidad que publicó el texto.'),
  ('Μια προσωπική εμπειρία δεν αρκεί για να αποδείξει ότι μια θεραπεία λειτουργεί.', 'Una experiencia personal no basta para demostrar que un tratamiento funciona.'),
 ],
 'Acceso a los servicios': [
  ('Η νέα πλατφόρμα επιτρέπει την ηλεκτρονική κράτηση ραντεβού.', 'La nueva plataforma permite reservar citas por internet.'),
  ('Όσοι δεν έχουν σύνδεση μπορούν να ζητήσουν βοήθεια από το δημοτικό γραφείο.', 'Quienes no tienen conexión pueden pedir ayuda en la oficina municipal.'),
  ('Η υπηρεσία θα παρακολουθεί αν μειώνονται οι χρόνοι αναμονής.', 'El servicio comprobará si disminuyen los tiempos de espera.'),
 ],
 'Calidad de vida y espacio público': [
  ('Η πλατεία έχει περισσότερο πράσινο, παγκάκια και ασφαλείς διαβάσεις.', 'La plaza tiene más zonas verdes, bancos y pasos de peatones seguros.'),
  ('Οι κάτοικοι ζητούν επίσης λιγότερο θόρυβο και καλύτερη πρόσβαση για αμαξίδια.', 'Los vecinos piden también menos ruido y mejor acceso para sillas de ruedas.'),
  ('Ο δήμος θα συγκρίνει τις απαντήσεις πριν αποφασίσει για τα επόμενα έργα.', 'El ayuntamiento comparará las respuestas antes de decidir las próximas obras.'),
 ],
 'Turismo y vida de los residentes': [
  ('Η γειτονιά δέχεται περισσότερους επισκέπτες το καλοκαίρι και μερικά καταστήματα μένουν ανοιχτά ως αργά.', 'El barrio recibe más visitantes durante el verano y algunos comercios abren hasta tarde.'),
  ('Οι κάτοικοι εκτιμούν τις θέσεις εργασίας, αλλά επισημαίνουν την αύξηση των ενοικίων και του θορύβου.', 'Los residentes valoran el empleo, pero señalan el aumento del alquiler y del ruido.'),
  ('Το δημοτικό σχέδιο προτείνει να περιοριστούν τα τουριστικά λεωφορεία στους στενούς δρόμους.', 'El plan municipal propone limitar los autobuses turísticos en las calles estrechas.'),
 ],
 'Proteger el patrimonio': [
  ('Το παλιό υδραγωγείο χρειάζεται επισκευή, αλλά οι ειδικοί ζητούν να διατηρηθούν τα αρχικά υλικά.', 'El acueducto antiguo necesita reparación, pero los especialistas piden conservar los materiales originales.'),
  ('Η χρηματοδότηση θα καλύψει τις εργασίες και ένα πρόγραμμα ενημέρωσης για τους επισκέπτες.', 'La financiación cubrirá las obras y un programa informativo para visitantes.'),
  ('Η προστασία του μνημείου απαιτεί πρόσβαση του κοινού και σαφείς κανόνες χρήσης.', 'Proteger el monumento requiere acceso público y normas de uso claras.'),
 ],
 'Viajar de forma responsable': [
  ('Οι επισκέπτες μπορούν να χρησιμοποιούν το τοπικό λεωφορείο αντί για ιδιωτικά αυτοκίνητα.', 'Los visitantes pueden usar el autobús local en vez de coches privados.'),
  ('Η επιλογή μικρών καταλυμάτων διατηρεί περισσότερα έσοδα στην κοινότητα.', 'Elegir alojamientos pequeños deja más ingresos en la comunidad.'),
  ('Οι ταξιδιώτες χρειάζεται να σέβονται τους κανόνες και την καθημερινότητα των κατοίκων.', 'Los viajeros deben respetar las normas y la vida cotidiana de los residentes.'),
 ],
 'Presentar una solución': [
  ('Η πρόταση προβλέπει πιλοτική εφαρμογή σε δύο συνοικίες για έξι μήνες.', 'La propuesta prevé una aplicación piloto en dos barrios durante seis meses.'),
  ('Η ομάδα θα μετρήσει το κόστος, τον χρόνο αναμονής και την ικανοποίηση των χρηστών.', 'El equipo medirá el coste, el tiempo de espera y la satisfacción de los usuarios.'),
  ('Αν τα αποτελέσματα είναι θετικά, το σχέδιο μπορεί να επεκταθεί σταδιακά.', 'Si los resultados son positivos, el plan podrá ampliarse gradualmente.'),
 ],
 'Sintetizar dos posturas': [
  ('Η πρώτη πηγή δίνει έμφαση στην ταχύτητα, ενώ η δεύτερη στην ίση πρόσβαση.', 'La primera fuente destaca la rapidez y la segunda, el acceso igualitario.'),
  ('Και οι δύο συμφωνούν ότι χρειάζονται αξιόπιστα στοιχεία πριν από την απόφαση.', 'Ambas coinciden en que hacen falta datos fiables antes de decidir.'),
  ('Μια σύνθεση αναφέρει την κοινή θέση και διατηρεί ορατή τη βασική διαφωνία.', 'Una síntesis recoge la postura común y mantiene visible el desacuerdo principal.'),
 ],
 'Evaluar y revisar': [
  ('Η πρώτη εκδοχή επαναλαμβάνει την ίδια ιδέα και χρησιμοποιεί ασαφείς αντωνυμίες.', 'La primera versión repite la misma idea y usa pronombres ambiguos.'),
  ('Στη δεύτερη εκδοχή, οι σύνδεσμοι δείχνουν καθαρά την αιτία και την αντίθεση.', 'En la segunda versión, los conectores expresan con claridad la causa y el contraste.'),
  ('Η τελική αναθεώρηση ελέγχει τη συνοχή, την ακρίβεια και τον τόνο.', 'La revisión final comprueba la cohesión, la precisión y el tono.'),
 ],
 'Repaso final B2': [
  ('Η τελική αξιολόγηση συνδυάζει κατανόηση κειμένου, ακρόαση και παραγωγή λόγου.', 'La evaluación final combina comprensión lectora, escucha y producción.'),
  ('Οι υποψήφιοι χρειάζεται να συνθέτουν πληροφορίες, να αιτιολογούν απόψεις και να προσαρμόζουν το ύφος.', 'Los candidatos deben sintetizar información, justificar opiniones y adaptar el registro.'),
  ('Η προφορική αλληλεπίδραση αξιολογεί επίσης την ανταπόκριση, τη σαφήνεια και τη διαχείριση των σειράς λόγου.', 'La interacción oral también valora la respuesta, la claridad y la gestión de los turnos.'),
 ],
}

def actualizar_lecturas_b2():
    encontrados = 0
    for path in sorted((ROOT / '_herramientas' / 'cursos' / 'el_b2' / 'el').glob('[0-9]*.txt')):
        lines = path.read_text(encoding='utf-8').splitlines()
        rebuilt = []
        i = 0
        while i < len(lines):
            if not lines[i].startswith('@ '):
                rebuilt.append(lines[i]); i += 1; continue
            j = i + 1
            while j < len(lines) and not lines[j].startswith('@ '):
                j += 1
            lesson = lines[i:j]
            fields = [part.strip() for part in lines[i][2:].split('|')]
            title = fields[-1]
            if title not in B2_OLD_READINGS:
                raise ValueError(f'No hay lectura editorial para B2: {title}')
            cleaned = []
            k = 0
            while k < len(lesson):
                if lesson[k].startswith('T '):
                    k += 1
                    while k < len(lesson) and lesson[k].startswith('- '):
                        k += 1
                else:
                    cleaned.append(lesson[k]); k += 1
            insert_at = next((n for n, line in enumerate(cleaned) if line.startswith('Q ')), None)
            if insert_at is None:
                raise ValueError(f'No hay preguntas tras el diálogo de B2: {title}')
            reading = ['T Κείμενο για ανάγνωση'] + [f'- {el} = {es}' for el, es in B2_OLD_READINGS[title]]
            cleaned[insert_at:insert_at] = reading
            rebuilt.extend(cleaned)
            encontrados += 1
            i = j
        path.write_text('\n'.join(rebuilt) + '\n', encoding='utf-8', newline='\n')
    if encontrados != 31:
        raise ValueError(f'Esperaba reconstruir 31 lecturas B2; encontré {encontrados}')

def pron(text):
    """Transliteración de apoyo consistente con las guías del curso existente."""
    s = unicodedata.normalize('NFC', text)
    out, i = [], 0
    sordas = set('θκξπτφχψ')
    vocales = {'α':'a','ά':'á','ε':'e','έ':'é','η':'i','ή':'í','ι':'i','ί':'í','ο':'o','ό':'ó','υ':'i','ύ':'í','ω':'o','ώ':'ó'}
    simples = {'β':'v','γ':'g','δ':'dh','ζ':'z','θ':'th','κ':'k','λ':'l','μ':'m','ν':'n','ξ':'ks','π':'p','ρ':'r','σ':'s','ς':'s','τ':'t','φ':'f','χ':'j','ψ':'ps'}
    while i < len(s):
        par = s[i:i+2].lower()
        inicio = i == 0 or not s[i-1].isalpha()
        if par in ('αι','ει','οι','υι','ου','αυ','ευ','μπ','ντ','γκ','γγ'):
            if par == 'αι': valor = 'e'
            elif par in ('ει','οι','υι'): valor = 'i'
            elif par == 'ου': valor = 'u'
            elif par in ('αυ','ευ'):
                v = 'a' if par == 'αυ' else 'e'
                valor = v + ('f' if i+2 < len(s) and s[i+2].lower() in sordas else 'v')
            elif par == 'μπ': valor = 'b' if inicio else 'mb'
            elif par == 'ντ': valor = 'd' if inicio else 'nd'
            elif par == 'γκ': valor = 'g' if inicio else 'ng'
            else: valor = 'ng'
            out.append(valor.capitalize() if s[i].isupper() else valor); i += 2; continue
        c = s[i]; low = c.lower()
        if low in vocales: valor = vocales[low]
        elif low == 'γ' and i+1 < len(s) and s[i+1].lower() in 'εηιυ': valor = 'y'
        else: valor = simples.get(low, c)
        out.append(valor.capitalize() if c.isupper() else valor); i += 1
    return ''.join(out)

def leer_plan():
    text = REPORT.read_text(encoding='utf-8')
    result = {level: [] for level in LEVELS}
    current = None
    group = None
    for line in text.splitlines():
        m = re.match(r'### (A1|A2|B1|B2) — añadir ', line)
        if m:
            current, group = m.group(1), None
            continue
        if current and line.startswith('## '):
            current, group = None, None
            continue
        if not current:
            continue
        heading = re.match(r'\*\*(.+)\*\*$', line.strip())
        if heading:
            group = heading.group(1)
            continue
        item = re.match(r'\d+\. (.+)$', line.strip())
        if item and group:
            result[current].append((group, item.group(1)))
    for level, (_, expected) in LEVELS.items():
        if len(result[level]) != expected:
            raise ValueError(f'{level}: esperaba {expected} títulos y encontré {len(result[level])}')
    return result

def forma_sin_acento(text):
    descompuesto = unicodedata.normalize('NFD', text.casefold())
    return ''.join(c for c in descompuesto if not unicodedata.combining(c))

def crear_hueco(frase, palabra, lecciones, indice):
    """Quita de la frase una forma real de la ficha y crea distractores griegos."""
    forma = forma_sin_acento(palabra)
    patron = re.compile(r'[\u0370-\u03ff\u1f00-\u1fff]+')
    objetivo = next((m for m in patron.finditer(frase) if forma_sin_acento(m.group()) == forma), None)
    if objetivo is None:
        raise ValueError(f'No se encuentra la palabra clave «{palabra}» en «{frase}»')
    opciones = []
    for distancia in range(1, len(lecciones)):
        candidata = lecciones[(indice + distancia) % len(lecciones)][6]
        if forma_sin_acento(candidata) == forma or any(forma_sin_acento(c) == forma_sin_acento(candidata) for c in opciones):
            continue
        opciones.append(candidata)
        if len(opciones) == 2:
            break
    if len(opciones) != 2:
        raise ValueError(f'No hay dos distractores griegos para «{palabra}»')
    hueco = frase[:objetivo.start()] + '___' + frase[objetivo.end():]
    return hueco, objetivo.group(), opciones

def construir():
    actualizar_lecturas_b2()
    chapters = json.loads((LESSONS / 'capitulos.json').read_text(encoding='utf-8'))
    chapter_by_num = {c['numero']: c for c in chapters if isinstance(c.get('numero'), int)}
    plan = leer_plan()
    for level in LEVELS:
        if set(FOCUS[level]) != set(CORE[level]):
            raise ValueError(f'Las pautas de {level} no coinciden con sus grupos temáticos')
    for level, (chapter_start, count) in LEVELS.items():
        source = OUT / level / 'el'
        source.mkdir(parents=True, exist_ok=True)
        (source / 'desde.txt').write_text(f'{STARTS[level]}\n', encoding='utf-8')
        chapter_lines = []
        lessons = []
        per_group = {}
        for group, title in plan[level]:
            groups = list(CORE[level])
            if group not in CORE[level]:
                raise ValueError(f'Falta el contenido base de {level}: {group}')
            gi = groups.index(group)
            variant = per_group.get(group, 0)
            per_group[group] = variant + 1
            cap = CHAPTER_VARIANTS.get((level, group), [CHAPTERS[level][gi]])[variant % len(CHAPTER_VARIANTS.get((level, group), [CHAPTERS[level][gi]]))]
            meta = chapter_by_num[cap]
            chapter_lines.append(f"{cap} | {meta['titulo_el']} | {meta['titulo_es']} | {meta['descripcion']}")
            variants = VARIANT_CORE.get(level, {}).get(group, [])
            core, core_es, key, key_es = variants[variant % len(variants)] if variants else CORE[level][group]
            lessons.append((cap, group, title, variant, core, core_es, key, key_es, f"{meta['titulo_el']} · {key}"))
        (source / 'capitulos.txt').write_text('\n'.join(dict.fromkeys(chapter_lines)) + '\n', encoding='utf-8')
        out_lines = ['N Νίκος, Άννα, Μαρία, Πέτρος, Ελένη, Γιώργος, Συντονίστρια, Αναλυτής, Υπάλληλος']
        for lesson_index, (cap, group, title, variant, core, core_es, key, key_es, greek_chapter) in enumerate(lessons):
            focus, listening_prompt = FOCUS[level][group]
            speaker1, ask, ask_es, speaker2, reply_template, reply_es_template = DIALOGUE_FRAMES[level]
            reply = reply_template.format(key=key)
            reply_es = reply_es_template.format(key=key)
            ejemplos = VARIANT_CORE[level][group]
            lectura = [ejemplos[(variant + i) % len(ejemplos)] for i in range(min(3, len(ejemplos)))]
            audio = ' '.join(el for el, _, _, _ in lectura)
            alt_a = lessons[(lesson_index + 1) % len(lessons)][5]
            alt_b = lessons[(lesson_index + 5) % len(lessons)][5]
            if alt_a == core_es: alt_a = 'La información no ofrece ese dato.'
            if alt_b in (core_es, alt_a): alt_b = 'El texto no afirma eso.'
            hole, answer, (wrong1, wrong2) = crear_hueco(core, key, lessons, lesson_index)
            prompt_template, rubric = OPEN_TASK[level]
            prompt = prompt_template.format(title=title, key=key)
            longitud_modelo = {'A1': 1, 'A2': 2, 'B1': 3, 'B2': 3}[level]
            model = ' '.join(el for el, _, _, _ in lectura[:longitud_modelo])
            out_lines += [
                f'@ {cap} | {greek_chapter} | {title}',
                f'I En esta lección practicarás: {title[0].lower() + title[1:]}.',
                f'E Comprensión y contexto :: {focus}',
                f'W {key} = {key_es} | {pron(key)}',
                f'w κείμενο = texto | {pron("κείμενο")}',
                f'w πληροφορία = información | {pron("πληροφορία")}',
                f'w χρειάζομαι = necesitar | {pron("χρειάζομαι")}',
                f'w διευκρίνιση = aclaración | {pron("διευκρίνιση")}',
                'V Palabras clave',
                'D Μια σύντομη συζήτηση',
                f'{speaker1}: {ask} = {ask_es}',
                f'{speaker2}: {reply} = {reply_es}',
                f'A {audio} :: {listening_prompt}',
                f'+ {core_es} :: Identifica la información expresada en el audio.',
                f'- {alt_a} :: El audio no presenta ese dato.',
                f'- {alt_b} :: Esa opción añade o cambia información.',
                'T Κείμενο για ανάγνωση',
            ]
            out_lines.extend(f'- {el} = {es}' for el, es, _, _ in lectura)
            out_lines += [
                'Q ¿Qué información presenta directamente el texto?',
                f'+ {core_es} :: Esa es la información que aparece de forma explícita.',
                f'- {alt_a} :: El texto no presenta esa información como su idea principal.',
                f'- {alt_b} :: Esa opción añade o cambia información.',
                f'R {core} :: ¿Qué significa esta frase?',
                f'+ {core_es} :: Conserva el sentido completo de la frase.',
                f'- {alt_a} :: No corresponde a la frase griega.',
                f'- {alt_b} :: No corresponde a la frase griega.',
                f'H {hole} :: Completa la frase con la forma que corresponde al ejemplo.',
                f'+ {answer} :: Es la forma que aparece en la frase original.',
                f'- {wrong1} :: Es griego, pero aquí no conserva el sentido esperado.',
                f'- {wrong2} :: Es griego, pero aquí no conserva el sentido esperado.',
                f'O {core} :: {core_es} :: Mantén juntos los conectores y las palabras que completan la idea.',
                f'XM {prompt} :: {model} :: {rubric}',
            ]
        (source / '90.txt').write_text('\n'.join(out_lines) + '\n', encoding='utf-8')

if __name__ == '__main__':
    construir()
    print('Se generaron fuentes para A1–B2: 36, 42, 46 y 52 lecciones.')
