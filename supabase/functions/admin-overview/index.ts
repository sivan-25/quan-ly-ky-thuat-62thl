import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS"
};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json; charset=utf-8"}});

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(req.method!=="POST")return json({error:"Method not allowed"},405);
  try{
    const url=Deno.env.get("SUPABASE_URL")!;
    const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin=createClient(url,service,{auth:{autoRefreshToken:false,persistSession:false}});
    const jwt=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
    if(!jwt)return json({error:"Unauthorized"},401);
    const {data:userData,error:userErr}=await admin.auth.getUser(jwt);
    if(userErr||!userData.user)return json({error:"Unauthorized"},401);
    const uid=userData.user.id;
    const {data:profile}=await admin.from("profiles").select("id,is_admin,active,deleted_at").eq("id",uid).single();
    if(!profile||profile.active===false||profile.deleted_at||profile.is_admin!==true)return json({error:"Forbidden"},403);

    const {data:buildings,error:bErr}=await admin.from("buildings").select("id,name,deleted_at").is("deleted_at",null).order("id");
    if(bErr)throw bErr;
    const ids=(buildings||[]).map((b:any)=>b.id);
    let snapshots:any[]=[];
    if(ids.length){
      const {data:s,error:sErr}=await admin.from("project_snapshots").select("building_id,tasks,energy,updated_at").in("building_id",ids);
      if(sErr)throw sErr;
      snapshots=s||[];
    }
    const map=new Map(snapshots.map((s:any)=>[s.building_id,s]));
    const rows=(buildings||[]).map((b:any)=>{
      const s:any=map.get(b.id)||{tasks:[],energy:[],updated_at:null};
      return {building:b,snapshot:{building_id:b.id,tasks:Array.isArray(s.tasks)?s.tasks:[],energy:Array.isArray(s.energy)?s.energy:[],updated_at:s.updated_at||null}};
    });
    return json({ok:true,rows});
  }catch(e){
    return json({error:(e as Error)?.message||"Server error"},500);
  }
});