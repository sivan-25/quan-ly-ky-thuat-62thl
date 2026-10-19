"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM}=require("jsdom");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const css=fs.readFileSync(path.join(root,"maintenance-asset-mobile-form.css"),"utf8");
const doc=new JSDOM(html,{runScripts:"outside-only"}).window.document;
const dialog=doc.getElementById("maintenanceAssetModal");
const form=doc.getElementById("maintenanceAssetForm");
const fields=dialog.querySelector(".maintenanceAssetFields");
const actions=dialog.querySelector(".inventoryFormActions");
assert.ok(dialog&&form&&fields&&actions,"asset modal, form, fields and actions exist");
assert.equal(fields.parentElement,form,"scrolling input region is inside native form");
assert.equal(actions.parentElement,form,"actions remain in form so native validation and submit still work");
assert.equal(fields.contains(actions),false,"buttons do not move when scrolling fields");
assert.equal(fields.querySelectorAll(":scope > label").length,11,"original 11 fields preserved");
for(const id of ["maintenanceName","maintenanceSystem","maintenanceLocation",
  "maintenanceManufacturer","maintenanceModel","maintenanceFrequency",
  "maintenanceLastDate","maintenanceNextDate","maintenanceAssigned",
  "maintenanceStatus","maintenanceNote"]){
  assert.ok(fields.querySelector("#"+id),"required asset field not lost: "+id);
}
assert.equal(doc.getElementById("maintenanceNextDate").readOnly,true,"automatically calculated date remains readonly");
assert.equal(doc.getElementById("maintenanceLastDate").type,"date","native date picker preserved");
assert.equal(doc.getElementById("maintenanceNextDate").type,"date","auto date remains date field");
const save=actions.querySelector('button[type="submit"]');
assert.ok(save&&save.form===form,"visible footer submits the original asset form");
assert.ok(actions.querySelector("#cancelMaintenanceAssetModal"),"cancel button present");
assert.ok(html.includes("maintenance-asset-mobile-form.css?v="),"versioned stylesheet included");
assert.ok(css.includes("@media(max-width:760px)"),"phone only");
assert.ok(css.includes("#maintenanceAssetModal:not(.hide)"),"modal above mobile dock");
assert.ok(css.includes("z-index:50000!important"),"asset popup supersedes mobile dock");
assert.ok(css.includes(".maintenanceAssetFields{"),"scrollable asset field wrapper");
assert.ok(css.includes("overflow-y:auto!important"),"fields scroll independently");
assert.ok(css.includes("flex:0 0 auto!important"),"footer remains outside scroll");
assert.ok(css.includes("min-height:48px!important"),"footer action buttons are touch friendly");
assert.ok(css.includes("::-webkit-date-and-time-value"),"iPhone date text width guarded");
assert.ok(css.includes("@media(max-width:359px)"),"very narrow phone fallback");
assert.equal(doc.querySelector("#maintenanceRecordForm .maintenanceAssetFields"),null,"journal modal unchanged");
console.log("PASS maintenance asset mobile modal structure, dates and fixed save controls");
