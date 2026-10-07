(() => {
  "use strict";
  const KEY="esta:new10:sync-queue:v2";
  const listeners=new Set();
  let executor=null,running=null,revision=0;
  const read=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}};
  function owner(){try{return String(currentAccount?.id||"")}catch(_){return ""}}
  function authenticated(){try{return !!centralSession?.access_token&&!!owner()}catch(_){return false}}
  const mine=item=>!!owner()&&item.ownerId===owner();
  const pending=(buildingId="NEW10")=>read().filter(x=>mine(x)&&x.buildingId===buildingId);
  const lock=(name,fn)=>navigator.locks?.request?navigator.locks.request(name,fn):Promise.resolve().then(fn);
  const emit=(items=read())=>{
    const visible=items.filter(mine),legacy=items.filter(x=>!x.ownerId);
    const detail={count:visible.length,legacyCount:legacy.length,items:visible};
    listeners.forEach(fn=>{try{fn(detail)}catch(_){}});
    window.dispatchEvent(new CustomEvent("esta:new10:queue",{detail}));
  };
  const write=items=>{localStorage.setItem(KEY,JSON.stringify(items));revision++;emit(items)};
  const edit=fn=>lock(KEY+":write",()=>write(fn(read())));
  function status(){
    const items=pending();
    if(items.length)window.ESTA_PROJECT_STORE?.setStatus?.("queued",items.length+" mục chờ đồng bộ"+(items.some(x=>x.blocked)?" · cần thử lại":""));
    return items.length;
  }
  function transient(err){
    if(!navigator.onLine)return true;
    const code=Number(err?.status||0);
    return code===408||code===425||code===429||code>=500||(!code&&(err instanceof TypeError||/network|fetch|offline|timeout|kết nối/i.test(String(err?.message||""))));
  }
  async function enqueue(action,payload,buildingId,error=""){
    if(!authenticated()){const e=new Error("Đang chờ đăng nhập để đồng bộ");e.status=401;throw e}
    if(buildingId!=="NEW10")throw new Error("Hàng đợi chỉ dùng cho NEW10");
    const item={id:crypto.randomUUID(),ownerId:owner(),action,payload:JSON.parse(JSON.stringify(payload)),buildingId,attempts:0,createdAt:new Date().toISOString(),lastError:String(error||"")};
    // Preserve operation order. In particular, an edit after a delete must not
    // move ahead of the delete, and an image append must follow its task insert.
    await edit(items=>[...items,item]);
    status();
    return {queued:true,queue_id:item.id};
  }
  async function drain(options){
    let done=0;
    if(!executor||!navigator.onLine||!authenticated())return {flushed:0,remaining:pending().length};
    const user=owner();
    const ids=pending().map(x=>x.id);
    for(const id of ids){
      if(!navigator.onLine||!authenticated()||owner()!==user)break;
      const item=read().find(x=>x.id===id&&x.ownerId===user);
      if(!item)continue;
      if(item.blocked&&!options.retry)break;
      try{
        const result=await executor(item);
        if(result===null||result?.queued)throw new Error("Máy chủ chưa xác nhận đồng bộ");
        // Re-read after the request: never overwrite changes queued while the
        // request was in flight (in this tab or another tab).
        await edit(items=>items.filter(x=>x.id!==id));
        done++;
      }catch(err){
        await edit(items=>items.map(x=>x.id===id?{...x,attempts:Number(x.attempts||0)+1,lastError:String(err?.message||err),lastAttemptAt:new Date().toISOString(),blocked:!transient(err)}:x));
        break; // Later edits/deletes must not overtake this operation.
      }
    }
    const remaining=status();
    if(!remaining&&done)window.ESTA_PROJECT_STORE?.setStatus?.("synced","Đã đồng bộ hàng đợi");
    return {flushed:done,remaining};
  }
  function flush(options={}){
    if(running)return running;
    running=lock(KEY+":flush",()=>drain(options)).finally(()=>{running=null});
    return running;
  }
  function overlay(snapshot,buildingId){
    const out={...snapshot,tasks:[...(snapshot?.tasks||[])],energy:[...(snapshot?.energy||[])]};
    const upsert=(rows,item)=>{const next=rows.filter(x=>String(x.id)!==String(item.id));next.push(item);return next};
    for(const entry of pending(buildingId)){
      const p=entry.payload||{};
      if(entry.action==="upsert_task"&&p.item)out.tasks=upsert(out.tasks,p.item);
      if(entry.action==="upsert_energy"&&p.item)out.energy=upsert(out.energy,p.item);
      if(entry.action==="delete_task")out.tasks=out.tasks.filter(x=>String(x.id)!==String(p.id));
      if(entry.action==="delete_energy")out.energy=out.energy.filter(x=>String(x.id)!==String(p.id));
      if(entry.action==="append_task_images")out.tasks=out.tasks.map(x=>{if(String(x.id)!==String(p.id))return x;const imgs=[...new Set([...(x.imgs||[]),...(p.images||[])])];return {...x,imgs,i:imgs.length}});
      if(entry.action==="merge_snapshot"){
        for(const item of p.tasks||[])out.tasks=upsert(out.tasks,item);
        for(const item of p.energy||[])out.energy=upsert(out.energy,item);
      }
    }
    return out;
  }
  const safeFlush=()=>flush().catch(err=>{console.warn("NEW10 queue retry failed",err);status()});
  function configure(fn){executor=fn;setTimeout(safeFlush,0)}
  window.addEventListener("online",()=>setTimeout(safeFlush,250));
  window.addEventListener("focus",()=>{if(navigator.onLine)setTimeout(safeFlush,150)});
  window.addEventListener("storage",e=>{if(e.key===KEY){revision++;emit();status()}});
  setInterval(()=>{if(navigator.onLine&&pending().length)safeFlush()},15000);
  const legacy=()=>read().filter(x=>!x.ownerId&&x.buildingId==="NEW10");
  async function recoverLegacy(){
    if(!authenticated())throw new Error("Cần đăng nhập để khôi phục");
    const user=owner();
    await edit(items=>items.map(x=>!x.ownerId&&x.buildingId==="NEW10"?{...x,ownerId:user}:x));
  }
  window.ESTA_SYNC_QUEUE=Object.freeze({enqueue,flush,read,pending,overlay,status,owner,legacy,recoverLegacy,revision:()=>revision,count:()=>pending().length,transient,configure,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}});
})();
