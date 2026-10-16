"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {JSDOM}=require("jsdom");
const js=fs.readFileSync(path.join(__dirname,"..","upgrade-equipment.js"),"utf8");
const dom=new JSDOM("<div id='updateAssetsPage'></div>",{url:"https://example.test"});
const page=dom.window.document.getElementById("updateAssetsPage");
const row={
 id:"aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",building_id:"NANGCAP",
 name:"Bơm chữa cháy điện",equipment_type:"Bơm chữa cháy điện",system_group:"PCCC",
 location:"Phòng bơm",brand:"Grundfos",model:"NK 150",code:"PCCC-01",
 status:"Đang sử dụng",quantity:2,install_year:2025,note:"Kiểm tra định kỳ",
 specs:{cs:"11",ll:"45",nhathau:"Nhà thầu A",capacity:"11 kW",serial:"SER123",
  _estaUpgrade:{seedKey:"pccc:0",technicalType:"bom_dien",verified:true,interval:30,condition:"tot",
   custom:[{key:"Áp lực thử",value:"8 bar"}],
   history:[{date:"2026-10-10",by:"Văn",reading:"6 bar",condition:"tot",note:"Đạt",photos:[]}]}}
};
const scope={window:dom.window,document:dom.window.document,
 currentBuilding:{id:"NANGCAP",role:"editor"},projectOverviewActive:true,
 centralSession:{access_token:"fixture"},currentAccount:{is_admin:true},
 sbFetch:async p=>p.includes("maintenance_assets")?[]:[row]};
new vm.Script(js).runInNewContext(scope);
const $=s=>page.querySelector(s);
(async()=>{
 dom.window.estaUpgradeAssets.render(page,true);
 assert(!$(".ueListHead").textContent.includes("Tình trạng"),"condition column must be absent");
 assert($("#ueStatus"),"status filter remains");
 const summary=$("#ueStatusSummary"),toggle=$("#ueSummaryToggle");
 toggle.click();assert(summary.classList.contains("ueCollapsed"),"collapse KPI");
 assert.equal(toggle.getAttribute("aria-expanded"),"false");
 toggle.click();assert(!summary.classList.contains("ueCollapsed"),"expand KPI");
 const rail=$("#ueSystemRail"),nav=$("#ueRailToggle"),grid=$(".ueClassicGrid");
 assert.equal(nav.getAttribute("aria-expanded"),"true","system rail initially expanded");
 assert.equal(page.querySelectorAll("[data-ue-group]").length,10,"system filters still available");
 nav.click();
 assert(rail.classList.contains("ueCollapsed"),"system list collapses");
 assert(grid.classList.contains("ueRailCollapsed"),"table takes available width");
 assert.equal(nav.getAttribute("aria-expanded"),"false");
 assert.equal($("#ueRailOptions").getAttribute("aria-hidden"),"true");
 assert.equal(dom.window.localStorage.getItem("esta:nangcap:systemsCollapsed"),"1","collapse preference saved");
 nav.click();
 assert(!rail.classList.contains("ueCollapsed"),"system list expands");
 assert(!grid.classList.contains("ueRailCollapsed"),"expanded rail width restored");
 assert.equal(nav.getAttribute("aria-expanded"),"true");
 assert.equal($("#ueRailOptions").hasAttribute("aria-hidden"),false);
 nav.click();
 await dom.window.estaUpgradeAssets.refresh();
 assert($("#ueSystemRail").classList.contains("ueCollapsed"),"state survives data refresh");
 $("#ueRailToggle").click();
 await dom.window.estaUpgradeAssets.refresh();
 const detail=page.querySelector('[data-ue-id="'+row.id+'"] .ueItemSpecifications');
 assert(detail,"saved details shown inline");
 for(const expected of ["Grundfos","NK 150","11 kW","Công suất động cơ","45 m³/h",
  "Nhà thầu A","Áp lực thử","8 bar","SER123","Kiểm tra định kỳ","Văn","6 bar","PCCC-01"]){
  assert(detail.textContent.includes(expected),"missing detail: "+expected);
 }
 $("#ueSummaryToggle").click();
 await dom.window.estaUpgradeAssets.refresh();
 assert($("#ueStatusSummary").classList.contains("ueCollapsed"),"collapse remains after refresh");
 console.log("NANGCAP saved details, no condition column and KPI collapse: PASS");
})().catch(e=>{console.error(e);process.exitCode=1});