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
 w.currentBuilding={id:"130HH"};w.canProjectEdit=()=>true;w.centralSession={access_token:"test"};w.confirm=()=>true;w.toast=()=>{};
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
  f.down();f.move();
  assert.equal(f.d.getElementById("maintenancePage").classList.contains("estaMonthDragging"),true,"drag starts");
  assert.ok(f.d.querySelector(".estaMonthDragGhost"),"visible drag feedback");
  assert.ok(f.d.querySelector(".estaMonthDragTargets"),"separate accessible month drop targets appear only during a real drag");
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
  assert.equal(f.d.querySelector(".estaMonthDragTargets"),null,"long press alone does not begin drag");
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
  assert.equal(f.d.querySelector(".estaMonthDragTargets"),null,"drag targets removed after cancellation");
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
  f.activate("move");
  assert.equal(f.w.estaMaintenance130Mode(),"move");
  const chip=f.d.querySelector('[data-m130-drag="job1:2026-10"]');
  assert.equal(chip.draggable,true,"move mode activates immediate dragging");
  chip.click();
  assert.ok(chip.classList.contains("estaTaskSelected"),"click selects work item instead of opening editor");
  assert.equal(f.d.getElementById("m130Overlay").hidden,true);
  f.d.getElementById("estamNext").click();await flush();
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
  chip.click();await flush();
  const copied=f.w.__dragState().items.filter(i=>i.id!=="plan1"&&i.id!=="job1"&&i.id!=="job2");
  assert.equal(copied.length,1,"clone inserts one new plan");
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

 const index=read("index.html"),css=read("maintenance-month-drag.css");
 assert.ok(index.includes('<script src="maintenance-month-drag.js?v=20261030-modes06">'),"new module loaded into real page");
 assert.match(css,/\.estaMonthDragTargets\{[\s\S]*position:fixed/,"a separate dock is reachable when dragging from day 31");
 assert.match(css,/\.m130CalendarChip\[draggable="true"\]/,"draggable work cards have an intentional cursor");
 assert.match(css,/\.m130CalendarTitle/,"work title typography is styled");
 assert.doesNotMatch(css,/#maintenancePage\.estaMonthDragging \.estamMonthNav\s*\{\s*position:fixed/,"month heading must never become floating and overlap add-maintenance controls");
 console.log("PASS: normal clicks, opt-in quick move, clone next empty day, cross-month clone, drop-only calendar changes and February clamping");
})().catch(err=>{console.error(err);process.exitCode=1});
