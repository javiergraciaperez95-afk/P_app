#!/usr/bin/env node
/* =====================================================
   OPCIONAL. Genera index.json en cada carpeta de ejercicios
   (data/hskN/lectura/index.json…). La web funciona sin ellos;
   solo sirven para que las listas carguen algo más rápido.
   Uso:  node tools/build-index.js
   Conserva la fecha "added" de los ejercicios que ya estaban.
   ===================================================== */
import {writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {indexEntry,SCHEMA} from '../js/checks.js';
import {folders,exerciseFiles,readJSON,rel} from './lib.js';

const today=new Date().toLocaleDateString('sv-SE');
for(const {dir} of folders()){
  const files=exerciseFiles(dir);
  if(!files.length)continue;
  const indexPath=join(dir,'index.json');
  const prevAdded=new Map();
  if(existsSync(indexPath)){try{for(const e of readJSON(indexPath).exercises||[])prevAdded.set(e.id,e.added);}catch{}}
  const exercises=[];
  for(const f of files){
    try{const ex=readJSON(f);exercises.push(indexEntry(ex,prevAdded.get(ex.id)||today));}
    catch(e){console.log(`  (se omite ${rel(f)}: ${e.message})`);}
  }
  writeFileSync(indexPath,JSON.stringify({schema:SCHEMA,exercises},null,2)+'\n','utf8');
  console.log(`${rel(indexPath)}: ${exercises.length} ejercicio(s)`);
}
