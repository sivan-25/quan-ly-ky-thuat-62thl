"use strict";
/* Read-only Chromium: shell nav theme tokens, icon/active state, work topbar.
   Uses local fixture auth and no requests outside the test web server. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const widths=[320,390,768,1440];
const rgba=s=>{const m=String(s).match(/^rgba?\(([^)]+)\)$/);return m?m[1].split(/[,/ ]+/).filter(Boolean).slice(0,3).map(Number):null;};
const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((x,v,i)=>x+v*[.2126,.7152,.0722][i],0);
const ratio=(x,y)=>{const a=lum(x),b=lum(y);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:width<500?844:900},reducedMotion:"reduce"});
   const page=await context.newPage();
   await page.route("**/*",route=>{
    const url=new URL(route.request().url());
    return ["127.0.0.1","localhost"].includes(url.hostname)?route.continue():route.abort();
   });
   await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
   const stats=await page.evaluate(()=>{
    const buildings=[{id:"130HH",name:"130 Hồng Hà",role:"editor"}];
    window.eval('centralSession={access_token:"OFFLINE-SHELL-QA"};');
    window.eval('currentAccount='+JSON.stringify({id:"fixture",is_admin:true,buildings})+';');
    window.eval('currentBuilding='+JSON.stringify(buildings[0])+';projectOverviewActive=true;projectOpenSeq++;');
    window.eval("sbFetch=async()=>[];");
    document.querySelector("#login").classList.add("hide");
    document.querySelector("#app").classList.remove("hide");
    window.eval('applyBuildingUI();showModule("work");');
    const selected=document.querySelector("#mobileSidebar .estaNav button.active");
    if(!selected)throw Error("No active sidebar button in Work mode");
    const topbar=document.querySelector("#app .estaTopbar");
    const title=document.querySelector("#topWorkTitle h1");
    const style=e=>getComputedStyle(e);
    const active=style(selected),svg=style(selected.querySelector("svg")),activeLabel=style(selected.querySelector("span"));
    const idle=[...document.querySelectorAll("#mobileSidebar .estaNav button")].find(e=>
      !e.classList.contains("active")&&e.getAttribute("aria-current")!=="page"&&!e.classList.contains("hide"));
    const idleStyle=idle?style(idle):null;
    const pseudo=style(selected,"::before"),head=style(topbar),heading=style(title);
    const button=style(document.querySelector("#menu"));
    const bottom=document.querySelector("#estaBottomNav button[aria-current='page']");
    const bottomButton=bottom?style(bottom):null;
    return {
      brand:document.querySelector("#app").classList.contains("estaBrand130"),
      selectedId:selected.id,activeText:active.color,activeLabel:activeLabel.color,activeBg:active.backgroundColor,icon:svg.color,pseudo:pseudo.backgroundColor,stripe:active.boxShadow,
      idleId:idle?.id,idleText:idleStyle?.color,idleBg:idleStyle?.backgroundColor,idleImage:idleStyle?.backgroundImage,
      pseudoContent:pseudo.content,head:head.backgroundColor,headBackground:head.backgroundImage,
      title:heading.color,menu:button.color,menuBg:button.backgroundColor,
      bottomText:bottomButton?.color,bottomBg:bottomButton?.backgroundColor,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
   });
   const label="130HH nav "+width;
   assert.ok(stats.brand,label+" must be scoped");
   assert.ok(stats.selectedId,label+" must mark an active navigation item");
   assert.ok(/rgba?\(/.test(stats.activeBg),label+" active nav must have a computed surface");
   assert.equal(stats.activeText,"rgb(243, 222, 191)",label+" active nav label");
   assert.equal(stats.activeLabel,"rgb(243, 222, 191)",label+" active nested text color");
   assert.ok(stats.idleId,label+" missing ordinary menu item");
   assert.equal(stats.idleImage,"none",label+" idle button must not inherit legacy gradient");
   assert.equal(stats.idleBg,"rgba(0, 0, 0, 0)",label+" idle button stays dark via sidebar, not cream fill");
   assert.equal(stats.idleText,"rgb(243, 222, 191)",label+" idle text stays cream");
   assert.equal(stats.icon,"rgb(243, 222, 191)",label+" active icon must not remain neon blue");
   const values=stats.activeBg.match(/[\d.]+/g).map(Number);
   const alpha=values.length>3?values[3]:1;
   const foreground=rgba(stats.activeText);
   const selectedBg=rgba(stats.activeBg);
   const worst=Math.min(...[[65,20,55],[43,21,38]].map(under=>
     ratio(foreground,selectedBg.map((c,i)=>c*alpha+under[i]*(1-alpha)))));
   assert.ok(worst>=4.5,label+" active label contrast over brand sidebar: "+JSON.stringify(stats));
   assert.ok(
     stats.pseudo==="rgb(164, 100, 39)"||stats.stripe.includes("rgb(164, 100, 39)"),
     label+" selected indicator must retain copper (pseudo or inset rail): "+JSON.stringify(stats)
   );
   assert.equal(stats.title,"rgb(243, 222, 191)",label+" topbar title");
   const fg=rgba(stats.title),bg=rgba(stats.head);
   if(fg&&bg&&bg.some(x=>x>0))assert.ok(ratio(fg,bg)>=4.5,label+" low topbar contrast");
   assert.ok(stats.overflow<=2,label+" horizontal page overflow");
   console.log("PASS "+label+" Work nav selected contrast over plum, copper stripe, topbar cream, no overflow");
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
