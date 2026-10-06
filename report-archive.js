(() => {
  "use strict";
  const BUCKET="report-files";

  const safe=(v)=>String(v||"report").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||"report";
  async function checksum(blob){
    if(!crypto?.subtle)return "";
    const buf=await blob.arrayBuffer();
    const hash=await crypto.subtle.digest("SHA-256",buf);
    return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");
  }
  async function nextVersion(meta){
    const q=[
      "select=version",
      "building_id=eq."+encodeURIComponent(meta.buildingId),
      "report_type=eq."+encodeURIComponent(meta.reportType),
      meta.periodFrom?"period_from=eq."+encodeURIComponent(meta.periodFrom):"period_from=is.null",
      meta.periodTo?"period_to=eq."+encodeURIComponent(meta.periodTo):"period_to=is.null",
      "order=version.desc",
      "limit=1"
    ].join("&");
    const rows=await sbFetch("/rest/v1/report_registry?"+q,{token:centralSession?.access_token});
    return Math.max(1,Number(rows?.[0]?.version||0)+1);
  }
  async function upload(blob,path){
    const res=await centralAuthFetch(SB_URL+"/storage/v1/object/"+BUCKET+"/"+mediaPathUrl(path),{
      method:"POST",
      headers:{"Content-Type":"application/pdf","x-upsert":"false"},
      body:blob
    });
    if(!res.ok){
      let d={};try{d=await res.json()}catch(_){}
      const err=new Error(d?.message||d?.error||"Không thể lưu PDF vào kho báo cáo");
      err.status=res.status;throw err;
    }
    return "storage:"+BUCKET+":"+path;
  }
  function splitRef(ref){
    const raw=String(ref||"");
    const prefix="storage:"+BUCKET+":";
    return raw.startsWith(prefix)?raw.slice(prefix.length):"";
  }
  async function archivePdf({blob,buildingId,filename,reportType,periodLabel,periodFrom,periodTo,createdBy}){
    if(!blob?.size)throw new Error("PDF rỗng");
    const version=await nextVersion({buildingId,reportType,periodFrom,periodTo});
    const stamp=new Date().toISOString().replace(/[:.]/g,"-");
    const year=String(new Date().getFullYear());
    const path=storageProjectSegment(buildingId)+"/reports/"+year+"/"+safe(filename.replace(/\.pdf$/i,""))+"-v"+version+"-"+stamp+".pdf";
    const [fileRef,sha]=await Promise.all([upload(blob,path),checksum(blob)]);
    const record={
      building_id:buildingId,
      report_code:"BC-"+buildingId+"-"+Date.now().toString(36).toUpperCase(),
      report_type:reportType,
      period_label:periodLabel||"",
      period_from:periodFrom||null,
      period_to:periodTo||null,
      file_name:filename,
      file_ref:fileRef,
      file_size:blob.size,
      version,
      checksum:sha,
      mime_type:"application/pdf",
      created_by:createdBy||null
    };
    try{
      const inserted=await sbFetch("/rest/v1/report_registry?select=*",{
        method:"POST",token:centralSession?.access_token,body:record
      });
      return {record:Array.isArray(inserted)&&inserted[0]?inserted[0]:record,version,fileRef};
    }catch(err){
      try{
        await centralAuthFetch(SB_URL+"/storage/v1/object/"+BUCKET+"/"+mediaPathUrl(path),{method:"DELETE"});
      }catch(_){}
      throw err;
    }
  }
  async function download(ref,filename="ESTA-report.pdf"){
    const path=splitRef(ref);if(!path)throw new Error("Tham chiếu PDF không hợp lệ");
    const res=await centralAuthFetch(SB_URL+"/storage/v1/object/authenticated/"+BUCKET+"/"+mediaPathUrl(path));
    if(!res.ok)throw new Error("Không thể tải bản PDF lưu trữ");
    const blob=await res.blob(),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  window.ESTA_REPORT_ARCHIVE=Object.freeze({archivePdf,download,bucket:BUCKET});
})();