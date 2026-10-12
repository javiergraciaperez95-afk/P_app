/* =====================================================
   DATOS: biblioteca, diccionario y ejercicios.

   Carpetas:  data/hsk1/lectura/001.json … data/hsk6/escucha/NNN.json
   Diccionario compartido: data/dictionary.json

   Cómo encuentra la app los ejercicios de una carpeta (sin scripts):
   1. Lee index.json de esa carpeta si existe (opcional: solo un atajo).
   2. Prueba NNN.json con los números siguientes al último conocido
      (001, 002…) y añade todo lo que encuentre. Se detiene tras
      2 números seguidos que no existan: numera sin dejar huecos.
   Rutas relativas a index.html, para que funcione en GitHub Pages.
   ===================================================== */
import {SCHEMA,LEVELS,SKILLS,WRITING,folderOf,validateExercise,validateWriting,indexEntry,writingEntry,normalizeExercise} from './checks.js';
export {SCHEMA,LEVELS,SKILLS,WRITING,folderOf};

/* Prefijo de rutas: '' desde index.html; '../' desde tools/check.html. */
let BASE='';
export function setBase(b){BASE=b;}

const cache=new Map();
class NotFound extends Error{}

function getJSON(url){
  if(!cache.has(url)){
    const p=fetch(url,{cache:'no-cache'})
      .then(r=>{
        if(r.status===404)throw new NotFound(`${url}: no existe`);
        if(!r.ok)throw new Error(`${url}: HTTP ${r.status}`);
        return r.text();
      })
      .then(txt=>{
        let d;
        try{d=JSON.parse(txt.replace(/^﻿/,''));}
        catch(e){throw new Error(`${url}: el JSON está mal escrito (${e.message})`);}
        if(d?.schema!==SCHEMA)throw new Error(`${url}: "schema" debe ser ${SCHEMA}`);
        return d;
      });
    p.catch(()=>cache.delete(url));
    cache.set(url,p);
  }
  return cache.get(url);
}

const pad=n=>String(n).padStart(3,'0');
const brokenEntry=(id,why)=>({id,file:`${id}.json`,title:`Texto ${id}`,titleEs:why,topic:'—',sentences:0,questions:0,broken:true});

/* Prueba ids de una carpeta a partir de `from`, en tandas, hasta 2 huecos seguidos. */
async function discover(folder,from,toEntry=ex=>indexEntry(ex,null)){
  const found=[];
  let n=from,misses=0;
  const BATCH=3;
  while(misses<2&&n<1000){
    const ids=Array.from({length:BATCH},(_,k)=>pad(n+k));
    n+=BATCH;
    const res=await Promise.allSettled(ids.map(id=>getJSON(BASE+folder+id+'.json')));
    for(let k=0;k<ids.length&&misses<2;k++){
      const r=res[k],id=ids[k];
      if(r.status==='fulfilled'){
        misses=0;
        try{found.push(toEntry(r.value));}
        catch{found.push(brokenEntry(id,'(revisa este archivo: le faltan datos)'));}
      }else if(r.reason instanceof NotFound)misses++;
      else{misses=0;found.push(brokenEntry(id,'(este archivo tiene un error)'));}
    }
  }
  return found;
}

/* Lista de ejercicios de un nivel y tipo (con caché). */
const libs=new Map();
export function loadLibrary(level,skill){
  const folder=folderOf(level,skill);
  if(!libs.has(folder))libs.set(folder,(async()=>{
    let listed=[];
    try{listed=(await getJSON(BASE+folder+'index.json')).exercises||[];}
    catch(e){if(!(e instanceof NotFound))console.warn(`[HSK] ${folder}index.json ignorado:`,e.message);}
    const last=listed.reduce((m,e)=>Math.max(m,parseInt(e.id,10)||0),0);
    const extra=await discover(folder,last+1,skill===WRITING?writingEntry:undefined);
    const byId=new Map([...listed,...extra].map(e=>[e.id,e]));
    return [...byId.values()]
      .sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}))
      .map(e=>({...e,level,skill,key:`hsk${level}/${skill}/${e.id}`}));
  })());
  return libs.get(folder);
}

export async function loadDictionary(){
  try{return (await getJSON(BASE+'data/dictionary.json')).entries||{};}
  catch(e){console.warn('[HSK] Sin diccionario:',e.message);return {};}
}

/* Carga y valida un ejercicio. Devuelve {ex, errors, warnings}. */
export async function loadExercise(entry,dict){
  const url=BASE+folderOf(entry.level,entry.skill)+entry.file;
  const ex=normalizeExercise(await getJSON(url)); // admite el formato compacto
  const {errors,warnings}=validateExercise(ex,{fileId:entry.id,dict,level:entry.level,skill:entry.skill});
  if(warnings.length)console.warn(`[HSK] Avisos en ${url}:\n- `+warnings.join('\n- '));
  return {ex,errors,warnings};
}

/* ESCRITURA: carga y valida un ejercicio de data/hskN/escritura/. */
export async function loadWriting(entry){
  const url=BASE+folderOf(entry.level,WRITING)+entry.file;
  const ex=await getJSON(url);
  const {errors,warnings}=validateWriting(ex,{fileId:entry.id,level:entry.level});
  if(warnings.length)console.warn(`[HSK] Avisos en ${url}:\n- `+warnings.join('\n- '));
  return {ex,errors,warnings};
}

/* FRASES: data/hskN/frases.txt, una por línea:  中文 | pinyin | español
   Las líneas vacías o que empiezan por # se ignoran.
   Devuelve {items:[{zh,py,es}], errors:["línea 3: …"], missing:bool}. */
const phrasesCache=new Map();
export function loadPhrases(level){
  if(!phrasesCache.has(level))phrasesCache.set(level,(async()=>{
    const url=`${BASE}data/hsk${level}/frases.txt`;
    let txt;
    try{
      const r=await fetch(url,{cache:'no-cache'});
      if(r.status===404)return {items:[],errors:[],missing:true};
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      txt=(await r.text()).replace(/^﻿/,'');
    }catch(e){phrasesCache.delete(level);return {items:[],errors:[`No se pudo leer ${url}: ${e.message}`],missing:false};}
    const items=[],errors=[],seen=new Set();
    txt.split(/\r?\n/).forEach((line,i)=>{
      const l=line.trim();
      if(!l||l.startsWith('#'))return;
      const parts=l.split('|').map(s=>s.trim());
      if(parts.length!==3||parts.some(p=>!p)){errors.push(`línea ${i+1}: debe tener 3 partes separadas por | (chino | pinyin | español)`);return;}
      const [zh,py,es]=parts;
      if(seen.has(zh)){errors.push(`línea ${i+1}: «${zh}» está repetida`);return;}
      seen.add(zh);items.push({zh,py,es});
    });
    return {items,errors,missing:false};
  })());
  return phrasesCache.get(level);
}

/* Pinyin y traducción de un token: token → diccionario → aviso en consola. */
const warned=new Set();
export function lookup(t,dict){
  const d=dict[t.zh]||{};
  const py=t.py??d.py, es=t.es??d.es;
  if((py==null||es==null)&&!warned.has(t.zh)){
    warned.add(t.zh);
    console.warn(`[HSK] Falta pinyin o traducción para «${t.zh}» (ni en el token ni en el diccionario).`);
  }
  return {py:py??'',es:es??'—'};
}
