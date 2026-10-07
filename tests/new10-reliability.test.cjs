const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const {webcrypto}=require('node:crypto');
const source=name=>fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8');
function runtime(file,extra={}){
  const memory=new Map();
  const ctx={console,crypto:webcrypto,Blob,TypeError,CustomEvent:class{},navigator:{onLine:true},
    currentAccount:{id:'account-a'},centralSession:{access_token:'fixture'},
    localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},
    setTimeout:()=>0,setInterval:()=>0,document:{querySelectorAll:()=>[],getElementById:()=>null},...extra};
  ctx.window=ctx;ctx.addEventListener=()=>{};ctx.dispatchEvent=()=>{};
  vm.createContext(ctx);vm.runInContext(source(file),ctx);return ctx;
}
const clone=x=>JSON.parse(JSON.stringify(x));

test('queue preserves items added while a request is in flight',async()=>{
  const c=runtime('sync-queue.js'),q=c.ESTA_SYNC_QUEUE;
  await q.enqueue('upsert_task',{item:{id:1,c:'first'}},'NEW10');
  let release,started;
  const began=new Promise(r=>started=r);
  q.configure(async()=>{started();await new Promise(r=>release=r);return {updated_at:'ok'}});
  const sending=q.flush();await began;
  await q.enqueue('upsert_task',{item:{id:2,c:'second'}},'NEW10');
  release();await sending;
  assert.equal(q.count(),1);assert.equal(q.read()[0].payload.item.id,2);
});
test('queue stops in order, does not replay successes, preserves delete before re-create',async()=>{
  const c=runtime('sync-queue.js'),q=c.ESTA_SYNC_QUEUE;
  for(const action of ['upsert_task','delete_task','upsert_task'])await q.enqueue(action,{id:1,item:{id:1}},'NEW10');
  const sent=[];
  q.configure(async item=>{sent.push(item.action);if(item.action==='delete_task')throw Object.assign(new Error('permission'),{status:403});return {ok:true}});
  await q.flush();assert.deepEqual(sent,['upsert_task','delete_task']);
  assert.deepEqual(clone(q.read().map(x=>x.action)),['delete_task','upsert_task']);
  await q.flush();assert.equal(sent.length,2);
  q.configure(async item=>{sent.push(item.action);return {ok:true}});
  await q.flush({retry:true});assert.equal(q.count(),0);
  assert.deepEqual(sent,['upsert_task','delete_task','delete_task','upsert_task']);
});
test('queue never replays data with a different account or no server acknowledgement',async()=>{
  const c=runtime('sync-queue.js'),q=c.ESTA_SYNC_QUEUE;
  await q.enqueue('upsert_task',{item:{id:1}},'NEW10');let calls=0;
  q.configure(async()=>{calls++;return null});c.currentAccount={id:'account-b'};
  await q.flush();assert.equal(calls,0);assert.equal(q.read().length,1);
  c.currentAccount={id:'account-a'};await q.flush();assert.equal(q.read().length,1);
});
test('pending edits and deletes survive a stale cloud snapshot',async()=>{
  const c=runtime('sync-queue.js'),q=c.ESTA_SYNC_QUEUE;
  await q.enqueue('upsert_task',{item:{id:1,c:'offline edit',imgs:[]}},'NEW10');
  await q.enqueue('append_task_images',{id:1,images:['photo']},'NEW10');
  await q.enqueue('delete_task',{id:2},'NEW10');
  const visible=q.overlay({tasks:[{id:1,c:'old'},{id:2,c:'deleted'}],energy:[]},'NEW10');
  assert.equal(visible.tasks.length,1);assert.equal(visible.tasks[0].c,'offline edit');assert.deepEqual(clone(visible.tasks[0].imgs),['photo']);
});
test('validation rejects impossible dates and empty numbers, accepts zero and leap day',()=>{
  const c=runtime('validation-core.js'),v=c.ESTA_VALIDATION;
  assert.equal(v.validDate('2026-02-31'),false);assert.equal(v.validDate('2026-02-29'),false);
  assert.equal(v.validDate('2028-02-29'),true);
  for(const value of ['', ' ',null,false])assert.equal(v.validate('energy',{date:'2026-10-07',value,performers:['QA']}).ok,false);
  assert.equal(v.validate('energy',{date:'2026-10-07',value:0,performers:['QA']}).ok,true);
});
test('PDF archive resolves version collision without uploading the file twice',async()=>{
  let latest=1,uploads=0,inserts=0;
  const c=runtime('report-archive.js',{
    SB_URL:'https://fixture.invalid',storageProjectSegment:()=> 'b-new10',mediaPathUrl:x=>x,
    centralAuthFetch:async()=>{uploads++;return {ok:true}},
    sbFetch:async(path,options={})=>{
      if(path.includes('select=version'))return [{version:latest}];
      if(options.method==='POST'){
        inserts++;if(inserts===1){latest=2;throw Object.assign(new Error('duplicate'),{code:'23505',status:409})}
        return [{...options.body}];
      }
      return [];
    }
  });
  const r=await c.ESTA_REPORT_ARCHIVE.archivePdf({blob:new Blob(['%PDF'],{type:'application/pdf'}),buildingId:'NEW10',filename:'test.pdf',reportType:'operations'});
  assert.equal(r.version,3);assert.equal(uploads,1);assert.equal(inserts,2);assert.equal(r.record.checksum.length,64);
});
test('PDF archive recovers a committed record after a lost response',async()=>{
  let saved,deletes=0;
  const c=runtime('report-archive.js',{
    SB_URL:'https://fixture.invalid',storageProjectSegment:()=> 'b-new10',mediaPathUrl:x=>x,
    centralAuthFetch:async(_url,opts)=>{if(opts?.method==='DELETE')deletes++;return {ok:true}},
    sbFetch:async(path,options={})=>{
      if(path.includes('select=version'))return [];
      if(options.method==='POST'){saved={...options.body};throw new TypeError('Failed to fetch')}
      return [saved];
    }
  });
  const r=await c.ESTA_REPORT_ARCHIVE.archivePdf({blob:new Blob(['%PDF'],{type:'application/pdf'}),buildingId:'NEW10',filename:'test.pdf',reportType:'operations'});
  assert.equal(r.record.id,saved.id);assert.equal(deletes,0);
});
