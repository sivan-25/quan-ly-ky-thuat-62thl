/* ESTA 2026-10-20 – responsive Admin compact visual adapter; no data writes. */
(()=>{
 "use strict";
 const $=s=>document.querySelector(s);
 let root=null,watchers=[];
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
 function removeDuplicatePdfControl(){
  // The existing header action is the single mobile PDF entry point.
  root?.querySelector("#ccSelectToggle")?.remove();
  root?.classList.remove("ccSelectMode");
 }
 function init(){
  const next=$("#estaCommandCenter");
  if(!next||!next.querySelector(".ccTaskScopes"))return false;
  if(root===next){removeDuplicatePdfControl();return true;}
  root=next;
  removeDuplicatePdfControl();
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
})();