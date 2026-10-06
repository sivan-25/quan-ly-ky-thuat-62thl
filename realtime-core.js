(() => {
  "use strict";
  const SUPABASE_JS_URL="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2";
  let client=null,channel=null,reconnectTimer=null,lastToken="",lastEventAt="",status="idle",libraryPromise=null;
  const PILOT_ID="NEW10";
  const tables=[
    "project_snapshots","building_people","incidents","inspections","technical_documents","report_registry",
    "inventory_materials","inventory_material_transactions","inventory_tools",
    "maintenance_assets","maintenance_records","contractors","contractor_jobs",
    "construction_materials","construction_material_logs","construction_material_transactions"
  ];
  function active(){
    try{return String(currentBuilding?.id||"")===PILOT_ID&&!!projectOverviewActive}catch(_){return false}
  }
  function token(){
    try{return centralSession?.access_token||""}catch(_){return""}
  }
  function setStatus(value,detail=""){
    status=value;
    window.dispatchEvent(new CustomEvent("esta:new10:realtime-status",{detail:{status:value,detail,lastEventAt}}));
  }
  function debounce(key,fn,ms=250){
    clearTimeout(debounce.timers[key]);debounce.timers[key]=setTimeout(fn,ms);
  }
  debounce.timers={};
  function refreshFor(table){
    lastEventAt=new Date().toISOString();
    if(table==="project_snapshots"){
      debounce("snapshot",()=>{try{pollProjectSnapshot()}catch(_){}},180);return;
    }
    if(table==="building_people"){
      debounce("people",()=>{try{loadProjectPeople(PILOT_ID)}catch(_){}},220);return;
    }
    if(table.startsWith("inventory_")){
      if(document.getElementById("app")?.classList.contains("inventoryMode"))debounce("inventory",()=>{try{loadInventoryData(PILOT_ID,true)}catch(_){}},250);
    }else if(table.startsWith("maintenance_")){
      if(document.getElementById("app")?.classList.contains("maintenanceMode"))debounce("maintenance",()=>{try{loadMaintenanceData(PILOT_ID,true)}catch(_){}},250);
    }else if(table==="contractors"||table==="contractor_jobs"){
      if(document.getElementById("app")?.classList.contains("contractorMode"))debounce("contractor",()=>{try{loadContractorData(PILOT_ID,true)}catch(_){}},250);
    }else if(table.startsWith("construction_")){
      if(document.getElementById("app")?.classList.contains("constructionMode"))debounce("construction",()=>{try{loadConstructionMaterialData(PILOT_ID,true)}catch(_){}},250);
    }
    window.dispatchEvent(new CustomEvent("esta:new10:realtime-refresh",{detail:{table}}));
  }
  function stop(){
    clearTimeout(reconnectTimer);reconnectTimer=null;
    try{if(client&&channel)client.removeChannel(channel)}catch(_){}
    channel=null;setStatus("idle");
  }
  function scheduleReconnect(){
    clearTimeout(reconnectTimer);
    reconnectTimer=setTimeout(()=>{if(active())connect(true)},8000);
  }
  function ensureLibrary(){
    if(window.supabase?.createClient)return Promise.resolve(true);
    if(libraryPromise)return libraryPromise;
    libraryPromise=new Promise(resolve=>{
      const existing=document.querySelector('script[data-esta-supabase-realtime]');
      if(existing){
        const finish=()=>resolve(!!window.supabase?.createClient);
        existing.addEventListener("load",finish,{once:true});
        existing.addEventListener("error",()=>resolve(false),{once:true});
        setTimeout(finish,4000);
        return;
      }
      const script=document.createElement("script");
      script.src=SUPABASE_JS_URL;
      script.async=true;
      script.dataset.estaSupabaseRealtime="1";
      script.onload=()=>resolve(!!window.supabase?.createClient);
      script.onerror=()=>resolve(false);
      document.head.appendChild(script);
      setTimeout(()=>resolve(!!window.supabase?.createClient),4000);
    });
    return libraryPromise;
  }
  async function connect(force=false){
    if(!active())return stop();
    const jwt=token();if(!jwt)return;
    const ready=await ensureLibrary();
    if(!ready){setStatus("fallback","Realtime CDN unavailable · dùng polling");scheduleReconnect();return}
    if(channel&&!force&&lastToken===jwt)return;
    stop();
    try{
      client=client||window.supabase.createClient(SB_URL,SB_KEY,{
        auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
        realtime:{params:{eventsPerSecond:10}}
      });
      client.realtime.setAuth(jwt);
      lastToken=jwt;
      let ch=client.channel("esta-new10-live",{config:{broadcast:{self:false}}});
      for(const table of tables){
        ch=ch.on("postgres_changes",{event:"*",schema:"public",table,filter:"building_id=eq."+PILOT_ID},()=>refreshFor(table));
      }
      channel=ch.subscribe(state=>{
        if(state==="SUBSCRIBED")setStatus("live");
        else if(state==="CHANNEL_ERROR"||state==="TIMED_OUT"||state==="CLOSED"){setStatus("fallback",state);scheduleReconnect()}
      });
    }catch(err){
      setStatus("fallback",String(err?.message||err||""));
      scheduleReconnect();
    }
  }
  function lifecycle(){if(active())connect();else if(channel)stop()}
  window.addEventListener("pageshow",lifecycle);
  window.addEventListener("focus",lifecycle);
  window.addEventListener("online",()=>setTimeout(()=>connect(true),500));
  window.addEventListener("offline",()=>setStatus("fallback","offline"));
  setInterval(lifecycle,5000);
  setTimeout(lifecycle,600);

  window.ESTA_REALTIME=Object.freeze({
    connect:()=>connect(true),stop,status:()=>({status,lastEventAt,fallbackPollingMs:5000,libraryUrl:SUPABASE_JS_URL}),version:"1.1"
  });
})();