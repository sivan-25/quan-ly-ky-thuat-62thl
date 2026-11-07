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
(async()=>{const browser=await chromium.launch({headless:true});try{for(const width of [390,1366]){const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();await prep(page,'130HH');
const work=await page.evaluate(()=>{
 showModule('work');
 const rows=[{id:6001,d:'2026-11-05',c:'Kiểm tra đèn',t:'Hằng ngày',s:'Đã hoàn thành',a:'Kỹ thuật dự án',imgs:[]},{id:6002,d:'2026-11-05',c:'Đang xử lý',t:'Hằng ngày',s:'Đang thực hiện',a:'Kỹ thuật',imgs:[]},{id:6003,d:'2026-11-05',dueDate:'2026-01-01',dueDateExplicit:true,c:'Quá hạn',t:'Hằng ngày',s:'Đang thực hiện',a:'Kỹ thuật',imgs:[]}];
 document.querySelector('#mobileCards').innerHTML=rows.map(workMobileCard130).join('');
 const card=document.querySelector('.workCompact130');card.querySelector('.workCardAttachments').innerHTML='<span class="demoLinkChip">Đèn LED âm trần 12W × 5</span>';
 return {states:[...document.querySelectorAll('.workCompact130')].map(x=>x.dataset.workState),colors:[...document.querySelectorAll('.workCompact130')].map(x=>getComputedStyle(x).backgroundColor),sizes:[...card.querySelectorAll('.badge,.typeBadge,.performerChips>span,.demoLinkChip')].map(x=>({text:x.textContent,h:parseFloat(getComputedStyle(x).minHeight),font:getComputedStyle(x).fontSize}))};
});assert.deepEqual(work.states,['done','doing','late']);assert.equal(new Set(work.colors).size,3);assert.ok(work.sizes.every(x=>x.h===20&&x.font==='10px'),JSON.stringify(work));
for(const mode of ['energy-people' ,'inventory','contractor-detail','contractor-edit','maintenance','maintenance-plan']){
await page.evaluate(async mode=>{
if(mode==='energy-people'){showModule('energy');window.eval('energyType="water";projectPeople=[{name:"Kỹ thuật"},{name:"Nhà thầu"},{name:"Văn"}];');renderEnergy();renderPeopleSelector('energy');document.querySelector('#energyPeopleButton').click();}
if(mode==='inventory'){document.querySelector('#energyPeopleMenu').classList.add('hide');showModule('inventory');await new Promise(r=>setTimeout(r,200));window.eval('inventoryMaterials=[{id:"m1",name:"Đèn LED âm trần 12W",unit:"Cái",opening_qty:1,min_qty:5,tracking_start_date:"2026-01-01"}];inventoryTransactions=[{id:"tx1",material_id:"m1",tx_type:"out",qty:1,tx_date:"2026-11-05",performer:"Kỹ thuật",note:"Thay đèn"}];');renderInventory();}
if(mode==='contractor-detail'){showModule('contractor');await new Promise(r=>setTimeout(r,200));window.eval('contractors=[{id:"c1",name:"Công ty Kỹ thuật THT",specialty:"Điện",contact_name:"Anh Văn",phone:"0901234567",status:"Đang hợp tác",note:"Bảo trì hệ thống điện"}];contractorJobs=[{id:"j1",contractor_id:"c1",work_date:"2026-11-05",work_content:"Kiểm tra tủ điện tầng 5",status:"Đang thực hiện",cause:"Kiểm tra định kỳ",solution:"Đang kiểm tra",note:"Theo dõi",images:[]}];');renderContractors();openContractorDetail('c1');}
if(mode==='contractor-edit')editContractor('c1');
if(mode==='maintenance'){document.querySelector('#contractorModal').classList.add('hide');showModule('maintenance');await new Promise(r=>setTimeout(r,400));}
if(mode==='maintenance-plan'){document.querySelector('#m130Create')?.click();}
},mode);await page.waitForTimeout(100);
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

assert.deepEqual(contrastAudit.failures,[],width+' '+mode+' contrast');console.log('PASS detail',width,mode);

await page.screenshot({path:'/tmp/esta-deep-'+mode+'-'+width+'.png'});
}
await context.close();}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});