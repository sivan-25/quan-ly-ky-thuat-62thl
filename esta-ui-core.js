(() => {
  "use strict";
  let scheduled=false;

  const formIds=[
    "taskForm","energyForm","materialItemForm","stockTxnForm","toolItemForm",
    "maintenanceAssetForm","maintenanceRecordForm","contractorForm","contractorJobForm",
    "constructionMaterialForm","constructionStockTxnForm","constructionLogForm",
    "demoIncidentForm","demoChecklistForm","technicalDocumentForm"
  ];
  const toolbarSelectors=[
    "#workControls","#energyPage .energyTableTop","#inventoryPage .inventoryHead",
    "#maintenancePage .maintenanceHead","#contractorPage .contractorHead",
    "#constructionMaterialPage .constructionHead",".demoPageTools",".reportCenterTools"
  ];

  function isPilot(){
    try{return window.ESTA_PROJECT_STORE?.isPilot?.() && !!projectOverviewActive}catch(_){return false}
  }
  function decorateForms(){
    for(const id of formIds){
      const el=document.getElementById(id);if(!el)continue;
      el.classList.add("estaFormCore");
      if(!el.getAttribute("novalidate"))el.setAttribute("data-esta-native-validation","enabled");
    }
  }
  function decorateTables(){
    document.querySelectorAll("#app.new10Pilot .modulePage table,#app.new10Pilot .demoSpecialPage table").forEach(table=>{
      table.classList.add("estaDataTableCore");
      if(!table.getAttribute("role"))table.setAttribute("role","table");
      table.querySelectorAll("thead th").forEach(th=>{if(!th.getAttribute("scope"))th.setAttribute("scope","col")});
      const wrap=table.parentElement;
      if(wrap&&wrap!==table&&/table|wrap|scroll/i.test(wrap.className||""))wrap.classList.add("estaTableViewport");
    });
  }
  function decorateToolbars(){
    toolbarSelectors.forEach(sel=>document.querySelectorAll(sel).forEach(el=>el.classList.add("estaToolbarCore")));
  }
  function decorateOverlays(){
    document.querySelectorAll("#app.new10Pilot .modal,#app.new10Pilot .workEditDrawer,#app.new10Pilot [class*='Modal']:not(form)").forEach(el=>{
      el.classList.add("estaOverlayCore");
      if(!el.getAttribute("role"))el.setAttribute("role","dialog");
      if(!el.hasAttribute("aria-modal"))el.setAttribute("aria-modal","true");
    });
  }
  function decorateButtons(){
    document.querySelectorAll("#app.new10Pilot button").forEach(btn=>{
      if(!btn.type)btn.type="button";
      if(!btn.getAttribute("aria-label")&&!text(btn))btn.setAttribute("aria-label",btn.title||"Thao tác");
    });
  }
  function text(el){return String(el?.textContent||"").trim()}
  function decorate(){
    scheduled=false;
    const app=document.getElementById("app");
    if(!app)return;
    app.classList.toggle("estaCoreV2",isPilot());
    if(!isPilot())return;
    decorateForms();decorateTables();decorateToolbars();decorateOverlays();decorateButtons();
    app.dataset.estaCore="2";
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(decorate)}
  const obs=new MutationObserver(schedule);
  window.addEventListener("DOMContentLoaded",()=>{
    const app=document.getElementById("app");
    if(app)obs.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:["class","hidden"]});
    decorate();
  },{once:true});
  window.addEventListener("pageshow",schedule);
  window.addEventListener("esta:new10:sync-status",schedule);
  window.ESTA_UI_CORE=Object.freeze({decorate:schedule,version:"2.0"});
})();