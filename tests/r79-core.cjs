'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let n=0;
function test(name,callback){callback(); console.log('PASS',name);n++;}
function scenario(){const rt=runtime(root);rt.run('startNew(1)');return rt;}
const norm=rt=>rt.run('JSON.stringify(labSnapshot())');
test('Real-save test uses exact campaign stats and does not calibrate damage',()=>{
 const rt=scenario();
 rt.run(`g.stage=249;g.highest[0]=249;g.knightLevel=203;g.knightPrestiges=4;g.heroLevels.h01=17;g.heroTrans.h01=1;g.petLevels.p01=3;g.scrollLevels.s01=2;g.artifactLevels.a001=7;g.firstClear=[];gold=B(1234567);relics=B(423);g.speed=10;save(1,true);`);
 const before=JSON.parse(norm(rt)),persisted=JSON.stringify(rt.store);
 const base=rt.run('({phy:damage().save(),faith:faithDamage().save(),magic:magicDamage().save()})');
 assert.equal(rt.run("startEndgameTrial('real')"),true);
 const now=rt.run('JSON.parse(JSON.stringify(labSnapshot()))');
 assert.equal(now.state.knightLevel,before.state.knightLevel);
 assert.equal(now.state.knightPrestiges,4);
 assert.deepEqual(now.state.heroLevels,before.state.heroLevels);
 assert.deepEqual(now.state.heroTrans,before.state.heroTrans);
 assert.deepEqual(now.state.artifactLevels,before.state.artifactLevels);
 assert.deepEqual(now.state.petLevels,before.state.petLevels);
 assert.deepEqual(now.state.scrollLevels,before.state.scrollLevels);
 assert.deepEqual(now.state.talents,before.state.talents);
 assert.deepEqual(now.gold,before.gold);assert.deepEqual(now.relics,before.relics);
 assert.equal(rt.run('trialScenario'),'real');
 assert.equal(rt.run('g.stage'),249);
 assert.equal(rt.run('g.difficulty'),0);
 assert.equal(rt.run('g.speed'),10);
 assert.equal(rt.run('endgameTrial&&testMode'),true);
 assert.deepEqual(rt.run('({phy:damage().save(),faith:faithDamage().save(),magic:magicDamage().save()})'),base);
 assert.equal(rt.run('stageBossPending()'),false);
 assert.equal(rt.run('thresholdBlocked()'),true);
 assert.equal(rt.run("queue.some(e=>e.type==='threshold'&&e.s===249)"),true);
 assert.equal(rt.run('save(1,true)'),false);
 assert.equal(JSON.stringify(rt.store),persisted);
 rt.run('g.knightLevel=500;g.heroLevels.h01=8000;g.artifactLevels.a001=80;gold=Big.pow10(60);relics=Big.pow10(70);g.stage=251;save(1,true)');
 rt.run('exitEndgameTrial()');
 assert.equal(rt.run('endgameTrial||testMode'),false);
 assert.equal(rt.run('trialScenario'),'i23999');
 assert.equal(rt.run('trialBaseline'),null);
 assert.deepEqual(JSON.parse(norm(rt)),before);
 assert.equal(JSON.stringify(rt.store),persisted);
});
test('Real-save trial includes stage guardian: no horde-only bypass',()=>{
 const rt=scenario();
 rt.run('g.stage=199;g.highest[0]=199;g.knightLevel=150;g.firstClear=[];save(1,true)');
 rt.run("startEndgameTrial('real');g.stageKills=killsReq();progressWorld()");
 assert.equal(rt.run('g.stage'),199);
 assert.equal(rt.run('queue.some(e=>e.type===\'stage\'&&e.s===199)'),true);
 assert.equal(rt.run('queueStageBoss()'),false);
 rt.run('exitEndgameTrial()');
});
test('Synthetic V stress mode preserves intentionally artificial horde-only behavior',()=>{
 const rt=scenario();
 rt.run("startEndgameTrial('v24000')");
 const active=rt.run('window.VEIL_DEBUG.getEndgameTrial()');
 assert.equal(active.scenario,'v24000');
 assert.equal(active.syntheticPower,true);
 assert.equal(active.difficulty,4);
 assert.equal(active.stage,24000);
 assert.equal(rt.run('stageBossPending()'),false);
 assert.equal(rt.run('queueStageBoss()'),false);
 const ratio=rt.run("damage().div(enemyHealth(24000,4,'normal')).num(3)");
 assert.ok(ratio>0.89&&ratio<0.91,`ratio=${ratio}`);
 rt.run('exitEndgameTrial()');
});
test('Real mode uses real combat equipment and real stage without teleporting',()=>{
 const rt=scenario();
 rt.run('g.stage=74;g.highest[0]=95;g.knightLevel=63;g.difficulty=0;g.unlocked=1;g.stageHold=true;save(1,true)');
 rt.run("startEndgameTrial('real')");
 assert.equal(rt.run('g.stage'),74); assert.equal(rt.run('g.knightLevel'),63);
 assert.equal(rt.run('g.stageHold'),false); // farm unpaused only inside trial
 assert.equal(rt.run('trialPower.physical.cmp(1)'),0);
 assert.equal(rt.run('trialPower.faith.cmp(1)'),0);
 assert.equal(rt.run('trialPower.magic.cmp(1)'),0);
 assert.equal(rt.run('g.worldPrestiges'),0);
 assert.equal(rt.run('g.unlocked'),1);
 rt.run('exitEndgameTrial()');
 assert.equal(rt.run('g.stageHold'),true);
});
test('UI labels explicitly distinguish real save and artificial modes',()=>{
 const h=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const s=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
 assert.match(h,/TESTAR MINHA BUILD · SAVE ATUAL/);
 assert.match(h,/PODER MÁXIMO V · 24.000 \(SEM CHEFES\)/);
 assert.match(s,/Teste.*save|TESTE DE DIFICULDADE · SAVE REAL/s);
 assert.match(s,/não representa|Não mede a dificuldade real/);
 assert.match(s,/PARA MEDIR ENDGAME|Para avaliar a fase 24.000/);
 assert.match(h,/R101/);
});
test('Original art, audio and server assets retain audited R79 hashes',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R80_HASHES_BASE_R79.json'),'utf8')).sha256;
 for(const f of ['assets/characters/knight.png','assets/characters/enemies.png','assets/characters/bosses.png','assets/environment/arena.png',
  'assets/ui/icons.png','assets/audio/sound-0.wav','assets/audio/sound-1.wav','assets/audio/sound-2.wav',
  'server/server.cjs','server/service.cjs','shared/raid-engine.js',
  'src/r68-tree.js','src/visual.js']){
  if(['server/server.cjs','server/service.cjs'].includes(f))continue; // R100 intentionally migrates backend
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),manifest[f],f);
 }
});
console.log(`R79 ${n}/${n} PASS`);
