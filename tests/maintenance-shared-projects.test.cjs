"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM}=require("jsdom");
const source=fs.readFileSync(path.join(__dirname,"..","maintenance-130.js"),"utf8");
new Function(source);
const projects=["130HH","62THL","68PĐL","127HH"];
const dom=new JSDOM('<!doctype html><html><body><div id="maintenancePage"><section class="maintenanceSchedule"></section><section class="maintenanceStats"></section><section class="maintenanceBoard"></section><section class="maintenanceHistoryCard"></section></div></body></html>',{url:"https://esta.test/",runScripts:"outside-only"});
const w=dom.window,d=w.document;
const calls=[];
const date=new Date();
const year=date.getFullYear(),month=String(date.getMonth()+1).padStart(2,"0"),when=year+"-"+month+"-12";
const data=Object.fromEntries(projects.map(b=>{
 const planCode=b+"-TEST";
 return [b,{
  plans:[{id:b+"-plan",building_id:b,plan_code:planCode,plan_year:year,work_title:"Bảo trì riêng "+b,system_group:"PCCC",subsystem:"Khu riêng "+b,assigned_to:"Kỹ thuật",cadence:"Không lặp",source_notes:"MẪU kiểm thử",priority:"normal",work_type:"PM"}],
  events:[{id:b+"-event",building_id:b,item_id:b+"-plan",event_key:planCode+":"+year+"-"+month,planned_month:year+"-"+month+"-01",planned_date:when,status:"planned",image_paths:[]}],
  people:[{name:"Kỹ thuật "+b}]
 }];
}));
// 68 PĐL has imported schedules with explicit month-only records and plans without a date.
data["68PĐL"].events[0].planned_date=null;
data["68PĐL"].events.push({...data["68PĐL"].events[0],id:"68PĐL-january",event_key:"68PĐL-TEST:"+year+"-01",planned_month:year+"-01-01"});
data["68PĐL"].plans.push({...data["68PĐL"].plans[0],id:"68PĐL-pending",plan_code:"68PĐL-PENDING",work_title:"Hạng mục chưa có lịch"});
w.currentBuilding={id:"130HH"};
w.centralSession={access_token:"fixture"};
w.toast=()=>{};
w.canProjectEdit=()=>true;
w.mediaImgHtml=()=>"<img>";
w.hydrateMediaImages=async()=>{};
w.estaRefreshProjectNavAlerts=()=>{};
w.sbFetch=async url=>{
 calls.push(url);
 const b=url.match(/building_id=eq\.([^&]+)/)?.[1];
 if(!data[b])throw Error("Missing or cross-building filter: "+url);
 if(url.includes("esta_maintenance_plan_items"))return data[b].plans;
 if(url.includes("esta_maintenance_plan_occurrences"))return data[b].events;
 if(url.includes("building_people"))return data[b].people;
 throw Error("Unexpected endpoint: "+url);
};
w.eval(source);
d.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));
const tick=()=>new Promise(resolve=>setTimeout(resolve,10));
(async()=>{
 for(const building of projects){
  w.currentBuilding={id:building};
  w.mountMaintenance130();
  await tick();
  const page=d.getElementById("maint130");
  assert.ok(page&&!page.hidden,"130HH UI visible for "+building);
  assert.match(page.querySelector(".m130Header small").textContent,new RegExp(building==="130HH"?"130 HỒNG HÀ":building==="62THL"?"62 TRẦN HUY LIỆU":building==="127HH"?"127 HỒNG HÀ":"68 PHAN ĐĂNG LƯU"));
  assert.match(page.querySelector("#m130List").textContent,new RegExp("Bảo trì riêng "+building));
  for(const other of projects.filter(x=>x!==building)){
   assert.ok(!page.querySelector("#m130List").textContent.includes("Bảo trì riêng "+other),"No cross-project rows: "+building+" / "+other);
  }
  const selectedMonth=d.getElementById("m130Months").querySelector(".sel");
  assert.ok(selectedMonth,"month navigation exists: "+building);
  assert.ok(d.querySelector("#m130Pdf"),"shared PDF exists: "+building);
  if(building==="68PĐL"){
   assert.match(page.querySelector("#m130List").textContent,/Chưa ấn định ngày/,"do not invent 68 PĐL dates");
   assert.equal(page.querySelector(".m130Date b").textContent,"—","undated maintenance date tile");
   assert.equal(d.querySelector('[data-m130-month="1"] b').textContent,"1","imported January occurrence retained");
   assert.ok(page.querySelector(".m130Unscheduled summary"),"unscheduled legacy plans discoverable");
  }
 }
 assert.equal(d.querySelectorAll("#maint130").length,1,"single shared DOM; no duplicate maintenance pages");
 for(const building of projects){
  assert.ok(calls.some(url=>url.includes("building_id=eq."+building)&&url.includes("esta_maintenance_plan_items")),building+" queried independently");
 }
 // Simulate a stale API response completing after the operator switches projects.
 let release;
 const slow=new Promise(resolve=>release=resolve);
 w.sbFetch=async url=>{
  const b=url.match(/building_id=eq\.([^&]+)/)?.[1];
  if(b==="130HH")await slow;
  if(url.includes("esta_maintenance_plan_items"))return data[b].plans;
  if(url.includes("esta_maintenance_plan_occurrences"))return data[b].events;
  if(url.includes("building_people"))return data[b].people;
  throw Error("Unexpected endpoint");
 };
 w.currentBuilding={id:"130HH"};w.mountMaintenance130();
 w.currentBuilding={id:"62THL"};w.mountMaintenance130();
 await tick();
 assert.match(d.querySelector("#m130List").textContent,/Bảo trì riêng 62THL/);
 release();
 await tick();
 assert.match(d.querySelector("#m130List").textContent,/Bảo trì riêng 62THL/,"late 130 response must be ignored");
 assert.ok(!d.querySelector("#m130List").textContent.includes("Bảo trì riêng 130HH"));
 dom.window.close();
 console.log("Shared maintenance: 130/127/62/68 independent data, same UI, no stale cross-project response");
})().catch(error=>{console.error(error);process.exitCode=1;dom.window.close()});
