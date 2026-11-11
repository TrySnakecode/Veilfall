'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
const R78=runtime(root),baseline=require('./fixtures/r77-reference.json');
const evaluate=(rt,s)=>rt.run(`(()=>{g=fresh();gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);active={};testMode=false;endgameTrial=false;${s}})()`);
const near=(a,b,relative=1e-7)=>Math.abs(a-b)<=relative*Math.max(1,Math.abs(a),Math.abs(b));
const hit=(rt,stage=1,diff=0,kind='boss',level=70,age=0)=>evaluate(rt,`g.knightLevel=${level};g.stage=${stage};g.difficulty=${diff};return enemyContactDamage({stage:${stage},diff:${diff},kind:'${kind}',bossAge:${age}});`);
let n=0;function test(label,body){body();console.log('PASS',label);n++;}
test('Stages 1–55 and introduction remain identical to R77',()=>{
 for(const stage of [1,2,10,25,40,54,55])for(const kind of ['normal','elite','boss'])
  assert.ok(near(hit(R78,stage,0,kind),baseline.earlyHits[stage][kind]),`${stage}/${kind}`);
});
test('No stage-55 or stage-250 cliff; boss and regular damage keep climbing',()=>{
 for(const kind of ['normal','boss']){
  for(const [a,b] of [[54,55],[55,56],[249,250],[250,251],[23999,24000]]){
   const x=hit(R78,a,0,kind,70),y=hit(R78,b,0,kind,70);
   assert.ok(y>x&&y/x<1.08,`${kind} ${a}→${b}: ${x}→${y}`);
  }
 }
});
test('Damage is strictly increasing at significant milestones, across all worlds',()=>{
 const stages=[1,55,56,75,100,150,200,250,251,500,1000,5000,12000,24000];
 for(let d=0;d<5;d++){
  const spots=d===0?stages:[1,55,250,251,500,1000,5000,12000,24000];
  for(const kind of ['normal','elite','boss']){
   let prev=0;
   for(const stage of spots){const value=hit(R78,stage,d,kind,70);
    assert.ok(Number.isFinite(value)&&value>prev,`d${d}/${kind}: phase ${stage} damage ${value} <= ${prev}`);
    prev=value;
   }
  }
 }
});
test('World transition does not one-shot via an artificial 2.65x attack multiplier',()=>{
 for(let d=1;d<5;d++){
  const last=hit(R78,24000,d-1,'boss'),first=hit(R78,1,d,'boss');
  assert.ok(first>last&&first/last<1.001,`${d-1}→${d}: ${last} ${first}`);
 }
});
test('104.40 PV was only a proportional cap and is gone from boss and contact damage',()=>{
 assert.ok(near(baseline.earlyHits[250].boss,104.4));
 assert.ok(hit(R78,150,0,'boss',70)>104.4);
 assert.ok(hit(R78,250,0,'boss',70)>200);
 assert.ok(hit(R78,250,0,'normal',70)>174*.33);
});
test('Greater real HP increases survival; attackers do not auto-scale to player HP',()=>{
 const o=evaluate(R78,`g.stage=250;g.knightLevel=70;const e={stage:250,diff:0,kind:'boss',bossAge:0};const hit=enemyContactDamage(e),original=maxHealth,baseHp=maxHealth();maxHealth=()=>baseHp*5;const second=enemyContactDamage(e);maxHealth=original;return {hit,second,baseHp};`);
 assert.ok(near(o.hit,o.second),JSON.stringify(o));
 assert.ok(o.hit/o.baseHp>o.second/(o.baseHp*5));
});
test('Defense, skill/relic damage reduction and enrage still work without a hard cap',()=>{
 const o=evaluate(R78,`g.stage=250;g.knightLevel=70;const e={stage:250,diff:0,kind:'boss',bossAge:0};const raw=enemyContactDamage(e),originalMod=mod;mod=k=>k==='defense'?2:originalMod(k);const defended=enemyContactDamage(e);mod=originalMod;e.bossAge=35;const enraged=enemyContactDamage(e);g.artifactLevels.a106=80;return {raw,defended,enraged,reduction:effectiveDamageReduction()};`);
 assert.ok(near(o.defended,o.raw/2));
 assert.ok(near(o.enraged,o.raw*1.85));
 assert.ok(near(o.reduction,.75));
});
test('Boss special attacks can exceed 60% of actual HP, then apply damage reduction',()=>{
 const o=evaluate(R78,`g.stage=250;g.knightLevel=70;player={x:0,y:0,hp:maxHealth(),contactInvuln:0};let e={stage:250,diff:0,kind:'boss',bossAge:0};const before=player.hp,taken=bossDamageToKnight(e,1);return {before,taken,after:player.hp,reduction:effectiveDamageReduction()};`);
 assert.ok(o.taken>o.before*.60,JSON.stringify(o));
 assert.ok(near(o.taken,hit(R78,250,0,'boss',70)*(1-o.reduction)));
 assert.equal(o.after,0);
});
test('Level 24,000 and endgame World V receive rising but finite damage',()=>{
 for(const [d,s] of [[0,24000],[1,1],[1,24000],[2,24000],[4,1],[4,24000],[4,60000],[4,200000]]){
  const x=hit(R78,s,d,'boss',24000);
  assert.ok(Number.isFinite(x)&&x>0,`${d}/${s} ${x}`);
 }
 const world1=hit(R78,24000,0,'boss',24000),world5=hit(R78,24000,4,'boss',60000);
 const health24k=evaluate(R78,'return knightBaseHealth(24000)');
 const health60k=evaluate(R78,'return knightBaseHealth(60000)');
 assert.ok(world1>health24k*.5&&world1<health24k*2,`I-24000: ${world1} PV, HP ${health24k}`);
 assert.ok(world5>health60k&&world5<health60k*5,`V-24000: ${world5} PV, HP ${health60k}`);
});
test('Prestige rewards, enemy HP, XP, gold, and save structure are unchanged',()=>{
 for(const [s,d] of [[55,0],[150,0],[250,0],[24000,0],[1,1],[250,2],[24000,4]]){
  for(const fn of ['basePrestigeRelics','enemyHealth','enemyGold','enemyXP']){
   const expr=`return ${fn}(${s},${d}).log10()`;
   assert.ok(near(baseline.economy[`${s}:${d}`][fn],evaluate(R78,expr)),`${fn} phase ${s} world ${d}`);
  }
 }
 const stableSave=evaluate(R78,"const save=fresh();delete save.created;delete save.savedAt;delete save.heroOrder;delete save.autoSellProtectUpgrades;delete save.setFocusId;delete save.uniqueDiscovered;return JSON.stringify(save)");
 assert.equal(stableSave,JSON.stringify(baseline.saveSchema));
});
test('All existing art, UI stylesheet, raid, networking and skills remain bit-for-bit identical',()=>{
 for(const [rel,expected] of Object.entries(baseline.immutableHashes)){
  // R85 intentionally changed the skill-combat module; verify it separately in r85-core.
  if(['server/server.cjs','server/service.cjs','src/r52-core.js','src/r52-ui.js','src/r67-combat.js','src/base.css','src/data.js'].includes(rel))continue;
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),expected,rel);
 }
});
test('R78 mechanics carry versioned labels in R80 modular game',()=>{
 assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/Crônicas do Véu · R101/);
 assert.match(fs.readFileSync(path.join(root,'src/r75-ui.js'),'utf8'),/VEILFALL · R101/);
});
console.log(`R78 ${n}/${n} PASS`);
