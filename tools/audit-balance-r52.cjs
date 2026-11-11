const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=process.argv[2]||path.resolve(__dirname,'..');
function node(){return new Proxy({style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},children:[],append(){},remove(){},getContext(){return new Proxy({}, {get:()=>()=>{}})},setAttribute(){},addEventListener(){}},{get(o,k){if(k in o)return o[k];return ()=>{}},set(o,k,v){o[k]=v;return true;}})}
const doc={querySelector:()=>node(),querySelectorAll:()=>[],createElement:()=>node(),addEventListener(){},hidden:true};
const c={console,document:doc,performance:{now:()=>0},Image:class{},Audio:class{play(){return Promise.resolve()}},setInterval(){},setTimeout(){},Date,Math,Array,Uint8Array,Int32Array,Map,Set,parseInt,Number,Object,JSON};c.window=c;c.window.__assetUrls={arena:''};c.window.localStorage={getItem(){return null},setItem(){}};c.window.addEventListener=()=>{};vm.createContext(c);
for(const src of ['data','game'])vm.runInContext(fs.readFileSync(path.join(root,`src/${src}.js`),'utf8'),c,{filename:src+'.js'});
let js=`
function _snap(s,d,rate=1.0,seed=0,mode='all'){
 g=fresh();g.stage=s;g.difficulty=d;g.worldPrestiges=d;g.highest[d]=Math.max(g.highest[d],s);
 const n=(d*24000+s);
 g.knightLevel=Math.min(60000,Math.max(1,Math.round((Math.log(1.0834)/Math.log(1.20))*n)));
 if(mode==='lowlevel')g.knightLevel=Math.max(1,Math.floor(g.knightLevel*.9));
 const relicLog=Math.log(5)+Math.log(1.052)*Math.max(0,n-30);
 const discovered=Math.max(0,Math.min(D.artifacts.length,Math.floor(1+(relicLog-Math.log(12))/Math.log(1.73))));
 let baseLv=Math.max(0,Math.floor(rate*Math.min(2300000,Math.max(0,(relicLog-Math.log(Math.max(1,discovered))-1.3*Math.log(Math.max(2,n*10)))/Math.log(1.003)))));
 if(mode!=='noart')for(const [ix,a] of D.artifacts.entries())if(ix<discovered)g.artifactLevels[a.id]=a.maxLevel?Math.min(80,Math.floor(baseLv*.3)):Math.floor(baseLv*(1+Math.sin(ix*3.17+seed)*.17));
 if(mode!=='nohero')for(const [ix,h] of D.heroes.entries()){
   const hl=Math.min(8000,Math.max(0,Math.floor(6+20*Math.log1p(n)*(1+Math.cos(ix*.62+seed)*.25)*rate)));
   g.heroLevels[h.id]=hl;g.heroUpgradeProgress[h.id]=hl;
 }
 if(mode!=='nopet')for(const [ix,p] of D.pets.entries())g.petLevels[p.id]=Math.max(1,Math.floor(1+Math.pow(n,.41)*rate*(1+Math.sin(ix*.3+seed)*.3)));
 if(mode!=='noscroll')for(const [ix,sc] of D.scrolls.entries())g.scrollLevels[sc.id]=Math.max(1,Math.floor(1+Math.pow(n,.38)*rate*(1+Math.cos(ix*.17+seed)*.4)));
 if(mode!=='nogear'){
  const grade=Math.max(0,d);const rarity=Math.min(4,Math.floor(1+Math.log2(1+n/100)));
  for(const [ix,slot] of SLOTS.entries()){
   const effects=['physical','faith','gold_monsters','aura_weapon','magic'];
   g.equipped[slot]={slot,rarity,level:s,difficulty:d,effect:effects[ix],value:slot==='Aura'?auraAmplificationAt(s,d,rarity):gearValueAt(s,d,rarity),affixes:[]};
  }
 }
 if(mode!=='noskills')for(const sk of D.skills){for(const node of sk.nodes.slice(0,4))g.talents[node.id]=Math.min(node.ranks,Math.floor(Math.log1p(n)/3));}
 const total=enemyHealth(s,d).log10();
 const components=[damage().log10(),faithDamage().log10(),magicDamage().log10()];
 const peak=Math.max(...components);
 return {stage:s,difficulty:d,level:g.knightLevel,artifactLevel:baseLv,normalHPlog10:total,physicalLog10:components[0],faithLog10:components[1],magicLog10:components[2],bestHitHP:peak-total,rate,seed,mode};
}
`;
vm.runInContext(js,c);
const stages=[1,25,55,100,250,500,1000,2000,5000,10000,16000,24000];const seeds=[0,1,2,3,4];const modes=['all','noart','nohero','nopet','noscroll','nogear','noskills','lowlevel'];const results=[];
for(let d=0;d<5;d++)for(const stage of stages)for(const rate of [.65,1,1.5])for(const seed of seeds)for(const mode of modes){
 try{let out=vm.runInContext(`_snap(${stage},${d},${rate},${seed},'${mode}')`,c);results.push(out)}catch(e){console.error(d,stage,rate,seed,mode,e.stack);process.exit(1)}
}
const boundaries=[];for(let d=1;d<5;d++){const a=vm.runInContext(`_snap(24000,${d-1},1,0)`,c),b=vm.runInContext(`_snap(1,${d},1,0)`,c);boundaries.push({world:d+1,oldHP:a.normalHPlog10,newHP:b.normalHPlog10,ratioHPlog10:b.normalHPlog10-a.normalHPlog10,oldDPS:a.bestHitHP,newDPS:b.bestHitHP,playerLvlOld:a.level,playerLvlNew:b.level});}
const summary=[];for(let d=0;d<5;d++)for(const stage of [55,250,1000,5000,24000]){
 const group=results.filter(x=>x.difficulty===d&&x.stage===stage&&x.mode==='all');let vals=group.map(x=>x.bestHitHP).sort((a,b)=>a-b);
 summary.push({world:d+1,stage,logHitOverHP_min:+vals[0].toFixed(2),median:+vals[Math.floor(vals.length/2)].toFixed(2),max:+vals.at(-1).toFixed(2)});
}
const report={snapshots:results.length,summary,boundaries,docs:'Snapshots sintéticos do motor matemático; builds NÃO representam inventários realmente obtidos pela economia nem simulam horas, prestígios ou drops.',rates:[.65,1,1.5]};
fs.writeFileSync(path.join(root,'balance_matrix_'+(process.argv[3]||'r52')+'.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
