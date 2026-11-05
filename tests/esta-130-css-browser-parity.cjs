"use strict";
/* Browser-level CSS cascade equivalence: compare source vs Vercel-built CSS
 * with scripts and remote requests disabled. This test never logs in or saves data.
 * Usage: node tests/esta-130-css-browser-parity.cjs /path/to/source-index.html
 * Run only after npm run build; playwright is installed in CI, not production.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const http=require("node:http");
const root=path.resolve(__dirname,"..");
const sourceIndex=process.argv[2];
assert.ok(sourceIndex&&fs.existsSync(sourceIndex),"source index snapshot required");
const baselineHtml=fs.readFileSync(sourceIndex,"utf8");
const buildHtml=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert.match(buildHtml,/data-esta-css-bundle="true"/,"expected built CSS");
assert.doesNotMatch(baselineHtml,/data-esta-css-bundle="true"/,"expected unbuilt CSS");
const {chromium}=require("playwright");
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"application/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const makeServer=(markup)=>http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  if(pathname==="/"||pathname==="/index.html"){res.writeHead(200,{"Content-Type":mime[".html"]});res.end(markup);return;}
  const filepath=path.resolve(root,"."+pathname);
  if(!filepath.startsWith(root+path.sep)||!fs.existsSync(filepath)||!fs.statSync(filepath).isFile()){
   res.writeHead(404);res.end();return;
  }
  res.writeHead(200,{"Content-Type":mime[path.extname(filepath)]||"application/octet-stream"});
  fs.createReadStream(filepath).pipe(res);
 }catch(e){res.writeHead(400);res.end();}
});
const listen=server=>new Promise((resolve,reject)=>{
 server.once("error",reject);
 server.listen(0,"127.0.0.1",()=>resolve("http://127.0.0.1:"+server.address().port+"/"));
});
const pages=["homePage","workPage","inventoryPage","maintenancePage","energyPage","contractorPage","incidentPage","inspectionPage","documentsPage","reportsPage"];
const modes={homePage:"homeMode",workPage:"workMode",inventoryPage:"inventoryMode",maintenancePage:"maintenanceMode",energyPage:"energyMode",contractorPage:"contractorMode",incidentPage:"incidentMode",inspectionPage:"inspectionMode",documentsPage:"documentsMode",reportsPage:"reportsMode"};
const props=["color","backgroundColor","borderTopColor","borderBottomColor","fontSize","fontWeight","display","visibility","height","minHeight","maxHeight","paddingTop","paddingLeft","marginTop","overflowX","position","opacity","gridTemplateColumns","textOverflow","whiteSpace","webkitTextFillColor","boxSizing"];
const sample=async(page,theme)=>{
 return page.evaluate(({pages,modes,props,theme})=>{
  const app=document.getElementById("app");
  if(!app)throw Error("Missing application root");
  app.classList.remove("hide");
  app.classList.add("demoProjectMode","demoExactProject","updateProjectMode",theme);
  document.body.classList.add(theme);
  document.getElementById("login")?.classList.add("hide");
  const out={};
  for(const id of pages){
   app.classList.remove(...Object.values(modes));app.classList.add(modes[id]);
   document.querySelectorAll(".page").forEach(x=>x.classList.add("hide"));
   const pane=document.getElementById(id);
   if(!pane)throw Error("Missing module "+id);
   pane.classList.remove("hide");
   if(id==="inventoryPage"){pane.classList.add("inventoryRefShared","inventoryRef130");document.getElementById("inventoryMaterialsPane")?.classList.remove("hide");}
   const nodes=[pane,...pane.querySelectorAll("input,textarea,select,button,article,header,thead,th,td,small,b,label,span,p,h1,h2,h3")].slice(0,450);
   out[id]=nodes.map(el=>{
    const s=getComputedStyle(el);
    return [el.tagName,el.id,typeof el.className==="string"?el.className.slice(0,35):"",...props.map(k=>s[k])];
   });
   if(theme==="estaBrand130"){
    const critical={workPage:["#taskForm","#saveBtn"],inventoryPage:["#materialMonthTabs"],maintenancePage:[".maintenanceHistoryTable"],energyPage:["#energyForm"],contractorPage:[".contractorToolbar"],incidentPage:["#demoIncidentAdd"],inspectionPage:["#demoInspectionAdd"],reportsPage:[".rc-workspace"]};
    for(const selector of critical[id]||[]){
     const el=pane.querySelector(selector),box=el?.getBoundingClientRect();
     if(!el||!box||box.width<8||box.height<8||getComputedStyle(el).visibility==="hidden"){
      (out.__hidden||(out.__hidden=[])).push(id+" "+selector);
     }
    }
   }
  }
  return out;
 },{pages,modes,props,theme});
};
(async()=>{
 const servers=[makeServer(baselineHtml),makeServer(buildHtml)];
 let browser;
 try{
  const urls=await Promise.all(servers.map(listen));
  browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
  let inspected=0,checkedPages=0;
  for(const width of [390,1024,1440])for(const theme of ["estaBrand130","estaBrand127","estaBrand68","estaBrand62"]){
   const runs=[];
   for(const url of urls){
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.route("**/*",route=>{
     const dest=new URL(route.request().url());
     if(dest.origin!==new URL(url).origin||/\.js(?:\?|$)/.test(dest.pathname)){route.abort();return;}
     route.continue();
    });
    const errors=[];page.on("pageerror",err=>errors.push(err.message));
    await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
    assert.deepEqual(errors,[],"page error on "+url);
    const data=await sample(page,theme);
    if(theme==="estaBrand130")assert.deepEqual(data.__hidden||[],[],"Critical 130 Hồng Hà controls unexpectedly hidden");
    if(theme==="estaBrand130"&&width===1440&&url===urls[1]){
     const cssCount=await page.evaluate(()=>[...document.querySelectorAll('link[rel="stylesheet"]')].filter(el=>{const url=new URL(el.href);return url.origin===location.origin&&url.pathname.endsWith(".css");}).length);
     assert.ok(cssCount<=19,"CSS request budget exceeded: "+cssCount);
    }
    runs.push(data);
    await page.close();
   }
   for(const id of pages){
    const before=runs[0][id],after=runs[1][id];
    assert.equal(after.length,before.length,id+" DOM node count differs");
    for(let i=0;i<before.length;i++){
     inspected++;
     assert.deepEqual(after[i],before[i],"CSS mismatch: "+theme+" "+width+"px "+id+" node "+i);
    }
    checkedPages++;
   }
  }
  console.log("PASS ESTA 130 CSS browser parity: "+checkedPages+" page/viewport/theme cases, "+inspected+" computed-style node comparisons; CSS cascade identical");
 }finally{
  if(browser)await browser.close();
  await Promise.all(servers.map(s=>new Promise(resolve=>s.close(resolve))));
 }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
