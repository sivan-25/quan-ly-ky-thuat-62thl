(()=>{
"use strict";
const ROOT_ID="estaCommandCenter";
let rows=[],activity=[],loading=false,lastUpdated="";
const $c=s=>document.querySelector(s);
const escC=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const todayC=()=>typeof today==="function"?today():new Date().toLocaleDateString("en-CA");
const fmtC=d=>{if(!d)return "—";const x=String(d).slice(0,10);try{return new Date(x+"T00:00:00").toLocaleDateString("vi-VN")}catch(_){return x}};
const activeProjects=()=>{const list=Array.isArray(currentAccount?.buildings)?currentAccount.buildings:[];const real=list.filter(x=>x?.id&&x.id!=="DEMO");return real.length?real:list.filter(x=>x?.id)};
const activeIds=()=>new Set(activeProjects().map(x=>String(x.id)));
const activeRows=()=>{const ids=activeIds();return rows.filter(r=>ids.has(String(r?.building?.id||"")))};
const isDone=t=>String(t?.s||"")==="Đã hoàn thành";
const priorityRank=p=>p==="Khẩn cấp"?4:p==="Cao"?3:p==="Trung bình"?2:1;
function ensureRoot(){
 const home=$c("#homePage");if(!home)return null;
 let root=$c("#"+ROOT_ID);
 if(!root){
  root=document.createElement("section");root.id=ROOT_ID;root.className="ccRoot hide";
  root.innerHTML='<div class="ccHero"><div><span>ESTA · CENTRAL OPERATIONS</span><h2>Trung tâm điều hành đa dự án</h2><p>Theo dõi toàn bộ công việc, cảnh báo và trạng thái vận hành trong một màn hình.</p></div><div class="ccHeroActions"><button id="ccRefresh" class="ccBtn ghost" type="button">Làm mới</button><button id="ccDispatch" class="ccBtn primary" type="button">＋ Giao công việc</button></div></div><div id="ccSummary" class="ccSummary"></div><div id="ccProjectCards" class="ccProjects"></div><div class="ccWorkspace"><section class="ccPanel"><div class="ccPanelHead"><div><span>CÔNG VIỆC TOÀN HỆ THỐNG</span><h3>Tất cả dự án</h3><p id="ccTaskMeta">Đang tải dữ liệu...</p></div></div><div class="ccFilters"><select id="ccProjectFilter"><option value="">Tất cả dự án</option></select><select id="ccStatusFilter"><option value="">Tất cả trạng thái</option><option>Đang thực hiện</option><option>Chờ xử lý</option><option>Đã hoàn thành</option></select><select id="ccPriorityFilter"><option value="">Tất cả mức độ</option><option>Khẩn cấp</option><option>Cao</option><option>Trung bình</option><option>Thấp</option></select><input id="ccSearch" type="search" autocomplete="off" placeholder="Tìm công việc, người thực hiện..."></div><div class="ccTableWrap"><table class="ccTable"><thead><tr><th>Dự án</th><th>Công việc</th><th>Trạng thái</th><th>Mức độ</th><th>Người thực hiện</th><th>Hạn</th><th>Cảnh báo</th></tr></thead><tbody id="ccTaskBody"></tbody></table></div></section><aside class="ccPanel ccAlertsPanel"><div class="ccPanelHead"><div><span>CẢNH BÁO</span><h3>Cần xử lý</h3><p>Ưu tiên theo mức độ và hạn.</p></div><b id="ccAlertCount" class="ccAlertCount">0</b></div><div id="ccAlertList" class="ccAlertList"></div></aside></div><section class="ccPanel ccActivityPanel"><div class="ccPanelHead"><div><span>NHẬT KÝ VẬN HÀNH</span><h3>Hoạt động gần đây</h3><p>Lịch sử cập nhật snapshot theo dự án và tài khoản thực hiện.</p></div></div><div id="ccActivityList" class="ccActivityList"></div></section>';
  const anchor=home.querySelector(".homeKpis");if(anchor)anchor.insertAdjacentElement("afterend",root);else home.prepend(root);
  root.querySelector("#ccRefresh").addEventListener("click",()=>loadCenter(true));
  root.querySelector("#ccDispatch").addEventListener("click",openDispatch);
  ["#ccProjectFilter","#ccStatusFilter","#ccPriorityFilter"].forEach(id=>root.querySelector(id).addEventListener("change",renderLists));
  root.querySelector("#ccSearch").addEventListener("input",renderLists);
  root.addEventListener("click",e=>{const p=e.target.closest("[data-cc-project]");if(p)return openProject(p.dataset.ccProject);const t=e.target.closest("[data-cc-task]");if(t)return openTask(t.dataset.building,t.dataset.taskId);const a=e.target.closest("[data-cc-alert]");if(a)return openAlert(a.dataset.building,a.dataset.module,a.dataset.refId,a.dataset.taskId)});
 }
 const admin=!!currentAccount?.is_admin;root.classList.toggle("hide",!admin);
 $c("#app")?.classList.toggle("adminCommandHome",admin);
 if(admin){const h=home.querySelector(".homeWelcomeCopy h1");if(h)h.textContent="Trung tâm điều hành";const p=home.querySelector(".homeWelcomeCopy p");if(p)p.textContent="Theo dõi công việc, cảnh báo và vận hành của tất cả dự án ESTA.";const top=$c("#topHomeTitle h1");if(top)top.textContent="Trung tâm điều hành"}
 return root;
}
function taskRows(){const out=[];activeRows().forEach(r=>{const b=r.building||{};(Array.isArray(r.snapshot?.tasks)?r.snapshot.tasks:[]).forEach(t=>out.push({...t,_buildingId:b.id,_buildingName:b.name||b.id}))});return out}
function stockOf(row,m){let q=Number(m?.opening_qty||0);(row?.ops?.inventory_material_transactions||[]).filter(x=>String(x.material_id)===String(m?.id)).forEach(x=>q+=(x.tx_type==="in"?1:-1)*Number(x.qty||0));return q}
function alerts(){
 const out=[],td=todayC(),d7=new Date(td+"T00:00:00");d7.setDate(d7.getDate()+7);const soon=d7.toLocaleDateString("en-CA");
 activeRows().forEach(r=>{
  const b=r.building||{},bid=String(b.id||""),bn=b.name||bid;
  (r.snapshot?.tasks||[]).forEach(t=>{if(isDone(t))return;const due=String(t.dueDate||""),assignee=String(t.a||"").trim();if(due&&due<td)out.push({sev:3,bid,bn,module:"work",taskId:t.id,title:"Công việc quá hạn",detail:t.c||"Công việc kỹ thuật",tag:"Quá hạn",date:due});else if(due===td)out.push({sev:2,bid,bn,module:"work",taskId:t.id,title:"Đến hạn hôm nay",detail:t.c||"Công việc kỹ thuật",tag:t.priority||"Hôm nay",date:due});else if(due&&due<=soon)out.push({sev:1,bid,bn,module:"work",taskId:t.id,title:"Sắp đến hạn công việc",detail:t.c||"Công việc kỹ thuật",tag:fmtC(due),date:due});else if(priorityRank(t.priority)>=3)out.push({sev:t.priority==="Khẩn cấp"?3:2,bid,bn,module:"work",taskId:t.id,title:"Công việc ưu tiên "+String(t.priority||"").toLowerCase(),detail:t.c||"Công việc kỹ thuật",tag:t.priority||"Ưu tiên",date:due||t.d||""});if(!assignee)out.push({sev:2,bid,bn,module:"work",taskId:t.id,title:"Chưa có người thực hiện",detail:t.c||"Công việc kỹ thuật",tag:"Cần phân công",date:due||t.d||""})});
  (r.ops?.incidents||[]).forEach(x=>{if(x.status!=="Đã đóng"&&(x.severity==="Khẩn cấp"||x.severity==="Cao"))out.push({sev:x.severity==="Khẩn cấp"?3:2,bid,bn,module:"incident",refId:x.id,title:"Sự cố "+x.severity.toLowerCase(),detail:(x.incident_code||"Sự cố")+" · "+(x.area||x.symptom||""),tag:x.status||"Đang mở",date:String(x.detected_at||"").slice(0,10)})});
  (r.ops?.inspections||[]).forEach(x=>{if(x.result_status!=="Đạt")out.push({sev:(x.result_status==="Không đạt"||x.result_status==="Cần khắc phục")?2:1,bid,bn,module:"inspection",refId:x.id,title:"Checklist "+String(x.result_status||"cần chú ý").toLowerCase(),detail:(x.inspection_code||"")+" · "+(x.template_name||"Kiểm tra định kỳ"),tag:x.result_status||"Cần chú ý",date:x.inspection_date||""})});
  (r.ops?.maintenance_assets||[]).forEach(x=>{const due=String(x.next_due_date||"");if(x.status==="Hỏng")out.push({sev:3,bid,bn,module:"maintenance",refId:x.id,title:"Thiết bị hỏng",detail:(x.code||"")+" · "+(x.name||"Thiết bị"),tag:"Hỏng",date:due});else if(due&&due<td)out.push({sev:3,bid,bn,module:"maintenance",refId:x.id,title:"Bảo trì quá hạn",detail:(x.code||"")+" · "+(x.name||"Thiết bị"),tag:fmtC(due),date:due});else if(due&&due<=soon)out.push({sev:1,bid,bn,module:"maintenance",refId:x.id,title:"Sắp đến hạn bảo trì",detail:(x.code||"")+" · "+(x.name||"Thiết bị"),tag:fmtC(due),date:due})});
  (r.ops?.inventory_materials||[]).forEach(m=>{const min=Number(m.min_qty||0);if(min<=0)return;const qty=stockOf(r,m);if(qty<=min)out.push({sev:qty<=0?3:2,bid,bn,module:"inventory",refId:m.id,title:qty<=0?"Vật tư đã hết":"Vật tư tồn thấp",detail:(m.name||"Vật tư")+" · còn "+qty.toLocaleString("vi-VN")+" "+(m.unit||""),tag:"Min "+min.toLocaleString("vi-VN")})});
  (r.ops?.contractor_jobs||[]).forEach(j=>{if(j.status==="Chờ xử lý"||j.status==="Tạm dừng")out.push({sev:1,bid,bn,module:"contractor",refId:j.id,title:"Nhà thầu "+j.status.toLowerCase(),detail:j.work_content||"Công việc nhà thầu",tag:j.status,date:j.work_date||""})});
 });
 return out.sort((a,b)=>b.sev-a.sev||String(a.date||"").localeCompare(String(b.date||"")));
}
function statusClass(s){return s==="Đã hoàn thành"?"done":s==="Chờ xử lý"?"waiting":"doing"}
function warningHtml(t){const due=String(t.dueDate||""),td=todayC();if(!isDone(t)&&due&&due<td)return '<span class="ccWarn critical">Quá hạn</span>';if(!isDone(t)&&due===td)return '<span class="ccWarn high">Hôm nay</span>';if(!isDone(t)&&priorityRank(t.priority)>=3)return '<span class="ccWarn high">'+escC(t.priority)+'</span>';return '<span class="ccWarn ok">Bình thường</span>'}
function renderFilters(){const sel=$c("#ccProjectFilter");if(!sel)return;const old=sel.value;sel.innerHTML='<option value="">Tất cả dự án</option>'+activeProjects().map(b=>'<option value="'+escC(b.id)+'">'+escC(b.name||b.id)+'</option>').join("");if([...sel.options].some(o=>o.value===old))sel.value=old}
function renderSummary(a,t){const box=$c("#ccSummary");if(!box)return;const red=a.filter(x=>x.sev===3).length,overdue=a.filter(x=>x.title.toLowerCase().includes("quá hạn")).length,openInc=activeRows().reduce((n,r)=>n+(r.ops?.incidents||[]).filter(x=>x.status!=="Đã đóng").length,0);box.innerHTML='<article><span>DỰ ÁN</span><b>'+activeRows().length+'</b><small>Đang theo dõi</small></article><article><span>VIỆC CHƯA XONG</span><b>'+t.filter(x=>!isDone(x)).length+'</b><small>Toàn hệ thống</small></article><article class="warn"><span>CẢNH BÁO ĐỎ</span><b>'+red+'</b><small>Cần ưu tiên</small></article><article class="danger"><span>QUÁ HẠN</span><b>'+overdue+'</b><small>Công việc / bảo trì</small></article><article><span>SỰ CỐ ĐANG MỞ</span><b>'+openInc+'</b><small>Chưa đóng hồ sơ</small></article>'}
function renderProjects(a){const box=$c("#ccProjectCards");if(!box)return;box.innerHTML=activeRows().map(r=>{const b=r.building||{},tasks=r.snapshot?.tasks||[],open=tasks.filter(x=>!isDone(x)).length,aa=a.filter(x=>x.bid===String(b.id)),red=aa.filter(x=>x.sev===3).length;return '<button class="ccProjectCard" type="button" data-cc-project="'+escC(b.id)+'"><div><span>'+escC(b.id)+'</span><h3>'+escC(b.name||b.id)+'</h3><div class="ccProjectStats"><span><b>'+open+'</b> việc mở</span><span><b>'+aa.length+'</b> cảnh báo</span><span class="'+(red?"hot":"")+'"><b>'+red+'</b> khẩn</span></div></div><i>→</i></button>'}).join("")||'<div class="ccEmpty">Chưa có dự án đang hoạt động.</div>'}
function renderLists(){
 const project=$c("#ccProjectFilter")?.value||"",status=$c("#ccStatusFilter")?.value||"",priority=$c("#ccPriorityFilter")?.value||"",q=($c("#ccSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 let tasks=taskRows().filter(t=>(!project||String(t._buildingId)===project)&&(!status||String(t.s||"Đang thực hiện")===status)&&(!priority||String(t.priority||"Trung bình")===priority)&&(!q||[t.c,t.n,t.a,t._buildingName,t._buildingId,t.dispatchGroupId].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 tasks.sort((a,b)=>{const ac=isDone(a)?1:0,bc=isDone(b)?1:0;if(ac!==bc)return ac-bc;const ad=String(a.dueDate||"9999-12-31"),bd=String(b.dueDate||"9999-12-31");return ad.localeCompare(bd)||Number(b.id||0)-Number(a.id||0)});
 const body=$c("#ccTaskBody");if(body)body.innerHTML=tasks.length?tasks.slice(0,150).map(t=>'<tr data-cc-task data-building="'+escC(t._buildingId)+'" data-task-id="'+escC(t.id)+'"><td><span class="ccProjectTag">'+escC(t._buildingId)+'</span><small>'+escC(t._buildingName)+'</small></td><td><b>'+escC(t.c||"Công việc kỹ thuật")+'</b>'+(t.dispatchGroupId?'<small>Nhóm '+escC(t.dispatchGroupId)+'</small>':(t.n?'<small>'+escC(t.n)+'</small>':""))+'</td><td><span class="ccStatus '+statusClass(t.s)+'">'+escC(t.s||"Đang thực hiện")+'</span></td><td><span class="ccPriority p'+priorityRank(t.priority)+'">'+escC(t.priority||"Trung bình")+'</span></td><td>'+escC(t.a||"—")+'</td><td>'+fmtC(t.dueDate||"")+'</td><td>'+warningHtml(t)+'</td></tr>').join(""):'<tr><td colspan="7" class="ccEmptyCell">Không có công việc phù hợp.</td></tr>';
 const meta=$c("#ccTaskMeta");if(meta)meta.textContent=tasks.length+" công việc phù hợp";
 let list=alerts().filter(a=>(!project||a.bid===project)&&(!q||[a.title,a.detail,a.bn,a.bid].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 const ab=$c("#ccAlertList");if(ab)ab.innerHTML=list.length?list.slice(0,50).map(a=>'<button class="ccAlert sev'+a.sev+'" type="button" data-cc-alert data-building="'+escC(a.bid)+'" data-module="'+escC(a.module)+'" data-ref-id="'+escC(a.refId||"")+'" data-task-id="'+escC(a.taskId||"")+'"><i></i><div><span>'+escC(a.bid)+' · '+escC(a.title)+'</span><b>'+escC(a.detail)+'</b><small>'+escC(a.tag||"Cần xử lý")+'</small></div><strong>→</strong></button>').join(""):'<div class="ccEmpty">Không có cảnh báo theo bộ lọc hiện tại.</div>';
 const n=$c("#ccAlertCount");if(n)n.textContent=list.length;
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
 const list=(activity||[]).filter(x=>ids.has(String(x.building_id||""))).slice(0,20);
 box.innerHTML=list.length?list.map(x=>{
   const when=x.saved_at?new Date(x.saved_at).toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";
   const label=auditLabel(x),summary=String(x.summary||"").trim();
   return '<button type="button" class="ccActivity" data-cc-project="'+escC(x.building_id)+'"><span class="ccActivityDot"></span><div><b>'+escC(x.building_id)+' · '+escC(label)+'</b><small>'+escC(x.actor||"Hệ thống")+' · '+escC(when)+(summary?' · '+escC(summary):'')+'</small></div><em>Chi tiết</em></button>';
 }).join(""):'<div class="ccEmpty">Chưa có lịch sử cập nhật.</div>';
}
function renderCenter(){const root=ensureRoot();if(!root||!currentAccount?.is_admin)return;renderFilters();const a=alerts(),t=taskRows();renderSummary(a,t);renderProjects(a);renderLists();renderActivity();if(lastUpdated&&$c("#homeUpdatedAt"))$c("#homeUpdatedAt").textContent="Cập nhật "+new Date(lastUpdated).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})}
async function loadCenter(force=false){if(!currentAccount?.is_admin)return;const root=ensureRoot();if(!root||loading)return;loading=true;root.classList.add("loading");try{const res=await sbFetch("/functions/v1/admin-overview",{method:"POST",token:centralSession?.access_token,body:{}});rows=Array.isArray(res?.rows)?res.rows:[];activity=Array.isArray(res?.activity)?res.activity:[];lastUpdated=res?.generated_at||new Date().toISOString();renderCenter()}catch(e){console.warn("Admin Command Center failed",e);if($c("#ccAlertList"))$c("#ccAlertList").innerHTML='<div class="ccEmpty">Không tải được dữ liệu. Nhấn Làm mới để thử lại.</div>'}finally{loading=false;root.classList.remove("loading")}}
async function openProject(id){const b=(currentAccount?.buildings||[]).find(x=>String(x.id)===String(id));if(b)await enterProject(b,{target:"work"})}
async function openTask(buildingId,taskId){const b=(currentAccount?.buildings||[]).find(x=>String(x.id)===String(buildingId));if(!b)return;await enterProject(b,{target:"work"});const n=Number(taskId);setTimeout(()=>{if(Number.isFinite(n)&&typeof editTask==="function"&&load().some(x=>Number(x.id)===n))editTask(n)},120)}
async function openAlert(buildingId,module,refId,taskId){if(module==="work")return openTask(buildingId,taskId);const b=(currentAccount?.buildings||[]).find(x=>String(x.id)===String(buildingId));if(!b)return;await enterProject(b,{target:"work"});if(typeof showModule==="function")showModule(module);setTimeout(()=>{if(module==="incident"&&refId&&typeof window.demoSelectIncident==="function")window.demoSelectIncident(refId);if(module==="inspection"&&refId&&typeof window.demoSelectInspection==="function")window.demoSelectInspection(refId)},120)}
function ensureDispatch(){
 let m=$c("#ccDispatchModal");if(m)return m;m=document.createElement("div");m.id="ccDispatchModal";m.className="ccModal hide";
 m.innerHTML='<button class="ccModalBackdrop" type="button" data-cc-close aria-label="Đóng"></button><div class="ccModalCard" role="dialog" aria-modal="true"><div class="ccModalHead"><div><span>ESTA · ADMIN DISPATCH</span><h3>Giao công việc xuống dự án</h3><p>Một nội dung có thể giao đồng thời cho nhiều dự án.</p></div><button class="ccClose" type="button" data-cc-close>×</button></div><form id="ccDispatchForm" class="ccDispatchForm"><div class="ccDispatchProjectsHead"><b>Dự án nhận việc *</b><label><input id="ccDispatchAll" type="checkbox"> Chọn tất cả</label></div><div id="ccDispatchProjects" class="ccDispatchProjects"></div><label class="wide"><span>Nội dung công việc *</span><input id="ccDispatchTitle" maxlength="500" required placeholder="Nhập nội dung công việc..."></label><label><span>Loại</span><select id="ccDispatchType"><option>Hằng ngày</option><option>Bảo trì</option><option>Sự cố</option></select></label><label><span>Mức độ</span><select id="ccDispatchPriority"><option>Thấp</option><option selected>Trung bình</option><option>Cao</option><option>Khẩn cấp</option></select></label><label><span>Ngày bắt đầu *</span><input id="ccDispatchStart" type="date" required></label><label><span>Hạn hoàn thành *</span><input id="ccDispatchDue" type="date" required></label><label class="wide"><span>Người thực hiện *</span><input id="ccDispatchAssignee" list="ccPeople" maxlength="200" required value="Kỹ thuật dự án"><datalist id="ccPeople"></datalist></label><label class="wide"><span>Ghi chú</span><textarea id="ccDispatchNote" rows="3" maxlength="2000"></textarea></label><div class="ccDispatchActions"><button class="ccBtn cancel" type="button" data-cc-close>Hủy</button><button id="ccDispatchSave" class="ccBtn primary" type="submit">Giao công việc</button></div></form></div>';
 document.body.appendChild(m);m.addEventListener("click",e=>{if(e.target.closest("[data-cc-close]"))closeDispatch()});m.querySelector("#ccDispatchAll").addEventListener("change",e=>m.querySelectorAll('[name="ccTarget"]').forEach(x=>x.checked=e.target.checked));m.querySelector("#ccDispatchForm").addEventListener("submit",submitDispatch);return m;
}
function openDispatch(){const m=ensureDispatch(),box=m.querySelector("#ccDispatchProjects");box.innerHTML=activeProjects().map(b=>'<label><input type="checkbox" name="ccTarget" value="'+escC(b.id)+'"><span><b>'+escC(b.id)+'</b>'+escC(b.name||b.id)+'</span></label>').join("");m.querySelector("#ccDispatchAll").checked=false;const td=todayC(),d=new Date(td+"T00:00:00");d.setDate(d.getDate()+2);m.querySelector("#ccDispatchStart").value=td;m.querySelector("#ccDispatchDue").value=d.toLocaleDateString("en-CA");const people=[...new Set(activeRows().flatMap(r=>(r.ops?.people||[]).map(p=>p.name)).filter(Boolean))];m.querySelector("#ccPeople").innerHTML=people.map(n=>'<option value="'+escC(n)+'"></option>').join("");m.classList.remove("hide");setTimeout(()=>m.querySelector("#ccDispatchTitle")?.focus(),20)}
function closeDispatch(){$c("#ccDispatchModal")?.classList.add("hide")}
async function submitDispatch(e){
 e.preventDefault();const m=ensureDispatch(),targets=[...m.querySelectorAll('[name="ccTarget"]:checked')].map(x=>x.value);if(!targets.length)return toast("Vui lòng chọn ít nhất 1 dự án");
 const title=m.querySelector("#ccDispatchTitle").value.trim(),start=m.querySelector("#ccDispatchStart").value,due=m.querySelector("#ccDispatchDue").value,assignee=m.querySelector("#ccDispatchAssignee").value.trim();if(!title||!start||!due||!assignee)return toast("Vui lòng nhập đủ thông tin bắt buộc");if(due<start)return toast("Hạn hoàn thành phải từ ngày bắt đầu trở đi");
 const btn=m.querySelector("#ccDispatchSave");btn.disabled=true;const base=Date.now(),group="DG-"+base.toString(36).toUpperCase();
 try{const results=await Promise.allSettled(targets.map((buildingId,i)=>{const obj={id:base+i,d:start,c:title,t:m.querySelector("#ccDispatchType").value,s:"Đang thực hiện",n:m.querySelector("#ccDispatchNote").value.trim(),a:assignee,performers:[assignee],imgs:[],i:0,priority:m.querySelector("#ccDispatchPriority").value,dueDate:due,assetId:"",incidentCode:"",inspectionCode:"",contractorId:"",materials:[],cause:"",result:"",dispatchGroupId:group,dispatchedByAdmin:true,dispatchedAt:new Date().toISOString()};return syncTaskRecord("upsert_task",obj,buildingId)}));const ok=results.filter(x=>x.status==="fulfilled").length,fail=results.length-ok;if(!ok)throw new Error("Không thể giao công việc xuống dự án");closeDispatch();toast(fail?"Đã giao "+ok+" dự án · "+fail+" dự án chưa đồng bộ":"Đã giao công việc xuống "+ok+" dự án");m.querySelector("#ccDispatchForm").reset();await loadCenter(true)}catch(err){console.warn(err);toast(err?.message||"Không thể giao công việc")}finally{btn.disabled=false}
}

let navAlertSeq=0,navAlertTimer=0;
const navBadgeIds=["navWork","navIncident","navInspection","navInventory","navMaintenance","navContractor"];
function clearNavBadges(){navBadgeIds.forEach(id=>{const b=$c("#"+id+" .ccNavBadge");if(b)b.remove()})}
function setNavBadge(id,count,level="normal"){
 const btn=$c("#"+id);if(!btn)return;
 let badge=btn.querySelector(".ccNavBadge");
 if(!count){badge?.remove();return}
 if(!badge){badge=document.createElement("b");badge.className="ccNavBadge";btn.appendChild(badge)}
 badge.textContent=count>99?"99+":String(count);
 badge.className="ccNavBadge "+level;
 badge.title=count+" cảnh báo cần chú ý";
}
function scheduleNavAlerts(delay=90){clearTimeout(navAlertTimer);navAlertTimer=setTimeout(updateProjectNavAlerts,delay)}
async function updateProjectNavAlerts(){
 const bid=String(currentBuilding?.id||"");
 if(!bid||!centralSession?.access_token||$c("#navWork")?.classList.contains("hide")){clearNavBadges();return}
 const seq=++navAlertSeq,b=encodeURIComponent(bid),td=todayC(),future=new Date(td+"T00:00:00");future.setDate(future.getDate()+7);const soon=future.toLocaleDateString("en-CA");
 try{
  const [incidents,inspections,assets,materials,tx,jobs]=await Promise.all([
   sbFetch("/rest/v1/incidents?building_id=eq."+b+"&select=id,severity,status",{token:centralSession.access_token}),
   sbFetch("/rest/v1/inspections?building_id=eq."+b+"&select=id,result_status",{token:centralSession.access_token}),
   sbFetch("/rest/v1/maintenance_assets?building_id=eq."+b+"&select=id,status,next_due_date",{token:centralSession.access_token}),
   sbFetch("/rest/v1/inventory_materials?building_id=eq."+b+"&select=id,min_qty,opening_qty",{token:centralSession.access_token}),
   sbFetch("/rest/v1/inventory_material_transactions?building_id=eq."+b+"&select=material_id,tx_type,qty",{token:centralSession.access_token}),
   sbFetch("/rest/v1/contractor_jobs?building_id=eq."+b+"&select=id,status",{token:centralSession.access_token})
  ]);
  if(seq!==navAlertSeq||String(currentBuilding?.id||"")!==bid)return;
  const tasks=typeof load==="function"?load():[];
  const work=tasks.filter(t=>!isDone(t)&&((t.dueDate&&String(t.dueDate)<=td)||priorityRank(t.priority)>=3)).length;
  const incident=(incidents||[]).filter(x=>x.status!=="Đã đóng"&&(x.severity==="Cao"||x.severity==="Khẩn cấp")).length;
  const inspection=(inspections||[]).filter(x=>x.result_status&&x.result_status!=="Đạt").length;
  const maintenance=(assets||[]).filter(x=>x.status==="Hỏng"||(x.next_due_date&&String(x.next_due_date)<=soon)).length;
  const qty=new Map((materials||[]).map(m=>[String(m.id),Number(m.opening_qty||0)]));
  (tx||[]).forEach(x=>qty.set(String(x.material_id),(qty.get(String(x.material_id))||0)+(x.tx_type==="in"?1:-1)*Number(x.qty||0)));
  const inventory=(materials||[]).filter(m=>Number(m.min_qty||0)>0&&(qty.get(String(m.id))||0)<=Number(m.min_qty||0)).length;
  const contractor=(jobs||[]).filter(x=>x.status==="Chờ xử lý"||x.status==="Tạm dừng").length;
  setNavBadge("navWork",work,work?"high":"normal");
  setNavBadge("navIncident",incident,incident?"critical":"normal");
  setNavBadge("navInspection",inspection,inspection?"high":"normal");
  setNavBadge("navMaintenance",maintenance,maintenance?"critical":"normal");
  setNavBadge("navInventory",inventory,inventory?"high":"normal");
  setNavBadge("navContractor",contractor,contractor?"normal":"normal");
 }catch(e){console.warn("Project alert badges failed",e)}
}

const baseShowModuleAlerts=showModule;
showModule=function(name){const r=baseShowModuleAlerts.apply(this,arguments);scheduleNavAlerts();return r};
const baseApplyBuildingUIAlerts=applyBuildingUI;
applyBuildingUI=function(){const r=baseApplyBuildingUIAlerts.apply(this,arguments);scheduleNavAlerts();return r};
const baseTaskRenderAlerts=render;
render=function(){const r=baseTaskRenderAlerts.apply(this,arguments);scheduleNavAlerts();return r};
setInterval(()=>{if(!document.hidden)scheduleNavAlerts(0)},60000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)scheduleNavAlerts(0)});
const baseRender=renderHomeDashboard;
renderHomeDashboard=function(){const result=baseRender.apply(this,arguments);if(currentAccount?.is_admin&&!$c("#homePage")?.classList.contains("hide"))setTimeout(()=>loadCenter(false),30);else $c("#"+ROOT_ID)?.classList.add("hide");return result};
window.estaCommandCenterRefresh=()=>loadCenter(true);
setTimeout(()=>{ensureRoot();scheduleNavAlerts(0);if(currentAccount?.is_admin&&!$c("#homePage")?.classList.contains("hide"))loadCenter(true)},650);
})();