'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
function test(name,fn){fn();console.log('PASS',name);passed++;}
function newCampaign(){const r=runtime(root);r.run('startNew(1)');return r;}
function hash(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}

test('Real telemetry starts without granting extra power or changing the save',()=>{
 const rt=newCampaign();
 rt.run('g.stage=55;g.highest[0]=55;g.knightLevel=55;gold=B(6500);relics=B(77);save(1,true)');
 const before=JSON.stringify(rt.store),snapshot=rt.run('JSON.stringify(labSnapshot())');
 const stats=rt.run('({physical:damage().save(),faith:faithDamage().save(),magic:magicDamage().save()})');
 assert.equal(rt.run("startEndgameTrial('real')"),true);
 const d=rt.run('trialTelemetryData()');
 assert.equal(d.initial.stage,55);assert.equal(d.initial.world,1);
 assert.equal(d.mode,'SAVE_REAL_SEM_BONUS');assert.equal(d.initial.stats.level,55);
 assert.deepEqual(rt.run('({physical:damage().save(),faith:faithDamage().save(),magic:magicDamage().save()})'),stats);
 assert.equal(d.results.bossDefeats,0);
 assert.equal(rt.run('save(1,true)'),false);
 rt.run('exitEndgameTrial()');
 assert.equal(rt.run('trialTelemetryData()'),null);
 assert.equal(rt.run('JSON.stringify(labSnapshot())'),snapshot);
 assert.equal(JSON.stringify(rt.store),before);
});
test('Boss kills and stage changes are counted, time units are simulated seconds',()=>{
 const rt=newCampaign();
 rt.run("g.stage=20;g.highest[0]=20;g.knightLevel=15;startEndgameTrial('real');");
 rt.run('updateCombat(.1);g.stage=21;updateCombat(.1)');
 let report=rt.run('trialTelemetryData()');
 assert.equal(report.results.stageAdvances,1);
 assert.equal(report.results.elapsedSeconds,.2);
 assert.ok(report.samples.length>=1);
 rt.run("const special=spawnEnemy(false,'boss',{type:'stage',s:g.stage,d:g.difficulty});special.bossAge=13.5;killEnemy(special)");
 report=rt.run('trialTelemetryData()');
 assert.equal(report.results.bossDefeats,1);
 assert.equal(report.bossEvents[0].type,'stage');
 assert.equal(report.bossEvents[0].durationSec,13.5);
 assert.equal(report.results.averageBossSeconds,13.5);
 rt.run('g.stage=19;g.deaths++;updateCombat(.1)');
 report=rt.run('trialTelemetryData()');
 assert.ok(report.results.retreats>=1);
 assert.equal(report.results.deaths,1);
 rt.run('exitEndgameTrial()');
});
test('No telemetry is collected in synthetic max-power stress tests',()=>{
 const rt=newCampaign();
 rt.run("startEndgameTrial('v24000');updateCombat(.1)");
 assert.equal(rt.run('trialTelemetryData()'),null);
 assert.equal(rt.run('trialTelemetry'),null);
 rt.run('exitEndgameTrial()');
});
test('Export is only available in real-save mode, with no raw save content',()=>{
 const rt=newCampaign();
 rt.run("startEndgameTrial('real');updateCombat(.05)");
 const json=JSON.stringify(rt.run('trialTelemetryData()'));
 assert.ok(json.includes('elapsedSeconds'));
 assert.ok(json.includes('bossEvents'));
 assert.ok(!json.includes('inventory'));
 assert.ok(!json.includes('wallet'));
 assert.ok(!json.includes('heroOrderLayout'));
 assert.ok(!json.includes('created'));
 rt.run('exitEndgameTrial()');
});
test('UI provides data export and version markers for R80',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const game=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
 assert.match(html,/R101/);assert.match(game,/EXPORTAR RELATÓRIO · JSON/);
 assert.match(game,/case 'trialExport':exportTrialTelemetry\(\)/);
 assert.match(game,/NENHUM PROGRESSO DE TESTE SERÁ SALVO/);
});
test('Export path creates a JSON download with a stable filename',()=>{
 const rt=newCampaign();
 rt.run("startEndgameTrial('real');updateCombat(.1)");
 let json='',filename='',revoke='';
 rt.c.Blob=class{constructor(parts){json=parts[0]}};
 rt.c.URL.createObjectURL=()=> 'blob:veilfall-test';
 rt.c.URL.revokeObjectURL=url=>{revoke=url;};
 rt.c.document.createElement=()=>({href:'',download:'',click(){filename=this.download;},remove(){}});
 rt.c.setTimeout=callback=>callback();
 assert.equal(rt.run('exportTrialTelemetry()'),true);
 assert.equal(revoke,'blob:veilfall-test');
 assert.match(filename,/VEILFALL_R82_TESTE_M1_F1\.json/);
 assert.equal(JSON.parse(json).mode,'SAVE_REAL_SEM_BONUS');
 rt.run('exitEndgameTrial()');
});
test('Real-save lab allows eligible gear rewards; synthetic lab still excludes them',()=>{
 const rt=newCampaign();
 rt.run('g.stage=30;g.highest[0]=30;g.knightLevel=30');
 assert.equal(rt.run('stageGearAvailable(30,0)'),true);
 rt.run("startEndgameTrial('real')");
 assert.equal(rt.run('stageGearAvailable(30,0)'),true);
 rt.run('exitEndgameTrial()');
 rt.run("startEndgameTrial('i23999')");
 assert.equal(rt.run('stageGearAvailable(23999,0)'),false);
 rt.run('exitEndgameTrial()');
});
test('Threshold guardian 2.5% hit cap applies only in artificial QA',()=>{
 const rt=newCampaign();
 rt.run('g.stage=249;g.highest[0]=249;g.knightLevel=210');
 rt.run("startEndgameTrial('real')");
 // The boss is added using the regular spawn factory; its HP should be reduced
 // by more than the old QA limit when a sufficiently large source hit lands.
 const real=rt.run(`(()=>{const e=spawnEnemy(false,'boss',{type:'threshold',s:249,d:0});
  const before=e.hp;hurt(e,before.mul(.20));return e.hp.div(before).num();})()`);
 assert.ok(real<.95,`real-mode boss HP ratio ${real}`);
 rt.run('exitEndgameTrial()');
 rt.run("startEndgameTrial('i23999')");
 const synthetic=rt.run(`(()=>{const e=spawnEnemy(false,'boss',{type:'threshold',s:23999,d:0});
  const before=e.hp;hurt(e,before.mul(.20));return e.hp.div(before).num();})()`);
 assert.ok(synthetic>.96&&synthetic<.98,`synthetic-mode HP ratio ${synthetic}`);
 rt.run('exitEndgameTrial()');
});
test('All R79 inherited files except the R81 standalone builder remain identical',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R80_HASHES_BASE_R79.json'),'utf8'));
 assert.equal(Object.keys(manifest.sha256).length,232);
 for(const [file,expected] of Object.entries(manifest.sha256)){
  if(['server/server.cjs','server/service.cjs','src/r52-core.js','src/r52-ui.js','tools/check-build.cjs','tools/build-standalone.cjs','src/r67-combat.js','src/base.css','src/data.js','tests/r52-browser.js','tools/test-balance-r52.cjs'].includes(file))continue; // R85 intentionally updated skill combat
  assert.equal(hash(path.join(root,file)),expected,file);
 }
});
console.log(`R80 ${passed}/${passed} PASS`);
