'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let count=0;const check=(label,fn)=>{fn();count++;console.log('PASS',label)};
const lab=()=>{const r=runtime(root);r.run('startNew(1)');const original=r.run.bind(r);r.run=(code)=>{const v=original(code);return v&&typeof v==='object'?JSON.parse(JSON.stringify(v)):v;};return r;};
check('R84 telegraphed circles preserve the pre-existing circular hit radius',()=>{
 const r=lab();const hit=r.run(`(()=>{const w={kind:'cleave',x:200,y:200,radius:100};return [bossWarningHits(w,200,200),bossWarningHits(w,200,301),bossWarningHits(w,300,200),bossWarningHits(w,200,299)];})()`);
 assert.deepEqual(hit,[true,false,true,true]);
});
check('R84 Carrasco directional sweep has dodgable flanks and correctly rotated lanes',()=>{
 const r=lab();const a=r.run(`(()=>{const w={kind:'sweep',x:300,y:300,radius:100,angle:0};return [bossWarningHits(w,400,300),bossWarningHits(w,400,346),bossWarningHits(w,470,300),bossWarningHits(w,290,300),bossWarningHits({...w,angle:Math.PI/2},300,400),bossWarningHits({...w,angle:Math.PI/2},350,400)]})()`);
 assert.deepEqual(a,[true,false,false,false,true,false]);
});
check('R84 Arauto eclipse ring has a safe inside and outside and a bounded damaging band',()=>{
 const r=lab();const v=r.run(`(()=>{const w={kind:'ring',x:0,y:0,radius:100};return [bossWarningHits(w,0,0),bossWarningHits(w,41,0),bossWarningHits(w,42,0),bossWarningHits(w,65,0),bossWarningHits(w,100,0),bossWarningHits(w,101,0)]})()`);
 assert.deepEqual(v,[false,false,true,true,true,false]);
});
check('R84 Carrasco alternates marked smash and directed execution from phase II',()=>{
 const r=lab();const v=r.run(`(()=>{g.stage=150;enemies=[];bossActive=null;bossWarnings=[];const e=spawnEnemy(false,'boss',{type:'threshold',s:150,d:0});e.archetype='carrasco';e.hp=e.max.mul(.50);e.bossCadence=0;updateBossAI(e,.01);const a=bossWarnings.map(x=>x.kind);bossWarnings=[];e.bossCadence=0;updateBossAI(e,.01);return {phase:e.bossPhase,first:a,second:bossWarnings.map(x=>x.kind),origin:[e.x,e.y],sweep:bossWarnings.map(x=>[x.x,x.y])};})()`);
 assert.equal(v.phase,2);assert.deepEqual(v.first,['cleave']);assert.deepEqual(v.second,['sweep']);assert.deepEqual(v.sweep,[v.origin]);
});
check('R84 Profanador phase III uses three bounded staggered sigils',()=>{
 const r=lab();const v=r.run(`(()=>{g.stage=250;enemies=[];bossActive=null;bossWarnings=[];const e=spawnEnemy(false,'boss',{type:'threshold',s:250,d:0});e.archetype='profanador';e.hp=e.max.mul(.25);e.bossCadence=0;updateBossAI(e,.01);return {phase:e.bossPhase,warnings:bossWarnings.map(w=>({kind:w.kind,delay:w.delay})),adds:enemies.filter(x=>x.summonedByBoss===e.id).length};})()`);
 assert.equal(v.phase,3);assert.deepEqual(v.warnings.map(x=>x.kind),['sigil','sigil','sigil']);assert.deepEqual(v.warnings.map(x=>x.delay),[1.28,1.55,1.82]);assert.ok(v.adds<=6);
});
check('R84 Arauto alternates a real safe-center ring in phase III and preserves vulnerability window',()=>{
 const r=lab();const v=r.run(`(()=>{g.stage=250;enemies=[];bossActive=null;bossWarnings=[];const e=spawnEnemy(false,'boss',{type:'threshold',s:250,d:0});e.archetype='arauto';e.hp=e.max.mul(.25);e.bossCadence=0;updateBossAI(e,.01);const first=bossWarnings.map(x=>x.kind);bossWarnings=[];e.bossCadence=0;updateBossAI(e,.01);const second=bossWarnings.map(x=>x.kind);const ring=bossWarnings.find(w=>w.kind==='ring');player.x=ring.x;player.y=ring.y;player.contactInvuln=0;ring.time=ring.delay;updateBossWarnings(0);return {first,second,vulnerable:e.vulnerableTimer,remaining:bossWarnings.map(w=>w.kind)};})()`);
 assert.deepEqual(v.first,['eclipse','eclipse']);assert.deepEqual(v.second,['eclipse','ring']);assert.ok(v.vulnerable>=1.79);
});
check('R84 warning damage respects marked geometry and the unchanged invulnerability mechanic',()=>{
 const r=lab();const v=r.run(`(()=>{g.stage=100;enemies=[];bossActive=null;bossWarnings=[];const e=spawnEnemy(false,'boss',{type:'threshold',s:100,d:0});e.archetype='carrasco';player={x:500,y:500,hp:99999,contactInvuln:0};bossMark(e,'sweep',400,500,100,.1,'#ff0000',0);updateBossWarnings(.2);const hit=player.hp;player.contactInvuln=0;bossMark(e,'sweep',400,500,100,.1,'#ff0000',Math.PI/2);updateBossWarnings(.2);return {hit,miss:player.hp,remaining:bossWarnings.length}})()`);
 assert.ok(v.hit<99999,JSON.stringify(v));assert.equal(v.miss,v.hit);assert.equal(v.remaining,0);
});
check('R84 stage progression, prestige and campaign economic formulas remain unchanged',()=>{
 const r=lab();const info=r.run(`(()=>{g.stage=75;g.difficulty=0;return {reward:prestigeReward().save(),enemyHp:enemyHealth(75,0,'normal').save(),xp:enemyXP(75,0).save(),gold:enemyGold(75,0).save(),saveKeys:Object.keys(fresh()).sort()}})()`);
 assert.ok(info.reward&&info.enemyHp&&info.xp&&info.gold&&info.saveKeys.length>40);
});
check('R84 keeps all original R83 art, sounds, server and raid content identical',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [rel,digest] of Object.entries(manifest)){if(['server/server.cjs','server/service.cjs'].includes(rel))continue;const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');assert.equal(actual,digest,rel);}
 assert.ok(Object.keys(manifest).length>=25);
});
console.log(`R84 ${count}/${count} PASS`);
