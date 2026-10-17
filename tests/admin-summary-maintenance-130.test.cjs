"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {JSDOM}=require("jsdom");
const root=path.join(__dirname,"..");
const maintenance=fs.readFileSync(path.join(root,"maintenance-130.js"),"utf8");
const report=fs.readFileSync(path.join(root,"admin-summary-report.js"),"utf8");
new Function(maintenance);new Function(report);
const dom=new JSDOM('<!doctype html><html><body><div id="homePage"></div><nav id="navAdmin"></nav><div id="maintenancePage"><section class="maintenanceSchedule"></section></div></body></html>',{url:"https://esta.test",runScripts:"outside-only"});
const w=dom.window,d=w.document,calls=[],pdfResults=[];
w.currentBuilding={id:"130HH"};w.currentAccount={is_admin:true};
w.centralSession={access_token:"fixture"};w.projectOverviewActive=false;
w.ESTAReportModel={localDay:()=>"2026-10-17"};
w.toast=()=>{};w.canProjectEdit=()=>true;w.estaRefreshProjectNavAlerts=()=>{};
w.exportGenericEstaPdf=async model=>{pdfResults.push(model);return true;};
const plans=[
 {id:"repeat",building_id:"130HH",plan_code:"REPEAT",work_title:"Bảo trì bơm định kỳ",system_group:"PCCC",subsystem:"Tầng hầm",cadence:"1 tháng",assigned_to:"Văn",priority:"high"},
 {id:"done",building_id:"130HH",plan_code:"DONE",work_title:"Bảo trì thang đã hoàn thành",system_group:"Thang máy",cadence:"Không lặp",assigned_to:"Văn"},
 {id:"cancel",building_id:"130HH",plan_code:"CANCEL",work_title:"Bảo trì máy bị hủy",system_group:"HVAC",cadence:"Không lặp"},
 {id:"deleted",building_id:"130HH",plan_code:"DELETED",work_title:"Kế hoạch đã lưu trữ",deleted_at:"2026-10-10",cadence:"Không lặp"}
];
const occurrences=[
 {item_id:"repeat",event_key:"REPEAT:2026-09",planned_month:"2026-09-01",planned_date:"2026-09-10",status:"completed"},
 {item_id:"done",event_key:"DONE:2026-10",planned_month:"2026-10-01",planned_date:"2026-10-11",status:"completed",result_note:"Đạt",completed_by:"Văn",image_paths:["storage:maintenance/after.jpg"]},
 {item_id:"cancel",event_key:"CANCEL:2026-10",planned_month:"2026-10-01",planned_date:"2026-10-12",status:"cancelled"},
 {item_id:"deleted",event_key:"DELETED:2026-10",planned_month:"2026-10-01",planned_date:"2026-10-13",status:"planned"}
];
w.sbFetch=async url=>{
 calls.push(url);
 if(url.includes("admin-overview"))return {rows:[{building:{id:"130HH",name:"130 Hồng Hà"},snapshot:{tasks:[]},ops:{maintenance_assets:[{id:"legacy",name:"TÀI SẢN BẢO TRÌ CŨ",next_due_date:"2026-10-01"}]}}]};
 if(url.includes("/admin_personal_tasks"))return [];
 if(url.includes("/esta_maintenance_plan_items"))return plans;
 if(url.includes("/esta_maintenance_plan_occurrences"))return occurrences;
 if(url.includes("/maintenance_assets")||url.includes("/maintenance_records"))throw Error("130HH report must not read old maintenance tables");
 return [];
};
w.eval(maintenance);w.eval(report);
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const settle=async()=>{for(let i=0;i<8;i++)await tick();};
(async()=>{
 w.ESTAAdminSummary.open();await settle();
 d.querySelector('[data-as-project-all="0"]').click();await settle();
 const project=d.querySelector('[data-as-project="130HH"]');
 project.checked=true;project.dispatchEvent(new w.Event("change",{bubbles:true}));await settle();
 d.querySelector('[data-as-cat-all="0"]').click();await settle();
 const category=d.querySelector('[data-as-category="maintenance"]');
 category.checked=true;category.dispatchEvent(new w.Event("change",{bubbles:true}));await settle();
 const month=d.getElementById("asMonth");month.value="2026-10";month.dispatchEvent(new w.Event("change",{bubbles:true}));
 d.getElementById("asRefresh").click();await settle();
 const preview=d.getElementById("asRows").textContent;
 assert(preview.includes("Bảo trì bơm định kỳ"),"recurring plan must be projected into October");
 assert(preview.includes("Bảo trì thang đã hoàn thành"),"completed maintenance must appear");
 assert(preview.includes("Bảo trì máy bị hủy"),"cancelled maintenance must appear");
 assert(!preview.includes("Kế hoạch đã lưu trữ"),"soft-deleted plans excluded");
 assert(!preview.includes("TÀI SẢN BẢO TRÌ CŨ"),"old asset must not create duplicate report work");
 assert(!calls.some(url=>url.includes("/maintenance_records")||url.includes("/maintenance_assets")),"130HH must use new tables exclusively");
 assert(calls.some(url=>url.includes("esta_maintenance_plan_items")&&url.includes("building_id=eq.130HH")));
 assert(calls.some(url=>url.includes("esta_maintenance_plan_occurrences")&&url.includes("building_id=eq.130HH")));
 assert(!d.getElementById("asExport").disabled,"valid maintenance report may export");
 d.getElementById("asExport").click();
 d.querySelector('[data-as-format="standard"]').click();await settle();
 assert.equal(pdfResults.length,1);
 const body=pdfResults[0].rows.map(x=>x.join(" ")).join("\n");
 assert(body.includes("Bảo trì bơm định kỳ"));
 assert(body.includes("Bảo trì thang đã hoàn thành"));
 assert(body.includes("Bảo trì máy bị hủy"));
 const cancelled=pdfResults[0].rows.find(x=>x[2].includes("Bảo trì máy bị hủy"));
 assert.equal(cancelled[4],"Hủy","cancelled must not be relabeled completed");
 const completed=pdfResults[0].rows.find(x=>x[2].includes("Bảo trì thang đã hoàn thành"));
 assert.equal(completed[4],"Hoàn thành");
 assert.equal(pdfResults[0].photos.length,1,"real maintenance evidence must be exported");
 d.getElementById("asExport").click();
 d.querySelector('[data-as-format="executive"]').click();await settle();
 assert.equal(pdfResults[1].reportStyle,"executive","second PDF style preserved");
 dom.window.close();
 console.log("130HH Admin maintenance PDF: recurring schedule, cancellations, evidence and old-data dedupe PASS");
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
