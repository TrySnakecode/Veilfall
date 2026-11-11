'use strict';
/* GitHub Pages: ship ONLY static client assets, never server files or databases. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist-web');
fs.rmSync(dist,{force:true,recursive:true});fs.mkdirSync(dist,{recursive:true});
for(const dir of ['src','shared','assets'])fs.cpSync(path.join(root,dir),path.join(dist,dir),{recursive:true});
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const escapeAttr=x=>x.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
// A restrictive CSP in the static artifact limits exposure of the sessionStorage fallback.
const apiOrigin=String(process.env.VEIL_API_URL||'').trim().replace(/\/$/,'');
const policy="default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'"+(apiOrigin?' '+apiOrigin:'')+"; object-src 'none'; base-uri 'self'; form-action 'self';";
html=html.replace('</head>','<meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="'+escapeAttr(policy)+'"></head>');
fs.writeFileSync(path.join(dist,'index.html'),html);
const origin=String(process.env.VEIL_API_URL||'').trim().replace(/\/$/,'');
if(origin&&!/^https:\/\/[a-zA-Z0-9.-]+(?::[0-9]{1,5})?$/.test(origin))throw Error('VEIL_API_URL must be the HTTPS backend origin, without paths.');
fs.writeFileSync(path.join(dist,'src/config.js'),'window.VEIL_API_URL = '+JSON.stringify(origin)+';\n');
console.log('Static frontend generated in dist-web/; API '+(origin||'NOT CONFIGURED (offline only)'));
