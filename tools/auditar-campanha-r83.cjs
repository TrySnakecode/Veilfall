#!/usr/bin/env node
/* R83 - Auditoria de campanhas com recursos obtidos por regras normais.
 * Diferentes prioridades de habilidades/passivas, mesma semente e duracao.
 * A simulacao e uma heuristica de QA, nao uma comprovacao de endgame.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const runtime = require('./runtime-r67.cjs');

const PROFILES = Object.freeze({
  equilibrado: Object.freeze({
    skills: ['grace','shadow','flame_nova','fury','curse','thunderstorm','holy_spear','arcane_focus','demons'],
    passives: ['damage','physical','health','defense','gold_monsters','attack_speed','magic','faith']
  }),
  ofensivo: Object.freeze({
    skills: ['fury','flame_nova','thunderstorm','shadow','arcane_focus','grace','curse','holy_spear','demons'],
    passives: ['damage','physical','magic','faith','attack_speed','crit_chance','crit_bonus','gold_monsters']
  }),
  defensivo: Object.freeze({
    skills: ['grace','holy_spear','demons','curse','shadow','fury','flame_nova','thunderstorm','arcane_focus'],
    passives: ['health','defense','health_regen','damage','gold_monsters','physical','faith','magic']
  })
});
const DEFAULT_SEEDS=[17];
const ROOT=path.resolve(__dirname,'..');
function asNumber(str,option,min,max){const n=Number(str);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`Argumento invalido ${option}: ${str} (intervalo ${min}-${max})`);return n;}
function readOptions(argv){
  const o={seconds:300,seeds:[...DEFAULT_SEEDS],profiles:Object.keys(PROFILES),out:null};
  for(const arg of argv){
    if(arg.startsWith('--seconds='))o.seconds=asNumber(arg.slice(10),'seconds',60,14400);
    else if(arg.startsWith('--seeds=')){
      const arr=arg.slice(8).split(',');if(!arr.length||arr.length>8)throw Error('Forneca de 1 a 8 sementes');
      o.seeds=arr.map(x=>asNumber(x,'seed',1,2147483647));
    }else if(arg.startsWith('--profiles=')){
      const arr=arg.slice(11).split(',');if(!arr.length||arr.length>3||arr.some(x=>!PROFILES[x]))throw Error('Perfis disponiveis: '+Object.keys(PROFILES).join(','));
      o.profiles=[...new Set(arr)];
    }else if(arg.startsWith('--out='))o.out=arg.slice(6);
    else if(arg==='--help')return {...o,help:true};
    else throw Error('Parametro desconhecido: '+arg);
  }
  return o;
}
function simulationScript(seconds,seed,profileName){
  const policy=PROFILES[profileName];if(!policy)throw Error('Perfil desconhecido');
  // All user inputs validated, configuration emitted as literal JSON.
  return `(()=>{
    let z=${seed}>>>0;
    Math.random=()=>{z=(Math.imul(1664525,z)+1013904223)>>>0;return z/4294967296};
    testMode=false;endgameTrial=false;
    g=fresh();g.sound=false;g.autoHeroes=true;
    gold=B(0);xp=B(0);relics=B(0);totalRelics=B(0);goldEarned=B(0);
    initialise();showModal=(title,desc,yes)=>yes();
    const policy=${JSON.stringify(policy)};
    let maxStage=1,previousDeaths=0,nextPrestigeEligibleAt=0,resumeIn=15,heldSeconds=0;
    let lastProgressAt=0,previousStage=1;
    const prestiges=[],deaths=[],checkpoints=[],milestones={},finishAt=${seconds};
    const goalStages=[55,100,250,500,1000];
    function equip(){
      // Only unlocked skills; limited to the 4 regular active slots.
      for(const id of policy.skills){
        const sk=D.skills.find(x=>x.id===id);
        if(sk&&g.knightLevel>=sk.unlock&&!g.equippedSkills.includes(id)&&g.equippedSkills.includes(null))
          g.equippedSkills[g.equippedSkills.indexOf(null)]=id;
      }
      // Equipping available owned items is free; no item generated.
      for(const slot of SLOTS){
        const items=g.inventory.filter(x=>x.slot===slot);
        if(!items.length)continue;
        const score=i=>(i.rarity+1)*(1+i.value)*(i.quality||1);
        const best=items.reduce((a,b)=>!a||score(b)>score(a)?b:a,null);
        if(!g.equipped[slot]||score(best)>score(g.equipped[slot]))g.equipped[slot]=best;
      }
    }
    function talents(){
      if(g.talentPoints<=p67Cost(g.passiveNodes))return;
      const levels={...g.passiveNodes};
      const prefs=P67.nodes.filter(n=>['common','notable'].includes(n.type)&&n.effects.some(e=>policy.passives.includes(e.stat)))
        .sort((a,b)=>{
          const ar=Math.min(...a.effects.map(e=>{const i=policy.passives.indexOf(e.stat);return i<0?999:i;}));
          const br=Math.min(...b.effects.map(e=>{const i=policy.passives.indexOf(e.stat);return i<0?999:i;}));
          return ar-br||a.cost-b.cost||String(a.id).localeCompare(String(b.id));
        }).slice(0,70);
      for(const n of prefs){
        const route=p67Route(n.id,levels);
        if(route.error||route.cost+p67Cost(levels)>g.talentPoints)continue;
        for(const id of route.ids)levels[id]=Math.max(1,levels[id]||0);
        const next=(levels[n.id]||0)+1;
        if(next<=n.maxRank&&p67Cost(levels)+p68Price(n,next)<=g.talentPoints)levels[n.id]=next;
      }
      p67Commit(levels);
    }
    function spendRelicsOnArtifacts(){
      for(let i=0;i<8;i++){
        const count=artCount(),cost=artifactDiscoverCost(count);
        if(count>=D.artifacts.length||!artifactCandidatePool(count).length||relics.cmp(cost)<0)break;
        const choice=chooseArtifact();if(!choice||!spendRelics(cost))break;
        g.artifactLevels[choice.id]=1;
      }
      for(let pass=0;pass<14;pass++){
        const arts=D.artifacts.filter(x=>g.artifactLevels[x.id]&&!artifactAtMax(x));
        if(!arts.length)break;
        const budget=relics.div(arts.length);let bought=0;
        for(const art of arts)bought+=buyArtifactBudget(art,budget,1000).levels;
        if(!bought)break;
      }
    }
    for(let i=0;i<finishAt*20;i++){
      updateCombat(.05);
      const elapsed=(i+1)/20;
      if(i%200===0){equip();if(i%400===0)talents();}
      if(g.deaths!==previousDeaths){
        deaths.push({second:elapsed,stage:g.stage,peak:g.runPeak,level:g.knightLevel});
        previousDeaths=g.deaths;resumeIn=15;
      }
      if(g.stageHold){
        heldSeconds+=.05;resumeIn-=.05;
        if(resumeIn<=0){
          const eligible=prestigeEligibility();
          if(eligible.allowed&&elapsed>nextPrestigeEligibleAt){
            const before=g.runPeak,rewardLog10=prestigeReward().log10();
            knightPrestige();spendRelicsOnArtifacts();
            prestiges.push({second:elapsed,peak:before,returnStage:g.stage,rewardLog10,artifacts:artCount(),damageLog10:damage().log10()});
            nextPrestigeEligibleAt=elapsed+420;resumeIn=15;
          }else{
            g.stageHold=false;g.stageKills=0;scheduleBosses(g.stage,true);resumeIn=15;
          }
        }
      }
      maxStage=Math.max(maxStage,g.stage,g.runPeak);
      if(maxStage>previousStage){lastProgressAt=elapsed;previousStage=maxStage;}
      for(const m of goalStages)if(maxStage>=m && milestones[m]===undefined)milestones[m]=+elapsed.toFixed(2);
      if((i+1)%6000===0)checkpoints.push({second:elapsed,stage:g.stage,maxStage,level:g.knightLevel,
        prestiges:g.knightPrestiges,deaths:g.deaths,artifactCount:artCount(),relicsLog10:relics.log10(),
        damageLog10:damage().log10(),enemyHpLog10:enemyHealth().log10(),heldSeconds:+heldSeconds.toFixed(2)});
    }
    return {seed:${seed},profile:${JSON.stringify(profileName)},simulatedSeconds:finishAt,
      maxStage,currentStage:g.stage,level:g.knightLevel,deaths:g.deaths,
      prestigeCount:g.knightPrestiges,prestiges,deathsLog:deaths,checkpoints,milestones,
      lastProgressSecond:lastProgressAt,heldSeconds:+heldSeconds.toFixed(2),
      artifactCount:artCount(),passivesSpent:g.talentSpent,heroCount:Object.keys(g.heroLevels).length,
      qaFlags:{testMode,endgameTrial,receivedSyntheticPower:false}};
  })()`;
}
function runOne({seconds,seed,profile}){
  const engine=runtime(ROOT);
  const script=simulationScript(seconds,seed,profile);
  const result=engine.run(script);
  return JSON.parse(JSON.stringify(result));
}
function summarize(results){
  return results.map(r=>({seed:r.seed,profile:r.profile,minutes:r.simulatedSeconds/60,
    maxStage:r.maxStage,deaths:r.deaths,prestiges:r.prestigeCount,
    milestone55:r.milestones['55']??null,milestone100:r.milestones['100']??null,
    heldSeconds:r.heldSeconds,artifacts:r.artifactCount}));
}
function reportMarkdown(doc){
  const rows=summarize(doc.runs);
  const lines=['# VEILFALL — R83 | Auditoria automatizada de campanhas','',
    '**Tipo:** simulação heurística com o motor real, não uma campanha humana ou prova do endgame.','',
    `**Duração:** ${doc.config.seconds/60} minutos simulados por cenário. **Sementes:** ${doc.config.seeds.join(', ')}.`,
    '', '| Semente | Perfil | Fase máxima | Mortes | Prestígios | Fase 55 (min) | Fase 100 (min) |',
    '|---:|---|---:|---:|---:|---:|---:|'];
  for(const r of rows){const tm=x=>x===null?'não alcançada':(x/60).toFixed(1);
    lines.push(`| ${r.seed} | ${r.profile} | ${r.maxStage} | ${r.deaths} | ${r.prestiges} | ${tm(r.milestone55)} | ${tm(r.milestone100)} |`);
  }
  if(doc.config.profiles.includes('equilibrado')&&doc.config.profiles.length>1){
    lines.push('','## Comparação com o perfil equilibrado','',
      '| Semente | Outro perfil | Diferença de fases | Diferença de mortes |',
      '|---:|---|---:|---:|');
    for(const seed of doc.config.seeds){
      const base=doc.runs.find(x=>x.seed===seed&&x.profile==='equilibrado');
      if(!base)continue;
      for(const r of doc.runs.filter(x=>x.seed===seed&&x.profile!=='equilibrado')){
        const sign=v=>v>0?`+${v}`:String(v);
        lines.push(`| ${seed} | ${r.profile} | ${sign(r.maxStage-base.maxStage)} | ${sign(r.deaths-base.deaths)} |`);
      }
    }
    lines.push('','As diferenças são descritivas: representam decisões do agente, não poder absoluto de cada build.');
  }
  const neverPrestiged=doc.runs.every(x=>x.prestigeCount===0);
  if(neverPrestiged)lines.push('','**Atenção:** nenhum agente prestigiou; não é possível avaliar a economia de prestígio nesta amostra.');
  lines.push('','## Limitações de interpretação','',
    '- Todas as campanhas começam novas, sem bônus de laboratório, equipamentos inventados ou recursos externos.',
    '- O agente usa compras automáticas e políticas simples de talentos/equipamentos. Não representa um jogador especialista.',
    '- Prestígio só é considerado após bloqueio de avanço e elegibilidade, com intervalo mínimo entre decisões.',
    '- Esses testes **não validam** os cinco mundos nem a fase 24.000; para isso são necessários percursos longos ou saves legítimos.',
    '- A diferença entre perfis pode ser causada por suas escolhas específicas, não necessariamente por desequilíbrio do jogo.',
    '- Nenhuma constante de vida, dano, recompensa ou custo foi alterada.', '');
  return lines.join('\n');
}
function main(argv){
  const o=readOptions(argv);
  if(o.help){console.log('Uso: node tools/auditar-campanha-r83.cjs [--seconds=300] [--seeds=17] [--profiles=equilibrado,ofensivo,defensivo] [--out=pasta]');return;}
  const results=[];
  for(const seed of o.seeds)for(const profile of o.profiles){
    const t=Date.now(),r=runOne({seconds:o.seconds,seed,profile});results.push(r);
    console.error(`SEED ${seed} · ${profile} · fase ${r.maxStage} · prestígios ${r.prestigeCount} · mortes ${r.deaths} · ${((Date.now()-t)/1000).toFixed(1)} s de CPU`);
  }
  const document={schema:'veilfall-campaign-audit-r83-v1',version:'R83',
    config:{seconds:o.seconds,seeds:o.seeds,profiles:o.profiles},runs:results};
  const md=reportMarkdown(document);
  if(o.out){fs.mkdirSync(o.out,{recursive:true});fs.writeFileSync(path.join(o.out,'auditoria-r83.json'),JSON.stringify(document,null,2));fs.writeFileSync(path.join(o.out,'auditoria-r83.md'),md);console.log('Relatórios em '+o.out);}
  else console.log(md);
  return document;
}
if(require.main===module){try{main(process.argv.slice(2));}catch(e){console.error('ERRO R83:',e.stack||e.message);process.exitCode=1;}}
module.exports={PROFILES,readOptions,simulationScript,runOne,summarize,reportMarkdown,main};
