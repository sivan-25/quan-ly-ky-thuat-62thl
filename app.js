const $=s=>document.querySelector(s);
const SB_URL="https://upcjcrycahdfroxggsdz.supabase.co";
const SB_KEY="sb_publishable_WQiZyrTXCeRr6BgfXAtQSg_zX_eUBsa";
let me=null,centralSession=null,currentAccount=null,currentBuilding={id:"62THL",name:"62 Trần Huy Liệu",role:"editor"};

const taskStorageKey=()=>currentBuilding.id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+currentBuilding.id;
const load=()=>{try{let v=JSON.parse(localStorage.getItem(taskStorageKey())||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}};
const save=a=>localStorage.setItem(taskStorageKey(),JSON.stringify(a));
const today=()=>new Date().toLocaleDateString("en-CA");
const fmt=d=>new Date(d+"T00:00").toLocaleDateString("vi-VN");
const esc=(s="")=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(s){$("#toast").textContent=s;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1800)}

function sentenceCapitalizeText(value){
 let out="",capitalize=true;
 for(const ch of String(value??"")){
   if(capitalize&&/\p{L}/u.test(ch)){out+=ch.toLocaleUpperCase("vi-VN");capitalize=false;continue}
   out+=ch;
   if(ch==="."||ch==="!"||ch==="?")capitalize=true;
 }
 return out;
}
function shouldAutoCapitalize(el){
 if(!el||!el.closest||!el.closest("#app"))return false;
 if(el.tagName==="TEXTAREA")return true;
 if(el.tagName!=="INPUT")return false;
 const type=(el.getAttribute("type")||"text").toLowerCase();
 if(type!=="text")return false;
 return !["search","globalSearch","user","pass","adminUsername","adminPassword","setupAdminEmail","setupAdminPassword"].includes(el.id);
}
function applyAutoCapitalize(el){
 const start=el.selectionStart,end=el.selectionEnd,next=sentenceCapitalizeText(el.value);
 if(next!==el.value){el.value=next;try{el.setSelectionRange(start,end)}catch(e){}}
}

async function sbFetch(path,{method="GET",body=null,token=null}={}){
 const headers={"apikey":SB_KEY,"Content-Type":"application/json"};
 if(token)headers.Authorization="Bearer "+token;
 const res=await fetch(SB_URL+path,{method,headers,body:body===null?null:JSON.stringify(body)});
 let data=null;try{data=await res.json()}catch(e){}
 if(!res.ok){const err=new Error(data?.msg||data?.message||data?.error_description||data?.error||"Không thể kết nối máy chủ");err.status=res.status;throw err}
 return data;
}
const MEDIA_BUCKET="task-images";
const mediaUrlCache=new Map();
function isStorageRef(v){return typeof v==="string"&&v.startsWith("storage:")}
function storagePathFromRef(v){return isStorageRef(v)?v.slice(8):v}
function mediaPathUrl(path){return path.split("/").map(encodeURIComponent).join("/")}
async function signedMediaUrl(ref){
 if(!ref)return "";
 if(!isStorageRef(ref))return ref;
 const path=storagePathFromRef(ref),cached=mediaUrlCache.get(path);
 if(cached&&cached.exp>Date.now()+60000)return cached.url;
 if(!centralSession?.access_token)return "";
 const res=await fetch(SB_URL+"/storage/v1/object/sign/"+MEDIA_BUCKET+"/"+mediaPathUrl(path),{
   method:"POST",
   headers:{"apikey":SB_KEY,"Authorization":"Bearer "+centralSession.access_token,"Content-Type":"application/json"},
   body:JSON.stringify({expiresIn:3600})
 });
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(data?.message||data?.error||"Không thể mở hình ảnh");
 let url=data.signedURL||data.signedUrl||"";
 if(url&&url.startsWith("/"))url=SB_URL+url;
 mediaUrlCache.set(path,{url,exp:Date.now()+3500*1000});
 return url;
}
function mediaImgHtml(ref,cls=""){
 if(!ref)return "";
 if(isStorageRef(ref))return '<img class="'+cls+'" data-storage-path="'+esc(storagePathFromRef(ref))+'" alt="Hình ảnh">';
 return '<img class="'+cls+'" src="'+esc(ref)+'" alt="Hình ảnh">';
}
async function hydrateMediaImages(root=document){
 const imgs=[...(root||document).querySelectorAll?.("img[data-storage-path]")||[]];
 await Promise.all(imgs.map(async im=>{
   if(im.dataset.loaded==="1")return;
   try{im.src=await signedMediaUrl("storage:"+im.dataset.storagePath);im.dataset.loaded="1"}
   catch(e){im.alt="Không tải được hình"}
 }));
}
function imageFileToBlob(file){
 return new Promise((resolve,reject)=>{
   if(!file?.type?.startsWith("image/"))return reject(new Error("Chỉ hỗ trợ file hình ảnh"));
   const url=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{
     try{
       const max=2400,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
       const cv=document.createElement("canvas");cv.width=w;cv.height=h;
       cv.getContext("2d").drawImage(img,0,0,w,h);
       cv.toBlob(blob=>{URL.revokeObjectURL(url);blob?resolve(blob):reject(new Error("Không thể xử lý hình ảnh"))},"image/jpeg",.82);
     }catch(e){URL.revokeObjectURL(url);reject(e)}
   };
   img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Không đọc được hình ảnh này"))};
   img.src=url;
 });
}
async function uploadMediaBlob(blob,kind,recordId,index=0){
 if(!centralSession?.access_token)throw new Error("Cần đăng nhập tài khoản trung tâm để tải hình");
 const uid=(crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2));
 const path=currentBuilding.id+"/"+kind+"/"+recordId+"/"+Date.now()+"-"+index+"-"+uid+".jpg";
 const res=await fetch(SB_URL+"/storage/v1/object/"+MEDIA_BUCKET+"/"+mediaPathUrl(path),{
   method:"POST",
   headers:{"apikey":SB_KEY,"Authorization":"Bearer "+centralSession.access_token,"Content-Type":"image/jpeg","x-upsert":"false"},
   body:blob
 });
 if(!res.ok){let d={};try{d=await res.json()}catch(e){}throw new Error(d?.message||d?.error||"Không thể tải hình lên máy chủ")}
 return "storage:"+path;
}
async function uploadMediaFiles(files,kind,recordId,onProgress){
 const list=[...files],refs=[];
 for(let i=0;i<list.length;i++){
   if(onProgress)onProgress(i+1,list.length);
   const blob=await imageFileToBlob(list[i]);
   refs.push(await uploadMediaBlob(blob,kind,recordId,i));
 }
 return refs;
}
async function uploadLegacyDataUrl(dataUrl,kind,recordId,index){
 const blob=await (await fetch(dataUrl)).blob();
 let out=blob;
 if(blob.type!=="image/jpeg"){
   const f=new File([blob],"legacy-image",{type:blob.type||"image/png"});
   out=await imageFileToBlob(f);
 }
 return uploadMediaBlob(out,kind,recordId,index);
}
async function migrateMediaRows(tasks,energy){
 let changed=false;
 if(!centralSession?.access_token||!canProjectEdit())return {tasks,energy,changed};
 for(const task of tasks||[]){
   if(!Array.isArray(task.imgs))continue;
   for(let i=0;i<task.imgs.length;i++){
     const ref=task.imgs[i];
     if(typeof ref==="string"&&ref.startsWith("data:image/")){
       task.imgs[i]=await uploadLegacyDataUrl(ref,"tasks",task.id,i);
       changed=true;
     }
   }
   task.i=task.imgs.length;
 }
 for(const row of energy||[]){
   if(typeof row.image==="string"&&row.image.startsWith("data:image/")){
     row.image=await uploadLegacyDataUrl(row.image,"energy",row.id,0);
     changed=true;
   }
 }
 return {tasks,energy,changed};
}
let viewerMediaRefs=[];
window.downloadViewerMedia=async index=>{
 const ref=viewerMediaRefs[index];if(!ref)return;
 try{
   const url=await signedMediaUrl(ref),res=await fetch(url);
   if(!res.ok)throw new Error("Không thể tải hình");
   const blob=await res.blob(),u=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=u;a.download="ESTA-"+currentBuilding.id+"-hinh-"+(index+1)+".jpg";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);
 }catch(e){toast(e.message||"Không thể tải hình")}
};

async function projectSync(action,payload={}){
 if(!centralSession?.access_token||!currentBuilding?.id)return null;
 return sbFetch("/functions/v1/project-sync",{method:"POST",token:centralSession.access_token,body:{action,building_id:currentBuilding.id,...payload}});
}
const cloudVersionByBuilding={};
function applyCloudSnapshot(building,row){
 if(!row)return;
 localStorage.setItem(building.id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+building.id,JSON.stringify(Array.isArray(row.tasks)?row.tasks:[]));
 localStorage.setItem(building.id==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+building.id,JSON.stringify(Array.isArray(row.energy)?row.energy:[]));
 cloudVersionByBuilding[building.id]=row.updated_at||"";
 if(currentBuilding?.id===building.id){render();renderEnergy()}
}
function mergeByRecordId(cloudRows,localRows){
 const map=new Map();
 (Array.isArray(cloudRows)?cloudRows:[]).forEach(x=>{if(x&&x.id!==undefined)map.set(String(x.id),x)});
 (Array.isArray(localRows)?localRows:[]).forEach(x=>{if(x&&x.id!==undefined)map.set(String(x.id),x)});
 return [...map.values()];
}
async function syncProjectSnapshot(){
 if(!centralSession?.access_token||!currentBuilding?.id)return;
 try{
   const r=await projectSync("merge_snapshot",{tasks:load(),energy:typeof energyLoad==="function"?energyLoad():[]});
   if(r?.updated_at)cloudVersionByBuilding[currentBuilding.id]=r.updated_at;
 }catch(e){console.warn("Snapshot merge failed",e)}
}
async function syncTaskRecord(action,itemOrId){
 if(!centralSession?.access_token)return;
 try{
   const r=action==="upsert_task"
     ?await projectSync(action,{item:itemOrId})
     :await projectSync(action,{id:itemOrId});
   if(r?.updated_at)cloudVersionByBuilding[currentBuilding.id]=r.updated_at;
 }catch(e){toast("Đã lưu trên máy nhưng chưa đồng bộ lên máy chủ");throw e}
}
async function syncEnergyRecord(action,itemOrId){
 if(!centralSession?.access_token)return;
 try{
   const r=action==="upsert_energy"
     ?await projectSync(action,{item:itemOrId})
     :await projectSync(action,{id:itemOrId});
   if(r?.updated_at)cloudVersionByBuilding[currentBuilding.id]=r.updated_at;
 }catch(e){toast("Đã lưu trên máy nhưng chưa đồng bộ lên máy chủ");throw e}
}
async function loadProjectSnapshot(building){
 if(!centralSession?.access_token||!building?.id)return;
 const oldBuilding=currentBuilding;
 currentBuilding=building;
 try{
   const r=await projectSync("get");
   const row=r?.snapshot;
   const migrationKey="esta_cloud_merge_v3_"+building.id;
   if(row){
     if(!localStorage.getItem(migrationKey)){
       let localTasks=[],localEnergy=[];
       try{localTasks=JSON.parse(localStorage.getItem(building.id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+building.id)||"[]")}catch(e){}
       try{localEnergy=JSON.parse(localStorage.getItem(building.id==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+building.id)||"[]")}catch(e){}
       const mergedTasks=mergeByRecordId(row.tasks,localTasks);
       const mergedEnergy=mergeByRecordId(row.energy,localEnergy);
       localStorage.setItem(building.id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+building.id,JSON.stringify(mergedTasks));
       localStorage.setItem(building.id==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+building.id,JSON.stringify(mergedEnergy));
       localStorage.setItem(migrationKey,"1");
       cloudVersionByBuilding[building.id]=row.updated_at||"";
       if(mergedTasks.length>(Array.isArray(row.tasks)?row.tasks.length:0)||mergedEnergy.length>(Array.isArray(row.energy)?row.energy.length:0))await syncProjectSnapshot();
     }else applyCloudSnapshot(building,row);
   }else await syncProjectSnapshot();
 }catch(e){toast("Không thể tải dữ liệu dự án từ máy chủ")}
 finally{currentBuilding=building}
}
async function pollProjectSnapshot(){
 if(!centralSession?.access_token||!currentBuilding?.id||document.hidden)return;
 if($("#adminPage")&&!$("#adminPage").classList.contains("hide"))return;
 try{
   const r=await projectSync("get"),row=r?.snapshot;
   if(row&&row.updated_at&&row.updated_at!==cloudVersionByBuilding[currentBuilding.id])applyCloudSnapshot(currentBuilding,row);
 }catch(e){console.warn("Cloud refresh failed",e)}
}
setInterval(pollProjectSnapshot,5000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)pollProjectSnapshot()});
window.addEventListener("focus",()=>pollProjectSnapshot());

async function loadCentralAccount(token){
 let p=await sbFetch("/rest/v1/profiles?select=id,email,username,display_name,is_admin,active&id=eq."+encodeURIComponent((await sbFetch("/auth/v1/user",{token})).id),{token});
 let profile=p?.[0];if(!profile||profile.active===false)throw new Error("Tài khoản đã bị khóa");
 if(profile.username==="admin"&&!profile.is_admin){
   try{await sbFetch("/rest/v1/rpc/bootstrap_first_admin",{method:"POST",body:{},token})}catch(e){}
   p=await sbFetch("/rest/v1/profiles?select=id,email,username,display_name,is_admin,active&id=eq."+encodeURIComponent(profile.id),{token});profile=p?.[0]||profile;
 }
 let buildings=[];
 if(profile.is_admin){
   buildings=await sbFetch("/rest/v1/buildings?select=id,name,deleted_at&deleted_at=is.null&order=name.asc",{token});
   buildings=(buildings||[]).map(b=>({...b,role:"admin"}));
 }else{
   const rows=await sbFetch("/rest/v1/building_members?select=building_id,role,buildings(id,name,deleted_at)&user_id=eq."+encodeURIComponent(profile.id),{token});
   buildings=(rows||[]).filter(r=>r.buildings&&!r.buildings.deleted_at).map(r=>({id:r.building_id,name:r.buildings?.name||r.building_id,role:r.role}));
 }
 return {...profile,buildings};
}
async function centralLogin(identifier,password){
 const email=identifier.includes("@")?identifier.trim().toLowerCase():identifier.trim().toLowerCase()+"@esta-building.app";
 const data=await sbFetch("/auth/v1/token?grant_type=password",{method:"POST",body:{email,password}});
 const session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at||0};
 localStorage.setItem("esta_central_session",JSON.stringify(session));
 const account=await loadCentralAccount(session.access_token);
 return {session,account};
}
async function restoreCentral(){
 let s;try{s=JSON.parse(localStorage.getItem("esta_central_session")||"null")}catch(e){return null}
 if(!s?.access_token)return null;
 try{return {session:s,account:await loadCentralAccount(s.access_token)}}catch(err){
   if(!s.refresh_token){localStorage.removeItem("esta_central_session");return null}
   try{
     const d=await sbFetch("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:{refresh_token:s.refresh_token}});
     s={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||0};
     localStorage.setItem("esta_central_session",JSON.stringify(s));
     return {session:s,account:await loadCentralAccount(s.access_token)};
   }catch(e){localStorage.removeItem("esta_central_session");return null}
 }
}
function applyBuildingUI(){
 const name=currentBuilding?.name||"Dự án";
 document.querySelectorAll(".buildingNameText").forEach(el=>el.textContent=name);
 const wt=$("#topWorkTitle p"),et=$("#topEnergyTitle p");
 if(wt)wt.textContent=name;
 if(et)et.textContent=name+" · Điện / Nước / Điện mặt trời";
 document.title="ESTA | "+name;
 resetForm(false);render();renderEnergy();
}
async function enterProject(building){
 currentBuilding={...building};
 sessionStorage.setItem("esta_building",JSON.stringify(currentBuilding));
 $("#navWork").classList.remove("hide");$("#navEnergy").classList.remove("hide");
 if(centralSession?.access_token)await loadProjectSnapshot(currentBuilding);
 applyBuildingUI();
 showModule("work");
}
function openAdminPortal(){
 if(!currentAccount?.is_admin)return;
 $("#adminPage").classList.remove("hide");$("#workPage").classList.add("hide");$("#energyPage").classList.add("hide");
 $("#workHero").classList.add("hide");$("#energyHero").classList.add("hide");
 $("#topAdminTitle").classList.remove("hide");$("#topWorkTitle").classList.add("hide");$("#topEnergyTitle").classList.add("hide");
 $("#navAdmin").classList.add("active");$("#navWork").classList.remove("active");$("#navEnergy").classList.remove("active");
 $("#app").classList.add("adminMode");renderAdminPortal();
}
window.adminOpenBuilding=id=>{const b=currentAccount?.buildings?.find(x=>x.id===id);if(b)enterProject(b)};
window.enterAccount=function(account,session=null){
 currentAccount=account;centralSession=session;me=account.username||account.email||"user";
 $("#login").classList.add("hide");$("#app").classList.remove("hide");
 $("#headerUser").textContent=account.display_name||account.username||"Người dùng";
 $("#headerRole").textContent=account.is_admin?"Quản trị viên":(account.buildings?.[0]?.role==="viewer"?"Chỉ xem":"Kỹ thuật viên");
 $("#sideUser").innerHTML="<b>"+esc(account.display_name||account.username||"Người dùng")+"</b><br>"+(account.is_admin?"Quản trị viên":"Tài khoản dự án");
 $("#navAdmin").classList.toggle("hide",!account.is_admin);
 if(account.is_admin){$("#navWork").classList.add("hide");$("#navEnergy").classList.add("hide");openAdminPortal()}
 else if(account.buildings?.length){enterProject(account.buildings[0])}
 else{toast("Tài khoản chưa được phân quyền dự án");}
};

$("#loginForm").onsubmit=async e=>{
 e.preventDefault();
 const u=$("#user").value.trim(),p=$("#pass").value,er=$("#loginError"),btn=$("#loginBtn");
 er.textContent="";btn.disabled=true;btn.textContent="Đang đăng nhập...";
 try{
   const central=await centralLogin(u,p);
   window.enterAccount(central.account,central.session);
 }catch(err){
   er.textContent=err?.status===400||err?.status===401?"Tài khoản hoặc mật khẩu chưa đúng.":"Không thể kết nối hệ thống trung tâm. Vui lòng thử lại.";
 }
 finally{btn.disabled=false;btn.innerHTML='Đăng nhập <b>→</b>'}
};

$("#logout").onclick=async()=>{
 try{if(centralSession?.access_token)await sbFetch("/auth/v1/logout",{method:"POST",token:centralSession.access_token})}catch(e){}
 localStorage.removeItem("esta_central_session");sessionStorage.removeItem("esta_building");location.reload();
};

$("#openAdminSetup").onclick=()=>$("#adminSetupModal").classList.remove("hide");
$("#closeAdminSetup").onclick=()=>$("#adminSetupModal").classList.add("hide");
$("#adminSetupModal").onclick=e=>{if(e.target===$("#adminSetupModal"))$("#adminSetupModal").classList.add("hide")};
$("#adminSetupForm").onsubmit=async e=>{
 e.preventDefault();const msg=$("#adminSetupMessage");msg.textContent="Đang tạo tài khoản...";
 try{
   const email=$("#setupAdminEmail").value.trim().toLowerCase(),password=$("#setupAdminPassword").value,name=$("#setupAdminName").value.trim()||"Quản trị viên";
   const d=await sbFetch("/auth/v1/signup",{method:"POST",body:{email,password,data:{username:"admin",display_name:name}}});
   if(d.access_token){
     await sbFetch("/rest/v1/rpc/bootstrap_first_admin",{method:"POST",body:{},token:d.access_token});
     const session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||0};localStorage.setItem("esta_central_session",JSON.stringify(session));
     const account=await loadCentralAccount(d.access_token);$("#adminSetupModal").classList.add("hide");window.enterAccount(account,session);toast("Đã kích hoạt Admin trung tâm");
   }else msg.textContent="Tài khoản đã được tạo. Hãy xác nhận email rồi đăng nhập bằng email Admin.";
 }catch(err){msg.textContent=err.message}
};

$("#backupBtn").onclick=()=>{
 let blob=new Blob([JSON.stringify({version:3,building:currentBuilding,exportedAt:new Date().toISOString(),tasks:load(),energy:energyLoad()},null,2)],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="ESTA-"+currentBuilding.id+"-sao-luu-"+today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Đã tạo file sao lưu");
};
$("#restoreBtn").onclick=()=>$("#restoreFile").click();
$("#restoreFile").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let d=JSON.parse(await f.text()),tasks=Array.isArray(d)?d:d.tasks;if(!Array.isArray(tasks))throw new Error("File sao lưu không hợp lệ");if(!confirm("Khôi phục sẽ thay thế dữ liệu hiện tại của "+currentBuilding.name+". Tiếp tục?"))return;save(tasks);if(Array.isArray(d.energy))energySaveAll(d.energy);await syncProjectSnapshot();render();renderEnergy();toast("Đã khôi phục và đồng bộ dữ liệu")}catch(err){toast("Không thể đọc file sao lưu")}finally{e.target.value=""}};
$("#menu").onclick=()=>document.querySelector("aside").classList.toggle("open");const DRAFT="qlkt62_draft";function saveDraft(){if($("#editId").value)return;localStorage.setItem(DRAFT,JSON.stringify({d:$("#date").value,c:$("#content").value,t:$("#type").value,s:$("#status").value,a:$("#performer").value,n:$("#note").value}))}function restoreDraft(){try{let d=JSON.parse(localStorage.getItem(DRAFT)||"null");if(!d)return;$("#date").value=d.d||today();$("#content").value=d.c||"";$("#type").value=d.t||"Hằng ngày";$("#status").value=d.s||"Đã hoàn thành";$("#performer").value=d.a||"";$("#note").value=d.n||""}catch(e){}}function resetForm(clearDraft=true){$("#editId").value="";$("#date").value=today();$("#content").value="";$("#type").value="Hằng ngày";$("#status").value="Đã hoàn thành";$("#performer").value="";$("#note").value="";$("#images").value="";$("#imageInfo").textContent="";$("#saveBtn").textContent="＋ Thêm";$("#cancelEdit").classList.add("hide");if(clearDraft)localStorage.removeItem(DRAFT)}$("#cancelEdit").onclick=resetForm;["date","content","type","status","performer","note"].forEach(id=>$("#"+id).addEventListener("input",saveDraft));$("#images").onchange=e=>$("#imageInfo").textContent=e.target.files.length?e.target.files.length+" hình đã chọn":"";function compressImage(f){return new Promise((ok,no)=>{if(!f.type.startsWith("image/")){no(new Error("Chỉ hỗ trợ file hình ảnh"));return}if(f.size>12000000){no(new Error("Mỗi ảnh cần nhỏ hơn 12 MB"));return}let u=URL.createObjectURL(f),im=new Image;im.onload=()=>{try{let max=1600,scale=Math.min(1,max/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*scale)),h=Math.max(1,Math.round(im.height*scale)),cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);let data=cv.toDataURL("image/jpeg",.78);URL.revokeObjectURL(u);ok(data)}catch(e){URL.revokeObjectURL(u);no(e)}};im.onerror=()=>{URL.revokeObjectURL(u);no(new Error("Không đọc được hình ảnh này"))};im.src=u})}function filesToData(files){return Promise.all([...files].map(compressImage))}$("#taskForm").onsubmit=async e=>{e.preventDefault();if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}try{let a=load(),id=Number($("#editId").value),old=id?a.find(x=>x.id===id):null,imgs=$("#images").files.length?await filesToData($("#images").files):(old?.imgs||[]);let obj={id:id||Date.now(),d:$("#date").value,c:$("#content").value.trim(),t:$("#type").value,s:$("#status").value,n:$("#note").value.trim(),a:$("#performer").value.trim(),imgs,i:imgs.length};if(id)a=a.map(x=>x.id===id?obj:x);else a.unshift(obj);try{save(a)}catch(err){toast("Bộ nhớ trình duyệt đã đầy. Bước Supabase sẽ xử lý ảnh tốt hơn.");return}await syncTaskRecord("upsert_task",obj);resetForm();render();toast(id?"Đã cập nhật công việc":"Đã thêm công việc")}catch(err){toast(err.message)}};function filtered(fx,ex){let q=($("#search").value+" "+$("#globalSearch").value).toLowerCase().trim(),s=$("#filterStatus").value,t=$("#filterType").value,f=fx===undefined?$("#fromDate").value:fx,e=ex===undefined?$("#toDate").value:ex;return load().filter(x=>(!q||(x.c+" "+x.n+" "+x.a).toLowerCase().includes(q))&&(!s||x.s===s)&&(!t||(x.t||"Hằng ngày")===t)&&(!f||x.d>=f)&&(!e||x.d<=e))}function typeBadge(t){t=t||"Hằng ngày";let c=t==="Bảo trì"?"maintenance":t==="Sự cố"?"incident":"daily";return '<span class="typeBadge '+c+'">'+esc(t)+'</span>'}function statusBadge(s){let c=s==="Đã hoàn thành"?"done":s==="Đang thực hiện"?"doing":"waiting";return '<span class="badge '+c+'">'+esc(s)+'</span>'}function thumbs(x){if(!x.imgs?.length)return x.i?"📷 "+x.i:"—";return '<div class="thumbs" onclick="viewImages('+x.id+')">'+x.imgs.slice(0,3).map(v=>'<img src="'+v+'">').join("")+'</div>'}function render(){let all=load(),a=filtered(),td=today();$("#statToday").textContent=all.filter(x=>x.d===td).length;$("#statDoing").textContent=all.filter(x=>x.s==="Đang thực hiện").length;$("#statDone").textContent=all.filter(x=>x.s==="Đã hoàn thành").length;$("#statWait").textContent=all.filter(x=>x.s==="Chờ xử lý").length;$("#count").textContent="("+a.length+")";$("#empty").classList.toggle("hide",a.length>0);$("#tbody").innerHTML=a.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.c)+'</td><td>'+typeBadge(x.t)+'</td><td>'+statusBadge(x.s)+'</td><td>'+fmt(x.d)+'</td><td>'+esc(x.a)+'</td><td>'+thumbs(x)+'</td><td>'+esc(x.n||"—")+'</td><td><div class="rowBtns"><button onclick="editTask('+x.id+')">✎</button><button class="del" onclick="delTask('+x.id+')">×</button></div></td></tr>').join("");$("#mobileCards").innerHTML=a.map(x=>'<div class="mcard"><h4>'+esc(x.c)+'</h4>'+typeBadge(x.t)+' '+statusBadge(x.s)+'<p>▣ '+fmt(x.d)+' · 👤 '+esc(x.a)+'</p><p>'+esc(x.n||"Không có ghi chú")+(x.imgs?.length?" · 📷 "+x.imgs.length+" hình":"")+'</p><div class="foot"><button onclick="editTask('+x.id+')">Sửa ›</button></div></div>').join("")}window.editTask=id=>{if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}let x=load().find(y=>y.id===id);$("#editId").value=x.id;$("#date").value=x.d;$("#content").value=x.c;$("#type").value=x.t||"Hằng ngày";$("#status").value=x.s;$("#performer").value=x.a;$("#note").value=x.n;$("#imageInfo").textContent=x.imgs?.length?"Đang có "+x.imgs.length+" hình":"";$("#saveBtn").textContent="Lưu";$("#cancelEdit").classList.remove("hide");scrollTo({top:0,behavior:"smooth"})};window.delTask=async id=>{if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}if(confirm("Xóa công việc này?")){save(load().filter(x=>x.id!==id));await syncTaskRecord("delete_task",id);render();toast("Đã xóa")}};window.viewImages=id=>{let x=load().find(y=>y.id===id);if(!x?.imgs?.length)return;$("#viewerImages").innerHTML=x.imgs.map(v=>'<img src="'+v+'">').join("");$("#viewer").classList.remove("hide")};$("#closeViewer").onclick=()=>$("#viewer").classList.add("hide");$("#toggleFilter").onclick=e=>{e.stopPropagation();$("#filterBar").classList.toggle("hide")};$("#filterBar").onclick=e=>e.stopPropagation();document.addEventListener("click",e=>{if(!$("#filterBar").classList.contains("hide")&&!e.target.closest(".filterWrap"))$("#filterBar").classList.add("hide")});["search","globalSearch","fromDate","toDate"].forEach(x=>$("#"+x).addEventListener("input",render));["filterStatus","filterType"].forEach(x=>$("#"+x).onchange=render);function iso(d){return d.toLocaleDateString("en-CA")}function rangeDates(kind){let d=new Date(),from="",to="";if(kind==="today"){from=to=iso(d)}else if(kind==="week"){let day=(d.getDay()+6)%7,a=new Date(d);a.setDate(d.getDate()-day);let b=new Date(a);b.setDate(a.getDate()+6);from=iso(a);to=iso(b)}else if(kind==="month"){let a=new Date(d.getFullYear(),d.getMonth(),1),b=new Date(d.getFullYear(),d.getMonth()+1,0);from=iso(a);to=iso(b)}return{from,to}}$("#quickRange").onchange=()=>{let v=$("#quickRange").value;if(!v)return;let r=rangeDates(v);$("#fromDate").value=r.from;$("#toDate").value=r.to;render()};$("#clear").onclick=()=>{$("#search").value=$("#globalSearch").value=$("#fromDate").value=$("#toDate").value=$("#filterStatus").value=$("#filterType").value=$("#quickRange").value="";render()};function reportHtml(a){let from=$("#fromDate").value,to=$("#toDate").value,period=from||to?((from?fmt(from):"Đầu kỳ")+" - "+(to?fmt(to):"Hiện tại")):"Toàn bộ dữ liệu";let done=a.filter(x=>x.s==="Đã hoàn thành").length,doing=a.filter(x=>x.s==="Đang thực hiện").length,wait=a.filter(x=>x.s==="Chờ xử lý").length;return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo công việc kỹ thuật</title><style>
@page{size:A4;margin:14mm 13mm 16mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1f2937;font-size:11px;margin:0}.header{border-bottom:3px solid #123d6b;padding-bottom:10px;display:flex;justify-content:space-between;align-items:flex-start}.brand{font-weight:800;color:#123d6b;font-size:16px}.brand small{display:block;font-size:8px;letter-spacing:.7px;color:#64748b;margin-top:3px}.doc{text-align:right;font-size:9px;color:#64748b}.title{text-align:center;padding:15px 0 12px}.title h1{font-size:19px;color:#123d6b;margin:0 0 5px}.title p{margin:0;font-size:10px;color:#64748b}.summary{display:grid;grid-template-columns:2fr repeat(4,1fr);border:1px solid #cbd5e1;margin-bottom:14px}.summary>div{padding:8px;border-right:1px solid #cbd5e1}.summary>div:last-child{border:0}.summary span{display:block;color:#64748b;font-size:8px;text-transform:uppercase}.summary b{display:block;margin-top:3px;font-size:12px;color:#123d6b}.job{page-break-inside:avoid;border:1px solid #cbd5e1;margin:0 0 11px}.jobHead{background:#edf4fb;padding:7px 9px;border-bottom:1px solid #cbd5e1;display:flex;gap:7px;align-items:flex-start}.no{background:#123d6b;color:#fff;min-width:21px;height:21px;border-radius:50%;display:grid;place-items:center;font-size:9px}.jobHead h3{margin:2px 0 0;font-size:11px;color:#173d67}.details{display:grid;grid-template-columns:1fr 1fr 1fr;padding:7px 9px;gap:5px 12px}.details div{font-size:9px}.details span{color:#64748b}.note{margin:0 9px 8px;padding:7px;background:#f8fafc;border-left:3px solid #94a3b8;font-size:9px}.photos{padding:0 9px 9px;display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.photos img{width:100%;height:185px;object-fit:contain;border:1px solid #d8e0e8;background:#fff}.photoTitle{grid-column:1/-1;font-weight:700;font-size:9px;color:#475569}.sign{page-break-inside:avoid;display:flex;justify-content:space-around;text-align:center;margin-top:25px;font-size:10px}.sign div{width:38%}.sign small{display:block;margin-top:4px;color:#64748b}.signSpace{height:60px}.foot{position:fixed;bottom:-8mm;left:0;right:0;text-align:center;color:#94a3b8;font-size:8px}
</style></head><body><div class="header"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div class="doc"><b>TÒA NHÀ ${esc(currentBuilding.name).toLocaleUpperCase("vi-VN")}</b><br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO CÔNG VIỆC KỸ THUẬT</h1><p>Thời gian báo cáo: <b>${period}</b></p></div><div class="summary"><div><span>Tòa nhà</span><b>${esc(currentBuilding.name)}</b></div><div><span>Tổng công việc</span><b>${a.length}</b></div><div><span>Hoàn thành</span><b>${done}</b></div><div><span>Đang xử lý</span><b>${doing}</b></div><div><span>Chờ xử lý</span><b>${wait}</b></div></div>
${a.map((x,i)=>`<section class="job"><div class="jobHead"><div class="no">${i+1}</div><h3>${esc(x.c)}</h3></div><div class="details"><div><span>Ngày thực hiện:</span> <b>${fmt(x.d)}</b></div><div><span>Loại công việc:</span> <b>${esc(x.t||"Hằng ngày")}</b></div><div><span>Trạng thái:</span> <b>${esc(x.s)}</b></div><div><span>Người thực hiện:</span> <b>${esc(x.a||"—")}</b></div></div>${x.n?`<div class="note"><b>Ghi chú:</b> ${esc(x.n)}</div>`:""}${x.imgs?.length?`<div class="photos"><div class="photoTitle">HÌNH ẢNH THỰC TẾ</div>${x.imgs.map(v=>'<img src="'+v+'">').join("")}</div>`:""}</section>`).join("")}<div class="sign"><div><b>NGƯỜI LẬP BÁO CÁO</b><small>(Ký và ghi rõ họ tên)</small><div class="signSpace"></div></div><div><b>ĐẠI DIỆN BAN QUẢN LÝ</b><small>(Ký và ghi rõ họ tên)</small><div class="signSpace"></div></div></div><div class="foot">ESTA Building Management · ${esc(currentBuilding.name)}</div><script>window.onload=()=>setTimeout(()=>window.print(),700)<\/script></body></html>`}function openReport(a){if(!a.length){toast("Không có dữ liệu để xuất PDF");return}let w=open("","_blank");w.document.write(reportHtml(a));w.document.close()}$("#exportBtn").onclick=()=>$("#exportModal").classList.remove("hide");$("#closeExport").onclick=()=>$("#exportModal").classList.add("hide");$("#exportModal").onclick=e=>{if(e.target===$("#exportModal"))$("#exportModal").classList.add("hide")};document.querySelectorAll(".exportChoices button").forEach(b=>b.onclick=()=>{let kind=b.dataset.range,a;if(kind==="current")a=filtered();else{let r=rangeDates(kind);a=filtered(r.from,r.to)}$("#exportModal").classList.add("hide");openReport(a)});document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#viewer").classList.add("hide");$("#exportModal").classList.add("hide")}});$("#today").textContent=new Date().toLocaleDateString("vi-VN")

/* ===== MODULE NĂNG LƯỢNG ===== */
const energyStorageKey=()=>currentBuilding.id==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+currentBuilding.id;
let energyType="electric";
const ENERGY_META={
 electric:{name:"Chỉ số điện",form:"Ghi chỉ số điện",unit:"kWh",valueLabel:"Chỉ số điện (kWh)"},
 water:{name:"Chỉ số nước",form:"Ghi chỉ số nước",unit:"m³",valueLabel:"Chỉ số nước (m³)"},
 solar:{name:"Năng lượng mặt trời",form:"Ghi sản lượng điện mặt trời",unit:"kWh",valueLabel:"Sản lượng điện (kWh)"}
};
function energyLoad(){try{const a=JSON.parse(localStorage.getItem(energyStorageKey())||"[]");return Array.isArray(a)?a:[]}catch(e){return[]}}
function energySaveAll(a){localStorage.setItem(energyStorageKey(),JSON.stringify(a))}
function showModule(name){
 const energy=name==="energy";
 $("#adminPage").classList.add("hide");
 $("#topAdminTitle").classList.add("hide");
 $("#navAdmin").classList.remove("active");
 $("#app").classList.remove("adminMode");
 $("#workPage").classList.toggle("hide",energy);
 $("#workHero").classList.toggle("hide",energy);
 $("#energyPage").classList.toggle("hide",!energy);
 $("#energyHero").classList.toggle("hide",!energy);
 $("#navWork").classList.toggle("active",!energy);
 $("#navEnergy").classList.toggle("active",energy);
 $("#topWorkTitle").classList.toggle("hide",energy);
 $("#topEnergyTitle").classList.toggle("hide",!energy);
 $("#app").classList.toggle("energyMode",energy);
 document.querySelector("aside").classList.remove("open");
 if(energy)renderEnergy();
}
$("#navAdmin").onclick=()=>openAdminPortal();
$("#navWork").onclick=()=>showModule("work");
$("#navEnergy").onclick=()=>showModule("energy");
$("#energyToday").textContent=new Date().toLocaleDateString("vi-VN");
document.querySelectorAll("[data-energy-type]").forEach(b=>b.onclick=()=>{
 energyType=b.dataset.energyType;
 document.querySelectorAll("[data-energy-type]").forEach(x=>x.classList.toggle("active",x===b));
 resetEnergyForm();
 renderEnergy();
});
function resetEnergyForm(){
 const m=ENERGY_META[energyType];
 $("#energyEditId").value="";
 $("#energyDate").value=today();
 $("#energyValue").value="";
 $("#energyNote").value="";
 $("#energyImage").value="";
 $("#energyImagePreview").innerHTML="";
 $("#energySaveBtn").textContent="Lưu";
 $("#energyCancelEdit").classList.add("hide");
 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=m.valueLabel;
 $("#energyValueColumn").textContent="Chỉ số ("+m.unit+")";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();
}
$("#energyCancelEdit").onclick=resetEnergyForm;
$("#energyImage").onchange=async e=>{
 const f=e.target.files[0];
 if(!f){$("#energyImagePreview").innerHTML="";return}
 try{
  const data=await compressImage(f);
  $("#energyImagePreview").innerHTML='<img src="'+data+'" alt="Ảnh đồng hồ"><span>Ảnh đã chọn</span>';
 }catch(err){toast(err.message);e.target.value=""}
};
$("#energyForm").onsubmit=async e=>{
 e.preventDefault();
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 try{
  const id=$("#energyEditId").value;
  let image="";
  const f=$("#energyImage").files[0];
  if(f)image=await compressImage(f);
  const all=energyLoad();
  const old=id?all.find(x=>String(x.id)===String(id)):null;
  const obj={
    id:id||Date.now(),
    type:energyType,
    date:$("#energyDate").value,
    value:Number($("#energyValue").value),
    note:$("#energyNote").value.trim(),
    image:image||(old?.image||""),
    createdAt:old?.createdAt||new Date().toISOString()
  };
  let next=id?all.map(x=>String(x.id)===String(id)?obj:x):[obj,...all];
  energySaveAll(next);
  await syncEnergyRecord("upsert_energy",obj);
  resetEnergyForm();renderEnergy();toast(id?"Đã cập nhật chỉ số":"Đã lưu chỉ số");
 }catch(err){toast(err.message||"Không thể lưu dữ liệu")}
};
function energyRangeFiltered(){
 let a=energyLoad().filter(x=>x.type===energyType);
 const f=$("#energyFromDate").value,e=$("#energyToDate").value;
 if(f)a=a.filter(x=>x.date>=f);
 if(e)a=a.filter(x=>x.date<=e);
 return a.sort((x,y)=>x.date.localeCompare(y.date)||Number(x.id)-Number(y.id));
}
function energyFmt(v){return Number(v).toLocaleString("vi-VN",{maximumFractionDigits:2})}
function weekday(d){return new Date(d+"T00:00:00").toLocaleDateString("vi-VN",{weekday:"long"})}
function energyRows(){
 const all=energyLoad().filter(x=>x.type===energyType).sort((a,b)=>a.date.localeCompare(b.date)||Number(a.id)-Number(b.id));
 const prevMap={};
 all.forEach((x,i)=>prevMap[String(x.id)]=i?x.value-all[i-1].value:null);
 return energyRangeFiltered().map(x=>({...x,diff:prevMap[String(x.id)]}));
}
function renderEnergy(){
 const m=ENERGY_META[energyType];
 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=m.valueLabel;
 $("#energyValueColumn").textContent="Chỉ số ("+m.unit+")";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();
 const rows=energyRows(),latest=rows.length?rows[rows.length-1]:null;
 const usableDiffs=rows.filter(x=>typeof x.diff==="number"&&Number.isFinite(x.diff)&&x.diff>=0);
 const totalUse=usableDiffs.length?usableDiffs.reduce((s,x)=>s+x.diff,0):null;
 const totalLabel=energyType==="electric"?"Tổng điện":energyType==="water"?"Tổng nước":"Tổng điện mặt trời";
 $("#energyRecordCount").textContent=rows.length;
 $("#energyLatestValue").textContent=latest?energyFmt(latest.value)+" "+m.unit:"—";
 $("#energyPeriodUse").textContent=totalUse!==null?energyFmt(totalUse)+" "+m.unit:"—";
 const totalBox=$("#energyTotalInline");
 if(totalBox){totalBox.querySelector("span").textContent=totalLabel;totalBox.querySelector("strong").textContent=totalUse!==null?energyFmt(totalUse)+" "+m.unit:"—"}
 $("#energyEmpty").classList.toggle("hide",rows.length>0);
 $("#energyTbody").innerHTML=rows.map(x=>{
   const sun=new Date(x.date+"T00:00:00").getDay()===0;
   const diff=x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff);
   const img=x.image?'<img class="energyThumb" src="'+x.image+'" onclick="viewEnergyImage(\''+x.id+'\')">':"—";
   return '<tr class="'+(sun?"sunday":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td><b>'+energyFmt(x.value)+'</b></td><td>'+diff+'</td><td>'+img+'</td><td>'+esc(x.note||"—")+'</td><td><div class="rowBtns"><button onclick="editEnergy(\''+x.id+'\')">✎</button><button class="del" onclick="deleteEnergy(\''+x.id+'\')">×</button></div></td></tr>'
 }).join("");
 $("#energyMobileCards").innerHTML=rows.map(x=>'<div class="mcard '+(new Date(x.date+"T00:00:00").getDay()===0?"sunday":"")+'"><h4>'+fmt(x.date)+' · '+weekday(x.date)+'</h4><p><b>'+energyFmt(x.value)+' '+m.unit+'</b> · Chênh lệch: '+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</p><p>'+esc(x.note||"Không có ghi chú")+'</p><div class="foot"><button onclick="editEnergy(\''+x.id+'\')">Sửa ›</button></div></div>').join("");
 $("#energySummaryText").textContent=rows.length?"Đang hiển thị "+rows.length+" bản ghi · Tổng được tính theo bộ lọc hiện tại.":"Theo dõi lịch sử chỉ số và mức tiêu thụ theo ngày.";
}
window.editEnergy=id=>{
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 const x=energyLoad().find(v=>String(v.id)===String(id));if(!x)return;
 energyType=x.type;
 document.querySelectorAll("[data-energy-type]").forEach(b=>b.classList.toggle("active",b.dataset.energyType===energyType));
 $("#energyEditId").value=x.id;$("#energyDate").value=x.date;$("#energyValue").value=x.value;$("#energyNote").value=x.note||"";
 $("#energyImagePreview").innerHTML=x.image?'<img src="'+x.image+'" alt="Ảnh đồng hồ"><span>Ảnh hiện tại</span>':"";
 $("#energySaveBtn").textContent="Cập nhật";$("#energyCancelEdit").classList.remove("hide");renderEnergy();
 window.scrollTo({top:0,behavior:"smooth"});
};
window.deleteEnergy=async id=>{if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}if(!confirm("Xóa bản ghi chỉ số này?"))return;energySaveAll(energyLoad().filter(x=>String(x.id)!==String(id)));await syncEnergyRecord("delete_energy",id);renderEnergy();toast("Đã xóa bản ghi")};
window.viewEnergyImage=id=>{const x=energyLoad().find(v=>String(v.id)===String(id));if(!x?.image)return;$("#viewerImages").innerHTML='<img src="'+x.image+'">';$("#viewer").classList.remove("hide")};
function setEnergyRange(kind){
 document.querySelectorAll("[data-erange]").forEach(b=>b.classList.toggle("active",b.dataset.erange===kind));
 if(kind==="all"){$("#energyFromDate").value="";$("#energyToDate").value=""}
 else{const r=rangeDates(kind);$("#energyFromDate").value=r.from;$("#energyToDate").value=r.to}
 renderEnergy();
}
document.querySelectorAll("[data-erange]").forEach(b=>b.onclick=()=>setEnergyRange(b.dataset.erange));
$("#energyApplyFilter").onclick=renderEnergy;
$("#energyClearFilter").onclick=()=>setEnergyRange("all");
function energyReportHtml(rows){
 const m=ENERGY_META[energyType],f=$("#energyFromDate").value,e=$("#energyToDate").value,period=f||e?((f?fmt(f):"Đầu kỳ")+" - "+(e?fmt(e):"Hiện tại")):"Toàn bộ dữ liệu";
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo '+m.name+'</title><style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#1f2937;font-size:10px}.head{display:flex;justify-content:space-between;border-bottom:3px solid #0e4d7e;padding-bottom:9px}.brand{font-size:18px;font-weight:800;color:#0e4d7e}.brand small{display:block;font-size:8px;color:#64748b;letter-spacing:1px}.title{text-align:center;margin:16px 0}.title h1{font-size:18px;color:#0e4d7e;margin:0 0 5px}.title p{margin:0;color:#64748b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:7px;text-align:left}th{background:#edf4fb;color:#214d72}.sun{background:#fff7d6}.photo{width:75px;height:55px;object-fit:cover}.foot{margin-top:25px;text-align:center;color:#94a3b8;font-size:8px}</style></head><body><div class="head"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div>'+esc(currentBuilding.name).toLocaleUpperCase("vi-VN")+'<br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO '+m.name.toUpperCase()+'</h1><p>Thời gian: <b>'+period+'</b></p></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số ('+m.unit+')</th><th>Chênh lệch</th><th>Hình ảnh</th><th>Ghi chú</th></tr></thead><tbody>'+rows.map(x=>'<tr class="'+(new Date(x.date+"T00:00:00").getDay()===0?"sun":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td><b>'+energyFmt(x.value)+'</b></td><td>'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</td><td>'+(x.image?'<img class="photo" src="'+x.image+'">':"—")+'</td><td>'+esc(x.note||"—")+'</td></tr>').join("")+'</tbody></table><div class="foot">ESTA · Quản lý năng lượng · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>'
}
$("#energyExportPdf").onclick=()=>{const rows=energyRows();if(!rows.length){toast("Không có dữ liệu để xuất PDF");return}const w=open("","_blank");w.document.write(energyReportHtml(rows));w.document.close()};

function energyRowsForTypeRange(type,from,to){
 const all=energyLoad().filter(x=>x.type===type).sort((a,b)=>a.date.localeCompare(b.date)||Number(a.id)-Number(b.id));
 return all.filter(x=>(!from||x.date>=from)&&(!to||x.date<=to)).map(x=>{
   const idx=all.findIndex(v=>String(v.id)===String(x.id));
   const diff=idx>0?Number(x.value)-Number(all[idx-1].value):null;
   return {...x,diff};
 });
}
function combinedReportHtml(kind){
 let from="",to="",period="Toàn bộ dữ liệu";
 if(kind!=="all"){const r=rangeDates(kind);from=r.from;to=r.to;period=fmt(from)+" - "+fmt(to)}
 const tasks=load().filter(x=>(!from||x.d>=from)&&(!to||x.d<=to)).sort((a,b)=>a.d.localeCompare(b.d));
 const elec=energyRowsForTypeRange("electric",from,to),water=energyRowsForTypeRange("water",from,to);
 const total=(rows)=>rows.filter(x=>typeof x.diff==="number"&&Number.isFinite(x.diff)&&x.diff>=0).reduce((s,x)=>s+x.diff,0);
 const totalElec=total(elec),totalWater=total(water);
 const taskRows=tasks.length?tasks.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+fmt(x.d)+'</td><td>'+esc(x.c)+'</td><td>'+esc(x.t)+'</td><td>'+esc(x.s)+'</td><td>'+esc(x.a||"—")+'</td><td>'+esc(x.n||"—")+'</td></tr>').join(""):'<tr><td colspan="7">Không có công việc trong kỳ.</td></tr>';
 const meterTable=(rows,unit)=>rows.length?rows.map(x=>'<tr class="'+(new Date(x.date+"T00:00:00").getDay()===0?"sun":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td>'+energyFmt(x.value)+'</td><td>'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</td><td>'+esc(x.note||"—")+'</td></tr>').join(""):'<tr><td colspan="5">Không có dữ liệu trong kỳ.</td></tr>';
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo tổng hợp ESTA</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1f2937;font-size:9px;margin:0}.head{display:flex;justify-content:space-between;border-bottom:3px solid #123d6b;padding-bottom:8px}.brand{font-size:18px;font-weight:800;color:#123d6b}.brand small{display:block;font-size:7px;letter-spacing:1px;color:#64748b}.title{text-align:center;margin:14px 0}.title h1{font-size:18px;color:#123d6b;margin:0 0 4px}.title p{margin:0;color:#64748b}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}.summary div{border:1px solid #cbd5e1;border-radius:5px;padding:8px}.summary span{display:block;color:#64748b;font-size:7px}.summary b{display:block;margin-top:3px;color:#123d6b;font-size:12px}.section{page-break-before:auto;margin-top:15px}.section.page{page-break-before:always}.section h2{font-size:13px;color:#123d6b;margin:0 0 7px;padding-bottom:4px;border-bottom:2px solid #dbe7f0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px;vertical-align:top}th{background:#edf4fb;color:#214d72}.sun{background:#fff7d6}.tot{margin:6px 0 8px;text-align:right;font-size:10px;color:#123d6b}.foot{margin-top:18px;text-align:center;color:#94a3b8;font-size:7px}</style></head><body><div class="head"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div>'+esc(currentBuilding.name).toLocaleUpperCase("vi-VN")+'<br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO TỔNG HỢP KỸ THUẬT</h1><p>Thời gian: <b>'+period+'</b></p></div><div class="summary"><div><span>CÔNG VIỆC</span><b>'+tasks.length+'</b></div><div><span>TỔNG ĐIỆN</span><b>'+energyFmt(totalElec)+' kWh</b></div><div><span>TỔNG NƯỚC</span><b>'+energyFmt(totalWater)+' m³</b></div></div><div class="section"><h2>1. Công việc kỹ thuật</h2><table><thead><tr><th>STT</th><th>Ngày</th><th>Nội dung</th><th>Loại</th><th>Trạng thái</th><th>Người thực hiện</th><th>Ghi chú</th></tr></thead><tbody>'+taskRows+'</tbody></table></div><div class="section page"><h2>2. Chỉ số điện</h2><div class="tot"><b>Tổng tiêu thụ: '+energyFmt(totalElec)+' kWh</b></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số (kWh)</th><th>Chênh lệch</th><th>Ghi chú</th></tr></thead><tbody>'+meterTable(elec,"kWh")+'</tbody></table></div><div class="section page"><h2>3. Chỉ số nước</h2><div class="tot"><b>Tổng tiêu thụ: '+energyFmt(totalWater)+' m³</b></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số (m³)</th><th>Chênh lệch</th><th>Ghi chú</th></tr></thead><tbody>'+meterTable(water,"m³")+'</tbody></table></div><div class="foot">ESTA Building Management · Báo cáo tổng hợp · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),700)<\/script></body></html>';
}
document.querySelectorAll("[data-combined-range]").forEach(b=>b.onclick=()=>{
 const kind=b.dataset.combinedRange;
 $("#exportModal").classList.add("hide");
 const w=open("","_blank");
 if(!w){toast("Trình duyệt đang chặn cửa sổ xuất PDF");return}
 w.document.write(combinedReportHtml(kind));w.document.close();
});

resetEnergyForm();
renderEnergy();
$("#app").addEventListener("input",e=>{if(shouldAutoCapitalize(e.target))applyAutoCapitalize(e.target)});


/* ===== ADMIN TRUNG TÂM / ĐA DỰ ÁN ===== */
async function adminApi(action,payload={}){
 if(!centralSession?.access_token)throw new Error("Chưa kích hoạt hoặc đăng nhập Admin trung tâm");
 return sbFetch("/functions/v1/admin-users",{method:"POST",token:centralSession.access_token,body:{action,...payload}});
}
function adminProjectCard(b){
 const safeId=esc(b.id),safeName=esc(b.name||b.id);
 return '<div class="adminProjectCard"><button class="adminProjectOpen" type="button" onclick="adminOpenBuilding(\''+safeId+'\')"><div class="adminProjectIcon">▥</div><div><small>'+safeId+'</small><h3>'+safeName+'</h3><p>Mở giao diện Công việc & Năng lượng</p></div><span>→</span></button></div>';
}
function renderAdminProjects(){
 const list=currentAccount?.buildings||[];
 $("#adminProjectCount").textContent=list.length+" dự án";
 $("#adminProjectGrid").innerHTML=list.length?list.map(adminProjectCard).join(""):'<div class="empty">Chưa có dự án.</div>';
 $("#adminBuildingSelect").innerHTML=list.map(b=>'<option value="'+esc(b.id)+'">'+esc(b.name||b.id)+'</option>').join("");
}
async function refreshAdminBuildings(){
 if(!centralSession?.access_token){renderAdminProjects();return}
 currentAccount=await loadCentralAccount(centralSession.access_token);
 renderAdminProjects();
 renderSettingsProjectList();
}
function setSettingsTab(name){
 document.querySelectorAll("[data-settings-tab]").forEach(b=>b.classList.toggle("active",b.dataset.settingsTab===name));
 $("#settingsProjects").classList.toggle("hide",name!=="projects");
 $("#settingsAccounts").classList.toggle("hide",name!=="accounts");
 $("#settingsTrash").classList.toggle("hide",name!=="trash");
 if(name==="projects")renderSettingsProjectList();
 if(name==="accounts")renderAdminUsers();
 if(name==="trash")renderTrashProjects();
}
function openAdminSettings(tab="projects"){
 $("#adminSettingsModal").classList.remove("hide");
 setSettingsTab(tab);
}
$("#adminSettingsBtn").onclick=()=>openAdminSettings("projects");
$("#closeAdminSettings").onclick=()=>$("#adminSettingsModal").classList.add("hide");
$("#adminSettingsModal").onclick=e=>{if(e.target===$("#adminSettingsModal"))$("#adminSettingsModal").classList.add("hide")};
document.querySelectorAll("[data-settings-tab]").forEach(b=>b.onclick=()=>setSettingsTab(b.dataset.settingsTab));

function renderSettingsProjectList(){
 const box=$("#settingsProjectList"),list=currentAccount?.buildings||[];
 if(!list.length){box.innerHTML='<div class="empty">Chưa có dự án đang hoạt động.</div>';return}
 box.innerHTML=list.map(b=>'<div class="settingsRow"><div class="settingsRowMain"><div class="settingsRowIcon">▥</div><div><b>'+esc(b.name||b.id)+'</b><small>'+esc(b.id)+'</small></div></div><button class="settingsDeleteBtn" type="button" onclick="adminDeleteBuilding(\''+esc(b.id)+'\',\''+esc(b.name||b.id).replace(/'/g,"&#39;")+'\')">🗑 Xóa</button></div>').join("");
}
$("#projectForm").onsubmit=async e=>{
 e.preventDefault();
 if(!centralSession?.access_token){$("#adminSettingsModal").classList.add("hide");$("#adminSetupModal").classList.remove("hide");return}
 const msg=$("#projectFormMessage"),btn=$("#projectForm button[type=submit]");
 msg.textContent="Đang tạo dự án...";btn.disabled=true;
 try{
   const id=$("#projectCode").value.trim().toUpperCase().replace(/\s+/g,"");
   const name=sentenceCapitalizeText($("#projectName").value.trim());
   await adminApi("create_building",{id,name});
   $("#projectForm").reset();msg.textContent="";
   await refreshAdminBuildings();
   toast("Đã thêm dự án "+name);
 }catch(err){msg.textContent=err.message}
 finally{btn.disabled=false}
};
window.adminDeleteBuilding=async(id,name)=>{
 if(!centralSession?.access_token){$("#adminSettingsModal").classList.add("hide");$("#adminSetupModal").classList.remove("hide");return}
 const typed=prompt("Dự án sẽ được chuyển vào Thùng rác và có thể khôi phục lại.\n\nĐể xác nhận, nhập chính xác tên dự án:\n"+name);
 if(typed===null)return;
 if(typed.trim()!==name){toast("Tên xác nhận không đúng. Không xóa dự án.");return}
 try{
   await adminApi("delete_building",{id,confirm_name:name});
   await refreshAdminBuildings();
   await renderTrashProjects();
   await renderAdminUsers();
   toast("Đã chuyển "+name+" vào Thùng rác");
 }catch(err){toast(err.message)}
};
async function renderTrashProjects(){
 const box=$("#trashProjectList");
 if(!centralSession?.access_token){box.innerHTML='<div class="adminNeedsCentral"><b>Chưa kết nối Admin trung tâm</b><p>Kích hoạt Admin trung tâm để sử dụng Thùng rác.</p></div>';return}
 box.innerHTML='<div class="empty">Đang tải Thùng rác...</div>';
 try{
   const data=await adminApi("list_deleted_buildings"),list=data.buildings||[];
   box.innerHTML=list.length?list.map(b=>{
     const when=b.deleted_at?new Date(b.deleted_at).toLocaleString("vi-VN"):"";
     return '<div class="settingsRow trashRow"><div class="settingsRowMain"><div class="settingsRowIcon trashIcon">🗑</div><div><b>'+esc(b.name||b.id)+'</b><small>'+esc(b.id)+(when?" · Đã xóa "+esc(when):"")+'</small></div></div><button class="settingsRestoreBtn" type="button" onclick="adminRestoreBuilding(\''+esc(b.id)+'\')">↺ Khôi phục</button></div>';
   }).join(""):'<div class="empty">Thùng rác đang trống.</div>';
 }catch(err){box.innerHTML='<div class="empty">'+esc(err.message)+'</div>'}
}
$("#refreshTrash").onclick=()=>renderTrashProjects();
window.adminRestoreBuilding=async id=>{
 if(!centralSession?.access_token)return;
 try{
   const r=await adminApi("restore_building",{id});
   await refreshAdminBuildings();
   await renderTrashProjects();
   toast("Đã khôi phục dự án "+(r.building?.name||id));
 }catch(err){toast(err.message)}
};

async function renderAdminUsers(){
 const box=$("#adminUsersList");
 if(!currentAccount?.is_admin){box.innerHTML='<div class="empty">Không có quyền Admin.</div>';return}
 if(!centralSession?.access_token){
   box.innerHTML='<div class="adminNeedsCentral"><b>Admin cục bộ đang hoạt động</b><p>Kích hoạt Admin trung tâm để tạo và quản lý tài khoản thật cho các dự án.</p><button type="button" onclick="document.querySelector(\'#adminSettingsModal\').classList.add(\'hide\');document.querySelector(\'#adminSetupModal\').classList.remove(\'hide\')">Kích hoạt ngay</button></div>';
   return;
 }
 box.innerHTML='<div class="empty">Đang tải tài khoản...</div>';
 try{
   const data=await adminApi("list"),users=data.users||[];
   box.innerHTML=users.length?users.map(u=>{
     const projects=(u.buildings||[]).map(b=>'<span>'+esc(b.name||b.id)+'</span>').join("")||'<span>Chưa phân dự án</span>';
     const name=esc(u.display_name||u.username||u.email||"Tài khoản");
     return '<div class="adminUserRow"><div class="adminUserMain"><div class="adminAvatar">'+name.slice(0,1).toLocaleUpperCase("vi-VN")+'</div><div><b>'+name+'</b><small>'+(u.username?esc(u.username):esc(u.email||""))+'</small><div class="adminUserProjects">'+projects+'</div></div></div><div class="adminUserActions">'+(u.is_admin?'<span class="adminBadge">ADMIN</span>':'<button type="button" onclick="adminResetPassword(\''+u.id+'\')">Đổi mật khẩu</button><button type="button" class="'+(u.active?"danger":"success")+'" onclick="adminToggleUser(\''+u.id+'\','+(!u.active)+')">'+(u.active?"Khóa":"Mở khóa")+'</button><button type="button" class="danger" onclick="adminDeleteUser(\''+u.id+'\',\''+name.replace(/'/g,"&#39;")+'\')">🗑 Xóa</button>')+'</div></div>';
   }).join(""):'<div class="empty">Chưa có tài khoản kỹ thuật.</div>';
 }catch(err){box.innerHTML='<div class="empty">'+esc(err.message)+'</div>'}
}
async function renderAdminPortal(){
 renderAdminProjects();
 const connected=!!centralSession?.access_token;
 $("#adminConnection").className="adminConnection "+(connected?"ok":"warn");
 $("#adminConnection").textContent=connected?"Admin trung tâm đã kết nối":"Đang dùng Admin cục bộ";
 $("#adminActivateCentral").classList.toggle("hide",connected);
 $("#adminCreateBtn").disabled=!connected;
 $("#adminCreateHint").textContent=connected?"Tài khoản mới sẽ được tạo trên hệ thống trung tâm và chỉ truy cập dự án đã chọn.":"Kích hoạt Admin trung tâm trước khi tạo tài khoản dự án.";
}
$("#adminActivateCentral").onclick=()=>$("#adminSetupModal").classList.remove("hide");
$("#refreshAdminUsers").onclick=()=>renderAdminUsers();
$("#adminCreateAccountForm").onsubmit=async e=>{
 e.preventDefault();
 const btn=$("#adminCreateBtn");if(!centralSession?.access_token){$("#adminSettingsModal").classList.add("hide");$("#adminSetupModal").classList.remove("hide");return}
 btn.disabled=true;btn.textContent="Đang tạo...";
 try{
   const payload={
     username:$("#adminUsername").value.trim().toLowerCase(),
     password:$("#adminPassword").value,
     display_name:$("#adminDisplayName").value.trim(),
     building_ids:[$("#adminBuildingSelect").value],
     role:$("#adminRole").value
   };
   await adminApi("create",payload);
   $("#adminCreateAccountForm").reset();
   renderAdminProjects();
   await renderAdminUsers();
   toast("Đã tạo tài khoản kỹ thuật");
 }catch(err){toast(err.message)}
 finally{btn.disabled=false;btn.textContent="＋ Tạo tài khoản"}
};
window.adminDeleteUser=async(id,name)=>{
 if(!centralSession?.access_token)return;
 if(!confirm("Xóa vĩnh viễn tài khoản kỹ thuật \""+name+"\"?\n\nTài khoản này sẽ không thể đăng nhập lại."))return;
 try{await adminApi("delete_user",{user_id:id});await renderAdminUsers();toast("Đã xóa tài khoản "+name)}catch(err){toast(err.message)}
};
window.adminResetPassword=async id=>{
 if(!centralSession?.access_token)return;
 const p=prompt("Nhập mật khẩu mới (tối thiểu 6 ký tự):");if(!p)return;
 try{await adminApi("reset_password",{user_id:id,password:p});toast("Đã đổi mật khẩu")}catch(err){toast(err.message)}
};
window.adminToggleUser=async(id,active)=>{
 if(!centralSession?.access_token)return;
 try{await adminApi("set_active",{user_id:id,active});await renderAdminUsers();toast(active?"Đã mở khóa tài khoản":"Đã khóa tài khoản")}catch(err){toast(err.message)}
};

function canProjectEdit(){return !!(currentAccount?.is_admin||currentBuilding.role!=="viewer")}
function setProjectEditability(){
 const canEdit=canProjectEdit();
 ["taskForm","energyForm"].forEach(fid=>{
   const f=$("#"+fid);if(!f)return;
   f.querySelectorAll("input,select,button").forEach(el=>{if(el.id!=="cancelEdit"&&el.id!=="energyCancelEdit")el.disabled=!canEdit});
 });
 if($("#backupBtn"))$("#backupBtn").disabled=!canEdit;
 if($("#restoreBtn"))$("#restoreBtn").disabled=!canEdit;
}
const oldApplyBuildingUI=applyBuildingUI;
applyBuildingUI=function(){
 oldApplyBuildingUI();
 setProjectEditability();
 const role=currentAccount?.is_admin?"Quản trị viên":(currentBuilding.role==="viewer"?"Chỉ xem":"Kỹ thuật viên");
 $("#headerRole").textContent=role+" · "+currentBuilding.id;
};

(async function initMultiProjectSession(){
 const restored=await restoreCentral();
 if(restored)window.enterAccount(restored.account,restored.session);
})();
