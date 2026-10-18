(function(){
"use strict";
const PROJECT_IDS=new Set(["130HH","127HH","62THL","68PĐL","NANGCAP"]);
const LINK_BUILDINGS=new Set(["130HH","127HH","62THL","68PĐL"]);
let B="130HH";
const $=id=>document.getElementById(id);
const projectLabel=()=>({"130HH":"130 Hồng Hà","127HH":"127 Hồng Hà","62THL":"62 Trần Huy Liệu","68PĐL":"68 Phan Đăng Lưu","NANGCAP":"Bản nâng cấp"})[B]||B;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const now=new Date();
const viewKey=()=>"esta.maintenance."+B+".view";
function readView(){
 try{const v=localStorage.getItem(viewKey());if(v==="cards"||v==="rows")return v;}catch(_){}
 return typeof window!=="undefined"&&window.matchMedia?.("(max-width:640px)")?.matches?"rows":"cards";
}
let year=now.getFullYear(),month=now.getMonth()+1,items=[],stored=[],people=[],equipmentProfiles=[],systemCatalog=[],ready=false,busy=false,currentEvent=null,currentPlan=null,viewMode=readView(),scheduleCache=null,layoutMode="list",pendingFocusPlanId="";
function clearScheduleCache(){scheduleCache=null}
function getYearSchedule(y){if(scheduleCache?.year===y)return scheduleCache.events;const events=schedule(y);scheduleCache={year:y,events};return events}
function personLabel(value){
 const name=String(value||"").trim();
 if(!name||name==="Kỹ thuật"||name==="Kỹ thuật dự án")return "Kỹ thuật · Chưa chọn tên";
 if(name==="Nhà thầu")return "Nhà thầu · Chưa chọn tên";
 return name;
}
function peopleOptions(){return [...new Set(people.filter(n=>n&&n!=="Nhà thầu"&&n!=="Kỹ thuật dự án"))];}
// Keep the existing text fields (and DB schema) backward compatible. Names are comma separated.
function splitPeople(value){return [...new Set(String(value||"").split(/[,;，]+/).map(n=>n.trim()).filter(Boolean))];}
function selectedPeople(value){return splitPeople(value).join(", ");}
function syncPersonChoices(target){
 const field=$(target),selected=splitPeople(field?.value);
 if(!field)return;
 const buttons=$(target==="m130Assignee"?"m130AssigneeQuick":"m130WhoQuick");
 buttons?.querySelectorAll("[data-m130-person-name]").forEach(button=>{
  const on=selected.includes(button.dataset.m130PersonName);
  button.classList.toggle("selected",on);
  button.setAttribute("aria-pressed",String(on));
 });
 const count=$(target==="m130Assignee"?"m130AssigneeCount":"m130WhoCount");
 if(count)count.textContent=selected.length?("Đã chọn "+selected.length+" người"):"Chọn một hoặc nhiều người bên dưới";
}
function renderPersonPickers(){
 const names=peopleOptions();
 const list=$("m130PeopleOptions");
 if(list)list.innerHTML=names.map(n=>'<option value="'+esc(n)+'"></option>').join("");
 for(const target of ["m130Assignee","m130Who"]){
  const el=$(target==="m130Assignee"?"m130AssigneeQuick":"m130WhoQuick");
  if(!el)continue;
  el.innerHTML=names.map(n=>'<button type="button" data-m130-person-target="'+target+'" data-m130-person-name="'+esc(n)+'" aria-pressed="false">'+esc(n)+'</button>').join("");
  syncPersonChoices(target);
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
function cycleLabel(n){return n===0?"1 lần":n===12?"1 năm":n+" tháng";}
function byDate(i){return stored.filter(e=>e.item_id===i.id).sort((a,b)=>String(a.planned_month).localeCompare(String(b.planned_month)))[0];}
function lastCompleted(o,completedByItem){
 // One sorted index per card render avoids scanning every historical record for each card.
 if(completedByItem){
  for(const date of completedByItem.get(o.item.id)||[])if(date<=o.scheduled)return date;
  return "";
 }
 const completed=stored.filter(e=>e.item_id===o.item.id&&e.status==="completed"&&e.planned_date&&String(e.planned_date)<=o.scheduled);
 completed.sort((a,b)=>String(b.planned_date).localeCompare(String(a.planned_date)));
 return completed[0]?.planned_date||"";
}
function nextCardDate(o){
 if(o.event.status==="completed")return interval(o.item)?addMonths(o.scheduled,interval(o.item)):"";
 return o.event.planned_date||o.scheduled;
}
function schedule(y,sourceItems=items,sourceStored=stored){
 const targetYear=Number(y),result=[],known=new Map(),first=new Map(),grouped=new Map();
 for(const e of sourceStored){
  if(!grouped.has(e.item_id))grouped.set(e.item_id,[]);
  grouped.get(e.item_id).push(e);
  known.set(e.event_key,e);
  const prev=first.get(e.item_id);
  if(!prev||String(e.planned_month)<String(prev.planned_month))first.set(e.item_id,e);
 }
 for(const i of sourceItems){
  if(i.deleted_at)continue;
  // Imported Excel plans can contain explicit records for each month without a day.
  // They must be kept intact; only single-anchor plans use generated recurrence.
  const explicit=grouped.get(i.id)||[];
  if(explicit.length>1&&!interval(i)){
   for(const e of explicit){
    const date=String(e.planned_date||e.planned_month).slice(0,10);
    if(Number(date.slice(0,4))===targetYear)
      result.push({item:i,event:e,virtual:false,scheduled:date});
   }
   continue;
  }
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
const isMonthOnly=o=>!o.virtual&&!o.event.planned_date&&!o.event.due_date;
const dateOf=o=>{
 if(isMonthOnly(o)){
  const ym=String(o.event.planned_month||o.scheduled).slice(0,7),[y,m]=ym.split("-").map(Number);
  if(Number.isInteger(y)&&Number.isInteger(m)&&m>=1&&m<=12)return ym+"-"+pad(new Date(Date.UTC(y,m,0)).getUTCDate());
 }
 return String(o.event.due_date||o.event.planned_date||o.scheduled).slice(0,10);
};
const shownDate=o=>isMonthOnly(o)?"Chưa ấn định ngày":fmt(o.event.planned_date||o.event.due_date||o.scheduled);
function stateKey(o){
 const st=String(o.event.status||"planned");
 if(st==="completed")return "done";
 if(st==="cancelled"||st==="skipped")return "cancelled";
 if(st==="postponed")return "postponed";
 if(st==="awaiting_approval")return "review";
 if(st==="in_progress"&&dateOf(o)<isoToday())return "late";
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
/* The 130HH sidebar badge shares the same recurrence calculation as the maintenance page.
   It counts unfinished occurrences from January of the current year through the next 30 days. */
function maintenance130DueSummary(planItems,occurrences,todayDate,throughDate){
 const startYear=Number(String(todayDate).slice(0,4)),endYear=Number(String(throughDate).slice(0,4));
 if(!Number.isInteger(startYear)||!Number.isInteger(endYear)||endYear<startYear)return {count:0,critical:false};
 const scheduleRows=[];
 for(let yearValue=startYear;yearValue<=Math.min(endYear,startYear+1);yearValue++){
  scheduleRows.push(...schedule(yearValue,planItems,occurrences));
 }
 const actionable=scheduleRows.filter(o=>{
  // A template is not an outstanding real-world maintenance obligation.
  if(demo(o.item))return false;
  if(["completed","cancelled","skipped","postponed"].includes(String(o.event.status||"planned")))return false;
  const due=dateOf(o);
  return due>=String(startYear)+"-01-01"&&due<=throughDate;
 });
 return {count:actionable.length,critical:actionable.some(o=>dateOf(o)<todayDate)};
}
window.estaMaintenance130NavSummary=async function({today:todayDate,soon:throughDate,token,buildingId}){
 const target=PROJECT_IDS.has(String(buildingId||""))?String(buildingId):B;
 const [plans,occurrences]=await Promise.all([
  sbFetch("/rest/v1/esta_maintenance_plan_items?select=id,plan_code,cadence,deleted_at,work_title,source_notes&building_id=eq."+target,{token}),
  sbFetch("/rest/v1/esta_maintenance_plan_occurrences?select=item_id,event_key,planned_month,planned_date,due_date,status&building_id=eq."+target,{token})
 ]);
 return maintenance130DueSummary(Array.isArray(plans)?plans:[],Array.isArray(occurrences)?occurrences:[],todayDate,throughDate);
};
/* Shared read-only schedule model for 130HH Admin PDF. Preserve the same recurrence and month-only semantics as the live maintenance board. */
window.estaMaintenance130ReportRows=function({plans,occurrences,from,to}){
 const p=Array.isArray(plans)?plans:[],o=Array.isArray(occurrences)?occurrences:[];
 const start=Number(String(from||"").slice(0,4)),end=Number(String(to||"").slice(0,4));
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<2020||end>2100||end<start)throw Error("Kỳ báo cáo bảo trì không hợp lệ.");
 const first=o.reduce((min,e)=>{const y=Number(String(e.planned_month||e.planned_date||"").slice(0,4));return Number.isInteger(y)&&y>=2020?Math.min(min,y):min},start);
 if(end-first>12)throw Error("Phạm vi lịch bảo trì quá rộng; vui lòng chọn kỳ báo cáo gần hơn.");
 const result=[];
 for(let y=first;y<=end;y++){
  result.push(...schedule(y,p,o).map(row=>({
   item_id:row.item.id,plan_code:row.item.plan_code,work_title:row.item.work_title,system_group:row.item.system_group,
   is_sample:demo(row.item),
   location:row.item.subsystem,assigned_to:row.item.assigned_to,asset_code:row.item.asset_code,
   equipment_profile_id:row.item.equipment_profile_id,priority:row.item.priority,cadence:row.item.cadence,
   status:row.event.status||"planned",result_code:row.event.result_code,result_note:row.event.result_note,
   completed_by:row.event.completed_by,completed_at:row.event.completed_at,
   planned_date:row.event.planned_date,scheduled_date:row.scheduled,
   due_date:dateOf(row),month_only:isMonthOnly(row),image_paths:row.event.image_paths||[]
  })));
 }
 return result;
};
function notifyMaintenance130Nav(){window.estaRefreshProjectNavAlerts?.();}
function maintenance130Buckets(events,today=isoToday()){
 const weekEnd=new Date(today+"T12:00:00");
 weekEnd.setDate(weekEnd.getDate()+7);
 const upcoming=weekEnd.getFullYear()+"-"+pad(weekEnd.getMonth()+1)+"-"+pad(weekEnd.getDate());
 const counts={late:0,today:0,week:0,later:0,done:0,review:0,paused:0};
 for(const item of events){
  const state=stateKey(item),due=dateOf(item);
  if(state==="done")counts.done++;
  else if(state==="review")counts.review++;
  else if(["cancelled","postponed"].includes(state))counts.paused++;
  else if(due<today)counts.late++;
  else if(due===today)counts.today++;
  else if(due<=upcoming)counts.week++;
  else counts.later++;
 }
 return {total:events.length,counts};
}
function kpiHtml(events){
 // KPI and grouped rows must use exactly the same filtered month occurrences.
 // Include templates in "all" and "sample" views, but never present them as verified real records.
 const today=isoToday(),buckets=maintenance130Buckets(events,today),c=buckets.counts;
 const eligible=events.filter(o=>o.event.status==="completed"&&(o.event.completed_at||o.event.finished_at));
 const onTime=eligible.filter(o=>String(o.event.completed_at||o.event.finished_at).slice(0,10)<=dateOf(o)).length;
 const timely=eligible.length?Math.round(onTime/eligible.length*100)+"%":"—";
 const samples=events.filter(o=>demo(o.item)).length;
 const pair=[[c.late,"Quá hạn","late"],[c.today,"Hôm nay","today"],[c.week,"7 ngày tới","week"],[c.review,"Chờ duyệt","review"],[timely,"Đúng hạn","done"]];
 const stats=$("m130Stats");
 stats.innerHTML=pair.map(x=>'<div class="m130Kpi '+x[2]+'"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("");
 stats.dataset.monthOverview=JSON.stringify({...buckets,onTime:timely,samples,real:events.length-samples});
}

function ensure(){
 if($("maint130"))return;
 const page=$("maintenancePage"),anchor=page?.querySelector(".maintenanceSchedule");
 if(!page||!anchor)return;
 const root=document.createElement("section");root.id="maint130";
 root.innerHTML='<div class="m130Header"><div><small>ESTA · QUẢN LÝ BẢO TRÌ</small><h2>Kế hoạch công việc theo tháng</h2><p>Công việc mẫu được đánh dấu riêng. Lịch lặp theo tháng lịch, không tự xác nhận hoàn thành.</p></div><div class="m130Actions"><button type="button" id="m130Pdf">↓ Xuất PDF</button></div></div>'+
 '<div class="m130Stats" id="m130Stats"></div><div class="m130Cal"><div class="m130Year"><button type="button" id="m130Prev" aria-label="Năm trước">‹</button><b id="m130Year">Năm 2026</b><button type="button" id="m130Next" aria-label="Năm sau">›</button></div><div class="m130Months" id="m130Months"></div></div>'+
 '<div class="m130Toolbar"><input id="m130Search" type="search" placeholder="Tìm nội dung, vị trí, hệ thống..." aria-label="Tìm công việc bảo trì"><select id="m130Group"><option value="">Tất cả hệ thống</option></select><select id="m130State"><option value="">Tất cả trạng thái</option><option value="planned">Chưa thực hiện</option><option value="working">Đang thực hiện</option><option value="review">Chờ duyệt</option><option value="done">Hoàn thành</option><option value="late">Quá hạn</option><option value="cancelled">Hoãn / Hủy</option></select><select id="m130PriorityFilter"><option value="">Mọi ưu tiên</option><option value="normal">Bình thường</option><option value="high">Cao</option><option value="urgent">Khẩn cấp</option></select><select id="m130TypeFilter"><option value="">PM + CM</option><option value="PM">PM</option><option value="CM">CM</option></select><select id="m130TechnicianFilter"><option value="">Mọi KTV</option></select><select id="m130SampleFilter"><option value="all">Tất cả dữ liệu</option><option value="real">Chỉ công việc thật</option><option value="sample">Chỉ dữ liệu mẫu</option></select></div>'+
 '<div class="m130ListTop"><div class="m130Heading"><b id="m130ListTitle">Công việc theo tháng</b><small id="m130ListCount"></small></div><div class="m130ListTools"><button type="button" id="m130Create" class="m130AddButton">＋ Thêm bảo trì</button><div class="m130ViewSwitch" role="group" aria-label="Chọn cách hiển thị"><button type="button" data-m130-view="cards" aria-pressed="true">▦ Thẻ</button><button type="button" data-m130-view="rows" aria-pressed="false">☰ Dòng</button></div><div class="m130LayoutSwitch" role="group" aria-label="Chế độ xem lịch"><button type="button" data-m130-layout="list" aria-pressed="true">Danh sách</button><button type="button" data-m130-layout="calendar" aria-pressed="false">Lịch</button><button type="button" data-m130-layout="timeline" aria-pressed="false">Timeline</button></div><button type="button" id="m130Legacy" aria-expanded="false">Thiết bị / nhật ký <span>⌄</span></button></div></div><div class="m130List" id="m130List"></div><details class="m130AuditPanel"><summary>Nhật ký chỉnh sửa / xóa</summary><button type="button" id="m130AuditButton" class="m130AuditButton">Xem nhật ký</button><div id="m130AuditHistory" aria-live="polite"></div></details>';
 anchor.parentNode.insertBefore(root,anchor);
 const overlay=document.createElement("div");overlay.id="m130Overlay";overlay.hidden=true;overlay.innerHTML='<div class="m130Dialog"><div class="m130ModalHead"><h3 id="m130ModalTitle">Công việc bảo trì</h3><button type="button" id="m130Close" aria-label="Đóng">×</button></div><p id="m130SaveError" class="m130SaveError" role="alert" aria-live="assertive" hidden></p><form id="m130PlanForm" hidden>'+
 '<label>Nội dung công việc *<textarea id="m130Title" rows="2" required maxlength="500"></textarea></label><div class="m130Two"><label>Hệ thống<select id="m130System"><option>HVAC</option><option>Điện</option><option>PCCC</option><option>Cấp thoát nước</option><option>Máy phát điện</option><option>Thang máy</option><option>Chiếu sáng</option><option>Camera & an ninh</option><option>Kiểm soát ra vào</option><option>Thông gió</option><option>Nước thải</option><option>BMS</option><option>Mạng / viễn thông</option><option>Khác</option></select></label><label>Vị trí<input id="m130Location" maxlength="160" placeholder="Tầng / khu vực"></label></div><div class="m130Two"><label id="m130EquipmentLinkRow" class="m130EquipmentLink">Thiết bị / hạng mục liên kết<select id="m130EquipmentProfile"><option value="">Không liên kết thiết bị</option></select><small id="m130EquipmentHelp">Chỉ hiển thị hồ sơ thiết bị đã lưu tại dự án này.</small><button type="button" id="m130GoEquipment" class="m130OpenEquipment">↗ Mở Thông tin hệ thống</button><input id="m130AssetCode" type="hidden"></label><label>Loại bảo trì<select id="m130WorkType"><option value="PM">PM · Phòng ngừa</option><option value="CM">CM · Khắc phục</option></select></label></div><label>Mức ưu tiên<select id="m130Priority"><option value="normal">Bình thường</option><option value="high">Cao</option><option value="urgent">Khẩn cấp</option></select></label>'+
 '<div class="m130Two"><label>Ngày bắt đầu chu kỳ *<input type="date" id="m130First" min="2020-01-01" max="2100-12-31" aria-label="Chọn ngày bắt đầu chu kỳ bảo trì" required></label><label>Chu kỳ bảo trì<select id="m130Cycle" required><option value="0">1 lần</option><option value="1">1 tháng</option><option value="3">3 tháng</option><option value="4">4 tháng</option><option value="6">6 tháng</option><option value="12">1 năm</option></select></label></div><p class="m130Hint" id="m130NextHint">Chọn chu kỳ, hệ thống sẽ tự tính ngày lặp. Ví dụ 10/10/2026 + 3 tháng → 10/01/2027 → 10/04/2027.</p><label>Tên kỹ thuật / người phụ trách *<input id="m130Assignee" maxlength="500" autocomplete="off" placeholder="Chọn nhiều người hoặc nhập tên, cách nhau bằng dấu phẩy" required></label><small class="m130PersonCount" id="m130AssigneeCount" aria-live="polite">Chọn một hoặc nhiều người bên dưới</small><div class="m130PersonQuick" id="m130AssigneeQuick" role="group" aria-label="Chọn nhiều kỹ thuật viên phụ trách"></div><div class="m130Foot"><button type="button" data-m130-cancel>Hủy</button><button type="submit">Lưu kế hoạch</button></div></form>'+
 '<form id="m130EventForm" hidden><p id="m130EventInfo" class="m130Hint"></p><p id="m130LegacyEvidence" class="m130LegacyEvidence" role="note" hidden></p><div class="m130Two"><label>Ngày dự kiến<input id="m130EventDate" type="date" required></label><label>Trạng thái<select id="m130EventStatus"><option value="planned">Chưa thực hiện</option><option value="in_progress">Đang thực hiện</option><option value="awaiting_approval">Chờ duyệt</option><option value="completed">Hoàn thành</option><option value="postponed">Hoãn</option><option value="cancelled">Hủy</option><option value="skipped">Không thực hiện</option></select></label></div><label>Kỹ thuật viên thực hiện *<input id="m130Who" maxlength="500" placeholder="Chọn nhiều kỹ thuật viên hoặc nhập tên" autocomplete="off"></label><small class="m130PersonCount" id="m130WhoCount" aria-live="polite">Chọn một hoặc nhiều người bên dưới</small><div class="m130PersonQuick" id="m130WhoQuick" role="group" aria-label="Chọn nhiều kỹ thuật viên thực hiện"></div><label>Kết quả kiểm tra<select id="m130ResultCode"><option value="">— Chọn kết quả —</option><option value="pass">Đạt</option><option value="fail">Không đạt</option><option value="monitor">Cần theo dõi</option></select></label><label>Kết quả thực hiện / ghi chú<textarea id="m130Result" rows="3" maxlength="2000" placeholder="Ghi nhận thực tế và hướng xử lý"></textarea></label><label>Lý do hoãn / hủy<input id="m130PostponeReason" maxlength="600" placeholder="Bắt buộc nếu Hoãn hoặc Hủy"></label><div class="m130Two"><label>Nhân công (đ)<input id="m130LaborCost" type="number" min="0" step="1000" placeholder="0"></label><label>Vật tư (đ)<input id="m130MaterialCost" type="number" min="0" step="1000" placeholder="0"></label></div><div class="m130PhotoFields"><label>Ảnh trước bảo trì<input id="m130BeforePhotos" type="file" accept="image/*" multiple></label><label>Ảnh sau bảo trì<input id="m130AfterPhotos" type="file" accept="image/*" multiple></label></div><div id="m130PhotoPreview" class="m130PhotoPreview"></div><p class="m130Hint">Hoàn thành cần chọn KTV, kết quả Đạt/Không đạt/Cần theo dõi, ghi chú và ít nhất 1 ảnh trước hoặc sau.</p><div class="m130Foot"><button type="button" data-m130-cancel>Hủy</button><button type="submit">Lưu công việc</button></div></form><datalist id="m130PeopleOptions"></datalist></div>';
 document.body.appendChild(overlay);
 $("m130Prev").onclick=()=>{year=Math.max(2020,year-1);render();};
 $("m130Next").onclick=()=>{year=Math.min(2100,year+1);render();};
 $("m130Create").onclick=()=>openPlan();
 $("m130Pdf").onclick=exportPdf;
 $("m130AuditButton").onclick=loadAuditHistory;
 $("m130Legacy").onclick=()=>{const opened=page.classList.toggle("maint130-assets-open");$("m130Legacy").setAttribute("aria-expanded",String(opened));if(opened&&typeof loadMaintenanceData==="function")loadMaintenanceData(B);};
 ["m130Search","m130Group","m130State","m130PriorityFilter","m130TypeFilter","m130TechnicianFilter","m130SampleFilter"].forEach(id=>$(id).addEventListener(id==="m130Search"?"input":"change",()=>{if(id==="m130SampleFilter")render();else renderList()}));
 root.addEventListener("keydown",ev=>{
  if(ev.key!=="Enter"&&ev.key!==" ")return;
  const r=ev.target.closest("[data-m130-open]"),day=ev.target.closest("[data-m130-date]");
  if(r&&ev.target===r){ev.preventDefault();openEvent(r.dataset.m130Open);}
  else if(day&&ev.target===day&&canWrite()&&!busy){ev.preventDefault();openPlan(null,day.dataset.m130Date);}
 });
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
  const photo=ev.target.closest("[data-m130-gallery]");
  if(photo){showMaintenanceGallery(photo.dataset.m130Gallery,photo.dataset.m130PhotoIndex);return;}
  const profile=ev.target.closest("[data-m130-profile]");
  if(profile&&LINK_BUILDINGS.has(B)){
   const id=profile.dataset.m130Profile;
   document.getElementById("navUpdateAssets")?.click();
   window.estaUpgradeAssets?.focusEquipment?.(id);
   return;
  }
  const v=ev.target.closest("[data-m130-view]"),l=ev.target.closest("[data-m130-layout]"),m=ev.target.closest("[data-m130-month]"),e=ev.target.closest("[data-m130-event]"),p=ev.target.closest("[data-m130-plan]"),del=ev.target.closest("[data-m130-delete]");
  if(v){
   viewMode=v.dataset.m130View==="rows"?"rows":"cards";
   try{localStorage.setItem(viewKey(),viewMode)}catch(_){}
   renderList();
  }
  else if(l){layoutMode=l.dataset.m130Layout==="calendar"?"calendar":l.dataset.m130Layout==="timeline"?"timeline":"list";renderList();}
  else if(m){month=Number(m.dataset.m130Month);render();}
  else if(e)openEvent(e.dataset.m130Event);
  else if(p)openPlan(p.dataset.m130Plan);
  else if(del)deletePlan(del.dataset.m130Delete);
  else{
   const row=ev.target.closest("[data-m130-open]"),day=ev.target.closest("[data-m130-date]");
   if(row)openEvent(row.dataset.m130Open);
   else if(day&&!ev.target.closest("button,a,input,select,textarea")&&canWrite()&&!busy)openPlan(null,day.dataset.m130Date);
  }
 });
 overlay.addEventListener("click",ev=>{
  const b=ev.target.closest("[data-m130-person-target]");
  if(!b||b.disabled)return;
  const input=$(b.dataset.m130PersonTarget);
  if(!input||input.disabled)return;
  const selected=splitPeople(input.value),name=b.dataset.m130PersonName;
  input.value=selectedPeople(selected.includes(name)?selected.filter(n=>n!==name):[...selected,name]);
  input.dispatchEvent(new Event("input",{bubbles:true}));
 });
 for(const id of ["m130Assignee","m130Who"]){
  $(id).addEventListener("input",()=>syncPersonChoices(id));
 }
 // Mobile browsers open their native date selector; modern Chromium needs showPicker()
 // when tapping the text portion, not only the small calendar indicator.
 for(const id of ["m130First","m130EventDate"]){
  const field=$(id);
  field.addEventListener("click",()=>{
   if(field.disabled||field.readOnly||typeof field.showPicker!=="function")return;
   try{field.showPicker();}catch(_){field.focus();}
  });
 }
 $("m130Close").onclick=closeDialog;
 overlay.querySelectorAll("[data-m130-cancel]").forEach(b=>b.onclick=closeDialog);
 overlay.addEventListener("click",ev=>{if(ev.target===overlay)closeDialog();});
 $("m130EquipmentProfile").addEventListener("change",()=>{
  if(!LINK_BUILDINGS.has(B))return;
  const profile=equipmentProfiles.find(x=>String(x.id)===$("m130EquipmentProfile").value);
  $("m130EquipmentHelp").textContent=profile?"Đã chọn hồ sơ "+profile.name+". Vị trí và mã thiết bị trống sẽ được điền sẵn.":"Không liên kết: kế hoạch bảo trì vẫn được giữ.";
  if(profile){
   if(!$("m130Location").value.trim())$("m130Location").value=profile.location||"";
   if(!$("m130AssetCode").value.trim())$("m130AssetCode").value=profile.code||"";
   if(!currentPlan){
    const name=String(profile.system_group||"").toLocaleLowerCase("vi-VN");
    const sys=name.includes("pccc")?"PCCC":name.includes("cấp thoát nước")?"Cấp thoát nước":name.includes("điện (msb)")?"Điện":name.includes("máy phát")?"Máy phát điện":name.includes("hvac")?"HVAC":name.includes("thang máy")?"Thang máy":name.includes("chiếu sáng")?"Chiếu sáng":name.includes("camera")?"Camera & an ninh":null;
    if(sys)$("m130System").value=sys;
   }
  }
 });
 $("m130System").addEventListener("change",()=>fillEquipmentSelect(""));
 $("m130GoEquipment").addEventListener("click",()=>{
  if(!confirm("Mở Thông tin hệ thống để thêm hoặc xem thiết bị? Nội dung đang nhập trong cửa sổ này chưa được lưu."))return;
  closeDialog();document.getElementById("navUpdateAssets")?.click();
 });
 $("m130PlanForm").onsubmit=savePlan;
 $("m130EventForm").onsubmit=saveEvent;
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
 $("m130NextHint").textContent=n>0&&start?"Lịch kế tiếp: "+fmt(addMonths(start,n))+" → "+fmt(addMonths(start,n*2))+"; giữ nguyên ngày lịch khi chuyển năm.":"Chu kỳ 1 lần: công việc chỉ xuất hiện một lần.";
}
function render(){
 if(!show()||!ready)return;
 const all=getYearSchedule(year),monthCounts=Array(12).fill(0),subset=[];
 // One pass supplies both the KPI month and all twelve month badges.
 for(const o of all){
  const m=Number(o.scheduled.slice(5,7));
  if(m>=1&&m<=12)monthCounts[m-1]++;
  if(m===month)subset.push(o);
 }
 $("m130Year").textContent="Năm "+year;
 $("m130Months").innerHTML=monthCounts.map((count,idx)=>{const m=idx+1;return '<button type="button" data-m130-month="'+m+'" class="'+(m===month?"sel":"")+'"><small>Th '+pad(m)+'</small><b>'+count+'</b></button>';}).join("");
 const groups=[...new Set(items.map(i=>i.system_group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi")),select=$("m130Group"),old=select.value;
 if(select.options.length!==groups.length+1||groups.some(g=>![...select.options].some(o=>o.value===g))){select.innerHTML='<option value="">Tất cả hệ thống</option>'+groups.map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join("");select.value=old;}
 renderList();
}
function renderList(){
 if(!show()||!ready)return;
 const subset=scopeEvents(getYearSchedule(year).filter(o=>Number(o.scheduled.slice(5,7))===month)); const q=$("m130Search").value.trim().toLocaleLowerCase("vi-VN"),g=$("m130Group").value,s=$("m130State").value;
 const visible=subset.filter(o=>(!g||o.item.system_group===g)&&(!s||(s==="late"?stateKey(o)==="late":s==="cancelled"?(stateKey(o)==="cancelled"||stateKey(o)==="postponed"):stateKey(o)===s))&&(!q||[o.item.work_title,o.item.system_group,o.item.subsystem,o.item.asset_code,o.item.assigned_to].join(" ").toLocaleLowerCase("vi-VN").includes(q))&&(!$("m130PriorityFilter").value||o.item.priority===$("m130PriorityFilter").value)&&(!$("m130TypeFilter").value||o.item.work_type===$("m130TypeFilter").value)&&(!$("m130TechnicianFilter").value||splitPeople(o.event.completed_by||o.item.assigned_to).includes($("m130TechnicianFilter").value)));
 $("m130ListTitle").textContent="Công việc tháng "+pad(month)+"/"+year;
 $("m130ListCount").textContent=visible.length+" / "+subset.length+" công việc"+(subset.some(o=>demo(o.item))?" · "+subset.filter(o=>demo(o.item)).length+" mục mẫu chưa xác minh":"");
 kpiHtml(visible);
 const isCards=viewMode==="cards",list=$("m130List");
 const completedByItem=new Map();
 if(isCards)for(const e of stored){
  if(e.status!=="completed"||!e.planned_date)continue;
  const dates=completedByItem.get(e.item_id)||[];
  dates.push(String(e.planned_date));completedByItem.set(e.item_id,dates);
 }
 if(isCards)for(const dates of completedByItem.values())dates.sort((a,b)=>b.localeCompare(a));
 list.classList.toggle("m130CardsMode",isCards);
 list.classList.toggle("m130RowsMode",!isCards);
 $("maint130").querySelectorAll("[data-m130-view]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.m130View===viewMode)));
 $("maint130").querySelectorAll("[data-m130-layout]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.m130Layout===layoutMode)));
 if(layoutMode!=="list"){renderAlternative(visible);return;}
 list.innerHTML=visible.map(o=>{
  const e=o.event,i=o.item,st=status(o),key=esc(e.event_key);
  const cycle=interval(i),cycleText=cycle?cycleLabel(cycle):(i.cadence||"1 lần"),location=esc(i.subsystem||"Chưa ghi vị trí");
  const attached=i.equipment_profile_id&&typeof B!=="undefined"&&["130HH","127HH","62THL","68PĐL"].includes(B)&&typeof equipmentProfiles!=="undefined"?equipmentProfiles.find(p=>String(p.id)===String(i.equipment_profile_id)):null;
  const linkedButton=attached?'<button type="button" class="m130LinkedEquipment" data-m130-profile="'+esc(attached.id)+'" title="Mở hồ sơ thiết bị">↗ '+esc(attached.name)+'</button>':"";
  if(!isCards){
   return '<article class="m130Entry m130CompactRow m130State-'+st[1]+'" data-m130-open="'+key+'" role="button" tabindex="0" aria-label="Xem công việc '+esc(i.work_title)+'">'+
    '<time class="m130Date" datetime="'+esc(isMonthOnly(o)?"":dateOf(o))+'" aria-label="'+esc(isMonthOnly(o)?"Chưa ấn định ngày trong tháng":"Ngày "+fmt(dateOf(o)))+'"><b>'+esc(isMonthOnly(o)?"—":dateOf(o).slice(8,10))+'</b><small>Th'+esc(dateOf(o).slice(5,7))+'</small></time>'+
    '<div class="m130EntryBody"><div class="m130Pills"><span class="m130Badge '+st[1]+'" aria-label="Tình trạng: '+esc(st[0])+'"><b class="m130StatusValue">'+esc(st[1]==="late"?"Quá hạn "+Math.max(1,Math.round((Date.parse(isoToday()+"T12:00:00")-Date.parse(dateOf(o)+"T12:00:00"))/86400000))+" ngày":st[0])+'</b></span><span class="m130Sys">'+esc(i.system_group)+'</span>'+(cycle?'<span class="m130Cycle">↻ '+cycleText+'</span>':'')+maintenanceEvidenceWarning(e)+'</div>'+
    '<h4>'+esc(i.work_title)+'</h4><p class="m130ShortMeta">'+(isMonthOnly(o)?'<span class="m130MissingDay">Chưa ấn định ngày</span>':'')+'<span class="m130MetaLocation">⌖ '+location+'</span><span class="m130MetaPerson">♙ '+esc(personLabel(e.completed_by||i.assigned_to))+'</span>'+(i.asset_code?'<span class="m130MetaCode">· '+esc(i.asset_code)+'</span>':'')+'</p>'+(e.result_note?'<p class="m130Result"><b>KQ:</b> '+esc(e.result_note)+'</p>':'')+'</div>'+maintenanceEvidenceHtml(e,e.event_key)+
    '<div class="m130EntryActions">'+linkedButton+'<button type="button" data-m130-event="'+key+'">'+(canWrite()?(e.status==="completed"?"Xem KQ":"Ghi bảo trì"):"Xem chi tiết")+'</button><button type="button" class="m130Edit" aria-label="Sửa kế hoạch '+esc(i.work_title)+'" title="Sửa kế hoạch" data-m130-plan="'+esc(i.id)+'" '+(canWrite()?"":"disabled")+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z"/></svg></button></div></article>';
  }
  const done=lastCompleted(o,completedByItem),upcoming=nextCardDate(o);
  const record=esc(e.event_key),editable=canWrite()?"":"disabled";
  return '<article class="m130ServiceCard m130State-'+st[1]+'">'+
   '<div class="m130CardHead"><div class="m130CardHeading"><span class="m130SystemLabel">'+esc(i.system_group)+'</span><span class="m130CardLocation">'+(i.asset_code?'Mã TB: '+esc(i.asset_code)+' · ':'')+location+' · Lịch kỳ này: '+shownDate(o)+'</span></div><div class="m130TopTags"><span class="m130CardStatus '+st[1]+'"><span class="m130StatusLabel">Tình trạng:</span> <b class="m130StatusValue">'+st[0]+'</b></span></div></div>'+
   '<h3>'+esc(i.work_title)+'</h3>'+maintenanceEvidenceWarning(e)+
   '<div class="m130CardMetrics"><div><small>Gần nhất</small><strong>'+fmt(done)+'</strong></div><div><small>Kế tiếp</small><strong>'+(isMonthOnly(o)?shownDate(o):fmt(upcoming))+'</strong></div><div><small>Chu kỳ</small><strong>'+esc(cycleText)+'</strong></div></div>'+
   '<div class="m130CardLower"><div class="m130CardDetails"><div class="m130CardMeta"><span>Kỹ thuật: <b>'+esc(personLabel(e.completed_by||i.assigned_to))+'</b></span></div>'+
   (e.result_note?'<p class="m130CardResult"><b>KQ:</b> '+esc(e.result_note)+'</p>':'')+'</div>'+maintenanceEvidenceHtml(e,e.event_key)+'</div>'+
   '<div class="m130CardFoot">'+linkedButton+'<button type="button" class="m130RecordBtn" data-m130-event="'+record+'">'+(canWrite()?(e.status==="completed"?"✓ Xem / sửa KQ":"＋ Ghi bảo trì"):"Xem chi tiết")+'</button><button type="button" class="m130PlanBtn" data-m130-plan="'+esc(i.id)+'" '+editable+'>Sửa</button><button type="button" class="m130DeleteBtn" title="Xóa kế hoạch (có xác nhận)" aria-label="Xóa kế hoạch '+esc(i.work_title)+'" data-m130-delete="'+esc(i.id)+'" '+editable+'>×</button></div></article>';
 }).join("")||'<p class="m130Empty">Không có công việc trong tháng và bộ lọc này.</p>';
 const scheduledItems=new Set(stored.map(e=>e.item_id));
 const missing=items.filter(i=>!i.deleted_at&&!scheduledItems.has(i.id))
  .filter(i=>(!g||i.system_group===g)&&(!q||[i.work_title,i.system_group,i.subsystem].join(" ").toLocaleLowerCase("vi-VN").includes(q)));
 if(missing.length){
  const panel=document.createElement("details");panel.className="m130Unscheduled";
  panel.innerHTML='<summary>'+missing.length+' hạng mục chưa có lịch cụ thể · Nhấn để xem và đặt ngày</summary><div class="m130UnscheduledList">'+missing.map(i=>
   '<div><span>'+esc(i.system_group)+' · '+esc(i.work_title)+'</span><button type="button" data-m130-plan="'+esc(i.id)+'" '+(canWrite()?"":"disabled")+'>Đặt lịch</button></div>'
  ).join("")+'</div>';
  list.appendChild(panel);
 }
 hydrateMaintenanceEvidence();
 $("m130Create").disabled=!canWrite();
}
function renderAlternative(events){
 const list=$("m130List");
 list.classList.remove("m130CardsMode","m130RowsMode");
 if(layoutMode==="timeline"){
  list.innerHTML='<div class="m130Timeline">'+events.map(o=>{
   const st=status(o),key=esc(o.event.event_key);
   return '<button type="button" data-m130-event="'+key+'" class="m130TimelineItem '+st[1]+'"><time>'+shownDate(o)+'</time><span><b>'+esc(o.item.work_title)+'</b><small>'+esc(o.item.system_group)+' · '+esc(personLabel(o.event.completed_by||o.item.assigned_to))+'</small></span><em>'+st[0]+'</em></button>';
  }).join("")+'</div>';
  return;
 }
 const firstDay=new Date(year,month-1,1).getDay(),offset=(firstDay+6)%7,days=new Date(year,month,0).getDate();
 const headings=['T2','T3','T4','T5','T6','T7','CN'];
 const cells=Array.from({length:offset},()=>'<div class="m130CalendarBlank"></div>');
 // Keep event ordering while indexing each date once, not thirty-one times.
 const eventsByDay=new Map();
 for(const o of events){
  if(isMonthOnly(o))continue;
  const date=dateOf(o),daily=eventsByDay.get(date)||[];
  daily.push(o);eventsByDay.set(date,daily);
 }
 for(let day=1;day<=days;day++){
  const date=year+"-"+pad(month)+"-"+pad(day),daily=eventsByDay.get(date)||[];
  const chips=daily.map(o=>{
   const key=esc(o.event.event_key),st=stateKey(o),system=String(o.item.system_group||"Chưa phân loại").trim()||"Chưa phân loại";
   return '<button type="button" draggable="'+(canWrite()&&o.event.status!=="completed"?"true":"false")+'" data-m130-event="'+key+'" data-m130-drag="'+key+'" class="m130CalendarChip '+st+'" aria-label="'+esc(system+": "+o.item.work_title)+'"><span class="m130CalendarSystem">'+esc(system)+'</span><span class="m130CalendarTitle">'+esc(o.item.work_title)+'</span></button>';
  }).join("");
  const count=daily.length?'<small class="m130DayCount" aria-label="'+daily.length+' công việc">'+daily.length+'</small>':"";
  const keyboard=canWrite()?' role="group" tabindex="0" aria-label="Ngày '+fmt(date)+'. Nhấn Enter để thêm lịch bảo trì"':"";
  cells.push('<div class="m130CalendarDay'+(canWrite()?' m130CanAdd':'')+'" data-m130-date="'+date+'"'+keyboard+'><div class="m130DayHead"><b>'+day+'</b>'+count+'</div>'+chips+'</div>');
 }
 const agenda=events.map(o=>{
  const st=status(o),key=esc(o.event.event_key);
  return '<div class="m130AgendaItem"><div class="m130AgendaDate">'+shownDate(o)+'</div><button type="button" data-m130-event="'+key+'" class="m130AgendaButton '+st[1]+'"><b>'+esc(o.item.work_title)+'</b><small>'+esc(o.item.system_group)+' · '+st[0]+'</small></button></div>';
 }).join("");
 list.innerHTML='<div class="m130CalendarWrap"><div class="m130CalendarGrid">'+headings.map(n=>'<strong class="m130CalendarWeek">'+n+'</strong>').join("")+cells.join("")+'</div><div class="m130CalendarAgenda">'+(agenda||'<p>Tháng này chưa có lịch bảo trì.</p>')+'</div></div>';
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
  clearScheduleCache();render();notifyMaintenance130Nav();toast("Đã đổi lịch sang "+fmt(date));
 }catch(err){toast("Không đổi được lịch: "+(err.message||err));}
 finally{busy=false;}
}
async function load(force){
 if(!show()||busy||!centralSession?.access_token)return;
 if(ready&&!force){render();return;}
 const requestBuilding=B;
 busy=true;$("m130List").innerHTML='<p class="m130Empty">Đang tải dữ liệu bảo trì...</p>';
 try{
  const token=centralSession.access_token,[i,e,persons,profiles,systems]=await Promise.all([
   sbFetch("/rest/v1/esta_maintenance_plan_items?select=*&building_id=eq."+B+"&order=created_at.asc",{token}),
   sbFetch("/rest/v1/esta_maintenance_plan_occurrences?select=*&building_id=eq."+B+"&order=planned_month.asc,planned_date.asc",{token}),
   sbFetch("/rest/v1/building_people?select=name&building_id=eq."+B+"&order=name.asc",{token}).catch(()=>[]),
   LINK_BUILDINGS.has(B)?sbFetch("/rest/v1/building_equipment_profiles_nangcap?select=id,name,code,location,system_group,specs&building_id=eq."+encodeURIComponent(requestBuilding)+"&order=name.asc",{token}).catch(()=>[]):Promise.resolve([]),
   LINK_BUILDINGS.has(B)?sbFetch("/rest/v1/ops_systems?select=name,active&building_id=eq."+encodeURIComponent(requestBuilding)+"&active=eq.true&order=sort_order.asc,name.asc",{token}).catch(()=>[]):Promise.resolve([])
  ]);
  if(!active()||B!==requestBuilding)return;
  items=Array.isArray(i)?i:[];stored=Array.isArray(e)?e:[];people=Array.isArray(persons)?persons.map(p=>String(p.name||"").trim()).filter(Boolean):[];equipmentProfiles=LINK_BUILDINGS.has(B)&&Array.isArray(profiles)?profiles.filter(p=>!p.specs?._estaUpgrade?.archived):[];systemCatalog=LINK_BUILDINGS.has(B)&&Array.isArray(systems)?systems.filter(x=>x.active!==false):[];fillMaintenanceSystemSelect();clearScheduleCache();renderPersonPickers();const staff=$("m130TechnicianFilter"),oldStaff=staff.value;staff.innerHTML='<option value="">Mọi KTV</option>'+peopleOptions().map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");staff.value=oldStaff;ready=true;render();if(pendingFocusPlanId)focusPlanInList(pendingFocusPlanId);
 }catch(err){$("m130List").textContent="Không tải được kế hoạch: "+(err.message||err);}
 finally{if(B===requestBuilding)busy=false;}
}
function closeDialog(){$("m130Overlay").hidden=true;currentPlan=null;currentEvent=null;clearSaveError();}
function clearSaveError(){const box=$("m130SaveError");if(box){box.textContent="";box.hidden=true;}}
function saveError(message){
 const box=$("m130SaveError");if(box){box.textContent=message;box.hidden=false;}
 if(typeof toast==="function")toast(message);
 return false;
}
/* A successful HTTP response can still update zero rows. Re-read the exact
   project-scoped row before telling an operator that a maintenance save succeeded. */
async function verifyMaintenanceSaved(table,id,fields,building){
 const rows=await sbFetch("/rest/v1/"+table+"?select=*&id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(building)+"&limit=1",{token:centralSession.access_token});
 const saved=Array.isArray(rows)?rows[0]:null;
 const same=(a,b)=>Array.isArray(b)||b&&typeof b==="object"?JSON.stringify(a)===JSON.stringify(b):String(a??"")===String(b??"");
 if(!saved||!Object.entries(fields).every(([key,value])=>same(saved[key],value)))
  throw new Error("Máy chủ chưa xác nhận đầy đủ dữ liệu. Vui lòng kiểm tra hoặc tải lại trang trước khi lưu lần nữa.");
 return saved;
}
/* Options come from saved equipment profiles, not only fixed initial categories. */
function fillMaintenanceSystemSelect(selected=""){
 const select=$("m130System");if(!select)return;
 select.querySelectorAll("option[data-m130-equipment-system],option[data-m130-legacy-system]").forEach(option=>option.remove());
 const existing=new Set([...select.options].map(o=>o.value));
 for(const profile of [...systemCatalog.filter(x=>x.active!==false).map(x=>({system_group:x.name})),...equipmentProfiles]){
  const name=String(profile.system_group||"").trim();
  if(!name||existing.has(name))continue;
  const option=document.createElement("option");option.value=name;option.textContent=name;option.dataset.m130EquipmentSystem="1";select.appendChild(option);existing.add(name);
 }
 if(selected&&!existing.has(selected)){
  const option=document.createElement("option");option.value=selected;option.textContent=selected;option.dataset.m130LegacySystem="1";select.appendChild(option);
 }
 if(selected)select.value=selected;
}
async function refreshMaintenanceEquipmentOptions(){
 if(!LINK_BUILDINGS.has(B)||!centralSession?.access_token||!active())return;
 const building=B;
 try{
  const [fresh,freshSystems]=await Promise.all([
   sbFetch("/rest/v1/building_equipment_profiles_nangcap?select=id,name,code,location,system_group,specs&building_id=eq."+encodeURIComponent(building)+"&order=name.asc",{token:centralSession.access_token}),
   sbFetch("/rest/v1/ops_systems?select=name,active&building_id=eq."+encodeURIComponent(building)+"&active=eq.true&order=sort_order.asc,name.asc",{token:centralSession.access_token})
  ]);
  if(B!==building||!active())return;
  equipmentProfiles=Array.isArray(fresh)?fresh.filter(p=>!p.specs?._estaUpgrade?.archived):[];
  systemCatalog=Array.isArray(freshSystems)?freshSystems.filter(x=>x.active!==false):[];
  if($("m130Overlay")?.hidden===false&&$("m130PlanForm")?.hidden===false){
   const chosenSystem=$("m130System").value,chosenProfile=$("m130EquipmentProfile").value;
   fillMaintenanceSystemSelect(chosenSystem);fillEquipmentSelect(chosenProfile);
  }
 }catch(error){
  if(B===building&&$("m130Overlay")?.hidden===false&&$("m130PlanForm")?.hidden===false){
   $("m130EquipmentHelp").textContent="Chưa thể cập nhật danh sách thiết bị mới: "+String(error?.message||error);
  }
 }
}
function maintenanceSystemMatches(profile,system){
 const groups={"PCCC":["PCCC"],"Điện":["Điện (MSB)"],"HVAC":["Điều hòa (HVAC)"],
  "Cấp thoát nước":["Bơm & cấp thoát nước"],"Máy phát điện":["Máy phát điện"],
  "Thang máy":["Thang máy"],"Chiếu sáng":["Chiếu sáng & Điện nhẹ"],
  "Camera & an ninh":["Camera & An ninh"],"Kiểm soát ra vào":["Camera & An ninh"],
  "Thông gió":["Điều hòa (HVAC)"],"Nước thải":["Bơm & cấp thoát nước"],
  "Mạng / viễn thông":["Chiếu sáng & Điện nhẹ"]};
 return String(profile.system_group||"")===system||(groups[system]||[]).includes(profile.system_group);
}
function fillEquipmentSelect(selected=""){
 const row=$("m130EquipmentLinkRow"),select=$("m130EquipmentProfile");
 if(!row||!select)return;row.hidden=!LINK_BUILDINGS.has(B);if(row.hidden)return;
 const matching=equipmentProfiles.filter(p=>maintenanceSystemMatches(p,$("m130System").value));
 const current=equipmentProfiles.find(p=>String(p.id)===String(selected));
 const available=current&&!matching.includes(current)?[...matching,current]:matching;
 select.innerHTML='<option value="">Không liên kết thiết bị</option>'+
  available.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name||"Chưa đặt tên")+(p.code?' · '+esc(p.code):"")+(p.location?' · '+esc(p.location):"")+'</option>').join("");
 if(selected&&!current)select.appendChild(new Option("Hồ sơ liên kết chưa tải được hoặc đã xóa",selected,true,true));
 select.value=selected||"";
 $("m130EquipmentHelp").textContent=selected?"Lịch sử và kết quả bảo trì sẽ xuất hiện trong hồ sơ thiết bị.":
  matching.length?("Có "+matching.length+" hồ sơ thiết bị đã lưu thuộc hệ thống này."):"Chưa có hồ sơ thiết bị đã lưu thuộc hệ thống này. Hãy khai báo tại Thông tin hệ thống trước.";
}
function focusPlanInList(id){
 if(!LINK_BUILDINGS.has(B)||!ready||!active())return;
 const p=items.find(x=>String(x.id)===String(id)&&!x.deleted_at);
 if(!p){pendingFocusPlanId="";return;}
 const dates=stored.filter(e=>e.item_id===p.id).map(e=>String(e.planned_date||e.planned_month||"").slice(0,10)).filter(d=>/^\d{4}-\d\d-\d\d$/.test(d));
 const date=dates.find(d=>d.startsWith(String(year)+"-"))||dates[0];
 if(date){year=Number(date.slice(0,4));month=Number(date.slice(5,7));}
 pendingFocusPlanId="";
 for(const id of ["m130Group","m130State","m130PriorityFilter","m130TypeFilter","m130TechnicianFilter"]){const f=$(id);if(f)f.value="";}
 $("m130Search").value=p.work_title;layoutMode="list";render();
}
window.estaMaintenance130={focusPlan(id){
 if(!LINK_BUILDINGS.has(B))return;
 pendingFocusPlanId=String(id||"");
 if(ready)focusPlanInList(pendingFocusPlanId);
}};
function openPlan(id,date){
 if(!canWrite()||busy||!active())return;
 currentPlan=id?items.find(i=>i.id===id):null;
 const i=currentPlan,base=i?byDate(i):null;
 clearSaveError();
 $("m130ModalTitle").textContent=i?"Chỉnh sửa kế hoạch":date?"Thêm bảo trì · "+fmt(date):"Thêm công việc bảo trì";
 $("m130PlanForm").hidden=false;$("m130EventForm").hidden=true;
 $("m130Title").value=i?.work_title||"";
 const selectedSystem=i?.system_group||"HVAC";
 fillMaintenanceSystemSelect(selectedSystem);
 $("m130Location").value=i?.subsystem||"";
 $("m130AssetCode").value=i?.asset_code||"";
 fillEquipmentSelect(i?.equipment_profile_id||"");
 $("m130WorkType").value=i?.work_type||"PM";
 $("m130Priority").value=i?.priority||"normal";
 $("m130First").value=base?.planned_date||base?.planned_month||date||year+"-"+pad(month)+"-10";
 $("m130First").readOnly=false;
 const currentCycle=interval(i),cycleSelect=$("m130Cycle");
 cycleSelect.querySelectorAll("option[data-m130-legacy]").forEach(option=>option.remove());
 if(i&&!Array.from(cycleSelect.options).some(opt=>Number(opt.value)===currentCycle)){
  const opt=document.createElement("option");opt.value=String(currentCycle);opt.textContent=cycleLabel(currentCycle)+" (chu kỳ cũ)";opt.dataset.m130Legacy="1";cycleSelect.appendChild(opt);
 }
 cycleSelect.value=String(currentCycle);
 $("m130Assignee").value=i?.assigned_to&&i.assigned_to!=="Kỹ thuật"&&i.assigned_to!=="Kỹ thuật dự án"?i.assigned_to:"";
 renderPersonPickers();
 hint();$("m130Overlay").hidden=false;
 refreshMaintenanceEquipmentOptions();
}
async function savePlan(ev){
 ev.preventDefault();if(busy||!active()||!canWrite())return;
 const title=$("m130Title").value.trim(),date=$("m130First").value,n=Number($("m130Cycle").value),assignee=selectedPeople($("m130Assignee").value);
 if(!title||!date||!Number.isInteger(n)||n<0||n>120)return toast("Kiểm tra nội dung, ngày và chu kỳ.");
 if(!assignee)return toast("Hãy chọn ít nhất một kỹ thuật viên phụ trách.");
 const base=currentPlan?byDate(currentPlan):null,previous=String(base?.planned_date||base?.planned_month||"").slice(0,10),dateChanged=!!base&&previous!==date;
 if(dateChanged){
  if(base.status==="completed")return toast("Lịch gốc đã hoàn thành. Hãy giữ nguyên ngày để bảo toàn lịch sử.");
  const related=stored.filter(e=>e.item_id===currentPlan.id);
  if(interval(currentPlan)>0&&related.length>1)return toast("Kế hoạch đã có nhiều kỳ ghi nhận. Hãy chỉnh ngày từng kỳ trong lịch để giữ lịch sử.");
  const key=currentPlan.plan_code+":"+date.slice(0,7);
  if(related.some(e=>e.id!==base.id&&(e.event_key===key||String(e.planned_month).slice(0,7)===date.slice(0,7))))return toast("Tháng đã chọn có lịch của hạng mục này. Hãy chọn ngày ở tháng khác.");
 }
 busy=true;const btn=$("m130PlanForm").querySelector("[type=submit]");btn.disabled=true;
 try{
  const token=centralSession.access_token,fields={work_title:title,system_group:$("m130System").value,subsystem:$("m130Location").value.trim(),assigned_to:assignee,asset_code:$("m130AssetCode").value.trim(),work_type:$("m130WorkType").value,priority:$("m130Priority").value,cadence:n?n+" tháng":"Không lặp"};
  if(LINK_BUILDINGS.has(B)){
   const profileId=$("m130EquipmentProfile").value;
   const matchedProfile=equipmentProfiles.find(p=>String(p.id)===profileId);
   if(profileId&&!matchedProfile)throw Error("Thiết bị liên kết không tồn tại trong "+projectLabel()+". Vui lòng kiểm tra Thông tin hệ thống.");
   fields.equipment_profile_id=profileId||null;
   if(matchedProfile)fields.asset_code=matchedProfile.code||"";
  }
  let savedPlanId=currentPlan?.id||"";
  if(currentPlan){
   const id=currentPlan.id;
   if(dateChanged){
    const values={planned_date:date,due_date:date,planned_month:monthISO(date),event_key:currentPlan.plan_code+":"+date.slice(0,7),updated_at:new Date().toISOString()};
    await sbFetch("/rest/v1/esta_maintenance_plan_occurrences?id=eq."+encodeURIComponent(base.id)+"&building_id=eq."+B,{method:"PATCH",token,body:values});
    stored=stored.map(e=>e.id===base.id?{...e,...values}:e);
   }
   const metadata=currentPlan.source_notes==="Bổ sung từ trang Bảo trì ESTA"?{plan_year:Number(date.slice(0,4)),plan_months:[Number(date.slice(5,7))]}:{};
   await sbFetch("/rest/v1/esta_maintenance_plan_items?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"PATCH",token,body:{...fields,...metadata}});
   items=items.map(x=>x.id===id?{...x,...fields,...metadata}:x);
   if(!stored.some(e=>e.item_id===id)){
    const occurrence={id:crypto.randomUUID(),item_id:id,building_id:B,event_key:currentPlan.plan_code+":"+date.slice(0,7),planned_month:monthISO(date),planned_date:date,status:"planned",source_kind:"year",location:fields.subsystem};
    await sbFetch("/rest/v1/esta_maintenance_plan_occurrences",{method:"POST",token,body:occurrence});
    stored.push(occurrence);
   }
   if(dateChanged){year=Number(date.slice(0,4));month=Number(date.slice(5,7));}
  }else{
   const id=crypto.randomUUID(),eventId=crypto.randomUUID(),code=B+"-USER-"+id.slice(0,13);
   savedPlanId=id;
   const item={id,building_id:B,plan_year:Number(date.slice(0,4)),plan_code:code,plan_months:[Number(date.slice(5,7))],plan_status:"Có lịch",source_notes:"Bổ sung từ trang Bảo trì ESTA",...fields};
   await sbFetch("/rest/v1/esta_maintenance_plan_items",{method:"POST",token,body:item});
   const occurrence={id:eventId,item_id:id,building_id:B,event_key:code+":"+date.slice(0,7),planned_month:monthISO(date),planned_date:date,status:"planned",source_kind:"year",location:fields.subsystem};
   try{await sbFetch("/rest/v1/esta_maintenance_plan_occurrences",{method:"POST",token,body:occurrence});}
   catch(error){
    // Preserve the failed draft for audit instead of hard-deleting it.
    // Only 130HH had a DELETE policy; soft rollback works in all four buildings.
    // Verify the scoped PATCH so a zero-row response is not mistaken for cleanup.
    try{
     const deleted_at=new Date().toISOString();
     const path="/rest/v1/esta_maintenance_plan_items?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(B);
     await sbFetch(path,{method:"PATCH",token,body:{deleted_at,deletion_reason:"Tạo lịch chưa hoàn tất; khôi phục trạng thái chưa lưu"}});
     const rows=await sbFetch("/rest/v1/esta_maintenance_plan_items?select=id,deleted_at&id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(B),{token});
     if(!Array.isArray(rows)||rows[0]?.deleted_at!==deleted_at)throw Error("Chưa xác nhận hoàn tác");
    }catch(rollbackError){
     throw Error("Tạo lịch thất bại và chưa xác nhận hoàn tác. Hãy tải lại để kiểm tra trước khi tạo lại. Chi tiết: "+String(rollbackError?.message||rollbackError));
    }
    throw error;
   }
   items.push(item);stored.push(occurrence);
   year=Number(date.slice(0,4));month=Number(date.slice(5,7));
  }
  const savedPlan=await verifyMaintenanceSaved("esta_maintenance_plan_items",savedPlanId,fields,B);
  if(!savedPlan)throw new Error("Không xác nhận được kế hoạch bảo trì.");
  clearScheduleCache();closeDialog();render();notifyMaintenance130Nav();if(LINK_BUILDINGS.has(B))window.estaUpgradeAssets?.refresh?.().catch(()=>{});toast("✓ Đã lưu kế hoạch bảo trì");
 }catch(err){saveError("Chưa xác nhận lưu kế hoạch: "+(err.message||err));}
 finally{busy=false;btn.disabled=false;}
}
/* Legacy completions remain valid history, but incomplete evidence must be visible. */
function maintenanceEvidenceGaps(event){
 if(event?.status!=="completed")return [];
 const gaps=[];
 if(!Array.isArray(event.image_paths)||!event.image_paths.some(photo=>typeof photo==="string"&&photo||photo?.ref))gaps.push("thiếu ảnh");
 if(!event.started_at||!event.finished_at)gaps.push("thiếu giờ bắt đầu/kết thúc");
 return gaps;
}
function maintenanceEvidenceWarning(event){
 const gaps=maintenanceEvidenceGaps(event);
 return gaps.length?'<span class="m130EvidenceWarning" title="'+esc("Hồ sơ hoàn thành trước đây chưa đầy đủ: "+gaps.join(", "))+'">⚠ Thiếu minh chứng</span>':"";
}
function recordedImages(event){
 return Array.isArray(event.image_paths)?event.image_paths.map(x=>typeof x==="string"?{kind:"after",ref:x}:x).filter(x=>x?.ref):[];
}
/* Render saved evidence in table and card; no uploads or database changes. */
function maintenanceEvidenceHtml(event,key){
 const photos=recordedImages(event);
 if(!photos.length)return "";
 const visible=photos.slice(0,3);
 return '<div class="m130Evidence" aria-label="'+photos.length+' ảnh bảo trì">'+visible.map((p,index)=>
   '<button type="button" data-m130-gallery="'+esc(key)+'" data-m130-photo-index="'+index+'" aria-label="Xem ảnh '+(p.kind==="before"?"trước":"sau")+' bảo trì '+(index+1)+'">'+
   (typeof mediaImgHtml==="function"?mediaImgHtml(p.ref,"m130EvidenceImage"):'<span>Ảnh '+(index+1)+'</span>')+
   '<small>'+(p.kind==="before"?"Trước":"Sau")+' '+(index+1)+'</small></button>'
 ).join("")+(photos.length>3?'<button type="button" class="m130MoreEvidence" data-m130-gallery="'+esc(key)+'" data-m130-photo-index="3" aria-label="Xem thêm '+(photos.length-3)+' ảnh">+'+(photos.length-3)+' ảnh</button>':"")+'</div>';
}
let m130EvidenceObserver=null;
function hydrateMaintenanceEvidence(){
 const root=$("m130List");
 if(!root||typeof hydrateMediaImages!=="function")return;
 if(m130EvidenceObserver){m130EvidenceObserver.disconnect();m130EvidenceObserver=null;}
 const images=[...root.querySelectorAll(".m130Evidence img[data-storage-path]")];
 if(typeof IntersectionObserver==="undefined"){
   hydrateMediaImages(root).catch(()=>{});
   return;
 }
 m130EvidenceObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
     if(!entry.isIntersecting)continue;
     m130EvidenceObserver?.unobserve(entry.target);
     hydrateMediaImages(entry.target.parentElement||root).catch(()=>{});
   }
 },{rootMargin:"220px"});
 images.forEach(img=>m130EvidenceObserver.observe(img));
}
let galleryKey="",galleryIndex=0;
function closeMaintenanceGallery(){
 const dialog=$("m130Gallery");
 if(dialog)dialog.hidden=true;
 galleryKey="";
}
function showMaintenanceGallery(key,index){
 const event=getYearSchedule(year).find(item=>item.event.event_key===key)?.event;
 const photos=recordedImages(event||{});
 if(!photos.length)return;
 galleryKey=key;galleryIndex=Math.min(Math.max(0,Number(index)||0),photos.length-1);
 let dialog=$("m130Gallery");
 if(!dialog){
   dialog=document.createElement("div");
   dialog.id="m130Gallery";
   dialog.setAttribute("role","dialog");
   dialog.setAttribute("aria-modal","true");
   dialog.setAttribute("aria-label","Hình ảnh bảo trì");
   dialog.hidden=true;
   dialog.innerHTML='<div class="m130GalleryPanel"><div class="m130GalleryHeader"><strong id="m130GalleryTitle">Ảnh bảo trì</strong><button type="button" data-m130-gallery-close aria-label="Đóng xem ảnh">✕</button></div><div id="m130GalleryImage" class="m130GalleryImage"></div><div class="m130GalleryNav"><button type="button" data-m130-gallery-step="-1">‹ Trước</button><span id="m130GalleryCounter"></span><button type="button" data-m130-gallery-step="1">Sau ›</button></div></div>';
   document.body.appendChild(dialog);
   dialog.addEventListener("click",ev=>{
     if(ev.target===dialog||ev.target.closest("[data-m130-gallery-close]")){closeMaintenanceGallery();return;}
     const nav=ev.target.closest("[data-m130-gallery-step]");
     if(nav)showMaintenanceGallery(galleryKey,galleryIndex+Number(nav.dataset.m130GalleryStep));
   });
 }
 const photo=photos[galleryIndex];
 $("m130GalleryTitle").textContent=(photo.kind==="before"?"Ảnh trước bảo trì":"Ảnh sau bảo trì");
 $("m130GalleryCounter").textContent=(galleryIndex+1)+" / "+photos.length;
 dialog.querySelector('[data-m130-gallery-step="-1"]').disabled=galleryIndex===0;
 dialog.querySelector('[data-m130-gallery-step="1"]').disabled=galleryIndex===photos.length-1;
 $("m130GalleryImage").innerHTML=typeof mediaImgHtml==="function"?mediaImgHtml(photo.ref,"m130GalleryPhoto"):"Không tải được hình ảnh";
 dialog.hidden=false;
 if(typeof hydrateMediaImages==="function")hydrateMediaImages($("m130GalleryImage")).catch(()=>{});
}
document.addEventListener("keydown",ev=>{
 if($("m130Gallery")?.hidden===false&&ev.key==="Escape")closeMaintenanceGallery();
 if($("m130Gallery")?.hidden===false&&ev.key==="ArrowLeft")showMaintenanceGallery(galleryKey,galleryIndex-1);
 if($("m130Gallery")?.hidden===false&&ev.key==="ArrowRight")showMaintenanceGallery(galleryKey,galleryIndex+1);
});

function showImages(e){
 const box=$("m130PhotoPreview");if(!box)return;
 const photos=recordedImages(e);
 box.innerHTML=photos.map(p=>'<div class="m130SavedPhoto"><small>'+(p.kind==="before"?"Trước":"Sau")+'</small>'+(typeof mediaImgHtml==="function"?mediaImgHtml(p.ref):'<span>Đã lưu ảnh</span>')+'</div>').join("");
 if(typeof hydrateMediaImages==="function")hydrateMediaImages(box).catch(()=>{});
}
function openEvent(key){
 const o=getYearSchedule(year).find(x=>x.event.event_key===key);if(!o)return;
 currentEvent=o;const e=o.event;
 clearSaveError();
 $("m130ModalTitle").textContent=(canWrite()?"":"Xem kết quả · ")+o.item.work_title;
 $("m130PlanForm").hidden=true;$("m130EventForm").hidden=false;
 $("m130EventInfo").textContent=o.item.system_group+" · "+(o.item.subsystem||"")+" · Chu kỳ: "+(o.item.cadence||cycleLabel(interval(o.item)));
 const missingEvidence=maintenanceEvidenceGaps(e),historical=$("m130LegacyEvidence");
 if(historical){
  historical.hidden=!missingEvidence.length;
  historical.textContent=missingEvidence.length?"⚠ Hồ sơ đã hoàn thành nhưng chưa đủ minh chứng: "+missingEvidence.join("; ")+". Đây là dữ liệu lịch sử, cần kiểm tra bổ sung.":"";
 }
 $("m130EventDate").value=e.planned_date||(o.virtual?o.scheduled:"");
 $("m130EventStatus").value=[...$("m130EventStatus").options].some(option=>option.value===e.status)?e.status:"planned";
 $("m130Who").value=e.completed_by||(personLabel(o.item.assigned_to).includes("Chưa chọn tên")?"":o.item.assigned_to)||"";
 renderPersonPickers();
 $("m130Result").value=e.result_note||"";
 $("m130ResultCode").value=e.result_code||"";
 $("m130PostponeReason").value=e.postpone_reason||"";
 $("m130LaborCost").value=e.labor_cost??"";
 $("m130MaterialCost").value=e.material_cost??"";
 $("m130BeforePhotos").value="";$("m130AfterPhotos").value="";
 showImages(e);
 const readonly=!canWrite(),form=$("m130EventForm");
 form.querySelectorAll("input,select,textarea").forEach(field=>{field.disabled=readonly;});
 const save=form.querySelector('[type="submit"]');if(save)save.hidden=readonly;
 form.querySelectorAll("[data-m130-person-target]").forEach(button=>{button.disabled=readonly;});
 $("m130Overlay").hidden=false;
}
async function saveEvent(ev){
 ev.preventDefault();
 if(busy||!currentEvent||!canWrite()||!active())return;
 const o=currentEvent,old=o.event,date=$("m130EventDate").value,statusValue=$("m130EventStatus").value;
 const who=selectedPeople($("m130Who").value),result=$("m130Result").value.trim(),resultCode=$("m130ResultCode").value||null;
 const reason=$("m130PostponeReason").value.trim();
 const before=[...$("m130BeforePhotos").files],after=[...$("m130AfterPhotos").files],photos=recordedImages(old);
 const legacyComplete=old.status==="completed"&&statusValue==="completed";
 if(!date||date.slice(0,7)!==o.scheduled.slice(0,7))return saveError("Ngày dự kiến cần nằm trong tháng đang chọn.");
 if(["postponed","cancelled","skipped"].includes(statusValue)&&!reason)return saveError("Vui lòng nhập lý do hoãn, hủy hoặc không thực hiện.");
 if(statusValue==="completed"&&!legacyComplete){
  if(!who||["Kỹ thuật","Kỹ thuật dự án","Nhà thầu"].includes(who))return saveError("Bắt buộc chọn tên kỹ thuật viên thực hiện.");
  if(peopleOptions().length&&splitPeople(who).some(name=>!peopleOptions().includes(name)))return saveError("Chọn KTV từ danh sách nhân sự của dự án.");
  if(!resultCode||!result)return saveError("Chọn Đạt/Không đạt/Cần theo dõi và nhập kết quả thực tế.");
  if(!photos.length&&!before.length&&!after.length)return saveError("Cần ít nhất 1 ảnh trước hoặc sau bảo trì.");
 }
 const laborCost=Number($("m130LaborCost").value||0),materialCost=Number($("m130MaterialCost").value||0);
 if(!Number.isFinite(laborCost)||!Number.isFinite(materialCost)||laborCost<0||materialCost<0)return saveError("Chi phí không hợp lệ.");
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
  const fields={planned_date:date,due_date:date,status:statusValue,result_note:result,result_code:resultCode,completed_by:who,postpone_reason:reason,labor_cost:laborCost,material_cost:materialCost,image_paths,completed_at:statusValue==="completed"?(old.completed_at||new Date().toISOString()):null,updated_at:new Date().toISOString()};
  const token=centralSession.access_token;
  if(wasVirtual){
   await sbFetch("/rest/v1/esta_maintenance_plan_occurrences",{method:"POST",token,body:{id,item_id:o.item.id,building_id:B,event_key:old.event_key,planned_month:monthISO(o.scheduled),location:o.item.subsystem||"",source_kind:"year",...fields}});
  }else{
   await sbFetch("/rest/v1/esta_maintenance_plan_occurrences?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"PATCH",token,body:fields});
  }
  await verifyMaintenanceSaved("esta_maintenance_plan_occurrences",id,{planned_date:fields.planned_date,status:fields.status,result_note:fields.result_note,result_code:fields.result_code,completed_by:fields.completed_by,postpone_reason:fields.postpone_reason,image_paths:fields.image_paths},B);
  const next={...old,...fields,id,item_id:o.item.id,building_id:B};
  if(wasVirtual)stored.push(next);else stored=stored.map(x=>x.id===id?next:x);
  clearScheduleCache();closeDialog();render();notifyMaintenance130Nav();if(LINK_BUILDINGS.has(B))window.estaUpgradeAssets?.refresh?.().catch(()=>{});
  toast(statusValue==="completed"?"✓ Hoàn thành đã lưu đủ minh chứng":statusValue==="awaiting_approval"?"Đã chuyển Chờ duyệt":"✓ Đã lưu tiến độ bảo trì");
  if(statusValue==="completed"&&resultCode==="fail")toast("Lưu ý: kết quả KHÔNG ĐẠT. Cần xử lý tiếp.");
 }catch(err){saveError("Chưa xác nhận lưu bảo trì: "+(err.message||err));}
 finally{busy=false;btn.disabled=false;}
}
async function deletePlan(id){
 if(busy||!canWrite()||!active())return;
 const item=items.find(x=>x.id===id&&!x.deleted_at);if(!item)return;
 if(!confirm('Chuyển kế hoạch "'+item.work_title+'" vào thùng lưu trữ? Kế hoạch sẽ bị ẩn khỏi danh sách nhưng vẫn giữ lịch sử và nhật ký kiểm tra.'))return;
 busy=true;
 try{
  const deleted_at=new Date().toISOString(),token=centralSession.access_token;
  await sbFetch("/rest/v1/esta_maintenance_plan_items?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"PATCH",token,body:{deleted_at,deletion_reason:"Ẩn theo xác nhận trên giao diện bảo trì ESTA"}});
  items=items.map(x=>x.id===id?{...x,deleted_at}:x);
  clearScheduleCache();render();notifyMaintenance130Nav();if(LINK_BUILDINGS.has(B))window.estaUpgradeAssets?.refresh?.().catch(()=>{});toast("Đã xóa mềm; lịch sử được giữ trong Audit.");
 }catch(err){toast("Không thể xóa mềm: "+(err.message||err));}
 finally{busy=false;}
}
async function loadAuditHistory(){
 const box=$("m130AuditHistory");
 if(!centralSession?.access_token)return;
 box.innerHTML='<p>Đang lấy nhật ký thao tác...</p>';
 try{
  const rows=await sbFetch("/rest/v1/esta_maintenance_audit?select=action,actor_id,changed_at,old_values,new_values&building_id=eq."+B+"&order=changed_at.desc&limit=20",{token:centralSession.access_token});
  box.innerHTML=Array.isArray(rows)&&rows.length?rows.map(r=>{
   const n=r.new_values||{},o=r.old_values||{},name=n.work_title||o.work_title||n.event_key||o.event_key||"Công việc bảo trì";
   const action=r.action==="soft_deleted"?"Xóa mềm":r.action==="created"?"Thêm mới":"Chỉnh sửa";
   const actor=r.actor_id?String(r.actor_id).slice(0,8)+"…":"Hệ thống";
   const time=r.changed_at?new Date(r.changed_at).toLocaleString("vi-VN"):"";
   return '<div class="m130AuditRow"><b>'+action+'</b><span>'+esc(name)+'</span><small>'+esc(time)+' · Tài khoản '+esc(actor)+'</small></div>';
  }).join(""):'<p>Chưa có nhật ký mới kể từ khi bật audit.</p>';
 }catch(e){box.textContent="Không tải được nhật ký: "+(e.message||e);}
}
async function exportPdf(){
 if(!active()||!ready)return;
 if(typeof window.exportGenericEstaPdf!=="function")return toast("Chức năng PDF chưa sẵn sàng.");
 const list=scopeEvents(getYearSchedule(year).filter(o=>Number(o.scheduled.slice(5,7))===month));
 if(!list.length)return toast("Không có công việc để xuất.");
 const rows=list.map((o,k)=>[k+1,o.item.system_group,o.item.work_title,shownDate(o),demo(o.item)?"Mẫu · Chưa xác minh":status(o)[0],o.item.assigned_to||"Kỹ thuật",[o.item.subsystem,o.event.result_note,interval(o.item)?("Chu kỳ "+interval(o.item)+" tháng"):""].filter(Boolean).join(" · ")]);
 try{await window.exportGenericEstaPdf({title:"BÁO CÁO BẢO TRÌ THIẾT BỊ",sectionLabel:"KẾ HOẠCH BẢO TRÌ "+projectLabel().toUpperCase(),tableLabel:"CÔNG VIỆC BẢO TRÌ",periodLabel:"THÁNG "+pad(month)+"/"+year,subtitle:"Công việc mẫu chỉ là minh họa, chưa được xác nhận hoàn thành thực tế.",filename:"ESTA_BaoTri_"+B+"_"+year+"_Thang"+pad(month)+".pdf",columns:[{label:"STT",weight:.5},{label:"Hệ thống",weight:1.3},{label:"Công việc",weight:2.8},{label:"Ngày",weight:1.2},{label:"Trạng thái",weight:1.3},{label:"Phụ trách",weight:1},{label:"Vị trí / KQ / Chu kỳ",weight:2.4}],rows,summaries:[{value:items.length,label:"KẾ HOẠCH"},{value:list.length,label:"CÔNG VIỆC THÁNG"},{value:list.filter(o=>o.event.status==="completed"&&!demo(o.item)).length,label:"HOÀN THÀNH ĐÃ XÁC MINH"}]});}catch(err){toast(err.message||"Lỗi xuất PDF");}
}
window.mountMaintenance130=()=>{
 const next=String(typeof currentBuilding!=="undefined"?(currentBuilding?.id||""):"");
 if(!PROJECT_IDS.has(next)){show();return;}
 if(next!==B){
  B=next;items=[];stored=[];people=[];equipmentProfiles=[];systemCatalog=[];pendingFocusPlanId="";ready=false;busy=false;currentEvent=null;currentPlan=null;
  year=new Date().getFullYear();month=new Date().getMonth()+1;viewMode=readView();layoutMode="list";
  clearScheduleCache();
  const overlay=$("m130Overlay");if(overlay)overlay.hidden=true;
  const page=$("maintenancePage");page?.classList.remove("maint130-assets-open");
  ["m130Search","m130Group","m130State","m130PriorityFilter","m130TypeFilter","m130TechnicianFilter","m130SampleFilter"].forEach(id=>{
   const el=$(id);if(!el)return;if(el.tagName==="SELECT")el.selectedIndex=0;else el.value="";
  });
 }
 const head=$("maint130")?.querySelector(".m130Header small");
 if(head)head.textContent="ESTA · "+projectLabel().toUpperCase()+" · QUẢN LÝ BẢO TRÌ";
 load(ready);
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{ensure();show();},{once:true});else{ensure();show();}
})();