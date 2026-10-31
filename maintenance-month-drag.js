/* ESTA 130 Hong Ha: stable month drag controller for the redesigned calendar. */
(function(){
 "use strict";
 const byId=id=>document.getElementById(id);
 const pad=n=>String(n).padStart(2,"0");
 const api=()=>window.estaMaintenance130DragActions;
 const uiActive=()=>{
  const page=byId("maintenancePage");
  return !!page&&!page.classList.contains("hide")&&
   typeof currentBuilding!=="undefined"&&String(currentBuilding?.id)==="130HH"&&
   !!byId("estamPrev")&&!!byId("estamNext")&&
   !!document.querySelector("#maint130 [data-m130-date]")&&
   typeof api()?.getSource==="function"&&mode==="move";
 };
 const clamp=(date,year,month)=>{
  const day=Math.max(1,Number(String(date).slice(8,10))||1);
  return year+"-"+pad(month)+"-"+pad(Math.min(day,new Date(Date.UTC(year,month,0)).getUTCDate()));
 };
 let drag=null,ghost=null,dock=null,scrollFrame=null,lastDragEnd=0;
 let mode="off",selected=null,clonePending=false,navigatingByDrag=false;
 window.estaMaintenance130Mode=()=>String(typeof currentBuilding!=="undefined"?currentBuilding?.id:"")==="130HH"?mode:"off";
 function clearHover(){
  if(drag)drag.hoverSide="";
  document.querySelectorAll("#estamPrev,#estamNext,[data-esta-month-drop]").forEach(el=>el.classList.remove("estaDragHover"));
 }
 function finish(){
  const held=drag;
  drag=null;
  clearHover();
  if(scrollFrame!==null&&typeof window.cancelAnimationFrame==="function")window.cancelAnimationFrame(scrollFrame);
  scrollFrame=null;
  if(held?.chip?.isConnected){
   held.chip.draggable=true;
   try{if(held.chip.hasPointerCapture?.(held.pointerId))held.chip.releasePointerCapture(held.pointerId)}catch(_){}
  }
  ghost?.remove();ghost=null;
  if(mode!=="move"){dock?.remove();dock=null;}
  byId("maintenancePage")?.classList.remove("estaMonthDragging");
  // Normal clicks are never suppressed. Only prevent the browser's synthetic click after an actual drag.
  if(held?.started)lastDragEnd=Date.now();
 }
 function nodeAt(ev){return document.elementFromPoint?.(ev.clientX,ev.clientY)||ev.target;}
 function directionOf(node){
  const button=node?.closest?.("#estamPrev,#estamNext,[data-esta-month-drop]");
  if(!button)return "";
  return button.id==="estamPrev"?"prev":button.id==="estamNext"?"next":button.dataset.estaMonthDrop||"";
 }
 function ensureDock(){
  if(dock?.isConnected)return dock;
  dock=document.createElement("div");
  dock.className="estaMonthDragTargets";
  dock.setAttribute("role","group");
  dock.setAttribute("aria-label","Điều hướng di chuyển công việc bảo trì");
  dock.innerHTML='<button type="button" data-esta-month-drop="prev" aria-label="Di chuyển sang tháng trước"><span aria-hidden="true">‹</span> Tháng trước</button><button type="button" data-esta-month-drop="next" aria-label="Di chuyển sang tháng sau">Tháng sau <span aria-hidden="true">›</span></button>';
  document.body.appendChild(dock);
  return dock;
 }
 function destroyDock(){dock?.remove();dock=null;}
 function beginVisual(){
  if(!drag||drag.started)return;
  drag.started=true;
  // Do not relocate the original month header. A separate bottom dock remains reachable
  // even when dragging from the 31st, without covering the 'Thêm bảo trì' action.
  byId("maintenancePage")?.classList.add("estaMonthDragging");
  ensureDock();
  ghost=document.createElement("div");
  ghost.className="estaMonthDragGhost";
  ghost.setAttribute("aria-hidden","true");
  ghost.innerHTML='<span class="estaMonthDragGhostLabel">ĐANG KÉO CÔNG VIỆC</span><strong></strong>';
  ghost.querySelector("strong").textContent=drag.source.title||"Công việc bảo trì";
  document.body.appendChild(ghost);
  if(typeof window.requestAnimationFrame==="function")scrollFrame=window.requestAnimationFrame(scrollLoop);
 }
 function moveGhost(ev){
  if(!ghost)return;
  ghost.style.left=Math.max(8,Math.min(ev.clientX+16,window.innerWidth-250))+"px";
  ghost.style.top=Math.max(8,Math.min(ev.clientY+16,window.innerHeight-65))+"px";
 }
 function scrollLoop(){
  scrollFrame=null;
  if(!drag?.started)return;
  if(!drag.hoverSide&&typeof window.scrollBy==="function"){
   if(drag.lastY<68)window.scrollBy(0,-22);
   else if(drag.lastY>window.innerHeight-64)window.scrollBy(0,22);
  }
  if(drag?.started)scrollFrame=window.requestAnimationFrame(scrollLoop);
 }
 function changeMonth(side){
  const el=byId(side==="prev"?"estamPrev":"estamNext");
  if(!el||!drag)return false;
  const before=byId("estamMonth")?.textContent||"";
  // This is the real navigation handler of ESTA (with year rollover).
  navigatingByDrag=true;
  try{el.click();}finally{navigatingByDrag=false;}
  return (byId("estamMonth")?.textContent||"")!==before;
 }
 function hoverArrow(side){
  if(!side){clearHover();return;}
  if(drag.hoverSide===side)return;
  clearHover();
  drag.hoverSide=side;
  document.querySelectorAll(side==="prev"?"#estamPrev,[data-esta-month-drop='prev']":"#estamNext,[data-esta-month-drop='next']").forEach(el=>el.classList.add("estaDragHover"));
  // Hover is only a visual highlight. Never navigate or save before pointerup
  // on the exact destination button: long presses and far-away movement are safe.
 }
 function selectedMonth(){
  const match=(byId("estamMonth")?.textContent||"").match(/(\d{1,2})\s*\/\s*(\d{4})/);
  return match?{month:Number(match[1]),year:Number(match[2])}:null;
 }
 document.addEventListener("pointerdown",ev=>{
  if(ev.button!==0||ev.isPrimary===false||!uiActive()||drag)return;
  const chip=ev.target.closest?.("#maint130 .m130CalendarChip[data-m130-drag]");
  if(!chip||!chip.draggable||mode!=="move")return;
  const source=api().getSource(chip.dataset.m130Drag);
  if(!source)return;
  // IMPORTANT: don't preventDefault here. Ordinary work-item clicks must remain native clicks.
  // Temporarily turn off HTML native drag so only this pointer controller handles a drag.
  chip.draggable=false;
  drag={pointerId:ev.pointerId,source,chip,x:ev.clientX,y:ev.clientY,lastY:ev.clientY,started:false,hoverSide:""};
  try{chip.setPointerCapture?.(ev.pointerId)}catch(_){}
  // One small movement is enough; the mode already provides intentionality.
 },true);
 document.addEventListener("pointermove",ev=>{
  if(!drag||ev.pointerId!==drag.pointerId)return;
  drag.lastY=ev.clientY;
  if(!drag.started&&Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)<4)return;
  beginVisual();
  ev.preventDefault();
  moveGhost(ev);
  hoverArrow(directionOf(nodeAt(ev)));
 },{capture:true,passive:false});
 document.addEventListener("pointerup",ev=>{
  if(!drag||ev.pointerId!==drag.pointerId)return;
  const held=drag;
  if(!held.started){finish();return;} // A click selects in Move mode; dragging begins immediately after 4px.
  ev.preventDefault();
  const node=nodeAt(ev),side=directionOf(node);
  const cell=node?.closest?.("#maint130 [data-m130-date]");
  let date="";
  if(side){
   changeMonth(side);
   const dest=selectedMonth();
   if(dest)date=clamp(held.source.date,dest.year,dest.month);
  }else if(cell)date=cell.dataset.m130Date;
  finish();
  if(date)Promise.resolve(api()?.move?.(held.source,date)).catch(err=>{
   if(typeof window.toast==="function")window.toast("Không chuyển được lịch: "+(err?.message||err));
  });
 },true);
 document.addEventListener("pointercancel",ev=>{if(drag&&ev.pointerId===drag.pointerId)finish();},true);
 window.addEventListener("blur",()=>{if(drag)finish();});
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&drag)finish();});
 // Prevent only the synthetic trusted click emitted by browsers *after a drag*.
 document.addEventListener("click",ev=>{
  if(ev.isTrusted&&Date.now()-lastDragEnd<100&&
   ev.target.closest?.("#estamPrev,#estamNext,[data-esta-month-drop],#maint130 .m130CalendarChip")){
   ev.preventDefault();ev.stopImmediatePropagation();
  }
 },true);
 document.addEventListener("dragstart",ev=>{
  if(drag&&ev.target.closest?.("#maint130 .m130CalendarChip"))ev.preventDefault();
 },true);

 function currentCalendar(){const v=(byId("estamMonth")?.textContent||"").match(/(\d{1,2})\s*\/\s*(\d{4})/);return v?{month:Number(v[1]),year:Number(v[2])}:null;}
 function setHelp(message){
  const help=byId("estaMaintenanceModeHelp");if(help)help.textContent=message;
 }
 function refreshSelected(){
  document.querySelectorAll("#maint130 .m130CalendarChip").forEach(chip=>{
   const active=!!selected&&chip.dataset.m130Drag===selected.key;
   chip.classList.toggle("estaTaskSelected",active);
   if(active)chip.setAttribute("aria-selected","true");else chip.removeAttribute("aria-selected");
  });
 }
 function syncChips(){
  const allowed=mode==="move"&&String(typeof currentBuilding!=="undefined"?currentBuilding?.id:"")==="130HH";
  document.querySelectorAll("#maint130 .m130CalendarChip").forEach(chip=>{
   chip.draggable=allowed&&!chip.classList.contains("done");
  });
  const page=byId("maintenancePage");
  page?.setAttribute("data-esta-work-mode",mode);
  if(mode==="clone")decorateCloneControls();
  else{
   document.querySelectorAll("#maint130 .estaCloneControls").forEach(el=>el.remove());
   document.querySelectorAll("#maint130 .estaCloneWorkWrap").forEach(wrapper=>{
    const chip=wrapper.querySelector(".m130CalendarChip");
    if(chip&&wrapper.parentNode)wrapper.parentNode.insertBefore(chip,wrapper);
    wrapper.remove();
   });
  }
  if(mode==="move"&&page?.dataset.estamView==="calendar")ensureDock();
  refreshSelected();
 }
 function decorateCloneControls(){
  document.querySelectorAll("#maint130 .m130CalendarChip[data-m130-drag]").forEach(chip=>{
   const cell=chip.closest(".m130CalendarDay");
   if(!cell)return;
   let wrapper=chip.parentElement?.classList.contains("estaCloneWorkWrap")?chip.parentElement:null;
   if(!wrapper){
    wrapper=document.createElement("div");
    wrapper.className="estaCloneWorkWrap";
    chip.parentNode.insertBefore(wrapper,chip);
    wrapper.appendChild(chip);
   }
   if(wrapper.querySelector(".estaCloneControls"))return;
   const controls=document.createElement("div");
   controls.className="estaCloneControls";
   const source=api()?.getSource?.(chip.dataset.m130Drag,"clone");
   const plus=document.createElement("button");
   plus.type="button";plus.className="estaClonePlus";plus.dataset.estaCloneAction="plus";
   plus.dataset.estaCloneKey=chip.dataset.m130Drag;plus.textContent="+";
   plus.title="Nhân bản công việc vào ngày trống gần nhất";
   plus.setAttribute("aria-label","Nhân bản "+(source?.title||"công việc"));
   controls.appendChild(plus);
   const minus=document.createElement("button");
   minus.type="button";minus.className="estaCloneMinus";minus.dataset.estaCloneAction="minus";
   minus.dataset.estaCloneKey=chip.dataset.m130Drag;minus.textContent="−";
   minus.title="Xóa khỏi lịch (lưu lịch sử; với kế hoạch lặp, các kỳ cũng được ẩn)";
   minus.setAttribute("aria-label","Xóa "+(source?.title||"công việc"));
   controls.appendChild(minus);
   wrapper.appendChild(controls);
  });
 }
 function applyMode(next){
  if(drag)finish();
  mode=["off","move","clone"].includes(next)?next:"off";
  selected=null;
  if(mode==="move")ensureDock();else destroyDock();
  const pane=byId("estaMaintenanceSettingsMenu");
  if(pane)pane.hidden=true;
  const trigger=byId("estaMaintenanceSettingsToggle");
  if(trigger)trigger.setAttribute("aria-expanded","false");
  document.querySelectorAll("[data-esta-action]").forEach(b=>{
   const current=b.dataset.estaAction===mode;
   b.setAttribute("aria-pressed",String(current));
   b.classList.toggle("isActive",current);
  });
  setHelp("");
  syncChips();
 }
 function is130(){return String(typeof currentBuilding!=="undefined"?currentBuilding?.id||"":"")==="130HH";}
 function syncSettingsVisibility(){
  const el=byId("estaMaintenanceSettings");
  if(!el)return;
  const visible=is130()&&byId("maintenancePage")?.dataset.estamView==="calendar";
  el.hidden=!visible;
  if(!visible&&mode!=="off")applyMode("off");
  // The controller is beside "Thêm bảo trì", never tucked into the filter overflow.
  const actions=byId("estamNativeActions");
  if(actions&&el.parentElement!==actions)actions.appendChild(el);
 }
 function ensureSettings(){
  const container=byId("estamNativeActions");
  if(!container)return;
  if(byId("estaMaintenanceSettings")){syncSettingsVisibility();return;}
  const el=document.createElement("div");
  el.id="estaMaintenanceSettings";
  el.className="estaMaintenanceSettings";
  el.innerHTML='<button type="button" id="estaMaintenanceSettingsToggle" aria-expanded="false" aria-controls="estaMaintenanceSettingsMenu" aria-label="Cài đặt thao tác công việc bảo trì"><svg class="estaSettingsIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.05.05-1.9 1.9-.05-.05a1.65 1.65 0 0 0-1.82-.33c-.42.18-.7.6-.7 1.07V20h-2.7v-.54c0-.47-.28-.89-.7-1.07a1.65 1.65 0 0 0-1.82.33l-.05.05-1.9-1.9.05-.05a1.65 1.65 0 0 0 .33-1.82c-.18-.42-.6-.7-1.07-.7H6v-2.7h.54c.47 0 .89-.28 1.07-.7a1.65 1.65 0 0 0-.33-1.82l-.05-.05 1.9-1.9.05.05a1.65 1.65 0 0 0 1.82.33c.42-.18.7-.6.7-1.07V5h2.7v.54c0 .47.28.89.7 1.07a1.65 1.65 0 0 0 1.82-.33l.05-.05 1.9 1.9-.05.05a1.65 1.65 0 0 0-.33 1.82c.18.42.6.7 1.07.7H20v2.7h-.54c-.47 0-.89.28-1.07.7Z"/></svg><span>Cài đặt</span></button>'+
   '<div id="estaMaintenanceSettingsMenu" class="estaMaintenanceSettingsMenu" hidden>'+
   '<button type="button" data-esta-action="off" aria-pressed="true">Xem và chỉnh sửa</button>'+
   '<button type="button" data-esta-action="move" aria-pressed="false">Di chuyển</button>'+
   '<button type="button" data-esta-action="clone" aria-pressed="false">Nhân bản</button></div>'+
   
   '<span id="estaMaintenanceModeHelp" class="estaMaintenanceModeHelp" role="status" aria-live="polite"></span>';
  container.appendChild(el);
  syncSettingsVisibility();
  el.querySelector("#estaMaintenanceSettingsToggle").addEventListener("click",()=>{
   const menu=byId("estaMaintenanceSettingsMenu"),opening=menu.hidden;
   menu.hidden=!opening;
   byId("estaMaintenanceSettingsToggle").setAttribute("aria-expanded",String(opening));
  });
  el.querySelectorAll("[data-esta-action]").forEach(button=>button.addEventListener("click",()=>applyMode(button.dataset.estaAction)));
  applyMode("off");
  syncSettingsVisibility();
 }
 function contextSync(){
  ensureSettings();
  const page=byId("maintenancePage"),building=String(typeof currentBuilding!=="undefined"?currentBuilding?.id:"");
  if(building!=="130HH"||page?.dataset.estamView!=="calendar"){
   if(mode!=="off")applyMode("off");
   syncSettingsVisibility();
  }else{
   syncSettingsVisibility();
   if(mode==="move")ensureDock();
   syncChips();
  }
 }
 async function commitSelected(source,date){
  selected=null;refreshSelected();
  try{await api()?.move?.(source,date);}catch(err){
   if(typeof window.toast==="function")window.toast("Không chuyển lịch: "+(err.message||err));
  }finally{setHelp("");}
 }
 // Capture only while a mode is selected: ordinary work-item clicks are unchanged.
 document.addEventListener("click",ev=>{
  if(mode==="off"||String(typeof currentBuilding!=="undefined"?currentBuilding?.id:"")!=="130HH")return;
  if(navigatingByDrag)return;
  const control=ev.target.closest?.("#estaMaintenanceSettings");if(control)return;
  const cloneButton=ev.target.closest?.("[data-esta-clone-action]");
  if(cloneButton&&mode==="clone"){
   ev.preventDefault();ev.stopImmediatePropagation();
   if(clonePending)return;
   const source=api()?.getSource?.(cloneButton.dataset.estaCloneKey,"clone");
   if(!source)return;
   clonePending=true;
   
   const action=cloneButton.dataset.estaCloneAction==="minus"?"removeClone":"clone";
   Promise.resolve(api()?.[action]?.(source)).catch(err=>{
    if(typeof window.toast==="function")window.toast("Không thực hiện được: "+(err?.message||err));
   }).finally(()=>{clonePending=false;});
   return;
  }
  const dockBtn=ev.target.closest?.("[data-esta-month-drop]");
  if(dockBtn&&mode==="move"){
   ev.preventDefault();ev.stopImmediatePropagation();
   const side=dockBtn.dataset.estaMonthDrop;
   if(!selected){
    byId(side==="prev"?"estamPrev":"estamNext")?.click();
    
    return;
   }
   const shown=currentCalendar();if(!shown)return;
   const next=new Date(Date.UTC(shown.year,shown.month-1+(side==="prev"?-1:1),1));
   const date=clamp(selected.date,next.getUTCFullYear(),next.getUTCMonth()+1);
   commitSelected(selected,date);
   return;
  }
  const chip=ev.target.closest?.("#maint130 .m130CalendarChip[data-m130-drag]");
  if(chip){
   // A drag release is not a second click selection.
   if(Date.now()-lastDragEnd<130){ev.preventDefault();ev.stopImmediatePropagation();return;}
   ev.preventDefault();ev.stopImmediatePropagation();
   const key=chip.dataset.m130Drag,source=api()?.getSource?.(key,mode);
   if(!source)return;
   if(mode==="move"){
    selected=selected?.key===key?null:source;
    refreshSelected();
    
   }else if(mode==="clone"&&!clonePending){
    clonePending=true;
    
    Promise.resolve(api()?.clone?.(source)).catch(err=>{
     if(typeof window.toast==="function")window.toast("Nhân bản không thành công: "+(err?.message||err));
    }).finally(()=>{clonePending=false;});
   }
   return;
  }
  if(mode!=="move"||!selected)return;
  const arrow=ev.target.closest?.("#estamPrev,#estamNext");
  const cell=ev.target.closest?.("#maint130 [data-m130-date]");
  if(!arrow&&!cell)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  let date=cell?.dataset.m130Date||"";
  if(arrow){
   const shown=currentCalendar();
   if(!shown)return;
   const delta=arrow.id==="estamPrev"?-1:1;
   const next=new Date(Date.UTC(shown.year,shown.month-1+delta,1));
   date=clamp(selected.date,next.getUTCFullYear(),next.getUTCMonth()+1);
  }
  if(date)commitSelected(selected,date);
 },true);
 document.addEventListener("click",ev=>{
  const menu=byId("estaMaintenanceSettingsMenu");
  if(menu&&!menu.hidden&&!ev.target.closest?.("#estaMaintenanceSettings")){
   menu.hidden=true;byId("estaMaintenanceSettingsToggle")?.setAttribute("aria-expanded","false");
  }
 });
 document.addEventListener("keydown",ev=>{
  if(ev.key!=="Escape")return;
  const menu=byId("estaMaintenanceSettingsMenu");
  if(menu&&!menu.hidden){menu.hidden=true;byId("estaMaintenanceSettingsToggle")?.setAttribute("aria-expanded","false");return;}
  if(mode!=="off")applyMode("off");
 });
 const attach=()=>{
  ensureSettings();
  const page=byId("maintenancePage");
  if(page)new MutationObserver(mutations=>{
   if(mutations.some(m=>m.type==="attributes"))contextSync();
  }).observe(page,{attributes:true,attributeFilter:["data-estam-building","data-estam-view","class"]});
  const list=byId("m130List");
  if(list)new MutationObserver(()=>{if(mode!=="off")syncChips();}).observe(list,{childList:true});
 };
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach,{once:true});else attach();

 window.estaMaintenance130DragDebug={clamp,isDragging:()=>!!drag?.started};
})();