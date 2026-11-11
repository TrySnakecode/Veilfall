'use strict';
/* Transactional email provider used only on server. Credentials never shipped to GitHub Pages. */
async function sendAccountEmail({email,token,purpose}){
 const key=process.env.RESEND_API_KEY,from=process.env.VEIL_EMAIL_FROM,site=process.env.VEIL_FRONTEND_URL,origin=process.env.VEIL_FRONTEND_ORIGIN;
 if(!key||!from||!site||!origin)throw Error('Email provider is not configured.');
 const expected=new URL(origin),dest=new URL(site);
 if(dest.origin!==expected.origin||dest.protocol!=='https:')throw Error('Unsafe frontend email-return URL.');
 if(!['verify','reset'].includes(purpose))throw Error('Unsupported email purpose.');
 const link=new URL(dest.href);link.searchParams.set(purpose,token);
 const subject=purpose==='verify'?'VEILFALL — Confirmar e-mail':'VEILFALL — Recuperar senha';
 const text=(purpose==='verify'?'Confirme o e-mail da sua conta VEILFALL: ':'Use o link para redefinir a senha VEILFALL: ')+link.href+'\n\nIgnore esta mensagem caso não tenha solicitado.';
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key,'User-Agent':'veilfall/100'},body:JSON.stringify({from,to:[email],subject,text}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Email provider rejected the request with HTTP '+response.status);
 return true;
}
module.exports={sendAccountEmail};
