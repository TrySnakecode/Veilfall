/* R52 integration: the R51 sources/assets remain unchanged. */
'use strict';
const R52={engine:window.VeilRaid,profile:null,identity:null,service:null,online:false,data:null,view:'raids',loadout:['cleave','bleed','rally'],images:{},session:null,result:null,weaponSum:0,setCount:0,collectionMultiplier:B(1),hub:false,message:'',searchResults:[],cacheKey:'VEILFALL_R52_SIGNED_ONLINE_V1'};
const r52Base={damage,faithDamage,magicDamage,passiveGold,heroPassiveContribution,heroAttributeBonus,heroMilestoneStatBonus,heroCriticalChanceBonus,specialSupportBreakdown};
function r52RefreshFactors(){const w=R52.profile?.weapons||{};R52.weaponSum=VeilRaid.HERO_IDS.reduce((s,id)=>s+(w[id]||0),0);R52.setCount=VeilRaid.sets(w);R52.collectionMultiplier=Big.power(2,R52.setCount);}
// R101 strengthens each duplicated weapon without altering the ×2-per-full-set rule.
function r101HeroWeaponIndividualMultiplier(level){const lv=Math.max(0,Math.floor(Number(level)||0));return 1+.23*Math.pow(lv,1.04)}
function r52WeaponFactor(id){return R52.collectionMultiplier.mul(r101HeroWeaponIndividualMultiplier(R52.profile?.weapons?.[id]||0));}
function r52Contribution(hero,level=heroMilestoneEffectiveLevel(hero.id),trans=g.heroTrans[hero.id]||0){return B(r52Base.heroPassiveContribution(hero,level,trans)).mul(r52WeaponFactor(hero.id));}
function r52ClassBonus(kind){let sum=B(0);for(const hero of D.heroes)if(classOfHero(hero.id)===kind)sum=sum.add(r52Contribution(hero));const legion=active.demons>0?1+Math.min(1.5,.35*mod('demons')):1;return B(1).add(sum.mul(legion*helmetHeroFactor(kind)));}
function r52Damage(original,kind){const originalValue=original();if(!R52.weaponSum)return originalValue;return originalValue.div(r52Base.heroAttributeBonus(kind)).mul(r52ClassBonus(kind));}
damage=()=>r52Damage(r52Base.damage,'warrior');faithDamage=()=>r52Damage(r52Base.faithDamage,'faith');magicDamage=()=>r52Damage(r52Base.magicDamage,'magic');
heroMilestoneStatBonus=function(hero,level,effect){const raw=r52Base.heroMilestoneStatBonus(hero,level,effect);return !R52.weaponSum?raw:B(raw).mul(r52WeaponFactor(hero.id)).num(1e12);};
heroCriticalChanceBonus=function(){const raw=r52Base.heroCriticalChanceBonus();return !R52.weaponSum?raw:Math.min(.205,B(raw).mul(r52WeaponFactor('h21')).num(1));};
specialSupportBreakdown=function(effect){const base=r52Base.specialSupportBreakdown(effect);if(!R52.weaponSum||!HIGH_SUPPORT_SET.has(effect))return base;let raw=B(0);for(const hero of D.heroes){if(!(HERO_SPECIAL_MILESTONES[hero.id]||[]).includes(effect))continue;let v=0;for(const [lv,n]of Object.entries(SUPPORT_MILESTONE_GAIN))if(heroMilestoneEffectiveLevel(hero.id)>=Number(lv))v+=n;raw=raw.add(B(v).mul(r52WeaponFactor(hero.id)));}const own=Math.min(HIGH_SUPPORT_CAPS.hero,raw.num(1));return {...base,hero:own,total:Math.min(.8,own+base.gear+base.artifact)};};
passiveGold=function(){if(!R52.weaponSum)return r52Base.passiveGold();let sum=B(0);for(const hero of D.heroes.filter(h=>['gold_idle','gold'].includes(h.effect)))sum=sum.add(B(Math.min(1,heroMilestoneEffectiveLevel(hero.id)/1000)*.25).mul(r52WeaponFactor(hero.id)));return B(.012).mul(B(1).add(sum)).mul(Big.power(1.018,g.stage-1)).mul(economySourceMultipliers('idle'));};
function r52Bytes(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
async function r52Accept(capsule,service,persist=true){
 if(crypto.subtle){const key=await crypto.subtle.importKey('spki',r52Bytes(service.publicKey),{name:'Ed25519'},false,['verify']);
 if(!await crypto.subtle.verify('Ed25519',key,r52Bytes(capsule.signature),new TextEncoder().encode(capsule.payload)))throw Error('A assinatura do perfil online é inválida.');
 }else{if(!persist)throw Error('O cache offline exige localhost ou HTTPS.');const verified=await r52Api('/profile/verify',{capsule});if(!verified.valid||verified.serviceId!==service.serviceId)throw Error('Assinatura de perfil inválida.');}
 const record=JSON.parse(capsule.payload);if(record.serviceId!==service.serviceId||!record.user?.id||!record.profile?.weapons)throw Error('Perfil de outro serviço.');
 for(const id of VeilRaid.HERO_IDS)if(!Number.isSafeInteger(record.profile.weapons[id])||record.profile.weapons[id]<0)throw Error('Coleção inválida.');
 const previous=R52.setCount,had=!!R52.profile;R52.profile=record.profile;R52.identity=record.user;R52.service=service;r52RefreshFactors();
 if(persist)safeStorage.setItem(R52.cacheKey,JSON.stringify({capsule,service}));
 if(playing){player.hp=Math.min(player.hp,maxHealth());uiDirty=true;updateHeader();}
 if(had&&R52.setCount>previous&&R52.hub)R52.celebratePending=R52.setCount;
 return record;
}
async function r52Api(route,body){if(location.protocol==='file:')throw Error('Abra INICIAR_SERVIDOR.bat para usar clãs e raids online. O treino funciona offline.');const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);try{const base=String(window.VEIL_API_URL||'').replace(/\/$/,'');const headers=body?{'Content-Type':'application/json'}:{};let token;try{token=sessionStorage.getItem('VEILFALL_REMOTE_SESSION')}catch{}if(token&&base)headers.Authorization='Bearer '+token;const res=await fetch(base+'/api'+route,{method:body?'POST':'GET',credentials:'include',headers,body:body?JSON.stringify(body):undefined,signal:controller.signal});const data=await res.json();if(!res.ok)throw Object.assign(Error(data.error||'Serviço indisponível.'),{status:res.status});return data;}catch(e){if(e.name==='AbortError')throw Error('O servidor demorou a responder. Sua campanha continua disponível.');throw e;}finally{clearTimeout(timeout);}}
async function r52Sync(silent=false){try{const service=await r52Api('/bootstrap'),data=await r52Api('/me');await r52Accept(data.capsule,service);R52.data=data;R52.online=true;R52.message='';if(!R52.session&&data.activeAttempt)r52BeginSession(data.activeAttempt,false);if(R52.hub&&!R52.session)r52Render();return true;}catch(e){R52.online=false;if(!silent)R52.message=e.status===401?'Entre na conta para acessar seu clã.':e.message;if(R52.hub&&!R52.session)r52Render();return false;}}
async function r52Restore(){try{const cache=JSON.parse(safeStorage.getItem(R52.cacheKey)||'null');if(cache)await r52Accept(cache.capsule,cache.service,false);}catch{R52.profile=null;R52.identity=null;r52RefreshFactors();}if(location.protocol!=='file:')await r52Sync(true);}
function r52Assets(){const assets=window.VEIL_RAID_ASSETS||{},names=['arena','sentinel','archon','abyss','weapons-1','weapons-2','techniques','heraldry'];return Promise.all(names.map(name=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src=assets[name]||'assets/raids/'+name+'.png';R52.images[name]=im;})));}
const r52Ready=r52Assets();
// Online collections live outside campaign saves and are never read from imported g.
const r52Load=load;load=function(...args){const ok=r52Load(...args);if(ok){delete g.heroWeapons;delete g.raidProfile;delete g.weaponCollection;delete g.onlineProfile;}return ok;};
window.VEIL_R52_DEBUG={state:R52,base:r52Base,classBonus:r52ClassBonus,contribution:r52Contribution,refreshFactors:r52RefreshFactors,ready:r52Ready,accept:r52Accept};

function r52Nonce(){return Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');}

try{const saved=JSON.parse(safeStorage.getItem('VEILFALL_R52_LOADOUT')||'null');if(VeilRaid.validateLoadout(saved))R52.loadout=saved;}catch{}
