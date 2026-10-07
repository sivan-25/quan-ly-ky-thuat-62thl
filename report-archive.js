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
    if(!blob?.size||blob.type!=="application/pdf")throw new Error("PDF không hợp lệ");
    if(blob.size>50*1024*1024)throw new Error("PDF vượt quá giới hạn 50 MB");
    const sha=await checksum(blob);
    const id=crypto.randomUUID();
    const year=String(new Date().getFullYear());
    const path=storageProjectSegment(buildingId)+"/reports/"+year+"/"+safe(filename.replace(/\.pdf$/i,""))+"-"+id+".pdf";
    const fileRef=await upload(blob,path);
    const record={
      id,building_id:buildingId,report_code:"BC-"+buildingId+"-"+id,
      report_type:reportType,period_label:periodLabel||"",period_from:periodFrom||null,period_to:periodTo||null,
      file_name:filename,file_ref:fileRef,file_size:blob.size,version:1,checksum:sha,mime_type:"application/pdf",created_by:createdBy||null
    };
    try{
      for(let attempt=0;attempt<4;attempt++){
        record.version=await nextVersion({buildingId,reportType,periodFrom,periodTo});
        try{
          const inserted=await sbFetch("/rest/v1/report_registry?select=*",{
            method:"POST",token:centralSession?.access_token,body:record,prefer:"return=representation"
          });
          const saved=inserted?.[0]||record;
          return {record:saved,version:saved.version,fileRef};
        }catch(err){
          // Two users may export the same period simultaneously. The unique
          // database index chooses a winner; retry the metadata, not the PDF.
          if(err.code==="23505"&&attempt<3)continue;
          throw err;
        }
      }
    }catch(err){
      // A dropped response can follow a successful insert. Recover by its
      // unique ID before considering cleanup; never delete a committed PDF.
      try{
        const saved=await sbFetch("/rest/v1/report_registry?select=*&id=eq."+id,{token:centralSession?.access_token});
        if(saved?.[0])return {record:saved[0],version:saved[0].version,fileRef};
        if(Number(err.status)>=400&&Number(err.status)<500){
          await centralAuthFetch(SB_URL+"/storage/v1/object/"+BUCKET+"/"+mediaPathUrl(path),{method:"DELETE"});
        }
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