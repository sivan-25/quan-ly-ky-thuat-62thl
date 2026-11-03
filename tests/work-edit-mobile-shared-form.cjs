'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const samples=[];
const projects=['62THL','68PĐL','127HH','130HH'];
const widths=[320,390,430,1024];
(async()=>{
 const browser=await chromium.launch({headless:true});
 fs.mkdirSync('visual-artifacts/shared-work-editor',{recursive:true});
 try{
  for(const width of widths){
   for(const buildingId of projects){
    const ctx=await browser.newContext({viewport:{width,height:844},isMobile:width<=760,hasTouch:width<=760,locale:'vi-VN'});
    const page=await ctx.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e.message||e)));
    await page.route('**/*',route=>{
     const u=new URL(route.request().url());
     if(['localhost','127.0.0.1'].includes(u.hostname))return route.continue();
     return route.abort();
    });
    await page.goto('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});
    await page.evaluate(id=>{
     const names={'62THL':'62 Trần Huy Liệu','68PĐL':'68 Phan Đăng Lưu','127HH':'127 Hồng Hà','130HH':'130 Hồng Hà'};
     const buildings=Object.entries(names).map(([id,name])=>({id,name,role:'editor'}));
     const task={id:1001,d:'2026-11-03',c:'Kiểm tra và bảo trì hệ thống điều hòa',t:'Bảo trì',s:'Đang thực hiện',n:'Kiểm tra máy và ghi nhận',a:'Kỹ thuật 1',performers:['Kỹ thuật 1'],imgs:[]};
     window.localStorage.setItem(id==='62THL'?'qlkt62_v1':'qlkt_tasks_'+id,JSON.stringify([task]));
     window.eval('centralSession={access_token:"TEST-ONLY"};');
     window.eval('currentAccount='+JSON.stringify({id:'test-only',is_admin:true,buildings})+';');
     window.eval('currentBuilding='+JSON.stringify(buildings.find(b=>b.id===id))+';projectOverviewActive=true;projectOpenSeq++;');
     document.querySelector('#login').classList.add('hide');
     document.querySelector('#app').classList.remove('hide');
     window.eval('applyBuildingUI();showModule("work");');
     window.eval('editTask(1001)');
    },buildingId);
    await page.waitForTimeout(180);
    const info=await page.evaluate(()=>{
     const $=s=>document.querySelector(s),box=s=>{const r=$(s).getBoundingClientRect();return {h:r.height,x:r.x,y:r.y,right:r.right}};
     const inPlace=$('.workEntryCard').classList.contains('workEditInPlace');
     const editing=$('#editId').value;
     const btn1=box('#cancelEdit'),btn2=box('#saveBtn');
     const title=$('#workEntryTitle').textContent;
     const cardParent=$('.workEntryCard').parentElement.id;
     const drawerHidden=$('#workEditDrawer').classList.contains('hide');
     const rects={date:box('.workDateDisplayed'),note:box('#note'),content:box('#content'),camera:box('#openNativeCamera'),library:box('#openNativeLibrary')};
     return {inPlace,editing,btn1,btn2,title,cardParent,drawerHidden,rects,dateValue:$('#date').value,contentValue:$('#content').value,
       overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    assert.equal(info.editing,'1001',buildingId+' editing should not reset original task id');
    assert.equal(info.dateValue,'2026-11-03',buildingId+' preserves stored date');
    assert.equal(info.contentValue,'Kiểm tra và bảo trì hệ thống điều hòa',buildingId+' preserves content');
    assert.ok(info.btn2.x>info.btn1.x,buildingId+' save is right of cancel');
    assert.ok(info.overflow<4,buildingId+' viewport does not overflow');
    if(width<=760){
     assert.equal(info.inPlace,true,'mobile reuse same entry card');
     assert.equal(info.drawerHidden,true,'no duplicate editor drawer on mobile');
     assert.equal(info.cardParent,'workPage','same CSS scope for add and edit');
     assert.equal(info.title,'Chỉnh sửa công việc');
     for(const k of ['date','note','camera','library'])assert.ok(Math.abs(info.rects[k].h-44)<1.1,buildingId+' '+k+' should be 44px at '+width+'; got '+info.rects[k].h);
     // Open the real linked-work details and measure the three paired rows.
     const linkInfo=await page.evaluate(()=>{
       const panel=document.getElementById('demoWorkLinks');
       if(!panel)throw Error('Linked-work details not mounted');
       panel.classList.remove('hide');panel.open=true;
       const pairs=[['demoTaskPriority','demoTaskDue'],['demoTaskAsset','demoTaskIncident'],['demoTaskInspection','demoTaskContractor']];
       return pairs.map(pair=>pair.map(id=>{
         const control=document.getElementById(id),label=control?.closest('label');
         if(!control||!label)throw Error('Missing linked-work control '+id);
         const r=control.getBoundingClientRect(),p=label.getBoundingClientRect();
         return {id,h:r.height,x:r.x,y:r.y,right:r.right,labelY:p.y,labelH:p.height,display:getComputedStyle(label).display};
       }));
     });
     for(const pair of linkInfo){
       const [left,right]=pair;
       for(const item of pair){
         assert.equal(item.display!=='none',true,buildingId+' linked field '+item.id+' must show at '+width);
         assert.ok(Math.abs(item.h-44)<1.1,buildingId+' linked '+item.id+' must measure 44px, got '+item.h);
       }
       assert.ok(Math.abs(left.y-right.y)<2,buildingId+' paired controls have different row heights');
       assert.ok(right.x>left.right-1,buildingId+' paired fields are not left/right');
       assert.ok(Math.abs((right.right-right.x)-(left.right-left.x))<2,buildingId+' paired fields must be equal width');
     }
     const exportInfo=await page.evaluate(()=>{
       const group=document.querySelector('#workPage .workTableMeta .workExportActions');
       const pdf=document.getElementById('workSelectModeBtn');
       const cert=document.getElementById('cc130Launch');
       if(!group||!pdf||!cert)throw Error('PDF and certificate actions not grouped');
       const a=pdf.getBoundingClientRect(),b=cert.getBoundingClientRect(),g=group.getBoundingClientRect(),h=group.parentElement.getBoundingClientRect();
       return {pdfRight:a.right,certX:b.x,pdfY:a.y,certY:b.y,groupRight:g.right,hostRight:h.right};
     });
     assert.ok(exportInfo.certX>=exportInfo.pdfRight-1,'PDF and certificate order should be adjacent');
     assert.ok(Math.abs(exportInfo.pdfY-exportInfo.certY)<1,'PDF and certificate should share a row');
     assert.ok(Math.abs(exportInfo.groupRight-exportInfo.hostRight)<18,'PDF group should align to right edge');
     assert.ok(info.btn2.x-info.btn1.right<16,'Cancel should be adjacent to Save at '+width);
     const cancelStyle=await page.locator('#cancelEdit').evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
     assert.notEqual(cancelStyle.background,'rgb(255, 255, 255)','Cancel must have a distinct warning background');
     const long='Kiểm tra chi tiết hệ thống điều hòa toàn bộ các tầng, kiểm tra FCU AHU cùng phụ kiện và thông số vận hành '.repeat(4);
     await page.locator('#content').fill(long);
     await page.waitForTimeout(60);
     const next=await page.locator('#content').evaluate(el=>el.getBoundingClientRect().height);
     assert.ok(next>44,'long edit content must auto expand: '+buildingId+' '+width);
    } else {
     assert.equal(info.inPlace,false,'desktop remains drawer');
     assert.equal(info.drawerHidden,false,'desktop editing opens drawer');
    }
    const before=await page.evaluate(id=>localStorage.getItem(id==='62THL'?'qlkt62_v1':'qlkt_tasks_'+id),buildingId);
    await page.evaluate(()=>resetForm());
    const after=await page.evaluate(id=>localStorage.getItem(id==='62THL'?'qlkt62_v1':'qlkt_tasks_'+id),buildingId);
    assert.equal(after,before,'Cancel must not modify task records');
    assert.equal(await page.locator('#editId').inputValue(),'','cancel clears edit ID');
    assert.equal(await page.locator('#workEntryTitle').textContent(),'Thêm công việc');
    assert.equal(errors.length,0,'No new page JS errors: '+errors.join('; '));
    samples.push({width,buildingId,mode:width<=760?'in-place':'drawer'});
    if(width<=760)await page.screenshot({path:path.join('visual-artifacts/shared-work-editor',buildingId+'-'+width+'.png')});
    console.log('PASS '+buildingId+' '+width+' '+(width<=760?'same mobile add/edit form':'desktop drawer'));
    await ctx.close();
   }
  }
 }finally{await browser.close()}
 console.log('Verified '+samples.length+' four-project edit-form cases without saving test records');
})().catch(e=>{console.error(e);process.exitCode=1});
