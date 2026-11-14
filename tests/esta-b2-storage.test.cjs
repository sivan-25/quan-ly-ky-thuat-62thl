"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const handler = require("../api/b2-media.js");

function mockResponse(){
  return {
    statusCode:200, headers:{}, body:"",
    setHeader(k,v){this.headers[k.toLowerCase()]=v},
    end(data){this.body=data}
  };
}
async function call(method,url,options={}){
  const req = {
    method,url,
    headers:{
      authorization:options.auth===false?"":"Bearer test-supabase-session",
      "content-type":"image/jpeg",
      "content-length":options.body?String(options.body.length):"0"
    },
    body:options.body
  };
  const res=mockResponse();
  await handler(req,res);
  let json;
  try{json=JSON.parse(res.body)}catch(_){}
  return {status:res.statusCode,body:json,raw:res.body,headers:res.headers};
}

test("disabled B2 remains opt-in and does not expose any keys",async()=>{
  const before=process.env.ESTA_B2_ENABLED;
  process.env.ESTA_B2_ENABLED="false";
  try{
    const r=await call("GET","/api/b2-media?status=1", {auth:false});
    assert.equal(r.status,200);
    assert.deepEqual(r.body,{enabled:false,provider:"supabase"});
    const denied=await call("POST","/api/b2-media?buildingId=130HH&kind=tasks&recordId=1",
      {body:Buffer.from([0xff,0xd8,0xff])});
    assert.equal(denied.status,503);
  }finally{
    if(before===undefined)delete process.env.ESTA_B2_ENABLED;
    else process.env.ESTA_B2_ENABLED=before;
  }
});

test("private B2 upload requires Supabase project edit permission",async()=>{
  const keys=["ESTA_B2_ENABLED","ESTA_B2_REGION","ESTA_B2_BUCKET","ESTA_B2_KEY_ID","ESTA_B2_APPLICATION_KEY"];
  const old=Object.fromEntries(keys.map(k=>[k,process.env[k]])),originalFetch=global.fetch;
  Object.assign(process.env,{
    ESTA_B2_ENABLED:"true",ESTA_B2_REGION:"us-west-004",
    ESTA_B2_BUCKET:"esta-photos-test",ESTA_B2_KEY_ID:"test-key-id",
    ESTA_B2_APPLICATION_KEY:"test-secret-not-real"
  });
  let writeCount=0,viewer=true;
  global.fetch=async (url,request={})=>{
    const p=String(url);
    const body=(value,status=200)=>({ok:status<300,status,json:async()=>value});
    if(p.includes("/auth/v1/user"))return body({id:"user-1"});
    if(p.includes("/rest/v1/profiles"))return body([{id:"user-1",is_admin:false,active:true}]);
    if(p.includes("/rest/v1/buildings"))return body([{id:"130HH"}]);
    if(p.includes("/rest/v1/building_members"))return body([{role:viewer?"viewer":"editor"}]);
    if(p.startsWith("https://s3.us-west-004.backblazeb2.com/")){
      writeCount++;
      assert.match(request.headers.Authorization,/^AWS4-HMAC-SHA256/);
      assert.match(p,/\/esta-photos-test\/b-3133304848\/tasks\/1\//);
      return body({},200);
    }
    throw Error("Unexpected request: "+p);
  };
  try{
    const jpeg=Buffer.from([0xff,0xd8,0xff,0xd9]);
    assert.equal((await call("POST","/api/b2-media?buildingId=130HH&kind=tasks&recordId=1",
      {auth:false,body:jpeg})).status,401);
    assert.equal((await call("POST","/api/b2-media?buildingId=130HH&kind=tasks&recordId=1",
      {body:jpeg})).status,403);
    assert.equal(writeCount,0);
    viewer=false;
    const result=await call("POST","/api/b2-media?buildingId=130HH&kind=tasks&recordId=1",
      {body:jpeg});
    assert.equal(result.status,201);
    assert.match(result.body.ref,/^b2:b-3133304848\/tasks\/1\/.+\.jpg$/);
    assert.equal(writeCount,1);
    const badPath=await call("GET","/api/b2-media?path=other-building/task/1.jpg");
    assert.equal(badPath.status,400);
  }finally{
    global.fetch=originalFetch;
    for(const k of keys){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k]}
  }
});
