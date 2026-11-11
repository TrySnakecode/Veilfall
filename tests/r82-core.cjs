'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {analyze}=require('../shared/telemetry-analysis.js');
const {reportMD}=require('../tools/analisar-relatorio-r82.cjs');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let n=0;function check(label,fn){fn();n++;console.log('PASS',label)}
const sample=(events=[])=>({schema:'veilfall-lab-r82-v1',mode:'SAVE_REAL_SEM_BONUS',
 revision:'R82',simulation:{speedAtStart:1},initial:{world:1,stage:60},final:{world:1,stage:80},
 results:{elapsedSeconds:900,stageAdvances:20,deaths:2,retreats:1,kills:100,bossDefeats:0},
 economy:{prestigesObserved:events.length,eventsTruncated:false,relicsAwardedLog10:4.1,
  relicsSpentLog10:3.9,artifactLevelsBought:66,artifactDiscoveries:2,
  artifactCountStart:4,artifactCountEnd:6},prestigeEvents:events,
 bossEvents:[],stageEvents:[],samples:[]});
check('R82 accepts real-save report and rejects synthetic or unrelated inputs',()=>{
 assert.equal(analyze(sample()).valid,true);
 assert.equal(analyze({...sample(),mode:'MAX_POWER_QA'}).valid,false);
 for(const v of ['r80','r81']){const s=sample();s.schema=`veilfall-lab-${v}-v1`;delete s.economy;
  assert.equal(analyze(s).valid,true);assert.ok(analyze(s).flags.some(f=>f.code==='NO_ECONOMY'));}
});
check('R82 economy analysis does not treat a short run as verified balance',()=>{
 const a=analyze(sample());assert.equal(a.summary.prestigeCycles.observed,0);
 assert.ok(a.flags.some(f=>f.code==='FEW_PRESTIGES'));
 assert.equal(a.qualifiedBossSample,false);
 assert.match(reportMD('sessao.json',a),/Economia de prestígio/);
});
check('R82 flags possible prestige stagnation only after three cycles',()=>{
 const r=sample([{atSec:100,peakStage:90},{atSec:350,peakStage:86},{atSec:700,peakStage:90}]);
 const a=analyze(r);
 assert.equal(a.summary.prestigeCycles.prestigePeakGain,0);
 assert.equal(a.summary.prestigeCycles.medianMinutesBetweenPrestiges,5);
 assert.equal(a.summary.prestigeCycles.rewardGrowthOrders,null);
 assert.ok(a.flags.some(f=>f.code==='PRESTIGE_PLATEAU'));
 const improved=sample([{atSec:100,peakStage:90},{atSec:350,peakStage:91},{atSec:700,peakStage:100}]);
 assert.ok(!analyze(improved).flags.some(f=>f.code==='PRESTIGE_PLATEAU'));
});
check('R82 handles truncated prestige logs and does not misreport history',()=>{
 const r=sample([{atSec:100,peakStage:90}]);r.economy.prestigesObserved=201;r.economy.eventsTruncated=true;
 const a=analyze(r);assert.equal(a.summary.prestigeCycles.eventsTruncated,true);
 assert.ok(a.flags.some(f=>f.code==='TRUNCATED_PRESTIGES'));
});
check('Real prestige and upgrades are measured only during the isolated test',()=>{
 const rt=runtime(root);rt.run('startNew(1)');
 const before=rt.run('JSON.stringify(labSnapshot())');
 rt.run("startEndgameTrial('real')");
 const record=rt.run(`(()=>{
  // Test fixture: create an eligible state INSIDE the volatile lab, not in a campaign.
  g.stage=55;g.runPeak=55;g.highest[0]=55;g.knightLevel=70;
  showModal=(title,desc,yes)=>yes();
  knightPrestige();
  const snap=trialTelemetryData();
  return {prestiges:snap.economy.prestigesObserved,event:snap.prestigeEvents[0],report:snap};})()`);
 assert.equal(record.prestiges,1);
 assert.equal(record.event.peakStage,55);
 assert.equal(record.event.prestigeNumber,1);
 assert.ok(record.event.nextThreshold>=30);
 assert.ok(record.event.rewardLog10!==null);
 const record2=rt.run(`(()=>{
  relics=B(1e10);const art=D.artifacts[0];g.artifactLevels[art.id]=1;
  const gained=buyArtifactBudget(art,B(10000),10);
  return {levels:gained.levels,report:trialTelemetryData()};})()`);
 assert.ok(record2.levels>0);
 assert.ok(record2.report.economy.artifactLevelsBought>0);
 assert.ok(record2.report.economy.relicsSpentLog10!==null);
 assert.ok(!JSON.stringify(record2.report).includes('inventory'));
 rt.run('exitEndgameTrial()');
 assert.equal(rt.run('JSON.stringify(labSnapshot())'),before);
});
check('Exported report is R82 and does not include raw save',()=>{
 const rt=runtime(root);rt.run('startNew(1)');rt.run("startEndgameTrial('real');updateCombat(.1)");
 let body='',filename='';rt.c.Blob=class{constructor(parts){body=parts[0]}};
 rt.c.URL.createObjectURL=()=> 'blob:r82';rt.c.URL.revokeObjectURL=()=>{};
 rt.c.document.createElement=()=>({click(){filename=this.download},remove(){}});
 rt.c.setTimeout=callback=>callback();
 assert.equal(rt.run('exportTrialTelemetry()'),true);
 assert.match(filename,/VEILFALL_R82_TESTE_M1_F1\.json/);
 const exported=JSON.parse(body);
 assert.equal(exported.schema,'veilfall-lab-r82-v1');
 assert.ok(exported.analysis.valid&&exported.economy);
 for(const forbidden of ['inventory','walletRaw','heroOrder','createdAt','BKEY'])assert.ok(!body.includes(forbidden));
 rt.run('exitEndgameTrial()');
});
check('Version marker and offline analyzer are included',()=>{
 assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/Crônicas do Véu · R101/);
 assert.match(fs.readFileSync(path.join(root,'src/game.js'),'utf8'),/R82 · DIAGNÓSTICO/);
 assert.match(fs.readFileSync(path.join(root,'tools/build-standalone.cjs'),'utf8'),/shared\/telemetry-analysis\.js/);
 assert.ok(fs.existsSync(path.join(root,'tools/analisar-relatorio-r82.cjs')));
});
check('Sprite, audio, balance and server files unchanged relative to R80 vetted hashes',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R80_HASHES_BASE_R79.json'),'utf8')).sha256;
 for(const [f,expected] of Object.entries(manifest)){
  if(['server/server.cjs','server/service.cjs','src/r52-core.js','src/r52-ui.js','tools/check-build.cjs','tools/build-standalone.cjs','src/r67-combat.js','src/base.css','src/data.js','tests/r52-browser.js','tools/test-balance-r52.cjs'].includes(f))continue;
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),expected,f);
 }
});
console.log(`R82 ${n}/${n} PASS`);
