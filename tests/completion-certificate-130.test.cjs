/* Synthetic browser regression for the 130 HH completion-certificate pilot. */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const {JSDOM} = require("jsdom");

async function main() {
  const dom = new JSDOM('<!doctype html><html><body><span id="headerRole"></span><div id="workPage"><div class="workTableMeta"></div></div></body></html>', {
    url: "http://localhost/", runScripts: "outside-only"
  });
  const w=dom.window, d=w.document;
  w.currentBuilding={id:"62THL",name:"62 Trần Huy Liệu"};
  w.load=()=>[
    {id:"a",d:"2026-09-10",c:"Thay đèn hành lang",s:"Đã hoàn thành",performers:["KT A"],
     result:"Đã thay đèn hành lang và kiểm tra vận hành",
     imgs:["storage:b-3133304848/tasks/a_1.jpg","storage:b-3133304848/tasks/a_2.jpg","storage:b-3133304848/tasks/a_3.jpg"],
     materials:[{materialId:"lamp",name:"Đèn LED 15W",qty:8,unit:"Cái"},{materialId:"cable",name:"Dây điện",qty:2.5,unit:"m"}]},
    {id:"b",d:"2026-09-11",c:"Đèn toilet",s:"Hoàn thành",performers:["KT B"]},
    {id:"c",d:"2026-09-12",c:"Kiểm tra máy",s:"Đang thực hiện",performers:["KT A"]},
    {id:"d",d:"2026-08-12",c:"Công việc tháng trước",s:"Đã hoàn thành",performers:["KT C"]}
  ];
  w.centralSession={access_token:"synthetic"};
  w.ensureCentralSessionFresh=async()=>true;
  w.confirm=()=>true;
  w.sbFetch=async()=>[];
  let sent=null, downloads=0;
  w.centralAuthFetch=async(path, request)=>{ assert.equal(path,"/api/esta_report");sent=JSON.parse(request.body);return {headers:{get:()=>null}}; };
  w.readVerifiedEstaPdf=async()=>new w.Blob(["%PDF-1.4"],{type:"application/pdf"});
  w.URL.createObjectURL=()=> "blob:synthetic";
  w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){downloads++;};
  const originalTimeout=w.setTimeout.bind(w);
  w.setTimeout=(fn,delay,...args)=>delay>=60000 ? 0 : originalTimeout(fn,delay,...args);
  w.eval(fs.readFileSync("completion-certificate-130.js","utf8"));
  d.dispatchEvent(new w.Event("DOMContentLoaded"));
  const btn=d.getElementById("cc130Launch");
  assert.ok(btn,"certificate action should be attached on work page");
  assert.equal(btn.hidden,true,"other projects must not show the action");
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
  w.currentBuilding={id:"127HH",name:"127 Hồng Hà"};
  d.getElementById("headerRole").textContent="KT · 127HH";
  await new Promise(r=>setTimeout(r,0));
  assert.equal(btn.hidden,true,"other projects stay unchanged");
  assert.equal(d.getElementById("cc130Modal").classList.contains("is-open"),false);
  console.log("PASS 130 HH completion certificate: compact editor, material autofill, task removal, editable fields, 2 row actions, PDF and project isolation");
  dom.window.close();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
