"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {JSDOM}=require("jsdom");
const source=fs.readFileSync(path.join(__dirname,"..","maintenance-130.js"),"utf8");
const systemSource=fs.readFileSync(path.join(__dirname,"..","upgrade-equipment.js"),"utf8");
new Function(source);new Function(systemSource);
const PROJECTS=["68PĐL","62THL","127HH","130HH"];
const date="2026-10-12",month="2026-10";
const db=Object.fromEntries(PROJECTS.map((b,i)=>{
 const equipmentId="00000000-0000-4000-8000-"+String(i+1).padStart(12,"0");
 return [b,{
  systems:[],people:[{name:"Văn"}],
  profiles:[{id:equipmentId,building_id:b,name:"Bơm điện "+b,code:"PCCC-"+i,
   system_group:"PCCC",location:"Phòng bơm",specs:{_estaUpgrade:{verified:true}}}],
  plans:[{id:b+"-plan",building_id:b,plan_code:b+"-plan",plan_year:2026,work_title:"Kiểm tra bơm "+b,
   system_group:"PCCC",subsystem:"Phòng bơm",assigned_to:"Văn",cadence:"Không lặp",
   source_notes:"Đã nhập",equipment_profile_id:equipmentId}],
  events:[{id:b+"-event",building_id:b,item_id:b+"-plan",event_key:b+"-plan:"+month,
   planned_month:month+"-01",planned_date:date,status:"planned",image_paths:[]}]
 }];
}));
const dom=new JSDOM('<!doctype html><html><body><div id="maintenancePage"><section class="maintenanceSchedule"></section><section class="maintenanceStats"></section><section class="maintenanceBoard"></section><section class="maintenanceHistoryCard"></section></div><button id="navUpdateAssets"></button></body></html>',{
 url:"https://esta.test/",runScripts:"outside-only"
});
const w=dom.window,d=w.document,calls=[];
w.currentBuilding={id:"130HH"};w.currentAccount={is_admin:true};
w.centralSession={access_token:"fixture"};
w.canProjectEdit=()=>true;w.toast=()=>{};w.estaRefreshProjectNavAlerts=()=>{};
w.estaUpgradeAssets={refresh:async()=>{},focusEquipment:async()=>{}};
w.sbFetch=async url=>{
 const match=url.match(/building_id=eq\.([^&]+)/);
 const b=decodeURIComponent(match?.[1]||"");
 assert.ok(db[b],"Every read must be scoped to the chosen building: "+url);
 calls.push({url,building:b});
 if(url.includes("/ops_systems"))return db[b].systems.map(x=>({...x}));
 if(url.includes("/building_equipment_profiles_nangcap"))return db[b].profiles.map(x=>({...x}));
 if(url.includes("/esta_maintenance_plan_items"))return db[b].plans.map(x=>({...x}));
 if(url.includes("/esta_maintenance_plan_occurrences"))return db[b].events.map(x=>({...x}));
 if(url.includes("/building_people"))return db[b].people.map(x=>({...x}));
 throw Error("Unexpected table: "+url);
};
w.eval(source);
d.dispatchEvent(new w.Event("DOMContentLoaded",{bubbles:true}));
const settle=async()=>{for(let i=0;i<12;i++)await new Promise(resolve=>setTimeout(resolve,0));};
(async()=>{
 for(const building of PROJECTS){
  w.currentBuilding={id:building};w.mountMaintenance130();await settle();
  const systemName="Hệ thống mới "+building;
  db[building].systems.push({name:systemName,active:true});
  d.getElementById("m130Create").click();await settle();
  const systems=d.getElementById("m130System");
  assert([...systems.options].some(o=>o.value===systemName),building+" new empty system must sync");
  systems.value=systemName;systems.dispatchEvent(new w.Event("change",{bubbles:true}));
  assert.equal(d.getElementById("m130EquipmentProfile").options.length,1,building+" empty system has no fake devices");
  const added={id:"a0000000-0000-4000-8000-"+String(PROJECTS.indexOf(building)+1).padStart(12,"0"),
   building_id:building,name:"Thiết bị mới "+building,code:"NEW-"+building,
   system_group:systemName,location:"Tầng hầm",specs:{_estaUpgrade:{verified:true}}};
  db[building].profiles.push(added);
  d.getElementById("m130Close").click();
  d.getElementById("m130Create").click();await settle();
  systems.value=systemName;systems.dispatchEvent(new w.Event("change",{bubbles:true}));
  const equipment=d.getElementById("m130EquipmentProfile");
  assert([...equipment.options].some(o=>o.value===added.id),building+" new device must sync automatically");
  equipment.value=added.id;equipment.dispatchEvent(new w.Event("change",{bubbles:true}));
  assert.equal(d.getElementById("m130Location").value,added.location,"linked location prefills");
  assert.equal(d.getElementById("m130AssetCode").value,added.code,"code derived, not manually entered");
  for(const other of PROJECTS.filter(b=>b!==building)){
   assert(![...equipment.options].some(o=>o.textContent.includes("Thiết bị mới "+other)),building+" exposed another building's device");
  }
  d.getElementById("m130Close").click();
  assert(db[building].plans[0].equipment_profile_id,"legacy maintenance link still preserved");
 }
 assert(PROJECTS.every(b=>calls.some(x=>x.building===b&&x.url.includes("ops_systems"))),"four buildings each queried own systems");
 assert(systemSource.includes('method:"POST"')&&systemSource.includes("ops_systems"),"technical page persists new system");
 assert(systemSource.includes("data-ue-maintenance-image"),"technical page renders linked completion evidence");
 dom.window.close();
 console.log("PASS dynamic systems: four isolated projects, empty new group, new devices, unchanged historic links");
})().catch(error=>{console.error(error);process.exitCode=1;dom.window.close();});
