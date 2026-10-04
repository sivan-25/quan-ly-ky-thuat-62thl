/* Shared, data-only overview helpers. Demo retains its existing renderer. */
window.estaOverviewUI=(()=>{
 const escape=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 function monthlyItems(energy){
  const date=today(),month=date.slice(0,7),out=[];
  for(const [type,label,unit] of [["electric","Điện","kWh"],["water","Nước","m³"],["solar","Solar","kWh"],["xlnt","XLNT","m³"]]){
   const list=(Array.isArray(energy)?energy:[]).filter(x=>x.type===type&&x.date&&String(x.date).slice(0,10)<=date).sort((a,b)=>String(a.date).localeCompare(String(b.date))||Number(a.id)-Number(b.id));
   if(!list.length)continue;
   const dual=type==="electric"&&list.some(x=>x.value2!==null&&x.value2!==undefined&&x.value2!=="");
   for(const field of dual?["value","value2"]:["value"]){
    let value=0,has=false;
    for(let i=1;i<list.length;i++){
     if(!String(list[i].date).startsWith(month))continue;
     const previous=list[i-1][field],current=list[i][field];
     if(previous===null||previous===undefined||previous===""||current===null||current===undefined||current==="")continue;
     const difference=Number(current)-Number(previous);
     if(Number.isFinite(difference)&&difference>=0){value+=difference;has=true}
    }
    out.push({type,label:dual?(field==="value"?"EVN1":"EVN2"):label,unit,value:has?value:null});
   }
  }
  return out;
 }
 function energyHtml(projects){
  return projects.map(p=>{
   const items=monthlyItems(p.energy);
   return '<button type="button" class="opsEnergyProject" data-overview-energy="'+escape(p.id)+'"><b>'+escape(p.name||p.id)+'</b><span class="opsEnergyMeters">'+(items.length?items.map(x=>'<span><small>'+escape(x.label)+'</small><strong>'+ (x.value===null?"—":x.value.toLocaleString("vi-VN",{maximumFractionDigits:2}))+'</strong><em>'+escape(x.unit)+'</em></span>').join(""):'<small>Chưa có chỉ số năng lượng.</small>')+'</span><i aria-hidden="true">→</i></button>';
  }).join("")||'<div class="opsEmpty">Chưa có dữ liệu năng lượng.</div>';
 }
 return {escape,monthlyItems,energyHtml};
})();
