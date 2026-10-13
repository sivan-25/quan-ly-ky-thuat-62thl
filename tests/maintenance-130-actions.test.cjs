const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM}=require("jsdom");
const js=fs.readFileSync(path.join(__dirname,"..","maintenance-130.js"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"..","maintenance-readability.css"),"utf8");
new Function(js);
const dom=new JSDOM('<!doctype html><html><body><div id="maintenancePage"><section class="maintenanceSchedule"></section></div></body></html>',{url:"https://esta.example/",runScripts:"outside-only"});
const w=dom.window,d=w.document,$=id=>d.getElementById(id);
let canEdit=true;const calls=[];
w.currentBuilding={id:"130HH"};
w.canProjectEdit=()=>canEdit;
w.centralSession={access_token:"test-token"};
w.toast=()=>{};
w.mediaImgHtml=ref=>'<img data-ref="'+String(ref).replace(/"/g,"&quot;")+'">';
w.hydrateMediaImages=async()=>{};
w.sbFetch=async(path,opts)=>{calls.push({path,opts});return [];};
const fixture={
 item:{id:"plan1",building_id:"130HH",plan_code:"130HH-TEST-1",work_title:"Kiểm tra cảm biến mực nước",
 system_group:"Cấp thoát nước",subsystem:"Bồn mái",source_notes:"MẪU (dữ liệu từ Excel)",priority:"normal",
 cadence:"12 tháng",assigned_to:"Văn",asset_code:""},
 event:{id:"occ1",item_id:"plan1",building_id:"130HH",event_key:"130HH-TEST-1:2026-10",
 planned_month:"2026-10-01",planned_date:"2026-10-02",status:"completed",
 completed_by:"Văn",result_code:"pass",result_note:"Bộ cảm biến hoạt động ổn định",
 image_paths:[{kind:"before",ref:"storage:130HH/old.jpg"}]}
};
const inject='window.__maintenance130UiTest={seed:(a,b)=>{items=[a];stored=[b];people=["Văn"];year=2026;month=10;ready=true;clearScheduleCache();renderPersonPickers();render();},refresh:()=>{clearScheduleCache();render();},items:()=>items,events:()=>stored};';
const patched=js.replace(/\}\)\(\);\s*$/,inject+"\n})();");
assert.notEqual(patched,js,"test fixture injection worked");
w.eval(patched);
d.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));
const ready=()=>new Promise(resolve=>setTimeout(resolve,0));
(async()=>{
 await ready();assert.ok($("maint130"),"native module mounted");
 w.__maintenance130UiTest.seed(fixture.item,fixture.event);
 d.querySelector('[data-m130-view="cards"]').click();
 const card=d.querySelector(".m130ServiceCard");
 assert.ok(card,"maintenance card rendered");
 const heading=card.querySelector(".m130CardHeading");
 assert.ok(heading,"system heading exists");
 assert.match(heading.textContent,/Cấp thoát nước/);
 assert.match(heading.textContent,/Bồn mái · Lịch kỳ này: 02\/10\/2026/);
 assert.equal(card.querySelectorAll(".m130CardLocation").length,1);
 assert.equal(card.querySelector("h3").textContent,fixture.item.work_title);
 assert.ok(!card.querySelector("p.m130CardLocation"),"date not below title");
 assert.equal(card.querySelector(".m130StatusLabel").textContent,"Tình trạng");
 assert.equal(card.querySelector(".m130CardStatus").textContent,"Hoàn thành");
 assert.ok(!card.textContent.includes("MẪU"),"no sample badge visible");
 assert.match(card.querySelector(".m130CardLower>.m130Evidence").textContent,/Trước 1/);
 card.querySelector("[data-m130-plan]").click();
 assert.equal($("m130Overlay").hidden,false);
 assert.equal($("m130PlanForm").hidden,false);
 assert.equal($("m130Title").value,fixture.item.work_title);
 assert.equal($("m130Location").value,"Bồn mái");
 $("m130Title").value="Kiểm tra cảm biến nước (đã chỉnh)";
 $("m130PlanForm").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
 await ready();
 assert.ok(calls.some(x=>x.path.includes("esta_maintenance_plan_items")&&x.opts.method==="PATCH"),"plan edit PATCH");
 assert.equal(w.__maintenance130UiTest.items()[0].work_title,"Kiểm tra cảm biến nước (đã chỉnh)");
 d.querySelector(".m130ServiceCard [data-m130-event]").click();
 assert.equal($("m130Overlay").hidden,false);
 assert.equal($("m130EventForm").hidden,false);
 assert.equal($("m130Result").value,"Bộ cảm biến hoạt động ổn định");
 assert.equal($("m130PhotoPreview").querySelectorAll("img").length,1);
 $("m130Result").value="Đã xác nhận lần hai";
 $("m130EventForm").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
 await ready();
 assert.ok(calls.some(x=>x.path.includes("esta_maintenance_plan_occurrences")&&x.opts.method==="PATCH"),"result edit PATCH");
 assert.equal(w.__maintenance130UiTest.events()[0].result_note,"Đã xác nhận lần hai");
 assert.equal(w.__maintenance130UiTest.events()[0].image_paths.length,1,"evidence retained");
 d.querySelector('[data-m130-view="rows"]').click();
 const row=d.querySelector(".m130CompactRow");
 assert.equal(row.querySelector(".m130StatusLabel").textContent,"Tình trạng");
 assert.ok(!row.textContent.includes("MẪU"));
 assert.equal(row.querySelector(".m130EntryBody .m130Evidence"),null);
 assert.equal(row.querySelectorAll(":scope > .m130Evidence").length,1);
 canEdit=false;w.__maintenance130UiTest.refresh();
 const readButton=d.querySelector(".m130CompactRow [data-m130-event]");
 assert.equal(readButton.disabled,false,"can view without editing permission");
 readButton.click();
 assert.equal($("m130EventForm").hidden,false);
 assert.equal($("m130Result").disabled,true);
 assert.equal($("m130EventForm").querySelector('[type="submit"]').hidden,true);
 assert.equal(d.querySelector(".m130CompactRow [data-m130-plan]").disabled,true);
 assert.equal($("m130Result").value,"Đã xác nhận lần hai");
 $("m130Close").click();
 assert.equal($("m130Overlay").hidden,true);
 assert.match(css,/\.m130CardHeading/);
 assert.match(css,/\.m130StatusLabel/);
 assert.match(css,/#154b6d/);
 assert.match(css,/data-kind="130"/);
 assert.match(css,/@media\(max-width:640px\)/);
 console.log("130HH header, label, edit, result, images and read-only view passed.");
 dom.window.close();
})().catch(err=>{console.error(err);dom.window.close();process.exitCode=1;});
