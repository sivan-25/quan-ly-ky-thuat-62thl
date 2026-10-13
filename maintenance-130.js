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
let year=now.getFullYear(),month=now.getMonth()+1,items=[],stored=[],people=[],ready=false,busy=false,currentEvent=null,currentPlan=null,viewMode=readView(),scheduleCache=null;
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
function status(o){
 const e=o.event;
 if(e.status==="completed")return ["Hoàn thành","done"];
 if(e.status==="skipped")return ["Không thực hiện","skip"];
 const day=e.planned_date||o.scheduled,t=new Date(),today=t.getFullYear()+"-"+pad(t.getMonth()+1)+"-"+pad(t.getDate());
 const warning=new Date(t.getFullYear(),t.getMonth(),t.getDate()+30),soon=warning.getFullYear()+"-"+pad(warning.getMonth()+1)+"-"+pad(warning.getDate());
 return day<today?["Chưa xác nhận","late"]:day<=soon?["Sắp đến hạn","soon"]:["Đúng kế hoạch","ontrack"];
}
function ensure(){
 if($("maint130"))return;
 const page=$("maintenancePage"),anchor=page?.querySelector(".maintenanceSchedule");
 if(!page||!anchor)return;
 const root=document.createElement("section");root.id="maint130";
 root.innerHTML='<div class="m130Header"><div><small>ESTA · 130 HỒNG HÀ · QUẢN LÝ BẢO TRÌ</small><h2>Kế hoạch công việc theo tháng</h2><p>Công việc mẫu được đánh dấu riêng. Lịch lặp theo tháng lịch, không tự xác nhận hoàn thành.</p></div><div class="m130Actions"><button type="button" id="m130Pdf">Xuất PDF</button><button type="button" id="m130Reload">Làm mới</button></div></div>'+
 '<div class="m130Stats" id="m130Stats"></div><div class="m130Cal"><div class="m130Year"><button type="button" id="m130Prev" aria-label="Năm trước">‹</button><b id="m130Year">Năm 2026</b><button type="button" id="m130Next" aria-label="Năm sau">›</button></div><div class="m130Months" id="m130Months"></div></div>'+
 '<div class="m130Toolbar"><input id="m130Search" type="search" placeholder="Tìm nội dung, vị trí, hệ thống..." aria-label="Tìm công việc bảo trì"><select id="m130Group"><option value="">Tất cả hệ thống</option></select><select id="m130State"><option value="">Tất cả trạng thái</option><option value="planned">Chưa hoàn thành</option><option value="completed">Hoàn thành</option><option value="skipped">Không thực hiện</option></select></div>'+
 '<div class="m130ListTop"><div class="m130Heading"><b id="m130ListTitle">Công việc theo tháng</b><small id="m130ListCount"></small></div><div class="m130ListTools"><button type="button" id="m130Create" class="m130AddButton">＋ Thêm bảo trì</button><div class="m130ViewSwitch" role="group" aria-label="Chọn cách hiển thị"><button type="button" data-m130-view="cards" aria-pressed="true">▦ Thẻ</button><button type="button" data-m130-view="rows" aria-pressed="false">☰ Dòng</button></div><button type="button" id="m130Legacy" aria-expanded="false">Thiết bị & nhật ký <span>⌄</span></button></div></div><div class="m130List" id="m130List"></div>';
 anchor.parentNode.insertBefore(root,anchor);
 const overlay=document.createElement("div");overlay.id="m130Overlay";overlay.hidden=true;overlay.innerHTML='<div class="m130Dialog"><div class="m130ModalHead"><h3 id="m130ModalTitle">Công việc bảo trì</h3><button type="button" id="m130Close" aria-label="Đóng">×</button></div><form id="m130PlanForm" hidden>'+
 '<label>Nội dung công việc *<textarea id="m130Title" rows="2" required maxlength="500"></textarea></label><div class="m130Two"><label>Hệ thống<select id="m130System"><option>HVAC</option><option>Điện</option><option>PCCC</option><option>Cấp thoát nước</option><option>Máy phát điện</option><option>Thang máy</option><option>Chiếu sáng</option><option>Camera & an ninh</option><option>Khác</option></select></label><label>Vị trí<input id="m130Location" maxlength="160" placeholder="Tầng / khu vực"></label></div>'+
 '<div class="m130Two"><label>Ngày bắt đầu chu kỳ *<input type="date" id="m130First" required></label><label>Chu kỳ (tháng)<input type="number" id="m130Cycle" min="0" max="120" step="1" value="0" required></label></div><p class="m130Hint" id="m130NextHint">0 = không lặp. Ví dụ 10/10/2026 + 3 tháng → 10/01/2027 → 10/04/2027.</p><label>Tên kỹ thuật / người phụ trách *<input id="m130Assignee" list="m130PeopleOptions" maxlength="120" placeholder="Chọn tên kỹ thuật viên..." required></label><div class="m130PersonQuick" id="m130AssigneeQuick"></div><div class="m130Foot"><button type="button" data-m130-cancel>Hủy</button><button type="submit">Lưu kế hoạch</button></div></form>'+
 '<form id="m130EventForm" hidden><p id="m130EventInfo" class="m130Hint"></p><p id="m130ResultTip" class="m130CompleteTip" aria-live="polite">Nhập kết quả thực hiện để tự chuyển sang Hoàn thành.</p><div class="m130Two"><label>Ngày dự kiến<input id="m130EventDate" type="date" required></label><label>Trạng thái<select id="m130EventStatus"><option value="planned">Chưa xác nhận</option><option value="completed">Hoàn thành</option><option value="skipped">Không thực hiện</option></select></label></div><label>Tên kỹ thuật thực hiện<input id="m130Who" list="m130PeopleOptions" maxlength="120" placeholder="Chọn tên kỹ thuật viên..."></label><div class="m130PersonQuick" id="m130WhoQuick"></div><label>Kết quả / ghi chú<textarea id="m130Result" rows="3" maxlength="2000" placeholder="Kết quả thực tế hoặc lý do chưa thực hiện"></textarea></label><div class="m130Foot"><button type="button" data-m130-cancel>Hủy</button><button type="submit">Lưu kết quả</button></div></form><datalist id="m130PeopleOptions"></datalist></div>';
 document.body.appendChild(overlay);
 $("m130Prev").onclick=()=>{year=Math.max(2020,year-1);render();};
 $("m130Next").onclick=()=>{year=Math.min(2100,year+1);render();};
 $("m130Create").onclick=()=>openPlan();
 $("m130Pdf").onclick=exportPdf;
 $("m130Reload").onclick=()=>load(true);
 $("m130Legacy").onclick=()=>{page.classList.toggle("maint130-assets-open");$("m130Legacy").setAttribute("aria-expanded",String(page.classList.contains("maint130-assets-open")));};
 ["m130Search","m130Group","m130State"].forEach(id=>$(id).addEventListener(id==="m130Search"?"input":"change",()=>renderList()));
 root.addEventListener("click",ev=>{
  const v=ev.target.closest("[data-m130-view]"),m=ev.target.closest("[data-m130-month]"),e=ev.target.closest("[data-m130-event]"),p=ev.target.closest("[data-m130-plan]"),del=ev.target.closest("[data-m130-delete]");
  if(v){
   viewMode=v.dataset.m130View==="rows"?"rows":"cards";
   try{localStorage.setItem(VIEW_KEY,viewMode)}catch(_){}
   renderList();
  }
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
  const result=$("m130Result").value.trim(),state=$("m130EventStatus");
  if(result&&state.value==="planned")state.value="completed";
  $("m130ResultTip").textContent=result&&state.value==="completed"?"✓ Kết quả sẽ được lưu với trạng thái Hoàn thành.":"Nhập kết quả thực hiện để tự chuyển sang Hoàn thành.";
 });
 $("m130EventStatus").addEventListener("change",()=>{
  const done=$("m130EventStatus").value==="completed";
  $("m130ResultTip").textContent=done?"✓ Khi lưu, thẻ sẽ hiển thị Hoàn thành.":"Trạng thái được chọn thủ công; có thể lưu ghi chú mà chưa hoàn thành.";
 });
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
 $("m130Stats").innerHTML=[[items.length,"Kế hoạch"],[subset.length,"Công việc tháng"],[subset.filter(o=>o.event.status==="completed").length,"Đã hoàn thành"],[subset.filter(o=>status(o)[1]==="late").length,"Chưa xác nhận"],[subset.filter(o=>o.virtual).length,"Theo chu kỳ"]].map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("");
 $("m130Year").textContent="Năm "+year;
 $("m130Months").innerHTML=Array.from({length:12},(_,idx)=>{const m=idx+1,count=all.filter(o=>Number(o.scheduled.slice(5,7))===m).length;return '<button type="button" data-m130-month="'+m+'" class="'+(m===month?"sel":"")+'"><small>Th '+pad(m)+'</small><b>'+count+'</b></button>';}).join("");
 const groups=[...new Set(items.map(i=>i.system_group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi")),select=$("m130Group"),old=select.value;
 if(select.options.length!==groups.length+1||groups.some(g=>![...select.options].some(o=>o.value===g))){select.innerHTML='<option value="">Tất cả hệ thống</option>'+groups.map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join("");select.value=old;}
 renderList();
}
function renderList(){
 if(!show()||!ready)return;
 const subset=getYearSchedule(year).filter(o=>Number(o.scheduled.slice(5,7))===month); const q=$("m130Search").value.trim().toLocaleLowerCase("vi-VN"),g=select.value,s=$("m130State").value;
 const visible=subset.filter(o=>(!g||o.item.system_group===g)&&(!s||(s==="planned"?o.event.status==="planned":o.event.status===s))&&(!q||[o.item.work_title,o.item.system_group,o.item.subsystem,o.item.assigned_to].join(" ").toLocaleLowerCase("vi-VN").includes(q)));
 $("m130ListTitle").textContent="Công việc tháng "+pad(month)+"/"+year;
 $("m130ListCount").textContent=visible.length+" / "+subset.length+" công việc";
 const isCards=viewMode==="cards",list=$("m130List");
 list.classList.toggle("m130CardsMode",isCards);
 $("maint130").querySelectorAll("[data-m130-view]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.m130View===viewMode)));
 list.innerHTML=visible.map(o=>{
  const e=o.event,i=o.item,st=status(o),key=esc(e.event_key),demo=String(i.source_notes||"").startsWith("MẪU");
  const cycle=interval(i),cycleText=cycle?cycle+" tháng":"Một lần",location=esc(i.subsystem||"Chưa ghi vị trí");
  if(!isCards){
   return '<article class="m130Entry"><div class="m130Date"><b>'+fmt(e.planned_date||o.scheduled).slice(0,5)+'</b><small>'+year+'</small></div><div class="m130EntryBody"><div class="m130Pills"><span class="m130Sys">'+esc(i.system_group)+'</span><span class="m130Badge '+st[1]+'">'+st[0]+'</span>'+(demo?'<span class="m130Sample">MẪU</span>':'')+(cycle?'<span class="m130Cycle">↻ '+cycleText+'</span>':'')+'</div><h4>'+esc(i.work_title)+'</h4><p>'+location+' · Phụ trách: '+esc(i.assigned_to||"Kỹ thuật")+'</p>'+(e.result_note?'<p class="m130Result"><b>KQ:</b> '+esc(e.result_note)+'</p>':'')+'</div><div class="m130EntryActions"><button type="button" data-m130-event="'+key+'" '+(!canWrite()?"disabled":"")+'>Ghi bảo trì</button><button type="button" class="m130Edit" data-m130-plan="'+esc(i.id)+'" '+(!canWrite()?"disabled":"")+'>Sửa</button></div></article>';
  }
  const done=lastCompleted(o),upcoming=nextCardDate(o);
  const record=esc(e.event_key),editable=canWrite()?"":"disabled";
  return '<article class="m130ServiceCard m130State-'+st[1]+'">'+
   '<div class="m130CardHead"><span class="m130SystemLabel">'+esc(i.system_group)+'</span><div class="m130TopTags">'+(demo?'<span class="m130SampleTag">MẪU</span>':'')+'<span class="m130CardStatus '+st[1]+'">'+st[0]+'</span></div></div>'+
   '<h3>'+esc(i.work_title)+'</h3><p class="m130CardLocation">'+location+' · Lịch kỳ này: '+fmt(e.planned_date||o.scheduled)+'</p>'+
   '<div class="m130CardMetrics"><div><small>Gần nhất</small><strong>'+fmt(done)+'</strong></div><div><small>Kế tiếp</small><strong>'+fmt(upcoming)+'</strong></div><div><small>Chu kỳ</small><strong>'+esc(cycleText)+'</strong></div></div>'+
   '<div class="m130CardMeta"><span>Phụ trách: <b>'+esc(i.assigned_to||"Kỹ thuật")+'</b></span><span>Trạng thái: <b>'+(e.status==="completed"?"Đã hoàn thành":e.status==="skipped"?"Không thực hiện":"Đang theo dõi")+'</b></span></div>'+
   (e.result_note?'<p class="m130CardResult"><b>KQ:</b> '+esc(e.result_note)+'</p>':'')+
   '<div class="m130CardFoot"><button type="button" class="m130RecordBtn" data-m130-event="'+record+'" '+editable+'>'+(e.status==="completed"?"✓ Xem / sửa KQ":"＋ Ghi bảo trì")+'</button><button type="button" class="m130PlanBtn" data-m130-plan="'+esc(i.id)+'" '+editable+'>Sửa</button><button type="button" class="m130DeleteBtn" title="Xóa kế hoạch (có xác nhận)" aria-label="Xóa kế hoạch '+esc(i.work_title)+'" data-m130-delete="'+esc(i.id)+'" '+editable+'>×</button></div></article>';
 }).join("")||'<p class="m130Empty">Không có công việc trong tháng và bộ lọc này.</p>';
 $("m130Create").disabled=!canWrite();
}
async function load(force){
 if(!show()||busy||!centralSession?.access_token)return;
 if(ready&&!force){render();return;}
 busy=true;$("m130List").innerHTML='<p class="m130Empty">Đang tải dữ liệu bảo trì...</p>';
 try{
  const token=centralSession.access_token,[i,e]=await Promise.all([
   sbFetch("/rest/v1/esta_maintenance_plan_items?select=*&building_id=eq."+B+"&order=created_at.asc",{token}),
   sbFetch("/rest/v1/esta_maintenance_plan_occurrences?select=*&building_id=eq."+B+"&order=planned_month.asc,planned_date.asc",{token})
  ]);
  if(!active())return;
  items=Array.isArray(i)?i:[];stored=Array.isArray(e)?e:[];ready=true;render();
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
 $("m130First").value=base?.planned_date||base?.planned_month||year+"-"+pad(month)+"-10";
 $("m130First").readOnly=!!i;
 $("m130Cycle").value=interval(i);
 $("m130Assignee").value=i?.assigned_to||"Kỹ thuật";
 hint();$("m130Overlay").hidden=false;
}
async function savePlan(ev){
 ev.preventDefault();if(busy||!active()||!canWrite())return;
 const title=$("m130Title").value.trim(),date=$("m130First").value,n=Number($("m130Cycle").value);
 if(!title||!date||!Number.isInteger(n)||n<0||n>120)return toast("Kiểm tra nội dung, ngày và chu kỳ (0–120 tháng).");
 busy=true;const btn=$("m130PlanForm").querySelector("[type=submit]");btn.disabled=true;
 try{
  const token=centralSession.access_token,fields={work_title:title,system_group:$("m130System").value,subsystem:$("m130Location").value.trim(),assigned_to:$("m130Assignee").value.trim()||"Kỹ thuật",cadence:n?n+" tháng":"Không lặp"};
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
  closeDialog();render();toast("✓ Đã lưu kế hoạch bảo trì");
 }catch(err){toast("Không lưu được: "+(err.message||err));}
 finally{busy=false;btn.disabled=false;}
}
function openEvent(key){
 if(!canWrite())return;
 const o=getYearSchedule(year).find(x=>x.event.event_key===key);if(!o)return;
 currentEvent=o;
 $("m130ModalTitle").textContent=o.item.work_title;
 $("m130PlanForm").hidden=true;$("m130EventForm").hidden=false;
 $("m130EventInfo").textContent=o.item.system_group+" · "+(o.item.subsystem||"")+" · Chu kỳ: "+(interval(o.item)||"không lặp")+" tháng";
 $("m130EventDate").value=o.event.planned_date||o.scheduled;
 $("m130EventStatus").value=o.event.status==="planned"&&String(o.event.result_note||"").trim()?"completed":o.event.status;
 $("m130ResultTip").textContent=$("m130EventStatus").value==="completed"?"✓ Lưu kết quả sẽ đánh dấu Hoàn thành.":"Nhập kết quả thực hiện để tự chuyển sang Hoàn thành.";
 $("m130Who").value=o.event.completed_by||o.item.assigned_to||"Kỹ thuật";
 $("m130Result").value=o.event.result_note||"";
 $("m130Overlay").hidden=false;
}
async function saveEvent(ev){
 ev.preventDefault();
 if(busy||!currentEvent||!canWrite()||!active())return;
 const o=currentEvent,date=$("m130EventDate").value,s=$("m130EventStatus").value,who=$("m130Who").value.trim(),result=$("m130Result").value.trim();
 if(!date||date.slice(0,7)!==o.scheduled.slice(0,7))return toast("Ngày chỉnh sửa phải thuộc tháng đang lên kế hoạch.");
 if(s==="completed"&&(!who||!result))return toast("Nhập người thực hiện và kết quả bảo trì.");
 if(s==="skipped"&&!result)return toast("Nhập lý do không thực hiện.");
 busy=true;const btn=$("m130EventForm").querySelector("[type=submit]");btn.disabled=true;
 const original=o.event,wasVirtual=o.virtual,id=wasVirtual?crypto.randomUUID():original.id;
 const fields={planned_date:date,status:s,result_note:result,completed_by:s==="completed"?who:"",completed_at:s==="completed"?new Date().toISOString():null,updated_at:new Date().toISOString()};
 try{
  const token=centralSession.access_token;
  if(wasVirtual){
   await sbFetch("/rest/v1/esta_maintenance_plan_occurrences",{method:"POST",token,body:{id,item_id:o.item.id,building_id:B,event_key:original.event_key,planned_month:monthISO(o.scheduled),location:o.item.subsystem||"",source_kind:"year",...fields}});
  }else{
   await sbFetch("/rest/v1/esta_maintenance_plan_occurrences?id=eq."+encodeURIComponent(id)+"&building_id=eq."+B,{method:"PATCH",token,body:fields});
  }
  const confirmed={...original,...fields,id,building_id:B,item_id:o.item.id};
  if(wasVirtual)stored.push(confirmed);
  else stored=stored.map(x=>x.id===id?confirmed:x);
  closeDialog();
  render();
  toast(s==="completed"?"✓ Đã lưu và đánh dấu Hoàn thành":s==="skipped"?"Đã ghi nhận không thực hiện":"Đã lưu cập nhật bảo trì");
 }catch(err){toast("Lỗi lưu kết quả: "+(err.message||err));}
 finally{busy=false;btn.disabled=false;}
}
async function deletePlan(id){
 if(busy||!canWrite()||!active())return;
 const i=items.find(x=>x.id===id);if(!i)return;
 const related=stored.filter(e=>e.item_id===id);
 const message='Xóa kế hoạch "'+i.work_title+'" và '+related.length+' lần bảo trì đã lưu?\nCác kỳ lặp theo chu kỳ cũng sẽ biến mất. Không thể hoàn tác.';
 if(!confirm(message))return;
 busy=true;
 try{
  const token=centralSession.access_token;
  await sbFetch('/rest/v1/esta_maintenance_plan_occurrences?building_id=eq.'+B+'&item_id=eq.'+encodeURIComponent(id),{method:"DELETE",token});
  await sbFetch('/rest/v1/esta_maintenance_plan_items?building_id=eq.'+B+'&id=eq.'+encodeURIComponent(id),{method:"DELETE",token});
  ready=false;busy=false;await load(true);toast("Đã xóa kế hoạch bảo trì");
 }catch(err){toast("Không xóa được: "+(err.message||err));}
 finally{busy=false;}
}
async function exportPdf(){
 if(!active()||!ready)return;
 if(typeof window.exportGenericEstaPdf!=="function")return toast("Chức năng PDF chưa sẵn sàng.");
 const list=getYearSchedule(year).filter(o=>Number(o.scheduled.slice(5,7))===month);
 if(!list.length)return toast("Không có công việc để xuất.");
 const rows=list.map((o,k)=>[k+1,o.item.system_group,o.item.work_title,fmt(o.event.planned_date||o.scheduled),status(o)[0],o.item.assigned_to||"Kỹ thuật",[o.item.subsystem,o.event.result_note,interval(o.item)?("Chu kỳ "+interval(o.item)+" tháng"):""].filter(Boolean).join(" · ")]);
 try{await window.exportGenericEstaPdf({title:"BÁO CÁO BẢO TRÌ THIẾT BỊ",sectionLabel:"KẾ HOẠCH BẢO TRÌ 130 HH",tableLabel:"CÔNG VIỆC BẢO TRÌ",periodLabel:"THÁNG "+pad(month)+"/"+year,subtitle:"Công việc mẫu chỉ là minh họa, chưa được xác nhận hoàn thành thực tế.",filename:"ESTA_BaoTri_130HH_"+year+"_Thang"+pad(month)+".pdf",columns:[{label:"STT",weight:.5},{label:"Hệ thống",weight:1.3},{label:"Công việc",weight:2.8},{label:"Ngày",weight:1.2},{label:"Trạng thái",weight:1.3},{label:"Phụ trách",weight:1},{label:"Vị trí / KQ / Chu kỳ",weight:2.4}],rows,summaries:[{value:items.length,label:"KẾ HOẠCH"},{value:list.length,label:"CÔNG VIỆC THÁNG"},{value:list.filter(o=>o.event.status==="completed").length,label:"HOÀN THÀNH"}]});}catch(err){toast(err.message||"Lỗi xuất PDF");}
}
window.mountMaintenance130=()=>{if(active())load();else show();};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{ensure();show();},{once:true});else{ensure();show();}
})();