/* =====================================================
   COPIA DE SEGURIDAD: descarga el progreso y el cuaderno en un
   archivo .json y lo vuelve a cargar (en este u otro navegador).
   Cargar una copia SUMA: nunca borra lo que ya hay.
   ===================================================== */
import * as progress from './progress.js';
import * as notebook from './notebook.js';
import * as srs from './srs.js';
import * as profile from './profile.js';

const APP='hsk-lectura';

export function download(){
  const data={
    app:APP,version:1,date:new Date().toISOString(),
    progress:progress.getAll(),
    notebook:notebook.getAll(),
    srs:srs.getAll(),
    profile:profile.get(),
    last:progress.getLast()
  };
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`hsk-progreso-${new Date().toLocaleDateString('sv-SE')}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

/* Abre el selector de archivos y une la copia. Resuelve con {progress, words} o lanza un Error. */
export function upload(){
  return new Promise((resolve,reject)=>{
    const input=document.createElement('input');
    input.type='file';input.accept='.json,application/json';
    input.onchange=async()=>{
      const file=input.files?.[0];
      if(!file){reject(new Error('No se eligió ningún archivo.'));return;}
      try{
        const data=JSON.parse((await file.text()).replace(/^﻿/,''));
        if(data?.app!==APP)throw new Error('Ese archivo no es una copia de esta web.');
        const n1=progress.merge(data.progress);
        const n2=notebook.merge(data.notebook);
        srs.merge(data.srs);
        profile.merge(data.profile);
        if(data.last&&!progress.getLast())progress.setLast(data.last);
        resolve({progress:n1,words:n2});
      }catch(e){reject(e instanceof SyntaxError?new Error('El archivo está dañado.'):e);}
    };
    input.click();
  });
}
