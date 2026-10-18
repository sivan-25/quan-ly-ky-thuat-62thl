"use strict";
/* Read-only mobile audit: real Chromium layout, isolated fixture, no live APIs. */
const {chromium}=require("playwright"),fs=require("node:fs"),path=require("node:path");
const widths=[320,360,390,430,768];
const projects=["68PĐL","62THL","127HH","130HH"];
const modules=["work","energy","inventory","maintenance","assets"];
const results=[];
const root=process.env.ESTA_MOBILE_AUDIT_DIR||"mobile-audit";
fs.mkdirSync(root,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fixture(page,building,module){
 await page.evaluate(({building,module})=>{
  const names={"68PĐL":"68 Phan Đăng Lưu","62THL":"62 Trần Huy Liệu","127HH":"127 Hồng Hà","130HH":"130 Hồng Hà"};
  const buildings=Object.keys(names).map(id=>({id,name:names[id],role:"editor"}));
  const data=[{id:1001,d:"2026-10-18",c:"Kiểm tra bơm và hệ thống kỹ thuật",t:"Bảo trì",s:"Đang thực hiện",n:"Tình huống giả lập",a:"Văn",imgs:[]}];
  window.eval('centralSession={access_token:"FIXTURE-NO-REAL-API"};');
  window.eval("currentAccount="+JSON.stringify({id:"fixture-admin",is_admin:true,buildings})+";");
  window.eval("currentBuilding="+JSON.stringify(buildings.find(b=>b.id===building))+";projectOverviewActive=true;projectOpenSeq++;");
  window.eval("sbFetch=async function(url){if(String(url).includes('admin-overview'))return {rows:[],activity:[]};return [];} ");
  for(const b of buildings)window.localStorage.setItem(b.id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+b.id,JSON.stringify(data));
  document.querySelector("#login").classList.add("hide");
  document.querySelector("#app").classList.remove("hide");
  window.eval("applyBuildingUI()");
  if(module==="assets"){
   document.getElementById("navUpdateAssets")?.click();
  }else window.eval("showModule("+JSON.stringify(module)+")");
 },{building,module});
}
async function run(browser,project,module,width){
 const context=await browser.newContext({viewport:{width,height:width<500?844:1024},deviceScaleFactor:1,isMobile:width<=430,hasTouch:true,reducedMotion:"reduce"});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message||e).slice(0,180)));
 await page.route("**/*",route=>{
  try{const host=new URL(route.request().url()).hostname;if(host==="127.0.0.1"||host==="localhost")return route.continue();}
  catch(_){}
  return route.abort();
 });
 await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
 await sleep(300);
 await fixture(page,project,module);
 await sleep(650);
 const audit=await page.evaluate(({module})=>{
  const visible=el=>{
   if(!el)return false;
   const s=getComputedStyle(el),b=el.getBoundingClientRect();
   return s.display!=="none"&&s.visibility!=="hidden"&&Number(s.opacity)>0&&b.width>0&&b.height>0&&!el.closest("[hidden],.hide");
  };
  const vp=document.documentElement.clientWidth;
  const pageId=module==="assets"?"updateAssetsPage":module+"Page",container=document.getElementById(pageId);
  const docOverflow=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-vp;
  const tooWide=[],small=[];
  if(container){
   const targets=container.querySelectorAll("button,input,select,textarea,[role=button],.m130CalendarDay");
   for(const el of targets){
    if(!visible(el)||el.disabled||el.getAttribute("aria-hidden")==="true")continue;
    const r=el.getBoundingClientRect();
    const id=el.id||el.getAttribute("data-m130-event")||el.getAttribute("data-inventory-tab")||el.className||el.tagName;
    // Collect small touch areas; priority surfaces are evaluated separately.
    if(r.width<36||r.height<36)small.push({id:String(id).slice(0,65),w:Math.round(r.width),h:Math.round(r.height),tag:el.tagName});
    if(r.right>vp+12&&!Array.from((function*(n){for(let p=n.parentElement;p;p=p.parentElement)yield p;})(el)).some(p=>{let s=getComputedStyle(p);return /auto|scroll/.test(s.overflowX)&&p.scrollWidth>p.clientWidth}))
      tooWide.push({id:String(id).slice(0,65),right:Math.round(r.right),width:Math.round(r.width)});
   }
  }
  const primary=["#menu","#quickReturnAdmin","#m130Create","#ueAdd",".estaBottomNav [data-esta-nav=work]",".estaBottomNav [data-esta-action=more]"].map(sel=>{
   const el=document.querySelector(sel);if(!visible(el))return null;
   const r=el.getBoundingClientRect();return {sel,w:Math.round(r.width),h:Math.round(r.height)}
  }).filter(Boolean);
  return {pageId,visible:visible(container),client:vp,docOverflow:Math.max(0,docOverflow),tooWide:tooWide.slice(0,12),tooWideCount:tooWide.length,small:small.slice(0,20),smallCount:small.length,primary};
 },{module});
 if(audit.docOverflow>4||audit.tooWideCount||errors.length||!audit.visible)console.log("AUDIT_ISSUE "+JSON.stringify({project,module,width,...audit,errors}).slice(0,2900));
 results.push({project,module,width,...audit,errors});
 await context.close();
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{for(const width of widths)for(const project of projects)for(const module of modules)await run(browser,project,module,width);}
 finally{await browser.close();}
 const sum={
  cases:results.length,invalidViews:results.filter(r=>!r.visible).length,
  javascriptErrors:results.filter(r=>r.errors.length).length,
  documentOverflows:results.filter(r=>r.docOverflow>4).length,
  clippedControls:results.filter(r=>r.tooWideCount).length,
  smallTargets:results.filter(r=>r.smallCount).length
 };
 fs.writeFileSync(path.join(root,"results.json"),JSON.stringify({summary:sum,results},null,2));
 console.log("MOBILE_AUDIT_SUMMARY "+JSON.stringify(sum));
 if(sum.invalidViews||sum.javascriptErrors)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
