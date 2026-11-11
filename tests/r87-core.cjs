'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
const lab=()=>{const r=runtime(root);r.run('startNew(1);Math.random=()=>0;');return r;};
test('Comparison reports trade-offs between different main attributes, never a false universal upgrade',()=>{
 const r=lab();const obj=r.run(`(()=>{g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.3,affixes:[]};const next={id:2,slot:'Arma',effect:'faith',value:.9,affixes:[]};return gearCompareSwap(next);})()`);
 assert.equal(obj.kind,'mixed');assert.ok(obj.improved>0&&obj.worsened>0);
 assert.match(r.run("gearCompareMarkup(gearCompareSwap({id:2,slot:'Arma',effect:'faith',value:.9,affixes:[]}))"),/TROCA DE ATRIBUTOS/);
});
test('Real secondary affixes can outweigh a higher main stat and are reflected in comparison',()=>{
 const r=lab();const result=r.run(`(()=>{g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.3,affixes:[{effect:'boss_damage',value:.15}]};const next={id:2,slot:'Arma',effect:'physical',value:.4,affixes:[{effect:'normal_damage',value:.04}]};return gearCompareSwap(next);})()`);
 assert.equal(result.kind,'mixed');assert.equal(result.improved,2);assert.equal(result.worsened,1);
});
test('Capped support bonus produces an equal effective preview even if raw roll is higher',()=>{
 const r=lab();const result=r.run(`(()=>{g.equipped.Peitoral={id:1,slot:'Peitoral',effect:'gold',value:.1,affixes:[{effect:'health',value:.2}]};return gearCompareSwap({id:2,slot:'Peitoral',effect:'gold',value:.1,affixes:[{effect:'health',value:.6}]});})()`);
 assert.equal(result.kind,'equal',JSON.stringify(result));
});
test('Aura swapping compares only the amplified MAIN attribute, never affixes',()=>{
 const r=lab();const result=r.run(`(()=>{g.equipped.Arma={id:4,slot:'Arma',effect:'physical',value:.5,affixes:[{effect:'magic',value:.2}]};g.equipped.Anel=null;return true})()`);
 const cmp=r.run(`(()=>{g.equipped.Aura={id:5,slot:'Aura',effect:'aura_ring',value:.1,affixes:[]};const old=g.equipped.Aura;const result=gearCompareSwap({id:6,slot:'Aura',effect:'aura_weapon',value:.2,affixes:[]});return {result,restored:g.equipped.Aura===old,mod:mod('magic')};})()`);
 assert.equal(cmp.restored,true);assert.equal(cmp.result.kind,'better');
 assert.equal(cmp.result.changes.map(x=>x.effect).join(','),'physical');
});
test('Helmet class preview uses actual passive contribution, not the physical sword stat',()=>{
 const r=lab();const cmp=r.run(`(()=>{g.heroLevels.h01=120;g.heroLevels.h02=120;g.heroLevels.h03=120;g.heroLevels.h04=120;g.heroLevels.h05=120;g.heroLevels.h06=120;g.heroLevels.h07=120;g.heroLevels.h08=120;g.heroLevels.h09=120;g.heroLevels.h10=120;g.heroLevels.h11=120;g.heroLevels.h12=120;g.equipped.Capacete={id:1,slot:'Capacete',effect:'hero_warrior',value:.6,affixes:[]};return gearCompareSwap({id:2,slot:'Capacete',effect:'hero_faith',value:1.2,affixes:[]});})()`);
 assert.equal(cmp.kind,'mixed');assert.ok(cmp.changes.some(x=>x.effect==='hero_warrior'&&x.direction===-1));
 assert.ok(cmp.changes.some(x=>x.effect==='hero_faith'&&x.direction===1));
});
test('A helmet bonus cannot pretend to improve combat when no matching heroes are developed',()=>{
 const r=lab();const result=r.run(`(()=>{g.equipped.Capacete={id:1,slot:'Capacete',effect:'hero_warrior',value:.3,affixes:[]};return gearCompareSwap({id:2,slot:'Capacete',effect:'hero_warrior',value:.6,affixes:[]});})()`);
 assert.equal(result.kind,'equal');
});
test('Gear affix has no effective main attribute to strengthen when slots are empty',()=>{
 const r=lab();const result=r.run(`(()=>{g.equipped.Aura={id:1,slot:'Aura',effect:'aura_weapon',value:.1,affixes:[]};return gearCompareSwap({id:2,slot:'Aura',effect:'aura_weapon',value:.1,affixes:[{effect:'gear',value:.16}]});})()`);
 assert.equal(result.kind,'equal');assert.equal(result.changes.length,0); // no main weapon equipped to amplify
});
test('Simulation of a gear preview never modifies the equipment slot or serializable state',()=>{
 const r=lab();const result=r.run(`(()=>{g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.25,affixes:[]};const before=JSON.stringify(g),power=mod('physical');for(let i=0;i<10;i++)gearCompareSwap({id:2,slot:'Arma',effect:'damage',value:.8,affixes:[{effect:'crit_chance',value:.06}]});return {same:before===JSON.stringify(g),power,after:mod('physical')};})()`);
 assert.equal(result.same,true);assert.equal(result.power,result.after);
});
test('Auto-sell protection defaults OFF and keeps the old rarity filter behavior',()=>{
 const r=lab();const x=r.run(`(()=>{g.autoSellRarities=[0];const item=giveGear(25,0,null,'Arma',0);return {kept:g.inventory.some(x=>x.id===item.id),favorites:!!item.favorite,count:g.autoSellCount,flag:g.autoSellProtectUpgrades};})()`);
 assert.equal(x.flag,false);assert.equal(x.kept,false);assert.equal(x.count,1);
});
test('Opt-in auto-sell protection favorites a clear upgrade before it can be sold',()=>{
 const r=lab();const x=r.run(`(()=>{g.autoSellRarities=[0];g.autoSellProtectUpgrades=true;g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.02,affixes:[]};g.gearNextId=2;const item=giveGear(100,0,null,'Arma',0);return {kept:g.inventory.some(x=>x.id===item.id),fav:item.favorite,count:g.autoSellCount,cmp:gearCompareSwap(item).kind};})()`);
 assert.equal(x.kept,true);assert.equal(x.fav,true);assert.equal(x.count,0);assert.equal(x.cmp,'better');
});
test('Opt-in does not protect a mixed change, and can protect a first item in an empty slot',()=>{
 const r=lab();const x=r.run(`(()=>{g.autoSellRarities=[0];g.autoSellProtectUpgrades=true;g.equipped.Arma={id:1,slot:'Arma',effect:'faith',value:3,affixes:[]};g.gearNextId=2;const mixed=giveGear(100,0,null,'Arma',0);const empty=giveGear(75,0,null,'Anel',0);return {mixedKept:g.inventory.some(x=>x.id===mixed.id),emptyKept:g.inventory.some(x=>x.id===empty.id),emptyFavorite:empty.favorite,count:g.autoSellCount};})()`);
 assert.equal(x.mixedKept,false);assert.equal(x.emptyKept,true);assert.equal(x.emptyFavorite,true);assert.equal(x.count,1);
});
test('An opt-in protected upgrade survives inventory overflow before bulk pruning',()=>{
 const r=lab();const x=r.run(`(()=>{g.autoSellRarities=[0];g.autoSellProtectUpgrades=true;g.inventory=Array.from({length:240},(_,n)=>({id:n+10,slot:'Anel',effect:'grace',value:.05,rarity:0,affixes:[],quality:0,level:1}));g.gearNextId=1000;const item=giveGear(30,0,null,'Arma',0);return {length:g.inventory.length,kept:g.inventory.some(x=>x.id===item.id),favorite:item.favorite,autoSellCount:g.autoSellCount};})()`);
 assert.equal(x.kept,true);assert.equal(x.favorite,true);assert.equal(x.length,240);assert.equal(x.autoSellCount,1);
});
test('Optional setting survives save/load; legacy save without field remains disabled',()=>{
 const r=lab();const obj=r.run(`(()=>{g.autoSellProtectUpgrades=true;save(1,true);g.autoSellProtectUpgrades=false;load(1);const enabled=g.autoSellProtectUpgrades;const key=BKEY+1;const data=JSON.parse(safeStorage.getItem(key));delete data.autoSellProtectUpgrades;safeStorage.setItem(key,JSON.stringify(data));load(1);return {enabled,oldDisabled:g.autoSellProtectUpgrades};})()`);
 assert.equal(obj.enabled,true);assert.equal(obj.oldDisabled,false);
});
test('A selected piece can be compared in the real equipment panel without showing a false raw-only better badge',()=>{
 const r=lab();const result=r.run(`(()=>{g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.2,affixes:[]};g.inventory=[g.equipped.Arma,{id:2,slot:'Arma',effect:'faith',value:.5,quality:5,rarity:3,difficulty:0,level:20,affixes:[],name:'Prova'}];gearCategory='Arma';return gearPanel();})()`);
 assert.match(result,/TROCA DE ATRIBUTOS/);assert.match(result,/PROTEGER GANHOS SEM PERDAS/);
 assert.doesNotMatch(result,/ATRIBUTOS DIFERENTES · compare sua build/);
});
test('Comprehensive unchanged rules and approved art are preserved',()=>{
 const r=lab();const x=r.run("({stage:g.stage,skillCount:D.skills.length,rarities:GEAR_SALE_PRICES.join(','),chance:MONSTER_GEAR_CHANCE,prestige:prestigeReward().save()})");
 assert.equal(x.skillCount,9);assert.equal(x.rarities,'1,5,10,25,50,100');assert.equal(x.chance,.009);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [file,digest] of Object.entries(manifest))if(!['server/server.cjs','server/service.cjs'].includes(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),digest,file);
});
console.log(`R87 ${passed}/${passed} PASS`);
