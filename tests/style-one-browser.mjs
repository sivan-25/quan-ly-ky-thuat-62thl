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
  const mobileChoices=await page.locator("#workChoices-type").isVisible().catch(()=>false);
  if(mobileChoices){
    await page.locator('#workChoices-type [data-value="Hằng ngày"]').click();
    await page.locator('#workChoices-status [data-value="Đang thực hiện"]').click();
  }else{
    await page.selectOption("#type","Hằng ngày");
    await page.selectOption("#status","Đang thực hiện");
  }
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
  const noteToggle=page.locator("#energyNoteToggle");
  if(await noteToggle.isVisible().catch(()=>false))await noteToggle.click();
  await page.fill("#energyNote","QA nhập chỉ số điện");
  await page.locator("#energySaveBtn").evaluate(el=>el.scrollIntoView({block:"center",behavior:"instant"}));
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
async function exerciseMobileMenu(page,label){
  if((await page.viewportSize()).width>760)return;

  const dock=await page.locator("#updateMobileNav").evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {bottom:r.bottom,left:r.left,right:r.right,width:r.width,innerHeight:innerHeight,innerWidth:innerWidth,display:getComputedStyle(el).display};
  });
  if(dock.display==="none")throw new Error("Mobile bottom navigation is unexpectedly hidden");
  if(Math.abs(dock.innerHeight-dock.bottom)>1)throw new Error("Mobile bottom navigation is not flush with viewport bottom: "+JSON.stringify(dock));
  if(dock.left>1||Math.abs(dock.innerWidth-dock.right)>1)throw new Error("Mobile bottom navigation is not edge-to-edge: "+JSON.stringify(dock));
  const dockVisual=await page.locator("#updateMobileNav").evaluate(el=>{
    const cs=getComputedStyle(el);
    const active=el.querySelector("button.active");
    const acs=active?getComputedStyle(active):null;
    return {
      backgroundImage:cs.backgroundImage,
      backgroundColor:cs.backgroundColor,
      activeBackgroundImage:acs?.backgroundImage||"",
      activeBackgroundColor:acs?.backgroundColor||""
    };
  });
  const parseRgb=value=>{const nums=String(value||"").match(/[0-9]+/g);return nums&&nums.length>=3?nums.slice(0,3).map(Number):null};
  const dockRgb=parseRgb(dockVisual.backgroundColor);
  const dockIsDark=!!dockRgb&&((dockRgb[0]+dockRgb[1]+dockRgb[2])/3)<130;
  if(!dockIsDark&&!/linear-gradient/i.test(dockVisual.backgroundImage))throw new Error("Mobile bottom navigation lacks distinct dark enterprise contrast: "+JSON.stringify(dockVisual));
  const activeRgb=parseRgb(dockVisual.activeBackgroundColor);
  const activeHasFill=(!!activeRgb&&dockVisual.activeBackgroundColor!=="rgba(0, 0, 0, 0)")||/linear-gradient/i.test(dockVisual.activeBackgroundImage);
  if(!activeHasFill)throw new Error("Active mobile navigation item lacks visual contrast");

  await page.click("#menu");
  const state=await page.evaluate(()=> {
    const sidebar=document.querySelector("#mobileSidebar");
    const logout=document.querySelector("#logout");
    const dock=document.querySelector("#updateMobileNav");
    const r=logout?.getBoundingClientRect();
    return {
      expanded:document.querySelector("#menu")?.getAttribute("aria-expanded"),
      open:sidebar?.classList.contains("open"),
      hidden:document.querySelector("#menuBackdrop")?.hidden,
      dockDisplay:dock?getComputedStyle(dock).display:"",
      logoutDisplay:logout?getComputedStyle(logout).display:"",
      logoutRect:r?{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}:null,
      innerHeight:innerHeight,
      innerWidth:innerWidth
    };
  });
  if(state.expanded!=="true"||!state.open||state.hidden)throw new Error("Mobile sidebar did not open correctly");
  if(state.dockDisplay!=="none")throw new Error("Bottom navigation must hide while mobile sidebar is open");
  if(!state.logoutRect||state.logoutDisplay==="none"||state.logoutRect.height<30)throw new Error("Logout control is not visible in mobile sidebar");
  if(state.logoutRect.top<0||state.logoutRect.bottom>state.innerHeight+1)throw new Error("Logout control is outside the mobile viewport: "+JSON.stringify(state.logoutRect));
  await page.screenshot({path:`${outDir}/${label}-sidebar.png`,fullPage:false});

  await page.click("#sidebarClose");
  const closed=await page.locator("#mobileSidebar").evaluate(el=>!el.classList.contains("open"));
  if(!closed)throw new Error("Mobile sidebar did not close");
}

async function exerciseDesktopPerformance(page,label){
  if((await page.viewportSize()).width<1200)return;
  const perf=await page.evaluate(async()=>{
    const routes=["energy","inventory","maintenance","contractor"];
    const samples=[];
    for(let round=0;round<3;round++){
      for(const route of routes){
        const t0=performance.now();
        showModule(route);
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        samples.push(performance.now()-t0);
      }
      const t0=performance.now();
      showHome();
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      samples.push(performance.now()-t0);
    }
    return {
      max:Math.max(...samples),
      avg:samples.reduce((a,b)=>a+b,0)/samples.length,
      samples
    };
  });
  if(perf.max>1200||perf.avg>500)throw new Error("Desktop route performance regression: "+JSON.stringify(perf));
  console.log("PASS",label,"desktop-route-performance",JSON.stringify({max:Math.round(perf.max),avg:Math.round(perf.avg)}));
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
    await exerciseMobileMenu(page,viewport.name);
    await exerciseWork(page);
    await exerciseEnergy(page);
    await exerciseInventory(page);
    await exerciseMaintenance(page);
    await exerciseContractor(page);
    await exerciseSpecial(page);
    await exerciseDesktopPerformance(page,viewport.name);
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
