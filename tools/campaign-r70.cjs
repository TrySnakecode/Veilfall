/* Deterministic natural first-run smoke tests; not a full five-world balance guarantee. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),runtime=require('./runtime-r67.cjs');
const root=path.resolve(__dirname,'..'),seeds=[17,47,117],seconds=1200,results=[];
for(const seed of seeds){
 const a=runtime(root),started=Date.now();
 const r=a.run(`(()=>{let z=${seed};Math.random=()=>{z=(Math.imul(1664525,z)+1013904223)>>>0;return z/4294967296};testMode=false;endgameTrial=false;g=fresh();g.sound=false;g.autoHeroes=true;gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);initialise();let checkpoints=[],peak=1;for(let i=0;i<${seconds}*20;i++){updateCombat(.05);if(i%200===0){for(const s of D.skills)if(g.knightLevel>=s.unlock&&!g.equippedSkills.includes(s.id)&&g.equippedSkills.includes(null))g.equippedSkills[g.equippedSkills.indexOf(null)]=s.id;}if((i+1)%6000===0)checkpoints.push({second:(i+1)/20,stage:g.stage,level:g.knightLevel,death:g.deaths,gear:g.inventory.length});peak=Math.max(peak,g.stage);}return {seed:${seed},peak,stage:g.stage,level:g.knightLevel,deaths:g.deaths,gear:g.inventory.length,stageHold:g.stageHold,checkpoints};})()`);
 results.push(r);console.log('CAMPAIGN R70 seed',seed,'peak',r.peak,'deaths',r.deaths,'cpuSec',(Date.now()-started)/1000);
}
const report={revision:70,method:'Three seeded 20-minute natural combat simulations; no prestige, purchased power or injected saves. Automatic passive heroes, auto-cast of unlocked skills, no manual equipment optimizing. A smoke test, NOT an endgame certification.',results};
fs.writeFileSync(path.join(root,'docs/BALANCE_R70_CAMPANHA.json'),JSON.stringify(report,null,2));
if(results.some(x=>x.peak<15))process.exitCode=1;
