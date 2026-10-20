"use strict";
/* Isolated Chromium viewport audit — fixtures only, no real data writes. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const profile=html.slice(html.indexOf('<div id="contractorModal"'),html.indexOf('<div id="contractorJobModal"'));
const job=html.slice(html.indexOf('<div id="contractorJobModal"'),html.indexOf('<div id="maintenanceAssetModal"'));
assert.ok(profile.includes('id="contractorForm"'),"Profile modal missing");
assert.ok(job.includes('id="contractorJobForm"'),"Work modal missing");
async function main(){
  const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  try{
    for(const width of [320,375,390,430]){
      const page=await browser.newPage({viewport:{width,height:812},deviceScaleFactor:1,isMobile:true,hasTouch:true});
      try{
        await page.goto("http://127.0.0.1:8766/",{waitUntil:"domcontentloaded",timeout:30000});
        await page.setContent('<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width,initial-scale=1">'+
          '<link rel="stylesheet" href="/style.css">'+
          '<link rel="stylesheet" href="/contractor.css">'+
          '<link rel="stylesheet" href="/esta-mobile.css">'+
          '<link rel="stylesheet" href="/contractor-profile-form-mobile.css">'+
          '<link rel="stylesheet" href="/contractor-job-mobile-130.css">'+
          '</head><body><div id="app" class="contractorMode"><nav class="estaBottomNav"><button>Hôm nay</button></nav></div>'+
          profile+job+'</body></html>',{waitUntil:"load"});
        await page.evaluate(()=>document.getElementById("contractorModal").classList.remove("hide"));
        const geo=await page.evaluate(()=>{
          function rect(q){
            const r=document.querySelector(q).getBoundingClientRect();
            return {x:r.left,y:r.top,w:r.width,h:r.height,right:r.right,bottom:r.bottom};
          }
          return {
            screen:{w:innerWidth,h:innerHeight},
            phone:rect("#contractorPhone"),contact:rect("#contractorContactName"),
            startShell:rect(".contractorStartField .contractorProfileDateShell"),
            endShell:rect(".contractorEndField .contractorProfileDateShell"),
            save:rect("#saveContractorProfile"),
            modal:rect("#contractorModal .contractorModalCard"),
            navDisplay:getComputedStyle(document.querySelector(".estaBottomNav")).display
          };
        });
        assert.ok(geo.modal.w>=width-25,"modal narrow at "+width+": "+JSON.stringify(geo));
        assert.ok(geo.save.w>70&&geo.save.bottom<=geo.screen.h+1,"save obscured at "+width+": "+JSON.stringify(geo));
        assert.ok(geo.phone.x<geo.contact.x&&Math.abs(geo.phone.y-geo.contact.y)<=2,"contact not paired at "+width);
        assert.ok(Math.abs(geo.phone.w-geo.contact.w)<=3,"contact unequal width at "+width);
        assert.ok(geo.startShell.x<geo.endShell.x&&Math.abs(geo.startShell.y-geo.endShell.y)<=2,"dates not paired at "+width);
        assert.ok(Math.abs(geo.startShell.w-geo.endShell.w)<=3,"date fields unequal width at "+width);
        assert.ok(geo.endShell.right<=geo.screen.w-4,"date overflow at "+width);
        assert.equal(geo.navDisplay,"none","mobile nav not hidden at "+width);
        await page.evaluate(()=>{
          document.getElementById("contractorModal").classList.add("hide");
          document.getElementById("contractorJobModal").classList.remove("hide");
        });
        const work=await page.evaluate(()=>{
          const ids=["contractorJobDate","contractorJobCompletedDate","contractorJobContent","contractorJobSaveBtn"];
          return Object.fromEntries(ids.map(id=>{
            const r=document.getElementById(id).getBoundingClientRect();
            return [id,{x:r.x,y:r.y,w:r.width,right:r.right,bottom:r.bottom}];
          }));
        });
        assert.ok(work.contractorJobDate.x<work.contractorJobCompletedDate.x,"job dates not paired at "+width);
        assert.ok(work.contractorJobContent.w>=width-50,"job content narrow at "+width);
        assert.ok(work.contractorJobSaveBtn.bottom<=812,"job confirm hidden at "+width);
        console.log("PASS viewport",width,"profile+work modal geometry");
      }finally{await page.close()}
    }
  }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
