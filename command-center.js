(()=>{
"use strict";
const ROOT_ID="estaCommandCenter";
let rows=[],activity=[],loading=false,lastUpdated="",dataAccount=null,taskPage=1,alertPage=1,activityPage=1;
let taskScope="admin";
const isAdminTask=t=>t?.dispatchedByAdmin===true||!!String(t?.dispatchGroupId||"").trim();
const isOverdue=t=>!isDone(t)&&!!t.dueDate&&String(t.dueDate)<todayC();
const TASK_PAGE_SIZE=20,ALERT_PAGE_SIZE=6,ACTIVITY_PAGE_SIZE=6;
const globalScope=()=>typeof isAdminOverview==="function"&&isAdminOverview();
const $c=s=>document.querySelector(s);
const escC=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const todayC=()=>typeof today==="function"?today():new Date().toLocaleDateString("en-CA");
const fmtC=d=>{if(!d)return "—";const x=String(d).slice(0,10);try{return new Date(x+"T00:00:00").toLocaleDateString("vi-VN")}catch(_){return x}};
const accountProjects=()=>{const list=Array.isArray(currentAccount?.buildings)?currentAccount.buildings:[];const real=list.filter(x=>x?.id&&x.id!=="DEMO");return real.length?real:list.filter(x=>x?.id)};
const activeProjects=()=>accountProjects().filter(x=>String(x?.id||"").trim().toUpperCase()!=="UPDATE");
const activeIds=()=>new Set(activeProjects().map(x=>String(x.id)));
const activeRows=()=>{const ids=activeIds();return rows.filter(r=>ids.has(String(r?.building?.id||"")))};
const isDone=t=>["Đã hoàn thành","Hoàn thành"].includes(String(t?.s||""));
const priorityRank=p=>p==="Khẩn cấp"?4:p==="Cao"?3:p==="Trung bình"?2:1;
function ensureScopeBar(home){
 let bar=$c("#overviewScopeBar");
 if(!bar){
  bar=document.createElement("div");bar.id="overviewScopeBar";bar.className="opsScopeBar hide";
  bar.innerHTML='<label for="overviewScopeSelect">Phạm vi Tổng quan</label><select id="overviewScopeSelect" aria-label="Chuyển Tổng quan"></select>';
  home.prepend(bar);
  bar.querySelector("select").addEventListener("change",e=>{
   const id=e.target.value;
   if(!id&&currentAccount?.is_admin){openAdminOverview();return}
   const building=(currentAccount?.buildings||[]).find(b=>String(b.id)===id);
   if(building)enterProject(building,{target:"home"}).catch(err=>{if(projectOverviewActive&&currentBuilding?.id===building.id)toast(err.message)});
  });
 }
 const admin=globalScope(),on=admin||(projectOverviewActive&&currentBuilding?.id!=="DEMO");
 bar.classList.toggle("hide",!on);
 const select=bar.querySelector("select"),list=accountProjects().filter(b=>b.id!=="DEMO");
 const options=(currentAccount?.is_admin?'<option value="">Tất cả dự án · Admin</option>':'')+list.map(b=>'<option value="'+escC(b.id)+'">'+escC(b.name||b.id)+'</option>').join("");
 if(select.innerHTML!==options)select.innerHTML=options;
 select.value=admin?"":String(currentBuilding?.id||"");
 return bar;
}
function ensureRoot(){
 if(dataAccount&&dataAccount!==currentAccount){rows=[];activity=[];lastUpdated="";dataAccount=null;taskPage=alertPage=activityPage=1;taskScope="admin"}
 const home=$c("#homePage");if(!home)return null;
 ensureScopeBar(home);
 let root=$c("#"+ROOT_ID);
 if(!root){
  root=document.createElement("section");root.id=ROOT_ID;root.className="ccRoot opsOverview hide";
  root.innerHTML='<div class="ccHero opsHero"><div class="ccHeroCopy opsHeroCopy"><div class="ccHeroTags opsHeroTags"><span>ESTA OPERATIONS</span><b>ĐA DỰ ÁN</b><i id="ccDataState">Đang tải dữ liệu</i></div><h2>Trung tâm điều hành</h2><p>Tổng hợp công việc, cảnh báo và năng lượng của các dự án.</p></div><div class="ccHeroActions opsHeroActions"><button id="ccRefresh" class="ccBtn ghost" type="button">Làm mới</button><button id="ccDispatch" class="ccBtn primary" type="button">＋ Giao công việc</button></div></div><div id="ccSummary" class="ccSummary opsKpiGrid"></div><div id="ccProjectCards" class="ccProjects"></div><div class="ccWorkspace"><section class="ccPanel opsPanel"><div class="ccPanelHead opsPanelHead"><div><span>THEO DÕI CÔNG VIỆC</span><h3 id="ccTaskTitle">Công việc Admin đã giao</h3><p id="ccTaskMeta" aria-live="polite">Đang tải dữ liệu...</p></div></div><div class="ccTaskScopes" role="group" aria-label="Nguồn công việc"><button type="button" data-cc-scope="admin" aria-pressed="true">Admin đã giao <b id="ccAdminTaskCount">0</b></button><button type="button" data-cc-scope="all" aria-pressed="false">Tất cả công việc <b id="ccAllTaskCount">0</b></button></div><div class="ccFilters"><select id="ccProjectFilter" aria-label="Lọc dự án"><option value="">Tất cả dự án</option></select><select id="ccStatusFilter" aria-label="Lọc trạng thái"><option value="">Tất cả trạng thái</option><option>Bắt đầu</option><option>Đang thực hiện</option><option>Chờ xử lý</option><option>Đã hoàn thành</option><option value="overdue">Quá hạn</option></select><select id="ccPriorityFilter" aria-label="Lọc mức độ"><option value="">Tất cả mức độ</option><option>Khẩn cấp</option><option>Cao</option><option>Trung bình</option><option>Thấp</option></select><input id="ccSearch" aria-label="Tìm công việc" type="search" autocomplete="off" placeholder="Tìm công việc, người thực hiện..."></div><div class="ccTableWrap"><table class="ccTable"><thead><tr><th scope="col">Dự án</th><th scope="col">Công việc</th><th>Trạng thái</th><th>Mức độ</th><th>Người thực hiện</th><th>Hạn</th><th>Cảnh báo</th></tr></thead><tbody id="ccTaskBody"></tbody></table></div><div id="ccTaskPager" class="opsPager"></div></section><aside class="ccPanel ccAlertsPanel opsPanel"><div class="ccPanelHead opsPanelHead"><div><span>CẢNH BÁO</span><h3>Cần xử lý</h3><p>Ưu tiên theo mức độ và hạn.</p></div><b id="ccAlertCount" class="ccAlertCount">0</b></div><div id="ccAlertList" class="ccAlertList"></div><div id="ccAlertPager" class="opsPager"></div></aside></div><div class="opsDashboardGrid"><section class="ccPanel opsPanel"><div class="ccPanelHead opsPanelHead"><div><span>NĂNG LƯỢNG</span><h3>Năng lượng tháng này</h3><p>Tiêu thụ theo dự án · EVN1 và EVN2 hiển thị riêng.</p></div></div><div id="ccEnergyList" class="opsEnergyList"></div></section><section class="ccPanel ccActivityPanel opsPanel"><div class="ccPanelHead opsPanelHead"><div><span>NHẬT KÝ VẬN HÀNH</span><h3>Hoạt động gần đây</h3><p>Lịch sử cập nhật theo dự án và tài khoản thực hiện.</p></div></div><div id="ccActivityList" class="ccActivityList"></div><div id="ccActivityPager" class="opsPager"></div></section></div><section class="opsQuickActions" aria-label="Thao tác nhanh"><button type="button" data-cc-dispatch>＋ Giao công việc</button><button type="button" data-cc-directory>Quản lý dự án →</button></section><p id="ccLoadMessage" class="opsLoadMessage" role="status" aria-live="polite"></p>';
  const anchor=home.querySelector(".homeKpis");if(anchor)anchor.insertAdjacentElement("afterend",root);else home.prepend(root);
  root.querySelector("#ccRefresh").addEventListener("click",()=>loadCenter(true));
  root.querySelector("#ccDispatch").addEventListener("click",openDispatch);
  ["#ccProjectFilter","#ccStatusFilter","#ccPriorityFilter"].forEach(id=>root.querySelector(id).addEventListener("change",()=>{taskPage=alertPage=activityPage=1;renderLists();renderActivity()}));
  root.querySelector("#ccSearch").addEventListener("input",()=>{taskPage=alertPage=activityPage=1;renderLists();renderActivity()});
  root.addEventListener("click",e=>{
   const scope=e.target.closest("[data-cc-scope]");if(scope){taskScope=scope.dataset.ccScope;taskPage=1;renderLists();return}
   const page=e.target.closest("[data-cc-page]");if(page){const n=Number(page.dataset.page);if(page.dataset.ccPage==="task")taskPage=n;if(page.dataset.ccPage==="alert")alertPage=n;if(page.dataset.ccPage==="activity")activityPage=n;renderLists();renderActivity();return}
   if(e.target.closest("[data-cc-dispatch]"))return openDispatch();
   if(e.target.closest("[data-cc-directory]"))return openAdminPortal();
   const energy=e.target.closest("[data-overview-energy]");if(energy)return openEnergy(energy.dataset.overviewEnergy);
   const p=e.target.closest("[data-cc-project]");if(p)return openProject(p.dataset.ccProject);const t=e.target.closest("[data-cc-task]");if(t)return openTask(t.dataset.building,t.dataset.taskId);const a=e.target.closest("[data-cc-alert]");if(a)return openAlert(a.dataset.building,a.dataset.module,a.dataset.refId,a.dataset.taskId)});
 }
 const admin=globalScope();root.classList.toggle("hide",!admin);
 $c("#app")?.classList.toggle("adminCommandHome",admin);
 $c("#app")?.classList.toggle("opsOverviewMode",admin||(projectOverviewActive&&!!currentBuilding?.id&&currentBuilding.id!=="DEMO"));
 // Do not leave a global dashboard or its hidden legacy state active inside a project.
 home.querySelector(".homeWelcome")?.classList.remove("ccAdminWelcomeHidden");
 home.querySelector(".homeKpis")?.classList.remove("ccLegacyKpisHidden");
 if(admin){
  const title=$c("#topHomeTitle h1");if(title)title.textContent="Tổng quan";
  const subtitle=$c("#topHomeTitle p");if(subtitle)subtitle.textContent="Toàn bộ dự án";
 }
 return root;
}
function taskRows(){const out=[];activeRows().forEach(r=>{const b=r.building||{};(Array.isArray(r.snapshot?.tasks)?r.snapshot.tasks:[]).forEach(t=>out.push({...t,_buildingId:b.id,_buildingName:b.name||b.id}))});return out}
function stockOf(row,m){
 let q=Number(m?.opening_qty||0);const start=String(m?.tracking_start_date||m?.created_at||todayC()).slice(0,10),end=todayC();
 (row?.ops?.inventory_material_transactions||[]).filter(x=>String(x.material_id)===String(m?.id)).forEach(x=>{const date=String(x.tx_date||"").slice(0,10);if(date&&date>=start&&date<=end)q+=(x.tx_type==="in"?1:-1)*Number(x.qty||0)});return q;
}
function alerts(){
 const out=[],td=todayC(),d7=new Date(td+"T00:00:00");d7.setDate(d7.getDate()+7);const soon=d7.toLocaleDateString("en-CA");
 activeRows().forEach(r=>{
  const b=r.building||{},bid=String(b.id||""),bn=b.name||bid;
  (r.snapshot?.tasks||[]).forEach(t=>{if(isDone(t))return;const due=String(t.dueDate||""),assignee=String(t.a||"").trim();if(due&&due<td)out.push({sev:3,bid,bn,module:"work",taskId:t.id,title:"Công việc quá hạn",detail:t.c||"Công việc kỹ thuật",tag:"Quá hạn",date:due});else if(due===td)out.push({sev:2,bid,bn,module:"work",taskId:t.id,title:"Đến hạn hôm nay",detail:t.c||"Công việc kỹ thuật",tag:t.priority||"Hôm nay",date:due});else if(due&&due<=soon)out.push({sev:1,bid,bn,module:"work",taskId:t.id,title:"Sắp đến hạn công việc",detail:t.c||"Công việc kỹ thuật",tag:fmtC(due),date:due});else if(priorityRank(t.priority)>=3)out.push({sev:t.priority==="Khẩn cấp"?3:2,bid,bn,module:"work",taskId:t.id,title:"Công việc ưu tiên "+String(t.priority||"").toLowerCase(),detail:t.c||"Công việc kỹ thuật",tag:t.priority||"Ưu tiên",date:due||t.d||""});if(!assignee)out.push({sev:2,bid,bn,module:"work",taskId:t.id,title:"Chưa có người thực hiện",detail:t.c||"Công việc kỹ thuật",tag:"Cần phân công",date:due||t.d||""})});
  (r.ops?.incidents||[]).forEach(x=>{if(x.status!=="Đã đóng"&&(x.severity==="Khẩn cấp"||x.severity==="Cao"))out.push({sev:x.severity==="Khẩn cấp"?3:2,bid,bn,module:"incident",refId:x.id,title:"Sự cố "+x.severity.toLowerCase(),detail:(x.incident_code||"Sự cố")+" · "+(x.area||x.symptom||""),tag:x.status||"Đang mở",date:String(x.detected_at||"").slice(0,10)})});
  (r.ops?.inspections||[]).forEach(x=>{if(x.result_status!=="Đạt")out.push({sev:(x.result_status==="Không đạt"||x.result_status==="Cần khắc phục")?2:1,bid,bn,module:"inspection",refId:x.id,title:"Checklist "+String(x.result_status||"cần chú ý").toLowerCase(),detail:(x.inspection_code||"")+" · "+(x.template_name||"Kiểm tra định kỳ"),tag:x.result_status||"Cần chú ý",date:x.inspection_date||""})});
  (r.ops?.maintenance_assets||[]).filter(x=>x.status!=="Ngừng sử dụng").forEach(x=>{const due=String(x.next_due_date||"");if(x.status==="Hỏng")out.push({sev:3,bid,bn,module:"maintenance",refId:x.id,title:"Thiết bị hỏng",detail:(x.code||"")+" · "+(x.name||"Thiết bị"),tag:"Hỏng",date:due});else if(due&&due<td)out.push({sev:3,bid,bn,module:"maintenance",refId:x.id,title:"Bảo trì quá hạn",detail:(x.code||"")+" · "+(x.name||"Thiết bị"),tag:fmtC(due),date:due});else if(due&&due<=soon)out.push({sev:1,bid,bn,module:"maintenance",refId:x.id,title:"Sắp đến hạn bảo trì",detail:(x.code||"")+" · "+(x.name||"Thiết bị"),tag:fmtC(due),date:due})});
  (r.ops?.inventory_materials||[]).forEach(m=>{const min=Number(m.min_qty||0);if(min<=0)return;const qty=stockOf(r,m);if(qty<=min)out.push({sev:qty<=0?3:2,bid,bn,module:"inventory",refId:m.id,title:qty<=0?"Vật tư đã hết":"Vật tư tồn thấp",detail:(m.name||"Vật tư")+" · còn "+qty.toLocaleString("vi-VN")+" "+(m.unit||""),tag:"Min "+min.toLocaleString("vi-VN")})});
  (r.ops?.contractor_jobs||[]).forEach(j=>{if(j.status==="Chờ xử lý"||j.status==="Tạm dừng")out.push({sev:1,bid,bn,module:"contractor",refId:j.id,title:"Nhà thầu "+j.status.toLowerCase(),detail:j.work_content||"Công việc nhà thầu",tag:j.status,date:j.work_date||""})});
 });
 return out.sort((a,b)=>b.sev-a.sev||String(a.date||"").localeCompare(String(b.date||"")));
}
function statusClass(s){return isDone({s})?"done":s==="Chờ xử lý"?"waiting":"doing"}
function warningHtml(t){const due=String(t.dueDate||""),td=todayC();if(!isDone(t)&&due&&due<td)return '<span class="ccWarn critical">Quá hạn</span>';if(!isDone(t)&&due===td)return '<span class="ccWarn high">Hôm nay</span>';if(!isDone(t)&&priorityRank(t.priority)>=3)return '<span class="ccWarn high">'+escC(t.priority)+'</span>';return '<span class="ccWarn ok">Bình thường</span>'}
function renderFilters(){const sel=$c("#ccProjectFilter");if(!sel)return;const old=sel.value;sel.innerHTML='<option value="">Tất cả dự án</option>'+activeProjects().map(b=>'<option value="'+escC(b.id)+'">'+escC(b.name||b.id)+'</option>').join("");if([...sel.options].some(o=>o.value===old))sel.value=old}
function renderSummary(a,t){
 const box=$c("#ccSummary");if(!box)return;
 const red=a.filter(x=>x.sev===3).length;
 const overdue=a.filter(x=>x.title.toLowerCase().includes("quá hạn")).length;
 const openInc=activeRows().reduce((n,r)=>n+(r.ops?.incidents||[]).filter(x=>x.status!=="Đã đóng").length,0);
 const today=todayC(),todayCount=t.filter(x=>String(x.d||"")===today).length;
 box.innerHTML=
  '<article class="opsKpi info"><span>DỰ ÁN</span><b>'+activeProjects().length+'</b><small>Đang theo dõi</small></article>'+
  '<article class="opsKpi info"><span>HÔM NAY</span><b>'+todayCount+'</b><small>Công việc trong ngày</small></article>'+
  '<article class="opsKpi"><span>VIỆC CHƯA XONG</span><b>'+t.filter(x=>!isDone(x)).length+'</b><small>Toàn hệ thống</small></article>'+
  '<article class="opsKpi warn"><span>CẢNH BÁO ĐỎ</span><b>'+red+'</b><small>Cần ưu tiên</small></article>'+
  '<article class="opsKpi danger"><span>QUÁ HẠN</span><b>'+overdue+'</b><small>Công việc / bảo trì</small></article>'+
  '<article class="opsKpi"><span>SỰ CỐ ĐANG MỞ</span><b>'+openInc+'</b><small>Chưa đóng hồ sơ</small></article>';
}
function renderProjects(a){const box=$c("#ccProjectCards");if(!box)return;box.innerHTML=activeRows().map(r=>{const b=r.building||{},tasks=r.snapshot?.tasks||[],open=tasks.filter(x=>!isDone(x)).length,aa=a.filter(x=>x.bid===String(b.id)),red=aa.filter(x=>x.sev===3).length;return '<button class="ccProjectCard" type="button" data-cc-project="'+escC(b.id)+'"><div><span>'+escC(b.id)+'</span><h3>'+escC(b.name||b.id)+'</h3><div class="ccProjectStats"><span><b>'+open+'</b> việc mở</span><span><b>'+aa.length+'</b> cảnh báo</span><span class="'+(red?"hot":"")+'"><b>'+red+'</b> khẩn</span></div></div><i>→</i></button>'}).join("")||'<div class="ccEmpty">Chưa có dự án đang hoạt động.</div>'}
function pager(id,kind,page,total,size){
 const count=Math.max(1,Math.ceil(total/size)),node=$c("#"+id);if(!node)return;
 node.innerHTML=total?'<span>'+((page-1)*size+1)+'–'+Math.min(page*size,total)+' / '+total+'</span><div><button type="button" data-cc-page="'+kind+'" data-page="'+(page-1)+'" '+(page<=1?'disabled':'')+' aria-label="Trang trước">‹</button><span>'+page+' / '+count+'</span><button type="button" data-cc-page="'+kind+'" data-page="'+(page+1)+'" '+(page>=count?'disabled':'')+' aria-label="Trang sau">›</button></div>':'';
}
function renderLists(){
 const project=$c("#ccProjectFilter")?.value||"",status=$c("#ccStatusFilter")?.value||"",priority=$c("#ccPriorityFilter")?.value||"",q=($c("#ccSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const allTasks=taskRows(),adminTasks=allTasks.filter(isAdminTask);
 $c("#ccAdminTaskCount").textContent=adminTasks.length;
 $c("#ccAllTaskCount").textContent=allTasks.length;
 $c("#ccTaskTitle").textContent=taskScope==="admin"?"Công việc Admin đã giao":"Công việc toàn hệ thống";
 document.querySelectorAll("[data-cc-scope]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.ccScope===taskScope)));
 let tasks=(taskScope==="admin"?adminTasks:allTasks).filter(t=>(!project||String(t._buildingId)===project)&&(!status||(status==="overdue"?isOverdue(t):status==="Đã hoàn thành"?isDone(t):String(t.s||"Đang thực hiện")===status))&&(!priority||String(t.priority||"Trung bình")===priority)&&(!q||[t.c,t.n,t.a,t._buildingName,t._buildingId,t.dispatchGroupId].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 tasks.sort((a,b)=>{if(taskScope==="admin")return String(b.dispatchedAt||b.d||"").localeCompare(String(a.dispatchedAt||a.d||""))||Number(b.id||0)-Number(a.id||0);const ac=isDone(a)?1:0,bc=isDone(b)?1:0;if(ac!==bc)return ac-bc;const ad=String(a.dueDate||"9999-12-31"),bd=String(b.dueDate||"9999-12-31");return ad.localeCompare(bd)||Number(b.id||0)-Number(a.id||0)});
 taskPage=Math.max(1,Math.min(taskPage,Math.ceil(tasks.length/TASK_PAGE_SIZE)));
 const body=$c("#ccTaskBody");if(body)body.innerHTML=tasks.length?tasks.slice((taskPage-1)*TASK_PAGE_SIZE,taskPage*TASK_PAGE_SIZE).map(t=>'<tr tabindex="0" aria-label="Mở công việc" data-cc-task data-building="'+escC(t._buildingId)+'" data-task-id="'+escC(t.id)+'"><td data-label="Dự án"><span class="ccProjectTag">'+escC(t._buildingId)+'</span><small>'+escC(t._buildingName)+'</small></td><td data-label="Công việc"><b>'+escC(t.c||"Công việc kỹ thuật")+'</b>'+(isAdminTask(t)?'<small>Admin giao'+(t.dispatchedAt?' · '+fmtC(t.dispatchedAt):'')+'</small>':(t.n?'<small>'+escC(t.n)+'</small>':""))+'</td><td data-label="Trạng thái"><span class="ccStatus '+statusClass(t.s)+'">'+escC(t.s||"Đang thực hiện")+'</span></td><td data-label="Mức độ"><span class="ccPriority p'+priorityRank(t.priority)+'">'+escC(t.priority||"Trung bình")+'</span></td><td data-label="Người thực hiện">'+escC(t.a||"—")+'</td><td data-label="Hạn">'+fmtC(t.dueDate||"")+'</td><td data-label="Cảnh báo">'+warningHtml(t)+'</td></tr>').join(""):'<tr><td colspan="7" class="ccEmptyCell">'+(taskScope==="admin"&&!adminTasks.length?"Chưa có công việc Admin đã giao. Nhấn ＋ Giao công việc để bắt đầu.":"Không có công việc phù hợp với bộ lọc.")+'</td></tr>';
 const meta=$c("#ccTaskMeta");if(meta)meta.textContent=tasks.length+" công việc · "+tasks.filter(t=>t.s==="Đang thực hiện").length+" đang làm · "+tasks.filter(isDone).length+" hoàn thành · "+tasks.filter(t=>t.s==="Chờ xử lý").length+" chờ xử lý · "+tasks.filter(isOverdue).length+" quá hạn";
 let list=alerts().filter(a=>(!project||a.bid===project)&&(!q||[a.title,a.detail,a.bn,a.bid].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 pager("ccTaskPager","task",taskPage,tasks.length,TASK_PAGE_SIZE);
 alertPage=Math.max(1,Math.min(alertPage,Math.ceil(list.length/ALERT_PAGE_SIZE)));
 const ab=$c("#ccAlertList");if(ab)ab.innerHTML=list.length?list.slice((alertPage-1)*ALERT_PAGE_SIZE,alertPage*ALERT_PAGE_SIZE).map(a=>'<button class="ccAlert sev'+a.sev+'" type="button" data-cc-alert data-building="'+escC(a.bid)+'" data-module="'+escC(a.module)+'" data-ref-id="'+escC(a.refId||"")+'" data-task-id="'+escC(a.taskId||"")+'"><i></i><div><span>'+escC(a.bid)+' · '+escC(a.title)+'</span><b>'+escC(a.detail)+'</b><small>'+escC(a.tag||"Cần xử lý")+'</small></div><strong>→</strong></button>').join(""):'<div class="ccEmpty">Không có cảnh báo theo bộ lọc hiện tại.</div>';
 const n=$c("#ccAlertCount");if(n)n.textContent=list.length;
 pager("ccAlertPager","alert",alertPage,list.length,ALERT_PAGE_SIZE);
}

function auditLabel(x){
 const action=String(x?.action||"").toLowerCase(),entity=String(x?.entity_type||"").toLowerCase();
 const entityName=({task:"công việc",energy:"năng lượng",incidents:"sự cố",inspections:"checklist",technical_documents:"tài liệu",report_registry:"báo cáo",maintenance_assets:"thiết bị",maintenance_records:"bảo trì",inventory_materials:"vật tư",inventory_material_transactions:"xuất/nhập vật tư",inventory_tools:"dụng cụ",contractors:"nhà thầu",contractor_jobs:"công việc nhà thầu",building_people:"người thực hiện",snapshot:"dữ liệu dự án"})[entity]||"dữ liệu";
 if(action==="insert")return "Thêm "+entityName;
 if(action==="update")return "Cập nhật "+entityName;
 if(action==="delete")return "Xóa "+entityName;
 if(action==="upsert_task")return "Cập nhật công việc";
 if(action==="delete_task")return "Xóa công việc";
 if(action==="append_task_images")return "Thêm hình công việc";
 if(action==="upsert_energy")return "Cập nhật năng lượng";
 if(action==="delete_energy")return "Xóa chỉ số năng lượng";
 if(action==="merge_snapshot")return "Đồng bộ dữ liệu dự án";
 return "Cập nhật "+entityName;
}
function renderActivity(){
 const box=$c("#ccActivityList");if(!box)return;
 const ids=activeIds();
 const project=$c("#ccProjectFilter")?.value||"",q=($c("#ccSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const all=(activity||[]).filter(x=>ids.has(String(x.building_id||""))&&(!project||String(x.building_id)===project)&&(!q||[x.actor,x.summary,x.building_id,auditLabel(x)].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 activityPage=Math.max(1,Math.min(activityPage,Math.ceil(all.length/ACTIVITY_PAGE_SIZE)));
 const list=all.slice((activityPage-1)*ACTIVITY_PAGE_SIZE,activityPage*ACTIVITY_PAGE_SIZE);
 pager("ccActivityPager","activity",activityPage,all.length,ACTIVITY_PAGE_SIZE);
 box.innerHTML=list.length?list.map(x=>{
   const when=x.saved_at?new Date(x.saved_at).toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";
   const label=auditLabel(x),summary=String(x.summary||"").trim();
   return '<button type="button" class="ccActivity" data-cc-project="'+escC(x.building_id)+'"><span class="ccActivityDot"></span><div><b>'+escC(x.building_id)+' · '+escC(label)+'</b><small>'+escC(x.actor||"Hệ thống")+' · '+escC(when)+(summary?' · '+escC(summary):'')+'</small></div><em>Chi tiết</em></button>';
 }).join(""):'<div class="ccEmpty">Chưa có lịch sử cập nhật.</div>';
}
function renderCenter(){const root=ensureRoot();if(!root||!globalScope())return;renderFilters();const a=alerts(),t=taskRows();renderSummary(a,t);renderProjects(a);renderLists();renderActivity();renderEnergySummary();if(lastUpdated&&$c("#homeUpdatedAt"))$c("#homeUpdatedAt").textContent="Cập nhật "+new Date(lastUpdated).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}
function renderEnergySummary(){const box=$c("#ccEnergyList");if(box)box.innerHTML=window.estaOverviewUI.energyHtml(activeRows().map(r=>({id:r.building.id,name:r.building.name,energy:r.snapshot?.energy||[]})))}
async function loadCenter(force=false){
 if(!globalScope())return;
 if(!force&&dataAccount===currentAccount&&lastUpdated&&Date.now()-Date.parse(lastUpdated)<30000){renderCenter();return}
 const root=ensureRoot();if(!root||loading)return;
 loading=true;
 const account=currentAccount;
 root.classList.add("loading");
 root.setAttribute("aria-busy","true");
 const refresh=root.querySelector("#ccRefresh");
 const oldRefreshText=refresh?.textContent||"Làm mới";
 if(refresh){refresh.disabled=true;refresh.textContent="Đang tải…"}
 try{
   const res=await sbFetch("/functions/v1/admin-overview",{method:"POST",token:centralSession?.access_token,body:{}});
   if(currentAccount!==account||!globalScope())return;
   rows=Array.isArray(res?.rows)?res.rows:[];
   dataAccount=account;
   activity=Array.isArray(res?.activity)?res.activity:[];
   lastUpdated=res?.generated_at||new Date().toISOString();
   const state=$c("#ccDataState");if(state){state.textContent="Dữ liệu mới nhất";state.classList.remove("offline")}
   const message=$c("#ccLoadMessage");if(message)message.textContent="";
   renderCenter();
 }catch(e){
   console.warn("Admin Command Center failed",e);
   if(currentAccount!==account||!globalScope())return;
   const state=$c("#ccDataState");if(state){state.textContent="Chưa đồng bộ";state.classList.add("offline")}
   const message=$c("#ccLoadMessage");if(message)message.textContent=lastUpdated?"Chưa làm mới được dữ liệu. Đang hiển thị bản cập nhật lúc "+new Date(lastUpdated).toLocaleString("vi-VN")+". Nhấn Làm mới để thử lại.":"Không tải được dữ liệu Tổng quan. Nhấn Làm mới để thử lại.";
 }finally{
   loading=false;
   root.classList.remove("loading");
   root.removeAttribute("aria-busy");
   if(refresh){refresh.disabled=false;refresh.textContent=oldRefreshText}
   if(currentAccount!==account&&globalScope())loadCenter(false);
 }
}
async function openEnergy(id){const b=(currentAccount?.buildings||[]).find(x=>String(x.id)===String(id));if(!b)return;const opening=enterProject(b,{target:"work"});showModule("energy");await opening}
async function openProject(id){const b=(currentAccount?.buildings||[]).find(x=>String(x.id)===String(id));if(b)await enterProject(b,{target:"home"})}
async function openTask(buildingId,taskId){const b=(currentAccount?.buildings||[]).find(x=>String(x.id)===String(buildingId));if(!b)return;lastUpdated="";const opening=enterProject(b,{target:"work"}),seq=projectOpenSeq;const opened=await opening;if(!opened||seq!==projectOpenSeq||!projectOverviewActive||currentBuilding?.id!==b.id||$c("#workPage")?.classList.contains("hide"))return;const n=Number(taskId);if(Number.isFinite(n)&&typeof editTask==="function"&&load().some(x=>Number(x.id)===n))editTask(n)}
async function openAlert(buildingId,module,refId,taskId){if(module==="work")return openTask(buildingId,taskId);const b=(currentAccount?.buildings||[]).find(x=>String(x.id)===String(buildingId));if(!b)return;const opening=enterProject(b,{target:"work"}),seq=projectOpenSeq;if(typeof showModule==="function")showModule(module);const opened=await opening;if(!opened)return;setTimeout(()=>{if(seq!==projectOpenSeq||!projectOverviewActive||currentBuilding?.id!==b.id||$c("#"+module+"Page")?.classList.contains("hide"))return;if(module==="incident"&&refId&&typeof window.demoSelectIncident==="function")window.demoSelectIncident(refId);if(module==="inspection"&&refId&&typeof window.demoSelectInspection==="function")window.demoSelectInspection(refId)},120)}
let ccDispatchFiles=[],ccDispatchPreviewUrls=[];
function clearDispatchMedia(){
 ccDispatchPreviewUrls.forEach(u=>URL.revokeObjectURL(u));ccDispatchPreviewUrls=[];ccDispatchFiles=[];
 const box=$c("#ccDispatchPreview");if(box)box.innerHTML="";
 ["#ccDispatchCamera","#ccDispatchImages"].forEach(id=>{const input=$c(id);if(input)input.value=""});
}
function renderDispatchMedia(){
 const box=$c("#ccDispatchPreview");if(!box)return;
 ccDispatchPreviewUrls.forEach(u=>URL.revokeObjectURL(u));ccDispatchPreviewUrls=[];
 box.innerHTML=ccDispatchFiles.map((f,i)=>{const u=URL.createObjectURL(f);ccDispatchPreviewUrls.push(u);return '<div class="ccDispatchThumb"><img src="'+u+'" alt="Ảnh giao việc '+(i+1)+'"><button type="button" data-cc-remove-image="'+i+'" aria-label="Xóa ảnh">×</button><span>'+(i+1)+'</span></div>'}).join("");
}
function addDispatchMedia(fileList){
 const incoming=[...fileList].filter(f=>f?.type?.startsWith("image/"));if(!incoming.length)return;
 ccDispatchFiles=[...ccDispatchFiles,...incoming];renderDispatchMedia();
}
function ensureDispatch(){
 let m=$c("#ccDispatchModal");if(m)return m;m=document.createElement("div");m.id="ccDispatchModal";m.className="ccModal hide";
 m.innerHTML='<div class="ccModalBackdrop" aria-hidden="true"></div><div class="ccModalCard" role="dialog" aria-modal="true"><div class="ccModalHead"><div><span>ESTA · ADMIN DISPATCH</span><h3>Giao công việc xuống dự án</h3><p>Một nội dung có thể giao đồng thời cho nhiều dự án.</p></div><button class="ccClose" type="button" data-cc-close>×</button></div><form id="ccDispatchForm" class="ccDispatchForm"><div class="ccDispatchProjectsHead"><b>Dự án nhận việc *</b><label><input id="ccDispatchAll" type="checkbox"> Chọn tất cả</label></div><div id="ccDispatchProjects" class="ccDispatchProjects"></div><label class="wide"><span>Nội dung công việc *</span><input id="ccDispatchTitle" maxlength="500" required placeholder="Nhập nội dung công việc..."></label><div class="ccDispatchInline"><label><span>Loại</span><select id="ccDispatchType"><option>Hằng ngày</option><option>Bảo trì</option><option>Sự cố</option></select></label><label><span>Mức độ</span><select id="ccDispatchPriority"><option>Thấp</option><option selected>Trung bình</option><option>Cao</option><option>Khẩn cấp</option></select></label><label><span>Ngày bắt đầu *</span><input id="ccDispatchStart" type="date" required></label><label><span>Hạn hoàn thành *</span><input id="ccDispatchDue" type="date" required></label><label><span>Người thực hiện *</span><input id="ccDispatchAssignee" list="ccPeople" maxlength="200" required value="Kỹ thuật dự án"><datalist id="ccPeople"></datalist></label></div><label class="wide"><span>Ghi chú</span><textarea id="ccDispatchNote" rows="3" maxlength="2000"></textarea></label><section id="ccDispatchMedia" class="ccDispatchMedia wide"><div class="ccDispatchMediaHead"><div><b>Hình ảnh</b><small>Chụp hiện trạng hoặc chọn nhiều ảnh để gửi kèm công việc.</small></div></div><div class="ccDispatchMediaActions"><button id="ccDispatchCameraBtn" class="ccMediaBtn" type="button">📷 Chụp hình</button><button id="ccDispatchLibraryBtn" class="ccMediaBtn" type="button">▣ Chọn hình</button><input id="ccDispatchCamera" class="ccDispatchFileInput" type="file" accept="image/*" capture="environment" multiple><input id="ccDispatchImages" class="ccDispatchFileInput" type="file" accept="image/*" multiple></div><div id="ccDispatchPreview" class="ccDispatchPreview"></div></section><div class="ccDispatchActions"><button class="ccBtn cancel" type="button" data-cc-close>Hủy</button><button id="ccDispatchSave" class="ccBtn primary" type="submit">Giao công việc</button></div></form></div>';
 document.body.appendChild(m);m.addEventListener("click",e=>{const remove=e.target.closest("[data-cc-remove-image]");if(remove){const i=Number(remove.dataset.ccRemoveImage);if(Number.isFinite(i)){ccDispatchFiles.splice(i,1);renderDispatchMedia()}return}if(e.target.closest("[data-cc-close]"))closeDispatch()});m.querySelector("#ccDispatchAll").addEventListener("change",e=>m.querySelectorAll('[name="ccTarget"]').forEach(x=>x.checked=e.target.checked));m.querySelector("#ccDispatchCameraBtn").addEventListener("click",()=>m.querySelector("#ccDispatchCamera").click());m.querySelector("#ccDispatchLibraryBtn").addEventListener("click",()=>m.querySelector("#ccDispatchImages").click());m.querySelector("#ccDispatchCamera").addEventListener("change",e=>{addDispatchMedia(e.target.files);e.target.value=""});m.querySelector("#ccDispatchImages").addEventListener("change",e=>{addDispatchMedia(e.target.files);e.target.value=""});m.querySelector("#ccDispatchForm").addEventListener("submit",submitDispatch);return m;
}
function openDispatch(){const m=ensureDispatch(),box=m.querySelector("#ccDispatchProjects");clearDispatchMedia();box.innerHTML=activeProjects().map(b=>'<label><input type="checkbox" name="ccTarget" value="'+escC(b.id)+'"><span><b>'+escC(b.id)+'</b>'+escC(b.name||b.id)+'</span></label>').join("");m.querySelector("#ccDispatchAll").checked=false;const td=todayC(),d=new Date(td+"T00:00:00");d.setDate(d.getDate()+2);m.querySelector("#ccDispatchStart").value=td;m.querySelector("#ccDispatchDue").value=d.toLocaleDateString("en-CA");const people=[...new Set(activeRows().flatMap(r=>(r.ops?.people||[]).map(p=>p.name)).filter(Boolean))];m.querySelector("#ccPeople").innerHTML=people.map(n=>'<option value="'+escC(n)+'"></option>').join("");m.classList.remove("hide");setTimeout(()=>m.querySelector("#ccDispatchTitle")?.focus(),20)}
function closeDispatch(){$c("#ccDispatchModal")?.classList.add("hide")}
async function submitDispatch(e){
 e.preventDefault();const m=ensureDispatch(),targets=[...m.querySelectorAll('[name="ccTarget"]:checked')].map(x=>x.value);if(!targets.length)return toast("Vui lòng chọn ít nhất 1 dự án");
 const title=m.querySelector("#ccDispatchTitle").value.trim(),start=m.querySelector("#ccDispatchStart").value,due=m.querySelector("#ccDispatchDue").value,assignee=m.querySelector("#ccDispatchAssignee").value.trim();if(!title||!start||!due||!assignee)return toast("Vui lòng nhập đủ thông tin bắt buộc");if(due<start)return toast("Hạn hoàn thành phải từ ngày bắt đầu trở đi");
 const btn=m.querySelector("#ccDispatchSave");btn.disabled=true;const base=Date.now(),group="DG-"+base.toString(36).toUpperCase();
 try{const files=[...ccDispatchFiles];const results=await Promise.allSettled(targets.map(async(buildingId,i)=>{const id=base+i;const refs=files.length?await uploadMediaFiles(files,"tasks",id,null,buildingId):[];const obj={id,d:start,c:title,t:m.querySelector("#ccDispatchType").value,s:"Đang thực hiện",n:m.querySelector("#ccDispatchNote").value.trim(),a:assignee,performers:[assignee],imgs:refs,i:refs.length,priority:m.querySelector("#ccDispatchPriority").value,dueDate:due,dueDateExplicit:true,assetId:"",incidentCode:"",inspectionCode:"",contractorId:"",materials:[],cause:"",result:"",dispatchGroupId:group,dispatchedByAdmin:true,dispatchedAt:new Date().toISOString()};return syncTaskRecord("upsert_task",obj,buildingId)}));const ok=results.filter(x=>x.status==="fulfilled").length,fail=results.length-ok;if(!ok)throw new Error("Không thể giao công việc xuống dự án");if(!fail){const titleInput=m.querySelector("#ccDispatchTitle");if(titleInput.value.trim()===title){titleInput.value="";titleInput.focus()}clearDispatchMedia()}toast(fail?"Đã giao "+ok+" dự án · "+fail+" dự án chưa đồng bộ":"Đã giao công việc xuống "+ok+" dự án"+(files.length?" kèm "+files.length+" hình":""));taskScope="admin";taskPage=1;["#ccProjectFilter","#ccStatusFilter","#ccPriorityFilter","#ccSearch"].forEach(id=>{const control=$c(id);if(control)control.value=""});await loadCenter(true)}catch(err){console.warn(err);toast(err?.message||"Không thể giao công việc")}finally{btn.disabled=false}
}

let navAlertSeq=0,navAlertTimer=0;
const navBadgeIds=["navWork","navIncident","navInspection","navInventory","navMaintenance","navContractor"];
function clearNavBadges(){navBadgeIds.forEach(id=>{const b=$c("#"+id+" .ccNavBadge");if(b)b.remove()})}
function setNavBadge(id,count,level="normal",label="mục cần xử lý"){
 const btn=$c("#"+id);if(!btn)return;
 let badge=btn.querySelector(".ccNavBadge");
 if(!count){badge?.remove();return}
 if(!badge){badge=document.createElement("b");badge.className="ccNavBadge";btn.appendChild(badge)}
 badge.textContent=count>99?"99+":String(count);
 badge.className="ccNavBadge "+level;
 const tip=count+" "+label;
 badge.title=tip;
 badge.setAttribute("aria-label",tip);
}
function scheduleNavAlerts(delay=90){clearTimeout(navAlertTimer);navAlertTimer=setTimeout(updateProjectNavAlerts,delay)}
async function updateProjectNavAlerts(){
 const bid=String(currentBuilding?.id||"");
 if(!bid||!centralSession?.access_token||$c("#navWork")?.classList.contains("hide")){clearNavBadges();return}
 const seq=++navAlertSeq,b=encodeURIComponent(bid),td=todayC(),future=new Date(td+"T00:00:00");future.setDate(future.getDate()+30);const soon=future.toLocaleDateString("en-CA");
 try{
  const [incidents,inspections,assets,materials,tx,jobs]=await Promise.all([
   sbFetch("/rest/v1/incidents?building_id=eq."+b+"&select=id,severity,status",{token:centralSession.access_token}),
   sbFetch("/rest/v1/inspections?building_id=eq."+b+"&select=id,result_status",{token:centralSession.access_token}),
   sbFetch("/rest/v1/maintenance_assets?building_id=eq."+b+"&select=id,status,next_due_date",{token:centralSession.access_token}),
   sbFetch("/rest/v1/inventory_materials?building_id=eq."+b+"&select=id,min_qty,opening_qty,tracking_start_date,created_at",{token:centralSession.access_token}),
   sbFetch("/rest/v1/inventory_material_transactions?building_id=eq."+b+"&select=material_id,tx_type,qty,tx_date",{token:centralSession.access_token}),
   sbFetch("/rest/v1/contractor_jobs?building_id=eq."+b+"&select=id,status",{token:centralSession.access_token})
  ]);
  if(seq!==navAlertSeq||String(currentBuilding?.id||"")!==bid)return;

  // Badge = số mục thực tế còn phải theo dõi/xử lý trong từng module.
  const tasks=typeof load==="function"?load():[];
  const work=tasks.filter(t=>!isDone(t)).length;

  const openIncidents=(incidents||[]).filter(x=>x.status!=="Đã đóng");
  const incident=openIncidents.length;
  const incidentCritical=openIncidents.some(x=>x.severity==="Cao"||x.severity==="Khẩn cấp");

  const inspection=(inspections||[]).filter(x=>x.result_status&&x.result_status!=="Đạt").length;

  const activeAssets=(assets||[]).filter(x=>x.status!=="Ngừng sử dụng");
  const maintenance=activeAssets.filter(x=>x.status==="Hỏng"||(x.next_due_date&&String(x.next_due_date)<=soon)).length;
  const maintenanceCritical=activeAssets.some(x=>x.status==="Hỏng"||(x.next_due_date&&String(x.next_due_date)<td));

  // Tồn kho phải tính đúng theo ngày bắt đầu theo dõi và chỉ lấy giao dịch đến hiện tại.
  const materialMap=new Map((materials||[]).map(m=>[String(m.id),m]));
  const qty=new Map((materials||[]).map(m=>[String(m.id),Number(m.opening_qty||0)]));
  (tx||[]).forEach(x=>{
   const m=materialMap.get(String(x.material_id));if(!m)return;
   const start=String(m.tracking_start_date||m.created_at||td).slice(0,10);
   const txDate=String(x.tx_date||"").slice(0,10);
   if(!txDate||txDate<start||txDate>td)return;
   qty.set(String(x.material_id),(qty.get(String(x.material_id))||0)+(x.tx_type==="in"?1:-1)*Number(x.qty||0));
  });
  const lowMaterials=(materials||[]).filter(m=>Number(m.min_qty||0)>0&&(qty.get(String(m.id))||0)<=Number(m.min_qty||0));
  const inventory=lowMaterials.length;
  const inventoryCritical=lowMaterials.some(m=>(qty.get(String(m.id))||0)<=0);

  const contractor=(jobs||[]).filter(x=>!["Hoàn thành","Đã hoàn thành"].includes(String(x.status||""))).length;

  setNavBadge("navWork",work,work?"high":"normal","công việc chưa hoàn thành");
  setNavBadge("navIncident",incident,incidentCritical?"critical":incident?"high":"normal","sự cố/defect đang mở");
  setNavBadge("navInspection",inspection,inspection?"high":"normal","checklist cần chú ý hoặc khắc phục");
  setNavBadge("navMaintenance",maintenance,maintenanceCritical?"critical":maintenance?"high":"normal","thiết bị hỏng, quá hạn hoặc đến hạn trong 30 ngày");
  setNavBadge("navInventory",inventory,inventoryCritical?"critical":inventory?"high":"normal","vật tư hết hoặc dưới mức tồn tối thiểu");
  setNavBadge("navContractor",contractor,contractor?"normal":"normal","công việc nhà thầu chưa hoàn thành");
 }catch(e){console.warn("Project alert badges failed",e)}
}

const baseShowModuleAlerts=showModule;
showModule=function(name){const r=baseShowModuleAlerts.apply(this,arguments);scheduleNavAlerts();return r};
const baseApplyBuildingUIAlerts=applyBuildingUI;
applyBuildingUI=function(){const r=baseApplyBuildingUIAlerts.apply(this,arguments);scheduleNavAlerts();return r};
const baseTaskRenderAlerts=render;
render=function(){const r=baseTaskRenderAlerts.apply(this,arguments);scheduleNavAlerts();return r};
function refreshVisibleCenter(){if(!document.hidden&&globalScope()&&!$c("#homePage")?.classList.contains("hide"))loadCenter(false)}
setInterval(()=>{if(!document.hidden){scheduleNavAlerts(0);refreshVisibleCenter()}},60000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden){scheduleNavAlerts(0);refreshVisibleCenter()}});
const baseRender=renderHomeDashboard;
renderHomeDashboard=function(){
 const root=ensureRoot();
 if(globalScope()){
  if(!$c("#homePage")?.classList.contains("hide"))loadCenter(false);
  return;
 }
 return baseRender.apply(this,arguments);
};
const baseOpenAdmin=openAdminPortal;
openAdminPortal=function(){const result=baseOpenAdmin.apply(this,arguments);ensureRoot();return result};
window.estaCommandCenterRefresh=()=>loadCenter(true);
// Keyboard activation uses the same project/task link as a pointer click.
$c("#homePage")?.addEventListener("keydown",e=>{const row=e.target.closest("tr[data-cc-task]");if(row&&["Enter"," "].includes(e.key)){e.preventDefault();row.click()}});
setTimeout(()=>{ensureRoot();scheduleNavAlerts(0);if(globalScope()&&!$c("#homePage")?.classList.contains("hide"))loadCenter(false)},650);
})();

