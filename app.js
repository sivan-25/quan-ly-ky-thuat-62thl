const $=s=>document.querySelector(s);
const SB_URL="https://upcjcrycahdfroxggsdz.supabase.co";
const SB_KEY="sb_publishable_WQiZyrTXCeRr6BgfXAtQSg_zX_eUBsa";
let me=null,centralSession=null,currentAccount=null,currentBuilding={id:"62THL",name:"62 Trần Huy Liệu",role:"editor"};

const taskStorageKeyFor=id=>id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+id;
const taskStorageKey=()=>taskStorageKeyFor(currentBuilding.id);
const load=()=>{try{let v=JSON.parse(localStorage.getItem(taskStorageKey())||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}};
const save=a=>localStorage.setItem(taskStorageKey(),JSON.stringify(a));
const today=()=>new Date().toLocaleDateString("en-CA");
const fmt=d=>new Date(d+"T00:00").toLocaleDateString("vi-VN");
const esc=(s="")=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(s){$("#toast").textContent=s;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1800)}

function sentenceCapitalizeText(value){
 let out="",capitalize=true;
 for(const ch of String(value??"")){
   if(capitalize&&/\p{L}/u.test(ch)){
     out+=ch.toLocaleUpperCase("vi-VN");
     capitalize=false;
     continue;
   }
   out+=ch;
   if(ch==="."||ch==="!"||ch==="?")capitalize=true;
 }
 return out;
}
function shouldAutoCapitalize(el){
 if(!el||!el.matches)return false;
 if(el.dataset?.noAutoCapitalize==="1")return false;
 if(el.closest("#login,#adminSetupModal"))return false;
 if(el.tagName==="TEXTAREA")return true;
 if(el.tagName!=="INPUT")return false;
 const type=(el.getAttribute("type")||"text").toLowerCase();
 if(type!=="text")return false;
 const excludedIds=new Set([
   "search","globalSearch","energyQuickSearch",
   "inventoryMaterialSearch","inventoryToolSearch",
   "maintenanceSearch","contractorSearch","contractorJobSearch",
   "user","pass","adminUsername","adminPassword",
   "setupAdminEmail","setupAdminPassword"
 ]);
 if(excludedIds.has(el.id))return false;
 if(/search|email|password|username|code|token|url/i.test(el.name||""))return false;
 return true;
}
function applyAutoCapitalize(el){
 if(!shouldAutoCapitalize(el)||el.dataset?.composing==="1")return;
 const start=el.selectionStart,end=el.selectionEnd;
 const next=sentenceCapitalizeText(el.value);
 if(next!==el.value){
   el.value=next;
   try{el.setSelectionRange(start,end)}catch(e){}
 }
}
function capitalizeAllDataFields(root=document){
 root.querySelectorAll?.("input[type=text],textarea").forEach(el=>{
   if(shouldAutoCapitalize(el))applyAutoCapitalize(el);
 });
}

let centralRefreshPromise=null;
async function refreshCentralSession(){
 if(!centralSession?.refresh_token)throw new Error("Phiên đăng nhập đã hết hạn");
 if(centralRefreshPromise)return centralRefreshPromise;
 const refreshToken=centralSession.refresh_token;
 centralRefreshPromise=(async()=>{
   const res=await fetch(SB_URL+"/auth/v1/token?grant_type=refresh_token",{
     method:"POST",
     headers:{"apikey":SB_KEY,"Content-Type":"application/json"},
     body:JSON.stringify({refresh_token:refreshToken})
   });
   let data=null;try{data=await res.json()}catch(e){}
   if(!res.ok||!data?.access_token)throw new Error(data?.msg||data?.message||data?.error_description||"Không thể làm mới phiên đăng nhập");
   centralSession={access_token:data.access_token,refresh_token:data.refresh_token||refreshToken,expires_at:data.expires_at||0};
   localStorage.setItem("esta_central_session",JSON.stringify(centralSession));
   return centralSession;
 })();
 try{return await centralRefreshPromise}finally{centralRefreshPromise=null}
}
async function ensureCentralSessionFresh(force=false){
 if(!centralSession?.access_token)return centralSession;
 const expiresAt=Number(centralSession.expires_at||0),now=Math.floor(Date.now()/1000);
 if(!force&&(!expiresAt||expiresAt>now+90))return centralSession;
 return refreshCentralSession();
}
async function centralAuthFetch(url,options={}){
 await ensureCentralSessionFresh();
 const make=()=>fetch(url,{...options,headers:{...(options.headers||{}),"apikey":SB_KEY,"Authorization":"Bearer "+centralSession.access_token}});
 let res=await make();
 if(res.status===401&&centralSession?.refresh_token){
   await ensureCentralSessionFresh(true);
   res=await make();
 }
 return res;
}
async function sbFetch(path,{method="GET",body=null,token=null}={}){
 const usesCentral=!!token&&token===centralSession?.access_token;
 if(usesCentral){await ensureCentralSessionFresh();token=centralSession?.access_token||token}
 const make=()=>{const headers={"apikey":SB_KEY,"Content-Type":"application/json"};if(token)headers.Authorization="Bearer "+token;return fetch(SB_URL+path,{method,headers,body:body===null?null:JSON.stringify(body)})};
 let res=await make();
 if(res.status===401&&usesCentral&&centralSession?.refresh_token){await ensureCentralSessionFresh(true);token=centralSession.access_token;res=await make()}
 let data=null;try{data=await res.json()}catch(e){}
 if(!res.ok){const err=new Error(data?.msg||data?.message||data?.error_description||data?.error||"Không thể kết nối máy chủ");err.status=res.status;throw err}
 return data;
}
const MEDIA_BUCKET="task-images";
const mediaUrlCache=new Map();
function isStorageRef(v){return typeof v==="string"&&v.startsWith("storage:")}
function storagePathFromRef(v){return isStorageRef(v)?v.slice(8):v}
function mediaPathUrl(path){return path.split("/").map(encodeURIComponent).join("/")}
async function mediaObjectUrl(ref){
 if(!ref)return "";
 if(!isStorageRef(ref))return ref;
 const path=storagePathFromRef(ref),cached=mediaUrlCache.get(path);
 if(cached?.url)return cached.url;
 if(!centralSession?.access_token)throw new Error("Phiên đăng nhập đã hết hạn");
 const res=await centralAuthFetch(SB_URL+"/storage/v1/object/authenticated/"+MEDIA_BUCKET+"/"+mediaPathUrl(path));
 if(!res.ok)throw new Error("Không thể tải hình ảnh");
 const blob=await res.blob(),url=URL.createObjectURL(blob);
 mediaUrlCache.set(path,{url});
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
   try{
     const url=await mediaObjectUrl("storage:"+im.dataset.storagePath);
     im.src=url;im.dataset.loaded="1";
   }catch(e){
     im.classList.add("imageLoadError");
     im.alt="Nhấn để thử lại";
     im.onclick=async ev=>{ev.stopPropagation();im.dataset.loaded="";await hydrateMediaImages(im.parentElement||document)};
   }
 }));
}
window.addEventListener("beforeunload",()=>{for(const x of mediaUrlCache.values())if(x?.url?.startsWith("blob:"))URL.revokeObjectURL(x.url)});
function imageFileToBlob(file){
 return new Promise((resolve,reject)=>{
   if(!file?.type?.startsWith("image/"))return reject(new Error("Chỉ hỗ trợ file hình ảnh"));
   const url=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{
     try{
       const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
       const cv=document.createElement("canvas");cv.width=w;cv.height=h;
       cv.getContext("2d").drawImage(img,0,0,w,h);
       cv.toBlob(blob=>{URL.revokeObjectURL(url);blob?resolve(blob):reject(new Error("Không thể xử lý hình ảnh"))},"image/jpeg",.74);
     }catch(e){URL.revokeObjectURL(url);reject(e)}
   };
   img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Không đọc được hình ảnh này"))};
   img.src=url;
 });
}
async function uploadMediaBlob(blob,kind,recordId,index=0,buildingId=currentBuilding.id){
 if(!centralSession?.access_token)throw new Error("Cần đăng nhập tài khoản trung tâm để tải hình");
 const uid=(crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2));
 const path=buildingId+"/"+kind+"/"+recordId+"/"+Date.now()+"-"+index+"-"+uid+".jpg";
 const res=await centralAuthFetch(SB_URL+"/storage/v1/object/"+MEDIA_BUCKET+"/"+mediaPathUrl(path),{
   method:"POST",
   headers:{"Content-Type":"image/jpeg","x-upsert":"false"},
   body:blob
 });
 if(!res.ok){let d={};try{d=await res.json()}catch(e){}throw new Error(d?.message||d?.error||"Không thể tải hình lên máy chủ")}
 return "storage:"+path;
}
async function uploadMediaFiles(files,kind,recordId,onProgress,buildingId=currentBuilding.id){
 const list=[...files],refs=new Array(list.length);
 let next=0,done=0;
 const worker=async()=>{
   while(true){
     const i=next++;if(i>=list.length)return;
     const blob=(list[i].type==="image/jpeg"&&String(list[i].name||"").startsWith("camera-"))?list[i]:await imageFileToBlob(list[i]);
     refs[i]=await uploadMediaBlob(blob,kind,recordId,i,buildingId);
     done++;if(onProgress)onProgress(done,list.length);
   }
 };
 const workers=Array.from({length:Math.min(3,list.length)},()=>worker());
 await Promise.all(workers);
 return refs.filter(Boolean);
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
   let blob;
   if(isStorageRef(ref)){
     const path=storagePathFromRef(ref);
     const res=await centralAuthFetch(SB_URL+"/storage/v1/object/authenticated/"+MEDIA_BUCKET+"/"+mediaPathUrl(path));
     if(!res.ok)throw new Error("Không thể tải hình");
     blob=await res.blob();
   }else{
     const res=await fetch(ref);blob=await res.blob();
   }
   const u=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=u;a.download="ESTA-"+currentBuilding.id+"-hinh-"+(index+1)+".jpg";
   document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);
 }catch(e){toast(e.message||"Không thể tải hình")}
};

async function projectSync(action,payload={},buildingId=currentBuilding?.id){
 if(!centralSession?.access_token||!buildingId)return null;
 return sbFetch("/functions/v1/project-sync",{method:"POST",token:centralSession.access_token,body:{action,building_id:buildingId,...payload}});
}
const cloudVersionByBuilding={};
let projectPeople=[],taskSelectedPeople=[],energySelectedPeople=[];
const peopleLocalKey=id=>"esta_people_"+id;
function performerArray(x){
 if(Array.isArray(x?.performers))return [...new Set(x.performers.map(v=>String(v||"").trim()).filter(Boolean))];
 const raw=String(x?.a||x?.performer||"").trim();
 return raw?[...new Set(raw.split(",").map(v=>v.trim()).filter(Boolean))]:[];
}
function existingProjectPeople(){
 const names=[];
 load().forEach(x=>names.push(...performerArray(x)));
 if(typeof energyLoad==="function")energyLoad().forEach(x=>names.push(...performerArray(x)));
 return [...new Set(names.map(v=>v.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi"));
}
function cacheProjectPeople(){
 try{localStorage.setItem(peopleLocalKey(currentBuilding.id),JSON.stringify(projectPeople))}catch(e){}
}
function peopleSelected(kind){return kind==="energy"?energySelectedPeople:taskSelectedPeople}
function setPeopleSelected(kind,names){
 const clean=[...new Set((names||[]).map(v=>String(v||"").trim()).filter(Boolean))];
 if(kind==="energy")energySelectedPeople=clean;else taskSelectedPeople=clean;
 const hidden=kind==="energy"?$("#energyPerformer"):$("#performer");
 if(hidden)hidden.value=clean.join(", ");
 renderPeopleSelector(kind);
}
function personInitials(name){
 return String(name||"").trim().split(/\s+/).slice(-2).map(x=>x[0]||"").join("").toUpperCase()||"•";
}
function renderPeopleSelector(kind){
 const box=kind==="energy"?$("#energyPeopleOptions"):$("#taskPeopleOptions");
 const btn=kind==="energy"?$("#energyPeopleButton"):$("#taskPeopleButton");
 if(!box||!btn)return;
 const selected=peopleSelected(kind);
 const names=[...new Set([...projectPeople.map(x=>x.name),...selected])].filter(Boolean);
 if(!names.length){
   box.innerHTML='<div class="peopleEmpty"><b>Chưa có người thực hiện</b><span>Chọn “Chỉnh sửa danh sách” để thêm nhân sự cho dự án.</span></div>';
 }else{
   box.innerHTML=names.map(name=>{
     const on=selected.includes(name);
     return '<button type="button" class="peopleOption '+(on?"selected":"")+'" data-person="'+encodeURIComponent(name)+'">'+((kind==="task"||kind==="energy")?'<span class="peopleAvatar">'+esc(personInitials(name))+'</span>':'')+'<span class="peopleName">'+esc(name)+'</span><span class="peopleCheck">'+(on?"✓":"")+'</span></button>';
   }).join("");
   box.querySelectorAll("[data-person]").forEach(el=>el.onclick=e=>{
     e.stopPropagation();
     const name=decodeURIComponent(el.dataset.person),next=[...peopleSelected(kind)];
     const idx=next.indexOf(name);if(idx>=0)next.splice(idx,1);else next.push(name);
     setPeopleSelected(kind,next);
     if(kind==="task")saveDraft();
   });
 }
 const label=btn.querySelector("span");
 if(label){
   label.className="peopleButtonSummary";
   label.innerHTML=!selected.length
     ?'<em>Chọn người thực hiện</em>'
     :selected.slice(0,4).map(name=>'<span class="selectedPersonChip"><b>'+esc(name)+'</b></span>').join("")+(selected.length>4?'<span class="selectedMore">+'+(selected.length-4)+'</span>':"");
 }
 btn.classList.toggle("hasValue",selected.length>0);
}
function renderAllPeopleSelectors(){renderPeopleSelector("task");renderPeopleSelector("energy")}
function closePeopleMenus(){
 $("#taskPeopleMenu")?.classList.add("hide");
 $("#energyPeopleMenu")?.classList.add("hide");
}
function openPeopleManager(){
 closePeopleMenus();
 $("#peopleManagerProject").textContent="Danh sách của "+(currentBuilding?.name||"dự án")+" · tự động lưu riêng theo dự án.";
 $("#peopleManagerModal").classList.remove("hide");
 renderPeopleManager();
}
function renderPeopleManager(){
 const box=$("#peopleManagerList");if(!box)return;
 const writable=canProjectEdit();
 $("#peopleAddForm").classList.toggle("readonly",!writable);
 $("#newPersonName").disabled=!writable;
 $("#peopleAddForm").querySelector("button").disabled=!writable;
 box.innerHTML=projectPeople.length?projectPeople.map(p=>'<div class="peopleManagerRow"><div><b>'+esc(p.name)+'</b></div>'+(writable?'<button type="button" data-delete-person="'+p.id+'">Xóa</button>':'<span class="peopleReadOnly">Chỉ xem</span>')+'</div>').join(""):'<div class="peopleEmpty manager">Chưa có người thực hiện trong dự án này.</div>';
 box.querySelectorAll("[data-delete-person]").forEach(btn=>btn.onclick=()=>deleteProjectPerson(btn.dataset.deletePerson));
}
async function fetchProjectPeople(buildingId=currentBuilding?.id){
 if(!centralSession?.access_token||!buildingId)return [];
 const rows=await sbFetch("/rest/v1/building_people?select=id,name&building_id=eq."+encodeURIComponent(buildingId)+"&order=name.asc",{token:centralSession.access_token});
 return Array.isArray(rows)?rows:[];
}
async function loadProjectPeople(buildingId=currentBuilding?.id){
 if(!buildingId)return;
 let cached=[];try{cached=JSON.parse(localStorage.getItem(peopleLocalKey(buildingId))||"[]")}catch(e){}
 projectPeople=Array.isArray(cached)?cached:[];
 renderAllPeopleSelectors();
 if(!centralSession?.access_token)return;
 try{
   let rows=await fetchProjectPeople(buildingId);
   if(!rows.length&&buildingId===currentBuilding?.id){
     const legacy=existingProjectPeople();
     if(legacy.length&&canProjectEdit()){
       try{
         await sbFetch("/rest/v1/building_people",{method:"POST",token:centralSession.access_token,body:legacy.map(name=>({building_id:buildingId,name}))});
         rows=await fetchProjectPeople(buildingId);
       }catch(e){console.warn("Seed project people failed",e)}
     }else if(legacy.length){
       rows=legacy.map((name,i)=>({id:"legacy-"+i,name}));
     }
   }
   if(buildingId!==currentBuilding?.id)return;
   projectPeople=rows;
   cacheProjectPeople();renderAllPeopleSelectors();renderPeopleManager();
 }catch(e){console.warn("Load project people failed",e)}
}
async function addProjectPerson(name){
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 name=sentenceCapitalizeText(String(name||"").trim());
 if(!name)return;
 if(projectPeople.some(p=>p.name.toLocaleLowerCase("vi-VN")===name.toLocaleLowerCase("vi-VN")))return toast("Người này đã có trong danh sách");
 try{
   await sbFetch("/rest/v1/building_people",{method:"POST",token:centralSession.access_token,body:{building_id:currentBuilding.id,name}});
   await loadProjectPeople(currentBuilding.id);
   toast("Đã thêm "+name);
 }catch(e){toast(e.status===409?"Người này đã có trong danh sách":e.message)}
}
async function deleteProjectPerson(id){
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const person=projectPeople.find(p=>String(p.id)===String(id));if(!person)return;
 if(!confirm("Xóa "+person.name+" khỏi danh sách người thực hiện của dự án?"))return;
 try{
   await sbFetch("/rest/v1/building_people?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});
   taskSelectedPeople=taskSelectedPeople.filter(x=>x!==person.name);
   energySelectedPeople=energySelectedPeople.filter(x=>x!==person.name);
   $("#performer").value=taskSelectedPeople.join(", ");
   $("#energyPerformer").value=energySelectedPeople.join(", ");
   await loadProjectPeople(currentBuilding.id);
   toast("Đã xóa "+person.name);
 }catch(e){toast(e.message)}
}

$("#taskPeopleButton").onclick=e=>{e.stopPropagation();const m=$("#taskPeopleMenu"),open=m.classList.contains("hide");closePeopleMenus();if(open)m.classList.remove("hide")};
$("#energyPeopleButton").onclick=e=>{e.stopPropagation();const m=$("#energyPeopleMenu"),open=m.classList.contains("hide");closePeopleMenus();if(open)m.classList.remove("hide")};
$("#taskPeopleMenu").onclick=e=>e.stopPropagation();
$("#energyPeopleMenu").onclick=e=>e.stopPropagation();
document.querySelectorAll("[data-people-edit]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();openPeopleManager()});
document.addEventListener("click",e=>{if(!e.target.closest(".peopleSelect"))closePeopleMenus()});
$("#closePeopleManager").onclick=()=>$("#peopleManagerModal").classList.add("hide");
$("#peopleManagerModal").onclick=e=>{if(e.target===$("#peopleManagerModal"))$("#peopleManagerModal").classList.add("hide")};
$("#peopleAddForm").onsubmit=async e=>{e.preventDefault();const input=$("#newPersonName"),name=input.value.trim();if(!name)return;input.value="";await addProjectPerson(name);input.focus()};

function applyCloudSnapshot(building,row){
 if(!row)return;
 localStorage.setItem(building.id==="62THL"?"qlkt62_v1":"qlkt_tasks_"+building.id,JSON.stringify(Array.isArray(row.tasks)?row.tasks:[]));
 localStorage.setItem(building.id==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+building.id,JSON.stringify(Array.isArray(row.energy)?row.energy:[]));
 cloudVersionByBuilding[building.id]=row.updated_at||"";
 if(currentBuilding?.id===building.id){render();renderEnergy();if(!$("#homePage").classList.contains("hide"))renderHomeDashboard()}
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
async function syncTaskRecord(action,itemOrId,buildingId=currentBuilding?.id){
 if(!centralSession?.access_token||!buildingId)return;
 try{
   const r=action==="upsert_task"
     ?await projectSync(action,{item:itemOrId},buildingId)
     :await projectSync(action,{id:itemOrId},buildingId);
   if(r?.updated_at)cloudVersionByBuilding[buildingId]=r.updated_at;
   return r;
 }catch(e){throw e}
}
async function appendTaskImages(taskId,images,buildingId){
 if(!images?.length)return;
 const r=await projectSync("append_task_images",{id:taskId,images},buildingId);
 if(r?.updated_at)cloudVersionByBuilding[buildingId]=r.updated_at;
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
 if(!centralSession?.access_token||!building?.id)return false;
 const buildingId=building.id;
 currentBuilding={...building};
 const taskKey=taskStorageKeyFor(buildingId);
 const energyKey=buildingId==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+buildingId;

 // Local storage is only a cache. Preserve any previous browser-only data
 // before replacing the cache with the server snapshot.
 let previousLocalTasks=[],previousLocalEnergy=[];
 try{previousLocalTasks=JSON.parse(localStorage.getItem(taskKey)||"[]")}catch(e){}
 try{previousLocalEnergy=JSON.parse(localStorage.getItem(energyKey)||"[]")}catch(e){}

 try{
   const r=await projectSync("get",{},buildingId);
   const row=r?.snapshot||{building_id:buildingId,tasks:[],energy:[],updated_at:null};
   const cloudTasks=Array.isArray(row.tasks)?row.tasks:[];
   const cloudEnergy=Array.isArray(row.energy)?row.energy:[];

   // Never block project opening because of image migration or stale local cache.
   // The server snapshot is canonical and is applied immediately.
   try{
     if((previousLocalTasks.length||previousLocalEnergy.length)&&
        (JSON.stringify(previousLocalTasks)!==JSON.stringify(cloudTasks)||
         JSON.stringify(previousLocalEnergy)!==JSON.stringify(cloudEnergy))){
       localStorage.setItem("esta_local_backup_"+buildingId,JSON.stringify({
         saved_at:new Date().toISOString(),
         tasks:previousLocalTasks,
         energy:previousLocalEnergy
       }));
     }
   }catch(e){console.warn("Local backup skipped",e)}

   localStorage.setItem(taskKey,JSON.stringify(cloudTasks));
   localStorage.setItem(energyKey,JSON.stringify(cloudEnergy));
   cloudVersionByBuilding[buildingId]=row.updated_at||"";

   // Best-effort legacy base64 migration. It must never prevent the project
   // from loading. Current server data normally already uses Storage refs.
   const hasLegacyMedia=
     cloudTasks.some(t=>Array.isArray(t?.imgs)&&t.imgs.some(x=>typeof x==="string"&&x.startsWith("data:image/")))||
     cloudEnergy.some(x=>typeof x?.image==="string"&&x.image.startsWith("data:image/"));
   if(hasLegacyMedia&&canProjectEdit()){
     (async()=>{
       try{
         const migrated=await migrateMediaRows(
           JSON.parse(JSON.stringify(cloudTasks)),
           JSON.parse(JSON.stringify(cloudEnergy))
         );
         if(!migrated.changed)return;
         localStorage.setItem(taskKey,JSON.stringify(migrated.tasks));
         localStorage.setItem(energyKey,JSON.stringify(migrated.energy));
         const merged=await projectSync("merge_snapshot",{tasks:migrated.tasks,energy:migrated.energy},buildingId);
         if(merged?.updated_at)cloudVersionByBuilding[buildingId]=merged.updated_at;
         if(currentBuilding?.id===buildingId){render();renderEnergy()}
       }catch(err){console.warn("Legacy media migration skipped",err)}
     })();
   }
   return true;
 }catch(e){
   console.warn("Project snapshot load failed",buildingId,e);
   // Keep any valid cache available instead of leaving the page blank.
   if(!Array.isArray(previousLocalTasks))previousLocalTasks=[];
   if(!Array.isArray(previousLocalEnergy))previousLocalEnergy=[];
   try{
     localStorage.setItem(taskKey,JSON.stringify(previousLocalTasks));
     localStorage.setItem(energyKey,JSON.stringify(previousLocalEnergy));
   }catch(_e){}
   toast("Không thể đồng bộ máy chủ · đang dùng dữ liệu đã lưu trên máy");
   return false;
 }
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
 const loginId=String(identifier||"").trim().toLowerCase();
 let data;
 try{
   data=await sbFetch("/functions/v1/central-login",{method:"POST",body:{identifier:loginId,password}});
 }catch(err){
   // Fallback keeps direct email login and legacy project usernames working
   // if the login edge function is temporarily unavailable.
   const email=loginId.includes("@")?loginId:loginId+"@esta-building.app";
   data=await sbFetch("/auth/v1/token?grant_type=password",{method:"POST",body:{email,password}});
 }
 const session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at||0};
 if(!session.access_token)throw new Error("Không nhận được phiên đăng nhập");
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
function homeInitials(name=""){
 return String(name||"E").trim().split(/\s+/).slice(-2).map(x=>x[0]||"").join("").toUpperCase()||"E";
}
function homeEnergyUse(rows,type){
 const list=(Array.isArray(rows)?rows:[]).filter(x=>x.type===type).sort((a,b)=>String(a.date).localeCompare(String(b.date))||Number(a.id)-Number(b.id));
 const month=today().slice(0,7);
 let total=0,has=false;
 for(let i=1;i<list.length;i++){
   if(!String(list[i].date||"").startsWith(month))continue;
   const d=Number(list[i].value)-Number(list[i-1].value);
   if(Number.isFinite(d)&&d>=0){total+=d;has=true}
 }
 return has?total:null;
}
function homeNumber(v,unit=""){
 return v===null||v===undefined?"—":Number(v).toLocaleString("vi-VN",{maximumFractionDigits:2})+(unit?" "+unit:"");
}
function homeTaskRows(tasks,buildingLabel=""){
 return [...(tasks||[])].sort((a,b)=>String(b.d||"").localeCompare(String(a.d||""))||Number(b.id)-Number(a.id)).slice(0,6).map(x=>{
   const status=x.s||"Đang thực hiện";
   const cls=status==="Đã hoàn thành"?"done":status==="Đang thực hiện"?"doing":"waiting";
   return '<button class="homeTaskRow" type="button" onclick="homeOpenTask('+Number(x.id)+')"><div class="homeTaskLead"><span class="homeTaskDot '+cls+'"></span><div><b>'+esc(x.c||"Công việc kỹ thuật")+'</b><small>'+esc(buildingLabel||x.a||"Kỹ thuật")+' · '+(x.d?fmt(x.d):"—")+'</small></div></div><span class="homeStatus '+cls+'">'+esc(status)+'</span><i>→</i></button>';
 }).join("");
}
function homeActivityRows(tasks,energy,buildingLabel=""){
 const items=[];
 (tasks||[]).forEach(x=>items.push({ts:Number(x.id)||Date.parse((x.d||today())+"T12:00:00"),icon:"task",title:x.c||"Công việc kỹ thuật",sub:(x.s||"Đang thực hiện")+(buildingLabel?" · "+buildingLabel:"")}));
 (energy||[]).forEach(x=>items.push({ts:Date.parse(x.createdAt||((x.date||today())+"T12:00:00"))||Number(x.id)||0,icon:x.type||"electric",title:x.type==="water"?"Đã cập nhật chỉ số nước":x.type==="solar"?"Đã cập nhật điện mặt trời":"Đã cập nhật chỉ số điện",sub:(x.date?fmt(x.date):"")+(buildingLabel?" · "+buildingLabel:"")}));
 return items.sort((a,b)=>b.ts-a.ts).slice(0,5).map(x=>{
   const when=x.ts?new Date(x.ts).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}):"";
   return '<div class="activityRow"><div class="activityIcon '+esc(x.icon)+'"></div><div><b>'+esc(x.title)+'</b><span>'+esc(x.sub)+'</span></div><time>'+esc(when)+'</time></div>';
 }).join("");
}
function renderHomeProjectCards(){
 const box=$("#homeProjectGrid"),list=currentAccount?.buildings||[];
 if(!box)return;
 box.innerHTML=list.length?list.map((b,i)=>'<button class="homeProjectCard" type="button" onclick="adminOpenBuilding(\''+esc(b.id)+'\',event)"><div class="projectMonogram">'+esc((b.id||"ES").slice(0,2))+'</div><div><small>'+esc(b.id)+'</small><b>'+esc(b.name||b.id)+'</b><span>ESTA Property Management</span></div><i>→</i></button>').join(""):'<div class="homeEmpty">Chưa có dự án đang hoạt động.</div>';
}
async function renderAdminHomeOverview(){
 $("#homeAdminProjects").classList.toggle("hide",!currentAccount?.is_admin);
 renderHomeProjectCards();
 if(!currentAccount?.is_admin)return;
 try{
   const result=await sbFetch("/functions/v1/admin-overview",{method:"POST",token:centralSession.access_token,body:{}});
   const rows=Array.isArray(result?.rows)?result.rows:[];
   const tasks=[],energy=[];let electricTotal=0,waterTotal=0,solarTotal=0,hasElectric=false,hasWater=false,hasSolar=false;

   rows.forEach(({building:b,snapshot:s})=>{
     const bt=Array.isArray(s?.tasks)?s.tasks:[],be=Array.isArray(s?.energy)?s.energy:[];
     bt.forEach(x=>tasks.push({...x,_building:b?.name||b?.id||"Dự án"}));
     be.forEach(x=>energy.push({...x,_building:b?.name||b?.id||"Dự án"}));
     const ev=homeEnergyUse(be,"electric"),wv=homeEnergyUse(be,"water"),sv=homeEnergyUse(be,"solar");
     if(ev!==null){electricTotal+=ev;hasElectric=true}
     if(wv!==null){waterTotal+=wv;hasWater=true}
     if(sv!==null){solarTotal+=sv;hasSolar=true}
   });

   const td=today();
   $("#homeToday").textContent=tasks.filter(x=>x.d===td).length;
   $("#homeDoing").textContent=tasks.filter(x=>x.s==="Đang thực hiện").length;
   $("#homeDone").textContent=tasks.filter(x=>x.s==="Đã hoàn thành").length;
   $("#homeWait").textContent=tasks.filter(x=>x.s==="Chờ xử lý").length;

   const recent=[...tasks].sort((a,b)=>String(b.d||"").localeCompare(String(a.d||""))||Number(b.id)-Number(a.id)).slice(0,6);
   $("#homeRecentTasks").innerHTML=recent.length?recent.map(x=>{
     const st=x.s||"Đang thực hiện",cl=st==="Đã hoàn thành"?"done":st==="Đang thực hiện"?"doing":"waiting";
     return '<div class="homeTaskRow static"><div class="homeTaskLead"><span class="homeTaskDot '+cl+'"></span><div><b>'+esc(x.c||"Công việc kỹ thuật")+'</b><small>'+esc(x._building||"Dự án")+' · '+(x.d?fmt(x.d):"—")+'</small></div></div><span class="homeStatus '+cl+'">'+esc(st)+'</span></div>';
   }).join(""):'<div class="homeEmpty">Chưa có công việc gần đây.</div>';

   $("#homeElectric").textContent=homeNumber(hasElectric?electricTotal:null);
   $("#homeWater").textContent=homeNumber(hasWater?waterTotal:null);
   $("#homeSolar").textContent=homeNumber(hasSolar?solarTotal:null);
   $("#homeActivity").innerHTML=homeActivityRows(tasks,energy)||'<div class="homeEmpty">Chưa có hoạt động gần đây.</div>';
 }catch(e){
   console.warn("Admin home summary failed",e);
   $("#homeRecentTasks").innerHTML='<div class="homeEmpty">Không tải được dữ liệu tổng quan. Vui lòng thử lại.</div>';
   $("#homeActivity").innerHTML='<div class="homeEmpty">Không tải được hoạt động gần đây.</div>';
 }
}
function renderHomeDashboard(){
 $("#headerAvatar").textContent="E";$("#sideAvatar").textContent="E";
 if($("#homeUpdatedAt"))$("#homeUpdatedAt").textContent="Cập nhật "+new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
 const admin=!!currentAccount?.is_admin;
 $("#homeAdminProjects").classList.toggle("hide",!admin);
 if(admin){
   const hp=$("#topHomeTitle p");if(hp)hp.textContent="";
   $("#homeElectric").textContent=$("#homeWater").textContent=$("#homeSolar").textContent="—";
   $("#homeRecentTasks").innerHTML='<div class="homeEmpty">Đang tổng hợp dữ liệu các dự án...</div>';
   $("#homeActivity").innerHTML='<div class="homeEmpty">Đang tải hoạt động...</div>';
   $("#homeToday").textContent=$("#homeDoing").textContent=$("#homeDone").textContent=$("#homeWait").textContent="0";
   renderAdminHomeOverview();
   return;
 }
 const tasks=load(),energy=energyLoad(),td=today();
 $("#homeToday").textContent=tasks.filter(x=>x.d===td).length;
 $("#homeDoing").textContent=tasks.filter(x=>x.s==="Đang thực hiện").length;
 $("#homeDone").textContent=tasks.filter(x=>x.s==="Đã hoàn thành").length;
 $("#homeWait").textContent=tasks.filter(x=>x.s==="Chờ xử lý").length;
 $("#homeRecentTasks").innerHTML=homeTaskRows(tasks)||'<div class="homeEmpty">Chưa có công việc gần đây.</div>';
 $("#homeElectric").textContent=homeNumber(homeEnergyUse(energy,"electric"));
 $("#homeWater").textContent=homeNumber(homeEnergyUse(energy,"water"));
 $("#homeSolar").textContent=homeNumber(homeEnergyUse(energy,"solar"));
 $("#homeActivity").innerHTML=homeActivityRows(tasks,energy)||'<div class="homeEmpty">Chưa có hoạt động gần đây.</div>';
}
function showHome(){
 $("#homePage").classList.remove("hide");
 $("#adminPage").classList.add("hide");$("#workPage").classList.add("hide");$("#energyPage").classList.add("hide");$("#inventoryPage").classList.add("hide");$("#maintenancePage").classList.add("hide");$("#contractorPage").classList.add("hide");$("#constructionMaterialPage").classList.add("hide");
 $("#workHero").classList.add("hide");$("#energyHero").classList.add("hide");
 $("#topHomeTitle").classList.remove("hide");$("#topAdminTitle").classList.add("hide");$("#topWorkTitle").classList.add("hide");$("#topEnergyTitle").classList.add("hide");$("#topInventoryTitle").classList.add("hide");$("#topMaintenanceTitle").classList.add("hide");$("#topContractorTitle").classList.add("hide");$("#topConstructionTitle").classList.add("hide");
 $("#navHome").classList.add("active");$("#navAdmin").classList.remove("active");$("#navWork").classList.remove("active");$("#navEnergy").classList.remove("active");$("#navInventory").classList.remove("active");$("#navMaintenance").classList.remove("active");$("#navContractor").classList.remove("active");$("#navConstruction")?.classList.remove("active");
 $("#app").classList.remove("adminMode","homeMode","workMode","energyMode","inventoryMode","maintenanceMode","contractorMode","constructionMode");$("#app").classList.add("homeMode");
 setMobileMenuOpen(false,true);
 renderHomeDashboard();
}
window.homeOpenTask=id=>{
 if($("#navWork").classList.contains("hide")){toast("Hãy mở một dự án trước");return}
 showModule("work");
 const n=Number(id);if(Number.isFinite(n)&&load().some(x=>Number(x.id)===n))setTimeout(()=>editTask(n),80);
};
function applyBuildingUI(){
 const name=currentBuilding?.name||"Dự án";
 document.querySelectorAll(".buildingNameText").forEach(el=>el.textContent=name);
 const ht=$("#topHomeTitle p"),wt=$("#topWorkTitle p"),et=$("#topEnergyTitle p"),it=$("#topInventoryTitle p"),mt=$("#topMaintenanceTitle p"),ct=$("#topContractorTitle p"),cmt=$("#topConstructionTitle p");
 if(ht)ht.textContent=currentAccount?.is_admin?"":name;
 if(wt)wt.textContent=name;
 if(et)et.textContent=name+" · Điện / Nước / Điện mặt trời";
 if(it)it.textContent=name+" · Kho kỹ thuật";
 if(mt)mt.textContent=name+" · Kế hoạch bảo trì";
 if(ct)ct.textContent=name;
 if(cmt)cmt.textContent=name;
 document.title="ESTA | "+name;
 const energyRole=$("#energyHeaderRole");
 if(energyRole){
   const member=currentAccount?.buildings?.find(b=>b.id===currentBuilding?.id);
   const role=currentAccount?.is_admin?"Quản trị viên":(member?.role==="viewer"?"Chỉ xem":"Kỹ thuật viên");
   energyRole.textContent=role+(currentBuilding?.id?" · "+currentBuilding.id:"");
 }
 resetForm(false);render();renderEnergy();renderHomeDashboard();
}
let projectOpenSeq=0;
function prepareProjectContext(building){
 currentBuilding={...building};
 sessionStorage.setItem("esta_building",JSON.stringify(currentBuilding));
 taskSelectedPeople=[];energySelectedPeople=[];projectPeople=[];inventoryLoadedBuilding="";maintenanceLoadedBuilding="";
 if(typeof contractorLoadedBuilding!=="undefined")contractorLoadedBuilding="";
 if(typeof selectedContractorId!=="undefined")selectedContractorId="";
 if(typeof constructionLoadedBuilding!=="undefined")constructionLoadedBuilding="";
 if(typeof selectedConstructionMaterialId!=="undefined")selectedConstructionMaterialId="";
 $("#navWork").classList.remove("hide");$("#navEnergy").classList.remove("hide");$("#navInventory").classList.remove("hide");$("#navMaintenance").classList.remove("hide");$("#navContractor").classList.remove("hide");$("#navConstruction")?.classList.remove("hide");
}
async function enterProject(building,{target="home"}={}){
 const openSeq=++projectOpenSeq;
 prepareProjectContext(building);

 // Switch away from the project directory immediately on the very first click.
 // Admin project cards open Công việc; direct account login still starts at Tổng quan.
 if(target==="work")showModule("work");
 else showHome();
 try{applyBuildingUI()}catch(e){console.warn("Initial project UI refresh skipped",e)}

 const buildingId=building.id;
 if(centralSession?.access_token)await loadProjectSnapshot({...building});
 if(openSeq!==projectOpenSeq||currentBuilding?.id!==buildingId)return;
 try{await loadProjectPeople(buildingId)}catch(e){console.warn("Project people load skipped",e)}
 if(openSeq!==projectOpenSeq||currentBuilding?.id!==buildingId)return;

 // Only refresh content. Never change the page after the user has entered the project.
 try{applyBuildingUI()}catch(e){console.warn("Final project UI refresh skipped",e)}
}
function openAdminPortal(){
 if(!currentAccount?.is_admin)return;
 $("#homePage").classList.add("hide");$("#adminPage").classList.remove("hide");$("#workPage").classList.add("hide");$("#energyPage").classList.add("hide");$("#inventoryPage").classList.add("hide");$("#maintenancePage").classList.add("hide");$("#contractorPage").classList.add("hide");$("#constructionMaterialPage").classList.add("hide");
 $("#workHero").classList.add("hide");$("#energyHero").classList.add("hide");
 $("#topHomeTitle").classList.add("hide");$("#topAdminTitle").classList.remove("hide");$("#topWorkTitle").classList.add("hide");$("#topEnergyTitle").classList.add("hide");$("#topInventoryTitle").classList.add("hide");$("#topMaintenanceTitle").classList.add("hide");$("#topContractorTitle").classList.add("hide");$("#topConstructionTitle").classList.add("hide");
 $("#navHome").classList.remove("active");$("#navAdmin").classList.add("active");$("#navWork").classList.remove("active");$("#navEnergy").classList.remove("active");$("#navInventory").classList.remove("active");$("#navMaintenance").classList.remove("active");$("#navContractor").classList.remove("active");$("#navConstruction")?.classList.remove("active");
 $("#app").classList.remove("homeMode","workMode","energyMode","inventoryMode","maintenanceMode","contractorMode","constructionMode");$("#app").classList.add("adminMode");setMobileMenuOpen(false,true);renderAdminPortal();
}
window.adminOpenBuilding=async(id,event)=>{
 event?.preventDefault?.();
 event?.stopPropagation?.();
 const b=currentAccount?.buildings?.find(x=>x.id===id);if(!b)return;
 const btn=event?.currentTarget;
 if(btn?.dataset.opening==="1")return;
 if(btn){btn.dataset.opening="1";btn.disabled=true}
 try{
   await enterProject(b,{target:"work"});
 }catch(e){
   console.warn("Open project failed",e);
   // The selected project context is already valid; keep the user inside it.
   try{prepareProjectContext(b);showModule("work");applyBuildingUI()}catch(_e){}
   toast("Đã mở dự án bằng dữ liệu khả dụng");
 }finally{
   if(btn&&btn.isConnected){delete btn.dataset.opening;btn.disabled=false}
 }
};
window.enterAccount=function(account,session=null){
 currentAccount=account;centralSession=session;me=account.username||account.email||"user";
 $("#login").classList.add("hide");$("#app").classList.remove("hide");
 $("#headerRole").textContent=account.is_admin?"Quản trị viên":(account.buildings?.[0]?.role==="viewer"?"Chỉ xem":"Kỹ thuật viên");
 if($("#energyHeaderName"))$("#energyHeaderName").textContent="ESTA";
 $("#sideUser").innerHTML=account.is_admin?"Quản trị viên":"Tài khoản dự án";
 $("#navAdmin").classList.toggle("hide",!account.is_admin);
 $("#headerAvatar").textContent="E";$("#sideAvatar").textContent="E";
 if(account.is_admin){$("#navWork").classList.add("hide");$("#navEnergy").classList.add("hide");$("#navInventory").classList.add("hide");$("#navMaintenance").classList.add("hide");$("#navContractor").classList.add("hide");$("#navConstruction")?.classList.add("hide");showHome()}
 else if(account.buildings?.length){enterProject(account.buildings[0])}
 else{toast("Tài khoản chưa được phân quyền dự án");}
};

const rememberedLogin=localStorage.getItem("esta_remember_username")||"";
if(rememberedLogin){$("#user").value=rememberedLogin;$("#rememberLogin").checked=true}
$("#forgotPasswordBtn").onclick=()=>toast("Vui lòng liên hệ quản trị viên để được cấp lại mật khẩu.");
$("#rememberLogin").onchange=()=>{
 if(!$("#rememberLogin").checked)localStorage.removeItem("esta_remember_username");
};

$("#togglePassword").onclick=()=>{
 const p=$("#pass"),b=$("#togglePassword");
 const show=p.type==="password";p.type=show?"text":"password";
 b.textContent=show?"◌":"◉";b.setAttribute("aria-label",show?"Ẩn mật khẩu":"Hiện mật khẩu");
};

$("#loginForm").onsubmit=async e=>{
 e.preventDefault();
 const u=$("#user").value.trim(),p=$("#pass").value,er=$("#loginError"),btn=$("#loginBtn");
 er.textContent="";btn.disabled=true;btn.textContent="Đang đăng nhập...";
 try{
   const central=await centralLogin(u,p);
   if($("#rememberLogin").checked)localStorage.setItem("esta_remember_username",u);
   else localStorage.removeItem("esta_remember_username");
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
const mobileSidebar=$("#mobileSidebar"),menuButton=$("#menu"),menuBackdrop=$("#menuBackdrop");
const mobileNavQuery=window.matchMedia("(max-width: 760px)");
function setMobileMenuOpen(open,returnFocus=false){
 const wasOpen=mobileSidebar.classList.contains("open");
 open=Boolean(open&&mobileNavQuery.matches);
 mobileSidebar.classList.toggle("open",open);
 $("#app").classList.toggle("menuOpen",open);
 document.body.classList.toggle("mobileNavOpen",open);
 menuBackdrop.hidden=!open;
 menuButton.setAttribute("aria-expanded",String(open));
 mobileSidebar.setAttribute("aria-hidden",String(mobileNavQuery.matches&&!open));
 mobileSidebar.inert=mobileNavQuery.matches&&!open;
 if(!open&&wasOpen&&returnFocus)menuButton.focus({preventScroll:true});
}
menuButton.onclick=()=>setMobileMenuOpen(!mobileSidebar.classList.contains("open"));
$("#sidebarClose").onclick=()=>setMobileMenuOpen(false,true);
menuBackdrop.onclick=()=>setMobileMenuOpen(false,true);
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&mobileSidebar.classList.contains("open"))setMobileMenuOpen(false,true);
});
if(mobileNavQuery.addEventListener)mobileNavQuery.addEventListener("change",()=>setMobileMenuOpen(false));
else mobileNavQuery.addListener(()=>setMobileMenuOpen(false));
setMobileMenuOpen(false);
const DRAFT="qlkt62_draft";function saveDraft(){if($("#editId").value)return;localStorage.setItem(DRAFT,JSON.stringify({d:$("#date").value,c:$("#content").value,t:$("#type").value,s:$("#status").value,a:$("#performer").value,n:$("#note").value}))}function restoreDraft(){try{let d=JSON.parse(localStorage.getItem(DRAFT)||"null");if(!d)return;$("#date").value=d.d||today();$("#content").value=d.c||"";$("#type").value=d.t||"Hằng ngày";$("#status").value=d.s||"Đang thực hiện";setPeopleSelected("task",String(d.a||"").split(",").map(v=>v.trim()).filter(Boolean));$("#note").value=d.n||""}catch(e){}}let existingTaskImages=[],removedTaskImageRefs=[],pendingTaskFiles=[],pendingPreviewUrls=[];
function workEntryCard(){return document.querySelector("#workPage .workEntryCard")||document.querySelector("#workEditDrawer .workEntryCard")}
function openWorkEditDrawer(){
 const drawer=$("#workEditDrawer"),mount=$("#workEditDrawerMount"),card=workEntryCard();
 if(!drawer||!mount||!card)return;
 mount.appendChild(card);
 drawer.classList.remove("hide");drawer.setAttribute("aria-hidden","false");
 document.body.classList.add("workEditOpen");
 $("#workEntryTitle")&&($("#workEntryTitle").textContent="Chỉnh sửa công việc");
 setTimeout(()=>$("#content")?.focus({preventScroll:true}),60);
}
function restoreWorkEntryCard(){
 const drawer=$("#workEditDrawer"),anchor=$("#workEntryHomeAnchor"),card=workEntryCard();
 if(anchor&&card&&card.parentElement!==anchor.parentElement)anchor.insertAdjacentElement("afterend",card);
 drawer?.classList.add("hide");drawer?.setAttribute("aria-hidden","true");
 document.body.classList.remove("workEditOpen");
 $("#workEntryTitle")&&($("#workEntryTitle").textContent="Thêm công việc");
}
function clearExistingTaskImages(){
 existingTaskImages=[];removedTaskImageRefs=[];
 const box=$("#existingImagePreview");if(box)box.innerHTML="";
 $("#existingImageSection")?.classList.add("hide");
}
function renderExistingTaskImages(){
 const section=$("#existingImageSection"),box=$("#existingImagePreview"),count=$("#existingImageCount");
 if(!section||!box)return;
 const editing=!!$("#editId")?.value;
 const hadImages=existingTaskImages.length+removedTaskImageRefs.length>0;
 section.classList.toggle("hide",!(editing&&hadImages));
 if(count)count.textContent=existingTaskImages.length+" ảnh";
 box.innerHTML=existingTaskImages.map((ref,i)=>'<div class="existingImg">'+mediaImgHtml(ref,"existingImgPhoto")+'<button type="button" onclick="removeExistingTaskImage('+i+')" aria-label="Xóa ảnh này" title="Xóa ảnh">×</button><span>Hình '+(i+1)+'</span></div>').join("");
 hydrateMediaImages(box);
}
window.removeExistingTaskImage=i=>{
 if(i<0||i>=existingTaskImages.length)return;
 const ref=existingTaskImages.splice(i,1)[0];
 if(ref)removedTaskImageRefs.push(ref);
 renderExistingTaskImages();updateTaskImageInfo();
};
async function deleteStoredMediaRefs(refs){
 const paths=[...new Set((refs||[]).filter(isStorageRef).map(storagePathFromRef).filter(Boolean))];
 if(!paths.length||!centralSession?.access_token)return;
 await Promise.allSettled(paths.map(async path=>{
   const cached=mediaUrlCache.get(path);
   if(cached?.url?.startsWith("blob:"))URL.revokeObjectURL(cached.url);
   mediaUrlCache.delete(path);
   const res=await centralAuthFetch(SB_URL+"/storage/v1/object/"+MEDIA_BUCKET,{
     method:"DELETE",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({prefixes:[path]})
   });
   if(!res.ok)throw new Error("Không thể dọn file ảnh "+path);
 }));
}
function resetForm(clearDraft=true){
 $("#editId").value="";$("#date").value=today();$("#content").value="";$("#type").value="Hằng ngày";$("#status").value="Đang thực hiện";setPeopleSelected("task",[]);$("#note").value="";$("#images").value="";$("#cameraNativeInput").value="";
 clearPendingTaskFiles();clearExistingTaskImages();$("#imageInfo").textContent="";$("#saveBtn").textContent="Lưu";$("#cancelEdit").classList.add("hide");
 restoreWorkEntryCard();
 if(clearDraft)localStorage.removeItem(DRAFT)
}
$("#cancelEdit").onclick=()=>resetForm();
$("#closeWorkEditDrawer")?.addEventListener("click",()=>resetForm());
$("#workEditDrawer")?.addEventListener("click",e=>{if(e.target.closest("[data-close-work-editor]"))resetForm()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#workEditDrawer")?.classList.contains("hide"))resetForm()});
["date","content","type","status","performer","note"].forEach(id=>$("#"+id).addEventListener("input",saveDraft));
function clearPendingTaskFiles(){
 pendingPreviewUrls.forEach(u=>URL.revokeObjectURL(u));
 pendingPreviewUrls=[];pendingTaskFiles=[];
 const box=$("#pendingImagePreview");if(box)box.innerHTML="";
}
function renderPendingTaskFiles(){
 const box=$("#pendingImagePreview");if(!box)return;
 pendingPreviewUrls.forEach(u=>URL.revokeObjectURL(u));pendingPreviewUrls=[];
 box.innerHTML=pendingTaskFiles.map((f,i)=>{
   const u=URL.createObjectURL(f);pendingPreviewUrls.push(u);
   return '<div class="pendingImg"><img src="'+u+'" alt="Ảnh '+(i+1)+'"><button type="button" onclick="removePendingTaskFile('+i+')" aria-label="Xóa ảnh">×</button><span>'+(i+1)+'</span></div>';
 }).join("");
}
window.removePendingTaskFile=i=>{
 if(i<0||i>=pendingTaskFiles.length)return;
 pendingTaskFiles.splice(i,1);
 renderPendingTaskFiles();updateTaskImageInfo();
};
function updateTaskImageInfo(){
 const added=pendingTaskFiles.length,existing=existingTaskImages.length,editing=!!$("#editId")?.value;
 if(editing){
   $("#imageInfo").textContent=(existing?existing+" hình hiện tại":"Không còn hình hiện tại")+(added?" · "+added+" hình mới sẽ thêm":"");
 }else{
   $("#imageInfo").textContent=added?"Đã chọn "+added+" hình · Có thể chọn thêm nhiều ảnh từ Thư viện hoặc chụp thêm 1 ảnh":"";
 }
}
function addPendingTaskFiles(fileList){
 const incoming=Array.from(fileList||[]).filter(f=>f&&f.type?.startsWith("image/"));
 if(!incoming.length)return;
 pendingTaskFiles=[...pendingTaskFiles,...incoming];
 renderPendingTaskFiles();updateTaskImageInfo();
}
$("#openNativeCamera").onclick=()=>{
 const input=$("#cameraNativeInput");
 input.value="";
 input.click();
};
$("#openNativeLibrary").onclick=()=>{
 const input=$("#images");
 input.value="";
 input.click();
};
$("#cameraNativeInput").onchange=e=>{
 addPendingTaskFiles(e.target.files);
 e.target.value="";
};
$("#images").onchange=e=>{
 addPendingTaskFiles(e.target.files);
 e.target.value="";
};
$("#taskForm").onsubmit=async e=>{
 e.preventDefault();
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 if(!taskSelectedPeople.length){toast("Vui lòng chọn ít nhất 1 người thực hiện");$("#taskPeopleButton").focus();return}
 const btn=$("#saveBtn");btn.disabled=true;
 try{
   const buildingId=currentBuilding.id,storageKey=taskStorageKeyFor(buildingId);
   let a=load(),editId=Number($("#editId").value),id=editId||Date.now(),old=editId?a.find(x=>x.id===editId):null;
   const files=[...pendingTaskFiles];
   const removedRefs=[...removedTaskImageRefs];
   const imgs=editId?[...existingTaskImages]:(Array.isArray(old?.imgs)?[...old.imgs]:[]);
   const obj={id,d:$("#date").value,c:$("#content").value.trim(),t:$("#type").value,s:$("#status").value,n:$("#note").value.trim(),a:taskSelectedPeople.join(", "),performers:[...taskSelectedPeople],imgs,i:imgs.length};
   a=editId?a.map(x=>x.id===editId?obj:x):[...a,obj];
   localStorage.setItem(storageKey,JSON.stringify(a));
   resetForm();render();renderHomeDashboard();
   toast(files.length?"Đã lưu · "+files.length+" hình đang tải nền":"Đã lưu công việc");

   (async()=>{
     try{
       const taskSync=syncTaskRecord("upsert_task",obj,buildingId);
       const imageUpload=files.length?uploadMediaFiles(files,"tasks",id,null,buildingId):Promise.resolve([]);
       const [,uploaded]=await Promise.all([taskSync,imageUpload]);
       if(removedRefs.length)await deleteStoredMediaRefs(removedRefs);
       if(uploaded.length){
         let latest=[];try{latest=JSON.parse(localStorage.getItem(storageKey)||"[]")}catch(e){}
         latest=latest.map(x=>{
           if(String(x.id)!==String(id))return x;
           const merged=[...new Set([...(Array.isArray(x.imgs)?x.imgs:[]),...uploaded])];
           return {...x,imgs:merged,i:merged.length};
         });
         localStorage.setItem(storageKey,JSON.stringify(latest));
         await appendTaskImages(id,uploaded,buildingId);
         if(currentBuilding.id===buildingId){render();hydrateMediaImages($("#tbody"))}
         toast("Đã tải xong "+uploaded.length+" hình");
       }
     }catch(err){
       console.warn(err);
       toast("Công việc đã lưu, nhưng có hình chưa đồng bộ. Hãy thử lại khi mạng ổn định.");
     }
   })();
 }catch(err){toast(err.message||"Không thể lưu công việc")}
 finally{btn.disabled=false}
};
let workStatFilter="";
function filtered(fx,ex){
 let q=($("#search").value+" "+$("#globalSearch").value).toLowerCase().trim(),s=$("#filterStatus").value,t=$("#filterType").value,f=fx===undefined?$("#fromDate").value:fx,e=ex===undefined?$("#toDate").value:ex;
 const statMatch=x=>!workStatFilter||(workStatFilter==="today"?x.d===today():workStatFilter==="doing"?x.s==="Đang thực hiện":workStatFilter==="done"?x.s==="Đã hoàn thành":workStatFilter==="waiting"?x.s==="Chờ xử lý":true);
 return load()
   .filter(x=>(!q||(x.c+" "+x.n+" "+x.a).toLowerCase().includes(q))&&(!s||x.s===s)&&(!t||(x.t||"Hằng ngày")===t)&&(!f||x.d>=f)&&(!e||x.d<=e)&&statMatch(x))
   .sort((a,b)=>{
     const ai=Number(a?.id),bi=Number(b?.id);
     if(Number.isFinite(ai)&&Number.isFinite(bi)&&ai!==bi)return ai-bi;
     return 0;
   });
}function typeBadge(t){t=t||"Hằng ngày";let c=t==="Bảo trì"?"maintenance":t==="Sự cố"?"incident":"daily";return '<span class="typeBadge '+c+'">'+esc(t)+'</span>'}function statusBadge(s){let c=s==="Đã hoàn thành"?"done":s==="Đang thực hiện"?"doing":"waiting";return '<span class="badge '+c+'">'+esc(s)+'</span>'}function performerChipsHtml(x,limit=3){
 const arr=performerArray(x);
 if(!arr.length)return '<span class="mutedDash">—</span>';
 const visible=arr.slice(0,limit);
 return '<div class="performerChips pro">'+visible.map(n=>'<span title="'+esc(n)+'"><b>'+esc(n)+'</b></span>').join("")+(arr.length>limit?'<em>+'+(arr.length-limit)+'</em>':"")+'</div>';
}
function thumbs(x){if(!x.imgs?.length)return x.i?"📷 "+x.i:"—";return '<div class="thumbs" onclick="viewImages('+x.id+')">'+x.imgs.slice(0,3).map(v=>mediaImgHtml(v)).join("")+(x.imgs.length>3?'<span class="thumbMore">+'+(x.imgs.length-3)+'</span>':'')+'</div>'}function render(){
 const all=load(),a=filtered(),td=today();
 $("#statToday").textContent=all.filter(x=>x.d===td).length;
 $("#statDoing").textContent=all.filter(x=>x.s==="Đang thực hiện").length;
 $("#statDone").textContent=all.filter(x=>x.s==="Đã hoàn thành").length;
 $("#statWait").textContent=all.filter(x=>x.s==="Chờ xử lý").length;
 $("#count").textContent=a.length+" công việc";
 document.querySelectorAll("#workPage .stats article[data-work-stat-filter]").forEach(card=>{
   const active=card.dataset.workStatFilter===workStatFilter;
   card.classList.toggle("active",active);
   card.setAttribute("aria-pressed",String(active));
 });
 $("#empty").classList.toggle("hide",a.length>0);
 $("#tbody").innerHTML=a.map((x,i)=>'<tr><td class="sttCell">'+(i+1)+'</td><td class="taskContentCell"><span class="taskTitle">'+esc(x.c)+'</span><small>'+esc(x.n||"Không có ghi chú")+'</small></td><td>'+typeBadge(x.t)+'</td><td>'+statusBadge(x.s)+'</td><td class="dateCell">'+fmt(x.d)+'</td><td>'+performerChipsHtml(x)+'</td><td>'+thumbs(x)+'</td><td class="noteCell">'+esc(x.n||"—")+'</td><td class="actionCell"><details class="rowActionMenu"><summary title="Thao tác">•••</summary><div><button type="button" onclick="editTask('+x.id+');this.closest(\'details\').removeAttribute(\'open\')">Sửa công việc</button>'+(x.imgs?.length?'<button type="button" onclick="viewImages('+x.id+');this.closest(\'details\').removeAttribute(\'open\')">Xem hình ảnh</button>':'')+'<button class="danger" type="button" onclick="delTask('+x.id+');this.closest(\'details\').removeAttribute(\'open\')">Xóa</button></div></details></td></tr>').join("");
 $("#mobileCards").innerHTML=a.map(x=>'<article class="mcard proTaskCard"><div class="mobileCardTop"><div><small>'+fmt(x.d)+'</small><h4 class="taskTitle">'+esc(x.c)+'</h4></div>'+statusBadge(x.s)+'</div><div class="mobileMeta">'+typeBadge(x.t)+performerChipsHtml(x,2)+'</div><p>'+esc(x.n||"Không có ghi chú")+'</p><div class="mobileCardFoot"><span>'+(x.imgs?.length?"📷 "+x.imgs.length+" hình":"Không có hình")+'</span><button onclick="editTask('+x.id+')">Chỉnh sửa →</button></div></article>').join("");
 hydrateMediaImages($("#tbody"));
}
window.editTask=id=>{
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 const x=load().find(y=>String(y.id)===String(id));if(!x){toast("Không tìm thấy công việc");return}
 clearPendingTaskFiles();
 existingTaskImages=Array.isArray(x.imgs)?[...x.imgs]:[];removedTaskImageRefs=[];
 $("#editId").value=x.id;$("#date").value=x.d;$("#content").value=x.c;$("#type").value=x.t||"Hằng ngày";$("#status").value=x.s;setPeopleSelected("task",performerArray(x));$("#note").value=x.n||"";
 $("#saveBtn").textContent="Lưu thay đổi";$("#cancelEdit").classList.remove("hide");
 openWorkEditDrawer();renderExistingTaskImages();updateTaskImageInfo();
};window.delTask=async id=>{if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}if(confirm("Xóa công việc này?")){save(load().filter(x=>x.id!==id));await syncTaskRecord("delete_task",id);render();renderHomeDashboard();toast("Đã xóa")}};window.viewImages=async id=>{
 let x=load().find(y=>String(y.id)===String(id));if(!x?.imgs?.length)return;
 // Image preview must be a clean, image-only layer. Close any task/detail drawer first.
 document.querySelectorAll(".demoDrawer").forEach(el=>el.classList.add("hide"));
 $("#demoNoticePanel")?.classList.add("hide");
 viewerMediaRefs=[...x.imgs];
 $("#viewer").classList.add("imageOnlyViewer");
 $("#viewerImages").innerHTML=viewerMediaRefs.map((v,i)=>'<div class="viewerMedia">'+mediaImgHtml(v,"viewerLargeImage")+'</div>').join("");
 $("#viewer").classList.remove("hide");
 await hydrateMediaImages($("#viewerImages"));
};function closeImageViewer(){
 $("#viewer").classList.add("hide");
 $("#viewer").classList.remove("imageOnlyViewer");
 $("#viewerImages").innerHTML="";
 viewerMediaRefs=[];
}
$("#closeViewer").onclick=e=>{e.stopPropagation();closeImageViewer()};
$("#viewer").addEventListener("click",e=>{
 if(e.target===$("#viewer"))closeImageViewer();
});
/* WORK_KPI_FILTERS */
document.querySelectorAll("#workPage .stats article[data-work-stat-filter]").forEach(card=>{
  const toggle=()=>{
    const next=card.dataset.workStatFilter||"";
    workStatFilter=workStatFilter===next?"":next;
    render();
  };
  card.addEventListener("click",toggle);
  card.addEventListener("keydown",e=>{
    if(e.key==="Enter"||e.key===" "){
      e.preventDefault();
      toggle();
    }
  });
});
/* END_WORK_KPI_FILTERS */
/* WORK_ROW_ACTION_MENU_SINGLE_OPEN */
document.addEventListener("click",e=>{
  const summary=e.target.closest?.("#workPage .rowActionMenu summary");
  if(summary){
    const current=summary.closest(".rowActionMenu");
    document.querySelectorAll("#workPage .rowActionMenu[open]").forEach(menu=>{
      if(menu!==current)menu.removeAttribute("open");
    });
    return;
  }
  const menu=e.target.closest?.("#workPage .rowActionMenu");
  if(!menu){
    document.querySelectorAll("#workPage .rowActionMenu[open]").forEach(openMenu=>openMenu.removeAttribute("open"));
  }
});
/* END_WORK_ROW_ACTION_MENU_SINGLE_OPEN */
/* ENERGY_ROW_ACTION_MENU_SINGLE_OPEN */
document.addEventListener("click",e=>{
  const summary=e.target.closest?.("#energyPage .rowActionMenu summary");
  if(summary){
    const current=summary.closest(".rowActionMenu");
    document.querySelectorAll("#energyPage .rowActionMenu[open]").forEach(menu=>{
      if(menu!==current)menu.removeAttribute("open");
    });
    return;
  }
  const menu=e.target.closest?.("#energyPage .rowActionMenu");
  if(!menu){
    document.querySelectorAll("#energyPage .rowActionMenu[open]").forEach(openMenu=>openMenu.removeAttribute("open"));
  }
});
/* END_ENERGY_ROW_ACTION_MENU_SINGLE_OPEN */$("#toggleFilter").onclick=e=>{e.stopPropagation();const hidden=$("#filterBar").classList.toggle("hide");$("#toggleFilter").setAttribute("aria-expanded",String(!hidden))};$("#filterBar").onclick=e=>e.stopPropagation();
["fromDate","toDate"].forEach(id=>{
 const input=$("#"+id);
 if(!input)return;
 const openPicker=()=>{
   try{
     if(typeof input.showPicker==="function")input.showPicker();
   }catch(e){}
 };
 input.addEventListener("click",openPicker);
 input.addEventListener("pointerdown",e=>{
   if(e.pointerType==="mouse"){
     setTimeout(openPicker,0);
   }
 });
 input.closest("label")?.addEventListener("click",e=>{
   if(e.target===input)return;
   input.focus({preventScroll:true});
   openPicker();
 });
});function closeWorkFilter(){
 const bar=$("#filterBar"),btn=$("#toggleFilter");
 if(!bar||bar.classList.contains("hide"))return;
 bar.classList.add("hide");
 btn?.setAttribute("aria-expanded","false");
}
document.addEventListener("pointerdown",e=>{
 const bar=$("#filterBar"),btn=$("#toggleFilter");
 if(!bar||bar.classList.contains("hide"))return;
 if(bar.contains(e.target)||btn?.contains(e.target))return;
 closeWorkFilter();
},true);
document.addEventListener("keydown",e=>{
 if(e.key==="Escape")closeWorkFilter();
});["search","globalSearch","fromDate","toDate"].forEach(x=>$("#"+x).addEventListener("input",render));["filterStatus","filterType"].forEach(x=>$("#"+x).onchange=render);function iso(d){return d.toLocaleDateString("en-CA")}function rangeDates(kind){let d=new Date(),from="",to="";if(kind==="today"){from=to=iso(d)}else if(kind==="week"){let first=new Date(d.getFullYear(),d.getMonth(),1),last=new Date(d.getFullYear(),d.getMonth()+1,0),day=(d.getDay()+6)%7,a=new Date(d);a.setDate(d.getDate()-day);let b=new Date(a);b.setDate(a.getDate()+6);if(a<first)a=first;if(b>last)b=last;from=iso(a);to=iso(b)}else if(kind==="month"){let a=new Date(d.getFullYear(),d.getMonth(),1),b=new Date(d.getFullYear(),d.getMonth()+1,0);from=iso(a);to=iso(b)}return{from,to}}$("#quickRange").onchange=()=>{let v=$("#quickRange").value;if(!v)return;let r=rangeDates(v);$("#fromDate").value=r.from;$("#toDate").value=r.to;render()};$("#clear").onclick=()=>{$("#search").value=$("#globalSearch").value=$("#fromDate").value=$("#toDate").value=$("#filterStatus").value=$("#filterType").value=$("#quickRange").value="";workStatFilter="";render()};function reportStatusClass(s){
 if(s==="Đã hoàn thành")return "done";
 if(s==="Đang thực hiện")return "doing";
 return "waiting";
}
function reportTypeClass(t){
 if(t==="Sự cố")return "incident";
 if(t==="Bảo trì")return "maintenance";
 return "daily";
}
function workReportPeriod(kind="current",rows=[]){
 const now=new Date(),y=now.getFullYear(),m=now.getMonth(),day=now.getDate(),mm=String(m+1).padStart(2,"0"),dd=String(day).padStart(2,"0");
 const first=new Date(y,m,1),last=new Date(y,m+1,0);
 const firstOffset=(first.getDay()+6)%7;
 const weekNo=Math.floor((day+firstOffset-1)/7)+1;
 const rr=kind==="current"?null:rangeDates(kind);
 let from=rr?.from||$("#fromDate").value||"",to=rr?.to||$("#toDate").value||"";
 if(kind==="current"&&(!from||!to)&&rows.length){
   const dates=rows.map(x=>x.d).filter(Boolean).sort();
   if(!from)from=dates[0]||"";
   if(!to)to=dates[dates.length-1]||"";
 }
 let label,suffix,code;
 if(kind==="today"){
   label="NGÀY "+dd+"/"+mm+"/"+y;suffix="Ngay"+dd+"_"+mm+"_"+y;code="BC-CV-"+y+mm+dd;
 }else if(kind==="week"){
   label="TUẦN "+weekNo+" THÁNG "+mm+"/"+y;suffix="Tuan"+weekNo+"_Thang"+mm+"_"+y;code="BC-CV-"+y+mm+"-T"+weekNo;
 }else if(kind==="month"){
   label="THÁNG "+mm+"/"+y;suffix="Thang"+mm+"_"+y;code="BC-CV-"+y+mm;
 }else{
   const prettyFrom=from?fmt(from):"Đầu kỳ",prettyTo=to?fmt(to):"Hiện tại";
   label=from===to&&from?"NGÀY "+prettyFrom:"TỪ "+prettyFrom+" ĐẾN "+prettyTo;
   suffix=(from&&to?"Tu"+from.replaceAll("-","")+"_Den"+to.replaceAll("-",""):"TheoBoLoc");
   code="BC-CV-"+y+mm+"-LOC";
 }
 return {kind,from,to,label,suffix,code};
}
function workReportFilename(period){
 return "BaoCao_CongViec_"+period.suffix+".pdf";
}
function reportHtml(a,kind="current",photoLayout=2){
 const reportPeriod=workReportPeriod(kind,a);
 const projectName=currentBuilding?.name||"[CẦN BỔ SUNG]";
 const done=a.filter(x=>x.s==="Đã hoàn thành").length;
 const doing=a.filter(x=>x.s==="Đang thực hiện").length;
 const wait=a.length-done-doing;
 const incidents=a.filter(x=>(x.t||"")==="Sự cố").length;
 const periodText=reportPeriod.from||reportPeriod.to
   ?((reportPeriod.from?fmt(reportPeriod.from):"Đầu kỳ")+" - "+(reportPeriod.to?fmt(reportPeriod.to):"Hiện tại"))
   :"Toàn bộ dữ liệu";
 const units=[...new Set(a.flatMap(x=>{
   const names=[...performerArray(x)];
   const contractor=x._reportContractor?.name||x.contractorName||"";
   if(contractor)names.push(contractor);
   return names.filter(Boolean);
 }))];
 const executionUnits=units.length?units.join(", "):"[CẦN BỔ SUNG]";
 const photoCols=1;
 const reportDate=new Date().toLocaleDateString("vi-VN");

 const header=(step,compact=false)=>'<div class="reportHeader '+(compact?"compact":"")+'">'+
   '<div class="brandBlock"><div class="brandRow"><span class="brandStar">✦</span><div><strong>ESTA</strong><small>PROPERTY MANAGEMENT</small></div></div></div>'+
   '<div class="headerReport"><b>BÁO CÁO CÔNG VIỆC KỸ THUẬT</b><span>TỔNG HỢP & CHI TIẾT</span></div>'+
   '</div><div class="projectName">'+esc(projectName)+'</div>'+
   '<div class="sectionRibbon">'+esc(step)+'</div>';

 const infoBlock=()=>'<div class="reportInfo">'+
   '<div><span>TÒA NHÀ</span><b>'+esc(projectName)+'</b></div>'+
   '<div><span>NGÀY BÁO CÁO</span><b>'+esc(reportDate)+'</b></div>'+
   '<div><span>ĐƠN VỊ THỰC HIỆN</span><b>'+esc(executionUnits)+'</b></div>'+
   '<div><span>NGƯỜI LẬP</span><b>&nbsp;</b></div>'+
   '</div><div class="periodBand"><span>KỲ BÁO CÁO</span><b>'+esc(reportPeriod.label)+'</b><em>'+esc(periodText)+'</em></div>';

 const signatures=()=>'<div class="signature3">'+
   '<div><b>NGƯỜI LẬP BÁO CÁO</b><small>(Ký, ghi rõ họ tên)</small><i></i></div>'+
   '<div><b>TRƯỞNG BỘ PHẬN KỸ THUẬT</b><small>(Ký, ghi rõ họ tên)</small><i></i></div>'+
   '<div><b>BAN QUẢN LÝ TÒA NHÀ</b><small>(Ký, ghi rõ họ tên)</small><i></i></div>'+
   '</div>';

 const summaryRows=a.map((x,i)=>{
   const type=x.t||"Hằng ngày",performers=performerArray(x).join(", ")||"—";
   return '<tr>'+
     '<td class="num">'+String(i+1).padStart(2,"0")+'</td>'+
     '<td class="taskName">'+esc(x.c||"—")+'</td>'+
     '<td><span class="typePill '+reportTypeClass(type)+'">'+esc(type)+'</span></td>'+
     '<td><span class="statusPill '+reportStatusClass(x.s)+'">'+esc(x.s||"—")+'</span></td>'+
     '<td>'+esc(fmt(x.d))+'</td>'+
     '<td class="performer">'+esc(performers)+'</td>'+
     '<td class="noteText">'+esc(x.n||"—")+'</td>'+
   '</tr>';
 }).join("");

 const summaryPage='<section class="reportSheet summarySheet">'+header("BƯỚC 1 · TỔNG HỢP")+
   '<div class="sheetInner">'+
   '<div class="stepLabel">BƯỚC 1 · BÁO CÁO TỔNG HỢP</div>'+
   '<h1>Danh sách công việc kỹ thuật</h1><div class="goldRule"></div>'+
   infoBlock()+
   '<div class="kpis">'+
     '<article class="main"><b>'+a.length+'</b><span>TỔNG CÔNG VIỆC</span></article>'+
     '<article><b>'+doing+'</b><span>ĐANG THỰC HIỆN</span></article>'+
     '<article><b>'+wait+'</b><span>CHỜ XỬ LÝ</span></article>'+
     '<article><b>'+done+'</b><span>HOÀN THÀNH</span></article>'+
     '<article><b>'+incidents+'</b><span>SỰ CỐ</span></article>'+
   '</div>'+
   '<div class="summaryCaption">Tổng hợp tình trạng thực hiện công việc kỹ thuật trong kỳ báo cáo.</div>'+
   '<div class="tableLabel">DANH SÁCH CÔNG VIỆC ('+a.length+')</div>'+
   '<table class="summaryTable"><colgroup><col style="width:5%"><col style="width:25%"><col style="width:10%"><col style="width:12%"><col style="width:11%"><col style="width:16%"><col style="width:21%"></colgroup>'+
   '<thead><tr><th>STT</th><th>NỘI DUNG CÔNG VIỆC</th><th>LOẠI</th><th>TRẠNG THÁI</th><th>NGÀY</th><th>NGƯỜI THỰC HIỆN</th><th>GHI CHÚ</th></tr></thead>'+
   '<tbody>'+summaryRows+'</tbody></table>'+
   signatures()+
   '</div></section>';

 const detailInfo=(x)=>{
   const blocks=[];
   const causeRaw=String(x.cause||x._reportIncident?.cause||"").trim();
   const cause=["[Chưa xác định]","Chưa xác định","Chưa ghi nhận"].includes(causeRaw)?"":causeRaw;
   const result=x.result||x._reportIncident?.solution||"";
   const asset=x._reportAsset?((x._reportAsset.code?x._reportAsset.code+" · ":"")+x._reportAsset.name):"";
   const contractor=x._reportContractor?.name||x.contractorName||"";
   const mats=(x._reportMaterials||x.materials||[]).filter(Boolean).map(m=>{
     const qty=m.qty!==undefined&&m.qty!==null?(" × "+m.qty+(m.unit?" "+m.unit:"")):"";
     return (m.name||m.code||"Vật tư")+qty;
   }).join(", ");
   if(cause)blocks.push('<div><span>NGUYÊN NHÂN</span><p>'+esc(cause)+'</p></div>');
   if(result)blocks.push('<div><span>HƯỚNG XỬ LÝ / KẾT QUẢ</span><p>'+esc(result)+'</p></div>');
   if(asset)blocks.push('<div><span>THIẾT BỊ LIÊN QUAN</span><p>'+esc(asset)+'</p></div>');
   if(x.incidentCode)blocks.push('<div><span>SỰ CỐ LIÊN QUAN</span><p>'+esc(x.incidentCode)+'</p></div>');
   if(x.inspectionCode)blocks.push('<div><span>CHECKLIST LIÊN QUAN</span><p>'+esc(x.inspectionCode)+'</p></div>');
   if(contractor)blocks.push('<div><span>NHÀ THẦU</span><p>'+esc(contractor)+'</p></div>');
   if(mats)blocks.push('<div><span>VẬT TƯ SỬ DỤNG</span><p>'+esc(mats)+'</p></div>');
   return blocks.length?'<div class="extraGrid">'+blocks.join("")+'</div>':"";
 };

 const detailCard=(x,i,photoRef=null,photoIndex=1,totalPhotos=1)=>{
   const type=x.t||"Hằng ngày",performers=performerArray(x).join(", ")||"—";
   const hasRealPhoto=!!photoRef;
   const photoLabel=hasRealPhoto?("HÌNH "+photoIndex+" / "+totalPhotos):"CHƯA CÓ HÌNH ẢNH";
   const photoItem=hasRealPhoto
     ?'<figure><div class="photoFrame"><img src="'+esc(photoRef)+'" alt="Công việc '+(i+1)+' · Hình '+photoIndex+'"></div><figcaption>Hình '+photoIndex+' / '+totalPhotos+' · '+esc(x.c||"Công việc kỹ thuật")+'</figcaption></figure>'
     :'<figure class="placeholder"><div class="photoFrame placeholderFrame"><div><b>✦</b><span>HÌNH ẢNH CHƯA CẬP NHẬT</span></div></div><figcaption>'+esc(x.c||"Công việc kỹ thuật")+'</figcaption></figure>';
   return '<article class="detailCard singlePhotoCard">'+
     '<div class="detailHead"><div class="detailNo">'+String(i+1).padStart(2,"0")+'</div><div class="detailTitleWrap"><h2>'+esc(x.c||"—")+'</h2><small>'+photoLabel+'</small></div><span class="statusPill '+reportStatusClass(x.s)+'">'+esc(x.s||"—")+'</span></div>'+
     '<div class="detailMeta"><div><span>LOẠI CÔNG VIỆC</span><b>'+esc(type)+'</b></div><div><span>NGÀY THỰC HIỆN</span><b>'+esc(fmt(x.d))+'</b></div><div><span>NGƯỜI THỰC HIỆN</span><b>'+esc(performers)+'</b></div></div>'+
     '<div class="detailNote"><span>GHI CHÚ</span><p>'+esc(x.n||"—")+'</p></div>'+
     detailInfo(x)+
     '<div class="photoTitle">HÌNH ẢNH HIỆN TRƯỜNG · '+photoLabel+'</div>'+
     '<div class="detailPhotos cols1">'+photoItem+'</div>'+
   '</article>';
 };

 const detailUnits=[];
 a.forEach((x,i)=>{
   const imgs=(x._reportImages||[]).filter(Boolean);
   if(!imgs.length){
     detailUnits.push({x,i,photo:null,photoIndex:0,totalPhotos:0});
     return;
   }
   imgs.forEach((photo,p)=>detailUnits.push({
     x,i,photo,photoIndex:p+1,totalPhotos:imgs.length
   }));
 });

 const detailPages=detailUnits.map((u,pageIndex)=>{
   const first=pageIndex===0,last=pageIndex===detailUnits.length-1;
   return '<section class="reportSheet detailSheet singlePhotoSheet">'+
     header(first?"BƯỚC 2 · CHI TIẾT & HÌNH ẢNH":"BÁO CÁO CHI TIẾT & HÌNH ẢNH",true)+
     '<div class="sheetInner detailSheetInner">'+
       (first?'<div class="stepLabel">BƯỚC 2 · BÁO CÁO CHI TIẾT KÈM HÌNH ẢNH</div><h1>Chi tiết công việc & hình ảnh hiện trường</h1><div class="goldRule"></div>'+infoBlock()+
       '<div class="detailSummary">MỖI TRANG 01 HÌNH ẢNH · ẢNH ĐƯỢC GIỮ NGUYÊN TỶ LỆ · ĐÚNG THEO TỪNG CÔNG VIỆC</div>':"")+
       detailCard(u.x,u.i,u.photo,u.photoIndex,u.totalPhotos)+
     '</div></section>';
 }).join("");
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BÁO CÁO CÔNG VIỆC KỸ THUẬT - '+esc(reportPeriod.label)+'</title><style>'+
 '*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}'+
 '@page{size:A4 portrait;margin:0}html,body{margin:0;padding:0;background:#f7dfb6;color:#4b1138;font-family:Arial,Helvetica,sans-serif}body{font-size:9.2px;line-height:1.3}'+
 '.reportSheet{width:210mm;min-height:297mm;background:#f6ddb2;position:relative;page-break-after:always;break-after:page;overflow:visible}.reportSheet:last-child{page-break-after:auto;break-after:auto}'+
 '.reportHeader{height:39mm;background:#4b1239;color:#f7e7c7;display:flex;align-items:center;justify-content:space-between;padding:8mm 17mm 6mm;border-bottom:1.2mm solid #b8732d}.reportHeader.compact{height:21mm;padding:4.5mm 17mm;border-bottom:.8mm solid #b8732d}.brandRow{display:flex;align-items:center;gap:4mm}.brandStar{font-size:31px;line-height:1;color:#f6d9a9}.brandBlock strong{display:block;font-size:22px;letter-spacing:2.1px}.brandBlock small{display:block;margin-top:2px;font-size:5.7px;letter-spacing:2.2px;color:#ead9c6}.headerReport{text-align:right}.headerReport b{display:block;font-size:8.5px;letter-spacing:1.2px}.headerReport span{display:block;margin-top:4px;font-size:6px;letter-spacing:2.1px;color:#dcc2cb}'+
 '.projectName{height:9mm;display:grid;place-items:center;background:#f6ddb2;color:#4b1239;font-size:10px;font-weight:900;letter-spacing:.6px;text-align:center;padding:0 15mm;border-bottom:1px solid #c78b45}.reportHeader.compact+.projectName{height:7mm;font-size:8.5px}.sectionRibbon{height:6.5mm;display:flex;align-items:flex-end;padding:0 17mm 1.5mm;background:#f6ddb2;color:#a6611e;font-size:6.5px;font-weight:900;letter-spacing:.35px}'+
 '.sheetInner{padding:3.5mm 17mm 16mm}.stepLabel{font-size:6.7px;font-weight:900;letter-spacing:.35px;color:#a6611e}.sheetInner h1{margin:1.5mm 0 1.5mm;font-size:18px;line-height:1.08;color:#4b1239}.goldRule{height:.5mm;background:#b66f28;margin-bottom:3mm}'+
 '.reportInfo{display:grid;grid-template-columns:1fr 1fr;margin-bottom:0;border-top:1px solid #c7a473;border-bottom:1px solid #c7a473}.reportInfo>div{display:grid;grid-template-columns:30mm 1fr;min-height:7mm;align-items:center;padding:.8mm 0;border-bottom:1px solid #d7b888}.reportInfo>div:nth-last-child(-n+2){border-bottom:0}.reportInfo>div:nth-child(odd){padding-right:4mm}.reportInfo>div:nth-child(even){padding-left:4mm}.reportInfo span{font-size:6.2px;font-weight:900;color:#755044}.reportInfo b{font-size:8.2px;color:#4b1239;overflow-wrap:anywhere}.periodBand{display:flex;align-items:center;gap:3mm;min-height:7mm;padding:1.2mm 0 0;color:#4b1239}.periodBand span{font-size:6.2px;font-weight:900;color:#755044}.periodBand b{font-size:7.8px}.periodBand em{margin-left:auto;font-size:6.4px;font-style:normal;color:#8c7566}'+
 '.kpis{display:grid;grid-template-columns:1.2fr repeat(4,1fr);gap:2mm;margin:2.5mm 0 1.8mm}.kpis article{min-height:18mm;padding:3mm;border-top:.8mm solid #b87531;background:rgba(255,250,232,.58)}.kpis article.main{background:#4b1239;color:#f7e7c7;border-top:0}.kpis b{display:block;font-size:20px;line-height:1}.kpis span{display:block;margin-top:2mm;font-size:6.1px;font-weight:900;letter-spacing:.15px}.kpis article:not(.main) b{color:#4b1239}.summaryCaption{margin-bottom:2.5mm;font-size:6.4px;color:#806b61}'+
 '.tableLabel{margin:2.5mm 0 1.7mm;font-size:6.4px;font-weight:900;color:#a6611e}.summaryTable{width:100%;border-collapse:collapse;table-layout:fixed}.summaryTable thead{display:table-header-group}.summaryTable th{padding:2.2mm 1.4mm;background:#4b1239;color:#fff;font-size:5.9px;text-align:left;vertical-align:middle}.summaryTable td{padding:1.8mm 1.4mm;border-bottom:1px solid #c6a779;color:#4d263e;font-size:6.5px;vertical-align:middle;overflow-wrap:anywhere}.summaryTable tbody tr:nth-child(even) td{background:rgba(255,255,255,.12)}.summaryTable .num{font-weight:900}.summaryTable .taskName{font-weight:800;font-size:7.1px}.summaryTable .performer{font-weight:800}.summaryTable .noteText{color:#7d665d;line-height:1.25}.typePill,.statusPill{display:inline-flex;align-items:center;justify-content:center;min-height:5mm;padding:0 2mm;border:1px solid #b89d77;border-radius:99px;font-size:5.6px;font-weight:800;white-space:nowrap}.typePill.incident{background:#4b1239;color:#fff;border-color:#4b1239}.statusPill.doing{background:#b26d1f;color:#fff;border-color:#b26d1f}.statusPill.done{background:#315f4e;color:#fff;border-color:#315f4e}.statusPill.waiting{background:#fff6df;color:#7c4e24;border-color:#b97631}'+
 '.signature3{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm;margin-top:4mm;padding-top:3mm;border-top:1.5px solid #a86d22;page-break-inside:avoid}.signature3>div{text-align:left}.signature3 b{display:block;font-size:7px}.signature3 small{display:block;margin-top:1mm;font-size:6px;color:#8a7467;font-style:italic}.signature3 i{display:block;height:18mm;border-bottom:1px solid #c9aa7d}'+
 '.detailSummary{margin:0 0 2.5mm;font-size:6.2px;font-weight:900;color:#7a4f3c}.singlePhotoSheet{height:297mm;min-height:297mm;max-height:297mm;overflow:hidden!important}.detailSheetInner{padding-bottom:10mm}.detailCard{border:1px solid #b58c58;margin-bottom:2.5mm;page-break-inside:avoid!important;break-inside:avoid!important;background:rgba(255,255,255,.12)}.singlePhotoCard{overflow:hidden}.detailHead{display:grid;grid-template-columns:13mm 1fr auto;align-items:center;border-bottom:1.5px solid #a86d22}.detailNo{height:11mm;display:grid;place-items:center;background:#4b1239;color:#fff;font-size:14px;font-weight:900}.detailTitleWrap{padding:0 4mm}.detailTitleWrap h2{margin:0;font-size:10.5px;line-height:1.2;color:#4b1239}.detailTitleWrap small{display:block;margin-top:1mm;font-size:5.8px;font-weight:900;color:#a6611e}.detailHead>.statusPill{margin-right:3mm}.detailMeta{display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #c9aa7d}.detailMeta>div{padding:1.8mm 3mm}.detailMeta span,.detailNote span,.extraGrid span{display:block;margin-bottom:.8mm;font-size:5.8px;font-weight:900;color:#715044}.detailMeta b{font-size:7.6px}.detailNote{padding:1.8mm 3mm;border-bottom:1px solid #c9aa7d}.detailNote p,.extraGrid p{margin:0;color:#543b43;font-size:6.9px;line-height:1.25;white-space:pre-wrap;overflow-wrap:anywhere}.extraGrid{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #c9aa7d}.extraGrid>div{padding:1.6mm 3mm;border-bottom:1px solid #dec59e}.extraGrid>div:nth-child(odd){border-right:1px solid #dec59e}.photoTitle{padding:1.8mm 3mm 1.2mm;font-size:6px;font-weight:900;color:#a6611e}.detailPhotos{display:block;padding:0 3mm 2.5mm}.detailPhotos figure{margin:0;page-break-inside:avoid!important;break-inside:avoid!important}.photoFrame{width:100%;height:112mm;border:1px solid #bca184;background:#f4e9c8;display:flex;align-items:center;justify-content:center;overflow:hidden;page-break-inside:avoid!important}.photoFrame img{display:block;width:100%;height:100%;object-fit:contain;object-position:center;background:#fff}.placeholderFrame>div{display:grid;place-items:center;align-content:center;color:#8f806f;gap:2mm}.placeholderFrame b{font-size:22px}.placeholderFrame span{font-size:7px;font-weight:900;letter-spacing:1.5px}.detailPhotos figcaption{margin-top:1mm;text-align:center;font-size:6.2px;font-weight:700;color:#7f6a5d}.detailSheet .signature3{margin-top:2mm}'+
 '</style></head><body data-pdf-report="work-combined" data-photo-layout="1">'+summaryPage+detailPages+'</body></html>';
}
let reportPdfLibPromise=null;
function loadExternalScript(url){
 return new Promise((resolve,reject)=>{
   const existing=[...document.scripts].find(s=>s.src===url);
   if(existing){
     if(window.html2pdf)return resolve();
     existing.addEventListener("load",resolve,{once:true});
     existing.addEventListener("error",reject,{once:true});
     return;
   }
   const s=document.createElement("script");
   s.src=url;s.async=true;
   s.onload=resolve;s.onerror=()=>reject(new Error("Không tải được thư viện PDF"));
   document.head.appendChild(s);
 });
}
async function ensureHtml2Pdf(){
 if(window.html2pdf)return window.html2pdf;
 if(reportPdfLibPromise)return reportPdfLibPromise;
 reportPdfLibPromise=(async()=>{
   const urls=[
     "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js",
     "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js"
   ];
   let lastErr=null;
   for(const url of urls){
     try{await loadExternalScript(url);if(window.html2pdf)return window.html2pdf}catch(e){lastErr=e}
   }
   throw lastErr||new Error("Không tải được thư viện PDF");
 })();
 try{return await reportPdfLibPromise}catch(e){reportPdfLibPromise=null;throw e}
}
function pdfSafeFilename(name){
 return String(name||"ESTA-bao-cao")
   .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .replace(/đ/g,"d").replace(/Đ/g,"D")
   .replace(/[^a-zA-Z0-9._-]+/g,"-")
   .replace(/-+/g,"-").replace(/^-|-$/g,"")
   .slice(0,120)||"ESTA-bao-cao";
}
function reportFilenameFromHtml(html){
 try{
   const d=new DOMParser().parseFromString(html,"text/html");
   return pdfSafeFilename(d.title||"ESTA-bao-cao")+"-"+today()+".pdf";
 }catch(e){return "ESTA-bao-cao-"+today()+".pdf"}
}
function blobAsDataUrl(blob){
 return new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onload=()=>resolve(String(reader.result||""));
   reader.onerror=()=>reject(new Error("Không đọc được hình ảnh"));
   reader.readAsDataURL(blob);
 });
}
async function reportImageDataUrl(ref){
 if(!ref)return "";
 if(/^data:image\//i.test(ref))return ref;
 try{
   let response;
   if(isStorageRef(ref)){
     if(!centralSession?.access_token)throw new Error("Phiên đăng nhập đã hết hạn");
     const path=storagePathFromRef(ref);
     response=await centralAuthFetch(SB_URL+"/storage/v1/object/authenticated/"+MEDIA_BUCKET+"/"+mediaPathUrl(path),{cache:"force-cache"});
   }else{
     response=await fetch(ref,{cache:"force-cache"});
   }
   if(!response.ok)throw new Error("Không tải được hình");
   return await blobAsDataUrl(await response.blob());
 }catch(e){
   console.warn("Report image failed",ref,e);
   return "";
 }
}
async function prepareWorkReportRows(rows){
 const prepared=[];
 let total=0,failed=0;
 let assets=[],linkedContractors=[],incidents=[],materials=[];
 try{
   if(centralSession?.access_token&&currentBuilding?.id){
     const b=encodeURIComponent(currentBuilding.id);
     [assets,linkedContractors,incidents,materials]=await Promise.all([
       sbFetch("/rest/v1/maintenance_assets?building_id=eq."+b+"&select=id,code,name,system_type,location",{token:centralSession.access_token}).catch(()=>[]),
       sbFetch("/rest/v1/contractors?building_id=eq."+b+"&select=id,name,specialty",{token:centralSession.access_token}).catch(()=>[]),
       sbFetch("/rest/v1/incidents?building_id=eq."+b+"&select=incident_code,cause,solution,area,severity,status",{token:centralSession.access_token}).catch(()=>[]),
       sbFetch("/rest/v1/inventory_materials?building_id=eq."+b+"&select=id,code,name,unit",{token:centralSession.access_token}).catch(()=>[])
     ]);
   }
 }catch(e){console.warn("Không tải đủ dữ liệu liên kết cho báo cáo",e)}
 const assetMap=new Map((assets||[]).map(x=>[String(x.id),x]));
 const contractorMap=new Map((linkedContractors||[]).map(x=>[String(x.id),x]));
 const incidentMap=new Map((incidents||[]).map(x=>[String(x.incident_code),x]));
 const materialMap=new Map((materials||[]).map(x=>[String(x.id),x]));
 for(const x of rows){
   const refs=Array.isArray(x.imgs)?x.imgs.filter(Boolean):[];
   total+=refs.length;
   const converted=await Promise.all(refs.map(reportImageDataUrl));
   failed+=converted.filter(v=>!v).length;
   const taskMaterials=(Array.isArray(x.materials)?x.materials:[]).map(m=>{
     const found=materialMap.get(String(m.materialId||m.id||""));
     return {
       ...m,
       name:m.name||found?.name||found?.code||"",
       unit:m.unit||found?.unit||""
     };
   });
   prepared.push({
     ...x,
     _reportImages:converted.filter(Boolean),
     _reportAsset:assetMap.get(String(x.assetId||x.asset_id||""))||null,
     _reportContractor:contractorMap.get(String(x.contractorId||x.contractor_id||""))||null,
     _reportIncident:incidentMap.get(String(x.incidentCode||""))||null,
     _reportMaterials:taskMaterials
   });
 }
 return {rows:prepared,total,failed};
}
async function waitForReportImages(doc,timeout=12000){
 const images=[...(doc?.images||[])];
 if(!images.length)return;
 await Promise.all(images.map(img=>{
   if(img.complete&&img.naturalWidth>0)return Promise.resolve();
   return new Promise(resolve=>{
     let done=false;
     const finish=()=>{if(done)return;done=true;resolve()};
     img.addEventListener("load",finish,{once:true});
     img.addEventListener("error",finish,{once:true});
     setTimeout(finish,timeout);
   });
 }));
}
function writeReportLoadingTab(w){
 if(!w||w.closed)return;
 try{
   w.document.open();
   w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Đang tạo PDF</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1322;color:#e8eef9;font-family:Arial,sans-serif}.box{text-align:center}.spin{width:38px;height:38px;margin:0 auto 15px;border:4px solid #24334d;border-top-color:#20d9ef;border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}b{font-size:16px}p{color:#8ea0bc;font-size:12px}</style></head><body><div class="box"><div class="spin"></div><b>Đang tạo báo cáo PDF...</b><p>Đang chuẩn bị nội dung và hình ảnh. Vui lòng chờ.</p></div></body></html>');
   w.document.close();
 }catch(e){}
}
async function downloadReportPdf(html,filename="",previewWindow=null){
 if(!html)return;
 let frame=null,pdfUrl="";
 try{
   toast("Đang tạo file PDF...");
   const html2pdf=await ensureHtml2Pdf();
   const landscape=/@page\s*\{[^}]*landscape/i.test(html);
   const inspectionReport=/data-pdf-report=["\']inspection["\']/.test(String(html));
   const workCombinedReport=/data-pdf-report=["\']work-combined["\']/.test(String(html));
   const cleaned=String(html).replace(/<script[\s\S]*?<\/script>/gi,"");
   frame=document.createElement("iframe");
   frame.setAttribute("aria-hidden","true");
   Object.assign(frame.style,{
     position:"fixed",left:"-12000px",top:"0",
     width:(landscape?1120:794)+"px",
     height:(landscape?794:1120)+"px",
     border:"0",background:"#fff",opacity:"0.01",pointerEvents:"none"
   });
   const loaded=new Promise((resolve,reject)=>{
     const timer=setTimeout(()=>reject(new Error("Tạo trang PDF quá thời gian")),10000);
     frame.onload=()=>{clearTimeout(timer);resolve()};
   });
   frame.srcdoc=cleaned;
   document.body.appendChild(frame);
   await loaded;
   const doc=frame.contentDocument;
   const body=doc?.body;
   if(!body)throw new Error("Không tạo được nội dung PDF");
   if(doc.fonts?.ready)try{await doc.fonts.ready}catch(e){}
   await waitForReportImages(doc);
   await new Promise(r=>setTimeout(r,100));

   const finalName=filename?pdfSafeFilename(filename.replace(/\.pdf$/i,""))+".pdf":reportFilenameFromHtml(html);
   const worker=html2pdf().set({
     margin:workCombinedReport?[0,0,0,0]:(inspectionReport?[18,18,18,18]:[8,8,9,8]),
     filename:finalName,
     image:{type:"jpeg",quality:workCombinedReport?0.92:0.98},
     html2canvas:{
       scale:workCombinedReport?1.15:1.8,
       useCORS:true,
       allowTaint:false,
       backgroundColor:workCombinedReport?"#f7dfb6":"#ffffff",
       logging:false,
       scrollX:0,
       scrollY:0,
       imageTimeout:15000
     },
     jsPDF:{unit:"mm",format:"a4",orientation:landscape?"landscape":"portrait",compress:true},
     pagebreak:{mode:["css","legacy"],avoid:["figure",".note",".sign",".jobHead",".detailCard",".signature3"]}
   }).from(body).toPdf();
   const pdf=await worker.get("pdf");
   if(workCombinedReport){
     const totalPages=pdf.internal.getNumberOfPages();
     for(let pageNo=1;pageNo<=totalPages;pageNo++){
       pdf.setPage(pageNo);
       const pageW=pdf.internal.pageSize.getWidth(),pageH=pdf.internal.pageSize.getHeight();
       const footerCanvas=document.createElement("canvas");
       footerCanvas.width=1800;footerCanvas.height=70;
       const ctx=footerCanvas.getContext("2d");
       ctx.clearRect(0,0,footerCanvas.width,footerCanvas.height);
       ctx.font="21px Arial, sans-serif";
       ctx.fillStyle="#8e7a69";
       ctx.textBaseline="middle";
       ctx.textAlign="left";
       ctx.fillText("ESTA PROPERTY MANAGEMENT · A L'MAK COMPANY · HO CHI MINH CITY",0,35);
       ctx.textAlign="right";
       ctx.fillText("Trang "+pageNo+" / "+totalPages,footerCanvas.width,35);
       const footerImg=footerCanvas.toDataURL("image/png");
       pdf.addImage(footerImg,"PNG",17,pageH-8,pageW-34,4.4);
     }
   }else if(inspectionReport){
     const totalPages=pdf.internal.getNumberOfPages();
     for(let pageNo=1;pageNo<=totalPages;pageNo++){
       pdf.setPage(pageNo);
       const pageW=pdf.internal.pageSize.getWidth(),pageH=pdf.internal.pageSize.getHeight();
       const footerCanvas=document.createElement("canvas");
       footerCanvas.width=1400;footerCanvas.height=70;
       const ctx=footerCanvas.getContext("2d");
       ctx.clearRect(0,0,footerCanvas.width,footerCanvas.height);
       ctx.font="24px Arial, sans-serif";
       ctx.fillStyle="#7d8992";
       ctx.textAlign="center";
       ctx.textBaseline="middle";
       ctx.fillText("Trang "+pageNo+"/"+totalPages+" · Báo cáo được tạo tự động từ hệ thống ESTA",footerCanvas.width/2,footerCanvas.height/2);
       const footerImg=footerCanvas.toDataURL("image/png");
       pdf.addImage(footerImg,"PNG",18,pageH-10,pageW-36,5);
     }
   }
   const blob=pdf.output("blob");
   pdfUrl=URL.createObjectURL(blob);

   if(previewWindow&&!previewWindow.closed){
     previewWindow.location.replace(pdfUrl);
     toast("Đã tạo PDF · hình ảnh đã được đính kèm");
   }else{
     const a=document.createElement("a");
     a.href=pdfUrl;a.download=finalName;
     document.body.appendChild(a);a.click();a.remove();
     toast("Đã tải file PDF");
   }
   setTimeout(()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl)},300000);
 }catch(err){
   console.warn("PDF generation failed",err);
   toast("PDF chưa tạo được. Đang mở bản xem báo cáo dự phòng...");
   try{
     let w=previewWindow;
     if(!w||w.closed)w=open("","_blank");
     if(!w)throw new Error("Trình duyệt đang chặn cửa sổ xem báo cáo");
     w.document.open();w.document.write(html);w.document.close();
   }catch(e){toast(e.message||"Không thể xuất PDF")}
 }finally{
   if(frame)setTimeout(()=>frame.remove(),400);
 }
}
window.downloadReportPdf=downloadReportPdf;

let workReportBusy=false;
function estaGeneratorStatus(status){
 return status==="Đã hoàn thành"?"Hoàn thành":String(status||"Chờ xử lý");
}
function estaGeneratorPayload(rows){
 return {
   building:String(currentBuilding?.name||"[CẦN BỔ SUNG]"),
   report_date:new Date().toLocaleDateString("vi-VN"),
   prepared_by:"",
   images_per_row:1,
   tasks:rows.map(x=>({
     title:String(x.c||"[CẦN BỔ SUNG]"),
     type:String(x.t||"Hằng ngày"),
     status:estaGeneratorStatus(x.s),
     date:x.d?fmt(x.d):"[CẦN BỔ SUNG]",
     assignee:performerArray(x).join(", ")||"[CẦN BỔ SUNG]",
     note:String(x.n||""),
     images:(Array.isArray(x.imgs)?x.imgs:[]).filter(Boolean).map((ref,i)=>({
       path:String(ref),
       caption:"Hình "+(i+1)
     }))
   }))
 };
}
async function exportEstaGeneratorPdf(rows){
 if(!centralSession?.access_token)throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
 await ensureCentralSessionFresh();
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),115000);
 try{
   const res=await fetch("/api/esta_report",{
     method:"POST",
     headers:{
       "Content-Type":"application/json",
       "Authorization":"Bearer "+centralSession.access_token
     },
     body:JSON.stringify(estaGeneratorPayload(rows)),
     signal:controller.signal
   });
   if(!res.ok){
     let detail={};try{detail=await res.json()}catch(_){}
     throw new Error(detail?.detail||detail?.error||"Không thể tạo báo cáo ESTA");
   }
   const blob=await res.blob();
   if(!blob.size)throw new Error("File PDF trả về bị trống");
   const missing=Number(res.headers.get("X-ESTA-Missing-Images")||0);
   const url=URL.createObjectURL(blob);
   const a=document.createElement("a");
   a.href=url;
   a.download="ESTA_BaoCao_KyThuat_TongHop_ChiTiet.pdf";
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
   if(missing)toast("Đã xuất PDF · "+missing+" hình không tải được nên giữ ô trống");
   else toast("Đã xuất PDF ESTA chuẩn");
 }catch(err){
   if(err?.name==="AbortError")throw new Error("Tạo PDF quá thời gian. Vui lòng thử lại.");
   throw err;
 }finally{clearTimeout(timer)}
}
async function openReport(a,kind="current",previewWindow=null,photoLayout=1){
 if(!a.length){if(previewWindow&&!previewWindow.closed)previewWindow.close();toast("Không có dữ liệu để xuất PDF");return}
 if(workReportBusy){if(previewWindow&&!previewWindow.closed)previewWindow.close();toast("Báo cáo đang được tạo");return}
 workReportBusy=true;
 try{
   toast("Đang tạo PDF theo mẫu ESTA chuẩn...");
   await exportEstaGeneratorPdf(a);
 }catch(err){
   console.warn("ESTA generator export failed",err);
   toast(err.message||"Không thể xuất PDF");
 }finally{
   workReportBusy=false;
 }
}
$("#exportBtn").onclick=()=>$("#exportModal").classList.remove("hide");
$("#closeExport").onclick=()=>$("#exportModal").classList.add("hide");
$("#exportModal").onclick=e=>{if(e.target===$("#exportModal"))$("#exportModal").classList.add("hide")};
document.querySelectorAll(".exportChoices button").forEach(b=>b.onclick=()=>{
 let kind=b.dataset.range,a;
 if(kind==="current")a=filtered();
 else{let r=rangeDates(kind);a=filtered(r.from,r.to)}
 if(!a.length){$("#exportModal").classList.add("hide");toast("Không có dữ liệu để xuất PDF");return}
 $("#exportModal").classList.add("hide");
 openReport(a,kind,null,1);
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeImageViewer();$("#exportModal").classList.add("hide")}});
setTimeout(()=>ensureHtml2Pdf().catch(()=>{}),900);
if($("#today"))$("#today").textContent=new Date().toLocaleDateString("vi-VN")

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
 const pages={work:"#workPage",energy:"#energyPage",inventory:"#inventoryPage",maintenance:"#maintenancePage",contractor:"#contractorPage",construction:"#constructionMaterialPage"};
 const tops={work:"#topWorkTitle",energy:"#topEnergyTitle",inventory:"#topInventoryTitle",maintenance:"#topMaintenanceTitle",contractor:"#topContractorTitle",construction:"#topConstructionTitle"};
 const navs={work:"#navWork",energy:"#navEnergy",inventory:"#navInventory",maintenance:"#navMaintenance",contractor:"#navContractor",construction:"#navConstruction"};
 $("#homePage").classList.add("hide");$("#adminPage").classList.add("hide");
 Object.values(pages).forEach(s=>$(s)?.classList.add("hide"));
 $("#workHero").classList.add("hide");$("#energyHero").classList.add("hide");
 $("#topHomeTitle").classList.add("hide");$("#topAdminTitle").classList.add("hide");
 Object.values(tops).forEach(s=>$(s)?.classList.add("hide"));
 $("#navHome").classList.remove("active");$("#navAdmin").classList.remove("active");
 Object.values(navs).forEach(s=>$(s)?.classList.remove("active"));
 $(pages[name])?.classList.remove("hide");$(tops[name])?.classList.remove("hide");$(navs[name])?.classList.add("active");
 $("#app").classList.remove("adminMode","homeMode","workMode","energyMode","inventoryMode","maintenanceMode","contractorMode","constructionMode");
 $("#app").classList.add(name+"Mode");
 setMobileMenuOpen(false,true);
 if(name==="energy")renderEnergy();
 if(name==="inventory"){
   const now=new Date();
   inventoryActiveMonth="all";
   inventorySetYears();
   if($("#inventoryYear"))$("#inventoryYear").value=String(now.getFullYear());
   setInventoryTab("materials");
   loadInventoryData(currentBuilding.id);
 }
 if(name==="maintenance")loadMaintenanceData(currentBuilding.id);
 if(name==="contractor"){selectedContractorId="";$("#contractorPage").classList.remove("contractorDetailMode");$("#contractorDetail").classList.add("hide");$("#contractorOverview").classList.remove("hide");loadContractorData(currentBuilding.id)}
 if(name==="construction"){selectedConstructionMaterialId="";$("#constructionMaterialPage").classList.remove("contractorDetailMode");$("#constructionDetail").classList.add("hide");$("#constructionOverview").classList.remove("hide");loadConstructionMaterialData(currentBuilding.id)}
}
$("#navHome").onclick=()=>showHome();
$("#navAdmin").onclick=()=>openAdminPortal();
$("#navWork").onclick=()=>showModule("work");
$("#navEnergy").onclick=()=>showModule("energy");
$("#navInventory").onclick=()=>showModule("inventory");
$("#navMaintenance").onclick=()=>showModule("maintenance");
$("#navContractor").onclick=()=>showModule("contractor");
if($("#navConstruction"))$("#navConstruction").onclick=()=>showModule("construction");
$("#homeViewAllTasks").onclick=()=>$("#navWork").classList.contains("hide")?toast("Hãy mở một dự án trước"):showModule("work");
$("#homeOpenEnergy").onclick=()=>$("#navEnergy").classList.contains("hide")?toast("Hãy mở một dự án trước"):showModule("energy");
$("#homeOpenProjects").onclick=()=>openAdminPortal();
$("#quickAddTask").onclick=()=>{if($("#navWork").classList.contains("hide"))return toast("Hãy mở một dự án trước");showModule("work");setTimeout(()=>$("#content").focus(),60)};
$("#quickElectric").onclick=()=>{if($("#navEnergy").classList.contains("hide"))return toast("Hãy mở một dự án trước");energyType="electric";showModule("energy");document.querySelectorAll("[data-energy-type]").forEach(b=>b.classList.toggle("active",b.dataset.energyType==="electric"));resetEnergyForm();setTimeout(()=>$("#energyValue").focus(),60)};
$("#quickWater").onclick=()=>{if($("#navEnergy").classList.contains("hide"))return toast("Hãy mở một dự án trước");energyType="water";showModule("energy");document.querySelectorAll("[data-energy-type]").forEach(b=>b.classList.toggle("active",b.dataset.energyType==="water"));resetEnergyForm();setTimeout(()=>$("#energyValue").focus(),60)};
$("#quickReport").onclick=()=>{if($("#navWork").classList.contains("hide"))return toast("Hãy mở một dự án trước");showModule("work");setTimeout(()=>$("#exportModal").classList.remove("hide"),60)};

$("#energyToday").textContent=new Date().toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"});
document.querySelectorAll("[data-energy-type]").forEach(b=>b.onclick=()=>{
 energyType=b.dataset.energyType;
 document.querySelectorAll("[data-energy-type]").forEach(x=>{
  const selected=x===b;
  x.classList.toggle("active",selected);
  x.setAttribute("aria-selected",String(selected));
 });
 resetEnergyForm();
 renderEnergy();
});
function syncEnergyDateCompact(){
 const input=$("#energyDate"),out=$("#energyDateCompact");
 if(!input||!out)return;
 const v=String(input.value||"");
 if(/^\d{4}-\d{2}-\d{2}$/.test(v)){
  const [y,m,d]=v.split("-");
  out.textContent=d+"/"+m+"/"+y;
 }else out.textContent="—";
}
$("#energyDate")?.addEventListener("input",syncEnergyDateCompact);
$("#energyDate")?.addEventListener("change",syncEnergyDateCompact);

function resetEnergyForm(){
 const m=ENERGY_META[energyType];
 $("#energyEditId").value="";
 $("#energyDate").value=today();syncEnergyDateCompact();
 $("#energyValue").value="";
 setPeopleSelected("energy",[]);
 $("#energyNote").value="";
 $("#energyImage").value="";
 $("#energyImagePreview").innerHTML="";
 $("#energySaveBtn").textContent="Lưu chỉ số";
 $("#energyCancelEdit").classList.add("hide");
 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=m.valueLabel;
 $("#energyValueColumn").textContent="Chỉ số ("+m.unit+")";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();
}
$("#energyCancelEdit").onclick=resetEnergyForm;
let energyPreviewObjectUrl="";
$("#energyImage").onchange=e=>{
 const f=e.target.files[0];
 if(energyPreviewObjectUrl){URL.revokeObjectURL(energyPreviewObjectUrl);energyPreviewObjectUrl=""}
 if(!f){$("#energyImagePreview").innerHTML="";return}
 if(!f.type.startsWith("image/")){toast("Chỉ hỗ trợ file hình ảnh");e.target.value="";return}
 energyPreviewObjectUrl=URL.createObjectURL(f);
 $("#energyImagePreview").innerHTML='<img src="'+energyPreviewObjectUrl+'" alt="Ảnh đồng hồ"><span>Ảnh đã chọn</span>';
};
$("#energyForm").onsubmit=async e=>{
 e.preventDefault();
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 if(!energySelectedPeople.length){toast("Vui lòng chọn ít nhất 1 người thực hiện");$("#energyPeopleButton").focus();return}
 const btn=$("#energySaveBtn");btn.disabled=true;
 try{
  const editId=$("#energyEditId").value,id=editId||Date.now();
  const all=energyLoad(),old=editId?all.find(x=>String(x.id)===String(editId)):null;
  let image=old?.image||"";
  const f=$("#energyImage").files[0];
  if(f){
    const blob=await imageFileToBlob(f);
    image=await uploadMediaBlob(blob,"energy",id,0);
  }
  const obj={
    id,
    type:energyType,
    date:$("#energyDate").value,
    value:Number($("#energyValue").value),
    a:energySelectedPeople.join(", "),
    performers:[...energySelectedPeople],
    note:$("#energyNote").value.trim(),
    image,
    createdAt:old?.createdAt||new Date().toISOString()
  };
  const next=editId?all.map(x=>String(x.id)===String(editId)?obj:x):[obj,...all];
  energySaveAll(next);
  await syncEnergyRecord("upsert_energy",obj);
  resetEnergyForm();renderEnergy();renderHomeDashboard();toast(editId?"Đã cập nhật chỉ số":"Đã lưu chỉ số");
 }catch(err){toast(err.message||"Không thể lưu dữ liệu")}
 finally{btn.disabled=false}
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

 const allType=energyLoad()
   .filter(x=>x.type===energyType)
   .sort((a,b)=>a.date.localeCompare(b.date)||Number(a.id)-Number(b.id));

 const periodRows=energyRows();
 const q=($("#energyQuickSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const rows=q?periodRows.filter(x=>{
   const hay=[
     x.date,
     fmt(x.date),
     weekday(x.date),
     performerArray(x).join(" "),
     x.note||"",
     String(x.value??"")
   ].join(" ").toLocaleLowerCase("vi-VN");
   return hay.includes(q);
 }):periodRows;

 const currentMonth=today().slice(0,7);
 const monthCount=allType.filter(x=>String(x.date||"").slice(0,7)===currentMonth).length;
 const latest=allType.length?allType[allType.length-1]:null;
 const usableDiffs=periodRows.filter(x=>typeof x.diff==="number"&&Number.isFinite(x.diff)&&x.diff>=0);
 const totalUse=usableDiffs.length?usableDiffs.reduce((s,x)=>s+x.diff,0):null;
 const totalLabel=energyType==="electric"?"Tổng điện":energyType==="water"?"Tổng nước":"Tổng điện mặt trời";

 $("#energyRecordCount").textContent=monthCount;
 $("#energyLatestValue").textContent=latest?energyFmt(latest.value)+" "+m.unit:"—";
 $("#energyPeriodUse").textContent=totalUse!==null?energyFmt(totalUse)+" "+m.unit:"—";

 const totalBox=$("#energyTotalInline");
 if(totalBox){
   totalBox.querySelector("span").textContent=totalLabel;
   totalBox.querySelector("strong").textContent=totalUse!==null?energyFmt(totalUse)+" "+m.unit:"—";
 }

 $("#energyEmpty").classList.toggle("hide",rows.length>0);

 $("#energyTbody").innerHTML=rows.map(x=>{
   const sun=new Date(x.date+"T00:00:00").getDay()===0;
   const diff=x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff);
   const img=x.image?'<span class="energyThumbWrap" onclick="viewEnergyImage(\''+x.id+'\')">'+mediaImgHtml(x.image,"energyThumb")+'</span>':"—";
   return '<tr class="'+(sun?"sunday":"")+'">'+
     '<td class="dateCell">'+fmt(x.date)+'</td>'+
     '<td class="meterValue"><b>'+energyFmt(x.value)+'</b></td>'+
     '<td class="meterDiff">'+diff+'</td>'+
     '<td>'+performerChipsHtml(x)+'</td>'+
     '<td class="noteCell">'+esc(x.note||"—")+'</td>'+
     '<td>'+img+'</td>'+
     '<td class="actionCell"><details class="rowActionMenu"><summary title="Thao tác">•••</summary><div>'+
       '<button type="button" onclick="editEnergy(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Sửa bản ghi</button>'+
       (x.image?'<button type="button" onclick="viewEnergyImage(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Xem hình ảnh</button>':'')+
       '<button class="danger" type="button" onclick="deleteEnergy(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Xóa</button>'+
     '</div></details></td>'+
   '</tr>';
 }).join("");

 $("#energyMobileCards").innerHTML=rows.map(x=>
   '<article class="mcard proEnergyCard '+(new Date(x.date+"T00:00:00").getDay()===0?"sunday":"")+'">'+
     '<div class="mobileCardTop"><div><small>'+weekday(x.date)+' · '+fmt(x.date)+'</small><h4>'+energyFmt(x.value)+' '+m.unit+'</h4></div>'+
     '<span class="mobileDiff">'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</span></div>'+
     '<div class="mobileMeta">'+performerChipsHtml(x,2)+'</div>'+
     '<p>'+esc(x.note||"Không có ghi chú")+'</p>'+
     '<div class="mobileCardFoot"><span>'+(x.image?"Có hình đồng hồ":"Không có hình")+'</span><button onclick="editEnergy(\''+x.id+'\')">Chỉnh sửa →</button></div>'+
   '</article>'
 ).join("");

 if(q)$("#energySummaryText").textContent=rows.length?"Tìm thấy "+rows.length+" bản ghi phù hợp.":"Không tìm thấy bản ghi phù hợp.";
 else $("#energySummaryText").textContent=periodRows.length?"Lịch sử "+periodRows.length+" bản ghi theo ngày.":"Lịch sử chỉ số theo ngày.";

 hydrateMediaImages($("#energyTbody"));
}
window.editEnergy=id=>{
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 const x=energyLoad().find(v=>String(v.id)===String(id));if(!x)return;
 energyType=x.type;
 document.querySelectorAll("[data-energy-type]").forEach(b=>{
 const selected=b.dataset.energyType===energyType;
 b.classList.toggle("active",selected);
 b.setAttribute("aria-selected",String(selected));
});
 $("#energyEditId").value=x.id;$("#energyDate").value=x.date;syncEnergyDateCompact();$("#energyValue").value=x.value;setPeopleSelected("energy",performerArray(x));$("#energyNote").value=x.note||"";
 $("#energyImagePreview").innerHTML=x.image?mediaImgHtml(x.image,"")+'<span>Ảnh hiện tại</span>':"";hydrateMediaImages($("#energyImagePreview"));
 $("#energySaveBtn").textContent="Cập nhật chỉ số";$("#energyCancelEdit").classList.remove("hide");renderEnergy();
 window.scrollTo({top:0,behavior:"smooth"});
};
window.deleteEnergy=async id=>{if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}if(!confirm("Xóa bản ghi chỉ số này?"))return;energySaveAll(energyLoad().filter(x=>String(x.id)!==String(id)));await syncEnergyRecord("delete_energy",id);renderEnergy();renderHomeDashboard();toast("Đã xóa bản ghi")};
window.viewEnergyImage=async id=>{const x=energyLoad().find(v=>String(v.id)===String(id));if(!x?.image)return;viewerMediaRefs=[x.image];$("#viewerImages").innerHTML='<div class="viewerMedia">'+mediaImgHtml(x.image,"viewerLargeImage")+'<button class="viewerDownloadBtn" type="button" onclick="downloadViewerMedia(0)">⇩ Tải hình</button></div>';$("#viewer").classList.remove("hide");await hydrateMediaImages($("#viewerImages"))};
function setEnergyRange(kind){
 document.querySelectorAll("[data-erange]").forEach(b=>b.classList.toggle("active",b.dataset.erange===kind));
 if(kind==="all"){$("#energyFromDate").value="";$("#energyToDate").value=""}
 else{const r=rangeDates(kind);$("#energyFromDate").value=r.from;$("#energyToDate").value=r.to}
 renderEnergy();
}
document.querySelectorAll("[data-erange]").forEach(b=>b.onclick=()=>setEnergyRange(b.dataset.erange));
if($("#energyQuickSearch"))$("#energyQuickSearch").oninput=renderEnergy;
$("#energyApplyFilter").onclick=renderEnergy;
$("#energyClearFilter").onclick=()=>setEnergyRange("all");
function energyReportHtml(rows){
 const m=ENERGY_META[energyType],f=$("#energyFromDate").value,e=$("#energyToDate").value,period=f||e?((f?fmt(f):"Đầu kỳ")+" - "+(e?fmt(e):"Hiện tại")):"Toàn bộ dữ liệu";
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo '+m.name+'</title><style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap");@page{size:A4;margin:14mm}body{font-family:"Inter";color:#1f2937;font-size:10px}.head{display:flex;justify-content:space-between;border-bottom:3px solid #0e4d7e;padding-bottom:9px}.brand{font-size:18px;font-weight:800;color:#0e4d7e}.brand small{display:block;font-size:8px;color:#64748b;letter-spacing:1px}.title{text-align:center;margin:16px 0}.title h1{font-size:18px;color:#0e4d7e;margin:0 0 5px}.title p{margin:0;color:#64748b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:7px;text-align:left}th{background:#edf4fb;color:#214d72}.sun{background:#fff7d6}.photo{width:75px;height:55px;object-fit:cover}.foot{margin-top:25px;text-align:center;color:#94a3b8;font-size:8px}</style></head><body><div class="head"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div>'+esc(currentBuilding.name).toLocaleUpperCase("vi-VN")+'<br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO '+m.name.toUpperCase()+'</h1><p>Thời gian: <b>'+period+'</b></p></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số ('+m.unit+')</th><th>Chênh lệch</th><th>Người thực hiện</th><th>Hình ảnh</th><th>Ghi chú</th></tr></thead><tbody>'+rows.map(x=>'<tr class="'+(new Date(x.date+"T00:00:00").getDay()===0?"sun":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td><b>'+energyFmt(x.value)+'</b></td><td>'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</td><td>'+esc(performerArray(x).join(", ")||"—")+'</td><td>'+(x.image?'<img class="photo" src="'+x.image+'">':"—")+'</td><td>'+esc(x.note||"—")+'</td></tr>').join("")+'</tbody></table><div class="foot">ESTA · Quản lý năng lượng · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>'
}
$("#energyExportPdf").onclick=()=>{const rows=energyRows();if(!rows.length){toast("Không có dữ liệu để xuất PDF");return}downloadReportPdf(energyReportHtml(rows),"ESTA-"+currentBuilding.id+"-bao-cao-"+energyType+"-"+today()+".pdf")};

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
 const meterTable=(rows,unit)=>rows.length?rows.map(x=>'<tr class="'+(new Date(x.date+"T00:00:00").getDay()===0?"sun":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td>'+energyFmt(x.value)+'</td><td>'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</td><td>'+esc(performerArray(x).join(", ")||"—")+'</td><td>'+esc(x.note||"—")+'</td></tr>').join(""):'<tr><td colspan="6">Không có dữ liệu trong kỳ.</td></tr>';
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo tổng hợp ESTA</title><style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap");@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:"Inter";color:#1f2937;font-size:9px;margin:0}.head{display:flex;justify-content:space-between;border-bottom:3px solid #123d6b;padding-bottom:8px}.brand{font-size:18px;font-weight:800;color:#123d6b}.brand small{display:block;font-size:7px;letter-spacing:1px;color:#64748b}.title{text-align:center;margin:14px 0}.title h1{font-size:18px;color:#123d6b;margin:0 0 4px}.title p{margin:0;color:#64748b}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}.summary div{border:1px solid #cbd5e1;border-radius:5px;padding:8px}.summary span{display:block;color:#64748b;font-size:7px}.summary b{display:block;margin-top:3px;color:#123d6b;font-size:12px}.section{page-break-before:auto;margin-top:15px}.section.page{page-break-before:always}.section h2{font-size:13px;color:#123d6b;margin:0 0 7px;padding-bottom:4px;border-bottom:2px solid #dbe7f0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px;vertical-align:top}th{background:#edf4fb;color:#214d72}.sun{background:#fff7d6}.tot{margin:6px 0 8px;text-align:right;font-size:10px;color:#123d6b}.foot{margin-top:18px;text-align:center;color:#94a3b8;font-size:7px}</style></head><body><div class="head"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div>'+esc(currentBuilding.name).toLocaleUpperCase("vi-VN")+'<br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO TỔNG HỢP KỸ THUẬT</h1><p>Thời gian: <b>'+period+'</b></p></div><div class="summary"><div><span>CÔNG VIỆC</span><b>'+tasks.length+'</b></div><div><span>TỔNG ĐIỆN</span><b>'+energyFmt(totalElec)+' kWh</b></div><div><span>TỔNG NƯỚC</span><b>'+energyFmt(totalWater)+' m³</b></div></div><div class="section"><h2>1. Công việc kỹ thuật</h2><table><thead><tr><th>STT</th><th>Ngày</th><th>Nội dung</th><th>Loại</th><th>Trạng thái</th><th>Người thực hiện</th><th>Ghi chú</th></tr></thead><tbody>'+taskRows+'</tbody></table></div><div class="section page"><h2>2. Chỉ số điện</h2><div class="tot"><b>Tổng tiêu thụ: '+energyFmt(totalElec)+' kWh</b></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số (kWh)</th><th>Chênh lệch</th><th>Người thực hiện</th><th>Ghi chú</th></tr></thead><tbody>'+meterTable(elec,"kWh")+'</tbody></table></div><div class="section page"><h2>3. Chỉ số nước</h2><div class="tot"><b>Tổng tiêu thụ: '+energyFmt(totalWater)+' m³</b></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số (m³)</th><th>Chênh lệch</th><th>Người thực hiện</th><th>Ghi chú</th></tr></thead><tbody>'+meterTable(water,"m³")+'</tbody></table></div><div class="foot">ESTA Building Management · Báo cáo tổng hợp · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),700)<\/script></body></html>';
}
document.querySelectorAll("[data-combined-range]").forEach(b=>b.onclick=()=>{
 $("#exportModal").classList.add("hide");
 toast("Mẫu báo cáo tổng hợp cũ đã được loại bỏ. Vui lòng dùng Báo cáo Công việc · Mẫu ESTA chuẩn.");
});

resetEnergyForm();
renderEnergy();
document.addEventListener("compositionstart",e=>{
 if(shouldAutoCapitalize(e.target))e.target.dataset.composing="1";
});
document.addEventListener("compositionend",e=>{
 if(shouldAutoCapitalize(e.target)){
   delete e.target.dataset.composing;
   applyAutoCapitalize(e.target);
 }
});
document.addEventListener("input",e=>{
 if(shouldAutoCapitalize(e.target))applyAutoCapitalize(e.target);
});
document.addEventListener("focusout",e=>{
 if(shouldAutoCapitalize(e.target))applyAutoCapitalize(e.target);
});
document.addEventListener("submit",e=>{
 capitalizeAllDataFields(e.target);
},true);



/* ===== DỤNG CỤ - VẬT TƯ ===== */
let inventoryMaterials=[],inventoryTransactions=[],inventoryTools=[],inventoryLoadedBuilding="",inventoryActiveTab="materials",inventoryActiveMonth=new Date().getMonth()+1,inventoryShowAlertsOnly=false;
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
 ["stockTxnPerformer","maintenanceAssigned","maintenanceRecordPerformer"].forEach(id=>{
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
   [inventoryMaterials,inventoryTransactions,inventoryTools]=await Promise.all([
     sbFetch("/rest/v1/inventory_materials?select=*&building_id=eq."+b+"&order=name.asc",{token}),
     sbFetch("/rest/v1/inventory_material_transactions?select=*&building_id=eq."+b+"&order=tx_date.desc,created_at.desc",{token}),
     sbFetch("/rest/v1/inventory_tools?select=*&building_id=eq."+b+"&order=name.asc",{token})
   ]);
   inventoryMaterials=Array.isArray(inventoryMaterials)?inventoryMaterials:[];
   inventoryTransactions=Array.isArray(inventoryTransactions)?inventoryTransactions:[];
   inventoryTools=Array.isArray(inventoryTools)?inventoryTools:[];
   inventoryLoadedBuilding=buildingId;inventoryShowAlertsOnly=false;inventoryFillPeople();renderInventory();
 }catch(e){console.warn("Load inventory failed",e);toast("Không tải được dữ liệu vật tư")}
}
function renderInventory(){
 inventorySetYears();
 renderMaterials();
 renderTools();
}
function inventoryStockAlerts(){
 const y=new Date().getFullYear();
 return inventoryMaterials.map(m=>{
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
   box.innerHTML='<div class="stockAlertEmpty"><span>✓</span><div><b>Tồn kho đang ổn định</b><small>Không có vật tư nào bằng hoặc thấp hơn mức tồn tối thiểu.</small></div></div>';
   return;
 }
 box.innerHTML=alerts.map(({m,current,min,severity})=>{
   const out=severity==="out";
   return '<article class="stockAlertItem '+severity+'">'+
     '<div class="stockAlertStatus">'+(out?"HẾT HÀNG":"SẮP HẾT")+'</div>'+
     '<div class="stockAlertName"><b>'+esc(m.name)+'</b><small>'+esc(m.code||"Không mã")+' · '+esc(m.unit)+'</small></div>'+
     '<div class="stockAlertMetric"><span>Tồn hiện tại</span><b>'+inventoryFmt(current)+' '+esc(m.unit)+'</b></div>'+
     '<div class="stockAlertMetric"><span>Mức tối thiểu</span><b>'+inventoryFmt(min)+' '+esc(m.unit)+'</b></div>'+
     '<div class="stockAlertActions"><button type="button" onclick="openLowStockReplenish(\''+m.id+'\')">＋ Nhập kho</button><button type="button" class="ghost" onclick="editMaterial(\''+m.id+'\')">Sửa định mức</button></div>'+
   '</article>';
 }).join("");
}
window.openLowStockReplenish=id=>{
 openStockTxnModal(id);
 $("#stockTxnType").value="in";
 $("#stockTxnDate").value=today();
 setTimeout(()=>$("#stockTxnQty").focus(),50);
};
function renderMaterials(){
 const y=inventoryYearValue(),allYear=String(inventoryActiveMonth)==="all";
 const month=allYear?null:Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 const q=($("#materialSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const alertIds=new Set(inventoryStockAlerts().map(x=>String(x.m.id)));
 const periodEnd=allYear?(y+"-12-31"):inventoryMonthEnd(y,month);
 const list=inventoryMaterials.filter(m=>inventoryTrackingStart(m)<=periodEnd&&(!inventoryShowAlertsOnly||alertIds.has(String(m.id)))&&(!q||[m.name,m.code,m.unit,m.note].some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q))));
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
 $("#materialMonthLabel").textContent=periodText;
 $("#materialSelectedMonth").textContent=periodText;
 $("#materialTitleCount").textContent="("+list.length+" mục)";
 $("#materialInLabel").textContent=allYear?"TỔNG NHẬP NĂM":"TỔNG NHẬP THÁNG";
 $("#materialOutLabel").textContent=allYear?"TỔNG XUẤT NĂM":"TỔNG XUẤT THÁNG";
 $("#materialStockLabel").textContent=allYear?"MẶT HÀNG TỒN CUỐI NĂM":"MẶT HÀNG CÒN TỒN";

 const periodRows=inventoryMaterials.map(m=>({m,s:inventorySnapshot(m,y)})).filter(x=>allYear?x.s.months.some(mm=>mm.active):x.s.months[month-1]?.active);
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
         '<button title="Xóa" class="danger" onclick="deleteMaterial(\''+m.id+'\')">'+trashIcon+'</button>'+
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
         '<button title="Xóa" class="danger" onclick="deleteMaterial(\''+m.id+'\')">'+trashIcon+'</button>'+
       '</div></td></tr>';
   }).join("");
 }
 $("#materialEmpty").classList.toggle("hide",snaps.length>0);

 const byId=Object.fromEntries(inventoryMaterials.map(m=>[m.id,m]));
 const tx=inventoryTransactions.filter(x=>{
   const d=String(x.tx_date||"");
   if(!byId[x.material_id]||inventoryTrackingStart(byId[x.material_id])>d)return false;
   return allYear?d.startsWith(String(y)):d.startsWith(y+"-"+String(month).padStart(2,"0"));
 }).slice(0,allYear?120:60);
 $("#materialTxnSubtitle").textContent=allYear?("Các phát sinh trong năm "+y+"."):("Các phát sinh trong tháng "+String(month).padStart(2,"0")+" / "+y+".");
 $("#materialTxnBody").innerHTML=tx.map(x=>'<tr><td>'+fmt(x.tx_date)+'</td><td><b>'+esc(byId[x.material_id]?.name||"Vật tư đã xóa")+'</b></td><td><span class="stockType '+x.tx_type+'">'+(x.tx_type==="in"?"Nhập":"Xuất")+'</span></td><td><b>'+inventoryFmt(x.qty)+'</b></td><td>'+esc(x.performer||"—")+'</td><td>'+esc(x.note||"—")+'</td><td><button class="miniDanger" onclick="deleteStockTxn(\''+x.id+'\')">'+trashIcon+'</button></td></tr>').join("");
 $("#materialTxnEmpty").classList.toggle("hide",tx.length>0);

 const sel=$("#stockTxnMaterial"),old=sel.value;
 const selectable=inventoryMaterials.filter(m=>inventoryTrackingStart(m)<=periodEnd);
 sel.innerHTML='<option value="">— Chọn vật tư —</option>'+selectable.map(m=>'<option value="'+m.id+'">'+esc(m.name)+' · tồn '+inventoryFmt(inventoryStockAsOf(m,today())??0)+' '+esc(m.unit)+'</option>').join("");
 if(selectable.some(m=>m.id===old))sel.value=old;
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
 $("#toolsEmpty").classList.toggle("hide",list.length>0);
}
function setInventoryTab(tab){
 inventoryActiveTab=tab;
 if(tab==="materials"&&$("#inventoryPage")&&!$("#inventoryPage").classList.contains("hide")){
   const now=new Date();
   inventoryActiveMonth=now.getMonth()+1;
   inventorySetYears();
   if($("#inventoryYear"))$("#inventoryYear").value=String(now.getFullYear());
 }
 document.querySelectorAll("[data-inventory-tab]").forEach(b=>b.classList.toggle("active",b.dataset.inventoryTab===tab));
 $("#inventoryMaterialsPane").classList.toggle("hide",tab!=="materials");
 $("#inventoryToolsPane").classList.toggle("hide",tab!=="tools");
}
function resetMaterialForm(sampleName="",sampleUnit="Cái"){
 $("#materialId").value="";$("#materialCode").value="";$("#materialName").value=sampleName;$("#materialUnit").value=sampleUnit||"Cái";
 $("#materialTrackingStart").value=today();$("#materialTrackingStart").max=today();$("#materialOpeningQty").value="0";$("#materialMinQty").value="0";$("#materialNote").value="";
 $("#materialModalTitle").textContent="Thêm vật tư";
}
function openMaterialModal(sampleName="",sampleUnit="Cái"){resetMaterialForm(sampleName,sampleUnit);$("#materialItemModal").classList.remove("hide");setTimeout(()=>$("#materialName").focus(),40)}
window.editMaterial=id=>{
 const m=inventoryMaterials.find(x=>String(x.id)===String(id));if(!m)return;
 $("#materialId").value=m.id;$("#materialCode").value=m.code||"";$("#materialName").value=m.name;$("#materialUnit").value=m.unit;$("#materialTrackingStart").value=inventoryTrackingStart(m);$("#materialTrackingStart").max=today();$("#materialOpeningQty").value=m.opening_qty;$("#materialMinQty").value=m.min_qty;$("#materialNote").value=m.note||"";
 $("#materialModalTitle").textContent="Chỉnh sửa vật tư";$("#materialItemModal").classList.remove("hide");
};
window.deleteMaterial=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const m=inventoryMaterials.find(x=>String(x.id)===String(id));if(!m||!confirm("Xóa vật tư “"+m.name+"” và toàn bộ lịch sử nhập/xuất?"))return;
 try{await sbFetch("/rest/v1/inventory_materials?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadInventoryData(currentBuilding.id,true);toast("Đã xóa vật tư")}catch(e){toast(e.message)}
};
window.openStockTxnModal=id=>{
 if(!inventoryMaterials.length)return toast("Hãy thêm vật tư trước");
 const y=inventoryYearValue(),m=Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 const now=new Date(),same=y===now.getFullYear()&&m===now.getMonth()+1;
 const day=same?now.getDate():1;
 const maxDay=new Date(y,m,0).getDate();
 const date=y+"-"+String(m).padStart(2,"0")+"-"+String(Math.min(day,maxDay)).padStart(2,"0");
 $("#stockTxnId").value="";$("#stockTxnDate").value=date;$("#stockTxnType").value="in";$("#stockTxnQty").value="";$("#stockTxnPerformer").value="";$("#stockTxnNote").value="";
 renderMaterials();if(id)$("#stockTxnMaterial").value=id;
 const chosen=inventoryMaterials.find(x=>x.id===$("#stockTxnMaterial").value);
 $("#stockTxnDate").max=today();
 $("#stockTxnDate").min=chosen?inventoryTrackingStart(chosen):"";
 if(chosen&&$("#stockTxnDate").value<inventoryTrackingStart(chosen))$("#stockTxnDate").value=inventoryTrackingStart(chosen);
 $("#stockTxnModal").classList.remove("hide");
};
window.deleteStockTxn=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 if(!confirm("Xóa giao dịch nhập/xuất này?"))return;
 try{await sbFetch("/rest/v1/inventory_material_transactions?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadInventoryData(currentBuilding.id,true);toast("Đã xóa giao dịch")}catch(e){toast(e.message)}
};
function resetToolForm(sampleName="",sampleUnit="Cái"){
 $("#toolId").value="";$("#toolCode").value="";$("#toolName").value=sampleName;$("#toolBrand").value="";$("#toolQty").value="1";$("#toolUnit").value=sampleUnit||"Cái";$("#toolLocation").value="";$("#toolKeeper").value="";$("#toolCondition").value="Đang sử dụng";$("#toolAcquiredDate").value="";$("#toolNote").value="";$("#toolModalTitle").textContent="Thêm dụng cụ";
}
function openToolModal(sampleName="",sampleUnit="Cái"){resetToolForm(sampleName,sampleUnit);inventoryFillPeople();$("#toolItemModal").classList.remove("hide");setTimeout(()=>$("#toolName").focus(),40)}
window.editTool=id=>{
 const t=inventoryTools.find(x=>String(x.id)===String(id));if(!t)return;
 inventoryFillPeople();$("#toolId").value=t.id;$("#toolCode").value=t.code||"";$("#toolName").value=t.name;$("#toolBrand").value=t.brand||"";$("#toolQty").value=t.qty;$("#toolUnit").value=t.unit;$("#toolLocation").value=t.location||"";$("#toolKeeper").value=t.keeper||"";$("#toolCondition").value=["Tốt","Đang sử dụng","Cần kiểm tra","Hư hỏng"].includes(t.condition_status)?t.condition_status:(["Hỏng","Cần sửa"].includes(t.condition_status)?"Hư hỏng":"Đang sử dụng");$("#toolAcquiredDate").value=t.acquired_date||"";$("#toolNote").value=t.note||"";$("#toolModalTitle").textContent="Chỉnh sửa dụng cụ";$("#toolItemModal").classList.remove("hide");
};
window.deleteTool=async id=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const t=inventoryTools.find(x=>String(x.id)===String(id));if(!t||!confirm("Xóa dụng cụ “"+t.name+"”?"))return;
 try{await sbFetch("/rest/v1/inventory_tools?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"DELETE",token:centralSession.access_token});await loadInventoryData(currentBuilding.id,true);toast("Đã xóa dụng cụ")}catch(e){toast(e.message)}
};
function inventoryPrintWindow(html,filename=""){
 return downloadReportPdf(html,filename);
}
function inventoryPdfCss(landscape=false){return '@page{size:A4 '+(landscape?"landscape":"portrait")+';margin:10mm}*{box-sizing:border-box}body{font-family:"Inter";color:#243746;font-size:9px;margin:0}.head{display:flex;justify-content:space-between;border-bottom:2px solid #123d5b;padding-bottom:7px;margin-bottom:10px}.brand{font-size:18px;font-weight:800;color:#8c6854}.brand small{display:block;font-size:7px;color:#647988;letter-spacing:1px}.doc{text-align:right;color:#667b89}.title{text-align:center;margin:12px 0}.title h1{font-size:17px;color:#173d58;margin:0 0 4px}.title p{margin:0;color:#6f8390}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cdd8df;padding:4px;vertical-align:top}th{background:#edf4f7;color:#345569;font-size:7px}td b{color:#173d58}.month{font-size:7px;line-height:1.45}.in{color:#25825a}.out{color:#b55f55}.summary{display:flex;gap:8px;margin:10px 0}.summary div{border:1px solid #d6e0e5;padding:7px;flex:1}.summary span{display:block;color:#78909c;font-size:7px}.summary b{font-size:12px}.foot{position:fixed;bottom:-5mm;left:0;right:0;text-align:center;color:#9aa8b0;font-size:7px}';
}
function materialReportHtml(){
 const y=inventoryYearValue(),allYear=String(inventoryActiveMonth)==="all";
 const month=allYear?null:Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 if(allYear){
   const activeMaterials=inventoryMaterials.filter(m=>inventorySnapshot(m,y).months.some(mm=>mm.active));
   const rows=activeMaterials.map((m,i)=>{
     const s=inventorySnapshot(m,y);
     return '<tr><td>'+(i+1)+'</td><td><b>'+esc(m.name)+'</b><br>'+esc(m.code||"")+'</td><td>'+esc(m.unit)+'</td><td>'+inventoryFmt(s.opening??0)+'</td>'+
       s.months.map(mm=>mm.active?'<td class="month"><span class="in">N '+inventoryFmt(mm.inQty)+'</span><br><span class="out">X '+inventoryFmt(mm.outQty)+'</span></td>':'<td>—</td>').join("")+
       '<td class="in"><b>'+inventoryFmt(s.totalIn)+'</b></td><td class="out"><b>'+inventoryFmt(s.totalOut)+'</b></td><td><b>'+inventoryFmt(s.closing??0)+'</b></td></tr>';
   }).join("");
   const snaps=activeMaterials.map(m=>({m,s:inventorySnapshot(m,y)}));
   const tin=snaps.reduce((a,x)=>a+x.s.totalIn,0),tout=snaps.reduce((a,x)=>a+x.s.totalOut,0),instock=snaps.filter(x=>(x.s.closing??0)>0).length,low=snaps.filter(x=>inventoryNum(x.m.min_qty)>0&&(x.s.closing??0)<=inventoryNum(x.m.min_qty)).length;
   return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Vật tư 12 tháng '+y+'</title><style>'+inventoryPdfCss(true)+'.month{font-size:6.5px;min-width:34px}</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>NHẬP - XUẤT VẬT TƯ 12 THÁNG / '+y+'</h1><p>Vật tư tiêu hao kỹ thuật</p></div><div class="summary"><div><span>Tổng nhập năm</span><b>'+inventoryFmt(tin)+'</b></div><div><span>Tổng xuất năm</span><b>'+inventoryFmt(tout)+'</b></div><div><span>Mặt hàng còn tồn</span><b>'+instock+'</b></div><div><span>Sắp hết</span><b>'+low+'</b></div></div><table><thead><tr><th>STT</th><th>Vật tư</th><th>ĐVT</th><th>Tồn đầu</th>'+INV_MONTHS.map(x=>'<th>'+x+'<br>N/X</th>').join("")+'<th>Tổng N</th><th>Tổng X</th><th>Tồn cuối</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · Quản lý vật tư 12 tháng · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),650)<\/script></body></html>';
 }
 const activeMaterials=inventoryMaterials.filter(m=>inventorySnapshot(m,y).months[month-1]?.active);
 const rows=activeMaterials.map((m,i)=>{
   const mm=inventorySnapshot(m,y).months[month-1];
   return '<tr><td>'+(i+1)+'</td><td><b>'+esc(m.name)+'</b><br>'+esc(m.code||"")+'</td><td>'+esc(m.unit)+'</td><td>'+inventoryFmt(mm.begin)+'</td><td class="in">'+inventoryFmt(mm.inQty)+'</td><td class="out">'+inventoryFmt(mm.outQty)+'</td><td><b>'+inventoryFmt(mm.stock)+'</b></td></tr>';
 }).join("");
 const snaps=activeMaterials.map(m=>({m,mm:inventorySnapshot(m,y).months[month-1]}));
 const tin=snaps.reduce((a,x)=>a+x.mm.inQty,0),tout=snaps.reduce((a,x)=>a+x.mm.outQty,0),instock=snaps.filter(x=>x.mm.stock>0).length,low=snaps.filter(x=>inventoryNum(x.m.min_qty)>0&&x.mm.stock<=inventoryNum(x.m.min_qty)).length;
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Vật tư tháng '+month+'-'+y+'</title><style>'+inventoryPdfCss(false)+'</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>NHẬP - XUẤT - TỒN VẬT TƯ THÁNG '+String(month).padStart(2,"0")+' / '+y+'</h1><p>Vật tư tiêu hao kỹ thuật</p></div><div class="summary"><div><span>Tổng nhập</span><b>'+inventoryFmt(tin)+'</b></div><div><span>Tổng xuất</span><b>'+inventoryFmt(tout)+'</b></div><div><span>Mặt hàng còn tồn</span><b>'+instock+'</b></div><div><span>Sắp hết</span><b>'+low+'</b></div></div><table><thead><tr><th>STT</th><th>Vật tư</th><th>ĐVT</th><th>Tồn đầu</th><th>Nhập</th><th>Xuất</th><th>Tồn cuối</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · Quản lý vật tư · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>';
}
function toolReportHtml(){
 const rows=inventoryTools.map((t,i)=>'<tr><td>'+(i+1)+'</td><td><b>'+esc(t.name)+'</b><br>'+esc(t.code||"")+'</td><td>'+esc(t.brand||"—")+'</td><td>'+inventoryFmt(t.qty)+' '+esc(t.unit)+'</td><td>'+esc(t.location||"—")+'</td><td>'+esc(t.keeper||"—")+'</td><td>'+esc(t.condition_status)+'</td></tr>').join("");
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Dụng cụ kỹ thuật</title><style>'+inventoryPdfCss(false)+'</style></head><body><div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">'+esc(currentBuilding.name)+'<br>Ngày xuất: '+new Date().toLocaleDateString("vi-VN")+'</div></div><div class="title"><h1>DANH MỤC DỤNG CỤ KỸ THUẬT</h1><p>Danh sách, vị trí, tình trạng và người phụ trách</p></div><table><thead><tr><th>STT</th><th>Dụng cụ</th><th>Nhãn hiệu</th><th>Số lượng</th><th>Vị trí lưu</th><th>Người phụ trách</th><th>Tình trạng</th><th>Ghi chú</th></tr></thead><tbody>'+rows+'</tbody></table><div class="foot">ESTA · Dụng cụ kỹ thuật · '+esc(currentBuilding.name)+'</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>';
}

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
   [maintenanceAssets,maintenanceRecords]=await Promise.all([
     sbFetch("/rest/v1/maintenance_assets?select=*&building_id=eq."+b+"&order=next_due_date.asc.nullslast,name.asc",{token}),
     sbFetch("/rest/v1/maintenance_records?select=*&building_id=eq."+b+"&order=service_date.desc,created_at.desc",{token})
   ]);
   maintenanceAssets=Array.isArray(maintenanceAssets)?maintenanceAssets:[];
   maintenanceRecords=Array.isArray(maintenanceRecords)?maintenanceRecords:[];
   maintenanceLoadedBuilding=buildingId;inventoryFillPeople();renderMaintenance();
 }catch(e){console.warn("Load maintenance failed",e);toast("Không tải được dữ liệu bảo trì")}
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
 $("#maintenanceRecordId").value="";$("#maintenanceRecordAssetId").value=a.id;$("#maintenanceRecordAssetName").textContent=a.name+" · "+(a.location||a.system_type);$("#maintenanceRecordDate").value=today();$("#maintenanceRecordType").value="Định kỳ";$("#maintenanceRecordPerformer").value=a.assigned_to||"";$("#maintenanceRecordResult").value="Hoàn thành";$("#maintenanceWorkDone").value="";$("#maintenanceRecordNextDate").value=maintenanceAutoNext(today(),a.frequency_days);$("#maintenanceCost").value="0";$("#maintenanceRecordNote").value="";$("#maintenanceRecordModal").classList.remove("hide");
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
function maintenanceReportHtml(kind="week",refDate=today()){
 const period=maintenanceReportPeriod(kind,refDate);
 const inRange=(date)=>date&&String(date)>=period.from&&String(date)<=period.to;
 const byId=Object.fromEntries(maintenanceAssets.map(a=>[String(a.id),a]));
 const records=maintenanceRecords.filter(r=>inRange(r.service_date)).sort((a,b)=>String(a.service_date||"").localeCompare(String(b.service_date||"")));
 const dueAssets=maintenanceAssets.filter(a=>inRange(a.next_due_date)).sort((a,b)=>String(a.next_due_date||"").localeCompare(String(b.next_due_date||"")));
 const done=records.filter(r=>r.result_status==="Hoàn thành").length;
 const attention=records.filter(r=>r.result_status!=="Hoàn thành").length;
 const overall=attention>0?"CẦN KHẮC PHỤC":(records.length?"ĐẠT":"CHƯA CÓ DỮ LIỆU ĐÁNH GIÁ");
 const recommendation=attention>0
   ?"Theo dõi và xử lý dứt điểm các hạng mục chưa hoàn thành/cần sửa chữa trong kỳ."
   :(records.length?"Tiếp tục duy trì lịch bảo trì theo kế hoạch.":"[CẦN BỔ SUNG]");
 const rows=records.length?records.map((r,i)=>{
   const a=byId[String(r.asset_id)]||{};
   const item='<b>'+esc(a.name||"Thiết bị đã xóa")+'</b>'
     +'<small>'+esc(a.system_type||"—")+' · '+esc(a.location||"—")+' · '+fmt(r.service_date)+'</small>'
     +'<p>'+esc(r.work_done||"—")+'</p>';
   const note=(r.note?esc(r.note):"—")+(r.performer?'<small>Người thực hiện: '+esc(r.performer)+'</small>':"");
   return '<tr><td class="stt">'+(i+1)+'</td><td class="item">'+item+'</td><td class="result '+(r.result_status==="Hoàn thành"?"ok":"warn")+'">'+esc(r.result_status||"—")+'</td><td>'+note+'</td></tr>';
 }).join(""):'<tr><td colspan="4" class="emptyCell">Không có nhật ký bảo trì trong kỳ báo cáo.</td></tr>';
 const dueRows=dueAssets.length?dueAssets.map((a,i)=>'<tr><td class="stt">'+(i+1)+'</td><td><b>'+esc(a.name)+'</b><br><small>'+esc(a.system_type||"—")+' · '+esc(a.location||"—")+'</small></td><td>'+fmt(a.next_due_date)+'</td><td>'+a.frequency_days+' ngày</td><td>'+esc(a.assigned_to||"—")+'</td></tr>').join(""):'<tr><td colspan="5" class="emptyCell">Không có thiết bị đến hạn trong kỳ.</td></tr>';
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>BÁO CÁO BẢO TRÌ THIẾT BỊ - '+period.label+'</title><style>'
   +'@page{size:A4 portrait;margin:20mm}*{box-sizing:border-box}body{font-family:Arial,"Inter",sans-serif;color:#202b33;font-size:10.5pt;line-height:1.45;margin:0;background:#fff}'
   +'.head{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #173d58;padding-bottom:9px;margin-bottom:14px}.brand{font-size:20pt;font-weight:800;letter-spacing:.5px;color:#173d58}.brand small{display:block;font-size:7.5pt;letter-spacing:1.6px;color:#728390}.doc{text-align:right;font-size:9pt;color:#526572;line-height:1.55}'
   +'.title{text-align:center;margin:12px 0 16px}.title h1{margin:0;color:#173d58;font-size:16pt;line-height:1.25}.title p{margin:6px 0 0;color:#8a633c;font-weight:700;font-size:11pt}'
   +'.section{margin:0 0 15px;page-break-inside:auto}.section h2{margin:0 0 7px;padding-bottom:5px;border-bottom:1px solid #d6dee3;color:#173d58;font-size:12pt}.info{width:100%;border-collapse:collapse}.info td{border:1px solid #cfd8de;padding:7px 8px}.info td.label{width:22%;background:#f2f5f7;color:#496170;font-weight:700}.info td.value{width:28%}'
   +'table.report{width:100%;border-collapse:collapse;table-layout:fixed}table.report th,table.report td{border:1px solid #c8d3da;padding:7px 8px;vertical-align:top;word-wrap:break-word}table.report th{background:#173d58;color:#fff;font-size:9pt;text-align:left}table.report th:first-child,table.report .stt{text-align:center;width:7%}table.report td{font-size:9.5pt}table.report td.item b{color:#173d58}table.report small{display:block;margin-top:2px;color:#697b86;font-size:8.5pt}table.report p{margin:4px 0 0}.result{font-weight:700;text-align:center}.result.ok{color:#257454}.result.warn{color:#b15a32}.emptyCell{text-align:center;color:#7b8991;font-style:italic}'
   +'.summaryBox{border:1px solid #cfd8de;border-left:4px solid #173d58;padding:10px 12px;background:#fafcfd}.summaryBox p{margin:3px 0}.summaryStatus{font-weight:800;color:#173d58}'
   +'.signature{width:100%;margin-top:22px;border-collapse:separate;border-spacing:18px 0;page-break-inside:avoid}.signature td{width:50%;text-align:center;vertical-align:top;border:0;padding:0}.signature b{display:block;font-size:10.5pt;color:#173d58}.signSpace{height:54px}.signLine{text-align:left;margin:5px 0;border-bottom:1px dotted #8a969d;height:20px;font-size:9pt;color:#677984}'
   +'.muted{color:#697b86}.period{font-weight:700}'
   +'</style></head><body data-pdf-report="inspection">'
   +'<div class="head"><div class="brand">ESTA<small>PROPERTY MANAGEMENT</small></div><div class="doc">Mã báo cáo: <b>'+period.code+'</b><br>Ngày lập: <b>'+new Date().toLocaleDateString("vi-VN")+'</b></div></div>'
   +'<div class="title"><h1>BÁO CÁO BẢO TRÌ THIẾT BỊ - '+period.label+'</h1><p>'+fmt(period.from)+' - '+fmt(period.to)+'</p></div>'
   +'<section class="section"><h2>1. Thông tin chung</h2><table class="info"><tr><td class="label">Dự án / công trình</td><td class="value">'+esc(currentBuilding.name||"[CẦN BỔ SUNG]")+'</td><td class="label">Hạng mục</td><td class="value">Bảo trì thiết bị kỹ thuật</td></tr><tr><td class="label">Địa điểm</td><td class="value">'+esc(currentBuilding.name||"[CẦN BỔ SUNG]")+'</td><td class="label">Kỳ báo cáo</td><td class="value period">'+esc(period.label)+'</td></tr><tr><td class="label">Thời gian kiểm tra</td><td class="value">'+fmt(period.from)+' - '+fmt(period.to)+'<br><span class="muted">Giờ: [CẦN BỔ SUNG]</span></td><td class="label">Đơn vị thực hiện</td><td class="value">[CẦN BỔ SUNG]</td></tr></table></section>'
   +'<section class="section"><h2>2. Nội dung kiểm tra</h2><table class="report"><colgroup><col style="width:7%"><col style="width:48%"><col style="width:17%"><col style="width:28%"></colgroup><thead><tr><th>STT</th><th>Hạng mục kiểm tra</th><th>Kết quả</th><th>Ghi chú / Đánh giá</th></tr></thead><tbody>'+rows+'</tbody></table></section>'
   +'<section class="section"><h2>3. Kế hoạch thiết bị đến hạn trong kỳ</h2><table class="report"><colgroup><col style="width:7%"><col style="width:41%"><col style="width:17%"><col style="width:15%"><col style="width:20%"></colgroup><thead><tr><th>STT</th><th>Thiết bị</th><th>Ngày đến hạn</th><th>Chu kỳ</th><th>Phụ trách</th></tr></thead><tbody>'+dueRows+'</tbody></table></section>'
   +'<section class="section"><h2>4. Kết luận / Đánh giá chung</h2><div class="summaryBox"><p><b>Tóm tắt:</b> '+records.length+' lượt kiểm tra/bảo trì; '+done+' hoàn thành; '+attention+' cần theo dõi/khắc phục; '+dueAssets.length+' thiết bị có hạn trong kỳ.</p><p><b>Đánh giá:</b> <span class="summaryStatus">'+overall+'</span></p><p><b>Kiến nghị:</b> '+recommendation+'</p></div></section>'
   +'<table class="signature"><tr><td><b>NGƯỜI KIỂM TRA (KT)</b><div class="signSpace"></div><div class="signLine">Họ tên:</div><div class="signLine">Chữ ký:</div><div class="signLine">Ngày ký:</div></td><td><b>NGƯỜI KIỂM SOÁT / GIÁM SÁT (KST)</b><div class="signSpace"></div><div class="signLine">Họ tên:</div><div class="signLine">Chữ ký:</div><div class="signLine">Ngày ký:</div></td></tr></table>'
   +'</body></html>';
}

/* Event wiring: Inventory */
inventorySetYears();
document.querySelectorAll("[data-material-month]").forEach(b=>b.onclick=()=>{inventoryActiveMonth=b.dataset.materialMonth==="all"?"all":(Number(b.dataset.materialMonth)||1);renderMaterials()});
document.querySelectorAll("[data-inventory-tab]").forEach(b=>b.onclick=()=>setInventoryTab(b.dataset.inventoryTab));
$("#inventoryYear").onchange=()=>renderMaterials();
$("#materialSearch").oninput=renderMaterials;
$("#stockAlertOnly").onclick=()=>{inventoryShowAlertsOnly=!inventoryShowAlertsOnly;renderMaterials()};
$("#toolSearch").oninput=renderTools;
$("#addMaterialBtn").onclick=()=>openMaterialModal();
$("#openStockTxn").onclick=()=>openStockTxnModal();
$("#addToolBtn").onclick=()=>openToolModal();
$("#materialExportPdf").onclick=()=>{if(!inventoryMaterials.length)return toast("Chưa có vật tư để xuất PDF");inventoryPrintWindow(materialReportHtml())};
$("#toolExportPdf").onclick=()=>{if(!inventoryTools.length)return toast("Chưa có dụng cụ để xuất PDF");inventoryPrintWindow(toolReportHtml())};
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
$("#stockTxnMaterial").onchange=()=>{
 const m=inventoryMaterials.find(x=>x.id===$("#stockTxnMaterial").value);
 $("#stockTxnDate").min=m?inventoryTrackingStart(m):"";
 $("#stockTxnDate").max=today();
 if(m&&$("#stockTxnDate").value<inventoryTrackingStart(m))$("#stockTxnDate").value=inventoryTrackingStart(m);
};
$("#stockTxnForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const materialId=$("#stockTxnMaterial").value,qty=inventoryNum($("#stockTxnQty").value),txType=$("#stockTxnType").value,date=$("#stockTxnDate").value;
 if(!materialId||qty<=0)return toast("Vui lòng chọn vật tư và số lượng");
 const m=inventoryMaterials.find(x=>x.id===materialId);
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

/* Event wiring: Maintenance */
$("#maintenanceSearch").oninput=renderMaintenance;
$("#maintenanceSystemFilter").onchange=renderMaintenance;
$("#maintenanceDueFilter").onchange=renderMaintenance;
$("#maintenanceMonthClear").onclick=()=>{maintenanceActiveMonth="";renderMaintenance()};
$("#addMaintenanceAsset").onclick=()=>openMaintenanceAssetModal();
$("#maintenanceExportPdf").onclick=()=>{
 if(!maintenanceAssets.length&&!maintenanceRecords.length)return toast("Chưa có dữ liệu bảo trì để xuất PDF");
 $("#maintenanceExportModal").classList.remove("hide");
};
$("#closeMaintenanceExport").onclick=()=>$("#maintenanceExportModal").classList.add("hide");
$("#maintenanceExportModal").onclick=e=>{if(e.target===$("#maintenanceExportModal"))$("#maintenanceExportModal").classList.add("hide")};
document.querySelectorAll("[data-maint-report-range]").forEach(b=>b.onclick=()=>{
 const kind=b.dataset.maintReportRange==="month"?"month":"week";
 const period=maintenanceReportPeriod(kind);
 $("#maintenanceExportModal").classList.add("hide");
 downloadReportPdf(maintenanceReportHtml(kind),maintenanceReportFilename(period));
});
document.querySelectorAll("[data-maint-sample]").forEach(b=>b.onclick=()=>{const [n,s,f]=b.dataset.maintSample.split("|");openMaintenanceAssetModal(n,s,Number(f))});
$("#closeMaintenanceAssetModal").onclick=$("#cancelMaintenanceAssetModal").onclick=()=>$("#maintenanceAssetModal").classList.add("hide");
$("#closeMaintenanceRecordModal").onclick=$("#cancelMaintenanceRecordModal").onclick=()=>$("#maintenanceRecordModal").classList.add("hide");
function syncMaintenanceNextDate(){
 const freq=Math.max(1,Number($("#maintenanceFrequency").value)||30);
 const last=$("#maintenanceLastDate").value;
 $("#maintenanceNextDate").value=maintenanceAutoNext(last,freq);
}
$("#maintenanceLastDate").onchange=syncMaintenanceNextDate;
$("#maintenanceFrequency").oninput=syncMaintenanceNextDate;
$("#maintenanceFrequency").onchange=syncMaintenanceNextDate;
$("#maintenanceRecordDate").onchange=()=>{
 const assetId=$("#maintenanceRecordAssetId").value,a=maintenanceAssets.find(x=>String(x.id)===String(assetId));
 if(a&&$("#maintenanceRecordDate").value)$("#maintenanceRecordNextDate").value=maintenanceAutoNext($("#maintenanceRecordDate").value,a.frequency_days);
};
$("#maintenanceAssetForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const id=$("#maintenanceAssetId").value,freq=Math.max(1,Number($("#maintenanceFrequency").value)||30),last=$("#maintenanceLastDate").value||null,next=maintenanceAutoNext(last,freq);
 const existing=id?maintenanceAssets.find(x=>String(x.id)===String(id)):null;
 const body={building_id:currentBuilding.id,code:existing?.code||maintenanceAutoCode(),name:$("#maintenanceName").value.trim(),system_type:$("#maintenanceSystem").value,location:$("#maintenanceLocation").value.trim(),manufacturer:$("#maintenanceManufacturer").value.trim(),model:$("#maintenanceModel").value.trim(),frequency_days:freq,last_service_date:last,next_due_date:next,assigned_to:$("#maintenanceAssigned").value,status:$("#maintenanceStatus").value,note:$("#maintenanceNote").value.trim(),updated_at:new Date().toISOString()};
 try{
   if(id)await sbFetch("/rest/v1/maintenance_assets?id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body});
   else await sbFetch("/rest/v1/maintenance_assets",{method:"POST",token:centralSession.access_token,body});
   $("#maintenanceAssetModal").classList.add("hide");await loadMaintenanceData(currentBuilding.id,true);toast(id?"Đã cập nhật thiết bị và lịch tự động":"Đã thêm thiết bị và tạo lịch tự động");
 }catch(err){toast(err.status===409?"Thiết bị cùng tên/vị trí đã có":err.message)}
};
$("#maintenanceRecordForm").onsubmit=async e=>{
 e.preventDefault();if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const assetId=$("#maintenanceRecordAssetId").value,a=maintenanceAssets.find(x=>String(x.id)===String(assetId));if(!a)return toast("Không tìm thấy thiết bị");
 const serviceDate=$("#maintenanceRecordDate").value,next=maintenanceAutoNext(serviceDate,a.frequency_days);
 $("#maintenanceRecordNextDate").value=next;
 const body={building_id:currentBuilding.id,asset_id:assetId,service_date:serviceDate,maintenance_type:$("#maintenanceRecordType").value,performer:$("#maintenanceRecordPerformer").value,result_status:$("#maintenanceRecordResult").value,work_done:$("#maintenanceWorkDone").value.trim(),note:$("#maintenanceRecordNote").value.trim(),next_due_date:next,cost:Math.max(0,inventoryNum($("#maintenanceCost").value))};
 try{
   await sbFetch("/rest/v1/maintenance_records",{method:"POST",token:centralSession.access_token,body});
   await sbFetch("/rest/v1/maintenance_assets?id=eq."+encodeURIComponent(assetId)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body:{last_service_date:serviceDate,next_due_date:next,updated_at:new Date().toISOString()}});
   $("#maintenanceRecordModal").classList.add("hide");await loadMaintenanceData(currentBuilding.id,true);toast("Đã lưu bảo trì; hạn kế tiếp được tự động cập nhật");
 }catch(err){toast(err.message)}
};

/* ===== ADMIN TRUNG TÂM / ĐA DỰ ÁN ===== */
async function adminApi(action,payload={}){
 if(!centralSession?.access_token)throw new Error("Chưa kích hoạt hoặc đăng nhập Admin trung tâm");
 return sbFetch("/functions/v1/admin-users",{method:"POST",token:centralSession.access_token,body:{action,...payload}});
}
function adminProjectCard(b,index=0){
 const safeId=esc(b.id),safeName=esc(b.name||b.id),tone="tone"+(index%4);
 const projectIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V8l6-3 6 3v12M9 11h2v2H9zM13 11h2v2h-2zM9 15h2v2H9zM13 15h2v2h-2z"/></svg>';
 return '<div class="adminProjectCard '+tone+'"><button class="adminProjectOpen" type="button" onclick="adminOpenBuilding(\''+safeId+'\',event)"><div class="adminProjectIcon">'+projectIcon+'</div><div class="adminProjectCopy"><small>'+safeId+'</small><h3>'+safeName+'</h3></div><span class="adminProjectArrow" aria-hidden="true">→</span></button></div>';
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
 box.innerHTML=list.map(b=>'<div class="settingsRow"><div class="settingsRowMain"><div class="settingsRowIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V8h12v12M9 8V5h6v3M9 12h2M13 12h2M9 16h6"/></svg></div><div><b>'+esc(b.name||b.id)+'</b><small>'+esc(b.id)+'</small></div></div><button class="settingsDeleteBtn" type="button" onclick="adminDeleteBuilding(\''+esc(b.id)+'\',\''+esc(b.name||b.id).replace(/'/g,"&#39;")+'\')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M8 10v8M12 10v8M16 10v8M7 7l1 14h8l1-14"/></svg><span>Xóa</span></button></div>').join("");
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
     return '<div class="settingsRow trashRow"><div class="settingsRowMain"><div class="settingsRowIcon trashIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M8 10v8M12 10v8M16 10v8M7 7l1 14h8l1-14"/></svg></div><div><b>'+esc(b.name||b.id)+'</b><small>'+esc(b.id)+(when?" · Đã xóa "+esc(when):"")+'</small></div></div><button class="settingsRestoreBtn" type="button" onclick="adminRestoreBuilding(\''+esc(b.id)+'\')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M5 5a8 8 0 1 1-1 9"/></svg><span>Khôi phục</span></button></div>';
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
     return '<div class="adminUserRow"><div class="adminUserMain"><div class="adminAvatar">'+name.slice(0,1).toLocaleUpperCase("vi-VN")+'</div><div><b>'+name+'</b><small>'+(u.username?esc(u.username):esc(u.email||""))+'</small><div class="adminUserProjects">'+projects+'</div></div></div><div class="adminUserActions">'+(u.is_admin?'<span class="adminBadge">ADMIN</span>':'<button type="button" onclick="adminResetPassword(\''+u.id+'\')"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15 12v2"/></svg><span>Đổi mật khẩu</span></button><button type="button" class="'+(u.active?"danger":"success")+'" onclick="adminToggleUser(\''+u.id+'\','+(!u.active)+')">'+(u.active?'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>Khóa</span>':'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M9 10V7a4 4 0 0 1 7-2.5"/></svg><span>Mở khóa</span>')+'</button><button type="button" class="danger" onclick="adminDeleteUser(\''+u.id+'\',\''+name.replace(/'/g,"&#39;")+'\')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M8 10v8M12 10v8M16 10v8M7 7l1 14h8l1-14"/></svg><span>Xóa</span></button>')+'</div></div>';
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
 ["taskForm","energyForm","materialItemForm","stockTxnForm","toolItemForm","maintenanceAssetForm","maintenanceRecordForm","contractorForm","contractorJobForm","constructionMaterialForm","constructionStockTxnForm","constructionLogForm"].forEach(fid=>{
   const f=$("#"+fid);if(!f)return;
   f.querySelectorAll("input,select,textarea,button").forEach(el=>{if(el.id!=="cancelEdit"&&el.id!=="energyCancelEdit")el.disabled=!canEdit});
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
