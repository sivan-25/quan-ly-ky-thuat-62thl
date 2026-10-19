"use strict";
const {chromium}=require("playwright"),fs=require("node:fs"),path=require("node:path");
const sizes=[320,375,390,430],dir=path.resolve("visual-artifacts");
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of sizes){
   const context=await browser.newContext({viewport:{width,height:width===320?640:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",err=>errors.push(err.message));
   await page.route("**/*",route=>{
     try{const h=new URL(route.request().url()).hostname;if(h==="127.0.0.1"||h==="localhost")return route.continue();}catch(_){}
     return route.abort();
   });
   await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
   await page.evaluate(()=>{
     const names={"130HH":"130 Hồng Hà","127HH":"127 Hồng Hà","62THL":"62 Trần Huy Liệu","68PĐL":"68 Phan Đăng Lưu"};
     const buildings=Object.keys(names).map(id=>({id,name:names[id],role:"editor"}));
     window.eval('centralSession={access_token:"TEST-ONLY"};');
     window.eval("currentAccount="+JSON.stringify({id:"test",is_admin:true,buildings})+";");
     window.eval("currentBuilding="+JSON.stringify(buildings[0])+";projectOverviewActive=true;projectOpenSeq++;");
     window.eval('sbFetch=async function(){return [];}');
     document.getElementById("login").classList.add("hide");
     document.getElementById("app").classList.remove("hide");
     window.eval("applyBuildingUI();showModule('maintenance');");
   });
   await page.waitForTimeout(800);
   const mounted=await page.locator("#m130Create").count();
   if(!mounted)throw Error("Maintenance plan missing at width "+width);
   await page.locator("#m130Create").click();
   await page.waitForTimeout(120);
   const result=await page.evaluate(()=>{
     const overlay=document.getElementById("m130Overlay");
     const dialog=overlay.querySelector(".m130Dialog"),form=document.getElementById("m130PlanForm");
     const rect=x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
     const pair=(id1,id2)=>{
       const a=document.getElementById(id1).closest("label"),b=document.getElementById(id2).closest("label");
       return [rect(a),rect(b)];
     };
     const controls=[...form.querySelectorAll('input:not([type="hidden"]),select,textarea,button')].filter(e=>e.offsetWidth).map(e=>({id:e.id||e.textContent.trim().slice(0,35),...rect(e)}));
     const nav=document.querySelector("#app .estaBottomNav");
     return {opened:!overlay.hidden,view:overlay.dataset.m130View,width:document.documentElement.clientWidth,
       documentWidth:document.documentElement.scrollWidth,dialog:rect(dialog),form:rect(form),
       formWidth:form.clientWidth,formScrollWidth:form.scrollWidth,
       system:pair("m130System","m130Location"),cycle:pair("m130First","m130Cycle"),
       hiddenType:document.getElementById("m130WorkType").type==="hidden",
       controls,footer:rect(form.querySelector(".m130Foot")),navZ:Number(getComputedStyle(nav).zIndex),
       overlayZ:Number(getComputedStyle(overlay).zIndex)};
   });
   const fail=m=>{throw Error(width+"px: "+m+" => "+JSON.stringify(result).slice(0,1400))};
   if(errors.length)fail("browser JS errors "+errors.join("; "));
   if(!result.opened||result.view!=="plan")fail("plan did not open");
   if(result.documentWidth>result.width+3||result.formScrollWidth>result.formWidth+3)fail("horizontal scroll still exists");
   for(const pair of [result.system,result.cycle]){
     if(Math.abs(pair[0].top-pair[1].top)>3)fail("two related fields not on same row");
     if(Math.abs(pair[0].width-pair[1].width)>3)fail("two fields not equal width");
   }
   if(!result.hiddenType)fail("PM/CM still shown");
   if(result.controls.some(c=>c.right>result.dialog.right+2||c.left<result.dialog.left-2))fail("control outside modal");
   if(result.overlayZ<=result.navZ)fail("bottom navigation overlays plan");
   const before=result.footer.top;
   await page.locator("#m130PlanForm").evaluate(e=>{e.scrollTop=e.scrollHeight;});
   await page.waitForTimeout(80);
   const after=await page.locator("#m130PlanForm .m130Foot").boundingBox();
   if(!after||after.y>context._options.viewport.height+2)fail("save button inaccessible");
   await page.screenshot({path:path.join(dir,"maintenance-plan-"+width+".png")});
   console.log("PASS mobile maintenance plan "+width+"px: paired fields, no sideways movement, scroll and save reachable");
   await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
