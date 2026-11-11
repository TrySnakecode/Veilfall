'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
function test(label,fn){fn();passed++;console.log('PASS R95',label)}
function lab(){const r=runtime(root);r.run('startNew(1)');return r}
const near=(a,b)=>Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b));
test('Sem fontes de gear, nenhuma força é injetada',()=>{
 const r=lab(),x=r.run("(()=>{g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.3,affixes:[]};return {mult:equipmentPrimaryMultiplier(),stat:mod('physical')}})()");
 assert.equal(x.mult,1);assert.ok(near(x.stat,1.3));
});
test('Pet, pergaminho, Talven e artefatos de gear funcionam individualmente',()=>{
 const r=lab(),x=r.run(`(()=>{g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.8,affixes:[]};let m=[];let before=mod('physical');for(const [key,id,lv] of [['petLevels','p31',8],['scrollLevels','s23',8],['heroLevels','h23',100],['artifactLevels','a081',10],['artifactLevels','a087',10]]){g[key][id]=lv;let after=mod('physical');m.push({key,id,after,increment:after-before});before=after;}return {m,factor:mod('gear'),physical:mod('physical')}})()`);
 for(const entry of x.m)assert.ok(entry.increment>0,JSON.stringify(entry));
 assert.ok(x.factor>1&&x.factor<=1.06+1e-12);assert.ok(x.physical>1.8);
});
test('Bônus limitado a 6%, sem alterar estatísticas sem peça equipada',()=>{
 const r=lab(),x=r.run(`(()=>{g.petLevels.p31=100000;g.scrollLevels.s23=100000;g.artifactLevels.a081=100000;let none=mod('physical');g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:5,affixes:[]};return {none,factor:mod('gear'),physical:mod('physical')}})()`);
 assert.ok(x.factor<=1.06+1e-12&&x.factor>1.05);assert.equal(x.none,1);assert.ok(near(x.physical,1+5*x.factor));
});
test('Afixos secundários não recebem amplificação de gear nem de Aura',()=>{
 const r=lab(),x=r.run(`(()=>{g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.5,affixes:[{effect:'faith',value:.35}]};g.equipped.Aura={id:2,slot:'Aura',effect:'aura_weapon',value:.2,affixes:[]};const old={physical:mod('physical'),faith:mod('faith')};g.petLevels.p31=100;return {old,physical:mod('physical'),faith:mod('faith'),factor:mod('gear')}})()`);
 assert.ok(x.physical>x.old.physical);assert.ok(near(x.faith,x.old.faith));
 assert.ok(near(x.physical,1+.5*1.2*x.factor));
});
test('Capacete: a potência afeta só o principal de heróis da classe',()=>{
 const r=lab(),x=r.run(`(()=>{g.heroLevels.h01=100;g.equipped.Capacete={id:1,slot:'Capacete',effect:'hero_warrior',value:.4,affixes:[{effect:'hero_warrior',value:.2}]};let before=helmetHeroFactor('warrior');g.scrollLevels.s23=60;return {before,after:helmetHeroFactor('warrior'),factor:mod('gear')}})()`);
 assert.ok(x.after>x.before);assert.ok(near(x.after,1+.4*x.factor+.2));
});
test('Comparação de peça com gear considera impacto no equipamento vestido',()=>{
 const r=lab(),x=r.run(`(()=>{g.equipped.Arma={id:1,slot:'Arma',effect:'physical',value:.5,affixes:[]};g.equipped.Anel={id:2,slot:'Anel',effect:'faith',value:.3,affixes:[]};g.equipped.Aura={id:3,slot:'Aura',effect:'aura_weapon',value:.1,affixes:[]};const before=JSON.stringify(g.equipped);const cmp=gearCompareSwap({id:4,slot:'Aura',effect:'aura_weapon',value:.1,affixes:[{effect:'gear',value:.5}]});return {kind:cmp.kind,changes:cmp.changes.filter(x=>x.direction>0).map(x=>x.effect),unchanged:JSON.stringify(g.equipped)===before};})()`);
 assert.equal(x.kind,'better');assert.ok(x.changes.includes('physical'));assert.ok(x.changes.includes('faith'));assert.equal(x.unchanged,true);
});
test('Save legado mantém níveis e os novos efeitos sem criar nova versão de save',()=>{
 const r=lab(),x=r.run(`(()=>{g.petLevels.p31=65;g.scrollLevels.s23=12;g.heroLevels.h23=100;g.artifactLevels.a081=4;g.equipped.Arma={id:50,slot:'Arma',effect:'physical',value:.4,affixes:[]};g.petSelected=normalizePetSelection(g.petSelected);const before=mod('physical');save(1,true);const version=JSON.parse(safeStorage.getItem(BKEY+1)).version;g.petLevels.p31=0;g.scrollLevels.s23=0;load(1);return {version,pet:g.petLevels.p31,scroll:g.scrollLevels.s23,hero:g.heroLevels.h23,artifact:g.artifactLevels.a081,before,after:mod('physical')}})()`);
 assert.deepEqual({version:x.version,pet:x.pet,scroll:x.scroll,hero:x.hero,artifact:x.artifact},{version:1,pet:65,scroll:12,hero:100,artifact:4});assert.ok(near(x.before,x.after));
});
test('UI comunica limites reais sem induzir compra, e catálogo permanece imutável',()=>{
 const r=lab(),x=r.run(`(()=>{const a=JSON.stringify(g);const pet=petsPanel(),scroll=scrollsPanel();return {pet:pet.includes('até +6%'),scroll:scroll.includes('teto de +6%'),same:a===JSON.stringify(g),chances:[MONSTER_GEAR_CHANCE,LARGE_MONSTER_GEAR_CHANCE],n:[D.pets.length,D.scrolls.length,D.heroes.length,D.artifacts.length]}})()`);
 assert.equal(x.pet,true);assert.equal(x.scroll,true);assert.equal(x.same,true);assert.deepEqual(Array.from(x.chances),[.009,.018]);assert.deepEqual(Array.from(x.n),[30,32,32,106]);
});
test('Assets imutáveis são idênticos à direção artística aprovada',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [file,expected] of Object.entries(manifest))if(!['server/server.cjs','server/service.cjs'].includes(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),expected,file);
});
console.log(`R95 ${passed}/${passed} PASS`);
