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
 w.sbFetch=async(url,opts={})=>{calls.push({url,opts});return []};
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
 assert.equal(chip.draggable,true);
 let hit=d.getElementById("estamNext");
 d.elementFromPoint=()=>hit;
 const pointer=(type,x,y)=>d.dispatchEvent(new w.MouseEvent(type,{bubbles:true,cancelable:true,button:0,clientX:x,clientY:y}));
 function down(){chip.dispatchEvent(new w.MouseEvent("pointerdown",{bubbles:true,cancelable:true,button:0,clientX:100,clientY:450}));}
 function move(){pointer("pointermove",480,150);}
 function up(){pointer("pointerup",480,150);}
 return {dom,w,d,calls,down,move,up,setHit:el=>{hit=el}};
}
(async()=>{
 // Drop directly on the visible right arrow: preserve the 31st by clipping to Nov 30.
 {
  const f=await fixture("2026-10-31","2026-11-30");
  f.down();f.move();
  assert.equal(f.d.getElementById("maintenancePage").classList.contains("estaMonthDragging"),true,"drag starts");
  assert.ok(f.d.querySelector(".estaMonthDragGhost"),"visible drag feedback");
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
  f.setHit(f.d.getElementById("estamPrev"));
  f.down();f.move();f.up();await flush();
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2027-02-28");
  f.dom.window.close();
 }
 // Leap-year February takes day 29 instead of a nonexistent 31.
 {
  const f=await fixture("2028-03-31","2028-02-12");
  f.setHit(f.d.getElementById("estamPrev"));
  f.down();f.move();f.up();await flush();
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2028-02-29");
  f.dom.window.close();
 }
 // Hover the real arrow until next month appears, then drop into a specific day.
 {
  const f=await fixture("2026-10-10","2026-11-15");
  f.down();f.move();
  await new Promise(resolve=>setTimeout(resolve,600));
  assert.equal(f.d.getElementById("estamMonth").textContent,"Tháng 11/2026","hover opens next month while pointer remains active");
  const cell=f.d.querySelector('[data-m130-date="2026-11-15"]');
  assert.ok(cell);
  f.setHit(cell);f.move();f.up();await flush();
  assert.equal(f.w.__dragState().stored.find(e=>e.item_id==="job1").planned_date,"2026-11-15");
  assert.equal(f.d.querySelectorAll('[data-m130-date="2026-11-15"] .m130CalendarChip').length,2);
  f.dom.window.close();
 }
 const index=read("index.html"),css=read("maintenance-month-drag.css");
 assert.ok(index.includes('<script src="maintenance-month-drag.js?v=20261030-dragfix03">'),"new module loaded into real page");
 assert.match(css,/position:fixed!important/,"real visible arrows float during drag from day 31");
 console.log("PASS: actual ESTA arrow drag, hover, February clipping, two jobs in cell, cache bust");
})().catch(err=>{console.error(err);process.exitCode=1});
