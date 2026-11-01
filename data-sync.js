/* Successful-write notifications only. No records, tokens or credentials are broadcast. */
(()=>{
 "use strict";
 const versions=new Map();
 const source=typeof crypto?.randomUUID==='function'?crypto.randomUUID():String(Math.random());
 let channel;
 const key=id=>String(id||'*');
 const version=id=>(versions.get(key(id))||0)+(versions.get('*')||0);
 function deliver(detail,remote=false){
  const buildingId=key(detail.buildingId),tables=[...new Set((detail.tables||[]).filter(x=>typeof x==='string'))];
  if(!tables.length)return;
  versions.set(buildingId,(versions.get(buildingId)||0)+1);
  window.dispatchEvent(new CustomEvent('esta:data-changed',{detail:{buildingId,tables,remote}}));
 }
 try{if(typeof BroadcastChannel==='function'){channel=new BroadcastChannel('esta-data-changes-v1');channel.onmessage=e=>{if(e.data?.source!==source&&Array.isArray(e.data?.tables))deliver(e.data,true)}}}catch(_){}
 function changed(detail){
  deliver(detail);
  try{channel?.postMessage({source,buildingId:key(detail.buildingId),tables:detail.tables})}catch(_){}
 }
 function requestSucceeded(path,method,body,defaultBuilding){
  method=String(method||'GET').toUpperCase();
  if(!['POST','PATCH','PUT','DELETE'].includes(method))return;
  const match=String(path).match(/^\/rest\/v1\/([a-zA-Z0-9_]+)(?:\?|$)/);
  let tables=match&&match[1]!=="rpc"?[match[1]]:[];
  if(String(path).split('?')[0]==='/functions/v1/project-sync'){
   const action=String(body?.action||'');
   if(['get','version','list'].includes(action))return;
   tables=action.includes('energy')?['energy']:action.includes('task')?['tasks']:['tasks','energy'];
  }
  if(!tables.length)return; // Auth and read-only RPCs must not invalidate data.
  const params=new URLSearchParams(String(path).split('?')[1]||'');
  const filtered=params.get('building_id');
  const row=Array.isArray(body)?body[0]:body;
  const buildingId=row?.building_id||(filtered?.startsWith('eq.')?filtered.slice(3):defaultBuilding)||'*';
  changed({buildingId,tables});
 }
 window.ESTADataSync={version,changed,requestSucceeded};
})();
