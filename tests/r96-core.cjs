'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
const test=(label,fn)=>{fn();passed++;console.log('PASS R96',label)};
const lab=()=>{const r=runtime(root);r.run('startNew(1)');return r};
const near=(a,b)=>Math.abs(a-b)<1e-9*Math.max(1,Math.abs(a),Math.abs(b));

test('As fórmulas dos pets passivos/equipados seguem o balanceamento R101',()=>{
 const r=lab();
 const samples=r.run('([0,1,20,100,150,1000].map(lv=>[lv,petContributionAt(lv,false),petContributionAt(lv,true)]))');
 for(const [lv,passive,selected] of samples){
  const base=.165*Math.pow(lv,1.085);
  assert.ok(near(passive,base*Math.min(1,.08+.92*lv/85)));
  assert.ok(near(selected,base*(1+Math.min(.33,.08+lv*.0025))));
 }
});
test('Equivalência matemática dos níveis e do mínimo dos pergaminhos',()=>{
 const r=lab();
 const samples=r.run('([0,1,10,100].flatMap(floor=>[0,1,12,100].map(lv=>[lv,floor,scrollContributionAt(lv,floor)])))');
 for(const [lv,floor,value] of samples)assert.ok(near(value,lv*.041*(1+.052*Math.pow(floor,.78))));
});
test('Dois pets com o mesmo efeito conservam bônus e afinidade ao trocar',()=>{
 const r=lab(),x=r.run(`(()=>{
  g.petLevels.p03=100;g.petLevels.p06=70;g.petLevels.p17=60;
  g.petSelected=['p03','p17'];const before=mod('shadow'),sameGroup=g.petSelected[1];
  onAction('petEquip','p06','');const after=mod('shadow');
  return {before,after,selection:[...g.petSelected],sameGroup,p3:petContributionAt(100,false),p6:petContributionAt(70,true),expected:1+petContributionAt(100,false)+petContributionAt(70,true)};
 })()`);
 assert.deepEqual(new Set(Array.from(x.selection)),new Set(['p06','p17']));
 assert.equal(x.sameGroup,'p17');
 assert.ok(x.before>0&&x.after>0);
 assert.ok(near(x.after,x.expected),JSON.stringify(x));
});
test('Painel mostra contribuição passiva e do pet equipado sem modificar o save',()=>{
 const r=lab(),x=r.run(`(()=>{
  g.petLevels.p01=50;g.petLevels.p02=40;g.petLevels.p17=55;g.petSelected=['p01','p17'];
  const snap=JSON.stringify(g),panel=petsPanel();
  return {same:snap===JSON.stringify(g),label:panel.includes('Bônus passivo desta criatura'),swap:panel.includes('perde'),base:panel.includes('Se equipada:'),size:panel.length};
 })()`);
 assert.ok(x.same&&x.label&&x.swap&&x.base);assert.ok(x.size>2000);
});
test('Sem pergaminhos o mínimo é zero e todos devem aparecer como pendentes',()=>{
 const r=lab(),x=r.run(`(()=>{const p=scrollProgress(),panel=scrollsPanel();return {p,panel:panel.includes('Faltam subir pelo menos um nível em cada um dos <b>32</b>')}})()`);
 assert.deepEqual(JSON.parse(JSON.stringify(x.p)),{minimum:0,atMinimum:32,aboveMinimum:0,total:32});assert.equal(x.panel,true);
});
test('Filtro mostra apenas pergaminhos no nível mínimo',()=>{
 const r=lab(),x=r.run(`(()=>{
  for(const sc of D.scrolls)g.scrollLevels[sc.id]=5;
  g.scrollLevels.s03=3;
  const p=scrollProgress(),listAll=scrollsPanel();
  onAction('scrollMinFilter','','');const listMin=scrollsPanel();
  const filtered=scrollMinOnly;
  onAction('scrollMinFilter','','');
  return {p,filtered,reset:!scrollMinOnly,all:listAll.includes(D.scrolls.find(s=>s.id==='s01').name),min:listMin.includes(D.scrolls.find(s=>s.id==='s03').name),hidden:!listMin.includes(D.scrolls.find(s=>s.id==='s01').name)};
 })()`);
 assert.deepEqual(JSON.parse(JSON.stringify(x.p)),{minimum:3,atMinimum:1,aboveMinimum:31,total:32});
 assert.ok(x.filtered&&x.reset&&x.all&&x.min&&x.hidden,JSON.stringify(x));
});
test('Ao elevar o último pergaminho, o nível global da coleção aumenta exatamente uma vez',()=>{
 const r=lab(),x=r.run(`(()=>{for(const sc of D.scrolls)g.scrollLevels[sc.id]=4;g.scrollLevels.s32=3;
  const before=scrollProgress(),old=scrollContributionAt(4,before.minimum);
  g.scrollLevels.s32=4;const after=scrollProgress(),now=scrollContributionAt(4,after.minimum);
  return {before,after,old,now};
 })()`);
 assert.equal(x.before.minimum,3);assert.equal(x.before.atMinimum,1);
 assert.equal(x.after.minimum,4);assert.equal(x.after.atMinimum,32);assert.ok(x.now>x.old);
});
test('Filtro e painéis não alteram relíquias, pets, heróis, pergaminhos ou saves',()=>{
 const r=lab(),x=r.run(`(()=>{
  g.petLevels.p01=25;g.petSelected=['p01'];g.scrollLevels.s01=7;g.heroLevels.h01=50;
  const before=JSON.stringify(g);const s=String(safeStorage.getItem(BKEY+1));
  onAction('scrollMinFilter','','');scrollsPanel();petsPanel();heroesPanel();
  return {same:before===JSON.stringify(g),saved:s===String(safeStorage.getItem(BKEY+1)),version:g.version};
 })()`);
 assert.deepEqual(JSON.parse(JSON.stringify(x)),{same:true,saved:true,version:1});
});
test('R96 corrige texto dos marcos por posição sem alterar a fórmula',()=>{
 const r=lab(),x=r.run(`(()=>({factor:heroRankPassiveMultiplier(D.heroes[10]),rank:heroRank(D.heroes[10]),step:HERO_RANK_PASSIVE_STEP,html:heroesPanel().includes('+2,5% por rank')}))()`);
 assert.ok(near(x.factor,1+x.rank*x.step));assert.ok(near(x.step,.025));assert.ok(x.html);
});
test('Artes e mídia imutáveis permanecem idênticas ao manifesto aprovado',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/R84_IMMUTABLE_ASSETS.json'),'utf8'));
 for(const [file,hash] of Object.entries(manifest))if(!['server/server.cjs','server/service.cjs'].includes(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,file);
});
console.log(`R96 ${passed}/${passed} PASS`);
