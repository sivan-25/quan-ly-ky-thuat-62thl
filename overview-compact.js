/* ESTA 2026-10-20 – responsive Admin compact visual adapter; no data writes. */
(()=>{
 "use strict";
 const $=s=>document.querySelector(s);
 let root=null,watchers=[];
 const onMobile=()=>window.matchMedia("(max-width:760px)").matches;
 function markZeros(){
  if(!root)return;
  root.querySelectorAll("#ccSummary .opsKpi").forEach(k=>{
   k.classList.toggle("isZero",(k.querySelector("b")?.textContent||"").trim()==="0");
  });
  root.querySelectorAll("#ccProjectCards .ccProjectStats").forEach(stats=>{
   [...stats.querySelectorAll("span")].forEach((s,i)=>{
    s.classList.toggle("zero",i>0&&(s.querySelector("b")?.textContent||"").trim()==="0");
   });
  });
 }
 function setMode(enabled){
  if(!root)return;
  root.classList.toggle("ccSelectMode",enabled);
  const toggle=root.querySelector("#ccSelectToggle");
  if(toggle){toggle.textContent=enabled?"Xong":"Chọn để xuất PDF";toggle.setAttribute("aria-pressed",String(enabled))}
 }
 function init(){
  const next=$("#estaCommandCenter");
  if(!next||!next.querySelector(".ccTaskScopes"))return false;
  if(root===next)return true;
  root=next;
  const scope=root.querySelector(".ccTaskScopes");
  if(!root.querySelector("#ccSelectToggle")){
   const button=document.createElement("button");
   button.id="ccSelectToggle";button.type="button";
   button.setAttribute("aria-label","Bật hoặc tắt chế độ chọn công việc để xuất PDF");
   button.addEventListener("click",()=>{
    if(!onMobile())return;
    setMode(!root.classList.contains("ccSelectMode"));
   });
   scope.insertAdjacentElement("beforebegin",button);
  }
  setMode(false);
  const observer=new MutationObserver(markZeros);
  for(const selector of ["#ccSummary","#ccProjectCards"]){
   const section=root.querySelector(selector);
   if(section)observer.observe(section,{childList:true});
  }
  watchers.push(observer);
  markZeros();
  return true;
 }
 if(!init()){
  const pending=new MutationObserver(()=>{if(init())pending.disconnect()});
  pending.observe(document.documentElement,{childList:true,subtree:true});
 }
 window.addEventListener("resize",()=>{
  if(!onMobile())setMode(false);
 },{passive:true});
})();