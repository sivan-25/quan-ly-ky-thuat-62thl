/* ESTA | NANGCAP - unified building equipment register.
 * Isolated from the four operating projects and their maintenance schedules.
 * Data: public.building_equipment_profiles_nangcap, building_id = NANGCAP.
 */
(()=>{
"use strict";
const BID="NANGCAP",TABLE="building_equipment_profiles_nangcap";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const G=[
 ["pccc","PCCC",30,[
 ["Bơm chữa cháy điện","Phòng bơm","bom_dien"],["Bơm bù áp (Jockey)","Phòng bơm","bom_jockey"],["Bơm chữa cháy diesel","Phòng bơm","bom_diesel"],["Tủ trung tâm báo cháy","Phòng điều khiển","bao_chay"],["Họng nước chữa cháy vách tường","Các tầng","hong_nuoc"],["Bình chữa cháy xách tay","Các tầng","binh_cc"],["Hệ thống sprinkler","Các tầng","sprinkler"],["Đèn exit và chiếu sáng sự cố","Thang thoát hiểm","den_exit"],["Quạt tăng áp cầu thang","Mái","quat_tang_ap"]]],
 ["dien","Điện (MSB)",30,[["Tủ điện tổng MSB","Phòng MSB","msb"],["Máy biến áp","Phòng máy biến áp","mba"],["Tủ tụ bù","Phòng MSB","tu_bu"],["Tủ ATS","Phòng MSB","ats"],["Tủ điện tầng","Các tầng","tu_tang"]]],
 ["mpd","Máy phát điện",14,[["Máy phát điện dự phòng","Phòng máy phát","mpd"],["Bồn dầu DO","Phòng máy phát","bon_dau"],["Ắc quy khởi động","Phòng máy phát","ac_quy"]]],
 ["hvac","Điều hòa (HVAC)",30,[["Chiller","Phòng chiller","chiller"],["Tháp giải nhiệt","Mái","thap"],["AHU","Phòng AHU","ahu"],["FCU","Các tầng","fcu"],["Quạt thông gió và hút khói","Mái / hầm","quat"]]],
 ["tm","Thang máy",30,[["Thang máy số 1","Giếng thang","thang"],["Thang máy số 2","Giếng thang","thang"],["Thang hàng / cứu hỏa","Giếng thang","thang"],["Bộ cứu hộ tự động (ARD)","Phòng máy thang","ard"]]],
 ["bom","Bơm & cấp thoát nước",30,[["Bơm tăng áp","Phòng bơm","bom"],["Bồn nước mái","Mái","bon"],["Bồn nước ngầm","Tầng hầm","bon"],["Bơm thoát nước hầm","Tầng hầm","bom_thoat"],["Hệ thống xử lý nước thải","Tầng hầm","xlnt"]]],
 ["cam","Camera & An ninh",30,[["Đầu ghi hình NVR","Phòng an ninh","nvr"],["Camera hành lang và thang","Các tầng","camera"],["Kiểm soát ra vào","Sảnh","acs"],["Barrier bãi xe","Cổng xe","barrier"]]],
 ["cs","Chiếu sáng & Điện nhẹ",30,[["Chiếu sáng khu vực chung","Các tầng","den"],["Chiếu sáng ngoại thất","Mặt ngoài","den"],["Hệ thống âm thanh thông báo","Các tầng","am_thanh"],["Mạng và wifi khu vực chung","Phòng kỹ thuật","mang"]]],
 ["kc","Kết cấu & Xây dựng",90,[["Mái và chống thấm","Mái","mai"],["Mặt dựng và kính","Mặt ngoài","mat_dung"],["Sàn và tường tầng hầm","Tầng hầm","ham"],["Cửa thoát hiểm","Các tầng","cua"],["Lan can và tay vịn","Các tầng","lan_can"]]]
];
const F={
 bom_dien:"cs|Công suất|kW;ll|Lưu lượng|m³/h;ca|Cột áp|bar;da|Điện áp|V;dong|Dòng định mức|A;kd|Áp suất khởi động|bar;dung|Áp suất dừng|bar",
 bom_jockey:"cs|Công suất|kW;ll|Lưu lượng|m³/h;ca|Cột áp|bar;kd|Áp suất khởi động|bar",
 bom_diesel:"cs|Công suất|kW;ll|Lưu lượng|m³/h;ca|Cột áp|bar;hdc|Hãng động cơ;mdc|Model động cơ;bon|Dung tích dầu|lít",
 bao_chay:"zone|Số zone;loop|Số loop;nguon|Nguồn cấp|V;aq|Ắc quy|Ah",
 msb:"da|Điện áp|V;dong|Dòng định mức|A;icu|Icu|kA;cb|CB tổng",
 mba:"cs|Công suất|kVA;so|Điện áp sơ cấp|kV;thu|Điện áp thứ cấp|V;loai|Loại MBA",
 tu_bu:"cs|Tổng công suất bù|kVAr;cap|Số cấp bù;cos|Cos φ mục tiêu",
 ats:"dong|Dòng định mức|A;tg|Thời gian chuyển nguồn|giây",
 mpd:"kva|Công suất|kVA;kw|Công suất|kW;hz|Tần số|Hz;bon|Dung tích dầu|lít;gio|Giờ chạy|giờ",
 chiller:"rt|Công suất lạnh|RT;kw|Điện tiêu thụ|kW;gas|Môi chất lạnh;cop|COP / IPLV",
 thap:"rt|Công suất giải nhiệt|RT;ll|Lưu lượng nước|m³/h",
 ahu:"gio|Lưu lượng gió|m³/h;lanh|Công suất lạnh|kW",
 fcu:"lanh|Công suất lạnh|kW;gio|Lưu lượng gió|m³/h",
 thang:"tt|Tải trọng|kg;ng|Số người;vt|Tốc độ|m/s;dd|Số điểm dừng;kdinh|Hạn kiểm định",
 bon:"dt|Dung tích|m³;vl|Vật liệu;kt|Kích thước|m",
 xlnt:"cs|Công suất xử lý|m³/ngày;cn|Công nghệ xử lý",
 nvr:"kenh|Số kênh;hdd|Ổ cứng|TB;ngay|Lưu trữ|ngày",
 camera:"sl|Số lượng;pg|Độ phân giải|MP;loai|Loại camera",
 den:"loai|Loại đèn;sl|Số lượng;cs|Công suất đèn|W",
 mai:"dt|Diện tích|m²;vl|Vật liệu chống thấm"
};


/* Danh mục thông số đầy đủ đối chiếu với tài liệu HTML ESTA người vận hành cung cấp.
   Giữ keys hiện hữu để không mất thông số đã nhập trong hồ sơ cũ. */
const FULL_FIELDS={
 bom_dien:"cs|Công suất động cơ|kW;ll|Lưu lượng định mức|m³/h;ca|Cột áp định mức|bar;da|Điện áp|V;dong|Dòng định mức|A;td|Tốc độ|vòng/phút;kd|Áp suất khởi động|bar;dung|Áp suất dừng|bar;dn|Đường kính ống hút / đẩy|DN;cdk|Chế độ điều khiển",
 bom_jockey:"cs|Công suất động cơ|kW;ll|Lưu lượng định mức|m³/h;ca|Cột áp định mức|bar;da|Điện áp|V;dong|Dòng định mức|A;kd|Áp suất khởi động|bar;dung|Áp suất dừng|bar;bt|Bình tích áp|lít",
 bom_diesel:"cs|Công suất động cơ|kW;hp|Công suất động cơ|HP;ll|Lưu lượng định mức|m³/h;ca|Cột áp định mức|bar;td|Tốc độ|vòng/phút;hdc|Hãng động cơ;mdc|Model động cơ;bon|Dung tích bồn dầu|lít;tt|Mức tiêu thụ nhiên liệu|lít/giờ;aq|Ắc quy khởi động (số bình / dung lượng);kd|Áp suất khởi động|bar",
 bao_chay:"zone|Số zone / kênh;loop|Số loop;nguon|Nguồn cấp|V;aq|Ắc quy dự phòng|Ah;dau|Số đầu báo kết nối;gt|Giao thức / chuẩn;mc|Số module điều khiển",
 hong_nuoc:"sl|Số lượng họng;dk|Đường kính van / vòi|DN;cd|Chiều dài vòi|m;ap|Áp suất làm việc|bar;tang|Các tầng lắp đặt",
 binh_cc:"loai|Loại (bột ABC, CO₂…);sl|Số lượng;kl|Khối lượng mỗi bình|kg;nap|Hạn nạp / kiểm định|@",
 sprinkler:"dau|Số đầu phun;nhiet|Nhiệt độ kích hoạt|°C;van|Số van báo động;vung|Vùng bảo vệ;ap|Áp suất làm việc|bar",
 den_exit:"sl|Số lượng;cs|Công suất mỗi đèn|W;tg|Thời gian dự phòng|phút;pin|Loại pin / ắc quy",
 quat_tang_ap:"cs|Công suất|kW;ll|Lưu lượng|m³/h;ap|Áp suất|Pa;da|Điện áp|V;dong|Dòng định mức|A;td|Tốc độ|vòng/phút;kv|Khu vực phục vụ",
 msb:"da|Điện áp định mức|V;dong|Dòng định mức|A;icu|Dòng cắt ngắn mạch Icu|kA;ngan|Số ngăn tủ;cb|CB tổng (loại / dòng);ip|Cấp bảo vệ IP;do|Thiết bị đo đếm",
 mba:"cs|Công suất|kVA;so|Điện áp sơ cấp|kV;thu|Điện áp thứ cấp|V;loai|Loại (dầu / khô);dd|Tổ đấu dây;nd|Ngưỡng cảnh báo nhiệt độ|°C;tl|Trọng lượng|kg",
 tu_bu:"cs|Tổng công suất bù|kVAr;cap|Số cấp bù;cos|Cos φ mục tiêu;da|Điện áp|V;dk|Bộ điều khiển",
 ats:"dong|Dòng định mức|A;da|Điện áp|V;tg|Thời gian chuyển nguồn|giây;loai|Loại (CB / contactor);cd|Chế độ vận hành",
 tu_tang:"dong|Dòng định mức|A;cb|CB tổng (loại / dòng);sl|Số MCB / MCCB;tang|Tầng cấp điện",
 mpd:"kva|Công suất|kVA;kw|Công suất|kW;da|Điện áp|V;hz|Tần số|Hz;td|Tốc độ|vòng/phút;hdc|Hãng động cơ;mdc|Model động cơ;tt|Tiêu thụ nhiên liệu (75% tải)|lít/giờ;bon|Dung tích bồn dầu|lít;gio|Số giờ chạy tích lũy|giờ;ct|Chu kỳ chạy thử|ngày",
 bon_dau:"dt|Dung tích|lít;vl|Vật liệu;muc|Mức dầu hiện tại|lít;bom|Bơm cấp dầu",
 ac_quy:"da|Điện áp|V;dl|Dung lượng|Ah;sb|Số bình;loai|Loại ắc quy;thay|Ngày thay gần nhất|@",
 chiller:"rt|Công suất lạnh|RT;kw|Công suất điện|kW;gas|Môi chất lạnh;cop|COP / IPLV;ll|Lưu lượng nước lạnh|m³/h;nv|Nhiệt độ nước vào|°C;nr|Nhiệt độ nước ra|°C;da|Điện áp|V;mn|Số máy nén",
 thap:"rt|Công suất giải nhiệt|RT;ll|Lưu lượng nước|m³/h;quat|Công suất mỗi quạt|kW;sq|Số quạt;nv|Nhiệt độ nước vào|°C;nr|Nhiệt độ nước ra|°C",
 ahu:"gio|Lưu lượng gió|m³/h;quat|Công suất quạt|kW;lanh|Công suất lạnh|kW;kv|Khu vực phục vụ;loc|Loại / kích thước lọc;bt|Biến tần",
 fcu:"lanh|Công suất lạnh|kW;gio|Lưu lượng gió|m³/h;sl|Số lượng;tang|Tầng lắp đặt",
 quat:"cs|Công suất|kW;ll|Lưu lượng|m³/h;ap|Áp suất|Pa;da|Điện áp|V;td|Tốc độ|vòng/phút;kv|Khu vực phục vụ",
 thang:"tt|Tải trọng|kg;ng|Số người;vt|Tốc độ|m/s;dd|Số điểm dừng;ht|Hành trình|m;mt|Công suất motor|kW;loai|Loại (MRL / có phòng máy);dk|Hãng bộ điều khiển;kdinh|Hạn kiểm định|@",
 ard:"cs|Công suất|kVA;da|Điện áp|V;tg|Thời gian cứu hộ|giây;aq|Ắc quy;thang|Thang đi kèm",
 bom:"cs|Công suất|kW;ll|Lưu lượng|m³/h;ca|Cột áp|bar;da|Điện áp|V;dong|Dòng định mức|A;td|Tốc độ|vòng/phút;sb|Số bơm (chạy / dự phòng);bt|Biến tần;btap|Bình tích áp|lít",
 bon:"dt|Dung tích|m³;vl|Vật liệu;kt|Kích thước (D×R×C)|m;ng|Số ngăn;phao|Phao / cảm biến mực nước;vs|Ngày vệ sinh gần nhất|@",
 bom_thoat:"cs|Công suất|kW;ll|Lưu lượng|m³/h;ca|Cột áp|m;loai|Loại (chìm / cạn);sb|Số bơm;phao|Phao điều khiển",
 xlnt:"cs|Công suất xử lý|m³/ngày;cn|Công nghệ xử lý;sb|Số bơm / máy thổi khí;tc|Tiêu chuẩn xả thải",
 nvr:"kenh|Số kênh;hdd|Dung lượng ổ cứng|TB;ngay|Số ngày lưu trữ|ngày;ip|Địa chỉ IP;raid|Cấu hình RAID;nguon|Nguồn cấp|V",
 camera:"sl|Số lượng;pg|Độ phân giải|MP;loai|Loại (dome / bullet / PTZ);poe|Cấp nguồn (PoE…);kv|Khu vực lắp đặt",
 acs:"cua|Số cửa / điểm kiểm soát;the|Loại thẻ;pm|Phần mềm quản lý;ndp|Nguồn dự phòng",
 barrier:"loai|Loại barrier;tg|Thời gian mở|giây;cd|Chiều dài thanh chắn|m;cs|Công suất|W;da|Điện áp|V",
 den:"loai|Loại đèn;sl|Số lượng;cs|Công suất mỗi đèn|W;tong|Tổng công suất|kW;dk|Điều khiển (tay / timer / BMS)",
 am_thanh:"cs|Công suất ampli|W;loa|Số loa;vung|Số vùng;pccc|Kết nối báo cháy",
 mang:"ap|Số access point;sw|Số switch;bw|Băng thông|Mbps;nm|Nhà cung cấp mạng",
 mai:"dt|Diện tích|m²;vl|Vật liệu chống thấm;tc|Ngày thi công|@;bhct|Bảo hành chống thấm đến|@",
 mat_dung:"dt|Diện tích|m²;vl|Vật liệu;kinh|Loại kính;day|Độ dày kính|mm",
 ham:"dt|Diện tích|m²;tai|Tải trọng sàn|kN/m²;tang|Số tầng hầm;ct|Giải pháp chống thấm",
 cua:"sl|Số lượng;loai|Loại cửa;lua|Giới hạn chịu lửa|phút;dong|Cơ cấu đóng cửa",
 lan_can:"cd|Tổng chiều dài|m;vl|Vật liệu;cao|Chiều cao|mm"
};
const EXTRA_PROFILE="xuatxu|Xuất xứ;nam|Năm sản xuất";
const INSTALL_FIELDS="lap|Ngày lắp đặt|@;bh|Hết hạn bảo hành|@;nhathau|Nhà thầu lắp đặt;dvbt|Đơn vị bảo trì;lienhe|Liên hệ bảo trì (SĐT)";
const parseFieldSpec=s=>String(s||"").split(";").filter(Boolean).map(x=>{const [key,title,unit=""]=x.split("|");return {key,title,unit}});
function extraFields(){return parseFieldSpec(EXTRA_PROFILE)}
function installFields(){return parseFieldSpec(INSTALL_FIELDS)}
function inspectionDue(x){
 const meta=metaOf(x),last=meta.lastCheck||meta.history?.at(-1)?.date;
 if(!last||!meta.verified||x.virtual)return "";
 const days=Math.max(1,Number(meta.interval)||G.find(g=>g[1]===x.system_group)?.[2]||30);
 const d=new Date(last+"T12:00:00Z");
 if(Number.isNaN(d.getTime()))return "";
 d.setUTCDate(d.getUTCDate()+days);
 return d.toISOString().slice(0,10);
}
function viDate(date){
 if(!date)return "—";
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
 return m?m[3]+"/"+m[2]+"/"+m[1]:String(date);
}
function isDue(x){const due=inspectionDue(x),d=new Date(),today=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");return !!due&&due<today}
function conditionRank(x){const c=conditionOf(x);return ({hu:0,sua:1,theodoi:2,chua:3,tot:4,unverified:5,mau:6})[c]??7}

const groups=G.map(g=>[g[1],g[0],g[3].map(x=>x[0]).concat(["Khác"])]);
const SEEDS=G.flatMap(g=>g[3].map((x,i)=>({
 id:"sample:"+g[0]+":"+i,seedKey:g[0]+":"+i,name:x[0],equipment_type:x[0],system_group:g[1],
 location:x[1],_technicalType:x[2],_cadence:g[2],status:"",quantity:1,
 virtual:true,specs:{_estaUpgrade:{seedKey:g[0]+":"+i,verified:false,condition:"chua",history:[]}}
})));
const CONDITIONS={mau:"Mẫu tham khảo",unverified:"Chưa xác minh",chua:"Chưa kiểm tra",tot:"Tốt",theodoi:"Cần theo dõi",hu:"Hư hỏng",sua:"Đang sửa",quahan:"Quá hạn kiểm tra"};
const metaOf=x=>x?.specs?._estaUpgrade||{};
const realRows=()=>items.filter(x=>!x.virtual);
function catalog(){
 const keys=new Set(items.map(x=>metaOf(x).seedKey).filter(Boolean));
 return items.concat(SEEDS.filter(x=>!keys.has(x.seedKey)));
}
function conditionOf(x){
 if(x.virtual)return "mau";
 const meta=metaOf(x);
 return !meta.verified?"unverified":meta.condition||"chua";
}
const groupCount=k=>catalog().filter(x=>x.system_group===k).length;

const statuses=["Đang sử dụng","Dự phòng","Cần theo dõi","Đang sửa chữa","Ngừng sử dụng"];
let items=[],linkedAssets=[],fetchedAt=0,loading=null,error="",search="",group="",status="",dialog=null,editId=null,editingSeed="",editingType="";
const active=()=>String(typeof currentBuilding!=="undefined"?currentBuilding?.id:"")===BID && typeof projectOverviewActive!=="undefined" && projectOverviewActive;
const allowed=()=>active()&&!!centralSession?.access_token&&(!!currentAccount?.is_admin||String(currentBuilding?.role||"").toLowerCase()!=="viewer");
const opt=(a,v)=>a.map(x=>'<option value="'+esc(x)+'"'+(x===v?' selected':'')+'>'+esc(x)+'</option>').join("");
const gopts=()=>groups.map(g=>g[0]);
const safeQty=n=>Number.isFinite(+n)?Math.max(1,Math.floor(Number(n))):1;
const eqCount=()=>items.filter(x=>metaOf(x).verified).reduce((n,x)=>n+safeQty(x.quantity),0);

const label=x=>x?.name||x?.equipment_type||"Chưa đặt tên";
const isPresent=()=>active()&&!!$("updateAssetsPage")&&!$("updateAssetsPage").classList.contains("hide");
async function load(force=false){
 if(!active())return;
 if(loading)return loading;
 if(!force&&fetchedAt&&Date.now()-fetchedAt<20000)return;
 const building=BID;
 loading=(async()=>{
  try{
   const result=await sbFetch("/rest/v1/"+TABLE+"?building_id=eq."+encodeURIComponent(building)+"&select=*&order=system_group.asc,name.asc",{token:centralSession?.access_token});
   if(!active())return;
   items=Array.isArray(result)?result:[];error="";fetchedAt=Date.now();
   sbFetch("/rest/v1/maintenance_assets?building_id=eq.NANGCAP&select=id,name,code,location&order=name.asc",{token:centralSession?.access_token}).then(a=>{if(active())linkedAssets=Array.isArray(a)?a:[]}).catch(()=>{linkedAssets=[]});
  }catch(e){if(active())error=e?.message||"Không tải được danh mục thiết bị.";}
  finally{loading=null;if(isPresent())render($("updateAssetsPage"),true);}
 })();
 return loading;
}

function currentRows(){
 const q=search.trim().toLocaleLowerCase("vi-VN");
 return catalog().filter(x=>(!group||x.system_group===group)&&(!status||(status==="quahan"?isDue(x):conditionOf(x)===status))&&
  (!q||[x.name,x.code,x.system_group,x.equipment_type,x.brand,x.model,x.location,x.note].join(" ").toLocaleLowerCase("vi-VN").includes(q)));
}
function list(){
 const host=$("ueRows"),counter=$("ueResultCount");
 if(!host)return;
 const rows=currentRows().slice().sort((a,b)=>conditionRank(a)-conditionRank(b)||Number(isDue(b))-Number(isDue(a))||label(a).localeCompare(label(b),"vi"));
 if(counter)counter.textContent=rows.length+" / "+catalog().length+" hạng mục";
 document.querySelectorAll("#updateAssetsPage [data-ue-group]").forEach(b=>b.classList.toggle("active",b.dataset.ueGroup===group));
 document.querySelectorAll("#updateAssetsPage [data-ue-status-chip]").forEach(b=>{
  const selected=b.dataset.ueStatusChip===status;b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected));
 });
 if(!rows.length){host.innerHTML='<div class="ueEmpty"><b>Không có thiết bị phù hợp.</b><p>Thử đổi nhóm hệ thống, tình trạng hoặc từ khóa tìm kiếm.</p><button type="button" class="ueBtnSecondary" id="ueClearFilter">Bỏ bộ lọc</button></div>';
  $("ueClearFilter").onclick=()=>{search="";group="";status="";render($("updateAssetsPage"),true)};return}
 host.innerHTML=rows.map(x=>{
  const c=conditionOf(x),virt=!!x.virtual,due=inspectionDue(x),overdue=isDue(x),meta=metaOf(x);
  const latest=meta.lastCheck||meta.history?.at(-1)?.date||"";
  const detail=[x.code|| (virt?"Mẫu · Chưa tạo hồ sơ":"Chưa có mã"),[x.brand,x.model].filter(Boolean).join(" / "),!virt?"SL: "+safeQty(x.quantity):""].filter(Boolean).join(" · ");
  return '<button type="button" class="ueItem'+(virt?' ueVirtual':'')+(overdue?' ueOverdue':'')+'" data-ue-id="'+esc(x.id)+'" aria-label="Xem hồ sơ '+esc(label(x))+'">'+
   '<div class="ueItemId"><span class="ueItemGlyph" aria-hidden="true">'+(virt?'◇':'⚙')+'</span><span><strong>'+esc(label(x))+'</strong><small>'+esc(detail)+'</small></span></div>'+
   '<span class="ueItemGroup">'+esc(x.system_group)+'</span>'+
   '<span class="ueState '+(["hu","sua"].includes(c)?"ueCritical":c==="theodoi"?"ueWarn":c==="tot"?"ueGood":"ueStopped")+'">'+esc(CONDITIONS[c]||"Chưa kiểm tra")+'</span>'+
   '<span class="ueItemDate"><small class="ueMobileLabel">Kiểm tra</small>'+viDate(latest)+'</span>'+
   '<span class="ueItemDue'+(overdue?' ueDateOverdue':'')+'"><small class="ueMobileLabel">Hạn kế tiếp</small>'+viDate(due)+(overdue?'<em>Quá hạn</em>':'')+'</span>'+
   '<span class="ueItemPlace">'+esc(x.location||"—")+'</span><span class="ueArrow">›</span></button>';
 }).join("");
 host.querySelectorAll("[data-ue-id]").forEach(btn=>btn.onclick=()=>openForm(btn.dataset.ueId));
}
function render(page,skipLoad=false){
 if(!active()||!page)return;
 const count=catalog().length,verified=items.filter(x=>metaOf(x).verified);
 const alerts=verified.filter(x=>["hu","sua","theodoi"].includes(conditionOf(x))||isDue(x));
 page.classList.add("uePage");
 page.innerHTML=
  '<section class="ueHero"><div><span class="ueEyebrow">ESTA · BẢN NÂNG CẤP</span><h1>Thông tin hệ thống tòa nhà</h1><p>9 hệ thống · 44 thiết bị mẫu · Tra cứu thông số và lịch sử kiểm tra</p></div><div class="ueHeroButtons"><button type="button" class="ueBtnSecondary" id="ueRefresh">↻ Làm mới</button><button type="button" class="ueBtnSecondary" id="uePrint">↓ In / PDF</button><button type="button" class="ueBtnPrimary" id="ueAdd"'+(!allowed()?' disabled':'')+'>＋ Thêm thiết bị</button></div></section>'+
  '<section class="ueStats"><div><small>Danh mục có sẵn</small><b>'+SEEDS.length+'</b><em>Mẫu chưa xác minh</em></div><div><small>Hồ sơ đã lưu</small><b>'+items.length+'</b><em>Dữ liệu dự án</em></div><div><small>Đã xác minh</small><b>'+verified.length+'</b><em>'+eqCount()+' thiết bị thực tế</em></div><div><small>Cần chú ý / quá hạn</small><b>'+alerts.length+'</b><em>Chỉ tính thiết bị đã xác minh</em></div></section>'+
  '<section class="ueSystemPanel"><header><h2>9 nhóm hệ thống</h2><p>Chọn nhóm để xem thiết bị mẫu hoặc hồ sơ đã lưu.</p></header><div class="ueSystemGrid">'+
  '<button type="button" data-ue-group="" class="ueSystemChip'+(!group?' active':'')+'"><b>Tất cả</b><span>'+count+' mục</span></button>'+
  G.map((g,i)=>'<button type="button" data-ue-group="'+esc(g[1])+'" class="ueSystemChip'+(group===g[1]?' active':'')+'"><b>'+esc(g[1])+'</b><span>'+groupCount(g[1])+' mục</span></button>').join("")+
  '</div></section>'+
  '<section class="uePanel"><header class="uePanelHead"><div><h2>Danh mục thiết bị kỹ thuật</h2><p>Nhấn vào thiết bị để điền thông số, xác minh, ghi kiểm tra hoặc chụp ảnh.</p></div><strong id="ueResultCount"></strong></header>'+
  '<div class="ueFilters"><label class="ueSearch"><span>⌕</span><input id="ueSearch" type="search" placeholder="Tìm tên, mã, hãng, vị trí, ghi chú..." value="'+esc(search)+'" autocomplete="off"></label><select id="ueGroup" aria-label="Nhóm hệ thống"><option value="">Tất cả hệ thống</option>'+opt(gopts(),group)+'</select><select id="ueStatus" aria-label="Tình trạng"><option value="">Mọi tình trạng</option>'+Object.entries(CONDITIONS).map(([k,v])=>'<option value="'+k+'"'+(status===k?' selected':'')+'>'+esc(v)+'</option>').join("")+'</select></div>'+
  (error?'<p class="ueError" role="alert">'+esc(error)+'</p>':'')+
  '<div class="ueQuickState" aria-label="Lọc nhanh theo tình trạng">'+[['','Tất cả'],['hu','Hư hỏng'],['sua','Đang sửa'],['theodoi','Theo dõi'],['quahan','Quá hạn'],['tot','Tốt'],['chua','Chưa kiểm tra']].map(([k,t])=>'<button type="button" data-ue-status-chip="'+k+'" aria-pressed="'+(status===k)+'">'+t+'</button>').join('')+'</div>'+ 
 '<div class="ueListHead"><span>Thiết bị</span><span>Hệ thống</span><span>Tình trạng</span><span>Kiểm tra gần nhất</span><span>Hạn kế tiếp</span><span>Vị trí</span><span></span></div><div id="ueRows" class="ueRows"></div></section>'+
  '<p class="ueSourceNote">44 dòng là mẫu tham khảo, không phải 44 thiết bị đang hoạt động. Dữ liệu chỉ ghi nhận sau khi Lưu và xác minh tại dự án Bản nâng cấp.</p>';
 $("ueRefresh").onclick=()=>{fetchedAt=0;load(true)};
 $("uePrint").onclick=printReport;
 $("ueAdd").onclick=()=>openForm();
 $("ueSearch").oninput=e=>{search=e.target.value;list()};
 $("ueGroup").onchange=e=>{group=e.target.value;list()};
 $("ueStatus").onchange=e=>{status=e.target.value;list()};
 page.querySelectorAll("[data-ue-group]").forEach(b=>b.onclick=()=>{group=b.dataset.ueGroup;$("ueGroup").value=group;list()});
 page.querySelectorAll("[data-ue-status-chip]").forEach(b=>b.onclick=()=>{status=status===b.dataset.ueStatusChip&&status?"":b.dataset.ueStatusChip;$("ueStatus").value=status;list()});
 list();
 if(!skipLoad&&!fetchedAt)load();
}


function ensureDialog(){
 if(dialog?.isConnected)return dialog;
 dialog=document.createElement("div");dialog.id="ueOverlay";dialog.className="ueOverlay";dialog.hidden=true;
 dialog.innerHTML='<div class="ueDialog" role="dialog" aria-modal="true" aria-labelledby="ueModalHeading">'+
 '<header><div><small>ESTA · HỒ SƠ HỆ THỐNG KỸ THUẬT</small><h2 id="ueModalHeading">Hồ sơ thiết bị</h2></div><button type="button" id="ueClose" aria-label="Đóng">×</button></header>'+
 '<form id="ueForm"><div class="ueFormBody">'+
 '<p id="ueFormNotice" class="ueFull ueFormNotice"></p>'+
 '<label>Nhóm hệ thống *<select name="system_group" id="ueEditGroup" required>'+opt(gopts(),"")+'</select></label>'+
 '<label>Loại thiết bị *<select name="equipment_type" id="ueEditType" required></select></label>'+
 '<label class="ueFull">Tên thiết bị *<input name="name" maxlength="140" required></label>'+
 '<label>Mã thiết bị<input name="code" maxlength="80" placeholder="Ví dụ: HVAC-001"></label>'+
 '<label>Vị trí lắp đặt<input name="location" maxlength="140"></label>'+
 '<label>Hãng sản xuất<input name="brand" list="ueBrands" maxlength="120"></label>'+
 '<label>Model<input name="model" maxlength="120"></label>'+
 '<label>Số lượng *<input name="quantity" type="number" min="1" max="500" step="1" required value="1"></label>'+
 '<label>Trạng thái hoạt động<select name="status">'+opt(statuses,"Đang sử dụng")+'</select></label>'+
 '<label>Năm lắp đặt<input name="install_year" type="number" min="1950" max="2100"></label>'+ 
 '<label>Chu kỳ kiểm tra (ngày)<input name="inspectionInterval" type="number" min="1" max="3650" value="30"></label>'+
 '<label>Xác minh thực tế<select name="verified"><option value="0">Chưa xác minh thiết bị</option><option value="1">Đã kiểm tra xác minh tại tòa nhà</option></select></label>'+
 '<label class="ueFull">Liên kết hồ sơ Bảo trì<select name="linkedAsset" id="ueLinkedAsset"><option value="">Chưa liên kết</option></select></label>'+
 '<label>Công suất / thông số<input name="capacity" maxlength="120"></label>'+
 '<label>Số serial<input name="serial" maxlength="140"></label>'+
 '<section id="ueAdvancedSpecs" class="ueFull ueAdvancedSpecs"></section>'+
 '<label class="ueFull">Ghi chú<textarea name="note" rows="2" maxlength="2500"></textarea></label>'+
 '<datalist id="ueBrands"><option value="Daikin"><option value="Mitsubishi"><option value="Panasonic"><option value="KONE"><option value="Schneider"><option value="LS"><option value="Grundfos"><option value="Nagakawa"><option value="Kruger"><option value="Siemens"></datalist>'+
 '<section id="ueInspection" class="ueFull ueInspection" hidden><h3>Kiểm tra & lịch sử tình trạng</h3><p>Chụp ảnh, ghi thông số và lưu minh chứng theo từng lần kiểm tra.</p>'+
 '<div class="ueInspectGrid"><label>Ngày kiểm tra<input type="date" name="checkDate"></label>'+
 '<label>Tình trạng<select name="checkCondition">'+Object.entries(CONDITIONS).filter(([k])=>["chua","tot","theodoi","hu","sua"].includes(k)).map(([k,v])=>'<option value="'+k+'">'+esc(v)+'</option>').join("")+'</select></label>'+
 '<label>Người thực hiện<input name="checkBy" maxlength="120"></label>'+
 '<label>Ảnh minh chứng<input type="file" name="checkPhotos" accept="image/*" multiple></label>'+
 '<label class="ueFull">Ghi chú / Thông số đo<textarea name="checkNote" rows="2" maxlength="1500"></textarea></label></div>'+
 '<button type="button" id="ueCheckSave" class="ueBtnPrimary">✓ Lưu lần kiểm tra</button>'+
 '<h4>Lịch sử kiểm tra</h4><div id="ueHistory"></div></section>'+
 '</div><footer><button type="button" class="ueBtnSecondary" id="ueCancel">Hủy</button>'+
 '<button type="button" class="ueDelete" id="ueDelete" hidden>Xóa hồ sơ</button>'+
 '<button type="submit" class="ueBtnPrimary" id="ueSubmit">Lưu hồ sơ thiết bị</button></footer></form></div>';
 document.body.append(dialog);
 $("ueClose").onclick=closeForm;$("ueCancel").onclick=closeForm;
 dialog.onclick=e=>{if(e.target===dialog)closeForm()};
 $("ueEditGroup").onchange=()=>{editingType="";fillTypes();fillAdvanced(collectAdvanced())};
 $("ueEditType").onchange=()=>{editingType=seedTypeFromForm();fillAdvanced(collectAdvanced())};
 $("ueForm").onsubmit=save;$("ueDelete").onclick=remove;
 $("ueCheckSave").onclick=saveCheck;
 return dialog;
}
function seedTypeFromForm(){
 const name=$("ueEditType").value;
 return SEEDS.find(x=>x.system_group===$("ueEditGroup").value&&x.equipment_type===name)?._technicalType||"";
}
function advancedFields(type){
 return parseFieldSpec(FULL_FIELDS[type]||F[type]||"");
}
function fieldInputs(fields,values){
 return fields.map(f=>'<label>'+esc(f.title)+(f.unit&&f.unit!=="@"?" ("+esc(f.unit)+")":"")+
 '<input name="sp_'+esc(f.key)+'" type="'+(f.unit==="@"?"date":"text")+'" value="'+esc(values[f.key]||"")+'" maxlength="160"></label>').join("");
}
function collectAdvanced(){
 const values={};$("ueAdvancedSpecs")?.querySelectorAll('[name^="sp_"]').forEach(i=>values[i.name.slice(3)]=i.value);return values;
}
function fillAdvanced(values={}){
 const type=editingType||seedTypeFromForm();
 const fields=advancedFields(type),profiles=extraFields(),warranty=installFields();
 const block=(title,arr)=>arr.length?'<section class="ueSpecSection"><h3>'+esc(title)+'</h3><div class="ueInspectGrid">'+fieldInputs(arr,values)+'</div></section>':"";
 $("ueAdvancedSpecs").innerHTML=block("Thông số kỹ thuật · "+$("ueEditType").value,fields)+
 block("Xuất xứ & nhận dạng",profiles)+block("Lắp đặt · bảo hành · nhà thầu",warranty);
 if(!allowed())$("ueAdvancedSpecs").querySelectorAll("input").forEach(x=>x.disabled=true);
}
function renderHistory(x){
 const host=$("ueHistory"),hist=metaOf(x).history||[];
 if(!hist.length){host.innerHTML='<p>Chưa có lần kiểm tra được ghi nhận.</p>';return}
 host.innerHTML=hist.slice().reverse().map(h=>
 '<article class="ueHistoryItem"><strong>'+esc(h.date)+' · '+esc(CONDITIONS[h.condition]||"Chưa kiểm tra")+'</strong>'+
 '<small>'+esc(h.by||"")+'</small><p>'+esc(h.note||"")+'</p>'+
 '<div class="ueHistoryPhotos">'+(h.photos||[]).slice(0,8).map(ref=>'<img alt="Ảnh kiểm tra thiết bị" data-ue-image="'+esc(ref)+'">').join("")+'</div></article>').join("");
 host.querySelectorAll("img[data-ue-image]").forEach(async image=>{
  try{if(typeof mediaObjectUrl==="function"){const u=await mediaObjectUrl(image.dataset.ueImage);if(image.isConnected)image.src=u}}
  catch(e){image.alt="Không mở được hình"}
 });
}

function fillTypes(desired=""){
 const g=groups.find(x=>x[0]===$("ueEditGroup").value);
 const el=$("ueEditType"),types=g?.[2]||["Khác"];
 el.innerHTML=opt(types,desired);
 if(desired&&!types.includes(desired))el.appendChild(new Option(desired,desired,true,true));
}

function openForm(id=""){
 if(!active())return;
 const existing=items.find(x=>String(x.id)===String(id));
 const sample=SEEDS.find(x=>x.id===id);
 if(id&&!existing&&!sample)return;
 const selected=existing||sample||null;
 editId=existing?.id||null;editingSeed=selected?.seedKey||metaOf(selected).seedKey||"";
 editingType=selected?._technicalType||metaOf(selected).technicalType||"";
 const d=ensureDialog(),form=$("ueForm");
 form.reset();$("ueModalHeading").textContent=existing?"Chi tiết & kiểm tra thiết bị":sample?"Tạo hồ sơ từ mẫu":"Thêm thiết bị";
 const values=selected||{system_group:gopts()[0],equipment_type:groups[0][2][0],quantity:1,status:statuses[0]};
 for(const [key,value] of Object.entries(values)){
  const input=form.elements.namedItem(key);
  if(input&&typeof value!=="object")input.value=value??"";
 }
 $("ueEditGroup").value=values.system_group||gopts()[0];fillTypes(values.equipment_type);
 const specs=values.specs||{},meta=metaOf(values);
 form.elements.namedItem("capacity").value=specs.capacity||"";
 form.elements.namedItem("serial").value=specs.serial||"";
 form.elements.namedItem("verified").value=meta.verified?"1":"0";
 form.elements.namedItem("inspectionInterval").value=meta.interval||G.find(g=>g[1]===values.system_group)?.[2]||30;
 $("ueLinkedAsset").innerHTML='<option value="">Chưa liên kết</option>'+
 linkedAssets.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.code||a.name)+' · '+esc(a.name)+'</option>').join("");
 $("ueLinkedAsset").value=meta.linkedAsset||"";
 fillAdvanced(specs);
 $("ueFormNotice").textContent=sample?"Đây là mẫu tham khảo, chưa phải thiết bị thực tế. Hãy điền thông số và xác minh trước khi dùng cho báo cáo vận hành.":
 existing?"Hồ sơ đã lưu. Bạn có thể cập nhật thông tin, ghi lần kiểm tra và lưu ảnh minh chứng.":"Chỉ tạo hồ sơ thực tế khi đã kiểm tra thiết bị tại tòa nhà.";
 $("ueInspection").hidden=!existing;
 if(existing){
  form.elements.namedItem("checkDate").value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  form.elements.namedItem("checkBy").value=String(currentAccount?.display_name||currentAccount?.username||"");
  renderHistory(existing);
 }
 const mayEdit=allowed();
 form.querySelectorAll("input,select,textarea").forEach(el=>el.disabled=!mayEdit);
 $("ueDelete").hidden=!mayEdit||!existing;
 $("ueSubmit").hidden=!mayEdit;$("ueCheckSave").hidden=!mayEdit;
 d.hidden=false;
}
function closeForm(){if(dialog)dialog.hidden=true;editId=null;editingSeed="";editingType=""}


async function save(e){
 e.preventDefault();if(!allowed())return;
 const form=e.currentTarget,button=$("ueSubmit");if(button.disabled)return;
 const field=n=>String(form.elements.namedItem(n)?.value||"").trim();
 const year=Number(field("install_year"));
 const old=items.find(x=>x.id===editId),oldMeta=metaOf(old);
 const type=editingType||seedTypeFromForm();
 const specs={...old?.specs,capacity:field("capacity"),serial:field("serial")};
 [...advancedFields(type),...extraFields(),...installFields()].forEach(f=>{specs[f.key]=field("sp_"+f.key)});
 const asset=field("linkedAsset");
 if(asset&&!linkedAssets.some(x=>x.id===asset))return alert("Thiết bị bảo trì liên kết không hợp lệ");
 const interval=Math.min(3650,Math.max(1,Number(field("inspectionInterval"))||G.find(g=>g[1]===field("system_group"))?.[2]||30));
 specs._estaUpgrade={...oldMeta,seedKey:editingSeed||oldMeta.seedKey||null,verified:field("verified")==="1",linkedAsset:asset,technicalType:type,history:oldMeta.history||[],interval,condition:oldMeta.condition||"chua"};
 const payload={building_id:BID,system_group:field("system_group"),equipment_type:field("equipment_type"),name:field("name"),code:field("code"),
 location:field("location"),brand:field("brand"),model:field("model"),quantity:safeQty(field("quantity")),
 status:field("status"),install_year:year||null,note:field("note"),specs};
 if(!payload.name||!payload.equipment_type||!payload.system_group)return;
 button.disabled=true;button.textContent="Đang lưu...";
 try{
  const id=editId||crypto.randomUUID();
  if(!editId)payload.id=id;
  const path=editId?"/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(id)+"&building_id=eq."+BID:"/rest/v1/"+TABLE;
  await sbFetch(path,{method:editId?"PATCH":"POST",token:centralSession.access_token,body:payload});
  fetchedAt=0;await load(true);openForm(id);
  if(typeof toast==="function")toast("Đã lưu hồ sơ thiết bị Bản nâng cấp.");
 }catch(err){if(typeof toast==="function")toast(err.message||"Không lưu được hồ sơ.");else alert(err.message||"Không lưu được hồ sơ.")}
 finally{button.disabled=false;button.textContent="Lưu hồ sơ thiết bị";}
}
async function saveCheck(){
 if(!active()||!allowed()||!editId)return;
 const item=items.find(x=>x.id===editId),form=$("ueForm"),button=$("ueCheckSave");
 if(!item||button.disabled)return;
 const field=n=>String(form.elements.namedItem(n)?.value||"").trim();
 const date=field("checkDate"),by=field("checkBy"),condition=field("checkCondition");
 if(!date||!by||!["chua","tot","theodoi","hu","sua"].includes(condition))return alert("Vui lòng nhập ngày, tình trạng và người kiểm tra.");
 const files=[...form.elements.namedItem("checkPhotos").files];
 if(files.length>6||files.some(f=>!f.type.startsWith("image/")||f.size>12*1024*1024))return alert("Chỉ chọn tối đa 6 ảnh, mỗi ảnh không quá 12 MB.");
 button.disabled=true;button.textContent="Đang lưu lần kiểm tra...";
 try{
  const refs=files.length?await uploadMediaFiles(files,"technical-equipment",item.id,null,BID):[];
  const meta=metaOf(item);
  const history=[...(meta.history||[]),{date,by,condition,note:field("checkNote"),photos:refs,createdAt:new Date().toISOString()}].sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.createdAt).localeCompare(String(b.createdAt))).slice(-100); const latest=history.at(-1);
  await sbFetch("/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(item.id)+"&building_id=eq."+BID,{
   method:"PATCH",token:centralSession.access_token,
   body:{specs:{...item.specs,_estaUpgrade:{...meta,history,condition:latest.condition,lastCheck:latest.date}}}
  });
  fetchedAt=0;await load(true);openForm(item.id);
  if(typeof toast==="function")toast("Đã lưu lịch sử kiểm tra và hình ảnh.");
 }catch(err){if(typeof toast==="function")toast(err.message||"Không lưu được kết quả kiểm tra.");else alert(err.message)}
 finally{button.disabled=false;button.textContent="✓ Lưu lần kiểm tra"}
}
async function printReport(){
 if(!active())return;
 const rows=currentRows().filter(x=>!x.virtual&&metaOf(x).verified),verified=rows;
 const win=window.open("","_blank");if(!win){alert("Trình duyệt đang chặn cửa sổ in.");return}
 const escPrint=esc;
 const parts=[];
 for(const x of verified){
  const latest=(metaOf(x).history||[]).slice(-1)[0];if(!latest?.photos?.length)continue;
  const urls=await Promise.all(latest.photos.slice(0,6).map(async ref=>{try{return await mediaObjectUrl(ref)}catch{return ""}}));
  parts.push('<section class="proof"><h3>'+escPrint(x.name)+' · '+escPrint(latest.date)+'</h3><div class="photos">'+
   urls.filter(Boolean).map(u=>'<img src="'+escPrint(u)+'">').join("")+'</div></section>');
 }
 const html='<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>ESTA - Bản nâng cấp - Hệ thống kỹ thuật</title>'+
 '<style>@page{size:A4;margin:13mm}body{font:12px Arial,sans-serif;color:#243b44}header{border-bottom:2px solid #214a43;padding-bottom:9px}h1{font-size:19px}h2{font-size:14px;margin-top:17px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #bdc9c4;padding:7px;text-align:left}th{background:#e8f0ea}tr{break-inside:avoid}.notice{font-size:11px;color:#546c66}.proof{break-inside:avoid}.photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.photos img{max-width:100%;max-height:76mm;object-fit:contain;border:1px solid #d3dcda}footer{display:flex;justify-content:space-between;margin-top:27mm;break-inside:avoid}</style></head><body>'+
 '<header><b>ESTA · PROPERTY OPERATIONS</b><h1>BÁO CÁO THÔNG TIN HỆ THỐNG TÒA NHÀ</h1><div>Dự án: Bản nâng cấp · Ngày lập: '+escPrint(new Date().toLocaleDateString("vi-VN"))+'</div></header>'+
 '<p class="notice">'+verified.length+' hồ sơ đã xác minh theo bộ lọc. Mẫu và thiết bị chưa xác minh không xuất hiện trong báo cáo.</p>'+
 '<table><thead><tr><th>STT</th><th>Thiết bị</th><th>Nhóm hệ thống</th><th>Vị trí</th><th>Tình trạng</th><th>Kiểm tra</th><th>Hạn kế tiếp</th></tr></thead><tbody>'+
 rows.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+escPrint(x.name)+'</td><td>'+escPrint(x.system_group)+'</td><td>'+escPrint(x.location||"—")+'</td><td>'+
 escPrint(CONDITIONS[conditionOf(x)]||"—")+'</td><td>'+escPrint(viDate(metaOf(x).lastCheck))+'</td><td>'+escPrint(viDate(inspectionDue(x)))+'</td></tr>').join("")+
 '</tbody></table><h2>HÌNH ẢNH KIỂM TRA (HỒ SƠ XÁC MINH)</h2>'+parts.join("")+
 '<footer><div>Người lập phiếu<br><br><br>________________</div><div>Kỹ thuật xác nhận<br><br><br>________________</div></footer></body></html>';
 win.document.open();win.document.write(html);win.document.close();
 let printed=false;const trigger=()=>{if(printed||win.closed)return;printed=true;win.focus();win.print()};
 win.addEventListener("load",trigger,{once:true});
 Promise.all([...win.document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve}))).then(trigger);
 setTimeout(trigger,4500);
}

async function remove(){
 if(!editId||!allowed())return;
 const existing=items.find(x=>x.id===editId);
 if(!confirm("Xóa hồ sơ thiết bị “"+label(existing)+"” khỏi riêng Bản nâng cấp?"))return;
 const id=editId,button=$("ueDelete");button.disabled=true;
 try{
  await sbFetch("/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(id)+"&building_id=eq."+BID,{method:"DELETE",token:centralSession.access_token});
  closeForm();fetchedAt=0;await load(true);
  if(typeof toast==="function")toast("Đã xóa hồ sơ thiết bị.");
 }catch(e){if(typeof toast==="function")toast(e.message||"Không xóa được thiết bị.");}
 finally{button.disabled=false;}
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&dialog&&!dialog.hidden)closeForm()});
window.estaUpgradeAssets={render,refresh:()=>load(true),close:closeForm};
})();
