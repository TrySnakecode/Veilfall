'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {Service,Fault}=require('./service.cjs');
const {sendAccountEmail}=require('./mailer.cjs');
function createServer(options={}){
 const mailer=options.mailer||sendAccountEmail;
 const root=path.resolve(__dirname,'..'),service=options.service||new Service({directory:process.env.VEIL_DATA_DIR||path.join(root,'var')}),limits=new Map();
 const permittedOrigin=process.env.VEIL_PUBLIC_ORIGIN||'',frontendOrigin=process.env.VEIL_FRONTEND_ORIGIN||'',secure=permittedOrigin.startsWith('https:');
 if(frontendOrigin&&!permittedOrigin.startsWith('https://'))throw Error('Cross-site sessions require HTTPS VEIL_PUBLIC_ORIGIN.');
 if(process.env.VEIL_REQUIRE_EMAIL==='1'&&(!process.env.RESEND_API_KEY||!process.env.VEIL_EMAIL_FROM||!process.env.VEIL_FRONTEND_URL))throw Error('Email requirement needs RESEND_API_KEY, VEIL_EMAIL_FROM and VEIL_FRONTEND_URL.');
 if(permittedOrigin&&!process.env.VEIL_DATA_DIR&&!options.service)throw Error('Configure VEIL_DATA_DIR on a durable, backed-up persistent volume before public deployment.');
 const allowedOrigin=(origin,host)=>origin&&(origin===frontendOrigin||origin===(permittedOrigin||'http://'+host));
 const cors=(origin,host)=>allowedOrigin(origin,host)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Credentials':'true','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin'}:{};
 const send=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...headers});res.end(JSON.stringify(data));};
 const cookie=token=>'veil_session='+token+'; Path=/; HttpOnly; SameSite='+(frontendOrigin?'None':'Strict')+'; Max-Age='+(token?'1209600':'0')+(secure?'; Secure':'');
 const server=http.createServer(async(req,res)=>{try{
  const host=req.headers.host||'',hostname=host.split(':')[0],local=['localhost','127.0.0.1','[::1]','terminal.local'].includes(hostname);
  if(permittedOrigin){if(host!==new URL(permittedOrigin).host)throw new Fault(403,'Host inválido.');}else if(!local)throw new Fault(403,'Defina VEIL_PUBLIC_ORIGIN antes de publicar.');
  const url=new URL(req.url,'http://'+host),route=url.pathname,origin=req.headers.origin;
  if(route.startsWith('/api/')){
   if(origin&&!allowedOrigin(origin,host))throw new Fault(403,'Origem não permitida.');
   const corsHeaders=cors(origin,host);
   for(const [k,v]of Object.entries(corsHeaders))res.setHeader(k,v);
   if(req.method==='OPTIONS'){if(!origin)throw new Fault(403,'Origem obrigatória.');res.writeHead(204);res.end();return;}
  }
  if(!route.startsWith('/api/')){
   if(req.method!=='GET'&&req.method!=='HEAD')throw new Fault(405,'Método não permitido.');
   let relative=decodeURIComponent(route).replace(/^\//,'')||'index.html';
   if(!/^(index\.html|VEILFALL\.html|qa-(?:layout-)?r(?:52|66|67)\.html|src\/|assets\/|shared\/)/.test(relative)||relative.split('/').some(p=>p.startsWith('.'))||relative.includes('\\'))throw new Fault(404,'Arquivo não encontrado.');
   const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())throw new Fault(404,'Arquivo não encontrado.');
   const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.wav':'audio/wav','.json':'application/json'};
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; object-src 'none'"});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);return;
  }
  const now=Date.now(),ip=req.socket.remoteAddress||'local',key=ip+(route.startsWith('/api/auth/')?':auth':':api'),budget=route.startsWith('/api/auth/')?20:180,span=route.startsWith('/api/auth/')?60000:10000;
  if(!options.disableRateLimit){let b=limits.get(key);if(!b||now-b.since>span){b={since:now,n:0};limits.set(key,b);}if(++b.n>budget)throw new Fault(429,'Muitas solicitações. Aguarde um momento.');if(limits.size>20000)for(const [k,v]of limits)if(now-v.since>60000)limits.delete(k);}

  let body={};if(req.method==='POST'){if(!(req.headers['content-type']||'').startsWith('application/json'))throw new Fault(415,'Envie JSON.');let raw='',size=0;for await(const chunk of req){size+=chunk.length;if(size>(/^\/api\/saves\/[123]$/.test(route)?2*1024*1024+16384:16384))throw new Fault(413,'Solicitação muito grande.');raw+=chunk;}try{body=JSON.parse(raw||'{}');}catch{throw new Fault(400,'JSON inválido.');}if(!body||Array.isArray(body)||typeof body!=='object')throw new Fault(400,'Objeto JSON esperado.');}
  else if(req.method!=='GET')throw new Fault(405,'Método não permitido.');
  service.settleDue();
  if(route==='/api/health'&&req.method==='GET')return send(res,200,{ok:true,service:'veilfall',time:Date.now()});
  if(route==='/api/bootstrap'&&req.method==='GET')return send(res,200,service.bootstrap());
  if(route==='/api/rankings/players'&&req.method==='GET')return send(res,200,service.leaderboardPlayers(url.searchParams.get('limit'),url.searchParams.get('offset')));
  if(route==='/api/rankings/clans'&&req.method==='GET')return send(res,200,service.leaderboardClans(url.searchParams.get('limit'),url.searchParams.get('offset')));
  let pub;if((pub=route.match(/^\/api\/players\/([a-f0-9-]{36})$/))&&req.method==='GET')return send(res,200,service.publicProfile(pub[1]));
  if(route==='/api/auth/confirm-email'&&req.method==='POST')return send(res,200,service.emailVerify(body.token));
  if(route==='/api/auth/reset-password'&&req.method==='POST')return send(res,200,service.resetPassword(body.token,body.password));
  if(route==='/api/auth/request-reset'&&req.method==='POST'){
   const found=service.findByEmail(body.email);
   if(found){const secret=service.issueEmailToken(found.id,'reset');try{await mailer({email:found.email,token:secret,purpose:'reset'});}catch(err){console.error('Password reset email delivery error:',err.message);}}
   return send(res,200,{ok:true,message:'Se existir uma conta vinculada, enviaremos as instruções de recuperação.'});
  }
  if((route==='/api/auth/register'||route==='/api/auth/login')&&req.method==='POST'){
   if(route.endsWith('register')&&process.env.VEIL_REQUIRE_EMAIL==='1'&&!body.email)throw new Fault(400,'E-mail é obrigatório para criar uma conta.');
   const auth=route.endsWith('register')?service.register(body.name,body.password,body.email):service.login(body.name,body.password);
   let emailSent=false;
   if(route.endsWith('register')&&body.email){const token=service.issueEmailToken(auth.id,'verify');try{await mailer({email:service.user(auth.id).email,token,purpose:'verify'});emailSent=true;}catch(err){console.error('Verification email delivery error:',err.message);}}
   return send(res,200,{...service.me(auth.id),emailSent,...(frontendOrigin?{sessionToken:auth.token}:{})},{'Set-Cookie':cookie(auth.token)});
  }
  const bearer=(req.headers.authorization||'').match(/^Bearer ([A-Za-z0-9_-]{20,200})$/)?.[1];
  const token=bearer||(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('veil_session='))?.slice(13),id=service.authenticate(token);if(!id)throw new Fault(401,'Entre na sua conta para acessar o serviço online.');
  if(route==='/api/auth/resend-confirmation'&&req.method==='POST'){
   const user=service.user(id);if(!user.email||user.email_verified)throw new Fault(400,'Conta sem confirmação pendente.');
   const secret=service.issueEmailToken(id,'verify');await mailer({email:user.email,token:secret,purpose:'verify'});return send(res,200,{ok:true});
  }
  if(process.env.VEIL_REQUIRE_EMAIL==='1'&&!service.user(id).email_verified&&!['/api/me','/api/auth/logout'].includes(route))throw new Fault(403,'Confirme seu e-mail para acessar as funcionalidades online.');
  if(route==='/api/auth/logout'&&req.method==='POST'){service.logout(token);return send(res,200,{ok:true},{'Set-Cookie':cookie('')});}
  if(route==='/api/me'&&req.method==='GET')return send(res,200,service.me(id));
  let m;
  if(route==='/api/saves'&&req.method==='GET')return send(res,200,{saves:service.saveList(id)});
  if((m=route.match(/^\/api\/saves\/([123])$/))&&req.method==='GET')return send(res,200,service.readSave(id,Number(m[1])));
  if((m=route.match(/^\/api\/saves\/([123])$/))&&req.method==='POST')return send(res,200,service.writeSave(id,Number(m[1]),body.expectedRevision,body.document));
  if((m=route.match(/^\/api\/saves\/([123])\/history$/))&&req.method==='GET')return send(res,200,{history:service.saveHistory(id,Number(m[1]))});
  if((m=route.match(/^\/api\/saves\/([123])\/history\/(\d+)$/))&&req.method==='GET')return send(res,200,service.readRevision(id,Number(m[1]),Number(m[2])));
  if(route==='/api/clans'&&req.method==='GET')return send(res,200,{clans:service.clanList(url.searchParams.get('q')||'')});
  if(route==='/api/clans'&&req.method==='POST')return send(res,201,service.createClan(id,body));
  if(route==='/api/profile/verify'&&req.method==='POST')return send(res,200,{valid:service.verifyCapsule(id,body.capsule),serviceId:service.serviceId});
  if(route==='/api/profile/upgrade'&&req.method==='POST')return send(res,200,{capsule:service.upgrade(id,body)});
  if((m=route.match(/^\/api\/clans\/([\w-]+)$/))&&req.method==='GET')return send(res,200,service.clanView(m[1],id));
  if((m=route.match(/^\/api\/clans\/([\w-]+)\/apply$/))&&req.method==='POST')return send(res,200,service.apply(id,m[1]));
  if((m=route.match(/^\/api\/clans\/([\w-]+)\/members$/))&&req.method==='POST')return send(res,200,service.memberAction(id,m[1],body));
  if((m=route.match(/^\/api\/clans\/([\w-]+)\/raids$/))&&req.method==='POST')return send(res,201,service.startRaid(id,m[1],body.level));
  if((m=route.match(/^\/api\/raids\/([\w-]+)\/attacks$/))&&req.method==='POST')return send(res,201,service.startAttack(id,m[1],body.loadout,body.requestId));
  if((m=route.match(/^\/api\/attacks\/([\w-]+)$/))&&req.method==='GET')return send(res,200,service.getAttack(id,m[1]));
  if((m=route.match(/^\/api\/attacks\/([\w-]+)\/action$/))&&req.method==='POST')return send(res,200,service.attackAction(id,m[1],body));
  if((m=route.match(/^\/api\/attacks\/([\w-]+)\/finish$/))&&req.method==='POST')return send(res,200,service.finish(id,m[1]));
  throw new Fault(404,'Rota não encontrada.');
 }catch(e){if(!(e instanceof Fault))console.error('Server error:',e.message);send(res,e.status||500,{error:e.status?e.message:'Falha interna. Tente novamente.'});}});
 const timer=setInterval(()=>{try{service.settleDue();}catch(e){console.error('Settlement:',e.message);}},1000);timer.unref();server.on('close',()=>clearInterval(timer));return {server,service};
}
if(require.main===module){const args=process.argv.slice(2),option=(name)=>{const at=args.indexOf(name);return at<0?undefined:args[at+1];};const {server,service}=createServer(),port=Number(option('--port')||process.env.PORT||4173),host=option('--host')||process.env.VEIL_BIND||(process.env.VEIL_PUBLIC_ORIGIN?'0.0.0.0':'127.0.0.1');server.listen(port,host,()=>console.log('VEILFALL R52 em http://'+host+':'+port));const close=()=>server.close(()=>{service.close();process.exit(0);});process.on('SIGINT',close);process.on('SIGTERM',close);}
module.exports={createServer};
