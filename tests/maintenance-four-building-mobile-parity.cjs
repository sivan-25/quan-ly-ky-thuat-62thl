"use strict";
/* Non-destructive real Chromium check for the approved 130HH mobile UI on all 4 projects. */
const {chromium}=require("playwright");
const PROJECTS=[
 {id:"130HH",name:"130 Hồng Hà"},
 {id:"127HH",name:"127 Hồng Hà"},
 {id:"62THL",name:"62 Trần Huy Liệu"},
 {id:"68PĐL",name:"68 Phan Đăng Lưu"}
];
const VIEWPORTS=[320,390];
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const project of PROJECTS)for(const width of VIEWPORTS){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e.message||e)));
   await page.route("**/*",route=>{
    try{if(["127.0.0.1","localhost"].includes(new URL(route.request().url()).hostname))return route.continue();}
    catch(_){}
    return route.abort();
   });
   await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
   await page.evaluate(({id})=>{
     const buildings=[
       {id:"130HH",name:"130 Hồng Hà",role:"editor"},
       {id:"127HH",name:"127 Hồng Hà",role:"editor"},
       {id:"62THL",name:"62 Trần Huy Liệu",role:"editor"},
       {id:"68PĐL",name:"68 Phan Đăng Lưu",role:"editor"}
     ];
     window.eval('centralSession={access_token:"NON-DESTRUCTIVE-FIXTURE"};');
     window.eval("currentAccount="+JSON.stringify({id:"fixture-admin",is_admin:true,buildings})+";");
     window.eval("currentBuilding="+JSON.stringify(buildings.find(b=>b.id===id))+";projectOverviewActive=true;projectOpenSeq++;");
     window.eval('sbFetch=async function(){return [];}');
     document.getElementById("login").classList.add("hide");
     document.getElementById("app").classList.remove("hide");
     window.eval("applyBuildingUI();showModule('maintenance');");
   },{id:project.id});
   await page.waitForTimeout(900);
   const stats=await page.evaluate(()=>{
     const sel=s=>document.querySelector(s);
     const page=sel("#maintenancePage"),root=sel("#estaMaintenanceRedesign");
     const summary=sel(".estam130Overview"),metrics=sel(".estam130Metrics");
     const more=sel("#estam130MobileMore");
     const create=sel("#m130Create");
     const position=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
     return {building:page?.dataset.estamBuilding,kind:root?.dataset.kind,
       appClass:sel("#app")?.className,overview:!!summary,
       grid:metrics?getComputedStyle(metrics).gridTemplateColumns:null,
       cols:metrics?getComputedStyle(metrics).gridTemplateColumns.split(" ").filter(Boolean).length:0,
       moreVisible:more?getComputedStyle(more).display!=="none"&&position(more).height>0:false,
       metricButtonCount:metrics?.querySelectorAll(".estam130Metric").length,
       create:!!create&&position(create).height>=43,
       width:document.documentElement.clientWidth,docWidth:document.documentElement.scrollWidth};
   });
   const fail=reason=>{throw Error(project.id+" "+width+"px "+reason+" "+JSON.stringify(stats).slice(0,950));};
   if(errors.length)fail("JS errors "+errors.join("; "));
   if(stats.building!==project.id||stats.kind!=="130")fail("wrong project/mobile dashboard");
   if(!stats.overview||stats.cols!==4||stats.metricButtonCount!==8)fail("not the same four-column overview as 130HH");
   if(!stats.moreVisible||!stats.create)fail("collapsed KPIs or create button not reachable");
   if(stats.docWidth>stats.width+4)fail("document horizontal overflow");
   await page.locator("#estam130MobileMore").click();
   if(await page.locator(".estam130Overview.estam130MetricsOpen").count()!==1)fail("cannot expand metrics");
   await page.locator("#estam130MobileMore").click();
   await page.locator("#m130Create").click();
   const form=await page.evaluate(()=>{
     const el=id=>document.getElementById(id);
     const r=x=>{const a=x.getBoundingClientRect();return {top:a.top,bottom:a.bottom,left:a.left,right:a.right,width:a.width,height:a.height};};
     const form=el("m130PlanForm"),overlay=el("m130Overlay");
     const layout=id=>r(el(id).closest("label"));
     return {open:!overlay.hidden,dialog:r(overlay.querySelector(".m130Dialog")),formWidth:form.clientWidth,scrollWidth:form.scrollWidth,
       sys:layout("m130System"),location:layout("m130Location"),first:layout("m130First"),cycle:layout("m130Cycle"),
       hiddenType:el("m130WorkType").type==="hidden",submit:r(form.querySelector('[type="submit"]'))};
   });
   if(!form.open||!form.hiddenType)fail("latest plan form is unavailable");
   if(form.scrollWidth>form.formWidth+4)fail("plan form scrolls horizontally");
   for(const [a,b] of [[form.sys,form.location],[form.first,form.cycle]]){
     if(Math.abs(a.top-b.top)>3||Math.abs(a.width-b.width)>3)fail("paired plan fields differ");
   }
   if(form.submit.right>width+1)fail("submit clipped horizontally");
   await context.close();
   console.log("PASS four-project approved mobile maintenance: "+project.id+" "+width+"px");
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
