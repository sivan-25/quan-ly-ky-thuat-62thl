'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const editor=fs.readFileSync('admin-work-editor.js','utf8');
const css=fs.readFileSync('admin-work-editor.css','utf8');
const tpl=editor.match(/m\.innerHTML=`([\s\S]*?)`;/);
assert.ok(tpl,'Real Admin editor DOM template available');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [320,360,375,390,430,600,760]){
   const context=await browser.newContext({viewport:{width,height:780},locale:'vi-VN'});
   const page=await context.newPage();
   await page.setContent('<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'</style></head><body style="margin:0"><div id="ccAdminWorkEdit" class="ccAdminWorkEdit">'+tpl[1]+'</div></body></html>');
   for(const [id,date] of [['ccWeAssigned','2026-10-18'],['ccWeStart','2026-10-18'],['ccWeDue','2026-10-20']]){
    await page.locator('#'+id).fill(date);
   }
   const metrics=await page.evaluate(()=>{
    const box=id=>{const r=document.querySelector('#'+id).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const p=['ccWeAssigned','ccWeStart','ccWeDue','ccWeType','ccWePriority','ccWeStatus'];
    const labels=Object.fromEntries(p.map(id=>[id,box(id)]));
    const grid=document.querySelector('.ccWeGrid').getBoundingClientRect();
    return {labels,grid:{left:grid.left,right:grid.right,width:grid.width},
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      footer:box('ccWeSave')};
   });
   assert.ok(metrics.overflow<=1,'Horizontal overflow at width '+width+': '+JSON.stringify(metrics));
   for(const id of ['ccWeAssigned','ccWeStart','ccWeDue','ccWeType','ccWePriority','ccWeStatus']){
    const r=metrics.labels[id];
    assert.ok(r.x>=metrics.grid.left-1&&r.right<=metrics.grid.right+1,'Control '+id+' escapes grid at '+width+': '+JSON.stringify(metrics));
    assert.ok(r.height>=44,'Tap target too short for '+id+' at '+width);
   }
   for(const [a,b] of [['ccWeAssigned','ccWeStart'],['ccWeStart','ccWeDue']]){
    const one=metrics.labels[a],two=metrics.labels[b];
    if(width<=600)assert.ok(two.y>=one.bottom+2,'iPhone date controls overlap: '+width);
   }
   if(width>370&&width<=600){
    const p=metrics.labels.ccWePriority,s=metrics.labels.ccWeStatus;
    assert.ok(Math.abs(p.y-s.y)<=2,'Priority and status must share a row '+width);
    assert.ok(Math.abs(p.width-s.width)<=2,'Paired controls have unequal widths '+width);
    assert.ok(s.x>=p.right,'Paired controls overlap '+width);
   }
   assert.ok(metrics.footer.bottom<=781,'Save action not reachable at '+width);
   console.log('PASS Admin editor mobile geometry '+width+'px');
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
