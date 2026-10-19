const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM}=require("jsdom");
const base=path.join(__dirname,"..");
const source=fs.readFileSync(path.join(base,"maintenance-redesign.js"),"utf8");
const css=fs.readFileSync(path.join(base,"maintenance-130-mobile.css"),"utf8");
const html=fs.readFileSync(path.join(base,"index.html"),"utf8");
new Function(source);

assert.ok(html.includes("maintenance-130-mobile.css?v="),"mobile pilot stylesheet is linked");
assert.ok(css.includes("@media (max-width:640px)"),"pilot uses a mobile breakpoint");
assert.ok(css.includes('[data-estam-building="130HH"]'),"pilot is scoped to 130HH");
assert.ok(css.includes("grid-template-columns:repeat(4,minmax(0,1fr))"),"four KPIs per mobile row");
assert.ok(css.includes(".estam130Overview:not(.estam130MetricsOpen)"),"secondary KPIs remain expandable");
assert.ok(css.includes("height:44px!important;min-height:44px!important"),"main tap targets are 44px");
assert.ok(!css.includes(String.fromCharCode(92)+"n@media"),"CSS media rule has no escaped newline");
assert.ok(html.includes("maintenance-130-mobile.css?v=20261019-130hh-touch02"),"PWA receives refreshed maintenance stylesheet");
const touchScope='#app.estaFourProjectCompact.maintenanceMode #maintenancePage[data-estam-building="130HH"]';
const mobileRules=css.slice(css.indexOf("/* Reclaim width without undersized"));
assert.ok(mobileRules.includes(touchScope),"row touch rules only apply to 130HH");
assert.ok(mobileRules.includes("width:min(100%,284px)!important"),"linked action row must fit narrow phones");
assert.ok(mobileRules.includes("width:min(100%,168px)!important"),"unlinked action row stays compact");
assert.ok(mobileRules.includes("height:44px!important;min-height:44px!important;max-height:44px!important"),"row buttons remain easy to touch");
assert.ok(mobileRules.includes("width:44px!important;min-width:44px!important;height:44px!important"),"edit button has a full 44px square");
assert.ok(mobileRules.includes(".m130CardFoot > button"),"card mode actions are covered");
assert.ok(css.includes("min-height:44px;padding:4px 8px"),"secondary KPI disclosure remains touch friendly");

const wait=()=>new Promise(resolve=>setTimeout(resolve,20));
async function mount(building){
  const internal='<section id="maint130"><div id="m130Stats" class="m130Stats"><div class="m130Kpi late"><b>11</b></div></div>'+
  '<div id="m130Cal"><div id="m130Year">2026</div><div id="m130Months"><button class="sel" data-m130-month="10">10</button></div></div>'+
  '<div class="m130Toolbar"><input id="m130Search"><select id="m130Group"></select><select id="m130State"></select><select id="m130PriorityFilter"></select><select id="m130TypeFilter"></select><select id="m130TechnicianFilter"></select><select id="m130SampleFilter"></select></div>'+
  '<div class="m130ListTop"><div class="m130Heading"><span id="m130ListCount">20 / 20</span></div><div class="m130ListTools"><button id="m130Create">Thêm bảo trì</button></div></div>'+
  '<div id="m130List"></div><button data-m130-layout="list"></button><button data-m130-layout="calendar"></button><button data-m130-view="rows"></button><button data-m130-view="cards"></button><button id="m130Pdf"></button></section>';
  const dom=new JSDOM('<!doctype html><html><body><div id="app" class="maintenanceMode estaFourProjectCompact"><div class="estaTopbar"><div class="headerTools"></div></div><div id="maintenancePage" class="maintenancePage"><div class="maintenanceHero"></div>'+internal+'</div></div></body></html>',{runScripts:"outside-only",url:"https://esta.local"});
  const w=dom.window;
  w.document.getElementById("m130Stats").dataset.monthOverview=JSON.stringify({
    total:20,counts:{late:11,today:0,week:5,later:1,review:0,done:3,paused:0},onTime:"0%"
  });
  w.currentBuilding={id:building};
  w.eval(source);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  await wait();
  return {dom,d:w.document};
}
(async()=>{
  const {dom,d}=await mount("130HH");
  assert.equal(d.querySelector("#maintenancePage").dataset.estamBuilding,"130HH");
  assert.equal(d.querySelectorAll(".estam130Metric[data-estam130-group]").length,8,"all counts kept");
  const more=d.querySelector("#estam130MobileMore");
  assert.ok(more,"expand metrics control exists");
  assert.equal(more.getAttribute("aria-expanded"),"false");
  more.click();
  assert.equal(more.getAttribute("aria-expanded"),"true");
  assert.ok(d.querySelector(".estam130Overview").classList.contains("estam130MetricsOpen"));
  assert.equal(d.querySelector(".estam130OnTime b").textContent,"0%","on-time KPI preserved");
  more.click();
  assert.equal(more.getAttribute("aria-expanded"),"false");
  assert.equal(d.querySelector(".estam130Overview").classList.contains("estam130MetricsOpen"),false);
  assert.ok(d.querySelector("#estamNativeFilters #m130Search"),"search preserved");
  assert.ok(d.querySelector("#estam130Filters #m130State"),"advanced filter preserved");
  assert.ok(d.querySelector("#estamNativeActions #m130Create"),"create preserved");
  dom.window.close();

  for(const building of ["127HH","62THL","68PĐL"]){
    const other=await mount(building);
    assert.equal(other.d.querySelector("#maintenancePage").dataset.estamBuilding,building);
    assert.ok(other.d.querySelector(".estam130Metric"),"other project keeps existing overview");
    other.dom.window.close();
  }
  console.log("130HH mobile KPI expansion, project isolation and controls passed.");
})().catch(error=>{console.error(error);process.exitCode=1;});
