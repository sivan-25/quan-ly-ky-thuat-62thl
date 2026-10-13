/* ESTA 68 PDL — combined imported + self-created maintenance. Preview only. */
(function(){
'use strict';
const BID='68PĐL',YEAR=2026,ROOT='hy68';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const can=()=>typeof currentBuilding!=='undefined'&&String(currentBuilding?.id||'')===BID;
const mayEdit=()=>typeof canProjectEdit==='function'&&canProjectEdit();
const tip=s=>typeof toast==='function'?toast(s):alert(s);
const pad=n=>String(n).padStart(2,'0');
const vi=d=>d?String(d).slice(0,10).split('-').reverse().join('/'):'Chưa chọn ngày';
const mon=e=>Number(String(e.planned_month||'').slice(5,7));
const isMine=i=>String(i.plan_code||'').startsWith('USR26-');
const eClass=e=>e.status==='completed'?'done':e.status==='skipped'?'skip':e.needs_review?'review':'pending';
const label=e=>e.status==='completed'?'Hoàn thành':e.status==='skipped'?'Không thực hiện':e.needs_review?'Cần đối chiếu':'Chưa xác nhận';
const oldMount=window.mountMaintenance68;
let items=[],occ=[],month=10,tab='jobs',activeEvent='',isReady=false,isLoading=false,isSaving=false,newPhotos=[],lastBuilding='',notice='';
function ensure(){
 if($(ROOT))return;
 const page=$('maintenancePage');if(!page)return;
 const shell=document.createElement('section');shell.id=ROOT;shell.hidden=true;shell.setAttribute('aria-label','Bảo trì thiết bị 68 PĐL');
 shell.innerHTML=
 '<div class="hy68-sandbox-notice"><strong>BẢN THỬ NGHIỆM 68 PĐL</strong><span>Thử giao diện mới; bấm Lưu sẽ ghi dữ liệu thật vào dự án 68 PĐL.</span></div>'+
 '<div class="hy68-head"><div class="hy68-heading"><span class="hy68-eyebrow">ESTA · BẢO TRÌ THIẾT BỊ · 68 PĐL</span><h2>Bảo trì thiết bị</h2><p>Một danh mục bảo trì thống nhất, có sẵn kế hoạch năm và có thể tự bổ sung khi cần.</p></div><div class="hy68-actions"><button type="button" id="hy68Refresh">↻ Làm mới</button><button type="button" id="hy68Pdf">⇩ Xuất PDF</button><button type="button" id="hy68Add" class="hy68-primary">＋ Thêm bảo trì</button></div></div>'+
 '<div class="hy68-summary" id="hy68Summary"></div>'+
 '<div id="hy68WorkArea"><div class="hy68-calendar-head"><div><strong>Lịch bảo trì năm 2026</strong><small>Chọn tháng để xem và cập nhật công việc</small></div><button id="hy68AllYear" data-hy-tab="year" type="button">Xem cả năm</button></div>'+
 '<div class="hy68-months" id="hy68Months" aria-label="Chọn tháng"></div>'+
 '<div class="hy68-context" id="hy68Context"></div><div id="hy68List" class="hy68-list"></div><div class="hy68-unscheduled" id="hy68Unscheduled"></div></div>';
 const hero=page.querySelector('.maintenanceHero');hero?hero.insertAdjacentElement('afterend',shell):page.insertBefore(shell,page.firstChild);
 const overlay=document.createElement('div');overlay.id='hy68Dialog';overlay.hidden=true;
 overlay.innerHTML=
 '<form id="hy68Form" class="hy68-modal"><div class="hy68-modal-header"><div><small id="hy68ModalTag">BẢO TRÌ 68 PĐL</small><h3 id="hy68ModalTitle">Thêm bảo trì</h3></div><button id="hy68Close" type="button" aria-label="Đóng">×</button></div>'+
 '<p id="hy68ModalSubtitle" class="hy68-muted"></p>'+
 '<div id="hy68CreateFields"><label>Tên thiết bị / công việc bảo trì <input id="hy68Title" maxlength="300" required placeholder="Ví dụ: Vệ sinh lưới lọc AHU tầng 5"></label><div class="hy68-modal-grid"><label>Hệ thống <select id="hy68SystemNew" required><option value="">Chọn hệ thống</option></select></label><label>Vị trí / thiết bị (nếu có) <input id="hy68Location" maxlength="180" placeholder="Ví dụ: Tầng 5"></label></div><div class="hy68-modal-grid"><label>Ngày đầu tiên (năm 2026) <input id="hy68FirstDate" type="date" min="2026-01-01" max="2026-12-31"></label><label>Chu kỳ <select id="hy68Repeat"><option value="0">Một lần</option><option value="1">Mỗi tháng</option><option value="2">2 tháng/lần</option><option value="3">3 tháng/lần</option><option value="6">6 tháng/lần</option><option value="12">12 tháng/lần</option></select></label></div><label>Ghi chú kỹ thuật <textarea id="hy68Description" rows="2" maxlength="2000" placeholder="Nội dung cần thực hiện..."></textarea></label><p class="hy68-form-note">Không nhập ngày: lưu hạng mục vào nhóm “Chưa đặt lịch”. Lịch tự động chỉ tạo trong năm 2026.</p></div>'+
 '<div id="hy68EditFields" hidden><div class="hy68-modal-grid"><label>Ngày dự kiến <input id="hy68Date" type="date"></label><label>Trạng thái <select id="hy68Result"><option value="planned">Chưa xác nhận</option><option value="completed">Hoàn thành</option><option value="skipped">Không thực hiện</option></select></label></div><label>Người thực hiện <input id="hy68Performer" maxlength="120"></label><label>Kết quả thực hiện / lý do <textarea id="hy68WorkDone" rows="3" maxlength="2000" placeholder="Nhập KQ thực hiện..."></textarea></label><p id="hy68Warning" class="hy68-warning" hidden></p><div class="hy68-photos"><label>📷 Chụp ảnh <input id="hy68Camera" type="file" accept="image/*" capture="environment"></label><label>▣ Chọn ảnh <input id="hy68Gallery" type="file" accept="image/*" multiple></label></div><div id="hy68ImageList" class="hy68-preview"></div><small id="hy68PhotoNotice"></small></div>'+
 '<div class="hy68-form-footer"><button id="hy68Cancel" type="button">Hủy</button><button id="hy68Submit" type="submit" class="hy68-primary">Lưu bảo trì</button></div></form>';
 document.body.appendChild(overlay);
 $('hy68Refresh').onclick=()=>load(true);
 $('hy68Pdf').onclick=exportPdf;
 $('hy68Add').onclick=create;
 shell.addEventListener('click',evt=>{
  const t=evt.target.closest('[data-hy-tab]'),m=evt.target.closest('[data-hy-month]'),e=evt.target.closest('[data-hy-event]'),u=evt.target.closest('[data-hy-unscheduled]');
  if(t){tab='year';render();}
  if(m){month=Number(m.dataset.hyMonth);tab='jobs';render();}
  if(e)edit(e.dataset.hyEvent);
  if(u)scheduleUnplanned(u.dataset.hyUnscheduled);
 });
 $('hy68Close').onclick=$('hy68Cancel').onclick=()=>{if(!isSaving)overlay.hidden=true;};
 overlay.addEventListener('click',e=>{if(e.target===overlay&&!isSaving)overlay.hidden=true;});
 $('hy68Form').noValidate=true; // Hidden mode has required inputs; apply explicit mode-specific validation.
 $('hy68Form').onsubmit=save;
 for(const id of ['hy68Camera','hy68Gallery'])$(id).addEventListener('change',evt=>{
  const fs=[...evt.target.files].filter(f=>f.type.startsWith('image/'));newPhotos.push(...fs);
  $('hy68PhotoNotice').textContent=newPhotos.length+' ảnh mới được chọn (tối đa 10 ảnh/lần lưu).';evt.target.value='';
 });
 $('hy68ImageList').addEventListener('click',evt=>{const img=evt.target.closest('img');if(img)img.classList.toggle('expanded');});
}
function mount(){
 ensure();
 const page=$('maintenancePage');if(!page)return;
 const on=can();
 page.classList.toggle('hy68-on',on);
 if($(ROOT))$(ROOT).hidden=!on;
 if(!on){$('hy68Dialog').hidden=true;return;}
 if(lastBuilding!==BID){lastBuilding=BID;tab='jobs';month=new Date().getMonth()+1;}
 applyLegacy();
 if(!isReady)load();else render();
}
function applyLegacy(){
 if(!can())return;
 const page=$('maintenancePage');
 page.classList.remove('hy68-devices-on');
 for(const selector of ['.maintenanceBoard','.maintenanceHistoryCard','.maintenanceSchedule']){
  const el=page.querySelector(selector);if(el)el.hidden=true;
 }
 const add=$('addMaintenanceAsset');if(add)add.hidden=true;
 const old=$('maint68');if(old)old.hidden=true;
}
async function load(force=false){
 if(!can()||isLoading||!centralSession?.access_token)return;
 if(isReady&&!force){render();return;}
 isLoading=true;$('hy68List').innerHTML='<p class="hy68-empty">Đang tải dữ liệu bảo trì…</p>';
 try{
  const token=centralSession.access_token;
  const [a,b]=await Promise.all([
   sbFetch('/rest/v1/esta_maintenance_plan_items?select=*&building_id=eq.'+encodeURIComponent(BID)+'&plan_year=eq.'+YEAR+'&order=created_at.asc',{token}),
   sbFetch('/rest/v1/esta_maintenance_plan_occurrences?select=*&building_id=eq.'+encodeURIComponent(BID)+'&planned_month=gte.2026-01-01&planned_month=lte.2026-12-01&order=planned_month.asc,planned_date.asc.nullslast',{token})
  ]);
  if(!can())return;
  items=Array.isArray(a)?a:[];occ=Array.isArray(b)?b:[];isReady=true;render();
 }catch(e){$('hy68List').textContent='Không tải được kế hoạch: '+(e.message||e);}
 finally{isLoading=false;}
}
function filterItems(){
 const map=new Map(items.map(i=>[i.id,i]));
 return {map,filtered:occ.filter(e=>map.has(e.item_id))};
}
function recordedDate(iso){
 if(!iso)return '';
 const d=new Date(iso);
 return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
}
function statusInfo(e){
 if(e.status==='completed')return {kind:'done',icon:'✓',label:'ĐÃ HOÀN THÀNH',resultTitle:'KẾT QUẢ THỰC HIỆN'};
 if(e.status==='skipped')return {kind:'skip',icon:'—',label:'KHÔNG THỰC HIỆN',resultTitle:'LÝ DO KHÔNG THỰC HIỆN'};
 if(e.needs_review)return {kind:'review',icon:'!',label:'CẦN ĐỐI CHIẾU LỊCH',resultTitle:'KẾT QUẢ THỰC HIỆN'};
 return {kind:'pending',icon:'◷',label:'CHƯA GHI NHẬN HOÀN THÀNH',resultTitle:'KẾT QUẢ THỰC HIỆN'};
}
function render(){
 if(!can()||!isReady)return;
 applyLegacy();
 const view=tab==='year'?occ:occ.filter(e=>mon(e)===month);
 const completed=view.filter(e=>e.status==='completed').length;
 const pending=view.filter(e=>e.status==='planned').length;
 const reviews=view.filter(e=>e.status==='planned'&&e.needs_review).length;
 const stopped=view.filter(e=>e.status==='skipped').length;
 const period=tab==='year'?'năm 2026':'tháng '+pad(month)+'/2026';
 $('hy68Summary').innerHTML=[
  [items.length,'Hạng mục bảo trì','docket'],
  [view.length,'Công việc trong '+period,'calendar'],
  [completed,'Đã hoàn thành','green'],
  [pending,'Chưa ghi nhận hoàn thành','blue'],
  [reviews,'Cần đối chiếu lịch','amber']
 ].map(x=>'<article class="hy68-stat '+x[2]+'"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></article>').join('');
 $('hy68WorkArea').hidden=false;
 $('hy68Pdf').textContent='⇩ Xuất PDF';
 $('hy68AllYear').classList.toggle('active',tab==='year');
 $('hy68AllYear').setAttribute('aria-pressed',String(tab==='year'));
 $('hy68Months').innerHTML=Array.from({length:12},(_,j)=>{
  const m=j+1,monthList=occ.filter(e=>mon(e)===m),count=monthList.length,done=monthList.filter(e=>e.status==='completed').length;
  return '<button type="button" data-hy-month="'+m+'" class="'+(tab!=='year'&&month===m?'active':'')+'" aria-pressed="'+(tab!=='year'&&month===m)+'"><small>Th'+pad(m)+'</small><strong>'+count+'</strong><span class="hy68-month-progress">'+(count?done+' đã xong':'Chưa có lịch')+'</span></button>';
 }).join('');
 const {map}=filterItems();
 const groups=new Map();
 view.forEach(e=>{
  const item=map.get(e.item_id);
  if(!item)return;
  if(!groups.has(item.system_group))groups.set(item.system_group,[]);
  groups.get(item.system_group).push([item,e]);
 });
 const names=[...groups.keys()].sort((a,b)=>a.localeCompare(b,'vi'));
 const percentage=view.length?Math.round(completed/view.length*100):0;
 $('hy68Context').innerHTML=
  '<div class="hy68-overview-title"><strong>'+esc(tab==='year'?'Tổng hợp bảo trì năm 2026':'Công việc bảo trì tháng '+pad(month)+'/2026')+'</strong>'+
  '<span>'+view.length+' công việc · '+completed+' hoàn thành · '+(pending+stopped)+' chưa xác nhận hoàn thành</span></div>'+
  '<div class="hy68-progress" aria-label="Tiến độ hoàn thành '+percentage+' phần trăm"><div style="width:'+percentage+'%"></div></div>'+
  '<div class="hy68-legend"><span><i class="hy68-dot done"></i>Đã hoàn thành</span><span><i class="hy68-dot pending"></i>Chưa ghi nhận hoàn thành</span><span><i class="hy68-dot review"></i>Cần đối chiếu</span></div>'+
  '<p class="hy68-status-explain">“Chưa ghi nhận hoàn thành” là chưa có xác nhận trên web, không khẳng định kỹ thuật chưa thực hiện thực tế.</p>';
 let html='';
 for(const systemName of names){
  const rows=groups.get(systemName).sort((a,b)=>{
   const ka=String(a[1].planned_date||a[1].planned_month),kb=String(b[1].planned_date||b[1].planned_month);
   return ka.localeCompare(kb);
  });
  const done=rows.filter(([,e])=>e.status==='completed').length;
  html+='<section class="hy68-group"><div class="hy68-group-head"><h3>'+esc(systemName)+'</h3><span class="hy68-group-count">'+done+'/'+rows.length+' hoàn thành</span></div><div class="hy68-group-list">';
  for(const [i,e] of rows){
   const st=statusInfo(e),fix=!!e.planned_date,planText=fix?vi(e.planned_date):'Th'+pad(mon(e))+'/2026';
   const actual=recordedDate(e.completed_at);
   const result=String(e.result_note||'').trim();
   const note=String(i.source_notes||'').trim();
   const loc=String(e.location||i.subsystem||'Chưa ghi khu vực');
   const performer=String(e.completed_by||i.assigned_to||'Kỹ thuật');
   const compactStatus=e.status==='completed'?'Hoàn thành':e.status==='skipped'?'Không thực hiện':e.needs_review?'Cần đối chiếu':'Chưa xác nhận';
   const resultBody=result?esc(result):e.status==='completed'?'Chưa có nội dung kết quả.':e.status==='skipped'?'Chưa ghi lý do.':'Chưa cập nhật kết quả.';
   const notes=note&&note!=='0'?'<details class="hy68-brief-note"><summary>Nội dung kế hoạch</summary><p>'+esc(note)+'</p></details>':'';
   const subtitle=esc(loc)+' · '+esc(performer);
   const completedAt=e.status==='completed'&&actual?'Hoàn thành: '+esc(actual):'';
   const review=e.needs_review&&e.status==='planned'?'⚠ '+esc(e.review_note||'Đối chiếu kế hoạch gốc'):'';
   const extra=completedAt||review;
   html+='<article class="hy68-task hy68-status-'+st.kind+'">'+
    '<div class="hy68-date-panel"><strong>'+esc(planText)+'</strong><small>'+(fix?'Ngày kế hoạch':'Chưa chốt ngày')+'</small></div>'+
    '<div class="hy68-task-main"><div class="hy68-task-headline"><div class="hy68-job"><h4>'+esc(i.work_title)+'</h4><span class="hy68-subline">'+subtitle+'</span></div>'+
    '<strong class="hy68-big-status '+st.kind+'"><span>'+st.icon+'</span>'+compactStatus+'</strong></div>'+
    '<div class="hy68-result-panel '+st.kind+'"><b>'+(e.status==='skipped'?'Lý do:':'KQ:')+'</b><p>'+resultBody+'</p></div>'+
    (extra?'<p class="hy68-inline-note">'+extra+'</p>':'')+
    notes+
    '<div class="hy68-task-bottom"><button type="button" data-hy-event="'+esc(e.id)+'" '+(mayEdit()?'':'disabled')+'>'+(mayEdit()?'Cập nhật':'Chỉ xem')+'</button></div>'+
    '</div></article>';
  }
  html+='</div></section>';
 }
 $('hy68List').innerHTML=html||'<div class="hy68-empty">Chưa có công việc trong khoảng thời gian đã chọn. Hãy chuyển tháng hoặc chọn “Thêm bảo trì”.</div>';
 const unscheduled=items.filter(i=>!occ.some(e=>e.item_id===i.id));
 $('hy68Unscheduled').innerHTML=unscheduled.length?'<details><summary>Hạng mục chưa xếp lịch <b>'+unscheduled.length+'</b></summary><div>'+unscheduled.map(i=>'<div class="hy68-unplanned"><div><b>'+esc(i.work_title)+'</b><small>'+esc(i.system_group)+'</small></div><button type="button" data-hy-unscheduled="'+esc(i.id)+'" '+(mayEdit()?'':'disabled')+'>＋ Xếp lịch</button></div>').join('')+'</div></details>':'';
}

function create(){
 if(!can()||!mayEdit())return tip('Tài khoản chỉ có quyền xem.');
 activeEvent='';newPhotos=[];$('hy68Form').reset();
 $('hy68ModalTag').textContent='THÊM BẢO TRÌ';
 $('hy68ModalTitle').textContent='Thêm bảo trì thiết bị / công việc';
 $('hy68ModalSubtitle').textContent='Thêm thiết bị hoặc công việc mới ngay tại đây. Hệ thống sẽ đưa vào danh mục và lịch bảo trì chung.';
 $('hy68CreateFields').hidden=false;$('hy68EditFields').hidden=true;
 $('hy68Submit').textContent='Lưu bảo trì';
 $('hy68Dialog').hidden=false;
 $('hy68SystemNew').innerHTML='<option value="">Chọn hệ thống</option>'+[...new Set(items.map(i=>i.system_group))].sort((a,b)=>a.localeCompare(b,'vi')).map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join('')+'<option value="KHÁC">Khác</option>';
 $('hy68FirstDate').value=new Date().getFullYear()===YEAR?new Date().toLocaleDateString('en-CA'):'';
 $('hy68Title').focus();
}
function edit(id){
 if(!can()||!mayEdit())return;
 const e=occ.find(v=>v.id===id),i=items.find(v=>v.id===e?.item_id);if(!e||!i)return;
 activeEvent=id;newPhotos=[];$('hy68PhotoNotice').textContent='';
 $('hy68CreateFields').hidden=true;$('hy68EditFields').hidden=false;
 $('hy68ModalTag').textContent='CẬP NHẬT BẢO TRÌ';
 $('hy68ModalTitle').textContent=i.work_title;
 $('hy68ModalSubtitle').textContent=[i.system_group,e.location||i.subsystem,'Lịch '+pad(mon(e))+'/2026'].filter(Boolean).join(' · ');
 $('hy68Date').value=e.planned_date||'';
 $('hy68Date').min=e.planned_month;
 const [y,m]=e.planned_month.split('-').map(Number);
 $('hy68Date').max=y+'-'+pad(m)+'-'+pad(new Date(y,m,0).getDate());
 $('hy68Result').value=e.status;
 $('hy68Performer').value=e.completed_by||i.assigned_to||'Kỹ thuật';
 $('hy68WorkDone').value=e.result_note||'';
 $('hy68Warning').hidden=!e.needs_review;$('hy68Warning').textContent=e.review_note||'';
 $('hy68ImageList').innerHTML=(Array.isArray(e.image_paths)?e.image_paths:[]).map(img=>typeof mediaImgHtml==='function'?mediaImgHtml(img,'hy68-thumb'):'').join('');
 $('hy68Submit').textContent='Lưu kết quả';
 $('hy68Dialog').hidden=false;
 if(typeof hydrateMediaImages==='function')hydrateMediaImages($('hy68ImageList'));
}
function recurrence(start,gap){
 if(!start)return [];
 const d=new Date(start+'T12:00:00Z'),baseDay=d.getUTCDate(),baseMonth=d.getUTCMonth(),out=[];
 const interval=Number(gap)||0;
 for(let n=0;n<12;n++){
  if(interval===0&&n>0)break;
  if(interval>0&&n%interval!==0)continue;
  const mo=baseMonth+n;if(mo>11)break;
  const last=new Date(Date.UTC(YEAR,mo+1,0)).getUTCDate();
  const date=YEAR+'-'+pad(mo+1)+'-'+pad(Math.min(last,baseDay));
  out.push({month:mo+1,date});
 }
 return out;
}
async function save(ev){
 ev.preventDefault();
 if(!can()||!mayEdit()||isSaving)return;
 isSaving=true;$('hy68Submit').disabled=true;
 try{
  if(activeEvent)await saveEntry();
  else await saveNew();
 }catch(error){tip('Không lưu được: '+(error.message||error));}
 finally{isSaving=false;$('hy68Submit').disabled=false;}
}
async function saveNew(){
 const title=$('hy68Title').value.trim(),group=$('hy68SystemNew').value,place=$('hy68Location').value.trim(),date=$('hy68FirstDate').value,notes=$('hy68Description').value.trim(),repeat=$('hy68Repeat').value;
 if(!title||!group)throw Error('Nhập tên công việc và chọn hệ thống.');
 if(date&&(!date.startsWith('2026-')||date<'2026-01-01'||date>'2026-12-31'))throw Error('Ngày phải trong năm 2026.');
 if(!date&&repeat!=='0')throw Error('Chọn ngày đầu tiên để tạo chu kỳ.');
 const planned=recurrence(date,repeat),code='USR26-'+(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2));
 const item={building_id:BID,plan_year:YEAR,plan_code:code,system_group:group,subsystem:place,work_title:title,assigned_to:'Kỹ thuật',original_assignee:'Kỹ thuật',source_notes:notes,plan_months:[],cadence:repeat==='0'?'Một lần':repeat+' tháng/lần',plan_status:'Chưa xác định lịch'};
 const token=centralSession.access_token;
 await sbFetch('/rest/v1/esta_maintenance_plan_items',{method:'POST',token,body:item});
 const found=await sbFetch('/rest/v1/esta_maintenance_plan_items?select=id&building_id=eq.'+encodeURIComponent(BID)+'&plan_code=eq.'+encodeURIComponent(code),{token});
 if(!Array.isArray(found)||!found[0]?.id)throw Error('Đã tạo hạng mục nhưng chưa đọc lại được; bấm Làm mới để kiểm tra.');
 if(planned.length){
  const rows=planned.map((v,j)=>({building_id:BID,item_id:found[0].id,event_key:code+':2026-'+pad(v.month)+'-'+pad(j),planned_month:YEAR+'-'+pad(v.month)+'-01',planned_date:v.date,location:place,source_kind:'year',status:'planned'}));
  await sbFetch('/rest/v1/esta_maintenance_plan_occurrences',{method:'POST',token,body:rows});
  await sbFetch('/rest/v1/esta_maintenance_plan_items?building_id=eq.'+encodeURIComponent(BID)+'&id=eq.'+encodeURIComponent(found[0].id),{method:'PATCH',token,body:{plan_months:planned.map(v=>v.month),plan_status:'Có lịch'}});
  month=planned[0].month;
 }
 tab='jobs';$('hy68Dialog').hidden=true;
 tip('Đã thêm hạng mục bảo trì vào 68 PĐL');
 await load(true);
}
async function saveEntry(){
 const e=occ.find(x=>x.id===activeEvent);if(!e)throw Error('Không tìm thấy lịch.');
 const date=$('hy68Date').value,state=$('hy68Result').value,who=$('hy68Performer').value.trim(),result=$('hy68WorkDone').value.trim();
 if(date&&date.slice(0,7)!==String(e.planned_month).slice(0,7))throw Error('Ngày phải nằm trong tháng kế hoạch.');
 if(state==='completed'&&(!who||!result))throw Error('Để hoàn thành cần nhập người thực hiện và KQ.');
 if(state==='skipped'&&!result)throw Error('Nhập lý do không thực hiện.');
 if(newPhotos.length>10)throw Error('Tối đa 10 ảnh mới cho mỗi lần lưu.');
 let photos=Array.isArray(e.image_paths)?[...e.image_paths]:[];
 if(newPhotos.length){
  if(typeof uploadMediaFiles!=='function')throw Error('Chức năng lưu ảnh chưa sẵn sàng.');
  photos=photos.concat(await uploadMediaFiles(newPhotos,'maintenance-68',e.id,null,BID));
 }
 const patch={planned_date:date||null,status:state,completed_by:state==='completed'?who:'',completed_at:state==='completed'?new Date().toISOString():null,result_note:result,image_paths:photos,updated_at:new Date().toISOString()};
 await sbFetch('/rest/v1/esta_maintenance_plan_occurrences?building_id=eq.'+encodeURIComponent(BID)+'&id=eq.'+encodeURIComponent(e.id),{method:'PATCH',token:centralSession.access_token,body:patch});
 $('hy68Dialog').hidden=true;tip('Đã lưu kết quả bảo trì');await load(true);
}
async function scheduleUnplanned(id){
 if(!can()||!mayEdit())return;
 const i=items.find(x=>x.id===id);if(!i)return;
 const response=prompt('Nhập ngày cần bảo trì (YYYY-MM-DD) trong năm 2026:',YEAR+'-'+pad(month)+'-01');
 if(response===null)return;
 const date=response.trim();
 if(!/^2026-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)return tip('Nhập ngày hợp lệ thuộc năm 2026.');
 const m=Number(date.slice(5,7)),key=i.plan_code+':2026-'+pad(m);
 if(occ.some(e=>e.item_id===id&&mon(e)===m))return tip('Hạng mục đã có lịch tháng này.');
 try{
  await sbFetch('/rest/v1/esta_maintenance_plan_occurrences',{method:'POST',token:centralSession.access_token,body:{item_id:id,building_id:BID,event_key:key,planned_month:YEAR+'-'+pad(m)+'-01',planned_date:date,location:i.subsystem||'',source_kind:'year',status:'planned'}});
  await sbFetch('/rest/v1/esta_maintenance_plan_items?id=eq.'+encodeURIComponent(id)+'&building_id=eq.'+encodeURIComponent(BID),{method:'PATCH',token:centralSession.access_token,body:{plan_status:'Có lịch',plan_months:[...new Set([...(i.plan_months||[]),m])].sort((a,b)=>a-b)}});
  month=m;await load(true);tip('Đã xếp lịch '+vi(date));
 }catch(e){tip('Chưa thêm được lịch: '+e.message);}
}
async function exportPdf(){
 if(!can()||!isReady)return;
 if(typeof window.exportGenericEstaPdf!=='function')return tip('PDF ESTA chưa sẵn sàng.');
 const {map,filtered}=filterItems(),list=tab==='year'?filtered:filtered.filter(e=>mon(e)===month);
 if(!list.length)return tip('Không có công việc để xuất PDF.');
 const rows=list.map((e,k)=>{const i=map.get(e.item_id);return [k+1,i?.system_group||'',i?.work_title||'',e.planned_date?vi(e.planned_date):'Tháng '+pad(mon(e)),label(e),e.completed_by||i?.assigned_to||'Kỹ thuật',[e.location,e.result_note||e.review_note].filter(Boolean).join(' · ')];});
 await window.exportGenericEstaPdf({building:'68 PĐL',title:'BÁO CÁO BẢO TRÌ THIẾT BỊ',sectionLabel:'KẾ HOẠCH BẢO TRÌ 68 PĐL',tableLabel:'LỊCH & KẾT QUẢ BẢO TRÌ',periodLabel:tab==='year'?'NĂM 2026':'THÁNG '+pad(month)+'/2026',subtitle:'Danh mục bảo trì thiết bị năm 2026',filename:'ESTA_BaoTri_68PDL_2026_'+(tab==='year'?'Nam':'Thang'+pad(month))+'.pdf',columns:[{label:'STT',weight:.5},{label:'Hệ thống',weight:1.4},{label:'Nội dung',weight:2.4},{label:'Ngày',weight:1.1},{label:'Trạng thái',weight:1.2},{label:'Thực hiện',weight:1.1},{label:'KQ/Ghi chú',weight:2.3}],rows,summaries:[{value:items.length,label:'HẠNG MỤC'},{value:list.length,label:'LƯỢT KẾ HOẠCH'},{value:list.filter(x=>x.status==='completed').length,label:'HOÀN THÀNH'},{value:list.filter(x=>x.needs_review&&x.status==='planned').length,label:'CẦN ĐỐI CHIẾU'}]});
}
window.mountMaintenance68=function(){if(typeof oldMount==='function')oldMount();mount();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensure();mount();});else{ensure();mount();}
})();