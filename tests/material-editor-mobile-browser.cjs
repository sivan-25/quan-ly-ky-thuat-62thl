'use strict';
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const fs=require('fs');
const path=require('path');
const app=fs.readFileSync('app.js','utf8');
for(const expr of [/function syncMaterialDateDisplay\(\)/,/function resizeMaterialNote\(\)/,/materialSaveBtn"\)\.textContent="Lưu thay đổi"/,/materialSaveBtn"\)\.textContent="Lưu vật tư"/,/\/rest\/v1\/inventory_materials/])assert.match(app,expr);
assert.match(app,/\$\("#materialOpeningQty"\)\.value="";\$\("#materialMinQty"\)\.value="";/,'new material stock amounts must be blank on reset');
assert.match(app,/opening_qty:inventoryNum\(\$\("#materialOpeningQty"\)\.value\)/,'empty stock amount is still normalized to zero on save');
assert.match(app,/min_qty:inventoryNum\(\$\("#materialMinQty"\)\.value\)/,'empty minimum is still normalized to zero on save');

(async()=>{
 const browser=await (process.env.ESTA_MATERIAL_BROWSER==='webkit'?webkit:chromium).launch({headless:true});
 const dir='visual-artifacts/material-editor';fs.mkdirSync(dir,{recursive:true});let n=0;
 try{
  for(const width of [320,375,390,430]){
   for(const project of ['62THL','68PĐL','127HH','130HH']){
    for(const editing of [false,true]){
     const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:'vi-VN'});
     const page=await context.newPage();
     await page.route('**/*',route=>{const u=new URL(route.request().url());return ['localhost','127.0.0.1'].includes(u.hostname)?route.continue():route.abort()});
     await page.goto('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});
     await page.evaluate(({project,editing})=>{
      if(project==='130HH'){
       document.body.classList.add('estaBrand130');
       document.getElementById('app').classList.add('estaBrand130','demoExactProject','demoProjectMode','updateProjectMode');
      }
      document.getElementById('app').classList.remove('hide');
      document.getElementById('materialItemModal').classList.remove('hide');
      document.getElementById('materialId').value=editing?'existing-test-id':'';
      document.getElementById('materialModalTitle').textContent=editing?'Chỉnh sửa vật tư':'Thêm vật tư';
      document.getElementById('materialSaveBtn').textContent=editing?'Lưu thay đổi':'Lưu vật tư';
      document.getElementById('materialName').value=editing?'Băng keo điện':'';
      document.getElementById('materialCode').value=editing?'VT-001':'';
      document.getElementById('materialUnit').value='Cái';
      document.getElementById('materialTrackingStart').value='2026-11-04';
      document.querySelector('.materialDateDisplayed').textContent='04/11/2026';
      document.getElementById('materialOpeningQty').value=editing?'2':'';
      document.getElementById('materialMinQty').value=editing?'1':'';
      document.getElementById('materialNote').value=editing?'Đặt ở kho kỹ thuật':'';
     },{project,editing});
     await page.waitForTimeout(40);
     const m=await page.evaluate(()=>{
      const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,w:r.width,h:r.height}};
      const bg=s=>getComputedStyle(document.querySelector(s)).backgroundColor;
      return {name:box('#materialName'),unit:box('#materialUnit'),
       hiddenCodeType:document.getElementById('materialCode').type,
       hiddenCodeValue:document.getElementById('materialCode').value,
       date:box('.materialDateDisplayed'),inputDate:box('#materialTrackingStart'),
       unitLabel:box('.materialUnitField>span:first-child'),
       dateLabel:box('.materialTrackingField>span:first-child'),
       opening:box('#materialOpeningQty'),minimum:box('#materialMinQty'),note:box('#materialNote'),
       openingValue:document.getElementById('materialOpeningQty').value,
       minimumValue:document.getElementById('materialMinQty').value,
       openingPlaceholder:document.getElementById('materialOpeningQty').placeholder,
       minimumPlaceholder:document.getElementById('materialMinQty').placeholder,
       cancel:box('#cancelMaterialModal'),save:box('#materialSaveBtn'),
       cardBg:bg('#materialItemModal .inventoryModalCard'),formBg:bg('#materialItemForm'),
       headerBg:bg('#materialItemModal .materialEditorHeader'),
       sharedHeaderCount:document.querySelectorAll('#materialItemModal .inventoryModalHead').length,
       headerGradient:getComputedStyle(document.querySelector('#materialItemModal .materialEditorHeader')).backgroundImage,
       footerBg:bg('#materialItemModal .inventoryFormActions'),
       titleColor:getComputedStyle(document.getElementById('materialModalTitle')).color,
       kickerColor:getComputedStyle(document.querySelector('#materialItemModal .materialEditorHeader>span')).color,
       descriptionColor:getComputedStyle(document.querySelector('#materialItemModal .materialEditorHeader p')).color,
       closeBg:bg('#closeMaterialModal'),
       closeText:getComputedStyle(document.getElementById('closeMaterialModal')).color,
       inputBg:bg('#materialName'),saveBg:bg('#materialSaveBtn'),cancelBg:bg('#cancelMaterialModal'),
       controls:['materialName','materialUnit','materialOpeningQty','materialMinQty','materialNote'].map(id=>{
        const e=document.getElementById(id),c=getComputedStyle(e),label=e.closest('label').querySelector('span'),l=getComputedStyle(label),placeholder=getComputedStyle(e,'::placeholder');
        return {id,bg:c.backgroundColor,color:c.color,webkitFill:c.webkitTextFillColor,opacity:c.opacity,
         appearance:c.webkitAppearance,placeholderColor:placeholder.color,labelColor:l.color};
       }),
       datePosition:getComputedStyle(document.getElementById('materialTrackingStart')).position,
       title:document.getElementById('materialModalTitle').textContent,
       buttonText:document.getElementById('materialSaveBtn').textContent,
       overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
     });
     const title=project+' '+width+' '+(editing?'edit':'add');
     const near=(a,b,msg)=>assert.ok(Math.abs(a-b)<1.25,title+' '+msg+': '+a+' vs '+b);
     for(const key of ['name','unit','date','inputDate','opening','minimum','note'])near(m[key].h,44,key+' must equal 44px');
     assert.equal(m.hiddenCodeType,'hidden',title+' old codes must not be visible');
     assert.equal(m.hiddenCodeValue,editing?'VT-001':'',title+' existing code must survive editing');
     for(const key of ['cancel','save'])near(m[key].h,48,key+' must equal 48px');
     assert.ok(m.unit.y>m.name.y+20,title+' name must be above unit/date row');
     near(m.unit.y,m.date.y,'Unit and date input must be on the SAME row');
     near(m.unit.w,m.date.w,'Unit and date occupy equal half widths');
     near(m.unitLabel.y,m.dateLabel.y,'unit/date captions start together');
     near(m.unitLabel.h,m.dateLabel.h,'unit/date captions match height');
     assert.ok(m.unit.right<=m.date.x+1,title+' unit is left of start date with a gap');
     assert.ok(m.opening.y>m.unit.y+20,title+' stock row appears below unit/date');
     near(m.opening.y,m.minimum.y,'opening and minimum same row');
     near(m.opening.w,m.minimum.w,'stock fields equal widths');
     near(m.cancel.y,m.save.y,'actions same row');
     assert.ok(m.opening.right<=m.minimum.x+1,title+' stock fields correctly ordered');
     assert.ok(m.cancel.right<=m.save.x+1,title+' Cancel left of Save');
     assert.ok(m.overflow<4,title+' no horizontal overflow');
     assert.equal(m.sharedHeaderCount,0,title+' dark shared inventory header class must be absent');
     assert.equal(m.cardBg,'rgb(255, 255, 255)',title+' approved white modal card');
     assert.equal(m.formBg,'rgb(255, 255, 255)',title+' approved white form');
     assert.equal(m.headerBg,'rgb(237, 245, 255)',title+' approved pale blue header');
     assert.equal(m.titleColor,'rgb(24, 50, 99)',title+' navy title on pale header');
     assert.equal(m.kickerColor,'rgb(32, 92, 150)',title+' blue kicker');
     assert.equal(m.descriptionColor,'rgb(82, 103, 128)',title+' readable muted description');
     assert.equal(m.closeBg,'rgb(248, 251, 255)',title+' pale close control');
     assert.equal(m.closeText,'rgb(24, 50, 99)',title+' navy close icon');
     assert.ok(m.headerGradient.includes('linear-gradient'),title+' approved soft blue header gradient');
     assert.equal(m.footerBg,'rgb(255, 255, 255)',title+' white action footer');
     assert.equal(m.inputBg,'rgb(255, 255, 255)',title+' inputs white');
     for(const c of m.controls){
      assert.equal(c.bg,'rgb(255, 255, 255)',title+' '+c.id+' must have white background: '+JSON.stringify(c));
      assert.equal(c.color,'rgb(24, 50, 99)',title+' '+c.id+' text navy: '+JSON.stringify(c));
      assert.equal(c.webkitFill,'rgb(24, 50, 99)',title+' '+c.id+' fill navy: '+JSON.stringify(c));
      assert.equal(c.labelColor,'rgb(24, 50, 99)',title+' '+c.id+' label navy: '+JSON.stringify(c));
      assert.equal(c.opacity,'1',title+' '+c.id+' must not be dim');
     }
     assert.equal(m.saveBg,'rgb(32, 92, 150)',title+' Save fixed blue');
     assert.equal(m.cancelBg,'rgb(252, 233, 230)',title+' Cancel light red');
     assert.equal(m.datePosition,'absolute',title+' date picker overlay');
     assert.equal(m.buttonText,editing?'Lưu thay đổi':'Lưu vật tư',title+' button label');
     assert.equal(m.openingPlaceholder,'Nhập',title+' opening placeholder');
     assert.equal(m.minimumPlaceholder,'Nhập',title+' minimum placeholder');
     assert.equal(m.openingValue,editing?'2':'',title+' add blank / edit keeps real opening stock');
     assert.equal(m.minimumValue,editing?'1':'',title+' add blank / edit keeps real minimum stock');
     if(!editing){
      await page.locator('#materialOpeningQty').fill('5');
      await page.locator('#materialMinQty').fill('3');
      assert.equal(await page.locator('#materialOpeningQty').inputValue(),'5',title+' entering opening amount needs no clearing');
      assert.equal(await page.locator('#materialMinQty').inputValue(),'3',title+' entering minimum amount needs no clearing');
     }
     await page.locator('#materialNote').fill('Ghi chú quy cách, hãng, vị trí lưu kho kỹ thuật '.repeat(8));
     const grows=await page.locator('#materialNote').evaluate(el=>{el.style.setProperty('height','44px','important');el.style.setProperty('height',Math.max(44,el.scrollHeight)+'px','important');return el.getBoundingClientRect().height;});
     assert.ok(grows>44,title+' long note can expand');
     await page.screenshot({path:path.join(dir,project+'-'+width+'-'+(editing?'edit':'add')+'.png')});
     console.log('PASS '+title+' material inputs 44px, actions 48px, light work-style card');n++;await context.close();
    }
   }
  }
 }finally{await browser.close()}
 console.log('PASS '+n+'/32 material Add/Edit cases');
})().catch(e=>{console.error(e);process.exitCode=1});
