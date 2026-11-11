/* R65 compatibility bridge - NOT part of the supplied R52 package.
   Keeps every imported expansion file byte-for-byte while preserving R64's original passive income progression. */
'use strict';
(function(){
  passiveGold=function(){
    const original=r52Base.passiveGold();
    if(!R52.weaponSum) return original;
    let before=0,after=B(0);
    for(const hero of D.heroes.filter(h=>['gold_idle','gold'].includes(h.effect))){
      const own=Math.min(1,heroMilestoneEffectiveLevel(hero.id)/1000)*.25;
      before+=own;
      after=after.add(B(own).mul(r52WeaponFactor(hero.id)));
    }
    return original.mul(B(1).add(after).div(1+before));
  };
  document.title='VEILFALL · R65 · Clãs e Raids';
  const footer=document.querySelector('.footbar span:first-child');
  if(footer)footer.innerHTML='<b>VEILFALL</b> · R65 · PACTO DAS CINZAS';
})();
