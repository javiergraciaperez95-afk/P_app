/* =====================================================
   PROGRESO del usuario en localStorage.
   Clave hsk.progress.v2 → { "hsk3/lectura/001": { done, firstTry,
   total, errors, lastSeen, wrongQuestions } }
   wrongQuestions: números de pregunta (desde 1) falladas al
   menos una vez en el último intento completo.
   La v1 (hsk6.progress.v1, solo HSK 6 lectura, claves "001") se
   migra automáticamente la primera vez y no se borra.
   ===================================================== */
const KEY='hsk.progress.v2';
const OLD_KEY='hsk6.progress.v1';
const today=()=>new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD en hora local

function readAll(){
  try{
    const raw=localStorage.getItem(KEY);
    if(raw==null)return migrate();
    const v=JSON.parse(raw);
    return v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  }catch{return {};}
}
function migrate(){
  try{
    const old=JSON.parse(localStorage.getItem(OLD_KEY)||'{}');
    const all={};
    for(const [id,rec] of Object.entries(old||{}))all[`hsk6/lectura/${id}`]=rec;
    writeAll(all);
    return all;
  }catch{return {};}
}
function writeAll(all,{notify=true}={}){
  try{localStorage.setItem(KEY,JSON.stringify(all));}catch{/* modo privado o almacenamiento lleno: se ignora */}
  if(notify)window.dispatchEvent(new Event('hsk-change')); // js/cloud.js lo guarda en la cuenta si hay sesión
}

export function getAll(){return readAll();}
export function get(key){return readAll()[key]||null;}

/* Ejercicios terminados cuya clave empieza por prefix ("hsk3/" o "hsk3/lectura/"). */
export function doneCount(prefix){
  return Object.entries(readAll()).filter(([k,v])=>k.startsWith(prefix)&&v.done).length;
}

/* Marca que se ha abierto un ejercicio (sin tocar el resultado). */
export function touch(key){
  const all=readAll();
  all[key]={done:false,...all[key],lastSeen:today()};
  writeAll(all,{notify:false}); // abrir un texto no merece un commit
}

/* Último ejercicio abierto (para el botón CONTINUAR). */
const LAST_KEY='hsk.last';
export function setLast(key){try{localStorage.setItem(LAST_KEY,key);}catch{}}
export function getLast(){try{return localStorage.getItem(LAST_KEY);}catch{return null;}}

/* Guarda el resultado al terminar todas las preguntas. */
export function saveResult(key,{firstTry,total,errors,wrongQuestions}){
  const all=readAll();
  all[key]={done:true,firstTry,total,errors,lastSeen:today(),wrongQuestions};
  writeAll(all);
}

/* ESCRITURA: añade o cambia campos sin borrar los demás
   (p. ej. {essay:"…"} para el borrador de la redacción, o el resultado). */
export function update(key,patch,{notify=true}={}){
  const all=readAll();
  all[key]={done:false,...all[key],...patch,lastSeen:today()};
  writeAll(all,{notify});
}

/* Marcar / desmarcar a mano con el botón TERMINADO (conserva el último resultado si lo hay). */
export function setDone(key,done){
  const all=readAll();
  all[key]={...all[key],done,lastSeen:today()};
  writeAll(all);
}

/* Une el progreso de una copia de seguridad: nunca pierde un "terminado"
   y, si ambos lo están, se queda con el más reciente. Devuelve cuántos cambió. */
export function merge(other){
  const all=readAll();let n=0;
  for(const [k,b] of Object.entries(other||{})){
    if(!b||typeof b!=='object')continue;
    const a=all[k];
    if(!a||(b.done&&!a.done)||(b.done===a.done&&(b.lastSeen||'')>(a.lastSeen||''))){all[k]=b;n++;}
  }
  writeAll(all);
  return n;
}

/* Reiniciar progreso (perfil): borra los textos terminados y el último abierto.
   Las redacciones escritas (essay) se conservan, sin marcar como hechas. */
export function clearAll(){
  const keep={};
  for(const [k,v] of Object.entries(readAll()))if(v?.essay)keep[k]={done:false,essay:v.essay,lastSeen:v.lastSeen};
  writeAll(keep,{notify:false});
  try{localStorage.removeItem(LAST_KEY);}catch{}
}

/* Pide al navegador que no borre estos datos por su cuenta (si lo permite). */
export function persist(){
  try{navigator.storage?.persist?.();}catch{}
}
