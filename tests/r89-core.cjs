'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let count=0;const test=(label,fn)=>{fn();console.log('PASS R89 '+label);count++};
const lab=()=>{const r=runtime(root);r.run('startNew(1);Math.random=()=>0;');return r;};
test('Incomplete collections name missing slots, show only effective set bonus and no phantom complement',()=>{
 const r=lab();const text=r.run('setsPanel()');
 assert.match(text,/Faltam: Arma · Capacete · Peitoral · Aura · Anel/);
 assert.match(text,/BÔNUS PRINCIPAL|bônus principal|Bônus principal/);
 assert.ok(!text.includes('Complemento:'));
 assert.ok(!text.includes('FORJAR MELHORIA'));
});
test('Incomplete set forging costs exactly one material and yields the first missing type',()=>{
 const r=lab();const x=r.run(`(()=>{g.village.forge=10;onAction('forge','set01','');return {materials:g.village.forge,slots:g.setParts.set01,items:g.inventory.filter(x=>x.setId==='set01').map(x=>x.slot)};})()`);
 assert.equal(x.materials,9);assert.deepEqual(Array.from(x.slots),['Arma']);assert.deepEqual(Array.from(x.items),['Arma']);
});
test('Cannot forge an arbitrary type before completing all five slots',()=>{
 const r=lab();const x=r.run(`(()=>{g.village.forge=12;onAction('forgeSlot','set01','Anel');return {resources:g.village.forge,parts:g.setParts.set01||[],items:g.inventory.length};})()`);
 assert.equal(x.resources,12);assert.equal(x.parts.length,0);assert.equal(x.items,0);
});
test('Complete set requires valid explicit slot choice: preserves full material cost and awarded type',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=[...SLOTS];g.village.forge=20;const old=g.inventory.length;onAction('forge','set01','');const oldAmount=g.village.forge;onAction('forgeSlot','set01','Peitoral');return {pre:old,oldAmount,after:g.village.forge,slot:g.inventory[0].slot,set:g.inventory[0].setId,parts:g.setParts.set01.length};})()`);
 assert.equal(x.oldAmount,20);assert.equal(x.after,14);assert.equal(x.slot,'Peitoral');assert.equal(x.set,'set01');assert.equal(x.parts,5);
});
test('Completed collections offer five different type buttons without guaranteeing stronger power',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=[...SLOTS];return setsPanel();})()`);
 for(const slot of ['Arma','Capacete','Peitoral','Aura','Anel'])assert.ok(x.includes(`data-id="set01" data-arg="${slot}"`),slot);
 assert.match(x,/não garante que o novo item seja superior/);
 assert.match(x,/raridades, qualidades e filtros de venda automática/);
});
test('Insufficient forge materials never consume resources or create a drop',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=[...SLOTS];g.village.forge=5;onAction('forgeSlot','set01','Anel');return {resources:g.village.forge,inv:g.inventory.length};})()`);
 assert.equal(x.resources,5);assert.equal(x.inv,0);
});
test('Normal auto-sale filters still apply to forged common-rarity items',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set01=[...SLOTS];g.village.forge=10;g.autoSellRarities=[0];onAction('forgeSlot','set01','Arma');return {materials:g.village.forge,items:g.inventory.length,sold:g.autoSellCount,banknotes:g.village.banknotes};})()`);
 assert.equal(x.materials,4);assert.equal(x.items,0);assert.equal(x.sold,1);assert.equal(x.banknotes,1);
});
test('Rare non-set names reflect the equipment category but do not change values or affixes',()=>{
 const r=lab();const names=r.run(`(()=>{Math.random=()=>.9;return SLOTS.map(slot=>{const x=giveGear(200,0,null,slot,3);return {slot:x.slot,name:x.name,rarity:x.rarity,affixes:x.affixes.length,quality:x.quality};});})()`);
 for(const a of names){assert.equal(a.rarity,3);assert.equal(a.affixes,2);assert.ok(!a.name.includes(' '+a.slot) || a.slot==='Arma',JSON.stringify(a));}
 const targets=['Lâmina','Elmo','Couraça','Aura','Anel'];names.forEach((o,i)=>assert.ok(o.name.startsWith(targets[i]),o.name));
});
test('Inventory identifies set affiliation and unique rarity without inventing effects',()=>{
 const r=lab();const x=r.run(`(()=>{giveGear(90,0,'set01','Anel',3);gearCategory='Anel';const setPanel=gearPanel();g.inventory=[];g.equipped.Arma=null;giveGear(100,1,null,'Arma',5);gearCategory='Arma';const uniquePanel=gearPanel();return {setPanel,uniquePanel};})()`);
 assert.match(x.setPanel,/Conjunto:/);assert.match(x.setPanel,/1\/5 peças registradas/);
 assert.match(x.uniquePanel,/Item ÚNICO/);assert.match(x.uniquePanel,/nome não concede um poder oculto/);
});
test('Collection acquisition and designated forge stay compatible with pre-existing saves',()=>{
 const r=lab();const x=r.run(`(()=>{g.setParts.set03=[...SLOTS];g.village.forge=12;save(1,true);g=fresh();load(1);const recovered=g.setParts.set03.length;onAction('forgeSlot','set03','Aura');save(1,true);g=fresh();load(1);return {recovered,collection:g.setParts.set03.length,item:g.inventory.find(i=>i.setId==='set03')?.slot,resources:g.village.forge};})()`);
 assert.equal(x.recovered,5);assert.equal(x.collection,5);assert.equal(x.item,'Aura');assert.equal(x.resources,6);
});
test('Battle difficulty, loot probabilities, set multipliers and approved media remain unchanged',()=>{
 const r=lab();const x=r.run(`({chance:MONSTER_GEAR_CHANCE,odds:bossGearOdds(0,1),sets:D.sets.map(s=>[s.id,s.mult]),rarityRates:gearRates(0,1),forge:forgeCost(D.sets[0]),skillCount:D.skills.length})`);
 assert.equal(x.chance,.009);assert.equal(x.forge,1);assert.equal(x.skillCount,9);assert.equal(x.sets.length,16);assert.equal(x.sets[0][1],10);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [file,digest] of Object.entries(manifest))if(!['server/server.cjs','server/service.cjs'].includes(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),digest,file);
});
console.log(`R89 ${count}/${count} PASS`);
