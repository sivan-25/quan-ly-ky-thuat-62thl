"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const {JSDOM}=require("jsdom");
const html=fs.readFileSync("index.html","utf8");
const app=fs.readFileSync("app.js","utf8");
const css=fs.readFileSync("tools-professional.css","utf8");
for(const id of ["inventoryToolsPane","toolSearch","toolStatusFilter","toolVisibleCount","toolsBody","toolsMobileCards","toolCount","toolGoodCount","toolRepairCount","toolExportPdf","addToolBtn","toolItemModal"])assert.match(html,new RegExp('id="'+id+'"'));
assert.match(html,/tools-professional\.css\?v=20261020-toolcompact03/);
assert.match(css,/@media\(max-width:760px\)/);
assert.match(css,/@media\(min-width:1051px\) and \(max-width:1400px\)/);
assert.match(css,/@media\(max-width:1050px\)/);
// Mobile tool editor must stay compact, but keep the original persistence fields.
for(const id of ["toolName","toolBrand","toolCode","toolQty","toolUnit","toolCondition","toolKeeper","toolLocation","toolAcquiredDate","toolNote"]){
 assert.match(html,new RegExp('id="'+id+'"'),"tool input "+id);
}
assert.match(css,/#toolItemModal #toolItemForm\.inventoryForm>label\.toolField-name/);
assert.match(css,/#toolItemModal #toolItemForm \.inventoryFormActions/);
const dom=new JSDOM(html,{url:"https://esta.test/"});
const $=s=>dom.window.document.querySelector(s);
const toolEditor=$("#toolItemForm");
assert.equal(toolEditor.querySelectorAll(":scope > label").length,8,"visible tool editor fields");
assert.ok($("#toolExtraFields").querySelector("#toolAcquiredDate"),"date remains editable in extras");
assert.ok($("#toolExtraFields").querySelector("#toolNote"),"note remains editable in extras");
assert.equal($("#toolExtraFields").open,false,"optional details collapsed by default");
assert.equal(toolEditor.querySelectorAll(".inventoryFormActions button").length,2);

const tools=[
 {id:"tool-01",name:"Đồng hồ vạn năng",code:"DC-01",qty:2,unit:"Cái",brand:"Fluke",keeper:"Văn",location:"Kho kỹ thuật",note:"Đo điện",condition_status:"Tốt"},
 {id:"tool-02",name:"Máy khoan",code:"DC-02",qty:1,unit:"Bộ",brand:"Bosch",keeper:"Nam",location:"Tủ dụng cụ",note:"",condition_status:"Đang sử dụng"},
 {id:"tool-03",name:"Ampe kìm",code:"DC-03",qty:1,unit:"Cái",brand:"Kyoritsu",keeper:"Văn",location:"Kho kỹ thuật",note:"Kiểm tra an toàn",condition_status:"Cần kiểm tra"},
 {id:"tool-04",name:"Thang nhôm",code:"DC-04",qty:1,unit:"Cái",brand:"",keeper:"",location:"",note:"",condition_status:"Hỏng"}
];
const ctx={
 document:dom.window.document,window:dom.window,$,inventoryTools:tools,
 esc:x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),
 inventoryFmt:n=>Number(n||0).toLocaleString("vi-VN"),
 sentenceCapitalizeText:x=>x,
 canProjectEdit:()=>true,
 currentBuilding:{id:"130HH"}
};
const start=app.indexOf("function filteredTools(){");
const end=app.indexOf("function setInventoryTab(tab){",start);
assert.ok(start>0&&end>start,"find isolated tool renderer");
const reportStart=app.indexOf("function toolsForReport(){",end);
const reportEnd=app.indexOf("let toolReportBusy=",reportStart);
assert.ok(reportStart>0&&reportEnd>reportStart,"find PDF tool selector");
vm.createContext(ctx);
vm.runInContext(app.slice(start,end)+"\n"+app.slice(reportStart,reportEnd),ctx);
vm.runInContext("renderTools()",ctx);
assert.equal($("#toolCount").textContent,"4");
assert.equal($("#toolGoodCount").textContent,"2");
assert.equal($("#toolRepairCount").textContent,"2");
assert.equal($("#toolsBody").querySelectorAll("tr").length,4);
assert.equal($("#toolsMobileCards").querySelectorAll(".estaToolCard").length,4);
assert.equal($("#toolsMobileCards").querySelectorAll(".estaToolMore summary").length,4);
for(const card of $("#toolsMobileCards").querySelectorAll(".estaToolCard")){
  const details=card.querySelector("details.estaToolMore");
  assert.equal(details.open,false,"compact tool cards start collapsed");
  assert.ok(details.querySelector("summary").textContent.includes("Chi tiết"),"clear expansion label");
  if(card.querySelector(".invMobileCardActions"))assert.ok(details.contains(card.querySelector(".invMobileCardActions")),"edit/delete only in expanded details");
}
assert.match(css, /#app #inventoryPage #inventoryToolsPane .toolsStats/);
assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.equal($("#toolsMobileCards .estaToolCard .invMobileCardActions").querySelectorAll("button").length,2);
assert.match($("#toolVisibleCount").textContent,/4 \/ 4/);
$("#toolStatusFilter").value="attention";
vm.runInContext("renderTools()",ctx);
assert.equal($("#toolsBody").querySelectorAll("tr").length,2);
assert.equal($("#toolsMobileCards").querySelectorAll(".estaToolCard").length,2);
assert.equal(vm.runInContext("toolsForReport().length",ctx),2,"PDF matches filter");
assert.match($("#toolVisibleCount").textContent,/2 \/ 4/);
$("#toolSearch").value="amPe";
vm.runInContext("renderTools()",ctx);
assert.equal($("#toolsMobileCards .estaToolCard .invMobileCardName strong").textContent,"Ampe kìm");
assert.equal(vm.runInContext("toolsForReport().length",ctx),1);
$("#toolSearch").value="không tồn tại";
vm.runInContext("renderTools()",ctx);
assert.equal($("#toolsBody").children.length,0);
assert.match($("#toolsEmpty").textContent,/Không tìm thấy/);
assert.equal($("#toolsEmpty").classList.contains("hide"),false);
$("#toolSearch").value="";$("#toolStatusFilter").value="ready";
for(const id of ["68PĐL","62THL","127HH","130HH"]){
 ctx.currentBuilding={id};
 vm.runInContext("renderTools()",ctx);
 assert.equal($("#toolsMobileCards").querySelectorAll(".estaToolCard").length,2,id);
 assert.equal($("#toolsBody").querySelectorAll("tr").length,2,id);
}
ctx.canProjectEdit=()=>false;
vm.runInContext("renderTools()",ctx);
assert.equal($("#toolsBody").querySelectorAll("button").length,0,"read-only desktop");
assert.equal($("#toolsMobileCards").querySelectorAll("button").length,0,"read-only phone");
console.log("Tools professional: responsive markup, filtering, PDF parity, read-only and four-project checks passed.");
