/* =====================================================
   Comprobaciones compartidas (Node y navegador, sin dependencias).
   Las usan la app, tools/validate.js, tools/build-index.js y tools/check.html.
   ===================================================== */
export const SCHEMA=1;
export const ROLES=['sub','verb','obj','adv','attr','comp','par','con'];
export const LEVELS=[1,2,3,4,5,6];
export const SKILLS=['lectura','escucha'];
export const WRITING='escritura';   // tercer tipo de ejercicio con JSON (formato propio, ver validateWriting)
/* Carpeta de un nivel y tipo: data/hsk3/escucha/ */
export const folderOf=(level,skill)=>`data/hsk${level}/${skill}/`;
/* Pinyin: letras latinas (con diacríticos), espacios, apóstrofos, guiones (chéngyǔ: mòmíng-qímiào)
   y puntos suspensivos (estructuras: búdàn…érqiě…). Sin hanzi ni dígitos de tono. */
const PY_RE=/^[A-Za-zÀ-ÿĀ-žǍ-ǜ’' .…-]+$/u;
const ALLOWED_TAGS=new Set(['b','i']);
const isStr=v=>typeof v==='string'&&v.trim()!=='';
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);

/* =====================================================
   FORMATO COMPACTO (opcional, más cómodo de escribir a mano)
   Los tokens de una frase pueden escribirse como UNA cadena:
     "tokens": "在/adv 这/attr 座/attr/zuò/(clasificador) ，"
   - Palabras separadas por espacios: zh/rol, o zh/rol/pinyin, o zh/rol/pinyin/español.
   - Si el pinyin o el español llevan espacios, usa _ :  很久/comp/hěn_jiǔ/mucho_tiempo
   - La puntuación china se separa sola (también pegada a la palabra).
   También vale una lista mezclando cadenas y objetos.
   "answer" puede ser 0–3 o una letra "A"–"D".
   normalizeExercise() lo convierte todo al formato normal.
   ===================================================== */
const CJK_PUNCT=new Set([...'，。！？：；、“”‘’《》（）…—·「」']);

function wordToken(raw){
  const [zh,role='',py,...es]=raw.split('/');
  const t={zh,role};
  if(py)t.py=py.replace(/_/g,' ');
  if(es.length)t.es=es.join('/').replace(/_/g,' ');
  return t;
}
/* "我/sub 是/verb 学生/obj。" → [{zh,role},…,{p:"。"}] */
export function parseTokenString(str){
  const tokens=[];
  for(const chunk of String(str).trim().split(/\s+/).filter(Boolean)){
    let word='';
    const flush=()=>{if(word){tokens.push(wordToken(word));word='';}};
    for(const ch of chunk){
      if(CJK_PUNCT.has(ch)){
        flush();
        const last=tokens[tokens.length-1];
        if(last?.p&&(ch==='…'||ch==='—')&&last.p.endsWith(ch))last.p+=ch; // …… y —— juntos
        else tokens.push({p:ch});
      }else word+=ch;
    }
    flush();
  }
  return tokens;
}
function normTokens(v){
  if(typeof v==='string')return parseTokenString(v);
  if(Array.isArray(v))return v.flatMap(t=>typeof t==='string'?parseTokenString(t):[t]);
  return v;
}
/* Devuelve una copia en formato normal (no modifica el original). */
export function normalizeExercise(ex){
  if(!isObj(ex))return ex;
  const out={...ex};
  if('titleTokens' in ex)out.titleTokens=normTokens(ex.titleTokens);
  if(Array.isArray(ex.sentences))out.sentences=ex.sentences.map(s=>isObj(s)?{...s,tokens:normTokens(s.tokens)}:s);
  if(Array.isArray(ex.questions))out.questions=ex.questions.map(q=>{
    if(!isObj(q)||typeof q.answer!=='string')return q;
    const i='ABCD'.indexOf(q.answer.trim().toUpperCase());
    return {...q,answer:i>=0?i:q.answer};
  });
  return out;
}

/* Etiquetas HTML que no sean <b> o <i>. */
function badTags(s){
  const out=[];
  for(const m of String(s).matchAll(/<\/?\s*([a-zA-Z0-9-]+)([^>]*)>/g)){
    const tag=m[1].toLowerCase();
    if(!ALLOWED_TAGS.has(tag)||m[2].trim())out.push(m[0]);
  }
  return out;
}

export function validateDictionary(d){
  const errors=[],warnings=[];
  if(!isObj(d)){errors.push('dictionary.json no es un objeto');return {errors,warnings};}
  if(d.schema!==SCHEMA)errors.push(`dictionary.json: "schema" debe ser ${SCHEMA}`);
  if(!isObj(d.entries)){errors.push('dictionary.json: falta "entries"');return {errors,warnings};}
  for(const [zh,e] of Object.entries(d.entries)){
    if(!isObj(e)){errors.push(`diccionario «${zh}»: la entrada no es un objeto`);continue;}
    if(!isStr(e.py))errors.push(`diccionario «${zh}»: falta "py"`);
    else if(!PY_RE.test(e.py))errors.push(`diccionario «${zh}»: pinyin no válido "${e.py}"`);
    if(!isStr(e.es))errors.push(`diccionario «${zh}»: falta "es"`);
  }
  return {errors,warnings};
}

/* Claves repetidas en el texto de un JSON (JSON.parse se queda con la última sin avisar). */
export function duplicateKeys(rawText){
  const seen=new Set(),dup=new Set();
  for(const m of rawText.matchAll(/^\s*"((?:[^"\\]|\\.)*)"\s*:\s*\{/gm)){
    if(seen.has(m[1]))dup.add(m[1]);seen.add(m[1]);
  }
  return [...dup];
}

/* Valida un ejercicio.
   fileId = id esperado por el nombre de archivo; dict = entries del diccionario;
   level/skill = carpeta donde está (para comprobar "level" y "skill" si el JSON los trae). */
export function validateExercise(ex,{fileId,dict={},level,skill}={}){
  ex=normalizeExercise(ex);
  const errors=[],warnings=[];
  const E=m=>errors.push(m),W=m=>warnings.push(m);
  if(!isObj(ex)){E('el archivo no contiene un objeto JSON');return {errors,warnings};}
  if('level' in ex&&!LEVELS.includes(ex.level))E(`"level" debe ser un número del 1 al 6 (es ${JSON.stringify(ex.level)})`);
  else if('level' in ex&&level&&ex.level!==level)E(`"level" es ${ex.level} pero el archivo está en la carpeta hsk${level}`);
  if('skill' in ex&&!SKILLS.includes(ex.skill))E(`"skill" debe ser "lectura" o "escucha" (es ${JSON.stringify(ex.skill)})`);
  else if('skill' in ex&&skill&&ex.skill!==skill)E(`"skill" es "${ex.skill}" pero el archivo está en la carpeta ${skill}`);
  if('audio' in ex&&!isStr(ex.audio))E('"audio" debe ser el nombre de un archivo (p. ej. "001.mp3") o no aparecer');

  /* --- Estructura --- */
  if(ex.schema!==SCHEMA)E(`"schema" debe ser ${SCHEMA} (es ${JSON.stringify(ex.schema)})`);
  if(!isStr(ex.id)||!/^\d{3,}$/.test(ex.id))E(`"id" debe ser numérico con ceros, p. ej. "001" (es ${JSON.stringify(ex.id)})`);
  else if(fileId&&ex.id!==fileId)E(`"id" (${ex.id}) no coincide con el nombre del archivo (${fileId}.json)`);
  if(!isObj(ex.title)||!isStr(ex.title.zh)||!isStr(ex.title.es))E('"title" debe tener "zh" y "es"');
  if(!isStr(ex.topic))E('falta "topic"');
  if(!Array.isArray(ex.titleTokens)||!ex.titleTokens.length)E('falta "titleTokens"');
  if(!Array.isArray(ex.sentences)||!ex.sentences.length){E('faltan "sentences"');return {errors,warnings};}
  if(!Array.isArray(ex.questions)||!ex.questions.length)E('faltan "questions"');

  /* --- Frases y párrafos --- */
  const ns=ex.sentences.map(s=>s?.n);
  ns.forEach((n,i)=>{if(n!==i+1)E(`frase en posición ${i+1} tiene "n": ${JSON.stringify(n)} (deben ir 1, 2, 3… sin huecos)`);});
  if(!Array.isArray(ex.paragraphs)||!ex.paragraphs.every(Array.isArray))E('"paragraphs" debe ser una lista de listas');
  else{
    const flat=ex.paragraphs.flat();
    const expected=ns.map((_,i)=>i+1);
    if(flat.length!==expected.length||flat.some((n,i)=>n!==expected[i]))
      E(`"paragraphs" debe usar todas las frases una vez y en orden (1..${expected.length}); tiene [${flat.join(', ')}]`);
    if(ex.paragraphs.some(p=>!p.length))E('"paragraphs" contiene un párrafo vacío');
  }

  /* --- Tokens --- */
  const checkTokens=(tokens,where)=>{
    if(!Array.isArray(tokens)){E(`${where}: "tokens" no es una lista`);return;}
    let words=0;
    tokens.forEach((t,i)=>{
      const w=`${where}, token ${i+1}`;
      if(!isObj(t)){E(`${w}: no es un objeto`);return;}
      if('p' in t){
        if(!isStr(t.p))E(`${w}: puntuación vacía`);
        const extra=Object.keys(t).filter(k=>k!=='p');
        if(extra.length)E(`${w} («${t.p}»): la puntuación solo lleva "p" (sobra: ${extra.join(', ')})`);
        return;
      }
      if(!isStr(t.zh)){E(`${w}: falta "zh" (o "p" si es puntuación)`);return;}
      words++;
      const tag=`${w} «${t.zh}»`;
      if(!t.role)E(`${tag}: falta el rol (escribe por ejemplo ${t.zh}/sub, ${t.zh}/verb…)`);
      else if(!ROLES.includes(t.role))E(`${tag}: rol ${JSON.stringify(t.role)} no permitido (usa: ${ROLES.join(', ')})`);
      const d=dict[t.zh]||{};
      const py=t.py??d.py,es=t.es??d.es;
      if(!isStr(py))E(`${tag}: sin pinyin (ni en el token ni en el diccionario)`);
      else if(!PY_RE.test(py))E(`${tag}: pinyin no válido "${py}" (sin hanzi, sin números de tono)`);
      if(!isStr(es))E(`${tag}: sin traducción (ni en el token ni en el diccionario)`);
      if(t.py!==undefined&&!isStr(t.py))E(`${tag}: "py" vacío`);
      if(t.es!==undefined&&!isStr(t.es))E(`${tag}: "es" vacío`);
      const extra=Object.keys(t).filter(k=>!['zh','py','es','role'].includes(k));
      if(extra.length)W(`${tag}: campos desconocidos (${extra.join(', ')})`);
    });
    if(!words)W(`${where}: no tiene ninguna palabra (solo puntuación o vacía)`);
  };
  if(Array.isArray(ex.titleTokens))checkTokens(ex.titleTokens,'título');
  if(isObj(ex.title)&&Array.isArray(ex.titleTokens)){
    const joined=ex.titleTokens.map(t=>t?.zh??t?.p??'').join('').replace(/[《》]/g,'');
    if(joined!==ex.title.zh)W(`los "titleTokens" (${joined}) no coinciden con "title.zh" (${ex.title.zh})`);
  }

  ex.sentences.forEach((s,i)=>{
    const where=`frase ${s?.n??i+1}`;
    if(!isObj(s)){E(`${where}: no es un objeto`);return;}
    checkTokens(s.tokens,where);
    if('speaker' in s&&!isStr(s.speaker))E(`${where}: "speaker" vacío (usa por ejemplo "男" o "女", o quítalo)`);
    if(!isStr(s.es))E(`${where}: falta "es" (traducción)`);
    if(!isStr(s.pattern))E(`${where}: falta "pattern" (estructura)`);
    if(!Array.isArray(s.points)||!s.points.every(isStr))E(`${where}: "points" debe ser una lista de textos`);
    else if(s.points.length<3)W(`${where}: solo ${s.points.length} puntos de gramática (mínimo recomendado: 3)`);
    for(const [k,v] of [['es',s.es],['pattern',s.pattern],...(s.points||[]).map((p,j)=>[`points[${j+1}]`,p])]){
      const bad=badTags(v);if(bad.length)W(`${where} ${k}: HTML no permitido ${bad.join(' ')}`);
    }
  });

  /* --- Preguntas --- */
  const nSet=new Set(ns);
  const answers=[];
  (ex.questions||[]).forEach((q,qi)=>{
    const where=`pregunta ${qi+1}`;
    if(!isObj(q)){E(`${where}: no es un objeto`);return;}
    if(!isStr(q.stem))E(`${where}: falta "stem"`);
    if(!isStr(q.stemEs))E(`${where}: falta "stemEs"`);
    if(!Array.isArray(q.options)||q.options.length!==4){E(`${where}: debe tener exactamente 4 opciones`);return;}
    if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)E(`${where}: "answer" debe ser "A", "B", "C" o "D" (o 0, 1, 2, 3)`);
    else answers.push(q.answer);
    q.options.forEach((o,oi)=>{
      const w=`${where}, opción ${'ABCD'[oi]}`;
      if(!isObj(o)){E(`${w}: no es un objeto`);return;}
      for(const k of ['zh','es','why'])if(!isStr(o[k]))E(`${w}: falta "${k}"`);
      if(!('evidence' in o))W(`${w}: falta "evidence" (usa null si no hay pista)`);
      else if(o.evidence!==null&&!nSet.has(o.evidence))E(`${w}: "evidence" ${JSON.stringify(o.evidence)} no es una frase existente`);
      for(const k of ['es','why']){const bad=badTags(o[k]||'');if(bad.length)W(`${w} ${k}: HTML no permitido ${bad.join(' ')}`);}
    });
    const bad=badTags(q.stemEs||'');if(bad.length)W(`${where} stemEs: HTML no permitido ${bad.join(' ')}`);
  });
  const nq=(ex.questions||[]).length;
  if(nq&&nq>15)W(`tiene ${nq} preguntas: quizá convenga dividir el ejercicio en partes`);
  if(answers.length>1&&answers.every(a=>a===answers[0]))W(`todas las respuestas correctas están en la misma posición (${'ABCD'[answers[0]]})`);

  return {errors,warnings};
}

/* =====================================================
   ESCRITURA (书写): data/hskN/escritura/NNN.json
   {
     "schema": 1, "id": "001", "level": 5, "skill": "escritura",
     "title": { "zh": "…", "es": "…" }, "topic": "lección 1",
     "ordenar": [                       ← «完成句子»: ordenar trozos
       { "words": "挣了 出去 打工 这次 不少钱",          (trozos separados por espacios)
         "answer": "这次出去打工挣了不少钱。",           (o una lista si vale más de un orden)
         "py": "…", "es": "…", "points": ["…"] }      (pinyin, traducción y gramática; opcionales)
     ],
     "redaccion": {                     ← «写短文»: redacción con palabras obligatorias
       "words": "装修/zhuāngxiū/reformar 以来/yǐlái/desde",   (zh/pinyin/español; _ = espacio)
       "chars": 80, "tips": ["…"], "model": "…", "modelEs": "…" }
   }
   Las dos partes son opcionales, pero debe haber al menos una.
   ===================================================== */
export const answersOf=o=>(Array.isArray(o?.answer)?o.answer:[o?.answer]).filter(isStr);
export const chunksOf=o=>String(o?.words||'').trim().split(/\s+/).filter(Boolean);
/* Solo los caracteres chinos (sin puntuación ni espacios), para comparar y contar. */
export const hanzi=s=>[...String(s||'')].filter(c=>/\p{Script=Han}/u.test(c)).join('');
export function essayWords(r){
  return String(r?.words||'').trim().split(/\s+/).filter(Boolean).map(w=>{
    const [zh,py='',...es]=w.split('/');
    return {zh,py:py.replace(/_/g,' '),es:es.join('/').replace(/_/g,' ')};
  });
}
export function validateWriting(ex,{fileId,level}={}){
  const errors=[],warnings=[];
  const E=m=>errors.push(m),W=m=>warnings.push(m);
  if(!isObj(ex)){E('el archivo no contiene un objeto JSON');return {errors,warnings};}
  if(ex.schema!==SCHEMA)E(`"schema" debe ser ${SCHEMA}`);
  if(!isStr(ex.id)||!/^\d{3,}$/.test(ex.id))E(`"id" debe ser numérico con ceros, p. ej. "001"`);
  else if(fileId&&ex.id!==fileId)E(`"id" (${ex.id}) no coincide con el nombre del archivo (${fileId}.json)`);
  if('level' in ex&&level&&ex.level!==level)E(`"level" es ${ex.level} pero el archivo está en la carpeta hsk${level}`);
  if('skill' in ex&&ex.skill!=='escritura')E(`"skill" debe ser "escritura"`);
  if(!isObj(ex.title)||!isStr(ex.title.zh)||!isStr(ex.title.es))E('"title" debe tener "zh" y "es"');
  if(!isStr(ex.topic))E('falta "topic"');
  if(!ex.ordenar&&!ex.redaccion)E('falta "ordenar" o "redaccion" (al menos una de las dos)');
  if(ex.ordenar!==undefined){
    if(!Array.isArray(ex.ordenar)||!ex.ordenar.length)E('"ordenar" debe ser una lista de frases');
    else ex.ordenar.forEach((o,i)=>{
      const w=`ordenar ${i+1}`;
      if(!isObj(o)){E(`${w}: no es un objeto`);return;}
      const ch=chunksOf(o),ans=answersOf(o);
      if(ch.length<2)E(`${w}: "words" necesita al menos 2 trozos separados por espacios`);
      if(!ans.length){E(`${w}: falta "answer"`);return;}
      const pool=hanzi(ch.join('')).split('').sort().join('');
      ans.forEach(a=>{if(hanzi(a).split('').sort().join('')!==pool)E(`${w}: la respuesta «${a}» no usa exactamente los trozos de "words"`);});
      if(o.py!==undefined&&!PY_RE.test(String(o.py).replace(/[,.?!;:，。？！]/g,'')))W(`${w}: el pinyin tiene caracteres raros`);
      if(o.points!==undefined&&(!Array.isArray(o.points)||!o.points.every(isStr)))E(`${w}: "points" debe ser una lista de textos`);
      for(const t of [o.es,...(o.points||[])]){const bad=badTags(t||'');if(bad.length)W(`${w}: HTML no permitido ${bad.join(' ')}`);}
    });
  }
  if(ex.redaccion!==undefined){
    const r=ex.redaccion;
    if(!isObj(r))E('"redaccion" debe ser un objeto');
    else{
      const ws=essayWords(r);
      if(!ws.length)E('redaccion: faltan las palabras ("words")');
      ws.forEach(w=>{
        if(!w.py)E(`redaccion: «${w.zh}» sin pinyin (escribe ${w.zh}/pinyin/español)`);
        else if(!PY_RE.test(w.py))E(`redaccion: pinyin no válido en «${w.zh}»`);
        if(!w.es)W(`redaccion: «${w.zh}» sin traducción`);
      });
      if(r.chars!==undefined&&!(Number.isInteger(r.chars)&&r.chars>0))E('redaccion: "chars" debe ser un número (p. ej. 80)');
      if(r.model!==undefined){
        if(!isStr(r.model))E('redaccion: "model" vacío');
        else ws.forEach(w=>{if(!r.model.includes(w.zh))W(`redaccion: el modelo no usa «${w.zh}»`);});
      }
      if(r.tips!==undefined&&(!Array.isArray(r.tips)||!r.tips.every(isStr)))E('redaccion: "tips" debe ser una lista de textos');
    }
  }
  return {errors,warnings};
}
export function writingEntry(ex){
  return {id:ex.id,file:`${ex.id}.json`,title:ex.title.zh,titleEs:ex.title.es,topic:ex.topic,
    ordenar:Array.isArray(ex.ordenar)?ex.ordenar.length:0,redaccion:!!ex.redaccion};
}

/* Datos para index.json. chars = caracteres del texto (frases, sin título ni puntuación). */
export function exerciseStats(ex){
  const chars=ex.sentences.reduce((sum,s)=>sum+s.tokens.reduce((a,t)=>a+(t.zh?[...t.zh].length:0),0),0);
  return {sentences:ex.sentences.length,questions:ex.questions.length,chars};
}

export function indexEntry(ex,added){
  ex=normalizeExercise(ex);
  return {
    id:ex.id,file:`${ex.id}.json`,title:ex.title.zh,titleEs:ex.title.es,topic:ex.topic,
    ...exerciseStats(ex),added
  };
}
