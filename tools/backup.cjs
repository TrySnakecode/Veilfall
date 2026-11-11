'use strict';
// Online-safe SQLite snapshot; store snapshots OFF the server for disaster recovery.
const fs=require('node:fs'),path=require('node:path');const {DatabaseSync}=require('node:sqlite');
const data=process.env.VEIL_DATA_DIR||path.resolve(__dirname,'../var'),target=process.argv[2]||path.join(data,'backups');
fs.mkdirSync(target,{recursive:true,mode:0o700});
const db=path.join(data,'veilfall.sqlite');if(!fs.existsSync(db))throw Error('Database does not exist at '+db);
const stamp=new Date().toISOString().replace(/[:.]/g,'-');const output=path.join(target,'veilfall-'+stamp+'.sqlite');
const connection=new DatabaseSync(db,{readOnly:true});
try{connection.exec('VACUUM INTO '+"'"+output.replaceAll("'","''")+"'");}finally{connection.close();}
fs.chmodSync(output,0o600);
const signing=path.join(data,'signing-private.pem');if(fs.existsSync(signing)){const pem=path.join(target,'signing-'+stamp+'.pem');fs.copyFileSync(signing,pem);fs.chmodSync(pem,0o600);}
console.log('Backup created:',output,' (includes private signing-key backup if present; protect the directory).');
