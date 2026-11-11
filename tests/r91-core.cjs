'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');const root=path.resolve(__dirname,'..');
let pass=0;const test=(name,fn)=>{fn();pass++;console.log('PASS SETS R92 '+name)};
const lab=()=>{const r=runtime(root);r.run('startNew(1);');return r;};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('Incomplete set gives neither primary nor secondary',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=['Arma','Anel'];return {physical:mod('physical'),speed:mod('attack_speed')};})()`);
 close(x.physical,1);close(x.speed,1.65);
});
test('Complete set grants primary AND secondary independently',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=SLOTS.slice();return {physical:mod('physical'),speed:mod('attack_speed'),ui:setsPanel()};})()`);
 close(x.physical,10);close(x.speed/1.65,1.025);assert.match(x.ui,/BÔNUS CUMULATIVOS/);
});
test('Multiple set bonuses stack, do not replace each other',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=SLOTS.slice();g.setParts.set03=SLOTS.slice();return {physical:mod('physical'),faith:mod('faith'),speed:mod('attack_speed'),duration:mod('duration')};})()`);
 close(x.physical,10);close(x.faith,10);assert.ok(x.speed>1.65);assert.ok(x.duration>1);
});
test('R91 legacy focus choice does not suppress permanent collection bonuses',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=SLOTS.slice();g.setFocusId='set01';save(1,true);load(1);return {id:g.setFocusId,physical:mod('physical'),speed:mod('attack_speed')};})()`);
 assert.equal(x.id,null);close(x.physical,10);close(x.speed/1.65,1.025);
});
test('Invalid and old setFocus actions cannot remove permanent bonuses',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=SLOTS.slice();onAction('setFocus','set01','');onAction('setFocusClear','','');return {id:g.setFocusId,physical:mod('physical')};})()`);
 assert.equal(x.id,null);close(x.physical,10);
});
test('Critical chance secondary is a direct capped probability increase',()=>{
 const r=lab();const x=r.run(`(()=>{const before=mod('crit_chance');g.setParts.set02=SLOTS.slice();return {before,after:mod('crit_chance'),critDamage:mod('crit_damage')};})()`);
 close(x.after-x.before,.008);assert.ok(x.critDamage>1.8);
});
test('High support effects preserve the total source cap',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=SLOTS.slice();const a=specialSupportBreakdown('attack_speed');g.equipped.Arma={id:999,slot:'Arma',effect:'physical',value:.1,affixes:[{effect:'attack_speed',value:.10}]};const b=specialSupportBreakdown('attack_speed');return {a,b};})()`);
 close(x.a.gear,.025);close(x.b.gear,.10);assert.ok(x.b.total<=.80);
});
test('All 16 permanent secondary definitions are recognized and bounded',()=>{
 const r=lab();const x=r.run('D.sets.map(s=>({id:s.id,b:SET_COLLECTION_BONUSES[s.id]}))');
 assert.equal(x.length,16);for(const a of x){assert.ok(a.b?.effect);assert.ok(a.b?.bonus>0&&a.b?.bonus<=.05);}
});
test('Each collection can provide its own secondary without a selectable oath',()=>{
 const r=lab();const x=r.run(`(()=>{const out=[];for(const set of D.sets){g.setParts={};const b=SET_COLLECTION_BONUSES[set.id];const before=mod(b.effect);g.setParts[set.id]=SLOTS.slice();out.push({id:set.id,before,after:mod(b.effect)});}return out;})()`);
 for(const a of x)assert.ok(a.after>a.before,`${a.id}: ${a.after} <= ${a.before}`);
});
test('Set UI supports slot choice after completing a collection',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=SLOTS.slice();return setsPanel()})()`);
 assert.match(x,/FORJAR Arma/);assert.doesNotMatch(x,/ESCOLHER FOCO SECUNDÁRIO/);
});
test('Combat runs with multiple cumulative sets',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=SLOTS.slice();g.setParts.set13=SLOTS.slice();for(let i=0;i<20;i++)updateCombat(.2);return {stage:g.stage,physical:mod('physical'),boss:mod('boss_damage')};})()`);
 assert.ok(x.stage>=1);assert.ok(x.physical>=10);assert.ok(x.boss>=12);
});
test('Drop, equipment budget and immutable artwork unchanged',()=>{
 const r=lab();const x=r.run(`({affixes:D.affixes.length,sets:D.sets.length,uniques:D.uniques.length,skills:D.skills.length,sale:GEAR_SALE_PRICES.slice()})`);
 assert.deepEqual([x.affixes,x.sets,x.uniques,x.skills],[61,16,16,9]);assert.deepEqual(Array.from(x.sale),[1,5,10,25,50,100]);
 const hashes=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [file,digest] of Object.entries(hashes))if(!['server/server.cjs','server/service.cjs'].includes(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),digest,file);
});
console.log(`SET R92 ${pass}/${pass} PASS`);
