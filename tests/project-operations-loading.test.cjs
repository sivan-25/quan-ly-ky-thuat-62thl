'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../demo-lab.js'),'utf8');
const start=source.indexOf('const demoLoadsInFlight=new Map();');
const end=source.indexOf('function demoHideSpecialPages(){',start);
assert.ok(start>=0&&end>start,'real project loader exists');

const calls=[],warnings=[];
const sandbox={
 currentBuilding:{id:'62THL'},
 projectOpenSeq:1,
 active:true,
 demoIs:()=>sandbox.active,
 demoQs:value=>encodeURIComponent(value),
 demoRest:(table,query)=>new Promise((resolve,reject)=>calls.push({table,query,resolve,reject})),
 console:{warn:(...args)=>warnings.push(args)}
};
vm.createContext(sandbox);
vm.runInContext(`let demoCache={loaded:false,buildingId:"",incidents:[],inspections:[],documents:[],reports:[],assets:[],contractors:[],materials:[],materialTx:[]};`+source.slice(start,end),sandbox);
const load=sandbox.demoLoad;
const getCache=()=>vm.runInContext('demoCache',sandbox);
const setUnloaded=()=>vm.runInContext('demoCache.loaded=false',sandbox);
function finish(from,to,label){
 for(let i=from;i<to;i++)calls[i].resolve([{label,table:calls[i].table}]);
}

(async()=>{
 // Several UI entry points before the first response: only eight requests, not sixteen.
 const first=load(),joined=load();
 assert.equal(calls.length,8,'simultaneous non-forced loads share one 8-table fetch');
 finish(0,8,'v1');
 await Promise.all([first,joined]);
 assert.equal(getCache().buildingId,'62THL');
 assert.equal(getCache().incidents[0].label,'v1');
 assert.equal(getCache().materials[0].label,'v1');

 // Cached reads do not issue extra network requests.
 await load();
 assert.equal(calls.length,8);

 // Explicit forced reload must still fetch fresh data, and its result wins.
 const oldForce=load(true),newForce=load(true);
 assert.equal(calls.length,24,'explicit refresh still runs independently');
 const queued=load();
 assert.equal(calls.length,24,'non-forced callers reuse latest in-flight refresh');
 finish(16,24,'latest');
 await newForce;
 finish(8,16,'stale');
 await Promise.all([oldForce,queued]);
 assert.equal(getCache().incidents[0].label,'latest','stale reload cannot overwrite newer data');

 // Reopen the first project before its previous slow response has returned.
 setUnloaded();
 const staleA=load();
 assert.equal(calls.length,32);
 sandbox.currentBuilding={id:'130HH'};
 sandbox.projectOpenSeq=2;
 const b=load();
 assert.equal(calls.length,40);
 sandbox.currentBuilding={id:'62THL'};
 sandbox.projectOpenSeq=3;
 const reopened=load();
 assert.equal(calls.length,48,'a new visit must not be blocked by the old visit');
 finish(24,32,'wrong-old-a');
 finish(32,40,'wrong-b');
 await Promise.all([staleA,b]);
 assert.equal(getCache().incidents[0].label,'latest','late responses must be ignored');
 finish(40,48,'reopened-a');
 await reopened;
 assert.equal(getCache().incidents[0].label,'reopened-a');
 assert.equal(getCache().buildingId,'62THL');

 // If a request fails, subsequent loads can retry normally.
 setUnloaded();
 const failing=load();
 assert.equal(calls.length,56);
 calls[48].reject(new Error('mock failure'));
 finish(49,56,'ignored');
 await failing;
 assert.equal(warnings.length,1,'one recoverable loader warning');
 const retry=load();
 assert.equal(calls.length,64,'failed batch releases in-flight key');
 finish(56,64,'recovered');
 await retry;
 assert.equal(getCache().incidents[0].label,'recovered');

 sandbox.active=false;
 await load();
 assert.equal(calls.length,64,'inactive app should not fetch');

 console.log('PASS: 8-table project load coalescing, explicit reload, cache, stale responses, A-B-A navigation, retry and inactive guard; no live Supabase.');
})().catch(error=>{console.error(error);process.exitCode=1;});
