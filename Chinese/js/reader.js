/* =====================================================
   LECTOR: dibuja un ejercicio (texto + preguntas) y gestiona
   palabras, análisis de frases y respuestas.
   Lógica migrada del prototipo; los datos vienen del JSON.
   ===================================================== */
import {lookup} from './data.js';
import * as audio from './audio.js';
import {sfx} from './sfx.js';
import * as notebook from './notebook.js';
import {meterHTML,setMeter} from './meter.js';

export const ROLE={
  sub:['Sujeto','主语'], verb:['Verbo / predicado','谓语'], obj:['Objeto / núcleo','宾语'],
  adv:['Circunstancial','状语'], attr:['Modificador','定语'], comp:['Complemento','补语'],
  par:['Partícula / palabra gramatical','助词'], con:['Conector','连词']
};
const ABCD='ABCD';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const isPunct=t=>'p' in t;
/* Puntuación china → equivalente en la línea de pinyin */
const PUNCT_PY={'，':',','。':'.','：':':','；':';','？':'?','！':'!','、':',','“':'“','”':'”','《':'«','》':'»'};

export function createReader({readingEl,scrollEl,scoreEl,tutor,onFinish,onToggleDone}){
  let ex=null,dict={},nav={},bySent=new Map();
  let st,lastWord=null;
  /* Palabra fijada con un clic: el paso del ratón no la cambia hasta hacer clic en otro sitio. */
  let pinned=false;
  /* Modo escucha: el texto empieza oculto y se oye con el reproductor. */
  let listen=false,slow=false,showText=false,playing=false;
  /* Pinyin encima de las palabras (se recuerda entre visitas). */
  let pinyin=false;
  try{pinyin=localStorage.getItem('hsk.pinyin')==='on';}catch{}
  /* Tamaño del texto (A− / A+), también recordado. */
  const FS=[0.85,1,1.15,1.3];
  let fs=1;
  try{const v=+localStorage.getItem('hsk.fs');if(v>=0&&v<FS.length&&localStorage.getItem('hsk.fs')!==null)fs=v;}catch{}
  const say=(html,opts)=>tutor.say(html,opts);
  tutor.onSay=keepWord=>{if(!keepWord){lastWord=null;pinned=false;}};

  function freshState(){
    st={sel:null,done:[],tries:[],first:0,errs:0};lastWord=null;
    audio.stop();playing=false;showText=!listen;
  }
  freshState();

  /* ---------- Dibujo ---------- */
  const tokensOf=key=>key===0?ex.titleTokens:bySent.get(key).tokens;
  function tokHTML(tokens,key){
    return tokens.map((t,ti)=>isPunct(t)
      ?`<span class="p">${t.p}</span>`
      :`<span class="w r-${t.role}" data-s="${key}" data-t="${ti}"><ruby>${t.zh}<rt>${lookup(t,dict).py}</rt></ruby></span>`).join('');
  }
  function barHTML(){
    return `<div class="bar">
      <button class="pbtn done-btn" data-act="done" aria-pressed="${!!nav.done}" title="Marcar o desmarcar este texto como terminado">${nav.done?'✓ TERMINADO':'<span class="lg-only">MARCAR </span>TERMINADO'}</button>
      <span class="bar-gap"></span>
      <button class="pbtn sq" data-act="fs-" title="Letra más pequeña" aria-label="Letra más pequeña"${fs===0?' disabled':''}>A−</button>
      <button class="pbtn sq" data-act="fs+" title="Letra más grande" aria-label="Letra más grande"${fs===FS.length-1?' disabled':''}>A+</button>
      <button class="pbtn" data-act="pinyin" aria-pressed="${pinyin}" title="Mostrar el pinyin encima de cada palabra (tecla P)">PINYIN</button>
    </div>`;
  }
  /* Palabras únicas del texto (título + frases) para la lista de vocabulario. */
  function vocabHTML(){
    const seen=new Map();
    for(const t of [...ex.titleTokens,...ex.sentences.flatMap(s=>s.tokens)]){
      if(isPunct(t))continue;
      const {py,es}=lookup(t,dict);
      const k=t.zh+'|'+es;
      if(!seen.has(k))seen.set(k,{zh:t.zh,py,es});
    }
    const words=[...seen.values()];
    vocabList=words;
    return `<details class="vocab"><summary>生词 · Vocabulario del texto <span>(${words.length})</span></summary>
      <ul>${words.map((w,i)=>`<li>
        <button class="v-zh" data-vw="${i}" title="Escuchar">${w.zh}</button>
        <span class="v-py">${w.py}</span><span class="v-es">${w.es}</span>
        <button class="v-star" data-vstar="${i}" aria-pressed="${notebook.has(w.zh)}" title="Guardar en el cuaderno">${notebook.has(w.zh)?'★':'☆'}</button>
      </li>`).join('')}</ul>
    </details>`;
  }
  let vocabList=[];
  function refreshBar(){
    const b=readingEl.querySelector('.bar');
    if(b)b.outerHTML=barHTML();
  }
  function setDone(v,{silent=false}={}){
    if(!!nav.done===v)return;
    nav.done=v;refreshBar();
    onToggleDone?.(v);
    if(silent)return;
    say(`<div class="tw">${v
      ?pick(['Anotado: terminado. Queda guardado en este navegador; si quieres llevártelo a otro, usa GUARDAR COPIA en el menú.','Terminado. Lo apunto en mi registro, que no se me olvida nada.'])
      :'Vale, lo desmarco. Ya me avisarás cuando lo termines de verdad.'}</div>`,{mood:v?'happy':'idle',hold:v?2500:0});
  }
  function navHTML(){
    const link=(id,label)=>id
      ?`<a class="navbtn" href="${nav.base}${id}">${label}</a>`
      :`<span class="navbtn off" aria-hidden="true">${label}</span>`;
    return `<nav class="nav" aria-label="Navegación entre ejercicios">
      ${link(nav.prev,'&lt; ANTERIOR')}
      <a class="navbtn" href="${nav.list}">LISTA</a>
      ${link(nav.next,'SIGUIENTE &gt;')}
    </nav>`;
  }
  function playerHTML(){
    return `<div class="player" role="group" aria-label="Reproductor">
      <button class="play" data-act="play">${playing?'■ PARAR':listen?'▶ ESCUCHAR':'▶ LEER<span class="lg-only"> EN VOZ ALTA</span>'}</button>
      <button class="pbtn" data-act="slow" aria-pressed="${slow}">LENTO</button>
      ${listen?`<button class="pbtn" data-act="text" aria-pressed="${showText}">${showText?'OCULTAR TEXTO':'VER TEXTO'}</button>`:''}
    </div>`;
  }
  function render(){
    let h=`<div class="ex${pinyin?' show-py':''}" style="--fs:${FS[fs]}">${barHTML()}<h2 class="title">${tokHTML(ex.titleTokens,0)}</h2><p class="subtitle">${ex.title.es}</p>`;
    h+=`<div class="list-meter">${meterHTML(0,ex.questions.length,{label:`0 de ${ex.questions.length} preguntas`,attrs:'data-exm'})}</div>`;
    h+=playerHTML();
    h+=`<div class="transcript"${showText?'':' hidden'}>`;
    ex.paragraphs.forEach(p=>{
      h+='<p class="para">'+p.map(n=>{
        const s=bySent.get(n);
        const spk=s.speaker?`<span class="spk">${s.speaker}</span>`:'';
        return `<span class="sent" data-s="${n}">${spk}<button class="rune" data-s="${n}" aria-label="Analizar la frase ${n}">${n}</button>${tokHTML(s.tokens,n)}</span>`;
      }).join('')+'</p>';
    });
    h+=vocabHTML()+'</div>';
    h+=`<section class="quiz"><h3>题目 · Preguntas</h3><p class="lead">${listen
      ?'Escucha el audio (las veces que quieras) y elige la respuesta. El texto está oculto: míralo solo si te atascas.'
      :'Elige la respuesta correcta. Si fallas, te explico por qué.'}</p>`;
    const wasWrong=nav.lastResult?.wrongQuestions||[];
    ex.questions.forEach((Q,qi)=>{
      const ww=wasWrong.includes(qi+1);
      h+=`<div class="q${ww?' was-wrong':''}" data-q="${qi}"><div class="qh"><span class="qn"${ww?' title="La fallaste la última vez"':''}>Q${qi+1}</span><span class="qs">${Q.stem}</span></div>
      <button class="qtr" data-q="${qi}">✦ traducir pregunta y opciones</button>
      <div class="opts">${Q.options.map((o,oi)=>`<button class="opt" data-q="${qi}" data-o="${oi}"><b>${ABCD[oi]}</b><span>${o.zh}</span></button>`).join('')}</div></div>`;
    });
    h+='</section>'+navHTML()+'<div class="endnote"></div></div>';
    readingEl.innerHTML=h;
    voiceWarning();
  }
  /* Aviso fijo bajo el reproductor si el navegador no tiene voz china. */
  function voiceWarning(){
    audio.chineseVoice().then(v=>{
      if(v||!ex)return;
      readingEl.querySelector('.player')?.insertAdjacentHTML('afterend',
        '<a class="voice-warn" href="#/voz">⚠ Este navegador no tiene voz china · <b>cómo activarla (Edge, Windows 11)</b></a>');
    });
  }
  function refreshPlayer(){
    const p=readingEl.querySelector('.player');
    if(p)p.outerHTML=playerHTML(); // el aviso de voz va fuera del reproductor: no se pierde
  }

  /* ---------- Escucha ---------- */
  const sentText=s=>s.tokens.map(t=>isPunct(t)?t.p:t.zh).join('');
  function markSpeaking(n){
    readingEl.querySelectorAll('.sent.speaking').forEach(x=>x.classList.remove('speaking'));
    const el=n!=null&&readingEl.querySelector(`.sent[data-s="${n}"]`);
    if(el){
      el.classList.add('speaking');
      if(showText)el.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  }
  async function warnNoVoice(){
    if(!audio.ttsSupported){
      say(`<div class="tw">Hmph. Este navegador no sabe leer en voz alta. Usa Microsoft Edge.</div><a class="ev" href="#/voz">🔊 CÓMO ACTIVAR LA VOZ</a>`,{mood:'oops'});
      return true;
    }
    if(!(await audio.chineseVoice())){
      say(`<div class="tw">No encuentro ninguna voz china en este navegador, así que puede sonar raro o no sonar.</div><a class="ev" href="#/voz">🔊 CÓMO ACTIVAR LA VOZ</a>`,{mood:'oops'});
    }
    return false;
  }
  async function playAll(){
    if(playing){audio.stop();playing=false;markSpeaking(null);refreshPlayer();return;}
    playing=true;refreshPlayer();
    const rate=slow?0.7:1;
    let ok;
    if(ex.audio&&nav.audioBase)ok=await audio.playFile(nav.audioBase+ex.audio,{rate});
    else{
      if(await warnNoVoice()){playing=false;refreshPlayer();return;}
      ok=await audio.speakList(ex.sentences.map(s=>({text:sentText(s),speaker:s.speaker})),
        {rate,onItem:i=>markSpeaking(ex.sentences[i].n)});
    }
    playing=false;refreshPlayer();
    if(ok)markSpeaking(null);
  }
  async function playSentence(n){
    playing=false;refreshPlayer();
    if(await warnNoVoice())return;
    const s=bySent.get(n);
    markSpeaking(n);
    await audio.speakList([{text:sentText(s),speaker:s.speaker}],{rate:slow?0.7:1});
    markSpeaking(null);
  }
  /* Al tocar una palabra se pronuncia (solo si hay voz china y no está sonando el audio entero). */
  async function speakWord(el){
    if(playing||!audio.ttsSupported)return;
    const t=tokensOf(+el.dataset.s)[+el.dataset.t];
    if(!(await audio.chineseVoice()))return;
    audio.speakList([{text:t.zh}],{rate:0.85});
  }
  /* Pronuncia un texto suelto desde un botón (avisa si no hay voz). */
  async function speakText(text){
    if(playing){audio.stop();playing=false;markSpeaking(null);refreshPlayer();}
    if(!audio.ttsSupported||!(await audio.chineseVoice())){await warnNoVoice();if(!audio.ttsSupported)return;}
    audio.speakList([{text}],{rate:0.85});
  }
  function setShowText(v){
    showText=v;
    readingEl.querySelector('.transcript').hidden=!v;
    if(!v)clearSel();
    refreshPlayer();
  }

  function updateScore(){
    const n=st.done.filter(Boolean).length,t=ex.questions.length;
    setMeter(readingEl.querySelector('[data-exm]'),n,t,`${n} de ${t} preguntas`);
    scoreEl.innerHTML=`<span class="ok">✓ ${st.first}/${ex.questions.length}</span> &nbsp;<span class="no">✗ ${st.errs}</span>`;
  }

  /* ---------- Palabras ---------- */
  function showWord(el){
    const si=+el.dataset.s,ti=+el.dataset.t,key=si+'-'+ti;
    if(lastWord===key)return;
    lastWord=key;
    readingEl.querySelectorAll('.w.on').forEach(x=>x.classList.remove('on'));
    el.classList.add('on');
    const t=tokensOf(si)[ti];
    const {py,es}=lookup(t,dict);
    const role=(st.sel===si)?`<span class="chip role r-${t.role}">${ROLE[t.role][0]} · ${ROLE[t.role][1]}</span>`:'';
    const hint=si===0?'':`<p class="hint">Frase ${si} · pulsa el sello ${si} para analizarla entera.${pinned?'':' Haz clic en la palabra para fijarla y guardarla.'}</p>`;
    curWord={zh:t.zh,py,es,src:nav.key||''};
    say(`<div class="wcard"><span class="hz">${t.zh}</span><span class="pyw">${py}</span>
         <span class="wbtns"><button class="star" data-sayword title="Escuchar la palabra">▶ OÍR</button>${starHTML()}</span></div>
         <p class="trans">${es}</p>${role}${hint}`,{type:false,mood:'think',keepWord:true});
  }
  let curWord=null;
  function starHTML(){
    const on=curWord&&notebook.has(curWord.zh);
    return `<button class="star" data-star aria-pressed="${on}" title="Guardar en el cuaderno de vocabulario">${on?'★ EN EL CUADERNO':'☆ GUARDAR'}</button>`;
  }

  /* ---------- Frases: análisis ---------- */
  function pinyinOf(n){
    const s=bySent.get(n).tokens
      .map(t=>isPunct(t)?(PUNCT_PY[t.p]||''):lookup(t,dict).py)
      .filter(Boolean).join(' ')
      .replace(/ ([,.:;?!”»])/g,'$1').replace(/([“«]) /g,'$1');
    return s.charAt(0).toUpperCase()+s.slice(1);
  }
  function clearSel(){
    readingEl.querySelectorAll('.sent.sel').forEach(x=>x.classList.remove('sel'));
    readingEl.classList.remove('has-sel');st.sel=null;
  }
  function toggleSentence(n){
    if(st.sel===n){clearSel();say(`<div class="tw">Selección anulada. Elige otra frase cuando quieras.</div>`,{mood:'idle'});return;}
    clearSel();st.sel=n;
    readingEl.querySelector(`.sent[data-s="${n}"]`).classList.add('sel');
    readingEl.classList.add('has-sel');
    const d=bySent.get(n);
    const roles=[...new Set(d.tokens.filter(t=>!isPunct(t)).map(t=>t.role))];
    const legend=roles.map(r=>`<span class="lg r-${r}"><i></i>${ROLE[r][0]} ${ROLE[r][1]}</span>`).join('');
    say(`<span class="chip">FRASE ${n}</span>
      <div class="pyl">${pinyinOf(n)}</div>
      <div class="tw">${d.es}</div>
      <div class="legend">${legend}</div>
      <div class="pat"><small>ESTRUCTURA</small>${d.pattern}</div>
      <ul class="pts">${d.points.map(p=>`<li>${p}</li>`).join('')}</ul>
      <button class="ev" data-say="${n}">▶ Escuchar la frase</button>`,{mood:'think'});
    /* En escucha se lee la frase sola, salvo que esté sonando el audio completo: no hay que cortarlo. */
    if(listen&&!playing)playSentence(n);
  }

  /* ---------- Preguntas ---------- */
  function translateQ(qi){
    const Q=ex.questions[qi];
    say(`<span class="chip">PREGUNTA ${qi+1}</span>
     <div class="tw">${Q.stemEs}</div>
     <div class="qtx" style="margin-top:8px">${Q.options.map((o,i)=>`<p><b>${ABCD[i]}</b>${o.es}</p>`).join('')}</div>`,{mood:'think'});
  }
  function answer(qi,oi){
    const Q=ex.questions[qi],qEl=readingEl.querySelector(`.q[data-q="${qi}"]`);
    const btn=qEl.querySelector(`.opt[data-o="${oi}"]`);
    const {why,evidence:ev}=Q.options[oi];
    const evBtn=!ev?'':listen
      ?`<button class="ev" data-s="${ev}">▶ Escuchar la frase ${ev}</button>`
      :`<button class="ev" data-s="${ev}">Ver la frase ${ev} en el texto ↑</button>`;
    const total=ex.questions.length;
    if(oi===Q.answer){
      sfx.ok();
      btn.classList.add('ok');qEl.classList.add('locked');
      qEl.querySelectorAll('.opt').forEach(b=>b.disabled=true);
      st.done[qi]=true;if(!st.tries[qi])st.first++;
      updateScore();
      const all=ex.questions.every((_,i)=>st.done[i]);
      if(all&&onFinish)onFinish(ex.id,{
        firstTry:st.first,total,errors:st.errs,
        wrongQuestions:ex.questions.map((_,i)=>i+1).filter(i=>st.tries[i-1])
      });
      if(all)setDone(true,{silent:true});
      if(all&&listen&&!showText)setShowText(true);
      const next=(listen?' Ya puedes ver el texto completo: repásalo con los sellos.':'')
        +(nav.next?' Abajo tienes el botón para pasar al siguiente texto.':'');
      const end=all?`<p class="why"><span class="chip good">FIN</span> Resultado a la primera: <b>${st.first}/${total}</b>. ${st.first===total?'Impecable. Como era de esperar.':st.first>=total-1?'Muy bien. Casi perfecto.':'Repasa las trampas de las opciones falladas y verás cómo sube.'}${next}</p>`:'';
      say(`<span class="chip good">CORRECTO · ${ABCD[oi]}</span>
        <div class="tw">${pick(['Obvio. Con una tutora como yo, no podía ser de otra forma.','Bien. Para eso me tienes.','Correcto. No esperaba menos.'])}</div>
        <p class="why">${why}</p>${evBtn}${end}`,{mood:'happy',hold:all?0:7000});
    }else{
      sfx.bad();
      btn.classList.add('bad');btn.disabled=true;
      st.tries[qi]=(st.tries[qi]||0)+1;st.errs++;updateScore();
      say(`<span class="chip bad">INCORRECTO · ${ABCD[oi]}</span>
        <div class="tw">${pick(['Hmph, no tan rápido.','Casi… pero no. Escucha.','Error clásico de examen. Atiende.'])}</div>
        <p class="why">${why}</p>${evBtn}`,{mood:'oops',hold:7000});
    }
  }

  /* ---------- Eventos ---------- */
  readingEl.addEventListener('mouseover',e=>{
    if(!ex||pinned||!window.matchMedia('(hover:hover)').matches)return;
    const w=e.target.closest('.w');if(w)showWord(w);
  });
  readingEl.addEventListener('mouseleave',()=>{if(!pinned)readingEl.querySelectorAll('.w.on').forEach(x=>x.classList.remove('on'));});
  readingEl.addEventListener('click',e=>{
    if(!ex)return;
    const w=e.target.closest('.w');
    if(w){lastWord=null;pinned=true;showWord(w);speakWord(w);return;}
    pinned=false;
    const r=e.target.closest('.rune');
    if(r){toggleSentence(+r.dataset.s);return;}
    const tr=e.target.closest('.qtr');
    if(tr){translateQ(+tr.dataset.q);return;}
    const o=e.target.closest('.opt');
    if(o&&!o.disabled){answer(+o.dataset.q,+o.dataset.o);return;}
    const act=e.target.closest('[data-act]')?.dataset.act;
    if(act==='play')playAll();
    else if(act==='slow'){slow=!slow;refreshPlayer();}
    else if(act==='text')setShowText(!showText);
    else if(act==='pinyin')togglePinyin();
    else if(act==='fs-'||act==='fs+'){
      fs=Math.max(0,Math.min(FS.length-1,fs+(act==='fs+'?1:-1)));
      try{localStorage.setItem('hsk.fs',String(fs));}catch{}
      readingEl.querySelector('.ex')?.style.setProperty('--fs',FS[fs]);
      refreshBar();
    }
    const vw=e.target.closest('[data-vw]');
    if(vw){speakText(vocabList[+vw.dataset.vw].zh);return;}
    const vs=e.target.closest('[data-vstar]');
    if(vs){
      const w=vocabList[+vs.dataset.vstar];
      const on=notebook.toggle({...w,src:nav.key||''});
      vs.setAttribute('aria-pressed',String(on));vs.textContent=on?'★':'☆';
      if(on)sfx.ok();
    }
    else if(act==='done')setDone(!nav.done);
  });
  function togglePinyin(){
    pinyin=!pinyin;
    try{localStorage.setItem('hsk.pinyin',pinyin?'on':'off');}catch{}
    readingEl.querySelector('.ex')?.classList.toggle('show-py',pinyin);
    readingEl.querySelector('[data-act="pinyin"]')?.setAttribute('aria-pressed',String(pinyin));
  }
  tutor.body.addEventListener('click',e=>{
    if(e.target.closest('[data-sayword]')&&curWord){speakText(curWord.zh);return;}
    const star=e.target.closest('[data-star]');
    if(star&&curWord){
      const on=notebook.toggle(curWord);
      star.outerHTML=starHTML();
      if(on)sfx.ok();
      return;
    }
    const sayBtn=e.target.closest('[data-say]');
    if(sayBtn&&ex){playSentence(+sayBtn.dataset.say);return;}
    const ev=e.target.closest('.ev[data-s]');
    if(!ev||!ex)return;
    const n=+ev.dataset.s;
    if(listen)playSentence(n);
    if(!showText)return;
    const el=readingEl.querySelector(`.sent[data-s="${n}"]`);
    if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');}
  });
  /* Teclado: Esc quita la selección · 1–4 o A–D responde la primera pregunta pendiente ·
     P pinyin · T traduce esa pregunta. */
  document.addEventListener('keydown',e=>{
    if(!ex||e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('input,textarea,select'))return;
    const k=e.key.toLowerCase();
    if(k==='escape'){if(st.sel)clearSel();pinned=false;return;}
    if(k==='p'){togglePinyin();return;}
    const qi=ex.questions.findIndex((_,i)=>!st.done[i]);
    if(qi<0)return;
    if(k==='t'){translateQ(qi);return;}
    const oi='1234'.indexOf(k)>=0?'1234'.indexOf(k):'abcd'.indexOf(k);
    if(oi<0)return;
    const btn=readingEl.querySelector(`.opt[data-q="${qi}"][data-o="${oi}"]`);
    if(!btn||btn.disabled)return;
    e.preventDefault();
    btn.closest('.q').scrollIntoView({behavior:'smooth',block:'center'});
    btn.click();
  });

  /* ---------- API ---------- */
  return{
    /* Carga un ejercicio.
       navInfo = {prev, next (ids o null), base ("#/hsk3/lectura/"), list (enlace a la lista),
                  skill ("lectura"|"escucha"), audioBase (carpeta para "audio"),
                  key ("hsk3/lectura/001"), done (bool), lastResult (progreso anterior)} */
    load(exercise,dictionary,navInfo){
      ex=exercise;dict=dictionary;nav=navInfo||{};
      listen=nav.skill==='escucha';
      bySent=new Map(ex.sentences.map(s=>[s.n,s]));
      readingEl.classList.remove('has-sel');
      freshState();render();updateScore();scrollEl.scrollTop=0;
    },
    reset(){
      if(!ex)return;
      readingEl.classList.remove('has-sel');
      freshState();render();updateScore();scrollEl.scrollTop=0;
    },
    unload(){ex=null;freshState();readingEl.classList.remove('has-sel');},
    get listening(){return listen;}
  };
}
