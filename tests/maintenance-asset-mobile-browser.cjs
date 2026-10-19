"use strict";
/* Chromium geometry smoke test for the real ESTA asset modal; never talks to Supabase. */
const {chromium}=require("playwright");
const fs=require("node:fs");
const path=require("node:path");
const out=path.resolve("visual-artifacts");
fs.mkdirSync(out,{recursive:true});
const widths=[{width:320,height:568},{width:375,height:667},{width:390,height:844},{width:430,height:932}];
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of widths){
   const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:true,hasTouch:true});
   const page=await context.newPage();
   await page.route("**/*",route=>{
     try{
       const host=new URL(route.request().url()).hostname;
       if(host==="127.0.0.1"||host==="localhost")return route.continue();
     }catch(_){}
     return route.abort();
   });
   await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
   await page.evaluate(()=>{
     document.getElementById("login")?.classList.add("hide");
     const app=document.getElementById("app");
     app?.classList.remove("hide");app?.classList.add("maintenanceMode");
     document.getElementById("maintenanceAssetModal")?.classList.remove("hide");
   });
   await page.waitForTimeout(200);
   const initial=await page.evaluate(()=>{
     const modal=document.getElementById("maintenanceAssetModal"),
       card=modal?.querySelector(".maintenanceModalCard"),
       fields=modal?.querySelector(".maintenanceAssetFields"),
       footer=modal?.querySelector(".inventoryFormActions"),
       save=footer?.querySelector('button[type="submit"]'),
       cancel=footer?.querySelector("#cancelMaintenanceAssetModal"),
       last=document.getElementById("maintenanceLastDate"),
       next=document.getElementById("maintenanceNextDate");
     if(!modal||!card||!fields||!footer||!save||!cancel||!last||!next)throw Error("missing asset modal pieces");
     const r=e=>{const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height}};
     const dates=[last,next].map(r);
     const controls=[...fields.querySelectorAll('input:not([type="hidden"]),select')].map(el=>({id:el.id,...r(el)}));
     const dock=document.querySelector("#app .estaBottomNav");
     return {modal:r(modal),card:r(card),fields:r(fields),footer:r(footer),save:r(save),cancel:r(cancel),
       controls,dates,scrollWidth:fields.scrollWidth,clientWidth:fields.clientWidth,
       scrollHeight:fields.scrollHeight,clientHeight:fields.clientHeight,
       backdropZ:Number(getComputedStyle(modal).zIndex),
       dockZ:dock?Number(getComputedStyle(dock).zIndex):0,
       documentWidth:document.documentElement.scrollWidth,
       viewportWidth:document.documentElement.clientWidth,
       nativeSubmit:save.form?.id==="maintenanceAssetForm",
       readOnlyNext:next.readOnly,
       hiddenFooter:getComputedStyle(footer).display==="none"};
   });
   const fail=(msg)=>{throw Error(viewport.width+"px: "+msg+"; "+JSON.stringify(initial).slice(0,1600));};
   if(initial.hiddenFooter||!initial.nativeSubmit||!initial.readOnlyNext)fail("save action not usable");
   if(initial.backdropZ<=initial.dockZ)fail("bottom navigation obscures modal");
   if(initial.footer.bottom>viewport.height+1||initial.footer.top<initial.card.top-1)fail("footer outside viewport");
   if(initial.save.height<47||initial.cancel.height<47)fail("touch targets too small");
   if(initial.fields.bottom>initial.footer.top+2)fail("fields cover fixed actions");
   if(initial.scrollWidth>initial.clientWidth+3)fail("fields overflow horizontally");
   if(initial.documentWidth>initial.viewportWidth+4)fail("document overflows horizontally");
   if(Math.abs(initial.dates[0].height-initial.dates[1].height)>1)fail("date controls unequal height");
   if(initial.controls.some(c=>c.right>initial.fields.right+2||c.left<initial.fields.left-2))fail("a field exceeds its grid track");
   await page.evaluate(()=>{
      const fields=document.querySelector("#maintenanceAssetModal .maintenanceAssetFields");
      fields.scrollTop=fields.scrollHeight;
   });
   await page.waitForTimeout(80);
   const after=await page.evaluate(()=>{
     const f=document.querySelector("#maintenanceAssetModal .inventoryFormActions").getBoundingClientRect();
     const fields=document.querySelector("#maintenanceAssetModal .maintenanceAssetFields");
     return {footerTop:f.top,scrollTop:fields.scrollTop,scrollHeight:fields.scrollHeight,clientHeight:fields.clientHeight};
   });
   if(Math.abs(after.footerTop-initial.footer.top)>1)fail("save bar moves with scrolled fields");
   if(after.scrollHeight>after.clientHeight+3&&after.scrollTop<1)fail("scroll area stuck; user cannot reach notes");
   await page.screenshot({path:path.join(out,"maintenance-asset-modal-"+viewport.width+".png")});
   console.log("PASS 130HH asset modal mobile "+viewport.width+"px: fixed save bar, scrollable fields, equal dates, no horizontal clipping");
   await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
