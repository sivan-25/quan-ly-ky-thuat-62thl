const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
const root = path.resolve(__dirname, '..');
const next = () => new Promise(resolve => setImmediate(resolve));
async function main() {
  const dom = new JSDOM('<div id="app" class="homeMode"><header class="estaTopbar"><div id="topHomeTitle"><div><h1>Tổng quan</h1><p>Dự án</p></div></div><div class="headerTools"><div class="headerSearch"><input id="globalSearch"></div></div></header><main id="homePage"><div class="homeKpis"></div></main><section id="workPage" class="hide"></section></div>', {runScripts:'outside-only', url:'https://fixture.test', pretendToBeVisual:true});
  const w = dom.window, q = selector => w.document.querySelector(selector);
  const projects = ['62THL','68PĐL','127HH','130HH','UPDATE','DEMO'].map(id=>({id,name:id}));
  const rows = projects.map(building=>({building,snapshot:{tasks:[],energy:[]},ops:{}}));
  const task = (id, extra={}) => ({id,d:'2026-10-05',c:'Công việc '+id,s:'Đang thực hiện',a:'Kỹ thuật dự án',priority:'Trung bình',dueDate:'2026-10-07',...extra});
  rows[0].snapshot.tasks = Array.from({length:22},(_,i)=>task(i+1,{dispatchedByAdmin:true,dispatchedAt:'2026-10-05T08:00:00Z'}));
  rows[0].snapshot.tasks.push(task(99,{c:'Việc kỹ thuật tự tạo'}));
  rows[1].snapshot.tasks = [task(1,{dispatchGroupId:'DG-LEGACY',s:'Hoàn thành',c:'<img src=x onerror=alert(1)>',dueDate:'2026-10-01'})];
  rows[2].snapshot.tasks = [task(77,{dispatchedByAdmin:true,dispatchedAt:'2026-10-05T09:00:00Z',dueDate:'2026-10-04'})];
  rows[4].snapshot.tasks = [task(500,{dispatchedByAdmin:true})];
  rows[5].snapshot.tasks = [task(600,{dispatchedByAdmin:true})];
  let fail=false, failDispatch=false, requests=0, opened=null, edited=null, timer, personal=[],pdfCalls=[];
  Object.assign(w, {
    currentAccount:{is_admin:true,buildings:projects},currentBuilding:{id:''},projectOverviewActive:false,projectOpenSeq:0,
    centralSession:{access_token:'ISOLATED-TEST'},today:()=> '2026-10-05',
    isAdminOverview:()=>w.currentAccount.is_admin&&!w.projectOverviewActive,
    setInterval:fn=>{timer=fn;return 1},setTimeout:()=>0,
    showModule:()=>{},applyBuildingUI:()=>{},render:()=>{},renderHomeDashboard:()=>{},openAdminPortal:()=>{},openAdminOverview:()=>{},toast:()=>{},
    estaOverviewUI:{energyHtml:()=>''},
    sbFetch:async(url,{method='GET',body=null}={})=>{
      requests++;if(fail)throw Error('Simulated offline');
      if(url.startsWith('/rest/v1/admin_personal_tasks')){
        if(method==='GET')return personal;
        if(method==='POST'){personal.push({...body,created_at:new Date(Date.now()+60000).toISOString()});return null}
        const id=decodeURIComponent(url.split('id=eq.')[1]||'');
        if(method==='PATCH'){Object.assign(personal.find(x=>x.id===id),body);return null}
        if(method==='DELETE'){personal=personal.filter(x=>x.id!==id);return null}
      }
      return {rows,activity:[],generated_at:new Date().toISOString()};
    },
    enterProject:async(building)=>{opened=building.id;w.currentBuilding=building;w.projectOverviewActive=true;w.projectOpenSeq++;q('#workPage').classList.remove('hide');return true},
    load:()=>rows.find(r=>r.building.id===w.currentBuilding.id)?.snapshot.tasks||[],editTask:id=>{edited=id},
    syncTaskRecord:async(action,item,buildingId)=>{if(failDispatch)throw Error("Simulated dispatch failure");rows.find(r=>r.building.id===buildingId).snapshot.tasks.push(item);return {item}}
  });
  w.exportGenericEstaPdf=async config=>{pdfCalls.push(config);return true};
  w.console.warn=()=>{};
  w.eval(fs.readFileSync(path.join(root,'command-center.js'),'utf8'));
  await w.estaCommandCenterRefresh();
  const visible=()=>[...w.document.querySelectorAll('#ccTaskBody tr[data-cc-task]')];
  const select=(id,value)=>{q(id).value=value;q(id).dispatchEvent(new w.Event('change',{bubbles:true}))};
  assert.equal(q('#ccAdminHeaderActions').classList.contains('hide'),false);
  assert.match(q('#ccTopContext').textContent,/Trung tâm điều hành/);
  assert.equal(q('#ccTopDataState').textContent,'Dữ liệu mới nhất');
  assert.equal(q('#ccHeaderSearch').getAttribute('placeholder'),'Tìm công việc...');
  assert.equal(q('#ccHeaderRefresh').disabled,false);
  assert.ok(q('#ccHeaderDispatch')&&q('#ccHeaderPdf'));
  q('#ccHeaderSearch').value='Công việc 22';
  q('#ccHeaderSearch').dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(q('#ccSearch').value,'Công việc 22');
  assert.equal(visible().length,1,'Header search filters Admin tasks');
  q('#ccSearch').value='';
  q('#ccSearch').dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(q('#ccHeaderSearch').value,'','List search synchronizes the topbar input');
  const refreshCalls=requests;
  q('#ccHeaderRefresh').click();await next();await next();
  assert.ok(requests>refreshCalls,'Top refresh uses the existing data reload');
  q('#ccHeaderDispatch').click();
  assert.equal(q('#ccDispatchModal').classList.contains('hide'),false,'Top assign opens original dialog');
  q('#ccDispatchModal [data-cc-close]').click();
  assert.equal(q('#ccAdminTaskCount').textContent,'24');
  assert.equal(q('#ccAllTaskCount').textContent,'25');
  assert.equal(visible().length,20);
  assert.equal(visible()[0].dataset.building,'127HH');
  // Supervisor star changes appearance/persistence, never the on-screen work order.
  rows[0].snapshot.tasks[0].supervisorStarred=true;
  await w.estaCommandCenterRefresh();
  assert.equal(visible()[0].dataset.building,'127HH','Marked project work must not jump ahead on screen');
  assert.equal(visible()[0].dataset.taskId,'77','Original displayed work remains first');
  // Select-all reaches every filtered Admin task, including later pages.
  assert.equal(q('#ccPrintSelected').disabled,true);

  // Mobile Admin PDF: button enters pick mode; tapping a task picks instead of editing.
  let mobilePdfViewport=true;
  w.matchMedia=()=>({matches:mobilePdfViewport});
  await w.estaCommandCenterRefresh();
  assert.equal(q('#ccPrintSelected').disabled,false,'Mobile Xuất PDF starts selection, even with zero checks');
  assert.equal(q('#ccPrintSelected').textContent,'Xuất PDF','Short mobile action label');
  assert.equal(q('#ccBeginPdf').classList.contains('hide'),false,'Mobile start visible when not choosing');
  q('#ccBeginPdf').click();
  assert.equal(q('#estaCommandCenter').classList.contains('ccPdfSelecting'),true);
  assert.equal(q('#ccPrintSelected').disabled,true,'Cannot generate an empty selection');
  assert.equal(q('#ccCancelPdf').classList.contains('hide'),false);
  assert.equal(q('#ccBeginPdf').classList.contains('hide'),true,'Entering PDF hides the compact start button');
  const originalTask=visible()[0].dataset.taskId;
  visible()[0].click();
  assert.equal(visible()[0].querySelector('[data-cc-pdf-select]').checked,true,'Tap full card selects a task');
  assert.equal(q('#ccPdfSelectionStatus').textContent.includes('Đã chọn 1 công việc'),true);
  assert.equal(q('#ccHeaderPdfCount').textContent,'1');
  assert.equal(visible()[0].dataset.taskId,originalTask);
  assert.equal(edited,null,'Selecting a card does not open the edit dialog');
  visible()[0].click();
  assert.equal(visible()[0].querySelector('[data-cc-pdf-select]').checked,false,'Second tap unselects');
  visible()[0].querySelector('.ccPdfTapTarget').click();
  assert.equal(visible()[0].querySelector('[data-cc-pdf-select]').checked,true,'Tap selection label activates native checkbox');
  visible()[1].querySelector('[data-cc-pdf-select]').click();
  assert.equal(q('#ccHeaderPdfCount').textContent,'2','Second native checkbox is independently selectable');
  q('#ccCancelPdf').click();
  assert.equal(q('#estaCommandCenter').classList.contains('ccPdfSelecting'),false,'Cancel immediately dismisses PDF mode');
  assert.equal(q('#ccBeginPdf').classList.contains('hide'),false,'Cancel restores the compact start action');
  assert.equal(q('#ccCancelPdf').classList.contains('hide'),true,'Floating Cancel must disappear without scrolling');
  assert.equal(q('#ccPrintSelected').textContent,'Xuất PDF');
  assert.equal(q('#ccPrintSelected').disabled,false,'Cancel restores start button');
  assert.equal(q('#ccHeaderPdfCount').classList.contains('hide'),true);
  assert.equal(visible()[0].querySelector('[data-cc-pdf-select]').checked,false);
  assert.equal(pdfCalls.length,0,'Cancel never exports');
  q('#ccHeaderPdf').click();
  assert.equal(q('#estaCommandCenter').classList.contains('ccPdfSelecting'),true,'Header PDF also starts pick mode');
  q('#ccCancelPdf').click();
  mobilePdfViewport=false;
  await w.estaCommandCenterRefresh();
  assert.equal(q('#ccPrintSelected').disabled,true,'Desktop still requires checked tasks before export');
  assert.match(q('#ccPrintSelected').textContent,/Xuất PDF \(0\)/);
  rows[0].snapshot.tasks[0].imgs=['storage:b-TEST/tasks/test/image.jpg'];
  rows[0].snapshot.tasks[0].result='Hoàn tất kiểm tra';
  await w.estaCommandCenterRefresh();
  q('#ccPdfSelectAll').click();
  assert.match(q('#ccPrintSelected').textContent,/24/);
  q('#ccTaskPager [data-page="2"]').click();
  assert.equal(visible().length,4);
  assert.equal(visible()[0].querySelector('[data-cc-pdf-select]').checked,true);
  const orderBeforePdf=visible().map(row=>row.dataset.building+'::'+row.dataset.taskId);
  assert.equal(q('#ccHeaderPdfCount').textContent,'24');
  q('#ccHeaderPdf').click();await next();await next();
  assert.equal(pdfCalls.length,1);
  assert.equal(pdfCalls[0].rows.length,24);
  assert.equal(pdfCalls[0].rows[0][2],'Công việc 1','Starred work is first ONLY inside exported PDF');
  assert.deepEqual(visible().map(row=>row.dataset.building+'::'+row.dataset.taskId),orderBeforePdf,'PDF priority has not reordered visible dashboard cards');
  assert.equal(pdfCalls[0].photos.length,1);
  assert.ok(pdfCalls[0].rows.some(row=>String(row[6]).includes('KQ: Hoàn tất kiểm tra')));
  assert.ok(pdfCalls[0].rows.every(row=>!String(row[2]).includes('Việc kỹ thuật tự tạo')));
  assert.equal(q('#ccPrintSelected').disabled,true,'Successful PDF clears selection');
  assert.equal(q('#ccHeaderPdfCount').classList.contains('hide'),true,'Top PDF count resets after export');
  assert.ok(!q('#ccTaskBody').textContent.includes('Việc kỹ thuật tự tạo'));
  assert.ok(![...q('#ccProjectFilter').options].some(o=>['UPDATE','DEMO'].includes(o.value)));
  assert.equal(visible().length,4,'PDF export keeps the current task page');
  select('#ccStatusFilter','Đã hoàn thành');assert.equal(visible().length,1);
  assert.ok(visible()[0].querySelector('.ccStatus.done'));assert.equal(q('#ccTaskBody img'),null);
  select('#ccStatusFilter','overdue');assert.equal(visible().length,1);assert.equal(visible()[0].dataset.taskId,'77');
  select('#ccStatusFilter','');select('#ccProjectFilter','68PĐL');assert.equal(visible().length,1);
  visible()[0].dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await next();
  assert.equal(opened,'68PĐL');assert.equal(edited,1);
  w.projectOverviewActive=false;w.currentBuilding={id:''};
  select('#ccProjectFilter','');q('[data-cc-scope="all"]').click();
  q('#ccSearch').value='tự tạo';q('#ccSearch').dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(visible().length,1);
  q('[data-cc-scope="admin"]').click();assert.equal(visible().length,0);
  q('#ccSearch').value='';q('#ccSearch').dispatchEvent(new w.Event('input',{bubbles:true}));
  rows[2].snapshot.tasks[0].s='Đã hoàn thành';await w.estaCommandCenterRefresh();
  select('#ccStatusFilter','overdue');assert.equal(visible().length,0);
  fail=true;await w.estaCommandCenterRefresh();assert.match(q('#ccLoadMessage').textContent,/Chưa làm mới/);assert.equal(q('#ccAdminTaskCount').textContent,'24');fail=false;
  q('#ccDispatch').click();q('[name="ccTarget"][value="130HH"]').checked=true;
  q('#ccDispatchTitle').value='Việc mới từ Admin';q('#ccDispatchStart').value='2026-10-05';q('#ccDispatchDue').value='2026-10-05';
  q('#ccDispatchNote').value='Cần xác nhận sơn toàn bộ màu khác';
  q('#ccDispatchForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await next();await next();
  assert.equal(q('#ccDispatchModal').classList.contains('hide'),false);
  assert.equal(q('#ccStatusFilter').value,'');assert.equal(q('#ccAdminTaskCount').textContent,'25');
  assert.equal(visible()[0].dataset.building,'130HH');
  const dispatched=rows[3].snapshot.tasks[0];assert.equal(dispatched.dispatchedByAdmin,true);assert.equal(dispatched.dueDateExplicit,true);assert.ok(dispatched.dispatchGroupId);
  assert.equal(dispatched.n,'Cần xác nhận sơn toàn bộ màu khác','Saved work retains original note');
  assert.equal(q('#ccDispatchNote').value,'','Input note clears after successful dispatch');
  assert.equal(q('#ccDispatchSave').textContent,'✓ Đã giao');
  assert.ok(q('#ccDispatchSave').classList.contains('ccDispatchSaved'));
  q('#ccDispatchTitle').value='Việc giao tiếp theo';
  q('#ccDispatchTitle').dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(q('#ccDispatchSave').textContent,'Giao công việc');
  q('#ccDispatchNote').value='Ghi chú cần giữ khi lưu lỗi';
  failDispatch=true;
  q('#ccDispatchForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await next();await next();
  assert.equal(q('#ccDispatchNote').value,'Ghi chú cần giữ khi lưu lỗi','Failed dispatch preserves draft');
  assert.equal(q('#ccDispatchSave').textContent,'Giao công việc','Failed dispatch cannot show success');
  failDispatch=false;
  q('#ccDispatchModal [data-cc-close]').click();assert.equal(q('#ccDispatchModal').classList.contains('hide'),true);

  // A personal work entry is stored separately, yet visible in the same Admin list.
  q('#ccDispatch').click();
  q('#ccDispatchAssignee').value='Kỹ thuật tuỳ chọn';
  q('#ccDispatchPersonal').click();
  assert.equal(q('#ccDispatchPersonal').checked,true);
  assert.equal(q('#ccDispatchAssignee').value,'Văn');
  assert.equal(q('#ccDispatchAssignee').readOnly,true);
  assert.equal([...w.document.querySelectorAll('[name="ccTarget"]:checked')].length,0);
  assert.equal(q('#ccDispatchPersonalStatusWrap').classList.contains('hide'),false);
  q('#ccDispatchTitle').value='Kiểm tra và báo cáo công việc của Văn';
  q('#ccDispatchStart').value='2026-10-05';
  q('#ccDispatchDue').value='2026-10-05';
  q('#ccDispatchPersonalStatus').value='Hoàn thành';
  q('#ccDispatchNote').value='Ghi chú công việc cá nhân';
  q('#ccDispatchForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await next();await next();
  assert.equal(personal.length,1);
  assert.equal(personal[0].assignee,'Văn');
  assert.equal(personal[0].status,'Hoàn thành');
  assert.equal(personal[0].notes,'Ghi chú công việc cá nhân');
  assert.equal(q('#ccDispatchNote').value,'');
  assert.equal(q('#ccDispatchSave').textContent,'✓ Đã lưu');
  assert.equal(rows.reduce((n,r)=>n+(r.snapshot.tasks||[]).length,0),28,'Personal work must not touch a project snapshot');
  assert.equal(q('#ccAdminTaskCount').textContent,'26');
  assert.equal(q('#ccAllTaskCount').textContent,'27');
  assert.equal(visible()[0].dataset.building,'PERSONAL');
  visible()[0].querySelector('[data-cc-pdf-select]').click();
  assert.match(q('#ccPrintSelected').textContent,/1/);
  q('#ccPrintSelected').click();await next();await next();
  assert.equal(pdfCalls.length,2);
  assert.equal(pdfCalls[1].rows.length,1);
  assert.equal(pdfCalls[1].rows[0][1],'Cá nhân · Văn');
  assert.equal(pdfCalls[1].title,'BÁO CÁO CÔNG VIỆC');
  assert.equal(pdfCalls[1].sectionLabel,'THEO DÕI CÔNG VIỆC GIÁM SÁT KỸ THUẬT');
  assert.equal(pdfCalls[1].hideBuilding,true);
  assert.equal(pdfCalls[1].building,'');
  assert.equal(pdfCalls[1].signaturePosition,'supervision');
  assert.equal(pdfCalls[1].signer.name,'Sĩ Văn');
  assert.equal(pdfCalls[1].signer.image_data_url,'');
  visible()[0].click();
  assert.equal(q('#ccDispatchHeading').textContent,'Chỉnh sửa công việc thực hiện');
  assert.equal(q('#ccDispatchTitle').value,personal[0].title);
  assert.equal(q('#ccDispatchPersonalStatus').value,'Hoàn thành');
  q('#ccDispatchTitle').value='Báo cáo công việc đã cập nhật';
  q('#ccDispatchForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  await next();await next();
  assert.equal(personal[0].title,'Báo cáo công việc đã cập nhật');
  w.confirm=()=>true;
  q('#ccDispatchDeletePersonal').click();await next();await next();
  assert.equal(personal.length,0);
  assert.equal(q('#ccAdminTaskCount').textContent,'25');

  w.currentAccount={is_admin:true,buildings:[projects[3]]};await w.estaCommandCenterRefresh();assert.equal(q('#ccAdminTaskCount').textContent,'1');
  w.currentAccount={is_admin:false,buildings:[projects[3]]};w.renderHomeDashboard();assert.equal(q('#estaCommandCenter').classList.contains('hide'),true);
  assert.equal(q('#ccAdminHeaderActions').classList.contains('hide'),true,'Only Admin overview shows global actions');
  const before=requests;timer();await next();assert.equal(requests,before,'No global fetch for technical accounts');
  dom.window.close();
  console.log('PASS Admin assignments: scope, legacy metadata, filters, pagination, escaping, keyboard navigation, refresh, failure, dispatch and account isolation');
}
main().catch(error=>{console.error(error);process.exitCode=1});
