"use strict";
/* Interactive 127HH isolated acceptance pilot.
   Browser-local trial state only. No production credentials, network, API or Supabase calls. */
(function(){
 const KEY="esta.127hh.interactive-trial.v1";
 const YEAR_DEFAULT="2026";
 const seed={
  work:[
   {id:"w1",title:"Kiểm tra hệ thống điện tầng 3",system:"Điện",date:"2026-11-06",status:"waiting",assignee:"Kỹ thuật 127",star:true,notes:"Kiểm tra chiếu sáng và tủ điện tầng 3"},
   {id:"w2",title:"Rà soát thiết bị PCCC",system:"PCCC",date:"2026-11-07",status:"doing",assignee:"Kỹ thuật 127",star:true,notes:"Kiểm tra theo checklist"},
   {id:"w3",title:"Vệ sinh FCU khu vực làm việc",system:"HVAC",date:"2026-11-08",status:"done",assignee:"Kỹ thuật 127",star:false,notes:"Đã vệ sinh và nghiệm thu"}
  ],
  materials:[
   {id:"m1",name:"Bóng đèn LED",unit:"Cái",opening:20,min:5,note:"Chiếu sáng"},
   {id:"m2",name:"Van nước cấp",unit:"Cái",opening:8,min:3,note:"Đường ống nước"},
   {id:"m3",name:"Băng keo cách điện",unit:"Cuộn",opening:3,min:4,note:"Điện"}
  ],
  txns:[
   {id:"x1",materialId:"m1",type:"in",qty:10,date:"2026-11-03",note:"Nhập kho"},
   {id:"x2",materialId:"m1",type:"out",qty:4,date:"2026-11-05",note:"Xuất công việc"},
   {id:"x3",materialId:"m2",type:"in",qty:3,date:"2026-11-02",note:"Nhập bổ sung"},
   {id:"x4",materialId:"m2",type:"out",qty:1,date:"2026-11-04",note:"Bảo trì"},
   {id:"x5",materialId:"m3",type:"out",qty:1,date:"2026-11-01",note:"Xuất kho"}
  ],
  tools:[
   {id:"t1",name:"Đồng hồ vạn năng",qty:2,unit:"Cái",brand:"Fluke",location:"Kho kỹ thuật",keeper:"Nhân viên kỹ thuật",status:"ready",notes:"Kiểm tra định kỳ"},
   {id:"t2",name:"Máy khoan pin",qty:1,unit:"Bộ",brand:"Bosch",location:"Kho kỹ thuật",keeper:"Nhân viên kỹ thuật",status:"check",notes:"Kiểm tra pin"},
   {id:"t3",name:"Ampe kìm",qty:1,unit:"Cái",brand:"",location:"Kho kỹ thuật",keeper:"Nhân viên kỹ thuật",status:"ready",notes:""}
  ],
  maintenance:[
   {id:"a1",title:"Kiểm tra chiếu sáng",system:"Điện",date:"2026-11-06",status:"waiting",notes:"Kiểm tra hệ thống điện"},
   {id:"a2",title:"Vệ sinh FCU",system:"HVAC",date:"2026-11-10",status:"doing",notes:"Bảo trì định kỳ"},
   {id:"a3",title:"Kiểm tra hệ thống báo cháy",system:"PCCC",date:"2026-11-18",status:"waiting",notes:"Kiểm tra theo kế hoạch"}
  ]
 };
 const clone=()=>JSON.parse(JSON.stringify(seed));
 const $=id=>document.getElementById(id);
 const escape=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
 const number=s=>Number(s)||0;
 const fmt=n=>number(n).toLocaleString("vi-VN");
 const statusNames={waiting:"Chờ xử lý",doing:"Đang thực hiện",done:"Đã hoàn thành",ready:"Sẵn sàng",check:"Đang kiểm tra",broken:"Hư hỏng"};
 const pageNames={overview:"Tổng quan",work:"Công việc",materials:"Vật tư tiêu hao",tools:"Dụng cụ kỹ thuật",maintenance:"Lịch bảo trì"};
 const workStatus=[["waiting","Chờ xử lý"],["doing","Đang thực hiện"],["done","Đã hoàn thành"]];
 const toolStatus=[["ready","Sẵn sàng"],["check","Đang kiểm tra"],["broken","Hư hỏng"]];
 const systemOptions=["Điện","Nước","HVAC","PCCC","BMS","Thang máy","Khác"].map(v=>[v,v]);
 let state=clone(),page="overview",seq=0,editor=null;
 try{
  const saved=JSON.parse(localStorage.getItem(KEY)||"null");
  if(saved&&["work","materials","txns","tools","maintenance"].every(k=>Array.isArray(saved[k])))state=saved;
 }catch(e){state=clone();}
 function store(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){message("Trình duyệt đang chặn lưu cục bộ; dữ liệu thử có thể mất khi tải lại.");}}
 function message(text){$("feedback").textContent=text;}
 function id(){return "test-"+Date.now().toString(36)+"-"+(++seq).toString(36);}
 function selectStatus(value){return '<span class="status '+escape(value)+'">'+escape(statusNames[value]||value)+'</span>';}
 function empty(text){return '<div class="empty">'+escape(text)+'</div>';}
 function countCard(label,val,sub){return '<div class="metric"><span>'+escape(label)+'</span><strong>'+escape(val)+'</strong>'+(sub?'<small>'+escape(sub)+'</small>':"")+'</div>';}
 function action(kind,op,entityId,label,cls){return '<button type="button" class="smallBtn '+(cls||'')+'" data-action="'+escape(op)+'" data-kind="'+escape(kind)+'" data-id="'+escape(entityId)+'">'+escape(label)+'</button>';}
 function dateVN(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(d)))return String(d);const [y,m,day]=d.split("-");return day+"/"+m+"/"+y;}
 function norm(s){return String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("vi");}
 function matches(q,...values){return values.some(v=>norm(v).includes(norm(q.trim())));}
 function currentYear(){return $("activeYear").value||YEAR_DEFAULT;}
 function monthRange(year,month){
  return month==="all"?[year+"-01-01",year+"-12-31"]:[year+"-"+String(month).padStart(2,"0")+"-01",year+"-"+String(month).padStart(2,"0")+"-31"];
 }
 function materialSnapshot(m,year,month){
  const [start,end]=monthRange(year,month);let opening=number(m.opening),incoming=0,outgoing=0;
  state.txns.filter(t=>t.materialId===m.id).forEach(t=>{
   if(t.date<start)opening+=t.type==="in"?number(t.qty):-number(t.qty);
   else if(t.date<=end){if(t.type==="in")incoming+=number(t.qty);else outgoing+=number(t.qty);}
  });
  return {opening,incoming,outgoing,closing:opening+incoming-outgoing};
 }
 function stockAsOf(m,date){
  let val=number(m.opening);
  state.txns.filter(t=>t.materialId===m.id&&t.date<=date).forEach(t=>val+=t.type==="in"?number(t.qty):-number(t.qty));
  return val;
 }
 function renderOverview(){
  const open=state.work.filter(w=>w.status!=="done").length;
  const finished=state.work.filter(w=>w.status==="done").length;
  const stars=state.work.filter(w=>w.star).length;
  const today=state.work.filter(w=>w.date==="2026-11-06").length;
  $("summaryMetrics").innerHTML=countCard("Công việc theo dõi",state.work.length,"Tổng danh sách")
   +countCard("Chờ hoàn thành",open,"Công việc chưa hoàn thành")
   +countCard("Công việc ưu tiên",stars,"Đã đánh dấu ★")
   +countCard("Đã hoàn thành",finished,"Dữ liệu bạn đã cập nhật");
  const sorted=[...state.work].sort((a,b)=>Number(b.star)-Number(a.star)||a.date.localeCompare(b.date));
  $("priorityTasks").innerHTML=sorted.length?sorted.slice(0,6).map(w=>'<div class="miniRow"><div><strong>'+(w.star?"★ ":"")+escape(w.title)+'</strong><small>'+escape(w.system)+" · "+dateVN(w.date)+'</small></div>'+selectStatus(w.status)+'</div>').join(""):empty("Chưa có công việc. Hãy thêm công việc mới.");
  const lows=state.materials.filter(m=>materialSnapshot(m,currentYear(),"all").closing<=number(m.min));
  const overdue=state.work.filter(w=>w.status!=="done"&&w.date<"2026-11-06");
  const alerts=lows.map(m=>'<div class="miniRow"><div><strong>'+escape(m.name)+'</strong><small>Vật tư bằng hoặc dưới định mức</small></div><span class="status late">Sắp hết</span></div>')
   .concat(overdue.map(w=>'<div class="miniRow"><div><strong>'+escape(w.title)+'</strong><small>'+dateVN(w.date)+'</small></div><span class="status late">Quá hạn</span></div>'));
  $("alerts").innerHTML=alerts.length?alerts.join(""):empty("Chưa có cảnh báo trên dữ liệu thử.");
 }
 function renderWork(){
  const q=$("workSearch").value,filter=$("workStatus").value;
  const rows=state.work.filter(w=>(filter==="all"||w.status===filter)&&matches(q,w.title,w.system,w.assignee,w.notes))
    .sort((a,b)=>Number(b.star)-Number(a.star)||a.date.localeCompare(b.date));
  $("workList").innerHTML=rows.length?rows.map(w=>
   '<article class="record"><div class="recordTop"><div class="recordTitle"><strong>'+escape(w.title)+'</strong><small>'+escape(w.system)+" · "+dateVN(w.date)+'</small></div>'
   +'<button type="button" class="star '+(w.star?"active":"")+'" data-action="star" data-kind="work" data-id="'+escape(w.id)+'" aria-label="Đổi ưu tiên dấu sao" aria-pressed="'+String(!!w.star)+'">'+(w.star?"★":"☆")+'</button></div>'
   +'<div class="recordLine">'+selectStatus(w.status)+'<span>Người thực hiện: '+escape(w.assignee||"Chưa giao")+'</span></div>'
   +(w.notes?'<div class="recordLine">'+escape(w.notes)+'</div>':"")
   +'<div class="recordActions">'+action("work","edit",w.id,"Sửa")+action("work","finish",w.id,w.status==="done"?"Mở lại":"Hoàn thành")
   +action("work","delete",w.id,"Xóa","danger")+'</div></article>'
  ).join(""):empty("Không có công việc phù hợp. Bạn có thể thêm mới.");
 }
 function renderMaterials(){
  const q=$("materialSearch").value,year=currentYear(),month=$("materialMonth").value;
  const mapped=state.materials.map(m=>({m,s:materialSnapshot(m,year,month)}));
  $("materialMetrics").innerHTML=countCard("Nhập kỳ",fmt(mapped.reduce((a,x)=>a+x.s.incoming,0)))
   +countCard("Xuất kỳ",fmt(mapped.reduce((a,x)=>a+x.s.outgoing,0)))
   +countCard("Mặt hàng còn tồn",mapped.filter(x=>x.s.closing>0).length)
   +countCard("Sắp hết",mapped.filter(x=>x.s.closing<=number(x.m.min)).length);
  const rows=mapped.filter(x=>matches(q,x.m.name,x.m.unit,x.m.note));
  $("materialList").innerHTML=rows.length?rows.map(({m,s},i)=>{
   const low=s.closing<=number(m.min);
   const vals=[["Tồn đầu",s.opening],["Nhập",s.incoming],["Xuất",s.outgoing],["Tồn cuối",s.closing]];
   return '<article class="record"><div class="recordTop"><div class="recordTitle"><strong>'+escape(m.name)+'</strong><small>ĐVT: '+escape(m.unit)+' · Định mức tối thiểu: '+fmt(m.min)+'</small></div>'+(low?'<span class="status late">Sắp hết</span>':'<span class="status ready">Còn hàng</span>')+'</div>'
    +'<div class="recordValues">'+vals.map(([label,v],n)=>'<div class="recordValue '+(n===3?"closing":"")+'"><span>'+label+'</span><strong>'+fmt(v)+'</strong></div>').join("")+'</div>'
    +(m.note?'<div class="recordLine">'+escape(m.note)+'</div>':"")
    +'<div class="recordActions">'+action("material","stockIn",m.id,"+ Nhập")+action("material","stockOut",m.id,"− Xuất")
    +action("material","edit",m.id,"Sửa")+action("material","delete",m.id,"Xóa","danger")+'</div></article>';
  }).join(""):empty("Chưa có vật tư phù hợp.");
 }
 function renderTools(){
  const q=$("toolSearch").value,filter=$("toolFilter").value;
  const all=state.tools,rows=all.filter(t=>(filter==="all"||t.status===filter)&&matches(q,t.name,t.brand,t.location,t.keeper,t.notes));
  $("toolMetrics").innerHTML=countCard("Tổng danh mục",all.length)+countCard("Sẵn sàng",all.filter(t=>t.status==="ready").length)
   +countCard("Đang kiểm tra",all.filter(t=>t.status==="check").length)+countCard("Hư hỏng",all.filter(t=>t.status==="broken").length);
  $("toolList").innerHTML=rows.length?rows.map(t=>
   '<article class="record"><div class="recordTop"><div class="recordTitle"><strong>'+escape(t.name)+'</strong><small>'
   +escape(t.brand||"Chưa ghi nhãn hiệu")+' · '+fmt(t.qty)+" "+escape(t.unit)+'</small></div>'+selectStatus(t.status)+'</div>'
   +'<div class="recordLine"><span>Vị trí: '+escape(t.location||"Chưa ghi")+'</span><span>Phụ trách: '+escape(t.keeper||"Chưa ghi")+'</span></div>'
   +(t.notes?'<div class="recordLine">'+escape(t.notes)+'</div>':"")
   +'<div class="recordActions">'+action("tool","edit",t.id,"Sửa")+action("tool","delete",t.id,"Xóa","danger")+'</div></article>'
  ).join(""):empty("Chưa có dụng cụ phù hợp.");
 }
 function renderMaintenance(){
  const month=$("maintenanceMonth").value;
  const rows=[...state.maintenance].filter(m=>m.date.startsWith(month)).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,"vi"));
  $("maintenanceList").innerHTML=rows.length?rows.map(m=>
   '<article class="record"><div class="recordTop"><div class="recordTitle"><small>'+dateVN(m.date)+'</small><strong>'+escape(m.title)+'</strong><small>Hệ thống: '+escape(m.system)+'</small></div>'+selectStatus(m.status)+'</div>'
   +(m.notes?'<div class="recordLine">'+escape(m.notes)+'</div>':"")
   +'<div class="recordActions">'+action("maintenance","edit",m.id,"Dời / Sửa")+action("maintenance","duplicate",m.id,"Nhân bản")
   +action("maintenance","finish",m.id,m.status==="done"?"Mở lại":"Hoàn thành")
   +action("maintenance","delete",m.id,"Xóa","danger")+'</div></article>'
  ).join(""):empty("Chưa có lịch bảo trì trong tháng này. Hãy thêm lịch mới.");
 }
 function render(){renderOverview();renderWork();renderMaterials();renderTools();renderMaintenance();}
 function goto(next){
  if(!pageNames[next])return;page=next;
  document.querySelectorAll(".page").forEach(s=>s.hidden=s.dataset.view!==next);
  document.querySelectorAll("#nav button").forEach(b=>{if(b.dataset.page===next)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
  $("pageTitle").textContent=pageNames[next];
  window.scrollTo?.(0,0);
 }
 const fields={
  work:[
   {k:"title",label:"Nội dung công việc",required:true,wide:true},
   {k:"system",label:"Hệ thống",type:"select",opts:systemOptions},
   {k:"date",label:"Ngày thực hiện",type:"date",required:true},
   {k:"status",label:"Trạng thái",type:"select",opts:workStatus},
   {k:"assignee",label:"Người thực hiện"},
   {k:"star",label:"Ưu tiên",type:"select",opts:[["false","Bình thường"],["true","Đánh dấu sao ★"]]},
   {k:"notes",label:"Ghi chú",type:"textarea",wide:true}
  ],
  material:[
   {k:"name",label:"Tên vật tư",required:true,wide:true},
   {k:"unit",label:"Đơn vị tính",required:true},
   {k:"opening",label:"Tồn đầu (từ đầu dữ liệu thử)",type:"number",required:true,min:0},
   {k:"min",label:"Tồn tối thiểu",type:"number",required:true,min:0},
   {k:"note",label:"Ghi chú",type:"textarea",wide:true}
  ],
  tool:[
   {k:"name",label:"Tên dụng cụ",required:true,wide:true},
   {k:"qty",label:"Số lượng",type:"number",required:true,min:0},
   {k:"unit",label:"Đơn vị tính",required:true},
   {k:"brand",label:"Nhãn hiệu"},
   {k:"location",label:"Vị trí lưu"},
   {k:"keeper",label:"Người phụ trách"},
   {k:"status",label:"Tình trạng",type:"select",opts:toolStatus},
   {k:"notes",label:"Ghi chú",type:"textarea",wide:true}
  ],
  maintenance:[
   {k:"title",label:"Tên công việc bảo trì",required:true,wide:true},
   {k:"system",label:"Hệ thống",type:"select",opts:systemOptions},
   {k:"date",label:"Ngày bảo trì",type:"date",required:true},
   {k:"status",label:"Trạng thái",type:"select",opts:workStatus},
   {k:"notes",label:"Ghi chú",type:"textarea",wide:true}
  ],
  transaction:[
   {k:"date",label:"Ngày nhập / xuất",type:"date",required:true},
   {k:"type",label:"Loại giao dịch",type:"select",opts:[["in","Nhập kho"],["out","Xuất kho"]]},
   {k:"qty",label:"Số lượng",type:"number",required:true,min:0.001,step:"any"},
   {k:"note",label:"Ghi chú",type:"textarea",wide:true}
  ]
 };
 const defaults={
  work:{title:"",system:"Điện",date:"2026-11-06",status:"waiting",assignee:"",star:false,notes:""},
  material:{name:"",unit:"Cái",opening:0,min:0,note:""},
  tool:{name:"",qty:1,unit:"Cái",brand:"",location:"",keeper:"",status:"ready",notes:""},
  maintenance:{title:"",system:"Điện",date:"2026-11-06",status:"waiting",notes:""},
  transaction:{date:"2026-11-06",type:"in",qty:1,note:""}
 };
 function listFor(kind){return state[kind==="work"?"work":kind==="material"?"materials":kind==="tool"?"tools":"maintenance"];}
 function formField(f,val){
  const required=f.required?" required":"",min=f.min!==undefined?' min="'+escape(f.min)+'"':"",step=f.step?' step="'+escape(f.step)+'"':"";
  let input;
  if(f.type==="select")input='<select id="field-'+escape(f.k)+'" name="'+escape(f.k)+'">'+f.opts.map(([v,label])=>'<option value="'+escape(v)+'"'+(String(v)===String(val)?" selected":"")+'>'+escape(label)+'</option>').join("")+'</select>';
  else if(f.type==="textarea")input='<textarea id="field-'+escape(f.k)+'" name="'+escape(f.k)+'">'+escape(val)+'</textarea>';
  else input='<input id="field-'+escape(f.k)+'" name="'+escape(f.k)+'" type="'+escape(f.type||"text")+'" value="'+escape(val)+'"'+required+min+step+'>';
  return '<label class="field '+(f.wide?"wide":"")+'" for="field-'+escape(f.k)+'">'+escape(f.label)+input+'</label>';
 }
 function showEditor(kind,entityId,txType){
  const isTxn=kind==="transaction",item=isTxn?null:entityId?listFor(kind).find(x=>x.id===entityId):null;
  if(entityId&&!isTxn&&!item)return;
  const vals=Object.assign({},defaults[kind],item||{});
  if(isTxn){
   vals.type=txType||"in";
   vals.date=currentYear()+"-"+String($("materialMonth").value==="all"?"11":$("materialMonth").value).padStart(2,"0")+"-06";
  }else if(kind==="maintenance"&&!item)vals.date=$("maintenanceMonth").value+"-06";
  editor={kind,id:entityId||null,materialId:isTxn?entityId:null};
  $("dialogTitle").textContent=isTxn?(vals.type==="in"?"Nhập vật tư":"Xuất vật tư"):item?"Chỉnh sửa "+{work:"công việc",material:"vật tư",tool:"dụng cụ",maintenance:"lịch bảo trì"}[kind]:"Thêm "+{work:"công việc",material:"vật tư",tool:"dụng cụ",maintenance:"lịch bảo trì"}[kind];
  $("formFields").innerHTML=fields[kind].map(f=>formField(f,vals[f.k]??"")).join("");
  const dialog=$("editor");
  if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
 }
 function closeEditor(){const dialog=$("editor");if(typeof dialog.close==="function")dialog.close();else dialog.removeAttribute("open");editor=null;}
 function saveForm(e){
  e.preventDefault();if(!editor)return;
  const form=$("editForm");
  if(!form.checkValidity()){form.reportValidity?.();return;}
  const kind=editor.kind;
  const vals={};
  fields[kind].forEach(f=>vals[f.k]=form.elements.namedItem(f.k).value.trim());
  if(kind==="transaction"){
   const m=state.materials.find(x=>x.id===editor.materialId);
   if(!m)return;
   const qty=Number(vals.qty);if(!Number.isFinite(qty)||qty<=0){message("Số lượng nhập/xuất phải lớn hơn 0.");return;}
   if(vals.type==="out"&&qty>stockAsOf(m,vals.date)){message("Không đủ tồn kho tại ngày xuất. Hãy điều chỉnh số lượng.");return;}
   state.txns.push({id:id(),materialId:m.id,type:vals.type,qty,date:vals.date,note:vals.note});
  }else{
   if(kind==="work")vals.star=vals.star==="true";
   if(kind==="material"){vals.opening=Number(vals.opening);vals.min=Number(vals.min);if(vals.opening<0||vals.min<0){message("Số lượng không được âm.");return;}}
   if(kind==="tool"){vals.qty=Number(vals.qty);if(vals.qty<0){message("Số lượng không được âm.");return;}}
   const list=listFor(kind);
   const prev=editor.id?list.find(x=>x.id===editor.id):null;
   if(prev)Object.assign(prev,vals);
   else list.push(Object.assign({id:id()},vals));
  }
  store();closeEditor();render();message("Đã lưu thay đổi vào dữ liệu thử trên thiết bị này.");
 }
 function addDays(date,days){const d=new Date(date+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
 function act(kind,op,entityId){
  const list=kind==="material"?state.materials:kind==="tool"?state.tools:kind==="work"?state.work:state.maintenance;
  const item=list.find(x=>x.id===entityId);if(!item)return;
  if(op==="edit"){showEditor(kind,entityId);return;}
  if(op==="stockIn"||op==="stockOut"){showEditor("transaction",entityId,op==="stockIn"?"in":"out");return;}
  if(op==="delete"){
   if(kind==="material")state.txns=state.txns.filter(x=>x.materialId!==entityId);
   const idx=list.findIndex(x=>x.id===entityId);if(idx!==-1)list.splice(idx,1);
   message("Đã xóa bản ghi khỏi dữ liệu thử.");
  }else if(op==="star"&&kind==="work"){
   item.star=!item.star;message(item.star?"Đã đánh dấu ưu tiên ★.":"Đã bỏ đánh dấu sao.");
  }else if(op==="finish"&&(kind==="work"||kind==="maintenance")){
   item.status=item.status==="done"?"waiting":"done";message("Đã cập nhật trạng thái.");
  }else if(op==="duplicate"&&kind==="maintenance"){
   let day=item.date;
   for(let i=0;i<45;i++){day=addDays(day,1);if(!state.maintenance.some(x=>x.date===day))break;}
   state.maintenance.push(Object.assign({},item,{id:id(),date:day,status:"waiting"}));
   $("maintenanceMonth").value=day.slice(0,7);
   message("Đã nhân bản lịch vào ngày còn trống gần nhất: "+dateVN(day)+".");
  }else return;
  store();render();
 }
 function exportCsv(){
  const type=page==="overview"?"work":page;
  let rows=[],columns=[];
  if(type==="materials"){columns=["Tên vật tư","Đơn vị","Tồn đầu","Nhập","Xuất","Tồn cuối"];rows=state.materials.map(m=>{const s=materialSnapshot(m,currentYear(),$("materialMonth").value);return [m.name,m.unit,s.opening,s.incoming,s.outgoing,s.closing];});}
  else if(type==="work"){columns=["Ưu tiên","Công việc","Hệ thống","Ngày","Trạng thái","Người thực hiện","Ghi chú"];rows=state.work.map(w=>[w.star?"★":"",w.title,w.system,w.date,statusNames[w.status],w.assignee,w.notes]);}
  else if(type==="tools"){columns=["Tên dụng cụ","Số lượng","Đơn vị","Nhãn hiệu","Vị trí","Phụ trách","Trạng thái"];rows=state.tools.map(t=>[t.name,t.qty,t.unit,t.brand,t.location,t.keeper,statusNames[t.status]]);}
  else{columns=["Ngày","Bảo trì","Hệ thống","Trạng thái","Ghi chú"];rows=state.maintenance.map(m=>[m.date,m.title,m.system,statusNames[m.status],m.notes]);}
  const safe=v=>{
   let text=String(v??"");if(/^[=+@\-]/.test(text)&&isNaN(Number(text)))text="'"+text;
   return '"'+text.replace(/"/g,'""')+'"';
  };
  const csv="\ufeff"+[columns,...rows].map(row=>row.map(safe).join(",")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  if(typeof URL.createObjectURL!=="function"){message("Trình duyệt này không hỗ trợ xuất tệp.");return;}
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="ESTA_127HH_ThuNghiem_"+type+".csv";
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  message("Đã xuất dữ liệu thử thành CSV; không lấy dữ liệu từ web chính.");
 }
 function shiftMonth(delta){
  const value=$("maintenanceMonth").value||"2026-11",d=new Date(value+"-01T12:00:00Z");
  d.setUTCMonth(d.getUTCMonth()+delta);
  $("maintenanceMonth").value=d.toISOString().slice(0,7);renderMaintenance();
 }
 document.addEventListener("click",e=>{
  const btn=e.target.closest("button");if(!btn)return;
  if(btn.dataset.page){goto(btn.dataset.page);return;}
  if(btn.dataset.goto){goto(btn.dataset.goto);return;}
  if(btn.dataset.add){showEditor(btn.dataset.add);return;}
  if(btn.dataset.action){act(btn.dataset.kind,btn.dataset.action,btn.dataset.id);return;}
 });
 $("editForm").addEventListener("submit",saveForm);
 $("closeEditor").addEventListener("click",closeEditor);
 $("cancelEditor").addEventListener("click",closeEditor);
 for(const id of ["workSearch","materialSearch","toolSearch"])$(id).addEventListener("input",render);
 for(const id of ["workStatus","toolFilter","materialMonth"])$(id).addEventListener("change",render);
 $("maintenanceMonth").addEventListener("change",renderMaintenance);
 $("activeYear").addEventListener("change",render);
 $("prevMonth").addEventListener("click",()=>shiftMonth(-1));
 $("nextMonth").addEventListener("click",()=>shiftMonth(1));
 $("resetTrial").addEventListener("click",()=>{
  if(typeof window.confirm==="function"&&!window.confirm("Đặt lại toàn bộ dữ liệu thử trên thiết bị này?"))return;
  state=clone();store();render();message("Đã khôi phục dữ liệu thử ban đầu.");
 });
 $("exportCsv").addEventListener("click",exportCsv);
 render();goto(page);
 window.ESTA127Trial={version:"interactive-v1",data:()=>JSON.parse(JSON.stringify(state)),reset:()=>{state=clone();store();render();}};
})();