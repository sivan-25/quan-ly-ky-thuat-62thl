/* ESTA — guided first-use workflow for project technicians. No API writes. */
(()=>{
"use strict";
const $tech=s=>document.querySelector(s);
const isTech=()=>!!currentAccount&&!currentAccount.is_admin&&!!projectOverviewActive;
const work=$tech("#workPage");
if(!work)return;
let mineFilter=false;
// Legacy work styles can override new display CSS. Update only the card in the list,
// not the same card when it is moved to the editing drawer.
function syncTechCreateGrid(){
 const form=$tech("#taskForm");
 if(!form)return;
 const active=isTech()&&work.classList.contains("techCreating")&&!!form.closest("#workPage")&&
  window.matchMedia("(min-width:761px)").matches;
 for(const [property,value] of [["grid-template-columns","repeat(3,minmax(0,1fr))"],["grid-auto-flow","row"]]){
  if(active)form.style.setProperty(property,value,"important");
  else form.style.removeProperty(property);
 }
 const fields=[
  [".workDate","1 / span 1"],[".workContent","2 / span 2"],
  [".workType","1 / span 1"],[".workStatus","2 / span 1"],
  [".workPerformer","3 / span 1"],["#techInlineResult","1 / -1"],
  [".workNote","1 / span 2"],[".workImage","3 / span 1"],
  [".workFormActions","1 / -1"]
 ];
 for(const [selector,column] of fields){
  const el=form.querySelector(selector);
  if(!el)continue;
  if(active){
   el.style.setProperty("grid-column",column,"important");
   el.style.setProperty("grid-row","auto","important");
  }else{
   el.style.removeProperty("grid-column");
   el.style.removeProperty("grid-row");
  }
 }
}
function syncTechFormVisibility(){
 syncTechCreateGrid();
 const card=work.querySelector(":scope > .workEntryCard");
 if(!card)return;
 if(isTech()&&!work.classList.contains("techCreating"))
  card.style.setProperty("display","none","important");
 else card.style.removeProperty("display");
}
function ownName(){
 const account=currentAccount||{};
 const raw=[account.display_name,account.full_name,account.name,account.username,
            typeof me==="string"?me:""];
 const people=(typeof projectPeople!=="undefined"&&Array.isArray(projectPeople)?projectPeople:[]);
 for(const candidate of raw){
  const name=String(candidate||"").trim().toLocaleLowerCase("vi-VN");
  const match=people.find(p=>String(p.name||"").trim().toLocaleLowerCase("vi-VN")===name);
  if(match)return match.name;
 }
 return "";
}
function autoOwnPerformer(){
 if(!isTech()||!ownName()||!$tech("#editId")||$tech("#editId").value)return;
 if(typeof taskSelectedPeople==="undefined"||taskSelectedPeople.length)return;
 if(!work.classList.contains("techCreating"))return;
 if(typeof setPeopleSelected==="function")setPeopleSelected("task",[ownName()]);
}
const quick=document.createElement("div");
quick.id="techWorkShortcuts";
quick.className="techWorkShortcuts hide";
quick.innerHTML='<div class="techWorkShortcutsHead"><strong>Công việc kỹ thuật</strong><small>Xem việc trước · nhập mới khi cần</small></div>'+
 '<div class="techWorkShortcutActions">'+
 '<button id="techAllWork" type="button" class="active" aria-pressed="true">Tất cả công việc</button>'+
 '<button id="techTodayWork" type="button" aria-pressed="false">Hôm nay</button>'+
 '<button id="techMineWork" type="button" aria-pressed="false">Việc của tôi</button>'+
 '<button id="techCreateWork" type="button" class="techCreateWork">＋ Thêm công việc</button>'+
 '</div><p id="techWorkNotice" class="techWorkNotice" aria-live="polite"></p>';
work.insertBefore(quick,work.firstChild);
const originalFiltered=filtered;
filtered=function(...args){
 const rows=originalFiltered.apply(this,args);
 if(!mineFilter||!isTech())return rows;
 const name=ownName();
 if(!name)return rows;
 return rows.filter(task=>
  (typeof performerArray==="function"?performerArray(task):String(task.a||"").split(","))
    .some(person=>String(person||"").trim().toLocaleLowerCase("vi-VN")===name.toLocaleLowerCase("vi-VN")));
};
function filterButtons(active){
 for(const id of ["techAllWork","techTodayWork","techMineWork"]){
  const button=$tech("#"+id);if(!button)continue;
  const on=id===active;button.classList.toggle("active",on);button.setAttribute("aria-pressed",String(on));
 }
}
$tech("#techAllWork").onclick=()=>{
 mineFilter=false;workStatFilter="";filterButtons("techAllWork");render();
};
$tech("#techTodayWork").onclick=()=>{
 mineFilter=false;workStatFilter="today";filterButtons("techTodayWork");render();
};
$tech("#techMineWork").onclick=()=>{
 const n=ownName();
 if(!n){
  $tech("#techWorkNotice").textContent="Chưa xác định được tên của bạn trong danh sách người thực hiện. Hãy nhờ quản lý đối chiếu tên tài khoản và tên trong dự án.";
  return;
 }
 $tech("#techWorkNotice").textContent="Đang hiển thị công việc của "+n;
 mineFilter=true;workStatFilter="";filterButtons("techMineWork");render();
};
$tech("#techCreateWork").onclick=()=>{
 work.classList.add("techCreating");
 syncTechFormVisibility();
 $tech("#techCreateWork").textContent="Đang thêm công việc";
 if($tech("#editId")?.value)resetForm();
 autoOwnPerformer();
 requestAnimationFrame(()=>{
   const card=work.querySelector(".workEntryCard");
   card?.scrollIntoView({behavior:"smooth",block:"start"});
   setTimeout(()=>$tech("#content")?.focus({preventScroll:true}),150);
 });
};
const originalShowModule=showModule;
showModule=function(name,...rest){
 const response=originalShowModule.call(this,name,...rest);
 if(name==="work"&&isTech()){
  work.classList.remove("techCreating");mineFilter=false;workStatFilter="";
  filterButtons("techAllWork");$tech("#techWorkNotice").textContent="";
  $tech("#techCreateWork").textContent="＋ Thêm công việc";
 }
 refreshGuided();
 syncTechFormVisibility();
 return response;
};
// Removing the inline hidden style before entering the task editor avoids an invisible drawer.
const oldEditTask=window.editTask;
if(typeof oldEditTask==="function")window.editTask=function(...args){
 const card=work.querySelector(".workEntryCard");
 card?.style.removeProperty("display");
 const result=oldEditTask.apply(this,args);
 queueMicrotask(()=>{card?.style.removeProperty("display");refreshResult()});
 return result;
};
const oldReset=resetForm;
resetForm=function(...args){
 const result=oldReset.apply(this,args);
 syncTechFormVisibility();
 return result;
};
const originalRenderPeople=renderPeopleSelector;
renderPeopleSelector=function(kind,...rest){
 const result=originalRenderPeople.call(this,kind,...rest);
 if(kind==="task")queueMicrotask(autoOwnPerformer);
 return result;
};
const origEnterAccount=window.enterAccount;
window.enterAccount=function(...args){
 const result=origEnterAccount.apply(this,args);
 setTimeout(refreshGuided,0);
 return result;
};
function refreshResult(){
 if(typeof usesSingleTaskResult!=="function"||!usesSingleTaskResult())return;
 const form=$tech("#taskForm"),result=$tech("#demoTaskResult"),status=$tech("#status");
 if(!form||!result||!status)return;
 const holder=$tech("#techInlineResult")||document.createElement("div");
 holder.id="techInlineResult";holder.className="techInlineResult";
 const peopleField=form.querySelector(".workPerformer"),statusField=form.querySelector(".workStatus");
 // The result is directly below the status/performer row, not before the
 // still-unplaced performer grid cell (which could overflow on desktop).
 if(!holder.isConnected&&(peopleField||statusField))
  (peopleField||statusField).insertAdjacentElement("afterend",holder);
 const resultField=result.closest(".demoTaskResultField");
 if(resultField && resultField.parentElement!==holder)holder.appendChild(resultField);
 const done=status.value==="Đã hoàn thành";
 const mobile=window.matchMedia("(max-width:640px)").matches;
 holder.classList.toggle("hide",!done||mobile);
 // The mobile completion field already exists in app.js and is kept unchanged.
 if(!mobile&&resultField)resultField.classList.remove("hide");
 syncTechCreateGrid();
 if(resultField){
  resultField.querySelector("#demoTaskResultLabel")?.setAttribute("title","Bắt buộc khi chọn Đã hoàn thành");
 }
}
function annotateHome(){
 if(!isTech())return;
 const home=$tech("#homePage");
 if(!home)return;
 let guide=$tech("#techFirstUseGuide");
 if(!guide){
  guide=document.createElement("section");
  guide.id="techFirstUseGuide";guide.className="techFirstUseGuide";
  guide.innerHTML='<div><strong>Bắt đầu công việc</strong><p>Vào <b>Công việc</b> để xem việc cần làm hoặc ghi nhận kết quả. Khi hoàn thành, nhập <b>KQ thực hiện</b> và đợi xác nhận Đã lưu.</p></div>'+
   '<button type="button" id="techGuideOpenTasks">Xem công việc →</button>'+
   '<details><summary>Giải thích thuật ngữ</summary><p><b>PM:</b> Bảo trì định kỳ · <b>SLA:</b> Thời hạn xử lý · <b>Work Order:</b> Công việc · <b>Asset Health:</b> Tình trạng thiết bị. Chỉ số sức khỏe cần dữ liệu đầy đủ để đánh giá chính xác.</p></details>';
  const first=home.firstElementChild;home.insertBefore(guide,first);
  guide.querySelector("#techGuideOpenTasks").onclick=()=>showModule("work");
 }
 guide.classList.remove("hide");
 // Existing dashboard rules hide dynamically inserted sections. An inline
 // important display declaration keeps the technician guide visible.
 guide.style.setProperty("display","flex","important");
 // Accessible, no numeric health score is modified.
 for(const el of home.querySelectorAll("small,span")){
  const text=(el.textContent||"").trim().toUpperCase();
  const meaning={
   "PM":"Bảo trì định kỳ",
   "SLA":"Thời hạn xử lý",
   "WORK ORDER":"Công việc kỹ thuật",
   "TECHNICAL HEALTH":"Tình trạng vận hành",
   "ASSET HEALTH":"Tình trạng thiết bị",
   "LIVE DATA":"Dữ liệu có thể được làm mới; kiểm tra thời gian cập nhật"
  }[text];
  if(meaning)el.title=meaning;
 }
}
function refreshGuided(){
 const tech=isTech();
 document.body.classList.toggle("techFirstUse",tech);
 quick.classList.toggle("hide",!tech);
 if(!tech){mineFilter=false;work.classList.remove("techCreating");$tech("#techFirstUseGuide")?.classList.add("hide");return}
 annotateHome();
 // Demo module inserts result controls lazily.
 if($tech("#demoTaskResult"))refreshResult();
 const manager=$tech("#taskPeopleOptions .peopleEmpty");
 if(manager)manager.title="Danh sách người thực hiện cần được thiết lập trước khi lưu công việc.";
}
const originalDemoSync=typeof demoSyncCompletionFields==="function"?demoSyncCompletionFields:null;
if(originalDemoSync){
 demoSyncCompletionFields=function(...args){
  const answer=originalDemoSync.apply(this,args);
  refreshResult();
  return answer;
 };
}
$tech("#status")?.addEventListener("change",()=>queueMicrotask(refreshResult));
$tech("#taskForm")?.addEventListener("submit",()=>queueMicrotask(refreshResult));
const baseHome=renderHomeDashboard;
renderHomeDashboard=function(...args){const res=baseHome.apply(this,args);annotateHome();return res};
setTimeout(()=>{refreshGuided();syncTechFormVisibility()},0);
})();
