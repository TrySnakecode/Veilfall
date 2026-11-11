'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const analyzer=require('../shared/telemetry-analysis.js');
const {reportMD}=require('../tools/analisar-relatorio-r81.cjs');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let total=0;
function check(label,fn){fn();total++;console.log('PASS',label)}
const sample=(seconds=900,stageAdvances=35,deaths=0,bosses=[2,2.5,1.8,3,2.6])=>({
 schema:'veilfall-lab-r81-v1',mode:'SAVE_REAL_SEM_BONUS',revision:'R81',
 simulation:{speedAtStart:1},initial:{world:1,stage:55},final:{world:1,stage:55+stageAdvances},
 results:{elapsedSeconds:seconds,stageAdvances,deaths,retreats:0,kills:120,bossDefeats:bosses.length,averageBossSeconds:2.5},
 bossEvents:bosses.map(durationSec=>({durationSec})),stageEvents:[],samples:[]});
check('R81 accepts current and R80 reports without confusing synthetic QA',()=>{
 assert.equal(analyzer.analyze(sample()).valid,true);
 const prior=sample();prior.schema='veilfall-lab-r80-v1';assert.equal(analyzer.analyze(prior).valid,true);
 assert.equal(analyzer.analyze({...sample(),mode:'MAX_POWER_QA'}).valid,false);
 assert.equal(analyzer.analyze({schema:'other',results:{}}).valid,false);
});
check('R81 detects extremely easy segments but never claims full balance',()=>{
 const a=analyzer.analyze(sample());
 assert.equal(a.summary.bossMedianSeconds,2.5);
 assert.equal(a.summary.stagesPerTenMinutes,23.33);
 assert.ok(a.flags.some(x=>x.code==='FAST_BOSSES'));
 assert.ok(a.flags.some(x=>x.code==='RAPID_CLEAR'));
 assert.ok(a.flags.some(x=>x.code==='LIMIT'));
});
check('Sparse samples are explicitly insufficient, no dividing by zero',()=>{
 const s=sample(0,0,0,[]),a=analyzer.analyze(s);
 assert.equal(a.valid,true);assert.equal(a.summary.stagesPerTenMinutes,0);
 assert.equal(a.summary.bossMedianSeconds,null);
 assert.ok(a.flags.some(x=>x.code==='SHORT_RUN'));
 assert.ok(a.flags.some(x=>x.code==='FEW_BOSSES'));
});
check('R81 reports slow bosses or repeated deaths as observations, not automatic rebalance',()=>{
 const a=analyzer.analyze(sample(900,0,6,[120,140,160,180,200]));
 assert.ok(a.flags.some(x=>x.code==='STALL'));
 assert.ok(a.flags.some(x=>x.code==='REPEATED_DEATHS'));
 assert.ok(a.flags.some(x=>x.code==='LONG_BOSSES'));
});
check('Partial boss event history is flagged; median does not pretend to be full population',()=>{
 const data=sample();data.results.bossDefeats=800;
 const a=analyzer.analyze(data);
 assert.equal(a.summary.bossEventsTruncated,true);
 assert.equal(a.qualifiedBossSample,false);
 assert.ok(a.flags.some(x=>x.code==='TRUNCATED'));
});
check('Analyzer is pure: does not change original JSON, skills or save',()=>{
 const r=sample();const before=JSON.stringify(r);
 const a=analyzer.analyze(r);
 assert.equal(JSON.stringify(r),before);
 assert.ok(!JSON.stringify(a).includes('inventory'));
 assert.match(reportMD('arquivo.json',a),/Diagnóstico R81/);
});
check('Real-save game report includes R81 diagnostic with no artificial power',()=>{
 const rt=runtime(root);rt.run('startNew(1)');
 const before=rt.run('JSON.stringify(labSnapshot())');
 const res=rt.run("startEndgameTrial('real');updateCombat(.05);trialTelemetryData()");
 assert.equal(res.schema,'veilfall-lab-r82-v1');
 assert.equal(res.mode,'SAVE_REAL_SEM_BONUS');
 assert.equal(res.analysis.valid,true);
 assert.equal(res.analysis.summary.bossDefeats,0);
 assert.equal(rt.run('trialPower.physical.cmp(1)'),0);
 assert.match(rt.run('trialControls()'),/R82 · DIAGNÓSTICO/);
 rt.run('exitEndgameTrial()');
 assert.equal(rt.run('JSON.stringify(labSnapshot())'),before);
});
check('R81 file output remains nonidentifying and uses a new filename',()=>{
 const rt=runtime(root);rt.run('startNew(1)');rt.run("startEndgameTrial('real');updateCombat(.1)");
 let data='',name='';
 rt.c.Blob=class{constructor(p){data=p[0]}};
 rt.c.URL.createObjectURL=()=> 'blob:r81';rt.c.URL.revokeObjectURL=()=>{};
 rt.c.document.createElement=()=>({click(){name=this.download},remove(){}});
 rt.c.setTimeout=callback=>callback();
 assert.equal(rt.run('exportTrialTelemetry()'),true);
 assert.match(name,/VEILFALL_R82_TESTE_M1_F1\.json/);
 const exported=JSON.parse(data);
 assert.ok(exported.analysis.valid);
 assert.ok(!JSON.stringify(exported).includes('inventory'));
 rt.run('exitEndgameTrial()');
});
check('All original visual/audio files are byte identical to R80 audited manifest',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R80_HASHES_BASE_R79.json'),'utf8')).sha256;
 for(const [file,expected] of Object.entries(manifest)){
  if(['server/server.cjs','server/service.cjs','src/r52-core.js','src/r52-ui.js','tools/check-build.cjs','tools/build-standalone.cjs','src/r67-combat.js','src/base.css','src/data.js','tests/r52-browser.js','tools/test-balance-r52.cjs'].includes(file))continue;
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),expected,file);
 }
});
check('R81 source includes analysis in both modular and standalone bundler path',()=>{
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const builder=fs.readFileSync(path.join(root,'tools/build-standalone.cjs'),'utf8');
 assert.match(index,/shared\/telemetry-analysis\.js/);
 assert.match(builder,/shared\/telemetry-analysis\.js/);
 assert.match(index,/Crônicas do Véu · R101/);
});
console.log(`R81 ${total}/${total} PASS`);
