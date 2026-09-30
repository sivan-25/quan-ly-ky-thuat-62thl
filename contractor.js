/* ESTA Contractor Module */
let contractors=[],contractorJobs=[],contractorLoadedBuilding="",selectedContractorId="",contractorSpecialtyFilter="";

function contractorStatusClass(status=""){
  return status==="Đang hợp tác"?"active":status==="Tạm ngưng"?"paused":"inactive";
}
function contractorJobStatusClass(status=""){
  return status==="Hoàn thành"?"done":status==="Đang thực hiện"?"doing":status==="Chờ xử lý"?"waiting":"paused";
}
function contractorStoredJobsFor(id){
  return contractorJobs.filter(x=>String(x.contractor_id)===String(id));
}
function contractorLinkedTaskJobs(id){
  let tasks=[];
  try{tasks=typeof load==="function"?load():[]}catch(e){tasks=[]}
  if(!Array.isArray(tasks))tasks=[];
  const stored=contractorStoredJobsFor(id);
  return tasks
    .filter(t=>String(t?.contractorId||t?.contractor_id||"")===String(id))
    .filter(t=>!stored.some(j=>{
      const note=String(j?.note||"");
      return String(j?.source_task_id||"")===String(t.id)||
        note.includes("Tạo tự động từ công việc "+String(t.id))||
        note.includes("Liên kết công việc "+String(t.id));
    }))
    .map(t=>{
      const completed=t.s==="Đã hoàn thành"?(String(t.completedAt||"").slice(0,10)||t.d||null):null;
      return {
        id:"task:"+t.id,
        contractor_id:id,
        work_date:t.d||today(),
        completed_date:completed,
        work_content:t.c||"Công việc liên kết",
        cause:t.cause||(t.incidentCode?("Liên kết sự cố "+t.incidentCode):""),
        solution:t.result||"",
        status:t.s||"Đang thực hiện",
        note:t.n||"",
        images:Array.isArray(t.imgs)?t.imgs.filter(Boolean):[],
        source_task_id:String(t.id),
        _source:"task"
      };
    });
}
function contractorJobsFor(id){
  return [...contractorStoredJobsFor(id),...contractorLinkedTaskJobs(id)]
    .sort((a,b)=>String(b.work_date||"").localeCompare(String(a.work_date||"")));
}
function contractorLastJob(id){
  return contractorJobsFor(id).slice().sort((a,b)=>String(b.work_date||"").localeCompare(String(a.work_date||"")))[0]||null;
}
function contractorPhoneHref(phone=""){
  const p=String(phone||"").replace(/[^\d+]/g,"");
  return p?"tel:"+p:"#";
}
function contractorInitial(name=""){
  return (String(name||"").trim().charAt(0)||"N").toLocaleUpperCase("vi-VN");
}
function contractorFieldLabel(value=""){
  const raw=String(value||"").trim();
  const s=raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLocaleLowerCase("vi-VN");
  if(/\b(hvac|dhkk)\b|dieu hoa/.test(s))return "ĐHKK";
  if(/\bpccc\b|chua chay|phong chay/.test(s))return "PCCC";
  if(/thang may|elevator/.test(s))return "Thang máy";
  if(/cap thoat nuoc|cap nuoc|thoat nuoc|plumbing/.test(s))return "Cấp thoát nước";
  if(/ve sinh|clean/.test(s))return "Vệ sinh";
  if(/dien|electrical/.test(s))return "Điện";
  return raw||"Khác";
}
function contractorFieldClass(value=""){
  const s=contractorFieldLabel(value);
  if(s==="PCCC")return "pccc";
  if(s==="Thang máy")return "elevator";
  if(s==="Điện")return "electric";
  if(s==="Cấp thoát nước")return "water";
  if(s==="Vệ sinh")return "clean";
  if(s==="ĐHKK")return "hvac";
  return "other";
}
async function loadContractorData(buildingId=currentBuilding?.id,force=false){
  if(!centralSession?.access_token||!buildingId)return;
  if(!force&&contractorLoadedBuilding===buildingId){
    renderContractors();
    if(selectedContractorId)renderContractorDetail();
    return;
  }
  try{
    const b=encodeURIComponent(buildingId),token=centralSession.access_token;
    const result=await Promise.all([
      sbFetch("/rest/v1/contractors?select=*&building_id=eq."+b+"&order=name.asc",{token}),
      sbFetch("/rest/v1/contractor_jobs?select=*&building_id=eq."+b+"&order=work_date.desc,created_at.desc",{token})
    ]);
    contractors=Array.isArray(result[0])?result[0]:[];
    contractorJobs=Array.isArray(result[1])?result[1]:[];
    contractorLoadedBuilding=buildingId;
    if(selectedContractorId&&!contractors.some(x=>String(x.id)===String(selectedContractorId)))selectedContractorId="";
    renderContractors();
    if(selectedContractorId)renderContractorDetail();
  }catch(e){
    console.warn("Load contractor data failed",e);
    contractors=[];contractorJobs=[];contractorLoadedBuilding="";
    if($("#contractorGrid"))$("#contractorGrid").innerHTML="";
    if($("#contractorEmpty")){
      $("#contractorEmpty").classList.remove("hide");
      $("#contractorEmpty").innerHTML='<b>Không tải được dữ liệu nhà thầu</b><span>Vui lòng thử mở lại mục Nhà thầu.</span>';
    }
    toast("Không tải được dữ liệu nhà thầu");
  }
}
function renderContractors(){
  const search=($("#contractorSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
  const status=$("#contractorStatusFilter")?.value||"";
  const specialty=contractorSpecialtyFilter;
  const list=contractors.filter(c=>{
    const field=contractorFieldLabel(c.specialty);
    return (!status||c.status===status)&&(!specialty||field===specialty)&&(!search||[c.name,c.phone,c.contact_name,c.specialty,c.note].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(search)));
  });
  const year=String(new Date().getFullYear());
  const allJobs=contractors.flatMap(c=>contractorJobsFor(c.id));
  $("#contractorCount").textContent=contractors.length;
  $("#contractorYearJobCount").textContent=allJobs.filter(x=>String(x.work_date||"").startsWith(year)).length;
  $("#contractorOpenJobCount").textContent=allJobs.filter(x=>!["Hoàn thành","Đã hoàn thành"].includes(String(x.status||""))).length;
  $("#contractorDoneJobCount").textContent=allJobs.filter(x=>["Hoàn thành","Đã hoàn thành"].includes(String(x.status||""))).length;
  $("#contractorResultCount").textContent="("+list.length+")";

  $("#contractorGrid").innerHTML=list.map(c=>{
    const jobs=contractorJobsFor(c.id),last=contractorLastJob(c.id),field=contractorFieldLabel(c.specialty);
    const note=c.note||((field&&field!=="Khác")?"Nhà thầu "+field:"Nhà thầu kỹ thuật");
    return '<article class="contractorRowCard" tabindex="0" role="button" data-open-contractor="'+c.id+'">'+
      '<div class="contractorRowIdentity">'+
        '<span class="contractorLetter contractorLetter-'+contractorFieldClass(c.specialty)+'">'+esc(contractorInitial(c.name))+'</span>'+
        '<div><h3>'+esc(c.name)+'</h3><p>'+esc(note)+'</p></div>'+
      '</div>'+
      '<div class="contractorRowValue contractorContactCell">'+esc(c.contact_name||"—")+'</div>'+
      '<div class="contractorRowValue contractorRowPhone"><a href="'+esc(contractorPhoneHref(c.phone))+'" data-stop-contractor>'+esc(c.phone||"—")+'</a></div>'+
      '<div class="contractorRowValue"><span class="contractorFieldPill '+contractorFieldClass(c.specialty)+'">'+esc(field)+'</span></div>'+
      '<div class="contractorRowCount"><span>'+jobs.length+'</span></div>'+
      '<div class="contractorLatest"><b>'+(last?.work_date?fmt(last.work_date):"—")+'</b><span>'+esc(last?.work_content||"Chưa có công việc")+'</span></div>'+
      '<div class="contractorRowActions">'+
        '<button type="button" title="Xem hồ sơ" data-view-contractor="'+c.id+'"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></svg></button>'+
        '<button type="button" title="Sửa" data-edit-contractor="'+c.id+'"><svg viewBox="0 0 24 24"><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM14.5 6l3.5 3.5"/></svg></button>'+
        '<button type="button" class="danger" title="Xóa" data-delete-contractor="'+c.id+'"><svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M8 10v8M12 10v8M16 10v8M7 7l1 14h8l1-14"/></svg></button>'+
      '</div>'+
    '</article>';
  }).join("");

  $("#contractorGrid").querySelectorAll("[data-open-contractor]").forEach(el=>{
    el.onclick=e=>{if(e.target.closest("button,a"))return;openContractorDetail(el.dataset.openContractor)};
    el.onkeydown=e=>{if((e.key==="Enter"||e.key===" ")&&!e.target.closest("button,a")){e.preventDefault();openContractorDetail(el.dataset.openContractor)}};
  });
  $("#contractorGrid").querySelectorAll("[data-view-contractor]").forEach(b=>b.onclick=e=>{e.stopPropagation();openContractorDetail(b.dataset.viewContractor)});
  $("#contractorGrid").querySelectorAll("[data-edit-contractor]").forEach(b=>b.onclick=e=>{e.stopPropagation();editContractor(b.dataset.editContractor)});
  $("#contractorGrid").querySelectorAll("[data-delete-contractor]").forEach(b=>b.onclick=e=>{e.stopPropagation();deleteContractor(b.dataset.deleteContractor)});
  $("#contractorGrid").querySelectorAll("[data-stop-contractor]").forEach(a=>a.onclick=e=>e.stopPropagation());

  $("#contractorEmpty").classList.toggle("hide",list.length>0);
}
window.openContractorDetail=id=>{
  if(!contractors.some(x=>String(x.id)===String(id)))return;
  selectedContractorId=String(id);
  $("#contractorPage").classList.add("contractorDetailMode");
  $("#contractorOverview").classList.add("hide");
  $("#contractorDetail").classList.remove("hide");
  renderContractorDetail();
  window.scrollTo({top:0,behavior:"smooth"});
};
function closeContractorDetail(){
  selectedContractorId="";
  $("#contractorPage").classList.remove("contractorDetailMode");
  $("#contractorDetail").classList.add("hide");
  $("#contractorOverview").classList.remove("hide");
  renderContractors();
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderContractorDetail(){
  const c=contractors.find(x=>String(x.id)===String(selectedContractorId));
  if(!c){closeContractorDetail();return}
  $("#contractorDetailSpecialty").textContent=(c.specialty||"nhà thầu").toUpperCase();
  $("#contractorDetailName").textContent=c.name;
  $("#contractorDetailNote").textContent=c.note||"Thông tin liên hệ và lịch sử công việc tại "+(currentBuilding?.name||"dự án");
  const badge=$("#contractorDetailStatus");
  badge.textContent=c.status;badge.className="contractorStatusBadge "+contractorStatusClass(c.status);
  const phone=$("#contractorDetailPhone");phone.textContent=c.phone||"—";phone.href=contractorPhoneHref(c.phone);
  $("#contractorDetailContact").textContent=c.contact_name||"—";
  const term=$("#contractorDetailContractTerm");
  const start=c.contract_start_date?fmt(c.contract_start_date):"Chưa ghi";
  const end=c.contract_end_date?fmt(c.contract_end_date):"Chưa ghi";
  term.textContent=(c.contract_start_date||c.contract_end_date)?start+" → "+end:"—";
  renderContractorJobs();
}
function renderContractorJobs(){
  const search=($("#contractorJobSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
  const status=$("#contractorJobStatusFilter")?.value||"";
  const all=contractorJobsFor(selectedContractorId);
  const list=all.filter(x=>(!status||x.status===status)&&(!search||[x.work_content,x.cause,x.solution,x.note,x.status].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(search))));
  $("#contractorJobCount").textContent="("+all.length+")";
  $("#contractorJobList").innerHTML=list.map((x,i)=>{
    const linked=x._source==="task"||!!x.source_task_id;
    const linkedTaskId=x.source_task_id||"";
    const refs=Array.isArray(x.images)?x.images.filter(Boolean):[];
    const sourceLine=linked?'<div class="contractorJobLinkedSource"><span>LIÊN KẾT TỪ CÔNG VIỆC</span><b>CV-'+esc(String(linkedTaskId).slice(-6))+'</b></div>':"";
    const photos=refs.length?'<div class="contractorJobPhotos"><div class="contractorJobPhotosHead"><span>HÌNH ẢNH CÔNG VIỆC</span><b>'+refs.length+' ảnh</b></div><div class="contractorJobPhotoGrid">'+refs.slice(0,6).map((ref,idx)=>'<button type="button" class="contractorJobPhoto" '+(linkedTaskId?'data-view-linked-images="'+esc(linkedTaskId)+'"':'')+' aria-label="Xem hình '+(idx+1)+'">'+mediaImgHtml(ref,"contractorJobPhotoImg")+'</button>').join("")+'</div></div>':"";
    const actions=linked
      ?(x._source==="task"
        ?'<div class="contractorJobActions"><button type="button" class="contractorLinkedEditBtn" data-edit-linked-task="'+esc(linkedTaskId)+'">✎ Sửa trong Công việc</button></div>'
        :'<div class="contractorJobActions"><button type="button" class="contractorLinkedEditBtn" data-edit-job="'+esc(x.id)+'">✎ Sửa ngay</button><button type="button" data-open-linked-task="'+esc(linkedTaskId)+'">↗ Mở trong Công việc</button></div>')
      :'<div class="contractorJobActions"><button type="button" data-edit-job="'+x.id+'">✎ Sửa</button><button class="danger" type="button" data-delete-job="'+x.id+'">Xóa</button></div>';
    return '<article class="contractorJobCard'+(linked?' contractorJobLinked':'')+'">'+
      '<div class="contractorJobRail"><span>'+(i+1)+'</span></div>'+
      '<div class="contractorJobMain">'+
      '<div class="contractorJobTop"><div><small>NGÀY THỰC HIỆN</small><b>'+fmt(x.work_date)+'</b></div><div><small>HOÀN THÀNH</small><b>'+(x.completed_date?fmt(x.completed_date):"—")+'</b></div><span class="contractorJobStatus '+contractorJobStatusClass(x.status)+'">'+esc(x.status)+'</span></div>'+
      sourceLine+
      '<div class="contractorJobContent"><span>NỘI DUNG CÔNG VIỆC</span><p>'+esc(x.work_content||"—")+'</p></div>'+
      '<div class="contractorJobDiagnosis"><div><span>NGUYÊN NHÂN</span><p>'+esc(String(x.cause||"").trim()||"—")+'</p></div><div><span>HƯỚNG XỬ LÝ / KẾT QUẢ</span><p>'+esc(x.solution||"Chưa ghi nhận")+'</p></div></div>'+
      (x.note?'<div class="contractorJobNote"><span>GHI CHÚ</span><p>'+esc(x.note)+'</p></div>':'')+
      photos+actions+
      '</div></article>';
  }).join("");
  $("#contractorJobList").querySelectorAll("[data-edit-job]").forEach(b=>b.onclick=()=>editContractorJob(b.dataset.editJob));
  $("#contractorJobList").querySelectorAll("[data-delete-job]").forEach(b=>b.onclick=()=>deleteContractorJob(b.dataset.deleteJob));
  const openLinked=id=>{
    const raw=id,n=Number(raw);
    showModule("work");
    setTimeout(()=>window.editTask?.(Number.isFinite(n)?n:raw),120);
  };
  $("#contractorJobList").querySelectorAll("[data-edit-linked-task]").forEach(b=>b.onclick=()=>openLinked(b.dataset.editLinkedTask));
  $("#contractorJobList").querySelectorAll("[data-open-linked-task]").forEach(b=>b.onclick=()=>openLinked(b.dataset.openLinkedTask));
  $("#contractorJobList").querySelectorAll("[data-view-linked-images]").forEach(b=>b.onclick=async e=>{
    e.stopPropagation();
    const raw=b.dataset.viewLinkedImages,n=Number(raw);
    if(typeof window.viewImages==="function"){
      $("#viewer")?.classList.add("imageOnlyViewer");
      await window.viewImages(Number.isFinite(n)?n:raw);
    }
  });
  $("#contractorJobEmpty").classList.toggle("hide",list.length>0);
  if(typeof hydrateMediaImages==="function")hydrateMediaImages($("#contractorJobList"));
}
function resetContractorForm(){
  $("#contractorId").value="";$("#contractorName").value="";$("#contractorPhone").value="";$("#contractorContactName").value="";
  $("#contractorSpecialty").value="";$("#contractorContractStart").value="";$("#contractorContractEnd").value="";$("#contractorStatus").value="Đang hợp tác";$("#contractorNote").value="";
  $("#contractorModalTitle").textContent="Thêm nhà thầu";
}
function openContractorModal(){
  resetContractorForm();$("#contractorModal").classList.remove("hide");setTimeout(()=>$("#contractorName").focus(),50);
}
window.editContractor=id=>{
  const c=contractors.find(x=>String(x.id)===String(id));if(!c)return;
  $("#contractorId").value=c.id;$("#contractorName").value=c.name;$("#contractorPhone").value=c.phone||"";$("#contractorContactName").value=c.contact_name||"";
  $("#contractorSpecialty").value=c.specialty||"";$("#contractorContractStart").value=c.contract_start_date||"";$("#contractorContractEnd").value=c.contract_end_date||"";$("#contractorStatus").value=c.status||"Đang hợp tác";$("#contractorNote").value=c.note||"";
  $("#contractorModalTitle").textContent="Chỉnh sửa nhà thầu";$("#contractorModal").classList.remove("hide");
};
window.deleteContractor=async id=>{
  if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
  const c=contractors.find(x=>String(x.id)===String(id));if(!c||!confirm("Xóa nhà thầu “"+c.name+"” và toàn bộ lịch sử công việc?"))return;
  try{
    await sbFetch("/rest/v1/contractors?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});
    selectedContractorId="";await loadContractorData(currentBuilding.id,true);closeContractorDetail();toast("Đã xóa nhà thầu");
  }catch(e){toast(e.message)}
};
function resetContractorJobForm(contractorId){
  const c=contractors.find(x=>String(x.id)===String(contractorId));
  $("#contractorJobId").value="";$("#contractorJobSourceTaskId")&&($("#contractorJobSourceTaskId").value="");$("#contractorJobContractorId").value=contractorId;$("#contractorJobDate").value=today();$("#contractorJobCompletedDate").value="";
  $("#contractorJobStatus").value="Đang thực hiện";$("#contractorJobContent").value="";$("#contractorJobCause").value="";$("#contractorJobSolution").value="";$("#contractorJobNote").value="";
  $("#contractorJobModalTitle").textContent="Thêm công việc nhà thầu";$("#contractorJobModalContractor").textContent=c?.name||"Nhà thầu";
}
function openContractorJobModal(){
  if(!selectedContractorId)return;
  resetContractorJobForm(selectedContractorId);$("#contractorJobModal").classList.remove("hide");setTimeout(()=>$("#contractorJobContent").focus(),50);
}
window.editContractorJob=id=>{
  const x=contractorJobs.find(r=>String(r.id)===String(id));if(!x)return;
  const c=contractors.find(v=>String(v.id)===String(x.contractor_id));
  $("#contractorJobId").value=x.id;$("#contractorJobSourceTaskId")&&($("#contractorJobSourceTaskId").value=x.source_task_id||"");$("#contractorJobContractorId").value=x.contractor_id;$("#contractorJobDate").value=x.work_date;$("#contractorJobCompletedDate").value=x.completed_date||"";
  $("#contractorJobStatus").value=x.status;$("#contractorJobContent").value=x.work_content||"";$("#contractorJobCause").value=x.cause||"";$("#contractorJobSolution").value=x.solution||"";$("#contractorJobNote").value=x.note||"";
  $("#contractorJobModalTitle").textContent=x.source_task_id?"Chỉnh sửa công việc liên kết":"Chỉnh sửa công việc";
  $("#contractorJobModalContractor").textContent=(c?.name||"Nhà thầu")+(x.source_task_id?" · CV-"+String(x.source_task_id).slice(-6):"");
  $("#contractorJobModal").classList.remove("hide");
};
window.deleteContractorJob=async id=>{
  if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
  if(!confirm("Xóa công việc nhà thầu này?"))return;
  try{
    await sbFetch("/rest/v1/contractor_jobs?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});
    await loadContractorData(currentBuilding.id,true);toast("Đã xóa công việc");
  }catch(e){toast(e.message)}
};
function contractorDirectoryReportHtml(){
  const rows=contractors.map((c,i)=>{
    const jobs=contractorJobsFor(c.id),last=contractorLastJob(c.id);
    const term=[c.contract_start_date?fmt(c.contract_start_date):"",c.contract_end_date?fmt(c.contract_end_date):""].filter(Boolean).join(" → ")||"—";
    return '<tr><td>'+(i+1)+'</td><td><b>'+esc(c.name)+'</b><br>'+esc(c.specialty||"")+'</td><td>'+esc(c.phone||"—")+'</td><td>'+esc(c.contact_name||"—")+'</td><td>'+esc(term)+'</td><td>'+jobs.length+'</td><td>'+(last?.work_date?fmt(last.work_date):"—")+'</td><td>'+esc(c.status)+'</td></tr>';
  }).join("");
  return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Danh bạ nhà thầu</title><style>'+inventoryPdfCss(false)+'</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>DANH BẠ nhà thầu</h1><p>Thông tin liên hệ và số lượt công việc</p></div><table><thead><tr><th>STT</th><th>nhà thầu</th><th>SĐT</th><th>Người liên hệ</th><th>Thời hạn hợp đồng</th><th>Công việc</th><th>Gần nhất</th><th>Trạng thái</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · nhà thầu · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>';
}
function contractorDetailReportHtml(){
  const c=contractors.find(x=>String(x.id)===String(selectedContractorId));if(!c)return "";
  const jobs=contractorJobsFor(c.id).sort((a,b)=>String(b.work_date||"").localeCompare(String(a.work_date||"")));
  const hasCause=jobs.some(x=>String(x.cause||"").trim());
  const rows=jobs.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+fmt(x.work_date)+'</td><td>'+(x.completed_date?fmt(x.completed_date):"—")+'</td><td><b>'+esc(x.work_content||"—")+'</b></td>'+(hasCause?'<td>'+esc(String(x.cause||"").trim()||"—")+'</td>':"")+'<td>'+esc(x.solution||"—")+'</td><td>'+esc(x.status)+'</td></tr>').join("");
  const causeHead=hasCause?"<th>Nguyên nhân</th>":"";
  return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Hồ sơ '+esc(c.name)+'</title><style>'+inventoryPdfCss(true)+'</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>HỒ SƠ nhà thầu: '+esc(c.name)+'</h1><p>'+esc(c.specialty||"nhà thầu")+' · '+esc(c.status)+'</p></div><div class="summary"><div><span>Số điện thoại</span><b>'+esc(c.phone||"—")+'</b></div><div><span>Người liên hệ</span><b>'+esc(c.contact_name||"—")+'</b></div><div><span>Thời hạn hợp đồng</span><b>'+esc([c.contract_start_date?fmt(c.contract_start_date):"",c.contract_end_date?fmt(c.contract_end_date):""].filter(Boolean).join(" → ")||"—")+'</b></div><div><span>Tổng công việc</span><b>'+jobs.length+'</b></div></div><table><thead><tr><th>STT</th><th>Ngày thực hiện</th><th>Hoàn thành</th><th>Nội dung</th>'+causeHead+'<th>Hướng xử lý</th><th>Tình trạng</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · Hồ sơ nhà thầu · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),650)<\/script></body></html>';
}


function contractorSafeFileName(value=""){
  return String(value||"ESTA").replace(/[\\/:*?"<>|]+/g,"-").replace(/\s+/g," ").trim();
}
function contractorDownloadCsv(filename,rows){
  const csv=rows.map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename.replace(/\.xlsx$/i,".csv");
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast("Đã xuất CSV tương thích Excel");
}
function contractorWriteWorkbook(filename,sheets){
  if(!window.XLSX){
    const first=sheets[0];
    contractorDownloadCsv(filename,first.rows);
    return;
  }
  const wb=XLSX.utils.book_new();
  sheets.forEach(s=>{
    const ws=XLSX.utils.aoa_to_sheet(s.rows);
    if(Array.isArray(s.widths))ws["!cols"]=s.widths.map(w=>({wch:w}));
    XLSX.utils.book_append_sheet(wb,ws,s.name.slice(0,31));
  });
  XLSX.writeFile(wb,filename,{compression:true});
}
function contractorExportDirectoryExcel(){
  if(!contractors.length)return toast("Chưa có nhà thầu để xuất Excel");
  const contractorRows=[
    ["STT","Tên nhà thầu","Số điện thoại","Người liên hệ","Lĩnh vực","Trạng thái","Hợp đồng từ","Hợp đồng đến","Số công việc","Công việc gần nhất","Ngày gần nhất","Ghi chú"]
  ];
  contractors.forEach((c,i)=>{
    const jobs=contractorJobsFor(c.id),last=contractorLastJob(c.id);
    contractorRows.push([
      i+1,c.name||"",c.phone||"",c.contact_name||"",contractorFieldLabel(c.specialty),c.status||"",
      c.contract_start_date?fmt(c.contract_start_date):"",c.contract_end_date?fmt(c.contract_end_date):"",
      jobs.length,last?.work_content||"",last?.work_date?fmt(last.work_date):"",c.note||""
    ]);
  });

  const jobRows=[["STT","Nhà thầu","Ngày thực hiện","Ngày hoàn thành","Nội dung công việc","Nguyên nhân","Hướng xử lý","Tình trạng","Ghi chú"]];
  contractorJobs.slice().sort((a,b)=>String(b.work_date||"").localeCompare(String(a.work_date||""))).forEach((x,i)=>{
    const c=contractors.find(v=>String(v.id)===String(x.contractor_id));
    jobRows.push([
      i+1,c?.name||"",x.work_date?fmt(x.work_date):"",x.completed_date?fmt(x.completed_date):"",
      x.work_content||"",x.cause||"",x.solution||"",x.status||"",x.note||""
    ]);
  });

  contractorWriteWorkbook(
    "ESTA-"+contractorSafeFileName(currentBuilding.id)+"-nha-thau-"+today()+".xlsx",
    [
      {name:"Danh sách nhà thầu",rows:contractorRows,widths:[6,28,16,22,18,16,14,14,12,38,14,32]},
      {name:"Lịch sử công việc",rows:jobRows,widths:[6,28,14,14,42,32,36,16,28]}
    ]
  );
}
function contractorExportDetailExcel(){
  const c=contractors.find(x=>String(x.id)===String(selectedContractorId));
  if(!c)return toast("Chưa chọn nhà thầu");
  const jobs=contractorJobsFor(c.id).slice().sort((a,b)=>String(b.work_date||"").localeCompare(String(a.work_date||"")));
  const infoRows=[
    ["THÔNG TIN NHÀ THẦU",""],
    ["Tên nhà thầu",c.name||""],
    ["Số điện thoại",c.phone||""],
    ["Người liên hệ",c.contact_name||""],
    ["Lĩnh vực",contractorFieldLabel(c.specialty)],
    ["Trạng thái",c.status||""],
    ["Hợp đồng từ",c.contract_start_date?fmt(c.contract_start_date):""],
    ["Hợp đồng đến",c.contract_end_date?fmt(c.contract_end_date):""],
    ["Ghi chú",c.note||""],
    ["Dự án",currentBuilding?.name||""]
  ];
  const jobRows=[["STT","Ngày thực hiện","Ngày hoàn thành","Nội dung công việc","Nguyên nhân","Hướng xử lý","Tình trạng","Ghi chú"]];
  jobs.forEach((x,i)=>jobRows.push([
    i+1,x.work_date?fmt(x.work_date):"",x.completed_date?fmt(x.completed_date):"",
    x.work_content||"",x.cause||"",x.solution||"",x.status||"",x.note||""
  ]));
  contractorWriteWorkbook(
    "ESTA-"+contractorSafeFileName(currentBuilding.id)+"-"+contractorSafeFileName(c.name)+"-"+today()+".xlsx",
    [
      {name:"Thông tin",rows:infoRows,widths:[22,60]},
      {name:"Công việc",rows:jobRows,widths:[6,14,14,44,34,38,16,28]}
    ]
  );
}

function contractorInitEvents(){
  $("#contractorSearch").oninput=renderContractors;
  $("#contractorStatusFilter").onchange=renderContractors;
  document.querySelectorAll("[data-contractor-specialty]").forEach(b=>b.onclick=()=>{
    contractorSpecialtyFilter=b.dataset.contractorSpecialty||"";
    document.querySelectorAll("[data-contractor-specialty]").forEach(x=>x.classList.toggle("active",x===b));
    renderContractors();
  });
  $("#contractorJobSearch").oninput=renderContractorJobs;
  $("#contractorJobStatusFilter").onchange=renderContractorJobs;
  $("#addContractorBtn").onclick=openContractorModal;
  $("#contractorBackBtn").onclick=closeContractorDetail;
  $("#contractorDetailCloseBtn").onclick=closeContractorDetail;
  $("#editContractorBtn").onclick=()=>selectedContractorId&&editContractor(selectedContractorId);
  $("#addContractorJobBtn").onclick=openContractorJobModal;
  $("#contractorExportExcel").onclick=contractorExportDirectoryExcel;
  $("#contractorDetailExcel").onclick=contractorExportDetailExcel;
  $("#contractorExportPdf").onclick=()=>{if(!contractors.length)return toast("Chưa có nhà thầu để xuất PDF");inventoryPrintWindow(contractorDirectoryReportHtml())};
  $("#contractorDetailPdf").onclick=()=>{if(!selectedContractorId)return;inventoryPrintWindow(contractorDetailReportHtml())};
  $("#closeContractorModal").onclick=$("#cancelContractorModal").onclick=()=>$("#contractorModal").classList.add("hide");
  $("#closeContractorJobModal").onclick=$("#cancelContractorJobModal").onclick=()=>$("#contractorJobModal").classList.add("hide");
  $("#contractorJobStatus").onchange=()=>{if($("#contractorJobStatus").value==="Hoàn thành"&&!$("#contractorJobCompletedDate").value)$("#contractorJobCompletedDate").value=today()};
  $("#contractorForm").onsubmit=async e=>{
    e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
    const id=$("#contractorId").value;
    const contractStart=$("#contractorContractStart").value||null,contractEnd=$("#contractorContractEnd").value||null;
    if(contractStart&&contractEnd&&contractEnd<contractStart)return toast("Ngày kết thúc hợp đồng phải sau ngày bắt đầu");
    const body={building_id:currentBuilding.id,name:$("#contractorName").value.trim(),phone:$("#contractorPhone").value.trim(),contact_name:$("#contractorContactName").value.trim(),specialty:$("#contractorSpecialty").value.trim(),contract_start_date:contractStart,contract_end_date:contractEnd,status:$("#contractorStatus").value,note:$("#contractorNote").value.trim(),updated_at:new Date().toISOString()};
    try{
      if(id)await sbFetch("/rest/v1/contractors?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
      else await sbFetch("/rest/v1/contractors",{method:"POST",token:centralSession.access_token,body});
      $("#contractorModal").classList.add("hide");await loadContractorData(currentBuilding.id,true);toast(id?"Đã cập nhật nhà thầu":"Đã thêm nhà thầu");
    }catch(err){toast(err.status===409?"Tên nhà thầu này đã tồn tại trong dự án":err.message)}
  };
  $("#contractorJobForm").onsubmit=async e=>{
    e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
    const id=$("#contractorJobId").value,status=$("#contractorJobStatus").value;
    let completed=$("#contractorJobCompletedDate").value||null;if(status==="Hoàn thành"&&!completed)completed=today();
    const workDate=$("#contractorJobDate").value;
    if(completed&&workDate&&completed<workDate)return toast("Ngày hoàn thành không được trước ngày thực hiện");
    const content=$("#contractorJobContent").value.trim();
    if(!content)return toast("Vui lòng nhập nội dung công việc");
    const body={building_id:currentBuilding.id,contractor_id:$("#contractorJobContractorId").value,work_date:workDate,completed_date:completed,work_content:content,cause:$("#contractorJobCause").value.trim(),solution:$("#contractorJobSolution").value.trim(),status,note:$("#contractorJobNote").value.trim(),updated_at:new Date().toISOString()};
    try{
      const sourceTaskId=$("#contractorJobSourceTaskId")?.value||"";
      if(id)await sbFetch("/rest/v1/contractor_jobs?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
      else await sbFetch("/rest/v1/contractor_jobs",{method:"POST",token:centralSession.access_token,body});
      if(sourceTaskId){
        const tasks=load(),idx=tasks.findIndex(t=>String(t.id)===String(sourceTaskId));
        if(idx>=0){
          const oldTask=tasks[idx];
          const taskStatus=status==="Hoàn thành"?"Đã hoàn thành":status;
          const updatedTask={...oldTask,d:workDate,c:content,s:taskStatus,n:$("#contractorJobNote").value.trim(),cause:$("#contractorJobCause").value.trim(),result:$("#contractorJobSolution").value.trim()};
          if(taskStatus==="Đã hoàn thành")updatedTask.completedAt=oldTask.completedAt||new Date((completed||workDate)+"T12:00:00").toISOString();
          else delete updatedTask.completedAt;
          tasks[idx]=updatedTask;
          save(tasks);
          try{await syncTaskRecord("upsert_task",updatedTask,currentBuilding.id)}catch(e){console.warn("Sync linked source task failed",e)}
          if(typeof render==="function")render();
          if(typeof renderHomeDashboard==="function")renderHomeDashboard();
        }
      }
      $("#contractorJobModal").classList.add("hide");await loadContractorData(currentBuilding.id,true);if(selectedContractorId)renderContractorDetail();toast(sourceTaskId?"Đã cập nhật công việc liên kết":(id?"Đã cập nhật công việc":"Đã thêm công việc nhà thầu"));
    }catch(err){toast(err.message)}
  };
}
contractorInitEvents();
function contractorHeaderSearchSync(){
  const g=$("#globalSearch");
  if(!g)return;
  g.addEventListener("input",()=>{
    if(!$("#app").classList.contains("contractorMode"))return;
    $("#contractorSearch").value=g.value;
    renderContractors();
  });
}
contractorHeaderSearchSync();

function contractorEscapeHandler(e){
  if(e.key!=="Escape"||!selectedContractorId)return;
  const modalOpen=document.querySelector(".modal:not(.hide)");
  if(!modalOpen)closeContractorDetail();
}
document.addEventListener("keydown",contractorEscapeHandler);
