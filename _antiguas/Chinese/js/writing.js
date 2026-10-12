/* =====================================================
   ESCRITURA (书写) · como la tercera parte del examen HSK 5
   1. 完成句子: ordenar trozos para formar una frase (se tocan los trozos).
   2. 写短文: redacción de ~80 caracteres con palabras obligatorias.
      Cuenta caracteres, marca las palabras usadas, revisa lo básico
      y enseña un texto modelo. El borrador se guarda solo (progreso).
   Formato del JSON: ver validateWriting en js/checks.js.
   ===================================================== */
import {answersOf,chunksOf,essayWords,hanzi} from './checks.js';
import * as progress from './progress.js';
import {sfx} from './sfx.js';
import {meterHTML} from './meter.js';
import {chineseVoice,speakList,stop} from './audio.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{
  let r;
  do{r=a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);}
  while(a.length>2&&r.every((x,i)=>x===a[i]));   // que no salga ya ordenado
  return r;
};
const MAX_TRIES=3;
/* Para comparar frases: fuera espacios y puntuación (los números y el % sí cuentan). */
const norm=s=>String(s??'').replace(/[\s，。？！、；：“”‘’,.?!;:"'…]/g,'');

export function createWriting({readingEl,scrollEl,scoreEl,tutor}){
  let W=null;   // {ex, key, nav, items:[{chunks, order, placed, tries, hinted, solved}], essayChecked}
  let saveTimer=null;

  /* ---------- Dibujo ---------- */
  function load(ex,{key,nav}){
    const old=progress.get(key)||{};
    W={ex,key,nav,essayChecked:!!old.essayOk,
      items:(ex.ordenar||[]).map(o=>{
        const chunks=chunksOf(o);
        return {o,chunks,order:shuffle(chunks.map((_,i)=>i)),placed:[],tries:0,hinted:false,solved:false};
      })};
    draw(old.essay||'');
  }
  function draw(draft){
    const {ex,nav}=W,r=ex.redaccion;
    const n0=29;   // en el examen, la escritura empieza en la pregunta 29 (HSK 5 del libro)
    readingEl.innerHTML=`<article class="ex wr">
      <h2 class="title">${esc(ex.title.zh)}</h2>
      <p class="subtitle">${esc(ex.title.es)}</p>
      <div class="list-meter" id="wrMeter"></div>
      ${W.items.length?`<section class="wr-part">
        <h3 class="wr-h">完成句子 <span>Ordena la frase</span></h3>
        <p class="wr-lead">Toca los trozos en el orden correcto. Si te equivocas, toca un trozo de tu frase para devolverlo.</p>
        ${W.items.map((it,i)=>`<div class="q wr-q" data-wi="${i}">
          <div class="qh"><span class="qn">${ex.ordenar.length===3?n0+i:i+1}</span>
            <div class="wr-line" aria-label="Tu frase" data-line="${i}"></div></div>
          <div class="wr-pool" data-pool="${i}"></div>
          <div class="wr-btns">
            <button class="pbtn" data-wact="check" data-i="${i}">✓ COMPROBAR</button>
            <button class="pbtn" data-wact="hint" data-i="${i}">PISTA</button>
            <button class="pbtn" data-wact="clear" data-i="${i}">↺ BORRAR</button>
            <button class="pbtn" data-wact="show" data-i="${i}" hidden>VER SOLUCIÓN</button>
          </div>
          <div class="wr-sol" hidden></div>
        </div>`).join('')}
      </section>`:''}
      ${r?essayHTML(r,draft,W.items.length?n0+W.items.length:1):''}
      <nav class="nav">
        <a class="navbtn${nav.prev?'':' off'}" href="${nav.prev?nav.base+nav.prev:'#'}">◂ ANTERIOR</a>
        <a class="navbtn" href="${nav.list}">LISTA</a>
        <a class="navbtn${nav.next?'':' off'}" href="${nav.next?nav.base+nav.next:'#'}">SIGUIENTE ▸</a>
      </nav>
    </article><div class="endnote"></div>`;
    W.items.forEach((_,i)=>drawItem(i));
    if(r)updateEssay(false);
    updateScore();
    scrollEl.scrollTop=0;
  }
  function essayHTML(r,draft,num){
    const ws=essayWords(r),target=r.chars||80;
    return `<section class="wr-part">
      <h3 class="wr-h">写短文 <span>Redacción</span></h3>
      <div class="q wr-essay">
        <div class="qh"><span class="qn">${num}</span>
          <p class="wr-lead">Escribe un texto de unos <b>${target} caracteres</b> usando <b>todas</b> estas palabras, en el orden que quieras:</p></div>
        <ul class="wr-words">${ws.map(w=>`<li><button class="wr-word" data-say="${esc(w.zh)}" data-ww="${esc(w.zh)}" title="Escuchar">
          <b>${esc(w.zh)}</b><span>${esc(w.py)}</span><small>${esc(w.es)}</small></button></li>`).join('')}</ul>
        ${r.tips?.length?`<details class="wr-tips"><summary>CÓMO ESCRIBIRLO <span>ideas de la tutora</span></summary>
          <ul class="pts">${r.tips.map(t=>`<li>${t}</li>`).join('')}</ul></details>`:''}
        <textarea class="wr-text" id="wrText" lang="zh-CN" rows="6" spellcheck="false"
          placeholder="在这里写…  (escribe aquí en chino; el texto se guarda solo)">${esc(draft)}</textarea>
        <div class="wr-count" id="wrCount"></div>
        <div class="wr-btns">
          <button class="pbtn" data-wact="review">✓ REVISAR</button>
          <button class="pbtn" data-wact="listen">▶ OÍR MI TEXTO</button>
          ${r.model?`<button class="pbtn" data-wact="model" aria-pressed="false">VER MODELO</button>`:''}
        </div>
        ${r.model?`<div class="wr-model" hidden>
          <p class="wr-model-t"><span class="chip">MODELO</span> <button class="ev" data-say-model>▶ OÍR</button></p>
          <p class="wr-model-zh">${markWords(esc(r.model),ws)}</p>
          ${r.modelEs?`<p class="wr-model-es">${esc(r.modelEs)}</p>`:''}
        </div>`:''}
      </div>
    </section>`;
  }
  const markWords=(html,ws)=>ws.reduce((h,w)=>h.split(esc(w.zh)).join(`<b>${esc(w.zh)}</b>`),html);

  /* ---------- 1 · Ordenar ---------- */
  function drawItem(i){
    const it=W.items[i];
    const line=readingEl.querySelector(`[data-line="${i}"]`),pool=readingEl.querySelector(`[data-pool="${i}"]`);
    const box=readingEl.querySelector(`.wr-q[data-wi="${i}"]`);
    line.innerHTML=it.placed.length
      ?it.placed.map((c,k)=>`<button class="chunk on" data-back="${i}:${k}" ${it.solved?'disabled':''}>${esc(it.chunks[c])}</button>`).join('')
       +(it.solved?'<span class="chunk-end">。</span>':'')
      :'<span class="wr-empty">toca los trozos de abajo…</span>';
    pool.innerHTML=it.order.filter(c=>!it.placed.includes(c))
      .map(c=>`<button class="chunk" data-put="${i}:${c}">${esc(it.chunks[c])}</button>`).join('');
    box.classList.toggle('solved',it.solved);
    box.classList.toggle('locked',it.solved);
    box.querySelectorAll('.wr-btns [data-wact]').forEach(b=>{
      if(b.dataset.wact==='show')b.hidden=it.solved||it.tries<MAX_TRIES;
      else b.hidden=it.solved;
    });
  }
  /* Respuesta más parecida a lo colocado: la que comparte el comienzo más largo. */
  function bestAnswer(it){
    const mine=norm(it.placed.map(c=>it.chunks[c]).join(''));
    let best=null,bestLen=-1;
    for(const a of answersOf(it.o)){
      const h=norm(a);let n=0;
      while(n<mine.length&&mine[n]===h[n])n++;
      if(n>bestLen){best=a;bestLen=n;}
    }
    return best;
  }
  /* Trozos de la respuesta, en orden (los trozos repetidos se asignan de izquierda a derecha). */
  function solutionOrder(it,answer){
    const h=norm(answer),used=new Set(),out=[];
    let pos=0;
    while(pos<h.length){
      const c=it.chunks.findIndex((ch,k)=>!used.has(k)&&h.startsWith(norm(ch),pos));
      if(c<0)break;
      used.add(c);out.push(c);pos+=norm(it.chunks[c]).length;
    }
    return out;
  }
  function check(i){
    const it=W.items[i];
    if(it.placed.length<it.chunks.length){
      sfx.bad();
      tutor.say(`<div class="tw">Te faltan trozos: hay que usarlos <b>todos</b>. Ni uno menos.</div>`,{mood:'oops',hold:2500});
      return;
    }
    const mine=norm(it.placed.map(c=>it.chunks[c]).join(''));
    if(answersOf(it.o).some(a=>norm(a)===mine)){solve(i,true);return;}
    it.tries++;
    sfx.bad();
    const sol=solutionOrder(it,bestAnswer(it));
    let ok=0;while(ok<it.placed.length&&it.placed[ok]===sol[ok])ok++;
    tutor.say(`<span class="chip bad">TODAVÍA NO</span><div class="tw">${ok
      ?`Los <b>${ok}</b> primeros trozos están bien; el problema viene después.`
      :pick(['Ya desde el primer trozo vamos mal. Piensa: ¿quién hace qué?','Empieza por el sujeto y el verbo; lo demás se coloca alrededor.'])}
      ${it.tries>=MAX_TRIES?' Si te rindes, tienes VER SOLUCIÓN. Yo no juzgo. Mucho.':''}</div>`,{mood:'oops',hold:3500});
    drawItem(i);
  }
  function hint(i){
    const it=W.items[i];
    const sol=solutionOrder(it,bestAnswer(it));
    let ok=0;while(ok<it.placed.length&&it.placed[ok]===sol[ok])ok++;
    it.placed=sol.slice(0,ok+1);it.hinted=true;
    drawItem(i);
    if(it.placed.length===it.chunks.length){solve(i,false);return;}
    tutor.say(`<div class="tw">Te pongo el siguiente trozo: «<b>${esc(it.chunks[sol[ok]])}</b>». El resto es cosa tuya.</div>`,{mood:'point',hold:2500});
  }
  function showSolution(i){
    const it=W.items[i];
    it.placed=solutionOrder(it,answersOf(it.o)[0]);it.hinted=true;
    solve(i,false);
  }
  function solve(i,mine){
    const it=W.items[i],o=it.o;
    it.solved=true;
    const first=mine&&!it.tries&&!it.hinted;
    it.first=first;
    if(mine)sfx.ok();
    drawItem(i);
    const others=answersOf(o).slice(1);
    const sol=readingEl.querySelector(`.wr-q[data-wi="${i}"] .wr-sol`);
    sol.hidden=false;
    sol.innerHTML=`<p class="wr-sol-zh">${esc(answersOf(o)[0])} <button class="ev" data-say="${esc(answersOf(o)[0])}">▶ OÍR</button></p>
      ${o.py?`<p class="wr-sol-py">${esc(o.py)}</p>`:''}${o.es?`<p class="wr-sol-es">${esc(o.es)}</p>`:''}
      ${others.length?`<p class="wr-sol-alt">También vale: ${others.map(esc).join(' · ')}</p>`:''}`;
    tutor.say(`<span class="chip ${mine?'good':''}">${first?'A LA PRIMERA':mine?'CORRECTO':'SOLUCIÓN'}</span>
      <div class="tw">${first?pick(['Perfecto. Así se escribe.','Impecable. Casi tan bien como yo.']):mine?'Bien, aunque te ha costado un poco.':'Así es como queda. Fíjate en el orden.'}</div>
      ${o.py?`<p class="pyl">${esc(o.py)}</p>`:''}
      ${o.points?.length?`<ul class="pts">${o.points.map(p=>`<li>${p}</li>`).join('')}</ul>`:''}`,{mood:mine?'happy':'idle'});
    speakList([{text:answersOf(o)[0]}],{rate:0.9});
    updateScore();
    maybeFinish();
  }

  /* ---------- 2 · Redacción ---------- */
  function essayState(){
    const r=W.ex.redaccion,text=readingEl.querySelector('#wrText')?.value||'';
    const ws=essayWords(r),n=hanzi(text).length,target=r.chars||80;
    const used=ws.map(w=>text.includes(w.zh));
    return {r,text,ws,n,target,used,missing:ws.filter((_,k)=>!used[k])};
  }
  function updateEssay(save=true){
    const s=essayState();
    const cnt=readingEl.querySelector('#wrCount');
    const low=Math.round(s.target*0.75),high=Math.round(s.target*1.3);
    const cls=s.n===0?'':s.n<low?'short':s.n>high?'long':'good';
    cnt.innerHTML=`${meterHTML(Math.min(s.n,s.target),s.target,{label:`字数 ${s.n} / ${s.target}`})}
      <span class="wr-cnt-msg ${cls}">${s.n===0?'':s.n<low?'Corto todavía':s.n>high?'Un poco largo':'Buena longitud ✓'}</span>`;
    readingEl.querySelectorAll('[data-ww]').forEach((b,k)=>b.classList.toggle('used',s.used[k]));
    if(save){
      clearTimeout(saveTimer);
      saveTimer=setTimeout(()=>progress.update(W.key,{essay:s.text}),700);
    }
    return s;
  }
  function review(){
    const s=updateEssay();
    if(!s.n){
      tutor.say(`<div class="tw">Una hoja en blanco. Bonita, pero no puntúa. Escribe algo y lo reviso.</div>`,{mood:'oops',hold:2500});
      return;
    }
    const notes=[];
    if(s.missing.length)notes.push(`Te falta usar: ${s.missing.map(w=>`<b>${esc(w.zh)}</b> (${esc(w.es)})`).join(', ')}.`);
    else notes.push('Has usado <b>todas</b> las palabras. Bien.');
    const low=Math.round(s.target*0.75),high=Math.round(s.target*1.3);
    if(s.n<low)notes.push(`Llevas <b>${s.n}</b> caracteres; en el examen se esperan unos ${s.target}. Añade un detalle o una consecuencia.`);
    else if(s.n>high)notes.push(`<b>${s.n}</b> caracteres: te has pasado un poco. Recorta lo que no aporte.`);
    else notes.push(`<b>${s.n}</b> caracteres: longitud perfecta.`);
    if(/[,.?!;:]/.test(s.text))notes.push('Usa la puntuación china (<b>，。？！</b>), no la occidental (, . ? !).');
    if(!/[。！？]$/.test(s.text.trim()))notes.push('Termina con <b>。</b>');
    const sentences=s.text.split(/[。！？]/).filter(x=>hanzi(x).length).length;
    if(s.n>=low&&sentences<3)notes.push('Tienes muy pocas frases: divide las ideas en 3–5 frases cortas, se lee mejor.');
    const good=!s.missing.length&&s.n>=low;
    if(good&&!W.essayChecked){W.essayChecked=true;progress.update(W.key,{essay:s.text,essayOk:true});}
    good?sfx.ok():sfx.bad();
    tutor.say(`<span class="chip ${good?'good':'bad'}">${good?'APROBADO':'REVISA'}</span>
      <div class="tw">${good?pick(['Cumple con todo lo que pide el examen.','Bien. Ahora compáralo con mi modelo.']):'Unos retoques y lo tienes.'}</div>
      <ul class="pts">${notes.map(n=>`<li>${n}</li>`).join('')}</ul>
      <p class="hint">Yo solo compruebo palabras, longitud y puntuación. La gramática, compárala con el MODELO.</p>`,{mood:good?'happy':'oops'});
    updateScore();
    maybeFinish();
  }
  function toggleModel(btn){
    const box=readingEl.querySelector('.wr-model');
    const show=box.hidden;
    if(show&&!essayState().n&&!btn.dataset.warned){
      btn.dataset.warned='1';
      tutor.say(`<div class="tw">¿Sin escribir nada? Inténtalo primero: copiar no entrena. Si aun así quieres verlo, pulsa otra vez.</div>`,{mood:'oops',hold:3500});
      return;
    }
    box.hidden=!show;btn.setAttribute('aria-pressed',String(show));
    if(show){
      box.scrollIntoView({block:'nearest',behavior:'smooth'});
      tutor.say(`<div class="tw">Mi versión. Fíjate en cómo encajo las palabras en negrita y en los conectores.</div>`,{mood:'point',hold:2500});
    }
  }

  /* ---------- Resultado ---------- */
  function updateScore(){
    const its=W.items,solved=its.filter(x=>x.solved).length,first=its.filter(x=>x.first).length;
    const parts=its.length+(W.ex.redaccion?1:0),doneParts=solved+(W.ex.redaccion&&W.essayChecked?1:0);
    scoreEl.innerHTML=`<span class="ok">✓ ${first}</span> &nbsp;<span class="no">✗ ${its.reduce((a,x)=>a+x.tries,0)}</span>`;
    const m=readingEl.querySelector('#wrMeter');
    if(m)m.innerHTML=meterHTML(doneParts,parts,{label:`${doneParts} de ${parts} hechos`});
  }
  function maybeFinish(){
    const its=W.items;
    if(its.some(x=>!x.solved)||(W.ex.redaccion&&!W.essayChecked))return;
    if(W.finished)return;
    W.finished=true;
    const first=its.filter(x=>x.first).length;
    progress.update(W.key,{done:true,firstTry:first,total:its.length,errors:its.reduce((a,x)=>a+x.tries,0),
      wrongQuestions:its.map((x,i)=>x.first?0:i+1).filter(Boolean)});
    setTimeout(()=>tutor.say(`<span class="chip good">TERMINADO</span><div class="tw">Escritura completa${its.length?`: ${first} de ${its.length} frases a la primera`:''}. Escribir es lo que más cuesta, así que hoy te has ganado mi respeto. Un poquito.</div>`,{mood:'happy'}),1800);
  }

  /* ---------- Eventos ---------- */
  readingEl.addEventListener('click',e=>{
    if(!W||!readingEl.querySelector('.wr'))return;
    const put=e.target.closest('[data-put]');
    if(put){const [i,c]=put.dataset.put.split(':').map(Number);W.items[i].placed.push(c);drawItem(i);return;}
    const back=e.target.closest('[data-back]');
    if(back){const [i,k]=back.dataset.back.split(':').map(Number);W.items[i].placed.splice(k,1);drawItem(i);return;}
    const say=e.target.closest('[data-say]');
    if(say){speak(say.dataset.say);return;}
    if(e.target.closest('[data-say-model]')){speak(W.ex.redaccion.model);return;}
    const a=e.target.closest('[data-wact]');
    if(!a)return;
    const i=+a.dataset.i;
    switch(a.dataset.wact){
      case 'check':check(i);break;
      case 'hint':hint(i);break;
      case 'clear':W.items[i].placed=[];drawItem(i);break;
      case 'show':showSolution(i);break;
      case 'review':review();break;
      case 'listen':{const t=essayState().text;if(t.trim())speak(t);break;}
      case 'model':toggleModel(a);break;
    }
  });
  tutor.body.addEventListener('click',e=>{
    const say=W&&e.target.closest('[data-say]');
    if(say&&readingEl.querySelector('.wr'))speak(say.dataset.say);
  });
  readingEl.addEventListener('input',e=>{
    if(W&&e.target.id==='wrText')updateEssay();
  });
  async function speak(text){
    if(!(await chineseVoice()))
      tutor.say('<div class="tw">No encuentro voz china en este navegador.</div><a class="ev" href="#/voz">🔊 CÓMO ACTIVAR LA VOZ</a>',{mood:'oops',hold:3000});
    speakList([{text}],{rate:0.9});
  }

  return {
    load,
    reset(){if(!W)return;const draft=readingEl.querySelector('#wrText')?.value||'';W.items.forEach(it=>Object.assign(it,{order:shuffle(it.chunks.map((_,i)=>i)),placed:[],tries:0,hinted:false,solved:false,first:false}));W.finished=false;draw(draft);},
    unload(){
      if(W&&saveTimer){clearTimeout(saveTimer);const t=readingEl.querySelector('#wrText')?.value;if(t!=null)progress.update(W.key,{essay:t});}
      saveTimer=null;W=null;stop();
    },
    get active(){return !!W;}
  };
}
