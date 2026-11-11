'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..'),prev=path.resolve(root,'../VEILFALL_R75');
const cur=runtime(root),old=runtime(prev);
let passed=0;
function test(label,fn){fn();passed++;console.log('PASS',label);}
const run=(engine,expr)=>engine.run(`(()=>{g=fresh();gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);active={};testMode=false;endgameTrial=false;${expr}})()`);
const cmp=(a,b)=>Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b));
test('First world prestige stage 55 grants a bounded 7x early relic boost',()=>{
 const a=run(cur,'return earlyPrestigeRelicMultiplier(55,0)');assert.equal(a,7);
 assert.equal(run(cur,'return earlyPrestigeRelicMultiplier(1,0)'),7);
 assert.equal(run(cur,'return earlyPrestigeRelicMultiplier(250,0)'),1);
 assert.equal(run(cur,'return earlyPrestigeRelicMultiplier(251,0)'),1);
 assert.ok(run(cur,'return earlyPrestigeRelicMultiplier(120,0)')>1);
 assert.ok(run(cur,'return earlyPrestigeRelicMultiplier(120,0)')<7);
});
test('Prestige reward keeps stage 250+ and ALL other worlds unchanged',()=>{
 for(const [stage,diff] of [[250,0],[1000,0],[24000,0],[1,1],[55,1],[24000,2],[24000,4]]){
  const expr=`return basePrestigeRelics(${stage},${diff}).log10()`;
  assert.ok(cmp(run(cur,expr),run(old,expr)),`modified stage ${stage} diff ${diff}`);
 }
 const b=run(old,'return basePrestigeRelics(55,0).log10()');
 const a=run(cur,'return basePrestigeRelics(55,0).log10()');
 assert.ok(cmp(a-b,Math.log10(7)));
});
const hit=(engine,stage,diff=0,kind='boss',lvl=70,age=0)=>
 run(engine,`g.knightLevel=${lvl};g.stage=${stage};g.difficulty=${diff};return enemyContactDamage({stage:${stage},diff:${diff},kind:'${kind}',bossAge:${age}});`);
test('World I stages 1–55 retain EXACT R75 contact threat',()=>{
 for(const stage of [1,10,25,40,55])for(const kind of ['normal','elite','boss'])
  assert.ok(cmp(hit(cur,stage,0,kind),hit(old,stage,0,kind)),`${stage} ${kind}`);
});
test('Middle threat is smooth and grows stage 55 → 56 → 100 → 250',()=>{
 const hits=[55,56,100,180,250].map(s=>hit(cur,s,0,'normal',60));
 assert.ok(hits.every(Number.isFinite));
 for(let i=1;i<hits.length;i++)assert.ok(hits[i]>=hits[i-1]*.98,JSON.stringify(hits));
});
test('Reference-HP danger respects investment in real max health',()=>{
 const ratio=run(cur,`g.stage=95;g.knightLevel=60;const e={stage:95,diff:0,kind:'boss',bossAge:0};let raw=enemyContactDamage(e),before=maxHealth();let orig=maxHealth;maxHealth=()=>before*1.75;let after=enemyContactDamage(e);maxHealth=orig;return {raw,before,after};`);
 assert.ok(ratio.raw>0&&ratio.after>0);
 assert.ok(ratio.after/(ratio.before*1.75)<ratio.raw/ratio.before*.8,JSON.stringify(ratio));
});
test('Later worlds retain R75 contact danger without unforeseen tuning',()=>{
 for(const [stage,diff] of [[56,1],[250,1],[251,0],[1000,0],[5000,0],[24000,1],[24000,4]])
  assert.ok(cmp(hit(cur,stage,diff,'boss',1500),hit(old,stage,diff,'boss',1500)),`${stage}, ${diff}`);
});
test('The original late-stage enemy HP, gold and experience curves are not changed',()=>{
 for(const [s,d] of [[1,0],[55,0],[1000,0],[24000,0],[1,1],[1000,1],[24000,4]])for(const method of ['enemyHealth','enemyGold','enemyXP']){
  const expr=`return ${method}(${s},${d}).log10()`;
  assert.ok(cmp(run(cur,expr),run(old,expr)),`${method} ${s} diff ${d}`);
 }
});
test('Passive skill atlas and hero/equipment rules are unchanged',()=>{
 const keys=['P67.nodes.length','P67.edges.length','D.heroes.length','D.skills.length','D.artifacts.length'];
 for(const k of keys){const a=run(cur,`return ${k}`),b=run(old,`return ${k}`);assert.equal(a,b,k);}
});
test('Untouched source assets, server, raid rules and visual scripts remain byte-for-byte identical',()=>{
 const names=['src/r68-tree.js','src/r67-combat.js','src/r65-bridge.js','shared/raid-engine.js','server/service.cjs','server/server.cjs','src/r74-ui.js','src/r75-ui.css'];
 for(const p of names)assert.deepEqual(fs.readFileSync(path.join(root,p)),fs.readFileSync(path.join(prev,p)),p);
});
test('R75 UI adapter changed only version labels',()=>{
 let oldUI=fs.readFileSync(path.join(prev,'src/r75-ui.js'),'utf8');
 oldUI=oldUI.replace("document.title='VEILFALL · R75 · Almas, Runas e Arena Limpa'", "document.title='VEILFALL · R76 · Progressão Rebalanceada'")
   .replace("'✦ <b>VEILFALL</b> · R75 · SANTUÁRIO ORGANIZADO'", "'✦ <b>VEILFALL</b> · R76 · PROGRESSÃO REBALANCEADA'")
   .replace("'VEILFALL · R75'", "'VEILFALL · R76'");
 assert.equal(fs.readFileSync(path.join(root,'src/r75-ui.js'),'utf8'),oldUI);
});
console.log(`R76 ${passed}/${passed} PASS`);
