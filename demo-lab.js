(()=>{
"use strict";
const DEMO_ID="DEMO";
const DEMO_MODULES=["incident","inspection","documents","reports"];
let demoCache={loaded:false,buildingId:"",incidents:[],inspections:[],documents:[],reports:[],assets:[],contractors:[],materials:[],materialTx:[]};
let demoSelectedIncident="",demoSelectedInspection="",demoSelectedDocument="";
const demoIs=()=>!!currentBuilding?.id&&!$("#navWork")?.classList.contains("hide");
const originalAdminProjectCard=adminProjectCard;
adminProjectCard=function(b,index=0){
 const html=originalAdminProjectCard(b,index);
 return b?.id===DEMO_ID?html.replace("</h3>"," <span class=\"demoProjectBadge\">MẪU THỬ</span></h3>"):html;
};
const demoTok=()=>centralSession?.access_token||"";
const demoQs=v=>encodeURIComponent(v??"");
async function demoRest(table,query=""){
 if(!demoTok())return [];
 return await sbFetch("/rest/v1/"+table+(query?"?"+query:""),{token:demoTok()});
}
async function demoPost(table,body){
 return await sbFetch("/rest/v1/"+table,{method:"POST",body,token:demoTok()});
}
async function demoPatch(table,query,body){
 return await sbFetch("/rest/v1/"+table+"?"+query,{method:"PATCH",body,token:demoTok()});
}
function demoAsset(id){return demoCache.assets.find(x=>String(x.id)===String(id))}
function demoContractor(id){return demoCache.contractors.find(x=>String(x.id)===String(id))}
function demoMaterial(id){return demoCache.materials.find(x=>String(x.id)===String(id))}
function demoStock(m){
 let q=Number(m?.opening_qty||0);
 demoCache.materialTx.filter(x=>String(x.material_id)===String(m?.id)).forEach(x=>q+=(x.tx_type==="in"?1:-1)*Number(x.qty||0));
 return q;
}
async function demoLoad(force=false){
 if(!demoIs())return demoCache;
 const buildingId=String(currentBuilding?.id||"");
 if(!buildingId)return demoCache;
 if(demoCache.loaded&&demoCache.buildingId===buildingId&&!force)return demoCache;
 try{
  const b="building_id=eq."+demoQs(buildingId);
  const [inc,ins,docs,reps,assets,cons,mats,tx]=await Promise.all([
   demoRest("incidents",b+"&select=*&order=detected_at.desc"),
   demoRest("inspections",b+"&select=*&order=inspection_date.desc"),
   demoRest("technical_documents",b+"&select=*&order=created_at.desc"),
   demoRest("report_registry",b+"&select=*&order=created_at.desc"),
   demoRest("maintenance_assets",b+"&select=*&order=code.asc"),
   demoRest("contractors",b+"&select=*&order=name.asc"),
   demoRest("inventory_materials",b+"&select=*&order=name.asc"),
   demoRest("inventory_material_transactions",b+"&select=*&order=tx_date.desc")
  ]);
  demoCache={loaded:true,buildingId,incidents:inc||[],inspections:ins||[],documents:docs||[],reports:reps||[],assets:assets||[],contractors:cons||[],materials:mats||[],materialTx:tx||[]};
 }catch(e){console.warn("Project operations data load failed",e)}
 return demoCache;
}
function demoHideSpecialPages(){
 DEMO_MODULES.forEach(n=>$("#"+n+"Page")?.classList.add("hide"));
 document.querySelectorAll(".demoTopTitle").forEach(el=>el.classList.add("hide"));
 document.querySelectorAll(".demoOnlyNav").forEach(el=>el.classList.remove("active"));
}
function demoSearchTerm(){
 return ($("#globalSearch")?.value||"").trim().toLocaleLowerCase("vi-VN");
}
function demoMatches(values){
 const q=demoSearchTerm();if(!q)return true;
 return values.some(v=>String(v||"").toLocaleLowerCase("vi-VN").includes(q));
}
function demoSpecialSearchPlaceholder(name){
 return ({incident:"Tìm sự cố, khu vực, thiết bị...",inspection:"Tìm checklist, mã kiểm tra...",documents:"Tìm tài liệu, hệ thống, nhà thầu...",reports:"Tìm báo cáo, kỳ, mã báo cáo..."})[name]||"Tìm...";
}
function demoSetProjectMode(){
 const on=demoIs()&&($("#adminPage")?.classList.contains("hide")??true);
 $("#app")?.classList.toggle("demoProjectMode",on);
 $("#app")?.classList.toggle("demoSampleProject",on&&String(currentBuilding?.id||"")===DEMO_ID);
 document.querySelectorAll(".demoOnlyNav").forEach(el=>el.classList.toggle("hide",!on));
 const panel=$("#demoWorkLinks");if(panel)panel.classList.toggle("hide",!on);
 if(on){demoEnsureWorkPanel();demoLoad().then(()=>{demoPopulateWorkOptions();demoRenderHomeOps();demoEnsureAssetPassport()})}
 else{demoHideSpecialPages();$("#demoHomeOps")?.remove();$("#demoAssetPassport")?.remove()}
}
function demoShowSpecial(name){
 if(!demoIs())return;
 const pages=["#homePage","#adminPage","#workPage","#energyPage","#inventoryPage","#maintenancePage","#contractorPage","#constructionMaterialPage"];
 pages.forEach(s=>$(s)?.classList.add("hide"));
 DEMO_MODULES.forEach(n=>$("#"+n+"Page")?.classList.add("hide"));
 document.querySelectorAll(".topModuleTitle").forEach(el=>el.classList.add("hide"));
 document.querySelectorAll(".estaNav button").forEach(el=>el.classList.remove("active"));
 $("#"+name+"Page")?.classList.remove("hide");
 $("#top"+name[0].toUpperCase()+name.slice(1)+"Title")?.classList.remove("hide");
 $("#nav"+name[0].toUpperCase()+name.slice(1))?.classList.add("active");
 $("#app").classList.remove("homeMode","workMode","energyMode","inventoryMode","maintenanceMode","contractorMode","constructionMode","adminMode");
 $("#app").classList.add(name+"Mode","demoProjectMode");
 const demoSearch=$("#globalSearch");
 if(demoSearch){demoSearch.value="";demoSearch.placeholder=demoSpecialSearchPlaceholder(name)}
 $("#filterBar")?.classList.add("hide");
 setMobileMenuOpen(false,true);
 demoLoad(true).then(()=>{
  if(name==="incident")demoRenderIncidents();
  if(name==="inspection")demoRenderInspections();
  if(name==="documents")demoRenderDocuments();
  if(name==="reports")demoRenderReports();
 });
}
const originalShowModule=showModule;
showModule=function(name){
 if(DEMO_MODULES.includes(name))return demoShowSpecial(name);
 demoHideSpecialPages();
 originalShowModule(name);
 const generalSearch=$("#globalSearch");
 if(generalSearch)generalSearch.placeholder="Tìm công việc...";
 if(demoIs()){
  demoSetProjectMode();
  if(name==="work")demoEnsureWorkPanel();
  if(name==="maintenance")demoEnsureAssetPassport();
 }
};
const originalShowHome=showHome;
showHome=function(){
 demoHideSpecialPages();
 originalShowHome();
 demoSetProjectMode();
 if(demoIs())demoLoad().then(demoRenderHomeOps);
};
const originalOpenAdminPortal=openAdminPortal;
openAdminPortal=function(){
 demoHideSpecialPages();
 $("#app")?.classList.remove("demoProjectMode");
 document.querySelectorAll(".demoOnlyNav").forEach(el=>el.classList.add("hide"));
 originalOpenAdminPortal();
};
const originalApplyBuildingUI=applyBuildingUI;
applyBuildingUI=function(){
 originalApplyBuildingUI();
 demoSetProjectMode();
};
document.addEventListener("DOMContentLoaded",demoSetProjectMode);

function demoEnsureWorkPanel(){
 const card=(typeof workEntryCard==="function"?workEntryCard():document.querySelector("#workPage .workEntryCard"));if(!card)return;
 let box=$("#demoWorkLinks");
 if(!box){
  box=document.createElement("details");
  box.id="demoWorkLinks";box.className="demoWorkLinks hide";
  box.innerHTML='<summary>⌁ Liên kết nâng cao · Thiết bị / Sự cố / Nhà thầu / Vật tư</summary><div class="demoWorkLinkGrid">'+
   '<label>Ưu tiên<select id="demoTaskPriority"><option>Thấp</option><option selected>Trung bình</option><option>Cao</option><option>Khẩn cấp</option></select></label>'+
   '<label>Hạn hoàn thành<input id="demoTaskDue" type="date"></label>'+
   '<label class="demoAdvancedAsset">Thiết bị<select id="demoTaskAsset"><option value="">Không liên kết</option></select></label>'+
   '<label>Sự cố / Defect<select id="demoTaskIncident"><option value="">Không liên kết</option></select></label>'+
   '<label class="demoAdvancedInspection">Checklist<select id="demoTaskInspection"><option value="">Không liên kết</option></select></label>'+
   '<label>Nhà thầu<select id="demoTaskContractor"><option value="">Không liên kết</option></select></label>'+
   '<label>Vật tư sử dụng<select id="demoTaskMaterial"><option value="">Không sử dụng</option></select></label>'+
   '<label>Số lượng<input id="demoTaskMaterialQty" type="number" min="0" step="0.01" value="1"></label>'+
   '<label class="span2">Nguyên nhân<textarea id="demoTaskCause" placeholder="Nhập nguyên nhân / chẩn đoán. Nếu chọn Sự cố, hệ thống có thể lấy nguyên nhân từ hồ sơ sự cố."></textarea></label>'+
   '<label class="span2">Hướng xử lý / Kết quả<textarea id="demoTaskResult" placeholder="Ghi hướng xử lý; bắt buộc khi chuyển sang Đã hoàn thành..."></textarea></label>'+
   '</div>';
  card.appendChild(box);
  ["demoTaskAsset","demoTaskIncident","demoTaskInspection","demoTaskContractor"].forEach(id=>$("#"+id)?.addEventListener("change",demoUpdateLinkSummary));
  $("#demoTaskIncident")?.addEventListener("change",()=>{
    const inc=demoCache.incidents.find(x=>String(x.incident_code)===String($("#demoTaskIncident").value||""));
    if(inc&&$("#demoTaskCause")&&!$("#demoTaskCause").value.trim())$("#demoTaskCause").value=inc.cause||"";
    if(inc&&$("#demoTaskResult")&&!$("#demoTaskResult").value.trim())$("#demoTaskResult").value=inc.solution||"";
  });
 }
 box.classList.toggle("hide",!demoIs());
 if(demoIs()){demoLoad().then(()=>{demoPopulateWorkOptions();demoResetWorkLinks(false)})}
}
function demoPopulateWorkOptions(){
 if(!demoIs())return;
 const set=(id,rows,label,value)=>{
  const el=$("#"+id);if(!el)return;
  const cur=el.value;
  el.innerHTML='<option value="">Không liên kết</option>'+rows.map(x=>'<option value="'+esc(value(x))+'">'+esc(label(x))+'</option>').join("");
  if([...el.options].some(o=>o.value===cur))el.value=cur;
 };
 set("demoTaskAsset",demoCache.assets,x=>(x.code||"")+" · "+x.name,x=>x.id);
 set("demoTaskIncident",demoCache.incidents,x=>x.incident_code+" · "+(x.area||x.symptom),x=>x.incident_code);
 set("demoTaskInspection",demoCache.inspections,x=>x.inspection_code+" · "+x.template_name,x=>x.inspection_code);
 set("demoTaskContractor",demoCache.contractors,x=>x.name+" · "+(x.specialty||""),x=>x.id);
 set("demoTaskMaterial",demoCache.materials,x=>x.name+" · tồn "+demoStock(x)+" "+x.unit,x=>x.id);
}
function demoUpdateLinkSummary(){
 const parts=[];
 const a=demoAsset($("#demoTaskAsset")?.value);if(a)parts.push("TB "+a.code);
 if($("#demoTaskIncident")?.value)parts.push($("#demoTaskIncident").value);
 if($("#demoTaskInspection")?.value)parts.push($("#demoTaskInspection").value);
 const c=demoContractor($("#demoTaskContractor")?.value);if(c)parts.push(c.name);
 $("#demoTaskLinkSummary")&&($("#demoTaskLinkSummary").value=parts.join(" · "));
}
function demoResetWorkLinks(clear=true){
 if(!demoIs())return;
 const d=$("#date")?.value||today();
 if(clear){
  $("#demoTaskPriority")&&($("#demoTaskPriority").value="Trung bình");
  $("#demoTaskAsset")&&($("#demoTaskAsset").value="");
  $("#demoTaskIncident")&&($("#demoTaskIncident").value="");
  $("#demoTaskInspection")&&($("#demoTaskInspection").value="");
  $("#demoTaskContractor")&&($("#demoTaskContractor").value="");
  $("#demoTaskMaterial")&&($("#demoTaskMaterial").value="");
  $("#demoTaskMaterialQty")&&($("#demoTaskMaterialQty").value="1");
  $("#demoTaskCause")&&($("#demoTaskCause").value="");
  $("#demoTaskResult")&&($("#demoTaskResult").value="");
 }
 if($("#demoTaskDue")&&!$("#demoTaskDue").value)$("#demoTaskDue").value=d;
 demoUpdateLinkSummary();
}
function demoReadWorkLinks(){
 const mid=$("#demoTaskMaterial")?.value||"",m=demoMaterial(mid),qty=Number($("#demoTaskMaterialQty")?.value||0);
 return {
  priority:$("#demoTaskPriority")?.value||"Trung bình",
  dueDate:$("#demoTaskDue")?.value||$("#date")?.value||today(),
  assetId:$("#demoTaskAsset")?.value||"",
  incidentCode:$("#demoTaskIncident")?.value||"",
  inspectionCode:$("#demoTaskInspection")?.value||"",
  contractorId:$("#demoTaskContractor")?.value||"",
  materials:m&&qty>0?[{materialId:m.id,name:m.name,qty,unit:m.unit}]:[],
  cause:$("#demoTaskCause")?.value.trim()||"",
  result:$("#demoTaskResult")?.value.trim()||""
 };
}
function demoFillWorkLinks(x){
 demoEnsureWorkPanel();demoPopulateWorkOptions();
 $("#demoTaskPriority")&&($("#demoTaskPriority").value=x.priority||"Trung bình");
 $("#demoTaskDue")&&($("#demoTaskDue").value=x.dueDate||x.d||today());
 $("#demoTaskAsset")&&($("#demoTaskAsset").value=x.assetId||"");
 $("#demoTaskIncident")&&($("#demoTaskIncident").value=x.incidentCode||"");
 $("#demoTaskInspection")&&($("#demoTaskInspection").value=x.inspectionCode||"");
 $("#demoTaskContractor")&&($("#demoTaskContractor").value=x.contractorId||"");
 const mu=Array.isArray(x.materials)?x.materials[0]:null;
 $("#demoTaskMaterial")&&($("#demoTaskMaterial").value=mu?.materialId||"");
 $("#demoTaskMaterialQty")&&($("#demoTaskMaterialQty").value=mu?.qty||1);
 $("#demoTaskCause")&&($("#demoTaskCause").value=x.cause||"");
 $("#demoTaskResult")&&($("#demoTaskResult").value=x.result||"");
 demoUpdateLinkSummary();
 $("#demoWorkLinks")?.setAttribute("open","");
}
function demoArrangeWorkEditDrawer(){
 if(!demoIs())return;
 const drawer=$("#workEditDrawer"),card=drawer?.querySelector(".workEntryCard"),links=$("#demoWorkLinks"),actions=card?.querySelector(".workFormActions");
 if(!drawer||drawer.classList.contains("hide")||!card)return;
 drawer.classList.add("demoWorkEditDrawer");
 if(links){
  const summary=links.querySelector("summary");
  if(summary){
   if(!summary.dataset.fullText)summary.dataset.fullText=summary.textContent;
   summary.textContent="⌁ Liên kết nâng cao · Sự cố / Nhà thầu / Vật tư";
  }
  links.setAttribute("open","");
 }
 if(actions&&links){
  actions.classList.add("demoEditFooter");
  const save=actions.querySelector("#saveBtn");
  if(save)save.setAttribute("form","taskForm");
  links.insertAdjacentElement("afterend",actions);
 }
}
function demoRestoreWorkEditLayout(){
 const drawer=$("#workEditDrawer"),form=$("#taskForm"),actions=document.querySelector(".workFormActions"),links=$("#demoWorkLinks");
 drawer?.classList.remove("demoWorkEditDrawer");
 if(links){
  const summary=links.querySelector("summary");
  if(summary?.dataset.fullText){summary.textContent=summary.dataset.fullText;delete summary.dataset.fullText}
 }
 if(form&&actions&&actions.parentElement!==form){
  actions.classList.remove("demoEditFooter");
  const save=actions.querySelector("#saveBtn");
  if(save)save.removeAttribute("form");
  form.appendChild(actions);
 }
}
const originalEditTask=window.editTask;
window.editTask=id=>{
 originalEditTask(id);
 if(demoIs()){
  const x=load().find(y=>String(y.id)===String(id));
  if(x)demoFillWorkLinks(x);
  requestAnimationFrame(demoArrangeWorkEditDrawer);
 }
};
const originalResetForm=resetForm;
resetForm=function(...args){
 const wasDemo=demoIs();
 const r=originalResetForm(...args);
 if(wasDemo){demoRestoreWorkEditLayout();demoResetWorkLinks(true)}
 return r
};

async function demoSyncContractorTask(obj){
 const taskId=String(obj.id);
 const q="building_id=eq."+demoQs(currentBuilding.id)+"&source_task_id=eq."+demoQs(taskId);
 try{
  const existing=await demoRest("contractor_jobs",q+"&select=id,contractor_id,source_task_id");
  if(!obj.contractorId){
   if(existing?.length)await sbFetch("/rest/v1/contractor_jobs?"+q,{method:"DELETE",token:demoTok()});
   if(typeof contractorLoadedBuilding!=="undefined")contractorLoadedBuilding="";
   return;
  }
  const completed=obj.s==="Đã hoàn thành"?(String(obj.completedAt||"").slice(0,10)||obj.d||null):null;
  const body={
   building_id:currentBuilding.id,
   contractor_id:obj.contractorId,
   work_date:obj.d||today(),
   completed_date:completed,
   work_content:obj.c||"Công việc liên kết",
   cause:obj.cause||(obj.incidentCode?("Liên kết sự cố "+obj.incidentCode):""),
   solution:obj.result||"",
   status:obj.s||"Đang thực hiện",
   note:obj.n||"",
   images:Array.isArray(obj.imgs)?obj.imgs.filter(Boolean):[],
   source_task_id:taskId,
   updated_at:new Date().toISOString()
  };
  if(existing?.length)await demoPatch("contractor_jobs",q,body);
  else await demoPost("contractor_jobs",body);
  if(typeof contractorLoadedBuilding!=="undefined")contractorLoadedBuilding="";
 }catch(e){
  console.warn("Sync contractor linked task failed",e);
  throw e;
 }
}
async function demoFinalizeLinks(obj,old){
 const linkJobs=[];
 if(obj.incidentCode)linkJobs.push(demoPatch("incidents","building_id=eq."+demoQs(currentBuilding.id)+"&incident_code=eq."+demoQs(obj.incidentCode),{related_task_id:String(obj.id),updated_at:new Date().toISOString()}));
 if(obj.inspectionCode){
  const ins=demoCache.inspections.find(x=>String(x.inspection_code)===String(obj.inspectionCode));
  if(ins)linkJobs.push(demoPatch("inspections","building_id=eq."+demoQs(currentBuilding.id)+"&inspection_code=eq."+demoQs(obj.inspectionCode),{related_task_ids:[...new Set([...(Array.isArray(ins.related_task_ids)?ins.related_task_ids:[]),String(obj.id)])],updated_at:new Date().toISOString()}));
 }
 if(linkJobs.length)await Promise.allSettled(linkJobs);
 if(old?.s==="Đã hoàn thành"||obj.s!=="Đã hoàn thành"){demoCache.loaded=false;await demoLoad(true);return}
 const jobs=[];
 for(const m of obj.materials||[]){
  jobs.push(demoPost("inventory_material_transactions",{building_id:currentBuilding.id,material_id:m.materialId,tx_date:obj.d,tx_type:"out",qty:m.qty,performer:obj.a||"",note:"Tự động xuất theo công việc "+obj.id}));
 }
 if(obj.assetId&&obj.t==="Bảo trì"){
  const asset=demoAsset(obj.assetId),next=new Date(obj.d+"T00:00:00");next.setDate(next.getDate()+Number(asset?.frequency_days||30));
  jobs.push(demoPost("maintenance_records",{building_id:currentBuilding.id,asset_id:obj.assetId,service_date:obj.d,maintenance_type:"Định kỳ",performer:obj.a||"",result_status:"Hoàn thành",work_done:obj.result||obj.c,note:obj.n||"",next_due_date:next.toLocaleDateString("en-CA"),cost:0}));
 }
 if(obj.incidentCode){
  jobs.push(demoPatch("incidents","building_id=eq."+demoQs(currentBuilding.id)+"&incident_code=eq."+demoQs(obj.incidentCode),{status:"Theo dõi",solution:obj.result||obj.n||"Đã xử lý qua công việc "+obj.id,related_task_id:String(obj.id),updated_at:new Date().toISOString()}));
 }
 await Promise.allSettled(jobs);
 demoCache.loaded=false;await demoLoad(true);
}
const originalTaskSubmit=$("#taskForm")?.onsubmit;
if($("#taskForm"))$("#taskForm").onsubmit=async e=>{
 if(!demoIs())return originalTaskSubmit.call($("#taskForm"),e);
 e.preventDefault();
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 if(!taskSelectedPeople.length){toast("Vui lòng chọn ít nhất 1 người thực hiện");$("#taskPeopleButton").focus();return}
 const links=demoReadWorkLinks();
 if($("#status").value==="Đã hoàn thành"&&!links.result){toast("Vui lòng nhập Kết quả xử lý trước khi hoàn thành");$("#demoTaskResult")?.focus();$("#demoWorkLinks")?.setAttribute("open","");return}
 const btn=$("#saveBtn");btn.disabled=true;
 try{
  const buildingId=currentBuilding.id,storageKey=taskStorageKeyFor(buildingId);
  let a=load(),editId=Number($("#editId").value),id=editId||Date.now(),old=editId?a.find(x=>x.id===editId):null;
  const files=[...pendingTaskFiles],removedRefs=[...removedTaskImageRefs];
  const imgs=editId?[...existingTaskImages]:(Array.isArray(old?.imgs)?[...old.imgs]:[]);
  const obj={id,d:$("#date").value,c:$("#content").value.trim(),t:$("#type").value,s:$("#status").value,n:$("#note").value.trim(),a:taskSelectedPeople.join(", "),performers:[...taskSelectedPeople],imgs,i:imgs.length,...links};
  if(obj.s==="Đã hoàn thành")obj.completedAt=old?.completedAt||new Date().toISOString();
  a=editId?a.map(x=>x.id===editId?obj:x):[...a,obj];
  localStorage.setItem(storageKey,JSON.stringify(a));
  resetForm();render();renderHomeDashboard();
  toast(files.length?"Đã lưu · "+files.length+" hình đang tải nền":"Đã lưu công việc liên kết");
  (async()=>{
   try{
    const taskSync=syncTaskRecord("upsert_task",obj,buildingId);
    const imageUpload=files.length?uploadMediaFiles(files,"tasks",id,null,buildingId):Promise.resolve([]);
    const [,uploaded]=await Promise.all([taskSync,imageUpload]);
    if(removedRefs.length)await deleteStoredMediaRefs(removedRefs);
    if(uploaded.length){
     let latest=[];try{latest=JSON.parse(localStorage.getItem(storageKey)||"[]")}catch(_){}
     const mergedImgs=[...new Set([...(Array.isArray(obj.imgs)?obj.imgs:[]),...uploaded])];
     obj.imgs=mergedImgs;obj.i=mergedImgs.length;
     latest=latest.map(x=>String(x.id)!==String(id)?x:{...x,imgs:mergedImgs,i:mergedImgs.length});
     localStorage.setItem(storageKey,JSON.stringify(latest));

     // Persist the complete linked task after Storage upload.
     // This avoids the previous race where the file existed in Storage
     // but the project snapshot could still keep imgs: [].
     await syncTaskRecord("upsert_task",obj,buildingId);
     toast("Đã tải xong "+uploaded.length+" hình");
    }
    await demoSyncContractorTask(obj);
    await demoFinalizeLinks(obj,old);
    if(currentBuilding.id===buildingId){render();renderHomeDashboard();demoRenderHomeOps()}
   }catch(err){console.warn(err);toast("Đã lưu công việc, một số liên kết chưa đồng bộ")}
  })();
 }catch(err){toast(err.message||"Không thể lưu công việc")}
 finally{btn.disabled=false}
};

const originalDemoDelTask=window.delTask;
window.delTask=async id=>{
 if(!demoIs())return originalDemoDelTask(id);
 await originalDemoDelTask(id);
 if(load().some(x=>String(x.id)===String(id)))return;
 try{
  await sbFetch("/rest/v1/contractor_jobs?building_id=eq."+demoQs(currentBuilding.id)+"&source_task_id=eq."+demoQs(String(id)),{method:"DELETE",token:demoTok()});
  if(typeof contractorLoadedBuilding!=="undefined")contractorLoadedBuilding="";
 }catch(e){console.warn("Delete linked contractor job failed",e)}
};

const originalRender=render;
render=function(){
 originalRender();
 if(demoIs())demoDecorateWork();
};
function demoTaskLinkHtml(x){
 const chips=[];
 const a=demoAsset(x.assetId);if(a)chips.push("TB "+a.code);
 if(x.incidentCode)chips.push(x.incidentCode);
 if(x.inspectionCode)chips.push(x.inspectionCode);
 const c=demoContractor(x.contractorId);if(c)chips.push(c.name);
 (x.materials||[]).forEach(m=>chips.push(m.name+" ×"+m.qty));
 if(x.dueDate&&x.s!=="Đã hoàn thành"&&x.dueDate<today())chips.push("QUÁ HẠN");
 return chips.map(v=>'<span class="demoLinkChip">'+esc(v)+'</span>').join("");
}
function demoDecorateWork(){
 if(!demoCache.loaded){demoLoad().then(()=>{demoPopulateWorkOptions();demoDecorateWork()});return}
 const data=filtered(),rows=[...document.querySelectorAll("#tbody tr")];
 rows.forEach((tr,i)=>{
  const x=data[i];if(!x)return;
  tr.dataset.demoTaskId=x.id;
  const note=tr.querySelector(".noteCell");if(note&&!note.querySelector(".demoLinkChips"))note.insertAdjacentHTML("beforeend",'<div class="demoLinkChips">'+demoTaskLinkHtml(x)+'</div>');
  tr.onclick=ev=>{if(ev.target.closest("button,summary,details,a"))return;demoOpenTaskDrawer(x.id)};
 });
 const cards=[...document.querySelectorAll("#mobileCards .proTaskCard")];
 cards.forEach((card,i)=>{
  const x=data[i];if(!x)return;
  if(!card.querySelector(".demoLinkChips"))card.querySelector("p")?.insertAdjacentHTML("afterend",'<div class="demoLinkChips">'+demoTaskLinkHtml(x)+'</div>');
  const foot=card.querySelector(".mobileCardFoot");
  if(foot&&!foot.querySelector(".demoViewTask"))foot.insertAdjacentHTML("beforeend",'<button class="demoViewTask" type="button" onclick="demoOpenTaskDrawer('+x.id+')">Hồ sơ liên kết</button>');
 });
}
window.demoSelectTaskTab=tab=>{
 const dr=$("#demoTaskDrawer");if(!dr)return;
 dr.querySelectorAll("[data-demo-task-tab]").forEach(btn=>btn.classList.toggle("active",btn.dataset.demoTaskTab===tab));
 dr.querySelectorAll("[data-demo-task-panel]").forEach(panel=>panel.classList.toggle("active",panel.dataset.demoTaskPanel===tab));
};
window.demoOpenTaskDrawer=id=>{
 const x=load().find(y=>String(y.id)===String(id));if(!x)return;
 let dr=$("#demoTaskDrawer");
 if(!dr){dr=document.createElement("div");dr.id="demoTaskDrawer";dr.className="demoDrawer hide";document.body.appendChild(dr)}
 const asset=demoAsset(x.assetId),con=demoContractor(x.contractorId);
 const inc=x.incidentCode?demoCache.incidents.find(v=>String(v.incident_code)===String(x.incidentCode)):null;
 const materialRows=(x.materials||[]).map(m=>'<div class="demoTaskCostRow"><span>'+esc(m.name||"Vật tư")+'</span><b>'+esc(m.qty||0)+' '+esc(m.unit||"")+'</b></div>').join("");
 const imageRows=(x.imgs||[]).map((ref,i)=>'<button type="button" class="demoTaskImage" onclick="viewImages('+x.id+')">'+mediaImgHtml(ref,"demoTaskImagePhoto")+'<span>Hình '+(i+1)+'</span></button>').join("");
 const linkedActions=[
  asset?'<button class="demoBtn" type="button" onclick="document.querySelector(\'#demoTaskDrawer\').classList.add(\'hide\');showModule(\'maintenance\')">Mở thiết bị</button>':"",
  x.incidentCode?'<button class="demoBtn" type="button" onclick="document.querySelector(\'#demoTaskDrawer\').classList.add(\'hide\');showModule(\'incident\')">Mở sự cố</button>':"",
  x.inspectionCode?'<button class="demoBtn" type="button" onclick="document.querySelector(\'#demoTaskDrawer\').classList.add(\'hide\');showModule(\'inspection\')">Mở checklist</button>':"",
  con?'<button class="demoBtn" type="button" onclick="document.querySelector(\'#demoTaskDrawer\').classList.add(\'hide\');showModule(\'contractor\')">Mở nhà thầu</button>':""
 ].filter(Boolean).join("");
 dr.innerHTML='<div class="demoDrawerCard"><div class="demoDrawerHead"><div><span class="demoPill blue">CV-'+esc(String(x.id).slice(-6))+'</span><h2>'+esc(x.c)+'</h2></div><button class="demoDrawerClose" onclick="document.querySelector(\'#demoTaskDrawer\').classList.add(\'hide\')">×</button></div>'+
 '<div class="demoTabs demoTaskTabs"><button type="button" class="active" data-demo-task-tab="info" onclick="demoSelectTaskTab(\'info\')">Thông tin</button><button type="button" data-demo-task-tab="links" onclick="demoSelectTaskTab(\'links\')">Liên kết</button><button type="button" data-demo-task-tab="cost" onclick="demoSelectTaskTab(\'cost\')">Vật tư & chi phí</button><button type="button" data-demo-task-tab="images" onclick="demoSelectTaskTab(\'images\')">Hình ảnh'+((x.imgs||[]).length?' ('+(x.imgs||[]).length+')':'')+'</button><button type="button" data-demo-task-tab="log" onclick="demoSelectTaskTab(\'log\')">Nhật ký</button></div>'+
 '<div class="demoTaskTabPanel active" data-demo-task-panel="info"><div class="demoTaskDetailGrid"><div><small>Trạng thái</small><b>'+esc(x.s)+'</b></div><div><small>Ưu tiên</small><b>'+esc(x.priority||"Trung bình")+'</b></div><div><small>Bắt đầu</small><b>'+esc(x.d)+'</b></div><div><small>Hạn hoàn thành</small><b>'+esc(x.dueDate||x.d)+'</b></div><div><small>Người thực hiện</small><b>'+esc(x.a||"—")+'</b></div><div><small>Loại</small><b>'+esc(x.t||"Hằng ngày")+'</b></div></div><div class="demoDetailSection"><span>NGUYÊN NHÂN</span><p>'+esc(x.cause||"Chưa ghi nhận")+'</p></div><div class="demoDetailSection"><span>HƯỚNG XỬ LÝ / KẾT QUẢ</span><p>'+esc(x.result||"Chưa có kết quả")+'</p></div></div>'+
 '<div class="demoTaskTabPanel" data-demo-task-panel="links"><div class="demoTaskLinkCards"><div><small>Thiết bị</small><b>'+esc(asset?asset.code+" · "+asset.name:"—")+'</b></div><div><small>Sự cố / Defect</small><b>'+esc(x.incidentCode||"—")+'</b></div><div><small>Checklist</small><b>'+esc(x.inspectionCode||"—")+'</b></div><div><small>Nhà thầu</small><b>'+esc(con?.name||"—")+'</b></div></div><div class="demoTaskTabActions">'+(linkedActions||'<span class="demoTaskEmpty">Chưa có liên kết để mở.</span>')+'</div></div>'+
 '<div class="demoTaskTabPanel" data-demo-task-panel="cost"><div class="demoDetailSection"><span>VẬT TƯ ĐÃ SỬ DỤNG</span><div class="demoTaskCostList">'+(materialRows||'<div class="demoTaskEmpty">Chưa ghi nhận vật tư.</div>')+'</div></div><div class="demoDetailSection"><span>CHI PHÍ</span><p>'+(inc&&Number(inc.cost||0)>0?Number(inc.cost||0).toLocaleString("vi-VN")+'đ · Theo sự cố '+esc(inc.incident_code):'Chưa ghi nhận chi phí.')+'</p></div></div>'+
 '<div class="demoTaskTabPanel" data-demo-task-panel="images"><div class="demoTaskImageGrid">'+(imageRows||'<div class="demoTaskEmpty">Công việc này chưa có hình ảnh.</div>')+'</div></div>'+
 '<div class="demoTaskTabPanel" data-demo-task-panel="log"><div class="demoTimeline"><div><i></i><span><b>Tạo / cập nhật công việc</b><br>'+esc(x.d)+'</span></div>'+(x.completedAt?'<div><i></i><span><b>Hoàn thành</b><br>'+esc(new Date(x.completedAt).toLocaleString("vi-VN"))+'</span></div>':'')+'</div></div></div>';
 dr.classList.remove("hide");
 hydrateMediaImages(dr);
};

async function demoRenderHomeOps(){
 if(!demoIs()||$("#homePage")?.classList.contains("hide"))return;
 await demoLoad();
 let sec=$("#demoHomeOps");
 if(!sec){sec=document.createElement("section");sec.id="demoHomeOps";sec.className="demoHomeOps";document.querySelector("#homePage .homeKpis")?.insertAdjacentElement("afterend",sec)}
 const openInc=demoCache.incidents.filter(x=>x.status!=="Đã đóng").length;
 const badIns=demoCache.inspections.filter(x=>x.result_status!=="Đạt").length;
 const due=demoCache.assets.filter(x=>x.next_due_date&&x.next_due_date<=new Date(Date.now()+30*86400000).toLocaleDateString("en-CA")).length;
 const low=demoCache.materials.filter(m=>Number(m.min_qty)>0&&demoStock(m)<=Number(m.min_qty)).length;
 const overdue=load().filter(x=>x.s!=="Đã hoàn thành"&&(x.dueDate||x.d)<today()).length;
 const alertRows=[
  openInc?'<button type="button" class="demoOpsAlert demoOpsAlertLink" onclick="showModule(\'incident\')"><b>⚠ '+openInc+' sự cố/defect đang mở</b><span>Mở Sự cố & Defect →</span></button>':"",
  badIns?'<button type="button" class="demoOpsAlert demoOpsAlertLink" onclick="showModule(\'inspection\')"><b>✓ '+badIns+' checklist cần chú ý/khắc phục</b><span>Mở Kiểm tra định kỳ →</span></button>':"",
  low?'<button type="button" class="demoOpsAlert demoOpsAlertLink" onclick="showModule(\'inventory\')"><b>▣ '+low+' vật tư dưới mức tối thiểu</b><span>Kiểm tra kho →</span></button>':"",
  overdue?'<button type="button" class="demoOpsAlert demoOpsAlertLink" onclick="showModule(\'work\')"><b>⏱ '+overdue+' công việc quá hạn</b><span>Cần xử lý hôm nay →</span></button>':""
 ].filter(Boolean).join("");
 sec.innerHTML='<div class="demoPanel"><div class="demoPanelHead"><div><h2>Trung tâm liên kết dự án</h2><p>Liên kết Công việc ↔ Thiết bị ↔ Sự cố ↔ Checklist ↔ Nhà thầu ↔ Vật tư</p></div><span class="demoPill blue">LIÊN KẾT</span></div><div class="demoPanelBody"><div class="demoOpsCards">'+
 '<button class="demoOpsCard" onclick="showModule(\'incident\')"><b>'+openInc+'</b><span>Sự cố đang mở</span></button>'+
 '<button class="demoOpsCard" onclick="showModule(\'inspection\')"><b>'+badIns+'</b><span>Checklist cần xử lý</span></button>'+
 '<button class="demoOpsCard" onclick="showModule(\'maintenance\')"><b>'+due+'</b><span>Thiết bị đến hạn 30 ngày</span></button>'+
 '<button class="demoOpsCard" onclick="showModule(\'inventory\')"><b>'+low+'</b><span>Vật tư sắp hết</span></button></div><div class="demoOpsList">'+alertRows+'</div></div></div>';
 demoBindBell();
}
function demoBindBell(){
 const bell=document.querySelector(".headerBell");if(!bell||bell.dataset.demoBound)return;
 bell.dataset.demoBound="1";
 bell.addEventListener("click",e=>{
  if(!demoIs())return;
  e.stopPropagation();
  let p=$("#demoNoticePanel");
  if(!p){p=document.createElement("div");p.id="demoNoticePanel";p.className="demoNoticePanel hide";document.body.appendChild(p)}
  const inc=demoCache.incidents.filter(x=>x.status!=="Đã đóng").slice(0,3);
  const low=demoCache.materials.filter(m=>Number(m.min_qty)>0&&demoStock(m)<=Number(m.min_qty)).slice(0,2);
  p.innerHTML='<h3>Thông báo & cảnh báo</h3>'+inc.map(x=>'<div class="demoOpsAlert"><b>'+esc(x.incident_code)+' · '+esc(x.area||x.symptom)+'</b><span>'+esc(x.severity)+'</span></div>').join("")+low.map(m=>'<div class="demoOpsAlert"><b>'+esc(m.name)+' · còn '+demoStock(m)+' '+esc(m.unit)+'</b><span>Tồn thấp</span></div>').join("");
  p.classList.toggle("hide");
 });
 $("#globalSearch")?.addEventListener("input",()=>{
 if(!demoIs())return;
 const visible=DEMO_MODULES.find(n=>!$("#"+n+"Page")?.classList.contains("hide"));
 if(visible==="incident")demoRenderIncidents();
 if(visible==="inspection")demoRenderInspections();
 if(visible==="documents")demoRenderDocuments();
 if(visible==="reports")demoRenderReports();
});

document.addEventListener("click",e=>{const p=$("#demoNoticePanel");if(p&&!p.contains(e.target)&&!bell.contains(e.target))p.classList.add("hide")});
}
function demoEnsureAssetPassport(){
 if(!demoIs()||$("#maintenancePage")?.classList.contains("hide"))return;
 let p=$("#demoAssetPassport");
 if(!p){p=document.createElement("section");p.id="demoAssetPassport";p.className="demoAssetPassport";document.querySelector("#maintenancePage .maintenanceHero")?.insertAdjacentElement("afterend",p)}
 p.innerHTML='<div><b>Hồ sơ thiết bị liên kết & QR</b><span>Mỗi thiết bị dùng một mã cố định để mở hồ sơ, lịch sử bảo trì, sự cố và tài liệu. Mã hồ sơ được tạo theo mã dự án và thiết bị.</span></div><button class="demoBtn primary" onclick="showModule(\'documents\')">Xem hồ sơ liên kết</button>';
}

function demoSeverityClass(v){return v==="Khẩn cấp"||v==="Cao"?"red":v==="Trung bình"?"amber":"blue"}
function demoStatusClass(v){return v==="Đã đóng"||v==="Đạt"?"green":v==="Đang xử lý"?"blue":v==="Theo dõi"||v==="Cần chú ý"?"amber":"red"}
window.demoOpenLinkedTask=id=>{showModule("work");const n=Number(id);setTimeout(()=>{if(Number.isFinite(n)&&typeof editTask==="function"&&load().some(x=>Number(x.id)===n))editTask(n)},90)};
window.demoSelectIncident=id=>{demoSelectedIncident=id;demoRenderIncidents()};
async function demoRenderIncidents(){
 await demoLoad();
 const all=demoCache.incidents;
 const list=all.filter(x=>demoMatches([x.incident_code,x.area,x.symptom,x.cause,x.solution,x.severity,x.status,demoAsset(x.asset_id)?.name,demoContractor(x.contractor_id)?.name]));
 if((!demoSelectedIncident||!list.some(x=>String(x.id)===String(demoSelectedIncident)))&&list[0])demoSelectedIncident=list[0].id;
 const selected=list.find(x=>String(x.id)===String(demoSelectedIncident))||list[0]||null;
 $("#demoIncidentOpen").textContent=all.filter(x=>x.status!=="Đã đóng").length;
 $("#demoIncidentUrgent").textContent=all.filter(x=>x.severity==="Khẩn cấp").length;
 $("#demoIncidentWatch").textContent=all.filter(x=>x.status==="Theo dõi").length;
 $("#demoIncidentClosed").textContent=all.filter(x=>x.status==="Đã đóng").length;
 $("#demoIncidentBody").innerHTML=list.map(x=>'<tr onclick="demoSelectIncident(\''+x.id+'\')"><td><b>'+esc(x.incident_code)+'</b><small>'+esc(new Date(x.detected_at).toLocaleDateString("vi-VN"))+'</small></td><td>'+esc(x.area||"—")+'</td><td>'+esc(demoAsset(x.asset_id)?.name||"—")+'</td><td>'+esc(x.symptom||"—")+'</td><td><span class="demoPill '+demoSeverityClass(x.severity)+'">'+esc(x.severity)+'</span></td><td><span class="demoPill '+demoStatusClass(x.status)+'">'+esc(x.status)+'</span></td></tr>').join("");
 const box=$("#demoIncidentDetail");
 if(!selected){box.innerHTML='<div class="demoPanelBody">Chưa có sự cố.</div>';return}
 const asset=demoAsset(selected.asset_id),con=demoContractor(selected.contractor_id);
 box.innerHTML='<div class="demoPanelHead"><div><h2 class="demoDetailTitle">'+esc(selected.incident_code)+'</h2><p>'+esc(selected.area||"")+' · '+esc(asset?.name||"Không gắn thiết bị")+'</p></div></div><div class="demoPanelBody"><div class="demoDetailMeta"><span class="demoPill '+demoSeverityClass(selected.severity)+'">'+esc(selected.severity)+'</span><span class="demoPill '+demoStatusClass(selected.status)+'">'+esc(selected.status)+'</span></div>'+
 '<div class="demoDetailSection"><span>HIỆN TƯỢNG</span><p>'+esc(selected.symptom)+'</p></div><div class="demoDetailSection"><span>NGUYÊN NHÂN</span><p>'+esc(selected.cause||"[Chưa xác định]")+'</p></div><div class="demoDetailSection"><span>HƯỚNG XỬ LÝ</span><p>'+esc(selected.solution||"[Chưa cập nhật]")+'</p></div>'+
 '<div class="demoDetailSection"><span>NHÀ THẦU / CHI PHÍ</span><p><strong>'+esc(con?.name||"—")+'</strong> · '+Number(selected.cost||0).toLocaleString("vi-VN")+'đ</p></div>'+
 '<div class="demoDetailSection"><span>HÌNH ẢNH TRƯỚC / SAU</span><div class="demoThumbPair"><div class="demoThumb">TRƯỚC XỬ LÝ</div><div class="demoThumb">SAU XỬ LÝ</div></div></div>'+
 '<div class="demoDetailSection"><span>THAO TÁC LIÊN KẾT</span><div class="demoHeroActions"><button class="demoBtn primary" onclick="demoCreateTaskFromIncident(\''+selected.id+'\')">+ Tạo công việc khắc phục</button>'+(selected.status!=="Đã đóng"?'<button class="demoBtn good" onclick="demoSetIncidentStatus(\''+selected.id+'\',\'Đã đóng\')">Đóng sự cố</button>':"")+'</div></div></div>';
}
window.demoSetIncidentStatus=async(id,status)=>{
 try{await demoPatch("incidents","id=eq."+demoQs(id)+"&building_id=eq."+demoQs(currentBuilding.id),{status,updated_at:new Date().toISOString()});await demoLoad(true);demoRenderIncidents();demoRenderHomeOps();toast("Đã cập nhật sự cố")}catch(e){toast(e.message)}
};
window.demoCreateTaskFromIncident=async id=>{
 const inc=demoCache.incidents.find(x=>String(x.id)===String(id));if(!inc)return;
 const assignee=projectPeople?.[0]?.name||"Kỹ thuật dự án",taskId=Date.now(),due=new Date();due.setDate(due.getDate()+2);
 const obj={id:taskId,d:today(),c:"Khắc phục "+(inc.area||inc.incident_code),t:"Sự cố",s:"Đang thực hiện",n:inc.symptom,a:assignee,performers:[assignee],imgs:[],i:0,priority:inc.severity,dueDate:due.toLocaleDateString("en-CA"),assetId:inc.asset_id||"",incidentCode:inc.incident_code,inspectionCode:"",contractorId:inc.contractor_id||"",materials:[],result:""};
 save([obj,...load()]);await syncTaskRecord("upsert_task",obj,currentBuilding.id);
 await demoPatch("incidents","id=eq."+demoQs(id),{related_task_id:String(taskId),status:"Đang xử lý",updated_at:new Date().toISOString()});
 await demoLoad(true);render();showModule("work");toast("Đã tạo công việc và liên kết với "+inc.incident_code);
};
window.demoAddIncident=async()=>{
 const symptom=prompt("Mô tả hiện tượng sự cố:");if(!symptom)return;
 const area=prompt("Khu vực / vị trí:","Khu vực kỹ thuật")||"";
 const severity=prompt("Mức độ: Thấp / Trung bình / Cao / Khẩn cấp","Trung bình")||"Trung bình";
 const code="SC-"+String(currentBuilding.id||"DA").replace(/[^A-Za-z0-9]/g,"")+"-"+String(Date.now()).slice(-4);
 try{await demoPost("incidents",{building_id:currentBuilding.id,incident_code:code,detected_at:new Date().toISOString(),area,severity:["Thấp","Trung bình","Cao","Khẩn cấp"].includes(severity)?severity:"Trung bình",status:"Mới",symptom,cause:"",solution:"",cost:0});await demoLoad(true);demoSelectedIncident="";demoRenderIncidents();toast("Đã thêm "+code)}catch(e){toast(e.message)}
};

window.demoSelectInspection=id=>{demoSelectedInspection=id;demoRenderInspections()};
async function demoRenderInspections(){
 await demoLoad();
 const all=demoCache.inspections;
 const list=all.filter(x=>demoMatches([x.inspection_code,x.template_name,x.period_label,x.result_status,x.recommendation,demoAsset(x.asset_id)?.name,...(Array.isArray(x.items)?x.items.flatMap(it=>[it.item,it.standard,it.result,it.note]):[])]));
 if((!demoSelectedInspection||!list.some(x=>String(x.id)===String(demoSelectedInspection)))&&list[0])demoSelectedInspection=list[0].id;
 const s=list.find(x=>String(x.id)===String(demoSelectedInspection))||list[0]||null;
 $("#demoInspectionCount").textContent=all.length;
 $("#demoInspectionPass").textContent=all.filter(x=>x.result_status==="Đạt").length;
 $("#demoInspectionAttention").textContent=all.filter(x=>x.result_status==="Cần chú ý").length;
 $("#demoInspectionFail").textContent=all.filter(x=>x.result_status==="Không đạt"||x.result_status==="Cần khắc phục").length;
 $("#demoInspectionList").innerHTML=list.map(x=>'<button class="demoOpsAlert" onclick="demoSelectInspection(\''+x.id+'\')"><b>'+esc(x.template_name)+'<small>'+esc(x.inspection_code)+' · '+esc(x.period_label)+'</small></b><span class="demoPill '+demoStatusClass(x.result_status)+'">'+esc(x.result_status)+'</span></button>').join("");
 const d=$("#demoInspectionDetail");if(!s){d.innerHTML="Chưa có checklist";return}
 const items=Array.isArray(s.items)?s.items:[];
 d.innerHTML='<div class="demoPanelHead"><div><h2>'+esc(s.template_name)+'</h2><p>'+esc(s.inspection_code)+' · '+esc(s.period_label)+'</p></div><span class="demoPill '+demoStatusClass(s.result_status)+'">'+esc(s.result_status)+'</span></div><div class="demoPanelBody"><div class="demoChecklist">'+items.map((it,i)=>'<div class="demoChecklistRow"><b>'+(i+1)+'. '+esc(it.item)+'</b><span>'+esc(it.standard||"—")+'</span><span class="demoPill '+demoStatusClass(it.result)+'">'+esc(it.result)+'</span><span>'+esc(it.note||"—")+'</span></div>').join("")+'</div><div class="demoDetailSection"><span>KIẾN NGHỊ</span><p>'+esc(s.recommendation||"—")+'</p></div><div class="demoDetailSection"><span>CÔNG VIỆC LIÊN KẾT</span><div class="demoHeroActions">'+((s.related_task_ids||[]).map(tid=>'<button class="demoBtn" onclick="demoOpenLinkedTask(\''+tid+'\')">CV '+esc(tid)+'</button>').join("")||'<span>Chưa có công việc liên kết</span>')+'</div></div><div class="demoHeroActions"><button class="demoBtn primary" onclick="demoCreateTaskFromInspection(\''+s.id+'\')">+ Tạo công việc khắc phục</button><button class="demoBtn" onclick="demoExportInspection(\''+s.id+'\')">Xuất PDF checklist</button></div></div>';
}
window.demoCreateTaskFromInspection=async id=>{
 const ins=demoCache.inspections.find(x=>String(x.id)===String(id));if(!ins)return;
 const bad=(ins.items||[]).find(x=>x.result!=="Đạt"),assignee=projectPeople?.[0]?.name||"Kỹ thuật dự án",taskId=Date.now(),due=new Date();due.setDate(due.getDate()+3);
 const obj={id:taskId,d:today(),c:"Khắc phục checklist · "+(bad?.item||ins.template_name),t:"Bảo trì",s:"Đang thực hiện",n:(bad?.note||ins.recommendation||""),a:assignee,performers:[assignee],imgs:[],i:0,priority:bad?.result==="Không đạt"?"Cao":"Trung bình",dueDate:due.toLocaleDateString("en-CA"),assetId:ins.asset_id||"",incidentCode:"",inspectionCode:ins.inspection_code,contractorId:"",materials:[],result:""};
 save([obj,...load()]);await syncTaskRecord("upsert_task",obj,currentBuilding.id);
 await demoPatch("inspections","id=eq."+demoQs(id),{related_task_ids:[...new Set([...(ins.related_task_ids||[]),String(taskId)])],updated_at:new Date().toISOString()});
 await demoLoad(true);render();showModule("work");toast("Đã tạo công việc từ checklist");
};
function demoInspectionHtml(ins){
 const items=ins.items||[];
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>'+esc(ins.template_name)+'</title><style>@page{size:A4;margin:20mm}body{font-family:Arial;color:#243746;font-size:11px}h1{text-align:center;color:#173d58}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cfd8de;padding:7px}th{background:#173d58;color:white}.sign{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:40px;text-align:center}.space{height:70px}</style></head><body data-pdf-report="inspection"><h1>BÁO CÁO KIỂM TRA - '+esc(ins.template_name.toUpperCase())+'</h1><p><b>'+esc(ins.period_label)+'</b> · '+esc(currentBuilding.name)+'</p><table><tr><th>STT</th><th>Hạng mục</th><th>Tiêu chuẩn</th><th>Kết quả</th><th>Ghi chú</th></tr>'+items.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.item)+'</td><td>'+esc(x.standard||"")+'</td><td>'+esc(x.result||"")+'</td><td>'+esc(x.note||"")+'</td></tr>').join("")+'</table><h3>Kết luận / Kiến nghị</h3><p>'+esc(ins.result_status)+' · '+esc(ins.recommendation||"")+'</p><div class="sign"><div><b>NGƯỜI KIỂM TRA (KT)</b><div class="space"></div>Họ tên: ____________</div><div><b>NGƯỜI KIỂM SOÁT (KST)</b><div class="space"></div>Họ tên: ____________</div></div></body></html>';
}
window.demoExportInspection=id=>{const ins=demoCache.inspections.find(x=>String(x.id)===String(id));if(ins)downloadReportPdf(demoInspectionHtml(ins),"BaoCao_KiemTra_"+ins.inspection_code+".pdf")};
window.demoAddChecklist=async()=>{
 const name=prompt("Tên checklist:","Checklist kỹ thuật mẫu");if(!name)return;
 const code="KT-"+String(currentBuilding.id||"DA").replace(/[^A-Za-z0-9]/g,"")+"-"+String(Date.now()).slice(-4);
 try{await demoPost("inspections",{building_id:currentBuilding.id,inspection_code:code,template_name:name,inspection_date:today(),period_label:"Kiểm tra bổ sung",result_status:"Cần chú ý",recommendation:"Cập nhật kết quả sau kiểm tra.",items:[{item:"Hạng mục 1",standard:"Theo tiêu chuẩn",result:"Cần chú ý",note:"Chưa kiểm tra"}],related_task_ids:[]});await demoLoad(true);demoSelectedInspection="";demoRenderInspections();toast("Đã tạo checklist")}catch(e){toast(e.message)}
};

window.demoSelectDocument=id=>{demoSelectedDocument=id;demoRenderDocuments()};
async function demoRenderDocuments(){
 await demoLoad();
 const all=demoCache.documents;
 const list=all.filter(x=>demoMatches([x.title,x.category,x.system_type,x.note,demoAsset(x.asset_id)?.name,demoContractor(x.contractor_id)?.name]));
 if((!demoSelectedDocument||!list.some(x=>String(x.id)===String(demoSelectedDocument)))&&list[0])demoSelectedDocument=list[0].id;
 const cats=["Bản vẽ","Catalogue","Manual","Biên bản","Báo giá","Bảo hành"];
 $("#demoDocCats").innerHTML=cats.map(c=>'<div class="demoDocCat"><b>'+all.filter(x=>x.category===c).length+'</b><span>'+c+'</span></div>').join("");
 $("#demoDocBody").innerHTML=list.map(x=>'<tr onclick="demoSelectDocument(\''+x.id+'\')"><td><b>'+esc(x.title)+'</b><small>'+esc(x.note||"")+'</small></td><td>'+esc(x.category)+'</td><td>'+esc(x.system_type||"—")+'</td><td>'+esc(demoAsset(x.asset_id)?.code||"—")+'</td><td>'+esc(demoContractor(x.contractor_id)?.name||"—")+'</td><td>'+esc(new Date(x.created_at).toLocaleDateString("vi-VN"))+'</td></tr>').join("");
 const s=list.find(x=>String(x.id)===String(demoSelectedDocument))||list[0];
 $("#demoDocDetail").innerHTML=s?'<div class="demoPanelHead"><div><h2>'+esc(s.title)+'</h2><p>'+esc(s.category)+' · '+esc(s.system_type||"")+'</p></div></div><div class="demoPanelBody"><div class="demoThumb" style="height:260px">XEM TRƯỚC TÀI LIỆU</div><div class="demoDetailSection"><span>LIÊN KẾT</span><p>Thiết bị: <strong>'+esc(demoAsset(s.asset_id)?.name||"—")+'</strong><br>Nhà thầu: <strong>'+esc(demoContractor(s.contractor_id)?.name||"—")+'</strong></p></div><div class="demoDetailSection"><span>GHI CHÚ</span><p>'+esc(s.note||"—")+'</p></div><button class="demoBtn primary" onclick="toast(\'Tài liệu chính thức sẽ mở từ Storage khi có file đính kèm.\')">Mở tài liệu</button></div>':'<div class="demoPanelBody">Chưa có tài liệu.</div>';
}
window.demoAddDocument=async()=>{
 const title=prompt("Tên tài liệu:","Biên bản kỹ thuật mẫu.pdf");if(!title)return;
 const category=prompt("Loại: Bản vẽ / Catalogue / Manual / Biên bản / Báo giá / Bảo hành","Biên bản")||"Khác";
 try{await demoPost("technical_documents",{building_id:currentBuilding.id,title,category,system_type:"Khác",file_ref:"project://"+Date.now(),note:"Tài liệu kỹ thuật của dự án "+currentBuilding.id});await demoLoad(true);demoRenderDocuments();toast("Đã thêm tài liệu")}catch(e){toast(e.message)}
};

function demoIncidentsReportHtml(){
 const rows=demoCache.incidents;
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>@page{size:A4;margin:20mm}body{font-family:Arial;color:#243746;font-size:10px}h1{text-align:center;color:#173d58}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd7de;padding:6px}th{background:#173d58;color:white}.sign{display:flex;justify-content:space-around;margin-top:40px}</style></head><body data-pdf-report="inspection"><h1>BÁO CÁO SỰ CỐ & DEFECT</h1><p>'+esc(currentBuilding.name)+' · '+esc(workReportPeriod("week").label)+'</p><table><tr><th>Mã</th><th>Khu vực</th><th>Hiện tượng</th><th>Mức độ</th><th>Trạng thái</th></tr>'+rows.map(x=>'<tr><td>'+esc(x.incident_code)+'</td><td>'+esc(x.area)+'</td><td>'+esc(x.symptom)+'</td><td>'+esc(x.severity)+'</td><td>'+esc(x.status)+'</td></tr>').join("")+'</table><div class="sign"><div>NGƯỜI KIỂM TRA (KT)<br><br><br>Họ tên: ________</div><div>NGƯỜI KIỂM SOÁT (KST)<br><br><br>Họ tên: ________</div></div></body></html>';
}
async function demoRenderReports(){
 await demoLoad();
 const p=workReportPeriod("week");
 $("#demoReportPeriod").textContent=p.label;
 const cards=[
  ["Công việc","Tự lấy công việc và liên kết","work"],
  ["Bảo trì thiết bị","Thiết bị đến hạn và lịch sử","maintenance"],
  ["Sự cố & Defect","Toàn bộ sự cố trong dự án","incident"],
  ["Kiểm tra định kỳ","Checklist và kết quả","inspection"],
  ["Năng lượng","Điện / Nước / Solar","energy"],
  ["Dụng cụ - Vật tư","Nhập / xuất / tồn","inventory"]
 ];
 $("#demoReportCards").innerHTML=cards.map(x=>'<article class="demoReportCard"><h3>'+x[0]+'</h3><p>'+x[1]+'</p><button class="demoBtn primary" onclick="demoExportReport(\''+x[2]+'\')">Xuất '+esc(p.label)+'</button></article>').join("");
 const rows=demoCache.reports.filter(x=>demoMatches([x.report_code,x.report_type,x.period_label,x.file_name]));
 $("#demoReportBody").innerHTML=rows.map(x=>'<tr><td><b>'+esc(x.report_code)+'</b></td><td>'+esc(x.report_type)+'</td><td>'+esc(x.period_label)+'</td><td>'+esc(new Date(x.created_at).toLocaleDateString("vi-VN"))+'</td><td>'+esc(x.file_name||"—")+'</td></tr>').join("");
}
window.demoExportReport=async type=>{
 const r=rangeDates("week");
 if(type==="work"){const a=load().filter(x=>x.d>=r.from&&x.d<=r.to);if(!a.length)return toast("Không có công việc trong kỳ");return openReport(a,"week")}
 if(type==="maintenance")return downloadReportPdf(maintenanceReportHtml("week"),maintenanceReportFilename(maintenanceReportPeriod("week")));
 if(type==="incident")return downloadReportPdf(demoIncidentsReportHtml(),"BaoCao_SuCo_"+workReportPeriod("week").suffix+".pdf");
 if(type==="inspection"){const ins=demoCache.inspections[0];if(ins)return window.demoExportInspection(ins.id)}
 if(type==="energy"){setEnergyRange("week");const rows=energyRows();if(rows.length)return downloadReportPdf(energyReportHtml(rows),"BaoCao_NangLuong_"+workReportPeriod("week").suffix+".pdf")}
 if(type==="inventory"){await loadInventoryData(currentBuilding.id);return inventoryPrintWindow(materialReportHtml(),"BaoCao_VatTu_"+workReportPeriod("week").suffix+".pdf")}
};

document.addEventListener("click",e=>{
 if(e.target.closest("#navIncident"))showModule("incident");
 if(e.target.closest("#navInspection"))showModule("inspection");
 if(e.target.closest("#navDocuments"))showModule("documents");
 if(e.target.closest("#navReports"))showModule("reports");
});
$("#demoIncidentAdd")&&($("#demoIncidentAdd").onclick=window.demoAddIncident);
$("#demoInspectionAdd")&&($("#demoInspectionAdd").onclick=window.demoAddChecklist);
$("#demoDocumentAdd")&&($("#demoDocumentAdd").onclick=window.demoAddDocument);

window.demoRefresh=async()=>{
 demoCache.loaded=false;await demoLoad(true);demoPopulateWorkOptions();demoRenderHomeOps();
 const visible=DEMO_MODULES.find(n=>!$("#"+n+"Page")?.classList.contains("hide"));
 if(visible)showModule(visible);
 toast("Đã làm mới dữ liệu dự án");
};

setTimeout(()=>{demoEnsureWorkPanel();demoSetProjectMode()},400);
})();