const fs=require("fs");
const path=require("path");
const assert=require("assert");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");

(function loadOrder(){
  const h=read("index.html");
  const order=[
    "project-config.js","project-store.js","validation-core.js","sync-queue.js",
    "media-manager.js","app.js","report-archive.js","report-center.js",
    "esta-ui-core.js","new10-pilot.js"
  ];
  let last=-1;
  for(const item of order){
    const i=h.indexOf(item);
    assert.ok(i>=0,item+" must load");
    assert.ok(i>last,item+" load order is invalid");
    last=i;
  }
})();

(function validationCoverage(){
  const s=read("validation-core.js");
  for(const k of ["task","energy","material","stock","tool","maintenanceAsset","maintenanceRecord","contractor","contractorJob","incident","checklist","document","constructionMaterial","constructionStock","constructionLog"]){
    assert.ok(s.includes(k+"("),"validator missing: "+k);
  }
})();

(function offlineCore(){
  const q=read("sync-queue.js");
  const m=read("media-manager.js");
  assert.ok(q.includes("esta:new10:sync-queue:v2"));
  assert.ok(q.includes("window.addEventListener(\"online\""));
  assert.ok(m.includes("indexedDB.open"));
  assert.ok(m.includes('target:"task"'));
  assert.ok(m.includes('target:"energy"'));
})();

(function uiCore(){
  const js=read("esta-ui-core.js"),css=read("esta-ui-core.css");
  assert.ok(js.includes("estaDataTableCore"));
  assert.ok(js.includes("estaFormCore"));
  assert.ok(css.includes("--esta-surface"));
  assert.ok(css.includes("[data-esta-invalid"));
})();

(function reportArchive(){
  const a=read("report-archive.js"),r=read("report-center.js");
  assert.ok(a.includes('const BUCKET="report-files"'));
  assert.ok(a.includes('SHA-256'));
  assert.ok(r.includes("archivePdf"));
  assert.ok(r.includes("rcStoredReport"));
  assert.ok(r.includes("estaProjectConfig"));
})();

(function migrationsTracked(){
  assert.ok(fs.existsSync(path.join(root,"supabase/migrations/20261006162000_report_pdf_versioned_storage.sql")));
  assert.ok(fs.existsSync(path.join(root,"supabase/migrations/20261006161102_restrict_inventory_archive_trigger_execute.sql")));
})();

console.log("NEW10 generation core regression: OK");
