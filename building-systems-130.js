(function(){
"use strict";
// ESTA · Thông tin hệ thống tòa nhà · chỉ mở thử tại 130 Hồng Hà.
const PROJECT="130HH";
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
const state={rows:[],loading:false,busy:false,filterGroup:"",filterText:"",filterStatus:"",editing:null,request:0};
const active=()=>typeof currentBuilding!=="undefined"&&currentBuilding?.id===PROJECT&&typeof projectOverviewActive!=="undefined"&&projectOverviewActive;
const writable=()=>typeof canProjectEdit==="function"&&canProjectEdit();
const option=(values,selected="",placeholder="Chọn")=>'<option value="">'+safe(placeholder)+'</option>'+values.map(v=>'<option value="'+safe(v)+'"'+(String(v)===String(selected)?" selected":"")+'>'+safe(v)+'</option>').join("");
const groups=()=>Object.keys(CATALOG);
const msg=(m,isError=false)=>{const el=$("bs130Notice");if(el){el.textContent=m;el.className="bs130Notice "+(isError?"error":"ok");}if(!isError&&typeof toast==="function")toast(m)};
function renderShell(){
 const root=$("buildingSystems130");
 if(!root||root.dataset.mounted)return;
 root.dataset.mounted="1";
 root.innerHTML='<div class="bs130Intro"><div><div class="bs130Eyebrow">ESTA · 130 HỒNG HÀ · THỬ NGHIỆM</div><h2>Hồ sơ thiết bị tòa nhà</h2><p>Chọn hệ thống và loại thiết bị, điền các thông số cần thiết một lần để tra cứu lâu dài. Không liên kết lịch bảo trì.</p></div><button id="bs130Add" type="button" class="bs130Primary">＋ Thêm thiết bị</button></div>'+
 '<div class="bs130Metrics"><div><strong id="bs130Count">0</strong><span>Hồ sơ thiết bị</span></div><div><strong id="bs130Groups">0</strong><span>Hệ thống đã khai báo</span></div><div><strong id="bs130Units">0</strong><span>Tổng số thiết bị</span></div></div>'+
 '<div class="bs130Toolbar"><label class="bs130Search"><span>⌕</span><input id="bs130Search" type="search" placeholder="Tìm tên, hãng, mã, vị trí..." aria-label="Tìm thiết bị"></label><select id="bs130FilterGroup" aria-label="Lọc hệ thống">'+option(groups(),"","Tất cả hệ thống")+'</select><select id="bs130FilterStatus" aria-label="Lọc tình trạng">'+option(["Đang sử dụng","Dự phòng","Ngừng sử dụng"],"","Tất cả tình trạng")+'</select><button type="button" id="bs130Reload" class="bs130Light">↻ Làm mới</button></div>'+
 '<div id="bs130Notice" class="bs130Notice" role="status" aria-live="polite"></div><div id="bs130List" class="bs130List"></div>'+
 '<div id="bs130Overlay" class="bs130Overlay" hidden><div class="bs130Shade" data-bs-close></div><section class="bs130Dialog" role="dialog" aria-modal="true" aria-labelledby="bs130DialogTitle"><div class="bs130DialogHead"><div><small>THÔNG SỐ & HỒ SƠ</small><h3 id="bs130DialogTitle">Thêm thiết bị</h3></div><button type="button" id="bs130Close" class="bs130Close" aria-label="Đóng">×</button></div><form id="bs130Form"><div class="bs130FormBody">'+
 '<div class="bs130FormGrid"><label>Hệ thống <b>*</b><select name="system_group" id="bs130Group" required></select></label><label>Loại thiết bị <b>*</b><select name="equipment_type" id="bs130Type" required></select></label></div>'+
 '<div class="bs130FormGrid"><label>Tên / ký hiệu thiết bị<input name="name" maxlength="160" placeholder="VD: Máy bơm cấp nước số 1"></label><label>Mã thiết bị<input name="code" maxlength="80" placeholder="VD: PUMP-01"></label></div>'+
 '<div class="bs130FormGrid"><label>Hãng sản xuất<select name="brand" id="bs130Brand"></select><input name="brand_custom" id="bs130BrandCustom" maxlength="100" placeholder="Nhập hãng khác" hidden></label><label>Model / Serial (nếu có)<input name="model" maxlength="120" placeholder="Nhập theo tem máy"></label></div>'+
 '<div class="bs130FormGrid"><label>Vị trí<select name="location" id="bs130Location"></select><input name="location_custom" id="bs130LocationCustom" maxlength="120" placeholder="Nhập vị trí khác" hidden></label><label>Số lượng<select name="quantity" id="bs130Quantity"></select></label></div>'+
 '<div class="bs130FormSection"><span>Thông số theo loại thiết bị</span><small>Chọn theo nhãn máy, không bắt buộc điền đủ</small></div><div class="bs130FormGrid" id="bs130Specs"></div>'+
 '<div class="bs130FormGrid"><label>Tình trạng<select name="status">'+option(["Đang sử dụng","Dự phòng","Ngừng sử dụng"],"Đang sử dụng")+'</select></label><label>Năm lắp đặt<select name="install_year">'+option(FIELDS.year[2],"","Chưa chọn")+'</select></label></div>'+
 '<label class="bs130Full">Ghi chú (không bắt buộc)<textarea name="note" maxlength="1000" rows="2" placeholder="Thông tin khác theo thực tế..."></textarea></label></div><div class="bs130DialogFoot"><button type="button" id="bs130Cancel" class="bs130Light">Hủy</button><button id="bs130Save" type="submit" class="bs130Primary">✓ Lưu thiết bị</button></div></form></section></div>';
 $("bs130Add").onclick=()=>openEditor();
 $("bs130Reload").onclick=()=>loadRows();
 $("bs130Search").oninput=e=>{state.filterText=e.target.value.trim().toLocaleLowerCase("vi");renderList()};
 $("bs130FilterGroup").onchange=e=>{state.filterGroup=e.target.value;renderList()};
 $("bs130FilterStatus").onchange=e=>{state.filterStatus=e.target.value;renderList()};
 $("bs130Group").onchange=()=>{fillTypes();fillBrands();fillSpecs()};
 $("bs130Type").onchange=fillSpecs;
 $("bs130Brand").onchange=()=>toggleCustom("Brand");
 $("bs130Location").onchange=()=>toggleCustom("Location");
 $("bs130Cancel").onclick=closeEditor;
 $("bs130Close").onclick=closeEditor;
 $("bs130Overlay").querySelector("[data-bs-close]").onclick=closeEditor;
 $("bs130Form").onsubmit=saveRow;
 $("bs130List").addEventListener("click",e=>{
  const btn=e.target.closest("button[data-bs-edit],button[data-bs-delete]");if(!btn||!writable())return;
  const row=state.rows.find(x=>x.id===btn.dataset.bsEdit||x.id===btn.dataset.bsDelete);
  if(!row)return;
  if(btn.hasAttribute("data-bs-edit"))openEditor(row);else deleteRow(row);
 });
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("bs130Overlay")&&!$("bs130Overlay").hidden)closeEditor()});
}
function toggleCustom(which){
 const sel=$("bs130"+which),inp=$("bs130"+which+"Custom");
 if(!sel||!inp)return;
 inp.hidden=sel.value!=="Khác";
 if(!inp.hidden)inp.focus();
}
function fillTypes(selected=""){
 const group=$("bs130Group").value;
 $("bs130Type").innerHTML=option(CATALOG[group]||[],selected,"Chọn loại thiết bị");
}
function fillBrands(selected=""){
 const group=$("bs130Group").value;
 const known=BRANDS[group]||[];
 const custom=selected&&!known.includes(selected)&&selected!=="Khác";
 $("bs130Brand").innerHTML=option([...known,"Khác"],custom?"Khác":selected,"Chọn hãng");
 $("bs130BrandCustom").value=custom?selected:"";
 $("bs130BrandCustom").hidden=!custom;
}
function fillSpecs(existing={}){
 const group=$("bs130Group").value,type=$("bs130Type").value;
 $("bs130Specs").innerHTML=fieldsFor(group,type).map(key=>{
  const field=FIELDS[key],val=String(existing?.[key]||"");
  const custom=val&&!field[2].includes(val);
  return '<label>'+safe(field[0])+(field[1]?' <small>('+safe(field[1])+')</small>':'')+
    '<select data-bs-spec="'+safe(key)+'">'+option(field[2],custom?"Khác":val,"Chưa chọn")+'</select>'+
    '<input class="bs130SpecOther" data-bs-other="'+safe(key)+'" maxlength="80" placeholder="Nhập thông số khác"'+(custom?' value="'+safe(val)+'"':' hidden')+'></label>';
 }).join("");
 $("bs130Specs").querySelectorAll("select").forEach(s=>s.onchange=()=>{
  const other=$("bs130Specs").querySelector('[data-bs-other="'+s.dataset.bsSpec+'"]');
  other.hidden=s.value!=="Khác";
  if(!other.hidden)other.focus();
 });
}
function openEditor(row=null){
 if(!active()||!writable()){msg("Tài khoản hiện tại chỉ được xem thông tin.",true);return}
 state.editing=row;
 const form=$("bs130Form");form.reset();
 $("bs130DialogTitle").textContent=row?"Chỉnh sửa thiết bị":"Thêm thiết bị";
 $("bs130Group").innerHTML=option(groups(),row?.system_group||"","Chọn hệ thống");
 $("bs130Group").value=row?.system_group||"";
 fillTypes(row?.equipment_type||"");
 fillBrands(row?.brand||"");
 $("bs130Location").innerHTML=option([...LOCATIONS,"Khác"],LOCATIONS.includes(row?.location)?row?.location:row?.location?"Khác":"","Chọn vị trí");
 $("bs130LocationCustom").value=LOCATIONS.includes(row?.location)?"":row?.location||"";
 $("bs130LocationCustom").hidden=!row?.location||LOCATIONS.includes(row?.location);
 $("bs130Quantity").innerHTML=option(Array.from({length:100},(_,i)=>String(i+1)),String(row?.quantity||1),"Chọn");
 fillSpecs(row?.specs||{});
 for(const k of ["name","code","model","status","note","install_year"]){
  const input=form.elements.namedItem(k);if(input)input.value=String(row?.[k]|| (k==="status"?"Đang sử dụng":""));
 }
 $("bs130Overlay").hidden=false;
 document.body.classList.add("bs130ModalOpen");
 $("bs130Group").focus();
}
function closeEditor(){if(state.busy)return;$("bs130Overlay").hidden=true;document.body.classList.remove("bs130ModalOpen");state.editing=null;}
function takeForm(){
 const form=$("bs130Form"),f=new FormData(form);
 const group=String(f.get("system_group")||""),type=String(f.get("equipment_type")||"");
 if(!CATALOG[group]||!CATALOG[group].includes(type))throw Error("Hãy chọn hệ thống và loại thiết bị hợp lệ.");
 const specs={};
 $("bs130Specs").querySelectorAll("select[data-bs-spec]").forEach(el=>{
  let value=el.value;if(value==="Khác")value=String($("bs130Specs").querySelector('[data-bs-other="'+el.dataset.bsSpec+'"]')?.value||"").trim();
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
 const btn=$("bs130Save");
 let payload;try{payload=takeForm()}catch(err){msg(err.message,true);return}
 state.busy=true;btn.disabled=true;btn.textContent="Đang lưu...";
 try{
  if(!centralSession?.access_token)throw Error("Cần đăng nhập lại để lưu dữ liệu.");
  if(state.editing){
   const id=encodeURIComponent(state.editing.id);
   await sbFetch("/rest/v1/building_equipment_profiles?id=eq."+id+"&building_id=eq."+PROJECT,{method:"PATCH",token:centralSession.access_token,body:payload});
  }else await sbFetch("/rest/v1/building_equipment_profiles",{method:"POST",token:centralSession.access_token,body:payload});
  state.busy=false;closeEditor();msg("✓ Đã lưu thông tin thiết bị.");await loadRows();
 }catch(err){msg("Lưu thất bại: "+(err?.message||"Vui lòng thử lại."),true)}
 finally{state.busy=false;btn.disabled=false;btn.textContent="✓ Lưu thiết bị";}
}
async function deleteRow(row){
 if(!active()||!writable()||state.busy)return;
 if(!confirm('Xóa hồ sơ "'+(row.name||row.equipment_type)+'"? Thao tác này không xóa lịch bảo trì.'))return;
 state.busy=true;
 try{
  await sbFetch("/rest/v1/building_equipment_profiles?id=eq."+encodeURIComponent(row.id)+"&building_id=eq."+PROJECT,{method:"DELETE",token:centralSession.access_token});
  msg("Đã xóa hồ sơ thiết bị.");await loadRows();
 }catch(err){msg("Không xóa được: "+err.message,true)}
 finally{state.busy=false}
}
function renderList(){
 if(!$("bs130List"))return;
 const rows=state.rows.filter(x=>(!state.filterGroup||x.system_group===state.filterGroup)&&
 (!state.filterStatus||x.status===state.filterStatus)&&
 (!state.filterText||[x.name,x.equipment_type,x.system_group,x.code,x.brand,x.model,x.location].join(" ").toLocaleLowerCase("vi").includes(state.filterText)));
 $("bs130Count").textContent=String(state.rows.length);
 $("bs130Groups").textContent=String(new Set(state.rows.map(r=>r.system_group)).size);
 $("bs130Units").textContent=String(state.rows.reduce((sum,r)=>sum+(Number(r.quantity)||0),0));
 $("bs130Add").hidden=!writable();
 const root=$("bs130List");
 if(state.loading){root.innerHTML='<div class="bs130Empty">Đang tải danh mục thiết bị...</div>';return}
 if(!rows.length){root.innerHTML='<div class="bs130Empty"><b>'+(state.rows.length?"Không tìm thấy thiết bị phù hợp":"Chưa có hồ sơ thiết bị")+'</b><p>'+(state.rows.length?"Thử thay đổi bộ lọc.":"Bấm “Thêm thiết bị” để khai báo thông số đầu tiên của tòa nhà 130 Hồng Hà.")+'</p></div>';return}
 root.innerHTML=rows.map(row=>{
  const entries=Object.entries(row.specs||{}).filter(([key])=>FIELDS[key]).slice(0,5);
  const statusCls=row.status==="Ngừng sử dụng"?"stopped":row.status==="Dự phòng"?"standby":"working";
  return '<article class="bs130Card"><div class="bs130CardTop"><div><small>'+safe(row.system_group)+'</small><h3>'+safe(row.name||row.equipment_type)+'</h3><p>'+safe(row.equipment_type)+(row.code?' · '+safe(row.code):'')+'</p></div><span class="bs130Status '+statusCls+'">'+safe(row.status||"Chưa xác định")+'</span></div>'+
  '<div class="bs130Info"><div><span>Hãng / Model</span><b>'+safe([row.brand,row.model].filter(Boolean).join(" · ")||"Chưa khai báo")+'</b></div><div><span>Vị trí</span><b>'+safe(row.location||"Chưa khai báo")+'</b></div><div><span>Số lượng</span><b>'+safe(row.quantity||1)+' thiết bị</b></div></div>'+
  (entries.length?'<div class="bs130Specs">'+entries.map(([key,v])=>'<span>'+safe(FIELDS[key][0])+': <b>'+safe(v)+' '+safe(FIELDS[key][1])+'</b></span>').join("")+'</div>':'')+
  '<div class="bs130CardFoot"><small>'+ (row.install_year?'Lắp đặt '+safe(row.install_year):"")+'</small>'+(writable()?'<div><button type="button" data-bs-edit="'+safe(row.id)+'">Sửa</button><button type="button" class="bs130Danger" data-bs-delete="'+safe(row.id)+'">Xóa</button></div>':'')+'</div></article>';
 }).join("");
}
async function loadRows(){
 if(!active()||!$("buildingSystems130"))return;
 const request=++state.request;state.loading=true;renderList();
 try{
  if(!centralSession?.access_token)throw Error("Cần đăng nhập để tải hồ sơ thiết bị.");
  const rows=await sbFetch("/rest/v1/building_equipment_profiles?building_id=eq."+PROJECT+"&select=*&order=created_at.desc",{token:centralSession.access_token});
  if(request!==state.request||!active())return;
  state.rows=Array.isArray(rows)?rows:[];$("bs130Notice").textContent="";
 }catch(err){if(request===state.request&&active())msg("Không tải được hồ sơ: "+err.message,true)}
 finally{if(request===state.request){state.loading=false;renderList()}}
}
window.renderBuildingSystems130=()=>{if(!active())return;renderShell();loadRows()};
})();