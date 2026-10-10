'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

// Exercise the real polling function without loading Supabase or touching live data.
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const start=source.indexOf('const projectSnapshotPollInFlight=new Set();');
const end=source.indexOf('setInterval(pollProjectSnapshot,5000);',start);
assert.ok(start>=0&&end>start,'Project polling source found');
const pending=[],applied=[],warnings=[];
const sandbox={
 centralSession:{access_token:'fixture-token'},
 currentBuilding:{id:'62THL'},
 projectOpenSeq:1,
 document:{hidden:false},
 $:()=>({classList:{contains:()=>true}}), // Admin page is hidden.
 projectSync:(action,payload,buildingId)=>new Promise((resolve,reject)=>pending.push({action,payload,buildingId,resolve,reject})),
 cloudVersionByBuilding:{},
 applyCloudSnapshot:(building,row)=>applied.push({id:building.id,row}),
 console:{warn:(...args)=>warnings.push(args)}
};
vm.createContext(sandbox);
vm.runInContext(source.slice(start,end),sandbox);

(async()=>{
 // A burst of tab focus and interval callbacks should send one read only.
 const a=sandbox.pollProjectSnapshot(),b=sandbox.pollProjectSnapshot();
 assert.equal(pending.length,1,'overlapping polls are coalesced');
 assert.equal(pending[0].buildingId,'62THL');
 pending[0].resolve({snapshot:{updated_at:'v1'}});
 await Promise.all([a,b]);
 assert.equal(applied.length,1);
 assert.equal(applied[0].id,'62THL');

 // After completion, subsequent polls must still work as before.
 const c=sandbox.pollProjectSnapshot();
 assert.equal(pending.length,2);
 pending[1].resolve({snapshot:{updated_at:'v1'}});
 await c;
 assert.equal(applied.length,2,'unchanged version behavior preserved without mutating production data');

 // A slow response for the previous project must be ignored after navigation.
 const old=sandbox.pollProjectSnapshot();
 assert.equal(pending.length,3);
 sandbox.currentBuilding={id:'130HH'};
 sandbox.projectOpenSeq=2;
 const fresh=sandbox.pollProjectSnapshot();
 assert.equal(pending.length,4,'different project is not blocked');
 assert.equal(pending[3].buildingId,'130HH');
 pending[2].resolve({snapshot:{updated_at:'wrong-project'}});
 await old;
 assert.equal(applied.length,2,'stale previous-project snapshot was not applied');
 pending[3].resolve({snapshot:{updated_at:'v2'}});
 await fresh;
 assert.equal(applied.length,3);
 assert.equal(applied[2].id,'130HH');

 // A rejected request must release the lock for future polling.
 const failed=sandbox.pollProjectSnapshot();
 assert.equal(pending.length,5);
 pending[4].reject(new Error('mocked network error'));
 await failed;
 assert.equal(warnings.length,1);
 const retried=sandbox.pollProjectSnapshot();
 assert.equal(pending.length,6,'poll can retry after error');
 pending[5].resolve({snapshot:{updated_at:'v2'}});
 await retried;

 // Hidden browser tab and visible Admin page skip project polling.
 sandbox.document.hidden=true;
 await sandbox.pollProjectSnapshot();
 assert.equal(pending.length,6);
 sandbox.document.hidden=false;
 sandbox.$=()=>({classList:{contains:()=>false}});
 await sandbox.pollProjectSnapshot();
 assert.equal(pending.length,6);

 console.log('PASS: one request per project in flight, cross-project safety, retry after failure, hidden/admin skip; Supabase mocked.');
})().catch(error=>{console.error(error);process.exitCode=1;});
