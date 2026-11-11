/* VEILFALL R68 — multirank atlas. Separate layer: original R67 gameplay/raid code and art untouched. */
'use strict';
const P68={version:68,limits:{common:20,notable:15,travel:1,specialization:1,pact:1,keystone:1},skillGroups:{physical:['grace','fury','shadow'],magic:['flame_nova','arcane_focus','thunderstorm'],faith:['curse','demons','holy_spear']}};
function p68Price(n,rank){if(n.type==='origin'||rank<1||rank>(n.maxRank||1))return Infinity;if(n.type==='common')return 1+Math.floor((rank-1)/2);if(n.type==='notable')return 3+2*(rank-1);return n.cost;}
function p68Total(n,rank){const r=Math.max(0,Math.min(n.maxRank||1,Math.floor(rank)||0));if(n.type==='common'){const pairs=Math.floor(r/2);return pairs*(pairs+1)+(r%2)*(pairs+1);}if(n.type==='notable')return r*(r+2);return r*(n.cost||0);}
function p68At(angle,r,t=0){return p67Pos(angle,r,t);}
function p68Add(n){n.maxRank=P68.limits[n.type]||1;n.cost=p68Price(n,1);return p67Node(n);}
function p68Link(a,b){p67Edge(a,b);}
function p68Generate(){
 P67.nodes.length=0;P67.edges.length=0;P67.sectors.length=0;P67.byId.clear();P67.adj.clear();P67.owner=null;P67.cache={};
 p68Add({id:'origin',name:'O Juramento',type:'origin',sector:'origin',x:0,y:0,description:'Ponto de partida. O nível 1 libera o próximo caminho; níveis extras potencializam o talento.',effects:[]});
 const sectors=[['physical','FÍSICO','#eaa17f','⚔',-2.48],['magic','MAGIA','#82c8ef','✦',-.66],['faith','FÉ','#c8a0ed','✧',Math.PI/2]];
 for(const [id,name,color,icon,angle] of sectors)P67.sectors.push({id,name,color,icon,angle});
 const coreStats=[['damage',.004],['health',.007],['mana',.007],['attack_speed',.003],['mana_regen',.006],['crit_chance',.0008],['radius',.003],['defense',.003],['range',.004],['duration',.003],['cooldown',.001],['health_regen',.006],['crit_damage',.005]];
 p68Add({id:'core_center',name:'Determinação do Juramento',type:'common',sector:'origin',x:0,y:76,effects:[{stat:'damage',value:.004}]});p68Link('origin','core_center');
 for(let i=0;i<6;i++){
  const a=-Math.PI/2+i*Math.PI/3,travel='core_route_'+i;
  p68Add({id:travel,name:'Trilha do Juramento '+(i+1),type:'travel',sector:'origin',...p68At(a,140),effects:[],cost:1});p68Link('origin',travel);
  const [s,v]=coreStats[i];p68Add({id:'core_common_'+i,name:'Fundamento · '+(P67_LABELS[s]||EFFECT_LABELS[s]||s),type:'common',sector:'origin',...p68At(a,220),effects:[{stat:s,value:v}]});p68Link(travel,'core_common_'+i);
  p68Add({id:'core_notable_'+i,name:['Disciplina do Cavaleiro','Foco Marcial','Convergência Interior','Vontade de Ferro','Alma Renovada','Vigília do Juramento'][i],type:'notable',sector:'origin',...p68At(a,336),effects:[{stat:s,value:v*1.7},{stat:'damage',value:.003}]});p68Link('core_common_'+i,'core_notable_'+i);
  const [s2,v2]=coreStats[i+6];p68Add({id:'core_common_'+(i+6),name:'Prática · '+(P67_LABELS[s2]||EFFECT_LABELS[s2]||s2),type:'common',sector:'origin',...p68At(a,276,68),effects:[{stat:s2,value:v2}]});p68Link('core_common_'+i,'core_common_'+(i+6));p68Link('core_common_'+(i+6),'core_notable_'+i);
 }
 // 13th neutral common is the central node above. Neutral connectors are exclusively the six radial routes.
 const skillFamilies={
  grace:['Pulso Solar','Irradiação','Persistência','Ritmo Sagrado','Recuperação','Graça em Combate','Aliança Sombria'],
  fury:['Fervor','Ritmo Marcial','Arco de Impacto','Martírio Prolongado','Ataque Decisivo','Graça Marcial','Execução'],
  shadow:['Corte Profano','Alcance Sombrio','Área da Passagem','Frequência','Precisão Letal','Pacto da Graça','Ecos de Impacto'],
  flame_nova:['Potência Ígnea','Expansão','Ignição','Ricochete','Alcance Incandescente','Ritmo de Combustão','Explosão Vinculada'],
  arcane_focus:['Concentração','Fluxo','Amplitude Arcana','Canalização','Economia de Mana','Poder da Nova','Poder das Brasas'],
  thunderstorm:['Núcleo Ardente','Cobertura','Persistência da Marca','Detonação','Propagação','Duração da Brasa','Nova Catalítica'],
  curse:['Condenação','Persistência Profana','Epidemia','Contágio','Círculo Maldito','Vulnerabilidade','Ceifa Sinérgica'],
  demons:['Legado da Legião','Marcha Eterna','Aura do Véu','Apoio Profano','Ressonância','Força da Maldição','Vigor da Ceifa'],
  holy_spear:['Corte Espectral','Fenda Ampliada','Ruptura','Exposição','Frequência Profana','Alcance do Véu','Maldição Reativa']};
 const stats=['power','radius','duration','range','power','cooldown','power'];
 const rates=[.007,.004,.004,.004,.007,.0012,.007];
 const notableIdentities={
  grace:['Coro da Aurora','Catedral Viva','Juramento Celestial'],fury:['Sangue de Guerra','Martírio Implacável','Condenação Marcial'],shadow:['Passo Espectral','Caminhos do Eclipse','Aliança das Sombras'],
  flame_nova:['Centelha Primordial','Anel da Fornalha','Combustão em Cascata'],arcane_focus:['Consciência Arcana','Foco de Horizonte','Convergência Elemental'],thunderstorm:['Brasa Latente','Manto Incandescente','Catálise da Nova'],
  curse:['Palavras Profanas','Peste do Véu','Liturgia da Ruína'],demons:['Coro de LEGION','Marcha dos Ecos','Voto de Maldição'],holy_spear:['Corte do Véu','Fenda da Perdição','Réquiem da Ceifa']};
 const notableStats={
  grace:[['duration',.006],['radius',.008],['power',.014]],fury:[['power',.014],['duration',.007],['power',.015]],shadow:[['crit_bonus',.003],['radius',.008],['power',.014]],
  flame_nova:[['power',.014],['radius',.008],['power',.015]],arcane_focus:[['duration',.006],['range',.008],['power',.014]],thunderstorm:[['duration',.008],['radius',.008],['power',.014]],
  curse:[['duration',.007],['radius',.008],['power',.014]],demons:[['duration',.008],['range',.008],['power',.014]],holy_spear:[['power',.014],['radius',.008],['power',.014]]};
 for(const sec of P67.sectors){
  const entry='way_'+sec.id+'_entry';p68Add({id:entry,name:'Portal de '+sec.name,type:'travel',sector:sec.id,...p68At(sec.angle,455),effects:[],cost:1});
  const near=sec.id==='physical'?'core_notable_5':sec.id==='magic'?'core_notable_1':'core_notable_3';p68Link(near,entry);
  const skills=P68.skillGroups[sec.id];
  for(let j=0;j<3;j++){
   const offset=(j-1)*.35,a=sec.angle+offset,id=skills[j],label=D.skills.find(s=>s.id===id).name,trail='way_'+sec.id+'_skill_'+j;
   p68Add({id:trail,name:'Trilha de '+label,type:'travel',sector:sec.id,...p68At(a,690),effects:[],cost:2});p68Link(entry,trail);
   const prefix='skill_'+id,base=835;
   const createCommon=(k,r,t,extra=[])=>p68Add({id:prefix+'_rank_'+k,name:label+' · '+skillFamilies[id][k],type:'common',sector:sec.id,skill:id,...p68At(a,r,t),effects:[{stat:stats[k],value:rates[k],skill:id},...extra]});
   const makeNotable=(k,r,t,extra=[])=>p68Add({id:prefix+'_notable_'+k,name:notableIdentities[id][k],type:'notable',sector:sec.id,skill:id,...p68At(a,r,t),effects:[{stat:notableStats[id][k][0],value:notableStats[id][k][1],skill:id},...extra]});
   createCommon(0,base,0);p68Link(trail,prefix+'_rank_0');
   makeNotable(0,935,0);p68Link(prefix+'_rank_0',prefix+'_notable_0');
   createCommon(1,1025,-90);createCommon(2,1025,90);p68Link(prefix+'_notable_0',prefix+'_rank_1');p68Link(prefix+'_notable_0',prefix+'_rank_2');
   createCommon(3,1120,-90);createCommon(4,1120,90);p68Link(prefix+'_rank_1',prefix+'_rank_3');p68Link(prefix+'_rank_2',prefix+'_rank_4');
   makeNotable(1,1210,0);p68Link(prefix+'_rank_3',prefix+'_notable_1');p68Link(prefix+'_rank_4',prefix+'_notable_1');
   createCommon(5,1305,-50);createCommon(6,1305,50);p68Link(prefix+'_notable_1',prefix+'_rank_5');p68Link(prefix+'_notable_1',prefix+'_rank_6');
   makeNotable(2,1400,0);p68Link(prefix+'_rank_5',prefix+'_notable_2');p68Link(prefix+'_rank_6',prefix+'_notable_2');
   for(let k=0;k<3;k++){const [variant,name,description]=P67_SPECS[id][k];p68Add({id:prefix+'_'+variant,name,description,type:'specialization',sector:sec.id,skill:id,variant,...p68At(a,1570,(k-1)*100),effects:[],cost:24});p68Link(prefix+'_notable_2',prefix+'_'+variant);}
  }
  // Extra notables connect two complementary skill clusters without requiring every cluster to be bought.
  const bridge='link_'+sec.id+'_synergy';const k1=skills[0],k2=skills[2];
  p68Add({id:bridge,name:'Convergência de '+sec.name,type:'notable',sector:sec.id,...p68At(sec.angle,1790),effects:[{stat:'damage',value:.006}],description:'Fortalece o conjunto de habilidades desta afinidade. Escolha uma ou ambas as rotas para alcançá-lo.'});
  p68Link('skill_'+k1+'_notable_2',bridge);p68Link('skill_'+k2+'_notable_2',bridge);
  const outer='way_'+sec.id+'_outer';p68Add({id:outer,name:'Passagem do Horizonte '+sec.name,type:'travel',sector:sec.id,...p68At(sec.angle,1930),effects:[],cost:3});p68Link(bridge,outer);
 }
 // Three remote, mutually costly economy branches; no global gold bonus hidden in a common node.
 const economy=[
  ['physical','monsters','Tributos de Guerra',[['gold_monsters',.018],['gold_boss',.018]],-0.56],
  ['magic','chesterson','Tesouros de Mimic',[['gold_mimic',.012],['mimic_chance',.0005]],.56],
  ['faith','fairy','Ofertas das Fadas',[['gold_fairy',.022],['fairy_rate',.001]],.56]];
 for(const [sec,source,label,statsPair,offset]of economy){const s=P67.sectors.find(x=>x.id===sec),a=s.angle+offset,pre='econ_'+source,entry=pre+'_entry';
  p68Add({id:entry,name:'Caminho de '+label,type:'travel',sector:sec,...p68At(a,850),effects:[],cost:3});p68Link('way_'+sec+'_entry',entry);
  for(let i=0;i<8;i++){const [stat,value]=statsPair[i%2];p68Add({id:pre+'_common_'+i,name:label+' · '+['Vestígios','Insígnias','Tributo','Saque','Reserva','Colheita','Abundância','Legado'][i],type:'common',sector:sec,...p68At(a,980+i*110,(i%2?65:-65)),effects:[{stat,value}]});p68Link(i?pre+'_common_'+(i-1):entry,pre+'_common_'+i);if(i>0&&i%2===0)p68Link(pre+'_notable_'+(i/2-1),pre+'_common_'+i);
   if(i%2){const k=Math.floor(i/2),effects=statsPair.map(([st,vl])=>({stat:st,value:vl*1.6}));p68Add({id:pre+'_notable_'+k,name:['Especialista em '+label,'Riqueza Concentrada','Pilhagem Especializada','Domínio da Colheita'][k],type:'notable',sector:sec,...p68At(a,1040+i*110,90),effects});p68Link(pre+'_common_'+i,pre+'_notable_'+k);}
  }
 }
 // Five established mutually exclusive-by-budget pacts, and five new keystones with trade-offs.
 const pacts=[['horizon','Horizonte Infinito','+35% de raio; -15% de dano global.','radius',.35,'damage',-.15,'physical'],['celerity','Pacto da Celeridade','+12% de redução de recarga; +20% de custo de mana.','cooldown',.12,'mana_saving',-.20,'magic'],['harvest','Tributo da Colheita','+25% de ouro; -12% de dano global.','gold',.25,'damage',-.12,'faith'],['convergence','Convergência','+25% de dano em área; ataques básicos causam 20% menos dano.','area',.25,'basic_damage',-.20,'physical'],['eternity','Vigília Eterna','+35% de duração; recarga base 12% maior.','duration',.35,'cooldown_base',.12,'faith']];
 for(const [j,[id,name,description,stat,value,neg,nv,sec]] of pacts.entries()){
  const s=P67.sectors.find(x=>x.id===sec),a=s.angle+(j%2===0?-.15:.15);p68Add({id:'pact_'+id,name,description,type:'pact',sector:sec,...p68At(a,2200+(j%2)*110),effects:[{stat,value},{stat:neg,value:nv},...(id==='harvest'?[{stat:'kill_mana',value:.6}]:[])],cost:65});p68Link('way_'+sec+'_outer','pact_'+id);
 }
 const keystones=[
  ['core','Juramento Partido','+16% de dano global, mas -10% de vida máxima.','core_notable_4','origin',0,560,[['damage',.16],['health',-.10]]],
  ['physical','Voto da Lâmina','+22% de dano físico, mas -12% de defesa.','way_physical_outer','physical',P67.sectors[0].angle,2130,[['physical',.22],['defense',-.12]]],
  ['magic','Fornalha do Eclipse','+22% de magia, mas +20% de custo de mana.','way_magic_outer','magic',P67.sectors[1].angle,2130,[['magic',.22],['mana_saving',-.20]]],
  ['faith','Condenação Sagrada','+22% de Fé, mas -12% de regeneração de vida.','way_faith_outer','faith',P67.sectors[2].angle,2130,[['faith',.22],['health_regen',-.12]]],
  ['fortune','Voto da Fortuna','+20% de ouro de fadas, mas -10% de dano global.','econ_fairy_notable_3','faith',P67.sectors[2].angle+.56,2100,[['gold_fairy',.20],['damage',-.10]]]
 ];
 for(const [id,name,description,from,sec,a,r,eff]of keystones){p68Add({id:'keystone_'+id,name,description,type:'keystone',sector:sec,...p68At(a,r),effects:eff.map(([stat,value])=>({stat,value})),cost:45});p68Link(from,'keystone_'+id);}
 for(const n of P67.nodes)n.search=(n.name+' '+(n.description||'')+' '+(n.skill?D.skills.find(s=>s.id===n.skill)?.name:'')+' '+n.effects.map(e=>P67_LABELS[e.stat]||EFFECT_LABELS[e.stat]||e.stat).join(' ')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(P67.nodes.length!==210||P67.byId.size!==210)throw Error('R68 tree should have exactly 210 unique nodes, got '+P67.nodes.length);
}
p68Generate();
p67Cost=function(levels=p67Levels()){let sum=0;for(const [id,rank]of Object.entries(levels||{})){const n=P67.byId.get(id);if(n&&id!=='origin')sum+=p68Total(n,Number(rank));}return sum;};
p67Reachable=function(levels){const seen=new Set(['origin']),stack=['origin'];while(stack.length){const at=stack.pop();for(const x of P67.adj.get(at)||[])if(levels?.[x]>0&&!seen.has(x)){seen.add(x);stack.push(x);}}return seen;};
p67Conflict=function(n,levels){if(!n)return 'Nó inexistente.';if(n.type==='specialization'&&!levels?.[n.id]&&P67.nodes.some(x=>x.type==='specialization'&&x.skill===n.skill&&levels?.[x.id]))return 'Uma transformação por habilidade. Restitua a atual para escolher outra.';if(n.type==='pact'&&!levels?.[n.id]&&P67.nodes.filter(x=>x.type==='pact'&&levels?.[x.id]).length>=2)return 'Até dois pactos globais ao mesmo tempo.';return '';};
p67Valid=function(levels,budget=g.talentPoints){const next={},specs=new Set();let pacts=0;
 for(const n of P67.nodes){const raw=levels?.[n.id];if(n.id==='origin'||!Number.isInteger(raw)||raw<1)continue;if(n.type==='specialization'&&specs.has(n.skill))continue;if(n.type==='specialization')specs.add(n.skill);if(n.type==='pact'&&pacts++>=2)continue;next[n.id]=Math.min(n.maxRank,raw);}
 const prune=()=>{const seen=p67Reachable(next);for(const id of Object.keys(next))if(!seen.has(id))delete next[id];};prune();
 let count=0;while(p67Cost(next)>Math.max(0,budget)&&count++<40000){const ids=Object.keys(next);if(!ids.length)break;const last=ids[ids.length-1];next[last]--;if(next[last]<=0)delete next[last];prune();}
 return next;
};
p67Commit=function(levels){if(!levels||typeof levels!=='object')return false;const legal=p67Valid(levels),expected=Object.fromEntries(Object.entries(levels).filter(([id])=>id!=='origin'));if(Object.keys(legal).length!==Object.keys(expected).length||Object.keys(legal).some(k=>legal[k]!==expected[k])||p67Cost(legal)>g.talentPoints)return false;g.passiveNodes={...legal};g.talentSpent=p67Cost(legal);g.passiveVersion=68;g.talents={};P67.owner=null;P67.revision++;uiDirty=true;return true;};
p67Migrate=function(data){const earned=Number(g.talentPoints);g.talentPoints=Number.isFinite(earned)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(earned))):0;
 const old=data.passiveVersion!==68;
 if(old){if(Array.isArray(g.passivePresets)&&g.passivePresets.length)g.passivePresetsR67=g.passivePresets;g.passivePresets=[];g.passiveNodes={};}else g.passiveNodes=p67Valid(data.passiveNodes,g.talentPoints);
 g.talentSpent=p67Cost(g.passiveNodes);g.passiveVersion=68;g.talents={};g.talentTreeVersion=TREE_SP_VERSION;P67.owner=null;P67.revision++;
 if(old&&g.talentPoints>0){g.logs=Array.isArray(g.logs)?g.logs:[];g.logs.unshift({s:g.stage,t:Date.now(),msg:'Árvore R68: '+g.talentPoints+' pontos permanentes preservados. Passivas da árvore anterior reembolsadas para redistribuição.'});}
};
p67Bonus=function(stat,skill=null){if(P67.owner!==g.passiveNodes){P67.cache={};for(const n of P67.nodes){const rank=g.passiveNodes?.[n.id]||0;if(rank>0)for(const e of n.effects){const key=(e.skill||'*')+':'+e.stat;P67.cache[key]=(P67.cache[key]||0)+e.value*rank;}}P67.owner=g.passiveNodes;}return P67.cache[(skill||'*')+':'+stat]||0;};
p67Route=function(id,levels=p67Levels()){const target=P67.byId.get(id);if(!target)return {ids:[],cost:0,error:'Nó desconhecido.'};const conflict=p67Conflict(target,levels);if(conflict)return {ids:[],cost:0,error:conflict};if(id==='origin'||levels?.[id])return {ids:[],cost:0};
 const dist=new Map([['origin',0]]),prev=new Map(),pending=new Set(['origin']);for(const [owned,r]of Object.entries(levels||{}))if(r>0&&P67.byId.has(owned)){dist.set(owned,0);pending.add(owned);}while(pending.size){let at=null,best=Infinity;for(const p of pending)if(dist.get(p)<best){at=p;best=dist.get(p);}pending.delete(at);if(at===id)break;for(const next of P67.adj.get(at)||[]){const n=P67.byId.get(next);if(p67Conflict(n,levels))continue;const step=levels?.[next]?0:p68Price(n,1);const alt=best+step;if(alt<(dist.get(next)??Infinity)){dist.set(next,alt);prev.set(next,at);pending.add(next);}}}
 if(!dist.has(id))return {ids:[],cost:0,error:'Caminho incompatível.'};const ids=[];let at=id;while(at!=='origin'&&!levels?.[at]){ids.unshift(at);at=prev.get(at);if(!at)return {ids:[],cost:0,error:'Caminho desconectado.'};}return {ids,cost:dist.get(id)};
};
p67Remove=function(id,levels=p67Levels()){const next={...levels};delete next[id];const reachable=p67Reachable(next);for(const x of Object.keys(next))if(!reachable.has(x))delete next[x];return {next,refund:p67Cost(levels)-p67Cost(next),removed:Object.keys(levels).filter(k=>!next[k])};};
function p68ChangeRank(id,levels,delta){const n=P67.byId.get(id);if(!n||n.type==='origin')return null;const wasOwned=!!levels[id];let next={...levels};if(delta<0&&next[id]){if(next[id]===1)return p67Remove(id,levels);next[id]=Math.max(1,next[id]+delta);return {next,refund:p67Cost(levels)-p67Cost(next),removed:[]};}
 if(delta>0){if(p67Conflict(n,next))return null;if(!next[id]){const path=p67Route(id,next);if(path.error)return null;for(const p of path.ids)next[p]=1;}next[id]=Math.min(n.maxRank,(wasOwned?levels[id]:0)+delta);if(p67Cost(next)>g.talentPoints)return null;return {next,refund:0,removed:[]};}return null;}
function p68UpToBudget(id,levels,quantity){const n=P67.byId.get(id);if(!n)return null;let next={...levels};if(!next[id]){const route=p67Route(id,next);if(route.error||route.cost>g.talentPoints-p67Cost(next))return null;for(const x of route.ids)next[x]=1;}
 const max=Math.min(n.maxRank,next[id]+quantity);while(next[id]<max){const c=p68Price(n,next[id]+1);if(p67Cost(next)+c>g.talentPoints)break;next[id]++;}return next;}
function p68Same(a,b){return JSON.stringify(Object.entries(a||{}).sort())===JSON.stringify(Object.entries(b||{}).sort());}
investedInTree=function(id){return P67.nodes.filter(n=>n.skill===id&&p67Levels()[n.id]).reduce((v,n)=>v+p68Total(n,p67Levels()[n.id]),0);};
const p68FreshBase=fresh;fresh=function(){return {...p68FreshBase(),passiveVersion:68,passiveNodes:{},passivePresets:[]};};
maximizeTestPassives=function(){if(!testMode)return false;const levels={};for(const n of P67.nodes){if(n.type==='origin')continue;if(n.type==='specialization'&&n.variant!==P67_SPECS[n.skill][0][0])continue;if(n.type==='pact'&&!['pact_horizon','pact_convergence'].includes(n.id))continue;levels[n.id]=n.maxRank;}g.talentPoints=Math.max(g.talentPoints,p67Cost(levels));p67Commit(levels);return g.talentSpent;};
testPassiveSummary=function(){const levels=p67Levels(),legal=P67.nodes.filter(n=>n.type!=='specialization'||n.variant===P67_SPECS[n.skill][0][0]).filter(n=>n.type!=='pact'||['pact_horizon','pact_convergence'].includes(n.id));return {testMode,complete:legal.every(n=>n.type==='origin'||levels[n.id]===n.maxRank),maxed:Object.keys(levels).length,total:legal.length-1,spent:g.talentSpent,points:g.talentPoints,version:68};};
