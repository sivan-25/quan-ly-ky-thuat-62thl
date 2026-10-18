/* ESTA | Shared equipment register for four operating buildings.
 * Data: public.building_equipment_profiles_nangcap, isolated by active building_id.
 */
(()=>{
"use strict";
const TABLE="building_equipment_profiles_nangcap";
const EQUIPMENT_PROJECTS=new Set(["68PĐL","62THL","127HH","130HH"]);
const LINK_BUILDINGS=new Set(["68PĐL","62THL","127HH","130HH"]);
const currentEquipmentProjectId=()=>String(typeof currentBuilding!=="undefined"?currentBuilding?.id||"":"");
const projectDisplayName=()=>String(typeof currentBuilding!=="undefined"?currentBuilding?.name||currentBuilding?.id||"Dự án":"Dự án");
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
const CONDITIONS={mau:"Chưa cập nhật",unverified:"Đã lưu",chua:"Chưa kiểm tra",tot:"Tốt",theodoi:"Cần theo dõi",hu:"Hư hỏng",sua:"Đang sửa",quahan:"Quá hạn kiểm tra"};
const metaOf=x=>x?.specs?._estaUpgrade||{};
const realRows=()=>items.filter(x=>!x.virtual&&!metaOf(x).archived);
function catalog(){
 // Keep a deleted built-in entry hidden after refresh and on other devices.
 const keys=new Set(items.map(x=>metaOf(x).seedKey).filter(Boolean));
 return realRows().concat(SEEDS.filter(x=>!keys.has(x.seedKey)));
}
function conditionOf(x){
 if(x.virtual)return "mau";
 const meta=metaOf(x);
 return !meta.verified?"unverified":meta.condition||"chua";
}
const groupCount=k=>catalog().filter(x=>x.system_group===k).length;

const statuses=["Đang sử dụng","Dự phòng","Cần theo dõi","Đang sửa chữa","Ngừng sử dụng"];
let items=[],systemCatalog=[],linkedAssets=[],maintenancePlans=[],maintenanceEvents=[],maintenanceHistoryError="",fetchedAt=0,loading=null,error="",search="",group="",status="",dialog=null,editId=null,editingSeed="",editingType="",expandedDeviceId="";
let scopedBuildingId="";
function ensureScope(){
 const id=currentEquipmentProjectId();
 if(scopedBuildingId!==id){
  closeForm();scopedBuildingId=id;items=[];systemCatalog=[];linkedAssets=[];maintenancePlans=[];maintenanceEvents=[];maintenanceHistoryError="";fetchedAt=0;loading=null;
  error="";search="";group="";status="";expandedDeviceId="";
 }
 return id;
}
const active=()=>EQUIPMENT_PROJECTS.has(currentEquipmentProjectId())&&typeof projectOverviewActive!=="undefined"&&projectOverviewActive;
const allowed=()=>active()&&!!centralSession?.access_token&&(!!currentAccount?.is_admin||String(currentBuilding?.role||"").toLowerCase()!=="viewer");
const opt=(a,v)=>a.map(x=>'<option value="'+esc(x)+'"'+(x===v?' selected':'')+'>'+esc(x)+'</option>').join("");
const gopts=()=>[...new Set([...groups.map(g=>g[0]),...systemCatalog.filter(x=>x.active!==false).map(x=>String(x.name||"").trim()).filter(Boolean),...realRows().map(x=>String(x.system_group||"").trim()).filter(Boolean)])];
const NEW_SYSTEM_TOKEN="__esta_new_system__";
function setCustomSystemVisibility(){
 const input=$("ueCustomSystemName"),isNew=$("ueEditGroup")?.value===NEW_SYSTEM_TOKEN;
 if(!input)return;
 input.hidden=!isNew;
 input.querySelector("input").required=isNew;
}
function equipmentFormSystemGroup(){
 return $("ueEditGroup")?.value===NEW_SYSTEM_TOKEN?String($("ueNewSystemName")?.value||"").trim():String($("ueEditGroup")?.value||"").trim();
}
const safeQty=n=>Number.isFinite(+n)?Math.min(500,Math.max(1,Math.floor(Number(n)))):1;
const eqCount=()=>realRows().filter(x=>metaOf(x).verified).reduce((n,x)=>n+safeQty(x.quantity),0);

const label=x=>x?.name||x?.equipment_type||"Chưa đặt tên";
const isPresent=()=>active()&&!!$("updateAssetsPage")&&!$("updateAssetsPage").classList.contains("hide");
async function load(force=false){
 if(!active())return;
 const building=ensureScope();
 if(loading)return loading;
 if(!force&&fetchedAt&&Date.now()-fetchedAt<20000)return;
 loading=(async()=>{
  try{
   // Profile and system catalog are independent: load together to shorten first display.
   // Keep project guards after the batch to prevent responses leaking across buildings.
   const [result,savedSystems]=await Promise.all([
    sbFetch("/rest/v1/"+TABLE+"?building_id=eq."+encodeURIComponent(building)+"&select=*&order=system_group.asc,name.asc",{token:centralSession?.access_token}),
    LINK_BUILDINGS.has(building)
     ?sbFetch("/rest/v1/ops_systems?select=id,name,active,sort_order&building_id=eq."+encodeURIComponent(building)+"&active=eq.true&order=sort_order.asc,name.asc",{token:centralSession?.access_token}).catch(()=>[])
     :Promise.resolve([])
   ]);
   if(!active()||currentEquipmentProjectId()!==building||scopedBuildingId!==building)return;
   items=Array.isArray(result)?result:[];error="";fetchedAt=Date.now();
   if(LINK_BUILDINGS.has(building))systemCatalog=Array.isArray(savedSystems)?savedSystems:[];
   if(LINK_BUILDINGS.has(building)){
    try{
     const rows=await sbFetch("/rest/v1/esta_maintenance_plan_items?select=id,work_title,system_group,subsystem,cadence,assigned_to,equipment_profile_id,deleted_at&building_id=eq."+encodeURIComponent(building)+"&order=created_at.asc",{token:centralSession?.access_token});
     if(scopedBuildingId!==building||currentEquipmentProjectId()!==building)return;
     maintenancePlans=Array.isArray(rows)?rows:[];
     const ids=maintenancePlans.filter(p=>!p.deleted_at&&p.equipment_profile_id).map(p=>p.id);
     if(ids.length){
      const records=await sbFetch("/rest/v1/esta_maintenance_plan_occurrences?select=item_id,planned_date,planned_month,completed_at,completed_by,result_code,result_note,image_paths,status&building_id=eq."+encodeURIComponent(building)+"&status=eq.completed&item_id=in.("+ids.map(encodeURIComponent).join(",")+")&order=completed_at.desc&limit=1000",{token:centralSession?.access_token});
      if(scopedBuildingId!==building||currentEquipmentProjectId()!==building)return;
      maintenanceEvents=Array.isArray(records)?records:[];
     }else maintenanceEvents=[];
     maintenanceHistoryError="";
    }catch(e){
     if(scopedBuildingId!==building||currentEquipmentProjectId()!==building)return;
     maintenanceHistoryError="Không tải được dữ liệu bảo trì liên kết: "+String(e?.message||e);
    }
   }
   sbFetch("/rest/v1/maintenance_assets?building_id=eq."+encodeURIComponent(building)+"&select=id,name,code,location&order=name.asc",{token:centralSession?.access_token})
    .then(a=>{if(active()&&scopedBuildingId===building)linkedAssets=Array.isArray(a)?a:[]})
    .catch(()=>{if(scopedBuildingId===building)linkedAssets=[]});
  }catch(e){if(active()&&scopedBuildingId===building)error=e?.message||"Không tải được danh mục thiết bị.";}
  finally{if(scopedBuildingId===building){loading=null;if(isPresent())render($("updateAssetsPage"),true);}}
 })();
 return loading;
}

function currentRows(){
 const q=search.trim().toLocaleLowerCase("vi-VN");
 return catalog().filter(x=>(!group||x.system_group===group)&&(!status||(status==="quahan"?isDue(x):status==="chua"?!x.virtual&&ueStatusKey(x)==="chua":conditionOf(x)===status))&&
  (!q||[x.name,x.code,x.system_group,x.equipment_type,x.brand,x.model,x.location,x.note].join(" ").toLocaleLowerCase("vi-VN").includes(q)));
}

/* SVG outline symbols matching the source HTML's original system navigation. */
const UE_SYSTEM_ICONS={
 pccc:'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z',
 dien:'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
 mpd:'M3 7h18v10H3z M7 11v2 M21 10v4 M11 9l-2 3h4l-2 3',
 hvac:'M9.59 4.59A2 2 0 1 1 11 8H2 M12.59 19.41A2 2 0 1 0 14 16H2 M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2',
 tm:'M4 3h16v18H4z M12 3v18 M7 10l2-2 2 2 M13 14l2 2 2-2',
 bom:'M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7z',
 cam:'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
 cs:'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2z',
 kc:'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M10 6h4 M10 10h4 M10 14h4 M10 18h4'
};
const ueIcon=(path,size=24)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+path+'"/></svg>';
const UE_ALL_ICON='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>';
function ueStatusKey(x){const c=conditionOf(x);return c==="unverified"?"chua":c}
function ueStatusOverview(){
 const list=realRows(),counts={tot:0,theodoi:0,hu:0,sua:0,chua:0,quahan:0};
 list.forEach(x=>{const k=ueStatusKey(x);if(Object.hasOwn(counts,k))counts[k]++;if(isDue(x))counts.quahan++});
 return {count:list.length,counts};
}
function ueSystemCounts(g){
 const rows=realRows().filter(x=>x.system_group===g[1]),counts={tot:0,theodoi:0,hu:0,sua:0,chua:0};
 rows.forEach(x=>{const k=ueStatusKey(x);if(Object.hasOwn(counts,k))counts[k]++});
 return {size:rows.length,templates:g[3].length,counts};
}

/* Display every populated field from the saved profile in a compact, readable grid. */
function equipmentDetails(x){
 if(x.virtual)return '<div class="ueRefPlaceholder"><b>Thiết bị chưa nhập hồ sơ.</b><span>Bấm Nhập hồ sơ để điền thông số của thiết bị này.</span></div>';
 const specs=x.specs&&typeof x.specs==="object"?x.specs:{},meta=metaOf(x);
 const seen=new Set(),fields=[];
 const add=(key,title,value,unit="")=>{
  if(seen.has(key)||value===undefined||value===null||typeof value==="object")return;
  const raw=String(value).trim();if(!raw)return;
  seen.add(key);
  let valueText=unit==="@"?viDate(raw):raw+(unit?" "+unit:"");
  let warning=false;
  if(key==="install_year"||key==="sp:nam"){
   const n=Number(raw),currentYear=new Date().getFullYear();
   if(/^\d{4}$/.test(raw)&&(n<1900||n>currentYear+1)){valueText=raw+" · Cần kiểm tra";warning=true;}
  }
  fields.push('<div class="ueRefFact"><span>'+esc(title)+'</span><strong'+(warning?' class="ueRefNeedsCheck"':'')+'>'+esc(valueText)+'</strong></div>');
 };
 add("type","Loại thiết bị",x.equipment_type);
 add("quantity","Số lượng",x.quantity);
 add("code","Mã thiết bị",x.code);
 add("brand","Hãng sản xuất",x.brand);
 add("model","Model",x.model);
 add("status","Trạng thái hoạt động",x.status);
 add("install_year","Năm lắp đặt",x.install_year);
 add("capacity","Công suất / thông số",specs.capacity);
 add("serial","Số serial",specs.serial);
 const seed=SEEDS.find(s=>s.seedKey===meta.seedKey);
 const type=meta.technicalType||x._technicalType||seed?._technicalType||"";
 for(const field of [...advancedFields(type),...extraFields(),...installFields()])add("sp:"+field.key,field.title,specs[field.key],field.unit);
 for(const [key,value] of Object.entries(specs)){
  if(["_estaUpgrade","capacity","serial"].includes(key)||seen.has("sp:"+key))continue;
  add("other:"+key,key,value);
 }
 for(const field of meta.custom||[])add("custom:"+(field.key||field.k),field.key||field.k,field.value??field.v);
 add("location","Vị trí",x.location);
 add("note","Ghi chú",x.note);
 add("interval","Chu kỳ kiểm tra",meta.interval||x._cadence||G.find(g=>g[1]===x.system_group)?.[2],"ngày");
 add("lastCheck","Kiểm tra gần nhất",meta.lastCheck||meta.history?.at(-1)?.date,"@");
 add("nextCheck","Lần kiểm tra tới",inspectionDue(x),"@");
 add("verified","Xác minh",meta.verified?"Đã xác minh":"Chưa xác minh");
 if(meta.linkedAsset){
  const linked=linkedAssets.find(a=>String(a.id)===String(meta.linkedAsset));
  add("linked","Hồ sơ bảo trì",linked?.name||"Đã liên kết");
 }
 const last=meta.history?.at(-1);
 if(last){
  add("checkBy","Người kiểm tra",last.by);
  add("reading","Thông số đo",last.reading);
  add("checkNote","Ghi chú kiểm tra",last.note);
  add("checkCondition","Kết quả kiểm tra",CONDITIONS[last.condition]||last.condition);
  add("checkPhotos","Ảnh kiểm tra",last.photos?.length?last.photos.length+" ảnh":"");
 }
 return '<div class="ueItemSpecifications ueRefFacts">'+(fields.join("")||'<p class="ueRefEmptySpecs">Chưa có thông số. Chọn Xem / chỉnh sửa hồ sơ để cập nhật.</p>')+'</div>';
}
function ueRowStatus(x){
 if(x.virtual)return {label:"Chưa nhập",tone:"missing"};
 if(isDue(x))return {label:"Quá hạn",tone:"overdue"};
 if(conditionOf(x)==="unverified")return {label:"Đã lưu · chưa xác minh",tone:"unverified"};
 const condition=ueStatusKey(x);
 return {label:condition==="chua"?"Chưa kiểm tra":CONDITIONS[condition]||"Chưa kiểm tra",tone:condition};
}
function ueMaintenanceHtml(x){
 if(!LINK_BUILDINGS.has(currentEquipmentProjectId())||x.virtual)return "";
 const plans=maintenancePlans.filter(p=>!p.deleted_at&&String(p.equipment_profile_id||"")===String(x.id));
 const resultName={pass:"Đạt",fail:"Không đạt",monitor:"Cần theo dõi"};
 const info=plans.map(p=>{
  const done=maintenanceEvents.filter(e=>String(e.item_id)===String(p.id)&&e.status==="completed")
   .sort((a,b)=>String(b.completed_at||b.planned_date||"").localeCompare(String(a.completed_at||a.planned_date||""))).slice(0,5);
  const history=done.length?done.map(e=>{
   const date=String(e.completed_at||e.planned_date||e.planned_month||"").slice(0,10);
   const result=resultName[e.result_code]||"Chưa ghi kết quả";
   const photos=(Array.isArray(e.image_paths)?e.image_paths:[]).map(q=>typeof q==="string"?{kind:"after",ref:q}:q).filter(q=>q&&q.ref);
   return '<div class="uePmRecord"><div><b>'+esc(date?viDate(date):"—")+' · '+esc(result)+'</b><small>'+esc(e.completed_by||"Chưa ghi KTV")+'</small></div>'+
    (e.result_note?'<p>'+esc(e.result_note)+'</p>':'')+
    (photos.length?'<div class="uePmEvidence">'+photos.slice(0,3).map(q=>
      '<img alt="Ảnh '+esc(q.kind==="before"?"trước":"sau")+' bảo trì" data-ue-maintenance-image="'+esc(q.ref)+'">').join("")+
      (photos.length>3?'<small>+'+(photos.length-3)+' ảnh trong hồ sơ bảo trì</small>':'')+'</div>':'')+
    '</div>';
  }).join(""):'<p class="uePmEmpty">Chưa có kỳ bảo trì hoàn thành được ghi nhận.</p>';
  return '<div class="uePmPlan"><button type="button" data-ue-pm="'+esc(p.id)+'"><span>'+esc(p.work_title)+'</span><small>'+esc(p.cadence||"1 lần")+' · '+esc(p.assigned_to||"Chưa phân công")+'</small><b>↗</b></button>'+
    '<div class="uePmHistory">'+history+'</div></div>';
 }).join("");
 return '<div class="ueLinkedMaintenance"><div class="ueLinkedMaintenanceHeading"><strong>Bảo trì liên kết ('+plans.length+')</strong><span>Lịch sử hoàn thành lấy từ trang Bảo trì thiết bị của cùng tòa nhà.</span></div>'+
  (maintenanceHistoryError?'<p class="uePmLoadError" role="alert">'+esc(maintenanceHistoryError)+'</p>':"")+
  (plans.length?info:'<p>Chưa liên kết kế hoạch bảo trì. Từ Bảo trì thiết bị, chọn hệ thống và hồ sơ này để liên kết.</p>')+
  '<button type="button" class="uePmOpen" data-ue-pm-list>↗ Mở trang Bảo trì thiết bị</button></div>';
}
function list(){
 const host=$("ueRows"),counter=$("ueResultCount");
 if(!host)return;
 const rows=currentRows().slice().sort((a,b)=>conditionRank(a)-conditionRank(b)||Number(isDue(b))-Number(isDue(a))||label(a).localeCompare(label(b),"vi"));
 if(counter)counter.textContent=currentEquipmentProjectId()==="130HH"?("Đã lưu "+rows.filter(x=>!x.virtual).length+" hồ sơ · "+rows.filter(x=>x.virtual).length+" mục gợi ý chưa nhập"):(rows.length+" hạng mục · bấm vào thiết bị để xem chi tiết");
 if(!rows.length){
  host.innerHTML='<div class="ueRefEmpty"><b>Không có thiết bị phù hợp.</b><p>Hãy thử từ khóa, hệ thống hoặc tình trạng khác.</p><button type="button" id="ueClearFilter">Bỏ bộ lọc</button></div>';
  $("ueClearFilter").onclick=()=>{search="";group="";status="";render($("updateAssetsPage"),true)};
  return;
 }
 host.innerHTML=rows.map(x=>{
  const virt=!!x.virtual,id=String(x.id),expanded=expandedDeviceId===id,overdue=isDue(x);
  const state=ueRowStatus(x),meta=metaOf(x);
  const last=meta.lastCheck||meta.history?.at(-1)?.date||"",next=inspectionDue(x);
  const interval=Math.max(1,Number(meta.interval)||G.find(g=>g[1]===x.system_group)?.[2]||30);
  const detailId="ueDetail-"+id;
  return '<div class="ueRefEntry'+(expanded?' ueRefEntryOpen':'')+'">'+
   '<button type="button" class="ueRefRow" data-ue-id="'+esc(id)+'" aria-controls="'+esc(detailId)+'" aria-expanded="'+expanded+'" aria-label="Xem chi tiết '+esc(label(x))+'">'+
    '<span class="ueRefDevice"><strong>'+esc(label(x))+'</strong><small>'+esc(x.system_group||"Chưa phân hệ")+'</small></span>'+
    '<span class="ueRefLocation">'+esc(x.location||"—")+'</span>'+
    '<span class="ueRefStatusCell"><span class="ueRefState ueRefState-'+esc(state.tone)+'">'+esc(state.label)+'</span></span>'+
    '<span class="ueRefLast">'+(last?esc(viDate(last)):'<span class="ueRefDash">—</span>')+'</span>'+
    '<span class="ueRefNext">'+(next?esc(viDate(next)):virt?'<span class="ueRefDash">—</span>':'<span class="ueRefCycle">Chu kỳ '+interval+' ngày</span>')+'</span>'+
    '<span class="ueRefChevron" aria-hidden="true">'+(expanded?'▴':'▾')+'</span>'+
   '</button>'+
   '<section class="ueRefDetails" id="'+esc(detailId)+'" aria-label="Thông số '+esc(label(x))+'"'+(expanded?'':' hidden')+'>'+
     equipmentDetails(x)+ueMaintenanceHtml(x)+
     '<div class="ueRefRowActions">'+
      (!virt?'<button type="button" class="ueRefCheck" data-ue-check="'+esc(id)+'"'+(!allowed()?' disabled':'')+'>Ghi nhận kiểm tra</button>':'')+
      '<button type="button" class="ueRefEdit" data-ue-edit="'+esc(id)+'">'+(virt?'Nhập hồ sơ thiết bị':'Xem / chỉnh sửa hồ sơ')+'</button>'+
     '</div></section></div>';
 }).join("");
 host.querySelectorAll("[data-ue-id]").forEach(button=>button.onclick=()=>{
  const id=button.dataset.ueId;
  expandedDeviceId=expandedDeviceId===id?"":id;
  host.querySelectorAll(".ueRefEntry").forEach(entry=>{
   const row=entry.querySelector("[data-ue-id]"),open=row.dataset.ueId===expandedDeviceId;
   entry.classList.toggle("ueRefEntryOpen",open);
   row.setAttribute("aria-expanded",String(open));
   const detail=entry.querySelector(".ueRefDetails");if(detail)detail.hidden=!open;
   const arrow=row.querySelector(".ueRefChevron");if(arrow)arrow.textContent=open?"▴":"▾";
  });
 });
 host.querySelectorAll("[data-ue-pm]").forEach(button=>button.onclick=()=>{
  if(!LINK_BUILDINGS.has(currentEquipmentProjectId()))return;
  document.getElementById("navMaintenance")?.click();
  window.estaMaintenance130?.focusPlan?.(button.dataset.uePm);
 });
 host.querySelectorAll("[data-ue-pm-list]").forEach(button=>button.onclick=()=>{
  if(LINK_BUILDINGS.has(currentEquipmentProjectId()))document.getElementById("navMaintenance")?.click();
 });
 host.querySelectorAll("img[data-ue-maintenance-image]").forEach(async img=>{
  try{if(typeof mediaObjectUrl==="function"){const url=await mediaObjectUrl(img.dataset.ueMaintenanceImage);if(img.isConnected)img.src=url;}}
  catch(_){img.alt="Không mở được ảnh bảo trì";}
 });
 host.querySelectorAll("[data-ue-edit]").forEach(button=>button.onclick=()=>openForm(button.dataset.ueEdit));
 host.querySelectorAll("[data-ue-check]").forEach(button=>button.onclick=()=>openForm(button.dataset.ueCheck,true));
}
/* Shared reference layout for the four operating projects. */
function systemRailHtml(){
 const builtIn=G.map(g=>({name:g[1],key:g[1],count:groupCount(g[1]),icon:ueIcon(UE_SYSTEM_ICONS[g[0]],23)}));
 const dynamic=gopts().filter(name=>!G.some(g=>g[1]===name)).map(name=>({name,key:name,count:groupCount(name),icon:ueIcon(UE_SYSTEM_ICONS.kc,23)}));
 const all=[{name:"Tất cả hệ thống",key:"",count:catalog().length,icon:UE_ALL_ICON},...builtIn,...dynamic];
 return '<nav class="ueSystemRail" aria-label="Danh mục hệ thống kỹ thuật"><div class="ueRefRailHeading"><strong>CHỌN HỆ THỐNG</strong><small>Điện · Nước · PCCC · HVAC…</small></div>'+all.map(g=>
  '<button type="button" class="ueRailCard'+(group===g.key?' active':'')+'" data-ue-group="'+esc(g.key)+'" aria-pressed="'+(group===g.key)+'">'+
  g.icon+'<span class="ueRailText"><b>'+esc(g.name)+'</b><small>'+g.count+(currentEquipmentProjectId()==="130HH"?' hạng mục':' thiết bị')+'</small></span></button>'
 ).join("")+'</nav>';
}
function render(page,skipLoad=false){
 if(!active()||!page)return;
 ensureScope();
 // Refresh the technical theme on every render so system navigation remains visible.
 if(page.id==="updateAssetsPage"){
  document.getElementById("app")?.classList.add("estaTechnicalAssetsMode");
  document.body.classList.add("estaTechnicalAssetsMode");
 }
 page.classList.remove("ueClassic");
 page.classList.add("uePage","ueSnapshot");
 page.innerHTML=
  '<section class="ueRefSurface" aria-label="Danh sách thông tin hệ thống kỹ thuật">'+
   '<div class="ueRefLayout">'+systemRailHtml()+'<div class="ueRefMain">'+
   '<header class="ueRefTop"><div class="ueRefTitle">'+
    '<label class="ueRefTitleSelect"><span class="ueVisuallyHidden">Chọn hệ thống kỹ thuật</span>'+
     '<select id="ueGroup" aria-label="Chọn hệ thống kỹ thuật"><option value="">Tất cả hệ thống</option>'+opt(gopts(),group)+'</select></label>'+
    '<p id="ueResultCount" aria-live="polite"></p></div>'+
    '<div class="ueRefTools"><label class="ueRefSearch"><span class="ueVisuallyHidden">Tìm thiết bị</span>'+
     '<input id="ueSearch" type="search" placeholder="Tìm theo tên, vị trí, ghi chú" autocomplete="off" value="'+esc(search)+'"></label>'+
     '<select id="ueStatus" aria-label="Lọc tình trạng"><option value="">Mọi tình trạng</option>'+
      '<option value="mau"'+(status==="mau"?' selected':'')+'>Chưa nhập</option>'+
      Object.entries(CONDITIONS).filter(([k])=>k!=="mau"&&k!=="quahan").map(([k,v])=>'<option value="'+k+'"'+(status===k?' selected':'')+'>'+(k==="unverified"?"Đã lưu / chưa xác minh":esc(v))+'</option>').join("")+
      '<option value="quahan"'+(status==="quahan"?' selected':'')+'>Quá hạn kiểm tra</option></select>'+
    '</div></header>'+
   '<div class="ueRefActions"><button type="button" id="ueRefresh">↻ Làm mới</button>'+
    '<button type="button" id="uePrint">↓ Xuất PDF</button>'+
    (LINK_BUILDINGS.has(currentEquipmentProjectId())?'<button type="button" id="ueAddSystem"'+(!allowed()?' disabled':'')+'>＋ Thêm hệ thống</button>':'')+
    '<button type="button" id="ueAdd" class="ueRefAdd"'+(!allowed()?' disabled':'')+'>＋ Thêm thiết bị</button></div>'+
   (LINK_BUILDINGS.has(currentEquipmentProjectId())?'<div id="ueNewSystemBox" class="ueNewSystemBox" hidden><label>Tên hệ thống mới <input id="ueCategoryName" maxlength="100" placeholder="Ví dụ: Hệ thống điện mặt trời"></label><button type="button" id="ueSaveSystem">Lưu hệ thống</button><button type="button" id="ueCancelSystem">Hủy</button><span id="ueCategoryError" role="alert"></span></div>':'')+
   (error?'<p class="ueRefError" role="alert">Không tải được dữ liệu: '+esc(error)+'. Các hồ sơ đã lưu chưa được xác nhận.</p>':'')+
   '<div class="ueRefTable"><div class="ueRefColHead" aria-hidden="true">'+
    '<span>THIẾT BỊ</span><span>VỊ TRÍ</span><span>TRẠNG THÁI</span>'+
    '<span>KIỂM TRA GẦN NHẤT</span><span>LẦN TỚI</span><span></span></div>'+
    '<div id="ueRows" class="ueRefRows"></div></div>'+
   '</div></div></section>';
 page.querySelectorAll("[data-ue-group]").forEach(button=>button.onclick=()=>{group=button.dataset.ueGroup||"";expandedDeviceId="";render(page,true)});
 $("ueSearch").oninput=e=>{search=e.target.value;list()};
 $("ueGroup").onchange=e=>{group=e.target.value;render(page,true)};
 $("ueStatus").onchange=e=>{status=e.target.value;list()};
 $("ueRefresh").onclick=()=>{fetchedAt=0;load(true)};
 $("uePrint").onclick=printReport;
 $("ueAdd").onclick=()=>openForm();
 if($("ueAddSystem")){
  $("ueAddSystem").onclick=()=>{
   const box=$("ueNewSystemBox");box.hidden=!box.hidden;
   if(!box.hidden)$("ueCategoryName").focus();
  };
  $("ueSaveSystem").onclick=saveCustomSystem;
  $("ueCancelSystem").onclick=()=>{$("ueNewSystemBox").hidden=true};
  $("ueCategoryName").onkeydown=event=>{if(event.key==="Enter"){event.preventDefault();saveCustomSystem();}};
 }
 list();
 if(!skipLoad&&!fetchedAt)load();
}

function ensureDialog(){
 if(dialog?.isConnected)return dialog;
 dialog=document.createElement("div");dialog.id="ueOverlay";dialog.className="ueOverlay";dialog.hidden=true;
 dialog.innerHTML='<div class="ueDialog" role="dialog" aria-modal="true" aria-labelledby="ueModalHeading">'+
 '<header><div><small>ESTA · HỒ SƠ HỆ THỐNG KỸ THUẬT</small><h2 id="ueModalHeading">Hồ sơ thiết bị</h2><span id="ueSaveFlag" class="ueSaveFlag">Chưa lưu</span></div><button type="button" id="ueClose" aria-label="Đóng">×</button></header>'+
 '<form id="ueForm"><div class="ueFormBody">'+
 '<p id="ueFormNotice" class="ueFull ueFormNotice"></p>'+
 '<label>Nhóm hệ thống *<select name="system_group" id="ueEditGroup" required>'+opt(gopts(),"")+'<option value="'+NEW_SYSTEM_TOKEN+'">＋ Tạo hệ thống mới</option></select></label>'+
 '<label id="ueCustomSystemName" hidden>Tên hệ thống mới *<input id="ueNewSystemName" maxlength="100" placeholder="Ví dụ: Hệ thống điện mặt trời"></label>'+
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
 '<label class="ueFull" id="ueLegacyMaintenanceLink">Liên kết hồ sơ Bảo trì cũ<select name="linkedAsset" id="ueLinkedAsset"><option value="">Chưa liên kết</option></select></label>'+
 '<label>Công suất / thông số<input name="capacity" maxlength="120"></label>'+
 '<label>Số serial<input name="serial" maxlength="140"></label>'+
 '<section id="ueAdvancedSpecs" class="ueFull ueAdvancedSpecs"></section>'+ 
 '<details class="ueFull ueSpecSection ueCustom" id="ueCustom"><summary>Thông số bổ sung <span>Tùy chọn</span></summary><div id="ueCustomRows"></div><button type="button" class="ueBtnSecondary" id="ueAddCustom">＋ Thêm thông số</button></details>'+
 '<label class="ueFull">Ghi chú<textarea name="note" rows="2" maxlength="2500"></textarea></label>'+
 '<datalist id="ueBrands"><option value="Daikin"><option value="Mitsubishi"><option value="Panasonic"><option value="KONE"><option value="Schneider"><option value="LS"><option value="Grundfos"><option value="Nagakawa"><option value="Kruger"><option value="Siemens"></datalist>'+
 '<section id="ueInspection" class="ueFull ueInspection" hidden><h3>Kiểm tra & lịch sử tình trạng</h3><p>Chụp ảnh, ghi thông số và lưu minh chứng theo từng lần kiểm tra.</p>'+
 '<div class="ueInspectGrid"><label>Ngày kiểm tra<input type="date" name="checkDate"></label>'+
 '<label>Tình trạng<select name="checkCondition">'+Object.entries(CONDITIONS).filter(([k])=>["chua","tot","theodoi","hu","sua"].includes(k)).map(([k,v])=>'<option value="'+k+'">'+esc(v)+'</option>').join("")+'</select></label>'+
 '<label>Người thực hiện<input name="checkBy" maxlength="120"></label>'+
 '<label>Ảnh minh chứng<input type="file" name="checkPhotos" accept="image/*" multiple></label>'+
 '<label class="ueFull">Thông số đo (nếu có)<input name="checkReading" maxlength="300" placeholder="Ví dụ: áp suất 5,2 bar; nhiệt độ 38°C"></label>'+ 
 '<label class="ueFull">Ghi chú / Kết quả xử lý<textarea name="checkNote" rows="2" maxlength="1500"></textarea></label></div>'+
 '<button type="button" id="ueCheckSave" class="ueBtnPrimary">✓ Lưu lần kiểm tra</button>'+
 '<h4>Lịch sử kiểm tra</h4><div id="ueHistory"></div></section>'+
 '</div><footer><div id="ueFormError" class="ueFormError" role="alert" aria-live="assertive" hidden></div><button type="button" class="ueBtnSecondary" id="ueCancel">Hủy</button>'+
 '<button type="button" class="ueDelete" id="ueDelete" hidden>🗑 Xóa thiết bị</button>'+
 '<button type="submit" class="ueBtnPrimary" id="ueSubmit">Lưu hồ sơ thiết bị</button></footer></form></div>';
 document.body.append(dialog);
 $("ueClose").onclick=closeForm;$("ueCancel").onclick=closeForm;
 dialog.onclick=e=>{if(e.target===dialog)closeForm()};
 $("ueEditGroup").onchange=()=>{setCustomSystemVisibility();editingType="";fillTypes();fillAdvanced(collectAdvanced())};
 $("ueEditType").onchange=()=>{editingType=seedTypeFromForm();fillAdvanced(collectAdvanced())};
 $("ueForm").onsubmit=save;$("ueDelete").onclick=remove;
 $("ueCheckSave").onclick=saveCheck;
 $("ueAddCustom").onclick=()=>addCustom();
 return dialog;
}
function addCustom(key="",val=""){
 const host=$("ueCustomRows");if(!host)return;
 const row=document.createElement("div");row.className="ueCustomRow";
 row.innerHTML='<input name="customKey" maxlength="120" placeholder="Tên thông số" aria-label="Tên thông số" value="'+esc(key)+'">'+
 '<input name="customValue" maxlength="240" placeholder="Giá trị" aria-label="Giá trị" value="'+esc(val)+'">'+
 '<button type="button" aria-label="Xóa thông số">×</button>';
 row.querySelector("button").onclick=()=>row.remove();host.append(row);
 if(!allowed())row.querySelectorAll("input,button").forEach(el=>el.disabled=true);
}
function seedTypeFromForm(){
 const name=$("ueEditType").value;
 return SEEDS.find(x=>x.system_group===$("ueEditGroup").value&&x.equipment_type===name)?._technicalType||"";
}
function advancedFields(type){
 return parseFieldSpec(FULL_FIELDS[type]||F[type]||"");
}
function fieldInputs(fields,values){
 return fields.map(f=>'<label class="ueSpecField"><span class="ueSpecFieldLabel">'+esc(f.title)+(f.unit&&f.unit!=="@"?" ("+esc(f.unit)+")":"")+'</span>'+
 '<input name="sp_'+esc(f.key)+'" type="'+(f.unit==="@"?"date":"text")+'" value="'+esc(values?.[f.key]??"")+'" maxlength="160"></label>').join("");
}
function collectAdvanced(){
 const values={};$("ueAdvancedSpecs")?.querySelectorAll('[name^="sp_"]').forEach(i=>values[i.name.slice(3)]=i.value);return values;
}
function fillAdvanced(values={}){
 const type=editingType||seedTypeFromForm();
 const fields=advancedFields(type),profiles=extraFields(),warranty=installFields();
 const block=(title,arr,open)=>arr.length?'<details class="ueSpecSection"'+(open?' open':'')+'><summary>'+esc(title)+'<span>'+arr.length+' trường</span></summary><div class="ueInspectGrid">'+fieldInputs(arr,values)+'</div></details>':"";
 $("ueAdvancedSpecs").innerHTML=block("Thông số kỹ thuật · "+$("ueEditType").value,fields,true)+
 block("Xuất xứ & nhận dạng",profiles,false)+block("Lắp đặt · bảo hành · nhà thầu",warranty,false);
 if(!allowed())$("ueAdvancedSpecs").querySelectorAll("input").forEach(x=>x.disabled=true);
}
function renderHistory(x){
 const host=$("ueHistory"),hist=metaOf(x).history||[];
 if(!hist.length){host.innerHTML='<p>Chưa có lần kiểm tra được ghi nhận.</p>';return}
 host.innerHTML=hist.slice().reverse().map(h=>
 '<article class="ueHistoryItem"><strong>'+esc(h.date)+' · '+esc(CONDITIONS[h.condition]||"Chưa kiểm tra")+'</strong>'+
 '<small>'+esc(h.by||"")+'</small>'+(h.reading?'<p><b>Thông số đo:</b> '+esc(h.reading)+'</p>':'')+'<p>'+esc(h.note||"")+'</p>'+
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

function openForm(id="",focusInspection=false){
 if(!active())return;
 const existing=items.find(x=>String(x.id)===String(id));
 const sample=SEEDS.find(x=>x.id===id);
 if(id&&!existing&&!sample)return;
 const selected=existing||sample||null;
 editId=existing?.id||null;editingSeed=selected?.seedKey||metaOf(selected).seedKey||"";
 editingType=selected?._technicalType||metaOf(selected).technicalType||"";
 const d=ensureDialog(),form=$("ueForm");
 form.reset();$("ueModalHeading").textContent=existing?"Chi tiết & kiểm tra thiết bị":sample?"Cập nhật thông tin thiết bị":"Thêm thiết bị";
 $("ueSaveFlag").textContent=existing?"✓ Đã lưu":"Chưa lưu";$("ueSaveFlag").classList.toggle("is-saved",!!existing);
 const values=selected||{system_group:group||gopts()[0],equipment_type:group?(groups.find(g=>g[0]===group)?.[2]?.[0]||"Khác"):groups[0][2][0],quantity:1,status:statuses[0]};
 for(const [key,value] of Object.entries(values)){
  const input=form.elements.namedItem(key);
  if(input&&typeof value!=="object")input.value=value??"";
 }
 // Preloaded entries have status=""; sending an empty status violates the DB CHECK constraint (23514).
 form.elements.namedItem("status").value=statuses.includes(values.status)?values.status:statuses[0];
 $("ueEditGroup").innerHTML=opt(gopts(),"")+'<option value="'+NEW_SYSTEM_TOKEN+'">＋ Tạo hệ thống mới</option>';
 $("ueEditGroup").value=values.system_group||gopts()[0];$("ueNewSystemName").value="";setCustomSystemVisibility();fillTypes(values.equipment_type);
 const specs=values.specs||{},meta=metaOf(values);
 form.elements.namedItem("capacity").value=specs.capacity||"";
 form.elements.namedItem("serial").value=specs.serial||"";
 form.elements.namedItem("verified").value=meta.verified?"1":"0";
 form.elements.namedItem("inspectionInterval").value=meta.interval||G.find(g=>g[1]===values.system_group)?.[2]||30;
 $("ueLinkedAsset").innerHTML='<option value="">Chưa liên kết</option>'+
 linkedAssets.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.code||a.name)+' · '+esc(a.name)+'</option>').join("");
 $("ueLinkedAsset").value=meta.linkedAsset||"";
 $("ueLegacyMaintenanceLink").style.display=currentEquipmentProjectId()==="130HH"?"none":"";
 fillAdvanced(specs);
 $("ueCustomRows").replaceChildren();(meta.custom||[]).forEach(c=>addCustom(c.key||c.k,c.value||c.v));
 $("ueCustom").open=!!(meta.custom||[]).length;
 $("ueAddCustom").hidden=!allowed();
 $("ueFormNotice").textContent=sample?"Hạng mục chưa cập nhật. Nhập thông số rồi bấm Lưu thiết bị để ghi nhận.":
 existing?"Hồ sơ đã lưu. Bạn có thể cập nhật thông tin, ghi lần kiểm tra và lưu ảnh minh chứng.":"Điền thông tin thiết bị rồi bấm Lưu để ghi nhận vào dự án.";
 $("ueFormError").hidden=true;$("ueFormError").textContent="";
 $("ueInspection").hidden=!existing;
 if(existing){
  form.elements.namedItem("checkDate").value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  form.elements.namedItem("checkBy").value=String(currentAccount?.display_name||currentAccount?.username||"");
  renderHistory(existing);
 }
 const mayEdit=allowed();
 form.querySelectorAll("input,select,textarea").forEach(el=>el.disabled=!mayEdit);
 $("ueDelete").hidden=!mayEdit||!selected;
 $("ueSubmit").hidden=!mayEdit;$("ueCheckSave").hidden=!mayEdit;
 d.hidden=false;
 if(focusInspection&&existing){const section=$("ueInspection");section?.scrollIntoView?.({block:"nearest"});form.elements.namedItem("checkDate")?.focus?.();}
}
function closeForm(){if(dialog)dialog.hidden=true;editId=null;editingSeed="";editingType=""}


function formError(message){
 const target=$("ueFormError");
 if(target){target.hidden=false;target.textContent="⚠ "+String(message||"Không thực hiện được thao tác.")}
 else alert(String(message||"Không thực hiện được thao tác."));
}
async function getSaved(id,building=currentEquipmentProjectId()){
 const rows=await sbFetch("/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(id)+"&building_id=eq."+building+"&select=*&limit=1",{token:centralSession?.access_token});
 return Array.isArray(rows)?rows[0]||null:null;
}
async function saveCustomSystem(){
 if(!allowed()||!LINK_BUILDINGS.has(currentEquipmentProjectId()))return;
 const building=currentEquipmentProjectId(),name=String($("ueCategoryName")?.value||"").trim().replace(/\s+/g," ");
 const message=$("ueCategoryError"),saveButton=$("ueSaveSystem");
 if(!name||name.length>100){message.textContent="Nhập tên hệ thống từ 1 đến 100 ký tự.";return;}
 if(gopts().some(x=>x.toLocaleLowerCase("vi-VN")===name.toLocaleLowerCase("vi-VN"))){message.textContent="Hệ thống này đã tồn tại.";return;}
 message.textContent="";saveButton.disabled=true;saveButton.textContent="Đang lưu...";
 try{
  const id=crypto.randomUUID();
  const record={id,building_id:building,code:"UE-"+id.slice(0,8),name,active:true};
  await sbFetch("/rest/v1/ops_systems",{method:"POST",token:centralSession.access_token,body:record});
  const rows=await sbFetch("/rest/v1/ops_systems?select=id,name,building_id&id=eq."+encodeURIComponent(id)+"&building_id=eq."+encodeURIComponent(building),{token:centralSession.access_token});
  if(!Array.isArray(rows)||rows[0]?.name!==name||rows[0]?.building_id!==building)
   throw Error("Máy chủ chưa xác nhận hệ thống mới. Vui lòng tải lại để kiểm tra.");
  if(currentEquipmentProjectId()!==building)return;
  group=name;fetchedAt=0;await load(true);
  if(error)throw Error("Đã tạo hệ thống nhưng chưa tải lại được danh mục.");
  if(typeof toast==="function")toast("✓ Đã lưu hệ thống "+name+" vào "+projectDisplayName());
 }catch(err){if(currentEquipmentProjectId()===building)message.textContent=err?.message||"Không thêm được hệ thống.";}
 finally{if(saveButton.isConnected){saveButton.disabled=false;saveButton.textContent="Lưu hệ thống";}}
}
async function save(e){
 e.preventDefault();
 if(!allowed())return formError("Bạn không có quyền lưu thiết bị tại dự án này.");
 const building=currentEquipmentProjectId();
 const form=e.currentTarget,button=$("ueSubmit");if(button.disabled)return;
 const field=n=>String(form.elements.namedItem(n)?.value||"").trim();
 const year=Number(field("install_year"));
 const old=items.find(x=>x.id===editId),oldMeta=metaOf(old);
 const type=editingType||seedTypeFromForm();
 const specs={...old?.specs,capacity:field("capacity"),serial:field("serial")};
 [...advancedFields(type),...extraFields(),...installFields()].forEach(f=>{specs[f.key]=field("sp_"+f.key)});
 const asset=building==="130HH"?String(oldMeta.linkedAsset||""):field("linkedAsset");
 if(building!=="130HH"&&asset&&!linkedAssets.some(x=>String(x.id)===asset))return formError("Thiết bị bảo trì liên kết không hợp lệ.");
 const custom=[...form.querySelectorAll(".ueCustomRow")].map(r=>({key:r.querySelector('[name="customKey"]').value.trim(),value:r.querySelector('[name="customValue"]').value.trim()})).filter(c=>c.key&&c.value);
 const interval=Math.min(3650,Math.max(1,Number(field("inspectionInterval"))||G.find(g=>g[1]===field("system_group"))?.[2]||30));
 specs._estaUpgrade={...oldMeta,seedKey:editingSeed||oldMeta.seedKey||null,verified:field("verified")==="1",linkedAsset:asset,technicalType:type,history:oldMeta.history||[],interval,custom,archived:false,condition:oldMeta.condition||"chua"};
 const payload={building_id:building,system_group:equipmentFormSystemGroup(),equipment_type:field("equipment_type"),name:field("name"),code:field("code"),
 location:field("location"),brand:field("brand"),model:field("model"),quantity:safeQty(field("quantity")),
 status:field("status")||statuses[0],install_year:year||null,note:field("note"),specs};
 if(!payload.name||!payload.equipment_type||!payload.system_group)return formError("Vui lòng điền tên thiết bị, loại và hệ thống.");
 if(payload.system_group===NEW_SYSTEM_TOKEN||payload.system_group.length>100)return formError("Tên hệ thống mới không hợp lệ hoặc quá 100 ký tự.");
 if(!statuses.includes(payload.status))return formError("Vui lòng chọn trạng thái hoạt động hợp lệ.");
 $("ueFormError").hidden=true;button.disabled=true;button.textContent="Đang lưu...";
 try{
  const id=editId||crypto.randomUUID();
  if(!editId)payload.id=id;
  const path=editId?"/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(id)+"&building_id=eq."+building:"/rest/v1/"+TABLE;
  await sbFetch(path,{method:editId?"PATCH":"POST",token:centralSession.access_token,body:payload});
  const persisted=await getSaved(id,building);
  const baseFields=["name","equipment_type","system_group","brand","model","code","location","note","quantity","status","install_year"];
  const specFields=["capacity","serial",...advancedFields(type).map(f=>f.key),...extraFields().map(f=>f.key),...installFields().map(f=>f.key)];
  const matches=!!persisted&&!metaOf(persisted).archived&&
   baseFields.every(k=>String(persisted[k]??"")===String(payload[k]??""))&&
   specFields.every(k=>String(persisted.specs?.[k]??"")===String(specs[k]??""))&&
   !!metaOf(persisted).verified===!!specs._estaUpgrade.verified;
  if(!matches)throw new Error("Máy chủ chưa xác nhận đầy đủ thông số đã lưu. Vui lòng kiểm tra lại.");
  if(currentEquipmentProjectId()!==building)return;
  fetchedAt=0;await load(true);
  if(error)throw new Error("Đã ghi dữ liệu nhưng chưa tải lại được. Vui lòng bấm Làm mới.");
  openForm(id);
  if(typeof toast==="function")toast("Đã lưu thiết bị thành công.");
 }catch(err){formError(err?.message||"Không lưu được thiết bị.");}
 finally{button.disabled=false;button.textContent="Lưu hồ sơ thiết bị";}
}
async function saveCheck(){
 if(!active()||!allowed()||!editId)return;
 const building=currentEquipmentProjectId();
 const item=items.find(x=>x.id===editId),form=$("ueForm"),button=$("ueCheckSave");
 if(!item||button.disabled)return;
 const field=n=>String(form.elements.namedItem(n)?.value||"").trim();
 const date=field("checkDate"),by=field("checkBy"),condition=field("checkCondition");
 if(!date||!by||!["chua","tot","theodoi","hu","sua"].includes(condition))return formError("Vui lòng nhập ngày, tình trạng và người kiểm tra.");
 $("ueFormError").hidden=true;
 const files=[...form.elements.namedItem("checkPhotos").files];
 if(files.length>6||files.some(f=>!f.type.startsWith("image/")||f.size>12*1024*1024))return formError("Chỉ chọn tối đa 6 ảnh, mỗi ảnh không quá 12 MB.");
 button.disabled=true;button.textContent="Đang lưu lần kiểm tra...";
 try{
  const refs=files.length?await uploadMediaFiles(files,"technical-equipment",item.id,null,building):[];
  const meta=metaOf(item);
  const entry={date,by,condition,reading:field("checkReading"),note:field("checkNote"),photos:refs,createdAt:new Date().toISOString()};
  // Keep the newly recorded check even when it is older than the last 100 entries.
  const history=[...(meta.history||[]).slice(-99),entry].sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.createdAt).localeCompare(String(b.createdAt))); const latest=history.at(-1);
  await sbFetch("/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(item.id)+"&building_id=eq."+building,{
   method:"PATCH",token:centralSession.access_token,
   body:{specs:{...item.specs,_estaUpgrade:{...meta,history,verified:condition==="chua"?!!meta.verified:true,condition:latest.condition,lastCheck:latest.date}}}
  });
  const persisted=await getSaved(item.id,building);
  if(!persisted||!(metaOf(persisted).history||[]).some(h=>h.createdAt===entry.createdAt&&h.date===entry.date&&h.condition===entry.condition))throw new Error("Máy chủ chưa xác nhận kết quả kiểm tra đã lưu.");
  if(currentEquipmentProjectId()!==building)return;
  fetchedAt=0;await load(true);openForm(item.id);
  if(typeof toast==="function")toast("Đã lưu lịch sử kiểm tra và hình ảnh.");
 }catch(err){formError(err?.message||"Không lưu được kết quả kiểm tra.");}
 finally{button.disabled=false;button.textContent="✓ Lưu lần kiểm tra"}
}
async function printReport(){
 if(!active())return;
 const rows=currentRows().filter(x=>!x.virtual&&metaOf(x).verified),verified=rows;
 if(!verified.length){if(typeof toast==="function")toast("Chưa có hồ sơ xác minh phù hợp để in.");return;}
 const win=window.open("","_blank");if(!win){alert("Trình duyệt đang chặn cửa sổ in.");return}
 const escPrint=esc;
 const parts=[];
 for(const x of verified){
  const latest=(metaOf(x).history||[]).slice(-1)[0];if(!latest?.photos?.length)continue;
  const urls=await Promise.all(latest.photos.slice(0,6).map(async ref=>{try{return await mediaObjectUrl(ref)}catch{return ""}}));
  parts.push('<section class="proof"><h3>'+escPrint(x.name)+' · '+escPrint(latest.date)+'</h3><div class="photos">'+
   urls.filter(Boolean).map(u=>'<img src="'+escPrint(u)+'">').join("")+'</div></section>');
 }
 const details=verified.map(x=>{
  const sp=x.specs||{},meta=metaOf(x),t=meta.technicalType||x._technicalType||"";
  const fields=[...advancedFields(t),...extraFields(),...installFields()];
  const specified=fields.filter(f=>String(sp[f.key]||"").trim()).map(f=>'<div><b>'+escPrint(f.title)+':</b> '+escPrint(sp[f.key])+(f.unit&&f.unit!=="@"?" "+escPrint(f.unit):"")+'</div>');
  (meta.custom||[]).forEach(c=>specified.push('<div><b>'+escPrint(c.key||c.k)+':</b> '+escPrint(c.value||c.v)+'</div>'));
  return specified.length?'<section class="spec"><h3>'+escPrint(label(x))+'</h3><div class="specgrid">'+specified.join("")+'</div></section>':"";
 }).filter(Boolean).join("");
 const html='<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>ESTA - '+escPrint(projectDisplayName())+' - Hệ thống kỹ thuật</title>'+
 '<style>@page{size:A4;margin:13mm}body{font:12px Arial,sans-serif;color:#243b44}header{border-bottom:2px solid #214a43;padding-bottom:9px}h1{font-size:19px}h2{font-size:14px;margin-top:17px}h3{font-size:12px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #bdc9c4;padding:7px;text-align:left}th{background:#e8f0ea}tr{break-inside:avoid}.notice{font-size:11px;color:#546c66}.spec,.proof{break-inside:avoid;margin-top:10px}.specgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px;font-size:10px}.photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.photos img{max-width:100%;max-height:76mm;object-fit:contain;border:1px solid #d3dcda}footer{display:flex;justify-content:space-between;margin-top:27mm;break-inside:avoid}</style></head><body>'+
 '<header><b>ESTA · PROPERTY OPERATIONS</b><h1>BÁO CÁO THÔNG TIN HỆ THỐNG TÒA NHÀ</h1><div>Dự án: '+escPrint(projectDisplayName())+' · Ngày lập: '+escPrint(new Date().toLocaleDateString("vi-VN"))+'</div></header>'+
 '<p class="notice">'+verified.length+' hồ sơ đã xác minh theo bộ lọc. Thiết bị chưa xác minh không xuất hiện trong báo cáo.</p>'+
 '<table><thead><tr><th>STT</th><th>Thiết bị</th><th>Nhóm hệ thống</th><th>Vị trí</th><th>Tình trạng</th><th>Kiểm tra</th><th>Hạn kế tiếp</th></tr></thead><tbody>'+
 rows.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+escPrint(x.name)+'</td><td>'+escPrint(x.system_group)+'</td><td>'+escPrint(x.location||"—")+'</td><td>'+
 escPrint(CONDITIONS[conditionOf(x)]||"—")+'</td><td>'+escPrint(viDate(metaOf(x).lastCheck||metaOf(x).history?.at(-1)?.date))+'</td><td>'+escPrint(viDate(inspectionDue(x)))+'</td></tr>').join("")+
 '</tbody></table><h2>THÔNG SỐ KỸ THUẬT ĐÃ GHI NHẬN</h2>'+details+'<h2>HÌNH ẢNH KIỂM TRA (HỒ SƠ XÁC MINH)</h2>'+parts.join("")+
 '<footer><div>Người lập phiếu<br><br><br>________________</div><div>Kỹ thuật xác nhận<br><br><br>________________</div></footer></body></html>';
 win.document.open();win.document.write(html);win.document.close();
 let printed=false;const trigger=()=>{if(printed||win.closed)return;printed=true;win.focus();win.print()};
 win.addEventListener("load",trigger,{once:true});
 Promise.all([...win.document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve}))).then(trigger);
 setTimeout(trigger,4500);
}

async function remove(){
 if(!allowed())return formError("Bạn không có quyền xóa thiết bị.");
 const building=currentEquipmentProjectId();
 const existing=items.find(x=>String(x.id)===String(editId));
 const builtIn=SEEDS.find(x=>x.seedKey===editingSeed);
 const selected=existing||builtIn;
 if(!selected)return;
 const name=label(selected);
 if(!confirm('Xóa thiết bị “'+name+'” khỏi danh sách '+projectDisplayName()+'? Thao tác này không ảnh hưởng các dự án khác.'))return;
 const button=$("ueDelete");button.disabled=true;button.textContent="Đang xóa...";
 try{
  if(existing&&metaOf(existing).seedKey){
   // For original built-in entries, keep an archived marker so they do not reappear after refresh.
   await sbFetch("/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(existing.id)+"&building_id=eq."+building,{
    method:"PATCH",token:centralSession.access_token,
    body:{specs:{...existing.specs,_estaUpgrade:{...metaOf(existing),archived:true}}}
   });
   const row=await getSaved(existing.id,building);
   if(!row||!metaOf(row).archived)throw new Error("Không xác nhận được thao tác xóa.");
  }else if(builtIn&&!existing){
   // Never write or delete another project's data; hide this predefined category in the active project.
   const id=crypto.randomUUID();
   await sbFetch("/rest/v1/"+TABLE,{
    method:"POST",token:centralSession.access_token,
    body:{id,building_id:building,name:builtIn.name,equipment_type:builtIn.equipment_type,
      system_group:builtIn.system_group,location:builtIn.location,quantity:1,status:"Ngừng sử dụng",
      specs:{_estaUpgrade:{seedKey:builtIn.seedKey,archived:true,verified:false,history:[]}}}
   });
   const row=await getSaved(id,building);
   if(!row||!metaOf(row).archived)throw new Error("Không xác nhận được thao tác xóa.");
  }else{
   // User-created equipment not from a predefined entry can be deleted from the register.
   await sbFetch("/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(existing.id)+"&building_id=eq."+building,{
    method:"DELETE",token:centralSession.access_token
   });
   if(await getSaved(existing.id,building))throw new Error("Hệ thống chưa xóa được thiết bị.");
  }
  if(currentEquipmentProjectId()!==building)return;
  closeForm();fetchedAt=0;await load(true);
  if(error)throw new Error("Đã xóa nhưng chưa tải lại được danh sách. Vui lòng bấm Làm mới.");
  if(typeof toast==="function")toast("Đã xóa thiết bị khỏi "+projectDisplayName()+".");
 }catch(err){formError(err?.message||"Không xóa được thiết bị.");}
 finally{button.disabled=false;button.textContent="🗑 Xóa thiết bị";}
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&dialog&&!dialog.hidden)closeForm()});
window.estaUpgradeAssets={render,refresh:()=>load(true),close:closeForm,async focusEquipment(id){
 if(!LINK_BUILDINGS.has(currentEquipmentProjectId()))return;
 const building=currentEquipmentProjectId();
 await load();
 if(currentEquipmentProjectId()!==building)return;
 expandedDeviceId=String(id||"");group="";status="";search="";
 const page=$("updateAssetsPage");if(!page)return;
 render(page,true);
 const row=[...page.querySelectorAll("[data-ue-id]")].find(el=>el.dataset.ueId===expandedDeviceId);
 row?.scrollIntoView?.({block:"center",behavior:"smooth"});
}};
})();
