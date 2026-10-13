(function(){
"use strict";
const B="130HH", $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const now=new Date();
const VIEW_KEY="esta.maintenance.130HH.view";
function readView(){
 try{const v=localStorage.getItem(VIEW_KEY);if(v==="cards"||v==="rows")return v;}catch(_){}
 return typeof window!=="undefined"&&window.matchMedia?.("(max-width:640px)")?.matches?"rows":"cards";
}
let year=now.getFullYear(),month=now.getMonth()+1,items=[],stored=[],people=[],ready=false,busy=false,currentEvent=null,currentPlan=null,viewMode=readView(),scheduleCache=null,layoutMode="list";
function clearScheduleCache(){scheduleCache=null}
function getYearSchedule(y){if(scheduleCache?.year===y)return scheduleCache.events;const events=schedule(y);scheduleCache={year:y,events};return events}
function personLabel(value){
 const name=String(value||"").trim();
 if(!name||name==="Kỹ thuật"||name==="Kỹ thuật dự án")return "Kỹ thuật · Chưa chọn tên";
 if(name==="Nhà thầu")return "Nhà thầu · Chưa chọn tên";
 return name;
}
function peopleOptions(){return people.filter(n=>n&&n!=="Nhà thầu"&&n!=="Kỹ thuật dự án")}
function renderPersonPickers(){
 const names=peopleOptions();
 const list=$("m130PeopleOptions");
 if(list)list.innerHTML=names.map(n=>'<option value="'+esc(n)+'"></option>').join("");
 for(const id of ["m130AssigneeQuick","m130WhoQuick"]){
  const el=$(id);if(!el)continue;
  const target=id==="m130AssigneeQuick"?"m130Assignee":"m130Who";
  el.innerHTML=names.map(n=>'<button type="button" data-m130-person-target="'+target+'" data-m130-person-name="'+esc(n)+'">'+esc(n)+'</button>').join("");
 }
}
const active=()=>typeof currentBuilding!=="undefined"&&String(currentBuilding?.id||"")===B;
const canWrite=()=>typeof canProjectEdit==="function"&&canProjectEdit();
const pad=n=>String(n).padStart(2,"0");
const fmt=d=>d?String(d).slice(0,10).split("-").reverse().join("/"):"—";
const monthISO=d=>String(d).slice(0,7)+"-01";
function addMonths(anchor,delta){
 const p=String(anchor).split("-").map(Number);
 if(p.length!==3||!p.every(Number.isFinite))return "";
 const abs=p[0]*12+p[1]-1+delta,y=Math.floor(abs/12),m=abs%12+1;
 const day=Math.min(p[2],new Date(Date.UTC(y,m,0)).getUTCDate());
 return y+"-"+pad(m)+"-"+pad(day);
}
function interval(i){const n=Number(String(i?.cadence||"").match(/\d+/)?.[0]||0);return Number.isInteger(n)&&n>=1&&n<=120?n:0;}
function byDate(i){return stored.filter(e=>e.item_id===i.id).sort((a,b)=>String(a.planned_month).localeCompare(String(b.planned_month)))[0];}
function lastCompleted(o){
 const completed=stored.filter(e=>e.item_id===o.item.id&&e.status==="completed"&&e.planned_date&&String(e.planned_date)<=o.scheduled);
 completed.sort((a,b)=>String(b.planned_date).localeCompare(String(a.planned_date)));
 return completed[0]?.planned_date||"";
}
function nextCardDate(o){
 if(o.event.status==="completed")return interval(o.item)?addMonths(o.scheduled,interval(o.item)):"";
 return o.event.planned_date||o.scheduled;
}
function schedule(y){
 const targetYear=Number(y),result=[],known=new Map(),first=new Map();
 for(const e of stored){
  known.set(e.event_key,e);
  const prev=first.get(e.item_id);
  if(!prev||String(e.planned_month)<String(prev.planned_month))first.set(e.item_id,e);
 }
 for(const i of items){
  if(i.deleted_at)continue;
  const base=first.get(i.id);if(!base)continue;
  const origin=String(base.planned_date||String(base.planned_month).slice(0,7)+"-01");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(origin))continue;
  const n=interval(i),originMonth=Number(origin.slice(0,4))*12+Number(origin.slice(5,7))-1;
  const targetStart=targetYear*12,targetEnd=targetStart+11;
  const firstK=n?Math.max(0,Math.ceil((targetStart-originMonth)/n)):0;
  const lastK=n?Math.floor((targetEnd-originMonth)/n):0;
  for(let k=firstK;k<=lastK;k++){
   const date=k===0?origin:addMonths(origin,k*n);
   if(!date||Number(date.slice(0,4))!==targetYear)continue;
   const key=i.plan_code+":"+date.slice(0,7),real=known.get(key)||null;
   result.push({item:i,event:real||{item_id:i.id,building_id:B,event_key:key,planned_month:monthISO(date),planned_date:date,status:"planned",result_note:"",completed_by:"",image_paths:[]},virtual:!real,scheduled:date});
  }
 }
 return result.sort((a,b)=>String(a.event.planned_date||a.scheduled).localeCompare(String(b.event.planned_date||b.scheduled))||a.item.work_title.localeCompare(b.item.work_title,"vi"));
}
const isoToday=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
const demo=i=>String(i?.source_notes||"").startsWith("MẪU");
const dateOf=o=>String(o.event.due_date||o.event.planned_date||o.scheduled).slice(0,10);
function stateKey(o){
 const st=String(o.event.status||"planned");
 if(st==="completed")return "done";
 if(st==="cancelled"||st==="skipped")return "cancelled";
 if(st==="postponed")return "postponed";
 if(st==="awaiting_approval")return "review";
 if(st==="in_progress")return "working";
 if(dateOf(o)<isoToday())return "late";
 return "planned";
}
const stateNames={done:"Hoàn thành",cancelled:"Hủy",postponed:"Hoãn",review:"Chờ duyệt",working:"Đang thực hiện",late:"Quá hạn",planned:"Chưa thực hiện"};
function status(o){const k=stateKey(o);return [stateNames[k],k]}
function scopeEvents(events){
 const choice=$("m130SampleFilter")?.value||"all";
 return events.filter(o=>choice==="all"||(choice==="real"?!demo(o.item):demo(o.item)));
}
function countsFor(events){
 const counts={planned:0,working:0,review:0,done:0,late:0,postponed:0,cancelled:0};
 for(const o of events)counts[stateKey(o)]+=1;
 return counts;
}
function kpiHtml(events){
 const c=countsFor(events),today=isoToday(),weekEnd=new Date(today+"T12:00:00");
 weekEnd.setDate(weekEnd.getDate()+7);
 const limit=weekEnd.getFullYear()+"-"+pad(weekEnd.getMonth()+1)+"-"+pad(weekEnd.getDate());
 const todayCount=events.filter(o=>dateOf(o)===today).length,weekCount=events.filter(o=>dateOf(o)>=today&&dateOf(o)<=limit).length;
 const eligible=events.filter(o=>o.event.status==="completed"&&o.event.finished_at);
 const onTime=eligible.filter(o=>String(o.event.finished_at).slice(0,10)<=dateOf(o)).length;
 const timely=eligible.length?Math.round(onTime/eligible.length*100)+"%":"—";
 const pair=[[c.late,"Quá hạn","late"],[todayCount,"Hôm nay","today"],[weekCount,"7 ngày tới","week"],[c.review,"Chờ duyệt","review"],[timely,"Đúng hạn","done"]];
 $("m130Stats").innerHTML=pair.map(x=>'<div class="m130Kpi '+x[2]+'"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("");
 const parts=[["Chưa thực hiện",c.planned],["Đang thực hiện",c.working],["Chờ duyệt",c.review],["Hoàn thành",c.done],["Quá hạn",c.late],["Hoãn / Hủy",c.postponed+c.cancelled]];
 $("m130StatusSummary").innerHTML='<strong>Tổng '+events.length+' công việc</strong> · '+parts.map(([name,num])=>'<span>'+name+': <b>'+num+'</b></span>').join("");
 const real=events.filter(o=>!demo(o.item)),pm=real.filter(o=>o.item.work_type!=="CM").length,cm=real.filter(o=>o.item.work_type==="CM").length;
 const cost=real.reduce((sum,o)=>sum+Number(o.event.labor_cost||0)+Number(o.event.material_cost||0),0);
 const money=new Intl.NumberFormat("vi-VN").format(cost);
 $("m130AdvancedKpis").innerHTML='<div><b>PM / CM</b><strong>'+pm+' / '+cm+'</strong></div><div><b>Chi phí đã nhập</b><strong>'+money+' đ</strong></div><div><b>MTTR</b><strong>—</strong><small>Cần dữ liệu sửa chữa CM có thời gian khôi phục</small></div><div><b>MTBF</b><strong>—</strong><small>Cần lịch sử hỏng theo mã thiết bị</small></div>';
}
function ensure(){
 if($("maint130"))return;
 const page=$("maintenancePage"),anchor=page?.querySelector(".maintenanceSchedule");
 if(!page||!anchor)return;
 const root=document.createElement("section");root.id="maint130";
 root.innerHTML='<div class="m130Header"><div><small>ESTA · 130 HỒNG HÀ · QUẢN LÝ BẢO TRÌ</small><h2>Kế hoạch công việc theo tháng</h2><p>Công việc mẫu được đánh dấu riêng. Lịch lặp theo tháng lịch, không tự xác nhận hoàn thành.</p></div><div class="m130Actions"><button type="button" id="m130Pdf">↓ Xuất PDF</button></div></div>'+
 '<div class="m130Stats" id="m130Stats"></div><div class="m130StatusSummary" id="m130StatusSummary"></div><details class="m130ExtraStats"><summary>Chỉ số PM/CM · Chi phí · MTTR/MTBF</summary><div id="m130AdvancedKpis"></div></details><div class="m130Cal"><div class="m130Year"><button type="button" id="m130Prev" aria-label="Năm trước">‹</button><b id="m130Year">Năm 2026</b><button type="button" id="m130Next" aria-label="Năm sau">›</button></div><div class="m130Months" id="m130Months"></div></div>'+
 '<div class="m130Toolbar"><input id="m130Search" type="search" placeholder="Tìm nội dung, vị trí, hệ thống..." aria-label="Tìm công việc bảo trì"><select id="m130Group"><option value="">Tất cả hệ thống</option></select><select id="m130State"><option value="">Tất cả trạng thái</option><option value="planned">Chưa thực hiện</option><option value="working">Đang thực hiện</option><option value="review">Chờ duyệt</option><option value="done">Hoàn thành</option><option value="late">Quá hạn</option><option value="cancelled">Hoãn / Hủy</option></select><select id="m130PriorityFilter"><option value="">Mọi ưu tiên</option><option value="normal">Bình thường</option><option value="high">Cao</option><option value="urgent">Khẩn cấp</option></select><select id="m130TypeFilter"><option value="">PM + CM</option><option value="PM">PM</option><option value="CM">CM</option></select><select id="m130TechnicianFilter"><option value="">Mọi KTV</option></select><select id="m130SampleFilter"><option value="all">Tất cả dữ liệu</option><option value="real">Chỉ công việc thật</option><option value="sample">Chỉ dữ liệu mẫu</option></select></div>'+
 '<div class="m130ListTop"><div class="m130Heading"><b id="m130ListTitle">Công việc theo tháng</b><small id="m130ListCount"></small></div><div class="m130ListTools"><button type="button" id="m130Create" class="m130AddButton">＋ Thêm bảo trì</button><div class="m130ViewSwitch" role="group" aria-label="Chọn cách hiển thị"><button type="button" data-m130-view="cards" aria-pressed="true">▦ Thẻ</button><button type="button" data-m130-view="rows" aria-pressed="false">☰ Dòng</button></div><div class="m130LayoutSwitch" role="group" aria-label="Chế độ xem lịch"><button type="button" data-m130-layout="list" aria-pressed="true">Danh sách</button><button type="button" data-m130-layout="calendar" aria-pressed="false">Lịch</button><button type="button" data-m130-layout="timeline" aria-pressed="false">Timeline</button></div><button type="button" id="m130Legacy" aria-expanded="false">Thiết bị / nhật ký <span>⌄</span></button></div></div><div class="m130List" id="m130List"></div>';
 anchor.parentNode.insertBefore(root,anchor);
 const overlay=document.createElement("div");overlay.id="m130Overlay";overlay.hidden=true;overlay.innerHTML='<div class="m130Dialog"><div class="m130ModalHead"><h3 id="m130ModalTitle">Công việc bảo trì</h3><button type="button" id="m130Close" aria-label="Đóng">×</button></div><form id="m130PlanForm" hidden>'+
 '<label>Nội dung công việc *<textarea id="m130Title" rows="2" required maxlength="500"></textarea></label><div class="m130Two"><label>Hệ thống<select id="m130System"><option>HVAC</option><option>Điện</option><option>PCCC</option><option>Cấp thoát nước</option><option>Máy phát điện</option><option>Thang máy</option><option>Chiếu sáng</option><option>Camera & an ninh</option><option>Khác</option></select></label><label>Vị trí<input id="m130Location" maxlength="160" placeholder="Tầng / khu vực"></label></div><div class="m130Two"><label>Mã thiết bị<input id="m130AssetCode" maxlength="80" placeholder="VD: PCCC-001"></label><label>Loại bảo trì<select id="m130WorkType"><option value="PM">PM · Phòng ngừa</option><option value="CM">CM · Khắc phục</option></select></label></div><label>Mức ưu tiên<select id="m130Priority"><option value="normal">Bình thường</option><option value="high">Cao</option><option value="urgent">Khẩn cấp</option></select></label>'+
 '<div class="m130Two"><label>Ngày bắt đầu chu kỳ *<input type="date" id="m130First" required></label><label>Chu kỳ (tháng)<input type="number" id="m130Cycle" min="0" max="120" step="1" value="0" required></label></div><p class="m130Hint" id="m130NextHint">0 = không lặp. Ví dụ 10/10/2026 + 3 tháng → 10/01/2027 → 10/04/2027.</p><label>Tên kỹ thuật / người phụ trách *<input id="m130Assignee" list="m130PeopleOptions" maxlength="120" placeholder="Chọn tên kỹ thuật viên..." required></label><div class="m130PersonQuick" id="m130AssigneeQuick"></div><div class="m130Foot"><button type="button" data-m130-cancel>Hủy</button><button type="submit">Lưu kế hoạch</button></div></form>'+
 '<form id="m130EventForm" hidden><p id="m130EventInfo" class="m130Hint"></p><p id="m130ResultTip" class="m130CompleteTip" aria-live="polite">Hoàn thành cần đủ minh chứng.</p><div class="m130Two"><label>Ngày dự kiến<input id="m130EventDate" type="date" required></label><label>Trạng thái<select id="m130EventStatus"><option value="planned">Chưa thực hiện</option><option value="in_progress">Đang thực hiện</option><option value="awaiting_approval">Chờ duyệt</option><option value="completed">Hoàn thành</option><option value="postponed">Hoãn</option><option value="cancelled">Hủy</option></select></label></div><label>Kỹ thuật viên thực hiện *<input id="m130Who" list="m130PeopleOptions" maxlength="120" placeholder="Chọn tên KTV..." autocomplete="off"></label><div class="m130PersonQuick" id="m130WhoQuick"></div><div class="m130Two"><label>Bắt đầu lúc<input id="m130StartAt" type="datetime-local"></label><label>Kết thúc lúc<input id="m130EndAt" type="datetime-local"></label></div><label>Kết quả kiểm tra<select id="m130ResultCode"><option value="">— Chọn kết quả —</option><option value="pass">Đạt</option><option value="fail">Không đạt</option><option value="monitor">Cần theo dõi</option></select></label><label>Kết quả thực hiện / ghi chú<textarea id="m130Result" rows="3" maxlength="2000" placeholder="Ghi nhận thực tế và hướng xử lý"></textarea></label><label>Lý do hoãn / hủy<input id="m130PostponeReason" maxlength="600" placeholder="Bắt buộc nếu Hoãn hoặc Hủy"></label><div class="m130PhotoFields"><label>Ảnh trước bảo trì<input id="m130BeforePhotos" type="file" accept="image/*" multiple></label><label>Ảnh sau bảo trì<input id="m130AfterPhotos" type="file" accept="image/*" multiple></label></div><div id="m130PhotoPreview" class="m130PhotoPreview"></div><p class="m130Hint">Hoàn thành bắt buộc: KTV, thời gian bắt đầu/kết thúc, kết quả Đạt/Không đạt/Cần theo dõi, ghi chú và ít nhất 1 ảnh trước hoặc sau.</p><div class="m130Foot"><button type="button" data-m130-cancel>Hủy</button><button type="submit">Lưu công việc</button></div></form><datalist id="m130PeopleOptions"></datalist></div>';
 document.body.appendChild(overlay);
 $("m130Prev").onclick=()=>{year=Math.max(2020,year-1);render();};
 $("m130Next").onclick=()=>{year=Math.min(2100,year+1);render();};
 $("m130Create").onclick=()=>openPlan();
 $("m130Pdf").onclick=exportPdf;
 $("m130Legacy").onclick=()=>{const opened=page.classList.toggle("maint130-assets-open");$("m130Legacy").setAttribute("aria-expanded",String(opened));if(opened&&typeof loadMaintenanceData==="function")loadMaintenanceData(B);};
 ["m130Search","m130Group","m130State","m130PriorityFilter","m130TypeFilter","m130TechnicianFilter","m130SampleFilter"].forEach(id=>$(id).addEventListener(id==="m130Search"?"input":"change",()=>{if(id==="m130SampleFilter")render();else renderList()}));
 root.addEventListener("keydown",ev=>{const r=ev.target.closest("[data-m130-open]");if(r&&ev.target===r&&(ev.key==="Enter"||ev.key===" ")){ev.preventDefault();openEvent(r.dataset.m130Open);}});
 root.addEventListener("dragstart",ev=>{
  const chip=ev.target.closest("[data-m130-drag]");
  if(chip&&ev.dataTransfer)ev.dataTransfer.setData("text/plain",chip.dataset.m130Drag);
 });
 root.addEventListener("dragover",ev=>{if(ev.target.closest("[data-m130-date]"))ev.preventDefault();});
 root.addEventListener("drop",ev=>{
  const cell=ev.target.closest("[data-m130-date]");
  if(!cell||!ev.dataTransfer)return;ev.preventDefault();
  const key=ev.dataTransfer.getData("text/plain");if(key)rescheduleOccurrence(key,cell.dataset.m130Date);
 });
 root.addEventListener("click",ev=>{
  const v=ev.target.closest("[data-m130-view]"),l=ev.target.closest("[data-m130-layout]"),m=ev.target.closest("[data-m130-month]"),e=ev.target.closest("[data-m130-event]"),p=ev.target.closest("[data-m130-plan]"),del=ev.target.closest("[data-m130-delete]");
  if(v){
   viewMode=v.dataset.m130View==="rows"?"rows":"cards";
   try{localStorage.setItem(VIEW_KEY,viewMode)}catch(_){}
   renderList();
  }
  else if(l){layoutMode=l.dataset.m130Layout==="calendar"?"calendar":l.dataset.m130Layout==="timeline"?"timeline":"list";renderList();}
  else if(m){month=Number(m.dataset.m130Month);render();}
  else if(e)openEvent(e.dataset.m130Event);
  else if(p)openPlan(p.dataset.m130Plan);
  else if(del)deletePlan(del.dataset.m130Delete);
  else{
   const row=ev.target.closest("[data-m130-open]");
   if(row)openEvent(row.dataset.m130Open);
  }
 });
 overlay.addEventListener("click",ev=>{
  const b=ev.target.closest("[data-m130-person-target]");
  if(!b)return;
  const input=$(b.dataset.m130PersonTarget);
  if(input){input.value=b.dataset.m130PersonName;input.dispatchEvent(new Event("input",{bubbles:true}));}
 });
 $("m130Close").onclick=closeDialog;
 overlay.querySelectorAll("[data-m130-cancel]").forEach(b=>b.onclick=closeDialog);
 overlay.addEventListener("click",ev=>{if(ev.target===overlay)closeDialog();});
 $("m130PlanForm").onsubmit=savePlan;
 $("m130EventForm").onsubmit=saveEvent;
 $("m130Result").addEventListener("input",()=>{
  const st=$("m130EventStatus");
  if($("m130Result").value.trim()&&st.value==="planned")st.value="awaiting_approval";
  $("m130ResultTip").textContent="Đã ghi nhận kết quả. Kiểm tra KTV, thời gian và ảnh trước khi chuyển Hoàn thành.";
 });
 $("m130EventStatus").addEventListener("change",()=>{$("m130ResultTip").textContent=$("m130EventStatus").value==="completed"?"Hoàn thành bắt buộc có KTV, thời gian, kết quả và ảnh.":"Chọn đúng tiến độ thực tế; quá hạn tính tự động.";});
 ["m130BeforePhotos","m130AfterPhotos"].forEach(id=>$(id).addEventListener("change",()=>{const box=$("m130PhotoPreview");box.querySelector(".m130SelectedCount")?.remove();const node=document.createElement("p");node.className="m130SelectedCount";node.textContent=([...$("m130BeforePhotos").files,...$("m130AfterPhotos").files].length)+" ảnh mới sẽ được tải khi lưu.";box.prepend(node);}));
 ["m130Cycle","m130First"].forEach(id=>$(id).addEventListener("input",hint));
}
function show(){
 ensure();
 const yes=active(),page=$("maintenancePage");
 $("maint130").hidden=!yes;page?.classList.toggle("maint130-mode",yes);
 if(!yes)page?.classList.remove("maint130-assets-open");
 return yes;
}
function hint(){
 const start=$("m130First").value,n=Number($("m130Cycle").value);
 $("m130NextHint").textContent=n>0&&start?"Lịch kế tiếp: "+fmt(addMonths(start,n))+" → "+fmt(addMonths(start,n*2))+"; giữ nguyên ngày lịch khi chuyển năm.":"Chu kỳ 0 tháng: công việc chỉ xuất hiện một lần.";
}
function render(){
 if(!show()||!ready)return;
 const all=getYearSchedule(year),subset=all.filter(o=>Number(o.scheduled.slice(5,7))===month);
 kpiHtml(scopeEvents(subset));
 $("m130Year").textContent="Năm "+year;
 $("m130Months").innerHTML=Array.from({length:12},(_,idx)=>{const m=idx+1,count=all.filter(o=>Number(o.scheduled.slice(5,7))===m).length;return '<button type="button" data-m130-month="'+m+'" class="'+(m===month?"sel":"")+'"><small>Th '+pad(m)+'</small><b>'+count+'</b></button>';}).join("");
 const groups=[...new Set(items.map(i=>i.system_group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi")),select=$("m130Group"),old=select.value;
 if(select.options.length!==groups.length+1||groups.some(g=>![...select.options].some(o=>o.value===g))){select.innerHTML='<option value="">Tất cả hệ thống</option>'+groups.map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join("");select.value=old;}
 renderList();
}
function renderList(){
 if(!show()||!ready)return;
 const subset=scopeEvents(getYearSchedule(year).filter(o=>Number(o.scheduled.slice(5,7))===month)); const q=$("m130Search").value.trim().toLocaleLowerCase("vi-VN"),g=$("m130Group").value,s=$("m130State").value;
 const visible=subset.filter(o=>(!g||o.item.system_group===g)&&(!s||(s==="late"?stateKey(o)==="late":s==="cancelled"?(stateKey(o)==="cancelled"||stateKey(o)==="postponed"):stateKey(o)===s))&&(!q||[o.item.work_title,o.item.system_group,o.item.subsystem,o.item.asset_code,o.item.assigned_to].join(" ").toLocaleLowerCase("vi-VN").includes(q))&&(!$("m130PriorityFilter").value||o.item.priority===$("m130PriorityFilter").value)&&(!$("m130TypeFilter").value||o.item.work_type===$("m130TypeFilter").value)&&(!$("m130TechnicianFilter").value||String(o.event.completed_by||o.item.assigned_to)===$("m130TechnicianFilter").value));
 $("m130ListTitle").textContent="Công việc tháng "+pad(month)+"/"+year;
 $("m130ListCount").textContent=visible.length+" / "+subset.length+" công việc";
 const isCards=viewMode==="cards",list=$("m130List");
 list.classList.toggle("m130CardsMode",isCards);
 list.classList.toggle("m130RowsMode",!isCards);
 $("maint130").querySelectorAll("[data-m130-view]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.m130View===viewMode)));
 $("maint130").querySelectorAll("[data-m130-layout]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.m130Layout===layoutMode)));
 if(layoutMode!=="list"){renderAlternative(visible);return;}
 list.innerHTML=visible.map(o=>{
  const e=o.event,i=o.item,st=status(o),key=esc(e.event_key),demo=String(i.source_notes||"").startsWith("MẪU");
  const cycle=interval(i),cycleText=cycle?cycle+" tháng":"Một lần",location=esc(i.subsystem||"Chưa ghi vị trí");
  if(!isCards){
   return '<article class="m130Entry m130CompactRow m130State-'+st[1]+'" data-m130-open="'+key+'" role="button" tabindex="0" aria-label="Xem công việc '+esc(i.work_title)+'">'+
    '<div class="m130Date"><b>'+fmt(e.planned_date||o.scheduled).slice(0,5)+'</b><small>'+year+'</small></div>'+
    '<div class="m130EntryBody"><div class="m130Pills"><span class="m130Sys">'+esc(i.system_group)+'</span><span class="m130Badge '+st[1]+'">'+st[0]+'</span>'+(demo?'<span class="m130Sample">MẪU</span>':'')+(cycle?'<span class="m130Cycle">↻ '+cycleText+'</span>':'')+'</div>'+
    '<h4>'+esc(i.work_title)+'</h4><p>'+(i.asset_code?'Mã TB: '+esc(i.asset_code)+' · ':'')+location+' · Hạn: '+fmt(dateOf(o))+' · Ưu tiên: '+esc(({normal:"Bình thường",high:"Cao",urgent:"Khẩn cấp"})[i.priority]||"Bình thường")+' · <strong>KT: '+esc(personLabel(e.completed_by||i.assigned_to))+'</strong></p>'+(e.result_note?'<p class="m130Result"><b>KQ:</b> '+esc(e.result_note)+'</p>':'')+'</div>'+
    '<div class="m130EntryActions"><button type="button" data-m130-event="'+key+'" '+(canWrite()?"":"disabled")+'>'+(e.status==="completed"?"Xem KQ":"Ghi bảo trì")+'</button><button type="button" class="m130Edit" data-m130-plan="'+esc(i.id)+'" '+(canWrite()?"":"disabled")+'>Sửa</button></div></article>';
  }
  const done=lastCompleted(o),upcoming=nextCardDate(o);
  const record=esc(e.event_key),editable=canWrite()?"":"disabled";
  return '<article class="m130ServiceCard m130State-'+st[1]+'">'+
   '<div class="m130CardHead"><span class="m130SystemLabel">'+esc(i.system_group)+'</span><div class="m130TopTags">'+(demo?'<span class="m130SampleTag">MẪU</span>':'')+'<span class="m130CardStatus '+st[1]+'">'+st[0]+'</span></div></div>'+
   '<h3>'+esc(i.work_title)+'</h3><p class="m130CardLocation">'+(i.asset_code?'Mã TB: '+esc(i.asset_code)+' · ':'')+location+' · Lịch kỳ này: '+fmt(e.planned_date||o.scheduled)+'</p>'+
   '<div class="m130CardMetrics"><div><small>Gần nhất</small><strong>'+fmt(done)+'</strong></div><div><small>Kế tiếp</small><strong>'+fmt(upcoming)+'</strong></div><div><small>Chu kỳ</small><strong>'+esc(cycleText)+'</strong></div></div>'+
   '<div class="m130CardMeta"><span>Kỹ thuật: <b>'+esc(personLabel(e.completed_by||i.assigned_to))+'</b></span><span>Trạng thái: <b>'+st[0]+'</b></span></div>'+
   (e.result_note?'<p class="m130CardResult"><b>KQ:</b> '+esc(e.result_note)+'</p>':'')+
   '<div class="m130CardFoot"><button type="button" class="m130RecordBtn" data-m130-event="'+record+'" '+editable+'>'+(e.status==="completed"?"✓ Xem / sửa KQ":"＋ Ghi bảo trì")+'</button><button type="button" class="m130PlanBtn" data-m130-plan="'+esc(i.id)+'" '+editable+'>Sửa</button><button type="button" class="m130DeleteBtn" title="Xóa kế hoạch (có xác nhận)" aria-label="Xóa kế hoạch '+esc(i.work_title)+'" data-m130-delete="'+esc(i.id)+'" '+editable+'>×</button></div></article>';
 }).join("")||'<p class="m130Empty">Không có công việc trong tháng và bộ lọc này.</p>';
 $("m130Create").disabled=!canWrite();
}
function renderAlternative(events){
 const list=$("m130List");
 list.classList.remove("m130CardsMode","m130RowsMode");
 if(layoutMode==="timeline"){
  list.innerHTML='<div class="m130Timeline">'+events.map(o=>{
   const st=status(o),key=esc(o.event.event_key);
   return '<button type="button" data-m130-event="'+key+'" class="m130TimelineItem '+st[1]+'"><time>'+fmt(dateOf(o))+'</time><span><b>'+esc(o.item.work_title)+'</b><small>'+esc(o.item.system_group)+' · '+esc(personLabel(o.event.completed_by||o.item.assigned_to))+'</small></span><em>'+st[0]+'</em></button>';
  }).join("")+'</div>';
  return;
 }
 const firstDay=new Date(year,month-1,1).getDay(),offset=(firstDay+6)%7,days=new Date(year,month,0).getDate();
 const headings=['T2','T3','T4','T5','T6','T7','CN'];
 const cells=Array.from({length:offset},()=>'<div class="m130CalendarBlank"></div>');
 for(let day=1;day<=days;day++){
  const date=year+"-"+pad(month)+"-"+pad(day);
  const chips=events.filter(o=>dateOf(o)===date).map(o=>{
   const key=esc(o.event.event_key),st=stateKey(o);
   return '<button type="button" draggable="'+(canWrite()&&o.event.status!=="completed"?"true":"false")+'" data-m130-event="'+key+'" data-m130-drag="'+key+'" class="m130CalendarChip '+st+'">'+esc(o.item.work_title)+'</button>';
  }).join("");
  cells.push('<div class="m130CalendarDay" data-m130-date="'+date+'"><b>'+day+'</b>'+chips+'</div>');
 }
 list.innerHTML='<div class="m130CalendarWrap"><p>Chọn công việc để cập nhật. Trên máy tính có thể kéo công việc chưa hoàn thành sang ngày khác trong cùng tháng.</p><div class="m130CalendarGrid">'+headings.map(n=>'<strong class="m130CalendarWeek">'+n+'</strong>').join("")+cells.join("")+'</div></div>';
}
async function rescheduleOccurrence(key,date){
 if(busy||!canWrite()||!active())return;
 const o=getYearSchedule(year).find(x=>x.event.event_key===key);
 if(!o||o.event.status==="completed"||date.slice(0,7)!==o.scheduled.slice(0,7))return toast("Chỉ đổi lịch việc chưa hoàn thành trong cùng tháng.");
 if(date===dateOf(o))return;
 if(!confirm("Chuyển lịch "+o.item.work_title+" sang "+fmt(date)+"? Nếu là ngày đầu chu kỳ, các kỳ lặp tương lai cũng sẽ tính lại."))return;
 busy=true;
 try{
  const token=centralSession.access_token,id=o.virtual?crypto.randomUUID():o.event.id;
  if(o.virtual){
   const event={id,item_id:o.item.id,building_id:B,event_key:key,planned_month:monthISO(date),planned_date:date,due_date:date,location:o.item.subsystem||"",status:"planned",source_kind:"year"};
   await sbFetch("/rest/v1/esta_maintenance_plan_occurrences",{method:"POST",token,body:event});
   stored.push(event);
  }else{
   await sbFetch("/rest/v1/esta_maintenance_plan_occurrences?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"PATCH",token,body:{planned_date:date,due_date:date,updated_at:new Date().toISOString()}});
   stored=stored.map(e=>e.id===id?{...e,planned_date:date,due_date:date}:e);
  }
  clearScheduleCache();render();toast("Đã đổi lịch sang "+fmt(date));
 }catch(err){toast("Không đổi được lịch: "+(err.message||err));}
 finally{busy=false;}
}
async function load(force){
 if(!show()||busy||!centralSession?.access_token)return;
 if(ready&&!force){render();return;}
 busy=true;$("m130List").innerHTML='<p class="m130Empty">Đang tải dữ liệu bảo trì...</p>';
 try{
  const token=centralSession.access_token,[i,e,persons]=await Promise.all([
   sbFetch("/rest/v1/esta_maintenance_plan_items?select=*&building_id=eq."+B+"&order=created_at.asc",{token}),
   sbFetch("/rest/v1/esta_maintenance_plan_occurrences?select=*&building_id=eq."+B+"&order=planned_month.asc,planned_date.asc",{token}),
   sbFetch("/rest/v1/building_people?select=name&building_id=eq."+B+"&order=name.asc",{token}).catch(()=>[])
  ]);
  if(!active())return;
  items=Array.isArray(i)?i:[];stored=Array.isArray(e)?e:[];people=Array.isArray(persons)?persons.map(p=>String(p.name||"").trim()).filter(Boolean):[];clearScheduleCache();renderPersonPickers();const staff=$("m130TechnicianFilter"),oldStaff=staff.value;staff.innerHTML='<option value="">Mọi KTV</option>'+peopleOptions().map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");staff.value=oldStaff;ready=true;render();
 }catch(err){$("m130List").textContent="Không tải được kế hoạch: "+(err.message||err);}
 finally{busy=false;}
}
function closeDialog(){$("m130Overlay").hidden=true;currentPlan=null;currentEvent=null;}
function openPlan(id){
 if(!canWrite())return;
 currentPlan=id?items.find(i=>i.id===id):null;
 const i=currentPlan,base=i?byDate(i):null;
 $("m130ModalTitle").textContent=i?"Chỉnh sửa kế hoạch":"Thêm công việc bảo trì";
 $("m130PlanForm").hidden=false;$("m130EventForm").hidden=true;
 $("m130Title").value=i?.work_title||"";
 $("m130System").value=i?.system_group||"HVAC";
 $("m130Location").value=i?.subsystem||"";
 $("m130AssetCode").value=i?.asset_code||"";
 $("m130WorkType").value=i?.work_type||"PM";
 $("m130Priority").value=i?.priority||"normal";
 $("m130First").value=base?.planned_date||base?.planned_month||year+"-"+pad(month)+"-10";
 $("m130First").readOnly=!!i;
 $("m130Cycle").value=interval(i);
 $("m130Assignee").value=i?.assigned_to&&i.assigned_to!=="Kỹ thuật"&&i.assigned_to!=="Kỹ thuật dự án"?i.assigned_to:"";
 renderPersonPickers();
 hint();$("m130Overlay").hidden=false;
}
async function savePlan(ev){
 ev.preventDefault();if(busy||!active()||!canWrite())return;
 const title=$("m130Title").value.trim(),date=$("m130First").value,n=Number($("m130Cycle").value),assignee=$("m130Assignee").value.trim();
 if(!title||!date||!Number.isInteger(n)||n<0||n>120)return toast("Kiểm tra nội dung, ngày và chu kỳ (0–120 tháng).");
 if(!assignee)return toast("Hãy chọn hoặc nhập tên kỹ thuật / người phụ trách.");
 busy=true;const btn=$("m130PlanForm").querySelector("[type=submit]");btn.disabled=true;
 try{
  const token=centralSession.access_token,fields={work_title:title,system_group:$("m130System").value,subsystem:$("m130Location").value.trim(),assigned_to:assignee,asset_code:$("m130AssetCode").value.trim(),work_type:$("m130WorkType").value,priority:$("m130Priority").value,cadence:n?n+" tháng":"Không lặp"};
  if(currentPlan){
   const id=currentPlan.id;
   await sbFetch("/rest/v1/esta_maintenance_plan_items?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"PATCH",token,body:fields});
   items=items.map(x=>x.id===id?{...x,...fields}:x);
  }else{
   const id=crypto.randomUUID(),eventId=crypto.randomUUID(),code="130HH-USER-"+id.slice(0,13);
   const item={id,building_id:B,plan_year:Number(date.slice(0,4)),plan_code:code,plan_months:[Number(date.slice(5,7))],plan_status:"Có lịch",source_notes:"Bổ sung từ trang Bảo trì 130 HH",...fields};
   await sbFetch("/rest/v1/esta_maintenance_plan_items",{method:"POST",token,body:item});
   const occurrence={id:eventId,item_id:id,building_id:B,event_key:code+":"+date.slice(0,7),planned_month:monthISO(date),planned_date:date,status:"planned",source_kind:"year",location:fields.subsystem};
   try{await sbFetch("/rest/v1/esta_maintenance_plan_occurrences",{method:"POST",token,body:occurrence});}
   catch(error){
    try{await sbFetch("/rest/v1/esta_maintenance_plan_items?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"DELETE",token});}catch(_){}
    throw error;
   }
   items.push(item);stored.push(occurrence);
   year=Number(date.slice(0,4));month=Number(date.slice(5,7));
  }
  clearScheduleCache();closeDialog();render();toast("✓ Đã lưu kế hoạch bảo trì");
 }catch(err){toast("Không lưu được: "+(err.message||err));}
 finally{busy=false;btn.disabled=false;}
}
function localDatetime(iso){
 if(!iso)return "";
 const d=new Date(iso);if(!Number.isFinite(d.getTime()))return "";
 return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes());
}
function recordedImages(event){
 return Array.isArray(event.image_paths)?event.image_paths.map(x=>typeof x==="string"?{kind:"after",ref:x}:x).filter(x=>x?.ref):[];
}
function showImages(e){
 const box=$("m130PhotoPreview");if(!box)return;
 const photos=recordedImages(e);
 box.innerHTML=photos.map(p=>'<div class="m130SavedPhoto"><small>'+(p.kind==="before"?"Trước":"Sau")+'</small>'+(typeof mediaImgHtml==="function"?mediaImgHtml(p.ref):'<span>Đã lưu ảnh</span>')+'</div>').join("");
 if(typeof hydrateMediaImages==="function")hydrateMediaImages(box).catch(()=>{});
}
function openEvent(key){
 if(!canWrite())return;
 const o=getYearSchedule(year).find(x=>x.event.event_key===key);if(!o)return;
 currentEvent=o;const e=o.event;
 $("m130ModalTitle").textContent=o.item.work_title;
 $("m130PlanForm").hidden=true;$("m130EventForm").hidden=false;
 $("m130EventInfo").textContent=o.item.system_group+" · "+(o.item.subsystem||"")+" · Chu kỳ: "+(interval(o.item)||"không lặp")+" tháng";
 $("m130EventDate").value=e.planned_date||o.scheduled;
 $("m130EventStatus").value=e.status==="skipped"?"cancelled":e.status;
 $("m130ResultTip").textContent=e.status==="completed"&&!e.started_at?"Hồ sơ cũ đã hoàn thành, chưa đủ ảnh và mốc thời gian. Có thể bổ sung minh chứng.":"Hoàn thành yêu cầu KTV, thời gian, kết quả và ảnh.";
 $("m130Who").value=e.completed_by||(personLabel(o.item.assigned_to).includes("Chưa chọn tên")?"":o.item.assigned_to)||"";
 renderPersonPickers();
 $("m130Result").value=e.result_note||"";
 $("m130ResultCode").value=e.result_code||"";
 $("m130StartAt").value=localDatetime(e.started_at);
 $("m130EndAt").value=localDatetime(e.finished_at);
 $("m130PostponeReason").value=e.postpone_reason||"";
 $("m130BeforePhotos").value="";$("m130AfterPhotos").value="";
 showImages(e);
 $("m130Overlay").hidden=false;
}
async function saveEvent(ev){
 ev.preventDefault();
 if(busy||!currentEvent||!canWrite()||!active())return;
 const o=currentEvent,old=o.event,date=$("m130EventDate").value,statusValue=$("m130EventStatus").value;
 const who=$("m130Who").value.trim(),result=$("m130Result").value.trim(),resultCode=$("m130ResultCode").value||null;
 const startText=$("m130StartAt").value,endText=$("m130EndAt").value,reason=$("m130PostponeReason").value.trim();
 const before=[...$("m130BeforePhotos").files],after=[...$("m130AfterPhotos").files],photos=recordedImages(old);
 const legacyComplete=old.status==="completed"&&statusValue==="completed"&&(!old.started_at||!old.result_code);
 if(!date||date.slice(0,7)!==o.scheduled.slice(0,7))return toast("Ngày dự kiến cần nằm trong tháng đang chọn.");
 if(["postponed","cancelled"].includes(statusValue)&&!reason)return toast("Nhập lý do hoãn hoặc hủy.");
 if(statusValue==="completed"&&!legacyComplete){
  if(!who||["Kỹ thuật","Kỹ thuật dự án","Nhà thầu"].includes(who))return toast("Bắt buộc chọn tên kỹ thuật viên thực hiện.");
  if(peopleOptions().length&&!peopleOptions().includes(who))return toast("Chọn KTV từ danh sách nhân sự của dự án.");
  if(!startText||!endText||new Date(endText)<new Date(startText))return toast("Nhập giờ bắt đầu, kết thúc hợp lệ.");
  if(!resultCode||!result)return toast("Chọn Đạt/Không đạt/Cần theo dõi và nhập kết quả thực tế.");
  if(!photos.length&&!before.length&&!after.length)return toast("Cần ít nhất 1 ảnh trước hoặc sau bảo trì.");
 }
 const started_at=startText?new Date(startText).toISOString():null,finished_at=endText?new Date(endText).toISOString():null;
 busy=true;const btn=$("m130EventForm").querySelector("[type=submit]");btn.disabled=true;
 const wasVirtual=o.virtual,id=wasVirtual?crypto.randomUUID():old.id,uploaded=[];
 try{
  if(before.length||after.length){
   if(typeof uploadMediaFiles!=="function")throw Error("Hệ thống tải ảnh chưa sẵn sàng.");
   if(before.length){const refs=await uploadMediaFiles(before,"maintenance-before",id,null,B);uploaded.push(...refs.map(ref=>({kind:"before",ref})));}
   if(after.length){const refs=await uploadMediaFiles(after,"maintenance-after",id,null,B);uploaded.push(...refs.map(ref=>({kind:"after",ref})));}
  }
  const image_paths=[...photos,...uploaded];
  if(statusValue==="completed"&&!legacyComplete&&!image_paths.length)throw Error("Phải có ít nhất một ảnh bảo trì.");
  const fields={planned_date:date,due_date:date,status:statusValue,result_note:result,result_code:resultCode,completed_by:who,started_at,finished_at,postpone_reason:reason,image_paths,completed_at:statusValue==="completed"?(old.completed_at||new Date().toISOString()):null,updated_at:new Date().toISOString()};
  const token=centralSession.access_token;
  if(wasVirtual){
   await sbFetch("/rest/v1/esta_maintenance_plan_occurrences",{method:"POST",token,body:{id,item_id:o.item.id,building_id:B,event_key:old.event_key,planned_month:monthISO(o.scheduled),location:o.item.subsystem||"",source_kind:"year",...fields}});
  }else{
   await sbFetch("/rest/v1/esta_maintenance_plan_occurrences?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"PATCH",token,body:fields});
  }
  const next={...old,...fields,id,item_id:o.item.id,building_id:B};
  if(wasVirtual)stored.push(next);else stored=stored.map(x=>x.id===id?next:x);
  clearScheduleCache();closeDialog();render();
  toast(statusValue==="completed"?"✓ Hoàn thành đã lưu đủ minh chứng":statusValue==="awaiting_approval"?"Đã chuyển Chờ duyệt":"✓ Đã lưu tiến độ bảo trì");
  if(statusValue==="completed"&&resultCode==="fail")toast("Lưu ý: kết quả KHÔNG ĐẠT. Cần xử lý tiếp.");
 }catch(err){toast("Chưa lưu được: "+(err.message||err));}
 finally{busy=false;btn.disabled=false;}
}
async function deletePlan(id){
 if(busy||!canWrite()||!active())return;
 const item=items.find(x=>x.id===id&&!x.deleted_at);if(!item)return;
 if(!confirm('Chuyển kế hoạch "'+item.work_title+'" vào thùng lưu trữ? Kế hoạch sẽ bị ẩn khỏi danh sách nhưng vẫn giữ lịch sử và nhật ký kiểm tra.'))return;
 busy=true;
 try{
  const deleted_at=new Date().toISOString(),token=centralSession.access_token;
  await sbFetch("/rest/v1/esta_maintenance_plan_items?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"PATCH",token,body:{deleted_at,deletion_reason:"Ẩn theo xác nhận trên giao diện bảo trì 130 HH"}});
  items=items.map(x=>x.id===id?{...x,deleted_at}:x);
  clearScheduleCache();render();toast("Đã xóa mềm; lịch sử được giữ trong Audit.");
 }catch(err){toast("Không thể xóa mềm: "+(err.message||err));}
 finally{busy=false;}
}
async function exportPdf(){
 if(!active()||!ready)return;
 if(typeof window.exportGenericEstaPdf!=="function")return toast("Chức năng PDF chưa sẵn sàng.");
 const list=scopeEvents(getYearSchedule(year).filter(o=>Number(o.scheduled.slice(5,7))===month));
 if(!list.length)return toast("Không có công việc để xuất.");
 const rows=list.map((o,k)=>[k+1,o.item.system_group,o.item.work_title,fmt(o.event.planned_date||o.scheduled),status(o)[0],o.item.assigned_to||"Kỹ thuật",[o.item.subsystem,o.event.result_note,interval(o.item)?("Chu kỳ "+interval(o.item)+" tháng"):""].filter(Boolean).join(" · ")]);
 try{await window.exportGenericEstaPdf({title:"BÁO CÁO BẢO TRÌ THIẾT BỊ",sectionLabel:"KẾ HOẠCH BẢO TRÌ 130 HH",tableLabel:"CÔNG VIỆC BẢO TRÌ",periodLabel:"THÁNG "+pad(month)+"/"+year,subtitle:"Công việc mẫu chỉ là minh họa, chưa được xác nhận hoàn thành thực tế.",filename:"ESTA_BaoTri_130HH_"+year+"_Thang"+pad(month)+".pdf",columns:[{label:"STT",weight:.5},{label:"Hệ thống",weight:1.3},{label:"Công việc",weight:2.8},{label:"Ngày",weight:1.2},{label:"Trạng thái",weight:1.3},{label:"Phụ trách",weight:1},{label:"Vị trí / KQ / Chu kỳ",weight:2.4}],rows,summaries:[{value:items.length,label:"KẾ HOẠCH"},{value:list.length,label:"CÔNG VIỆC THÁNG"},{value:list.filter(o=>o.event.status==="completed").length,label:"HOÀN THÀNH"}]});}catch(err){toast(err.message||"Lỗi xuất PDF");}
}
window.mountMaintenance130=()=>{if(active())load();else show();};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{ensure();show();},{once:true});else{ensure();show();}
})();