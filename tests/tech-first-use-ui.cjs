'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const out='tech-ux-review';
fs.mkdirSync(out,{recursive:true});
const results=[];
async function review(width){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width,height:width<600?844:900},permissions:[],deviceScaleFactor:1});
 const page=await context.newPage();
 await page.route('**/*',route=>{
  try{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();}catch(e){}
  return route.abort();
 });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8766/',{waitUntil:'load'});
  await page.evaluate(()=>window.enterAccount({username:'kt-test',display_name:'Kỹ thuật A',is_admin:false,buildings:[
   {id:'130HH',name:'130 Hồng Hà',role:'editor'},
   {id:'62THL',name:'62 Trần Huy Liệu',role:'editor'}
  ]},null));
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#navAdmin').isVisible(),false,'technical role has no Admin menu');
  console.log('FIRST-USE GUIDE DEBUG',JSON.stringify(await page.evaluate(()=>({
   guide:!!document.querySelector('#techFirstUseGuide'),
   guideHidden:document.querySelector('#techFirstUseGuide')?.className,
   account:currentAccount?.is_admin,
   projectOverview:projectOverviewActive,
   workBar:!!document.querySelector('#techWorkShortcuts'),
   techClass:document.body.classList.contains('techFirstUse'),
   homeHidden:document.querySelector('#homePage')?.classList.contains('hide'),
   homeActualDisplay:getComputedStyle(document.querySelector('#homePage')).display,
   guideDisplay:getComputedStyle(document.querySelector('#techFirstUseGuide')).display,
   guideVisibility:getComputedStyle(document.querySelector('#techFirstUseGuide')).visibility,
   guideRect:document.querySelector('#techFirstUseGuide').getBoundingClientRect().toJSON(),
   guideParentTag:document.querySelector('#techFirstUseGuide').parentElement?.id,
   appDisplay:getComputedStyle(document.querySelector('#app')).display
  })),null,2),'browser-errors',errors);
  assert.equal(await page.locator('#techFirstUseGuide').isVisible(),true,'new technician sees start guide');
  await page.locator('#navWork').evaluate(el=>el.click());
  await page.waitForTimeout(170);
  assert.equal(await page.locator('#techWorkShortcuts').isVisible(),true);
  assert.equal(await page.locator('#workPage > .workEntryCard').isVisible(),false,'list is shown before new form');
  await page.screenshot({path:out+'/01-work-list-'+width+'.png',animations:'disabled'});
  await page.locator('#techCreateWork').click();
  assert.equal(await page.locator('#workPage > .workEntryCard').isVisible(),true,'create button opens form');
  await page.waitForTimeout(80);
  await page.evaluate(()=>{
   projectPeople=[{id:'fixture-p1',name:'Kỹ thuật A'}];
   renderAllPeopleSelectors();
  });
  await page.waitForTimeout(120);
  assert.equal(await page.evaluate(()=>taskSelectedPeople.includes('Kỹ thuật A')),true,'matching performer auto-selected');
  await page.locator('#content').fill('Kiểm tra máy bơm kỹ thuật');
  await page.evaluate(()=>{const status=document.querySelector('#status');status.value='Đã hoàn thành';status.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForTimeout(100);
  const mobile=width<=640;
  if(mobile)assert.equal(await page.locator('#task130Result').isVisible(),true,'mobile inline result');
  else assert.equal(await page.locator('#techInlineResult').isVisible(),true,'desktop inline result');
  const result=mobile?'#task130Result':'#demoTaskResult';
  await page.locator(result).fill('Kiểm tra xong, máy bơm hoạt động tốt');
  await page.screenshot({path:out+'/02-complete-'+width+'.png',animations:'disabled'});
  const before=await page.evaluate(()=>load().length);
  await page.locator('#saveBtn').evaluate(el=>el.click());
  await page.waitForTimeout(100);
  const after=await page.evaluate(()=>({count:load().length,text:document.querySelector('#content').value,notice:document.querySelector('#demo130MissingBanner')?.textContent||document.querySelector('#toast')?.textContent||''}));
  assert.equal(after.count,before,'no local fake-success save without server ACK');
  assert.equal(after.text,'Kiểm tra máy bơm kỹ thuật','form preserved for offline retry');
  await page.screenshot({path:out+'/03-unsynced-'+width+'.png',animations:'disabled'});
  if(mobile){
   await page.locator('#technicalProjectSelect').selectOption('62THL');
   await page.waitForTimeout(150);
   assert.equal(await page.evaluate(()=>currentBuilding.id),'62THL','technical project switch works');
  }
  results.push({width,checks:['Admin hidden','guide visible','task list before form','create work button','auto-select current performer','completion result near status','no false save offline','form retained','project switch on mobile'],after,errorCount:errors.length,errors});
  assert.deepEqual(errors,[],'no uncaught browser JS errors');
 }finally{await context.close();await browser.close();}
}
(async()=>{
 for(const width of [390,1440])await review(width);
 fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2));
 console.log('PASS technician UX smoke: 2 viewports; '+JSON.stringify(results.map(x=>({width:x.width,after:x.after,errorCount:x.errorCount}))));
})().catch(e=>{console.error(e);process.exitCode=1});
