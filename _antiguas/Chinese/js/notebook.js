/* =====================================================
   CUADERNO DE VOCABULARIO (生词本) con repaso tipo Anki.
   Clave hsk.cuaderno.v1 → { "书店": { zh, py, es, src, added, updated, removed?, card? } }
   - card: estado de repetición espaciada (ver srs.schedule).
   - removed: la palabra se quitó (se conserva la marca para que el
     borrado llegue también a la cuenta y a otros dispositivos).
   - updated: fecha y hora del último cambio; al unir, gana la más reciente.
   ===================================================== */
import {schedule,isDue,startedToday} from './srs.js';

const KEY='hsk.cuaderno.v1';
const META='hsk.cuaderno.meta';      // nuevas repasadas hoy (solo en este navegador)
export const NEW_PER_DAY=20;
const today=()=>new Date().toLocaleDateString('sv-SE');
const now=()=>new Date().toISOString();

function readAll(){
  try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
  catch{return {};}
}
function writeAll(all,{notify=true}={}){
  try{localStorage.setItem(KEY,JSON.stringify(all));}catch{}
  if(notify)window.dispatchEvent(new Event('hsk-change'));
}
const alive=w=>w&&w.zh&&!w.removed;

export function getAll(){return readAll();}
export function has(zh){return alive(readAll()[zh]);}
export function count(){return Object.values(readAll()).filter(alive).length;}

/* Lista ordenada: lo más reciente primero. */
export function list(){
  return Object.values(readAll()).filter(alive)
    .sort((a,b)=>(b.added||'').localeCompare(a.added||'')||a.zh.localeCompare(b.zh));
}
export function add({zh,py,es,src}){
  const all=readAll(),old=all[zh];
  /* si se vuelve a guardar una palabra quitada, conserva su progreso */
  all[zh]={zh,py,es,src,added:alive(old)?old.added:today(),updated:now(),...(old?.card?{card:old.card}:{})};
  writeAll(all);
}
export function remove(zh){
  const all=readAll();
  if(all[zh]){all[zh]={...all[zh],removed:true,updated:now()};writeAll(all);}
}
/* Alterna guardado/no guardado. Devuelve true si queda guardada. */
export function toggle(word){
  if(has(word.zh)){remove(word.zh);return false;}
  add(word);return true;
}

/* ---------- Repaso ---------- */
function newToday(){
  const synced=startedToday(Object.values(readAll()).filter(alive).map(w=>w.card));
  try{const m=JSON.parse(localStorage.getItem(META)||'{}');return Math.max(synced,m.d===today()?m.n:0);}catch{return synced;}
}
function countNew(){
  try{localStorage.setItem(META,JSON.stringify({d:today(),n:newToday()+1}));}catch{}
}
/* Cola de hoy: vencidas primero, luego nuevas hasta el límite diario. */
export function queue(){
  const words=list();
  const due=words.filter(w=>isDue(w.card));
  const fresh=words.filter(w=>!w.card).slice(0,Math.max(0,NEW_PER_DAY-newToday()));
  return {due,fresh};
}
export function stats(){
  const words=list(),q=queue();
  return {total:words.length,learned:words.filter(w=>w.card?.reps>0).length,today:q.due.length+q.fresh.length,due:q.due.length,fresh:q.fresh.length};
}
/* Reiniciar progreso (perfil): las palabras se quedan, pero vuelven a estar como nuevas. */
export function resetReviews(){
  const all=readAll(),t=now();
  for(const w of Object.values(all))if(w&&w.card){delete w.card;w.updated=t;}
  writeAll(all,{notify:false});
  try{localStorage.removeItem(META);}catch{}
}
/* Aplica una nota (1–4) a una palabra. Devuelve la tarjeta nueva. */
export function grade(zh,g){
  const all=readAll(),w=all[zh];
  if(!alive(w))return null;
  if(!w.card)countNew();
  w.card=schedule(w.card,g);w.updated=now();
  writeAll(all);
  return w.card;
}
/* Próximo repaso, en texto ("hoy", "en 3 d", "nueva"). */
export function dueLabel(w){
  if(!w.card)return 'nueva';
  if(isDue(w.card))return 'hoy';
  const d=Math.round((new Date(w.card.due)-new Date(today()))/864e5);
  return d===1?'mañana':`en ${d} d`;
}

/* Une un cuaderno de una copia o de la cuenta: por palabra gana el cambio más reciente
   (incluidos borrados y repasos). Devuelve cuántas palabras cambió. */
export function merge(other){
  if(!other||typeof other!=='object')return 0;
  const all=readAll();let n=0;
  for(const [zh,w] of Object.entries(other)){
    if(!w||!w.zh)continue;
    const mine=all[zh];
    if(!mine||(w.updated||w.added||'')>(mine.updated||mine.added||'')){all[zh]=w;n++;}
  }
  writeAll(all,{notify:false});
  return n;
}
