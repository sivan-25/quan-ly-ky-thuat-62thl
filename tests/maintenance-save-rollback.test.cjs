"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {JSDOM}=require("jsdom");
const source=fs.readFileSync(path.join(__dirname,"..","maintenance-130.js"),"utf8");
new Function(source);
const PROJECTS=["68PĐL","62THL","127HH","130HH"];
const dom=new JSDOM('<!doctype html><html><body><div id="maintenancePage"><section class="maintenanceSchedule"></section><section class="maintenanceStats"></section><section class="maintenanceBoard"></section><section class="maintenanceHistoryCard"></section></div></body></html>',{
 url:"https://esta.test/",runScripts:"outside-only"
});
const w=dom.window,d=w.document;
const rows=Object.fromEntries(PROJECTS.map(building=>[building,[]]));
const writes=[];
w.currentBuilding={id:PROJECTS[0]};
w.centralSession={access_token:"fixture"};
w.canProjectEdit=()=>true;
w.toast=()=>{};
w.estaRefreshProjectNavAlerts=()=>{};
w.mediaImgHtml=()=>"<img>";
w.hydrateMediaImages=async()=>{};
w.sbFetch=async(url,opts={})=>{
 const method=opts.method||"GET";
 const scoped=url.match(/building_id=eq\.([^&]+)/)?.[1];
 const building=decodeURIComponent(scoped||opts.body?.building_id||"");
 assert(PROJECTS.includes(building),"must scope every query: "+url);
 const table=url.match(/\/rest\/v1\/([^?]+)/)?.[1];
 writes.push({building,table,method});
 if(table==="building_people")return [{name:"Văn"}];
 if(table==="building_equipment_profiles_nangcap"||table==="ops_systems")return [];
 if(table==="esta_maintenance_plan_occurrences"){
  if(method==="POST")throw Error("Mô phỏng lỗi ghi lịch");
  return [];
 }
 if(table==="esta_maintenance_plan_items"){
  if(method==="POST"){
   rows[building].push({...opts.body});
   return [];
  }
  if(method==="PATCH"){
   const id=url.match(/id=eq\.([^&]+)/)?.[1];
   const draft=rows[building].find(x=>x.id===id);
   assert(draft,"draft must exist for scoped rollback");
   Object.assign(draft,opts.body);
   return [];
  }
  assert.notEqual(method,"DELETE","no hard delete for incomplete plan");
  const id=url.match(/id=eq\.([^&]+)/)?.[1];
  return id?rows[building].filter(x=>x.id===id):rows[building];
 }
 throw Error("Unexpected endpoint: "+url);
};
w.eval(source);
d.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));
const settle=async()=>{for(let i=0;i<16;i++)await new Promise(resolve=>setTimeout(resolve,0));};
(async()=>{
 for(const building of PROJECTS){
  w.currentBuilding={id:building};
  w.mountMaintenance130();await settle();
  const create=d.getElementById("m130Create");
  assert(create,"create button "+building);
  create.click();await settle();
  d.getElementById("m130Title").value="Thử hoàn tác "+building;
  d.getElementById("m130First").value="2026-10-18";
  d.getElementById("m130Cycle").value="0";
  d.getElementById("m130Assignee").value="Văn";
  d.getElementById("m130PlanForm").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
  await settle();
  assert.equal(rows[building].length,1,"draft actually inserted for "+building);
  assert.ok(rows[building][0].deleted_at,"failed draft must be soft deleted "+building);
  assert.equal(d.getElementById("m130Overlay").hidden,false,"keep failed save visible "+building);
  assert.match(d.getElementById("m130SaveError").textContent,/Mô phỏng lỗi ghi lịch/,"explain failure "+building);
  assert.equal(writes.filter(x=>x.building===building&&x.table==="esta_maintenance_plan_items"&&x.method==="PATCH").length,1);
  assert.equal(writes.filter(x=>x.building===building&&x.method==="DELETE").length,0);
  d.getElementById("m130Close").click();
 }
 assert.equal(PROJECTS.reduce((sum,b)=>sum+rows[b].length,0),4);
 dom.window.close();
 console.log("PASS maintenance rollback: four project-scoped soft deletes, no ghost active plans, no hard deletes");
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
