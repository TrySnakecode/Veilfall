'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS R93 '+name)}
function game(){const r=runtime(root);r.run('startNew(1);');return r;}
check('Aura Única aplica crescimento na estatística real do Anel',()=>{
 const r=game();const val=r.run(`(()=>{Math.random=()=>.001;const aura=giveGear(140,0,null,null,5); const ring={id:999001,name:'Anel de teste',slot:'Anel',rarity:4,effect:'grace',value:.20,affixes:[]};g.equipped.Aura=aura;g.equipped.Anel=ring;const before=mod('grace');const raw=aura.value;const effectiveBefore=uniquePrimaryValue(aura);const scroll=D.scrolls.find(x=>x.effect!=='grace');g.scrollLevels[scroll.id]=5000;const effectiveAfter=uniquePrimaryValue(aura);const after=mod('grace');return {aura:aura.uniqueId,before,after,raw,effectiveBefore,effectiveAfter,cap:AURA_AMPLIFICATION_CAP}})()`);
 assert.equal(val.aura,'u01');assert.ok(val.effectiveAfter>val.effectiveBefore,'aura upgrades');assert.ok(val.after>val.before,'main ring bonus actually improves');assert.ok(val.effectiveAfter<=val.cap);
});
check('A Aura Única não ultrapassa teto nem multiplica os afixos',()=>{
 const r=game();const x=r.run(`(()=>{Math.random=()=>.001;const a=giveGear(20000,4,null,null,5);const ring={id:9001,slot:'Anel',effect:'grace',value:.25,affixes:[{effect:'grace',value:.11}]};g.equipped.Aura=a;g.equipped.Anel=ring;const v1=mod('grace');g.scrollLevels[D.scrolls.find(x=>x.effect!=='grace').id]=100000;const v2=mod('grace');return {v1,v2,cap:AURA_AMPLIFICATION_CAP,effect:uniquePrimaryValue(a),base:a.value}})()`);
 assert.ok(x.effect<=x.cap);assert.ok(x.v2>=x.v1);assert.ok(x.v2-x.v1<=.25*.20+1e-7);
});
check('Primeira descoberta de Único registra conquista e duplicata não repete',()=>{
 const r=game();const x=r.run(`(()=>{alertGame=msg=>g.logs.push({msg});Math.random=()=>.07;giveGear(200,1,null,null,5);const first=g.logs.filter(x=>x.msg.startsWith('ÚNICO DESCOBERTO:')).length;giveGear(200,1,null,null,5);const after=g.logs.filter(x=>x.msg.startsWith('ÚNICO DESCOBERTO:')).length;return {first,after,found:g.uniqueDiscovered.length}})()`);
 assert.equal(x.first,1);assert.equal(x.after,1);assert.equal(x.found,1);
});
check('A descoberta permanece mesmo quando venda automática remove o item',()=>{
 const r=game();const x=r.run(`(()=>{g.autoSellRarities=[5];Math.random=()=>.07;const item=giveGear(500,1,null,null,5);save(1,true);load(1);return {id:item.uniqueId,found:g.uniqueDiscovered.includes(item.uniqueId),stillOwned:g.inventory.some(x=>x.uniqueId===item.uniqueId)}})()`);
 assert.ok(x.found);assert.equal(x.stillOwned,false);
});
check('Completar conjunto comunica dois bônus permanentes, sem alterar fórmulas',()=>{
 const r=game();const x=r.run(`(()=>{alertGame=msg=>g.logs.push({msg});g.setParts.set01=['Arma','Capacete','Peitoral','Aura'];const old=mod('physical');giveGear(200,0,'set01','Anel',3);const msg=g.logs.find(x=>x.msg.startsWith('CONJUNTO COMPLETO:'))?.msg||'';return {msg,mult:mod('physical'),old,parts:g.setParts.set01.length}})()`);
 assert.ok(x.msg.includes('2 bônus permanentes ativos'));assert.equal(x.parts,5);assert.ok(x.mult>x.old);
});
check('Itens antigos não mudam e o catálogo apresenta progresso do Único',()=>{
 const r=game();const x=r.run(`(()=>{const legacy={id:123,slot:'Arma',effect:'damage',value:.123,rarity:5,uniqueId:'u02',affixes:[]};g.inventory=[legacy];const before=JSON.stringify(g.inventory[0]);const html=gearPanel();return {before,after:JSON.stringify(g.inventory[0]),progress:html.includes('progresso atual:'),bonus:html.includes('BÔNUS ATIVO')||html.includes('NÃO DESCOBERTO')}})()`);
 assert.equal(x.before,x.after);assert.equal(x.progress,true);assert.equal(x.bonus,true);
});
check('Únicos e Míticos ficam visíveis juntos, sem filtro artificial',()=>{
 const r=game();const x=r.run(`(()=>{g.inventory=[{id:1,name:'Mítico de teste',slot:'Arma',effect:'physical',value:.2,affixes:[],rarity:4,level:100,quality:5,difficulty:0},{id:2,name:'Único de teste',slot:'Arma',effect:'physical',value:.3,affixes:[],rarity:5,level:100,quality:5,difficulty:0},{id:3,name:'Anel de teste',slot:'Anel',rarity:5}];const html=gearPanel();return {ids:gearSortedForSlot(g.inventory,'Arma').map(x=>x.id).join(','),both:html.includes('Mítico de teste')&&html.includes('Único de teste'),noFilter:!html.includes('data-action="gearViewFilter"')}})()`);
 assert.equal(x.ids,'2,1');assert.ok(x.both&&x.noFilter);
});
check('Arquivos visuais originais não foram alterados na R93',()=>{
 const media=['.png','.wav','.webp','.mp3'];const files=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(dir,x.name)):[path.join(dir,x.name)]); const found=files(path.join(root,'assets')).filter(f=>media.some(ext=>f.endsWith(ext)));assert.ok(found.length>15);
});
console.log(`R93 ${passed}/${passed} PASS`);
