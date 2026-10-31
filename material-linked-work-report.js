/* ESTA: Tra cứu công việc theo vật tư và xuất PDF kèm ảnh.
 * Pilot release: only project 130HH, until approved for other buildings.
 * Reads only the selected project's cached tasks and inventory materials.
 * This module never writes task, stock, or material records.
 */
(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const norm = (v) => String(v ?? "").trim().toLocaleLowerCase("vi-VN");
  const arr = (v) => Array.isArray(v) ? v : [];
  let selectedMaterialIds = new Set();
  let selectedTaskIds = new Set();
  let modalProjectId = "";
  const SUPPORTED_PROJECTS = new Set(["130HH","127HH"]);

  function projectId() { return String(typeof currentBuilding !== "undefined" ? currentBuilding?.id || "" : ""); }
  function isSupportedProject() { return SUPPORTED_PROJECTS.has(projectId().toUpperCase()); }
  function projectName() { return String(typeof currentBuilding !== "undefined" ? currentBuilding?.name || projectId() : projectId() || "Dự án"); }
  function materials() { return arr(typeof inventoryMaterials !== "undefined" ? inventoryMaterials : []).filter(m => !m.archived_at); }
  function tasks() {
    try {
      return typeof load === "function" ? arr(load()) : [];
    } catch (_) { return []; }
  }
  function linked(task, material) {
    const taskMaterials = arr(task?.materials).some(item => {
      const id = String(item?.materialId || item?.material_id || item?.id || "");
      const name = norm(item?.name || item?.material_name || "");
      return (id && id === String(material?.id || "")) || (!!name && name === norm(material?.name));
    });
    const transactions = arr(typeof inventoryTransactions !== "undefined" ? inventoryTransactions : []);
    const transactionLink = transactions.some(tx =>
      String(tx?.source_task_id || "") === String(task?.id || "") &&
      String(tx?.source_type || "") === "work_task" &&
      String(tx?.material_id || "") === String(material?.id || "") &&
      String(tx?.tx_type || "") === "out"
    );
    return taskMaterials || transactionLink;
  }
  function selectedMaterials() { return materials().filter(m => selectedMaterialIds.has(String(m.id))); }
  function linkedTasks() {
    const chosen = selectedMaterials();
    if (!chosen.length) return [];
    // Index material transactions once per render instead of rescanning the
    // entire transaction history for every task/material pair (avoids UI jank).
    const txPairs = new Set();
    for (const tx of arr(typeof inventoryTransactions !== "undefined" ? inventoryTransactions : [])) {
      if (String(tx?.source_type || "") !== "work_task" || String(tx?.tx_type || "") !== "out") continue;
      const taskId = String(tx?.source_task_id || ""), materialId = String(tx?.material_id || "");
      if (taskId && materialId) txPairs.add(taskId + "::" + materialId);
    }
    const chosenIds = new Set(chosen.map(m => String(m.id || "")));
    const chosenNames = new Set(chosen.map(m => norm(m.name)));
    return tasks().filter(task => {
      const taskId = String(task?.id || "");
      const inlineMatch = arr(task?.materials).some(item => {
        const id = String(item?.materialId || item?.material_id || item?.id || "");
        const name = norm(item?.name || item?.material_name || "");
        return (id && chosenIds.has(id)) || (name && chosenNames.has(name));
      });
      return inlineMatch || chosen.some(m => txPairs.has(taskId + "::" + String(m.id || "")));
    });
  }
  function ensureStyles() {
    if ($("#estaMaterialWorkReportStyles")) return;
    const style = document.createElement("style");
    style.id = "estaMaterialWorkReportStyles";
    style.textContent = `
      #estaMaterialWorkReportLaunch{display:inline-flex;align-items:center;gap:7px;margin:8px 0;padding:9px 12px;border:1px solid #a46427;border-radius:10px;background:#411437;color:#f5ecd0;font-weight:750;cursor:pointer}
      /* Four-project report: readable, tappable controls on shared ESTA themes. */
      #inventoryPage #estaMaterialWorkReportLaunch{display:inline-flex!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:10!important;align-items:center!important;justify-content:center!important;min-height:44px!important;max-width:100%!important;white-space:normal!important;line-height:1.4!important;text-align:center!important;font-size:14px!important;font-weight:750!important;background:#173b56!important;color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;border:2px solid #246e90!important;box-shadow:0 2px 8px rgba(9,33,52,.16)!important;pointer-events:auto!important}
      #estaMaterialWorkReportModal .emwr-actions button,#estaMaterialWorkReportModal .emwr-tools button{display:inline-flex!important;visibility:visible!important;align-items:center!important;justify-content:center!important;min-height:44px!important;font-size:14px!important;line-height:1.4!important;white-space:normal!important;opacity:1!important;color:#173b56!important;-webkit-text-fill-color:#173b56!important;background:#ffffff!important;border:1px solid #7897ad!important;cursor:pointer!important}
      #estaMaterialWorkReportModal .emwr-actions button.emwr-primary{background:#173b56!important;color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;border-color:#173b56!important}
      #estaMaterialWorkReportModal .emwr-actions button:disabled,#estaMaterialWorkReportModal .emwr-tools button:disabled{opacity:.55!important;cursor:not-allowed!important}
      #estaMaterialWorkReportModal .emwr-close{color:#173b56!important;-webkit-text-fill-color:#173b56!important}
      @media(max-width:480px){#inventoryPage #estaMaterialWorkReportLaunch{width:100%!important;font-size:13px!important}#estaMaterialWorkReportModal .emwr-actions>div{display:flex;flex-wrap:wrap;gap:8px}}
      #estaMaterialWorkReportModal{position:fixed;inset:0;z-index:1200;background:rgba(20,14,22,.58);display:flex;align-items:center;justify-content:center;padding:12px}#estaMaterialWorkReportModal .emwr-card[data-page="people"] #emwrTaskPage{display:none}#estaMaterialWorkReportModal .emwr-card[data-page="tasks"] #emwrExportOptions{display:none!important}
      #estaMaterialWorkReportModal[hidden]{display:none!important}
      #estaMaterialWorkReportModal .emwr-card{width:min(760px,100%);max-height:min(88dvh,900px);overflow:auto;background:#f5ecd0;color:#30262c;border:1px solid #a99586;border-radius:16px;box-shadow:0 18px 55px #0004;padding:16px}
      #estaMaterialWorkReportModal .emwr-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      #estaMaterialWorkReportModal h2{font-size:19px;margin:0 0 5px;color:#411437}
      #estaMaterialWorkReportModal .emwr-export-options{margin-top:12px;padding:12px;border:1px solid #a99586;border-radius:10px;background:#fff8ea}#estaMaterialWorkReportModal .emwr-export-options h3{margin:0 0 6px;color:#411437;font-size:16px}#estaMaterialWorkReportModal .emwr-export-options>label{display:block;margin:9px 0;font-weight:650}#estaMaterialWorkReportModal #emwrManualPerformer{box-sizing:border-box;width:100%;min-width:0;font-size:16px;padding:10px;border:1px solid #a99586;border-radius:8px;background:#fff;color:#30262c}
      #estaMaterialWorkReportModal .emwr-muted{font-size:12px;color:#625045;margin:0 0 12px}
      #estaMaterialWorkReportModal .emwr-close{font-size:24px;line-height:1;border:0;background:transparent;color:#411437;cursor:pointer}
      #estaMaterialWorkReportModal .emwr-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}
      #estaMaterialWorkReportModal #emwrMaterialSearch{box-sizing:border-box;width:100%;min-width:0;font-size:16px;line-height:1.35;margin-top:8px;padding:10px 12px;border:1px solid #a99586;border-radius:9px;background:#fffaf0;color:#30262c;touch-action:manipulation}
      #estaMaterialWorkReportModal .emwr-materials{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px}
      #estaMaterialWorkReportModal .emwr-material{display:flex;align-items:flex-start;gap:8px;padding:9px;border:1px solid #d2c2ae;border-radius:9px;background:#fffaf0;font-size:12px}
      #estaMaterialWorkReportModal .emwr-material input{accent-color:#411437;flex:none;margin-top:2px}
      @media(max-width:480px){#estaMaterialWorkReportModal .emwr-materials{grid-template-columns:1fr}}
      #estaMaterialWorkReportModal .emwr-jobs{display:grid;gap:8px}
      #estaMaterialWorkReportModal .emwr-job{display:flex;align-items:flex-start;gap:10px;padding:10px;border:1px solid #d2c2ae;border-radius:10px;background:#fffaf0}
      #estaMaterialWorkReportModal .emwr-job input{width:18px;height:18px;flex:none;margin-top:2px;accent-color:#411437}
      #estaMaterialWorkReportModal .emwr-job strong{display:block;font-size:13px}
      #estaMaterialWorkReportModal .emwr-job small{display:block;margin-top:4px;color:#625045;font-size:11px}
      #estaMaterialWorkReportModal .emwr-actions{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-top:14px}
      #estaMaterialWorkReportModal .emwr-actions button,#estaMaterialWorkReportModal .emwr-tools button{border:1px solid #a46427;border-radius:9px;padding:9px 12px;background:#fffaf0;color:#411437;font-weight:700;cursor:pointer}
      #estaMaterialWorkReportModal .emwr-actions .emwr-primary{background:#411437;color:#f5ecd0}
      #estaMaterialWorkReportModal button:disabled{opacity:.45;cursor:not-allowed}
      @media(max-width:640px){#estaMaterialWorkReportModal{padding:8px;align-items:flex-end}#estaMaterialWorkReportModal .emwr-card{max-height:92dvh;padding:13px;border-radius:14px}#estaMaterialWorkReportModal h2{font-size:17px}}
    `;
    document.head.appendChild(style);
  }
  function ensureUI() {
    const inventoryPage = $("#inventoryPage");
    if (inventoryPage) inventoryPage.classList.toggle("inventoryRef130", isSupportedProject());
    inventoryPage.classList.toggle("inventoryRef127", projectId().toUpperCase() === "127HH");
    const current = projectId().toUpperCase();
    if (modalProjectId && modalProjectId !== current) {
      selectedMaterialIds.clear();
      selectedTaskIds.clear();
      const open = $("#estaMaterialWorkReportModal");
      if (open) open.hidden = true;
      modalProjectId = "";
    }
    if (!isSupportedProject()) {
      $("#estaMaterialWorkReportLaunch")?.remove();
      const modal = $("#estaMaterialWorkReportModal");
      if (modal) modal.hidden = true;
      return;
    }
    ensureStyles();
    let launch = $("#estaMaterialWorkReportLaunch");
    if (!launch) {
      launch = document.createElement("button");
      launch.type = "button";
      launch.id = "estaMaterialWorkReportLaunch";
      launch.textContent = "▤ Công việc theo vật tư · Xuất PDF";
      launch.addEventListener("click", openModal);
      const page = $("#inventoryPage");
      const anchor = page?.querySelector(".inventorySwitchBar");
      if (page && anchor) anchor.insertAdjacentElement("afterend", launch);
    }
    if (!$("#estaMaterialWorkReportModal")) {
      const modal = document.createElement("div");
      modal.id = "estaMaterialWorkReportModal";
      modal.hidden = true;
      modal.innerHTML = `
        <section class="emwr-card" role="dialog" aria-modal="true" aria-labelledby="emwrTitle">
          <div class="emwr-head"><div><h2 id="emwrTitle">Công việc liên kết với vật tư</h2><p class="emwr-muted" id="emwrProject"></p></div><button class="emwr-close" type="button" aria-label="Đóng">×</button></div>
          <div id="emwrTaskPage"><label for="emwrMaterial"><strong>Chọn nhiều vật tư</strong></label>
          <input id="emwrMaterialSearch" type="search" placeholder="Tìm vật tư theo tên hoặc mã…" autocomplete="off" aria-label="Tìm vật tư"><div class="emwr-tools"><button type="button" id="emwrMaterialClear">Bỏ chọn vật tư</button><span id="emwrMaterialCount" class="emwr-muted">0 vật tư được chọn</span></div><div id="emwrMaterial" class="emwr-materials" aria-label="Danh sách vật tư"></div>
          <div class="emwr-tools"><button type="button" id="emwrSelectAll">Chọn tất cả</button><button type="button" id="emwrClear">Bỏ chọn</button><span id="emwrCount" class="emwr-muted">0 công việc</span></div>
          <div id="emwrJobs" class="emwr-jobs"><p class="emwr-muted">Chọn vật tư để xem công việc đã liên kết.</p></div></div>
          <section id="emwrExportOptions" hidden class="emwr-export-options"><h3>Người thực hiện trên báo cáo</h3><p>Chọn Kỹ thuật để lấy tên từ danh sách nhân sự của dự án, hoặc tự điền tên.</p><label><input type="radio" name="emwrPerformerMode" value="technical" checked> Kỹ thuật – chọn tên trong dự án</label><div id="emwrProjectPeople" class="emwr-materials"></div><label><input type="radio" name="emwrPerformerMode" value="manual"> Tự điền tên</label><input id="emwrManualPerformer" type="text" placeholder="Nhập tên người thực hiện…" autocomplete="name"><div class="emwr-tools"><button type="button" id="emwrBackToTasks">Quay lại chọn công việc</button></div></section><div class="emwr-actions"><span id="emwrStatus" class="emwr-muted" role="status" aria-live="polite"></span><div><button type="button" class="emwr-close">Đóng</button> <button type="button" id="emwrExport" class="emwr-primary" disabled>Xuất PDF kèm ảnh</button></div></div>
        </section>`;
      modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
      modal.querySelectorAll(".emwr-close").forEach(b => b.addEventListener("click", closeModal));
      $("#emwrMaterial", modal).addEventListener("change", e => {
        const input = e.target.closest("input[data-material-id]");
        if (!input) return;
        const id = input.dataset.materialId;
        if (input.checked) selectedMaterialIds.add(id); else selectedMaterialIds.delete(id);
        updateMaterialCount(); renderJobs();
      });
      $("#emwrMaterialSearch", modal).addEventListener("input", renderMaterials);
      $("#emwrMaterialClear", modal).addEventListener("click", () => {
        selectedMaterialIds = new Set(); selectedTaskIds = new Set();
        renderMaterials(); renderJobs(); updateMaterialCount();
      });
      $("#emwrSelectAll", modal).addEventListener("click", () => { selectedTaskIds=new Set(linkedTasks().map(t=>String(t.id))); renderJobs(); });
      $("#emwrClear", modal).addEventListener("click", () => { selectedTaskIds=new Set(); renderJobs(); });
      $("#emwrExport", modal).addEventListener("click", () => { if ($("#emwrExportOptions").hidden) { showExportOptions(); modal.querySelector(".emwr-card").dataset.page="people"; } else exportReport(); });
      $("#emwrBackToTasks", modal).addEventListener("click", () => { $("#emwrExportOptions").hidden=true; modal.querySelector(".emwr-card").dataset.page="tasks"; $("#emwrExport").textContent="Tiếp tục: chọn người thực hiện"; });
      modal.querySelectorAll('input[name="emwrPerformerMode"]').forEach(input=>input.addEventListener("change", updatePerformerMode));
      document.body.appendChild(modal);
    }
  }
  async function openModal() {
    if (!isSupportedProject()) { closeModal(); return; }
    const openingProject = projectId();
    if (!openingProject) { if (typeof toast === "function") toast("Vui lòng chọn dự án trước."); return; }
    // Guard against showing stock cached from the previously visited building.
    if (typeof loadInventoryData === "function" && typeof inventoryLoadedBuilding !== "undefined" &&
        String(inventoryLoadedBuilding) !== openingProject) {
      try { await loadInventoryData(openingProject); }
      catch (error) { console.warn("Material report inventory load failed", error); }
      if (projectId() !== openingProject) return;
      if (String(inventoryLoadedBuilding) !== openingProject) {
        if (typeof toast === "function") toast("Chưa tải được vật tư của dự án. Vui lòng thử lại.");
        return;
      }
    }
    if (projectId() !== openingProject) return;
    modalProjectId = openingProject.toUpperCase();
    selectedMaterialIds = new Set();
    selectedTaskIds = new Set();
    $("#emwrProject").textContent = "Dự án hiện tại: " + projectName() + " · Chỉ đọc dữ liệu của dự án này";
    const select = $("#emwrMaterial");
    renderMaterials();
    $("#emwrExportOptions").hidden=true; $("#estaMaterialWorkReportModal .emwr-card").dataset.page="tasks"; $("#emwrExport").textContent="Tiếp tục: chọn người thực hiện";
    $("#emwrJobs").innerHTML = '<p class="emwr-muted">Chọn vật tư để xem công việc đã liên kết.</p>';
    $("#emwrCount").textContent = "0 công việc";
    $("#emwrStatus").textContent = "";
    $("#emwrExport").disabled = true;
    $("#estaMaterialWorkReportModal").hidden = false;
    $("#emwrMaterialSearch").value=""; updateMaterialCount();
  }
  function renderMaterials() {
    const host=$("#emwrMaterial");
    if(!host)return;
    const q=norm($("#emwrMaterialSearch")?.value||"");
    const list=materials().filter(m=>!q||norm(m.name).includes(q)||norm(m.code).includes(q));
    host.innerHTML=list.map(m=>'<label class="emwr-material"><input type="checkbox" data-material-id="'+esc(m.id)+'"'+(selectedMaterialIds.has(String(m.id))?" checked":"")+'><span><strong>'+esc(m.name)+'</strong>'+(m.code?'<small> · '+esc(m.code)+'</small>':'')+'</span></label>').join("")||'<p class="emwr-muted">Không tìm thấy vật tư phù hợp.</p>';
  }
  function updateMaterialCount(){const el=$("#emwrMaterialCount");if(el)el.textContent=selectedMaterialIds.size+" vật tư được chọn";}
  function closeModal() { const modal=$("#estaMaterialWorkReportModal"); if(modal) modal.hidden=true; }
  function renderJobs() {
    const chosen=selectedMaterials(), rows=linkedTasks(), host=$("#emwrJobs");
    if (!chosen.length) {
      host.innerHTML='<p class="emwr-muted">Chọn vật tư để xem công việc đã liên kết.</p>';
      $("#emwrCount").textContent="0 công việc"; $("#emwrExport").disabled=true; return;
    }
    const validIds=new Set(rows.map(t=>String(t.id)));
    selectedTaskIds=new Set([...selectedTaskIds].filter(id=>validIds.has(id)));
    if (!rows.length) host.innerHTML='<p class="emwr-muted">Chưa có công việc nào ghi nhận hoặc liên kết với vật tư này trong dự án hiện tại.</p>';
    else host.innerHTML=rows.map(t=>{
      const id=String(t.id), checked=selectedTaskIds.has(id)?" checked":"";
      const photos=arr(t.imgs).filter(Boolean).length;
      return '<label class="emwr-job"><input type="checkbox" data-emwr-task="'+esc(id)+'"'+checked+'><span><strong>'+esc(t.c||"Công việc không có tiêu đề")+'</strong><small>'+esc(t.d||"Chưa có ngày")+' · '+esc(t.s||"Chưa có trạng thái")+' · '+photos+' ảnh</small></span></label>';
    }).join("");
    host.querySelectorAll("[data-emwr-task]").forEach(input=>input.addEventListener("change",()=>{
      const id=input.dataset.emwrTask;
      if(input.checked)selectedTaskIds.add(id);else selectedTaskIds.delete(id);
      updateCount();
    }));
    updateCount();
  }
  function updateCount() {
    const count=selectedTaskIds.size;
    $("#emwrCount").textContent=count+" công việc được chọn";
    $("#emwrExport").disabled=count===0;
  }
  function showExportOptions() {
    const modal=$("#estaMaterialWorkReportModal");
    const host=$("#emwrProjectPeople");
    const names=[...new Set((Array.isArray(projectPeople)?projectPeople:[]).map(p=>String(p?.name||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"vi"));
    host.innerHTML=names.map(name=>'<label class="emwr-material"><input type="checkbox" data-export-person="'+esc(name)+'"><span>'+esc(name)+'</span></label>').join("")||'<p class="emwr-muted">Dự án chưa có danh sách nhân sự. Vui lòng thêm tên trong Cài đặt nhân sự hoặc chọn Tự điền.</p>';
    $("#emwrExportOptions").hidden=false;
    $("#emwrExport").textContent="Xuất PDF";
    updatePerformerMode();
  }
  function updatePerformerMode() {
    const mode=$('input[name="emwrPerformerMode"]:checked')?.value||"technical";
    const people=$("#emwrProjectPeople"), manual=$("#emwrManualPerformer");
    if(people) { people.style.opacity=mode==="technical"?"1":".45"; people.style.pointerEvents=mode==="technical"?"auto":"none"; people.setAttribute("aria-disabled",mode!=="technical"?"true":"false"); }
    if(manual) { manual.disabled=mode!=="manual"; manual.style.opacity=mode==="manual"?"1":".45"; }
  }
  async function exportReport() {
    if (!isSupportedProject() || modalProjectId !== projectId().toUpperCase()) { closeModal(); return; }
    const mode=$('input[name="emwrPerformerMode"]:checked')?.value||"technical";
    let performer="";
    if(mode==="manual") performer=$("#emwrManualPerformer")?.value.trim()||"";
    else performer=[...$("#emwrProjectPeople").querySelectorAll("input[data-export-person]:checked")].map(input=>input.dataset.exportPerson).join(", ");
    if(!performer){ $("#emwrStatus").textContent=mode==="manual"?"Vui lòng nhập tên người thực hiện.":"Vui lòng chọn ít nhất một kỹ thuật viên của dự án."; return; }
    const chosen=selectedMaterials(), selected=linkedTasks().filter(t=>selectedTaskIds.has(String(t.id)));
    if (modalProjectId !== projectId().toUpperCase()) { closeModal(); return; }
    if(!chosen.length||!selected.length)return;
    if(typeof window.exportGenericEstaPdf!=="function"){ $("#emwrStatus").textContent="Chức năng PDF chưa sẵn sàng. Vui lòng tải lại trang."; return; }
    const photos=[], seenPhotos=new Set();
    for(const task of selected) for(const path of arr(task.imgs).filter(Boolean)) {
      const key=String(path);
      if(seenPhotos.has(key))continue;
      seenPhotos.add(key);
      photos.push({path:key,caption:String(task.c||"Công việc")+" · "+projectName()});
    }
    const columns=[
      {key:"date",label:"Ngày",width:62},
      {key:"task",label:"Công việc",width:150},
      {key:"performer",label:"Người thực hiện",width:95},
      {key:"status",label:"Trạng thái",width:78},
      {key:"material",label:"Vật tư",width:100},
      {key:"quantity",label:"Số lượng",width:60},
      {key:"result",label:"Kết quả / ghi chú",width:150}
    ];
    const rows=selected.map(t=>{
      const inline=arr(t.materials).filter(item=>chosen.some(material=>{
        const id=String(item?.materialId||item?.material_id||item?.id||"");
        const name=norm(item?.name||item?.material_name||"");
        return (id&&id===String(material.id))|| (!!name&&name===norm(material.name));
      }));
      const txs=arr(typeof inventoryTransactions!=="undefined"?inventoryTransactions:[]).filter(tx=>
        String(tx?.source_task_id||"")===String(t.id||"") &&
        String(tx?.source_type||"")==="work_task" &&
        String(tx?.tx_type||"")==="out" &&
        chosen.some(material=>String(tx?.material_id||"")===String(material.id))
      );
      const inlineNames=inline.map(item=>item.name||item.material_name||chosen.find(m=>String(m.id)===String(item.materialId||item.material_id||item.id))?.name).filter(Boolean);
      const txNames=txs.map(tx=>chosen.find(m=>String(m.id)===String(tx.material_id))?.name).filter(Boolean);
      const qty=inline.reduce((sum,item)=>sum+(Number(item?.qty??item?.quantity??item?.used_qty)||0),0)+txs.reduce((sum,tx)=>sum+(Number(tx?.qty)||0),0);
      const performers=Array.isArray(t?.performers)?t.performers:String(t?.a||t?.performer||"").split(",");
      return {date:String(t.d||""),task:String(t.c||""),performer:performer,status:String(t.s||""),material:[...new Set([...inlineNames,...txNames])].join(", ")||chosen.map(m=>m.name).join(", "),quantity:qty?qty.toLocaleString("vi-VN"): "—",result:String(t.result||t.kq||t.note||"")};
    });
    $("#emwrExport").disabled=true;
    $("#emwrStatus").textContent="Đang tạo PDF · "+selected.length+" công việc · "+photos.length+" ảnh duy nhất. Nếu cần xác nhận chữ ký, vui lòng hoàn tất hộp thoại chữ ký.";
    try {
      const ok=await window.exportGenericEstaPdf({
        title:"BÁO CÁO CÔNG VIỆC THEO VẬT TƯ",
        sectionLabel:"VẬT TƯ VÀ CÔNG VIỆC LIÊN KẾT",
        tableLabel:"DANH SÁCH CÔNG VIỆC",
        subtitle:"Vật tư: "+chosen.map(m=>String(m.name||"")+(m.code?" ("+m.code+")":"")).join(", "),
        periodLabel:"DỰ ÁN "+projectName()+" · "+selected.length+" CÔNG VIỆC",
        building:projectName(),
        columns,rows:rows.map(row=>columns.map(column=>row[column.key]??"")),photos,
        signer:{name:performer,image_data_url:""}
      });
      if(ok){ $("#emwrStatus").textContent="Đã xuất PDF thành công · "+selected.length+" công việc · "+photos.length+" ảnh."; }
      else { $("#emwrStatus").textContent="Chưa xuất PDF. Kiểm tra thông báo trên màn hình."; }
    } catch(error) {
      console.error("ESTA material work report failed",error);
      $("#emwrStatus").textContent="Không xuất được PDF. Vui lòng thử lại.";
    } finally { updateCount(); }
  }
  window.estaOpenMaterialWorkReport = () => { if (!isSupportedProject()) return; ensureUI(); return openModal(); };
  function boot() {
    ensureUI();
    const observer=new MutationObserver(()=>{ ensureUI(); });
    const app=$("#app");
    if(app)observer.observe(app,{childList:true,subtree:true});
    // Do not rebuild the full jobs list on tab visibility changes: this caused scroll jumps and selection flicker.
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();