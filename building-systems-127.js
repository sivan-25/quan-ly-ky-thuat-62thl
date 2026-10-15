(function(){
"use strict";
// ESTA · Thiết kế thử nghiệm 127 Hồng Hà · độc lập giao diện 130 HH.
const PROJECT="127HH";
const $=id=>document.getElementById(id);
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const CATALOG={
 "Điện":["Máy biến áp","Tủ điện MSB","Tủ điện MDB / DB","Máy phát điện","ATS","UPS","Tủ tụ bù","Công tơ điện","Đèn chiếu sáng","Đèn sự cố","Khác"],
 "Điều hòa & thông gió":["Điều hòa âm trần","Điều hòa treo tường","VRV / VRF","Chiller","AHU","FCU","PAU","Tháp giải nhiệt","Bơm nước lạnh","Quạt cấp gió","Quạt hút gió","Quạt Jetfan","Khác"],
 "PCCC":["Trung tâm báo cháy","Đầu báo cháy","Nút nhấn báo cháy","Bơm chữa cháy điện","Bơm chữa cháy diesel","Bơm bù áp Jockey","Tủ điều khiển bơm PCCC","Sprinkler","Họng nước chữa cháy","Bình chữa cháy","Quạt tăng áp","Quạt hút khói","Đèn exit","Bể nước PCCC","Khác"],
 "Cấp & thoát nước":["Bơm cấp nước","Bơm tăng áp","Bơm thoát nước","Bơm chìm hố gom","Bồn chứa nước","Bể ngầm","Đồng hồ nước","Van giảm áp","Bộ lọc nước","Khác"],
 "Xử lý nước thải":["Bơm nước thải","Máy thổi khí","Bơm định lượng","Máy khuấy","Tủ điều khiển XLNT","Bồn hóa chất","Đồng hồ lưu lượng","Hệ thống xử lý nước thải","Khác"],
 "Thang máy":["Thang máy khách","Thang hàng","Thang chữa cháy","Thang cuốn","Tủ điều khiển thang","Khác"],
 "Camera & an ninh":["Camera IP","Camera analog","Đầu ghi NVR / DVR","Đầu đọc kiểm soát ra vào","Bộ điều khiển cửa","Khóa điện từ","Barie","Intercom","Khác"],
 "BMS & viễn thông":["Bộ điều khiển BMS","Tủ BMS","Cảm biến BMS","Switch mạng","Router","Wi-Fi AP","Máy chủ","Hệ thống âm thanh PA","Khác"],
 "Hạng mục khác":["Cửa tự động","Cửa chống cháy","Cửa cuốn","Hệ thống chống sét","Máy bơm khác","Thiết bị khác"]
};
const BRANDS={
 "Điện":["Schneider","ABB","Siemens","LS","Mitsubishi","Fuji","Hyundai","Cummins","Denyo","Eaton","Delta","Chint"],
 "Điều hòa & thông gió":["Daikin","Mitsubishi Electric","Mitsubishi Heavy","Panasonic","LG","Samsung","Toshiba","Nagakawa","Trane","Carrier","York","Kruger","iFan","Systemair"],
 "PCCC":["Hochiki","Notifier","Siemens","GST","Nohmi","Bosch","Grundfos","Pentax","Ebara","Wilo","Pentair","SafeFire"],
 "Cấp & thoát nước":["Grundfos","Ebara","Pentax","Wilo","KSB","Tsurumi","DAB","Panasonic","Sensus","Itron","Zenner"],
 "Xử lý nước thải":["Ebara","Tsurumi","Grundfos","Wilo","Longtech","ShinMaywa","SEKO","Prominent"],
 "Thang máy":["KONE","Otis","Schindler","Mitsubishi","Hitachi","Thyssenkrupp","Fujitec","Hyundai"],
 "Camera & an ninh":["Hikvision","Dahua","Axis","Bosch","Hanwha","Uniview","ZKTeco","HID","Honeywell"],
 "BMS & viễn thông":["Siemens","Schneider","Honeywell","Johnson Controls","Cisco","Ubiquiti","TP-Link","HPE"],
 "Hạng mục khác":["Panasonic","Schneider","ABB","Bosch"]
};
const LOCATIONS=["Tầng hầm B1","Tầng hầm B2","Tầng trệt","Tầng lửng","Tầng kỹ thuật","Sân thượng","Phòng máy","Phòng điện","Phòng bơm","Phòng PCCC","Khu vực chung","Các tầng","Ngoài trời"];
const FIELDS={
 volt:["Điện áp","V",["220","380","400","415","24","12","110","Khác"]],
 phase:["Số pha","",["1 pha","3 pha"]],
 power:["Công suất điện","kW",["0.37","0.75","1.1","1.5","2.2","3","4","5.5","7.5","11","15","18.5","22","30","37","45","55","75","90","110","Khác"]],
 kva:["Công suất định mức","kVA",["10","20","30","50","75","100","150","200","250","300","400","500","630","750","800","1000","1250","1500","2000","Khác"]],
 hp:["Công suất","HP",["0.5","1","1.5","2","2.5","3","4","5","7.5","10","15","20","30","Khác"]],
 btu:["Năng suất lạnh","BTU/h",["9000","12000","18000","24000","28000","36000","42000","48000","60000","96000","Khác"]],
 gas:["Môi chất lạnh","",["R22","R32","R410A","R134a","R407C","R290","Khác"]],
 flow:["Lưu lượng","m³/h",["1","2","3","5","10","15","20","30","50","75","100","150","200","300","500","Khác"]],
 head:["Cột áp","m",["5","10","15","20","25","30","35","40","50","60","80","100","Khác"]],
 pressure:["Áp suất","bar",["2","3","4","5","6","7","8","10","12","16","Khác"]],
 volume:["Dung tích","m³",["0.5","1","2","3","5","10","20","30","50","75","100","150","200","300","Khác"]],
 capacity:["Công suất xử lý","m³/ngày",["5","10","15","20","30","40","50","75","100","150","200","Khác"]],
 dn:["Đường kính","DN",["15","20","25","32","40","50","65","80","100","125","150","200","250","300","Khác"]],
 load:["Tải trọng","kg",["320","450","630","750","800","1000","1150","1350","1600","2000","Khác"]],
 stop:["Số điểm dừng","",["2","3","4","5","6","8","10","12","15","16","20","24","Khác"]],
 speed:["Tốc độ","m/s",["0.5","0.63","1","1.5","1.75","2","2.5","3","4","Khác"]],
 loop:["Số loop / zone","",["1","2","4","8","16","32","64","Khác"]],
 resolution:["Độ phân giải","MP",["2","4","5","6","8","12","Khác"]],
 disk:["Dung lượng lưu trữ","TB",["1","2","4","6","8","10","12","16","24","32","Khác"]],
 protocol:["Giao thức","",["BACnet","Modbus RTU","Modbus TCP","KNX","ONVIF","TCP/IP","RS485","Khác"]],
 amperage:["Dòng điện","A",["10","16","20","32","40","50","63","80","100","125","160","200","250","400","630","800","1000","1600","2000","2500","3200","4000","Khác"]],
 year:["Năm sản xuất","",Array.from({length:31},(_,i)=>String(new Date().getFullYear()-i))]
};
function fieldsFor(group,type){
 const t=type.toLowerCase();
 if(group==="Thang máy")return ["load","stop","speed","volt"];
 if(group==="Camera & an ninh")return /camera/i.test(type)?["resolution","volt"]: /đầu ghi/i.test(type)?["disk","volt"]:["volt","protocol"];
 if(group==="BMS & viễn thông")return ["volt","protocol"];
 if(group==="Xử lý nước thải")return /hệ thống/i.test(type)?["capacity","flow"]: /bơm|thổi|khuấy/i.test(type)?["power","flow","head"]:["volt","flow"];
 if(group==="Cấp & thoát nước")return /bồn|bể/i.test(type)?["volume"]: /đồng hồ|van/i.test(type)?["dn","flow"]:["hp","flow","head","dn"];
 if(group==="PCCC"){
  if(/bơm/i.test(type))return ["power","flow","head","pressure"];
  if(/bể/i.test(type))return ["volume"];
  if(/trung tâm/i.test(type))return ["loop","volt"];
  if(/quạt/i.test(type))return ["power","flow","pressure"];
  return ["volt","pressure"];
 }
 if(group==="Điều hòa & thông gió")return /điều hòa|VRV|VRF|Chiller|AHU|FCU|PAU/i.test(type)?["hp","btu","gas","volt"]:["power","flow","volt"];
 if(group==="Điện")return /máy biến áp|máy phát|UPS/i.test(type)?["kva","volt","phase"]: /tủ|ATS|tụ|công tơ/i.test(type)?["amperage","volt","phase"]:["power","volt"];
 return ["power","volt"];
}
const state={rows:[],loading:false,busy:false,filterGroup:"Điện",filterText:"",filterStatus:"",editing:null,request:0,openGroups:new Set(["Điện"])};
const active=()=>typeof currentBuilding!=="undefined"&&currentBuilding?.id===PROJECT&&typeof projectOverviewActive!=="undefined"&&projectOverviewActive;
const writable=()=>typeof canProjectEdit==="function"&&canProjectEdit();
const option=(values,selected="",placeholder="Chọn")=>'<option value="">'+safe(placeholder)+'</option>'+values.map(v=>'<option value="'+safe(v)+'"'+(String(v)===String(selected)?" selected":"")+'>'+safe(v)+'</option>').join("");
const groups=()=>Object.keys(CATALOG);
const msg=(m,isError=false)=>{const el=$("bs127Notice");if(el){el.textContent=m;el.className="bs127Notice "+(isError?"error":"ok");}if(!isError&&typeof toast==="function")toast(m)};
function renderShell(){
 const root=$("buildingSystems127");
 if(!root||root.dataset.mounted)return;
 root.dataset.mounted="1";
 root.innerHTML='<div class="bs127Intro"><div><div class="bs127Eyebrow">ESTA · 127 HỒNG HÀ · THIẾT KẾ NÂNG CẤP</div><h2>Thông tin hệ thống tòa nhà</h2><p>Chọn hệ thống và thiết bị có sẵn, điền thông số ngay trên trang và lưu. Các mục chưa khai báo không được tính là thiết bị hiện hữu.</p></div><span class="bs127TrialTag">GIAO DIỆN MẪU MỚI</span></div>'+
 '<div class="bs127Metrics"><div><strong id="bs127Count">0</strong><span>Hồ sơ thiết bị</span></div><div><strong id="bs127Groups">0</strong><span>Hệ thống đã khai báo</span></div><div><strong id="bs127Units">0</strong><span>Tổng số thiết bị</span></div></div>'+
 '<div class="bs127Toolbar"><label class="bs127Search"><span>⌕</span><input id="bs127Search" type="search" placeholder="Tìm tên, hãng, mã, vị trí..." aria-label="Tìm thiết bị"></label><select id="bs127FilterGroup" aria-label="Lọc hệ thống">'+option(groups(),"","Tất cả hệ thống")+'</select><select id="bs127FilterStatus" aria-label="Lọc tình trạng">'+option(["Chưa khai báo","Đang sử dụng","Dự phòng","Ngừng sử dụng"],"","Tất cả trạng thái")+'</select><button type="button" id="bs127Reload" class="bs127Light">↻ Làm mới</button></div>'+
 '<div id="bs127Notice" class="bs127Notice" role="status" aria-live="polite"></div><div id="bs127List" class="bs127List"></div>'+
 '<div id="bs127Overlay" class="bs127Overlay" hidden><div class="bs127Shade" data-bs-close></div><section class="bs127Dialog" role="dialog" aria-modal="true" aria-labelledby="bs127DialogTitle"><div class="bs127DialogHead"><div><small>THÔNG SỐ & HỒ SƠ</small><h3 id="bs127DialogTitle">Thêm thiết bị</h3></div><button type="button" id="bs127Close" class="bs127Close" aria-label="Đóng">×</button></div><form id="bs127Form"><div class="bs127FormBody">'+
 '<div class="bs127FormGrid"><label><span class="bs127FieldLabel">Hệ thống <b>*</b></span><select name="system_group" id="bs127Group" required></select></label><label><span class="bs127FieldLabel">Loại thiết bị <b>*</b></span><select name="equipment_type" id="bs127Type" required></select></label></div>'+
 '<div class="bs127FormGrid"><label><span class="bs127FieldLabel">Tên / ký hiệu thiết bị <b>*</b></span><input name="name" required maxlength="160" placeholder="VD: Máy bơm cấp nước số 1"></label><label>Mã thiết bị<input name="code" maxlength="80" placeholder="VD: PUMP-01"></label></div>'+
 '<div class="bs127FormGrid"><label>Hãng sản xuất<select name="brand" id="bs127Brand"></select><input name="brand_custom" id="bs127BrandCustom" maxlength="100" placeholder="Nhập hãng khác" hidden></label><label>Model / Serial (nếu có)<input name="model" maxlength="120" placeholder="Nhập theo tem máy"></label></div>'+
 '<div class="bs127FormGrid"><label>Vị trí<select name="location" id="bs127Location"></select><input name="location_custom" id="bs127LocationCustom" maxlength="120" placeholder="Nhập vị trí khác" hidden></label><label>Số lượng<select name="quantity" id="bs127Quantity"></select></label></div>'+
 '<div class="bs127FormSection"><span>Thông số theo loại thiết bị</span><small>Chọn theo nhãn máy, không bắt buộc điền đủ</small></div><div class="bs127FormGrid" id="bs127Specs"></div>'+
 '<div class="bs127FormGrid"><label>Tình trạng<select name="status">'+option(["Đang sử dụng","Dự phòng","Ngừng sử dụng"],"Đang sử dụng")+'</select></label><label>Năm lắp đặt<select name="install_year">'+option(FIELDS.year[2],"","Chưa chọn")+'</select></label></div>'+
 '<label class="bs127Full">Ghi chú (không bắt buộc)<textarea name="note" maxlength="1000" rows="2" placeholder="Thông tin khác theo thực tế..."></textarea></label></div><div class="bs127DialogFoot"><button type="button" id="bs127Cancel" class="bs127Light">Hủy</button><button id="bs127Save" type="submit" class="bs127Primary">✓ Lưu thiết bị</button></div></form></section></div>';
 // Bản 127 sử dụng danh mục thiết bị có sẵn, không cần nút tạo chung.
 $("bs127Reload").onclick=()=>loadRows();
 // Kết hợp danh mục / biểu mẫu trên cùng trang (desktop); dọc theo thứ tự khi dùng mobile.
 const catalog=$("bs127List"),overlay=$("bs127Overlay");
 const nav=document.createElement("nav");nav.id="bs127QuickGroups";nav.className="bs127QuickGroups";nav.setAttribute("aria-label","Chọn hệ thống");
 catalog.parentNode.insertBefore(nav,catalog);
 const split=document.createElement("div");split.className="bs127Split";
 catalog.parentNode.insertBefore(split,catalog);
 const left=document.createElement("div");left.className="bs127Catalog";
 const right=document.createElement("div");right.className="bs127Dock";
 split.append(left,right);left.append(catalog);
 const hint=document.createElement("div");hint.id="bs127DockHint";hint.className="bs127DockHint";
 hint.innerHTML='<div class="bs127DockMark">▦</div><b>Chọn thiết bị để khai báo</b><p>Danh sách thiết bị đã chuẩn bị sẵn ở bên trái. Chỉ cần bấm <strong>Điền thông số</strong> để nhập và lưu ngay tại đây.</p><span>Không ghi nhận thiết bị cho đến khi bấm Lưu.</span>';
 right.append(hint,overlay);
 nav.addEventListener("click",e=>{
   const btn=e.target.closest("[data-bs127-group]");if(!btn)return;
   const group=btn.dataset.bs127Group;
   if(group===state.filterGroup)return;
   if(!$("bs127Overlay").hidden){
     if(!confirm("Bạn đang mở biểu mẫu thiết bị. Chuyển hệ thống sẽ đóng biểu mẫu đang nhập. Tiếp tục?"))return;
     closeEditor();
   }
   state.filterGroup=group;
   state.openGroups.add(group);
   const filter=$("bs127FilterGroup");if(filter)filter.value=group;
   renderList();
 });

 $("bs127Search").oninput=e=>{state.filterText=e.target.value.trim().toLocaleLowerCase("vi");renderList()};
 $("bs127FilterGroup").onchange=e=>{state.filterGroup=e.target.value;renderList()};
 $("bs127FilterStatus").onchange=e=>{state.filterStatus=e.target.value;renderList()};
 $("bs127Group").onchange=()=>{fillTypes();fillBrands();fillSpecs()};
 $("bs127Type").onchange=fillSpecs;
 $("bs127Brand").onchange=()=>toggleCustom("Brand");
 $("bs127Location").onchange=()=>toggleCustom("Location");
 $("bs127Cancel").onclick=closeEditor;
 $("bs127Close").onclick=closeEditor;
 $("bs127Overlay").querySelector("[data-bs-close]").onclick=closeEditor;
 $("bs127Form").onsubmit=saveRow;
 $("bs127List").addEventListener("click",e=>{
  const toggle=e.target.closest("button[data-bs-toggle]");
  if(toggle){const g=toggle.dataset.bsToggle;if(state.openGroups.has(g))state.openGroups.delete(g);else state.openGroups.add(g);renderList();return}
  const btn=e.target.closest("button[data-bs-template],button[data-bs-edit],button[data-bs-delete]");if(!btn||!writable())return;
  if(btn.hasAttribute("data-bs-template")){openTemplate(btn.dataset.bsGroup,btn.dataset.bsTemplate);return}
  const row=state.rows.find(x=>x.id===btn.dataset.bsEdit||x.id===btn.dataset.bsDelete);
  if(!row)return;
  if(btn.hasAttribute("data-bs-edit"))openEditor(row);else deleteRow(row);
 });
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("bs127Overlay")&&!$("bs127Overlay").hidden)closeEditor()});
}
function toggleCustom(which){
 const sel=$("bs127"+which),inp=$("bs127"+which+"Custom");
 if(!sel||!inp)return;
 inp.hidden=sel.value!=="Khác";
 if(!inp.hidden)inp.focus();
}
function fillTypes(selected=""){
 const group=$("bs127Group").value;
 $("bs127Type").innerHTML=option(CATALOG[group]||[],selected,"Chọn loại thiết bị");
}
function fillBrands(selected=""){
 const group=$("bs127Group").value;
 const known=BRANDS[group]||[];
 const custom=selected&&!known.includes(selected)&&selected!=="Khác";
 $("bs127Brand").innerHTML=option([...known,"Khác"],custom?"Khác":selected,"Chọn hãng");
 $("bs127BrandCustom").value=custom?selected:"";
 $("bs127BrandCustom").hidden=!custom;
}
function fillSpecs(existing={}){
 const group=$("bs127Group").value,type=$("bs127Type").value;
 $("bs127Specs").innerHTML=fieldsFor(group,type).map(key=>{
  const field=FIELDS[key],val=String(existing?.[key]||"");
  const custom=val&&!field[2].includes(val);
  return '<label>'+safe(field[0])+(field[1]?' <small>('+safe(field[1])+')</small>':'')+
    '<select data-bs-spec="'+safe(key)+'">'+option(field[2],custom?"Khác":val,"Chưa chọn")+'</select>'+
    '<input class="bs127SpecOther" data-bs-other="'+safe(key)+'" maxlength="80" placeholder="Nhập thông số khác"'+(custom?' value="'+safe(val)+'"':' hidden')+'></label>';
 }).join("");
 $("bs127Specs").querySelectorAll("select").forEach(s=>s.onchange=()=>{
  const other=$("bs127Specs").querySelector('[data-bs-other="'+s.dataset.bsSpec+'"]');
  other.hidden=s.value!=="Khác";
  if(!other.hidden)other.focus();
 });
}
function openEditor(row=null){
 if(!active()||!writable()){msg("Tài khoản hiện tại chỉ được xem thông tin.",true);return}
 state.editing=row;
 const form=$("bs127Form");form.reset();
 $("bs127DialogTitle").textContent=row?"Chỉnh sửa thiết bị":"Thêm thiết bị";
 $("bs127Group").innerHTML=option(groups(),row?.system_group||"","Chọn hệ thống");
 $("bs127Group").value=row?.system_group||"";
 fillTypes(row?.equipment_type||"");
 fillBrands(row?.brand||"");
 $("bs127Location").innerHTML=option([...LOCATIONS,"Khác"],LOCATIONS.includes(row?.location)?row?.location:row?.location?"Khác":"","Chọn vị trí");
 $("bs127LocationCustom").value=LOCATIONS.includes(row?.location)?"":row?.location||"";
 $("bs127LocationCustom").hidden=!row?.location||LOCATIONS.includes(row?.location);
 $("bs127Quantity").innerHTML=option(Array.from({length:100},(_,i)=>String(i+1)),String(row?.quantity||1),"Chọn");
 fillSpecs(row?.specs||{});
 for(const k of ["name","code","model","status","note","install_year"]){
  const input=form.elements.namedItem(k);if(input)input.value=String(row?.[k]|| (k==="status"?"Đang sử dụng":""));
 }
 $("bs127Overlay").hidden=false;
 document.body.classList.add("bs127Editing");
 const hint=$("bs127DockHint");if(hint)hint.hidden=true;
 if(window.matchMedia?.("(max-width:760px)")?.matches)$("bs127Overlay").scrollIntoView({behavior:"smooth",block:"start"});

 $("bs127Group").focus();
}
function openTemplate(group,type){
 if(!CATALOG[group]?.includes(type)||!writable())return;
 openEditor();
 $("bs127Group").value=group;
 fillTypes(type);
 $("bs127Type").value=type;
 fillBrands();
 fillSpecs();
 $("bs127DialogTitle").textContent="Điền thông số · "+type;
 $("bs127Form").elements.namedItem("name").value=type;
 $("bs127Form").elements.namedItem("name").placeholder="VD: "+type+" số 1";
}
function closeEditor(){if(state.busy)return;$("bs127Overlay").hidden=true;document.body.classList.remove("bs127Editing");const hint=$("bs127DockHint");if(hint)hint.hidden=false;state.editing=null;}
function takeForm(){
 const form=$("bs127Form"),f=new FormData(form);
 const group=String(f.get("system_group")||""),type=String(f.get("equipment_type")||"");
 if(!CATALOG[group]||!CATALOG[group].includes(type))throw Error("Hãy chọn hệ thống và loại thiết bị hợp lệ.");
 if(!String(f.get("name")||"").trim())throw Error("Hãy nhập tên hoặc mã nhận diện thiết bị.");
 const specs={};
 $("bs127Specs").querySelectorAll("select[data-bs-spec]").forEach(el=>{
  let value=el.value;if(value==="Khác")value=String($("bs127Specs").querySelector('[data-bs-other="'+el.dataset.bsSpec+'"]')?.value||"").trim();
  if(value)specs[el.dataset.bsSpec]=value.slice(0,80);
 });
 const brand=String(f.get("brand")||"")==="Khác"?String(f.get("brand_custom")||"").trim():String(f.get("brand")||"");
 const location=String(f.get("location")||"")==="Khác"?String(f.get("location_custom")||"").trim():String(f.get("location")||"");
 return {building_id:PROJECT,system_group:group,equipment_type:type,name:String(f.get("name")||"").trim().slice(0,160),
 code:String(f.get("code")||"").trim().slice(0,80),brand:brand.slice(0,100),model:String(f.get("model")||"").trim().slice(0,120),
 location:location.slice(0,120),quantity:Number(f.get("quantity"))||1,status:String(f.get("status")||"Đang sử dụng"),
 install_year:f.get("install_year")?Number(f.get("install_year")):null,note:String(f.get("note")||"").trim().slice(0,1000),specs};
}
async function saveRow(e){
 e.preventDefault();if(state.busy||!active()||!writable())return;
 const btn=$("bs127Save");
 let payload;try{payload=takeForm()}catch(err){msg(err.message,true);return}
 state.busy=true;btn.disabled=true;btn.textContent="Đang lưu...";
 try{
  if(!centralSession?.access_token)throw Error("Cần đăng nhập lại để lưu dữ liệu.");
  if(state.editing){
   const id=encodeURIComponent(state.editing.id);
   await sbFetch("/rest/v1/building_equipment_profiles_127?id=eq."+id+"&building_id=eq."+PROJECT,{method:"PATCH",token:centralSession.access_token,body:payload});
  }else await sbFetch("/rest/v1/building_equipment_profiles_127",{method:"POST",token:centralSession.access_token,body:payload});
  state.busy=false;closeEditor();state.openGroups.add(payload.system_group);msg("✓ Đã lưu thông tin thiết bị.");await loadRows();
 }catch(err){msg("Lưu thất bại: "+(err?.message||"Vui lòng thử lại."),true)}
 finally{state.busy=false;btn.disabled=false;btn.textContent="✓ Lưu thiết bị";}
}
async function deleteRow(row){
 if(!active()||!writable()||state.busy)return;
 if(!confirm('Xóa hồ sơ "'+(row.name||row.equipment_type)+'"? Thao tác này không xóa lịch bảo trì.'))return;
 state.busy=true;
 try{
  await sbFetch("/rest/v1/building_equipment_profiles_127?id=eq."+encodeURIComponent(row.id)+"&building_id=eq."+PROJECT,{method:"DELETE",token:centralSession.access_token});
  msg("Đã xóa hồ sơ thiết bị.");await loadRows();
 }catch(err){msg("Không xóa được: "+err.message,true)}
 finally{state.busy=false}
}
function renderList(){
 const list=$("bs127List");if(!list)return;
 const all=state.rows;
 $("bs127Count").textContent=String(all.length);
 $("bs127Groups").textContent=String(new Set(all.map(r=>r.system_group)).size);
 $("bs127Units").textContent=String(all.reduce((sum,r)=>sum+(Number(r.quantity)||0),0));

 if(state.loading){list.innerHTML='<div class="bs127Empty">Đang tải hồ sơ đã lưu...</div>';return}
 const search=state.filterText, status=state.filterStatus;
 const matches=row=>[row.name,row.equipment_type,row.system_group,row.code,row.brand,row.model,row.location].join(" ").toLocaleLowerCase("vi").includes(search);
 const groupHtml=[];
 for(const group of groups()){
  if(state.filterGroup&&state.filterGroup!==group)continue;
  const sections=[];
  const groupRows=all.filter(row=>row.system_group===group);
  for(const type of CATALOG[group]){
   const saved=groupRows.filter(row=>row.equipment_type===type);
   const typeMatch=(group+" "+type).toLocaleLowerCase("vi").includes(search);
   const matchedRows=search&&!typeMatch?saved.filter(matches):saved;
   if(search&&!typeMatch&&!matchedRows.length)continue;
   if(status==="Chưa khai báo"&&saved.length)continue;
   if(status&&status!=="Chưa khai báo"&&!matchedRows.some(row=>row.status===status))continue;
   const visibleRows=status&&status!=="Chưa khai báo"?matchedRows.filter(row=>row.status===status):matchedRows;
   const saveCount=saved.length;
   const actions=writable()?'<button type="button" class="bs127Fill" data-bs-group="'+safe(group)+'" data-bs-template="'+safe(type)+'">'+(saveCount?"＋ Thêm cùng loại":"✎ Điền thông số")+'</button>':"";
   const profiles=visibleRows.map(row=>{
    const entries=Object.entries(row.specs||{}).filter(([key])=>FIELDS[key]).slice(0,6);
    const statusCls=row.status==="Ngừng sử dụng"?"stopped":row.status==="Dự phòng"?"standby":"working";
    return '<article class="bs127Profile"><div class="bs127ProfileHead"><div><h4>'+safe(row.name||row.equipment_type)+'</h4><small>'+safe([row.code,row.brand,row.model].filter(Boolean).join(" · ")||"Chưa nhập mã / hãng / model")+'</small></div><span class="bs127Status '+statusCls+'">'+safe(row.status||"Đang sử dụng")+'</span></div>'+
    '<div class="bs127ProfileSpecs"><span><b>Vị trí:</b> '+safe(row.location||"—")+'</span><span><b>Số lượng:</b> '+safe(row.quantity||1)+'</span>'+
    entries.map(([key,v])=>'<span><b>'+safe(FIELDS[key][0])+':</b> '+safe(v)+' '+safe(FIELDS[key][1])+'</span>').join("")+'</div>'+
    (writable()?'<div class="bs127ProfileActions"><button type="button" data-bs-edit="'+safe(row.id)+'">Sửa</button><button type="button" class="bs127Danger" data-bs-delete="'+safe(row.id)+'">Xóa</button></div>':'')+'</article>';
   }).join("");
   const badge=saveCount?'<span class="bs127TemplateStatus saved">Đã khai báo · '+saveCount+'</span>':'<span class="bs127TemplateStatus missing">Chưa khai báo</span>';
   sections.push('<div class="bs127Template"><div class="bs127TemplateLine"><div class="bs127TemplateTitle"><strong>'+safe(type)+'</strong>'+badge+'</div>'+actions+'</div>'+profiles+'</div>');
  }
  if(!sections.length)continue;
  const expanded=Boolean(search||status||state.filterGroup||state.openGroups.has(group));
  const declaredTypes=CATALOG[group].filter(type=>groupRows.some(r=>r.equipment_type===type)).length;
  groupHtml.push('<section class="bs127SystemBlock"><button type="button" class="bs127SystemHead" data-bs-toggle="'+safe(group)+'" aria-expanded="'+expanded+'"><span><strong>'+safe(group)+'</strong><small>'+declaredTypes+'/'+CATALOG[group].length+' loại đã khai báo</small></span><span class="bs127Caret">'+(expanded?"−":"＋")+'</span></button>'+
   (expanded?'<div class="bs127SystemItems">'+sections.join("")+'</div>':'')+'</section>');
 }
 if(!groupHtml.length){list.innerHTML='<div class="bs127Empty"><b>Không có mục phù hợp</b><p>Thử thay đổi từ khóa hoặc bộ lọc.</p></div>';return}
 list.innerHTML=groupHtml.join("");
 const nav=$("bs127QuickGroups");
 if(nav){
   const icons={"Điện":"⚡","Điều hòa & thông gió":"❄","PCCC":"◈","Cấp & thoát nước":"◉","Xử lý nước thải":"≋","Thang máy":"↕","Camera & an ninh":"▣","BMS & viễn thông":"⌘","Hạng mục khác":"▤"};
   nav.innerHTML=groups().map(g=>'<button type="button" class="bs127QuickGroup '+(state.filterGroup===g?"active":"")+'" data-bs127-group="'+safe(g)+'"><span>'+safe(icons[g])+'</span><b>'+safe(g)+'</b><small>'+state.rows.filter(r=>r.system_group===g).length+' hồ sơ</small></button>').join("");
 }

}
async function loadRows(){
 if(!active()||!$("buildingSystems127"))return;
 const request=++state.request;state.loading=true;renderList();
 try{
  if(!centralSession?.access_token)throw Error("Cần đăng nhập để tải hồ sơ thiết bị.");
  const rows=await sbFetch("/rest/v1/building_equipment_profiles_127?building_id=eq."+PROJECT+"&select=*&order=created_at.desc",{token:centralSession.access_token});
  if(request!==state.request||!active())return;
  state.rows=Array.isArray(rows)?rows:[];$("bs127Notice").textContent="";
 }catch(err){if(request===state.request&&active())msg("Không tải được hồ sơ: "+err.message,true)}
 finally{if(request===state.request){state.loading=false;renderList()}}
}
window.renderBuildingSystems127=()=>{if(!active())return;renderShell();loadRows()};
})();