/* Trial module: Phiếu xác nhận hoàn thành công việc, exclusively 130 HH.
 * Reads the current project's cached/synced tasks. Never writes tasks or Supabase.
 */
(() => {
  "use strict";
  const TARGET = "130HH";
  const byId = id => document.getElementById(id);
  const h = v => String(v == null ? "" : v).replace(/[&<>"']/g, ch =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const isoToday = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  };
  const eligible = t => ["Đã hoàn thành", "Hoàn thành"].includes(String(t?.s || "").trim());
  const onProject = () => typeof currentBuilding !== "undefined" && currentBuilding?.id === TARGET;
  const tasks = () => onProject() && typeof load === "function"
    ? load().filter(eligible).sort((a,b)=>String(b.d||"").localeCompare(String(a.d||"")))
    : [];
  const performer = t => Array.isArray(t.performers) && t.performers.length
    ? t.performers.map(x=>String(x||"").trim()).filter(Boolean)
    : String(t.a||t.performer||"").split(",").map(x=>x.trim()).filter(Boolean);
  let selected = new Set();
  let scope = "manual";
  let selectedTasks = [];
  let busy = false;
  function renderButton() {
    const host = document.querySelector("#workPage .workTableMeta");
    if (!host) return;
    let btn = byId("cc130Launch");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "cc130Launch";
      btn.type = "button";
      btn.className = "cc130-launch";
      btn.textContent = "▣ Phiếu xác nhận";
      btn.title = "Lập phiếu xác nhận hoàn thành từ công việc đã ghi nhận";
      btn.addEventListener("click", open);
      host.appendChild(btn);
    }
    btn.hidden = !onProject();
    if (!onProject() && byId("cc130Modal")?.classList.contains("is-open")) close();
  }
  function modal() {
    if (byId("cc130Modal")) return byId("cc130Modal");
    const root = document.createElement("div");
    root.id = "cc130Modal";
    root.className = "cc130-overlay";
    root.setAttribute("role","dialog");
    root.setAttribute("aria-modal","true");
    root.setAttribute("aria-labelledby","cc130Title");
    root.innerHTML = `
      <div class="cc130-dialog">
        <header class="cc130-head">
          <div><small>130 HỒNG HÀ · BỘ PHẬN KỸ THUẬT</small>
            <h2 id="cc130Title">Phiếu xác nhận hoàn thành công việc</h2>
            <p>Chọn công việc đã hoàn thành, kiểm tra nội dung rồi xuất PDF khổ A4 để ký tay.</p>
          </div>
          <button type="button" id="cc130Close" class="cc130-x" aria-label="Đóng phiếu">×</button>
        </header>
        <section id="cc130Choose" class="cc130-step">
          <div class="cc130-modes" role="group" aria-label="Chọn cách lấy công việc">
            <label><input type="radio" name="cc130Mode" value="manual" checked> Chọn từng công việc</label>
            <label><input type="radio" name="cc130Mode" value="month"> Tự lấy công việc theo tháng</label>
          </div>
          <div class="cc130-filter"><label>Tháng xác nhận
            <input type="month" id="cc130Month"></label>
            <span id="cc130SelectionCount" aria-live="polite"></span></div>
          <div id="cc130ManualActions"><label class="cc130-checkall"><input type="checkbox" id="cc130SelectAll"> Chọn tất cả công việc đang hiển thị</label></div>
          <div id="cc130Tasks" class="cc130-tasklist"></div>
          <p class="cc130-help">Chỉ hiển thị công việc có trạng thái Hoàn thành. Thay đổi trên phiếu không sửa dữ liệu Công việc gốc.</p>
          <div class="cc130-actions"><button type="button" id="cc130Next" class="cc130-primary">Tiếp tục · Xem và chỉnh sửa</button></div>
        </section>
        <section id="cc130Edit" class="cc130-step" hidden>
          <div class="cc130-paperhead"><div><small>ESTA · PHIẾU KỸ THUẬT</small><b>Kiểm tra nội dung trước khi xuất</b></div><span>130 HỒNG HÀ · A4</span></div>
          <fieldset class="cc130-style-chooser" aria-label="Mẫu phiếu khi xuất PDF">
            <legend>Mẫu PDF</legend>
            <label><input type="radio" name="cc130Style" value="esta" checked><span><strong>Chuẩn ESTA</strong><small>Nền kem, tím đậm và điểm nhấn đồng · mẫu thử</small></span></label>
            <label><input type="radio" name="cc130Style" value="paper"><span><strong>Mẫu giấy cũ</strong><small>Giữ bố cục phiếu truyền thống</small></span></label>
          </fieldset>
          <label class="cc130-photo-toggle"><input id="cc130IncludePhotos" type="checkbox" checked>
            <span><strong>Kèm hình ảnh công việc</strong><small id="cc130PhotoSummary">Ảnh từ các công việc đã chọn · 2 ảnh / dòng A4 · không cắt ảnh</small></span></label>
          <div class="cc130-fields">
            <label>Tên đơn vị<input id="cc130Company" maxlength="120"></label>
            <label>Bộ phận<input id="cc130Department" maxlength="120"></label>
            <label>Ngày lập phiếu<input id="cc130IssuedDate" type="date"></label>
            <label>Nhân viên thực hiện<input id="cc130Staff" maxlength="280"></label>
            <label class="wide">Nội dung công việc cần sửa chữa<textarea id="cc130Description" maxlength="1000" rows="2"></textarea></label>
          </div>
          <h3>Danh sách công việc và vật tư thay thế</h3>
          <div id="cc130Rows" class="cc130-rows"></div>
          <button type="button" id="cc130AddRow" class="cc130-minor">＋ Thêm dòng công việc / vật tư</button>
          <div class="cc130-fields cc130-bottom">
            <label>Số người tham gia<input id="cc130Participants" type="number" min="0" max="999" placeholder="Để trống nếu chưa xác định"></label>
            <label class="wide">Xác nhận công việc đã hoàn tất<textarea id="cc130Statement" maxlength="700" rows="2"></textarea></label>
          </div>
          <p id="cc130Message" class="cc130-message" role="status" aria-live="polite"></p>
          <div class="cc130-actions"><button type="button" id="cc130Back">Quay lại chọn việc</button><button type="button" id="cc130Export" class="cc130-primary">↓ Xuất PDF xác nhận</button></div>
        </section>
      </div>`;
    document.body.appendChild(root);
    root.addEventListener("click", e => {if(e.target === root) close();});
    byId("cc130Close").addEventListener("click",close);
    root.querySelectorAll('input[name="cc130Mode"]').forEach(el => el.addEventListener("change", e => {
      scope = e.target.value;
      selected.clear();
      renderList();
    }));
    byId("cc130Month").addEventListener("change", renderList);
    byId("cc130SelectAll").addEventListener("change", e => {
      const visible = displayed();
      visible.forEach(t => e.target.checked ? selected.add(String(t.id)) : selected.delete(String(t.id)));
      renderList();
    });
    byId("cc130Tasks").addEventListener("change", e => {
      if (!e.target.matches('input[data-cc130-id]')) return;
      const id = e.target.dataset.cc130Id;
      if(e.target.checked) selected.add(id); else selected.delete(id);
      updateCount();
    });
    byId("cc130Next").addEventListener("click",next);
    byId("cc130Back").addEventListener("click",() => showStep("choose"));
    byId("cc130AddRow").addEventListener("click",() => appendRow({}));
    byId("cc130Rows").addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const node = btn.closest(".cc130-row");
      if (!node) return;
      if (btn.hasAttribute("data-cc130-remove")) {
        if (byId("cc130Rows").children.length < 2) return;
        node.remove();
      } else if (btn.hasAttribute("data-cc130-result")) {
        fillTaskResult(node);
      } else if (btn.hasAttribute("data-cc130-auto")) {
        void fillLinkedMaterials(node);
      }
    });
    byId("cc130Export").addEventListener("click",exportPdf);
    document.addEventListener("keydown", e => {if(e.key==="Escape" && root.classList.contains("is-open") && !busy)close();});
    return root;
  }
  function open() {
    if (!onProject()) return;
    modal();
    scope = "manual";
    selected.clear();
    selectedTasks = [];
    byId("cc130Month").value = isoToday().slice(0,7);
    const esta = byId("cc130Modal").querySelector('input[name="cc130Style"][value="esta"]');
    if (esta) esta.checked=true;
    byId("cc130Modal").querySelector('input[value="manual"]').checked = true;
    renderList();
    showStep("choose");
    byId("cc130Modal").classList.add("is-open");
    byId("cc130Close").focus();
  }
  function close() {
    if(busy) return;
    byId("cc130Modal")?.classList.remove("is-open");
  }
  function showStep(name) {
    byId("cc130Choose").hidden = name !== "choose";
    byId("cc130Edit").hidden = name !== "edit";
    byId("cc130Message").textContent = "";
    byId("cc130Dialog")?.scrollTo(0,0);
  }
  function displayed() {
    const month = byId("cc130Month").value;
    return tasks().filter(t => String(t.d||"").startsWith(month));
  }
  function updateCount() {
    const visible = displayed();
    const count = scope==="month" ? visible.length : visible.filter(t=>selected.has(String(t.id))).length;
    byId("cc130SelectionCount").textContent = "Đã chọn " + count + " / " + visible.length + " công việc hoàn thành";
    byId("cc130Next").disabled = count === 0;
    const all = byId("cc130SelectAll");
    all.checked = visible.length>0 && visible.every(t=>selected.has(String(t.id)));
    all.indeterminate = visible.some(t=>selected.has(String(t.id))) && !all.checked;
  }
  function renderList() {
    const list = displayed();
    const automatic = scope==="month";
    byId("cc130ManualActions").hidden = automatic;
    byId("cc130Tasks").innerHTML = list.length ? list.map(t => `
      <label class="cc130-task">
        <input type="checkbox" data-cc130-id="${h(t.id)}" ${automatic||selected.has(String(t.id))?"checked":""} ${automatic?"disabled":""}>
        <span><b>${h(t.c||"Công việc kỹ thuật")}</b>
        <small>${h(t.d||"Không có ngày")} · ${h(performer(t).join(", ")||"Chưa ghi người thực hiện")}</small></span>
      </label>`).join("") : '<p class="cc130-empty">Không có công việc Hoàn thành trong tháng này.</p>';
    updateCount();
  }
  function next() {
    if (!onProject()) {close(); return;}
    const shown = displayed();
    selectedTasks = shown.filter(t => scope==="month" || selected.has(String(t.id)));
    if (!selectedTasks.length) return;
    const names = [...new Set(selectedTasks.flatMap(performer))];
    byId("cc130Company").value = "BQLTN LE HOLDING";
    byId("cc130Department").value = "BỘ PHẬN KỸ THUẬT";
    byId("cc130IssuedDate").value = isoToday();
    byId("cc130Staff").value = names.join(", ");
    const totalImages=selectedTasks.reduce((sum,t)=>sum+(Array.isArray(t.imgs)?t.imgs.filter(Boolean).length:0),0);
    byId("cc130IncludePhotos").checked=true;
    byId("cc130IncludePhotos").disabled=totalImages===0;
    byId("cc130PhotoSummary").textContent=totalImages
      ? totalImages+" ảnh từ "+selectedTasks.length+" công việc đã chọn · 2 ảnh / dòng A4"
      : "Các công việc đã chọn chưa có ảnh; phiếu vẫn xuất bình thường.";
    byId("cc130Participants").value = names.length ? String(names.length) : "";
    const titles = selectedTasks.map(t=>String(t.c||"").trim()).filter(Boolean);
    byId("cc130Description").value = titles.join("; ").slice(0,1000);
    byId("cc130Statement").value = "Đã hoàn thành các công việc nêu trên.";
    byId("cc130Rows").innerHTML = "";
    selectedTasks.forEach(t=>appendRow({
      sourceTaskId: String(t.id),
      content: t.c||"", material: "", unit: "", qty: "",
      start_date: t.d||"", end_date: t.d||""
    }));
    showStep("edit");
  }
  // Populate only from the saved source task; the certificate is an independent, editable draft.
  function rowHint(node, text, error=false) {
    const hint = node.querySelector("[data-cc130-hint]");
    if (hint) {
      hint.textContent = text;
      hint.classList.toggle("is-error", error);
    }
  }
  function linkedTask(node) {
    const id=String(node?.dataset.sourceTaskId||"");
    return id ? selectedTasks.find(t=>String(t.id)===id) : null;
  }
  function fillTaskResult(node) {
    const input=node.querySelector('[data-field="content"]');
    const task=linkedTask(node);
    const result=String(task?.result||"").trim();
    if (!result) {
      input.focus();
      rowHint(node, task
        ? "Chưa có KQ thực hiện trong công việc liên kết. Hãy nhập kết quả vào ô Nội dung công việc."
        : "Hãy nhập trực tiếp kết quả thực hiện trong ô Nội dung công việc.", false);
      return;
    }
    if (input.value.trim() && input.value.trim() !== String(task?.c||"").trim() &&
        input.value.trim() !== result &&
        !window.confirm("Thay nội dung hiện tại bằng KQ thực hiện đã lưu trong Công việc?")) return;
    input.value=result.slice(0,1400);
    input.focus();
    rowHint(node,"Đã lấy KQ thực hiện từ công việc liên kết. Bạn có thể chỉnh sửa trước khi xuất.");
  }
  // Stored task materials: [{materialId,name,qty,unit}]. Never derive stock usage from notes.
  async function resolvedMaterials(task) {
    const items=Array.isArray(task?.materials)?task.materials:[];
    if (!items.length) return [];
    const valid=items.map(item=>({
      materialId:String(item?.materialId||item?.id||"").trim(),
      name:String(item?.name||"").trim(),
      unit:String(item?.unit||"").trim(),
      qty:Number(item?.qty)
    }));
    if(valid.some(item=>!Number.isFinite(item.qty)||item.qty<=0))
      throw new Error("Một hoặc nhiều vật tư liên kết chưa có số lượng hợp lệ. Hãy kiểm tra trong Công việc trước khi Auto.");
    if (valid.some(item=>!item.name||!item.unit) && centralSession?.access_token) {
      const rows=await sbFetch(
        "/rest/v1/inventory_materials?building_id=eq."+encodeURIComponent(TARGET)+"&select=id,name,unit&limit=1000",
        {token:centralSession.access_token}
      );
      const catalog=new Map((Array.isArray(rows)?rows:[]).map(item=>[String(item.id),item]));
      for (const item of valid) {
        const entry=catalog.get(item.materialId);
        if (!item.name) item.name=String(entry?.name||"").trim();
        if (!item.unit) item.unit=String(entry?.unit||"").trim();
      }
    }
    if(valid.some(item=>!item.name)) throw new Error("Có vật tư liên kết chưa xác định được tên. Hãy kiểm tra lại dữ liệu Công việc.");
    // If the same material was recorded more than once, group by material ID and unit.
    const merged=new Map();
    for(const item of valid) {
      const key=(item.materialId||item.name)+"|"+item.unit;
      if(merged.has(key))merged.get(key).qty+=item.qty;
      else merged.set(key,{...item});
    }
    return [...merged.values()].map(item=>({...item,qty:String(Number(item.qty.toFixed(4)))}));
  }
  async function fillLinkedMaterials(node) {
    const task=linkedTask(node),button=node.querySelector("[data-cc130-auto]");
    if (!task) {
      rowHint(node,"Dòng tự thêm chưa liên kết với công việc. Vui lòng nhập vật tư thủ công.",true);
      return;
    }
    if(button?.disabled)return;
    const buildingId=currentBuilding?.id;
    button.disabled=true;button.textContent="Đang lấy vật tư…";
    try {
      const materials=await resolvedMaterials(task);
      if(!onProject()||currentBuilding?.id!==buildingId||!byId("cc130Rows").contains(node))
        throw new Error("Dự án đã thay đổi, vui lòng mở lại phiếu.");
      if(!materials.length) {
        rowHint(node,"Công việc chưa ghi nhận vật tư sử dụng trong phần liên kết. Bạn có thể nhập thủ công.",true);
        return;
      }
      const extra=[...byId("cc130Rows").querySelectorAll(".cc130-row[data-cc130-auto-generated='1']")]
        .filter(el=>el.dataset.sourceTaskId===String(task.id));
      if(byId("cc130Rows").children.length-extra.length+materials.length-1>120)
        throw new Error("Phiếu chỉ hỗ trợ tối đa 120 dòng. Hãy giảm bớt công việc.");
      const fields=["material","unit","qty"].map(x=>node.querySelector('[data-field="'+x+'"]').value.trim());
      if ((fields.some(Boolean)||extra.length) &&
          !window.confirm("Auto sẽ thay thế các ô vật tư hiện tại của công việc này bằng dữ liệu đã liên kết. Tiếp tục?")) return;
      extra.forEach(el=>el.remove());
      const field=(key,value,el=node)=>{el.querySelector('[data-field="'+key+'"]').value=value;};
      field("material",materials[0].name);
      field("unit",materials[0].unit);
      field("qty",materials[0].qty);
      let previous=node;
      for(const item of materials.slice(1)) {
        const child=appendRow({
          sourceTaskId:String(task.id),autoGenerated:true,content:node.querySelector('[data-field="content"]').value.trim(),
          material:item.name,unit:item.unit,qty:item.qty,
          start_date:node.querySelector('[data-field="start_date"]').value,
          end_date:node.querySelector('[data-field="end_date"]').value
        },previous);
        previous=child;
      }
      rowHint(node,"Auto: đã lấy "+materials.length+" loại vật tư và khối lượng từ Công việc. Bạn có thể sửa lại trước khi xuất.");
    } catch(error) {
      rowHint(node,"Không thể lấy vật tư: "+(error?.message||String(error)),true);
    } finally {
      if(button){button.disabled=false;button.textContent="↻ Auto vật tư";}
    }
  }
  function appendRow(row,afterNode=null) {
    if(byId("cc130Rows").children.length >= 120)return null;
    const wrapper = document.createElement("div");
    wrapper.className = "cc130-row";
    if(row.sourceTaskId)wrapper.dataset.sourceTaskId=String(row.sourceTaskId);
    if(row.autoGenerated)wrapper.dataset.cc130AutoGenerated="1";
    const count = byId("cc130Rows").children.length + 1;
    const buttons = row.autoGenerated
      ? '<span class="cc130-auto-child-note">Vật tư cùng công việc · Auto</span>'
      : '<button type="button" data-cc130-result>↗ Nhập kết quả</button><button type="button" data-cc130-auto>↻ Auto vật tư</button>';
    wrapper.innerHTML = `
      <div class="cc130-row-title"><strong>Công việc ${count}</strong>
        <div class="cc130-row-toolbar">${buttons}<button type="button" data-cc130-remove aria-label="Bỏ dòng công việc">Bỏ dòng</button></div></div>
      <label class="cc130-cellwide">Nội dung công việc<textarea data-field="content" rows="2" maxlength="1400" required>${h(row.content)}</textarea></label>
      <label class="cc130-cellwide">Vật tư, thiết bị thay thế<textarea data-field="material" rows="2" maxlength="1400" placeholder="Nhập thủ công hoặc bấm Auto vật tư">${h(row.material)}</textarea></label>
      <label>ĐVT<input data-field="unit" maxlength="30" placeholder="Cái / Bộ..." value="${h(row.unit)}"></label>
      <label>Số lượng<input data-field="qty" maxlength="30" placeholder="Số lượng" value="${h(row.qty)}"></label>
      <label>Ngày bắt đầu<input data-field="start_date" type="date" value="${h(row.start_date)}"></label>
      <label>Ngày kết thúc<input data-field="end_date" type="date" value="${h(row.end_date)}"></label>
      <small class="cc130-row-hint" data-cc130-hint role="status" aria-live="polite"></small>`;
    if(afterNode?.parentNode===byId("cc130Rows"))afterNode.insertAdjacentElement("afterend",wrapper);
    else byId("cc130Rows").appendChild(wrapper);
    return wrapper;
  }
  function payload() {
    if(!onProject())throw new Error("Chỉ xuất phiếu trong dự án 130 HH.");
    const rows = [...byId("cc130Rows").querySelectorAll(".cc130-row")].map(node => {
      const get = key => node.querySelector('[data-field="'+key+'"]').value.trim();
      const row={content:get("content"),material:get("material"),unit:get("unit"),qty:get("qty"),start_date:get("start_date"),end_date:get("end_date")};
      if(!row.content)throw new Error("Nội dung công việc không được để trống.");
      if(row.start_date && row.end_date && row.end_date < row.start_date)throw new Error("Ngày kết thúc không được trước ngày bắt đầu.");
      return row;
    });
    if(!rows.length)throw new Error("Cần ít nhất một dòng công việc.");
    const includedTaskIds=new Set([...byId("cc130Rows").querySelectorAll(".cc130-row")]
      .map(node=>String(node.dataset.sourceTaskId||"")).filter(Boolean));
    const photos=byId("cc130IncludePhotos").checked
      ? selectedTasks.filter(task=>includedTaskIds.has(String(task.id)))
          .flatMap((task,taskIndex)=>(
          Array.isArray(task.imgs)?task.imgs:[]
        ).filter(ref=>typeof ref==="string"&&ref.trim()).map((ref,i)=>({
          path:ref, caption:"CV "+(taskIndex+1)+" · Hình "+(i+1)
        }))) : [];
    if(photos.length>60)throw new Error("Phiếu đang có "+photos.length+" ảnh. Vui lòng chọn tối đa 60 ảnh bằng cách giảm số công việc, hoặc tắt kèm ảnh.");
    return {
      report_type:"completion", building_id:TARGET, building:"130 Hồng Hà",
      certificate_style:byId("cc130Modal").querySelector('input[name="cc130Style"]:checked')?.value||"esta",
      company:byId("cc130Company").value.trim(), department:byId("cc130Department").value.trim(),
      issued_date:byId("cc130IssuedDate").value, period:byId("cc130Month").value,
      staff:byId("cc130Staff").value.trim(),
      repair_description:byId("cc130Description").value.trim(),
      participant_count:byId("cc130Participants").value.trim(),
      completion_statement:byId("cc130Statement").value.trim(),rows,photos
    };
  }
  async function exportPdf() {
    if(busy)return;
    const button=byId("cc130Export");
    const message=byId("cc130Message");
    try {
      const request = payload();
      if(!centralSession?.access_token)throw new Error("Vui lòng đăng nhập tài khoản ESTA để xuất PDF.");
      busy = true;
      button.disabled = true;
      button.textContent="Đang tạo PDF…";
      message.textContent="Đang tạo phiếu; vui lòng chờ.";
      await ensureCentralSessionFresh();
      if(!onProject())throw new Error("Dự án đã thay đổi, vui lòng mở lại phiếu.");
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),115000);
      let response;
      try {
        response=await centralAuthFetch("/api/esta_report",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify(request),signal:controller.signal
        });
        const blob=await readVerifiedEstaPdf(response);
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a");
        a.href=url;
        a.download="Phieu_xac_nhan_hoan_thanh_130HH_"+request.period.replace("-","")+".pdf";
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),60000);
        const missing=Number(response.headers?.get("X-ESTA-Missing-Images")||0);
        message.textContent=missing>0
          ? "Đã xuất PDF, nhưng "+missing+" ảnh không tải được. Vui lòng kiểm tra ảnh trong Công việc."
          : "Đã xuất phiếu PDF"+(request.photos.length?" kèm "+request.photos.length+" ảnh.":".");
      } finally {clearTimeout(timeout);}
    } catch(error) {
      message.textContent="Chưa xuất được PDF: "+(error?.name==="AbortError"?"Máy chủ phản hồi quá lâu.":error?.message||String(error));
      console.warn("ESTA 130HH completion certificate",error);
    } finally {
      busy=false;
      button.disabled=false;
      button.textContent="↓ Xuất PDF xác nhận";
    }
  }
  function init() {
    if(!document.querySelector("#workPage .workTableMeta")) return;
    renderButton();
    const role=byId("headerRole");
    if(role)new MutationObserver(renderButton).observe(role,{childList:true,characterData:true,subtree:true});
    const page=byId("workPage");
    if(page)new MutationObserver(renderButton).observe(page,{attributes:true,attributeFilter:["class"]});
    document.addEventListener("click",()=>setTimeout(renderButton,0),true);
  }
  window.ESTA130Completion = {open,isEnabled:onProject,eligibleTasks:tasks};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();