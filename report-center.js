/* Authenticated report workflow; calculations live in report-model.js. */
(() => {
  "use strict";
  const M = window.ESTAReportModel;
  const page = document.getElementById("reportsPage");
  if (!page || !M) return;
  const q = (s) => page.querySelector(s);
  const escape = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const state = { buildingId: "", buildingName: "", data: null, range: M.range("month"), draft: "month", selected: new Set(["work", "incident", "inspection"]), loading: false, busy: false, sequence: 0, model: null, loadedAt: "" };
  const paths = {
    clipboard: "M8 5H5v16h14V5h-3M9 3h6v4H9zM8 12h8M8 16h6",
    alert: "M12 3 2 21h20L12 3zM12 9v5M12 17v1",
    check: "M9 3h6v4H9zM7 5H4v16h16V5h-3M8 13l3 3 5-6",
    bolt: "m13 2-8 12h6l-1 8 9-13h-6l1-7z",
    drop: "M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13z",
    sun: "M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
    box: "m3 7 9-5 9 5v10l-9 5-9-5V7zm0 0 9 5 9-5M12 12v10M7 4l10 5",
    tool: "M14 3a6 6 0 0 0-5 9L3 18a2 2 0 0 0 3 3l6-6a6 6 0 0 0 9-7l-4 4-4-4 4-4-3-1z",
    gear: "M9 3h6l1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2 1-4zm6 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    building: "M4 22V3h12v19M16 9h4v13M8 7h4M8 11h4M8 15h4M8 22v-3h4v3",
  };
  const icon = (name) => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + paths[name] + '"/></svg>';
  const available = () => M.modules.filter(m => m.id !== "energy_xlnt" || ["DEMO", "68PĐL"].includes(state.buildingId));
  function message(value, error = false) { q("#rcMessage").textContent = value; q("#rcMessage").classList.toggle("is-error", error); }
  function buttons() {
    const disabled = state.loading || state.busy || !state.data || !state.selected.size || !(state.model?.count || state.model?.schedule.length);
    q("#demoReportCombinedExport").disabled = disabled;
    q("#rcPrint").disabled = disabled;
    q("#rcRefresh").disabled = state.loading || state.busy;
    q("#demoReportCombinedExport").textContent = state.busy ? "Đang tạo PDF…" : "Xuất PDF tổng hợp";
    q("#rcPreview").setAttribute("aria-busy", String(state.loading));
  }
  function moduleList() {
    q("#demoReportModuleGrid").innerHTML = available().map(m => {
      const count = state.model?.allSections.find(s => s.id === m.id)?.count;
      return '<label class="rc-module"><input type="checkbox" value="' + m.id + '" ' + (state.selected.has(m.id) ? "checked" : "") + '>' + icon(m.icon) + '<span><b>' + m.title + '</b><small>' + m.description + '</small></span><span class="rc-count" aria-label="Số bản ghi">' + (count ?? "—") + '</span></label>';
    }).join("");
    q("#demoReportSelectedCount").textContent = state.selected.size + " hạng mục";
  }
  function table(section) {
    return '<div class="rc-table-wrap"><table><thead><tr>' + section.columns.map(c => '<th scope="col">' + escape(c) + '</th>').join("") + '</tr></thead><tbody>' + (section.rows.length ? section.rows.map(row => '<tr>' + row.map(cell => '<td>' + (cell && typeof cell === "object" ? '<span class="rc-badge ' + escape(cell.tone) + '">' + escape(cell.text) + '</span>' : escape(cell)) + '</td>').join("") + '</tr>').join("") : '<tr><td colspan="' + section.columns.length + '">Chưa có dữ liệu trong phạm vi báo cáo.</td></tr>') + '</tbody></table></div>';
  }
  function history() {
    const search = (document.getElementById("globalSearch")?.value || "").trim().toLocaleLowerCase("vi-VN");
    const reports = (state.data?.reports || []).filter(x => [x.report_code, x.report_type, x.period_label, x.file_name].some(v => String(v || "").toLocaleLowerCase("vi-VN").includes(search))).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    q("#rcHistoryCount").textContent = reports.length + " báo cáo";
    q("#demoReportBody").innerHTML = reports.length ? reports.map(x => '<tr>' + [x.report_code, x.report_type, x.period_label, M.date(x.created_at), x.file_name || "—"].map(v => '<td>' + escape(v) + '</td>').join("") + '</tr>').join("") : '<tr><td colspan="5">' + (search ? "Không tìm thấy báo cáo phù hợp." : "Chưa có báo cáo đã phát hành.") + '</td></tr>';
  }
  function render() {
    if (!state.data) { moduleList(); buttons(); return; }
    const model = M.build(state.data, state.range, [...state.selected], { buildingId: state.buildingId });
    state.model = model;
    moduleList(); history(); buttons();
    q("#rcRangeHint").textContent = "Đang hiển thị: " + M.date(state.range.from) + " – " + M.date(state.range.to) + " · PDF xuất đúng khoảng thời gian này.";
    q("#rcRangeHint").classList.remove("is-error");
    if (!state.selected.size) { q("#rcPreview").innerHTML = '<div class="rc-empty"><h3>Chọn nội dung cần báo cáo</h3><p>Đánh dấu ít nhất một hạng mục ở bên trái để xem trước.</p></div>'; return; }
    const withPhotos = q("#rcIncludePhotos").checked;
    const photoCount = withPhotos ? model.photos.length : 0;
    const author = currentAccount?.display_name || "Chưa cập nhật người lập";
    const kpis = [
      [model.count, "BẢN GHI", model.sections.length + " hạng mục đã chọn"],
      [model.taskCount === null ? "—" : model.done, "HOÀN THÀNH", model.taskCount === null ? "Chưa chọn Công việc" : "Trong " + model.taskCount + " công việc của kỳ"],
      [photoCount, "ẢNH ĐÍNH KÈM", withPhotos ? "Theo các bản ghi đã chọn" : "Đã tắt đính kèm ảnh"],
    ];
    const chart = model.taskCount ? '<div class="rc-task-chart" role="img" aria-label="' + model.done + ' hoàn thành, ' + model.pending + ' chưa hoàn thành"><span class="done" style="width:' + (model.done / model.taskCount * 100) + '%"></span><span class="pending" style="width:' + (model.pending / model.taskCount * 100) + '%"></span></div><p class="rc-chart-caption">' + model.done + ' hoàn thành · ' + model.pending + ' đang thực hiện / chờ xử lý</p>' : '';
    const health = model.health.map(x => '<div class="rc-summary-row"><span>' + escape(x.label) + '</span><span class="rc-badge ' + x.tone + '">' + escape(x.text) + '</span></div>').join("");
    const energy = model.energyTotals.length ? '<h4 class="rc-section-title"><span>02</span> Chênh lệch năng lượng đã ghi nhận</h4>' + model.energyTotals.map(x => '<div class="rc-summary-row"><span>' + escape(x.label) + '</span><b>' + escape(x.value) + ' ' + x.unit + '</b></div>').join("") + '<p class="rc-chart-caption">Tính từ chênh lệch hợp lệ tại các ngày ghi số trong kỳ, gồm mốc liền trước kỳ nếu có. Dấu “—” nghĩa là chưa đủ mốc để tính.</p>' : '';
    const details = model.sections.map(s => '<details class="rc-detail"><summary>' + escape(s.title) + ' · ' + s.count + ' bản ghi</summary><p class="rc-placeholder" style="padding:10px 14px">' + escape(s.scope) + '</p>' + table(s) + '</details>').join("");
    const schedule = model.schedule.length ? '<details class="rc-detail"><summary>Lịch bảo trì hiện tại · ' + model.schedule.length + ' thiết bị</summary><p class="rc-placeholder" style="padding:10px 14px">Lịch mới nhất tại ngày lập, không đại diện trạng thái thiết bị trong quá khứ.</p>' + table({ columns: ["Thiết bị", "Hạn tiếp theo", "Kế hoạch"], rows: model.schedule.map(x => [x.name, x.due, x.status]) }) + '</details>' : '';
    const notes = model.notes.length ? '<ul>' + model.notes.map(n => '<li><b>' + escape(n.source) + ':</b> ' + escape(n.text) + '</li>').join("") + '</ul>' : '<p>Chưa có ghi chú, tồn tại hoặc kiến nghị được nhập cho các bản ghi đã chọn.</p>';
    q("#rcPreview").innerHTML = '<header class="rc-preview-header"><div class="rc-brand"><div class="estaPetalLogo" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div><div><b>ESTA</b><small>PROPERTY MANAGEMENT</small></div></div><div class="rc-document-label"><strong>XEM TRƯỚC BÁO CÁO</strong><br>' + escape(model.period) + '</div></header>' +
      '<div class="rc-preview-title"><h3>BÁO CÁO VẬN HÀNH KỸ THUẬT</h3><p>' + escape(state.buildingName) + '</p></div>' +
      '<dl class="rc-metadata"><div><dt>DỰ ÁN</dt><dd>' + escape(state.buildingId) + '</dd></div><div><dt>THỜI GIAN BÁO CÁO</dt><dd>' + M.date(state.range.from) + ' – ' + M.date(state.range.to) + '</dd></div><div><dt>NGÀY LẬP</dt><dd>' + M.date(M.localDay()) + '</dd></div><div><dt>NGƯỜI LẬP</dt><dd>' + escape(author) + '</dd></div></dl>' +
      '<div class="rc-kpis">' + kpis.map(([n, label, desc]) => '<div class="rc-kpi"><span>' + label + '</span><b>' + n + '</b><small>' + desc + '</small></div>').join("") + '</div>' +
      '<h4 class="rc-section-title"><span>01</span> Nội dung & trạng thái</h4>' + model.sections.map(s => '<div class="rc-summary-row"><span>' + escape(s.title) + '<small>' + escape(s.scope) + '</small></span><b>' + s.count + ' bản ghi</b></div>').join("") + chart + health + energy +
      '<h4 class="rc-section-title">Chi tiết theo hạng mục</h4>' + details + schedule +
      '<h4 class="rc-section-title">Ghi chú, tồn tại & kiến nghị</h4><div class="rc-notes">' + notes + '</div>' +
      (photoCount ? '<details class="rc-detail" id="rcPhotoDetails"><summary>Ảnh hiện trường · ' + photoCount + ' ảnh</summary><div class="rc-photos" id="rcPhotoGrid" style="padding:14px"></div></details>' : '') +
      '<footer class="rc-preview-footer"><span>ESTA PROPERTY MANAGEMENT</span><span>' + model.count + ' bản ghi · ' + photoCount + ' ảnh<br>Số trang được đánh khi xuất PDF</span></footer>';
    q("#rcPhotoDetails")?.addEventListener("toggle", event => { if (event.target.open) showPhotos(); });
  }
  function showPhotos() {
    const box = q("#rcPhotoGrid"); if (!box || box.childElementCount || !state.model) return;
    box.innerHTML = state.model.photos.map(p => '<figure class="rc-photo">' + mediaImgHtml(p.ref, "rc-photo-img") + '<figcaption>' + escape(p.caption) + '</figcaption></figure>').join("");
    hydrateMediaImages(box);
  }
  async function readRows(table, buildingId, order = "id.asc") {
    let result = [], offset = 0;
    for (;;) {
      const rows = await sbFetch("/rest/v1/" + table + "?select=*&building_id=eq." + encodeURIComponent(buildingId) + "&order=" + order + "&limit=500&offset=" + offset, { token: centralSession?.access_token });
      if (!Array.isArray(rows)) throw new Error("Không nhận được dữ liệu " + table);
      result.push(...rows); if (rows.length < 500) return result;
      offset += rows.length;
    }
  }
  async function open(force = true) {
    const buildingId = String(currentBuilding?.id || ""); if (!buildingId || !centralSession?.access_token) return;
    if (state.buildingId !== buildingId) {
      state.buildingId = buildingId; state.buildingName = currentBuilding.name || buildingId; state.data = null;
      state.range = M.range("month"); state.draft = "month"; state.selected = new Set(["work", "incident", "inspection"]);
      q("#rcMonth").value = state.range.from.slice(0, 7); chooseRange("month", false);
    }
    if (state.data && !force) { render(); return; }
    const seq = ++state.sequence;
    state.loading = true; state.model = null; state.data = null;
    history();
    q("#rcPreview").innerHTML = '<div class="rc-empty"><h3>Đang tải dữ liệu báo cáo</h3><p>Đang đối chiếu các hạng mục của ' + escape(state.buildingName) + '.</p></div>';
    message("Đang lấy dữ liệu mới nhất của dự án…"); buttons(); moduleList();
    const sources = { incidents: "incidents", inspections: "inspections", assets: "maintenance_assets", maintenance: "maintenance_records", materials: "inventory_materials", transactions: "inventory_material_transactions", tools: "inventory_tools", contractors: "contractors", jobs: "contractor_jobs", reports: "report_registry" };
    try {
      const entries = await Promise.all([projectSync("get", {}, buildingId).then(r => ["snapshot", r.snapshot || { tasks: [], energy: [] }]), ...Object.entries(sources).map(async ([key, table]) => [key, await readRows(table, buildingId)])]);
      if (seq !== state.sequence || buildingId !== String(currentBuilding?.id)) return;
      state.data = Object.fromEntries(entries); state.loadedAt = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
      message("Đã cập nhật lúc " + state.loadedAt + " · Dữ liệu của " + state.buildingName + ".");
    } catch (e) {
      if (seq !== state.sequence) return;
      message("Chưa tải đủ dữ liệu báo cáo. Nhấn Làm mới dữ liệu để thử lại. " + (e.message || ""), true);
      q("#rcPreview").innerHTML = '<div class="rc-empty"><h3>Chưa thể tổng hợp báo cáo</h3><p>Vui lòng tải lại dữ liệu để tránh xuất báo cáo thiếu hạng mục.</p></div>';
    } finally { if (seq === state.sequence) { state.loading = false; render(); buttons(); } }
  }
  function chooseRange(kind, apply = true) {
    state.draft = kind;
    page.querySelectorAll("[data-demo-report-range]").forEach(b => { const active = b.dataset.demoReportRange === kind; b.classList.toggle("active", active); b.setAttribute("aria-pressed", String(active)); });
    q("#rcMonthField").classList.toggle("hide", kind !== "month"); q("#rcMonth").required = kind === "month";
    q("#demoReportCustomDates").classList.toggle("hide", kind !== "custom");
    for (const id of ["#demoReportFrom", "#demoReportTo"]) q(id).required = kind === "custom";
    if (kind === "custom") { q("#demoReportFrom").value = state.range.from; q("#demoReportTo").value = state.range.to; }
    if (kind === "month" && !q("#rcMonth").value) q("#rcMonth").value = M.localDay().slice(0, 7);
    if (apply && ["today", "week"].includes(kind)) applyRange();
  }
  function applyRange(event) {
    event?.preventDefault();
    let next;
    if (state.draft === "custom") next = { from: q("#demoReportFrom").value, to: q("#demoReportTo").value, kind: "custom" };
    else { const ref = state.draft === "month" ? q("#rcMonth").value + "-01" : M.localDay(); if (!/^\d{4}-\d{2}-\d{2}$/.test(ref)) return; next = M.range(state.draft, ref); }
    if (!M.validRange(next)) { q("#rcRangeHint").textContent = "Ngày kết thúc phải từ ngày bắt đầu trở đi. Báo cáo vẫn giữ kỳ đã áp dụng trước đó."; q("#rcRangeHint").classList.add("is-error"); return; }
    state.range = next; render();
  }
  function selectAll(value) { state.selected = new Set(value ? available().map(m => m.id) : []); render(); }
  async function exportPdf() {
    if (state.busy || state.loading || !(state.model?.count || state.model?.schedule.length) || state.buildingId !== String(currentBuilding?.id)) return;
    const buildingId = state.buildingId, buildingName = state.buildingName, model = state.model;
    const author = currentAccount?.display_name || "Chưa cập nhật người lập", createdBy = currentAccount?.id;
    const editable = canProjectEdit();
    const filename = pdfSafeFilename("ESTA_" + buildingId + "_BaoCaoVanHanh_" + model.range.from + "_" + model.range.to) + ".pdf";
    const payload = { report_type: "operations", building: buildingName, building_id: buildingId, report_date: M.date(M.localDay()), prepared_by: author, period_label: model.period, range: model.range, sections: model.sections, health: model.health, schedule: model.schedule, notes: model.notes, energy_totals: model.energyTotals, photos: q("#rcIncludePhotos").checked ? model.photos : [], photo_layout: q("#rcPhotoLayout").value, counts: { records: model.count, tasks: model.taskCount, done: model.done } };
    state.busy = true; buttons(); message("Đang tạo PDF gồm " + model.sections.length + " hạng mục và " + payload.photos.length + " ảnh…");
    try {
      const res = await centralAuthFetch("/api/esta_report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const error = await res.json().catch(() => ({})); throw new Error(error.error || "Không thể tạo PDF (" + res.status + ")"); }
      const blob = await res.blob(); if (!blob.size || !blob.type.includes("pdf")) throw new Error("Máy chủ chưa trả về file PDF hợp lệ");
      const url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      const missing = Number(res.headers.get("X-ESTA-Missing-Images") || 0);
      let result = missing ? "Đã tải PDF. Có " + missing + " ảnh chưa tải được; vị trí ảnh được ghi rõ trong PDF." : "Đã tải PDF · " + model.count + " bản ghi · " + payload.photos.length + " ảnh.";
      if (editable) {
        try {
          const record = { building_id: buildingId, report_code: "BC-" + buildingId + "-" + Date.now().toString(36).toUpperCase(), report_type: "Vận hành kỹ thuật", period_label: model.period, period_from: model.range.from, period_to: model.range.to, file_name: filename, created_by: createdBy };
          await sbFetch("/rest/v1/report_registry", { method: "POST", token: centralSession?.access_token, body: record });
          if (state.buildingId === buildingId && state.data) { state.data.reports.unshift({ ...record, created_at: new Date().toISOString() }); history(); }
        } catch (e) { result += " Chưa lưu được lịch sử xuất; file PDF đã tải thành công."; }
      }
      message(result, missing > 0);
    } catch (e) { message("Xuất PDF chưa thành công: " + e.message + ". Bạn có thể dùng In báo cáo hoặc thử lại.", true); }
    finally { state.busy = false; buttons(); }
  }
  async function printReport() {
    if (!(state.model?.count || state.model?.schedule.length) || state.busy || state.loading) return;
    const details = [...q("#rcPreview").querySelectorAll("details")];
    const previous = details.map(d => d.open);
    details.forEach(d => d.open = true); showPhotos();
    await hydrateMediaImages(q("#rcPreview"));
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForReportImages(document);
    const restore = () => details.forEach((d, i) => d.open = previous[i]);
    window.addEventListener("afterprint", restore, { once: true });
    window.print();
  }
  page.querySelectorAll("[data-demo-report-range]").forEach(b => b.addEventListener("click", () => chooseRange(b.dataset.demoReportRange)));
  q("#rcPeriodForm").addEventListener("submit", applyRange);
  q("#rcRefresh").addEventListener("click", () => open(true));
  q("#rcSelectAll").addEventListener("click", () => selectAll(true));
  q("#rcSelectNone").addEventListener("click", () => selectAll(false));
  q("#demoReportModuleGrid").addEventListener("change", e => { if (e.target.matches('input[type="checkbox"]')) { if (e.target.checked) state.selected.add(e.target.value); else state.selected.delete(e.target.value); render(); } });
  q("#rcIncludePhotos").addEventListener("change", render);
  q("#demoReportCombinedExport").addEventListener("click", exportPdf);
  q("#rcPrint").addEventListener("click", printReport);
  window.ESTAReports = { open, renderHistory: history };
  window.demoReportSelectAll = selectAll;
  window.demoExportSelectedReports = exportPdf;
})();
