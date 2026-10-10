'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const app=fs.readFileSync(path.resolve(__dirname,'../app.js'),'utf8');
 const from=app.indexOf('/* Keep PDF POST bodies within the Vercel handler');
 const end=app.indexOf('/* Shared PDF verification:',from);
 assert.ok(from>=0&&end>from,'PDF body helper exists in app.js');
 const code=app.slice(from,end);
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.goto('about:blank');
  await page.addScriptTag({content:code});
  const result=await page.evaluate(async()=>{
   const tiny={report_type:'generic',title:'Tệp kiểm thử',rows:[[1,2,3]],photos:[]};
   const unchanged=await estaPdfRequestBody(tiny);
   const canvas=document.createElement('canvas');canvas.width=1250;canvas.height=1200;
   const ctx=canvas.getContext('2d'),im=ctx.createImageData(canvas.width,canvas.height);
   let state=913434;
   for(let i=0;i<im.data.length;i+=4){
    state=(Math.imul(state,1664525)+1013904223)>>>0;
    im.data[i]=state&255;im.data[i+1]=(state>>>8)&255;im.data[i+2]=(state>>>16)&255;im.data[i+3]=255;
   }
   ctx.putImageData(im,0,0);
   const original=canvas.toDataURL('image/png');
   const payload={report_type:'work',tasks:[{title:'Nhiều ảnh',images:[
    {path:original,caption:'Hình 1'},
    {path:original,caption:'Hình 2'}
   ]}]};
   const originalCount=payload.tasks[0].images[0].path.length;
   const beforeSize=new Blob([JSON.stringify(payload)]).size;
   const compact=await estaPdfRequestBody(payload);
   const parsed=JSON.parse(compact);
   let rejected=false;
   try{await estaPdfRequestBody({note:'X'.repeat(2_600_000)})}catch(e){rejected=/2,5 MB/.test(e.message)}
   return {
    tinyExact:unchanged===JSON.stringify(tiny),
    beforeSize,afterSize:new Blob([compact]).size,
    originalCount,preserved:payload.tasks[0].images[0].path.length===originalCount,
    compressed:parsed.tasks[0].images.every(i=>i.path.startsWith('data:image/jpeg;base64,')),
    photoCount:parsed.tasks[0].images.length,rejected
   };
  });
  assert.equal(result.tinyExact,true,'small payload unchanged');
  assert.ok(result.beforeSize>2_500_000,'fixture exceeds Vercel request cap');
  assert.ok(result.afterSize<2_350_000,'oversized inline image payload compressed below 2.35MB');
  assert.equal(result.preserved,true,'original images not changed');
  assert.equal(result.compressed,true,'outgoing JPEG data URL valid');
  assert.equal(result.photoCount,2,'all photos retained');
  assert.equal(result.rejected,true,'huge non-image content reports limit clearly');
  console.log('PASS real Chromium PDF compression and 2.5MB guard',result);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
