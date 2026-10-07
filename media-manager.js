(() => {
  "use strict";
  const DB_NAME="esta-new10-media-v1",STORE="queue";
  let opening=null,running=null;
  const owner=()=>window.ESTA_SYNC_QUEUE?.owner?.()||"";
  const authenticated=()=>{try{return !!centralSession?.access_token&&!!owner()}catch(_){return false}};
  const belongs=item=>!!owner()&&item.ownerId===owner();
  let pendingCount=0;
  const accountError=()=>{const e=new Error("Đang chờ tài khoản đã lưu ảnh đăng nhập");e.status=401;return e};

  function db(){
    if(opening)return opening;
    opening=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:"id"})};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>{opening=null;reject(req.error)};
    });
    return opening;
  }
  async function tx(mode,run){
    const d=await db();
    return new Promise((resolve,reject)=>{
      const t=d.transaction(STORE,mode),s=t.objectStore(STORE);
      let result;
      try{result=run(s)}catch(e){reject(e);return}
      t.oncomplete=()=>resolve(result);
      t.onerror=()=>reject(t.error);
      t.onabort=()=>reject(t.error||new Error("Không lưu được ảnh trên thiết bị"));
    });
  }
  const all=async()=>new Promise(async(resolve,reject)=>{
    try{const d=await db(),t=d.transaction(STORE,"readonly"),r=t.objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)}catch(e){reject(e)}
  });
  const put=(item)=>tx("readwrite",s=>s.put(item));
  const remove=(id)=>tx("readwrite",s=>s.delete(id));
  const count=async()=>{pendingCount=(await all()).filter(belongs).length;return pendingCount};
  async function publish(){
    const n=await count();
    window.dispatchEvent(new CustomEvent("esta:new10:media-queue",{detail:{count:n}}));
    if(n)window.ESTA_PROJECT_STORE?.setStatus?.("queued",n+" ảnh chờ tải");
    return n;
  }

  const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
  async function portableArrayBuffer(blob){
    const source=typeof blob?.slice==="function"
      ? blob.slice(0,Number(blob.size||0),blob.type||"application/octet-stream")
      : blob;
    try{return await source.arrayBuffer()}catch(_){}
    try{return await new Response(source).arrayBuffer()}catch(_){}
    return await new Promise((resolve,reject)=>{
      try{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(reader.error||new Error("Không thể đọc dữ liệu ảnh"));
        reader.readAsArrayBuffer(source);
      }catch(err){reject(err)}
    });
  }
  async function uploadWithRetry(blob,kind,recordId,index,buildingId,ownerId=owner()){
    let last;
    for(let attempt=0;attempt<3;attempt++){
      try{if(!authenticated()||owner()!==ownerId)throw accountError();return await uploadMediaBlob(blob,kind,recordId,index,buildingId)}
      catch(err){
        last=err;
        if(!window.ESTA_SYNC_QUEUE?.transient?.(err))throw err;
        if(!navigator.onLine)break;
        await sleep(350*Math.pow(2,attempt));
      }
    }
    throw last||new Error("Không thể tải hình");
  }
  async function queueBlob({blob,target,kind,recordId,index=0,buildingId,slot=0}){
    if(!authenticated())throw accountError();
    const ownerId=owner();
    const blobBuffer=await portableArrayBuffer(blob);
    const item={
      id:crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2),
      target,kind,recordId:String(recordId),index,buildingId,slot,ownerId,
      blobBuffer,blobType:blob.type||"application/octet-stream",
      attempts:0,createdAt:new Date().toISOString()
    };
    await put(item);
    await publish();
    return item.id;
  }
  async function prepare(file){
    if(file?.type==="image/jpeg"&&String(file?.name||"").startsWith("camera-")){
      return typeof file.slice==="function"
        ? file.slice(0,Number(file.size||0),file.type||"image/jpeg")
        : file;
    }
    return imageFileToBlob(file);
  }
  async function uploadOrQueue(meta){
    const ownerId=owner();
    if(!authenticated())throw accountError();
    const blob=meta.blob||await prepare(meta.file);
    if(owner()!==ownerId)throw accountError();
    if(!navigator.onLine){
      await queueBlob({...meta,blob});
      return {ref:"",queued:true};
    }
    try{
      const ref=await uploadWithRetry(blob,meta.kind,meta.recordId,meta.index||0,meta.buildingId);
      return {ref,queued:false};
    }catch(err){
      if(!window.ESTA_SYNC_QUEUE?.transient?.(err))throw err;
      await queueBlob({...meta,blob});
      return {ref:"",queued:true};
    }
  }
  async function taskFiles(files,recordId,buildingId,onProgress){
    const refs=[],list=[...(files||[])];let queued=0,done=0;
    for(let i=0;i<list.length;i++){
      const out=await uploadOrQueue({file:list[i],target:"task",kind:"tasks",recordId,index:i,buildingId});
      if(out.ref)refs.push(out.ref);if(out.queued)queued++;done++;onProgress?.(done,list.length);
    }
    return {refs,queued};
  }
  async function energyFile(file,recordId,slot,buildingId){
    if(!file)return {ref:"",queued:false};
    return uploadOrQueue({file,target:"energy",kind:"energy",recordId,index:slot,slot,buildingId});
  }
  async function attach(item,ref){
    if(!authenticated()||!belongs(item))throw accountError();
    // Never drop the blob merely because an append was queued locally. Wait
    // for its parent record, then require the server to acknowledge the link.
    await window.ESTA_SYNC_QUEUE?.flush?.();
    if(window.ESTA_SYNC_QUEUE?.pending?.(item.buildingId).length)throw new TypeError("Chờ đồng bộ bản ghi trước khi gắn ảnh");
    const response=await projectSyncDirect("get",{},item.buildingId);
    if(!response?.snapshot)throw new TypeError("Chưa tải được dữ liệu máy chủ");
    const rows=item.target==="task"?response.snapshot.tasks:response.snapshot.energy;
    const row=(rows||[]).find(x=>String(x.id)===String(item.recordId));
    if(!row)throw new TypeError("Bản ghi chưa có trên máy chủ; giữ ảnh chờ đồng bộ");
    if(!authenticated()||!belongs(item))throw accountError();
    let result;
    if(item.target==="task"){
      const imgs=[...new Set([...(row.imgs||[]),ref])];
      result=await projectSyncDirect("append_task_images",{id:Number(item.recordId)||item.recordId,images:[ref]},item.buildingId);
      if(result===null)throw new TypeError("Máy chủ chưa xác nhận ảnh");
      if(belongs(item))writeTaskCacheFor(item.buildingId,readTaskCacheFor(item.buildingId).map(x=>String(x.id)===String(item.recordId)?{...x,imgs:[...new Set([...(x.imgs||[]),...imgs])],i:new Set([...(x.imgs||[]),...imgs]).size}:x));
      if(belongs(item)&&currentBuilding?.id===item.buildingId){render();hydrateMediaImages(document.getElementById("tbody"))}
    }else if(item.target==="energy"){
      const field=Number(item.slot)===1?"image2":"image";
      result=await projectSyncDirect("upsert_energy",{item:{...row,[field]:ref}},item.buildingId);
      if(result===null)throw new TypeError("Máy chủ chưa xác nhận ảnh");
      if(belongs(item))writeEnergyCacheFor(item.buildingId,readEnergyCacheFor(item.buildingId).map(x=>String(x.id)===String(item.recordId)?{...x,[field]:ref}:x));
      if(belongs(item)&&currentBuilding?.id===item.buildingId)renderEnergy();
    }else throw new Error("Loại ảnh không hợp lệ");
  }
  async function drain(){
    if(!navigator.onLine||!authenticated())return;
    {
      await window.ESTA_SYNC_QUEUE?.flush?.();
      const items=(await all()).filter(belongs);
      for(const item of items){
        if(!navigator.onLine||!authenticated()||!belongs(item))break;
        try{
          const queuedBlob=item.blob instanceof Blob
            ? item.blob
            : new Blob([item.blobBuffer||new ArrayBuffer(0)],{type:item.blobType||"application/octet-stream"});
          if(!item.ref){
            item.ref=await uploadWithRetry(queuedBlob,item.kind,item.recordId,item.index,item.buildingId,item.ownerId);
            await put(item); // Reuse the uploaded file if linking fails.
          }
          await attach(item,item.ref);
          await remove(item.id);
        }catch(err){
          item.attempts=Number(item.attempts||0)+1;
          item.lastError=String(err?.message||err||"");
          await put(item);
          if(window.ESTA_SYNC_QUEUE?.transient?.(err))break;
        }
      }
      const n=await publish();
      if(!n&&items.length)window.ESTA_PROJECT_STORE?.setStatus?.("synced","Ảnh đã đồng bộ");
    }
  }
  function flush(){
    if(running)return running;
    running=(navigator.locks?.request?navigator.locks.request(DB_NAME+":flush",drain):drain()).finally(()=>{running=null});
    return running;
  }
  const legacy=async()=>(await all()).filter(x=>!x.ownerId&&x.buildingId==="NEW10");
  async function recoverLegacy(){
    if(!authenticated())throw accountError();
    const user=owner();
    for(const item of await legacy())await put({...item,ownerId:user});
    await publish();
  }
  const safeFlush=()=>flush().catch(err=>console.warn("NEW10 media retry failed",err));
  window.addEventListener("online",()=>setTimeout(safeFlush,500));
  window.addEventListener("focus",()=>{if(navigator.onLine)setTimeout(safeFlush,300)});
  setInterval(()=>{if(navigator.onLine)safeFlush()},20000);

  window.ESTA_MEDIA_MANAGER=Object.freeze({taskFiles,energyFile,flush,count,legacy,recoverLegacy,pendingCount:()=>pendingCount});
})();
