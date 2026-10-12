/* =====================================================
   FRASES: tipos de ejercicio (sin tocar el formato de frases.txt)
   Cada frase es {zh, py, es}. A partir de ahí se generan:
   - oir      ¿Qué has oído?      → 4 frases en chino
   - sentido  ¿Qué significa?     → 4 traducciones, sin texto chino
   - vf       ¿Significa esto?    → una traducción, sí / no
   - hueco    Completa la frase   → falta una palabra; 4 opciones
   - ordenar  Ordena lo que oyes  → trozos desordenados
   - dictado  Escribe lo que oyes → en hanzi o en pinyin (sin tonos)
   Las palabras se sacan del pinyin: cada palabra pinyin = una palabra
   china (se cuentan las sílabas). Si no cuadra, esa frase no tiene
   «hueco» y «ordenar» se hace por trozos entre comas.
   ===================================================== */
export const TYPES={
  oir:{label:'¿QUÉ OYES?',title:'Escucha y elige lo que has oído'},
  sentido:{label:'¿QUÉ SIGNIFICA?',title:'Escucha (sin leer) y elige qué significa'},
  vf:{label:'¿SÍ O NO?',title:'Escucha: ¿significa esto?'},
  hueco:{label:'HUECO',title:'Escucha y completa la palabra que falta'},
  ordenar:{label:'ORDENAR',title:'Escucha y pon los trozos en orden'},
  dictado:{label:'DICTADO',title:'Escucha y escríbela (hanzi o pinyin sin tonos)'}
};

const rnd=n=>Math.floor(Math.random()*n);
export const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const HAN=/\p{Script=Han}/u;
export const core=s=>String(s).replace(/[^\p{Script=Han}0-9A-Za-z%]/gu,'');
const isQuestion=s=>/[？?]\s*$/.test(s);

/* ---------- Sílabas del pinyin ---------- */
const V='aeiouüvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';
const SYL=new RegExp(`(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?([${V}]+)(ng(?![${V}])|n(?![${V}]))?(r(?![${V}]))?`,'giu');
function syllables(word){
  let n=0;
  for(const part of word.toLowerCase().split(/['’\-]/)){
    for(const m of part.matchAll(SYL)){
      n++;
      // r final de erhua (哪儿 nǎr, 这儿 zhèr) = un carácter más; 二/儿 (èr, ér) no
      if(m[4]&&(m[1]||m[3]||!/^[eēéěè]$/.test(m[2])))n++;
    }
  }
  return n;
}
const NAME_HEAD=new Set([...'小老陈李王张刘赵郝丁高马文鲁孔杜黄周吴林']);
/* Palabras {zh, py} de una frase, o null si el pinyin no cuadra con los caracteres. */
const segCache=new Map();
export function segment(p){
  if(segCache.has(p.zh))return segCache.get(p.zh);
  let out=null;
  if(!/[0-9A-Za-z]/.test(p.zh)){
    const chars=[...p.zh].filter(c=>HAN.test(c));
    // «|» marca el final de cada oración (para no juntar nombres a través de ella)
    const words=p.py.replace(/[.?!…,;:]/g,' | ').replace(/["«»()—“”‘’]/g,' ').split(/\s+/).filter(w=>w==='|'||/\p{L}/u.test(w));
    const res=[];let i=0,ok=true,prevCap=false,first=true,prevFirst=false;
    for(const w of words){
      if(w==='|'){prevCap=false;first=true;continue;}
      const k=syllables(w);
      if(!k||i+k>chars.length){ok=false;break;}
      const cap=w[0]!==w[0].toLowerCase(),zh=chars.slice(i,i+k).join('');
      const last=res[res.length-1];
      // nombres propios en dos palabras (Chén Lán, Xiǎo Gāng) = una sola palabra;
      // al empezar la oración todo va en mayúscula, así que ahí solo si empieza por apellido o 小/老
      if(cap&&prevCap&&last.zh.length+zh.length<=4&&(!prevFirst||NAME_HEAD.has(last.zh))){last.zh+=zh;last.py+=' '+w;}
      else res.push({zh,py:w});
      i+=k;prevCap=cap;prevFirst=first;first=false;
    }
    if(ok&&i===chars.length&&res.length)out=res;
  }
  segCache.set(p.zh,out);
  return out;
}

/* ---------- Distractores ---------- */
const lenOf=s=>core(s).length;
function similar(p,items,n,key){
  const L=lenOf(p.zh),chars=new Set(core(p.zh));
  const used=new Set([p[key]]);
  const scored=items.filter(x=>x.zh!==p.zh&&x[key]&&!used.has(x[key])).map(x=>{
    const l=lenOf(x.zh);
    let s=Math.abs(l-L)/Math.max(L,1);
    let shared=0;for(const c of core(x.zh))if(chars.has(c))shared++;
    s-=Math.min(shared,6)*0.05;
    if(isQuestion(x.zh)!==isQuestion(p.zh))s+=0.6;
    return [s+Math.random()*0.25,x];
  }).sort((a,b)=>a[0]-b[0]);
  const out=[];
  for(const [,x] of scored){if(used.has(x[key]))continue;used.add(x[key]);out.push(x);if(out.length===n)break;}
  return out;
}
const FUNC=new Set(['的','了','是','在','和','也','都','就','吗','呢','吧','啊','不','我','你','他','她','它','着','过','得','地','很','还','又','这','那','个']);

/* ---------- Construcción de cada tipo ---------- */
function makeOir(p,items){
  const opts=shuffle([p,...similar(p,items,3,'zh')]);
  return {type:'oir',opts,answer:opts.indexOf(p)};
}
function makeSentido(p,items){
  const opts=shuffle([p,...similar(p,items,3,'es')]);
  return {type:'sentido',opts,answer:opts.indexOf(p)};
}
function makeVf(p,items){
  const truth=Math.random()<0.5;
  const shown=truth?p:similar(p,items,1,'es')[0]||p;
  return {type:'vf',shown,answer:shown===p?0:1};
}
function wordPool(items){
  if(wordPool.cache&&wordPool.n===items.length)return wordPool.cache;
  const pool=new Map();
  // si una palabra aparece alguna vez en minúscula, se usa esa forma (la mayúscula suele ser solo inicio de frase)
  const low=w=>w.py[0]!==w.py[0].toUpperCase();
  for(const it of items){const s=segment(it);if(!s)continue;for(const w of s){if(FUNC.has(w.zh))continue;const had=pool.get(w.zh);if(!had||(!low(had)&&low(w)))pool.set(w.zh,w);}}
  wordPool.cache=[...pool.values()];wordPool.n=items.length;
  return wordPool.cache;
}
function huecoCands(p,items){
  const seg=segment(p);
  if(!seg||seg.length<3)return null;
  const cand=seg.map((w,i)=>[w,i]).filter(([w])=>!FUNC.has(w.zh)&&w.zh.length<=4);
  return cand.length?{seg,cand}:null;
}
/* ¿Hay hueco posible? Basta con que alguna palabra tenga 3 distractores de su misma longitud. */
function huecoOk(p,items){
  const hc=huecoCands(p,items);if(!hc)return false;
  const all=wordPool(items);
  return hc.cand.some(([w])=>{let n=0;for(const x of all)if(x.zh.length===w.zh.length&&x.zh!==w.zh&&!p.zh.includes(x.zh)&&++n>=3)return true;return false;});
}
function makeHueco(p,items){
  const hc=huecoCands(p,items);if(!hc)return null;
  const {seg,cand}=hc;
  // mejor palabras de 2+ caracteres; si una no tiene distractores, se prueba la siguiente
  const order=[...shuffle(cand.filter(([w])=>w.zh.length>=2)),...shuffle(cand.filter(([w])=>w.zh.length<2))];
  const all=wordPool(items);
  for(const [w0,idx] of order){
    const word=all.find(w=>w.zh===w0.zh)||w0; // misma forma (minúscula) que los distractores
    const pool=all.filter(w=>w.zh!==word.zh&&!p.zh.includes(w.zh));
    const same=shuffle(pool.filter(w=>w.zh.length===word.zh.length));
    const shareChar=same.filter(w=>[...w.zh].some(c=>word.zh.includes(c)));
    const picks=[...new Map([...shareChar.slice(0,1),...same].map(w=>[w.zh,w])).values()].slice(0,3);
    if(picks.length<3)continue;
    const opts=shuffle([word,...picks]);
    return {type:'hueco',seg,idx,opts,answer:opts.indexOf(word)};
  }
  return null;
}
const STICK_BEFORE=new Set(['的','了','着','过','得','地','吗','呢','吧','啊','呀','们','上','里','中']);
const STICK_AFTER=new Set(['不','没','很','最','太','更','把','被','在','给','跟','对','从','向','往','为','比','一','这','那','这个','那个']);
/* Trozos para ordenar: se corta en la puntuación y, si un trozo es largo, por palabras. */
function chunksOf(p){
  const seg=segment(p);
  const clauses=[];
  if(seg){
    // reparte las palabras en sus cláusulas siguiendo la frase original
    let cur=[],wi=0,need=0,buf='';
    for(const ch of p.zh){
      if(HAN.test(ch)){
        buf+=ch;need++;
        if(wi<seg.length&&buf===seg[wi].zh){cur.push(seg[wi].zh);wi++;buf='';}
      }else if(/[，。！？；：、,.!?;:]/.test(ch)&&cur.length&&!buf){clauses.push(cur);cur=[];}
    }
    if(cur.length)clauses.push(cur);
  }else{
    for(const part of p.zh.split(/[，。！？；：、,.!?;:“”"…—]+/)){const c=core(part);if(c)clauses.push([c]);}
  }
  const total=clauses.flat().join('').length;
  const target=total<=12?2:Math.min(8,Math.ceil(total/6));
  const out=[];
  for(const words of clauses){
    let piece='',prev='';
    for(const w of words){
      // no se corta delante de partículas ni detrás de palabras que necesitan lo siguiente
      const canBreak=!STICK_BEFORE.has(w)&&!STICK_AFTER.has(prev);
      if(piece&&canBreak&&piece.length+w.length>target+1){out.push(piece);piece='';}
      piece+=w;prev=w;
    }
    if(piece)out.push(piece);
  }
  return out;
}
function makeOrdenar(p){
  let chunks=chunksOf(p);
  if(chunks.length>8){ // demasiados: se juntan de dos en dos
    const j=[];for(let i=0;i<chunks.length;i+=2)j.push(chunks[i]+(chunks[i+1]||''));chunks=j;
  }
  if(chunks.length<3)return null;
  let order=shuffle(chunks.map((c,i)=>i));
  for(let t=0;t<5&&order.every((v,i)=>chunks[v]===chunks[i]);t++)order=shuffle(order);
  return {type:'ordenar',chunks,order,picked:[]};
}
function makeDictado(p){
  if(lenOf(p.zh)>16)return null;
  return {type:'dictado'};
}
const MAKERS={oir:makeOir,sentido:makeSentido,vf:makeVf,hueco:makeHueco,ordenar:makeOrdenar,dictado:makeDictado};

/* Formas posibles para una frase (hueco, ordenar y dictado no sirven para todas).
   Se calcula una vez por frase. */
const FEAS=new Map();
export function feasible(p,items){
  if(FEAS.has(p.zh))return FEAS.get(p.zh);
  const ok=Object.keys(TYPES).filter(t=>{
    if(t==='oir'||t==='sentido'||t==='vf')return true;   // siempre posibles
    if(t==='hueco')return huecoOk(p,items);
    return !!MAKERS[t](p,items);
  });
  FEAS.set(p.zh,ok);return ok;
}
/* Formas ya acertadas (card.ok) que siguen siendo posibles. */
export const passed=(p,items,card)=>feasible(p,items).filter(t=>card?.ok?.includes(t));
/* Dominada = acertada al menos una vez de cada forma posible. */
export const mastered=(p,items,card)=>passed(p,items,card).length===feasible(p,items).length;

/* Elige al azar entre las formas que aún no se han acertado (todas, en práctica libre
   o si ya está dominada); evita repetir el tipo anterior si hay otra opción. */
export function build(p,items,{card,last,practice=false}={}){
  const all=feasible(p,items),done=card?.ok||[];
  let pool=practice?all:all.filter(t=>!done.includes(t));
  if(!pool.length)pool=all;
  for(const t of shuffle(pool.filter(t=>t!==last)).concat(shuffle(pool),['oir'])){
    const ex=MAKERS[t](p,items);
    if(ex)return ex;
  }
  return makeOir(p,items);
}

/* ---------- Comprobación del dictado ---------- */
const stripTones=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ü|v/g,'u');
const pyKey=s=>stripTones(String(s).toLowerCase()).replace(/[^a-z0-9]/g,'');
export function checkDictado(p,input){
  const v=String(input||'').trim();
  if(!v)return {ok:false,empty:true};
  if(HAN.test(v)){
    const a=core(v),b=core(p.zh);
    if(a===b)return {ok:true};
    // casi: como mucho 1 carácter distinto por cada 8
    return {ok:false,close:near([...a],[...b])<=Math.max(1,Math.floor(b.length/8))};
  }
  const a=pyKey(v),b=pyKey(p.py);
  if(a===b)return {ok:true};
  return {ok:false,close:near([...a],[...b])<=Math.max(1,Math.floor(b.length/10))};
}
/* Distancia de edición (para decir «casi»). */
function near(a,b){
  const d=Array.from({length:a.length+1},(_,i)=>[i]);
  for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return d[a.length][b.length];
}
