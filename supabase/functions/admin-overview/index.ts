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
    const SANDBOX_BUILDING_IDS=new Set(["NEW10"]);
    const liveBuildings=(buildings||[]).filter((b:any)=>!SANDBOX_BUILDING_IDS.has(String(b.id)));
    const ids=liveBuildings.map((b:any)=>b.id);
    if(!ids.length)return json({ok:true,rows:[]});

    const [
      snapshotsRes,
      incidentsRes,
      inspectionsRes,
      assetsRes,
      materialsRes,
      txRes,
      contractorJobsRes,
      peopleRes,
      historyRes,
      auditRes,
      profilesRes
    ]=await Promise.all([
      admin.from("project_snapshots").select("building_id,tasks,energy,updated_at").in("building_id",ids),
      admin.from("incidents").select("id,building_id,incident_code,detected_at,asset_id,area,severity,status,symptom,cause,solution,contractor_id,related_task_id,updated_at").in("building_id",ids),
      admin.from("inspections").select("id,building_id,inspection_code,template_name,inspection_date,period_label,asset_id,result_status,recommendation,related_task_ids,updated_at").in("building_id",ids),
      admin.from("maintenance_assets").select("id,building_id,code,name,system_type,location,frequency_days,last_service_date,next_due_date,assigned_to,status,note,updated_at").in("building_id",ids),
      admin.from("inventory_materials").select("id,building_id,code,name,unit,opening_qty,min_qty,tracking_start_date,note,updated_at").in("building_id",ids),
      admin.from("inventory_material_transactions").select("id,building_id,material_id,tx_date,tx_type,qty,performer,note,created_at").in("building_id",ids),
      admin.from("contractor_jobs").select("id,building_id,contractor_id,work_date,completed_date,work_content,status,source_task_id,updated_at").in("building_id",ids),
      admin.from("building_people").select("id,building_id,name").in("building_id",ids).order("name"),
      admin.from("project_snapshot_history").select("id,building_id,changed_by,saved_at,tasks,energy").in("building_id",ids).order("saved_at",{ascending:false}).limit(40),
      admin.from("audit_logs").select("id,building_id,actor_id,action,entity_type,entity_id,summary,metadata,created_at").in("building_id",ids).order("created_at",{ascending:false}).limit(100),
      admin.from("profiles").select("id,display_name,username").is("deleted_at",null)
    ]);

    const responses=[snapshotsRes,incidentsRes,inspectionsRes,assetsRes,materialsRes,txRes,contractorJobsRes,peopleRes,historyRes,auditRes,profilesRes];
    const failure=responses.find((x:any)=>x.error);
    if(failure?.error)throw failure.error;

    const snapshots=snapshotsRes.data||[];
    const snapMap=new Map(snapshots.map((s:any)=>[s.building_id,s]));
    const byBuilding=(rows:any[])=>{
      const map=new Map<string,any[]>();
      for(const row of rows||[]){
        const key=String(row.building_id||"");
        if(!map.has(key))map.set(key,[]);
        map.get(key)!.push(row);
      }
      return map;
    };
    const incidents=byBuilding(incidentsRes.data||[]);
    const inspections=byBuilding(inspectionsRes.data||[]);
    const assets=byBuilding(assetsRes.data||[]);
    const materials=byBuilding(materialsRes.data||[]);
    const tx=byBuilding(txRes.data||[]);
    const contractorJobs=byBuilding(contractorJobsRes.data||[]);
    const people=byBuilding(peopleRes.data||[]);

    const rows=liveBuildings.map((b:any)=>{
      const s:any=snapMap.get(b.id)||{tasks:[],energy:[],updated_at:null};
      return {
        building:b,
        snapshot:{
          building_id:b.id,
          tasks:Array.isArray(s.tasks)?s.tasks:[],
          energy:Array.isArray(s.energy)?s.energy:[],
          updated_at:s.updated_at||null
        },
        ops:{
          incidents:incidents.get(b.id)||[],
          inspections:inspections.get(b.id)||[],
          maintenance_assets:assets.get(b.id)||[],
          inventory_materials:materials.get(b.id)||[],
          inventory_material_transactions:tx.get(b.id)||[],
          contractor_jobs:contractorJobs.get(b.id)||[],
          people:people.get(b.id)||[]
        }
      };
    });
    const profileMap=new Map((profilesRes.data||[]).map((p:any)=>[p.id,p]));
    const auditRows=auditRes.data||[];
    const activity=auditRows.length?auditRows.map((h:any)=>{
      const p:any=profileMap.get(h.actor_id)||{};
      return {
        id:h.id,
        building_id:h.building_id,
        saved_at:h.created_at,
        changed_by:h.actor_id,
        actor:p.display_name||p.username||"Hệ thống",
        action:h.action,
        entity_type:h.entity_type,
        entity_id:h.entity_id,
        summary:h.summary||"",
        metadata:h.metadata||{}
      };
    }):(historyRes.data||[]).map((h:any)=>{
      const p:any=profileMap.get(h.changed_by)||{};
      return {
        id:h.id,
        building_id:h.building_id,
        saved_at:h.saved_at,
        changed_by:h.changed_by,
        actor:p.display_name||p.username||"Tài khoản dự án",
        action:"snapshot_update",
        entity_type:"snapshot",
        entity_id:null,
        summary:"Cập nhật dữ liệu dự án",
        metadata:{task_count:Array.isArray(h.tasks)?h.tasks.length:0,energy_count:Array.isArray(h.energy)?h.energy.length:0}
      };
    });
    return json({ok:true,rows,activity,generated_at:new Date().toISOString()});
  }catch(e){
    return json({error:(e as Error)?.message||"Server error"},500);
  }
});