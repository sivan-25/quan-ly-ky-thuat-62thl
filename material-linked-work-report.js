/* ESTA: Tra cứu công việc theo vật tư và xuất PDF kèm ảnh.
 * Reads only the selected project's cached tasks and inventory materials.
 * This module never writes task, stock, or material records.
 */
(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const norm = (v) => String(v ?? "").trim().toLocaleLowerCase("vi-VN");
  const arr = (v) => Array.isArray(v) ? v : [];
  let selectedMaterialId = "";
  let selectedTaskIds = new Set();

  function projectId() { return String(window.currentBuilding?.id || ""); }
  function projectName() { return String(window.currentBuilding?.name || projectId() || "Dự án"); }
  function materials() { return arr(window.inventoryMaterials).filter(m => !m.archived_at); }
  function tasks() {
    try {
      const fn = window.load;
      return typeof fn === "function" ? arr(fn()) : [];
    } catch (_) { return []; }
  }
  function linked(task, material) {
    return arr(task?.materials).some(item => {
      const id = String(item?.materialId || item?.id || "");
      const name = norm(item?.name || item?.material_name || "");
      return (id && id === String(material?.id || "")) ||
        (!!name && name === norm(material?.name));
    });
  }
  function currentMaterial() {
    return materials().find(m => String(m.id) === String(selectedMaterialId)) || null;
  }
  function linkedTasks() {
    const material = currentMaterial();
    if (!material) return [];
    return tasks().filter(t => linked(t, material));
  }
  function ensureStyles() {
    if ($("#estaMaterialWorkReportStyles")) return;
    const style = document.createElement("style");
    style.id = "estaMaterialWorkReportStyles";
    style.textContent = `
      #estaMaterialWorkReportLaunch{display:inline-flex;align-items:center;gap:7px;margin:8px 0;padding:9px 12px;border:1px solid #a46427;border-radius:10px;background:#411437;color:#f5ecd0;font-weight:750;cursor:pointer}
      #estaMaterialWorkReportModal{position:fixed;inset:0;z-index:1200;background:rgba(20,14,22,.58);display:flex;align-items:center;justify-content:center;padding:12px}
      #estaMaterialWorkReportModal[hidden]{display:none!important}
      #estaMaterialWorkReportModal .emwr-card{width:min(760px,100%);max-height:min(88dvh,900px);overflow:auto;background:#f5ecd0;color:#30262c;border:1px solid #a99586;border-radius:16px;box-shadow:0 18px 55px #0004;padding:16px}
      #estaMaterialWorkReportModal .emwr-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      #estaMaterialWorkReportModal h2{font-size:19px;margin:0 0 5px;color:#411437}
      #estaMaterialWorkReportModal .emwr-muted{font-size:12px;color:#625045;margin:0 0 12px}
      #estaMaterialWorkReportModal .emwr-close{font-size:24px;line-height:1;border:0;background:transparent;color:#411437;cursor:pointer}
      #estaMaterialWorkReportModal .emwr-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:10px 0}
      #estaMaterialWorkReportModal select{width:100%;padding:10px;border:1px solid #a99586;border-radius:9px;background:#fffaf0;color:#30262c}
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
          <label for="emwrMaterial"><strong>Chọn vật tư</strong></label>
          <select id="emwrMaterial"><option value="">— Chọn vật tư —</option></select>
          <div class="emwr-tools"><button type="button" id="emwrSelectAll">Chọn tất cả</button><button type="button" id="emwrClear">Bỏ chọn</button><span id="emwrCount" class="emwr-muted">0 công việc</span></div>
          <div id="emwrJobs" class="emwr-jobs"><p class="emwr-muted">Chọn vật tư để xem công việc đã liên kết.</p></div>
          <div class="emwr-actions"><span id="emwrStatus" class="emwr-muted" role="status" aria-live="polite"></span><div><button type="button" class="emwr-close">Đóng</button> <button type="button" id="emwrExport" class="emwr-primary" disabled>Xuất PDF kèm ảnh</button></div></div>
        </section>`;
      modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
      modal.querySelectorAll(".emwr-close").forEach(b => b.addEventListener("click", closeModal));
      $("#emwrMaterial", modal).addEventListener("change", e => { selectedMaterialId=e.target.value; selectedTaskIds=new Set(); renderJobs(); });
      $("#emwrSelectAll", modal).addEventListener("click", () => { selectedTaskIds=new Set(linkedTasks().map(t=>String(t.id))); renderJobs(); });
      $("#emwrClear", modal).addEventListener("click", () => { selectedTaskIds=new Set(); renderJobs(); });
      $("#emwrExport", modal).addEventListener("click", exportReport);
      document.body.appendChild(modal);
    }
  }
  function openModal() {
    if (!projectId()) { if (window.toast) toast("Vui lòng chọn dự án trước."); return; }
    selectedMaterialId = "";
    selectedTaskIds = new Set();
    $("#emwrProject").textContent = "Dự án hiện tại: " + projectName() + " · Chỉ đọc dữ liệu của dự án này";
    const select = $("#emwrMaterial");
    select.innerHTML = '<option value="">— Chọn vật tư —</option>' + materials().map(m =>
      '<option value="' + esc(m.id) + '">' + esc(m.name) + (m.code ? " · " + esc(m.code) : "") + '</option>'
    ).join("");
    $("#emwrJobs").innerHTML = '<p class="emwr-muted">Chọn vật tư để xem công việc đã liên kết.</p>';
    $("#emwrCount").textContent = "0 công việc";
    $("#emwrStatus").textContent = "";
    $("#emwrExport").disabled = true;
    $("#estaMaterialWorkReportModal").hidden = false;
    select.focus();
  }
  function closeModal() { const modal=$("#estaMaterialWorkReportModal"); if(modal) modal.hidden=true; }
  function renderJobs() {
    const material=currentMaterial(), rows=linkedTasks(), host=$("#emwrJobs");
    if (!material) {
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
  async function exportReport() {
    const material=currentMaterial(), selected=linkedTasks().filter(t=>selectedTaskIds.has(String(t.id)));
    if(!material||!selected.length)return;
    if(typeof window.exportGenericEstaPdf!=="function"){ $("#emwrStatus").textContent="Chức năng PDF chưa sẵn sàng. Vui lòng tải lại trang."; return; }
    const photos=[];
    for(const task of selected) for(const path of arr(task.imgs).filter(Boolean)) photos.push({path,caption:String(task.c||"Công việc")+" · "+projectName()});
    const columns=[
      {key:"date",label:"Ngày",width:62},
      {key:"task",label:"Công việc",width:190},
      {key:"status",label:"Trạng thái",width:78},
      {key:"material",label:"Vật tư",width:100},
      {key:"quantity",label:"Số lượng",width:60},
      {key:"result",label:"Kết quả / ghi chú",width:150}
    ];
    const rows=selected.map(t=>{
      const linked=arr(t.materials).filter(item=>{
        const id=String(item?.materialId||item?.id||"");
        const name=norm(item?.name||item?.material_name||"");
        return (id&&id===String(material.id))|| (!!name&&name===norm(material.name));
      });
      const qty=linked.reduce((sum,item)=>sum+(Number(item?.qty)||0),0);
      return {date:String(t.d||""),task:String(t.c||""),status:String(t.s||""),material:String(material.name||""),quantity:qty?qty.toLocaleString("vi-VN"): "—",result:String(t.result||t.kq||t.note||"")};
    });
    $("#emwrExport").disabled=true;
    $("#emwrStatus").textContent="Đang tạo báo cáo và đính kèm "+photos.length+" ảnh…";
    try {
      const ok=await window.exportGenericEstaPdf({
        title:"BÁO CÁO CÔNG VIỆC THEO VẬT TƯ",
        sectionLabel:"VẬT TƯ VÀ CÔNG VIỆC LIÊN KẾT",
        tableLabel:"DANH SÁCH CÔNG VIỆC",
        subtitle:"Vật tư: "+String(material.name||"")+(material.code?" · Mã: "+material.code:"")+" · Đơn vị: "+String(material.unit||"—"),
        periodLabel:"DỰ ÁN "+projectName()+" · "+selected.length+" CÔNG VIỆC",
        building:projectName(),
        columns,rows,photos,
        signer:null
      });
      if(ok){ $("#emwrStatus").textContent="Đã gửi yêu cầu xuất PDF."; }
      else { $("#emwrStatus").textContent="Chưa xuất PDF. Kiểm tra thông báo trên màn hình."; }
    } catch(error) {
      console.error("ESTA material work report failed",error);
      $("#emwrStatus").textContent="Không xuất được PDF. Vui lòng thử lại.";
    } finally { updateCount(); }
  }
  function boot() {
    ensureUI();
    const observer=new MutationObserver(()=>{ if(!$("#estaMaterialWorkReportLaunch"))ensureUI(); });
    const app=$("#app");
    if(app)observer.observe(app,{childList:true,subtree:true});
    document.addEventListener("visibilitychange",()=>{ if(!document.hidden && $("#estaMaterialWorkReportModal")&&!$("#estaMaterialWorkReportModal").hidden){ const selected=$("#emwrMaterial")?.value; if(selected!==selectedMaterialId){selectedMaterialId=selected||"";renderJobs();} }});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();