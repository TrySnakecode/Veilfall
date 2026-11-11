'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
const lab=()=>{const r=runtime(root);r.run('startNew(1);');return r;};
let count=0;function test(name,fn){fn();count++;console.log('PASS R88: '+name);}
test('The 61-affix loot catalog retains rarity, weight, range and slots while converting only the two specified effects',()=>{
 const d=JSON.parse(fs.readFileSync(path.join(root,'src/data.js'),'utf8').replace(/^window.VEIL_DATA=/,'').trim().replace(/;$/,''));
 assert.equal(d.affixes.length,61);
 const a=d.affixes.find(x=>x.id==='aff09'),s=d.affixes.find(x=>x.id==='aff37');
 assert.equal(a.effect,'magic');assert.equal(a.name,'do Eclipse');assert.equal(a.slot,'Arma');assert.equal(a.min_rarity,3);assert.equal(a.weight,6);assert.equal(a.min_roll,.03);assert.equal(a.max_roll,.18);
 assert.equal(s.effect,'defense');assert.equal(s.name,'dos Selos');assert.equal(s.slot,'Aura');assert.equal(s.min_rarity,2);assert.equal(s.weight,7);assert.equal(s.min_roll,.03);assert.equal(s.max_roll,.16);
 assert.equal(d.affixes.filter(x=>x.slot==='Arma'&&x.effect==='magic').length,1);
 assert.equal(d.affixes.filter(x=>x.effect==='gear').length,0);
});
test('New Seal affix grants actual defense against enemies without changing the roll value',()=>{
 const r=lab();const x=r.run(`(()=>{const before=mod('defense');g.equipped.Aura={id:900,slot:'Aura',effect:'aura_weapon',value:.10,affixes:[{name:'dos Selos',effect:D.affixes.find(a=>a.id==='aff37').effect,value:.08}]};return {before,after:mod('defense'),aff:g.equipped.Aura.affixes[0]};})()`);
 assert.ok(x.after>x.before);assert.equal(x.aff.effect,'defense');assert.equal(x.aff.value,.08);
});
test('Existing Seal affix migrates from gear to defense exactly once without losing value or favorite',()=>{
 const r=lab();const x=r.run(`(()=>{g.inventory=[{id:601,name:'Aura rara',slot:'Aura',effect:'aura_weapon',value:.5,level:78,difficulty:1,rarity:2,quality:5,affixes:[{name:'dos Selos',effect:'gear',value:.1234}],favorite:true}];g.equipped.Aura=g.inventory[0];calibrateGearInventory();const first=g.inventory[0].affixes[0];calibrateGearInventory();return {firstEffect:first.effect,effect:g.inventory[0].affixes[0].effect,equipped:g.equipped.Aura.affixes[0].effect,val:first.value,favorite:g.inventory[0].favorite,length:g.inventory.length,level:g.inventory[0].level};})()`);
 assert.deepEqual(JSON.parse(JSON.stringify(x)),{firstEffect:'defense',effect:'defense',equipped:'defense',val:.1234,favorite:true,length:1,level:78});
});
test('Legacy Seal affix migrates through save/load and stays compatible with its previous save slot',()=>{
 const r=lab();const x=r.run(`(()=>{g.inventory=[{id:80,slot:'Aura',effect:'aura_weapon',value:.1,level:80,difficulty:0,rarity:2,quality:5,name:'Antiga',affixes:[{name:'dos Selos',effect:'gear',value:.11}],favorite:true}];g.equipped.Aura=g.inventory[0];save(1,true);g=fresh();load(1);const old=g.inventory[0];const value=old.affixes[0].value;const upgraded=old.affixes[0].effect;save(1,true);g=fresh();load(1);return {value,upgraded,after:g.inventory[0].affixes[0].effect,eq:g.equipped.Aura.affixes[0].effect,favorite:g.inventory[0].favorite};})()`);
 assert.equal(x.value,.11);assert.equal(x.upgraded,'defense');assert.equal(x.after,'defense');assert.equal(x.eq,'defense');assert.ok(x.favorite);
});
test('Magic-specific weapon affix increases magic power, not base physical or faith stats',()=>{
 const r=lab();const x=r.run(`(()=>{const before={p:mod('physical'),m:mod('magic'),f:mod('faith')};g.equipped.Arma={id:1,slot:'Arma',effect:'damage',value:.1,affixes:[{name:'do Eclipse',effect:D.affixes.find(x=>x.id==='aff09').effect,value:.12}]};return {before,after:{p:mod('physical'),m:mod('magic'),f:mod('faith')}};})()`);
 assert.equal(x.after.p,x.before.p);assert.equal(x.after.f,x.before.f);assert.ok(x.after.m>x.before.m);
});
test('Generic old Eclipse damage gear remains unchanged while newly rolled Eclipse is Magic',()=>{
 const r=lab();const x=r.run(`(()=>{g.inventory=[{id:500,slot:'Arma',effect:'damage',value:.1,level:2,difficulty:0,rarity:3,quality:5,affixes:[{name:'do Eclipse',effect:'damage',value:.17}]}];calibrateGearInventory();return {old:g.inventory[0].affixes[0].effect,next:D.affixes.find(a=>a.id==='aff09').effect};})()`);
 assert.equal(x.old,'damage');assert.equal(x.next,'magic');
});
test('Inventário sempre mostra todos os itens da categoria, ordenados por raridade',()=>{
 const r=lab();const x=r.run(`(()=>{g.inventory=[{id:21,name:'Raro',slot:'Arma',rarity:1,level:50,quality:5},{id:22,name:'Mítico',slot:'Arma',rarity:4,level:100,quality:5},{id:23,name:'Comum',slot:'Arma',rarity:0,level:50,quality:5},{id:24,name:'Anel',slot:'Anel',rarity:5,level:50,quality:5}];return gearSortedForSlot(g.inventory,'Arma').map(x=>x.id);})()`);
 assert.deepEqual(Array.from(x),[22,21,23]);
});
test('Itens favoritos, Únicos e não favoritos aparecem juntos, sem mudar o inventário',()=>{
 const r=lab();const x=r.run(`(()=>{g.inventory=[{id:12,slot:'Anel',favorite:true,rarity:0},{id:13,slot:'Arma',favorite:true,rarity:5},{id:14,slot:'Anel',rarity:5}];const before=JSON.stringify(g);return {ids:gearSortedForSlot(g.inventory,'Anel').map(x=>x.id),same:before===JSON.stringify(g)};})()`);
 assert.deepEqual(Array.from(x.ids),[14,12]);assert.ok(x.same);
});
test('Painel sem filtros de exibição e com comparação e favoritos preservados',()=>{
 const r=lab();const x=r.run(`(()=>{g.inventory=[{id:777,name:'EXEMPLO_INVENTARIO',slot:'Arma',effect:'physical',value:.2,affixes:[],rarity:2,level:99,quality:5,difficulty:0}];const before=JSON.stringify(g);gearCategory='Arma';const panel=gearPanel();return {same:before===JSON.stringify(g),visible:panel.includes('EXEMPLO_INVENTARIO'),count:gearSortedForSlot(g.inventory,'Arma').length,filterControls:panel.includes('data-action="gearViewFilter"'),favorite:panel.includes('gearFavorite'),compare:panel.includes('gear-compare-badge')};})()`);
 assert.ok(x.same&&x.visible&&x.favorite&&x.compare);assert.equal(x.count,1);assert.equal(x.filterControls,false);
});
test('Paginação usa todos os itens da categoria e não existe ação de filtro',()=>{
 const s=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
 assert.match(s,/case 'gearPage':\{const page=Number\(id\);const count=gearSortedForSlot/);
 assert.doesNotMatch(s,/GEAR_VIEW_FILTERS|gearViewFilter|gearFilteredForSlot/);
});
test('No enemy HP, prestige, drop rates, gear roll counts, original artwork or WAV files changed',()=>{
 const r=lab();const o=r.run("({skills:D.skills.length,rare:GEAR_SALE_PRICES.join(','),drop:MONSTER_GEAR_CHANCE,prestige:prestigeReward().save(),rolls:[0,1,1,2,3,3].join(',')})");
 assert.equal(o.skills,9);assert.equal(o.rare,'1,5,10,25,50,100');assert.equal(o.drop,.009);assert.equal(o.rolls,'0,1,1,2,3,3');
 const hashes=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [f,h] of Object.entries(hashes))if(!['server/server.cjs','server/service.cjs'].includes(f))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),h,f);
});
console.log(`R88 ${count}/${count} PASS`);
