(() => {
  "use strict";
  const VIEW_KEY="esta:new10:saved-work-view:v1";
  let palette=null,notice=null;

  function pilot(){
    try{return window.ESTA_PROJECT_STORE?.isPilot?.()&&!!projectOverviewActive}catch(_){return false}
  }
  const modules=[
    ["work","Công việc","Theo dõi và cập nhật công việc"],
    ["energy","Năng lượng","Điện, nước và chỉ số"],
    ["inventory","Dụng cụ - Vật tư","Tồn kho và dụng cụ"],
    ["maintenance","Bảo trì thiết bị","Lịch và hồ sơ bảo trì"],
    ["contractor","Nhà thầu","Danh bạ và công việc nhà thầu"],
    ["construction","Vật tư thi công","Theo dõi vật tư thi công"],
    ["incident","Sự cố","Sự cố và defect"],
    ["inspection","Checklist","Kiểm tra định kỳ"],
    ["documents","Tài liệu","Tài liệu kỹ thuật"],
    ["reports","Báo cáo","Trung tâm báo cáo"]
  ];
  function ensurePalette(){
    if(palette)return palette;
    palette=document.createElement("div");
    palette.id="new10CommandPalette";
    palette.className="new10CommandPalette hide";
    palette.innerHTML='<button class="new10CommandBackdrop" type="button" aria-label="Đóng"></button><section role="dialog" aria-modal="true" aria-label="Điều hướng nhanh"><header><span>⌘</span><input id="new10CommandSearch" autocomplete="off" placeholder="Tìm trang hoặc thao tác…"><kbd>Esc</kbd></header><div id="new10CommandList"></div><footer><span>↑↓ chọn</span><span>Enter mở</span><span>Ctrl/⌘ K</span></footer></section>';
    document.body.appendChild(palette);
    palette.querySelector(".new10CommandBackdrop").onclick=closePalette;
    palette.querySelector("#new10CommandSearch").addEventListener("input",renderPalette);
    palette.addEventListener("click",e=>{
      const btn=e.target.closest("[data-new10-command]");if(!btn)return;
      runCommand(btn.dataset.new10Command);
    });
    return palette;
  }
  function commands(){
    return [
      ...modules.map(([id,title,desc])=>({id:"module:"+id,title,desc})),
      {id:"action:add-task",title:"Thêm công việc",desc:"Mở Công việc và nhập nội dung mới"},
      {id:"action:report",title:"Xuất báo cáo",desc:"Mở Trung tâm báo cáo"},
      {id:"action:filter",title:"Mở bộ lọc",desc:"Mở bộ lọc Công việc"},
      {id:"action:sync",title:"Đồng bộ ngay",desc:"Flush dữ liệu và ảnh đang chờ"}
    ];
  }
  function renderPalette(){
    const p=ensurePalette(),input=p.querySelector("#new10CommandSearch"),box=p.querySelector("#new10CommandList");
    const q=String(input.value||"").trim().toLocaleLowerCase("vi-VN");
    const rows=commands().filter(x=>!q||(x.title+" "+x.desc).toLocaleLowerCase("vi-VN").includes(q));
    box.innerHTML=rows.length?rows.map((x,i)=>'<button type="button" data-new10-command="'+x.id+'" class="'+(i===0?"active":"")+'"><b>'+escapeHtml(x.title)+'</b><small>'+escapeHtml(x.desc)+'</small><span>›</span></button>').join(""):'<div class="new10CommandEmpty">Không tìm thấy thao tác phù hợp.</div>';
  }
  function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function openPalette(){
    if(!pilot())return;
    const p=ensurePalette();p.classList.remove("hide");
    const input=p.querySelector("#new10CommandSearch");input.value="";renderPalette();
    setTimeout(()=>input.focus(),20);
  }
  function closePalette(){palette?.classList.add("hide")}
  async function runCommand(id){
    closePalette();
    if(id.startsWith("module:")){showModule(id.slice(7));return}
    if(id==="action:add-task"){showModule("work");setTimeout(()=>document.getElementById("content")?.focus(),40);return}
    if(id==="action:report"){showModule("reports");return}
    if(id==="action:filter"){showModule("work");setTimeout(()=>document.getElementById("toggleFilter")?.click(),30);return}
    if(id==="action:sync"){
      window.ESTA_PROJECT_STORE?.setStatus?.("syncing","Đồng bộ thủ công");
      await Promise.allSettled([window.ESTA_SYNC_QUEUE?.flush?.(),window.ESTA_MEDIA_MANAGER?.flush?.()]);
      return;
    }
  }
  function filterState(){
    const o={};
    for(const id of ["quickRange","filterType","filterStatus","fromDate","toDate","search"]){
      const el=document.getElementById(id);if(el)o[id]=el.value||"";
    }
    try{o.workStatFilter=workStatFilter||""}catch(_){}
    return o;
  }
  function saveView(){
    if(!pilot())return;
    localStorage.setItem(VIEW_KEY,JSON.stringify(filterState()));
    try{toast("Đã lưu bộ lọc của tôi")}catch(_){}
    syncSavedViewButtons();
  }
  function loadView(){
    if(!pilot())return;
    let data=null;try{data=JSON.parse(localStorage.getItem(VIEW_KEY)||"null")}catch(_){}
    if(!data){try{toast("Chưa có bộ lọc đã lưu")}catch(_){};return}
    for(const [id,value] of Object.entries(data)){
      if(id==="workStatFilter"){try{workStatFilter=value||""}catch(_){};continue}
      const el=document.getElementById(id);if(el)el.value=value||"";
    }
    try{render();window.ESTA_NEW10_PILOT?.verify?.saveFilters?.()}catch(_){}
    syncSavedViewButtons();
    try{toast("Đã áp dụng bộ lọc đã lưu")}catch(_){}
  }
  function syncSavedViewButtons(){
    const heading=document.querySelector("#filterBar .workFilterHeading");if(!heading||heading.querySelector(".new10SavedViewActions"))return;
    const wrap=document.createElement("div");wrap.className="new10SavedViewActions";
    wrap.innerHTML='<button type="button" data-new10-save-view title="Lưu bộ lọc hiện tại">★ Lưu</button><button type="button" data-new10-load-view title="Áp dụng bộ lọc đã lưu">↻ Đã lưu</button>';
    heading.insertBefore(wrap,heading.querySelector("#closeWorkFilter"));
    wrap.querySelector("[data-new10-save-view]").onclick=saveView;
    wrap.querySelector("[data-new10-load-view]").onclick=loadView;
  }
  function alerts(){
    const out=[],today=new Date().toISOString().slice(0,10);
    try{
      const tasks=typeof load==="function"?load():[];
      const overdue=tasks.filter(x=>x.s!=="Đã hoàn thành"&&x.dueDate&&x.dueDate<today);
      if(overdue.length)out.push({tone:"danger",title:overdue.length+" công việc quá hạn",module:"work",desc:"Cần rà soát hạn hoàn thành"});
    }catch(_){}
    try{
      const mats=Array.isArray(inventoryMaterials)?inventoryMaterials.filter(x=>!x.archived_at):[];
      const low=mats.filter(m=>typeof inventoryStock==="function"&&inventoryStock(m)<=Number(m.min_qty||0));
      if(low.length)out.push({tone:"warn",title:low.length+" vật tư tồn thấp",module:"inventory",desc:"Kiểm tra kế hoạch nhập kho"});
    }catch(_){}
    try{
      const assets=Array.isArray(maintenanceAssets)?maintenanceAssets:[];
      const due=assets.filter(a=>a.next_due_date&&a.next_due_date<=today&&a.status!=="Ngừng sử dụng");
      if(due.length)out.push({tone:"warn",title:due.length+" thiết bị đến hạn",module:"maintenance",desc:"Kiểm tra lịch bảo trì"});
    }catch(_){}
    const q=window.ESTA_SYNC_QUEUE?.count?.()||0;
    if(q)out.push({tone:"info",title:q+" thay đổi chờ đồng bộ",module:"work",desc:"Hệ thống sẽ tự gửi khi mạng ổn định"});
    return out;
  }
  function ensureNotice(){
    if(notice)return notice;
    notice=document.createElement("div");notice.id="new10NotificationCenter";notice.className="new10NotificationCenter hide";
    notice.innerHTML='<button class="new10NoticeBackdrop" type="button" aria-label="Đóng"></button><aside role="dialog" aria-modal="true" aria-label="Trung tâm cảnh báo"><header><div><small>NEW 1.0</small><h2>Trung tâm cảnh báo</h2></div><button type="button" data-new10-close-notice>×</button></header><div id="new10NoticeList"></div></aside>';
    document.body.appendChild(notice);
    notice.querySelector(".new10NoticeBackdrop").onclick=()=>notice.classList.add("hide");
    notice.querySelector("[data-new10-close-notice]").onclick=()=>notice.classList.add("hide");
    notice.addEventListener("click",e=>{
      const b=e.target.closest("[data-new10-alert-module]");if(!b)return;
      notice.classList.add("hide");showModule(b.dataset.new10AlertModule);
    });
    return notice;
  }
  function refreshNotices(){
    if(!pilot())return;
    const rows=alerts(),n=ensureNotice(),box=n.querySelector("#new10NoticeList");
    box.innerHTML=rows.length?rows.map(x=>'<button type="button" data-new10-alert-module="'+x.module+'" data-tone="'+x.tone+'"><i></i><span><b>'+escapeHtml(x.title)+'</b><small>'+escapeHtml(x.desc)+'</small></span><em>›</em></button>').join(""):'<div class="new10NoticeEmpty"><b>Không có cảnh báo cần xử lý</b><span>Dữ liệu NEW10 đang ở trạng thái bình thường.</span></div>';
    const bell=document.querySelector(".headerBell");if(bell){
      if(!bell.classList.contains("new10Bell"))bell.classList.add("new10Bell");
      const dot=bell.querySelector("i");if(dot){
        const nextText=rows.length?String(rows.length):"";
        if(dot.textContent!==nextText)dot.textContent=nextText;
        const shouldHide=!rows.length;
        if(dot.classList.contains("hide")!==shouldHide)dot.classList.toggle("hide",shouldHide);
      }
    }
  }
  function openNotice(){if(!pilot())return;refreshNotices();ensureNotice().classList.remove("hide")}
  function onKey(e){
    if(!pilot())return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();palette?.classList.contains("hide")===false?closePalette():openPalette();return}
    if(e.key==="Escape"){closePalette();notice?.classList.add("hide");return}
    if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement?.tagName||"")){e.preventDefault();document.getElementById("globalSearch")?.focus()}
    if(palette&&!palette.classList.contains("hide")&&(e.key==="ArrowDown"||e.key==="ArrowUp")){
      e.preventDefault();const items=[...palette.querySelectorAll("[data-new10-command]")];if(!items.length)return;
      let i=items.findIndex(x=>x.classList.contains("active"));items.forEach(x=>x.classList.remove("active"));
      i=e.key==="ArrowDown"?(i+1)%items.length:(i-1+items.length)%items.length;items[i].classList.add("active");items[i].scrollIntoView({block:"nearest"});
    }
    if(palette&&!palette.classList.contains("hide")&&e.key==="Enter"){
      const a=palette.querySelector("[data-new10-command].active");if(a){e.preventDefault();runCommand(a.dataset.new10Command)}
    }
  }
  let mutationRefreshScheduled=false;
  function scheduleMutationRefresh(){
    if(mutationRefreshScheduled)return;
    mutationRefreshScheduled=true;
    requestAnimationFrame(()=>{
      mutationRefreshScheduled=false;
      if(!pilot())return;
      syncSavedViewButtons();
      refreshNotices();
    });
  }
  function boot(){
    ensurePalette();ensureNotice();syncSavedViewButtons();refreshNotices();
    document.addEventListener("keydown",onKey);
    document.addEventListener("click",e=>{
      if(e.target.closest(".headerBell")&&pilot()){e.preventDefault();e.stopImmediatePropagation();openNotice()}
    },true);
    window.addEventListener("esta:new10:queue",refreshNotices);
    window.addEventListener("esta:new10:media-queue",refreshNotices);
    window.addEventListener("esta:new10:sync-status",refreshNotices);
    setInterval(()=>{if(pilot())refreshNotices()},30000);
    new MutationObserver(scheduleMutationRefresh).observe(document.getElementById("app"),{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.ESTA_PRODUCTIVITY=Object.freeze({openPalette,openNotice,saveView,loadView,refreshNotices});
})();