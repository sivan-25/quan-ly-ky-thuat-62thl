"use strict";
/* 130HH brand audit: real Chromium, offline fixtures, no Supabase writes. */
const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const fs=require("node:fs");
const path=require("node:path");
const sizes=[360,390,768,1024,1366,1920];
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
const cream="rgb(243, 222, 191)",soft="rgb(255, 253, 252)";
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
        if(worst+0.12<threshold)failures.push({tag:el.tagName.toLowerCase(),className:String(el.className||"").slice(0,70),text:(el.innerText||el.textContent||"").trim().replace(/\s+/g," ").slice(0,50),color:st.color,textFill:st.webkitTextFillColor,html:el.outerHTML.slice(0,180),ancestors:[el.parentElement,el.parentElement?.parentElement,el.parentElement?.parentElement?.parentElement].filter(Boolean).map(n=>n.tagName.toLowerCase()+"#"+n.id+"."+String(n.className||"").replace(/\s+/g,".").slice(0,90)),actionMatch:el.matches('button[data-update-action="work-new"]'),heroActions:!!el.closest(".opsHeroActions"),updateHeroActions:!!el.closest(".updateHeroActions"),matchedColorRules:(()=>{const out=[];const walk=rules=>{for(const r of rules){try{if(r.cssRules)walk(r.cssRules);if(r.selectorText&&r.style&&r.style.getPropertyValue("color")&&el.matches(r.selectorText)){const v=r.style.getPropertyValue("color");if(/243|222|191|411437|plum/i.test(v))out.push({selector:r.selectorText.slice(0,220),color:v,important:r.style.getPropertyPriority("color")});}}catch(e){}}};for(const sh of [...document.styleSheets]){try{walk(sh.cssRules)}catch(e){}}return out.slice(-16)})(),parentPaint:(()=>{const n=el.parentElement;if(!n)return null;const p=getComputedStyle(n);return {id:n.id,className:n.className,display:p.display,backgroundColor:p.backgroundColor,backgroundImage:p.backgroundImage,color:p.color,textFill:p.webkitTextFillColor,opacity:p.opacity};})(),bg:bg.map(c=>"rgb("+c.r+","+c.g+","+c.b+")"),contrast:Number(worst.toFixed(2)),required:threshold});
      }
      for(const el of document.body.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),select,textarea')){
        if(!el.getClientRects().length||el.closest('.hide,[aria-hidden="true"]'))continue;
        const st=getComputedStyle(el),fg=parseColor(st.webkitTextFillColor||st.color),bg=backgrounds(el);
        if(fg&&fg.a>=.95){const worst=Math.min(...bg.map(c=>ratio(fg,c)));if(worst+0.12<4.5)failures.push({tag:el.tagName.toLowerCase(),className:String(el.className||"").slice(0,70),text:(el.value||el.placeholder||"").slice(0,50),color:st.color,bg:bg.map(c=>"rgb("+c.r+","+c.g+","+c.b+")"),contrast:Number(worst.toFixed(2)),required:4.5});}
        if(el.placeholder){const p=parseColor(getComputedStyle(el,"::placeholder").color);if(p&&p.a>=.95){const worst=Math.min(...bg.map(c=>ratio(p,c)));if(worst+0.12<4.5)failures.push({tag:el.tagName.toLowerCase()+"::placeholder",text:el.placeholder.slice(0,40),color:getComputedStyle(el,"::placeholder").color,bg:bg.map(c=>"rgb("+c.r+","+c.g+","+c.b+")"),contrast:Number(worst.toFixed(2)),required:4.5});}}
      }
      /* Prior iterations excluded badges and selected controls entirely,
         allowing the dark legacy 130HH pills to pass despite unreadable text.
         Audit the actual painted status/type surface on every visible route. */
      const semanticPaints=[
        ...document.body.querySelectorAll(
          ".badge,.homeStatus,.typeBadge,.workChoiceTile,.toolCondition,.maintenanceStatus,.statusBadge"
        )
      ];
      for(const el of semanticPaints){
        if(!el.getClientRects().length||el.closest(".hide,[aria-hidden=true]"))continue;
        const st=getComputedStyle(el),ownBg=parseColor(st.backgroundColor);
        if(st.display==="none"||st.visibility==="hidden"||!ownBg||ownBg.a<.95)continue;
        const label=(el.querySelector("b,span,strong")||el),labelStyle=getComputedStyle(label);
        const fg=parseColor(labelStyle.webkitTextFillColor||labelStyle.color);
        if(!fg||fg.a<.95)continue;
        const labelText=(label.innerText||label.textContent||"").trim();
        if(!labelText)continue;
        const f=parseFloat(labelStyle.fontSize)||12,w=parseInt(labelStyle.fontWeight,10)||400;
        const required=(f>=24||(f>=18.66&&w>=700))?3:4.5;
        const measured=ratio(fg,ownBg);
        if(measured+0.12<required)failures.push({
          tag:el.tagName.toLowerCase(),className:String(el.className||"").slice(0,90),
          text:labelText.slice(0,55),fg:labelStyle.color,
          bg:st.backgroundColor,contrast:Number(measured.toFixed(2)),required
        });
      }
      return {count:failures.length,failures:failures.slice(0,12)};
    });
    assert.equal(contrastAudit.count,0,"130HH text contrast failed in "+mode+" width "+width+": "+JSON.stringify(contrastAudit.failures));
    const backgroundLeaks=await page.evaluate(root=>{
      const area=document.querySelector(root);
      const candidates=[...area.querySelectorAll('button,input,select,textarea,article,.demoPanel,.tableCard,.energyCard,.energyTableCard,.inventoryTableCard,.inventorySearch,.inventory130SearchField,.contractorSearch,.contractorRowCard,.proTaskCard,.maintenanceBoard,.maintenanceSchedule,.demoDocCat'),
        ...document.querySelectorAll('.estaTopbar button,#updateMobileNav button')];
      return candidates.filter(el=>el.getClientRects().length&&!el.closest('.hide,[aria-hidden="true"]'))
        .filter(el=>{const s=getComputedStyle(el);return s.backgroundColor==='rgb(243, 222, 191)'&&s.backgroundImage==='none'})
        .map(el=>({id:el.id,cls:el.className,text:el.textContent.trim().slice(0,45)}));
    },root);
    assert.deepEqual(backgroundLeaks,[],"130HH control/card reused page background in "+mode+" "+width+"px: "+JSON.stringify(backgroundLeaks));

    // Every visible 130HH route is inspected for actual form geometry and
    // interactive SVG opacity, not just correct colors on the main background.
    const componentAudit=await page.evaluate(root=>{
      const pageRoot=document.querySelector(root);
      const visible=el=>{
        if(!el||!el.getClientRects().length)return false;
        const c=getComputedStyle(el);
        return c.display!=="none"&&c.visibility!=="hidden"&&
          !el.closest(".hide,[aria-hidden='true']");
      };
      const controls=[...pageRoot.querySelectorAll("input:not([type='file']):not([type='hidden']),textarea,select,button")]
        .filter(visible);
      const icons=[...pageRoot.querySelectorAll("button svg,.formSectionMark svg,.summaryIcon svg,.workEntryHeaderIcon svg")]
        .filter(visible);
      const heights=controls.map(el=>({id:el.id||el.className||el.tagName,
        height:Math.round(el.getBoundingClientRect().height),
        minHeight:getComputedStyle(el).minHeight,maxHeight:getComputedStyle(el).maxHeight,
        transform:getComputedStyle(el).transform}));
      const dimIcons=icons.filter(el=>{
        const c=getComputedStyle(el),parent=el.closest("button");
        return Number(c.opacity)<.5&&!parent?.disabled;
      }).map(el=>({parent:el.parentElement?.id||el.parentElement?.className||"",
        color:getComputedStyle(el).color,opacity:getComputedStyle(el).opacity})).slice(0,8);
      return {controls:controls.length,icons:icons.length,
        heights:heights.slice(0,8),
        shortControls:heights.filter(x=>x.height<44).slice(0,20),dimIcons};
    },root);
    console.log("130HH ALL-PAGE FORM/ICON AUDIT "+mode+" "+width+"px "+JSON.stringify(componentAudit));
    assert.equal(componentAudit.dimIcons.length,0,
      "Visible 130HH enabled control/icon dimmed below 50% in "+mode+" "+width+
      "px: "+JSON.stringify(componentAudit.dimIcons));
    if(width<768)assert.equal(componentAudit.shortControls.length,0,
      "130HH mobile controls below 44px in "+mode+" "+width+"px: "+JSON.stringify(componentAudit.shortControls));

    if(mode==="contractor"){
      const fit=await page.evaluate(()=>{
        const stats=[...document.querySelectorAll("#contractorPage .contractorStats article")];
        const input=document.querySelector("#contractorSearch");
        return {height:Math.max(...stats.map(x=>x.getBoundingClientRect().height)),
          clipped:stats.some(x=>[...x.querySelectorAll("small,b")].some(t=>t.scrollHeight>t.clientHeight+1)),
          inputBg:getComputedStyle(input).backgroundColor,
          wrapperBg:getComputedStyle(input.closest(".contractorSearch")).backgroundColor};
      });
      assert.ok(fit.height<=(width<761?74:82),"contractor KPI too tall: "+JSON.stringify(fit));
      assert.equal(fit.clipped,false,"contractor KPI label clipped: "+JSON.stringify(fit));
      assert.equal(fit.inputBg,"rgba(0, 0, 0, 0)","contractor search has nested surface");
      assert.equal(fit.wrapperBg,"rgb(241, 231, 239)","contractor search surface");
    }
    if(mode==="inventory"){
      const fit=await page.evaluate(()=>{
        const rail=document.querySelector("#materialMonthTabs");
        const month=rail.querySelector("button:not(.active)");
        const search=document.querySelector("#inventory130Search");
        const tools=document.querySelector("#inventoryToolsPane");
        const materials=document.querySelector("#inventoryMaterialsPane");
        tools.classList.remove("hide");materials.classList.add("hide");
        const toolCards=[...tools.querySelectorAll(".toolsStats article")];
        const toolHeight=Math.max(...toolCards.map(x=>x.getBoundingClientRect().height));
        const toolClipped=toolCards.some(x=>[...x.querySelectorAll("small,b,em")].some(t=>getComputedStyle(t).display!=="none"&&t.scrollHeight>t.clientHeight+1));
        const toolBg=getComputedStyle(tools.querySelector(".toolsMainCard")).backgroundColor;
        tools.classList.add("hide");materials.classList.remove("hide");
        return {railBg:getComputedStyle(rail).backgroundColor,monthBg:getComputedStyle(month).backgroundColor,
          searchBg:getComputedStyle(search).backgroundColor,toolHeight,toolClipped,toolBg};
      });
      assert.equal(fit.railBg,"rgba(0, 0, 0, 0)","month rail retained an outer fill");
      assert.equal(fit.searchBg,"rgba(0, 0, 0, 0)","material search has nested surface");
      assert.ok(["rgb(255, 253, 252)","rgb(255, 246, 233)"].includes(fit.monthBg),"month tiles retained blue fill");
      assert.ok(fit.toolHeight<=(width<761?72:80),"tool KPI too tall: "+JSON.stringify(fit));
      assert.equal(fit.toolClipped,false,"tool KPI label clipped: "+JSON.stringify(fit));
      assert.ok(["rgb(241, 231, 239)","rgb(255, 253, 252)"].includes(fit.toolBg),"tool list retained navy surface");
    }

    if(mode==="energy"){
      const energyAudit=await page.evaluate(()=>{
        const root=document.querySelector("#energyPage");
        const visible=el=>!!el&&!!el.getClientRects().length&&
          getComputedStyle(el).display!=="none"&&!el.closest(".hide");
        const measure=el=>{
          if(!visible(el))return null;
          const c=getComputedStyle(el),r=el.getBoundingClientRect();
          return {h:+r.height.toFixed(2),w:+r.width.toFixed(2),left:r.left,right:r.right,
            color:c.webkitTextFillColor||c.color,background:c.backgroundColor,opacity:c.opacity,
            stroke:c.stroke,fill:c.fill,filter:c.filter};
        };
        const photos=[...root.querySelectorAll("#energyForm .energyImageField .energyPhotoActions button")].map(measure).filter(Boolean);
        const photoIcons=[...root.querySelectorAll("#energyForm .energyImageField .energyPhotoActions svg")].map(measure).filter(Boolean);
        return {
          photos,photoIcons,
          noteToggle:measure(root.querySelector("#energyNoteToggle")),
          noteInput:measure(root.querySelector("#energyNote")),
          mainIndex:measure(root.querySelector("#energyValue")),
          date:measure(root.querySelector("#energyDate")),
          people:measure(root.querySelector("#energyPeopleButton")),
          save:measure(root.querySelector("#energySaveBtn")),
          form:measure(root.querySelector("#energyForm")),
          notePlaceholder:root.querySelector("#energyNote").placeholder,
          noteCollapsed:root.querySelector(".energyNoteField").classList.contains("energyNoteCollapsed"),
          tabSizes:[...root.querySelectorAll('.energyTabs button')].filter(visible).map(measure),
          hiddenTabs:[...root.querySelectorAll('.energyTabs button.hide')].map(x=>getComputedStyle(x).display),
          tabWrapper:getComputedStyle(root.querySelector('.energyTabs')).backgroundColor,
          kpiWrapper:getComputedStyle(root.querySelector('.energySummaryCards')).backgroundColor,
          kpiHeights:[...root.querySelectorAll('.energySummaryCards article')].map(x=>x.getBoundingClientRect().height),
          mark:measure(root.querySelector(".energyCardTitle .energyMark svg"))
        };
      });
      const label="Energy 130HH "+width+"px";
      assert.equal(energyAudit.tabSizes.length,2,label+' must show only the supported electricity/water tabs');
      assert.ok(energyAudit.hiddenTabs.every(x=>x==='none'),label+' unsupported tabs must not occupy any space');
      assert.ok(Math.max(...energyAudit.tabSizes.map(x=>x.w))-Math.min(...energyAudit.tabSizes.map(x=>x.w))<2,label+' energy tabs must have equal widths');
      assert.equal(energyAudit.tabWrapper,'rgba(0, 0, 0, 0)',label+' tabs must not have an outer fill');
      assert.equal(energyAudit.kpiWrapper,'rgba(0, 0, 0, 0)',label+' KPI strip must not have an outer fill');
      assert.ok(energyAudit.kpiHeights.every(x=>Math.abs(x-44)<1),label+' KPI cards must be 44px');
      assert.equal(energyAudit.photos.length,2,label+" camera+library count");
      assert.equal(energyAudit.photoIcons.length,2,label+" photo SVG count");
      const [camera,library]=energyAudit.photos;
      for(const [name,x] of [["camera",camera],["library",library]]){
        assert.ok(Math.abs(x.h-44)<=1,label+" "+name+" must be 44px: "+JSON.stringify(x));
        assert.ok(x.w>=110,label+" "+name+" must fit its icon and label");
        assert.equal(x.color,"rgb(84, 47, 18)",label+" "+name+" text must use cream ink");
      }
      assert.equal(camera.background,"rgb(243, 222, 199)",label+" camera button must be plum");
      assert.equal(library.background,camera.background,label+" camera and gallery must share one color");
      assert.equal(energyAudit.noteToggle,null,label+" add/hide note toggle must not be visible");
      assert.ok(energyAudit.noteInput,label+" note field must always be visible");
      assert.equal(energyAudit.notePlaceholder,"Ghi chú",label+" note placeholder");
      assert.equal(energyAudit.noteCollapsed,false,label+" note must not collapse");
      assert.equal(energyAudit.save.background,"rgb(122, 67, 0)",label+" save uses distinct copper");
      assert.ok(energyAudit.save.left>=energyAudit.form.left-1&&energyAudit.save.right<=energyAudit.form.right+1,
        label+" save action escaped form: "+JSON.stringify(energyAudit));
      assert.equal(energyAudit.save.h,44,label+" save action height");
      for(const icon of energyAudit.photoIcons){
        assert.equal(icon.opacity,"1",label+" photo icon must not be faded");
        assert.equal(icon.color,"rgb(84, 47, 18)",label+" icon ink");
        assert.ok(icon.w>=16&&icon.h>=16,label+" icon appears too small "+JSON.stringify(icon));
      }
      for(const [name,field] of [["date",energyAudit.date],["main index",energyAudit.mainIndex],["performer",energyAudit.people],["note toggle",energyAudit.noteToggle],["note input",energyAudit.noteInput]]){
        if(!field)continue;
        assert.ok(Math.abs(field.h-44)<=1,label+" "+name+" not aligned 44px: "+JSON.stringify(field));
      }
      if(energyAudit.mark){
        assert.equal(energyAudit.mark.opacity,"1",label+" meter header icon faded");
        assert.equal(energyAudit.mark.color,"rgb(255, 255, 255)",label+" header meter icon color");
      }
      console.log("PASS "+label+" 44px energy controls, clear SVG, light photo buttons, compact note");
    }

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
     assert.equal(workReadability.starMarkedColor,"rgb(244, 180, 0)","130HH priority star must be bright gold when marked");
     assert.equal(workReadability.performerBackground,"rgb(241, 231, 239)","130HH performer chip must use a light ESTA surface");
     assert.equal(workReadability.performerTextColor,"rgb(65, 20, 55)","130HH performer name must be readable plum");
     assert.equal(workReadability.dividerColor,"rgb(164, 100, 39)","130HH desktop work rows must have a strong copper divider");
     assert.equal(workReadability.mobileDividerColor,"rgb(164, 100, 39)","130HH mobile work cards must have a strong copper divider");
     assert.equal(workReadability.linkBackground,"rgb(255, 253, 252)","130HH work-link panel must use the ESTA cream surface");
     assert.equal(workReadability.linkSummaryColor,"rgb(65, 20, 55)","130HH work-link title must use plum, not blue");
     assert.equal(workReadability.linkMaterialTitleColor,"rgb(65, 20, 55)","130HH materials heading must use plum");
     assert.equal(workReadability.addButtonBackground,"rgb(122, 67, 0)","130HH add-material button must use plum");
     assert.equal(workReadability.addButtonColor,"rgb(255, 255, 255)","130HH add-material button text must use cream");
     if(width===390){
       const formState=await page.evaluate(()=>{
         const status=document.querySelector('#status');status.value='Đã hoàn thành';status.dispatchEvent(new Event('change',{bubbles:true}));
         sync130QuickCompletion();
         const css=x=>getComputedStyle(x),root=document.querySelector('#workPage');
         document.querySelector('#mobileCards').innerHTML=workMobileCard130({id:5002,d:'2026-12-05',c:'Thay đèn trần',s:'Đã hoàn thành',t:'Hằng ngày',a:'Nguyễn An',performers:['Nguyễn An'],result:'Đạt',imgs:['offline.jpg']});
         const card=root.querySelector('.workCompact130'),meta=card.querySelector('.workCardMetaLine');
         const person=document.createElement('label');person.className='peopleOption';person.textContent='Nhà thầu';
         document.querySelector('#taskPeopleOptions').appendChild(person);
         const peopleBackgrounds=[css(document.querySelector('#taskPeopleMenu')).backgroundColor,css(person).backgroundColor];person.remove();
         card.querySelector('.workCardAttachments').insertAdjacentHTML('afterbegin','<div class="demoLinkChips"><span class="demoLinkChip">Đèn LED âm trần 12W × 2</span></div>');
         const attachments=[...card.querySelector('.workCardAttachments').children].map(x=>x.getBoundingClientRect());
         const boxes=[...meta.children].map(x=>x.getBoundingClientRect());
         return {requiredMark:getComputedStyle(root.querySelector('.workContent>span'),'::after').webkitTextFillColor,
           contentBorder:css(document.querySelector('#content')).borderColor,
           selected:css(root.querySelector('#workChoices-type [aria-checked="true"]')).backgroundColor,
           idle:css(root.querySelector('#workChoices-type [aria-checked="false"]')).backgroundColor,
           resultBg:css(document.querySelector('#task130Result')).backgroundColor,
           resultParentBg:css(document.querySelector('#task130ResultField')).backgroundColor,
           peopleBackgrounds,
           resultBorder:css(document.querySelector('#task130Result')).borderColor,
           quickSaveBg:css(document.querySelector('#task130QuickSave')).backgroundColor,
           quickSaveText:css(document.querySelector('#task130QuickSave')).webkitTextFillColor,
           countDisplay:css(root.querySelector('.workTableMeta')).display,
           sameLine:Math.max(...boxes.map(x=>x.top))-Math.min(...boxes.map(x=>x.top))<12,
           attachmentLine:Math.max(...attachments.map(x=>x.top))-Math.min(...attachments.map(x=>x.top))<8,
           menuClosed:!card.querySelector('details').open,oldFooter:!!card.querySelector('.mobileCardFoot')};
       });
       assert.equal(formState.requiredMark,'rgb(180, 35, 50)');
       assert.equal(formState.contentBorder,'rgb(218, 155, 163)');
       assert.notEqual(formState.selected,formState.idle);
       assert.equal(formState.resultBg,'rgb(241, 231, 239)');
       assert.notEqual(formState.resultParentBg,formState.resultBg,'result parent and input must be visually distinct');
       assert.notEqual(...formState.peopleBackgrounds,'people container and individual choices must be visually distinct');
       assert.equal(formState.idle,'rgb(255, 253, 252)','unselected work choices must be white');
       assert.equal(formState.resultBorder,'rgb(218, 155, 163)');
       assert.equal(formState.quickSaveBg,'rgb(122, 67, 0)');
       assert.equal(formState.quickSaveText,'rgb(255, 255, 255)');
       assert.equal(formState.countDisplay,'none');
       assert.ok(formState.sameLine,'normal task metadata must fit one line: '+JSON.stringify(formState));
       assert.ok(formState.attachmentLine,'photo count and material must share a row: '+JSON.stringify(formState));
       assert.ok(formState.menuClosed&&!formState.oldFooter,'task actions must live inside a collapsed menu');
       await page.locator('.workCompact130 .workCardMenu summary').click();
       assert.equal(await page.locator('.workCompact130 .workCardMenu[open] button').count(),2);
       const menuFit=await page.evaluate(()=>{
         const menu=document.querySelector('.workCardMenu[open]>div');
         return {width:menu.getBoundingClientRect().width,clipped:[...menu.querySelectorAll('button')].some(x=>x.scrollWidth>x.clientWidth+1)};
       });
       assert.ok(menuFit.width>=160&&!menuFit.clipped,'task action menu text must fit '+JSON.stringify(menuFit));
       if(process.env.ESTA_SCREENSHOTS==='1'){
         await page.locator('#mobileCards').screenshot({path:path.join(output,'work-card-menu-390.png')});
         await page.locator('#task130ResultField').screenshot({path:path.join(output,'work-completed-390.png')});
       }
       await page.evaluate(()=>{document.querySelector('.workCardMenu').open=false;document.querySelector('#status').value='Đang thực hiện';document.querySelector('#status').dispatchEvent(new Event('change',{bubbles:true}));render()});
     }
    }
    assert.ok(state.topbar.includes("rgb(65, 20, 55)")&&state.topbar.includes("rgb(43, 21, 38)"),
     "Unbranded blue header "+mode+" width "+width+": "+JSON.stringify(state));
    assert.equal(state.area,cream,"Page background in "+mode+" width "+width);
    if(state.overflow>4){
      // Module switch can report previous-frame scroll geometry; remeasure after layout settles.
      await page.waitForTimeout(200);
      const stableOverflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-document.documentElement.clientWidth);
      if(stableOverflow<=4){console.log("Transient module-switch scroll geometry settled: "+mode+" "+width+"px ("+state.overflow+"px)");}
      else {
      const offenders=await page.evaluate(()=>[...document.querySelectorAll("html,body,#app,#app *")].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return (e.scrollWidth>e.clientWidth+12||r.right>document.documentElement.clientWidth+8||r.width>document.documentElement.clientWidth+20)&&s.visibility!=="hidden"&&s.display!=="none";}).map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,id:e.id,cls:String(e.className||"").slice(0,75),right:Math.round(r.right),width:Math.round(r.width),scroll:e.scrollWidth,client:e.clientWidth,overflow:s.overflowX,position:s.position,pseudo:getComputedStyle(e,"::after").content};}).sort((a,b)=>(b.scroll-b.client)-(a.scroll-a.client)).slice(0,28));
      assert.fail("Horizontal overflow in "+mode+" width "+width+": "+state.overflow+" settled="+stableOverflow+" offenders "+JSON.stringify(offenders));
      }
    }
    for(const key of ["workCard","energyKpi","energyPanel","inventory","energyTable"]){
      if(state[key]!==null)assert.ok([soft,"rgb(238, 225, 234)","rgb(241, 231, 239)"].includes(state[key]),key+" must use a content surface distinct from page background in "+mode+" width "+width+": "+state[key]);
    }
    assert.equal(errors.length,0,"JavaScript errors in "+mode+": "+errors.join(", "));
    if(mode==="inventory"){
     const yearLabels=await page.locator("#inventoryPage .yearMonthHead :is(span,small)").evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).map(n=>parseFloat(getComputedStyle(n).fontSize)));
     assert.ok(yearLabels.every(size=>size>=12),"130HH year table month labels must be at least 12px: "+yearLabels.join(","));
    }
    if(process.env.ESTA_SCREENSHOTS==="1" && ["home","work","energy","inventory","maintenance"].includes(mode)){
     await page.screenshot({path:path.join(output,mode+"-"+width+".png"),fullPage:true});
    }
   }
   const actionColors=await page.evaluate(()=>{
     const save=[...document.querySelectorAll('button[type="submit"]')].filter(x=>/Lưu|Cập nhật|Xác nhận/.test(x.textContent));
     const photos=[...document.querySelectorAll('.imageActionBtn,button[data-energy-picker],.contractorImageAdd')];
     return [...save,...photos].map(x=>({photo:photos.includes(x),id:x.id||x.textContent.trim(),bg:getComputedStyle(x).backgroundColor,
       color:getComputedStyle(x).webkitTextFillColor||getComputedStyle(x).color}));
   });
   for(const action of actionColors){
     assert.equal(action.bg,action.photo?"rgb(243, 222, 199)":"rgb(122, 67, 0)","Inconsistent 130HH save/photo background "+width+"px "+JSON.stringify(action));
     assert.equal(action.color,action.photo?"rgb(84, 47, 18)":"rgb(255, 255, 255)","Inconsistent 130HH save/photo text "+width+"px "+JSON.stringify(action));
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
  console.log("PASS 130HH all project modes across 6 viewport widths; header and 5 key panels use ESTA brand; zero horizontal overflow; other projects/Admin isolated");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
