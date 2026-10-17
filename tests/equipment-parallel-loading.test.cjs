"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {JSDOM}=require("jsdom");
const js=fs.readFileSync(path.join(__dirname,"..","upgrade-equipment.js"),"utf8");
const dom=new JSDOM('<!doctype html><html><body><div id="app"><section id="updateAssetsPage"></section></div></body></html>',{url:"https://esta.test/"});
const state={id:"68PĐL",pending:null};
const requests=[];
const w=dom.window,d=w.document;
const scope={
 window:w,document:d,
 get currentBuilding(){return {id:state.id,name:state.id,role:"editor"}},
 projectOverviewActive:true,
 centralSession:{access_token:"fixture"},
 currentAccount:{is_admin:true},
 sbFetch:async url=>{
  const building=decodeURIComponent(url.match(/building_id=eq\.([^&]+)/)?.[1]||"");
  if(!building)throw Error("Unscoped read "+url);
  requests.push({building,url});
  if(url.includes("/building_equipment_profiles_nangcap")){
   return new Promise(resolve=>{state.pending={building,resolve};});
  }
  if(url.includes("/ops_systems"))return [];
  if(url.includes("/esta_maintenance_plan_items"))return [];
  if(url.includes("/esta_maintenance_plan_occurrences"))return [];
  if(url.includes("/maintenance_assets"))return [];
  throw Error("Unexpected endpoint "+url);
 }
};
new vm.Script(js).runInNewContext(scope);
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
(async()=>{
 for(const project of ["68PĐL","62THL","127HH","130HH"]){
  state.id=project;
  const page=d.getElementById("updateAssetsPage");
  w.estaUpgradeAssets.render(page,true);
  const result=w.estaUpgradeAssets.refresh();
  await tick();
  assert(state.pending&&state.pending.building===project,"profile query pending "+project);
  assert(requests.some(x=>x.building===project&&x.url.includes("/ops_systems")),
   "system catalog should start before profile query resolves "+project);
  assert(!requests.some(x=>x.building!==project&&x.url.includes("/esta_maintenance_plan_items")),
   "no cross-project active history");
  state.pending.resolve([]);
  await result;await tick();
  assert.equal(page.querySelectorAll(".ueRefRow").length,44,"same 44 template devices for "+project);
 }
 dom.window.close();
 console.log("PASS equipment: four-building independent system and profile reads begin concurrently, unchanged 44-device layout");
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
