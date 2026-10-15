/* ESTA - Trung tam bao cao tong hop Admin. Isolated, additive module. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const arr = (v) => Array.isArray(v) ? v : [];
  const day = (v) => String(v || "").slice(0,10);
  const vn = (v) => /^\d{4}-\d{2}-\d{2}$/.test(day(v)) ? day(v).split("-").reverse().join("/") : "—";
  const num = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const fmt = (v) => num(v).toLocaleString("vi-VN", {maximumFractionDigits:2});
  const today = () => window.ESTAReportModel?.localDay?.() || new Date().toLocaleDateString("en-CA");
  const finished = (v) => ["Đã hoàn thành","Hoàn thành","Đã đóng","Đạt","Tốt","Đang sử dụng","Đang hoạt động","Đã xử lý","Bình thường"].includes(String(v || ""));
  const priority = (v) => ({"Khẩn cấp":3,"Cao":2,"Trung bình":1})[String(v||"")] || 0;
  const projectSpecs = [["62THL","62 Trần Huy Liệu"],["68PĐL","68 Phan Đăng Lưu"],["127HH","127 Hồng Hà"],["130HH","130 Hồng Hà"]];
  const categorySpecs = [
    ["work","Công việc","Gồm công việc Admin giao và công việc Admin không gắn dự án"],
    ["incident","Sự cố & Defect","Sự cố đang mở, chờ xử lý và đã đóng"],
    ["inspection","Kiểm tra định kỳ","Checklist, tồn tại và kiến nghị"],
    ["energy","Năng lượng","Điện EVN1/EVN2, nước, Solar và XLNT"],
    ["maintenance","Bảo trì thiết bị","Lịch bảo trì quá hạn và nhật ký thực hiện"],
    ["materials","Vật tư","Tồn đầu, nhập, xuất, tồn cuối và cảnh báo"],
    ["tools","Dụng cụ kỹ thuật","Tình trạng thiết bị/dụng cụ tại ngày lập"],
    ["contractor","Nhà thầu","Công việc nhà thầu chưa và đã hoàn thành"]
  ];
  function mondayToSunday(ref = today()) {
    const d = new Date(ref + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - (d.getUTCDay()+6)%7);
    const from = d.toISOString().slice(0,10);
    d.setUTCDate(d.getUTCDate()+6);
    return [from,d.toISOString().slice(0,10)];
  }
  const [initialFrom,initialTo] = mondayToSunday();
  const state = {
    projects:new Set(projectSpecs.map(x=>x[0])),
    categories:new Set(["work"]),
    from:initialFrom,to:initialTo,
    rows:[],personal:[],extra:{},errors:{},loading:false,loaded:false,busy:false,request:0,loadedAt:""
  };
  const allowed = () => typeof currentAccount !== "undefined" && currentAccount?.is_admin === true;
  const global = () => allowed() && typeof projectOverviewActive !== "undefined" && !projectOverviewActive;
  const scope = (v) => String(v || "").toUpperCase() === "68PDL" ? "68PĐL" : String(v||"").toUpperCase();
  const within = (v) => !!day(v) && day(v)>=state.from && day(v)<=state.to;
  const include = (dateValue,isOpen,dueDate="") => within(dateValue) || within(dueDate) || (!!isOpen && !!day(dueDate) && day(dueDate)<state.from) || (!!isOpen && !!day(dateValue) && day(dateValue)<state.from);
  function severity(x) {
    const due=day(x.due);
    if(x.open && due && due<today()) return 0;
    if(x.open && (priority(x.priority)>=3 || /Hỏng|Không đạt|Cần khắc phục/.test(x.status||""))) return 1;
    if(x.open && (priority(x.priority)>=2 || due===today())) return 2;
    if(x.open) return 3;
    return 4;
  }
  function record(cat,proj,content,when,status,detail,opts={}) {
    const open = opts.open === undefined ? !finished(status) : !!opts.open;
    return {cat,proj,content:String(content || "—"),when:day(when)||"",due:day(opts.due)||"",status:String(status || "—"),detail:String(detail||"—"),priority:opts.priority||"",open,photos:arr(opts.photos)};
  }
  function eligibleRow(r) {return state.projects.has(scope(r?.building?.id));}
  function buildRecords() {
    const out=[],byProject=state.rows.filter(eligibleRow),selected=state.categories;
    const push=(cat,...params)=>{if(selected.has(cat))out.push(record(cat,...params));};
    for(const item of byProject) {
      const bid=scope(item.building.id),name=projectSpecs.find(p=>p[0]===bid)?.[1] || item.building.name || bid;
      const snap=item.snapshot||{},ops=item.ops||{};
      if(selected.has("work")) for(const t of arr(snap.tasks)) {
        const done=finished(t.s),due=day(t.dueDate),start=day(t.d);
        if(!include(start,!done,due))continue;
        push("work",name,t.c||"Công việc kỹ thuật",start,t.s||"Chưa thực hiện",
          [t.t,t.a||arr(t.performers).join(", "),t.n,t.result].filter(Boolean).join(" · "),
          {due,priority:t.priority,open:!done,photos:t.imgs});
      }
      if(selected.has("incident")) for(const x of arr(ops.incidents)) {
        const open=x.status!=="Đã đóng";
        if(!include(x.detected_at,open))continue;
        push("incident",name,[x.incident_code,x.symptom||x.area||"Sự cố"].filter(Boolean).join(" · "),x.detected_at,
          x.status||"Chưa xử lý",[x.cause&&"Nguyên nhân: "+x.cause,x.solution&&"Hướng xử lý: "+x.solution].filter(Boolean).join(" · "),
          {priority:x.severity,open,photos:[...arr(x.before_images),...arr(x.after_images)]});
      }
      if(selected.has("inspection")) for(const x of arr(ops.inspections)) {
        const open=!finished(x.result_status);
        if(!include(x.inspection_date,open))continue;
        push("inspection",name,[x.inspection_code,x.template_name||"Kiểm tra"].filter(Boolean).join(" · "),x.inspection_date,
          x.result_status||"Chưa có kết quả",x.recommendation||"—",{open});
      }
      if(selected.has("energy")) {
        const grouped=new Map();
        for(const e of arr(snap.energy)) {
          const type=String(e.type||""),label=({electric:"Điện",water:"Nước",solar:"Solar",xlnt:"XLNT"})[type];
          if(!label)continue;
          if(!grouped.has(type))grouped.set(type,[]);
          grouped.get(type).push(e);
        }
        for(const [type,group] of grouped) {
          group.sort((a,b)=>day(a.date).localeCompare(day(b.date)) || String(a.id||"").localeCompare(String(b.id||"")));
          for(let i=0;i<group.length;i++) {
            const e=group[i],prev=group[i-1];
            if(!within(e.date))continue;
            const unit=type==="water"||type==="xlnt"?"m³":"kWh";
            const meters=e.value2!==undefined && e.value2!==null && e.value2!=="" ? [["EVN1","value"],["EVN2","value2"]] : [["","value"]];
            for(const [meter,field] of meters) {
              if(e[field]===undefined || e[field]===null || e[field]==="")continue;
              const validDiff=prev && prev[field]!==null && prev[field]!==undefined && prev[field]!=="" && e[field]!==null;
              const diff=validDiff?num(e[field])-num(prev[field]):null;
              const label=({electric:"Điện",water:"Nước",solar:"Solar",xlnt:"XLNT"})[type]+" "+meter;
              push("energy",name,label.trim(),e.date,diff!==null&&diff<0?"Chỉ số giảm · kiểm tra":"Đã ghi nhận",
                "Chỉ số: "+fmt(e[field])+" · Chênh lệch: "+(diff===null?"chưa có mốc trước":fmt(diff))+" "+unit+(e.performer?" · "+e.performer:""),
                {open:diff!==null&&diff<0,photos:[e.image,e.image2].filter(Boolean)});
            }
          }
        }
      }
      if(selected.has("maintenance")) {
        for(const a of arr(ops.maintenance_assets)) {
          if(a.status==="Ngừng sử dụng")continue;
          const due=day(a.next_due_date),bad=a.status==="Hỏng"|| (!!due && due<today());
          if(!bad || !due || due>state.to)continue;
          push("maintenance",name,[a.code,a.name||"Thiết bị"].filter(Boolean).join(" · "),due,
            a.status==="Hỏng"?"Hỏng":"Bảo trì quá hạn",[a.system_type,a.location,a.assigned_to].filter(Boolean).join(" · "),
            {due,priority:a.status==="Hỏng"?"Khẩn cấp":"Cao",open:true});
        }
        for(const x of arr(state.extra[bid]?.maintenance_records)) {
          if(!within(x.service_date))continue;
          const asset=arr(ops.maintenance_assets).find(a=>String(a.id)===String(x.asset_id));
          const status=x.result_status||"Đã bảo trì";
          push("maintenance",name,(asset?.name||x.maintenance_type||"Nhật ký bảo trì"),x.service_date,status,
            [x.work_done,x.note,x.performer].filter(Boolean).join(" · "),
            {open:!finished(status),photos:x.images});
        }
      }
      if(selected.has("materials")) {
        const tx=arr(ops.inventory_material_transactions);
        for(const m of arr(ops.inventory_materials)) {
          const tracked=day(m.tracking_start_date||m.created_at)||"0000-01-01";
          const own=tx.filter(x=>String(x.material_id)===String(m.id)&&day(x.tx_date)>=tracked);
          const opening=num(m.opening_qty)+own.filter(x=>day(x.tx_date)<state.from).reduce((sum,x)=>sum+(x.tx_type==="in"?1:-1)*num(x.qty),0);
          const inbound=own.filter(x=>within(x.tx_date)&&x.tx_type==="in").reduce((sum,x)=>sum+num(x.qty),0);
          const outbound=own.filter(x=>within(x.tx_date)&&x.tx_type!=="in").reduce((sum,x)=>sum+num(x.qty),0);
          const closing=opening+inbound-outbound,minimum=num(m.min_qty);
          const low=minimum>0 && closing<=minimum,empty=minimum>0 && closing<=0;
          const text="Tồn đầu: "+fmt(opening)+" · Nhập: "+fmt(inbound)+" · Xuất: "+fmt(outbound)+" · Tồn cuối: "+fmt(closing)+" "+(m.unit||"")+(minimum>0?" · Định mức: "+fmt(minimum):"");
          push("materials",name,m.name||m.code||"Vật tư",state.to,empty?"Hết vật tư":low?"Dưới định mức":"Đã đối chiếu",text,{open:low,priority:empty?"Khẩn cấp":low?"Cao":""});
        }
      }
      if(selected.has("tools")) for(const t of arr(state.extra[bid]?.inventory_tools)) {
        const status=t.condition_status||"Chưa cập nhật",bad=!finished(status);
        push("tools",name,[t.name,t.brand].filter(Boolean).join(" · ")||"Dụng cụ",state.to,status,
          [t.qty!==undefined?"Số lượng: "+fmt(t.qty)+" "+(t.unit||""):"",t.location,t.keeper,t.note,"Tình trạng tại ngày lập"].filter(Boolean).join(" · "),
          {open:bad});
      }
      if(selected.has("contractor")) for(const j of arr(ops.contractor_jobs)) {
        const open=!finished(j.status);
        if(!include(j.work_date,open))continue;
        push("contractor",name,j.work_content||"Công việc nhà thầu",j.work_date,j.status||"Chờ xử lý",
          [j.completed_date&&"Hoàn thành: "+vn(j.completed_date),j.cause,j.solution].filter(Boolean).join(" · "),{open});
      }
    }
    if(selected.has("work")) for(const t of state.personal) {
      const done=finished(t.status),due=day(t.end_date),start=day(t.start_date);
      if(!include(start,!done,due))continue;
      push("work","Admin · Cá nhân",t.title||"Công việc Admin",start,t.status||"Đang thực hiện",
        [t.assignee,t.notes,t.task_type].filter(Boolean).join(" · "),
        {open:!done,due,priority:t.priority,photos:t.image_paths});
    }
    out.sort((a,b)=>severity(a)-severity(b)||String(a.due||a.when).localeCompare(String(b.due||b.when))||String(a.proj).localeCompare(String(b.proj)));
    return out;
  }
  const safeSource = async(path,token) => {
    const result=await sbFetch(path,{token});
    if(!Array.isArray(result))throw new Error("Dữ liệu máy chủ không hợp lệ");
    return result;
  };
  async function paged(table,bid,token) {
    const values=[];let offset=0;
    while(true) {
      const part=await safeSource("/rest/v1/"+table+"?select=*&building_id=eq."+encodeURIComponent(bid)+"&limit=500&offset="+offset,token);
      values.push(...part);
      if(part.length<500)return values;
      offset+=part.length;
      if(offset>20000)throw new Error("Quá nhiều bản ghi "+table+"; không thể xác nhận đã tải hết.");
    }
  }
  function setMessage(value,error=false) {
    const m=$("#asMessage");if(!m)return;
    m.textContent=value;m.classList.toggle("error",error);
  }
  async function fetchData() {
    if(state.loading)return false;
    if(!global()||!centralSession?.access_token){setMessage("Bạn cần đăng nhập bằng Admin để xem báo cáo.",true);return false;}
    const request=++state.request,token=centralSession.access_token;
    state.loading=true;state.loaded=false;state.errors={};
    setMessage("Đang đọc dữ liệu của các dự án được chọn…");updateButtons();
    try {
      const [overview,personal]=await Promise.all([
        sbFetch("/functions/v1/admin-overview",{method:"POST",token,body:{}}),
        safeSource("/rest/v1/admin_personal_tasks?select=*&order=created_at.desc&limit=500",token)
      ]);
      if(request!==state.request||!global())return false;
      if(!Array.isArray(overview?.rows))throw new Error("Không nhận được dữ liệu tổng quan Admin");
      state.rows=overview.rows;state.personal=personal;
      const extra={},errors={};
      const tables=[];
      if(state.categories.has("maintenance"))tables.push(["maintenance","maintenance_records"]);
      if(state.categories.has("tools"))tables.push(["tools","inventory_tools"]);
      const chosen=projectSpecs.filter(p=>state.projects.has(p[0]));
      const results=await Promise.all(chosen.flatMap(([bid])=>tables.map(async([cat,table])=>{
        try {return {cat,bid,table,rows:await paged(table,bid,token)};}
        catch(e){return {cat,bid,error:e.message||"Không thể tải dữ liệu"};}
      })));
      if(request!==state.request||!global())return false;
      for(const r of results) {
        if(r.error){errors[r.cat]=(errors[r.cat]||[]).concat(r.bid+": "+r.error);continue;}
        if(!extra[r.bid])extra[r.bid]={};
        extra[r.bid][r.table]=r.rows;
      }
      state.extra=extra;state.errors=errors;state.loaded=true;state.loadedAt=new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
      setMessage(Object.keys(errors).length?"Dữ liệu chưa đầy đủ: "+Object.values(errors).flat().join(" · "):"Dữ liệu cập nhật lúc "+state.loadedAt+". Xem trước trước khi xuất PDF.",Object.keys(errors).length>0);
      renderResults();return !Object.keys(errors).length;
    } catch(e) {
      if(request!==state.request)return false;
      state.loaded=false;state.rows=[];state.personal=[];state.extra={};
      setMessage("Không thể tải báo cáo: "+(e.message||"Lỗi kết nối")+". Chưa xuất PDF để tránh thiếu dữ liệu.",true);
      renderResults();return false;
    } finally {if(request===state.request){state.loading=false;updateButtons();}}
  }
  function selectedCount(records){return records.filter(r=>r.open).length;}
  function updateButtons() {
    const button=$("#asExport"),reload=$("#asRefresh");
    if(button)button.disabled=state.loading||state.busy||!state.loaded||!state.categories.size||!state.projects.size||!!Object.keys(state.errors).length;
    if(reload)reload.disabled=state.loading||state.busy;
    if(button)button.textContent=state.busy?"Đang tạo PDF…":"Xuất PDF tổng hợp";
  }
  function renderResults() {
    const records=state.loaded?buildRecords():[];
    const kpi=$("#asKpis");
    if(kpi)kpi.innerHTML=[
      ["DỰ ÁN",state.projects.size],
      ["HẠNG MỤC",state.categories.size],
      ["BẢN GHI",records.length],
      ["CHƯA XỬ LÝ",selectedCount(records)]
    ].map(([name,value])=>'<div><span>'+name+'</span><strong>'+value+'</strong></div>').join("");
    const hint=$("#asPreviewHint");
    if(hint)hint.textContent=state.loaded?"Thứ tự: quá hạn → khẩn cấp → chưa xử lý → hoàn thành. "+records.length+" bản ghi.":"Nhấn Làm mới dữ liệu để xem trước.";
    const body=$("#asRows");
    if(body)body.innerHTML=!state.loaded?'<tr><td colspan="6">Chưa có dữ liệu để xem trước.</td></tr>':!records.length?'<tr><td colspan="6">Không có bản ghi phù hợp với phạm vi và hạng mục đã chọn.</td></tr>':records.slice(0,150).map((r,i)=>{
      const label=categorySpecs.find(c=>c[0]===r.cat)?.[1]||r.cat;
      const warn=severity(r)<3;
      return '<tr><td>'+Number(i+1)+'</td><td>'+esc(label)+'</td><td>'+esc(r.proj)+'</td><td><b>'+esc(r.content)+'</b><small>'+esc(r.detail)+'</small></td><td>'+esc(vn(r.when))+(r.due?'<small>Hạn: '+esc(vn(r.due))+'</small>':"")+'</td><td><span class="'+(r.open?(warn?"as-danger":"as-pending"):"as-done")+'">'+esc(r.status)+'</span></td></tr>';
    }).join("");
    const trunc=$("#asTrunc");if(trunc)trunc.textContent=records.length>150?"Đang xem 150/"+records.length+" bản ghi; PDF sẽ chứa toàn bộ (tối đa 1.500).":"";
    updateButtons();
  }
  function renderSelectors() {
    const projects=$("#asProjectList"),cats=$("#asCategoryList");
    if(!projects||!cats)return;
    projects.innerHTML=projectSpecs.map(([id,name])=>'<label><input type="checkbox" data-as-project="'+esc(id)+'" '+(state.projects.has(id)?"checked":"")+'><span>'+esc(name)+'</span></label>').join("");
    cats.innerHTML=categorySpecs.map(([id,name,desc])=>'<label><input type="checkbox" data-as-category="'+esc(id)+'" '+(state.categories.has(id)?"checked":"")+'><span><b>'+esc(name)+'</b><small>'+esc(desc)+'</small></span></label>').join("");
  }
  async function exportPDF() {
    if(state.busy||state.loading)return;
    if(!state.categories.size||!state.projects.size)return setMessage("Chọn ít nhất một dự án và một hạng mục.",true);
    state.busy=true;updateButtons();
    try {
      const good=await fetchData();
      if(!good)return;
      const records=buildRecords();
      if(records.length>1500)throw new Error("Có "+records.length+" bản ghi, vượt giới hạn 1.500. Hãy thu hẹp kỳ hoặc hạng mục.");
      const selectedNames=categorySpecs.filter(c=>state.categories.has(c[0])).map(c=>c[1]);
      const photos=[];
      if($("#asPhotos")?.checked)for(const r of records) {
        for(const x of r.photos) {
          if(photos.length>=180)break;
          const ref=typeof x==="string"?x:String(x?.ref||x?.path||"");
          if(ref)photos.push({ref,caption:r.proj+" · "+r.content});
        }
        if(photos.length>=180)break;
      }
      const rows=records.map((r,i)=>[
        String(i+1),categorySpecs.find(c=>c[0]===r.cat)?.[1]||r.cat,r.proj,r.content,
        vn(r.when)+(r.due?" · Hạn "+vn(r.due):""),
        (severity(r)===0?"QUÁ HẠN · ":severity(r)===1?"ƯU TIÊN GẤP · ":"")+r.status,r.detail
      ]);
      if(typeof window.exportGenericEstaPdf!=="function")throw new Error("Bộ tạo PDF ESTA chưa sẵn sàng.");
      const success=await window.exportGenericEstaPdf({
        building:"",hideBuilding:true,title:"BÁO CÁO GIÁM SÁT KỸ THUẬT",
        sectionLabel:"BÁO CÁO TỔNG HỢP · ESTA",
        signaturePosition:"supervision",signer:{name:"Sĩ Phan",image_data_url:""},
        tableLabel:"DANH SÁCH HẠNG MỤC ĐÃ CHỌN",
        subtitle:"Bốn dự án và công việc riêng Admin (khi chọn Công việc) · "+selectedNames.join(" / "),
        periodLabel:"Từ "+vn(state.from)+" đến "+vn(state.to),
        columns:[
          {label:"STT",weight:0.34},{label:"Hạng mục",weight:0.95},{label:"Dự án / Nguồn",weight:1.2},
          {label:"Nội dung",weight:2.5},{label:"Ngày / Hạn",weight:1.1},
          {label:"Trạng thái",weight:1.35},{label:"Ghi chú / Chỉ số",weight:2.5}
        ],rows,photos,
        summaries:[
          {label:"TỔNG BẢN GHI",value:String(records.length),dark:true},
          {label:"CHƯA XỬ LÝ",value:String(selectedCount(records))},
          {label:"HOÀN THÀNH / GHI NHẬN",value:String(records.length-selectedCount(records))},
          {label:"HẠNG MỤC",value:String(selectedNames.length)}
        ],
        filename:"ESTA_BaoCaoGiamSatKyThuat_"+state.from+"_"+state.to+".pdf"
      });
      if(success)setMessage("Đã xuất PDF chuẩn ESTA. Gồm "+records.length+" bản ghi của "+selectedNames.length+" hạng mục.");
    } catch(e) {setMessage(e.message||"Xuất PDF không thành công.",true);}
    finally {state.busy=false;updateButtons();}
  }
  function install() {
    const home=$("#homePage");
    if(!home||$("#estaAdminSummaryPage"))return;
    const css=document.createElement("style");css.id="estaAdminSummaryStyles";
    css.textContent='#homePage.estaAdminSummaryOpen>:not(#estaAdminSummaryPage){display:none!important}'+
      '#estaAdminSummaryPage{background:#f2eddf;color:#34463b;border:1px solid #ddd5be;border-radius:16px;padding:20px;margin:0 0 20px;font-family:Inter,Arial,sans-serif}'+
      '#estaAdminSummaryPage *{box-sizing:border-box}#estaAdminSummaryPage h2,#estaAdminSummaryPage h3,#estaAdminSummaryPage p{margin:0}'+
      '#estaAdminSummaryPage .asHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}'+
      '#estaAdminSummaryPage h2{font-size:23px;color:#315347}#estaAdminSummaryPage .asSub{font-size:12px;color:#6c766d;margin-top:6px}'+
      '#estaAdminSummaryPage .asBtn{border:1px solid #8ca18e;border-radius:9px;background:#fff;color:#315347;padding:10px 13px;font:inherit;font-size:13px;cursor:pointer}'+
      '#estaAdminSummaryPage .asPrimary{background:#315b4b;color:#fff;border-color:#315b4b;font-weight:700}'+
      '#estaAdminSummaryPage button:disabled{opacity:.5;cursor:not-allowed}'+
      '#estaAdminSummaryPage .asCard{background:#fffdf8;border:1px solid #ded8c6;border-radius:12px;padding:16px;margin-bottom:14px}'+
      '#estaAdminSummaryPage .asCard h3{font-size:15px;color:#315347;margin-bottom:11px}'+
      '#estaAdminSummaryPage .asActions{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:12px 0}'+
      '#estaAdminSummaryPage .asDateFields{display:flex;flex-wrap:wrap;gap:12px}'+
      '#estaAdminSummaryPage .asDateFields label{display:grid;gap:5px;min-width:150px;flex:1;color:#637264;font-size:12px}'+
      '#estaAdminSummaryPage input[type=date]{padding:10px;border:1px solid #d6d8d0;border-radius:8px;max-width:100%;font:inherit}'+
      '#estaAdminSummaryPage .asGrid{display:grid;grid-template-columns:1fr 1.5fr;gap:14px}'+
      '#estaAdminSummaryPage .asChecks{display:grid;grid-template-columns:1fr 1fr;gap:9px}'+
      '#estaAdminSummaryPage .asChecks label{display:flex;align-items:flex-start;gap:7px;font-size:12px;cursor:pointer;padding:7px;border:1px solid #e7e5d8;border-radius:8px}'+
      '#estaAdminSummaryPage .asChecks input{accent-color:#315b4b;width:16px;height:16px;flex:0 0 16px;margin-top:2px}'+
      '#estaAdminSummaryPage .asChecks b{display:block;font-size:12px}#estaAdminSummaryPage .asChecks small{display:block;color:#7a8178;font-size:10px;margin-top:3px}'+
      '#estaAdminSummaryPage .asKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:12px 0}'+
      '#estaAdminSummaryPage .asKpis div{background:#e6eddf;border-radius:9px;padding:12px}'+
      '#estaAdminSummaryPage .asKpis span{display:block;font-size:10px;color:#5b695c}#estaAdminSummaryPage .asKpis strong{font-size:21px}'+
      '#estaAdminSummaryPage .asMessage{font-size:12px;color:#567456;margin:9px 0;line-height:1.5}'+
      '#estaAdminSummaryPage .asMessage.error{color:#a13636}'+
      '#estaAdminSummaryPage .asTable{overflow:auto;max-height:620px}'+
      '#estaAdminSummaryPage table{border-collapse:collapse;width:100%;min-width:730px;font-size:11px}'+
      '#estaAdminSummaryPage th{background:#315b4b;color:white;text-align:left;padding:10px;position:sticky;top:0}'+
      '#estaAdminSummaryPage td{padding:9px;border-bottom:1px solid #e7e6dc;vertical-align:top}'+
      '#estaAdminSummaryPage td small{display:block;color:#6d796f;margin-top:3px}'+
      '#estaAdminSummaryPage td span.as-danger{color:#9b2936;font-weight:700}'+
      '#estaAdminSummaryPage td span.as-pending{color:#9b642a;font-weight:700}'+
      '#estaAdminSummaryPage td span.as-done{color:#287350;font-weight:700}'+
      '#estaAdminSummaryPage .asHint{font-size:11px;color:#6c776b;margin:8px 0}'+
      '#navAdminSummary,#asTopShortcut{display:inline-flex;align-items:center;gap:8px}'+
      '#asTopShortcut{white-space:nowrap;border:1px solid #7a987e;background:#e5efdf;color:#295041;border-radius:9px;padding:9px 10px;font-size:12px;font-weight:700;cursor:pointer}'+
      '#asTopShortcut[hidden],#navAdminSummary[hidden]{display:none!important}'+
      '@media(max-width:740px){#estaAdminSummaryPage{padding:11px}#estaAdminSummaryPage .asGrid{grid-template-columns:1fr}#estaAdminSummaryPage .asChecks{grid-template-columns:1fr 1fr}#estaAdminSummaryPage .asKpis{grid-template-columns:1fr 1fr}#estaAdminSummaryPage .asHead{align-items:flex-start}#estaAdminSummaryPage h2{font-size:19px}}';
    document.head.appendChild(css);
    const view=document.createElement("section");view.id="estaAdminSummaryPage";
    view.innerHTML='<div class="asHead"><div><h2>Báo cáo tổng hợp</h2><p class="asSub">ESTA · Báo cáo Giám sát Kỹ thuật · Bốn dự án và công việc riêng Admin</p></div><button id="asBack" class="asBtn" type="button">← Tổng quan Admin</button></div>'+
      '<div class="asCard"><h3>1. Kỳ báo cáo</h3><div class="asDateFields"><label>Từ ngày<input id="asFrom" type="date"></label><label>Đến ngày<input id="asTo" type="date"></label></div><div class="asActions"><button id="asWeek" class="asBtn" type="button">Tuần hiện tại · Thứ Hai–Chủ nhật</button><button id="asRefresh" class="asBtn" type="button">↻ Làm mới dữ liệu</button></div></div>'+
      '<div class="asGrid"><div class="asCard"><h3>2. Chọn dự án</h3><div class="asActions"><button class="asBtn" data-as-project-all="1">Chọn cả 4</button><button class="asBtn" data-as-project-all="0">Bỏ chọn</button></div><div class="asChecks" id="asProjectList"></div><p class="asHint">Công việc riêng của Admin đi kèm khi tích “Công việc”, kể cả không liên kết dự án.</p></div>'+
      '<div class="asCard"><h3>3. Chọn hạng mục cần xuất PDF</h3><div class="asActions"><button class="asBtn" data-as-cat-all="1">Chọn tất cả</button><button class="asBtn" data-as-cat-all="0">Bỏ chọn</button></div><div class="asChecks" id="asCategoryList"></div></div></div>'+
      '<div class="asCard"><h3>4. Xem trước và xuất báo cáo</h3><label style="font-size:12px"><input type="checkbox" id="asPhotos" checked> Kèm ảnh hiện trường (tối đa 180 ảnh)</label><p class="asMessage" id="asMessage" role="status" aria-live="polite"></p><div class="asKpis" id="asKpis"></div><p class="asHint" id="asPreviewHint"></p><div class="asTable"><table><thead><tr><th>STT</th><th>Hạng mục</th><th>Dự án / Nguồn</th><th>Nội dung</th><th>Ngày / Hạn</th><th>Trạng thái</th></tr></thead><tbody id="asRows"></tbody></table></div><p class="asHint" id="asTrunc"></p><div class="asActions"><button class="asBtn asPrimary" id="asExport" type="button">Xuất PDF tổng hợp</button></div><p class="asHint">File PDF: BÁO CÁO GIÁM SÁT KỸ THUẬT · Người ký: Giám sát kỹ thuật – Sĩ Phan. Dữ liệu các dự án được giữ độc lập.</p></div>';
    home.appendChild(view);
    $("#asFrom").value=state.from;$("#asTo").value=state.to;
    const nav=$("#navAdmin");
    if(nav && !$("#navAdminSummary")){
      const b=document.createElement("button");b.id="navAdminSummary";b.type="button";b.hidden=true;
      b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V4h10l4 4v12zM9 11h7M9 15h7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><span>Báo cáo tổng hợp</span>';
      nav.insertAdjacentElement("afterend",b);b.addEventListener("click",open);
    }
    const top=$(".estaTopbar .headerTools");
    if(top && !$("#asTopShortcut")){
      const b=document.createElement("button");b.id="asTopShortcut";b.type="button";b.hidden=true;b.textContent="▤ Báo cáo tổng hợp";
      top.prepend(b);b.addEventListener("click",open);
    }
    view.addEventListener("click",e=>{
      const target=e.target;
      if(target.closest("#asBack")){close();return;}
      if(target.closest("#asWeek")){[state.from,state.to]=mondayToSunday();$("#asFrom").value=state.from;$("#asTo").value=state.to;fetchData();return;}
      if(target.closest("#asRefresh")){fetchData();return;}
      if(target.closest("#asExport")){exportPDF();return;}
      const pa=target.closest("[data-as-project-all]");
      if(pa){state.projects=new Set(pa.dataset.asProjectAll==="1"?projectSpecs.map(x=>x[0]):[]);renderSelectors();fetchData();return;}
      const ca=target.closest("[data-as-cat-all]");
      if(ca){state.categories=new Set(ca.dataset.asCatAll==="1"?categorySpecs.map(x=>x[0]):[]);renderSelectors();fetchData();}
    });
    view.addEventListener("change",e=>{
      const target=e.target;
      if(target.id==="asFrom"||target.id==="asTo"){
        const from=$("#asFrom").value,to=$("#asTo").value;
        if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||from>to){setMessage("Ngày kết thúc phải từ ngày bắt đầu trở đi.",true);return;}
        state.from=from;state.to=to;renderResults();return;
      }
      if(target.dataset.asProject){if(target.checked)state.projects.add(target.dataset.asProject);else state.projects.delete(target.dataset.asProject);fetchData();return;}
      if(target.dataset.asCategory){if(target.checked)state.categories.add(target.dataset.asCategory);else state.categories.delete(target.dataset.asCategory);fetchData();return;}
    });
    $("#navHome")?.addEventListener("click",close);
    for(const id of ["#navAdmin","#navProjectOverview","#navWork","#navEnergy","#navMaintenance","#navInventory","#navContractor"])$(id)?.addEventListener("click",close);
    renderSelectors();renderResults();syncShortcut();
  }
  function syncShortcut() {
    const vis=global();
    for(const id of ["#navAdminSummary","#asTopShortcut"]){const el=$(id);if(el)el.hidden=!vis;}
    $("#navAdminSummary")?.classList.toggle("active",vis && !!$("#homePage.estaAdminSummaryOpen"));
  }
  function close() {
    $("#homePage")?.classList.remove("estaAdminSummaryOpen");syncShortcut();
  }
  function open() {
    if(!allowed())return;
    if(!global() && typeof openAdminOverview==="function")openAdminOverview();
    if(!global())return;
    if(typeof showHome==="function")showHome();
    install();$("#homePage")?.classList.add("estaAdminSummaryOpen");
    syncShortcut();fetchData();
  }
  window.ESTAAdminSummary={open,close,refresh:fetchData};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
  const initialRender=typeof renderHomeDashboard==="function"?renderHomeDashboard:null;
  if(initialRender){renderHomeDashboard=function(){const result=initialRender.apply(this,arguments);syncShortcut();return result;};}
})();
