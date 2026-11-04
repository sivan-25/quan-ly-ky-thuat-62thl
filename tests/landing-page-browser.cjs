'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true});
  const output=path.join('visual-artifacts','landing');
  fs.mkdirSync(output,{recursive:true});
  let count=0;
  try{
    for(const width of [320,375,390,430,768,1024,1440]){
      const ctx=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,locale:'vi-VN',hasTouch:width<800,isMobile:width<800});
      const page=await ctx.newPage();
      const errors=[];
      page.on('pageerror',err=>errors.push(err.message));
      await page.goto('http://127.0.0.1:8766/landing/',{waitUntil:'load'});
      const result=await page.evaluate(()=>{
        const intro=document.querySelector('#hero-title');
        const mock=document.querySelector('.mock-app');
        const style=getComputedStyle(document.querySelector('.hero'));
        const btn=document.querySelector('.hero-actions .btn-primary');
        return {
          title:document.title,
          intro:intro?.textContent?.trim(),
          background:style.backgroundImage,
          mockWidth:mock?.getBoundingClientRect().width,
          viewport:document.documentElement.clientWidth,
          scrollWidth:document.documentElement.scrollWidth,
          login:btn?.getAttribute('href'),
          features:document.querySelectorAll('.feature-card').length,
          label:document.querySelector('.illustrative-label')?.textContent
        };
      });
      assert.ok(result.title.includes('ESTA'),width+' title missing');
      assert.ok(result.intro.includes('Quản lý kỹ thuật'),width+' heading missing');
      assert.ok(result.background.includes('linear-gradient'),width+' light hero gradient missing');
      assert.ok(result.mockWidth>180&&result.mockWidth<=result.viewport+1,width+' illustration width invalid');
      assert.ok(result.scrollWidth<=result.viewport+3,width+' horizontal overflow: '+JSON.stringify(result));
      assert.equal(result.login,'/',width+' system link must lead to existing app');
      assert.equal(result.features,4,width+' four function groups present');
      assert.ok(result.label.includes('KHÔNG PHẢI DỮ LIỆU THỰ'),width+' example data disclosure missing');
      assert.deepEqual(errors,[],width+' unexpected page errors');
      await page.screenshot({path:path.join(output,'esta-'+width+'.png'),fullPage:true});
      await ctx.close();
      count++;
      console.log('PASS landing '+width+'px: responsive, CTA, no overflow and illustration labeled');
    }
  } finally {
    await browser.close();
  }
  console.log('PASS '+count+'/7 landing browser viewport cases');
})().catch(error=>{console.error(error);process.exitCode=1});
