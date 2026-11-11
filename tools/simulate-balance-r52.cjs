const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=process.argv[2]||path.resolve(__dirname,'..');
function node(){return new Proxy({style:{},classList:{add(){},remove(){},toggle(){}},dataset:{},children:[],append(){},remove(){},getContext(){return new Proxy({}, {get:()=>()=>{}})},setAttribute(){},addEventListener(){},getBoundingClientRect(){return {x:0,y:0,width:1100,height:700}}},{get(o,k){if(k in o)return o[k];if(k==='textContent'||k==='innerHTML'||k==='value')return '';if(k==='firstElementChild')return {remove(){}};return ()=>{};},set(o,k,v){o[k]=v;return true;}})}
const doc={querySelector:()=>node(),querySelectorAll:()=>[],createElement:()=>node(),addEventListener(){},hidden:true};
const c={console,document:doc,performance:{now:()=>0},Image:class{constructor(){this.width=1000;this.height=700}},Audio:class{play(){return Promise.resolve()}},setInterval(){},setTimeout(){return 0},clearTimeout(){},Date,Math,Array,Uint8Array,Int32Array,Map,Set,parseInt,Number,Object,JSON,Buffer,Intl};
c.window=c;c.window.__assetUrls={arena:''};c.window.localStorage={getItem(){return null},setItem(){}};c.window.addEventListener=()=>{};
vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(root,'src/data.js'),'utf8'),c,{filename:'data.js'});
vm.runInContext(fs.readFileSync(path.join(root,'src/game.js'),'utf8'),c,{filename:'game.js'});
vm.runInContext(`renderAll=function(){};renderPanel=function(){};updateHeader=function(){};alertGame=function(){};feed=function(){};log=function(){};sound=function(){};`,c);
const code=fs.readFileSync(path.join(__dirname,'sim_core.js'),'utf8');vm.runInContext(code,c,{filename:'sim_core.js'});
const label=process.argv[3]||'r52';const duration=Number(process.argv[4]||600);const strategy=process.argv[6]||'balanced';const seeds=(process.argv[5]||'11,31,51').split(',').map(Number);
const results=[];for(const seed of seeds){const start=Date.now();let v=vm.runInContext(`__SIMRUN(${duration},${seed},'${strategy}',true)`,c);v.cpuMs=Date.now()-start;v.strategy=strategy;results.push(v);console.log(label,seed,duration,v.peak,v.deaths,v.prestiges,v.cpuMs,'ms',flush=true);}
fs.writeFileSync(path.join(root,`live_${label}_${duration}_${strategy}.json`),JSON.stringify(results,null,2));
