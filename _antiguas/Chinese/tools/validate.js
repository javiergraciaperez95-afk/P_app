#!/usr/bin/env node
/* =====================================================
   Validador de la biblioteca.
   Uso:  node tools/validate.js                              (todo)
         node tools/validate.js data/hsk3/lectura/002.json …
   Sale con código 1 si hay errores (los avisos no bloquean).
   ===================================================== */
import {readFileSync} from 'node:fs';
import {basename} from 'node:path';
import {validateExercise,validateDictionary,duplicateKeys} from '../js/checks.js';
import {DICT,readJSON,rel,whereIs,targets} from './lib.js';

let nErr=0,nWarn=0;
const report=(file,{errors,warnings})=>{
  if(!errors.length&&!warnings.length){console.log(`✓ ${file}`);return;}
  console.log(`${errors.length?'✗':'!'} ${file}`);
  errors.forEach(m=>console.log(`    ERROR  ${m}`));
  warnings.forEach(m=>console.log(`    aviso  ${m}`));
  nErr+=errors.length;nWarn+=warnings.length;
};

/* Diccionario */
let dict={};
try{
  const raw=readFileSync(DICT,'utf8').replace(/^﻿/,'');
  const data=JSON.parse(raw);
  const res=validateDictionary(data);
  duplicateKeys(raw).forEach(k=>res.errors.push(`clave repetida en el diccionario: «${k}»`));
  report('data/dictionary.json',res);
  dict=data.entries||{};
}catch(e){report('data/dictionary.json',{errors:[`no se puede leer: ${e.message}`],warnings:[]});}

const files=targets(process.argv.slice(2));
for(const path of files){
  const name=basename(path),file=rel(path);
  const where=whereIs(path);
  if(!where){report(file,{errors:['debe estar en data/hskN/lectura/ o data/hskN/escucha/'],warnings:[]});continue;}
  if(!/^\d{3,}\.json$/.test(name)){report(file,{errors:['el nombre debe ser numérico con ceros: 001.json'],warnings:[]});continue;}
  let data;
  try{data=readJSON(path);}
  catch(e){report(file,{errors:[`JSON no válido o ilegible: ${e.message}`],warnings:[]});continue;}
  report(file,validateExercise(data,{fileId:name.replace(/\.json$/,''),dict,...where}));
}

console.log(`\n${files.length} ejercicio(s) · ${nErr} error(es) · ${nWarn} aviso(s)`);
process.exit(nErr?1:0);
