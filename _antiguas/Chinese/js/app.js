/* =====================================================
   APP: arranque, menús y navegación.
   Rutas:  #/                    → elegir nivel (HSK 1–6)
           #/hsk3                → elegir lectura o escucha
           #/hsk3/lectura        → lista de textos
           #/hsk3/lectura/001    → ejercicio
   ===================================================== */
import {LEVELS,SKILLS,WRITING,folderOf,loadLibrary,loadDictionary,loadExercise,loadWriting,loadPhrases} from './data.js';
import {createWriting} from './writing.js';
import * as srs from './srs.js';
import * as progress from './progress.js';
import {createTutor} from './tutor.js';
import {createReader} from './reader.js';
import {sfx} from './sfx.js';
import * as notebook from './notebook.js';
import * as backup from './backup.js';
import * as cloud from './cloud.js';
import * as profile from './profile.js';
import {meterHTML,setMeter} from './meter.js';
import {chineseVoice,speakList} from './audio.js';
import * as phx from './phrases.js';

const $=s=>document.querySelector(s);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const readingEl=$('#reading'),scrollEl=$('#scroll'),scoreEl=$('#score');
const backBtn=$('#back'),resetBtn=$('#reset'),heading=$('#heading'),tab=$('#tab'),badge=$('#badge');

const LEVEL_INFO={
  1:['入门','Iniciación','150 palabras'],
  2:['基础','Básico','300 palabras'],
  3:['初级','Elemental','600 palabras'],
  4:['中级','Intermedio','1200 palabras'],
  5:['中高级','Intermedio alto','2500 palabras'],
  6:['高级','Avanzado','5000 palabras']
};
const SKILL_INFO={
  lectura:{zh:'阅读',label:'LECTURA',es:'Comprensión escrita',desc:'Lees el texto y respondes.',icon:'读'},
  escucha:{zh:'听力',label:'ESCUCHA',es:'Comprensión oral',desc:'Escuchas el audio y respondes.',icon:'听'},
  escritura:{zh:'书写',label:'ESCRITURA',es:'Expresión escrita',desc:'Ordenas frases y escribes redacciones.',icon:'写'},
  frases:{zh:'句子',label:'FRASES',es:'Entrena el oído',desc:'Oyes frases y demuestras que las entiendes.',icon:'句'}
};
const MENU_SKILLS=[...SKILLS,WRITING,'frases'];

const tutor=createTutor({canvas:$('#girl'),body:$('#dlgBody')});
let current=null; // ejercicio abierto (entrada de la biblioteca)
const reader=createReader({
  readingEl,scrollEl,scoreEl,tutor,
  onFinish:(_id,result)=>{if(current)progress.saveResult(current.key,result);},
  onToggleDone:done=>{if(current)progress.setDone(current.key,done);}
});

const writing=createWriting({readingEl,scrollEl,scoreEl,tutor});

let dict={},loadToken=0,lastOpened=null;
const seen=new Set(); // pantallas en las que la tutora ya se ha presentado

/* ---------- Utilidades de pantalla ---------- */
function frame({title,tabText,badgeText='HSK',back=null,reset=false,score=''}){
  loadToken++;
  current=null;
  reader.unload();
  writing.unload();
  heading.textContent=title;
  tab.textContent=tabText;
  badge.textContent=badgeText;
  backBtn.hidden=!back;backBtn.dataset.href=back||'';
  resetBtn.hidden=!reset;
  scoreEl.innerHTML=score||'&nbsp;';
}
function talk(key,first,again,mood='point'){
  tutor.setBase(mood);
  tutor.say(`<div class="tw">${seen.has(key)?pick(again):first}</div>`,{mood});
  seen.add(key);
}
function focusCard(sel){
  const card=sel&&readingEl.querySelector(sel);
  if(card){card.scrollIntoView({block:'center'});card.focus({preventScroll:true});}
  else scrollEl.scrollTop=0;
}

/* ---------- 1 · Elegir nivel ---------- */
function continueHTML(){
  const m=(progress.getLast()||'').match(/^hsk([1-6])\/(lectura|escucha|escritura)\/(\d+)$/);
  if(!m)return '';
  return `<a class="cont" href="#/${m[0]}">▶ CONTINUAR<span>HSK ${m[1]} · ${m[2]} · ${m[2]===WRITING?'ejercicio':'texto'} ${m[3]}</span></a>`;
}
function quickHTML(){
  const n=notebook.count(),pend=n?notebook.stats().today:0;
  return `<div class="quick">${continueHTML()}
    <a class="cont alt" href="#/cuaderno">★ CUADERNO<b class="nb-badge${pend?'':' zero'}" title="${pend} por repasar hoy" aria-label="${pend} por repasar hoy">${pend>99?'99+':pend}</b><span>${n?`${n} palabra${n>1?'s':''} guardada${n>1?'s':''}`:'生词本 · vocabulario'}</span></a>
    <a class="cont alt" href="#/perfil">☺ PERFIL<span>${esc(profile.get().name||'tu progreso')}</span></a>
    <button class="cont alt" data-outfit title="Cambiar la ropa de la tutora">✿ ROPA<span>vestuario de la tutora</span></button>
  </div>`;
}
function backupHTML(){
  return `<div class="backup">
    <span class="backup-t">PROGRESO</span>
    <a class="pbtn${cloud.loggedIn()?' on':''}" href="#/cuenta" title="Guardar el progreso en tu cuenta">☁ CUENTA${cloud.loggedIn()?' ✓':''}</a>
    <button class="pbtn" data-backup="save" title="Descargar una copia de tu progreso y tu cuaderno">⇩ GUARDAR<span class="lg-only"> COPIA</span></button>
    <button class="pbtn" data-backup="load" title="Cargar una copia descargada antes (se suma, no borra nada)">⇧ CARGAR</button>
    <button class="pbtn sq" data-backup="info" title="¿Para qué sirve?" aria-label="¿Para qué sirve la copia?">?</button>
  </div>`;
}
function showLevels(from){
  frame({title:'阅读理解 · 读书小屋',tabText:'NIVEL',
    score:`<span class="ok">✓ ${progress.doneCount('hsk')}</span>`});
  scoreEl.title='Ejercicios terminados en total';
  document.title='HSK · 阅读小屋';
  readingEl.innerHTML=`<section class="menu">
    <h2 class="lib-title">选择等级 · Elige nivel</h2>
    <p class="subtitle">Del HSK 1 (iniciación) al HSK 6 (avanzado)</p>
    ${quickHTML()}
    <ul class="levels">${LEVELS.map(l=>{
      const [zh,es,words]=LEVEL_INFO[l];
      return `<li><a class="lvl lvl-${l}" href="#/hsk${l}" data-level="${l}">
        <span class="lvl-n">HSK<b>${l}</b></span>
        <span class="lvl-zh">${zh}</span>
        <span class="lvl-es">${es}</span>
        <span class="lvl-w">${words}</span>
        ${meterHTML(0,1,{label:'…',attrs:`data-lm="${l}"`})}
      </a></li>`;}).join('')}</ul>
    ${backupHTML()}
  </section>`;
  focusCard(from&&`.lvl[data-level="${from}"]`);
  /* Medidor de cada nivel: textos terminados + frases aprendidas */
  const myL=loadToken;
  LEVELS.forEach(l=>levelStats(l).then(st=>{
    if(myL!==loadToken)return;
    const s=sumStats(st);
    setMeter(readingEl.querySelector(`[data-lm="${l}"]`),s.done,s.total,s.total?`${Math.round(100*s.done/s.total)} %`:'—');
  }));
  talk('levels',
    'Bienvenido. Elige ahí arriba tu nivel de HSK y empezamos. Yo los domino todos, por supuesto.',
    ['¿Qué nivel toca hoy? Señalo, tú eliges.','Arriba tienes los niveles. Elige uno, no tengo todo el día.','Del 1 al 6. Yo recomendaría el 6, pero no todo el mundo es como yo.']);
}

/* ---------- Copia de seguridad ---------- */
readingEl.addEventListener('click',async e=>{
  const b=e.target.closest('[data-backup]');
  if(!b)return;
  if(b.dataset.backup==='info'){
    tutor.say(`<div class="tw">Tu progreso se guarda de dos formas. Te lo explico, que es importante.</div>
      <ul class="guide">
        <li><i>CUENTA</i><span><b>Con correo (recomendado).</b> Entra en ☁ CUENTA con tu email: tu progreso, tus frases, tu cuaderno y tu perfil se guardan solos en la nube y te siguen a cualquier ordenador o móvil.</span></li>
        <li><i>COPIA</i><span><b>Sin cuenta.</b> Todo se queda solo en este navegador. Pulsa GUARDAR COPIA de vez en cuando para descargar un archivo con tu avance; con CARGAR lo recuperas aquí o en otro dispositivo. Cargar suma, nunca borra nada.</span></li>
      </ul>`,{mood:'point'});
    return;
  }
  if(b.dataset.backup==='save'){
    backup.download();
    tutor.say(`<div class="tw">Copia descargada. Guárdala en un sitio seguro; yo no puedo vigilar tu carpeta de descargas.</div>`,{mood:'happy',hold:3000});
    return;
  }
  try{
    const r=await backup.upload();
    tutor.say(`<div class="tw">Copia cargada: ${r.progress} ejercicio${r.progress===1?'':'s'} actualizado${r.progress===1?'':'s'} y ${r.words} palabra${r.words===1?'':'s'} nueva${r.words===1?'':'s'} en el cuaderno.</div>`,{mood:'happy',hold:3000});
    route();
  }catch(err){
    sfx.bad();
    tutor.say(`<div class="tw">Hmph. ${esc(err.message)}</div>`,{mood:'oops',hold:4000});
  }
});

/* ---------- Vestuario de la tutora ---------- */
const OUTFIT_LINES={
  Uniforme:'El uniforme de siempre. Clásico, elegante… como yo.',
  Qipao:'¿Un qipao? Perfecto para leer en chino. Admite que me queda de maravilla.',
  Invierno:'Jersey y bufanda. Estudiar calentita rinde más, está demostrado. Por mí.',
  Deportiva:'Chándal: hoy toca entrenar la memoria. Venga, a sudar caracteres.'
};
readingEl.addEventListener('click',e=>{
  if(!e.target.closest('[data-outfit]'))return;
  const name=tutor.nextOutfit();
  tutor.say(`<div class="tw">${OUTFIT_LINES[name]||name}</div>`,{mood:'happy',hold:2500});
});

/* ---------- Estadísticas para los medidores ---------- */
async function levelStats(level){
  const [lec,esc_,wr,fr]=await Promise.all([loadLibrary(level,'lectura'),loadLibrary(level,'escucha'),loadLibrary(level,WRITING),loadPhrases(level)]);
  const done=lib=>lib.filter(e=>progress.get(e.key)?.done).length;
  const s=phStats(level,fr.items);
  return {
    lectura:{done:done(lec),total:lec.length},
    escucha:{done:done(esc_),total:esc_.length},
    escritura:{done:done(wr),total:wr.length},
    frases:{done:s.learned,total:s.total,today:s.today}
  };
}
const sumStats=st=>MENU_SKILLS.reduce((a,s)=>({done:a.done+st[s].done,total:a.total+st[s].total}),{done:0,total:0});

/* ---------- Cuenta (Supabase) ---------- */
let recoveryMode=false,redirectShown=false;
function showAccount(){
  frame({title:'☁ Cuenta',tabText:'CUENTA',back:'#/'});
  document.title='Cuenta · 阅读小屋';
  let body;
  if(!cloud.configured){
    body=`<p class="msg">Las cuentas todavía no están activadas en esta web: falta poner los datos de Supabase en <code>js/config.js</code>. Mientras tanto, tu progreso se guarda en este navegador (y puedes usar GUARDAR COPIA).</p>`;
  }else if(recoveryMode&&cloud.loggedIn()){
    body=`<form class="gh-form" data-acc="newpass">
      <label>Nueva contraseña<input name="password" type="password" minlength="6" autocomplete="new-password" required></label>
      <div class="gh-btns"><button class="pbtn" type="submit">GUARDAR CONTRASEÑA</button></div>
    </form>`;
  }else if(cloud.loggedIn()){
    body=`<div class="gh-form acc-in">
      <p class="acc-mail">Has entrado como <b>${esc(cloud.user()?.email||'')}</b></p>
      <div class="gh-btns">
        <button class="pbtn" data-acc="sync">☁ SINCRONIZAR AHORA</button>
        <button class="pbtn" data-acc="out">CERRAR SESIÓN</button>
      </div>
      <p class="gh-status" id="accStatus">${esc(cloud.status.msg||'Tu progreso se guarda solo en tu cuenta.')}</p>
    </div>`;
  }else{
    body=`<form class="gh-form" data-acc="login" autocomplete="on">
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Contraseña<input name="password" type="password" minlength="6" autocomplete="current-password" required></label>
      <div class="gh-btns">
        <button class="pbtn" type="submit" value="in">ENTRAR</button>
        <button class="pbtn" type="submit" value="up">CREAR CUENTA</button>
        <button class="pbtn" type="button" data-acc="forgot">¿OLVIDASTE LA CONTRASEÑA?</button>
      </div>
      <p class="gh-status" id="accStatus"></p>
    </form>`;
  }
  const linkErr=cloud.redirectError&&!redirectShown?`<p class="msg errs">${esc(cloud.redirectError)}</p>`:'';
  redirectShown=true;
  readingEl.innerHTML=`<section class="lib gh">
    <h2 class="lib-title">Tu cuenta</h2>${linkErr}
    <p class="subtitle">Con una cuenta, tu progreso, tu cuaderno y tus frases se guardan en la nube y te siguen a cualquier dispositivo. Es gratis.</p>
    ${body}
  </section><div class="endnote"></div>`;
  talk('account',cloud.loggedIn()?'Todo lo que haces queda guardado en tu cuenta. Ni yo podría perderlo.':'Crea una cuenta y no perderás nunca tu progreso. Bueno, ni con cuenta ni sin ella: yo lo vigilo.',
    ['Ajustes de la cuenta.'],'idle');
}
const accMsg=(t,bad=false)=>{const el=document.getElementById('accStatus');if(el){el.textContent=t;el.classList.toggle('bad',bad);}};
readingEl.addEventListener('submit',async e=>{
  const f=e.target.closest('[data-acc]');
  if(!f)return;
  e.preventDefault();
  const d=new FormData(f);
  try{
    if(f.dataset.acc==='newpass'){
      await cloud.setPassword(d.get('password'));recoveryMode=false;sfx.ok();
      tutor.say('<div class="tw">Contraseña cambiada. Esta vez apúntala en un sitio seguro.</div>',{mood:'happy',hold:2500});
      showAccount();return;
    }
    const up=e.submitter?.value==='up';
    accMsg(up?'Creando la cuenta…':'Entrando…');
    if(up){
      const inNow=await cloud.signUp(d.get('email').trim(),d.get('password'));
      if(!inNow){accMsg('Cuenta creada. Te he enviado un correo: pulsa el enlace para confirmarla y vuelve aquí.');return;}
    }else await cloud.signIn(d.get('email').trim(),d.get('password'));
    sfx.ok();
    tutor.say('<div class="tw">Bienvenido. He unido tu progreso de este navegador con el de tu cuenta.</div>',{mood:'happy',hold:3000});
    showAccount();
  }catch(err){sfx.bad();accMsg(err.message,true);}
});
readingEl.addEventListener('click',async e=>{
  const b=e.target.closest('[data-acc]:not(form)');
  if(!b)return;
  try{
    if(b.dataset.acc==='sync'){await cloud.sync();sfx.ok();}
    else if(b.dataset.acc==='out'){await cloud.signOut();showAccount();
      tutor.say('<div class="tw">Sesión cerrada. Tu progreso sigue también en este navegador.</div>',{mood:'idle'});}
    else if(b.dataset.acc==='forgot'){
      const email=readingEl.querySelector('input[name="email"]')?.value.trim();
      if(!email){accMsg('Escribe tu email arriba y vuelve a pulsar.',true);return;}
      await cloud.recover(email);
      accMsg('Te he enviado un correo con un enlace para cambiar la contraseña.');
    }
  }catch(err){sfx.bad();accMsg(err.message,true);}
});
cloud.onStatus(s=>{
  const el=document.getElementById('accStatus');
  if(el){el.textContent=s.msg+(s.state==='ok'&&s.last?` (${s.last.toLocaleTimeString('es-ES')})`:'');el.classList.toggle('bad',s.state==='error');}
  else if(s.state==='error')tutor.say(`<div class="tw">Ojo: no he podido guardar en tu cuenta (${esc(s.msg)}). Revísalo en ☁ CUENTA.</div>`,{mood:'oops',hold:5000});
});

/* ---------- Perfil: foto, nombre y progreso ---------- */
async function showProfile(){
  const pr=profile.get();
  const name=pr.name||(cloud.user()?.email||'').split('@')[0]||'Estudiante';
  frame({title:'Perfil',tabText:'PERFIL',back:'#/'});
  document.title='Perfil · 阅读小屋';
  const my=loadToken;
  readingEl.innerHTML=`<section class="menu profile">
    <div class="pf-head">
      <button class="pf-photo" data-pf="photo" title="Cambiar foto" aria-label="Cambiar foto de perfil">
        ${pr.photo?`<img src="${pr.photo}" alt="">`:'<span aria-hidden="true">学</span>'}
        <em>CAMBIAR</em>
      </button>
      <form class="pf-name" data-pf="name">
        <input name="name" value="${esc(name)}" maxlength="30" aria-label="Tu nombre" autocomplete="nickname">
        <button class="pbtn" type="submit">GUARDAR</button>
      </form>
    </div>
    <div class="pf-total">${meterHTML(0,1,{label:'Calculando…',attrs:'data-pm="total"'})}</div>
    <ul class="pf-levels">${LEVELS.map(l=>`<li><span class="pf-l">HSK ${l}</span>${meterHTML(0,1,{label:'…',attrs:`data-pm="${l}"`})}</li>`).join('')}</ul>
    <div class="pf-reset"><button class="pbtn danger" data-pf="reset" title="Borra los textos terminados y el repaso de frases y cuaderno">↺ REINICIAR PROGRESO</button></div>
  </section>`;
  talk('profile','Tu perfil. Ponte una foto decente, que yo salgo siempre perfecta.',['Así vas. Yo diría que bien… pero puede ir mejor.'],'idle');
  let tot={done:0,total:0};
  for(const l of LEVELS){
    const st=sumStats(await levelStats(l));
    if(my!==loadToken)return;
    tot.done+=st.done;tot.total+=st.total;
    setMeter(readingEl.querySelector(`[data-pm="${l}"]`),st.done,st.total);
  }
  setMeter(readingEl.querySelector('[data-pm="total"]'),tot.done,tot.total,
    `Progreso total: ${tot.done} de ${tot.total} (${tot.total?Math.round(100*tot.done/tot.total):0} %)`);
}
readingEl.addEventListener('submit',e=>{
  const f=e.target.closest('[data-pf="name"]');
  if(!f)return;
  e.preventDefault();
  profile.setName(new FormData(f).get('name')||'');
  sfx.ok();
  tutor.say(`<div class="tw">Encantada, ${esc(profile.get().name||'Estudiante')}. Aunque ya te conocía.</div>`,{mood:'happy',hold:2500});
});
/* Reiniciar progreso: hay que pulsar dos veces (la segunda en menos de 5 s). */
let resetArmed=0;
readingEl.addEventListener('click',async e=>{
  const b=e.target.closest('[data-pf="reset"]');
  if(!b)return;
  if(Date.now()-resetArmed>5000){
    resetArmed=Date.now();
    b.textContent='¿SEGURO? PULSA OTRA VEZ';b.classList.add('armed');
    tutor.say('<div class="tw">¿Seguro? Borro los textos terminados, el repaso de las frases y el del cuaderno. Tus palabras guardadas, tus redacciones, tu nombre y tu foto se quedan. Si es lo que quieres, pulsa otra vez.</div>',{mood:'oops',hold:5000});
    setTimeout(()=>{if(b.isConnected&&Date.now()-resetArmed>=5000){b.textContent='↺ REINICIAR PROGRESO';b.classList.remove('armed');}},5100);
    return;
  }
  resetArmed=0;
  progress.clearAll();srs.clearAll();notebook.resetReviews();
  let cloudMsg='';
  if(cloud.loggedIn()){
    try{await cloud.overwrite();cloudMsg=' También en tu cuenta.';}
    catch(err){cloudMsg=` Ojo: no he podido borrarlo en tu cuenta (${esc(err.message)}); en la próxima sincronización volvería. Inténtalo de nuevo.`;}
  }
  sfx.click();
  showProfile();
  tutor.say(`<div class="tw">Hecho: progreso reiniciado.${cloudMsg} Empezamos de cero… y esta vez, a la primera.</div>`,{mood:'happy',hold:3500});
});
readingEl.addEventListener('click',e=>{
  if(!e.target.closest('[data-pf="photo"]'))return;
  const input=document.createElement('input');
  input.type='file';input.accept='image/*';
  input.onchange=async()=>{
    try{profile.setPhoto(await profile.photoFromFile(input.files?.[0]));showProfile();}
    catch(err){sfx.bad();tutor.say(`<div class="tw">Hmph. ${esc(err.message)}</div>`,{mood:'oops',hold:3000});}
  };
  input.click();
});

/* ---------- Cuaderno de vocabulario ---------- */
function showNotebook(){
  const words=notebook.list(),st=notebook.stats();
  frame({title:'生词本 · Cuaderno',tabText:'CUADERNO',back:'#/',
    score:`<span class="ok">★ ${words.length}</span>`});
  scoreEl.title='Palabras guardadas';
  document.title='Cuaderno · 阅读小屋';
  const srcLabel=s=>{const m=(s||'').match(/^hsk(\d)\/(lectura|escucha)\/(\d+)$/);return m?`HSK ${m[1]} · ${m[2]} ${m[3]}`:'';};
  readingEl.innerHTML=`<section class="lib">
    <h2 class="lib-title">生词本 · Cuaderno</h2>
    <p class="subtitle">${words.length?`${words.length} palabra${words.length>1?'s':''} · ${st.today?`${st.today} para repasar hoy`:'al día ✓'}`:'Todavía está vacío'}</p>
    ${words.length?`<div class="list-meter">${meterHTML(st.learned,st.total,{label:`${st.learned} de ${st.total} aprendidas`})}</div>
    <div class="quick"><a class="cont" href="#/cuaderno/repaso">▶ REPASAR<span>${st.today?`${st.due} pendientes · ${st.fresh} nuevas`:'repaso libre'}</span></a></div>
    <ul class="words">${words.map(w=>`<li class="word">
      <button class="word-zh" data-speak="${esc(w.zh)}" title="Escuchar">${esc(w.zh)}</button>
      <span class="word-info"><span class="word-py">${esc(w.py)}</span><span class="word-es">${esc(w.es)}</span>
        <span class="word-src">${w.src?`<a href="#/${esc(w.src)}">${srcLabel(w.src)}</a> · `:''}repaso: ${notebook.dueLabel(w)}</span></span>
      <button class="word-del" data-del="${esc(w.zh)}" title="Quitar del cuaderno" aria-label="Quitar ${esc(w.zh)} del cuaderno">✕</button>
    </li>`).join('')}</ul>`
    :`<p class="msg">Cuando estés leyendo, haz clic en una palabra y pulsa <b>☆ GUARDAR</b> en el cuadro de la tutora (o ☆ en «Vocabulario del texto»). Aparecerá aquí para que la repases.</p>`}
  </section><div class="endnote"></div>`;
  talk('notebook',
    words.length?'Tu cuaderno. Se repasa como en Anki: cada palabra vuelve justo cuando estás a punto de olvidarla.':'Un cuaderno vacío. Qué triste. Ve a leer y guárdame palabras.',
    ['¿Repasamos? Las palabras no se aprenden solas.','Aquí está todo lo que has guardado. Ordenadito, como me gusta.'],'idle');
}
readingEl.addEventListener('click',e=>{
  const sp=e.target.closest('[data-speak]');
  if(sp){speak(sp.dataset.speak);return;}
  const del=e.target.closest('[data-del]');
  if(del){notebook.remove(del.dataset.del);showNotebook();}
});
async function speak(text){
  if(await chineseVoice())speakList([{text}],{rate:0.85});
}

/* ---------- Ayuda: cómo activar la voz china ---------- */
async function showVoiceHelp(){
  frame({title:'🔊 Voz china',tabText:'VOZ',back:'#/'});
  document.title='Voz · 阅读小屋';
  readingEl.innerHTML=`<section class="lib gh voice-help">
    <h2 class="lib-title">Cómo activar la voz china</h2>
    <p class="subtitle">La voz la pone tu navegador, no la web. Con estos pasos suena perfecta en <b>Edge</b> (Windows 11).</p>
    <div class="gh-form acc-in">
      <p class="acc-mail" id="voiceNow">Comprobando la voz de este navegador…</p>
      <div class="gh-btns"><button class="pbtn" data-voice="test">▶ PROBAR VOZ</button></div>
    </div>
    <ol class="steps">
      <li><b>Abre la web en Microsoft Edge.</b> Edge trae voces chinas muy naturales («Microsoft Xiaoxiao Online (Natural)»). Necesitan internet.</li>
      <li><b>Si en Edge no suena</b>, instala el chino en Windows 11:
        <i>Configuración → Hora e idioma → Idioma y región → Agregar un idioma</i> → busca <b>Chino (simplificado, China)</b> → en las opciones marca <b>Texto a voz</b> → <b>Instalar</b>.
        <br>Otra forma: <i>Configuración → Hora e idioma → Voz → Administrar voces → Agregar voces</i> → <b>Chino (simplificado)</b>.</li>
      <li><b>Cierra Edge del todo</b> (todas las ventanas) y vuelve a abrirlo. Pulsa ▶ PROBAR VOZ.</li>
      <li><b>Otros navegadores:</b> Chrome usa su voz de Google (con internet). Brave y Firefox solo usan las voces instaladas en Windows (paso 2).</li>
    </ol>
  </section><div class="endnote"></div>`;
  talk('voice','Sin voz no hay escucha, y sin escucha no hay HSK. Sigue los pasos y pulsa PROBAR.',['Los pasos para que me oigas bien.'],'idle');
  const v=await chineseVoice();
  const el=document.getElementById('voiceNow');
  if(el)el.innerHTML=v?`✓ Voz encontrada: <b>${esc(v.name)}</b>`:'<span class="bad">✗ Este navegador no tiene ninguna voz china. Sigue los pasos de abajo.</span>';
}
readingEl.addEventListener('click',e=>{
  if(e.target.closest('[data-voice="test"]'))speakList([{text:'你好！我是你的老师。我们一起学习中文吧。'}],{rate:0.9});
});

/* ---------- Repaso tipo Anki ----------
   Se ve el carácter → VER (o espacio) → pinyin, traducción y audio →
   Otra vez / Difícil / Bien / Fácil (teclas 1–4), con el intervalo que tendrá. */
let rv=null; // {queue, pos, revealed, free, done, again}
function showReview(){
  const words=notebook.list();
  if(!words.length){location.replace('#/cuaderno');return;}
  frame({title:'复习 · Repaso',tabText:'REPASO',back:'#/cuaderno'});
  document.title='Repaso · 阅读小屋';
  const {due,fresh}=notebook.queue();
  rv={queue:[...shuffle(due),...shuffle(fresh)],pos:0,revealed:false,free:false,done:0,again:0};
  if(!rv.queue.length){drawReviewDone(true);return;}
  drawCard();
  talk('review','Piensa qué significa, dale la vuelta y dime con sinceridad cómo te ha ido. Yo calculo cuándo te la vuelvo a enseñar.',
    ['Repaso de hoy. Sé sincero con las notas.','Venga, que esto es gimnasia para la memoria.'],'idle');
}
function drawCard(){
  if(rv.pos>=rv.queue.length){drawReviewDone(false);return;}
  rv.revealed=false;
  const w=rv.queue[rv.pos],card=notebook.getAll()[w.zh]?.card;
  scoreEl.innerHTML=`<span class="ok">✓ ${rv.done}</span> &nbsp;<span class="no">↺ ${rv.again}</span>`;
  scoreEl.title='Repasadas · Otra vez';
  const g=(n,label,cls='')=>`<button class="pbtn grade ${cls}" data-grade="${n}" hidden><b>${label}</b><small>${rv.free?'':srs.preview(card,n)}</small></button>`;
  readingEl.innerHTML=`<section class="menu review">
    <div class="list-meter">${meterHTML(rv.pos,rv.queue.length,{label:`${rv.pos+1} de ${rv.queue.length}${rv.free?' · repaso libre':''}`})}</div>
    <div class="flash-card" data-flip>
      <span class="fc-zh">${esc(w.zh)}</span>
      <span class="fc-back" hidden><span class="fc-py">${esc(w.py)}</span><span class="fc-es">${esc(w.es)}</span></span>
      <span class="fc-hint">${card?'':'NUEVA · '}toca para darle la vuelta</span>
    </div>
    <div class="review-btns">
      <button class="pbtn" data-rev="flip">VER</button>
      ${g(1,'OTRA VEZ','again')}${g(2,'DIFÍCIL')}${g(3,'BIEN','ok')}${g(4,'FÁCIL','easy')}
    </div>
  </section>`;
}
function flipCard(){
  if(!rv||rv.revealed)return;
  rv.revealed=true;
  readingEl.querySelector('.fc-back').hidden=false;
  readingEl.querySelector('.fc-hint').hidden=true;
  readingEl.querySelector('[data-rev="flip"]').hidden=true;
  readingEl.querySelectorAll('[data-grade]').forEach(b=>b.hidden=false);
  speak(rv.queue[rv.pos].zh);
}
function gradeCard(n){
  if(!rv?.revealed)return;
  const w=rv.queue[rv.pos];
  if(!rv.free)notebook.grade(w.zh,n);
  if(n===1){
    sfx.bad();rv.again++;
    if(rv.queue.filter(x=>x===w).length<4)rv.queue.push(w); // vuelve antes de acabar
  }else{sfx.ok();rv.done++;}
  rv.pos++;drawCard();
}
function drawReviewDone(nothing){
  const st=notebook.stats();
  readingEl.innerHTML=`<section class="menu review">
    <h2 class="lib-title">${nothing?'Al día ✓':'Repaso terminado'}</h2>
    <p class="subtitle">${nothing?'No te toca ninguna palabra hoy.':`Repasadas: ${rv.done} · «Otra vez»: ${rv.again}`} · Dominadas: ${st.learned} de ${st.total}</p>
    <div class="quick">
      <button class="cont" data-rev="free">▶ REPASO LIBRE<span>todas, sin afectar a las fechas</span></button>
      <a class="cont alt" href="#/cuaderno">★ CUADERNO</a>
    </div>
  </section>`;
  tutor.say(`<div class="tw">${nothing?'Ya has repasado lo de hoy. Vuelve mañana: la constancia es lo que funciona.':rv.again===0?'Impecable. Hasta la próxima.':'Hecho por hoy. Las difíciles volverán pronto, tranquilo.'}</div>`,{mood:nothing||!rv.again?'happy':'idle',hold:3000});
}
readingEl.addEventListener('click',e=>{
  if(!rv||location.hash!=='#/cuaderno/repaso')return;
  if(e.target.closest('[data-rev="free"]')){
    rv={queue:shuffle(notebook.list()),pos:0,revealed:false,free:true,done:0,again:0};
    drawCard();return;
  }
  const gb=e.target.closest('[data-grade]');
  if(gb){gradeCard(+gb.dataset.grade);return;}
  if(e.target.closest('[data-flip],[data-rev="flip"]'))flipCard();
});
/* Teclado: espacio/Enter = dar la vuelta · 1–4 = nota */
document.addEventListener('keydown',e=>{
  if(!rv||location.hash!=='#/cuaderno/repaso'||e.ctrlKey||e.metaKey||e.altKey||!readingEl.querySelector('.flash-card'))return;
  if(!rv.revealed&&(e.key===' '||e.key==='Enter')){e.preventDefault();flipCard();return;}
  const n='1234'.indexOf(e.key)+1;
  if(n&&rv.revealed){e.preventDefault();gradeCard(n);}
});

/* ---------- 2 · Elegir lectura o escucha ---------- */
async function showSkills(level,from){
  frame({title:`HSK ${level} · ${LEVEL_INFO[level][0]}`,tabText:'TIPO',badgeText:`HSK${level}`,back:'#/',
    score:`<span class="ok">✓ ${progress.doneCount(`hsk${level}/`)}</span>`});
  scoreEl.title=`Ejercicios terminados en HSK ${level}`;
  document.title=`HSK ${level} · 阅读小屋`;
  const my=loadToken;
  readingEl.innerHTML=`<section class="menu">
    <h2 class="lib-title">HSK ${level} · ${LEVEL_INFO[level][1]}</h2>
    <p class="subtitle">¿Qué practicamos?</p>
    <ul class="skills">${MENU_SKILLS.map(s=>{const k=SKILL_INFO[s];return `<li>
      <a class="skill" href="#/hsk${level}/${s}" data-skill="${s}">
        <span class="skill-ic" aria-hidden="true">${k.icon}</span>
        <span class="skill-t"><span class="skill-l">${k.label}</span><span class="zh">${k.zh}</span></span>
        <span class="es">${k.es}. ${k.desc}</span>
        <span class="meta" data-count="${s}">Buscando…</span>
        ${meterHTML(0,1,{label:'…',attrs:`data-sm="${s}"`})}
      </a></li>`;}).join('')}</ul>
  </section>`;
  focusCard(from&&`.skill[data-skill="${from}"]`);
  talk(`skills${level}`,
    `HSK ${level}. Lectura para leer, escucha para textos con audio, escritura para practicar como en el examen y frases para entrenar el oído cada día. Yo, por si acaso, domino las cuatro.`,
    ['¿Lectura, escucha, escritura o frases? Decide.','Las frases se repasan un poco cada día. Constancia, como yo.','La escritura es lo que más cuesta. Por eso conviene practicarla.']);
  /* Textos terminados, frases aprendidas y medidores */
  levelStats(level).then(st=>{
    if(my!==loadToken)return;
    for(const s of MENU_SKILLS){
      const {done,total,today}=st[s];
      const el=readingEl.querySelector(`[data-count="${s}"]`);
      if(el)el.textContent=s==='frases'
        ?(total?`${total} frases · ${today?`${today} para hoy`:'al día ✓'}`:'Todavía no hay frases')
        :s===WRITING?(total?`${total} ejercicio${total>1?'s':''}`:'Todavía no hay ejercicios')
        :(total?`${total} texto${total>1?'s':''}`:'Todavía no hay textos');
      setMeter(readingEl.querySelector(`[data-sm="${s}"]`),done,total,
        total?`${done}/${total} ${s==='frases'?'aprendidas':'hechos'}`:'—');
    }
  });
}

/* ---------- 3 · Lista de textos ---------- */
function statusOf(e){
  if(e.broken)return `<span class="st bad" aria-label="El archivo tiene errores">ERROR</span>`;
  const p=progress.get(e.key);
  if(p?.done&&p.firstTry!=null)return `<span class="st done" aria-label="Hecho: ${p.firstTry} de ${p.total} a la primera">✓ ${p.firstTry}/${p.total}</span>`;
  if(p?.done)return `<span class="st done" aria-label="Marcado como terminado">✓ HECHO</span>`;
  if(p)return `<span class="st" aria-label="Empezado">VISTO</span>`;
  return '';
}
async function showList(level,skill){
  const k=SKILL_INFO[skill];
  frame({title:`HSK ${level} · ${k.zh}`,tabText:k.label,badgeText:`HSK${level}`,back:`#/hsk${level}`});
  document.title=`HSK ${level} ${k.label.toLowerCase()} · 阅读小屋`;
  const my=loadToken;
  readingEl.innerHTML='<p class="msg">Buscando textos…</p>';
  const lib=await loadLibrary(level,skill);
  if(my!==loadToken)return;
  const done=lib.filter(e=>progress.get(e.key)?.done).length;
  scoreEl.innerHTML=`<span class="ok">✓ ${done}/${lib.length}</span>`;
  scoreEl.title='Ejercicios terminados';
  const folder=folderOf(level,skill);
  readingEl.innerHTML=`<section class="lib">
    <h2 class="lib-title">书架 · ${k.label[0]+k.label.slice(1).toLowerCase()}</h2>
    <p class="subtitle">HSK ${level} · ${lib.length} ${skill===WRITING?'ejercicio':'texto'}${lib.length===1?'':'s'}</p>
    ${lib.length?`<div class="list-meter">${meterHTML(done,lib.length,{label:`${done} de ${lib.length} terminados`})}</div>`:''}
    ${lib.length?`<ul class="cards">${lib.map(e=>`<li><a class="card" href="#/hsk${level}/${skill}/${e.id}" data-key="${e.key}">
      <span class="num">${e.id}</span>
      <span><span class="zh">${esc(e.title)}</span><span class="es">${esc(e.titleEs)}</span>
        ${e.broken?'':`<span class="meta">${esc(e.topic)} · ${skill===WRITING
          ?[e.ordenar?`${e.ordenar} frases para ordenar`:'',e.redaccion?'redacción':''].filter(Boolean).join(' · ')
          :`${e.sentences} frases · ${e.questions} preguntas`}</span>`}</span>
      ${statusOf(e)}
    </a></li>`).join('')}</ul>`
    :`<p class="msg">Aún no hay textos aquí. Crea <code>${folder}001.json</code> (copia la plantilla de <code>tools/</code>) y recarga la página.</p>`}
  </section><div class="endnote"></div>`;
  focusCard(lastOpened&&`.card[data-key="${lastOpened}"]`);
  talk(`list${level}${skill}`,
    lib.length?(skill===WRITING
      ?`Escritura de HSK ${level}, como en el examen: primero ordenas frases y luego escribes una redacción de unos 80 caracteres. El ✓ indica cuántas frases ordenaste a la primera.`
      :`Aquí están los textos de ${k.label==='LECTURA'?'lectura':'escucha'} de HSK ${level}. Los que lleven ✓ ya los has terminado; el número es cuántas acertaste a la primera.`)
      :'Esta estantería está vacía. Cuando añadas un texto, aparecerá aquí solo.',
    done===lib.length&&lib.length
      ?['Todos terminados. Hmph, admito que no está mal.','Estantería completa. Puedes repetir alguno para subir nota.']
      :['¿Cuál toca ahora? No me hagas esperar.','Elige otro texto. Yo ya estoy lista, como siempre.',`Llevas ${done} de ${lib.length}. Sigue así.`],
    'idle');
}

/* ---------- 4 · Ejercicio ---------- */
async function openWritingEx(level,id){
  const skill=WRITING;
  frame({title:'…',tabText:'书写',badgeText:`HSK${level}`,back:`#/hsk${level}/${skill}`,reset:true});
  scoreEl.title='Frases ordenadas a la primera · fallos';
  tutor.setBase('idle');
  const my=loadToken;
  readingEl.innerHTML=`<p class="msg">Cargando el ejercicio ${esc(id)}…</p>`;
  const lib=await loadLibrary(level,skill);
  if(my!==loadToken)return;
  const i=lib.findIndex(e=>e.id===id);
  if(i<0){location.replace(`#/hsk${level}/${skill}`);return;}
  const entry=lib[i];
  lastOpened=entry.key;
  let ex,errors;
  try{({ex,errors}=await loadWriting(entry));}
  catch(err){if(my===loadToken)showError(err,`#/hsk${level}/${skill}`);return;}
  if(my!==loadToken)return;
  if(errors.length){showExerciseErrors(entry,errors);return;}
  heading.textContent=ex.title.zh;
  document.title=`${ex.title.zh} · HSK ${level}`;
  writing.load(ex,{key:entry.key,nav:{prev:lib[i-1]?.id||null,next:lib[i+1]?.id||null,
    base:`#/hsk${level}/${skill}/`,list:`#/hsk${level}/${skill}`}});
  progress.touch(entry.key);
  progress.setLast(entry.key);
  if(!seen.has('guide-escritura')){
    seen.add('guide-escritura');
    tutor.say(`<div class="tw">Escritura, igual que en el examen HSK 5. Aquí se ve quién sabe de verdad.</div>
      <ul class="guide">
       <li><i>ORDENAR</i><span>Toca los trozos en orden para formar la frase. PISTA te coloca el siguiente.</span></li>
       <li><i>REDACCIÓN</i><span>Unos 80 caracteres con todas las palabras. Te cuento los caracteres y te marco las palabras que ya has usado.</span></li>
       <li><i>MODELO</i><span>Cuando termines, compara con mi texto. El tuyo se guarda solo.</span></li>
      </ul>`,{mood:'idle'});
  }else tutor.say(`<div class="tw">${pick(['Ejercicio '+id+'. Primero el orden, luego la pluma.','Ejercicio '+id+'. Sujeto, verbo, objeto… y el resto, alrededor.'])}</div>`,{mood:'idle'});
}

async function openExercise(level,skill,id){
  if(skill===WRITING)return openWritingEx(level,id);
  const k=SKILL_INFO[skill];
  frame({title:'…',tabText:skill==='escucha'?'AUDIO':'TEXTO',badgeText:`HSK${level}`,back:`#/hsk${level}/${skill}`,reset:true});
  scoreEl.title='Aciertos a la primera · fallos';
  tutor.setBase('idle');
  const my=loadToken;
  readingEl.innerHTML=`<p class="msg">Cargando el texto ${esc(id)}…</p>`;
  const lib=await loadLibrary(level,skill);
  if(my!==loadToken)return;
  const i=lib.findIndex(e=>e.id===id);
  if(i<0){location.replace(`#/hsk${level}/${skill}`);return;}
  const entry=lib[i];
  heading.textContent=entry.title;
  lastOpened=entry.key;
  let ex,errors;
  try{({ex,errors}=await loadExercise(entry,dict));}
  catch(err){if(my===loadToken)showError(err,`#/hsk${level}/${skill}`);return;}
  if(my!==loadToken)return; // el usuario ya se fue a otra parte
  if(errors.length){showExerciseErrors(entry,errors);return;}
  current=entry;
  heading.textContent=ex.title.zh;
  document.title=`${ex.title.zh} · HSK ${level}`;
  const lastResult=progress.get(entry.key);
  reader.load(ex,dict,{
    prev:lib[i-1]?.id||null,next:lib[i+1]?.id||null,
    base:`#/hsk${level}/${skill}/`,list:`#/hsk${level}/${skill}`,
    skill,audioBase:folderOf(level,skill),lastResult,
    key:entry.key,done:!!lastResult?.done
  });
  progress.touch(entry.key);
  progress.setLast(entry.key);
  intro(skill,id,k,lastResult);
}
/* Recordatorio del intento anterior, si lo hubo. */
function memo(r){
  if(!r?.done)return '';
  const w=r.wrongQuestions||[];
  const qs=w.map(n=>`Q${n}`).join(', ').replace(/, ([^,]*)$/,' y $1');
  return `<p class="why"><span class="chip">REPASO</span> La última vez: <b>${r.firstTry}/${r.total}</b> a la primera. ${w.length
    ?(w.length>1?`Fallaste las preguntas <b>${qs}</b>; te las he marcado en rojo.`:`Fallaste la pregunta <b>${qs}</b>; te la he marcado en rojo.`)
    :'Ni un fallo. A ver si lo repites.'}</p>`;
}
function intro(skill,id,k,lastResult){
  const extra=memo(lastResult);
  const key=`guide-${skill}`;
  if(!seen.has(key)){
    seen.add(key);
    const first=skill==='escucha'
      ?`<div class="tw">Ejercicio de escucha. El texto está escondido: primero entrénate el oído.</div>
        <ul class="guide">
         <li><i>AUDIO</i><span>Pulsa ▶ ESCUCHAR para oír el audio entero; LENTO lo hace más pausado.</span></li>
         <li><i>TEXTO</i><span>VER TEXTO lo destapa (con sus palabras y sellos de frase). Se destapa solo al terminar.</span></li>
         <li><i>ERROR</i><span>Si fallas, te explico por qué y puedes volver a oír la frase de la pista.</span></li>
        </ul>`
      :`<div class="tw">Hmph. Soy tu tutora. Tener a la mejor alumna de la clase para ti solita es todo un privilegio, ¿no crees?</div>
        <ul class="guide">
         <li><i>PALABRA</i><span>Pasa el ratón (o toca) sobre una palabra: traducción y pinyin. Si la tocas, te la pronuncio.</span></li>
         <li><i>SELLO</i><span>Pulsa el sello numerado de una frase y te desmenuzo su gramática y sintaxis.</span></li>
         <li><i>PINYIN</i><span>El botón PINYIN de arriba lo pone encima de todas las palabras.</span></li>
         <li><i>ERROR</i><span>Si fallas una pregunta, te explico por qué esa opción no vale.</span></li>
        </ul>`;
    tutor.say(first+extra,{mood:'idle'});
  }else{
    tutor.say(`<div class="tw">${pick(skill==='escucha'?[
      `Audio ${id}. Escucha primero sin mirar el texto. Sin trampas.`,
      `Audio ${id}. Si no lo pillas a la primera, prueba en LENTO.`]:[
      `Texto ${id}. Lee con calma; si una palabra se te resiste, pásale el cursor.`,
      `Texto ${id}. Yo ya lo he leído, claro. Te toca a ti.`,
      `Texto ${id}. Recuerda: los sellos numerados son tu mejor amigo. Después de mí.`])}</div>${extra}`,{mood:'idle'});
  }
}

/* ---------- Errores ---------- */
function showExerciseErrors(entry,errors){
  const listHref=`#/hsk${entry.level}/${entry.skill}`;
  readingEl.innerHTML=`<div class="msg">
    <p><b>El archivo <code>${esc(folderOf(entry.level,entry.skill)+entry.file)}</code> tiene ${errors.length} error(es)</b> y no se puede mostrar. Corrígelos y recarga la página:</p>
    <ul class="errs">${errors.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>
    <p><a class="navbtn" href="${listHref}">LISTA</a></p>
  </div>`;
  tutor.say(`<div class="tw">Hmph. Este texto tiene fallos de formato; te los he dejado arriba en una lista. Arréglalos y vuelvo a revisarlo.</div>`,{mood:'oops'});
}
function showError(err,backHref='#/'){
  console.error(err);
  const local=location.protocol==='file:';
  readingEl.innerHTML=`<div class="msg">
    <p><b>No he podido cargar los datos.</b></p>
    ${local
      ?`<p>Has abierto el archivo directamente (<code>file://</code>) y el navegador bloquea la carga de los ejercicios. Abre la web con el servidor local: haz doble clic en <code>tools/servir.cmd</code> y entra en <code>http://localhost:8000</code>.</p>`
      :`<p>${esc(err.message||err)}</p><p>Corrige el archivo (si es un JSON tuyo) y recarga la página.</p>
        <p><a class="navbtn" href="${backHref}">VOLVER</a></p>`}
  </div>`;
  tutor.say(`<div class="tw">Hmph. Algo ha fallado al traer los textos. No es culpa mía, que conste.</div>`,{mood:'oops'});
}

/* ---------- FRASES: seis tipos de ejercicio con repetición espaciada (js/phrases.js) ---------- */
const shuffle=phx.shuffle;
let ph=null; // sesión: {level, items, queue, pos, practice, ex, answered, ok, fails, requeued, lastType}
/* Una frase está dominada cuando se ha acertado de todas sus formas posibles; ya no vuelve. */
const isMastered=(level,items,p)=>phx.mastered(p,items,srs.getCard(level,p.zh));
function phStats(level,items){
  const open=items.filter(p=>!isMastered(level,items,p));
  const {due,fresh}=srs.queue(level,open);
  return {total:items.length,learned:items.length-open.length,today:due.length+fresh.length};
}
async function showPhrases(level){
  frame({title:`HSK ${level} · 句子`,tabText:'FRASES',badgeText:`HSK${level}`,back:`#/hsk${level}`});
  document.title=`HSK ${level} frases · 阅读小屋`;
  tutor.setBase('idle');
  const my=loadToken;
  readingEl.innerHTML='<p class="msg">Cargando frases…</p>';
  const {items,errors,missing}=await loadPhrases(level);
  if(my!==loadToken)return;
  const errHTML=errors.length?`<ul class="errs">${errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:'';
  if(items.length<4){
    readingEl.innerHTML=`<section class="menu"><h2 class="lib-title">Frases · HSK ${level}</h2>
      <p class="msg">${missing?`Todavía no hay frases. Crea <code>data/hsk${level}/frases.txt</code>`:'Hacen falta al menos 4 frases en '+`<code>data/hsk${level}/frases.txt</code>`} con una frase por línea: <code>中文 | pinyin | español</code>.</p>${errHTML}</section>`;
    talk(`ph-empty${level}`,'Sin frases no hay dictado. Escribe unas cuantas en el archivo y vuelvo.',['Faltan frases en el archivo.'],'oops');
    return;
  }
  const {due,fresh}=srs.queue(level,items.filter(p=>!isMastered(level,items,p)));
  ph={level,items,queue:[...shuffle(due),...shuffle(fresh)],pos:0,practice:false,ok:0,fails:0,requeued:new Map(),errHTML,lastType:null};
  if(!ph.queue.length){drawPhrasesDone(true);return;}
  drawPhrase();
  talk('ph-intro2',
    'Frases. No siempre te preguntaré lo mismo: unas veces qué has oído, otras qué significa, otras te quitaré una palabra o te daré los trozos desordenados. Cada frase tienes que acertarla una vez de cada forma; cuando lo consigas, queda dominada y no vuelve.',
    ['Vamos con las frases de hoy. Oído atento.','Repaso diario de frases. Poco a poco se queda todo.'],'idle');
}
const curPhrase=()=>ph.queue[ph.pos];
function newExercise(){
  const p=curPhrase();
  ph.ex=phx.build(p,ph.items,{card:srs.getCard(ph.level,p.zh),last:ph.lastType,practice:ph.practice});
  ph.lastType=ph.ex.type;ph.answered=false;ph.tries=0;
}
/* Contador de formas superadas de la frase: las acertadas salen tachadas en verde. */
function formsHTML(p){
  const all=phx.feasible(p,ph.items),ok=phx.passed(p,ph.items,srs.getCard(ph.level,p.zh));
  return `<div class="phr-forms" aria-label="Formas superadas: ${ok.length} de ${all.length}"><span class="pf-count">FORMAS ${ok.length}/${all.length}</span>${
    all.map(t=>`<span class="pchip${ok.includes(t)?' done':''}" title="${ok.includes(t)?'Superada':'Pendiente'}">${ok.includes(t)?'✓ ':''}${phx.TYPES[t].label}</span>`).join('')}</div>`;
}
function phScore(){
  scoreEl.innerHTML=`<span class="ok">✓ ${ph.ok}</span> &nbsp;<span class="no">✗ ${ph.fails}</span>`;
  scoreEl.title='Aciertos y fallos de esta sesión';
}
function drawPhrase(keepEx){
  if(!keepEx)newExercise();
  const p=curPhrase(),ex=ph.ex,T=phx.TYPES[ex.type];
  phScore();
  readingEl.innerHTML=`<section class="lib phr">
    <h2 class="lib-title">听句子 · Frases</h2>
    ${formsHTML(p)}
    <p class="subtitle"><b>${T.label}</b> · ${T.title}${ph.practice?' · práctica libre, no cuenta':''}</p>
    <div class="list-meter">${meterHTML(ph.pos,ph.queue.length,{label:`${ph.pos+1} de ${ph.queue.length}`})}</div>
    ${ph.errHTML}
    <div class="player">
      <button class="play" data-pact="play">▶ ESCUCHAR</button>
      <button class="pbtn" data-pact="slow" aria-pressed="${!!ph.slow}">LENTO</button>
    </div>
    <div class="phr-body">${bodyHTML(p,ex)}</div>
    <div class="phr-reveal" hidden></div>
    <div class="phr-next" hidden><button class="play" data-pact="next">SIGUIENTE ▶</button></div>
  </section>`;
  scrollEl.scrollTop=0;
  chineseVoice().then(v=>{if(!v)readingEl.querySelector('.phr .player')?.insertAdjacentHTML('afterend',
    '<a class="voice-warn" href="#/voz">⚠ Este navegador no tiene voz china · <b>cómo activarla (Edge, Windows 11)</b></a>');});
  if(ex.type==='dictado')readingEl.querySelector('.dict-in')?.focus({preventScroll:true});
  playPhrase();
}
const optBtn=(i,inner)=>`<button class="popt" data-po="${i}"><b>${'ABCD'[i]}</b>${inner}</button>`;
function bodyHTML(p,ex){
  switch(ex.type){
    case 'oir':return `<div class="phr-opts">${ex.opts.map((o,i)=>optBtn(i,
      `<span class="po-zh">${esc(o.zh)}</span><span class="po-py">${esc(o.py)}</span><span class="po-es" hidden>${esc(o.es)}</span>`)).join('')}</div>`;
    case 'sentido':return `<div class="phr-opts es-only">${ex.opts.map((o,i)=>optBtn(i,`<span class="po-es">${esc(o.es)}</span>`)).join('')}</div>`;
    case 'vf':return `<div class="phr-vf"><p class="vf-q">¿Lo que has oído significa esto?</p>
      <p class="vf-es">«${esc(ex.shown.es)}»</p>
      <div class="vf-btns"><button class="popt vf" data-po="0"><b>S</b><span class="po-zh">SÍ</span></button><button class="popt vf" data-po="1"><b>N</b><span class="po-zh">NO</span></button></div></div>`;
    case 'hueco':return `<p class="phr-sent">${gapSentence(p,ex)}</p>
      <div class="phr-opts">${ex.opts.map((o,i)=>optBtn(i,`<span class="po-zh">${esc(o.zh)}</span><span class="po-py">${esc(o.py)}</span>`)).join('')}</div>`;
    case 'ordenar':return `<div class="ord-ans" aria-live="polite">${ex.picked.length?ex.picked.map((k,j)=>`<button class="ochip in" data-oback="${j}">${esc(ex.chunks[k])}</button>`).join(''):'<span class="ord-ph">Toca los trozos en el orden en que los oyes</span>'}</div>
      <div class="ord-bank">${ex.order.map((k,j)=>ex.picked.includes(k)?'':`<button class="ochip" data-opick="${k}"><b>${j+1}</b>${esc(ex.chunks[k])}</button>`).join('')}</div>
      <div class="ord-tools"><button class="pbtn" data-pact="oundo" ${ex.picked.length?'':'disabled'}>⌫ QUITAR ÚLTIMO</button></div>`;
    case 'dictado':return `<form class="dict" data-dict>
      <input class="dict-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="zh" placeholder="Escribe en hanzi o en pinyin sin tonos…" aria-label="Lo que has oído">
      <div class="dict-btns"><button class="play" type="submit">COMPROBAR</button><button class="pbtn" type="button" data-pact="giveup">NO LO SÉ</button></div>
      <p class="dict-hint">Vale <b>你好吗</b> o <b>ni hao ma</b>. Los signos de puntuación y los espacios no cuentan.</p></form>`;
  }
  return '';
}
/* Frase con la palabra ex.idx tapada, respetando la puntuación original. */
function gapSentence(p,ex,reveal){
  const seg=ex.seg;let start=0;for(let i=0;i<ex.idx;i++)start+=seg[i].zh.length;
  const end=start+seg[ex.idx].zh.length;
  let out='',k=0,opened=false;
  for(const ch of p.zh){
    const han=/\p{Script=Han}/u.test(ch);
    if(han&&k===start){out+=reveal?`<span class="gap shown">`:`<span class="gap">${'＿'.repeat(end-start)}`;opened=true;}
    if(!(han&&k>=start&&k<end&&!reveal))out+=esc(ch);
    if(han){k++;if(k===end&&opened){out+='</span>';opened=false;}}
  }
  return out;
}
async function playPhrase(){
  const p=curPhrase();
  if(!(await chineseVoice())){
    tutor.say('<div class="tw">No encuentro voz china en este navegador, así que puede sonar raro o no sonar.</div><a class="ev" href="#/voz">🔊 CÓMO ACTIVAR LA VOZ</a>',{mood:'oops',hold:4000});
  }
  speakList([{text:p.zh}],{rate:ph.slow?0.7:0.95});
}
/* Respuesta a una opción (oir, sentido, vf, hueco). */
function answerOption(i){
  const ex=ph.ex;
  if(ph.answered||!ex.opts&&ex.type!=='vf')return;
  const btns=[...readingEl.querySelectorAll('.phr-body .popt')];
  if(i>=btns.length)return;
  const ok=i===ex.answer;
  btns.forEach((b,k)=>{b.disabled=true;if(k===ex.answer)b.classList.add('ok');});
  if(!ok)btns[i].classList.add('bad');
  readingEl.querySelectorAll('.po-es[hidden]').forEach(e=>e.hidden=false);
  if(ex.type==='hueco')readingEl.querySelector('.phr-sent').innerHTML=gapSentence(curPhrase(),ex,true);
  let why='';
  if(!ok){
    const p=curPhrase();
    why=ex.type==='vf'?(ex.answer===0?'Sí lo significaba.':`No: eso es otra frase. Lo que has oído significa «${esc(p.es)}».`)
      :ex.type==='hueco'?`Faltaba <b>${esc(ex.opts[ex.answer].zh)}</b> (${esc(ex.opts[ex.answer].py)}).`
      :ex.type==='sentido'?'Ese no era el sentido.':`Era la ${'ABCD'[ex.answer]}.`;
  }
  finish(ok,why);
}
function pickChunk(k){
  const ex=ph.ex;if(ph.answered||ex.picked.includes(k))return;
  ex.picked.push(k);
  if(ex.picked.length===ex.chunks.length){
    const ok=ex.picked.map(j=>ex.chunks[j]).join('')===ex.chunks.join('');
    readingEl.querySelector('.phr-body').innerHTML=bodyHTML(curPhrase(),ex);
    readingEl.querySelectorAll('.ord-ans .ochip').forEach((b,j)=>{b.disabled=true;b.classList.add(ex.chunks[ex.picked[j]]===ex.chunks[j]?'ok':'bad');});
    readingEl.querySelector('[data-pact="oundo"]').disabled=true;
    finish(ok,ok?'':`El orden era: <b>${ex.chunks.map(esc).join(' · ')}</b>`);
  }else readingEl.querySelector('.phr-body').innerHTML=bodyHTML(curPhrase(),ex);
}
function undoChunk(j){
  const ex=ph.ex;if(ph.answered||!ex.picked.length)return;
  ex.picked.splice(j==null?ex.picked.length-1:j,1);
  readingEl.querySelector('.phr-body').innerHTML=bodyHTML(curPhrase(),ex);
}
function checkDict(giveUp){
  if(ph.answered)return;
  const inp=readingEl.querySelector('.dict-in');
  const r=giveUp?{ok:false}:phx.checkDictado(curPhrase(),inp.value);
  if(r.empty){tutor.say('<div class="tw">Escribe algo primero. Aunque sea en pinyin.</div>',{mood:'idle',hold:2000});return;}
  if(!r.ok&&r.close&&!ph.tries){
    ph.tries++;
    tutor.say('<div class="tw">Casi. Hay un detalle mal; escúchala otra vez y corrígelo.</div>',{mood:'think',hold:3000});
    playPhrase();inp.focus();return;
  }
  inp.disabled=true;readingEl.querySelectorAll('.dict-btns button').forEach(b=>b.disabled=true);
  inp.classList.add(r.ok?'ok':'bad');
  finish(r.ok,giveUp?'No pasa nada: léela, escúchala y la próxima vez saldrá.':'No era exactamente eso.');
}
function finish(ok,why=''){
  ph.answered=true;
  const p=curPhrase();
  let when='';
  if(ok){
    sfx.ok();ph.ok++;
    if(!ph.practice){
      const d=srs.review(ph.level,p.zh,true,ph.ex.type);
      const left=phx.feasible(p,ph.items).length-phx.passed(p,ph.items,srs.getCard(ph.level,p.zh)).length;
      when=!left?'¡Frase dominada! Ya no vuelve.':`Te quedan ${left} forma${left>1?'s':''}. ${d===1?'Volverá mañana.':`Volverá dentro de ${d} días.`}`;
      const f=readingEl.querySelector('.phr-forms');if(f)f.outerHTML=formsHTML(p);
    }
    tutor.say(`<span class="chip good">CORRECTO</span><div class="tw">${pick(['Bien oído.','Exacto. Tienes buen oído… casi como yo.','Correcto.','Eso es. Entendida.'])} ${when}</div>`,{mood:'happy',hold:2500});
  }else{
    sfx.bad();ph.fails++;
    if(!ph.practice){
      srs.review(ph.level,p.zh,false,ph.ex.type);
      const n=ph.requeued.get(p.zh)||0;
      if(n<2){ph.queue.push(p);ph.requeued.set(p.zh,n+1);when='Te la vuelvo a poner antes de acabar, de otra forma.';}
    }
    tutor.say(`<span class="chip bad">FALLO</span><div class="tw">Hmph. ${why} ${when}</div>
      <button class="ev" data-pact="replay">▶ Oírla otra vez</button>`,{mood:'oops',hold:4000});
  }
  phScore();
  const rv=readingEl.querySelector('.phr-reveal');
  rv.innerHTML=`<p class="rv-zh">${esc(p.zh)}</p><p class="rv-py">${esc(p.py)}</p><p class="rv-es">${esc(p.es)}</p>
    <button class="pbtn" data-pact="play">▶ OÍRLA OTRA VEZ</button>`;
  rv.hidden=false;
  readingEl.querySelector('.phr-next').hidden=false;
  readingEl.querySelector('[data-pact="next"]').focus({preventScroll:true});
}
function nextPhrase(){
  ph.pos++;
  if(ph.pos>=ph.queue.length)drawPhrasesDone(false);else drawPhrase();
}
function drawPhrasesDone(nothing){
  const st=phStats(ph.level,ph.items);
  readingEl.innerHTML=`<section class="menu">
    <h2 class="lib-title">${nothing?'Al día ✓':'Sesión terminada'}</h2>
    <p class="subtitle">${nothing?'No te toca ninguna frase hoy.':`Aciertos: ${ph.ok} · fallos: ${ph.fails}`} · Aprendidas: ${st.learned} de ${st.total}</p>
    <div class="quick">
      <button class="cont" data-pact="practice">▶ PRÁCTICA LIBRE<span>10 frases al azar, no cuenta</span></button>
      <a class="cont alt" href="#/hsk${ph.level}">◂ VOLVER</a>
    </div>
  </section>`;
  tutor.say(`<div class="tw">${nothing?'Ya has hecho tus frases de hoy. Vuelve mañana; la constancia es lo que funciona.':ph.fails===0?'Impecable. Hasta mañana.':'Hecho por hoy. Las que fallaste volverán pronto, tranquilo.'}</div>`,{mood:nothing||!ph.fails?'happy':'idle',hold:3000});
}
readingEl.addEventListener('click',e=>{
  if(!ph||!location.hash.endsWith('/frases'))return;
  const po=e.target.closest('[data-po]');
  if(po){answerOption(+po.dataset.po);return;}
  const op=e.target.closest('[data-opick]');
  if(op){pickChunk(+op.dataset.opick);return;}
  const ob=e.target.closest('[data-oback]');
  if(ob){undoChunk(+ob.dataset.oback);return;}
  const a=e.target.closest('[data-pact]')?.dataset.pact;
  if(a==='play')playPhrase();
  else if(a==='slow'){ph.slow=!ph.slow;e.target.closest('[data-pact]').setAttribute('aria-pressed',String(ph.slow));playPhrase();}
  else if(a==='next')nextPhrase();
  else if(a==='oundo')undoChunk();
  else if(a==='giveup')checkDict(true);
  else if(a==='practice'){
    ph={...ph,queue:shuffle(ph.items).slice(0,10),pos:0,practice:true,ok:0,fails:0,requeued:new Map(),lastType:null};
    drawPhrase();
  }
});
readingEl.addEventListener('submit',e=>{
  if(!e.target.matches('[data-dict]'))return;
  e.preventDefault();
  if(ph&&location.hash.endsWith('/frases'))checkDict(false);
});
tutor.body.addEventListener('click',e=>{
  if(ph&&e.target.closest('[data-pact="replay"]')&&location.hash.endsWith('/frases'))playPhrase();
});
/* Teclado: 1–4 / A–D responde · S/N en ¿sí o no? · 1–8 elige trozo y ⌫ lo quita · Enter o espacio = siguiente · R repite */
document.addEventListener('keydown',e=>{
  if(!ph||!location.hash.endsWith('/frases')||e.ctrlKey||e.metaKey||e.altKey)return;
  if(!readingEl.querySelector('.phr'))return;
  if(e.target.closest?.('input,textarea'))return; // escribiendo el dictado
  const k=e.key.toLowerCase(),ex=ph.ex;
  if(k==='r'){playPhrase();return;}
  if(ph.answered){if(k==='enter'||k===' '){e.preventDefault();nextPhrase();}return;}
  if(ex.type==='vf'){const i='sn'.indexOf(k)>=0?'sn'.indexOf(k):'12'.indexOf(k);if(i>=0){e.preventDefault();answerOption(i);}return;}
  if(ex.type==='ordenar'){
    if(k==='backspace'){e.preventDefault();undoChunk();return;}
    const j=+k-1;if(j>=0&&j<ex.order.length&&!ex.picked.includes(ex.order[j])){e.preventDefault();pickChunk(ex.order[j]);}
    return;
  }
  if(ex.opts){const i='1234'.indexOf(k)>=0?'1234'.indexOf(k):'abcd'.indexOf(k);if(i>=0){e.preventDefault();answerOption(i);}}
});

/* ---------- Rutas ---------- */
let prevRoute={};
function route(){
  const h=location.hash;
  const old=h.match(/^#\/e\/(\d+)$/); // enlaces de la versión anterior (solo HSK 6 lectura)
  if(old){location.replace(`#/hsk6/lectura/${old[1]}`);return;}
  if(h==='#/cuaderno'){showNotebook();prevRoute={};return;}
  if(h==='#/cuenta'){showAccount();prevRoute={};return;}
  if(h==='#/perfil'){showProfile();prevRoute={};return;}
  if(h==='#/voz'){showVoiceHelp();prevRoute={};return;}
  if(h==='#/cuaderno/repaso'){showReview();prevRoute={};return;}
  const fr=h.match(/^#\/hsk([1-6])\/frases$/);
  if(fr){showPhrases(+fr[1]);prevRoute={level:+fr[1],skill:'frases'};return;}
  const m=h.match(/^#\/hsk([1-6])(?:\/(lectura|escucha|escritura)(?:\/(\d+))?)?\/?$/);
  const r=m?{level:+m[1],skill:m[2],id:m[3]}:{};
  if(!m)showLevels(prevRoute.level);
  else if(!r.skill)showSkills(r.level,prevRoute.level===r.level?prevRoute.skill:null);
  else if(!r.id)showList(r.level,r.skill);
  else openExercise(r.level,r.skill,r.id);
  prevRoute=r;
}

/* ---------- Sonido y tema de la cabecera ---------- */
const sndBtn=$('#btn-sonido');
const temaBtn=$('#btn-tema');
function paintSnd(){
  const on=!sfx.muted;
  sndBtn.setAttribute('aria-pressed',String(on));
  sndBtn.setAttribute('aria-label',on?'Silenciar sonidos':'Activar sonidos');
}
function temaClaro(){return document.documentElement.dataset.theme==='light';}
function pintarTema(){
  const claro=temaClaro();
  temaBtn.textContent=claro?'☾':'☀';
  temaBtn.setAttribute('aria-label',claro?'Cambiar a modo oscuro':'Cambiar a modo claro');
}
function ponerTema(claro){
  document.documentElement.dataset.theme=claro?'light':'dark';
  try{localStorage.setItem('hsk.tema',claro?'claro':'oscuro');}catch{}
  pintarTema();
}
paintSnd();
pintarTema();
sndBtn.addEventListener('click',()=>{sfx.toggle();paintSnd();});
temaBtn.addEventListener('click',()=>{ponerTema(!temaClaro());});
document.addEventListener('click',e=>{
  const el=e.target.closest('button,a,[role="button"],.w');
  if(!el||el===sndBtn)return;
  if(el.matches('.opt,.popt'))return;                 // acierto/fallo: tienen su propio sonido
  if(el.matches('#back'))sfx.back();
  else if(el.matches('#girlBtn'))sfx.girl();
  else if(el.matches('.rune'))sfx.bop();
  else if(el.matches('.w'))sfx.tick();
  else if(el.matches('.lvl,.skill,.card,.navbtn,.cont'))sfx.open();
  else sfx.click();
},true);

/* ---------- Controles ---------- */
backBtn.addEventListener('click',()=>{location.hash=backBtn.dataset.href||'#/';});
resetBtn.addEventListener('click',()=>{
  if(writing.active){writing.reset();tutor.say(`<div class="tw">Frases desordenadas otra vez. Tu redacción la dejo donde estaba.</div>`,{mood:'idle'});return;}
  reader.reset();
  tutor.say(`<div class="tw">Empezamos de cero. Esta vez, a la primera.</div>`,{mood:'idle'});
});
const girlBtn=$('#girlBtn');
function girlTalk(){
  tutor.say(`<div class="tw">${pick([
    'Hmph… ¿me necesitabas? Pasa el cursor por las palabras y no me distraigas.',
    'Si te atascas con una frase, pulsa su sello numerado. Yo me encargo.',
    'No me mires así. Mejor estudia: el HSK no se aprueba solo.',
    '¿Cansado ya? Una pregunta más y descansas. Quizá.'])}</div>`,{mood:'happy',hold:2500});
}
girlBtn.addEventListener('click',girlTalk);
girlBtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();girlTalk();}});

async function boot(){
  if(location.protocol==='file:'){showError(new Error('file://'));return;}
  progress.persist();
  /* Vuelta desde un enlace del correo (confirmar cuenta o cambiar contraseña) */
  if(cloud.captureRedirect()==='recovery')recoveryMode=true;
  dict=await loadDictionary();
  /* Con sesión abierta: une el progreso de la cuenta con el local, sin bloquear el arranque.
     Al terminar, redibuja la pantalla si es un menú (los ejercicios y repasos no se tocan). */
  if(cloud.loggedIn())cloud.sync().then(()=>{
    const h=location.hash;
    if(!/\/\d+$|\/frases$|\/repaso$|^#\/(cuenta|perfil|voz)$/.test(h))route();
  }).catch(()=>{});
  window.addEventListener('hashchange',route);
  route();
}
boot();
