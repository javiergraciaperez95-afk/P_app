/* =====================================================
   SONIDOS 8 bits sintetizados con Web Audio (sin archivos).
   Bips cortos al hacer clic; acierto y fallo con su melodía.
   El botón ♪ de la cabecera los silencia (se recuerda).
   ===================================================== */
const KEY='hsk.sfx';
let ctx=null;
let muted=false;
try{muted=localStorage.getItem(KEY)==='off';}catch{}

function audio(){
  if(muted)return null;
  if(!ctx){
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return null;
    ctx=new C();
  }
  if(ctx.state==='suspended')ctx.resume();
  return ctx;
}

/* Una nota: frecuencia (Hz), duración (s), forma de onda, volumen, retraso y deslizamiento de tono. */
function tone(freq,dur,{type='square',vol=0.05,at=0,slide=0}={}){
  const a=audio();if(!a)return;
  const t=a.currentTime+at;
  const o=a.createOscillator(),g=a.createGain();
  o.type=type;
  o.frequency.setValueAtTime(freq,t);
  if(slide)o.frequency.linearRampToValueAtTime(freq+slide,t+dur);
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g).connect(a.destination);
  o.start(t);o.stop(t+dur+0.02);
}

export const sfx={
  click(){tone(660,0.045);},                                  // bip
  tick(){tone(1320,0.025,{vol:0.03});},                        // palabra
  bop(){tone(392,0.06,{type:'triangle',vol:0.09});},           // sello de frase
  open(){tone(523,0.05);tone(784,0.06,{at:0.05});},            // entrar
  back(){tone(784,0.05);tone(523,0.06,{at:0.05});},            // volver
  girl(){tone(988,0.04,{vol:0.04});tone(1319,0.05,{at:0.05,vol:0.04});}, // la tutora
  ok(){tone(523,0.07);tone(659,0.07,{at:0.07});tone(784,0.07,{at:0.14});tone(1047,0.12,{at:0.21});},
  bad(){tone(196,0.12,{type:'sawtooth',vol:0.05,slide:-30});tone(147,0.2,{type:'sawtooth',vol:0.05,at:0.12,slide:-40});},
  get muted(){return muted;},
  toggle(){
    muted=!muted;
    try{localStorage.setItem(KEY,muted?'off':'on');}catch{}
    if(!muted)sfx.click();
    return muted;
  }
};
