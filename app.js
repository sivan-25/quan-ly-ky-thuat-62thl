const $=s=>document.querySelector(s);
const SB_URL="https://upcjcrycahdfroxggsdz.supabase.co";
const SB_KEY="sb_publishable_WQiZyrTXCeRr6BgfXAtQSg_zX_eUBsa";
let me=null,centralSession=null,currentAccount=null,currentBuilding={id:"62THL",name:"62 Trần Huy Liệu",role:"editor"};
// Account role and the selected overview scope are separate concerns.
let projectOverviewActive=false;
function isAdminOverview(){return !!currentAccount?.is_admin&&!projectOverviewActive}

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
function storageProjectSegment(buildingId){
 const bytes=new TextEncoder().encode(String(buildingId||""));
 return "b-"+Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
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
 const path=storageProjectSegment(buildingId)+"/"+kind+"/"+recordId+"/"+Date.now()+"-"+index+"-"+uid+".jpg";
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
let syncMobilePeopleLayout=()=>{};
function renderPeopleSelector(kind){
 syncMobilePeopleLayout();
 const box=kind==="energy"?$("#energyPeopleOptions"):$("#taskPeopleOptions");
 const btn=kind==="energy"?$("#energyPeopleButton"):$("#taskPeopleButton");
 if(!box||!btn)return;
 const inline=box.closest(".inlinePeoplePicker")!==null;
 const selected=peopleSelected(kind);
 const names=[...new Set([...projectPeople.map(x=>x.name),...selected])].filter(Boolean);
 if(!names.length){
   box.innerHTML='<div class="peopleEmpty"><b>Chưa có người thực hiện</b><span>Chọn “'+(inline?'Quản lý':'Chỉnh sửa danh sách')+'” để thêm nhân sự cho dự án.</span></div>';
 }else{
   const scrollTop=box.scrollTop;
   const existing=Array.from(box.querySelectorAll("[data-person]"));
   const sameNames=existing.length===names.length&&existing.every((el,i)=>el.dataset.person===encodeURIComponent(names[i])&&(el.tagName==="LABEL")===inline);
   if(!sameNames){
    box.innerHTML=names.map(name=>{
     const on=selected.includes(name);
     if(inline)return '<label class="peopleOption '+(on?"selected":"")+'" data-person="'+encodeURIComponent(name)+'"><input type="checkbox" class="peopleNativeCheck" '+(on?'checked':'')+'><span class="peopleName">'+esc(name)+'</span></label>';
     return '<button type="button" class="peopleOption '+(on?"selected":"")+'" data-person="'+encodeURIComponent(name)+'" aria-pressed="'+on+'">'+((kind==="task"||kind==="energy")?'<span class="peopleAvatar">'+esc(personInitials(name))+'</span>':'')+'<span class="peopleName">'+esc(name)+'</span><span class="peopleCheck">'+(on?"✓":"")+'</span></button>';
    }).join("");
   }else{
    existing.forEach(el=>{
     const on=selected.includes(decodeURIComponent(el.dataset.person));
     el.classList.toggle("selected",on);el.setAttribute("aria-pressed",String(on));
     const native=el.querySelector(".peopleNativeCheck");if(native)native.checked=on;
     const check=el.querySelector(".peopleCheck");if(check)check.textContent=on?"✓":"";
    });
   }
   box.scrollTop=scrollTop;
   box.querySelectorAll("[data-person]").forEach(el=>el.onclick=e=>{
     if(inline)return;
     e.preventDefault();e.stopPropagation();
     const name=decodeURIComponent(el.dataset.person),next=[...peopleSelected(kind)];
     const idx=next.indexOf(name);if(idx>=0)next.splice(idx,1);else next.push(name);
     setPeopleSelected(kind,next);
     if(kind==="task")saveDraft();
   });
   if(inline)box.querySelectorAll(".peopleNativeCheck").forEach(input=>input.onchange=()=>{
    const name=decodeURIComponent(input.closest("[data-person]").dataset.person);
    const next=peopleSelected(kind).filter(n=>n!==name);
    if(input.checked)next.push(name);
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
let peopleMenuOpenSeq=0;
function closePeopleMenus(){
 peopleMenuOpenSeq+=1;
 ["taskPeopleMenu","energyPeopleMenu"].forEach(id=>{
  const menu=document.getElementById(id);
  if(menu&&!menu.classList.contains("inlinePeoplePicker"))menu.classList.add("hide");
 });
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
 if(!buildingId||!projectOverviewActive)return;
 const requestSeq=projectOpenSeq;
 let cached=[];try{cached=JSON.parse(localStorage.getItem(peopleLocalKey(buildingId))||"[]")}catch(e){}
 projectPeople=Array.isArray(cached)?cached:[];
 renderAllPeopleSelectors();
 if(!centralSession?.access_token)return;
 try{
   let rows=await fetchProjectPeople(buildingId);
   if(requestSeq!==projectOpenSeq||!projectOverviewActive||buildingId!==currentBuilding?.id)return;
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
   if(requestSeq!==projectOpenSeq||!projectOverviewActive||buildingId!==currentBuilding?.id)return;
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

function togglePeopleMenu(kind,event){
 event.preventDefault();event.stopPropagation();
 // Re-apply responsive placement at interaction time. This prevents a project
 // switch from leaving the Work picker in the previous project's sheet mode.
 syncMobilePeopleLayout();
 const menu=document.getElementById(kind==="energy"?"energyPeopleMenu":"taskPeopleMenu");
 if(menu.classList.contains("inlinePeoplePicker")){
  menu.classList.toggle("hide");
  document.getElementById(kind==="energy"?"energyPeopleButton":"taskPeopleButton")?.setAttribute("aria-expanded",String(!menu.classList.contains("hide")));
  return;
 }
 const open=menu.classList.contains("hide");
 closePeopleMenus();if(!open)return;
 const seq=peopleMenuOpenSeq;
 const focused=document.activeElement;
 const vv=window.visualViewport;
 const mobile=window.matchMedia("(max-width:760px)").matches;
 const keyboard=mobile&&!!vv&&window.innerHeight-vv.height>140;
 if(mobile&&focused?.matches("input,textarea,[contenteditable=true]"))focused.blur();
 const started=Date.now();
 function reveal(){
  if(seq!==peopleMenuOpenSeq)return;
  // Do not move the picker under the finger while the iOS keyboard is closing.
  if(keyboard&&vv&&window.innerHeight-vv.height>140&&Date.now()-started<900){
   setTimeout(reveal,50);return;
  }
  menu.classList.remove("hide");
 }
 reveal();
}
$("#taskPeopleButton").onclick=e=>togglePeopleMenu("task",e);
$("#energyPeopleButton").onclick=e=>togglePeopleMenu("energy",e);
$("#taskPeopleMenu").onclick=e=>e.stopPropagation();
$("#energyPeopleMenu").onclick=e=>e.stopPropagation();
document.querySelectorAll("[data-people-edit]").forEach(btn=>btn.onclick=e=>{e.preventDefault();e.stopPropagation();openPeopleManager()});
document.addEventListener("click",e=>{if(!e.target.closest(".peopleSelect"))closePeopleMenus()});
$("#closePeopleManager").onclick=()=>$("#peopleManagerModal").classList.add("hide");
$("#peopleManagerModal").onclick=e=>{if(e.target===$("#peopleManagerModal"))$("#peopleManagerModal").classList.add("hide")};
$("#peopleAddForm").onsubmit=async e=>{e.preventDefault();const input=$("#newPersonName"),name=input.value.trim();if(!name)return;input.value="";await addProjectPerson(name);input.focus()};

/* Mobile people picker is a top-level sheet, outside form stacking contexts. */
function setupMobilePeopleSheets(){
 const media=window.matchMedia("(max-width:760px)");
 const menus=["taskPeopleMenu","energyPeopleMenu"].map(id=>document.getElementById(id)).filter(Boolean);
 const anchors=new Map();
 menus.forEach(menu=>{
  const anchor=document.createComment("people-picker-position");menu.before(anchor);anchors.set(menu,anchor);
  const head=menu.querySelector(".peopleMenuHead");
  if(head&&!head.querySelector(".peopleSheetClose")){
   const close=document.createElement("button");close.type="button";close.className="peopleSheetClose";
   close.textContent="×";close.setAttribute("aria-label","Đóng chọn người thực hiện");
   close.onclick=e=>{e.preventDefault();e.stopPropagation();closePeopleMenus()};
   head.append(close);
  }
 });
 function arrange(){
  const sharedCompactProjects=new Set(["62THL","68PĐL","68PDL","127HH","130HH"]);
  const projectId=String(currentBuilding?.id||"").trim().toUpperCase();
  const compactProject=media.matches&&projectOverviewActive&&
    (sharedCompactProjects.has(projectId)||(!["DEMO","UPDATE"].includes(projectId)&&!!projectId));
  // Keep the existing class name for CSS compatibility; the approved 62THL
  // compact Work layout is now the shared standard for all four live projects.
  document.getElementById("taskForm")?.classList.toggle("peopleCompact62",compactProject);
  menus.forEach(menu=>{
   // Work uses the approved inline picker on all live projects. Energy stays a
   // full-width mobile sheet because its performer field shares a half-width row with Date.
   const inline=compactProject&&menu.id==="taskPeopleMenu";
   const wasInline=menu.classList.contains("inlinePeoplePicker");
   if(media.matches&&!inline){if(menu.parentNode!==document.body)document.body.appendChild(menu);menu.classList.add("mobilePeopleSheet")}
   else{if(menu.previousSibling!==anchors.get(menu))anchors.get(menu).after(menu);menu.classList.remove("mobilePeopleSheet")}
   menu.classList.toggle("inlinePeoplePicker",inline);
   if(inline&&!wasInline)menu.classList.remove("hide");else if(!inline&&wasInline)menu.classList.add("hide");
   const edit=menu.querySelector("[data-people-edit]");
   if(edit){
    if(!edit.dataset.originalLabel)edit.dataset.originalLabel=edit.textContent;
    let actions=menu.querySelector(".peopleInlineActions");
    if(inline){
     if(!actions){
      actions=document.createElement("div");actions.className="peopleInlineActions";menu.append(actions);
      const confirm=document.createElement("button");confirm.type="button";confirm.className="peopleInlineConfirm";
      confirm.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Xác nhận</span>';
      confirm.onclick=e=>{
       e.preventDefault();e.stopPropagation();menu.classList.add("hide");
       const trigger=document.getElementById(menu.id==="energyPeopleMenu"?"energyPeopleButton":"taskPeopleButton");
       trigger?.setAttribute("aria-expanded","false");trigger?.focus({preventScroll:true});
      };
      actions.append(confirm);
     }
     if(edit.parentNode!==actions)actions.prepend(edit);
     edit.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m16 3 5 5-12 12-6 1 1-6L16 3Zm-2 2 5 5M4 15l5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Quản lý</span>';edit.title="Quản lý danh sách";edit.setAttribute("aria-label","Quản lý danh sách");
    }else{
     if(actions){menu.append(edit);actions.remove()}
     menu.querySelector(".peopleInlineHead")?.remove();
     edit.textContent=edit.dataset.originalLabel;edit.removeAttribute("title");edit.removeAttribute("aria-label");
    }
   }
  });
 }
 syncMobilePeopleLayout=arrange;
 function syncCompactPeopleSize(){
  const sharedCompactProjects=new Set(["62THL","68PĐL","68PDL","127HH","130HH"]);
  const projectId=String(currentBuilding?.id||"").trim().toUpperCase();
  if(!media.matches||!projectOverviewActive||["DEMO","UPDATE"].includes(projectId)||!projectId)return;
  const tile=document.querySelector("#workChoices-type .workChoiceTile");
  const width=tile?.getBoundingClientRect().width||0;
  if(width>0)menus.forEach(menu=>menu.style.setProperty("--esta-person-choice-width",width+"px"));
 }
 const form=document.getElementById("taskForm");
 if(form&&typeof ResizeObserver!=="undefined")new ResizeObserver(syncCompactPeopleSize).observe(form);
 window.addEventListener("resize",syncCompactPeopleSize,{passive:true});
 document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(syncCompactPeopleSize));
 const refresh=()=>{arrange();renderAllPeopleSelectors()};
 if(media.addEventListener)media.addEventListener("change",refresh);else media.addListener(refresh);
 arrange();
}
setupMobilePeopleSheets();

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
function taskDispatchMetadata(task){
 const metadata={};
 for(const key of ["dispatchGroupId","dispatchedByAdmin","dispatchedAt"]){if(task&&Object.prototype.hasOwnProperty.call(task,key))metadata[key]=task[key]}
 return metadata;
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
 const buildingId=building.id,requestSeq=projectOpenSeq;
 const taskKey=taskStorageKeyFor(buildingId);
 const energyKey=buildingId==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+buildingId;

 // Local storage is only a cache. Preserve any previous browser-only data
 // before replacing the cache with the server snapshot.
 let previousLocalTasks=[],previousLocalEnergy=[];
 try{previousLocalTasks=JSON.parse(localStorage.getItem(taskKey)||"[]")}catch(e){}
 try{previousLocalEnergy=JSON.parse(localStorage.getItem(energyKey)||"[]")}catch(e){}

 try{
   const r=await projectSync("get",{},buildingId);
   if(requestSeq!==projectOpenSeq||!projectOverviewActive||currentBuilding?.id!==buildingId)return false;
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
   if(requestSeq!==projectOpenSeq||!projectOverviewActive||currentBuilding?.id!==buildingId)return false;
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
 $("#homeAdminProjects")?.classList.add("hide");
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
 const admin=isAdminOverview();
 $("#homeAdminProjects")?.classList.add("hide");
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
 closeWorkFilter();
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
 if(!projectOverviewActive)return;
 renderAllPeopleSelectors();
 const name=currentBuilding?.name||"Dự án";
 document.querySelectorAll(".buildingNameText").forEach(el=>el.textContent=name);
 const ht=$("#topHomeTitle p"),wt=$("#topWorkTitle p"),et=$("#topEnergyTitle p"),it=$("#topInventoryTitle p"),mt=$("#topMaintenanceTitle p"),ct=$("#topContractorTitle p"),cmt=$("#topConstructionTitle p");
 if(ht)ht.textContent=isAdminOverview()?"Toàn bộ dự án":name;
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
function closeProjectOverlays(){
 try{restoreWorkEntryCard()}catch(e){}
 ["demoIncidentModal","demoChecklistModal","technicalDocumentModal","demoTaskDrawer","ccDispatchModal","viewer","peopleManagerModal"].forEach(id=>$("#"+id)?.classList.add("hide"));
 closePeopleMenus();
 window.estaCloseProjectOverlays?.();
 document.body.classList.remove("workEditOpen","demoModalOpen","demoChecklistModalOpen");
}
function openAdminOverview(){
 if(!currentAccount?.is_admin)return;
 openAdminPortal();
 showHome();
}
function prepareProjectContext(building){
 closeProjectOverlays();
 projectOverviewActive=true;
 const checklistBtn=$("#demoChecklistSaveBtn");if(checklistBtn){checklistBtn.disabled=false;checklistBtn.textContent="Lưu checklist"}
 const incidentBtn=$("#demoIncidentSaveBtn");if(incidentBtn){incidentBtn.disabled=false;incidentBtn.textContent="Lưu sự cố"}
 const documentBtn=$("#technicalDocumentSubmit");if(documentBtn)documentBtn.disabled=false;
 $("#technicalDocumentProgress")?.classList.add("hide");

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
 if(openSeq!==projectOpenSeq||!projectOverviewActive||currentBuilding?.id!==buildingId)return false;
 try{await loadProjectPeople(buildingId)}catch(e){console.warn("Project people load skipped",e)}
 if(openSeq!==projectOpenSeq||!projectOverviewActive||currentBuilding?.id!==buildingId)return false;

 // Only refresh content. Never change the page after the user has entered the project.
 try{applyBuildingUI()}catch(e){console.warn("Final project UI refresh skipped",e)}
 return true;
}
function openAdminPortal(){
 closeWorkFilter();
 if(!currentAccount?.is_admin)return;
 projectOpenSeq+=1;
 projectOverviewActive=false;
 closeProjectOverlays();
 ["navWork","navEnergy","navInventory","navMaintenance","navContractor","navConstruction"].forEach(id=>$("#"+id)?.classList.add("hide"));
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
 projectOpenSeq+=1;
 projectOverviewActive=false;
 currentAccount=account;centralSession=session;me=account.username||account.email||"user";
 $("#login").classList.add("hide");$("#app").classList.remove("hide");
 $("#headerRole").textContent=account.is_admin?"Quản trị viên":(account.buildings?.[0]?.role==="viewer"?"Chỉ xem":"Kỹ thuật viên");
 if($("#energyHeaderName"))$("#energyHeaderName").textContent="ESTA";
 $("#sideUser").innerHTML=account.is_admin?"Quản trị viên":"Tài khoản dự án";
 $("#navAdmin").classList.toggle("hide",!account.is_admin);
 $("#headerAvatar").textContent="E";$("#sideAvatar").textContent="E";
 renderTechnicalProjectSwitcher();
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
function syncWorkContentHeight(){
 const el=$("#content");if(!el)return;
 if(!mobileNavQuery.matches){el.style.removeProperty("height");el.style.removeProperty("overflow-y");return}
 el.style.height="auto";
 el.style.height=Math.max(76,el.scrollHeight)+"px";
 el.style.overflowY="hidden";
}
function setWorkSaveLabel(label){
 const btn=$("#saveBtn");if(!btn)return;
 let span=btn.querySelector("span");
 if(!span){
  btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg><span></span>';
  span=btn.querySelector("span");
 }
 span.textContent=label;
}
const DRAFT="qlkt62_draft";
function saveDraft(){
 if($("#editId").value)return;
 localStorage.setItem(DRAFT,JSON.stringify({d:$("#date").value,c:$("#content").value,t:$("#type").value,s:$("#status").value,a:$("#performer").value,n:$("#note").value}))
}
function restoreDraft(){
 try{
  let d=JSON.parse(localStorage.getItem(DRAFT)||"null");if(!d)return;
  $("#date").value=d.d||today();$("#content").value=d.c||"";$("#type").value=d.t||"Hằng ngày";$("#status").value=d.s||"Đang thực hiện";
  setPeopleSelected("task",String(d.a||"").split(",").map(v=>v.trim()).filter(Boolean));$("#note").value=d.n||"";
  requestAnimationFrame(syncWorkContentHeight);
 }catch(e){}
}
let existingTaskImages=[],removedTaskImageRefs=[],pendingTaskFiles=[],pendingPreviewUrls=[];
function workEntryCard(){return document.querySelector("#workPage .workEntryCard")||document.querySelector("#workEditDrawer .workEntryCard")}
function openWorkEditDrawer(){
 const drawer=$("#workEditDrawer"),mount=$("#workEditDrawerMount"),card=workEntryCard();
 if(!drawer||!mount||!card)return;
 const mobile=mobileNavQuery.matches;
 if(mobile){
   const active=document.activeElement;
   if(active&&typeof active.blur==="function")active.blur();
   if(drawer.parentElement!==document.body)document.body.appendChild(drawer);
   document.body.classList.remove("estaMobileKeyboard");
   document.documentElement.style.removeProperty("--esta-mobile-keyboard-inset");
 }
 mount.appendChild(card);
 mount.scrollTop=0;
 drawer.classList.remove("hide");drawer.setAttribute("aria-hidden","false");
 document.body.classList.add("workEditOpen");
 $("#workEntryTitle")&&($("#workEntryTitle").textContent="Chỉnh sửa công việc");
 if(!mobile)setTimeout(()=>$("#content")?.focus({preventScroll:true}),60);
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
 syncCompletionNoteRequirement(false);
 clearPendingTaskFiles();clearExistingTaskImages();$("#imageInfo").textContent="";setWorkSaveLabel("Lưu");$("#cancelEdit").classList.add("hide");
 requestAnimationFrame(syncWorkContentHeight);
 restoreWorkEntryCard();
 if(clearDraft)localStorage.removeItem(DRAFT)
}
$("#cancelEdit").onclick=()=>resetForm();
$("#closeWorkEditDrawer")?.addEventListener("click",()=>resetForm());
$("#workEditDrawer")?.addEventListener("click",e=>{if(e.target.closest("[data-close-work-editor]"))resetForm()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#workEditDrawer")?.classList.contains("hide"))resetForm()});
function usesSingleTaskResult(){
 return ["62THL","68PĐL","68PDL","127HH","130HH"].includes(String(currentBuilding?.id||""));
}
function syncCompletionNoteRequirement(focusNote=false){
 const status=$("#status")?.value||"",note=$("#note"),field=$("#workNoteField"),hint=$("#completionNoteHint");
 if(!note)return true;
 const completed=status==="Đã hoàn thành"&&!usesSingleTaskResult();
 const missing=completed&&!note.value.trim();
 note.required=completed;
 note.setAttribute("aria-invalid",String(missing));
 field?.classList.toggle("completionNoteRequired",missing);
 hint?.classList.toggle("hide",!missing);
 if(missing&&focusNote){
   note.focus({preventScroll:true});
   note.scrollIntoView({behavior:"smooth",block:"center"});
 }
 return !missing;
}
$("#status")?.addEventListener("change",()=>{
 syncCompletionNoteRequirement(false);
 saveDraft();
});
$("#note")?.addEventListener("input",()=>{
 syncCompletionNoteRequirement(false);
 saveDraft();
});
["date","content","type","performer"].forEach(id=>$("#"+id).addEventListener("input",saveDraft));
$("#content")?.addEventListener("input",syncWorkContentHeight);
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
 const added=pendingTaskFiles.length,existing=existingTaskImages.length,editing=!!$("#editId")?.value,info=$("#imageInfo");
 if(!info)return;
 if(editing){
  const parts=[];
  if(existing)parts.push(existing+" ảnh hiện tại");
  if(added)parts.push("+"+added+" ảnh mới");
  info.textContent=parts.join(" · ");
 }else info.textContent=added?"Đã chọn "+added+" hình":"";
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
 if(!syncCompletionNoteRequirement(true)){
   toast("Cần nhập ghi chú trước khi hoàn thành công việc");
   return;
 }
 const btn=$("#saveBtn");btn.disabled=true;
 try{
   const buildingId=currentBuilding.id,storageKey=taskStorageKeyFor(buildingId);
   let a=load(),editId=Number($("#editId").value),id=editId||Date.now(),old=editId?a.find(x=>x.id===editId):null;
   const files=[...pendingTaskFiles];
   const removedRefs=[...removedTaskImageRefs];
   const imgs=editId?[...existingTaskImages]:(Array.isArray(old?.imgs)?[...old.imgs]:[]);
   const obj={...taskDispatchMetadata(old),id,d:$("#date").value,c:$("#content").value.trim(),t:$("#type").value,s:$("#status").value,n:$("#note").value.trim(),a:taskSelectedPeople.join(", "),performers:[...taskSelectedPeople],imgs,i:imgs.length};
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
 syncCompletionNoteRequirement(false);
 setWorkSaveLabel("Lưu thay đổi");$("#cancelEdit").classList.remove("hide");
 openWorkEditDrawer();renderExistingTaskImages();updateTaskImageInfo();requestAnimationFrame(syncWorkContentHeight);
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
/* END_ENERGY_ROW_ACTION_MENU_SINGLE_OPEN */
// The topbar owns the real work controls; background refreshes only render table rows.
function positionWorkFilter(){
 const bar=$("#filterBar"),btn=$("#toggleFilter");
 if(!bar||!btn||bar.classList.contains("hide"))return;
 const rect=btn.getBoundingClientRect(),gap=12;
 const width=Math.min(560,window.innerWidth-gap*2);
 bar.style.setProperty("width",width+"px","important");
 bar.style.setProperty("max-height",(window.innerHeight-gap*2)+"px","important");
 const left=Math.max(gap,Math.min(rect.right-width,window.innerWidth-width-gap));
 const height=bar.getBoundingClientRect().height;
 const top=Math.max(gap,Math.min(rect.bottom+8,window.innerHeight-height-gap));
 bar.style.setProperty("left",left+"px","important");
 bar.style.setProperty("top",top+"px","important");
}
$("#toggleFilter").onclick=e=>{
 e.stopPropagation();
 const hidden=$("#filterBar").classList.toggle("hide");
 $("#toggleFilter").setAttribute("aria-expanded",String(!hidden));
 $("#toggleFilter").setAttribute("aria-label",hidden?"Mở bộ lọc":"Đóng bộ lọc");
 if(!hidden)positionWorkFilter();
};
$("#filterBar").onclick=e=>e.stopPropagation();
window.addEventListener("resize",positionWorkFilter);
window.addEventListener("scroll",positionWorkFilter,true);
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
});function closeWorkFilter(restoreFocus=false){
 const bar=$("#filterBar"),btn=$("#toggleFilter");
 if(!bar||bar.classList.contains("hide"))return;
 bar.classList.add("hide");
 btn?.setAttribute("aria-expanded","false");
 btn?.setAttribute("aria-label","Mở bộ lọc");
 if(restoreFocus)btn?.focus({preventScroll:true});
}
$("#closeWorkFilter").onclick=()=>closeWorkFilter(true);
document.addEventListener("pointerdown",e=>{
 const bar=$("#filterBar"),btn=$("#toggleFilter");
 if(!bar||bar.classList.contains("hide"))return;
 if(bar.contains(e.target)||btn?.contains(e.target))return;
 closeWorkFilter();
},true);
document.addEventListener("keydown",e=>{
 if(e.key==="Escape")closeWorkFilter(true);
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

/* ===== REQUIRED KT SIGNATURE FOR EVERY PDF EXPORT ===== */
let pdfSignatureResolver=null;
let pdfSignaturePreviewUrl="";
function pdfSignaturePeople(){
 const names=[...(Array.isArray(projectPeople)?projectPeople:[]).map(x=>String(x?.name||"").trim())];
 const accountName=String(currentAccount?.display_name||"").trim();
 if(accountName)names.push(accountName);
 return [...new Set(names.filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi"));
}
function signatureFileToDataUrl(file){
 return new Promise((resolve,reject)=>{
   if(!file?.type?.startsWith("image/"))return reject(new Error("Chỉ hỗ trợ file hình ảnh"));
   const url=URL.createObjectURL(file),img=new Image();
   img.onload=()=>{
     try{
       const max=1200,scale=Math.min(1,max/Math.max(img.width,img.height));
       const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
       const cv=document.createElement("canvas");cv.width=w;cv.height=h;
       const ctx=cv.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
       cv.toBlob(async blob=>{
         URL.revokeObjectURL(url);
         if(!blob)return reject(new Error("Không thể xử lý ảnh chữ ký KT"));
         try{resolve(await blobAsDataUrl(blob))}catch(e){reject(e)}
       },"image/jpeg",.82);
     }catch(e){URL.revokeObjectURL(url);reject(e)}
   };
   img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Không đọc được ảnh chữ ký KT"))};
   img.src=url;
 });
}
function resetPdfSignatureModal(){
 const select=$("#pdfSignerName"),fullName=$("#pdfSignerFullName"),file=$("#pdfSignatureFile"),preview=$("#pdfSignaturePreview"),err=$("#pdfSignatureError");
 if(!select||!file)return;
 const people=pdfSignaturePeople();
 select.innerHTML='<option value="">-- Chọn người ký KT --</option>'+
   people.map(name=>'<option value="'+esc(name)+'">'+esc(name)+'</option>').join("")+
   '<option value="__manual__">Khác · nhập họ tên thủ công</option>';
 select.value=people.length?"":"__manual__";
 if(fullName)fullName.value="";
 file.value="";
 if(pdfSignaturePreviewUrl){URL.revokeObjectURL(pdfSignaturePreviewUrl);pdfSignaturePreviewUrl=""}
 if(preview){preview.innerHTML="";preview.classList.add("hide")}
 if(err)err.textContent="";
}
function closePdfSignatureModal(result=null){
 $("#pdfSignatureModal")?.classList.add("hide");
 if(pdfSignaturePreviewUrl){URL.revokeObjectURL(pdfSignaturePreviewUrl);pdfSignaturePreviewUrl=""}
 const resolve=pdfSignatureResolver;pdfSignatureResolver=null;
 if(resolve)resolve(result);
}
function requestPdfSignature(){
 if(pdfSignatureResolver)return Promise.reject(new Error("Đang chờ xác nhận chữ ký KT"));
 resetPdfSignatureModal();
 $("#pdfSignatureModal")?.classList.remove("hide");
 return new Promise(resolve=>{pdfSignatureResolver=resolve});
}
function pdfSignaturePayload(signature){
 return {
   kt_signer_name:String(signature?.name||""),
   kt_signature_data_url:String(signature?.image_data_url||"")
 };
}
async function exportGenericEstaPdf(config={}){
 if(!centralSession?.access_token){toast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");return false}
 const signer=config.signer||await requestPdfSignature();
 if(!signer)return false;
 const payload={
   report_type:"generic",
   building:String(config.building||currentBuilding?.name||"[CẦN BỔ SUNG]"),
   report_date:new Date().toLocaleDateString("vi-VN"),
   period_label:String(config.periodLabel||"THEO DỮ LIỆU HIỆN TẠI"),
   title:String(config.title||"BÁO CÁO KỸ THUẬT"),
   section_label:String(config.sectionLabel||"BÁO CÁO KỸ THUẬT"),
   table_label:String(config.tableLabel||"DANH SÁCH"),
   subtitle:String(config.subtitle||""),
   columns:Array.isArray(config.columns)?config.columns:[],
   rows:Array.isArray(config.rows)?config.rows:[],
   summaries:Array.isArray(config.summaries)?config.summaries:[],
   ...pdfSignaturePayload(signer)
 };
 try{
   toast("Đang tạo PDF theo chuẩn ESTA...");
   const res=await centralAuthFetch("/api/esta_report",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify(payload)
   });
   if(!res.ok){
     let detail={};try{detail=await res.json()}catch(_){}
     throw new Error(detail?.detail||detail?.error||("Không thể tạo PDF ESTA (HTTP "+res.status+")"));
   }
   const blob=await res.blob();
   if(!blob.size||!String(blob.type||"").includes("pdf"))throw new Error("Máy chủ chưa trả về file PDF hợp lệ");
   const url=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=url;a.download=String(config.filename||"ESTA_BaoCao_KyThuat.pdf");
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
   toast("Đã xuất PDF ESTA chuẩn");
   return true;
 }catch(err){
   console.warn("Generic ESTA PDF export failed",err);
   toast(err.message||"Không thể xuất PDF ESTA");
   return false;
 }
}
window.exportGenericEstaPdf=exportGenericEstaPdf;
function estaPdfSignatureBlockHtml(signature){
 const name=esc(String(signature?.name||""));
 const src=esc(String(signature?.image_data_url||""));
 const image=src?'<div class="estaPdfSignatureImage"><img src="'+src+'" alt="Chữ ký KT"></div>':'<div class="estaPdfSignatureBlank"></div>';
 return '<section class="estaPdfSignatureBlock">'+
   '<div class="estaPdfSignatureCell"><b>KỸ THUẬT (KT)</b>'+image+'<strong>'+name+'</strong></div>'+
   '<div class="estaPdfSignatureCell"><b>KIỂM SOÁT / GIÁM SÁT (KST)</b><div class="estaPdfSignatureBlank"></div><strong>&nbsp;</strong></div>'+
 '</section>';
}
function injectPdfSignatureHtml(html,signature){
 const doc=new DOMParser().parseFromString(String(html||""),"text/html");
 doc.querySelectorAll(".sign,.signature3,.signature,.estaPdfSignatureBlock").forEach(el=>el.remove());
 const style=doc.createElement("style");
 style.textContent='.estaPdfSignatureBlock{display:grid;grid-template-columns:1fr 1fr;gap:18mm;margin-top:12mm;padding-top:4mm;border-top:1.5px solid #a46427;break-inside:avoid;page-break-inside:avoid}.estaPdfSignatureCell{text-align:center;min-height:34mm;color:#411437}.estaPdfSignatureCell>b{display:block;font-size:7.5px;letter-spacing:.2px}.estaPdfSignatureImage,.estaPdfSignatureBlank{height:20mm;margin:2mm auto 1mm;display:flex;align-items:center;justify-content:center}.estaPdfSignatureImage img{display:block;max-width:60mm;max-height:19mm;object-fit:contain}.estaPdfSignatureCell>strong{display:block;font-size:8px;color:#411437}.estaPdfSignatureBlank{border:0}';
 doc.head.appendChild(style);
 const holder=doc.createElement("div");holder.innerHTML=estaPdfSignatureBlockHtml(signature);
 const block=holder.firstElementChild,footer=doc.body.querySelector(".foot");
 if(footer)doc.body.insertBefore(block,footer);else doc.body.appendChild(block);
 return '<!doctype html>'+doc.documentElement.outerHTML;
}
function appendPdfSignatureToElement(root,signature){
 if(!root)return null;
 root.querySelectorAll(".estaPdfSignatureBlock").forEach(el=>el.remove());
 const holder=document.createElement("div");holder.innerHTML=estaPdfSignatureBlockHtml(signature);
 const block=holder.firstElementChild;
 Object.assign(block.style,{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18mm",marginTop:"12mm",paddingTop:"4mm",borderTop:"1.5px solid #a46427",breakInside:"avoid",pageBreakInside:"avoid"});
 block.querySelectorAll(".estaPdfSignatureCell").forEach(el=>Object.assign(el.style,{textAlign:"center",minHeight:"34mm",color:"#411437"}));
 block.querySelectorAll(".estaPdfSignatureImage,.estaPdfSignatureBlank").forEach(el=>Object.assign(el.style,{height:"20mm",margin:"2mm auto 1mm",display:"flex",alignItems:"center",justifyContent:"center"}));
 const img=block.querySelector("img");if(img)Object.assign(img.style,{display:"block",maxWidth:"60mm",maxHeight:"19mm",objectFit:"contain"});
 const footer=root.querySelector(".rc-preview-footer");
 if(footer)root.insertBefore(block,footer);else root.appendChild(block);
 return block;
}
window.requestPdfSignature=requestPdfSignature;
window.pdfSignaturePayload=pdfSignaturePayload;
window.estaPdfSignatureBlockHtml=estaPdfSignatureBlockHtml;
window.appendPdfSignatureToElement=appendPdfSignatureToElement;

$("#pdfSignerName")?.addEventListener("change",e=>{
 const fullName=$("#pdfSignerFullName"),value=String(e.target.value||"");
 if(fullName){
   fullName.value=value==="__manual__"?"":value;
   if(value==="__manual__")fullName.focus();
 }
 const err=$("#pdfSignatureError");if(err)err.textContent="";
});
$("#pdfSignatureFile")?.addEventListener("change",e=>{
 const file=e.target.files?.[0],preview=$("#pdfSignaturePreview"),err=$("#pdfSignatureError");
 if(err)err.textContent="";
 if(pdfSignaturePreviewUrl){URL.revokeObjectURL(pdfSignaturePreviewUrl);pdfSignaturePreviewUrl=""}
 if(!file){preview?.classList.add("hide");if(preview)preview.innerHTML="";return}
 if(!file.type.startsWith("image/")){e.target.value="";if(err)err.textContent="Chỉ hỗ trợ file hình ảnh.";return}
 pdfSignaturePreviewUrl=URL.createObjectURL(file);
 if(preview){preview.innerHTML='<img src="'+pdfSignaturePreviewUrl+'" alt="Xem trước chữ ký KT">';preview.classList.remove("hide")}
});
$("#pdfSignatureForm")?.addEventListener("submit",async e=>{
 e.preventDefault();
 const signer=String($("#pdfSignerName")?.value||"").trim();
 const name=String($("#pdfSignerFullName")?.value||"").trim();
 const file=$("#pdfSignatureFile")?.files?.[0];
 const err=$("#pdfSignatureError"),submit=e.currentTarget.querySelector('button[type="submit"]');
 if(!signer){if(err)err.textContent="Vui lòng chọn người ký KT.";return}
 if(!name){if(err)err.textContent="Vui lòng nhập họ và tên người ký KT.";$("#pdfSignerFullName")?.focus();return}
 submit.disabled=true;
 try{
   const image_data_url=file?await signatureFileToDataUrl(file):"";
   closePdfSignatureModal({signer,name,image_data_url});
 }catch(ex){if(err)err.textContent=ex.message||"Không thể xử lý ảnh chữ ký KT."}
 finally{submit.disabled=false}
});
$("#closePdfSignature")?.addEventListener("click",()=>closePdfSignatureModal(null));
$("#cancelPdfSignature")?.addEventListener("click",()=>closePdfSignatureModal(null));
$("#pdfSignatureModal")?.addEventListener("click",e=>{if(e.target===$("#pdfSignatureModal"))closePdfSignatureModal(null)});

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
async function exportEstaGeneratorPdf(rows,signer=null){
 if(!centralSession?.access_token)throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
 const confirmedSigner=signer||await requestPdfSignature();
 if(!confirmedSigner)return false;
 await ensureCentralSessionFresh();
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),115000);
 const requestPdf=()=>fetch("/api/esta_report",{
   method:"POST",
   headers:{
     "Content-Type":"application/json",
     "Authorization":"Bearer "+centralSession.access_token
   },
   body:JSON.stringify({...estaGeneratorPayload(rows),...pdfSignaturePayload(confirmedSigner)}),
   signal:controller.signal
 });
 try{
   let res=await requestPdf();
   if(res.status===401&&centralSession?.refresh_token){
     await ensureCentralSessionFresh(true);
     res=await requestPdf();
   }
   if(!res.ok){
     let detail={};try{detail=await res.json()}catch(_){}
     const message=detail?.detail||detail?.error||("Không thể tạo báo cáo ESTA (HTTP "+res.status+")");
     const error=new Error(message);error.status=res.status;throw error;
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
   return true;
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
   const signer=await requestPdfSignature();
   if(!signer){if(previewWindow&&!previewWindow.closed)previewWindow.close();return}
   toast("Đang tạo PDF theo chuẩn ESTA...");
   await exportEstaGeneratorPdf(a,signer);
 }catch(err){
   console.warn("Work ESTA PDF export failed",err);
   toast((err.message||"Không thể xuất PDF")+" · Hệ thống không dùng mẫu PDF cũ để tránh sai chuẩn ESTA.");
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
if($("#today"))$("#today").textContent=new Date().toLocaleDateString("vi-VN")

/* ===== MODULE NĂNG LƯỢNG ===== */
const energyStorageKey=()=>currentBuilding.id==="62THL"?"qlkt62_energy_v1":"qlkt_energy_"+currentBuilding.id;
let energyType="electric";
const ENERGY_META={
 electric:{name:"Chỉ số điện",form:"Ghi chỉ số điện",unit:"kWh",valueLabel:"Chỉ số điện (kWh)"},
 water:{name:"Chỉ số nước",form:"Ghi chỉ số nước",unit:"m³",valueLabel:"Chỉ số nước (m³)"},
 solar:{name:"Năng lượng mặt trời",form:"Ghi sản lượng điện mặt trời",unit:"kWh",valueLabel:"Sản lượng điện (kWh)"},
 xlnt:{name:"Chỉ số XLNT",form:"Ghi chỉ số XLNT",unit:"m³",valueLabel:"Chỉ số XLNT (m³)"}
};
const currentBuildingId=()=>String(currentBuilding?.id||"");
const is68Pdl=()=>currentBuildingId()==="68PĐL";
const supportsXlntEnergy=()=>is68Pdl()||currentBuildingId()==="DEMO";
const supportsSolarEnergy=()=>!["127HH","130HH"].includes(currentBuildingId());
const is68DualElectric=()=>is68Pdl()&&energyType==="electric";
function syncEnergyTabSelection(){
 document.querySelectorAll("[data-energy-type]").forEach(b=>{
  const selected=b.dataset.energyType===energyType;
  b.classList.toggle("active",selected);
  b.setAttribute("aria-selected",String(selected));
 });
}
function sync68EnergyTabs(){
 document.querySelectorAll(".energy68Only").forEach(el=>el.classList.toggle("hide",!supportsXlntEnergy()));
 document.querySelectorAll('[data-energy-type="solar"]').forEach(el=>el.classList.toggle("hide",!supportsSolarEnergy()));
 if((!supportsXlntEnergy()&&energyType==="xlnt")||(!supportsSolarEnergy()&&energyType==="solar"))energyType="electric";
 syncEnergyTabSelection();
}
function energyLoad(){try{const a=JSON.parse(localStorage.getItem(energyStorageKey())||"[]");return Array.isArray(a)?a:[]}catch(e){return[]}}
function energySaveAll(a){localStorage.setItem(energyStorageKey(),JSON.stringify(a))}
function showModule(name){
 closeWorkFilter();
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
 syncEnergyTabSelection();
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

function setEnergyNoteOpen(open,{focus=false}={}){
 const field=$("#energyForm .energyNoteField"),btn=$("#energyNoteToggle");
 if(!field||!btn)return;
 field.classList.toggle("energyNoteCollapsed",!open);
 btn.setAttribute("aria-expanded",String(!!open));
 btn.textContent=open?"− Ẩn ghi chú":"＋ Thêm ghi chú";
 if(open&&focus)setTimeout(()=>$("#energyNote")?.focus(),30);
}
$("#energyNoteToggle")?.addEventListener("click",()=>{
 const open=$("#energyNoteToggle")?.getAttribute("aria-expanded")!=="true";
 setEnergyNoteOpen(open,{focus:open});
});

function resetEnergyForm(){
 sync68EnergyTabs();
 const m=ENERGY_META[energyType];
 const dual=is68DualElectric();
 $("#energyEditId").value="";
 $("#energyDate").value=today();syncEnergyDateCompact();
 $("#energyValue").value="";
 $("#energyValue2").value="";
 $("#energyValue2").required=dual;
 $("#energyValue2Field").classList.toggle("hide",!dual);
 $("#energyImage2Field").classList.toggle("hide",!dual);
 $("#energyImage2Preview").classList.toggle("hide",!dual);
 setPeopleSelected("energy",[]);
 $("#energyNote").value="";
 setEnergyNoteOpen(false);
 $("#energyImage").value="";
 $("#energyImage2").value="";
 $("#energyImagePreview").innerHTML="";
 $("#energyImage2Preview").innerHTML="";
 $("#energySaveBtn").textContent="Lưu chỉ số";
 $("#energyCancelEdit").classList.add("hide");
 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=dual?"EVN1 (kWh)":m.valueLabel;
 $("#energyValue2Label").textContent="EVN2 (kWh)";
 $("#energyImageLabel").textContent=dual?"Ảnh đồng hồ EVN1":"Ảnh đồng hồ";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();
}
$("#energyCancelEdit").onclick=resetEnergyForm;
let energyPreviewObjectUrl="",energyPreviewObjectUrl2="";
function bindEnergyImagePreview(inputId,previewId,slot){
 const input=$("#"+inputId),preview=$("#"+previewId);
 if(!input||!preview)return;
 input.onchange=e=>{
  const file=e.target.files[0];
  if(slot===1&&energyPreviewObjectUrl2){URL.revokeObjectURL(energyPreviewObjectUrl2);energyPreviewObjectUrl2=""}
  if(slot===0&&energyPreviewObjectUrl){URL.revokeObjectURL(energyPreviewObjectUrl);energyPreviewObjectUrl=""}
  if(!file){preview.innerHTML="";return}
  if(!file.type.startsWith("image/")){toast("Chỉ hỗ trợ file hình ảnh");e.target.value="";return}
  const url=URL.createObjectURL(file);
  if(slot===1)energyPreviewObjectUrl2=url;else energyPreviewObjectUrl=url;
  preview.innerHTML='<img src="'+url+'" alt="Ảnh đồng hồ"><span>Ảnh đã chọn</span>';
 };
}
bindEnergyImagePreview("energyImage","energyImagePreview",0);
bindEnergyImagePreview("energyImage2","energyImage2Preview",1);

$("#energyForm").onsubmit=async e=>{
 e.preventDefault();
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 if(!energySelectedPeople.length){toast("Vui lòng chọn ít nhất 1 người thực hiện");$("#energyPeopleButton").focus();return}
 const dual=is68DualElectric();
 if(dual&&!$("#energyValue2").value){toast("Vui lòng nhập chỉ số EVN2");$("#energyValue2").focus();return}
 const btn=$("#energySaveBtn");btn.disabled=true;
 try{
  const editId=$("#energyEditId").value,id=editId||Date.now();
  const all=energyLoad(),old=editId?all.find(x=>String(x.id)===String(editId)):null;
  let image=old?.image||"",image2=old?.image2||"";
  const f=$("#energyImage").files[0],f2=$("#energyImage2").files[0];
  if(f){const blob=await imageFileToBlob(f);image=await uploadMediaBlob(blob,"energy",id,0)}
  if(dual&&f2){const blob=await imageFileToBlob(f2);image2=await uploadMediaBlob(blob,"energy",id,1)}
  const obj={
    id,
    type:energyType,
    date:$("#energyDate").value,
    value:Number($("#energyValue").value),
    value2:dual?Number($("#energyValue2").value):null,
    a:energySelectedPeople.join(", "),
    performers:[...energySelectedPeople],
    note:$("#energyNote").value.trim(),
    image,
    image2:dual?image2:"",
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
 const dual=is68DualElectric(),prevMap={};
 all.forEach((x,i)=>{
  if(!i){prevMap[String(x.id)]={diff:null,diff2:null,totalDiff:null};return}
  const d1=Number(x.value)-Number(all[i-1].value);
  const d2=dual?Number(x.value2)-Number(all[i-1].value2):null;
  prevMap[String(x.id)]={diff:d1,diff2:d2,totalDiff:dual&&Number.isFinite(d2)?d1+d2:d1};
 });
 return energyRangeFiltered().map(x=>({...x,...(prevMap[String(x.id)]||{diff:null,diff2:null,totalDiff:null})}));
}
function renderEnergy(){
 sync68EnergyTabs();
 const m=ENERGY_META[energyType]||ENERGY_META.electric;
 const dual=is68DualElectric();
 $("#energyPage")?.classList.toggle("dualEvnMode",dual);
 $("#energyPage")?.classList.toggle("xlntMode",energyType==="xlnt");

 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=dual?"EVN1 (kWh)":m.valueLabel;
 $("#energyValue2Field").classList.toggle("hide",!dual);
 $("#energyImage2Field").classList.toggle("hide",!dual);
 $("#energyImage2Preview").classList.toggle("hide",!dual);
 $("#energyValue2").required=dual;
 $("#energyImageLabel").textContent=dual?"Ảnh đồng hồ EVN1":"Ảnh đồng hồ";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();

 const head=$("#energyHeadRow"),cols=$("#energyColgroup");
 if(dual){
  if(cols)cols.innerHTML='<col style="width:8%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col style="width:13%"><col style="width:15%"><col style="width:8%"><col style="width:6%">';
  if(head)head.innerHTML='<th>Ngày</th><th>EVN1</th><th>Tiêu thụ EVN1</th><th>EVN2</th><th>Tiêu thụ EVN2</th><th>Tổng tiêu thụ</th><th>Người thực hiện</th><th>Ghi chú</th><th>Ảnh</th><th>Thao tác</th>';
 }else{
  if(cols)cols.innerHTML='<col style="width:11%"><col style="width:18%"><col style="width:12%"><col style="width:14%"><col style="width:27%"><col style="width:9%"><col style="width:9%">';
  if(head)head.innerHTML='<th>Ngày</th><th id="energyValueColumn">Chỉ số ('+esc(m.unit)+')</th><th>Chênh lệch</th><th>Người thực hiện</th><th>Ghi chú</th><th>Ảnh</th><th>Thao tác</th>';
 }

 const allType=energyLoad().filter(x=>x.type===energyType).sort((a,b)=>a.date.localeCompare(b.date)||Number(a.id)-Number(b.id));
 const periodRows=energyRows();
 const q=($("#energyQuickSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
 const rows=q?periodRows.filter(x=>{
   const hay=[x.date,fmt(x.date),weekday(x.date),performerArray(x).join(" "),x.note||"",String(x.value??""),String(x.value2??"")].join(" ").toLocaleLowerCase("vi-VN");
   return hay.includes(q);
 }):periodRows;

 const currentMonth=today().slice(0,7);
 const monthCount=allType.filter(x=>String(x.date||"").slice(0,7)===currentMonth).length;
 const latest=allType.length?allType[allType.length-1]:null;
 const positiveSum=(key)=>periodRows.filter(x=>typeof x[key]==="number"&&Number.isFinite(x[key])&&x[key]>=0).reduce((s,x)=>s+x[key],0);
 const hasUse=periodRows.some(x=>typeof x.diff==="number"&&Number.isFinite(x.diff)&&x.diff>=0);
 const totalUse1=hasUse?positiveSum("diff"):null;
 const totalUse2=dual&&periodRows.some(x=>typeof x.diff2==="number"&&Number.isFinite(x.diff2)&&x.diff2>=0)?positiveSum("diff2"):null;
 const totalUse=dual?(totalUse1!==null||totalUse2!==null?Number(totalUse1||0)+Number(totalUse2||0):null):totalUse1;
 const totalLabel=energyType==="electric"?"Tổng điện":energyType==="water"?"Tổng nước":energyType==="xlnt"?"Tổng XLNT":"Tổng điện mặt trời";

 $("#energyRecordCount").textContent=monthCount;
 if(dual){
  $("#energyLatestValue").textContent=latest?"EVN1 "+energyFmt(latest.value)+" · EVN2 "+energyFmt(latest.value2):"—";
  $("#energyPeriodUse").textContent=totalUse!==null?"EVN1 "+energyFmt(totalUse1||0)+" · EVN2 "+energyFmt(totalUse2||0)+" · Tổng "+energyFmt(totalUse):"—";
 }else{
  $("#energyLatestValue").textContent=latest?energyFmt(latest.value)+" "+m.unit:"—";
  $("#energyPeriodUse").textContent=totalUse!==null?energyFmt(totalUse)+" "+m.unit:"—";
 }
 const latestHint=$("#energyLatestHint");
 if(latestHint){
  latestHint.textContent=latest
   ?(dual
      ?"Chỉ số gần nhất: EVN1 "+energyFmt(latest.value)+" · EVN2 "+energyFmt(latest.value2)
      :"Chỉ số gần nhất: "+energyFmt(latest.value)+" "+m.unit)
   :"Chỉ số gần nhất: —";
 }

 const totalBox=$("#energyTotalInline");
 if(totalBox){
   totalBox.querySelector("span").textContent=totalLabel;
   totalBox.querySelector("strong").textContent=totalUse!==null?energyFmt(totalUse)+" "+m.unit:"—";
 }
 $("#energyEmpty").classList.toggle("hide",rows.length>0);

 $("#energyTbody").innerHTML=rows.map(x=>{
   const sun=new Date(x.date+"T00:00:00").getDay()===0;
   if(dual){
    const d1=x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff);
    const d2=x.diff2===null?"—":(x.diff2>=0?"+":"")+energyFmt(x.diff2);
    const dt=x.totalDiff===null?"—":(x.totalDiff>=0?"+":"")+energyFmt(x.totalDiff);
    const imgs=(x.image||x.image2)?'<div class="energyDualThumbs">'+(x.image?'<span onclick="viewEnergyImage(\''+x.id+'\')"><small>EVN1</small>'+mediaImgHtml(x.image,"energyThumb")+'</span>':'')+(x.image2?'<span onclick="viewEnergyImage(\''+x.id+'\')"><small>EVN2</small>'+mediaImgHtml(x.image2,"energyThumb")+'</span>':'')+'</div>':"—";
    return '<tr class="'+(sun?"sunday":"")+'"><td class="dateCell">'+fmt(x.date)+'</td><td class="meterValue"><b>'+energyFmt(x.value)+'</b></td><td class="meterDiff">'+d1+'</td><td class="meterValue"><b>'+energyFmt(x.value2)+'</b></td><td class="meterDiff">'+d2+'</td><td class="meterDiff total">'+dt+'</td><td>'+performerChipsHtml(x)+'</td><td class="noteCell">'+esc(x.note||"—")+'</td><td>'+imgs+'</td><td class="actionCell"><details class="rowActionMenu"><summary title="Thao tác">•••</summary><div><button type="button" onclick="editEnergy(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Sửa bản ghi</button>'+((x.image||x.image2)?'<button type="button" onclick="viewEnergyImage(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Xem hình ảnh</button>':'')+'<button class="danger" type="button" onclick="deleteEnergy(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Xóa</button></div></details></td></tr>';
   }
   const diff=x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff);
   const img=x.image?'<span class="energyThumbWrap" onclick="viewEnergyImage(\''+x.id+'\')">'+mediaImgHtml(x.image,"energyThumb")+'</span>':"—";
   return '<tr class="'+(sun?"sunday":"")+'"><td class="dateCell">'+fmt(x.date)+'</td><td class="meterValue"><b>'+energyFmt(x.value)+'</b></td><td class="meterDiff">'+diff+'</td><td>'+performerChipsHtml(x)+'</td><td class="noteCell">'+esc(x.note||"—")+'</td><td>'+img+'</td><td class="actionCell"><details class="rowActionMenu"><summary title="Thao tác">•••</summary><div><button type="button" onclick="editEnergy(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Sửa bản ghi</button>'+(x.image?'<button type="button" onclick="viewEnergyImage(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Xem hình ảnh</button>':'')+'<button class="danger" type="button" onclick="deleteEnergy(\''+x.id+'\');this.closest(\'details\').removeAttribute(\'open\')">Xóa</button></div></details></td></tr>';
 }).join("");

 $("#energyMobileCards").innerHTML=rows.map(x=>{
  const sunday=new Date(x.date+"T00:00:00").getDay()===0;
  if(dual){
   return '<article class="mcard proEnergyCard '+(sunday?"sunday":"")+'"><div class="mobileCardTop"><div><small>'+weekday(x.date)+' · '+fmt(x.date)+'</small><h4>EVN1 '+energyFmt(x.value)+' · EVN2 '+energyFmt(x.value2)+'</h4></div><span class="mobileDiff">Tổng '+(x.totalDiff===null?"—":(x.totalDiff>=0?"+":"")+energyFmt(x.totalDiff))+'</span></div><div class="energyDualMobileDiff"><span>EVN1 '+(x.diff===null?"—":energyFmt(x.diff))+'</span><span>EVN2 '+(x.diff2===null?"—":energyFmt(x.diff2))+'</span></div><div class="mobileMeta">'+performerChipsHtml(x,2)+'</div><p>'+esc(x.note||"Không có ghi chú")+'</p><div class="mobileCardFoot"><span>'+((x.image||x.image2)?"Có hình đồng hồ":"Không có hình")+'</span><button onclick="editEnergy(\''+x.id+'\')">Chỉnh sửa →</button></div></article>';
  }
  return '<article class="mcard proEnergyCard '+(sunday?"sunday":"")+'"><div class="mobileCardTop"><div><small>'+weekday(x.date)+' · '+fmt(x.date)+'</small><h4>'+energyFmt(x.value)+' '+m.unit+'</h4></div><span class="mobileDiff">'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</span></div><div class="mobileMeta">'+performerChipsHtml(x,2)+'</div><p>'+esc(x.note||"Không có ghi chú")+'</p><div class="mobileCardFoot"><span>'+(x.image?"Có hình đồng hồ":"Không có hình")+'</span><button onclick="editEnergy(\''+x.id+'\')">Chỉnh sửa →</button></div></article>';
 }).join("");

 if(q)$("#energySummaryText").textContent=rows.length?"Tìm thấy "+rows.length+" bản ghi phù hợp.":"Không tìm thấy bản ghi phù hợp.";
 else $("#energySummaryText").textContent=periodRows.length?"Lịch sử "+periodRows.length+" bản ghi theo ngày.":"Lịch sử chỉ số theo ngày.";
 hydrateMediaImages($("#energyTbody"));
}
window.editEnergy=id=>{
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 const x=energyLoad().find(v=>String(v.id)===String(id));if(!x)return;
 energyType=x.type;
 sync68EnergyTabs();
 document.querySelectorAll("[data-energy-type]").forEach(b=>{
  const selected=b.dataset.energyType===energyType;
  b.classList.toggle("active",selected);
  b.setAttribute("aria-selected",String(selected));
 });
 const dual=is68DualElectric();
 $("#energyEditId").value=x.id;
 $("#energyDate").value=x.date;syncEnergyDateCompact();
 $("#energyValue").value=x.value;
 $("#energyValue2").value=dual?(x.value2??""):"";
 $("#energyValue2").required=dual;
 $("#energyValue2Field").classList.toggle("hide",!dual);
 $("#energyImage2Field").classList.toggle("hide",!dual);
 $("#energyImage2Preview").classList.toggle("hide",!dual);
 setPeopleSelected("energy",performerArray(x));
 $("#energyNote").value=x.note||"";
 setEnergyNoteOpen(!!String(x.note||"").trim());
 $("#energyImagePreview").innerHTML=x.image?mediaImgHtml(x.image,"")+'<span>Ảnh hiện tại EVN1</span>':"";
 $("#energyImage2Preview").innerHTML=dual&&x.image2?mediaImgHtml(x.image2,"")+'<span>Ảnh hiện tại EVN2</span>':"";
 hydrateMediaImages($("#energyImagePreview"));
 hydrateMediaImages($("#energyImage2Preview"));
 $("#energySaveBtn").textContent="Cập nhật chỉ số";
 $("#energyCancelEdit").classList.remove("hide");
 renderEnergy();
 window.scrollTo({top:0,behavior:"smooth"});
};
window.deleteEnergy=async id=>{
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 if(!confirm("Xóa bản ghi chỉ số này?"))return;
 energySaveAll(energyLoad().filter(x=>String(x.id)!==String(id)));
 await syncEnergyRecord("delete_energy",id);
 renderEnergy();renderHomeDashboard();toast("Đã xóa bản ghi");
};
window.viewEnergyImage=async id=>{
 const x=energyLoad().find(v=>String(v.id)===String(id));if(!x)return;
 const refs=[x.image,x.image2].filter(Boolean);if(!refs.length)return;
 viewerMediaRefs=refs;
 $("#viewerImages").innerHTML=refs.map((ref,i)=>'<div class="viewerMedia">'+mediaImgHtml(ref,"viewerLargeImage")+'<button class="viewerDownloadBtn" type="button" onclick="downloadViewerMedia('+i+')">⇩ Tải hình '+(refs.length>1?(i===0?"EVN1":"EVN2"):"")+'</button></div>').join("");
 $("#viewer").classList.remove("hide");
 await hydrateMediaImages($("#viewerImages"));
};
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
function energyReportPeriod(kind="current",rows=[]){
 const m=ENERGY_META[energyType],now=new Date(),y=now.getFullYear(),mon=now.getMonth(),day=now.getDate(),mm=String(mon+1).padStart(2,"0"),dd=String(day).padStart(2,"0");
 const first=new Date(y,mon,1),firstOffset=(first.getDay()+6)%7,weekNo=Math.floor((day+firstOffset-1)/7)+1;
 let from="",to="",label="",suffix="";
 if(kind==="today"){
  const r=rangeDates("today");from=r.from;to=r.to;label="NGÀY "+dd+"/"+mm+"/"+y;suffix="Ngay"+dd+"_"+mm+"_"+y;
 }else if(kind==="week"){
  const r=rangeDates("week");from=r.from;to=r.to;label="TUẦN "+weekNo+" THÁNG "+mm+"/"+y;suffix="Tuan"+weekNo+"_Thang"+mm+"_"+y;
 }else if(kind==="month"){
  const r=rangeDates("month");from=r.from;to=r.to;label="THÁNG "+mm+"/"+y;suffix="Thang"+mm+"_"+y;
 }else{
  from=$("#energyFromDate").value||"";to=$("#energyToDate").value||"";
  if((!from||!to)&&rows.length){
   const dates=rows.map(x=>x.date).filter(Boolean).sort();
   if(!from)from=dates[0]||"";
   if(!to)to=dates[dates.length-1]||"";
  }
  const pf=from?fmt(from):"Đầu kỳ",pt=to?fmt(to):"Hiện tại";
  label=from===to&&from?"NGÀY "+pf:"TỪ "+pf+" ĐẾN "+pt;
  suffix=from&&to?"Tu"+from.replaceAll("-","")+"_Den"+to.replaceAll("-",""):"TheoBoLoc";
 }
 return {kind,from,to,label,suffix,name:m.name,unit:m.unit};
}
function energyRowsForReport(kind="current"){
 if(kind==="current")return energyRows();
 const r=rangeDates(kind);
 return energyRowsForTypeRange(energyType,r.from,r.to);
}
function energyReportFilename(period){
 const typeName=energyType==="electric"?"Dien":energyType==="water"?"Nuoc":energyType==="xlnt"?"XLNT":"Solar";
 return "BaoCao_NangLuong_"+typeName+"_"+period.suffix+".pdf";
}
let energyReportBusy=false;
async function exportEnergyEstaPdf(rows,kind="current"){
 if(!rows.length)return toast("Không có dữ liệu để xuất PDF");
 if(energyReportBusy)return toast("Báo cáo năng lượng đang được tạo");
 if(!centralSession?.access_token)return toast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
 const signer=await requestPdfSignature();
 if(!signer)return;
 energyReportBusy=true;
 const period=energyReportPeriod(kind,rows),m=ENERGY_META[energyType];
 try{
  toast("Đang tạo PDF Năng lượng theo mẫu ESTA chuẩn...");
  await ensureCentralSessionFresh();
  const dual=is68DualElectric();
  const payload={
   report_type:"energy",
   building:String(currentBuilding?.name||"[CẦN BỔ SUNG]"),
   report_date:new Date().toLocaleDateString("vi-VN"),
   energy_name:m.name,
   unit:m.unit,
   period_label:period.label,
   dual_meter:dual,
   meter1_label:dual?"EVN1":"",
   meter2_label:dual?"EVN2":"",
   ...pdfSignaturePayload(signer),
   rows:rows.map(x=>({
    date:String(x.date||""),
    date_display:x.date?fmt(x.date):"",
    value:Number(x.value),
    value2:dual?Number(x.value2):null,
    diff:(typeof x.diff==="number"&&Number.isFinite(x.diff))?Number(x.diff):null,
    diff2:dual&&typeof x.diff2==="number"&&Number.isFinite(x.diff2)?Number(x.diff2):null,
    total_diff:dual&&typeof x.totalDiff==="number"&&Number.isFinite(x.totalDiff)?Number(x.totalDiff):null,
    performer:performerArray(x).join(", "),
    note:String(x.note||""),
    image:String(x.image||""),
    image2:dual?String(x.image2||""):""
   }))
  };
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),115000);
  try{
   const res=await fetch("/api/esta_report",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+centralSession.access_token},
    body:JSON.stringify(payload),
    signal:controller.signal
   });
   if(!res.ok){
    let detail={};try{detail=await res.json()}catch(_){}
    throw new Error(detail?.detail||detail?.error||"Không thể tạo báo cáo Năng lượng");
   }
   const blob=await res.blob();
   if(!blob.size)throw new Error("File PDF trả về bị trống");
   const missing=Number(res.headers.get("X-ESTA-Missing-Images")||0);
   const url=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=url;a.download=energyReportFilename(period);
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
   toast(missing?"Đã xuất PDF ESTA · "+missing+" hình không tải được":"Đã xuất PDF Năng lượng ESTA chuẩn");
  }finally{clearTimeout(timer)}
 }catch(err){
  if(err?.name==="AbortError")toast("Tạo PDF quá thời gian. Vui lòng thử lại.");
  else toast(err.message||"Không thể xuất PDF Năng lượng");
 }finally{energyReportBusy=false}
}
$("#energyExportPdf").onclick=()=>{
 const rows=energyRows();
 if(!rows.length)return toast("Không có dữ liệu để xuất PDF");
 const title=$("#energyExportModalTitle");if(title)title.textContent="Báo cáo "+ENERGY_META[energyType].name.toLowerCase();
 $("#energyExportModal")?.classList.remove("hide");
};
$("#closeEnergyExport").onclick=()=>$("#energyExportModal").classList.add("hide");
$("#energyExportModal").onclick=e=>{if(e.target===$("#energyExportModal"))$("#energyExportModal").classList.add("hide")};
document.querySelectorAll("[data-energy-report-range]").forEach(b=>b.onclick=()=>{
 const kind=b.dataset.energyReportRange||"current";
 const rows=energyRowsForReport(kind);
 $("#energyExportModal").classList.add("hide");
 exportEnergyEstaPdf(rows,kind);
});

function energyRowsForTypeRange(type,from,to){
 const all=energyLoad().filter(x=>x.type===type).sort((a,b)=>a.date.localeCompare(b.date)||Number(a.id)-Number(b.id));
 const dual=is68Pdl()&&type==="electric";
 return all.filter(x=>(!from||x.date>=from)&&(!to||x.date<=to)).map(x=>{
   const idx=all.findIndex(v=>String(v.id)===String(x.id));
   const diff=idx>0?Number(x.value)-Number(all[idx-1].value):null;
   const diff2=dual&&idx>0?Number(x.value2)-Number(all[idx-1].value2):null;
   return {...x,diff,diff2,totalDiff:dual&&diff!==null&&diff2!==null?diff+diff2:diff};
 });
}

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
     '<div class="stockAlertActions"><button type="button" onclick="openLowStockReplenish(\''+m.id+'\')">＋ Nhập kho</button><button type="button" class="ghost" onclick="editMaterial(\''+m.id+'\')">Sửa định mức</button>'+(out&&currentAccount?.is_admin?'<button type="button" class="danger adminZeroDelete" onclick="deleteMaterial(\''+m.id+'\')">Xóa vật tư</button>':'')+'</div>'+
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
 $("#materialMonthLabel").textContent=periodText;
 $("#materialSelectedMonth").textContent=periodText;
 $("#materialTitleCount").textContent="("+list.length+" mục)";
 $("#materialInLabel").textContent=allYear?"TỔNG NHẬP NĂM":"TỔNG NHẬP THÁNG";
 $("#materialOutLabel").textContent=allYear?"TỔNG XUẤT NĂM":"TỔNG XUẤT THÁNG";
 $("#materialStockLabel").textContent=allYear?"MẶT HÀNG TỒN CUỐI NĂM":"MẶT HÀNG CÒN TỒN";

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
 $("#materialTxnEmpty").classList.toggle("hide",tx.length>0);

 const sel=$("#stockTxnMaterial"),old=sel.value;
 const selectable=inventoryActiveMaterials().filter(m=>inventoryTrackingStart(m)<=periodEnd);
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
window.openStockTxnModal=id=>{
 if(!inventoryActiveMaterials().length)return toast("Hãy thêm vật tư trước");
 const y=inventoryYearValue(),m=Math.max(1,Math.min(12,Number(inventoryActiveMonth)||1));
 const now=new Date(),same=y===now.getFullYear()&&m===now.getMonth()+1;
 const day=same?now.getDate():1;
 const maxDay=new Date(y,m,0).getDate();
 const date=y+"-"+String(m).padStart(2,"0")+"-"+String(Math.min(day,maxDay)).padStart(2,"0");
 $("#stockTxnId").value="";$("#stockTxnDate").value=date;$("#stockTxnType").value="in";$("#stockTxnQty").value="";$("#stockTxnPerformer").value="";$("#stockTxnNote").value="";
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
   const res=await fetch("/api/esta_report",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+centralSession.access_token},
    body:JSON.stringify(payload),
    signal:controller.signal
   });
   if(!res.ok){
    let detail={};try{detail=await res.json()}catch(_){}
    throw new Error(detail?.detail||detail?.error||"Không thể tạo báo cáo Dụng cụ kỹ thuật");
   }
   const blob=await res.blob();
   if(!blob.size)throw new Error("File PDF trả về bị trống");
   const url=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=url;a.download="BaoCao_DungCuKyThuat_"+today().replaceAll("-","")+".pdf";
   document.body.appendChild(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
   toast("Đã xuất PDF Dụng cụ kỹ thuật ESTA chuẩn");
  }finally{clearTimeout(timer)}
 }catch(err){
  if(err?.name==="AbortError")toast("Tạo PDF quá thời gian. Vui lòng thử lại.");
  else toast(err.message||"Không thể xuất PDF Dụng cụ kỹ thuật");
 }finally{toolReportBusy=false}
}
$("#toolExportPdf").onclick=exportToolsEstaPdf;
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
async function exportMaintenanceEstaPdf(kind="week"){
 const period=maintenanceReportPeriod(kind);
 const inRange=(date)=>date&&String(date)>=period.from&&String(date)<=period.to;
 const byId=Object.fromEntries(maintenanceAssets.map(a=>[String(a.id),a]));
 const records=maintenanceRecords.filter(r=>inRange(r.service_date)).sort((a,b)=>String(a.service_date||"").localeCompare(String(b.service_date||"")));
 const dueAssets=maintenanceAssets.filter(a=>inRange(a.next_due_date)).sort((a,b)=>String(a.next_due_date||"").localeCompare(String(b.next_due_date||"")));
 if(!records.length&&!dueAssets.length)return toast("Không có dữ liệu bảo trì trong kỳ");
 const rows=[];
 records.forEach((r,i)=>{
   const a=byId[String(r.asset_id)]||{};
   rows.push([rows.length+1,"Đã bảo trì",a.name||"Thiết bị đã xóa",fmt(r.service_date),r.result_status||"—",r.performer||"—",r.work_done||r.note||"—"]);
 });
 dueAssets.forEach(a=>{
   rows.push([rows.length+1,"Đến hạn",a.name||"—",fmt(a.next_due_date),a.frequency_days+" ngày",a.assigned_to||"—",(a.system_type||"—")+" · "+(a.location||"—")]);
 });
 const done=records.filter(r=>r.result_status==="Hoàn thành").length;
 const attention=records.filter(r=>r.result_status!=="Hoàn thành").length;
 return exportGenericEstaPdf({
   title:"BÁO CÁO BẢO TRÌ THIẾT BỊ",sectionLabel:"BẢO TRÌ THIẾT BỊ KỸ THUẬT",
   tableLabel:"NHẬT KÝ & KẾ HOẠCH BẢO TRÌ",periodLabel:period.label,
   subtitle:fmt(period.from)+" - "+fmt(period.to),filename:maintenanceReportFilename(period),
   columns:[
     {label:"STT",weight:.6},{label:"Nhóm",weight:1.1},{label:"Thiết bị",weight:2.4},
     {label:"Ngày",weight:1.1},{label:"Kết quả / Chu kỳ",weight:1.4},{label:"Phụ trách",weight:1.4},{label:"Nội dung / Ghi chú",weight:2.8}
   ],rows,
   summaries:[
     {value:records.length,label:"LƯỢT BẢO TRÌ"},
     {value:done,label:"HOÀN THÀNH"},
     {value:attention,label:"CẦN THEO DÕI"},
     {value:dueAssets.length,label:"ĐẾN HẠN TRONG KỲ"}
   ]
 });
}
window.exportMaintenanceEstaPdf=exportMaintenanceEstaPdf;
document.querySelectorAll("[data-maint-report-range]").forEach(b=>b.onclick=()=>{
 const kind=b.dataset.maintReportRange==="month"?"month":"week";
 $("#maintenanceExportModal").classList.add("hide");
 exportMaintenanceEstaPdf(kind);
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
 if(a)$("#maintenanceRecordNextDate").value=maintenanceNextFromSchedule(a);
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
 const serviceDate=$("#maintenanceRecordDate").value,next=maintenanceNextFromSchedule(a);
 $("#maintenanceRecordNextDate").value=next;
 const body={building_id:currentBuilding.id,asset_id:assetId,service_date:serviceDate,maintenance_type:$("#maintenanceRecordType").value,performer:$("#maintenanceRecordPerformer").value,result_status:$("#maintenanceRecordResult").value,work_done:$("#maintenanceWorkDone").value.trim(),note:$("#maintenanceRecordNote").value.trim(),next_due_date:next,cost:Math.max(0,inventoryNum($("#maintenanceCost").value))};
 try{
   await sbFetch("/rest/v1/maintenance_records",{method:"POST",token:centralSession.access_token,body});
   await sbFetch("/rest/v1/maintenance_assets?id=eq."+encodeURIComponent(assetId)+"&building_id=eq."+encodeURIComponent(currentBuilding.id),{method:"PATCH",token:centralSession.access_token,body:{last_service_date:serviceDate,next_due_date:next,updated_at:new Date().toISOString()}});
   $("#maintenanceRecordModal").classList.add("hide");await loadMaintenanceData(currentBuilding.id,true);toast("Đã lưu bảo trì; lịch kế tiếp tiếp tục đúng chu kỳ đã đặt");
 }catch(err){toast(err.message)}
};

/* ===== ADMIN TRUNG TÂM / ĐA DỰ ÁN ===== */
function renderTechnicalProjectSwitcher(){
 const list=currentAccount?.buildings||[],select=$("#technicalProjectSelect");
 $("#technicalProjectSwitcher").classList.toggle("hide",!!currentAccount?.is_admin||list.length<2);
 select.innerHTML=list.map(b=>'<option value="'+esc(b.id)+'">'+esc(b.name||b.id)+'</option>').join("");
 select.value=list.some(b=>b.id===currentBuilding?.id)?currentBuilding.id:(list[0]?.id||"");
}
$("#technicalProjectSelect").onchange=async e=>{
 const select=e.target,building=currentAccount?.buildings?.find(b=>b.id===select.value);
 if(!building||building.id===currentBuilding?.id)return;
 select.disabled=true;
 try{await enterProject(building,{target:"work"})}catch(err){toast(err.message)}
 finally{select.value=currentBuilding?.id||"";select.disabled=false}
};
let adminUsersCache=[],adminEditingUserId=null,adminAccessSaving=false;
function adminSelectedProjects(pickerId){
 const picker=$("#"+pickerId);
 return Array.from(picker.querySelectorAll('.adminProjectChoice input[type="checkbox"]:checked')).map(input=>({
   building_id:input.value,
   role:input.closest(".adminProjectChoice").querySelector("select")?.value||$("#adminRole").value
 }));
}
function renderAdminProjectPicker(pickerId,memberships=[],withRoles=false){
 const picker=$("#"+pickerId),list=currentAccount?.buildings||[],selected=new Map(memberships.map(b=>[b.building_id||b.id,b.role||"editor"]));
 picker.innerHTML='<div class="adminProjectPickerHead"><span class="adminProjectSelectionCount" aria-live="polite"></span><button type="button" data-project-pick="all">Chọn tất cả</button><button type="button" data-project-pick="none">Bỏ chọn</button></div><div class="adminProjectChoices">'+
   (list.length?list.map((b,i)=>{
     const id=pickerId+"-"+i,checked=selected.has(b.id),role=selected.get(b.id)||"editor";
     return '<div class="adminProjectChoice"><label for="'+id+'"><input id="'+id+'" type="checkbox" value="'+esc(b.id)+'"'+(checked?' checked':'')+'><span>'+esc(b.name||b.id)+'</span></label>'+
       (withRoles?'<select aria-label="Quyền tại '+esc(b.name||b.id)+'"'+(checked?'':' disabled')+'><option value="editor"'+(role==="editor"?' selected':'')+'>Được nhập / chỉnh sửa</option><option value="viewer"'+(role==="viewer"?' selected':'')+'>Chỉ xem</option></select>':'')+'</div>';
   }).join(""):'<p class="adminAccessHint">Chưa có dự án đang hoạt động.</p>')+'</div>';
 const update=()=>{
   picker.querySelectorAll(".adminProjectChoice").forEach(row=>{const input=row.querySelector("input"),select=row.querySelector("select");row.classList.toggle("selected",input.checked);if(select)select.disabled=!input.checked});
   picker.querySelector(".adminProjectSelectionCount").textContent="Đã chọn "+adminSelectedProjects(pickerId).length+" / "+list.length+" dự án";
 };
 picker.onchange=update;
 picker.querySelectorAll("[data-project-pick]").forEach(button=>button.onclick=()=>{picker.querySelectorAll('input[type="checkbox"]').forEach(input=>input.checked=button.dataset.projectPick==="all");update()});
 update();
}
window.adminEditUserProjects=id=>{
 if(!currentAccount?.is_admin||!centralSession?.access_token||adminAccessSaving)return;
 const user=adminUsersCache.find(u=>u.id===id);if(!user||user.is_admin)return;
 adminEditingUserId=id;
 $("#adminProjectAccessName").textContent=(user.display_name||user.username||"Tài khoản")+(user.username?" · "+user.username:"");
 $("#adminProjectAccessError").textContent="";
 renderAdminProjectPicker("adminEditProjectPicker",user.buildings||[],true);
 const editor=$("#adminProjectAccessEditor");editor.classList.remove("hide");editor.scrollIntoView({block:"nearest",behavior:"smooth"});
 editor.querySelector('input[type="checkbox"]')?.focus({preventScroll:true});
};
function closeAdminProjectAccess(){
 if(adminAccessSaving)return;
 adminEditingUserId=null;$("#adminProjectAccessEditor").classList.add("hide");$("#adminProjectAccessError").textContent="";
}
$("#adminCancelProjectAccess").onclick=closeAdminProjectAccess;
$("#adminProjectAccessForm").onsubmit=async e=>{
 e.preventDefault();if(adminAccessSaving||!adminEditingUserId||!currentAccount?.is_admin)return;
 const memberships=adminSelectedProjects("adminEditProjectPicker"),error=$("#adminProjectAccessError"),btn=$("#adminSaveProjectAccess");
 error.textContent="";
 if(!memberships.length){error.textContent="Hãy chọn ít nhất một dự án.";return}
 adminAccessSaving=true;btn.disabled=true;btn.textContent="Đang lưu...";$("#adminProjectAccessFields").disabled=true;$("#adminCancelProjectAccess").disabled=true;
 try{
   await adminApi("set_buildings",{user_id:adminEditingUserId,memberships});
   adminAccessSaving=false;closeAdminProjectAccess();await renderAdminUsers();toast("Đã lưu "+memberships.length+" dự án cho tài khoản");
 }catch(err){error.textContent=err.message}
 finally{adminAccessSaving=false;btn.disabled=false;btn.textContent="Lưu dự án";$("#adminProjectAccessFields").disabled=false;$("#adminCancelProjectAccess").disabled=false}
};
async function adminApi(action,payload={}){
 if(!centralSession?.access_token)throw new Error("Chưa kích hoạt hoặc đăng nhập Admin trung tâm");
 return sbFetch("/functions/v1/admin-users",{method:"POST",token:centralSession.access_token,body:{action,...payload}});
}
function adminProjectCard(b,index=0){
 const safeId=esc(b.id),safeName=esc(b.name||b.id),tone="tone"+(index%4);
 const monogram=esc((b.id||"ES").slice(0,2));
 return '<div class="adminProjectCard '+tone+'"><button class="adminProjectOpen" type="button" onclick="adminOpenBuilding(\''+safeId+'\',event)"><div class="adminProjectIcon adminProjectMonogram">'+monogram+'</div><div class="adminProjectCopy"><small>'+safeId+'</small><h3>'+safeName+'</h3><p>ESTA Property Management</p></div><span class="adminProjectArrow" aria-hidden="true">→</span></button></div>';
}
function renderAdminProjects(){
 const list=currentAccount?.buildings||[];
 $("#adminProjectCount").textContent=list.length+" dự án";
 $("#adminProjectGrid").innerHTML=list.length?list.map(adminProjectCard).join(""):'<div class="empty">Chưa có dự án.</div>';
 renderAdminProjectPicker("adminCreateProjectPicker",adminSelectedProjects("adminCreateProjectPicker"));
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
   const data=await adminApi("list"),users=data.users||[];adminUsersCache=users;
   box.innerHTML=users.length?users.map(u=>{
     const projects=u.is_admin?'<span>Tất cả dự án</span>':(u.buildings||[]).map(b=>'<span>'+esc(b.name||b.id)+(b.role==="viewer"?' · Chỉ xem':'')+'</span>').join("")||'<span>Chưa phân dự án</span>';
     const name=esc(u.display_name||u.username||u.email||"Tài khoản");
     return '<div class="adminUserRow"><div class="adminUserMain"><div class="adminAvatar">'+name.slice(0,1).toLocaleUpperCase("vi-VN")+'</div><div><b>'+name+'</b><small>'+(u.username?esc(u.username):esc(u.email||""))+'</small><div class="adminUserProjects">'+projects+'</div></div></div><div class="adminUserActions">'+(u.is_admin?'<span class="adminBadge">ADMIN</span>':'<button type="button" onclick="adminEditUserProjects(\''+u.id+'\')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 20V8h12v12M9 8V5h6v3M9 12h2M13 12h2M9 16h6"/></svg><span>Chọn dự án</span></button><button type="button" onclick="adminResetPassword(\''+u.id+'\')"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15 12v2"/></svg><span>Đổi mật khẩu</span></button><button type="button" class="'+(u.active?"danger":"success")+'" onclick="adminToggleUser(\''+u.id+'\','+(!u.active)+')">'+(u.active?'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>Khóa</span>':'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M9 10V7a4 4 0 0 1 7-2.5"/></svg><span>Mở khóa</span>')+'</button><button type="button" class="danger" onclick="adminDeleteUser(\''+u.id+'\',\''+name.replace(/'/g,"&#39;")+'\')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M8 10v8M12 10v8M16 10v8M7 7l1 14h8l1-14"/></svg><span>Xóa</span></button>')+'</div></div>';
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
     building_ids:adminSelectedProjects("adminCreateProjectPicker").map(b=>b.building_id),
     role:$("#adminRole").value
   };
   if(!payload.building_ids.length)throw new Error("Hãy chọn ít nhất một dự án.");
   await adminApi("create",payload);
   $("#adminCreateAccountForm").reset();
   renderAdminProjectPicker("adminCreateProjectPicker");renderAdminProjects();
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
 renderTechnicalProjectSwitcher();
 setProjectEditability();
 const role=currentAccount?.is_admin?"Quản trị viên":(currentBuilding.role==="viewer"?"Chỉ xem":"Kỹ thuật viên");
 $("#headerRole").textContent=role+" · "+currentBuilding.id;
};

(async function initMultiProjectSession(){
 const restored=await restoreCentral();
 if(restored)window.enterAccount(restored.account,restored.session);
})();

