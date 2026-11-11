'use strict';
const UI67={selected:'origin',draft:null,owner:null,undo:[],query:'',filter:'all',zoom:.42,x:0,y:0,placed:false,drag:null,suppress:false,revision:-1};
// Apply campaign passives after the Arsenal's support wrapper; retain its global cap.
const r67SupportBase=specialSupportBreakdown;
specialSupportBreakdown=function(effect){const base=r67SupportBase(effect),passive=Math.max(0,p67Bonus(effect));return {...base,passive,total:Math.min(.8,base.total+passive)};};
function r67Draft(){if(UI67.owner!==g||!UI67.draft){UI67.owner=g;UI67.draft={...p67Levels()};UI67.undo=[];}return UI67.draft;}
function r67Dirty(){return Object.keys(r67Draft()).sort().join('|')!==Object.keys(p67Levels()).sort().join('|');}
function r67DraftSet(levels){UI67.undo.push({...r67Draft()});if(UI67.undo.length>30)UI67.undo.shift();UI67.draft={...levels};r67RefreshTree();}
function r67Color(n){return P67.sectors.find(s=>s.id===n.sector)?.color||'#e7d0a5';}
function r67Label(stat){return P67_LABELS[stat]||EFFECT_LABELS[stat]||stat;}
function r67Effect(e){return (e.value>=0?'+':'')+(e.stat==='kill_mana'?e.value.toFixed(2):(e.value*100).toFixed(e.value*100%1?1:0)+'%')+' '+r67Label(e.stat);}
function r67Title(n){return n.name+' · '+n.cost+' PT'+(n.effects.length?' · '+n.effects.map(r67Effect).join(' / '):'');}
skillTreePanel=function(){r67Draft();return `<div class="p67-workbench"><header class="p67-head"><div><span class="p67-eyebrow">ATLAS DE CONHECIMENTO · 574 NÓS</span><h2>Constelação do Véu</h2><p>Cinco caminhos. Um juramento. A sua forma de atravessar a horda.</p></div><button class="gamebtn muted" data-action="skillBack">← Habilidades</button></header>
 <div class="p67-toolbar"><label class="p67-search"><input id="p67-search" type="search" placeholder="Buscar habilidade, nome ou atributo…" aria-label="Buscar passivas" value="${esc(UI67.query)}"></label><select id="p67-filter" aria-label="Tipo de passiva"><option value="all">Todos os nós</option><option value="notable">Notáveis</option><option value="specialization">Especializações</option><option value="pact">Pactos globais</option><option value="allocated">Minha build</option></select><div class="p67-balance" id="p67-balance"></div></div>
 <nav class="p67-sectors" aria-label="Regiões da Constelação">${P67.sectors.map(s=>`<button data-p67="sector" data-id="${s.id}" style="--sector:${s.color}">${s.icon} ${s.name}</button>`).join('')}<button data-p67="origin">◎ Origem</button></nav>
 <div class="p67-workspace"><div class="p67-map-shell"><div id="p67-viewport" tabindex="0" aria-label="Mapa da Constelação. Arraste para mover; use mais e menos para ampliar."><div id="p67-map"><svg class="p67-lines" viewBox="0 0 5000 5000" aria-hidden="true">${[380,900,1400,1920,2390].map(r=>`<circle cx="2500" cy="2500" r="${r}"/>`).join('')}${P67.edges.map(([a,b])=>{const n=P67.byId.get(a),m=P67.byId.get(b);return `<line data-edge="${a}|${b}" x1="${n.x+2500}" y1="${n.y+2500}" x2="${m.x+2500}" y2="${m.y+2500}"/>`;}).join('')}</svg>${P67.sectors.map(s=>{const p=p67Pos(s.angle,2200);return `<div class="p67-sector-label" style="left:${p.x+2500}px;top:${p.y+2500}px;color:${s.color}">${s.name}</div>`;}).join('')}${P67.nodes.map(n=>`<button type="button" class="p67-node ${n.type}" data-p67="node" data-id="${n.id}" style="left:${n.x+2500}px;top:${n.y+2500}px;--node-color:${r67Color(n)}" title="${esc(r67Title(n))}" aria-label="${esc(r67Title(n))}"><span>${n.type==='origin'?'✥':n.type==='pact'?'⬡':n.type==='specialization'?'✦':n.type==='notable'?'❖':'·'}</span>${n.type!=='common'?`<small>${esc(n.name)}</small>`:''}</button>`).join('')}</div></div><div class="p67-map-heading"><b>O CONHECIMENTO É PERMANENTE</b><span id="p67-map-count"></span></div><div class="p67-map-controls"><button data-p67="zoomOut" aria-label="Diminuir zoom">−</button><span id="p67-zoom"></span><button data-p67="zoomIn" aria-label="Aumentar zoom">+</button><button data-p67="fit">Ver tudo</button></div><canvas id="p67-minimap" width="180" height="150" aria-label="Minimapa; clique para navegar"></canvas><div class="p67-map-help">Arraste para navegar · Role para ampliar</div></div><aside class="p67-detail" id="p67-detail" aria-live="polite"></aside></div>
 <footer class="p67-plan"><div><strong id="p67-plan-state"></strong><span id="p67-plan-cost"></span></div><div class="p67-plan-actions"><button class="gamebtn muted" data-p67="undo">Desfazer</button><button class="gamebtn muted" data-p67="cancel">Descartar</button><button class="gamebtn" data-p67="apply">Aplicar build</button></div></footer>
 <details class="p67-build-summary"><summary>Resumo da build e configurações</summary><div id="p67-summary"></div><div class="p67-preset-row">${[0,1,2].map(i=>`<div><b>Build ${i+1}</b><button class="gamebtn muted" data-p67="savePreset" data-id="${i}">Salvar</button><button class="gamebtn muted" data-p67="loadPreset" data-id="${i}">Planejar</button></div>`).join('')}<button class="gamebtn muted" data-p67="reset">Restituir todos os pontos</button></div><p>Uma especialização por habilidade; até dois pactos globais. Restituição gratuita. Cada primeiro chefe de Conhecimento, a cada 25 fases por mundo, concede um ponto permanente. No mapa: setas movem; + e − ampliam.</p></details></div>`;};
function r67RefreshTree(){const root=$('#p67-map');if(!root)return;const levels=r67Draft(),n=P67.byId.get(UI67.selected)||P67.byId.get('origin'),route=p67Route(n.id,levels),path=new Set(route.ids),spent=p67Cost(levels),available=g.talentPoints-spent,query=r66Norm(UI67.query).trim(),found=[];
 for(const el of root.querySelectorAll('.p67-node')){const node=P67.byId.get(el.dataset.id),owned=node.id==='origin'||!!levels[node.id],match=(!query||node.search.includes(query))&&(UI67.filter==='all'||UI67.filter==='allocated'&&owned||node.type===UI67.filter);el.classList.toggle('allocated',owned);el.classList.toggle('route',path.has(node.id));el.classList.toggle('selected',node.id===n.id);el.classList.toggle('dimmed',!match);el.setAttribute('aria-pressed',String(owned));if(match&&node.type!=='origin')found.push(node);}
 for(const el of root.querySelectorAll('[data-edge]')){const [a,b]=el.dataset.edge.split('|');el.classList.toggle('allocated',!!((a==='origin'||levels[a])&&(b==='origin'||levels[b])));el.classList.toggle('route',!!((path.has(a)||levels[a]||a==='origin')&&(path.has(b)||levels[b]||b==='origin')&&(path.has(a)||path.has(b))));}
 $('#p67-balance').innerHTML=`<strong>${fmt(available)}</strong><span>PONTOS DISPONÍVEIS</span><small>${fmt(spent)} investidos / ${fmt(g.talentPoints)} conquistados</small>`;$('#p67-balance').dataset.earned=g.talentPoints;$('#p67-map-count').textContent=Object.keys(levels).length+' nós no plano · '+(query||UI67.filter!=='all'?found.length+' encontrados':'27 transformações');
 const owned=!!levels[n.id],removal=owned?p67Remove(n.id,levels):null,conflict=p67Conflict(n,levels),type={origin:'ORIGEM',common:'PASSIVA COMUM',notable:'NOTÁVEL',specialization:'ESPECIALIZAÇÃO',pact:'PACTO GLOBAL'}[n.type];
 $('#p67-detail').innerHTML=`<div class="p67-detail-icon" style="--node-color:${r67Color(n)}">${n.type==='specialization'?'✦':n.type==='pact'?'⬡':'❖'}</div><span class="p67-eyebrow">${type}${n.skill?' · '+esc(D.skills.find(s=>s.id===n.skill).name):''}</span><h3>${esc(n.name)}</h3>${n.description?`<p>${esc(n.description)}</p>`:''}${n.effects.length?`<ul class="p67-effects">${n.effects.map(e=>`<li>${esc(r67Effect(e))}</li>`).join('')}</ul>`:''}${n.id==='origin'?'<p>Selecione um nó para ver seus efeitos e o caminho mais barato. As mudanças ficam em planejamento até você aplicar a build.</p><p>Escolha uma região ou busque uma habilidade.</p>':`<div class="p67-price"><span>Custo do nó</span><b>${n.cost} PT</b><span>${owned?'Restituição com conexões':'Caminho completo'}</span><b>${owned?removal.refund:route.cost} PT</b></div>${conflict||route.error?`<p class="p67-warning">${esc(conflict||route.error)}</p>`:owned?`<p>${removal.removed.length>1?removal.removed.length+' nós perderão a conexão e serão restituídos.':'Este nó já faz parte do plano.'}</p><button class="gamebtn muted block" data-p67="remove">Restituir ${removal.refund} PT</button>`:`<p>${route.ids.length} nó(s) no caminho${route.cost>available?' · faltam '+(route.cost-available)+' pontos':''}.</p><button class="gamebtn block" data-p67="route" ${route.cost>available?'disabled':''}>Planejar caminho</button>`}`}${n.skill?`<button class="gamebtn muted block" data-p67="skill" data-id="${n.skill}">Ver habilidade</button>`:''}${query||UI67.filter!=='all'?`<div class="p67-results"><b>${found.length} resultados</b>${found.slice(0,12).map(x=>`<button data-p67="result" data-id="${x.id}">${esc(x.name)}<small>${x.cost} PT</small></button>`).join('')}${found.length>12?'<small>Refine a busca para reduzir os resultados.</small>':''}</div>`:''}`;
 const dirty=r67Dirty();$('#p67-plan-state').textContent=dirty?'Planejamento de build':'Sua Constelação';$('#p67-plan-cost').textContent=dirty?`${spent-g.talentSpent>=0?'+':''}${spent-g.talentSpent} PT em relação à build atual · ainda não aplicado`:'Selecione nós e compare caminhos antes de investir.';document.querySelector('[data-p67="apply"]').disabled=!dirty||spent>g.talentPoints;document.querySelector('[data-p67="undo"]').disabled=!UI67.undo.length;document.querySelector('[data-p67="cancel"]').disabled=!dirty;
 const totals={};for(const id of Object.keys(levels))for(const e of P67.byId.get(id)?.effects||[]){const key=(e.skill?D.skills.find(s=>s.id===e.skill).name+' · ':'')+r67Label(e.stat);if(!totals[key])totals[key]={value:0,stat:e.stat};totals[key].value+=e.value;}
 $('#p67-summary').innerHTML=`<div class="p67-totals">${Object.entries(totals).map(([label,e])=>`<span>${esc(label)}<b>${e.value>=0?'+':''}${e.stat==='kill_mana'?e.value.toFixed(2):(e.value*100).toFixed(1)+'%'}</b></span>`).join('')||'<p>Nenhum ponto investido.</p>'}</div><p>Limites finais: recarga 80%; duração +80%; raio +85%; crítico 90% (95% nas habilidades); economia de mana 45%; mana e regeneração +150%; retorno por abate 8 mana/s. Bônus de fontes diferentes são combinados antes dos limites.</p>`;UI67.revision=P67.revision;r67Transform();
}
function r67Transform(){const m=$('#p67-map'),v=$('#p67-viewport');if(!m||!v)return;if(!UI67.placed){UI67.x=v.clientWidth/2-2500*UI67.zoom;UI67.y=v.clientHeight/2-2500*UI67.zoom;UI67.placed=true;}m.style.transform=`translate(${UI67.x}px,${UI67.y}px) scale(${UI67.zoom})`;$('#p67-zoom').textContent=Math.round(UI67.zoom*100)+'%';r67Mini();}
function r67Center(n,zoom=UI67.zoom){const v=$('#p67-viewport');if(!v)return;UI67.zoom=zoom;UI67.x=v.clientWidth/2-(n.x+2500)*zoom;UI67.y=v.clientHeight/2-(n.y+2500)*zoom;UI67.placed=true;r67Transform();}
function r67Zoom(factor,cx=null,cy=null){const v=$('#p67-viewport');if(!v)return;const old=UI67.zoom,next=clamp(old*factor,.10,1.65),x=cx??v.clientWidth/2,y=cy??v.clientHeight/2;UI67.x=x-(x-UI67.x)*next/old;UI67.y=y-(y-UI67.y)*next/old;UI67.zoom=next;r67Transform();}
function r67Mini(){const canvas=$('#p67-minimap'),v=$('#p67-viewport');if(!canvas||!v)return;const c=canvas.getContext('2d'),s=.028;c.clearRect(0,0,180,150);c.fillStyle='#08121be8';c.fillRect(0,0,180,150);for(const n of P67.nodes){c.fillStyle=r67Draft()[n.id]?r67Color(n):'#425264';c.beginPath();c.arc(90+n.x*s,75+n.y*s,n.type==='pact'?2:1,0,Math.PI*2);c.fill();}c.strokeStyle='#e5c88c';c.lineWidth=1;c.strokeRect(90+(-UI67.x/UI67.zoom-2500)*s,75+(-UI67.y/UI67.zoom-2500)*s,v.clientWidth/UI67.zoom*s,v.clientHeight/UI67.zoom*s);}
function r67TreeAction(action,id){const levels=r67Draft(),n=P67.byId.get(UI67.selected);
 if(action==='node'||action==='result'){UI67.selected=id;r67RefreshTree();if(action==='result')r67Center(P67.byId.get(id),.85);}
 if(action==='sector')r67Center(p67Pos(P67.sectors.find(s=>s.id===id).angle,800),.48);if(action==='origin'){UI67.selected='origin';r67Center({x:0,y:0},.48);r67RefreshTree();}
 if(action==='zoomIn')r67Zoom(1.22);if(action==='zoomOut')r67Zoom(1/1.22);if(action==='fit'){const v=$('#p67-viewport');r67Center({x:0,y:0},Math.max(.1,Math.min(v.clientWidth/4700,v.clientHeight/4700)));}
 if(action==='route'){const route=p67Route(n.id,levels);if(!route.error&&route.cost<=g.talentPoints-p67Cost(levels)){const next={...levels};for(const id of route.ids)next[id]=1;r67DraftSet(next);}}
 if(action==='remove')r67DraftSet(p67Remove(n.id,levels).next);if(action==='reset')r67DraftSet({});if(action==='undo'&&UI67.undo.length){UI67.draft=UI67.undo.pop();r67RefreshTree();}if(action==='cancel'){UI67.draft={...p67Levels()};UI67.undo=[];r67RefreshTree();}
 if(action==='apply'&&r67Dirty()){if(p67Commit(levels)){UI67.undo=[];UI67.draft={...p67Levels()};player.hp=Math.min(player.hp,maxHealth());player.mp=Math.min(player.mp,100*mod('mana'));save(g.slot,true);r67RefreshTree();alertGame('Build aplicada · '+g.talentSpent+' pontos investidos.');}else alertGame('Plano incompatível com os pontos ou conexões disponíveis.');}
 if(action==='savePreset'){g.passivePresets=Array.isArray(g.passivePresets)?g.passivePresets.slice(0,3):[];g.passivePresets[Number(id)]={nodes:{...levels}};save(g.slot,true);alertGame('Build '+(Number(id)+1)+' guardada para planejamento.');}
 if(action==='loadPreset'){const p=g.passivePresets?.[Number(id)];if(p?.nodes){const next=p67Valid(p.nodes,g.talentPoints);r67DraftSet(next);alertGame('Build carregada no plano'+(Object.keys(next).length<Object.keys(p.nodes).length?' · ajustada aos pontos disponíveis.':'.'));}else alertGame('Salve uma build neste espaço primeiro.');}
 if(action==='skill'){skillFocus=id;skillView='catalog';renderPanel();}
}
const r67PanelBase=renderPanel;renderPanel=function(preserve=false){const tree=tab==='skills'&&skillView==='tree'&&panelMode==='info';if(tree&&preserve&&$('#p67-map')){if(UI67.revision!==P67.revision)r67RefreshTree();else if(Number($('#p67-balance').dataset.earned)!==g.talentPoints)r67RefreshTree();uiDirty=false;return;}r67PanelBase(preserve);if(tree&&$('#p67-map')){$('#p67-filter').value=UI67.filter;r67RefreshTree();requestAnimationFrame(r67Transform);}};
const r67ActionBase=onAction;onAction=function(action,id,arg){if(['talent','talentRemove','talentReset','talentResetClass','treeClass','treeSelect'].includes(action))return;if(action==='skillFocus'){skillFocus=id;skillView='tree';UI67.selected='skill_'+id;renderPanel();r67Center(P67.byId.get(UI67.selected),.8);return;}return r67ActionBase(action,id,arg);};
skillsPanel=function(){if(skillView==='tree')return skillTreePanel();const ids=normalizeLoadout(g.equippedSkills);let h=`<div class="p67-catalog-intro"><span class="p67-eyebrow">ARSENAL DE HABILIDADES</span><h2>Quatro escolhas.<br>Infinitas travessias.</h2><p>Combine cobertura, propagação e sustentação. As nove habilidades compartilham uma única Constelação.</p><button class="gamebtn" data-action="skillOpenTree">✥ Explorar a Constelação <span>${g.talentPoints-g.talentSpent} PT</span></button></div><div class="skill-loadout-grid">${ids.map((id,i)=>`<div class="skill-loadout-slot ${id?'':'empty-slot'}"><small>ESPAÇO ${i+1} · TECLA ${i+1}</small><strong>${id?esc(D.skills.find(s=>s.id===id).name):'Vazio'}</strong>${id?`<button class="gamebtn muted" data-action="skillEquip" data-id="${id}">Remover</button>`:''}</div>`).join('')}</div><p class="hint">Habilidades ativas não possuem níveis nem melhorias por ouro. Desbloqueie pelo nível do cavaleiro e evolua seus efeitos exclusivamente na Constelação de Passivas.</p>`;
 for(const [kind,label]of [['physical','FÍSICO'],['faith','FÉ'],['magic','MAGIA']]){h+=sectionTitle(label);for(const s of D.skills.filter(s=>s.kind===kind)){const stats=r67SkillStats(s.id),spec=p67Spec(s.id),equipped=ids.includes(s.id),locked=g.knightLevel<s.unlock;h+=`<article class="entry p67-skill-card ${skillFocus===s.id?'focused':''}"><div class="entry-top">${vIcon(VICON[s.id],42)}<div class="entry-main"><h3>${esc(s.name)}</h3><small>${locked?'DESBLOQUEIA NO NÍVEL '+s.unlock:equipped?'EQUIPADA':'DISPONÍVEL'}</small></div></div><p>${R67_SKILLS[s.id].summary}</p><div class="p67-skill-metrics"><span>${stats.mana.toFixed(1)} <small>MANA</small></span><span>${stats.cooldown.toFixed(1)}s <small>RECARGA</small></span>${stats.duration?`<span>${stats.duration.toFixed(1)}s <small>DURAÇÃO</small></span>`:''}</div>${spec?`<div class="p67-current-spec">✦ ${P67_SPECS[s.id].find(x=>x[0]===spec)[1]}</div>`:''}<div class="button-row">${!locked?button(equipped?'REMOVER':'EQUIPAR','skillEquip',s.id,'',equipped?'muted':'green'):''}${button('ESPECIALIZAR','skillFocus',s.id,'','muted')}</div></article>`;}}return h;};
// R69: pointer-up selects the node, even when zoom makes its visible button very small.
// Avoid the stale click-suppression flag that swallowed the next genuine selection after dragging.
function r69NearestNode(clientX,clientY){
 const viewport=$('#p67-viewport');if(!viewport)return null;
 const rect=viewport.getBoundingClientRect();
 if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return null;
 const x=clientX-rect.left,y=clientY-rect.top;
 let closest=null,minimum=Infinity;
 for(const n of P67.nodes){
  const px=UI67.x+(n.x+2500)*UI67.zoom,py=UI67.y+(n.y+2500)*UI67.zoom;
  const distance=Math.hypot(x-px,y-py);
  const diameter=n.type==='origin'?113:n.type==='keystone'||n.type==='pact'?79:n.type==='specialization'?64:n.type==='notable'?49:n.type==='travel'?24:31;
  const radius=Math.max(18,diameter*UI67.zoom*.5+8);
  if(distance<=radius&&distance<minimum){closest=n.id;minimum=distance;}
 }
 return closest;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-p67]');if(!b)return;
 e.preventDefault();
 // Only ignore the synthetic click emitted immediately after our pointer-up selection/drag.
 // Do not suppress unrelated clicks or a later tap on another node.
 const guard=UI67.pointerClickGuard;
 if(b.dataset.p67==='node'&&guard&&performance.now()-guard.at<120&&
    Math.hypot(e.clientX-guard.x,e.clientY-guard.y)<8)return;
 r67TreeAction(b.dataset.p67,b.dataset.id);
});
document.addEventListener('input',e=>{if(e.target.id==='p67-search'){UI67.query=e.target.value;r67RefreshTree();}});document.addEventListener('change',e=>{if(e.target.id==='p67-filter'){UI67.filter=e.target.value;r67RefreshTree();}});
document.addEventListener('wheel',e=>{const v=e.target.closest('#p67-viewport');if(!v)return;e.preventDefault();const r=v.getBoundingClientRect();r67Zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top);},{passive:false});
document.addEventListener('pointerdown',e=>{
 if(e.target.closest('#p67-viewport')&&e.button===0){
  UI67.drag={x:e.clientX,y:e.clientY,px:UI67.x,py:UI67.y,moved:false,pointerId:e.pointerId};
  UI67.pointerClickGuard=null;
 }
 if(e.target.id==='p67-minimap'){
  const r=e.target.getBoundingClientRect();r67Center({x:((e.clientX-r.left)/r.width*180-90)/.028,y:((e.clientY-r.top)/r.height*150-75)/.028});
 }
});
document.addEventListener('pointermove',e=>{
 const d=UI67.drag;if(!d||d.pointerId!==e.pointerId)return;
 if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>7)d.moved=true;
 if(d.moved){UI67.x=d.px+e.clientX-d.x;UI67.y=d.py+e.clientY-d.y;UI67.placed=true;r67Transform();}
});
document.addEventListener('pointerup',e=>{
 const d=UI67.drag;if(!d||d.pointerId!==e.pointerId)return;
 UI67.drag=null;
 const within=Math.hypot(e.clientX-d.x,e.clientY-d.y)<=7;
 UI67.pointerClickGuard={at:performance.now(),x:e.clientX,y:e.clientY};
 if(!d.moved&&within){
  const direct=e.target.closest('.p67-node')?.dataset.id;
  const chosen=direct||r69NearestNode(e.clientX,e.clientY);
  if(chosen)r67TreeAction('node',chosen);
 }
});
document.addEventListener('pointercancel',e=>{if(UI67.drag?.pointerId===e.pointerId)UI67.drag=null;UI67.pointerClickGuard=null;});
document.addEventListener('keydown',e=>{if(!e.target.closest('.p67-workbench'))return;e.stopPropagation();if(e.target.matches('input,select,textarea'))return;if(e.key==='+'||e.key==='='){e.preventDefault();r67Zoom(1.22);}if(e.key==='-'){e.preventDefault();r67Zoom(1/1.22);}if(e.target.id==='p67-viewport'&&e.key.startsWith('Arrow')){e.preventDefault();UI67.x+=e.key==='ArrowLeft'?65:e.key==='ArrowRight'?-65:0;UI67.y+=e.key==='ArrowUp'?65:e.key==='ArrowDown'?-65:0;r67Transform();}},true);
const r67EffectsBase=vEffects;vEffects=function(){r67EffectsBase();ctx.save();for(const z of R67.zones){ctx.strokeStyle=({grace:'#ffe3a2',flame_nova:'#ffae62',shadow:'#aa91ff',curse:'#b68ce2',holy_spear:'#d2a2ff'})[z.id]||'#d2a2ff';ctx.fillStyle=ctx.strokeStyle;ctx.globalAlpha=.035*Math.min(1,z.ttl/.4);ctx.beginPath();ctx.ellipse(z.x,z.y,z.r,z.r*.6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=(V42.reduced?.15:.25)*Math.min(1,z.ttl/.4);ctx.lineWidth=1.4;ctx.stroke();}ctx.restore();};
document.title='VEILFALL · R67 · Constelação';

document.querySelector('.footbar span:first-child').innerHTML='<b>VEILFALL</b> · R67 · CONSTELAÇÃO';

const r67ReactionDrawBase=r61DrawSpellReactions;
r61DrawSpellReactions=function(){r67ReactionDrawBase();const now=r61WallMs();const events=r61VisualEffects.filter(e=>e.kind==='r67burst').slice(V42.reduced?-7:-23);for(const e of events){const t=clamp((now-e.born)/(e.life*1000),0,1);r66FXSpell(ctx,e.skill,e.x,e.y,e.r,t,Math.pow(1-t,.72));}};
window.VEIL_DEBUG.getTestPassives=testPassiveSummary;
