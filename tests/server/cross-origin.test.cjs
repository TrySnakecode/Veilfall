'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {Service}=require('../../server/service.cjs'),{createServer}=require('../../server/server.cjs'),net=require('node:net');
test('GitHub Pages origin: strict CORS, preflight, secure session and cross-site bearer token',async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'veil-cors-')),s=new Service({directory});const vars=['VEIL_PUBLIC_ORIGIN','VEIL_FRONTEND_ORIGIN','VEIL_REQUIRE_EMAIL'],old=Object.fromEntries(vars.map(k=>[k,process.env[k]]));let server;
 try{const probe=net.createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));process.env.VEIL_PUBLIC_ORIGIN='https://127.0.0.1:'+port;process.env.VEIL_FRONTEND_ORIGIN='https://owner.github.io';delete process.env.VEIL_REQUIRE_EMAIL;
 const result=createServer({service:s,disableRateLimit:true});server=result.server;await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+port+'/api';const h={Origin:'https://owner.github.io'};
 const preflight=await fetch(url+'/auth/register',{method:'OPTIONS',headers:{...h,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
 assert.equal(preflight.status,204,await preflight.text());assert.equal(preflight.headers.get('access-control-allow-origin'),'https://owner.github.io');
 const response=await fetch(url+'/auth/register',{method:'POST',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({name:'PagesKnight',password:'a-good-enough-password'})});
 assert.equal(response.status,200,JSON.stringify(await response.clone().json()));const data=await response.json();assert.equal(typeof data.sessionToken,'string');assert.match(response.headers.get('set-cookie'),/SameSite=None; Max-Age=1209600; Secure/);
 const me=await fetch(url+'/me',{headers:{...h,Authorization:'Bearer '+data.sessionToken}});assert.equal(me.status,200);assert.equal((await me.json()).capsule.payload.includes('PagesKnight'),true);
 const malicious=await fetch(url+'/me',{headers:{Origin:'https://malicious.example',Authorization:'Bearer '+data.sessionToken}});assert.equal(malicious.status,403);
 }finally{if(server)await new Promise(resolve=>server.close(resolve));s.close();fs.rmSync(directory,{recursive:true,force:true});for(const k of vars)if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}
});
