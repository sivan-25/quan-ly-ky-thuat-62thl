(function adminEditor(){
"use strict";
let current=null,initial=null,photos=[],files=[],blobUrls=[],busy=false,serial=0;
const $=id=>document.getElementById(id);
const d=v=>String(v||"").slice(0,10);
const now=()=>new Date().toLocaleDateString("en-CA");
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const isAdminTask=t=>t?.dispatchedByAdmin===true||!!String(t?.dispatchGroupId||"").trim();
const done=t=>["Đã hoàn thành","Hoàn thành"].includes(String(t?.s||""));
const priorityVi=p=>{const raw=String(p??"").trim();return ({critical:"Khẩn cấp",high:"Cao",medium:"Trung bình",low:"Thấp","khẩn cấp":"Khẩn cấp",cao:"Cao","trung bình":"Trung bình","thấp":"Thấp"})[raw.toLocaleLowerCase("vi-VN")]||(raw||"Trung bình")};
const projectTitle=id=>({"62THL":"62 THL","68PĐL":"68 PĐL","68PDL":"68 PĐL","127HH":"127 HH","130HH":"130 HH","399CH":"399 CH"})[id]||id;
function error(text){const el=$("ccWeError");if(el){el.textContent=text||"";el.classList.toggle("hide",!text)}}
function ui(){
 let m=$("ccAdminWorkEdit");if(m)return m;
 m=document.createElement("div");m.id="ccAdminWorkEdit";m.className="ccAdminWorkEdit hide";
 m.innerHTML=`<div class="ccWeBackdrop" data-we-close></div><section class="ccWeCard" role="dialog" aria-modal="true" aria-labelledby="ccWeHeading">
 <header class="ccWeHead"><div><span>ESTA · ADMIN WORK ORDER</span><h2 id="ccWeHeading">Chỉnh sửa công việc Admin đã giao</h2><p id="ccWeProject">Đang tải công việc...</p></div><button type="button" class="ccWeX" data-we-close aria-label="Đóng">×</button></header>
 <form id="ccWeForm"><div class="ccWeGrid">
 <label class="full"><span>Nội dung công việc *</span><textarea id="ccWeContent" rows="3" required maxlength="2500"></textarea></label>
 <label><span>Ngày giao *</span><input id="ccWeAssigned" type="date" required></label>
 <label><span>Ngày bắt đầu *</span><input id="ccWeStart" type="date" required></label>
 <label><span>Hạn hoàn thành *</span><input id="ccWeDue" type="date" required></label>
 <label><span>Loại công việc</span><select id="ccWeType"><option>Hằng ngày</option><option>Bảo trì</option><option>Sự cố</option></select></label>
 <label><span>Mức độ ưu tiên</span><select id="ccWePriority"><option>Thấp</option><option>Trung bình</option><option>Cao</option><option>Khẩn cấp</option></select></label>
 <label><span>Trạng thái</span><select id="ccWeStatus"><option>Đang thực hiện</option><option>Chờ xử lý</option><option>Đã hoàn thành</option><option>Hoàn thành</option><option>Bắt đầu</option></select></label>
 <label class="full"><span>Người thực hiện *</span><input id="ccWeAssignee" required maxlength="200" list="ccWePeople" placeholder="Nhập tên, cách nhau bằng dấu phẩy"><datalist id="ccWePeople"></datalist></label>
 <label class="full"><span>Ghi chú</span><textarea id="ccWeNote" rows="2"></textarea></label>
 <label class="full"><span>Kết quả thực hiện</span><textarea id="ccWeResult" rows="2" placeholder="Điền khi công việc hoàn thành"></textarea></label>
 </div><section class="ccWeImages"><div class="ccWeImagesTitle"><div><b>Hình ảnh công việc</b><small>Giữ, bỏ hoặc bổ sung ảnh. Chỉ thay đổi ảnh nếu có thao tác.</small></div><label class="ccWeUpload">＋ Thêm ảnh<input id="ccWeFiles" type="file" accept="image/*" multiple></label></div><div id="ccWePhotos"></div></section>
 <p id="ccWeError" class="ccWeError hide" role="alert"></p>
 <footer class="ccWeActions"><span>Giữ nguyên mã công việc và dự án đã giao.</span><button type="button" class="ccWeCancel" data-we-close>Hủy</button><button type="submit" id="ccWeSave" class="ccWeSave"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg><b>Lưu thay đổi</b></button></footer></form>
 </section>`;
 document.body.appendChild(m);
 m.addEventListener("click",e=>{
  if(e.target.closest("[data-we-close]"))return close();
  const old=e.target.closest("[data-we-delete-old]"),newImage=e.target.closest("[data-we-delete-new]");
  if(old){photos.splice(Number(old.dataset.weDeleteOld),1);renderImages();return}
  if(newImage){files.splice(Number(newImage.dataset.weDeleteNew),1);renderImages();return}
  const view=e.target.closest("[data-we-view]");
  if(view)void viewImage(view.dataset.weView,Number(view.dataset.index));
 });
 $("ccWeFiles").addEventListener("change",e=>{files.push(...[...e.target.files].filter(f=>f.type.startsWith("image/")));e.target.value="";renderImages()});
 $("ccWeForm").addEventListener("submit",save);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!m.classList.contains("hide"))close()});
 return m;
}
function purgeUrls(){blobUrls.forEach(u=>URL.revokeObjectURL(u));blobUrls=[]}
async function renderImages(){
 const box=$("ccWePhotos");if(!box)return;
 const v=serial;purgeUrls();
 let html=photos.map((ref,i)=>'<div class="ccWePhoto"><button type="button" data-we-view="old" data-index="'+i+'"><img data-old="'+i+'" alt="Ảnh đã lưu"></button><button type="button" class="ccWeRemove" data-we-delete-old="'+i+'" aria-label="Bỏ ảnh">×</button><small>Đã lưu</small></div>').join("");
 html+=files.map((file,i)=>{const u=URL.createObjectURL(file);blobUrls.push(u);return '<div class="ccWePhoto"><button type="button" data-we-view="new" data-index="'+i+'"><img src="'+u+'" alt="Ảnh mới"></button><button type="button" class="ccWeRemove" data-we-delete-new="'+i+'" aria-label="Bỏ ảnh mới">×</button><small>Ảnh mới</small></div>'}).join("");
 box.innerHTML=html||'<p class="ccWeNoImage">Chưa có ảnh đính kèm.</p>';
 for(let i=0;i<photos.length;i++){
  try{
   const u=await mediaObjectUrl(photos[i]);if(serial!==v)return;
   const img=box.querySelector('img[data-old="'+i+'"]');if(img)img.src=u;
  }catch(e){const img=box.querySelector('img[data-old="'+i+'"]');if(img)img.alt="Không tải được ảnh"}
 }
}
async function viewImage(type,index){
 const value=type==="old"?photos[index]:files[index];if(!value)return;
 try{
  const url=type==="old"?await mediaObjectUrl(value):URL.createObjectURL(value);
  const overlay=document.createElement("div");overlay.className="ccWeViewer";
  overlay.innerHTML='<div><button type="button" aria-label="Đóng ảnh">×</button><img alt="Hình ảnh công việc"></div>';
  overlay.querySelector("img").src=url;
  const exit=()=>{overlay.remove();if(type!=="old")URL.revokeObjectURL(url)};
  overlay.addEventListener("click",e=>{if(e.target===overlay||e.target.closest("button"))exit()});
  document.body.appendChild(overlay);
 }catch(e){error("Không thể mở ảnh. Vui lòng thử lại.")}
}
function setBusy(value){
 busy=value;const btn=$("ccWeSave");
 if(btn){btn.disabled=value;btn.querySelector("b").textContent=value?"Đang lưu...":"Lưu thay đổi"}
 $("ccAdminWorkEdit")?.setAttribute("aria-busy",String(value));
}
function close(){
 if(busy)return;
 $("ccAdminWorkEdit")?.classList.add("hide");
 current=null;initial=null;photos=[];files=[];serial++;purgeUrls();
}
async function open(buildingId,taskId){
 if(busy)return;
 if(!currentAccount?.is_admin||typeof isAdminOverview!=="function"||!isAdminOverview())return toast("Chỉ Admin được chỉnh sửa tại Tổng quan Admin");
 const authorized=(currentAccount.buildings||[]).some(b=>String(b.id)===String(buildingId)&&String(b.id).toUpperCase()!=="UPDATE");
 if(!authorized)return toast("Bạn không có quyền truy cập dự án này");
 const root=ui(),v=++serial;current=null;initial=null;photos=[];files=[];purgeUrls();error("");
 root.classList.remove("hide");
 $("ccWeForm").classList.add("ccWeLoading");
 $("ccWeProject").textContent="Đang tải từ "+projectTitle(buildingId)+"...";
 try{
  const reply=await projectSync("get",{},buildingId);
  if(v!==serial)return;
  const task=(reply?.snapshot?.tasks||[]).find(t=>String(t.id)===String(taskId));
  if(!task||!isAdminTask(task))throw new Error("Không tìm thấy công việc Admin đã giao trong dự án");
  current={buildingId,id:String(task.id)};initial={...task};photos=Array.isArray(task.imgs)?[...task.imgs]:[];
  const fill={
   ccWeContent:task.c||"",ccWeAssigned:d(task.dispatchedAt)||d(task.d)||now(),
   ccWeStart:d(task.d)||now(),ccWeDue:d(task.dueDate)||d(task.d)||now(),
   ccWeType:task.t||"Hằng ngày",ccWePriority:priorityVi(task.priority),
   ccWeStatus:task.s||"Đang thực hiện",ccWeAssignee:task.a||"",
   ccWeNote:task.n||"",ccWeResult:task.result||""
  };
  for(const [id,value] of Object.entries(fill))$(id).value=value;
  $("ccWePeople").innerHTML=(reply?.snapshot?.people||[]).map(p=>'<option value="'+esc(p.name||"")+'"></option>').join("");
  $("ccWeProject").textContent=projectTitle(buildingId)+" · Mã công việc "+task.id+" · Cập nhật trực tiếp";
  await renderImages();
  if(v===serial)$("ccWeContent").focus();
 }catch(e){if(v===serial){console.warn("Admin edit open",e);error(e?.message||"Không thể tải công việc")}}
 finally{if(v===serial)$("ccWeForm").classList.remove("ccWeLoading")}
}
async function save(e){
 e.preventDefault();
 if(busy||!current||!initial)return;
 if(!currentAccount?.is_admin||!isAdminOverview())return error("Cần đăng nhập Admin để lưu.");
 const before={...initial},id={...current};
 const values={
  c:$("ccWeContent").value.trim(),d:$("ccWeStart").value,
  dueDate:$("ccWeDue").value,t:$("ccWeType").value,
  priority:priorityVi(before.priority)===$("ccWePriority").value?(before.priority||$("ccWePriority").value):$("ccWePriority").value,s:$("ccWeStatus").value,
  a:$("ccWeAssignee").value.trim(),n:$("ccWeNote").value.trim(),
  result:$("ccWeResult").value.trim()
 },assigned=$("ccWeAssigned").value;
 if(!values.c||!values.d||!values.dueDate||!values.a||!assigned)return error("Vui lòng nhập nội dung, các ngày và người thực hiện.");
 if(values.dueDate<values.d)return error("Hạn hoàn thành không thể trước ngày bắt đầu.");
 error("");setBusy(true);
 try{
  // Reload server state before saving so technician edits made meanwhile survive.
  const fresh=await projectSync("get",{},id.buildingId);
  const latest=(fresh?.snapshot?.tasks||[]).find(t=>String(t.id)===id.id);
  if(!latest||!isAdminTask(latest))throw new Error("Công việc đã bị xóa hoặc không còn thuộc Admin giao.");
  const next={...latest};
  for(const [key,value] of Object.entries(values)){
   if(String(value)!==String(before[key]??""))next[key]=value;
  }
  if(values.a!==String(before.a||""))next.performers=[...new Set(values.a.split(",").map(s=>s.trim()).filter(Boolean))];
  const prevAssigned=d(before.dispatchedAt)||d(before.d);
  if(assigned!==prevAssigned)next.dispatchedAt=assigned+"T12:00:00.000Z";
  if(values.dueDate!==String(before.dueDate||""))next.dueDateExplicit=true;
  if(done(next)&&!done(latest)&&!String(next.result||"").trim())throw new Error("Vui lòng nhập kết quả thực hiện khi chuyển công việc sang Hoàn thành.");
  if(done(next)&&!done(latest))next.completedAt=new Date().toISOString();
  if(!done(next)&&done(latest))delete next.completedAt;
  const removed=(Array.isArray(before.imgs)?before.imgs:[]).filter(ref=>!photos.includes(ref));
  const merged=(Array.isArray(latest.imgs)?latest.imgs:[]).filter(ref=>!removed.includes(ref));
  if(files.length)merged.push(...await uploadMediaFiles(files,"tasks",next.id,null,id.buildingId));
  next.imgs=[...new Set(merged)];next.i=next.imgs.length;
  await syncTaskRecord("upsert_task",next,id.buildingId);
  setBusy(false);close();toast("Đã cập nhật công việc "+projectTitle(id.buildingId));
  if(typeof window.estaCommandCenterRefresh==="function")await window.estaCommandCenterRefresh();
 }catch(err){console.warn("Admin edit save",err);error(err?.message||"Không thể lưu công việc");setBusy(false)}
}
window.estaAdminWorkEditor={open,close};
})();
