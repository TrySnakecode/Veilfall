const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function node(){return new Proxy({style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},children:[],append(){},remove(){},getContext(){return new Proxy({}, {get:()=>()=>{}})},setAttribute(){},addEventListener(){}},{get(o,k){if(k in o)return o[k];return ()=>{}},set(o,k,v){o[k]=v;return true;}})}
const doc={querySelector:()=>node(),querySelectorAll:()=>[],createElement:()=>node(),addEventListener(){},hidden:true};
const ctx={console,document:doc,performance:{now:()=>0},Image:class{},Audio:class{play(){return Promise.resolve()}},setInterval(){},setTimeout(){},Date,Math,Array,Uint8Array,Int32Array,Map,Set,parseInt,Number,Object,JSON};ctx.window=ctx;ctx.window.__assetUrls={arena:''};ctx.window.localStorage={getItem(){return null},setItem(){}};ctx.window.addEventListener=()=>{};vm.createContext(ctx);
for(const src of ['data','game'])vm.runInContext(fs.readFileSync(path.join(root,`src/${src}.js`),'utf8'),ctx,{filename:src+'.js'});
vm.runInContext(`renderAll=function(){};renderPanel=function(){};updateHeader=function(){};alertGame=function(){};feed=function(){};log=function(){};sound=function(){};`,ctx);
let pass=0,fail=0;const results=[];
function check(n,js){try{const v=vm.runInContext(js,ctx);if(!v)throw Error('Retornou falso');pass++;results.push({name:n,pass:true});}catch(e){fail++;results.push({name:n,pass:false,error:String(e.message||e)})}}
check('Catálogos de 106 artefatos, 30 pets, 32 pergaminhos e 32 heróis', 'D.artifacts.length===106&&D.pets.length===30&&D.scrolls.length===32&&D.heroes.length===32');
check('9 habilidades com árvores preservadas', 'D.skills.length===9 && D.skills.every(s=>s.nodes.length>=10)');
check('Dano físico-base cresce 1 por nível', 'basePhysicalDamage.call(null)===10 && (g.knightLevel=150,basePhysicalDamage()===159)');
check('Bônus de ressonância começa em ×1', '(g=fresh(),artifactResonanceMultiplier().cmp(1)===0)');
check('Ressonância cresce com investimento real', '(g=fresh(),g.artifactLevels.a001=5,artifactResonanceLog10()>0)');
check('Buffs de heróis continuam só no cavaleiro', '(g=fresh(),g.heroLevels.h01=40,heroPassiveContribution(D.heroes[0])>0&&totalHeroDps().m>0)');
check('Contribuição de nível 40 cresce com posição', '(g=fresh(),g.heroLevels.h01=40,g.heroLevels.h02=40,heroRankPassiveMultiplier(orderedHeroes()[2])>heroRankPassiveMultiplier(orderedHeroes()[1]))');
check('Fases repetidas têm menos abates', '(g=fresh(),g.stage=150,g.highest[0]=150, a=killsReq(), g.highest[0]=151, killsReq()<a)');
check('Itens do próximo grau começam acima do fim do grau anterior', 'Array.from({length:4},(_,d)=>gearValueAt(1,d+1,0)>gearValueAt(24000,d,5)).every(Boolean)');
check('PV de chefes acima de inimigos comuns', '(g=fresh(),enemyHealth(500,0,"boss").cmp(enemyHealth(500,0))>0)');
check('Limite de cavaleiro 60.000 em dificuldade V', '(g=fresh(),g.difficulty=4,g.stage=24000,knightLevelCap()===60000)');
check('Ouro entre mundos escala continuamente', 'Math.abs(enemyGold(1,1).log10()-enemyGold(24000,0).log10())<.1');
check('Experiência entre mundos escala continuamente', 'Math.abs(enemyXP(1,1).log10()-enemyXP(24000,0).log10())<.1');
check('Prestígio de Mundo aumenta a ameaça 100× e permite farm anterior', 'Math.abs(enemyHealth(1,1).log10()-enemyHealth(24000,0).log10()-Math.log10(100))<1e-7');
check('Prestígio de Mundo II não deixa EXP zerada', '(g=fresh(),g.difficulty=1,g.stage=55,g.runPeak=55,prestigeReward().cmp(1000)>0)');
check('Cap real de progressão além do nível 24.000', 'knightLevelCap(24000,4)===60000 && killEnemy.toString().includes("Math.min(60000,g.knightLevel+1)")');
for(const diff of [0,1,2,3,4])for(const stage of [1,55,250,500,2000,5000,10000,24000]){
 check(`Crescimento de vida mundo ${diff+1} fase ${stage}` ,`(g=fresh(),g.difficulty=${diff},g.stage=${stage},enemyHealth(${stage},${diff}).cmp(0)>0 && enemyHealth(${stage+1},${diff}).cmp(enemyHealth(${stage},${diff}))>0)`);
 check(`Curvas de ouro, XP e relic mundo ${diff+1} fase ${stage}`,`(g=fresh(),g.difficulty=${diff},g.stage=${stage},enemyGold().cmp(0)>0 && enemyXP().cmp(0)>0 && (g.stage=Math.max(55,${stage}),prestigeReward().cmp(0)>=0))`);
}
for(let n=0;n<300;n++){
 const i=n%106,lv=n*97+1;
 check(`Artefato ${n} aumenta ressonância`, `(g=fresh(),g.artifactLevels[D.artifacts[${i}].id]=${lv},a=artifactResonanceLog10(),g.artifactLevels[D.artifacts[${i}].id]=${lv}+1,artifactResonanceLog10()>=a)`);
}
const report={revision:52,kind:'motor-matematico-node',pass,fail,total:pass+fail,results};fs.writeFileSync(path.join(root,'TESTES_MOTOR_R52.json'),JSON.stringify(report,null,2));console.log('Testes motor',pass,'/',pass+fail);if(fail){console.log(results.filter(x=>!x.pass));process.exit(1)}
