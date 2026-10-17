"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {JSDOM}=require("jsdom");
const root=path.join(__dirname,"..");
const js=fs.readFileSync(path.join(root,"upgrade-equipment.js"),"utf8");
const routes=fs.readFileSync(path.join(root,"update-lab.js"),"utf8");
const css=fs.readFileSync(path.join(root,"upgrade-equipment-reference.css"),"utf8");
const parityCss=fs.readFileSync(path.join(root,"nangcap-unified.css"),"utf8");
const pageHtml=fs.readFileSync(path.join(root,"index.html"),"utf8");
const dbSql=fs.readFileSync(path.join(root,"migrations/technical_systems_four_projects.sql"),"utf8");
const ids=["NANGCAP","68PĐL","62THL","127HH","130HH"];
const dom=new JSDOM("<div id='updateAssetsPage'></div>",{url:"https://example.test"});
const state={id:"NANGCAP"};
const rows=ids.map((building_id,i)=>({
 id:"00000000-0000-4000-8000-"+String(i+1).padStart(12,"0"),building_id,
 name:"Thiết bị riêng "+building_id,equipment_type:"Khác",
 system_group:"PCCC",location:"Vị trí "+building_id,status:"Đang sử dụng",
 quantity:1,specs:{_estaUpgrade:{verified:true,condition:"tot",history:[]}}
}));
const pmFixture={id:"aaaaaaaa-bbbb-4ccc-8ddd-000000000099",work_title:"Bảo trì bơm PCCC 130 Hồng Hà",equipment_profile_id:rows[4].id,building_id:"130HH",cadence:"3 tháng",assigned_to:"Kỹ thuật 130",deleted_at:null};
const calls=[];
const scope={
 window:dom.window,document:dom.window.document,
 get currentBuilding(){return {id:state.id,name:state.id,role:"editor"}},
 projectOverviewActive:true,centralSession:{access_token:"fixture"},
 currentAccount:{is_admin:true},
 sbFetch:async url=>{
  const building=decodeURIComponent(url.match(/building_id=eq\.([^&]+)/)?.[1]||"");
  calls.push({url,building});
  if(url.includes("/maintenance_assets"))return [];
  if(url.includes("esta_maintenance_plan_items"))return building==="130HH"?[pmFixture]:[];
  if(!url.includes("building_equipment_profiles_nangcap"))throw Error("Unexpected endpoint: "+url);
  return rows.filter(r=>r.building_id===building);
 }
};
new vm.Script(js).runInNewContext(scope);
const page=dom.window.document.getElementById("updateAssetsPage");
(async()=>{
 for(const id of ids){
  state.id=id;
  dom.window.estaUpgradeAssets.render(page,true);
  await dom.window.estaUpgradeAssets.refresh();
  assert(page.classList.contains("ueSnapshot"),id+" must use the upgrade layout");
  assert(page.textContent.includes("Thiết bị riêng "+id),id+" own record missing");
  for(const other of ids.filter(x=>x!==id))assert(!page.textContent.includes("Thiết bị riêng "+other),id+" leaked "+other);
  assert.equal(page.querySelectorAll(".ueRefRow").length,45,id+" must include 44 built-ins + one project row");
  if(id==="130HH"){
   page.querySelector('[data-ue-id="'+rows[4].id+'"]').click();
   assert.match(page.querySelector(".ueLinkedMaintenance").textContent,/Bảo trì liên kết \(1\)/);
   assert.match(page.querySelector(".ueLinkedMaintenance").textContent,/Bảo trì bơm PCCC 130 Hồng Hà/);
  }else assert.equal(page.querySelectorAll(".ueLinkedMaintenance").length,0,id+" must keep other projects unchanged");
  const systemButtons=[...page.querySelectorAll(".ueSystemRail [data-ue-group]")];
  assert.equal(systemButtons.length,10,id+" must display all nine systems and the all-systems control on the left");
  assert.match(page.querySelector(".ueRefRailHeading")?.textContent||"",/CHỌN HỆ THỐNG/,id+" needs a visible category heading");
  if(id!=="NANGCAP")assert(dom.window.document.body.classList.contains("estaTechnicalAssetsMode"),id+" must restore the technical theme on render");
  assert(systemButtons.some(b=>b.textContent.includes("Điện (MSB)")),id+" missing Electric navigation");
  assert(systemButtons.some(b=>b.textContent.includes("Bơm & cấp thoát nước")),id+" missing Water navigation");
  assert(systemButtons.some(b=>b.textContent.includes("PCCC")),id+" missing Fire navigation");
  const electric=systemButtons.find(b=>b.dataset.ueGroup==="Điện (MSB)");
  electric.click();
  assert.equal(page.querySelector("#ueGroup").value,"Điện (MSB)",id+" electric rail must select the correct group");
  assert([...page.querySelectorAll(".ueRefRows .ueRefDevice small")].every(b=>b.textContent==="Điện (MSB)"),id+" electric filter mixed system data");
  assert.equal(page.querySelectorAll(".ueRefRows .ueRefRow").length,5,id+" electric rail should show five built-in devices");
  page.querySelector('.ueSystemRail [data-ue-group=""]').click();
  assert.equal(page.querySelectorAll(".ueRefRows .ueRefRow").length,45,id+" all-systems rail must restore the full list");

  const names=[...page.querySelectorAll(".ueRefDevice strong")].map(x=>x.textContent);
  assert(names.includes("Thiết bị riêng "+id));
  assert(calls.some(x=>x.building===id&&x.url.includes("building_equipment_profiles_nangcap")));
 }
 assert(routes.includes("TECHNICAL_INFO_PROJECTS"),"only target project routes should share UI");
 for(const id of ids)assert(routes.includes('"'+id+'"'),id+" route missing");
 assert(routes.includes('updateShowTechnicalEquipment(page)'),"technical page route must use shared component");
 assert(routes.includes('document.body.classList.remove("estaTechnicalAssetsMode")'),"non-technical pages must not inherit technical styling");
 assert(css.includes(".estaTechnicalAssetsMode"),"new technical page should have screenshot-style CSS");
 assert(css.includes(".ueRefLayout .ueSystemRail"),"shared technical pages must preserve their left system navigation");
 assert(css.includes("#updateAssetsPage.ueSnapshot:not(.hide) .ueRefLayout"),"category rail fallback must not depend on the root mode");
 assert(parityCss.includes("#app:is(.estaUpgradeMode,.estaTechnicalAssetsMode)"),"technical page must use exactly the same root theme selectors as Bản nâng cấp");
 assert(parityCss.includes("body:is(.estaUpgradeMode,.estaTechnicalAssetsMode)"),"portal dialogs must use exactly the same theme");
 assert(!parityCss.includes("#app.estaUpgradeMode")&&!parityCss.includes("body.estaUpgradeMode"),"no orphan NANGCAP-only theme selectors permitted");
 assert(parityCss.split("#app:is(.estaUpgradeMode,.estaTechnicalAssetsMode)").length-1>=70,"the complete shared theme, not a partial imitation, must be reused");
 for(const rule of [".estaSidebar",".estaTopbar",".page","input:not([type=\"checkbox\"])"]){
  assert(parityCss.includes(rule),"shared project design is missing "+rule);
 }
 assert(pageHtml.includes("nangcap-unified.css?v=20261016-technical-parity01"),"browsers must load the corrected styles, not a cached variant");
 assert(routes.includes('if(!on||$("#updateAssetsPage")?.classList.contains("hide"))'),"shared theme must be turned off after leaving the technical page");
 assert(dbSql.includes("private.can_access_building(building_id,true)"),"database must isolate writes by assigned building");
 for(const id of ids)assert(dbSql.includes("'"+id+"'"),id+" must have its own database scope");
 state.id="UPDATE";
 const before=page.innerHTML;
 dom.window.estaUpgradeAssets.render(page,true);
 assert.equal(page.innerHTML,before,"other pages must not be replaced");
 console.log("ESTA shared technical information: 5 isolated projects, identical UI, other pages untouched PASS");
})().catch(e=>{console.error(e);process.exitCode=1});
