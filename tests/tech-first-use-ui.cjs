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
  // Seed only browser-local fixture tasks; never connect to real Supabase.
  await page.evaluate(()=>{
    projectPeople=[{id:'fictional-p1',name:'Kỹ thuật A'},{id:'fictional-p2',name:'Kỹ thuật B'}];
    renderAllPeopleSelectors();
    localStorage.setItem(taskStorageKeyFor(currentBuilding.id),JSON.stringify([
      {id:881,d:today(),c:'Việc của Kỹ thuật A',t:'Hằng ngày',s:'Đang thực hiện',n:'',a:'Kỹ thuật A',performers:['Kỹ thuật A'],imgs:[]},
      {id:882,d:today(),c:'Việc của Kỹ thuật B',t:'Hằng ngày',s:'Đang thực hiện',n:'',a:'Kỹ thuật B',performers:['Kỹ thuật B'],imgs:[]},
      {id:883,d:'2026-01-01',c:'Việc cũ của Kỹ thuật B',t:'Bảo trì',s:'Đã hoàn thành',n:'',a:'Kỹ thuật B',performers:['Kỹ thuật B'],imgs:[]}
    ]));
    render();
  });
  assert.equal(await page.locator('#tbody tr').count(),3,'three synthetic tasks shown');
  await page.locator('#techMineWork').click();
  assert.equal(await page.locator('#tbody tr').count(),1,'mine filter shows only assigned tasks');
  assert.match(await page.locator('#tbody').innerText(),/Việc của Kỹ thuật A/);
  await page.locator('#techTodayWork').click();
  assert.equal(await page.locator('#tbody tr').count(),2,'today filter excludes old task');
  await page.locator('#techAllWork').click();
  assert.equal(await page.locator('#tbody tr').count(),3,'all filter resets previous filters');

  await page.evaluate(()=>window.editTask(881));
  assert.equal(await page.locator('#workEditDrawer').isVisible(),true,'existing job opens edit drawer');
  assert.equal(await page.locator('#content').isVisible(),true,'edit form stays visible');
  assert.equal(await page.locator('#content').inputValue(),'Việc của Kỹ thuật A');
  // Editing an existing job to Completed must reveal the SAME KQ field.
  await page.evaluate(()=>{
    const status=document.querySelector('#status');
    status.value='Đã hoàn thành';
    status.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForTimeout(80);
  const editResult=width<=640?'#task130Result':'#demoTaskResult';
  assert.equal(await page.locator(editResult).isVisible(),true,'KQ visible while editing completed task');
  assert.equal(await page.locator('#workEditDrawer').isVisible(),true,'completion does not dismiss editor');
  await page.screenshot({path:out+'/01b-work-edit-'+width+'.png',animations:'disabled'});
  await page.locator('#closeWorkEditDrawer').evaluate(el=>el.click());
  assert.equal(await page.locator('#workEditDrawer').isVisible(),false,'edit drawer closes');
  assert.equal(await page.locator('#workPage > .workEntryCard').isVisible(),false,'list-first mode restored');

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
  else {
   assert.equal(await page.locator('#techInlineResult').isVisible(),true,'desktop inline result');
   const metrics=await page.evaluate(()=>{
     const form=document.querySelector('#taskForm'),target=form.getBoundingClientRect();
     const fields=['.workDate','.workContent','.workType','.workStatus','.workPerformer','#techInlineResult'];
     return {form:{left:target.left,right:target.right,width:target.width,display:getComputedStyle(form).display,columns:getComputedStyle(form).gridTemplateColumns,flow:getComputedStyle(form).gridAutoFlow},fields:fields.map(sel=>{
       const el=form.querySelector(sel),r=el.getBoundingClientRect(),css=getComputedStyle(el);
       return {sel,x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,visible:css.display!=='none',display:css.display,position:css.position,gridColumn:css.gridColumn,gridRow:css.gridRow};
     })};
   });
   console.log('DESKTOP FORM GEOMETRY',JSON.stringify(metrics));
   for(const field of metrics.fields){
    assert.equal(field.visible,true,field.sel+' must be visible');
    assert.ok(field.w>80&&field.h>25,field.sel+' must have a real size');
    assert.ok(field.x>=metrics.form.left-6,field.sel+' should not overflow left');
    assert.ok(field.right<=metrics.form.right+6,field.sel+' should not overflow right');
   }
   // No form field should be placed on top of another field.
   for(let i=0;i<metrics.fields.length;i++)for(let j=i+1;j<metrics.fields.length;j++){
    const a=metrics.fields[i],b=metrics.fields[j];
    const overlapX=Math.min(a.right,b.right)-Math.max(a.x,b.x);
    const overlapY=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
    assert.ok(overlapX<8||overlapY<8,'form fields overlap: '+a.sel+' / '+b.sel);
   }
  }
  const result=mobile?'#task130Result':'#demoTaskResult';
  await page.locator(result).fill('Kiểm tra xong, máy bơm hoạt động tốt');
  if(width===768){
   const linked=await page.evaluate(()=>{
    const panel=document.querySelector('#demoWorkLinks .demoWorkLinkGrid');
    const cols=getComputedStyle(panel).gridTemplateColumns.trim().split(' ').filter(Boolean);
    const panelRect=panel.getBoundingClientRect();
    const selectors=[...panel.querySelectorAll('select')];
    return {cols:cols.length,panelRight:panelRect.right,
      selectBounds:selectors.map(el=>({right:el.getBoundingClientRect().right,width:el.getBoundingClientRect().width}))};
   });
   assert.equal(linked.cols,2,'tablet linked-work fields must render two columns');
   assert.ok(linked.selectBounds.every(x=>x.width>80&&x.right<=linked.panelRight+7),
     'tablet linked-work selectors must be readable and inside their panel');
  }
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
 for(const width of [320,390,768,1024,1440])await review(width);
 fs.writeFileSync(out+'/results.json',JSON.stringify(results,null,2));
 console.log('PASS technician UX smoke: 2 viewports; '+JSON.stringify(results.map(x=>({width:x.width,after:x.after,errorCount:x.errorCount}))));
})().catch(e=>{console.error(e);process.exitCode=1});
