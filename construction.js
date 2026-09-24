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
  const search=($("#constructionSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
  const list=constructionMaterials.filter(m=>{
    return (!constructionCategoryFilter||m.category===constructionCategoryFilter)&&
      (!search||[m.name,m.brand,m.specification,m.unit,m.supplier,m.category,m.note].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(search)));
  });
  const year=String(new Date().getFullYear());
  $("#constructionMaterialCount").textContent=constructionMaterials.length;
  $("#constructionYearLogCount").textContent=constructionLogs.filter(x=>String(x.work_date||"").startsWith(year)).length;
  $("#constructionOpenLogCount").textContent=constructionLogs.filter(x=>x.status!=="Hoàn thành").length;
  $("#constructionDoneLogCount").textContent=constructionLogs.filter(x=>x.status==="Hoàn thành").length;
  $("#constructionResultCount").textContent="("+list.length+")";

  $("#constructionGrid").innerHTML=list.map(m=>{
    const logs=constructionLogsFor(m.id),last=constructionLastLog(m.id);
    const spec=[m.specification,m.brand].filter(Boolean).join(" · ")||"Chưa ghi quy cách";
    return '<article class="contractorRowCard constructionRowCard" tabindex="0" role="button" data-open-construction="'+m.id+'">'+
      '<div class="contractorRowIdentity">'+
        '<span class="contractorLetter contractorLetter-'+constructionCategoryClass(m.category)+'">'+esc(constructionInitial(m.name))+'</span>'+
        '<div><h3>'+esc(m.name)+'</h3><p>'+esc(m.note||"Vật tư thi công")+'</p></div>'+
      '</div>'+
      '<div class="contractorRowValue constructionSpecCell"><b>'+esc(spec)+'</b></div>'+
      '<div class="contractorRowValue constructionUnitCell">'+esc(m.unit||"—")+'</div>'+
      '<div class="contractorRowValue"><span class="contractorFieldPill '+constructionCategoryClass(m.category)+'">'+esc(m.category||"Khác")+'</span></div>'+
      '<div class="contractorRowCount"><span>'+logs.length+'</span></div>'+
      '<div class="contractorLatest"><b>'+(last?.work_date?fmt(last.work_date):"—")+'</b><span>'+esc(last?.work_content||"Chưa có lịch sử sử dụng")+'</span></div>'+
      '<div class="contractorRowActions">'+
        '<button type="button" title="Xem hồ sơ" data-view-construction="'+m.id+'"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></svg></button>'+
        '<button type="button" title="Sửa" data-edit-construction="'+m.id+'"><svg viewBox="0 0 24 24"><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM14.5 6l3.5 3.5"/></svg></button>'+
        '<button type="button" class="danger" title="Xóa" data-delete-construction="'+m.id+'"><svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M8 10v8M12 10v8M16 10v8M7 7l1 14h8l1-14"/></svg></button>'+
      '</div>'+
    '</article>';
  }).join("");

  $("#constructionGrid").querySelectorAll("[data-open-construction]").forEach(el=>{
    el.onclick=e=>{if(e.target.closest("button,a"))return;openConstructionDetail(el.dataset.openConstruction)};
    el.onkeydown=e=>{if((e.key==="Enter"||e.key===" ")&&!e.target.closest("button,a")){e.preventDefault();openConstructionDetail(el.dataset.openConstruction)}};
  });
  $("#constructionGrid").querySelectorAll("[data-view-construction]").forEach(b=>b.onclick=e=>{e.stopPropagation();openConstructionDetail(b.dataset.viewConstruction)});
  $("#constructionGrid").querySelectorAll("[data-edit-construction]").forEach(b=>b.onclick=e=>{e.stopPropagation();editConstructionMaterial(b.dataset.editConstruction)});
  $("#constructionGrid").querySelectorAll("[data-delete-construction]").forEach(b=>b.onclick=e=>{e.stopPropagation();deleteConstructionMaterial(b.dataset.deleteConstruction)});
  $("#constructionEmpty").classList.toggle("hide",list.length>0);
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
$("#constructionLogSearch").oninput=renderConstructionLogs;
$("#constructionLogStatusFilter").onchange=renderConstructionLogs;
document.querySelectorAll("[data-construction-category]").forEach(b=>b.onclick=()=>{
  constructionCategoryFilter=b.dataset.constructionCategory||"";
  document.querySelectorAll("[data-construction-category]").forEach(x=>x.classList.toggle("active",x===b));
  renderConstructionMaterials();
});
$("#addConstructionMaterialBtn").onclick=openConstructionMaterialModal;
$("#constructionBackBtn").onclick=closeConstructionDetail;
$("#constructionDetailCloseBtn").onclick=closeConstructionDetail;
$("#editConstructionMaterialBtn").onclick=()=>{if(selectedConstructionMaterialId)editConstructionMaterial(selectedConstructionMaterialId)};
$("#addConstructionLogBtn").onclick=openConstructionLogModal;
$("#closeConstructionMaterialModal").onclick=$("#cancelConstructionMaterialModal").onclick=()=>$("#constructionMaterialModal").classList.add("hide");
$("#closeConstructionLogModal").onclick=$("#cancelConstructionLogModal").onclick=()=>$("#constructionLogModal").classList.add("hide");
$("#constructionMaterialModal").onclick=e=>{if(e.target===$("#constructionMaterialModal"))$("#constructionMaterialModal").classList.add("hide")};
$("#constructionLogModal").onclick=e=>{if(e.target===$("#constructionLogModal"))$("#constructionLogModal").classList.add("hide")};

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
