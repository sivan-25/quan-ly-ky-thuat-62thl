"use strict";
/* Geometric audit of 130HH system rail: real Chromium, fixture only, no production writes. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const fs=require("node:fs");
const path=require("node:path");
const widths=[320,390,560,768,1024,1440];
const out=process.env.ESTA_VISUAL_DIR||"visual-artifacts";
fs.mkdirSync(out,{recursive:true});

async function setup(page){
 await page.route("**/*",route=>{
  try{const host=new URL(route.request().url()).hostname;
   if(host==="127.0.0.1"||host==="localhost")return route.continue();}catch(_){}
  return route.abort();
 });
 await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
 await page.evaluate(()=>{
  const buildings=[
   {id:"130HH",name:"130 Hồng Hà",role:"editor"},
   {id:"127HH",name:"127 Hồng Hà",role:"editor"}
  ];
  window.eval('centralSession={access_token:"LAYOUT-FIXTURE-NO-API"};');
  window.eval("currentAccount="+JSON.stringify({id:"fixture-admin",is_admin:true,buildings})+";");
  window.eval("currentBuilding="+JSON.stringify(buildings[0])+";projectOverviewActive=true;projectOpenSeq++;");
  window.eval("sbFetch=async function(){return [];}");
  document.querySelector("#login").classList.add("hide");
  document.querySelector("#app").classList.remove("hide");
  window.eval("applyBuildingUI()");
  document.getElementById("navUpdateAssets")?.click();
 });
 await page.waitForSelector("#updateAssetsPage.ueSnapshot:not(.hide) .ueRailCard",{timeout:10000});
 await page.waitForTimeout(500);
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:width<500?844:1024},deviceScaleFactor:1,hasTouch:width<=560,isMobile:width<=560,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",err=>errors.push(err.message));
   await setup(page);
   const result=await page.evaluate(()=>{
    const root=document.querySelector("#updateAssetsPage");
    const rail=root.querySelector(".ueSystemRail");
    const cards=[...rail.querySelectorAll(".ueRailCard")];
    const rounded=r=>({top:Math.round(r.top*10)/10,bottom:Math.round(r.bottom*10)/10,left:Math.round(r.left*10)/10,right:Math.round(r.right*10)/10,width:Math.round(r.width),height:Math.round(r.height)});
    const nodes=cards.map(card=>{
     const name=card.querySelector(".ueRailText b"),count=card.querySelector(".ueRailText small"),txt=card.querySelector(".ueRailText");
     const c=card.getBoundingClientRect(),b=name.getBoundingClientRect(),s=count.getBoundingClientRect();
     return {name:name.textContent,card:rounded(c),title:rounded(b),count:rounded(s),labelHeight:txt.clientHeight,labelScrollHeight:txt.scrollHeight};
    });
    return {projectScope:document.querySelector("#app").classList.contains("estaPilot130HH"),
      rootVisible:!root.classList.contains("hide"),railWidth:Math.round(rail.getBoundingClientRect().width),
      count:nodes.length,nodes,documentOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-document.documentElement.clientWidth};
   });
   assert.equal(result.rootVisible,true,"System information must be visible at "+width);
   assert.equal(result.projectScope,true,"130HH style gate must be active at "+width);
   assert.ok(result.count>=10,"Full system category menu must render at "+width);
   assert.ok(result.documentOverflow<=4,"No horizontal page scroll at "+width);
   for(const node of result.nodes){
    assert.ok(node.count.top>=node.title.bottom+1.5,
     "Overlapping title and item count at "+width+": "+node.name+" "+JSON.stringify(node));
    assert.ok(node.title.top>=node.card.top-1 && node.count.bottom<=node.card.bottom+1,
     "Text escapes category card at "+width+": "+node.name+" "+JSON.stringify(node));
    assert.ok(node.labelScrollHeight<=node.labelHeight+2,
     "Text is clipped at "+width+": "+node.name);
    assert.ok(node.card.height>=44,"Card has insufficient touch height at "+width+": "+node.name);
   }
   assert.equal(errors.length,0,"No JavaScript errors at "+width+": "+errors.join("; "));
   await page.locator(".ueSystemRail").screenshot({path:path.join(out,"130hh-system-rail-"+width+".png")});
   console.log("PASS 130HH system rail "+width+"px: "+result.count+" categories, no overlaps/clipping/overflow");
   await context.close();
  }
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
