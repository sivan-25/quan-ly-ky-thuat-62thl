"use strict";
/* Visual/geometry regression: read-only CSS fixture with synthetic rows.
   No real sessions, APIs, records or inventory mutations. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const widths=[800,1024,1440];
const cases=[
  {pane:"materials",selector:"#materialInventoryTable",columns:8},
  {pane:"tools",selector:"#inventoryToolsPane .toolsTable",columns:9}
];
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of widths)for(const scenario of cases){
   const context=await browser.newContext({viewport:{width,height:900}});
   const page=await context.newPage();
   await page.route("**/*",route=>{
    const u=new URL(route.request().url());
    if(u.hostname==="127.0.0.1"&&!u.pathname.endsWith(".js"))return route.continue();
    return route.abort();
   });
   await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
   const result=await page.evaluate(({scenario})=>{
    document.body.classList.add("estaBrand130");
    const app=document.querySelector("#app");
    app.classList.remove("hide");
    app.classList.add("estaBrand130","inventoryMode","updateProjectMode");
    document.querySelector("#login")?.classList.add("hide");
    const pane=document.querySelector("#inventoryPage");
    pane.classList.remove("hide");
    pane.classList.add("inventoryRefShared","inventoryRef130");
    document.querySelector("#inventoryMaterialsPane").classList.toggle("hide",scenario.pane!=="materials");
    document.querySelector("#inventoryToolsPane").classList.toggle("hide",scenario.pane!=="tools");
    const table=document.querySelector(scenario.selector);
    const body=table.tBodies[0];
    body.innerHTML="";
    for(let i=0;i<42;i++){
      const tr=document.createElement("tr");
      tr.innerHTML=Array.from({length:scenario.columns},(_,j)=>"<td>Hàng "+(i+1)+" · "+(j+1)+"</td>").join("");
      body.appendChild(tr);
    }
    const scroll=table.closest(".inventoryTableScroll");
    const head=table.querySelector("thead th");
    scroll.scrollTop=320;
    const headerRect=head.getBoundingClientRect();
    const scrollRect=scroll.getBoundingClientRect();
    return {
      scrollTop:scroll.scrollTop,
      overflowY:getComputedStyle(scroll).overflowY,
      maxHeight:getComputedStyle(scroll).maxHeight,
      stick:getComputedStyle(head).position,
      headTop:headerRect.top,
      scrollTopEdge:scrollRect.top,
      scrollHeight:scroll.scrollHeight,
      viewportHeight:scroll.clientHeight,
      bodyTheme:document.body.classList.contains("estaBrand130")
    };
   },{scenario});
   const where=scenario.pane+" @ "+width;
   assert.equal(result.bodyTheme,true,where+" has no 130 theme");
   assert.ok(result.scrollHeight>result.viewportHeight+50,where+" did not become a scrollable table");
   assert.ok(result.scrollTop>=180,where+" cannot scroll vertically: "+JSON.stringify(result));
   assert.equal(result.stick,"sticky",where+" header is not sticky");
   assert.ok(result.headTop>=result.scrollTopEdge-3&&result.headTop<=result.scrollTopEdge+10,
    where+" header detached from scrolling table "+JSON.stringify(result));
   console.log("PASS 130HH sticky inventory "+where+"; scrolled "+result.scrollTop+"px");
   await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
