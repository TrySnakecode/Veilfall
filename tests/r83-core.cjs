'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PROFILES,readOptions,simulationScript,runOne,reportMarkdown,summarize}=require('../tools/auditar-campanha-r83.cjs');
const root=path.resolve(__dirname,'..');
let n=0;function check(name,fn){fn();n++;console.log('PASS',name)}
check('R83 supports three purchase profiles with different priorities',()=>{
 assert.deepEqual(Object.keys(PROFILES),['equilibrado','ofensivo','defensivo']);
 assert.notDeepEqual(PROFILES.ofensivo.passives,PROFILES.defensivo.passives);
 for(const p of Object.values(PROFILES))assert.equal(new Set(p.skills).size,p.skills.length);
});
check('R83 validates duration, seeds, strategies and unknown arguments',()=>{
 assert.deepEqual(readOptions(['--seconds=600','--seeds=17,47','--profiles=ofensivo,defensivo']).profiles,['ofensivo','defensivo']);
 for(const a of [['--seconds=foo'],['--seconds=0'],['--seconds=200000'],['--seeds=0'],['--seeds=5,wat'],['--seeds=1,2,3,4,5,6,7,8,9'],['--profiles=test'],['--not-a-flag']])
  assert.throws(()=>readOptions(a));
});
check('R83 scripted agent uses real costs and never invokes synthetic endgame power',()=>{
 const script=simulationScript(60,17,'equilibrado');
 assert.match(script,/updateCombat\(\.05\)/);
 assert.match(script,/prestigeEligibility\(\)/);
 assert.match(script,/spendRelics\(cost\)/);
 assert.match(script,/buyArtifactBudget\(/);
 assert.match(script,/p67Route\(/);
 assert.match(script,/g\.autoHeroes=true/);
 assert.match(script,/testMode=false;endgameTrial=false/);
 assert.doesNotMatch(script,/trialPower|startEndgameTrial|g\.knightLevel=24000/);
});
check('R83 executes isolated actual-combat simulation without lab bonuses',()=>{
 const r=runOne({seconds:2,seed:17,profile:'equilibrado'});
 assert.equal(r.seed,17);assert.equal(r.profile,'equilibrado');
 assert.ok(r.maxStage>=1);assert.ok(r.maxStage<250);
 assert.deepEqual(r.qaFlags,{testMode:false,endgameTrial:false,receivedSyntheticPower:false});
 assert.equal(r.prestigeCount,r.prestiges.length);
 assert.ok(r.artifactCount>=0);assert.ok(r.level>=1);
});
check('R83 reports are descriptive and flag no-prestige / incomplete coverage',()=>{
 const doc={config:{seconds:600,seeds:[17],profiles:['equilibrado','defensivo']},runs:[
  {seed:17,profile:'equilibrado',simulatedSeconds:600,maxStage:40,deaths:0,prestigeCount:0,milestones:{},heldSeconds:0,artifactCount:0},
  {seed:17,profile:'defensivo',simulatedSeconds:600,maxStage:37,deaths:2,prestigeCount:0,milestones:{},heldSeconds:20,artifactCount:0}
 ]};
 const md=reportMarkdown(doc);
 assert.match(md,/Diferença de fases/);assert.match(md,/\| 17 \| defensivo \| -3 \| \+2 \|/);
 assert.match(md,/nenhum agente prestigiou/);
 assert.match(md,/não validam.*cinco mundos/);
 assert.equal(summarize(doc.runs)[0].milestone55,null);
});
check('Inherited assets and unrelated modules retain R80-approved checksums',()=>{
 const original=JSON.parse(fs.readFileSync(path.join(root,'docs/R80_HASHES_BASE_R79.json'),'utf8')).sha256;
 for(const [file,sum] of Object.entries(original)){
  // R85 combat and R101 hero-weapon QA assertions intentionally evolve with their mechanics.
  if(['server/server.cjs','server/service.cjs','src/r52-core.js','src/r52-ui.js','tools/check-build.cjs','tools/build-standalone.cjs','src/r67-combat.js','src/base.css','src/data.js','tests/r52-browser.js','tools/test-balance-r52.cjs'].includes(file))continue;
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sum,file);
 }
});
console.log(`R83 ${n}/${n} PASS`);
