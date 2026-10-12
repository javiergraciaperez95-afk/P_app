/* =====================================================
   PERFIL: nombre y foto (miniatura de 96×96 en formato data URL).
   Clave hsk.perfil.v1 → { name, photo, updated }
   Se guarda con el resto del progreso (copia y cuenta).
   ===================================================== */
const KEY='hsk.perfil.v1';

export function get(){
  try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'?v:{};}
  catch{return {};}
}
function save(p,{notify=true}={}){
  try{localStorage.setItem(KEY,JSON.stringify(p));}catch{}
  if(notify)window.dispatchEvent(new Event('hsk-change'));
}
export function setName(name){save({...get(),name:name.trim().slice(0,30),updated:new Date().toISOString()});}
export function setPhoto(photo){save({...get(),photo,updated:new Date().toISOString()});}

/* Une el perfil de una copia o de la cuenta: gana el editado más recientemente. */
export function merge(other){
  if(!other||typeof other!=='object')return;
  if((other.updated||'')>(get().updated||''))save(other,{notify:false});
}

/* Convierte la imagen elegida en una miniatura cuadrada de 96×96 (recorte centrado). */
export function photoFromFile(file){
  return new Promise((resolve,reject)=>{
    if(!file||!file.type.startsWith('image/')){reject(new Error('Elige una imagen.'));return;}
    const img=new Image();
    img.onload=()=>{
      const S=96,c=document.createElement('canvas');c.width=c.height=S;
      const side=Math.min(img.width,img.height);
      c.getContext('2d').drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,S,S);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg',0.85));
    };
    img.onerror=()=>reject(new Error('No se pudo leer la imagen.'));
    img.src=URL.createObjectURL(file);
  });
}
