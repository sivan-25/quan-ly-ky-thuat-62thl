(() => {
  "use strict";

  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const text = (v) => String(v ?? "").trim();
  const number = (v) => Number(v);
  const finite = (v) => Number.isFinite(number(v));
  const nonNegative = (v) => finite(v) && number(v) >= 0;
  const positive = (v) => finite(v) && number(v) > 0;
  const validDate = (v) => isoDate.test(text(v)) && !Number.isNaN(Date.parse(text(v) + "T00:00:00"));

  function issue(field, message) { return { field, message }; }
  function result(issues) { return { ok: issues.length === 0, issues, first: issues[0] || null }; }

  const validators = {
    task(v) {
      const x=[];
      if(!validDate(v.date)) x.push(issue("date","Ngày công việc không hợp lệ"));
      if(text(v.content).length < 2) x.push(issue("content","Vui lòng nhập nội dung công việc"));
      if(!Array.isArray(v.performers) || !v.performers.filter(Boolean).length) x.push(issue("performer","Vui lòng chọn ít nhất 1 người thực hiện"));
      if(v.requiresCompletionNote && text(v.note).length < 1) x.push(issue("note","Cần nhập ghi chú trước khi hoàn thành công việc"));
      return result(x);
    },
    energy(v) {
      const x=[];
      if(!validDate(v.date)) x.push(issue("energyDate","Ngày ghi chỉ số không hợp lệ"));
      if(!finite(v.value) || number(v.value) < 0) x.push(issue("energyValue","Chỉ số phải là số hợp lệ và không âm"));
      if(v.dual && (!finite(v.value2) || number(v.value2) < 0)) x.push(issue("energyValue2","Vui lòng nhập EVN2 hợp lệ"));
      if(!Array.isArray(v.performers) || !v.performers.filter(Boolean).length) x.push(issue("energyPerformer","Vui lòng chọn ít nhất 1 người thực hiện"));
      return result(x);
    },
    material(v) {
      const x=[];
      if(!text(v.name)) x.push(issue("materialName","Vui lòng nhập tên vật tư"));
      if(!text(v.unit)) x.push(issue("materialUnit","Vui lòng nhập đơn vị"));
      if(!validDate(v.trackingStart)) x.push(issue("materialTrackingStart","Ngày bắt đầu quản lý không hợp lệ"));
      if(validDate(v.trackingStart) && v.today && v.trackingStart > v.today) x.push(issue("materialTrackingStart","Ngày bắt đầu quản lý không thể ở tương lai"));
      if(!nonNegative(v.openingQty)) x.push(issue("materialOpeningQty","Tồn đầu phải là số không âm"));
      if(!nonNegative(v.minQty)) x.push(issue("materialMinQty","Tồn tối thiểu phải là số không âm"));
      return result(x);
    },
    stock(v) {
      const x=[];
      if(!text(v.materialId)) x.push(issue("stockTxnMaterial","Vui lòng chọn vật tư"));
      if(!positive(v.qty)) x.push(issue("stockTxnQty","Số lượng phải lớn hơn 0"));
      if(!validDate(v.date)) x.push(issue("stockTxnDate","Ngày nhập/xuất không hợp lệ"));
      return result(x);
    },
    tool(v) {
      const x=[];
      if(!text(v.name)) x.push(issue("toolName","Vui lòng nhập tên dụng cụ"));
      if(!nonNegative(v.qty)) x.push(issue("toolQty","Số lượng dụng cụ không hợp lệ"));
      return result(x);
    },
    maintenanceAsset(v) {
      const x=[];
      if(!text(v.name)) x.push(issue("maintenanceName","Vui lòng nhập tên thiết bị"));
      if(!positive(v.frequency)) x.push(issue("maintenanceFrequency","Chu kỳ bảo trì phải lớn hơn 0 ngày"));
      if(v.lastDate && !validDate(v.lastDate)) x.push(issue("maintenanceLastDate","Ngày bảo trì gần nhất không hợp lệ"));
      return result(x);
    },
    maintenanceRecord(v) {
      const x=[];
      if(!text(v.assetId)) x.push(issue("maintenanceRecordAssetId","Vui lòng chọn thiết bị"));
      if(!validDate(v.serviceDate)) x.push(issue("maintenanceRecordDate","Ngày bảo trì không hợp lệ"));
      return result(x);
    },
    contractor(v) {
      const x=[];
      if(!text(v.name)) x.push(issue("contractorName","Vui lòng nhập tên nhà thầu"));
      if(v.start && !validDate(v.start)) x.push(issue("contractorContractStart","Ngày bắt đầu hợp đồng không hợp lệ"));
      if(v.end && !validDate(v.end)) x.push(issue("contractorContractEnd","Ngày kết thúc hợp đồng không hợp lệ"));
      if(v.start && v.end && v.end < v.start) x.push(issue("contractorContractEnd","Ngày kết thúc hợp đồng phải sau ngày bắt đầu"));
      return result(x);
    },
    contractorJob(v) {
      const x=[];
      if(!validDate(v.workDate)) x.push(issue("contractorJobDate","Ngày thực hiện không hợp lệ"));
      if(!text(v.content)) x.push(issue("contractorJobContent","Vui lòng nhập nội dung công việc"));
      if(v.completed && !validDate(v.completed)) x.push(issue("contractorJobCompletedDate","Ngày hoàn thành không hợp lệ"));
      if(v.completed && validDate(v.workDate) && v.completed < v.workDate) x.push(issue("contractorJobCompletedDate","Ngày hoàn thành không được trước ngày thực hiện"));
      return result(x);
    },
    incident(v) {
      const x=[];
      if(!validDate(v.date)) x.push(issue("demoIncidentDetectedDate","Ngày phát hiện không hợp lệ"));
      if(!text(v.area)) x.push(issue("demoIncidentArea","Vui lòng nhập khu vực"));
      if(!text(v.symptom)) x.push(issue("demoIncidentSymptom","Vui lòng nhập hiện tượng/sự cố"));
      return result(x);
    },
    checklist(v) {
      const x=[];
      if(!text(v.name)) x.push(issue("demoChecklistName","Vui lòng nhập tên checklist"));
      if(!validDate(v.date)) x.push(issue("demoChecklistDate","Ngày kiểm tra không hợp lệ"));
      if(!text(v.item)) x.push(issue("demoChecklistItem","Vui lòng nhập hạng mục kiểm tra"));
      return result(x);
    },
    document(v) {
      const x=[];
      if(!text(v.title)) x.push(issue("technicalDocumentTitle","Vui lòng nhập tên tài liệu"));
      if(!v.file) x.push(issue("technicalDocumentFile","Vui lòng chọn file cần tải lên"));
      if(v.file && Number(v.file.size || 0) > 50*1024*1024) x.push(issue("technicalDocumentFile","File vượt quá giới hạn 50 MB"));
      return result(x);
    },
    constructionMaterial(v) {
      const x=[];
      if(!text(v.name)) x.push(issue("constructionMaterialName","Vui lòng nhập tên vật tư thi công"));
      if(!text(v.unit)) x.push(issue("constructionMaterialUnit","Vui lòng nhập đơn vị"));
      if(!nonNegative(v.openingQty)) x.push(issue("constructionMaterialOpeningQty","Tồn đầu không hợp lệ"));
      return result(x);
    },
    constructionStock(v) {
      const x=[];
      if(!text(v.materialId)) x.push(issue("constructionStockMaterial","Vui lòng chọn vật tư"));
      if(!positive(v.qty)) x.push(issue("constructionStockQty","Số lượng phải lớn hơn 0"));
      if(!validDate(v.date)) x.push(issue("constructionStockDate","Ngày nhập/xuất không hợp lệ"));
      return result(x);
    },
    constructionLog(v) {
      const x=[];
      if(!text(v.materialId)) x.push(issue("constructionLogMaterialId","Không tìm thấy vật tư"));
      if(!validDate(v.date)) x.push(issue("constructionLogDate","Ngày thực hiện không hợp lệ"));
      if(!positive(v.qty)) x.push(issue("constructionLogQty","Số lượng sử dụng phải lớn hơn 0"));
      if(!text(v.content)) x.push(issue("constructionLogContent","Vui lòng nhập nội dung thi công"));
      return result(x);
    }
  };

  function mark(validation) {
    document.querySelectorAll("[data-esta-invalid='1']").forEach(el => {
      el.removeAttribute("data-esta-invalid");
      el.removeAttribute("aria-invalid");
    });
    for(const item of validation?.issues || []){
      const el=document.getElementById(item.field);
      if(el){el.dataset.estaInvalid="1";el.setAttribute("aria-invalid","true")}
    }
  }

  function validate(kind, value) {
    const fn=validators[kind];
    if(!fn) return result([]);
    const out=fn(value || {});
    mark(out);
    return out;
  }

  function notify(validation, fallback="Dữ liệu chưa hợp lệ") {
    if(validation?.ok) return true;
    const first=validation?.first;
    try { if(typeof toast==="function") toast(first?.message || fallback); } catch (_) {}
    if(first?.field){
      const el=document.getElementById(first.field);
      try { el?.focus({preventScroll:true}); el?.scrollIntoView({behavior:"smooth",block:"center"}); } catch (_) {}
    }
    return false;
  }

  window.ESTA_VALIDATION=Object.freeze({validate,notify,validDate});
})();