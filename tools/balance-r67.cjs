/* Synthetic coverage/sustain benchmarks, plus independent real-formula source ablations. */
const fs=require('node:fs'),path=require('node:path'),runtime=require('./runtime-r67.cjs'),root=path.resolve(__dirname,'..'),a=runtime(root);
a.run(`
function benchSeed(seed){let z=seed>>>0;Math.random=()=>{z=(Math.imul(1664525,z)+1013904223)>>>0;return z/4294967296;};}
function benchBuild(budget,ids,variants={}){g.talentPoints=budget;g.passiveNodes={};g.talentSpent=0;P67.owner=null;let levels={};
 const targets=ids.filter(Boolean).map(id=>'skill_'+id+'_'+(variants[id]||P67_SPECS[id][0][0]));
 const family=D.skills.find(s=>s.id===ids[0])?.kind||'physical';targets.push(family+'_2_notable','sustain_1_notable','sustain_4_notable','sustain_6_notable',family+'_5_notable','magic_4_notable');
 for(const id of targets){const r=p67Route(id,levels);if(!r.error&&p67Cost(levels)+r.cost<=budget)for(const k of r.ids)levels[k]=1;}
 const candidates=P67.nodes.filter(n=>n.type==='common'&&(n.sector===family||n.sector==='sustain')).sort((a,b)=>a.cost-b.cost);
 for(const n of candidates){const r=p67Route(n.id,levels);if(!r.error&&p67Cost(levels)+r.cost<=budget)for(const k of r.ids)levels[k]=1;}p67Commit(levels);
}
function benchProfile(stage=1000,diff=0){testMode=true;endgameTrial=false;bossPreviewMode=false;g=fresh();g.stage=stage;g.difficulty=diff;g.highest[diff]=stage;g.worldPrestiges=diff;g.stageHold=true;g.autoHeroes=false;g.sound=false;
 const n=globalStage(stage,diff);g.knightLevel=Math.min(60000,Math.max(5,Math.round(n*.44)));
 for(const [i,h]of D.heroes.entries()){const level=Math.min(8000,Math.max(0,Math.floor(12*Math.log1p(n)*(1+.12*Math.cos(i)))));g.heroLevels[h.id]=level;g.heroUpgradeProgress[h.id]=level;}
 for(const [i,p]of D.pets.entries())g.petLevels[p.id]=Math.max(1,Math.floor(Math.pow(n,.36)*(1+.15*Math.sin(i))));
 for(const [i,s]of D.scrolls.entries())g.scrollLevels[s.id]=Math.max(1,Math.floor(Math.pow(n,.32)*(1+.15*Math.cos(i))));
 for(const [i,r]of D.artifacts.entries())if(i<Math.min(106,Math.floor(Math.log1p(n)*10)))g.artifactLevels[r.id]=r.maxLevel?Math.min(r.maxLevel,20):Math.max(1,Math.floor(n*.8*(1+.1*Math.cos(i))));
 // R69: no purchased active-skill levels.
 for(const [i,slot]of SLOTS.entries()){const effect={Arma:'physical',Capacete:'magic',Peitoral:'gold_monsters',Anel:'flame_nova',Aura:'aura_weapon'}[slot];g.equipped[slot]={id:i+1,slot,rarity:4,level:stage,difficulty:diff,effect,value:slot==='Aura'?auraAmplificationAt(stage,diff,4):gearValueAt(stage,diff,4),affixes:[]};}
 for(const s of D.sets.slice(0,Math.min(16,Math.floor(Math.log1p(n)))))g.setParts[s.id]=[...SLOTS];
 gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);initialise();g.auto=false;enemies=[];queue=[];bossActive=null;timers.equipRespawn=1e9;timers.fairy=1e9;
}
const benchSpawnBase=spawnEnemy;
function benchClear(ids,budget=960,count=150,layout='spread',variant=null,seconds=30){benchSeed(67);benchProfile(24001,4);g.knightLevel=500;g.equippedSkills=normalizeLoadout(ids);active={};cd={};
 const first=D.skills.find(s=>s.id===ids[0]),base=first.kind==='physical'?damage():first.kind==='faith'?faithDamage():magicDamage();
 const hp=base.mul(mod(ids[0])).mul(mod('area')).mul(mod('normal_damage')).mul(2.4);
 benchBuild(budget,ids,variant?{[ids[0]]:variant}:{});player.hp=maxHealth();player.mp=100*mod('mana');let spawned=0;
 spawnEnemy=function(initial=false,kind=null,event=null){const e=benchSpawnBase(initial,kind||'skeleton',event);if(!e)return e;const i=spawned++,k=i%5;e.x=layout==='packed'?520+(i%16)*8:100+(i%16)*62;e.y=layout==='packed'?300+Math.floor(i/16)%12*8:80+Math.floor(i/16)%16*36;e.hp=hp;e.max=hp;e.speed=35;return e;};
 for(let i=0;i<count;i++)spawnEnemy(true);g.auto=true;const start=g.kills;let t80=null,minMana=player.mp,maxAlive=enemies.length;const counts={};const cast=fireSkill;fireSkill=function(id,manual){const ok=cast(id,manual);if(ok)counts[id]=(counts[id]||0)+1;return ok;};
 // No replenishment until the original pack is cleared; then the normal horde generator runs.
 const oldNextXP=nextXP;nextXP=()=>Big.pow10(1000000);let replenishing=false;timers.spawn=1e6;for(let i=0;i<seconds*20;i++){updateCombat(.05);maxAlive=Math.max(maxAlive,enemies.length);minMana=Math.min(minMana,player.mp);if(t80===null&&g.kills-start>=count*.8)t80=+(i/20).toFixed(2);if(!replenishing&&enemies.length===0){timers.spawn=0;replenishing=true;}}
 const result={ids,budget,spent:g.talentSpent,count,layout,variant,seconds,kills:g.kills-start,t80,minMana:+minMana.toFixed(2),maxAlive,casts:counts,deaths:g.deaths,procs:R67.metrics.maxProcs};fireSkill=cast;spawnEnemy=benchSpawnBase;nextXP=oldNextXP;return result;
}
`);
const rotations=[['grace','fury','shadow','demons'],['flame_nova','thunderstorm','arcane_focus','demons'],['curse','holy_spear','demons','arcane_focus']];
const clear=[];for(const ids of rotations)for(const budget of [125,500,960])for(const layout of ['packed','spread']){const r=a.run(`benchClear(${JSON.stringify(ids)},${budget},150,'${layout}',null,20)`);clear.push(r);console.log('CLEAR',ids[0],budget,layout,r.t80,r.kills);}
const solos=[];for(const id of ['grace','shadow','curse','flame_nova','thunderstorm','holy_spear'])for(const v of a.run(`P67_SPECS['${id}'].map(x=>x[0])`)){const r=a.run(`benchClear(['${id}'],960,150,'spread','${v}',20)`);solos.push(r);console.log('SOLO',id,v,r.t80,r.kills);}
const sources=[];
for(const [stage,diff]of [[55,0],[1000,0],[5000,1],[24000,4],[30000,4]])for(const omit of ['none','heroes','artifacts','pets','scrolls','gear','sets','passives','arsenal']){
 const row=a.run(`(()=>{benchProfile(${stage},${diff});benchBuild(${Math.min(4800,Math.floor((stage+diff*24000)/25))},['grace','fury','shadow','demons']);R52.profile={weapons:Object.fromEntries(VeilRaid.HERO_IDS.map(id=>[id,2]))};r52RefreshFactors();const omit='${omit}';if(omit==='heroes')g.heroLevels={};if(omit==='artifacts')g.artifactLevels={};if(omit==='pets')g.petLevels={};if(omit==='scrolls')g.scrollLevels={};if(omit==='gear')g.equipped=seededSlot();if(omit==='sets')g.setParts={};if(omit==='passives'){g.passiveNodes={};P67.owner=null;}if(omit==='arsenal'){R52.profile=null;r52RefreshFactors();}active={};return {stage:g.stage,world:g.difficulty+1,omit,level:g.knightLevel,physical:damage().log10(),faith:faithDamage().log10(),magic:magicDamage().log10(),enemyHP:enemyHealth(g.stage,g.difficulty).log10(),gold:economySourceMultipliers('monsters'),relics:prestigeReward().log10(),health:maxHealth(),mana:mod('mana'),cooldown:mod('cooldown'),heroPurchase:heroCost(D.heroes[0],0).log10(),artifactCost:artUpgradeCost(D.artifacts[0],g.artifactLevels.a001||0).log10()};})()`);sources.push(row);
}
const report={revision:67,method:'Synthetic fixed inventories; full runtime including Arsenal. Clear benchmark normalizes enemy HP to 2.4 pre-passive skill hits, preserving natural mana, cooldowns, motion, rewards; level held fixed to isolate clearing. Not a forecast of campaign time. Source ablations use unmodified enemy HP and actual progression formulas.',clear,solos,sources};fs.writeFileSync(path.join(root,'docs/BALANCEAMENTO_R67.json'),JSON.stringify(report,null,2));
if([...clear,...solos].some(r=>!Number.isFinite(r.minMana)||r.minMana<0||r.maxAlive>320||r.procs>8))throw Error('Invalid combat invariant');
console.log('Saved',clear.length,'rotations,',solos.length,'variants,',sources.length,'source snapshots.');
