'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const dir='visual-artifacts/stock-movement';
 fs.mkdirSync(dir,{recursive:true});
 let total=0;
 try{
  for(const width of [320,375,390,430]){
   for(const project of ['62THL','68PĐL','127HH','130HH']){
    const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'vi-VN'});
    const page=await context.newPage();
    await page.route('**/*',route=>{
     const u=new URL(route.request().url());
     return ['127.0.0.1','localhost'].includes(u.hostname)?route.continue():route.abort();
    });
    await page.goto('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});
    await page.evaluate(project=>{
     const body=document.body,modal=document.getElementById('stockTxnModal'),date=document.getElementById('stockTxnDate');
     document.getElementById('app').classList.remove('hide');
     if(project==='130HH')body.classList.add('estaBrand130');
     modal.classList.remove('hide');
     modal.classList.add('stockTxnSharedCompact');
     date.value='2026-11-04';
     const output=modal.querySelector('.stockTxnDateDisplayed');
     output.textContent='04/11/2026';
     const note=document.getElementById('stockTxnNote');
     note.value='';
     const choice=modal.querySelector('input[name="stockTxnQuickType"][value="in"]');
     choice.checked=true;
     document.getElementById('stockTxnType').value='in';
     document.getElementById('stockTxnSubmit').textContent='Xác nhận nhập';
    },project);
    await page.waitForTimeout(60);
    const measured=await page.evaluate(()=>{
     const box=s=>{const el=document.querySelector(s),r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,h:r.height,w:r.width};};
     return {
      card:box('#stockTxnModal .inventoryModalCard'),
      material:box('#stockTxnMaterial'),
      in:box('.stockTxnChoiceIn'),out:box('.stockTxnChoiceOut'),
      date:box('.stockTxnDateDisplayed'),dateInput:box('#stockTxnDate'),
      qty:box('#stockTxnQty'),person:box('#stockTxnPerformer'),note:box('#stockTxnNote'),
      cancel:box('#cancelStockTxnModal'),submit:box('#stockTxnSubmit'),
      styles:{
       bg:getComputedStyle(document.querySelector('#stockTxnModal .inventoryModalCard')).backgroundColor,
       inputBg:getComputedStyle(document.getElementById('stockTxnMaterial')).backgroundColor,
       typeColumns:getComputedStyle(document.getElementById('stockTxnQuickChoices')).gridTemplateColumns
      },
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
     };
    });
    const name=project+' '+width;
    for(const key of ['material','in','out','date','dateInput','qty','person','note']){
     assert.ok(Math.abs(measured[key].h-44)<1.25,name+' '+key+' must be 44px, got '+JSON.stringify(measured[key]));
    }
    for(const key of ['cancel','submit'])assert.ok(Math.abs(measured[key].h-48)<1.25,name+' '+key+' must be 48px');
    for(const [a,b] of [['in','out'],['date','qty'],['cancel','submit']]){
     assert.ok(Math.abs(measured[a].y-measured[b].y)<2,name+' '+a+' / '+b+' should share one row: '+JSON.stringify({a:measured[a],b:measured[b],grid:measured.styles.typeColumns}));
     assert.ok(measured[b].x>=measured[a].right-1,name+' '+a+' should be left of '+b);
    }
    assert.ok(Math.abs(measured.in.w-measured.out.w)<2,name+' choice columns equal');
    assert.ok(Math.abs(measured.date.w-measured.qty.w)<2,name+' date & qty widths equal');
    assert.ok(measured.overflow<4,name+' horizontal overflow');
    assert.equal(measured.styles.bg,'rgb(231, 244, 252)',name+' modal must use light work-card blue');
    assert.equal(measured.styles.inputBg,'rgb(255, 255, 255)',name+' fields use white background');
    await page.locator('.stockTxnChoiceOut').click();
    assert.equal(await page.locator('input[name="stockTxnQuickType"][value="out"]').isChecked(),true,name+' out radio');
    await page.locator('#stockTxnNote').fill('Kiểm tra số lượng và ghi nhận xuất kho '.repeat(9));
    const noteHeight=await page.locator('#stockTxnNote').evaluate(el=>el.getBoundingClientRect().height);
    const scroll=await page.locator('#stockTxnNote').evaluate(el=>{
      el.style.setProperty('height','44px','important');
      el.style.setProperty('height',Math.max(44,el.scrollHeight)+'px','important');
      return el.scrollHeight;
    });
    const grown=await page.locator('#stockTxnNote').evaluate(el=>el.getBoundingClientRect().height);
    assert.ok(scroll>44&&grown>44,name+' long note must truly expand: '+JSON.stringify({scroll,grown}));
    await page.screenshot({path:path.join(dir,project+'-'+width+'.png')});
    console.log('PASS '+name+' stock form: 44px controls, two 50/50 rows, light blue modal, long note scrollHeight '+scroll+' (box '+noteHeight+')');
    total++;
    await context.close();
   }
  }
 }finally{await browser.close()}
 console.log('PASS '+total+'/16 stock modal browser geometry cases');
})().catch(err=>{console.error(err);process.exitCode=1});
