const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
let tests=[];
function assert(name,pass,info={}){tests.push({name,pass:!!pass,...info});if(!pass)console.error('FALHOU',name,info);}
function app(){
 const store={};function node(){return new Proxy({style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},children:[],append(){},remove(){},getContext(){return new Proxy({}, {get:()=>()=>{}})},setAttribute(){},addEventListener(){}},{get(o,k){if(k in o)return o[k];return ()=>{}},set(o,k,v){o[k]=v;return true;}})}
 const doc={querySelector:()=>node(),querySelectorAll:()=>[],createElement:()=>node(),addEventListener(){},hidden:true};
 const c={console,document:doc,performance:{now:()=>0},Image:class{},Audio:class{play(){return Promise.resolve()}},setInterval(){},setTimeout(){},Date,Math,Array,Uint8Array,Int32Array,Map,Set,parseInt,Number,Object,JSON,Intl};c.window=c;c.window.__assetUrls={arena:''};c.window.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>(store[k]=v)};c.window.addEventListener=()=>{};vm.createContext(c);
 for(const x of ['data','game'])vm.runInContext(fs.readFileSync(path.join(root,`src/${x}.js`),'utf8'),c,{filename:x+'.js'});
 vm.runInContext('renderAll=function(){};renderPanel=function(){};updateHeader=function(){};alertGame=function(){};feed=function(){};log=function(){};sound=function(){};',c);
 return {c,store,run:s=>vm.runInContext(s,c)};
}
const a=app();
assert('106 artefatos no catalogo',a.run('D.artifacts.length')===106);
assert('Relíquia primeira jornada mantém prestígio viável',a.run('(g=fresh(),g.stage=55,g.runPeak=55,prestigeReward().num())')>=14);
const r=a.run('(g=fresh(),g.stage=1170,g.runPeak=1170,prestigeReward().log10())');
assert('Relíquias fase1170 reduzem 12+ ordens de grandeza',r>=12&&r<14,{log10:r});
assert('All Artifact Damage aditivo',a.run('(g=fresh(),g.artifactLevels.a001=100,g.artifactLevels.a002=400,Math.abs(artifactAllDamagePercent()-(artifactIndividualDamagePercent(100)+artifactIndividualDamagePercent(400)))<1e-8)'));
assert('Ressonancia experimental removida',a.run('(g=fresh(),g.artifactLevels.a001=12000,artifactResonanceMultiplier().cmp(1)===0)'));
assert('HP por etapa apos2000 e maior que remuneração das reliquias',a.run('Math.exp(enemyProgressLog(2001)-enemyProgressLog(2000))>RELIC_PRESTIGE_GROWTH'));
assert('Aumento longo de HP na fase5000',a.run('enemyHealth(5000,0).cmp(enemyHealth(2000,0))>0'));
const repro=a.run(`(()=>{g=fresh();g.stage=1170;g.runPeak=1170;relics=prestigeReward();let count=0;while(count<D.artifacts.length&&relics.cmp(artifactDiscoverCost(count))>=0){relics=relics.sub(artifactDiscoverCost(count));g.artifactLevels[D.artifacts[count].id]=1;count++;}let pool=D.artifacts.slice(0,count).filter(a=>!a.maxLevel);for(const item of pool)buyArtifactBudget(item,relics.mul(.80/pool.length),100000);return {count,totalLevels:Object.values(g.artifactLevels).reduce((s,l)=>s+l,0),pct:artifactAllDamagePercent()};})()`);
assert('Teste1170 não desbloqueia105 artefatos',repro.count>=35&&repro.count<=55,{count:repro.count});
assert('Teste1170 não eleva 1 milhão de níveis',repro.totalLevels<200000,{levels:repro.totalLevels});
assert('Dano de todos os artefatos mantido como %',repro.pct>1&&repro.pct<1000,{percent:repro.pct*100});
const old=a.run(`(()=>{let old=fresh();delete old.relicEconomyVersion;old.knightPrestiges=1;old.prestigeGates={0:{priorPeak:1170,returnStage:700,threshold:1000}};old.stage=24000;old.runPeak=24000;old.highest[0]=24000;old.artifactLevels.a001=12000;old.artifactLevels.a002=12000;old.relics=B('1e25').save();old.totalRelics=B('1e25').save();return old;})()`);
// Big constructor doesn't parse scientific text in all versions; set mantissa/exponent representation explicitly.
old.relics=[1,25];old.totalRelics=[1,25];old.savedAt=Date.now();
a.store.veilfall_web_v1_1=JSON.stringify(old);
const migrated=a.run(`(()=>{let loaded=load(1);let before=relics.log10();let art=g.artifactLevels.a001;let vers=g.relicEconomyVersion;let recorded=!!g.relicBalanceBeforeR54;save(1,true);load(1);return {loaded,before,after:relics.log10(),art,vers,recorded};})()`);
assert('Save R53 convertido sem perder armas ou niveis',migrated.loaded&&migrated.art===12000&&migrated.vers===2&&migrated.recorded,migrated);
assert('Saldo R53 da fase1170 normalizado pela fase do último prestígio',migrated.before>11&&migrated.before<14,{log10:migrated.before});
assert('Migração idempotente (não reaplica ao carregar)',Math.abs(migrated.before-migrated.after)<.00001,migrated);
assert('Golpe das Sombras sem recarga por tick explosiva',a.run("updateCombat.toString().includes('Math.min(.45')")&&a.run("shadowDash.toString().includes('1.75*mod')"));
const report={revision:54,total:tests.length,pass:tests.filter(x=>x.pass).length,fail:tests.filter(x=>!x.pass).length,reproduction:repro,migration:migrated,checks:tests};fs.writeFileSync(path.join(root,'TESTES_REVISAO_54.json'),JSON.stringify(report,null,2));console.log('R54',report.pass,'/',report.total,'repro',repro,'migration',migrated);if(report.fail)process.exit(1);
