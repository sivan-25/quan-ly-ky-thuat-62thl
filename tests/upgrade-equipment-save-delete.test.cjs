"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const crypto=require("node:crypto");
const {JSDOM}=require("jsdom");
const js=fs.readFileSync(path.join(__dirname,"..","upgrade-equipment.js"),"utf8");
const dom=new JSDOM("<div id='updateAssetsPage'></div>",{url:"https://example.test"});
const document=dom.window.document,window=dom.window,page=document.getElementById("updateAssetsPage");
const database=new Map(),calls=[],alerts=[];
const BID="130HH";
const state={currentBuilding:{id:BID,role:"editor"},projectOverviewActive:true};
const auth={access_token:"fixture",refresh_token:"fixture"};
const supported=["Đang sử dụng","Dự phòng","Cần theo dõi","Đang sửa chữa","Ngừng sử dụng"];
const sbFetch=async (p,{method="GET",body}={})=>{
 calls.push({p,method,body});
 if(p.includes("maintenance_assets"))return [];
 if(!p.includes("building_equipment_profiles_nangcap"))throw new Error("Invalid fixture endpoint "+p);
 const id=p.match(/id=eq\.([a-f\d-]{36})/i)?.[1];
 if(method==="GET"){
  let rows=[...database.values()];
  if(id)rows=rows.filter(row=>row.id===id);
  return structuredClone(rows);
 }
 if(method==="POST"){
  if(!supported.includes(body.status)){const err=new Error("new row violates check constraint");err.code="23514";throw err}
  if(!body.id||body.building_id!==BID)throw new Error("Missing id/scope");
  database.set(body.id,structuredClone(body));return null;
 }
 if(method==="PATCH"){
  if(!id||!database.has(id))return null;
  database.set(id,{...database.get(id),...structuredClone(body)});return null;
 }
 if(method==="DELETE"){
  if(!id)throw new Error("Missing row id");database.delete(id);return null;
 }
 throw new Error("Unexpected method "+method);
};
const context={window,document,centralSession:auth,currentAccount:{is_admin:true},
 crypto,confirm:()=>true,alert:m=>alerts.push(m),toast:m=>alerts.push(m),sbFetch,
 get currentBuilding(){return state.currentBuilding},
 get projectOverviewActive(){return state.projectOverviewActive}
};
new vm.Script(js).runInNewContext(context);
const $=sel=>document.querySelector(sel);
const rows=()=>[...document.querySelectorAll("#ueRows [data-ue-id]")];
async function dialogSubmit(){
 const form=$("#ueForm");return form.onsubmit({preventDefault(){},currentTarget:form});
}
async function clickDelete(){return $("#ueDelete").onclick()}
async function main(){
 window.estaUpgradeAssets.render(page,true);
 assert.equal(rows().length,44,"44 built-in entries listed with no saved rows");
 assert(!page.textContent.includes("Mẫu tham khảo"),"do not show sample reference text");
 assert(!page.textContent.includes("mẫu tham khảo"),"do not show sample reference text lower-case");
 assert(page.textContent.includes("Chưa nhập"));

 // A predefined item used to submit status="", causing an actual 23514 error.
 const first=rows()[0];
 first.onclick();
 assert.equal(first.getAttribute("aria-expanded"),"true");
 first.closest(".ueRefEntry").querySelector("[data-ue-edit]").click();
 assert.equal($("#ueForm").elements.namedItem("status").value,"Đang sử dụng","preloaded item must have valid status");
 assert.equal($("#ueDelete").hidden,false,"delete must be available even before the first save");
 await dialogSubmit();
 assert.equal(database.size,1,"saved predefined entry must exist in backend fixture");
 assert.equal($("#ueFormError").hidden,true,"no failure after successful save");
 assert.equal($("#ueSaveFlag").textContent.trim(),"✓ Đã lưu","modal reflects server-confirmed saved record");
 assert.equal($("#ueFormError").closest("footer").tagName,"FOOTER","error is visible above modal action buttons");
 assert(page.textContent.includes("1 hạng mục")||page.textContent.includes("44 hạng mục"),"saved device continues to appear in list");
 assert.equal(rows().length,44,"one saved row replaces one predefined entry");

 // Update same equipment, ensure it persists with no duplicate.
 $("#ueForm").elements.namedItem("brand").value="Daikin";
 await dialogSubmit();
 assert.equal(database.size,1);
 assert.equal([...database.values()][0].brand,"Daikin");


 // End-to-end inspection: saving a result verifies the profile and schedules its next check.
 const checkForm=$("#ueForm");
 checkForm.elements.namedItem("checkDate").value="2026-10-15";
 checkForm.elements.namedItem("checkBy").value="Văn";
 checkForm.elements.namedItem("checkCondition").value="tot";
 await $("#ueCheckSave").onclick();
 const stored=[...database.values()][0];
 assert.equal(stored.specs._estaUpgrade.verified,true,"a completed check verifies the device");
 assert.equal(stored.specs._estaUpgrade.lastCheck,"2026-10-15","latest check stored");
 assert.equal(stored.specs._estaUpgrade.history.length,1,"first check retained");
 assert.equal($("#ueFormError").hidden,true,"successful check shows no error");
 // Backdated checks must persist even when the latest check date is newer.
 checkForm.elements.namedItem("checkDate").value="2026-10-10";
 checkForm.elements.namedItem("checkBy").value="Văn";
 checkForm.elements.namedItem("checkCondition").value="theodoi";
 await $("#ueCheckSave").onclick();
 const checked=[...database.values()][0].specs._estaUpgrade;
 assert.equal(checked.history.length,2,"backdated check not discarded");
 assert.equal(checked.lastCheck,"2026-10-15","older check does not overwrite latest date");
 assert.equal(checked.condition,"tot","latest status preserved");
 assert.equal($("#ueFormError").hidden,true,"backdated saving is confirmed");

 // Delete a saved built-in item, confirm it stays absent across reloads.
 await clickDelete();
 assert.equal(rows().length,43,"deleted predefined item must not reappear");
 assert.equal([...database.values()][0].specs._estaUpgrade.archived,true);
 await window.estaUpgradeAssets.refresh();
 assert.equal(rows().length,43,"deletion must persist after refresh");

 // Delete an as-yet-unmodified built-in device using a tombstone.
 const unsaved=rows()[0].dataset.ueId;
 rows()[0].onclick();
 rows()[0].closest(".ueRefEntry").querySelector("[data-ue-edit]").click();
 assert.equal($("#ueDelete").hidden,false);
 await clickDelete();
 assert.equal(rows().length,42,"unmodified predefined item must be deletable");
 assert(!rows().some(x=>x.dataset.ueId===unsaved));
 await window.estaUpgradeAssets.refresh();
 assert.equal(rows().length,42,"predefined row must remain hidden on reload");

 // Add and delete user-created device; it must be a real DELETE, not archival.
 $("#ueAdd").onclick();
 const form=$("#ueForm");
 form.elements.namedItem("name").value="Kiểm tra máy nén";
 form.elements.namedItem("equipment_type").value="Khác";
 await dialogSubmit();
 assert.equal(database.size,3,"custom entry must be stored");
 const custom=[...database.values()].find(x=>x.name==="Kiểm tra máy nén");
 assert(custom?.id);
 assert.equal(rows().length,43);
 await clickDelete();
 assert.equal(database.has(custom.id),false,"custom user entry must be deleted from database");
 assert.equal(rows().length,42);
 assert(calls.some(c=>c.method==="DELETE"),"must perform DELETE for custom devices");

 // Simulate a server error; failure must be visible and not display a success toast.
 $("#ueAdd").onclick();
 const previous=database.size;
 form.elements.namedItem("name").value="Thiết bị không lưu được";
 const oldCalls=calls.length;
 context.sbFetch=async (...args)=>{if(args[1]?.method==="POST")throw new Error("Lỗi lưu từ máy chủ");return sbFetch(...args)};
 await dialogSubmit();
 assert.equal(database.size,previous,"backend error must not create false records");
 assert.equal($("#ueFormError").hidden,false,"show clear error in device form");
 assert($("#ueFormError").textContent.includes("Lỗi lưu từ máy chủ"));
 assert(calls.length>=oldCalls);
 console.log("130HH save/edit/delete fixture PASS: 23514 fixed; 44 original entries; persistent seed deletion; custom DELETE; server error visible.");
}
main().catch(e=>{console.error(e);process.exitCode=1});
