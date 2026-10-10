'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const dir='technician-ux-artifacts';
fs.mkdirSync(dir,{recursive:true});
const report={scope:'Mock technician role; no production credentials; all external HTTP blocked',screens:[],observations:[]};
function obs(scenario,item,value){report.observations.push({scenario,item,value});}
async function pageFor(browser,width){
 const context=await browser.newContext({viewport:{width,height:width<760?844:900},deviceScaleFactor:1,permissions:[]});
 const page=await context.newPage();
 await page.route('**/*',route=>{
   let url;try{url=new URL(route.request().url());}catch(e){return route.abort();}
   if(url.hostname==='127.0.0.1'||url.hostname==='localhost')return route.continue();
   return route.abort();
 });
 await page.goto('http://127.0.0.1:8766/',{waitUntil:'load'});
 await page.waitForTimeout(350);
 return {context,page};
}
async function screen(page,label){
 const file=dir+'/'+label+'.png';
 await page.screenshot({path:file,animations:'disabled'});
 report.screens.push(file);
}
(async()=>{
const browser=await chromium.launch({headless:true});
try{
 for(const width of [390,1440]){
  const {page,context}=await pageFor(browser,width);
  await screen(page,'01-login-'+width);
  await page.evaluate(()=>{
    window.enterAccount({username:'new-technician',is_admin:false,buildings:[{id:'130HH',name:'130 Hồng Hà',role:'editor'}]},null);
  });
  await page.waitForTimeout(300);
  let snap=await page.evaluate(()=>({
    role:document.querySelector('#headerRole')?.textContent,
    project:document.querySelector('#app')?.dataset.buildingId,
    adminHidden:document.querySelector('#navAdmin')?.classList.contains('hide'),
    projectSwitcherHidden:document.querySelector('#technicalProjectSwitcher')?.classList.contains('hide'),
    homeHidden:document.querySelector('#homePage')?.classList.contains('hide')
  }));
  obs(width,'landingAfterLogin',snap);
  assert(snap.adminHidden,'non-Admin must not see Admin nav');
  assert(snap.homeHidden===false,'technician should start on project home');
  assert(String(snap.role).includes('Kỹ thuật'),'technician role displayed');
  await screen(page,'02-tech-home-'+width);

  // Use the same navigation callback as the Công việc button; mobile's footer
  // may relocate navigation controls into another container.
  await page.evaluate(()=>document.querySelector('#navWork').click());
  await page.waitForTimeout(240);
  const form=await page.evaluate(()=>{
    const button=document.querySelector('#saveBtn'),r=button.getBoundingClientRect();
    return {project:document.querySelector('#app')?.dataset.buildingId,
      hasPeople:!!document.querySelector('#taskPeopleOptions [data-person]'),
      peopleMessage:document.querySelector('#taskPeopleOptions')?.innerText?.trim(),
      saveButtonTop:Math.round(r.top),viewportHeight:innerHeight,
      saveRequiresScroll:r.top>innerHeight-55,
      contentVisible:!!document.querySelector('#content')
    };
  });
  obs(width,'firstNewTask',form);
  await screen(page,'03-tech-new-task-no-people-'+width);

  await page.locator('#content').fill('Kiểm tra đèn hành lang buổi sáng');
  await page.locator('#saveBtn').click();
  await page.waitForTimeout(120);
  const rejection=await page.locator('#toast').textContent();
  obs(width,'saveNoPerformerFeedback',rejection?.trim());
  await screen(page,'04-tech-save-no-performer-'+width);

  // Add ONE fictional performer to the in-memory fixture; no database request.
  await page.evaluate(()=>window.eval('projectPeople=[{id:"fake-person",name:"Kỹ thuật A"}];renderAllPeopleSelectors()'));
  const picker=page.locator('#taskPeopleOptions [data-person]').first();
  if(!(await picker.isVisible()))await page.locator('#taskPeopleButton').click();
  await picker.click();
  await page.evaluate(()=>{const field=document.querySelector('#status');field.value='Đã hoàn thành';field.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForTimeout(140);
  const result=page.locator('#task130Result');
  obs(width,'completeResultFieldVisible',await result.isVisible());
  if(await result.isVisible())await result.fill('Đã kiểm tra đèn, hoạt động bình thường');
  await screen(page,'05-tech-completion-ready-'+width);
  await page.locator('#saveBtn').click();
  await page.waitForTimeout(160);
  const offline=await page.evaluate(()=>{
    const key=window.eval('taskStorageKeyFor("130HH")');
    const records=JSON.parse(localStorage.getItem(key)||'[]');
    return {toast:document.querySelector('#toast')?.textContent?.trim(),
      storedCount:records.length,status:records.at(-1)?.s,
      completedResult:records.at(-1)?.result,
      saveButtonText:document.querySelector('#saveBtn')?.innerText,
      quickSaveText:document.querySelector('#task130QuickSave')?.innerText};
  });
  obs(width,'saveWithoutBackendConnection',offline);
  await screen(page,'06-tech-save-with-no-server-'+width);
  await context.close();
 }

 // Separate sample technician account permitted two buildings.
 const {page,context}=await pageFor(browser,390);
 await page.evaluate(()=>window.enterAccount({username:'tech-multi',is_admin:false,buildings:[
  {id:'130HH',name:'130 Hồng Hà',role:'editor'},
  {id:'62THL',name:'62 Trần Huy Liệu',role:'editor'}
 ]},null));
 await page.waitForTimeout(250);
 const before=await page.evaluate(()=>({
  role:document.querySelector('#headerRole')?.textContent,
  switcherVisible:!document.querySelector('#technicalProjectSwitcher')?.classList.contains('hide'),
  value:document.querySelector('#technicalProjectSelect')?.value
 }));
 await page.locator('#technicalProjectSelect').selectOption('62THL');
 await page.waitForTimeout(250);
 const after=await page.evaluate(()=>({
  selectedProject:document.querySelector('#app')?.dataset.buildingId,
  switcherValue:document.querySelector('#technicalProjectSelect')?.value,
  adminHidden:document.querySelector('#navAdmin')?.classList.contains('hide')
 }));
 obs('390','technicalMultiProjectSwitch',{before,after});
 await screen(page,'07-tech-project-switch-390');
 await context.close();
}finally{
 await browser.close();
 fs.writeFileSync(dir+'/technical-user-report.json',JSON.stringify(report,null,2));
}
console.log('TECHNICIAN FIRST-USE REVIEW '+JSON.stringify(report.observations));
})().catch(e=>{console.error(e);process.exitCode=1;});
