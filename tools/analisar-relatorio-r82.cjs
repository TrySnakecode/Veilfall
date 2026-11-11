#!/usr/bin/env node
/* Offline, backward-compatible read-only combat + prestige diagnostics. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {analyze}=require('../shared/telemetry-analysis.js');
function escapeMD(s){return String(s).replace(/[|\n\r]/g,' ')}
function reportMD(name,a){
 const s=a.summary,e=s.prestigeCycles;
 const line=(k,v)=>`| ${k} | ${v} |`;
 const n=x=>x===null||x===undefined?'sem amostra':x;
 return ['# VEILFALL R82 — Auditoria de combate e prestígio: '+escapeMD(name),'',
  '**Origem:** laboratório com save real, sem bônus. Diagnóstico estatístico, não veredito de dificuldade.','',
  '| Indicador | Resultado |','|---|---:|',
  line('Duração simulada',s.minutes+' min'),
  line('Mundo/fase inicial',s.initialWorld+'/'+s.initialStage),
  line('Mundo/fase final',s.finalWorld+'/'+s.finalStage),
  line('Fases vencidas',s.stageAdvances),line('Fases por 10 min',s.stagesPerTenMinutes),
  line('Abates',s.kills),line('Mortes',s.deaths),line('Recuos',s.retreats),
  line('Chefes derrotados',s.bossDefeats),line('Mediana de chefes',s.bossMedianSeconds===null?'sem amostra':s.bossMedianSeconds+' s'),
  '', '## Economia de prestígio',
  ...(e?['', '| Indicador | Resultado |','|---|---:|',
    line('Prestígios observados',e.observed),line('Ciclos detalhados',e.eventsAvailable),
    line('Variação de fase máxima entre ciclos',n(e.prestigePeakGain)),
    line('Mediana entre prestígios (min simulados)',n(e.medianMinutesBetweenPrestiges)),
    line('Crescimento de recompensa entre ciclos (ordens log10)',n(e.rewardGrowthOrders)),
    line('Relíquias recebidas (log10)',n(e.relicsAwardedLog10)),
    line('Relíquias investidas (log10)',n(e.relicsSpentLog10)),
    line('Artefatos descobertos',e.artifactDiscoveries),
    line('Níveis de artefato comprados',e.artifactLevelsBought),
    line('Artefatos: início → fim',`${e.artifactCountStart} → ${e.artifactCountEnd}`)] :
    ['','Não disponível: este relatório é anterior à R82.']),
  '', '## Observações','',...a.flags.map(x=>'- **'+escapeMD(x.kind)+'** — '+escapeMD(x.message)),
  '', 'Nenhum atributo, recompensa ou save foi alterado durante a análise.',''].join('\n');
}
if(require.main===module){
 const inputs=process.argv.slice(2).filter(x=>!x.startsWith('--'));
 const output=process.argv.find(x=>x.startsWith('--output='))?.slice('--output='.length);
 if(!inputs.length){console.error('Uso: node tools/analisar-relatorio-r82.cjs TESTE.json [OUTRO.json] [--output=auditoria.md]');process.exit(2)}
 let failed=false;const documents=[];
 for(const file of inputs){try{
  const stat=fs.statSync(file);if(stat.size>5*1024*1024)throw Error('Arquivo acima de 5 MB');
  const a=analyze(JSON.parse(fs.readFileSync(file,'utf8')));if(!a.valid)throw Error(a.error);
  documents.push(reportMD(path.basename(file),a));
  console.log(`${path.basename(file)}: ${a.summary.stageAdvances} fases, ${a.summary.deaths} mortes, ${a.summary.prestigeCycles?.observed??'n/d'} prestígios`);
 }catch(e){failed=true;console.error(file+': '+e.message)}}
 if(documents.length){const doc=documents.join('\n---\n\n');if(output){fs.writeFileSync(output,doc);console.log('Relatório salvo em '+output)}else console.log(doc)}
 if(failed)process.exitCode=1;
}
module.exports={reportMD};
