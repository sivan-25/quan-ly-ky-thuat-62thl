const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const source = fs.readFileSync(path.join(__dirname,"..","maintenance-redesign.js"),"utf8");
new Function(source);

const wait = () => new Promise(resolve=>setTimeout(resolve,15));
async function fixture(id,internal,extra=""){
  const dom=new JSDOM('<!doctype html><html><body><div id="app" class="maintenanceMode"><header class="estaTopbar"><div class="headerTools"><button id="peopleSettingsBtn">Nhân sự</button></div></header><div id="maintenancePage" class="maintenancePage"><section class="maintenanceHero"></section>'+internal+extra+'</div></div></body></html>',{runScripts:"outside-only",url:"https://esta.local/"});
  const w=dom.window,d=w.document;
  w.currentBuilding={id};
  w.eval(source);
  d.dispatchEvent(new w.Event("DOMContentLoaded"));
  await wait();
  assert.ok(d.getElementById("estaMaintenanceRedesign"),"redesign mounted");
  return {dom,w,d};
}
(async()=>{
  const kpis=['late','today','week','review','done'].map((c,i)=>'<div class="m130Kpi '+c+'"><b>'+i+'</b><span>'+c+'</span></div>').join("");
  const m130='<section id="maint130"><div class="m130Header"><button id="m130Pdf">PDF</button></div><div id="m130Stats" class="m130Stats">'+kpis+'</div><div id="m130Cal"><div id="m130Year">Năm 2026</div><div id="m130Months"><button data-m130-month="9">Th 09</button><button data-m130-month="10" class="sel">Th 10</button><button data-m130-month="11">Th 11</button></div></div><div class="m130Toolbar"><input id="m130Search" type="search"><select id="m130Group"><option value="">Hệ thống</option></select><select id="m130State"><option value="">Trạng thái</option></select><select id="m130PriorityFilter"><option value="">Ưu tiên</option></select><select id="m130TypeFilter"><option value="">PM CM</option></select><select id="m130TechnicianFilter"><option value="">KTV</option></select><select id="m130SampleFilter"><option value="all">Dữ liệu</option></select></div><div class="m130ListTop"><div class="m130Heading"><span id="m130ListCount">4 / 20 công việc</span></div><div class="m130ListTools"><button id="m130Create">Thêm bảo trì</button><div class="m130ViewSwitch"><button data-m130-view="cards">Thẻ</button><button data-m130-view="rows">Bảng</button></div><div class="m130LayoutSwitch"><button data-m130-layout="list">Danh sách</button><button data-m130-layout="calendar">Lịch</button><button data-m130-layout="timeline">Timeline</button></div><button id="m130Legacy">Thiết bị / nhật ký</button></div></div><div id="m130List"></div></section>';
  {
    const {w,d,dom}=await fixture("130HH",m130);
    assert.equal(d.querySelector(".estamStats .m130Kpi.estamTotal b").textContent,"20");
    assert.equal(d.querySelector(".estamMonthNav #estamMonth").textContent,"Tháng 10/2026");
    assert.equal(d.querySelectorAll(".estamStats .m130Kpi").length,6,"all six KPIs shown");
    assert.equal(d.querySelectorAll(".estamStats .m130Kpi .estamKpiIcon svg").length,6,"all KPI icons use consistent SVG");
    assert.equal(d.querySelectorAll(".estamStats .m130Kpi .estamKpiDetail").length,6,"all KPI descriptions visible");
    assert.equal(d.querySelector(".estamTotal .estamKpiDetail").textContent,"Công việc trong tháng");
    assert.ok(d.querySelector(".estam130Overview"),"summary panel added on 130HH");
    assert.ok(d.querySelector(".estam130Lead strong"),"large total visible");
    assert.equal(d.querySelectorAll("[data-estam130-group]").length,8,"seven exclusive categories and all-filter");
    assert.ok(d.querySelector(".estam130Progress"),"progress summary shown");
    assert.equal(d.querySelector(".estam130Metric.estam130All b").textContent,"20");
    assert.equal(d.querySelector(".m130Kpi.late .estamKpiDetail").textContent,"Cần ưu tiên xử lý");
    assert.ok(d.querySelector("#estamNativeFilters #m130Search"));
    assert.ok(d.querySelector("#estam130Filters #m130State"),"additional status filter preserved");
    assert.ok(d.querySelector("#estam130Filters #m130TechnicianFilter"),"technician filter preserved");
    assert.ok(d.querySelector("#estam130Filters #m130Legacy"),"legacy equipment action preserved");
    assert.ok(d.querySelector("#estam130Filters .estam130TimelineAction"),"timeline remains available");
    assert.ok(d.querySelector("#estamNativeActions #m130Create"));
    let exported=0,calendar=0,rows=0;
    d.getElementById("m130Pdf").addEventListener("click",()=>exported++);
    d.querySelector('[data-m130-layout="calendar"]').addEventListener("click",()=>calendar++);
    d.querySelector('[data-m130-view="rows"]').addEventListener("click",()=>rows++);
    d.getElementById("estamHeaderPdf").click();assert.equal(exported,1,"header PDF delegates to native exporter");
    d.getElementById("estamSearch").click();assert.ok(d.getElementById("estaMaintenanceRedesign").classList.contains("estamSearching"));
    d.querySelector('[data-estam-view="calendar"]').click();assert.equal(calendar,1,"calendar action delegates");
    d.querySelector('[data-estam-view="rows"]').click();assert.ok(rows>=1,"list view delegates");
    d.querySelector('[data-m130-month="11"]').addEventListener("click",()=>{d.querySelector('[data-m130-month="10"]').classList.remove("sel");d.querySelector('[data-m130-month="11"]').classList.add("sel");});
    d.getElementById("estamNext").click();await wait();
    assert.equal(d.getElementById("estamMonth").textContent,"Tháng 11/2026");
    const groupedList=d.getElementById("m130List");
    groupedList.innerHTML='<article class="m130Entry m130CompactRow m130State-late"><time class="m130Date" datetime="2020-01-01"></time></article><article class="m130Entry m130CompactRow m130State-done"><time class="m130Date" datetime="2020-01-02"></time></article>';
    await wait();
    assert.equal(d.querySelectorAll(".estam130WorkGroup").length,2,"maintenance rows grouped like supplied reference");
    assert.equal(d.querySelector(".estam130WorkGroup[data-summary-group=late] .estam130WorkCount").textContent,"1 việc");
    d.querySelector('[data-estam130-group=late]').click();
    assert.equal(d.querySelector(".estam130WorkGroup[data-summary-group=done]").hidden,true,"status summary filters grouped work");
    d.querySelector('[data-estam130-group=all]').click();
    assert.equal(d.querySelector(".estam130WorkGroup[data-summary-group=done]").hidden,false,"all restores grouped work");
    dom.window.close();
  }
  for(const buildingId of ["68PĐL","127HH","62THL"]){
    const {dom,d}=await fixture(buildingId,m130);
    assert.ok(d.querySelector(".estam130Overview"),"shared 130HH overview rendered: "+buildingId);
    assert.equal(d.querySelector(".estamStats .m130Kpi.estamTotal b").textContent,"20");
    assert.ok(d.querySelector("#estamNativeActions #m130Create"),"shared add action: "+buildingId);
    assert.ok(d.querySelector("#estam130Filters #m130State"),"shared filters: "+buildingId);
    const pdf=d.querySelector("#estamHeaderPdf");
    assert.ok(pdf&&!pdf.disabled,"shared PDF action: "+buildingId);
    dom.window.close();
  }
  {
    const current=new Date(),year=current.getFullYear(),month=String(current.getMonth()+1).padStart(2,"0");
    const date=year+"-"+month+"-13";
    const standard='<section class="maintenanceStats"><article><b id="maintAssetCount">1</b></article><article><b id="maintOverdueCount">0</b></article><article><b id="maintDueSoonCount">1</b></article><article><b id="maintDoneYearCount">0</b></article></section><section class="maintenanceSchedule"><div id="maintenanceMonthStrip"><button data-maint-month="'+current.getMonth()+'" >Trước</button><button class="active" data-maint-month="'+(current.getMonth()+1)+'">Tháng</button></div></section><section class="maintenanceBoard"><div class="maintenanceToolbar"><div class="inventoryToolbarActions"><div class="inventorySearch"><input id="maintenanceSearch"></div><select id="maintenanceSystemFilter"><option value="">Hệ thống</option></select><select id="maintenanceDueFilter"><option value="">Lịch</option></select></div></div><div id="maintenanceAssetGrid"></div><button id="addMaintenanceAsset">Thêm thiết bị</button></section><button id="maintenanceExportPdf">PDF</button>';
    const {dom,w,d}=await fixture("Demo",standard);
    w.maintenanceAssets=[{id:"asset1",name:"AHU tầng 1",system_type:"HVAC",next_due_date:date}];
    w.maintenanceProjectedDates=()=>[date];
    let opened=0;w.openMaintenanceRecord=()=>opened++;
    d.querySelector("[data-estam-view=calendar]").click();await wait();
    assert.ok(d.querySelector("#estamExtraView .estamDay button"),"standard calendar displays an asset");
    d.querySelector("#estamExtraView .estamDay button").click();assert.equal(opened,1);
    assert.ok(d.querySelector("#estamNativeActions #addMaintenanceAsset"));
    dom.window.close();
  }
  const scopedCss=fs.readFileSync(path.join(__dirname,"..","maintenance-130-summary.css"),"utf8");
  assert.match(scopedCss,/\[data-kind="130"\]/,"KPI redesign scoped to 130HH");
  assert.match(scopedCss,/@media\(max-width:640px\)/,"mobile layout provided");
  assert.match(scopedCss,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,"two-column mobile KPI grid");
  const layout=fs.readFileSync(path.join(__dirname,"..","maintenance-130-summary.css"),"utf8");
  assert.match(layout,/grid-template-columns:270px minmax\(0,1fr\)/,"monthly summary matches left-total/right-progress layout");
  assert.match(layout,/\.estam130WorkItems \.m130CompactRow/,"maintenance rows displayed inside grouped panels");
  assert.match(layout,/\.m130CompactRow\.m130State-late \.m130Date/,"overdue date tiles have distinct colors");

  // Explicit action-role selectors prevent linked device buttons from accidentally
  // getting the navy record button style just because they are the first child.
  for(const token of [
    ".m130EntryActions > .m130LinkedEquipment",
    ".m130EntryActions > button[data-m130-event]",
    ".m130EntryActions > button.m130Edit",
    "grid-template-columns:minmax(0,128px) minmax(0,128px) 44px",
    "height:44px!important"
  ])assert(layout.includes(token),"missing uniform row actions CSS: "+token);

  assert.match(layout,/\.estam130ExtraFilters/,"advanced filters remain reachable");
  assert.match(layout,/\.estamViewSwitch \[data-estam-view="timeline"\]/,"timeline hidden from three-option main toolbar");
  console.log("maintenance redesign smoke tests passed (4 projects / demo legacy)");
})().catch(e=>{console.error(e);process.exitCode=1;});