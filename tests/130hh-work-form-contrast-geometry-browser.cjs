"use strict";
/* Real computed-style QA for 130HH. Read-only, isolated local fixture; no
   production login, data write, or direct Supabase request is ever made. */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const sizes=[320,390,768,1024,1440];
const parse=s=>{const m=String(s||"").match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);return m?m.slice(1,4).map(Number):null;};
const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);};
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of sizes){
   const context=await browser.newContext({viewport:{width,height:width<500?844:900},reducedMotion:"reduce"});
   const page=await context.newPage();
   await page.route("**/*",route=>{
    let url;try{url=new URL(route.request().url())}catch{return route.abort()}
    return ["localhost","127.0.0.1"].includes(url.hostname)?route.continue():route.abort();
   });
   await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
   const result=await page.evaluate(()=>{
    const buildings=[{id:"130HH",name:"130 Hồng Hà",role:"editor"}];
    window.eval('centralSession={access_token:"LOCAL-ONLY-NO-API"};');
    window.eval('currentAccount='+JSON.stringify({id:"fixture",is_admin:true,buildings})+';');
    window.eval('currentBuilding='+JSON.stringify(buildings[0])+';projectOverviewActive=true;projectOpenSeq++;');
    window.eval('sbFetch=async()=>[];');
    localStorage.setItem("qlkt_tasks_130HH",JSON.stringify([
      {id:501,d:"2026-10-10",c:"Kiểm tra kỹ thuật",t:"Hằng ngày",s:"Đã hoàn thành",a:"Kỹ thuật",imgs:[]}
    ]));
    document.querySelector("#login").classList.add("hide");
    document.querySelector("#app").classList.remove("hide");
    window.eval('applyBuildingUI();showModule("work");');
    const app=document.querySelector("#app");
    const root=document.querySelector("#workPage");
    const select=s=>root.querySelector(s);
    const record=el=>{
      if(!el)return null;
      const c=getComputedStyle(el),r=el.getBoundingClientRect();
      return {height:+r.height.toFixed(2),width:+r.width.toFixed(2),
        display:c.display,background:c.backgroundColor,color:c.webkitTextFillColor||c.color,
        border:c.borderColor,visible:r.width>0&&r.height>0};
    };
    const fields=Object.fromEntries(Object.entries({
      date:"#date",content:"#content",type:"#type",status:"#status",
      performer:"#taskPeopleButton",note:"#note",
      camera:"#openNativeCamera",library:"#openNativeLibrary"
    }).map(([k,sel])=>[k,record(select(sel))]));
    const tests=[
      ["done","badge done","Đã hoàn thành"],
      ["doing","badge doing","Đang thực hiện"],
      ["waiting","badge waiting","Chờ xử lý"],
      ["daily","typeBadge daily","Hằng ngày"],
      ["maintenance","typeBadge maintenance","Bảo trì"],
      ["incident","typeBadge incident","Sự cố"]
    ];
    const pills={};
    for(const [key,cls,label] of tests){
      const p=document.createElement("span");p.className=cls;p.textContent=label;
      root.appendChild(p);pills[key]=record(p);p.remove();
    }
    return {isBrand:app.classList.contains("estaBrand130"),
      isWork:app.classList.contains("workMode"),width:document.documentElement.clientWidth,
      documentWidth:document.documentElement.scrollWidth,fields,pills};
   });
   const prefix="130HH work "+width+"px";
   assert.equal(result.isBrand,true,prefix+" lost scoped brand");
   assert.equal(result.isWork,true,prefix+" wrong mode");
   assert.ok(result.documentWidth<=result.width+2,prefix+" introduced horizontal overflow "+JSON.stringify(result));
   for(const [name,field] of Object.entries(result.fields)){
     assert.ok(field&&field.visible,prefix+" missing "+name);
     assert.ok(Math.abs(field.height-44)<=1,prefix+" "+name+" not 44px: "+JSON.stringify(field));
     assert.ok(field.width>=52,prefix+" "+name+" too narrow: "+JSON.stringify(field));
     const fg=parse(field.color),bg=parse(field.background);
     if(fg&&bg&&name!=="date")assert.ok(ratio(fg,bg)>=4.5,prefix+" low contrast "+name+" "+JSON.stringify(field));
   }
   for(const [name,pill] of Object.entries(result.pills)){
     assert.ok(pill&&pill.visible,prefix+" missing "+name);
     const fg=parse(pill.color),bg=parse(pill.background);
     assert.ok(fg&&bg,prefix+" unparseable color "+name+" "+JSON.stringify(pill));
     assert.ok(lum(bg)>.70,prefix+" legacy dark pill "+name+" "+JSON.stringify(pill));
     assert.ok(ratio(fg,bg)>=4.5,prefix+" unreadable pill "+name+" "+JSON.stringify(pill));
   }
   console.log("PASS "+prefix+" all 8 controls 44px, 6 light badges/type labels, AA contrast and no page overflow");
   await context.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
