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
   typeof api()?.getSource==="function";
 };
 const clamp=(date,year,month)=>{
  const day=Math.max(1,Number(String(date).slice(8,10))||1);
  return year+"-"+pad(month)+"-"+pad(Math.min(day,new Date(Date.UTC(year,month,0)).getUTCDate()));
 };
 let drag=null,ghost=null,dock=null,scrollFrame=null,lastDragEnd=0;
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
  dock?.remove();dock=null;
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
 function beginVisual(){
  if(!drag||drag.started)return;
  drag.started=true;
  // Do not relocate the original month header. A separate bottom dock remains reachable
  // even when dragging from the 31st, without covering the 'Thêm bảo trì' action.
  byId("maintenancePage")?.classList.add("estaMonthDragging");
  dock=document.createElement("div");
  dock.className="estaMonthDragTargets";
  dock.setAttribute("role","group");
  dock.setAttribute("aria-label","Đưa lịch sang tháng trước hoặc tháng sau");
  dock.innerHTML='<button type="button" data-esta-month-drop="prev" aria-label="Thả để chuyển công việc sang tháng trước"><span aria-hidden="true">‹</span> Tháng trước</button><button type="button" data-esta-month-drop="next" aria-label="Thả để chuyển công việc sang tháng sau">Tháng sau <span aria-hidden="true">›</span></button>';
  document.body.appendChild(dock);
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
  el.click();
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
  if(!chip||!chip.draggable)return;
  const source=api().getSource(chip.dataset.m130Drag);
  if(!source)return;
  // IMPORTANT: don't preventDefault here. Ordinary work-item clicks must remain native clicks.
  // Temporarily turn off HTML native drag so only this pointer controller handles a drag.
  chip.draggable=false;
  drag={pointerId:ev.pointerId,source,chip,x:ev.clientX,y:ev.clientY,lastY:ev.clientY,started:false,hoverSide:""};
  try{chip.setPointerCapture?.(ev.pointerId)}catch(_){}
 },true);
 document.addEventListener("pointermove",ev=>{
  if(!drag||ev.pointerId!==drag.pointerId)return;
  drag.lastY=ev.clientY;
  if(!drag.started&&Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)<9)return;
  beginVisual();
  ev.preventDefault();
  moveGhost(ev);
  hoverArrow(directionOf(nodeAt(ev)));
 },{capture:true,passive:false});
 document.addEventListener("pointerup",ev=>{
  if(!drag||ev.pointerId!==drag.pointerId)return;
  const held=drag;
  if(!held.started){finish();return;} // No long-press activation; browser performs one normal click.
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
 window.estaMaintenance130DragDebug={clamp,isDragging:()=>!!drag?.started};
})();