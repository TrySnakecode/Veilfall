/* R67: one costed graph. The UI, save validation and combat share this model. */
'use strict';
const P67={nodes:[],edges:[],byId:new Map(),adj:new Map(),sectors:[],revision:0,owner:null,cache:{}};
const P67_LABELS={radius:'Raio das habilidades',range:'Alcance de aquisição',mana_saving:'Economia de mana',kill_mana:'Mana por abate',power:'Potência da habilidade',crit_bonus:'Crítico da habilidade',gold_chesterson:'Ouro de Chesterson',basic_damage:'Dano dos ataques básicos',cooldown_base:'Recarga base'};
const P67_SPECS={
 grace:[['pilgrim','Peregrinação Solar','Cada pulso procura dois grupos, com 72% da potência por área.'],['cathedral','Catedral Viva','Pulsos consagram o solo por 2,4 s; os campos atingem novas levas.'],['procession','Procissão da Aurora','Três frentes solares atravessam grupos distintos, com 58% da potência por área.']],
 fury:[['rupture','Ruptura Carmesim','Cada terceiro ataque abre três explosões em grupos distintos.'],['momentum','Ímpeto do Mártir','Explosões ganham 25% de raio. Abates devolvem 0,16 s de recarga da Ira, até 1 s por segundo.'],['bloodroad','Estrada de Sangue','A cada 1,6 s, uma faixa de sangue atravessa os inimigos até um grupo distante.']],
 shadow:[['ricochet','Dança das Lâminas','O percurso visita oito grupos em vez de cinco; impactos causam 18% menos dano.'],['rift','Fendas do Horizonte','Trajetos causam dano em uma faixa larga. Até dois impactos por inimigo em cada percurso.'],['afterimage','Vestígios do Eclipse','Cada chegada deixa uma fenda que pulsa duas vezes. Até oito fendas ativas.']],
 curse:[['contagion','Contágio do Véu','Mortes amaldiçoadas geram explosões maiores. Até oito reações por evento, sem recursão.'],['miasma','Miasma Errante','Pulsos deixam campos que amaldiçoam e ferem também os inimigos que chegam depois.'],['eclipse','Eclipse Profano','A cada segundo, a maldição alcança três grupos distantes. +15% de dano periódico.']],
 demons:[['vanguard','Juramento da Vanguarda','Durante LEGION, todas as habilidades ganham 25% de raio. Heróis continuam exclusivamente passivos.'],['concord','Concórdia dos Trinta e Dois','Durante LEGION, +10% de redução de recarga e +15% de alcance das habilidades.'],['harvest','Estandarte da Colheita','Durante LEGION, abates recuperam 1,2 de mana, até 8/s, e concedem 20% de ouro de combate.']],
 flame_nova:[['comets','Enxame de Cometas','Cinco grupos recebem explosões, com 66% da potência normal por área.'],['supernova','Supernova Errante','Duas ondas adicionais procuram sobreviventes. Cada onda causa 55% do dano inicial; até dois acertos por inimigo.'],['furnace','Fornalha Itinerante','Três campos incandescentes pulsam por 3 s e incendeiam novas levas.']],
 thunderstorm:[['wildfire','Incêndio em Cadeia','Após 0,8 s, uma frente de fogo procura três grupos adicionais. Marcas detonam mais cedo, com até seis explosões por ciclo, sem recursão.'],['meteor','Chuva de Brasas','Cinco áreas recebem impactos em sequência, com 78% do dano por área.'],['brand','Coração Insaciável','Marcas persistem e propagam combustão para dois grupos a cada 1,3 s, durante 7 s.']],
 holy_spear:[['harvest','Colheita do Horizonte','A Ceifa atravessa cinco grupos com 72% do dano por área.'],['echo','Réquiem em Ondas','Uma segunda frente procura sobreviventes após 0,7 s, com 65% da potência inicial.'],['wake','Vigília do Véu','Cada área deixa um círculo que pulsa por 2,8 s e amaldiçoa novas levas.']],
 arcane_focus:[['overdrive','Sobrecarga Arcana','Durante Foco, +12% de redução de recarga e +15% de custo de mana.'],['prism','Prisma do Infinito','Durante Foco, Nova, Brasas e Ceifa atingem um grupo adicional, com impactos 12% menores.'],['flow','Fluxo Inesgotável','Durante Foco, -20% de custo de mana, +3 mana/s e +0,8 mana por abate, até 8/s.']]
};
const P67_THEMES=[
 ['physical','AÇO','#e89a79','⚔',[
 ['Disciplina da Lâmina','physical',.045,'attack_speed',.012],['Golpes Expansivos','area',.035,'radius',.018],['Ritmo da Caçada','attack_speed',.012,'range',.018],['Precisão Cruel','crit_chance',.005,'crit_damage',.03],['Marcha de Ferro','move_speed',.015,'physical',.045],['Quebra da Horda','normal_damage',.04,'area',.035],['Sangue Frio','health',.02,'defense',.015],['Domínio Marcial','physical',.06,'range',.02]]],
 ['faith','FÉ','#d8b9ff','✧',[
 ['Votos do Véu','faith',.045,'duration',.018],['Ritos Distantes','range',.02,'faith',.045],['Julgamento Amplo','radius',.018,'area',.035],['Vigília Sagrada','health_regen',.018,'faith',.045],['Sentença Persistente','duration',.02,'normal_damage',.035],['Convicção','crit_chance',.005,'crit_damage',.03],['Bênção da Travessia','move_speed',.015,'mana_regen',.018],['Domínio dos Ritos','faith',.06,'area',.035]]],
 ['magic','MAGIA','#82c8ef','✦',[
 ['Centelha Original','magic',.045,'mana',.018],['Circuito Elemental','mana_regen',.018,'magic',.045],['Expansão Arcana','radius',.018,'range',.02],['Chamas Persistentes','duration',.02,'magic',.045],['Conjuração Ágil','cooldown',.012,'mana_saving',.012],['Concentração','crit_chance',.005,'crit_damage',.03],['Destruição em Massa','area',.04,'normal_damage',.035],['Domínio Elemental','magic',.06,'range',.02]]],
 ['sustain','VITALIDADE','#8ed7b4','❖',[
 ['Fôlego da Jornada','mana_regen',.018,'health',.02],['Reserva Interior','mana',.018,'mana_saving',.012],['Passos Leves','move_speed',.015,'range',.018],['Restauração','health_regen',.02,'defense',.015],['Memória do Ritmo','cooldown',.012,'duration',.018],['Pele de Pedra','health',.025,'defense',.015],['Fôlego da Vitória','kill_mana',.08,'mana_regen',.02],['Travessia Eterna','duration',.02,'move_speed',.018]]],
 ['fortune','FORTUNA','#e4c47e','◆',[
 ['Espólios da Jornada','gold_monsters',.05,'gold_boss',.05],['Rastros de Ouro','gold',.02,'gold_mimic',.06],['Pactos das Fadas','gold_fairy',.06,'fairy_rate',.012],['Tesouro Oculto','gold_chesterson',.065,'gold_mimic',.06],['Vigília Próspera','gold_idle',.06,'gold',.02],['Sorte da Caçada','mimic_chance',.012,'gold_monsters',.05],['Tributo dos Guardiões','gold_boss',.06,'gold_fairy',.06],['Domínio da Fortuna','gold',.025,'gold_chesterson',.065]]]
];
function p67Node(n){n.effects=n.effects||[];P67.nodes.push(n);P67.byId.set(n.id,n);P67.adj.set(n.id,[]);return n;}
function p67Edge(a,b){if(!P67.byId.has(a)||!P67.byId.has(b))throw Error('Invalid constellation edge');P67.edges.push([a,b]);P67.adj.get(a).push(b);P67.adj.get(b).push(a);}
function p67Pos(a,r,t=0){return {x:Math.cos(a)*r-Math.sin(a)*t,y:Math.sin(a)*r+Math.cos(a)*t};}
function p67Build(){
 p67Node({id:'origin',name:'O Juramento',type:'origin',sector:'origin',x:0,y:0,cost:0,description:'Todo caminho começa aqui. Os pontos de Conhecimento são permanentes.'});
 const prices=[1,2,4,8,12,18,25,34];
 for(const [si,[id,name,color,icon,themes]]of P67_THEMES.entries()){
  const angle=-Math.PI/2+si*Math.PI*2/5;P67.sectors.push({id,name,color,icon,angle});
  p67Node({id:id+'_entry',name:'Caminho de '+name,type:'common',sector:id,cost:1,...p67Pos(angle,165),effects:[{stat:themes[0][1],value:themes[0][2]}]});p67Edge('origin',id+'_entry');
  for(const [d,[title,stat,value,other,ov]]of themes.entries()){
   const root=id+'_'+d,center=p67Pos(angle,360+d*245);
   p67Node({id:root+'_gate',name:title+' · Iniciação',type:'common',sector:id,cost:prices[d],...p67Pos(angle,270+d*245),effects:[{stat,value}]});p67Edge(d?id+'_'+(d-1)+'_notable':id+'_entry',root+'_gate');
   for(let j=0;j<8;j++){const a=angle+Math.PI+(j<4?-1:1)*(j%4+1)*Math.PI/5;
    p67Node({id:root+'_'+j,name:title+' · '+['Ímpeto','Prática','Fervor','Ascensão','Firmeza','Engenho','Vontade','Apogeu'][j],type:'common',sector:id,cost:prices[d],x:center.x+Math.cos(a)*92,y:center.y+Math.sin(a)*92,effects:[{stat:j%2?other:stat,value:j%2?ov:value}]});p67Edge(j%4?root+'_'+(j-1):root+'_gate',root+'_'+j);}
   p67Node({id:root+'_notable',name:title,type:'notable',sector:id,cost:6+prices[d]*2,...p67Pos(angle,452+d*245),effects:[{stat,value:value*2.5},{stat:other,value:ov*2}]});p67Edge(root+'_3',root+'_notable');p67Edge(root+'_7',root+'_notable');
  }
 }
 const groups={physical:['grace','fury','shadow'],faith:['curse','demons','holy_spear'],magic:['flame_nova','arcane_focus','thunderstorm']};
 for(const [sector,ids]of Object.entries(groups))for(const [i,id]of ids.entries()){
  const sk=D.skills.find(s=>s.id===id),a=P67.sectors.find(s=>s.id===sector).angle+(i%2?-.20:.20),center=p67Pos(a,690+i*500,i%2?-195:195),root='skill_'+id;
  p67Node({id:root,name:sk.name,type:'common',sector,skill:id,cost:2,x:center.x,y:center.y-135,effects:[{stat:'power',value:.06,skill:id}]});p67Edge(sector+'_'+i+'_notable',root);
  const stats=[['power',.065],['radius',.035],['range',.04],['cooldown',.018],['duration',.035],['mana_saving',.025],['power',.065],['crit_bonus',.015],['range',.04],['power',.065],['radius',.035],['mana_saving',.025]];
  if(['demons','arcane_focus','fury'].includes(id))for(const j of [1,7,10])stats[j]=j===7?['duration',.05]:['power',.065];
  if(['flame_nova','holy_spear','thunderstorm'].includes(id))stats[4]=['power',.065];
  for(let j=0;j<12;j++){const branch=Math.floor(j/4),step=j%4,[stat,value]=stats[j];p67Node({id:root+'_'+j,name:sk.name+' · '+(P67_LABELS[stat]||EFFECT_LABELS[stat]||stat)+' '+(step+1),type:'common',sector,skill:id,cost:[2,6,10][branch],x:center.x+(branch-1)*95,y:center.y-75+step*48,effects:[{stat,value,skill:id}]});p67Edge(step?root+'_'+(j-1):root,root+'_'+j);}
  p67Node({id:root+'_notable',name:'Maestria · '+sk.name,type:'notable',sector,skill:id,cost:12,x:center.x,y:center.y+125,effects:[{stat:'power',value:.12,skill:id},{stat:'range',value:.08,skill:id}]});for(const j of [3,7,11])p67Edge(root+'_'+j,root+'_notable');
  for(const [j,[variant,name,description]]of P67_SPECS[id].entries()){const n=p67Node({id:root+'_'+variant,name,description,type:'specialization',sector,skill:id,variant,cost:24,x:center.x+(j-1)*105,y:center.y+215});p67Edge(root+'_notable',n.id);}
 }
 for(let s=0;s<5;s++){const from=P67.sectors[s],to=P67.sectors[(s+1)%5];for(let j=0;j<2;j++){const id='bridge_'+s+'_'+j;p67Node({id,name:from.name+' & '+to.name,type:'common',sector:from.id,cost:20,...p67Pos(from.angle+(j+1)*Math.PI*2/15,1000),effects:[{stat:'range',value:.025},{stat:'damage',value:.025}]});p67Edge(j?'bridge_'+s+'_0':from.id+'_2_notable',id);if(j)p67Edge(id,to.id+'_2_notable');}}
 const pacts=[['horizon','Horizonte Infinito','+35% de raio; -15% de dano global.','radius',.35,'damage',-.15],['celerity','Pacto da Celeridade','+12% de redução de recarga; +20% de custo de mana.','cooldown',.12,'mana_saving',-.20],['harvest','Tributo da Colheita','+25% de ouro; +0,6 mana por abate; -12% de dano global.','gold',.25,'damage',-.12],['convergence','Convergência','+25% de dano em área; ataques básicos causam 20% menos dano.','area',.25,'basic_damage',-.20],['eternity','Vigília Eterna','+35% de duração; recarga base 12% maior.','duration',.35,'cooldown_base',.12]];
 for(const [i,[id,name,description,stat,value,penalty,pv]]of pacts.entries()){const sec=P67.sectors[i],n=p67Node({id:'pact_'+id,name,description,type:'pact',sector:sec.id,cost:65,...p67Pos(sec.angle,2390),effects:[{stat,value},{stat:penalty,value:pv},...(id==='harvest'?[{stat:'kill_mana',value:.6}]:[])]});p67Edge(sec.id+'_7_notable',n.id);}
 for(const n of P67.nodes)n.search=(n.name+' '+(n.description||'')+' '+(n.skill?D.skills.find(s=>s.id===n.skill).name:'')+' '+n.effects.map(e=>P67_LABELS[e.stat]||EFFECT_LABELS[e.stat]||e.stat).join(' ')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}
p67Build();
function p67Levels(){return g.passiveNodes||{};}
function p67Cost(levels=p67Levels()){return Object.keys(levels).reduce((sum,id)=>sum+(levels[id]&&P67.byId.get(id)?.cost||0),0);}
function p67Reachable(levels){const seen=new Set(['origin']),todo=['origin'];while(todo.length){const id=todo.pop();for(const next of P67.adj.get(id)||[])if(levels[next]&&!seen.has(next)){seen.add(next);todo.push(next);}}return seen;}
function p67Valid(levels,budget=g.talentPoints){
 const next={},exclusive=new Set();let pacts=0;for(const n of P67.nodes){if(n.id==='origin'||levels?.[n.id]!==1)continue;if(n.type==='specialization'){if(exclusive.has(n.skill))continue;exclusive.add(n.skill);}if(n.type==='pact'&&pacts++>=2)continue;next[n.id]=1;}
 let reachable=p67Reachable(next);for(const id of Object.keys(next))if(!reachable.has(id))delete next[id];
 if(p67Cost(next)>budget)for(const n of [...P67.nodes].reverse()){if(p67Cost(next)<=budget)break;if(next[n.id]){delete next[n.id];reachable=p67Reachable(next);for(const id of Object.keys(next))if(!reachable.has(id))delete next[id];}}
 return next;
}
function p67Commit(levels){const legal=p67Valid(levels);if(Object.keys(legal).length!==Object.keys(levels).filter(id=>id!=='origin').length)return false;g.passiveNodes={...legal};g.talentSpent=p67Cost();g.passiveVersion=67;g.talents={};P67.owner=null;P67.revision++;uiDirty=true;return true;}
function p67Migrate(data){const earned=Number(g.talentPoints);g.talentPoints=Number.isFinite(earned)?Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(earned))):0;const old=data.passiveVersion!==67;g.passiveNodes=old?{}:p67Valid(data.passiveNodes,g.talentPoints);g.talentSpent=p67Cost();g.passiveVersion=67;g.talents={};g.talentTreeVersion=TREE_SP_VERSION;P67.owner=null;P67.revision++;if(old&&g.talentPoints>0){g.logs=Array.isArray(g.logs)?g.logs:[];g.logs.unshift({s:g.stage,t:Date.now(),msg:'Constelação: '+g.talentPoints+' pontos permanentes preservados. As árvores anteriores foram reembolsadas para redistribuição.'});}}
function p67Bonus(stat,skill=null){if(P67.owner!==g.passiveNodes){P67.cache={};for(const n of P67.nodes)if(g.passiveNodes?.[n.id])for(const e of n.effects){const key=(e.skill||'*')+':'+e.stat;P67.cache[key]=(P67.cache[key]||0)+e.value;}P67.owner=g.passiveNodes;}return P67.cache[(skill||'*')+':'+stat]||0;}
function p67Spec(skill,levels=p67Levels()){return P67_SPECS[skill]?.find(([id])=>levels['skill_'+skill+'_'+id])?.[0]||null;}
function p67Conflict(n,levels){if(n.type==='specialization'&&p67Spec(n.skill,levels)&&!levels[n.id])return 'Uma transformação por habilidade. Restitua a atual para trocar.';if(n.type==='pact'&&!levels[n.id]&&P67.nodes.filter(x=>x.type==='pact'&&levels[x.id]).length>=2)return 'Até dois pactos globais podem permanecer ativos.';return '';}
function p67Route(id,levels=p67Levels()){
 const target=P67.byId.get(id);if(!target)return {ids:[],cost:0,error:'Nó desconhecido.'};const error=p67Conflict(target,levels);if(error)return {ids:[],cost:0,error};if(id==='origin'||levels[id])return {ids:[],cost:0};
 const dist=new Map([['origin',0]]),prev=new Map(),pending=new Set(['origin']);for(const n of Object.keys(levels))if(levels[n]){dist.set(n,0);pending.add(n);}
 while(pending.size){let at=null,best=Infinity;for(const n of pending)if(dist.get(n)<best){at=n;best=dist.get(n);}pending.delete(at);if(at===id)break;for(const next of P67.adj.get(at)||[]){const n=P67.byId.get(next);if(p67Conflict(n,levels))continue;const candidate=best+(levels[next]?0:n.cost);if(candidate<(dist.get(next)??Infinity)){dist.set(next,candidate);prev.set(next,at);pending.add(next);}}}
 if(!dist.has(id))return {ids:[],cost:0,error:'Caminho incompatível com a build.'};const ids=[];let at=id;while(at!=='origin'&&!levels[at]){ids.unshift(at);at=prev.get(at);if(!at)return {ids:[],cost:0,error:'Caminho indisponível.'};}return {ids,cost:dist.get(id)};
}
function p67Remove(id,levels=p67Levels()){const next={...levels};delete next[id];const keep=p67Reachable(next);for(const k of Object.keys(next))if(!keep.has(k))delete next[k];return {next,refund:p67Cost(levels)-p67Cost(next),removed:Object.keys(levels).filter(k=>!next[k])};}
const p67FreshBase=fresh;fresh=function(){return {...p67FreshBase(),passiveVersion:67,passiveNodes:{},passivePresets:[]};};
skillBonus=function(id,stat){return p67Bonus(stat,id);};goldBranchMultiplier=function(){return 1;};
const p67EconomyBase=economySourceMultipliers;
economySourceMultipliers=function(source){return p67EconomyBase(source)*(1+Math.max(-.5,p67Bonus('gold')))*(1+Math.max(-.5,p67Bonus('gold_'+source)))*(active.demons>0&&p67Spec('demons')==='harvest'&&['monsters','boss','mimic'].includes(source)?1.2:1);};
const p67ModBase=mod;
mod=function(effect){const base=p67ModBase(effect);if(['wood','stone','iron','forge'].includes(effect)||effect.startsWith('gold')||HIGH_SUPPORT_SET.has(effect))return base;const bonus=p67Bonus(effect);if(effect==='crit_chance')return Math.min(.90,base+bonus);if(['mana','mana_regen'].includes(effect))return Math.min(2.5,base+bonus);if(effect==='defense')return Math.min(1.65,base+bonus);return base*Math.max(.1,1+bonus);};
talentRequirements=function(){return {canBuy:false,cost:0,rank:0,points:g.talentPoints-g.talentSpent};};
investedInTree=function(id){return P67.nodes.filter(n=>n.skill===id&&p67Levels()[n.id]).reduce((v,n)=>v+n.cost,0);};
maximizeTestPassives=function(){if(!testMode)return false;const levels={};for(const n of P67.nodes)if(n.type!=='origin'&&(n.type!=='specialization'||n.variant===P67_SPECS[n.skill][0][0])&&(n.type!=='pact'||['pact_horizon','pact_convergence'].includes(n.id)))levels[n.id]=1;g.talentPoints=Math.max(g.talentPoints,p67Cost(levels));p67Commit(levels);return g.talentSpent;};
testPassiveSummary=function(){return {testMode,complete:Object.keys(p67Levels()).length>=550,maxed:Object.keys(p67Levels()).length,total:552,spent:g.talentSpent,points:g.talentPoints,version:67};};
