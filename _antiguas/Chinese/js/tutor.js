/* =====================================================
   TUTORA: sprite pixel art (48×56) dibujado por código
   + cuadro de diálogo con efecto máquina de escribir.
   Diseño chibi (rediseñado a petición del usuario a partir del prototipo).
   Rubia de pelo largo peinado hacia atrás, ojos verdes,
   túnica negra con forro verde, corbata a rayas
   ===================================================== */
const W=48,H=56;
const C={
  o:'#24160f', skin:'#fde6d6', skinS:'#f1bda7', blush:'#f59fa0',
  hair:'#f3da8c', hairL:'#fff3bf', hairS:'#dcb25f', hairD:'#a97c34',
  eyeG:'#37c08a', eyeD:'#14523f', eyeL:'#8ff0c4', white:'#ffffff',
  book:'#9c3540', bookD:'#6b2029', bookL:'#c4505b', page:'#f5edd4',
  gold:'#f3c94b', goldD:'#c9971f',
  robe:'#1d2220', robeL:'#34403b', lin:'#1f7a45', linL:'#3bbd6d',
  vest:'#7b847f', vestD:'#5c6561', shirt:'#f4f6f5', shirtS:'#c4cfca',
  tie:'#2a8f4e', tieL:'#c6efcf', ring:'#d5dae0',
  mouth:'#b9474f', mouthD:'#7c2432', tongue:'#f08a8f',
  drop:'#8fdcff', star:'#fff6a8'
};
let g;
const clear=()=>{g=Array.from({length:H},()=>Array(W).fill(null))};
const R=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i>=0&&i<W&&j>=0&&j<H)g[j][i]=c};
const P=(x,y,c)=>R(x,y,1,1,c);
function outline(){
  const add=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(g[y][x])continue;
    if((y>0&&g[y-1][x])||(y<H-1&&g[y+1][x])||(x>0&&g[y][x-1])||(x<W-1&&g[y][x+1]))add.push([x,y]);
  }
  add.forEach(([x,y])=>g[y][x]=C.o);
}
/* =====================================================
   DISEÑO CHIBI (48×56): cabeza enorme (y 2–35), ojos grandes,
   cuerpo pequeño (y 34–55). La cabeza "respira" con bob (dy);
   el cuerpo no se mueve. Zona visible: x 4–43.
   ===================================================== */
const LEGS='#2b2d33',SHOE='#4a2c1d',SHOEL='#6e4430';

/* VESTUARIO: cada conjunto dibuja el torso (x 13–34, y 34–50)
   y define los colores de la manga para la pose de señalar. */
const sleeves=(c,cL)=>{ // bracitos que bajan hacia el libro
  R(13,37,3,6,c);R(32,37,3,6,c);P(13,37,cL);P(34,37,cL);
};
export const OUTFITS={
  uniforme:{
    name:'Uniforme',
    sleeve:['#1d2220','#34403b'],cuff:['#1f7a45','#3bbd6d'],
    body(point){
      /* túnica negra con vuelo */
      R(16,35,16,1,C.robe);R(15,36,18,11,C.robe);R(14,46,20,4,C.robe);
      R(14,46,1,4,C.robeL);R(33,46,1,4,C.robeL);R(16,37,1,9,C.robeL);R(31,37,1,9,C.robeL);
      /* forro verde */
      R(17,36,2,14,C.lin);R(29,36,2,14,C.lin);P(17,36,C.linL);P(30,36,C.linL);R(17,49,2,1,C.linL);R(29,49,2,1,C.linL);
      /* chaleco gris */
      R(19,36,10,12,C.vest);R(19,36,1,12,C.vestD);R(28,36,1,12,C.vestD);
      /* camisa y corbata a rayas */
      R(20,35,8,2,C.shirt);R(21,37,6,1,C.shirt);R(22,38,4,1,C.shirt);P(20,35,C.shirtS);P(27,35,C.shirtS);
      R(23,36,2,8,C.tie);P(23,38,C.tieL);P(24,38,C.tieL);P(23,41,C.tieL);P(24,41,C.tieL);P(23,44,C.tie);
      if(!point)sleeves(C.robe,C.robeL);else R(32,37,3,6,C.robe);
    }
  },
  qipao:{
    name:'Qipao',
    sleeve:['#b8323c','#d9525b'],cuff:['#f3c94b','#fff3bf'],
    body(point){
      const red='#b8323c',redD='#84202a',redL='#d9525b',gold=C.gold;
      R(16,35,16,1,red);R(15,36,18,11,red);R(14,46,20,4,red);
      R(15,36,1,11,redD);R(32,36,1,11,redD);R(16,37,1,9,redL);R(14,49,20,1,gold);
      R(20,34,8,2,red);R(20,34,8,1,gold);                       // cuello mao
      for(let i=0;i<5;i++)P(24+i,36+i,gold);                   // abertura diagonal
      R(27,38,2,1,gold);R(28,41,2,1,gold);                      // botones de lazo
      P(18,44,gold);P(17,45,gold);P(19,45,gold);P(18,46,gold);P(18,45,C.white); // flor
      P(29,47,gold);P(28,48,gold);P(30,48,gold);
      if(!point)sleeves(red,redL);else R(32,37,3,6,red);
    }
  },
  invierno:{
    name:'Invierno',
    sleeve:['#e9dfc4','#fff7e2'],cuff:['#c9bc98','#e9dfc4'],
    body(point){
      const knit='#e9dfc4',knitD='#c9bc98',blue='#3b6fc4',blueD='#284f91',blueL='#6f9be0';
      R(16,35,16,1,knit);R(15,36,18,11,knit);R(14,46,20,4,knit);
      for(let x=16;x<33;x+=3)R(x,39,1,8,knitD);                // punto acanalado
      R(14,48,20,2,knitD);
      R(17,34,14,3,blue);R(17,34,14,1,blueL);R(17,36,14,1,blueD); // bufanda
      R(26,37,3,7,blue);P(26,37,blueL);R(26,40,3,1,blueL);P(26,44,blue);P(28,44,blue);
      if(!point)sleeves(knit,'#fff7e2');else R(32,37,3,6,knit);
    }
  },
  deportiva:{
    name:'Deportiva',
    sleeve:['#2f8f4e','#ffffff'],cuff:['#1f6b39','#2f8f4e'],
    body(point){
      const g='#2f8f4e',gD='#1f6b39',gL='#46c46f';
      R(16,35,16,1,g);R(15,36,18,11,g);R(14,46,20,4,gD);
      R(15,37,1,10,C.white);R(32,37,1,10,C.white);R(17,38,2,2,gL);
      R(19,34,10,2,gD);R(22,35,4,2,C.white);                   // cuello y camiseta
      R(24,37,1,9,C.ring);                                      // cremallera
      R(17,44,4,1,gD);R(27,44,4,1,gD);                          // bolsillos
      if(!point){sleeves(g,C.white);R(13,40,3,1,C.white);R(32,40,3,1,C.white);}
      else R(32,37,3,6,g);
    }
  }
};

function build(s){
  const dy=s.bob, sw=s.sway;
  const point=s.arm==='point';
  const o=OUTFITS[s.outfit]||OUTFITS.uniforme;
  clear();
  const Rh=(x,y,w,h,c)=>R(x,y+dy,w,h,c);   // partes de la cabeza (respiran)
  const Ph=(x,y,c)=>Rh(x,y,1,1,c);

  /* --- pelo trasero: melena larga que cae por detrás del cuerpo --- */
  R(9,32,6,16,C.hair);R(33,32,6,16,C.hair);
  R(9,32,1,16,C.hairS);R(38,32,1,16,C.hairS);R(12,36,1,10,C.hairL);R(35,36,1,10,C.hairL);
  R(8+sw,47,6,2,C.hair);R(9+sw,49,3,1,C.hair);R(34+sw,47,6,2,C.hair);R(36+sw,49,3,1,C.hair);

  /* --- cabeza grande y redonda (masa de pelo) --- */
  const rows=[[2,16,16],[3,13,22],[4,11,26],[5,9,30],[6,8,32],[7,7,34]];
  for(const [y,x,w] of rows)Rh(x,y,w,1,C.hair);
  Rh(6,8,36,20,C.hair);Rh(7,28,34,3,C.hair);Rh(8,31,32,2,C.hair);Rh(10,33,28,1,C.hair);
  Rh(6,10,1,18,C.hairS);Rh(41,10,1,18,C.hairS);

  /* --- piernas y zapatos (cortitas) --- */
  R(19,50,3,4,LEGS);R(26,50,3,4,LEGS);
  R(18,53,5,2,SHOE);R(25,53,5,2,SHOE);P(19,53,SHOEL);P(26,53,SHOEL);

  /* --- cuerpo / ropa --- */
  R(22,33,4,3,C.skinS);   // cuello
  o.body(point);

  /* --- libro en las manos --- */
  R(16,40,16,9,C.o);
  R(17,41,14,7,C.book);R(17,41,14,1,C.bookL);R(17,41,2,7,C.bookD);R(19,47,12,1,C.page);
  R(23,43,3,1,C.gold);R(22,44,5,1,C.gold);R(23,45,3,1,C.gold);P(24,44,C.goldD);
  R(31,42,3,3,C.skin);P(33,44,C.skinS);                    // mano derecha
  if(!point){R(14,42,3,3,C.skin);P(14,44,C.skinS);}         // mano izquierda

  /* --- cara (parte baja de la cabeza) --- */
  const face=[[13,14,20],[14,12,24],[15,12,24]];
  for(const [y,x,w] of face)Rh(x,y,w,1,C.skin);
  Rh(12,16,24,14,C.skin);Rh(13,30,22,1,C.skin);Rh(14,31,20,1,C.skin);Rh(16,32,16,1,C.skin);Rh(19,33,10,1,C.skin);
  Rh(12,16,1,13,C.skinS);Rh(35,16,1,13,C.skinS);           // sombra lateral

  /* --- flequillo peinado hacia atrás con raya, mechones que enmarcan --- */
  Rh(11,8,26,5,C.hair);Rh(12,13,4,3,C.hair);Rh(32,13,4,3,C.hair);
  Rh(13,6,6,1,C.hairL);Rh(26,6,7,1,C.hairL);Rh(11,7,3,1,C.hairL);Rh(35,7,2,1,C.hairL); // brillo
  Rh(21,4,1,9,C.hairS);Ph(22,12,C.hairS);                     // raya
  Rh(15,9,1,4,C.hairS);Rh(27,9,1,4,C.hairS);Rh(31,8,1,5,C.hairS);Rh(18,8,1,4,C.hairL);Rh(24,9,1,3,C.hairL);
  Rh(9,13,4,19,C.hair);Rh(35,13,4,19,C.hair);                 // mechones laterales
  Rh(9,13,1,19,C.hairS);Rh(38,13,1,19,C.hairS);Rh(11,16,1,12,C.hairL);Rh(36,16,1,12,C.hairL);
  Rh(9+sw,32,4,3,C.hair);Rh(35+sw,32,4,3,C.hair);             // puntas (se mecen)
  /* horquilla dorada */
  Rh(31,9,3,2,C.gold);Ph(31,9,C.white);Ph(33,10,C.goldD);

  /* --- aros --- */
  Rh(11,27,2,1,C.ring);Ph(11,28,C.ring);Rh(11,29,2,1,C.ring);
  Rh(35,27,2,1,C.ring);Ph(36,28,C.ring);Rh(35,29,2,1,C.ring);

  /* --- ojos grandes --- */
  const eye=(x,left)=>{
    const wing=left?x-1:x+6;
    if(s.eyes==='blink'){Rh(x,22,6,1,C.o);Ph(wing,21,C.o);return;}
    if(s.eyes==='happy'){Ph(x,23,C.o);Ph(x+1,22,C.o);Rh(x+2,21,2,1,C.o);Ph(x+4,22,C.o);Ph(x+5,23,C.o);return;}
    /* gesto de superioridad: con las cejas "smug" el párpado cae un píxel */
    if(s.eyes==='open'&&s.brow==='smug'){
      Rh(x,19,6,1,C.o);Ph(wing,19,C.o);Ph(wing,18,C.o);
      Rh(x,20,6,5,C.eyeG);Rh(x,20,6,1,C.eyeD);Rh(x+1,23,4,2,C.eyeL);
      Rh(x+2,21,2,2,C.eyeD);Rh(x+1,21,1,1,C.white);Ph(x+2,21,C.white);Ph(x+4,23,C.white);
      Rh(x+1,25,4,1,C.skinS);
      return;
    }
    Rh(x,18,6,1,C.o);Ph(wing,18,C.o);Ph(wing,17,C.o);         // pestañas
    if(s.eyes==='wide'){
      Rh(x,19,6,6,C.white);Rh(x+1,20,4,4,C.eyeG);Rh(x+2,21,2,2,C.eyeD);Ph(x+1,20,C.white);
    }else{
      Rh(x,19,6,6,C.eyeG);Rh(x,19,6,2,C.eyeD);Rh(x+1,23,4,2,C.eyeL);
      Rh(x+2,21,2,2,C.eyeD);
      Rh(x+1,20,2,2,C.white);Ph(x+4,23,C.white);              // brillos
    }
    Rh(x+1,25,4,1,C.skinS);                                     // párpado inferior
  };
  eye(14,true);eye(28,false);
  /* cejas */
  if(s.brow==='smug'){Rh(14,15,2,1,C.hairD);Rh(16,16,3,1,C.hairD);Rh(32,15,2,1,C.hairD);Rh(29,16,3,1,C.hairD);}
  else if(s.brow==='worry'){Rh(14,16,2,1,C.hairD);Rh(16,15,3,1,C.hairD);Rh(32,16,2,1,C.hairD);Rh(29,15,3,1,C.hairD);}
  else {Rh(14,15,5,1,C.hairD);Rh(29,15,5,1,C.hairD);}
  /* mejillas y nariz */
  Rh(12,26,3,2,C.blush);Rh(33,26,3,2,C.blush);
  if(s.fx==='sparkle'){Ph(13,26,'#ffc0bf');Ph(34,26,'#ffc0bf');}
  Ph(24,26,C.skinS);
  /* boca pequeñita */
  if(s.mouth==='open'){Rh(22,28,4,2,C.mouthD);Rh(23,29,2,1,C.tongue);}
  else if(s.mouth==='smile'){Rh(22,29,4,1,C.mouth);Ph(21,28,C.mouth);Ph(26,28,C.mouth);}
  else if(s.mouth==='flat'){Rh(22,29,3,1,C.mouth);}
  else {Rh(22,29,3,1,C.mouth);Ph(25,28,C.mouth);}            // sonrisa de superioridad

  /* --- brazo señalando hacia arriba (pose "point") --- */
  if(point){
    const f=s.star;
    R(12,34,3,5,o.sleeve[0]);R(10,30,3,5,o.sleeve[0]);P(10,30,o.sleeve[1]);
    R(9,28,4,2,o.cuff[0]);R(9,28,4,1,o.cuff[1]);
    R(9,25,3,3,C.skin);P(11,27,C.skinS);
    R(9,21-f,1,4+f,C.skin);
  }

  outline();

  /* efectos (sin contorno) */
  if(s.fx==='sparkle'){
    const star=(x,y,big)=>{P(x,y,C.star);if(big){P(x-1,y,C.star);P(x+1,y,C.star);P(x,y-1,C.star);P(x,y+1,C.star);}};
    star(5,10,s.star);star(43,6,!s.star);star(43,30,s.star);star(5,36,!s.star);
  }
  if(s.fx==='sweat'){
    P(42,9+dy,C.drop);R(41,10+dy,3,2,C.drop);P(42,12+dy,C.drop);P(41,11+dy,C.white);
  }
}

/* Para revisar el sprite: devuelve la rejilla de colores de un estado concreto. */
export function spriteGrid(state){build({bob:0,sway:0,star:0,eyes:'open',brow:'smug',mouth:'smirk',...state});return g;}

function createGirl(cv){
  const ctx=cv.getContext('2d');
  let mood='idle',base='idle',talking=false,last='',moodTO,talkTO;
  let outfit='uniforme';
  try{const o=localStorage.getItem('hsk.outfit');if(o in OUTFITS)outfit=o;}catch{}
  const t0=performance.now();
  const MOODS={
    idle :{eyes:'open',brow:'smug',mouth:'smirk'},
    point:{eyes:'open',brow:'smug',mouth:'smile',arm:'point'},
    think:{eyes:'open',brow:'flat',mouth:'smirk'},
    happy:{eyes:'happy',brow:'flat',mouth:'smile',fx:'sparkle'},
    oops :{eyes:'wide',brow:'worry',mouth:'flat',fx:'sweat'}
  };
  function state(){
    const t=performance.now()-t0;
    const m=MOODS[mood];
    const s={bob:Math.floor(t/650)%2,sway:Math.floor(t/1000)%2,star:Math.floor(t/380)%2,outfit,...m};
    if((t%3300)<150&&(s.eyes==='open'||s.eyes==='wide'))s.eyes='blink';
    if(talking&&Math.floor(t/130)%2)s.mouth='open';
    return s;
  }
  function paint(s){
    build(s);
    ctx.clearRect(0,0,W,H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=g[y][x];if(c){ctx.fillStyle=c;ctx.fillRect(x,y,1,1);}}
  }
  function tick(){const s=state();const k=JSON.stringify(s);if(k!==last){last=k;paint(s);}}
  setInterval(tick,80);tick();
  return{
    mood(m,hold=0){mood=m;clearTimeout(moodTO);if(hold)moodTO=setTimeout(()=>{mood=base},hold);},
    /* Estado al que vuelve tras un gesto temporal ('idle' o 'point' en los menús). */
    base(m){base=m;},
    /* Cambia al siguiente conjunto (o al indicado) y lo recuerda. Devuelve su nombre. */
    outfit(name){
      const keys=Object.keys(OUTFITS);
      outfit=name in OUTFITS?name:keys[(keys.indexOf(outfit)+1)%keys.length];
      try{localStorage.setItem('hsk.outfit',outfit);}catch{}
      return OUTFITS[outfit].name;
    },
    talk(ms){talking=true;clearTimeout(talkTO);talkTO=setTimeout(()=>{talking=false},ms);},
    talkOn(v){clearTimeout(talkTO);talking=v;}
  };
}

/* =====================================================
   DIÁLOGO
   say(html, opciones): pinta el HTML en el cuadro. Los
   elementos .tw se escriben letra a letra. Un clic en el
   cuadro salta la animación.
   ===================================================== */
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

export function createTutor({canvas,body}){
  const girl=createGirl(canvas);
  let tok=0,skipNow=false;
  body.addEventListener('click',()=>{skipNow=true;});

  const api={
    body,
    /* Se llama en cada say(); el lector lo usa para olvidar la última palabra. */
    onSay:null,
    mood:(m,hold)=>girl.mood(m,hold),
    setBase:m=>girl.base(m),
    nextOutfit:name=>girl.outfit(name),
    say(html,{type=true,mood='think',hold=0,keepWord=false}={}){
      const my=++tok;skipNow=false;
      if(api.onSay)api.onSay(keepWord);
      const frame=body.parentElement;
      frame.classList.remove('ready');
      /* ▼ al terminar de hablar (no en las tarjetas de palabra) */
      const ready=()=>{if(my===tok&&!keepWord)frame.classList.add('ready');};
      body.innerHTML=html;body.scrollTop=0;
      girl.mood(mood,hold);
      const tws=[...body.querySelectorAll('.tw')];
      if(!type||!tws.length||reduceMotion.matches){
        girl.talkOn(true);setTimeout(()=>{if(my===tok){girl.talkOn(false);ready();}},keepWord?450:900);return;
      }
      const texts=tws.map(e=>{const t=e.textContent;e.textContent='';e.classList.add('typing');return t});
      girl.talkOn(true);
      (async()=>{
        for(let i=0;i<tws.length;i++){
          for(let c=1;c<=texts[i].length;c++){
            if(my!==tok)return;
            if(skipNow){tws.forEach((e,k)=>{e.textContent=texts[k];e.classList.remove('typing')});girl.talkOn(false);ready();return;}
            tws[i].textContent=texts[i].slice(0,c);
            await sleep(13);
          }
          tws[i].classList.remove('typing');
        }
        if(my===tok){girl.talkOn(false);ready();}
      })();
    }
  };
  return api;
}
