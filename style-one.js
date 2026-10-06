(()=>{
"use strict";

const PILOT_PROJECTS=new Set(["DEMO","127HH"]);
let styleOneChart=null;
let observer=null;

function byId(id){return document.getElementById(id)}
function currentProjectId(){
  try{return String(typeof currentBuilding!=="undefined"&&currentBuilding?.id||"").trim().toUpperCase()}
  catch(_){return ""}
}
function isProjectOpen(){
  const work=byId("navWork");
  return !!currentProjectId()&&!!work&&!work.classList.contains("hide");
}
function pilotActive(){
  return PILOT_PROJECTS.has(currentProjectId())&&isProjectOpen()&&!byId("app")?.classList.contains("adminMode");
}
function safeTasks(){
  try{
    const rows=typeof load==="function"?load():[];
    return Array.isArray(rows)?rows:[];
  }catch(_){return []}
}
function normalizeStatus(value){
  return String(value||"").trim().toLocaleLowerCase("vi-VN");
}
function taskStats(){
  const rows=safeTasks();
  let done=0,doing=0,waiting=0;
  rows.forEach(item=>{
    const s=normalizeStatus(item?.s);
    if(s.includes("hoàn thành")||s.includes("hoan thanh"))done++;
    else if(s.includes("đang")||s.includes("thực hiện")||s.includes("thuc hien"))doing++;
    else waiting++;
  });
  const total=rows.length;
  const rate=total?Math.round(done*100/total):0;
  return {total,done,doing,waiting,rate};
}
function enhanceImages(root=document){
  const app=byId("app");
  if(!app)return;
  const images=[];
  if(root===document)images.push(...app.querySelectorAll("img"));
  else if(root?.nodeType===1&&app.contains(root)){
    if(root.matches?.("img"))images.push(root);
    images.push(...root.querySelectorAll?.("img")||[]);
  }
  images.forEach(img=>{
    if(!img.hasAttribute("loading"))img.loading="lazy";
    if(!img.hasAttribute("decoding"))img.decoding="async";
  });
}
function enhanceA11y(){
  const labels={
    menu:"Mở menu điều hướng",
    logout:"Đăng xuất",
    backupBtn:"Sao lưu dữ liệu",
    restoreBtn:"Khôi phục dữ liệu",
    exportBtn:"Xuất báo cáo PDF"
  };
  Object.entries(labels).forEach(([id,label])=>{
    const el=byId(id);
    if(el&&!el.getAttribute("aria-label"))el.setAttribute("aria-label",label);
  });
  enhanceImages(document);
}
function insightMarkup(){
  return '<section id="styleOneInsights" class="styleOneInsights" aria-labelledby="styleOneInsightTitle">'+
    '<div class="styleOneInsightHead"><div><span>LIVE OVERVIEW</span><h2 id="styleOneInsightTitle">Nhịp độ công việc</h2><p>Phân bổ trạng thái và tỷ lệ hoàn thành hiện tại.</p></div>'+
    '<div class="styleOneInsightIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div></div>'+
    '<div class="styleOneInsightBody">'+
      '<div class="styleOneChartWrap"><canvas id="styleOneWorkChart" role="img" aria-label="Biểu đồ phân bổ trạng thái công việc"></canvas><div id="styleOneChartFallback" class="styleOneChartFallback hide"></div></div>'+
      '<div class="styleOneMetricGrid">'+
        '<article class="styleOneMetric"><span>TỔNG CÔNG VIỆC</span><strong id="styleOneTotal">0</strong><small>Trong dữ liệu hiện tại</small></article>'+
        '<article class="styleOneMetric"><span>ĐANG THỰC HIỆN</span><strong id="styleOneDoing">0</strong><small>Cần tiếp tục xử lý</small></article>'+
        '<article class="styleOneMetric"><span>HOÀN THÀNH</span><strong id="styleOneDone">0</strong><small>Đã xử lý xong</small></article>'+
        '<article class="styleOneMetric"><span>TỶ LỆ HOÀN THÀNH</span><strong id="styleOneRate">0%</strong><small>Trên tổng công việc</small></article>'+
      '</div>'+
    '</div>'+
  '</section>';
}
function ensureInsights(){
  if(!pilotActive()){
    byId("styleOneInsights")?.remove();
    destroyChart();
    return;
  }
  const home=byId("homePage");
  if(!home)return;
  let panel=byId("styleOneInsights");
  if(!panel){
    const anchor=home.querySelector(".homeKpis")||home.querySelector(".homeWelcome");
    if(anchor)anchor.insertAdjacentHTML("afterend",insightMarkup());
    else home.insertAdjacentHTML("afterbegin",insightMarkup());
    panel=byId("styleOneInsights");
  }
  updateInsights();
}
function destroyChart(){
  if(styleOneChart){
    try{styleOneChart.destroy()}catch(_){}
    styleOneChart=null;
  }
}
function fallbackBars(stats){
  const box=byId("styleOneChartFallback"),canvas=byId("styleOneWorkChart");
  if(!box)return;
  const max=Math.max(stats.total,1);
  const rows=[
    ["Hoàn thành",stats.done],
    ["Đang thực hiện",stats.doing],
    ["Khác / chờ",stats.waiting]
  ];
  box.innerHTML=rows.map(([label,value])=>
    '<div class="styleOneFallbackRow"><span>'+label+'</span><div class="styleOneFallbackTrack"><i style="width:'+Math.round(value*100/max)+'%"></i></div><b>'+value+'</b></div>'
  ).join("");
  box.classList.remove("hide");
  if(canvas)canvas.hidden=true;
}
function renderChart(stats){
  const canvas=byId("styleOneWorkChart"),fallback=byId("styleOneChartFallback");
  if(!canvas)return;
  if(typeof window.Chart!=="function"){
    destroyChart();
    fallbackBars(stats);
    return;
  }
  fallback?.classList.add("hide");
  canvas.hidden=false;
  const data=[stats.done,stats.doing,stats.waiting];
  if(styleOneChart){
    styleOneChart.data.datasets[0].data=data;
    styleOneChart.update("none");
    return;
  }
  styleOneChart=new window.Chart(canvas,{
    type:"doughnut",
    data:{
      labels:["Hoàn thành","Đang thực hiện","Khác / chờ"],
      datasets:[{
        data,
        backgroundColor:["#10b981","#6366f1","#cbd5e1"],
        borderColor:"#ffffff",
        borderWidth:4,
        hoverOffset:4
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      cutout:"72%",
      animation:{duration:420},
      plugins:{
        legend:{
          position:"bottom",
          labels:{usePointStyle:true,boxWidth:8,boxHeight:8,padding:14,color:"#64748b",font:{size:10}}
        },
        tooltip:{displayColors:true}
      }
    }
  });
}
function updateInsights(){
  if(!pilotActive())return;
  const stats=taskStats();
  const values={
    styleOneTotal:String(stats.total),
    styleOneDoing:String(stats.doing),
    styleOneDone:String(stats.done),
    styleOneRate:stats.rate+"%"
  };
  Object.entries(values).forEach(([id,value])=>{const el=byId(id);if(el)el.textContent=value});
  renderChart(stats);
}
function syncPilot(){
  const app=byId("app");
  if(!app)return;
  const active=pilotActive();
  app.classList.toggle("styleOnePilot",active);
  document.documentElement.classList.toggle("styleOnePilotRoot",active);
  if(active){
    enhanceA11y();
    ensureInsights();
    updateInsights();
  }else{
    byId("styleOneInsights")?.remove();
    destroyChart();
  }
}
function scheduleSync(){
  window.requestAnimationFrame(()=>window.requestAnimationFrame(syncPilot));
}
function wrapGlobal(name){
  const original=window[name];
  if(typeof original!=="function"||original.__styleOneWrapped)return;
  const wrapped=function(...args){
    const out=original.apply(this,args);
    Promise.resolve(out).finally(scheduleSync);
    return out;
  };
  wrapped.__styleOneWrapped=true;
  window[name]=wrapped;
}
function bindRuntime(){
  ["applyBuildingUI","showHome","showModule","openAdminPortal","renderHomeDashboard"].forEach(wrapGlobal);
  byId("app")?.addEventListener("click",()=>setTimeout(syncPilot,0),true);
  window.addEventListener("focus",syncPilot,{passive:true});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)syncPilot()});
  if(!observer&&byId("app")){
    observer=new MutationObserver(mutations=>{
      let shouldSync=false;
      mutations.forEach(m=>{
        if(m.type==="childList"&&pilotActive()){
          m.addedNodes.forEach(node=>{
            if(node.nodeType===1)enhanceImages(node);
          });
        }
        if(m.type==="attributes"&&m.attributeName==="class")shouldSync=true;
      });
      if(shouldSync)scheduleSync();
    });
    observer.observe(byId("app"),{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  }
}
function start(){
  bindRuntime();
  syncPilot();
  setTimeout(syncPilot,80);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})();