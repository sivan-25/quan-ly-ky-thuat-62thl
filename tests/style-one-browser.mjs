import { chromium } from "playwright";
import fs from "node:fs";

const base="http://127.0.0.1:4173";
const outDir="artifacts/style-one-browser";
fs.mkdirSync(outDir,{recursive:true});

const viewports=[
  {name:"mobile-360",width:360,height:800},
  {name:"mobile-390",width:390,height:844},
  {name:"tablet-768",width:768,height:1024},
  {name:"desktop-1440",width:1440,height:1000}
];

const browser=await chromium.launch({headless:true});
let failures=[];

function cleanConsoleMessage(text){
  return !/favicon|ERR_ABORTED|Failed to load resource|net::ERR/i.test(text);
}
async function assertNoOverflow(page,label){
  const metrics=await page.evaluate(()=>({
    innerWidth:window.innerWidth,
    scrollWidth:document.documentElement.scrollWidth,
    bodyScrollWidth:document.body.scrollWidth
  }));
  if(metrics.scrollWidth>metrics.innerWidth+2||metrics.bodyScrollWidth>metrics.innerWidth+2){
    throw new Error(label+" horizontal overflow: "+JSON.stringify(metrics));
  }
}
async function setupProject(page){
  await page.goto(base,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForTimeout(350);
  await page.evaluate(()=>{
    localStorage.clear();
    sessionStorage.clear();
    currentAccount={
      is_admin:true,
      username:"qa-admin",
      display_name:"QA Admin",
      buildings:[{id:"127HH",name:"127 Hồng Hà",role:"admin"}]
    };
    centralSession=null;
    me="qa-admin";
    document.querySelector("#login")?.classList.add("hide");
    document.querySelector("#app")?.classList.remove("hide");
    prepareProjectContext({id:"127HH",name:"127 Hồng Hà",role:"admin"});
    projectPeople=[{id:"qa-person",name:"Kỹ thuật QA"}];
    renderAllPeopleSelectors();
    showHome();
    applyBuildingUI();
  });
  await page.waitForTimeout(250);
  const pilot=await page.locator("#app").evaluate(el=>el.classList.contains("styleOnePilot"));
  if(!pilot)throw new Error("Style 1 was not enabled for 127HH");
}
async function switchModule(page,name,id){
  await page.evaluate(moduleName=>showModule(moduleName),name);
  await page.waitForTimeout(120);
  const visible=await page.locator(id).evaluate(el=>!el.classList.contains("hide"));
  if(!visible)throw new Error(name+" page did not become visible");
  await assertNoOverflow(page,name);
}
async function exerciseWork(page){
  await switchModule(page,"work","#workPage");
  await page.fill("#content","QA Style 1 - kiểm tra thao tác người dùng");
  await page.fill("#date","2026-10-06");
  await page.selectOption("#type","Hằng ngày");
  await page.selectOption("#status","Đang thực hiện");
  await page.evaluate(()=>setPeopleSelected("task",["Kỹ thuật QA"]));
  await page.click("#saveBtn");
  await page.waitForTimeout(180);
  const count=await page.evaluate(()=>load().length);
  if(count!==1)throw new Error("Work save did not persist in local QA session");
  const rendered=await page.locator("#tbody").innerText();
  if(!rendered.includes("QA Style 1"))throw new Error("Saved work did not render");
}
async function exerciseEnergy(page){
  await switchModule(page,"energy","#energyPage");
  await page.fill("#energyDate","2026-10-06");
  await page.fill("#energyValue","12345");
  await page.evaluate(()=>setPeopleSelected("energy",["Kỹ thuật QA"]));
  await page.click("#energyNoteToggle");
  await page.fill("#energyNote","QA nhập chỉ số điện");
  await page.click("#energySaveBtn");
  await page.waitForTimeout(160);
  const n=await page.evaluate(()=>energyLoad().filter(x=>x.type==="electric").length);
  if(n!==1)throw new Error("Energy save did not persist in local QA session");
}
async function exerciseInventory(page){
  await switchModule(page,"inventory","#inventoryPage");
  const tools=page.locator('[data-inventory-tab="tools"]');
  await tools.click();
  await page.waitForTimeout(100);
  const toolsVisible=await page.locator("#inventoryToolsPane").evaluate(el=>!el.classList.contains("hide"));
  if(!toolsVisible)throw new Error("Tools tab did not open");
  await page.locator('[data-inventory-tab="materials"]').click();
}
async function exerciseMaintenance(page){
  await switchModule(page,"maintenance","#maintenancePage");
  await page.click("#addMaintenanceAsset");
  await page.waitForTimeout(80);
  const modal=page.locator("#maintenanceAssetModal");
  if(await modal.evaluate(el=>el.classList.contains("hide")))throw new Error("Maintenance add modal did not open");
  await page.evaluate(()=>document.querySelector("#maintenanceAssetModal")?.classList.add("hide"));
}
async function exerciseContractor(page){
  await switchModule(page,"contractor","#contractorPage");
  await page.click("#addContractorBtn");
  await page.waitForTimeout(80);
  if(await page.locator("#contractorModal").evaluate(el=>el.classList.contains("hide")))throw new Error("Contractor modal did not open");
  await page.click("#closeContractorModal");
}
async function exerciseConstruction(page){
  await switchModule(page,"construction","#constructionMaterialPage");
  await page.click("#addConstructionMaterialBtn");
  await page.waitForTimeout(80);
  if(await page.locator("#constructionMaterialModal").evaluate(el=>el.classList.contains("hide")))throw new Error("Construction material modal did not open");
  await page.click("#closeConstructionMaterialModal");
}
async function exerciseSpecial(page){
  await switchModule(page,"incident","#incidentPage");
  await page.click("#demoIncidentAdd");
  await page.waitForTimeout(80);
  if(await page.locator("#demoIncidentModal").evaluate(el=>el.classList.contains("hide")))throw new Error("Incident modal did not open");
  await page.locator(".demoIncidentModalClose").click();

  await switchModule(page,"inspection","#inspectionPage");
  await page.click("#demoInspectionAdd");
  await page.waitForTimeout(80);
  if(await page.locator("#demoChecklistModal").evaluate(el=>el.classList.contains("hide")))throw new Error("Inspection modal did not open");
  await page.locator(".demoChecklistModalClose").click();

  await switchModule(page,"documents","#documentsPage");
  await assertNoOverflow(page,"documents");

  await switchModule(page,"reports","#reportsPage");
  await page.locator('[data-demo-report-range="week"]').click();
  await page.waitForTimeout(80);
}
async function exerciseMobileMenu(page){
  if((await page.viewportSize()).width>760)return;
  await page.click("#menu");
  const state=await page.evaluate(()=>({
    expanded:document.querySelector("#menu")?.getAttribute("aria-expanded"),
    open:document.querySelector("#mobileSidebar")?.classList.contains("open"),
    hidden:document.querySelector("#menuBackdrop")?.hidden
  }));
  if(state.expanded!=="true"||!state.open||state.hidden)throw new Error("Mobile sidebar did not open correctly");
  await page.click("#sidebarClose");
  const closed=await page.locator("#mobileSidebar").evaluate(el=>!el.classList.contains("open"));
  if(!closed)throw new Error("Mobile sidebar did not close");
}

for(const viewport of viewports){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:"reduce"});
  const page=await context.newPage();
  page.setDefaultTimeout(6000);
  page.setDefaultNavigationTimeout(12000);
  const browserErrors=[];
  page.on("pageerror",err=>browserErrors.push("pageerror: "+err.message));
  page.on("console",msg=>{
    if(msg.type()==="error"&&cleanConsoleMessage(msg.text()))browserErrors.push("console: "+msg.text());
  });

  await page.route("https://fonts.googleapis.com/**",route=>route.fulfill({status:200,contentType:"text/css",body:""}));
  await page.route("https://fonts.gstatic.com/**",route=>route.abort());
  await page.route("https://cdn.jsdelivr.net/**",route=>route.fulfill({status:200,contentType:"application/javascript",body:""}));
  await page.route("https://upcjcrycahdfroxggsdz.supabase.co/**",route=>{
    const url=route.request().url();
    if(url.includes("/auth/v1/token"))return route.fulfill({status:401,contentType:"application/json",body:'{"error":"qa_no_auth"}'});
    return route.fulfill({status:200,contentType:"application/json",body:"[]"});
  });

  try{
    await setupProject(page);
    await assertNoOverflow(page,viewport.name+" home");
    await exerciseMobileMenu(page);
    await exerciseWork(page);
    await exerciseEnergy(page);
    await exerciseInventory(page);
    await exerciseMaintenance(page);
    await exerciseContractor(page);
    await exerciseConstruction(page);
    await exerciseSpecial(page);
    await page.evaluate(()=>showHome());
    await page.waitForTimeout(100);
    await assertNoOverflow(page,viewport.name+" final-home");
    await page.screenshot({path:`${outDir}/${viewport.name}.png`,fullPage:true});

    if(browserErrors.length)throw new Error("Browser errors: "+browserErrors.join(" | "));
    console.log("PASS",viewport.name,"user-flow");
  }catch(error){
    failures.push(viewport.name+": "+error.message);
    await page.screenshot({path:`${outDir}/${viewport.name}-failure.png`,fullPage:true}).catch(()=>{});
    console.error("FAIL",viewport.name,error);
  }finally{
    await context.close();
  }
}

await browser.close();
if(failures.length){
  console.error("\nStyle 1 browser QA failed:\n"+failures.join("\n"));
  process.exit(1);
}
console.log("PASS Style 1 browser QA: user flows and overflow checks at 360/390/768/1440.");
