
/* R72: stability layer applied after all existing panel/raid/atlas wrappers. */
document.body.classList.add('r72');
document.querySelector('.battle-stage').append(document.querySelector('#toast-root'));
document.title='VEILFALL · R72 · Interface Estável';
const r72Footer=document.querySelector('.footbar span:first-child');if(r72Footer)r72Footer.innerHTML='✦ <b>VEILFALL</b> · R72 · INTERFACE ESTÁVEL';
const r72OriginalAlert=alertGame;
alertGame=function(message,kind='normal'){
 r72OriginalAlert(message,kind);
 const host=document.querySelector('#toast-root'),last=host?.lastElementChild;
 if(last){
  const txt=String(message).toLowerCase();
  last.classList.add(/morreu|derrota|morte|recuo|derrotado/.test(txt)?'r72-toast-danger':/relíquia|item|equipamento|lendário|mítico|único|tesouro|baú|marco|prestígio|herói|descobert|guardião/.test(txt)?'r72-toast-reward':'r72-toast-normal');
 }
};
const r72OriginalPanel=renderPanel;
renderPanel=function(preserve=false){
 if(!playing)return r72OriginalPanel(preserve);
 const panel=document.querySelector('#panel-body');
 let anchor=null;
 if(tab==='heroes'&&panel&&preserve){
  const top=panel.getBoundingClientRect().top;
  for(const el of panel.querySelectorAll('.r72-hero-card')){
   const box=el.getBoundingClientRect();
   if(box.bottom>top+4){anchor={id:el.querySelector('[data-action="heroBuy"],[data-action="transcend"]')?.dataset.id,top:box.top};break;}
  }
 }
 r72OriginalPanel(preserve);
 if(anchor?.id&&tab==='heroes'){
  const matching=[...panel.querySelectorAll('.r72-hero-card')].find(el=>el.querySelector('[data-action="heroBuy"],[data-action="transcend"]')?.dataset.id===anchor.id);
  if(matching){const delta=matching.getBoundingClientRect().top-anchor.top;if(Math.abs(delta)>1)panel.scrollTop+=delta;}
 }
};
// Feedback is a paint-only overlay, never changing an action's hitbox or position.
document.addEventListener('pointerdown',event=>{
 const control=event.target.closest?.('.gamebtn,#stage-advance,.nav-btn');
 if(!control||control.disabled||event.button!==0||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const rect=control.getBoundingClientRect();
 const x=Math.max(rect.left+8,Math.min(event.clientX,rect.right-8));
 const y=Math.max(rect.top+8,Math.min(event.clientY,rect.bottom-8));
 const mark=document.createElement('span');mark.className='r72-press-feedback';mark.style.left=x+'px';mark.style.top=y+'px';mark.textContent='✧';document.body.append(mark);mark.addEventListener('animationend',()=>mark.remove(),{once:true});setTimeout(()=>mark.remove(),550);
},true);
// Readable, stable button label for accessibility while its space stays reserved.
const r72OriginalHeader=updateHeader;
updateHeader=function(){r72OriginalHeader();if(!playing)return;const button=document.querySelector('#stage-advance');if(button)button.setAttribute('aria-hidden',String(button.classList.contains('hidden')));};
