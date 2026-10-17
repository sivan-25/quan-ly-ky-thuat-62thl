"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM}=require("jsdom");
const root=path.join(__dirname,"..");
const maintenance=fs.readFileSync(path.join(root,"maintenance-130.js"),"utf8");
const admin=fs.readFileSync(path.join(root,"admin-summary-report.js"),"utf8");
const css=fs.readFileSync(path.join(root,"maintenance-130.css"),"utf8");
new Function(maintenance);new Function(admin);
const projects=["68PĐL","62THL","127HH","130HH"];
const date="2026-10-12",month="2026-10";
const data=Object.fromEntries(projects.map(b=>[b,{
 plans:[{id:b+"-plan",building_id:b,plan_code:b+"-PLAN",work_title:"Công việc bảo trì "+b,
 system_group:"PCCC",subsystem:"Tầng hầm",assigned_to:"Văn",work_type:"PM",priority:"normal",
 cadence:"Không lặp",source_notes:b==="130HH"?"MẪU kiểm thử":"Công việc thực tế"}],
 events:[{id:b+"-event",building_id:b,item_id:b+"-plan",event_key:b+"-PLAN:"+month,
 planned_month:month+"-01",planned_date:date,status:"planned",image_paths:[],result_note:"",completed_by:""}],
 people:[{name:"Văn"}]
}]));
data["130HH"].plans.push({id:"130HH-real-plan",building_id:"130HH",plan_code:"130HH-REAL",
 work_title:"Thực tế 130 Hồng Hà",system_group:"Điện",assigned_to:"Văn",cadence:"Không lặp",source_notes:"Đã nhập thực tế"});
data["130HH"].events.push({id:"130HH-real-event",building_id:"130HH",item_id:"130HH-real-plan",event_key:"130HH-REAL:"+month,
 planned_month:month+"-01",planned_date:"2026-10-13",status:"completed",completed_by:"Văn",result_note:"Đạt",
 image_paths:[{kind:"after",ref:"storage:130HH/evidence.jpg"}]});
const dom=new JSDOM('<!doctype html><html><body><div id="homePage"></div><nav id="navAdmin"></nav><div id="maintenancePage"><section class="maintenanceSchedule"></section></div></body></html>',{url:"https://esta.test",runScripts:"outside-only"});
const w=dom.window,d=w.document,calls=[],pdfs=[],notices=[];
let canEdit=true,swallowPatch=false;
w.currentBuilding={id:"68PĐL"};w.currentAccount={is_admin:true};w.projectOverviewActive=false;
w.centralSession={access_token:"fixture"};w.canProjectEdit=()=>canEdit;w.ESTAReportModel={localDay:()=>"2026-10-17"};
w.toast=msg=>notices.push(msg);w.estaRefreshProjectNavAlerts=()=>{};
w.exportGenericEstaPdf=async model=>{pdfs.push(model);return true;};
w.mediaImgHtml=ref=>'<img data-ref="'+String(ref)+'">';
w.hydrateMediaImages=async()=>{};
w.sbFetch=async(url,opts={})=>{
 calls.push({url,method:opts.method||"GET"});
 if(url.includes("admin-overview"))return {rows:projects.map(b=>({building:{id:b,name:b},snapshot:{tasks:[]},ops:{maintenance_assets:[{name:"THIẾT BỊ CŨ "+b,next_due_date:date}]}}))};
 if(url.includes("admin_personal_tasks"))return [];
 const building=decodeURIComponent(url.match(/building_id=eq\.([^&]+)/)?.[1]||"");
 const table=url.match(/\/rest\/v1\/([^?]+)/)?.[1]||"";
 if(!projects.includes(building))throw Error("Missing project scope: "+url);
 const db=data[building];
 const array=table==="esta_maintenance_plan_items"?db.plans:table==="esta_maintenance_plan_occurrences"?db.events:table==="building_people"?db.people:table==="building_equipment_profiles_nangcap"?[]:null;
 if(array===null)throw Error("Unexpected legacy table: "+url);
 const id=decodeURIComponent(url.match(/id=eq\.([^&]+)/)?.[1]||opts.body?.id||"");
 if(opts.method==="PATCH"){
  if(!swallowPatch){const rec=array.find(v=>v.id===id);assert.ok(rec,"row to update exists: "+id);Object.assign(rec,opts.body);}
  return [];
 }
 if(opts.method==="POST"){array.push({...opts.body});return [];}
 if(opts.method==="DELETE"){const i=array.findIndex(v=>v.id===id);if(i>=0)array.splice(i,1);return [];}
 return id?array.filter(v=>v.id===id):array.slice();
};
w.eval(maintenance);w.eval(admin);
d.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const settle=async()=>{for(let i=0;i<10;i++)await tick();};
(async()=>{
 // Each building uses the same real page, with independent server-scoped data.
 for(const b of projects){
  canEdit=true;w.currentBuilding={id:b};w.mountMaintenance130();await settle();
  const page=d.getElementById("maint130"),list=d.getElementById("m130List");
  assert.equal(page.hidden,false,b+" must mount");
  assert.match(list.textContent,new RegExp("Công việc bảo trì "+b));
  for(const other of projects.filter(x=>x!==b))assert.ok(!list.textContent.includes("Công việc bảo trì "+other),"isolated "+b);
  assert.equal(d.querySelectorAll("#maint130").length,1,"one shared UI");
  assert.ok(d.querySelector('[data-m130-month="10"].sel'),"current month "+b);
  d.querySelector('[data-m130-month="9"]').click();
  assert.match(d.getElementById("m130List").textContent,/Không có công việc/,"month switch "+b);
  d.querySelector('[data-m130-month="10"]').click();
  d.getElementById("m130Search").value="nội dung không tồn tại";
  d.getElementById("m130Search").dispatchEvent(new w.Event("input",{bubbles:true}));
  assert.match(d.getElementById("m130List").textContent,/Không có công việc/,"search filters "+b);
  d.getElementById("m130Search").value="";
  d.getElementById("m130Search").dispatchEvent(new w.Event("input",{bubbles:true}));
  d.getElementById("m130State").value="planned";
  d.getElementById("m130State").dispatchEvent(new w.Event("change",{bubbles:true}));
  assert.match(d.getElementById("m130List").textContent,new RegExp("Công việc bảo trì "+b),"status filter "+b);
  d.getElementById("m130State").value="";
  d.getElementById("m130State").dispatchEvent(new w.Event("change",{bubbles:true}));
  d.querySelector('[data-m130-view="rows"]').click();
  assert.ok(d.querySelector(".m130CompactRow"),"row view "+b);
  d.querySelector('[data-m130-view="cards"]').click();
  d.querySelector('[data-m130-layout="calendar"]').click();
  assert.ok(d.querySelector(".m130CalendarGrid"),"calendar "+b);
  d.querySelector('[data-m130-layout="list"]').click();
  d.getElementById("m130Prev").click();
  assert.equal(d.getElementById("m130Year").textContent,"Năm 2025","previous year "+b);
  d.getElementById("m130Next").click();
  assert.equal(d.getElementById("m130Year").textContent,"Năm 2026","next year "+b);
  const action=d.querySelector('[data-m130-event="'+b+'-PLAN:'+month+'"]');
  assert.ok(action,"event action "+b);
  action.click();
  assert.equal(d.getElementById("m130EventStatus").value,"planned","opening planned MUST NOT mark in progress "+b);
  d.getElementById("m130Result").value="Đã kiểm tra thông số";
  d.getElementById("m130EventForm").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await settle();
  assert.equal(data[b].events[0].status,"planned","saved status stays planned "+b);
  assert.equal(data[b].events[0].result_note,"Đã kiểm tra thông số","note persisted "+b);
  assert.equal(d.getElementById("m130Overlay").hidden,true,"close after verified save "+b);
  assert.ok(notices.some(n=>n.includes("✓ Đã lưu")),"save success "+b);
  d.getElementById("m130Pdf").click();await settle();
  assert.equal(pdfs.at(-1).filename.includes(b),true,"PDF is scoped to "+b);
  canEdit=false;w.mountMaintenance130();await settle();
  assert.equal(d.getElementById("m130Create").disabled,true,"viewer cannot create "+b);
  const viewer=d.querySelector('[data-m130-event="'+b+'-PLAN:'+month+'"]');viewer.click();
  assert.equal(d.getElementById("m130Result").disabled,true,"viewer cannot edit "+b);
  assert.equal(d.getElementById("m130EventForm").querySelector('[type=submit]').hidden,true,"viewer cannot save "+b);
  d.getElementById("m130Close").click();
 }
 // All source statuses must survive open/close unchanged.
 canEdit=true;w.currentBuilding={id:"127HH"};
 for(const value of ["planned","in_progress","awaiting_approval","postponed","cancelled","skipped","completed"]){
  data["127HH"].events[0].status=value;
  w.mountMaintenance130();await settle();
  d.querySelector('[data-m130-event="127HH-PLAN:2026-10"]').click();
  assert.equal(d.getElementById("m130EventStatus").value,value,"preserve original status "+value);
  d.getElementById("m130Close").click();
 }
 // A PATCH returning HTTP 2xx but updating zero rows must not report success.
 data["127HH"].events[0].status="planned";
 w.mountMaintenance130();await settle();
 d.querySelector('[data-m130-event="127HH-PLAN:2026-10"]').click();
 d.getElementById("m130Result").value="Không được đánh dấu đã lưu";
 const savedNoticeCount=notices.length;
 swallowPatch=true;
 d.getElementById("m130EventForm").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
 await settle();swallowPatch=false;
 assert.equal(d.getElementById("m130Overlay").hidden,false,"leave failed save form open");
 assert.match(d.getElementById("m130SaveError").textContent,/Máy chủ chưa xác nhận/);
 assert.ok(!notices.slice(savedNoticeCount).some(n=>n.includes("✓ Đã lưu")),"never show false save success");
 d.getElementById("m130Close").click();
 // Admin PDF: four projects use exact new tables and never read legacy assets.
 w.ESTAAdminSummary.open();await settle();
 d.querySelector('[data-as-cat-all="0"]').click();await settle();
 const maintenanceCheck=d.querySelector('[data-as-category="maintenance"]');
 maintenanceCheck.checked=true;maintenanceCheck.dispatchEvent(new w.Event("change",{bubbles:true}));await settle();
 d.getElementById("asMonth").value=month;
 d.getElementById("asMonth").dispatchEvent(new w.Event("change",{bubbles:true}));
 d.getElementById("asRefresh").click();await settle();
 const preview=d.getElementById("asRows").textContent;
 for(const b of projects){
  assert.ok(preview.includes("Công việc bảo trì "+b),"Admin PDF includes live maintenance "+b);
  assert.ok(calls.some(v=>v.url.includes("esta_maintenance_plan_items")&&v.url.includes("building_id=eq."+encodeURIComponent(b))),"plan fetched for "+b);
  assert.ok(calls.some(v=>v.url.includes("esta_maintenance_plan_occurrences")&&v.url.includes("building_id=eq."+encodeURIComponent(b))),"occurrences fetched for "+b);
 }
 assert.ok(!preview.includes("THIẾT BỊ CŨ"),"no legacy duplicate");
 assert.ok(preview.includes("Dữ liệu mẫu"),"sample is clearly labelled");
 assert.match(d.getElementById("asPreviewHint").textContent,/mẫu chưa xác minh/);
 assert.ok(!d.getElementById("asExport").disabled,"PDF ready when all 4 queries succeed");
 d.getElementById("asExport").click();d.querySelector('[data-as-format="standard"]').click();await settle();
 const standard=pdfs.at(-1);
 assert.ok(standard.rows.some(r=>r[4]==="Mẫu · chưa xác minh"),"PDF sample marker");
 for(const b of projects)assert.ok(standard.rows.some(r=>r.join(" ").includes("Công việc bảo trì "+b)),"PDF 1 includes "+b);
 assert.ok(standard.photos.some(p=>p.ref==="storage:130HH/evidence.jpg"),"real saved photo in PDF");
 d.getElementById("asExport").click();d.querySelector('[data-as-format="executive"]').click();await settle();
 assert.equal(pdfs.at(-1).reportStyle,"executive","PDF type 2 supported");
 assert.match(admin,/\\.asTable table\\{min-width:0;display:block;width:100%\\}/,"mobile report does not require wide table");
 assert.match(css,/@media\\(max-width:640px\\)/,"mobile maintenance layout included");
 assert.match(css,/#m130Overlay \\.m130SaveError/,"error remains visible on mobile");
 dom.window.close();
 console.log("PASS four-project acceptance: scoped navigation/month/search/filter/edit/save/read-only/photos/PDF/mobile/sample detection");
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close();});
