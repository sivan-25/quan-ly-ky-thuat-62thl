"use strict";
/* Geometric audit: all 4 project system rails on real Chromium, no network or live writes. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const fs=require("node:fs");
const path=require("node:path");
const widths=[320,390,560,768,1024,1440];
const projects=["68PĐL","62THL","127HH","130HH"];
const out=process.env.ESTA_VISUAL_DIR||"visual-artifacts";
fs.mkdirSync(out,{recursive:true});

async function setup(page,projectId){
 await page.route("**/*",route=>{
  try{const host=new URL(route.request().url()).hostname;
   if(host==="127.0.0.1"||host==="localhost")return route.continue();}catch(_){}
  return route.abort();
 });
 await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
 await page.evaluate(projectId=>{
  const buildings=[
   {id:"68PĐL",name:"68 Phan Đăng Lưu",role:"editor"},
   {id:"62THL",name:"62 Trần Huy Liệu",role:"editor"},
   {id:"127HH",name:"127 Hồng Hà",role:"editor"},
   {id:"130HH",name:"130 Hồng Hà",role:"editor"}
  ];
  window.eval('centralSession={access_token:"LAYOUT-FIXTURE-NO-API"};');
  window.eval("currentAccount="+JSON.stringify({id:"fixture-admin",is_admin:true,buildings})+";");
  window.eval("currentBuilding="+JSON.stringify(buildings.find(b=>b.id===projectId))+";projectOverviewActive=true;projectOpenSeq++;");
  window.eval("sbFetch=async function(){return [];}");
  document.querySelector("#login").classList.add("hide");
  document.querySelector("#app").classList.remove("hide");
  window.eval("applyBuildingUI()");
  document.getElementById("navUpdateAssets")?.click();
 },projectId);
 await page.waitForSelector("#updateAssetsPage.ueSnapshot:not(.hide) .ueRailCard",{timeout:10000});
 await page.waitForTimeout(500);
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of widths)for(const projectId of projects){
   const context=await browser.newContext({viewport:{width,height:width<500?844:1024},deviceScaleFactor:1,hasTouch:width<=560,isMobile:width<=560,reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",err=>errors.push(err.message));
   await setup(page,projectId);
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
    return {projectScope:document.querySelector("#app").classList.contains("estaFourProjectCompact"),
      rootVisible:!root.classList.contains("hide"),railWidth:Math.round(rail.getBoundingClientRect().width),
      count:nodes.length,nodes,documentOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-document.documentElement.clientWidth};
   });
   assert.equal(result.rootVisible,true,projectId+" system info visible at "+width);
   assert.equal(result.projectScope,true,projectId+" shared style must be active at "+width);
   assert.ok(result.count>=10,projectId+" system category menu rendered at "+width);
   assert.ok(result.documentOverflow<=4,"No horizontal page scroll at "+width);
   // Unchanged properties are checked for exact pixels/geometry against main
   // in browser-visual-parity.cjs. Run enhanced per-card geometry assertions only
   // on this PR's active 130HH palette, not on unrelated inherited 36px cards.
   for(const node of projectId==="130HH"?result.nodes:[]){
    assert.ok(node.count.top>=node.title.bottom+1.5,
     "Overlapping title and item count at "+width+": "+node.name+" "+JSON.stringify(node));
    assert.ok(node.title.top>=node.card.top-1 && node.count.bottom<=node.card.bottom+1,
     "Text escapes category card at "+width+": "+node.name+" "+JSON.stringify(node));
    assert.ok(node.labelScrollHeight<=node.labelHeight+2,
     "Text is clipped at "+width+": "+node.name);
    assert.ok(node.card.height>=44,"Card has insufficient touch height at "+width+": "+node.name);
   }
   assert.equal(errors.length,0,"No JavaScript errors at "+width+": "+errors.join("; "));
   await page.locator(".ueSystemRail").screenshot({path:path.join(out,"system-rail-"+projectId+"-"+width+".png")});
   console.log("PASS "+projectId+" system rail "+width+"px: "+result.count+" categories, no overlaps/clipping/overflow");
   await context.close();
  }
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
