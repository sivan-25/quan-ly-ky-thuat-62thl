/* ESTA Bản nâng cấp — thử nghiệm hồ sơ hệ thống kỹ thuật (Claude adapter).
 * 44 mẫu là biểu mẫu chưa xác minh; không tạo thiết bị bảo trì, lịch, hay cảnh báo.
 * Không dùng localStorage cho dữ liệu kinh doanh, không truy cập dự án khác.
 */
(function(){
"use strict";
const BID="NANGCAP";
const $=id=>document.getElementById(id);
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
const STAT={tot:"Tốt",theodoi:"Cần theo dõi",hu:"Hư hỏng",sua:"Đang sửa",chua:"Chưa kiểm tra"};
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iso=()=>new Date().toLocaleDateString("en-CA");
const fmt=d=>d?String(d).slice(0,10).split("-").reverse().join("/"):"—";
const active=()=>typeof currentBuilding!=="undefined"&&currentBuilding&&currentBuilding.id===BID&&
 typeof projectOverviewActive!=="undefined"&&projectOverviewActive;
const writable=()=>active()&&typeof canProjectEdit==="function"&&canProjectEdit();
const auth=()=>typeof centralSession!=="undefined"&&centralSession&&centralSession.access_token;
const req=(p,opt={})=>sbFetch(p,Object.assign({token:auth()},opt));
const seeds=G.flatMap(g=>g[3].map((x,i)=>({
 key:g[0]+":"+i,group:g[0],groupName:g[1],cadence:g[2],type:x[2],name:x[0],location:x[1],virtual:true,
 specs:{},meta:{sample:true,verified:false,condition:"chua",history:[],photos:[]}
})));
let list=[],assets=[],filterGroup="all",filterStatus="all",search="",opened="",busy=false,loaded=false,seq=0;
function fromRow(r){
 const sp=r.specs||{},meta=sp._estaUpgrade||{},seed=seeds.find(x=>x.key===meta.seedKey);
 return {id:r.id,key:meta.seedKey||"",group:seed?.group||r.system_group,groupName:seed?.groupName||r.system_group,
 cadence:seed?.cadence||30,type:r.equipment_type,name:r.name,location:r.location,brand:r.brand,model:r.model,
 code:r.code,quantity:r.quantity,virtual:false,operation:r.status,specs:sp,
 meta:Object.assign({sample:false,verified:true,condition:"chua",history:[],photos:[]},meta)};
}
function reset(){
 filterGroup="all";filterStatus="all";search="";opened="";loaded=false;list=[];assets=[];
}
function allEquipment(){
 const keyed=new Set(list.filter(x=>x.key).map(x=>x.key));
 return list.concat(seeds.filter(x=>!keyed.has(x.key)));
}
function groupLabel(id){return G.find(g=>g[0]===id)?.[1]||id}
function nextDate(e){
 const h=e.meta.history||[],last=h[h.length-1];
 if(!e.meta.verified||!last?.date)return "";
 const d=new Date(last.date+"T12:00:00");if(!Number.isFinite(d.getTime()))return "";
 d.setDate(d.getDate()+(e.cadence||30));return d.toLocaleDateString("en-CA");
}
function rows(){
 return allEquipment().filter(e=>(filterGroup==="all"||e.group===filterGroup)&&
 (filterStatus==="all"||(filterStatus==="unverified"?!e.meta.verified:e.meta.verified&&e.meta.condition===filterStatus))&&
 (e.name+" "+e.location+" "+(e.code||"")).toLocaleLowerCase("vi-VN").includes(search.toLocaleLowerCase("vi-VN")));
}
function showNotice(message){const el=$("tsUpgradeNotice");if(el)el.textContent=message}
function render(){
 if(!active())return;
 const all=allEquipment(),verified=all.filter(e=>e.meta.verified),bad=verified.filter(e=>["hu","sua","theodoi"].includes(e.meta.condition));
 $("tsUpgradeSummary").innerHTML='<div><b>'+all.length+'</b><small>Mẫu & hồ sơ</small></div>'+
  '<div><b>'+verified.length+'</b><small>Đã xác minh</small></div>'+
  '<div><b>'+bad.length+'</b><small>Cần chú ý</small></div>'+
  '<div><b>'+verified.filter(e=>nextDate(e)&&nextDate(e)<iso()).length+'</b><small>Quá hạn kiểm tra</small></div>';
 $("tsUpgradeGroups").innerHTML=[["all","Tất cả hệ thống",all.length]].concat(G.map(g=>[g[0],g[1],all.filter(e=>e.group===g[0]).length]))
  .map(x=>'<button type="button" class="'+(x[0]===filterGroup?"selected":"")+'" data-ts-group="'+esc(x[0])+'">'+esc(x[1])+' <b>'+x[2]+'</b></button>').join("");
 const rs=rows();
 $("tsUpgradeCount").textContent=rs.length+" mục";
 $("tsUpgradeList").innerHTML=rs.length?rs.map(e=>{
  const due=nextDate(e),label=e.meta.verified?(STAT[e.meta.condition]||"Chưa kiểm tra"):"Chưa xác minh";
  return '<button type="button" class="tsUpgradeRow" data-ts-item="'+esc(e.id||e.key)+'"><span><strong>'+esc(e.name)+'</strong><small>'+esc(groupLabel(e.group))+' · '+esc(e.location)+' · '+(e.virtual?"Hồ sơ mẫu":"Đã lưu")+'</small></span>'+
   '<span class="tsUpgradePill s-'+esc(e.meta.verified?e.meta.condition:"verify")+'">'+esc(label)+'</span>'+
   '<small>'+esc(due?"Kiểm tra kế tiếp: "+fmt(due):"Chưa đặt lịch")+'</small></button>';
 }).join(""):'<p class="tsUpgradeEmpty">Không có thiết bị phù hợp bộ lọc.</p>';
}
function fields(e){
 const common="ma|Mã thiết bị (tag);hang|Hãng sản xuất;model|Model;serial|Số serial;xuatxu|Xuất xứ;nam|Năm sản xuất";
 const warranty="lap|Ngày lắp đặt;bh|Hết hạn bảo hành;nhathau|Nhà thầu lắp đặt;dvbt|Đơn vị bảo trì;lienhe|SĐT bảo trì";
 return (common+";"+(F[e.type]||"cs|Công suất;sl|Số lượng;kv|Khu vực sử dụng")+";"+warranty)
  .split(";").map(s=>{const p=s.split("|");return {key:p[0],label:p[1],unit:p[2]||""}});
}
function panel(e){
 const linked=String(e.meta.linkedAsset||"");
 const opts='<option value="">Chưa liên kết</option>'+assets.map(a=>'<option value="'+esc(a.id)+'"'+(a.id===linked?" selected":"")+'>'+esc(a.code||"")+' · '+esc(a.name)+' · '+esc(a.location)+'</option>').join("");
 const log=(e.meta.history||[]).slice().reverse().map(h=>'<div class="tsUpgradeLog"><strong>'+esc(fmt(h.date))+' · '+esc(STAT[h.condition]||"—")+'</strong><small>'+esc(h.by||"")+' · '+esc(h.note||"")+'</small><div class="tsUpgradePhotos">'+(h.photos||[]).map((ref,i)=>'<img alt="Ảnh kiểm tra '+(i+1)+'" data-ts-photo="'+esc(ref)+'">').join("")+'</div></div>').join("");
 const can=writable();
 $("tsUpgradeDrawer").innerHTML='<div class="tsUpgradeDrawerHead"><div><small>'+esc(groupLabel(e.group))+' · '+(e.virtual?"Mẫu chưa lưu":"Hồ sơ đã lưu")+'</small><h3>'+esc(e.name)+'</h3></div><button type="button" data-ts-close aria-label="Đóng">×</button></div>'+
 '<form id="tsUpgradeProfileForm"><div class="tsUpgradeFields"><label>Tên thiết bị<input name="name" required value="'+esc(e.name)+'"'+(!can?" disabled":"")+'></label>'+
 '<label>Vị trí<input name="location" value="'+esc(e.location)+'"'+(!can?" disabled":"")+'></label>'+
 '<label>Mã thiết bị<input name="code" value="'+esc(e.code||"")+'"'+(!can?" disabled":"")+'></label>'+
 '<label>Trạng thái hồ sơ<select name="verified"'+(!can?" disabled":"")+'><option value="0"'+(!e.meta.verified?" selected":"")+'>Chưa xác minh thiết bị thực tế</option><option value="1"'+(e.meta.verified?" selected":"")+'>Đã xác minh tại tòa nhà</option></select></label>'+
 '<label>Thiết bị bảo trì liên quan<select name="linkedAsset"'+(!can?" disabled":"")+'>'+opts+'</select></label></div>'+
 '<h4>Thông số kỹ thuật</h4><div class="tsUpgradeFields">'+fields(e).map(f=>'<label>'+esc(f.label)+(f.unit?' ('+esc(f.unit)+')':'')+'<input name="sp_'+esc(f.key)+'" value="'+esc(e.specs[f.key]||"")+'"'+(!can?" disabled":"")+'></label>').join("")+'</div>'+
 (can?'<div class="tsUpgradeButtons"><button type="submit">Lưu hồ sơ thiết bị</button></div>':'')+'</form>'+
 '<section class="tsUpgradeInspect"><h4>Ghi kiểm tra tình trạng</h4>'+
 (can?'<form id="tsUpgradeCheckForm"><div class="tsUpgradeFields"><label>Ngày kiểm tra<input type="date" name="date" required value="'+iso()+'"></label><label>Tình trạng<select name="condition">'+Object.entries(STAT).map(x=>'<option value="'+x[0]+'">'+esc(x[1])+'</option>').join("")+'</select></label><label>Người thực hiện<input name="by" maxlength="120" required></label><label>Thông số đo / ghi chú<input name="note" maxlength="1000"></label><label>Ảnh minh chứng (có thể chọn nhiều)<input name="photos" type="file" accept="image/*" multiple></label></div><button type="submit">Lưu lần kiểm tra</button></form>':
 '<p>Tài khoản này chỉ có quyền xem.</p>')+
 '<h4>Lịch sử kiểm tra</h4>'+(log||'<p>Chưa ghi nhận lần kiểm tra nào.</p>')+'</section>';
 $("tsUpgradeBackdrop").hidden=false;$("tsUpgradeDrawer").hidden=false;
 $("tsUpgradeDrawer").scrollTop=0;
 $("tsUpgradeProfileForm")?.addEventListener("submit",event=>saveProfile(event,e));
 $("tsUpgradeCheckForm")?.addEventListener("submit",event=>saveCheck(event,e));
 Promise.resolve().then(async()=>{
  for(const img of $("tsUpgradeDrawer").querySelectorAll("img[data-ts-photo]")){
   try{img.src=await mediaObjectUrl(img.dataset.tsPhoto)}catch(_err){img.alt="Không tải được ảnh"}
  }
 });
}
function findOpen(){
 return allEquipment().find(e=>(e.id||e.key)===opened);
}
function open(id){const e=allEquipment().find(x=>(x.id||x.key)===id);if(!e)return;opened=id;panel(e)}
function close(){opened="";$("tsUpgradeBackdrop").hidden=true;$("tsUpgradeDrawer").hidden=true;$("tsUpgradeDrawer").innerHTML=""}
async function persist(e){
 if(!writable())throw Error("Không có quyền sửa dự án Bản nâng cấp");
 const sp=Object.assign({},e.specs,{_estaUpgrade:Object.assign({},e.meta,{seedKey:e.key||null})});
 const body={building_id:BID,system_group:e.group,equipment_type:e.type||"khac",name:e.name,
 code:e.code||"",brand:sp.hang||"",model:sp.model||"",location:e.location||"",
 quantity:Math.max(1,Number(e.quantity)||1),status:e.operation||"Đang sử dụng",
 install_year:null,specs:sp,note:""};
 if(!e.id){body.id=crypto.randomUUID();await req("/rest/v1/building_equipment_profiles_nangcap",{method:"POST",body});e.id=body.id;e.virtual=false}
 else await req("/rest/v1/building_equipment_profiles_nangcap?id=eq."+encodeURIComponent(e.id)+"&building_id=eq."+BID,{method:"PATCH",body});
 const i=list.findIndex(x=>x.id===e.id);
 if(i<0)list.push(e);else list[i]=e;
 return e;
}
async function saveProfile(event,e){
 event.preventDefault();if(busy)return;
 const form=event.currentTarget,fd=new FormData(form);
 const linked=String(fd.get("linkedAsset")||"");
 if(linked&&!assets.some(x=>x.id===linked))return showNotice("Thiết bị bảo trì không thuộc dự án Bản nâng cấp.");
 const newer=Object.assign({},e,{name:String(fd.get("name")||"").trim(),location:String(fd.get("location")||"").trim(),
 code:String(fd.get("code")||"").trim(),specs:Object.assign({},e.specs),meta:Object.assign({},e.meta,{verified:fd.get("verified")==="1",linkedAsset:linked})});
 if(!newer.name)return;
 fields(e).forEach(f=>{newer.specs[f.key]=String(fd.get("sp_"+f.key)||"").trim()});
 busy=true;try{await persist(newer);showNotice("Đã lưu hồ sơ Bản nâng cấp.");opened=newer.id;render();panel(newer)}
 catch(err){showNotice("Không lưu được: "+String(err.message||err))}
 finally{busy=false}
}
async function saveCheck(event,e){
 event.preventDefault();if(busy)return;
 const fd=new FormData(event.currentTarget);
 const date=String(fd.get("date")||""),by=String(fd.get("by")||"").trim(),condition=String(fd.get("condition")||"");
 if(!date||!by||!STAT[condition])return;
 const files=[...event.currentTarget.querySelector('input[name="photos"]').files];
 busy=true;
 try{
  const newer=Object.assign({},e,{specs:Object.assign({},e.specs),meta:Object.assign({},e.meta)});
  newer.meta.history=[...(e.meta.history||[])];
  const id=e.id||crypto.randomUUID();
  const photos=files.length?await uploadMediaFiles(files,"technical-equipment",id,null,BID):[];
  newer.meta.history.push({date,by,condition,note:String(fd.get("note")||"").trim(),photos,createdAt:new Date().toISOString()});
  newer.meta.condition=condition;newer.meta.lastCheck=date;
  await persist(newer);
  showNotice("Đã lưu kiểm tra. Thiết bị chưa được xác minh sẽ không tính vào cảnh báo.");
  opened=newer.id;render();panel(newer)
 }catch(err){showNotice("Không lưu được lần kiểm tra: "+String(err.message||err))}
 finally{busy=false}
}
function report(){
 if(!active())return;
 const verified=allEquipment().filter(e=>e.meta.verified);
 const body=verified.map((e,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(e.name)+'</td><td>'+esc(groupLabel(e.group))+'</td><td>'+esc(e.location)+'</td><td>'+esc(STAT[e.meta.condition])+'</td><td>'+esc(fmt(e.meta.lastCheck))+'</td></tr>').join("");
 const html='<!doctype html><html lang="vi"><meta charset="utf-8"><title>ESTA · Hồ sơ kỹ thuật Bản nâng cấp</title>'+
 '<style>body{font:12px Arial;color:#162a39;padding:16mm}h1{color:#173b56}header{border-bottom:2px solid #173b56;padding-bottom:10px}table{border-collapse:collapse;width:100%;margin-top:15px}th,td{border:1px solid #889;padding:7px;text-align:left}th{background:#eef2ed}footer{display:flex;justify-content:space-between;margin-top:35mm}@page{size:A4;margin:12mm}</style>'+
 '<header><strong>ESTA · PROPERTY MANAGEMENT</strong><h1>THEO DÕI HỆ THỐNG KỸ THUẬT</h1><div>Dự án: Bản nâng cấp · Ngày lập: '+esc(fmt(iso()))+'</div></header>'+
 '<p>Tổng '+verified.length+' hồ sơ thiết bị đã xác minh. 44 mẫu chưa xác minh không tính vào kết quả vận hành.</p>'+
 '<table><thead><tr><th>STT</th><th>Thiết bị</th><th>Hệ thống</th><th>Vị trí</th><th>Tình trạng</th><th>Kiểm tra</th></tr></thead><tbody>'+body+'</tbody></table>'+
 '<footer><div>Kỹ thuật<br><br><br>_________________</div><div>Đại diện kiểm tra<br><br><br>_________________</div></footer></html>';
 const win=window.open("","_blank");if(!win)return showNotice("Trình duyệt chặn cửa sổ in báo cáo");
 win.document.open();win.document.write(html);win.document.close();win.focus();win.print();
}
async function load(){
 if(!active())return;
 const version=++seq;
 showNotice("Đang tải hồ sơ kỹ thuật Bản nâng cấp...");
 try{
  if(!auth())throw Error("Cần đăng nhập để xem dữ liệu");
  const [p,a]=await Promise.all([
   req("/rest/v1/building_equipment_profiles_nangcap?building_id=eq.NANGCAP&select=*&order=created_at.asc"),
   req("/rest/v1/maintenance_assets?building_id=eq.NANGCAP&select=id,code,name,location&order=name.asc")
  ]);
  if(version!==seq||!active())return;
  list=Array.isArray(p)?p.map(fromRow):[];assets=Array.isArray(a)?a:[];loaded=true;
  showNotice("Có 44 mẫu thiết bị để tham khảo. Chỉ hồ sơ đã xác minh mới được thống kê tình trạng.");render();
 }catch(err){if(version!==seq)return;list=[];assets=[];loaded=false;showNotice("Không thể tải Supabase: "+String(err.message||err));render()}
}
function mount(){
 if(!active())return;
 $("tsUpgradeDrawer").hidden=true;$("tsUpgradeBackdrop").hidden=true;
 if(!loaded)load();else render();
}
const host=$("systemInfoPage");
if(host){
 $("tsUpgradeGroups").addEventListener("click",event=>{const b=event.target.closest("[data-ts-group]");if(!b)return;filterGroup=b.dataset.tsGroup;render()});
 $("tsUpgradeList").addEventListener("click",event=>{const b=event.target.closest("[data-ts-item]");if(b)open(b.dataset.tsItem)});
 $("tsUpgradeSearch").addEventListener("input",event=>{search=event.target.value;render()});
 $("tsUpgradeStatus").addEventListener("change",event=>{filterStatus=event.target.value;render()});
 $("tsUpgradePrint").addEventListener("click",report);
 $("tsUpgradeRefresh").addEventListener("click",()=>{loaded=false;load()});
 $("tsUpgradeBackdrop").addEventListener("click",close);
 $("tsUpgradeDrawer").addEventListener("click",event=>{if(event.target.closest("[data-ts-close]"))close()});
 document.addEventListener("keydown",event=>{if(event.key==="Escape"&&opened)close()});
}
window.mountTechnicalSystemsUpgrade=mount;
window.resetTechnicalSystemsUpgrade=()=>{++seq;reset();close()};
window.technicalSystemsUpgradeMeta={project:BID,systems:G.length,templates:seeds.length};
})();