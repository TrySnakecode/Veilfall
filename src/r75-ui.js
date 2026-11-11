/* VEILFALL R75 — clareza visual, sistemas de coleções separados. */
'use strict';
document.body.classList.add('r75');
document.title='VEILFALL · R101 · O VÉU DESPERTA';
// Move the existing boss UI outside the canvas. Combat and HP updates keep the same DOM IDs.
const r75Boss=document.querySelector('#boss-bar'),r75BattleHeader=document.querySelector('.battle-top');
if(r75Boss&&r75BattleHeader)r75BattleHeader.appendChild(r75Boss);
// R75 keeps the campaign event log available in Registros. Routine gold gains
// already have floating values; avoid double messages for fairies and treasure enemies.
let r75InsideAlert=false;
const r75OriginalAlert=alertGame;
alertGame=function(msg,kind='normal'){
 if(/^Bênção das Fadas:|^Tesouro! \+/.test(String(msg)))return;
 r75InsideAlert=true;
 try{return r75OriginalAlert(msg,kind);}finally{r75InsideAlert=false;}
};
// Combat event history is no longer drawn on top of the arena or next to Avançar.
// Important alerts are still handled by alertGame(), with toasts and RegistrOS.
feed=function(msg){
 // Keep a short internal queue; log important milestones once. The visible
 // combat field remains clear, and alerts manage their own logs.
 combatFeed.unshift(msg);if(combatFeed.length>3)combatFeed.length=3;
 if(!r75InsideAlert&&/GUARDIÃO|LIMIAR|MARCO|AR[AÁ]UTO|RECOMPENSA ÚNICA|DESBLOQUEAD/i.test(String(msg)))log(msg);
};
// The old Chesterson rewards are historical only: show the unified enemy source.
const r75OldEffectLabel=effectLabel;
effectLabel=function(id){return id==='gold_chesterson'?'Ouro de Mimics (Chesterson)':r75OldEffectLabel(id);};
const r75Footer=document.querySelector('.footbar span:first-child');
if(r75Footer)r75Footer.innerHTML='✦ <b>VEILFALL</b> · R80 · TESTES DE DIFICULDADE';
const r75MenuFoot=document.querySelector('.r73-menu-footer span:first-child');
if(r75MenuFoot)r75MenuFoot.textContent='VEILFALL · R101';
