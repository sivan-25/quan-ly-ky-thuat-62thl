'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');

// Source-derived network-request counts with mock API. No actual Supabase access.
const base=path.join(__dirname,'../baseline/demo-lab.js');
const next=path.join(__dirname,'../demo-lab.js');
function run(file,optimized){
 const src=fs.readFileSync(file,'utf8');
 const start=src.indexOf(optimized?'const demoLoadsInFlight=new Map();':'async function demoLoad(force=false){');
 const end=src.indexOf('function demoHideSpecialPages(){',start);
 assert.ok(start>=0&&end>start,'project loader code present '+file);
 const calls=[];
 const sandbox={
  currentBuilding:{id:'62THL'},projectOpenSeq:1,
  demoIs:()=>true,demoQs:x=>encodeURIComponent(x),
  demoRest:(table,query)=>new Promise(resolve=>calls.push({table,query,resolve})),
  console:{warn:()=>{}}
 };
 vm.createContext(sandbox);
 vm.runInContext('let demoCache={loaded:false,buildingId:"",incidents:[],inspections:[],documents:[],reports:[],assets:[],contractors:[],materials:[],materialTx:[]};'+src.slice(start,end),sandbox);
 return (async()=>{
  const a=sandbox.demoLoad(),b=sandbox.demoLoad();
  const immediate=calls.length;
  calls.forEach(c=>c.resolve([]));
  await Promise.all([a,b]);
  return {file:path.basename(path.dirname(file)),simultaneousUIReads:2,remoteTableRequests:immediate};
 })();
}
(async()=>{
 const baseline=await run(base,false),optimized=await run(next,true);
 assert.equal(baseline.remoteTableRequests,16,'original should issue two eight-table batches');
 assert.equal(optimized.remoteTableRequests,8,'new should reuse one eight-table batch');
 const output={environment:'isolated Node VM fixture, same code excerpt, no network',baseline,optimized,
  avoidedRequests:baseline.remoteTableRequests-optimized.remoteTableRequests};
 fs.mkdirSync('visual-artifacts',{recursive:true});
 fs.writeFileSync('visual-artifacts/request-count-comparison.json',JSON.stringify(output,null,2));
 console.log('PASS before/after duplicate operation queries: '+JSON.stringify(output));
})().catch(err=>{console.error(err);process.exitCode=1;});
