const fs = require("node:fs");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

async function main() {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="app"><div id="inventoryPage" class="page"><section class="inventorySwitchBar"></section></div></div>
  </body></html>`, { runScripts: "outside-only", url: "https://example.test/" });
  const w = dom.window;
  w.eval(`
    var currentBuilding = {id:"130HH",name:"130 Hồng Hà"};
    var inventoryMaterials = [
      {id:"mat-1",name:"Đèn LED 18W",code:"VT-001",unit:"Cái"},
      {id:"mat-2",name:"Dây điện",code:"VT-002",unit:"m"}
    ];
    var load = () => [
      {id:"a",d:"2026-10-20",c:"Thay đèn hành lang",s:"Hoàn thành",materials:[{materialId:"mat-1",name:"Đèn LED 18W",qty:3,unit:"Cái"}],imgs:["storage:130HH/tasks/a1.jpg","storage:130HH/tasks/a2.jpg"],result:"Đã thay"},
      {id:"b",d:"2026-10-21",c:"Kiểm tra đèn",s:"Đang thực hiện",materials:[{materialId:"mat-1",name:"Đèn LED 18W",qty:1,unit:"Cái"}],imgs:["storage:130HH/tasks/b1.jpg"]},
      {id:"c",d:"2026-10-21",c:"Sửa dây điện",s:"Hoàn thành",materials:[{materialId:"mat-2",name:"Dây điện",qty:5,unit:"m"}],imgs:[]}
    ];
    var projectPeople = [{name:"Nhân viên kỹ thuật"}];
    var lastPdfPayload = null;
    async function exportGenericEstaPdf(payload) { lastPdfPayload=payload; window.__lastPdfPayload=payload; return true; }
    function toast() {}
  `);
  w.eval(fs.readFileSync("material-linked-work-report.js", "utf8"));
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  await new Promise(resolve => w.setTimeout(resolve, 0));
  const launch = w.document.getElementById("estaMaterialWorkReportLaunch");
  assert.ok(launch, "material report entry point should be mounted");
  launch.click();
  const modal = w.document.getElementById("estaMaterialWorkReportModal");
  assert.equal(modal.hidden, false, "modal opens");
  const materialSelect = w.document.getElementById("emwrMaterial");
  const materialSearch = w.document.getElementById("emwrMaterialSearch");
  assert.ok(materialSearch, "material search input should be available");
  materialSearch.value = "LED";
  materialSearch.dispatchEvent(new w.Event("input", {bubbles:true}));
  assert.equal(materialSelect.querySelectorAll("input[data-material-id]").length, 1, "search filters material list");
  const led = materialSelect.querySelector('input[data-material-id="mat-1"]');
  led.checked = true;
  led.dispatchEvent(new w.Event("change", {bubbles:true}));
  assert.equal(w.document.querySelectorAll("[data-emwr-task]").length, 2, "only jobs linked to the selected material appear");
  w.document.querySelectorAll("[data-emwr-task]").forEach(input => { input.checked=true; input.dispatchEvent(new w.Event("change", {bubbles:true})); });
  // Current PDF flow asks for performer confirmation before exporting.
  w.document.getElementById("emwrExport").click();
  const manual=w.document.querySelector('input[name="emwrPerformerMode"][value="manual"]');
  manual.checked=true;
  manual.dispatchEvent(new w.Event("change",{bubbles:true}));
  w.document.getElementById("emwrManualPerformer").value="Nhân viên kỹ thuật";
  w.document.getElementById("emwrExport").click();
  await new Promise(resolve => w.setTimeout(resolve, 0));
  const payload = w.__lastPdfPayload;
  assert.ok(payload, "PDF export is called");
  assert.equal(payload.title, "BÁO CÁO CÔNG VIỆC THEO VẬT TƯ");
  assert.equal(payload.building, "130 Hồng Hà");
  assert.equal(payload.rows.length, 2, "only selected linked jobs are exported");
  assert.equal(payload.photos.length, 3, "all photos from selected jobs are attached");
  assert.ok(payload.photos.every(photo => photo.path.startsWith("storage:130HH/")), "photo refs remain scoped to the current project");
  assert.equal(payload.rows[0].quantity, "3");
  w.close();
  console.log("material-linked-work-report: OK");
}
main().catch(error => { console.error(error); process.exitCode=1; });
