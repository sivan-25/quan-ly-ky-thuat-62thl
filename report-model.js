/* Shared, side-effect-free report calculations. Browser and Node use the same model. */
(function (root, factory) {
  const model = factory();
  if (typeof module === "object" && module.exports) module.exports = model;
  else root.ESTAReportModel = model;
})(typeof globalThis === "object" ? globalThis : this, function () {
  "use strict";
  const modules = [
    ["work", "Công việc", "Công việc kỹ thuật trong kỳ", "clipboard"],
    ["incident", "Sự cố & Defect", "Hiện tượng, xử lý và trạng thái", "alert"],
    ["inspection", "Kiểm tra định kỳ", "Checklist và kết quả kiểm tra", "check"],
    ["energy_electric", "Chỉ số điện", "Chỉ số và chênh lệch · kWh", "bolt"],
    ["energy_water", "Chỉ số nước", "Chỉ số và chênh lệch · m³", "drop"],
    ["energy_solar", "Năng lượng mặt trời", "Sản lượng ghi nhận · kWh", "sun"],
    ["energy_xlnt", "Chỉ số XLNT", "Lưu lượng xử lý · m³", "drop"],
    ["materials", "Vật tư tiêu hao", "Tồn đầu · Nhập · Xuất · Tồn cuối", "box"],
    ["tools", "Dụng cụ kỹ thuật", "Danh mục và tình trạng hiện tại", "tool"],
    ["maintenance", "Bảo trì thiết bị", "Nhật ký trong kỳ và lịch hiện tại", "gear"],
    ["contractor", "Nhà thầu", "Công việc thực hiện trong kỳ", "building"],
  ].map(([id, title, description, icon]) => ({ id, title, description, icon }));
  const arr = (v) => Array.isArray(v) ? v : [];
  const text = (v) => v === null || v === undefined || v === "" ? "—" : String(v);
  const number = (v) => v !== "" && v !== null && v !== undefined && Number.isFinite(Number(v)) ? Number(v) : null;
  const fmt = (v) => number(v) === null ? "—" : Number(v).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  const day = (v) => /T.*(?:Z|[+-]\d{2}:?\d{2})$/.test(String(v || "")) && !Number.isNaN(Date.parse(v)) ? localDay(new Date(v)) : String(v || "").slice(0, 10);
  const date = (v) => /^\d{4}-\d{2}-\d{2}/.test(String(v || "")) ? day(v).split("-").reverse().join("/") : "—";
  const inRange = (v, range) => !!v && day(v) >= range.from && day(v) <= range.to;
  const complete = (v) => ["Đã hoàn thành", "Hoàn thành", "Đã đóng", "Đạt", "Tốt", "Đang hoạt động"].includes(v);
  function status(v) {
    const value = text(v);
    const tone = complete(value) ? "good" : ["Không đạt", "Cần khắc phục", "Hỏng", "Khẩn cấp", "Cao", "Quá hạn"].includes(value) ? "danger" : ["Cần chú ý", "Theo dõi", "Chờ xử lý", "Tạm dừng", "Ngừng sử dụng", "Cần sửa chữa", "Sắp đến hạn", "Trung bình"].includes(value) ? "watch" : value === "—" ? "muted" : "info";
    return { text: value, tone };
  }
  function localDay(now = new Date()) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  }
  function range(kind, reference = localDay()) {
    if (!validRange({ from: reference, to: reference })) return { from: "", to: "", kind };
    const d = new Date(reference + "T12:00:00Z");
    const y = d.getUTCFullYear(), m = d.getUTCMonth();
    const iso = (v) => v.toISOString().slice(0, 10);
    let from = new Date(Date.UTC(y, m, 1)), to = new Date(Date.UTC(y, m + 1, 0));
    if (kind === "today") from = to = d;
    if (kind === "week") {
      const start = new Date(d); start.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
      const end = new Date(start); end.setUTCDate(start.getUTCDate() + 6);
      if (start > from) from = start;
      if (end < to) to = end;
    }
    return { from: iso(from), to: iso(to), kind };
  }
  function validRange(r) {
    const valid = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || "") && !Number.isNaN(Date.parse(v + "T00:00:00Z")) && new Date(v + "T00:00:00Z").toISOString().slice(0, 10) === v;
    return valid(r?.from) && valid(r?.to) && r.from <= r.to;
  }
  function periodLabel(r) {
    if (r.kind === "month") return "Tháng " + r.from.slice(5, 7) + "/" + r.from.slice(0, 4);
    if (r.kind === "today" || r.from === r.to) return "Ngày " + date(r.from);
    if (r.kind === "week") {
      const first = new Date(r.from.slice(0, 7) + "-01T12:00:00Z");
      const nth = Math.floor((Number(r.from.slice(8)) - 1 + (first.getUTCDay() + 6) % 7) / 7) + 1;
      return "Tuần " + nth + " tháng " + r.from.slice(5, 7) + "/" + r.from.slice(0, 4);
    }
    return date(r.from) + " – " + date(r.to);
  }
  function energyRows(records, type, r, dual) {
    const all = arr(records).filter(x => x.type === type).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)) || Number(a.id) - Number(b.id));
    return all.map((x, i) => {
      const difference = (field) => i > 0 && number(x[field]) !== null && number(all[i - 1][field]) !== null ? number(x[field]) - number(all[i - 1][field]) : null;
      return { ...x, diff: difference("value"), diff2: dual ? difference("value2") : null };
    }).filter(x => inRange(x.date, r));
  }
  function latestRecordDate(data, selected) {
    const chosen = new Set(selected), raw = data.snapshot || {}, dates = [];
    const collect = (rows, field) => arr(rows).forEach(row => {
      const value = day(row[field]);
      if (validRange({ from: value, to: value })) dates.push(value);
    });
    if (chosen.has("work")) collect(raw.tasks, "d");
    if (chosen.has("incident")) collect(data.incidents, "detected_at");
    if (chosen.has("inspection")) collect(data.inspections, "inspection_date");
    for (const type of ["electric", "water", "solar", "xlnt"]) {
      if (chosen.has("energy_" + type)) collect(arr(raw.energy).filter(row => row.type === type), "date");
    }
    if (chosen.has("maintenance")) collect(data.maintenance, "service_date");
    if (chosen.has("contractor")) {
      collect(data.jobs, "work_date");
      collect(arr(raw.tasks).filter(row => row.contractorId), "d");
    }
    if (chosen.has("materials")) collect(data.materials, "tracking_start_date");
    return dates.sort().at(-1) || "";
  }
  function build(data, r, selected, options = {}) {
    if (!validRange(r)) throw new Error("Vui lòng chọn ngày hợp lệ; ngày kết thúc phải từ ngày bắt đầu trở đi.");
    const chosen = new Set(selected), sections = [], photos = [], notes = [];
    const raw = data.snapshot || {};
    const tasks = arr(raw.tasks).filter(x => inRange(x.d, r)).slice().sort((a, b) => String(a.d).localeCompare(String(b.d)));
    const incidents = arr(data.incidents).filter(x => inRange(x.detected_at, r));
    const inspections = arr(data.inspections).filter(x => inRange(x.inspection_date, r));
    const assets = arr(data.assets), contractors = arr(data.contractors);
    const assetName = (id) => { const a = assets.find(x => String(x.id) === String(id)); return a ? [a.code, a.name].filter(Boolean).join(" · ") : "Chưa liên kết thiết bị"; };
    const contractorName = (id) => contractors.find(x => String(x.id) === String(id))?.name || "Chưa liên kết nhà thầu";
    const people = (x) => arr(x.performers).length ? x.performers.join(", ") : text(x.a || x.performer);
    const addPhotos = (refs, caption, id) => { if (chosen.has(id)) arr(refs).filter(x => typeof x === "string" && x).forEach((ref, i) => photos.push({ ref, caption: caption + " · Ảnh " + (i + 1) })); };
    const addNote = (source, value, tone = "muted") => { if (String(value || "").trim()) notes.push({ source, text: String(value).trim(), tone }); };
    const add = (id, columns, rows, count, scope = "Trong kỳ") => {
      const m = modules.find(x => x.id === id);
      sections.push({ id, title: m.title, columns, rows, count: count ?? rows.length, scope });
    };
    add("work", ["Ngày", "Nội dung / Ghi chú", "Loại", "Trạng thái", "Người thực hiện"], tasks.map(x => {
      addPhotos(x.imgs, date(x.d) + " · " + x.c, "work");
      if (chosen.has("work")) addNote(x.c, x.n);
      return [date(x.d), [x.c, x.n, x.cause && "Nguyên nhân: " + x.cause, x.result && "Kết quả: " + x.result].filter(Boolean).join("\n"), text(x.t), status(x.s), people(x)];
    }));
    add("incident", ["Ngày / Mã", "Khu vực / Hiện tượng", "Nguyên nhân / Xử lý", "Mức độ", "Trạng thái"], incidents.map(x => {
      addPhotos(x.before_images, x.incident_code + " · Trước xử lý", "incident"); addPhotos(x.after_images, x.incident_code + " · Sau xử lý", "incident");
      if (chosen.has("incident") && x.status !== "Đã đóng") addNote(x.incident_code, [x.symptom, x.solution].filter(Boolean).join(" · "), "watch");
      return [date(x.detected_at) + "\n" + text(x.incident_code), [x.area, x.symptom].filter(Boolean).join("\n"), [x.cause && "Nguyên nhân: " + x.cause, x.solution && "Xử lý: " + x.solution].filter(Boolean).join("\n") || "Chưa cập nhật", status(x.severity), status(x.status)];
    }));
    add("inspection", ["Ngày / Checklist", "Hạng mục / Tiêu chuẩn", "Kết quả", "Ghi chú / Kiến nghị"], inspections.flatMap(x => {
      if (chosen.has("inspection")) addNote(x.template_name, x.recommendation, complete(x.result_status) ? "muted" : "watch");
      const items = arr(x.items).length ? x.items : [{ item: "Chưa có chi tiết", result: x.result_status }];
      return items.map(it => [date(x.inspection_date) + "\n" + text(x.template_name) + "\n" + text(x.inspection_code), [it.item, it.standard].filter(Boolean).join("\n"), status(it.result || x.result_status), [it.note, x.recommendation].filter(Boolean).join("\n") || "—"]);
    }), inspections.length);
    const energyTotals = [];
    for (const type of ["electric", "water", "solar", "xlnt"]) {
      const id = "energy_" + type, unit = ["water", "xlnt"].includes(type) ? "m³" : "kWh";
      const dual = options.buildingId === "68PĐL" && type === "electric";
      const rows = energyRows(raw.energy, type, r, dual);
      const columns = dual ? ["Ngày", "EVN1", "Chênh lệch EVN1", "EVN2", "Chênh lệch EVN2", "Người thực hiện / Ghi chú"] : ["Ngày", "Chỉ số (" + unit + ")", "Chênh lệch (" + unit + ")", "Người thực hiện", "Ghi chú"];
      add(id, columns, rows.map(x => {
        addPhotos([x.image, ...(dual ? [x.image2] : [])], date(x.date) + " · " + modules.find(m => m.id === id).title, id);
        const diff = (v) => v === null ? "Chưa có mốc trước" : fmt(v);
        return dual ? [date(x.date), fmt(x.value), diff(x.diff), fmt(x.value2), diff(x.diff2), [people(x), x.note].filter(Boolean).join("\n")] : [date(x.date), fmt(x.value), diff(x.diff), people(x), text(x.note)];
      }));
      if (chosen.has(id)) {
        const sum = (field) => { const known = rows.filter(x => x[field] !== null && x[field] >= 0); return known.length ? fmt(known.reduce((n, x) => n + x[field], 0)) : "—"; };
        energyTotals.push({ label: dual ? "EVN1" : modules.find(m => m.id === id).title, value: sum("diff"), unit });
        if (dual) energyTotals.push({ label: "EVN2", value: sum("diff2"), unit });
        const negative = rows.filter(x => x.diff < 0 || x.diff2 < 0);
        if (negative.length) addNote(modules.find(m => m.id === id).title, negative.length + " bản ghi có chỉ số giảm; cần kiểm tra thay/reset đồng hồ. Chênh lệch âm được giữ trong bảng và không cộng vào mức tiêu thụ.", "watch");
      }
    }
    const transactions = arr(data.transactions);
    add("materials", ["Vật tư", "ĐVT", "Tồn đầu", "Nhập", "Xuất", "Tồn cuối"], arr(data.materials).filter(m => !day(m.tracking_start_date || m.created_at) || day(m.tracking_start_date || m.created_at) <= r.to).map(m => {
      const start = day(m.tracking_start_date || m.created_at || r.from);
      const tx = transactions.filter(x => String(x.material_id) === String(m.id) && x.tx_date >= start && x.tx_date <= r.to);
      let opening = Number(m.opening_qty || 0), incoming = 0, outgoing = 0;
      for (const x of tx) { const qty = Number(x.qty || 0); if (x.tx_date < r.from) opening += x.tx_type === "in" ? qty : -qty; else if (x.tx_type === "in") incoming += qty; else outgoing += qty; }
      return [text(m.name), text(m.unit), fmt(opening), fmt(incoming), fmt(outgoing), fmt(opening + incoming - outgoing)];
    }), undefined, "Tồn đầu và giao dịch trong kỳ");
    add("tools", ["Dụng cụ / Nhãn hiệu", "Số lượng", "Vị trí", "Tình trạng", "Phụ trách / Ghi chú"], arr(data.tools).map(x => [[x.name, x.brand].filter(Boolean).join("\n"), fmt(x.qty) + " " + text(x.unit), text(x.location), status(x.condition_status), [x.keeper, x.note].filter(Boolean).join("\n") || "—"]), undefined, "Danh mục hiện tại · không phải lịch sử tại cuối kỳ");
    const maintenance = arr(data.maintenance).filter(x => inRange(x.service_date, r));
    add("maintenance", ["Ngày", "Thiết bị", "Nội dung bảo trì", "Kết quả", "Phụ trách / Hạn tiếp theo"], maintenance.map(x => [date(x.service_date), assetName(x.asset_id), [x.maintenance_type, x.work_done, x.note].filter(Boolean).join("\n"), status(x.result_status), [x.performer, "Hạn tiếp: " + date(x.next_due_date)].filter(Boolean).join("\n")]), maintenance.length);
    const jobs = arr(data.jobs).slice();
    for (const t of tasks.filter(x => x.contractorId)) if (!jobs.some(j => String(j.source_task_id) === String(t.id) || String(j.note || "").includes("Tạo tự động từ công việc " + t.id) || String(j.note || "").includes("Liên kết công việc " + t.id))) jobs.push({ contractor_id: t.contractorId, work_date: t.d, work_content: t.c, cause: t.cause, solution: t.result, status: t.s, note: t.n, images: t.imgs });
    add("contractor", ["Ngày / Hoàn thành", "Nhà thầu / Nội dung", "Nguyên nhân / Hướng xử lý", "Trạng thái", "Ghi chú"], jobs.filter(x => inRange(x.work_date, r)).map(x => {
      addPhotos(x.images, date(x.work_date) + " · " + x.work_content, "contractor");
      return [date(x.work_date) + "\n" + date(x.completed_date), contractorName(x.contractor_id) + "\n" + text(x.work_content), [x.cause, x.solution].filter(Boolean).join("\n") || "—", status(x.status), text(x.note)];
    }));
    const selectedSections = sections.filter(x => chosen.has(x.id));
    const selectedCount = selectedSections.reduce((n, x) => n + x.count, 0);
    const done = tasks.filter(x => complete(x.s)).length;
    const pending = tasks.length - done;
    const health = [
      ...chosen.has("work") ? [{ label: "Công việc", text: tasks.length ? done + "/" + tasks.length + " hoàn thành" : "Chưa có dữ liệu", tone: tasks.length ? pending ? "info" : "good" : "muted" }] : [],
      ...chosen.has("incident") ? [{ label: "Sự cố & Defect", text: incidents.length ? incidents.filter(x => x.status !== "Đã đóng").length + " sự cố đang mở" : "Chưa có dữ liệu", tone: incidents.length ? incidents.some(x => x.status !== "Đã đóng") ? "danger" : "good" : "muted" }] : [],
      ...chosen.has("inspection") ? [{ label: "Kiểm tra định kỳ", text: inspections.length ? inspections.filter(x => !complete(x.result_status)).length + " checklist cần theo dõi" : "Chưa có dữ liệu", tone: inspections.length ? inspections.some(x => !complete(x.result_status)) ? "watch" : "good" : "muted" }] : [],
    ];
    const soon = new Date(localDay() + "T12:00:00Z"); soon.setUTCDate(soon.getUTCDate() + 30);
    const schedule = chosen.has("maintenance") ? assets.map(x => ({ name: [x.code, x.name].filter(Boolean).join(" · "), due: date(x.next_due_date), status: status(x.status === "Ngừng sử dụng" ? x.status : !x.next_due_date ? "Chưa đặt lịch" : x.next_due_date < localDay() ? "Quá hạn" : x.next_due_date <= soon.toISOString().slice(0, 10) ? "Sắp đến hạn" : "Đúng kế hoạch") })) : [];
    return { sections: selectedSections, allSections: sections, photos, notes, health, schedule, energyTotals, count: selectedCount, taskCount: chosen.has("work") ? tasks.length : null, done: chosen.has("work") ? done : null, pending: chosen.has("work") ? pending : null, period: periodLabel(r), range: { ...r } };
  }
  return { modules, build, range, validRange, periodLabel, localDay, date, fmt, status, energyRows, latestRecordDate };
});
