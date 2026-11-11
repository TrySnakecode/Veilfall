/* Natural early-campaign smoke comparison. No granted levels, money or invulnerability. */
const fs=require('node:fs'),path=require('node:path'),runtime=require('./runtime-r67.cjs');
const root=path.resolve(__dirname,'..'),baseline=process.argv[2],seconds=1200,results=[];
for(const [revision,folder] of [[66,baseline],[67,root]]){
 if(!folder||!fs.existsSync(path.join(folder,'index.html')))continue;
 const a=runtime(folder);
 for(const seed of [17,67,117]){
  const started=Date.now();
  const r=a.run(`(()=>{let z=${seed};Math.random=()=>{z=(Math.imul(1664525,z)+1013904223)>>>0;return z/4294967296;};testMode=false;endgameTrial=false;bossPreviewMode=false;g=fresh();g.sound=false;gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);initialise();const checkpoints=[];let peak=1;
   for(let i=0;i<${seconds}*20;i++){
    updateCombat(.05);updateVillage(.05);peak=Math.max(peak,g.stage);
    if(i%300===0){
     // A player fills free slots as abilities unlock, uses gold on heroes,
     // and equips better drops. A defeat keeps the normal safe farm active.
     for(const s of D.skills)if(g.knightLevel>=s.unlock&&!g.equippedSkills.includes(s.id)&&g.equippedSkills.includes(null))g.equippedSkills[g.equippedSkills.indexOf(null)]=s.id;
     for(const slot of SLOTS){const score=x=>x?Math.log1p(x.value)*(x.effect==='physical'||x.effect==='damage'?1.5:1)+x.rarity:0;for(const item of g.inventory)if(item.slot===slot&&score(item)>score(g.equipped[slot]))g.equipped[slot]=item;}
     if(typeof P67!=='undefined'){let levels={...p67Levels()};for(const id of ['physical_entry','physical_0_gate','physical_0_0','physical_0_1']){const route=p67Route(id,levels);if(!route.error&&p67Cost(levels)+route.cost<=g.talentPoints)for(const k of route.ids)levels[k]=1;}p67Commit(levels);}
    }
    if((i+1)%6000===0)checkpoints.push({seconds:(i+1)/20,stage:g.stage,level:g.knightLevel,kills:g.kills,deaths:g.deaths,points:g.talentPoints});
   }
   return {revision:${revision},seed:${seed},seconds:${seconds},peak,stage:g.stage,level:g.knightLevel,kills:g.kills,deaths:g.deaths,points:g.talentPoints,heroLevels:Object.values(g.heroLevels).reduce((a,b)=>a+b,0),checkpoints};})()`);
  results.push(r);console.log('CAMPAIGN',revision,seed,'stage',r.stage,'kills',r.kills,'deaths',r.deaths,'cpuMs',Date.now()-started);
 }
}
fs.writeFileSync(path.join(root,'docs/CAMPANHA_R67.json'),JSON.stringify({method:'Three deterministic 20-minute fresh campaigns per revision. Full real runtime, natural XP/gold/drops, auto heroes, legal earned-point spending; no active-skill upgrades. No prestige, no free power, defeat retains safe farm. A regression smoke check, not a late-game forecast.',results},null,2));
if(results.some(r=>r.kills<1||r.level<2))throw Error('Campaign failed to progress.');
