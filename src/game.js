
'use strict';
// As nove habilidades e todos os catálogos migrados estão em data.js.

'use strict';
/* VEILFALL WEB — original browser adaptation from the author's data catalog.
   All gameplay systems run offline. No third-party libraries or network dependencies. */
const D=window.VEIL_DATA;
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const DIFF=['I · Crepúsculo','II · Profanação','III · Abismo','IV · Eclipse','V · Ruína Eterna'];
const SKILL_ICONS=['✦','☄','❖','☾','☣','♟','✧','♨','☽','♜','✺','✠','◈'];
const HOTKEYS=['1','2','3','4'];
const DAMAGE_SKILLS=['grace','shadow','curse','holy_spear','flame_nova','thunderstorm'];
const SKILL_EFFECT_MIGRATION={proliferate:'curse',midas:'gold',frost_lance:'thunderstorm',bladestorm:'grace',eclipse_burst:'arcane_focus'};
const RING_FALLBACK=['grace','shadow','curse','holy_spear','flame_nova','thunderstorm'];
const EQUIP_SLOTS=4;
const NAV=[['knight','♜','Cavaleiro'],['skills','✦','Habilidades'],['artifacts','✧','Artefatos'],['heroes','♛','Heróis'],['pets','♞','Pets'],['scrolls','▤','Pergaminhos'],['gear','⚒','Equipamento'],['village','⌂','Vila'],['world','◈','Mundo'],['souls','✥','Almas'],['runes','◇','Runas'],['sets','❖','Conjuntos'],['stats','☷','Registros']];
const SLOTS=['Arma','Capacete','Peitoral','Aura','Anel'];
// R29: o atributo PRINCIPAL da Aura amplifica apenas o atributo PRINCIPAL do
// equipamento selecionado. Nunca afixos secundários, sets, pets ou a própria Aura.
const AURA_TARGETS=Object.freeze({aura_weapon:'Arma',aura_helmet:'Capacete',aura_chest:'Peitoral',aura_ring:'Anel'});
const AURA_EFFECTS=Object.keys(AURA_TARGETS);
const AURA_AMPLIFICATION_CAP=.20;
function auraAmplificationAt(stage,diff,rarity){
 // Intervalos separados: Grau 1 [2.5%,5.5%], Grau 5 [16.5%,19.5%].
 const grade=Math.max(0,Math.min(4,Math.trunc(Number(diff)||0)));
 const progress=.58*Math.log1p(Math.max(1,Math.min(24000,stage)))/Math.log1p(24000)+.42*Math.max(0,Math.min(5,rarity))/5;
 return Math.min(AURA_AMPLIFICATION_CAP,.025+.035*grade+.03*progress);
}
function migrateAuraItem(item){
 if(!item||item.slot!=='Aura')return;
 if(!AURA_TARGETS[item.effect]){
  // Migração estável de Auras anteriores, sem apagar o item nem os afixos.
  const oldTarget={damage:'aura_weapon',attack_speed:'aura_weapon',mana:'aura_helmet',mana_regen:'aura_chest',duration:'aura_ring',cooldown:'aura_ring'};
  item.effect=oldTarget[item.effect]||'aura_weapon';
 }
 item.auraVersion=1;
 item.value=auraAmplificationAt(Number(item.level)||1,Number(item.difficulty)||0,Number(item.rarity)||0);
}
function auraMainDescription(item){
 if(item?.slot!=='Aura')return supportGearDescription(item?.effect||'damage',uniquePrimaryValue(item));
 const target=AURA_TARGETS[item.effect]||'Arma';
 const amp=Math.max(0,Math.min(AURA_AMPLIFICATION_CAP,uniquePrimaryValue(item)));
 const other=g.equipped?.[target];
 const preview=other&&other.slot===target?
   ` · ${effectLabel(other.effect)} da ${target}: +${compactPercent(uniquePrimaryValue(other))} → +${compactPercent(uniquePrimaryValue(other)*(1+amp))}`:'';
 return `Amplifica +${compactPercent(amp)} do atributo PRINCIPAL de ${target}. Não aumenta afixos extras nem bônus de conjuntos.${preview}`;
}

const RARITY=['Comum','Raro','Épico','Lendário','Mítico','Único'];
// R71 — qualidade independente de raridade/grau. Perfeita conserva exatamente
// o valor do equipamento R70; as demais qualidades variam dentro do MESMO grau.
const GEAR_QUALITY=['Imperfeita','Gasta','Regular','Boa','Excelente','Perfeita'];
const GEAR_QUALITY_SCALE=[.80,.85,.89,.93,.96,1];
const GEAR_QUALITY_CHANCES=[.08,.14,.25,.28,.18,.07];
const HERO_HELMET_EFFECTS=Object.freeze({warrior:'hero_warrior',magic:'hero_magic',faith:'hero_faith'});
const HERO_HELMET_CLASS=Object.freeze({hero_warrior:'warrior',hero_magic:'magic',hero_faith:'faith'});
const OLD_HELMET_EFFECTS=Object.freeze({physical:'hero_warrior',crit_chance:'hero_warrior',crit_damage:'hero_warrior',normal_damage:'hero_warrior',boss_damage:'hero_warrior',faith:'hero_faith',grace:'hero_faith',magic:'hero_magic',damage:'hero_magic',mana:'hero_magic',shadow:'hero_warrior'});
function gearQualityIndex(item){return clamp(Math.floor(Number(item?.quality)),0,5)||0;}
function gearQualityName(item){return GEAR_QUALITY[gearQualityIndex(item)];}
function rollGearQuality(rng=Math.random){let v=Math.min(.999999,Math.max(0,Number(rng())||0));for(let i=0;i<GEAR_QUALITY_CHANCES.length;i++){v-=GEAR_QUALITY_CHANCES[i];if(v<0)return i;}return 5;}
function qualityGearValueAt(stage,difficulty,rarity,quality,slot='Arma'){
 const grade=Math.max(0,Math.min(4,Math.trunc(Number(difficulty)||0)));
 const scale=GEAR_QUALITY_SCALE[clamp(Math.trunc(Number(quality)||0),0,5)];
 if(slot==='Aura'){
  const floor=.025+.035*grade;
  return floor+(auraAmplificationAt(stage,difficulty,rarity)-floor)*scale;
 }
 const floor=.065*Math.pow(48,grade);
 // Conservar o piso de cada grau protege a hierarquia entre Grau 1–5:
 // o maior item do grau anterior é inferior ao menor do grau seguinte.
 return floor+(gearValueAt(stage,difficulty,rarity)-floor)*scale;
}
function migrateGearR71Item(item){
 if(!item||typeof item!=='object')return;
 // Objetos anteriores à R71 são tratados como Perfeitos para NÃO perder poder.
 if(!Number.isInteger(item.quality)||item.quality<0||item.quality>5)item.quality=5;
 item.qualityVersion=1;
 if(item.slot==='Capacete'){
  if(!HERO_HELMET_CLASS[item.effect])item.effect=OLD_HELMET_EFFECTS[item.effect]||HERO_HELMET_EFFECTS[['warrior','magic','faith'][Math.abs(Math.trunc(Number(item.id)||0))%3]];
  for(const a of item.affixes||[])if(OLD_HELMET_EFFECTS[a.effect])a.effect=OLD_HELMET_EFFECTS[a.effect];
 }
}
function helmetHeroFactor(kind){
 const item=g.equipped?.Capacete;
 if(!item||item.slot!=='Capacete')return 1;
 const effect=HERO_HELMET_EFFECTS[kind];
 const aura=g.equipped?.Aura;
 const auraBoost=aura?.slot==='Aura'&&AURA_TARGETS[aura.effect]==='Capacete'?Math.min(AURA_AMPLIFICATION_CAP,uniquePrimaryValue(aura)):0;
 let power=item.effect===effect?uniquePrimaryValue(item)*(1+auraBoost)*equipmentPrimaryMultiplier():0;
 // A aura não amplifica afixos. O bônus heroic nunca entra no mod da espada.
 for(const aff of item.affixes||[])if(aff.effect===effect)power+=uniqueAffixValue(aff,item);
 return 1+Math.max(0,power);
}

const RCOL=['#bfbec7','#74afd1','#b990ef','#e1a764','#e26f86','#e6cc84'];
// Preserve the original save namespace; existing campaigns are migrated in-place.
const BKEY='veilfall_web_v1_';
const DEATH_RETREAT_STAGES=1; // Recuo de uma fase ao morrer, seguido de farm fixo até avanço manual.
const SIM_TICK=0.05; // 50 ms simulated: attack, loot, progression and village share time.
const MAX_TICKS_PER_FRAME=100; // CPU safeguard: never skip gameplay events.
const SPEED_LEVELS=[1,3,10,100];
// R53 — QoL: a estrutura de ovos começa em 2h e atinge 1h no nível 11.
const PET_SANCTUARY_MAX_LEVEL=11;
const AUTO_HERO_INTERVAL=10; // segundos simulados, evita recalcular compras em cada frame.

// Balanceamento v7: níveis e dano desacoplados para preservar o grind.
// Hipóteses iniciais sujeitas a simulações de economia e sessões prolongadas.
const BALANCE={
 enemyGrowth:1.0273, physicalGrowth:1.063, faithGrowth:1.063, magicGrowth:1.063,
 overlevelFull:6, overlevelEfficiency:.24, repeatXpEfficiency:.93,
 minRepeatXp:.025, attackRange:105, autoApproachRange:62
};
// Revision 12: progression is based on stages reached in each run, never on kill totals.
// R34: roubo de vida próprio do cavaleiro, adquirido por nível e nunca
// por afixos, heróis ou relíquias. 0,01 ponto percentual por nível ganho:
// Nível 1: 0%; nível 1.001: 10%; nível 3.001+: 30%.
const KNIGHT_LIFESTEAL_PER_LEVEL=.0001;
const KNIGHT_LIFESTEAL_CAP=.30;
function knightLifestealRate(level=g.knightLevel){
 const lv=Math.max(1,Math.floor(Number(level)||1));
 return Math.min(KNIGHT_LIFESTEAL_CAP,Math.max(0,lv-1)*KNIGHT_LIFESTEAL_PER_LEVEL);
}
// O dano exibido em uma habilidade pode exceder a vida restante do inimigo.
// Somente PV efetivamente retirados podem gerar cura; a cura é limitada aos
// PV faltantes do cavaleiro e não sofre multiplicadores de suporte.
let lifestealPool=0;
function applyKnightLifesteal(effectiveDamage){
 const rate=knightLifestealRate();
 if(rate<=0||!player||player.hp<=0)return 0;
 const missing=Math.max(0,maxHealth()-player.hp);
 if(missing<=0)return 0;
 const healBig=B(effectiveDamage).mul(rate);
 if(healBig.cmp(0)<=0)return 0;
 // Absolute damage is exponential; without a health-relative cap every hit
 // restores 100% HP and no enemy can ever kill the knight.
 const maxHeal=Math.min(missing,Math.max(0,lifestealPool),maxHealth()*.018);
 const healed=healBig.cmp(maxHeal)>=0?maxHeal:healBig.num(maxHeal);
 if(!Number.isFinite(healed)||healed<=0)return 0;
 player.hp=Math.min(maxHealth(),player.hp+healed);lifestealPool=Math.max(0,lifestealPool-healed);
 if(healed>=Math.max(1,maxHealth()*.01)&&floating.length<55){
  floating.push({x:player.x,y:player.y-73,txt:'+'+fmt(healed)+' PV',color:'#7be7b6',life:.85,big:false});
 }
 return healed;
}
// R34: crescimento de PV é exclusivamente por LEVEL do cavaleiro.
// Mantém +1 PV/nível e soma uma reserva progressiva: até ~744 mil PV
// base no nível 24.000. A relíquia Coração de Ferro permanece +40%
// dessa base; NÃO existe outra relíquia de Vida Máxima.
const KNIGHT_HP_CURVE_DIVISOR=800;
function knightBaseHealth(level=g.knightLevel){
 const n=Math.max(0,Math.floor(Number(level)||1)-1);
 return 100+n+Math.floor(n*n/KNIGHT_HP_CURVE_DIVISOR);
}
// A única relíquia nova é REDUÇÃO DE DANO, não mais Vida Máxima.
// Ela não faz parte do teto 80% de atributos de suporte e tem seu próprio
// limite de 75% incluindo qualquer proteção temporária.
function relicDamageReduction(){
 return .75*Math.min(80,Math.max(0,Number(g.artifactLevels?.a106)||0))/80;
}
function effectiveDamageReduction(){
 const relic=relicDamageReduction();
 const guarding=Math.min(SUPPORT_BONUS_CAP,Math.max(0,...['fury','demons','arcane_focus'].map(id=>active?.[id]>0?skillBonus(id,'shield'):0)));
 return Math.min(.75,1-(1-relic)*(1-guarding));
}
// Hordas escalonadas por marcos, sempre com limite superior de performance.
const MAX_ALIVE_ENEMIES=320;
const HORDE_STAGES=[1,250,1000,5000,24000];
const HORDE_CAPS=[4,50,125,220,320];
const HORDE_GROUPS=[1,3,5,8,10];
const HORDE_SPAWN_INTERVALS=[.85,.60,.43,.38,.34];
function hordeInterpolate(stage,values){
 stage=Math.max(1,Number(stage)||1);
 for(let i=1;i<HORDE_STAGES.length;i++)if(stage<=HORDE_STAGES[i]){
  const ratio=(stage-HORDE_STAGES[i-1])/(HORDE_STAGES[i]-HORDE_STAGES[i-1]);
  return values[i-1]+(values[i]-values[i-1])*ratio;
 }
 return values[values.length-1];
}
function hordeGroupSize(){return Math.max(1,Math.round(hordeInterpolate(g.stage,HORDE_GROUPS)))}
function hordeSpawnInterval(){return hordeInterpolate(g.stage,HORDE_SPAWN_INTERVALS)}
const FIRST_PRESTIGE_STAGE=55;
const REPEAT_PRESTIGE_FLOOR=30;
const PRESTIGE_FRACTION=.30;
const GUARANTEED_RELIC_ARTIFACT='a014'; // Memória do Retorno, fifth PAID discovery.
// Base odds are PER EQUIPMENT DROP, not per killed enemy. Index: common..unique.
const GEAR_BASE_RATES=[.588,.30,.10,.01,.002]; // Used only by FORJA / legacy gear, not monster drops.
// REV 13: probabilities refer to each KILL, not equipment rarity globally.
// R101: iron is the rarest and most valuable village material, then stone, then wood.
// Values are independent of gold, raid rewards and the forge material economy.
const VILLAGE_RESOURCE_PRICES=Object.freeze({wood:.7,stone:2.2,iron:5.5}); // banknotes/unit
const VILLAGE_RESOURCE_RATES=Object.freeze({wood:.016,stone:.010,iron:.006}); // units/s per building level
const VILLAGE_BUILDING_COSTS=Object.freeze({
 wood:{wood:70,stone:28,iron:12},
 stone:{wood:26,stone:70,iron:18},
 iron:{wood:24,stone:32,iron:60},
 pet:{wood:30,stone:30,iron:30},
 scroll:{wood:30,stone:30,iron:30},
 forge:{wood:30,stone:30,iron:30}
});
const GEAR_SALE_PRICES=[1,5,10,25,50,100]; // banknotes by rarity (normal to unique)
// R25 — fixed rewards, explicit exchange rates. Relics scale with highest stage reached,
// but do NOT inherit the prestige-only artifact multiplier; this protects the main loop.
// R54: crescimento de relíquias deve acompanhar o preço dos artefatos,
// e NÃO ultrapassar a curva de vida com remuneração por fase descontrolada.
const RELIC_PRESTIGE_BASE=9;
const RELIC_PRESTIGE_GROWTH=1.024;
// R77: keep prestige as the principal long-term source of relics, but
// eliminate R76's 7x accelerated artifact acquisition. The small early
// encouragement vanishes by stage 250 and never affects higher worlds.
function earlyPrestigeRelicMultiplier(stage,difficulty){
 if(difficulty!==0||stage>=250)return 1;
 const remaining=clamp((250-Math.max(55,stage))/195,0,1);
 return 1+.75*remaining*remaining;
}
function basePrestigeRelics(stage,difficulty){
 return B(RELIC_PRESTIGE_BASE).mul(Big.power(RELIC_PRESTIGE_GROWTH,Math.max(0,globalStage(stage,difficulty)-30)))
  .mul(earlyPrestigeRelicMultiplier(stage,difficulty));
}
// Para saves R53: preserva-se a coleção; apenas o saldo disponível é
// convertido ao novo valor de compra, com registro do saldo histórico.
function previousPrestigeRelics(stage,difficulty){
 return B(5).mul(Big.power(1.052,Math.max(0,globalStage(stage,difficulty)-30)));
}
const CHEST_TYPES={
 small:{label:'Pequeno',price:800,pets:4,scrolls:4,forge:5,relicShare:.05,minRelics:1,icon:'♢'},
 medium:{label:'Médio',price:2400,pets:16,scrolls:16,forge:20,relicShare:.20,minRelics:4,icon:'◈'},
 giant:{label:'Gigante',price:6400,pets:48,scrolls:48,forge:60,relicShare:.80,minRelics:16,icon:'❖'}
};
function chestRecordStage(){
 const highest=Array.isArray(g.highest)?g.highest:[];
 return Math.max(1,...highest.map(x=>Math.max(0,Number(x)||0)));
}
function chestRelicReward(kind){
 const c=CHEST_TYPES[kind];if(!c)return B(0);
 const highest=Array.isArray(g.highest)?g.highest:[];
 const maxDiff=highest.reduce((last,stage,index)=>Number(stage)>0?index:last,0);
 const bestGlobal=Math.max(1,...(g.highest||[]).map((stage,index)=>Number(stage)>0?globalStage(stage,index):1));
 const base=B(RELIC_PRESTIGE_BASE).mul(Big.power(RELIC_PRESTIGE_GROWTH,Math.max(0,bestGlobal-30)))
   .mul(1+0.20*maxDiff);
 const scaled=base.mul(c.relicShare);
 return scaled.cmp(c.minRelics)>=0?scaled:B(c.minRelics);
}
function openVillageChest(kind){
 const c=CHEST_TYPES[kind];if(!c){alertGame('Baú desconhecido.');return false}
 const banknotes=Number(g.village.banknotes)||0;
 if(banknotes<c.price){alertGame('Cédulas insuficientes para o Baú '+c.label+'.');return false}
 // Commit only after validating affordability. Drops are all guaranteed per chest.
 const reward=chestRelicReward(kind);
 g.village.banknotes=Math.round((banknotes-c.price)*100)/100;
 for(let i=0;i<c.pets;i++)givePet(false);
 for(let i=0;i<c.scrolls;i++)giveScroll(false);
 const chestArcane=chestArcaneReward(kind);
 g.souls+=chestArcane.souls;const runeReward=chestArcane.runes+(Math.random()<chestArcane.extraChance?1:0);g.runes+=runeReward;
 g.village.forge=(Number(g.village.forge)||0)+c.forge;
 relics=relics.add(reward);totalRelics=totalRelics.add(reward);
 if(!g.chestsOpened||typeof g.chestsOpened!=='object')g.chestsOpened={small:0,medium:0,giant:0};
 g.chestsOpened[kind]=(Number(g.chestsOpened[kind])||0)+1;
 sound('relic');
 alertGame('Baú '+c.label+': '+c.pets+' pets, '+c.scrolls+' pergaminhos, +'+c.forge+' materiais, +'+reward.fmt()+' relíquias'+(chestArcane.souls?', +'+chestArcane.souls+' almas e +'+runeReward+' fragmentos rúnicos':'')+'!');
 save(g.slot,true);uiDirty=true;return true;
}
const CAMERA_ZOOM=.80; // visual-only zoom; HUD always retains original size
const MONSTER_GEAR_CHANCE=.009;
const LARGE_MONSTER_GEAR_CHANCE=.018;
const MONSTER_RARITY_RATES=[.80,.15,.05]; // Given a successful monster drop.
const EQUIPMENT_BOSS_RESPAWN_SECONDS=45;
// R23: TT2-inspired SP tiers; not directly copied from its proprietary balance.
const TREE_TIER_SP=[0,6,22,52,95];
const TREE_FINAL_SP=125;
const TREE_SP_VERSION=3;
const FAIRY_BASE_INTERVAL=90;
// R28 (suportes comuns) — bônus SOMADOS por estatística e limitados a +20%
// efetivo, independentemente de origem: heróis, equipamentos, afixos, pets,
// pergaminhos, artefatos, conjuntos, runas e orações. Não há limite no HP-base.
const SUPPORT_BONUS_CAP=.20;
const SUPPORT_EFFECTS=['health','health_regen','mana','mana_regen','defense','duration','cooldown','attack_speed','fairy_rate','drop','move_speed','mimic_chance'];
const SUPPORT_EFFECT_SET=new Set(SUPPORT_EFFECTS);
function isSupportEffect(effect){return SUPPORT_EFFECT_SET.has(effect)}
function supportEffectiveBonus(effect){return isSupportEffect(effect)?Math.max(0,mod(effect)/(effect==='attack_speed'?1.65:1)-1):0}
function supportCapDescription(effect){return isSupportEffect(effect)?(HIGH_SUPPORT_SET.has(effect)?`SUPORTE: +${compactPercent(supportEffectiveBonus(effect))} / +80% (heróis 30%, afixos 10%, relíquias 40%).`:`SUPORTE: +${compactPercent(supportEffectiveBonus(effect))} / +20%.`):''}
// Exibição padronizada para itens. Bônus maiores são anunciados com cap explícito.
function supportGearDescription(effect,raw){
 if(HERO_HELMET_CLASS[effect])return '+'+compactPercent(Math.max(0,Number(raw)||0))+' à contribuição passiva dos '+HERO_CLASS_NAMES[HERO_HELMET_CLASS[effect]]+' (somente heróis desta classe; não aumenta a espada)';
 if(AURA_TARGETS[effect])return `Amplifica em ${compactPercent(Math.max(0,Math.min(AURA_AMPLIFICATION_CAP,Number(raw)||0)))} o atributo principal de ${AURA_TARGETS[effect]} (não afixos secundários)`;
 return '+'+compactPercent(isSupportEffect(effect)?Math.min(HIGH_SUPPORT_SET.has(effect)?.10:SUPPORT_BONUS_CAP,Math.max(0,Number(raw)||0)):raw)+' '+effectLabel(effect)+(isSupportEffect(effect)?(HIGH_SUPPORT_SET.has(effect)?' (afixo de suporte · limite de equipamentos +10%)':' (suporte · limite global +20%)'):'');
}

// R33: efeitos de alto impacto só recebem bônus de três fontes (heróis,
// afixos SECUNDÁRIOS de equipamentos e relíquias especiais).
const HIGH_SUPPORT_EFFECTS=['health','health_regen','attack_speed','cooldown','duration','move_speed','fairy_rate','mimic_chance'];
const HIGH_SUPPORT_SET=new Set(HIGH_SUPPORT_EFFECTS);
const HIGH_SUPPORT_CAPS=Object.freeze({hero:.30,gear:.10,artifact:.40});
// Somente marcos realmente desbloqueados contam. A soma pode chegar a 30%.
const SUPPORT_MILESTONE_GAIN=Object.freeze({20:.01,60:.02,100:.025,200:.03,500:.04,1000:.05,3000:.055,6000:.07});
const HERO_SPECIAL_MILESTONES=Object.freeze({
 h05:['health'],h22:['health_regen'],h30:['attack_speed'],h19:['duration'],
 h25:['cooldown'],h17:['move_speed'],h26:['fairy_rate'],h10:['mimic_chance']
});
function specialSupportBreakdown(effect){
 if(!HIGH_SUPPORT_SET.has(effect))return {hero:0,gear:0,artifact:0,total:0};
 let hero=0,gear=0,artifact=0;
 for(const h of D.heroes){
  if(!(HERO_SPECIAL_MILESTONES[h.id]||[]).includes(effect))continue;
  const level=heroMilestoneEffectiveLevel(h.id);
  for(const [milestone,value] of Object.entries(SUPPORT_MILESTONE_GAIN))
   if(level>=Number(milestone))hero+=value;
 }
 // Auras jamais amplificam afixos secundários.
 for(const item of Object.values(g.equipped||{}))if(item)
  for(const af of item.affixes||[])if(af.effect===effect)
   gear+=uniqueAffixValue(af,item);
 // Permanent collection support belongs to the existing gear support budget (+10%).
 gear+=setCollectionBonus(effect)+uniqueCollectionBonus(effect);
 for(const a of D.artifacts)if(a.special&&a.effect===effect){
  const lv=Math.min(80,Math.max(0,Number(g.artifactLevels?.[a.id])||0));
  artifact+=.40*(lv/80);
 }
 hero=Math.min(HIGH_SUPPORT_CAPS.hero,hero);
 gear=Math.min(HIGH_SUPPORT_CAPS.gear,gear);
 artifact=Math.min(HIGH_SUPPORT_CAPS.artifact,artifact);
 return {hero,gear,artifact,total:Math.min(.80,hero+gear+artifact)};
}
function fairyGroupSize(){
 const lv=Math.max(0,Math.min(80,Number(g.artifactLevels?.a105)||0));
 return Math.min(9,1+Math.floor(8*lv/80+1e-9));
}
function healthRegenPerSecond(){
 // Regeneração ligada à VIDA MÁXIMA e sem curar 80% do HP por segundo:
 // 0,15% do HP/s (mínimo 1,2 PV/s), com até +80% via 3 fontes.
 const introduction=g.difficulty===0&&g.stage<=FIRST_RUN_SMOOTH_END
  ? 1+1.8*(1-Math.pow(Math.max(0,g.stage-55)/(FIRST_RUN_SMOOTH_END-55),1.5))
  :1;
 return Math.max(1.2,maxHealth()*.0015)*mod('health_regen')*introduction;
}
function migrateSupportMainItem(item){
 if(!item||!isSupportEffect(item.effect)||item.slot==='Aura')return;
 const replacement={Arma:'physical',Capacete:'physical',Peitoral:'gold_monsters',Anel:'grace'}[item.slot]||'physical';
 // Nunca transformar porcentagens legadas colossais de HP em dano colosal.
 const old=Math.max(0,Number(item.value)||0);
 item.effect=replacement;item.value=Math.min(.20,old);item.mainSupportMigrated=true;
}
function migrateSpecialRelicLevels(){
 // Saves antigos podem possuir milhares de níveis de artefatos que agora têm cap 80.
 // Manter o investimento histórico no save, mas limitar seu nível efetivo a 80;
 // impedir futuras compras acima do teto sem retroagir outros artefatos.
 for(const a of D.artifacts)if(a.special){
  const lv=Math.max(0,Math.floor(Number(g.artifactLevels?.[a.id])||0));
  if(lv>80){g.legacyRelicOvercap=g.legacyRelicOvercap||{};
   g.legacyRelicOvercap[a.id]=Math.max(g.legacyRelicOvercap[a.id]||0,lv);
   const extra=lv-80;
   const refund=artifactLotCost(a,80,extra,true);
   relics=relics.add(refund);
   g.artifactLevels[a.id]=80;
   g.logs.unshift({s:g.stage,t:Date.now(),msg:`R33: ${a.name} limitado a Nv80; ${refund.fmt()} relíquias reembolsadas por ${extra} níveis antigos.`});
  }
 }
}
const GOLD_STAGE_GROWTH=1.055; // Mesmo crescimento de ouro ao atravessar cada mundo.
const WORLD_STAGES=24000;
// O nível de mundo volta a 1; as curvas de XP, ouro e relíquias NÃO podem
// voltar aos valores do mundo I. Mantém a continuidade econômica das 5 dificuldades.
function globalStage(stage=g.stage,difficulty=g.difficulty){
 return Math.max(1,Math.floor(Number(stage)||1))+WORLD_STAGES*clamp(Math.floor(Number(difficulty)||0),0,4);
}
/* R75: the treasure enemy is ONE source: Mimic, also known as Chesterson.
 * 325 ~ compensates for the retired 2.8%-chance x30 gold windfall on normal kills:
 * 260 + (.028 * 30 / .013) ~= 325. Does not add a second reward. */
const GOLD_SOURCE_BASE={monsters:1,boss:8,fairy:24,mimic:325,idle:1};
const GLOBAL_ECONOMY_EXPONENT=.18;
const SOURCE_ECONOMY_EXPONENT=.65;
function fairiesInterval(){return FAIRY_BASE_INTERVAL/Math.max(1,mod('fairy_rate'))}
function economySourceMultipliers(source){
 const key=source==='boss'?'gold_boss':source==='mimic'?'gold_mimic':source==='fairy'?'gold_fairy':source==='idle'?'gold_idle':source==='chesterson'?'gold_mimic':'gold_monsters';
 // All Gold grows substantially slower than a specialized source. Neither is hard-capped.
 const global=Math.pow(Math.max(1,mod('gold')),GLOBAL_ECONOMY_EXPONENT);
 const specific=Math.pow(Math.max(1,mod(key)),SOURCE_ECONOMY_EXPONENT);
 const legion=active.demons>0?1+Math.min(.15,skillBonus('demons','legion_gold')*.12):1;
 const branch=source==='boss'||source==='monsters'?goldBranchMultiplier('fury','gold_warpath'):
  source==='fairy'?goldBranchMultiplier('demons','gold_fairy_tree'):
  (source==='chesterson'||source==='mimic')?goldBranchMultiplier('arcane_focus','gold_chesterson_tree'):1;
 return global*specific*legion*branch;
}

// R16 — limiares únicos: 249→250, 499→500, 749→750... por dificuldade.
const THRESHOLD_INTERVAL=250;
const THRESHOLD_HP_START=22;
const THRESHOLD_HP_INCREMENT=6;
const THRESHOLD_HP_CAP=48;
function isThresholdStage(stage){return stage>0&&(stage+1)%THRESHOLD_INTERVAL===0}
function thresholdMultiplier(stage){return Math.min(THRESHOLD_HP_CAP,THRESHOLD_HP_START+Math.floor((stage+1)/THRESHOLD_INTERVAL-1)*THRESHOLD_HP_INCREMENT)}
function thresholdKey(stage,difficulty){return `${difficulty}:${stage}:threshold`}
function thresholdCleared(stage,difficulty){
 // Records inherited from pre-R16 campaigns were already passed, so never lock those saves retroactively.
 return g.firstClear.includes(thresholdKey(stage,difficulty)) ||
  stage+1<=(g.thresholdLegacyMax?.[difficulty]||0);
}
function thresholdBlocked(stage=g.stage,difficulty=g.difficulty){
 // R38: a simulação V é um teste de hordas SEM chefes de marco.
 // Sem esta exceção, a fase 24.249 ficava bloqueada por um guardião que
 // scheduleBosses() suprimia, causando milhares de abates sem avanço.
 if(endgameTrial&&trialScenario==='v24000'&&difficulty===4)return false;
 return isThresholdStage(stage)&&!thresholdCleared(stage,difficulty);
}
function isLargeMonster(kind){return ['elite','beast','mimic'].includes(kind)}
function monsterDropChance(kind){return kind==='boss'?0:isLargeMonster(kind)?LARGE_MONSTER_GEAR_CHANCE:MONSTER_GEAR_CHANCE}
function rollMonsterRarity(rng=Math.random){let r=rng();return r<.80?0:r<.95?1:2}
function bossGearOdds(d=0,prestiges=0){
 const tier=clamp(Number(d)||0,0,4);
 return {legendary:.01*(1+.15*tier),mythic:.002*(1+.20*tier),unique:prestiges>0?.001*(1+.20*tier):0};
}
function rollBossGearRarity(d=0,prestiges=0,rng=Math.random){
 const {legendary,mythic,unique}=bossGearOdds(d,prestiges);
 const x=rng(); // one uniform trial: exact absolute probability for each rarity
 return x<unique?5:x<unique+mythic?4:x<unique+mythic+legendary?3:null;
}
function normaliseAutoSell(value){return Array.isArray(value)?[...new Set(value.filter(x=>Number.isInteger(x)&&x>=0&&x<=5))]:[]}

// R11: classes are deliberately interleaved across the 32 price slots.
// The sequence begins with physical damage, then mixes economy/magic and faith.
// Purchases remain randomly ordered WITHIN progression-appropriate subgroups;
// the save stores the resulting order and migration runs exactly once.
const HERO_ORDER_LAYOUT=2;
const HERO_CLASS={
 warrior:['h01','h03','h05','h08','h11','h15','h16','h17','h18','h21','h22','h23','h25','h27','h32'],
 magic:['h04','h09','h10','h19','h26','h28','h29','h30','h31'],
 faith:['h02','h06','h07','h12','h13','h14','h20','h24']
};
const HERO_CLASS_NAMES={warrior:'Guerreiros',faith:'Sacerdotes',magic:'Magos'};
// R49: três novos MARCOS DE POTÊNCIA que reforçam apenas o buff passivo.
// Valores deliberadamente baixos para não multiplicar todas as fontes de dano.
const HERO_POWER_MILESTONES=Object.freeze([{level:10,mult:1.07},{level:30,mult:1.12},{level:50,mult:1.05}]);
const HERO_RANK_PASSIVE_STEP=.025; // R52: hierarquia perceptível entre heróis, sem criar DPS separado.
const HERO_MILESTONES=[10,20,30,50,60,100,200,500,999,1000,1999,2000,3000,4000,6000];
// 15 físicos, 9 mágicos, 8 de Fé. No maximum run exceeds two.
const HERO_ORDER_PATTERN=[
 'warrior','magic','warrior','faith','warrior','magic','warrior','faith',
 'warrior','magic','warrior','faith','warrior','magic','warrior','faith',
 'warrior','magic','warrior','faith','warrior','magic','warrior','faith',
 'warrior','magic','warrior','faith','magic','magic','warrior','faith'
];
const HERO_PRIORITY_GROUPS={
 warrior:[['h01'],['h03','h05','h21'],['h11','h16','h17','h08'],['h22','h18','h23','h25'],['h27','h15'],['h32']],
 magic:[['h04'],['h09','h10'],['h31','h26'],['h19','h30'],['h28','h29']],
 faith:[['h02','h06'],['h07'],['h12','h13'],['h24'],['h20','h14']]
};
function classOfHero(id){return Object.keys(HERO_CLASS).find(k=>HERO_CLASS[k].includes(id))||'warrior'}
function buildBalancedHeroOrder(previousOrder=null){
 const orderPosition=new Map((previousOrder||[]).map((id,i)=>[id,i]));
 const pools={};
 for(const kind of Object.keys(HERO_PRIORITY_GROUPS)){
  pools[kind]=HERO_PRIORITY_GROUPS[kind].flatMap(group=>{
   const available=[...group];
   if(previousOrder)available.sort((a,b)=>(orderPosition.get(a)??999)-(orderPosition.get(b)??999));
   else for(let i=available.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[available[i],available[j]]=[available[j],available[i]]}
   return available;
  });
 }
 const result=HERO_ORDER_PATTERN.map(kind=>pools[kind].shift());
 // Validate, fail early when a new hero is added without assigning a class.
 if(!validHeroOrder(result))throw new Error('Configuração incompleta da ordem dos heróis');
 return result;
}
function shuffledHeroOrder(){return buildBalancedHeroOrder()}
function validHeroOrder(order){return Array.isArray(order)&&order.length===D.heroes.length&&new Set(order).size===D.heroes.length&&D.heroes.every(h=>order.includes(h.id))}
function migrateHeroOrder(order){return buildBalancedHeroOrder(validHeroOrder(order)?order:null)}
function orderedHeroes(){return g.heroOrder.map(id=>D.heroes.find(h=>h.id===id))}
function heroRank(hero){const n=g.heroOrder.indexOf(hero.id);return n<0?D.heroes.indexOf(hero):n}
function gearRates(d=0,prestiges=0,allowUnique=true){
 // Each world tier slightly improves upper rarities, while mythical stays below 0.4%.
 const tier=clamp(Math.floor(Number(d)||0),0,4);
 const rare=.30*(1+.04*tier),epic=.10*(1+.10*tier);
 const legendary=.01*(1+.15*tier),mythic=.002*(1+.20*tier);
 const unique=allowUnique&&prestiges>0?.001*(1+.15*Math.max(0,tier-1)):0;
 const rest=1-unique;
 return [(1-rare-epic-legendary-mythic)*rest,rare*rest,epic*rest,legendary*rest,mythic*rest,unique];
}
function rollGearRarity(d=0,prestiges=0,allowUnique=true,rng=Math.random){
 const odds=gearRates(d,prestiges,allowUnique);let r=rng();
 for(let i=0;i<odds.length;i++){r-=odds[i];if(r<0)return i}
 return 4;
}
// R55 — Curadoria das descobertas para novos jogadores.
// O catálogo NÃO muda de IDs e nenhum artefato descoberto é removido.
// Os quatro primeiros são divididos em papéis que sempre ajudam no começo:
// dano, economia, dano adicional e sobrevivência. A quinta descoberta
// continua sendo Memória do Retorno (a014), garantida.
const ARTIFACT_STARTER_ROLES=[
 ['a001','a002','a004','a020','a080','a101'],             // Dano imediato
 ['a005','a012','a049','a057','a064','a071'],             // Ouro imediato
 ['a001','a002','a003','a004','a020','a078','a080','a083','a101'], // Combate
 ['a015','a074','a075','a077','a079','a094','a106']       // Sobrevivência
];
const ARTIFACT_STARTER_SET=new Set([
 ...ARTIFACT_STARTER_ROLES.flat(),
 'a017','a056','a063','a070','a081','a087','a088',
 'a050','a051','a052','a053','a054','a055','a061','a062',
 'a057','a064','a071','a083','a099'
]);
function artifactEligible(a,count=artCount()){
 if(!a||Number(g.artifactLevels?.[a.id])>0)return false;
 if(a.id===GUARANTEED_RELIC_ARTIFACT)return count===4;
 if(a.effect==='relic')return count>=4;
 const skill=D.skills.find(s=>s.id===a.effect);
 // Uma relíquia de habilidade só aparece se for utilizável AGORA.
 if(skill&&Math.max(1,Number(g.knightLevel)||1)<skill.unlock)return false;
 return true;
}
function artifactCandidatePool(count=artCount()){
 if(count>=D.artifacts.length)return [];
 if(count===4)return D.artifacts.filter(a=>a.id===GUARANTEED_RELIC_ARTIFACT&&artifactEligible(a,count));
 if(count<4){
  const roles=ARTIFACT_STARTER_ROLES[count]||[];
  return roles.map(id=>D.artifacts.find(a=>a.id===id)).filter(a=>artifactEligible(a,count));
 }
 // As descobertas 6–12 priorizam efeitos disponíveis desde o início.
 if(count<12)return D.artifacts.filter(a=>ARTIFACT_STARTER_SET.has(a.id)&&artifactEligible(a,count));
 return D.artifacts.filter(a=>artifactEligible(a,count));
}
function chooseArtifact(){
 const pool=artifactCandidatePool();
 if(!pool.length)return null;
 if(artCount()<12)return pool[Math.floor(Math.random()*pool.length)];
 // Progressão intermediária: favorecer bônus universais sem excluir builds.
 let weighted=pool.map(a=>({item:a,weight:ARTIFACT_STARTER_SET.has(a.id)?2.5:1}));
 let total=weighted.reduce((sum,item)=>sum+item.weight,0),roll=Math.random()*total;
 for(const result of weighted){roll-=result.weight;if(roll<0)return result.item}
 return weighted[weighted.length-1].item;
}

const ephemeralSaves={};
const safeStorage={
 getItem(k){try{return window.localStorage.getItem(k)}catch(_){return ephemeralSaves[k]||null}},
 setItem(k,v){ephemeralSaves[k]=v;try{window.localStorage.setItem(k,v);return true}catch(_){return false}}
};
const bigZero=()=>new Big(0);
class Big{
  constructor(v=0,e=undefined){if(v instanceof Big){this.m=v.m;this.e=v.e;return}if(Array.isArray(v)){this.m=Number(v[0])||0;this.e=Number(v[1])||0;return}if(typeof v==='string'){let parts=v.split('e');v=Number(parts[0]);e=Number(parts[1]||0)}this.m=Number(v)||0;this.e=e===undefined?0:Number(e)||0;this.norm()}
  norm(){
    if(!Number.isFinite(this.m)){this.m=this.m>0?9.999:0;this.e=99999}
    if(this.m===0){this.e=0;return this}
    // Scientific notation requires an INTEGER exponent. Enemy HP used to keep
    // decimal powers in 'e', making cmp() mistake 29 HP for more than 32 damage.
    if(!Number.isFinite(this.e))this.e=99999;
    const integral=Math.floor(this.e);
    this.m*=10**(this.e-integral);
    this.e=integral;
    const z=Math.floor(Math.log10(Math.abs(this.m)));
    this.m/=10**z;this.e+=z;
    return this;
  }
  static pow10(e){return new Big(1,Number(e))}
  static power(base,exponent){if(base<=0)return new Big(0);let log=Math.log10(base)*exponent;if(!Number.isFinite(log))log=99999;let n=Math.floor(log);return new Big(10**(log-n),n)}
  add(q){q=new Big(q);if(this.m===0)return q;if(q.m===0)return new Big(this);if(this.e-q.e>18)return new Big(this);if(q.e-this.e>18)return q;let e=Math.max(this.e,q.e);return new Big(this.m*10**(this.e-e)+q.m*10**(q.e-e),e)}
  sub(q){q=new Big(q);if(this.cmp(q)<=0)return new Big(0);if(this.e-q.e>18)return new Big(this);let e=Math.max(this.e,q.e);return new Big(this.m*10**(this.e-e)-q.m*10**(q.e-e),e)}
  mul(q){q=new Big(q);return new Big(this.m*q.m,this.e+q.e)}
  div(q){q=new Big(q);if(q.m===0)return new Big(0);return new Big(this.m/q.m,this.e-q.e)}
  cmp(q){
    q=new Big(q);
    // A negative intermediate HP is NEVER greater than zero, regardless of exponent.
    if(this.m<0&&q.m>=0)return -1;
    if(q.m<0&&this.m>=0)return 1;
    if(this.m===0)return q.m===0?0:(q.m>0?-1:1);
    if(q.m===0)return this.m>0?1:-1;
    const sign=this.m<0?-1:1;
    if(this.e!==q.e)return (this.e>q.e?1:-1)*sign;
    return this.m>q.m?1:this.m<q.m?-1:0;
  }
  num(limit=1e12){return clamp(this.m*10**clamp(this.e,-50,12),0,limit)}
  log10(){return this.m===0?-Infinity:Math.log10(this.m)+this.e}
  save(){return [this.m,this.e]}
  fmt(places=2){return compactNumber(this,places)}
}
const B=x=>new Big(x);
// R26: a single notation for stats, item effects, loot, artefacts and UI previews.
// 1.0315603607885402e16% → "10,32 Qa%". All formatting is presentation-only.
const NUMBER_SUFFIX=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No'];
function compactNumber(value,places=2){
 const b=value instanceof Big?value:new Big(value);
 if(b.m===0)return '0';
 if(!Number.isFinite(b.m)||!Number.isFinite(b.e))return '—';
 const sign=b.m<0?'-':'';
 const magnitude=Math.abs(b.m), e=b.e;
 const options={minimumFractionDigits:0,maximumFractionDigits:Math.max(0,Math.min(4,places))};
 if(e<3){const n=magnitude*Math.pow(10,e);return sign+n.toLocaleString('pt-BR',options)}
 let group=Math.floor(e/3),scaled=magnitude*Math.pow(10,e-3*group);
 const factor=Math.pow(10,Math.max(0,Math.min(4,places)));
 if(Math.round(scaled*factor)/factor>=1000){group++;scaled/=1000}
 if(group<NUMBER_SUFFIX.length)return sign+scaled.toLocaleString('pt-BR',options)+' '+NUMBER_SUFFIX[group];
 return sign+magnitude.toLocaleString('pt-BR',options)+'e'+e.toLocaleString('pt-BR');
}
function compactPercent(fraction,places=2){return compactNumber(new Big(fraction).mul(100),places)+'%'}
function compactMultiplier(value,places=2){return '×'+compactNumber(value,places)}
const fmt=n=>compactNumber(n);

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function seededSlot(){return Object.fromEntries(SLOTS.map(v=>[v,null]))}
function fresh(){return {version:1,slot:1,created:Date.now(),savedAt:Date.now(),stage:1,highest:[1,0,0,0,0],gearMonsterClaims:{},gearBossClaims:{},worldCapCleared:[false,false,false,false,false],balanceR70Version:1,difficulty:0,unlocked:1,worldPrestiges:0,knightPrestiges:0,runPeak:1,runStartStage:1,runKills:0,prestigeGates:{},thresholdSystemVersion:1,thresholdLegacyMax:[0,0,0,0,0],stageHold:false,knightLevel:1,xp:[0,0],gold:[0,0],relics:[0,0],totalRelics:[0,0],souls:0,runes:0,soulRuneVersion:2,soulCollection:{},soulSummons:0,soulResearch:{},soulResearchPoints:0,soulAffinity:'all',runeCollection:{},runeSummons:0,goldEarned:[0,0],kills:0,chestersonFinds:0,stageKills:0,deaths:0,damageTaken:0,firstClear:[],talentPoints:0,talentSpent:0,talentTreeVersion:TREE_SP_VERSION,talents:{},heroLevels:{},heroTrans:{},heroUpgradeProgress:{},heroOrder:shuffledHeroOrder(),heroOrderLayout:HERO_ORDER_LAYOUT,petLevels:{},petSelected:['p01','p17'],scrollLevels:{},artifactLevels:{},artifactFavorites:[],relicEconomyVersion:2,inventory:[],autoHeroes:true,autoSellRarities:[],autoSellProtectUpgrades:false,autoSellCount:0,autoSellEarnings:0,equipped:seededSlot(),setParts:{},setFocusId:null,uniqueDiscovered:[],buildings:Object.fromEntries(D.buildings.map(x=>[x.id,1])),village:{wood:0,stone:0,iron:0,forge:0,banknotes:0},chestsOpened:{small:0,medium:0,giant:0},production:{pet:0,scroll:0,forge:0},auto:true,autoRetreat:true,equippedSkills:['grace',null,null,null],skillLoadoutVersion:2,speed:1,sound:true,particles:true,attackFocus:'closest',gearNextId:1,logs:[],totalTime:0,autoSaveCount:0,autoLoot:true,fairyCountdown:FAIRY_BASE_INTERVAL}};
let testMode=false,labBackup=null,labLevel=20;
let endgameTrial=false,trialWasPlaying=false,trialScenario='i23999';
let trialBaseline=null; // R79: in-memory metrics only; never part of a save
let trialTelemetry=null; // R80: isolated combat diagnostic; not part of g or any save slot
let trialPower={physical:B(1),faith:B(1),magic:B(1)};
let g=fresh();let gold=B(0),relics=B(0),xp=B(0),totalRelics=B(0),goldEarned=B(0);
let bossWarnings=[],bossEmbers=[],bossPreviewMode=false,bossPreviewIndex=0;
let knightSwing=0;
let enemies=[],effects=[],floating=[],worldParticles=[],player={x:560,y:345,hp:100,mp:100},heroAnim=0;
// R59: temporários, LIMITADOS por conjuração; não entram no salvamento.
// R61 — Efeitos de habilidade: execução progressiva e legível, sempre ligada ao dano real.
// Nenhuma dessas sequências é uma animação sem impacto no combate.
// R63 — Duas habilidades de sinergia com funções independentes.
// Os IDs internos holy_spear e thunderstorm são mantidos para preservar saves, artefatos e talentos.
let fireOrbs=[],gracePulseClock=0;
let r61VisualEffects=[];
function r61WallMs(){return typeof performance==='undefined'?Date.now():performance.now();}
const R61_MAX_FIRE_ORBS=12;
function clearSkillReactions(){fireOrbs=[];gracePulseClock=0;r61VisualEffects=[];}
function skillFx(fx){if(effects.length<145)effects.push({t:0,life:.42,...fx});
 if(r61VisualEffects.length>=96)r61VisualEffects.shift();
 r61VisualEffects.push({born:r61WallMs(),life:.42,...fx});}
function skillLink(x,y,x2,y2,color,kind='link'){
 skillFx({x,y,x2,y2,r:20,color,kind,life:kind==='lightning'?.33:.27});
}
function nearestUnvisited(x,y,seen,maxRadius=330){
 let best=null,dist=maxRadius*maxRadius;
 for(const e of enemies){if(e.hp?.cmp(0)<=0||seen.has(e.id))continue;
  const d=(e.x-x)**2+(e.y-y)**2;if(d<=dist){best=e;dist=d;}}
 return best;
}
function makeFireOrb(x,y,seen=new Set()){
 if(fireOrbs.length>=R61_MAX_FIRE_ORBS)return false;
 const target=nearestUnvisited(x,y,seen,360);
 if(!target)return false;
 const visited=new Set(seen);visited.add(target.id);
 fireOrbs.push({x,y,targetId:target.id,visited,hop:0,age:0,ttl:3.6,trail:[]});
 skillFx({x,y,x2:target.x,y2:target.y,color:'#ff9b49',kind:'fireflight',life:.36});
 return true;
}
// Consumes only preexisting marks, never the ones placed by the same cast.
// Return: number of detonations, useful for regression tests and feedback.
function detonateEmbers(anchors,sourceSkill,limit=5){
 const chosen=anchors.filter(e=>enemies.includes(e)&&e.ember>0)
  .sort((a,b)=>(b.ember||0)-(a.ember||0)).slice(0,Math.max(0,Math.min(7,limit)));
 let detonated=0;
 for(const e of chosen){
  e.ember=0;detonated++;
  skillFx({x:e.x,y:e.y,r:85,life:.64,color:'#ffbd51',kind:'emberburst'});
  const hits=enemies.filter(t=>Math.hypot(t.x-e.x,t.y-e.y)<(73+Math.min(16,skillBonus('thunderstorm','thunder_chain')*6)))
   .slice(0,5);
  for(const t of hits){
   t.burning=Math.max(t.burning||0,3.5);
   hurt(t,magicDamage().mul((sourceSkill==='flame_nova'?.72:.88)*mod('thunderstorm')),
    false,'#ffae5e',false,'thunderstorm');
  }
 }
 return detonated;
}
function castVeilRequiem(){
 const alive=enemies.filter(e=>e.hp.cmp(0)>0);
 if(!alive.length)return 0;
 // Target cursed groups first: a stronger, intentional combination with Maldição do Véu.
 const lead=[...alive].sort((a,b)=>(Number(!!b.curse)*5-Math.hypot(b.x-player.x,b.y-player.y)/300)-
  (Number(!!a.curse)*5-Math.hypot(a.x-player.x,a.y-player.y)/300))[0];
 const radius=160*(1+Math.min(.50,skillBonus('holy_spear','radius')));
 const targets=alive.filter(e=>Math.hypot(e.x-lead.x,e.y-lead.y)<radius);
 const priorCursed=targets.filter(e=>e.curse).slice(0,Math.min(6,2+Math.floor(skillBonus('holy_spear','holy_echo')*2)));
 // An immediately useful attack even when the support skill is not equipped.
 blast(lead.x,lead.y,radius,faithDamage().mul(2.25*mod('holy_spear')),'#b27aff','magic','holy_spear');
 const exposure=4.4+Math.min(3,skillBonus('holy_spear','holy_radius')*4);
 for(const e of targets){if(!enemies.includes(e))continue;
  e.curse=true;e.veilExposure=Math.max(e.veilExposure||0,exposure);
 }
 let detonations=0;
 for(const e of priorCursed){
  // The target may have died in the opening hit; that is not a second free reward.
  if(!enemies.includes(e))continue;
  detonations++;skillLink(lead.x,lead.y,e.x,e.y,'#d58dff','veillink');
  skillFx({x:e.x,y:e.y,r:90,life:.66,color:'#ac59ef',kind:'veilburst'});
  const nearby=enemies.filter(t=>Math.hypot(t.x-e.x,t.y-e.y)<(75+Math.min(18,skillBonus('holy_spear','holy_radius')*12))).slice(0,4);
  for(const t of nearby){t.curse=true;t.veilExposure=Math.max(t.veilExposure||0,exposure);
   hurt(t,faithDamage().mul(1.12*mod('holy_spear')),false,'#d49aff',false,'holy_spear');}
 }
 return detonations;
}
function castEmberHeart(){
 const alive=enemies.filter(e=>e.hp.cmp(0)>0)
  .sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y));
 const targets=alive.filter(e=>Math.hypot(e.x-player.x,e.y-player.y)<=340).slice(0,Math.min(14,8+Math.floor(skillBonus('thunderstorm','thunder_chain'))));
 // If Nova already ignited them, trigger detonation immediately.
 const existingBurning=targets.filter(e=>e.burning>0).slice(0,Math.min(6,3+Math.floor(skillBonus('thunderstorm','thunder_chain')*2)));
 const markDuration=6.5+Math.min(4,skillBonus('thunderstorm','thunder_slow')*2.8);
 for(const e of targets){
  if(!enemies.includes(e))continue;
  skillLink(player.x,player.y,e.x,e.y,'#ff9d42','fireflight');
  skillFx({x:e.x,y:e.y,r:40,life:.46,color:'#ffa44e',kind:'embermark'});
  hurt(e,magicDamage().mul(1.65*mod('thunderstorm')),false,'#ffc278',false,'thunderstorm');
  if(enemies.includes(e)){e.ember=Math.max(e.ember||0,markDuration);e.burning=Math.max(e.burning||0,3.6);}
 }
 let burst=0;
 // Only enemies burning BEFORE this cast may explode immediately.
 for(const e of existingBurning){
  if(!enemies.includes(e))continue;
  e.ember=0;burst++;
  skillFx({x:e.x,y:e.y,r:90,life:.7,color:'#ffd36d',kind:'emberburst'});
  const near=enemies.filter(t=>Math.hypot(t.x-e.x,t.y-e.y)<78).slice(0,4);
  for(const t of near){t.burning=Math.max(t.burning||0,3.6);
   hurt(t,magicDamage().mul(.95*mod('thunderstorm')),false,'#ffba62',false,'thunderstorm');}
 }
 return burst;
}
function tickSkillReactions(dt){
 for(let i=fireOrbs.length-1;i>=0;i--){
  const orb=fireOrbs[i];orb.age+=dt;orb.ttl-=dt;
  let target=enemies.find(e=>e.id===orb.targetId&&e.hp.cmp(0)>0);
  if(!target){target=nearestUnvisited(orb.x,orb.y,orb.visited,320);
   if(target){orb.targetId=target.id;orb.visited.add(target.id);} }
  if(!target||orb.ttl<=0){fireOrbs.splice(i,1);continue;}
  orb.trail.unshift({x:orb.x,y:orb.y});if(orb.trail.length>6)orb.trail.pop();
  const dx=target.x-orb.x,dy=target.y-orb.y,dist=Math.hypot(dx,dy),step=740*dt;
  if(dist>Math.max(10,step)){orb.x+=dx/Math.max(1,dist)*step;orb.y+=dy/Math.max(1,dist)*step;continue;}
  orb.x=target.x;orb.y=target.y;
  skillFx({x:orb.x,y:orb.y,r:58,life:.50,color:'#ff8939',kind:'fireburst'});
  const amount=magicDamage().mul(Math.max(.38,.76*Math.pow(.83,orb.hop))*mod('flame_nova'));
  const victims=enemies.filter(e=>Math.hypot(e.x-orb.x,e.y-orb.y)<=58).slice(0,3);
  for(const enemy of victims)hurt(enemy,amount,false,'#ffb45c',false,'flame_nova');
  if(orb.hop>=3){fireOrbs.splice(i,1);continue;}
  const next=nearestUnvisited(orb.x,orb.y,orb.visited,340);
  if(!next){fireOrbs.splice(i,1);continue;}
  orb.hop++;orb.targetId=next.id;orb.visited.add(next.id);orb.trail.length=0;
  skillFx({x:orb.x,y:orb.y,x2:next.x,y2:next.y,color:'#ff9b49',kind:'fireflight',life:.36});
 }
 if(active.grace>0){
  gracePulseClock+=dt;let pulses=0;
  while(gracePulseClock>=1.15&&pulses++<3){
   gracePulseClock-=1.15;const target=getClosest(player.x,player.y);
   if(target&&Math.hypot(target.x-player.x,target.y-player.y)<345){
    skillLink(player.x,player.y-20,target.x,target.y,'#ffe6a2','spearline');
    skillFx({x:target.x,y:target.y,r:106,life:.65,color:'#fff0bb',kind:'gracewave'});
    blast(target.x,target.y,113*(1+Math.min(.3,skillBonus('grace','radius')*.25)),
     damage().mul(1.5*mod('grace')),'#f8e3b0','magic','grace');
    player.hp=Math.min(maxHealth(),player.hp+maxHealth()*.009);
   }
  }
 }else gracePulseClock=0;
}

let timers={attack:0,spawn:0,seconds:0,save:0,panel:0,header:0,regen:0,curse:0,demons:0,fairy:0,ai:0};
let cd={},active={},queue=[],bossActive=null,frameLast=0,simAccumulator=0,backgroundWallMs=Date.now(),realTimeCounters={header:0,panel:0,save:0},playing=false,paused=false,lastKillCount=0,attackNum=0,enemyId=1,manual={w:false,a:false,s:false,d:false};
let retreating=false,retreatCooldown=0,retreatTime=0,retreatDestination=null;
// R47: evasão curta, situacional e com tempo de recarga, sem fugir indefinidamente.
function evadeCandidateScore(x,y){
 let danger=0;
 for(const e of enemies){
  const dist=Math.hypot(e.x-x,e.y-y);
  const radius=e.kind==='boss'?225:e.kind==='elite'?155:135;
  if(dist<radius)danger+=Math.pow(1-dist/radius,2)*(e.kind==='boss'?4:1);
 }
 // Evite as paredes e os cantos; não escolha posição inalcançável fora da arena.
 const wall=Math.min(x-35,1085-x,y-40,650-y);
 if(wall<72)danger+=Math.pow((72-wall)/72,2)*2.2;
 return danger;
}
function selectRetreatDestination(){
 const here=evadeCandidateScore(player.x,player.y);
 let best=null,score=here;
 for(let i=0;i<16;i++){
  const angle=i*Math.PI/8;
  const nx=clamp(player.x+Math.cos(angle)*105,45,1075);
  const ny=clamp(player.y+Math.sin(angle)*105,50,640);
  const distance=Math.hypot(nx-player.x,ny-player.y);
  if(distance<50)continue;
  const candidate=evadeCandidateScore(nx,ny)+.13*(1-distance/105);
  if(candidate<score-.18){score=candidate;best={x:nx,y:ny};}
 }
 return best;
}
let tab='knight',panelMode='info',skillFocus='grace',skillView='tree',skillClass='physical',treeSelectedNode='grace_n01',treeTier=1,filters='',batch=1,artifactBuyMode='n1',artifactQuoteId=null,uiDirty=true,staging=0;
// Interface only. Category/page are not persisted and NEVER rearrange the save inventory.
let gearCategory='Arma',gearPage=0,heroDetailId=null,scrollMinOnly=false;
const GEAR_PAGE_SIZE=35;
const GEAR_SLOT_ICONS={'Arma':'⚔','Capacete':'♜','Peitoral':'♙','Aura':'✦','Anel':'◉'};
// R87 · Compara o impacto REAL da troca de uma peça sobre a build.
// Nenhum escore global arbitrário: efeitos diferentes são tratados como trocas
// estratégicas, e os limites de suporte, a Aura e o Capacete entram na prévia.
function gearAffectedEffects(candidate,previous){
 const affected=new Set();
 const remember=item=>{
  if(!item)return;
  if(item.effect&&!AURA_TARGETS[item.effect])affected.add(item.effect);
  for(const af of item.affixes||[])if(af?.effect&&!AURA_TARGETS[af.effect])affected.add(af.effect);
 };
 remember(candidate);remember(previous);
 const slot=candidate?.slot;
 // An old `gear` affix can modify several currently equipped main attributes.
 if([candidate,previous].some(item=>item?.effect==='gear'||(item?.affixes||[]).some(af=>af.effect==='gear'))){
  for(const piece of Object.values(g.equipped||{}))if(piece?.effect)affected.add(piece.effect);
  if(candidate?.effect)affected.add(candidate.effect);
 }
 for(const aura of [g.equipped?.Aura,slot==='Aura'?candidate:null]){
  if(!aura||!AURA_TARGETS[aura.effect])continue;
  const target=AURA_TARGETS[aura.effect];
  // A aura só afeta o atributo principal da peça destinada (jamais seus afixos).
  const piece=slot===target?candidate:g.equipped?.[target];
  if(piece?.effect)affected.add(piece.effect);
 }
 return [...affected].filter(effect=>!AURA_TARGETS[effect]&&effect!=='gear');
}
function gearEffectiveStat(effect){
 // Bônus principais e afixos de capacete não passam por mod('physical').
 return HERO_HELMET_CLASS[effect]?heroAttributeBonus(HERO_HELMET_CLASS[effect]):mod(effect);
}
function gearCompareSwap(candidate){
 if(!candidate||!SLOTS.includes(candidate.slot))return {kind:'invalid',changes:[],improved:0,worsened:0};
 const slot=candidate.slot,previous=g.equipped?.[slot]||null;
 if(previous?.id===candidate.id)return {kind:'equipped',changes:[],improved:0,worsened:0};
 const effects=gearAffectedEffects(candidate,previous),before={};
 for(const effect of effects)before[effect]=gearEffectiveStat(effect);
 const changes=[];
 try{
  g.equipped[slot]=candidate;
  for(const effect of effects){
   const old=before[effect],next=gearEffectiveStat(effect);
   // Precisão é essencial: bônus efetivo depois dos tetos e da aura.
   if(!Number.isFinite(old)||!Number.isFinite(next)){
    changes.push({effect,before:old,after:next,direction:0,uncertain:true});continue;
   }
   const tolerance=1e-10*Math.max(1,Math.abs(old),Math.abs(next));
   changes.push({effect,before:old,after:next,direction:next>old+tolerance?1:next<old-tolerance?-1:0});
  }
 }finally{g.equipped[slot]=previous;}
 const improved=changes.filter(x=>x.direction>0).length;
 const worsened=changes.filter(x=>x.direction<0).length;
 const uncertain=changes.some(x=>x.uncertain);
 const kind=uncertain?'unknown':improved&&worsened?'mixed':improved?'better':worsened?'worse':'equal';
 return {kind,changes,improved,worsened,previous};
}
function gearPreviewValue(effect,value){
 if(!Number.isFinite(value))return '—';
 if(effect==='crit_chance')return compactPercent(value,2);
 return compactMultiplier(value,3);
}
function gearCompareMarkup(result){
 if(!result||result.kind==='equipped'||result.kind==='invalid')return '';
 const state={better:['gear-compare-better','▲ GANHOS SEM PERDAS'],worse:['gear-compare-worse','▼ PERDAS SEM GANHOS'],mixed:['gear-compare-different','◇ TROCA DE ATRIBUTOS'],equal:['gear-compare-equal','= SEM MUDANÇA EFETIVA'],unknown:['gear-compare-different','◇ COMPARAÇÃO INCONCLUSIVA']}[result.kind];
 const previous=result.previous?'Comparado ao equipado':'Comparado ao espaço vazio';
 const changes=result.changes.filter(x=>x.direction!==0||x.uncertain);
 const lines=changes.map(x=>`<div class="gear-stat-change ${x.direction>0?'gear-stat-up':x.direction<0?'gear-stat-down':'gear-stat-neutral'}"><span>${esc(effectLabel(x.effect))}</span><b>${esc(gearPreviewValue(x.effect,x.before))} → ${esc(gearPreviewValue(x.effect,x.after))}</b></div>`).join('');
 const explanation=result.kind==='mixed'?'Há ganhos e perdas. Escolha conforme a sua build; não existe melhoria universal.':result.kind==='equal'?'Os efeitos comparáveis não mudam após os limites de bônus.':'Prévia dos atributos efetivos. Não equivale a uma previsão de DPS nem de desempenho da build.';
 return `<div class="gear-compare-badge ${state[0]}"><strong>${state[1]}</strong> · ${previous}<div class="gear-stat-changes">${lines||'<span>Sem alterações nos atributos efetivos calculados.</span>'}</div><small>${explanation}</small></div>`;
}
// Opcional e desligada por padrão para não alterar as preferências de venda
// automática de campanhas antigas. A proteção guarda apenas ganhos SEM perdas.
function gearShouldProtectFromAutoSale(item){
 if(g.autoSellProtectUpgrades!==true)return false;
 const equipped=g.equipped?.[item?.slot];
 if(!equipped)return true; // Primeiro item do slot pode mudar radicalmente a build.
 const result=gearCompareSwap(item);
 return result.kind==='better';
}
function gearSortedForSlot(inventory,slot){
 return inventory.filter(item=>item?.slot===slot).sort((a,b)=>
  (Number(b.rarity)||0)-(Number(a.rarity)||0) ||
  (Number(b.level)||0)-(Number(a.level)||0) ||
  (Number(b.quality)||0)-(Number(a.quality)||0) ||
  (Number(b.id)||0)-(Number(a.id)||0)
 );
}
let combatFeed=[],damageAccumulator=B(0),goldAccumulator=B(0),dpsValue=B(0),gpsValue=B(0),lastDpsTick=0;
let canvas=$('#battle-canvas'),ctx=canvas.getContext('2d'),bg=new Image(),sprites={};
bg.src=window.__assetUrls.arena;
let sounds={strike:new Audio('assets/audio/sound-0.wav'),relic:new Audio('assets/audio/sound-1.wav'),prestige:new Audio('assets/audio/sound-2.wav')};
const lastSoundMs={};
function sound(which){
 if(!g.sound)return;
 const now=Date.now();
 if(g.speed>=10&&now-(lastSoundMs[which]||0)<(which==='strike'?120:180))return;
 lastSoundMs[which]=now;
 try{let a=sounds[which];a.volume=which==='strike'?.14:.25;a.currentTime=0;a.play().catch(()=>{})}catch(_){}
}
function alertGame(msg,kind='normal'){let host=$('#toast-root'),div=document.createElement('div');div.className='toast';div.textContent=msg;host.append(div);while(host.children.length>4)host.firstElementChild.remove();setTimeout(()=>div.remove(),3500);feed(msg);log(msg);uiDirty=true}
function log(msg){g.logs.unshift({s:g.stage,t:Date.now(),msg});if(g.logs.length>65)g.logs.length=65}
function feed(msg){combatFeed.unshift(msg);combatFeed.length=Math.min(3,combatFeed.length);$('#combat-msg').textContent=msg;$('#combat-feed').innerHTML=combatFeed.map(s=>`<div>${esc(s)}</div>`).join('')}
function save(slot=g.slot,quiet=true){if(!playing||testMode)return false;try{delete g.training;let record={...g,slot,savedAt:Date.now(),gold:gold.save(),relics:relics.save(),xp:xp.save(),totalRelics:totalRelics.save(),goldEarned:goldEarned.save(),backgroundPendingSeconds:Math.max(0,simAccumulator)};let persisted=safeStorage.setItem(BKEY+slot,JSON.stringify(record));g.savedAt=record.savedAt;g.slot=slot;$('#footer-status').textContent=persisted?'SALVO · '+new Date().toLocaleTimeString('pt-BR'):'ATENÇÃO: SAVE APENAS TEMPORÁRIO';if(!quiet)alertGame(persisted?'Campanha salva no espaço '+slot:'Este navegador bloqueou o salvamento persistente');return persisted}catch(e){console.error('save',e);if(!quiet)alertGame('Falha ao salvar neste navegador');return false}}
function normalizeLoadout(value){
 const out=[null,null,null,null],used=new Set();
 if(Array.isArray(value))for(let i=0;i<4;i++){
  const id=value[i];if(D.skills.some(s=>s.id===id)&&!used.has(id)){out[i]=id;used.add(id)}
 }
 // An explicitly empty loadout is valid: removing the last skill must stay removed.
 if(!Array.isArray(value))out[0]='grace';
 return out;
}
function migrateAbilitiesFromOldSave(){
 if(g.skillLoadoutVersion===2){g.equippedSkills=normalizeLoadout(g.equippedSkills);return}
 // R69: legacy active-skill levels are retired. Keep the item/talent ID migration below.
 // Talent points from removed trees are refunded, not deleted.
 const legal=new Set(D.skills.flatMap(x=>x.nodes.map(n=>n.id)));
 for(const id of Object.keys(g.talents||{}))if(!legal.has(id))delete g.talents[id];
 g.talentSpent=Object.values(g.talents||{}).reduce((sum,n)=>sum+Math.max(0,Number(n)||0),0);
 const fixItem=item=>{
  if(!item||typeof item!=='object')return;
  if(SKILL_EFFECT_MIGRATION[item.effect])item.effect=SKILL_EFFECT_MIGRATION[item.effect];
  for(const aff of item.affixes||[])if(SKILL_EFFECT_MIGRATION[aff.effect])aff.effect=SKILL_EFFECT_MIGRATION[aff.effect];
  if(item.slot==='Anel'){
   if(!DAMAGE_SKILLS.includes(item.effect))item.effect='grace';
   for(const aff of item.affixes||[])if(!DAMAGE_SKILLS.includes(aff.effect)){aff.effect=item.effect;aff.name='do Juramento Refeito';}
  }
 };
 for(const item of g.inventory||[])fixItem(item);
 for(const item of Object.values(g.equipped||{}))fixItem(item);
 g.equippedSkills=normalizeLoadout(g.equippedSkills);g.skillLoadoutVersion=2;
}
// R57 · As árvores compartilham pontos, mas cada afinidade reúne 3 ramificações.
const TALENT_CLASS_LAYOUT={
 physical:{name:'Físico',icon:'⚔',subtitle:'Aço, ouro de monstros e chefes',branches:['grace','fury','shadow'],gold:'Ouro de Monstros + Chefes',accent:'physical'},
 magic:{name:'Magia',icon:'✦',subtitle:'Feitiços e tesouros Chesterson',branches:['flame_nova','arcane_focus','thunderstorm'],gold:'Ouro Chesterson',accent:'magic'},
 faith:{name:'Fé',icon:'✠',subtitle:'Julgamento, fadas e bênçãos',branches:['curse','demons','holy_spear'],gold:'Ouro das Fadas',accent:'faith'}
};
const GOLD_TALENT_IDS=['fury_gold_tree','demons_gold_tree','arcane_gold_tree'];
function talentUnlockLevel(skill,node){
 if(node?.goldStarter)return Math.min(...D.skills.filter(s=>s.kind===skill.kind).map(s=>s.unlock));
 return skill.unlock;
}
function goldBranchMultiplier(skillId,stat){
 const level=Math.max(0,Math.min(5,Math.floor(skillBonus(skillId,stat)/.34+1e-7)));
 return Math.pow(1.34,level);
}
function talentRankCost(node,rank){
 // rank is CURRENT rank, so this returns price to buy the next rank
 return 1+Math.max(0,(node.tier||1)-1)+[0,1,2,4,7][Math.min(4,rank)];
}
function investedInTree(skillId){
 const skill=D.skills.find(x=>x.id===skillId);
 return skill?skill.nodes.reduce((v,node)=>{
  const lv=Math.min(node.ranks||5,g.talents[node.id]||0);
  for(let r=0;r<lv;r++)v+=talentRankCost(node,r);
  return v;
 },0):0;
}
function talentRequirements(skill,node){
 const rank=g.talents[node.id]||0,spent=investedInTree(skill.id);
 const allPrevious=skill.nodes.slice(0,-1).filter(n=>!n.goldStarter).every(n=>(g.talents[n.id]||0)>=1);
 const parentRank=node.prerequisite?(g.talents[node.prerequisite]||0):0;
 const requiredPrevious=node.prerequisite?(node.tier>=4?2:1):0;
 const parentOK=!node.prerequisite||parentRank>=requiredPrevious;
 const tierRequirement=TREE_TIER_SP[Math.min(5,Math.max(1,node.tier||1))-1]||0;
 const threshold=Math.max(tierRequirement,node===skill.nodes[skill.nodes.length-1]?TREE_FINAL_SP:0);
 const points=g.talentPoints-g.talentSpent;
 const cost=talentRankCost(node,rank);
 return {spent,threshold,parentOK,allPrevious:node!==skill.nodes[skill.nodes.length-1]||allPrevious,points,cost,rank,canBuy:rank<node.ranks&&spent>=threshold&&parentOK&&(node!==skill.nodes[skill.nodes.length-1]||allPrevious)&&points>=cost};
}
// R27: partial or complete respec of ONE tree, with full rank-cost refund.
// A candidate removal triggers a dependency validation pass. Higher-tier nodes
// made invalid by the removal are refunded in full (with confirmation).
function talentSpentForLevels(skill,levels){
 return skill.nodes.reduce((total,node)=>{
  const rank=Math.max(0,Math.min(node.ranks||5,Math.trunc(Number(levels[node.id])||0)));
  for(let i=0;i<rank;i++)total+=talentRankCost(node,i);
  return total;
 },0);
}
function planTalentRemoval(skill,nodeId=null){
 if(!skill)return null;
 const existing=Object.fromEntries(skill.nodes.map(n=>[n.id,Math.max(0,Number(g.talents[n.id])||0)]));
 const before=talentSpentForLevels(skill,existing);
 if(before===0)return null;
 const next={...existing};
 if(nodeId!==null){if(!skill.nodes.some(n=>n.id===nodeId)||!next[nodeId])return null;next[nodeId]--;}
 else for(const n of skill.nodes)next[n.id]=0;
 const removed=[];
 if(nodeId!==null){
  // Iteratively remove now-invalid nodes; each affected descendant is refunded.
  for(let changed=true;changed;){
   changed=false;
   for(const n of skill.nodes){
    if(!next[n.id])continue;
    const parent=n.prerequisite?Number(next[n.prerequisite]||0):0;
    const required=n.prerequisite?(n.tier>=4?2:1):0;
    const spentOthers=skill.nodes.reduce((points,v)=>{
      if(v.id===n.id)return points;
      const rank=Number(next[v.id])||0;
      for(let i=0;i<rank;i++)points+=talentRankCost(v,i);
      return points;
    },0);
    const tierReq=TREE_TIER_SP[Math.min(5,Math.max(1,n.tier||1))-1]||0;
    const threshold=Math.max(tierReq,n===skill.nodes[skill.nodes.length-1]?TREE_FINAL_SP:0);
    const finalNeedsAll=n===skill.nodes[skill.nodes.length-1]&&skill.nodes.slice(0,-1).filter(v=>!v.goldStarter).some(v=>!next[v.id]);
    if(parent<required || spentOthers<threshold || finalNeedsAll){
      removed.push(n.name);next[n.id]=0;changed=true;
    }
   }
  }
 }
 const refund=before-talentSpentForLevels(skill,next);
 return {next,refund,removed,changed:skill.nodes.filter(n=>next[n.id]!==existing[n.id]).map(n=>n.id),before};
}
function applyTalentRemoval(skill,plan){
 if(!skill||!plan||plan.refund<=0)return false;
 for(const node of skill.nodes){
  if(plan.next[node.id]>0)g.talents[node.id]=plan.next[node.id];
  else delete g.talents[node.id];
 }
 // Always recompute from every tree: this is safer for imported old saves.
 g.talentSpent=D.skills.reduce((total,sk)=>total+talentSpentForLevels(sk,g.talents),0);
 alertGame('Árvore '+skill.name+': '+plan.refund+' pontos devolvidos.');
 save(g.slot,true);uiDirty=true;
 return true;
}
// R101 migration: retired pets never appear as drops or on panels.
// Their purchased/earned levels are transferred only ONCE (source IDs are deleted),
// so existing saves retain their investment without creating banned bonuses.
const RETIRED_PET_REPLACEMENTS=Object.freeze({p30:'p19',p32:'p28'});
function migrateRetiredPets(){
 if(!g.petLevels||typeof g.petLevels!=='object'||Array.isArray(g.petLevels))g.petLevels={};
 const selection=Array.isArray(g.petSelected)?g.petSelected:[];
 g.petSelected=selection.map(id=>RETIRED_PET_REPLACEMENTS[id]||id);
 for(const [oldId,newId] of Object.entries(RETIRED_PET_REPLACEMENTS)){
  const original=Math.max(0,Math.floor(Number(g.petLevels[oldId])||0));
  const existing=Math.max(0,Math.floor(Number(g.petLevels[newId])||0));
  if(original)g.petLevels[newId]=Math.min(Number.MAX_SAFE_INTEGER,existing+original);
  delete g.petLevels[oldId];
 }
}
function normalizePetSelection(value){
 const res=[];
 for(const group of ['offense','support']){
  const chosen=(Array.isArray(value)?value:[]).find(id=>D.pets.some(p=>p.id===id&&p.group===group)&&(g.petLevels[id]||0)>0);
  const fallback=D.pets.find(p=>p.group===group&&(g.petLevels[p.id]||0)>0);
  if(chosen||fallback)res.push(chosen||fallback.id);
 }
 return res;
}
function equippedSkill(id){return g.equippedSkills?.includes(id)===true}
function equipSkill(id){
 const s=D.skills.find(x=>x.id===id);
 if(!s)return false;
 if(g.knightLevel<s.unlock){alertGame('Esta habilidade desbloqueia no nível '+s.unlock);return false}
 let slots=normalizeLoadout(g.equippedSkills);
 const already=slots.indexOf(id);
 if(already>=0){slots[already]=null;active[id]=0;g.equippedSkills=slots;alertGame(s.name+' removida.');return true}
 let empty=slots.indexOf(null);
 if(empty<0){alertGame('Limite de 4 habilidades. Desequipe uma antes.');return false}
 slots[empty]=id;g.equippedSkills=slots;alertGame(s.name+' equipada no espaço '+(empty+1));return true;
}

// R48 — Permanent Echo (Necrobear-inspired) and Rune (Gemstone-inspired) collections.
// Zero new visual files; exactly the same static sprite bundle remains in use.
const SOUL_COST=10;
const ECHO_RARITIES=[['Comum','#bcb8b5'],['Raro','#70addb'],['Épico','#b994ea'],['Lendário','#ecc47a']];
const ECHO_FAMILIES=[['physical','Físico','⚔'],['faith','Fé','✠'],['magic','Magia','✦'],['hunt','Caçada','♜'],['gold','Economia','◆'],['relic','Prestígio','◈']];
const ECHO_BLUEPRINTS=[
 [['Recruta das Cinzas','physical'],['Lâmina Esquecida','physical'],['Guardião da Fortaleza','normal_damage'],['Carrasco Eterno','boss_damage'],['Bandeira do Exílio','damage'],['Rei da Guerra','physical']],
 [['Acólito Velado','faith'],['Vigia da Luz','faith'],['Juiz do Crepúsculo','normal_damage'],['Oráculo Partido','boss_damage'],['Arauto do Juramento','faith'],['Serafim das Ruínas','damage']],
 [['Fagulha Arcana','magic'],['Espectro do Véu','magic'],['Teurgo Silencioso','curse'],['Tecelão de Feitiços','magic'],['Olho da Tempestade','area'],['Arconte do Vazio','damage']],
 [['Batedor Sem Nome','normal_damage'],['Caçador Profanado','boss_damage'],['Lobo da Fronteira','normal_damage'],['Executora do Abismo','boss_damage'],['Chama Purificadora','area'],['Titã do Crepúsculo','damage']],
 [['Mercador Perdido','gold'],['Mímico Domesticado','gold_mimic'],['Colecionador de Moedas','gold_monsters'],['Tesoureiro do Reino','gold_boss'],['Coroa da Abundância','gold'],['Balança Ancestral','gold_fairy']],
 [['Peregrino dos Ecos','relic'],['Portador das Memórias','relic'],['Guardião dos Fragmentos','gold'],['Custódio das Ruínas','relic'],['Sábio da Permanência','relic'],['Espírito do Renascimento','damage']]
];
const SOUL_ECHOES=ECHO_BLUEPRINTS.flatMap((arr,group)=>arr.map(([name,effect],i)=>({id:'echo_'+group+'_'+i,name,effect,group,rarity:i===5&&(group===0||group===3)?3:i===5?2:i>=3?1:0})));
// No slots, no rerolls. Every copy permanently increases its matching Rune level.
const RUNE_LIST=[
 ['Marca do Guerreiro','physical','boss_damage'],['Voto da Aurora','faith','gold'],['Olho Preciso','crit_chance','normal_damage'],['Tesouro Antigo','gold','gold_boss'],
 ['Selo Arcano','magic','area'],['Medalhão de Colosso','boss_damage','physical'],['Rastro Amaldiçoado','curse','magic'],['Lâmina Sangrenta','normal_damage','crit_damage'],
 ['Promessa de Ouro','gold_monsters','gold_mimic'],['Coroa do Vencedor','damage','boss_damage'],['Aço da Ruína','physical','magic'],['Memória de Relíquias','relic','gold'],
 ['Lágrima da Fé','faith','relic'],['Runa dos Arcanistas','magic','boss_damage'],['Insígnia de Caça','normal_damage','gold_monsters'],['Véu do Vazio','area','curse'],
 ['Joia do Conquistador','boss_damage','gold_boss'],['Moeda Fantasma','gold_mimic','gold_fairy'],['Chama do Julgamento','faith','area'],['Pedra de Magia','magic','relic'],
 ['Selo da Destruição','crit_damage','physical'],['Emblema da Fortuna','gold','relic'],['Marca do Exterminador','damage','normal_damage'],['Runa do Retorno','relic','damage']
];
const SOUL_RUNES=RUNE_LIST.map(([name,primary,secondary],i)=>({id:'rune_'+i,name,primary,secondary}));
const SOUL_RESEARCH=[
 {id:'force',name:'Força dos Condenados',effect:'physical',rate:.035,parents:[]},
 {id:'wealth',name:'Tributo do Submundo',effect:'gold',rate:.035,parents:[]},
 {id:'faith',name:'Fé dos Esquecidos',effect:'faith',rate:.04,parents:['force']},
 {id:'arcane',name:'Conhecimento Oculto',effect:'magic',rate:.04,parents:['force']},
 {id:'soul_harvest',name:'Coleta de Almas',effect:'soul_drop',rate:.12,parents:['wealth']},
 {id:'relics',name:'Memória do Mundo',effect:'relic',rate:.04,parents:['wealth']},
 {id:'hunts',name:'Caçada Profana',effect:'boss_damage',rate:.05,parents:['faith','arcane']},
 {id:'runic',name:'Fenda Rúnica',effect:'rune_chest',rate:.12,parents:['soul_harvest']},
 {id:'might',name:'Poder Absoluto',effect:'damage',rate:.028,parents:['hunts','relics']},
 {id:'legacy',name:'Legado das Almas',effect:'relic',rate:.055,parents:['runic','relics']}
];
const RESEARCH_MAX=5;
const SOUL_AFFINITY_OPTIONS=[['all','Equilibrado'],...ECHO_FAMILIES.map(x=>[x[0],x[1]])];
const clampRank=(n)=>Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Number(n)||0)));
function researchLevel(id){return Math.min(RESEARCH_MAX,clampRank(g.soulResearch?.[id]));}
function researchUnlocked(node){return node.parents.every(id=>researchLevel(id)>=RESEARCH_MAX);}
function clearSoulRuneCache(){soulRuneBonusCache.clear()}
const soulRuneBonusCache=new Map();
function echoBonusAt(e,level){if(level<=0)return 0;return [.008,.013,.024,.045][e.rarity]*Math.pow(level,.75);}
function runePrimaryAt(level){return level<=0?0:.012*Math.pow(level,.70)}
function runeSecondaryAt(level){return level<10?0:.006*Math.pow(level-9,.60)}
function soulRuneBonus(effect){
 if(soulRuneBonusCache.has(effect))return soulRuneBonusCache.get(effect);
 let bonus=0;
 if(g.worldPrestiges>0){
  for(const e of SOUL_ECHOES)if(e.effect===effect)bonus+=echoBonusAt(e,clampRank(g.soulCollection?.[e.id]));
  for(const r of SOUL_RUNES){const lv=clampRank(g.runeCollection?.[r.id]);if(r.primary===effect)bonus+=runePrimaryAt(lv);if(r.secondary===effect)bonus+=runeSecondaryAt(lv);}
  for(const node of SOUL_RESEARCH)if(node.effect===effect)bonus+=researchLevel(node.id)*node.rate;
 }
 soulRuneBonusCache.set(effect,bonus);return bonus;
}
function chestArcaneReward(kind){
 if(g.worldPrestiges===0)return {souls:0,runes:0,extraChance:0};
 const i=Math.max(0,Math.min(4,g.worldPrestiges-1));
 const cfg={small:[5,1],medium:[18,4],giant:[52,12]}[kind]||[0,0];
 const raw=cfg[1]*(1+i*.15)*(1+researchLevel('runic')*.12);
 return {souls:Math.floor(cfg[0]*(1+i*.20)),runes:Math.floor(raw),extraChance:raw-Math.floor(raw)};
}
function migrateSoulRuneCollections(data={}){
 if(Number(data.soulRuneVersion)!==2){
  // R47 soul investment refunds its original exact costs; Reza was removed,
  // so all formerly invested souls are also returned to the wallet.
  const oldLevel=Math.min(1000,clampRank(data.soulLevel));
  let recovered=0;for(let i=0;i<oldLevel;i++)recovered+=Math.ceil(5*Math.pow(1.18,Math.min(60,i))*(1+i/50));
  for(const raw of Array.isArray(data.prayers)?data.prayers:[]){const lv=Math.min(1000,clampRank(raw));recovered+=2*lv+3*lv*(lv-1)/2;}
  g.souls=Math.max(0,clampRank(g.souls))+Math.floor(recovered);
  g.runeCollection={...g.runeCollection};
  // The twelve previously levelled glifos become the first twelve collectible runes.
  for(let i=0;i<12;i++){const oldLv=clampRank(data.runeRanks?.[i]);if(oldLv)g.runeCollection['rune_'+i]=Math.max(oldLv,clampRank(g.runeCollection['rune_'+i]));}
  g.logs.unshift({s:g.stage,t:Date.now(),msg:'R48: Reza removida. Almas investidas reembolsadas; melhorias de glifos transferidas para as Runas.'});
 }
 g.soulCollection=(g.soulCollection&&typeof g.soulCollection==='object'&&!Array.isArray(g.soulCollection))?g.soulCollection:{};
 g.runeCollection=(g.runeCollection&&typeof g.runeCollection==='object'&&!Array.isArray(g.runeCollection))?g.runeCollection:{};
 g.soulResearch=(g.soulResearch&&typeof g.soulResearch==='object'&&!Array.isArray(g.soulResearch))?g.soulResearch:{};
 g.soulSummons=clampRank(g.soulSummons);g.runeSummons=clampRank(g.runeSummons);
 g.soulResearchPoints=clampRank(g.soulResearchPoints);
 g.soulAffinity=SOUL_AFFINITY_OPTIONS.some(x=>x[0]===g.soulAffinity)?g.soulAffinity:'all';
 g.souls=Math.max(0,Math.floor(Number(g.souls)||0));g.runes=Math.max(0,Math.floor(Number(g.runes)||0));
 g.soulRuneVersion=2;
 delete g.prayers;delete g.runeRanks;delete g.soulLevel;
 clearSoulRuneCache();
}
function summonEcho(count=1){
 if(!g.worldPrestiges){alertGame('Invocação liberada após o primeiro Prestígio de Mundo.');return false;}
 let n=Math.min(250,Math.max(1,Math.floor(Number(count)||1)),Math.floor(g.souls/SOUL_COST));
 if(n<1){alertGame('Cada invocação requer 10 Almas.');return false;}
 const found=[];
 for(let i=0;i<n;i++){
  const rarityBoost=Math.min(.05,Math.floor(g.soulSummons/60)*.003);
  const p=Math.random();const rarity=p<.02+rarityBoost*.25?3:p<.10+rarityBoost?2:p<.35+rarityBoost*1.5?1:0;
  const choices=SOUL_ECHOES.filter(e=>e.rarity===rarity);
  const affinity=ECHO_FAMILIES.find(x=>x[0]===g.soulAffinity);
  const pool=choices.map(e=>({e,w:affinity&&ECHO_FAMILIES[e.group][0]===affinity[0]?4:1}));
  const total=pool.reduce((t,x)=>t+x.w,0);let roll=Math.random()*total;
  const result=pool.find(x=>(roll-=x.w)<0)?.e||choices[choices.length-1];
  g.soulCollection[result.id]=clampRank(g.soulCollection[result.id])+1;
  found.push(result);
  g.soulSummons++;
  if(g.soulSummons%12===0)g.soulResearchPoints++;
 }
 g.souls-=n*SOUL_COST;clearSoulRuneCache();uiDirty=true;
 alertGame(n===1?'Eco invocado: '+found[0].name+' · Nv '+g.soulCollection[found[0].id]:'Invocados '+n+' Ecos · +'+(Math.floor(g.soulSummons/12)-Math.floor((g.soulSummons-n)/12))+' ponto(s) de pesquisa.');
 return true;
}
function revealRunes(count=1){
 if(!g.worldPrestiges){alertGame('Runas liberadas após o primeiro Prestígio de Mundo.');return false;}
 const n=Math.min(250,Math.max(1,Math.floor(Number(count)||1)),g.runes);
 if(n<1){alertGame('Faltam fragmentos rúnicos.');return false;}
 let last=null;
 for(let i=0;i<n;i++){
  last=SOUL_RUNES[Math.floor(Math.random()*SOUL_RUNES.length)];
  g.runeCollection[last.id]=clampRank(g.runeCollection[last.id])+1;g.runeSummons++;
 }
 g.runes-=n;clearSoulRuneCache();uiDirty=true;
 alertGame(n===1?'Runa obtida: '+last.name+' · Nv '+g.runeCollection[last.id]:n+' Runas reveladas; todos os níveis aumentaram permanentemente.');
 return true;
}
function investResearch(id){
 if(!g.worldPrestiges)return false;
 const node=SOUL_RESEARCH.find(x=>x.id===id);
 if(!node||!researchUnlocked(node)||researchLevel(id)>=RESEARCH_MAX||g.soulResearchPoints<1){alertGame('Pesquisa bloqueada, maximizada ou sem pontos disponíveis.');return false;}
 g.soulResearch[id]=researchLevel(id)+1;g.soulResearchPoints--;clearSoulRuneCache();uiDirty=true;
 alertGame('Pesquisa: '+node.name+' · Nv '+g.soulResearch[id]+' / 5.');return true;
}

function load(slot=1){if(testMode){alertGame('Saia do laboratório antes de carregar uma campanha.');return false}try{let data=JSON.parse(safeStorage.getItem(BKEY+slot)||'null');if(!data||data.version!==1||!data.stage)return false;g={...fresh(),...data,slot};g.setFocusId=null;uniqueDiscoveryFromOwned();delete g.training; delete g.skillLevels; // R69: discard obsolete skill ranks, keep all atlas points.
 if(data.skillLoadoutVersion!==2)g.skillLoadoutVersion=1;g.runKills=Math.max(0,Math.floor(Number(g.runKills)||0));g.runStartStage=Math.max(1,Math.floor(Number(g.runStartStage)||1));g.prestigeGates=g.prestigeGates&&typeof g.prestigeGates==='object'?g.prestigeGates:{};g.autoHeroes=data.autoHeroes!==false;
 // R70: pre-existing highest stage is the historical first-clear frontier.
 // No retroactive gear rewards are minted for already conquered stages.
 g.gearMonsterClaims=g.gearMonsterClaims&&typeof g.gearMonsterClaims==='object'&&!Array.isArray(g.gearMonsterClaims)?g.gearMonsterClaims:{};
 g.gearBossClaims=g.gearBossClaims&&typeof g.gearBossClaims==='object'&&!Array.isArray(g.gearBossClaims)?g.gearBossClaims:{};
 g.worldCapCleared=Array.from({length:5},(_,d)=>Boolean(data.worldCapCleared?.[d])||(!data.balanceR70Version&&Number(data.highest?.[d]||0)>=WORLD_STAGES));
 g.balanceR70Version=1;
 g.inventory=Array.isArray(g.inventory)?g.inventory:[];
 for(const item of g.inventory){if(item&&typeof item==='object')item.favorite=item.favorite===true}
 g.autoSellRarities=normaliseAutoSell(g.autoSellRarities);g.autoSellProtectUpgrades=data.autoSellProtectUpgrades===true;g.autoSellCount=Math.max(0,Number(g.autoSellCount)||0);g.autoSellEarnings=Array.isArray(g.autoSellEarnings)?0:Math.max(0,Number(g.autoSellEarnings)||0); /* Legacy array counted GOLD, not cédulas; reset historical revenue rather than mislabel it. */g.stageHold=g.stageHold===true;g.autoRetreat=g.autoRetreat!==false;
 // R32: the purchased-level counter is monotonic inside a knight run. Existing
 // saves inherit their current price, never a retroactive 8000x transcendence tax.
 const historicProgress=g.heroUpgradeProgress&&typeof g.heroUpgradeProgress==='object'&&!Array.isArray(g.heroUpgradeProgress)?g.heroUpgradeProgress:{};
 g.heroUpgradeProgress={};
 for(const hero of D.heroes){
  const lv=clamp(Math.floor(Number(g.heroLevels?.[hero.id])||0),0,8000);
  const saved=Math.floor(Number(historicProgress[hero.id]));
  g.heroUpgradeProgress[hero.id]=Number.isFinite(saved)&&saved>=lv?saved:lv;
 }
 migrateAbilitiesFromOldSave();
 migrateSoulRuneCollections(data);
 if(data.talentTreeVersion!==TREE_SP_VERSION){
  // Full refund/re-spec on balance overhaul; point awards are preserved exactly.
  g.talents={};g.talentSpent=0;g.talentTreeVersion=TREE_SP_VERSION;
  g.logs.unshift({s:g.stage,t:Date.now(),msg:'R23: talentos antigos reiniciados; pontos de passiva devolvidos para redistribuição.'});
 }
 migrateRetiredPets();g.petSelected=normalizePetSelection(g.petSelected);
 g.artifactFavorites=normalizeArtifactFavorites(g.artifactFavorites);
 g.fairyCountdown=Number.isFinite(Number(g.fairyCountdown))&&Number(g.fairyCountdown)>0?Number(g.fairyCountdown):FAIRY_BASE_INTERVAL;

 if(!data.thresholdSystemVersion){
  // Migrar somente os limiares efetivamente ultrapassados nas versões anteriores.
  g.thresholdLegacyMax=(g.highest||[]).map(x=>250*Math.floor(Math.max(0,Number(x)||0)/250));
  g.thresholdSystemVersion=1;
 }
 g.thresholdLegacyMax=Array.from({length:5},(_,i)=>Math.max(0,Number(g.thresholdLegacyMax?.[i])||0));
 let restoredPrestigeLevel=false;
 if(!Number(data.prestigeLevelFixVersion)&&g.knightPrestiges>0){
  const gate=g.prestigeGates?.[g.difficulty];
  if(gate&&Number(gate.returnStage)>1&&g.stage>=Number(gate.returnStage)){
   const baseline=prestigeStageKnightLevel(Number(gate.returnStage),g.difficulty);
   if(g.knightLevel<baseline){g.knightLevel=baseline;restoredPrestigeLevel=true;g.logs.unshift({s:g.stage,t:Date.now(),msg:'R53: nível do cavaleiro corrigido para a fase de retorno do último prestígio.'})}
  }
  g.prestigeLevelFixVersion=1;
 }
 g.speed=SPEED_LEVELS.includes(Number(g.speed))?Number(g.speed):1;g.heroOrder=(data.heroOrderLayout===HERO_ORDER_LAYOUT&&validHeroOrder(g.heroOrder))?g.heroOrder:migrateHeroOrder(g.heroOrder);g.heroOrderLayout=HERO_ORDER_LAYOUT;g.buildings={...fresh().buildings,...g.buildings};g.production={...fresh().production,...g.production};g.village={...fresh().village,...g.village};g.chestsOpened=Object.fromEntries(Object.keys(CHEST_TYPES).map(k=>[k,Math.max(0,Math.floor(Number(g.chestsOpened?.[k])||0))]));calibrateGearInventory();for(const item of [...g.inventory,...Object.values(g.equipped||{}).filter(Boolean)])migrateSupportMainItem(item);gold=B(g.gold);
 if(restoredPrestigeLevel&&gold.cmp(0)===0)gold=enemyGold(g.stage,g.difficulty).mul(6);
 relics=B(g.relics);
 // Conversão única de saldo de Relíquias da economia R53 para a R54.
 // Os 106 artefatos descobertos e seus níveis não são apagados/rebaixados.
 // O estágio usado é o do último prestígio, não o máximo posterior alcançado
 // sem prestigiar: isso impede converter uma bolsa de R53 pela fase 24k.
 if(Number(data.relicEconomyVersion)!==2){
  let referenceStage=55,referenceDiff=0,foundPrestige=false;
  for(let d=0;d<5;d++){
   const prior=Math.floor(Number(g.prestigeGates?.[d]?.priorPeak)||0);
   if(prior>0&&(!foundPrestige||globalStage(prior,d)>globalStage(referenceStage,referenceDiff))){
    referenceStage=prior;referenceDiff=d;foundPrestige=true;
   }
  }
  if(!foundPrestige){referenceStage=Math.max(55,Math.floor(Number(g.stage)||55));referenceDiff=g.difficulty;}
  if(!g.knightPrestiges){
   for(let d=0;d<5;d++)if((g.highest?.[d]||0)>0&&globalStage(g.highest[d],d)>globalStage(referenceStage,referenceDiff)){
    referenceStage=g.highest[d];referenceDiff=d;
   }
  }
  const ratio=previousPrestigeRelics(referenceStage,referenceDiff).div(basePrestigeRelics(referenceStage,referenceDiff));
  if(ratio.cmp(1)>0&&relics.cmp(0)>0){
   g.relicBalanceBeforeR54=relics.save();
   relics=relics.div(ratio);
   g.logs.unshift({s:g.stage,t:Date.now(),msg:'R54: Relíquias disponíveis convertidas para a economia revisada (prestígio base fase '+referenceStage+'). Artefatos e níveis preservados.'});
  }
  g.relicEconomyVersion=2;
 }
 p67Migrate(data);migrateSpecialRelicLevels();xp=B(g.xp);totalRelics=B(g.totalRelics);goldEarned=B(g.goldEarned);let away=clamp((Date.now()-g.savedAt)/1000,0,24*3600);
 // Recover incomplete fixed simulation ticks from the last snapshot. Offline
 // town production is still a separate fallback for a fully CLOSED browser.
 const pendingOnSave=clamp(Number(data.backgroundPendingSeconds)||0,0,24*3600);
 offline(away);initialise();if(restoredPrestigeLevel&&g.autoHeroes)autoBuyHeroes(.70,false);reconcileSpectralPetMilestones();simAccumulator=pendingOnSave;save(g.slot,true);return true}catch(e){console.error('load',e);return false}}
function startNew(slot=1){if(testMode){alertGame('Saia do modo de teste antes de iniciar outra campanha.');return}g=fresh();g.slot=slot;gold=B(0);relics=B(0);xp=B(0);totalRelics=B(0);goldEarned=B(0);initialise();alertGame('Uma nova vigília começa nas ruínas.');save()}
function initialise(){lifestealPool=0;clearSkillReactions();clearSoulRuneCache();knightSwing=0;bossWarnings.length=0;bossEmbers.length=0;retreating=false;retreatCooldown=0;retreatTime=0;retreatDestination=null;simAccumulator=0;backgroundWallMs=Date.now();realTimeCounters={header:0,panel:0,save:0};frameLast=0;updateSpeedDisplay();enemies=[];effects=[];floating=[];queue=[];bossActive=null;enemyId=1;attackNum=0;player={x:560,y:345,hp:maxHealth(),mp:100*mod('mana'),contactInvuln:1.3,hitFlash:0};timers={attack:.2,spawn:0,seconds:0,save:0,panel:0,header:0,regen:0,curse:0,demons:0,fairy:g.fairyCountdown||FAIRY_BASE_INTERVAL,ai:0,equipRespawn:EQUIPMENT_BOSS_RESPAWN_SECONDS,heroAuto:1};cd={};active={};playing=true;paused=false;g.highest[g.difficulty]=Math.max(g.highest[g.difficulty]||0,g.stage);$('#start-overlay').classList.add('hidden');$('#pause').textContent='Ⅱ';renderAll();scheduleBosses(g.stage,true);for(let i=0;i<Math.min(12,aliveTarget(),queue.length?MAX_ALIVE_ENEMIES-1:MAX_ALIVE_ENEMIES);i++)spawnEnemy(true)}
function offline(seconds){if(seconds<=10)return;for(let k of ['wood','stone','iron'])g.village[k]+=seconds*(g.buildings[k]||1)*VILLAGE_RESOURCE_RATES[k];for(let b of ['pet','scroll','forge']){let cfg=D.buildings.find(x=>x.id===b);let interval=buildingInterval(b);let total=(g.production[b]||0)+seconds;let amount=Math.floor(total/interval);g.production[b]=total%interval;amount=Math.min(amount,100);if(b==='pet'){for(let i=0;i<amount;i++)givePet(false)}if(b==='scroll'){for(let i=0;i<amount;i++)giveScroll(false)}if(b==='forge')g.village.forge+=amount}let passive=passiveGold().mul(seconds);gold=gold.add(passive);goldEarned=goldEarned.add(passive);if(seconds>90)log('Retorno: produção offline por '+Math.floor(seconds/60)+' min')}
function grantGold(amount,source='monsters'){let gained=B(amount).mul(economySourceMultipliers(source));gold=gold.add(gained);goldEarned=goldEarned.add(gained);goldAccumulator=goldAccumulator.add(gained);return gained}
function spendGold(cost){cost=B(cost);if(gold.cmp(cost)<0)return false;gold=gold.sub(cost);uiDirty=true;return true}
function spendRelics(cost){cost=B(cost);if(relics.cmp(cost)<0)return false;relics=relics.sub(cost);trialTelemetryOnRelicSpent(cost);uiDirty=true;return true}
function artCount(){return Object.keys(g.artifactLevels).filter(k=>g.artifactLevels[k]>0).length}
function setCompleted(s){let parts=g.setParts[s.id]||[];return SLOTS.every(a=>parts.includes(a))}
// R92: every complete set grants BOTH permanent collection bonuses.
// These collection effects are independent of the currently equipped items.
// Values are modest and remain subject to the normal support and probability caps.
const SET_COLLECTION_BONUSES=Object.freeze({
 set01:{effect:'attack_speed',bonus:.025},set02:{effect:'crit_chance',bonus:.008},
 set03:{effect:'duration',bonus:.025},set04:{effect:'area',bonus:.035},
 set05:{effect:'duration',bonus:.025},set06:{effect:'relic',bonus:.012},
 set07:{effect:'area',bonus:.025},set08:{effect:'area',bonus:.025},
 set09:{effect:'attack_speed',bonus:.025},set10:{effect:'area',bonus:.035},
 set11:{effect:'mimic_chance',bonus:.015},set12:{effect:'fairy_rate',bonus:.015},
 set13:{effect:'gold_boss',bonus:.020},set14:{effect:'health_regen',bonus:.025},
 set15:{effect:'defense',bonus:.020},set16:{effect:'gold',bonus:.020}
});
function setCollectionBonus(effect){
 let sum=0;for(const set of D.sets)if(setCompleted(set)){
  const b=SET_COLLECTION_BONUSES[set.id];if(b?.effect===effect)sum+=b.bonus;
 }return sum;
}
// TT2-inspired: each Unique also unlocks a small permanent discovery bonus.
const UNIQUE_COLLECTION_BONUSES=Object.freeze({
 u01:{effect:'mana',bonus:.012},u02:{effect:'physical',bonus:.012},
 u03:{effect:'faith',bonus:.012},u04:{effect:'damage',bonus:.008},
 u05:{effect:'boss_damage',bonus:.012},u06:{effect:'gold',bonus:.012},
 u07:{effect:'grace',bonus:.012},u08:{effect:'fury',bonus:.012},
 u09:{effect:'gold_mimic',bonus:.012},u10:{effect:'curse',bonus:.012},
 u11:{effect:'area',bonus:.012},u12:{effect:'demons',bonus:.012},
 u13:{effect:'shadow',bonus:.012},u14:{effect:'health',bonus:.012},
 u15:{effect:'faith',bonus:.012},u16:{effect:'crit_damage',bonus:.012}
});
function uniqueCollectionBonus(effect){
 let sum=0;for(const id of new Set(Array.isArray(g.uniqueDiscovered)?g.uniqueDiscovered:[])){
  const b=UNIQUE_COLLECTION_BONUSES[id];if(b?.effect===effect)sum+=b.bonus;
 }return sum;
}
// Distinct identity primary and account-progression scaling for each new Unique.
// Scale is smooth and bounded; no exponential multiplication per stage.
const UNIQUE_PRIMARY=Object.freeze({
 u01:{effect:'aura_ring',metric:'scroll',label:'níveis de pergaminhos'},
 u02:{effect:'physical',metric:'talent',label:'talentos investidos'},
 u03:{effect:'holy_spear',metric:'scroll',label:'níveis de pergaminhos'},
 u04:{effect:'damage',metric:'stage',label:'fase máxima conquistada'},
 u05:{effect:'physical',metric:'prestige',label:'prestígios concluídos'},
 u06:{effect:'gold',metric:'artifact',label:'artefatos aprimorados'},
 u07:{effect:'grace',metric:'talent',label:'talentos investidos'},
 u08:{effect:'physical',metric:'hero',label:'heróis desenvolvidos'},
 u09:{effect:'gold_mimic',metric:'mimic',label:'mímicos derrotados'},
 u10:{effect:'curse',metric:'rune',label:'invocações rúnicas'},
 u11:{effect:'holy_spear',metric:'set',label:'conjuntos completados'},
 u12:{effect:'demons',metric:'hero',label:'heróis desenvolvidos'},
 u13:{effect:'shadow',metric:'prestige',label:'prestígios concluídos'},
 u14:{effect:'physical',metric:'level',label:'nível do cavaleiro'},
 u15:{effect:'hero_faith',metric:'hero',label:'heróis desenvolvidos'},
 u16:{effect:'crit_damage',metric:'world',label:'prestígios de mundo'}
});
function uniqueProgressRatio(def){
 if(!def)return 0;
 let v=0,threshold=1;
 switch(def.metric){
  case 'scroll':v=Object.values(g.scrollLevels||{}).reduce((a,b)=>a+Math.max(0,Number(b)||0),0);threshold=1200;break;
  case 'talent':v=Math.max(0,Number(g.talentSpent)||0);threshold=450;break;
  case 'stage':v=Math.max(...(g.highest||[1]));threshold=12000;break;
  case 'prestige':v=Math.max(0,Number(g.knightPrestiges)||0)+5*Math.max(0,Number(g.worldPrestiges)||0);threshold=150;break;
  case 'artifact':v=Object.values(g.artifactLevels||{}).reduce((a,b)=>a+Math.sqrt(Math.max(0,Number(b)||0)),0);threshold=400;break;
  case 'hero':v=Object.values(g.heroLevels||{}).reduce((a,b)=>a+Math.max(0,Number(b)||0),0);threshold=35000;break;
  case 'mimic':v=Math.max(0,Number(g.mimicFinds)||0);threshold=350;break;
  case 'rune':v=Math.max(0,Number(g.runeSummons)||0);threshold=200;break;
  case 'set':v=D.sets.filter(setCompleted).length;threshold=8;break;
  case 'level':v=Math.max(0,Number(g.knightLevel)||0);threshold=12000;break;
  case 'world':v=Math.max(0,Number(g.worldPrestiges)||0);threshold=5;break;
 }
 return Number.isFinite(v)?Math.max(0,v)/(Math.max(0,v)+threshold):0;
}
function uniquePrimaryValue(item){
 let value=Math.max(0,Number(item?.value)||0);
 if(item?.uniqueVersion===2&&UNIQUE_PRIMARY[item.uniqueId]){
  value*=1+.50*uniqueProgressRatio(UNIQUE_PRIMARY[item.uniqueId]);
 }
 return item?.slot==='Aura'?Math.min(AURA_AMPLIFICATION_CAP,value):value;
}
function uniqueAffixValue(aff,item){
 let value=Math.max(0,Number(aff?.value)||0);
 if(item?.uniqueVersion===2&&aff?.uniqueSignature===item.uniqueId&&UNIQUE_PRIMARY[item.uniqueId]){
  value*=1+.20*uniqueProgressRatio(UNIQUE_PRIMARY[item.uniqueId]);
 }
 return value;
}
function uniqueDiscoveryFromOwned(){
 const discovered=new Set(Array.isArray(g.uniqueDiscovered)?g.uniqueDiscovered.filter(id=>UNIQUE_PRIMARY[id]):[]);
 for(const item of [...(g.inventory||[]),...Object.values(g.equipped||{})])if(item?.uniqueId&&UNIQUE_PRIMARY[item.uniqueId])discovered.add(item.uniqueId);
 g.uniqueDiscovered=[...discovered];
}

function scrollSet(){return Math.min(...D.scrolls.map(s=>g.scrollLevels[s.id]||0))}
// R96: cálculos puros compartilhados entre jogo e painéis. A prévia não altera
// a seleção, as coleções ou o save — apenas mostra a contribuição existente.
function petContributionAt(level,selected){
 const lv=Math.max(0,Math.floor(Number(level)||0));
 if(!lv)return 0;
 // Earlier duplicate levels remain useful; equipped pets get a meaningful
 // affinity bonus while passives grow gradually rather than exploding at Lv 1.
 const base=.165*Math.pow(lv,1.085);
 return base*(selected?1+Math.min(.33,.08+lv*.0025):Math.min(1,.08+.92*lv/85));
}
// R101: strengthen individual scrolls and the complete-collection floor.
function scrollSetMultiplierAt(minimum){return 1+.052*Math.pow(Math.max(0,Math.floor(Number(minimum)||0)),.78)}
function scrollContributionAt(level,minimum){
 const lv=Math.max(0,Math.floor(Number(level)||0));
 return lv*.041*scrollSetMultiplierAt(minimum);
}
function scrollProgress(){
 const minimum=scrollSet();
 const atMinimum=D.scrolls.filter(sc=>(g.scrollLevels[sc.id]||0)===minimum).length;
 return {minimum,atMinimum,aboveMinimum:D.scrolls.length-atMinimum,total:D.scrolls.length};
}
// R32: local hero level can restart after a transcendence, but accumulated
// purchases within the current KNIGHT run never restart at that moment.
function heroInvestmentLevel(id,atLevel=null){
 const local=clamp(Math.floor(Number(g.heroLevels?.[id])||0),0,8000);
 const raw=Number(g.heroUpgradeProgress?.[id]);
 const invested=Number.isFinite(raw)&&raw>=local?Math.floor(raw):local;
 if(atLevel===null)return invested;
 return Math.max(0,invested+Math.floor(Number(atLevel)||0)-local);
}
// All milestones already conquered survive transcendence. They do not stack
// each cycle, protecting support caps and multiplicative hero bonuses.
function heroMilestoneEffectiveLevel(id,level=g.heroLevels[id]||0){
 return (g.heroTrans[id]||0)>0?Math.max(8000,level):level;
}
// Milestones unlock buffs, NOT a level-by-level percentage to attack speed.
// h30 / attack_speed no longer causes uncapped attack speed: it is a Magic-class hero.
function heroMilestoneStatBonus(hero,level,effect){
 // Para suportes de alto impacto a fonte de HERÓI é calculada exclusivamente
 // via marcos em specialSupportBreakdown(), não por propriedade principal.
 if(HIGH_SUPPORT_SET.has(effect))return 0;
 const secondary={'h06':'mana','h07':'mana_regen','h23':'gear','h25':'defense'};
 if(secondary[hero.id]===effect){
  const scale={20:.015,60:.015,100:.02,200:.02,500:.02,1000:.03,3000:.03,6000:.05};
  return Object.entries(scale).reduce((v,[n,p])=>v+(level>=Number(n)?p:0),0);
 }
 return 0;
}
// R38: chance critica proveniente de MARCOS DO NIVEL dos herois,
// nao dos pets nem como atributo principal do heroi. Usa niveis permanentes
// apos transcendencia, sem reaplicar os mesmos marcos a cada novo ciclo.
const HERO_CRITICAL_MILESTONES=Object.freeze({20:.01,60:.01,100:.015,200:.02,500:.025,1000:.035,3000:.04,6000:.05});
function heroCriticalChanceBonus(){
 const level=heroMilestoneEffectiveLevel('h21');
 return Math.min(.205,Object.entries(HERO_CRITICAL_MILESTONES).reduce((sum,[milestone,bonus])=>sum+(level>=Number(milestone)?bonus:0),0));
}
function heroBonus(level,transcend){
 // Deliberate compatibility alias for old UI/test helpers (total general buff in milestones).
 return level>=3000?.195:level>=1000?.075:0;
}
// R49: o número de "poder próprio" é apenas um índice de progressão usado no
// laboratório; NÃO é dano independente. O buff real está em heroPassiveContribution().
function heroPowerMilestoneMultiplier(level){
 return HERO_POWER_MILESTONES.reduce((m,x)=>level>=x.level?m*x.mult:m,1);
}
function heroRankPassiveMultiplier(hero){
 return 1+HERO_RANK_PASSIVE_STEP*heroRank(hero);
}
function heroPassiveContribution(hero,level=heroMilestoneEffectiveLevel(hero.id),trans=g.heroTrans[hero.id]||0){
 if(level<=0)return 0;
 let power=Math.min(.88,.075*Math.log1p(level)) + Math.min(.48,.035*Math.sqrt(Math.max(0,trans)));
 if(level>=20)power+=.04;if(level>=60)power+=.04;
 if(level>=100)power+=.05;if(level>=200)power+=.055;
 if(level>=500)power+=.06;if(level>=999)power+=.10;if(level>=1000)power+=.085;
 if(level>=1999)power+=.15;if(level>=2000)power+=.09;if(level>=3000)power+=.10;
 if(level>=4000)power+=.12;if(level>=6000)power+=.16;
 // Os marcos só multiplicam a contribuição DESTE herói e nunca os atributos
 // vindos de relíquias, equipamentos, pets ou outras fontes do cavaleiro.
 return power*heroPowerMilestoneMultiplier(level)*heroRankPassiveMultiplier(hero);
}
function ownHeroDps(hero,level=g.heroLevels[hero.id]||0,trans=g.heroTrans[hero.id]||0){
 if(level<=0)return B(0);
 // Índice ilustrativo. Não entra no combate nem cria ataques de heróis.
 let value=B(.62).mul(Big.power(1.52,heroRank(hero)))
  .mul(Big.power(1.067,Math.max(0,heroInvestmentLevel(hero.id,level)-1)))
  .mul(Big.power(1.85,Math.max(0,trans)));
 const milestoneLevel=trans>0?Math.max(8000,level):level;
 value=value.mul(heroPowerMilestoneMultiplier(milestoneLevel)*heroRankPassiveMultiplier(hero));
 if(milestoneLevel>=999)value=value.mul(4);
 if(milestoneLevel>=1999)value=value.mul(6);
 return value;
}
// Somente buffs no cavaleiro: a soma é aditiva entre heróis da mesma classe.
// O Legion multiplica uma vez o conjunto, sem buffar a si mesmo.
function heroAttributeBonus(kind){
 let bonus=0;
 for(const hero of D.heroes)if(classOfHero(hero.id)===kind)bonus+=heroPassiveContribution(hero);
 const legion=active.demons>0?1+Math.min(1.5,.35*mod('demons')):1;
 return 1+bonus*legion*helmetHeroFactor(kind);
}
function heroClassMultiplier(kind){
 let m=1;
 for(const h of D.heroes){const l=heroMilestoneEffectiveLevel(h.id),own=classOfHero(h.id);
  if(own===kind){if(l>=20)m*=1.08;if(l>=60)m*=1.08;if(l>=100)m*=1.10;if(l>=200)m*=1.12;if(l>=4000)m*=1.30;}
  if(l>=500)m*=1.10;
  if(l>=2000)m*=1.18;
  if(l>=6000)m*=1.40;
  if(h.id==='h30'&&kind==='magic'){
   if(l>=1000)m*=1.075;
   if(l>=3000)m*=1.12;
  }
 }
 return m;
}
function heroClassDps(kind){
 let sum=B(0);
 for(const h of D.heroes)if(classOfHero(h.id)===kind)sum=sum.add(ownHeroDps(h));
 if(sum.m===0)return sum;
 // All-hero damage is applied exactly once. No knight physical/faith double-dips.
 return sum.mul(heroClassMultiplier(kind)*mod('damage'));
}
function totalHeroDps(){return ['warrior','faith','magic'].reduce((s,c)=>s.add(heroClassDps(c)),B(0))}
function heroNextMilestone(level){return HERO_MILESTONES.find(n=>n>level)||8000}
function heroMilestoneText(h,level){
 const powerMilestone=HERO_POWER_MILESTONES.find(x=>x.level===level);
 if(powerMilestone)return `Marco de potência passiva: a contribuição de ${classOfHero(h.id)==='warrior'?'Físico':classOfHero(h.id)==='magic'?'Magia':'Fé'} deste herói recebe ×${powerMilestone.mult.toFixed(2).replace('.',',')} (uma vez, cumulativo com outros marcos).`;
 if(h.id==='h21'&&HERO_CRITICAL_MILESTONES[level])return `+${compactPercent(HERO_CRITICAL_MILESTONES[level])} de chance critica por nivel do heroi (acumula uma vez) · bonus de classe mantidos.`;
 const special=HERO_SPECIAL_MILESTONES[h.id]||[];
 if(special.length&&SUPPORT_MILESTONE_GAIN[level])
  return special.map(effect=>`+${compactPercent(SUPPORT_MILESTONE_GAIN[level])} ${effectLabel(effect)} (marco; teto +30% de heróis)`).join(' · ')+' · Bônus ofensivos/de classe continuam ativos.';
 let type=classOfHero(h.id),className=HERO_CLASS_NAMES[type];
 if([20,60,100,200,4000].includes(level))return `Bônus PASSIVO de ${type==='warrior'?'Físico':type==='magic'?'Magia':'Fé'} +${level===100?'5':level===200?'5,5':level===4000?'12':'4'}% (aditivo por classe)`;
 if(level===500)return 'Poder passivo de classe +6%';
 if(level===999)return 'Grande evolução: +10% no atributo da classe (além do poder próprio ×4)';
 if(level===1000)return h.effect==='attack_speed'?'Poder dos Elementalistas ×1,075':h.effect==='demons'?'Potência de LEGION +7,5%':`${effectLabel(h.effect)} +7,5%`;
 if(level===1999)return 'Grande evolução: +15% no atributo da classe (além do poder próprio ×6)';
 if(level===2000)return 'Poder passivo da classe +9%';
 if(level===3000)return h.effect==='attack_speed'?'Poder dos Elementalistas ×1,12':h.effect==='demons'?'Potência de LEGION +12%':`${effectLabel(h.effect)} +12%`;
 if(level===6000)return 'Poder passivo da classe +16%';
 return 'Transcendência: poder-base permanente ×1,85 e bônus passivo na classe';
}
function totalStatSource(effect){let hero=0,pet=0,scroll=0,art=0,sets=1,gear=0;
  for(let i=0;i<D.heroes.length;i++){
   const x=D.heroes[i],l=heroMilestoneEffectiveLevel(x.id);
   hero+=heroMilestoneStatBonus(x,l,effect);
  }
  for(const x of D.pets)if(x.effect===effect)pet+=petContributionAt(g.petLevels[x.id]||0,g.petSelected.includes(x.id));
  const scrollFloor=scrollSet();
  for(const x of D.scrolls)if(x.effect===effect)scroll+=scrollContributionAt(g.scrollLevels[x.id]||0,scrollFloor);
  for(const x of D.artifacts)if(x.effect===effect){let lv=g.artifactLevels[x.id]||0;if(lv)art+=x.power*Math.pow(lv,Number(x.power_exponent)||.79)}
  for(const s of D.sets)if(s.effect===effect&&setCompleted(s))sets*=s.mult;
  // All completed collections stack permanently. Support and crit chance use their dedicated caps.
  if(!HIGH_SUPPORT_SET.has(effect)&&effect!=='crit_chance')gear+=setCollectionBonus(effect)+uniqueCollectionBonus(effect);
  // A Aura aumenta apenas o valor do campo principal (item.effect/item.value)
  // de UMA peça alvo. Seus afixos adicionais não são escalados, assim como
  // bônus de heróis, conjuntos, pergaminhos, pets e artefatos.
  const aura=g.equipped?.Aura;
  const auraTarget=aura&&aura.slot==='Aura'?AURA_TARGETS[aura.effect]:null;
  // R93: use the effective Unique primary rather than the unscaled saved value.
  // This affects only Aura primary bonuses and respects the original 20% cap.
  const auraBoost=auraTarget?uniquePrimaryValue(aura):0;
  // R95: 'gear' was dormant (Talven, Forgeling, the scroll and two artifacts).
  // It improves ONLY main equipped attributes, not affixes, set/pet/hero bonuses
  // or the aura amplification itself. Resolve its source once per effect.
  const primaryFactor=effect==='gear'?1:equipmentPrimaryMultiplier();
  for(const item of Object.values(g.equipped||{}))if(item){
   if(item.slot!=='Aura'&&!HERO_HELMET_CLASS[item.effect]&&item.effect===effect)
    gear+=uniquePrimaryValue(item)*(item.slot===auraTarget?1+auraBoost:1)*primaryFactor;
   // Afixos SECUNDÁRIOS têm valor inalterado, inclusive no item alvo.
   for(const aff of item.affixes||[])if(aff.effect===effect)gear+=uniqueAffixValue(aff,item);
  }
  const legionHeroAmplifier=active.demons>0?1+Math.min(.65,.18*modLegionBase()*(1+skillBonus('demons','legion_hero_buff'))):1;
   return (1+hero*legionHeroAmplifier+pet+scroll+art+gear)*sets;
}
// R95: a potência dos equipamentos possui retorno decrescente e teto global
// de +6%, independente de quantas fontes tragam 'gear'. A origem do bônus
// continua sendo as fontes já existentes; nenhum drop ou preço muda.
const EQUIPMENT_PRIMARY_BONUS_CAP=.06;
function equipmentPrimaryMultiplier(){
 const raw=Math.max(0,totalStatSource('gear')-1);
 const bonus=Math.min(EQUIPMENT_PRIMARY_BONUS_CAP,.012*Math.log1p(raw));
 return 1+(Number.isFinite(bonus)?bonus:0);
}
// R45 — Dano de Todos os Artefatos (DTA): bônus aditivo por artefato.
// Cada artefato DESCOBERTO contribui e cada nível aumenta a contribuição.
// O total é aplicado uma única vez no multiplicador global de dano, não
// novamente para cada ataque/habilidade/afixo. Efeitos individuais permanecem.
// R54: Todos os Artefatos é um bônus PERCENTUAL ADITIVO, somado entre
// artefatos e aplicado uma só vez. Escala mais suave em níveis altos.
const ARTIFACT_ALL_DAMAGE_RATE=.070;
const ARTIFACT_ALL_DAMAGE_EXPONENT=.60;
function artifactAllDamagePercent(){
 let bonus=0;
 for(const a of D.artifacts){
  const level=Math.max(0,Math.floor(Number(g.artifactLevels?.[a.id])||0));
  if(level>0)bonus+=ARTIFACT_ALL_DAMAGE_RATE*Math.pow(level,ARTIFACT_ALL_DAMAGE_EXPONENT);
 }
 return bonus;
}
function artifactAllDamageMultiplier(){return 1+artifactAllDamagePercent()}
// R54: removida a Ressonância experimental da R52. Ela acrescentava um
// segundo multiplicador global por níveis investidos e rompia o teto de
// progressão. Mantidas as funções neutras para compatibilidade de chamadas.
function artifactResonanceLog10(){return 0}
function artifactResonanceMultiplier(){return B(1)}
function artifactIndividualDamagePercent(level){
 return level>0?ARTIFACT_ALL_DAMAGE_RATE*Math.pow(Math.max(0,level),ARTIFACT_ALL_DAMAGE_EXPONENT):0;
}
function modLegionBase(){return 1.08} // Fixed base; equipment and passive modifiers still apply.
const modCache=new Map();let modCacheAge=0;
function mod(effect){
 if(['wood','stone','iron','forge'].includes(effect))return 1; // Vila exclusivamente por níveis de construção.
 if(effect==='damage_reduction')return 1+relicDamageReduction();
 if(effect==='gear')return equipmentPrimaryMultiplier();
 if(HIGH_SUPPORT_SET.has(effect)){const raw=1+specialSupportBreakdown(effect).total;return effect==='attack_speed'?1.65*raw:raw;}
 let value=totalStatSource(effect);
 // R48: new permanent collections applied once to final statistics.
 if(D.skills.some(s=>s.id===effect))value*=(1+skillBonus(effect,'power')+skillBonus(effect,'damage')); // R69: no active skill rank multiplier.
 if(effect==='damage')value=Math.pow(Math.max(1,value),.48)*artifactAllDamageMultiplier(); // porcentagem aditiva aplicada uma vez
 if(effect==='crit_chance')value=clamp(.07+(value-1)*.12+heroCriticalChanceBonus()+soulRuneBonus(effect)+setCollectionBonus(effect)+uniqueCollectionBonus(effect),.02,.90);
 else {if(effect==='crit_damage')value=1.8*value;value*=1+soulRuneBonus(effect);}
 // Limite de efeito FINAL, sem exceções por sistema ou multiplicador de conjunto.
 // Velocidade usa taxa-base 1,65 ataques/s; as outras estatísticas usam base 1.
 if(isSupportEffect(effect))value=Math.min(1+SUPPORT_BONUS_CAP,Math.max(1,value));
 return value;
}
// Níveis acima dos inimigos continuam ajudando, mas rendem menos dano bruto.
// Uma campanha antiga com lvl 60 na fase 14 não deve eliminar tudo com um golpe.
function effectiveCombatLevel(){
 const limit=globalStage()+BALANCE.overlevelFull;
 return Math.min(g.knightLevel,limit)+Math.max(0,g.knightLevel-limit)*BALANCE.overlevelEfficiency;
}
function experienceEfficiency(){
 // Farming a lower stage remains useful, but levels far beyond its threat yield less XP.
 return Math.max(.0001,Math.pow(.70,Math.max(0,g.knightLevel-(3+.65*globalStage()))));
}
function basePhysicalDamage(){return 10+Math.max(0,g.knightLevel-1)}
// R52: físico ganha potência escalonada pelo NÍVEL EFETIVO, não pelo índice
// ilustrativo dos heróis. Mantém +1 dano-base/nível, mas permite acompanhar
// Fé/Magia em fases avançadas sem explodir o dano físico em níveis altos.
function knightPhysicalScaling(){
 const lv=Math.max(1,effectiveCombatLevel());
 return Big.power(BALANCE.physicalGrowth,lv-1).div(1+(lv-1)/40);
}
function maxHealth(){return knightBaseHealth()*mod('health')}
function damage(){return B(basePhysicalDamage()).mul(knightPhysicalScaling()).mul(mod('physical')*heroAttributeBonus('warrior')).mul(mod('damage')).mul(artifactResonanceMultiplier()).mul(active.fury>0?r67FuryMultiplier():1).mul(endgameTrial?trialPower.physical:1)}
function faithDamage(){return B(9).mul(Big.power(BALANCE.faithGrowth,effectiveCombatLevel()-1)).mul(mod('faith')*heroAttributeBonus('faith')).mul(mod('damage')).mul(artifactResonanceMultiplier()).mul(endgameTrial?trialPower.faith:1)}
function magicDamage(){return B(8).mul(Big.power(BALANCE.magicGrowth,effectiveCombatLevel()-1)).mul(mod('magic')*heroAttributeBonus('magic')).mul(mod('damage')).mul(artifactResonanceMultiplier()).mul(active.arcane_focus>0?r67FocusMultiplier():1).mul(endgameTrial?trialPower.magic:1)}
// R52 — Curva de desafio em atos, recalibrada com todas as fontes de poder, inspirada na estrutura do TT2 (não suas fórmulas).
// Dificuldade cresce progressivamente; um prestígio mais forte permite retomar e avançar.
// IMPORTANTE: mesma equação para cinco mundos, sem descontinuidade nos estágios 185/250.
const FIRST_RUN_SMOOTH_END=250;
function enemyProgressLog(stage){
 const n=Math.max(0,stage-1);
 return Math.min(n,54)*Math.log(1.047)
       +Math.min(Math.max(n-54,0),195)*Math.log(1.050)
      +Math.min(Math.max(n-249,0),1750)*Math.log(1.046)
      +Math.max(n-1999,0)*Math.log(1.037);
}
// Compatibilidade com UI/vida de contato de revisões anteriores.
function firstRunGrowth(stage,starterRate,originalRate){return enemyProgressLog(stage);}
// Uma única passagem pela fase rende esses incentivos. Não são drops normais
// e nunca reaparecem por farm fixo, retorno de fase ou novo prestígio.
const FIRST_RUN_REWARDS=Object.freeze({10:120,25:350,40:1100});
function grantFirstRunMilestone(stage){
 if(g.difficulty!==0||!(stage in FIRST_RUN_REWARDS))return;
 const key='0:'+stage+':starter';
 if(g.firstClear.includes(key))return;
 // Migrated saves that already reached this milestone cannot collect it again
 // by replaying an earlier stage after installing this revision.
 if((g.highest[0]||1)>=stage){g.firstClear.push(key);return;}
 g.firstClear.push(key);
 const reward=B(FIRST_RUN_REWARDS[stage]);
 gold=gold.add(reward);goldEarned=goldEarned.add(reward);
 if(stage===10){
  const item=giveGear(stage,0,null,'Arma',1);
  // A primeira arma tem um bônus físico garantido e não exige RNG favorável.
  item.effect='physical';
  if(!g.equipped.Arma)g.equipped.Arma=item;
  alertGame('FASE 10 · Arma rara inicial + '+reward.fmt()+' ouro!');
 }else alertGame('MARCO DE PROGRESSÃO · +'+reward.fmt()+' ouro!');
 feed('Recompensa única de aprendizado · fase '+stage+': '+reward.fmt()+' ouro'+(stage===10?' e arma rara':'')+'.');
}
// Romper o Véu deve iniciar um desafio real: o jogador pode retornar
// à fase 24.000 do mundo anterior para farmar se não conseguir avançar.
const WORLD_PRESTIGE_HP_SPIKE=100;
function enemyHealth(s=g.stage,d=g.difficulty,kind='normal'){
 // O HP mantém três atos de crescimento, agora alinhados à evolução de nível, equipamentos, pets e artefatos,
 // e o Mundo seguinte continua a partir do HP do último estágio anterior.
 let ln=1.18*Math.LN10 + enemyProgressLog(s)
     +1.5*Math.log(1+.05*Math.floor(s/250));
 for(let i=1;i<=d;i++){
  ln+=Math.log(WORLD_PRESTIGE_HP_SPIKE)+enemyProgressLog(24000)
      +1.5*Math.log(1+.05*Math.floor(24000/250));
 }
 const hp=Big.pow10(ln/Math.LN10);
 const starterBoss=d===0&&s<=55?8+7*Math.max(0,s-1)/54:22;
 return hp.mul(kind==='boss'?starterBoss:kind==='elite'?6:kind==='mimic'?2:kind==='beast'?1.8:1);
}
function enemyGold(s=g.stage,d=g.difficulty){
 // Base de 1 moeda no estágio 1, crescimento suavizado de 5,5%/fase,
 // com recompensa INTEIRA enquanto o valor ainda é pequeno; números científicos
 // são usados nas fases altas sem converter recursos gigantes em Number.
 const scaled=Big.power(GOLD_STAGE_GROWTH,Math.max(0,globalStage(s,d)-1));
 return d===0&&s<=160?B(Math.max(1,Math.floor(scaled.num()))):scaled;
}
function enemyXP(s=g.stage,d=g.difficulty){
 // Experiência introdutória moderadamente maior; volta à fórmula original
 // após a primeira jornada, sem bônus extra nas dificuldades II–V.
 const earlyBonus=g.difficulty!==0||s>120?1:s<=55
  ?1+.35*Math.min(1,Math.max(0,s-1)/54)
  :1+.35*Math.max(0,(120-s)/65);
 return B(3*earlyBonus).mul(Big.power(1.0834,Math.max(0,globalStage(s,d)-1)));
}
// Every next level costs more XP. A stage-based ceiling prevents lvl 30 on stage 1
// even in 100x mode; excess XP is not stockpiled for later stages.
function nextXP(l=g.knightLevel){return B(38).mul(Big.power(1.20,Math.max(0,l-1))).mul(Math.pow(1+l/50,1.20))}
function knightLevelCap(s=g.stage,d=g.difficulty){const global=globalStage(s,d);return Math.min(60000,Math.max(7,Math.floor(5+.85*global+2*Math.log1p(global))))}
function killsReq(s=g.stage){
 // TT2: corridas rápidas no início e prestígios subsequentes mais velozes.
 // Marcos 15/25/122/250 permanecem no caminho e não são ignorados.
 const early=Math.ceil(5+1.20*Math.sqrt(s)+1.4*Math.log2(1+s));
 const late=Math.ceil(8+.52*Math.sqrt(s)+2.0*Math.log2(1+s));
 const mix=Math.max(0,Math.min(1,(s-250)/1750));
 const normal=Math.round(early*(1-mix)+late*mix);
 const alreadyCleared=(g.highest?.[g.difficulty]||1)>s;
 return Math.max(4,Math.ceil(normal*(alreadyCleared?.55:1)));
}
function aliveTarget(){
 return Math.min(MAX_ALIVE_ENEMIES,Math.max(4,Math.round(hordeInterpolate(g.stage,HORDE_CAPS))));
}
function skillBonus(id,stat){let skill=D.skills.find(x=>x.id===id);if(!skill)return 0;return skill.nodes.reduce((v,n)=>v+(n.stat===stat?(g.talents[n.id]||0)*n.value:0),0)}

// R39 · Bosses approved by the art direction: behavior and rendering are
// deterministic gameplay mechanics, not a sequence of static screenshots.
// Telegraphs are time-based, capped, and stored outside the campaign save.
const bossNames=Object.freeze({carrasco:'O CARRASCO',profanador:'O PROFANADOR',arauto:'O ARAUTO DO ECLIPSE'});
const bossTones=Object.freeze({carrasco:'#fa4b4f',profanador:'#ad65fa',arauto:'#f7c774'});
function bossArchetype(event){
 if(event?.type==='stage')return ['carrasco','profanador','arauto'][(Math.floor(event.s/3)+event.d)%3];
 if(event?.type==='equipment')return 'carrasco';
 if(event?.type==='knowledge')return 'profanador';
 if(event?.type==='spectral')return 'arauto';
 if(event?.type==='threshold')return ['carrasco','profanador','arauto'][Math.max(0,Math.floor(((event.s||249)+1)/250)-1)%3];
 return 'carrasco';
}
function bossBlastFX(x,y,r,color){
 if(effects.length<150)effects.push({x,y,r,t:0,life:.52,color,kind:'magic'});
 if(!g.particles)return;
 for(let i=0;i<Math.min(16,Math.max(0,120-bossEmbers.length));i++){
  const a=(i/16)*Math.PI*2+Math.random()*.22;
  const speed=45+Math.random()*165;
  bossEmbers.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-.45*speed,age:0,life:.3+Math.random()*.50,color,radius:1.5+Math.random()*3});
 }
}
function bossMark(e,kind,x,y,radius,delay,color,angle=0){
 if(bossWarnings.length>=12)bossWarnings.shift();
 bossWarnings.push({bossId:e.id,kind,x,y,radius,time:0,delay,color,angle,phase:e.bossPhase||1});
}
// R84: hit geometry and the visible telegraph share exactly the same bounds.
// Sweep: directional lane from the executioner's feet. Ring: annulus with a
// deliberate safe zone both inside the inner circle and beyond the outer edge.
function bossWarningHits(w,x,y){
 const dx=x-w.x,dy=y-w.y,r=Math.max(0,w.radius||0);
 if(w.kind==='sweep'){
  const c=Math.cos(w.angle||0),s=Math.sin(w.angle||0);
  const forward=dx*c+dy*s,side=-dx*s+dy*c;
  return forward>=0&&forward<=r*1.65&&Math.abs(side)<=r*.45;
 }
 const dist=Math.hypot(dx,dy);
 if(w.kind==='ring')return dist>=r*.42&&dist<=r;
 return dist<=r;
}
function bossSummon(e){
 // Boss summons are combat obstacles only: no gold/EXP/stage kills from them.
 const owned=enemies.filter(x=>x.summonedByBoss===e.id).length;
 for(let i=owned;i<Math.min(3+(e.bossPhase||1),6);i++){
  if(enemies.length>=MAX_ALIVE_ENEMIES)break;
  const mob=spawnEnemy(false,'cultist');if(!mob)break;
  const a=2*Math.PI*i/6+heroAnim;
  mob.x=clamp(e.x+Math.cos(a)*110,45,1070);mob.y=clamp(e.y+Math.sin(a)*100,45,650);
  mob.summonedByBoss=e.id;mob.speed=40;
  bossBlastFX(mob.x,mob.y,24,'#9256d9');
 }
}
function updateBossAI(e,dt){
 if(!bossActive||bossActive!==e)return;
 const pct=clamp(e.hp.div(e.max).num(1),0,1);
 const newPhase=pct>.66?1:pct>.33?2:3;
 if(newPhase>e.bossPhase){e.bossPhase=newPhase;e.bossAttacking=.48;
  bossBlastFX(e.x,e.y,95,bossTones[e.archetype]);
  alertGame(bossNames[e.archetype]+' — FASE '+newPhase+'!');
 }
 e.bossAttacking=Math.max(0,(e.bossAttacking||0)-dt);
 e.bossCadence-=dt;
 if(e.bossCadence>0)return;
 const phase=e.bossPhase||1,accel=.24*(phase-1);
 e.bossCadence=Math.max(2.0,4.1-accel+(e.archetype==='carrasco'?.2:e.archetype==='profanador'?.8:1.1));
 e.bossAttacking=1.12;
 e.bossPatternIndex=(e.bossPatternIndex||0)+1;
 if(e.archetype==='carrasco'){
  // From phase II onward, alternate between a marked impact and a directional
  // execution sweep. Side-stepping the lane avoids it; no unavoidable area hit.
  const a=Math.atan2(player.y-e.y,player.x-e.x);
  if(phase>=2&&e.bossPatternIndex%2===0)
   bossMark(e,'sweep',e.x,e.y,120+phase*15,1.25,'#ed3b54',a);
  else bossMark(e,'cleave',player.x,player.y,105+phase*14,1.18,'#ed3b54',a);
 }else if(e.archetype==='profanador'){
  // Staggered opposing sigils at low health create a positioning challenge;
  // summons still grant no XP or gold and remain bounded by existing caps.
  bossMark(e,'sigil',player.x,player.y,82+phase*10,1.28,'#af70f9');
  if(phase>=2)bossMark(e,'sigil',clamp(player.x+125,30,1090),clamp(player.y-65,40,650),78,1.55,'#8750d7');
  if(phase>=3)bossMark(e,'sigil',clamp(player.x-125,30,1090),clamp(player.y+65,40,650),78,1.82,'#c78eff');
  bossSummon(e);
 }else{
  bossMark(e,'eclipse',player.x,player.y,90+phase*15,1.38,phase>=3?'#fa6a76':'#f7c875');
  if(phase>=3&&e.bossPatternIndex%2===0)
   bossMark(e,'ring',e.x,e.y,195,1.62,'#a76afa');
  else if(phase>=2)bossMark(e,'eclipse',e.x,e.y,92,1.62,'#a76afa');
  // The existing 1.8s damage-vulnerability window is preserved after impact.
  e.vulnerableTimer=0;
 }
}
function bossDamageToKnight(boss,mult=1){
 if(player.contactInvuln>0)return 0;
 // R78: no proportional-HP cap on telegraphed boss attacks.
 // Defense and reduction are still applied once, below.
 const raw=enemyContactDamage(boss)*Math.max(0,mult);
 const taken=raw*(1-effectiveDamageReduction());
 player.hp=Math.max(0,player.hp-taken);player.contactInvuln=.48;player.hitFlash=.42;
 g.damageTaken=(g.damageTaken||0)+taken;
 if(floating.length<60)floating.push({x:player.x,y:player.y-65,txt:'-'+fmt(taken)+' PV',color:'#ff728b',life:1,big:true});
 return taken;
}
function updateBossWarnings(dt){
 for(let i=bossWarnings.length-1;i>=0;i--){
  const w=bossWarnings[i];w.time+=dt;
  if(w.time<w.delay)continue;
  bossWarnings.splice(i,1);
  const boss=enemies.find(e=>e.id===w.bossId&&e.kind==='boss');
  if(!boss)continue;
  if(bossWarningHits(w,player.x,player.y))
   bossDamageToKnight(boss,w.kind==='cleave'?.88:w.kind==='sweep'?1:w.kind==='sigil'?.55:w.kind==='ring'?.70:.72);
  if(w.kind==='eclipse'||w.kind==='ring')boss.vulnerableTimer=1.8;
  if(w.kind==='cleave'){
   boss.x=clamp(w.x+Math.cos(w.angle+Math.PI)*35,45,1080);
   boss.y=clamp(w.y+Math.sin(w.angle+Math.PI)*35,45,650);
  }
  bossBlastFX(w.x,w.y,w.radius,w.color);
 }
 for(let i=bossEmbers.length-1;i>=0;i--){let s=bossEmbers[i];s.age+=dt;if(s.age>=s.life){bossEmbers.splice(i,1);continue}s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=140*dt;}
 if(bossActive?.archetype==='arauto')bossActive.vulnerableTimer=Math.max(0,(bossActive.vulnerableTimer||0)-dt);
}
function drawBossWarnings(){
 for(const w of bossWarnings){
  const t=clamp(w.time/w.delay,0,1),r=w.radius;
  ctx.save();ctx.translate(w.x,w.y);
  ctx.fillStyle=w.color;ctx.strokeStyle=w.color;
  ctx.shadowColor=w.color;ctx.shadowBlur=8+16*t;
  if(w.kind==='sweep'){
   ctx.rotate(w.angle||0);
   const length=r*1.65,halfWidth=r*.45;
   ctx.globalAlpha=.2+.35*t;ctx.fillRect(0,-halfWidth,length,halfWidth*2);
   ctx.globalAlpha=.62+.32*t;ctx.lineWidth=2.5+1.5*t;
   ctx.strokeRect(0,-halfWidth,length,halfWidth*2);
   ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(length*t,-halfWidth);ctx.lineTo(length*t,halfWidth);ctx.stroke();
  }else if(w.kind==='ring'){
   // Winding in opposite directions leaves the inner safe circle transparent.
   ctx.globalAlpha=.2+.35*t;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2,false);ctx.arc(0,0,r*.42,0,Math.PI*2,true);ctx.fill('evenodd');
   ctx.globalAlpha=.62+.32*t;ctx.lineWidth=2.5+1.5*t;
   ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.arc(0,0,r*.42,0,Math.PI*2);ctx.stroke();
   ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r*(.42+.58*t),0,Math.PI*2);ctx.stroke();
  }else{
   // R83 used a visually elliptical telegraph but a circular hitbox. The
   // corrected circular outline now matches its *unchanged* collision radius.
   ctx.globalAlpha=.2+.35*t;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
   ctx.globalAlpha=.62+.32*t;ctx.lineWidth=2.5+1.5*t;
   ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
   ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,r*(1-t*.86),0,Math.PI*2);ctx.stroke();
   const n=w.kind==='cleave'?4:w.kind==='sigil'?6:8;
   for(let j=0;j<n;j++){const a=j*2*Math.PI/n+heroAnim*.35;
    const rx=Math.cos(a)*r*.68,ry=Math.sin(a)*r*.68;
    ctx.beginPath();ctx.moveTo(rx-8,ry-3);ctx.lineTo(rx+8,ry+3);ctx.stroke();}
  }
  ctx.restore();
 }
}
function drawBossEmbers(){
 if(!g.particles)return;
 for(const s of bossEmbers){ctx.save();ctx.globalAlpha=Math.max(0,1-s.age/s.life);ctx.fillStyle=s.color;ctx.shadowColor=s.color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);ctx.fill();ctx.restore();}
}
function drawAnimatedBoss(e){
 const pulse=heroAnim*2.5+e.phase,attack=e.bossAttacking||0;
 const base=e.archetype==='carrasco'?178:e.archetype==='profanador'?170:183;
 const scale=1+Math.sin(pulse)*.025+attack*.045;
 const size=base*scale;
 const color=bossTones[e.archetype]||'#dca476';
 ctx.save();
 ctx.fillStyle='#05040c99';ctx.beginPath();ctx.ellipse(e.x,e.y+23,size*.26,size*.10,0,0,2*Math.PI);ctx.fill();
 circleGlow(e.x,e.y+6,size*.52,color,.13+.04*Math.sin(pulse));
 // Squash/stretch and bobbing on idle; sharp, bounded recoil during attacks.
 ctx.translate(e.x,e.y+Math.sin(pulse)*3-attack*7);
 ctx.rotate(Math.sin(pulse*.52)*.027+attack*.085);
 if(sprites['boss_'+e.archetype]?.complete && sprites['boss_'+e.archetype]?.naturalWidth){
  const im=sprites['boss_'+e.archetype];ctx.globalAlpha=clamp(1-e.hit*.55,.65,1);
  ctx.drawImage(im,-size*.52,-size*.91,size*1.04,size*1.06);
 }else{drawImg('boss0',0,0,size,size);}
 ctx.restore();
 if(e.archetype==='arauto'&&e.vulnerableTimer>0){ctx.save();ctx.strokeStyle='#f5d9a1';ctx.shadowColor='#ffdb77';ctx.shadowBlur=18;ctx.lineWidth=3;ctx.globalAlpha=.68;ctx.beginPath();ctx.ellipse(e.x,e.y+10,68,33,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
}
function switchBossPreview(index=0){
 if(!bossPreviewMode)return false;
 bossPreviewIndex=((Math.trunc(index)%3)+3)%3;
 enemies=[];queue=[];bossActive=null;bossWarnings.length=0;bossEmbers.length=0;effects=[];floating=[];clearSkillReactions();
 player.x=420;player.y=345;player.contactInvuln=1e8;player.hp=maxHealth();
 const event={s:g.stage,d:g.difficulty,type:'threshold'};
 const boss=spawnEnemy(false,'boss',event);
 if(!boss)return false;
 boss.archetype=['carrasco','profanador','arauto'][bossPreviewIndex];
 boss.x=830;boss.y=350;boss.speed=36;boss.bossCadence=.75;boss.bossPhase=1;
 for(let j=0;j<Math.min(7,aliveTarget());j++)spawnEnemy(true,j%2?'skeleton':'cultist');
 alertGame('DEMONSTRAÇÃO · '+bossNames[boss.archetype]+' · ataque telegrafado, fases e partículas (sem salvar).');
 updateHeader();return true;
}
function startBossPreview(index=0){
 if(bossPreviewMode){switchBossPreview(index);return;}
 if(testMode){alertGame('Saia do laboratório atual antes de iniciar a prévia de chefes.');return;}
 startEndgameTrial('i23999');if(!endgameTrial)return;
 bossPreviewMode=true;
 g.stage=249;g.stageHold=true;g.stageKills=0;g.speed=1;g.particles=true;
 switchBossPreview(index);selectTab('knight');updateHeader();
}

function spawnEnemy(initial=false,kind=null,event=null){if(enemies.length>=MAX_ALIVE_ENEMIES)return;let side=Math.floor(Math.random()*4),x=side===0?-35:side===1?1155:Math.random()*1120,y=side===2?-35:side===3?730:Math.random()*690;if(initial){x=clamp(560+Math.cos(Math.random()*Math.PI*2)*Math.random()*420,35,1080);y=clamp(345+Math.sin(Math.random()*Math.PI*2)*Math.random()*280,40,650)}
 // Monster movement and hitboxes are unchanged. In the tutorial region they enter
 // the playable area close enough to fight, instead of travelling from offscreen.
 if(!initial&&!event&&g.difficulty===0&&g.stage<=55){
  const angle=Math.random()*Math.PI*2,radius=145+Math.random()*105;
  x=clamp(player.x+Math.cos(angle)*radius,35,1085);
  y=clamp(player.y+Math.sin(angle)*radius,40,650);
 }
 let roll=Math.random();if(!kind){const mimicChance=.013*mod('mimic_chance');kind=roll<mimicChance?'mimic':roll<.09?'elite':roll<.25?'beast':roll<.38?'wraith':roll<.62?'skeleton':'cultist';}let boss=kind==='boss';if(boss&&event){x=850;y=320}
 let hp=event?.type==='threshold'
  ?enemyHealth(event.s,event.d,'normal').mul(thresholdMultiplier(event.s))
  :event?.type==='stage' ? enemyHealth(event.s,event.d,'normal').mul(6+10*Math.min(1,event.s/250))
  :enemyHealth(event?event.s:g.stage,event?event.d:g.difficulty,kind);
 const enemy={id:enemyId++,kind,bossType:event?event.type:null,archetype:boss?bossArchetype(event):null,bossPhase:1,bossCadence:boss?1.4:0,bossPatternIndex:0,bossMotion:0,bossAttacking:0,bossAge:0,stage:event?event.s:g.stage,diff:event?event.d:g.difficulty,x,y,hp,max:hp,spawnHealth:hp.save(),phase:Math.random()*6,hit:0,marked:false,curse:false,curseTimer:0,slow:0,attackCooldown:.25+Math.random()*.35,speed:boss?35:kind==='elite'?62:kind==='beast'?72:48+Math.random()*16};enemies.push(enemy);if(boss){bossActive=enemy;alertGame(bossNames[enemy.archetype]+' · '+(event?.type==='threshold'?'GUARDIÃO DE LIMIAR':event?.type==='stage'?'GUARDIÃO DA FASE':'CHEFE DO MARCO')+'! Observe os ataques sinalizados no chão.')}return enemy}
function stageGearKey(stage,diff){return `${diff}:${stage}`;}
function stageGearAvailable(stage=g.stage,diff=g.difficulty){
 // Historical record is "highest reached", so all stages BELOW it were beaten.
 // Drops at the current frontier are still subject to one claim per source.
 return Number(stage)>=1 && Number(stage)===Number(g.stage) && Number(diff)===Number(g.difficulty) && Number(stage)>=(Number(g.highest?.[diff])||1) && (!testMode||(endgameTrial&&trialScenario==='real'));
}
function stageBossPending(stage=g.stage,diff=g.difficulty){
 if(endgameTrial&&trialScenario==='v24000')return false; // horde-only QA
 return queue.some(ev=>ev.type==='stage'&&ev.s===stage&&ev.d===diff)
  ||Boolean(bossActive&&bossActive.bossType==='stage'&&bossActive.stage===stage&&bossActive.diff===diff);
}
function queueStageBoss(stage=g.stage){
 if(g.stageHold||(endgameTrial&&trialScenario==='v24000')||stageBossPending(stage,g.difficulty))return false;
 if(g.difficulty<4&&stage>=WORLD_STAGES&&g.worldCapCleared[g.difficulty])return false;
 if(thresholdBlocked(stage,g.difficulty))return false;
 if(g.stageKills<killsReq(stage))return false;
 // Keep existing one-time milestone guardians ahead of the gate.
 queue.push({s:stage,d:g.difficulty,type:'stage'});
 feed('GUARDIÃO DA FASE '+stage+' convocado. Derrote-o para avançar.');
 return true;
}
function completeStageBoss(stage,diff){
 if(stage!==g.stage||diff!==g.difficulty||g.stageHold)return false;
 if(thresholdBlocked(stage,diff))return false;
 if(stage>=WORLD_STAGES&&diff<4){
  g.worldCapCleared[diff]=true;g.stageKills=0;
  alertGame('MUNDO '+DIFF[diff]+' CONCLUÍDO · PRESTÍGIO DE MUNDO LIBERADO!');
  save(g.slot,true);return true;
 }
 // This is the ONLY normal-path function that increases the stage.
 g.stage++;g.stageKills=0;
 grantFirstRunMilestone(g.stage);awardSpectralPets(g.stage,g.difficulty);
 g.runPeak=Math.max(g.runPeak,g.stage);
 g.highest[diff]=Math.max(Number(g.highest[diff])||1,g.stage);
 scheduleBosses(g.stage,true);
 if(g.stage%25===0)feed('Mundo '+fmt(g.stage)+' · A ruína se aprofunda.');
 uiDirty=true;save(g.slot,true);
 return true;
}
function scheduleBosses(stage,unclaimedOnly=false){
 // R36 simulation is an endless horde stress test, not a milestone-boss test.
 if(endgameTrial&&trialScenario==='v24000')return;
 if(thresholdBlocked(stage,g.difficulty)){
  const event={s:stage,d:g.difficulty,type:'threshold'};
  const queued=queue.some(x=>x.s===stage&&x.d===g.difficulty&&x.type==='threshold');
  const fighting=bossActive&&bossActive.stage===stage&&bossActive.diff===g.difficulty&&bossActive.bossType==='threshold';
  if(!queued&&!fighting)queue.unshift(event);
 }
 for(let i=0;i<3;i++){
  const type=['equipment','knowledge','spectral'][i],n=[15,25,122][i];
  if(stage%n!==0)continue;
  const key=`${g.difficulty}:${stage}:${type}`;
  if(unclaimedOnly&&g.firstClear.includes(key))continue;
  if(type==='equipment'&&!stageGearAvailable(stage,g.difficulty))continue;
  if(queue.some(x=>x.s===stage&&x.d===g.difficulty&&x.type===type))continue;
  if(bossActive&&bossActive.stage===stage&&bossActive.diff===g.difficulty&&bossActive.bossType===type)continue;
  queue.push({s:stage,d:g.difficulty,type});
 }
}
// R47: a recompensa de 4 pets pertence ao MARCO alcançado e não pode
// desaparecer se um boss opcional ficar na fila, for pulado ou o jogador morrer.
// A chave original :spectral significa que os 4 pets já foram concedidos.
function spectralPetsClaimed(stage,difficulty){
 return g.firstClear.includes(`${difficulty}:${stage}:spectralPets`)||g.firstClear.includes(`${difficulty}:${stage}:spectral`);
}
function awardSpectralPets(stage,difficulty,retroactive=false){
 if(!Number.isInteger(stage)||stage<122||stage%122!==0||spectralPetsClaimed(stage,difficulty))return false;
 g.firstClear.push(`${difficulty}:${stage}:spectralPets`);
 const pets=Array.from({length:4},()=>givePet(false));
 feed((retroactive?'Recompensa recuperada':'Marco alcançado')+` · fase ${stage}: +4 pets (${pets.map(p=>p.name).join(', ')})`);
 if(!retroactive)alertGame(`MARCO ${stage} · +4 PETS GARANTIDOS!`);
 return true;
}
function reconcileSpectralPetMilestones(){
 // Repara automaticamente campanhas da R46 que avançaram pelos múltiplos
 // de 122 sem conseguir derrotar o Arauto e sem receber seus pets.
 let recovered=0;
 for(let difficulty=0;difficulty<Math.min(5,g.highest.length);difficulty++){
  const high=Math.min(24000,Math.floor(Number(g.highest[difficulty])||0));
  for(let stage=122;stage<=high;stage+=122){
   if(awardSpectralPets(stage,difficulty,true))recovered+=4;
  }
 }
 if(recovered){alertGame(`Recompensas anteriores restauradas: +${recovered} pets.`);uiDirty=true;}
 return recovered;
}
function progressWorld(){
 if(g.stageHold)return;
 if(endgameTrial&&trialScenario==='v24000'){
  // Preserve R69's horde-only laboratory: this explicitly does not simulate bosses.
  if(g.stageKills>=killsReq()){
   g.stageKills=0;g.stage++;g.runPeak=Math.max(g.runPeak,g.stage);
   g.highest[g.difficulty]=Math.max(g.highest[g.difficulty]||0,g.stage);
  }
  return;
 }
 if(g.stageKills>=killsReq()){
  g.stageKills=killsReq();
  if(thresholdBlocked()){scheduleBosses(g.stage,true);return;}
  // The stage stays locked even after hundreds of kills. Only its boss advances it.
  queueStageBoss(g.stage);
 }
}

function rollPet(){return D.pets[Math.floor(Math.random()*D.pets.length)]}
function givePet(notify=true){let pet=rollPet();g.petLevels[pet.id]=(g.petLevels[pet.id]||0)+1;g.petSelected=normalizePetSelection(g.petSelected);if(notify)alertGame('Pet: '+pet.name+' · Nível '+g.petLevels[pet.id]);return pet}
function giveScroll(notify=true){let floor=scrollSet();let pool=Math.random()<.34?D.scrolls.filter(x=>(g.scrollLevels[x.id]||0)<=floor):D.scrolls;let x=pool[Math.floor(Math.random()*pool.length)];g.scrollLevels[x.id]=(g.scrollLevels[x.id]||0)+1;if(notify)alertGame('Pergaminho: '+x.name+' · Nível '+g.scrollLevels[x.id]);return x}
// A Grau agora é uma faixa de potência real, não apenas um selo visual.
// As faixas NÃO se sobrepõem: nenhum item de Grau menor supera em potência
// bruta o atributo principal do mesmo tipo de um item de Grau superior.
function itemGradeFromDifficulty(d){return Math.max(1,Math.min(5,Math.trunc(Number(d)||0)+1))}
function gearGradeLabel(item){return '✧ GRAU '+itemGradeFromDifficulty(item?.difficulty)+' · MUNDO '+['I','II','III','IV','V'][itemGradeFromDifficulty(item?.difficulty)-1]}
function gearValueAt(stage,difficulty,rarity){
 // Cada Grau ocupa uma faixa própria: fator interno máximo 12*3.15 = 37.8.
 // O menor item do Grau seguinte começa com fator 48, inclusive Nv 1 vs 24.000.
 const grade=Math.max(0,Math.min(4,Math.trunc(Number(difficulty)||0)));
 const stageFactor=1+14*Math.log1p(Math.max(0,Math.min(24000,Number(stage)||1)-1))/Math.log(24000);
 const rarityFactor=1+Math.max(0,Math.min(5,Number(rarity)||0))*.43;
 return .065*Math.pow(48,grade)*stageFactor*rarityFactor;
}
function migrateLegacySealAffixR88(item){
 if(item?.slot!=='Aura'||!Array.isArray(item.affixes))return;
 for(const af of item.affixes)if(af?.effect==='gear'&&af.name==='dos Selos')af.effect='defense';
}
function calibrateGearInventory(){
 // Old version had gear power ~1.05^stage: re-evaluate old items on load
 // instead of leaving absurdly powerful legacy weapons in saved games.
 for(const item of [...(g.inventory||[]),...Object.values(g.equipped||{})])if(item&&Number.isFinite(item.rarity)&&Number.isFinite(item.level)){
   // Existing items inherit only the world difficulty already recorded on the item;
   // changing current difficulty never upgrades equipment in the inventory.
   item.difficulty=Math.max(0,Math.min(4,Math.trunc(Number(item.difficulty)||0)));
   item.grade=itemGradeFromDifficulty(item.difficulty);
   migrateGearR71Item(item);
   migrateLegacySealAffixR88(item); // Afixo legado inerte, sem mudar o valor do roll.
   if(item.slot==='Aura'){migrateAuraItem(item);item.value=qualityGearValueAt(item.level,item.difficulty,item.rarity,item.quality,item.slot);}
   else item.value=qualityGearValueAt(item.level,item.difficulty,item.rarity,item.quality,item.slot);
 }
}
function saleValue(item){return GEAR_SALE_PRICES[Math.max(0,Math.min(5,Number(item?.rarity)||0))]}
function sellGearItem(item,auto=false){
 if(!item||item.favorite===true||Object.values(g.equipped).some(x=>x?.id===item.id))return 0;
 const gained=saleValue(item); // No gold multipliers: equipment always sells for a fixed banknote value.
 g.village.banknotes=Math.round((Number(g.village.banknotes)||0)*100+gained*100)/100;
 g.inventory=g.inventory.filter(x=>x.id!==item.id);
 if(auto){g.autoSellCount=(g.autoSellCount||0)+1;g.autoSellEarnings=Number(g.autoSellEarnings||0)+gained;
  if(item.rarity>=3)feed('Venda automática: '+item.name+' · +'+gained+' cédulas');
 }else alertGame('Vendido: '+item.name+' · +'+gained+' cédulas');
 uiDirty=true;return gained;
}
// Venda segura: APENAS inventário, nunca itens equipados ou protegidos por favorito.
function sellAllUnprotectedGear(){
 const equippedIds=new Set(Object.values(g.equipped||{}).filter(Boolean).map(x=>String(x.id)));
 const targets=(g.inventory||[]).filter(x=>x&&!x.favorite&&!equippedIds.has(String(x.id)));
 const targetIds=new Set(targets.map(x=>String(x.id)));
 const cents=targets.reduce((sum,x)=>sum+Math.round(saleValue(x)*100),0);
 g.inventory=g.inventory.filter(x=>!x||!targetIds.has(String(x.id)));
 g.village.banknotes=Math.round((Number(g.village.banknotes)||0)*100+cents)/100;
 if(targets.length){feed(`Venda em massa: ${targets.length} itens · +${(cents/100).toLocaleString('pt-BR')} cédulas`);uiDirty=true;}
 return {count:targets.length,amount:cents/100};
}
function handleNewGear(item){
 // Set collection uses the first acquisition, even if auto-sold immediately.
 if((g.autoSellRarities||[]).includes(item.rarity))sellGearItem(item,true);
 return item;
}
function tryMonsterGearDrop(enemy,rng=Math.random){
 const key=stageGearKey(enemy.stage,enemy.diff);
 if(!stageGearAvailable(enemy.stage,enemy.diff)||g.gearMonsterClaims[key])return null;
 const chance=monsterDropChance(enemy.kind);
 if(chance<=0||rng()>=chance)return null;
 g.gearMonsterClaims[key]=1; // One monster drop per stage, ever.
 const rarity=rollMonsterRarity(rng);
 const item=giveGear(enemy.stage,enemy.diff,null,null,rarity);
 if(!(g.autoSellRarities||[]).includes(rarity))feed('Equipamento '+RARITY[rarity]+': '+item.name);
 return item;
}
function tryEquipmentBossDrop(enemy,rng=Math.random){
 const key=stageGearKey(enemy.stage,enemy.diff);
 if(!stageGearAvailable(enemy.stage,enemy.diff)||g.gearBossClaims[key])return null;
 g.gearBossClaims[key]=1; // Even a failed roll consumes the reward opportunity.
 const rarity=rollBossGearRarity(enemy.diff,g.worldPrestiges,rng);
 if(rarity===null)return null;
 const item=giveGear(enemy.stage,enemy.diff,null,null,rarity);
 if(!(g.autoSellRarities||[]).includes(rarity))alertGame('Guardião: '+RARITY[rarity]+' · '+item.name);
 return item;
}
// R92: a Unique drop has its own primary effect, one account-scaling special
// secondary and two random secondary affixes. Discovery grants a permanent
// collection bonus once. A forged item can never be Unique.
function uniqueSignatureEffect(def){
 const effect=def?.signature_effect||def?.effect||'damage';
 return def?.slot==='Capacete'?(OLD_HELMET_EFFECTS[effect]||effect):effect;
}
function uniqueDefinitionForItem(item){
 if(item?.rarity!==5)return null;
 // Historical items from R89 and earlier have no uniqueId: do not retrofit power.
 const def=D.uniques.find(u=>u.id===item.uniqueId);
 return def&&def.slot===item.slot?def:null;
}
function giveGear(s=g.stage,d=g.difficulty,setId=null,chosenSlot=null,forcedRarity=null){
 let slot=chosenSlot||SLOTS[Math.floor(Math.random()*5)];
 let rarity=forcedRarity===null?rollGearRarity(d,g.worldPrestiges,setId===null):forcedRarity;
 // TT2: a Unique is a boss drop, never a crafted set piece.
 if(setId&&rarity===5)rarity=4;
 const uniquePool=rarity===5?D.uniques.filter(u=>!chosenSlot||u.slot===slot):[];
 const unique=uniquePool.length?uniquePool[Math.floor(Math.random()*uniquePool.length)]:null;
 if(unique&&!chosenSlot)slot=unique.slot;
 const affixPool=D.affixes.filter(a=>a.slot===slot&&a.min_rarity<=rarity);
 const affixes=[];const n=[0,1,1,2,3,3][rarity];
 for(let i=0;i<n&&affixPool.length;i++){
  const index=Math.floor(Math.random()*affixPool.length),a=affixPool.splice(index,1)[0];
  const aff={name:a.name,effect:a.effect,value:a.min_roll+(a.max_roll-a.min_roll)*Math.random()};
  if(i===0&&unique){
   // Same roll and same slot in the 3-affix budget, but its effect is fixed.
   aff.name='Assinatura · '+unique.name;
   aff.effect=uniqueSignatureEffect(unique);
   aff.uniqueSignature=unique.id;
  }
  affixes.push(aff);
 }

 let set=rarity===5?null:(setId?D.sets.find(x=>x.id===setId):rarity>=3&&Math.random()<.26?D.sets[Math.floor(Math.random()*16)]:null);
 // Power scales with world level and rarity, without the previous 1.05^stage explosion.
 let quality=rollGearQuality();
 let power=qualityGearValueAt(s,d,rarity,quality,slot);
 let effect=slot==='Arma'?['physical','faith','crit_damage','damage'][Math.floor(Math.random()*4)]:slot==='Capacete'?Object.values(HERO_HELMET_EFFECTS)[Math.floor(Math.random()*3)]:slot==='Peitoral'?['gold','gold_monsters','gold_boss','gold_mimic','gold_fairy'][Math.floor(Math.random()*5)]:slot==='Aura'?AURA_EFFECTS[Math.floor(Math.random()*AURA_EFFECTS.length)]:DAMAGE_SKILLS[Math.floor(Math.random()*DAMAGE_SKILLS.length)];
 if(slot==='Capacete')for(const a of affixes)if(OLD_HELMET_EFFECTS[a.effect])a.effect=OLD_HELMET_EFFECTS[a.effect];
 // R89: nomes coerentes com a categoria; sem mudar rolagens, atributos ou raridade.
 const rareSlotNames={'Arma':'Lâmina do Crepúsculo','Capacete':'Elmo do Crepúsculo','Peitoral':'Couraça do Crepúsculo','Aura':'Aura do Crepúsculo','Anel':'Anel do Crepúsculo'};
 let name=unique?unique.name:(set?set.name+' · '+slot:rarity>=3?rareSlotNames[slot]:slot+' '+['das Cinzas','do Véu','Profanado','da Penitência'][Math.floor(Math.random()*4)]);
 if(unique)effect=UNIQUE_PRIMARY[unique.id].effect;
 let item={id:g.gearNextId++,name,slot,rarity,level:s,difficulty:d,grade:itemGradeFromDifficulty(d),quality,qualityVersion:1,effect,value:power,affixes,setId:set?.id||null,auraVersion:slot==='Aura'?1:undefined};
 const firstUniqueDiscovery=!!unique&&!(g.uniqueDiscovered||[]).includes(unique.id);
 if(unique){item.uniqueId=unique.id;item.uniqueVersion=2;g.uniqueDiscovered=Array.from(new Set([...(g.uniqueDiscovered||[]),unique.id]));}
 g.inventory.unshift(item);
 // Se o jogador habilitou esta exceção, marque antes da limpeza por lotação.
 if((g.autoSellRarities||[]).includes(rarity)&&gearShouldProtectFromAutoSale(item)){
  item.favorite=true;feed('POSSÍVEL MELHORIA PROTEGIDA: '+item.name);
 }
 if(g.inventory.length>240){
 // Prevent silently losing valuable gear: overflow sells the oldest UNEQUIPPED entry.
 for(let ix=g.inventory.length-1;ix>=0&&g.inventory.length>240;ix--){
  const old=g.inventory[ix];if(!Object.values(g.equipped).some(eq=>eq?.id===old.id))sellGearItem(old,true);
 }
 }
 if(set){g.setParts[set.id]=g.setParts[set.id]||[];if(!g.setParts[set.id].includes(slot)){g.setParts[set.id].push(slot);if(setCompleted(set))alertGame('CONJUNTO COMPLETO: '+set.name+' · 2 bônus permanentes ativos!')}}
 if(firstUniqueDiscovery){const passive=UNIQUE_COLLECTION_BONUSES[unique.id];alertGame('ÚNICO DESCOBERTO: '+unique.name+' · bônus permanente +'+compactPercent(passive.bonus)+' '+effectLabel(passive.effect));}
 uiDirty=true;return handleNewGear(item)}
function finishBoss(e){bossWarnings=bossWarnings.filter(w=>w.bossId!==e.id);if(e.archetype)bossBlastFX(e.x,e.y,130,bossTones[e.archetype]);
 if(e.bossType==='stage'){completeStageBoss(e.stage,e.diff);return;}
 if(e.bossType==='threshold'){
  const key=thresholdKey(e.stage,e.diff);
  if(!thresholdCleared(e.stage,e.diff)){
   g.firstClear.push(key);
   feed(`LIMIAR ROMPIDO! Guardião ${e.stage} derrotado · marco ${e.stage+1} liberado permanentemente.`);
   alertGame('MARCO '+fmt(e.stage+1)+' DESBLOQUEADO!');
   if(g.stage===e.stage&&g.difficulty===e.diff&&!g.stageHold)progressWorld();
   save(g.slot,true);
  }
  return;
 }
 const id=`${e.diff}:${e.stage}:${e.bossType}`;
 // One boss-gear ROLL per new stage/difficulty, even if the roll fails.
 if(e.bossType==='equipment'){
  if(!g.firstClear.includes(id))g.firstClear.push(id);
  const item=tryEquipmentBossDrop(e);
  feed(item?'Recompensa única do guardião registrada.':'Guardião derrotado · tentativa única concluída.');
  save(g.slot,true);return;
 }
 // Knowledge + spectral bosses retain their one-time rewards per stage and difficulty.
 if(g.firstClear.includes(id))return;
 g.firstClear.push(id);
 if(e.bossType==='knowledge'){g.talentPoints++;alertGame('Conhecimento conquistado! +1 ponto permanente')}
 if(e.bossType==='spectral'){
  // Em saves antigos o boss pode ser derrotado antes da correção do marco.
  const newPets=awardSpectralPets(e.stage,e.diff);
  const scroll=giveScroll(false);
  alertGame('Arauto Espectral: +1 pergaminho'+(newPets?' e +4 pets do marco!':'!'));
  feed('Arauto Espectral · Pergaminho: '+scroll.name);
 }
 save(g.slot,true);
}
function killEnemy(e){if(e.summonedByBoss){enemies=enemies.filter(x=>x!==e);effects.push({x:e.x,y:e.y,r:26,t:0,life:.38,color:'#a867ed',kind:'death'});return;}if(e.lastHitSkill&&skillBonus(e.lastHitSkill,'kill_mana')>0)player.mp=Math.min(100*mod('mana'),player.mp+Math.min(18,skillBonus(e.lastHitSkill,'kill_mana')*.14));let ix=enemies.indexOf(e);if(ix===-1)return;
 enemies.splice(ix,1);r67OnKill(e);g.kills++;trialTelemetryOnKill(e);g.runKills=(g.runKills||0)+1;let bounty=enemyGold(e.stage,e.diff);if(e.kind==='mimic')bounty=bounty.mul(GOLD_SOURCE_BASE.mimic);else if(e.kind==='boss')bounty=bounty.mul(GOLD_SOURCE_BASE.boss);else if(e.kind==='elite')bounty=bounty.mul(2);
 let gained=grantGold(bounty,e.kind==='mimic'?'mimic':e.kind==='boss'?'boss':'monsters');
 // R75: Chesterson is the Mimic itself, not a separate lottery after each normal kill.
 // Legacy g.chestersonFinds is retained for old saves, but is never increased.
 if(e.kind==='mimic')g.mimicFinds=(g.mimicFinds||0)+1;
 xp=xp.add(enemyXP(e.stage,e.diff).mul(e.kind==='boss'?45:e.kind==='elite'?4:1).mul(experienceEfficiency()));if(e.kind==='boss'){finishBoss(e);bossActive=null;enemies=enemies.filter(x=>x.summonedByBoss!==e.id);sound('relic')}else{tryMonsterGearDrop(e);if(e.kind==='mimic')alertGame('Tesouro! +'+gained.fmt()+' ouro')}
 if(e.kind!=='boss'&&!g.stageHold&&e.stage===g.stage){g.stageKills++;progressWorld()}
 if(g.worldPrestiges>0){const rank=Math.max(1,g.worldPrestiges),research=researchLevel('soul_harvest');const soulChance=Math.min(.4,(e.kind==='boss'?.18:.004)*(1+.2*(rank-1))*(1+.12*research));const runeChance=Math.min(.22,(e.kind==='boss'?.08:.0018)*(1+.15*(rank-1)));if(Math.random()<soulChance)g.souls+=e.kind==='boss'?2:1;if(Math.random()<runeChance)g.runes++;}
 floating.push({x:e.x,y:e.y-30,txt:'+'+gained.fmt(),color:'#ead085',life:1.2});effects.push({x:e.x,y:e.y,r:25,t:0,life:.42,color:'#eeb17f',kind:'death'});
 for(let i=0;i<15;i++){if(g.knightLevel>=knightLevelCap()||xp.cmp(nextXP())<0)break;const prevMaxHp=maxHealth();xp=xp.sub(nextXP());g.knightLevel=Math.min(60000,g.knightLevel+1);player.hp=Math.min(maxHealth(),player.hp+Math.max(0,maxHealth()-prevMaxHp)+18);player.mp=Math.min(100*mod('mana'),player.mp+20);if(D.skills.some(s=>s.unlock===g.knightLevel))alertGame('Nova habilidade desbloqueada!');if(g.knightLevel%20===0)feed('O cavaleiro alcançou o nível '+g.knightLevel)}
 if(g.knightLevel>=knightLevelCap()&&xp.cmp(nextXP())>=0)xp=nextXP().mul(.99);
 if(floating.length>70)floating.splice(0,30);uiDirty=true}
function hurt(e,amount,critical=false,color='#f9e3c3',canSpread=true,sourceSkill=null){if(!e||!enemies.includes(e))return;amount=B(amount);if(e.kind==='boss'&&e.archetype==='arauto'&&e.vulnerableTimer>0)amount=amount.mul(1.4);if(sourceSkill&&e.kind==='boss')amount=amount.mul(1+skillBonus(sourceSkill,'boss_bane'));amount=amount.mul(mod(e.kind==='boss'?'boss_damage':'normal_damage'));if(critical)amount=amount.mul(mod('crit_damage'));if(sourceSkill==='curse'&&(e.veilExposure||0)>0)amount=amount.mul(1.32+Math.min(.26,skillBonus('holy_spear','holy_radius')*.10));e.lastHitSkill=sourceSkill||null; // Apenas o golpe final conta para a morte
 // Guardião de Limiar em cenário de QA: no máximo 2,5% de PV por acerto,
 // permitindo observar mecânicas e transições mesmo com buffs experimentais extremos.
 // Não se aplica à campanha normal NEM ao teste com save real (R80).
 if(endgameTrial&&trialScenario!=='real'&&e.kind==='boss'&&e.bossType==='threshold'){const cap=e.max.mul(.025);if(amount.cmp(cap)>0)amount=cap;}
 // An enemy keeps the exact HP/difficulty it received upon spawning: stage changes never rescale it.
 // Stragglers of PREVIOUS stages (not milestone bosses) get a bounded cleanup floor.
 // This prevents seemingly immortal old mobs due to scientific-number precision gaps,
 // without weakening fresh enemies and preserving the progression wall of a new stage.
 if(e.kind!=='boss' && e.diff===g.difficulty && e.stage<g.stage){
   const cleanup=e.max.mul(.025);if(amount.cmp(cleanup)<0)amount=cleanup;
 }
 // Dano efetivo = mínimo entre a potência do golpe e os PV que restavam.
 // Impede roubo de vida infinito em alvos com 1 PV e preserva golpes
 // críticos, feitiços, dano periódico e ataques em área no mesmo funil.
 const dealt=amount.cmp(e.hp)<0?amount:B(e.hp);
 e.hp=e.hp.sub(amount);damageAccumulator=damageAccumulator.add(dealt);
 applyKnightLifesteal(dealt);
 e.hit=.18;
 if(floating.length<65)floating.push({x:e.x+Math.random()*24-12,y:e.y-32,txt:dealt.fmt(),color:critical?'#ff6b72':color,life:.85,big:critical});
 
 if(e.hp.cmp(0)<=0)killEnemy(e)}
function blast(x,y,rad,amount,color,type='magic',sourceSkill=null){effects.push({x,y,r:rad,t:0,life:.6,color,kind:type});let victims=enemies.filter(e=>Math.hypot(e.x-x,e.y-y)<rad);for(let e of victims)hurt(e,amount.mul(mod('area')).mul(.8+Math.random()*.4),Math.random()<Math.min(.95,mod('crit_chance')+Math.min(.2,skillBonus(sourceSkill,'crit_bonus'))),color,true,sourceSkill);return victims.length}
function getClosest(x=player.x,y=player.y,bossPriority=false){let best=null,dist=Infinity;for(let e of enemies){if(bossPriority&&e.kind==='boss')return e;let d=(e.x-x)**2+(e.y-y)**2;if(d<dist){dist=d;best=e}}return best}
// R98: a prioridade de chefes também governa a aproximação do cavaleiro.
// Não usar este alvo para medir perigo: o inimigo mais próximo continua
// determinando esquiva e recuo, mesmo quando o chefe está distante.
function r98PursuitTarget(){
 const boss=bossActive;
 if(boss&&(g.attackFocus==='boss'||boss.bossType==='stage')&&enemies.includes(boss)&&boss.hp.cmp(0)>0)return boss;
 return getClosest(player.x,player.y,false);
}
const SKILL_COSTS={grace:15,shadow:38,fury:18,curse:22,holy_spear:30,demons:34,flame_nova:19,thunderstorm:35,arcane_focus:26};
function fireSkill(id,manual=false){let s=D.skills.find(x=>x.id===id);if(!s||g.knightLevel<s.unlock){if(manual)alertGame('Desbloqueia no nível '+s?.unlock);return false}if(!equippedSkill(id)){if(manual)alertGame('Equipe esta habilidade na aba Habilidades.');return false}if((cd[id]||0)>0)return false;
 let manaCost=(SKILL_COSTS[id]??32)*(1-Math.min(SUPPORT_BONUS_CAP,skillBonus(id,'mana_saving')));if(player.mp<manaCost){if(manual)feed('Mana insuficiente');return false}player.mp-=manaCost;
 let duration=s.duration*(1+Math.min(.80,Math.max(0,mod('duration')-1)+Math.max(0,skillBonus(id,'duration'))));let cooldown=Math.max(.2*s.cooldown,s.cooldown*(1-Math.min(.80,Math.max(0,mod('cooldown')-1)+Math.max(0,skillBonus(id,'cooldown')))));cd[id]=cooldown;
 if(id==='shadow'){active.shadow=Math.max(4,duration);shadowDash()}
 else if(id==='grace'){active.grace=duration;gracePulseClock=0;attackNum=0;blast(player.x,player.y,120,damage().mul(2.2*mod('grace')),'#f8d9a0')}
 else if(id==='fury'){active.fury=duration;effects.push({x:player.x,y:player.y,r:65,t:0,life:duration,color:'#d34764',kind:'aura'})}
  else if(id==='curse'){active.curse=duration;for(const e of enemies)if(Math.hypot(e.x-player.x,e.y-player.y)<340)e.curse=true;blast(player.x,player.y,135,faithDamage().mul(.7*mod('curse')),'#a36ee0')}
  else if(id==='demons'){active.demons=duration;effects.push({x:player.x,y:player.y,r:146,t:0,life:.75,color:'#dec180',kind:'magic'});if(manual)alertGame('LEGION! Os bônus dos 32 heróis foram fortalecidos temporariamente.')}
  else if(id==='arcane_focus'){active.arcane_focus=duration;effects.push({x:player.x,y:player.y,r:140,t:0,life:1,color:'#728afc',kind:'magic'})}
   else if(id==='flame_nova'){
   const radius=170*(1+skillBonus(id,'radius'));
   // Record targets before damage. Nova consumes marks applied by Coração de Brasas.
   const marked=enemies.filter(e=>e.ember>0&&Math.hypot(e.x-player.x,e.y-player.y)<radius);
   const touched=enemies.filter(e=>Math.hypot(e.x-player.x,e.y-player.y)<radius);
   blast(player.x,player.y,radius,magicDamage().mul(2.1*mod(id)),'#ff9550','fire',id);
   for(const e of touched)if(enemies.includes(e))e.burning=Math.max(e.burning||0,4);
   if(skillBonus(id,'flame_echo')>0)blast(player.x,player.y,155,magicDamage().mul(skillBonus(id,'flame_echo')*mod(id)),'#ffbd75','fire',id);
   detonateEmbers(marked,'flame_nova',Math.min(7,4+Math.floor(skillBonus('thunderstorm','thunder_chain')*2)));
   const origins=touched.length?Array.from({length:Math.max(3,Math.min(4,touched.length))},(_,i)=>touched[i%touched.length]):Array.from({length:3},()=>({x:player.x,y:player.y}));
   for(const source of origins)makeFireOrb(source.x,source.y,new Set(touched.filter(e=>e.id===source.id).map(e=>e.id)));
   skillFx({x:player.x,y:player.y,r:radius,life:.6,color:'#ff944a',kind:'fireburst'});
  }
  else if(id==='thunderstorm'){
   castEmberHeart();
  }
  else if(id==='holy_spear'){
   castVeilRequiem();
  }
if(manual)feed(s.name+' ativada!');uiDirty=true;return true}
function autoCastUnlockedSkills(){
 if(!g.auto)return 0;
 let castCount=0;
  for(const id of g.equippedSkills){
   const skill=D.skills.find(s=>s.id===id);if(!skill)continue;
  if(g.knightLevel<skill.unlock)continue;
  if((cd[skill.id]??0)>0||(active[skill.id]??0)>0)continue;
  const cost=(SKILL_COSTS[skill.id]??32)*(1-Math.min(SUPPORT_BONUS_CAP,skillBonus(skill.id,'mana_saving')));
  if(player.mp<cost)continue;
  if(fireSkill(skill.id,false))castCount++;
 }
 return castCount;
}
// R36: Shadow Strike is a mobile assassin, not a screen-wide curse.
// Every activation sends a bounded chain through distinct nearby enemies.
// Unlike Curse, it cannot propagate indefinitely or blanket the arena.
const SHADOW_CHAIN_RADIUS=220;
const SHADOW_BASE_TARGETS=2;
const SHADOW_MAX_TARGETS=3;
let shadowChain=0;
function shadowDash(){
 const first=getClosest(player.x,player.y,g.attackFocus==='boss');
 if(!first)return 0;
 const maxTargets=Math.min(SHADOW_MAX_TARGETS,SHADOW_BASE_TARGETS+Math.floor(skillBonus('shadow','shadow_chain')));
 const visited=new Set();
 const power=damage().mul(1.75*mod('shadow'));
 let target=first,hits=0,lastX=player.x,lastY=player.y;
 while(target&&hits<maxTargets){
  const originX=target.x,originY=target.y;
  visited.add(target.id); // includes a defeated target, so no hit can repeat in one dash
  effects.push({x:lastX,y:lastY,r:28,t:0,life:.34,color:'#bd7fff',kind:'dash'});
  // Teleport near each enemy, keeping the knight inside the arena.
  player.x=clamp(originX-28,35,1085);player.y=clamp(originY-18,35,655);
  effects.push({x:originX,y:originY,r:57,t:0,life:.33,color:'#9b74f5',kind:'slash'});
  // Secondary hits deal 80% then 70%; bounded falloff prevents outclassing area skills.
  const falloff=hits===0?1:hits===1?.80:.70;
  const crit=Math.random()<Math.min(.95,mod('crit_chance')+skillBonus('shadow','crit_bonus'));
  hurt(target,power.mul(falloff),crit,'#c6adff',true,'shadow');
  // Blood Rift is a late specialization: a small impact, not a full-screen blast.
  if(skillBonus('shadow','shadow_bleed')>0){
   blast(originX,originY,40,damage().mul(Math.min(.45,skillBonus('shadow','shadow_bleed')*.28)),'#bc7bfa','magic','shadow');
  }
  hits++;lastX=originX;lastY=originY;
  if(hits>=maxTargets)break;
  // Chain only to an unvisited, still-living target within 220 game units.
  let next=null,distSq=SHADOW_CHAIN_RADIUS*SHADOW_CHAIN_RADIUS;
  for(const enemy of enemies){
   if(visited.has(enemy.id))continue;
   const d=(enemy.x-originX)**2+(enemy.y-originY)**2;
   if(d<=distSq){distSq=d;next=enemy;}
  }
  target=next;
 }
 shadowChain+=hits;
 return hits;
}
function basicAttack(){let target=getClosest(player.x,player.y,g.attackFocus==='boss'||Boolean(bossActive&&bossActive.bossType==='stage'));if(!target)return;if(Math.hypot(target.x-player.x,target.y-player.y)>BALANCE.attackRange)return;attackNum++;knightSwing=.23;let crit=Math.random()<mod('crit_chance'),baseDmg=damage();
 const oath=Math.min(.05,skillBonus('demons','hero_to_knight'));
 // Talent amplifies class-derived physical damage without reapplying raw hero DPS.
 const dmg=baseDmg.mul(1+oath*10).mul(active.fury>0&&target.kind==='boss'?1+skillBonus('fury','boss_bane'):1);hurt(target,dmg,crit,'#f7e6d0');effects.push({x:target.x,y:target.y,r:35,t:0,life:.22,color:crit?'#fe5472':'#e4cbb2',kind:'slash'});if(attackNum%4===0)sound('strike');if(active.grace>0&&attackNum%Math.max(2,5-Math.floor(skillBonus('grace','efficiency')*4))===0){blast(target.x,target.y,125*(1+skillBonus('grace','radius')),baseDmg.mul(2.2*mod('grace')),'#fff0ad','magic','grace');if(skillBonus('grace','grace_echo')>0)blast(target.x,target.y,100,baseDmg.mul(skillBonus('grace','grace_echo')*mod('grace')),'#f8bc88','magic','grace')}if(active.grace>0&&skillBonus('grace','grace_cleave')>0)blast(target.x,target.y,65,baseDmg.mul(skillBonus('grace','grace_cleave')*.25),'#a47ed7','magic','grace');if(active.fury>0&&skillBonus('fury','fury_explode')>0){
  const rank=Math.min(5,Math.round(skillBonus('fury','fury_explode')));
  const radius=56+rank*7;
  const splash=baseDmg.mul(.11+.065*rank);
  // Explode on hit (up to six nearby foes). Boss does not receive a duplicate hit.
  effects.push({x:target.x,y:target.y,r:radius,t:0,life:.32,color:'#e65c52',kind:'magic'});
  let affected=0;
  for(const enemy of [...enemies]){
   if(enemy===target||affected>=6)continue;
   if(Math.hypot(enemy.x-target.x,enemy.y-target.y)<=radius){
    hurt(enemy,splash,false,'#e76d4a',false,'fury');affected++;
   }
  }
 }
 if(active.fury>0&&skillBonus('fury','fury_sustain')>0)player.hp=Math.min(maxHealth(),player.hp+maxHealth()*Math.min(.04,skillBonus('fury','fury_sustain')))}
function passiveGold(){
 // Stable base economy; economic specialization is milestone-driven.
 const eco=D.heroes.filter(h=>['gold_idle','gold'].includes(h.effect));
 let support=eco.reduce((v,h)=>v+Math.min(1,heroMilestoneEffectiveLevel(h.id)/1000)*.25,0);
 return B(.012+support*.012).mul(Big.power(1.018,globalStage()-1)).mul(economySourceMultipliers('idle'));
}
function buildingIntervalAt(id,level){
 const b=D.buildings.find(x=>x.id===id);
 if(!b)return Infinity;
 if(id==='pet')return 7200/Math.pow(2,(Math.min(PET_SANCTUARY_MAX_LEVEL,Math.max(1,level))-1)/(PET_SANCTUARY_MAX_LEVEL-1));
 const min={scroll:14400,forge:10800}[id];
 return Math.max(min||1,b.interval/Math.pow(1.075,Math.max(0,level-1)));
}
function buildingInterval(id){return buildingIntervalAt(id,g.buildings[id]||1)}
function updateVillage(dt){for(let id of ['wood','stone','iron'])g.village[id]+=dt*VILLAGE_RESOURCE_RATES[id]*(g.buildings[id]||1);for(const id of ['pet','scroll','forge']){g.production[id]=(g.production[id]||0)+dt;const interval=buildingInterval(id);const completed=Math.min(1000,Math.floor(g.production[id]/interval));if(completed>0){g.production[id]-=completed*interval;if(id==='pet'){for(let i=0;i<completed;i++)givePet(i===completed-1);feed('Vila: '+completed+' pet(s) produzido(s).')}else if(id==='scroll'){for(let i=0;i<completed;i++)giveScroll(i===completed-1)}else{g.village.forge+=completed;feed('A ferraria concluiu '+completed+' material(is) de forja')}}}}
// R78 — continuous uncapped enemy threat, including world transitions.
// The previous hard caps (33% normal/elite, 60% boss HP) disguised a
// discontinuity at stage 251 and made higher stages stop getting deadlier.
// Stage damage now follows a reference knight's BASE HP, but never uses
// the ACTUAL player's max HP as a ceiling. HP, defense and damage reduction
// therefore have an actual benefit even when enemies hit exceptionally hard.
function enemyContactDamage(e){
 const kindMult=e.kind==='boss'?2.1:e.kind==='elite'?1.65:e.kind==='beast'?1.25:1;
 const stage=Math.max(1,Math.floor(Number(e.stage)||1));
 const difficulty=clamp(Math.floor(Number(e.diff)||0),0,4);
 const global=globalStage(stage,difficulty);
 let normalThreat;
 if(global<=55){
  // Preserve the R77 early teaching stages exactly, including stage 55.
  const beginner=difficulty===0?(.36+.64*Math.min(1,stage/55)):1;
  normalThreat=5.5*Math.pow(1.025,stage-1)*beginner;
 }else{
  const progress=(global-55)/195;
  const referenceHp=knightBaseHealth(Math.floor(5+.60*55));
  // The playable knight has a 60,000-level ceiling: do not benchmark against
  // fictional 72k+ levels when running the fifth world.
  const expectedHp=knightBaseHealth(Math.min(60000,Math.floor(5+.60*global)));
  // Match the 55→56 entry pressure, then grow without a 250→251 reset.
  // After stage 250 use logarithmic pace (instead of linear runaway growth).
  // Even beyond the level-60k ceiling, pace keeps climbing in the endless world.
  const pace=1+.50*(progress<=1?progress:1+Math.log1p(progress-1));
  const pressure=1+.75*(1-Math.exp(-5.6*progress));
  // global already includes the world; compounding an extra difficulty multiplier
  // on top of it would cause unavoidable endgame one-shots. The next world
  // remains much harder via its existing 100x enemy-HP prestige spike.
  normalThreat=(5.5*Math.pow(1.025,54))*(expectedHp/referenceHp)*pace*pressure;
 }
 const enraged=e.kind==='boss'?1+Math.min(.85,(e.bossAge||0)/35):1;
 return Math.max(1,normalThreat*kindMult*enraged/Math.max(1,mod('defense')));
}
function contactEnemy(e){
 if(player.contactInvuln>0||e.attackCooldown>0)return false;
 const raw=enemyContactDamage(e)*(1-effectiveDamageReduction());
 player.hp=Math.max(0,player.hp-raw);
 player.contactInvuln=1.15;player.hitFlash=.32;
 e.attackCooldown=e.kind==='boss'?1.65:e.kind==='elite'?1.35:1.15;
 g.damageTaken=(g.damageTaken||0)+raw;
 if(floating.length<65)floating.push({x:player.x,y:player.y-64,txt:'-'+fmt(raw)+' PV',color:'#ff6b78',life:1.1,big:true});
 effects.push({x:player.x,y:player.y,r:38,t:0,life:.28,color:'#fa405b',kind:'slash'});
 if(player.hp<=0)feed('O cavaleiro caiu sob os golpes da horda.');
 return true;
}
// Heróis apenas passivos: nenhum aliado desenhado ou simulado.
function updateCombat(dt){g.totalTime+=dt;heroAnim+=dt;knightSwing=Math.max(0,knightSwing-dt);
 // Maximum knight lifesteal: 4.5% max HP per second, short 0.09 HP reserve.
 // The pool also bounds spells hitting dozens of enemies simultaneously.
 lifestealPool=Math.min(maxHealth()*.09,lifestealPool+maxHealth()*.045*dt);
 tickSkillReactions(dt);
 timers.heroAuto=(timers.heroAuto??AUTO_HERO_INTERVAL)-dt;
 if(timers.heroAuto<=0){timers.heroAuto=AUTO_HERO_INTERVAL;if(g.autoHeroes)autoBuyHeroes(.70,false);}

 // R70: no repeatable equipment guardian or boss drops on cleared stages.
 timers.attack-=dt;timers.spawn-=dt;timers.curse+=dt;timers.demons+=dt;timers.fairy-=dt;for(let key of Object.keys(cd))cd[key]=Math.max(0,cd[key]-dt);for(let key of Object.keys(active))active[key]=Math.max(0,active[key]-dt);
 let mh=maxHealth(),mm=100*mod('mana');player.contactInvuln=Math.max(0,(player.contactInvuln||0)-dt);player.hitFlash=Math.max(0,(player.hitFlash||0)-dt);player.hp=clamp(player.hp+dt*healthRegenPerSecond(),0,mh);player.mp=clamp(player.mp+dt*(5*mod('mana_regen')+(active.arcane_focus>0?5*skillBonus('arcane_focus','arcane_mana'):0)),0,mm);
 retreatCooldown=Math.max(0,retreatCooldown-dt);
 let tx=(manual.d?1:0)-(manual.a?1:0),ty=(manual.s?1:0)-(manual.w?1:0);let userMove=tx||ty;
 if(userMove){
  // O comando do jogador sempre vence a IA: interrompe uma esquiva imediatamente.
  if(retreating){retreating=false;retreatDestination=null;retreatCooldown=Math.max(retreatCooldown,1.4);}
  let l=Math.hypot(tx,ty);player.x+=tx/l*138*mod('move_speed')*dt;player.y+=ty/l*138*mod('move_speed')*dt;
 }else{
  const target=r98PursuitTarget(),closestThreat=getClosest(player.x,player.y,false);
  const hpRatio=player.hp/Math.max(1,mh);
  const threatened=closestThreat&&Math.hypot(closestThreat.x-player.x,closestThreat.y-player.y)<135;
  if(!retreating&&g.autoRetreat!==false&&retreatCooldown<=0&&hpRatio<=.25&&threatened){
   retreatDestination=selectRetreatDestination();
   if(retreatDestination){retreating=true;retreatTime=0;}
   else retreatCooldown=1.4; // Se não há local mais seguro, não caminhar para o perigo.
  }
  if(retreating){
   retreatTime+=dt;
   const dist=Math.hypot(retreatDestination.x-player.x,retreatDestination.y-player.y);
   if(retreatTime>=.9||dist<=8||hpRatio>=.55){
    retreating=false;retreatDestination=null;retreatCooldown=2.2;
   }else{
    const step=Math.min(dist,160*mod('move_speed')*dt);
    player.x+=(retreatDestination.x-player.x)/dist*step;
    player.y+=(retreatDestination.y-player.y)/dist*step;
   }
  }else if(target){
   const dist=Math.max(1,Math.hypot(target.x-player.x,target.y-player.y));
   const approachRange=g.autoRetreat!==false&&hpRatio<.40?Math.min(BALANCE.attackRange-10,95):BALANCE.autoApproachRange;
   // Com pouca vida, mantenha alcance de ataque sem retornar ao contato corpo a corpo.
   if(dist>approachRange){player.x+=(target.x-player.x)/dist*92*mod('move_speed')*dt;player.y+=(target.y-player.y)/dist*92*mod('move_speed')*dt;}
  }
 }
 player.x=clamp(player.x,35,1085);player.y=clamp(player.y,40,650);
 if(timers.spawn<=0){
  const limit=Math.min(aliveTarget(),queue.length&&!bossActive?MAX_ALIVE_ENEMIES-1:MAX_ALIVE_ENEMIES);
  const batch=Math.min(hordeGroupSize(),Math.max(0,limit-enemies.length));
  // Spawn groups give a real horde at high stages, with a strict live cap.
  // Preserve one reserved place whenever an important boss is queued.
  for(let i=0;i<batch;i++)spawnEnemy();
  timers.spawn+=hordeSpawnInterval();
 }
 // Boss events cannot starve behind the live-enemy cap; remove one ordinary
 // monster without loot or XP to reserve a slot (only if the arena is full).
 if(queue.length&&!bossActive&&enemies.length>=MAX_ALIVE_ENEMIES){
  const idx=enemies.findIndex(e=>e.kind!=='boss');
  if(idx>=0)enemies.splice(idx,1);
 }
 if(queue.length&&!bossActive&&enemies.length<MAX_ALIVE_ENEMIES){let ev=queue.shift();spawnEnemy(false,'boss',ev)}
 for(let i=0;i<enemies.length;i++){
  const e=enemies[i];e.attackCooldown=Math.max(0,(e.attackCooldown||0)-dt);
  let dx=player.x-e.x,dy=player.y-e.y,dist=Math.max(1,Math.hypot(dx,dy));
  const reach=e.kind==='boss'?55:e.kind==='elite'?32:e.kind==='mimic'?26:24;
  const slowFactor=(e.slow||0)>0?.55:1;
  e.slow=Math.max(0,(e.slow||0)-dt);e.burning=Math.max(0,(e.burning||0)-dt);e.ember=Math.max(0,(e.ember||0)-dt);e.veilExposure=Math.max(0,(e.veilExposure||0)-dt);
  if(e.kind==='boss'){
   e.bossAge=(e.bossAge||0)+dt;
   e.bossMotion=(e.bossMotion||0)+dt;
   const bossReach=e.archetype==='carrasco'?86:e.archetype==='profanador'?205:150;
   if(dist>bossReach){e.x+=dx/dist*e.speed*slowFactor*dt;e.y+=dy/dist*e.speed*slowFactor*dt;}
   else if(dist<bossReach*.65&&e.archetype!=='carrasco'){e.x-=dx/dist*e.speed*.55*dt;e.y-=dy/dist*e.speed*.55*dt;}
   if(dist<62)contactEnemy(e);
   updateBossAI(e,dt);
  }else if(dist>reach){e.x+=dx/dist*e.speed*slowFactor*dt;e.y+=dy/dist*e.speed*slowFactor*dt;}
  else contactEnemy(e);
  e.phase+=dt*2;e.hit=Math.max(0,e.hit-dt);
  if(active.curse>0&&dist<r67Reach('curse')){e.curse=true;e.curseTimer=Math.max(e.curseTimer||0,2);}
 }
 updateBossWarnings(dt);
 if(timers.attack<=0){basicAttack();timers.attack+=1/mod('attack_speed')}
 // Heróis passivos: não existem ataques, entidades ou projéteis independentes.
 // Automação: cooldown ainda não registrado equivale a pronto (0).
 // O custo real de mana é consultado para cada habilidade; buffs ativos aguardam acabar.
 // Isso vale para todas as habilidades desbloqueadas, inclusive as elementais.
 autoCastUnlockedSkills();
 r67TickAilments(dt);
 if(timers.fairy<=0){timers.fairy+=fairiesInterval();const count=fairyGroupSize();let gain=grantGold(enemyGold(g.stage).mul(GOLD_SOURCE_BASE.fairy).mul(count),'fairy');for(let i=0;i<count;i++)effects.push({x:player.x+Math.cos(i*2*Math.PI/count)*55,y:player.y+Math.sin(i*2*Math.PI/count)*55,r:70,t:0,life:1,color:'#f7ce83',kind:'magic'});alertGame('Bênção das Fadas: '+count+' fada(s) · +'+gain.fmt()+' ouro')}
 if(player.hp<=0){
  const previousStage=g.stage;
  g.deaths=(g.deaths||0)+1;
  xp=xp.mul(.5);
  g.stage=Math.max(1,g.stage-DEATH_RETREAT_STAGES);
  g.stageHold=true; // Farm seguro: abates continuam dando recursos, mas NÃO aumentam o nível do mundo.
  g.stageKills=0;
  // Enemies are cleared on resurrection so the knight does not instantly die again.
  enemies=[];queue=[];bossActive=null;bossWarnings.length=0;bossEmbers.length=0;active={};cd={};clearSkillReactions();
  player.x=560;player.y=345;retreating=false;retreatCooldown=0;retreatTime=0;retreatDestination=null;player.hp=mh;player.mp=mm;
  player.contactInvuln=2.2;player.hitFlash=0;
  for(let i=0;i<Math.min(8,aliveTarget());i++)spawnEnemy(true);
  const message=`Derrota: fase ${previousStage} → ${g.stage}. -50% da EXP atual. FARM FIXO: clique em AVANÇAR quando desejar.`;
  alertGame(message);effects.push({x:player.x,y:player.y,r:150,t:0,life:1.5,color:'#ffe7aa',kind:'magic'});
  save(g.slot,true);
 }
 for(let i=effects.length-1;i>=0;i--){effects[i].t+=dt;if(effects[i].t>=effects[i].life)effects.splice(i,1)}
 for(let i=floating.length-1;i>=0;i--){floating[i].y-=dt*36;floating[i].life-=dt;if(floating[i].life<=0)floating.splice(i,1)}
 trialTelemetryTick();g.fairyCountdown=timers.fairy;updateVillage(dt);let passive=passiveGold().mul(dt);gold=gold.add(passive);goldEarned=goldEarned.add(passive);goldAccumulator=goldAccumulator.add(passive);
 timers.seconds+=dt;if(timers.seconds>=1){timers.seconds-=1;dpsValue=damageAccumulator;gpsValue=goldAccumulator;damageAccumulator=B(0);goldAccumulator=B(0)}
 // Render refresh and autosave use REAL time via gameFrame(), never simulated time.
}

const EFFECT_LABELS={hero_warrior:'Poder dos heróis Guerreiros (bônus passivo físico)',hero_magic:'Poder dos heróis Magos (bônus passivo mágico)',hero_faith:'Poder dos heróis Sacerdotes (bônus passivo de Fé)',physical:'Dano físico',faith:'Dano de Fé',magic:'Dano mágico',damage:'Dano global',crit_damage:'Dano crítico',crit_chance:'Chance de crítico',attack_speed:'Velocidade de ataque',gold:'Ouro global',gold_monsters:'Ouro de monstros',gold_boss:'Ouro de chefes',gold_mimic:'Ouro de Mimics (Chesterson)',gold_fairy:'Ouro de fadas',gold_idle:'Ouro passivo dos heróis',gold_midas:'Ouro global',health:'Vida máxima',damage_reduction:'Redução de dano',health_regen:'Regeneração de vida',cooldown:'Redução de recarga',mana:'Mana máxima',mana_regen:'Regeneração de mana',defense:'Defesa',area:'Dano em área',duration:'Duração das habilidades',fairy_rate:'Frequência das fadas',fairy_count:'Fadas simultâneas',mimic_chance:'Chance de Mimic',move_speed:'Velocidade de movimento',boss_damage:'Dano em chefes',normal_damage:'Dano em inimigos comuns',gear:'Potência dos atributos principais dos equipamentos',relic:'Relíquias por prestígio',drop:'Chance de drops',wood:'Produção de madeira',stone:'Produção de pedra',iron:'Produção de ferro',grace:'Graça Celestial',fury:'Ira do Mártir',curse:'Maldição do Véu',demons:'LEGION · Bônus dos heróis',shadow:'Golpe da Sombra',flame_nova:'Nova de Fogo',thunderstorm:'Coração de Brasas',holy_spear:'Ceifa do Véu',arcane_focus:'Foco Arcano'};
function effectLabel(id){return EFFECT_LABELS[id]||id.replaceAll('_',' ')}
function effectValue(id,v){
 if(id==='damage_reduction')return '+'+compactPercent(Math.max(0,Number(v)-1))+' / 75%';
 if(id==='crit_chance')return compactPercent(v);
 if(id==='attack_speed')return compactNumber(v,3)+' ataques/s';
 if(HIGH_SUPPORT_SET.has(id))return '+'+compactPercent(Math.max(0,Number(v)-1))+' / +80% (30/10/40)';
 if(isSupportEffect(id))return '+'+compactPercent(Math.max(0,Number(v)-1))+' / +20% (SUPORTE)';
 return compactMultiplier(v);
}
function gainPercent(before,after){
 const a=new Big(before),b=new Big(after);
 if(a.m<=0)return '—';
 const ratio=b.div(a);
 if(ratio.cmp(1)>=0)return '+'+compactPercent(ratio.sub(1));
 return '-'+compactPercent(new Big(1).sub(ratio));
}
function previewModifier(id,callback){const before=mod(id);callback();const after=mod(id);return {before,after,gain:gainPercent(before,after)}}
function heroEffectivePreview(hero,targetLevel){
 const before=ownHeroDps(hero);
 const after=ownHeroDps(hero,targetLevel);
 return {before,after,gain:gainPercent(Math.max(1e-20,before.num(1e20)),Math.max(1e-20,after.num(1e20)))};
}
function artifactPreview(a,lv){
 const orig=g.artifactLevels[a.id]||0;
 if(a.effect==='fairy_count'){
  const before=fairyGroupSize();g.artifactLevels[a.id]=Math.min(80,lv+1);
  const after=fairyGroupSize();g.artifactLevels[a.id]=orig;
  return {before,after,gain:before===after?'ainda sem fada adicional':`+${after-before} fada(s)`};
 }
 const result=previewModifier(a.effect,()=>{g.artifactLevels[a.id]=a.maxLevel?Math.min(a.maxLevel,lv+1):lv+1});
 g.artifactLevels[a.id]=orig;return result;
}
function statTile(label,value){return `<div class="stat-tile"><small>${esc(label)}</small><strong>${esc(String(value))}</strong></div>`}
function button(label,action,id='',args='',style=''){return `<button class="gamebtn ${style}" data-action="${esc(action)}" data-id="${esc(id)}" data-arg="${esc(args)}">${label}</button>`}
function row(k,v){return `<div class="info-line"><span>${esc(k)}</span><strong>${esc(String(v))}</strong></div>`}
function entry(icon,name,subtitle,description,actions,accent=''){return `<div class="entry"><div class="entry-top"><div class="entry-icon ${accent}">${icon}</div><div class="entry-main"><div class="entry-name" title="${esc(name)}">${esc(name)}</div><div class="entry-sub">${esc(subtitle)}</div></div></div>${description?`<div class="description">${esc(description)}</div>`:''}${actions?`<div class="entry-action">${actions}</div>`:''}</div>`}
function sectionTitle(text){return `<h3>✥ ${esc(text)}</h3>`}
function fmtTime(secs){secs=Math.max(0,Math.ceil(secs));if(secs>=3600)return `${Math.floor(secs/3600)}h ${Math.floor(secs%3600/60)}min`;if(secs>=60)return `${Math.floor(secs/60)}m ${secs%60}s`;return `${secs}s`}
function knightPanel(){
 const level=g.knightLevel,required=nextXP();
 const returnS=prestigeReturn(),reward=prestigeReward(),eligibility=prestigeEligibility();
 const discoveryCost=artCount()<D.artifacts.length?artifactDiscoverCost(artCount()):null;
 const projectedBalance=relics.add(reward);
 const forecast=discoveryCost?`Próxima descoberta: ${discoveryCost.fmt()} relíquias · ${projectedBalance.cmp(discoveryCost)>=0?'saldo previsto suficiente':'saldo previsto insuficiente'}.`:'Todas as descobertas concluídas.';
 const gateInfo=eligibility.first?'Primeiro prestígio: atingir o estágio 55.':`Próximo prestígio: retornar ao estágio ${eligibility.threshold} (mínimo de 30% da distância exigida na execução anterior).`;
 return `${sectionTitle('O juramento do condenado')}
<div class="stat-grid">${statTile('Dano físico',damage().fmt())}${statTile('Dano-base (+1/Nv)',basePhysicalDamage())}${statTile('Vida máxima',fmt(maxHealth()))}${statTile('Redução de dano',compactPercent(effectiveDamageReduction())+' / 75%')}${statTile('Roubo de vida',compactPercent(knightLifestealRate()))}${statTile('Regeneração / segundo',fmt(healthRegenPerSecond())+' PV')}${statTile('Fé',faithDamage().fmt())}${statTile('Magia',magicDamage().fmt())}</div>
${sectionTitle('Atributos por nível')}<div class="notice-inline">Cada nível do cavaleiro concede <b>+1 dano físico-base, +1 vida-base e +0,01 ponto percentual de roubo de vida</b>. Nível 1: 10 de dano e 100 PV. O limite passa a 60.000 níveis para suportar as cinco dificuldades. O dano físico-base também recebe escalonamento pelo nível efetivo do cavaleiro, como Fé e Magia; depois entram heróis, equipamentos e artefatos. <b>Dren</b> fortalece a vida e <b>Eira</b> a regeneração por MARCOS, sem usar esses atributos como especialidade principal.</div>
${row('Nível',level+' / 60.000')}${row('Vida-base por nível',fmt(knightBaseHealth())+' PV · +1 fixo + progressão de PV')}${row('Próximo nível · vida-base',fmt(knightBaseHealth(level+1))+' PV')}${row('Roubo de vida',compactPercent(knightLifestealRate())+' / 30%')}${row('Próximo nível',compactPercent(knightLifestealRate(level+1))+' de roubo de vida')}${row('Limite de nível neste estágio',knightLevelCap()+' (avance o mundo para liberar mais níveis)')}${row('EXP no nível atual',xp.fmt()+' / '+required.fmt())}${row('EXP base por monstro',enemyXP(g.stage).fmt())}${row('Eficiência de EXP por abate',(experienceEfficiency()*100).toFixed(2)+'%')}${row('Próximo nível (custo)',nextXP(level+1).fmt()+' EXP')}
${sectionTitle('SUPORTE ESPECIAL · máximo +80%')}
<div class="notice-inline">Cada atributo especial tem limites independentes por origem: <b>+30% marcos de heróis</b>, <b>+10% afixos secundários</b> e <b>+40% relíquias especiais (nível máximo 80)</b>. Nada disso pode ser atributo principal de um herói ou equipamento.</div>
${HIGH_SUPPORT_EFFECTS.map(k=>{const x=specialSupportBreakdown(k);return row(effectLabel(k),`+${compactPercent(x.total)} / +80% · heróis ${compactPercent(x.hero)} · afixos ${compactPercent(x.gear)} · relíquias ${compactPercent(x.artifact)} · Constelação ${compactPercent(x.passive||0)}`)}).join('')}
${row('Fadas por evento',fairyGroupSize()+' / 9 (relíquia exclusiva, +800% no nível 80)')}
${sectionTitle('OUTROS BÔNUS DE SUPORTE · teto +20%')}
${SUPPORT_EFFECTS.filter(k=>!HIGH_SUPPORT_SET.has(k)).map(k=>row(effectLabel(k),'+'+compactPercent(supportEffectiveBonus(k))+' / +'+(['mana','mana_regen'].includes(k)?'150':k==='defense'?'65':'20')+'%')).join('')}
${sectionTitle('Combate e sobrevivência')}${row('Físico efetivo',damage().fmt())}${row('Chance crítica',Math.round(mod('crit_chance')*100)+'%')}${row('Dano crítico',compactMultiplier(mod('crit_damage')))}${row('Ataques / segundo',mod('attack_speed').toFixed(2))}${row('PV máximo',fmt(maxHealth()))}${row('Redução de dano',compactPercent(effectiveDamageReduction())+' / 75%')}${row('Regeneração de vida',fmt(healthRegenPerSecond())+' PV/s')}${row('Relíquia de redução de dano',compactPercent(relicDamageReduction())+' / 75%')}${row('Roubo de vida',compactPercent(knightLifestealRate())+' do dano efetivo (até 30%)')}${row('HP de um inimigo comum',enemyHealth(g.stage,g.difficulty).fmt())}
${sectionTitle('Prestígio do Cavaleiro')}<div class="notice-inline"><b>${gateInfo}</b> ${eligibility.allowed?'Prestígio liberado.':'Ainda não liberado: avance o mundo.'} Relíquias dependem EXCLUSIVAMENTE do maior estágio alcançado nesta execução, incluindo estágios já conquistados em outras tentativas. Abates repetidos sem subir de estágio não acrescentam relíquias. Ouro, heróis temporários e habilidades reiniciam. O nível do cavaleiro retorna ao valor compatível com a fase de retorno, inclusive no Mundo I; uma reserva equivalente a 6 inimigos comuns da fase permite recontratar heróis. Artefatos e transcendências permanecem.</div>
${row('Maior estágio desta execução',Math.max(g.stage,g.runPeak||g.stage))}${row('Requisito de estágio',eligibility.threshold)}${row('Marco de retorno',returnS)}${row('Relíquias se prestigiar',reward.fmt())}${row('Saldo previsto após prestígio',projectedBalance.fmt())}<div class="notice-inline">${forecast} Projeção considerando o saldo atual e sem compras intermediárias; não concede relíquias.</div>${button(eligibility.allowed?'RENASCER · +'+reward.fmt()+' RELÍQUIAS':'BLOQUEADO · PRECISA DA FASE '+eligibility.threshold,'prestige','','',eligibility.allowed?'block':'muted')}
${sectionTitle('Penalidade ao morrer')}${row('Recuo','1 fase (mínimo 1)')}${row('EXP perdida','50% da barra atual; níveis já obtidos são preservados')}${row('Estado de avanço',g.stageHold?'FARM FIXO — clique RETOMAR':'Derrote o guardião da fase para avançar')}${g.stageHold?'<div class="notice-inline">Continue farmando nesta fase; para retomar o avanço, clique em AVANÇAR abaixo da arena.</div>':''}${sectionTitle('Prioridade de ataque')}${button('Alvo mais próximo','focus','closest','',''+(g.attackFocus==='closest'?'green':'muted'))}${' '}${button('Priorizar chefes','focus','boss','',''+(g.attackFocus==='boss'?'green':'muted'))}<div class="notice-inline">Priorizar chefes também orienta a aproximação automática; o recuo continua reagindo ao inimigo próximo. As habilidades em área reservam um dos ataques existentes para o chefe ao alcance, sem impactos extras.</div>`;
}
// R53: estima o nível que um cavaleiro teria conquistado normalmente na
// fase de retorno, usando as MESMAS fórmulas de EXP do jogo. Nunca excede o
// teto da fase e não usa o nível da fase máxima que originou o prestígio.
function prestigeStageKnightLevel(stage,difficulty=g.difficulty){
 const s=Math.max(1,Math.floor(Number(stage)||1));
 if(s===1&&difficulty===0)return 1;
 const xpPerKill=enemyXP(s,difficulty);
 const target=xpPerKill.mul(4); // aproximadamente 4 abates para próximo nível
 let low=1,high=knightLevelCap(s,difficulty);
 while(low<high){
  const mid=Math.ceil((low+high)/2);
  if(nextXP(mid).cmp(target)<=0)low=mid;
  else high=mid-1;
 }
 return Math.max(1,Math.min(60000,low));
}
function prestigeReturn(stage=Math.max(g.runPeak||g.stage,g.stage)){
 return Math.max(1,250*(Math.floor(stage/250)-1));
}
function prestigeEligibility(){
 const gate=g.prestigeGates?.[g.difficulty];
 const threshold=gate&&Number.isFinite(Number(gate.threshold))?Math.max(REPEAT_PRESTIGE_FLOOR,Math.floor(Number(gate.threshold))):FIRST_PRESTIGE_STAGE;
 const peak=Math.max(g.stage,g.runPeak||g.stage);
 return {allowed:peak>=threshold,threshold,peak,first:!gate};
}
function prestigeReward(){
 const {allowed,peak}=prestigeEligibility();
 if(!allowed)return B(0);
 // Rank of the stage reached in THIS run determines the relic amount. Kills do not.
 // Earning relics on previously cleared stages is intentionally allowed after replaying.
 return basePrestigeRelics(peak,g.difficulty).mul((g.difficulty+1)*mod('relic'));
}
function knightPrestige(){
 const requirement=prestigeEligibility(),reward=prestigeReward();
 if(!requirement.allowed||reward.cmp(1)<0){alertGame('Prestígio bloqueado: alcance a fase '+requirement.threshold+'.');return}
 const priorPeak=requirement.peak,returnStage=prestigeReturn(priorPeak);
 // 30% of the stage at prestige, measured as actual stage progression after return.
 // Cap the requirement at 24,000 in worlds I-IV to preserve repeatable prestiges.
 const steps=Math.max(REPEAT_PRESTIGE_FLOOR,Math.ceil(priorPeak*PRESTIGE_FRACTION));
 const nextThreshold=g.difficulty===4
  ?returnStage+steps
  :Math.min(24000,returnStage===1?steps:returnStage+steps);
 showModal('Renascimento do Cavaleiro',`Você receberá ${reward.fmt()} relíquias por alcançar o estágio ${priorPeak} nesta execução. Abates não alteram o prêmio. Você retornará ao estágio ${returnStage} e só poderá prestigiar novamente após chegar ao estágio ${nextThreshold}. Os níveis dos heróis serão reiniciados, mas o cavaleiro voltará com nível compatível com a fase. Você receberá uma reserva inicial de ouro para reativar seus heróis; o restante deverá ser farmado.`,()=>{
  relics=relics.add(reward);totalRelics=totalRelics.add(reward);
  g.knightPrestiges++;
  g.prestigeGates[g.difficulty]={threshold:nextThreshold,priorPeak,returnStage};
  g.stage=returnStage;g.runPeak=returnStage;g.runStartStage=returnStage;g.runKills=0;g.stageHold=false;
  g.knightLevel=prestigeStageKnightLevel(returnStage,g.difficulty);
  g.prestigeLevelFixVersion=1;
  g.stageKills=0;delete g.training;
  // Reserva equivalente a seis inimigos comuns da fase de retorno: evita
  // reiniciar com 0 ouro diante de monstros avançados, sem virar premiação
  // de farm superior ao que o estágio já ofereceria.
  gold=enemyGold(returnStage,g.difficulty).mul(6);xp=B(0);
  g.heroLevels={};g.heroUpgradeProgress={};enemies=[];queue=[];bossActive=null;active={};cd={};clearSkillReactions();
  if(g.autoHeroes)autoBuyHeroes(.70,false);
  player.hp=maxHealth();player.mp=100*mod('mana');
  for(let i=0;i<aliveTarget();i++)spawnEnemy(true);scheduleBosses(g.stage,true);
  trialTelemetryOnPrestige(reward,priorPeak,returnStage,nextThreshold);
  sound('prestige');alertGame('Prestígio! +'+reward.fmt()+' relíquias · próximo estágio mínimo '+nextThreshold);
  save();renderAll();
 });
}
function skillFamily(id){
 const s=D.skills.find(x=>x.id===id);if(!s)return '—';
 const source=s.kind==='physical'?damage():s.kind==='faith'?faithDamage():magicDamage();
 return s.kind.toUpperCase()+(s.role==='buff'?' · BUFF':' · DANO')+' · base '+source.fmt();
}
function skillsPanel(){
 // The skill tree must be a dedicated view: previously it was appended AFTER
 // every skill card, so clicking "VER ÁRVORE" looked like a broken button.
 if(skillView==='tree')return skillTreePanel();
 const selected=normalizeLoadout(g.equippedSkills);
 let html='<div class="button-row">'+button('✥ VER ÁRVORE DE TALENTOS','skillOpenTree','','','green')+'</div>'+sectionTitle('Habilidades equipadas · '+selected.filter(Boolean).length+' / 4');
 html+='<div class="notice-inline">Somente as 4 habilidades equipadas podem ser usadas pelo AUTO ou pelas teclas 1–4. Clique no nome ou em VER ÁRVORE para abrir os talentos daquela habilidade. A ordem dos espaços define as teclas.</div>';
 html+='<div class="skill-loadout-grid">'+Array.from({length:4},(_,i)=>{
  const id=selected[i],sk=D.skills.find(x=>x.id===id);
  if(!sk)return '<div class="skill-loadout-slot empty-slot"><small>ESPAÇO '+(i+1)+'</small><strong>VAZIO</strong><span>Equipe uma habilidade abaixo</span></div>';
  return `<div class="skill-loadout-slot"><small>ESPAÇO ${i+1} · TECLA ${i+1}</small><button type="button" class="skill-slot-name" data-action="skillFocus" data-id="${esc(id)}" title="Abrir árvore de ${esc(sk.name)}">${esc(sk.name)} →</button><div class="button-row">${button('REMOVER','skillEquip',id,'','muted')}</div></div>`;
 }).join('')+'</div>';
 const groups=[['physical','FÍSICO'],['faith','FÉ'],['magic','MAGIA']];
 for(const [kind,label] of groups){
  html+=sectionTitle(label);
  for(const sk of D.skills.filter(x=>x.kind===kind)){
   const equipped=equippedSkill(sk.id),unlocked=g.knightLevel>=sk.unlock;
   const summary=sk.role==='buff'?'BUFF':'DANO';
   const info=unlocked
    ?`Nível requerido alcançado. ${equipped?'Está equipada e pode ser usada.':'Disponível para equipar.'} A árvore pode ser inspecionada a qualquer momento.`
    :`Bloqueada: cavaleiro Nv ${g.knightLevel} / ${sk.unlock}. Inspecione os talentos agora; a habilidade só pode ser equipada ao atingir o nível necessário.`;
   html+=`<div class="entry skill-roster-card"><div class="entry-top"><div class="entry-icon purple">${SKILL_ICONS[D.skills.indexOf(sk)]||'✦'}</div><div class="entry-main"><button type="button" class="skill-card-title" data-action="skillFocus" data-id="${esc(sk.id)}">${esc(sk.name)} <span>↗</span></button><div class="entry-sub">${esc(summary+' · '+(equipped?'EQUIPADA':unlocked?'DISPONÍVEL':'BLOQUEADA · Nv '+sk.unlock))}</div></div></div><div class="description">${esc(info)}</div><div class="entry-action">${button('VER ÁRVORE','skillFocus',sk.id,'',skillFocus===sk.id?'green':'muted')} ${unlocked?button(equipped?'REMOVER':'EQUIPAR','skillEquip',sk.id,'',equipped?'muted':'green'):`<span class="skill-unlock-label">🔒 DESBLOQUEIA NO NÍVEL ${sk.unlock}</span>`} ${button('REMOVER TODOS OS PONTOS','talentReset',sk.id,'','muted')}</div></div>`;
  }
 }
 return html;
}
function skillTreePanel(){
 // R60: árvore contínua; IDs, custos, ranks, efeitos e pré-requisitos da R57/R59 permanecem intocados.
 const current=TALENT_CLASS_LAYOUT[skillClass]||TALENT_CLASS_LAYOUT.physical;
 const skills=current.branches.map(id=>D.skills.find(s=>s.id===id));
 const available=Math.max(0,g.talentPoints-g.talentSpent);
 let selectedSkill=D.skills.find(s=>s.nodes.some(n=>n.id===treeSelectedNode));
 if(!selectedSkill||selectedSkill.kind!==skillClass){selectedSkill=skills[0];treeSelectedNode=selectedSkill.nodes[0].id;}
 const selected=selectedSkill.nodes.find(n=>n.id===treeSelectedNode)||selectedSkill.nodes[0];
 const selectedReq=talentRequirements(selectedSkill,selected),unlock=talentUnlockLevel(selectedSkill,selected);
 const spentTotal=skills.reduce((v,s)=>v+investedInTree(s.id),0);
 let html='<div class="vf60-toolbar">'+button('← VOLTAR ÀS HABILIDADES','skillBack','','','muted')+'<span>✥ CÓDICE DOS JURAMENTOS</span></div>';
 html+='<header class="vf60-heading"><span class="vf60-seal">✥</span><div><small>O PODER ESCOLHIDO PELO CAVALEIRO</small><h3>Árvore de Talentos</h3><p>Todos os caminhos permanecem visíveis. Percorra a árvore, escolha um talento e invista seus pontos.</p></div></header>';
 html+='<div class="vf-tree-tabs vf60-tabs" role="tablist" aria-label="Afinidades">'+Object.entries(TALENT_CLASS_LAYOUT).map(([id,cl])=>`<button type="button" role="tab" aria-selected="${id===skillClass}" class="vf-tree-tab ${id===skillClass?'active':''} vf-tree-${id}" data-action="treeClass" data-id="${id}"><span>${cl.icon}</span>${cl.name.toUpperCase()}</button>`).join('')+'</div>';
 html+=`<div class="vf60-resource"><div><b>${available}</b><span>PONTOS DISPONÍVEIS</span></div><div><b>${spentTotal}</b><span>INVESTIDOS EM ${current.name.toUpperCase()}</span></div><p>${esc(current.subtitle)} · Selecione um talento para conferir os requisitos e o próximo rank.</p></div>`;
 html+=`<div class="vf60-workspace vf-tree-${skillClass}"><div class="vf60-arbor"><div class="vf60-tree-crown"><span class="vf60-crown-icon">${current.icon}</span><strong>${current.name.toUpperCase()}</strong><small>TRÊS CAMINHOS · UM JURAMENTO</small></div><div class="vf60-branches">`;
 for(let col=0;col<3;col++){
  const sk=skills[col],center=col===1,spent=investedInTree(sk.id);
  html+=`<section class="vf60-branch ${center?'support':''}" aria-label="Trilha ${esc(sk.name)}"><header class="vf60-branch-head"><div class="vf60-branch-icon">${center?'◆':SKILL_ICONS[D.skills.indexOf(sk)]||'✦'}</div><strong>${esc(sk.name)}</strong><small>${center?esc(current.gold)+' · SUPORTE':'OFENSIVA'} · ${spent} PT</small></header>`;
  for(let tier=1;tier<=5;tier++){
   const nodes=sk.nodes.filter(n=>n.tier===tier),taken=nodes.filter(n=>(g.talents[n.id]||0)>0).length;
   const tierNames=['ORIGEM','ASCENSÃO','DISCIPLINA','DOMÍNIO','ESPECIALIZAÇÃO'];
   html+=`<div class="vf60-rung ${tier===5?'last':''}"><div class="vf60-rung-head"><span>GRAU ${['I','II','III','IV','V'][tier-1]} · ${tierNames[tier-1]}</span><span>${taken}/${nodes.length}</span></div><div class="vf60-rung-nodes ${nodes.length===3?'triple':''}">`;
   for(const node of nodes){
    const req=talentRequirements(sk,node),maxed=req.rank>=node.ranks,isFinal=node===sk.nodes.at(-1);
    const ready=g.knightLevel>=talentUnlockLevel(sk,node)&&req.canBuy;
    const state=req.rank>0?'invested':ready?'ready':'locked';
    const symbol=node.goldStarter?'◆':isFinal?'✹':node.stat.includes('gold')?'◈':node.stat.includes('mana')?'✦':node.stat.includes('crit')?'✧':node.stat.includes('duration')?'◷':node.stat.includes('radius')?'◎':node.stat.includes('cooldown')?'⌛':node.stat.includes('power')?'⚔':'✣';
    html+=`<button type="button" data-action="treeSelect" data-id="${esc(node.id)}" class="vf60-node vf-tree-node ${state} ${node.id===treeSelectedNode?'selected':''} ${isFinal?'final':''} ${maxed?'maxed':''} ${node.goldStarter?'gold-node':''}" title="${esc(node.name)} · ${esc(sk.name)} · ${req.rank}/${node.ranks}" aria-pressed="${node.id===treeSelectedNode}" aria-label="${esc(node.name)}, rank ${req.rank} de ${node.ranks}"><span class="vf60-node-icon">${symbol}</span><span class="vf60-node-name">${esc(node.name)}</span><span class="vf60-node-rank">${req.rank}/${node.ranks}</span></button>`;
   }
   html+='</div></div>';
  }
  html+='<div class="vf60-branch-base">✦ FIM DA TRILHA ✦</div></section>';
 }
 html+='</div><div class="vf60-tree-bottom">✦ A força nasce da escolha. O juramento permanece. ✦</div></div>';
 const cost=selectedReq.cost,missing=Math.max(0,selectedReq.threshold-selectedReq.spent),rank=selectedReq.rank;
 const blockers=[];
 if(g.knightLevel<unlock)blockers.push('Cavaleiro nível '+unlock);
 if(missing)blockers.push('Mais '+missing+' pontos nesta trilha');
 if(!selectedReq.parentOK)blockers.push('Evolua o pré-requisito anterior');
 if(!selectedReq.allPrevious)blockers.push('Invista nos talentos anteriores');
 if(available<cost)blockers.push('Faltam '+(cost-available)+' pontos');
 const raw=selected.value||0;
 const currentEffect=selected.goldStarter?goldBranchMultiplier(selectedSkill.id,selected.stat):null;
 const nextEffect=selected.goldStarter?Math.pow(1.34,Math.min(5,rank+1)):null;
 const summary=selected.goldStarter?`Ouro da especialização: ×${currentEffect.toFixed(2)}${rank<selected.ranks?' → ×'+nextEffect.toFixed(2):''}. Apenas ${current.gold}.`:`Bônus acumulado deste talento: ${(raw*rank*100).toFixed(1)}% · Próximo rank: +${(raw*100).toFixed(1)}% (${selected.stat.replaceAll('_',' ')}).`;
 html+=`<aside class="vf60-detail" aria-live="polite"><div class="vf60-detail-eyebrow">${selected.goldStarter?'ESPECIALIZAÇÃO DE OURO':selected===selectedSkill.nodes.at(-1)?'TALENTO FINAL':'TALENTO'} · ${esc(selectedSkill.name)}</div><div class="vf60-detail-icon">${selected.goldStarter?'◆':selected===selectedSkill.nodes.at(-1)?'✹':'✦'}</div><h3>${esc(selected.name)}</h3><div class="vf60-rank-status">NÍVEL ${rank} / ${selected.ranks}</div><p>${esc(selected.description||'Fortalece os atributos do cavaleiro.')}</p><div class="vf60-effect">${esc(summary)}</div><div class="vf60-condition">${rank>=selected.ranks?'✓ TALENTO MAXIMIZADO':blockers.length?'REQUISITOS · '+esc(blockers.join(' · ')):'✓ DISPONÍVEL PARA EVOLUIR'}</div><div class="vf60-detail-cost">Próximo investimento: <strong>${cost} pontos</strong></div><div class="vf60-detail-actions">${selectedReq.canBuy&&g.knightLevel>=unlock?button('INVESTIR '+cost+' PT','talent',selected.id,'','green'):''}${rank>0?button('−1 PONTO','talentRemove',selected.id,'','muted'):''}</div><div class="vf60-detail-bottom"><small>As conexões indicam o caminho. Níveis, pontos e requisitos são exatamente os da R57.</small>${button('REDEFINIR '+current.name.toUpperCase(),'talentResetClass',skillClass,'','muted')}</div></aside></div>`;
 return html;
}
// R69: active abilities are unlocked by knight level and developed exclusively through the passive atlas.
// Revisão 24: compra em lote e compras por orçamento, sem custo linear por clique.
const ART_BUY_MODES=[{id:'n1',label:'1×'},{id:'n10',label:'10×'},{id:'n100',label:'100×'},{id:'n1000',label:'1.000×'},
 {id:'p1',label:'1%'},{id:'p5',label:'5%'},{id:'p25',label:'25%'},{id:'p100',label:'100%'}];
function normalizeArtifactFavorites(ids){
 const existing=new Set(D.artifacts.map(a=>a.id));
 return Array.isArray(ids)?[...new Set(ids.filter(id=>typeof id==='string'&&existing.has(id)))]:[];
}
// All capped relics remain visible/favoritable, but are no longer purchasable.
function artifactAtMax(a){return !!a?.maxLevel&&(g.artifactLevels[a.id]||0)>=a.maxLevel}
function artifactMaxButton(){return '<button type="button" class="gamebtn artifact-max-button" disabled aria-disabled="true" title="Este artefato atingiu seu nível máximo">✓ NÍVEL MÁXIMO</button>'}
function artMode(){return ART_BUY_MODES.find(x=>x.id===artifactBuyMode)||ART_BUY_MODES[0]}
function artModeCount(mode=artifactBuyMode){return mode.startsWith('n')?Math.max(1,parseInt(mode.slice(1),10)||1):null}
function artModePercent(mode=artifactBuyMode){return mode.startsWith('p')?Math.max(0,Math.min(100,parseInt(mode.slice(1),10)||0)):null}
// R45 — Preços revisados. O ID/posição no catálogo não determina mais o custo.
// Artefatos especiais (máximo 80) custam mais, pois seu efeito é forte e limitado.
// O preço é crescente, mas o primeiro upgrade custa POUCAS relíquias, não milhares.
function artifactPriceCurve(x){
 const capped=!!x.maxLevel;
 const strength=clamp(((Number(x.power)||.024)-.024)/.048,0,1);
 const base=(capped?4.2:1.45)+strength*(capped?1.0:1.15);
 const originalExponent=Number(x.cost_exponent)||1.55;
 const exponent=capped?1.42:clamp(originalExponent*.82,1.12,1.43);
 return {base,exponent};
}
function artUpgradeCost(x,lv){
 if(x.maxLevel&&lv>=x.maxLevel)return Big.pow10(9999);
 const {base,exponent}=artifactPriceCurve(x);
 return B(base).mul(Big.power(Math.max(1,lv+1),exponent))
   .mul(Big.power(1.0043,Math.max(0,lv-250)));
}
function artifactDiscoverCost(n){return B(12).mul(Big.power(1.86,n))}
// Curva híbrida: custo marginal polinomial inicial (à la TT2), com uma
// inflação muito suave depois do nível 250 para compatibilizar um jogo de
// prestígio com fases praticamente infinitas. Os lotes grandes usam a cauda
// exata e um limite superior para a parte antiga (sem upgrades gratuitos).
// Lote e compra unitária compartilham EXATAMENTE a mesma função de preço.
function artifactLotCost(x,lv,count,ignoreCap=false){
 count=Math.max(0,Math.floor(count));if(!count)return B(0);
 if(!ignoreCap&&x.maxLevel)count=Math.min(count,Math.max(0,x.maxLevel-lv));
 if(!count)return B(0);
 const n=Math.min(count,1300),skipped=count-n;
 let amount=B(0);
 for(let i=skipped;i<count;i++)amount=amount.add(ignoreCap&&x.maxLevel&&lv+i>=x.maxLevel?artUpgradeCost(x,x.maxLevel-1):artUpgradeCost(x,lv+i));
 if(skipped){
  // Upper Riemann bound: earlier ranks never cost more than the next rank.
  amount=amount.add(artUpgradeCost(x,ignoreCap&&x.maxLevel?Math.min(x.maxLevel-1,lv+skipped-1):lv+skipped-1).mul(skipped));
 }
 return amount;
}
// R94: cotação pura de compra. A mesma regra decide a prévia e a compra real.
// O cálculo respeita orçamento, saldo, limites e a curva existente de preço.
function artifactPurchasePlan(x,budget,limit=1000000){
 const before=Math.max(0,Math.floor(Number(g.artifactLevels?.[x?.id])||0));
 const empty={levels:0,cost:B(0),before,after:before};
 if(!x||before<1||(x.maxLevel&&before>=x.maxLevel))return empty;
 limit=Math.min(1000000,Math.max(0,Math.floor(Number(limit)||0)));
 if(x.maxLevel)limit=Math.min(limit,x.maxLevel-before);
 if(limit<1)return empty;
 budget=B(budget);if(budget.m<=0||relics.m<=0)return empty;
 if(budget.cmp(relics)>0)budget=B(relics);
 if(artUpgradeCost(x,before).cmp(budget)>0)return empty;
 let lo=0,hi=1;
 while(hi<limit&&artifactLotCost(x,before,hi).cmp(budget)<=0){lo=hi;hi=Math.min(limit,hi*2)}
 if(hi===limit&&artifactLotCost(x,before,hi).cmp(budget)<=0)lo=hi;
 else while(lo+1<hi){const mid=Math.floor((lo+hi)/2);
  if(artifactLotCost(x,before,mid).cmp(budget)<=0)lo=mid;
  else hi=mid;
 }
 if(lo===0&&artifactLotCost(x,before,1).cmp(budget)<=0)lo=1;
 if(lo<1)return empty;
 return {levels:lo,cost:artifactLotCost(x,before,lo),before,after:before+lo};
}
// A compra debita a cotação exata daquele instante, nunca uma estimativa visual.
function buyArtifactBudget(x,budget,limit=1000000){
 const plan=artifactPurchasePlan(x,budget,limit);
 if(!plan.levels||!spendRelics(plan.cost))return {levels:0,cost:B(0)};
 g.artifactLevels[x.id]=plan.after;
 if(trialTelemetry&&endgameTrial&&trialScenario==='real')trialTelemetry.artifactLevelsBought+=plan.levels;
 return {levels:plan.levels,cost:plan.cost};
}
function artifactCurrentPurchasePlan(x){
 const count=artModeCount(),percent=artModePercent();
 return artifactPurchasePlan(x,count===null?relics.mul(percent/100):relics,count===null?1000000:count);
}

function artifactUpgradeOne(id){
 const x=D.artifacts.find(a=>a.id===id);
 if(!x||(g.artifactLevels[id]||0)<1)return {levels:0,cost:B(0)};
 if(artifactAtMax(x)){alertGame(x.name+' já está no NÍVEL MÁXIMO.');return {levels:0,cost:B(0)}}
 const n=artModeCount(),percent=artModePercent();
 const budget=n===null?relics.mul(percent/100):relics;
 const result=buyArtifactBudget(x,budget,n===null?1000000:n);
 if(result.levels===0)alertGame('Relíquias insuficientes para comprar nesta modalidade.');
 else if(result.levels>1)feed(x.name+': +'+result.levels.toLocaleString('pt-BR')+' níveis');
 return result;
}
function artifactUpgradeFavorites(){
 const selected=normalizeArtifactFavorites(g.artifactFavorites).map(id=>D.artifacts.find(a=>a.id===id)).filter(x=>x&&(g.artifactLevels[x.id]||0)>0);
 if(selected.length===0){alertGame('Favorite ao menos um artefato descoberto (★).');return {levels:0,cost:B(0)}}
 const favorites=selected.filter(x=>!artifactAtMax(x));
 if(favorites.length===0){alertGame('Todos os artefatos favoritos já estão no NÍVEL MÁXIMO.');return {levels:0,cost:B(0)}}
 let levels=0,spent=B(0);
 const n=artModeCount();
 if(n!==null){
  // R94: rodadas justas. Cada favorito recebe no máximo um nível por rodada,
  // antes de um favorito receber outro. Não favorecer a ordem da lista quando
  // o orçamento não chega para todos (até 1.000 rodadas, sem mudar os preços).
  const fullCost=favorites.reduce((sum,x)=>sum.add(artifactLotCost(x,g.artifactLevels[x.id]||0,n)),B(0));
  if(relics.cmp(fullCost)>=0){
   // Tudo cabe no saldo: compras em lote equivalentes, evitando milhares de cliques simulados.
   for(const x of favorites){const r=buyArtifactBudget(x,relics,n);levels+=r.levels;spent=spent.add(r.cost)}
  }else for(let round=0;round<n;round++){
   let purchased=false;
   for(const x of favorites){
    if(artifactAtMax(x)||artUpgradeCost(x,g.artifactLevels[x.id]).cmp(relics)>0)continue;
    const r=buyArtifactBudget(x,relics,1);
    if(r.levels){levels+=r.levels;spent=spent.add(r.cost);purchased=true}
   }
   if(!purchased)break;
  }
 }else{
  // Spend an initial EQUAL RELIC BUDGET on each favorite, then reallocate
  // leftovers to favorites still able to purchase levels. Do not divide
  // levels equally, because individual upgrade costs can vary immensely.
  let left=relics.mul(artModePercent()/100);
  for(let pass=0;pass<16&&left.m>0;pass++){
   const affordable=favorites.filter(x=>!artifactAtMax(x)&&artUpgradeCost(x,g.artifactLevels[x.id]).cmp(left)<=0);
   if(!affordable.length)break;
   const allowance=left.div(affordable.length);
   let roundSpent=B(0);
   for(const x of affordable){
    const r=buyArtifactBudget(x,allowance,1000000);
    levels+=r.levels;spent=spent.add(r.cost);roundSpent=roundSpent.add(r.cost);
   }
   left=left.sub(roundSpent);
   if(roundSpent.m===0){
    // A discrete next-level price can exceed the equal share. Spend the
    // residue on the cheapest affordable upgrade, without overspending.
    const eligible=affordable.filter(x=>!artifactAtMax(x)&&artUpgradeCost(x,g.artifactLevels[x.id]).cmp(left)<=0)
      .sort((a,b)=>artUpgradeCost(a,g.artifactLevels[a.id]).cmp(artUpgradeCost(b,g.artifactLevels[b.id])));
    if(!eligible.length)break;
    const r=buyArtifactBudget(eligible[0],left,1);
    levels+=r.levels;spent=spent.add(r.cost);left=left.sub(r.cost);
    if(!r.levels)break;
   }
  }
 }
 if(levels>0){alertGame('★ '+levels.toLocaleString('pt-BR')+' níveis entre '+favorites.length+' favoritos · '+spent.fmt()+' relíquias investidas.');save(g.slot,true)}
 else alertGame('Nenhum favorito pode ser aprimorado com as relíquias disponíveis.');
 return {levels,cost:spent};
}
function artifactsPanel(){
 const count=artCount(),next=count<D.artifacts.length,cost=artifactDiscoverCost(count),available=artifactCandidatePool(count);
 const discovered=D.artifacts.filter(x=>g.artifactLevels[x.id]>0);
 const selected=artMode(),favoriteIds=new Set(normalizeArtifactFavorites(g.artifactFavorites));
 const favorites=discovered.filter(x=>favoriteIds.has(x.id));
 const eligibleFavorites=favorites.filter(x=>!artifactAtMax(x));
 const completed=discovered.filter(x=>artifactAtMax(x)).length;
 const quoted=discovered.find(x=>x.id===artifactQuoteId&&!artifactAtMax(x));
 const quote=quoted?artifactCurrentPurchasePlan(quoted):null;
 let intro=`${sectionTitle('Ecos do passado')}<div class="stat-grid">${statTile('Artefatos descobertos',count+' / '+D.artifacts.length)}${statTile('Relíquias disponíveis',relics.fmt())}${statTile('Dano de todos os artefatos','+'+compactPercent(artifactAllDamagePercent()))}${statTile('Favoritos',favorites.length)}</div><div class="hint">Artefatos são permanentes. O Dano de Todos os Artefatos é percentual, soma todas as contribuições e é aplicado uma única vez. Escolha níveis ou percentual das relíquias atuais. Marque ★ para incluir o artefato no botão UPAR FAVORITOS. No modo percentual, o orçamento dos favoritos é distribuído por relíquias; no modo de níveis, a compra ocorre por rodadas para distribuir os níveis antes de repetir um favorito.</div>`;
 if(next){
  const firstLabels=['Dano imediato','Economia de ouro','Combate','Sobrevivência'];
  const title=count<4?`DESCOBERTA INICIAL · ${firstLabels[count]}`:count===4?'5ª DESCOBERTA · MEMÓRIA DO RETORNO':'DESCOBERTA ALEATÓRIA';
  const detail=count<4?'Recompensa sorteada entre melhorias que funcionam desde o início.':count===4?'Memória do Retorno garantida: mais relíquias nos próximos prestígios.':count<12?'Prioridade para bônus universais. Artefatos de habilidades bloqueadas não aparecem.':'Artefatos de habilidades só podem ser descobertos após o nível necessário. Memória do Retorno é o único artefato que aumenta Relíquias.';
  intro+=entry('✧',title,`${count+1}ª descoberta · sem duplicatas`,detail,available.length?button('DESCOBRIR · '+cost.fmt()+' relíquias','discover'):'<span class="skill-unlock-label">Aguarde desbloquear mais habilidades para descobrir artefatos.</span>');
 }
 intro+=`${sectionTitle('Comprar melhorias')}<div class="button-row artifact-mode-controls">${ART_BUY_MODES.map(m=>button(m.label,'artBuyMode',m.id,'',selected.id===m.id?'green':'muted')).join('')}</div><div class="hint">Modo: <b>${selected.label}</b> · ${selected.id.startsWith('p')?'até '+selected.label+' do saldo no momento do clique':'até '+selected.label+' níveis por artefato'}. O saldo não gasto permanece com você.</div>`;
 intro+=`<div class="artifact-favorites-bar">${eligibleFavorites.length?button('★ UPAR FAVORITOS · '+eligibleFavorites.length+' disponíveis','artFavoritesUpgrade','','','green'):'<button type="button" class="gamebtn artifact-max-button" data-action="artFavoritesUpgrade" disabled aria-disabled="true">'+(favorites.length?'✓ FAVORITOS NO NÍVEL MÁXIMO':'☆ SELECIONE FAVORITOS')+'</button>'}<span>${completed} artefato(s) concluído(s). Os favoritos no nível máximo não consomem relíquias.</span></div>${sectionTitle('Coleção de artefatos')}`;
 const ART_GROUP_ORDER=['Prestígio e Relíquias','Combate e Habilidades','Ouro e Descobertas','Defesa e Sobrevivência','Outros Bônus'];
 // Prioridade absoluta: Memória do Retorno, depois favoritos, depois categorias.
 // MAXIMIZADOS sempre no final, mesmo se favoritados; continuam visíveis.
 const list=discovered.sort((a,b)=>
    Number(artifactAtMax(a))-Number(artifactAtMax(b)) ||
    (a.id===GUARANTEED_RELIC_ARTIFACT?-1:b.id===GUARANTEED_RELIC_ARTIFACT?1:0) ||
    Number(favoriteIds.has(b.id))-Number(favoriteIds.has(a.id)) ||
    ART_GROUP_ORDER.indexOf(a.group)-ART_GROUP_ORDER.indexOf(b.group) ||
    a.name.localeCompare(b.name,'pt-BR')
  ).map((x,index,all)=>{
  const lv=g.artifactLevels[x.id],preview=artifactPreview(x,lv),fav=favoriteIds.has(x.id);
  const maxed=artifactAtMax(x);
  const desc=maxed?`EFEITO ATUAL: ${x.effect==='fairy_count'?preview.before+' fadas':effectValue(x.effect,preview.before)}. Nível máximo atingido (${lv}/${x.maxLevel}); melhorias encerradas. ${x.lore}`:`EFEITO: ${x.effect==='fairy_count'?preview.before+' → '+preview.after+' fadas':effectValue(x.effect,preview.before)+' → '+effectValue(x.effect,preview.after)}. Próximo nível: ${artUpgradeCost(x,lv).fmt()} relíquias. ${x.lore}`;
  const aadInfo=` Dano de Todos os Artefatos: +${compactPercent(artifactIndividualDamagePercent(lv))}${maxed?'':` → +${compactPercent(artifactIndividualDamagePercent(lv+1))}`}.`;
  const actions=button(fav?'★ FAVORITO':'☆ FAVORITAR','artFavorite',x.id,'',fav?'green':'muted')+
    (maxed?artifactMaxButton():button(artifactQuoteId===x.id?'✓ PRÉVIA ABERTA':'VER CUSTO','artQuote',x.id,'','muted')+button('ELEVAR · '+selected.label,'artUpgrade',x.id,'','purple'));
  const quoteText=quoted?.id===x.id?` PRÉVIA SEM COMPRA (${selected.label}): ${quote.levels?`Nível ${quote.before.toLocaleString('pt-BR')} → ${quote.after.toLocaleString('pt-BR')} (+${quote.levels.toLocaleString('pt-BR')}). Custo ${quote.cost.fmt()} relíquias; saldo depois ${relics.sub(quote.cost).fmt()}.`:`Sem saldo para o próximo nível (custo ${artUpgradeCost(x,quote.before).fmt()}).`} Não altera o save.`:'';
  return `${index===0||all[index-1].group!==x.group||artifactAtMax(all[index-1])!==maxed?`<div class="artifact-group-heading">${maxed?'✓ NÍVEL MÁXIMO · ':''}${esc(x.group)}</div>`:''}${entry(fav?'★':'✧',x.name,`${x.group} · Nv ${lv}${x.maxLevel?' / '+x.maxLevel:''} · ${effectLabel(x.effect)}`,desc+aadInfo+quoteText,actions,'purple')}`;
 }).join('');
 return intro+(list||'<div class="empty">Sua coleção ainda está vazia. Descubra o primeiro artefato após o prestígio.</div>');
}
// R62 — Somente laboratórios isolados: todas as árvores passivas no nível máximo.
// O ×100 da campanha NÃO é um laboratório isolado e não deve ganhar pontos.
function maximizeTestPassives(){
 if(!testMode)return false;
 const levels={};
 for(const skill of D.skills){
  for(const node of skill.nodes){levels[node.id]=node.ranks||5;}
 }
 g.talents=levels;
 g.talentSpent=D.skills.reduce((sum,skill)=>sum+talentSpentForLevels(skill,levels),0);
 // Pontos livres não precisam ser infinitos: todos os ranks já estão comprados.
 g.talentPoints=g.talentSpent;
 g.talentTreeVersion=TREE_SP_VERSION;
 uiDirty=true;
 return true;
}
function testPassiveSummary(){
 const nodes=D.skills.flatMap(skill=>skill.nodes);
 return {testMode,complete:nodes.every(n=>(g.talents[n.id]||0)===(n.ranks||5)),
  maxed:nodes.filter(n=>(g.talents[n.id]||0)===(n.ranks||5)).length,
  total:nodes.length,spent:g.talentSpent,points:g.talentPoints};
}
// Test laboratory: completely volatile and isolated from persistent save slots.
// Main progress (including wallets and all collections) is restored on exit.
function labSnapshot(){return {state:JSON.parse(JSON.stringify(g)),gold:gold.save(),xp:xp.save(),relics:relics.save(),totalRelics:totalRelics.save(),goldEarned:goldEarned.save()}}
function labRestoreState(snap){
 g=JSON.parse(JSON.stringify(snap.state));gold=B(snap.gold);xp=B(snap.xp);
 relics=B(snap.relics);totalRelics=B(snap.totalRelics);goldEarned=B(snap.goldEarned);
}
function enterHeroLab(level){
 if(endgameTrial){alertGame('Saia do teste 23.999 antes de abrir o laboratório de heróis.');return}
 if(![20,1000,8000].includes(level))return;
 if(!testMode){labBackup=labSnapshot();testMode=true;}
 labRestoreState(labBackup);labLevel=level;
 maximizeTestPassives();
 const ids=['warrior','faith','magic'].map(kind=>orderedHeroes().find(h=>classOfHero(h.id)===kind)?.id).filter(Boolean);
 for(const id of ids)g.heroLevels[id]=level;
 g.difficulty=0;g.knightLevel=600;g.speed=1;g.auto=false;
 // R49: laboratório usa o dano REAL do cavaleiro, não o antigo índice ilustrativo.
 const logValue=Math.max(damage().log10(),faithDamage().log10(),magicDamage().log10());
 let lo=1,hi=24000; while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(enemyHealth(mid,0).log10()<=logValue-Math.log10(30))lo=mid;else hi=mid-1;} const suggested=lo;
 g.stage=Math.max(1,suggested);g.highest[0]=Math.max(g.highest[0]||1,g.stage);
 g.stageHold=true;g.stageKills=0;g.runPeak=g.stage;
 initialise();player.contactInvuln=1e8;
 alertGame('LABORATÓRIO: heróis Nv '+level+' · TODAS as passivas no máximo · save NÃO alterado.');
 selectTab('heroes');
}
function exitHeroLab(){
 if(!testMode||!labBackup)return;
 labRestoreState(labBackup);testMode=false;labBackup=null;
 initialise();selectTab('heroes');$('#combat-msg').textContent='Laboratório encerrado — seu progresso original foi restaurado.';
}
// R82: laboratory-only progression telemetry, never part of a campaign save.
// R80: All diagnostic data lives outside the campaign state and is never persisted.
// These data are descriptive, not a substitute for observing a naturally reached endgame.
function trialTelemetryStats(){
 return {level:g.knightLevel,stage:g.stage,world:g.difficulty+1,
  maxHealthLog10:Math.log10(Math.max(1,maxHealth())),
  physicalLog10:damage().log10(),faithLog10:faithDamage().log10(),magicLog10:magicDamage().log10(),
  enemyHealthLog10:enemyHealth().log10(),
  artifactsOwned:Object.values(g.artifactLevels||{}).filter(x=>x>0).length,
  heroCount:Object.values(g.heroLevels||{}).filter(x=>x>0).length,
  equippedSkillIds:[...(g.equippedSkills||[])].filter(Boolean),
  knightPrestiges:g.knightPrestiges};
}
function trialTelemetryLog10(x){const n=B(x).log10();return Number.isFinite(n)?+n.toFixed(4):null;}
function trialTelemetryOnRelicSpent(cost){
 if(trialTelemetry&&endgameTrial&&trialScenario==='real')trialTelemetry.relicsSpent=trialTelemetry.relicsSpent.add(cost);
}
function trialTelemetryOnPrestige(reward,peakStage,returnStage,nextThreshold){
 const t=trialTelemetry;
 if(!t||!endgameTrial||trialScenario!=='real')return;
 const elapsed=Math.max(0,g.totalTime-t.start.time);
 t.prestigesObserved++;
 t.relicsAwarded=t.relicsAwarded.add(reward);
 if(t.prestigeEvents.length>=200)return;
 t.prestigeEvents.push({atSec:+elapsed.toFixed(2),world:g.difficulty+1,
  peakStage,returnStage,nextThreshold,
  rewardLog10:trialTelemetryLog10(reward),walletAfterLog10:trialTelemetryLog10(relics),
  totalRelicsAfterLog10:trialTelemetryLog10(totalRelics),
  artifactCount:Object.values(g.artifactLevels||{}).filter(x=>x>0).length,
  artifactLevelsBoughtSinceStart:t.artifactLevelsBought,prestigeNumber:g.knightPrestiges});
}
function trialTelemetryCreate(){
 return {schema:'veilfall-lab-r82-v1',mode:'SAVE_REAL_SEM_BONUS',revision:'R82',
  simulation:{speedAtStart:g.speed,autoHeroes:!!g.autoHeroes,autoRetreat:!!g.autoRetreat},
  start:{time:g.totalTime,stage:g.stage,world:g.difficulty+1,kills:g.kills,deaths:g.deaths,prestiges:g.knightPrestiges,damageTaken:g.damageTaken||0,relicsLog10:relics.log10(),totalRelicsLog10:totalRelics.log10(),stats:trialTelemetryStats()},
  last:{stage:g.stage,world:g.difficulty+1,deaths:g.deaths,prestiges:g.knightPrestiges},
  highestStage:g.stage,stageAdvances:0,retreats:0,bossDefeats:0,bossTimeSum:0,
  completedBosses:[],stageEvents:[],samples:[],nextSampleAt:0,
  prestigeEvents:[],prestigesObserved:0,relicsAwarded:B(0),relicsSpent:B(0),
  artifactLevelsBought:0,artifactDiscoveries:0};
}
function trialTelemetryOnKill(e){
 if(!trialTelemetry||!endgameTrial||trialScenario!=='real'||e.kind!=='boss')return;
 const t=trialTelemetry;
 const seconds=Math.max(0,Number(e.bossAge)||0);
 t.bossDefeats++;t.bossTimeSum+=seconds;
 if(t.completedBosses.length<500)t.completedBosses.push({
  atSec:+Math.max(0,g.totalTime-t.start.time).toFixed(2),world:e.diff+1,stage:e.stage,
  type:e.bossType||'boss',durationSec:+seconds.toFixed(2),
  enemyHealthLog10:e.max.log10()});
}
function trialTelemetryTick(){
 const t=trialTelemetry;
 if(!t||!endgameTrial||trialScenario!=='real')return;
 const elapsed=Math.max(0,g.totalTime-t.start.time);
 if(t.last.world!==g.difficulty+1||t.last.stage!==g.stage){
  if(t.last.world===g.difficulty+1&&g.stage>t.last.stage)t.stageAdvances+=g.stage-t.last.stage;
  else if(t.last.world===g.difficulty+1&&g.stage<t.last.stage)t.retreats++;
  if(t.stageEvents.length<1500)t.stageEvents.push({atSec:+elapsed.toFixed(2),fromStage:t.last.stage,toStage:g.stage,fromWorld:t.last.world,toWorld:g.difficulty+1});
  t.last.stage=g.stage;t.last.world=g.difficulty+1;
 }
 t.highestStage=Math.max(t.highestStage,g.stage);
 t.last.deaths=g.deaths;t.last.prestiges=g.knightPrestiges;
 if(elapsed>=t.nextSampleAt&&t.samples.length<1000){
  const stats=trialTelemetryStats();
  t.samples.push({atSec:+elapsed.toFixed(2),world:stats.world,stage:stats.stage,
   kills:g.kills-t.start.kills,deaths:g.deaths-t.start.deaths,
   prestiges:g.knightPrestiges-t.start.prestiges,
   bossDefeats:t.bossDefeats,physicalLog10:stats.physicalLog10,
   faithLog10:stats.faithLog10,magicLog10:stats.magicLog10,
   enemyHealthLog10:stats.enemyHealthLog10,maxHealthLog10:stats.maxHealthLog10,
   prestigeRewardsLog10:trialTelemetryLog10(t.relicsAwarded),
   relicSpentLog10:trialTelemetryLog10(t.relicsSpent),
   artifactCount:stats.artifactsOwned,artifactLevelsBought:t.artifactLevelsBought});
  t.nextSampleAt=elapsed+(elapsed<600?15:60);
 }
}
function trialTelemetryData(){
 const t=trialTelemetry;
 if(!t||!endgameTrial||trialScenario!=='real')return null;
 const elapsed=Math.max(0,g.totalTime-t.start.time);
 const report={schema:t.schema,revision:t.revision,mode:t.mode,
  notes:['Usa o save carregado, sem teleporte, sem bônus de QA e com guardiões.',
   'O tempo é simulado. A amostra representa somente a build e a estratégia desta sessão.',
   'O diagnóstico não inclui o save completo, identificação pessoal, inventário ou moedas brutas.'],
  simulation:t.simulation,initial:{world:t.start.world,stage:t.start.stage,stats:t.start.stats},
  final:{world:g.difficulty+1,stage:g.stage,stats:trialTelemetryStats()},
  results:{elapsedSeconds:+elapsed.toFixed(2),highestStage:t.highestStage,stageAdvances:t.stageAdvances,
   retreats:t.retreats,kills:g.kills-t.start.kills,deaths:g.deaths-t.start.deaths,
   prestiges:g.knightPrestiges-t.start.prestiges,bossDefeats:t.bossDefeats,
   averageBossSeconds:t.bossDefeats?+(t.bossTimeSum/t.bossDefeats).toFixed(2):null,
   killsPerMinute:elapsed?+((g.kills-t.start.kills)*60/elapsed).toFixed(2):0,
   totalDamageTaken:g.damageTaken>=t.start.damageTaken?g.damageTaken-t.start.damageTaken:null,
   relicsLog10:relics.log10(),totalRelicsLog10:totalRelics.log10()},
  economy:{prestigesObserved:t.prestigesObserved,eventsTruncated:t.prestigesObserved>t.prestigeEvents.length,
   relicsAwardedLog10:trialTelemetryLog10(t.relicsAwarded),
   relicsSpentLog10:trialTelemetryLog10(t.relicsSpent),
   artifactLevelsBought:t.artifactLevelsBought,artifactDiscoveries:t.artifactDiscoveries,
   artifactCountStart:t.start.stats.artifactsOwned,
   artifactCountEnd:Object.values(g.artifactLevels||{}).filter(x=>x>0).length},
  prestigeEvents:t.prestigeEvents,bossEvents:t.completedBosses,stageEvents:t.stageEvents,samples:t.samples};
 report.analysis=VEIL_TELEMETRY_ANALYSIS.analyze(report);
 return report;
}
function exportTrialTelemetry(){
 const data=trialTelemetryData();
 if(!data){alertGame('Entre primeiro em TESTAR MINHA BUILD.');return false;}
 try{
  const json=JSON.stringify(data,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download='VEILFALL_R82_TESTE_M'+data.final.world+'_F'+data.initial.stage+'.json';
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  alertGame('Relatório JSON exportado. Compartilhe o arquivo para analisar sua build.');
  return true;
 }catch(e){console.error('exportTrialTelemetry',e);alertGame('Não foi possível exportar o teste neste navegador.');return false;}
}
// Endgame QA scenario, never a progression award. No wallet / stage / collection writes persist.
// The temporary combat coefficient compensates for the known incomplete 24k balance;
// it is deliberately NOT available in ordinary campaign rules.
function startEndgameTrial(scenario='i23999'){
 if(endgameTrial)return false;
 if(testMode){alertGame('Feche primeiro o laboratório de heróis.');return false;}
 const realSave=scenario==='real';
 if(realSave&&!playing){alertGame('Carregue uma campanha para testar com sua própria build.');return false;}
 trialScenario=realSave?'real':scenario==='v24000'?'v24000':'i23999';
 trialTelemetry=null;
 trialWasPlaying=playing;
 labBackup=labSnapshot();testMode=true;endgameTrial=true;
 trialBaseline={stage:g.stage,difficulty:g.difficulty,kills:g.kills,deaths:g.deaths,prestiges:g.knightPrestiges,seconds:g.totalTime};
 trialPower={physical:B(1),faith:B(1),magic:B(1)};
 if(realSave){
  // R79: use the player's actual campaign as-is. No synthetic currencies, levels,
  // talents, items, prestige milestones, or scaling by enemy HP. No teleport.
  // Only unpause fixed farming temporarily to exercise real guardian gates.
  g.stageHold=false;
  initialise();trialTelemetry=trialTelemetryCreate();selectTab('world');
  alertGame('TESTE COM SUA BUILD · fase real '+fmt(g.stage)+' · chefes ativos · nenhum resultado será salvo.');
  return true;
 }
 g=fresh();g.slot=labBackup.state.slot;
 const isRuina=trialScenario==='v24000';
 const sceneStage=isRuina?24000:23999,sceneDifficulty=isRuina?4:0;
 g.difficulty=sceneDifficulty;g.unlocked=isRuina?5:1;g.worldPrestiges=isRuina?4:0;
 g.stage=sceneStage;g.highest=isRuina?[24000,24000,24000,24000,24000]:[23999,0,0,0,0];g.runPeak=sceneStage;g.runStartStage=1;
 g.knightLevel=24000;delete g.training;g.knightPrestiges=80;
 g.stageHold=false;g.stageKills=0;g.speed=1;g.auto=true;g.particles=false;g.attackFocus=isRuina?'closest':'boss';
 g.goldEarned=Big.pow10(900).save();
 maximizeTestPassives();
 g.firstClear=[];for(let stage=249;stage<23999;stage+=250)g.firstClear.push(thresholdKey(stage,sceneDifficulty));
 if(isRuina)g.firstClear.push(thresholdKey(23999,4));
 g.heroLevels=Object.fromEntries(D.heroes.map(h=>[h.id,8000]));
 g.heroTrans=Object.fromEntries(D.heroes.map(h=>[h.id,120]));
 g.heroUpgradeProgress=Object.fromEntries(D.heroes.map(h=>[h.id,8000]));
 g.artifactLevels=Object.fromEntries(D.artifacts.map(a=>[a.id,a.maxLevel||300]));
 g.petLevels=Object.fromEntries(D.pets.map(p=>[p.id,150]));
 g.scrollLevels=Object.fromEntries(D.scrolls.map(sc=>[sc.id,125]));
  g.equippedSkills=isRuina?['shadow','curse','fury','flame_nova']:['grace','curse','flame_nova','fury'];

 for(const set of D.sets)g.setParts[set.id]=[...SLOTS];
 g.autoSellRarities=[];g.village.banknotes=100000;
 gold=Big.pow10(900);relics=Big.pow10(500);totalRelics=relics;xp=B(0);goldEarned=Big.pow10(900);
 // Equip a complete mythical loadout through the normal item factory, which also
 // applies the standard affix/ring validity rules.
 for(const slot of SLOTS){const item=giveGear(sceneStage,sceneDifficulty,null,slot,4);if(item)g.equipped[slot]=item;}
 trialPower={physical:B(1),faith:B(1),magic:B(1)};
 const target=enemyHealth(sceneStage,sceneDifficulty,'normal').mul(isRuina?.90:.80);
 const phy=damage(),holy=faithDamage(),arcane=magicDamage();
 trialPower={physical:target.div(phy),faith:target.div(holy),magic:target.div(arcane)};
 initialise();selectTab(isRuina?'skills':'world');
 alertGame(isRuina?'SIMULAÇÃO V · FASE 24.000: TODAS as passivas maximizadas · AVANÇO AUTOMÁTICO · NADA será salvo.':'TESTE 23.999: TODAS as passivas maximizadas · Guardião de Limiar pendente · NADA será salvo.');
}
function exitEndgameTrial(){
 if(!endgameTrial||!labBackup)return;
 const snap=labBackup,wasPlaying=trialWasPlaying;
 endgameTrial=false;testMode=false;labBackup=null;trialScenario='i23999';trialBaseline=null;trialTelemetry=null;
 const labControls=$('#boss-lab-controls');if(labControls)labControls.classList.add('hidden');
 trialPower={physical:B(1),faith:B(1),magic:B(1)};bossPreviewMode=false;bossWarnings.length=0;bossEmbers.length=0;
 labRestoreState(snap);
 if(wasPlaying){initialise();selectTab('world');}
 else {playing=false;paused=false;enemies=[];queue=[];bossActive=null;
  $('#start-overlay').classList.remove('hidden');$('#footer-status').textContent='TESTE ENCERRADO · CAMPANHA NÃO ALTERADA';}
 $('#combat-msg').textContent='Teste finalizado. O progresso normal foi restaurado.';
}
function trialControls(){
 const activeReal=endgameTrial&&trialScenario==='real';
 const activeV=endgameTrial&&trialScenario==='v24000';
 const desc=activeReal
  ?`Build do save atual, Mundo ${g.difficulty+1}, estágio inicial ${fmt(trialBaseline?.stage||g.stage)}. Níveis, talentos, ouro, equipamentos, relíquias, heróis, pets e pergaminhos são os seus; chefes e guardiões obrigatórios estão ativos. Sem teleporte nem multiplicador oculto de dano.`
  :activeV?'PODER MÁXIMO / ESTRESSE: Mundo V, fase 24.000; recursos artificiais, ataque calibrado pela vida dos inimigos, 320 inimigos de limite e SEM guardiões. Não mede a dificuldade real.'
  :endgameTrial?'PODER MÁXIMO / ESTRESSE: Mundo I, fase 23.999; passivas e recursos artificiais, dano calibrado e guardião de limiar. Não mede a dificuldade real.'
  :'Para avaliar a dificuldade real, use sua build e a fase alcançada no save. Para avaliar a fase 24.000, é necessário um save que tenha chegado lá naturalmente. Os outros dois modos são somente testes artificiais de efeitos/estresse.';
 const diagnostic=activeReal?trialTelemetryData()?.analysis:null;
 const cues=diagnostic?.valid?diagnostic.flags.filter(f=>f.kind==='observation'||f.kind==='insufficient').slice(0,2).map(f=>esc(f.message)).join(' '):'';
 const diagnosis=activeReal&&diagnostic?.valid?`<div class="notice-inline"><b>R82 · DIAGNÓSTICO:</b> ${fmt(diagnostic.summary.bossDefeats)} chefes · ${fmt(diagnostic.summary.stageAdvances)} fases vencidas · ${fmt(diagnostic.summary.deaths)} mortes · mediana dos chefes ${diagnostic.summary.bossMedianSeconds===null?'sem amostra':diagnostic.summary.bossMedianSeconds+'s'} · ${diagnostic.summary.stagesPerTenMinutes} fases por 10 min simulados. ${cues} <b>Não é uma avaliação definitiva do endgame.</b> Exporte o JSON para uma análise detalhada.</div>`:'';
 const eco=diagnostic?.valid&&diagnostic.summary?.prestigeCycles;
 const economy=activeReal&&eco?`<div class="notice-inline"><b>PRESTÍGIO · LABORATÓRIO:</b> ${fmt(eco.observed)} ciclos · artefatos descobertos +${fmt(eco.artifactDiscoveries)} · melhorias compradas +${fmt(eco.artifactLevelsBought)} · relíquias recebidas ${eco.relicsAwardedLog10===null?'nenhuma':`10^${eco.relicsAwardedLog10}`} · investidas ${eco.relicsSpentLog10===null?'nenhuma':`10^${eco.relicsSpentLog10}`}. ${eco.observed<2?'São necessários mais ciclos para avaliar o retorno do prestígio.':''}</div>`:'';
 const metrics=activeReal&&trialBaseline?
  `<div class="notice-inline"><b>MEDIÇÕES DO TESTE · MUNDO ${g.difficulty+1}</b> — Fase inicial ${fmt(trialBaseline.stage)} → ${fmt(g.stage)} · Abates +${fmt(Math.max(0,g.kills-trialBaseline.kills))} · Mortes +${fmt(Math.max(0,g.deaths-trialBaseline.deaths))} · Prestígios +${fmt(Math.max(0,g.knightPrestiges-trialBaseline.prestiges))} · Tempo simulado +${fmt(Math.max(0,Math.floor(g.totalTime-trialBaseline.seconds)))}s.</div>`:'';
 return `<div class="notice-inline"><b>${endgameTrial?(activeReal?'TESTE DE DIFICULDADE · SAVE REAL':'PODER MÁXIMO · QA'):'LABORATÓRIO DE TESTES'}</b> — ${desc} <b>NENHUM PROGRESSO DE TESTE SERÁ SALVO.</b></div>${metrics}${diagnosis}${economy}
 <div class="button-row">${endgameTrial?((activeV?button(g.stageHold?'RETOMAR AVANÇO AUTOMÁTICO':'ATIVAR FARM FIXO','trialFarmToggle','','',g.stageHold?'green':'muted'):'')+(activeReal?button('EXPORTAR RELATÓRIO · JSON','trialExport','','','green'):'')+button('SAIR DO TESTE · RESTAURAR','endgameExit','','','block')):
  button('TESTAR MINHA BUILD · FASE ATUAL','endgameStartReal','','','green')+button('PODER MÁXIMO I · 23.999','endgameStart','','','muted')+button('PODER MÁXIMO V · 24.000 (SEM BOSSES)','endgameStartV','','','purple')}</div>`;
}
function heroesPanel(){
 let h=sectionTitle('Heróis · 32 passivos')+
  '<div class="hint">Os heróis <b>não atacam</b>: todos os bônus fortalecem o cavaleiro. A contribuição de Físico/Fé/Magia cresce com níveis, marcos de potência (10/30/50) e posição do herói (+2,5% por rank na contribuição própria, não sobre os demais bônus). Bônus entre heróis da mesma classe são somados, não multiplicados uns pelos outros. Suporte especial: até +80% por atributo (30% marcos, 10% afixos, 40% relíquias).</div>';
 h+=`<div class="stat-grid">${statTile('Físico',compactMultiplier(heroAttributeBonus('warrior')))}${statTile('Fé',compactMultiplier(heroAttributeBonus('faith')))}${statTile('Magia',compactMultiplier(heroAttributeBonus('magic')))}</div>`;
 const helm=g.equipped?.Capacete;
 if(helm&&HERO_HELMET_CLASS[helm.effect])h+=`<div class="notice-inline"><b>Capacete de ${esc(HERO_CLASS_NAMES[HERO_HELMET_CLASS[helm.effect]])}:</b> ${esc(supportGearDescription(helm.effect,helm.value))}. Os demais heróis não recebem essa amplificação. A Aura pode reforçar apenas o atributo principal do capacete.</div>`;
 h+=`<details class="ui-expander"><summary>Laboratório e testes dos heróis</summary><div class="hint">Níveis simulados e todas as passivas maximizadas, sem gravar o seu progresso.</div><div class="button-row">${[20,1000,8000].map(x=>button('TESTAR Nv '+x,'heroLab',''+x,'',testMode&&!endgameTrial&&labLevel===x?'green':'muted')).join(' ')}${testMode&&!endgameTrial?button('SAIR · RESTAURAR','heroLabExit','','','block'):''}</div></details>`;
 h+=`<div class="notice-inline"><b>Automação de heróis:</b> ${g.autoHeroes?'ATIVADA':'DESATIVADA'}. A cada 10 s de tempo simulado, compra os níveis mais baratos entre os 32 heróis, usando até 70% do ouro e mantendo a reserva para habilidades. <b>O botão UPAR / TRANSCENDER TODOS</b> também realiza as transcendências dos heróis no nível 8.000, continuando a investir o ouro disponível após cada transcendência.</div>`;
 h+=`<div class="button-row">${button(g.autoHeroes?'AUTO-COMPRAR: LIGADO':'AUTO-COMPRAR: DESLIGADO','autoHeroesToggle','','',g.autoHeroes?'green':'muted')}${button('UPAR / TRANSCENDER TODOS · 100% DO OURO','heroBuyAll','','','block')}</div>`;
 h+=`<div class="button-row">${[1,10,100,8000].map(x=>button(x===8000?'MAX':'×'+x,'batch',''+x,'',batch===x?'green':'muted')).join(' ')}</div>`;
 for(const [i,x] of orderedHeroes().entries()){
  const lv=g.heroLevels[x.id]||0,tr=g.heroTrans[x.id]||0,price=heroCost(x,heroInvestmentLevel(x.id)),canTrans=lv>=8000,kind=classOfHero(x.id);
  const purchase=heroPurchasePlan(x,lv,batch,gold);
  const expanded=heroDetailId===x.id;
  // RESUMO: exibe SOMENTE a especialidade padrão do herói, não todos os marcos.
  const main=x.effect==='health'?'Vida máxima':x.effect==='health_regen'?'Regeneração de vida':effectLabel(x.effect);
  const heading=`${i+1}. ${x.name}`;
  const subtitle=`${HERO_CLASS_NAMES[kind]} · Nv ${fmt(lv)} / 8.000 · Transc. ${tr}`;
  const mode=batch===8000?'MAX':'×'+batch;
  const buyLabel=canTrans?'TRANSCENDER':`UPAR ${mode}`;
  const actions=button(buyLabel,canTrans?'transcend':'heroBuy',x.id,'','')+' '+button(expanded?'FECHAR DETALHES':'DETALHES ▾','heroDetail',x.id,'','muted');
  const purchaseText=canTrans?'Pronto para transcender.':purchase.levels>0?
   `Compra ${mode}: Nv ${fmt(lv)} → ${fmt(purchase.finalLevel)} · custo TOTAL ${purchase.cost.fmt()} ouro`:
   `Próximo nível custa ${price.fmt()} ouro; saldo insuficiente.`;
   const kindName=kind==='warrior'?'Físico':kind==='magic'?'Magia':'Fé';
   const contribution=heroPassiveContribution(x),projectedContribution=heroPassiveContribution(x,heroMilestoneEffectiveLevel(x.id,purchase.finalLevel),tr);
  h+=entry(['⚔','✠','✦'][['warrior','faith','magic'].indexOf(kind)],heading,subtitle,`Buff pessoal: +${compactPercent(contribution)} em ${kindName} do cavaleiro (somado à classe) · ${purchaseText}`,actions,'blue').replace('<article class="entry">','<article class="entry r72-hero-card">').replace('<div class="entry">','<div class="entry r72-hero-card">').replace('<div class="entry-action">',`<div class="r72-hero-price" title="${esc(purchaseText)}">${esc(purchaseText)}</div><div class="entry-action">`);
  if(expanded){
   const next=tr>0?8000:heroNextMilestone(lv),own=ownHeroDps(x);
    const classBefore=heroAttributeBonus(kind),classAfter=classBefore+Math.max(0,projectedContribution-contribution)*(active.demons>0?1+Math.min(1.5,.35*mod('demons')):1)*helmetHeroFactor(kind);
   h+=`<div class="hero-detail-panel" aria-label="Detalhes de ${esc(x.name)}">`+
    row('Especialidade',main)+row('Atributo principal',kindName)+
    row('Buff deste herói no cavaleiro',`+${compactPercent(contribution)} ${kindName} (aditivo na classe)`)+
    row('Buff depois desta compra',`+${compactPercent(projectedContribution)} ${kindName}`)+
    row('Ganho no dano do cavaleiro com esta compra',purchase.levels>0?`+${compactPercent(Math.max(0,classAfter/classBefore-1))} na classe ${kindName}`:'Sem níveis compráveis (ouro insuficiente)')+
    row('Marcos de potência (10/30/50)',`×${heroPowerMilestoneMultiplier(heroMilestoneEffectiveLevel(x.id)).toFixed(4).replace('.',',')}`)+
    row('Bônus adicional pela posição',`+${compactPercent(heroRankPassiveMultiplier(x)-1)} na contribuição pessoal`)+
    row('Índice de força (não é dano direto)',own.fmt())+
    row('Níveis pagos nesta execução',fmt(heroInvestmentLevel(x.id)))+
    row('Marcos preservados',tr>0?'Todos os marcos anteriores — permanentes após transcender':'Conforme nível atual')+
    row('Níveis desta compra',canTrans?'Transcendência':`+${fmt(purchase.levels)} (Nv ${fmt(lv)} → ${fmt(purchase.finalLevel)})`)+
    row('Custo TOTAL desta compra',canTrans?'—':purchase.cost.fmt()+' ouro')+
    row('Ouro restante após comprar',canTrans?'—':gold.sub(purchase.cost).fmt())+
    row('Próximo marco',next>=8000?'Transcendência · Nv 8.000':'Nível '+fmt(next))+
    `<div class="hint">${esc(heroMilestoneText(x,next))}</div>`+sectionTitle('Benefícios dos marcos')+
    HERO_MILESTONES.map(m=>`<div class="milestone-row ${tr>0||lv>=m?'unlocked':''}"><strong>${tr>0||lv>=m?'✓':'◇'} Nv ${m.toLocaleString('pt-BR')}${tr>0?' · Permanente':''}</strong><span>${esc(heroMilestoneText(x,m))}</span></div>`).join('')+
     `<div class="hint">O índice de força é apenas uma referência do laboratório e <b>não causa dano sozinho</b>. O buff pessoal exibido acima é o valor efetivo aplicado ao cavaleiro. Marcos 10/30/50 afetam apenas a contribuição deste herói. Ao transcender, o nível visível recomeça no 1, mas preço e poder não diminuem: os níveis pagos nesta execução continuam sendo contados. Marcos já alcançados são permanentes e não se acumulam repetidamente. O Prestígio do Cavaleiro reinicia as compras de níveis e o ouro, mas conserva as transcendências.</div></div>`;
  }
 }
 return h;
}
function heroGrowthFactor(hero){return Math.max(1.19,hero.growth*1.065)}
function heroCost(h,lv){return B(30).mul(Big.power(2.85,heroRank(h))).mul(Big.power(heroGrowthFactor(h),lv))}
// Custo em lote = soma geométrica dos preços individuais. A mesma fórmula
// alimenta a prévia da UI e debita o ouro, para nunca anunciar um custo de ×1
// enquanto o botão adquire dezenas ou milhares de níveis.
function heroBatchCost(hero,level,count){
 const n=Math.max(0,Math.floor(count));
 if(!n)return B(0);
 const first=heroCost(hero,level);
 if(n===1)return first;
 const rate=heroGrowthFactor(hero);
 return first.mul(Big.power(rate,n).sub(1)).div(rate-1);
}
function heroPurchasePlan(hero,level,mode=batch,budget=gold){
 const current=clamp(Math.floor(Number(level)||0),0,8000);
 const left=8000-current;
 const progress=heroInvestmentLevel(hero.id,current);
 const requested=mode===8000?left:Math.max(0,Math.min(left,Math.floor(Number(mode)||0)));
 const available=B(budget);
 // Busca binária: eficiente mesmo no MAX e com valores astronômicos de ouro.
 let low=0,high=requested;
 while(low<high){
  const mid=Math.ceil((low+high)/2);
  if(heroBatchCost(hero,progress,mid).cmp(available)<=0)low=mid;
  else high=mid-1;
 }
 const cost=heroBatchCost(hero,progress,low);
 return {levels:low,cost,finalLevel:current+low,nextCost:current+low<8000?heroCost(hero,progress+low):null};
}
// Transcendência única, compartilhada pela compra manual e pelo botão de
// 100% do ouro: não custa ouro e não zera investimento, preço nem marcos.
function transcendEligibleHero(hero){
 if(!hero||(g.heroLevels[hero.id]||0)<8000)return false;
 const id=hero.id,invested=heroInvestmentLevel(id);
 const beforeCost=heroCost(hero,invested);
 const beforeBuff=heroPassiveContribution(hero);
 g.heroUpgradeProgress[id]=invested;
 g.heroLevels[id]=1;
 g.heroTrans[id]=(g.heroTrans[id]||0)+1;
 if(heroCost(hero,heroInvestmentLevel(id)).cmp(beforeCost)<0 ||
    heroPassiveContribution(hero)+1e-10<beforeBuff){
  throw Error('Transcendência causou perda de custo/poder: '+id);
 }
 uiDirty=true;
 return true;
}
// Compra em lote compartilhada por TODOS os heróis. Prioridade: menor
// preço do próximo nível, assim os 32 recebem upgrades conforme a economia.
// Ativação manual usa 100% do saldo; automática usa até 70% a cada ciclo,
// reservando 30% para habilidades e outras decisões do jogador.
function buyAllHeroes(budgetFraction=1,announce=true,reserve=B(0)){
 const fraction=clamp(Number(budgetFraction)||0,0,1);
 const nominal=B(gold).mul(fraction);
 const freeAfterReserve=B(gold).cmp(reserve)>0?B(gold).sub(reserve):B(0);
 const budget=nominal.cmp(freeAfterReserve)>0?freeAfterReserve:nominal;
 let remaining=B(budget),spent=B(0),levels=0,heroes=new Set();
 const entries=orderedHeroes().map(hero=>{
  const local=g.heroLevels[hero.id]||0;
  const progress=heroInvestmentLevel(hero.id,local);
  const left=8000-local;
  const first=left>0?heroCost(hero,progress):null;
  return {hero,local,progress,left,first,logStart:first?first.log10():Infinity,logRate:Math.log10(heroGrowthFactor(hero))};
 }).filter(e=>e.left>0);
 if(!entries.length||!entries.some(e=>e.first.cmp(budget)<=0))return {levels:0,count:0,spent:B(0)};
 // Water-filling matemático: nível com menor custo marginal é comprado primeiro.
 // A busca por limiar de preço é ~O(32*40), independentemente da escala do ouro.
 const minLog=Math.min(...entries.map(e=>e.logStart));
 const maxLog=Math.max(...entries.map(e=>e.logStart+(e.left-1)*e.logRate))+1;
 function allocation(logThreshold){
  let sum=B(0);const counts=[];
  for(const e of entries){
   const estimate=logThreshold+1e-9<e.logStart?0:Math.min(e.left,Math.max(0,Math.floor((logThreshold-e.logStart)/e.logRate+1+1e-9)));
   const cost=estimate?heroBatchCost(e.hero,e.progress,estimate):B(0);
   sum=sum.add(cost);counts.push(estimate);
  }
  return {sum,counts};
 }
 let low=minLog-1,high=maxLog;
 for(let j=0;j<46;j++){
  const mid=(low+high)/2;
  if(allocation(mid).sum.cmp(budget)<=0)low=mid;else high=mid;
 }
 let plan=allocation(low);
 // Proteção contra arredondamento em números científicos extremos.
 if(plan.sum.cmp(budget)>0){plan=allocation(low-1e-7);}
 for(let i=0;i<entries.length;i++){
  const e=entries[i],n=plan.counts[i];if(n<=0)continue;
  g.heroLevels[e.hero.id]=e.local+n;
  g.heroUpgradeProgress[e.hero.id]=e.progress+n;
  spent=spent.add(heroBatchCost(e.hero,e.progress,n));
  levels+=n;heroes.add(e.hero.id);
 }
 remaining=remaining.sub(spent);
 // Distribui o saldo remanescente sem escolher níveis mais caros que os acessíveis.
 for(let j=0;j<80;j++){
  let cheapest=null;
  for(const e of entries){
   if((g.heroLevels[e.hero.id]||0)>=8000)continue;
   const cost=heroCost(e.hero,heroInvestmentLevel(e.hero.id));
   if(cost.cmp(remaining)<=0&&(!cheapest||cost.cmp(cheapest.cost)<0))cheapest={e,cost};
  }
  if(!cheapest)break;
  const e=cheapest.e;
  const paidBefore=heroInvestmentLevel(e.hero.id);
  g.heroLevels[e.hero.id]=(g.heroLevels[e.hero.id]||0)+1;
  g.heroUpgradeProgress[e.hero.id]=paidBefore+1;
  remaining=remaining.sub(cheapest.cost);spent=spent.add(cheapest.cost);
  levels++;heroes.add(e.hero.id);
 }
 if(levels){if(!spendGold(spent))throw Error('Ouro mudou durante compra de heróis');uiDirty=true;
  if(announce)alertGame(`Heróis: +${fmt(levels)} níveis em ${heroes.size} heróis · ${spent.fmt()} ouro.`);
 }
 return {levels,count:heroes.size,spent};
}
// R54: o botão de 100% também transcende todos os heróis que atingiram
// 8.000, e continua a compra de níveis após cada transcendência, dentro
// do saldo de ouro ainda disponível. A automação passiva permanece com a
// regra anterior para não transcender sem uma ação explícita do jogador.
function buyAndTranscendAllHeroes(announce=true){
 let levels=0,transcensions=0,spent=B(0),affected=new Set(),cycles=0;
 for(;cycles<80;cycles++){
  let transcendedThisRound=0;
  for(const hero of orderedHeroes()){
   if(transcendEligibleHero(hero)){
    transcensions++;transcendedThisRound++;affected.add(hero.id);
   }
  }
  const r=buyAllHeroes(1,false);
  levels+=r.levels;spent=spent.add(r.spent);
  if(r.levels){for(const hero of orderedHeroes())if((g.heroLevels[hero.id]||0)>0)affected.add(hero.id)}
  const hasNewReady=orderedHeroes().some(h=>(g.heroLevels[h.id]||0)>=8000);
  // Sem ninguém pronto para transcender, a compra de menor custo marginal
  // já esgotou as evoluções acessíveis neste orçamento.
  if(!hasNewReady)break;
  if(!r.levels&&!transcendedThisRound)break;
 }
 if(levels||transcensions){
  uiDirty=true;
  if(announce){
   alertGame('Heróis: +'+fmt(levels)+' níveis · '+transcensions+' transcendência(s) · '+spent.fmt()+' ouro.');
   feed('Arsenal de heróis: '+fmt(levels)+' níveis comprados e '+transcensions+' transcendência(s).');
  }
 }
 return {levels,transcensions,count:affected.size,spent,cycles:cycles+1};
}
function autoBuyHeroes(fraction=.70,announce=false){
 if(g.autoHeroes===false)return {levels:0,count:0,spent:B(0)};
 // R69: no gold reserve for retired active skill purchases.
 return buyAllHeroes(fraction,announce,B(0));
}
function petsPanel(){
 const selection=normalizePetSelection(g.petSelected);
 let result=sectionTitle('Companheiros da condenação')+`<div class="notice-inline"><b>1 pet ofensivo + 1 pet de suporte.</b> A afinidade aumenta apenas o bônus do pet equipado naquele slot. Todos os outros pets adquiridos continuam dando seu bônus passivo. A troca não custa recursos nem aumenta níveis. Contribuições abaixo são brutas (antes dos limites específicos do atributo). Potência dos equipamentos reforça somente os atributos principais equipados (até +6% no total), nunca os afixos. ${selection.length}/2 selecionados.</div>`;
 for(const kind of ['offense','support']){
  const current=selection.find(id=>D.pets.some(p=>p.id===id&&p.group===kind));
  const currentPet=D.pets.find(p=>p.id===current);
  result+=sectionTitle(kind==='offense'?'Slot ofensivo · '+(currentPet?.name||'vazio'):'Slot de suporte · '+(currentPet?.name||'vazio'));
  for(const x of D.pets.filter(p=>p.group===kind)){
   const lv=Math.max(0,Math.floor(Number(g.petLevels[x.id])||0));
   const selected=current===x.id;
   const inactive=petContributionAt(lv,false),equipped=petContributionAt(lv,true);
   const replacementLoss=!selected&&currentPet?petContributionAt(g.petLevels[current]||0,true)-petContributionAt(g.petLevels[current]||0,false):0;
   const delta=equipped-inactive;
   const swapText=selected?'Afinidade do slot ativa.':currentPet?`Equipar adiciona ${compactPercent(delta)} de ${effectLabel(x.effect)} em relação ao passivo; ${currentPet.name} perde ${compactPercent(replacementLoss)} da afinidade de ${effectLabel(currentPet.effect)} (mantém o passivo).`:`Equipar adiciona ${compactPercent(delta)} de afinidade para ${effectLabel(x.effect)}.`;
   const description=lv?`Bônus passivo desta criatura: +${compactPercent(inactive)}. Se equipada: +${compactPercent(equipped)}. ${swapText} Multiplicador TOTAL do personagem neste atributo: ${effectValue(x.effect,mod(x.effect))}.`:'Não descoberto.';
   result+=entry(kind==='offense'?'♞':'✿',x.name,`Nível ${lv} · ${effectLabel(x.effect)}`,description,lv?button(selected?'EQUIPADO ✓':'EQUIPAR','petEquip',x.id,'',selected?'green':''):'','purple');
  }
 }
 const produced=D.pets.reduce((sum,p)=>sum+(g.petLevels[p.id]||0),0);
 result='<div class="notice-inline"><b>Pets obtidos:</b> '+produced+' · <b>Próximo pet da Vila:</b> '+fmtTime(Math.max(0,buildingInterval('pet')-(g.production.pet||0)))+' (×'+g.speed+' acelera o tempo simulado) · <b>Próximo marco:</b> fase '+(122*Math.ceil((g.stage+1)/122))+'.</div>'+result;
 return result;
}
function scrollsPanel(){
 const progress=scrollProgress(),min=progress.minimum;
 const globalMultiplier=scrollSetMultiplierAt(min);
 let h=sectionTitle('Escrituras dos condenados')+`<div class="stat-grid">${statTile('Nível global do conjunto',min)}${statTile('Multiplicador do conjunto',compactMultiplier(globalMultiplier))}${statTile('Acima do mínimo',progress.aboveMinimum+' / '+progress.total)}${statTile('No nível mínimo',progress.atMinimum+' / '+progress.total)}</div>`;
 h+=`<div class="notice-inline"><b>Próximo marco: conjunto Nv ${min+1}.</b> Faltam subir pelo menos um nível em cada um dos <b>${progress.atMinimum}</b> pergaminhos que ainda estão no nível mínimo. Os drops continuam aleatórios; o filtro serve apenas para identificar os atrasados.</div>`;
 h+=`<div class="button-row">${button(scrollMinOnly?'EXIBIR TODOS OS 32':'MOSTRAR APENAS NÍVEL MÍNIMO','scrollMinFilter','','',scrollMinOnly?'green':'muted')}</div>`;
 h+='<div class="hint">O nível do conjunto é o MENOR dos 32 pergaminhos. Duplicatas aumentam níveis permanentes. Os bônus individuais continuam independentes e NÃO são gastos na evolução do conjunto. Potência dos equipamentos atua apenas no principal dos equipamentos (teto de +6%), não em afixos.</div>';
 for(const x of D.scrolls){
  const lv=Math.max(0,Math.floor(Number(g.scrollLevels[x.id])||0));
  if(scrollMinOnly&&lv!==min)continue;
  const contribution=scrollContributionAt(lv,min);
  h+=entry('▤',x.name,`Nível ${lv}${lv===min?' · NÍVEL MÍNIMO':''}`,`Contribuição própria: +${compactPercent(contribution)} ${effectLabel(x.effect)} antes de limites. Multiplicador total atual do cavaleiro: ${effectValue(x.effect,mod(x.effect))}. Obtido na Igreja e no Arauto Espectral.`,'','purple');
 }
 return h;
}
function gearPanel(){
 const fmtPct=n=>compactPercent(n,2);
 const boss=bossGearOdds(g.difficulty,g.worldPrestiges);
 if(!SLOTS.includes(gearCategory))gearCategory=SLOTS[0];
 const inventory=g.inventory||[];
 const list=gearSortedForSlot(inventory,gearCategory);
 const totalPages=Math.max(1,Math.ceil(list.length/GEAR_PAGE_SIZE));
 gearPage=clamp(gearPage,0,totalPages-1);
 const equipped=g.equipped?.[gearCategory]||null;
 const eqIds=new Set(Object.values(g.equipped||{}).filter(Boolean).map(x=>String(x.id)));
 const sellable=inventory.filter(i=>i&&!i.favorite&&!eqIds.has(String(i.id)));
 let h=sectionTitle('Equipamentos por tipo');
 h+=`<div class="notice-inline"><b>Proteção de inventário:</b> marque ★ nos itens que deseja guardar. A venda total NUNCA inclui favoritos ou itens equipados.</div><div class="button-row">${button('VENDER TODOS NÃO PROTEGIDOS · '+sellable.length+' ITENS','gearSellAll','','',sellable.length?'block':'muted')}</div>`;
 h+='<div class="gear-category-tabs" role="tablist" aria-label="Tipos de equipamento">'+SLOTS.map(sl=>{
  const qty=inventory.filter(i=>i?.slot===sl).length;
  const selected=sl===gearCategory;
  return `<button type="button" class="gear-category-tab ${selected?'active':''}" role="tab" aria-selected="${selected?'true':'false'}" tabindex="${selected?'0':'-1'}" data-action="gearCategory" data-id="${esc(sl)}" title="${esc(sl)}: ${qty} itens no inventário"><span aria-hidden="true">${GEAR_SLOT_ICONS[sl]}</span><b>${esc(sl)}</b><small>${qty}</small></button>`;
 }).join('')+'</div>';
 h+='<div class="hint">Raridade: <b>Único → Mítico → Lendário → Épico → Raro → Comum</b>. Qualidade: <b>Imperfeita → Gasta → Regular → Boa → Excelente → Perfeita</b>. Qualidade e raridade são sorteadas separadamente. Um item de Grau superior continua mais forte em seu atributo principal que qualquer item do grau anterior. Capacetes reforçam exclusivamente os buffs passivos dos heróis da classe indicada, sem bônus direto de espada.</div>';
 h+=sectionTitle('Equipado · '+gearCategory);
 h+=entry(GEAR_SLOT_ICONS[gearCategory],gearCategory,equipped?equipped.name:'Espaço vazio',equipped?`${RARITY[equipped.rarity]} · Qualidade ${gearQualityName(equipped)} · ${gearGradeLabel(equipped)} · Nv ${equipped.level} · Principal: ${auraMainDescription(equipped)} · ${(equipped.affixes||[]).length} afixos extras`:'Nenhum item equipado nesta categoria.',equipped?button('DESEQUIPAR','gearUnequip',gearCategory,'','muted'):'',equipped?.rarity>=3?'purple':'');
 h+=sectionTitle(`${gearCategory} · ${list.length} ${list.length===1?'item':'itens'}`);
 if(!list.length)h+='<div class="empty">Nenhum item desta categoria no inventário. Derrote inimigos ou utilize a Ferraria para conseguir novos equipamentos.</div>';
 const pageItems=list.slice(gearPage*GEAR_PAGE_SIZE,(gearPage+1)*GEAR_PAGE_SIZE);
 for(const item of pageItems){
  const eq=Object.values(g.equipped||{}).some(q=>q?.id===item.id);
  const rank=clamp(Math.trunc(Number(item.rarity)||0),0,RARITY.length-1);
  const secondary=item.affixes||[];
  const main=item.uniqueVersion===2&&item.slot!=='Aura'?supportGearDescription(item.effect,uniquePrimaryValue(item)):auraMainDescription(item);
  const relatedSet=item.setId?D.sets.find(x=>x.id===item.setId):null;
  const uniqueDef=uniqueDefinitionForItem(item);
  const uniqueRule=uniqueDef&&item.uniqueVersion===2?UNIQUE_PRIMARY[uniqueDef.id]:null;
  const uniqueProgress=uniqueRule?uniqueProgressRatio(uniqueRule):0;
  const coll=uniqueDef?UNIQUE_COLLECTION_BONUSES[uniqueDef.id]:null;
  const collectionTag=(relatedSet?`<div class="hint">❖ <b>Conjunto:</b> ${esc(relatedSet.name)} · ${SLOTS.filter(slot=>(g.setParts[relatedSet.id]||[]).includes(slot)).length}/5 peças registradas · ${setCompleted(relatedSet)?'bônus principais e secundários permanentes ativos':'ainda incompleto'}. Não é necessário equipar as cinco peças.</div>`:'')+
   (rank===5?`<div class="hint">✦ <b>Item ÚNICO:</b> ${uniqueRule?`PRINCIPAL EXCLUSIVO · ${esc(effectLabel(uniqueRule.effect))}; escala com ${esc(uniqueRule.label)} (aumento calculado de +${compactPercent(.50*uniqueProgress)} sobre o valor-base, sujeito aos limites do atributo). ASSINATURA EXCLUSIVA · ${esc(effectLabel(uniqueSignatureEffect(uniqueDef)))}; ocupa 1 dos 3 afixos e cresce até +20% com a progressão. BÔNUS DE COLEÇÃO PERMANENTE: +${compactPercent(coll.bonus)} ${esc(effectLabel(coll.effect))}.` : uniqueDef?'LEGADO DA R90/R91: atributos e rolagens anteriores intactos; bônus de descoberta permanente ativo.':'LEGADO DA R89 OU ANTERIOR: atributos antigos preservados.'} O nome não concede um poder oculto; o poder do Único é descrito acima.</div>`:'');
  const description=`<b>Atributo principal:</b> ${esc(main)}${secondary.length?' · '+secondary.length+' '+(secondary.length===1?'modificador adicional':'modificadores adicionais'):''}`;
  const details=`<details class="ui-expander gear-detail-expander"><summary>VER ATRIBUTOS E AFIXOS (${secondary.length})</summary>`+
   `<div class="affix-explanation"><b>Atributo principal</b><div>${esc(main)}</div></div>`+
   (secondary.length?secondary.map(a=>`<div class="affix-explanation"><b>${a.uniqueSignature?'✦ ASSINATURA · ':''}${esc(effectLabel(a.effect||'damage'))}: ${esc(supportGearDescription(a.effect||'damage',uniqueAffixValue(a,item)))}</b><small>Nome do afixo: ${esc(a.name||'Afixo secundário')}</small></div>`).join(''):'<div class="hint">Este item não possui modificadores secundários.</div>')+
   (secondary.some(a=>a.effect==='gear')?'<div class="hint">Este afixo legado não foi reconhecido para migração; não conta como melhoria efetiva.</div>':'')+
   `<div class="hint">Afixo = propriedade adicional do equipamento. Exemplo: <b>da Precisão</b> significa bônus de chance crítica; <b>do Colosso</b> significa dano contra chefes; <b>da Ruptura</b> significa dano crítico. A Aura aumenta somente o atributo principal do item-alvo, nunca esses afixos.</div></details>`;
  const comparison=eq?'':gearCompareMarkup(gearCompareSwap(item));
  h+=`<div class="gear-inventory-item gear-rarity-${rank} grade-${itemGradeFromDifficulty(item.difficulty)}">`+entry(GEAR_SLOT_ICONS[gearCategory],item.name,`${RARITY[rank]} · Qualidade ${gearQualityName(item)} · ${gearGradeLabel(item)} · Nv ${item.level} · ${item.slot}`,'',
   button(eq?'EQUIPADO':'EQUIPAR','gearEquip',item.id,'',eq?'green':'')+' '+button(item.favorite?'★ FAVORITO':'☆ FAVORITAR','gearFavorite',item.id,'',item.favorite?'green':'muted')+' '+button(item.favorite?'PROTEGIDO':'VENDER · '+saleValue(item)+' CÉDULAS','gearSell',item.id,'',item.favorite?'muted':''),rank>=3?'purple':'')+`<div class="item-main-stat"><span class="gear-quality-tag quality-${gearQualityIndex(item)}">✧ ${gearQualityName(item)}</span> ${description}</div>`+collectionTag+comparison+details+'</div>';
 }
 if(totalPages>1){
  h+=`<div class="gear-pagination"><button class="gamebtn muted" data-action="gearPage" data-id="${gearPage-1}" ${gearPage<=0?'disabled':''}>← ANTERIOR</button><span>Página ${gearPage+1} de ${totalPages}</span><button class="gamebtn muted" data-action="gearPage" data-id="${gearPage+1}" ${gearPage>=totalPages-1?'disabled':''}>PRÓXIMA →</button></div>`;
 }
 h+='<details class="ui-expander"><summary>Como funcionam Auras e bônus de Suporte?</summary><div class="notice-inline"><b>AURA:</b> amplifica exclusivamente o atributo principal da Arma, Capacete, Peitoral ou Anel escolhido. Nunca multiplica afixos secundários, bônus de conjuntos ou ela mesma.</div>';
 h+='<div class="notice-inline"><b>SUPORTE:</b> Vida, regeneração, duração, recarga e velocidade de ataque têm teto de +80%, dividido por origem: 30% heróis, 10% afixos adicionais e 40% relíquias. Mana e defesa mantêm o teto de +20%. As prévias representam potencial; confira o bônus aplicado na aba Cavaleiro.</div></details>';
 h+=sectionTitle('Filtro de venda automática');
 h+='<div class="notice-inline">Selecione as raridades vendidas automaticamente ao obter novos equipamentos. Itens já guardados não serão vendidos retroativamente, e peças equipadas permanecem protegidas. A prévia da troca considera afixos, a Aura e tetos, mas não prevê DPS ou a eficiência de sua estratégia.</div>';
 h+=`<div class="button-row">${button((g.autoSellProtectUpgrades?'✓':'○')+' PROTEGER GANHOS SEM PERDAS · '+(g.autoSellProtectUpgrades?'ATIVADO':'DESATIVADO'),'gearToggleAutoProtect','','',g.autoSellProtectUpgrades?'green':'muted')}</div>`;
 h+='<div class="hint">Opcional: apenas nas raridades de venda automática, conserva e favorita a primeira peça de um slot vazio ou peças cuja prévia melhora algum atributo efetivo sem reduzir outros. Trocas de atributos não são protegidas automaticamente. Desativada por padrão nos saves antigos; venda manual permanece livre após remover o favorito.</div>';
 h+=`<div class="auto-sell-filters">${RARITY.map((r,i)=>button(((g.autoSellRarities||[]).includes(i)?'✓ VENDER ':'✕ GUARDAR ')+r,'autoSellToggle',''+i,'',(g.autoSellRarities||[]).includes(i)?'green':'muted')).join('')}</div>`;
 h+=row('Itens vendidos automaticamente',g.autoSellCount||0)+row('Cédulas obtidas por venda automática',fmt(g.autoSellEarnings||0));
 h+='<details class="gear-rules"><summary>Catálogo dos 16 equipamentos Únicos</summary>'+
 '<div class="hint">Cada Único novo tem atributo principal que escala com a progressão, um secundário exclusivo e dois secundários aleatórios. Descobrir um Único desbloqueia seu bônus de coleção permanente. Únicos não são forjados.</div>'+
 D.uniques.map(def=>{const rule=UNIQUE_PRIMARY[def.id],progress=uniqueProgressRatio(rule),b=UNIQUE_COLLECTION_BONUSES[def.id],found=(g.uniqueDiscovered||[]).includes(def.id);return `<div class="hint">✦ <b>${esc(def.name)}</b> · ${esc(def.slot)} · principal: ${esc(effectLabel(rule.effect))} (progresso atual: +${compactPercent(.50*progress)} sobre a base; máximo +50%) por ${esc(rule.label)} · assinatura: ${esc(effectLabel(uniqueSignatureEffect(def)))} · descoberta: +${compactPercent(b.bonus)} ${esc(effectLabel(b.effect))} · ${found?'DESCOBERTO · BÔNUS ATIVO':'NÃO DESCOBERTO'}</div>`}).join('')+'</details>';
 h+=`<details class="gear-rules"><summary>Chances de drop, bosses e preços de venda</summary>`;
 h+='<div class="notice-inline">Equipamentos só podem cair em fases inéditas: no máximo 1 item de monstros comuns por fase e 1 sorteio único do Guardião de Equipamentos a cada 15 fases. Chances normais 0,9% / grandes 1,8%; raridades em monstros: 80% Comum, 15% Raro, 5% Épico. Únicos exigem Prestígio de Mundo. A qualidade é independente da raridade e não cria novas tentativas de drop.</div>';
 h+=sectionTitle('Probabilidades por abate');
 h+=`<div class="stat-grid">${statTile('Comum · monstros','80% do equipamento')}${statTile('Raro · monstros','15% do equipamento')}${statTile('Épico · monstros','5% do equipamento')}${statTile('Chance normal','0,9% / abate')}${statTile('Chance maior','1,8% / abate')}${statTile('Próximo boss de equipamento',15*Math.ceil(g.stage/15))}</div>`;
 h+=sectionTitle('Guardião de Equipamentos · única tentativa por etapa')+`<div class="stat-grid">${statTile('Lendário',fmtPct(boss.legendary))}${statTile('Mítico',fmtPct(boss.mythic))}${statTile('Único',g.worldPrestiges>0?fmtPct(boss.unique):'BLOQUEADO')}${statTile('Sem equipamento',fmtPct(1-boss.legendary-boss.mythic-boss.unique))}</div>`;
 h+=sectionTitle('Qualidades independentes da raridade')+`<div class="stat-grid">${GEAR_QUALITY.map((n,i)=>statTile(n,Math.round(GEAR_QUALITY_CHANCES[i]*100)+'%')).join('')}</div>`;
 h+=sectionTitle('Preços fixos de venda')+`<div class="stat-grid">${RARITY.map((r,i)=>statTile(r,GEAR_SALE_PRICES[i]+' cédula'+(GEAR_SALE_PRICES[i]>1?'s':''))).join('')}</div></details>`;
 return h;
}
function villagePanel(){let h=sectionTitle('A vila sob as cinzas')+`<div class="stat-grid">${statTile('Madeira',fmt(g.village.wood))}${statTile('Pedra',fmt(g.village.stone))}${statTile('Ferro',fmt(g.village.iron))}${statTile('Materiais de forja',g.village.forge)}</div><div class="hint">A Vila trabalha enquanto você combate e pode produzir durante até 24 horas offline. Ferro é mais raro e valioso; pedra é intermediária e madeira é mais abundante.</div>`;
 for(const b of D.buildings){
  const lv=g.buildings[b.id]||1,cost=buildingCost(b.id),costText=villageCostText(cost),petMax=b.id==='pet'&&lv>=PET_SANCTUARY_MAX_LEVEL;
  const raw=Object.hasOwn(VILLAGE_RESOURCE_RATES,b.id),pct=raw?0:(g.production[b.id]||0)/buildingInterval(b.id)*100;
  const description=raw
   ?`Produção atual ${(VILLAGE_RESOURCE_RATES[b.id]*lv).toFixed(3)}/s → próxima ${(VILLAGE_RESOURCE_RATES[b.id]*(lv+1)).toFixed(3)}/s. Ganho: +${VILLAGE_RESOURCE_RATES[b.id].toFixed(3)}/s por nível. Custo: ${costText}.`
   :`Intervalo atual ${fmtTime(buildingInterval(b.id))}; ${petMax?'nível máximo alcançado (1 ovo a cada 1h)':`próximo ${fmtTime(buildingIntervalAt(b.id,lv+1))}`}. Tempo restante: ${fmtTime(Math.max(0,buildingInterval(b.id)-(g.production[b.id]||0)))}.${petMax?'':` Custo: ${costText}.`}`;
  h+=entry(b.id==='wood'?'♣':b.id==='stone'?'◆':b.id==='iron'?'⚒':b.id==='pet'?'♞':b.id==='scroll'?'✥':'⚙',b.name,`Nível ${lv} · ${raw?'produção contínua':'produção: '+fmtTime(buildingInterval(b.id))}`,description,button(petMax?'NÍVEL MÁXIMO · 1H':'MELHORAR CONSTRUÇÃO','building',b.id,'',petMax?'muted':''),'blue');
  if(!raw)h+=`<div class="progress-small" style="margin-top:-6px;margin-bottom:13px"><div style="width:${pct}%"></div></div>`;
 }
 h+=sectionTitle('Comércio e forja')+`<div class="notice-inline">Venda cada material separadamente. Valores por <b>unidade</b>: madeira ${VILLAGE_RESOURCE_PRICES.wood.toLocaleString('pt-BR')} cédula; pedra ${VILLAGE_RESOURCE_PRICES.stone.toLocaleString('pt-BR')}; ferro ${VILLAGE_RESOURCE_PRICES.iron.toLocaleString('pt-BR')}. Valores de equipamentos: Comum 1, Raro 5, Épico 10, Lendário 25, Mítico 50, Único 100 cédulas.</div>`;
 h+=row('Cédulas disponíveis',fmt(g.village.banknotes));
 for(const [id,label] of [['wood','Madeira'],['stone','Pedra'],['iron','Ferro']]){
  const unit=VILLAGE_RESOURCE_PRICES[id],available=Math.floor(g.village[id]);
  h+=entry('❖','Vender '+label,`Em estoque: ${fmt(g.village[id])} · ${unit.toLocaleString('pt-BR')} cédulas/un.`,
   `Vender todas as ${fmt(available)} unidades rende ${(unit*available).toLocaleString('pt-BR',{maximumFractionDigits:2})} cédulas. Somente melhorias de construções aumentam a produção.`,
   button('VENDER TUDO · '+fmt(available)+' un.','sellMaterial',id,'all',available?'green':'muted'));
 }
 h+=sectionTitle('Baús de suprimentos')+
 `<div class="notice-inline">Cada baú concede <b>todos</b> os prêmios anunciados, sem sorteio de categoria: pets e pergaminhos são sorteados individualmente (duplicatas aumentam o nível). Relíquias escalam com o <b>maior estágio já alcançado</b> entre as dificuldades, não com os abates. Baús não recebem o bônus de relíquias exclusivo do prestígio. <b>O Gigante tem a melhor recompensa por cédula.</b></div>`+
 row('Maior estágio registrado',fmt(chestRecordStage()));
 for(const [id,c] of Object.entries(CHEST_TYPES)){
  const reward=chestRelicReward(id);
  const description=`${c.pets} pets + ${c.scrolls} pergaminhos + ${c.forge} materiais de forja + ${reward.fmt()} relíquias. Valor em relíquias: ${Math.round(c.relicShare*100)}% da referência por estágio (mínimo ${c.minRelics}).`;
  const status=(Number(g.village.banknotes)||0)>=c.price?'':' · FALTAM '+fmt(c.price-(Number(g.village.banknotes)||0))+' cédulas';
  h+=entry(c.icon,'Baú '+c.label,`${fmt(c.price)} cédulas${status}`,description,
   button('COMPRAR BAÚ '+c.label.toUpperCase(),'chest',id,'',id==='giant'?'green':''),id==='giant'?'purple':'');
 }
 h+=row('Baús abertos',Object.values(g.chestsOpened||{}).reduce((a,n)=>a+(Number(n)||0),0));
 return h}
function buildingCost(id){
 const base=VILLAGE_BUILDING_COSTS[id];
 if(!base)return null;
 const scale=Math.pow(1.45,Math.max(0,(g.buildings[id]||1)-1));
 return Object.fromEntries(['wood','stone','iron'].map(resource=>[resource,Math.ceil(base[resource]*scale)]));
}
function villageCostText(cost){return ['wood','stone','iron'].map((id,i)=>`${fmt(cost[id])} ${['madeira','pedra','ferro'][i]}`).join(' + ')}
function worldPanel(){let h=sectionTitle('Os cinco véus da ruína')+trialControls()+`<div class="notice-inline"><b>Economia rebalanceada:</b> Monstro ${enemyGold(g.stage).fmt()} · Boss ${enemyGold(g.stage).mul(GOLD_SOURCE_BASE.boss).fmt()} · Fada ${enemyGold(g.stage).mul(GOLD_SOURCE_BASE.fairy).fmt()} · Mimic ${enemyGold(g.stage).mul(GOLD_SOURCE_BASE.mimic).fmt()} <b>(valores-base por evento)</b>. Mimic (Chesterson) é um único inimigo de tesouro, fortalecido pela árvore de Magia; não há sorteio adicional por inimigo comum. A fada chega após ~${Math.round(fairiesInterval())} segundos simulados. Bônus específicos superam All Gold e as chances de Mimics continuam baixas. Em ×100, 90 s simulados passam em 0,9 s reais.</div><div class="notice-inline">${g.stageHold?'FARM FIXO: clique RETOMAR para lutar contra o Guardião da fase. ':''}A fase só avança após derrotar o Guardião. A fase 24.000 exige seu Guardião para liberar Prestígio de Mundo. Equipamentos só caem em fases inéditas (uma peça por monstros e uma tentativa no Guardião de Equipamentos). Repetições rendem ouro e EXP, sem equipamentos.</div>`;
 for(let i=0;i<5;i++){let available=i<g.unlocked;h+=entry(['☾','♜','✥','❂','☄'][i],DIFF[i],available?`Maior estágio: ${fmt(g.highest[i]||1)}${i<4?' / 24.000':' / ∞'}`:'BLOQUEADA',i===g.difficulty?'Mundo atualmente ativo.':available?'Retorne aos estágios conquistados para fortalecer sua build.':'Conquiste o mundo anterior para abrir este véu.',available?button(i===g.difficulty?'MUNDO ATUAL':'VIAJAR','difficulty',''+i,'',i===g.difficulty?'green':''):'','purple')}
 h+=sectionTitle('Farm de ouro e experiência em marcos anteriores')+`<div class="notice-inline">Volte a um marco conquistado e ative FARM FIXO para obter ouro e EXP. Repetições NÃO oferecem equipamentos, nem novos sorteios de guardiões. A posição máxima permanece preservada; RETOMAR reativa o progresso normal.</div>`;
 h+=`<div class="button-row">${button('FARMAR OURO / EXP','farmGearMilestone','here','','block')}${button('VOLTAR MAIS 15','farmGearMilestone','previous','','muted')}${button('RETORNAR AO RECORDE','returnHighest','','','muted')}</div>`;
 h+=sectionTitle('Guardiões e recompensas')+`<div class="notice-inline"><b>15 estágios:</b> uma tentativa por etapa inédita de equipamento Lendário/Mítico/Único (sem garantia). <b>25 estágios:</b> 1 ponto de habilidade SOMENTE na primeira vitória daquele marco/dificuldade. <b>122 estágios:</b> 4 pets GARANTIDOS ao chegar ao marco pela primeira vez; o Arauto Espectral concede 1 pergaminho na primeira vitória.</div>`;
 for(const [step,type,icon,name,reward] of [[15,'equipment','⚔','Guardião de Equipamentos','uma tentativa rara por fase inédita'],[25,'knowledge','✥','Guardião do Conhecimento','1 ponto permanente de habilidade'],[122,'spectral','♞','Arauto Espectral','4 pets garantidos ao atingir o marco + 1 pergaminho ao derrotar o Arauto']]){
  const next=step*Math.ceil((g.stage+1)/step),last=step*Math.floor(g.stage/step),claimed=g.firstClear.filter(x=>x.startsWith(g.difficulty+':')&&x.endsWith(':'+type)).length;
  const lastStatus=last>0?(g.firstClear.includes(`${g.difficulty}:${last}:${type}`)?'Último marco reivindicado':'Último marco não reivindicado'):'Primeiro marco pendente';
  h+=entry(icon,name,`A cada ${step} fases · próximo marco ${next}`,`${reward}. Marcos deste tipo já vencidos nesta dificuldade: ${claimed}. ${type==='equipment'?'Sem rerolls em fase conquistada.':lastStatus}`,'','purple');
 }
 h+=sectionTitle('Guardiões de Limiar · marcos de 250')+
 `<div class="notice-inline">Nas fases <b>249, 499, 749, 999...</b>, o avanço para o marco seguinte exige derrotar um Guardião de Limiar. Ele tem entre <b>28× e 60×</b> a vida de um inimigo normal do mesmo estágio. A vitória é <b>permanente por dificuldade</b>: nos prestígios seguintes, esse obstáculo já vencido não é obrigatório. Bosses e equipamentos de etapas conquistadas não podem ser refarmados.</div>`;
 const nextLiminal=THRESHOLD_INTERVAL*(Math.floor(g.stage/THRESHOLD_INTERVAL)+1)-1;
 h+=row('Próximo limiar',nextLiminal+' → '+(nextLiminal+1))+
    row('Vida do guardião prevista',thresholdMultiplier(nextLiminal)+'× HP comum')+
    row('Estado atual',thresholdBlocked()?'BLOQUEADO — derrote o Guardião de Limiar':'Avanço liberado');
 h+=sectionTitle('Prestígio de Mundo')+row('Prestígios realizados',g.worldPrestiges)+row('Dificuldade atual',DIFF[g.difficulty]);h+=g.difficulty<4?button(g.stage>=24000&&g.worldCapCleared[g.difficulty]?'ROMPER O VÉU · DESBLOQUEAR PRÓXIMO MUNDO':'REQUER GUARDIÃO DA FASE 24.000','worldPrestige','','','block'):'<div class="notice-inline">Ruína Eterna: progressão de mundo sem limite de 24.000.</div>';return h}

function soulsPanel(){
 if(!g.worldPrestiges)return sectionTitle('Santuário Lacrado')+'<div class="notice-inline"><b>Desbloqueio:</b> complete o primeiro Prestígio de Mundo (I → II, ao alcançar a fase 24.000). Antes disso, não há obtenção nem investimento de Almas ou Runas.</div>';
 const echoOwned=SOUL_ECHOES.filter(e=>clampRank(g.soulCollection[e.id])>0).length;
 const runeOwned=SOUL_RUNES.filter(r=>clampRank(g.runeCollection[r.id])>0).length;
 const summonSteps=12-(g.soulSummons%12);
 let h=sectionTitle('Necromancia · Coleção de Ecos')+
  `<div class="stat-grid">${statTile('Almas disponíveis',fmt(g.souls))}${statTile('Ecos descobertos',echoOwned+' / 36')}${statTile('Invocações',fmt(g.soulSummons))}${statTile('Pesquisa livre',g.soulResearchPoints)}</div>`+
  `<div class="notice-inline"><b>Invocação:</b> cada 10 Almas chama 1 Eco permanente. Duplicatas aumentam seu nível (+1 por cópia; sem limite). A cada 12 invocações, +1 ponto de Pesquisa. <b>${summonSteps} invocação(ões)</b> até o próximo ponto. Chance base: Comum 65%, Raro 25%, Épico 8%, Lendário 2%; raridades altas melhoram levemente com muitas invocações. A escolha de afinidade multiplica por 4 o peso de Ecos daquela família, sem garantia nem alterar a raridade.</div>`+
  sectionTitle('Escolher afinidade da invocação')+
  `<div class="button-row">${SOUL_AFFINITY_OPTIONS.map(([id,label])=>button(label,'soulAffinity',id,'',g.soulAffinity===id?'green':'muted')).join('')}</div>`+
  `<div class="button-row">${button('INVOCAR ×1 · 10 ALMAS','soulSummon','1','','purple')}${button('INVOCAR ×10 · 100 ALMAS','soulSummon','10','','purple')}${button('INVOCAR MÁX. · ATÉ 250','soulSummon','250','','muted')}</div>`;
 h+=sectionTitle('Pesquisa Proibida · '+g.soulResearchPoints+' ponto(s) disponível(is)');
 h+='<div class="hint">Cada ponto abaixo possui efeito exato e permanente. Máximo de 5 por pesquisa; pré-requisitos precisam estar completos. Pesquisas não consomem Almas.</div>';
 for(const n of SOUL_RESEARCH){
  const lv=researchLevel(n.id),unlocked=researchUnlocked(n);
  const effectName=n.effect==='soul_drop'?'chance de Almas nos abates':n.effect==='rune_chest'?'fragmentos rúnicos nos baús':effectLabel(n.effect);
  const desc=`Cada ponto: +${compactPercent(n.rate)} em ${effectName}. Atual: +${compactPercent(lv*n.rate)}${lv<RESEARCH_MAX?` → próximo: +${compactPercent((lv+1)*n.rate)}`:''}. ${unlocked?'Pesquisa disponível.':`Requer nível 5 em: ${n.parents.map(p=>SOUL_RESEARCH.find(x=>x.id===p)?.name).join(', ')}.`}`;
  const act=lv>=RESEARCH_MAX?'✓ COMPLETA':unlocked?button('INVESTIR 1 PONTO','soulResearch',n.id,'',g.soulResearchPoints>0?'purple':'muted'):'🔒 BLOQUEADA';
  h+=entry('✥',n.name,`Pesquisa ${lv}/${RESEARCH_MAX} · ${effectName}`,desc,act,'purple');
 }
 h+=sectionTitle('Bestiário · 36 Ecos')+'<div class="hint">Todos os Ecos descobertos fornecem o bônus passivamente, sem equipar. Os valores exibidos são a contribuição própria de cada Eco ao atributo indicado; bônus gerais entram uma só vez no cálculo final.</div>';
 for(let family=0;family<6;family++){
  h+=sectionTitle(ECHO_FAMILIES[family][2]+' Afinidade · '+ECHO_FAMILIES[family][1]);
  for(const e of SOUL_ECHOES.filter(x=>x.group===family)){
   const lv=clampRank(g.soulCollection[e.id]),before=echoBonusAt(e,lv),after=echoBonusAt(e,lv+1);
   h+=entry(ECHO_FAMILIES[family][2],e.name,`${ECHO_RARITIES[e.rarity][0]} · Nv ${fmt(lv)} · ${effectLabel(e.effect)}`,
    `Atual: +${compactPercent(before)} ${effectLabel(e.effect)}. Próxima cópia: +${compactPercent(after)} (incremento +${compactPercent(after-before)}). ${lv?'Permanente e ativo.':'Não descoberto; será ativado na primeira invocação.'}`,'',e.rarity>=2?'purple':'');
  }
 }
 h+=sectionTitle('Runas Místicas · 24 gravuras')+
   `<div class="stat-grid">${statTile('Fragmentos rúnicos',fmt(g.runes))}${statTile('Runas descobertas',runeOwned+' / 24')}${statTile('Gravuras reveladas',fmt(g.runeSummons))}</div>`+
   '<div class="notice-inline"><b>1 fragmento = 1 runa aleatória.</b> Todo sorteio entrega uma cópia. Cada duplicata aumenta o nível da runa em +1, sem limite; não existem espaços, venda ou reroll. O bônus principal entra no nível 1, e o segundo é desbloqueado no nível 10. A coleção inteira fica ativa permanentemente.</div>'+
  `<div class="button-row">${button('REVELAR ×1','runeReveal','1','','purple')}${button('REVELAR ×10','runeReveal','10','','purple')}${button('REVELAR MÁX. · ATÉ 250','runeReveal','250','','muted')}</div>`;
 for(const r of SOUL_RUNES){
  const lv=clampRank(g.runeCollection[r.id]),p=runePrimaryAt(lv),pn=runePrimaryAt(lv+1),secondary=runeSecondaryAt(lv),secondaryNext=runeSecondaryAt(lv+1);
  h+=entry('◇',r.name,`Runa ${fmt(lv)} · Principal: ${effectLabel(r.primary)}`,
    `PRINCIPAL (${lv>0?'ATIVO':'Nv 1'}): +${compactPercent(p)} ${effectLabel(r.primary)} → +${compactPercent(pn)} no próximo nível (incremento +${compactPercent(pn-p)}). SEGUNDÁRIO (${lv>=10?'ATIVO':'DESBLOQUEIA Nv 10'}): +${compactPercent(secondary)} ${effectLabel(r.secondary)} → +${compactPercent(secondaryNext)} no próximo nível.`,
   '',lv>=10?'purple':'');
 }
 h+=sectionTitle('Como obter Almas e Runas')+`<div class="hint">A partir do Mundo II: inimigos e chefes podem conceder os dois recursos. Baús pequenos, médios e gigantes entregam ambos de forma <b>garantida</b>, além de seus pets, pergaminhos, materiais e relíquias. A Reza foi removida; Fé continua sendo atributo de combate.</div>`;
 const c=chestArcaneReward('small'),m=chestArcaneReward('medium'),gi=chestArcaneReward('giant');
 h+=row('Baú pequeno',`+${c.souls} Almas · +${c.runes} Fragmentos garantidos${c.extraChance?' · '+compactPercent(c.extraChance)+' de +1':''}`)+row('Baú médio',`+${m.souls} Almas · +${m.runes} Fragmentos garantidos${m.extraChance?' · '+compactPercent(m.extraChance)+' de +1':''}`)+row('Baú gigante',`+${gi.souls} Almas · +${gi.runes} Fragmentos garantidos${gi.extraChance?' · '+compactPercent(gi.extraChance)+' de +1':''}`);
 return h;
}
// R75 — Runas are a separate system with an independent navigation entry.
function runesPanel(){
 if(!g.worldPrestiges)return sectionTitle('Runas Lacradas')+'<div class="notice-inline"><b>Desbloqueio:</b> complete o primeiro Prestígio de Mundo. As Runas possuem coleção e melhorias independentes das Almas.</div>';
 const runeOwned=SOUL_RUNES.filter(r=>clampRank(g.runeCollection[r.id])>0).length;
 let h=sectionTitle('Runas Místicas · 24 gravuras')+
 `<div class="stat-grid">${statTile('Fragmentos rúnicos',fmt(g.runes))}${statTile('Runas descobertas',runeOwned+' / 24')}${statTile('Gravuras reveladas',fmt(g.runeSummons))}</div>`+
 '<div class="notice-inline"><b>1 fragmento = 1 runa aleatória.</b> Duplicatas aumentam o nível sem limite. O bônus principal começa no nível 1; o secundário é desbloqueado no nível 10. Todas as runas obtidas ficam ativas permanentemente.</div>'+
 `<div class="button-row">${button('REVELAR ×1','runeReveal','1','','purple')}${button('REVELAR ×10','runeReveal','10','','purple')}${button('REVELAR MÁX. · ATÉ 250','runeReveal','250','','muted')}</div>`;
 for(const r of SOUL_RUNES){
  const lv=clampRank(g.runeCollection[r.id]),p=runePrimaryAt(lv),pn=runePrimaryAt(lv+1),secondary=runeSecondaryAt(lv),secondaryNext=runeSecondaryAt(lv+1);
  h+=entry('◇',r.name,`Runa ${fmt(lv)} · Principal: ${effectLabel(r.primary)}`,
    `PRINCIPAL (${lv>0?'ATIVO':'Nv 1'}): +${compactPercent(p)} ${effectLabel(r.primary)} → +${compactPercent(pn)} no próximo nível. SEGUNDÁRIO (${lv>=10?'ATIVO':'DESBLOQUEIA Nv 10'}): +${compactPercent(secondary)} ${effectLabel(r.secondary)} → +${compactPercent(secondaryNext)} no próximo nível.`,
    '',lv>=10?'purple':'');
 }
 const small=chestArcaneReward('small'),medium=chestArcaneReward('medium'),giant=chestArcaneReward('giant');
 h+=sectionTitle('Como conseguir Fragmentos Rúnicos')+
 '<div class="hint">A partir do Mundo II, inimigos, chefes e baús concedem fragmentos. Não é necessário gastar Almas para revelar Runas.</div>'+
 row('Baú pequeno',`+${small.runes} fragmentos garantidos`)+row('Baú médio',`+${medium.runes} fragmentos garantidos`)+row('Baú gigante',`+${giant.runes} fragmentos garantidos`);
 return h;
}
// R89: coleção permanente e estatísticas efetivas, sem prometer complementos
// do catálogo que não entram em totalStatSource(). O item forjado continua
// com as mesmas chances, custo e quantidade de afixos da R88.
function setsPanel(){
 let h=sectionTitle('Coleções permanentes do Véu')+
  '<div class="notice-inline"><b>BÔNUS CUMULATIVOS:</b> cada conjunto com 5/5 peças desbloqueia permanentemente seu efeito principal e seu bônus secundário. Não há juramentos alternativos, escolhas exclusivas ou exigência de equipar as peças. Completar todos acumula seus efeitos; tetos de suporte continuam ativos.</div>';
 h+=`<div class="stat-grid">${statTile('Coleções completas',D.sets.filter(setCompleted).length+' / '+D.sets.length)}${statTile('Únicos descobertos',(g.uniqueDiscovered||[]).length+' / '+D.uniques.length)}</div>`;
 for(const set of D.sets){
  const parts=SLOTS.filter(slot=>(g.setParts[set.id]||[]).includes(slot));
  const missing=SLOTS.filter(slot=>!parts.includes(slot));
  const ready=missing.length===0;
  const second=SET_COLLECTION_BONUSES[set.id];
  const cost=forgeCost(set);
  const subtitle=`${parts.length}/5 PEÇAS · ${ready?'DOIS BÔNUS PERMANENTES ATIVOS':'INCOMPLETO'}`;
  const description=`Registradas: ${parts.join(' · ')||'nenhuma'}. ${ready?'Coleção completa.':'Faltam: '+missing.join(' · ')+'.'} Bônus principal: ${compactMultiplier(set.mult)} ${effectLabel(set.effect)}. Efeito secundário: +${compactPercent(second.bonus)} ${effectLabel(second.effect)}. Os dois são permanentes e cumulativos; os tetos do jogo continuam válidos. A Ferraria não garante que o novo item seja superior ao equipado.`;
  const forgeAction=ready?
   `<details class="ui-expander"><summary>ESCOLHER PEÇA PARA FORJAR · ${cost} MATERIAIS</summary><div class="button-row">${SLOTS.map(slot=>button('FORJAR '+slot,'forgeSlot',set.id,slot,'muted')).join('')}</div><div class="hint">A peça continua sujeita às raridades, qualidades e filtros de venda automática. O conjunto pode produzir itens comuns até míticos. Únicos são exclusivos de drop de guardiões.</div></details>`:
   button(`FORJAR PEÇA AUSENTE: ${missing[0]} · ${cost} MATERIAIS`,'forge',set.id,'','');
  h+=entry('❖',set.name,subtitle,description,forgeAction,ready?'purple':'');
 }
 h+=sectionTitle('Descobertas Únicas · bônus de coleção permanentes');
 h+='<div class="hint">Descobrir um Único desbloqueia seu bônus de coleção para sempre, mesmo que a peça seja vendida ou substituída. O poder principal e a assinatura especial só funcionam enquanto a peça estiver equipada.</div>';
 for(const def of D.uniques){const found=(g.uniqueDiscovered||[]).includes(def.id),b=UNIQUE_COLLECTION_BONUSES[def.id];
  h+=`<div class="info-line"><span>✦ ${esc(def.name)} · ${found?'DESCOBERTO':'NÃO DESCOBERTO'}</span><small>+${compactPercent(b.bonus)} ${esc(effectLabel(b.effect))} ${found?'ATIVO':'BLOQUEADO'}</small></div>`;
 }
 return h;
}
function forgeCost(s){return 1+(g.setParts[s.id]||[]).length}
function statsPanel(){let h=sectionTitle('Registros da vigília')+`<div class="stat-grid">${statTile('Abates',fmt(g.kills))}${statTile('Tempo jogado',fmtTime(g.totalTime))}${statTile('Ouro acumulado',goldEarned.fmt())}${statTile('Maior estágio',Math.max(...g.highest))}${statTile('Pontos de talento',g.talentPoints)}${statTile('Relíquias ganhas',totalRelics.fmt())}${statTile('Mortes',g.deaths||0)}</div>`+sectionTitle('Economia e automação')+row('Intervalo estimado das fadas',Math.round(fairiesInterval())+' s de jogo')+row('Próxima fada em',Math.max(0,Math.ceil(timers.fairy))+' s de jogo')+row('Fadas por evento',fairyGroupSize())+row('Chance de Mimic',compactPercent(.013*mod('mimic_chance')))+row('Mimics (Chesterson) derrotados',fmt(g.mimicFinds||0)+' · fonte única de ouro especial')+row('Bônus efetivo All Gold',compactMultiplier(economySourceMultipliers('monsters'))+' incluindo ouro de monstros')+row('Dano universal: retorno atenuado','expoente 0,48; bônus específicos mantêm vantagem')+row('Ouro/s recente',gpsValue.fmt())+row('DPS recente',dpsValue.fmt())+row('Dificuldade',DIFF[g.difficulty])+row('Inimigos vivos',enemies.length)+row('Dano recebido',fmt(g.damageTaken||0))+row('Próximo prestígio a partir do estágio',prestigeEligibility().threshold)+row('Esquiva defensiva',g.autoRetreat?'Ativa · curta e com recarga':'Desativada')+row('Derrota','recuo de 1 fase, -50% da EXP atual, farm fixo até clicar AVANÇAR')+row('Progresso atual',g.stageHold?'FARM FIXO':'Avanço por guardião')+row('Salvamento', 'Espaço '+g.slot)+sectionTitle('Configurações')+
 `${button('SALVAR AGORA','save','','','block')}${' '}${button('CARREGAR OUTRO ESPAÇO','slots','','','muted')}${' '}${button('REDUZIR EFEITOS: '+(g.particles?'OFF':'ON'),'particles','','','muted')}${' '}${button('SOM: '+(g.sound?'ON':'OFF'),'sound','','','muted')}`;
 h+=sectionTitle('Histórico de conquistas');for(let l of g.logs.slice(0,30))h+=`<div class="info-line"><span>${esc(l.msg)}</span><small class="tag">${esc(new Date(l.t).toLocaleTimeString('pt-BR'))}</small></div>`;return h}
function renderPanel(preserveScroll=false){if(!playing)return;$('#app').classList.toggle('vf60-tree-mode',tab==='skills'&&skillView==='tree'&&panelMode==='info');const container=$('#panel-body');const oldScroll=container.scrollTop;if(panelMode==='log'){container.innerHTML=sectionTitle('Últimos acontecimentos')+g.logs.map(l=>`<div class="info-line"><span>${esc(l.msg)}</span><small class="tag">Nv ${l.s}</small></div>`).join('');}else{let render={knight:knightPanel,skills:skillsPanel,artifacts:artifactsPanel,heroes:heroesPanel,pets:petsPanel,scrolls:scrollsPanel,gear:gearPanel,village:villagePanel,world:worldPanel,souls:soulsPanel,runes:runesPanel,sets:setsPanel,stats:statsPanel}[tab];container.innerHTML=render?render():''}if(preserveScroll)container.scrollTop=oldScroll;else container.scrollTop=0;uiDirty=false}
function updateHeader(){if(!playing)return;$('#hdr-diff').textContent=bossPreviewMode?'LAB · CHEFES · ':endgameTrial?(trialScenario==='real'?'BUILD REAL · ':trialScenario==='v24000'?'PODER MAX V · ':'PODER MAX I · ')+DIFF[g.difficulty]:testMode?'LAB · '+DIFF[g.difficulty]:DIFF[g.difficulty];$('#hdr-world').innerHTML=fmt(g.stage)+` <em>/ ${g.difficulty===4?'∞':'24.000'}</em>`;$('#hdr-lvl').textContent=fmt(g.knightLevel);$('#hdr-gold').textContent=gold.fmt();$('#hdr-relics').textContent=relics.fmt();$('#hp-text').textContent=Math.ceil(player.hp)+' / '+fmt(maxHealth())+' PV';$('#mp-text').textContent=Math.ceil(player.mp)+' / '+fmt(100*mod('mana'))+' MANA';$('#exp-text').textContent='EXP '+Math.floor(clamp(xp.div(nextXP()).num(1),0,1)*100)+'%';$('#hp-fill').style.width=(100*clamp(player.hp/maxHealth(),0,1))+'%';$('#mp-fill').style.width=(100*clamp(player.mp/(100*mod('mana')),0,1))+'%';$('#battle-head-right').textContent='☠ INIMIGOS '+enemies.length+' · '+fmt(g.kills)+' ABATES';$('#level-stamp').innerHTML='NÍVEL DO MUNDO <strong>'+fmt(g.stage)+'</strong>';$('#dps').textContent='⚔ DPS: '+dpsValue.fmt();$('#golds').textContent='◆ OURO/s: '+gpsValue.fmt();$('#kills').textContent=g.stageHold?'☷ FARM FIXO':thresholdBlocked()?'⚔ LIMIAR '+(g.stage+1)+' · DERROTE O GUARDIÃO':'⚔ '+(g.stageKills>=killsReq()?'GUARDIÃO DA FASE':g.stageKills+'/'+killsReq()+' ABATES');$('#next-goal').textContent=g.stageHold?(endgameTrial&&trialScenario==='v24000'?'SIMULAÇÃO EM FARM FIXO: clique RETOMAR AVANÇO para voltar a subir de fase.':'FARM FIXO: abates NÃO avançam a fase; clique AVANÇAR para continuar.'):thresholdBlocked()?`GUARDIÃO DE LIMIAR no estágio ${g.stage}: ${thresholdMultiplier(g.stage)}× a vida de um monstro comum. Derrote-o uma vez nesta dificuldade para liberar permanentemente o marco ${g.stage+1}.`:g.stage>=24000&&g.difficulty<4&&g.worldCapCleared[g.difficulty]?'O véu pode ser rompido. Abra a aba Mundo para prestigiar.':`DERROTE O GUARDIÃO DA FASE ${g.stage} para avançar. ${Math.max(0,killsReq()-g.stageKills)} abates até o confronto.`;const advance=$('#stage-advance');advance.classList.toggle('hidden',!g.stageHold);advance.textContent=g.stage<Math.max(1,g.highest[g.difficulty]||1)?'RETOMAR · FASE '+g.stage:'RETOMAR AVANÇO';$('#footer-status').textContent=testMode?'MODO TESTE · NENHUM SAVE SERÁ ALTERADO':$('#footer-status').textContent;
 const bossUI=$('#boss-lab-controls');if(bossUI)bossUI.classList.toggle('hidden',!bossPreviewMode);const trialFarm=$('#trial-farm-toggle');if(trialFarm){trialFarm.classList.toggle('hidden',!(endgameTrial&&trialScenario==='v24000'));trialFarm.textContent=g.stageHold?'RETOMAR AVANÇO':'ATIVAR FARM FIXO';}const exitTrial=$('#exit-trial');if(exitTrial)exitTrial.classList.toggle('hidden',!endgameTrial);$('#world-tip').textContent=g.stageHold?'FARM FIXO · avance apenas quando desejar':retreating?'⚠ RECUO DEFENSIVO · recuperando PV':'A ruína não conhece descanso.';$('#auto').innerHTML='AUTO<br><small>'+(g.auto?'ON':'OFF')+'</small>';$('#auto').classList.toggle('enabled',g.auto);
 if(bossActive){$('#boss-bar').classList.remove('hidden');$('#boss-label').textContent=(bossNames[bossActive.archetype]||'GUARDIÃO')+(bossActive.bossType==='stage'?' · FASE '+bossActive.stage:bossActive.bossType==='threshold'?' · LIMIAR '+bossActive.stage:' · MARCO '+bossActive.stage)+' · ETAPA '+(bossActive.bossPhase||1);$('#boss-fill').style.width=(clamp(bossActive.hp.div(bossActive.max).num(1),0,1)*100)+'%'}else $('#boss-bar').classList.add('hidden');updateSkillbar()}
function updateSkillbar(){let h='';
 for(let i=0;i<4;i++){
  const id=g.equippedSkills?.[i],s=D.skills.find(x=>x.id===id);
  if(!s){h+=`<button class="skill-btn locked" data-action="tab" data-id="skills" title="Equipe uma habilidade na aba Habilidades"><span class="symbol">+</span><span class="key">${i+1}</span></button>`;continue}
  const locked=g.knightLevel<s.unlock,c=cd[s.id]||0,act=active[s.id]||0;
  h+=`<button class="skill-btn ${locked?'locked':''} ${act>0?'active':''}" data-action="skillCast" data-id="${s.id}" title="${esc(s.name)} · espaço ${i+1}"><span class="symbol">${SKILL_ICONS[D.skills.indexOf(s)]||'✦'}</span><span class="key">${i+1}</span>${locked?`<span class="cooldown-cover">${s.unlock}</span>`:c>0?`<span class="cooldown-cover">${c.toFixed(0)}s</span>`:''}</button>`;
 }
 $('#skills-bar').innerHTML=h;
}
function renderNav(){let n=$('#nav');n.innerHTML=NAV.map(([id,ico,label])=>`<button class="nav-btn ${tab===id?'active':''}" data-action="tab" data-id="${id}" title="${label}"><span class="glyph">${ico}</span><span>${label.toUpperCase()}</span></button>`).join('');$('#panel-title').textContent=NAV.find(x=>x[0]===tab)?.[2]||'Cavaleiro'}
function selectTab(id){tab=id;if(id==='skills')skillView='tree';panelMode='info';$('#tab-info').classList.add('active');$('#tab-log').classList.remove('active');renderNav();renderPanel();}
function renderAll(){renderNav();renderPanel();updateHeader()}
function showModal(title,desc,yes){let root=$('#modal-root');root.classList.remove('hidden');root.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><h2>${esc(title)}</h2><p>${esc(desc)}</p><div class="button-row"><button class="gamebtn muted" id="cancel-modal">CANCELAR</button><button class="gamebtn" id="accept-modal">CONFIRMAR</button></div></div>`;$('#cancel-modal').onclick=()=>root.classList.add('hidden');$('#accept-modal').onclick=()=>{root.classList.add('hidden');yes()}}
function onAction(action,id,arg){if(!playing)return;const s=D.skills.find(x=>x.id===id);switch(action){
case 'tab':selectTab(id);break;
case 'skillFocus':{
 if(D.skills.some(x=>x.id===id)){skillFocus=id;skillClass=D.skills.find(x=>x.id===id).kind;treeSelectedNode=D.skills.find(x=>x.id===id).nodes.at(-1).id;treeTier=5;skillView='tree';renderPanel();}
 break;
}
case 'skillOpenTree':skillView='tree';renderPanel();break;
case 'skillBack':skillView='catalog';renderPanel();break;
case 'treeClass':if(TALENT_CLASS_LAYOUT[id]){skillClass=id;treeSelectedNode=D.skills.find(s=>s.id===TALENT_CLASS_LAYOUT[id].branches[0]).nodes[0].id;skillView='tree';renderPanel();}break;

case 'treeSelect':if(D.skills.some(s=>s.kind===skillClass&&s.nodes.some(n=>n.id===id))){treeSelectedNode=id;renderPanel(true);}break;
case 'talentResetClass':{
 const names=TALENT_CLASS_LAYOUT[id];if(!names)break;
 const group=names.branches.map(x=>D.skills.find(s=>s.id===x));
 const invested=group.reduce((n,s)=>n+talentSpentForLevels(s,g.talents),0);
 if(!invested){alertGame('Não há talentos investidos nesta afinidade.');break}
 showModal('Redefinir árvore '+names.name,`Devolver ${invested} pontos de talento gastos nas 3 trilhas de ${names.name}? Outras afinidades permanecem intactas.`,()=>{
  for(const s of group)for(const n of s.nodes)delete g.talents[n.id];
  g.talentSpent=D.skills.reduce((n,s)=>n+talentSpentForLevels(s,g.talents),0);
  alertGame('Árvore de '+names.name+' redefinida: '+invested+' PT recuperados.');save(g.slot,true);renderPanel(true);
 });break;
} 
case 'skillEquip':{
 skillFocus=id;
 const changed=equipSkill(id);
 if(changed){save(g.slot,true);updateSkillbar();}
 break;
}
case 'skillCast':fireSkill(id,true);break;
case 'talentReset':{
 const skill=D.skills.find(x=>x.id===id);
 const plan=planTalentRemoval(skill);
 if(!plan){alertGame('Esta árvore não possui pontos para remover.');break}
 showModal('Remover todos os talentos',`Devolver ${plan.refund} pontos investidos APENAS na árvore ${skill.name}? Outras árvores não serão afetadas.`,()=>applyTalentRemoval(skill,plan));
 break;
}
case 'talentRemove':{
 const skill=D.skills.find(x=>x.nodes.some(n=>n.id===id));
 const node=skill?.nodes.find(n=>n.id===id);
 const plan=planTalentRemoval(skill,id);
 if(!plan){alertGame('Este talento não possui pontos para remover.');break}
 if(plan.removed.length){
  showModal('Reembolso de talentos dependentes',`Remover 1 rank de ${node.name} invalidará os seguintes talentos: ${plan.removed.join(', ')}. Serão devolvidos ${plan.refund} pontos no total. Confirmar?`,()=>applyTalentRemoval(skill,plan));
 } else applyTalentRemoval(skill,plan);
 break;
}
case 'talent':{
 const skill=D.skills.find(x=>x.nodes.some(n=>n.id===id)),node=skill?.nodes.find(n=>n.id===id);
 if(!node)break;
 const req=talentRequirements(skill,node);
 if(g.knightLevel<talentUnlockLevel(skill,node)){alertGame('Requer cavaleiro Nv '+talentUnlockLevel(skill,node));break}
 if(!req.canBuy){alertGame(`Requer ${req.threshold} pontos neste ramo, pré-requisitos e ${req.cost} pontos livres. Especializações finais exigem investimento nos demais talentos.`);break}
 g.talents[id]=(g.talents[id]||0)+1;g.talentSpent+=req.cost;
 alertGame(node.name+' · Rank '+g.talents[id]+'/'+node.ranks+' · custo '+req.cost+' pontos');
 save(g.slot,true);break;
}
case 'prestige':knightPrestige();break;
case 'discover':{let count=artCount();if(count>=D.artifacts.length){alertGame('Coleção de artefatos completa.');break}let next=chooseArtifact();if(!next){alertGame('Nenhum artefato disponível ainda. Desbloqueie as habilidades restantes para ampliar as descobertas.');break}if(!spendRelics(artifactDiscoverCost(count))){alertGame('Relíquias insuficientes.');break}g.artifactLevels[next.id]=1;if(trialTelemetry&&endgameTrial&&trialScenario==='real')trialTelemetry.artifactDiscoveries++;sound('relic');alertGame((count===4?'5ª DESCOBERTA GARANTIDA: ':'Artefato descoberto: ')+next.name);save(g.slot,true);break}
case 'artBuyMode':if(ART_BUY_MODES.some(m=>m.id===id))artifactBuyMode=id;break;
case 'artQuote':if(D.artifacts.some(a=>a.id===id&&(g.artifactLevels[id]||0)>0))artifactQuoteId=artifactQuoteId===id?null:id;break;
case 'artFavorite':{const x=D.artifacts.find(a=>a.id===id);if(!x||(g.artifactLevels[id]||0)<1)break;
 g.artifactFavorites=normalizeArtifactFavorites(g.artifactFavorites);
 if(g.artifactFavorites.includes(id))g.artifactFavorites=g.artifactFavorites.filter(x=>x!==id);
 else g.artifactFavorites.push(id);
 save(g.slot,true);break}
case 'artFavoritesUpgrade':artifactUpgradeFavorites();break;
case 'artUpgrade':artifactUpgradeOne(id);break;
case 'batch':batch=Number(id);break;
case 'endgameStartReal':startEndgameTrial('real');break;
case 'endgameStart':startEndgameTrial();break;
case 'endgameStartV':startEndgameTrial('v24000');break;
case 'endgameExit':exitEndgameTrial();break;
case 'trialExport':exportTrialTelemetry();break;
case 'heroLab':enterHeroLab(Number(id));break;
case 'trialFarmToggle':{
 if(!endgameTrial||trialScenario!=='v24000')break;
 g.stageHold=!g.stageHold;
 if(g.stageHold)g.stageKills=0;
 alertGame(g.stageHold?'SIMULAÇÃO V: FARM FIXO ATIVADO, progresso pausado.':'SIMULAÇÃO V: avanço automático ativado, abates avançam a fase.');
 updateHeader();break;
}
case 'heroLabExit':exitHeroLab();break;
case 'heroDetail':heroDetailId=heroDetailId===id?null:id;break;
case 'autoHeroesToggle':g.autoHeroes=!g.autoHeroes;alertGame('Compra automática de heróis '+(g.autoHeroes?'ATIVADA':'DESATIVADA'));save(g.slot,true);break;
case 'heroBuyAll':{const result=buyAndTranscendAllHeroes(true);if(!result.levels&&!result.transcensions)alertGame('Nenhum nível ou transcendência disponível no momento.');save(g.slot,true);break;}
case 'heroBuy':{
 const hero=D.heroes.find(x=>x.id===id);if(!hero)break;
 const level=g.heroLevels[id]||0;
 const purchase=heroPurchasePlan(hero,level,batch,gold);
 if(!purchase.levels){alertGame(level>=8000?'Herói pronto para transcender.':'Ouro insuficiente para o próximo nível.');break}
 if(!spendGold(purchase.cost)){alertGame('Ouro insuficiente.');break}
 const investmentBefore=heroInvestmentLevel(id,level);
 g.heroLevels[id]=purchase.finalLevel;
 g.heroUpgradeProgress[id]=investmentBefore+purchase.levels;
 alertGame(`${hero.name}: +${fmt(purchase.levels)} níveis por ${purchase.cost.fmt()} ouro. Nv ${fmt(level)} → ${fmt(purchase.finalLevel)}.`);
 feed(hero.name+' subiu '+fmt(purchase.levels)+' níveis');
 break;
}
case 'transcend':if((g.heroLevels[id]||0)>=8000){
 const hero=D.heroes.find(x=>x.id===id);if(!hero)break;
 if(transcendEligibleHero(hero)){
  alertGame('Transcendência de '+hero.name+'! Custo e bônus anteriores preservados.');
  feed(hero.name+': transcendência '+g.heroTrans[id]+' · marcos permanentes');
  save(g.slot,true);
 }
}break;
case 'scrollMinFilter':scrollMinOnly=!scrollMinOnly;break;
case 'petEquip':{
 const pet=D.pets.find(x=>x.id===id);if(!pet||(g.petLevels[id]||0)<=0)break;
 g.petSelected=normalizePetSelection(g.petSelected);
 const current=g.petSelected.find(x=>D.pets.some(p=>p.id===x&&p.group===pet.group));
 // Swap one slot without disabling unrelated passive pet bonuses.
 if(current!==id){g.petSelected=g.petSelected.filter(x=>x!==current);g.petSelected.push(id);}
 alertGame('Pet '+pet.group+' equipado: '+pet.name);save(g.slot,true);break;
}
case 'gearCategory':{if(SLOTS.includes(id)){gearCategory=id;gearPage=0;}break}
case 'gearPage':{const page=Number(id);const count=gearSortedForSlot(g.inventory||[],gearCategory).length;const max=Math.max(0,Math.ceil(count/GEAR_PAGE_SIZE)-1);if(Number.isInteger(page))gearPage=clamp(page,0,max);break}
case 'gearEquip':{let item=g.inventory.find(x=>String(x.id)===String(id));if(item){g.equipped[item.slot]=item;alertGame('Equipado: '+item.name)}break}
case 'gearFavorite':{const item=g.inventory.find(x=>String(x.id)===String(id));if(item){item.favorite=!item.favorite;alertGame((item.favorite?'Protegido: ':'Favorito removido: ')+item.name);save(g.slot,true);}break;}
case 'gearUnequip':g.equipped[id]=null;break;
case 'gearToggleAutoProtect':{
 g.autoSellProtectUpgrades=!g.autoSellProtectUpgrades;
 alertGame('Proteção de melhorias na venda automática '+(g.autoSellProtectUpgrades?'ATIVADA':'DESATIVADA'));
 save(g.slot,true);break;
}
case 'autoSellToggle':{
 const rarity=Number(id);if(!Number.isInteger(rarity)||rarity<0||rarity>5)break;
 const set=new Set(g.autoSellRarities||[]);
 if(set.has(rarity))set.delete(rarity);else set.add(rarity);
 g.autoSellRarities=[...set].sort((a,b)=>a-b);
 alertGame('Venda automática: '+RARITY[rarity]+' '+(set.has(rarity)?'ATIVADA':'DESATIVADA'));
 save(g.slot,true);break;
}
case 'gearSell':{
 const item=g.inventory.find(x=>String(x.id)===String(id));
 if(item&&!item.favorite&&!Object.values(g.equipped).some(x=>x?.id===item.id))sellGearItem(item,false);
 else alertGame(item?.favorite?'Remova o favorito antes de vender.':'Desequipe o item antes de vendê-lo.');break;
}
case 'gearSellAll':{
 const equippedIds=new Set(Object.values(g.equipped||{}).filter(Boolean).map(x=>String(x.id)));
 const targets=g.inventory.filter(item=>item&&!item.favorite&&!equippedIds.has(String(item.id)));
 if(!targets.length){alertGame('Nenhum equipamento desprotegido para vender.');break;}
 const cents=targets.reduce((n,item)=>n+Math.round(saleValue(item)*100),0);
 showModal('Vender equipamentos em massa',`Vender ${targets.length} equipamentos por ${(cents/100).toLocaleString('pt-BR')} cédulas? Favoritos e equipados permanecem guardados. Esta operação não pode ser desfeita.`,()=>{const result=sellAllUnprotectedGear();alertGame(`Venda concluída: ${result.count} itens · +${result.amount.toLocaleString('pt-BR')} cédulas.`);save(g.slot,true);renderPanel(true)});
 break;
}
case 'farmGearMilestone':{
 const current=g.stage,highest=Math.max(1,g.highest[g.difficulty]||1);
 const base=id==='previous'?15*Math.floor((current-1)/15):15*Math.floor(current/15);
 const target=Math.min(highest,base);
 if(target<15){alertGame('Conquiste primeiro o estágio 15 para farmar ouro e EXP em marcos anteriores.');break}
 g.stage=target;g.stageHold=true;g.stageKills=0;
 // Visiting old stages must not alter prestige peak or permanent highest record.
 enemies=[];queue=[];bossActive=null;active={};cd={};clearSkillReactions();timers.equipRespawn=EQUIPMENT_BOSS_RESPAWN_SECONDS;
 player.hp=maxHealth();player.contactInvuln=1.5;
 for(let i=0;i<Math.min(8,aliveTarget());i++)spawnEnemy(true);
 scheduleBosses(g.stage,true);
 alertGame('FARM FIXO no marco '+g.stage+' · ouro e EXP; equipamentos de fases vencidas não caem.');
 save(g.slot,true);break;
}
case 'returnHighest':{
 const target=Math.max(1,g.highest[g.difficulty]||1);
 g.stage=target;g.stageHold=false;g.stageKills=0;
 enemies=[];queue=[];bossActive=null;active={};cd={};
 for(let i=0;i<aliveTarget();i++)spawnEnemy(true);scheduleBosses(g.stage,true);
 alertGame('Retorno ao recorde: estágio '+target);save(g.slot,true);break;
}
case 'building':{if(id==='pet'&&(g.buildings.pet||1)>=PET_SANCTUARY_MAX_LEVEL){alertGame('Santuário no nível máximo: 1 ovo por hora.');break}const cost=buildingCost(id);if(!cost)break;if(['wood','stone','iron'].every(resource=>g.village[resource]>=cost[resource])){for(const resource of ['wood','stone','iron'])g.village[resource]-=cost[resource];g.buildings[id]=(g.buildings[id]||1)+1;alertGame('Construção melhorada!')}else alertGame('Materiais insuficientes: '+villageCostText(cost)+'.');break}
case 'sellMaterial':{
 if(!(id in VILLAGE_RESOURCE_PRICES))break;
 const units=arg==='all'?Math.floor(Math.max(0,g.village[id])):0;
 if(units<1){alertGame('Nenhum material inteiro disponível para vender.');break;}
 if(g.village[id]+1e-8<units){alertGame('Recursos insuficientes para vender '+units+' unidades.');break}
 g.village[id]=Math.max(0,g.village[id]-units);
 const payment=Math.round(VILLAGE_RESOURCE_PRICES[id]*units*100)/100;
 g.village.banknotes=Math.round((Number(g.village.banknotes)||0)*100+payment*100)/100;
 alertGame('Venda concluída: +'+payment.toLocaleString('pt-BR')+' cédulas.');
 save(g.slot,true);break;
 }
case 'chest':openVillageChest(id);break;
case 'setFocus':
case 'setFocusClear':{g.setFocusId=null;alertGame('R93: conjuntos são permanentes e cumulativos. Nenhuma seleção é necessária.');break;}
case 'forge':
case 'forgeSlot':{
 const set=D.sets.find(x=>x.id===id);
 if(!set)break;
 const missing=SLOTS.filter(slot=>!(g.setParts[set.id]||[]).includes(slot));
 // Não permitir pular peças ausentes ou selecionar slots arbitrários por uma
 // ação de UI antiga. Após completar, a escolha é obrigatória e explícita.
 let slot;
 if(missing.length){
  if(action!=='forge'){alertGame('Complete o conjunto antes de escolher a peça.');break;}
  slot=missing[0];
 }else{
  if(action!=='forgeSlot'||!SLOTS.includes(arg)){alertGame('Escolha o tipo de peça para forjar.');break;}
  slot=arg;
 }
 const price=forgeCost(set);
 if(g.village.forge<price){alertGame('Materiais de forja insuficientes.');break;}
 g.village.forge-=price;
 const item=giveGear(g.stage,g.difficulty,set.id,slot);
 const kept=g.inventory.some(x=>x.id===item.id);
 alertGame('Forjado: '+item.name+(kept?'':' · vendido pelo filtro automático'));
 break;
}
case 'difficulty':{let d=Number(id);if(d>=0&&d<g.unlocked&&d!==g.difficulty){g.difficulty=d;g.stage=Math.max(1,g.highest[d]||1);g.runPeak=g.stage;g.runStartStage=g.stage;g.runKills=0;g.stageHold=false;g.stageKills=0;enemies=[];queue=[];bossActive=null;for(let i=0;i<aliveTarget();i++)spawnEnemy(true);scheduleBosses(g.stage,true);alertGame('Viajou para '+DIFF[d]);save()}break}
case 'worldPrestige':if(g.stage>=24000&&g.difficulty<4&&g.worldCapCleared[g.difficulty]){showModal('Prestígio de Mundo',`Desbloquear ${DIFF[g.difficulty+1]}? A nova dificuldade começa muito acima da ameaça anterior. Você poderá voltar para farmar.`,()=>{g.difficulty++;g.worldPrestiges++;g.unlocked=Math.max(g.unlocked,g.difficulty+1);g.stage=1;g.runPeak=1;g.runStartStage=1;g.runKills=0;g.stageHold=false;g.highest[g.difficulty]=Math.max(1,g.highest[g.difficulty]||0);g.stageKills=0;enemies=[];queue=[];bossActive=null;for(let i=0;i<Math.min(8,aliveTarget());i++)spawnEnemy(true);sound('prestige');alertGame('O VÉU SE ROMPEU! Coleção de Ecos, Pesquisa Proibida e Runas desbloqueadas.');save();renderAll()})}else alertGame('Requer derrotar o Guardião da fase 24.000.');break;
case 'soulAffinity':if(SOUL_AFFINITY_OPTIONS.some(x=>x[0]===id))g.soulAffinity=id;break;
case 'soulSummon':summonEcho(Number(id));save(g.slot,true);break;
case 'runeReveal':revealRunes(Number(id));save(g.slot,true);break;
case 'soulResearch':investResearch(id);save(g.slot,true);break;
case 'advanceStage':{
 if(!g.stageHold){alertGame('O avanço automático já está ativo.');break}
 const from=g.stage,limit=g.difficulty<4?24000:Number.MAX_SAFE_INTEGER;
 if(thresholdBlocked()){g.stageHold=false;g.stageKills=0;scheduleBosses(g.stage,true);alertGame('Derrote o Guardião de Limiar para avançar.');break;}
 // Returning from a defeat no longer skips the boss of the stage.
 // Use the separate "return to record" convenience to revisit cleared progress.
 g.stageHold=false;g.stageKills=0;scheduleBosses(g.stage,true);
 alertGame('Progressão retomada: derrote o Guardião da fase '+g.stage+' para avançar.');
 save(g.slot,true);break;
 }
case 'focus':g.attackFocus=id;break;
case 'sound':g.sound=!g.sound;break;
case 'particles':g.particles=!g.particles;break;
case 'retreatToggle':g.autoRetreat=!g.autoRetreat;retreating=false;retreatDestination=null;retreatCooldown=0;save(g.slot,true);break;
case 'save':save(g.slot,false);break;
case 'slots':openSlotModal();break;
 }
 uiDirty=true;renderPanel(true);updateHeader()}
function openSlotModal(){if(testMode){alertGame('Encerre o modo de teste antes de trocar de campanha.');return}let root=$('#modal-root');root.classList.remove('hidden');root.innerHTML=`<div class="modal"><h2>Espaços de campanha</h2><p>Salve sua jornada atual ou carregue um espaço existente. Cada espaço é mantido localmente neste navegador.</p><div class="button-row">${[1,2,3].map(x=>`<button class="gamebtn" data-slot="${x}">ESPAÇO ${x}</button>`).join('')}<button id="cancel-modal" class="gamebtn muted">FECHAR</button></div></div>`;$('#cancel-modal').onclick=()=>root.classList.add('hidden');root.querySelectorAll('[data-slot]').forEach(btn=>btn.onclick=()=>{let slot=+btn.dataset.slot;root.classList.add('hidden');if(safeStorage.getItem(BKEY+slot)){showModal('Carregar campanha '+slot,'O progresso não salvo na campanha atual será perdido.',()=>{if(!load(slot))alertGame('Não foi possível carregar esse espaço.')})}else{showModal('Criar campanha '+slot,'Iniciar uma nova jornada nesse espaço?',()=>startNew(slot))}})}
function settingsModal(){let root=$('#modal-root');root.classList.remove('hidden');root.innerHTML=`<div class="modal"><h2>Configurações</h2><p>Partida automática e salvamento local. Seu progresso é guardado somente neste navegador; não é sincronizado com a nuvem.</p><div class="button-row"><button class="gamebtn" data-action="save">SALVAR</button><button class="gamebtn" data-action="slots">ESPAÇOS 1–3</button><button class="gamebtn muted" data-action="autoHeroesToggle">HERÓIS AUTO ${g.autoHeroes?'ON':'OFF'}</button><button class="gamebtn muted" data-action="sound">SOM ${g.sound?'ON':'OFF'}</button><button class="gamebtn muted" data-action="particles">EFEITOS ${g.particles?'ON':'OFF'}</button><button class="gamebtn muted" id="cancel-modal">FECHAR</button></div></div>`;$('#cancel-modal').onclick=()=>root.classList.add('hidden')}
function circleGlow(x,y,r,color,alpha=.38){let grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'transparent');ctx.globalAlpha=alpha;ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
function drawImg(name,x,y,w,h,opacity=1){let image=sprites[name];if(image&&image.complete&&image.naturalWidth){ctx.globalAlpha=opacity;ctx.drawImage(image,x-w/2,y-h*.72,w,h);ctx.globalAlpha=1}else{ctx.fillStyle='#e5be94';ctx.beginPath();ctx.arc(x,y,14,0,Math.PI*2);ctx.fill()}}
function drawHealth(x,y,w,frac,color){ctx.fillStyle='#090a12';ctx.fillRect(x-w/2,y,w,5);ctx.fillStyle=color;ctx.fillRect(x-w/2,y,Math.max(0,w*clamp(frac,0,1)),5);ctx.strokeStyle='#aca09055';ctx.lineWidth=1;ctx.strokeRect(x-w/2,y,w,5)}
function drawKnightAnimated(){
 // Approved Celestial Knight uses a single immutable golden armor design.
 // The equipment inventory never swaps this sprite. Breathing and attack recoil
 // are eased transforms; final directional frame sheets will be authored later.
 const strike=knightSwing>0?Math.sin(Math.PI*(1-knightSwing/.23))*.105:0;
 ctx.save();ctx.translate(player.x,player.y+4+Math.sin(heroAnim*2.8)*1.4);
 ctx.rotate(strike);ctx.scale(1+strike*.12,1-strike*.08);
 drawImg('knight',0,0,123,133);
 // A short, animated sword trail on basic attacks; no equipment alters the fixed silhouette.
 if(knightSwing>0){
   const progress=1-knightSwing/.23;
   ctx.save();ctx.globalAlpha=Math.max(0,Math.sin(progress*Math.PI))*.9;
   ctx.strokeStyle='#ffd37a';ctx.lineCap='round';ctx.lineWidth=6;
   ctx.shadowColor='#ffb84d';ctx.shadowBlur=17;
   ctx.beginPath();ctx.arc(17,-19,72,-1.7+progress*1.5,-.9+progress*1.8);ctx.stroke();
   ctx.lineWidth=2;ctx.strokeStyle='#fff1c1';ctx.beginPath();
   ctx.arc(17,-19,79,-1.7+progress*1.5,-.9+progress*1.8);ctx.stroke();ctx.restore();
 }
 ctx.restore();
}
function drawArena(){let W=canvas.width,H=canvas.height;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,W,H);else{ctx.fillStyle='#15151e';ctx.fillRect(0,0,W,H)}
 // Zoom out around canvas center. All combat actors + VFX retain a shared coordinate space.
 ctx.save();ctx.translate(W/2,H/2);ctx.scale(CAMERA_ZOOM,CAMERA_ZOOM);ctx.translate(-W/2,-H/2);
 const shimmer=heroAnim*.7;ctx.save();ctx.globalAlpha=.11;ctx.strokeStyle='#a36484';ctx.lineWidth=2;ctx.beginPath();ctx.arc(560,340,161+Math.sin(shimmer)*5,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(560,340,211+Math.cos(shimmer*.7)*5,0,Math.PI*2);ctx.stroke();ctx.restore();
 // soft smoke and ambient arcane particles
 if(g.particles){for(let i=0;i<32;i++){let x=(i*199+heroAnim*(i%2?6:-4)+20000)%W,y=(i*119+Math.sin(heroAnim*.3+i)*22)%H;ctx.fillStyle='rgba(186,139,147,'+(.045+.04*Math.sin(heroAnim+i)**2)+')';ctx.fillRect(x,y,i%5===0?3:1,i%5===0?3:1)}}
 drawBossWarnings();
 let order=enemies.slice().sort((a,b)=>a.y-b.y);
 for(let en of order){let isBoss=en.kind==='boss',size=isBoss?130:en.kind==='elite'?78:en.kind==='mimic'?78:70;let bob=Math.sin(heroAnim*3.1+en.phase)*1.4;circleGlow(en.x,en.y+15,isBoss?94:en.kind==='elite'?48:36,isBoss?'#cf4656':en.marked?'#9360db':en.curse?'#6549a1':'#7c2737',isBoss?.15:.09);
 let sprite=isBoss?'boss_'+(en.archetype||'carrasco'):en.kind==='elite'?'cultist':en.kind==='mimic'?'mimic':en.kind==='beast'?'beast':en.kind==='wraith'?'wraith':en.kind==='cultist'?'cultist':'skeleton';
 if(isBoss)drawAnimatedBoss(en);else {
   // R41: motion phases are tied to each enemy, rather than a static portrait.
   const t=heroAnim*5.2+en.phase;
   const walk=Math.sin(t), stagger=Math.max(0,Math.min(1,en.hit*2.8));
   const leap=(en.kind==='beast'?2.9:1.2)*Math.abs(walk);
   ctx.save();ctx.translate(en.x,en.y+bob-leap);
   ctx.rotate(walk*.045+(stagger*.12));
   ctx.scale(1+Math.abs(walk)*.025+stagger*.08,1-Math.abs(walk)*.038-stagger*.09);
   drawImg(sprite,0,0,size,size*1.08,Math.max(.55,1-en.hit*.7));
   ctx.restore();
   if(stagger>.12){ctx.save();ctx.globalAlpha=stagger*.7;ctx.strokeStyle='#ffe1a4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(en.x,en.y-19,size*.33,0,Math.PI*1.3);ctx.stroke();ctx.restore();}
 }
 if(en.marked){ctx.strokeStyle='#b286f0aa';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(en.x,en.y-20,size*.36,0,Math.PI*2);ctx.stroke();}
 if(en.ember>0){ctx.save();ctx.globalAlpha=.5+.35*Math.sin(heroAnim*7);ctx.shadowBlur=12;ctx.shadowColor='#ff9d40';ctx.strokeStyle='#ffae52';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(en.x,en.y-36,9,heroAnim,heroAnim+Math.PI*1.65);ctx.stroke();ctx.restore();}if(en.veilExposure>0){ctx.save();ctx.globalAlpha=.7;ctx.strokeStyle='#c785fa';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(en.x-8,en.y-37);ctx.lineTo(en.x,en.y-48);ctx.lineTo(en.x+8,en.y-37);ctx.stroke();ctx.restore();}if(en.curse){ctx.fillStyle='#9f7de2';ctx.font='16px Georgia';ctx.fillText('♱',en.x+14,en.y-45)}
 // Normal monsters show an HP bar briefly after being hit, so the damage is verifiable.
 if(isBoss||en.kind==='elite'||en.stage<g.stage||en.hit>0){let fraction=clamp(en.hp.div(en.max).num(1),0,1);drawHealth(en.x,en.y-size*.67,isBoss?102:en.kind==='elite'?55:36,fraction,isBoss?'#e3a57c':en.stage<g.stage?'#bb9bde':'#a64d65')}
 }
 if(active.fury>0)circleGlow(player.x,player.y,98,'#dd4a65',.25);
 if(active.demons>0)circleGlow(player.x,player.y,78,'#ffdc7a',.19);
 if(active.curse>0)circleGlow(player.x,player.y,120,'#9e74d0',.13);
 circleGlow(player.x,player.y+18,62,active.grace>0?'#fbe1a8':'#d9b19a',.09);
 drawKnightAnimated();
 if(player.hitFlash>0){ctx.save();ctx.globalAlpha=clamp(player.hitFlash/.32,0,1)*.85;ctx.strokeStyle='#ff536b';ctx.lineWidth=4;ctx.shadowColor='#fc2948';ctx.shadowBlur=18;ctx.beginPath();ctx.ellipse(player.x,player.y+9,38,23,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
 // golden floating oath ring and circular physical slash
 if(active.grace>0){ctx.save();ctx.strokeStyle='#faebbe';ctx.globalAlpha=.45;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(player.x,player.y+6,56+Math.sin(heroAnim*2)*2,22,heroAnim*.15,0,Math.PI*2);ctx.stroke();ctx.restore()}
 for(let e of effects){let p=e.t/e.life,alpha=(1-p)*.75;
 if(e.x2!==undefined){
  ctx.save();ctx.globalAlpha=Math.max(0,1-p)*.9;ctx.strokeStyle=e.color;ctx.lineCap='round';
  ctx.lineWidth=e.kind==='lightning'?3.6:4;ctx.shadowColor=e.color;ctx.shadowBlur=16;
  ctx.beginPath();ctx.moveTo(e.x,e.y);
  if(e.kind==='lightning'||e.kind==='veillink'){
   for(let i=1;i<6;i++){
    const t=i/6,offset=Math.sin((i*17.3)+heroAnim*14)*(8*(1-Math.abs(t-.5)));
    ctx.lineTo(e.x+(e.x2-e.x)*t+(e.y-e.y2)/Math.max(40,Math.hypot(e.x2-e.x,e.y2-e.y))*offset,
     e.y+(e.y2-e.y)*t+(e.x2-e.x)/Math.max(40,Math.hypot(e.x2-e.x,e.y2-e.y))*offset);
   }
  }
  ctx.lineTo(e.x2,e.y2);ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#fff7e0';ctx.stroke();ctx.restore();continue;
 }
 ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=e.color;ctx.lineWidth=e.kind==='slash'?7:e.kind==='spear'?5:e.kind==='electric'?4:3;ctx.shadowColor=e.color;ctx.shadowBlur=e.kind==='slash'?16:9;ctx.beginPath();let rr=e.r*(.4+p*.9);if(e.kind==='slash'){ctx.arc(e.x,e.y,rr,-1.7+p*.3,1.4+p*.5)}else{ctx.ellipse(e.x,e.y,rr,rr*(e.kind==='aura'?.45:.65),0,0,Math.PI*2)}ctx.stroke();if(['magic','death','fireburst','electric','spear','embermark','emberburst','veilburst'].includes(e.kind)){ ctx.globalAlpha=alpha*.15;ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(e.x,e.y,rr*.75,0,Math.PI*2);ctx.fill()}if(['emberburst','veilburst','embermark'].includes(e.kind)){
  ctx.beginPath();ctx.lineWidth=2;ctx.globalAlpha=alpha*.9;
  const rays=e.kind==='embermark'?5:9;
  for(let k=0;k<rays;k++){const a=k*Math.PI*2/rays+heroAnim*.2;
   const inner=rr*.60,outer=rr*(e.kind==='veilburst'?1.18:1.36);
   ctx.moveTo(e.x+Math.cos(a)*inner,e.y+Math.sin(a)*inner*.65);
   ctx.lineTo(e.x+Math.cos(a)*outer,e.y+Math.sin(a)*outer*.65);
  }ctx.stroke();}ctx.restore()}
 drawBossEmbers();
 for(let f of floating){ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,f.life));ctx.font=(f.big?'bold 21px':'bold 14px')+' Georgia,serif';ctx.lineWidth=4;ctx.textAlign='center';ctx.strokeStyle='#160916';ctx.strokeText(f.txt,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.txt,f.x,f.y);ctx.restore()}
 ctx.restore(); // End world camera: pause text and UI use unscaled screen coordinates.
 if(paused){ctx.fillStyle='#090812b8';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#efd7b8';ctx.font='39px Georgia';ctx.fillText('VIGÍLIA SUSPENSA',W/2,H/2);ctx.font='16px Georgia';ctx.fillText('Pressione espaço para continuar',W/2,H/2+36)}
}
function updateSpeedDisplay(){
 const b=$('#speed');if(!b)return;
 b.textContent='▶ ×'+g.speed;
 b.title=g.speed===100?'MODO TESTE: simula 100 segundos para cada segundo real, conforme a capacidade do computador. Clique para voltar a ×1.':'Velocidade ×1 → ×3 → ×10 → ×100 (teste)';
 b.setAttribute('aria-label','Velocidade do jogo '+g.speed+' vezes');
}
function setGameSpeed(next){
 // Flush the prior clock at the old speed before changing speed. Never
 // discard already accrued time, even if the tab was background-throttled.
 advanceWallClock(Date.now(),false);
 g.speed=SPEED_LEVELS.includes(Number(next))?Number(next):1;
 updateSpeedDisplay();return g.speed;
}
// R46 — Background simulation: rendering may be suspended by the browser, but
// wall-clock time still accrues. The fixed-step backlog is handled in bounded
// batches, so a minimized window cannot cause a giant dt or an infinite loop.
// This also recovers progress after browsers temporarily freeze a hidden tab.
function advanceWallClock(now=Date.now(),renderAllowed=true){
 const elapsed=Math.max(0,(now-backgroundWallMs)/1000);
 backgroundWallMs=now;
 if(!playing||paused){return 0}
 if(elapsed>0){simAccumulator+=elapsed*g.speed}
 let ticks=0;
 const started=performance.now(),budget=renderAllowed?10:22;
 while(simAccumulator+1e-9>=SIM_TICK&&ticks<MAX_TICKS_PER_FRAME){
  updateCombat(SIM_TICK);simAccumulator=Math.max(0,simAccumulator-SIM_TICK);ticks++;
  if(ticks>=6&&performance.now()-started>=budget)break;
 }
 // Intentionally NEVER clamp simAccumulator: clamping silently erased hours of
 // gameplay whenever requestAnimationFrame was suspended or the CPU was slow.
 realTimeCounters.header+=elapsed;
 realTimeCounters.panel+=elapsed;
 realTimeCounters.save+=elapsed;
 if(renderAllowed){
  if(realTimeCounters.header>=.24){realTimeCounters.header=0;updateHeader()}
  if(realTimeCounters.panel>=.85){realTimeCounters.panel=0;if(uiDirty)renderPanel(true)}
 }
 if(realTimeCounters.save>=30){
  realTimeCounters.save=0;if(!testMode)save(g.slot,true);
 }
 return ticks;
}
function gameFrame(){
 advanceWallClock(Date.now(),!document.hidden);
 if(playing&&!document.hidden)drawArena();
 requestAnimationFrame(gameFrame);
}
// A hidden tab's rAF can stop entirely. Timers may also be throttled, but any
// missing real time will be collected by the wall clock on the next callback.
setInterval(()=>{if(document.hidden)advanceWallClock(Date.now(),false)},750);
document.addEventListener('visibilitychange',()=>{
 const wasPending=simAccumulator;
 advanceWallClock(Date.now(),!document.hidden);
 if(!document.hidden&&playing&&!paused&&simAccumulator>10){
  $('#combat-msg').textContent='Recuperando '+Math.floor(simAccumulator)+' s de combate em segundo plano, sem descartar abates.';
 }else if(!document.hidden&&wasPending>10&&simAccumulator<=10&&playing){
  $('#combat-msg').textContent='Combate em segundo plano sincronizado.';
 }
});
function togglePause(){if(!playing)return;paused=!paused;$('#pause').textContent=paused?'▶':'Ⅱ';$('#combat-msg').textContent=paused?'Jogo pausado. Clique no botão ▶ ou pressione ESPAÇO.':'O combate prossegue.'}
function bindControls(){document.addEventListener('click',event=>{let b=event.target.closest('[data-action]');if(b){let inmodal=b.closest('#modal-root');if(inmodal&&b.dataset.action!=='slots'){/* use same action handler */}onAction(b.dataset.action,b.dataset.id||'',b.dataset.arg||'')}});
 const realMenuTrial=$('#start-real-campaign-test');if(realMenuTrial)realMenuTrial.addEventListener('click',()=>{
  // Loading a save follows the ordinary Continue flow (including offline production).
  // The subsequent laboratory simulation is isolated by labSnapshot() and testMode.
  if(!playing&&!load(1)){alertGame('Não há campanha salva no espaço 1. Inicie ou importe uma jornada primeiro.');return;}
  startEndgameTrial('real');
 });
 $('#start-endgame-test').addEventListener('click',()=>startEndgameTrial());
 $('#start-difficulty-five-test').addEventListener('click',()=>startEndgameTrial('v24000'));
 const bossStart=$('#start-boss-preview');if(bossStart)bossStart.addEventListener('click',()=>startBossPreview(0));
 document.querySelectorAll('[data-boss-preview]').forEach(b=>b.addEventListener('click',()=>switchBossPreview(Number(b.dataset.bossPreview))));
 $('#new-game').addEventListener('click',()=>{if(safeStorage.getItem(BKEY+'1'))showModal('Iniciar nova jornada?','Uma nova campanha substituirá o salvamento do espaço 1. Deseja continuar?',()=>startNew(1));else startNew(1)});
 $('#continue-game').addEventListener('click',()=>{if(!load(1)){alertGame('Nenhuma campanha salva encontrada. Inicie uma nova jornada.')}});
 $('#speed').addEventListener('click',()=>{
 const idx=SPEED_LEVELS.indexOf(g.speed);
 const speed=setGameSpeed(SPEED_LEVELS[(idx+1)%SPEED_LEVELS.length]);
 alertGame(speed===100?'MODO TESTE ×100: combate, recompensas e produção acelerados.':'Velocidade de jogo ×'+speed);
 save(g.slot,true);
});
 $('#pause').addEventListener('click',togglePause);
 $('#auto').addEventListener('click',()=>{g.auto=!g.auto;updateHeader();save(g.slot,true);feed(g.auto?'Habilidades automáticas ATIVADAS.':'Habilidades automáticas DESATIVADAS.');});
 $('#stage-advance').addEventListener('click',()=>onAction('advanceStage','',''));
 const trialFarmControl=$('#trial-farm-toggle');if(trialFarmControl)trialFarmControl.addEventListener('click',()=>onAction('trialFarmToggle','',''));  
 $('#mute').addEventListener('click',()=>{g.sound=!g.sound;$('#mute').textContent=g.sound?'♪':'♩'});
 $('#settings-quick').addEventListener('click',settingsModal);
 $('#tab-info').addEventListener('click',()=>{panelMode='info';$('#tab-info').classList.add('active');$('#tab-log').classList.remove('active');renderPanel()});
 $('#tab-log').addEventListener('click',()=>{panelMode='log';$('#tab-log').classList.add('active');$('#tab-info').classList.remove('active');renderPanel()});
 window.addEventListener('keydown',e=>{let key=e.key.toLowerCase();if(['w','a','s','d'].includes(key)){manual[key]=true;if(!['input','textarea'].includes(document.activeElement?.tagName.toLowerCase()))e.preventDefault()}if(key===' '){if(e.target.tagName==='BUTTON'||e.target.tagName==='INPUT')return;e.preventDefault();togglePause()}if(playing&&HOTKEYS.includes(key)){const i=HOTKEYS.indexOf(key),id=g.equippedSkills?.[i];if(id){fireSkill(id,true);e.preventDefault()}}});
 window.addEventListener('keyup',e=>{let key=e.key.toLowerCase();if(key in manual)manual[key]=false});
 window.addEventListener('blur',()=>{for(const k in manual)manual[k]=false});
 window.addEventListener('beforeunload',()=>{if(playing)save(g.slot,true)})}
// Startup lives in boot.js after the presentation layer.
window.VEIL_DEBUG={fresh,startNew,load,save,prestigeStageKnightLevel,buyAllHeroes,buyAndTranscendAllHeroes,autoBuyHeroes,sellAllUnprotectedGear,buildingIntervalAt,getBackground:()=>({pendingSeconds:simAccumulator,clockMs:backgroundWallMs,playing,paused}),advanceWallClock,getState:()=>g,getGold:()=>gold.fmt(),setStage:n=>{g.stage=n;g.highest[g.difficulty]=Math.max(n,g.highest[g.difficulty]);g.runPeak=n;uiDirty=true;updateHeader()},giveGold:()=>{gold=Big.pow10(8);uiDirty=true},giveRelics:()=>{relics=Big.pow10(6);uiDirty=true},spawnBoss:()=>{queue.push({s:g.stage,d:g.difficulty,type:'knowledge'})},getEnemies:()=>enemies.length,getPlayer:()=>({...player}),getXp:()=>xp.save(),getMaxHealth:maxHealth,getKnightBaseHealth:knightBaseHealth,getDamageReduction:effectiveDamageReduction,getHordeCap:aliveTarget,getHordeGroup:hordeGroupSize,getBaseDamage:basePhysicalDamage,getLevelCap:knightLevelCap,getPrestigeGate:prestigeEligibility,getPrestigeReward:()=>prestigeReward().save(),getRunKills:()=>g.runKills,getRates:()=>gearRates(g.difficulty,g.worldPrestiges),getSkillIds:()=>D.skills.map(s=>s.id),getLoadout:()=>[...g.equippedSkills],equipSkill,equippedSkill,getRetreating:()=>retreating,getCatalog:()=>D,getSpeed:()=>g.speed,setSpeed:setGameSpeed,getSimTime:()=>g.totalTime,getHeroes:()=>orderedHeroes().map(h=>({id:h.id,kind:classOfHero(h.id),cost:heroCost(h,0).save(),effect:h.effect})),getHeroInvestment:id=>heroInvestmentLevel(id),getHeroMilestoneLevel:id=>heroMilestoneEffectiveLevel(id),getHeroPurchasePlan:(id,mode=batch)=>{const h=D.heroes.find(x=>x.id===id);if(!h)return null;const plan=heroPurchasePlan(h,g.heroLevels[id]||0,mode,gold);return {levels:plan.levels,finalLevel:plan.finalLevel,totalCost:plan.cost.save(),remainingGold:gold.sub(plan.cost).save(),nextCost:plan.nextCost?.save()||null}},getBaseGold:stage=>enemyGold(stage).save(),getCameraZoom:()=>CAMERA_ZOOM,getMarketPrices:()=>({materials:{...VILLAGE_RESOURCE_PRICES},equipment:[...GEAR_SALE_PRICES]}),getSaleValue:item=>saleValue(item),getChestTypes:()=>CHEST_TYPES,getChestRelics:kind=>chestRelicReward(kind).save(),getGearOdds:bossGearOdds,getGearUI:()=>({category:gearCategory,page:gearPage,pageSize:GEAR_PAGE_SIZE}),getGearSorted:slot=>gearSortedForSlot(g.inventory,slot),getGearGrade:item=>itemGradeFromDifficulty(item?.difficulty),getTalentRemovalPlan:(skillId,nodeId=null)=>planTalentRemoval(D.skills.find(x=>x.id===skillId),nodeId),
 getHeroCritMilestones:()=>({level:heroMilestoneEffectiveLevel('h21'),bonus:heroCriticalChanceBonus()}),getStageProgress:()=>({stage:g.stage,stageKills:g.stageKills,required:killsReq(),stageHold:g.stageHold,thresholdBlocked:thresholdBlocked(),bossPending:stageBossPending(),bossReady:g.stageKills>=killsReq()}),
 getShadowChainSettings:()=>({base:SHADOW_BASE_TARGETS,max:SHADOW_MAX_TARGETS,radius:SHADOW_CHAIN_RADIUS,ranks:skillBonus('shadow','shadow_chain')}),shadowDash,
 getTrialTelemetry:trialTelemetryData,exportTrialTelemetry,
 getEndgameTrial:()=>({active:endgameTrial,scenario:trialScenario,savingBlocked:testMode,stage:g.stage,difficulty:g.difficulty,knightLevel:g.knightLevel,worldPrestiges:g.worldPrestiges,thresholdBlocked:thresholdBlocked(),syntheticPower:trialScenario!=='real'&&endgameTrial,trialMultiplier:{physical:trialPower.physical.save(),faith:trialPower.faith.save(),magic:trialPower.magic.save()},initialStage:trialBaseline?.stage??null}),getTestPassives:testPassiveSummary,startEndgameTrial,exitEndgameTrial,enterHeroLab,exitHeroLab,
 getThresholdInfo:(stage=g.stage,d=g.difficulty)=>({stage,multiplier:thresholdMultiplier(stage),blocked:thresholdBlocked(stage,d),cleared:thresholdCleared(stage,d),key:thresholdKey(stage,d)}),
 getBossActive:()=>bossActive?({type:bossActive.bossType,archetype:bossActive.archetype,phase:bossActive.bossPhase,stage:bossActive.stage,hp:bossActive.hp.save(),max:bossActive.max.save(),difficulty:bossActive.diff}):null,
 getBossWarningInfo:()=>bossWarnings.map(w=>({kind:w.kind,bossId:w.bossId,t:w.time,delay:w.delay,x:w.x,y:w.y,r:w.radius,angle:w.angle})),
 getBossNames:()=>({...bossNames}),spawnBossArchetype:(key)=>{let ev={s:g.stage,d:g.difficulty,type:'threshold'};let e=spawnEnemy(false,'boss',ev);if(e&&bossNames[key])e.archetype=key;return e?.archetype},startBossPreview,switchBossPreview,
 forceKillBoss:()=>{if(bossActive)hurt(bossActive,bossActive.hp.mul(2),false,'#fff')},
 getAliveTarget:()=>aliveTarget(),getEnemyHealth:(stage,kind='normal')=>enemyHealth(stage,g.difficulty,kind).save(),
 triggerStageProgress:()=>{g.stageKills=killsReq();progressWorld();updateHeader()},
 scheduleBosses:()=>scheduleBosses(g.stage,true),
 tick:dt=>updateCombat(dt)
};
