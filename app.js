const $=s=>document.querySelector(s);
const USERS={admin:{password:"admin123",name:"Quản trị viên",role:"ADMIN"},kythuat62:{password:"kt62123",name:"Kỹ thuật 62 THL",role:"KỸ THUẬT"}};
let currentUser=null;
const key="qlkt62_tasks_v1";
const load=()=>JSON.parse(localStorage.getItem(key)||"[]");
const save=x=>localStorage.setItem(key,JSON.stringify(x));
const isoToday=()=>new Date().toLocaleDateString("en-CA");
function toast(msg){const e=$("#toast");e.textContent=msg;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
function fmt(d){return new Date(d+"T00:00:00").toLocaleDateString("vi-VN")}
function esc(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function enter(user){currentUser=user;sessionStorage.setItem("qlkt62_user",user);$("#loginView").classList.add("hidden");$("#appView").classList.remove("hidden");const u=USERS[user];$("#topUser").textContent=u.name;$("#sideUser").innerHTML="<strong>"+u.name+"</strong><br><span style='color:#9eabbc'>62 Trần Huy Liệu</span>";$("#roleBadge").textContent=u.role;render()}
function leave(){sessionStorage.removeItem("qlkt62_user");location.reload()}
$("#loginForm").addEventListener("submit",e=>{e.preventDefault();const u=$("#username").value.trim(),p=$("#password").value;if(USERS[u]&&USERS[u].password===p)enter(u);else toast("Tài khoản hoặc mật khẩu chưa đúng")});
$("#logoutBtn").onclick=leave;
$("#menuBtn").onclick=()=>$(".sidebar").classList.toggle("open");
$("#taskImages").onchange=e=>$("#imageHint").textContent=e.target.files.length?e.target.files.length+" hình đã chọn (V1 chưa tải ảnh lên máy chủ)":"";
$("#taskForm").addEventListener("submit",e=>{e.preventDefault();const tasks=load();tasks.unshift({id:Date.now(),date:$("#taskDate").value,content:$("#taskContent").value.trim(),status:$("#taskStatus").value,note:$("#taskNote").value.trim(),images:$("#taskImages").files.length,author:USERS[currentUser].name,createdAt:new Date().toISOString()});save(tasks);$("#taskContent").value="";$("#taskNote").value="";$("#taskImages").value="";$("#imageHint").textContent="";render();toast("Đã thêm công việc")});
function render(){const q=$("#searchInput").value.toLowerCase().trim(),d=$("#filterDate").value,s=$("#filterStatus").value;let a=load().filter(t=>(!q||(t.content+" "+t.note).toLowerCase().includes(q))&&(!d||t.date===d)&&(!s||t.status===s));$("#resultCount").textContent=a.length+" công việc";$("#emptyState").classList.toggle("hidden",a.length>0);$("#taskList").innerHTML=a.map(t=>{const cls=t.status==="Đang thực hiện"?"doing":t.status==="Chờ xử lý"?"waiting":"";return `<article class="task-card"><div class="date-box"><strong>${fmt(t.date)}</strong><span>62 Trần Huy Liệu</span></div><div class="task-main"><h4>${esc(t.content)}</h4><span class="badge ${cls}">${esc(t.status)}</span>${t.note?`<p><b>Ghi chú:</b> ${esc(t.note)}</p>`:""}${t.images?`<p>📷 ${t.images} hình ảnh</p>`:""}<p>Người nhập: ${esc(t.author)}</p></div><div class="task-actions"><button class="icon-btn" onclick="editTask(${t.id})">Sửa</button><button class="icon-btn danger" onclick="deleteTask(${t.id})">Xóa</button></div></article>`}).join("")}
window.deleteTask=id=>{if(!confirm("Xóa công việc này?"))return;save(load().filter(x=>x.id!==id));render();toast("Đã xóa công việc")};
window.editTask=id=>{const a=load(),t=a.find(x=>x.id===id);if(!t)return;const v=prompt("Sửa nội dung công việc:",t.content);if(v===null||!v.trim())return;t.content=v.trim();save(a);render();toast("Đã cập nhật")};
["searchInput","filterDate","filterStatus"].forEach(id=>$("#"+id).addEventListener(id==="searchInput"?"input":"change",render));
$("#clearFilter").onclick=()=>{$("#searchInput").value="";$("#filterDate").value="";$("#filterStatus").value="";render()};
$("#taskDate").value=isoToday();$("#todayLabel").textContent="Hôm nay: "+new Date().toLocaleDateString("vi-VN");
const remembered=sessionStorage.getItem("qlkt62_user");if(remembered&&USERS[remembered])enter(remembered);