/* ESTA 130 Hong Ha: drag maintenance events onto the VISIBLE month arrows. */
(function(){
 "use strict";
 const byId=id=>document.getElementById(id);
 const pad=n=>String(n).padStart(2,"0");
 const uiActive=()=>{
  const page=byId("maintenancePage");
  return !!page&&!page.classList.contains("hide")&&
   typeof currentBuilding!=="undefined"&&String(currentBuilding?.id)==="130HH"&&
   !!byId("estamPrev")&&!!byId("estamNext")&&
   !!document.querySelector("#maint130 [data-m130-date]")&&
   typeof window.estaMaintenance130DragActions?.getSource==="function";
 };
 const clamp=(date,year,month)=>{
  const day=Math.max(1,Number(String(date).slice(8,10))||1);
  return year+"-"+pad(month)+"-"+pad(Math.min(day,new Date(Date.UTC(year,month,0)).getUTCDate()));
 };
 let drag=null,hoverTimer=null,ghost=null,lastRelease=0;
 function clearHover(){
  if(hoverTimer)clearTimeout(hoverTimer);
  hoverTimer=null;
  if(drag){drag.hoverSide="";drag.hoverApplied=false;}
  byId("estamPrev")?.classList.remove("estaDragHover");
  byId("estamNext")?.classList.remove("estaDragHover");
 }
 function finish(){
  clearHover();
  if(drag?.chip?.isConnected)drag.chip.draggable=true;
  drag=null;
  ghost?.remove();ghost=null;
  byId("maintenancePage")?.classList.remove("estaMonthDragging");
  lastRelease=Date.now();
 }
 function hit(ev){return document.elementFromPoint?.(ev.clientX,ev.clientY)||ev.target;}
 function arrow(node){
  if(!node?.closest)return null;
  return node.closest("#estamPrev,#estamNext");
 }
 function beginVisual(){
  if(!drag||drag.started)return;
  drag.started=true;
  byId("maintenancePage")?.classList.add("estaMonthDragging");
  ghost=document.createElement("div");
  ghost.className="estaMonthDragGhost";
  ghost.setAttribute("aria-hidden","true");
  ghost.textContent=drag.source.title||"Công việc bảo trì";
  document.body.appendChild(ghost);
 }
 function moveGhost(ev){
  if(!ghost)return;
  ghost.style.left=Math.min(ev.clientX+16,window.innerWidth-250)+"px";
  ghost.style.top=Math.max(10,Math.min(ev.clientY+16,window.innerHeight-65))+"px";
 }
 function changeMonth(side){
  const el=byId(side==="prev"?"estamPrev":"estamNext");
  if(!el||!drag)return false;
  const before=byId("estamMonth")?.textContent||"";
  el.click(); // Existing redesign module owns month/year selection and re-render.
  return (byId("estamMonth")?.textContent||"")!==before;
 }
 function hoverArrow(target){
  const side=target?.id==="estamPrev"?"prev":target?.id==="estamNext"?"next":"";
  if(!side){clearHover();return;}
  if(drag.hoverSide===side)return;
  clearHover();
  drag.hoverSide=side;
  target.classList.add("estaDragHover");
  hoverTimer=setTimeout(()=>{
   hoverTimer=null;
   if(!drag||!drag.started||drag.hoverSide!==side)return;
   drag.hoverApplied=changeMonth(side);
  },550);
 }
 function targetMonth(){
  const label=byId("estamMonth")?.textContent||"";
  const match=label.match(/(\d{1,2})\s*\/\s*(\d{4})/);
  return match?{month:Number(match[1]),year:Number(match[2])}:null;
 }
 document.addEventListener("pointerdown",ev=>{
  if(ev.button!==0||!uiActive())return;
  const chip=ev.target.closest?.("#maint130 .m130CalendarChip[data-m130-drag]");
  if(!chip||chip.getAttribute("draggable")!=="true")return;
  const source=window.estaMaintenance130DragActions.getSource(chip.dataset.m130Drag);
  if(!source)return;
  ev.preventDefault();
  chip.draggable=false;
  drag={pointerId:ev.pointerId,source,chip,x:ev.clientX,y:ev.clientY,started:false,hoverSide:"",hoverApplied:false};
  try{document.documentElement.setPointerCapture?.(ev.pointerId);}catch(_){}
 },true);
 document.addEventListener("pointermove",ev=>{
  if(!drag||ev.pointerId!==drag.pointerId)return;
  if(!drag.started&&Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)<7)return;
  beginVisual();
  ev.preventDefault();
  moveGhost(ev);
  hoverArrow(arrow(hit(ev)));
  // Calendar can be taller than the screen: auto-scroll while pulling from day 31.
  if(!drag.hoverSide&&typeof window.scrollBy==="function"){
   if(ev.clientY>window.innerHeight-35)window.scrollBy(0,16);
   else if(ev.clientY<30)window.scrollBy(0,-16);
  }
 },{capture:true,passive:false});
 document.addEventListener("pointerup",ev=>{
  if(!drag||ev.pointerId!==drag.pointerId)return;
  ev.preventDefault();
  const held=drag;
  const destination=hit(ev);
  if(!held.started){
   finish();
   if(held.chip.isConnected)held.chip.click();
   return;
  }
  const nav=arrow(destination);
  const cell=destination.closest?.("#maint130 [data-m130-date]");
  let date="";
  if(nav){
   const side=nav.id==="estamPrev"?"prev":"next";
   if(!(drag.hoverSide===side&&drag.hoverApplied))changeMonth(side);
   const target=targetMonth();
   if(target)date=clamp(held.source.date,target.year,target.month);
  }else if(cell){
   date=cell.dataset.m130Date;
  }
  finish();
  if(date)Promise.resolve(window.estaMaintenance130DragActions?.move?.(held.source,date)).catch(err=>{
   if(typeof window.toast==="function")window.toast("Lỗi chuyển lịch: "+(err?.message||err));
  });
 },true);
 document.addEventListener("pointercancel",()=>{if(drag)finish();},true);
 document.addEventListener("click",ev=>{
  if(ev.isTrusted&&Date.now()-lastRelease<350&&
   ev.target.closest?.("#estamPrev,#estamNext,#maint130 .m130CalendarChip")){
   ev.preventDefault();ev.stopImmediatePropagation();
  }
 },true);
 // The native HTML drag/drop implementation must not compete with pointer dragging.
 document.addEventListener("dragstart",ev=>{
  if(drag&&ev.target.closest?.("#maint130 .m130CalendarChip")){
   ev.preventDefault();
  }
 },true);
 window.estaMaintenance130DragDebug={
  clamp,
  isDragging:()=>!!drag?.started
 };
})();
