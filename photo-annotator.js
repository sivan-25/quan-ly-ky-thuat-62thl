(()=>{
"use strict";

const MAX_SIDE=1800;
const JPEG_QUALITY=.9;
const COLORS=["#ff3b30","#ffd60a","#0a84ff","#ffffff"];
let activeSession=null;

function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function cloneAnnotations(list){try{return JSON.parse(JSON.stringify(list||[]))}catch(e){return []}}
function canvasBlob(canvas,quality=JPEG_QUALITY){
 return new Promise((resolve,reject)=>{
  if(!canvas?.toBlob)return reject(new Error("Trình duyệt không hỗ trợ xuất ảnh canvas."));
  canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Không thể tạo ảnh JPEG.")),"image/jpeg",quality);
 });
}
async function loadImageSource(file){
 if("createImageBitmap" in window){
  try{
   const bmp=await createImageBitmap(file,{imageOrientation:"from-image"});
   return {source:bmp,width:bmp.width,height:bmp.height,dispose:()=>bmp.close?.()};
  }catch(e){
   try{
    const bmp=await createImageBitmap(file);
    return {source:bmp,width:bmp.width,height:bmp.height,dispose:()=>bmp.close?.()};
   }catch(_){}
  }
 }
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise((resolve,reject)=>{
   const el=new Image();
   el.onload=()=>resolve(el);
   el.onerror=()=>reject(new Error("Không đọc được ảnh."));
   el.src=url;
  });
  return {source:img,width:img.naturalWidth||img.width,height:img.naturalHeight||img.height,dispose:()=>URL.revokeObjectURL(url)};
 }catch(e){URL.revokeObjectURL(url);throw e}
}
function fitSize(width,height){
 const scale=Math.min(1,MAX_SIDE/Math.max(width,height));
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function pointFromEvent(canvas,e){
 const r=canvas.getBoundingClientRect();
 return {
  x:clamp((e.clientX-r.left)*canvas.width/Math.max(1,r.width),0,canvas.width),
  y:clamp((e.clientY-r.top)*canvas.height/Math.max(1,r.height),0,canvas.height)
 };
}
function drawArrow(ctx,a,strokeWidth){
 const dx=a.x2-a.x1,dy=a.y2-a.y1,len=Math.hypot(dx,dy);
 if(len<2)return;
 const ang=Math.atan2(dy,dx),head=Math.max(18,strokeWidth*4.2);
 ctx.beginPath();ctx.moveTo(a.x1,a.y1);ctx.lineTo(a.x2,a.y2);ctx.stroke();
 ctx.beginPath();ctx.moveTo(a.x2,a.y2);
 ctx.lineTo(a.x2-head*Math.cos(ang-Math.PI/6),a.y2-head*Math.sin(ang-Math.PI/6));
 ctx.moveTo(a.x2,a.y2);
 ctx.lineTo(a.x2-head*Math.cos(ang+Math.PI/6),a.y2-head*Math.sin(ang+Math.PI/6));
 ctx.stroke();
}
function drawOne(ctx,a,canvas){
 const sw=a.width||Math.max(5,Math.round(Math.max(canvas.width,canvas.height)/280));
 ctx.save();ctx.strokeStyle=a.color||COLORS[0];ctx.fillStyle=a.color||COLORS[0];ctx.lineWidth=sw;ctx.lineCap="round";ctx.lineJoin="round";
 if(a.type==="freehand"){
  const pts=a.points||[];if(pts.length){
   ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
   for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);
   ctx.stroke();
  }
 }else if(a.type==="rect"){
  ctx.strokeRect(a.x1,a.y1,a.x2-a.x1,a.y2-a.y1);
 }else if(a.type==="ellipse"){
  const cx=(a.x1+a.x2)/2,cy=(a.y1+a.y2)/2,rx=Math.abs(a.x2-a.x1)/2,ry=Math.abs(a.y2-a.y1)/2;
  if(rx>0&&ry>0){ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke()}
 }else if(a.type==="arrow"){
  drawArrow(ctx,a,sw);
 }else if(a.type==="text"){
  const font=a.fontSize||Math.max(28,Math.round(Math.max(canvas.width,canvas.height)/34));
  ctx.font=`700 ${font}px Inter,Arial,sans-serif`;
  ctx.textBaseline="top";
  ctx.lineWidth=Math.max(3,Math.round(font/11));
  ctx.strokeStyle="rgba(0,0,0,.72)";
  ctx.strokeText(a.text||"",a.x,a.y);
  ctx.fillStyle=a.color||COLORS[0];ctx.fillText(a.text||"",a.x,a.y);
 }
 ctx.restore();
}
function makeUI(){
 const root=document.createElement("div");root.className="photoAnnotator";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
 root.innerHTML=`
  <header class="paHead">
   <div><span>ESTA · PHOTO MARKUP</span><h2>Chỉnh sửa hình ảnh</h2></div>
   <button type="button" class="paClose" aria-label="Đóng">×</button>
  </header>
  <div class="paTools" aria-label="Công cụ chú thích">
   <div class="paToolGroup">
    <button type="button" data-tool="freehand" class="active">✎<b>Vẽ</b></button>
    <button type="button" data-tool="rect">□<b>Khung</b></button>
    <button type="button" data-tool="ellipse">○<b>Tròn</b></button>
    <button type="button" data-tool="arrow">↗<b>Mũi tên</b></button>
    <button type="button" data-tool="text">T<b>Chữ</b></button>
    <button type="button" data-action="undo">↶<b>Undo</b></button>
   </div>
   <div class="paColors" aria-label="Chọn màu">
    ${COLORS.map((c,i)=>`<button type="button" class="${i===0?"active":""}" data-color="${c}" aria-label="Màu ${i+1}"><i style="background:${c}"></i></button>`).join("")}
   </div>
  </div>
  <main class="paStage"><div class="paCanvasWrap"><canvas class="paCanvas"></canvas></div></main>
  <footer class="paFoot">
   <button type="button" class="secondary" data-action="retake">Chụp lại</button>
   <button type="button" class="secondary" data-action="original">Dùng ảnh gốc</button>
   <button type="button" class="primary" data-action="use">Sử dụng ảnh</button>
  </footer>
  <div class="paTextModal hidden" role="dialog" aria-modal="true">
   <div><label>Nhập ghi chú trên ảnh<input maxlength="120" autocomplete="off" placeholder="VD: Vị trí thấm nước"></label>
   <span><button type="button" data-text-cancel>Hủy</button><button type="button" data-text-ok>Thêm chữ</button></span></div>
  </div>
  <div class="paConfirm hidden" role="dialog" aria-modal="true">
   <div><h3>Bỏ ảnh này?</h3><p>Các chú thích chưa sử dụng sẽ bị mất.</p><span><button type="button" data-confirm-keep>Tiếp tục chỉnh sửa</button><button type="button" class="danger" data-confirm-discard>Bỏ ảnh</button></span></div>
  </div>`;
 return root;
}
async function open(file,options={}){
 if(!(file instanceof Blob))throw new Error("Ảnh không hợp lệ.");
 if(activeSession)throw new Error("Trình chỉnh sửa ảnh đang được sử dụng.");
 const root=makeUI(),canvas=root.querySelector(".paCanvas"),ctx=canvas.getContext("2d",{alpha:false});
 const oldOverflow=document.body.style.overflow,oldOverscroll=document.body.style.overscrollBehavior;
 document.body.appendChild(root);document.body.style.overflow="hidden";document.body.style.overscrollBehavior="none";
 let sourceInfo=null,baseCanvas=document.createElement("canvas"),baseCtx=baseCanvas.getContext("2d",{alpha:false});
 let annotations=cloneAnnotations(options.annotations),tool=options.tool||"freehand",color=options.color||COLORS[0],draft=null,pointerId=null,textPoint=null,closed=false,historyPushed=false,backConsumed=false;
 activeSession={root};
 function dirty(){return annotations.length>0||!!draft}
 function redraw(){
  if(!baseCanvas.width)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(baseCanvas,0,0);
  annotations.forEach(a=>drawOne(ctx,a,canvas));if(draft)drawOne(ctx,draft,canvas);
  root.querySelector('[data-action="undo"]').disabled=!annotations.length&&!draft;
 }
 function selectTool(next){
  tool=next;root.querySelectorAll("[data-tool]").forEach(b=>b.classList.toggle("active",b.dataset.tool===tool));
 }
 function selectColor(next){
  color=next;root.querySelectorAll("[data-color]").forEach(b=>b.classList.toggle("active",b.dataset.color===color));
 }
 function cleanup(){
  if(closed)return;closed=true;
  window.removeEventListener("keydown",keyHandler,true);window.removeEventListener("popstate",popHandler);
  sourceInfo?.dispose?.();document.body.style.overflow=oldOverflow;document.body.style.overscrollBehavior=oldOverscroll;
  root.remove();activeSession=null;
 }
 function leaveHistory(){
  if(historyPushed&&history.state?.estaPhotoAnnotator){historyPushed=false;history.back()}
 }
 function finish(resolve,result){
  cleanup();leaveHistory();resolve(result);
 }
 function requestClose(resolve,fromBack=false){
  if(dirty()){
   root.querySelector(".paConfirm").classList.remove("hidden");
   root.querySelector("[data-confirm-keep]").focus({preventScroll:true});
   backConsumed=fromBack;
  }else finish(resolve,{action:"cancel",blob:null,originalFile:file,annotations:[]});
 }
 function popHandler(){if(closed)return;historyPushed=false;requestClose(sessionResolve,true)}
 function keyHandler(e){
  if(e.key==="Escape"){e.preventDefault();requestClose(sessionResolve,false)}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();annotations.pop();draft=null;redraw()}
 }
 let sessionResolve;
 const promise=new Promise(async(resolve,reject)=>{
  sessionResolve=resolve;
  try{
   sourceInfo=await loadImageSource(file);
   const size=fitSize(sourceInfo.width,sourceInfo.height);
   baseCanvas.width=canvas.width=size.width;baseCanvas.height=canvas.height=size.height;
   baseCtx.fillStyle="#000";baseCtx.fillRect(0,0,size.width,size.height);baseCtx.drawImage(sourceInfo.source,0,0,size.width,size.height);
   redraw();
   try{history.pushState({...(history.state||{}),estaPhotoAnnotator:true},"");historyPushed=true}catch(e){}
   window.addEventListener("popstate",popHandler);window.addEventListener("keydown",keyHandler,true);

   root.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>selectTool(b.dataset.tool));
   root.querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>selectColor(b.dataset.color));
   root.querySelector(".paClose").onclick=()=>requestClose(resolve,false);
   root.querySelector('[data-action="undo"]').onclick=()=>{if(draft)draft=null;else annotations.pop();redraw()};
   root.querySelector('[data-action="retake"]').onclick=()=>finish(resolve,{action:"retake",blob:null,originalFile:file,annotations:[]});
   root.querySelector('[data-action="original"]').onclick=async()=>{
    try{const blob=await canvasBlob(baseCanvas);finish(resolve,{action:"use",blob,originalFile:file,annotations:[],usedOriginal:true})}
    catch(e){reject(e);cleanup()}
   };
   root.querySelector('[data-action="use"]').onclick=async()=>{
    try{draft=null;redraw();const blob=await canvasBlob(canvas);finish(resolve,{action:"use",blob,originalFile:file,annotations:cloneAnnotations(annotations),usedOriginal:false})}
    catch(e){reject(e);cleanup()}
   };
   root.querySelector("[data-confirm-keep]").onclick=()=>{
    root.querySelector(".paConfirm").classList.add("hidden");
    if(backConsumed){try{history.pushState({...(history.state||{}),estaPhotoAnnotator:true},"");historyPushed=true}catch(e){}backConsumed=false}
   };
   root.querySelector("[data-confirm-discard]").onclick=()=>finish(resolve,{action:"cancel",blob:null,originalFile:file,annotations:[]});
   root.querySelector("[data-text-cancel]").onclick=()=>{root.querySelector(".paTextModal").classList.add("hidden");textPoint=null};
   root.querySelector("[data-text-ok]").onclick=()=>{
    const input=root.querySelector(".paTextModal input"),text=input.value.trim();if(text&&textPoint){annotations.push({type:"text",text,x:textPoint.x,y:textPoint.y,color});redraw()}
    input.value="";textPoint=null;root.querySelector(".paTextModal").classList.add("hidden");
   };
   root.querySelector(".paTextModal input").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();root.querySelector("[data-text-ok]").click()}});

   canvas.addEventListener("pointerdown",e=>{
    if(e.button!=null&&e.button!==0)return;e.preventDefault();
    const p=pointFromEvent(canvas,e);
    if(tool==="text"){
     textPoint=p;const m=root.querySelector(".paTextModal");m.classList.remove("hidden");setTimeout(()=>m.querySelector("input").focus(),20);return;
    }
    pointerId=e.pointerId;try{canvas.setPointerCapture(pointerId)}catch(_){}
    const width=Math.max(5,Math.round(Math.max(canvas.width,canvas.height)/280));
    if(tool==="freehand")draft={type:"freehand",color,width,points:[p]};
    else draft={type:tool,color,width,x1:p.x,y1:p.y,x2:p.x,y2:p.y};
    redraw();
   },{passive:false});
   canvas.addEventListener("pointermove",e=>{
    if(pointerId!==e.pointerId||!draft)return;e.preventDefault();const p=pointFromEvent(canvas,e);
    if(draft.type==="freehand")draft.points.push(p);else{draft.x2=p.x;draft.y2=p.y}redraw();
   },{passive:false});
   const endPointer=e=>{
    if(pointerId!==e.pointerId||!draft)return;e.preventDefault();
    try{canvas.releasePointerCapture(pointerId)}catch(_){}
    if(draft.type==="freehand"){if((draft.points||[]).length>1)annotations.push(draft)}
    else if(Math.hypot((draft.x2||0)-draft.x1,(draft.y2||0)-draft.y1)>4)annotations.push(draft);
    draft=null;pointerId=null;redraw();
   };
   canvas.addEventListener("pointerup",endPointer,{passive:false});
   canvas.addEventListener("pointercancel",endPointer,{passive:false});
  }catch(e){cleanup();reject(e)}
 });
 return promise;
}
window.PhotoAnnotator={open,MAX_SIDE,JPEG_QUALITY};
})();