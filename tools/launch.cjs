/* Local Windows launcher. No global installation, port killing or public bind. */
'use strict';
if(Number(process.versions.node.split('.')[0])<24){console.error('Este servidor precisa de Node.js 24 ou superior. Para jogar offline, abra VEILFALL.html.');process.exit(1);}
const {spawn}=require('node:child_process'),{createServer}=require('../server/server.cjs');
const {server,service}=createServer();let port=4173;
server.on('error',err=>{if(err.code==='EADDRINUSE'&&port<4183){port++;server.listen(port,'127.0.0.1');}else{console.error('Não foi possível iniciar: '+err.message);service.close();process.exitCode=1;}});
server.on('listening',()=>{const url='http://127.0.0.1:'+port;console.log('VEILFALL R66 aberto em '+url+'\nMantenha esta janela aberta enquanto jogar com o servidor.');if(process.platform==='win32'){const opener=spawn('cmd.exe',['/d','/c','start','',url],{stdio:'ignore',windowsHide:true});opener.on('error',()=>console.log('Abra o endereço acima no navegador.'));opener.unref();}});
const close=()=>server.close(()=>{service.close();process.exit(0);});process.on('SIGINT',close);process.on('SIGTERM',close);server.listen(port,'127.0.0.1');
