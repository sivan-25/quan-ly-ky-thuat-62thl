"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const {JSDOM}=require("jsdom");

const appSource=fs.readFileSync("app.js","utf8");
const html=fs.readFileSync("index.html","utf8");
const css=fs.readFileSync("inventory-mobile-cards.css","utf8");
for(const id of ["materialMobileCards","materialMobilePeriod","materialMobileTransactions","toolsMobileCards","inventory130SearchRow","inventory130Search","inventory130Year","inventory130Pdf","inventory130ListBar","inventory130AddMaterial","inventory130QuickMenu","inventory130FloatingTxn"]){
 assert.match(html,new RegExp('id="'+id+'"'),id+" must be rendered");
}
assert.match(html,/inventory-mobile-cards\.css\?v=/);
assert.match(css,/@media\(max-width:760px\)/);
assert.match(css,/supplied Vật tư tiêu hao HTML reference/);
assert.match(css,/#inventory130SearchRow/);
assert.match(css,/#materialMonthTabs button\.active/);
assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/);
assert.match(css,/\.inventory130Progress/);
assert.match(css,/\.inventory130TxnBadge/);
assert.match(css,/#inventory130FloatingTxn/);
assert.match(css,/\.materialMonthlyCard>\.inventoryTableScroll/);
assert.ok(html.indexOf("four-project-compact.css")<html.indexOf("inventory-mobile-cards.css"),"mobile patch loads last");

const dom=new JSDOM(html,{url:"https://example.test/"});
const $=selector=>dom.window.document.querySelector(selector);
const syncSource=appSource.slice(appSource.indexOf("function syncInventory130Reference("),appSource.indexOf("function renderMaterials(){"));
const source=appSource.slice(appSource.indexOf("function renderMaterials(){"),appSource.indexOf("function setInventoryTab(tab){"));
assert.match(syncSource,/function syncInventory130Reference/);
assert.match(appSource,/inventory130FloatingTxn.*addEventListener/);
assert.match(appSource,/inventory130Search.*addEventListener/);
assert.match(source,/function renderMaterials\(\)/);
assert.match(source,/classList\.toggle\("inventory130MobileCompact",String\(currentBuilding\?\.id\|\|""\)==="130HH"\)/);
assert.match(source,/function renderTools\(\)/);
const mat={id:"material-uuid",name:"Dây điện 8 inch",code:"VT-001",unit:"m",tracking_start_date:"2026-09-01",min_qty:2,opening_qty:20};
const tools=[{id:"tool-uuid",name:"Ampe kìm",code:"DC-01",qty:1,unit:"Cái",condition_status:"Tốt",brand:"Fluke",location:"Kho",keeper:"Văn",note:""}];
const inventoryTransactions=[{id:"tx-uuid",material_id:mat.id,tx_date:"2026-10-01",tx_type:"in",qty:3,performer:"Văn",note:"Nhập mua mới"}];
const snap={
 opening:20,closing:22,current:22,totalIn:3,totalOut:1,
 months:Array.from({length:12},(_,i)=>({active:i>=8,begin:20,inQty:i===9?3:0,outQty:i===9?1:0,stock:22}))
};
const esc=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const ctx={
 document:dom.window.document,$,currentAccount:{is_admin:true},currentBuilding:{id:"130HH"},inventoryActiveMonth:10,
 inventoryTools:tools,inventoryMaterials:[mat],inventoryTransactions,inventoryShowAlertsOnly:false,
 INV_MONTHS:["Th 01","Th 02","Th 03","Th 04","Th 05","Th 06","Th 07","Th 08","Th 09","Th 10","Th 11","Th 12"],
 inventoryYearValue:()=>2026,inventoryActiveMaterials:()=>[mat],
 inventoryStockAlerts:()=>[],inventoryTrackingStart:()=>mat.tracking_start_date,
 inventoryMonthEnd:()=> "2026-10-31",inventorySnapshot:()=>snap,
 today:()=> "2026-10-19",inventoryStockAsOf:()=>22,inventoryNum:x=>Number(x||0),
 inventoryFmt:x=>Number(x||0).toLocaleString("vi-VN"),
 renderStockAlerts:()=>{},canProjectEdit:()=>true,esc,fmt:date=>date,
 sentenceCapitalizeText:x=>x
};
vm.createContext(ctx);vm.runInContext(syncSource+"\n"+source,ctx);
vm.runInContext("renderMaterials(); renderTools();",ctx);
assert.ok($("#inventoryPage").classList.contains("inventory130MobileCompact"),"130 HH mobile layout marker is active");
const card=$("#materialMobileCards .invMobileCard");
assert.ok(card,"month view must render a dedicated material card");
assert.ok(card.classList.contains("invMobileCard130"),"130 HH gets a distinct compact material card");
const compactRow=card.querySelector(".invMobileCardBottom");
assert.ok(compactRow,"130 HH card must include the actual two-row compact structure");
assert.equal(compactRow.querySelectorAll(".invMobileValue").length,4,"all four inventory figures share the same row");
assert.equal(card.querySelector(".invMobileValue.is-closing b").textContent,"22","closing stock is prominent in the fourth column");
assert.match(card.querySelector(".invMobileValue.is-closing").textContent,/Tồn cuối/);
assert.equal(card.querySelector(".invMobileStatus").textContent,"Còn hàng","status remains visible but compact");
assert.match(card.querySelector(".invMobileIndex").textContent,/01/);
assert.equal(compactRow.querySelectorAll("button").length,0,"reference keeps metrics in a single uncluttered row");
assert.match(card.querySelector(".inventory130ProgressText").textContent,/Còn 22\/23/);
assert.equal(card.querySelector(".inventory130Progress").getAttribute("aria-valuenow"),"96");
assert.equal(card.querySelectorAll(".inventory130Move, .inventory130Edit").length,2,"per-material transaction and edit remain accessible");
assert.match(card.textContent,/Dây điện 8 inch/);
assert.match(card.textContent,/ĐVT: m/);
assert.equal(card.querySelectorAll(".invMobileValue").length,4,"all four figures remain synchronized");
assert.match(card.textContent,/Tồn cuối/);
assert.equal(card.querySelectorAll("button").length,2,"stock movement and edit; no delete while stock >0");
assert.equal($("#materialMobilePeriod").value,"10","month picker follows actual period");
assert.equal($("#materialMonthTabs .yearOverviewBtn").textContent,"Cả năm");
assert.equal($("#inventory130ListCount").textContent,"Danh sách · 1 mục");
assert.ok($("#inventory130QuickChoices").querySelectorAll("button").length>=3,"quick-add samples mirrored from native ESTA");
assert.equal($("#inventory130Year").value,$("#inventoryYear").value);
mat.min_qty=23;
vm.runInContext("renderMaterials();",ctx);
assert.ok($("#materialMobileCards .invMobileCard130.is-low"),"low stock warning uses the emphasized card state");
assert.equal($("#materialMobileCards .invMobileStatus").textContent,"Sắp hết");
mat.min_qty=2;
vm.runInContext("renderMaterials();",ctx);
assert.ok($("#materialMobileTransactions .inventory130Transaction"),"transactions use compact reference rows");
assert.match($("#materialMobileTransactions .inventory130TxnBadge").textContent,/Nhập \+3/);
assert.equal($("#materialMobileTransactions .invMobileCard").querySelectorAll("button").length,1,"manual transaction can still be removed");
assert.equal($("#toolsMobileCards .invMobileCard").querySelectorAll("button").length,2,"tool edit and delete still available");

ctx.inventoryActiveMonth="all";
vm.runInContext("renderMaterials();",ctx);
assert.equal($("#materialMobilePeriod").value,"all");
assert.equal(dom.window.document.querySelectorAll("#materialMobileCards .invYearDetails").length,0,"130 HH omits the annual transaction details line");
assert.equal(dom.window.document.querySelectorAll("#materialMobileCards .invMobileValue").length,4,"year totals still show four stock numbers");

ctx.canProjectEdit=()=>false;
vm.runInContext("renderMaterials(); renderTools();",ctx);
assert.equal($("#materialMobileCards .invMobileCardActions"),null,"viewer gets no material action bar");
assert.equal($("#materialMobileCards .inventory130Move"),null,"viewer cannot move stock");
assert.equal($("#materialMobileCards .inventory130Edit"),null,"viewer cannot edit stock");
assert.equal($("#inventory130FloatingTxn").hidden,true,"viewer cannot open global stock transaction");
assert.ok($("#materialMobileCards .invMobileCardBottom.is-readonly"),"viewer still gets full-width stock information");
assert.equal($("#materialMobileCards .invMobileValue.is-closing b").textContent,"22","viewer sees closing stock without edit controls");
assert.equal($("#toolsMobileCards .invMobileCardActions"),null,"viewer cannot access tool edits");
assert.equal($("#materialMobileTransactions .invMobileCardActions"),null,"viewer cannot delete transactions");
ctx.currentBuilding={id:"62THL"};
vm.runInContext("renderMaterials();",ctx);
assert.equal($("#inventoryPage").classList.contains("inventory130MobileCompact"),false,"62 THL retains existing card sizing");
assert.equal($("#materialMobileCards .invMobileCard130"),null,"62 THL does not receive 130-specific markup");
assert.equal($("#materialMobileCards .invMobileCardBottom"),null,"62 THL keeps its original action row");
assert.equal($("#materialMobileCards .invMobileValue").parentElement.children.length,4,"62 THL retains four inline figures");
assert.equal($("#materialMonthTabs .yearOverviewBtn").textContent,"12 tháng","other projects keep previous month title");
assert.equal($("#materialMobileCards .invMobileStatus"),null,"62 THL keeps existing heading");
assert.equal(dom.window.document.querySelectorAll("#materialMobileCards .invYearMonth").length,12,"62 THL retains its previous annual breakdown");
ctx.currentBuilding={id:"127HH"};
vm.runInContext("renderMaterials();",ctx);
assert.equal($("#inventoryPage").classList.contains("inventory130MobileCompact"),false,"127 HH retains existing card sizing");
ctx.currentBuilding={id:"68PĐL"};
vm.runInContext("renderMaterials();",ctx);
assert.equal($("#inventoryPage").classList.contains("inventory130MobileCompact"),false,"68 PĐL retains existing card sizing");
console.log("PASS mobile inventory: 130HH scope, four KPIs, month/year, arithmetic, actions, tools, permissions");
