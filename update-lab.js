(()=>{
"use strict";

const UPDATE_ID="UPDATE";
const UPDATE_CACHE_KEY="esta_update_ops_cache_v1";
const SLA_RULES={
 Critical:{response:5,target:30,label:"Critical"},
 High:{response:15,target:120,label:"High"},
 Medium:{response:60,target:480,label:"Medium"},
 Low:{response:240,target:1440,label:"Low"}
};
const UPDATE_MODULES=["assets","team","shift","cost"];
let updateState={
 loaded:false,loading:null,offline:false,loadedAt:0,
 systems:[],areas:[],assets:[],records:[],incidents:[],incidentExt:[],inspections:[],
 technicians:[],skills:[],shifts:[],handovers:[],materials:[],materialTx:[],
 contractors:[],vendorScores:[],baselines:[],anomalies:[],costs:[],plans:[],meters:[]
};
let updatePmGenerating=false,updateScannerStream=null,updateScannerTimer=null,updateNotifTimer=null,updateNavSeq=0,updateCurrentRoute="";
let updateRolePreview=sessionStorage.getItem("esta_update_role_preview")||"leader";
const updateRealAdmin=()=>!!currentAccount?.is_admin;
const updateTechView=()=>!updateRealAdmin()||updateRolePreview==="technician";
const updateLeaderView=()=>updateRealAdmin()&&!updateTechView();

const updateIs=()=>String(currentBuilding?.id||"")===UPDATE_ID&&!$("#navWork")?.classList.contains("hide");
const updateTok=()=>centralSession?.access_token||"";
const uq=v=>encodeURIComponent(v??"");
const updateRest=async(table,query="")=>{
 if(!updateTok())return [];
 return sbFetch("/rest/v1/"+table+(query?"?"+query:""),{token:updateTok()});
};
const updatePost=(table,body)=>sbFetch("/rest/v1/"+table,{method:"POST",body,token:updateTok()});
const updatePatch=(table,query,body)=>sbFetch("/rest/v1/"+table+"?"+query,{method:"PATCH",body,token:updateTok()});
const uEsc=v=>esc(String(v??""));
const uNum=(v,d=0)=>Number(v||0).toLocaleString("vi-VN",{maximumFractionDigits:d});
const uMoney=v=>Number(v||0).toLocaleString("vi-VN")+" ₫";
const uDate=v=>{
 if(!v)return "—";
 try{return new Date(String(v).length===10?v+"T00:00:00":v).toLocaleDateString("vi-VN")}catch(e){return String(v)}
};
const uTime=v=>{
 if(!v)return "—";
 try{return new Date(v).toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}catch(e){return "—"}
};
const uClamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const uPriority=v=>{
 const x=String(v||"").trim();
 return ({"Khẩn cấp":"Critical","Cao":"High","Trung bình":"Medium","Bình thường":"Medium","Thấp":"Low"})[x]||(["Critical","High","Medium","Low"].includes(x)?x:"Medium");
};
const uPriorityVi=v=>({"Critical":"Khẩn cấp","High":"Cao","Medium":"Trung bình","Low":"Thấp"})[uPriority(v)]||v;
const uInitials=name=>String(name||"KT").trim().split(/\s+/).slice(-2).map(x=>x[0]||"").join("").toUpperCase();

function updateCacheSave(){
 try{
  localStorage.setItem(UPDATE_CACHE_KEY,JSON.stringify({...updateState,loading:null}));
 }catch(e){}
}
function updateCacheRead(){
 try{
  const x=JSON.parse(localStorage.getItem(UPDATE_CACHE_KEY)||"null");
  if(x&&Array.isArray(x.assets))return x;
 }catch(e){}
 return null;
}
async function updateLoad(force=false){
 if(!updateIs())return updateState;
 if(updateState.loading)return updateState.loading;
 if(!force&&updateState.loaded&&Date.now()-updateState.loadedAt<15000)return updateState;
 updateState.loading=(async()=>{
  const b="building_id=eq."+uq(UPDATE_ID);
  try{
   const r=await Promise.all([
    updateRest("ops_systems",b+"&active=eq.true&select=*&order=sort_order.asc"),
    updateRest("ops_areas",b+"&active=eq.true&select=*&order=sort_order.asc"),
    updateRest("maintenance_assets",b+"&select=*&order=criticality.asc,code.asc"),
    updateRest("maintenance_records",b+"&select=*&order=service_date.desc"),
    updateRest("incidents",b+"&select=*&order=detected_at.desc"),
    updateRest("ops_incident_extensions",b+"&select=*"),
    updateRest("inspections",b+"&select=*&order=inspection_date.desc"),
    updateRest("ops_technicians",b+"&active=eq.true&select=*&order=name.asc"),
    updateRest("ops_technician_skills",b+"&select=*"),
    updateRest("ops_shifts",b+"&active=eq.true&select=*&order=start_time.asc"),
    updateRest("ops_shift_handovers",b+"&select=*&order=handover_date.desc,created_at.desc"),
    updateRest("inventory_materials",b+"&archived_at=is.null&select=*&order=name.asc"),
    updateRest("inventory_material_transactions",b+"&select=*&order=tx_date.desc"),
    updateRest("contractors",b+"&select=*&order=name.asc"),
    updateRest("ops_vendor_scores",b+"&select=*"),
    updateRest("ops_energy_baselines",b+"&select=*"),
    updateRest("ops_energy_anomalies",b+"&select=*&order=detected_at.desc"),
    updateRest("ops_cost_entries",b+"&select=*&order=entry_date.desc"),
    updateRest("ops_maintenance_plans",b+"&active=eq.true&select=*&order=next_due_date.asc"),
    updateRest("ops_asset_meter_readings",b+"&select=*&order=reading_at.asc")
   ]);
   const keys=["systems","areas","assets","records","incidents","incidentExt","inspections","technicians","skills","shifts","handovers","materials","materialTx","contractors","vendorScores","baselines","anomalies","costs","plans","meters"];
   keys.forEach((k,i)=>updateState[k]=Array.isArray(r[i])?r[i]:[]);
   updateState.loaded=true;updateState.offline=false;updateState.loadedAt=Date.now();updateCacheSave();
  }catch(e){
   console.warn("UPDATE operations load failed",e);
   const cached=updateCacheRead();
   if(cached){
    Object.assign(updateState,cached,{loaded:true,offline:true,loadedAt:Date.now(),loading:null});
   }else{
    updateState.loaded=true;updateState.offline=true;updateState.loadedAt=Date.now();
   }
  }finally{updateState.loading=null}
  return updateState;
 })();
 return updateState.loading;
}

function updateAsset(id){return updateState.assets.find(x=>String(x.id)===String(id))}
function updateSystem(code){return updateState.systems.find(x=>x.code===code)}
function updateArea(code){return updateState.areas.find(x=>x.code===code)}
function updateContractor(id){return updateState.contractors.find(x=>String(x.id)===String(id))}
function updateIncidentExt(id){return updateState.incidentExt.find(x=>String(x.incident_id)===String(id))}
function updateVendorScore(id){return updateState.vendorScores.find(x=>String(x.contractor_id)===String(id))}
function updateStock(m){
 let q=Number(m?.opening_qty||0);
 updateState.materialTx.filter(x=>String(x.material_id)===String(m?.id)).forEach(x=>q+=(x.tx_type==="in"?1:-1)*Number(x.qty||0));
 return q;
}
function updateOpenIncidents(){
 return updateState.incidents.filter(x=>x.status!=="Đã đóng");
}
function updateOverdueTasks(){
 const td=new Date();td.setHours(0,0,0,0);
 return load().filter(x=>{
  if(x.s==="Đã hoàn thành")return false;
  const due=x.dueDate||x.d;if(!due)return false;
  const d=new Date(due+"T00:00:00");
  return d<td;
 });
}
function updateDuePlans(){
 const now=new Date(),warn=new Date();warn.setDate(warn.getDate()+7);
 return updateState.plans.filter(p=>{
  if(p.trigger_type==="meter"){
   const a=updateAsset(p.asset_id);return Number(a?.meter_value||0)>=Number(p.next_meter_due||Infinity)-Number(p.meter_interval||0)*.1;
  }
  return p.next_due_date&&new Date(p.next_due_date+"T23:59:59")<=warn;
 });
}
function updateLowStock(){
 return updateState.materials.map(m=>({...m,_stock:updateStock(m)})).filter(m=>m._stock<=Number(m.min_qty||0));
}
function updateRepeatAssets(){
 const since=Date.now()-90*86400000,map=new Map();
 updateState.incidents.forEach(i=>{
  const t=new Date(i.detected_at).getTime();if(!i.asset_id||!Number.isFinite(t)||t<since)return;
  map.set(i.asset_id,(map.get(i.asset_id)||0)+1);
 });
 return [...map.entries()].filter(([,n])=>n>=3).map(([id,n])=>({asset:updateAsset(id),count:n})).filter(x=>x.asset);
}
function updateSlaState(task){
 const due=task.resolveDueAt?new Date(task.resolveDueAt):null;
 if(!due||Number.isNaN(due.getTime())||task.s==="Đã hoàn thành")return null;
 const ms=due-Date.now(),total=Math.max(1,Number(task.slaTargetMinutes||SLA_RULES[uPriority(task.priority)].target)*60000);
 if(ms<=0)return {tone:"danger",text:"Quá SLA "+updateDuration(-ms),remaining:ms};
 const pct=ms/total;
 return {tone:pct<=.2?"danger":pct<=.45?"warn":"ok",text:"SLA còn "+updateDuration(ms),remaining:ms};
}
function updateDuration(ms){
 const mins=Math.max(0,Math.round(ms/60000));
 if(mins<60)return mins+" phút";
 const h=Math.floor(mins/60),m=mins%60;
 if(h<24)return h+" giờ"+(m?" "+m+" phút":"");
 return Math.floor(h/24)+" ngày "+(h%24)+" giờ";
}
function updateHealth(){
 let score=100,breakdown=[];
 const critical=updateOpenIncidents().filter(i=>i.severity==="Khẩn cấp").length;
 const overdue=updateOverdueTasks().length;
 const pmOver=updateState.plans.filter(p=>p.trigger_type==="calendar"&&p.next_due_date&&new Date(p.next_due_date+"T23:59:59")<new Date()).length;
 const inspections=updateState.inspections.filter(i=>["Không đạt","Cần khắc phục"].includes(i.result_status)).length;
 const low=updateLowStock().length;
 const anomaly=updateState.anomalies.filter(a=>a.status!=="Đã đóng"&&Math.abs(Number(a.variance_pct||0))>=15).length;
 const repeat=updateRepeatAssets().length;
 const sla=load().filter(x=>updateSlaState(x)?.remaining<=0).length;
 const deductions=[
  ["Sự cố Critical",critical,15,30],["Công việc quá hạn",overdue,4,16],["PM quá hạn",pmOver,5,15],
  ["Checklist cần khắc phục",inspections,3,9],["Vật tư tồn thấp",low,2,8],["Năng lượng bất thường",anomaly,5,10],
  ["Lỗi lặp 90 ngày",repeat,5,10],["Vi phạm SLA",sla,4,12]
 ];
 deductions.forEach(([label,count,weight,cap])=>{
  if(!count)return;const d=Math.min(cap,count*weight);score-=d;breakdown.push({label,count,deduction:d});
 });
 score=Math.round(uClamp(score,0,100));
 return {score,breakdown,critical,overdue,pmOver,inspections,low,anomaly,repeat,sla};
}
function updateHealthTone(score){return score>=90?"good":score>=75?"watch":score>=60?"risk":"danger"}
function updateWorkloadTone(v){return v>=80?"danger":v>=65?"warn":"good"}

function updateNotificationOwner(){
 const id=currentAccount?.id||currentAccount?.username||currentAccount?.email||me||"user";
 return String(id).replace(/[^a-zA-Z0-9_-]/g,"_");
}
function updateNotificationReadKey(){
 return "esta_update_notif_read_"+updateNotificationOwner()+"_"+(updateTechView()?"technician":"leader");
}
function updateNotificationReadSet(){
 try{
  const rows=JSON.parse(localStorage.getItem(updateNotificationReadKey())||"[]");
  return new Set(Array.isArray(rows)?rows:[]);
 }catch(e){return new Set()}
}
function updateNotificationWriteSet(set){
 try{
  const rows=[...set].slice(-120);
  localStorage.setItem(updateNotificationReadKey(),JSON.stringify(rows));
 }catch(e){}
}
function updateCurrentTechnician(){
 const accountId=String(currentAccount?.id||"");
 if(!accountId)return null;
 return updateState.technicians.find(t=>String(t.profile_id||"")===accountId)||null;
}
function updateTaskAssignedToCurrentTech(task,tech){
 if(!tech)return true;
 const names=Array.isArray(task.performers)?task.performers:[task.a].filter(Boolean);
 return names.some(n=>String(n).trim()===String(tech.name).trim());
}
function updateNotificationItemKey(item){
 return [
  item.kind||item.action||"item",
  item.id||item.title||"",
  item.state||"",
  item.cycle||""
 ].join(":");
}
function updateBuildNotifications(limit=5){
 const tech=updateTechView()?updateCurrentTechnician():null;
 const now=Date.now(),items=[],criticalTaskIds=new Set();

 updateOpenIncidents().forEach(i=>{
  if(i.severity!=="Khẩn cấp")return;
  if(i.related_task_id)criticalTaskIds.add(String(i.related_task_id));
  const ext=updateIncidentExt(i.id);
  items.push({
   kind:"incident",id:i.id,action:"incident",score:1000,tone:"danger",icon:"!",
   state:"critical",cycle:String(i.detected_at||""),
   title:i.symptom||i.incident_code||"Sự cố Critical",
   meta:(i.incident_code||"Sự cố")+" · "+(i.area||"Không rõ vị trí"),
   reason:"Critical · cần xử lý ngay"
  });
 });

 load().forEach(task=>{
  if(task.s==="Đã hoàn thành"||criticalTaskIds.has(String(task.id)))return;
  if(updateTechView()&&!updateTaskAssignedToCurrentTech(task,tech))return;
  const sla=updateSlaState(task);
  const due=task.dueDate||task.d;
  const dueMs=due?new Date(due+"T23:59:59").getTime():NaN;
  let candidate=null;
  if(sla&&sla.remaining<=0){
   candidate={kind:"task",id:task.id,action:"task",score:950,tone:"danger",icon:"⏱",state:"sla-breached",cycle:String(task.resolveDueAt||due||""),title:task.c||"Work Order",meta:(task.woCode||"WO")+" · "+sla.text,reason:"SLA đã quá hạn"};
  }else if(sla&&sla.tone==="danger"){
   candidate={kind:"task",id:task.id,action:"task",score:900,tone:"danger",icon:"⏱",state:"sla-danger",cycle:String(task.resolveDueAt||due||""),title:task.c||"Work Order",meta:(task.woCode||"WO")+" · "+sla.text,reason:"SLA sắp hết"};
  }else if(Number.isFinite(dueMs)&&dueMs<now){
   candidate={kind:"task",id:task.id,action:"task",score:850,tone:"warn",icon:"↗",state:"overdue",cycle:String(due),title:task.c||"Work Order quá hạn",meta:(task.woCode||"WO")+" · Hạn "+uDate(due),reason:"Công việc quá hạn"};
  }else if(sla&&sla.tone==="warn"){
   candidate={kind:"task",id:task.id,action:"task",score:700,tone:"warn",icon:"⏱",state:"sla-warn",cycle:String(task.resolveDueAt||due||""),title:task.c||"Work Order",meta:(task.woCode||"WO")+" · "+sla.text,reason:"Cần ưu tiên theo SLA"};
  }
  if(candidate)items.push(candidate);
 });

 updateState.plans.forEach(p=>{
  const asset=updateAsset(p.asset_id);if(!asset)return;
  if(updateTechView()&&tech&&asset.assigned_to&&String(asset.assigned_to)!==String(tech.name))return;
  if(p.trigger_type==="calendar"&&p.next_due_date){
   const dueMs=new Date(p.next_due_date+"T23:59:59").getTime();
   const days=(dueMs-now)/86400000;
   if(days<0){
    items.push({kind:"pm",entityKey:"pm:"+p.id,id:p.asset_id,action:"asset",score:800,tone:"warn",icon:"⚙",state:"pm-overdue",cycle:p.next_due_date,title:p.title,meta:(asset.code||"")+" · quá hạn "+uDate(p.next_due_date),reason:"PM quá hạn"});
   }else if(days<=7){
    items.push({kind:"pm",entityKey:"pm:"+p.id,id:p.asset_id,action:"asset",score:650,tone:"info",icon:"⚙",state:"pm-due",cycle:p.next_due_date,title:p.title,meta:(asset.code||"")+" · đến hạn "+uDate(p.next_due_date),reason:"PM sắp đến hạn"});
   }
  }else if(p.trigger_type==="meter"){
   const current=Number(asset.meter_value||0),threshold=Number(p.next_meter_due||Infinity);
   if(current>=threshold){
    items.push({kind:"pm",entityKey:"pm:"+p.id,id:p.asset_id,action:"asset",score:810,tone:"warn",icon:"⚙",state:"pm-meter-due",cycle:String(threshold),title:p.title,meta:(asset.code||"")+" · "+uNum(current)+" / "+uNum(threshold)+" "+(p.meter_unit||""),reason:"PM theo meter đã đến hạn"});
   }else if(Number.isFinite(threshold)&&threshold>0&&current>=threshold-Number(p.meter_interval||0)*.1){
    items.push({kind:"pm",entityKey:"pm:"+p.id,id:p.asset_id,action:"asset",score:640,tone:"info",icon:"⚙",state:"pm-meter-near",cycle:String(threshold),title:p.title,meta:(asset.code||"")+" · còn "+uNum(threshold-current)+" "+(p.meter_unit||""),reason:"PM theo meter sắp đến hạn"});
   }
  }
 });



 if(updateLeaderView()){
  updateLowStock().forEach(m=>items.push({
   kind:"stock",id:m.id,action:"inventory",score:520,tone:"info",icon:"□",state:"low-stock",
   cycle:String(m._stock)+"-"+String(m.min_qty),title:m.name,
   meta:"Tồn "+uNum(m._stock)+" "+m.unit+" · Min "+uNum(m.min_qty),
   reason:"Vật tư dưới tồn tối thiểu"
  }));
  updateState.anomalies.filter(a=>a.status!=="Đã đóng"&&Math.abs(Number(a.variance_pct||0))>=15).forEach(a=>items.push({
   kind:"energy",id:a.id,action:"energy",score:500,tone:"info",icon:"⌁",state:"energy-anomaly",
   cycle:String(a.detected_at||a.period_label||""),title:"Bất thường "+(a.meter_type==="water"?"nước":a.meter_type==="electric"?"điện":a.meter_type),
   meta:(Number(a.variance_pct)>0?"+":"")+uNum(a.variance_pct,1)+"% so baseline",
   reason:"Cần kiểm tra mức tiêu thụ"
  }));
 }

 const dedup=new Map();
 items.forEach(item=>{
  const entity=item.entityKey||(item.kind==="task"?"task:"+item.id:item.kind+":"+item.id);
  const prev=dedup.get(entity);
  if(!prev||item.score>prev.score)dedup.set(entity,item);
 });
 const read=updateNotificationReadSet();
 return [...dedup.values()]
  .sort((a,b)=>b.score-a.score||String(a.title).localeCompare(String(b.title),"vi"))
  .slice(0,Math.max(1,limit))
  .map(item=>({...item,key:updateNotificationItemKey(item),read:read.has(updateNotificationItemKey(item))}));
}
function updateNotificationScopeLabel(){
 const tech=updateTechView()?updateCurrentTechnician():null;
 return tech?"Ưu tiên của "+tech.name:(updateTechView()?"Ưu tiên kỹ thuật · toàn dự án":"Ưu tiên điều hành · UPDATE");
}
function updateRefreshNotifications(){
 if(!updateIs())return;
 const rows=updateBuildNotifications(5),unread=rows.filter(x=>!x.read).length;
 const bell=document.querySelector(".headerBell");
 if(bell){
  bell.classList.add("updateNotificationBell");
  bell.setAttribute("aria-label","Thông báo · "+unread+" chưa xem");
  bell.dataset.count=String(unread);
  const dot=bell.querySelector("i");
  if(dot){dot.textContent=unread>9?"9+":String(unread);dot.classList.toggle("hide",unread===0)}
 }
 const mobile=$("#updateMobileNotifBadge");
 if(mobile){mobile.textContent=unread>9?"9+":String(unread);mobile.classList.toggle("hide",unread===0)}
 if(!$("#updateNotificationCenter")?.classList.contains("hide"))updateRenderNotificationCenter();
 const focus=$("#updateFocusNow");if(focus&&focus.innerHTML)updateRenderFocusNow();
}
function updateMarkNotificationRead(key){
 if(!key)return;
 const set=updateNotificationReadSet();set.add(key);updateNotificationWriteSet(set);updateRefreshNotifications();
}
function updateMarkAllNotificationsRead(){
 const set=updateNotificationReadSet();
 updateBuildNotifications(5).forEach(x=>set.add(x.key));
 updateNotificationWriteSet(set);updateRefreshNotifications();
}
function updateRenderNotificationCenter(){
 const body=$("#updateNotificationBody");if(!body)return;
 const rows=updateBuildNotifications(5),unread=rows.filter(x=>!x.read).length;
 $("#updateNotificationScope")&&($("#updateNotificationScope").textContent=updateNotificationScopeLabel());
 $("#updateNotificationUnread")&&($("#updateNotificationUnread").textContent=unread?unread+" chưa xem":"Đã xem hết");
 body.innerHTML=rows.length?rows.map((x,i)=>
  '<button class="updateNotifRow '+x.tone+(x.read?' read':' unread')+'" data-notif-key="'+uEsc(x.key)+'" data-notif-action="'+uEsc(x.action)+'" data-notif-id="'+uEsc(x.id||"")+'">'+
   '<span class="updateNotifRank">'+String(i+1).padStart(2,"0")+'</span>'+
   '<i>'+uEsc(x.icon)+'</i>'+
   '<div><b>'+uEsc(x.title)+'</b><small>'+uEsc(x.meta)+'</small><em>'+uEsc(x.reason)+'</em></div>'+
   '<strong>'+(x.read?'Đã xem':'Mới')+'</strong><span class="updateNotifArrow">→</span>'+
  '</button>'
 ).join(""):'<div class="updateNotifEmpty"><span>✓</span><b>Không có việc khẩn cần xử lý</b><p>Notification Center chỉ hiển thị tối đa 5 việc ưu tiên nhất.</p></div>';
 body.querySelectorAll("[data-notif-action]").forEach(b=>b.onclick=()=>{
  updateMarkNotificationRead(b.dataset.notifKey);
  updateCloseNotificationCenter();
  updateAttentionAction(b.dataset.notifAction,b.dataset.notifId);
 });
}
function updateOpenNotificationCenter(){
 if(!updateIs())return;
 updateRenderNotificationCenter();
 $("#updateNotificationCenter")?.classList.remove("hide");
 requestAnimationFrame(()=>$("#updateNotificationCenter")?.classList.add("show"));
}
function updateCloseNotificationCenter(){
 const el=$("#updateNotificationCenter");if(!el)return;
 el.classList.remove("show");
 setTimeout(()=>el.classList.add("hide"),160);
}
function updateStartNotificationTimer(){
 if(updateNotifTimer)clearInterval(updateNotifTimer);
 updateNotifTimer=setInterval(()=>{if(updateIs())updateRefreshNotifications()},30000);
}
function updateStopNotificationTimer(){
 if(updateNotifTimer){clearInterval(updateNotifTimer);updateNotifTimer=null}
}


function updateInjectShell(){
 if($("#navUpdateAssets"))return;
 const navWork=$("#navWork");
 if(navWork){
  navWork.insertAdjacentHTML("afterend",
   '<button id="navUpdateAssets" class="updateOnlyNav hide"><svg viewBox="0 0 24 24"><path d="M4 19h16M6 16V8h12v8M9 8V5h6v3M9 12h2M13 12h2"/></svg><span>Tài sản & Thiết bị</span></button>'
  );
 }
 const topbar=document.querySelector(".estaTopbar");
 if(topbar&&!$("#topUpdateTitle")){
  const holder=document.createElement("div");holder.id="topUpdateTitle";holder.className="topModuleTitle hide updateTopTitle";
  holder.innerHTML='<div class="topModuleIcon"><svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V8h12v12M9 8V5h6v3M9 12h2M13 12h2M9 16h6"/></svg></div><div><h1 id="topUpdateHeading">ESTA Operations</h1><p>UPDATE · THỬ NGHIỆM</p></div>';
  const menu=$("#menu");menu?.insertAdjacentElement("afterend",holder);
 }
 const main=document.querySelector("main");
 if(main&&!$("#updateAssetsPage")){
  main.insertAdjacentHTML("beforeend",
   '<div id="updateAssetsPage" class="page modulePage updateOpsPage hide"></div>'+
   '<div id="updateTeamPage" class="page modulePage updateOpsPage hide"></div>'+
   '<div id="updateShiftPage" class="page modulePage updateOpsPage hide"></div>'+
   '<div id="updateCostPage" class="page modulePage updateOpsPage hide"></div>'
  );
 }
 if(!$("#updateTrialRibbon")){
  const r=document.createElement("div");r.id="updateTrialRibbon";r.className="updateTrialRibbon hide";
  r.title="Môi trường thử nghiệm · Không ảnh hưởng dự án thật";
  r.setAttribute("aria-label","UPDATE · Môi trường thử nghiệm");
  r.innerHTML=
   '<span class="updateTrialEnvIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-5.2 8.7A2.8 2.8 0 0 0 7.2 21h9.6a2.8 2.8 0 0 0 2.4-4.3L14 8V3"/><path d="M7.5 15h9"/></svg></span>'+
   '<span class="updateTrialMeta"><b>UPDATE</b><small>TEST</small></span>'+
   '<button id="updateRolePreviewBtn" type="button" title="Xem như Kỹ thuật viên" aria-label="Xem như Kỹ thuật viên">'+
    '<svg class="updateRoleSwitchIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h13M17 4l3 3-3 3M17 17H4M7 14l-3 3 3 3"/></svg>'+
    '<span class="updateRoleLabel">Leader</span>'+
   '</button>';
  const account=document.querySelector(".estaTopbar .account");
  const topbar=document.querySelector(".estaTopbar");
  if(account)account.insertAdjacentElement("beforebegin",r);
  else if(topbar)topbar.appendChild(r);
  else document.body.appendChild(r);
 }
 if(!$("#updateMobileNav")){
  const n=document.createElement("nav");n.id="updateMobileNav";n.className="updateMobileNav hide";
  n.innerHTML=
   '<button data-update-mobile="home" class="updateMobileHome"><span>⌂</span><b>Hôm nay</b><i id="updateMobileNotifBadge" class="updateMobileNotifBadge hide"></i></button>'+
   '<button data-update-mobile="work"><span>☑</span><b>Công việc</b></button>'+
   '<button class="scan" data-update-mobile="scan"><span>⌗</span><b>SCAN QR</b></button>'+
   '<button data-update-mobile="incident"><span>!</span><b>Sự cố</b></button>'+
   '<button data-update-mobile="more"><span>•••</span><b>Thêm</b></button>';
  document.body.appendChild(n);
 }
 updateInjectModals();
 updateBindNav();
 $("#updateRolePreviewBtn")?.addEventListener("click",()=>{
   if(!updateRealAdmin())return;
   updateRolePreview=updateTechView()?"leader":"technician";
   sessionStorage.setItem("esta_update_role_preview",updateRolePreview);
   updateApplyMode();
   if($("#homePage")&&!$("#homePage").classList.contains("hide"))updateRenderCommandCenter();
   else if(["updateTeamPage","updateShiftPage","updateCostPage"].some(id=>!$("#"+id)?.classList.contains("hide")))showHome();
 });

}
function updateInjectModals(){
 if($("#updateAssetDrawer"))return;
 document.body.insertAdjacentHTML("beforeend",
  '<div id="updateAssetDrawer" class="updateDrawer hide"><button class="updateDrawerBackdrop" data-update-close-drawer></button><aside><header><div><span>ASSET PASSPORT</span><h2 id="updateAssetDrawerTitle">Thiết bị</h2></div><button data-update-close-drawer>×</button></header><div id="updateAssetDrawerBody"></div></aside></div>'+
  '<div id="updateHealthModal" class="modal hide"><div class="modalCard updateModalCard"><button class="modalClose" data-update-close-modal="updateHealthModal">×</button><div id="updateHealthModalBody"></div></div></div>'+
  '<div id="updateAiModal" class="modal hide"><div class="modalCard updateModalCard updateAiCard"><button class="modalClose" data-update-close-modal="updateAiModal">×</button><span class="updateEyebrow">ESTA AI · PILOT</span><h3>Trợ lý điều hành kỹ thuật</h3><p class="updateMuted">Phân tích dữ liệu UPDATE hiện tại. AI chỉ gợi ý, không tự đóng công việc hay ra quyết định thay Leader.</p><div class="updateAiPrompts"><button data-ai="attention">Hôm nay cần quan tâm gì?</button><button data-ai="risk">Thiết bị nào rủi ro?</button><button data-ai="report">Soạn tóm tắt báo cáo tuần</button></div><div id="updateAiAnswer" class="updateAiAnswer">Chọn một câu hỏi nhanh để bắt đầu.</div></div></div>'+
  '<button id="updateAiButton" class="updateAiButton hide" type="button"><span>✦</span> ESTA AI</button>'+
  '<div id="updateScannerModal" class="modal hide"><div class="modalCard updateModalCard updateScannerCard"><button class="modalClose" data-update-close-modal="updateScannerModal">×</button><span class="updateEyebrow">QUICK SCAN</span><h3>Quét QR thiết bị</h3><p class="updateMuted">Đưa camera vào QR ESTA trên thiết bị hoặc nhập mã thiết bị.</p><video id="updateScannerVideo" playsinline muted></video><p id="updateScannerStatus" class="updateScannerStatus"></p><div class="updateScannerManual"><input id="updateScannerCode" placeholder="VD: FWP-01"><button id="updateScannerOpen" type="button">Mở thiết bị</button></div></div></div>'+
  '<div id="updateQuickModal" class="modal hide"><div class="modalCard updateModalCard"><button class="modalClose" data-update-close-modal="updateQuickModal">×</button><div id="updateQuickModalBody"></div></div></div>'+
  '<div id="updateNotificationCenter" class="updateNotificationCenter hide"><button class="updateNotifBackdrop" id="updateNotificationBackdrop" aria-label="Đóng thông báo"></button><aside>'+
   '<header><div><span>NOTIFICATION CENTER</span><h2>5 việc cần làm ngay</h2><p id="updateNotificationScope">Ưu tiên kỹ thuật</p></div><button id="updateNotificationClose" aria-label="Đóng">×</button></header>'+
   '<div class="updateNotifToolbar"><b id="updateNotificationUnread">0 chưa xem</b><button id="updateNotificationReadAll" type="button">Đánh dấu đã xem</button></div>'+
   '<div id="updateNotificationBody" class="updateNotificationBody"></div>'+
   '<footer><span>Chỉ hiển thị việc đang cần hành động · không thay thế trạng thái Work Order/Sự cố</span></footer>'+
  '</aside></div>'
 );
 document.querySelectorAll("[data-update-close-drawer]").forEach(b=>b.onclick=updateCloseAssetDrawer);
 document.querySelectorAll("[data-update-close-modal]").forEach(b=>b.onclick=()=>updateCloseModal(b.dataset.updateCloseModal));
 $("#updateAiButton").onclick=()=>{$("#updateAiModal").classList.remove("hide");updateAiAnswer("attention")};
 document.querySelectorAll("[data-ai]").forEach(b=>b.onclick=()=>updateAiAnswer(b.dataset.ai));
 $("#updateScannerOpen").onclick=()=>updateOpenAssetByCode($("#updateScannerCode").value);
 $("#updateScannerModal").addEventListener("click",e=>{if(e.target===$("#updateScannerModal"))updateCloseModal("updateScannerModal")});
 const bell=document.querySelector(".headerBell");
 if(bell&&!bell.dataset.updateNotifBound){
  bell.dataset.updateNotifBound="1";
  bell.onclick=()=>{if(updateIs())updateOpenNotificationCenter()};
 }
 $("#updateNotificationBackdrop").onclick=updateCloseNotificationCenter;
 $("#updateNotificationClose").onclick=updateCloseNotificationCenter;
 $("#updateNotificationReadAll").onclick=updateMarkAllNotificationsRead;
}
function updateBindNav(){
 const map={navUpdateAssets:"assets",navUpdateTeam:"team",navUpdateShift:"shift",navUpdateCost:"cost"};
 Object.entries(map).forEach(([id,name])=>{const b=$("#"+id);if(b)b.onclick=()=>updateShowStandalone(name)});
 $("#updateMobileNav")?.querySelectorAll("[data-update-mobile]").forEach(b=>b.onclick=()=>{
  const a=b.dataset.updateMobile;
  if(a==="home")showHome();
  if(a==="work")showModule("work");
  if(a==="incident")showModule("incident");
  if(a==="scan")updateOpenScanner();
  if(a==="more")setMobileMenuOpen(true);
 });
}

function updateRefreshRoleChip(){
 const roleBtn=$("#updateRolePreviewBtn");
 const ribbon=$("#updateTrialRibbon");
 if(!roleBtn)return;
 const tech=updateTechView();
 const label=roleBtn.querySelector(".updateRoleLabel");
 if(label)label.textContent=tech?"KTV":"Leader";
 const hint=tech?"Trở về chế độ Leader":"Xem như Kỹ thuật viên";
 roleBtn.title=hint;
 roleBtn.setAttribute("aria-label",hint);
 ribbon?.classList.toggle("isTechnician",tech);
}

function updateApplyMode(){
 updateInjectShell();
 const on=updateIs()&&($("#adminPage")?.classList.contains("hide")??true);
 $("#app")?.classList.toggle("updateProjectMode",on);
 document.querySelectorAll(".updateOnlyNav").forEach(x=>x.classList.toggle("hide",!on));
 $("#updateTrialRibbon")?.classList.toggle("hide",!on);
 $("#updateMobileNav")?.classList.toggle("hide",!on);
 $("#updateAiButton")?.classList.toggle("hide",!on);
 $("#app")?.classList.toggle("updateTechnicianView",on&&updateTechView());
 if(on){
  ["navUpdateTeam","navUpdateShift","navUpdateCost"].forEach(id=>$("#"+id)?.classList.add("hide"));
  const roleBtn=$("#updateRolePreviewBtn");
  if(roleBtn){
    roleBtn.classList.toggle("hide",!updateRealAdmin());
    updateRefreshRoleChip();
  }
  document.querySelectorAll(".buildingNameText").forEach(x=>x.textContent="ESTA UPDATE · Sandbox thử nghiệm");
  updateEnhanceWorkForm();
  updateLoad().then(()=>{updateEnsurePmOrders();updateDecorateEnergyPage();updateDecorateIncidentPage();updateDecorateInventoryPage();updateDecorateContractorPage();updateRefreshNotifications()});
  updateStartNotificationTimer();
 }else{
  document.querySelectorAll(".updateIntelligencePanel,.updateIntelligenceStrip").forEach(x=>x.remove());
  updateStopScanner();
  updateStopNotificationTimer();
  updateCloseNotificationCenter();
  const bell=document.querySelector(".headerBell");
  if(bell){
   bell.classList.remove("updateNotificationBell");
   delete bell.dataset.count;
   const dot=bell.querySelector("i");if(dot){dot.textContent="";dot.classList.remove("hide")}
  }
 }
}
function updateHideStandalonePages(){
 document.querySelectorAll(".updateOpsPage").forEach(x=>x.classList.add("hide"));
 document.querySelectorAll(".updateOnlyNav").forEach(x=>x.classList.remove("active"));
 $("#topUpdateTitle")?.classList.add("hide");
 $("#app")?.classList.remove("updateStandaloneMode");
}
function updateHideDemoFeaturePages(){
 document.querySelectorAll(".demoFeaturePage").forEach(x=>x.classList.add("hide"));
 document.querySelectorAll(".demoTopTitle").forEach(x=>x.classList.add("hide"));
 document.querySelectorAll(".demoOnlyNav").forEach(x=>x.classList.remove("active"));
 ["incident","inspection","documents","reports"].forEach(n=>$("#app")?.classList.remove(n+"Mode"));
}
function updateResetRouteShell(){
 [
  "#homePage","#adminPage","#workPage","#energyPage","#inventoryPage","#maintenancePage",
  "#contractorPage","#constructionMaterialPage"
 ].forEach(sel=>$(sel)?.classList.add("hide"));
 updateHideStandalonePages();
 updateHideDemoFeaturePages();
 $("#workHero")?.classList.add("hide");
 $("#energyHero")?.classList.add("hide");
 document.querySelectorAll(".topModuleTitle").forEach(x=>x.classList.add("hide"));
 document.querySelectorAll(".estaNav button").forEach(x=>x.classList.remove("active"));
 $("#app")?.classList.remove(
  "adminMode","homeMode","workMode","energyMode","inventoryMode","maintenanceMode",
  "contractorMode","constructionMode","incidentMode","inspectionMode","documentsMode","reportsMode",
  "updateStandaloneMode"
 );
}
function updateBeginRoute(route){
 updateCurrentRoute=route;
 updateNavSeq+=1;
 return updateNavSeq;
}
function updateRouteStillActive(seq,route){
 return seq===updateNavSeq&&updateCurrentRoute===route&&updateIs();
}
function updateRenderStandaloneNow(name){
 if(name==="assets")updateRenderAssets();
 if(name==="team")updateRenderTeam();
 if(name==="shift")updateRenderShift();
 if(name==="cost")updateRenderCost();
}

function updateSetTop(title,subtitle){
 document.querySelectorAll(".topModuleTitle").forEach(x=>x.classList.add("hide"));
 const t=$("#topUpdateTitle");if(t){
  t.classList.remove("hide");$("#topUpdateHeading").textContent=title;
  const p=t.querySelector("p");if(p)p.textContent=subtitle||"UPDATE · THỬ NGHIỆM";
 }
}
function updateShowStandalone(name){
 if(!updateIs())return;
 if(["team","shift","cost"].includes(name)){showHome();return}
 const route="standalone:"+name;
 const id={assets:"Assets",team:"Team",shift:"Shift",cost:"Cost"}[name];
 const page=$("#update"+id+"Page");
 if(!id||!page)return;
 if(updateCurrentRoute===route&&!page.classList.contains("hide")){
  setMobileMenuOpen(false,true);
  return;
 }
 const seq=updateBeginRoute(route);
 closeWorkFilter?.();
 updateResetRouteShell();
 page.classList.remove("hide");
 $("#navUpdate"+id)?.classList.add("active");
 $("#app").classList.add("updateStandaloneMode","updateProjectMode");
 updateSetTop({assets:"Tài sản & Thiết bị",team:"Nhân sự kỹ thuật",shift:"Ca trực & Bàn giao",cost:"Chi phí & KPI"}[name]);
 setMobileMenuOpen(false,true);

 // Render immediately from the current cache so a navigation click never waits on network.
 if(updateState.loaded)updateRenderStandaloneNow(name);
 else page.innerHTML='<div class="updateLoading">Đang tải dữ liệu '+({assets:"tài sản",team:"nhân sự",shift:"ca trực",cost:"chi phí"}[name]||"")+'...</div>';

 updateLoad(false).then(()=>{
  if(!updateRouteStillActive(seq,route))return;
  updateRenderStandaloneNow(name);
  updateRefreshNotifications();
 }).catch(e=>console.warn("UPDATE route data refresh skipped",e));
}

function updateEnsureCommandCenter(){
 const page=$("#homePage");if(!page)return null;
 let el=$("#updateCommandCenter");
 if(!el){el=document.createElement("section");el.id="updateCommandCenter";el.className="updateCommandCenter";page.prepend(el)}
 return el;
}
async function updateRenderCommandCenter(){
 if(!updateIs())return;
 const root=updateEnsureCommandCenter();if(!root)return;
 root.innerHTML='<div class="updateLoading">Đang tổng hợp Trung tâm điều hành...</div>';
 await updateLoad();
 const h=updateHealth(),tasks=load(),critical=updateOpenIncidents().filter(i=>i.severity==="Khẩn cấp");
 const overdue=updateOverdueTasks(),plans=updateDuePlans(),low=updateLowStock(),anoms=updateState.anomalies.filter(x=>x.status!=="Đã đóng");
 const systemCards=updateState.systems.map(s=>{
  const aa=updateState.assets.filter(a=>a.system_code===s.code);if(!aa.length)return "";
  const avg=Math.round(aa.reduce((z,a)=>z+Number(a.health_score||100),0)/aa.length);
  return '<button class="updateSystemHealth" data-update-system="'+uEsc(s.code)+'"><span>'+uEsc(s.icon||"•")+'</span><div><b>'+uEsc(s.name)+'</b><small>'+aa.length+' thiết bị</small></div><strong class="'+updateHealthTone(avg)+'">'+avg+'</strong></button>';
 }).filter(Boolean).join("");



 root.innerHTML=
  '<div class="updateHero">'+
   '<div class="updateHeroCopy"><div class="updateHeroTags"><span>ESTA OPERATIONS</span><b>THỬ NGHIỆM</b><i class="'+(updateState.offline?"offline":"online")+'">'+(updateState.offline?"OFFLINE CACHE":"LIVE DATA")+'</i></div>'+
   '<h1>Technical Command Center</h1><p>Một màn hình để thấy ngay hệ thống rủi ro, việc quá hạn và hạng mục cần ưu tiên.</p>'+
   '<div class="updateHeroActions"><button data-update-action="work-new">＋ Tạo Work Order</button><button data-update-action="scan">⌗ Scan QR</button><button data-update-action="ai">✦ Hỏi ESTA AI</button></div></div>'+
   '<button class="updateHealthScore '+updateHealthTone(h.score)+'" data-update-action="health"><span>TECHNICAL HEALTH</span><strong>'+h.score+'</strong><small>/100 · bấm để xem lý do</small></button>'+
  '</div>'+
  '<section id="updateFocusNow" class="updateFocusNow"></section>'+
  '<div class="updateKpiGrid">'+
   updateKpi("Critical",h.critical,"Sự cố cần xử lý","danger","incident")+
   updateKpi("Quá hạn",h.overdue,"Work Order","warn","work")+
   updateKpi("PM",h.pmOver,"Quá hạn bảo trì","warn","maintenance")+
   updateKpi("SLA",Math.max(0,100-Math.min(40,h.sla*10))+"%","Tuân thủ ước tính",h.sla?"warn":"good","work")+
   updateKpi("Tồn thấp",h.low,"Vật tư cần đặt","info","inventory")+
   updateKpi("Energy",h.anomaly,"Bất thường","info","energy")+
  '</div>'+
  '<div class="updateDashboardGrid updateDashboardCompact">'+
   '<section class="updatePanel"><header><div><span>ASSET HEALTH</span><h2>Sức khỏe hệ thống</h2></div><button data-update-action="assets">Xem tài sản →</button></header><div class="updateSystemGrid">'+systemCards+'</div></section>'+


   '<section class="updatePanel updateEnergyBrief"><header><div><span>ENERGY INTELLIGENCE</span><h2>Bất thường năng lượng</h2></div><button data-update-action="energy">Chi tiết →</button></header>'+
    (anoms.length?anoms.slice(0,3).map(a=>'<div class="updateEnergyBriefRow"><span>'+(a.meter_type==="water"?"💧":a.meter_type==="electric"?"⚡":"⌁")+'</span><div><b>'+uEsc(a.period_label||a.meter_type)+'</b><small>'+uEsc(a.recommendation||"Theo dõi")+'</small></div><strong class="'+(Math.abs(Number(a.variance_pct))>=15?"danger":"warn")+'">'+(Number(a.variance_pct)>0?"+":"")+uNum(a.variance_pct,1)+'%</strong></div>').join(""):'<div class="updateEmpty">Không có bất thường.</div>')+
   '</section>'+
  '</div>';
 updateRenderFocusNow();
 updateBindDashboard(root);
 updateRefreshNotifications();
}

function updateRenderFocusNow(){
 const root=$("#updateFocusNow");if(!root)return;
 const rows=updateBuildNotifications(updateTechView()?5:3);
 if(!rows.length){root.classList.add("hide");root.innerHTML="";return}
 root.classList.remove("hide");
 root.innerHTML='<div class="updateFocusHead"><div><span>MY FOCUS</span><h2>'+(updateTechView()?'Việc cần làm ngay':'Ưu tiên nổi bật')+'</h2><p>'+uEsc(updateNotificationScopeLabel())+'</p></div><button id="updateFocusOpenNotif" type="button">Mở Notification Center <b>'+rows.filter(x=>!x.read).length+'</b> →</button></div>'+
 '<div class="updateFocusList">'+rows.map((x,i)=>
  '<button class="updateFocusRow '+x.tone+'" data-focus-key="'+uEsc(x.key)+'" data-focus-action="'+uEsc(x.action)+'" data-focus-id="'+uEsc(x.id||"")+'">'+
   '<span>'+String(i+1).padStart(2,"0")+'</span><i>'+uEsc(x.icon)+'</i><div><b>'+uEsc(x.title)+'</b><small>'+uEsc(x.meta)+'</small></div><em>'+uEsc(x.reason)+'</em><strong>→</strong>'+
  '</button>').join("")+'</div>';
 $("#updateFocusOpenNotif").onclick=updateOpenNotificationCenter;
 root.querySelectorAll("[data-focus-action]").forEach(b=>b.onclick=()=>{
  updateMarkNotificationRead(b.dataset.focusKey);
  updateAttentionAction(b.dataset.focusAction,b.dataset.focusId);
 });
}

function updateKpi(label,value,meta,tone,action){
 return '<button class="updateKpi '+tone+'" data-update-action="'+action+'"><span>'+uEsc(label)+'</span><strong>'+uEsc(value)+'</strong><small>'+uEsc(meta)+'</small></button>';
}
function updateBindDashboard(root){
 root.querySelectorAll("[data-update-action]").forEach(b=>b.onclick=()=>updateDoAction(b.dataset.updateAction));
 root.querySelectorAll("[data-update-att-action]").forEach(b=>b.onclick=()=>updateAttentionAction(b.dataset.updateAttAction,b.dataset.updateId));
 root.querySelectorAll("[data-update-system]").forEach(b=>b.onclick=()=>{updateShowStandalone("assets");setTimeout(()=>updateSetAssetFilter(b.dataset.updateSystem),100)});
}
function updateDoAction(a){
 if(a==="health")return updateOpenHealth();
 if(a==="assets")return updateShowStandalone("assets");
 if(["team","shift","cost"].includes(a)){showHome();return}
 if(a==="work"||a==="work-new"){showModule("work");if(a==="work-new")setTimeout(()=>document.querySelector("#workEntryHomeAnchor")?.scrollIntoView({behavior:"smooth"}),80);return}
 if(a==="maintenance")return showModule("maintenance");
 if(a==="inventory")return showModule("inventory");
 if(a==="energy")return showModule("energy");
 if(a==="incident")return showModule("incident");
 if(a==="scan")return updateOpenScanner();
 if(a==="ai")return $("#updateAiModal")?.classList.remove("hide");
}
function updateAttentionAction(a,id){
 if(a==="task"){showModule("work");setTimeout(()=>window.editTask?.(Number(id)),100);return}
 if(a==="asset"){updateShowStandalone("assets");setTimeout(()=>updateOpenAsset(id),100);return}
 updateDoAction(a);
}
function updateOpenHealth(){
 const h=updateHealth(),body=$("#updateHealthModalBody");if(!body)return;
 body.innerHTML='<span class="updateEyebrow">TECHNICAL HEALTH SCORE</span><div class="updateHealthModalScore '+updateHealthTone(h.score)+'"><strong>'+h.score+'</strong><span>/100</span></div><h3>Vì sao dự án đang ở mức '+(h.score>=90?"Tốt":h.score>=75?"Cần chú ý":h.score>=60?"Có rủi ro":"Cần xử lý")+'?</h3>'+
  '<div class="updateHealthBreakdown">'+(h.breakdown.length?h.breakdown.map(x=>'<div><span>'+uEsc(x.label)+' · '+x.count+'</span><b>-'+x.deduction+' điểm</b></div>').join(""):'<div><span>Không có hạng mục bị trừ điểm</span><b>0</b></div>')+'</div>'+
  '<p class="updateMuted">Điểm dùng để ưu tiên điều hành; bấm các cảnh báo trên Command Center để truy ngược dữ liệu gốc.</p>';
 $("#updateHealthModal").classList.remove("hide");
}

function updateRenderAssets(filterCode=""){
 const page=$("#updateAssetsPage");if(!page)return;
 const systems=updateState.systems.filter(s=>updateState.assets.some(a=>a.system_code===s.code));
 page.innerHTML=
  '<section class="updateModuleHero"><div><span>ASSET REGISTRY</span><h1>Tài sản & Thiết bị</h1><p>Cây tài sản liên kết Work Order, PM, sự cố, meter, chi phí, bảo hành và QR.</p></div><div class="updateModuleHeroStats"><b>'+updateState.assets.length+'</b><span>thiết bị</span><b>'+updateState.assets.filter(a=>a.criticality==="A").length+'</b><span>Critical A</span></div></section>'+
  '<section class="updateToolbar"><div class="updateSearch"><span>⌕</span><input id="updateAssetSearch" placeholder="Tìm mã, thiết bị, vị trí..."></div><div class="updateFilterChips"><button class="active" data-asset-filter="">Tất cả</button>'+systems.map(s=>'<button data-asset-filter="'+uEsc(s.code)+'">'+uEsc(s.name)+'</button>').join("")+'</div></section>'+
  '<section class="updatePanel updateAssetPanel"><div class="updateAssetTableHead"><span>Thiết bị</span><span>Hệ thống / Vị trí</span><span>Criticality</span><span>Health</span><span>PM tiếp theo</span><span>Trạng thái</span></div><div id="updateAssetRows"></div></section>';
 const search=$("#updateAssetSearch");search.oninput=()=>updateRenderAssetRows();
 page.querySelectorAll("[data-asset-filter]").forEach(b=>b.onclick=()=>{
  page.querySelectorAll("[data-asset-filter]").forEach(x=>x.classList.remove("active"));b.classList.add("active");b.dataset.selected="1";updateRenderAssetRows();
 });
 if(filterCode)updateSetAssetFilter(filterCode);else updateRenderAssetRows();
}
function updateSetAssetFilter(code){
 const page=$("#updateAssetsPage");if(!page)return;
 page.querySelectorAll("[data-asset-filter]").forEach(b=>{b.classList.toggle("active",b.dataset.assetFilter===code);delete b.dataset.selected});
 const b=page.querySelector('[data-asset-filter="'+CSS.escape(code)+'"]');if(b)b.dataset.selected="1";
 updateRenderAssetRows();
}
function updateRenderAssetRows(){
 const box=$("#updateAssetRows");if(!box)return;
 const page=$("#updateAssetsPage"),filter=page.querySelector("[data-asset-filter][data-selected]")?.dataset.assetFilter||page.querySelector("[data-asset-filter].active")?.dataset.assetFilter||"";
 const q=($("#updateAssetSearch")?.value||"").trim().toLowerCase();
 const rows=updateState.assets.filter(a=>(!filter||a.system_code===filter)&&(!q||[a.code,a.name,a.location,a.manufacturer,a.model].join(" ").toLowerCase().includes(q)));
 box.innerHTML=rows.length?rows.map(a=>{
  const plan=updateState.plans.find(p=>String(p.asset_id)===String(a.id)),sys=updateSystem(a.system_code),area=updateArea(a.area_code);
  return '<button class="updateAssetRow" data-update-asset="'+uEsc(a.id)+'"><div class="updateAssetIdentity"><span class="updateAssetIcon">'+uEsc(sys?.icon||"⚙")+'</span><div><b>'+uEsc(a.code)+'</b><strong>'+uEsc(a.name)+'</strong><small>'+uEsc(a.manufacturer||"")+' '+uEsc(a.model||"")+'</small></div></div><div><b>'+uEsc(sys?.name||a.system_type)+'</b><small>'+uEsc(area?.name||a.location)+'</small></div><div><span class="updateCrit crit'+uEsc(a.criticality)+'">'+uEsc(a.criticality)+'</span></div><div><span class="updateHealthMini '+updateHealthTone(Number(a.health_score))+'">'+uNum(a.health_score)+'</span></div><div><b>'+uEsc(plan?.trigger_type==="meter"?(uNum(a.meter_value)+" / "+uNum(plan.next_meter_due)+" "+(plan.meter_unit||"")):uDate(plan?.next_due_date||a.next_due_date))+'</b><small>'+uEsc(plan?.title||"")+'</small></div><div><span class="updateStatus '+(a.status==="Hoạt động"?"good":"warn")+'">'+uEsc(a.status)+'</span><em>→</em></div></button>';
 }).join(""):'<div class="updateEmpty">Không tìm thấy thiết bị.</div>';
 box.querySelectorAll("[data-update-asset]").forEach(b=>b.onclick=()=>updateOpenAsset(b.dataset.updateAsset));
}
function updateOpenAsset(id){
 const a=updateAsset(id);if(!a)return;
 const sys=updateSystem(a.system_code),area=updateArea(a.area_code),plan=updateState.plans.find(p=>String(p.asset_id)===String(a.id));
 const inc=updateState.incidents.filter(i=>String(i.asset_id)===String(a.id));
 const meters=updateState.meters.filter(m=>String(m.asset_id)===String(a.id));
 const costs=updateState.costs.filter(c=>String(c.asset_id)===String(a.id));
 const tasks=load().filter(t=>String(t.assetId)===String(a.id));
 const warranty=a.warranty_end_date?new Date(a.warranty_end_date+"T23:59:59")>new Date():false;
 $("#updateAssetDrawerTitle").textContent=a.code+" · "+a.name;
 $("#updateAssetDrawerBody").innerHTML=
  '<div class="updateAssetPassportTop"><div class="updateAssetBigIcon">'+uEsc(sys?.icon||"⚙")+'</div><div><span>'+uEsc(sys?.name||a.system_type)+' · '+uEsc(area?.name||a.location)+'</span><h3>'+uEsc(a.name)+'</h3><p>'+uEsc(a.manufacturer||"—")+' · '+uEsc(a.model||"—")+' · S/N '+uEsc(a.serial_no||"—")+'</p></div><div class="updateAssetHealth '+updateHealthTone(Number(a.health_score))+'"><strong>'+uNum(a.health_score)+'</strong><span>HEALTH</span></div></div>'+
  '<div class="updateAssetBadges"><span class="updateCrit crit'+uEsc(a.criticality)+'">Criticality '+uEsc(a.criticality)+'</span><span class="updateStatus '+(a.status==="Hoạt động"?"good":"warn")+'">'+uEsc(a.status)+'</span>'+(warranty?'<span class="updateWarranty">✓ Còn bảo hành đến '+uDate(a.warranty_end_date)+'</span>':'<span class="updateWarranty expired">Bảo hành: '+uDate(a.warranty_end_date)+'</span>')+'</div>'+
  '<div class="updateAssetActions"><button data-asset-action="work">＋ Work Order</button><button data-asset-action="incident">! Báo sự cố</button><button data-asset-action="qr">⌗ QR</button></div>'+
  '<div class="updateAssetTabs">'+
   '<section><header><span>PM / METER</span><b>'+uEsc(plan?.title||"Chưa có kế hoạch")+'</b></header><div class="updateInfoGrid"><div><span>Chu kỳ</span><b>'+uEsc(plan?.trigger_type==="meter"?(uNum(plan.meter_interval)+" "+(plan.meter_unit||"")):(uNum(plan?.frequency_days)+" ngày"))+'</b></div><div><span>Tiếp theo</span><b>'+uEsc(plan?.trigger_type==="meter"?(uNum(a.meter_value)+" / "+uNum(plan.next_meter_due)+" "+plan.meter_unit):uDate(plan?.next_due_date))+'</b></div></div></section>'+
   '<section><header><span>LỊCH SỬ</span><b>'+tasks.length+' WO · '+inc.length+' sự cố</b></header><div class="updateMiniTimeline">'+inc.slice(0,4).map(x=>'<div><i class="'+(x.status==="Đã đóng"?"good":"warn")+'"></i><span><b>'+uEsc(x.incident_code)+'</b><small>'+uDate(x.detected_at)+' · '+uEsc(x.symptom)+'</small></span></div>').join("")+'</div></section>'+
   '<section><header><span>TREND</span><b>'+meters.length+' readings</b></header>'+updateSparkline(meters)+'<div class="updateTrendLegend">'+(meters.length?'<span>'+uEsc(meters[meters.length-1].metric_name)+' · '+uNum(meters[meters.length-1].value,1)+' '+uEsc(meters[meters.length-1].unit)+'</span>':'<span>Chưa có dữ liệu meter</span>')+'</div></section>'+
   '<section><header><span>CHI PHÍ</span><b>'+uMoney(costs.reduce((s,x)=>s+Number(x.amount||0),0))+'</b></header><p class="updateMuted">Tổng chi phí thử nghiệm liên kết trực tiếp với thiết bị.</p></section>'+
  '</div>'+
  '<div id="updateQrBox" class="updateQrBox hide"><div id="updateQrCanvas"></div><div><b>'+uEsc(a.code)+'</b><span>Quét để mở Asset Passport</span></div></div>';
 $("#updateAssetDrawer").classList.remove("hide");
 $("#updateAssetDrawer").classList.add("show");
 $("#updateAssetDrawerBody").querySelectorAll("[data-asset-action]").forEach(b=>b.onclick=()=>{
  const x=b.dataset.assetAction;
  if(x==="work"){updateCloseAssetDrawer();showModule("work");setTimeout(()=>{$("#demoTaskAsset")&&($("#demoTaskAsset").value=a.id);updateAutofillAssetExtras()},100)}
  if(x==="incident"){updateCloseAssetDrawer();showModule("incident")}
  if(x==="qr")updateRenderQr(a)
 });
}
function updateSparkline(rows){
 if(!rows.length)return '<div class="updateEmpty small">Chưa có trend.</div>';
 const same=rows.filter(x=>x.metric_code===rows[rows.length-1].metric_code).slice(-8),vals=same.map(x=>Number(x.value));
 if(vals.length<2)return '<div class="updateEmpty small">Cần ít nhất 2 readings.</div>';
 const min=Math.min(...vals),max=Math.max(...vals),w=280,h=80,p=8;
 const pts=vals.map((v,i)=>[(p+i*(w-2*p)/(vals.length-1)),h-p-(v-min)*(h-2*p)/(max-min||1)]);
 return '<svg class="updateSpark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><polyline points="'+pts.map(x=>x.join(",")).join(" ")+'" /></svg>';
}
function updateRenderQr(a){
 const box=$("#updateQrBox"),canvas=$("#updateQrCanvas");if(!box||!canvas)return;
 box.classList.remove("hide");canvas.innerHTML="";
 const url=location.origin+location.pathname+"?project=UPDATE&asset="+encodeURIComponent(a.code);
 if(window.QRCode){
  new QRCode(canvas,{text:url,width:150,height:150,colorDark:"#173b56",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
 }else canvas.innerHTML='<div class="updateQrFallback">'+uEsc(a.code)+'</div>';
}
function updateCloseAssetDrawer(){
 $("#updateAssetDrawer")?.classList.add("hide");$("#updateAssetDrawer")?.classList.remove("show");
}

function updateSkillStars(level){return '<span class="updateStars">'+Array.from({length:3},(_,i)=>i<Number(level)?"★":"☆").join("")+'</span>'}
function updateRenderTeam(){
 const page=$("#updateTeamPage");if(!page)return;
 const systems=updateState.systems.filter(s=>updateState.skills.some(k=>k.system_code===s.code));
 page.innerHTML=
  '<section class="updateModuleHero"><div><span>PEOPLE OPERATIONS</span><h1>Nhân sự kỹ thuật</h1><p>Skill Matrix + workload + KPI để giao đúng người, không chấm bằng số lượng công việc đơn thuần.</p></div>'+(updateLeaderView()?'<div class="updateModuleHeroActions"><button id="updateSuggestAssignment">✦ Gợi ý giao việc</button><button id="updateAddTechnician">＋ Nhân sự</button></div>':'')+'</section>'+
  '<section class="updatePanel"><header><div><span>WORKLOAD</span><h2>Tải công việc hiện tại</h2></div></header><div class="updatePeopleCards">'+
  updateState.technicians.map(t=>{
   const skills=updateState.skills.filter(s=>String(s.technician_id)===String(t.id)).sort((a,b)=>b.skill_level-a.skill_level);
   const score=Math.round((Number(t.sla_score)+Number(t.on_time_score)+Number(t.documentation_score)+Number(t.pm_score))/4);
   return '<article class="updatePeopleCard"><header><span class="updateAvatar big">'+uEsc(t.avatar_text||uInitials(t.name))+'</span><div><h3>'+uEsc(t.name)+'</h3><p>'+uEsc(t.role_title)+' · '+uEsc(t.shift_code)+'</p></div><b class="'+updateWorkloadTone(Number(t.workload))+'">'+uNum(t.workload)+'%</b></header><div class="updateLoadBar"><i style="width:'+uClamp(Number(t.workload),0,100)+'%"></i></div><div class="updatePeopleMeta"><span>Trạng thái <b>'+uEsc(t.status)+'</b></span><span>KPI tổng hợp <b>'+score+'/100</b></span></div><div class="updateSkillList">'+skills.map(k=>'<div><span>'+uEsc(updateSystem(k.system_code)?.name||k.system_code)+'</span>'+updateSkillStars(k.skill_level)+'</div>').join("")+'</div><footer><span>SLA '+uNum(t.sla_score)+'%</span><span>Đúng hạn '+uNum(t.on_time_score)+'%</span><span>Hồ sơ '+uNum(t.documentation_score)+'%</span><span>PM '+uNum(t.pm_score)+'%</span></footer></article>';
  }).join("")+'</div></section>'+
  '<section class="updatePanel"><header><div><span>SKILL MATRIX</span><h2>Ma trận năng lực</h2></div></header><div class="updateSkillMatrix"><div class="head"><b>Nhân sự</b>'+systems.map(s=>'<span>'+uEsc(s.name)+'</span>').join("")+'</div>'+updateState.technicians.map(t=>'<div><b>'+uEsc(t.name)+'</b>'+systems.map(s=>{const k=updateState.skills.find(k=>String(k.technician_id)===String(t.id)&&k.system_code===s.code);return '<span>'+(k?updateSkillStars(k.skill_level):'<em>—</em>')+'</span>'}).join("")+'</div>').join("")+'</div></section>'+
  '<section id="updateAssignmentSuggest" class="updatePanel hide"></section>';
 if($("#updateSuggestAssignment"))$("#updateSuggestAssignment").onclick=updateOpenAssignmentSuggest;
 if($("#updateAddTechnician"))$("#updateAddTechnician").onclick=updateOpenTechnicianForm;
}
function updateOpenAssignmentSuggest(){
 if(!updateLeaderView()){toast("Chức năng gợi ý phân công dành cho Leader / Admin");return}
 const box=$("#updateAssignmentSuggest");if(!box)return;
 box.classList.remove("hide");
 const opts=updateState.systems.filter(s=>updateState.skills.some(k=>k.system_code===s.code));
 box.innerHTML='<header><div><span>SMART DISPATCH</span><h2>Gợi ý người thực hiện</h2><p>Điểm gợi ý dựa trên skill + workload + SLA. Leader vẫn là người quyết định.</p></div></header><div class="updateSuggestControls"><select id="updateSuggestSystem">'+opts.map(s=>'<option value="'+uEsc(s.code)+'">'+uEsc(s.name)+'</option>').join("")+'</select><button id="updateSuggestGo">Phân tích</button></div><div id="updateSuggestResult"></div>';
 const run=()=>{
  const code=$("#updateSuggestSystem").value;
  const ranked=updateState.technicians.map(t=>{
   const sk=updateState.skills.find(k=>String(k.technician_id)===String(t.id)&&k.system_code===code);
   const level=Number(sk?.skill_level||0);
   const score=Math.round(level*25+(100-Number(t.workload))*0.45+Number(t.sla_score)*0.12);
   return {t,level,score};
  }).sort((a,b)=>b.score-a.score);
  $("#updateSuggestResult").innerHTML=ranked.map((r,i)=>'<div class="updateSuggestRow '+(i===0?"best":"")+'"><b>#'+(i+1)+'</b><span class="updateAvatar">'+uEsc(r.t.avatar_text||uInitials(r.t.name))+'</span><div><strong>'+uEsc(r.t.name)+(i===0?' <em>ĐỀ XUẤT</em>':'')+'</strong><small>Skill '+r.level+'/3 · Workload '+uNum(r.t.workload)+'% · SLA '+uNum(r.t.sla_score)+'%</small></div><i>'+r.score+'</i></div>').join("");
 };
 $("#updateSuggestGo").onclick=run;run();box.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function updateOpenTechnicianForm(){
 if(!updateLeaderView()){toast("Chỉ Leader / Admin được thêm nhân sự");return}
 const body=$("#updateQuickModalBody");if(!body)return;
 body.innerHTML='<span class="updateEyebrow">NHÂN SỰ KỸ THUẬT</span><h3>Thêm nhân sự thử nghiệm</h3><form id="updateTechForm" class="updateQuickForm"><label>Mã nhân sự<input id="uTechCode" required placeholder="KT-03"></label><label>Họ và tên<input id="uTechName" required placeholder="Nguyễn Văn..."></label><label>Ca<select id="uTechShift"><option value="DAY">Ca ngày</option><option value="NIGHT">Ca đêm</option></select></label><label>Tải hiện tại (%)<input id="uTechLoad" type="number" min="0" max="100" value="0"></label><button type="submit">Lưu nhân sự</button></form>';
 $("#updateQuickModal").classList.remove("hide");
 $("#updateTechForm").onsubmit=async e=>{
  e.preventDefault();
  try{
   await updatePost("ops_technicians",{building_id:UPDATE_ID,code:$("#uTechCode").value.trim(),name:$("#uTechName").value.trim(),shift_code:$("#uTechShift").value,workload:Number($("#uTechLoad").value||0),avatar_text:uInitials($("#uTechName").value),status:"Sẵn sàng"});
   updateCloseModal("updateQuickModal");updateState.loaded=false;await updateLoad(true);updateRenderTeam();toast("Đã thêm nhân sự vào UPDATE");
  }catch(err){toast(err.message||"Không thể thêm nhân sự")}
 };
}

function updateRenderShift(){
 const page=$("#updateShiftPage");if(!page)return;
 const pending=updateState.handovers.find(x=>x.status==="Chờ nhận"),latest=updateState.handovers[0];
 page.innerHTML=
  '<section class="updateModuleHero"><div><span>SHIFT OPERATIONS</span><h1>Ca trực & Bàn giao</h1><p>Không để thông tin dừng ở ca trước: sự cố, thiết bị theo dõi, nhà thầu và hệ thống bypass đều có người nhận.</p></div><div class="updateModuleHeroActions"><button id="updateNewHandover">＋ Tạo bàn giao</button></div></section>'+
  (pending?'<section class="updateHandoverHero"><div><span>ĐANG CHỜ NHẬN BÀN GIAO</span><h2>'+uEsc(pending.giver_name)+' <b>→</b> '+uEsc(pending.receiver_name)+'</h2><p>'+uDate(pending.handover_date)+' · '+uEsc(pending.shift_from)+' → '+uEsc(pending.shift_to)+'</p></div><button id="updateAcknowledgeHandover">✓ Tôi đã nhận bàn giao</button></section>':'<section class="updateHandoverHero done"><div><span>BÀN GIAO</span><h2>Không có ca đang chờ nhận</h2><p>Bản bàn giao mới nhất đã được xác nhận.</p></div></section>')+
  '<div class="updateShiftGrid">'+
   '<section class="updatePanel"><header><div><span>OPEN ITEMS</span><h2>Nội dung bàn giao</h2></div></header>'+updateHandoverDetails(pending||latest)+'</section>'+
   '<section class="updatePanel"><header><div><span>SHIFT</span><h2>Lịch ca</h2></div></header><div class="updateShiftCards">'+updateState.shifts.map(s=>'<div><span>'+uEsc(s.code)+'</span><div><b>'+uEsc(s.name)+'</b><small>'+uEsc(String(s.start_time).slice(0,5))+' – '+uEsc(String(s.end_time).slice(0,5))+'</small></div></div>').join("")+'</div></section>'+
  '</div>'+
  '<section class="updatePanel"><header><div><span>HISTORY</span><h2>Lịch sử bàn giao</h2></div></header><div class="updateHandoverHistory">'+updateState.handovers.slice(0,8).map(h=>'<div><span class="updateStatus '+(h.status==="Chờ nhận"?"warn":"good")+'">'+uEsc(h.status)+'</span><b>'+uDate(h.handover_date)+'</b><span>'+uEsc(h.giver_name)+' → '+uEsc(h.receiver_name)+'</span><small>'+(h.acknowledged_at?"Đã nhận "+uTime(h.acknowledged_at):"Chưa xác nhận")+'</small></div>').join("")+'</div></section>';
 if($("#updateAcknowledgeHandover"))$("#updateAcknowledgeHandover").onclick=()=>updateAcknowledgeHandover(pending.id);
 $("#updateNewHandover").onclick=updateOpenHandoverForm;
}
function updateHandoverDetails(h){
 if(!h)return '<div class="updateEmpty">Chưa có bàn giao ca.</div>';
 const block=(label,arr,icon)=>{
  const a=Array.isArray(arr)?arr:[];
  return '<div class="updateHandoverBlock"><span>'+icon+'</span><div><b>'+label+'</b>'+(a.length?a.map(x=>'<small>'+uEsc(x)+'</small>').join(""):'<small>Không có</small>')+'</div></div>';
 };
 return '<div class="updateHandoverBlocks">'+
  block("Sự cố đang mở",h.open_incidents,"!")+
  block("Thiết bị theo dõi",h.watch_assets,"⚙")+
  block("Công việc tồn",h.outstanding_work,"☑")+
  block("Nhà thầu onsite",h.vendors_onsite,"♟")+
  block("Bypass / tạm ngưng",h.bypass_systems,"⚠")+
  '<div class="updateHandoverNote"><b>Lưu ý khách thuê</b><p>'+uEsc(h.tenant_notes||"—")+'</p><b>Ghi chú ca</b><p>'+uEsc(h.notes||"—")+'</p></div></div>';
}
async function updateAcknowledgeHandover(id){
 try{
  await updatePatch("ops_shift_handovers","id=eq."+uq(id)+"&building_id=eq.UPDATE",{status:"Đã nhận",acknowledged_at:new Date().toISOString(),updated_at:new Date().toISOString()});
  updateState.loaded=false;await updateLoad(true);updateRenderShift();updateRenderCommandCenter();updateRefreshNotifications();toast("Đã xác nhận nhận bàn giao");
 }catch(e){toast(e.message||"Không thể xác nhận bàn giao")}
}
function updateOpenHandoverForm(){
 const body=$("#updateQuickModalBody");if(!body)return;
 body.innerHTML='<span class="updateEyebrow">SHIFT HANDOVER</span><h3>Tạo bàn giao ca</h3><form id="updateHandoverForm" class="updateQuickForm"><label>Người giao<input id="uHandoverGiver" required></label><label>Người nhận<input id="uHandoverReceiver" required></label><label>Ca giao<select id="uHandoverFrom"><option>DAY</option><option>NIGHT</option></select></label><label>Ca nhận<select id="uHandoverTo"><option>NIGHT</option><option>DAY</option></select></label><label class="span2">Sự cố đang mở<textarea id="uHandoverIncident" placeholder="Mỗi dòng một mã sự cố"></textarea></label><label class="span2">Thiết bị theo dõi<textarea id="uHandoverAsset" placeholder="Mỗi dòng một mã thiết bị"></textarea></label><label class="span2">Ghi chú<textarea id="uHandoverNote"></textarea></label><button type="submit">Lưu bàn giao</button></form>';
 $("#updateQuickModal").classList.remove("hide");
 $("#updateHandoverForm").onsubmit=async e=>{
  e.preventDefault();
  const lines=id=>$("#"+id).value.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  try{
   await updatePost("ops_shift_handovers",{building_id:UPDATE_ID,handover_date:new Date().toLocaleDateString("en-CA"),shift_from:$("#uHandoverFrom").value,shift_to:$("#uHandoverTo").value,giver_name:$("#uHandoverGiver").value.trim(),receiver_name:$("#uHandoverReceiver").value.trim(),open_incidents:lines("uHandoverIncident"),watch_assets:lines("uHandoverAsset"),outstanding_work:[],vendors_onsite:[],bypass_systems:[],tenant_notes:"",notes:$("#uHandoverNote").value.trim(),status:"Chờ nhận"});
   updateCloseModal("updateQuickModal");updateState.loaded=false;await updateLoad(true);updateRenderShift();toast("Đã tạo bàn giao ca");
  }catch(err){toast(err.message||"Không thể lưu bàn giao")}
 };
}

function updateRenderCost(){
 if(updateTechView()){toast("Chi phí & KPI chỉ hiển thị cho Leader / Admin");showHome();return}
 const page=$("#updateCostPage");if(!page)return;
 const total=updateState.costs.reduce((s,x)=>s+Number(x.amount||0),0);
 const bySystem={};updateState.costs.forEach(x=>bySystem[x.system_code]=(bySystem[x.system_code]||0)+Number(x.amount||0));
 const byVendor={};updateState.costs.forEach(x=>{if(x.contractor_id)byVendor[x.contractor_id]=(byVendor[x.contractor_id]||0)+Number(x.amount||0)});
 page.innerHTML=
  '<section class="updateModuleHero"><div><span>COST & PERFORMANCE</span><h1>Chi phí & KPI</h1><p>Nhìn chi phí theo tài sản/hệ thống/nhà thầu cùng KPI vận hành để ra quyết định sửa hay thay.</p></div><div class="updateModuleHeroStats"><b>'+uMoney(total)+'</b><span>chi phí mẫu YTD</span></div></section>'+
  '<div class="updateKpiGrid cost">'+
   updateKpi("Tổng chi phí",uMoney(total),"UPDATE sandbox","info","cost")+
   updateKpi("MTTR","2.4h","Sự cố kỹ thuật","good","cost")+
   updateKpi("PM Compliance","92%","Mục tiêu ≥95%","warn","maintenance")+
   updateKpi("Repeat Failure",updateRepeatAssets().length,"Thiết bị / 90 ngày","warn","assets")+
  '</div>'+
  '<div class="updateShiftGrid">'+
   '<section class="updatePanel"><header><div><span>BY SYSTEM</span><h2>Chi phí theo hệ thống</h2></div></header><div class="updateCostBars">'+Object.entries(bySystem).sort((a,b)=>b[1]-a[1]).map(([code,val])=>{const pct=total?val/total*100:0;return '<div><span>'+uEsc(updateSystem(code)?.name||code)+'</span><i><em style="width:'+pct+'%"></em></i><b>'+uMoney(val)+'</b></div>'}).join("")+'</div></section>'+
   '<section class="updatePanel"><header><div><span>VENDOR SCORE</span><h2>Hiệu suất nhà thầu</h2></div></header><div class="updateVendorScoreList">'+updateState.contractors.map(c=>{const s=updateVendorScore(c.id);if(!s)return "";const avg=(Number(s.quality_score)+Number(s.sla_score)+Number(s.price_score)+Number(s.response_score)+Number(s.safety_score))/5;return '<div><span><b>'+uEsc(c.name)+'</b><small>'+uEsc(c.specialty)+' · '+s.jobs_ytd+' jobs YTD</small></span><strong>'+avg.toFixed(1)+'/5</strong><em>'+s.repeat_repairs+' sửa lặp</em></div>'}).join("")+'</div></section>'+
  '</div>'+
  '<section class="updatePanel"><header><div><span>TRANSACTIONS</span><h2>Chi phí gần đây</h2></div></header><div class="updateCostTable">'+updateState.costs.map(c=>{const a=updateAsset(c.asset_id),v=updateContractor(c.contractor_id);return '<div><span>'+uDate(c.entry_date)+'</span><b>'+uEsc(c.description)+'</b><small>'+uEsc(a?.code||updateSystem(c.system_code)?.name||c.system_code)+(v?" · "+uEsc(v.name):"")+'</small><em>'+uEsc(c.cost_type)+'</em><strong>'+uMoney(c.amount)+'</strong></div>'}).join("")+'</div></section>';
 page.querySelectorAll("[data-update-action]").forEach(b=>b.onclick=()=>updateDoAction(b.dataset.updateAction));
}

function updateDecorateEnergyPage(){
 if(!updateIs())return;
 $("#updateEnergyIntel")?.remove();
 const page=$("#energyPage");if(!page)return;
 const an=updateState.anomalies.filter(x=>x.status!=="Đã đóng").sort((a,b)=>Math.abs(Number(b.variance_pct||0))-Math.abs(Number(a.variance_pct||0)));
 if(!an.length)return;
 const panel=document.createElement("section");panel.id="updateEnergyIntel";panel.className="updateIntelligenceStrip";
 panel.innerHTML='<div class="updateStripTitle"><span>ENERGY</span><b>'+an.length+' bất thường</b></div><div class="updateStripItems">'+
   an.slice(0,3).map(a=>'<span class="updateStripItem '+(Math.abs(Number(a.variance_pct))>=15?"danger":"warn")+'"><i>'+(a.meter_type==="water"?"💧":a.meter_type==="electric"?"⚡":"⌁")+'</i><b>'+uEsc(a.meter_type==="water"?"Nước":a.meter_type==="electric"?"Điện":a.meter_type.toUpperCase())+'</b><strong>'+(Number(a.variance_pct)>0?"+":"")+uNum(a.variance_pct,1)+'%</strong><small>'+uEsc(a.recommendation||"Theo dõi")+'</small></span>').join("")+
  '</div>';
 page.prepend(panel);
}
function updateDecorateIncidentPage(){
 if(!updateIs())return;
 $("#updateIncidentIntel")?.remove();
 const page=$("#incidentPage");if(!page)return;
 const open=updateOpenIncidents().map(i=>({i,e:updateIncidentExt(i.id)}));
 const rca=open.filter(x=>x.e?.require_rca&&!String(x.e?.root_cause||"").trim()).length;
 const breached=open.filter(x=>x.e?.sla_breached).length;
 const repeat=updateRepeatAssets();
 if(!rca&&!breached&&!repeat.length)return;
 const panel=document.createElement("section");panel.id="updateIncidentIntel";panel.className="updateIntelligenceStrip";
 panel.innerHTML='<div class="updateStripTitle"><span>RỦI RO SỰ CỐ</span><b>Chỉ hiển thị điểm cần hành động</b></div><div class="updateStripItems">'+
  (breached?'<span class="updateStripItem danger"><i>⏱</i><b>SLA quá hạn</b><strong>'+breached+'</strong><small>Ưu tiên xử lý</small></span>':'')+
  (rca?'<span class="updateStripItem danger"><i>!</i><b>RCA bắt buộc</b><strong>'+rca+'</strong><small>Chưa hoàn tất nguyên nhân gốc</small></span>':'')+
  (repeat.length?'<span class="updateStripItem warn"><i>↻</i><b>Lỗi lặp</b><strong>'+repeat.length+'</strong><small>'+uEsc(repeat.slice(0,2).map(x=>x.asset.code+" · "+x.count+" lần/90 ngày").join(" · "))+'</small></span>':'')+
  '</div>';
 page.prepend(panel);
}
function updateDecorateInventoryPage(){
 if(!updateIs())return;
 $("#updateInventoryIntel")?.remove();
 const page=$("#inventoryPage");if(!page)return;
 const low=updateLowStock().sort((a,b)=>(Number(a._stock)-Number(a.min_qty))-(Number(b._stock)-Number(b.min_qty)));
 if(!low.length)return;
 const panel=document.createElement("section");panel.id="updateInventoryIntel";panel.className="updateIntelligenceStrip";
 panel.innerHTML='<div class="updateStripTitle"><span>TỒN KHO</span><b>'+low.length+' vật tư dưới Min</b></div><div class="updateStripItems">'+
  low.slice(0,3).map(m=>'<span class="updateStripItem warn"><i>□</i><b>'+uEsc(m.name)+'</b><strong>'+uNum(m._stock)+'/'+uNum(m.min_qty)+' '+uEsc(m.unit)+'</strong><small>Đặt lại '+uNum(m.reorder_point)+' · Lead '+uNum(m.lead_time_days)+' ngày</small></span>').join("")+
  '</div>';
 page.prepend(panel);
}
function updateDecorateContractorPage(){
 if(!updateIs())return;
 $("#updateVendorIntel")?.remove();
 const page=$("#contractorPage");if(!page)return;
 const vendors=updateState.contractors.map(c=>{const v=updateVendorScore(c.id);if(!v)return null;return {c,v,avg:(Number(v.quality_score)+Number(v.sla_score)+Number(v.price_score)+Number(v.response_score)+Number(v.safety_score))/5}}).filter(Boolean).sort((a,b)=>a.avg-b.avg);
 if(!vendors.length)return;
 const panel=document.createElement("section");panel.id="updateVendorIntel";panel.className="updateIntelligenceStrip";
 panel.innerHTML='<div class="updateStripTitle"><span>VENDOR SCORE</span><b>'+vendors.length+' nhà thầu đã đánh giá</b></div><div class="updateStripItems">'+
  vendors.slice(0,3).map(x=>'<span class="updateStripItem '+(x.avg<4?"warn":"good")+'"><i>★</i><b>'+uEsc(x.c.name)+'</b><strong>'+x.avg.toFixed(1)+'/5</strong><small>SLA '+uNum(x.v.sla_score,1)+' · '+x.v.repeat_repairs+' sửa lặp</small></span>').join("")+
  '</div>';
 page.prepend(panel);
}

function updateEnhanceWorkForm(){
 if(!updateIs())return;
 const links=$("#demoWorkLinks"),grid=links?.querySelector(".demoWorkLinkGrid");if(!grid)return;
 const priority=$("#demoTaskPriority");
 if(priority&&!priority.dataset.updateOptions){
  priority.innerHTML='<option value="Critical">Critical · Khẩn cấp</option><option value="High">High · Cao</option><option value="Medium" selected>Medium · Trung bình</option><option value="Low">Low · Thấp</option>';
  priority.dataset.updateOptions="1";
  priority.addEventListener("change",updateWorkSlaPreview);
 }
 if(!$("#updateWorkExtras")){
  grid.insertAdjacentHTML("beforeend",
   '<div id="updateWorkExtras" class="span2 updateWorkExtras"><div class="updateWorkExtrasHead"><b>Thông tin vận hành</b><span id="updateWorkSlaPreview"></span></div>'+
    '<div id="updateAssetContext" class="updateAssetContext hide"></div>'+
    '<div class="updateWorkExtrasGrid">'+
    '<label class="updateManualContext">Hệ thống<select id="updateTaskSystem"><option value="">Chọn hệ thống</option></select></label>'+
    '<label class="updateManualContext">Khu vực<select id="updateTaskArea"><option value="">Chọn khu vực</option></select></label>'+
    '<label>Nhân công (₫)<input id="updateTaskLaborCost" type="number" min="0" step="1000" value="0"></label>'+
    '<label>Nhà thầu (₫)<input id="updateTaskVendorCost" type="number" min="0" step="1000" value="0"></label>'+
    '<label>Chi phí khác (₫)<input id="updateTaskOtherCost" type="number" min="0" step="1000" value="0"></label>'+
    '<label class="updateSlaInfo"><span>SLA</span><b>Tự tính theo mức ưu tiên</b></label>'+
   '</div></div>'
  );
  $("#demoTaskAsset")?.addEventListener("change",updateAutofillAssetExtras);
 }
 updatePopulateWorkExtras();
 updateWorkSlaPreview();
}
function updatePopulateWorkExtras(){
 const s=$("#updateTaskSystem"),a=$("#updateTaskArea");if(!s||!a)return;
 const sv=s.value,av=a.value;
 s.innerHTML='<option value="">Tự lấy theo thiết bị</option>'+updateState.systems.map(x=>'<option value="'+uEsc(x.code)+'">'+uEsc(x.name)+'</option>').join("");
 a.innerHTML='<option value="">Tự lấy theo thiết bị</option>'+updateState.areas.map(x=>'<option value="'+uEsc(x.code)+'">'+uEsc(x.name)+'</option>').join("");
 if([...s.options].some(x=>x.value===sv))s.value=sv;if([...a.options].some(x=>x.value===av))a.value=av;
 updateSyncWorkContextUI();
}
function updateSyncWorkContextUI(){
 const asset=updateAsset($("#demoTaskAsset")?.value);
 const context=$("#updateAssetContext");
 document.querySelectorAll("#updateWorkExtras .updateManualContext").forEach(el=>el.classList.toggle("hide",!!asset));
 if(context){
  if(asset){
   const sys=updateSystem(asset.system_code),area=updateArea(asset.area_code);
   context.classList.remove("hide");
   context.innerHTML='<span>Thiết bị đã chọn</span><b>'+uEsc(asset.code)+' · '+uEsc(sys?.name||asset.system_type||"—")+' · '+uEsc(area?.name||asset.location||"—")+'</b>';
  }else{
   context.classList.add("hide");context.innerHTML="";
  }
 }
}
function updateAutofillAssetExtras(){
 const a=updateAsset($("#demoTaskAsset")?.value);
 if(a){
  if($("#updateTaskSystem"))$("#updateTaskSystem").value=a.system_code||"";
  if($("#updateTaskArea"))$("#updateTaskArea").value=a.area_code||"";
 }
 updateSyncWorkContextUI();
}
function updateWorkSlaPreview(){
 const p=uPriority($("#demoTaskPriority")?.value),r=SLA_RULES[p];
 const box=$("#updateWorkSlaPreview");if(box)box.textContent=p+" · phản hồi "+updateDuration(r.response*60000)+" · mục tiêu "+updateDuration(r.target*60000);
}
function updateReadWorkExtras(){
 const asset=updateAsset($("#demoTaskAsset")?.value),p=uPriority($("#demoTaskPriority")?.value),r=SLA_RULES[p];
 return {
  priority:p,
  systemCode:$("#updateTaskSystem")?.value||asset?.system_code||"",
  areaCode:$("#updateTaskArea")?.value||asset?.area_code||"",
  laborCost:Number($("#updateTaskLaborCost")?.value||0),
  vendorCost:Number($("#updateTaskVendorCost")?.value||0),
  otherCost:Number($("#updateTaskOtherCost")?.value||0),
  slaResponseMinutes:r.response,slaTargetMinutes:r.target
 };
}
function updateFillWorkExtras(x){
 updateEnhanceWorkForm();if(!updateIs())return;
 if($("#demoTaskPriority"))$("#demoTaskPriority").value=uPriority(x.priority);
 if($("#updateTaskSystem"))$("#updateTaskSystem").value=x.systemCode||updateAsset(x.assetId)?.system_code||"";
 if($("#updateTaskArea"))$("#updateTaskArea").value=x.areaCode||updateAsset(x.assetId)?.area_code||"";
 if($("#updateTaskLaborCost"))$("#updateTaskLaborCost").value=Number(x.laborCost||0);
 if($("#updateTaskVendorCost"))$("#updateTaskVendorCost").value=Number(x.vendorCost||0);
 if($("#updateTaskOtherCost"))$("#updateTaskOtherCost").value=Number(x.otherCost||0);
 updateSyncWorkContextUI();
 updateWorkSlaPreview();
}
function updateResetWorkExtras(){
 if(!updateIs())return;
 ["updateTaskLaborCost","updateTaskVendorCost","updateTaskOtherCost"].forEach(id=>{$("#"+id)&&($("#"+id).value=0)});
 $("#updateTaskSystem")&&($("#updateTaskSystem").value="");$("#updateTaskArea")&&($("#updateTaskArea").value="");
 if($("#demoTaskPriority"))$("#demoTaskPriority").value="Medium";updateSyncWorkContextUI();updateWorkSlaPreview();
}

async function updateSyncTaskCosts(obj){
 if(!obj||!obj.id||!updateTok())return;
 const workOrderId=obj.woCode||String(obj.id);
 const materialCost=(Array.isArray(obj.materials)?obj.materials:[]).reduce((sum,row)=>{
   const m=updateState.materials.find(x=>String(x.id)===String(row.materialId));
   return sum+Number(row.qty||0)*Number(m?.unit_price||0);
 },0);
 const items=[
  {type:"Nhân công",amount:Number(obj.laborCost||0)},
  {type:"Nhà thầu",amount:Number(obj.vendorCost||0)},
  {type:"Vật tư",amount:materialCost},
  {type:"Khác",amount:Number(obj.otherCost||0)}
 ];
 for(const item of items){
  try{
   const q="building_id=eq.UPDATE&work_order_id=eq."+uq(workOrderId)+"&cost_type=eq."+uq(item.type)+"&select=id";
   const existing=await updateRest("ops_cost_entries",q);
   const body={building_id:UPDATE_ID,entry_date:obj.d||new Date().toLocaleDateString("en-CA"),work_order_id:workOrderId,
     asset_id:obj.assetId||null,system_code:obj.systemCode||"",contractor_id:item.type==="Nhà thầu"?(obj.contractorId||null):null,
     cost_type:item.type,amount:Math.max(0,item.amount),description:(obj.c||"Work Order")+" · "+item.type};
   if(existing?.[0]?.id)await updatePatch("ops_cost_entries","id=eq."+uq(existing[0].id)+"&building_id=eq.UPDATE",body);
   else if(item.amount>0)await updatePost("ops_cost_entries",body);
  }catch(e){console.warn("Task cost sync skipped",item.type,e)}
 }
 updateState.loaded=false;
}

const updateOriginalSyncTaskRecord=syncTaskRecord;
syncTaskRecord=async function(action,itemOrId,buildingId=currentBuilding?.id){
 if(action==="upsert_task"&&String(buildingId)===UPDATE_ID&&itemOrId&&typeof itemOrId==="object"){
  const previous=load().find(x=>String(x.id)===String(itemOrId.id))||{};
  let obj={...previous,...itemOrId},extra=updateIs()?updateReadWorkExtras():{};
  obj={...obj,...extra};obj.priority=uPriority(obj.priority);
  const previousPriority=uPriority(previous.priority||obj.priority);
  const priorityChanged=!!previous.id&&previousPriority!==obj.priority;
  const r=SLA_RULES[obj.priority],created=obj.createdAt||previous.createdAt||new Date().toISOString(),createdDate=new Date(created);
  obj.createdAt=created;obj.slaResponseMinutes=Number(r.response);obj.slaTargetMinutes=Number(r.target);
  if(priorityChanged||!obj.responseDueAt)obj.responseDueAt=new Date(createdDate.getTime()+obj.slaResponseMinutes*60000).toISOString();
  if(priorityChanged||!obj.resolveDueAt)obj.resolveDueAt=new Date(createdDate.getTime()+obj.slaTargetMinutes*60000).toISOString();
  if(!obj.woCode)obj.woCode=previous.woCode||"WO-UPD-"+String(obj.id||Date.now()).slice(-5);
  const result=await updateOriginalSyncTaskRecord(action,obj,buildingId);
  const saved=result?.item?{...obj,...result.item}:obj;
  if(updateTok())updateSyncTaskCosts(saved);
  setTimeout(()=>{if(updateIs()){updateRefreshNotifications();if(!$("#homePage")?.classList.contains("hide"))updateRenderFocusNow()}},80);
  return result?{...result,item:saved}:{item:saved,offline:true};
 }
 return updateOriginalSyncTaskRecord(action,itemOrId,buildingId);
};
if(typeof window.editTask==="function"){
 const updatePrevEditTask=window.editTask;
 window.editTask=id=>{
  updatePrevEditTask(id);
  if(updateIs()){const x=load().find(y=>String(y.id)===String(id));setTimeout(()=>{if(x)updateFillWorkExtras(x)},40)}
 };
}
if(typeof resetForm==="function"){
 const updatePrevResetForm=resetForm;
 resetForm=function(){updatePrevResetForm();updateResetWorkExtras()};
}

async function updateEnsurePmOrders(){
 if(!updateIs()||updatePmGenerating||!canProjectEdit?.())return;
 updatePmGenerating=true;
 try{
  const today=new Date();today.setHours(23,59,59,999);
  let arr=load(),changed=false;
  for(const p of updateState.plans){
   const asset=updateAsset(p.asset_id);if(!asset)continue;
   let due=false,cycleKey="",advancePatch=null;
   if(p.trigger_type==="calendar"){
    if(!p.next_due_date)continue;
    const dueDate=new Date(p.next_due_date+"T00:00:00");
    due=dueDate<=today;
    cycleKey="calendar:"+p.next_due_date;
    if(due){
      const step=Math.max(1,Number(p.frequency_days||30));
      let next=new Date(dueDate);
      do{next.setDate(next.getDate()+step)}while(next<=today);
      advancePatch={next_due_date:next.toLocaleDateString("en-CA"),last_generated_at:new Date().toISOString()};
    }
   }else if(p.trigger_type==="meter"){
    const threshold=Number(p.next_meter_due);
    const current=Number(asset.meter_value||0);
    const step=Math.max(1,Number(p.meter_interval||0));
    if(!Number.isFinite(threshold)||!step)continue;
    due=current>=threshold;
    cycleKey="meter:"+threshold;
    if(due){
      let next=threshold+step;
      while(next<=current)next+=step;
      advancePatch={next_meter_due:next,last_generated_at:new Date().toISOString()};
    }
   }
   if(!due)continue;
   const already=arr.some(x=>String(x.maintenancePlanId||"")===String(p.id)&&String(x.maintenanceCycleKey||"")===cycleKey);
   if(!already){
    const id=Date.now()+Math.floor(Math.random()*9000),priority=uPriority(p.priority),rule=SLA_RULES[priority],created=new Date().toISOString();
    let obj={id,woCode:"WO-UPD-PM-"+String(id).slice(-4),d:new Date().toLocaleDateString("en-CA"),c:p.title,t:"Bảo trì",s:"Đang thực hiện",n:"Tự động sinh từ kế hoạch "+p.plan_code,a:asset.assigned_to||"",performers:asset.assigned_to?[asset.assigned_to]:[],imgs:[],i:0,priority,assetId:asset.id,systemCode:asset.system_code,areaCode:asset.area_code,maintenancePlanId:p.id,maintenanceCycleKey:cycleKey,materials:[],cause:"",result:"",createdAt:created,slaResponseMinutes:rule.response,slaTargetMinutes:rule.target,responseDueAt:new Date(Date.now()+rule.response*60000).toISOString(),resolveDueAt:new Date(Date.now()+rule.target*60000).toISOString(),dueDate:p.next_due_date||new Date().toLocaleDateString("en-CA"),dueDateExplicit:true};
    const res=await updateOriginalSyncTaskRecord("upsert_task",obj,UPDATE_ID);if(res?.item)obj={...obj,...res.item};
    arr.push(obj);changed=true;
   }
   if(advancePatch){
    try{
      await updatePatch("ops_maintenance_plans","id=eq."+uq(p.id)+"&building_id=eq.UPDATE",advancePatch);
      Object.assign(p,advancePatch);
    }catch(e){console.warn("Could not advance PM plan",p.plan_code,e)}
   }
  }
  if(changed){save(arr);render?.();updateRenderCommandCenter();updateRefreshNotifications();toast("UPDATE đã tự tạo Work Order cho PM đến hạn")}
 }catch(e){console.warn("Auto PM generation skipped",e)}
 finally{updatePmGenerating=false}
}

function updateAiAnswer(type){
 const box=$("#updateAiAnswer");if(!box)return;
 const h=updateHealth(),repeat=updateRepeatAssets(),handover=updateState.handovers.find(x=>x.status==="Chờ nhận"),low=updateLowStock();
 let html="";
 if(type==="attention"){
  html='<b>Ưu tiên của Leader hôm nay</b><ol>'+
   (h.critical?'<li><strong>Critical:</strong> '+h.critical+' sự cố cần theo dõi ngay.</li>':'')+
   (h.overdue?'<li><strong>Quá hạn:</strong> '+h.overdue+' Work Order chưa hoàn thành.</li>':'')+
   (h.pmOver?'<li><strong>PM:</strong> '+h.pmOver+' kế hoạch đã quá hạn.</li>':'')+
   (low.length?'<li><strong>Kho:</strong> '+low.length+' vật tư đã chạm Min Stock.</li>':'')+
   (h.anomaly?'<li><strong>Năng lượng:</strong> có '+h.anomaly+' bất thường lớn so baseline.</li>':'')+
   '</ol><p>Technical Health hiện là <strong>'+h.score+'/100</strong>.</p>';
 }
 if(type==="risk"){
  const risky=[...updateState.assets].sort((a,b)=>Number(a.health_score)-Number(b.health_score)).slice(0,3);
  html='<b>Thiết bị rủi ro cao</b>'+risky.map((a,i)=>'<p><strong>'+(i+1)+'. '+uEsc(a.code)+'</strong> · Health '+uNum(a.health_score)+'/100 · '+uEsc(a.status)+(repeat.some(x=>x.asset.id===a.id)?' · <em>Repeat Failure</em>':'')+'</p>').join("");
 }
 if(type==="shift"){
  html=handover?'<b>Bàn giao chưa được xác nhận</b><p>'+uEsc(handover.giver_name)+' → '+uEsc(handover.receiver_name)+'.</p><p>Cần theo dõi: '+uEsc((handover.watch_assets||[]).join(", "))+'</p><p>Sự cố mở: '+uEsc((handover.open_incidents||[]).join(", "))+'</p><p>Ghi chú: '+uEsc(handover.notes||"—")+'</p>':'<b>Không có bàn giao đang chờ nhận.</b>';
 }
 if(type==="report"){
  html='<b>Tóm tắt vận hành tuần · bản nháp</b><p>UPDATE đang ở mức Health <strong>'+h.score+'/100</strong>. Ghi nhận '+updateState.incidents.length+' sự cố trong dữ liệu thử nghiệm, trong đó '+h.critical+' sự cố Critical đang mở; '+h.overdue+' Work Order quá hạn; PM compliance cần cải thiện do '+h.pmOver+' kế hoạch quá hạn.</p><p>Điểm cần theo dõi: '+(repeat.length?uEsc(repeat.map(x=>x.asset.code+" lỗi lặp "+x.count+" lần/90 ngày").join("; ")):"không có lỗi lặp")+'. Kho có '+low.length+' vật tư chạm ngưỡng tối thiểu.</p>';
 }
 box.innerHTML=html||"Chưa có dữ liệu phân tích.";
}

function updateOpenScanner(){
 if(!updateIs())return;
 $("#updateScannerModal").classList.remove("hide");$("#updateScannerStatus").textContent="Đang kiểm tra camera...";
 updateStartScanner();
}
async function updateStartScanner(){
 updateStopScanner();
 const video=$("#updateScannerVideo"),status=$("#updateScannerStatus");if(!video||!status)return;
 if(!("BarcodeDetector" in window)||!navigator.mediaDevices?.getUserMedia){
  status.textContent="Trình duyệt này chưa hỗ trợ quét QR trực tiếp. Anh có thể nhập mã thiết bị bên dưới.";
  video.classList.add("hide");return;
 }
 try{
  const formats=await BarcodeDetector.getSupportedFormats();if(!formats.includes("qr_code"))throw new Error("QR chưa được hỗ trợ");
  const detector=new BarcodeDetector({formats:["qr_code"]});
  updateScannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}});
  video.srcObject=updateScannerStream;video.classList.remove("hide");await video.play();status.textContent="Đưa QR vào giữa khung hình.";
  const loop=async()=>{
   if(!updateScannerStream)return;
   try{
    const codes=await detector.detect(video);
    if(codes.length){
     const raw=codes[0].rawValue||"",m=raw.match(/[?&]asset=([^&]+)/),code=m?decodeURIComponent(m[1]):raw.split("/").pop();
     updateStopScanner();updateCloseModal("updateScannerModal");updateOpenAssetByCode(code);return;
    }
   }catch(e){}
   updateScannerTimer=setTimeout(loop,350);
  };loop();
 }catch(e){status.textContent="Không mở được camera. Hãy cấp quyền camera hoặc nhập mã thiết bị.";video.classList.add("hide")}
}
function updateStopScanner(){
 if(updateScannerTimer){clearTimeout(updateScannerTimer);updateScannerTimer=null}
 if(updateScannerStream){updateScannerStream.getTracks().forEach(t=>t.stop());updateScannerStream=null}
 const v=$("#updateScannerVideo");if(v){v.srcObject=null;v.classList.add("hide")}
}
function updateOpenAssetByCode(raw){
 const code=String(raw||"").trim().toUpperCase(),a=updateState.assets.find(x=>String(x.code).toUpperCase()===code);
 if(!a){toast("Không tìm thấy thiết bị "+code);return}
 updateCloseModal("updateScannerModal");updateShowStandalone("assets");setTimeout(()=>updateOpenAsset(a.id),120);
}
function updateCloseModal(id){
 $("#"+id)?.classList.add("hide");if(id==="updateScannerModal")updateStopScanner();
}
function updateSyncKeyboard(){
 if(!updateIs()){document.body.classList.remove("updateKeyboardOpen");return}
 const vv=window.visualViewport;
 const keyboardOpen=!!vv&&(window.innerHeight-vv.height>140);
 document.body.classList.toggle("updateKeyboardOpen",keyboardOpen);
}

const updatePrevAdminCard=typeof adminProjectCard==="function"?adminProjectCard:null;
if(updatePrevAdminCard){
 adminProjectCard=function(b,index=0){
  const html=updatePrevAdminCard(b,index);
  return b?.id===UPDATE_ID?html.replace("</h3>"," <span class=\"updateProjectBadge\">THỬ NGHIỆM</span></h3>"):html;
 };
}
const updatePrevShowHome=showHome;
showHome=function(){
 const isUpdateBefore=updateIs();
 const seq=isUpdateBefore?updateBeginRoute("home"):0;
 if(isUpdateBefore)updateHideStandalonePages();
 updatePrevShowHome();
 updateApplyMode();
 if(updateIs()){
  updateCurrentRoute="home";
  updateSetTop("Technical Command Center",updateTechView()?"UPDATE · Technician View":"UPDATE · Leader View");
  if(!$("#homePage")?.classList.contains("hide"))updateRenderCommandCenter();
  if(seq&&seq!==updateNavSeq)return;
 }
};
const updatePrevShowModule=showModule;
showModule=function(name){
 const isUpdateBefore=updateIs();
 const route="module:"+name;
 const seq=isUpdateBefore?updateBeginRoute(route):0;
 if(isUpdateBefore)updateHideStandalonePages();
 updatePrevShowModule(name);
 updateApplyMode();
 if(updateIs()){
  updateCurrentRoute=route;
  // Keep legacy Demo feature pages and UPDATE pages mutually exclusive.
  if(["incident","inspection","documents","reports"].includes(name)){
   document.querySelectorAll(".updateOpsPage").forEach(x=>x.classList.add("hide"));
   document.querySelectorAll(".updateOnlyNav").forEach(x=>x.classList.remove("active"));
   $("#topUpdateTitle")?.classList.add("hide");
   $("#app")?.classList.remove("updateStandaloneMode");
  }else{
   updateHideDemoFeaturePages();
  }
  setTimeout(()=>{
   if(!updateRouteStillActive(seq,route))return;
   updateEnhanceWorkForm();
   if(name==="energy")updateDecorateEnergyPage();
   if(name==="incident")updateDecorateIncidentPage();
   if(name==="inventory")updateDecorateInventoryPage();
   if(name==="contractor")updateDecorateContractorPage();
   updateRefreshNotifications();
  },0);
 }
};
const updatePrevApplyBuildingUI=applyBuildingUI;
applyBuildingUI=function(){updatePrevApplyBuildingUI();updateApplyMode()};
const updatePrevOpenAdminPortal=openAdminPortal;
openAdminPortal=function(){
 updateCurrentRoute="admin";updateNavSeq+=1;
 $("#app")?.classList.remove("updateProjectMode","updateStandaloneMode");
 document.querySelectorAll(".updateOnlyNav").forEach(x=>x.classList.add("hide"));
 $("#updateTrialRibbon")?.classList.add("hide");$("#updateMobileNav")?.classList.add("hide");$("#updateAiButton")?.classList.add("hide");
 updateStopNotificationTimer();updateCloseNotificationCenter();
 updatePrevOpenAdminPortal();
};

if(typeof window.enterAccount==="function"){
 const updatePrevEnterAccount=window.enterAccount;
 window.enterAccount=function(account,session=null){
  updatePrevEnterAccount(account,session);
  const params=new URLSearchParams(location.search);
  if(params.get("project")===UPDATE_ID){
   const b=account?.buildings?.find(x=>x.id===UPDATE_ID);
   if(b)setTimeout(async()=>{try{await enterProject(b,{target:"home"});showHome();const code=params.get("asset");if(code){await updateLoad(true);setTimeout(()=>updateOpenAssetByCode(code),180)}}catch(e){}},180);
  }
 };
}

window.addEventListener("resize",()=>{if(updateIs())updateApplyMode();updateSyncKeyboard()});
window.visualViewport?.addEventListener("resize",updateSyncKeyboard,{passive:true});
document.addEventListener("focusin",()=>setTimeout(updateSyncKeyboard,80));
document.addEventListener("focusout",()=>setTimeout(updateSyncKeyboard,120));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){updateCloseAssetDrawer();["updateHealthModal","updateAiModal","updateScannerModal","updateQuickModal"].forEach(updateCloseModal);updateCloseNotificationCenter()}});
document.addEventListener("DOMContentLoaded",()=>{
 updateInjectShell();updateApplyMode();
 const params=new URLSearchParams(location.search);
 if(params.get("asset"))$("#updateScannerCode")&&($("#updateScannerCode").value=params.get("asset"));
});

})();