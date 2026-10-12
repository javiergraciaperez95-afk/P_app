/* =====================================================
   REPETICIÓN ESPACIADA (estilo Anki, simplificada) para FRASES.
   Clave hsk.srs.v1 → { "hsk1": { "你好吗？": {ivl, ease, reps, lapses, due, last} },
                        "_new": { "hsk1": {d:"2026-10-03", n:4} } }
   - Acierto: intervalo 1 día → 3 días → intervalo × facilidad (2,5 al empezar).
   - Fallo: vuelve hoy, el intervalo empieza de cero y la facilidad baja.
   - Como mucho NEW_PER_DAY frases nuevas por día y nivel.
   ===================================================== */
const KEY='hsk.srs.v1';
export const NEW_PER_DAY=10;
const iso=d=>d.toLocaleDateString('sv-SE');
const today=()=>iso(new Date());
const addDays=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d);};

function readAll(){
  try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
  catch{return {};}
}
function writeAll(all,{notify=true}={}){
  try{localStorage.setItem(KEY,JSON.stringify(all));}catch{}
  if(notify)window.dispatchEvent(new Event('hsk-change'));
}
export function getAll(){return readAll();}
/* Reiniciar progreso (perfil): borra el repaso de todas las frases. */
export function clearAll(){writeAll({},{notify:false});}

const lv=level=>`hsk${level}`;
/* Nuevas empezadas hoy: se cuentan por el campo first de las tarjetas (que viaja
   con la cuenta); el contador local _new solo sirve para tarjetas antiguas sin first. */
export const startedToday=cards=>Object.values(cards||{}).filter(c=>c&&c.first===today()).length;
function newToday(all,level){
  const m=all._new?.[lv(level)];
  return Math.max(m&&m.d===today()?m.n:0,startedToday(all[lv(level)]));
}

/* Cola de hoy: primero las pendientes (vencidas), luego nuevas hasta el límite diario. */
/* phrases: solo las que aún no están dominadas (lo filtra app.js). */
export function queue(level,phrases){
  const all=readAll(),cards=all[lv(level)]||{},t=today();
  const due=[],fresh=[];
  for(const p of phrases){
    const c=cards[p.zh];
    if(!c)fresh.push(p);
    else if(c.due<=t)due.push(p);
  }
  const room=Math.max(0,NEW_PER_DAY-newToday(all,level));
  return {due,fresh:fresh.slice(0,room)};
}

/* Tarjeta de una frase (o undefined si es nueva). */
export function getCard(level,zh){return (readAll()[lv(level)]||{})[zh];}

export function stats(level,phrases){
  const {due,fresh}=queue(level,phrases);
  const cards=readAll()[lv(level)]||{};
  const learned=phrases.filter(p=>cards[p.zh]&&cards[p.zh].reps>0).length;
  return {total:phrases.length,today:due.length+fresh.length,learned};
}

/* =====================================================
   PROGRAMADOR TIPO ANKI (SM-2 simplificado, en días)
   Notas: 1 = Otra vez · 2 = Difícil · 3 = Bien · 4 = Fácil
   - Otra vez: vuelve hoy (en la misma sesión), facilidad −0,20.
   - Difícil: intervalo ×1,2 (mín. 1 día), facilidad −0,15.
   - Bien: 1 día → 3 días → intervalo × facilidad.
   - Fácil: 4 días la primera vez; luego intervalo × facilidad × 1,3; facilidad +0,15.
   Devuelve una tarjeta nueva: {ivl, ease, reps, lapses, due, last, at, first}
   ===================================================== */
export function schedule(card,grade){
  const c={ivl:0,ease:2.5,reps:0,lapses:0,...card};
  const good=c.reps===0?1:c.reps===1?3:Math.max(c.ivl+1,Math.round(c.ivl*c.ease));
  if(grade===1){
    if(c.reps>0)c.lapses++;
    c.reps=0;c.ivl=0;c.ease=Math.max(1.3,c.ease-0.2);
  }else if(grade===2){
    c.ivl=c.reps===0?1:Math.max(c.ivl+1,Math.round(c.ivl*1.2));
    c.ease=Math.max(1.3,c.ease-0.15);c.reps++;
  }else if(grade===4){
    c.ivl=c.reps===0?4:Math.max(good+1,Math.round(c.ivl*c.ease*1.3));
    c.ease+=0.15;c.reps++;
  }else{
    c.ivl=good;c.reps++;
  }
  c.ease=+c.ease.toFixed(2);
  c.due=addDays(c.ivl);c.last=today();c.at=new Date().toISOString();
  if(!card)c.first=today();   // día en que se estudió por primera vez (viaja con la cuenta)
  return c;
}
/* Texto del intervalo que daría cada nota (para los botones). */
export function preview(card,grade){
  const d=schedule(card,grade).ivl;
  return d===0?'hoy':d===1?'1 d':d<30?`${d} d`:d<365?`${Math.round(d/30)} m`:`${(d/365).toFixed(1)} a`;
}
export const isDue=card=>!!card&&card.due<=today();

/* FRASES: registra una respuesta (acierto = Bien, fallo = Otra vez).
   Devuelve el nuevo intervalo en días (0 = vuelve hoy). */
/* type = forma de ejercicio; si se acierta, se apunta en card.ok (formas superadas). */
export function review(level,zh,ok,type){
  const all=readAll(),key=lv(level);
  const cards=all[key]||(all[key]={});
  const isNew=!cards[zh];
  const c=schedule(cards[zh],ok?3:1);
  if(ok&&type&&!(c.ok||[]).includes(type))c.ok=[...(c.ok||[]),type];
  cards[zh]=c;
  if(isNew){
    all._new=all._new||{};
    all._new[key]={d:today(),n:newToday(all,level)+1};
  }
  writeAll(all);
  return c.ivl;
}

/* Une el estado de una copia o de la cuenta: de cada frase gana el repaso más reciente. */
export function merge(other){
  if(!other||typeof other!=='object')return 0;
  const all=readAll();let n=0;
  for(const [key,cards] of Object.entries(other)){
    if(key==='_new'||!cards||typeof cards!=='object')continue;
    const mine=all[key]||(all[key]={});
    for(const [zh,c] of Object.entries(cards)){
      if(!mine[zh]||(c.at||c.last||'')>(mine[zh].at||mine[zh].last||'')){mine[zh]=c;n++;}
    }
  }
  writeAll(all,{notify:false});
  return n;
}
