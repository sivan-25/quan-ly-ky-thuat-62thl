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
    {id:"a",d:"2026-09-10",c:"Thay đèn hành lang",s:"Đã hoàn thành",performers:["KT A"]},
    {id:"b",d:"2026-09-11",c:"Đèn toilet",s:"Hoàn thành",performers:["KT B"]},
    {id:"c",d:"2026-09-12",c:"Kiểm tra máy",s:"Đang thực hiện",performers:["KT A"]},
    {id:"d",d:"2026-08-12",c:"Công việc tháng trước",s:"Đã hoàn thành",performers:["KT C"]}
  ];
  w.centralSession={access_token:"synthetic"};
  w.ensureCentralSessionFresh=async()=>true;
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
  const month=d.getElementById("cc130Month");
  month.value="2026-09";
  month.dispatchEvent(new w.Event("change",{bubbles:true}));
  assert.equal(d.querySelectorAll("#cc130Tasks input[data-cc130-id]").length,2,"only September completed tasks");
  assert.equal(d.getElementById("cc130Next").disabled,true);
  const first=d.querySelector('#cc130Tasks [data-cc130-id="a"]');
  first.checked=true;
  first.dispatchEvent(new w.Event("change",{bubbles:true}));
  d.getElementById("cc130Next").click();
  assert.equal(d.getElementById("cc130Rows").children.length,1,"manual selection must be respected");
  assert.equal(d.querySelector('[data-field="material"]').value,"","unknown materials must remain blank");
  d.querySelector('[data-field="material"]').value="Đèn LED 15W";
  d.querySelector('[data-field="unit"]').value="Cái";
  d.querySelector('[data-field="qty"]').value="8";
  d.getElementById("cc130Export").click();
  await new Promise(r=>setTimeout(r,40));
  assert.equal(sent.report_type,"completion");
  assert.equal(sent.building_id,"130HH");
  assert.equal(sent.rows.length,1);
  assert.equal(sent.rows[0].material,"Đèn LED 15W");
  assert.equal(sent.rows[0].qty,"8");
  assert.equal(downloads,1,"verified PDF must download");
  sent=null;
  d.getElementById("cc130Back").click();
  const automatic=d.querySelector('input[name="cc130Mode"][value="month"]');
  automatic.checked=true;
  automatic.dispatchEvent(new w.Event("change",{bubbles:true}));
  assert.equal(d.getElementById("cc130Next").disabled,false);
  d.getElementById("cc130Next").click();
  assert.equal(d.getElementById("cc130Rows").children.length,2,"monthly mode must include all finished September tasks");
  w.currentBuilding={id:"127HH",name:"127 Hồng Hà"};
  d.getElementById("headerRole").textContent="KT · 127HH";
  await new Promise(r=>setTimeout(r,0));
  assert.equal(btn.hidden,true,"other projects stay unchanged");
  assert.equal(d.getElementById("cc130Modal").classList.contains("is-open"),false);
  console.log("PASS 130 HH completion certificate: project isolation, manual/monthly modes, prefill, edit, PDF request");
  dom.window.close();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
