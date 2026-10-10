'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const authSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
const adminSource=fs.readFileSync(path.join(root,'command-center.js'),'utf8');

function excerpt(source,from,to){
 const start=source.indexOf(from),end=source.indexOf(to,start+from.length);
 assert.ok(start>=0&&end>start,'Found production function: '+from);
 return source.slice(start,end);
}
const authCode=excerpt(authSource,'async function restoreCentral(){','function homeInitials(');
function authFixture(saved,refreshError=false){
 const calls=[],items=new Map([['esta_central_session',JSON.stringify(saved)]]);
 const mock={
  localStorage:{getItem:k=>items.get(k)||null,setItem:(k,v)=>items.set(k,v),removeItem:k=>items.delete(k)},
  sbFetch:async(route,{method,body}={})=>{
   calls.push({route,method,body});
   if(refreshError)throw Error('fixture refresh failure');
   return {access_token:'new-token',refresh_token:'new-refresh',expires_at:Math.floor(Date.now()/1000)+3600};
  },
  loadCentralAccount:async token=>{calls.push({route:'loadCentralAccount',token});return {username:'kt',is_admin:false}},
  Date,Math,console
 };
 vm.createContext(mock);vm.runInContext(authCode,mock);
 return {mock,calls,items};
}
(async()=>{
 const now=Math.floor(Date.now()/1000);
 const near=authFixture({access_token:'expired-token',refresh_token:'old-refresh',expires_at:now-15});
 const result=await near.mock.restoreCentral();
 assert.equal(result.session.access_token,'new-token','preflight refresh is used for account lookup');
 assert.deepEqual(near.calls.map(c=>c.route),['/auth/v1/token?grant_type=refresh_token','loadCentralAccount']);
 assert.equal(near.calls[1].token,'new-token','no wasted expired-token account lookup');
 assert.equal(JSON.parse(near.items.get('esta_central_session')).access_token,'new-token');

 const fresh=authFixture({access_token:'good-token',refresh_token:'keep-refresh',expires_at:now+1000});
 const valid=await fresh.mock.restoreCentral();
 assert.equal(valid.session.access_token,'good-token');
 assert.deepEqual(fresh.calls.map(c=>c.route),['loadCentralAccount'],'unexpired sessions stay untouched');

 const unknown=authFixture({access_token:'unknown-expiry',refresh_token:'keep-refresh',expires_at:0});
 await unknown.mock.restoreCentral();
 assert.deepEqual(unknown.calls.map(c=>c.route),['loadCentralAccount'],'unknown expiry keeps legacy behavior');

 const failure=authFixture({access_token:'near-expiry',refresh_token:'refresh-token',expires_at:now-20},true);
 const restored=await failure.mock.restoreCentral();
 assert.equal(restored.session.access_token,'near-expiry','if proactive refresh fails, original valid-token lookup still works');
 assert.deepEqual(failure.calls.map(c=>c.route),['/auth/v1/token?grant_type=refresh_token','loadCentralAccount']);

 const none=authFixture(null);
 assert.equal(await none.mock.restoreCentral(),null,'no stored token means show original login page');
 assert.equal(none.calls.length,0);

 // Isolated source-derived Admin stock calculations: exact arithmetic, start-date
 // filtering and duplicates in the original transaction list are preserved.
 const adminCode=excerpt(adminSource,'function adminMaterialTransactionIndex(row){','function alerts(){');
 const inventory={todayC:()=> '2026-10-10',Map,String,Number,console};
 vm.createContext(inventory);vm.runInContext(adminCode,inventory);
 const materials=Array.from({length:90},(_,i)=>({id:String(i),opening_qty:i*2,
  tracking_start_date:i%2?'2026-03-01':'2026-09-01'}));
 const transactions=Array.from({length:1800},(_,i)=>({
  material_id:i%90,tx_type:i%3?'in':'out',qty:(i%7)+1,
  tx_date:i%6===0?'2026-01-01':i%5===0?'2026-12-01':'2026-10-03'
 }));
 // Include a duplicate material ID with a different date window: no behavior change.
 materials.push({id:materials[0].id,opening_qty:10,tracking_start_date:'2026-10-09'});
 let iterations=0;
 const tracked={...transactions,[Symbol.iterator]:function*(){iterations++;yield* transactions}};
 const row={ops:{inventory_material_transactions:tracked}};
 const grouped=inventory.adminMaterialTransactionIndex(row);
 assert.equal(iterations,1,'one traversal groups all material transactions');
 function originalStock(m){
  let q=Number(m?.opening_qty||0);
  const start=String(m?.tracking_start_date||m?.created_at||'2026-10-10').slice(0,10);
  return transactions.filter(x=>String(x.material_id)===String(m?.id)).reduce((total,x)=>{
   const date=String(x.tx_date||'').slice(0,10);
   return date&&date>=start&&date<='2026-10-10'
    ? total+(x.tx_type==='in'?1:-1)*Number(x.qty||0):total;
  },q);
 }
 for(const m of materials){
  assert.equal(inventory.stockOf(row,m,grouped),originalStock(m),'indexed stock matches original for material '+m.id);
 }
 assert.equal(iterations,1,'pre-indexed lookups never rescan the full array');
 assert.equal(inventory.stockOf(row,materials[0]),originalStock(materials[0]),'legacy callers without index still work');

 // Dashboard data-cache TTL must use completed request time, not an old
 // server generated_at timestamp; explicit Refresh still bypasses cache.
 const adminLoad=excerpt(adminSource,'async function loadCenter(force=false){','async function openEnergy(');
 const refresh={textContent:'Làm mới',disabled:false};
 const rootEl={classList:{add(){},remove(){}},setAttribute(){},removeAttribute(){},querySelector(){return refresh}};
 const state={textContent:'',classList:{add(){},remove(){}}};
 const currentAccount={is_admin:true,buildings:[]};
 const ctx={
  rows:[],activity:[],personalTasks:[],loading:false,lastUpdated:'',lastFetchedAt:0,
  dataAccount:null,currentAccount,centralSession:{access_token:'MOCK'},
  globalScope:()=>true,ensureRoot:()=>rootEl,syncAdminHeader:()=>{},
  renderCenter:()=>{ctx.rendered++},rendered:0,
  $c:()=>state,console:{warn:()=>{}},Date,
  sbFetch:async(url)=>{ctx.requests.push(url);
   if(url.includes('admin_personal_tasks'))return [];
   return {rows:[],activity:[],generated_at:'2020-01-01T00:00:00.000Z'};
  },requests:[]
 };
 vm.createContext(ctx);vm.runInContext(adminLoad,ctx);
 await ctx.loadCenter(false);await ctx.loadCenter(false);
 assert.equal(ctx.requests.length,2,'Admin re-entry within 30s reuses last successful response');
 await ctx.loadCenter(true);
 assert.equal(ctx.requests.length,4,'explicit Refresh still fetches all Admin data');
 assert.equal(ctx.lastUpdated,'2020-01-01T00:00:00.000Z','server update timestamp remains displayed');
 assert.ok(ctx.lastFetchedAt>0,'local cache age tracks actual fetch');
 console.log('PASS Admin/login optimization: expired-session refresh, valid-session, fallback, cache TTL, stock index and identical quantities; offline fixtures only.');
})().catch(e=>{console.error(e);process.exitCode=1});
