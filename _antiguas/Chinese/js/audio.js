/* =====================================================
   AUDIO para los ejercicios de escucha.
   - Si el ejercicio trae "audio" (un MP3 en su carpeta), se usa ese archivo.
   - Si no, se lee el texto con la voz china del navegador (speechSynthesis).
   Solo una cosa suena a la vez: cada reproducción nueva corta la anterior.
   ===================================================== */
export const ttsSupported=typeof window!=='undefined'&&'speechSynthesis' in window;
let token=0,audioEl=null;

function voices(){
  return new Promise(res=>{
    const v=speechSynthesis.getVoices();
    if(v.length)return res(v);
    const t=setTimeout(()=>res(speechSynthesis.getVoices()),1500);
    speechSynthesis.addEventListener('voiceschanged',()=>{clearTimeout(t);res(speechSynthesis.getVoices());},{once:true});
  });
}
let voiceP=null;
/* Mejor voz de chino mandarín disponible, o null. */
export function chineseVoice(){
  if(!ttsSupported)return Promise.resolve(null);
  if(!voiceP)voiceP=voices().then(vs=>
    vs.find(v=>/^zh[-_](CN|Hans)/i.test(v.lang)&&/natural|online/i.test(v.name))||
    vs.find(v=>/^zh[-_](CN|Hans)/i.test(v.lang))||
    vs.find(v=>/^(zh|cmn)/i.test(v.lang))||null);
  /* Si aún no había voces (el navegador las carga tarde), no se da por perdida: se vuelve a mirar la próxima vez. */
  const p=voiceP;
  p.then(v=>{if(!v&&voiceP===p)voiceP=null;});
  return p;
}

export function stop(){
  token++;
  if(ttsSupported)speechSynthesis.cancel();
  if(audioEl){audioEl.pause();audioEl=null;}
}

function speakOne(text,{voice,rate,pitch}){
  return new Promise(res=>{
    const u=new SpeechSynthesisUtterance(text);
    u.lang='zh-CN';if(voice)u.voice=voice;
    u.rate=rate;u.pitch=pitch;
    u.onend=u.onerror=()=>res();
    speechSynthesis.speak(u);
  });
}

/* Voz distinta según el hablante: "男" más grave, "女" más aguda. */
const pitchOf=speaker=>/男/.test(speaker||'')?0.8:/女/.test(speaker||'')?1.25:1;

/* Lee una lista de frases [{text, speaker}] en orden.
   onItem(i) se llama al empezar cada frase. Devuelve true si terminó sin cortes. */
export async function speakList(items,{rate=1,onItem}={}){
  stop();
  const my=token;
  if(!ttsSupported)return false;
  const voice=await chineseVoice();
  for(let i=0;i<items.length;i++){
    if(my!==token)return false;
    onItem?.(i);
    await speakOne(items[i].text,{voice,rate,pitch:pitchOf(items[i].speaker)});
    if(my!==token)return false;
    await new Promise(r=>setTimeout(r,items[i].speaker?450:250));
  }
  return my===token;
}

/* Reproduce un archivo de audio. Devuelve true si terminó sin cortes. */
export function playFile(url,{rate=1}={}){
  stop();
  const my=token;
  const a=new Audio(url);
  a.playbackRate=rate;
  audioEl=a;
  return new Promise(res=>{
    a.onended=()=>res(my===token);
    a.onerror=()=>res(false);
    a.onpause=()=>{if(!a.ended)res(false);};
    a.play().catch(()=>res(false));
  });
}
