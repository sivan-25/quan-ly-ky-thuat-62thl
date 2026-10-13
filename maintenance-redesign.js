/* ESTA | Giao diện bảo trì thống nhất. Không thay đổi schema hay thao tác lưu. */
(function () {
  "use strict";
  const $=id=>document.getElementById(id);
  const page=$("maintenancePage"), app=$("app");
  if(!page||!app)return;
  const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pad=n=>String(n).padStart(2,"0");
  const today=()=>new Date().toLocaleDateString("en-CA");
  const icon=(name)=>({
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    pdf:'<path d="M7 3h8l4 4v14H7zM15 3v5h5M10 13h6M10 17h6"/>',
    left:'<path d="m15 18-6-6 6-6"/>',
    right:'<path d="m9 18 6-6-6-6"/>',
    list:'<path d="M8 6h12M8 12h12M8 18h12M3 6h1M3 12h1M3 18h1"/>',
    cards:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>'
  })[name]||"";
  const svg=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+icon(name)+'</svg>';
  const head=page.querySelector(".maintenanceHero");
  const shell=document.createElement("div");
  shell.id="estaMaintenanceRedesign";
  shell.innerHTML='<div class="estamSummary"><div class="estamMonthNav"><button type="button" id="estamPrev" aria-label="Tháng trước">'+svg("left")+'</button><button type="button" id="estamMonth" title="Nhấp để xem toàn bộ 12 tháng">Tháng</button><button type="button" id="estamNext" aria-label="Tháng sau">'+svg("right")+'</button></div><div id="estamStats" class="estamStats"></div></div>'+
    '<div class="estamToolbar"><div class="estamFilterArea"><button type="button" class="estamSearchBtn" id="estamSearch" aria-label="Mở ô tìm kiếm" aria-expanded="false" title="Tìm bảo trì">'+svg("search")+'</button><div id="estamNativeFilters" class="estamNativeFilters"></div></div><div class="estamActionArea"><div class="estamViewSwitch" role="group" aria-label="Kiểu hiển thị"><button type="button" data-estam-view="rows">'+svg("list")+'<span>Bảng</span></button><button type="button" data-estam-view="cards">'+svg("cards")+'<span>Thẻ</span></button><button type="button" data-estam-view="calendar">'+svg("calendar")+'<span>Lịch</span></button><button type="button" data-estam-view="timeline">'+svg("clock")+'<span>Timeline</span></button></div><div id="estamNativeActions" class="estamNativeActions"></div></div></div>'+
    '<div id="estamExtraView" class="estamExtraView" hidden></div>';
  head?.insertAdjacentElement("afterend",shell);
  const origins=new Map();
  let mode="",view="rows", extraEntries=[], queued=false, lastMonth="", ready=false;
  const move=(el,slot)=>{
    if(!el)return;
    if(!origins.has(el)){const marker=document.createComment("ESTA original position");el.parentNode.insertBefore(marker,el);origins.set(el,marker);}
    if(el.parentNode!==slot)slot.appendChild(el);
  };
  const restore=()=>{
    for(const [el,marker] of origins){if(marker.parentNode)marker.parentNode.insertBefore(el,marker);marker.remove();}
    origins.clear();
  };
  const currentMode=()=>{
    const b=typeof currentBuilding==="undefined"?"":String(currentBuilding?.id||"");
    return b==="130HH"?"130":b==="68PĐL"?"68":"standard";
  };
  const active=()=>!page.classList.contains("hide")&&app.classList.contains("maintenanceMode");
  const selectedMonth=()=>{
    const source=mode==="130"?$('m130Months')?.querySelector(".sel"):mode==="68"?$('ma68Months')?.querySelector(".sel"):$("maintenanceMonthStrip")?.querySelector(".active");
    return Number(source?.dataset.m130Month||source?.dataset.m||source?.dataset.maintMonth||new Date().getMonth()+1);
  };
  const selectedYear=()=>mode==="130"?Number($("m130Year")?.textContent.match(/\d{4}/)?.[0]||new Date().getFullYear()):mode==="68"?2026:new Date().getFullYear();
  const selectMonth=(m,stepYear=0)=>{
    if(mode==="130"){
      if(stepYear)$(stepYear<0?"m130Prev":"m130Next")?.click();
      $("m130Months")?.querySelector('[data-m130-month="'+m+'"]')?.click();
    }else if(mode==="68")$("ma68Months")?.querySelector('[data-m="'+m+'"]')?.click();
    else {
      const el=$("maintenanceMonthStrip")?.querySelector('[data-maint-month="'+m+'"]');
      if(el&&!el.classList.contains("active"))el.click();
    }
    refreshHeader();
    if(view==="calendar"||view==="timeline")renderExtra();
  };
  const navigate=delta=>{
    let m=selectedMonth()+delta,change=0;
    if(m<1){m=12;change=-1;}
    if(m>12){m=1;change=1;}
    if(change&&mode!=="130"){m=delta<0?1:12;change=0;}
    selectMonth(m,change);
  };
  function refreshHeader(){
    if(!active())return;
    const label=pad(selectedMonth())+"/"+selectedYear();
    if($("estamMonth").textContent!==label)$("estamMonth").textContent=label;
    if(mode==="130"){
      const stats=$("m130Stats");
      if(!stats)return;
      let total=stats.querySelector(".m130Kpi.estamTotal");
      if(!total){total=document.createElement("div");total.className="m130Kpi estamTotal";total.innerHTML='<b>—</b><span>Tổng</span>';stats.prepend(total);}
      const match=$("m130ListCount")?.textContent.match(/\/\s*(\d+)/);
      if(match&&total.querySelector("b").textContent!==match[1])total.querySelector("b").textContent=match[1];
    } else if(mode==="standard"){
      const stats=page.querySelector(".maintenanceStats");
      if(!stats)return;
      const assets=typeof maintenanceAssets!=="undefined"?maintenanceAssets:[];
      const now=today(),next=new Date(now+"T12:00:00");next.setDate(next.getDate()+7);
      const limit=next.toLocaleDateString("en-CA");
      const nums=[assets.filter(a=>a.next_due_date===now&&a.status!=="Ngừng sử dụng").length,assets.filter(a=>a.next_due_date>=now&&a.next_due_date<=limit&&a.status!=="Ngừng sử dụng").length];
      const labels=["Hôm nay","7 ngày tới"],classes=["estamToday","estamWeek"];
      labels.forEach((label,i)=>{
        let card=stats.querySelector("article."+classes[i]);
        if(!card){card=document.createElement("article");card.className="estamAddedStat "+classes[i];card.innerHTML='<div><small>'+label+'</small><b>0</b><em>Lịch bảo trì</em></div>';stats.appendChild(card);}
        if(card.querySelector("b").textContent!==String(nums[i]))card.querySelector("b").textContent=String(nums[i]);
      });
    }else{
      const stats=$("ma68Stats");
      if(!stats)return;
      let card=stats.querySelector(".estam68Extra");
      if(!card){card=document.createElement("div");card.className="estam68Extra";card.innerHTML="<b>0</b><span>Hôm nay</span>";stats.appendChild(card);}
      const value=[...($("ma68Content")?.querySelectorAll(".ma68Entry")||[])].filter(n=>n.querySelector("p")?.textContent.includes(new Date().toLocaleDateString("en-GB"))).length;
      if(card.querySelector("b").textContent!==String(value))card.querySelector("b").textContent=String(value);
    }
    shell.querySelectorAll("[data-estam-view]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.estamView===view)));
  }
  function wire(){
    if(!active())return;
    const target=currentMode();
    if(target!==mode){
      restore();mode=target;view="rows";
      shell.dataset.kind=mode;
      page.dataset.estamKind=mode;
      const stats=mode==="130"?$("m130Stats"):mode==="68"?$("ma68Stats"):page.querySelector(".maintenanceStats");
      const filters=mode==="130"?$("maint130")?.querySelector(".m130Toolbar"):mode==="68"?$("maint68")?.querySelector(".ma68Filters"):page.querySelector(".maintenanceBoard .inventoryToolbarActions");
      move(stats,$("estamStats"));move(filters,$("estamNativeFilters"));
      const actions=$("estamNativeActions");
      if(mode==="130"){move($("m130Create"),actions);move($("m130Legacy"),actions);}
      else if(mode==="standard")move($("addMaintenanceAsset"),actions);
      const pdf=mode==="130"?$("m130Pdf"):mode==="68"?$("ma68Pdf"):$("maintenanceExportPdf");
      const topBtn=$("estamHeaderPdf");
      if(topBtn)topBtn.disabled=!pdf;
    }
    refreshHeader();
  }
  function originalPress(selector){const b=$("maint130")?.querySelector(selector);if(b)b.click();}
  function setView(next){
    view=next;
    page.dataset.estamView=next;
    if(mode==="130"){
      if(next==="rows"||next==="cards"){
        originalPress('[data-m130-layout="list"]');
        originalPress('[data-m130-view="'+next+'"]');
      }else originalPress('[data-m130-layout="'+next+'"]');
    }
    $("estamExtraView").hidden=next!=="calendar"&&next!=="timeline"||mode==="130";
    if(mode!=="130"&&(next==="calendar"||next==="timeline"))renderExtra();
    refreshHeader();
  }
  function entries(){
    if(mode==="68"){
      return [...($("ma68Content")?.querySelectorAll(".ma68Entry")||[])].map(node=>{
        const button=node.querySelector("button[data-e]"),name=node.querySelector("h4")?.textContent?.trim()||"Hạng mục bảo trì";
        const info=node.querySelector("p")?.textContent||"",match=info.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        return {name,date:match?match[3]+"-"+match[2]+"-"+match[1]:"",details:node.querySelector("small")?.textContent||"",click:button};
      });
    }
    if(mode==="standard"&&typeof maintenanceAssets!=="undefined"){
      const year=selectedYear(),month=pad(selectedMonth());
      return maintenanceAssets.flatMap(a=>{
        const dates=typeof maintenanceProjectedDates==="function"?maintenanceProjectedDates(a,year):[a.next_due_date];
        return dates.filter(d=>d?.startsWith(year+"-"+month)).map(date=>({name:a.name,date,details:[a.system_type,a.location].filter(Boolean).join(" · "),id:a.id}));
      });
    }
    return [];
  }
  function renderExtra(){
    const box=$("estamExtraView");
    if(!box||mode==="130"||(view!=="calendar"&&view!=="timeline"))return;
    extraEntries=entries();const sorted=extraEntries.map((x,i)=>({...x,index:i})).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999"));
    if(view==="timeline"){
      box.innerHTML='<div class="estamTimeline">'+(sorted.map(e=>'<button type="button" data-estam-open="'+e.index+'"><time>'+(e.date?escapeHtml(e.date.split("-").reverse().join("/")):"Chưa có ngày")+'</time><span><b>'+escapeHtml(e.name)+'</b><small>'+escapeHtml(e.details)+'</small></span></button>').join("")||'<p>Chưa có lịch phù hợp trong tháng.</p>')+'</div>';
    }else{
      const year=selectedYear(),month=selectedMonth(),days=new Date(year,month,0).getDate(),offset=(new Date(year,month-1,1).getDay()+6)%7;
      const cells=Array.from({length:offset},()=>'<div class="estamCalendarBlank"></div>');
      for(let d=1;d<=days;d++){
        const date=year+"-"+pad(month)+"-"+pad(d),matches=sorted.filter(e=>e.date===date);
        cells.push('<div class="estamDay"><strong>'+d+'</strong>'+matches.map(e=>'<button type="button" title="'+escapeHtml(e.name)+'" data-estam-open="'+e.index+'">'+escapeHtml(e.name)+'</button>').join("")+'</div>');
      }
      const unknown=sorted.filter(e=>!e.date);
      box.innerHTML='<div class="estamCalendar">'+["T2","T3","T4","T5","T6","T7","CN"].map(t=>'<strong class="estamWeekday">'+t+'</strong>').join("")+cells.join("")+'</div>'+(unknown.length?'<p class="estamNoDate">'+unknown.length+' công việc chưa xác định ngày: xem chế độ Bảng hoặc Timeline.</p>':"");
    }
    box.hidden=false;
  }
  function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;wire();if(mode!=="130"&&(view==="calendar"||view==="timeline"))renderExtra();},0);}
  const searchBtn=$("estamSearch");
  searchBtn.addEventListener("click",()=>{
    const opened=shell.classList.toggle("estamSearching");
    searchBtn.setAttribute("aria-expanded",String(opened));
    if(opened)(mode==="130"?$("m130Search"):mode==="68"?$("ma68Search"):$("maintenanceSearch"))?.focus();
  });
  $("estamPrev").onclick=()=>navigate(-1);
  $("estamNext").onclick=()=>navigate(1);
  $("estamMonth").onclick=()=>{
    const el=mode==="130"?$("m130Cal"):mode==="68"?$("ma68Months"):page.querySelector(".maintenanceSchedule");
    if(el){el.classList.toggle("estamMonthsOpen");shell.classList.toggle("estamMonthPickerOpen");}
  };
  shell.querySelectorAll("[data-estam-view]").forEach(button=>button.addEventListener("click",()=>setView(button.dataset.estamView)));
  $("estamExtraView").addEventListener("click",ev=>{
    const button=ev.target.closest("[data-estam-open]");if(!button)return;
    const record=extraEntries[Number(button.dataset.estamOpen)];
    if(record?.click)record.click.click();
    else if(record?.id&&typeof openMaintenanceRecord==="function")openMaintenanceRecord(record.id);
  });
  const headerTools=document.querySelector(".estaTopbar .headerTools"),people=$("peopleSettingsBtn");
  if(headerTools&&!$("estamHeaderPdf")){
    const button=document.createElement("button");button.type="button";button.id="estamHeaderPdf";button.className="estamHeaderPdf";button.innerHTML=svg("pdf")+'<span>Xuất PDF</span>';
    button.title="Xuất PDF bảo trì";button.onclick=()=>{
      const target=mode==="130"?$("m130Pdf"):mode==="68"?$("ma68Pdf"):$("maintenanceExportPdf");
      target?.click();
    };
    if(people)people.insertAdjacentElement("afterend",button);else headerTools.appendChild(button);
  }
  document.addEventListener("click",event=>{
    if(event.target.closest("#estaMaintenanceRedesign")||event.target.closest("#maint130")||event.target.closest("#maint68")||event.target.closest(".estaNav"))schedule();
  },true);
  const monitor=id=>{
    const node=$(id);if(!node)return;
    new MutationObserver(schedule).observe(node,{childList:true,subtree:false,characterData:true});
  };
  const init=()=>{
    if(ready)return;ready=true;
    wire();
    ["m130Stats","m130Months","m130ListCount","ma68Stats","ma68Months","ma68Content","maintenanceMonthStrip","maintenanceAssetGrid","maintAssetCount"].forEach(monitor);
    new MutationObserver(schedule).observe(page,{attributes:true,attributeFilter:["class"]});
    schedule();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();