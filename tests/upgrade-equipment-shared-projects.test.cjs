"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {JSDOM}=require("jsdom");
const root=path.join(__dirname,"..");
const js=fs.readFileSync(path.join(root,"upgrade-equipment.js"),"utf8");
const routes=fs.readFileSync(path.join(root,"update-lab.js"),"utf8");
const css=fs.readFileSync(path.join(root,"upgrade-equipment-reference.css"),"utf8");
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
  const names=[...page.querySelectorAll(".ueRefDevice strong")].map(x=>x.textContent);
  assert(names.includes("Thiết bị riêng "+id));
  assert(calls.some(x=>x.building===id&&x.url.includes("building_equipment_profiles_nangcap")));
 }
 assert(routes.includes("TECHNICAL_INFO_PROJECTS"),"only target project routes should share UI");
 for(const id of ids)assert(routes.includes('"'+id+'"'),id+" route missing");
 assert(routes.includes('updateShowTechnicalEquipment(page)'),"technical page route must use shared component");
 assert(routes.includes('document.body.classList.remove("estaTechnicalAssetsMode")'),"non-technical pages must not inherit technical styling");
 assert(css.includes(".estaTechnicalAssetsMode"),"new technical page should have screenshot-style CSS");
 assert(dbSql.includes("private.can_access_building(building_id,true)"),"database must isolate writes by assigned building");
 for(const id of ids)assert(dbSql.includes("'"+id+"'"),id+" must have its own database scope");
 state.id="UPDATE";
 const before=page.innerHTML;
 dom.window.estaUpgradeAssets.render(page,true);
 assert.equal(page.innerHTML,before,"other pages must not be replaced");
 console.log("ESTA shared technical information: 5 isolated projects, identical UI, other pages untouched PASS");
})().catch(e=>{console.error(e);process.exitCode=1});
