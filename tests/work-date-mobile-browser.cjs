'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({headless:true});
 const out='visual-artifacts/date-44px';
 fs.mkdirSync(out,{recursive:true});
 try{
  for(const width of [320,375,390,430]){
   for(const editor of [false,true]){
    for(const brand of [false,true]){
     const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
     const page=await context.newPage();
     await page.route('**/*',route=>{
      const u=new URL(route.request().url());
      return ['127.0.0.1','localhost'].includes(u.hostname)
        ?(/\.js(?:\?|$)/.test(u.pathname)?route.abort():route.continue())
        :route.abort();
     });
     await page.goto('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});
     await page.evaluate(({editor,brand})=>{
      const app=document.querySelector('#app');
      app.classList.remove('hide');
      app.classList.add('demoMobilePilot');
      if(brand)app.classList.add('estaBrand130');
      const work=document.querySelector('#workPage');
      work.classList.remove('hide');
      if(editor){
       const drawer=document.querySelector('#workEditDrawer');
       drawer.classList.remove('hide');
       document.body.classList.add('workEditOpen');
       drawer.querySelector('#workEditDrawerMount').appendChild(work.querySelector('.workEntryCard'));
      }
      document.querySelector('#date').value='2026-11-03';
      document.querySelector('.workDateDisplayed').textContent='03/11/2026';
      document.querySelector('#content').value='';
     },{editor,brand});
     const info=await page.evaluate(()=>{
      const get=s=>document.querySelector(s);
      const rect=s=>{const el=get(s);if(!el)throw Error('Missing element: '+s);const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,width:r.width,left:r.left};};
      const surface=rect('.workDateDisplayed'),date=rect('#date'),note=rect('#note'),content=rect('#content'),photo=rect('#openNativeCamera');
      const outputCss=getComputedStyle(get('.workDateDisplayed'));
      const inputCss=getComputedStyle(get('#date'));
      return {surface,date,note,content,photo,
       outputCss:{position:outputCss.position,display:outputCss.display,alignItems:outputCss.alignItems,justifyContent:outputCss.justifyContent},
       inputCss:{position:inputCss.position,opacity:inputCss.opacity,pointerEvents:inputCss.pointerEvents},
       overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+3};
     });
     const name=(editor?'edit':'add')+'-'+(brand?'130HH':'62THL')+'-'+width;
     const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1.2,name+' '+msg+': '+a+' vs '+b);
     near(info.surface.height,44,'date surface must be exactly 44 CSS px');
     near(info.date.height,44,'native picker overlay must be 44 CSS px');
     near(info.surface.height,info.note.height,'date matches note control');
     near(info.surface.height,info.photo.height,'date matches camera control');
     near(info.surface.top,info.date.top,'native overlay top aligns to visible surface');
     assert.equal(info.outputCss.position,'relative',name+' date display stays in document flow');
     assert.equal(info.inputCss.position,'absolute',name+' native date is removed from flow');
     assert.equal(info.inputCss.pointerEvents,'auto',name+' native date remains interactive');
     assert.equal(info.overflow,false,name+' no document horizontal overflow');
     await page.locator('#date').click();
     const active=await page.evaluate(()=>document.activeElement?.id);
     assert.equal(active,'date',name+' tapping date focuses picker input');
     await page.screenshot({path:path.join(out,name+'.png')});
     console.log('PASS '+name+' '+JSON.stringify({height:info.surface.height,date:info.date.height,note:info.note.height,photo:info.photo.height}));
     await context.close();
    }
   }
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
