/* ESTA Construction Materials Module */
let constructionMaterials=[],constructionLogs=[],constructionTransactions=[],constructionLoadedBuilding="",selectedConstructionMaterialId="",constructionCategoryFilter="",constructionActiveMonth=new Date().getMonth()+1;

function constructionStatusClass(status=""){
  return status==="Đang sử dụng"?"active":status==="Tạm ngưng"?"paused":"inactive";
}
function constructionLogStatusClass(status=""){
  return status==="Hoàn thành"?"done":status==="Đang thi công"?"doing":status==="Chờ xử lý"?"waiting":"paused";
}
function constructionLogsFor(id){
  return constructionLogs.filter(x=>String(x.material_id)===String(id));
}
function constructionLastLog(id){
  return constructionLogsFor(id).slice().sort((a,b)=>String(b.work_date||"").localeCompare(String(a.work_date||"")))[0]||null;
}
function constructionNum(v){
  const n=Number(v||0);
  return Number.isFinite(n)?n:0;
}
function constructionFmt(v){
  return constructionNum(v).toLocaleString("vi-VN",{maximumFractionDigits:2});
}
function constructionMoney(v){
  return constructionNum(v).toLocaleString("vi-VN",{maximumFractionDigits:0});
}
function constructionYearValue(){
  return Number($("#constructionYear")?.value)||new Date().getFullYear();
}
function constructionSetYears(){
  const el=$("#constructionYear");if(!el)return;
  const now=new Date().getFullYear(),old=Number(el.value)||now;
  el.innerHTML=Array.from({length:9},(_,i)=>now+2-i).map(y=>'<option value="'+y+'">'+y+'</option>').join("");
  el.value=String([...el.options].some(o=>Number(o.value)===old)?old:now);
}
function constructionTransactionsFor(id){
  return constructionTransactions.filter(x=>String(x.material_id)===String(id));
}
function constructionSnapshot(material,year=constructionYearValue()){
  const tx=constructionTransactionsFor(material.id).slice().sort((a,b)=>String(a.tx_date||"").localeCompare(String(b.tx_date||""))||String(a.created_at||"").localeCompare(String(b.created_at||"")));
  const start=year+"-01-01";
  let opening=constructionNum(material.opening_qty);
  tx.filter(x=>String(x.tx_date||"")<start).forEach(x=>opening+=x.tx_type==="in"?constructionNum(x.qty):-constructionNum(x.qty));
  let running=opening,totalIn=0,totalOut=0;
  const months=[];
  for(let m=1;m<=12;m++){
    const prefix=year+"-"+String(m).padStart(2,"0"),begin=running;
    let inQty=0,outQty=0;
    tx.filter(x=>String(x.tx_date||"").startsWith(prefix)).forEach(x=>{
      if(x.tx_type==="in"){inQty+=constructionNum(x.qty);running+=constructionNum(x.qty)}
      else{outQty+=constructionNum(x.qty);running-=constructionNum(x.qty)}
    });
    totalIn+=inQty;totalOut+=outQty;
    months.push({begin,inQty,outQty,stock:running});
  }
  const current=constructionNum(material.opening_qty)+tx.reduce((s,x)=>s+(x.tx_type==="in"?constructionNum(x.qty):-constructionNum(x.qty)),0);
  return {opening,totalIn,totalOut,closing:running,current,months};
}
function constructionFillPeople(){
  const el=$("#constructionStockPerformer");if(!el)return;
  const names=typeof projectPeople!=="undefined"?(projectPeople||[]).map(x=>x.name).filter(Boolean):[];
  const old=el.value;
  el.innerHTML='<option value="">— Chọn —</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");
  if(names.includes(old))el.value=old;
}
function constructionCategoryClass(value=""){
  const s=String(value||"Khác").toLocaleLowerCase("vi-VN");
  if(s.includes("pccc"))return "pccc";
  if(s.includes("điện")||s.includes("dien"))return "electric";
  if(s.includes("nước")||s.includes("nuoc"))return "water";
  if(s.includes("đhkk")||s.includes("hvac"))return "hvac";
  if(s.includes("hoàn thiện")||s.includes("hoan thien"))return "clean";
  return "other";
}
function constructionInitial(name=""){
  return (String(name||"").trim().charAt(0)||"V").toLocaleUpperCase("vi-VN");
}
async function loadConstructionMaterialData(buildingId=currentBuilding?.id,force=false){
  if(!centralSession?.access_token||!buildingId)return;
  if(!force&&constructionLoadedBuilding===buildingId){
    renderConstructionMaterials();
    if(selectedConstructionMaterialId)renderConstructionDetail();
    return;
  }
  try{
    const b=encodeURIComponent(buildingId),token=centralSession.access_token;
    constructionSetYears();
    const result=await Promise.all([
      sbFetch("/rest/v1/construction_materials?select=*&building_id=eq."+b+"&order=name.asc",{token}),
      sbFetch("/rest/v1/construction_material_logs?select=*&building_id=eq."+b+"&order=work_date.desc,created_at.desc",{token}),
      sbFetch("/rest/v1/construction_material_transactions?select=*&building_id=eq."+b+"&order=tx_date.desc,created_at.desc",{token})
    ]);
    constructionMaterials=Array.isArray(result[0])?result[0]:[];
    constructionLogs=Array.isArray(result[1])?result[1]:[];
    constructionTransactions=Array.isArray(result[2])?result[2]:[];
    constructionLoadedBuilding=buildingId;
    constructionFillPeople();
    if(selectedConstructionMaterialId&&!constructionMaterials.some(x=>String(x.id)===String(selectedConstructionMaterialId)))selectedConstructionMaterialId="";
    renderConstructionMaterials();
    if(selectedConstructionMaterialId)renderConstructionDetail();
  }catch(e){
    console.warn("Load construction materials failed",e);
    toast("Không tải được dữ liệu vật tư thi công");
  }
}
function renderConstructionMaterials(){
  constructionSetYears();
  const year=constructionYearValue();
  const search=($("#constructionSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
  const category=$("#constructionCategorySelect")?.value||"";
  const list=constructionMaterials.filter(m=>(!category||m.category===category)&&(!search||[m.name,m.brand,m.specification,m.unit,m.supplier,m.storage_location,m.category,m.note].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(search))));
  const annual=constructionActiveMonth==="all";
  const month=annual?null:Math.max(1,Math.min(12,Number(constructionActiveMonth)||1));
  document.querySelectorAll("[data-construction-month]").forEach(b=>b.classList.toggle("active",String(b.dataset.constructionMonth)===String(constructionActiveMonth)));
  $("#constructionMonthTitle").textContent=annual?"Tổng quan 12 tháng / "+year:"Tháng "+String(month).padStart(2,"0")+" / "+year;
  $("#constructionResultCount").textContent="("+list.length+")";

  const all=constructionMaterials.map(m=>({m,s:constructionSnapshot(m,year)}));
  const totalIn=annual?all.reduce((n,x)=>n+x.s.totalIn,0):all.reduce((n,x)=>n+x.s.months[month-1].inQty,0);
  const totalOut=annual?all.reduce((n,x)=>n+x.s.totalOut,0):all.reduce((n,x)=>n+x.s.months[month-1].outQty,0);
  const stockIndex=annual?11:month-1;
  $("#constructionInLabel").textContent=annual?"NHẬP TRONG NĂM":"NHẬP TRONG THÁNG";
  $("#constructionOutLabel").textContent=annual?"XUẤT TRONG NĂM":"XUẤT TRONG THÁNG";
  $("#constructionMonthIn").textContent=constructionFmt(totalIn);
  $("#constructionMonthOut").textContent=constructionFmt(totalOut);
  $("#constructionStockCount").textContent=all.filter(x=>x.s.months[stockIndex].stock>0).length;
  $("#constructionLowStockCount").textContent=all.filter(x=>constructionNum(x.m.min_qty)>0&&x.s.months[stockIndex].stock<=constructionNum(x.m.min_qty)).length;

  const table=$("#constructionStockTable");
  table.classList.toggle("annual",annual);
  if(annual){
    $("#constructionStockHead").innerHTML='<tr><th class="constructionSticky">Vật tư</th><th>ĐVT</th><th>Đầu năm</th>'+["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"].map(x=>'<th>'+x+'<small>N / X / T</small></th>').join("")+'<th>Tổng nhập</th><th>Tổng xuất</th><th>Tồn cuối</th><th>Thao tác</th></tr>';
    $("#constructionStockBody").innerHTML=list.map(m=>{
      const s=constructionSnapshot(m,year),low=constructionNum(m.min_qty)>0&&s.closing<=constructionNum(m.min_qty);
      return '<tr class="'+(low?"constructionLowRow":"")+'" data-material-row="'+m.id+'">'+
        '<td class="constructionSticky"><button class="constructionNameLink" data-view-material="'+m.id+'" type="button"><b>'+esc(m.name)+'</b><small>'+esc([m.specification,m.brand].filter(Boolean).join(" · ")||m.category||"")+'</small></button></td>'+
        '<td>'+esc(m.unit||"—")+'</td><td><b>'+constructionFmt(s.opening)+'</b></td>'+
        s.months.map(mm=>'<td class="constructionMonthCell"><span class="in">N '+constructionFmt(mm.inQty)+'</span><span class="out">X '+constructionFmt(mm.outQty)+'</span><b>T '+constructionFmt(mm.stock)+'</b></td>').join("")+
        '<td class="inText">'+constructionFmt(s.totalIn)+'</td><td class="outText">'+constructionFmt(s.totalOut)+'</td><td><b>'+constructionFmt(s.closing)+'</b></td>'+
        '<td><div class="constructionRowActions"><button data-stock-material="'+m.id+'" title="Nhập / Xuất" type="button">⇄</button><button data-view-material="'+m.id+'" title="Xem hồ sơ" type="button">⌕</button><button data-edit-material="'+m.id+'" title="Sửa" type="button">✎</button><button data-delete-material="'+m.id+'" class="danger" title="Xóa" type="button">⌫</button></div></td></tr>';
    }).join("");
  }else{
    $("#constructionStockHead").innerHTML='<tr><th>STT</th><th>Vật tư</th><th>Nhóm</th><th>Quy cách / Nhãn hiệu</th><th>ĐVT</th><th>Tồn đầu</th><th>Nhập</th><th>Xuất</th><th>Tồn cuối</th><th>Vị trí lưu</th><th>Thao tác</th></tr>';
    $("#constructionStockBody").innerHTML=list.map((m,i)=>{
      const mm=constructionSnapshot(m,year).months[month-1],low=constructionNum(m.min_qty)>0&&mm.stock<=constructionNum(m.min_qty);
      return '<tr class="'+(low?"constructionLowRow":"")+'" data-material-row="'+m.id+'">'+
        '<td class="sttCell">'+(i+1)+'</td>'+
        '<td class="constructionNameCell"><button class="constructionNameLink" data-view-material="'+m.id+'" type="button"><b>'+esc(m.name)+'</b><small>'+esc(m.supplier||"")+'</small></button></td>'+
        '<td><span class="constructionCategoryPill">'+esc(m.category||"Khác")+'</span></td>'+
        '<td class="constructionSpec">'+esc([m.specification,m.brand].filter(Boolean).join(" · ")||"—")+'</td>'+
        '<td>'+esc(m.unit||"—")+'</td><td><b>'+constructionFmt(mm.begin)+'</b></td><td class="inText">'+constructionFmt(mm.inQty)+'</td><td class="outText">'+constructionFmt(mm.outQty)+'</td>'+
        '<td><b class="constructionStockFinal '+(low?"low":"")+'">'+constructionFmt(mm.stock)+'</b></td><td>'+esc(m.storage_location||"—")+'</td>'+
        '<td><div class="constructionRowActions"><button data-stock-material="'+m.id+'" title="Nhập / Xuất" type="button">⇄</button><button data-view-material="'+m.id+'" title="Xem hồ sơ" type="button">⌕</button><button data-edit-material="'+m.id+'" title="Sửa" type="button">✎</button><button data-delete-material="'+m.id+'" class="danger" title="Xóa" type="button">⌫</button></div></td></tr>';
    }).join("");
  }
  $("#constructionEmpty").classList.toggle("hide",list.length>0);

  $("#constructionStockBody").querySelectorAll("[data-stock-material]").forEach(b=>b.onclick=()=>openConstructionStockTxnModal(b.dataset.stockMaterial));
  $("#constructionStockBody").querySelectorAll("[data-view-material]").forEach(b=>b.onclick=()=>openConstructionDetail(b.dataset.viewMaterial));
  $("#constructionStockBody").querySelectorAll("[data-edit-material]").forEach(b=>b.onclick=()=>editConstructionMaterial(b.dataset.editMaterial));
  $("#constructionStockBody").querySelectorAll("[data-delete-material]").forEach(b=>b.onclick=()=>deleteConstructionMaterial(b.dataset.deleteMaterial));

  const byId=Object.fromEntries(constructionMaterials.map(m=>[m.id,m]));
  let tx=constructionTransactions.filter(x=>String(x.tx_date||"").startsWith(String(year)));
  if(!annual){
    const prefix=year+"-"+String(month).padStart(2,"0");
    tx=tx.filter(x=>String(x.tx_date||"").startsWith(prefix));
  }
  tx=tx.slice().sort((a,b)=>String(b.tx_date||"").localeCompare(String(a.tx_date||""))||String(b.created_at||"").localeCompare(String(a.created_at||""))).slice(0,80);
  $("#constructionTxnTitle").textContent=annual?"Nhập / xuất trong năm "+year:"Nhập / xuất tháng "+String(month).padStart(2,"0")+" / "+year;
  $("#constructionTxnBody").innerHTML=tx.map(x=>{
    const party=x.tx_type==="in"?(x.supplier||"—"):(x.contractor||"—");
    return '<tr><td>'+fmt(x.tx_date)+'</td><td><b>'+esc(byId[x.material_id]?.name||"Vật tư đã xóa")+'</b></td><td><span class="constructionTxType '+x.tx_type+'">'+(x.tx_type==="in"?"Nhập":"Xuất")+'</span></td><td><b>'+constructionFmt(x.qty)+'</b></td><td>'+constructionMoney(x.unit_price)+' đ</td><td>'+esc(x.performer||"—")+'</td><td>'+esc(party)+'</td><td>'+esc(x.note||"—")+'</td><td><button class="constructionDeleteTx" data-delete-tx="'+x.id+'" type="button">×</button></td></tr>';
  }).join("");
  $("#constructionTxnBody").querySelectorAll("[data-delete-tx]").forEach(b=>b.onclick=()=>deleteConstructionStockTxn(b.dataset.deleteTx));
  $("#constructionTxnEmpty").classList.toggle("hide",tx.length>0);

  const sel=$("#constructionStockMaterial"),old=sel.value;
  sel.innerHTML='<option value="">— Chọn vật tư —</option>'+constructionMaterials.map(m=>'<option value="'+m.id+'">'+esc(m.name)+' · tồn '+constructionFmt(constructionSnapshot(m,year).current)+' '+esc(m.unit||"")+'</option>').join("");
  if(constructionMaterials.some(m=>m.id===old))sel.value=old;
}
window.openConstructionDetail=id=>{
  if(!constructionMaterials.some(x=>String(x.id)===String(id)))return;
  selectedConstructionMaterialId=String(id);
  $("#constructionMaterialPage").classList.add("contractorDetailMode");
  $("#constructionOverview").classList.add("hide");
  $("#constructionDetail").classList.remove("hide");
  renderConstructionDetail();
  window.scrollTo({top:0,behavior:"smooth"});
};
function closeConstructionDetail(){
  selectedConstructionMaterialId="";
  $("#constructionMaterialPage").classList.remove("contractorDetailMode");
  $("#constructionDetail").classList.add("hide");
  $("#constructionOverview").classList.remove("hide");
  renderConstructionMaterials();
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderConstructionDetail(){
  const m=constructionMaterials.find(x=>String(x.id)===String(selectedConstructionMaterialId));
  if(!m){closeConstructionDetail();return}
  $("#constructionDetailCategory").textContent=(m.category||"Vật tư thi công").toUpperCase();
  $("#constructionDetailName").textContent=m.name;
  $("#constructionDetailNote").textContent=m.note||"Hồ sơ vật tư thi công của dự án "+(currentBuilding?.name||"");
  const badge=$("#constructionDetailStatus");
  badge.textContent=m.status;badge.className="contractorStatusBadge "+constructionStatusClass(m.status);
  $("#constructionDetailSpec").textContent=m.specification||"—";
  $("#constructionDetailBrand").textContent=m.brand||"—";
  $("#constructionDetailUnit").textContent=m.unit||"—";
  renderConstructionLogs();
}
function renderConstructionLogs(){
  const search=($("#constructionLogSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
  const status=$("#constructionLogStatusFilter")?.value||"";
  const all=constructionLogsFor(selectedConstructionMaterialId);
  const list=all.filter(x=>(!status||x.status===status)&&(!search||[x.work_content,x.location,x.contractor,x.performer,x.note,x.status].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(search))));
  $("#constructionLogCount").textContent="("+all.length+")";
  const m=constructionMaterials.find(x=>String(x.id)===String(selectedConstructionMaterialId));
  $("#constructionLogList").innerHTML=list.map((x,i)=>{
    return '<article class="contractorJobCard constructionLogCard">'+
      '<div class="contractorJobRail"><span>'+(i+1)+'</span></div>'+
      '<div class="contractorJobMain">'+
        '<div class="contractorJobTop"><div><small>NGÀY THỰC HIỆN</small><b>'+fmt(x.work_date)+'</b></div><div><small>SỐ LƯỢNG</small><b>'+Number(x.quantity||0).toLocaleString("vi-VN",{maximumFractionDigits:2})+' '+esc(m?.unit||"")+'</b></div><span class="contractorJobStatus '+constructionLogStatusClass(x.status)+'">'+esc(x.status)+'</span></div>'+
        '<div class="contractorJobContent"><span>HẠNG MỤC / NỘI DUNG THI CÔNG</span><p>'+esc(x.work_content||"—")+'</p></div>'+
        '<div class="contractorJobDiagnosis"><div><span>VỊ TRÍ THI CÔNG</span><p>'+esc(x.location||"Chưa ghi nhận")+'</p></div><div><span>NHÀ THẦU / NGƯỜI THỰC HIỆN</span><p>'+esc([x.contractor,x.performer].filter(Boolean).join(" · ")||"Chưa ghi nhận")+'</p></div></div>'+
        (x.note?'<div class="contractorJobNote"><span>GHI CHÚ</span><p>'+esc(x.note)+'</p></div>':'')+
        '<div class="contractorJobActions"><button type="button" data-edit-construction-log="'+x.id+'">✎ Sửa</button><button class="danger" type="button" data-delete-construction-log="'+x.id+'">Xóa</button></div>'+
      '</div></article>';
  }).join("");
  $("#constructionLogList").querySelectorAll("[data-edit-construction-log]").forEach(b=>b.onclick=()=>editConstructionLog(b.dataset.editConstructionLog));
  $("#constructionLogList").querySelectorAll("[data-delete-construction-log]").forEach(b=>b.onclick=()=>deleteConstructionLog(b.dataset.deleteConstructionLog));
  $("#constructionLogEmpty").classList.toggle("hide",list.length>0);
}
function resetConstructionMaterialForm(){
  $("#constructionMaterialId").value="";
  $("#constructionMaterialName").value="";
  $("#constructionMaterialCategory").value="Điện";
  $("#constructionMaterialBrand").value="";
  $("#constructionMaterialSpec").value="";
  $("#constructionMaterialUnit").value="Cái";
  $("#constructionMaterialSupplier").value="";
  $("#constructionMaterialStorage").value="";
  $("#constructionMaterialOpeningQty").value="0";
  $("#constructionMaterialMinQty").value="0";
  $("#constructionMaterialUnitPrice").value="0";
  $("#constructionMaterialStatus").value="Đang sử dụng";
  $("#constructionMaterialNote").value="";
  $("#constructionMaterialModalTitle").textContent="Thêm vật tư thi công";
}
function openConstructionMaterialModal(){
  resetConstructionMaterialForm();
  $("#constructionMaterialModal").classList.remove("hide");
  setTimeout(()=>$("#constructionMaterialName").focus(),50);
}
window.editConstructionMaterial=id=>{
  const m=constructionMaterials.find(x=>String(x.id)===String(id));if(!m)return;
  $("#constructionMaterialId").value=m.id;
  $("#constructionMaterialName").value=m.name;
  $("#constructionMaterialCategory").value=m.category||"Khác";
  $("#constructionMaterialBrand").value=m.brand||"";
  $("#constructionMaterialSpec").value=m.specification||"";
  $("#constructionMaterialUnit").value=m.unit||"Cái";
  $("#constructionMaterialSupplier").value=m.supplier||"";
  $("#constructionMaterialStorage").value=m.storage_location||"";
  $("#constructionMaterialOpeningQty").value=constructionNum(m.opening_qty);
  $("#constructionMaterialMinQty").value=constructionNum(m.min_qty);
  $("#constructionMaterialUnitPrice").value=constructionNum(m.unit_price);
  $("#constructionMaterialStatus").value=m.status||"Đang sử dụng";
  $("#constructionMaterialNote").value=m.note||"";
  $("#constructionMaterialModalTitle").textContent="Chỉnh sửa vật tư thi công";
  $("#constructionMaterialModal").classList.remove("hide");
};
window.deleteConstructionMaterial=async id=>{
  if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
  const m=constructionMaterials.find(x=>String(x.id)===String(id));
  if(!m||!confirm("Xóa vật tư “"+m.name+"” và toàn bộ lịch sử sử dụng?"))return;
  try{
    await sbFetch("/rest/v1/construction_materials?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});
    selectedConstructionMaterialId="";
    await loadConstructionMaterialData(currentBuilding.id,true);
    closeConstructionDetail();
    toast("Đã xóa vật tư thi công");
  }catch(e){toast(e.message)}
};
window.openConstructionStockTxnModal=id=>{
  if(!constructionMaterials.length)return toast("Hãy thêm vật tư trước");
  constructionFillPeople();
  const year=constructionYearValue(),sel=$("#constructionStockMaterial");
  sel.innerHTML='<option value="">— Chọn vật tư —</option>'+constructionMaterials.map(m=>'<option value="'+m.id+'">'+esc(m.name)+' · tồn '+constructionFmt(constructionSnapshot(m,year).current)+' '+esc(m.unit||"")+'</option>').join("");
  $("#constructionStockTxnId").value="";
  $("#constructionStockType").value="in";
  $("#constructionStockDate").value=today();
  $("#constructionStockQty").value="";
  $("#constructionStockUnitPrice").value="0";
  $("#constructionStockPerformer").value="";
  $("#constructionStockSupplier").value="";
  $("#constructionStockContractor").value="";
  $("#constructionStockNote").value="";
  if(id){
    sel.value=id;
    const m=constructionMaterials.find(x=>String(x.id)===String(id));
    if(m){
      $("#constructionStockUnitPrice").value=constructionNum(m.unit_price);
      $("#constructionStockSupplier").value=m.supplier||"";
    }
  }
  $("#constructionStockTxnModal").classList.remove("hide");
};
window.deleteConstructionStockTxn=async id=>{
  if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
  if(!confirm("Xóa giao dịch nhập / xuất này?"))return;
  try{
    await sbFetch("/rest/v1/construction_material_transactions?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});
    await loadConstructionMaterialData(currentBuilding.id,true);
    toast("Đã xóa giao dịch");
  }catch(e){toast(e.message)}
};
function resetConstructionLogForm(materialId){
  const m=constructionMaterials.find(x=>String(x.id)===String(materialId));
  $("#constructionLogId").value="";
  $("#constructionLogMaterialId").value=materialId;
  $("#constructionLogDate").value=today();
  $("#constructionLogQty").value="";
  $("#constructionLogStatus").value="Đang thi công";
  $("#constructionLogContent").value="";
  $("#constructionLogLocation").value="";
  $("#constructionLogContractor").value="";
  $("#constructionLogPerformer").value="";
  $("#constructionLogNote").value="";
  $("#constructionLogModalTitle").textContent="Thêm lần sử dụng";
  $("#constructionLogMaterialName").textContent=m?.name||"Vật tư thi công";
}
function openConstructionLogModal(){
  if(!selectedConstructionMaterialId)return;
  resetConstructionLogForm(selectedConstructionMaterialId);
  $("#constructionLogModal").classList.remove("hide");
  setTimeout(()=>$("#constructionLogContent").focus(),50);
}
window.editConstructionLog=id=>{
  const x=constructionLogs.find(r=>String(r.id)===String(id));if(!x)return;
  const m=constructionMaterials.find(v=>String(v.id)===String(x.material_id));
  $("#constructionLogId").value=x.id;
  $("#constructionLogMaterialId").value=x.material_id;
  $("#constructionLogDate").value=x.work_date;
  $("#constructionLogQty").value=x.quantity;
  $("#constructionLogStatus").value=x.status;
  $("#constructionLogContent").value=x.work_content||"";
  $("#constructionLogLocation").value=x.location||"";
  $("#constructionLogContractor").value=x.contractor||"";
  $("#constructionLogPerformer").value=x.performer||"";
  $("#constructionLogNote").value=x.note||"";
  $("#constructionLogModalTitle").textContent="Chỉnh sửa lần sử dụng";
  $("#constructionLogMaterialName").textContent=m?.name||"Vật tư thi công";
  $("#constructionLogModal").classList.remove("hide");
};
window.deleteConstructionLog=async id=>{
  if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
  if(!confirm("Xóa lần sử dụng vật tư này?"))return;
  try{
    await sbFetch("/rest/v1/construction_material_logs?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});
    await loadConstructionMaterialData(currentBuilding.id,true);
    toast("Đã xóa lịch sử sử dụng");
  }catch(e){toast(e.message)}
};

function constructionReportCss(landscape=false){
  return typeof inventoryPdfCss==="function"?inventoryPdfCss(landscape):'@page{size:A4 '+(landscape?"landscape":"portrait")+';margin:10mm}body{font-family:Arial,sans-serif;font-size:9px;color:#243746}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd7de;padding:5px}th{background:#edf4f7}.head{display:flex;justify-content:space-between}.title{text-align:center;margin:12px 0}.summary{display:flex;gap:8px}.summary div{flex:1;border:1px solid #d6e0e5;padding:7px}';
}
function constructionPrintWindow(html){
  const w=open("","_blank");if(!w){toast("Trình duyệt đang chặn cửa sổ PDF");return}
  w.document.write(html);w.document.close();
}
function constructionDirectoryReportHtml(){
  const rows=constructionMaterials.map((m,i)=>{
    const logs=constructionLogsFor(m.id),last=constructionLastLog(m.id);
    return '<tr><td>'+(i+1)+'</td><td><b>'+esc(m.name)+'</b></td><td>'+esc(m.specification||"—")+'</td><td>'+esc(m.brand||"—")+'</td><td>'+esc(m.unit||"—")+'</td><td>'+esc(m.category||"Khác")+'</td><td>'+logs.length+'</td><td>'+(last?.work_date?fmt(last.work_date):"—")+'</td><td>'+esc(m.status)+'</td></tr>';
  }).join("");
  return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Vật tư thi công</title><style>'+constructionReportCss(true)+'</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>DANH MỤC VẬT TƯ THI CÔNG</h1><p>Danh mục và lịch sử sử dụng vật tư</p></div><table><thead><tr><th>STT</th><th>Vật tư</th><th>Quy cách</th><th>Nhãn hiệu</th><th>ĐVT</th><th>Nhóm</th><th>Lượt sử dụng</th><th>Gần nhất</th><th>Trạng thái</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · Vật tư thi công · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>';
}
function constructionDetailReportHtml(){
  const m=constructionMaterials.find(x=>String(x.id)===String(selectedConstructionMaterialId));if(!m)return "";
  const logs=constructionLogsFor(m.id).sort((a,b)=>String(b.work_date||"").localeCompare(String(a.work_date||"")));
  const rows=logs.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+fmt(x.work_date)+'</td><td>'+Number(x.quantity||0).toLocaleString("vi-VN",{maximumFractionDigits:2})+' '+esc(m.unit||"")+'</td><td><b>'+esc(x.work_content||"—")+'</b></td><td>'+esc(x.location||"—")+'</td><td>'+esc(x.contractor||"—")+'</td><td>'+esc(x.performer||"—")+'</td><td>'+esc(x.status)+'</td></tr>').join("");
  return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Hồ sơ '+esc(m.name)+'</title><style>'+constructionReportCss(true)+'</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>HỒ SƠ VẬT TƯ THI CÔNG: '+esc(m.name)+'</h1><p>'+esc(m.category||"Khác")+' · '+esc(m.status)+'</p></div><div class="summary"><div><span>Quy cách</span><b>'+esc(m.specification||"—")+'</b></div><div><span>Nhãn hiệu</span><b>'+esc(m.brand||"—")+'</b></div><div><span>Đơn vị tính</span><b>'+esc(m.unit||"—")+'</b></div><div><span>Lượt sử dụng</span><b>'+logs.length+'</b></div></div><table><thead><tr><th>STT</th><th>Ngày</th><th>Số lượng</th><th>Hạng mục thi công</th><th>Vị trí</th><th>Nhà thầu</th><th>Người thực hiện</th><th>Tình trạng</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · Hồ sơ vật tư thi công · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),650)<\/script></body></html>';
}
function constructionDownloadWorkbook(detail=false){
  if(typeof XLSX==="undefined")return toast("Chưa tải được thư viện Excel");
  const wb=XLSX.utils.book_new();
  if(detail){
    const m=constructionMaterials.find(x=>String(x.id)===String(selectedConstructionMaterialId));if(!m)return;
    const data=[["HỒ SƠ VẬT TƯ THI CÔNG"],["Dự án",currentBuilding.name],["Vật tư",m.name],["Nhóm",m.category],["Quy cách",m.specification],["Nhãn hiệu",m.brand],["Đơn vị",m.unit],[],["STT","Ngày","Số lượng","Hạng mục / nội dung","Vị trí","Nhà thầu","Người thực hiện","Tình trạng","Ghi chú"]];
    constructionLogsFor(m.id).forEach((x,i)=>data.push([i+1,x.work_date,Number(x.quantity||0),x.work_content,x.location,x.contractor,x.performer,x.status,x.note]));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data),"Vật tư");
    XLSX.writeFile(wb,"ESTA - "+m.name+".xlsx");
  }else{
    const data=[["STT","Tên vật tư","Quy cách","Nhãn hiệu","ĐVT","Nhóm","Nhà cung cấp","Trạng thái","Lượt sử dụng","Gần nhất"]];
    constructionMaterials.forEach((m,i)=>{const last=constructionLastLog(m.id);data.push([i+1,m.name,m.specification,m.brand,m.unit,m.category,m.supplier,m.status,constructionLogsFor(m.id).length,last?.work_date||""])});
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data),"Vật tư thi công");
    XLSX.writeFile(wb,"ESTA - Danh mục vật tư thi công.xlsx");
  }
}

// Events
$("#constructionSearch").oninput=renderConstructionMaterials;
$("#constructionCategorySelect").onchange=renderConstructionMaterials;
$("#constructionYear").onchange=renderConstructionMaterials;
document.querySelectorAll("[data-construction-month]").forEach(b=>b.onclick=()=>{
  constructionActiveMonth=b.dataset.constructionMonth==="all"?"all":Number(b.dataset.constructionMonth);
  renderConstructionMaterials();
});
$("#constructionLogSearch").oninput=renderConstructionLogs;
$("#constructionLogStatusFilter").onchange=renderConstructionLogs;
document.querySelectorAll("[data-construction-category]").forEach(b=>b.onclick=()=>{
  constructionCategoryFilter=b.dataset.constructionCategory||"";
  document.querySelectorAll("[data-construction-category]").forEach(x=>x.classList.toggle("active",x===b));
  renderConstructionMaterials();
});
$("#addConstructionMaterialBtn").onclick=openConstructionMaterialModal;
$("#constructionStockMoveBtn").onclick=()=>openConstructionStockTxnModal();
$("#constructionBackBtn").onclick=closeConstructionDetail;
$("#constructionDetailCloseBtn").onclick=closeConstructionDetail;
$("#editConstructionMaterialBtn").onclick=()=>{if(selectedConstructionMaterialId)editConstructionMaterial(selectedConstructionMaterialId)};
$("#addConstructionLogBtn").onclick=openConstructionLogModal;
$("#closeConstructionMaterialModal").onclick=$("#cancelConstructionMaterialModal").onclick=()=>$("#constructionMaterialModal").classList.add("hide");
$("#closeConstructionLogModal").onclick=$("#cancelConstructionLogModal").onclick=()=>$("#constructionLogModal").classList.add("hide");
$("#closeConstructionStockTxnModal").onclick=$("#cancelConstructionStockTxnModal").onclick=()=>$("#constructionStockTxnModal").classList.add("hide");
$("#constructionMaterialModal").onclick=e=>{if(e.target===$("#constructionMaterialModal"))$("#constructionMaterialModal").classList.add("hide")};
$("#constructionLogModal").onclick=e=>{if(e.target===$("#constructionLogModal"))$("#constructionLogModal").classList.add("hide")};
$("#constructionStockTxnModal").onclick=e=>{if(e.target===$("#constructionStockTxnModal"))$("#constructionStockTxnModal").classList.add("hide")};

$("#constructionMaterialForm").onsubmit=async e=>{
  e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
  const id=$("#constructionMaterialId").value;
  const body={
    building_id:currentBuilding.id,
    name:$("#constructionMaterialName").value.trim(),
    category:$("#constructionMaterialCategory").value,
    brand:$("#constructionMaterialBrand").value.trim(),
    specification:$("#constructionMaterialSpec").value.trim(),
    unit:$("#constructionMaterialUnit").value.trim()||"Cái",
    supplier:$("#constructionMaterialSupplier").value.trim(),
    storage_location:$("#constructionMaterialStorage").value.trim(),
    opening_qty:Math.max(0,constructionNum($("#constructionMaterialOpeningQty").value)),
    min_qty:Math.max(0,constructionNum($("#constructionMaterialMinQty").value)),
    unit_price:Math.max(0,constructionNum($("#constructionMaterialUnitPrice").value)),
    status:$("#constructionMaterialStatus").value,
    note:$("#constructionMaterialNote").value.trim(),
    updated_at:new Date().toISOString()
  };
  try{
    if(id)await sbFetch("/rest/v1/construction_materials?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
    else await sbFetch("/rest/v1/construction_materials",{method:"POST",token:centralSession.access_token,body});
    $("#constructionMaterialModal").classList.add("hide");
    await loadConstructionMaterialData(currentBuilding.id,true);
    toast(id?"Đã cập nhật vật tư":"Đã thêm vật tư thi công");
  }catch(err){toast(err.status===409?"Vật tư cùng tên và quy cách đã có":err.message)}
};
$("#constructionStockTxnForm").onsubmit=async e=>{
  e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
  const materialId=$("#constructionStockMaterial").value,qty=constructionNum($("#constructionStockQty").value),type=$("#constructionStockType").value,date=$("#constructionStockDate").value;
  if(!materialId||qty<=0||!date)return toast("Vui lòng chọn vật tư, ngày và số lượng");
  const material=constructionMaterials.find(x=>String(x.id)===String(materialId));
  if(type==="out"&&material&&qty>constructionSnapshot(material,new Date().getFullYear()).current)return toast("Số lượng xuất vượt quá tồn kho hiện tại");
  const body={
    building_id:currentBuilding.id,
    material_id:materialId,
    tx_date:date,
    tx_type:type,
    qty,
    unit_price:Math.max(0,constructionNum($("#constructionStockUnitPrice").value)),
    performer:$("#constructionStockPerformer").value,
    supplier:$("#constructionStockSupplier").value.trim(),
    contractor:$("#constructionStockContractor").value.trim(),
    note:$("#constructionStockNote").value.trim()
  };
  try{
    await sbFetch("/rest/v1/construction_material_transactions",{method:"POST",token:centralSession.access_token,body});
    $("#constructionStockTxnModal").classList.add("hide");
    await loadConstructionMaterialData(currentBuilding.id,true);
    toast(type==="in"?"Đã nhập vật tư thi công":"Đã xuất vật tư thi công");
  }catch(err){toast(err.message)}
};

$("#constructionLogForm").onsubmit=async e=>{
  e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
  const id=$("#constructionLogId").value;
  const body={
    building_id:currentBuilding.id,
    material_id:$("#constructionLogMaterialId").value,
    work_date:$("#constructionLogDate").value,
    quantity:Number($("#constructionLogQty").value||0),
    work_content:$("#constructionLogContent").value.trim(),
    location:$("#constructionLogLocation").value.trim(),
    contractor:$("#constructionLogContractor").value.trim(),
    performer:$("#constructionLogPerformer").value.trim(),
    status:$("#constructionLogStatus").value,
    note:$("#constructionLogNote").value.trim(),
    updated_at:new Date().toISOString()
  };
  try{
    if(id)await sbFetch("/rest/v1/construction_material_logs?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
    else await sbFetch("/rest/v1/construction_material_logs",{method:"POST",token:centralSession.access_token,body});
    $("#constructionLogModal").classList.add("hide");
    await loadConstructionMaterialData(currentBuilding.id,true);
    renderConstructionDetail();
    toast(id?"Đã cập nhật lịch sử sử dụng":"Đã thêm lần sử dụng vật tư");
  }catch(err){toast(err.message)}
};
$("#constructionExportPdf").onclick=()=>{if(!constructionMaterials.length)return toast("Chưa có vật tư để xuất PDF");constructionPrintWindow(constructionDirectoryReportHtml())};
$("#constructionDetailPdf").onclick=()=>{if(!selectedConstructionMaterialId)return;constructionPrintWindow(constructionDetailReportHtml())};
$("#constructionExportExcel").onclick=()=>{if(!constructionMaterials.length)return toast("Chưa có vật tư để xuất Excel");constructionDownloadWorkbook(false)};
$("#constructionDetailExcel").onclick=()=>constructionDownloadWorkbook(true);
