// Genera las tres muestras originales de mandarín. Ejecutar desde cualquier carpeta.
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const raiz = fileURLToPath(new URL('../../../Idiomas/cursos/zh/', import.meta.url));
const palabra = (es,pron,cat='expresión',consejo) => ({es,pron,cat,...(consejo?{consejo}:{})});
const frase = (quien,zh,es,pron,analisis) => ({quien,zh,es,pron,analisis});
const explicar = (titulo,texto) => ({tipo:'explicacion',titulo,texto});
const test = (id,pregunta,opciones,correcta) => ({tipo:'test',id,pregunta,opciones,correcta});
const huecos = (id,frase,opciones,correcta) => ({tipo:'huecos',id,frase,opciones,correcta});
const escribir = (id,pregunta,respuestas,explicacion) => ({tipo:'escribir',id,pregunta,respuestas,explicacion});
const dialogos = [
 [frase('Ana','你好！','¡Hola!','Nǐ hǎo!',[['你','tú'],['好','bien; aquí forma parte del saludo']]),
  frase('小明','你好！你好吗？','¡Hola! ¿Cómo estás?','Nǐ hǎo! Nǐ hǎo ma?',[['你好','hola'],['你','tú'],['好','bien'],['吗','partícula de pregunta']]),
  frase('Ana','我很好，谢谢！','Estoy bien, ¡gracias!','Wǒ hěn hǎo, xièxie!',[['我','yo'],['很','acompaña al adjetivo'],['好','bien'],['谢谢','gracias']]),
  frase('小明','不客气！再见！','¡De nada! ¡Adiós!','Bú kèqi! Zàijiàn!',[['不客气','de nada'],['再见','adiós']])],
 [frase('Ana','你叫什么名字？','¿Cómo te llamas?','Nǐ jiào shénme míngzi?',[['你','tú'],['叫','llamarse'],['什么','qué'],['名字','nombre']]),
  frase('小明','我叫小明。你呢？','Me llamo Xiaoming. ¿Y tú?','Wǒ jiào Xiǎomíng. Nǐ ne?',[['我','yo'],['叫','llamarse'],['小明','nombre propio'],['你','tú'],['呢','devuelve la pregunta']]),
  frase('Ana','我叫安娜。我是西班牙人。','Me llamo Ana. Soy española.','Wǒ jiào Ānnà. Wǒ shì Xībānyá rén.',[['我','yo'],['叫','llamarse'],['安娜','Ana'],['是','ser'],['西班牙','España'],['人','persona; aquí indica nacionalidad']]),
  frase('小明','我是中国人。很高兴认识你！','Soy chino. ¡Encantado de conocerte!','Wǒ shì Zhōngguó rén. Hěn gāoxìng rènshi nǐ!',[['我','yo'],['是','ser'],['中国','China'],['人','persona'],['很','acompaña al adjetivo'],['高兴','contento'],['认识','conocer'],['你','tú']])],
 [frase('店员','你好！你要什么？','¡Hola! ¿Qué quieres?','Nǐ hǎo! Nǐ yào shénme?',[['你好','hola'],['你','tú'],['要','querer'],['什么','qué']]),
  frase('Ana','我要一杯茶，谢谢。','Quiero una taza de té, gracias.','Wǒ yào yì bēi chá, xièxie.',[['我','yo'],['要','querer'],['一','uno'],['杯','medida para una taza o un vaso'],['茶','té'],['谢谢','gracias']]),
  frase('店员','你要咖啡吗？','¿Quieres café?','Nǐ yào kāfēi ma?',[['你','tú'],['要','querer'],['咖啡','café'],['吗','partícula de pregunta']]),
  frase('Ana','不要，谢谢。','No, gracias.','Bú yào, xièxie.',[['不','niega el verbo'],['要','querer'],['谢谢','gracias']])]
];
const lecciones = [
 {capitulo:1,titulo_zh:'你好！',titulo_es:'Saludos',intro:'Tu primera conversación en mandarín: saludar, dar las gracias y despedirte. Los caracteres son simplificados y la pronunciación se muestra en pinyin.',palabras:{
 '你好':palabra('hola','nǐ hǎo'), '你':palabra('tú','nǐ','pronombre'), '好':palabra('bien; bueno','hǎo','adjetivo'), '我':palabra('yo','wǒ','pronombre'), '很':palabra('muy; acompaña al adjetivo','hěn','adverbio','En 我很好 suele enlazar el sujeto con el adjetivo, sin enfatizar «muy».'), '吗':palabra('partícula de pregunta','ma','partícula'), '谢谢':palabra('gracias','xièxie'), '不客气':palabra('de nada','bú kèqi'), '再见':palabra('adiós; hasta luego','zàijiàn')},bloques:[
 explicar('Caracteres y pinyin','El mandarín usa caracteres. El **pinyin** escribe su pronunciación con letras latinas: 你好 → **nǐ hǎo**. Las marcas indican tonos: mā (alto), má (ascendente), mǎ (tercer tono) y mà (descendente). Una sílaba sin marca puede tener tono neutro, como **ma** en 吗. No son tildes de acento como en español.\n\nEn estas muestras puedes leer el pinyin y, si tu dispositivo tiene voz de chino, escuchar las frases.'),
 explicar('Un saludo corto','**你好** significa «hola» y **再见**, «adiós». **谢谢** es «gracias»; puedes responder **不客气**, «de nada».\n\n**你好吗？** pregunta «¿cómo estás?». 吗 convierte la afirmación en una pregunta de sí o no. **我很好** significa «estoy bien»: aquí no se añade 是 («ser»). 你好吗 es útil para practicar la estructura, aunque en conversaciones cotidianas también se usan otros saludos.'),
 {tipo:'dialogo',titulo:'El primer encuentro',frases:dialogos[0]}, {tipo:'vocabulario',titulo:'Tus primeras palabras'},
 test('saludo','¿Cómo dices «hola»?',{'你好':'Saludo: nǐ hǎo.','谢谢':'Significa «gracias».','再见':'Significa «adiós».'},'你好'),
 test('gracias','¿Qué significa 谢谢?',{'Gracias':'Correcto: xièxie.','Hola':'Hola se dice 你好.','Adiós':'Adiós se dice 再见.'},'Gracias'),
 huecos('pregunta','你 好 __？',{'吗':'Marca una pregunta de sí o no.','我':'Significa «yo».','谢谢':'Significa «gracias».'},'吗'),
 escribir('despedida','Escribe «adiós» en caracteres o en pinyin.',['再见','zàijiàn','zai jian','zaijian','zài jiàn'],'再见 — zàijiàn.') ]},
 {capitulo:1,titulo_zh:'我叫安娜',titulo_es:'Presentarse',intro:'Aprende a decir tu nombre y tu nacionalidad, y a preguntar el nombre de otra persona.',palabras:{
 '我':palabra('yo','wǒ','pronombre'),'你':palabra('tú','nǐ','pronombre'),'叫':palabra('llamarse','jiào','verbo'),'什么':palabra('qué','shénme','pronombre interrogativo'),'名字':palabra('nombre','míngzi','sustantivo'),'呢':palabra('¿y…?; devuelve la pregunta','ne','partícula'),'是':palabra('ser','shì','verbo'),'西班牙':palabra('España','Xībānyá','nombre propio'),'中国':palabra('China','Zhōngguó','nombre propio'),'人':palabra('persona','rén','sustantivo'),'高兴':palabra('contento','gāoxìng','adjetivo'),'认识':palabra('conocer','rènshi','verbo')},bloques:[
 explicar('Tu nombre','**我叫安娜** significa «me llamo Ana». El orden es persona + 叫 + nombre. **你叫什么名字？** pregunta «¿cómo te llamas?», literalmente «¿tú te llamas qué nombre?».\n\nCon 什么 («qué») no hace falta añadir 吗. **你呢？** devuelve una pregunta: «¿y tú?».'),
 explicar('De dónde eres','**我是西班牙人** significa «soy español/española». **我是中国人** significa «soy chino/china». El orden es persona + 是 + país + 人. Estas frases no cambian según el género.\n\n**很高兴认识你** es una forma de decir «encantado/a de conocerte».'),
 {tipo:'dialogo',titulo:'Dos personas se presentan',frases:dialogos[1]}, {tipo:'vocabulario',titulo:'Nombre y nacionalidad'},
 test('nombre','¿Qué significa 我叫安娜？',{'Me llamo Ana.':'叫 introduce el nombre.','Soy de China.':'China es 中国.','Quiero té.':'Té es 茶.'},'Me llamo Ana.'),
 huecos('ser','我 __ 西班牙人。',{'是':'Une la persona con su nacionalidad.','吗':'Es una partícula de pregunta.','名字':'Significa «nombre».'},'是'),
 test('interrogativo','¿Qué palabra significa «qué»?',{'什么':'shénme: qué.','人':'rén: persona.','中国':'Zhōngguó: China.'},'什么'),
 escribir('yo','Escribe «yo» en caracteres o en pinyin.',['我','wǒ','wo'],'我 — wǒ.') ]},
 {capitulo:1,titulo_zh:'一杯茶',titulo_es:'Pedir una bebida',intro:'Pide una taza de té o un café con una frase corta y practica cómo decir «no, gracias».',palabras:{
 '要':palabra('querer; pedir','yào','verbo'),'一':palabra('uno','yī','numeral','Su tono cambia según la sílaba siguiente: en 一杯 se pronuncia yì bēi.'),'杯':palabra('medida para una taza o un vaso','bēi','clasificador'),'茶':palabra('té','chá','sustantivo'),'咖啡':palabra('café','kāfēi','sustantivo'),'水':palabra('agua','shuǐ','sustantivo'),'不':palabra('no; niega un verbo','bù','adverbio','Ante un cuarto tono cambia a bú: 不要 → bú yào.'),'谢谢':palabra('gracias','xièxie'),'我':palabra('yo','wǒ','pronombre'),'你':palabra('tú','nǐ','pronombre'),'什么':palabra('qué','shénme','pronombre interrogativo'),'吗':palabra('partícula de pregunta','ma','partícula')},bloques:[
 explicar('Una taza de té','**我要一杯茶** significa «quiero una taza de té». Usa el orden persona + 要 + cantidad + 杯 + bebida. **一杯咖啡** es «una taza de café» y **一杯水**, «un vaso de agua». 杯 cuenta el recipiente; aparece entre el número y la bebida.\n\nAñade **谢谢** para agradecer. Es una fórmula breve para practicar un pedido sencillo.'),
 explicar('Aceptar o rechazar','**你要咖啡吗？** pregunta «¿quieres café?». Puedes contestar **要** («sí, quiero») o **不要，谢谢** («no, gracias»). No hay una única palabra que sirva siempre como «sí»: a menudo se repite el verbo de la pregunta.\n\nEn **不要**, 不 se pronuncia **bú** porque le sigue el cuarto tono de 要. En **一杯**, 一 se pronuncia **yì**. En el vocabulario verás también sus tonos básicos, bù e yī.'),
 {tipo:'dialogo',titulo:'En una cafetería',frases:dialogos[2]}, {tipo:'vocabulario',titulo:'Elige tu bebida'},
 test('te','¿Qué bebida es 茶?',{'Té':'chá: té.','Café':'Café se dice 咖啡.','Agua':'Agua se dice 水.'},'Té'),
 huecos('taza','我要一 __ 茶。',{'杯':'Clasificador para una taza o un vaso.','吗':'Marca una pregunta.','人':'Significa «persona».'},'杯'),
 test('rechazar','¿Cómo dices «no, gracias» al rechazar una bebida?',{'不要，谢谢。':'bú yào, xièxie.','我要一杯茶。':'Quiero una taza de té.','你叫什么名字？':'¿Cómo te llamas?'},'不要，谢谢。'),
 escribir('cafe','Escribe «café» en caracteres o en pinyin.',['咖啡','kāfēi','ka fei','kafei','kā fēi'],'咖啡 — kāfēi.') ]}
];
for (const carpeta of ['lessons','phrases']) mkdirSync(raiz+carpeta,{recursive:true});
const guardar=(ruta,datos)=>writeFileSync(raiz+ruta,JSON.stringify(datos,null,2)+'\n','utf8');
lecciones.forEach((l,i)=>guardar(`lessons/${String(i+1).padStart(3,'0')}.json`,l));
guardar('lessons/capitulos.json',[{numero:1,titulo_zh:'第一步',titulo_es:'Primeros pasos',descripcion:'Tres lecciones de muestra de mandarín: saludar, presentarse y pedir una bebida.'}]);
guardar('phrases/frases.json',{categorias:[{titulo:'Lo básico',descripcion:'Frases de las tres lecciones de muestra.',grupos:lecciones.map((l,i)=>({titulo:l.titulo_es,tarea:l.intro,leccion:String(i+1).padStart(3,'0'),frases:dialogos[i].map(({quien,...f})=>f)}))}]});
console.log('Chino: 3 lecciones, 1 capítulo y 12 frases.');
