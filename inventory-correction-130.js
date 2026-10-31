/* 130HH pilot: one PDF menu, no duplicate visible actions. */
(() => {
 "use strict";
 const $ = s => document.querySelector(s);
 let bellParent=null,bellNext=null,controlsParent=null,controlsNext=null;
 function isPilot(){const page=$("#inventoryPage");return !!(page?.classList.contains("inventoryRef130")||page?.classList.contains("inventoryRef127")&&!page.classList.contains("hide"));}
 function syncApprovedTopbar(){
   const controls=$("#inventoryPage .inventoryCommandControls"),header=$("header.estaTopbar"),account=$("header .account");
   if(!controls||!header||!account)return;
   const enabled=isPilot() && window.matchMedia("(min-width: 761px)").matches;
   if(enabled){
     if(!controlsParent){controlsParent=controls.parentNode;controlsNext=controls.nextSibling;}
     if(controls.parentNode!==header)header.insertBefore(controls,account);
   }else if(controlsParent&&controls.parentNode!==controlsParent){
     if(controlsNext?.parentNode===controlsParent)controlsParent.insertBefore(controls,controlsNext);
     else controlsParent.appendChild(controls);
   }
 }
 function syncHeader(){
   const bell=$(".headerBell"), account=$("header .account");
   if(!bell||!account)return;
   if(isPilot()){
      if(!bellParent){bellParent=bell.parentElement;bellNext=bell.nextSibling;}
      if(bell.parentElement===account.parentElement && bell.nextElementSibling===account)return;
      account.parentElement?.insertBefore(bell,account);
   } else if(bellParent && bell.parentElement!==bellParent){
      if(bellNext?.parentNode===bellParent)bellParent.insertBefore(bell,bellNext);
      else bellParent.appendChild(bell);
   }
 }
 function ensureMenu(){
   const page=$("#inventoryPage");
   if(!page?.classList.contains("inventoryRef130")&&!page?.classList.contains("inventoryRef127"))return;
   const original=$("#materialExportPdf");
   if(!original)return;
   const toolbar=original.parentElement;
   if(!toolbar)return;
   let wrapper=$("#inventory130PdfMenu");
   if(!wrapper){
      wrapper=document.createElement("div");
      wrapper.id="inventory130PdfMenu";
      wrapper.className="inventory130PdfMenu";
      wrapper.innerHTML='<button type="button" aria-haspopup="true" aria-expanded="false" id="inventory130PdfTrigger">↓ Xuất PDF ▾</button><div class="inventory130PdfDropdown" id="inventory130PdfDropdown" hidden><button type="button" data-esta-pdf="inventory">Xuất PDF vật tư</button><button type="button" data-esta-pdf="work">Công việc theo vật tư</button></div>';
      toolbar.insertBefore(wrapper,original);
   }
 }
 function closeMenu(){
   const dropdown=$("#inventory130PdfDropdown"),trigger=$("#inventory130PdfTrigger");
   if(dropdown)dropdown.hidden=true;
   if(trigger)trigger.setAttribute("aria-expanded","false");
 }
 document.addEventListener("click",e=>{
   const target=e.target;
   if(!(target instanceof Element))return;
   if(target.closest("#inventory130PdfTrigger")){
      const dropdown=$("#inventory130PdfDropdown"),trigger=$("#inventory130PdfTrigger");
      if(dropdown){dropdown.hidden=!dropdown.hidden;trigger?.setAttribute("aria-expanded",String(!dropdown.hidden));}
      return;
   }
   const option=target.closest("[data-esta-pdf]");
   if(option){
      const type=option.getAttribute("data-esta-pdf");
      closeMenu();
      if(type==="inventory")$("#materialExportPdf")?.click();
      if(type==="work"){
         const launch=$("#estaMaterialWorkReportLaunch");
         if(launch)launch.click();
         else if(typeof window.estaOpenMaterialWorkReport==="function")window.estaOpenMaterialWorkReport();
         else window.alert("Báo cáo công việc theo vật tư chưa tải xong. Vui lòng tải lại trang.");
      }
      return;
   }
   if(!target.closest("#inventory130PdfMenu"))closeMenu();
 });
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu();});
 let scheduled=false;
 function sync(){
   if(scheduled)return;
   scheduled=true;
   queueMicrotask(()=>{scheduled=false;ensureMenu();syncHeader();syncApprovedTopbar();});
 }
 function boot(){
   sync();
   window.addEventListener("resize",sync,{passive:true});
   const root=$("#app");
   if(root)new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
