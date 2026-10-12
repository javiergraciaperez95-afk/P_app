/* =====================================================
   CUENTA Y PROGRESO EN LA NUBE (Supabase, sin librerías)
   - Auth: /auth/v1 (registro, entrar, renovar sesión, salir, recuperar).
   - Datos: tabla public.progress (una fila por usuario: name, photo,
     progress, notebook) protegida con RLS: cada usuario solo ve y escribe
     la suya. SQL en tools/supabase.sql.
   - Sincronizar = leer la fila, unirla con lo local y volver a guardarla.
     Se hace al entrar, al abrir la web y unos segundos después de cada cambio.
   ===================================================== */
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
import * as progress from './progress.js';
import * as notebook from './notebook.js';
import * as srs from './srs.js';
import * as profile from './profile.js';

const SKEY='hsk.session';
export const configured=!!(SUPABASE_URL&&SUPABASE_ANON_KEY);
let timer=null,quiet=false,running=null,again=false;
const listeners=new Set();
export let status={state:'off',msg:'',last:null};
function setStatus(state,msg){
  status={...status,state,msg,last:state==='ok'?new Date():status.last};
  listeners.forEach(fn=>fn(status));
}
export function onStatus(fn){listeners.add(fn);}

/* ---------- Sesión ---------- */
function readSession(){try{return JSON.parse(localStorage.getItem(SKEY)||'null');}catch{return null;}}
function saveSession(s){
  try{s?localStorage.setItem(SKEY,JSON.stringify(s)):localStorage.removeItem(SKEY);}catch{}
}
export const session=()=>readSession();
export const user=()=>readSession()?.user||null;
export const loggedIn=()=>configured&&!!readSession()?.access_token;

function store(r){
  saveSession({access_token:r.access_token,refresh_token:r.refresh_token,
    expires_at:Date.now()+(r.expires_in||3600)*1000,user:{id:r.user?.id,email:r.user?.email}});
}

async function auth(path,body,{token}={}){
  const r=await fetch(`${SUPABASE_URL}/auth/v1/${path}`,{
    method:body===undefined?'GET':'POST',
    headers:{'apikey':SUPABASE_ANON_KEY,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(authError(data));
  return data;
}
function authError(d){
  const m=(d.error_description||d.msg||d.message||d.error||'').toLowerCase();
  if(m.includes('invalid login'))return 'Email o contraseña incorrectos.';
  if(m.includes('not confirmed'))return 'Todavía no has confirmado tu email: revisa tu correo.';
  if(m.includes('already registered')||m.includes('already been registered'))return 'Ese email ya tiene cuenta. Prueba a entrar.';
  if(m.includes('password')&&m.includes('6'))return 'La contraseña debe tener al menos 6 caracteres.';
  if(m.includes('rate limit'))return 'Demasiados intentos seguidos. Espera un poco.';
  return d.error_description||d.msg||d.message||'No se pudo completar la operación.';
}

/* Token válido (renovándolo si ha caducado o si se pide forzar). */
async function token(force=false){
  const s=readSession();
  if(!s)throw new Error('No has iniciado sesión.');
  if(!force&&Date.now()<s.expires_at-60000)return s.access_token;
  try{
    store(await auth('token?grant_type=refresh_token',{refresh_token:s.refresh_token}));
    return readSession().access_token;
  }catch{
    saveSession(null);setStatus('off','');
    throw new Error('La sesión ha caducado. Vuelve a entrar.');
  }
}

/* Registro: devuelve true si ya ha entrado, false si debe confirmar el email. */
export async function signUp(email,password){
  const r=await auth('signup',{email,password,options:{emailRedirectTo:location.origin+location.pathname}});
  if(r.access_token){store(r);await sync();return true;}
  return false;
}
export async function signIn(email,password){
  store(await auth('token?grant_type=password',{email,password}));
  await sync();
}
export async function signOut(){
  const s=readSession();
  clearTimeout(timer);
  if(s)auth('logout',{},{token:s.access_token}).catch(()=>{});
  saveSession(null);setStatus('off','');
}
export async function recover(email){
  await auth('recover',{email,redirect_to:location.origin+location.pathname});
}
export async function setPassword(password){
  await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:'PUT',
    headers:{'apikey':SUPABASE_ANON_KEY,'Content-Type':'application/json',Authorization:`Bearer ${await token()}`},
    body:JSON.stringify({password})}).then(async r=>{if(!r.ok)throw new Error(authError(await r.json().catch(()=>({}))));});
}

/* Enlaces del correo (confirmar cuenta / recuperar contraseña) llegan como
   #access_token=…&refresh_token=…&type=signup|recovery, o #error=… si el
   enlace ha caducado. Devuelve el tipo, 'error' o null. */
export let redirectError='';
export function captureRedirect(){
  const h=location.hash;
  if(configured&&/[#&]error=/.test(h)){
    const p=new URLSearchParams(h.slice(1));
    redirectError=/expired/i.test(p.get('error_code')||p.get('error_description')||'')
      ?'El enlace del correo ha caducado. Vuelve a pedirlo (o entra con tu contraseña).'
      :(p.get('error_description')||'El enlace del correo no es válido.').replace(/\+/g,' ');
    history.replaceState(null,'',location.pathname+location.search+'#/cuenta');
    return 'error';
  }
  if(!configured||!h.includes('access_token='))return null;
  const p=new URLSearchParams(h.slice(1));
  const access=p.get('access_token');
  let id=null,email=null;
  try{const pl=JSON.parse(atob(access.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));id=pl.sub;email=pl.email;}catch{}
  saveSession({access_token:access,refresh_token:p.get('refresh_token'),
    expires_at:Date.now()+(+p.get('expires_in')||3600)*1000,user:{id,email}});
  history.replaceState(null,'',location.pathname+location.search+'#/cuenta');
  return p.get('type')||'signup';
}

/* ---------- Datos ---------- */
/* Fila de la tabla: name, photo, progress {texts, phrases, last}, notebook */
function snapshot(){
  const p=profile.get();
  return {
    name:p.name||null,photo:p.photo||null,
    progress:{texts:progress.getAll(),phrases:srs.getAll(),last:progress.getLast(),profileUpdated:p.updated||null},
    notebook:notebook.getAll()
  };
}
function absorb(row){
  if(!row)return;
  quiet=true;
  try{
    const pr=row.progress||{};
    progress.merge(pr.texts);srs.merge(pr.phrases);notebook.merge(row.notebook);
    profile.merge({name:row.name||'',photo:row.photo||'',updated:pr.profileUpdated||''});
    if(pr.last&&!progress.getLast())progress.setLast(pr.last);
  }finally{quiet=false;}
}
async function rest(path,opts={},retry=true){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...opts,
    keepalive:!!opts.body&&opts.body.length<60000,   // que el último guardado llegue aunque se cierre la pestaña
    headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':`Bearer ${await token()}`,'Content-Type':'application/json',...opts.headers}});
  if(r.status===401&&retry){await token(true);return rest(path,opts,false);} // sesión anulada: renueva y reintenta
  if(r.status===404)throw new Error('Falta la tabla "progress" en Supabase (ejecuta tools/supabase.sql).');
  if(!r.ok)throw new Error(`Supabase respondió ${r.status}.`);
  const txt=await r.text();          // al guardar, Supabase responde 201 sin contenido
  return txt?JSON.parse(txt):null;
}

/* Lee la fila del usuario, la une con lo local y guarda el resultado. */
export function sync(){
  if(!loggedIn())return Promise.resolve(false);
  clearTimeout(timer);
  /* Una sola sincronización a la vez: si llega otra, se repite al terminar. */
  if(running){again=true;return running;}
  running=doSync().finally(()=>{
    running=null;
    if(again){again=false;sync().catch(()=>{});}
  });
  return running;
}
async function doSync(){
  setStatus('saving','Sincronizando…');
  try{
    const uid=user().id;
    const rows=await rest(`progress?select=name,photo,progress,notebook&user_id=eq.${uid}`);
    if(rows?.[0])absorb(rows[0]);
    await rest('progress',{method:'POST',
      headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({user_id:uid,...snapshot(),updated_at:new Date().toISOString()})});
    setStatus('ok','Progreso guardado en tu cuenta.');
    return true;
  }catch(e){
    setStatus('error',e.message);
    throw e;
  }
}

/* Reiniciar progreso: guarda lo local SIN unir lo de la nube (si no, la unión
   devolvería los «terminados» borrados). */
export async function overwrite(){
  if(!loggedIn())return false;
  clearTimeout(timer);
  if(running)await running.catch(()=>{});
  setStatus('saving','Guardando el reinicio…');
  try{
    await rest('progress',{method:'POST',
      headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({user_id:user().id,...snapshot(),updated_at:new Date().toISOString()})});
    setStatus('ok','Progreso reiniciado también en tu cuenta.');
    return true;
  }catch(e){setStatus('error',e.message);throw e;}
}

/* Guardado automático unos segundos después del último cambio. */
window.addEventListener('hsk-change',()=>{
  if(quiet||!loggedIn())return;
  clearTimeout(timer);
  setStatus('pending','Cambios pendientes de guardar…');
  timer=setTimeout(()=>sync().catch(()=>{}),4000);
});
window.addEventListener('pagehide',()=>{if(timer){clearTimeout(timer);sync().catch(()=>{});}});
