(()=>{
"use strict";
const DEMO_ID="DEMO";
const TECH_DOC_BUCKET="technical-documents";
const DEMO_MODULES=["incident","inspection","documents","reports"];
let demoCache={loaded:false,buildingId:"",incidents:[],inspections:[],documents:[],reports:[],assets:[],contractors:[],materials:[],materialTx:[]};
let demoSelectedIncident="",demoSelectedInspection="",demoSelectedDocument="",demoIncidentFilter="";
const demoIs=()=>!!currentBuilding?.id&&!$("#navWork")?.classList.contains("hide");
const demoUsesUpdatedOpsUI=()=>demoIs()&&String(currentBuilding?.id||"")!==DEMO_ID;
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
   demoRest("inventory_materials",b+"&archived_at=is.null&select=*&order=name.asc"),
   demoRest("inventory_material_transactions",b+"&select=*&order=tx_date.desc")
  ]);
  // Ignore a late response from the project we have already left.
  // Without this guard, linked Incident/Contractor/Material dropdowns can briefly show data from the previous building.
  if(String(currentBuilding?.id||"")!==buildingId)return demoCache;
  demoCache={loaded:true,buildingId,incidents:inc||[],inspections:ins||[],documents:docs||[],reports:reps||[],assets:assets||[],contractors:cons||[],materials:mats||[],materialTx:tx||[]};
 }catch(e){console.warn("Project operations data load failed",e)}
 return demoCache;
}
function demoHideSpecialPages(){
 DEMO_MODULES.forEach(n=>$("#app")?.classList.remove(n+"Mode"));
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
function demoModuleSearchPlaceholder(name){
 return ({
  work:"Tìm công việc...",
  energy:"Tìm chỉ số, ngày, người thực hiện...",
  inventory:"Tìm vật tư, dụng cụ...",
  maintenance:"Tìm thiết bị bảo trì...",
  contractor:"Tìm nhà thầu...",
  construction:"Tìm vật tư thi công..."
 })[name]||"Tìm trong dự án...";
}
function demoSyncMobilePilot(){
 // Legacy class names are retained for CSS compatibility. The newest approved
 // DEMO mobile layout is now the shared mobile standard for every real project.
 // Admin/portfolio pages stay outside this scope.
 const inProject=!!currentBuilding?.id
   &&($("#adminPage")?.classList.contains("hide")??true)
   &&!($("#navWork")?.classList.contains("hide")??true);
 $("#app")?.classList.toggle("demoMobilePilot",inProject);

 const energyCompact=inProject&&demoEnergyIsPhone();
 $("#app")?.classList.toggle("demoEnergyCompactPilot",energyCompact);
 demoSyncEnergyMobileEnhancements(energyCompact);
 return inProject;
}

function demoEnergyIsPhone(){
 return window.matchMedia?.("(max-width:640px)")?.matches??false;
}

function demoEnergyCompactShouldRun(){
 return !!currentBuilding?.id
  &&($("#adminPage")?.classList.contains("hide")??true)
  &&!($("#navWork")?.classList.contains("hide")??true)
  &&demoEnergyIsPhone();
}

function demoEnergyLatestForType(){
 if(typeof energyLoad!=="function")return null;
 const rows=energyLoad()
  .filter(x=>x.type===energyType)
  .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||Number(a.id)-Number(b.id));
 return rows.length?rows[rows.length-1]:null;
}

function demoEnergyUpdateDeltaHint(){
 if(!demoEnergyCompactShouldRun())return;
 const hint=$("#energyLatestHint"),input=$("#energyValue");
 if(!hint||!input)return;
 const latest=demoEnergyLatestForType();
 const meta=(typeof ENERGY_META!=="undefined"&&ENERGY_META[energyType])||{unit:""};
 if(!latest){
  hint.textContent="Chỉ số gần nhất: —";
  hint.classList.remove("demoEnergyWarning");
  return;
 }
 const latestValue=Number(latest.value);
 const raw=String(input.value||"").trim();
 if(!raw){
  hint.textContent="Chỉ số gần nhất: "+energyFmt(latestValue)+" "+meta.unit;
  hint.classList.remove("demoEnergyWarning");
  return;
 }
 const current=Number(raw);
 if(!Number.isFinite(current)){
  hint.textContent="Chỉ số gần nhất: "+energyFmt(latestValue)+" "+meta.unit;
  hint.classList.remove("demoEnergyWarning");
  return;
 }
 const diff=current-latestValue;
 const lower=diff<0;
 hint.classList.toggle("demoEnergyWarning",lower);
 hint.textContent=(lower?"⚠ ":"")+"Chỉ số gần nhất: "+energyFmt(latestValue)+" "+meta.unit+
  " · Chênh lệch: "+(diff>0?"+":"")+energyFmt(diff)+" "+meta.unit+
  (lower?" · Chỉ số mới đang nhỏ hơn chỉ số cũ":"");
}

function demoDecorateEnergyPreview(inputId,previewId){
 const input=$("#"+inputId),preview=$("#"+previewId);
 if(!input||!preview||!input.files?.length)return;
 requestAnimationFrame(()=>{
  if(!input.files?.length||preview.querySelector(".demoEnergyPreviewRemove"))return;
  preview.classList.add("demoEnergyPreviewCompact");
  const remove=document.createElement("button");
  remove.type="button";
  remove.className="demoEnergyPreviewRemove";
  remove.setAttribute("aria-label","Xóa ảnh vừa chọn");
  remove.textContent="×";
  remove.onclick=()=>{
   input.value="";
   preview.innerHTML="";
   preview.classList.remove("demoEnergyPreviewCompact");
  };
  preview.appendChild(remove);
 });
}

function demoEnsureEnergyRecentToggle(){
 const card=$("#energyPage .energyTableCard");
 if(!card||!demoEnergyCompactShouldRun())return;
 let btn=$("#demoEnergyRecentToggle");
 if(!btn){
  btn=document.createElement("button");
  btn.id="demoEnergyRecentToggle";
  btn.type="button";
  btn.className="demoEnergyRecentToggle";
  btn.setAttribute("aria-expanded","false");
  btn.textContent="Bản ghi gần đây · Mở";
  const top=card.querySelector(".energyTableTop");
  top?.prepend(btn);
  card.classList.add("demoEnergyRecentCollapsed");
  btn.onclick=()=>{
   const collapsed=card.classList.toggle("demoEnergyRecentCollapsed");
   btn.setAttribute("aria-expanded",String(!collapsed));
   btn.textContent=collapsed?"Bản ghi gần đây · Mở":"Bản ghi gần đây · Thu gọn";
  };
 }
}

function demoEnergyDecorateKpiUnits(){
 if(!demoEnergyCompactShouldRun()||typeof ENERGY_META==="undefined")return;
 if(typeof is68DualElectric==="function"&&is68DualElectric())return;
 const unit=String(ENERGY_META[energyType]?.unit||"").trim();
 if(!unit)return;
 ["energyLatestValue","energyPeriodUse"].forEach(id=>{
  const el=$("#"+id);if(!el)return;
  const text=String(el.textContent||"").trim();
  if(!text||text==="—"||!text.endsWith(" "+unit))return;
  const value=text.slice(0,-unit.length).trim();
  el.innerHTML='<span class="demoEnergyKpiValue">'+esc(value)+'</span><small class="demoEnergyKpiUnit">'+esc(unit)+'</small>';
 });
}
function demoEnergyRestoreKpiUnits(){
 document.querySelectorAll("#energyLatestValue .demoEnergyKpiUnit,#energyPeriodUse .demoEnergyKpiUnit").forEach(unitEl=>{
  const parent=unitEl.parentElement;
  if(!parent)return;
  const value=parent.querySelector(".demoEnergyKpiValue")?.textContent||"";
  const unit=unitEl.textContent||"";
  parent.textContent=(value+" "+unit).trim();
 });
}

function demoSyncEnergyMobileEnhancements(active){
 const value=$("#energyValue"),value2=$("#energyValue2");
 const image=$("#energyImage"),image2=$("#energyImage2");
 if(active){
  value?.setAttribute("inputmode","decimal");
  value2?.setAttribute("inputmode","decimal");
  image?.setAttribute("capture","environment");
  image2?.setAttribute("capture","environment");
  demoEnsureEnergyRecentToggle();
  demoEnergyUpdateDeltaHint();
 }else{
  value?.removeAttribute("inputmode");
  value2?.removeAttribute("inputmode");
  image?.removeAttribute("capture");
  image2?.removeAttribute("capture");
  $("#demoEnergyRecentToggle")?.remove();
  $("#energyPage .energyTableCard")?.classList.remove("demoEnergyRecentCollapsed");
  demoEnergyRestoreKpiUnits();
 }

 if(!demoSyncEnergyMobileEnhancements.bound){
  demoSyncEnergyMobileEnhancements.bound=true;
  value?.addEventListener("input",demoEnergyUpdateDeltaHint);
  value2?.addEventListener("input",demoEnergyUpdateDeltaHint);
  image?.addEventListener("change",()=>setTimeout(()=>demoDecorateEnergyPreview("energyImage","energyImagePreview"),0));
  image2?.addEventListener("change",()=>setTimeout(()=>demoDecorateEnergyPreview("energyImage2","energyImage2Preview"),0));
  document.querySelectorAll("[data-energy-type]").forEach(btn=>btn.addEventListener("click",()=>setTimeout(()=>{
   demoEnergyUpdateDeltaHint();
   demoEnsureEnergyRecentToggle();
  },0)));
  window.addEventListener("resize",()=>{
   const active=demoEnergyCompactShouldRun();
   $("#app")?.classList.toggle("demoEnergyCompactPilot",active);
   demoSyncEnergyMobileEnhancements(active);
  },{passive:true});
 }
}
const demoOriginalRenderEnergy=renderEnergy;
renderEnergy=function(){
 demoOriginalRenderEnergy();
 demoEnergyDecorateKpiUnits();
 demoEnergyUpdateDeltaHint();
 demoEnsureEnergyRecentToggle();
};

function demoSetProjectMode(){
 const shell=demoIs();
 const on=shell&&($("#adminPage")?.classList.contains("hide")??true);
 $("#app")?.classList.toggle("demoProjectShell",shell);
 $("#app")?.classList.toggle("demoProjectMode",on);
 // DEMO is the single visual reference. Every project must receive the exact same
 // shell/topbar/work-page theme; project-specific differences are data/config only.
 $("#app")?.classList.toggle("demoExactProject",on);
 $("#app")?.classList.toggle("demoSampleProject",on);
 // Reuse the finalized DEMO phone layout across every project.
 // CSS remains phone-width scoped, so Desktop is unchanged.
 demoSyncMobilePilot();
 document.querySelectorAll(".demoOnlyNav").forEach(el=>el.classList.toggle("hide",!on));
 const panel=$("#demoWorkLinks");if(panel)panel.classList.toggle("hide",!on);
 if(on){demoEnsureWorkPanel();demoLoad().then(()=>{demoPopulateWorkOptions();demoRenderHomeOps();demoEnsureAssetPassport()})}
 else{demoHideSpecialPages();$("#demoHomeOps")?.remove();$("#demoAssetPassport")?.remove()}
}
function demoShowSpecial(name){
 closeWorkFilter();
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
 DEMO_MODULES.forEach(n=>$("#app").classList.remove(n+"Mode"));
 $("#app").classList.add(name+"Mode","demoProjectMode");
 demoSyncMobilePilot();
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
 demoSyncMobilePilot();
 const generalSearch=$("#globalSearch");
 if(generalSearch){
  generalSearch.value="";
  generalSearch.placeholder=demoModuleSearchPlaceholder(name);
 }
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
 demoSyncMobilePilot();
 demoSetProjectMode();
 if(demoIs())demoLoad().then(demoRenderHomeOps);
};
const originalOpenAdminPortal=openAdminPortal;
openAdminPortal=function(){
 demoHideSpecialPages();
 $("#app")?.classList.remove("demoProjectMode","demoExactProject","demoSampleProject","demoMobilePilot","demoEnergyCompactPilot");
 document.querySelectorAll(".demoOnlyNav").forEach(el=>el.classList.add("hide"));
 originalOpenAdminPortal();
};
const originalApplyBuildingUI=applyBuildingUI;
applyBuildingUI=function(){
 originalApplyBuildingUI();
 demoSyncMobilePilot();
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
   '<label class="demoMobileHalf demoPriorityField">Ưu tiên<select id="demoTaskPriority"><option>Thấp</option><option selected>Trung bình</option><option>Cao</option><option>Khẩn cấp</option></select></label>'+
   '<label class="demoMobileHalf demoDueField">Hạn hoàn thành<input id="demoTaskDue" type="date"></label>'+
   '<label class="demoAdvancedAsset demoMobileHalf">Thiết bị<select id="demoTaskAsset"><option value="">Không liên kết</option></select></label>'+
   '<label class="demoMobileHalf demoIncidentField">Sự cố / Defect<select id="demoTaskIncident"><option value="">Không liên kết</option></select></label>'+
   '<label class="demoAdvancedInspection demoMobileHalf">Checklist<select id="demoTaskInspection"><option value="">Không liên kết</option></select></label>'+
   '<label class="demoMobileHalf demoContractorField">Nhà thầu<select id="demoTaskContractor"><option value="">Không liên kết</option></select></label>'+
   '<div class="span2 demoTaskMaterialsField"><div class="demoTaskMaterialsHead"><span>Vật tư sử dụng</span><button id="demoAddTaskMaterial" type="button">+ Thêm vật tư</button></div><div id="demoTaskMaterialsRows" class="demoTaskMaterialsRows"></div><small id="demoTaskMaterialsEmpty" class="demoTaskMaterialsEmpty hide">Chưa có vật tư trong kho dự án.</small></div>'+
   '<label class="span2"><span>Nguyên nhân</span><textarea id="demoTaskCause" placeholder="Nhập nguyên nhân / chẩn đoán. Nếu chọn Sự cố, hệ thống có thể lấy nguyên nhân từ hồ sơ sự cố."></textarea></label>'+
   '<label class="span2"><span id="demoTaskResultLabel">Hướng xử lý / Kết quả</span><textarea id="demoTaskResult" placeholder="Ghi hướng xử lý; bắt buộc khi chuyển sang Đã hoàn thành..."></textarea></label>'+
   '<button id="demoUseNoteAsResult" class="secondary hide" type="button">Dùng ghi chú làm kết quả</button>'+
   '</div>';
  card.appendChild(box);
  $("#demoUseNoteAsResult")?.addEventListener("click",()=>{
   const result=$("#demoTaskResult"),note=$("#note");
   if(!usesSingleTaskResult()||!result||result.value.trim()||!note?.value.trim())return;
   result.value=note.value.trim();
   box.setAttribute("open","");
   demoSyncCompletionFields();
   result.focus();
  });
  ["status","type","demoTaskIncident"].forEach(id=>$("#"+id)?.addEventListener("change",()=>{
   demoSyncCompletionFields();
   if(id==="status"&&usesSingleTaskResult()&&$("#status").value==="Đã hoàn thành")box.setAttribute("open","");
  }));
  ["note","demoTaskResult"].forEach(id=>$("#"+id)?.addEventListener("input",demoSyncCompletionFields));
  ["demoTaskAsset","demoTaskIncident","demoTaskInspection","demoTaskContractor"].forEach(id=>$("#"+id)?.addEventListener("change",demoUpdateLinkSummary));
  $("#demoAddTaskMaterial")?.addEventListener("click",()=>{
    const box=$("#demoTaskMaterialsRows");
    if(!(demoCache.materials||[]).length){toast("Chưa có vật tư trong kho dự án");return}
    box?.insertAdjacentHTML("beforeend",demoTaskMaterialRowHtml());
    demoBindTaskMaterialRows();
  });
    $("#demoTaskIncident")?.addEventListener("change",()=>{
    const inc=demoCache.incidents.find(x=>String(x.incident_code)===String($("#demoTaskIncident").value||""));
    if(inc&&$("#demoTaskCause")&&!$("#demoTaskCause").value.trim())$("#demoTaskCause").value=inc.cause||"";
    if(inc&&$("#demoTaskResult")&&!$("#demoTaskResult").value.trim())$("#demoTaskResult").value=inc.solution||"";
    demoSyncCompletionFields();
  });
 }
 box.classList.toggle("hide",!demoIs());
 demoSyncCompletionFields();
 if(demoIs()){demoLoad().then(()=>{demoPopulateWorkOptions();demoResetWorkLinks(false)})}
}
function demoSyncCompletionFields(){
 const single=usesSingleTaskResult(),result=$("#demoTaskResult"),done=$("#status")?.value==="Đã hoàn thành";
 const label=$("#demoTaskResultLabel"),cause=$("#demoTaskCause"),note=$("#note");
 if(label)label.textContent=single?"Kết quả thực hiện"+(done?" *":""):"Hướng xử lý / Kết quả";
 if(result){
  result.placeholder=single?"Nhập kết quả thực hiện; bắt buộc khi hoàn thành":"Ghi hướng xử lý; bắt buộc khi chuyển sang Đã hoàn thành...";
  result.setAttribute("aria-required",String(done));
  result.setAttribute("aria-invalid",String(single&&done&&!result.value.trim()));
 }
 cause?.closest("label")?.classList.toggle("hide",single&&$("#type")?.value!=="Sự cố"&&!$("#demoTaskIncident")?.value);
 if(cause)cause.required=false;
 $("#demoUseNoteAsResult")?.classList.toggle("hide",!single||!note?.value.trim()||!!result?.value.trim());
 if(note)note.placeholder=single?"Ghi chú bổ sung (không bắt buộc)":"Nhập ghi chú...";
 syncCompletionNoteRequirement(false);
}
function demoTaskMaterialOptions(selected=""){
 const materials=demoCache.materials||[];
 if(!materials.length)return '<option value="">Chưa có vật tư</option>';
 return '<option value="">— Chọn vật tư —</option>'+materials.map(m=>{
  const stock=demoStock(m);
  return '<option value="'+esc(m.id)+'" '+(String(m.id)===String(selected)?'selected':'')+'>'+esc(m.name)+' · tồn '+stock+' '+esc(m.unit)+'</option>';
 }).join("");
}
function demoTaskMaterialRowHtml(item={},index=0){
 const id=item.materialId||"",qty=Number(item.qty)>0?Number(item.qty):1,m=demoMaterial(id);
 return '<div class="demoTaskMaterialRow" data-material-row>'+
  '<select class="demoTaskMaterialSelect" aria-label="Vật tư sử dụng">'+demoTaskMaterialOptions(id)+'</select>'+
  '<div class="demoTaskMaterialQtyWrap"><input class="demoTaskMaterialQty" type="number" min="0.01" step="0.01" value="'+qty+'" aria-label="Số lượng sử dụng"><span class="demoTaskMaterialUnit">'+esc(m?.unit||"ĐVT")+'</span></div>'+
  '<button class="demoTaskMaterialRemove" type="button" aria-label="Xóa vật tư">×</button>'+
 '</div>';
}
function demoBindTaskMaterialRows(){
 const box=$("#demoTaskMaterialsRows");if(!box)return;
 box.querySelectorAll("[data-material-row]").forEach(row=>{
  const select=row.querySelector(".demoTaskMaterialSelect"),unit=row.querySelector(".demoTaskMaterialUnit");
  select?.addEventListener("change",()=>{
   const m=demoMaterial(select.value);
   if(unit)unit.textContent=m?.unit||"ĐVT";
  });
  row.querySelector(".demoTaskMaterialRemove")?.addEventListener("click",()=>{
   row.remove();
   if(!demoUsesUpdatedOpsUI()&&!box.querySelector("[data-material-row]")&&(demoCache.materials||[]).length)box.insertAdjacentHTML("beforeend",demoTaskMaterialRowHtml());
   demoBindTaskMaterialRows();
  });
 });
}
function demoRenderTaskMaterials(items=[]){
 const box=$("#demoTaskMaterialsRows"),empty=$("#demoTaskMaterialsEmpty");if(!box)return;
 const materials=demoCache.materials||[];
 empty?.classList.toggle("hide",materials.length>0);
 if(!materials.length){box.innerHTML="";return}
 const clean=Array.isArray(items)&&items.length?items:(demoUsesUpdatedOpsUI()?[]:[{}]);
 box.innerHTML=clean.map((x,i)=>demoTaskMaterialRowHtml(x,i)).join("");
 demoBindTaskMaterialRows();
}
function demoRefreshTaskMaterialOptions(){
 const rows=[...($("#demoTaskMaterialsRows")?.querySelectorAll("[data-material-row]")||[])];
 if(!rows.length){demoRenderTaskMaterials([]);return}
 rows.forEach(row=>{
  const sel=row.querySelector(".demoTaskMaterialSelect"),cur=sel?.value||"";
  if(sel)sel.innerHTML=demoTaskMaterialOptions(cur);
  const m=demoMaterial(cur),unit=row.querySelector(".demoTaskMaterialUnit");
  if(unit)unit.textContent=m?.unit||"ĐVT";
 });
 $("#demoTaskMaterialsEmpty")?.classList.toggle("hide",(demoCache.materials||[]).length>0);
}
function demoReadTaskMaterials(){
 const rows=[...($("#demoTaskMaterialsRows")?.querySelectorAll("[data-material-row]")||[])];
 const merged=new Map();
 for(const row of rows){
  const id=String(row.querySelector(".demoTaskMaterialSelect")?.value||"").trim();
  if(!id)continue;
  const m=demoMaterial(id);
  if(!m)throw new Error("Vật tư đã chọn không còn trong kho dự án.");
  const qty=Number(row.querySelector(".demoTaskMaterialQty")?.value||0);
  if(!Number.isFinite(qty)||qty<=0)throw new Error("Số lượng vật tư phải lớn hơn 0.");
  const old=merged.get(id);
  if(old)old.qty+=qty;else merged.set(id,{materialId:m.id,name:m.name,qty,unit:m.unit});
 }
 return [...merged.values()].map(x=>({...x,qty:Number(x.qty.toFixed(2))}));
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
 set("demoTaskIncident",demoCache.incidents,x=>demoIncidentVisibleRef(x)+" · "+(x.area||x.symptom),x=>x.incident_code);
 set("demoTaskInspection",demoCache.inspections,x=>x.inspection_code+" · "+x.template_name,x=>x.inspection_code);
 set("demoTaskContractor",demoCache.contractors,x=>x.name+" · "+(x.specialty||""),x=>x.id);
 demoRefreshTaskMaterialOptions();
}
function demoUpdateLinkSummary(){
 const parts=[];
 const a=demoAsset($("#demoTaskAsset")?.value);if(a)parts.push("TB "+a.code);
 if($("#demoTaskIncident")?.value){
  const inc=demoCache.incidents.find(x=>String(x.incident_code)===String($("#demoTaskIncident").value));
  parts.push(inc?demoIncidentVisibleRef(inc):$("#demoTaskIncident").value);
 }
 if($("#demoTaskInspection")?.value)parts.push($("#demoTaskInspection").value);
 const c=demoContractor($("#demoTaskContractor")?.value);if(c)parts.push(c.name);
 $("#demoTaskLinkSummary")&&($("#demoTaskLinkSummary").value=parts.join(" · "));
}
function demoResetWorkLinks(clear=true){
 if(!demoIs())return;
 if(clear){
  $("#demoTaskPriority")&&($("#demoTaskPriority").value="Trung bình");
  $("#demoTaskAsset")&&($("#demoTaskAsset").value="");
  $("#demoTaskIncident")&&($("#demoTaskIncident").value="");
  $("#demoTaskInspection")&&($("#demoTaskInspection").value="");
  $("#demoTaskContractor")&&($("#demoTaskContractor").value="");
  demoRenderTaskMaterials([]);
  $("#demoTaskCause")&&($("#demoTaskCause").value="");
  $("#demoTaskResult")&&($("#demoTaskResult").value="");
 }
 if(clear&&$("#demoTaskDue"))$("#demoTaskDue").value="";
 demoUpdateLinkSummary();
 demoSyncCompletionFields();
}
function demoReadWorkLinks(){
 return {
  priority:$("#demoTaskPriority")?.value||"Trung bình",
  dueDate:$("#demoTaskDue")?.value||"",
  dueDateExplicit:!!$("#demoTaskDue")?.value,
  assetId:$("#demoTaskAsset")?.value||"",
  incidentCode:$("#demoTaskIncident")?.value||"",
  inspectionCode:$("#demoTaskInspection")?.value||"",
  contractorId:$("#demoTaskContractor")?.value||"",
  materials:demoReadTaskMaterials(),
  cause:$("#demoTaskCause")?.value.trim()||"",
  result:$("#demoTaskResult")?.value.trim()||""
 };
}
function demoFillWorkLinks(x){
 demoEnsureWorkPanel();demoPopulateWorkOptions();
 const linkedIncident=x.incidentCode?demoCache.incidents.find(i=>String(i.incident_code)===String(x.incidentCode)):null;
 const workCause=String(x.cause||"").trim();
 const workResult=String(x.result||"").trim();
 const inheritedCause=linkedIncident?demoCauseValue(linkedIncident.cause):"";
 const inheritedResult=String(linkedIncident?.solution||"").trim();
 $("#demoTaskPriority")&&($("#demoTaskPriority").value=x.priority||"Trung bình");
 $("#demoTaskDue")&&($("#demoTaskDue").value=(x.dueDateExplicit||x.dueDate&&x.dueDate!==x.d)?x.dueDate:"");
 $("#demoTaskAsset")&&($("#demoTaskAsset").value=x.assetId||"");
 $("#demoTaskIncident")&&($("#demoTaskIncident").value=x.incidentCode||"");
 $("#demoTaskInspection")&&($("#demoTaskInspection").value=x.inspectionCode||"");
 $("#demoTaskContractor")&&($("#demoTaskContractor").value=x.contractorId||"");
 demoRenderTaskMaterials(Array.isArray(x.materials)?x.materials:[]);
 $("#demoTaskCause")&&($("#demoTaskCause").value=workCause||inheritedCause||"");
 $("#demoTaskResult")&&($("#demoTaskResult").value=workResult||inheritedResult||"");
 demoUpdateLinkSummary();
 demoSyncCompletionFields();
 const workLinks=$("#demoWorkLinks");
 if(workLinks){
  if(window.matchMedia("(max-width:760px)").matches)workLinks.removeAttribute("open");
  else workLinks.setAttribute("open","");
 }
}
function demoArrangeWorkEditDrawer(){
 if(!demoIs())return;
 const drawer=$("#workEditDrawer"),card=drawer?.querySelector(".workEntryCard"),links=$("#demoWorkLinks"),actions=card?.querySelector(".workFormActions");
 if(!drawer||drawer.classList.contains("hide")||!card)return;
 const mobile=window.matchMedia("(max-width:760px)").matches;
 drawer.classList.add("demoWorkEditDrawer");
 drawer.classList.toggle("demoWorkEditMobile",mobile);
 if(links){
  const summary=links.querySelector("summary");
  if(summary){
   if(!summary.dataset.fullText)summary.dataset.fullText=summary.textContent;
   summary.textContent=mobile?"Thông tin bổ sung":"⌁ Liên kết nâng cao · Sự cố / Nhà thầu / Vật tư";
  }
  if(mobile)links.removeAttribute("open");else links.setAttribute("open","");
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
 drawer?.classList.remove("demoWorkEditDrawer","demoWorkEditMobile");
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

async function demoSyncContractorTask(obj,buildingId=currentBuilding?.id){
 if(!buildingId)return;
 const taskId=String(obj.id);
 const q="building_id=eq."+demoQs(buildingId)+"&source_task_id=eq."+demoQs(taskId);
 try{
  const existing=await demoRest("contractor_jobs",q+"&select=id,contractor_id,source_task_id");
  if(!obj.contractorId){
   if(existing?.length)await sbFetch("/rest/v1/contractor_jobs?"+q,{method:"DELETE",token:demoTok()});
   if(typeof contractorLoadedBuilding!=="undefined")contractorLoadedBuilding="";
   return;
  }
  const completed=obj.s==="Đã hoàn thành"?(String(obj.completedAt||"").slice(0,10)||obj.d||null):null;
  const body={
   building_id:buildingId,
   contractor_id:obj.contractorId,
   work_date:obj.d||today(),
   completed_date:completed,
   work_content:obj.c||"Công việc liên kết",
   cause:demoCauseValue(obj.cause),
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
async function demoFinalizeLinks(obj,old,buildingId=currentBuilding?.id){
 if(!buildingId)return;
 const linkJobs=[];
 if(obj.incidentCode)linkJobs.push(demoPatch("incidents","building_id=eq."+demoQs(buildingId)+"&incident_code=eq."+demoQs(obj.incidentCode),{related_task_id:String(obj.id),updated_at:new Date().toISOString()}));
 if(obj.inspectionCode){
  let ins=(demoCache.buildingId===String(buildingId))?demoCache.inspections.find(x=>String(x.inspection_code)===String(obj.inspectionCode)):null;
  if(!ins){
   try{
    const rows=await demoRest("inspections","building_id=eq."+demoQs(buildingId)+"&inspection_code=eq."+demoQs(obj.inspectionCode)+"&select=id,related_task_ids");
    ins=rows?.[0]||null;
   }catch(e){console.warn("Inspection link lookup skipped",e)}
  }
  if(ins)linkJobs.push(demoPatch("inspections","building_id=eq."+demoQs(buildingId)+"&inspection_code=eq."+demoQs(obj.inspectionCode),{related_task_ids:[...new Set([...(Array.isArray(ins.related_task_ids)?ins.related_task_ids:[]),String(obj.id)])],updated_at:new Date().toISOString()}));
 }
 if(linkJobs.length)await Promise.allSettled(linkJobs);
 if(old?.s==="Đã hoàn thành"||obj.s!=="Đã hoàn thành"){
  if(String(currentBuilding?.id||"")===String(buildingId)){demoCache.loaded=false;await demoLoad(true)}
  return;
 }
 const jobs=[];
 if(obj.assetId&&obj.t==="Bảo trì"){
  let asset=(demoCache.buildingId===String(buildingId))?demoAsset(obj.assetId):null;
  if(!asset){
   try{
    const rows=await demoRest("maintenance_assets","building_id=eq."+demoQs(buildingId)+"&id=eq."+demoQs(obj.assetId)+"&select=id,frequency_days");
    asset=rows?.[0]||null;
   }catch(e){console.warn("Maintenance asset lookup skipped",e)}
  }
  const next=new Date(obj.d+"T00:00:00");next.setDate(next.getDate()+Number(asset?.frequency_days||30));
  jobs.push(demoPost("maintenance_records",{building_id:buildingId,asset_id:obj.assetId,service_date:obj.d,maintenance_type:"Định kỳ",performer:obj.a||"",result_status:"Hoàn thành",work_done:obj.result||obj.c,note:obj.n||"",next_due_date:next.toLocaleDateString("en-CA"),cost:0}));
 }
 if(obj.incidentCode){
  jobs.push(demoPatch("incidents","building_id=eq."+demoQs(buildingId)+"&incident_code=eq."+demoQs(obj.incidentCode),{status:"Theo dõi",solution:obj.result||obj.n||"Đã xử lý qua công việc "+obj.id,related_task_id:String(obj.id),updated_at:new Date().toISOString()}));
 }
 await Promise.allSettled(jobs);
 if(String(currentBuilding?.id||"")===String(buildingId)){
  demoCache.loaded=false;await demoLoad(true);
 }
}
const originalTaskSubmit=$("#taskForm")?.onsubmit;
if($("#taskForm"))$("#taskForm").onsubmit=async e=>{
 if(!demoIs())return originalTaskSubmit.call($("#taskForm"),e);
 e.preventDefault();
 if(!canProjectEdit()){toast("Tài khoản này chỉ có quyền xem");return}
 if(!taskSelectedPeople.length){toast("Vui lòng chọn ít nhất 1 người thực hiện");$("#taskPeopleButton").focus();return}
 let links;
 try{links=demoReadWorkLinks()}catch(materialError){
  toast(materialError.message||"Vật tư sử dụng không hợp lệ");
  $("#demoWorkLinks")?.setAttribute("open","");
  return;
 }
 if($("#status").value==="Đã hoàn thành"&&!links.result){
  toast(usesSingleTaskResult()?"Vui lòng nhập Kết quả thực hiện trước khi hoàn thành":"Vui lòng nhập Kết quả xử lý trước khi hoàn thành");
  $("#demoWorkLinks")?.setAttribute("open","");
  $("#demoTaskResult")?.focus();
  return;
 }
 const btn=$("#saveBtn");btn.disabled=true;
 try{
  const buildingId=currentBuilding.id,storageKey=taskStorageKeyFor(buildingId);
  let a=load(),editId=Number($("#editId").value),id=editId||Date.now(),old=editId?a.find(x=>x.id===editId):null;
  const files=[...pendingTaskFiles],removedRefs=[...removedTaskImageRefs];
  const imgs=editId?[...existingTaskImages]:(Array.isArray(old?.imgs)?[...old.imgs]:[]);
  let obj={...taskDispatchMetadata(old),id,d:$("#date").value,c:$("#content").value.trim(),t:$("#type").value,s:$("#status").value,n:$("#note").value.trim(),a:taskSelectedPeople.join(", "),performers:[...taskSelectedPeople],imgs,i:imgs.length,...links};
  if(obj.s==="Đã hoàn thành")obj.completedAt=old?.completedAt||new Date().toISOString();

  // Inventory reconciliation is blocking: insufficient stock means the work order is not saved.
  const syncResult=await syncTaskRecord("upsert_task",obj,buildingId);
  if(syncResult?.item)obj={...obj,...syncResult.item};
  a=editId?a.map(x=>String(x.id)===String(editId)?obj:x):[...a,obj];
  localStorage.setItem(storageKey,JSON.stringify(a));
  if(String(currentBuilding?.id||"")===String(buildingId)){
   resetForm();render();renderHomeDashboard();
   toast(files.length?"Đã lưu · "+files.length+" hình đang tải nền":"Đã lưu công việc và cập nhật vật tư");
  }

  (async()=>{
   try{
    const imageUpload=files.length?uploadMediaFiles(files,"tasks",id,null,buildingId):Promise.resolve([]);
    const uploaded=await imageUpload;
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
    await demoSyncContractorTask(obj,buildingId);
    await demoFinalizeLinks(obj,old,buildingId);
    if(typeof inventoryLoadedBuilding!=="undefined")inventoryLoadedBuilding="";
    demoCache.loaded=false;await demoLoad(true);
    if(currentBuilding.id===buildingId){render();renderHomeDashboard();demoRenderHomeOps()}
   }catch(err){console.warn(err);toast("Công việc đã lưu, một số liên kết phụ chưa đồng bộ")}
  })();
 }catch(err){
  const message=err.message||"Không thể lưu công việc";
  toast(message);
  if(/tồn kho|vật tư/i.test(message))$("#demoWorkLinks")?.setAttribute("open","");
 }
 finally{btn.disabled=false}
};

const originalDemoDelTask=window.delTask;
window.delTask=async id=>{
 if(!demoIs())return originalDemoDelTask(id);
 const buildingId=String(currentBuilding?.id||"");
 await originalDemoDelTask(id);
 if(String(currentBuilding?.id||"")!==buildingId)return;
 if(load().some(x=>String(x.id)===String(id)))return;
 try{
  await sbFetch("/rest/v1/contractor_jobs?building_id=eq."+demoQs(buildingId)+"&source_task_id=eq."+demoQs(String(id)),{method:"DELETE",token:demoTok()});
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
 if((x.dueDateExplicit||x.dueDate&&x.dueDate!==x.d)&&x.s!=="Đã hoàn thành"&&x.dueDate<today())chips.push("QUÁ HẠN");
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
 dr.querySelectorAll("[data-demo-task-tab]").forEach(btn=>{
  const on=btn.dataset.demoTaskTab===tab;
  btn.classList.toggle("active",on);
  btn.setAttribute("aria-selected",String(on));
 });
 dr.querySelectorAll("[data-demo-task-panel]").forEach(panel=>{
  const on=panel.dataset.demoTaskPanel===tab;
  panel.classList.toggle("active",on);
  panel.hidden=!on;
 });
 const card=dr.querySelector(".demoDrawerCard");
 if(card)card.dataset.activeTaskTab=tab;
};
function demoFormatDate(v){
 if(!v)return "—";
 const s=String(v).slice(0,10);
 const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
 return m?m[3]+"/"+m[2]+"/"+m[1]:s;
}
window.demoEditTaskFromDrawer=id=>{
 const task=load().find(x=>String(x.id)===String(id));
 if(!task)return;
 $("#demoTaskDrawer")?.classList.add("hide");
 editTask(task.id);
};
window.demoDeleteTaskFromDrawer=async id=>{
 const task=load().find(x=>String(x.id)===String(id));
 if(!task)return;
 await delTask(task.id);
 if(!load().some(x=>String(x.id)===String(id))){
  $("#demoTaskDrawer")?.classList.add("hide");
 }
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
 dr.innerHTML='<div class="demoDrawerCard"><div class="demoDrawerHead"><div><span class="demoPill blue">CÔNG VIỆC</span><h2>'+esc(x.c)+'</h2></div><button class="demoDrawerClose" onclick="document.querySelector(\'#demoTaskDrawer\').classList.add(\'hide\')">×</button></div>'+
 '<div class="demoTabs demoTaskTabs"><button type="button" class="active" aria-selected="true" data-demo-task-tab="info">Thông tin</button><button type="button" aria-selected="false" data-demo-task-tab="links">Liên kết</button><button type="button" aria-selected="false" data-demo-task-tab="cost">Vật tư & chi phí</button><button type="button" aria-selected="false" data-demo-task-tab="images">Hình ảnh'+((x.imgs||[]).length?' ('+(x.imgs||[]).length+')':'')+'</button><button type="button" aria-selected="false" data-demo-task-tab="log">Nhật ký</button></div>'+
 '<div class="demoTaskTabPanel active" data-demo-task-panel="info"><div class="demoTaskDetailGrid"><div><small>Trạng thái</small><b>'+esc(x.s)+'</b></div><div><small>Ưu tiên</small><b>'+esc(x.priority||"Trung bình")+'</b></div><div><small>Bắt đầu</small><b>'+esc(demoFormatDate(x.d))+'</b></div><div><small>Hạn hoàn thành</small><b>'+esc((x.dueDateExplicit||x.dueDate&&x.dueDate!==x.d)?demoFormatDate(x.dueDate):"Chưa đặt hạn")+'</b></div><div><small>Người thực hiện</small><b>'+esc(x.a||"—")+'</b></div><div><small>Loại</small><b>'+esc(x.t||"Hằng ngày")+'</b></div></div><div class="demoDetailSection"><span>NGUYÊN NHÂN</span><p>'+esc(demoCauseValue(x.cause)||"—")+'</p></div><div class="demoDetailSection"><span>HƯỚNG XỬ LÝ / KẾT QUẢ</span><p>'+esc(x.result||"Chưa có kết quả")+'</p></div><div class="demoTaskManageBox"><span>THAO TÁC CÔNG VIỆC</span><div class="demoTaskManageActions"><button type="button" class="demoTaskManageEdit" onclick="demoEditTaskFromDrawer(\''+x.id+'\')"><b>✎</b><span>Chỉnh sửa công việc</span></button><button type="button" class="demoTaskManageDelete" onclick="demoDeleteTaskFromDrawer(\''+x.id+'\')"><b>×</b><span>Xóa công việc</span></button></div></div></div>'+
 '<div class="demoTaskTabPanel" data-demo-task-panel="links" hidden><div class="demoTaskLinkCards"><div><small>Thiết bị</small><b>'+esc(asset?asset.code+" · "+asset.name:"—")+'</b></div><div><small>Sự cố / Defect</small><b>'+esc(inc?demoIncidentVisibleRef(inc):(x.incidentCode||"—"))+'</b></div><div><small>Checklist</small><b>'+esc(x.inspectionCode||"—")+'</b></div><div><small>Nhà thầu</small><b>'+esc(con?.name||"—")+'</b></div></div><div class="demoTaskTabActions">'+(linkedActions||'<span class="demoTaskEmpty">Chưa có liên kết để mở.</span>')+'</div></div>'+
 '<div class="demoTaskTabPanel" data-demo-task-panel="cost" hidden><div class="demoDetailSection"><span>VẬT TƯ ĐÃ SỬ DỤNG</span><div class="demoTaskCostList">'+(materialRows||'<div class="demoTaskEmpty">Chưa ghi nhận vật tư.</div>')+'</div></div><div class="demoDetailSection"><span>CHI PHÍ</span><p>'+(inc&&Number(inc.cost||0)>0?Number(inc.cost||0).toLocaleString("vi-VN")+'đ · '+esc(demoUseIncidentStartDate()?("Ghi nhận "+demoIncidentVisibleRef(inc)):("Theo sự cố "+inc.incident_code)):'Chưa ghi nhận chi phí.')+'</p></div></div>'+
 '<div class="demoTaskTabPanel" data-demo-task-panel="images" hidden><div class="demoTaskImageGrid">'+(imageRows||'<div class="demoTaskEmpty">Công việc này chưa có hình ảnh.</div>')+'</div></div>'+
 '<div class="demoTaskTabPanel" data-demo-task-panel="log" hidden><div class="demoTimeline"><div><i></i><span><b>Tạo / cập nhật công việc</b><br>'+esc(demoFormatDate(x.d))+'</span></div>'+(x.completedAt?'<div><i></i><span><b>Hoàn thành</b><br>'+esc(new Date(x.completedAt).toLocaleString("vi-VN"))+'</span></div>':'')+'</div></div></div>';
 dr.classList.remove("hide");
 demoSelectTaskTab("info");
 hydrateMediaImages(dr);
};

document.addEventListener("click",e=>{
 const btn=e.target.closest?.("#demoTaskDrawer [data-demo-task-tab]");
 if(!btn)return;
 e.preventDefault();
 e.stopPropagation();
 demoSelectTaskTab(btn.dataset.demoTaskTab||"info");
});


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
  p.innerHTML='<h3>Thông báo & cảnh báo</h3>'+inc.map(x=>'<div class="demoOpsAlert"><b>'+esc(demoIncidentVisibleRef(x))+' · '+esc(x.area||x.symptom)+'</b><span>'+esc(x.severity)+'</span></div>').join("")+low.map(m=>'<div class="demoOpsAlert"><b>'+esc(m.name)+' · còn '+demoStock(m)+' '+esc(m.unit)+'</b><span>Tồn thấp</span></div>').join("");
  p.classList.toggle("hide");
 });
 $("#globalSearch")?.addEventListener("input",()=>{
  if(!demoIs())return;
  const q=$("#globalSearch")?.value||"";
  const visible=DEMO_MODULES.find(n=>!$("#"+n+"Page")?.classList.contains("hide"));
  if(visible==="incident")return demoRenderIncidents();
  if(visible==="inspection")return demoRenderInspections();
  if(visible==="documents")return demoRenderDocuments();
  if(visible==="reports")return window.ESTAReports.renderHistory();

  if($("#app")?.classList.contains("energyMode")){
   if($("#energyQuickSearch"))$("#energyQuickSearch").value=q;
   if(typeof renderEnergy==="function")renderEnergy();
  }else if($("#app")?.classList.contains("inventoryMode")){
   if($("#materialSearch"))$("#materialSearch").value=q;
   if($("#toolSearch"))$("#toolSearch").value=q;
   if(typeof renderMaterials==="function")renderMaterials();
   if(typeof renderTools==="function")renderTools();
  }else if($("#app")?.classList.contains("maintenanceMode")){
   if($("#maintenanceSearch"))$("#maintenanceSearch").value=q;
   if(typeof renderMaintenance==="function")renderMaintenance();
  }else if($("#app")?.classList.contains("constructionMode")){
   if($("#constructionSearch"))$("#constructionSearch").value=q;
   if(typeof renderConstructionMaterials==="function")renderConstructionMaterials();
  }
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

function demoUseIncidentStartDate(){
 return demoUsesUpdatedOpsUI();
}
function demoIncidentStartParts(x){
 const raw=x?.created_at||x?.detected_at||"";
 const d=raw?new Date(raw):null;
 if(!d||Number.isNaN(d.getTime()))return {date:"—",time:""};
 return {
  date:d.toLocaleDateString("vi-VN"),
  time:d.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})
 };
}
function demoIncidentVisibleRef(x){
 if(!demoUseIncidentStartDate())return x?.incident_code||"—";
 const p=demoIncidentStartParts(x);
 return p.time?p.date+" · "+p.time:p.date;
}

function demoCauseValue(v){
 const s=String(v||"").trim();
 return !s||["[Chưa xác định]","Chưa xác định","Chưa ghi nhận"].includes(s)?"":s;
}
window.demoOpenLinkedTask=id=>{showModule("work");const n=Number(id);setTimeout(()=>{if(Number.isFinite(n)&&typeof editTask==="function"&&load().some(x=>Number(x.id)===n))editTask(n)},90)};
window.demoSelectIncident=id=>{demoSelectedIncident=id;demoRenderIncidents()};
window.demoIncidentRowAction=id=>{
 const inc=demoCache.incidents.find(x=>String(x.id)===String(id));if(!inc)return;
 demoSelectedIncident=id;
 demoRenderIncidents();
 if(demoUsesUpdatedOpsUI())demoEditIncident(id);
};
let demoIncidentBeforeFiles=[],demoIncidentAfterFiles=[],demoEditingIncidentId="",demoIncidentExistingBeforeRefs=[],demoIncidentExistingAfterRefs=[];

function demoEnsureIncidentEditFields(){
 if(!demoUsesUpdatedOpsUI())return;
 const grid=$("#demoIncidentForm .demoIncidentFormGrid");if(!grid)return;
 if(!$("#demoIncidentContractor")){
  const symptom=$("#demoIncidentSymptom")?.closest("label");
  const wrap=document.createElement("div");
  wrap.className="demoIncidentUpdateFields";
  wrap.innerHTML=
   '<label><span>Nhà thầu</span><select id="demoIncidentContractor"><option value="">Không liên kết</option></select></label>'+
   '<label><span>Chi phí (đ)</span><input id="demoIncidentCost" type="number" min="0" step="1000" value="0"></label>';
  if(symptom)grid.insertBefore(wrap,symptom); else grid.appendChild(wrap);
 }
 const contractor=$("#demoIncidentContractor");
 if(contractor){
  const v=contractor.value;
  contractor.innerHTML='<option value="">Không liên kết</option>'+demoCache.contractors.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join("");
  contractor.value=[...contractor.options].some(o=>String(o.value)===String(v))?v:"";
 }
 const status=$("#demoIncidentStatus");
 if(status&&!Array.from(status.options).some(o=>o.value==="Đã đóng"))status.insertAdjacentHTML("beforeend",'<option value="Đã đóng">Đã đóng</option>');
}
function demoIncidentDateValue(raw){
 if(!raw)return today();
 const d=new Date(raw);if(Number.isNaN(d.getTime()))return today();
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function demoIncidentFilePreview(kind){
 const files=kind==="before"?demoIncidentBeforeFiles:demoIncidentAfterFiles;
 const refs=kind==="before"?demoIncidentExistingBeforeRefs:demoIncidentExistingAfterRefs;
 const box=$("#"+(kind==="before"?"demoIncidentBeforePreview":"demoIncidentAfterPreview"));
 if(!box)return;
 const existing=refs.map((ref,i)=>'<div class="demoIncidentImageChip demoIncidentExistingImage">'+mediaImgHtml(ref,"")+'<span>Ảnh hiện có '+(i+1)+'</span><button type="button" data-demo-incident-existing-remove="'+kind+'" data-index="'+i+'" aria-label="Bỏ ảnh">×</button></div>').join("");
 const pending=files.map((f,i)=>'<div class="demoIncidentImageChip"><span>'+esc(f.name||("Ảnh mới "+(i+1)))+'</span><button type="button" data-demo-incident-remove="'+kind+'" data-index="'+i+'" aria-label="Bỏ ảnh">×</button></div>').join("");
 box.innerHTML=existing+pending;
 if(typeof hydrateMediaImages==="function")hydrateMediaImages(box);
}
function resetDemoIncidentFiles(clearExisting=true){
 demoIncidentBeforeFiles=[];demoIncidentAfterFiles=[];
 if(clearExisting){demoIncidentExistingBeforeRefs=[];demoIncidentExistingAfterRefs=[];}
 const before=$("#demoIncidentBeforeImages"),after=$("#demoIncidentAfterImages");
 if(before)before.value="";if(after)after.value="";
 demoIncidentFilePreview("before");demoIncidentFilePreview("after");
}
document.addEventListener("change",e=>{
 if(e.target?.id==="demoIncidentBeforeImages"){
  demoIncidentBeforeFiles.push(...[...(e.target.files||[])].filter(f=>f.type?.startsWith("image/")));
  e.target.value="";demoIncidentFilePreview("before");
 }
 if(e.target?.id==="demoIncidentAfterImages"){
  demoIncidentAfterFiles.push(...[...(e.target.files||[])].filter(f=>f.type?.startsWith("image/")));
  e.target.value="";demoIncidentFilePreview("after");
 }
});
document.addEventListener("click",e=>{
 const existingBtn=e.target.closest?.("[data-demo-incident-existing-remove]");
 if(existingBtn){
  e.preventDefault();
  const kind=existingBtn.dataset.demoIncidentExistingRemove;
  const list=kind==="before"?demoIncidentExistingBeforeRefs:demoIncidentExistingAfterRefs;
  list.splice(Number(existingBtn.dataset.index),1);
  demoIncidentFilePreview(kind);
  return;
 }
 const btn=e.target.closest?.("[data-demo-incident-remove]");if(!btn)return;
 e.preventDefault();
 const list=btn.dataset.demoIncidentRemove==="before"?demoIncidentBeforeFiles:demoIncidentAfterFiles;
 list.splice(Number(btn.dataset.index),1);
 demoIncidentFilePreview(btn.dataset.demoIncidentRemove);
});
function demoIncidentThumbHtml(refs,label){
 refs=Array.isArray(refs)?refs.filter(Boolean):[];
 if(!refs.length)return '<div class="demoIncidentThumb"><small>'+esc(label)+' · Chưa có ảnh</small></div>';
 return '<div class="demoIncidentThumb">'+mediaImgHtml(refs[0],"")+'<small>'+esc(label)+' · '+refs.length+' ảnh</small></div>';
}

function demoIncidentFilterMatch(x){
 if(!demoIncidentFilter)return true;
 if(demoIncidentFilter==="open")return x.status!=="Đã đóng";
 if(demoIncidentFilter==="urgent")return x.severity==="Khẩn cấp";
 if(demoIncidentFilter==="watch")return x.status==="Theo dõi";
 if(demoIncidentFilter==="closed")return x.status==="Đã đóng";
 return true;
}
function demoBindIncidentKpis(){
 const defs=[
  ["demoIncidentOpen","open","Đang mở"],
  ["demoIncidentUrgent","urgent","Khẩn cấp"],
  ["demoIncidentWatch","watch","Theo dõi"],
  ["demoIncidentClosed","closed","Đã đóng"]
 ];
 defs.forEach(([id,key,label])=>{
  const card=$("#"+id)?.closest(".demoKpi");if(!card)return;
  card.classList.add("demoIncidentFilterKpi");
  card.classList.toggle("active",demoIncidentFilter===key);
  card.setAttribute("role","button");
  card.setAttribute("tabindex","0");
  card.setAttribute("aria-pressed",String(demoIncidentFilter===key));
  card.setAttribute("title","Lọc: "+label);
  if(card.dataset.incidentFilterBound==="1")return;
  card.dataset.incidentFilterBound="1";
  const toggle=()=>{
   demoIncidentFilter=demoIncidentFilter===key?"":key;
   demoSelectedIncident="";
   demoRenderIncidents();
  };
  card.addEventListener("click",toggle);
  card.addEventListener("keydown",e=>{
   if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}
  });
 });
}

async function demoRenderIncidents(){
 await demoLoad();
 const all=demoCache.incidents;
 demoBindIncidentKpis();
 const list=all.filter(x=>demoIncidentFilterMatch(x)&&demoMatches([x.incident_code,x.area,x.symptom,x.cause,x.solution,x.severity,x.status,demoAsset(x.asset_id)?.name,demoContractor(x.contractor_id)?.name]));
 if((!demoSelectedIncident||!list.some(x=>String(x.id)===String(demoSelectedIncident)))&&list[0])demoSelectedIncident=list[0].id;
 const selected=list.find(x=>String(x.id)===String(demoSelectedIncident))||list[0]||null;
 $("#demoIncidentOpen").textContent=all.filter(x=>x.status!=="Đã đóng").length;
 $("#demoIncidentUrgent").textContent=all.filter(x=>x.severity==="Khẩn cấp").length;
 $("#demoIncidentWatch").textContent=all.filter(x=>x.status==="Theo dõi").length;
 $("#demoIncidentClosed").textContent=all.filter(x=>x.status==="Đã đóng").length;
 const useStartDate=demoUseIncidentStartDate();
 const firstHead=$("#incidentPage .demoTable thead th:first-child");
 if(firstHead)firstHead.textContent=useStartDate?"Ngày bắt đầu":"Mã sự cố";
 const listHint=$("#incidentPage .demoGrid2 > .demoPanel .demoPanelHead p");
 if(listHint)listHint.textContent=useStartDate?"Ngày bắt đầu · thiết bị/khu vực · mức độ · trạng thái":"Mã sự cố · thiết bị/khu vực · mức độ · trạng thái";
 $("#demoIncidentBody").innerHTML=list.map(x=>{
  const start=demoIncidentStartParts(x);
  const first=useStartDate?('<td class="demoIncidentStartCell"><b>'+esc(start.date)+'</b><small>'+esc(start.time||"")+'</small></td>'):('<td><b>'+esc(x.incident_code)+'</b><small>'+esc(new Date(x.detected_at).toLocaleDateString("vi-VN"))+'</small></td>');
  return '<tr onclick="demoIncidentRowAction(\''+x.id+'\')" title="Chỉnh sửa sự cố / Defect">'+first+'<td>'+esc(x.area||"—")+'</td><td>'+esc(demoAsset(x.asset_id)?.name||"—")+'</td><td>'+esc(x.symptom||"—")+'</td><td><span class="demoPill '+demoSeverityClass(x.severity)+'">'+esc(x.severity)+'</span></td><td><span class="demoPill '+demoStatusClass(x.status)+'">'+esc(x.status)+'</span></td></tr>';
 }).join("");
 const box=$("#demoIncidentDetail");
 if(!selected){box.innerHTML='<div class="demoPanelBody">Chưa có sự cố.</div>';return}
 const asset=demoAsset(selected.asset_id),con=demoContractor(selected.contractor_id),start=demoIncidentStartParts(selected);
 const detailTitle=useStartDate?start.date:selected.incident_code;
 const linkedTask=demoFindIncidentLinkedTask(selected);
 const workButtonLabel=linkedTask?"Chỉnh sửa công việc":"+ Tạo công việc";
 const titleHtml=useStartDate?('<h2 class="demoDetailTitle demoIncidentStartTitle"><span>Bắt đầu</span><b>'+esc(detailTitle)+'</b></h2>'):('<h2 class="demoDetailTitle">'+esc(detailTitle)+'</h2>');
 box.innerHTML='<div class="demoPanelHead demoIncidentDetailHead"><div class="demoIncidentHeadCopy">'+titleHtml+'<p>'+esc(selected.area||"")+' · '+esc(asset?.name||"Không gắn thiết bị")+'</p></div><div class="demoIncidentHeadActions"><button class="demoBtn primary" onclick="demoCreateTaskFromIncident(\''+selected.id+'\')">'+workButtonLabel+'</button>'+(selected.status!=="Đã đóng"?'<button class="demoBtn good" onclick="demoSetIncidentStatus(\''+selected.id+'\',\'Đã đóng\')">Đóng sự cố</button>':"")+'</div></div><div class="demoPanelBody"><div class="demoDetailMeta"><span class="demoPill '+demoSeverityClass(selected.severity)+'">'+esc(selected.severity)+'</span><span class="demoPill '+demoStatusClass(selected.status)+'">'+esc(selected.status)+'</span></div>'+
 '<div class="demoDetailSection"><span>HIỆN TƯỢNG</span><p>'+esc(selected.symptom)+'</p></div><div class="demoDetailSection"><span>NGUYÊN NHÂN</span><p>'+esc(demoCauseValue(selected.cause)||"—")+'</p></div><div class="demoDetailSection"><span>HƯỚNG XỬ LÝ</span><p>'+esc(selected.solution||"[Chưa cập nhật]")+'</p></div>'+
 '<div class="demoDetailSection"><span>NHÀ THẦU / CHI PHÍ</span><p><strong>'+esc(con?.name||"—")+'</strong> · '+Number(selected.cost||0).toLocaleString("vi-VN")+'đ</p></div>'+
 '<div class="demoDetailSection"><span>HÌNH ẢNH TRƯỚC / SAU</span><div class="demoThumbPair">'+demoIncidentThumbHtml(selected.before_images,"TRƯỚC XỬ LÝ")+demoIncidentThumbHtml(selected.after_images,"SAU XỬ LÝ")+'</div></div></div>';
 if(typeof hydrateMediaImages==="function")hydrateMediaImages(box);
}
window.demoSetIncidentStatus=async(id,status)=>{
 const buildingId=String(currentBuilding?.id||"");if(!buildingId)return;
 try{
  await demoPatch("incidents","id=eq."+demoQs(id)+"&building_id=eq."+demoQs(buildingId),{status,updated_at:new Date().toISOString()});
  if(String(currentBuilding?.id||"")!==buildingId)return;
  await demoLoad(true);
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoRenderIncidents();demoRenderHomeOps();toast("Đã cập nhật sự cố");
 }catch(e){
  if(String(currentBuilding?.id||"")===buildingId)toast(e.message);
 }
};
function demoIncidentTaskPriority(severity){
 if(!demoUsesUpdatedOpsUI())return severity||"Trung bình";
 const raw=String(severity||"").trim();
 if(raw==="Khẩn cấp"||raw==="Critical")return "Critical";
 if(raw==="Cao"||raw==="High")return "High";
 if(raw==="Thấp"||raw==="Low")return "Low";
 return "Medium";
}
function demoIncidentTaskDue(priority){
 if(!demoUsesUpdatedOpsUI()){
  const d=new Date();d.setDate(d.getDate()+2);return d.toLocaleDateString("en-CA");
 }
 const mins=({Critical:30,High:120,Medium:480,Low:1440})[priority]||480;
 const d=new Date(Date.now()+mins*60000);
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function demoFindIncidentLinkedTask(inc){
 if(!inc)return null;
 const tasks=load();
 if(inc.related_task_id){
  const byId=tasks.find(t=>String(t.id)===String(inc.related_task_id));
  if(byId)return byId;
 }
 return tasks.find(t=>String(t.incidentCode||"")===String(inc.incident_code||""))||null;
}
function demoOpenIncidentLinkedTask(taskId){
 showModule("work");
 render();
 requestAnimationFrame(()=>requestAnimationFrame(()=>window.editTask?.(Number(taskId))));
}
window.demoCreateTaskFromIncident=async id=>{
 const buildingId=String(currentBuilding?.id||"");if(!buildingId)return;
 const inc=demoCache.incidents.find(x=>String(x.id)===String(id));if(!inc)return;
 const existing=demoFindIncidentLinkedTask(inc);
 if(existing){
  if(String(inc.related_task_id||"")!==String(existing.id)){
   try{await demoPatch("incidents","id=eq."+demoQs(id)+"&building_id=eq."+demoQs(buildingId),{related_task_id:String(existing.id),updated_at:new Date().toISOString()})}catch(e){}
  }
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoOpenIncidentLinkedTask(existing.id);
  toast("Sự cố đã có công việc liên kết · đang mở chỉnh sửa");
  return;
 }
 const assignee=projectPeople?.[0]?.name||currentAccount?.display_name||currentAccount?.username||me||"Kỹ thuật dự án";
 const taskId=Date.now();
 const priority=demoIncidentTaskPriority(inc.severity);
 const linkedAsset=demoAsset(inc.asset_id);
 const dueDate=demoIncidentTaskDue(priority);
 const title=[String(inc.symptom||"").trim(),String(inc.area||"").trim()].filter(Boolean).join(" - ")||"Xử lý sự cố";
 let obj={
  id:taskId,d:today(),c:title,t:"Sự cố",s:"Đang thực hiện",n:"",
  a:assignee,performers:[assignee],imgs:[],i:0,
  priority,dueDate,dueDateExplicit:true,
  assetId:inc.asset_id||"",incidentCode:inc.incident_code,inspectionCode:"",
  contractorId:inc.contractor_id||"",materials:[],
  systemCode:linkedAsset?.system_code||"",areaCode:linkedAsset?.area_code||"",
  cause:demoCauseValue(inc.cause)||"",result:String(inc.solution||"").trim()
 };
 try{
  const syncResult=await syncTaskRecord("upsert_task",obj,buildingId);
  if(syncResult?.item)obj={...obj,...syncResult.item};
  let projectTasks=[];try{projectTasks=JSON.parse(localStorage.getItem(taskStorageKeyFor(buildingId))||"[]")}catch(e){}
  localStorage.setItem(taskStorageKeyFor(buildingId),JSON.stringify([obj,...projectTasks.filter(t=>String(t.id)!==String(taskId))]));
  await demoPatch("incidents","id=eq."+demoQs(id)+"&building_id=eq."+demoQs(buildingId),{
   related_task_id:String(taskId),status:"Đang xử lý",updated_at:new Date().toISOString()
  });
  if(obj.contractorId){
   try{await demoSyncContractorTask(obj,buildingId)}catch(e){console.warn("Incident contractor sync skipped",e)}
  }
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoCache.loaded=false;
  await demoLoad(true);
  if(String(currentBuilding?.id||"")!==buildingId)return;
  render();
  demoOpenIncidentLinkedTask(taskId);
  toast("Đã tạo công việc · mở chỉnh sửa");
 }catch(e){
  if(String(currentBuilding?.id||"")===buildingId)toast(e.message||"Không thể tạo công việc từ sự cố");
 }
};
window.demoAddIncident=async()=>{
 await demoLoad();
 const modal=$("#demoIncidentModal");if(!modal)return;
 demoEditingIncidentId="";
 demoIncidentExistingBeforeRefs=[];demoIncidentExistingAfterRefs=[];
 demoEnsureIncidentEditFields();
 $("#demoIncidentModalTitle").textContent="Thêm sự cố / Defect";
 $("#demoIncidentDetectedDate").value=today();
 $("#demoIncidentArea").value="";
 $("#demoIncidentSeverity").value="Trung bình";
 $("#demoIncidentStatus").value="Mới";
 $("#demoIncidentSymptom").value="";
 $("#demoIncidentCause").value="";
 $("#demoIncidentSolution").value="";
 $("#demoIncidentContractor")&&($("#demoIncidentContractor").value="");
 $("#demoIncidentCost")&&($("#demoIncidentCost").value=0);
 resetDemoIncidentFiles(false);
 const assetSelect=$("#demoIncidentAsset");
 if(assetSelect){
  assetSelect.innerHTML='<option value="">Không gắn thiết bị</option>'+demoCache.assets.map(a=>'<option value="'+esc(a.id)+'">'+esc((a.code?a.code+" · ":"")+a.name)+'</option>').join("");
  assetSelect.value="";
 }
 const btn=$("#demoIncidentSaveBtn");if(btn)btn.textContent="Lưu sự cố";
 modal.classList.remove("hide");
 document.body.classList.add("demoModalOpen");
 setTimeout(()=>$("#demoIncidentArea")?.focus(),60);
};
window.demoEditIncident=async id=>{
 await demoLoad();
 const inc=demoCache.incidents.find(x=>String(x.id)===String(id));if(!inc)return;
 const modal=$("#demoIncidentModal");if(!modal)return;
 demoEditingIncidentId=String(id);
 demoEnsureIncidentEditFields();
 $("#demoIncidentModalTitle").textContent="Chỉnh sửa sự cố / Defect";
 $("#demoIncidentDetectedDate").value=demoIncidentDateValue(inc.created_at||inc.detected_at);
 $("#demoIncidentArea").value=inc.area||"";
 $("#demoIncidentSeverity").value=inc.severity||"Trung bình";
 $("#demoIncidentStatus").value=inc.status||"Mới";
 $("#demoIncidentSymptom").value=inc.symptom||"";
 $("#demoIncidentCause").value=demoCauseValue(inc.cause)||"";
 $("#demoIncidentSolution").value=inc.solution||"";
 $("#demoIncidentContractor")&&($("#demoIncidentContractor").value=inc.contractor_id||"");
 $("#demoIncidentCost")&&($("#demoIncidentCost").value=Number(inc.cost||0));
 demoIncidentBeforeFiles=[];demoIncidentAfterFiles=[];
 demoIncidentExistingBeforeRefs=[...(Array.isArray(inc.before_images)?inc.before_images:[])];
 demoIncidentExistingAfterRefs=[...(Array.isArray(inc.after_images)?inc.after_images:[])];
 demoIncidentFilePreview("before");demoIncidentFilePreview("after");
 const assetSelect=$("#demoIncidentAsset");
 if(assetSelect){
  assetSelect.innerHTML='<option value="">Không gắn thiết bị</option>'+demoCache.assets.map(a=>'<option value="'+esc(a.id)+'">'+esc((a.code?a.code+" · ":"")+a.name)+'</option>').join("");
  assetSelect.value=inc.asset_id||"";
 }
 const btn=$("#demoIncidentSaveBtn");if(btn)btn.textContent="Lưu thay đổi";
 modal.classList.remove("hide");
 document.body.classList.add("demoModalOpen");
 setTimeout(()=>$("#demoIncidentSymptom")?.focus(),60);
};
window.demoCloseIncidentModal=()=>{
 $("#demoIncidentModal")?.classList.add("hide");
 document.body.classList.remove("demoModalOpen");
};
window.demoSubmitIncident=async e=>{
 e?.preventDefault();
 const buildingId=String(currentBuilding?.id||"");if(!buildingId)return;
 const editing=!!demoEditingIncidentId;
 const existing=editing?demoCache.incidents.find(x=>String(x.id)===String(demoEditingIncidentId)):null;
 const date=$("#demoIncidentDetectedDate")?.value||today();
 const area=$("#demoIncidentArea")?.value.trim()||"";
 const symptom=$("#demoIncidentSymptom")?.value.trim()||"";
 if(window.ESTA_PROJECT_STORE?.isPilot?.()&&window.ESTA_VALIDATION){
  const vr=window.ESTA_VALIDATION.validate("incident",{date,area,symptom});
  if(!window.ESTA_VALIDATION.notify(vr))return;
 }
 const severity=$("#demoIncidentSeverity")?.value||"Trung bình";
 const status=$("#demoIncidentStatus")?.value||"Mới";
 const asset_id=$("#demoIncidentAsset")?.value||null;
 const cause=$("#demoIncidentCause")?.value.trim()||"";
 const solution=$("#demoIncidentSolution")?.value.trim()||"";
 const contractor_id=$("#demoIncidentContractor")?.value||null;
 const cost=Math.max(0,Number($("#demoIncidentCost")?.value||0));
 const originalBeforeRefs=Array.isArray(existing?.before_images)?existing.before_images:[];
 const originalAfterRefs=Array.isArray(existing?.after_images)?existing.after_images:[];
 if(!area){toast("Vui lòng nhập khu vực / vị trí");$("#demoIncidentArea")?.focus();return}
 if(!symptom){toast("Vui lòng nhập hiện tượng sự cố");$("#demoIncidentSymptom")?.focus();return}
 const code=existing?.incident_code||("SC-"+String(buildingId||"DA").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/Đ/g,"D").replace(/đ/g,"d").replace(/[^A-Za-z0-9]/g,"")+"-"+String(Date.now()).slice(-4));
 const incidentId=existing?.id||(crypto.randomUUID?crypto.randomUUID():String(Date.now()));
 const beforeFiles=[...demoIncidentBeforeFiles],afterFiles=[...demoIncidentAfterFiles];
 const btn=$("#demoIncidentSaveBtn");if(btn){btn.disabled=true;btn.textContent=(beforeFiles.length||afterFiles.length)?"Đang tải ảnh...":"Đang lưu..."}
 let newBeforeRefs=[],newAfterRefs=[],saved=false;
 try{
  if(beforeFiles.length)newBeforeRefs=await uploadMediaFiles(beforeFiles,"incident-before",incidentId,(done,total)=>{
    if(btn)btn.textContent="Ảnh trước "+done+"/"+total+"...";
  },buildingId);
  if(afterFiles.length)newAfterRefs=await uploadMediaFiles(afterFiles,"incident-after",incidentId,(done,total)=>{
    if(btn)btn.textContent="Ảnh sau "+done+"/"+total+"...";
  },buildingId);
  const payload={
   area,asset_id,contractor_id,
   severity:["Thấp","Trung bình","Cao","Khẩn cấp"].includes(severity)?severity:"Trung bình",
   status:["Mới","Theo dõi","Đang xử lý","Đã đóng"].includes(status)?status:"Mới",
   symptom,cause,solution,cost,
   before_images:[...demoIncidentExistingBeforeRefs,...newBeforeRefs],
   after_images:[...demoIncidentExistingAfterRefs,...newAfterRefs],
   updated_at:new Date().toISOString()
  };
  if(editing){
   // created_at remains the original creation timestamp; detected_at is editable as the operational start date.
   payload.detected_at=new Date(date+"T12:00:00").toISOString();
   await demoPatch("incidents","id=eq."+demoQs(incidentId)+"&building_id=eq."+demoQs(buildingId),payload);
  }else{
   await demoPost("incidents",{
    id:incidentId,building_id:buildingId,incident_code:code,
    detected_at:new Date(date+"T12:00:00").toISOString(),
    ...payload
   });
  }
  saved=true;
  if(editing){
   const removedRefs=[
    ...originalBeforeRefs.filter(ref=>!demoIncidentExistingBeforeRefs.includes(ref)),
    ...originalAfterRefs.filter(ref=>!demoIncidentExistingAfterRefs.includes(ref))
   ];
   if(removedRefs.length)deleteStoredMediaRefs(removedRefs).catch(()=>{});
  }
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoCloseIncidentModal();
  resetDemoIncidentFiles();
  demoEditingIncidentId="";
  await demoLoad(true);
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoSelectedIncident=String(incidentId);
  demoRenderIncidents();
  demoRenderHomeOps();
  toast(editing?"Đã cập nhật Sự cố / Defect":((demoUseIncidentStartDate()?"Đã ghi nhận defect":"Đã thêm "+code)+(newBeforeRefs.length||newAfterRefs.length?" · kèm hình ảnh":"")));
 }catch(err){
  if(!saved&&(newBeforeRefs.length||newAfterRefs.length))await deleteStoredMediaRefs([...newBeforeRefs,...newAfterRefs]);
  if(String(currentBuilding?.id||"")===buildingId)toast(err.message||"Không thể lưu sự cố");
 }finally{
  if(btn&&String(currentBuilding?.id||"")===buildingId){btn.disabled=false;btn.textContent=editing?"Lưu thay đổi":"Lưu sự cố"}
 }
}
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!$("#demoIncidentModal")?.classList.contains("hide"))demoCloseIncidentModal();
});

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
 const buildingId=String(currentBuilding?.id||"");if(!buildingId)return;
 const ins=demoCache.inspections.find(x=>String(x.id)===String(id));if(!ins)return;
 const bad=(ins.items||[]).find(x=>x.result!=="Đạt");
 const assignee=projectPeople?.[0]?.name||currentAccount?.display_name||currentAccount?.username||me||"Kỹ thuật dự án";
 const taskId=Date.now(),due=new Date();due.setDate(due.getDate()+3);
 let obj={id:taskId,d:today(),c:"Khắc phục checklist · "+(bad?.item||ins.template_name),t:"Bảo trì",s:"Đang thực hiện",n:(bad?.note||ins.recommendation||""),a:assignee,performers:[assignee],imgs:[],i:0,priority:bad?.result==="Không đạt"?"Cao":"Trung bình",dueDate:due.toLocaleDateString("en-CA"),dueDateExplicit:true,assetId:ins.asset_id||"",incidentCode:"",inspectionCode:ins.inspection_code,contractorId:"",materials:[],result:""};
 try{
  const syncResult=await syncTaskRecord("upsert_task",obj,buildingId);
  if(syncResult?.item)obj={...obj,...syncResult.item};
  let projectTasks=[];try{projectTasks=JSON.parse(localStorage.getItem(taskStorageKeyFor(buildingId))||"[]")}catch(e){}
  localStorage.setItem(taskStorageKeyFor(buildingId),JSON.stringify([obj,...projectTasks.filter(x=>String(x.id)!==String(taskId))]));
  await demoPatch("inspections","id=eq."+demoQs(id)+"&building_id=eq."+demoQs(buildingId),{related_task_ids:[...new Set([...(ins.related_task_ids||[]),String(taskId)])],updated_at:new Date().toISOString()});
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoCache.loaded=false;await demoLoad(true);
  if(String(currentBuilding?.id||"")!==buildingId)return;
  render();showModule("work");toast("Đã tạo công việc từ checklist");
 }catch(e){
  if(String(currentBuilding?.id||"")===buildingId)toast(e.message||"Không thể tạo công việc từ checklist");
 }
};
function demoInspectionHtml(ins){
 const items=ins.items||[];
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>'+esc(ins.template_name)+'</title><style>@page{size:A4;margin:20mm}body{font-family:Arial;color:#243746;font-size:11px}h1{text-align:center;color:#173d58}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cfd8de;padding:7px}th{background:#173d58;color:white}.sign{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:40px;text-align:center}.space{height:70px}</style></head><body data-pdf-report="inspection"><h1>BÁO CÁO KIỂM TRA - '+esc(ins.template_name.toUpperCase())+'</h1><p><b>'+esc(ins.period_label)+'</b> · '+esc(currentBuilding.name)+'</p><table><tr><th>STT</th><th>Hạng mục</th><th>Tiêu chuẩn</th><th>Kết quả</th><th>Ghi chú</th></tr>'+items.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.item)+'</td><td>'+esc(x.standard||"")+'</td><td>'+esc(x.result||"")+'</td><td>'+esc(x.note||"")+'</td></tr>').join("")+'</table><h3>Kết luận / Kiến nghị</h3><p>'+esc(ins.result_status)+' · '+esc(ins.recommendation||"")+'</p><div class="sign"><div><b>NGƯỜI KIỂM TRA (KT)</b><div class="space"></div>Họ tên: ____________</div><div><b>NGƯỜI KIỂM SOÁT (KST)</b><div class="space"></div>Họ tên: ____________</div></div></body></html>';
}
window.demoExportInspection=id=>{const ins=demoCache.inspections.find(x=>String(x.id)===String(id));if(ins)downloadReportPdf(demoInspectionHtml(ins),"BaoCao_KiemTra_"+ins.inspection_code+".pdf")};
window.demoAddChecklist=async()=>{
 await demoLoad();
 const modal=$("#demoChecklistModal");if(!modal)return;
 $("#demoChecklistName").value="";
 $("#demoChecklistDate").value=today();
 $("#demoChecklistPeriod").value="Kiểm tra bổ sung";
 $("#demoChecklistOverall").value="Cần chú ý";
 $("#demoChecklistItem").value="";
 $("#demoChecklistStandard").value="";
 $("#demoChecklistItemResult").value="Cần chú ý";
 $("#demoChecklistItemNote").value="";
 $("#demoChecklistRecommendation").value="";
 const assetSelect=$("#demoChecklistAsset");
 if(assetSelect){
  assetSelect.innerHTML='<option value="">Không gắn thiết bị</option>'+demoCache.assets.map(a=>'<option value="'+esc(a.id)+'">'+esc((a.code?a.code+" · ":"")+a.name)+'</option>').join("");
  assetSelect.value="";
 }
 modal.classList.remove("hide");
 document.body.classList.add("demoChecklistModalOpen");
 setTimeout(()=>$("#demoChecklistName")?.focus(),60);
};

window.demoCloseChecklistModal=()=>{
 $("#demoChecklistModal")?.classList.add("hide");
 document.body.classList.remove("demoChecklistModalOpen");
};

window.demoSubmitChecklist=async e=>{
 e?.preventDefault();
 const buildingId=String(currentBuilding?.id||"");if(!buildingId)return;
 const name=$("#demoChecklistName")?.value.trim()||"";
 const inspection_date=$("#demoChecklistDate")?.value||today();
 const period_label=$("#demoChecklistPeriod")?.value.trim()||"Kiểm tra bổ sung";
 const asset_id=$("#demoChecklistAsset")?.value||null;
 const result_status=$("#demoChecklistOverall")?.value||"Cần chú ý";
 const item=$("#demoChecklistItem")?.value.trim()||"";
 if(window.ESTA_PROJECT_STORE?.isPilot?.()&&window.ESTA_VALIDATION){
  const vr=window.ESTA_VALIDATION.validate("checklist",{name,date:inspection_date,item});
  if(!window.ESTA_VALIDATION.notify(vr))return;
 }
 const standard=$("#demoChecklistStandard")?.value.trim()||"";
 const itemResult=$("#demoChecklistItemResult")?.value||"Cần chú ý";
 const note=$("#demoChecklistItemNote")?.value.trim()||"";
 const recommendation=$("#demoChecklistRecommendation")?.value.trim()||"";
 if(!name){toast("Vui lòng nhập tên checklist");$("#demoChecklistName")?.focus();return}
 if(!item){toast("Vui lòng nhập nội dung kiểm tra");$("#demoChecklistItem")?.focus();return}
 const code="KT-"+String(buildingId||"DA").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/Đ/g,"D").replace(/đ/g,"d").replace(/[^A-Za-z0-9]/g,"")+"-"+String(Date.now()).slice(-4);
 const btn=$("#demoChecklistSaveBtn");if(btn){btn.disabled=true;btn.textContent="Đang lưu..."}
 try{
  await demoPost("inspections",{
   building_id:buildingId,
   inspection_code:code,
   template_name:name,
   inspection_date,
   period_label,
   asset_id,
   result_status:["Đạt","Cần chú ý","Cần khắc phục","Không đạt"].includes(result_status)?result_status:"Cần chú ý",
   recommendation,
   items:[{
    item,
    standard,
    result:["Đạt","Cần chú ý","Cần khắc phục","Không đạt"].includes(itemResult)?itemResult:"Cần chú ý",
    note
   }],
   related_task_ids:[]
  });
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoCloseChecklistModal();
  demoCache.loaded=false;await demoLoad(true);
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoSelectedInspection="";
  demoRenderInspections();
  demoRenderHomeOps();
  toast("Đã tạo "+code);
 }catch(err){
  if(String(currentBuilding?.id||"")===buildingId)toast(err.message||"Không thể lưu checklist");
 }finally{
  if(btn&&String(currentBuilding?.id||"")===buildingId){btn.disabled=false;btn.textContent="Lưu checklist"}
 }
};

document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!$("#demoChecklistModal")?.classList.contains("hide"))demoCloseChecklistModal();
});

window.demoSelectDocument=id=>{demoSelectedDocument=id;demoRenderDocuments()};
function demoDocumentFileSize(bytes){
 const n=Number(bytes)||0;
 if(n<1024)return n+" B";
 if(n<1024*1024)return (n/1024).toFixed(n<10240?1:0)+" KB";
 return (n/(1024*1024)).toFixed(n<10*1024*1024?1:0)+" MB";
}
function demoDocumentStoragePath(ref){
 const value=String(ref||"");
 return value.startsWith("docstorage:")?value.slice(11):"";
}
function demoSafeDocumentPathName(name){
 const raw=String(name||"file").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D");
 const dot=raw.lastIndexOf("."),ext=dot>0?raw.slice(dot).replace(/[^A-Za-z0-9.]/g,"").slice(0,12):"";
 const stem=(dot>0?raw.slice(0,dot):raw).replace(/[^A-Za-z0-9_-]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"tai-lieu";
 return stem+ext;
}
async function demoUploadTechnicalDocument(file,buildingId){
 if(!centralSession?.access_token)throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
 if(!file)throw new Error("Vui lòng chọn file tài liệu.");
 if(file.size>50*1024*1024)throw new Error("File vượt quá giới hạn 50 MB.");
 const uid=crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2);
 const path=storageProjectSegment(buildingId)+"/documents/"+Date.now()+"-"+uid+"-"+demoSafeDocumentPathName(file.name);
 const res=await centralAuthFetch(SB_URL+"/storage/v1/object/"+TECH_DOC_BUCKET+"/"+mediaPathUrl(path),{
  method:"POST",
  headers:{"Content-Type":file.type||"application/octet-stream","x-upsert":"false"},
  body:file
 });
 if(!res.ok){let d={};try{d=await res.json()}catch(_){}
  throw new Error(d?.message||d?.error||"Không thể tải tài liệu lên máy chủ");
 }
 return "docstorage:"+path;
}
async function demoDeleteUploadedDocument(ref){
 const path=demoDocumentStoragePath(ref);if(!path)return;
 await centralAuthFetch(SB_URL+"/storage/v1/object/"+TECH_DOC_BUCKET,{
  method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({prefixes:[path]})
 }).catch(()=>null);
}
async function demoDocumentBlob(doc){
 const path=demoDocumentStoragePath(doc?.file_ref);
 if(!path)throw new Error("Tài liệu này chưa có file đính kèm.");
 const res=await centralAuthFetch(SB_URL+"/storage/v1/object/authenticated/"+TECH_DOC_BUCKET+"/"+mediaPathUrl(path));
 if(!res.ok)throw new Error("Không thể tải file tài liệu.");
 return await res.blob();
}
window.demoOpenDocument=async(id,download=false)=>{
 const doc=demoCache.documents.find(x=>String(x.id)===String(id));if(!doc)return;
 try{
  const blob=await demoDocumentBlob(doc),url=URL.createObjectURL(blob);
  if(download){
   const a=document.createElement("a");a.href=url;a.download=doc.file_name||doc.title||"ESTA-tai-lieu";
   document.body.appendChild(a);a.click();a.remove();
  }else{
   const w=window.open(url,"_blank","noopener");
   if(!w){
    const a=document.createElement("a");a.href=url;a.download=doc.file_name||doc.title||"ESTA-tai-lieu";
    document.body.appendChild(a);a.click();a.remove();
   }
  }
  setTimeout(()=>URL.revokeObjectURL(url),60000);
 }catch(e){toast(e.message||"Không thể mở tài liệu")}
};
function demoDocumentIcon(doc){
 const type=String(doc?.mime_type||"").toLowerCase(),name=String(doc?.file_name||doc?.title||"").toLowerCase();
 if(type.includes("pdf")||name.endsWith(".pdf"))return "PDF";
 if(type.includes("image/"))return "IMG";
 if(/word|\.docx?$/.test(type+" "+name))return "DOC";
 if(/sheet|excel|\.xlsx?$/.test(type+" "+name))return "XLS";
 if(/zip|rar|7z/.test(type+" "+name))return "ZIP";
 if(/dwg|dxf/.test(name))return "CAD";
 return "FILE";
}
async function demoRenderDocuments(){
 await demoLoad();
 const all=demoCache.documents;
 const list=all.filter(x=>demoMatches([x.title,x.file_name,x.category,x.system_type,x.note,demoAsset(x.asset_id)?.name,demoContractor(x.contractor_id)?.name]));
 if((!demoSelectedDocument||!list.some(x=>String(x.id)===String(demoSelectedDocument)))&&list[0])demoSelectedDocument=list[0].id;
 const cats=["Bản vẽ","Catalogue","Manual","Biên bản","Báo giá","Bảo hành"];
 $("#demoDocCats").innerHTML=cats.map(cat=>'<div class="demoDocCat"><b>'+all.filter(x=>x.category===cat).length+'</b><span>'+cat+'</span></div>').join("");
 $("#demoDocBody").innerHTML=list.map(x=>'<tr onclick="demoSelectDocument(\''+x.id+'\')"><td><b>'+esc(x.title)+'</b><small>'+esc(x.file_name||x.note||"")+'</small></td><td>'+esc(x.category)+'</td><td>'+esc(x.system_type||"—")+'</td><td>'+esc(demoAsset(x.asset_id)?.code||"—")+'</td><td>'+esc(demoContractor(x.contractor_id)?.name||"—")+'</td><td>'+esc(new Date(x.created_at).toLocaleDateString("vi-VN"))+'</td></tr>').join("");
 const s=list.find(x=>String(x.id)===String(demoSelectedDocument))||list[0];
 if(!s){$("#demoDocDetail").innerHTML='<div class="demoPanelBody">Chưa có tài liệu.</div>';return}
 const hasFile=!!demoDocumentStoragePath(s.file_ref);
 const fileMeta=[s.file_name||"",s.file_size?demoDocumentFileSize(s.file_size):"",s.mime_type||""].filter(Boolean).join(" · ");
 $("#demoDocDetail").innerHTML=
  '<div class="demoPanelHead"><div><h2>'+esc(s.title)+'</h2><p>'+esc(s.category)+' · '+esc(s.system_type||"")+'</p></div></div>'+
  '<div class="demoPanelBody">'+
   '<div class="demoDocumentFileCard"><i>'+demoDocumentIcon(s)+'</i><div><b>'+esc(s.file_name||"Chưa có file đính kèm")+'</b><small>'+esc(fileMeta||"Hồ sơ dữ liệu cũ")+'</small></div></div>'+
   '<div class="demoDetailSection"><span>LIÊN KẾT</span><p>Thiết bị: <strong>'+esc(demoAsset(s.asset_id)?.name||"—")+'</strong><br>Nhà thầu: <strong>'+esc(demoContractor(s.contractor_id)?.name||"—")+'</strong></p></div>'+
   '<div class="demoDetailSection"><span>GHI CHÚ</span><p>'+esc(s.note||"—")+'</p></div>'+
   (hasFile?'<div class="demoDocumentActions"><button class="demoBtn primary" type="button" onclick="demoOpenDocument(\''+s.id+'\',false)">Mở tài liệu</button><button class="demoBtn" type="button" onclick="demoOpenDocument(\''+s.id+'\',true)">Tải xuống</button></div>':'<button class="demoBtn" type="button" disabled>Chưa có file đính kèm</button>')+
  '</div>';
}
function demoCloseDocumentModal(){
 $("#technicalDocumentModal")?.classList.add("hide");
 $("#technicalDocumentForm")?.reset();
 $("#technicalDocumentFileName")&&($("#technicalDocumentFileName").textContent="Chưa chọn file");
 $("#technicalDocumentError")&&($("#technicalDocumentError").textContent="");
 $("#technicalDocumentProgress")?.classList.add("hide");
}
window.demoAddDocument=async()=>{
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 await demoLoad();
 const asset=$("#technicalDocumentAsset"),contractor=$("#technicalDocumentContractor");
 if(asset)asset.innerHTML='<option value="">Không liên kết</option>'+demoCache.assets.map(x=>'<option value="'+esc(x.id)+'">'+esc((x.code?x.code+" · ":"")+x.name)+'</option>').join("");
 if(contractor)contractor.innerHTML='<option value="">Không liên kết</option>'+demoCache.contractors.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join("");
 $("#technicalDocumentModal")?.classList.remove("hide");
 setTimeout(()=>$("#technicalDocumentTitle")?.focus(),50);
};

function demoIncidentsReportHtml(){
 const rows=demoCache.incidents,useStartDate=demoUseIncidentStartDate();
 const hasCause=rows.some(x=>!!demoCauseValue(x.cause));
 const causeHead=hasCause?"<th>Nguyên nhân</th>":"";
 const bodyRows=rows.map(x=>'<tr><td>'+esc(useStartDate?demoIncidentVisibleRef(x):x.incident_code)+'</td><td>'+esc(x.area||"—")+'</td><td>'+esc(x.symptom||"—")+'</td>'+(hasCause?'<td>'+esc(demoCauseValue(x.cause)||"—")+'</td>':"")+'<td>'+esc(x.severity)+'</td><td>'+esc(x.status)+'</td></tr>').join("");
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>@page{size:A4;margin:20mm}body{font-family:Arial;color:#243746;font-size:10px}h1{text-align:center;color:#173d58}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd7de;padding:6px}th{background:#173d58;color:white}.sign{display:flex;justify-content:space-around;margin-top:40px}</style></head><body data-pdf-report="inspection"><h1>BÁO CÁO SỰ CỐ & DEFECT</h1><p>'+esc(currentBuilding.name)+' · '+esc(workReportPeriod("week").label)+'</p><table><tr><th>'+(useStartDate?'Ngày bắt đầu':'Mã')+'</th><th>Khu vực</th><th>Hiện tượng</th>'+causeHead+'<th>Mức độ</th><th>Trạng thái</th></tr>'+bodyRows+'</table><div class="sign"><div>NGƯỜI KIỂM TRA (KT)<br><br><br>Họ tên: ________</div><div>NGƯỜI KIỂM SOÁT (KST)<br><br><br>Họ tên: ________</div></div></body></html>';
}
async function demoRenderReports(){
 return window.ESTAReports.open();
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
$("#technicalDocumentFile")?.addEventListener("change",e=>{
 const file=e.target.files?.[0],label=$("#technicalDocumentFileName"),title=$("#technicalDocumentTitle"),err=$("#technicalDocumentError");
 if(err)err.textContent="";
 if(!file){if(label)label.textContent="Chưa chọn file";return}
 if(file.size>50*1024*1024){e.target.value="";if(label)label.textContent="Chưa chọn file";if(err)err.textContent="File vượt quá giới hạn 50 MB.";return}
 if(label)label.textContent=file.name+" · "+demoDocumentFileSize(file.size);
 if(title&&!title.value.trim())title.value=file.name.replace(/\.[^.]+$/,"");
});
$("#technicalDocumentModalClose")?.addEventListener("click",demoCloseDocumentModal);
$("#technicalDocumentCancel")?.addEventListener("click",demoCloseDocumentModal);
$("#technicalDocumentModal")?.addEventListener("click",e=>{if(e.target===$("#technicalDocumentModal"))demoCloseDocumentModal()});
$("#technicalDocumentForm")?.addEventListener("submit",async e=>{
 e.preventDefault();
 if(!canProjectEdit())return toast("Tài khoản này chỉ có quyền xem");
 const buildingId=String(currentBuilding?.id||"");if(!buildingId)return;
 const file=$("#technicalDocumentFile")?.files?.[0],title=String($("#technicalDocumentTitle")?.value||"").trim();
 const err=$("#technicalDocumentError"),btn=$("#technicalDocumentSubmit"),progress=$("#technicalDocumentProgress");
 if(window.ESTA_PROJECT_STORE?.isPilot?.()&&window.ESTA_VALIDATION){
  const vr=window.ESTA_VALIDATION.validate("document",{title,file});
  if(!vr.ok){if(err)err.textContent=vr.first?.message||"Dữ liệu chưa hợp lệ";window.ESTA_VALIDATION.notify(vr);return}
 }
 if(!title){if(err)err.textContent="Vui lòng nhập tên tài liệu.";return}
 if(!file){if(err)err.textContent="Vui lòng chọn file cần tải lên.";return}
 if(file.size>50*1024*1024){if(err)err.textContent="File vượt quá giới hạn 50 MB.";return}
 btn.disabled=true;progress?.classList.remove("hide");if(err)err.textContent="";
 let fileRef="";
 try{
  fileRef=await demoUploadTechnicalDocument(file,buildingId);
  await demoPost("technical_documents",{
   building_id:buildingId,
   title,
   category:$("#technicalDocumentCategory")?.value||"Khác",
   system_type:$("#technicalDocumentSystem")?.value||"Khác",
   asset_id:$("#technicalDocumentAsset")?.value||null,
   contractor_id:$("#technicalDocumentContractor")?.value||null,
   file_ref:fileRef,
   file_name:file.name,
   mime_type:file.type||"application/octet-stream",
   file_size:file.size,
   note:String($("#technicalDocumentNote")?.value||"").trim(),
   uploaded_by:currentAccount?.id||null
  });
  if(String(currentBuilding?.id||"")!==buildingId)return;
  demoCloseDocumentModal();
  demoCache.loaded=false;await demoLoad(true);
  if(String(currentBuilding?.id||"")!==buildingId)return;
  await demoRenderDocuments();
  toast("Đã tải tài liệu lên kho dự án");
 }catch(ex){
  if(fileRef)await demoDeleteUploadedDocument(fileRef);
  if(err&&String(currentBuilding?.id||"")===buildingId)err.textContent=ex.message||"Không thể tải tài liệu.";
 }finally{
  if(String(currentBuilding?.id||"")===buildingId){btn.disabled=false;progress?.classList.add("hide")}
 }
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

window.addEventListener("esta:new10:realtime-refresh",e=>{
 const table=String(e.detail?.table||"");
 if(!demoIs()||String(currentBuilding?.id||"")!=="NEW10")return;
 if(!["incidents","inspections","technical_documents","report_registry"].includes(table))return;
 demoCache.loaded=false;
 demoLoad(true).then(()=>{
  demoPopulateWorkOptions();demoRenderHomeOps();
  const visible=DEMO_MODULES.find(n=>!$("#"+n+"Page")?.classList.contains("hide"));
  if(visible==="incident")demoRenderIncidents();
  if(visible==="inspection")demoRenderInspections();
  if(visible==="documents")demoRenderDocuments();
  if(visible==="reports")window.ESTAReports?.open?.(true);
 });
});
setTimeout(()=>{demoEnsureWorkPanel();demoSetProjectMode()},400);
})();
