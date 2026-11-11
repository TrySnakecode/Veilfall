/* R82 — deterministic, read-only evaluation of the R80-R82 laboratory reports.
   Runs in offline browser and Node, without mutating game saves. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.VEIL_TELEMETRY_ANALYSIS=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const nonneg=x=>finite(x)?Math.max(0,x):0;
 const round=(x,n=2)=>Number(x.toFixed(n));
 const median=arr=>arr.length? (arr.length%2?arr[(arr.length-1)/2]:(arr[arr.length/2-1]+arr[arr.length/2])/2):null;
 function analyze(report){
  if(!report||typeof report!=='object'||!/^veilfall-lab-r8[012]-v1$/.test(report.schema||'')||report.mode!=='SAVE_REAL_SEM_BONUS'||!report.results||!report.initial||!report.final){
   return {valid:false,error:'Relatório inválido: envie um JSON de TESTAR MINHA BUILD (R80-R82).'};
  }
  const r=report.results,seconds=nonneg(r.elapsedSeconds),minutes=seconds/60;
  const defeated=Array.isArray(report.bossEvents)?report.bossEvents.filter(e=>e&&finite(e.durationSec)&&e.durationSec>=0&&e.durationSec<1e9):[];
  const durations=defeated.map(e=>e.durationSec).sort((a,b)=>a-b);
  const stageAdvances=nonneg(r.stageAdvances),deaths=nonneg(r.deaths),retreats=nonneg(r.retreats);
  const kills=nonneg(r.kills),bossDefeats=nonneg(r.bossDefeats);
  const hasTruncatedBossEvents=bossDefeats>defeated.length;
  const medianBossSeconds=median(durations);
  const perTenMinutes=minutes?round(stageAdvances*10/minutes):0;
  const deathsPerHour=minutes?round(deaths*60/minutes):0;
  const killsPerMinute=minutes?round(kills/minutes):0;
  const results={minutes:round(minutes),seconds:round(seconds),stageAdvances,deaths,retreats,kills,bossDefeats,
   bossEventsAvailable:defeated.length,bossEventsTruncated:hasTruncatedBossEvents,
   bossMedianSeconds:medianBossSeconds===null?null:round(medianBossSeconds),
   bossMeanSeconds:bossDefeats&&finite(r.averageBossSeconds)?r.averageBossSeconds:null,
   bossSlowestSeconds:durations.length?round(durations[durations.length-1]):null,
   stagesPerTenMinutes:perTenMinutes,deathsPerHour,killsPerMinute,
   initialWorld:report.initial.world,finalWorld:report.final.world,
   initialStage:report.initial.stage,finalStage:report.final.stage};
  // Economic data is optional for backward compatibility. Never treat its absence
  // as zero earned/spent, and never sum log10 values as if they were linear amounts.
  const eco=report.economy&&typeof report.economy==='object'?report.economy:null;
  const prestigeEvents=Array.isArray(report.prestigeEvents)?report.prestigeEvents.filter(e=>e&&finite(e.atSec)&&finite(e.peakStage)):[];
  const count=eco?nonneg(eco.prestigesObserved):null;
  const peaks=prestigeEvents.map(e=>e.peakStage);
  const progression=peaks.length>=2?peaks[peaks.length-1]-peaks[0]:null;
  const cycleSeconds=prestigeEvents.slice(1).map((e,i)=>e.atSec-prestigeEvents[i].atSec).filter(x=>finite(x)&&x>=0).sort((a,b)=>a-b);
  const cycleMedianMinutes=cycleSeconds.length?round(median(cycleSeconds)/60):null;
  const firstReward=prestigeEvents[0]?.rewardLog10,lastReward=prestigeEvents[prestigeEvents.length-1]?.rewardLog10;
  const rewardGrowthOrders=prestigeEvents.length>=2&&finite(firstReward)&&finite(lastReward)?round(lastReward-firstReward,4):null;
  const cycles=count===null?null:{observed:count,eventsAvailable:prestigeEvents.length,
   eventsTruncated:!!eco.eventsTruncated||count>prestigeEvents.length,
   relicsAwardedLog10:finite(eco.relicsAwardedLog10)?eco.relicsAwardedLog10:null,
   relicsSpentLog10:finite(eco.relicsSpentLog10)?eco.relicsSpentLog10:null,
   artifactLevelsBought:nonneg(eco.artifactLevelsBought),artifactDiscoveries:nonneg(eco.artifactDiscoveries),
   artifactCountStart:nonneg(eco.artifactCountStart),artifactCountEnd:nonneg(eco.artifactCountEnd),
   prestigePeakGain:progression,
   medianMinutesBetweenPrestiges:cycleMedianMinutes,rewardGrowthOrders};
  results.prestigeCycles=cycles;
  const flags=[];
  const add=(code,kind,message)=>flags.push({code,kind,message});
  if(seconds<300)add('SHORT_RUN','insufficient','Menos de 5 min simulados: amostra curta para julgar dificuldade.');
  if(!cycles)add('NO_ECONOMY','insufficient','Relatório anterior à R82: a economia de prestígio não foi medida nesta sessão.');
  else if(cycles.observed<2)add('FEW_PRESTIGES','insufficient','Menos de 2 prestígios realizados: não é possível avaliar a evolução entre ciclos.');
  else if(cycles.eventsTruncated)add('TRUNCATED_PRESTIGES','insufficient','Parte do histórico de prestígios foi truncada; a comparação dos picos é parcial.');
  else if(cycles.observed>=3&&progression!==null&&progression<=0)
   add('PRESTIGE_PLATEAU','observation','Três ou mais prestígios sem aumento do pico entre o primeiro e o último: investigar custos, escolhas de build e estratégia.');
  if(bossDefeats<5)add('FEW_BOSSES','insufficient','Menos de 5 chefes derrotados: não é possível avaliar a duração típica dos chefes.');
  if(hasTruncatedBossEvents)add('TRUNCATED','insufficient','O registro detalhado de chefes atingiu o limite; a mediana usa somente os eventos disponíveis.');
  if(seconds>=600&&stageAdvances===0&&deaths>=2)add('STALL','observation','Indício de travamento: nenhuma fase vencida e pelo menos duas mortes nesta sessão.');
  if(seconds>=600&&deaths>=5)add('REPEATED_DEATHS','observation','Mortes frequentes no período; avaliar o momento e a causa de cada derrota.');
  if(bossDefeats>=5&&!hasTruncatedBossEvents&&medianBossSeconds!==null){
   if(medianBossSeconds<=3)add('FAST_BOSSES','observation','Chefes derrotados muito rapidamente; conferir se a build e a fase testadas são representativas.');
   else if(medianBossSeconds>=120)add('LONG_BOSSES','observation','Chefes com confrontos longos; verificar se a lentidão é intencional e recompensadora.');
  }
  if(seconds>=600&&stageAdvances>=30&&deaths===0&&bossDefeats>=5&&medianBossSeconds!==null&&medianBossSeconds<=6){
   add('RAPID_CLEAR','observation','Avanço rápido sem mortes e chefes curtos: possível trecho com pouca resistência para esta build.');
  }
  if(seconds>=300&&!flags.some(x=>x.kind==='observation'))add('NEUTRAL','neutral','Nenhum sinal extremo identificado nesta amostra; isso não valida o equilíbrio global.');
  const speed=report.simulation?.speedAtStart;
  if(finite(speed)&&speed!==1)add('SPEED','context','A velocidade no início do teste não era 1×; os tempos são de combate simulado, não tempo de relógio.');
  add('LIMIT','context','Uma sessão isolada não valida toda a economia ou o endgame; compare diferentes ciclos, builds e saves legítimos.');
  return {valid:true,analysisVersion:'R82',qualifiedOverview:seconds>=300,
   qualifiedBossSample:bossDefeats>=5&&!hasTruncatedBossEvents,summary:results,flags};
 }
 return Object.freeze({analyze});
});
