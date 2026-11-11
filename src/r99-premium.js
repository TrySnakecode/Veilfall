/* VEILFALL R99 — presentation-only art direction.
   No game state, RNG, damage, loot, cooldowns, save format or progression touched. */
'use strict';
document.body.classList.add('r99');
document.title='VEILFALL · R99 · O VÉU DESPERTA';
const R99={ambient:null,world:-1,glow:new Map(),last:0,passes:0};
function r99Intensity(){return V42.reduced||V42.quality==='low'||!g?.particles?0:UX66.prefs.intensity==='quiet'?0:UX66.prefs.intensity==='balanced'?1:2;}
function r99BuildAmbient(){
 const world=Math.max(0,Math.min(4,Number(g?.difficulty)||0));
 const themes=[['#ff934e','#ab80f0','#769acf'],['#e6ac61','#a5bfd9','#9a9ed7'],['#ad6ac9','#d96685','#6986cf'],['#62b5a4','#b0baf4','#a2d0db'],['#dc6483','#9c70e1','#d7a172']];
 const theme=themes[world];
 const c=document.createElement('canvas');c.width=560;c.height=345;const a=c.getContext('2d');
 // Light shafts and atmospheric depth are drawn once, never during the combat loop.
 for(const [x,y,r,color,opacity] of [[38,75,190,theme[0],.14],[515,70,225,theme[1],.09],[274,198,260,theme[2],.065]]){
  const p=a.createRadialGradient(x,y,3,x,y,r);p.addColorStop(0,color);p.addColorStop(.34,color+'44');p.addColorStop(1,'#00000000');a.globalAlpha=opacity*5;a.fillStyle=p;a.fillRect(x-r,y-r,r*2,r*2);
 }
 a.globalAlpha=1;
 // Cathedral-stained light from overhead openings. No geometry occludes targets.
 for(let i=0;i<5;i++){
  const x=65+i*106;
  const grad=a.createLinearGradient(x,0,x+48,260);grad.addColorStop(0,i%2?'#a1a1ee27':'#f3a87223');grad.addColorStop(1,'#00000000');
  a.fillStyle=grad;a.beginPath();a.moveTo(x,0);a.lineTo(x+26,0);a.lineTo(x+78,260);a.lineTo(x-30,260);a.closePath();a.fill();
 }
 R99.ambient=c;R99.world=world;
}
function r99Ambient(c,time,detail){
 if(!R99.ambient||R99.world!==Math.max(0,Math.min(4,Number(g?.difficulty)||0)))r99BuildAmbient();
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=detail===1?.47:.70;
 c.drawImage(R99.ambient,0,0,1120,690);c.restore();
 if(!detail)return;
 c.save();c.globalCompositeOperation='screen';
 const count=detail===1?13:24;
 for(let i=0;i<count;i++){
  const phase=i*2.399963,dx=(i*137.28+time*(2+i%4))%1150-15,dy=(i*87.39+Math.sin(phase+time*.4)*20+690)%690;
  const alpha=(.10+.09*(1+Math.sin(time*1.6+phase)))*(.5+.5*Math.cos(phase));
  c.globalAlpha=alpha;c.fillStyle=i%5===0?'#f6a76f':'#b7bded';
  c.beginPath();c.arc(dx,dy,(i%4===0?2:1),0,Math.PI*2);c.fill();
 }
 c.restore();
}
const r99OldEnvironment=vEnvironment;
vEnvironment=function(){r99OldEnvironment();r99Ambient(ctx,V42.now,r99Intensity());};
function r99ImpactArt(e,detail){
 if(!detail||e.layer==='hit')return;
 const key=e.type.replace('cast_','');
 if(!Object.prototype.hasOwnProperty.call(R66_TONES,key))return;
 const age=(V42.now-e.born)/e.life;
 if(!(age>=0&&age<.54))return;
 const strength=Math.pow(1-age/.54,2),radius=Math.max(8,Math.min(165,e.r||46));
 const tone=R66_TONES[key],color=tone[1],pulse=radius*(.14+age*1.27);
 ctx.save();ctx.translate(e.x,e.y);ctx.globalCompositeOperation='screen';ctx.globalAlpha=strength*(detail===2?.38:.24);
 ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,4-3*age);ctx.beginPath();ctx.ellipse(0,-8,pulse,pulse*.53,0,0,Math.PI*2);ctx.stroke();
 if(detail===2&&age<.34){
  ctx.lineCap='round';ctx.lineWidth=1.5;
  for(let i=0;i<7;i++){
   const a=i*Math.PI*2/7+(e.born%1)*.57,len=radius*(.18+age*.9),x=Math.cos(a)*len,y=Math.sin(a)*len*.65-8;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*radius*.09*(1-age),y+Math.sin(a)*radius*.08*(1-age));ctx.stroke();
  }
 }
 ctx.restore();
}
const r99OldEffects=vEffects;
vEffects=function(){r99OldEffects();const detail=r99Intensity();if(!detail)return;const cap=detail===1?4:8;
 let done=0;for(let i=V42.impacts.length-1;i>=0&&done<cap;i--){const e=V42.impacts[i];if(!e.type?.startsWith('cast_'))continue;r99ImpactArt(e,detail);done++;}
};
function r99RewardKind(message){const m=String(message);if(/ÚNICO|MÍTICO|LENDÁRIO|CONJUNTO COMPLETO|PRESTÍGIO DE MUNDO/i.test(m))return 'legendary';if(/PRESTÍGIO|CHEFE|GUARDIÃO|DESBLOQUE|RUN[AÁ]|CONQUISTA|BAÚ/i.test(m))return 'milestone';return 'routine';}
const r99OldAlert=alertGame;
alertGame=function(message,kind='normal'){
 const result=r99OldAlert(message,kind),toast=document.querySelector('#toast-root .toast:last-child');
 if(toast){const level=r99RewardKind(message);toast.classList.add('r99-reward-'+level);toast.setAttribute('data-tier',level);}
 return result;
};
// Feedback on successful actions without animation on passive updates/rendering.
document.addEventListener('click',event=>{
 const btn=event.target.closest('.gamebtn,.primary-action,.r73-menu-button,.nav-btn');
 if(!btn||btn.disabled||V42.reduced)return;
 btn.classList.remove('r99-click');void btn.offsetWidth;btn.classList.add('r99-click');
},{passive:true});
const r99PriorSettings=settingsModal;
settingsModal=function(){r99PriorSettings();const label=document.querySelector('.settings-modal .eyebrow');if(label)label.textContent='VEILFALL · R99';};
const r99Footer=document.querySelector('.footbar span:first-child');
if(r99Footer)r99Footer.innerHTML='✦ <b>VEILFALL</b> · R99 · O VÉU DESPERTA';
const r99MenuFooter=document.querySelector('.r73-menu-footer span:first-child');
if(r99MenuFooter)r99MenuFooter.textContent='VEILFALL · R99';
// Animation is cosmetic; combat settings already provide Quiet/Balanced/Epic.
window.VEIL_R99_DEBUG={renderVersion:99,ambient:()=>Boolean(R99.ambient),rewardKind:r99RewardKind,intensity:r99Intensity};
