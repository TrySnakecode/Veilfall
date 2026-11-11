/* Node.js 18+. Builds a portable, offline HTML without third-party libraries. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=p=>'data:'+(/\.wav$/.test(p)?'audio/wav':'image/png')+';base64,'+fs.readFileSync(path.join(root,p)).toString('base64');
const escapeScript=code=>code.replace(/<\/script/gi,'<\\/script');
const script=code=>'<script>\n'+escapeScript(code)+'\n</script>';
const arena=data('assets/environment/arena.png');
const visual=Object.fromEntries(['knight','enemies','bosses','icons','companions','relics1','relics2'].map(key=>[key,data('assets/'+(['knight','enemies','bosses'].includes(key)?'characters/':'ui/')+key+'.png')]));
const raidAssets=Object.fromEntries(['arena','sentinel','archon','abyss','weapons-1','weapons-2','techniques','heraldry'].map(key=>[key,data('assets/raids/'+key+'.png')]));
let html=read('index.html');
for(const css of ['base','visual','polish','r52','r100','r66','r67','r68','r72-ux','r74-ui','r75-ui','r99-premium','r99-ui']){
 const content=read('src/'+css+'.css').replace(/url\(['"]?\.\.\/assets\/environment\/arena\.png['"]?\)/g,'var(--arena-image)');
 html=html.replace('<link rel="stylesheet" href="src/'+css+'.css">','<style>\n'+content+'\n</style>');
}
html=html.replace('<script src="shared/raid-engine.js"></script>',()=>script(read('shared/raid-engine.js')));
html=html.replace('<script src="shared/telemetry-analysis.js"></script>',()=>script(read('shared/telemetry-analysis.js')));
const art=Object.fromEntries([['arena','arena-moonlit'],['chapters','chapters'],['spells','spells']].map(([k,f])=>[k,data('assets/r99/'+f+'.png')]));
const embedded='window.VEIL_R99_ASSETS='+JSON.stringify(art)+';\nwindow.VEIL_RAID_ASSETS='+JSON.stringify(raidAssets)+';\nwindow.__assetUrls='+JSON.stringify({arena})+';\nwindow.VEIL_VISUAL_ASSETS='+JSON.stringify(visual)+';\ndocument.documentElement.style.setProperty("--arena-image",`url("${window.__assetUrls.arena}")`);';
for(const name of ['config','assets','data','game','r67-tree','r67-combat','r68-tree','visual','polish','r52-core','r52-combat','r52-ui','r100-online','r65-bridge','r66-ux','r66-vfx','r67-ui','r68-ui','r72-ux','r74-ui','r75-ui','r99-premium','r99-vfx','r99-ui','boot']){
 let code=name==='assets'?embedded:read('src/'+name+'.js');
 if(name==='game')code=code.replace(/assets\/audio\/sound-\d+\.wav/g,p=>data(p));
 html=html.replace('<script src="src/'+name+'.js"></script>',()=>script(code));
}
if(/<(?:script|link)[^>]+(?:src|href)=["'](?:src|assets)\//.test(html))throw Error('External runtime dependency left in build');
const output=path.join(root,'VEILFALL.html');fs.writeFileSync(output,html);console.log(output+' · '+(Buffer.byteLength(html)/1024/1024).toFixed(2)+' MiB');
