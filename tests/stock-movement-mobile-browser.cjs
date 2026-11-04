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
     if(typeof window.syncStockTxnDateDisplay==='function'){
       window.syncStockTxnDateDisplay();
       if(output.textContent!=='04/11/2026')throw Error('Stock date output incorrect: '+output.textContent);
     }

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
    // Verify the ACTUAL decorative circle and dot, not Chromium's native
    // radio rendering. Safari uses the same DOM decoration and cannot paint
    // its own dark filled unchecked radio over it.
    async function assertRadioState(selected){
      const ui=await page.evaluate(()=>{
        const read=v=>{
          const input=document.querySelector('#stockTxnQuickChoices input[value="'+v+'"]');
          const label=input.closest('label');
          const ring=label.querySelector('.stockTxnRadioMark');
          const dot=label.querySelector('.stockTxnRadioDot');
          if(!ring||!dot)throw Error('Missing decorative ring/dot for '+v);
          const hidden=getComputedStyle(input),r=getComputedStyle(ring),
            d=getComputedStyle(dot),tile=getComputedStyle(label);
          return {checked:input.checked,
            nativeOpacity:hidden.opacity,nativeWidth:hidden.width,
            ringBg:r.backgroundColor,ringBorder:r.borderTopColor,ringSize:r.width,
            dotDisplay:d.display,dotBg:d.backgroundColor,dotWidth:d.width,
            tileBg:tile.backgroundColor,tileBorder:tile.borderTopColor};
        };
        const submit=document.querySelector('#stockTxnSubmit');
        return {in:read('in'),out:read('out'),submitBg:getComputedStyle(submit).backgroundColor};
      });
      const other=selected==='in'?'out':'in',on=ui[selected],off=ui[other];
      assert.equal(on.checked,true,name+' selected native radio');
      assert.equal(off.checked,false,name+' unselected native radio');
      assert.equal(on.nativeOpacity,'0',name+' native radio painting hidden');
      assert.equal(off.nativeOpacity,'0',name+' unselected native radio hidden');
      assert.equal(on.ringBg,'rgb(255, 255, 255)',name+' selected white ring');
      assert.equal(off.ringBg,'rgb(255, 255, 255)',name+' unselected white ring');
      assert.equal(on.ringBorder,'rgb(41, 135, 199)',name+' selected blue outline');
      assert.equal(off.ringBorder,'rgb(38, 59, 83)',name+' unselected dark outline');
      assert.equal(on.dotDisplay,'block',name+' selected navy dot visible');
      assert.equal(off.dotDisplay,'none',name+' unselected center must be EMPTY');
      assert.equal(on.dotBg,'rgb(24, 50, 99)',name+' selected navy dot');
      assert.equal(on.dotWidth,'9px',name+' selected dot size');
      assert.equal(on.tileBorder,'rgb(41, 135, 199)',name+' selected tile border blue');
      assert.equal(off.tileBg,'rgb(255, 255, 255)',name+' unselected tile background white');
      assert.equal(ui.submitBg,'rgb(32, 92, 150)',name+' confirmation button blue regardless of type');
    }
    await assertRadioState('in');
    await page.screenshot({path:path.join(dir,project+'-'+width+'-nhap.png')});
    await page.locator('.stockTxnChoiceOut').click();
    assert.equal(await page.locator('input[name="stockTxnQuickType"][value="out"]').isChecked(),true,name+' out radio');
    await assertRadioState('out');
    await page.locator('.stockTxnChoiceIn').click();
    await assertRadioState('in');
    await page.locator('.stockTxnChoiceOut').click();
    await assertRadioState('out');
    await page.locator('#stockTxnNote').fill('Kiểm tra số lượng và ghi nhận xuất kho '.repeat(9));
    const noteHeight=await page.locator('#stockTxnNote').evaluate(el=>el.getBoundingClientRect().height);
    const scroll=await page.locator('#stockTxnNote').evaluate(el=>{
      if(typeof window.resizeStockTxnNote==='function')window.resizeStockTxnNote();
      else{
        el.style.setProperty('height','44px','important');
        el.style.setProperty('height',Math.max(44,el.scrollHeight)+'px','important');
      }
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
