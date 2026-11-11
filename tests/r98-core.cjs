'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS R98:',name)}
function lab(){const r=runtime(root);r.run('startNew(1);');return r}
const setup=`(()=>{
 enemies=[];bossActive=null;
 g.auto=false;g.autoHeroes=false;g.autoRetreat=false;g.attackFocus='boss';
 player.x=300;player.y=300;player.hp=maxHealth();
 timers.attack=999;timers.spawn=999;timers.fairy=999;timers.heroAuto=999;
 const mob=spawnEnemy(true,'skeleton');mob.x=320;mob.y=300;mob.attackCooldown=999;
 const boss=spawnEnemy(false,'boss',{type:'milestone',s:1,d:0});
 boss.x=800;boss.y=300;boss.bossCadence=999;
 return {mob,boss};})()`;

test('Perseguição prioriza chefe ativo mesmo quando monstro comum está mais perto',()=>{
 const r=lab(),v=r.run(`(()=>{const {mob,boss}=${setup};return {closest:getClosest(player.x,player.y,false)===mob,chase:r98PursuitTarget()===boss};})()`);
 assert.equal(v.closest,true);assert.equal(v.chase,true);
});
test('Foco em chefe muda a movimentação real, não apenas a barra ou habilidade',()=>{
 const r=lab(),v=r.run(`(()=>{const {mob,boss}=${setup};const old=player.x;updateCombat(.2);return {movement:player.x-old,alive:enemies.includes(boss),focus:g.attackFocus};})()`);
 assert.ok(v.movement>10&&v.movement<25,JSON.stringify(v));assert.equal(v.alive,true);assert.equal(v.focus,'boss');
});
test('Foco em mais próximo conserva perseguição do monstro mais próximo',()=>{
 const r=lab(),v=r.run(`(()=>{const {mob,boss}=${setup};g.attackFocus='closest';const start=player.x;updateCombat(.2);return {closest:r98PursuitTarget()===mob,movement:player.x-start};})()`);
 assert.equal(v.closest,true);assert.equal(v.movement,0);
});
test('Troca de foco em tempo real não requer reinicializar campanha',()=>{
 const r=lab(),v=r.run(`(()=>{const {mob,boss}=${setup};g.attackFocus='closest';const before=r98PursuitTarget()===mob;g.attackFocus='boss';const after=r98PursuitTarget()===boss;return {before,after,stage:g.stage};})()`);
 assert.equal(v.before,true);assert.equal(v.after,true);assert.equal(v.stage,1);
});
test('Guardião obrigatório de fase continua sendo perseguido mesmo no modo próximo',()=>{
 const r=lab(),v=r.run(`(()=>{const {mob,boss}=${setup};g.attackFocus='closest';boss.bossType='stage';return r98PursuitTarget()===boss;})()`);
 assert.equal(v,true);
});
test('Chefe removido ou sem vida não sequestra a perseguição automática',()=>{
 const r=lab(),v=r.run(`(()=>{const {mob,boss}=${setup};boss.hp=B(0);const dead=r98PursuitTarget()===mob;boss.hp=B(1);enemies=enemies.filter(e=>e!==boss);const removed=r98PursuitTarget()===mob;return {dead,removed};})()`);
 assert.equal(v.dead,true);assert.equal(v.removed,true);
});
test('Sem chefe ativo, o comportamento de aproximação anterior permanece',()=>{
 const r=lab(),v=r.run(`(()=>{const {mob,boss}=${setup};bossActive=null;return r98PursuitTarget()===mob;})()`);
 assert.equal(v,true);
});
test('Baixa vida: ameaça próxima provoca recuo mesmo que o alvo escolhido seja o chefe',()=>{
 const r=lab(),v=r.run(`(()=>{const {mob,boss}=${setup};mob.x=370;boss.x=900;g.autoRetreat=true;player.hp=maxHealth()*.2;const correctTarget=r98PursuitTarget()===boss;updateCombat(.1);return {correctTarget,retreating,destination:retreatDestination,nearest:getClosest(player.x,player.y,false)===mob};})()`);
 assert.equal(v.correctTarget,true);assert.equal(v.retreating,true,JSON.stringify(v));assert.ok(v.destination);assert.equal(v.nearest,true);
});
test('Movimentação manual mantém prioridade absoluta sobre a IA',()=>{
 const r=lab(),v=r.run(`(()=>{${setup};manual.a=true;const start=player.x;updateCombat(.1);manual.a=false;return {delta:player.x-start};})()`);
 assert.ok(v.delta < -10,JSON.stringify(v));
});
test('Inventário permanece sem faixa de filtros e sem alteração dos itens',()=>{
 const r=lab(),v=r.run(`(()=>{g.inventory=[{id:1,name:'Espada',slot:'Arma',rarity:4,effect:'physical',value:.5,affixes:[]}];const before=JSON.stringify(g),html=gearPanel();return {unmodified:before===JSON.stringify(g),noFilters:!html.includes('gearViewFilter'),preserved:html.includes('Espada')};})()`);
 assert.equal(v.unmodified,true);assert.equal(v.noFilters,true);assert.equal(v.preserved,true);
});
test('Sem alterações na economia, curva dos inimigos ou arquivos de arte',()=>{
 const r=lab(),v=r.run(`(()=>({chance:[MONSTER_GEAR_CHANCE,LARGE_MONSTER_GEAR_CHANCE],skills:D.skills.length,gearSlots:SLOTS.length,artifactCount:D.artifacts.length}))()`);
 assert.deepEqual(Array.from(v.chance),[.009,.018]);assert.equal(v.skills,9);assert.equal(v.gearSlots,5);assert.equal(v.artifactCount,106);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [name,expected] of Object.entries(manifest))if(!['server/server.cjs','server/service.cjs'].includes(name))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'),expected,name);
});
console.log(`R98 ${passed}/${passed} PASS`);
