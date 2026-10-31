const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM}=require("jsdom");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const native=read("maintenance-130.js"),redesign=read("maintenance-redesign.js"),drag=read("maintenance-month-drag.js");
new Function(native);new Function(redesign);new Function(drag);
const html='<div id="app" class="maintenanceMode"><header class="estaTopbar"><div class="headerTools"><button id="peopleSettingsBtn">Kỹ thuật</button></div></header><div id="maintenancePage" class="maintenancePage"><section class="maintenanceHero"></section><section class="maintenanceSchedule"></section></div></div>';
const flush=()=>new Promise(r=>setTimeout(r,30));
async function fixture(sourceDate,otherDate){
 const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:"https://esta.local",runScripts:"outside-only",pretendToBeVisual:true});
 const w=dom.window,d=w.document,calls=[];
 w.currentBuilding={id:"130HH"};w.canProjectEdit=()=>true;w.centralSession={access_token:"test"};w.confirm=()=>true;w.toast=(message)=>calls.push({toast:message});
 const savedRows=new Map();
 w.crypto.randomUUID=(()=>{let count=0;return ()=>"00000000-0000-4000-8000-"+String(++count).padStart(12,"0")})();
 w.sbFetch=async(url,opts={})=>{
  calls.push({url,opts});
  const table=url.includes("esta_maintenance_plan_items")?"item":url.includes("esta_maintenance_plan_occurrences")?"event":"other";
  const id=decodeURIComponent(url.match(/[?&]id=eq\.([^&]+)/)?.[1]||opts.body?.id||"");
  if(opts.method==="POST"){savedRows.set(table+":"+id,{...opts.body});return [];}
  if(opts.method==="PATCH"){savedRows.set(table+":"+id,{...savedRows.get(table+":"+id),...opts.body});return [];}
  if(url.includes("select=*")&&id)return savedRows.has(table+":"+id)?[savedRows.get(table+":"+id)]:[];
  return [];
 };
 const injected=native.replace(/\}\)\(\);\s*$/,`window.__seedMaintenanceDrag=(date,other)=>{
   const plan=(id,title)=>({id,building_id:"130HH",plan_code:id,cadence:"0",work_title:title,system_group:"HVAC",subsystem:"Hầm 1",assigned_to:"KTV",priority:"normal",source_notes:"Dữ liệu thật"});
   const ev=(id,date)=>({id:"occ-"+id,item_id:id,building_id:"130HH",event_key:id+":"+date.slice(0,7),planned_month:date.slice(0,7)+"-01",planned_date:date,due_date:date,status:"planned"});
   items=[plan("job1","Bảo trì quạt số 1"),plan("job2","Bảo trì quạt số 2")];
   stored=[ev("job1",date),ev("job2",other)];
   year=Number(date.slice(0,4));month=Number(date.slice(5,7));ready=true;clearScheduleCache();render();
 };
 window.__dragState=()=>({year,month,items,stored});})();`);
 assert.notEqual(injected,native,"native module fixture injection");
 w.eval(injected);w.eval(redesign);w.eval(drag);
 d.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));
 await flush();
 w.__seedMaintenanceDrag(sourceDate,otherDate);
 d.querySelector('[data-estam-view="calendar"]').click();
 await flush();
 const chip=d.querySelector('[data-m130-drag="job1:'+sourceDate.slice(0,7)+'"]');
 assert.ok(chip,"source chip appears in actual maintenance calendar");
 assert.equal(chip.draggable,false,"normal mode never captures drag gestures");
 let hit=d.getElementById("estamNext");
 d.elementFromPoint=()=>hit;
 const pointer=(type,x,y)=>d.dispatchEvent(new w.MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:x,clientY:y}));
 function down(){chip.dispatchEvent(new w.MouseEvent("pointerdown",{bubbles:true,cancelable:true,button:0,clientX:100,clientY:450}));}
 function move(){pointer("pointermove",480,150);}
 function up(){pointer("pointerup",480,150);}
 return {dom,w,d,calls,down,move,up,activate:mode=>{d.getElementById("estaMaintenanceSettingsToggle").click();d.querySelector(`[data-esta-action="${mode}"]`).click();},setHit:el=>{hit=el}};
}
(async()=>{
 // Clicking a work card should not start dragging, move month header, or block normal arrow navigation.
 {
  const f=await fixture("2026-10-10","2026-10-20");
  const source=f.d.querySelector('[data-m130-drag="job1:2026-10"]');
  const before=f.d.getElementById("estamMonth").textContent;
  f.down();
  assert.equal(f.d.querySelector(".estaMonthDragTargets"),null,"no floating controls on pointer down");
  f.d.dispatchEvent(new f.w.MouseEvent("pointerup",{bubbles:true,cancelable:true,button:0,clientX:100,clientY:450}));
  assert.equal(f.d.querySelector(".estaMonthDragTargets"),null,"no floating controls after a click");
  assert.equal(f.d.querySelector(".estamMonthNav").parentElement.classList.contains("estamSummary"),true);
  assert.equal(f.d.getElementById("estamMonth").textContent,before,"clicking a job does not change its month");
  assert.equal(source.draggable,false,"ordinary mode keeps native work-item clicks responsive");
  source.click();
  assert.equal(f.d.getElementById("m130Overlay").hidden,false,"ordinary click still opens work item editor");
  f.d.getElementById("estamNext").click();await flush();
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 11/2026","next arrow works as a normal click");
  f.d.getElementById("estamPrev").click();await flush();
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 10/2026","previous arrow works as a normal click");
  f.dom.window.close();
 }
 // Drop directly on the visible right arrow: preserve the 31st by clipping to Nov 30.
 {
  const f=await fixture("2026-10-31","2026-11-30");
  f.activate("move");
  f.w.confirm=()=>{throw new Error("Move mode must not show confirmation");};
  f.down();f.move();
  assert.equal(f.d.getElementById("maintenancePage").classList.contains("estaMonthDragging"),true,"drag starts");
  assert.ok(f.d.querySelector(".estaMonthDragGhost"),"visible drag feedback");
  assert.ok(f.d.querySelector(".estaMonthDragTargets"),"month arrows remain visible during drag");
  assert.equal(f.d.querySelector(".estamMonthNav").parentElement.classList.contains("estamSummary"),true,"original header stays inside the summary panel");
  f.up();await flush();
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 11/2026","real header moves to November");
  const ev=f.w.__dragState().stored.find(o=>o.item_id==="job1");
  assert.equal(ev.planned_date,"2026-11-30");
  assert.equal(ev.planned_month,"2026-11-01");
  assert.ok(f.calls.some(c=>c.opts.method==="PATCH"&&c.opts.body?.planned_date==="2026-11-30"),"new date persisted");
  assert.equal(f.d.querySelectorAll('[data-m130-date="2026-11-30"] .m130CalendarChip').length,2,"two tasks displayed together");
  assert.ok(!f.d.querySelector(".estaMonthDragGhost"),"drag ghost cleaned");
  f.dom.window.close();
 }
 // Left arrow can move from March 31 to February 28 in a non-leap year.
 {
  const f=await fixture("2027-03-31","2027-02-12");
  f.activate("move");
  f.setHit(f.d.getElementById("estamPrev"));
  f.down();f.move();f.up();await flush();
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2027-02-28");
  f.dom.window.close();
 }
 // Leap-year February takes day 29 instead of a nonexistent 31.
 {
  const f=await fixture("2028-03-31","2028-02-12");
  f.activate("move");
  f.setHit(f.d.getElementById("estamPrev"));
  f.down();f.move();f.up();await flush();
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2028-02-29");
  f.dom.window.close();
 }
 // A long press, including a long hover over the next-month arrow, must never change the month.
 {
  const f=await fixture("2026-10-10","2026-11-15");
  f.activate("move");
  f.down();
  await new Promise(resolve=>setTimeout(resolve,750));
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 10/2026","holding a task does not navigate");
  assert.ok(f.d.querySelector(".estaMonthDragTargets"),"month arrows already visible in Move mode, even before drag");
  f.move();
  await new Promise(resolve=>setTimeout(resolve,800));
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 10/2026","hovering over arrow does not navigate");
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2026-10-10","hovering does not save a new date");
  f.up();await flush();
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 11/2026","only releasing over arrow navigates");
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2026-11-10");
  f.dom.window.close();
 }
 // Moving far away from the original task or hovering over the arrow must never reschedule.
 {
  const f=await fixture("2026-10-10","2026-10-20");
  f.activate("move");
  const out=f.d.querySelector("#maintenancePage .maintenanceHero");
  f.down();f.move();
  await new Promise(resolve=>setTimeout(resolve,700));
  f.setHit(out);
  f.move();f.up();await flush();
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 10/2026","releasing outside drop target leaves current month unchanged");
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2026-10-10","releasing outside does not update the task");
  assert.ok(!f.calls.some(c=>c.opts.method==="PATCH"),"outside drop makes no database write");
  assert.ok(f.d.querySelector(".estaMonthDragTargets"),"persistent arrows remain after drag cancellation");
  f.dom.window.close();
 }
 // Dropping onto an exact date still supports two maintenance cards in the same day.
 {
  const f=await fixture("2026-10-10","2026-10-20");
  f.activate("move");
  const cell=f.d.querySelector('[data-m130-date="2026-10-20"]');
  assert.ok(cell);
  f.setHit(cell);f.down();f.move();f.up();await flush();
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2026-10-20");
  assert.equal(f.d.querySelectorAll('[data-m130-date="2026-10-20"] .m130CalendarChip').length,2);
  f.dom.window.close();
 }
 // Settings: select a work item, then use a month arrow without dragging or holding.
 {
  const f=await fixture("2026-10-10","2026-11-12");
  assert.ok(f.d.getElementById("estaMaintenanceSettingsToggle"),"maintenance settings exists");
  const settings=f.d.getElementById("estaMaintenanceSettings");
  assert.equal(settings.hidden,false,"130HH settings must be visible without needing a particular view attribute");
  assert.equal(settings.parentElement?.id,"estamNativeActions","settings sits next to Add maintenance");
  assert.ok(f.d.getElementById("m130Create").parentElement===settings.parentElement,"settings and Add maintenance share a toolbar");
  f.d.getElementById("estaMaintenanceSettingsToggle").click();
  assert.equal(f.d.getElementById("estaMaintenanceSettingsMenu").hidden,false,"settings menu expands with move and clone choices");
  f.d.getElementById("estaMaintenanceSettingsToggle").click();
  f.activate("move");
  assert.equal(f.w.estaMaintenance130Mode(),"move");
  f.w.confirm=()=>{throw new Error("Selected Move mode must not confirm");};
  const persistent=f.d.querySelector(".estaMonthDragTargets");
  assert.ok(persistent&&persistent.querySelectorAll("[data-esta-month-drop]").length===2,"previous/next arrows show immediately upon selecting Move");
  assert.equal(persistent.children.length,2,"exactly two buttons on one row, no caption");
  const chip=f.d.querySelector('[data-m130-drag="job1:2026-10"]');
  assert.equal(chip.draggable,true,"move mode activates immediate dragging");
  chip.click();
  assert.ok(chip.classList.contains("estaTaskSelected"),"click selects work item instead of opening editor");
  assert.equal(f.d.getElementById("m130Overlay").hidden,true);
  assert.equal(f.d.getElementById("estaMaintenanceModeHelp").textContent,"","no yellow instruction banner in move mode");
  persistent.querySelector('[data-esta-month-drop="next"]').click();await flush();
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2026-11-10");
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 11/2026");
  assert.ok(!f.d.querySelector(".estaTaskSelected"),"selection clears after moving");
  f.dom.window.close();
 }
 // Clone mode creates an independent one-off plan in the nearest completely empty day.
 {
  const f=await fixture("2026-10-14","2026-10-15");
  f.activate("clone");
  assert.equal(f.w.estaMaintenance130Mode(),"clone");
  const chip=f.d.querySelector('[data-m130-drag="job1:2026-10"]');
  assert.equal(chip.draggable,false,"clone mode is click-only");
  const probe=f.w.estaMaintenance130DragActions.getSource("job1:2026-10","clone");
  chip.click();await flush();
  const copied=f.w.__dragState().items.filter(i=>i.id!=="plan1"&&i.id!=="job1"&&i.id!=="job2");
  assert.equal(copied.length,1,"clone inserts one new plan; calls="+JSON.stringify(f.calls).slice(0,1400)+", source="+Boolean(probe)+", mode="+f.w.estaMaintenance130Mode()+", help="+f.d.getElementById("estaMaintenanceModeHelp").textContent);
  const clonePlan=copied[0];
  const newEvent=f.w.__dragState().stored.find(e=>e.item_id===clonePlan.id);
  assert.equal(newEvent.planned_date,"2026-10-16","occupied Thursday skipped for empty Friday");
  assert.equal(clonePlan.work_title,"Bảo trì quạt số 1");
  assert.equal(clonePlan.cadence,"Không lặp","copy never creates recurring work unexpectedly");
  assert.equal(newEvent.status,"planned");
  assert.notEqual(newEvent.item_id,"job1");
  assert.ok(f.calls.some(c=>c.opts.method==="POST"&&c.url.includes("esta_maintenance_plan_items")));
  assert.ok(f.calls.some(c=>c.opts.method==="POST"&&c.url.includes("esta_maintenance_plan_occurrences")));
  assert.equal(f.d.querySelectorAll('[data-m130-date="2026-10-16"] .m130CalendarChip').length,1);
  f.dom.window.close();
 }
 // Two accidental copies can be removed independently using a minus beneath plus.
 {
  const f=await fixture("2026-10-14","2026-10-15");
  f.activate("clone");
  const original=f.d.querySelector('[data-m130-drag="job1:2026-10"]');
  const originalControls=original.parentElement.querySelector(".estaCloneControls");
  assert.ok(originalControls,"clone controls appear on original work item");
  assert.ok(originalControls.querySelector(".estaClonePlus"),"plus appears on original work item");
  assert.ok(originalControls.querySelector(".estaCloneMinus"),"minus is available on original plans too");
  originalControls.querySelector(".estaClonePlus").click();await flush();
  let duplicates=f.w.__dragState().items.filter(i=>i.source_notes==="Nhân bản từ lịch bảo trì ESTA"&&!i.deleted_at);
  assert.equal(duplicates.length,1);
  const first=duplicates[0];
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id===first.id).planned_date,"2026-10-16");
  const firstChip=f.d.querySelector('[data-m130-drag="'+first.plan_code+':2026-10"]');
  assert.ok(firstChip,"copy is rendered in the destination day");
  const controls=firstChip.parentElement.querySelector(".estaCloneControls");
  assert.ok(controls.querySelector(".estaClonePlus"),"copy also has plus");
  assert.ok(controls.querySelector(".estaCloneMinus"),"copy has a minus underneath its plus");
  const buttons=[...controls.querySelectorAll("button")];
  assert.deepEqual(buttons.map(x=>x.textContent.trim()),["+","−"],"plus above minus in DOM and CSS flex-column");
  f.d.querySelector('[data-m130-drag="job1:2026-10"]').parentElement.querySelector(".estaClonePlus").click();await flush();
  duplicates=f.w.__dragState().items.filter(i=>i.source_notes==="Nhân bản từ lịch bảo trì ESTA"&&!i.deleted_at);
  assert.equal(duplicates.length,2,"can create two independent copies");
  const deletedId=first.id;
  const toastCount=f.calls.filter(c=>c.toast).length;
  f.w.confirm=()=>{throw new Error("Minus must delete without a confirm dialog");};
  f.d.querySelector('[data-m130-drag="'+first.plan_code+':2026-10"]').parentElement.querySelector(".estaCloneMinus").click();await flush();
  assert.equal(f.calls.filter(c=>c.toast).length,toastCount,"successful minus delete is silent");
  const state=f.w.__dragState();
  assert.ok(state.items.find(i=>i.id===deletedId).deleted_at,"minus soft deletes only selected copy");
  assert.ok(state.items.find(i=>i.id==="job1"&&!i.deleted_at),"original plan was not deleted");
  assert.equal(state.items.filter(i=>i.source_notes==="Nhân bản từ lịch bảo trì ESTA"&&!i.deleted_at).length,1,"remaining duplicate retained");
  assert.ok(f.calls.some(c=>c.opts?.method==="PATCH"&&c.url.includes("esta_maintenance_plan_items")&&c.url.includes("id=eq."+deletedId)&&c.opts.body.deleted_at),"deletion sent to scoped API");
  assert.equal(f.d.querySelector('[data-m130-drag="'+first.plan_code+':2026-10"]'),null,"deleted copy disappears after verified soft delete; state="+JSON.stringify({layout:f.d.getElementById("m130List")?.className,all:f.d.querySelectorAll("#m130List .m130CalendarChip").length,toasts:f.calls.filter(x=>x.toast).slice(-4)}));
  f.dom.window.close();
 }
 // Original maintenance plans can also be soft-deleted immediately from their own minus button.
 {
  const f=await fixture("2026-10-14","2026-10-15");
  f.activate("clone");
  const chip=f.d.querySelector('[data-m130-drag="job1:2026-10"]');
  const minus=chip.parentElement.querySelector(".estaCloneMinus");
  assert.ok(minus,"original maintenance work also has minus");
  const beforeToast=f.calls.filter(x=>x.toast).length;
  f.w.confirm=()=>{throw new Error("Minus action may not ask for confirmation");};
  minus.click();await flush();
  const plan=f.w.__dragState().items.find(i=>i.id==="job1");
  assert.ok(plan?.deleted_at,"original plan is soft-deleted");
  assert.equal(f.d.querySelector('[data-m130-drag="job1:2026-10"]'),null,"original card disappears");
  assert.ok(f.d.querySelector('[data-m130-drag="job2:2026-10"]'),"other plans are retained");
  assert.ok(f.calls.some(c=>c.opts?.method==="PATCH"&&c.url.includes("id=eq.job1")&&c.opts.body?.deleted_at),"original scoped deletion persisted");
  assert.equal(f.calls.filter(x=>x.toast).length,beforeToast,"original deletion shows no success notification");
  f.dom.window.close();
 }
 // At month boundaries, an occupied first day is skipped and the duplicate remains independently scheduled.
 {
  const f=await fixture("2026-10-31","2026-11-01");
  f.activate("clone");
  f.d.querySelector('[data-m130-drag="job1:2026-10"]').click();await flush();
  const extra=f.w.__dragState().stored.find(e=>e.item_id!=="job1"&&e.item_id!=="job2");
  assert.equal(extra?.planned_date,"2026-11-02");
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 11/2026");
  f.dom.window.close();
 }

 // The settings button exists only in Calendar, not Bảng/Thẻ/Timeline.
 {
  const f=await fixture("2026-10-10","2026-10-20");
  const settings=f.d.getElementById("estaMaintenanceSettings");
  assert.equal(settings.hidden,false,"settings visible in calendar");
  assert.deepEqual([...settings.querySelectorAll("[data-esta-action]")].map(x=>x.textContent.trim()),["Xem và chỉnh sửa","Di chuyển","Nhân bản"],"settings has exactly three actions, no extra heading or help");
  assert.equal(settings.querySelector("small, b"),null,"settings removes extra heading and help");
  assert.ok(f.d.querySelector("#estaMaintenanceSettingsToggle svg.estaSettingsIcon"),"custom SVG settings icon is rendered");
  f.activate("move");
  f.d.querySelector('[data-estam-view="rows"]').click();await flush();
  assert.equal(f.d.getElementById("maintenancePage").dataset.estamView,"rows");
  assert.equal(settings.hidden,true,"settings hidden in Bảng");
  assert.equal(f.w.estaMaintenance130Mode(),"off","leaving calendar exits Move mode");
  assert.equal(f.d.querySelector(".estaMonthDragTargets"),null,"month dock removed outside Calendar");
  f.d.querySelector('[data-estam-view="cards"]').click();await flush();
  assert.equal(settings.hidden,true,"settings hidden in Thẻ");
  f.d.querySelector('[data-estam-view="timeline"]').click();await flush();
  assert.equal(settings.hidden,true,"settings hidden in Timeline");
  f.d.querySelector('[data-estam-view="calendar"]').click();await flush();
  assert.equal(settings.hidden,false,"settings restored only in Calendar");
  f.dom.window.close();
 }

 const index=read("index.html"),css=read("maintenance-month-drag.css");
 assert.ok(index.includes('<script src="maintenance-month-drag.js?v=20261030-ux09">'),"new module loaded into real page");
 assert.match(css,/\.estaMonthDragTargets\{[\s\S]*position:fixed/,"a separate dock is reachable when dragging from day 31");
 assert.match(css,/\.m130CalendarChip\[draggable="true"\]/,"draggable work cards have an intentional cursor");
 assert.match(css,/\.m130CalendarTitle/,"work title typography is styled");
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/,"month arrows use equal grid columns");
 assert.match(css,/#estaMaintenanceModeHelp\{display:none!important\}/,"yellow helper is hidden");
 assert.doesNotMatch(css,/#maintenancePage\.estaMonthDragging \.estamMonthNav\s*\{\s*position:fixed/,"month heading must never become floating and overlap add-maintenance controls");
 assert.match(css,/#estamNativeActions #estaMaintenanceSettings:not\(\[hidden\]\)/,"settings visibility no longer depends on a calendar attribute");
 assert.doesNotMatch(css,/#maintenancePage\[data-estam-building="130HH"\]\[data-estam-view="calendar"\] #estaMaintenanceSettings/,"fragile view-specific hiding removed");
 console.log("PASS: silent move and minus delete, calendar-only settings, balanced arrows, clone safety and month clamping");
})().catch(err=>{console.error(err);process.exitCode=1});
