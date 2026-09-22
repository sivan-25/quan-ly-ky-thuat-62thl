const $=s=>document.querySelector(s),USERS={admin:{p:"admin123",n:"Quản trị viên",r:"Quản trị viên"},kythuat62:{p:"kt62123",n:"Kỹ thuật 62 THL",r:"Kỹ thuật viên"}};let me=null;const K="qlkt62_v1",load=()=>{try{let v=JSON.parse(localStorage.getItem(K)||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}},save=a=>localStorage.setItem(K,JSON.stringify(a)),today=()=>new Date().toLocaleDateString("en-CA"),fmt=d=>new Date(d+"T00:00").toLocaleDateString("vi-VN"),esc=(s="")=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));function toast(s){$("#toast").textContent=s;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),1800)}window.enter=function enter(u){me=u;sessionStorage.setItem("u62",u);$("#login").classList.add("hide");$("#app").classList.remove("hide");$("#headerUser").textContent=USERS[u].n;$("#headerRole").textContent=USERS[u].r;$("#sideUser").innerHTML="<b>"+USERS[u].n+"</b><br>"+USERS[u].r;resetForm(false);render()}$("#loginForm").onsubmit=e=>{e.preventDefault();let u=$("#user").value.trim(),p=$("#pass").value,er=$("#loginError");if(USERS[u]&&USERS[u].p===p){if(er)er.textContent="";window.enter(u)}else{if(er)er.textContent="Tài khoản hoặc mật khẩu chưa đúng.";toast("Tài khoản hoặc mật khẩu chưa đúng")}};$("#logout").onclick=()=>{sessionStorage.removeItem("u62");location.reload()};$("#backupBtn").onclick=()=>{let blob=new Blob([JSON.stringify({version:2,building:"62THL",exportedAt:new Date().toISOString(),tasks:load(),energy:energyLoad()},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="ESTA-62THL-sao-luu-"+today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Đã tạo file sao lưu")};$("#restoreBtn").onclick=()=>$("#restoreFile").click();$("#restoreFile").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let d=JSON.parse(await f.text()),tasks=Array.isArray(d)?d:d.tasks;if(!Array.isArray(tasks))throw new Error("File sao lưu không hợp lệ");if(!confirm("Khôi phục sẽ thay thế dữ liệu hiện tại. Tiếp tục?"))return;save(tasks);if(Array.isArray(d.energy))energySaveAll(d.energy);render();renderEnergy();toast("Đã khôi phục dữ liệu")}catch(err){toast("Không thể đọc file sao lưu")}finally{e.target.value=""}};$("#menu").onclick=()=>document.querySelector("aside").classList.toggle("open");const DRAFT="qlkt62_draft";function saveDraft(){if($("#editId").value)return;localStorage.setItem(DRAFT,JSON.stringify({d:$("#date").value,c:$("#content").value,t:$("#type").value,s:$("#status").value,a:$("#performer").value,n:$("#note").value}))}function restoreDraft(){try{let d=JSON.parse(localStorage.getItem(DRAFT)||"null");if(!d)return;$("#date").value=d.d||today();$("#content").value=d.c||"";$("#type").value=d.t||"Hằng ngày";$("#status").value=d.s||"Đã hoàn thành";$("#performer").value=d.a||"";$("#note").value=d.n||""}catch(e){}}function resetForm(clearDraft=true){$("#editId").value="";$("#date").value=today();$("#content").value="";$("#type").value="Hằng ngày";$("#status").value="Đã hoàn thành";$("#performer").value="";$("#note").value="";$("#images").value="";$("#imageInfo").textContent="";$("#saveBtn").textContent="＋ Thêm";$("#cancelEdit").classList.add("hide");if(clearDraft)localStorage.removeItem(DRAFT)}$("#cancelEdit").onclick=resetForm;["date","content","type","status","performer","note"].forEach(id=>$("#"+id).addEventListener("input",saveDraft));$("#images").onchange=e=>$("#imageInfo").textContent=e.target.files.length?e.target.files.length+" hình đã chọn":"";function compressImage(f){return new Promise((ok,no)=>{if(!f.type.startsWith("image/")){no(new Error("Chỉ hỗ trợ file hình ảnh"));return}if(f.size>12000000){no(new Error("Mỗi ảnh cần nhỏ hơn 12 MB"));return}let u=URL.createObjectURL(f),im=new Image;im.onload=()=>{try{let max=1600,scale=Math.min(1,max/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*scale)),h=Math.max(1,Math.round(im.height*scale)),cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);let data=cv.toDataURL("image/jpeg",.78);URL.revokeObjectURL(u);ok(data)}catch(e){URL.revokeObjectURL(u);no(e)}};im.onerror=()=>{URL.revokeObjectURL(u);no(new Error("Không đọc được hình ảnh này"))};im.src=u})}function filesToData(files){return Promise.all([...files].map(compressImage))}$("#taskForm").onsubmit=async e=>{e.preventDefault();try{let a=load(),id=Number($("#editId").value),old=id?a.find(x=>x.id===id):null,imgs=$("#images").files.length?await filesToData($("#images").files):(old?.imgs||[]);let obj={id:id||Date.now(),d:$("#date").value,c:$("#content").value.trim(),t:$("#type").value,s:$("#status").value,n:$("#note").value.trim(),a:$("#performer").value.trim(),imgs,i:imgs.length};if(id)a=a.map(x=>x.id===id?obj:x);else a.unshift(obj);try{save(a)}catch(err){toast("Bộ nhớ trình duyệt đã đầy. Bước Supabase sẽ xử lý ảnh tốt hơn.");return}resetForm();render();toast(id?"Đã cập nhật công việc":"Đã thêm công việc")}catch(err){toast(err.message)}};function filtered(fx,ex){let q=($("#search").value+" "+$("#globalSearch").value).toLowerCase().trim(),s=$("#filterStatus").value,t=$("#filterType").value,f=fx===undefined?$("#fromDate").value:fx,e=ex===undefined?$("#toDate").value:ex;return load().filter(x=>(!q||(x.c+" "+x.n+" "+x.a).toLowerCase().includes(q))&&(!s||x.s===s)&&(!t||(x.t||"Hằng ngày")===t)&&(!f||x.d>=f)&&(!e||x.d<=e))}function typeBadge(t){t=t||"Hằng ngày";let c=t==="Bảo trì"?"maintenance":t==="Sự cố"?"incident":"daily";return '<span class="typeBadge '+c+'">'+esc(t)+'</span>'}function statusBadge(s){let c=s==="Đã hoàn thành"?"done":s==="Đang thực hiện"?"doing":"waiting";return '<span class="badge '+c+'">'+esc(s)+'</span>'}function thumbs(x){if(!x.imgs?.length)return x.i?"📷 "+x.i:"—";return '<div class="thumbs" onclick="viewImages('+x.id+')">'+x.imgs.slice(0,3).map(v=>'<img src="'+v+'">').join("")+'</div>'}function render(){let all=load(),a=filtered(),td=today();$("#statToday").textContent=all.filter(x=>x.d===td).length;$("#statDoing").textContent=all.filter(x=>x.s==="Đang thực hiện").length;$("#statDone").textContent=all.filter(x=>x.s==="Đã hoàn thành").length;$("#statWait").textContent=all.filter(x=>x.s==="Chờ xử lý").length;$("#count").textContent="("+a.length+")";$("#empty").classList.toggle("hide",a.length>0);$("#tbody").innerHTML=a.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.c)+'</td><td>'+typeBadge(x.t)+'</td><td>'+statusBadge(x.s)+'</td><td>'+fmt(x.d)+'</td><td>'+esc(x.a)+'</td><td>'+thumbs(x)+'</td><td>'+esc(x.n||"—")+'</td><td><div class="rowBtns"><button onclick="editTask('+x.id+')">✎</button><button class="del" onclick="delTask('+x.id+')">×</button></div></td></tr>').join("");$("#mobileCards").innerHTML=a.map(x=>'<div class="mcard"><h4>'+esc(x.c)+'</h4>'+typeBadge(x.t)+' '+statusBadge(x.s)+'<p>▣ '+fmt(x.d)+' · 👤 '+esc(x.a)+'</p><p>'+esc(x.n||"Không có ghi chú")+(x.imgs?.length?" · 📷 "+x.imgs.length+" hình":"")+'</p><div class="foot"><button onclick="editTask('+x.id+')">Sửa ›</button></div></div>').join("")}window.editTask=id=>{let x=load().find(y=>y.id===id);$("#editId").value=x.id;$("#date").value=x.d;$("#content").value=x.c;$("#type").value=x.t||"Hằng ngày";$("#status").value=x.s;$("#performer").value=x.a;$("#note").value=x.n;$("#imageInfo").textContent=x.imgs?.length?"Đang có "+x.imgs.length+" hình":"";$("#saveBtn").textContent="Lưu";$("#cancelEdit").classList.remove("hide");scrollTo({top:0,behavior:"smooth"})};window.delTask=id=>{if(confirm("Xóa công việc này?")){save(load().filter(x=>x.id!==id));render();toast("Đã xóa")}};window.viewImages=id=>{let x=load().find(y=>y.id===id);if(!x?.imgs?.length)return;$("#viewerImages").innerHTML=x.imgs.map(v=>'<img src="'+v+'">').join("");$("#viewer").classList.remove("hide")};$("#closeViewer").onclick=()=>$("#viewer").classList.add("hide");$("#toggleFilter").onclick=e=>{e.stopPropagation();$("#filterBar").classList.toggle("hide")};$("#filterBar").onclick=e=>e.stopPropagation();document.addEventListener("click",e=>{if(!$("#filterBar").classList.contains("hide")&&!e.target.closest(".filterWrap"))$("#filterBar").classList.add("hide")});["search","globalSearch","fromDate","toDate"].forEach(x=>$("#"+x).addEventListener("input",render));["filterStatus","filterType"].forEach(x=>$("#"+x).onchange=render);function iso(d){return d.toLocaleDateString("en-CA")}function rangeDates(kind){let d=new Date(),from="",to="";if(kind==="today"){from=to=iso(d)}else if(kind==="week"){let day=(d.getDay()+6)%7,a=new Date(d);a.setDate(d.getDate()-day);let b=new Date(a);b.setDate(a.getDate()+6);from=iso(a);to=iso(b)}else if(kind==="month"){let a=new Date(d.getFullYear(),d.getMonth(),1),b=new Date(d.getFullYear(),d.getMonth()+1,0);from=iso(a);to=iso(b)}return{from,to}}$("#quickRange").onchange=()=>{let v=$("#quickRange").value;if(!v)return;let r=rangeDates(v);$("#fromDate").value=r.from;$("#toDate").value=r.to;render()};$("#clear").onclick=()=>{$("#search").value=$("#globalSearch").value=$("#fromDate").value=$("#toDate").value=$("#filterStatus").value=$("#filterType").value=$("#quickRange").value="";render()};function reportHtml(a){let from=$("#fromDate").value,to=$("#toDate").value,period=from||to?((from?fmt(from):"Đầu kỳ")+" - "+(to?fmt(to):"Hiện tại")):"Toàn bộ dữ liệu";let done=a.filter(x=>x.s==="Đã hoàn thành").length,doing=a.filter(x=>x.s==="Đang thực hiện").length,wait=a.filter(x=>x.s==="Chờ xử lý").length;return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo công việc kỹ thuật</title><style>
@page{size:A4;margin:14mm 13mm 16mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1f2937;font-size:11px;margin:0}.header{border-bottom:3px solid #123d6b;padding-bottom:10px;display:flex;justify-content:space-between;align-items:flex-start}.brand{font-weight:800;color:#123d6b;font-size:16px}.brand small{display:block;font-size:8px;letter-spacing:.7px;color:#64748b;margin-top:3px}.doc{text-align:right;font-size:9px;color:#64748b}.title{text-align:center;padding:15px 0 12px}.title h1{font-size:19px;color:#123d6b;margin:0 0 5px}.title p{margin:0;font-size:10px;color:#64748b}.summary{display:grid;grid-template-columns:2fr repeat(4,1fr);border:1px solid #cbd5e1;margin-bottom:14px}.summary>div{padding:8px;border-right:1px solid #cbd5e1}.summary>div:last-child{border:0}.summary span{display:block;color:#64748b;font-size:8px;text-transform:uppercase}.summary b{display:block;margin-top:3px;font-size:12px;color:#123d6b}.job{page-break-inside:avoid;border:1px solid #cbd5e1;margin:0 0 11px}.jobHead{background:#edf4fb;padding:7px 9px;border-bottom:1px solid #cbd5e1;display:flex;gap:7px;align-items:flex-start}.no{background:#123d6b;color:#fff;min-width:21px;height:21px;border-radius:50%;display:grid;place-items:center;font-size:9px}.jobHead h3{margin:2px 0 0;font-size:11px;color:#173d67}.details{display:grid;grid-template-columns:1fr 1fr 1fr;padding:7px 9px;gap:5px 12px}.details div{font-size:9px}.details span{color:#64748b}.note{margin:0 9px 8px;padding:7px;background:#f8fafc;border-left:3px solid #94a3b8;font-size:9px}.photos{padding:0 9px 9px;display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.photos img{width:100%;height:185px;object-fit:contain;border:1px solid #d8e0e8;background:#fff}.photoTitle{grid-column:1/-1;font-weight:700;font-size:9px;color:#475569}.sign{page-break-inside:avoid;display:flex;justify-content:space-around;text-align:center;margin-top:25px;font-size:10px}.sign div{width:38%}.sign small{display:block;margin-top:4px;color:#64748b}.signSpace{height:60px}.foot{position:fixed;bottom:-8mm;left:0;right:0;text-align:center;color:#94a3b8;font-size:8px}
</style></head><body><div class="header"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div class="doc"><b>TÒA NHÀ 62 TRẦN HUY LIỆU</b><br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO CÔNG VIỆC KỸ THUẬT</h1><p>Thời gian báo cáo: <b>${period}</b></p></div><div class="summary"><div><span>Tòa nhà</span><b>62 Trần Huy Liệu</b></div><div><span>Tổng công việc</span><b>${a.length}</b></div><div><span>Hoàn thành</span><b>${done}</b></div><div><span>Đang xử lý</span><b>${doing}</b></div><div><span>Chờ xử lý</span><b>${wait}</b></div></div>
${a.map((x,i)=>`<section class="job"><div class="jobHead"><div class="no">${i+1}</div><h3>${esc(x.c)}</h3></div><div class="details"><div><span>Ngày thực hiện:</span> <b>${fmt(x.d)}</b></div><div><span>Loại công việc:</span> <b>${esc(x.t||"Hằng ngày")}</b></div><div><span>Trạng thái:</span> <b>${esc(x.s)}</b></div><div><span>Người thực hiện:</span> <b>${esc(x.a||"—")}</b></div></div>${x.n?`<div class="note"><b>Ghi chú:</b> ${esc(x.n)}</div>`:""}${x.imgs?.length?`<div class="photos"><div class="photoTitle">HÌNH ẢNH THỰC TẾ</div>${x.imgs.map(v=>'<img src="'+v+'">').join("")}</div>`:""}</section>`).join("")}<div class="sign"><div><b>NGƯỜI LẬP BÁO CÁO</b><small>(Ký và ghi rõ họ tên)</small><div class="signSpace"></div></div><div><b>ĐẠI DIỆN BAN QUẢN LÝ</b><small>(Ký và ghi rõ họ tên)</small><div class="signSpace"></div></div></div><div class="foot">ESTA Building Management · 62 Trần Huy Liệu</div><script>window.onload=()=>setTimeout(()=>window.print(),700)<\/script></body></html>`}function openReport(a){if(!a.length){toast("Không có dữ liệu để xuất PDF");return}let w=open("","_blank");w.document.write(reportHtml(a));w.document.close()}$("#exportBtn").onclick=()=>$("#exportModal").classList.remove("hide");$("#closeExport").onclick=()=>$("#exportModal").classList.add("hide");$("#exportModal").onclick=e=>{if(e.target===$("#exportModal"))$("#exportModal").classList.add("hide")};document.querySelectorAll(".exportChoices button").forEach(b=>b.onclick=()=>{let kind=b.dataset.range,a;if(kind==="current")a=filtered();else{let r=rangeDates(kind);a=filtered(r.from,r.to)}$("#exportModal").classList.add("hide");openReport(a)});document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#viewer").classList.add("hide");$("#exportModal").classList.add("hide")}});$("#today").textContent=new Date().toLocaleDateString("vi-VN");let u=sessionStorage.getItem("u62");if(u&&USERS[u]){enter(u);restoreDraft()}

/* ===== MODULE NĂNG LƯỢNG ===== */
const ENERGY_KEY="qlkt62_energy_v1";
let energyType="electric";
const ENERGY_META={
 electric:{name:"Chỉ số điện",form:"Ghi chỉ số điện",unit:"kWh",valueLabel:"Chỉ số điện (kWh)"},
 water:{name:"Chỉ số nước",form:"Ghi chỉ số nước",unit:"m³",valueLabel:"Chỉ số nước (m³)"},
 solar:{name:"Năng lượng mặt trời",form:"Ghi sản lượng điện mặt trời",unit:"kWh",valueLabel:"Sản lượng điện (kWh)"}
};
function energyLoad(){try{const a=JSON.parse(localStorage.getItem(ENERGY_KEY)||"[]");return Array.isArray(a)?a:[]}catch(e){return[]}}
function energySaveAll(a){localStorage.setItem(ENERGY_KEY,JSON.stringify(a))}
function showModule(name){
 const energy=name==="energy";
 $("#workPage").classList.toggle("hide",energy);
 $("#workHero").classList.toggle("hide",energy);
 $("#energyPage").classList.toggle("hide",!energy);
 $("#energyHero").classList.toggle("hide",!energy);
 $("#navWork").classList.toggle("active",!energy);
 $("#navEnergy").classList.toggle("active",energy);
 $("#app").classList.toggle("energyMode",energy);
 document.querySelector("aside").classList.remove("open");
 if(energy)renderEnergy();
}
$("#navWork").onclick=()=>showModule("work");
$("#navEnergy").onclick=()=>showModule("energy");
$("#energyToday").textContent=new Date().toLocaleDateString("vi-VN");
document.querySelectorAll("[data-energy-type]").forEach(b=>b.onclick=()=>{
 energyType=b.dataset.energyType;
 document.querySelectorAll("[data-energy-type]").forEach(x=>x.classList.toggle("active",x===b));
 resetEnergyForm();
 renderEnergy();
});
function resetEnergyForm(){
 const m=ENERGY_META[energyType];
 $("#energyEditId").value="";
 $("#energyDate").value=today();
 $("#energyValue").value="";
 $("#energyNote").value="";
 $("#energyImage").value="";
 $("#energyImagePreview").innerHTML="";
 $("#energySaveBtn").textContent="Lưu";
 $("#energyCancelEdit").classList.add("hide");
 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=m.valueLabel;
 $("#energyValueColumn").textContent="Chỉ số ("+m.unit+")";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();
}
$("#energyCancelEdit").onclick=resetEnergyForm;
$("#energyImage").onchange=async e=>{
 const f=e.target.files[0];
 if(!f){$("#energyImagePreview").innerHTML="";return}
 try{
  const data=await compressImage(f);
  $("#energyImagePreview").innerHTML='<img src="'+data+'" alt="Ảnh đồng hồ"><span>Ảnh đã chọn</span>';
 }catch(err){toast(err.message);e.target.value=""}
};
$("#energyForm").onsubmit=async e=>{
 e.preventDefault();
 try{
  const id=$("#energyEditId").value;
  let image="";
  const f=$("#energyImage").files[0];
  if(f)image=await compressImage(f);
  const all=energyLoad();
  const old=id?all.find(x=>String(x.id)===String(id)):null;
  const obj={
    id:id||Date.now(),
    type:energyType,
    date:$("#energyDate").value,
    value:Number($("#energyValue").value),
    note:$("#energyNote").value.trim(),
    image:image||(old?.image||""),
    createdAt:old?.createdAt||new Date().toISOString()
  };
  let next=id?all.map(x=>String(x.id)===String(id)?obj:x):[obj,...all];
  energySaveAll(next);
  resetEnergyForm();renderEnergy();toast(id?"Đã cập nhật chỉ số":"Đã lưu chỉ số");
 }catch(err){toast(err.message||"Không thể lưu dữ liệu")}
};
function energyRangeFiltered(){
 let a=energyLoad().filter(x=>x.type===energyType);
 const f=$("#energyFromDate").value,e=$("#energyToDate").value;
 if(f)a=a.filter(x=>x.date>=f);
 if(e)a=a.filter(x=>x.date<=e);
 return a.sort((x,y)=>x.date.localeCompare(y.date)||Number(x.id)-Number(y.id));
}
function energyFmt(v){return Number(v).toLocaleString("vi-VN",{maximumFractionDigits:2})}
function weekday(d){return new Date(d+"T00:00:00").toLocaleDateString("vi-VN",{weekday:"long"})}
function energyRows(){
 const all=energyLoad().filter(x=>x.type===energyType).sort((a,b)=>a.date.localeCompare(b.date)||Number(a.id)-Number(b.id));
 const prevMap={};
 all.forEach((x,i)=>prevMap[String(x.id)]=i?x.value-all[i-1].value:null);
 return energyRangeFiltered().map(x=>({...x,diff:prevMap[String(x.id)]}));
}
function renderEnergy(){
 const m=ENERGY_META[energyType];
 $("#energyFormTitle").textContent=m.form;
 $("#energyUnitHint").textContent="Đơn vị: "+m.unit;
 $("#energyValueLabel").textContent=m.valueLabel;
 $("#energyValueColumn").textContent="Chỉ số ("+m.unit+")";
 $("#energyTableTitle").textContent="Bảng theo dõi "+m.name.toLowerCase();
 const rows=energyRows(),latest=rows.length?rows[rows.length-1]:null;
 const first=rows.length?rows[0]:null;
 const use=rows.length>1?rows[rows.length-1].value-rows[0].value:null;
 $("#energyRecordCount").textContent=rows.length;
 $("#energyLatestValue").textContent=latest?energyFmt(latest.value)+" "+m.unit:"—";
 $("#energyPeriodUse").textContent=use!==null?energyFmt(use)+" "+m.unit:"—";
 $("#energyEmpty").classList.toggle("hide",rows.length>0);
 $("#energyTbody").innerHTML=rows.map(x=>{
   const sun=new Date(x.date+"T00:00:00").getDay()===0;
   const diff=x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff);
   const img=x.image?'<img class="energyThumb" src="'+x.image+'" onclick="viewEnergyImage(\''+x.id+'\')">':"—";
   return '<tr class="'+(sun?"sunday":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td><b>'+energyFmt(x.value)+'</b></td><td>'+diff+'</td><td>'+img+'</td><td>'+esc(x.note||"—")+'</td><td><div class="rowBtns"><button onclick="editEnergy(\''+x.id+'\')">✎</button><button class="del" onclick="deleteEnergy(\''+x.id+'\')">×</button></div></td></tr>'
 }).join("");
 $("#energyMobileCards").innerHTML=rows.map(x=>'<div class="mcard '+(new Date(x.date+"T00:00:00").getDay()===0?"sunday":"")+'"><h4>'+fmt(x.date)+' · '+weekday(x.date)+'</h4><p><b>'+energyFmt(x.value)+' '+m.unit+'</b> · Chênh lệch: '+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</p><p>'+esc(x.note||"Không có ghi chú")+'</p><div class="foot"><button onclick="editEnergy(\''+x.id+'\')">Sửa ›</button></div></div>').join("");
 $("#energySummaryText").textContent=rows.length?"Đang hiển thị "+rows.length+" bản ghi.":"Theo dõi lịch sử chỉ số và mức tiêu thụ theo ngày.";
}
window.editEnergy=id=>{
 const x=energyLoad().find(v=>String(v.id)===String(id));if(!x)return;
 energyType=x.type;
 document.querySelectorAll("[data-energy-type]").forEach(b=>b.classList.toggle("active",b.dataset.energyType===energyType));
 $("#energyEditId").value=x.id;$("#energyDate").value=x.date;$("#energyValue").value=x.value;$("#energyNote").value=x.note||"";
 $("#energyImagePreview").innerHTML=x.image?'<img src="'+x.image+'" alt="Ảnh đồng hồ"><span>Ảnh hiện tại</span>':"";
 $("#energySaveBtn").textContent="Cập nhật";$("#energyCancelEdit").classList.remove("hide");renderEnergy();
 window.scrollTo({top:0,behavior:"smooth"});
};
window.deleteEnergy=id=>{if(!confirm("Xóa bản ghi chỉ số này?"))return;energySaveAll(energyLoad().filter(x=>String(x.id)!==String(id)));renderEnergy();toast("Đã xóa bản ghi")};
window.viewEnergyImage=id=>{const x=energyLoad().find(v=>String(v.id)===String(id));if(!x?.image)return;$("#viewerImages").innerHTML='<img src="'+x.image+'">';$("#viewer").classList.remove("hide")};
function setEnergyRange(kind){
 document.querySelectorAll("[data-erange]").forEach(b=>b.classList.toggle("active",b.dataset.erange===kind));
 if(kind==="all"){$("#energyFromDate").value="";$("#energyToDate").value=""}
 else{const r=rangeDates(kind);$("#energyFromDate").value=r.from;$("#energyToDate").value=r.to}
 renderEnergy();
}
document.querySelectorAll("[data-erange]").forEach(b=>b.onclick=()=>setEnergyRange(b.dataset.erange));
$("#energyApplyFilter").onclick=renderEnergy;
$("#energyClearFilter").onclick=()=>setEnergyRange("all");
function energyReportHtml(rows){
 const m=ENERGY_META[energyType],f=$("#energyFromDate").value,e=$("#energyToDate").value,period=f||e?((f?fmt(f):"Đầu kỳ")+" - "+(e?fmt(e):"Hiện tại")):"Toàn bộ dữ liệu";
 return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo '+m.name+'</title><style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#1f2937;font-size:10px}.head{display:flex;justify-content:space-between;border-bottom:3px solid #0e4d7e;padding-bottom:9px}.brand{font-size:18px;font-weight:800;color:#0e4d7e}.brand small{display:block;font-size:8px;color:#64748b;letter-spacing:1px}.title{text-align:center;margin:16px 0}.title h1{font-size:18px;color:#0e4d7e;margin:0 0 5px}.title p{margin:0;color:#64748b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:7px;text-align:left}th{background:#edf4fb;color:#214d72}.sun{background:#fff7d6}.photo{width:75px;height:55px;object-fit:cover}.foot{margin-top:25px;text-align:center;color:#94a3b8;font-size:8px}</style></head><body><div class="head"><div class="brand">ESTA<small>BUILDING MANAGEMENT</small></div><div>62 TRẦN HUY LIỆU<br>TP. Hồ Chí Minh</div></div><div class="title"><h1>BÁO CÁO '+m.name.toUpperCase()+'</h1><p>Thời gian: <b>'+period+'</b></p></div><table><thead><tr><th>Ngày</th><th>Thứ</th><th>Chỉ số ('+m.unit+')</th><th>Chênh lệch</th><th>Hình ảnh</th><th>Ghi chú</th></tr></thead><tbody>'+rows.map(x=>'<tr class="'+(new Date(x.date+"T00:00:00").getDay()===0?"sun":"")+'"><td>'+fmt(x.date)+'</td><td>'+weekday(x.date)+'</td><td><b>'+energyFmt(x.value)+'</b></td><td>'+(x.diff===null?"—":(x.diff>=0?"+":"")+energyFmt(x.diff))+'</td><td>'+(x.image?'<img class="photo" src="'+x.image+'">':"—")+'</td><td>'+esc(x.note||"—")+'</td></tr>').join("")+'</tbody></table><div class="foot">ESTA · Quản lý năng lượng · 62 Trần Huy Liệu</div><script>window.onload=()=>setTimeout(()=>window.print(),600)<\/script></body></html>'
}
$("#energyExportPdf").onclick=()=>{const rows=energyRows();if(!rows.length){toast("Không có dữ liệu để xuất PDF");return}const w=open("","_blank");w.document.write(energyReportHtml(rows));w.document.close()};
resetEnergyForm();
renderEnergy();
