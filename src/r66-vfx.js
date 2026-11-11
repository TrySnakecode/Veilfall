/* R66 visual renderer. It consumes existing events; it never rolls damage, advances
   time, spawns enemies, spends mana or changes the radius of a gameplay effect. */
'use strict';
const FX66={glows:new Map(),budget:24,drawn:0,version:66};
const R66_TONES={grace:['#e7b852','#fff1c2'],shadow:['#8260d6','#eee1ff'],fury:['#d44755','#ffd7a2'],curse:['#b151cb','#f9d2ff'],demons:['#77b6a9','#d6fff1'],flame_nova:['#f36a26','#fff0b3'],thunderstorm:['#ef7f30','#fff1ce'],holy_spear:['#a06ce7','#f6dbff'],arcane_focus:['#739fe8','#e0f7ff']};
function r66FXConfig(low=V42.quality==='low',reduced=V42.reduced){const mode=UX66.prefs.intensity;return {low,reduced,detail:low||reduced||!g.particles||mode==='quiet'?0:mode==='balanced'?1:2,gain:mode==='quiet'?.58:mode==='balanced'?.82:1};}
function r66FXReset(low=V42.quality==='low'){FX66.drawn=0;FX66.budget=low?7:UX66.prefs.intensity==='quiet'?9:UX66.prefs.intensity==='balanced'?15:23;}
function r66FXGlow(c,x,y,r,color,alpha){if(r<=0||alpha<=0)return;let img=FX66.glows.get(color);if(!img){img=document.createElement('canvas');img.width=img.height=64;const b=img.getContext('2d'),grad=b.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,color);grad.addColorStop(.22,color+'c0');grad.addColorStop(.58,color+'40');grad.addColorStop(1,color+'00');b.fillStyle=grad;b.fillRect(0,0,64,64);FX66.glows.set(color,img);}c.save();c.globalAlpha*=alpha;c.globalCompositeOperation='screen';c.drawImage(img,x-r,y-r,r*2,r*2);c.restore();}
function r66FXLine(c,x,y,tx,ty,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();}
function r66FXRing(c,r,color,width=1,start=0,end=Math.PI*2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(0,0,Math.max(.1,r),start,end);c.stroke();}
function r66FXDiamond(c,x,y,s,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y-s);c.lineTo(x+s*.43,y);c.lineTo(x,y+s);c.lineTo(x-s*.43,y);c.closePath();c.fill();}
function r66FXSeal(c,r,color,t,count=6){r66FXRing(c,r,color,1);for(let i=0;i<count;i++){const a=i*Math.PI*2/count+t,x=Math.cos(a),y=Math.sin(a);r66FXLine(c,x*r*.83,y*r*.83,x*r*1.08,y*r*1.08,color,1.8);r66FXDiamond(c,x*r,y*r,3,color);}}
function r66FXSparks(c,t,r,color,count,style='radial'){
 const u=1-Math.pow(1-t,3);c.fillStyle=color;c.strokeStyle=color;c.lineCap='round';
 for(let i=0;i<count;i++){const angle=i*2.399963+.31,d=r*(.24+u*(.52+.22*Math.sin(i*3.7))),x=Math.cos(angle)*d,y=Math.sin(angle)*d*.65-(style==='rise'?u*r*.4:0),size=(1-t)*(2+(i%3));if(style==='shards'){c.save();c.translate(x,y);c.rotate(angle);r66FXDiamond(c,0,0,size*2.3,color);c.restore();}else r66FXLine(c,x,y,x-Math.cos(angle)*size*3,y-Math.sin(angle)*size*2,color,Math.max(.7,size*.5));}
}
function r66FXCrescent(c,r,angle,color,core,width){c.save();c.rotate(angle);c.fillStyle=color;c.beginPath();c.moveTo(-r*.91,r*.22);c.bezierCurveTo(-r*.48,-r*.91,r*.56,-r*.94,r,r*.08);c.bezierCurveTo(r*.46,-r*.54,-r*.43,-r*.57,-r*.91,r*.22);c.closePath();c.fill();c.strokeStyle=core;c.lineWidth=width;c.beginPath();c.moveTo(-r*.91,r*.22);c.bezierCurveTo(-r*.48,-r*.91,r*.56,-r*.94,r,r*.08);c.stroke();c.restore();}
function r66FXSpell(c,id,x,y,r,t,alpha=1,options={}){
 if(t<0||t>=1||!Number.isFinite(x+y+r+t)||FX66.drawn++>=FX66.budget)return;
 const cfg=r66FXConfig(options.low,options.reduced),tone=R66_TONES[id]||R66_TONES.arcane_focus,[color,core]=tone,u=1-Math.pow(1-t,3),fade=Math.pow(1-t,1.15),spin=cfg.reduced?0:t;
 r=Math.max(12,Math.min(260,r||70));c.save();c.translate(x,y);c.globalAlpha*=alpha*fade*cfg.gain;c.lineCap='round';c.lineJoin='round';
 if(cfg.detail)r66FXGlow(c,0,-8,r*.9,color,.48*(1-t));
 if(id==='shadow'){
  for(let i=0;i<3;i++){c.save();c.translate((i-1)*r*.25,(i-1)*r*.08);c.rotate(-.8);c.globalAlpha*=1-i*.16;const reach=r*(.52+.36*u);c.fillStyle=color;c.beginPath();c.moveTo(-reach,-3);c.quadraticCurveTo(-reach*.1,-16,reach,0);c.quadraticCurveTo(-reach*.1,8,-reach,-3);c.fill();r66FXLine(c,-reach,-3,reach,0,core,1.8);if(cfg.detail)r66FXGlow(c,reach*.6,0,17,color,.65);c.restore();}
  if(cfg.detail)r66FXSparks(c,t,r,core,7,'shards');
 }else if(id==='holy_spear'){
  const count=cfg.detail===2?3:2;
  for(let i=0;i<count;i++){const angle=(id==='shadow'?-.7:-.3)+i*2.1+spin*1.8,rr=r*(.46+.48*u)*(1-i*.10);c.save();c.globalAlpha*=1-i*.19;r66FXCrescent(c,rr,angle,color,core,1.8);c.restore();}
  if(cfg.detail){c.save();c.scale(1,.57);c.globalAlpha*=.60;r66FXSeal(c,r*.71,core,-spin,7);c.restore();r66FXSparks(c,t,r,core,cfg.detail===2?13:6,'shards');}
 }else if(id==='flame_nova'||id==='thunderstorm'){
  const ember=id==='thunderstorm',rr=r*(.18+.78*u),count=ember?(cfg.detail?5:3):cfg.detail===2?12:cfg.detail?9:6;
  if(cfg.detail){r66FXGlow(c,0,-3,r*.62,color,.58);r66FXGlow(c,0,-5,r*.31,core,.6*(1-t));}
  c.save();c.scale(1,.64);c.globalAlpha*=ember?.45:.8;r66FXRing(c,rr,color,Math.max(1,9*(1-t)));r66FXRing(c,rr*.94,core,2);c.restore();
  for(let i=0;i<count;i++){const a=i*Math.PI*2/count+(ember?spin*2.4:0),d=r*(ember?.12+.52*u:.16+.65*u),length=r*(ember?.22+.25*(1-t):.11+.22*(1-t));c.save();c.translate(Math.cos(a)*d,Math.sin(a)*d*.64);c.rotate(a);c.fillStyle=i%3?color:core;c.beginPath();c.moveTo(-length*.45,-3);c.bezierCurveTo(0,-length*.43,length*.56,-length*.25,length,0);c.quadraticCurveTo(length*.1,length*.27,-length*.45,3);c.closePath();c.fill();c.fillStyle=core;c.beginPath();c.moveTo(-length*.22,0);c.quadraticCurveTo(length*.1,-length*.13,length*.7,0);c.quadraticCurveTo(length*.05,length*.12,-length*.22,0);c.fill();if(cfg.detail)r66FXGlow(c,length*.4,0,length*.65,core,.65);c.restore();}
  if(t<.22){c.save();c.globalAlpha*=(1-t/.22)*.8;r66FXDiamond(c,0,-5,14*(1-t/.22),core);c.restore();}
  if(cfg.detail)r66FXSparks(c,t,r*1.08,'#ffc985',cfg.detail===2?18:8,'rise');
 }else if(id==='grace'){
  c.save();c.scale(1,.57);r66FXRing(c,r*(.22+.76*u),color,4*(1-t)+1);r66FXRing(c,r*(.2+.70*u),core,1.7);if(cfg.detail)r66FXSeal(c,r*.6,core,0,8);c.restore();
  const h=r*(.5+.4*u);r66FXLine(c,0,8,0,-h,core,3*(1-t)+1);r66FXLine(c,-h*.24,-h*.64,h*.24,-h*.64,core,2);
  for(const side of [-1,1]){c.save();c.scale(side,1);for(let j=0;j<(cfg.detail?5:3);j++){const xx=16+j*9,yy=-28-j*7-u*8;c.strokeStyle=j%2?core:color;c.lineWidth=3;c.beginPath();c.moveTo(7,-17);c.quadraticCurveTo(xx,-8,xx+9,yy);c.stroke();}c.restore();}
  if(cfg.detail)r66FXSparks(c,t,r*.8,core,8,'rise');
 }else if(id==='curse'){
  c.save();c.rotate(spin*.4);r66FXSeal(c,r*(.70+.10*u),color,0,6);r66FXRing(c,r*.63,core,1.5);c.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI*4/6-Math.PI/2;(i?c.lineTo:c.moveTo).call(c,Math.cos(a)*r*.57,Math.sin(a)*r*.57);}c.stroke();c.restore();
  r66FXDiamond(c,0,-5,18*(.8+.2*u),core);r66FXLine(c,-12,-5,12,-5,color,3);if(cfg.detail)r66FXSparks(c,t,r,color,10,'shards');
 }else if(id==='fury'){
  for(const a of [-.55,.55])r66FXCrescent(c,r*(.48+.39*u),a+spin*.25,color,core,2);
  c.save();c.scale(1,.5);r66FXRing(c,r*.60,color,2);c.restore();
  for(const side of [-1,1])r66FXLine(c,side*10,12,side*(24+u*15),-36-u*15,core,3*(1-t)+1);
  if(cfg.detail)r66FXSparks(c,t,r,core,cfg.detail===2?13:6,'shards');
 }else if(id==='demons'){
  c.save();c.scale(1,.43);r66FXSeal(c,r*.83,color,spin*.2,4);r66FXRing(c,r*.70,core,1);c.restore();
  for(let i=0;i<(cfg.detail?4:3);i++){const a=(i/4)*Math.PI*2-.7,xx=Math.cos(a)*r*.58,yy=Math.sin(a)*r*.23-13-u*14;c.save();c.translate(xx,yy);c.strokeStyle=color;c.fillStyle=color+'50';c.lineWidth=1.6;c.beginPath();c.moveTo(-11,13);c.lineTo(-8,-13);c.quadraticCurveTo(0,-29,8,-13);c.lineTo(11,13);c.lineTo(0,6);c.closePath();c.fill();c.stroke();r66FXLine(c,-4,-13,-1,-12,core,2);r66FXLine(c,1,-12,4,-13,core,2);r66FXLine(c,15,10,15,-30,core,1.4);c.restore();}
 }else{
  const rr=r*(.61+.15*u);c.save();c.scale(1,.64);r66FXRing(c,rr,color,2);r66FXRing(c,rr*.72,core,1);c.restore();
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3+spin*.8,x=Math.cos(a)*rr,y=Math.sin(a)*rr*.58-12;r66FXDiamond(c,x,y,10*(1-t)+5,core);r66FXLine(c,x,y,0,-12,color,1);if(cfg.detail)r66FXGlow(c,x,y,20,color,.4);}
  if(cfg.detail)r66FXSparks(c,t,r,core,7,'rise');
 }
 c.restore();
}
const r66OldImpact=v49Impact;
v49Impact=function(e){const id=e.type.replace('cast_','');if(e.layer==='hit'||e.type==='shadow_path'||!R66_TONES[id])return r66OldImpact(e);r66FXSpell(ctx,id,e.x,e.y-15,e.r,(V42.now-e.born)/e.life,1);};
r64Veil=function(e,t,a){r66FXSpell(ctx,'holy_spear',e.x,e.y-18,e.r||90,t,a);};
r64Ember=function(e,t,a,mark=false){r66FXSpell(ctx,'thunderstorm',e.x,e.y-18,mark?26:e.r||70,t,a*(mark?.7:1));};
r64Grace=function(e,t,a){r66FXSpell(ctx,'grace',e.x,e.y-8,e.r||105,t,a*.8);};
// Casting and impact use different shapes, so a dense pack still has a readable origin.
r64Cast=function(e,t,a){const cfg=r66FXConfig(),[color,core]=R66_TONES[e.id]||R66_TONES.grace;if(FX66.drawn++>=FX66.budget)return;ctx.save();ctx.translate(e.x,e.y);ctx.scale(1,.42);ctx.globalAlpha*=a*cfg.gain*.7;r66FXRing(ctx,30+22*(1-Math.pow(1-t,3)),color,2);if(cfg.detail)r66FXSeal(ctx,37,core,cfg.reduced?0:t*.3,6);ctx.restore();};
const r66OriginalEffects=vEffects;
vEffects=function(){r66FXReset();r66OriginalEffects();
 // Restore only the danger contour above spell art. Never obscure the countdown.
 for(const w of bossWarnings){ctx.save();ctx.translate(w.x,w.y);ctx.globalAlpha=.94;ctx.setLineDash([7,5]);r66FXRing(ctx,w.radius,'#11131c',5);r66FXRing(ctx,w.radius,w.color,2.5);ctx.setLineDash([]);const p=clamp(w.time/w.delay,0,1);r66FXRing(ctx,w.radius,'#fff0d5',3,-Math.PI/2,-Math.PI/2+p*Math.PI*2);ctx.font='700 13px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#0b1018';const label=Math.max(0,w.delay-w.time).toFixed(1)+' s';ctx.strokeText(label,0,-w.radius-8);ctx.fillStyle='#fff2dc';ctx.fillText(label,0,-w.radius-8);ctx.restore();}
};
// Raids retain the authoritative simulator's timestamps and target coordinates.
const r66RaidEffect=r52DrawEffect;
r52DrawEffect=function(c,e,ms,low,reduced){if(e.source==='basic')return r66RaidEffect(c,e,ms,low,reduced);const age=(ms-e.t)/1000;if(age<0||age>.85)return;const p=r52Point(e.region),id={cleave:'shadow',shatter:'fury',pierce:'holy_spear',bleed:'fury',hex:'curse',detonate:'flame_nova',rally:'grace',conduit:'arcane_focus',focus:'arcane_focus'}[e.source];if(!id)return;const source=e.source==='rally'?{x:298,y:476}:p;const r=e.source==='detonate'?110:e.source==='shatter'?88:74;r66FXSpell(c,id,source.x,source.y,r,age/.85,e.cast?1:.65,{low,reduced});};
const r66RaidPaint=r52PaintArena;r52PaintArena=function(s,t){r66FXReset();return r66RaidPaint(s,t);};
window.VEIL_VFX_DEBUG={version:66,draw:r61DrawSpellReactions,spell:r66FXSpell,reset:r66FXReset,events:()=>r61VisualEffects,casts:()=>R64FX.casts,stats:FX66};
