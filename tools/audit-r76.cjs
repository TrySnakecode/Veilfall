'use strict';
const fs=require('node:fs'),path=require('node:path');
const runtime=require('./runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
const seeds=process.argv.slice(2).filter(x=>!x.startsWith('--')).map(Number);
const seconds=Number((process.argv.find(x=>x.startsWith('--seconds='))||'--seconds=3600').split('=')[1]);
const scenario=(process.argv.find(x=>x.startsWith('--scenario='))||'--scenario=resume').split('=')[1];
const results=[];
for(const seed of seeds.length?seeds:[17,47,117]){
 const engine=runtime(root),started=Date.now();
 const r=engine.run(`(()=>{let z=${seed};Math.random=()=>{z=(Math.imul(1664525,z)+1013904223)>>>0;return z/4294967296};testMode=false;endgameTrial=false;g=fresh();g.sound=false;g.autoHeroes=true;gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);initialise();let peak=1,checkpoints=[],deaths=[],prestiges=[],lastDeaths=0,held=0,prevSlot={},lastCheckpoint=0;let lastPrestigeAt=0;
 const grants=['grace','shadow','flame_nova','fury','curse','thunderstorm','holy_spear','arcane_focus','demons'];
 const applyGear=()=>{for(const slot of SLOTS){const opts=g.inventory.filter(x=>x.slot===slot);if(!opts.length)continue;const score=i=>(i.rarity+1)*(1+i.value)*(i.quality||1);const best=opts.reduce((a,b)=>!a||score(b)>score(a)?b:a,null);if(!g.equipped[slot]||score(best)>score(g.equipped[slot]))g.equipped[slot]=best;}};
 const applySkills=()=>{for(const id of grants){const sk=D.skills.find(x=>x.id===id);if(g.knightLevel>=sk.unlock&&!g.equippedSkills.includes(id)&&g.equippedSkills.includes(null)){g.equippedSkills[g.equippedSkills.indexOf(null)]=id;}}};
 let resumeIn=0;
 for(let i=0;i<${seconds}*20;i++){
  updateCombat(.05);
  const time=(i+1)/20;
  if(i%200===0){applySkills();if(i%800===0)applyGear();}
  if(g.deaths!==lastDeaths){deaths.push({t:time,stage:g.stage,peak:g.highest[g.difficulty],level:g.knightLevel});lastDeaths=g.deaths;resumeIn=20;}
  if(g.stageHold){held+=.05;resumeIn-=.05;if(resumeIn<=0){g.stageHold=false;g.stageKills=0;scheduleBosses(g.stage,true);resumeIn=20;}}
  peak=Math.max(peak,g.stage);
  if((i+1)%12000===0){checkpoints.push({min:Math.round(time/60),stage:g.stage,peak,level:g.knightLevel,death:g.deaths,held:+held.toFixed(1),goldLog:gold.log10(),physLog:damage().log10(),enemyHpLog:enemyHealth().log10(),gear:g.inventory.length,heroes:Object.values(g.heroLevels).filter(x=>x>0).length});}
 }
 return {seed:${seed},seconds:${seconds},scenario:'${scenario}',peak,stage:g.stage,level:g.knightLevel,death:g.deaths,held,checkpoints,deaths:deaths.slice(-12),prestiges};})()`);
 results.push(r);console.log('SEED',seed,'peak',r.peak,'deaths',r.death,'cpuSec',((Date.now()-started)/1000).toFixed(1));
}
console.log(JSON.stringify(results,null,2));
if(process.env.AUDIT_REPORT)fs.writeFileSync(process.env.AUDIT_REPORT,JSON.stringify(results,null,2));
