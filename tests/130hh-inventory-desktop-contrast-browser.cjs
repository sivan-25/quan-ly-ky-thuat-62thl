"use strict";
/* Work-safe real CSS audit: synthetic table rows in static local fixture only.
   It never invokes inventory saves, server calls or authenticated APIs. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const widths=[1024,1440];
function rgb(s){const m=String(s||"").match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);return m?m.slice(1,4).map(Number):null;}
function light(c){return c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0)}
function contrast(a,b){const x=light(a),y=light(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const width of widths)for(const pane of ["materials","tools"]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:"reduce"});
   const page=await context.newPage();
   await page.route("**/*",r=>{const u=new URL(r.request().url());return ["localhost","127.0.0.1"].includes(u.hostname)?r.continue():r.abort()});
   await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
   const result=await page.evaluate(pane=>{
    const app=document.querySelector("#app"),root=document.querySelector("#inventoryPage");
    document.querySelector("#login").classList.add("hide");app.classList.remove("hide");
    app.classList.add("inventoryMode","demoMobilePilot","updateProjectMode","estaBrand130");
    document.body.classList.add("estaBrand130");
    root.classList.remove("hide");root.classList.add("inventoryRef130","inventoryRefShared");
    document.querySelector("#inventoryMaterialsPane").classList.toggle("hide",pane!=="materials");
    document.querySelector("#inventoryToolsPane").classList.toggle("hide",pane!=="tools");
    const tbody=document.querySelector(pane==="materials"?"#materialMatrixBody":"#toolsBody");
    tbody.innerHTML=pane==="materials"
      ?'<tr><td>1</td><td class="materialNameCell"><b>Vật tư an toàn</b><small>Mô tả vật tư</small></td><td>Cái</td><td>1</td><td>0</td><td>0</td><td>1</td><td><div class="invRowActions"><button type="button">Sửa</button></div></td></tr>'
      :'<tr><td>1</td><td class="toolNameCell"><b>Máy kiểm tra</b><small>Thiết bị kỹ thuật</small></td><td>A</td><td>1</td><td>Tầng 1</td><td>Kỹ thuật</td><td>Tốt</td><td>-</td><td><div class="invRowActions"><button type="button">Sửa</button></div></td></tr>';
    const table=tbody.closest("table");
    const sample=[...document.querySelectorAll("#inventoryToolsPane .inventoryExamples button")][0];
    const measure=el=>{
      if(!el)return null;const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return {visible:r.width>0&&r.height>0&&s.display!=="none",w:r.width,h:r.height,
        fg:s.webkitTextFillColor||s.color,bg:s.backgroundColor};
    };
    const row=tbody.querySelector("tr"),title=row.querySelector("b"),sub=row.querySelector("small"),cell=row.querySelector("td:nth-child(2)");
    return {table:measure(table),cell:measure(cell),title:measure(title),subtitle:measure(sub),
      quick:measure(sample),quickArea:measure(document.querySelector("#inventoryToolsPane .inventoryExamples")),
      right:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth};
   },pane);
   const key="130HH "+pane+" @ "+width;
   if(pane==="tools"){
     assert.ok(result.quickArea&&result.quick&&result.quick.visible,key+" missing quick add");
     const bg=rgb(result.quick.bg),fg=rgb(result.quick.fg);
     assert.ok(bg&&fg,key+" invalid quick add text/bg "+JSON.stringify(result));
     assert.ok(light(bg)>.7,key+" legacy navy quick-add button "+JSON.stringify(result.quick));
     assert.ok(Math.abs(result.quick.h-44)<=1,key+" inconsistent 44px quick-add button "+JSON.stringify(result.quick));
     const areaBg=rgb(result.quickArea.bg);
     assert.ok(areaBg&&light(areaBg)>.7,key+" legacy navy quick-add container "+JSON.stringify(result.quickArea));
     assert.ok(contrast(fg,bg)>=4.5,key+" low contrast quick-add action "+JSON.stringify(result.quick));
   }
   if(result.table?.visible){
     const bg=rgb(result.cell.bg);
     for(const label of ["title","subtitle"]){
       const el=result[label],fg=rgb(el.fg);
       assert.ok(el.visible&&fg&&bg,key+" missing "+label+" "+JSON.stringify(result));
       assert.ok(contrast(fg,bg)>=4.5,key+" unreadable "+label+" on light cell "+JSON.stringify({el,bg:result.cell.bg}));
     }
   }
   assert.ok(result.right-result.viewport<32,key+" page has unbounded horizontal overflow");
   console.log("PASS "+key+" quick-add legibility and table labels on active surface");
   await context.close();
  }
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
