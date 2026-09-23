import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={
 "Access-Control-Allow-Origin":"*",
 "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
 "Access-Control-Allow-Methods":"POST, OPTIONS"
};

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const url=Deno.env.get("SUPABASE_URL")!;
  const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
  const jwt=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
  if(!jwt)return json({error:"Unauthorized"},401);
  const {data:userData,error:userErr}=await admin.auth.getUser(jwt);
  if(userErr||!userData.user)return json({error:"Unauthorized"},401);
  const uid=userData.user.id;
  const body=await req.json();
  const action=String(body.action||"get");
  const buildingId=String(body.building_id||"").trim();
  if(!buildingId)return json({error:"Thiếu mã dự án"},400);

  const {data:profile}=await admin.from("profiles").select("id,is_admin,active,deleted_at").eq("id",uid).single();
  if(!profile||profile.active===false||profile.deleted_at)return json({error:"Forbidden"},403);
  const {data:building}=await admin.from("buildings").select("id,name,deleted_at").eq("id",buildingId).single();
  if(!building||building.deleted_at)return json({error:"Dự án không tồn tại hoặc đang ở Thùng rác"},404);

  let canRead=profile.is_admin===true,canWrite=profile.is_admin===true;
  if(!profile.is_admin){
    const {data:member}=await admin.from("building_members").select("role").eq("user_id",uid).eq("building_id",buildingId).maybeSingle();
    canRead=!!member;canWrite=member?.role==="editor";
  }
  if(!canRead)return json({error:"Không có quyền truy cập dự án"},403);
  if(action!=="get"&&!canWrite)return json({error:"Tài khoản chỉ có quyền xem"},403);

  const current=await readSnapshot(admin,buildingId);
  if(action==="get")return json({ok:true,snapshot:current});

  let tasks=Array.isArray(current.tasks)?current.tasks:[];
  let energy=Array.isArray(current.energy)?current.energy:[];

  if(action==="merge_snapshot"){
    tasks=mergeRows(tasks,Array.isArray(body.tasks)?body.tasks:[]);
    energy=mergeRows(energy,Array.isArray(body.energy)?body.energy:[]);
  }else if(action==="upsert_task"){
    if(!body.item||body.item.id===undefined)return json({error:"Thiếu dữ liệu công việc"},400);
    tasks=mergeRows(tasks,[body.item]);
  }else if(action==="append_task_images"){
    const id=String(body.id);
    const refs=Array.isArray(body.images)?body.images.filter((x:any)=>typeof x==="string"&&x):[];
    let found=false;
    tasks=tasks.map((x:any)=>{
      if(String(x?.id)!==id)return x;
      found=true;
      const existing=Array.isArray(x.imgs)?x.imgs:[];
      const imgs=[...new Set([...existing,...refs])];
      return {...x,imgs,i:imgs.length};
    });
    if(!found)return json({error:"Không tìm thấy công việc để gắn hình"},404);
  }else if(action==="delete_task"){
    const id=String(body.id);
    tasks=tasks.filter((x:any)=>String(x?.id)!==id);
  }else if(action==="upsert_energy"){
    if(!body.item||body.item.id===undefined)return json({error:"Thiếu dữ liệu chỉ số"},400);
    energy=mergeRows(energy,[body.item]);
  }else if(action==="delete_energy"){
    const id=String(body.id);
    energy=energy.filter((x:any)=>String(x?.id)!==id);
  }else{
    return json({error:"Action không hợp lệ"},400);
  }

  const stamp=new Date().toISOString();
  const {error:saveErr}=await admin.from("project_snapshots").upsert({
    building_id:buildingId,tasks,energy,updated_by:uid,updated_at:stamp
  },{onConflict:"building_id"});
  if(saveErr)return json({error:saveErr.message},400);
  return json({ok:true,updated_at:stamp,task_count:tasks.length,energy_count:energy.length});
 }catch(e){
  return json({error:(e as Error)?.message||"Server error"},500);
 }
});

async function readSnapshot(admin:any,buildingId:string){
 const {data,error}=await admin.from("project_snapshots").select("building_id,tasks,energy,updated_at").eq("building_id",buildingId).maybeSingle();
 if(error)throw error;
 return data||{building_id:buildingId,tasks:[],energy:[],updated_at:null};
}
function mergeRows(base:any[],incoming:any[]){
 const map=new Map<string,any>();
 for(const x of base||[])if(x&&x.id!==undefined)map.set(String(x.id),x);
 for(const x of incoming||[])if(x&&x.id!==undefined)map.set(String(x.id),x);
 return [...map.values()];
}
function json(data:unknown,status=200){
 return new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json; charset=utf-8"}});
}