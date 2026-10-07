(() => {
  "use strict";
  const DB_NAME="esta-new10-media-v1",STORE="queue";
  let opening=null,flushing=false;

  function db(){
    if(opening)return opening;
    opening=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:"id"})};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
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
    });
  }
  const all=async()=>new Promise(async(resolve,reject)=>{
    try{const d=await db(),t=d.transaction(STORE,"readonly"),r=t.objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)}catch(e){reject(e)}
  });
  const put=(item)=>tx("readwrite",s=>s.put(item));
  const remove=(id)=>tx("readwrite",s=>s.delete(id));
  const count=async()=>new Promise(async(resolve,reject)=>{
    try{const d=await db(),t=d.transaction(STORE,"readonly"),r=t.objectStore(STORE).count();r.onsuccess=()=>resolve(r.result||0);r.onerror=()=>reject(r.error)}catch(e){reject(e)}
  });

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
  async function uploadWithRetry(blob,kind,recordId,index,buildingId){
    let last;
    for(let attempt=0;attempt<3;attempt++){
      try{return await uploadMediaBlob(blob,kind,recordId,index,buildingId)}
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
    const blobBuffer=await portableArrayBuffer(blob);
    const item={
      id:crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2),
      target,kind,recordId:String(recordId),index,buildingId,slot,
      blobBuffer,blobType:blob.type||"application/octet-stream",
      attempts:0,createdAt:new Date().toISOString()
    };
    await put(item);
    const n=await count();
    window.ESTA_PROJECT_STORE?.setStatus?.("queued",n+" ảnh chờ tải");
    window.dispatchEvent(new CustomEvent("esta:new10:media-queue",{detail:{count:n}}));
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
    const blob=meta.blob||await prepare(meta.file);
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
    if(item.target==="task"){
      let rows=readTaskCacheFor(item.buildingId);
      const found=rows.some(x=>String(x.id)===String(item.recordId));
      if(!found)return;
      rows=rows.map(x=>{
        if(String(x.id)!==String(item.recordId))return x;
        const imgs=[...new Set([...(Array.isArray(x.imgs)?x.imgs:[]),ref])];
        return {...x,imgs,i:imgs.length};
      });
      writeTaskCacheFor(item.buildingId,rows);
      await projectSync("append_task_images",{id:Number(item.recordId)||item.recordId,images:[ref]},item.buildingId);
      if(currentBuilding?.id===item.buildingId){render();hydrateMediaImages(document.getElementById("tbody"))}
      return;
    }
    if(item.target==="energy"){
      let rows=readEnergyCacheFor(item.buildingId),changed=null;
      rows=rows.map(x=>{
        if(String(x.id)!==String(item.recordId))return x;
        changed={...x,[Number(item.slot)===1?"image2":"image"]:ref};
        return changed;
      });
      if(!changed)return;
      writeEnergyCacheFor(item.buildingId,rows);
      await projectSync("upsert_energy",{item:changed},item.buildingId);
      if(currentBuilding?.id===item.buildingId)renderEnergy();
    }
  }
  async function flush(){
    if(flushing||!navigator.onLine)return;
    flushing=true;
    try{
      const items=await all();
      for(const item of items){
        try{
          const queuedBlob=item.blob instanceof Blob
            ? item.blob
            : new Blob([item.blobBuffer||new ArrayBuffer(0)],{type:item.blobType||"application/octet-stream"});
          const ref=await uploadWithRetry(queuedBlob,item.kind,item.recordId,item.index,item.buildingId);
          await attach(item,ref);
          await remove(item.id);
        }catch(err){
          item.attempts=Number(item.attempts||0)+1;
          item.lastError=String(err?.message||err||"");
          await put(item);
          if(window.ESTA_SYNC_QUEUE?.transient?.(err))break;
        }
      }
      const n=await count();
      if(n)window.ESTA_PROJECT_STORE?.setStatus?.("queued",n+" ảnh chờ tải");
      else if(items.length)window.ESTA_PROJECT_STORE?.setStatus?.("synced","Ảnh đã đồng bộ");
      window.dispatchEvent(new CustomEvent("esta:new10:media-queue",{detail:{count:n}}));
    }finally{flushing=false}
  }
  window.addEventListener("online",()=>setTimeout(flush,500));
  window.addEventListener("focus",()=>{if(navigator.onLine)setTimeout(flush,300)});
  setInterval(()=>{if(navigator.onLine)flush()},20000);

  window.ESTA_MEDIA_MANAGER=Object.freeze({taskFiles,energyFile,flush,count});
})();