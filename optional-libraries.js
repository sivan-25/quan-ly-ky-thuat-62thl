/* On-demand libraries: heavy Excel and QR engines are not needed at login. */
(function(global){
 "use strict";
 const definitions={
  XLSX:{src:"https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",ready:()=>!!(global.XLSX&&global.XLSX.utils)},
  QRCode:{src:"https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js",ready:()=>typeof global.QRCode==="function"}
 };
 const pending=Object.create(null);
 global.estaEnsureOptionalLibrary=function(name){
  const def=definitions[name];
  if(!def)return Promise.reject(new Error("Unknown optional library: "+name));
  if(def.ready())return Promise.resolve();
  if(pending[name])return pending[name];
  pending[name]=new Promise((resolve,reject)=>{
   const script=document.createElement("script");
   let finished=false;
   const timer=setTimeout(()=>finish(new Error("Library load timed out: "+name)),20000);
   function finish(error){
    if(finished)return;
    finished=true;
    clearTimeout(timer);
    script.onload=null;script.onerror=null;
    if(error){script.remove();reject(error);} else resolve();
   }
   script.async=true;
   script.src=def.src;
   script.crossOrigin="anonymous";
   script.onload=()=>finish(def.ready()?null:new Error("Library unavailable: "+name));
   script.onerror=()=>finish(new Error("Failed to load: "+name));
   document.head.appendChild(script);
  }).catch(error=>{pending[name]=null;throw error;});
  return pending[name];
 };
})(window);
