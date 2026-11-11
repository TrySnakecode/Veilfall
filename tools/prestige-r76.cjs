'use strict';
const fs=require('node:fs'),path=require('node:path');const runtime=require('./runtime-r67.cjs'),root=path.resolve(__dirname,'..');
const seconds=Number(process.argv.find(x=>x.startsWith('--seconds='))?.split('=')[1]||7200);const seeds=process.argv.slice(2).filter(x=>!x.startsWith('--')).map(Number);const results=[];
for(const seed of seeds.length?seeds:[17,47]){
 const engine=runtime(root),t=Date.now();const r=engine.run(`(()=>{let z=${seed};Math.random=()=>{z=(Math.imul(1664525,z)+1013904223)>>>0;return z/4294967296};testMode=false;endgameTrial=false;g=fresh();g.sound=false;g.autoHeroes=true;gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);initialise();showModal=(title,desc,yes)=>yes();let maxStage=1,checkpoints=[],deaths=[],prestiges=[],prevDeaths=0,held=0,displayedTime=0,nextPrestigeEligibleAt=0;
 const skills=['grace','shadow','flame_nova','fury','curse','thunderstorm','holy_spear','arcane_focus','demons'];
 const equip=()=>{for(const s of skills){const sk=D.skills.find(x=>x.id===s);if(g.knightLevel>=sk.unlock&&!g.equippedSkills.includes(s)&&g.equippedSkills.includes(null)){g.equippedSkills[g.equippedSkills.indexOf(null)]=s;}}for(const slot of SLOTS){const items=g.inventory.filter(x=>x.slot===slot);if(!items.length)continue;const score=i=>(i.rarity+1)*(1+i.value)*(i.quality||1);const best=items.reduce((a,b)=>!a||score(b)>score(a)?b:a,null);if(!g.equipped[slot]||score(best)>score(g.equipped[slot]))g.equipped[slot]=best;}};
 const spend=()=>{for(let i=0;i<8;i++){const count=artCount(),cost=artifactDiscoverCost(count);if(count>=D.artifacts.length||!artifactCandidatePool(count).length||relics.cmp(cost)<0)break;const id=chooseArtifact().id;if(!spendRelics(cost))break;g.artifactLevels[id]=1;}for(let pass=0;pass<14;pass++){const arts=D.artifacts.filter(x=>g.artifactLevels[x.id]&&!artifactAtMax(x));if(!arts.length)break;const budget=relics.div(arts.length);let bought=0;for(const a of arts){const r=buyArtifactBudget(a,budget,1000);bought+=r.levels;}if(!bought)break;}};
 const skillTree=()=>{let levels={...g.passiveNodes};const prefs=P67.nodes.filter(n=>n.type==='common'||n.type==='notable').filter(n=>n.effects.some(e=>['physical','damage','health','defense','gold_monsters'].includes(e.stat))).sort((a,b)=>a.type===b.type?a.cost-b.cost:a.type==='common'?-1:1);let budget=g.talentPoints;for(const n of prefs){const rr=p67Route(n.id,levels);if(rr.error||rr.cost+p67Cost(levels)>budget)continue;for(const id of rr.ids)levels[id]=1;if(p67Cost(levels)+p68Price(n,(levels[n.id]||0)+1)<=budget)levels[n.id]=Math.min(n.maxRank,(levels[n.id]||0)+1);}p67Commit(levels);};
 let resumeIn=20,waiting=0;
 for(let i=0;i<${seconds}*20;i++){
  updateCombat(.05);const t=(i+1)/20;
  if(i%200===0){equip();if(i%400===0)skillTree();}
  if(g.deaths!==prevDeaths){deaths.push({time:t,stage:g.stage,peak:g.runPeak,level:g.knightLevel});prevDeaths=g.deaths;resumeIn=15;}
  if(g.stageHold){held+=.05;resumeIn-=.05;
   if(resumeIn<=0){const eligible=prestigeEligibility();if(eligible.allowed&&t>nextPrestigeEligibleAt){const before=g.runPeak,stage=g.stage,reward=prestigeReward().log10();knightPrestige();spend();prestiges.push({time:t,peak:before,returnStage:g.stage,relLog:reward,artifacts:artCount(),damageLog:damage().log10()});nextPrestigeEligibleAt=t+420;resumeIn=15;}
   else{g.stageHold=false;g.stageKills=0;scheduleBosses(g.stage,true);resumeIn=15;}}
  }
  maxStage=Math.max(maxStage,g.stage,g.runPeak);
  if((i+1)%12000===0)checkpoints.push({minute:Math.round(t/60),stage:g.stage,peak:g.highest[0],maxStage,prestiges:g.knightPrestiges,deaths:g.deaths,level:g.knightLevel,artifactCount:artCount(),relicsLog:relics.log10(),damageLog:damage().log10(),enemyLog:enemyHealth().log10(),health:maxHealth(),talentSpent:g.talentSpent,held:+held.toFixed(1)});
 }
 return {seed:${seed},seconds:${seconds},maxStage,stage:g.stage,deaths:g.deaths,prestiges,checkpoints};})()`);results.push(r);console.log('SEED',seed,'max',r.maxStage,'prestiges',r.prestiges.length,'deaths',r.deaths,'cpuSec',((Date.now()-t)/1000).toFixed(1));
}
console.log(JSON.stringify(results,null,2));if(process.env.AUDIT_REPORT)fs.writeFileSync(process.env.AUDIT_REPORT,JSON.stringify(results,null,2));
