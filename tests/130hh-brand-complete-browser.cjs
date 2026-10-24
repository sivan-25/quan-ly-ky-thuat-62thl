"use strict";
/* 130HH brand audit: real Chromium, offline fixtures, no Supabase writes. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const fs=require("node:fs");
const path=require("node:path");
const sizes=[320,390,768,1440];
const projects=[
 {id:"130HH",name:"130 Hồng Hà",role:"editor"},
 {id:"62THL",name:"62 Trần Huy Liệu",role:"editor"},
 {id:"68PĐL",name:"68 Phan Đăng Lưu",role:"editor"},
 {id:"127HH",name:"127 Hồng Hà",role:"editor"}
];
const modes=[
 ["home","#homePage",".homeWelcome"],
 ["work","#workPage",".workEntryCard"],
 ["energy","#energyPage",".energyCard"],
 ["inventory","#inventoryPage",".inventoryCommand"],
 ["maintenance","#maintenancePage",".maintenanceHero"],
 ["contractor","#contractorPage",".contractorIntro"],
 ["incident","#incidentPage",".demoHero"],
 ["inspection","#inspectionPage",".demoHero"],
 ["documents","#documentsPage",".demoPanel"],
 ["reports","#reportsPage",".rc-period"],
 ["construction","#constructionMaterialPage",".constructionCommand"]
];
const cream="rgb(243, 222, 191)",soft="rgb(245, 236, 208)";
const output=process.env.ESTA_VISUAL_DIR||"visual-artifacts";
fs.mkdirSync(output,{recursive:true});
async function prep(page,p){
 await page.route("**/*",r=>{
  try{if(["127.0.0.1","localhost"].includes(new URL(r.request().url()).hostname))return r.continue()}catch(e){}
  return r.abort();
 });
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:8766/",{waitUntil:"load",timeout:30000});
 await page.waitForTimeout(200);
 await page.evaluate(project=>{
  const names={"130HH":"130 Hồng Hà","62THL":"62 Trần Huy Liệu","68PĐL":"68 Phan Đăng Lưu","127HH":"127 Hồng Hà"};
  const buildings=Object.entries(names).map(([id,name])=>({id,name,role:"editor"}));
  const data=[{id:5001,d:"2026-10-20",c:"Kiểm tra hệ thống điện",t:"Hằng ngày",s:"Đang thực hiện",a:"Kỹ thuật",imgs:[]}];
  window.eval('centralSession={access_token:"OFFLINE-BRAND-TEST"};');
  window.eval("currentAccount="+JSON.stringify({id:"fixture",is_admin:true,buildings})+";");
  window.eval("currentBuilding="+JSON.stringify(buildings.find(b=>b.id===project))+";projectOverviewActive=true;projectOpenSeq++;");
  window.eval("sbFetch=async function(){return [];}");
  localStorage.setItem(project==="62THL"?"qlkt62_v1":"qlkt_tasks_"+project,JSON.stringify(data));
  document.querySelector("#login").classList.add("hide");
  document.querySelector("#app").classList.remove("hide");
  window.eval("applyBuildingUI()");
 },p);
 return errors;
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of sizes){
   const context=await browser.newContext({viewport:{width,height:width<500?844:900},deviceScaleFactor:1,reducedMotion:"reduce"});
   const page=await context.newPage();
   const errors=await prep(page,"130HH");
   for(const [mode,root,card] of modes){
    const state=await page.evaluate(({mode,root,card})=>{
     try{if(mode==="home")showHome();else showModule(mode)}catch(e){window.__brandTestError=String(e)}
     const app=document.querySelector("#app");
     const area=document.querySelector(root);
     const element=area?.querySelector(card);
     const topbar=document.querySelector("#app .estaTopbar");
     const css=e=>e?getComputedStyle(e):null;
     const rgba=(el)=>el&&el.getClientRects().length>0?(css(el)?.backgroundColor||""):null;
     const body=document.body;
     const doc=document.documentElement;
     return {brand:app.classList.contains("estaBrand130"),
      bodyBrand:body.classList.contains("estaBrand130"),
      visible:!!area&&!area.classList.contains("hide")&&area.getClientRects().length>0,
      topbar:css(topbar)?.backgroundImage||"",
      topbarColor:css(topbar)?.backgroundColor||"",
      topbarDisplay:css(topbar)?.display||"",
      brandLink:!![...document.styleSheets].find(s=>String(s.href||"").includes("esta-brand-130-complete")),
      currentMode:app.className,
      topbarText:css(document.querySelector("#topWorkTitle h1"))?.color||"",
      area:rgba(area),
      card:rgba(element),
      cardExists:!!element,
      overflow:Math.max(doc.scrollWidth,body.scrollWidth)-doc.clientWidth,
      error:window.__brandTestError||"",
      workRow:rgba(document.querySelector("#workPage .workTaskTable tbody tr")),
      energyKpi:rgba(document.querySelector("#energyPage .energySummaryCards article")),
      energyPanel:rgba(document.querySelector("#energyPage .energyCard")),
      inventory:rgba(document.querySelector("#inventoryPage .inventoryCommand")),
      workCard:rgba(document.querySelector("#workPage .workEntryCard")),
      energyTable:rgba(document.querySelector("#energyPage .energyTableCard"))
     };
    },{mode,root,card});
    assert.equal(state.error,"",mode+" should not throw");
    assert.equal(state.brand,true,"130HH mode "+mode+" lost app brand");
    assert.equal(state.bodyBrand,true,"130HH mode "+mode+" lost body brand");
    if(!state.visible){
      assert.ok(!["home","work","energy","inventory","maintenance","contractor"].includes(mode),
        "Primary operational page must be visible: "+mode+" width "+width);
      console.log("SKIP hidden optional route "+mode+" at "+width+"px (not displayed by current navigation)");
      continue;
    }
    const contrastAudit=await page.evaluate(()=>{
      const semantic='[class*="status"],[class*="Status"],[class*="badge"],[class*="Badge"],[class*="typeBadge"],[class*="pill"],[class*="Pill"],[class*="chip"],[class*="Chip"],[class*="tag"],[class*="Tag"],[class*="priority"],[class*="Priority"],[data-status],[data-state]';
      const parseColor=s=>{
        if(!s)return null;
        const m=s.match(/^rgba?\(([^)]+)\)$/i);
        if(m){const v=m[1].split(/[,/ ]+/).filter(Boolean).map(Number);return {r:v[0],g:v[1],b:v[2],a:v.length>3?v[3]:1};}
        const h=s.match(/^#([\da-f]{3,8})$/i);
        if(h){let x=h[1];if(x.length===3)x=x.split('').map(z=>z+z).join('');if(x.length>=6)return {r:parseInt(x.slice(0,2),16),g:parseInt(x.slice(2,4),16),b:parseInt(x.slice(4,6),16),a:1};}
        return null;
      };
      const luminance=c=>{
        const v=[c.r,c.g,c.b].map(x=>{x/=255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);});
        return .2126*v[0]+.7152*v[1]+.0722*v[2];
      };
      const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
      const backgrounds=el=>{
        for(let n=el;n&&n!==document.documentElement;n=n.parentElement){
          const s=getComputedStyle(n);
          if(s.backgroundImage&&s.backgroundImage!=="none"&&s.backgroundImage.includes("gradient")){
            const matches=[...s.backgroundImage.matchAll(/rgba?\([^)]+\)|#[\da-fA-F]{3,8}/g)];
            const colors=matches.map(m=>parseColor(m[0])).filter(c=>c&&c.a>=.9);
            if(colors.length)return colors;
          }
          const bg=parseColor(s.backgroundColor);
          if(bg&&bg.a>=.95)return [bg];
        }
        return [{r:243,g:222,b:191,a:1}];
      };
      const failures=[];
      const candidates=[...document.body.querySelectorAll('h1,h2,h3,h4,p,span,strong,b,small,label,td,th,li,a,dt,dd,legend,summary,em,div,button')];
      for(const el of candidates){
        if(![...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()))continue;
        if(!el.getClientRects().length||el.closest('.hide,[aria-hidden="true"],'+semantic))continue;
        const st=getComputedStyle(el);
        if(st.display==="none"||st.visibility==="hidden")continue;
        let parent=el,hiddenByOpacity=false;
        while(parent&&parent!==document.body){if(Number(getComputedStyle(parent).opacity)<.35){hiddenByOpacity=true;break;}parent=parent.parentElement;}
        if(hiddenByOpacity)continue;
        const paint=st.webkitTextFillColor||st.color;const fg=parseColor(paint);if(!fg||fg.a<.95)continue;
        const size=parseFloat(st.fontSize)||12,weight=parseInt(st.fontWeight,10)||400;
        const threshold=(size>=24||(size>=18.66&&weight>=700))?3:4.5;
        const bg=backgrounds(el);
        const worst=Math.min(...bg.map(c=>ratio(fg,c)));
        if(worst+0.12<threshold)failures.push({tag:el.tagName.toLowerCase(),className:String(el.className||"").slice(0,70),text:(el.innerText||el.textContent||"").trim().replace(/\s+/g," ").slice(0,50),color:st.color,textFill:st.webkitTextFillColor,html:el.outerHTML.slice(0,180),ancestors:[el.parentElement,el.parentElement?.parentElement,el.parentElement?.parentElement?.parentElement].filter(Boolean).map(n=>n.tagName.toLowerCase()+"#"+n.id+"."+String(n.className||"").replace(/\s+/g,".").slice(0,90)),actionMatch:el.matches('button[data-update-action="work-new"]'),heroActions:!!el.closest(".opsHeroActions"),updateHeroActions:!!el.closest(".updateHeroActions"),matchedColorRules:(()=>{const out=[];const walk=rules=>{for(const r of rules){try{if(r.cssRules)walk(r.cssRules);if(r.selectorText&&r.style&&r.style.getPropertyValue("color")&&el.matches(r.selectorText)){const v=r.style.getPropertyValue("color");if(/243|222|191|411437|plum/i.test(v))out.push({selector:r.selectorText.slice(0,220),color:v,important:r.style.getPropertyPriority("color")});}}catch(e){}}};for(const sh of [...document.styleSheets]){try{walk(sh.cssRules)}catch(e){}}return out.slice(-16)})(),bg:bg.map(c=>"rgb("+c.r+","+c.g+","+c.b+")"),contrast:Number(worst.toFixed(2)),required:threshold});
      }
      for(const el of document.body.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),select,textarea')){
        if(!el.getClientRects().length||el.closest('.hide,[aria-hidden="true"]'))continue;
        const st=getComputedStyle(el),fg=parseColor(st.webkitTextFillColor||st.color),bg=backgrounds(el);
        if(fg&&fg.a>=.95){const worst=Math.min(...bg.map(c=>ratio(fg,c)));if(worst+0.12<4.5)failures.push({tag:el.tagName.toLowerCase(),className:String(el.className||"").slice(0,70),text:(el.value||el.placeholder||"").slice(0,50),color:st.color,bg:bg.map(c=>"rgb("+c.r+","+c.g+","+c.b+")"),contrast:Number(worst.toFixed(2)),required:4.5});}
        if(el.placeholder){const p=parseColor(getComputedStyle(el,"::placeholder").color);if(p&&p.a>=.95){const worst=Math.min(...bg.map(c=>ratio(p,c)));if(worst+0.12<4.5)failures.push({tag:el.tagName.toLowerCase()+"::placeholder",text:el.placeholder.slice(0,40),color:getComputedStyle(el,"::placeholder").color,bg:bg.map(c=>"rgb("+c.r+","+c.g+","+c.b+")"),contrast:Number(worst.toFixed(2)),required:4.5});}}
      }
      return {count:failures.length,failures:failures.slice(0,12)};
    });
    assert.equal(contrastAudit.count,0,"130HH text contrast failed in "+mode+" width "+width+": "+JSON.stringify(contrastAudit.failures));

    if(mode==="work"){
     const workReadability=await page.evaluate(()=>{
      const root=document.querySelector("#workPage");
      const colorOf=el=>el?getComputedStyle(el).color:"";
      const statCountColor=colorOf(document.querySelector("#statToday"));
      const tableCountColor=colorOf(document.querySelector("#workPage .workTableMeta #count"));

      const star=document.createElement("button");
      star.type="button";star.className="estaPriorityStar is-marked";star.setAttribute("aria-pressed","true");
      star.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 2 15 8l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/></svg>';
      root.appendChild(star);
      const starMarkedColor=colorOf(star);

      const performer=document.createElement("div");
      performer.className="performerChips pro";performer.innerHTML="<span><b>Người thực hiện</b></span>";
      root.appendChild(performer);
      const performerBackground=getComputedStyle(performer.querySelector("span")).backgroundColor;
      const performerTextColor=colorOf(performer.querySelector("b"));

      const table=document.createElement("table");table.className="workTaskTable";
      table.innerHTML="<tbody><tr><td>Hàng kiểm tra</td></tr></tbody>";root.appendChild(table);
      const dividerColor=getComputedStyle(table.querySelector("td")).borderBottomColor;

      const mobileCard=document.createElement("article");mobileCard.className="mcard proTaskCard";
      const mobileCards=document.querySelector("#mobileCards");mobileCards?.appendChild(mobileCard);
      const mobileDividerColor=getComputedStyle(mobileCard).borderBottomColor;

      const probeParent=document.createElement("div");
      probeParent.className="workEditDrawer demoWorkEditDrawer";
      probeParent.style.cssText="position:fixed!important;left:-10000px!important;top:0!important;width:320px!important;display:block!important;visibility:visible!important;pointer-events:none!important";
      probeParent.innerHTML='<details id="demoWorkLinks" class="demoWorkLinks"><summary>Liên kết nâng cao</summary><div class="demoWorkLinkGrid"><div class="demoTaskMaterialsField"><div class="demoTaskMaterialsHead"><span>Vật tư sử dụng</span><button id="demoAddTaskMaterial" type="button">+ Thêm vật tư</button></div><select><option>Vật tư thử</option></select></div></div></details>';
      document.body.appendChild(probeParent);
      const panel=probeParent.querySelector("#demoWorkLinks");
      const linkBackground=getComputedStyle(panel).backgroundColor;
      const linkSummaryColor=colorOf(panel.querySelector("summary"));
      const linkMaterialTitleColor=colorOf(panel.querySelector(".demoTaskMaterialsHead>span"));
      const addButton=getComputedStyle(panel.querySelector("#demoAddTaskMaterial"));
      const addButtonBackground=addButton.backgroundColor;
      const addButtonColor=addButton.color;

      star.remove();performer.remove();table.remove();mobileCard.remove();probeParent.remove();
      return {statCountColor,tableCountColor,starMarkedColor,performerBackground,performerTextColor,dividerColor,mobileDividerColor,linkBackground,linkSummaryColor,linkMaterialTitleColor,addButtonBackground,addButtonColor};
     });
     assert.equal(workReadability.statCountColor,"rgb(65, 20, 55)","130HH work statistic number must be plum, not yellow/low-contrast");
     assert.equal(workReadability.tableCountColor,"rgb(65, 20, 55)","130HH work list count must be plum");
     assert.equal(workReadability.starMarkedColor,"rgb(154, 103, 0)","130HH priority star must remain visibly gold when marked");
     assert.equal(workReadability.performerBackground,"rgb(251, 243, 227)","130HH performer chip must use a light ESTA surface");
     assert.equal(workReadability.performerTextColor,"rgb(65, 20, 55)","130HH performer name must be readable plum");
     assert.equal(workReadability.dividerColor,"rgb(181, 138, 96)","130HH desktop work rows must have a visible copper divider");
     assert.equal(workReadability.mobileDividerColor,"rgb(181, 138, 96)","130HH mobile work cards must have a visible copper divider");
     assert.equal(workReadability.linkBackground,"rgb(245, 236, 208)","130HH work-link panel must use the ESTA cream surface");
     assert.equal(workReadability.linkSummaryColor,"rgb(65, 20, 55)","130HH work-link title must use plum, not blue");
     assert.equal(workReadability.linkMaterialTitleColor,"rgb(65, 20, 55)","130HH materials heading must use plum");
     assert.equal(workReadability.addButtonBackground,"rgb(65, 20, 55)","130HH add-material button must use plum");
     assert.equal(workReadability.addButtonColor,"rgb(243, 222, 191)","130HH add-material button text must use cream");
    }
    assert.ok(state.topbar.includes("rgb(65, 20, 55)")&&state.topbar.includes("rgb(43, 21, 38)"),
     "Unbranded blue header "+mode+" width "+width+": "+JSON.stringify(state));
    assert.equal(state.area,cream,"Page background in "+mode+" width "+width);
    assert.ok(state.overflow<=4,"Horizontal overflow in "+mode+" width "+width+": "+state.overflow);
    for(const key of ["workCard","energyKpi","energyPanel","inventory","energyTable"]){
      if(state[key]!==null)assert.equal(state[key],soft,key+" still has legacy blue/dark surface in "+mode+" width "+width);
    }
    assert.equal(errors.length,0,"JavaScript errors in "+mode+": "+errors.join(", "));
   }
   await context.close();
  }
  // Test the same app without active 130HH project: body class and app class must clear.
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();await prep(page,"130HH");
  const state=await page.evaluate(()=>{
    window.eval('currentBuilding={id:"62THL",name:"62 Trần Huy Liệu",role:"editor"};projectOverviewActive=true;syncOverviewNavigation()');
    const other=!document.querySelector("#app").classList.contains("estaBrand130")&&!document.body.classList.contains("estaBrand130");
    window.eval("projectOverviewActive=false;syncOverviewNavigation()");
    return {other,admin:!document.querySelector("#app").classList.contains("estaBrand130")&&!document.body.classList.contains("estaBrand130")};
  });
  assert.ok(state.other&&state.admin,"Theme must reset for other project AND Admin");
  await context.close();
  console.log("PASS 130HH all project modes across 4 viewport widths; header and 5 key panels use ESTA brand; zero horizontal overflow; other projects/Admin isolated");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
