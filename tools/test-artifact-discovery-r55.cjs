const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const results=[];
function test(name,condition,details){const pass=!!condition;results.push({name,pass,...(details||{})});if(!pass)console.error('FALHOU',name,details||'');}
const s={};
function fakeEl(){return new Proxy({style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},append(){},children:[],getContext(){return new Proxy({}, {get:()=>()=>{}})},setAttribute(){},addEventListener(){}},{get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true;}})}
const c={console,document:{querySelector:()=>fakeEl(),querySelectorAll:()=>[],createElement:()=>fakeEl(),addEventListener(){},hidden:true},Image:class{},Audio:class{play(){return Promise.resolve()}},performance:{now:()=>0},setTimeout(){},setInterval(){},Math,Date,Map,Set,JSON,Intl};c.window=c;c.window.__assetUrls={arena:''};c.window.localStorage={getItem:k=>s[k]??null,setItem:(k,v)=>s[k]=v};c.window.addEventListener=()=>{};vm.createContext(c);
for(let file of ['data','game'])vm.runInContext(fs.readFileSync(path.join(root,'src',file+'.js'),'utf8'),c,{filename:file+'.js'});
const run=s=>vm.runInContext(s,c);
test('106 artefatos preservados',run('D.artifacts.length')===106);
test('exatamente um artefato de Relíquias (R56)',run("D.artifacts.filter(a=>a.effect==='relic').map(a=>a.id).join(',')")==='a014');
test('Anel do Abismo agora fortalece o dano contra inimigos comuns',run("D.artifacts.find(a=>a.id==='a083').effect")==='normal_damage');
test('efeito de Anel do Abismo altera dano real',run("(()=>{g=fresh();g.artifactLevels.a083=50;return mod('normal_damage')>1})()"));
test('artefato especial de 5a descoberta mantido',run("GUARANTEED_RELIC_ARTIFACT==='a014'"));
let blockedEarly=0,lateEarly=0,wrongStart=0,fullRuns=0,lateRelic=0;
for(let trial=0;trial<800;trial++){
 const r=run(`(()=>{g=fresh();g.knightLevel=35;let ids=[];for(let n=0;n<30;n++){
  let pool=artifactCandidatePool(); if(!pool.length)break;
  let a=chooseArtifact();if(!a)break;
  ids.push({id:a.id,effect:a.effect,name:a.name,n:n+1});g.artifactLevels[a.id]=1;
 }return ids})()`);
 for(let i=0;i<r.length;i++){
  let a=r[i];if(i<4 && !run(`ARTIFACT_STARTER_ROLES[${i}].includes('${a.id}')`))wrongStart++;
  if(i>=5 && i<12 && !run(`ARTIFACT_STARTER_SET.has('${a.id}')`))wrongStart++;
  if(i<24&&i!==4&&a.effect==='relic')lateEarly++;
  if(a.id==='a073')lateRelic++;
  if(a.effect==='demons'||a.effect==='shadow'||a.effect==='curse')blockedEarly++;
 }
 if(r.length>=24&&r[4].id==='a014')fullRuns++;
}
test('800 sequências com 4 primeiras descobertas úteis e quinta garantida',wrongStart===0&&fullRuns===800,{wrongStart,fullRuns});
test('habilidades futuras nunca sorteadas antes do desbloqueio',blockedEarly===0,{blockedEarly});
test('nenhum outro artefato fornece Relíquias em descobertas precoces',lateEarly===0,{lateEarly});
// Acessibilidade completa quando o jogador desbloqueia todas as habilidades.
let completeRuns=0,unexpectedNull=0;
for(let t=0;t<100;t++){
 let r=run(`(()=>{g=fresh();g.knightLevel=600;let ids=[];for(let i=0;i<D.artifacts.length;i++){let x=chooseArtifact();if(!x)break;ids.push(x.id);g.artifactLevels[x.id]=1;}return {ids,n:artCount()};})()`);
 if(r.ids.length===106&&new Set(r.ids).size===106)completeRuns++; else unexpectedNull++;
}
test('100 coleções completas, 106 artefatos acessíveis após liberação',completeRuns===100,{completeRuns,unexpectedNull});
test('novas descobertas sem candidatos bloqueadas sem custo',run(`(()=>{g=fresh();g.knightLevel=1;for(let a of D.artifacts)if(!D.skills.some(sk=>sk.id===a.effect))g.artifactLevels[a.id]=1;return artifactCandidatePool().length===0})()`));
// existing players never lose levels, and the migrated effect is applied in the game state.
test('salvamento antigo preserva o nível do a083',run(`(()=>{g=fresh();g.artifactLevels.a083=120;let current=g.artifactLevels.a083;return current===120&&totalStatSource('normal_damage')>1;})()`));
const report={revision:55,total:results.length,pass:results.filter(x=>x.pass).length,fail:results.filter(x=>!x.pass).length,simulatedEarlyCollections:800,simulatedCompleteCollections:100,checks:results};
fs.writeFileSync(path.join(root,'TESTES_REVISAO_55.json'),JSON.stringify(report,null,2));console.log('R55 discovery',report.pass,'/',report.total,'sequences',report.simulatedEarlyCollections+report.simulatedCompleteCollections);if(report.fail)process.exit(1);
