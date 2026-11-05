/* ESTA inventory-control PDF: one read-only model shared by Admin and project reports. */
(function(root){
  "use strict";
  const list = value => Array.isArray(value) ? value : [];
  const str = value => String(value == null ? "" : value).trim();
  const date = value => str(value).slice(0,10);
  const qty = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const pretty = value => qty(value).toLocaleString("vi-VN",{maximumFractionDigits:2});
  const isDone = task => /^(đã hoàn thành|hoàn thành|completed|done|đã xử lý|đã đóng)$/i.test(str(task?.s || task?.status));
  const labelDate = value => /^\d{4}-\d{2}-\d{2}$/.test(date(value)) ? date(value).split("-").reverse().join("/") : "—";
  const between = (value,from,to) => date(value)>=from && date(value)<=to;
  const materialStart = material => date(material.tracking_start_date || material.created_at) || "0000-01-01";
  const materialName = (m) => str(m?.name || m?.code || "Vật tư");
  function prepareProject(input, selected, from, to, fallbackNames){
    const tasks = list(input.tasks);
    const taskById = new Map(tasks.map(task => [str(task.id),task]));
    const tx = list(input.transactions);
    const materialRows = [];
    const workRows = [];
    const originals = list(input.materials).filter(m => materialStart(m) <= to && (!date(m.archived_at) || date(m.archived_at)>from));
    const visible = new Map(originals.map(m => [str(m.id),m]));
    if (selected.includes("materials")) {
      originals.forEach(m => {
        const start = materialStart(m);
        const own = tx.filter(x => str(x.material_id)===str(m.id) && date(x.tx_date)>=start && date(x.tx_date)<=to);
        let opening=qty(m.opening_qty),inbound=0,outbound=0;
        const notes=[];
        own.forEach(x => {
          const amount=qty(x.qty);
          const isIn=str(x.tx_type)==="in";
          if(date(x.tx_date)<from) opening+=(isIn?amount:-amount);
          else {
            if(isIn) inbound+=amount; else outbound+=amount;
            notes.push(labelDate(x.tx_date)+": "+(isIn?"nhập ":"xuất ")+pretty(amount)+" "+str(m.unit)+(x.note?" ("+str(x.note)+")":""));
          }
        });
        materialRows.push({
          name:materialName(m),unit:str(m.unit)||"—",opening,inbound,outbound,
          closing:opening+inbound-outbound,note:notes.join("; ")||"Không phát sinh nhập – xuất. Đã đối chiếu."
        });
      });
      // Every outgoing movement is represented: linked completed work is named,
      // unlinked or incomplete work is explicitly flagged, never mislabelled as completed.
      tx.filter(x => str(x.tx_type)==="out" && between(x.tx_date,from,to) &&
          visible.has(str(x.material_id)) && date(x.tx_date)>=materialStart(visible.get(str(x.material_id))))
        .forEach(x => {
          const m=visible.get(str(x.material_id));
          const task=taskById.get(str(x.source_task_id));
          const completed=task && isDone(task);
          const finishDate=date(task?.completed_at || task?.completedAt || task?.completed_date || task?.completion_date || task?.d || "");
          const taskInPeriod=completed && (!finishDate || between(finishDate,from,to));
          const linked=str(x.source_type)==="work_task" && str(x.source_task_id) && taskInPeriod;
          workRows.push({
            task:linked ? (str(task?.id)+" – "+str(task?.c||task?.title||x.source_task_title||"Công việc"))
              : (completed?"Công việc hoàn thành ngoài kỳ / chưa xác minh ngày":
                 task?"Công việc chưa hoàn thành":"Xuất kho chưa liên kết công việc"),
            completed:linked?(finishDate||date(x.tx_date)):"",date:date(x.tx_date),
            material:materialName(m),unit:str(m.unit)||"—",qty:qty(x.qty),
            performer:str(task?.a || list(task?.performers).join(", ") || x.performer || ""),
            linked:!!linked
          });
        });
      materialRows.sort((a,b)=>a.name.localeCompare(b.name,"vi"));
      workRows.sort((a,b)=>a.date.localeCompare(b.date)||a.material.localeCompare(b.material,"vi"));
    }
    const toolRows=selected.includes("tools") ? list(input.tools).map(t=>({
      name:str(t.name)||"Dụng cụ",brand:str(t.brand)||"—",
      unit:str(t.unit)||"—",qty:qty(t.qty),keeper:str(t.keeper)||"—",
      status:str(t.condition_status)||"Chưa cập nhật",note:str(t.note || t.location)||""
    })).sort((a,b)=>a.name.localeCompare(b.name,"vi")) : [];
    const signers = input.signers || {};
    return {
      id:str(input.id),name:str(input.name||input.id),
      prepared_by:str(signers.prepared_by || fallbackNames.prepared_by)||"—",
      checked_by:str(signers.checked_by || fallbackNames.checked_by)||"—",
      approved_by:str(signers.approved_by || fallbackNames.approved_by)||"—",
      materials:materialRows,tools:toolRows,work:workRows
    };
  }
  function buildPayload(config){
    const from=date(config.from),to=date(config.to);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from>to)
      throw new Error("Kỳ báo cáo không hợp lệ");
    const selected=list(config.selected).filter(x=>x==="materials"||x==="tools");
    if(!selected.length) throw new Error("Chưa chọn Vật tư tiêu hao hoặc Dụng cụ kỹ thuật");
    const projects=list(config.projects);
    if(!projects.length)throw new Error("Chưa chọn dự án");
    const names=config.signers||{};
    return {
      report_type:"inventory_control",period_from:from,period_to:to,
      period_label:str(config.period_label)||("Từ "+labelDate(from)+" đến "+labelDate(to)),
      report_date:labelDate(config.report_date||new Date().toISOString().slice(0,10)),
      selected,
      projects:projects.map(p=>prepareProject(p,selected,from,to,names))
    };
  }
  async function exportPdf(payload,filename,request,verify){
    const response=await request("/api/esta_report",{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
    });
    const blob=await verify(response);
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    try {link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();}
    finally {setTimeout(()=>URL.revokeObjectURL(url),60000);}
    return true;
  }
  const api={buildPayload,exportPdf};
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.ESTAInventoryControl=api;
})(typeof window==="undefined"?globalThis:window);
