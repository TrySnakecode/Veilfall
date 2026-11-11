'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs'),root=path.resolve(__dirname,'..');
let count=0;function test(name,fn){fn();count++;console.log('PASS R99:',name)}
function lab(){const r=runtime(root);r.run('startNew(1);');return r;}
test('Camada atmosférica desenhada pela renderização real sem mudar estágio ou inimigos',()=>{
 const r=lab(),v=r.run(`(()=>{const before={stage:g.stage,kills:g.stageKills,entities:enemies.length,gold:gold.save()};vEnvironment();return {ready:R99.ambient!==null,stage:g.stage,kills:g.stageKills,entities:enemies.length,gold:gold.save(),before,dimensions:[R99.ambient.width,R99.ambient.height]};})()`);
 assert.equal(v.ready,true);assert.equal(v.stage,v.before.stage);assert.equal(v.kills,v.before.kills);assert.deepEqual(Array.from(v.dimensions),[560,345]);assert.equal(v.entities,v.before.entities);
});
test('Intensidade equilibrada e redução de movimento removem ornamentação adicional',()=>{
 const r=lab(),v=r.run(`(()=>{g.particles=true;V42.quality='high';V42.reduced=false;UX66.prefs.intensity='epic';const epic=r99Intensity();UX66.prefs.intensity='balanced';const balanced=r99Intensity();UX66.prefs.intensity='quiet';const quiet=r99Intensity();UX66.prefs.intensity='epic';V42.reduced=true;const reduced=r99Intensity();V42.reduced=false;V42.quality='low';const low=r99Intensity();return {epic,balanced,quiet,reduced,low};})()`);
 assert.deepEqual(JSON.parse(JSON.stringify(v)),{epic:2,balanced:1,quiet:0,reduced:0,low:0});
});
test('Magias geram impacto artístico sem consumir simulação ou alterar atributos',()=>{
 const r=lab(),v=r.run(`(()=>{V42.now=1;g.particles=true;V42.quality='high';V42.reduced=false;UX66.prefs.intensity='epic';const before={stage:g.stage,kills:g.stageKills,mana:player.mana,life:player.hp};r99ImpactArt({type:'cast_curse',x:400,y:300,r:80,born:.91,life:.5},2);return {stage:g.stage,kills:g.stageKills,mana:player.mana,life:player.hp,before};})()`);
 assert.equal(v.stage,v.before.stage);assert.equal(v.kills,v.before.kills);assert.equal(v.mana,v.before.mana);assert.equal(v.life,v.before.life);
});
test('Recompensas raras recebem identidade distinta sem modificar loot',()=>{
 const r=lab(),v=r.run(`[r99RewardKind('ÚNICO DESCOBERTO'),r99RewardKind('CONJUNTO COMPLETO'),r99RewardKind('GUARDIÃO DERROTADO'),r99RewardKind('Ouro +1')]`);
 assert.deepEqual(Array.from(v),['legendary','legendary','milestone','routine']);
});
test('Integração usa CSS/JS antes do boot e mantém os filtros rejeitados ausentes',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=fs.readFileSync(path.join(root,'src/r99-premium.js'),'utf8'),css=fs.readFileSync(path.join(root,'src/r99-premium.css'),'utf8');
 assert.ok(html.indexOf('src/r99-premium.js')<html.indexOf('src/boot.js'));assert.match(html,/r99-premium\.css/);assert.match(css,/prefers-reduced-motion/);assert.match(js,/r99OldEnvironment=vEnvironment/);assert.doesNotMatch(js,/g\.inventory\s*=|relics\s*=|g\.stage\s*=/);assert.doesNotMatch(html,/r88-loot-filter|r99-filter-items/);
});
console.log(`R99 ${count}/${count} PASS`);
