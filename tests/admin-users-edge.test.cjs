const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {stripTypeScriptTypes} = require('node:module');

(async () => {
  const source = fs.readFileSync(path.join(__dirname, '../supabase/functions/admin-users/index.ts'), 'utf8')
    .replace(/^import .*;\s*$/gm, '');
  let handler;
  const userId = '00000000-0000-4000-8000-000000000123';
  let callerAdmin = true, callerActive = true, validToken = true, rpcError = null;
  const rpcCalls = [], writes = [];
  const client = {
    auth: {getUser: async () => ({data:{user:validToken ? {id:userId} : null}, error:validToken ? null : {message:'Invalid'}}),
      admin: {createUser:async () => ({data:{user:{id:userId}}, error:null}), deleteUser:async () => ({error:null})}},
    from(table) {
      const query = {select(){return this;}, eq(){return this;}, is(){return this;}, in(){return this;},
        update(body){writes.push({table,body});return this;},
        delete(){throw new Error('Memberships must not be deleted outside the atomic RPC');},
        single:async () => ({data:{id:userId,is_admin:callerAdmin,active:callerActive},error:null}),
        then(resolve, reject) {return Promise.resolve({data:[],count:2,error:null}).then(resolve,reject);}};
      return query;
    },
    rpc:async (name, args) => {rpcCalls.push({name,args});return {data:args.p_memberships,error:rpcError};}
  };
  vm.runInNewContext(stripTypeScriptTypes(source), {
    createClient:() => client, Request, Response, crypto,
    Deno:{env:{get:() => 'server-only-test'}, serve:fn => {handler=fn;}}
  });
  const call = async (body, authorization='Bearer test-token') => handler(new Request('https://example.test/admin-users', {
    method:'POST', headers:{'Content-Type':'application/json', ...(authorization ? {Authorization:authorization} : {})},body:JSON.stringify(body)
  }));
  const body = {action:'set_buildings',user_id:userId,memberships:[{building_id:'62THL',role:'editor'},{building_id:'68PĐL',role:'viewer'}]};
  assert.equal((await call(body, '')).status, 401);
  validToken=false; assert.equal((await call(body)).status, 401); validToken=true;
  callerAdmin=false; assert.equal((await call(body)).status, 403); callerAdmin=true;
  callerActive=false; assert.equal((await call(body)).status, 403); callerActive=true;
  assert.equal(rpcCalls.length, 0);
  assert.equal((await call({...body,user_id:'invalid-id'})).status, 400);
  assert.equal((await call(body)).status, 200);
  assert.equal(rpcCalls[0].name, 'admin_set_technical_projects');
  assert.deepEqual(JSON.parse(JSON.stringify(rpcCalls[0].args.p_memberships)), body.memberships);
  assert.equal(writes.length, 0);
  rpcError={message:'Invalid project: grants unchanged'};
  const failed = await call(body); assert.equal(failed.status,400); assert.match((await failed.json()).error,/grants unchanged/); rpcError=null;
  const legacy = await call({action:'set_buildings',user_id:userId,building_ids:['62THL','68PĐL','62THL'],role:'viewer'});
  assert.equal(legacy.status,200);
  assert.deepEqual(JSON.parse(JSON.stringify(rpcCalls.at(-1).args.p_memberships)), [{building_id:'62THL',role:'viewer'},{building_id:'68PĐL',role:'viewer'}]);
  assert.equal((await call({action:'create',username:'test-only',password:'test-only-password',display_name:'Test',building_ids:['62THL','68PĐL','62THL'],role:'editor'})).status,200);
  assert.equal(rpcCalls.at(-1).args.p_memberships.length, 2);
  console.log('PASS: edge authentication, Admin-only access, atomic RPC, per-project roles, create deduplication and legacy callers');
})().catch(error => {console.error(error);process.exit(1);});
