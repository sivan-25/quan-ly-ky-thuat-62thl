/* Synthetic browser regression for ESTA certificates across four independent buildings. */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const {JSDOM} = require("jsdom");

async function main() {
  const dom = new JSDOM('<!doctype html><html><body><span id="headerRole"></span><div id="workPage"><div class="workTableMeta"></div></div></body></html>', {
    url: "http://localhost/", runScripts: "outside-only"
  });
  const w=dom.window, d=w.document;
  w.currentBuilding={id:"DEMO",name:"Demo"};
  w.load=()=>w.currentBuilding?.id==="130HH" ? [
    {id:"a",d:"2026-09-10",c:"Thay đèn hành lang",s:"Đã hoàn thành",performers:["KT A"],
     result:"Đã thay đèn hành lang và kiểm tra vận hành",
     imgs:["storage:b-3133304848/tasks/a_1.jpg","storage:b-3133304848/tasks/a_2.jpg","storage:b-3133304848/tasks/a_3.jpg"],
     materials:[{materialId:"lamp",name:"Đèn LED 15W",qty:8,unit:"Cái"},{materialId:"cable",name:"Dây điện",qty:2.5,unit:"m"}]},
    {id:"b",d:"2026-09-11",c:"Đèn toilet",s:"Hoàn thành",performers:["KT B"]},
    {id:"c",d:"2026-09-12",c:"Kiểm tra máy",s:"Đang thực hiện",performers:["KT A"]},
    {id:"d",d:"2026-08-12",c:"Công việc tháng trước",s:"Đã hoàn thành",performers:["KT C"]}
  ] : [{
    id:"own-"+w.currentBuilding.id, d:"2026-09-09",
    c:"Công việc riêng "+w.currentBuilding.id, s:"Đã hoàn thành",
    performers:["KT "+w.currentBuilding.id], materials:[], imgs:[]
  }];
  w.centralSession={access_token:"synthetic"};
  w.ensureCentralSessionFresh=async()=>true;
  w.confirm=()=>true;
  w.sbFetch=async()=>[];
  let sent=null, downloads=0, filenames=[];
  w.centralAuthFetch=async(path, request)=>{ assert.equal(path,"/api/esta_report");sent=JSON.parse(request.body);return {headers:{get:()=>null}}; };
  w.readVerifiedEstaPdf=async()=>new w.Blob(["%PDF-1.4"],{type:"application/pdf"});
  w.URL.createObjectURL=()=> "blob:synthetic";
  w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){downloads++;filenames.push(this.download);};
  const originalTimeout=w.setTimeout.bind(w);
  w.setTimeout=(fn,delay,...args)=>delay>=60000 ? 0 : originalTimeout(fn,delay,...args);
  w.eval(fs.readFileSync("completion-certificate-130.js","utf8"));
  d.dispatchEvent(new w.Event("DOMContentLoaded"));
  const btn=d.getElementById("cc130Launch");
  assert.ok(btn,"certificate action should be attached on work page");
  assert.equal(btn.hidden,true,"unsupported projects must not show the action");
  w.currentBuilding={id:"130HH",name:"130 Hồng Hà"};
  d.getElementById("headerRole").textContent="KT · 130HH";
  await new Promise(r=>setTimeout(r,0));
  assert.equal(btn.hidden,false);
  btn.click();
  assert.equal(d.querySelector('input[name="cc130Mode"]:checked').value,"month","monthly Auto must be the default");
  assert.equal(d.querySelector(".cc130-preview-logo"),null,"no ESTA logo in preview");
  assert.equal(d.querySelector(".cc130-style-chooser"),null,"legacy style selector is hidden entirely");
  assert.equal(d.querySelector(".cc130-paperhead"),null,"redundant PDF header is removed");
  assert.equal(d.querySelectorAll(".cc130-main-fields > label").length,4,"three administrative fields plus description");
  assert.ok(d.querySelector(".cc130-main-fields #cc130Company"));
  assert.ok(d.querySelector(".cc130-main-fields #cc130Department"));
  assert.ok(d.querySelector(".cc130-main-fields #cc130IssuedDate"));
  const month=d.getElementById("cc130Month");
  month.value="2026-09";
  month.dispatchEvent(new w.Event("change",{bubbles:true}));
  assert.equal(d.querySelectorAll("#cc130Tasks input[data-cc130-id]").length,2,"only September completed tasks");
  assert.equal(d.getElementById("cc130Next").disabled,false,"Auto selects all completed monthly tasks");
  assert.equal(d.querySelectorAll("#cc130Tasks input:checked").length,2);
  const autoRow=d.querySelector('#cc130Tasks .cc130-task:has([data-cc130-id="a"])');
  const autoCheck=autoRow.querySelector('input[type="checkbox"]');
  assert.equal(autoCheck.disabled,false,"Auto task must be clickable rather than grayed out");
  assert.ok(autoRow.classList.contains("is-selected"),"Auto selected task has visible highlight");
  assert.match(autoRow.querySelector(".cc130-task-status").textContent,/Đã chọn/);
  autoRow.click();
  assert.equal(autoCheck.checked,false,"clicking task row deselects in Auto mode");
  assert.match(d.getElementById("cc130SelectionCount").textContent,/Đã chọn 1 \/ 2/);
  assert.equal(autoRow.classList.contains("is-selected"),false);
  assert.match(autoRow.querySelector(".cc130-task-status").textContent,/Chưa chọn/);
  autoRow.click();
  assert.equal(autoCheck.checked,true,"clicking the same row again reselects");
  assert.match(d.getElementById("cc130SelectionCount").textContent,/Đã chọn 2 \/ 2/);
  const manual=d.querySelector('input[name="cc130Mode"][value="manual"]');
  manual.checked=true;
  manual.dispatchEvent(new w.Event("change",{bubbles:true}));
  assert.equal(d.getElementById("cc130Next").disabled,true,"manual remains an opt-in alternative");
  const first=d.querySelector('#cc130Tasks [data-cc130-id="a"]');
  first.checked=true;
  first.dispatchEvent(new w.Event("change",{bubbles:true}));
  d.getElementById("cc130Next").click();
  await new Promise(r=>setTimeout(r,35));
  assert.equal(d.getElementById("cc130Rows").children.length,2,"manual selection auto-expands two linked materials");
  assert.equal(d.querySelector('[data-field="material"]').value,"Đèn LED 15W","linked materials are populated by default");
  assert.equal(d.getElementById("cc130Edit").hidden,false,"editor opens after Auto has filled linked materials");
  let firstRow=d.querySelector("#cc130Rows .cc130-row");
  assert.ok(firstRow.querySelector("[data-cc130-result]"));
  assert.ok(firstRow.querySelector("[data-cc130-auto]"));
  firstRow.querySelector("[data-cc130-result]").click();
  assert.equal(firstRow.querySelector('[data-field="content"]').value,"Đã thay đèn hành lang và kiểm tra vận hành");
  assert.equal(d.getElementById("cc130Rows").children.length,2,"one row for each linked material");
  assert.equal(firstRow.querySelector('[data-field="material"]').value,"Đèn LED 15W");
  assert.equal(firstRow.querySelector('[data-field="unit"]').value,"Cái");
  assert.equal(firstRow.querySelector('[data-field="qty"]').value,"8");
  const linkedExtra=d.querySelector('#cc130Rows [data-cc130-auto-generated="1"]');
  assert.equal(linkedExtra.querySelector('[data-field="material"]').value,"Dây điện");
  assert.equal(linkedExtra.querySelector('[data-field="qty"]').value,"2.5");
  // Re-running auto must replace its own generated rows, not append duplicate materials.
  firstRow.querySelector("[data-cc130-auto]").click();
  await new Promise(r=>setTimeout(r,20));
  assert.equal(d.getElementById("cc130Rows").children.length,2,"Auto is idempotent");
  assert.equal(d.querySelector(".cc130-signature-note"),null,"signature helper text removed");
  assert.equal(d.querySelector('input[name="cc130Style"]'),null,"only ESTA template is shown");
  assert.equal(d.getElementById("cc130Staff"),null,"technician name must not be typed on screen");
  const include=d.getElementById("cc130IncludePhotos");
  assert.equal(include.checked,true,"photos included by default");
  assert.equal(include.disabled,false,"photos available");
  assert.match(d.getElementById("cc130PhotoSummary").textContent,/3 ảnh/);
  d.getElementById("cc130Export").click();
  await new Promise(r=>setTimeout(r,40));
  assert.equal(sent.certificate_style,"esta","single ESTA style sent to authenticated renderer");
  assert.equal(sent.staff,"","technician name is left blank for handwriting");
  assert.equal(sent.photos.length,3,"selected work images attached to the PDF payload");
  assert.ok(sent.photos.every(p=>p.path.startsWith("storage:")));
  assert.equal(sent.report_type,"completion");
  assert.equal(sent.building_id,"130HH");
  assert.equal(sent.rows.length,2);
  assert.equal(sent.rows[0].material,"Đèn LED 15W");
  assert.equal(sent.rows[0].qty,"8");
  assert.equal(sent.rows[0].content,"Đã thay đèn hành lang và kiểm tra vận hành");
  assert.equal(sent.rows[1].material,"Dây điện");
  assert.equal(sent.rows[1].unit,"m");
  assert.equal(sent.rows[1].qty,"2.5");
  assert.equal(downloads,1,"verified PDF must download");
  include.checked=false;
  d.getElementById("cc130Export").click();
  await new Promise(r=>setTimeout(r,40));
  assert.equal(sent.certificate_style,"esta","optional photos do not change the PDF layout");
  assert.equal(sent.photos.length,0,"unchecked photo control must omit images");
  assert.equal(downloads,2);
  sent=null;
  d.getElementById("cc130Back").click();
  const automatic=d.querySelector('input[name="cc130Mode"][value="month"]');
  automatic.checked=true;
  automatic.dispatchEvent(new w.Event("change",{bubbles:true}));
  assert.equal(d.getElementById("cc130Next").disabled,false);
  d.getElementById("cc130Next").click();
  await new Promise(r=>setTimeout(r,35));
  assert.equal(d.getElementById("cc130Rows").children.length,3,"monthly Auto loads all completed jobs and expands linked materials");
  assert.equal(d.getElementById("cc130IncludePhotos").checked,true,"new draft restores default image option");
  const blank=d.querySelector('#cc130Rows .cc130-row[data-source-task-id="b"]');
  blank.querySelector("[data-cc130-auto]").click();
  await new Promise(r=>setTimeout(r,20));
  assert.equal(blank.querySelector('[data-field="material"]').value,"","no linked material never invents quantity");
  assert.match(blank.querySelector("[data-cc130-hint]").textContent,/chưa có vật tư liên kết/i);
  blank.querySelector("[data-cc130-result]").click();
  assert.equal(blank.querySelector('[data-field="content"]').value,"Đèn toilet","missing result preserves content");
  const removed=d.querySelector('#cc130Rows .cc130-row[data-source-task-id="a"]');
  removed.querySelector("[data-cc130-remove]").click();
  assert.equal(d.getElementById("cc130Rows").children.length,1,"removing a source work removes auto-generated material children");
  d.getElementById("cc130Export").click();
  await new Promise(r=>setTimeout(r,40));
  assert.equal(sent.rows.length,1,"removed work must not be printed");
  assert.equal(sent.photos.length,0,"removed work photos must not be printed");
  const extraProjects=[
    ["127HH","127 Hồng Hà"],["62THL","62 Trần Huy Liệu"],
    ["68PĐL","68 Phan Đăng Lưu"]
  ];
  for(const [id,name] of extraProjects){
    w.currentBuilding={id,name};
    d.getElementById("headerRole").textContent="KT · "+id;
    await new Promise(r=>setTimeout(r,0));
    assert.equal(btn.hidden,false,id+" should have the certificate action");
    assert.equal(d.getElementById("cc130Modal").classList.contains("is-open"),false,
      "switching buildings closes a previous draft");
    btn.click();
    assert.match(d.getElementById("cc130ProjectLabel").textContent,
      new RegExp(name.toLocaleUpperCase("vi-VN")),"header uses actual building");
    const month=d.getElementById("cc130Month");
    month.value="2026-09";
    month.dispatchEvent(new w.Event("change",{bubbles:true}));
    const rows=d.querySelectorAll("#cc130Tasks .cc130-task");
    assert.equal(rows.length,1,"only the active building's work is displayed");
    assert.match(rows[0].textContent,new RegExp(id));
    assert.doesNotMatch(rows[0].textContent,/Thay đèn hành lang/);
    const checkbox=rows[0].querySelector("input[type=checkbox]");
    assert.equal(checkbox.checked,true,"auto-selected by default");
    assert.equal(checkbox.disabled,false,"checkbox never disabled");
    rows[0].click();
    assert.equal(checkbox.checked,false,"can deselect in auto mode");
    assert.equal(d.getElementById("cc130Next").disabled,true);
    rows[0].click();
    assert.equal(checkbox.checked,true,"can reselect in auto mode");
    d.getElementById("cc130Next").click();
    await new Promise(r=>setTimeout(r,35));
    assert.equal(d.getElementById("cc130Edit").hidden,false);
    assert.equal(d.querySelectorAll("#cc130Rows .cc130-row").length,1);
    assert.match(d.querySelector('#cc130Rows [data-field="content"]').value,new RegExp(id));
    d.getElementById("cc130Export").click();
    await new Promise(r=>setTimeout(r,40));
    assert.equal(sent.building_id,id,"PDF payload is scoped to active project");
    assert.equal(sent.building,name,"PDF payload has correct building label");
    assert.equal(sent.rows.length,1);
    assert.match(sent.rows[0].content,new RegExp(id));
    assert.equal(sent.photos.length,0,"other projects cannot reuse 130 HH photos");
    assert.ok(filenames.at(-1).includes(id.replace("Đ","D")),"download name identifies the project");
    d.getElementById("cc130Close").click();
  }
  w.currentBuilding={id:"DEMO",name:"Demo"};
  d.getElementById("headerRole").textContent="KT · DEMO";
  await new Promise(r=>setTimeout(r,0));
  assert.equal(btn.hidden,true,"unsupported projects remain unchanged");
  console.log("PASS four project certificates: Auto/manual checkbox, own work/materials/photos, correct PDF scope and names");
  dom.window.close();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
