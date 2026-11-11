'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const runtime = require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let n=0; function test(name,fn){fn();++n;console.log('PASS R97:',name)}
const lab=()=>{const r=runtime(root);r.run('startNew(1);');return r};
test('Prioridade em chefe não ultrapassa UMA área de habilidade',()=>{
 const r=lab();const a=r.run(`(()=>{g.attackFocus='boss';player.x=560;player.y=330;enemies=[];const mk=(id,x,y,kind='normal')=>({id,x,y,kind,hp:B(10000),max:B(10000)});enemies.push(mk(1,470,300));bossActive=mk(9,750,320,'boss');enemies.push(bossActive);return r67Groups('grace',1,90).map(x=>x.id);})()`);
 assert.deepEqual(Array.from(a),[9]);
});
test('Prioridade em chefe reserva uma entre três áreas, sem gerar a quarta',()=>{
 const r=lab();const a=r.run(`(()=>{g.attackFocus='boss';player.x=560;player.y=330;enemies=[];const mk=(id,x,y,kind='normal')=>({id,x,y,kind,hp:B(10000),max:B(10000)});bossActive=mk(9,750,320,'boss');enemies.push(bossActive);enemies.push(mk(1,470,300));enemies.push(mk(2,560,510));enemies.push(mk(3,760,520));return r67Groups('holy_spear',3,90).map(x=>x.id);})()`);
 assert.equal(a[0],9);assert.ok(a.length<=3);
});
test('Chefes fora de alcance não recebem área reservada',()=>{
 const r=lab();const a=r.run(`(()=>{g.attackFocus='boss';player.x=560;player.y=330;enemies=[];const mk=(id,x,y,kind='normal')=>({id,x,y,kind,hp:B(10000),max:B(10000)});bossActive=mk(9,2300,320,'boss');enemies.push(bossActive);enemies.push(mk(1,470,300));return r67Groups('grace',1,90).map(x=>x.id);})()`);
 assert.deepEqual(Array.from(a),[1]);
});
test('Inventário sem filtros visuais, mantendo categorias e paginação',()=>{
 const r=lab();const a=r.run(`(()=>{const make=(id,slot,rarity)=>({id,name:'item'+id,slot,effect:'physical',value:.01,rarity,level:5,quality:5,difficulty:0,affixes:[]});g.inventory=Array.from({length:39},(_,i)=>make(i+1,'Arma',i%6));g.inventory.push(make(41,'Anel',5));gearCategory='Arma';gearPage=0;const before=JSON.stringify(g);const page1=gearPanel();onAction('gearPage','1','');const page2=gearPanel();return {page:gearPage,category:gearCategory,same:before===JSON.stringify(g),page1:page1.includes('Página 1 de 2'),page2:page2.includes('Página 2 de 2'),filter:page1.includes('data-action="gearViewFilter"'),count:gearSortedForSlot(g.inventory,'Arma').length,other:gearSortedForSlot(g.inventory,'Anel').length};})()`);
 assert.equal(a.page,1);assert.equal(a.category,'Arma');assert.ok(a.same&&a.page1&&a.page2);assert.equal(a.filter,false);assert.equal(a.count,39);assert.equal(a.other,1);
});
test('Remoção do filtro não altera recursos, save nem venda automática',()=>{
 const r=lab();const a=r.run(`(()=>{g.autoSellProtectUpgrades=true;g.autoSellRarities=[0,1];g.inventory=[{id:7,name:'Teste',slot:'Arma',effect:'physical',value:.1,rarity:0,level:1,quality:4,difficulty:0,affixes:[],favorite:true}];const before=JSON.stringify(g);const oldSell=g.autoSellCount;gearPanel();return {same:before===JSON.stringify(g),sell:g.autoSellCount===oldSell,protect:g.autoSellProtectUpgrades,rarities:g.autoSellRarities}})()`);
 assert.ok(a.same&&a.sell&&a.protect);assert.deepEqual(Array.from(a.rarities),[0,1]);
});
test('Alterações de código se restringem à UI do inventário e ao limite de áreas',()=>{
 const game=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
 const combat=fs.readFileSync(path.join(root,'src/r67-combat.js'),'utf8');
 assert.doesNotMatch(game,/GEAR_VIEW_FILTERS|gearViewFilter|gearFilteredForSlot/);
 assert.match(combat,/if\(selected\.length>=count\)break/);
 assert.match(game,/function gearCompareSwap/);
 assert.match(game,/gearToggleAutoProtect/);
});
console.log(`R97 ${n}/${n} PASS`);
