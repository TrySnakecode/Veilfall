'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
const fixture=require('./fixtures/r76-reference.json');
const engine=runtime(root);
const run=code=>engine.run(`(()=>{g=fresh();gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);active={};testMode=false;endgameTrial=false;${code}})()`);
const near=(x,y,rel=1e-7)=>Math.abs(x-y)<=rel*Math.max(1,Math.abs(x),Math.abs(y));
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS',name);}
const hit=(stage,difficulty=0,kind='boss',level=70)=>run(`g.knightLevel=${level};g.stage=${stage};g.difficulty=${difficulty};return enemyContactDamage({stage:${stage},diff:${difficulty},kind:'${kind}',bossAge:0})`);

test('R77 prestige grant starts at 1.75x and progressively reverts to baseline',()=>{
 assert.ok(near(run('return earlyPrestigeRelicMultiplier(55,0)'),1.75));
 assert.ok(near(run('return earlyPrestigeRelicMultiplier(1,0)'),1.75));
 let previous=1.75;
 for(const stage of [56,75,100,150,200,249,250]){
  const current=run(`return earlyPrestigeRelicMultiplier(${stage},0)`);
  assert.ok(current>=1&&current<=previous,`${stage}: ${current}`);
  previous=current;
 }
 assert.equal(previous,1);
});
test('Prestige rewards are strictly below R76 on early World I and identical everywhere else',()=>{
 for(const r of fixture.stages){
  const current=run(`return basePrestigeRelics(${r.stage},${r.difficulty}).log10()`);
  if(r.difficulty===0&&r.stage<250)assert.ok(current<r.prestigeLog,`${r.stage} ${current} not less than ${r.prestigeLog}`);
  else assert.ok(near(current,r.prestigeLog),`${r.difficulty}:${r.stage}`);
 }
 assert.equal(run('g.stage=54;g.runPeak=54;return prestigeEligibility().allowed'),false);
 assert.equal(run('g.stage=55;g.runPeak=55;return prestigeEligibility().allowed'),true);
});
test('Boss contact hit is continuous across phase 55→56',()=>{
 const b=hit(55),c=hit(56);
 assert.ok(c>=b&&c<b*1.05,`55: ${b}; 56: ${c}`);
});
test('Enemy contact damage increases in the intended early World I span',()=>{
 for(const stage of [56,60,75,100,125,150,200]){
  const r=fixture.stages.find(x=>x.stage===stage&&x.difficulty===0);
  assert.ok(hit(stage)>r.bossHit-1e-7,`${stage}: hit too weak`);
  assert.ok(hit(stage,0,'normal')>=r.normalHit,`${stage}: normal hit too weak`);
 }
 for(const stage of [60,75,100]){
  const r=fixture.stages.find(x=>x.stage===stage&&x.difficulty===0);
  assert.ok(hit(stage)>r.bossHit*1.07,`${stage}: insufficient extra boss danger`);
 }
});
test('All World II–V and stage 250+ R76 damage profiles remain exact',()=>{
 for(const r of fixture.stages){
  if(r.difficulty===0&&r.stage>55&&r.stage<250)continue;
  assert.ok(near(hit(r.stage,r.difficulty),r.bossHit),`${r.difficulty}:${r.stage} boss`);
  assert.ok(near(hit(r.stage,r.difficulty,'normal'),r.normalHit),`${r.difficulty}:${r.stage} normal`);
 }
});
test('Defense and max HP retain meaningful power at phase 75',()=>{
 const data=run(`g.stage=75;g.knightLevel=70;const e={stage:75,diff:0,kind:'boss',bossAge:0};const base=enemyContactDamage(e),hp=maxHealth(),fn=maxHealth;maxHealth=()=>hp*2;const scaled=enemyContactDamage(e);maxHealth=fn;return {base,hp,scaled}`);
 assert.ok(data.base>0&&data.scaled/(data.hp*2)<data.base/data.hp*.7,JSON.stringify(data));
 const defense=run(`g.stage=75;g.knightLevel=70;const e={stage:75,diff:0,kind:'boss',bossAge:0};const base=enemyContactDamage(e),fn=mod;mod=(key)=>key==='defense'?1.5:fn(key);const defended=enemyContactDamage(e);mod=fn;return {base,defended}`);
 assert.ok(defense.defended<defense.base,JSON.stringify(defense));
});
test('Enemy HP, gold, XP, artefact economy and catalogs equal the R76 baseline',()=>{
 for(const r of fixture.stages){
  for(const [prop,expr] of [['enemyHpLog','enemyHealth'],['enemyGoldLog','enemyGold'],['enemyXpLog','enemyXP']]){
   const actual=run(`g.difficulty=${r.difficulty};return ${expr}(${r.stage},${r.difficulty}).log10()`);
   assert.ok(near(actual,r[prop]),`${expr} ${r.stage}/${r.difficulty}`);
  }
 }
 const current=run('return {artifactDiscover0:artifactDiscoverCost(0).log10(),artifactDiscover10:artifactDiscoverCost(10).log10(),artifacts:D.artifacts.length,heroes:D.heroes.length,skills:D.skills.length,nodes:P67.nodes.length,edges:P67.edges.length}');
 for(const [k,v] of Object.entries(fixture.structural))assert.ok(near(current[k],v),k);
});
test('Approved sprites, audio, server, raid engine, skills and UI files have exactly R76 hashes',()=>{
 for(const [name,expected] of Object.entries(fixture.immutableSha256)){
  const digest=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
  assert.equal(digest,expected,name);
 }
});
test('R77 campaign title is visible while modular source structure is preserved',()=>{
 const idx=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(idx,/VEILFALL — Crônicas do Véu · R77/);
 assert.match(fs.readFileSync(path.join(root,'src/r75-ui.js'),'utf8'),/R77 · DESAFIO E PRESTÍGIO/);
});
console.log(`R77 ${passed}/${passed} PASS`);
