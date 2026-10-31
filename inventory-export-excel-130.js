/* Export the currently visible material table for pilot project 130HH only. */
(() => {
 "use strict";
 function exportExcel() {
   const page=document.getElementById("inventoryPage");
   if(!page?.classList.contains("inventoryRef130")) return;
   const table=document.getElementById("materialInventoryTable");
   if(!table) return;
   const rows=[...table.querySelectorAll("tr")].filter(row=>row.getClientRects().length);
   const encode=value=>{
     let text=String(value??"").trim().replace(/\s+/g," ");
     if(/^[=+@-]/.test(text)) text="'"+text;
     return '"'+text.replace(/"/g,'""')+'"';
   };
   const lines=rows.map(row=>[...row.querySelectorAll("th,td")].filter(cell=>!cell.matches(":last-child")).map(cell=>encode(cell.innerText||cell.textContent)).join(","));
   if(lines.length<2){window.alert("Chưa có dữ liệu vật tư để xuất.");return;}
   const year=document.getElementById("inventoryYear")?.value||new Date().getFullYear();
   const month=page.querySelector("#materialMonthTabs button.active")?.dataset.materialMonth||"all";
   const blob=new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"});
   const url=URL.createObjectURL(blob), link=document.createElement("a");
   link.href=url;link.download="ESTA_130HH_VatTu_"+year+"_"+month+".csv";
   document.body.appendChild(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 document.addEventListener("click",event=>{
   if(event.target?.closest?.("#materialExportExcel"))exportExcel();
 });
})();
