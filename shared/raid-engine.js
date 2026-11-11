/* R52 deterministic raid rules. This exact module runs in browser and server. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.VeilRaid=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION=1,DURATION=30000,TICK=50;
const HERO_IDS=Array.from({length:32},(_,i)=>'h'+String(i+1).padStart(2,'0'));
const TECHNIQUES=[
 {id:'cleave',name:'Fenda Estelar',family:'Ruptura',cooldown:5000,formula:'3,6 × Poder × Escala',description:'Um corte direto e rápido. Bom dano constante contra regiões expostas.',color:'#f5b879'},
 {id:'shatter',name:'Martelo do Eclipse',family:'Ruptura',cooldown:8000,formula:'4 × Poder × Escala; ×2,5 na armadura; ×0,65 no corpo',description:'Esmaga placas de armadura. Perde eficiência quando a região já está exposta.',color:'#e9a77a'},
 {id:'pierce',name:'Lança do Sepulcro',family:'Ruptura',cooldown:9000,formula:'5,2 × Poder × Escala; ignora 65% da armadura; ×1,6 exposta',description:'Perfura a proteção e aproveita pontos vulneráveis.',color:'#ffdb9c'},
 {id:'bleed',name:'Espinhos Rubros',family:'Corrupção',cooldown:6000,formula:'1 × Poder + 0,35 × Poder × Escala por acúmulo/s durante 8s',description:'Aplica sangramento à região: até cinco acúmulos. Mantê-lo ativo prepara Fome do Vazio.',color:'#ee728d'},
 {id:'hex',name:'Selo Profano',family:'Corrupção',cooldown:10000,formula:'0,65 × Poder × Escala/s durante 8s; técnicas recebem +18%',description:'Amaldiçoa a região e amplifica o dano de técnicas contra ela.',color:'#bc8ae7'},
 {id:'detonate',name:'Fome do Vazio',family:'Corrupção',cooldown:8000,formula:'(2 + 1,8 × sangramentos + 2 se amaldiçoado) × Poder × Escala',description:'Consome sangramentos e maldição da região em uma explosão.',color:'#bb80f2'},
 {id:'rally',name:'Juramento de Cerco',family:'Domínio',cooldown:14000,formula:'Todo dano ×(1,28 + 0,03 × (nível−1)), durante 7s',description:'Uma janela de força para combinar seus ataques.',color:'#7ed4f0'},
 {id:'conduit',name:'Ressonância Arcana',family:'Domínio',cooldown:15000,formula:'Técnicas ×(1,4 + 0,05 × (nível−1)), durante 8s',description:'Amplifica técnicas e seus danos contínuos. Não amplia o ataque básico.',color:'#91adff'},
 {id:'focus',name:'Olho do Caçador',family:'Domínio',cooldown:12000,formula:'A cada 5 ataques básicos na mesma região: 4 × Poder × Escala, durante 8s',description:'Recompensa manter o alvo. Trocar de região reinicia a contagem.',color:'#a3e8db'}
];
const REGIONS=[{id:'head',name:'Cabeça',share:.24,x:.5,y:.28},{id:'core',name:'Núcleo',share:.36,x:.5,y:.52},{id:'plates',name:'Placas',share:.25,x:.28,y:.53},{id:'legs',name:'Base',share:.15,x:.5,y:.79}];
const BOSSES=[{id:'sentinel',name:'Sentinela do Ossuário',tier:'I · O Despertar',lore:'Um relicário vivo desperta sob a catedral. A cabeça exposta é seu ponto mais frágil.'},{id:'archon',name:'Arconte de Ferro',tier:'II · A Profanação',lore:'Placas profanadas protegem o núcleo. Quebre a armadura ou perfure sua defesa.'},{id:'abyss',name:'Matriz do Vazio',tier:'III · O Abismo',lore:'O ponto vulnerável muda a cada dez segundos. A ruína desperta novas fases abaixo de 70% e 35% da vida.'}];
const integer=(x,min=0)=>Number.isSafeInteger(x)&&x>=min?x:min;
function rewardCount(level){return level<=5?5:level<=10?8:level<=20?11:level<=30?14:level<=40?17:level<=50?20:level<=75?23:26;}
function sets(levels={}){return Math.min(...HERO_IDS.map(id=>integer(levels[id])));}
function collection(levels={}){const complete=sets(levels);return {sets:complete,progress:HERO_IDS.filter(id=>integer(levels[id])>complete).length,missing:HERO_IDS.filter(id=>integer(levels[id])===complete),individual:Object.fromEntries(HERO_IDS.map(id=>[id,1+.15*integer(levels[id])]))};}
function xpTotal(level){const n=Math.max(0,integer(level,1)-1);return 80*n+8*n*(n-1)/2;}
function raidLevel(xp){let lo=1,hi=2;while(xpTotal(hi)<=xp&&hi<1000000)hi*=2;while(lo+1<hi){const m=Math.floor((lo+hi)/2);if(xpTotal(m)<=xp)lo=m;else hi=m;}return lo;}
function levelInfo(xp=0){const level=raidLevel(integer(xp));return {level,xp:xp-xpTotal(level),next:xpTotal(level+1)-xpTotal(level),total:xp};}
function freshProfile(){return {raidXp:0,marks:0,techniques:Object.fromEntries(TECHNIQUES.map(t=>[t.id,1])),upgrades:{power:0,precision:0},weapons:Object.fromEntries(HERO_IDS.map(id=>[id,0]))};}
function power(profile){return 100*Math.pow(1.04,raidLevel(profile.raidXp||0)-1)*(1+.06*integer(profile.upgrades?.power));}
function techCost(level){return Math.ceil(25*Math.pow(1.55,Math.max(0,level-1)));}
function upgradeCost(rank){return Math.ceil(40*Math.pow(1.6,Math.max(0,rank)));}
function boss(level=1){level=integer(level,1);const tier=level<=10?0:level<=40?1:2,maxHp=Math.round(42000*Math.pow(1.052,level-1)*(1+.16*tier));const regions=REGIONS.map(r=>{const hp=Math.round(maxHp*r.share),armored=tier===1?['core','plates'].includes(r.id):tier===2?r.id!=='head':false;return {...r,hp,maxHp:hp,armor:armored?Math.round(hp*(tier===1?.32:.48)):0,maxArmor:armored?Math.round(hp*(tier===1?.32:.48)):0};});return {level,tier,id:BOSSES[tier].id,maxHp:regions.reduce((s,r)=>s+r.hp,0),regions};}
function validateLoadout(list){return Array.isArray(list)&&list.length===3&&new Set(list).size===3&&list.every(id=>TECHNIQUES.some(t=>t.id===id));}
function simulate(profile,bossState,loadout,events=[],until=DURATION){
 if(!validateLoadout(loadout))throw Error('Equipe três técnicas diferentes.');
 until=Math.max(0,Math.min(DURATION,Number(until)||0));
 const regions=JSON.parse(JSON.stringify(bossState.regions)),P=power(profile),cd={},stats={basic:0,...Object.fromEntries(TECHNIQUES.map(t=>[t.id,0]))},damageByRegion=Object.fromEntries(REGIONS.map(r=>[r.id,{armor:0,body:0}])),dots={},buffs={},visuals=[];
 let selected=regions.find(r=>r.hp>0)?.id||'core',focusHits=0,total=0,body=0,armor=0,idx=0;
 const accepted=[],ordered=events.map((e,i)=>({...e,order:i})).sort((a,b)=>a.t-b.t||a.order-b.order);
 const scale=id=>1+.18*(Math.max(1,integer(profile.techniques?.[id],1))-1);
 const rank=id=>Math.max(1,integer(profile.techniques?.[id],1))-1;
 function hit(mult,source,t,opts={}){const r=regions.find(r=>r.id===(opts.region||selected));if(!r||r.hp<=0)return 0;let dmg=P*mult;
  if(buffs.rally>t)dmg*=1.28+.03*rank('rally');if(source!=='basic'&&buffs.conduit>t)dmg*=1.4+.05*rank('conduit');if(source!=='basic'&&dots[r.id]?.hex?.end>t&&source!=='hex')dmg*=1.18;
  const current=regions.reduce((s,r)=>s+r.hp,0),fraction=current/bossState.maxHp;
  const weak=bossState.tier===2?['head','core','legs'][Math.floor(t/10000)%3]:'head';
  if(r.id===weak&&r.armor<=0)dmg*=1.2+.02*integer(profile.upgrades?.precision);
  if(bossState.tier===2&&fraction<.7)dmg*=fraction<.35?1.2:1.1;
  if(opts.exposed&&r.armor<=0)dmg*=opts.exposed;
  const bypass=dmg*(opts.pierce||0);let ab=0,hb=0;
  if(r.armor>0){const amount=(dmg-bypass)*(opts.armor||1);ab=Math.min(r.armor,amount);r.armor-=ab;const spill=Math.max(0,amount-ab)/(opts.armor||1);hb=Math.min(r.hp,bypass+spill*(opts.body||1));}else hb=Math.min(r.hp,dmg*(opts.body||1));
  r.hp-=hb;const sum=ab+hb;armor+=ab;body+=hb;total+=sum;stats[source]=(stats[source]||0)+sum;damageByRegion[r.id].armor+=ab;damageByRegion[r.id].body+=hb;
  if(sum>0)visuals.push({t,source,region:r.id,damage:sum,armor:ab,body:hb,broken:ab>0&&r.armor===0});return sum;
 }
 function action(e,t){if(e.type==='target'){if(!regions.some(r=>r.id===e.region))return;selected=e.region;focusHits=0;accepted.push(e);return;}
  const id=e.technique,tech=TECHNIQUES.find(x=>x.id===id);if(e.type!=='cast'||!tech||!loadout.includes(id)||(cd[id]||0)>t)return;
  cd[id]=t+tech.cooldown;accepted.push(e);const s=scale(id),d=dots[selected]||(dots[selected]={});
  if(id==='cleave')hit(3.6*s,id,t);
  if(id==='shatter')hit(4*s,id,t,{armor:2.5,body:.65});
  if(id==='pierce')hit(5.2*s,id,t,{pierce:.65,exposed:1.6});
  if(id==='bleed'){hit(1,id,t);d.bleed={end:t+8000,stacks:Math.min(5,(d.bleed?.end>t?d.bleed.stacks:0)+1),scale:s};}
  if(id==='hex')d.hex={end:t+8000,scale:s};
  if(id==='detonate'){hit((2+1.8*(d.bleed?.end>t?d.bleed.stacks:0)+(d.hex?.end>t?2:0))*s,id,t);delete d.bleed;delete d.hex;}
  if(id==='rally')buffs.rally=t+7000;if(id==='conduit')buffs.conduit=t+8000;if(id==='focus'){buffs.focus=t+8000;focusHits=0;}
  visuals.push({t,source:id,region:selected,cast:true});
 }
 for(let t=0;t<until;t+=TICK){
  while(idx<ordered.length&&ordered[idx].t<=t){const e=ordered[idx++];if(e.t>=0&&e.t<DURATION)action(e,t);}
  if(t%500===0){const n=hit(1,'basic',t);if(n>0&&buffs.focus>t&&++focusHits%5===0)hit(4*scale('focus'),'focus',t);}
  if(t>0&&t%1000===0)for(const [id,d]of Object.entries(dots)){if(d.bleed?.end>t)hit(.35*d.bleed.stacks*d.bleed.scale,'bleed',t,{region:id});if(d.hex?.end>t)hit(.65*d.hex.scale,'hex',t,{region:id});}
 }
 return {duration:until,total,body,armor,dps:total/(Math.max(1,until)/1000),byTechnique:stats,byRegion:damageByRegion,regions,selected,cooldowns:cd,buffs,dots,accepted,visuals:visuals.slice(-160),power:P,remainingHp:regions.reduce((s,r)=>s+r.hp,0)};
}
function autoEvents(profile,bossState,loadout){const events=[];let selected=bossState.regions.find(r=>r.hp>0)?.id||'core';for(let t=0;t<DURATION;t+=500){if(t>0){const s=simulate(profile,bossState,loadout,events,t),r=s.regions.find(r=>r.id===selected);if(r.hp<=0){selected=s.regions.find(r=>r.hp>0)?.id||selected;events.push({t,type:'target',region:selected});}}for(const id of loadout){const tech=TECHNIQUES.find(s=>s.id===id);if(t%tech.cooldown===0)events.push({t,type:'cast',technique:id});}}return events;}
return {VERSION,DURATION,TICK,HERO_IDS,TECHNIQUES,REGIONS,BOSSES,rewardCount,collection,sets,xpTotal,raidLevel,levelInfo,freshProfile,power,techCost,upgradeCost,boss,validateLoadout,simulate,autoEvents};
});
