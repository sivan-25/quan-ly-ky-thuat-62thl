"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {JSDOM}=require("jsdom");
const source=fs.readFileSync(path.join(__dirname,"..","maintenance-130.js"),"utf8");
new Function(source);
const projects=["68PĐL","62THL","127HH","130HH"];
const statuses={
 "68PĐL":{image_paths:[{kind:"after",ref:"storage:68/valid.jpg"}],started_at:null,finished_at:null,warning:"thiếu giờ"},
 "62THL":{image_paths:[{kind:"after",ref:"storage:62/valid.jpg"}],started_at:"2026-10-12T09:00:00Z",finished_at:"2026-10-12T10:00:00Z",warning:""},
 "127HH":{image_paths:[],started_at:null,finished_at:null,warning:"thiếu ảnh"},
 "130HH":{image_paths:[],started_at:"2026-10-12T09:00:00Z",finished_at:"2026-10-12T10:00:00Z",warning:"thiếu ảnh"}
};
const dom=new JSDOM('<!doctype html><html><body><div id="maintenancePage"><section class="maintenanceSchedule"></section><section class="maintenanceStats"></section><section class="maintenanceBoard"></section><section class="maintenanceHistoryCard"></section></div></body></html>',{url:"https://esta.test",runScripts:"outside-only"});
const w=dom.window,d=w.document;
w.currentBuilding={id:"68PĐL"};w.centralSession={access_token:"fixture"};
w.canProjectEdit=()=>true;w.toast=()=>{};w.estaRefreshProjectNavAlerts=()=>{};
w.mediaImgHtml=()=>'<img>';w.hydrateMediaImages=async()=>{};
w.sbFetch=async url=>{
 const b=decodeURIComponent(url.match(/building_id=eq\.([^&]+)/)?.[1]||"");
 assert(projects.includes(b),"project-specific query required: "+url);
 if(url.includes("/esta_maintenance_plan_items"))return [{
  id:b+"-plan",building_id:b,plan_code:b+"-CODE",plan_year:2026,
  work_title:"Kiểm tra minh chứng "+b,system_group:"PCCC",subsystem:"Tầng hầm",
  assigned_to:"Văn",cadence:"Không lặp",source_notes:"Đã nhập"
 }];
 if(url.includes("/esta_maintenance_plan_occurrences"))return [{
  id:b+"-event",building_id:b,item_id:b+"-plan",event_key:b+"-CODE:2026-10",
  planned_month:"2026-10-01",planned_date:"2026-10-12",status:"completed",
  result_note:"Kiểm tra đã ghi nhận",result_code:"pass",completed_by:"Văn",
  ...statuses[b]
 }];
 if(url.includes("/building_people"))return [{name:"Văn"}];
 if(url.includes("/building_equipment_profiles_nangcap")||url.includes("/ops_systems"))return [];
 throw Error("Unexpected read "+url);
};
w.eval(source);d.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));
const settle=async()=>{for(let i=0;i<13;i++)await new Promise(r=>setTimeout(r,0));};
(async()=>{
 for(const b of projects){
  w.currentBuilding={id:b};w.mountMaintenance130();await settle();
  const list=d.getElementById("m130List");
  assert.match(list.textContent,new RegExp("Kiểm tra minh chứng "+b));
  if(statuses[b].warning){
   assert.equal(list.querySelectorAll(".m130EvidenceWarning").length,1,b+" warns inline");
   assert.match(list.textContent,/Thiếu minh chứng/);
  }else assert.equal(list.querySelectorAll(".m130EvidenceWarning").length,0,b+" has complete evidence");
  const eventButton=list.querySelector('[data-m130-event="'+b+'-CODE:2026-10"]');
  assert(eventButton,"event can open "+b);eventButton.click();
  const banner=d.getElementById("m130LegacyEvidence");
  assert.equal(banner.hidden,!statuses[b].warning,"modal banner "+b);
  if(statuses[b].warning)assert.match(banner.textContent,new RegExp(statuses[b].warning));
  assert.equal(d.getElementById("m130EventStatus").value,"completed","historic status preserved");
  d.getElementById("m130Close").click();
  d.querySelector('[data-m130-view="cards"]').click();
  assert.equal(d.querySelectorAll("#m130List .m130EvidenceWarning").length,statuses[b].warning?1:0,"card warning "+b);
 }
 dom.window.close();
 console.log("PASS history evidence warnings: four projects, row/card and modal, no false status changes");
})().catch(err=>{console.error(err);process.exitCode=1;dom.window.close()});
