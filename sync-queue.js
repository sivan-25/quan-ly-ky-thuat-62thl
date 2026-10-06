(() => {
  "use strict";
  const KEY="esta:new10:sync-queue:v2";
  const listeners=new Set();
  let executor=null,flushing=false;

  const read=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(a)?a:[]}catch(_){return[]}};
  const write=(a)=>{localStorage.setItem(KEY,JSON.stringify(a));emit(a);return a};
  const emit=(items=read())=>{
    const detail={count:items.length,items};
    listeners.forEach(fn=>{try{fn(detail)}catch(_){}});
    try{window.dispatchEvent(new CustomEvent("esta:new10:queue",{detail}))}catch(_){}
  };
  const keyOf=(x)=>x.action+"|"+x.buildingId+"|"+String(x.payload?.item?.id??x.payload?.id??"");
  function transient(err){
    if(!navigator.onLine)return true;
    const status=Number(err?.status||0);
    return !status||status===408||status===425||status===429||status>=500;
  }
  function enqueue(action,payload,buildingId,error=""){
    const item={
      id:crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2),
      action,payload,buildingId,
      attempts:0,
      createdAt:new Date().toISOString(),
      lastError:String(error||"")
    };
    let items=read();
    const replaceable=new Set(["upsert_task","upsert_energy","merge_snapshot"]);
    if(replaceable.has(action)){
      const k=keyOf(item);
      items=items.filter(x=>keyOf(x)!==k);
    }
    items.push(item);
    write(items);
    try{window.ESTA_PROJECT_STORE?.setStatus?.("queued",items.length+" mục chờ đồng bộ")}catch(_){}
    return {queued:true,queue_id:item.id};
  }
  async function flush(){
    if(flushing||!executor||!navigator.onLine)return {flushed:0,remaining:read().length};
    flushing=true;
    let items=read(),done=0,next=[];
    try{
      for(const item of items){
        try{
          await executor(item);
          done++;
        }catch(err){
          item.attempts=Number(item.attempts||0)+1;
          item.lastError=String(err?.message||err||"");
          item.lastAttemptAt=new Date().toISOString();
          next.push(item);
          if(transient(err))break;
        }
      }
      if(next.length<items.length-done){
        const processedIds=new Set(items.slice(0,done).map(x=>x.id));
        for(const x of items)if(!processedIds.has(x.id)&&!next.some(y=>y.id===x.id))next.push(x);
      }
      write(next);
      if(next.length)window.ESTA_PROJECT_STORE?.setStatus?.("queued",next.length+" mục chờ đồng bộ");
      else if(done)window.ESTA_PROJECT_STORE?.setStatus?.("synced","Đã đồng bộ hàng đợi");
      return {flushed:done,remaining:next.length};
    }finally{flushing=false}
  }
  function configure(fn){executor=fn;setTimeout(flush,0)}
  window.addEventListener("online",()=>setTimeout(flush,250));
  window.addEventListener("focus",()=>{if(navigator.onLine)setTimeout(flush,150)});
  setInterval(()=>{if(navigator.onLine&&read().length)flush()},15000);

  window.ESTA_SYNC_QUEUE=Object.freeze({
    enqueue,flush,read,count:()=>read().length,transient,configure,
    subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
  });
})();