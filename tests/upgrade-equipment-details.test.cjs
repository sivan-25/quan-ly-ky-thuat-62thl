"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {JSDOM}=require("jsdom");
const js=fs.readFileSync(path.join(__dirname,"..","upgrade-equipment.js"),"utf8");
const dom=new JSDOM("<div id='updateAssetsPage'></div>",{url:"https://example.test"});
const page=dom.window.document.getElementById("updateAssetsPage");
const row={
 id:"aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",building_id:"NANGCAP",
 name:"Bơm chữa cháy điện",equipment_type:"Bơm chữa cháy điện",system_group:"PCCC",
 location:"Phòng bơm",brand:"Grundfos",model:"NK 150",code:"PCCC-01",status:"Đang sử dụng",
 quantity:2,install_year:2025,note:"Kiểm tra định kỳ",
 specs:{cs:"11",ll:"45",nhathau:"Nhà thầu A",capacity:"11 kW",serial:"SER123",
 _estaUpgrade:{seedKey:"pccc:0",technicalType:"bom_dien",verified:true,interval:30,condition:"tot",
 custom:[{key:"Áp lực thử",value:"8 bar"}],history:[{date:"2026-10-10",by:"Văn",reading:"6 bar",condition:"tot",note:"Đạt",photos:[]}]}}
};
const scope={window:dom.window,document:dom.window.document,currentBuilding:{id:"NANGCAP",role:"editor"},projectOverviewActive:true,
 centralSession:{access_token:"fixture"},currentAccount:{is_admin:true},sbFetch:async p=>p.includes("maintenance_assets")?[]:[row]};
new vm.Script(js).runInNewContext(scope);
const $=s=>dom.window.document.querySelector(s);
(async()=>{
 dom.window.estaUpgradeAssets.render(page,true);
 await dom.window.estaUpgradeAssets.refresh();
 const button=$('[data-ue-id="'+row.id+'"]'),detail=$("#ueDetail-"+row.id);
 assert(detail);assert.equal(detail.hidden,true);
 assert.match(button.textContent,/Bơm chữa cháy điện/);
 assert.match(button.textContent,/Phòng bơm/);
 assert.match(button.textContent,/Tốt/);
 assert.match(button.textContent,/10\/10\/2026/);
 assert(!button.textContent.includes("Grundfos"));
 button.click();assert.equal(detail.hidden,false);
 assert.equal(button.getAttribute("aria-expanded"),"true");
 for(const value of ["Grundfos","NK 150","11 kW","Công suất động cơ","45 m³/h","Nhà thầu A",
  "Áp lực thử","8 bar","SER123","Kiểm tra định kỳ","Văn","6 bar","PCCC-01","10/10/2026"]){
  assert(detail.textContent.includes(value),"missing saved spec: "+value);
 }
 assert(detail.querySelector(".ueRefFacts"));
 assert(detail.querySelector("[data-ue-check]"),"check action available for saved device");
 detail.querySelector("[data-ue-check]").click();
 assert.equal($("#ueModalHeading").textContent,"Chi tiết & kiểm tra thiết bị");
 assert.equal($("#ueInspection").hidden,false);
 assert.equal($("#ueForm").elements.namedItem("brand").value,"Grundfos");
 $("#ueCancel").click();
 button.click();assert.equal(detail.hidden,true);
 button.click();
 detail.querySelector("[data-ue-edit]").click();
 assert.equal($("#ueForm").elements.namedItem("brand").value,"Grundfos");
 console.log("NANGCAP expanded specifications, inspection and profile editing PASS");
})().catch(e=>{console.error(e);process.exitCode=1});
