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
 assert.equal($(".ueListHead"),null,"redundant table header removed");
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
 const rowButton=page.querySelector('[data-ue-id="'+row.id+'"]');
 const detail=page.querySelector('#ueDetail-'+row.id);
 assert(detail,"saved details available in accordion");
 assert.equal(detail.hidden,true,"saved specifications hidden by default");
 assert.equal(rowButton.getAttribute("aria-expanded"),"false","row starts collapsed");
 assert.equal(rowButton.querySelector(".ueItemSpecifications"),null,"details not inside row control");
 assert.equal(rowButton.querySelector(".ueItemDate"),null,"blank date columns removed");
 assert.equal(rowButton.querySelector(".ueItemGroup"),null,"repeated system column removed");
 assert(rowButton.querySelector(".ueItemPlace").textContent.includes("Phòng bơm"),"location stays visible");
 assert(!rowButton.textContent.includes("Grundfos"),"brand hidden before opening");
 rowButton.click();
 assert.equal(detail.hidden,false,"click opens equipment details");
 assert.equal(rowButton.getAttribute("aria-expanded"),"true");
 for(const expected of ["Grundfos","NK 150","11 kW","Công suất động cơ","45 m³/h",
  "Nhà thầu A","Áp lực thử","8 bar","SER123","Kiểm tra định kỳ","Văn","6 bar","PCCC-01","10/10/2026"]){
  assert(detail.textContent.includes(expected),"missing detail: "+expected);
 }
 assert(detail.querySelector("[data-ue-edit]"),"edit action within expanded equipment details");
 rowButton.click();
 assert.equal(detail.hidden,true,"second click collapses equipment details");
 rowButton.click();
 detail.querySelector("[data-ue-edit]").click();
 assert.equal($("#ueModalHeading").textContent,"Chi tiết & kiểm tra thiết bị","edit button opens existing modal");
 assert.equal($("#ueForm").elements.namedItem("brand").value,"Grundfos","edit form retains saved fields");
 $("#ueSummaryToggle").click();
 await dom.window.estaUpgradeAssets.refresh();
 assert($("#ueStatusSummary").classList.contains("ueCollapsed"),"collapse remains after refresh");
 console.log("NANGCAP saved details, no condition column and KPI collapse: PASS");
})().catch(e=>{console.error(e);process.exitCode=1});