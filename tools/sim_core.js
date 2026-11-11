
__SIMRUN=function(seconds=900,seed=77,strategy='balanced',prestige=false){
 let z=seed>>>0; Math.random=function(){z=(Math.imul(1664525,z)+1013904223)>>>0;return z/4294967296;};
 alertGame=function(msg){uiDirty=true};sound=function(){};
 let runTimes=[],deathBefore=0,peak=0,prestiges=0;
 testMode=false;startNew(1);g.sound=false;g.autoRetreat=true;g.equippedSkills=['grace',null,null,null];
 function spend(){
  if(strategy==='nopet'){givePet=function(){return null;};}
  if(strategy==='noscroll'){giveScroll=function(){return null;};}
  const heroes=orderedHeroes();
  if(strategy!=='noheroes'){
   // Investments compare effective passive contribution/gold; distribute affordable purchases.
   for(let r=0;r<2;r++)for(const h of heroes){
    const old=g.heroLevels[h.id]||0;if(old>=8000)continue;
    const plan=heroPurchasePlan(h,old,10,gold);
    if(plan.levels>0 && spendGold(plan.cost)){
     g.heroUpgradeProgress[h.id]=heroInvestmentLevel(h.id,old)+plan.levels;
     g.heroLevels[h.id]=plan.finalLevel;
    }
   }
  }
  if(strategy!=='noabilities'){
   for(const sk of D.skills){
    if(g.knightLevel>=sk.unlock&&!g.equippedSkills.includes(sk.id)&&g.equippedSkills.includes(null))g.equippedSkills[g.equippedSkills.indexOf(null)]=sk.id;
    if(!g.equippedSkills.includes(sk.id))continue;
   }
  }
  if(strategy!=='noabilities')for(const sk of D.skills){
   if(!g.equippedSkills.includes(sk.id))continue;
   for(const node of sk.nodes.slice(0,10)){
    let req=talentRequirements(sk,node);
    if(req.canBuy&&g.talentSpent+req.cost<=g.talentPoints){g.talents[node.id]=(g.talents[node.id]||0)+1;g.talentSpent+=req.cost;}
   }
  }
  if(strategy!=='nogear')for(const slot of SLOTS){
   const pool=g.inventory.filter(i=>i.slot===slot);
   if(!pool.length)continue;
   const score=i=>(['physical','faith','magic','damage','gold','gold_monsters','fury','grace','shadow','curse'].includes(i.effect)?2:1)*i.value +i.rarity*.01;
   const best=pool.reduce((a,b)=>score(b)>score(a)?b:a);
   if(!g.equipped[slot]||score(best)>score(g.equipped[slot]))g.equipped[slot]=best;
  }
 }
 function artInvest(){
  if(strategy==='noart')return;
  let num=0;
  while(num<6 && artCount()<D.artifacts.length && relics.cmp(artifactDiscoverCost(artCount()))>=0){
   relics=relics.sub(artifactDiscoverCost(artCount()));const a=chooseArtifact();if(a)g.artifactLevels[a.id]=1;num++;
  }
  const owned=D.artifacts.filter(a=>g.artifactLevels[a.id]&&(!a.maxLevel||g.artifactLevels[a.id]<a.maxLevel));
  if(owned.length)for(const a of owned){
   const r=buyArtifactBudget(a,relics.mul(.72/owned.length),120); if(r.levels<=0)continue;
  }
 }
 function doPrestige(){
  if(!prestige||g.stage<55||g.knightPrestiges>=5)return;
  const should=(g.knightPrestiges===0?g.totalTime>=2100&&g.stage>=55:g.stage>=Math.max(60,prestigeEligibility().threshold+10)&&g.totalTime>2100*(g.knightPrestiges+1));
  if(!should || !prestigeEligibility().allowed)return;
  const peak=Math.max(g.runPeak||g.stage,g.stage);const reward=prestigeReward();
  relics=relics.add(reward);totalRelics=totalRelics.add(reward);g.knightPrestiges++;
  const returnStage=prestigeReturn(peak);const nextThreshold=Math.min(24000,returnStage===1?Math.max(30,Math.ceil(.3*peak)):returnStage+Math.max(30,Math.ceil(.3*peak)));
  g.prestigeGates[g.difficulty]={threshold:nextThreshold,priorPeak:peak,returnStage};
  g.stage=returnStage;g.runPeak=returnStage;g.runStartStage=returnStage;g.runKills=0;g.knightLevel=1;g.stageKills=0;g.stageHold=false;
  gold=B(0);xp=B(0);g.heroLevels={};g.heroUpgradeProgress={};enemies=[];queue=[];bossActive=null;active={};cd={};
  player.hp=maxHealth();player.mp=100*mod('mana');artInvest();
  for(let i=0;i<aliveTarget();i++)spawnEnemy(true);scheduleBosses(g.stage,true);
  runTimes.push({event:'prestige',sec:g.totalTime,stage:peak,relics:reward.log10()});
 }
 let t=0,next=0, checkpoints=[300,900,1800,2700,3600,5400,7200,10800];
 for(let i=0;i<seconds*20;i++){
  updateCombat(.05);
  if(i%12000===0&&seconds>4000)console.log("PROGRESS",seed,Math.round(i/20),g.stage,g.knightPrestiges,g.deaths);
  if(i%120===0){spend();if(g.stageHold){g.stageHold=false;g.stageKills=0;}doPrestige();}
  t+=.05;peak=Math.max(peak,g.stage);
  if(t>=checkpoints[0]){runTimes.push({sec:Math.round(t),stage:g.stage,peak,lv:g.knightLevel,deaths:g.deaths,prestiges:g.knightPrestiges,gold:gold.log10(),art:artCount()});checkpoints.shift();}
 }
 return {seconds,seed,strategy,peak,stage:g.stage,level:g.knightLevel,deaths:g.deaths,prestiges:g.knightPrestiges,kills:g.kills,artifacts:artCount(),heroCount:Object.keys(g.heroLevels).length,snapshots:runTimes};
};