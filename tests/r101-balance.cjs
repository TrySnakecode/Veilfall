'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const runtime=require('../tools/runtime-r67.cjs');
const root=path.resolve(__dirname,'..');
let n=0;
const check=(name,fn)=>{fn();console.log('PASS R101:',name);n++};
const lab=()=>{const rt=runtime(root);rt.run('startNew(1)');return rt};
const near=(a,b)=>Math.abs(a-b)<Math.max(1e-9,Math.abs(a)*1e-9);
check('Madeira é mais abundante; pedra intermediária; ferro mais raro e mais valioso',()=>{
 const r=lab(),v=r.run('({rates:VILLAGE_RESOURCE_RATES,prices:VILLAGE_RESOURCE_PRICES,oldRevenue:3600*.028*(.6+1.9+4.2)})');
 const q=JSON.parse(JSON.stringify(v));
 assert.ok(q.rates.wood>q.rates.stone&&q.rates.stone>q.rates.iron);
 assert.ok(q.prices.iron>q.prices.stone&&q.prices.stone>q.prices.wood);
 const newRevenue=3600*Object.entries(q.rates).reduce((sum,[id,rate])=>sum+rate*q.prices[id],0);
 assert.ok(newRevenue<q.oldRevenue*.40&&newRevenue>0);
});
check('Online e offline produzem a mesma quantidade de cada material',()=>{
 const a=lab().run(`(()=>{updateVillage(1800);return {...g.village}})()`);
 const b=lab().run(`(()=>{offline(1800);return {...g.village}})()`);
 for(const id of ['wood','stone','iron'])assert.ok(near(a[id],b[id]));
 for(const [id,rate] of Object.entries({wood:.016,stone:.010,iron:.006}))assert.ok(near(a[id],1800*rate));
});
check('Serraria exige mais madeira, pedreira exige mais pedra, mina exige mais ferro',()=>{
 const r=lab(),v=r.run("({wood:buildingCost('wood'),stone:buildingCost('stone'),iron:buildingCost('iron'),pet:buildingCost('pet')})");
 assert.deepEqual(JSON.parse(JSON.stringify(v)),{
  wood:{wood:70,stone:28,iron:12},stone:{wood:26,stone:70,iron:18},iron:{wood:24,stone:32,iron:60},pet:{wood:30,stone:30,iron:30}
 });
 const higher=r.run("(()=>{g.buildings.iron=10;return buildingCost('iron')})()");
 assert.ok(higher.iron>v.iron.iron*10);
});
check('Comprar melhoria desconta apenas os três valores indicados e nunca permite saldo negativo',()=>{
 const r=lab(),v=r.run(`(()=>{
  g.village={wood:70,stone:28,iron:12,forge:0,banknotes:0};
  onAction('building','wood','');const bought={lv:g.buildings.wood,wood:g.village.wood,stone:g.village.stone,iron:g.village.iron};
  onAction('building','wood','');return {bought,second:g.buildings.wood,panel:villagePanel()};
 })()`);
 assert.deepEqual(JSON.parse(JSON.stringify(v.bought)),{lv:2,wood:0,stone:0,iron:0});assert.equal(v.second,2);
 assert.ok(v.panel.includes('madeira')&&v.panel.includes('ferro'));
});
check('Pets Reliquary e Omen não existem nem podem ser sorteados',()=>{
 const r=lab(),v=r.run(`(()=>{
  Math.random=()=>.999999;
  const names=D.pets.map(p=>p.name),effects=D.pets.map(p=>p.effect);
  const last=rollPet();return {total:D.pets.length,names,effects,last:last.id};
 })()`);
 assert.equal(v.total,30);assert.equal(v.names.includes('Reliquary'),false);assert.equal(v.names.includes('Omen'),false);
 assert.ok(!v.effects.includes('relic')&&!v.effects.includes('drop'));
 assert.equal(v.last,'p31');
});
check('Migração de pets antigos mantém cada nível e a seleção, sem duplicar após recarregar',()=>{
 const r=lab(),v=r.run(`(()=>{
  g.petLevels={p19:5,p28:3,p30:7,p32:11};g.petSelected=['p01','p32'];g.petCatalogVersion=1;
  save(1,true);const one=load(1);
  const state1={levels:{...g.petLevels},selection:[...g.petSelected],version:g.petCatalogVersion};
  const two=load(1);
  return {one,two,state1,state2:{levels:{...g.petLevels},selection:[...g.petSelected],version:g.petCatalogVersion}};
 })()`);
 assert.ok(v.one&&v.two);assert.equal(v.state1.levels.p19,12);assert.equal(v.state1.levels.p28,14);
 assert.equal(v.state1.levels.p30,undefined);assert.equal(v.state1.levels.p32,undefined);
 assert.deepEqual(JSON.parse(JSON.stringify(v.state1)),JSON.parse(JSON.stringify(v.state2)));
 assert.ok(v.state1.selection.includes('p28'));
});
check('Pets melhoram em 1/10/100 níveis sem alterar teto de atributos de suporte',()=>{
 const r=lab(),v=r.run(`(()=>{
  const levels=[1,10,100].map(lv=>({lv,passive:petContributionAt(lv,false),equipped:petContributionAt(lv,true)}));
  g.petLevels.p19=100;g.petSelected=['p19'];const defense=mod('defense');
  return {levels,defense};
 })()`);
 for(const {lv,passive,equipped} of v.levels){assert.ok(passive>=0&&equipped>passive);const old=.115*Math.pow(lv,1.075)*(1+Math.min(.25,.04+lv*.002));assert.ok(equipped>old);}
 assert.ok(v.defense<=1.20+1e-8);
});
check('Scrolls agora progridem mais que R100 em níveis 1,10,100',()=>{
 const r=lab(),v=r.run('([1,10,100].map(lv=>({lv,value:scrollContributionAt(lv,lv),floor:scrollSetMultiplierAt(lv)})))');
 for(const {lv,value,floor} of v){assert.ok(value>lv*.029*(1+.021*Math.pow(lv,.85)));assert.ok(floor>1);}
});
check('Armas mais fortes por duplicata, sem modificar o bônus x2 de cada conjunto',()=>{
 const r=lab(),v=r.run(`(()=>{
  R52.profile=VeilRaid.freshProfile();
  const values=[0,1,10,100].map(lv=>r101HeroWeaponIndividualMultiplier(lv));
  g.heroLevels.h01=120;
  const before=r52Contribution(D.heroes[0]).num(1e18);
  R52.profile.weapons.h01=10;r52RefreshFactors();
  const after=r52Contribution(D.heroes[0]).num(1e18);
  for(const id of VeilRaid.HERO_IDS)R52.profile.weapons[id]=1;
  r52RefreshFactors();
  return {values,before,after,sets:R52.setCount,factor:r52WeaponFactor('h01').num(100),base:r101HeroWeaponIndividualMultiplier(1)};
 })()`);
 assert.ok(near(v.values[0],1));assert.ok(v.values[1]>1.15&&v.values[2]>2.5&&v.values[3]>16);
 assert.ok(v.after>v.before);assert.equal(v.sets,1);assert.ok(near(v.factor,2*v.base));
});
check('O motor de combate das raids não foi alterado',()=>{
 const before=path.resolve(root,'../VEILFALL_R100/shared/raid-engine.js');
 const a=fs.readFileSync(before),b=fs.readFileSync(path.join(root,'shared/raid-engine.js'));
 assert.equal(crypto.createHash('sha256').update(a).digest('hex'),crypto.createHash('sha256').update(b).digest('hex'));
});
console.log(`R101 ${n}/${n} PASS`);
