/* R49 — visual presentation only; all accepted damage, costs and saves remain R48. */
'use strict';
const V49={version:'52',soulView:'summon',glows:new Map(),castCooldown:{},empty:[]};
const WALK_FPS=Object.freeze({skeleton:2.8,cultist:2.5,wraith:2.2,beast:3.6,elite:1.9,mimic:2.5,boss:2.3});
function vWalkFrame(kind,t){const frames=kind==='boss'?[0,1,2,1]:[1,2,3,2];return frames[Math.floor(Math.max(0,t)*(WALK_FPS[kind]||2.8))%4];}
const v49OriginalImpact=vImpact;
vImpact=function(type,x,y,r=36,extra={}){
 const layer=V42.impactLayer||(type==='boss'?'area':'cast');
 // Damage ticks are compact sparks. Only the real blast event draws its full area.
 const life=layer==='hit'?(type==='thunderstorm'?.42:.28):({flame_nova:.64,holy_spear:.62,curse:.62,demons:.8,arcane_focus:.7,shadow_path:.38,boss:.48}[type]||.45);
 v49OriginalImpact(type,x,y,r,{life,layer,...extra});
};
const v49Hurt=hurt;
hurt=function(e,amount,crit=false,color,spread=true,source=null){
 const previous=V42.impactLayer;V42.impactLayer='hit';
 if(source==='shadow'&&e&&enemies.includes(e)&&V42.shadowFrom){const a=V42.shadowFrom;vImpact('shadow_path',a.x,a.y,0,{tx:e.x,ty:e.y,layer:'path',life:.38});V42.shadowFrom={x:e.x,y:e.y};}
 try{return v49Hurt(e,amount,crit,color,spread,source);}finally{V42.impactLayer=previous;}
};
const v49Blast=blast;
blast=function(...args){const previous=V42.impactLayer;V42.impactLayer='area';try{return v49Blast(...args);}finally{V42.impactLayer=previous;}};
const v49ShadowDash=shadowDash;
shadowDash=function(...args){const previous=V42.shadowFrom;V42.shadowFrom={x:player.x,y:player.y};try{return v49ShadowDash(...args);}finally{V42.shadowFrom=previous;}};
const v49FireSkill=fireSkill;
fireSkill=function(id,manual=false){const origin={x:player.x,y:player.y},ok=v49FireSkill(id,manual);if(ok){V49.castCooldown[id]=cd[id];if(id==='thunderstorm'||id==='shadow')vImpact('cast_'+id,origin.x,origin.y,31,{life:.35,layer:'cast'});if(!V42.reduced)vParticle(player.x,player.y-24,V42.palettes[id],id==='flame_nova'?12:6,55);}return ok;};
function v49Glow(x,y,r,color,alpha=.2){if(V42.quality==='low'||V42.reduced||r<1)return;let im=V49.glows.get(color);if(!im){im=document.createElement('canvas');im.width=im.height=64;const c=im.getContext('2d'),g=c.createRadialGradient(32,32,1,32,32,32);g.addColorStop(0,color);g.addColorStop(.35,color+'88');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,64,64);V49.glows.set(color,im);}ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=alpha;ctx.drawImage(im,x-r,y-r,r*2,r*2);ctx.restore();}
function v49Ring(r,progress,color,alpha=.6){ctx.save();ctx.strokeStyle=color;ctx.globalAlpha*=alpha;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();ctx.restore();}
function v49RuneRing(r,color,phase=0,count=10){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1;for(let i=0;i<count;i++){const a=i*Math.PI*2/count+phase,x=Math.cos(a)*r,y=Math.sin(a)*r;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(3,0);ctx.lineTo(-3,3);ctx.moveTo(0,-4);ctx.lineTo(0,4);ctx.stroke();ctx.restore();}ctx.restore();}
function v49Streaks(r,p,color,count=8){ctx.strokeStyle=color;ctx.lineWidth=2;for(let i=0;i<count;i++){const a=i*Math.PI*2/count+.25,inner=r*(.18+.5*p),outer=r*(.5+.48*p);ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);ctx.stroke();}}
function v49Bolt(x1,y1,x2,y2,seed,width=2){ctx.beginPath();ctx.moveTo(x1,y1);for(let i=1;i<8;i++){const p=i/8,j=Math.sin(seed+i*7.37)*9*(Math.sin(p*Math.PI));ctx.lineTo(x1+(x2-x1)*p+j,y1+(y2-y1)*p-j*.6);}ctx.lineTo(x2,y2);ctx.lineWidth=width;ctx.stroke();}
function v49Spear(r,p){const rise=130*(1-Math.min(1,p*5));v49Glow(0,-16,60,'#f2d28e',.22);ctx.fillStyle='#ffeac1';ctx.beginPath();ctx.moveTo(0,-148-rise);ctx.lineTo(4,-34-rise);ctx.lineTo(10,-34-rise);ctx.lineTo(0,0);ctx.lineTo(-10,-34-rise);ctx.lineTo(-4,-34-rise);ctx.closePath();ctx.fill();ctx.fillStyle='#fff9e5';ctx.fillRect(-1,-130-rise,2,118);v49Ring(r,1,'#f4d59a',.35);v49RuneRing(r*.86,'#ffe4ac',0,8);v49Ring(r*(.2+.78*p),1,'#fff0c5',.85);v49Streaks(r*.7,p,'#f6dfac',8);}
function v49Flame(r,p){v49Glow(0,0,r*.76,'#f17d39',.16);v49Ring(r,1,'#d88450',.22);v49Ring(r*(.35+.65*p),1,'#ffbd73',.9);const n=V42.quality==='low'?10:18;for(let i=0;i<n;i++){const a=i*Math.PI*2/n,rr=r*(.55+.42*p),x=Math.cos(a)*rr,y=Math.sin(a)*rr;ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);ctx.fillStyle=i%2?'#f9ac5a':'#e86f43';ctx.beginPath();ctx.moveTo(-5,5);ctx.quadraticCurveTo(-6,-6,3,-22*(1-p));ctx.quadraticCurveTo(8,-4,5,5);ctx.closePath();ctx.fill();ctx.fillStyle='#ffe0a0';ctx.fillRect(-1,-5,3,8);ctx.restore();}v49Streaks(r*.58,p,'#ffcc87',6);}
function v49Curse(r,p){v49Glow(0,0,r*.65,'#a175dc',.13);v49Ring(r,1,'#ad88dc',.36);v49Ring(r*.72,1,'#bf9ceb',.55);v49RuneRing(r*.88,'#d5b8fa',p*.12,12);ctx.strokeStyle='#c3a1ec';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<=5;i++){const a=i*Math.PI*4/5-Math.PI/2,x=Math.cos(a)*r*.55,y=Math.sin(a)*r*.55;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
function v49Legion(p){for(let i=0;i<4;i++){const a=-Math.PI*.8+i*Math.PI*.53,x=Math.cos(a)*50,y=Math.sin(a)*16-25-p*13;ctx.save();ctx.translate(x,y);v49Glow(0,-16,25,'#ddbc76',.18);ctx.strokeStyle='#e6ca8b';ctx.fillStyle='#dcc08055';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(0,-43);ctx.stroke();ctx.beginPath();ctx.moveTo(1,-39);ctx.lineTo(19,-35+Math.sin(p*7+i)*3);ctx.lineTo(16,-12);ctx.lineTo(9,-18);ctx.lineTo(1,-15);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff0be';ctx.fillRect(7,-30,6,2);ctx.fillRect(9,-33,2,8);ctx.restore();}}
function v49Prism(x,y,s,color){ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.fillStyle=color+'35';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*.52,0);ctx.lineTo(0,s);ctx.lineTo(-s*.52,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(0,s);ctx.stroke();ctx.restore();}
function v49Impact(e){const p=(V42.now-e.born)/e.life;if(p<0||p>1)return;const raw=e.type.replace('cast_',''),color=V42.palettes[raw]||e.color||'#e6cfa4',fade=Math.pow(1-p,.8);ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=fade;ctx.strokeStyle=color;ctx.fillStyle=color;
 if(e.type==='shadow_path'){const dx=e.tx-e.x,dy=e.ty-e.y;ctx.strokeStyle='#8d69b8';ctx.lineWidth=9*(1-p);ctx.globalAlpha=fade*.25;ctx.beginPath();ctx.moveTo(0,-22);ctx.quadraticCurveTo(dx*.5,dy*.5-35,dx,dy-22);ctx.stroke();ctx.strokeStyle='#dbc3ff';ctx.lineWidth=1.5;ctx.globalAlpha=fade*.7;ctx.stroke();if(V42.quality!=='low'&&!V42.reduced)for(const q of [.2,.48,.75])vFrame('knight',2,2,dx*q,dy*q,98,V42.player.face<0,fade*.12);}
 else if(e.layer==='hit'){
  v49Glow(0,-19,e.crit?30:20,color,e.crit?.3:.18);ctx.translate(0,-18);
  if(raw==='thunderstorm'){ctx.strokeStyle='#ffb36c';ctx.shadowColor='#ff692c';ctx.shadowBlur=18;ctx.translate(0,18);v49Ring(28*(.7+p*.5),2.5,'#ffb36c',.75);}
  else if(raw==='shadow'){ctx.strokeStyle='#d2b6ff';ctx.lineWidth=2.5;for(let i=-1;i<2;i++){ctx.beginPath();ctx.moveTo(-19+i*8,-20+p*9);ctx.lineTo(12+i*8,10+p*9);ctx.stroke();}}
  else if(raw==='curse'){v49Prism(0,0,12,'#c9a3ed');v49Ring(17,1,'#a37dcc',.5);}
  else{v49Streaks(e.crit?30:19,p,color,e.crit?8:5);if(raw==='flame_nova'){ctx.fillStyle='#ffe1a3';ctx.fillRect(-2,-10-p*12,4,12);}}
 }else if(raw==='holy_spear'){ctx.strokeStyle='#ba80f8';ctx.shadowColor='#8f44e4';ctx.shadowBlur=18;v49Ring(e.r*(.5+p*.8),3,'#c68bf9',.8);}
 else if(raw==='flame_nova')v49Flame(e.r,p);
 else if(raw==='curse')v49Curse(e.r,p);
 else if(raw==='demons')v49Legion(p);
 else if(raw==='arcane_focus'){v49Glow(0,-25,65,'#9baafa',.2);v49RuneRing(44,'#b7c2ff',p*.4,8);for(let i=0;i<3;i++){const a=i*Math.PI*2/3+p*.4;v49Prism(Math.cos(a)*38,Math.sin(a)*18-34,11,'#c6d1ff');}}
 else if(raw==='fury'){v49Glow(0,-22,65,'#e75b6f',.2);v49Streaks(52,p,'#f3978d',8);v49RuneRing(39,'#df6e7b',0,6);}
 else if(raw==='grace'){v49Glow(0,0,e.r*.65,'#dfc384',.14);v49Ring(e.r,1,'#e9ce97',.4);v49Ring(e.r*(.6+.4*p),1,'#fff0c2',.7);ctx.lineWidth=2;for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(e.r*.5,-4);ctx.quadraticCurveTo(e.r*.7,-15,e.r*.83,0);ctx.stroke();ctx.restore();}}
 else if(raw==='boss'){v49Ring(e.r,1,color,.45);v49Ring(e.r*(.55+.45*p),1,'#ffd9b1',.8);v49Streaks(e.r*.6,p,color,10);}
 else if(raw==='arcane_focus'||e.type.startsWith('cast_')){v49RuneRing(e.r,color,p*.5,6);v49Ring(e.r*(.5+.5*p),1,color,.6);}
 else if(raw==='level'||raw==='revive'){v49Glow(0,-25,65,'#ffe4a6',.25);v49Ring(e.r*(.5+.5*p),1,'#efd9a9',.7);for(let i=0;i<9;i++)ctx.fillRect(Math.cos(i*2.4)*35,-p*65+Math.sin(i)*15,2,12);}
 else {ctx.lineWidth=e.crit?4:2;ctx.beginPath();ctx.arc(0,-16,e.r*.85,-2.3+p*.8,.6+p*.8);ctx.stroke();}
 ctx.restore();}
const v49LegacyEffects=vEffects;
vEffects=function(){
 for(const e of V42.impacts)v49Impact(e);
 for(const e of V42.links){const p=(V42.now-e.born)/.35;if(p<0||p>1)continue;ctx.save();ctx.globalAlpha=(1-p)*.8;ctx.strokeStyle=e.color;v49Bolt(e.x,e.y-20,e.tx,e.ty-20,e.born*9,2.5);ctx.strokeStyle='#f4f4ff';ctx.globalAlpha*=.7;v49Bolt(e.x,e.y-20,e.tx,e.ty-20,e.born*9,1);ctx.restore();}
 // Retain the original bounded particle/loot drawing without duplicate spell layers.
 const impacts=V42.impacts,links=V42.links;V42.impacts=V49.empty;V42.links=V49.empty;try{v49LegacyEffects();}finally{V42.impacts=impacts;V42.links=links;}
};
vBuffs=function(){for(const id of ['grace','fury','curse','demons','arcane_focus'])if(active[id]>0){const c=V42.palettes[id],r={grace:33,fury:27,curse:40,demons:46,arcane_focus:38}[id];ctx.save();ctx.translate(player.x,player.y+1);ctx.scale(1,.42);ctx.globalAlpha=.45;v49Ring(r,1,c,.75);v49RuneRing(r*.85,c,V42.reduced?0:V42.now*.15,id==='demons'?4:6);ctx.restore();if(id==='arcane_focus'){ctx.save();ctx.globalAlpha=.65;for(let i=0;i<3;i++){const a=(V42.reduced?0:V42.now*.6)+i*Math.PI*2/3;v49Prism(player.x+Math.cos(a)*35,player.y-37+Math.sin(a)*11,6,'#b8caff');}ctx.restore();}}};

// R61: esta camada estava ausente nas versões anteriores: efeitos R59 foram criados
// na lista de combate `effects`, enquanto o renderizador R49 desenha V42.impacts.
// Renderizar as MESMAS reações que aplicam o dano, sem inventar golpes extras.
function r61DrawSpellReactions(){
 const low=V42.quality==='low'||V42.reduced;
 const now=r61WallMs();r61VisualEffects=r61VisualEffects.filter(e=>(now-e.born)<e.life*1000);
 for(const e of r61VisualEffects){
  if(!['lightning','spearline','fireline','spear','fireburst','electric','gracewave','fireflight','emberburst','embermark','veilburst','veillink'].includes(e.kind))continue;
  const t=Math.min(1,Math.max(0,(now-e.born)/(1000*e.life))),a=Math.max(0,1-t);
  ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=e.color;ctx.fillStyle=e.color;
  if(e.kind==='fireflight'){
   if(g.speed>=10){const px=e.x+(e.x2-e.x)*t,py=e.y+(e.y2-e.y)*t;ctx.globalCompositeOperation='lighter';ctx.shadowBlur=low?0:21;ctx.shadowColor='#ff8c33';ctx.fillStyle='#ff9944';ctx.beginPath();ctx.arc(px,py-17,12,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff7bd';ctx.beginPath();ctx.arc(px-2,py-19,5,0,Math.PI*2);ctx.fill();}
  }else if(e.x2!==undefined){
   const dx=e.x2-e.x,dy=e.y2-e.y,dis=Math.max(1,Math.hypot(dx,dy));
   ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor=e.color;ctx.shadowBlur=low?0:14;
   ctx.lineWidth=e.kind==='lightning'?4.5:3.3;
   if(e.kind==='lightning'){
    ctx.beginPath();ctx.moveTo(e.x,e.y-22);
    for(let j=1;j<7;j++){
     const p=j/7,side=Math.sin(j*7.9+V42.now*32)*12*Math.sin(p*Math.PI);
     ctx.lineTo(e.x+dx*p-dy/dis*side,e.y+dy*p+dx/dis*side-22);
    }
    ctx.lineTo(e.x2,e.y2-22);ctx.stroke();
    ctx.shadowBlur=0;ctx.strokeStyle='#f4ffff';ctx.lineWidth=1.1;ctx.stroke();
   }else{
    ctx.beginPath();ctx.moveTo(e.x,e.y-24);ctx.quadraticCurveTo((e.x+e.x2)/2,(e.y+e.y2)/2-55,e.x2,e.y2-22);ctx.stroke();
   }
  }else if(e.kind==='spear'){
   const rise=95*(1-t);ctx.shadowColor='#ffdf93';ctx.shadowBlur=low?0:20;
   ctx.translate(e.x,e.y);ctx.lineWidth=4.4;ctx.beginPath();ctx.moveTo(0,-127+rise);ctx.lineTo(0,-12+rise*.15);ctx.stroke();
   ctx.fillStyle='#fff9de';ctx.beginPath();ctx.moveTo(0,-144+rise);ctx.lineTo(10,-117+rise);ctx.lineTo(0,-124+rise);ctx.lineTo(-10,-117+rise);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#ffe5a4';ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(0,0,26+50*t,(14+33*t)*.65,0,0,Math.PI*2);ctx.stroke();
  }else if(['fireburst','emberburst','embermark','veilburst'].includes(e.kind)){
   ctx.translate(e.x,e.y);ctx.shadowColor=e.kind==='veilburst'?'#9f56e3':'#ff8636';ctx.shadowBlur=low?0:20;
   ctx.strokeStyle=e.kind==='veilburst'?'#d4a0ff':'#ffc06c';ctx.lineWidth=5*(1-t)+1;ctx.beginPath();ctx.arc(0,0,15+e.r*t,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle=e.kind==='veilburst'?'#a76af8':'#ff933d';ctx.globalAlpha=a*.32;ctx.beginPath();ctx.arc(0,0,11+e.r*.7*t,0,Math.PI*2);ctx.fill();
   if(!low){ctx.globalAlpha=a;ctx.fillStyle=e.kind==='veilburst'?'#ead1ff':'#fff0b6';for(let j=0;j<8;j++){
    const angle=j*Math.PI/4,rad=(15+e.r*t)*1.2;ctx.fillRect(Math.cos(angle)*rad-2,Math.sin(angle)*rad-2,4,4);
   }}
  }else if(e.kind==='electric'){
   ctx.translate(e.x,e.y);ctx.strokeStyle='#d4ffff';ctx.shadowColor='#6dcefc';ctx.shadowBlur=low?0:14;ctx.lineWidth=2.6;
   for(let j=0;j<5;j++){const angle=j*2*Math.PI/5+t*1.1,r=e.r*(.3+.75*t);
    ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(Math.cos(angle)*r*.55,Math.sin(angle)*r*.48-22);
    ctx.lineTo(Math.cos(angle+.25)*r,Math.sin(angle+.25)*r*.65-22);ctx.stroke();}
  }else if(e.kind==='gracewave'){
   ctx.translate(e.x,e.y);ctx.shadowColor='#f6df97';ctx.shadowBlur=low?0:16;ctx.lineWidth=4.5*(1-t)+1;
   ctx.beginPath();ctx.ellipse(0,0,19+e.r*t,10+e.r*t*.65,0,0,Math.PI*2);ctx.stroke();
   ctx.strokeStyle='#fff7d6';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,9+e.r*.7*t,8+e.r*.45*t,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
 }
 // Bolas de fogo percorrem o espaço até o próximo inimigo e não apenas aparecem no alvo.
 for(const orb of fireOrbs){
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=orb.trail.length-1;i>=0;i--){const q=orb.trail[i];const a=(1-i/(orb.trail.length+1))*.40;
   ctx.globalAlpha=a;ctx.fillStyle=i%2?'#fa633c':'#ffc36a';ctx.beginPath();ctx.arc(q.x,q.y-15,Math.max(2,8-i),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;ctx.shadowBlur=low?0:22;ctx.shadowColor='#ff8a35';ctx.fillStyle='#ff8a35';ctx.beginPath();ctx.arc(orb.x,orb.y-17,12,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle='#fff7d4';ctx.beginPath();ctx.arc(orb.x-2,orb.y-19,5,0,Math.PI*2);ctx.fill();ctx.restore();
 }
}
const r61OldVEffects=vEffects;
vEffects=function(){r61OldVEffects();r61DrawSpellReactions();};

// UI keeps existing action names and values. No gameplay formulas are duplicated here.
// VEILFALL R64 — camada artística de combate. Somente apresentação:
// nenhum multiplicador, cooldown, dano, área ou duração mecânica é alterado.
const R64FX={casts:[],max:100,version:64};
function r64Clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v));}
function r64Ease(v){v=r64Clamp(v);return 1-(1-v)*(1-v)*(1-v);}
function r64Seed(v){return (Math.sin(v*83.71+17.234)*43758.5453)%1;}
function r64Glow(x,y,r,color,a){if(V42.reduced||V42.quality==='low')return;v49Glow(x,y,r,color,a);}
function r64Line(x1,y1,x2,y2,color,w,alpha=1){ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
function r64Ellipse(rx,ry,color,width,alpha=1,rotation=0){
 ctx.save();ctx.rotate(rotation);ctx.globalAlpha*=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.ellipse(0,0,Math.max(0.1,rx),Math.max(.1,ry),0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
function r64Sigil(r,color,t,pattern=6,alpha=1){
 ctx.save();ctx.globalAlpha*=alpha;ctx.rotate(t);r64Ellipse(r,r*.49,color,1.4,.82);
 ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.beginPath();
 for(let j=0;j<=pattern;j++){
  const a=j*Math.PI*2/pattern;const x=Math.cos(a)*r*.72,y=Math.sin(a)*r*.34;
  if(!j)ctx.moveTo(x,y);else ctx.lineTo(x,y);
 }ctx.stroke();
 for(let j=0;j<pattern;j++){
  const a=j*Math.PI*2/pattern;const x=Math.cos(a)*r,y=Math.sin(a)*r*.49;
  ctx.save();ctx.translate(x,y);ctx.rotate(-a+t*.22);ctx.beginPath();
  ctx.moveTo(-3,-4);ctx.lineTo(0,-7);ctx.lineTo(3,-4);ctx.lineTo(0,5);ctx.closePath();ctx.stroke();ctx.restore();
 }ctx.restore();
}
function r64Shards(e,t,color,n,base,speed,alpha=1){
 const cap=V42.quality==='low'||V42.reduced?Math.min(6,n):n;
 ctx.save();ctx.fillStyle=color;ctx.globalAlpha*=alpha;
 for(let j=0;j<cap;j++){
  const theta=(j+(.18*Math.sin(j*14.7+e.x)))*Math.PI*2/n+.35;
  const outward=base+speed*r64Ease(t)*(0.7+0.30*Math.sin(j*29.2));
  const x=Math.cos(theta)*outward,y=Math.sin(theta)*outward*.72;
  const len=(4+Math.max(0,12*(1-t)))*(0.65+0.3*Math.sin(j*6.12+3));
  ctx.save();ctx.translate(x,y-22-10*t);ctx.rotate(theta+Math.PI*.5);ctx.beginPath();
  ctx.moveTo(0,-len);ctx.lineTo(Math.max(1.5,len*.22),0);ctx.lineTo(0,len*.5);ctx.lineTo(-Math.max(1,len*.17),0);ctx.closePath();ctx.fill();ctx.restore();
 }ctx.restore();
}
function r64Veil(e,t,alpha){
 const r=Math.max(34,e.r||90),rise=r64Ease(t),easeOut=Math.pow(1-t,1.25);
 ctx.save();ctx.translate(e.x,e.y-19);ctx.globalAlpha=alpha;
 if(!V42.reduced){ctx.globalCompositeOperation='screen';r64Glow(0,0,r*.90,'#733bc7',.32*easeOut);r64Glow(0,-8,r*.50,'#a86dff',.26*easeOut);}
 r64Ellipse(22+r*rise,11+r*.59*rise,'#6334ab',8*easeOut+1,.40*easeOut);
 r64Ellipse(18+r*.78*rise,10+r*.42*rise,'#e9c1ff',3.3*easeOut+.5,.86*easeOut);
 // Two cutting scythes orbit toward the target, staggered in time.
 for(let j=0;j<3;j++){
  const s=r64Clamp((t-j*.095)/.68),theta=-2.35+j*Math.PI*.74+s*3.7;
  ctx.save();ctx.rotate(theta);ctx.globalAlpha*=Math.pow(1-s,.7);
  ctx.shadowColor='#d28aff';ctx.shadowBlur=V42.reduced?0:13;
  ctx.strokeStyle=j===1?'#f8dcff':'#bf83ff';ctx.lineWidth=5.5*(1-s)+1.7;ctx.lineCap='round';ctx.beginPath();
  const d=r*(.48+.35*s);
  ctx.moveTo(-d*.83,-d*.16);ctx.quadraticCurveTo(0,-d*.8,d*.92,-d*.04);ctx.stroke();
  ctx.strokeStyle='#fff2ff';ctx.lineWidth=1.1;ctx.stroke();ctx.restore();
 }
 if(t<.6){r64Sigil(r*(.43+.14*t),'#e6bbff',-t*1.45+(e.x%13)*.1,7,(1-t)*.83);}
 r64Shards(e,t,'#e3adff',15,r*.11,r*.90,easeOut);
 if(t<.36){ctx.globalAlpha*=1-t/.36;ctx.fillStyle='#f2d7ff';ctx.beginPath();ctx.ellipse(0,0,21*(1-t/.36),13*(1-t/.36),0,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
function r64Ember(e,t,alpha,isMark=false){
 const r=Math.max(22,e.r||70),u=r64Ease(t),fade=Math.pow(1-t,1.3);
 ctx.save();ctx.translate(e.x,e.y-18);ctx.globalAlpha=alpha;
 ctx.globalCompositeOperation='screen';
 r64Glow(0,0,r*.83,'#e65d1f',.35*fade);r64Glow(0,-10,r*.44,'#ffc067',.34*fade);
 ctx.shadowColor='#ff9e44';ctx.shadowBlur=V42.quality==='low'?0:13;
 r64Ellipse(12+r*(isMark?.32:.97)*u,6+r*(isMark?.17:.57)*u,'#fe8b3b',7*fade+1,.58*fade);
 r64Ellipse(9+r*(isMark?.35:.82)*u,5+r*(isMark?.20:.47)*u,'#ffebad',2.4*fade+1,.94*fade);
 if(isMark){
  const z=20+12*u;r64Sigil(z,'#ffce86',t*2.2+e.x*.01,5,.95*fade);
  ctx.strokeStyle='#fff0c5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-z*.60);ctx.lineTo(z*.37,0);ctx.lineTo(0,z*.60);ctx.lineTo(-z*.37,0);ctx.closePath();ctx.stroke();
 }else{
  // Fire petals burst outward as a cohesive ignition, not a plain circle.
  const count=V42.reduced?7:13;
  for(let j=0;j<count;j++){
   const a=j*Math.PI*2/count+(e.y%7)*.12,dist=(r*.21+r*.74*u)*(0.9+Math.sin(j*6.3)*.07);
   ctx.save();ctx.rotate(a);ctx.translate(dist,0);ctx.rotate(.28*(1-u));ctx.globalAlpha*=fade;
   ctx.fillStyle=j%3===0?'#fff0b5':j%2?'#ff8a31':'#f3532c';ctx.beginPath();
   ctx.moveTo(-7,-3);ctx.quadraticCurveTo(0,-11,14+14*(1-u),0);ctx.quadraticCurveTo(0,11,-7,3);ctx.closePath();ctx.fill();ctx.restore();
  }
  r64Shards(e,t,'#ffe0a0',16,r*.14,r*.94,fade);
 }
 if(t<.3){ctx.globalAlpha*=1-t/.3;ctx.fillStyle='#fff3bb';ctx.beginPath();ctx.ellipse(0,0,17*(1-t/.3),11*(1-t/.3),0,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
function r64Ribbon(e,t,a,kind){
 const x1=e.x,y1=e.y-24,x2=e.x2,y2=e.y2-24;
 const dx=x2-x1,dy=y2-y1,d=Math.max(1,Math.hypot(dx,dy)),nx=-dy/d,ny=dx/d;
 const purple=kind==='veillink';const bright=purple?'#f1caff':'#fff0bb',core=purple?'#9b5ee2':'#ff8936';
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha*=a;
 for(let layer=0;layer<3;layer++){
  ctx.beginPath();ctx.moveTo(x1,y1);
  for(let j=1;j<11;j++){
   const f=j/11,s=Math.sin(f*Math.PI)*Math.sin(f*25+e.x*.05+t*12)*9*(purple?1.1:.56);
   ctx.lineTo(x1+dx*f+nx*s,y1+dy*f+ny*s);
  }
  ctx.lineTo(x2,y2);ctx.strokeStyle=layer===0?core:layer===1?bright:'#fffdf1';ctx.lineWidth=layer===0?10:layer===1?3.2:1.1;
  ctx.globalAlpha=a*(layer===0?.25:layer===1?.74:.84);
  ctx.shadowColor=core;ctx.shadowBlur=layer===0&&!V42.reduced?12:0;ctx.stroke();
 }
 const progress=r64Ease(t),qx=x1+dx*progress,qy=y1+dy*progress;
 r64Glow(qx,qy,30,core,.48*a);
 ctx.fillStyle=bright;ctx.globalAlpha=a*(1-t);ctx.beginPath();ctx.arc(qx,qy,3.2,0,Math.PI*2);ctx.fill();ctx.restore();
}
function r64Grace(e,t,alpha){
 const r=e.r||105,u=r64Ease(t),fade=1-t;ctx.save();ctx.translate(e.x,e.y-8);ctx.globalAlpha*=alpha;
 r64Glow(0,0,r*.8,'#e6c27c',.25*fade);
 r64Ellipse(20+r*u,12+r*.55*u,'#e6c282',5*fade+.8,.56*fade);
 r64Ellipse(15+r*.86*u,9+r*.43*u,'#fff3c8',2.4*fade+.7,.91*fade);
 ctx.save();ctx.translate(0,-13);ctx.globalAlpha*=fade;ctx.strokeStyle='#fff5da';ctx.lineWidth=2;
 for(let j=0;j<8;j++){const angle=j*Math.PI/4+t*.6,inner=16+20*u,outer=35+r*.5*u;
  r64Line(Math.cos(angle)*inner,Math.sin(angle)*inner,Math.cos(angle)*outer,Math.sin(angle)*outer,'#ffe3a1',j%2?2.5:1.4);
 }ctx.restore();ctx.restore();
}
function r64Cast(e,t,a){
 const veil=e.id==='holy_spear'||e.id==='curse';const fire=e.id==='thunderstorm'||e.id==='flame_nova';
 const base=veil?'#be83ff':fire?'#ffad60':'#f6d89a';const highlight=veil?'#f2d3ff':fire?'#fff1bc':'#fff8d9';
 const s=r64Ease(t),r=e.id==='holy_spear'||e.id==='thunderstorm'?57:44;
 ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha*=a;
 r64Glow(0,-24,r*1.4,base,.25*(1-t));
 r64Sigil(r*(.78+.23*s),base,t*.9+(veil?.4:-.5),veil?7:6,.67*(1-t));
 r64Ellipse(r*(.36+.85*s),r*(.21+.44*s),highlight,2.2,(1-t)*.8);
 for(let j=0;j<7;j++){
  const theta=(j/7)*Math.PI*2+.3;const d=r*(.6+.6*s);
  r64Line(Math.cos(theta)*r*.40,Math.sin(theta)*r*.2-18,Math.cos(theta)*d,Math.sin(theta)*d*.63-25-s*13,base,1.3,(1-t)*.85);
 }
 ctx.restore();
}
function r64DrawEmberOrb(orb,now,low){
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let j=orb.trail.length-1;j>=0;j--){const q=orb.trail[j],f=1-j/(orb.trail.length+1);
  ctx.globalAlpha=f*.52;ctx.fillStyle=j%2?'#ff7a39':'#ffd080';ctx.beginPath();ctx.arc(q.x,q.y-19,2.3+6*f,0,Math.PI*2);ctx.fill();}
 const flicker=1+Math.sin(now*.02+orb.x*.05)*.12;
 r64Glow(orb.x,orb.y-22,38,'#ff8c38',.42);
 ctx.globalAlpha=.9;ctx.fillStyle='#ef6628';ctx.beginPath();ctx.arc(orb.x,orb.y-20,12*flicker,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#ffd07c';ctx.beginPath();ctx.arc(orb.x-2,orb.y-23,8*flicker,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fffce3';ctx.beginPath();ctx.arc(orb.x-3,orb.y-24,3.7,0,Math.PI*2);ctx.fill();
 for(let i=0;i<(low?2:4);i++){
  const th=i*2.399+now*.002;ctx.globalAlpha=.65;ctx.fillStyle=i%2?'#ffc05e':'#fff3bf';
  ctx.fillRect(orb.x+Math.cos(th)*17,orb.y-22+Math.sin(th)*12,2.5,2.5);
 }ctx.restore();
}
function r64DrawMarks(now,low){
 const marked=enemies.filter(e=>(e.ember||0)>0||(e.veilExposure||0)>0);
 const cap=low?14:36;
 for(const e of marked.slice(0,cap)){
  const burning=e.ember>0,veil=e.veilExposure>0,tw=now*.0015+(e.id||0)*.17;
  ctx.save();ctx.translate(e.x,e.y-48);
  if(burning){
   const pulse=.65+.16*Math.sin(tw*3.5);
   r64Glow(0,0,24,'#ff8b35',pulse*.45);
   r64Ellipse(13+Math.sin(tw)*2,7.2,'#ffba63',1.8,pulse,tw*.28);
   ctx.strokeStyle='#ffe2a3';ctx.lineWidth=2;ctx.globalAlpha*=pulse;
   ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(7,0);ctx.lineTo(0,9);ctx.lineTo(-7,0);ctx.closePath();ctx.stroke();
   r64Line(-3,-12,-3,-19,'#f5a350',1.2,.6);
  }
  if(veil){
   ctx.save();ctx.translate(0,burning?-15:0);ctx.globalAlpha=.7+.22*Math.sin(tw*2.8);
   r64Sigil(14,'#d7a6ff',tw*.18,5,.75);
   ctx.strokeStyle='#f0ceff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,4,Math.PI*.3,Math.PI*1.6);ctx.stroke();ctx.restore();
  }
  ctx.restore();
 }
}
const r64PriorCast=fireSkill;
fireSkill=function(id,manual=false){
 const ok=r64PriorCast(id,manual);
 if(ok&&['holy_spear','thunderstorm','flame_nova','curse','grace','shadow','arcane_focus','fury','demons'].includes(id)){
  if(R64FX.casts.length>=30)R64FX.casts.shift();
  R64FX.casts.push({id,x:player.x,y:player.y,born:r61WallMs(),life:id==='holy_spear'||id==='thunderstorm'?.67:.48});
 }
 return ok;
};
// R61 draw bridge retained; only its ART rendering is replaced. State is never mutated.
r61DrawSpellReactions=function(){
 const now=r61WallMs(),low=V42.quality==='low'||V42.reduced;
 r61VisualEffects=r61VisualEffects.filter(e=>now-e.born<e.life*1000);
 const events=low?r61VisualEffects.slice(-34):r61VisualEffects.slice(-80);
 for(const e of events){
  const t=r64Clamp((now-e.born)/(Math.max(.01,e.life)*1000));const a=Math.pow(1-t,.72);
  if(e.kind==='veillink'&&e.x2!==undefined){r64Ribbon(e,t,a,'veillink');continue;}
  if(e.kind==='fireflight'&&e.x2!==undefined){ // Comets indicate the next target; actual orbs remain simulated separately.
   ctx.save();ctx.globalAlpha=.35*a;r64Ribbon(e,t,a,'fireflight');ctx.restore();continue;
  }
  if(['spearline','fireline','lightning'].includes(e.kind)&&e.x2!==undefined){r64Ribbon(e,t,a,e.kind==='lightning'?'veillink':'fireflight');continue;}
  if(e.kind==='veilburst'){r64Veil(e,t,a);continue;}
  if(e.kind==='emberburst'||e.kind==='embermark'||e.kind==='fireburst'){
   r64Ember(e,t,a,e.kind==='embermark');continue;
  }
  if(e.kind==='gracewave'){r64Grace(e,t,a);continue;}
  if(e.kind==='electric'){r64Veil(e,t,.50*a);continue;}
  if(e.kind==='spear'){r64Grace(e,t,.65*a);continue;}
 }
 for(const orb of (low?fireOrbs.slice(0,5):fireOrbs.slice(0,12)))r64DrawEmberOrb(orb,now,low);
 r64DrawMarks(now,low);
 R64FX.casts=R64FX.casts.filter(e=>now-e.born<e.life*1000);
 for(const e of R64FX.casts.slice(low?-5:-14))r64Cast(e,r64Clamp((now-e.born)/(e.life*1000)),Math.pow(1-r64Clamp((now-e.born)/(e.life*1000)),.8));
};
// Clear temporary visual-only events whenever the isolated laboratory resets.
const r64OldClear=clearSkillReactions;
clearSkillReactions=function(){r64OldClear();R64FX.casts.length=0;};
window.VEIL_VFX_DEBUG={version:64,draw:r61DrawSpellReactions,events:()=>r61VisualEffects,casts:()=>R64FX.casts};

const V49_SHORT={grace:'GRAÇA CELESTIAL',fury:'FÚRIA',curse:'MALDIÇÃO',demons:'LEGIÃO',shadow:'GOLPE SOMBRIO',flame_nova:'NOVA DE CHAMAS',thunderstorm:'BRASAS',holy_spear:'CEIFA DO VÉU',arcane_focus:'FOCO ARCANO'};
const v49Skillbar=updateSkillbar;
updateSkillbar=function(){v49Skillbar();for(const [i,b]of [...$('#skills-bar').children].entries()){const id=g.equippedSkills[i];if(!id)continue;const s=D.skills.find(x=>x.id===id);if(!s)continue;b.style.setProperty('--skill-color',V42.palettes[id]);b.dataset.skill=id;const current=cd[id]||0,den=Math.max(current,V49.castCooldown[id]||s.cooldown);b.style.setProperty('--cooldown-angle',(current/den*360)+'deg');const unlocked=g.knightLevel>=s.unlock,cost=r67SkillStats(id).mana,enoughMana=player.mp>=cost;b.classList.toggle('ready',current<=0&&unlocked&&enoughMana);b.classList.toggle('no-mana',unlocked&&current<=0&&!enoughMana);let name=b.querySelector('.skill-name');if(!name){name=document.createElement('span');name.className='skill-name';b.append(name);}name.textContent=V49_SHORT[id];b.title=s.name+' · Tecla '+(i+1)+(!unlocked?' · Nível '+s.unlock:current>0?' · '+fmtTime(current)+' de recarga':!enoughMana?' · Mana insuficiente':' · Pronta');}};
const v49SoulsPanel=soulsPanel;
soulsPanel=function(){const html=v49SoulsPanel();if(!g.worldPrestiges)return html;const temp=document.createElement('div');temp.innerHTML=html;const groups={summon:[],research:[],echoes:[],runes:[],sources:[]};let group='summon';for(const node of [...temp.childNodes]){if(node.nodeType===1&&node.tagName==='H3'){const t=node.textContent;if(t.includes('Pesquisa Proibida'))group='research';else if(t.includes('Bestiário'))group='echoes';else if(t.includes('Runas Místicas'))group='runes';else if(t.includes('Como obter'))group='sources';}groups[group].push(node.outerHTML||node.textContent);}if(!['summon','echoes','research'].includes(V49.soulView))V49.soulView='summon';const tabs=[['summon','Invocação'],['echoes','Ecos'],['research','Pesquisa']];return '<div class="collection-nav" role="tablist" aria-label="Santuário">'+tabs.map(([id,label])=>`<button role="tab" aria-selected="${V49.soulView===id}" data-soul-view="${id}" class="${V49.soulView===id?'active':''}">${label}</button>`).join('')+'</div><section class="collection-section">'+groups[V49.soulView].join('')+(V49.soulView==='summon'?'<details class="r66-explainer"><summary>Como obter Almas</summary><div class="hint">A partir do Mundo II, inimigos, chefes e baús podem conceder Almas. Use-as para invocar Ecos; as Runas possuem sua própria aba.</div></details>':'')+'</section>';};
document.addEventListener('click',e=>{const button=e.target.closest('[data-soul-view]');if(button){V49.soulView=button.dataset.soulView;renderPanel();}});
const v49RenderPanel=renderPanel;
renderPanel=function(preserve=false){v49RenderPanel(preserve);if(!playing)return;const panel=$('#panel-body');for(const b of panel.querySelectorAll('.gamebtn')){const text=b.textContent;b.classList.toggle('unavailable',/INSUFICIENTE|REQUER|BLOQUEAD/.test(text));}for(const card of panel.querySelectorAll('.skill-roster-card')){const id=card.querySelector('[data-action="skillFocus"]')?.dataset.id;if(id){card.style.setProperty('--skill-color',V42.palettes[id]);const skill=D.skills.find(s=>s.id===id),desc=card.querySelector('.description');if(desc&&skill&&g.knightLevel>=skill.unlock)desc.hidden=true;}}const tip=panel.querySelector('.skill-loadout-grid')?.previousElementSibling;if(tip?.classList.contains('notice-inline'))tip.textContent='Equipe até 4 habilidades. Use as teclas 1–4 ou ative AUTO. Selecione uma habilidade para explorar seus talentos.';};
// A restrained illuminated crest uses the existing knight portrait.
const start=document.querySelector('.start-mark');if(start){start.className='start-emblem';start.innerHTML=vIcon(9,100);}
document.querySelector('.pretitle').textContent='O JURAMENTO SOBREVIVE À RUÍNA';
document.querySelector('.start-screen p').textContent='Erga sua lâmina. Atravesse os cinco véus. Transforme cada queda em poder.';
document.querySelector('.start-foot').textContent='COMBATE AUTOMÁTICO · COLEÇÕES PERMANENTES · CINCO MUNDOS';
document.querySelector('.footbar span:first-child').innerHTML='<b>VEILFALL</b> · R64 · POLIMENTO VISUAL';
const v49Settings=settingsModal;settingsModal=function(){v49Settings();const eyebrow=document.querySelector('.settings-modal .eyebrow');if(eyebrow)eyebrow.textContent='VEILFALL · R64';};
window.VEIL_POLISH_DEBUG={walkFrame:vWalkFrame,walkFPS:WALK_FPS,impact:v49Impact,version:51};
// New knight atlas: 48 poses with isolated borders. Impact starts on its actual event.
vKnight=function(){const p=V42.player,castAge=V42.now-p.cast,attackAge=V42.now-p.attack,hurtAge=V42.now-p.hurt,reviveAge=V42.now-p.revive;let row=0,col=Math.floor(V42.now*2)%4;
 if(reviveAge<.6){row=5;col=Math.min(3,Math.floor(reviveAge/.15));}
 else if(hurtAge<.16){row=4;col=hurtAge<.08?0:3;}
 else if(castAge<.4){row=3;const magic=['flame_nova','thunderstorm','arcane_focus'].includes(p.skill);col=(magic?4:0)+(castAge<.12?2:3);}
 else if(attackAge<.32){row=attackNum%2?2:5;col=attackAge<.11?6:7;}
 else if(!retreating&&timers.attack>0&&timers.attack<.24){const e=getClosest();if(e&&Math.hypot(e.x-player.x,e.y-player.y)<BALANCE.attackRange){row=attackNum%2?5:2;col=timers.attack<.13?5:4;}else if(p.lookY<-.1)col+=4;}
 else if(p.move){const step=Math.floor(V42.now*(retreating?4.8:3.8))%4;if(Math.abs(p.dx)>.8*Math.abs(p.dy)){row=2;col=step;}else{row=1;col=(p.dy<0?4:0)+step;}}
 else if(p.lookY<-.1)col+=4;
 vShadow(player.x,player.y,24);vFrame('knight',row,col,player.x,player.y,98,p.face<0);
 if(attackAge<.16){ctx.save();ctx.translate(player.x,player.y-22);ctx.globalAlpha=(1-attackAge/.16)*.8;ctx.strokeStyle=p.crit?'#fff2c8':'#e8c589';ctx.lineWidth=p.crit?3:2;ctx.beginPath();ctx.arc(0,0,43,p.face<0?2.5:-1.4,p.face<0?4.5:.6);ctx.stroke();ctx.restore();}
 if(retreating){ctx.fillStyle='#e4cda2';ctx.textAlign='center';ctx.font='9px system-ui';ctx.fillText('RECUANDO',player.x,player.y-88);}
};
