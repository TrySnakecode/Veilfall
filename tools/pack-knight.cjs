/* Mechanical extraction of isolated generated frames; no drawing or recoloring. */
const sharp=require('sharp'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),cell=128,ground=105,margin=8;
(async()=>{const frames=[],sources=[];
 for(const [group,name]of ['locomotion','combat','reactions'].entries()){
  const source=path.join(root,'assets/source/characters/knight-'+name+'.png'),meta=await sharp(source).metadata(),items=[];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
   const left=Math.round(c*meta.width/4),top=Math.round(r*meta.height/4),width=Math.round((c+1)*meta.width/4)-left,height=Math.round((r+1)*meta.height/4)-top;
   const raw=await sharp(source).extract({left,top,width,height}).ensureAlpha().raw().toBuffer();let x0=width,y0=height,x1=0,y1=0,n=0;
   // Bound the connected actor, not isolated spill pixels from another source cell.
   const seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let best=[];
   for(let seed=0;seed<seen.length;seed++)if(!seen[seed]&&raw[seed*4+3]>24){let head=0,tail=1;queue[0]=seed;seen[seed]=1;while(head<tail){const pos=queue[head++],xx=pos%width,yy=(pos/width)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=xx+dx,ny=yy+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;const q=ny*width+nx;if(!seen[q]&&raw[q*4+3]>24){seen[q]=1;queue[tail++]=q;}}}if(tail>best.length)best=Array.from(queue.subarray(0,tail));}
   for(const pos of best){const x=pos%width,y=(pos/width)|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);n++;}
   x0=Math.max(0,x0-1);y0=Math.max(0,y0-1);x1=Math.min(width-1,x1+1);y1=Math.min(height-1,y1+1);
   if(n<100)throw Error('Empty frame '+name+' '+r+','+c);
   items.push({raw,width,height,x0,x1,y0,y1,r,c,n});
  }
  const heights=items.slice(0,4).map(f=>f.y1-f.y0+1).sort((a,b)=>a-b),baseScale=80/((heights[1]+heights[2])/2);
  for(let i=0;i<16;i++){
   const f=items[i],w=f.x1-f.x0+1,h=f.y1-f.y0+1,extent=Math.max(f.width/2-f.x0,f.x1-f.width/2)+1;
   const scale=Math.min(baseScale,(cell/2-margin)/extent,(ground-margin)/h);
   const dw=Math.max(1,Math.round(w*scale)),dh=Math.max(1,Math.round(h*scale));
   const buffer=await sharp(f.raw,{raw:{width:f.width,height:f.height,channels:4}}).extract({left:f.x0,top:f.y0,width:w,height:h}).resize(dw,dh,{kernel:'nearest'}).png().toBuffer();
   const index=group*16+i,col=index%8,row=Math.floor(index/8),x=col*cell+Math.round(cell/2+(f.x0-f.width/2)*scale),y=row*cell+ground-dh;
   frames.push({input:buffer,left:x,top:y});sources.push({index,row,column:col,source:name,sourceRow:f.r,sourceColumn:f.c,sourceRect:[f.x0,f.y0,w,h],destRect:[x-col*cell,y-row*cell,dw,dh],scale});
  }
 }
 await sharp({create:{width:cell*8,height:cell*6,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(frames).png().toFile(path.join(root,'assets/characters/knight.png'));
 fs.writeFileSync(path.join(root,'assets/knight-manifest.json'),JSON.stringify({version:49,columns:8,rows:6,cell,groundAnchor:[64,105],uniqueFrames:48,frames:sources},null,2));console.log('Knight: 48 isolated frames, 1024x768, ground 105, minimum 8 px gutter.');
})();
