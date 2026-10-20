/* Trich xuat nguyen van tu app.js, PHU THUOC ham/toan cuc trong app.js. */
/* ===== DỤNG CỤ - VẬT TƯ ===== */
let inventoryMaterials=[],inventoryTransactions=[],inventoryTools=[],inventoryLoadedBuilding="",inventoryActiveTab="materials",inventoryActiveMonth=new Date().getMonth()+1,inventoryShowAlertsOnly=false;
function inventoryActiveMaterials(){return inventoryMaterials.filter(m=>!m.archived_at)}
const INV_MONTHS=["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
function inventoryNum(v){const n=Number(v||0);return Number.isFinite(n)?n:0}
function inventoryFmt(v){return inventoryNum(v).toLocaleString("vi-VN",{maximumFractionDigits:2})}
function inventoryYearValue(){return Number($("#inventoryYear")?.value)||new Date().getFullYear()}
function inventorySetYears(){
 const el=$("#inventoryYear");if(!el)return;
 const now=new Date().getFullYear(),old=Number(el.value)||now;
 el.innerHTML=Array.from({length:8},(_,i)=>now+2-i).map(y=>'<option value="'+y+'">'+y+'</option>').join("");
 el.value=String([...el.options].some(o=>Number(o.value)===old)?old:now);
}
function inventoryTxFor(materialId){return inventoryTransactions.filter(x=>String(x.material_id)===String(materialId))}
function inventoryTrackingStart(material){
 const raw=String(material?.tracking_start_date||material?.created_at||today()).slice(0,10);
 return /^\d{4}-\d{2}-\d{2}$/.test(raw)?raw:today();
}
function inventoryMonthEnd(year,month){
 const d=new Date(Number(year),Number(month),0);
 return d.toLocaleDateString("en-CA");
}
function inventoryStockAsOf(material,date){
 const cutoff=String(date||today()).slice(0,10),start=inventoryTrackingStart(material);
 if(cutoff<start)return null;
 return inventoryNum(material?.opening_qty)+inventoryTxFor(material?.id)
   .filter(x=>String(x.tx_date||"")>=start&&String(x.tx_date||"")<=cutoff)
   .reduce((s,x)=>s+(x.tx_type==="in"?inventoryNum(x.qty):-inventoryNum(x.qty)),0);
}
function inventorySnapshot(material,year=inventoryYearValue()){
 const trackingStart=inventoryTrackingStart(material);
 const tx=inventoryTxFor(material.id)
   .filter(x=>String(x.tx_date||"")>=trackingStart)
   .slice()
   .sort((a,b)=>String(a.tx_date).localeCompare(String(b.tx_date))||String(a.created_at||"").localeCompare(String(b.created_at||"")));
 const months=[];let totalIn=0,totalOut=0;
 for(let m=1;m<=12;m++){
   const monthStart=year+"-"+String(m).padStart(2,"0")+"-01";
   const monthEnd=inventoryMonthEnd(year,m);
   if(monthEnd<trackingStart){
     months.push({active:false,begin:null,inQty:0,outQty:0,stock:null});
     continue;
   }
   const begin=inventoryNum(material.opening_qty)+tx
     .filter(x=>String(x.tx_date||"")<monthStart)
     .reduce((s,x)=>s+(x.tx_type==="in"?inventoryNum(x.qty):-inventoryNum(x.qty)),0);
   let inn=0,out=0;
   tx.filter(x=>String(x.tx_date||"")>=monthStart&&String(x.tx_date||"")<=monthEnd).forEach(x=>{
     if(x.tx_type==="in")inn+=inventoryNum(x.qty);else out+=inventoryNum(x.qty);
   });
   totalIn+=inn;totalOut+=out;
   months.push({active:true,begin,inQty:inn,outQty:out,stock:begin+inn-out});
 }
 const current=inventoryStockAsOf(material,today());
 const activeMonths=months.filter(x=>x.active);
 return {
   trackingStart,
   opening:activeMonths.length?activeMonths[0].begin:null,
   totalIn,totalOut,
   closing:activeMonths.length?activeMonths[activeMonths.length-1].stock:null,
   current,
   months
 };
}
function inventoryFillPeople(){
 const names=projectPeople.map(x=>x.name).filter(Boolean);
 ["stockTxnPerformer","maintenanceAssigned","maintenanceRecordPerformer","toolKeeper"].forEach(id=>{
   const el=$("#"+id);if(!el)return;
   const old=el.value;
   el.innerHTML='<option value="">— Chọn —</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");
   if(names.includes(old))el.value=old;
 });
}
async function loadInventoryData(buildingId=currentBuilding?.id,force=false){
 if(!centralSession?.access_token||!buildingId)return;
 if(!force&&inventoryLoadedBuilding===buildingId){renderInventory();return}
 try{
   const b=encodeURIComponent(buildingId),token=centralSession.access_token;
   const result=await Promise.all([
     sbFetch("/rest/v1/inventory_materials?select=*&building_id=eq."+b+"&order=name.asc",{token}),
     sbFetch("/rest/v1/inventory_material_transactions?select=*&building_id=eq."+b+"&order=tx_date.desc,created_at.desc",{token}),
     sbFetch("/rest/v1/inventory_tools?select=*&building_id=eq."+b+"&order=name.asc",{token})
   ]);
   if(String(currentBuilding?.id||"")!==String(buildingId))return;
   inventoryMaterials=Array.isArray(result[0])?result[0]:[];
   inventoryTransactions=Array.isArray(result[1])?result[1]:[];
   inventoryTools=Array.isArray(result[2])?result[2]:[];
   inventoryLoadedBuilding=buildingId;inventoryShowAlertsOnly=false;inventoryFillPeople();renderInventory();
 }catch(e){if(String(currentBuilding?.id||"")!==String(buildingId))return;console.warn("Load inventory failed",e);toast("Không tải được dữ liệu vật tư")}
}
function renderInventory(){
 inventorySetYears();
 renderMaterials();
 renderTools();
}
function inventoryStockAlerts(){
 const y=new Date().getFullYear();
 return inventoryActiveMaterials().map(m=>{
   const current=inventorySnapshot(m,y).current,min=inventoryNum(m.min_qty);
   const severity=current<=0?"out":min>0&&current<=min?"low":"ok";
   return {m,current,min,severity};
 }).filter(x=>x.severity!=="ok").sort((a,b)=>{
   const rank={out:0,low:1};
   return rank[a.severity]-rank[b.severity]||a.current-b.current||String(a.m.name).localeCompare(String(b.m.name),"vi");
 });
}
function renderStockAlerts(){
 const alerts=inventoryStockAlerts();
 $("#stockAlertCount").textContent=alerts.length;
 $("#stockAlertOnly").classList.toggle("active",inventoryShowAlertsOnly);
 $("#stockAlertOnly").textContent=inventoryShowAlertsOnly?"Hiện tất cả vật tư":"Chỉ xem cảnh báo";
 const box=$("#stockAlertList");
 if(!alerts.length){
   const title=ESTA_INVENTORY_PROJECTS.has(String(currentBuilding?.id||""))?"Tồn kho ổn định · không vật tư dưới mức tối thiểu":"Tồn kho đang ổn định";
   box.innerHTML='<div class="stockAlertEmpty"><span>✓</span><div><b>'+title+'</b><small>Không có vật tư nào bằng hoặc thấp hơn mức tồn tối thiểu.</small></div></div>';
   return;
 }
 box.innerHTML=alerts.map(({m,current,min,severity})=>{
   const out=severity==="out";
   return '<article class="stockAlertItem '+severity+'">'+
     '<div class="stockAlertStatus">'+(out?"HẾT HÀNG":"SẮP HẾT")+'</div>'+
     '<div class="stockAlertName"><b>'+esc(m.name)+'</b><small>'+esc(m.code||"Không mã")+' · '+esc(m.unit)+'</small></div>'+
     '<div class="stockAlertMetric"><span>Tồn hiện tại</span><b>'+inventoryFmt(current)+' '+esc(m.unit)+'</b></div>'+
     '<div class="stockAlertMetric"><span>Mức tối thiểu</span><b>'+inventoryFmt(min)+' '+esc(m.unit)+'</b></div>'+
     '<div class="stockAlertActions"><button type="button" onclick="openLowStockReplenish(\''+m.id+'\')">＋ Nhập kho</button><button type="button" class="ghost" onclick="editMaterial(\''+m.id+'\')">Sửa định mức</button>'+(out&&currentAccount?.is_admin?'<button type="button" class="danger adminZeroDelete" onclick="deleteMaterial(\''+m.id+'\')">Xóa vật tư</button>':'')+'</div>'+
   '</article>';
 }).join("");
}
window.openLowStockReplenish=id=>{
 openStockTxnModal(id);
 $("#stockTxnType").value="in";
 syncStockTxnQuickChoice();
 $("#stockTxnDate").value=today();
 setTimeout(()=>$("#stockTxnQty").focus(),50);
};
/* All four ESTA buildings use 130 HH's reference UI; stock records stay scoped to each building. */
const ESTA_INVENTORY_PROJECTS=new Set(["130HH","127HH","62THL","68PĐL","68PDL"]);
function isEstaInventoryProject(){return ESTA_INVENTORY_PROJECTS.has(String(currentBuilding?.id||""))}
function syncInventory130Reference({year,allYear,count}){
 const active=isEstaInventoryProject()&&(!window.matchMedia||window.matchMedia("(max-width:760px)").matches);
 const title=$("#topInventoryTitle h1"),subtitle=$("#topInventoryTitle p");
 if(title)title.textContent=active?"Vật tư":"Dụng cụ - Vật tư";
 if(subtitle)subtitle.textContent=active?"Dụng cụ - Vật tư":"Quản lý tồn kho và dụng cụ kỹ thuật";
 const input=$("#inventory130Search"),yearSelect=$("#inventory130Year"),counter=$("#inventory130ListCount");
 if(!input||!yearSelect||!counter)return;
 if(!active)return;
 const originalYear=$("#inventoryYear"),originalSearch=$("#materialSearch");
 if(originalYear&&yearSelect.innerHTML!==originalYear.innerHTML)yearSelect.innerHTML=originalYear.innerHTML;
 if(originalYear)yearSelect.value=originalYear.value;
 if(originalSearch&&input.value!==originalSearch.value)input.value=originalSearch.value;
 counter.textContent="Danh sách · "+count+" mục";
 const historyTitle=$("#inventoryMaterialsPane .transactionCard .inventoryCardTitle h3");
 if(historyTitle)historyTitle.textContent="Lịch sử nhập / xuất · "+year;
 const quick=$("#inventory130QuickMenu"),add=$("#inventory130AddMaterial"),float=$("#inventory130FloatingTxn");
 const allowed=canProjectEdit();
 if(quick)quick.hidden=!allowed;
 if(add)add.hidden=!allowed;
 if(float)float.hidden=!allowed;
 const choiceBox=$("#inventory130QuickChoices");
 if(choiceBox&&!choiceBox.dataset.ready){
  choiceBox.dataset.ready="1";
  document.querySelectorAll("#inventoryMaterialsPane .inventoryQuickChoices [data-material-sample]").forEach(source=>{
   const choice=document.createElement("button");
   choice.type="button";choice.textContent=source.textContent;
   choice.addEventListener("click",()=>{if(quick)quick.open=false;source.click()});
   choiceBox.appendChild(choice);
  });
 }
}

function renderMaterials(){
 // Shared four-project phone interface; records and transactions remain separate by building_id.
 document.getElementById("inventoryPage")?.classList.toggle("inventorySharedMobileCompact",isEstaInventoryProject());
 const y=inventoryYearValue(),allYear=String(inventoryActiveMonth)==="all";
 const month=allYear?null:Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 const q=($("#materialSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const alertIds=new Set(inventoryStockAlerts().map(x=>String(x.m.id)));
 const periodEnd=allYear?(y+"-12-31"):inventoryMonthEnd(y,month);
 const list=inventoryActiveMaterials().filter(m=>inventoryTrackingStart(m)<=periodEnd&&(!inventoryShowAlertsOnly||alertIds.has(String(m.id)))&&(!q||[m.name,m.code,m.unit,m.note].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 const snaps=list.map(m=>({m,s:inventorySnapshot(m,y)})).filter(x=>allYear?x.s.months.some(mm=>mm.active):x.s.months[month-1]?.active);

 document.querySelectorAll("[data-material-month]").forEach(b=>{
   const val=b.dataset.materialMonth;
   const active=allYear?val==="all":Number(val)===month;
   b.classList.toggle("active",active);
   b.setAttribute("aria-current",active?"true":"false");
   if(val!=="all"){
     const prefix=y+"-"+String(Number(val)).padStart(2,"0");
     const hasActivity=inventoryTransactions.some(x=>String(x.tx_date||"").startsWith(prefix));
     b.classList.toggle("hasActivity",hasActivity);
   }
 });

 const periodText=allYear?("12 tháng / "+y):("Tháng "+String(month).padStart(2,"0")+" / "+y);
 const periodSelect=$("#materialMobilePeriod");
 if(periodSelect)periodSelect.value=allYear?"all":String(month);
 $("#materialMonthLabel").textContent=periodText;
 $("#materialSelectedMonth").textContent=periodText;
 $("#materialTitleCount").textContent="("+list.length+" mục)";
 const referenceMobile=isEstaInventoryProject()&&(!window.matchMedia||window.matchMedia("(max-width:760px)").matches);
 $("#materialInLabel").textContent=referenceMobile?(allYear?"Nhập năm":"Nhập tháng"):(allYear?"TỔNG NHẬP NĂM":"TỔNG NHẬP THÁNG");
 $("#materialOutLabel").textContent=referenceMobile?(allYear?"Xuất năm":"Xuất tháng"):(allYear?"TỔNG XUẤT NĂM":"TỔNG XUẤT THÁNG");
 $("#materialStockLabel").textContent=referenceMobile?"Mặt hàng tồn":(allYear?"MẶT HÀNG TỒN CUỐI NĂM":"MẶT HÀNG CÒN TỒN");
 const fullYearButton=$("#materialMonthTabs .yearOverviewBtn");
 if(fullYearButton)fullYearButton.textContent=referenceMobile?"Cả năm":"12 tháng";

 const periodRows=inventoryActiveMaterials().map(m=>({m,s:inventorySnapshot(m,y)})).filter(x=>allYear?x.s.months.some(mm=>mm.active):x.s.months[month-1]?.active);
 const totalIn=periodRows.reduce((sum,x)=>sum+(allYear?inventoryNum(x.s.totalIn):inventoryNum(x.s.months[month-1]?.inQty)),0);
 const totalOut=periodRows.reduce((sum,x)=>sum+(allYear?inventoryNum(x.s.totalOut):inventoryNum(x.s.months[month-1]?.outQty)),0);
 const stockValue=x=>allYear?inventoryNum(x.s.closing):inventoryNum(x.s.months[month-1]?.stock);
 const inStock=periodRows.filter(x=>stockValue(x)>0).length;
 const low=periodRows.filter(x=>inventoryNum(x.m.min_qty)>0&&stockValue(x)<=inventoryNum(x.m.min_qty)).length;
 $("#materialMonthIn").textContent=inventoryFmt(totalIn);
 $("#materialMonthOut").textContent=inventoryFmt(totalOut);
 $("#materialInStockCount").textContent=inStock;
 $("#materialLowStock").textContent=low;
 renderStockAlerts();

 const moveIcon='<svg viewBox="0 0 24 24"><path d="M7 7h10M13 3l4 4-4 4M17 17H7M11 13l-4 4 4 4"/></svg>';
 const editIcon='<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16v4zM13.5 6.5l4 4"/></svg>';
 const trashIcon='<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>';
 const table=$("#materialInventoryTable");

 if(allYear){
   table?.classList.add("yearView");
   $("#materialTableHead").innerHTML='<tr><th>STT</th><th>Tên vật tư</th><th>ĐVT</th><th>Tồn đầu</th>'+
     INV_MONTHS.map((name,i)=>'<th class="yearMonthHead"><span>'+name+'</span><small>N / X</small></th>').join("")+
     '<th>Tổng nhập</th><th>Tổng xuất</th><th>Tồn cuối</th><th>Thao tác</th></tr>';
   $("#materialMatrixBody").innerHTML=snaps.map(({m,s},i)=>{
     const lowRow=inventoryNum(m.min_qty)>0&&inventoryNum(s.closing)<=inventoryNum(m.min_qty);
     return '<tr class="'+(lowRow?"lowStock":"")+'">'+
       '<td class="sttCell">'+(i+1)+'</td>'+
       '<td class="materialNameCell"><b>'+esc(m.name)+'</b><small>'+esc(m.code||"")+'</small></td>'+
       '<td>'+esc(m.unit)+'</td>'+
       '<td><b>'+inventoryFmt(s.opening??0)+'</b></td>'+
       s.months.map(mm=>mm.active?'<td class="yearMonthCell"><span class="in">N '+inventoryFmt(mm.inQty)+'</span><span class="out">X '+inventoryFmt(mm.outQty)+'</span></td>':'<td class="yearMonthCell inactive">—</td>').join("")+
       '<td class="inText"><b>'+inventoryFmt(s.totalIn)+'</b></td>'+
       '<td class="outText"><b>'+inventoryFmt(s.totalOut)+'</b></td>'+
       '<td><b class="stockFinal '+(lowRow?"low":"")+'">'+inventoryFmt(s.closing??0)+'</b></td>'+
       '<td><div class="invRowActions compact">'+
         '<button class="move" title="Nhập / Xuất" onclick="openStockTxnModal(\''+m.id+'\')">'+moveIcon+'</button>'+
         '<button title="Sửa" onclick="editMaterial(\''+m.id+'\')">'+editIcon+'</button>'+
         (currentAccount?.is_admin&&Math.abs(inventoryNum(s.current))<0.000001?'<button title="Xóa vật tư (chỉ Admin · tồn kho = 0)" class="danger adminZeroDelete" onclick="deleteMaterial(\''+m.id+'\')">'+trashIcon+'</button>':'')+
       '</div></td></tr>';
   }).join("");
 }else{
   table?.classList.remove("yearView");
   $("#materialTableHead").innerHTML='<tr><th>STT</th><th>Tên vật tư</th><th>ĐVT</th><th>Tồn đầu</th><th>Nhập</th><th>Xuất</th><th>Tồn cuối</th><th>Thao tác</th></tr>';
   $("#materialMatrixBody").innerHTML=snaps.map(({m,s},i)=>{
     const mm=s.months[month-1],lowRow=inventoryNum(m.min_qty)>0&&inventoryNum(mm.stock)<=inventoryNum(m.min_qty);
     return '<tr class="'+(lowRow?"lowStock":"")+'">'+
       '<td class="sttCell">'+(i+1)+'</td>'+
       '<td class="materialNameCell"><b>'+esc(m.name)+'</b><small>'+esc(m.code||"")+(inventoryTrackingStart(m).slice(0,7)===y+"-"+String(month).padStart(2,"0")?' · Bắt đầu '+fmt(inventoryTrackingStart(m)):'')+'</small></td>'+
       '<td>'+esc(m.unit)+'</td>'+
       '<td><b>'+inventoryFmt(mm.begin)+'</b></td>'+
       '<td class="inText '+(mm.inQty?"hasValue":"")+'">'+(mm.inQty?"+"+inventoryFmt(mm.inQty):"0")+'</td>'+
       '<td class="outText '+(mm.outQty?"hasValue":"")+'">'+(mm.outQty?"−"+inventoryFmt(mm.outQty):"0")+'</td>'+
       '<td><b class="stockFinal '+(lowRow?"low":"")+'">'+inventoryFmt(mm.stock)+'</b></td>'+
       '<td><div class="invRowActions compact">'+
         '<button class="move" title="Nhập / Xuất" onclick="openStockTxnModal(\''+m.id+'\')">'+moveIcon+'</button>'+
         '<button title="Sửa" onclick="editMaterial(\''+m.id+'\')">'+editIcon+'</button>'+
         (currentAccount?.is_admin&&Math.abs(inventoryNum(s.current))<0.000001?'<button title="Xóa vật tư (chỉ Admin · tồn kho = 0)" class="danger adminZeroDelete" onclick="deleteMaterial(\''+m.id+'\')">'+trashIcon+'</button>':'')+
       '</div></td></tr>';
   }).join("");
 }
 // Mobile presentation follows the very same snapshot and permission checks as the desktop table.
 const mobileCards=$("#materialMobileCards");
 if(mobileCards)mobileCards.innerHTML=snaps.map(({m,s},i)=>{
  const snapshot=allYear?null:s.months[month-1];
  const balance=allYear?s.closing:snapshot.stock;
  const isLow=inventoryNum(m.min_qty)>0&&inventoryNum(balance)<=inventoryNum(m.min_qty);
  const id=String(m.id).replace(/[^a-zA-Z0-9_-]/g,"");
  const metrics=[["Tồn đầu",allYear?s.opening:snapshot.begin],["Nhập",allYear?s.totalIn:snapshot.inQty],["Xuất",allYear?s.totalOut:snapshot.outQty],["Tồn cuối",balance]];
  const canEdit=canProjectEdit();
  const is130PhonePilot=isEstaInventoryProject();
  const canDelete=canEdit&&currentAccount?.is_admin&&Math.abs(inventoryNum(s.current))<0.000001;
  const valueHtml='<div class="invMobileValues">'+metrics.map(([label,val],index)=>
   '<div class="invMobileValue '+(index===1?"is-in":index===2?"is-out":index===3?"is-closing":"")+'"><span>'+label+'</span><b>'+(is130PhonePilot&&index===1&&inventoryNum(val)>0?"+":is130PhonePilot&&index===2&&inventoryNum(val)>0?"−":"")+inventoryFmt(val)+'</b></div>').join("")+'</div>';

  const actions=canEdit?'<div class="invMobileCardActions">'+
   '<button type="button" onclick="openStockTxnModal(\''+id+'\')">⇄ Nhập / Xuất</button>'+
   '<button type="button" onclick="editMaterial(\''+id+'\')">Sửa</button>'+
   (!is130PhonePilot&&canDelete?'<button type="button" class="is-delete" onclick="deleteMaterial(\''+id+'\')">Xóa</button>':'')+
   '</div>':'';
  const pilotDelete=is130PhonePilot&&canDelete?'<button type="button" class="invMobileDelete" title="Xóa vật tư khi tồn kho bằng 0" aria-label="Xóa '+esc(m.name)+'" onclick="deleteMaterial(\''+id+'\')">×</button>':'';
  const pilotEdit=is130PhonePilot&&canEdit?'<button type="button" class="inventory130Edit" aria-label="Sửa '+esc(m.name)+'" onclick="editMaterial(\''+id+'\')">✎</button>':'';
  const pilotMove=is130PhonePilot&&canEdit?'<button type="button" class="inventory130Move" aria-label="Nhập xuất '+esc(m.name)+'" onclick="openStockTxnModal(\''+id+'\')">⇄</button>':'';
  const stockStatus=inventoryNum(balance)<=0?"Hết hàng":isLow?"Sắp hết":"Còn hàng";
  const yearly=!is130PhonePilot&&allYear?'<details class="invYearDetails"><summary>Nhập / xuất từng tháng</summary><div class="invYearGrid">'+
   s.months.map((monthValue,j)=>'<div class="invYearMonth"><span>Th '+String(j+1).padStart(2,"0")+'</span><b>'+
   (monthValue.active?'N '+inventoryFmt(monthValue.inQty)+' / X '+inventoryFmt(monthValue.outQty):'—')+'</b></div>').join("")+
   '</div></details>':'';
  return '<article class="invMobileCard '+(isLow?"is-low ":"")+(is130PhonePilot?"invMobileCard130"+(inventoryNum(balance)<=0?" is-out-of-stock":""):"")+'">'+
   '<div class="invMobileCardHead"><div class="invMobileCardName">'+
   (is130PhonePilot?'<span class="invMobileIndex">'+String(i+1).padStart(2,"0")+'</span>':"")+
   '<strong>'+esc(m.name)+'</strong>'+
   (m.code?'<small>Mã: '+esc(m.code)+'</small>':'')+
   '<span class="invMobileUnit">ĐVT: '+esc(m.unit||"—")+'</span></div>'+
   (is130PhonePilot?'<div class="invMobileStatusGroup"><span class="invMobileStatus">'+stockStatus+'</span>'+pilotMove+pilotEdit+pilotDelete+'</div>':'<span class="invMobileNumber">#'+(i+1)+'</span>')+
   '</div>'+
   (is130PhonePilot?'<div class="invMobileCardBottom is-readonly">'+valueHtml+'</div>':valueHtml)+
   (isLow?'<small class="invMobileNotice">⚠ Tồn thấp · định mức '+inventoryFmt(m.min_qty)+'</small>':'')+
   yearly+(is130PhonePilot?"":actions)+'</article>';
 }).join("");
 $("#materialEmpty").classList.toggle("hide",snaps.length>0);

 const byId=Object.fromEntries(inventoryMaterials.map(m=>[m.id,m]));
 const tx=inventoryTransactions.filter(x=>{
   const d=String(x.tx_date||"");
   if(!byId[x.material_id]||inventoryTrackingStart(byId[x.material_id])>d)return false;
   return allYear?d.startsWith(String(y)):d.startsWith(y+"-"+String(month).padStart(2,"0"));
 }).slice(0,allYear?120:60);
 $("#materialTxnSubtitle").textContent=allYear?("Các phát sinh trong năm "+y+"."):("Các phát sinh trong tháng "+String(month).padStart(2,"0")+" / "+y+".");
 $("#materialTxnBody").innerHTML=tx.map(x=>{
   const linked=x.source_type==="work_task"&&x.source_task_id;
   const note=esc(x.note||"—")+(linked?'<button class="materialTaskLink" type="button" onclick="openLinkedTaskFromStockTxn(\''+esc(String(x.source_task_id))+'\')">↗ '+esc(x.source_task_title||"Mở công việc")+'</button>':'');
   const action=linked?'<span class="materialSystemTxn" title="Giao dịch được tạo tự động từ công việc">Tự động</span>':'<button class="miniDanger" onclick="deleteStockTxn(\''+x.id+'\')">'+trashIcon+'</button>';
   return '<tr><td>'+fmt(x.tx_date)+'</td><td><b>'+esc(byId[x.material_id]?.name||"Vật tư đã xóa")+'</b></td><td><span class="stockType '+x.tx_type+'">'+(x.tx_type==="in"?"Nhập":"Xuất")+'</span></td><td><b>'+inventoryFmt(x.qty)+'</b></td><td>'+esc(x.performer||"—")+'</td><td>'+note+'</td><td>'+action+'</td></tr>';
 }).join("");
 const mobileTx=$("#materialMobileTransactions");
 if(mobileTx)mobileTx.innerHTML=tx.map(x=>{
  const linked=x.source_type==="work_task"&&x.source_task_id;
  const id=String(x.id).replace(/[^a-zA-Z0-9_-]/g,"");
  const taskId=String(x.source_task_id||"").replace(/[^a-zA-Z0-9_-]/g,"");
  const buttons=linked?'<button type="button" onclick="openLinkedTaskFromStockTxn(\''+taskId+'\')">↗ '+esc(x.source_task_title||"Mở công việc")+'</button>':
    canProjectEdit()?'<button type="button" class="is-delete" onclick="deleteStockTxn(\''+id+'\')">Xóa giao dịch</button>':'';
  if(isEstaInventoryProject()){
   return '<article class="invMobileCard inventory130Transaction"><div class="inventory130TxnMain">'+
    '<div class="inventory130TxnText"><strong>'+esc(byId[x.material_id]?.name||"Vật tư đã xóa")+'</strong>'+
    '<small>'+fmt(x.tx_date)+' · '+esc(x.performer||"Chưa ghi người thực hiện")+'</small></div>'+
    '<span class="inventory130TxnBadge '+(x.tx_type==="out"?"is-out":"is-in")+'">'+(x.tx_type==="out"?"Xuất −":"Nhập +")+inventoryFmt(x.qty)+'</span></div>'+
    (x.note?'<small class="inventory130TxnNote">'+esc(x.note)+'</small>':'')+
    (buttons?'<div class="inventory130TxnActions">'+buttons+'</div>':'')+'</article>';
  }
  return '<article class="invMobileCard"><div class="invMobileCardHead">'+
   '<div class="invMobileCardName"><strong>'+esc(byId[x.material_id]?.name||"Vật tư đã xóa")+'</strong><small>'+fmt(x.tx_date)+'</small></div>'+
   '<span class="invMobileType '+(x.tx_type==="out"?"is-out":"")+'">'+(x.tx_type==="in"?"Nhập":"Xuất")+'</span></div>'+
   '<div class="invMobileMeta"><div><small>Số lượng</small><b>'+inventoryFmt(x.qty)+'</b></div>'+
   '<div><small>Người thực hiện</small><b>'+esc(x.performer||"—")+'</b></div></div>'+
   (x.note?'<div class="invMobileNote">'+esc(x.note)+'</div>':'')+
   (buttons?'<div class="invMobileCardActions">'+buttons+'</div>':'')+'</article>';
 }).join("");
 $("#materialTxnEmpty").classList.toggle("hide",tx.length>0);

 const sel=$("#stockTxnMaterial"),old=sel.value;
 const selectable=inventoryActiveMaterials().filter(m=>inventoryTrackingStart(m)<=periodEnd);
 sel.innerHTML='<option value="">— Chọn vật tư —</option>'+selectable.map(m=>'<option value="'+m.id+'">'+esc(m.name)+' · tồn '+inventoryFmt(inventoryStockAsOf(m,today())??0)+' '+esc(m.unit)+'</option>').join("");
 if(selectable.some(m=>m.id===old))sel.value=old;
 if(typeof syncInventory130Reference==="function")syncInventory130Reference({year:y,allYear,count:snaps.length});
}
function renderTools(){
 const q=($("#toolSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const list=inventoryTools.filter(t=>!q||[t.name,t.code,t.brand,t.location,t.keeper,t.note,t.condition_status].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q)));
 $("#toolCount").textContent=inventoryTools.length;
 $("#toolGoodCount").textContent=inventoryTools.filter(x=>["Tốt","Đang sử dụng"].includes(x.condition_status)).length;
 $("#toolRepairCount").textContent=inventoryTools.filter(x=>["Cần kiểm tra","Cần sửa","Hỏng","Hư hỏng"].includes(x.condition_status)).length;

 const editIcon='<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16v4zM13.5 6.5l4 4"/></svg>';
 const trashIcon='<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>';

 $("#toolsBody").innerHTML=list.map((t,i)=>{
   const name=sentenceCapitalizeText(t.name||"");
   const brand=t.brand?sentenceCapitalizeText(t.brand):"—";
   const location=t.location?sentenceCapitalizeText(t.location):"—";
   const keeper=t.keeper?sentenceCapitalizeText(t.keeper):"—";
   const note=t.note?sentenceCapitalizeText(t.note):"—";
   const unit=t.unit?sentenceCapitalizeText(t.unit):"";
   return '<tr>'+
     '<td class="sttCell">'+(i+1)+'</td>'+
     '<td class="toolNameCell"><div><b>'+esc(name)+'</b><small>'+esc(t.code||"")+'</small></div></td>'+
     '<td>'+esc(brand)+'</td>'+
     '<td><span class="toolQtyValue">'+inventoryFmt(t.qty)+'</span> <small class="toolUnit">'+esc(unit)+'</small></td>'+
     '<td>'+esc(location)+'</td>'+
     '<td>'+esc(keeper)+'</td>'+
     '<td><span class="toolCondition '+(["Tốt","Đang sử dụng"].includes(t.condition_status)?"good":["Hỏng","Hư hỏng","Cần sửa"].includes(t.condition_status)?"bad":"warn")+'">'+esc(t.condition_status)+'</span></td>'+
     '<td class="toolNoteCell" title="'+esc(note==="—"?"":note)+'">'+esc(note)+'</td>'+
     '<td><div class="invRowActions compact"><button title="Sửa" onclick="editTool(\''+t.id+'\')">'+editIcon+'</button><button title="Xóa" class="danger" onclick="deleteTool(\''+t.id+'\')">'+trashIcon+'</button></div></td>'+
   '</tr>';
 }).join("");
 const mobileTools=$("#toolsMobileCards");
 if(mobileTools)mobileTools.innerHTML=list.map((t,i)=>{
  const id=String(t.id).replace(/[^a-zA-Z0-9_-]/g,"");
  const meta=[["Tình trạng",t.condition_status],["Hãng",t.brand],["Vị trí",t.location],["Phụ trách",t.keeper]];
  const edit=canProjectEdit()?'<div class="invMobileCardActions">'+
   '<button type="button" onclick="editTool(\''+id+'\')">Sửa</button>'+
   '<button type="button" class="is-delete" onclick="deleteTool(\''+id+'\')">Xóa</button></div>':'';
  return '<article class="invMobileCard"><div class="invMobileCardHead">'+
   '<div class="invMobileCardName"><strong>'+esc(sentenceCapitalizeText(t.name||""))+'</strong>'+
   (t.code?'<small>Mã: '+esc(t.code)+'</small>':'')+
   '<span class="invMobileUnit">'+inventoryFmt(t.qty)+' '+esc(t.unit||"Cái")+'</span></div>'+
   '<span class="invMobileNumber">#'+(i+1)+'</span></div>'+
   '<div class="invMobileMeta">'+meta.map(([label,value])=>'<div><small>'+label+'</small><b>'+esc(value||"—")+'</b></div>').join("")+'</div>'+
   (t.note?'<div class="invMobileNote">'+esc(t.note)+'</div>':'')+edit+'</article>';
 }).join("");
 $("#toolsEmpty").classList.toggle("hide",list.length>0);
}
function setInventoryTab(tab){
 inventoryActiveTab=tab;
 // Preserve the selected year/month when switching between Materials and Tools.
 document.querySelectorAll("[data-inventory-tab]").forEach(b=>b.classList.toggle("active",b.dataset.inventoryTab===tab));
 $("#inventoryMaterialsPane").classList.toggle("hide",tab!=="materials");
 $("#inventoryToolsPane").classList.toggle("hide",tab!=="tools");
}
function resetMaterialForm(sampleName="",sampleUnit="Cái"){
 $("#materialId").value="";$("#materialCode").value="";$("#materialName").value=sampleName;$("#materialUnit").value=sampleUnit||"Cái";
 $("#materialTrackingStart").value=today();$("#materialTrackingStart").max=today();$("#materialOpeningQty").value="0";$("#materialMinQty").value="0";$("#materialNote").value="";
 $("#materialModalTitle").textContent="Thêm vật tư";
}
function openMaterialModal(sampleName="",sampleUnit="Cái"){if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");resetMaterialForm(sampleName,sampleUnit);$("#materialItemModal").classList.remove("hide");setTimeout(()=>$("#materialName").focus(),40)}
window.editMaterial=id=>{
 const m=inventoryMaterials.find(x=>String(x.id)===String(id));if(!m)return;
 $("#materialId").value=m.id;$("#materialCode").value=m.code||"";$("#materialName").value=m.name;$("#materialUnit").value=m.unit;$("#materialTrackingStart").value=inventoryTrackingStart(m);$("#materialTrackingStart").max=today();$("#materialOpeningQty").value=m.opening_qty;$("#materialMinQty").value=m.min_qty;$("#materialNote").value=m.note||"";
 $("#materialModalTitle").textContent="Chỉnh sửa vật tư";$("#materialItemModal").classList.remove("hide");
};
window.deleteMaterial=async id=>{
 if(!currentAccount?.is_admin)return toast("Chỉ tài khoản Admin mới được xóa vật tư");
 const m=inventoryMaterials.find(x=>String(x.id)===String(id)&&!x.archived_at);if(!m)return;
 const stock=inventoryStockAsOf(m,today());
 if(stock===null||Math.abs(inventoryNum(stock))>=0.000001)return toast("Chỉ có thể xóa vật tư khi tồn kho bằng 0");
 if(!confirm("Xóa vật tư “"+m.name+"” khỏi danh sách đang sử dụng?\n\nLịch sử nhập/xuất và liên kết công việc sẽ được giữ lại."))return;
 try{
   await sbFetch("/rest/v1/inventory_materials?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{
     method:"PATCH",token:centralSession.access_token,body:{archived_at:new Date().toISOString(),updated_at:new Date().toISOString()}
   });
   if(typeof demoCache!=="undefined")demoCache.loaded=false;
   await loadInventoryData(currentBuilding.id,true);
   toast("Đã xóa vật tư khỏi danh sách");
 }catch(e){toast(e.message||"Không thể xóa vật tư")}
};
function syncStockTxnQuickChoice(){
 const selected=$("#stockTxnType")?.value==="out"?"out":"in";
 document.querySelectorAll('#stockTxnQuickChoices input[name="stockTxnQuickType"]').forEach(r=>{r.checked=r.value===selected});
 const compact=$("#stockTxnModal")?.classList.contains("stockTxnSharedCompact")&&(!window.matchMedia||window.matchMedia("(max-width:760px)").matches);
 const submit=$("#stockTxnSubmit");
 if(submit)submit.textContent=compact?(selected==="out"?"Xác nhận xuất":"Xác nhận nhập"):"Lưu giao dịch";
}
window.openStockTxnModal=id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 if(!inventoryActiveMaterials().length)return toast("Hãy thêm vật tư trước");
 const now=new Date(),allYear=String(inventoryActiveMonth)==="all";
 // The 12-month overview has no single entry month: default to today, not January.
 const y=allYear?now.getFullYear():inventoryYearValue();
 const m=allYear?now.getMonth()+1:Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 if(y+"-"+String(m).padStart(2,"0")+"-01">today())return toast("Không thể nhập / xuất cho tháng tương lai");
 const same=y===now.getFullYear()&&m===now.getMonth()+1;
 const day=same?now.getDate():1;
 const maxDay=new Date(y,m,0).getDate();
 const date=y+"-"+String(m).padStart(2,"0")+"-"+String(Math.min(day,maxDay)).padStart(2,"0");
 $("#stockTxnId").value="";$("#stockTxnDate").value=date;$("#stockTxnType").value="in";$("#stockTxnQty").value="";$("#stockTxnPerformer").value="";$("#stockTxnNote").value="";
 $("#stockTxnModal").classList.toggle("stockTxnSharedCompact",isEstaInventoryProject());
 syncStockTxnQuickChoice();
 renderMaterials();if(id)$("#stockTxnMaterial").value=id;
 const chosen=inventoryActiveMaterials().find(x=>x.id===$("#stockTxnMaterial").value);
 $("#stockTxnDate").max=today();
 $("#stockTxnDate").min=chosen?inventoryTrackingStart(chosen):"";
 if(chosen&&$("#stockTxnDate").value<inventoryTrackingStart(chosen))$("#stockTxnDate").value=inventoryTrackingStart(chosen);
 $("#stockTxnModal").classList.remove("hide");
};
window.openLinkedTaskFromStockTxn=id=>{
 const task=load().find(x=>String(x.id)===String(id));
 if(!task)return toast("Công việc liên kết đã bị xóa. Giao dịch vật tư vẫn được giữ lại theo lịch sử.");
 showModule("work");
 requestAnimationFrame(()=>window.editTask?.(id));
};
window.deleteStockTxn=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const tx=inventoryTransactions.find(x=>String(x.id)===String(id));
 if(tx?.source_type==="work_task")return toast("Giao dịch này được tạo từ Công việc. Hãy chỉnh vật tư trong công việc để hệ thống tự cân đối.");
 if(!confirm("Xóa giao dịch nhập/xuất này?"))return;
 try{await sbFetch("/rest/v1/inventory_material_transactions?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadInventoryData(currentBuilding.id,true);toast("Đã xóa giao dịch")}catch(e){toast(e.message)}
};
function resetToolForm(sampleName="",sampleUnit="Cái"){
 $("#toolId").value="";$("#toolCode").value="";$("#toolName").value=sampleName;$("#toolBrand").value="";$("#toolQty").value="1";$("#toolUnit").value=sampleUnit||"Cái";$("#toolLocation").value="";$("#toolKeeper").value="";$("#toolCondition").value="Đang sử dụng";$("#toolAcquiredDate").value="";$("#toolNote").value="";$("#toolModalTitle").textContent="Thêm dụng cụ";
}
function openToolModal(sampleName="",sampleUnit="Cái"){if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");resetToolForm(sampleName,sampleUnit);inventoryFillPeople();$("#toolItemModal").classList.remove("hide");setTimeout(()=>$("#toolName").focus(),40)}
window.editTool=id=>{
 const t=inventoryTools.find(x=>String(x.id)===String(id));if(!t)return;
 inventoryFillPeople();$("#toolId").value=t.id;$("#toolCode").value=t.code||"";$("#toolName").value=t.name;$("#toolBrand").value=t.brand||"";$("#toolQty").value=t.qty;$("#toolUnit").value=t.unit;$("#toolLocation").value=t.location||"";$("#toolKeeper").value=t.keeper||"";$("#toolCondition").value=["Tốt","Đang sử dụng","Cần kiểm tra","Hư hỏng"].includes(t.condition_status)?t.condition_status:(["Hỏng","Cần sửa"].includes(t.condition_status)?"Hư hỏng":"Đang sử dụng");$("#toolAcquiredDate").value=t.acquired_date||"";$("#toolNote").value=t.note||"";$("#toolModalTitle").textContent="Chỉnh sửa dụng cụ";$("#toolItemModal").classList.remove("hide");
};
window.deleteTool=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const t=inventoryTools.find(x=>String(x.id)===String(id));if(!t||!confirm("Xóa dụng cụ “"+t.name+"”?"))return;
 try{await sbFetch("/rest/v1/inventory_tools?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadInventoryData(currentBuilding.id,true);toast("Đã xóa dụng cụ")}catch(e){toast(e.message)}
};
/* ===== BẢO TRÌ THIẾT BỊ ===== */
let maintenanceAssets=[],maintenanceRecords=[],maintenanceLoadedBuilding="",maintenanceActiveMonth="";
function addDaysIso(date,days){
 const d=new Date((date||today())+"T00:00:00");d.setDate(d.getDate()+Number(days||0));return d.toLocaleDateString("en-CA");
}
function maintenanceAutoCode(){
 const project=String(currentBuilding?.id||"DA").replace(/[^A-Za-z0-9]/g,"").toUpperCase()||"DA";
 return "TB-"+project+"-"+String(Date.now()).slice(-6);
}
function maintenanceAutoNext(baseDate,frequencyDays){
 const freq=Math.max(1,Number(frequencyDays)||30);
 return baseDate?addDaysIso(baseDate,freq):addDaysIso(today(),freq);
}
function maintenanceNextFromSchedule(asset){
 const freq=Math.max(1,Number(asset?.frequency_days)||30);
 const anchor=String(asset?.next_due_date||asset?.last_service_date||today());
 return addDaysIso(anchor,freq);
}
function maintenanceProjectedDates(asset,yearValue){
 const year=Number(yearValue||new Date().getFullYear());
 const freq=Math.max(1,Number(asset?.frequency_days)||30);
 let cursor=String(asset?.next_due_date||"");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(cursor))return [];
 const end=year+"-12-31";
 let guard=0;
 while(cursor<year+"-01-01"&&guard<500){cursor=addDaysIso(cursor,freq);guard++}
 const out=[];
 while(cursor<=end&&guard<1000){
  if(cursor.startsWith(String(year)+"-"))out.push(cursor);
  cursor=addDaysIso(cursor,freq);guard++;
 }
 return out;
}
function maintenanceDueClass(asset){
 if(asset.status==="Ngừng sử dụng")return "paused";
 const d=asset.next_due_date;if(!d)return "unknown";
 const now=today(),soon=addDaysIso(now,30);
 if(d<now)return "overdue";if(d<=soon)return "soon";return "ok";
}
function maintenanceDueText(asset){
 const c=maintenanceDueClass(asset);
 return c==="overdue"?"Quá hạn":c==="soon"?"Sắp đến hạn":c==="ok"?"Đúng kế hoạch":c==="paused"?"Ngừng sử dụng":"Chưa đặt lịch";
}
async function loadMaintenanceData(buildingId=currentBuilding?.id,force=false){
 if(!centralSession?.access_token||!buildingId)return;
 if(!force&&maintenanceLoadedBuilding===buildingId){renderMaintenance();return}
 try{
   const b=encodeURIComponent(buildingId),token=centralSession.access_token;
   const result=await Promise.all([
     sbFetch("/rest/v1/maintenance_assets?select=*&building_id=eq."+b+"&order=next_due_date.asc.nullslast,name.asc",{token}),
     sbFetch("/rest/v1/maintenance_records?select=*&building_id=eq."+b+"&order=service_date.desc,created_at.desc",{token})
   ]);
   if(String(currentBuilding?.id||"")!==String(buildingId))return;
   maintenanceAssets=Array.isArray(result[0])?result[0]:[];
   maintenanceRecords=Array.isArray(result[1])?result[1]:[];
   maintenanceLoadedBuilding=buildingId;inventoryFillPeople();renderMaintenance();
 }catch(e){if(String(currentBuilding?.id||"")!==String(buildingId))return;console.warn("Load maintenance failed",e);toast("Không tải được dữ liệu bảo trì")}
}
function renderMaintenance(){
 const q=($("#maintenanceSearch")?.value||"").trim().toLocaleLowerCase("vi-VN"),sys=$("#maintenanceSystemFilter")?.value||"",due=$("#maintenanceDueFilter")?.value||"";
 const year=String(new Date().getFullYear());
 const selectedMonth=maintenanceActiveMonth?String(maintenanceActiveMonth).padStart(2,"0"):"";
 const hasProjectedMonth=(a)=>!selectedMonth||maintenanceProjectedDates(a,year).some(d=>d.slice(5,7)===selectedMonth);
 const list=maintenanceAssets.filter(a=>(!sys||a.system_type===sys)&&(!due||maintenanceDueClass(a)===due)&&hasProjectedMonth(a)&&(!q||[a.name,a.location,a.system_type,a.assigned_to,a.model].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
 const monthStrip=$("#maintenanceMonthStrip");
 if(monthStrip){
   monthStrip.innerHTML=Array.from({length:12},(_,i)=>{
     const m=i+1,mm=String(m).padStart(2,"0");
     const count=maintenanceAssets.reduce((sum,a)=>sum+maintenanceProjectedDates(a,year).filter(d=>d.slice(5,7)===mm).length,0);
     return '<button type="button" class="'+(String(maintenanceActiveMonth)===String(m)?"active":"")+'" data-maint-month="'+m+'"><span>Th'+mm+'</span><b>'+count+'</b></button>';
   }).join("");
   monthStrip.querySelectorAll("[data-maint-month]").forEach(b=>b.onclick=()=>{const m=Number(b.dataset.maintMonth);maintenanceActiveMonth=String(maintenanceActiveMonth)===String(m)?"":m;renderMaintenance()});
 }
 $("#maintAssetCount").textContent=maintenanceAssets.length;
 $("#maintOverdueCount").textContent=maintenanceAssets.filter(a=>maintenanceDueClass(a)==="overdue").length;
 $("#maintDueSoonCount").textContent=maintenanceAssets.filter(a=>maintenanceDueClass(a)==="soon").length;
 const yr=String(new Date().getFullYear());
 $("#maintDoneYearCount").textContent=maintenanceRecords.filter(r=>String(r.service_date||"").startsWith(yr)&&r.result_status==="Hoàn thành").length;
 $("#maintenanceAssetGrid").innerHTML=list.map(a=>{
   const cls=maintenanceDueClass(a),last=a.last_service_date?fmt(a.last_service_date):"Chưa có",next=a.next_due_date?fmt(a.next_due_date):"Chưa đặt";
   return '<article class="maintenanceAssetCard '+cls+'"><div class="maintCardTop"><span class="maintSystem">'+esc(a.system_type)+'</span><span class="maintDue '+cls+'">'+maintenanceDueText(a)+'</span></div><h3>'+esc(a.name)+'</h3><p>'+esc(a.location||"Chưa ghi vị trí")+'</p><div class="maintDates"><div><small>Gần nhất</small><b>'+last+'</b></div><div><small>Kế tiếp</small><b>'+next+'</b></div><div><small>Chu kỳ</small><b>'+a.frequency_days+' ngày</b></div></div><div class="maintCardMeta"><span>Phụ trách: <b>'+esc(a.assigned_to||"—")+'</b></span><span>Trạng thái: <b>'+esc(a.status)+'</b></span></div><div class="maintCardActions"><button class="primary" onclick="openMaintenanceRecord(\''+a.id+'\')">＋ Ghi bảo trì</button><button onclick="editMaintenanceAsset(\''+a.id+'\')">Sửa</button><button class="danger" onclick="deleteMaintenanceAsset(\''+a.id+'\')">×</button></div></article>';
 }).join("");
 $("#maintenanceEmpty").classList.toggle("hide",list.length>0);
 const byId=Object.fromEntries(maintenanceAssets.map(a=>[a.id,a]));
 const rec=maintenanceRecords.slice(0,60);
 $("#maintenanceHistoryBody").innerHTML=rec.map(r=>'<tr><td>'+fmt(r.service_date)+'</td><td><b>'+esc(byId[r.asset_id]?.name||"Thiết bị đã xóa")+'</b></td><td>'+esc(r.maintenance_type)+'</td><td>'+esc(r.performer||"—")+'</td><td>'+esc(r.work_done||"—")+'</td><td><span class="maintResult '+(r.result_status==="Hoàn thành"?"good":r.result_status==="Chưa hoàn thành"?"bad":"warn")+'">'+esc(r.result_status)+'</span></td><td>'+(r.next_due_date?fmt(r.next_due_date):"—")+'</td><td>'+inventoryFmt(r.cost)+' đ</td><td><button class="miniDanger" onclick="deleteMaintenanceRecord(\''+r.id+'\')">Xóa</button></td></tr>').join("");
 $("#maintenanceHistoryEmpty").classList.toggle("hide",rec.length>0);
}
function resetMaintenanceAssetForm(name="",system="HVAC",freq=30){
 $("#maintenanceAssetId").value="";$("#maintenanceName").value=name;$("#maintenanceSystem").value=system;$("#maintenanceLocation").value="";$("#maintenanceManufacturer").value="";$("#maintenanceModel").value="";$("#maintenanceFrequency").value=freq;$("#maintenanceLastDate").value="";$("#maintenanceNextDate").value=maintenanceAutoNext("",freq);$("#maintenanceAssigned").value="";$("#maintenanceStatus").value="Hoạt động";$("#maintenanceNote").value="";$("#maintenanceAssetModalTitle").textContent="Thêm thiết bị";
}
function openMaintenanceAssetModal(name="",system="HVAC",freq=30){inventoryFillPeople();resetMaintenanceAssetForm(name,system,freq);$("#maintenanceAssetModal").classList.remove("hide");setTimeout(()=>$("#maintenanceName").focus(),40)}
window.editMaintenanceAsset=id=>{
 const a=maintenanceAssets.find(x=>String(x.id)===String(id));if(!a)return;inventoryFillPeople();
 $("#maintenanceAssetId").value=a.id;$("#maintenanceName").value=a.name;$("#maintenanceSystem").value=a.system_type;$("#maintenanceLocation").value=a.location||"";$("#maintenanceManufacturer").value=a.manufacturer||"";$("#maintenanceModel").value=a.model||"";$("#maintenanceFrequency").value=a.frequency_days;$("#maintenanceLastDate").value=a.last_service_date||"";$("#maintenanceNextDate").value=a.last_service_date?maintenanceAutoNext(a.last_service_date,a.frequency_days):(a.next_due_date||maintenanceAutoNext("",a.frequency_days));$("#maintenanceAssigned").value=a.assigned_to||"";$("#maintenanceStatus").value=a.status;$("#maintenanceNote").value=a.note||"";$("#maintenanceAssetModalTitle").textContent="Chỉnh sửa thiết bị";$("#maintenanceAssetModal").classList.remove("hide");
};
window.deleteMaintenanceAsset=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const a=maintenanceAssets.find(x=>String(x.id)===String(id));if(!a||!confirm("Xóa thiết bị “"+a.name+"” và toàn bộ lịch sử bảo trì?"))return;
 try{await sbFetch("/rest/v1/maintenance_assets?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadMaintenanceData(currentBuilding.id,true);toast("Đã xóa thiết bị")}catch(e){toast(e.message)}
};
window.openMaintenanceRecord=id=>{
 const a=maintenanceAssets.find(x=>String(x.id)===String(id));if(!a)return;inventoryFillPeople();
 $("#maintenanceRecordId").value="";$("#maintenanceRecordAssetId").value=a.id;$("#maintenanceRecordAssetName").textContent=a.name+" · "+(a.location||a.system_type);$("#maintenanceRecordDate").value=today();$("#maintenanceRecordType").value="Định kỳ";$("#maintenanceRecordPerformer").value=a.assigned_to||"";$("#maintenanceRecordResult").value="Hoàn thành";$("#maintenanceWorkDone").value="";$("#maintenanceRecordNextDate").value=maintenanceNextFromSchedule(a);$("#maintenanceCost").value="0";$("#maintenanceRecordNote").value="";$("#maintenanceRecordModal").classList.remove("hide");
};
window.deleteMaintenanceRecord=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 if(!confirm("Xóa nhật ký bảo trì này?"))return;
 try{await sbFetch("/rest/v1/maintenance_records?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadMaintenanceData(currentBuilding.id,true);toast("Đã xóa nhật ký")}catch(e){toast(e.message)}
};
function maintenanceReportPeriod(kind="week",refDate=today()){
 const d=new Date(String(refDate||today()).slice(0,10)+"T00:00:00");
 const y=d.getFullYear(),m=d.getMonth(),day=d.getDate(),mm=String(m+1).padStart(2,"0");
 const first=new Date(y,m,1),last=new Date(y,m+1,0);
 const iso=x=>x.toLocaleDateString("en-CA");
 const firstOffset=(first.getDay()+6)%7;
 const weekNo=Math.floor((day+firstOffset-1)/7)+1;
 let from,to,label,suffix,code;
 if(kind==="month"){
   from=first;to=last;
   label="THÁNG "+mm+"/"+y;
   suffix="Thang"+mm+"_"+y;
   code="BC-BTTB-"+y+mm;
 }else{
   const mondayOffset=(d.getDay()+6)%7;
   from=new Date(d);from.setDate(d.getDate()-mondayOffset);
   to=new Date(d);to.setDate(d.getDate()+(6-mondayOffset));
   if(from<first)from=new Date(first);
   if(to>last)to=new Date(last);
   label="TUẦN "+weekNo+" THÁNG "+mm+"/"+y;
   suffix="Tuan"+weekNo+"_Thang"+mm+"_"+y;
   code="BC-BTTB-"+y+mm+"-T"+weekNo;
 }
 return {kind,year:y,month:m+1,weekNo,from:iso(from),to:iso(to),label,suffix,code};
}
function maintenanceReportFilename(period){
 return "BaoCao_BaoTriThietBi_"+period.suffix+".pdf";
}
async function exportMaterialsEstaPdf(){
 const y=inventoryYearValue(),allYear=String(inventoryActiveMonth)==="all";
 const month=allYear?null:Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 const active=inventoryActiveMaterials().map(m=>({m,s:inventorySnapshot(m,y)}))
   .filter(x=>allYear?x.s.months.some(mm=>mm.active):x.s.months[month-1]?.active);
 if(!active.length)return toast("Chưa có vật tư để xuất PDF");
 const stockValue=x=>allYear?inventoryNum(x.s.closing):inventoryNum(x.s.months[month-1]?.stock);
 const totalIn=active.reduce((sum,x)=>sum+(allYear?inventoryNum(x.s.totalIn):inventoryNum(x.s.months[month-1]?.inQty)),0);
 const totalOut=active.reduce((sum,x)=>sum+(allYear?inventoryNum(x.s.totalOut):inventoryNum(x.s.months[month-1]?.outQty)),0);
 const inStock=active.filter(x=>stockValue(x)>0).length;
 const low=active.filter(x=>inventoryNum(x.m.min_qty)>0&&stockValue(x)<=inventoryNum(x.m.min_qty)).length;
 const rows=active.map((x,i)=>{
   if(allYear){
     const detail=x.s.months.map((mm,idx)=>mm.active?("T"+(idx+1)+": N "+inventoryFmt(mm.inQty)+" / X "+inventoryFmt(mm.outQty)):"T"+(idx+1)+": —").join(" · ");
     return [i+1,x.m.name+(x.m.code?" · "+x.m.code:""),x.m.unit,inventoryFmt(x.s.opening??0),detail,inventoryFmt(x.s.totalIn),inventoryFmt(x.s.totalOut),inventoryFmt(x.s.closing??0)];
   }
   const mm=x.s.months[month-1];
   return [i+1,x.m.name+(x.m.code?" · "+x.m.code:""),x.m.unit,inventoryFmt(mm.begin),inventoryFmt(mm.inQty),inventoryFmt(mm.outQty),inventoryFmt(mm.stock)];
 });
 const period=allYear?("12 THÁNG / "+y):("THÁNG "+String(month).padStart(2,"0")+" / "+y);
 const columns=allYear?[
   {label:"STT",weight:.6},{label:"Vật tư",weight:2.4},{label:"ĐVT",weight:.8},{label:"Tồn đầu",weight:1},
   {label:"Phát sinh 12 tháng",weight:4.3},{label:"Tổng nhập",weight:1},{label:"Tổng xuất",weight:1},{label:"Tồn cuối",weight:1}
 ]:[
   {label:"STT",weight:.6},{label:"Vật tư",weight:2.7},{label:"ĐVT",weight:.8},{label:"Tồn đầu",weight:1},
   {label:"Nhập",weight:1},{label:"Xuất",weight:1},{label:"Tồn cuối",weight:1}
 ];
 return exportGenericEstaPdf({
   title:allYear?"BÁO CÁO VẬT TƯ TIÊU HAO 12 THÁNG":"BÁO CÁO NHẬP - XUẤT - TỒN VẬT TƯ",
   sectionLabel:"QUẢN LÝ VẬT TƯ TIÊU HAO",tableLabel:"BẢNG VẬT TƯ",
   periodLabel:period,filename:"BaoCao_VatTu_"+(allYear?("12Thang_"+y):("Thang"+String(month).padStart(2,"0")+"_"+y))+".pdf",
   columns,rows,
   summaries:[
     {value:inventoryFmt(totalIn),label:allYear?"TỔNG NHẬP NĂM":"TỔNG NHẬP"},
     {value:inventoryFmt(totalOut),label:allYear?"TỔNG XUẤT NĂM":"TỔNG XUẤT"},
     {value:inStock,label:"MẶT HÀNG CÒN TỒN"},
     {value:low,label:"SẮP HẾT"}
   ]
 });
}
window.exportMaterialsEstaPdf=exportMaterialsEstaPdf;
$("#materialExportPdf").onclick=exportMaterialsEstaPdf;
function toolsForReport(){
 const q=($("#toolSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 return inventoryTools.filter(t=>!q||[t.name,t.code,t.brand,t.location,t.keeper,t.note,t.condition_status].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q)));
}
let toolReportBusy=false;
async function exportToolsEstaPdf(){
 const rows=toolsForReport();
 if(!rows.length)return toast("Chưa có dụng cụ để xuất PDF");
 if(toolReportBusy)return toast("Báo cáo dụng cụ đang được tạo");
 if(!centralSession?.access_token)return toast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
 const signer=await requestPdfSignature();
 if(!signer)return;
 toolReportBusy=true;
 try{
  toast("Đang tạo PDF Dụng cụ kỹ thuật theo mẫu ESTA chuẩn...");
  await ensureCentralSessionFresh();
  const payload={
   report_type:"tools",
   building:String(currentBuilding?.name||"[CẦN BỔ SUNG]"),
   report_date:new Date().toLocaleDateString("vi-VN"),
   period_label:"DANH MỤC HIỆN TẠI",
   ...pdfSignaturePayload(signer),
   tools:rows.map(t=>({
    name:String(t.name||""),
    brand:String(t.brand||""),
    qty:Number(t.qty||0),
    unit:String(t.unit||""),
    location:String(t.location||""),
    keeper:String(t.keeper||""),
    condition_status:String(t.condition_status||""),
    acquired_date:String(t.acquired_date||""),
    note:String(t.note||"")
   }))
  };
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),115000);
  try{
   const res=await centralAuthFetch("/api/esta_report",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload),signal:controller.signal
   });
   const blob=await readVerifiedEstaPdf(res);
   const url=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=url;a.download="BaoCao_DungCuKyThuat_"+today().replaceAll("-","")+".pdf";
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
   clearReportPdfIssue();toast("Đã xuất PDF Dụng cụ kỹ thuật ESTA chuẩn");
  }finally{clearTimeout(timer)}
 }catch(err){
  if(err?.name==="AbortError")toast("Tạo PDF quá thời gian. Vui lòng thử lại.");
  else reportPdfIssue(err);
 }finally{toolReportBusy=false}
}
$("#toolExportPdf").onclick=exportToolsEstaPdf;

/* Dụng cụ – Vật tư: wire controls once so switching months and rerendering cannot lose them. */
document.querySelectorAll("[data-inventory-tab]").forEach(button=>{
 button.addEventListener("click",()=>setInventoryTab(button.dataset.inventoryTab));
});
$("#inventoryYear").addEventListener("change",renderMaterials);
$("#inventory130Search")?.addEventListener("input",event=>{
 const original=$("#materialSearch");if(!original)return;
 original.value=event.target.value;
 original.dispatchEvent(new Event("input",{bubbles:true}));
});
$("#inventory130Year")?.addEventListener("change",event=>{
 const original=$("#inventoryYear");if(!original)return;
 original.value=event.target.value;
 original.dispatchEvent(new Event("change",{bubbles:true}));
});
$("#inventory130Pdf")?.addEventListener("click",()=>$("#materialExportPdf")?.click());
$("#inventory130AddMaterial")?.addEventListener("click",()=>$("#addMaterialBtn")?.click());
$("#inventory130FloatingTxn")?.addEventListener("click",()=>$("#openStockTxn")?.click());
$("#materialMonthTabs").addEventListener("click",event=>{
 const button=event.target.closest("button[data-material-month]");
 if(!button||!$("#materialMonthTabs").contains(button))return;
 const value=button.dataset.materialMonth;
 if(value!=="all"&&!/^([1-9]|1[0-2])$/.test(value))return;
 inventoryActiveMonth=value==="all"?"all":Number(value);
 renderMaterials();
});
$("#materialMobilePeriod")?.addEventListener("change",e=>{
  const value=e.target.value;
  const monthButton=[...document.querySelectorAll("[data-material-month]")].find(b=>b.dataset.materialMonth===value);
  monthButton?.click();
 });
 $("#materialSearch").addEventListener("input",renderMaterials);
$("#toolSearch").addEventListener("input",renderTools);
$("#stockAlertOnly").addEventListener("click",()=>{
 inventoryShowAlertsOnly=!inventoryShowAlertsOnly;
 renderMaterials();
});
$("#addMaterialBtn").addEventListener("click",()=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 openMaterialModal();
});
$("#openStockTxn").addEventListener("click",()=>openStockTxnModal());
$("#addToolBtn").addEventListener("click",()=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 openToolModal();
});
document.querySelectorAll("[data-material-sample]").forEach(b=>b.onclick=()=>{const [n,u]=b.dataset.materialSample.split("|");b.closest("details")?.removeAttribute("open");openMaterialModal(n,u)});
document.querySelectorAll("[data-tool-sample]").forEach(b=>b.onclick=()=>{const [n,u]=b.dataset.toolSample.split("|");openToolModal(n,u)});
$("#closeMaterialModal").onclick=$("#cancelMaterialModal").onclick=()=>$("#materialItemModal").classList.add("hide");
$("#closeStockTxnModal").onclick=$("#cancelStockTxnModal").onclick=()=>$("#stockTxnModal").classList.add("hide");
$("#closeToolModal").onclick=$("#cancelToolModal").onclick=()=>$("#toolItemModal").classList.add("hide");
$("#materialItemForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const id=$("#materialId").value,trackingStart=$("#materialTrackingStart").value||today();
 if(trackingStart>today())return toast("Ngày bắt đầu quản lý không thể ở tương lai");
 const existingFirstTx=id?inventoryTransactions.filter(x=>String(x.material_id)===String(id)).map(x=>x.tx_date).sort()[0]:null;
 if(existingFirstTx&&trackingStart>existingFirstTx)return toast("Ngày bắt đầu quản lý không thể sau giao dịch đầu tiên "+fmt(existingFirstTx));
 const body={building_id:currentBuilding.id,code:$("#materialCode").value.trim(),name:$("#materialName").value.trim(),unit:$("#materialUnit").value.trim()||"Cái",tracking_start_date:trackingStart,opening_qty:inventoryNum($("#materialOpeningQty").value),min_qty:inventoryNum($("#materialMinQty").value),note:$("#materialNote").value.trim(),updated_at:new Date().toISOString()};
 try{
  if(id)await sbFetch("/rest/v1/inventory_materials?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
  else await sbFetch("/rest/v1/inventory_materials",{method:"POST",token:centralSession.access_token,body});
  $("#materialItemModal").classList.add("hide");await loadInventoryData(currentBuilding.id,true);toast(id?"Đã cập nhật vật tư":"Đã thêm vật tư");
 }catch(err){toast(err.status===409?"Vật tư này đã có trong dự án":err.message)}
};
document.querySelectorAll('#stockTxnQuickChoices input[name="stockTxnQuickType"]').forEach(radio=>{
 radio.addEventListener("change",()=>{
  if(!radio.checked)return;
  $("#stockTxnType").value=radio.value;
  syncStockTxnQuickChoice();
 });
});
$("#stockTxnType").addEventListener("change",syncStockTxnQuickChoice);
$("#stockTxnMaterial").onchange=()=>{
 const m=inventoryActiveMaterials().find(x=>x.id===$("#stockTxnMaterial").value);
 $("#stockTxnDate").min=m?inventoryTrackingStart(m):"";
 $("#stockTxnDate").max=today();
 if(m&&$("#stockTxnDate").value<inventoryTrackingStart(m))$("#stockTxnDate").value=inventoryTrackingStart(m);
};
$("#stockTxnForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const materialId=$("#stockTxnMaterial").value,qty=inventoryNum($("#stockTxnQty").value),txType=$("#stockTxnType").value,date=$("#stockTxnDate").value;
 if(!materialId||qty<=0)return toast("Vui lòng chọn vật tư và số lượng");
 const m=inventoryActiveMaterials().find(x=>x.id===materialId);
 if(!m)return toast("Không tìm thấy vật tư");
 const trackingStart=inventoryTrackingStart(m);
 if(date<trackingStart)return toast("Vật tư này chỉ bắt đầu quản lý từ "+fmt(trackingStart));
 if(date>today())return toast("Không thể nhập/xuất ở ngày tương lai");
 if(txType==="out"){
   const stockAtDate=inventoryStockAsOf(m,date);
   if(stockAtDate===null||qty>stockAtDate)return toast("Số lượng xuất vượt quá tồn kho tại ngày "+fmt(date));
 }
 const body={building_id:currentBuilding.id,material_id:materialId,tx_date:date,tx_type:txType,qty,performer:$("#stockTxnPerformer").value,note:$("#stockTxnNote").value.trim()};
 try{await sbFetch("/rest/v1/inventory_material_transactions",{method:"POST",token:centralSession.access_token,body});$("#stockTxnModal").classList.add("hide");await loadInventoryData(currentBuilding.id,true);toast(txType==="in"?"Đã nhập kho":"Đã xuất kho")}catch(err){toast(err.message)}
};
$("#toolItemForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const id=$("#toolId").value,body={building_id:currentBuilding.id,code:$("#toolCode").value.trim(),name:$("#toolName").value.trim(),brand:$("#toolBrand").value.trim(),qty:inventoryNum($("#toolQty").value),unit:$("#toolUnit").value.trim()||"Cái",location:$("#toolLocation").value.trim(),condition_status:$("#toolCondition").value,keeper:$("#toolKeeper").value,acquired_date:$("#toolAcquiredDate").value||null,note:$("#toolNote").value.trim(),updated_at:new Date().toISOString()};
 try{
   if(id)await sbFetch("/rest/v1/inventory_tools?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
   else await sbFetch("/rest/v1/inventory_tools",{method:"POST",token:centralSession.access_token,body});
   $("#toolItemModal").classList.add("hide");await loadInventoryData(currentBuilding.id,true);toast(id?"Đã cập nhật dụng cụ":"Đã thêm dụng cụ");
 }catch(err){toast(err.status===409?"Dụng cụ này đã có trong dự án":err.message)}
};

