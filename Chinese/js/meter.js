/* =====================================================
   MEDIDOR DE PROGRESO pixel art (barra por bloques).
   meterHTML(hechos, total, {label, attrs}) → HTML
   setMeter(elemento, hechos, total, label) → actualiza uno existente
   ===================================================== */
const pct=(d,t)=>t?Math.round(100*Math.min(d,t)/t):0;

export function meterHTML(done,total,{label='',attrs=''}={}){
  const p=pct(done,total);
  return `<span class="meter${p===100?' full':''}" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"
    aria-label="${label||`${done} de ${total}`}" ${attrs}><i style="width:${p}%"></i><b>${label||`${done}/${total}`}</b></span>`;
}
export function setMeter(el,done,total,label){
  if(!el)return;
  const p=pct(done,total);
  el.classList.toggle('full',p===100);
  el.setAttribute('aria-valuemax',total);el.setAttribute('aria-valuenow',done);
  el.setAttribute('aria-label',label||`${done} de ${total}`);
  el.querySelector('i').style.width=p+'%';
  el.querySelector('b').textContent=label||`${done}/${total}`;
}
