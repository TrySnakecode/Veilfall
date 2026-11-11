#!/usr/bin/env node
/* Offline file-based analysis of the R80/R81 exported laboratory JSON. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {analyze}=require('../shared/telemetry-analysis.js');
function escapeMD(s){return String(s).replace(/[|\n\r]/g,' ')}
function reportMD(name,a){
 const s=a.summary;
 const line=(label,value)=>`| ${label} | ${value} |`;
 return ['# Diagnóstico R81 — '+escapeMD(name),'',
  '**Origem:** relatório do laboratório com save real; não é uma simulação de campanha completa.','',
  '| Indicador | Valor |','|---|---:|',
  line('Duração simulada',`${s.minutes} min`),
  line('Fases vencidas',s.stageAdvances),
  line('Fases por 10 min',s.stagesPerTenMinutes),
  line('Mortes',s.deaths),
  line('Recuos',s.retreats),
  line('Abates',s.kills),
  line('Chefes derrotados',s.bossDefeats),
  line('Mediana de chefes',s.bossMedianSeconds===null?'sem amostra':s.bossMedianSeconds+' s'),
  line('Chefe mais demorado registrado',s.bossSlowestSeconds===null?'sem amostra':s.bossSlowestSeconds+' s'),
  line('Mundo/fase inicial',`${s.initialWorld}/${s.initialStage}`),
  line('Mundo/fase final',`${s.finalWorld}/${s.finalStage}`),'',
  '## Observações','',...a.flags.map(x=>'- **'+escapeMD(x.kind)+'** — '+escapeMD(x.message)),'',
  'Não houve modificação de dano, vida dos inimigos, saves, relíquias ou artefatos para gerar este diagnóstico.',''].join('\n');
}
if(require.main===module){
 const inputs=process.argv.slice(2).filter(x=>!x.startsWith('--'));
 if(!inputs.length){console.error('Uso: node tools/analisar-relatorio-r81.cjs CAMINHO_DO_JSON [OUTRO_JSON] [--output=relatorio.md]');process.exit(2)}
 const output=process.argv.find(x=>x.startsWith('--output='))?.slice('--output='.length);
 let failed=false,documents=[];
 for(const file of inputs){
  try{
   const stat=fs.statSync(file);if(stat.size>5*1024*1024)throw Error('Arquivo acima de 5 MB.');
   const data=JSON.parse(fs.readFileSync(file,'utf8'));
   const a=analyze(data);if(!a.valid)throw Error(a.error);
   documents.push(reportMD(path.basename(file),a));
   console.log(`${path.basename(file)}: ${a.summary.stageAdvances} fases, ${a.summary.deaths} mortes, ${a.summary.bossDefeats} chefes, mediana ${a.summary.bossMedianSeconds??'n/d'}s`);
  }catch(e){failed=true;console.error(file+': '+e.message)}
 }
 if(documents.length){const md=documents.join('\n---\n\n');if(output){fs.writeFileSync(output,md);console.log('Relatório salvo em '+output)}else console.log('\n'+md)}
 if(failed)process.exitCode=1;
}
module.exports={reportMD};
