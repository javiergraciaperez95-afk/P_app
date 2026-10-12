/* Utilidades comunes de los scripts de Node (rutas de la biblioteca). */
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,dirname,resolve,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {LEVELS,SKILLS} from '../js/checks.js';

export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const DICT=join(ROOT,'data','dictionary.json');
export const readJSON=p=>JSON.parse(readFileSync(p,'utf8').replace(/^﻿/,''));
export const rel=p=>relative(ROOT,p).split(sep).join('/');

/* Todas las carpetas de ejercicios: [{level, skill, dir}] */
export function folders(){
  return LEVELS.flatMap(level=>SKILLS.map(skill=>({level,skill,dir:join(ROOT,'data',`hsk${level}`,skill)})));
}

/* Archivos de ejercicio de una carpeta (NNN.json), ordenados. */
export function exerciseFiles(dir){
  return existsSync(dir)?readdirSync(dir).filter(f=>/^\d{3,}\.json$/.test(f)).sort().map(f=>join(dir,f)):[];
}

/* Nivel y tipo a partir de la ruta de un archivo (…/hsk3/lectura/001.json). */
export function whereIs(path){
  const m=rel(resolve(path)).match(/hsk([1-6])\/(lectura|escucha)\/[^/]+$/);
  return m?{level:+m[1],skill:m[2]}:null;
}

/* Todos los ejercicios de la biblioteca, o los indicados por argumentos. */
export function targets(args){
  return args.length?args.map(a=>resolve(a)):folders().flatMap(f=>exerciseFiles(f.dir));
}
