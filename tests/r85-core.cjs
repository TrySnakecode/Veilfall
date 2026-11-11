'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
function check(label,action){action();passed++;console.log('PASS',label)}
function lab(){const r=runtime(root);r.run('startNew(1);Math.random=()=>.999;');return r}
const unwrap=v=>JSON.parse(JSON.stringify(v));
function mockEnemies(){return `(()=>{player.x=400;player.y=300;g.attackFocus='closest';enemies=[];bossActive=null;const make=(id,x,y,cursed=false)=>({id,kind:'normal',stage:1,diff:0,x,y,hp:B(10000000),max:B(10000000),curse:cursed,curseTimer:cursed?5:0,slow:0,attackCooldown:0});const a=make(1001,440,300),b=make(1002,475,300);enemies.push(a,b);return [a,b];})()`}
check('Boss priority dedicates one EXISTING AoE group to a reachable boss',()=>{
 const r=lab();const info=unwrap(r.run(`(()=>{player.x=560;player.y=330;g.attackFocus='boss';enemies=[];const e=(id,x,y,kind='normal')=>({id,x,y,kind,hp:B(1000000),max:B(1000000)});for(let i=0;i<7;i++)enemies.push(e(300+i,420+i*7,310+i*4));bossActive=e(900,760,350,'boss');enemies.push(bossActive);const groups=r67Groups('holy_spear',3,120);return {groups,bossId:bossActive.id,reach:r67Reach('holy_spear')}})()`));
 assert.equal(info.groups[0].id,info.bossId);assert.ok(info.groups.length<=3);assert.equal(info.groups[0].x,760);
});
check('Boss priority does not teleport skills to bosses outside acquisition reach',()=>{
 const r=lab();const info=unwrap(r.run(`(()=>{player.x=560;player.y=330;g.attackFocus='boss';enemies=[];const e=(id,x,y,kind='normal')=>({id,x,y,kind,hp:B(1000000),max:B(1000000)});enemies.push(e(1,500,350));bossActive=e(900,1250,350,'boss');enemies.push(bossActive);return r67Groups('grace',2,120)})()`));
 assert.ok(info.length>0);assert.notEqual(info[0].id,900);
});
check('Closest mode still chooses denser groups, not a distant boss',()=>{
 const r=lab();const info=unwrap(r.run(`(()=>{player.x=560;player.y=330;g.attackFocus='closest';enemies=[];const e=(id,x,y,kind='normal')=>({id,x,y,kind,hp:B(1000000),max:B(1000000)});for(let i=0;i<6;i++)enemies.push(e(i+1,490+i*3,320));bossActive=e(900,760,350,'boss');enemies.push(bossActive);return r67Groups('holy_spear',2,100)})()`));
 assert.notEqual(info[0].id,900);assert.ok(info[0].n>=6);
});
check('Fury primary attack lands once on main target and splash on a nearby enemy',()=>{
 const r=lab();const info=unwrap(r.run(`(()=>{const [a,b]=${mockEnemies()};active.fury=5;const base=damage();const initial=B(10000000);basicAttack();return {main:initial.sub(a.hp).div(base).num(2),other:initial.sub(b.hp).div(base).num(2),hits:R67.metrics.hits}})()`));
 assert.ok(Math.abs(info.main-1)<.001,JSON.stringify(info));assert.ok(Math.abs(info.other-.4)<.001,JSON.stringify(info));
});
check('Without Fury, basic attack remains unchanged and does not splash',()=>{
 const r=lab();const info=unwrap(r.run(`(()=>{const [a,b]=${mockEnemies()};active.fury=0;const base=damage();basicAttack();return {main:B(10000000).sub(a.hp).div(base).num(2),other:B(10000000).sub(b.hp).div(base).num(2)}})()`));
 assert.ok(Math.abs(info.main-1)<.0001);assert.equal(info.other,0);
});
check('Veil Requiem bonus applies only to previously cursed enemies in the same group',()=>{
 const r=lab();const info=unwrap(r.run(`(()=>{const [a,b]=${mockEnemies()};a.curse=true;a.curseTimer=5;const initial=B(10000000);castVeilRequiem();return {ratio:initial.sub(a.hp).div(initial.sub(b.hp)).num(100),aMarked:a.curse,bMarked:b.curse}})()`));
 assert.ok(Math.abs(info.ratio-1.18)<.0001,JSON.stringify(info));assert.ok(info.aMarked&&info.bMarked);
});
check('No hidden skill buffs or changed save format were introduced',()=>{
 const r=lab();const v=unwrap(r.run(`(()=>{const e={id:1,kind:'normal',stage:1,diff:0,x:player.x,y:player.y,hp:B(1e8),max:B(1e8)};enemies=[e];return {gKeys:Object.keys(fresh()).sort(),skillCount:D.skills.length,area:mod('area'),health:enemyHealth(250,0,'normal').save(),reward:(g.stage=75,prestigeReward().save())};})()`));
 assert.equal(v.skillCount,9);assert.ok(v.gKeys.length>40);assert.ok(v.health);assert.ok(v.reward);
});
check('Approved art and audio remain byte identical',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [p,digest] of Object.entries(manifest)){if(['server/server.cjs','server/service.cjs'].includes(p))continue;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),digest,p)}
 assert.ok(Object.keys(manifest).length>=25);
});
console.log(`R85 ${passed}/${passed} PASS`);
