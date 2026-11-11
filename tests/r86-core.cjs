'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
const test=(name,fn)=>{fn();passed++;console.log('PASS',name)};
const lab=()=>{const r=runtime(root);r.run('startNew(1);Math.random=()=>.999');return r;};
const enemiesSetup=`(()=>{player.x=400;player.y=300;player.mp=1000;enemies=[];bossActive=null;g.attackFocus='boss';const make=(id,x,y,kind='normal')=>({id,kind,stage:1,diff:0,x,y,hp:B(1e10),max:B(1e10),curse:false,curseTimer:0,slow:0});const mob=make(1,425,300),boss=make(2,900,300,'boss');enemies.push(mob,boss);bossActive=boss;return [mob,boss];})()`;
test('Boss outside melee range does not suppress basic attacks against adjacent hordes',()=>{
 const r=lab();const result=r.run(`(()=>{const [mob,boss]=${enemiesSetup};basicAttack();return {mob:B(1e10).sub(mob.hp).cmp(0)>0,boss:B(1e10).sub(boss.hp).cmp(0)>0}})()`);
 assert.equal(result.mob,true);assert.equal(result.boss,false);
});
test('Boss inside real melee reach is prioritized without extra attacks',()=>{
 const r=lab();const result=r.run(`(()=>{const [mob,boss]=${enemiesSetup};boss.x=428;basicAttack();return {mob:B(1e10).sub(mob.hp).cmp(0)>0,boss:B(1e10).sub(boss.hp).cmp(0)>0,swings:attackNum}})()`);
 assert.equal(result.mob,false);assert.equal(result.boss,true);assert.equal(result.swings,1);
});
test('Closest focus keeps hitting the nearest mob even when a boss is nearby',()=>{
 const r=lab();const result=r.run(`(()=>{const [mob,boss]=${enemiesSetup};boss.x=430;g.attackFocus='closest';basicAttack();return {mob:B(1e10).sub(mob.hp).cmp(0)>0,boss:B(1e10).sub(boss.hp).cmp(0)>0}})()`);
 assert.equal(result.mob,true);assert.equal(result.boss,false);
});
test('Automatic offense waits for a target within reach and consumes neither mana nor cooldown',()=>{
 const r=lab();const result=r.run(`(()=>{const [mob,boss]=${enemiesSetup};mob.x=1800;boss.x=2400;g.knightLevel=60000;g.equippedSkills=['holy_spear',null,null,null];cd={};active={};const before=player.mp,none=autoCastUnlockedSkills();return {before,after:player.mp,none,cd:cd.holy_spear||0}})()`);
 assert.equal(result.none,0);assert.equal(result.after,result.before);assert.equal(result.cd,0);
});
test('Automatic offense casts normally as soon as an enemy enters legitimate acquisition reach',()=>{
 const r=lab();const result=r.run(`(()=>{const [mob,boss]=${enemiesSetup};g.knightLevel=60000;g.equippedSkills=['holy_spear',null,null,null];cd={};active={};const before=player.mp,n=autoCastUnlockedSkills();return {n,spent:before-player.mp,cooldown:cd.holy_spear||0}})()`);
 assert.equal(result.n,1);assert.ok(result.spent>0);assert.ok(result.cooldown>0);
});
test('Support buffs preserve their normal automated casting when a monster is alive but out of range',()=>{
 const r=lab();const result=r.run(`(()=>{const [mob,boss]=${enemiesSetup};mob.x=1800;boss.x=2400;g.knightLevel=60000;g.equippedSkills=['fury',null,null,null];cd={};active={};return {n:autoCastUnlockedSkills(),fury:active.fury||0}})()`);
 assert.equal(result.n,1);assert.ok(result.fury>0);
});
test('Overlapping Veil Requiem circles never receive a curse bonus from a mark created earlier in the SAME cast',()=>{
 const r=lab();const result=r.run(`(()=>{const old=r67Groups;r67Groups=()=>[{x:400,y:300},{x:420,y:300}];g.knightLevel=1;player.x=400;player.y=300;const assess=previous=>{const e={id:9,kind:'normal',stage:1,diff:0,x:410,y:300,hp:B(1e6),max:B(1e6),curse:previous,curseTimer:previous?5:0};enemies=[e];castVeilRequiem();return {d:B(1e6).sub(e.hp).save(),marked:e.curse};};const no=assess(false),yes=assess(true);r67Groups=old;return {ratio:B(yes.d).div(B(no.d)).num(100),newMarked:no.marked};})()`);
 assert.ok(Math.abs(result.ratio-1.18)<.00001,JSON.stringify(result));assert.equal(result.newMarked,true);
});
test('Quest data, prestige formulas and unchanged art remain intact',()=>{
 const r=lab();const result=r.run(`(()=>{g.stage=75;return {reward:prestigeReward().save(),hp:enemyHealth(75,0,'normal').save(),skillCount:D.skills.length,saveKeys:Object.keys(fresh()).sort()}})()`);
 assert.equal(result.skillCount,9);assert.ok(result.reward);assert.ok(result.hp);assert.ok(result.saveKeys.length>40);
 const m=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [name,hash] of Object.entries(m))if(!['server/server.cjs','server/service.cjs'].includes(name))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'),hash,name);
 assert.ok(Object.keys(m).length>=25);
});
console.log(`R86 ${passed}/${passed} PASS`);
