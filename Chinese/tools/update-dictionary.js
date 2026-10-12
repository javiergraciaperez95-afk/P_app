#!/usr/bin/env node
/* =====================================================
   Añade al diccionario las palabras nuevas de un lote.
   Uso:  node tools/update-dictionary.js                    (todos los ejercicios)
         node tools/update-dictionary.js data/hsk3/lectura/011.json …
         node tools/update-dictionary.js --strip …          (además limpia los tokens)

   - Palabra que no está en el diccionario y cuyo token trae "py" y "es"
     → se añade (gana la primera aparición).
   - Nunca sobrescribe ni borra entradas existentes.
   - Si un token trae "py"/"es" distintos del diccionario → se lista como
     "uso contextual" y se deja en el token (es lo correcto para homógrafos).
   - Con --strip, quita de los tokens los "py"/"es" que sean idénticos al
     diccionario, para no repetir datos.
   ===================================================== */
import {writeFileSync} from 'node:fs';
import {DICT,readJSON as read,rel,targets as findTargets} from './lib.js';

const args=process.argv.slice(2);
const strip=args.includes('--strip');
const targets=findTargets(args.filter(a=>a!=='--strip'));

const dictFile=read(DICT);
const entries=dictFile.entries;
const added=[],contextual=[],incomplete=[];
let stripped=0;

for(const path of targets){
  const name=rel(path);
  const ex=read(path);
  let changed=false;
  const all=[...(ex.titleTokens||[]),...(ex.sentences||[]).flatMap(s=>s.tokens||[])];
  for(const t of all){
    if(!t||!t.zh)continue;
    const d=entries[t.zh];
    if(!d){
      if(t.py&&t.es){entries[t.zh]={py:t.py,es:t.es};added.push(`${t.zh}  ${t.py}  ${t.es}   (${name})`);}
      else incomplete.push(`${t.zh}   (${name}): falta ${!t.py?'"py"':''}${!t.py&&!t.es?' y ':''}${!t.es?'"es"':''}`);
      continue;
    }
    for(const k of ['py','es']){
      if(t[k]===undefined)continue;
      if(t[k]===d[k]){if(strip){delete t[k];stripped++;changed=true;}}
      else contextual.push(`${t.zh}  ${k}: «${t[k]}»  (diccionario: «${d[k]}»)   (${name})`);
    }
  }
  if(changed)writeFileSync(path,JSON.stringify(ex,null,2)+'\n','utf8');
}

if(added.length)writeFileSync(DICT,JSON.stringify(dictFile,null,2)+'\n','utf8');

const list=(title,arr)=>{console.log(`\n${title}: ${arr.length}`);arr.forEach(x=>console.log('  '+x));};
list('Añadidas al diccionario',added);
list('Usos contextuales (se quedan en el token; revisa que sean intencionados)',contextual);
list('Palabras nuevas SIN datos completos (corrígelas a mano)',incomplete);
if(strip)console.log(`\nDatos repetidos quitados de los tokens: ${stripped}`);
process.exit(incomplete.length?1:0);
