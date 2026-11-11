const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const qa=`<style>#r68-qa{position:fixed;right:12px;top:12px;z-index:900;background:#101e2ef4;color:#d5e6e8;border:1px solid #d0ae74;padding:14px;width:320px;max-height:60vh;overflow:auto;font:12px system-ui}#r68-qa button{margin:5px;padding:8px;background:#344351;color:#fff;border:1px solid #ae936a}#r68-report{white-space:pre-wrap}</style><div id="r68-qa"><strong>QA da Árvore R68</strong><button onclick="runR68QA()">Testar árvore</button><button onclick="document.querySelector('#r68-qa').style.display='none'">Ocultar</button><pre id="r68-report">Pronto para testar.</pre></div><script>
function runR68QA(){const lines=[];const test=(name,fn)=>{try{if(!fn())throw Error('Falhou');lines.push('OK  '+name);}catch(e){lines.push('ERRO '+name+': '+e.message);}};
 testMode=true;g=fresh();g.talentPoints=4800;g.knightLevel=500;UI67.owner=null;UI67.draft=null;UI67.selected='origin';UI67.placed=false;UI67.zoom=.42;tab='skills';skillView='tree';panelMode='info';renderPanel();
 test('210 nos / 245 conexoes',()=>document.querySelectorAll('.p67-node').length===210&&document.querySelectorAll('.p67-lines line').length===245);
 test('3 afinidades',()=>document.querySelectorAll('[data-p67="sector"]').length===3);
 test('Niveis 20 e 15',()=>P67.nodes.filter(x=>x.type==='common').every(n=>n.maxRank===20)&&P67.nodes.filter(x=>x.type==='notable').every(n=>n.maxRank===15));
 test('4.800 pontos não maximizam toda a árvore',()=>P67.nodes.filter(n=>n.type==='common'||n.type==='notable').reduce((s,n)=>s+p68Total(n,n.maxRank),0)===23240);
 r67TreeAction('result','core_center');r67TreeAction('route');test('Um ponto inicia trilha',()=>r67Draft().core_center===1);
 r67TreeAction('rank5');test('Rank +5 custa 12 pontos acumulados',()=>r67Draft().core_center===6&&p67Cost(r67Draft())===12);
 r67TreeAction('apply');test('Aplicacao multiplica bonus pelo rank',()=>g.passiveNodes.core_center===6&&Math.abs(p67Bonus('damage')-.024)<1e-8);
 r67TreeAction('rankMinus');test('Restituicao de um rank',()=>r67Draft().core_center===5&&p67Cost(r67Draft())===9);
 r67TreeAction('cancel');test('Descartar mantem build',()=>r67Draft().core_center===6&&g.passiveNodes.core_center===6);
 test('9 habilidades / 27 transformacoes',()=>P67.nodes.filter(n=>n.type==='specialization').length===27&&D.skills.length===9);
 test('Conectividade',()=>p67Reachable(Object.fromEntries(P67.nodes.map(n=>[n.id,1]))).size===210);
 const passes=lines.filter(s=>s.startsWith('OK')).length;document.querySelector('#r68-report').textContent=passes+'/'+lines.length+' aprovados\\n\\n'+lines.join('\\n');return {passes,total:lines.length,lines};}
</script>`;
fs.writeFileSync(path.join(root,'qa-r68.html'),html.replace('</body>',qa+'</body>'));console.log('QA R68 gerado.');
