'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS R94',name)}
function game(){const r=runtime(root);r.run('startNew(1);');return r}
const close=(a,b)=>Math.abs(a-b)<1e-8*Math.max(1,Math.abs(a),Math.abs(b));
test('Cotação de 1x/10x/100x usa os mesmos custos da compra e não altera o estado',()=>{
 for(const count of [1,10,100]){
  const r=game();const x=r.run(`(()=>{g.artifactLevels.a001=4;relics=B(1e6);const a=D.artifacts.find(a=>a.id==='a001');const before=JSON.stringify(g.artifactLevels);const wallet=relics.save();const quote=artifactPurchasePlan(a,relics,${count});const afterQuote=JSON.stringify(g.artifactLevels);const walletAfter=relics.save();const buy=buyArtifactBudget(a,relics,${count});return {before,afterQuote,wallet,walletAfter,levels:quote.levels,purchased:buy.levels,quoted:quote.cost.save(),spent:buy.cost.save(),final:g.artifactLevels.a001}})()`);
  assert.equal(x.before,x.afterQuote);assert.deepEqual(Array.from(x.walletAfter),Array.from(x.wallet));
  assert.equal(x.levels,x.purchased);assert.deepEqual(Array.from(x.quoted),Array.from(x.spent));assert.equal(x.final,4+x.purchased);
 }
});
test('Percentual respeita orçamento e saldo final, sem relíquias grátis',()=>{
 const r=game();const x=r.run(`(()=>{g.artifactLevels.a002=2;relics=B(500);const a=D.artifacts.find(a=>a.id==='a002');artifactBuyMode='p25';const before=relics.save();const q=artifactCurrentPurchasePlan(a);const res=artifactUpgradeOne('a002');return {before,levels:q.levels,bought:res.levels,cost:q.cost.save(),spent:res.cost.save(),after:relics.save(),budget:B(before).mul(.25).save()};})()`);
 assert.equal(x.levels,x.bought);assert.ok(close(x.cost[0]*10**x.cost[1],x.spent[0]*10**x.spent[1]));
 const cost=x.cost[0]*10**x.cost[1],budget=x.budget[0]*10**x.budget[1];assert.ok(cost<=budget+1e-7);assert.ok(close(x.after[0]*10**x.after[1]+cost,500));
});
test('Cotação respeita artefato limitado, orçamento zero e recurso insuficiente',()=>{
 const r=game();const x=r.run(`(()=>{const max=D.artifacts.find(a=>a.maxLevel);g.artifactLevels[max.id]=max.maxLevel-1;relics=B(1e8);const last=artifactPurchasePlan(max,relics,1000);g.artifactLevels[max.id]=max.maxLevel;const done=artifactPurchasePlan(max,relics,1000);const other=D.artifacts.find(a=>!a.maxLevel);g.artifactLevels[other.id]=1;relics=B(0);const broke=artifactPurchasePlan(other,B(10),100);const none=artifactPurchasePlan(other,B(1e8),0);return {last:last.levels,done:done.levels,broke:broke.levels,none:none.levels}})()`);
 assert.deepEqual(JSON.parse(JSON.stringify(x)),{last:1,done:0,broke:0,none:0});
});
test('UPAR FAVORITOS de níveis alterna investimento em rodadas',()=>{
 const r=game();const x=r.run(`(()=>{const a=D.artifacts.find(a=>a.id==='a001'),b=D.artifacts.find(a=>a.id==='a002');g.artifactLevels.a001=1;g.artifactLevels.a002=1;g.artifactFavorites=['a001','a002'];const first=artUpgradeCost(a,1).add(artUpgradeCost(b,1));const second=artUpgradeCost(a,2).cmp(artUpgradeCost(b,2))<0?artUpgradeCost(a,2):artUpgradeCost(b,2);relics=first.add(second.mul(.2));const budget=relics.save();artifactBuyMode='n1000';const res=artifactUpgradeFavorites();return {a:g.artifactLevels.a001,b:g.artifactLevels.a002,bought:res.levels,spent:res.cost.save(),left:relics.save(),budget}})()`);
 assert.equal(x.a,2);assert.equal(x.b,2);assert.equal(x.bought,2);assert.ok(close(x.spent[0]*10**x.spent[1]+x.left[0]*10**x.left[1],x.budget[0]*10**x.budget[1]));
});
test('Investimento em favoritos mantém limites e rejeita gastar sem saldo',()=>{
 const r=game();const x=r.run(`(()=>{const a=D.artifacts.find(x=>x.maxLevel),b=D.artifacts.find(x=>!x.maxLevel);g.artifactLevels[a.id]=a.maxLevel-1;g.artifactLevels[b.id]=1;g.artifactFavorites=[a.id,b.id];relics=B(0);artifactBuyMode='n10';const none=artifactUpgradeFavorites();relics=B(1e10);const all=artifactUpgradeFavorites();return {none:none.levels,level:g.artifactLevels[a.id],cap:a.maxLevel,all:all.levels,balance:relics.m>=0}})()`);
 assert.equal(x.none,0);assert.equal(x.level,x.cap);assert.equal(x.balance,true);assert.ok(x.all>=1);
});
test('Painel de Artefatos mostra cotação somente quando solicitada e sem compra oculta',()=>{
 const r=game();const x=r.run(`(()=>{g.artifactLevels.a001=1;relics=B(10000);const before=relics.save(),lv=g.artifactLevels.a001;let panel=artifactsPanel();const hidden=!panel.includes('PRÉVIA SEM COMPRA');artifactQuoteId='a001';panel=artifactsPanel();const shown=panel.includes('PRÉVIA SEM COMPRA')&&panel.includes('Saldo depois')===false&&panel.includes('saldo depois');artifactBuyMode='n10';const change=artifactsPanel().includes('PRÉVIA SEM COMPRA (10×)');return {hidden,shown,change,before,after:relics.save(),lv,final:g.artifactLevels.a001}})()`);
 assert.ok(x.hidden);assert.ok(x.shown);assert.ok(x.change);assert.deepEqual(Array.from(x.before),Array.from(x.after));assert.equal(x.lv,x.final);
});
test('Painel do Cavaleiro projeta saldo e custo de descoberta sem creditar recursos',()=>{
 const r=game();const x=r.run(`(()=>{g.stage=55;g.runPeak=55;relics=B(200);const before=relics.save();const panel=knightPanel();return {forecast:panel.includes('Saldo previsto após prestígio'),discovery:panel.includes('Próxima descoberta'),before,after:relics.save(),prestiges:g.knightPrestiges}})()`);
 assert.equal(x.forecast,true);assert.equal(x.discovery,true);assert.deepEqual(Array.from(x.before),Array.from(x.after));assert.equal(x.prestiges,0);
});
test('Regras fundamentais de prestígio e preços do catálogo preservadas',()=>{
 const r=game();const x=r.run(`({first:FIRST_PRESTIGE_STAGE,floor:REPEAT_PRESTIGE_FLOOR,fraction:PRESTIGE_FRACTION,growth:RELIC_PRESTIGE_GROWTH,discover:artifactDiscoverCost(0).save(),nArts:D.artifacts.length,nUnique:D.uniques.length,nSets:D.sets.length,nSkills:D.skills.length})`);
 assert.equal(x.first,55);assert.equal(x.floor,30);assert.equal(x.fraction,.30);assert.equal(x.growth,1.024);assert.equal(x.discover[0],1.2);assert.equal(x.discover[1],1);assert.deepEqual([x.nArts,x.nUnique,x.nSets,x.nSkills],[106,16,16,9]);
});
test('Arte imutável continua com os hashes aprovados',()=>{
 const hashes=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [file,digest] of Object.entries(hashes))if(!['server/server.cjs','server/service.cjs'].includes(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),digest,file);
});
console.log(`R94 ${passed}/${passed} PASS`);
