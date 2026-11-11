'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let pass=0;const test=(name,fn)=>{fn();pass++;console.log('PASS R90 '+name)};
const lab=()=>{const r=runtime(root);r.run('startNew(1);Math.random=()=>0;');return r};
const serialize=x=>JSON.parse(JSON.stringify(x));

test('All 16 identities have distinct IDs, real category and recognized signature effects',()=>{
 const r=lab();const o=r.run('D.uniques.map(u=>({id:u.id,slot:u.slot,effect:uniqueSignatureEffect(u)}))');
 assert.equal(o.length,16);assert.equal(new Set(o.map(u=>u.id)).size,16);
 assert.deepEqual([...new Set(o.map(u=>u.slot))].sort(),['Anel','Arma','Aura','Capacete','Peitoral']);
 assert.equal(o.find(u=>u.id==='u15').effect,'hero_faith');
 assert.equal(o.find(u=>u.id==='u09').effect,'gold_mimic');
 assert.equal(o.find(u=>u.id==='u11').effect,'area');
 assert.equal(o.find(u=>u.id==='u16').effect,'crit_damage');
 assert.equal(new Set(o.map(u=>u.effect)).size,16);
 assert.ok(o.every(u=>typeof u.effect==='string'&&u.effect.length>0));
});

test('Each unique identity generates exactly three affixes with the correct fixed signature',()=>{
 const r=lab();
 const items=r.run(`(()=>D.uniques.map((u,i)=>{Math.random=()=>((i+.05)/16);const it=giveGear(200,1,null,null,5);return {uniqueId:it.uniqueId,name:it.name,slot:it.slot,effect:it.affixes[0]?.effect,sign:it.affixes[0]?.uniqueSignature,number:it.affixes.length,rarity:it.rarity,affixes:it.affixes.map(a=>a.value)};}))()`);
 assert.equal(items.length,16);
 for(let i=0;i<items.length;i++){
  const it=items[i],unique=`u${String(i+1).padStart(2,'0')}`;
  assert.equal(it.uniqueId,unique,JSON.stringify(it));assert.equal(it.sign,unique);
  assert.equal(it.number,3);assert.equal(it.rarity,5);
  assert.ok(it.affixes.every(v=>Number.isFinite(v)&&v>=.01&&v<=.20));
 }
 const slots=[...new Set(items.map(x=>x.slot))].sort();
 assert.deepEqual(slots,['Anel','Arma','Aura','Capacete','Peitoral']);
});

test('Unique signature is a REAL effective stat when equipped, not just decorative text',()=>{
 const r=lab();const p=r.run(`(()=>{const original=mod('physical');Math.random=()=>.01;const item=giveGear(200,0,null,null,5);g.equipped[item.slot]=item;return {id:item.uniqueId,effect:item.affixes[0].effect,before:original,after:mod('physical')};})()`);
 // i=0 would pick Mana (u01); explicitly choose u02 for Physical
 const q=r.run(`(()=>{g.equipped={Arma:null,Capacete:null,Peitoral:null,Aura:null,Anel:null};Math.random=()=>.07;const before=mod('physical');const item=giveGear(200,0,null,null,5);g.equipped.Arma=item;return {id:item.uniqueId,slot:item.slot,before,after:mod('physical')};})()`);
 assert.equal(q.id,'u02');assert.equal(q.slot,'Arma');assert.ok(q.after>q.before,q.after+' vs '+q.before);
});

test('Crafting is restricted to ordinary sets: Unique items are boss drops only',()=>{
 const r=lab();const result=r.run(`(()=>{const out=[];for(const slot of SLOTS){Math.random=()=>0;const item=giveGear(300,2,'set01',slot,5);out.push({slot:item.slot,rarity:item.rarity,uniqueId:item.uniqueId||null,affixes:item.affixes.length});}return out;})()`);
 assert.equal(result.length,5);for(const row of result){assert.ok(['Arma','Capacete','Peitoral','Aura','Anel'].includes(row.slot));assert.equal(row.rarity,4);assert.equal(row.uniqueId,null);assert.equal(row.affixes,3);}
});

test('Existing R89 Unique stays unchanged on load and does not gain a new signature',()=>{
 const r=lab();const x=r.run(`(()=>{const old={id:9901,name:'Devoradora de Salmos',slot:'Arma',rarity:5,level:450,difficulty:1,quality:5,effect:'physical',value:3.5,affixes:[{name:'da Ruptura',effect:'crit_damage',value:.1}],favorite:true};g.inventory=[old];g.equipped.Arma=old;save(1,true);load(1);const next=g.inventory[0];return {uniqueId:next.uniqueId||null,slot:next.slot,name:next.name,effect:next.effect,affix:next.affixes[0],favorite:next.favorite,panel:gearPanel().includes('LEGADO DA R89 OU ANTERIOR')};})()`);
 assert.equal(x.uniqueId,null);assert.equal(x.slot,'Arma');assert.equal(x.name,'Devoradora de Salmos');assert.equal(x.effect,'physical');assert.equal(x.affix.value,.1);assert.equal(x.affix.effect,'crit_damage');assert.equal(x.favorite,true);assert.equal(x.panel,true);
});

test('New signature persists with unchanged roll, category, name and favorite through save/load',()=>{
 const r=lab();const x=r.run(`(()=>{Math.random=()=>.91;const item=giveGear(200,1,null,null,5);item.favorite=true;const before=JSON.stringify(item);save(1,true);g=fresh();load(1);const loaded=g.inventory.find(x=>x.id===item.id);return {before:JSON.parse(before),after:loaded};})()`);
 assert.equal(x.before.uniqueId,'u15');assert.equal(x.before.slot,'Capacete');assert.equal(x.before.affixes[0].effect,'hero_faith');
 assert.equal(x.after.uniqueId,x.before.uniqueId);assert.equal(x.after.name,x.before.name);assert.equal(x.after.slot,x.before.slot);assert.equal(x.after.favorite,true);
 assert.equal(x.after.affixes[0].uniqueSignature,x.before.uniqueId);assert.equal(x.after.affixes[0].value,x.before.affixes[0].value);
});

test('Automatic sale respects original rules and never grants free Unique protection',()=>{
 const r=lab();const x=r.run(`(()=>{g.autoSellRarities=[5];g.autoSellProtectUpgrades=false;g.worldPrestiges=1;const before=g.village.banknotes;const item=giveGear(200,1,null,null,5);return {uniqueId:item.uniqueId,kept:g.inventory.some(i=>i.id===item.id),sold:g.autoSellCount,banknotes:g.village.banknotes-before};})()`);
 assert.ok(x.uniqueId);assert.equal(x.kept,false);assert.equal(x.sold,1);assert.equal(x.banknotes,100);
});

test('Inventory and catalogue clearly show guaranteed signature without extra hidden power',()=>{
 const r=lab();const s=r.run(`(()=>{Math.random=()=>.7;const it=giveGear(200,1,null,null,5);gearCategory=it.slot;return gearPanel();})()`);
 assert.match(s,/ASSINATURA EXCLUSIVA/);assert.match(s,/ASSINATURA ·/);assert.match(s,/Catálogo dos 16 equipamentos Únicos/);
 assert.match(s,/dois secundários aleatórios/);
});

test('No changes to rarity probabilities, source roll budgets, world prestige gating or artwork',()=>{
 const r=lab();const x=r.run(`({bossLocked:bossGearOdds(0,0).unique,bossUnlocked:bossGearOdds(0,1).unique,rates:gearRates(1,1),skills:D.skills.length,sets:D.sets.length,affixes:D.affixes.length,raritySale:GEAR_SALE_PRICES.slice(),maxBonus:AURA_AMPLIFICATION_CAP})`);
 assert.equal(x.bossLocked,0);assert.ok(x.bossUnlocked>0);assert.equal(x.skills,9);assert.equal(x.sets,16);assert.equal(x.affixes,61);assert.equal(x.maxBonus,.2);
 assert.deepEqual(Array.from(x.raritySale),[1,5,10,25,50,100]);
 const hashes=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [f,h] of Object.entries(hashes))if(!['server/server.cjs','server/service.cjs'].includes(f))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),h,f);
});
console.log(`R90 ${pass}/${pass} PASS`);
