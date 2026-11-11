/* R100: cautious cloud save, community rankings and account interface.
   Online reported stages are NOT server-verified game achievements. */
'use strict';
const R100={owner:null,remote:[],armed:new Map(),busy:false,dirty:false,lastPush:0,lastError:'',state:'Progresso local',rankType:'players',rankPage:0,rank:null,selectedProfile:null};
const r100State=message=>{R100.state=message;const n=document.getElementById('r100-state');if(n)n.textContent=message;const indicator=document.getElementById('r100-connect');if(indicator)indicator.textContent=R52.online?(message.startsWith('Salvo na nuvem')?'✦ NUVEM SINCRONIZADA':message.startsWith('Salvando')?'✦ SINCRONIZANDO':'✦ CONECTADO'):'◌ PROGRESSO LOCAL';};
const r100CurrentSlot=()=>playing?Math.max(1,Math.min(3,Number(g.slot)||1)):1;
function r100Local(slot){try{return JSON.parse(safeStorage.getItem(BKEY+slot)||'null');}catch{return null;}}
function r100LocalSummary(slot){const l=r100Local(slot);return l?'Mundo '+((l.difficulty||0)+1)+' · fase '+Number(l.stage||0).toLocaleString('pt-BR'):'Sem campanha local';}
function r100SessionKey(){return R52.identity?.id+' / '+R52.service?.serviceId;}
function r100StoreArmed(){try{safeStorage.setItem('VEILFALL_CLOUD_REVISIONS_'+R100.owner,JSON.stringify(Object.fromEntries(R100.armed)));}catch{}}
async function r100Discover(){if(!R52.online||!R52.identity)return;const owner=r100SessionKey();if(R100.owner!==owner){R100.owner=owner;R100.remote=[];R100.armed.clear();try{for(const [slot,revision]of Object.entries(JSON.parse(safeStorage.getItem('VEILFALL_CLOUD_REVISIONS_'+owner)||'{}')))if([1,2,3].includes(Number(slot))&&Number.isSafeInteger(revision))R100.armed.set(Number(slot),revision);}catch{}R100.state='Progresso local';}
 try{R100.remote=(await r52Api('/saves')).saves||[];for(const [slot,revision]of R100.armed){if((R100.remote.find(x=>Number(x.slot)===slot)?.revision||0)!==revision){R100.armed.delete(slot);R100.state='Há alterações remotas. Compare as versões antes de sincronizar.';}}r100StoreArmed();R100.lastError='';}catch(e){R100.lastError=e.message;}}
function r100Remote(slot){return R100.remote.find(x=>Number(x.slot)===Number(slot));}
function r100CloudMarkup(){if(!R52.online)return '';
 return `<section class="r52-card r100-cloud"><h3>Crônicas na nuvem</h3><p>Seus três espaços de campanha continuam sendo salvos localmente. Escolha qual versão vincular antes de ativar a sincronização automática. Nunca substituímos um salvamento remoto desconhecido sem confirmação.</p><p id="r100-state" role="status">${esc(R100.state)}</p><div class="r100-slots">${[1,2,3].map(slot=>{const remote=r100Remote(slot),armed=R100.armed.has(slot);return `<article class="r100-slot"><b>ESPAÇO ${slot}${slot===r100CurrentSlot()?' · ATUAL':''}</b><small>${esc(r100LocalSummary(slot))}</small><small>${remote?'Nuvem: revisão '+remote.revision+' · '+new Date(remote.updated).toLocaleString('pt-BR'):'Sem salvamento na nuvem'}</small><div class="r100-actions">${r52Button(armed?'SINCRONIZAR AGORA':'ENVIAR CÓPIA LOCAL','r100-upload','data-slot="'+slot+'"')}${remote?r52Button('RESTAURAR NUVEM','r100-download','data-slot="'+slot+'"','subtle'):''}${remote?r52Button('HISTÓRICO','r100-history','data-slot="'+slot+'"','subtle'):''}</div></article>`;}).join('')}</div><small class="r52-muted">A nuvem guarda sua campanha pessoal, mas não verifica o combate; os recordes informados por esses saves são exibidos separadamente dos resultados competitivos validados.</small></section>`;
}
const r100OriginalAccount=r52AccountView;
r52AccountView=function(){return r100OriginalAccount()+r100CloudMarkup();};
function r100UpdateAccount(){if(R52.hub&&R52.view==='account')r52Render();}
async function r100Upload(slot,explicit=false){if(!R52.online||R100.busy)return;const data=r100Local(slot);if(!data){r52Toast('Este espaço não tem campanha local.');return;}
 if(testMode){r52Toast('Encerre o laboratório antes de sincronizar.');return;}
 const remote=r100Remote(slot),armed=R100.armed.get(slot);
 if(!explicit&&!armed)return;
 if(explicit&&remote&&!armed){if(!window.confirm('Há uma campanha na nuvem. Antes de sobrescrevê-la, verifique se este save local é o correto. A nuvem manterá cópias históricas. Deseja enviar a cópia local?'))return;}
 if(!explicit&&remote&&armed!==remote.revision){r100State('Conflito detectado: escolha manualmente uma versão.');R100.armed.delete(slot);r100StoreArmed();r100UpdateAccount();return;}
 R100.busy=true;r100State('Salvando na nuvem...');try{
  const result=await r52Api('/saves/'+slot,{expectedRevision:armed===undefined?(remote?.revision||0):armed,document:data});
  R100.remote=R100.remote.filter(x=>Number(x.slot)!==slot).concat([result]);R100.armed.set(slot,result.revision);r100StoreArmed();R100.dirty=false;R100.lastPush=Date.now();r100State('Salvo na nuvem · '+new Date().toLocaleTimeString('pt-BR'));
 }catch(e){R100.lastError=e.message;if(e.status===409){R100.armed.delete(slot);r100StoreArmed();await r100Discover();r100State('Conflito entre dispositivos: cópias preservadas. Escolha qual restaurar.');}else r100State('Não sincronizado: '+e.message);}
 finally{R100.busy=false;r100UpdateAccount();}
}
async function r100Download(slot){if(!R52.online||R100.busy)return;const save=await r52Api('/saves/'+slot);if(!save.document)return r52Toast('Nuvem vazia.');if(!window.confirm('Restaurar a versão da nuvem para o espaço '+slot+'? A cópia local anterior será preservada no navegador como backup.'))return;
 const current=safeStorage.getItem(BKEY+slot);if(current)safeStorage.setItem(BKEY+slot+'_backup_'+Date.now(),current);
 safeStorage.setItem(BKEY+slot,JSON.stringify(save.document));R100.armed.set(slot,save.revision);r100StoreArmed();
 if(playing&&slot===r100CurrentSlot()){if(!load(slot))return r52Toast('O arquivo foi baixado, mas o jogo não conseguiu carregar o save. O backup local continua disponível.');}
 R100.dirty=false;r100State('Progresso da nuvem restaurado · espaço '+slot);r100UpdateAccount();}
function r100Dirty(){if(!R52.online||testMode||!playing)return;R100.dirty=true;}
const r100Save=save;
save=function(...args){const result=r100Save(...args);if(result)r100Dirty();return result;};
const r100Sync=r52Sync;
r52Sync=async function(...args){const ok=await r100Sync(...args);if(ok){if(R100.owner!==r100SessionKey())await r100Discover();}else if(R100.owner){R100.lastError='Sem conexão';}return ok;};
function r100RankMarkup(){const d=R100.rank;if(R100.selectedProfile){const p=R100.selectedProfile;return r52Title('PERFIL PÚBLICO',esc(p.name),'Informações compartilhadas pelo servidor, sem e-mail ou inventário privado.')+`<div class="r52-card"><p>Clã: ${esc(p.clan?.tag||'Sem clã')}</p><p>Maior estágio declarado: ${p.record?Number(p.record.globalStage).toLocaleString('pt-BR'):'Sem registro'}</p><p>${p.record?.verification==='verified'?'Verificado pelo servidor':'Não validado competitivamente'}</p>${r52Button('VOLTAR AO RANKING','r100-back','','subtle')}</div>`;}
 const tabs=`<div class="r100-actions">${r52Button('JOGADORES · NÃO VALIDADOS','r100-rank-players','',R100.rankType==='players'?'':'subtle')}${r52Button('CLÃS · RAIDS','r100-rank-clans','',R100.rankType==='clans'?'':'subtle')}${r52Button('ATUALIZAR','r100-refresh','','subtle')}</div>`;
 if(!d)return r52Title('CRÔNICAS DO VÉU','Rankings','Classificações persistentes entre jogadores reais.')+tabs+'<p>Consultando o servidor...</p>';
 let rows=R100.rankType==='players'?(d.rows||[]).map(r=>`<tr><td>${r.position}º</td><td><button class="r100-name" data-r100="profile" data-id="${r.id}">${esc(r.name)}</button></td><td>${esc(r.clanTag||'—')}</td><td>${r.world}</td><td>${Number(r.globalStage).toLocaleString('pt-BR')}</td></tr>`):(d.rows||[]).map(r=>`<tr><td>${r.position}º</td><td>${esc(r.name)}</td><td>${esc(r.tag)}</td><td>${r.seasonHighestRaid}</td><td>${r.lifetimeHighestRaid}</td></tr>`);
 const podium=R100.rankPage===0&&(d.rows||[]).length?`<div class="r100-podium">${(d.rows||[]).slice(0,3).map((r,i)=>`<article class="r100-podium-card"><small>${i===0?'♛ PRIMEIRO':i===1?'♜ SEGUNDO':'♜ TERCEIRO'}</small><div class="r100-podium-crest">${i===0?'✦':'◆'}</div><b>${esc(r.name)}</b><span>${R100.rankType==='players'?Number(r.globalStage).toLocaleString('pt-BR')+' estágios declarados':'Raid sazonal '+r.seasonHighestRaid}</span></article>`).join('')}</div>`:'';
 const description=R100.rankType==='players'?'Este ranking reúne marcas declaradas por salvamentos locais. São dados persistentes, mas NÃO são resultados verificados contra trapaças.':'Raids concluídas no servidor, com vida compartilhada e processamento de ataques. Temporada trimestral em UTC.';
 return r52Title('CRÔNICAS DO VÉU',R100.rankType==='players'?'Ranking de jogadores':'Ranking de clãs',description)+tabs+podium+(R100.rankType==='clans'?`<p class="r52-muted">Temporada: ${esc(d.season||'—')} até ${esc(d.seasonEnds||'—')}</p>`:`<p class="r100-warning">Progresso pessoal informado · não verificado · sem premiações competitivas.</p>`)+`<div class="r52-card r100-table"><table><thead><tr>${(R100.rankType==='players'?['#','Jogador','Clã','Mundo','Maior estágio global']:['#','Clã','Sigla','Raid sazonal','Maior raid']).map(t=>'<th>'+t+'</th>').join('')}</tr></thead><tbody>${rows.join('')||'<tr><td colspan="5">Ainda não há registros.</td></tr>'}</tbody></table></div><div class="r100-actions">${r52Button('ANTERIOR','r100-prev',R100.rankPage===0?'disabled':'','subtle')}${r52Button('PRÓXIMA PÁGINA','r100-next',(d.rows||[]).length<25?'disabled':'','subtle')}</div>`;
}
const r100OriginalRender=r52Render;
r52Render=function(){r100OriginalRender();if(!R52.hub||R52.session)return;const nav=r52Root.querySelector('.r52-nav');if(nav){const foot=nav.querySelector('.r52-nav-foot'),b=document.createElement('button');b.dataset.r100='ranking';b.className=R52.view==='ranking'?'selected':'';b.textContent='♜  RANKING GLOBAL';if(foot)nav.insertBefore(b,foot);else nav.appendChild(b);}
 if(R52.view==='ranking'){const main=r52Root.querySelector('.r52-main');if(main)main.innerHTML=r100RankMarkup();}
};
async function r100LoadRank(){R100.rank=null;r52Render();try{R100.rank=await r52Api('/rankings/'+R100.rankType+'?limit=25&offset='+(R100.rankPage*25));}catch(e){R100.rank={rows:[]};r52Toast('Não foi possível atualizar o ranking: '+e.message);}r52Render();}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-r100], [data-r52^="r100-"]');if(!b)return;e.preventDefault();e.stopPropagation();const action=b.dataset.r100||b.dataset.r52;const slot=Number(b.dataset.slot);try{
 if(action==='ranking'){R52.view='ranking';R100.selectedProfile=null;r52Render();if(!R100.rank)await r100LoadRank();}
 else if(action==='r100-upload')await r100Upload(slot,true);
 else if(action==='r100-download')await r100Download(slot);
 else if(action==='r100-forgot'){const email=document.querySelector('#r52-email')?.value.trim();if(!email)throw Error('Informe o e-mail na tela de entrada.');const result=await r52Api('/auth/request-reset',{email});r52Toast(result.message);}
 else if(action==='r100-resend'){await r52Api('/auth/resend-confirmation',{});r52Toast('Se o provedor estiver configurado, uma nova confirmação foi enviada.');}
 else if(action==='r100-do-reset'){const pw=document.querySelector('#r100-newpass')?.value;if(!pw||pw.length<10)throw Error('Informe uma senha com pelo menos 10 caracteres.');await r52Api('/auth/reset-password',{token:R100.resetToken,password:pw});R100.resetToken=null;document.querySelector('#r52-dialog')?.remove();r52Toast('Senha redefinida. Entre novamente na conta.');}
 else if(action==='r100-history'){const h=await r52Api('/saves/'+slot+'/history');r52Dialog('<h3>Versões anteriores · Espaço '+slot+'</h3><p>As 12 revisões anteriores ficam disponíveis para recuperação.</p>'+(h.history||[]).map(x=>`<p>Revisão ${x.revision} · ${r52Date(x.created)} ${r52Button('RECUPERAR','r100-restore','data-slot="'+slot+'" data-revision="'+x.revision+'"')}</p>`).join('')||'<p>Nenhuma revisão anterior.</p>');}
 else if(action==='r100-restore'){const record=await r52Api('/saves/'+slot+'/history/'+Number(b.dataset.revision));if(!window.confirm('Recuperar a cópia antiga para a campanha local? Não apaga a versão atual na nuvem.'))return;const current=safeStorage.getItem(BKEY+slot);if(current)safeStorage.setItem(BKEY+slot+'_backup_'+Date.now(),current);safeStorage.setItem(BKEY+slot,JSON.stringify(record.document));R100.armed.delete(slot);r100StoreArmed();if(playing&&slot===r100CurrentSlot())load(slot);document.querySelector('#r52-dialog')?.remove();r100State('Versão histórica recuperada localmente. Revise antes de enviar à nuvem.');r100UpdateAccount();}
 else if(action==='r100-rank-players'||action==='r100-rank-clans'){R100.rankType=action.endsWith('players')?'players':'clans';R100.rankPage=0;await r100LoadRank();}
 else if(action==='r100-refresh'){await r100LoadRank();}
 else if(action==='r100-next'||action==='r100-prev'){R100.rankPage=Math.max(0,R100.rankPage+(action.endsWith('next')?1:-1));await r100LoadRank();}
 else if(action==='profile'){R100.selectedProfile=await r52Api('/players/'+b.dataset.id);r52Render();}
 else if(action==='r100-back'){R100.selectedProfile=null;r52Render();}
 }catch(err){r52Toast(err.message);}},true);
setInterval(()=>{if(!R52.online||!R100.dirty||R100.busy||Date.now()-R100.lastPush<30000)return;const slot=r100CurrentSlot();if(R100.armed.has(slot))r100Upload(slot);},10000);
document.querySelector('.header-actions')?.insertAdjacentHTML('beforeend','<span id="r100-connect" class="r100-connect" aria-live="polite">◌ PROGRESSO LOCAL</span>');
setInterval(()=>r100State(R100.state),8000);
// Initial discovery is safe even when the user's login session is still restoring.
setTimeout(async()=>{if(R52.online)r100Discover().then(r100UpdateAccount);
 const query=new URLSearchParams(location.search),verify=query.get('verify'),reset=query.get('reset');
 if(!verify&&!reset)return;
 try{history.replaceState(null,'',location.pathname+location.hash);}catch{}
 if(verify){try{await r52Api('/auth/confirm-email',{token:verify});r52Toast('E-mail confirmado. Entre na conta para continuar.');if(R52.online)await r52Sync();}catch(e){r52Toast('Confirmação de e-mail: '+e.message);}return;}
 R100.resetToken=reset;r52Open('account');r52Dialog('<h2>Redefinir senha</h2><p>Crie uma nova senha para sua conta VEILFALL.</p><label>Nova senha<input type="password" id="r100-newpass" minlength="10" maxlength="128"></label>'+r52Button('CONFIRMAR NOVA SENHA','r100-do-reset'));
},1000);
