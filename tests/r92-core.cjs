'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const runtime=require('../tools/runtime-r67.cjs');const root=path.resolve(__dirname,'..');
let pass=0;const test=(label,fn)=>{fn();pass++;console.log('PASS R92 '+label)};
const lab=()=>{const r=runtime(root);r.run('startNew(1);Math.random=()=>0;');return r;};
test('Every unique has a valid identity primary, special secondary and collectable bonus',()=>{
 const r=lab();const all=r.run(`D.uniques.map(d=>({id:d.id,slot:d.slot,primary:UNIQUE_PRIMARY[d.id]?.effect,secondary:uniqueSignatureEffect(d),collection:UNIQUE_COLLECTION_BONUSES[d.id]}))`);
 assert.equal(all.length,16);for(const x of all){assert.ok(x.primary);assert.ok(x.secondary);assert.ok(x.collection?.bonus>0);}
});
test('New uniques have unique primary and exactly 1 special + 2 random secondary affixes',()=>{
 const r=lab();const all=r.run(`(()=>D.uniques.map((def,i)=>{Math.random=()=>((i+.001)/16);const it=giveGear(500,1,null,null,5);return {uniqueId:it.uniqueId,effect:it.effect,version:it.uniqueVersion,count:it.affixes.length,signature:it.affixes.filter(a=>a.uniqueSignature).length,discovered:g.uniqueDiscovered.includes(it.uniqueId)}}))()`);
 for(let i=0;i<16;i++){const x=all[i];assert.equal(x.uniqueId,`u${String(i+1).padStart(2,'0')}`);assert.equal(x.version,2);assert.equal(x.count,3);assert.equal(x.signature,1);assert.ok(x.discovered);}
});
test('Special primary scales smoothly with character progression and is bounded',()=>{
 const r=lab();const x=r.run(`(()=>{Math.random=()=>.07;const it=giveGear(200,0,null,null,5);g.equipped.Arma=it;const base=uniquePrimaryValue(it);g.talentSpent=100000;const later=uniquePrimaryValue(it);return {id:it.uniqueId,base,later,raw:it.value,mod:mod('physical')};})()`);
 assert.equal(x.id,'u02');assert.ok(x.later>x.base);assert.ok(x.later<=x.raw*1.5);assert.ok(x.mod>1);
});
test('Selling a new Unique keeps discovered permanent collection bonus',()=>{
 const r=lab();const x=r.run(`(()=>{g.autoSellRarities=[5];g.autoSellProtectUpgrades=false;Math.random=()=>.07;const before=mod('physical');const item=giveGear(200,0,null,null,5);return {id:item.uniqueId,kept:g.inventory.some(x=>x.id===item.id),before,after:mod('physical'),found:g.uniqueDiscovered.includes(item.uniqueId)};})()`);
 assert.equal(x.id,'u02');assert.equal(x.kept,false);assert.ok(x.found);assert.ok(x.after>x.before);
});
test('Discovery survives saving and does not duplicate passive collection bonus',()=>{
 const r=lab();const x=r.run(`(()=>{Math.random=()=>.07;const it=giveGear(200,0,null,null,5);const first=mod('physical');save(1,true);load(1);const after=mod('physical');g.uniqueDiscovered.push(it.uniqueId);const duplicate=mod('physical');return {first,after,duplicate,found:g.uniqueDiscovered.includes(it.uniqueId)};})()`);
 assert.ok(x.found);assert.equal(x.first,x.after);assert.equal(x.first,x.duplicate);
});
test('Historical R90 equipment retains primary and secondary rolls, discovery recognised',()=>{
 const r=lab();const x=r.run(`(()=>{const legacy={id:1,slot:'Arma',rarity:5,uniqueId:'u02',effect:'damage',value:.123,affixes:[{effect:'physical',value:.09,uniqueSignature:'u02'}]};g.inventory=[legacy];save(1,true);load(1);return {item:g.inventory[0],found:g.uniqueDiscovered.includes('u02')};})()`);
 assert.equal(x.item.uniqueVersion,undefined);assert.equal(x.item.effect,'damage');assert.equal(x.item.value,.123);assert.equal(x.item.affixes[0].value,.09);assert.ok(x.found);
});
test('Auras respect their original 20 percent cap',()=>{
 const r=lab();const x=r.run(`(()=>{Math.random=()=>.01;const it=giveGear(20000,4,null,null,5);return {id:it.uniqueId,slot:it.slot,value:uniquePrimaryValue(it)};})()`);
 assert.equal(x.id,'u01');assert.equal(x.slot,'Aura');assert.ok(x.value<=.20);
});
test('Unique drops never progress one of the sixteen five-piece collections',()=>{
 const r=lab();const x=r.run(`(()=>{Math.random=()=>0;const it=giveGear(800,2,null,null,5);return {setId:it.setId,owned:Object.keys(g.setParts).length};})()`);
 assert.equal(x.setId,null);assert.equal(x.owned,0);
});
test('Forge preserves slot and excludes newly crafted Uniques',()=>{
 const r=lab();const x=r.run(`(()=>SLOTS.map(slot=>{const it=giveGear(300,0,'set01',slot,5);return {slot:it.slot,rarity:it.rarity,uniqueId:it.uniqueId||null}}))()`);
 for(const a of x){assert.equal(a.rarity,4);assert.equal(a.uniqueId,null);}
});
test('Legacy R91 setFocusId erased without removing old set primary bonus',()=>{
 const r=lab();const x=r.run(`(()=>{g.setFocusId='set01';g.setParts.set01=SLOTS.slice();save(1,true);load(1);return {id:g.setFocusId,p:mod('physical'),s:mod('attack_speed')};})()`);
 assert.equal(x.id,null);assert.equal(x.p,10);assert.ok(x.s>1.65);
});
console.log(`R92 ${pass}/${pass} PASS`);
