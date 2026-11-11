/* R73/R74: presentation-only navigation. No combat, equipment or raid calculations. */
'use strict';
if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
document.body.classList.add('r74');
document.title='VEILFALL · R74 · Interface Reformulada';
const r74Footer=document.querySelector('.footbar span:first-child');if(r74Footer)r74Footer.innerHTML='✦ <b>VEILFALL</b> · R74 · O JURAMENTO PERMANECE';
const r74Overlay=document.getElementById('start-overlay');
const r74Continue=document.getElementById('continue-game');
// Remove the legacy extra Raid shortcut; its original expansion code is unchanged.
document.querySelector('.start-actions > [data-r52="view-start"]')?.remove();
const r74LastSlotKey='veilfall_r74_last_slot';
function r74CurrentSaveSlot(){
 const last=Number(safeStorage.getItem(r74LastSlotKey));
 if([1,2,3].includes(last)&&safeStorage.getItem(BKEY+last))return last;
 for(let i=1;i<=3;i++)if(safeStorage.getItem(BKEY+i))return i;
 return 1;
}
const r74HasSave=()=>[1,2,3].some(i=>{try{return !!safeStorage.getItem(BKEY+i)}catch{return false}});
function r74MenuSync(){
 r74Continue.disabled=!r74HasSave();
 r74Continue.classList.toggle('r73-primary',!r74Continue.disabled);
 document.getElementById('new-game').classList.toggle('r73-primary',r74Continue.disabled);
 r74Continue.title=r74Continue.disabled?'Nenhuma campanha salva neste navegador':'Continuar a campanha salva no espaço '+r74CurrentSaveSlot();
 if(r74Overlay&&!r74Overlay.classList.contains('hidden')){r74Overlay.inert=false;r74Overlay.setAttribute('aria-hidden','false');}
}
const r74OriginalInit=initialise;
initialise=function(...args){r74OriginalInit(...args);r74Overlay.setAttribute('aria-hidden','true');};
const r74OriginalLoad=load;
load=function(...args){const ok=r74OriginalLoad(...args);if(ok){r74Overlay.setAttribute('aria-hidden','true');if([1,2,3].includes(Number(args[0])))safeStorage.setItem(r74LastSlotKey,String(args[0]));}return ok;};
const r74OriginalExitTrial=exitEndgameTrial;
exitEndgameTrial=function(...args){const result=r74OriginalExitTrial(...args);r74MenuSync();return result;};
function r74BackToMenu(){
 if(testMode){alertGame('Encerre o laboratório antes de voltar ao menu principal.');return;}
 if(R52.hub){return;}
 if(playing){save(g.slot,true);safeStorage.setItem(r74LastSlotKey,String(g.slot));paused=true;}
 r74Overlay.classList.remove('hidden');
 document.getElementById('app').setAttribute('aria-hidden','true');
 document.querySelector('.r73-lab-menu')?.removeAttribute('open');
 r74MenuSync();
 document.getElementById('continue-game').focus({preventScroll:true});
}
function r74ReturnToCampaign(){document.getElementById('app').removeAttribute('aria-hidden');}
document.getElementById('r73-back-menu').addEventListener('click',r74BackToMenu);
document.getElementById('new-game').addEventListener('click',r74ReturnToCampaign);
// Capture before the legacy slot-1-only click handler, so Continue resumes the latest active slot.
document.getElementById('continue-game').addEventListener('click',(event)=>{
 event.stopImmediatePropagation();
 if(load(r74CurrentSaveSlot()))r74ReturnToCampaign();
 else alert('Não foi possível carregar esta campanha.');
},true);
for(const id of ['start-endgame-test','start-boss-preview','start-difficulty-five-test'])document.getElementById(id)?.addEventListener('click',r74ReturnToCampaign);
document.getElementById('r73-menu-raids').addEventListener('click',()=>r52Open('raids'));
document.getElementById('r73-menu-settings').addEventListener('click',()=>settingsModal());
document.getElementById('r73-menu-credits').addEventListener('click',()=>{
 const root=document.getElementById('modal-root');root.classList.remove('hidden');
 root.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-label="Créditos"><h2>VEILFALL</h2><p>CHRONICLES OF RUIN</p><p>Jogo independente em desenvolvimento. Mundo, progressão, habilidades, Clãs e Raids integram o projeto VEILFALL.</p><p>R74 — Reformulação visual do menu e da HUD.</p><div class="button-row"><button class="gamebtn" id="r74-close-credits">VOLTAR AO MENU</button></div></div>';
 root.querySelector('#r74-close-credits').onclick=()=>root.classList.add('hidden');
});
function r74Backup(){const slots={};for(let i=1;i<=3;i++){let raw=safeStorage.getItem(BKEY+i);if(raw){try{const record=JSON.parse(raw);if(record&&record.version===1&&record.stage)slots[i]=record;}catch{}}}
 if(!Object.keys(slots).length){alert('Nenhum salvamento disponível para exportar.');return;}
 const data=JSON.stringify({format:'VEILFALL_BACKUP',version:1,exportedAt:new Date().toISOString(),slots},null,2);
 const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='VEILFALL_BACKUP_R74.json';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
document.getElementById('r73-menu-export').addEventListener('click',r74Backup);
const r74FilePicker=document.getElementById('r73-import-file');
document.getElementById('r73-menu-import').addEventListener('click',()=>r74FilePicker.click());
r74FilePicker.addEventListener('change',async()=>{
 const file=r74FilePicker.files?.[0];r74FilePicker.value='';if(!file)return;
 if(file.size>10_000_000){alert('Arquivo grande demais para um salvamento.');return;}
 try{
  const backup=JSON.parse(await file.text());
  const original=backup?.format==='VEILFALL_BACKUP'&&backup?.version===1?backup.slots:(backup?.version===1&&backup?.stage?{1:backup}:null);
  if(!original||typeof original!=='object')throw Error('Formato de salvamento incompatível.');
  const valid=Object.entries(original).filter(([key,record])=>['1','2','3'].includes(key)&&record&&record.version===1&&Number.isFinite(record.stage)&&record.stage>=1);
  if(!valid.length)throw Error('Nenhum espaço de campanha válido no arquivo.');
  showModal('Importar salvamento?',`Esta operação substituirá ${valid.length} espaço(s) da campanha local. Exporte seus saves antes de confirmar.`,()=>{
   for(const [key,record]of valid){safeStorage.setItem(BKEY+key,JSON.stringify({...record,slot:Number(key)}));}
   r74MenuSync();alert('Salvamento importado. Use Continuar Jornada para jogar.');
  });
 }catch(error){alert('Não foi possível importar: '+error.message);}
});
// menu app is visually absent, and HUD is unchanged whenever campaign is active.
r74MenuSync();

}
