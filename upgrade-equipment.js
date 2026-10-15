/* ESTA | NANGCAP - unified building equipment register.
 * Isolated from the four operating projects and their maintenance schedules.
 * Data: public.building_equipment_profiles, building_id = NANGCAP.
 */
(()=>{
"use strict";
const BID="NANGCAP",TABLE="building_equipment_profiles";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const groups=[
 ["Điều hòa & Thông gió","HVAC",["Chiller","AHU","FCU","Điều hòa âm trần","Điều hòa treo tường","Quạt hút","Quạt cấp gió","Jetfan","Khác"]],
 ["Điện & Chiếu sáng","ĐIỆN",["Tủ điện","Máy biến áp","Máy phát điện","UPS","ATS","Đèn chiếu sáng","Công tơ","Khác"]],
 ["Phòng cháy chữa cháy","PCCC",["Bơm chữa cháy","Tủ trung tâm báo cháy","Đầu báo","Đầu phun","Họng nước","Bình chữa cháy","Quạt hút khói","Khác"]],
 ["Cấp thoát nước","NƯỚC",["Bơm nước","Bồn nước","Van","Đồng hồ nước","Bơm thoát nước","Xử lý nước thải","Khác"]],
 ["Thang máy","THANG MÁY",["Thang hành khách","Thang hàng","Tủ điều khiển","Khác"]],
 ["Camera & An ninh","AN NINH",["Camera","Đầu ghi","Kiểm soát cửa","Barrier","Khác"]],
 ["Hệ thống khác","KHÁC",["Thiết bị khác"]]
];
const statuses=["Đang sử dụng","Cần theo dõi","Đang sửa chữa","Ngừng sử dụng"];
let items=[],fetchedAt=0,loading=null,error="",search="",group="",status="",dialog=null,editId=null;
const active=()=>String(typeof currentBuilding!=="undefined"?currentBuilding?.id:"")===BID;
const allowed=()=>active()&&!!centralSession?.access_token&&["admin","editor"].includes(String(currentBuilding?.role||"").toLowerCase());
const opt=(a,v)=>a.map(x=>'<option value="'+esc(x)+'"'+(x===v?' selected':'')+'>'+esc(x)+'</option>').join("");
const gopts=()=>groups.map(g=>g[0]);
const safeQty=n=>Number.isFinite(+n)?Math.max(1,Math.floor(Number(n))):1;
const eqCount=()=>items.reduce((n,x)=>n+safeQty(x.quantity),0);
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
  }catch(e){if(active())error=e?.message||"Không tải được danh mục thiết bị.";}
  finally{loading=null;if(isPresent())render($("updateAssetsPage"),true);}
 })();
 return loading;
}
function currentRows(){
 const q=search.trim().toLocaleLowerCase("vi-VN");
 return items.filter(x=>(!group||x.system_group===group)&&(!status||x.status===status)&&(!q||[x.name,x.code,x.system_group,x.equipment_type,x.brand,x.model,x.location].join(" ").toLocaleLowerCase("vi-VN").includes(q)));
}
function list(){
 const host=$("ueRows"),counter=$("ueResultCount");
 if(!host)return;
 const rows=currentRows();
 if(counter)counter.textContent=rows.length+" / "+items.length+" hồ sơ";
 if(!rows.length){
  host.innerHTML='<div class="ueEmpty"><b>'+(items.length?'Không có thiết bị phù hợp bộ lọc.':'Chưa có hồ sơ thiết bị cho Bản nâng cấp.')+'</b><p>'+(items.length?'Thử xóa từ khóa hoặc thay bộ lọc.':'Dữ liệu công việc được lấy từ 62 Trần Huy Liệu, còn hồ sơ thiết bị mới chưa được nhập. Bấm “Thêm thiết bị” để chọn danh mục có sẵn và điền thông tin.')+'</p></div>';
  return;
 }
 host.innerHTML=rows.map(x=>{
  const warn=x.status==="Cần theo dõi"||x.status==="Đang sửa chữa";
  const stopped=x.status==="Ngừng sử dụng";
  const spec=x.specs||{},code=x.code||"—";
  return '<button type="button" class="ueItem" data-ue-id="'+esc(x.id)+'">'+
   '<div class="ueItemId"><span class="ueItemGlyph" aria-hidden="true">⚙</span><span><strong>'+esc(label(x))+'</strong><small>'+esc(code)+' · '+esc(x.equipment_type||x.system_group)+'</small></span></div>'+
   '<span class="ueItemGroup">'+esc(x.system_group||"Chưa phân nhóm")+'</span>'+
   '<span class="ueItemModel">'+esc([x.brand,x.model].filter(Boolean).join(" / ")||"—")+'</span>'+
   '<span class="ueItemPlace">'+esc(x.location||"—")+'</span>'+
   '<span class="ueItemQty">'+safeQty(x.quantity)+'</span>'+
   '<span class="ueState '+(stopped?'ueStopped':warn?'ueWarn':'ueGood')+'">'+esc(x.status||"Đang sử dụng")+'</span>'+
   '<span class="ueArrow">›</span></button>';
 }).join("");
 host.querySelectorAll("[data-ue-id]").forEach(btn=>btn.onclick=()=>openForm(btn.dataset.ueId));
}
function render(page,skipLoad=false){
 if(!active()||!page)return;
 const operational=items.filter(x=>x.status==="Đang sử dụng").length;
 const watch=items.filter(x=>["Cần theo dõi","Đang sửa chữa"].includes(x.status)).length;
 page.classList.add("uePage");
 page.innerHTML=
  '<section class="ueHero"><div><span class="ueEyebrow">ESTA · BUILDING SYSTEM PROFILE</span><h1>Thông tin hệ thống tòa nhà</h1><p>Hồ sơ thiết bị dễ tìm, dễ nhập và sử dụng riêng trong Bản nâng cấp.</p></div><div class="ueHeroButtons"><button type="button" class="ueBtnSecondary" id="ueRefresh">↻ Cập nhật</button><button type="button" class="ueBtnPrimary" id="ueAdd"'+(!allowed()?' disabled':'')+'>＋ Thêm thiết bị</button></div></section>'+
  '<section class="ueStats"><div><small>Hồ sơ thiết bị</small><b>'+items.length+'</b></div><div><small>Tổng số lượng</small><b>'+eqCount()+'</b></div><div><small>Đang sử dụng</small><b>'+operational+'</b></div><div><small>Cần xử lý</small><b>'+watch+'</b></div></section>'+
  '<section class="uePanel"><header class="uePanelHead"><div><h2>Danh mục thiết bị</h2><p>Chọn nhóm hệ thống, tên thiết bị, hãng và điền thông số phù hợp.</p></div><strong id="ueResultCount"></strong></header>'+
  '<div class="ueFilters"><label class="ueSearch"><span>⌕</span><input id="ueSearch" type="search" placeholder="Tìm tên, mã, hãng, vị trí..." value="'+esc(search)+'" autocomplete="off"></label><select id="ueGroup" aria-label="Nhóm hệ thống"><option value="">Tất cả hệ thống</option>'+opt(gopts(),group)+'</select><select id="ueStatus" aria-label="Tình trạng"><option value="">Mọi tình trạng</option>'+opt(statuses,status)+'</select></div>'+
  (error?'<p class="ueError" role="alert">'+esc(error)+'</p>':'')+
  '<div class="ueListHead"><span>Thiết bị</span><span>Hệ thống</span><span>Hãng / Model</span><span>Vị trí</span><span>SL</span><span>Tình trạng</span><span></span></div><div id="ueRows" class="ueRows"></div></section>'+
  '<p class="ueSourceNote">Nguồn dữ liệu: dự án NANGCAP, lưu độc lập. Không tự sao chép hồ sơ thiết bị của tòa nhà khác.</p>';
 $("ueRefresh").onclick=()=>{fetchedAt=0;load(true);};
 $("ueAdd").onclick=()=>openForm();
 $("ueSearch").oninput=e=>{search=e.target.value;list()};
 $("ueGroup").onchange=e=>{group=e.target.value;list()};
 $("ueStatus").onchange=e=>{status=e.target.value;list()};
 list();
 if(!skipLoad&&!fetchedAt)load();
}
function ensureDialog(){
 if(dialog?.isConnected)return dialog;
 dialog=document.createElement("div");
 dialog.id="ueOverlay";dialog.className="ueOverlay";dialog.hidden=true;
 dialog.innerHTML='<div class="ueDialog" role="dialog" aria-modal="true" aria-labelledby="ueModalHeading">'+
 '<header><div><small>ESTA · THÔNG TIN THIẾT BỊ</small><h2 id="ueModalHeading">Thêm thiết bị</h2></div><button type="button" id="ueClose" aria-label="Đóng">×</button></header>'+
 '<form id="ueForm"><div class="ueFormBody">'+
 '<label>Nhóm hệ thống *<select name="system_group" id="ueEditGroup" required>'+opt(gopts(),"")+'</select></label>'+
 '<label>Loại thiết bị *<select name="equipment_type" id="ueEditType" required></select></label>'+
 '<label class="ueFull">Tên thiết bị *<input name="name" maxlength="140" placeholder="Ví dụ: Máy lạnh âm trần khu vực sảnh" required></label>'+
 '<label>Mã thiết bị<input name="code" maxlength="80" placeholder="HVAC-001"></label>'+
 '<label>Vị trí lắp đặt<input name="location" maxlength="140" placeholder="Tầng / phòng / khu vực"></label>'+
 '<label>Hãng sản xuất<input name="brand" list="ueBrands" maxlength="120" placeholder="Chọn hoặc nhập hãng"></label>'+
 '<label>Model<input name="model" maxlength="120" placeholder="Mã model"></label>'+
 '<label>Số lượng *<input name="quantity" type="number" min="1" step="1" required value="1"></label>'+
 '<label>Tình trạng<select name="status">'+opt(statuses,"Đang sử dụng")+'</select></label>'+
 '<label>Năm lắp đặt<input name="install_year" type="number" min="1950" max="2100" placeholder="Năm"></label>'+
 '<label>Công suất / thông số<input name="capacity" maxlength="120" placeholder="VD: 2.5 HP, 220 V"></label>'+
 '<label>Số serial<input name="serial" maxlength="140"></label>'+
 '<label class="ueFull">Ghi chú<textarea name="note" rows="2" maxlength="2500" placeholder="Thông tin bổ sung, tình trạng hoặc bảo hành..."></textarea></label>'+
 '<datalist id="ueBrands"><option value="Daikin"><option value="Mitsubishi"><option value="Panasonic"><option value="KONE"><option value="Schneider"><option value="LS"><option value="Grundfos"><option value="Nagakawa"><option value="Kruger"><option value="Siemens"></datalist></div>'+
 '<footer><button type="button" class="ueBtnSecondary" id="ueCancel">Hủy</button><button type="button" class="ueDelete" id="ueDelete" hidden>Xóa thiết bị</button><button type="submit" class="ueBtnPrimary" id="ueSubmit">Lưu thiết bị</button></footer></form></div>';
 document.body.append(dialog);
 $("ueClose").onclick=closeForm;$("ueCancel").onclick=closeForm;
 dialog.onclick=e=>{if(e.target===dialog)closeForm()};
 $("ueEditGroup").onchange=()=>fillTypes();
 $("ueForm").onsubmit=save;
 $("ueDelete").onclick=remove;
 return dialog;
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
 if(id&&!existing)return;
 editId=existing?.id||null;
 const d=ensureDialog(),form=$("ueForm");
 form.reset();
 $("ueModalHeading").textContent=existing?"Chi tiết thiết bị":"Thêm thiết bị";
 const values=existing||{system_group:gopts()[0],equipment_type:groups[0][2][0],quantity:1,status:statuses[0]};
 for(const [key,value] of Object.entries(values)){
  const input=form.elements.namedItem(key);
  if(input&&typeof value!=="object")input.value=value??"";
 }
 $("ueEditGroup").value=values.system_group||gopts()[0];
 fillTypes(values.equipment_type);
 const specs=values.specs||{};
 form.elements.namedItem("capacity").value=specs.capacity||"";
 form.elements.namedItem("serial").value=specs.serial||"";
 const mayEdit=allowed();
 form.querySelectorAll("input,select,textarea").forEach(el=>el.disabled=!mayEdit);
 $("ueDelete").hidden=!mayEdit||!existing;
 $("ueSubmit").hidden=!mayEdit;
 d.hidden=false;
}
function closeForm(){if(dialog)dialog.hidden=true;editId=null}
async function save(e){
 e.preventDefault();if(!allowed())return;
 const form=e.currentTarget,button=$("ueSubmit");if(button.disabled)return;
 const field=n=>String(form.elements.namedItem(n)?.value||"").trim();
 const year=Number(field("install_year"));
 const payload={building_id:BID,system_group:field("system_group"),equipment_type:field("equipment_type"),name:field("name"),code:field("code"),location:field("location"),brand:field("brand"),model:field("model"),quantity:safeQty(field("quantity")),status:field("status"),install_year:year||null,note:field("note"),specs:{capacity:field("capacity"),serial:field("serial")}};
 if(!payload.name||!payload.equipment_type||!payload.system_group)return;
 button.disabled=true;button.textContent="Đang lưu...";
 try{
  const path=editId?"/rest/v1/"+TABLE+"?id=eq."+encodeURIComponent(editId)+"&building_id=eq."+BID:"/rest/v1/"+TABLE;
  await sbFetch(path,{method:editId?"PATCH":"POST",token:centralSession.access_token,body:payload});
  closeForm();fetchedAt=0;await load(true);
  if(typeof toast==="function")toast("Đã lưu hồ sơ thiết bị.");
 }catch(err){if(typeof toast==="function")toast(err.message||"Không lưu được hồ sơ.");else alert(err.message||"Không lưu được hồ sơ.");}
 finally{button.disabled=false;button.textContent="Lưu thiết bị";}
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
