#!/usr/bin/env python3
"""Genera y actualiza las 278 lecciones nuevas del curso de tailandés.

Las lecciones 001–003, ya redactadas, se conservan. Las lecciones 004–281 se
construyen desde el plan de esta plantilla, en cinco tramos CU-TFL. T1–T4 del
TPA se usan como referencias didácticas en los cuatro primeros tramos; no se
presentan como equivalencias oficiales entre exámenes. No se incluye T5.
"""

import json
import hashlib
from pathlib import Path


RAIZ = Path(__file__).resolve().parents[1]
LECCIONES = RAIZ / "lessons"
INDICE = RAIZ / "indice" / "lecciones.json"
DICCIONARIO = RAIZ / "indice" / "diccionario.json"
CAPITULOS = LECCIONES / "capitulos.json"
PLAN = Path(__file__).with_name("PLAN_CURRICULAR.md")
MANIFIESTO = Path(__file__).with_name("lecciones_generadas.sha256.json")
LECCIONES_INICIALES = 3
TOTAL = 281


def tema(nombre, palabras, regla, ejemplos):
    """Crea un tema con fichas (tailandés, español, inglés) y frases originales."""
    return {"nombre": nombre, "palabras": palabras, "regla": regla, "ejemplos": ejemplos}


# Los descriptores ordenan la complejidad por destreza. El vocabulario y las
# frases de cada tema son material didáctico original para Paglot.
TRAMOS = [
    {
        "chula": "Novice", "es": "Novice · inicio", "tpa": "T1 · Beginner",
        "desde": 4, "cantidad": 56,
        "objetivo": "Reconocer letras, palabras y fórmulas frecuentes; comprender habla lenta y clara; producir frases breves memorizables.",
        "tareas": "palabras y fórmulas frecuentes, preguntas breves, cortesía y situaciones inmediatas",
        "temas": [
            tema("Saludos y fórmulas de cortesía", [("สวัสดี", "hola"), ("ขอบคุณ", "gracias"), ("ขอโทษ", "perdón"), ("ลาก่อน", "adiós")], "Las fórmulas sociales suelen llevar una partícula de cortesía: ครับ suele usarla un hombre y ค่ะ una mujer. La elección depende de quien habla.", [("สวัสดีครับ", "Hola. (habla un hombre)", "Hello. (male speaker)"), ("ขอบคุณค่ะ", "Gracias. (habla una mujer)", "Thank you. (female speaker)"), ("ขอโทษครับ", "Perdón. (habla un hombre)", "Excuse me. (male speaker)")]),
            tema("Nombre, país y presentación", [("ชื่อ", "nombre; llamarse"), ("ฉัน", "yo"), ("ผม", "yo; forma masculina cortés"), ("ประเทศ", "país")], "Para decir el nombre: ฉันชื่อ… o ผมชื่อ… . Para origen: เป็นคน + país significa «ser de…».", [("ฉันชื่อมาเรีย", "Me llamo María.", "My name is María."), ("ผมเป็นคนสเปน", "Soy español.", "I am Spanish."), ("คุณชื่ออะไร", "¿Cómo se llama usted?", "What is your name?")]),
            tema("Números, edad y datos básicos", [("หนึ่ง", "uno"), ("สอง", "dos"), ("สาม", "tres"), ("อายุ", "edad")], "La edad se expresa con อายุ + número + ปี. Los números no cambian por persona.", [("ฉันอายุยี่สิบปี", "Tengo veinte años.", "I am twenty years old."), ("บ้านมีสามคน", "En la casa viven tres personas.", "There are three people in the household."), ("วันนี้วันที่ห้า", "Hoy es día cinco.", "Today is the fifth.")]),
            tema("Familia y personas cercanas", [("พ่อ", "padre"), ("แม่", "madre"), ("พี่", "hermano/a mayor"), ("น้อง", "hermano/a menor")], "พี่ y น้อง expresan edad relativa dentro de una relación; pueden usarse para dirigirse a personas cercanas.", [("นี่คือแม่ของฉัน", "Esta es mi madre.", "This is my mother."), ("พี่มีน้องสองคน", "Mi hermano mayor tiene dos hermanos menores.", "My older sibling has two younger siblings."), ("พ่ออยู่บ้าน", "Papá está en casa.", "Dad is at home.")]),
            tema("Comida y pedidos sencillos", [("ข้าว", "arroz; comida"), ("น้ำ", "agua"), ("ไก่", "pollo"), ("เผ็ด", "picante")], "ขอ + cosa + ครับ/ค่ะ es una petición cortés. ไม่ + adjetivo niega una cualidad.", [("ขอน้ำครับ", "Agua, por favor. (habla un hombre)", "Water, please. (male speaker)"), ("ขอข้าวกับไก่ค่ะ", "Arroz con pollo, por favor. (habla una mujer)", "Rice with chicken, please. (female speaker)"), ("ไม่เผ็ดค่ะ", "No picante, por favor. (habla una mujer)", "Not spicy, please. (female speaker)")]),
            tema("Compras y precios", [("อันนี้", "esto"), ("อันนั้น", "eso"), ("ราคา", "precio"), ("เท่าไหร่", "cuánto")], "อันนี้/อันนั้น señalan objetos. ¿Cuánto cuesta? se pregunta con ราคาเท่าไหร่.", [("อันนี้ราคาเท่าไหร่", "¿Cuánto cuesta esto?", "How much is this?"), ("ขอดูอันนั้นได้ไหม", "¿Puedo ver eso?", "May I see that?"), ("ราคาเท่ากันไหม", "¿Tienen el mismo precio?", "Are they the same price?")]),
            tema("Lugares y direcciones básicas", [("ที่ไหน", "dónde"), ("ห้องน้ำ", "baño"), ("ตรงไป", "seguir recto"), ("ซ้าย", "izquierda")], "ไป + lugar indica destino. Puede añadirse ตรงไป (recto) o เลี้ยวซ้าย/ขวา (girar a la izquierda/derecha).", [("ห้องน้ำอยู่ที่ไหน", "¿Dónde está el baño?", "Where is the restroom?"), ("ตรงไปแล้วเลี้ยวซ้าย", "Siga recto y luego gire a la izquierda.", "Go straight, then turn left."), ("ฉันไปตลาด", "Voy al mercado.", "I am going to the market.")]),
            tema("Rutina y necesidades inmediatas", [("กิน", "comer"), ("ดื่ม", "beber"), ("นอน", "dormir"), ("ต้องการ", "necesitar; querer")], "El verbo no se conjuga por persona. ต้องการ + sustantivo expresa una necesidad o deseo.", [("ฉันต้องการน้ำ", "Necesito agua.", "I need water."), ("ผมกินข้าวตอนเช้า", "Como por la mañana.", "I eat in the morning."), ("วันนี้ฉันนอนที่บ้าน", "Hoy duermo en casa.", "Today I sleep at home.")]),
        ],
    },
    {
        "chula": "Intermediate", "es": "Intermediate · interacción cotidiana", "tpa": "T2 · Elementary",
        "desde": 60, "cantidad": 56,
        "objetivo": "Comprender el sentido y detalles de intercambios breves sobre la vida diaria; escribir párrafos sencillos y mantener una conversación cotidiana.",
        "tareas": "diálogos breves, anuncios y horarios, detalles cotidianos, párrafos simples y conversación cara a cara",
        "temas": [
            tema("Horarios, citas y rutina semanal", [("ตารางเวลา", "horario"), ("นัด", "cita"), ("เช้า", "mañana"), ("สัปดาห์", "semana")], "ใช้ จะ para planes y แล้ว para una acción ya completada. El contexto temporal aclara el momento.", [("พรุ่งนี้ฉันจะไปพบหมอ", "Mañana iré a ver al médico.", "Tomorrow I will see the doctor."), ("เราเจอกันตอนบ่ายสามโมง", "Nos vemos a las tres de la tarde.", "Let's meet at three in the afternoon."), ("ฉันทำงานเสร็จแล้ว", "Ya terminé el trabajo.", "I have finished the work.")]),
            tema("Transporte y desplazamientos", [("รถไฟ", "tren"), ("รถเมล์", "autobús"), ("สถานี", "estación"), ("เปลี่ยน", "cambiar; hacer transbordo")], "Para pedir instrucciones se usa ไป…อย่างไร. Antes de un destino, ทาง… puede indicar la ruta.", [("ไปสถานีรถไฟอย่างไร", "¿Cómo voy a la estación de tren?", "How do I get to the train station?"), ("ฉันนั่งรถเมล์ไปทำงาน", "Voy al trabajo en autobús.", "I take the bus to work."), ("ต้องเปลี่ยนรถที่นี่", "Hay que hacer transbordo aquí.", "You have to change vehicles here.")]),
            tema("Viaje y alojamiento", [("โรงแรม", "hotel"), ("จอง", "reservar"), ("ห้องพัก", "habitación"), ("กระเป๋า", "maleta")], "ขอ + acción o sustantivo hace una petición cortés. มี…ไหม pregunta si algo está disponible.", [("ฉันจองห้องพักไว้แล้ว", "Ya reservé una habitación.", "I have already booked a room."), ("มีห้องว่างไหมคะ", "¿Hay una habitación libre? (habla una mujer)", "Is there a room available? (female speaker)"), ("กระเป๋าอยู่ในห้อง", "La maleta está en la habitación.", "The suitcase is in the room.")]),
            tema("Servicios y devoluciones", [("ใบเสร็จ", "recibo"), ("คืน", "devolver"), ("เปลี่ยนสินค้า", "cambiar un producto"), ("เสีย", "estropeado")], "เมื่อ…จึง… expresa una relación temporal o causal («cuando…, entonces…»). ใช้ ได้ไหม para pedir permiso o posibilidad.", [("สินค้านี้เสีย ขอเปลี่ยนได้ไหม", "Este producto está estropeado. ¿Puedo cambiarlo?", "This item is broken. Can I exchange it?"), ("ขอใบเสร็จด้วยค่ะ", "El recibo también, por favor. (habla una mujer)", "The receipt too, please. (female speaker)"), ("ถ้าไม่พอใจ สามารถคืนสินค้าได้", "Si no está satisfecho, puede devolver el producto.", "If you are not satisfied, you can return the item.")]),
            tema("Salud y síntomas cotidianos", [("ปวดหัว", "dolor de cabeza"), ("ไข้", "fiebre"), ("ยา", "medicina"), ("พักผ่อน", "descansar")], "ปวด + parte del cuerpo expresa dolor. ถ้า…ควร… introduce un consejo condicional.", [("ฉันปวดหัวและมีไข้", "Me duele la cabeza y tengo fiebre.", "I have a headache and a fever."), ("ถ้าไม่สบาย ควรพักผ่อน", "Si se encuentra mal, debería descansar.", "If you feel unwell, you should rest."), ("กินยาหลังอาหาร", "Tome la medicina después de comer.", "Take the medicine after eating.")]),
            tema("Estudios y trabajo diario", [("ประชุม", "reunirse; reunión"), ("การบ้าน", "deberes"), ("ส่ง", "entregar; enviar"), ("อธิบาย", "explicar")], "ต้อง + verbo expresa obligación o necesidad. ก่อนที่/หลังจาก indican orden temporal.", [("ฉันต้องส่งการบ้านวันนี้", "Tengo que entregar los deberes hoy.", "I have to submit the homework today."), ("หลังจากประชุม เราจะส่งรายงาน", "Después de la reunión enviaremos el informe.", "After the meeting, we will send the report."), ("ครูอธิบายบทเรียนอีกครั้ง", "El profesor explica la lección otra vez.", "The teacher explains the lesson again.")]),
            tema("Aficiones y actividades de ocio", [("ว่าง", "tener tiempo libre"), ("อ่านหนังสือ", "leer"), ("ออกกำลังกาย", "hacer ejercicio"), ("ชอบ", "gustar")], "ชอบ + actividad expresa gusto. เวลาว่าง se puede combinar con เมื่อ para ubicar una actividad.", [("เวลาว่างฉันชอบอ่านหนังสือ", "En mi tiempo libre me gusta leer.", "In my free time I like reading."), ("พวกเขาออกกำลังกายด้วยกันทุกวัน", "Hacen ejercicio juntos cada día.", "They exercise together every day."), ("วันหยุดคุณทำอะไร", "¿Qué hace en su día libre?", "What do you do on your day off?")]),
            tema("Tiempo, clima y experiencias", [("ฝนตก", "llover"), ("อากาศ", "tiempo; clima"), ("ร้อน", "caluroso"), ("สนุก", "divertido")], "เพราะ…จึง… expresa causa y resultado. La partícula แล้ว también puede situar una experiencia pasada.", [("เมื่อวานฝนตก เราจึงอยู่บ้าน", "Ayer llovió, así que nos quedamos en casa.", "It rained yesterday, so we stayed home."), ("อากาศร้อนแต่การเดินทางสนุก", "Hacía calor, pero el viaje fue divertido.", "The weather was hot, but the trip was fun."), ("คุณเคยไปเชียงใหม่ไหม", "¿Ha estado alguna vez en Chiang Mai?", "Have you ever been to Chiang Mai?")]),
        ],
    },
    {
        "chula": "Advanced", "es": "Advanced · narración y opinión", "tpa": "T3 · Intermediate",
        "desde": 116, "cantidad": 56,
        "objetivo": "Entender el tema central de habla clara a velocidad normal, leer textos breves sobre temas conocidos, relatar hechos y expresar opiniones con razones.",
        "tareas": "idea principal, detalles y contexto, secuenciar párrafos, informar, explicar y sostener una conversación conocida",
        "temas": [
            tema("Relatar una experiencia y ordenar hechos", [("ประสบการณ์", "experiencia"), ("เหตุการณ์", "suceso"), ("ในที่สุด", "finalmente"), ("หลังจากนั้น", "después")], "Una narración clara puede enlazar ก่อน, ระหว่าง, หลังจากนั้น y ในที่สุด para marcar secuencia.", [("ก่อนเดินทาง ฉันตรวจสอบเวลาและเส้นทาง", "Antes del viaje, comprobé la hora y la ruta.", "Before travelling, I checked the time and route."), ("ระหว่างทาง รถเสีย หลังจากนั้นเราจึงโทรขอความช่วยเหลือ", "Durante el trayecto se averió el coche; después llamamos para pedir ayuda.", "The car broke down on the way, so we called for help."), ("ในที่สุดทุกคนก็ถึงบ้านอย่างปลอดภัย", "Finalmente todos llegaron a casa sanos y salvos.", "In the end, everyone arrived home safely.")]),
            tema("Comunicación profesional y reuniones", [("ข้อเสนอ", "propuesta"), ("กำหนดการ", "agenda"), ("รับผิดชอบ", "ser responsable de"), ("ร่วมมือ", "cooperar")], "ในฐานะ… presenta una función; เนื่องจาก…จึง… enlaza razón y resultado en registro neutro o formal.", [("ในฐานะผู้ประสานงาน ฉันจะส่งกำหนดการให้ทุกคน", "Como coordinador, enviaré la agenda a todos.", "As coordinator, I will send the agenda to everyone."), ("เนื่องจากข้อมูลยังไม่ครบ เราจึงเลื่อนการตัดสินใจ", "Como aún faltan datos, aplazamos la decisión.", "Since information is incomplete, we postponed the decision."), ("ทีมงานร่วมมือกันเพื่อแก้ปัญหา", "El equipo coopera para resolver el problema.", "The team is working together to solve the problem.")]),
            tema("Ciudad, trámites y servicios públicos", [("สำนักงาน", "oficina"), ("เอกสาร", "documento"), ("ยื่นคำร้อง", "presentar una solicitud"), ("เจ้าหน้าที่", "funcionario/a")], "El orden petición + propósito con เพื่อ ayuda a explicar un trámite; กรุณา suaviza instrucciones formales.", [("กรุณายื่นเอกสารที่สำนักงานเขต", "Por favor, presente los documentos en la oficina del distrito.", "Please submit the documents at the district office."), ("ฉันติดต่อเจ้าหน้าที่เพื่อสอบถามขั้นตอน", "Contacté al funcionario para preguntar el procedimiento.", "I contacted the officer to ask about the procedure."), ("ต้องใช้เอกสารอะไรบ้าง", "¿Qué documentos hacen falta?", "What documents are required?")]),
            tema("Noticias y asuntos sociales", [("ข่าว", "noticia"), ("ประชาชน", "ciudadanía"), ("สถานการณ์", "situación"), ("ผลกระทบ", "impacto")], "Según la fuente, las noticias pueden presentar dato, consecuencia y cita. แสดงให้เห็นว่า introduce evidencia o indicio.", [("ข่าวรายงานว่าการจราจรติดขัดในหลายพื้นที่", "La noticia informa de tráfico lento en varias zonas.", "The news reports traffic congestion in several areas."), ("สถานการณ์ดังกล่าวส่งผลกระทบต่อประชาชน", "La situación afecta a la población.", "The situation affects the public."), ("ข้อมูลนี้แสดงให้เห็นว่าปัญหายังไม่หมดไป", "Estos datos muestran que el problema no ha desaparecido.", "This information shows that the problem has not gone away.")]),
            tema("Educación, cultura y comunidad", [("วัฒนธรรม", "cultura"), ("ชุมชน", "comunidad"), ("ประเพณี", "tradición"), ("สืบทอด", "transmitir; perpetuar")], "แม้ว่า…แต่… marca contraste. En la explicación de una costumbre conviene distinguir descripción y opinión.", [("แม้ว่าประเพณีจะเปลี่ยนไป แต่ชุมชนยังสืบทอดความหมายเดิม", "Aunque la tradición cambia, la comunidad conserva su sentido original.", "Although the tradition changes, the community preserves its original meaning."), ("กิจกรรมนี้เปิดโอกาสให้คนรุ่นใหม่เรียนรู้วัฒนธรรม", "Esta actividad permite que los jóvenes aprendan sobre la cultura.", "This activity gives young people a chance to learn about the culture."), ("ผู้เข้าร่วมแลกเปลี่ยนประสบการณ์กัน", "Los participantes intercambian experiencias.", "The participants exchange experiences.")]),
            tema("Salud pública y recomendaciones", [("ป้องกัน", "prevenir"), ("อาการ", "síntoma"), ("คำแนะนำ", "recomendación"), ("สม่ำเสมอ", "regularmente")], "เพื่อให้… expresa finalidad. ควร/ไม่ควร permite formular recomendaciones sin dar una orden tajante.", [("ควรพักผ่อนให้เพียงพอเพื่อให้ร่างกายฟื้นตัว", "Conviene descansar lo suficiente para que el cuerpo se recupere.", "You should rest enough for your body to recover."), ("การออกกำลังกายสม่ำเสมอช่วยป้องกันโรคบางชนิด", "Hacer ejercicio regularmente ayuda a prevenir algunas enfermedades.", "Regular exercise helps prevent some illnesses."), ("หากอาการไม่ดีขึ้น ควรปรึกษาแพทย์", "Si los síntomas no mejoran, conviene consultar a un médico.", "If symptoms do not improve, you should consult a doctor.")]),
            tema("Medioambiente y hábitos sostenibles", [("สิ่งแวดล้อม", "medioambiente"), ("ขยะ", "residuos"), ("ลด", "reducir"), ("ทรัพยากร", "recursos")], "การ + verbo convierte una acción en tema; หาก…ก็… formula condición y resultado.", [("การแยกขยะช่วยลดปริมาณขยะที่ต้องกำจัด", "Separar residuos reduce la cantidad que hay que eliminar.", "Sorting waste reduces the amount that must be disposed of."), ("หากใช้ทรัพยากรอย่างประหยัด ก็จะลดผลกระทบต่อสิ่งแวดล้อม", "Si usamos los recursos con moderación, reduciremos el impacto ambiental.", "If we use resources carefully, we can reduce environmental impact."), ("ชุมชนเริ่มโครงการปลูกต้นไม้", "La comunidad ha iniciado un proyecto de plantación de árboles.", "The community has started a tree-planting project.")]),
            tema("Opiniones con razones y ejemplos", [("ความคิดเห็น", "opinión"), ("เหตุผล", "razón"), ("ตัวอย่าง", "ejemplo"), ("อย่างไรก็ตาม", "sin embargo")], "คิดว่า…เพราะว่า… expresa una opinión con motivo; ยกตัวอย่างเช่น señala evidencia concreta.", [("ฉันคิดว่าการอ่านข่าวหลายแหล่งสำคัญ เพราะช่วยให้เห็นหลายมุมมอง", "Creo que es importante leer noticias de varias fuentes porque ayuda a ver distintas perspectivas.", "I think it is important to read news from several sources because it shows different viewpoints."), ("อย่างไรก็ตาม ควรตรวจสอบข้อมูลก่อนแบ่งปัน", "Sin embargo, conviene comprobar la información antes de compartirla.", "However, information should be checked before sharing."), ("ยกตัวอย่างเช่น โรงเรียนอาจจัดกิจกรรมแลกเปลี่ยนความคิดเห็น", "Por ejemplo, una escuela puede organizar un intercambio de opiniones.", "For example, a school could hold an opinion-sharing activity.")]),
        ],
    },
    {
        "chula": "Superior", "es": "Superior · textos complejos y discurso", "tpa": "T4 · Advanced",
        "desde": 172, "cantidad": 56,
        "objetivo": "Seguir textos largos y complejos, incluso a mayor velocidad; conectar datos e inferir matices; escribir textos de varios párrafos y participar en discusiones formales.",
        "tareas": "noticias y artículos, datos y argumentos, inferencias contextuales, síntesis, discusión formal e informal y escritura organizada",
        "temas": [
            tema("Economía cotidiana y empleo", [("ค่าครองชีพ", "coste de vida"), ("รายได้", "ingresos"), ("ตลาดแรงงาน", "mercado laboral"), ("แนวโน้ม", "tendencia")], "ในขณะที่ compara procesos simultáneos; ส่งผลให้ presenta una consecuencia en un registro explicativo.", [("ค่าครองชีพเพิ่มขึ้นในขณะที่รายได้ของบางครัวเรือนคงที่", "El coste de vida aumenta mientras los ingresos de algunos hogares permanecen estables.", "The cost of living is rising while some households' income remains stable."), ("แนวโน้มดังกล่าวส่งผลให้คนทำงานปรับพฤติกรรมการใช้จ่าย", "La tendencia lleva a los trabajadores a ajustar sus gastos.", "This trend leads workers to adjust their spending."), ("รายงานเปรียบเทียบข้อมูลจากตลาดแรงงานหลายช่วงเวลา", "El informe compara datos del mercado laboral de distintos periodos.", "The report compares labour-market data across several periods.")]),
            tema("Política pública y servicios", [("นโยบาย", "política pública"), ("งบประมาณ", "presupuesto"), ("ดำเนินการ", "llevar a cabo"), ("ประเมินผล", "evaluar resultados")], "ทั้ง…และ… agrupa elementos; ก่อนที่จะ… señala una etapa previa a una decisión o medida.", [("นโยบายนี้มุ่งพัฒนาทั้งการเดินทางและคุณภาพชีวิต", "Esta política busca mejorar tanto el transporte como la calidad de vida.", "This policy aims to improve both transport and quality of life."), ("หน่วยงานจะประเมินผลก่อนที่จะขยายโครงการ", "La entidad evaluará los resultados antes de ampliar el programa.", "The agency will evaluate the results before expanding the programme."), ("การดำเนินการต้องสอดคล้องกับงบประมาณที่มีอยู่", "La aplicación debe ajustarse al presupuesto disponible.", "Implementation must fit the available budget.")]),
            tema("Salud, evidencia y decisiones", [("หลักฐาน", "evidencia"), ("ความเสี่ยง", "riesgo"), ("ผู้เชี่ยวชาญ", "especialista"), ("ข้อจำกัด", "limitación")], "ข้อมูลชี้ว่า… atribuye una conclusión a los datos; aunque se hable de evidencia, hay que indicar sus límites.", [("ข้อมูลชี้ว่าการป้องกันช่วยลดความเสี่ยงได้", "Los datos indican que la prevención puede reducir el riesgo.", "The data indicate that prevention can reduce risk."), ("ผู้เชี่ยวชาญเตือนว่าหลักฐานยังมีข้อจำกัด", "Los especialistas advierten que la evidencia aún tiene limitaciones.", "Experts caution that the evidence still has limitations."), ("ก่อนตัดสินใจ ควรพิจารณาประโยชน์และผลข้างเคียง", "Antes de decidir, conviene considerar los beneficios y los efectos secundarios.", "Before deciding, benefits and side effects should be considered.")]),
            tema("Medios digitales y calidad de información", [("แหล่งข่าว", "fuente informativa"), ("ตรวจสอบ", "verificar"), ("เผยแพร่", "difundir"), ("น่าเชื่อถือ", "fiable")], "ไม่เพียงแต่…แต่ยัง… añade un segundo aspecto; para valorar una fuente se distingue dato confirmado de interpretación.", [("ผู้ใช้ควรตรวจสอบแหล่งข่าวก่อนเผยแพร่ข้อมูล", "Los usuarios deberían comprobar la fuente antes de difundir información.", "Users should check the source before sharing information."), ("บทความนี้ไม่เพียงแต่รายงานเหตุการณ์ แต่ยังวิเคราะห์สาเหตุ", "Este artículo no solo informa del suceso, sino que también analiza sus causas.", "This article not only reports the event but also analyses its causes."), ("แม้ข้อความจะน่าเชื่อถือ แต่ยังควรตรวจสอบที่มา", "Aunque el mensaje parezca fiable, conviene comprobar su procedencia.", "Even if the message appears reliable, its origin should be checked.")]),
            tema("Ciudad, clima y planificación", [("โครงสร้างพื้นฐาน", "infraestructura"), ("น้ำท่วม", "inundación"), ("การระบายน้ำ", "drenaje"), ("ระยะยาว", "a largo plazo")], "หาก…ย่อม… relaciona condición y consecuencia probable en estilo formal; a menudo aparece en explicaciones de planificación.", [("หากระบบระบายน้ำไม่เพียงพอ ย่อมเกิดปัญหาน้ำท่วมซ้ำ", "Si el drenaje es insuficiente, es probable que se repitan las inundaciones.", "If drainage is insufficient, flooding is likely to recur."), ("การวางแผนระยะยาวต้องคำนึงถึงสภาพอากาศ", "La planificación a largo plazo debe tener en cuenta el clima.", "Long-term planning must take the climate into account."), ("โครงสร้างพื้นฐานที่ดีช่วยให้เมืองรับมือกับความเสี่ยงได้", "Una buena infraestructura ayuda a la ciudad a afrontar los riesgos.", "Good infrastructure helps a city respond to risks.")]),
            tema("Informes, datos y síntesis", [("ผลการศึกษา", "resultados del estudio"), ("แนวโน้ม", "tendencia"), ("โดยรวม", "en conjunto"), ("ข้อสรุป", "conclusión")], "โดยรวม introduce una síntesis; จากข้อมูล…จึง… permite enlazar evidencia y conclusión sin presentar opinión como dato.", [("โดยรวม ผลการศึกษาพบว่าแนวโน้มเปลี่ยนแปลงอย่างช้า ๆ", "En conjunto, el estudio encuentra que la tendencia cambia lentamente.", "Overall, the study finds that the trend is changing gradually."), ("จากข้อมูลสองช่วงเวลา จึงยังสรุปสาเหตุไม่ได้", "Con datos de solo dos periodos, aún no se puede concluir la causa.", "With data from only two periods, the cause cannot yet be concluded."), ("ข้อสรุปควรสะท้อนทั้งผลลัพธ์และข้อจำกัด", "La conclusión debería reflejar tanto los resultados como las limitaciones.", "The conclusion should reflect both the findings and the limitations.")]),
            tema("Reuniones, negociación y acuerdos", [("ประเด็น", "asunto"), ("เงื่อนไข", "condición"), ("ประนีประนอม", "llegar a un compromiso"), ("ข้อตกลง", "acuerdo")], "ในเบื้องต้น plantea una propuesta; หากเป็นไปได้ suaviza una petición; a cambio expresa reciprocidad.", [("ในเบื้องต้น เราเสนอให้ทดลองโครงการสามเดือน", "Como primer paso, proponemos probar el programa durante tres meses.", "As a first step, we propose a three-month pilot."), ("หากเป็นไปได้ ขอปรับกำหนดการให้เหมาะกับทุกฝ่าย", "Si fuera posible, quisiéramos ajustar el calendario para todas las partes.", "If possible, we would like to adjust the schedule to suit all parties."), ("ทั้งสองฝ่ายประนีประนอมจนได้ข้อตกลง", "Ambas partes llegaron a un compromiso y alcanzaron un acuerdo.", "Both sides compromised and reached an agreement.")]),
            tema("Ensayo de opinión y estructura", [("ข้อโต้แย้ง", "argumento"), ("ย่อหน้า", "párrafo"), ("สนับสนุน", "respaldar"), ("หักล้าง", "refutar")], "Un texto argumentativo puede presentar postura, razones, evidencia, objeción y conclusión; อย่างไรก็ดี introduce una reserva formal.", [("ประเด็นสำคัญคือการเข้าถึงบริการอย่างเท่าเทียม", "El punto central es el acceso equitativo a los servicios.", "The central issue is equal access to services."), ("หลักฐานนี้สนับสนุนข้อโต้แย้ง แต่ยังไม่หักล้างทุกข้อสงสัย", "Esta evidencia respalda el argumento, aunque no refuta todas las dudas.", "This evidence supports the argument but does not refute every concern."), ("อย่างไรก็ดี ข้อสรุปควรคำนึงถึงผลกระทบระยะยาว", "Sin embargo, la conclusión debe considerar los efectos a largo plazo.", "Nevertheless, the conclusion should consider long-term effects.")]),
        ],
    },
    {
        "chula": "Distinguished", "es": "Distinguished · dominio matizado", "tpa": None,
        "desde": 228, "cantidad": 54,
        "objetivo": "Interpretar significado implícito, tono y referencias socioculturales; comprender estilos diversos y textos abstractos; persuadir, negociar y escribir con voz y registro adecuados.",
        "tareas": "inferencia e ironía, artículos abstractos, discurso cultural, argumentación persuasiva, mediación y producción extensa",
        "temas": [
            tema("Tono, cortesía y significado implícito", [("น้ำเสียง", "tono de voz"), ("เกรงใจ", "consideración para no incomodar"), ("นัย", "implicación"), ("ประชด", "ironía; sarcasmo")], "El significado social depende de palabras, relación y entonación. Conviene distinguir petición directa, indirecta e ironía por contexto.", [("คำตอบสั้น ๆ อาจแสดงความเกรงใจ ไม่ใช่การปฏิเสธ", "Una respuesta breve puede expresar consideración, no rechazo.", "A short answer may show consideration, not refusal."), ("น้ำเสียงทำให้ประโยคเดียวกันมีนัยต่างกัน", "La entonación puede dar distintos matices a la misma frase.", "Intonation can give the same sentence different implications."), ("ผู้ฟังต้องพิจารณาบริบทก่อนตีความว่าเป็นการประชด", "El oyente debe considerar el contexto antes de interpretarlo como ironía.", "Listeners should consider context before interpreting it as sarcasm.")]),
            tema("Humor, modismos y referencias culturales", [("สำนวน", "modismo"), ("มุก", "broma; remate"), ("ล้อเล่น", "bromear"), ("บริบท", "contexto")], "Las expresiones figuradas no siempre se interpretan literalmente. La relación entre interlocutores permite diferenciar humor compartido de descortesía.", [("สำนวนนี้ไม่ได้หมายความตามตัวอักษร", "Este modismo no significa literalmente lo que dice.", "This idiom is not meant literally."), ("เขาพูดล้อเล่น แต่ผู้ฟังบางคนไม่เข้าใจมุก", "Estaba bromeando, pero algunos oyentes no entendieron el remate.", "He was joking, but some listeners did not understand the punchline."), ("บริบททางวัฒนธรรมช่วยอธิบายความหมายแฝง", "El contexto cultural ayuda a explicar el sentido implícito.", "Cultural context helps explain the implied meaning.")]),
            tema("Persuasión y recursos retóricos", [("โน้มน้าว", "persuadir"), ("จุดยืน", "postura"), ("น้ำหนัก", "peso; fuerza"), ("ข้อคัดค้าน", "objeción")], "การยอมรับว่า…ก่อนชี้ให้เห็นว่า… puede reconocer una objeción y luego responder; this structures a nuanced case.", [("การยอมรับข้อคัดค้านก่อนช่วยให้การโต้แย้งมีน้ำหนัก", "Reconocer primero la objeción da más fuerza al argumento.", "Acknowledging the objection first gives the argument more weight."), ("ผู้พูดชี้แจงจุดยืนโดยอ้างทั้งข้อมูลและผลกระทบต่อชุมชน", "La ponente aclara su postura citando datos y efectos en la comunidad.", "The speaker clarifies her position using data and community impact."), ("เป้าหมายไม่ใช่เพียงเอาชนะ แต่คือโน้มน้าวอย่างมีเหตุผล", "El objetivo no es solo vencer, sino persuadir con razones.", "The aim is not merely to win, but to persuade through reason.")]),
            tema("Editoriales, política y voces contrapuestas", [("บทบรรณาธิการ", "editorial"), ("จุดยืน", "postura"), ("ฝ่าย", "parte; bando"), ("ตีความ", "interpretar")], "Al resumir opiniones contrapuestas, separa la afirmación de cada parte y atribuye la interpretación a quien la sostiene.", [("บทบรรณาธิการตั้งคำถามต่อวิธีที่ทั้งสองฝ่ายตีความข้อมูล", "El editorial cuestiona cómo interpretan los datos ambas partes.", "The editorial questions how both sides interpret the data."), ("ฝ่ายหนึ่งเห็นว่ามาตรการเร่งด่วน แต่อีกฝ่ายห่วงผลระยะยาว", "Una parte considera urgente la medida; la otra teme sus efectos a largo plazo.", "One side sees the measure as urgent; the other worries about long-term effects."), ("ผู้เขียนแยกข้อเท็จจริงออกจากข้อเสนอเชิงนโยบาย", "El autor distingue los hechos de las propuestas políticas.", "The author separates facts from policy proposals.")]),
            tema("Lectura académica y conceptos abstractos", [("กรอบแนวคิด", "marco conceptual"), ("สมมติฐาน", "hipótesis"), ("ความสัมพันธ์", "relación"), ("ตีความ", "interpretar")], "Al exponer una investigación se distinguen marco conceptual, hipótesis, evidencia y límites; การตีความ no equivale al dato observado.", [("กรอบแนวคิดนี้อธิบายความสัมพันธ์ระหว่างภาษาและอัตลักษณ์", "Este marco conceptual explica la relación entre lengua e identidad.", "This framework explains the relationship between language and identity."), ("ผลที่พบสอดคล้องกับสมมติฐานเพียงบางส่วน", "Los resultados coinciden solo parcialmente con la hipótesis.", "The findings support the hypothesis only in part."), ("การตีความข้อมูลต้องคำนึงถึงข้อจำกัดของวิธีวิจัย", "La interpretación de los datos debe considerar las limitaciones metodológicas.", "Data interpretation must consider methodological limitations.")]),
            tema("Mediación y negociación compleja", [("ประนีประนอม", "mediar; llegar a compromiso"), ("ผลประโยชน์", "interés"), ("ข้อแลกเปลี่ยน", "concesión recíproca"), ("ฉันทามติ", "consenso")], "แทนที่จะ…กลับ… corrige una interpretación o reformula el contraste; a fin de alcanzar… expresa objetivo compartido.", [("แทนที่จะมองว่าเป็นการแพ้ชนะ เราควรหาจุดร่วม", "En vez de verlo como una victoria o derrota, deberíamos buscar puntos en común.", "Rather than seeing this as win or lose, we should find common ground."), ("ทั้งสองฝ่ายยอมรับข้อแลกเปลี่ยนเพื่อให้บรรลุฉันทามติ", "Ambas partes aceptaron concesiones para alcanzar un consenso.", "Both sides accepted trade-offs to reach consensus."), ("ผู้ไกล่เกลี่ยสรุปผลประโยชน์ร่วมก่อนเสนอทางเลือก", "La mediadora resumió los intereses comunes antes de proponer opciones.", "The mediator summarized shared interests before proposing options.")]),
            tema("Registro, audiencia y voz propia", [("ทำเนียบภาษา", "registro lingüístico"), ("ผู้ฟัง", "audiencia"), ("ถ้อยคำ", "elección de palabras"), ("น้ำหนักความหมาย", "matiz de significado")], "La elección de léxico, cortesía y estructura se adapta a propósito y audiencia; una paráfrasis puede conservar la idea y cambiar el registro.", [("ผู้เขียนปรับถ้อยคำให้เหมาะกับผู้อ่านแต่ละกลุ่ม", "La autora adapta sus palabras a cada grupo de lectores.", "The writer adjusts her wording for each audience."), ("ใจความเดิมยังอยู่ แม้เปลี่ยนทำเนียบภาษา", "La idea central se conserva aunque cambie el registro.", "The core meaning remains even when the register changes."), ("การเลือกคำอาจเปลี่ยนน้ำหนักความหมายโดยไม่เปลี่ยนข้อเท็จจริง", "La elección de palabras puede cambiar el matiz sin cambiar los hechos.", "Word choice can shift nuance without changing the facts.")]),
            tema("Síntesis, traducción y evaluación de fuentes", [("สังเคราะห์", "sintetizar"), ("แหล่งข้อมูล", "fuente"), ("อคติ", "sesgo"), ("ความน่าเชื่อถือ", "fiabilidad")], "Una síntesis conserva la postura y los matices esenciales de varias fuentes, señala discrepancias y evita atribuir a una fuente lo que infiere quien resume.", [("แหล่งข้อมูลทั้งสองเห็นตรงกันในข้อเท็จจริง แต่ต่างกันในการตีความ", "Las dos fuentes coinciden en los hechos, pero difieren en la interpretación.", "Both sources agree on the facts but differ in interpretation."), ("ผู้สรุปควรระบุอคติที่อาจมีและระดับความน่าเชื่อถือ", "Quien resume debería indicar posibles sesgos y el grado de fiabilidad.", "A summary should identify possible bias and the degree of reliability."), ("การแปลที่ดีรักษาน้ำเสียงและเจตนา ไม่ใช่เพียงความหมายตรงตัว", "Una buena traducción conserva el tono y la intención, no solo el sentido literal.", "Good translation preserves tone and intent, not only literal meaning.")]),
        ],
    },
]


SESIONES = [
    ("Vocabulario esencial", "Vocabulario"),
    ("Lectura y ortografía", "Lectura de palabras"),
    ("Estructura y patrón", "Gramática en contexto"),
    ("Comprensión auditiva", "Escucha"),
    ("Lectura contextual", "Comprensión lectora"),
    ("Escritura guiada", "Producción escrita"),
    ("Conversación integrada", "Producción oral"),
]
TRADUCCIONES_EN = {
    "hola": "hello", "gracias": "thank you", "perdón": "excuse me; sorry", "adiós": "goodbye",
    "nombre; llamarse": "name; to be called", "yo": "I; me", "yo; forma masculina cortés": "I; polite masculine form",
    "país": "country", "uno": "one", "dos": "two", "tres": "three", "edad": "age",
    "padre": "father", "madre": "mother", "hermano/a mayor": "older sibling", "hermano/a menor": "younger sibling",
    "arroz; comida": "rice; food", "agua": "water", "pollo": "chicken", "picante": "spicy",
    "esto": "this", "eso": "that", "precio": "price", "cuánto": "how much", "dónde": "where",
    "baño": "restroom", "seguir recto": "go straight", "izquierda": "left", "comer": "eat",
    "beber": "drink", "dormir": "sleep", "necesitar; querer": "need; want", "horario": "schedule",
    "cita": "appointment", "mañana": "morning", "semana": "week", "tren": "train", "autobús": "bus",
    "estación": "station", "cambiar; hacer transbordo": "change; transfer", "hotel": "hotel", "reservar": "book; reserve",
    "habitación": "room", "maleta": "suitcase", "recibo": "receipt", "devolver": "return", "cambiar un producto": "exchange an item",
    "estropeado": "broken", "dolor de cabeza": "headache", "fiebre": "fever", "medicina": "medicine", "descansar": "rest",
    "reunirse; reunión": "meet; meeting", "deberes": "homework", "entregar; enviar": "submit; send", "explicar": "explain",
    "tener tiempo libre": "have free time", "leer": "read", "hacer ejercicio": "exercise", "gustar": "like",
    "llover": "rain", "tiempo; clima": "weather; climate", "caluroso": "hot", "divertido": "fun",
    "experiencia": "experience", "suceso": "event", "finalmente": "finally", "después": "afterwards",
    "propuesta": "proposal", "agenda": "agenda", "ser responsable de": "be responsible for", "cooperar": "cooperate",
    "oficina": "office", "documento": "document", "presentar una solicitud": "submit an application", "funcionario/a": "public official",
    "noticia": "news item", "ciudadanía": "the public", "situación": "situation", "impacto": "impact",
    "cultura": "culture", "comunidad": "community", "tradición": "tradition", "transmitir; perpetuar": "pass on; preserve",
    "prevenir": "prevent", "síntoma": "symptom", "recomendación": "recommendation", "regularmente": "regularly",
    "medioambiente": "environment", "residuos": "waste", "reducir": "reduce", "recursos": "resources",
    "opinión": "opinion", "razón": "reason", "ejemplo": "example", "sin embargo": "however",
    "coste de vida": "cost of living", "ingresos": "income", "mercado laboral": "labour market", "tendencia": "trend",
    "política pública": "public policy", "presupuesto": "budget", "llevar a cabo": "carry out", "evaluar resultados": "evaluate results",
    "evidencia": "evidence", "riesgo": "risk", "especialista": "specialist", "limitación": "limitation",
    "fuente informativa": "news source", "verificar": "verify", "difundir": "share; disseminate", "fiable": "reliable",
    "infraestructura": "infrastructure", "inundación": "flood", "drenaje": "drainage", "a largo plazo": "long-term",
    "resultados del estudio": "study findings", "en conjunto": "overall", "conclusión": "conclusion", "asunto": "issue",
    "condición": "condition", "llegar a un compromiso": "compromise", "acuerdo": "agreement",
    "argumento": "argument", "párrafo": "paragraph", "respaldar": "support", "refutar": "refute",
    "tono de voz": "tone of voice", "consideración para no incomodar": "consideration for others", "implicación": "implication", "ironía; sarcasmo": "irony; sarcasm",
    "modismo": "idiom", "broma; remate": "joke; punchline", "bromear": "joke", "contexto": "context",
    "persuadir": "persuade", "postura": "position", "peso; fuerza": "weight; strength", "objeción": "objection",
    "editorial": "editorial", "parte; bando": "side; party", "interpretar": "interpret",
    "marco conceptual": "conceptual framework", "hipótesis": "hypothesis", "relación": "relationship",
    "mediar; llegar a compromiso": "mediate; reach a compromise", "interés": "interest", "concesión recíproca": "trade-off", "consenso": "consensus",
    "registro lingüístico": "register", "audiencia": "audience", "elección de palabras": "word choice", "matiz de significado": "nuance",
    "sintetizar": "synthesize", "fuente": "source", "sesgo": "bias", "fiabilidad": "reliability",
}
ES_EN = {
    "Novice": "Novice", "Intermediate": "Intermediate", "Advanced": "Advanced",
    "Superior": "Superior", "Distinguished": "Distinguished",
}
TEMAS_EN = {
    "Saludos y fórmulas de cortesía": "Greetings and polite expressions", "Nombre, país y presentación": "Names, countries and introductions",
    "Números, edad y datos básicos": "Numbers, age and basic details", "Familia y personas cercanas": "Family and close relationships",
    "Comida y pedidos sencillos": "Food and simple orders", "Compras y precios": "Shopping and prices",
    "Lugares y direcciones básicas": "Places and basic directions", "Rutina y necesidades inmediatas": "Routines and immediate needs",
    "Horarios, citas y rutina semanal": "Schedules, appointments and weekly routines", "Transporte y desplazamientos": "Transport and getting around",
    "Viaje y alojamiento": "Travel and accommodation", "Servicios y devoluciones": "Services and returns",
    "Salud y síntomas cotidianos": "Health and everyday symptoms", "Estudios y trabajo diario": "Study and everyday work",
    "Aficiones y actividades de ocio": "Hobbies and leisure activities", "Tiempo, clima y experiencias": "Weather, climate and experiences",
    "Relatar una experiencia y ordenar hechos": "Telling an experience and ordering events", "Comunicación profesional y reuniones": "Professional communication and meetings",
    "Ciudad, trámites y servicios públicos": "The city, paperwork and public services", "Noticias y asuntos sociales": "News and social issues",
    "Educación, cultura y comunidad": "Education, culture and community", "Salud pública y recomendaciones": "Public health and recommendations",
    "Medioambiente y hábitos sostenibles": "The environment and sustainable habits", "Opiniones con razones y ejemplos": "Opinions with reasons and examples",
    "Economía cotidiana y empleo": "Everyday economics and employment", "Política pública y servicios": "Public policy and services",
    "Salud, evidencia y decisiones": "Health, evidence and decisions", "Medios digitales y calidad de información": "Digital media and information quality",
    "Ciudad, clima y planificación": "Cities, climate and planning", "Informes, datos y síntesis": "Reports, data and synthesis",
    "Reuniones, negociación y acuerdos": "Meetings, negotiation and agreements", "Ensayo de opinión y estructura": "Opinion essays and structure",
    "Tono, cortesía y significado implícito": "Tone, politeness and implied meaning", "Humor, modismos y referencias culturales": "Humour, idioms and cultural references",
    "Persuasión y recursos retóricos": "Persuasion and rhetorical devices", "Editoriales, política y voces contrapuestas": "Editorials, politics and opposing views",
    "Lectura académica y conceptos abstractos": "Academic reading and abstract concepts", "Mediación y negociación compleja": "Mediation and complex negotiation",
    "Registro, audiencia y voz propia": "Register, audience and individual voice", "Síntesis, traducción y evaluación de fuentes": "Synthesis, translation and source evaluation",
}
SESIONES_EN = {
    "Vocabulario esencial": "Essential vocabulary", "Lectura y ortografía": "Reading and spelling",
    "Estructura y patrón": "Sentence structure and patterns", "Comprensión auditiva": "Listening comprehension",
    "Lectura contextual": "Reading in context", "Escritura guiada": "Guided writing", "Conversación integrada": "Integrated conversation",
}
OBJETIVOS_EN = {
    "Novice": "Recognize common words and memorized expressions, understand short and clear speech, and produce brief, practised sentences.",
    "Intermediate": "Understand the main idea and details in simple everyday exchanges, write short paragraphs, and sustain a face-to-face conversation.",
    "Advanced": "Follow clear speech at a normal pace, read short texts on familiar topics, narrate events, and support opinions with reasons.",
    "Superior": "Follow long, complex texts, infer meaning from context, synthesize information, write organized multi-paragraph texts, and discuss formal topics.",
    "Distinguished": "Interpret implied meaning, tone, and cultural references; understand abstract texts and varied styles; persuade, negotiate, and write with a deliberate voice.",
}


def json_l10n(es, en=None):
    return {"@es": es, "@en": en or es}


def id_ejercicio(numero, n):
    return f"th{numero:03d}-{n}"


def objetivos():
    salida = []
    for tramo in TRAMOS:
        for modulo in tramo["temas"]:
            for titulo_sesion, destreza in SESIONES:
                salida.append((tramo, modulo, titulo_sesion, destreza))
                if sum(1 for o in salida if o[0] is tramo) >= tramo["cantidad"]:
                    break
            if sum(1 for o in salida if o[0] is tramo) >= tramo["cantidad"]:
                break
    return salida


def titulo_leccion(tramo, modulo, titulo_sesion):
    return f"{tramo['chula']} · {modulo['nombre']}: {titulo_sesion}"


def crear_vocabulario(modulo):
    return {
        thai: {"es": es, "en": TRADUCCIONES_EN.get(es, es), "consejo": json_l10n("Practica la palabra dentro de una frase y fíjate en el tono.", "Practise the word in a sentence and listen for its tone.")}
        for thai, es in modulo["palabras"]
    }


def explicacion(tramo, modulo, destreza):
    es = f"Objetivo: {tramo['objetivo']} En este tema: {modulo['regla']} Practica especialmente la destreza «{destreza.lower()}»."
    en = f"Goal: {OBJETIVOS_EN[tramo['chula']]} Study the patterns in the examples, notice word order and politeness, then practise {destreza.lower()}."
    return {"tipo": "explicacion", "titulo": json_l10n(f"{destreza}: {modulo['nombre']}", f"{destreza}: {TEMAS_EN[modulo['nombre']]}") , "texto": [json_l10n(es, en)]}


def dialogo(modulo, numero):
    a, b, c = modulo["ejemplos"]
    return {
        "tipo": "dialogo", "titulo": json_l10n("Escucha y responde", "Listen and respond"),
        "frases": [
            {"quien": "Mali", "th": a[0], "es": a[1], "en": a[2]},
            {"quien": "Luis", "th": b[0], "es": b[1], "en": b[2]},
            {"quien": "Mali", "th": c[0], "es": c[1], "en": c[2]},
        ],
    }


def ejercicio_test(numero, n, pregunta, opciones, audio=None):
    return {
        "tipo": "test", "pregunta": json_l10n(pregunta, question_en(pregunta)),
        "id": id_ejercicio(numero, n), **({"audio": audio} if audio else {}),
        "opciones": [
            {"texto": json_l10n(es, en), "explicacion": json_l10n(exp, exp_en), **({"correcta": True} if correcta else {})}
            for es, en, exp, exp_en, correcta in opciones
        ],
    }


def question_en(es):
    # Keep prompts understandable for an English-interface learner; the target
    # Thai language remains the main exercise content.
    traducciones = {
        "¿Qué significa esta palabra?": "What does this word mean?",
        "¿Qué frase expresa la misma idea?": "Which sentence expresses the same idea?",
        "Escucha y elige el significado.": "Listen and choose the meaning.",
        "¿Cuál es la idea principal?": "What is the main idea?",
        "¿Qué opción completa correctamente la frase?": "Which option correctly completes the sentence?",
        "Lee y elige la respuesta adecuada.": "Read and choose the appropriate answer.",
    }
    return traducciones.get(es, es)


def construir_leccion(numero, tramo, modulo, titulo_sesion, destreza):
    palabras = crear_vocabulario(modulo)
    v = [(thai, es, TRADUCCIONES_EN.get(es, es)) for thai, es in modulo["palabras"]]
    ejemplos = modulo["ejemplos"]
    titulo = titulo_leccion(tramo, modulo, titulo_sesion)
    titulo_en = f"{tramo['chula']} · {TEMAS_EN[modulo['nombre']]}: {SESIONES_EN[titulo_sesion]}"
    clave = v[(numero + len(titulo_sesion)) % len(v)]
    distractores = [x for x in v if x != clave][:2]
    frase = ejemplos[(numero + 1) % len(ejemplos)]
    otra_frase = ejemplos[(numero + 2) % len(ejemplos)]
    tercera_frase = ejemplos[numero % len(ejemplos)]
    opciones = [
        (clave[1], TRADUCCIONES_EN.get(clave[1], clave[1]), f"{clave[0]} significa «{clave[1]}».", f"{clave[0]} means “{TRADUCCIONES_EN.get(clave[1], clave[1])}”.", True),
        (distractores[0][1], TRADUCCIONES_EN.get(distractores[0][1], distractores[0][1]), f"Eso significa «{distractores[0][1]}».", f"That means “{TRADUCCIONES_EN.get(distractores[0][1], distractores[0][1])}”.", False),
        (distractores[1][1], TRADUCCIONES_EN.get(distractores[1][1], distractores[1][1]), f"Eso significa «{distractores[1][1]}».", f"That means “{TRADUCCIONES_EN.get(distractores[1][1], distractores[1][1])}”.", False),
    ]
    ex = [
        ejercicio_test(numero, 1, "¿Qué significa esta palabra?", opciones, audio=clave[0] if destreza == "Escucha" else None),
        {
            "tipo": "traduccion", "pregunta": json_l10n("Lee la frase y elige su significado.", "Read the sentence and choose its meaning."),
            "frase": frase[0], "id": id_ejercicio(numero, 2),
            "opciones": [
                {"texto": json_l10n(frase[1], frase[2]), "explicacion": json_l10n("La traducción corresponde a la frase tailandesa.", "This translation matches the Thai sentence."), "correcta": True},
                {"texto": json_l10n(otra_frase[1], otra_frase[2]), "explicacion": json_l10n("Esta es otra frase del mismo tema.", "This is another sentence from the same topic.")},
                {"texto": json_l10n(tercera_frase[1], tercera_frase[2]), "explicacion": json_l10n("Esta frase expresa otra idea del mismo tema.", "This sentence expresses another idea from the same topic.")},
            ],
        },
        {
            "tipo": "huecos", "pregunta": json_l10n(f"Completa la frase tailandesa que expresa «{frase[1]}».", f"Complete the Thai sentence that means “{frase[2]}”."),
            "frase": "___", "id": id_ejercicio(numero, 3),
            "opciones": [
                {"texto": frase[0], "explicacion": json_l10n(frase[1], frase[2]), "correcta": True},
                {"texto": otra_frase[0], "explicacion": json_l10n("La frase tiene otro significado.", "This sentence has a different meaning.")},
                {"texto": tercera_frase[0], "explicacion": json_l10n("Esta opción expresa otra idea.", "This option expresses a different idea.")},
            ],
        },
        {
            "tipo": "ordenar", "pregunta": json_l10n("Ordena las partes para reconstruir la frase.", "Put the parts in order to rebuild the sentence."),
            "frase": phrase_for_order(frase[0], modulo), "traduccion": json_l10n(frase[1], frase[2]),
            "explicacion": json_l10n("Lee el orden completo y comprueba cómo expresa esta idea.", "Read the complete sequence and check how it expresses this idea."),
            "id": id_ejercicio(numero, 4),
        },
    ]
    bloque_dialogo = dialogo(modulo, numero)
    bloque_texto = {
        "tipo": "texto", "titulo": json_l10n("Texto breve", "Short text"),
        "frases": [{"th": x[0], "es": x[1], "en": x[2]} for x in ejemplos],
    }
    respuesta = ejemplos[(numero + 2) % len(ejemplos)][0]
    consignas_es = {
        "Novice": f"Escribe una o dos frases breves sobre «{modulo['nombre']}». Puedes usar las palabras clave y una fórmula de cortesía.",
        "Intermediate": f"Escribe un párrafo corto de tres o cuatro frases sobre «{modulo['nombre']}». Ordena la información con claridad.",
        "Advanced": f"Escribe un párrafo coherente sobre «{modulo['nombre']}»: relata un hecho o explica tu opinión y apóyala con una razón.",
        "Superior": f"Escribe un texto organizado de varios párrafos sobre «{modulo['nombre']}». Resume la información, explica sus consecuencias y añade una valoración matizada.",
        "Distinguished": f"Redacta un ensayo de opinión de unas 250 palabras sobre «{modulo['nombre']}». Presenta una postura, reconoce una objeción, respáldate con razones y cierra con una conclusión persuasiva.",
    }
    consignas_en = {
        "Novice": f"Write one or two short sentences about “{TEMAS_EN[modulo['nombre']]}”. You may use the key words and a polite expression.",
        "Intermediate": f"Write a short paragraph of three or four sentences about “{TEMAS_EN[modulo['nombre']]}”. Order the information clearly.",
        "Advanced": f"Write a coherent paragraph about “{TEMAS_EN[modulo['nombre']]}”: narrate an event or explain your opinion and support it with a reason.",
        "Superior": f"Write an organized multi-paragraph text about “{TEMAS_EN[modulo['nombre']]}”. Summarize the information, explain its consequences, and add a nuanced evaluation.",
        "Distinguished": f"Write an opinion essay of about 250 words on “{TEMAS_EN[modulo['nombre']]}”. State a position, acknowledge an objection, support your case with reasons, and end with a persuasive conclusion.",
    }
    cierre_de_tramo = numero == tramo["desde"] + tramo["cantidad"] - 1
    if cierre_de_tramo:
        consignas_es[tramo["chula"]] = f"Simulacro de escritura CU-TFL: redacta un ensayo de opinión de unas 250 palabras sobre «{modulo['nombre']}». Ajusta vocabulario, organización y matices al tramo {tramo['chula']}; presenta una postura, razones y una conclusión."
        consignas_en[tramo["chula"]] = f"CU-TFL writing rehearsal: write an opinion essay of about 250 words on “{TEMAS_EN[modulo['nombre']]}”. Adapt vocabulary, organization and nuance to the {tramo['chula']} band; state a position, give reasons, and conclude."
    bloque_escribir = {
        "tipo": "escribir", "id": id_ejercicio(numero, 5),
        "pregunta": json_l10n(consignas_es[tramo["chula"]], consignas_en[tramo["chula"]]),
        "respuestas": [respuesta, ejemplos[0][0]],
        "explicacion": json_l10n("La primera respuesta es un modelo de inicio, no una respuesta única. Desarrolla la consigna y autoevalúa claridad, organización y adecuación al tramo.", "The first response is a possible opening, not a single required answer. Develop the task and self-assess clarity, organization and level appropriateness."),
        "autoevaluacion": True,
    }
    objetivo = f"{tramo['es']} · {destreza}"
    return {
        "capitulo": TRAMOS.index(tramo) + 1,
        "numero_curso": numero,
        "orden_curso": numero,
        "titulo_th": "ภาษาไทย",
        "titulo_es": json_l10n(titulo, titulo_en),
        "intro": json_l10n(f"{objetivo}. {tramo['objetivo']} Tema: {modulo['nombre']}.", f"{objetivo}. {OBJETIVOS_EN[tramo['chula']]} Topic: {TEMAS_EN[modulo['nombre']]}"),
        "palabras": palabras,
        "bloques": [explicacion(tramo, modulo, destreza), {"tipo": "vocabulario", "titulo": json_l10n("Palabras clave", "Key words"), "palabras": list(palabras)}, bloque_dialogo, bloque_texto, bloque_escribir, *ex],
    }


def phrase_for_order(texto, modulo):
    """Separa palabras reconocibles, sin partir sílabas al azar."""
    if " " in texto.strip():
        return texto
    lexicon = {w[0] for w in modulo["palabras"]}
    lexicon.update({"ฉัน", "ผม", "คุณ", "เรา", "เขา", "จะ", "แล้ว", "ไม่", "ได้", "ไหม", "ครับ", "ค่ะ", "และ", "แต่", "เพราะ", "ว่า", "จึง", "เมื่อ", "ก่อน", "หลังจาก", "เพื่อ", "ถ้า", "หาก", "ควร", "ต้อง", "มี", "อยู่", "ไป", "มา", "ใน", "ของ", "กับ", "ที่", "เป็น", "คือ", "ก็", "ยัง", "ทั้ง", "แม้ว่า", "อย่างไรก็ตาม", "โดยรวม", "กำลัง", "ให้", "จาก", "ถึง", "อีก"})
    tokens = sorted(lexicon, key=len, reverse=True)
    salida, i = [], 0
    while i < len(texto):
        coincidencia = next((w for w in tokens if texto.startswith(w, i)), None)
        if coincidencia:
            salida.append(coincidencia)
            i += len(coincidencia)
        else:
            inicio = i
            i += 1
            while i < len(texto) and not any(texto.startswith(w, i) for w in tokens):
                i += 1
            salida.append(texto[inicio:i])
    salida = [s for s in salida if s]
    if len(salida) < 2:
        # Una pregunta de orden necesita al menos dos bloques. Cuando la frase
        # carece de dos segmentos reconocibles, usa dos grupos completos del
        # vocabulario, nunca una división arbitraria dentro de una palabra.
        salida = [modulo["palabras"][0][0], modulo["palabras"][1][0]]
    return " ".join(salida)


def cargar_json(ruta, predeterminado):
    if ruta.exists():
        return json.loads(ruta.read_text(encoding="utf-8-sig"))
    return predeterminado


def escribir_json(ruta, dato):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(dato, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def actualizar_plan(lista):
    filas = [
        "# Plan curricular de tailandés orientado a TPA T-Test y CU-TFL",
        "",
        "El plan tiene 278 lecciones nuevas (004–281), además de las tres lecciones iniciales conservadas.",
        "Se organiza en las cinco bandas de desempeño publicadas por CU-TFL. TPA T1–T4 se usan como referencias didácticas para los cuatro primeros tramos; T5 queda excluido. Las instituciones no publican una equivalencia directa entre estas escalas, así que el pareo es curricular, no una certificación.",
        "",
        "El TPA T-Test evalúa lectura, escritura y escucha en tailandés escrito. Su ejemplo oficial muestra selección ortográfica, completar frases y párrafos, ordenar enunciados, completar conversaciones y comprender textos. CU-TFL evalúa escucha, lectura, escritura y conversación; el formato oficial incluye diálogos y noticias, anuncios y horarios, textos breves y artículos, un ensayo de opinión de 250 palabras y conversación, exposición y petición de información. El cierre de cada capítulo practica ese ensayo. Las preguntas de Paglot son originales y no reproducen ítems oficiales.",
        "",
        "## Hallazgos oficiales que guían el plan",
        "",
        "### TPA Thai Language Proficiency Test (T-Test)",
        "",
        "TPA informa cinco bandas de clasificación, sin resultado de aprobado/suspenso. Este plan utiliza solo T1 Beginner, T2 Elementary, T3 Intermediate y T4 Advanced; T5 queda fuera. El examen está escrito en caracteres tailandeses y la muestra oficial distribuye 36 ítems de escritura, 34 de lectura y 25 de escucha (95 ítems, 100 puntos). Escritura y lectura comparten 90 minutos; escucha, 30 minutos. La muestra incluye ortografía, selección de palabras/estructuras, completar y ordenar párrafos, completar diálogos, lectura de anuncios/textos y comprensión de contenido. TPA publica descripciones generales de los tramos, no un temario gramatical exhaustivo por nivel.",
        "",
        "| Nivel TPA incluido | Descripción oficial resumida | Aplicación curricular en Paglot |",
        "|---|---|---|",
        "| T1 · Beginner | Lee/escribe tailandés, entiende vocabulario y gramática básicos y produce oraciones cortas sobre la vida diaria. | Escritura tailandesa, palabras frecuentes, fórmulas sociales e intercambios breves. |",
        "| T2 · Elementary | Lee/escribe con fluidez, comprende vocabulario y gramática cotidianos, entiende bien la escucha y se comunica en situaciones diarias. | Comprensión de diálogos, avisos y horarios, párrafos sencillos y comunicación funcional. |",
        "| T3 · Intermediate | Comprende oraciones complejas y artículos generales de prensa/revistas; se comunica adecuadamente y usa tailandés en el trabajo. | Narración, lectura de actualidad conocida, información profesional y opiniones justificadas. |",
        "| T4 · Advanced | Procesa frases más complejas y temas económicos, políticos y sociales de prensa, revistas, televisión o radio; se desenvuelve con confianza en trabajo y vida cotidiana en Tailandia. | Síntesis, discusión formal, textos largos, matices e interpretación de información social. |",
        "",
        "### CU-TFL: alcance y formato",
        "",
        "CU-TFL informa un resultado por cada destreza rendida y no emite un simple aprobado/suspenso. Permite rendir todas las destrezas o solo algunas. Escucha: 50 preguntas de opción múltiple en una hora, con monólogos, diálogos, noticias/temas cotidianos y audios largos. Lectura: 50 preguntas en una hora, con letreros, horarios, textos cotidianos breves y textos largos como artículos, editoriales y opiniones. Escritura: un ensayo de opinión de 250 palabras en una hora. Habla: 40 minutos de conversación, exposición/descripción/opinión y preguntas para obtener información.",
        "",
        "### Descriptores CU-TFL por banda y destreza",
        "",
        "| Banda | Escucha | Lectura | Escritura | Habla |",
        "|---|---|---|---|---|",
        "| Novice | Palabras frecuentes, fórmulas memorizadas, preguntas e instrucciones breves con habla lenta y clara. | Reconoce letra impresa estándar, palabras y frases/patrones cotidianos básicos. | Produce palabras, frases y oraciones memorizadas, sin formar aún un párrafo cohesionado. | Se comunica con recursos limitados y expresiones aprendidas de memoria. |",
        "| Intermediate | Comprende enunciados, diálogos e historias breves sobre asuntos cercanos si el habla es clara y estándar. | Encuentra idea principal y detalles en textos cotidianos simples: personas, lugares, objetos e instrucciones. | Escribe un párrafo con frases sencillas sobre la vida diaria; la conexión y variedad aún son limitadas. | Mantiene intercambios cara a cara sobre la vida cotidiana y usa estrategias básicas para sostenerlos. |",
        "| Advanced | Capta la idea principal de habla clara a velocidad normal; los audios largos y complejos siguen siendo difíciles. | Comprende textos breves sobre temas conocidos, incluso con oraciones largas; infiere con contexto y experiencia. | Organiza un párrafo, relata hechos en orden y escribe descripciones, informes o explicaciones; practica conectores. | Conversa en registros formales e informales, cuenta hechos actuales y opina sobre temas familiares; sabe reformular. |",
        "| Superior | Sigue textos orales largos/complicados y habla más rápida, distingue detalles e interpreta implicaciones culturales. | Comprende lecturas largas y complejas, usa contexto para inferir significados implícitos. | Organiza varios párrafos, resume opiniones ajenas, añade la propia y enlaza ideas con claridad. | Conversa con fluidez en asuntos sociales, académicos y profesionales; explica, resume, supone y argumenta. |",
        "| Distinguished | Comprende distintos temas y estilos, matices de entonación, implicaciones, humor y referencias culturales, incluso con condiciones de escucha desfavorables. | Interpreta textos abstractos y sentidos implícitos, incluso modismos poco frecuentes o complejos, con contexto sociocultural. | Escribe distintos géneros con voz propia, persuade y ajusta léxico, estructura y registro al propósito y lector. | Habla con precisión y adecuación cultural, persuade, negocia, sostiene una postura y puede mediar informalmente. |",
        "",
        "### Cómo se usan ambas escalas",
        "",
        "Los capítulos corresponden a las cinco bandas CU-TFL. Los rótulos T1–T4 de TPA aparecen como referencias de preparación para los cuatro primeros capítulos, no como equivalencias certificadas. CU-TFL publica cinco bandas y TPA describe cinco clasificaciones; no se ha localizado una tabla oficial de correspondencia entre ambas. CU-TFL puede añadir «Plus» cuando el desempeño supera de manera irregular la base de una banda, pero aún no alcanza la siguiente. El capítulo Distinguished es preparación CU-TFL y no incorpora TPA T5. La progresión de actividades toma en cuenta que CU-TFL reporta cada destreza por separado, por lo que escuchar, leer, escribir y hablar aparecen a lo largo de todos los tramos.",
        "",
        "| Capítulo | Tramo CU-TFL | Referencia TPA incluida | Lecciones nuevas | Foco según descriptores oficiales |",
        "|---:|---|---|---:|---|",
    ]
    for n, tramo in enumerate(TRAMOS, 1):
        ultimo = tramo["desde"] + tramo["cantidad"] - 1
        tpa = tramo["tpa"] or "— (T5 excluido)"
        filas.append(f"| {n} | {tramo['chula']} | {tpa} | {tramo['desde']:03d}–{ultimo:03d} ({tramo['cantidad']}) | {tramo['objetivo']} |")
    filas.extend(["", "## Secuencia de lecciones", ""])
    for tramo, modulo, sesion, destreza in lista:
        numero = sum(1 for x in lista[:lista.index((tramo, modulo, sesion, destreza))]) + 4
        filas.append(f"- {numero:03d} · {tramo['chula']} · {modulo['nombre']} · {sesion} ({destreza})")
    filas.extend(["", "## Fuentes oficiales consultadas", "", "- TPA, niveles, estructura y ejemplos de prueba: https://www.tpa.or.th/slc/eng/course.php?lang=tt", "- TPA, instrucciones y prueba de ejemplo (PDF): https://tpa.or.th/slc/download/TPATLPT_TestInstructionsandExample.pdf", "- CU-TFL, destinatarios, competencias, formatos y bandas de rendimiento: https://www.sti.chula.ac.th/operation-service/thai-test/thai-test-for-non-native/cu-tfl-th/", "- CU-TFL, práctica oficial de lectura: https://www.sti.chula.ac.th/storage/Reading_Test/index.html", "- CU-TFL, descriptores de escucha: https://www.sti.chula.ac.th/wp-content/uploads/2021/01/Thai_test_CU-TFL_Listening.pdf", "- CU-TFL, descriptores de lectura: https://www.sti.chula.ac.th/wp-content/uploads/2021/01/Thai_test_CU-TFL_Reading.pdf", "- CU-TFL, descriptores de escritura: https://www.sti.chula.ac.th/wp-content/uploads/2021/01/Thai_test_CU-TFL_Writing.pdf", "- CU-TFL, descriptores de conversación: https://www.sti.chula.ac.th/wp-content/uploads/2019/11/Thai_test_CU-TFL_Speaking.pdf", ""])
    PLAN.write_text("\n".join(filas), encoding="utf-8")


def actualizar_diccionario():
    diccionario = cargar_json(DICCIONARIO, {})
    for numero in range(1, TOTAL + 1):
        leccion = cargar_json(LECCIONES / f"{numero:03d}.json", {})
        for thai, ficha in leccion.get("palabras", {}).items():
            if thai in diccionario:
                continue
            registro = {k: v for k, v in ficha.items() if k not in {"es", "en"}}
            registro["trad"] = {"es": ficha.get("es", thai), "en": ficha.get("en", ficha.get("es", thai))}
            registro["es"] = thai
            diccionario[thai] = registro
    escribir_json(DICCIONARIO, diccionario)
    return len(diccionario)


def main():
    lista = objetivos()
    if len(lista) != TOTAL - LECCIONES_INICIALES:
        raise SystemExit(f"El plan debe tener 278 objetivos; tiene {len(lista)}.")
    existentes = cargar_json(INDICE, {"version": 1, "lecciones": []})
    fichas = {e["id"]: e for e in existentes.get("lecciones", [])}
    hashes = cargar_json(MANIFIESTO, {})
    for i, (tramo, modulo, sesion, destreza) in enumerate(lista, start=4):
        ruta = LECCIONES / f"{i:03d}.json"
        actual = cargar_json(ruta, None)
        raw = ruta.read_bytes() if ruta.exists() else b""
        huella_actual = hashlib.sha256(raw).hexdigest() if raw else None
        titulo_actual = actual.get("titulo_es", {}) if isinstance(actual, dict) else {}
        era_generado = isinstance(titulo_actual, dict) and titulo_actual.get("@es") == titulo_leccion(tramo, modulo, sesion)
        sigue_sin_editarse = hashes.get(f"{i:03d}") == huella_actual if f"{i:03d}" in hashes else era_generado
        # Solo reemplaza borradores o lecciones generadas por este script que
        # sigan intactas según el manifiesto; preserva ediciones humanas.
        if actual is None or actual.get("borrador") is True or sigue_sin_editarse:
            leccion = construir_leccion(i, tramo, modulo, sesion, destreza)
            escribir_json(ruta, leccion)
            hashes[f"{i:03d}"] = hashlib.sha256(ruta.read_bytes()).hexdigest()
        else:
            leccion = actual
        identificador = f"{i:03d}"
        fichas[identificador] = {
            "id": identificador,
            "titulo_es": leccion["titulo_es"]["@es"],
            "titulo": leccion["titulo_es"],
            "capitulo": TRAMOS.index(tramo) + 1,
            "orden_curso": i,
            "numero_curso": i,
            "ejercicios": [[f"id|{id_ejercicio(i, k)}"] for k in range(1, 6)],
            "audio": 1,
        }
    # Refresca capítulo y orden de las lecciones previas sin alterar su contenido.
    for n in range(1, 4):
        p = LECCIONES / f"{n:03d}.json"
        data = cargar_json(p, {})
        data["capitulo"] = 1
        data["numero_curso"] = n
        data["orden_curso"] = n
        escribir_json(p, data)
    capitulos = [{
        "numero": i,
        "titulo_th": f"ภาษาไทยระดับ {tramo['chula']}",
        "titulo_es": json_l10n(tramo["es"], tramo["es"]),
        "descripcion": json_l10n(f"{tramo['tpa'] + ' · ' if tramo['tpa'] else ''}{tramo['objetivo']}", tramo["objetivo"]),
        "nivel": tramo["chula"],
    } for i, tramo in enumerate(TRAMOS, 1)]
    escribir_json(CAPITULOS, capitulos)
    escribir_json(INDICE, {"version": 1, "lecciones": [fichas[k] for k in sorted(fichas)]})
    palabras_indice = actualizar_diccionario()
    escribir_json(MANIFIESTO, hashes)
    actualizar_plan(lista)
    print(f"Lecciones generadas/actualizadas: {len(lista)}")
    print(f"Lecciones totales en el índice: {len(fichas)}")
    print("Tramos: " + ", ".join(f"{t['chula']}={t['cantidad']}" for t in TRAMOS))
    print(f"Entradas del diccionario: {palabras_indice}")
    print(f"Plan escrito: {PLAN}")


if __name__ == "__main__":
    main()
