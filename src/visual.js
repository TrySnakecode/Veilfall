
/* R42 — presentation only. No damage, reward or progression formulas live here. */
'use strict';
const V42 = {
  now:0,last:0,quality:'high',shake:true,numbers:true,reduced:false,hitStop:0,shakeUntil:0,
  player:{face:1,dx:0,dy:0,move:false,attack:-10,cast:-10,skill:null,hurt:-10,revive:-10},
  deaths:[],particles:[],freeParticles:[],impacts:[],loot:[],links:[],frames:[],renderMs:[],
  images:{},ready:false,detailOpen:new Set(),pendingSource:null,attackTarget:null,
  palettes:{grace:'#ffe5a0',shadow:'#b192ff',fury:'#ff7164',curse:'#bd8af2',holy_spear:'#c58bf7',demons:'#e8c574',flame_nova:'#ff9b49',thunderstorm:'#ffb052',arcane_focus:'#a3adff'},
  limits:{low:{particles:36,impacts:30,numbers:14,corpses:12},medium:{particles:90,impacts:60,numbers:30,corpses:24},high:{particles:180,impacts:90,numbers:44,corpses:36}}
};
try { Object.assign(V42,JSON.parse(localStorage.getItem('veilfall_visual_r42')||'{}')); } catch {}
if(!['low','medium','high'].includes(V42.quality))V42.quality='high';
V42.reduced=V42.reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const VASSET = window.VEIL_VISUAL_ASSETS || {
  knight:'assets/characters/knight.png',enemies:'assets/characters/enemies.png',bosses:'assets/characters/bosses.png',icons:'assets/ui/icons.png',companions:'assets/ui/companions.png',relics1:'assets/ui/relics1.png',relics2:'assets/ui/relics2.png'
};
const VICON={grace:0,shadow:1,fury:2,curse:3,holy_spear:3,demons:5,flame_nova:6,thunderstorm:6,arcane_focus:8,knight:9,gold:10,relic:11,wood:12,stone:13,iron:14,banknotes:15,Arma:16,Capacete:17,Peitoral:18,Aura:19,Anel:20,scrolls:21,chest:22,gear:23,heroes:24,pets:32,village:40,artifacts:48,world:56,souls:57,runes:58,sets:59,stats:60,skills:0};
for(const [key,url] of Object.entries(VASSET)){const im=new Image();im.src=url;V42.images[key]=im;}
const vReady=Promise.all(Object.values(V42.images).map(im=>im.decode().catch(()=>{}))).then(()=>{V42.ready=Object.values(V42.images).every(im=>im.naturalWidth>0);document.body.classList.toggle('assets-ready',V42.ready);});
function vIcon(index,size=40,atlas='icons'){index=Number.isFinite(index)?index:VICON[index]??48;return `<span class="pixel-icon" aria-hidden="true" style="--ix:${index%8};--iy:${Math.floor(index/8)};--icon-size:${size}px;${atlas==='icons'?'':`--icon-atlas:var(--atlas-${atlas})`}"></span>`;}
for(const key of ['icons','companions','relics1','relics2'])document.documentElement.style.setProperty('--atlas-'+key,`url("${new URL(VASSET[key],document.baseURI).href}")`);
document.documentElement.style.setProperty('--icon-atlas','var(--atlas-icons)');
function vLimits(){const l=V42.limits[V42.quality];return enemies.length>150?{particles:Math.min(l.particles,70),impacts:Math.min(l.impacts,42),numbers:Math.min(l.numbers,22),corpses:Math.min(l.corpses,18)}:l;}
function vSavePrefs(){try{localStorage.setItem('veilfall_visual_r42',JSON.stringify({quality:V42.quality,shake:V42.shake,numbers:V42.numbers,reduced:V42.reduced}));}catch{}}
let visualRandomSeed=0x41ce1e57;
function vRandom(){visualRandomSeed^=visualRandomSeed<<13;visualRandomSeed^=visualRandomSeed>>>17;visualRandomSeed^=visualRandomSeed<<5;return (visualRandomSeed>>>0)/4294967296;}
function vParticle(x,y,color,n=5,force=70){if(!g.particles||V42.reduced)return;const limit=vLimits().particles;for(let i=0;i<n&&V42.particles.length<limit;i++){const p=V42.freeParticles.pop()||{};const a=vRandom()*Math.PI*2,s=force*(.4+vRandom());Object.assign(p,{x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-25,born:V42.now,life:.22+vRandom()*.38,color,size:1+Math.floor(vRandom()*3)});V42.particles.push(p);}}
function vImpact(type,x,y,r=36,extra={}){const limit=vLimits().impacts;if(V42.impacts.length>=limit)V42.impacts.shift();V42.impacts.push({type,x,y,r,born:V42.now,life:type==='holy_spear'?.55:.36,...extra});}
function vShake(power=2){if(V42.shake&&!V42.reduced){V42.shakePower=Math.min(4,power);V42.shakeUntil=V42.now+.12;}}
function vRow(e){return e.kind==='boss'?['carrasco','profanador','arauto'].indexOf(e.archetype):{skeleton:0,cultist:1,wraith:2,beast:3,elite:4,mimic:5}[e.kind]??0;}
// Recorte NÃO DESTRUTIVO: cada célula é copiada para Canvas apenas em memória.
// Remove os fragmentos desconectados deixados pela montagem do atlas original,
// sem regravar nem alterar sprites, imagens embutidas ou arquivos de arte.
function vCleanFrame(im,row,col,rows){
 const width=Math.floor(im.naturalWidth/8),height=Math.floor(im.naturalHeight/rows);
 const cv=document.createElement('canvas');cv.width=width;cv.height=height;
 const c=cv.getContext('2d',{willReadFrequently:true});
 c.drawImage(im,col*width,row*height,width,height,0,0,width,height);
 const data=c.getImageData(0,0,width,height),px=data.data,total=width*height;
 const seen=new Uint8Array(total),queue=new Int32Array(total);
 let largest=[],bestSize=0;
 for(let i=0;i<total;i++){
  if(seen[i]||px[4*i+3]<=24)continue;
  let head=0,tail=1;queue[0]=i;seen[i]=1;
  while(head<tail){
   const p=queue[head++],x=p%width,y=(p/width)|0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;
    const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;
    const j=ny*width+nx;
    if(!seen[j]&&px[4*j+3]>24){seen[j]=1;queue[tail++]=j;}
   }
  }
  if(tail>bestSize){bestSize=tail;largest=Array.from(queue.subarray(0,tail));}
 }
 if(bestSize<80)return cv;
 const keep=new Uint8Array(total);
 for(const j of largest)keep[j]=1;
 // Conserve pixels de antialias adjacentes à silhueta, sem outras partículas.
 for(let i=0;i<total;i++)if(!keep[i]&&px[4*i+3]>0&&px[4*i+3]<=24){
  const x=i%width,y=(i/width)|0;
  outer:for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<width&&ny<height&&keep[ny*width+nx]===1){keep[i]=2;break outer;}
  }
 }
 for(let i=0;i<total;i++)if(!keep[i])px[4*i+3]=0;
 c.putImageData(data,0,0);return cv;
}
const vFrames={knight:[],enemies:[],bosses:[]};
function vFrame(sheet,row,col,x,y,size,flip=false,alpha=1){
 const im=V42.images[sheet];if(!im?.naturalWidth)return;
 const rows=sheet==='knight'?6:sheet==='bosses'?3:6;
 row=clamp(Math.floor(row),0,rows-1);col=clamp(Math.floor(col),0,7);
 const idx=row*8+col;
 let clean=vFrames[sheet][idx];
 if(!clean){clean=vCleanFrame(im,row,col,rows);vFrames[sheet][idx]=clean;}
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);
 ctx.drawImage(clean,-Math.round(size/2),-Math.round(size*.82),size,size);ctx.restore();
}
function vShadow(x,y,w){ctx.fillStyle='#050a1290';ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y)+3,w,w*.32,0,0,Math.PI*2);ctx.fill();}
function vHealth(x,y,w,fraction,color){ctx.fillStyle='#070c15';ctx.fillRect(Math.round(x-w/2)-1,Math.round(y)-1,w+2,5);ctx.fillStyle=color;ctx.fillRect(Math.round(x-w/2),Math.round(y),Math.ceil(w*clamp(fraction,0,1)),3);}
function vEnemy(e){const boss=e.kind==='boss',sheet=boss?'bosses':'enemies',size=boss?156:e.kind==='elite'?108:e.kind==='beast'?86:78;const st=e._v||{},t=V42.now+((e.id||0)%17)*.23; /* visual clock independent of game speed */let col=0;
  const warning=bossWarnings.find(w=>w.bossId===e.id);
  if(warning)col=3;else if(V42.now-(st.attack??-10)<.32)col=boss?(st.attackKind==='sigil'?5:4):5;
  else if(e.hit>0&&V42.now-(st.hit??-10)<.18)col=6;
  else if(st.move)col=vWalkFrame(e.kind,t);
  else col=0;
  vShadow(e.x,e.y,boss?40:size*.24);
  if(boss&&e.archetype==='arauto'){ctx.save();ctx.strokeStyle=e.bossPhase===3?'#f08cba':e.bossPhase===2?'#b9a2ee':'#e5c77e';ctx.lineWidth=2;ctx.globalAlpha=.6;for(let j=0;j<e.bossPhase;j++){ctx.beginPath();ctx.ellipse(e.x,e.y-73,43+j*8,22+j*5,0,0,Math.PI*2);ctx.stroke();}ctx.restore();}
  vFrame(sheet,Math.max(0,vRow(e)),col,e.x,e.y,size,(st.face||1)<0,e.kind==='wraith'?.84:1);
  if(e.hit>0&&V42.now-(st.hit??-10)<.1){ctx.fillStyle='#fff0c5';ctx.fillRect(Math.round(e.x)-2,Math.round(e.y-size*.5),4,4);}
  if(e.curse){ctx.strokeStyle='#be91e6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x-3,e.y-59);ctx.lineTo(e.x+3,e.y-59);ctx.moveTo(e.x,e.y-64);ctx.lineTo(e.x,e.y-53);ctx.stroke();}
  if(e.veilExposure>0){ctx.save();ctx.strokeStyle='#cb92f6';ctx.shadowColor='#b060ec';ctx.shadowBlur=10;ctx.lineWidth=2;ctx.globalAlpha=.66+.23*Math.sin(t*4);ctx.beginPath();ctx.moveTo(e.x-11,e.y-73);ctx.lineTo(e.x,e.y-86);ctx.lineTo(e.x+11,e.y-73);ctx.stroke();ctx.restore();}
  if(e.ember>0){ctx.save();ctx.strokeStyle='#ffaf4c';ctx.shadowColor='#ff802d';ctx.shadowBlur=10;ctx.lineWidth=2.4;ctx.globalAlpha=.65+.24*Math.sin(t*6);ctx.beginPath();ctx.arc(e.x,e.y-71,9,t,t+Math.PI*1.7);ctx.stroke();ctx.restore();}
  if(e.burning>0&&g.particles){ctx.fillStyle='#ffae5b';for(let j=0;j<3;j++)ctx.fillRect(e.x-12+j*10,e.y-20-Math.sin(t*8+j)*7,3,7);}
  if(e.slow>0){ctx.strokeStyle='#a2e8ff';ctx.beginPath();ctx.moveTo(e.x-12,e.y+3);ctx.lineTo(e.x,e.y-7);ctx.lineTo(e.x+12,e.y+3);ctx.stroke();}
  if(boss||e.kind==='elite'||e.hit>0)vHealth(e.x,e.y-size*.75,boss?100:34,e.hp.div(e.max).num(1),boss?'#efad80':'#bc677d');
  if(boss&&e.vulnerableTimer>0){ctx.strokeStyle='#c8f4e2';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,47,-Math.PI/2,-Math.PI/2+Math.PI*2*e.vulnerableTimer/1.8);ctx.stroke();ctx.fillStyle='#d6ffed';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('VULNERÁVEL',e.x,e.y-size*.82-10);}
}
function vKnight(){const p=V42.player;let row=0,col=Math.floor(V42.now*5)%4;const castAge=V42.now-p.cast,attackAge=V42.now-p.attack,hurtAge=V42.now-p.hurt,reviveAge=V42.now-p.revive;
  if(reviveAge<.45){row=7;col=6+Math.min(1,Math.floor(reviveAge/.23));}
  else if(hurtAge<.14){row=7;col=Math.min(1,Math.floor(hurtAge/.07));}
  else if(castAge<.48){row=['flame_nova','thunderstorm','arcane_focus'].includes(p.skill)?6:['curse','holy_spear','demons'].includes(p.skill)?5:4;col=Math.min(7,3+Math.floor(castAge*10));}
  else if(attackAge<.30){row=4;col=([0,1,2][Math.min(2,Math.floor(attackAge*10))]);}
  else if(!retreating&&timers.attack>0&&timers.attack<.16&&getClosest()&&Math.hypot(getClosest().x-player.x,getClosest().y-player.y)<BALANCE.attackRange){row=4;col=0;}
  else if(p.move){row=p.dy<-.6*Math.abs(p.dx)?2:Math.abs(p.dx)>.8*Math.abs(p.dy)?3:1;col=Math.floor(V42.now*(retreating?8:7))%8;}
  else if(p.lookY<-.1)col+=4;
  vShadow(player.x,player.y,24);vFrame('knight',row,col,player.x,player.y,98,p.face<0);
  if(attackAge<.14){ctx.save();ctx.globalAlpha=(1-attackAge/.14)*.75;ctx.strokeStyle=p.crit?'#fff3c5':'#edc574';ctx.lineWidth=p.crit?4:2;ctx.beginPath();ctx.arc(player.x,player.y-24,47,p.face<0?2.5:-1.4,p.face<0?4.5:.6);ctx.stroke();ctx.restore();}
  if(retreating){ctx.fillStyle='#f7c98f';ctx.textAlign='center';ctx.font='bold 10px system-ui';ctx.fillText('RECUANDO',player.x,player.y-88);}
}
function vBuffs(){const px=player.x,py=player.y;for(const id of ['grace','fury','curse','demons','arcane_focus'])if(active[id]>0){const c=V42.palettes[id];ctx.save();ctx.strokeStyle=c;ctx.globalAlpha=.42;ctx.lineWidth=1.5;const r={grace:34,fury:29,curse:42,demons:48,arcane_focus:39}[id];ctx.beginPath();ctx.ellipse(px,py+1,r,r*.36,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<3;i++){const a=V42.now*.8+i*Math.PI*2/3;ctx.fillStyle=c;ctx.fillRect(px+Math.cos(a)*r-2,py+Math.sin(a)*r*.36-2,4,4);}ctx.restore();}}
// Telegraph geometry intentionally matches the Euclidean circle used by damage checks.
drawBossWarnings=function(){for(const w of bossWarnings){const p=clamp(w.time/w.delay,0,1);ctx.save();ctx.translate(w.x,w.y);ctx.fillStyle=w.color;ctx.globalAlpha=.10+.12*p;ctx.beginPath();ctx.arc(0,0,w.radius,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;ctx.strokeStyle=w.color;ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(0,0,w.radius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#ffe4d1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,w.radius,-Math.PI/2,-Math.PI/2+p*Math.PI*2);ctx.stroke();ctx.fillStyle='#fff2dd';ctx.textAlign='center';ctx.font='bold 12px system-ui';ctx.fillText((w.delay-w.time).toFixed(1)+' s',0,-w.radius-8);ctx.restore();}};
function vBolt(x1,y1,x2,y2,seed){ctx.beginPath();ctx.moveTo(x1,y1);for(let i=1;i<8;i++){const p=i/8,j=Math.sin(seed+i*6.1)*12;ctx.lineTo(x1+(x2-x1)*p+j,y1+(y2-y1)*p-j);}ctx.lineTo(x2,y2);ctx.stroke();}
function vEffects(){for(const e of V42.impacts){const p=(V42.now-e.born)/e.life;if(p<0||p>1)continue;const color=V42.palettes[e.type]||e.color||'#e6cfa4';ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=1-p;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;const r=e.r;
  if(e.type==='thunderstorm'){
   ctx.strokeStyle='#ffb465';ctx.lineWidth=2.7;ctx.shadowColor='#ff7d24';ctx.shadowBlur=12;
   for(let j=0;j<7;j++){const a=j*Math.PI*2/7+p*2.2;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.25,Math.sin(a)*r*.25);ctx.lineTo(Math.cos(a+.12)*r*(1.1+p*.4),Math.sin(a+.12)*r*(1.1+p*.4));ctx.stroke();}
   ctx.beginPath();ctx.arc(0,0,r*(.5+p*.6),0,Math.PI*2);ctx.stroke();
  }
  else if(e.type==='holy_spear'){
   ctx.strokeStyle='#c993f4';ctx.lineWidth=3;ctx.shadowColor='#8e42d4';ctx.shadowBlur=13;
   for(let j=0;j<5;j++){const a=j*Math.PI*2/5+p;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.45,Math.sin(a)*r*.45);ctx.lineTo(Math.cos(a+1.2)*r*(.7+p*.4),Math.sin(a+1.2)*r*(.7+p*.4));ctx.stroke();}
   ctx.beginPath();ctx.arc(0,0,r*(.68+p*.5),0,Math.PI*2);ctx.stroke();
  }
  else if(e.type==='flame_nova'||e.type==='fury'){for(let i=0;i<12;i++){const a=i*Math.PI/6,rr=r*(.65+.35*p),x=Math.cos(a)*rr,y=Math.sin(a)*rr;ctx.beginPath();ctx.moveTo(x-6,y+4);ctx.lineTo(x+Math.sin(i)*3,y-17*(1-p));ctx.lineTo(x+6,y+4);ctx.fill();}ctx.beginPath();ctx.arc(0,0,r*(.8+.2*p),0,Math.PI*2);ctx.stroke();}
  else if(e.type==='curse'){ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI*4/5-Math.PI/2,x=Math.cos(a)*r*(.75+.2*p),y=Math.sin(a)*r*(.75+.2*p);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  else if(e.type==='shadow'){ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-r*.4+i*7,-r*.5);ctx.lineTo(r*.4+i*7,r*.3);ctx.stroke();}}
  else if(e.type==='grace'||e.type==='slash'){ctx.lineWidth=e.crit?4:2;ctx.beginPath();ctx.arc(0,0,r*(.7+p*.3),-2.1+p*.5,1.3+p*.5);ctx.stroke();}
  else if(e.type==='demons'){for(let i=0;i<4;i++){const x=(i-1.5)*18;ctx.fillRect(x,-55-p*18,2,38);ctx.beginPath();ctx.moveTo(x,-55-p*18);ctx.lineTo(x+12,-51-p*18);ctx.lineTo(x,-43-p*18);ctx.fill();}}
  else if(e.type==='arcane_focus'){for(let i=0;i<4;i++){const a=i*Math.PI/2+V42.now,x=Math.cos(a)*r*.45,y=Math.sin(a)*r*.3-25;ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+4,y);ctx.lineTo(x,y+8);ctx.lineTo(x-4,y);ctx.closePath();ctx.stroke();}}
  else if(e.type==='level'||e.type==='revive'){ctx.beginPath();ctx.ellipse(0,0,r*(.5+p*.5),r*.3*(.5+p*.5),0,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++)ctx.fillRect(Math.cos(i)*r*.5,-20-p*65+Math.sin(i)*10,2,8);}
  else {ctx.beginPath();ctx.arc(0,0,r*(.7+p*.3),0,Math.PI*2);ctx.stroke();}
  ctx.restore();}
  for(const e of V42.links){const p=(V42.now-e.born)/.35;ctx.save();ctx.globalAlpha=(1-p)*.8;ctx.strokeStyle=e.color;ctx.lineWidth=2;vBolt(e.x,e.y-20,e.tx,e.ty-20,e.born);ctx.restore();}
  for(const p of V42.particles){const a=(V42.now-p.born)/p.life;ctx.globalAlpha=1-a;ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size);}ctx.globalAlpha=1;
  for(const e of V42.loot){const p=(V42.now-e.born)/e.life,c=RCOL[e.rarity]||'#dfc782';ctx.save();ctx.globalAlpha=clamp((1-p)*2,0,1);ctx.fillStyle=c;if(e.rarity>0){ctx.globalAlpha*=.24;ctx.fillRect(e.x-3,e.y-65,6,65);ctx.globalAlpha=clamp((1-p)*2,0,1);}ctx.translate(e.x,e.y-8-Math.sin(p*Math.PI)*8);ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.restore();if(e.rarity>=3){ctx.save();ctx.globalAlpha=clamp((1-p)*2,0,1);ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillStyle=c;ctx.fillText(RARITY[e.rarity].toUpperCase(),e.x,e.y-75);ctx.restore();}}
}
const arenaCache=document.createElement('canvas');arenaCache.width=1120;arenaCache.height=690;let arenaCached=false;
function vEnvironment(){if(bg.naturalWidth&&!arenaCached){const b=arenaCache.getContext('2d');b.imageSmoothingEnabled=false;b.drawImage(bg,0,0,1120,690);b.fillStyle='#08122224';b.fillRect(0,0,1120,690);arenaCached=true;}if(arenaCached)ctx.drawImage(arenaCache,0,0);else{ctx.fillStyle='#101923';ctx.fillRect(0,0,1120,690);}if(!g.particles||V42.quality==='low')return;
  const lamps=[[452,82],[665,82],[48,242],[1070,242],[149,504],[753,548]];
  for(let i=0;i<lamps.length;i++){const [x,y]=lamps[i];ctx.globalAlpha=.5+Math.sin(V42.now*7+i)*.15;ctx.fillStyle='#ffbc66';ctx.fillRect(x-2,y-4-Math.floor(Math.sin(V42.now*11+i)*2),4,7);ctx.fillStyle='#ffe6b0';ctx.fillRect(x,y-4,2,4);}ctx.globalAlpha=1;
  ctx.fillStyle='#b2c4de';ctx.globalAlpha=.16;for(let i=0;i<18;i++){const x=(i*197+V42.now*(2+i%3))%1120,y=(i*83+Math.sin(i+V42.now*.3)*9)%690;ctx.fillRect(x,y,1,1);}ctx.globalAlpha=1;
}
function vAdvance(realDelta){if(paused)return;V42.now+=realDelta;for(let i=V42.particles.length-1;i>=0;i--){const p=V42.particles[i];if(V42.now-p.born>p.life){V42.freeParticles.push(p);V42.particles.splice(i,1);}else{p.x+=p.vx*realDelta;p.y+=p.vy*realDelta;p.vy+=70*realDelta;}}
  for(const key of ['impacts','deaths','loot'])for(let i=V42[key].length-1;i>=0;i--)if(V42.now-V42[key][i].born>V42[key][i].life)V42[key].splice(i,1);
  for(let i=V42.links.length-1;i>=0;i--)if(V42.now-V42.links[i].born>.35)V42.links.splice(i,1);
}
drawArena=function(){const start=performance.now(),dt=Math.min(.06,(start-(V42.last||start))/1000);V42.last=start;vAdvance(dt);ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,1120,690);vEnvironment();ctx.save();if(V42.shakeUntil>V42.now){ctx.translate(Math.sin(V42.now*95)*V42.shakePower,Math.cos(V42.now*117)*V42.shakePower*.5);}ctx.translate(560,345);ctx.scale(CAMERA_ZOOM,CAMERA_ZOOM);ctx.translate(-560,-345);
  drawBossWarnings();vBuffs();
  for(const e of V42.deaths){const age=V42.now-e.born,alpha=clamp((e.life-age)*2,0,1);if(e.player)vFrame('knight',4,4+Math.min(3,Math.floor(age*5)),e.x,e.y,98,e.face<0,alpha);else vFrame(e.boss?'bosses':'enemies',e.row,age<.12?6:7,e.x,e.y,e.size,e.face<0,alpha);}
  const order=enemies.slice();order.push({kind:'player',y:player.y});order.sort((a,b)=>a.y-b.y);for(const e of order){if(e.x<-100||e.x>1220||e.y<-120||e.y>850)continue;if(e.kind==='player')vKnight();else vEnemy(e);}
  vEffects();if(V42.numbers){let shown=0;const labels=[];for(let i=floating.length-1;i>=0&&shown<vLimits().numbers;i--){const f=floating[i];if(!f.big&&enemies.length>150&&i%3)continue;if(labels.some(p=>Math.abs(f.x-p.x)<48&&Math.abs(f.y-p.y)<17))continue;labels.push(f);shown++;ctx.globalAlpha=clamp(f.life,0,1);ctx.font=(f.big?'bold 16px':'12px')+' system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#070912';ctx.strokeText(f.txt,f.x,f.y-12);ctx.fillStyle=f.color;ctx.fillText(f.txt,f.x,f.y-12);}ctx.globalAlpha=1;}
  ctx.restore();if(paused){ctx.fillStyle='#070e18b0';ctx.fillRect(0,0,1120,690);ctx.textAlign='center';ctx.fillStyle='#ead7ac';ctx.font='32px Georgia';ctx.fillText('VIGÍLIA SUSPENSA',560,330);ctx.font='14px system-ui';ctx.fillText('ESPAÇO PARA CONTINUAR',560,364);}
  V42.renderMs.push(performance.now()-start);if(V42.renderMs.length>240)V42.renderMs.shift();
};
// Hooks observe the real accepted actions. Rejected actions never generate an impact.
const vOriginal={hurt,killEnemy,blast,fireSkill,basicAttack,contactEnemy,bossDamageToKnight,updateCombat,handleNewGear,initialise,bossBlastFX};
hurt=function(e,amount,crit=false,color,spread=true,source=null){if(e&&enemies.includes(e)){const st=e._v||(e._v={});st.hit=V42.now;const id=source||V42.pendingSource||'slash';vImpact(id,e.x,e.y,source==='thunderstorm'?28:21,{crit});if(crit){if(!source&&!V42.pendingSource)V42.player.crit=true;vParticle(e.x,e.y-30,color||'#f5dca7',4);if(e.kind==='boss')vShake(1.8);} // R63: não gera mais raios elétricos.
 }return vOriginal.hurt(e,amount,crit,color,spread,source);};
killEnemy=function(e){if(enemies.includes(e)){const count=vLimits().corpses;if(V42.deaths.length>=count)V42.deaths.shift();V42.deaths.push({x:e.x,y:e.y,row:Math.max(0,vRow(e)),boss:e.kind==='boss',size:e.kind==='boss'?156:e.kind==='elite'?108:78,face:e._v?.face||1,born:V42.now,life:e.kind==='boss'?1.6:.65});vParticle(e.x,e.y-20,e.kind==='wraith'?'#b69fe7':e.kind==='beast'?'#d27285':'#d7cba8',e.kind==='boss'?20:4);if(e.kind==='boss')vShake(3);if(e.curse&&skillBonus('curse','curse_spread')>0)for(const other of enemies.filter(x=>x!==e&&Math.hypot(x.x-e.x,x.y-e.y)<130).slice(0,Math.floor(skillBonus('curse','curse_spread')*2)))V42.links.push({x:e.x,y:e.y,tx:other.x,ty:other.y,born:V42.now,color:'#bd8af2'});}const level=g.knightLevel,result=vOriginal.killEnemy(e);if(g.knightLevel>level){vImpact('level',player.x,player.y,64,{life:.8});vParticle(player.x,player.y-30,'#ffe5ac',12);}return result;};
blast=function(x,y,r,amount,color,type='magic',source=null){vImpact(source||V42.pendingSource||type,x,y,r,{color});return vOriginal.blast(x,y,r,amount,color,type,source);};
fireSkill=function(id,manual=false){if(manual&&(cd[id]||0)>0){alertGame('Recarga: '+fmtTime(cd[id]));return false;}V42.pendingSource=id;V42.chainFrom=null;let success;try{success=vOriginal.fireSkill(id,manual);}finally{V42.pendingSource=null;V42.chainFrom=null;}if(success){V42.player.cast=V42.now;V42.player.skill=id;if(['demons','arcane_focus','fury'].includes(id))vImpact(id,player.x,player.y,70,{life:.65});if(['flame_nova','holy_spear'].includes(id))vShake(2);}else if(manual){document.querySelector(`[data-action="skillCast"][data-id="${id}"]`)?.animate([{filter:'brightness(1)'},{filter:'brightness(2)'},{filter:'brightness(1)'}],{duration:180});}return success;};
basicAttack=function(){const e=getClosest(player.x,player.y,g.attackFocus==='boss');if(e&&Math.hypot(e.x-player.x,e.y-player.y)<=BALANCE.attackRange){V42.player.attack=V42.now;V42.player.crit=false;V42.player.face=e.x<player.x?-1:1;}return vOriginal.basicAttack();};
contactEnemy=function(e){const result=vOriginal.contactEnemy(e);if(result){const st=e._v||(e._v={});st.attack=V42.now;V42.player.hurt=V42.now;vParticle(player.x,player.y-26,'#df8490',3);}return result;};
bossDamageToKnight=function(e,m=1){const n=vOriginal.bossDamageToKnight(e,m);if(n>0){V42.player.hurt=V42.now;vShake(2);}return n;};
bossBlastFX=function(x,y,r,color){vImpact('boss',x,y,r,{color,life:.5});vParticle(x,y,color,12,130);vShake(2.5);};
updateCombat=function(dt){const px=player.x,py=player.y,deaths=g.deaths||0;for(const e of enemies){const st=e._v||(e._v={face:1});st.x=e.x;st.y=e.y;}
  const warnings=bossWarnings.map(w=>({id:w.bossId,kind:w.kind}));const result=vOriginal.updateCombat(dt);const p=V42.player;p.dx=player.x-px;p.dy=player.y-py;p.move=Math.abs(p.dx)+Math.abs(p.dy)>.05;if(p.move)p.lookY=p.dy;if(Math.abs(p.dx)>.05)p.face=p.dx<0?-1:1;
  for(const e of enemies){const st=e._v||(e._v={face:1});st.move=Math.abs(e.x-st.x)+Math.abs(e.y-st.y)>.05;st.face=player.x<e.x?-1:1;const executed=warnings.find(w=>w.id===e.id&&!bossWarnings.some(w2=>w2.bossId===e.id));if(executed){st.attack=V42.now;st.attackKind=executed.kind;}}
  if((g.deaths||0)>deaths){V42.deaths.push({player:true,x:px,y:py,face:p.face,born:V42.now,life:.85});p.revive=V42.now;vImpact('revive',player.x,player.y,72,{life:1});}
  if(V42.links.length>50)V42.links.splice(0,V42.links.length-50);return result;
};
handleNewGear=function(item){const result=vOriginal.handleNewGear(item);V42.loot.push({x:player.x+16,y:player.y+10,rarity:item.rarity,born:V42.now,life:item.rarity>=3?2.7:1.1});if(V42.loot.length>16)V42.loot.shift();return result;};
initialise=function(){for(const k of ['deaths','impacts','loot','links'])V42[k].length=0;V42.player.revive=V42.now;return vOriginal.initialise();};

// Accessible illustrated UI. Existing data-action handlers remain the source of truth.
const oldEntry=entry;
entry=function(icon,name,subtitle,description,actions,accent=''){
 let idx=48,atlas='icons',extra='';const skill=D.skills.find(s=>s.name===name);
 if(skill)idx=VICON[skill.id];
 else if(tab==='heroes'){const m=(actions||'').match(/data-id="(h\d+)"/),h=D.heroes.find(h=>h.id===m?.[1]);idx=Math.max(0,D.heroes.indexOf(h));atlas='companions';}
 else if(tab==='pets'){idx=32+Math.max(0,D.pets.findIndex(p=>p.name===name));atlas='companions';}
 else if(tab==='artifacts'){const a=D.artifacts.findIndex(a=>a.name===name);if(a>=0){idx=a%64;atlas=a<64?'relics1':'relics2';}}
 else if(tab==='gear')idx=VICON[gearCategory];
 else if(tab==='scrolls'){idx=21;const scroll=D.scrolls.find(s=>s.name===name),hero=D.heroes.findIndex(h=>h.id===scroll?.hero_id);if(hero>=0)extra='<span class="scroll-seal">'+vIcon(hero,18,'companions')+'</span>';}
 else if(tab==='sets'){idx=42+Math.max(0,D.sets.findIndex(s=>s.name===name));atlas='relics2';}
 else if(tab==='world')idx=56;
 else if(tab==='souls')idx=57;
 else if(tab==='village'){const b=D.buildings.find(b=>b.name===name);idx=b?40+D.buildings.indexOf(b):name.startsWith('Baú')?22:/Madeira/.test(name)?12:/Pedra/.test(name)?13:14;}
 const key=tab+':'+name;const details=description?`<details class="entry-details" data-detail="${esc(key)}" ${V42.detailOpen.has(key)?'open':''}><summary>Ver efeitos e detalhes</summary><div class="description">${esc(description)}</div></details>`:'';
 return `<article class="entry"><div class="entry-top"><div class="entry-icon ${accent}">${vIcon(idx,40,atlas)}${extra}</div><div class="entry-main"><div class="entry-name" title="${esc(name)}">${esc(name)}</div><div class="entry-sub">${esc(subtitle)}</div></div></div>${details}${actions?`<div class="entry-action">${actions}</div>`:''}</article>`;
};
document.addEventListener('toggle',e=>{const k=e.target.dataset?.detail;if(k){if(e.target.open)V42.detailOpen.add(k);else V42.detailOpen.delete(k);}},true);
const oldKnightPanel=knightPanel;
knightPanel=function(){const html=oldKnightPanel();return `<div class="knight-card">${vIcon(9,76)}<div><small>JURAMENTO CELESTIAL</small><h3>Cavaleiro Celestial</h3><span>Nível ${g.knightLevel} · ${retreating?'Recuperando vida':'Em vigília'}</span></div></div><div class="stat-grid featured">${statTile('Físico',damage().fmt())}${statTile('Fé',faithDamage().fmt())}${statTile('Magia',magicDamage().fmt())}${statTile('Vida',fmt(maxHealth()))}</div><div class="button-row">${button('EQUIPAMENTOS','tab','gear','','muted')}${button('HABILIDADES','tab','skills','','muted')}</div><details class="entry-details knight-details" data-detail="knight:full" ${V42.detailOpen.has('knight:full')?'open':''}><summary>Atributos, suporte e prestígio</summary>${html}</details>`;};
const oldVillagePanel=villagePanel;
villagePanel=function(){return `<div class="village-diorama">${D.buildings.map((b,i)=>{const level=g.buildings[b.id]||1,tier=Math.min(3,Math.floor((level-1)/5));return `<button class="village-tile tier-${tier}" data-action="building" data-id="${b.id}" title="Melhorar ${b.name}: ${buildingCost(b.id)} de cada material"><span class="village-art">${vIcon(40+i,70)}${tier?'<span class="building-pennant">'+['','Ⅰ','Ⅱ','Ⅲ'][tier]+'</span>':''}</span><b>${b.name}</b><small>Nível ${level}</small></button>`;}).join('')}</div>`+oldVillagePanel();};
const oldWorldPanel=worldPanel;
worldPanel=function(){return `<div class="world-route">${DIFF.map((d,i)=>`<button class="world-stop ${i===g.difficulty?'current':''}" data-action="difficulty" data-id="${i}" ${i>=g.unlocked?'disabled':''} title="${esc(d)}">${vIcon([55,46,57,7,59][i],33)}<b>${['I','II','III','IV','V'][i]}</b><small>${i===g.difficulty?'AQUI':i<g.unlocked?'ABERTO':'SELADO'}</small></button>`).join('')}</div>`+oldWorldPanel();};
const oldRenderPanel=renderPanel;
renderPanel=function(preserve=false){oldRenderPanel(preserve);if(!playing)return;const p=$('#panel-body');p.dataset.tab=tab;const cards=p.querySelectorAll('.skill-roster-card');for(const card of cards){const id=card.querySelector('[data-action="skillFocus"]')?.dataset.id;const icon=card.querySelector('.entry-icon');if(icon&&id)icon.innerHTML=vIcon(VICON[id]);}p.querySelectorAll('.skill-tree-node').forEach((node,i)=>{const el=node.querySelector('.entry-icon');if(el)el.innerHTML=vIcon(i===17?62:VICON[skillFocus]??0,32);});p.querySelectorAll('.gear-category-tab').forEach((el,i)=>{const span=el.querySelector('span');if(span)span.innerHTML=vIcon(16+i,26);});};
renderNav=function(){const n=$('#nav');n.innerHTML=NAV.map(([id,ico,label])=>`<button class="nav-btn ${tab===id?'active':''}" data-action="tab" data-id="${id}" title="${label}" aria-label="${label}" ${tab===id?'aria-current="page"':''}>${vIcon(VICON[id],30)}<span>${label}</span></button>`).join('');$('#panel-title').textContent=NAV.find(x=>x[0]===tab)?.[2]||'Cavaleiro';};
const oldSelectTab=selectTab;selectTab=function(id){oldSelectTab(id);if(!V42.reduced)$('#panel-body').animate([{opacity:.45,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:130});};
const oldSkillbar=updateSkillbar;updateSkillbar=function(){oldSkillbar();$('#skills-bar').querySelectorAll('.skill-btn').forEach((b,i)=>{const id=g.equippedSkills[i],symbol=b.querySelector('.symbol');if(symbol&&id)symbol.innerHTML=vIcon(VICON[id],42);if(id)b.setAttribute('aria-label',D.skills.find(s=>s.id===id)?.name||id);});};
const oldHeader=updateHeader;updateHeader=function(){oldHeader();if(!playing)return;const exp=document.getElementById('xp-fill');if(exp)exp.style.width=clamp(xp.div(nextXP()).num(1)*100,0,100)+'%';const buffs=document.getElementById('buff-status');if(buffs)buffs.innerHTML=Object.entries(active).filter(([id,t])=>t>0&&VICON[id]!=null).map(([id,t])=>`<span title="${esc(D.skills.find(s=>s.id===id)?.name||id)}">${vIcon(VICON[id],18)}${Math.ceil(t)}s</span>`).join('');};
settingsModal=function(){const root=$('#modal-root');root.classList.remove('hidden');root.innerHTML=`<div class="modal settings-modal" role="dialog" aria-modal="true" aria-label="Configurações"><small class="eyebrow">VEILFALL · R47</small><h2>Sua vigília</h2><p>As opções visuais não alteram o combate ou as recompensas.</p><h3>Qualidade gráfica</h3><div class="quality-choices">${[['low','Baixa'],['medium','Média'],['high','Alta']].map(([k,n])=>`<button class="gamebtn ${V42.quality===k?'green':'muted'}" data-visual="quality" data-value="${k}" aria-pressed="${V42.quality===k}">${n}</button>`).join('')}</div><div class="settings-toggles">${[['shake','Tremor de câmera'],['numbers','Números de dano'],['reduced','Movimento reduzido']].map(([k,n])=>`<label>${n}<input type="checkbox" data-visual="${k}" ${V42[k]?'checked':''}></label>`).join('')}</div><div class="button-row">${button('SOM '+(g.sound?'LIGADO':'DESLIGADO'),'sound')}${button('PARTÍCULAS '+(g.particles?'LIGADAS':'DESLIGADAS'),'particles')}</div><div class="button-row">${button('RECUO AUTOMÁTICO: '+(g.autoRetreat?'ATIVADO':'DESATIVADO'),'retreatToggle')}</div><h3>Campanha</h3><p>O save fica neste navegador. Exporte uma cópia antes de trocar de pasta, navegador ou computador.</p><div class="button-row">${button('SALVAR AGORA','save')}${button('ESPAÇOS 1–3','slots')}<button class="gamebtn muted" data-visual="export">EXPORTAR SAVE</button><label class="gamebtn muted file-label">IMPORTAR SAVE<input id="import-save" type="file" accept=".json,application/json" hidden></label></div><div class="button-row"><button class="gamebtn" id="cancel-modal">VOLTAR AO JOGO</button></div></div>`;$('#cancel-modal').onclick=()=>root.classList.add('hidden');$('#import-save').onchange=vImportSave;};
function vCampaignRecord(){return {...g,slot:g.slot,savedAt:Date.now(),gold:gold.save(),relics:relics.save(),xp:xp.save(),totalRelics:totalRelics.save(),goldEarned:goldEarned.save(),backgroundPendingSeconds:Math.max(0,simAccumulator)};}
function vValidateSave(data){
 const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 if(!record(data)||data.version!==1||!Number.isSafeInteger(data.stage)||data.stage<1||!Array.isArray(data.gold)||data.gold.length!==2||!data.gold.every(Number.isFinite)||!record(data.heroLevels))throw Error('Formato de campanha inválido.');
 const schema=fresh();
 for(const [key,value]of Object.entries(schema))if(key in data){const incoming=data[key];if(Array.isArray(value)?!Array.isArray(incoming):record(value)?!record(incoming):typeof incoming!==typeof value)throw Error('Campo inválido: '+key);}
 const finite=(x,depth=0)=>{if(depth>16)throw Error('Estrutura de campanha inválida.');if(typeof x==='number'&&!Number.isFinite(x))throw Error('Valor numérico inválido.');if(x&&typeof x==='object')for(const v of Object.values(x))finite(v,depth+1);};finite(data);
 return data;
}
function vApplyImportedSave(data){
 if(testMode)return false;
 try{vValidateSave(data);}catch{return false;}
 const slot=g.slot,wasPaused=paused,previous=JSON.stringify({...g,gold:gold.save(),relics:relics.save(),xp:xp.save(),totalRelics:totalRelics.save(),goldEarned:goldEarned.save(),savedAt:Date.now()}),read=safeStorage.getItem;
 let candidate=JSON.stringify(data),ok=false;
 // Exercise the original migration/loading path before touching persistent storage.
 safeStorage.getItem=k=>k===BKEY+slot?candidate:read.call(safeStorage,k);
 try{ok=load(slot);if(!ok){candidate=previous;load(slot);paused=wasPaused;}}finally{safeStorage.getItem=read;}
 if(!ok)return false;
 const persisted=save(slot,true);
 alertGame(persisted?'Campanha importada.':'Campanha carregada; exporte uma cópia, pois o navegador bloqueou o salvamento.');
 return true;
}
function vImportSave(e){const f=e.target.files[0];if(!f)return;if(testMode){alertGame('Saia do teste antes de importar.');return;}if(f.size>10*1024*1024){alertGame('Arquivo de campanha grande demais.');return;}f.text().then(text=>{let data;try{data=vValidateSave(JSON.parse(text));}catch{alertGame('Arquivo de campanha inválido.');return;}showModal('Importar campanha',`Substituir o espaço ${g.slot} pela campanha da fase ${data.stage}?`,()=>{if(!vApplyImportedSave(data))alertGame('Não foi possível importar. Sua campanha foi preservada.');});}).catch(()=>alertGame('Não foi possível ler o arquivo.'));}
document.addEventListener('click',e=>{const b=e.target.closest('[data-visual]');if(!b)return;const k=b.dataset.visual;if(k==='quality'){V42.quality=b.dataset.value;vSavePrefs();settingsModal();}else if(k==='export'){if(testMode){alertGame('Saia do teste para exportar sua campanha.');return;}save(g.slot,true);const data=JSON.stringify(vCampaignRecord());const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='VEILFALL-campanha-'+g.slot+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}});
document.addEventListener('change',e=>{const k=e.target.dataset?.visual;if(['shake','numbers','reduced'].includes(k)){V42[k]=e.target.checked;vSavePrefs();document.body.classList.toggle('reduce-motion',V42.reduced);}});
const oldAction=onAction;onAction=function(action,id,arg){oldAction(action,id,arg);if(['sound','particles','retreatToggle'].includes(action)&&!$('#modal-root').classList.contains('hidden'))settingsModal();};
document.querySelector('.portrait').innerHTML=vIcon(9,47);document.querySelector('.charbars').insertAdjacentHTML('beforeend','<div class="bar-track xp"><div id="xp-fill"></div></div>');document.querySelector('.hud-char').insertAdjacentHTML('afterend','<div id="buff-status" class="buff-status"></div>');document.body.classList.toggle('reduce-motion',V42.reduced);
// Defer tools/testing commands to explicit QA use; never auto-enable tests in a campaign.
window.VEIL_VISUAL_DEBUG={state:V42,ready:()=>vReady,quality:q=>{if(V42.limits[q])V42.quality=q;},draw:()=>drawArena(),metrics:()=>({renderMs:[...V42.renderMs],particles:V42.particles.length,deaths:V42.deaths.length,impacts:V42.impacts.length}),frame:vFrame};

