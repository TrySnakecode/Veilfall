/* Parse every script and confirm that runtime images/audio are embedded. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'VEILFALL.html'),'utf8');
let scripts=0;for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)){new vm.Script(m[1],{filename:'standalone-'+(++scripts)+'.js'});}
const source=fs.readFileSync(path.join(root,'index.html'),'utf8'),expectedScripts=[...source.matchAll(/<script src=/g)].length;
if(scripts!==expectedScripts)throw Error('Expected '+expectedScripts+' inline scripts, got '+scripts);
const tags=[...html.matchAll(/<(?:script|link|img|audio)[^>]*\b(?:src|href)=["']([^"']+)/g)];
if(tags.some(m=>!m[1].startsWith('data:')))throw Error('External resource tag in standalone');
if(/new Audio\(['"]assets\//.test(html))throw Error('External sound in standalone');
const png=[...html.matchAll(/data:image\/png;base64,([A-Za-z0-9+/=]+)/g)];
if(png.length!==19)throw Error('Expected nineteen embedded images, found '+png.length);
for(const m of png)if(Buffer.from(m[1],'base64').toString('hex',0,8)!=='89504e470d0a1a0a')throw Error('Invalid PNG');
if((html.match(/data:audio\/wav;base64,/g)||[]).length!==3)throw Error('Expected three embedded sounds');
console.log('Build OK: '+scripts+' valid scripts, '+png.length+' PNGs, three WAV sounds; no runtime resource tags.');
