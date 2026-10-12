'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const js = f => fs.readFileSync(path.join(root, f), 'utf8');

async function policyFixture({ios=false,initial='prompt',supported=true}={}) {
  let state=initial, queryCount=0, captureRequests=0;
  let permStatus;
  const events={};
  const navigator={
    userAgent:ios?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)':'Mozilla/5.0 (Linux; Android 14)',
    platform:ios?'iPhone':'Linux armv8l',
    maxTouchPoints:ios?5:1,
    mediaDevices:{getUserMedia:()=>{captureRequests++;throw Error('Unexpected getUserMedia call')}},
    permissions:supported?{query:async ({name})=>{
      assert.equal(name,'camera');
      queryCount++;
      permStatus={state, onchange:null};
      return permStatus;
    }}:undefined
  };
  const win={addEventListener(type,cb){events['win-'+type]=cb}};
  const doc={hidden:false,addEventListener(type,cb){events['doc-'+type]=cb}};
  vm.runInNewContext(js('camera-permission.js'),{navigator,window:win,document:doc});
  await new Promise(resolve=>setImmediate(resolve));
  return {
    get direct(){return win.ESTACameraPolicy.canUseDirect()},
    get state(){return win.ESTACameraPolicy.state},
    get requests(){return captureRequests},
    get queryCount(){return queryCount},
    async change(next){
      state=next;
      if(permStatus){permStatus.state=state;permStatus.onchange?.()}
      await new Promise(resolve=>setImmediate(resolve));
    },
    async refresh(){await win.ESTACameraPolicy.refresh()},
    fail(error){win.ESTACameraPolicy.reportFailure(error)},
    events
  };
}

(async()=>{
 const prompt=await policyFixture({initial:'prompt'});
 assert.equal(prompt.direct,true,'Android opens in-app camera with permission obtained on explicit capture tap');
 assert.equal(prompt.requests,0,'Permission policy never calls getUserMedia');
 await prompt.change('granted');
 assert.equal(prompt.direct,true,'Existing Android grant supports fast direct camera');
 await prompt.change('denied');
 assert.equal(prompt.direct,false,'Revoked camera permission returns to system camera');

 const unsupported=await policyFixture({supported:false});
 assert.equal(unsupported.direct,true,'Unsupported Permissions API can still use camera stream on gesture');
 const ios=await policyFixture({ios:true,initial:'granted'});
 assert.equal(ios.direct,true,'iPhone installed PWA prefers direct capture to skip Use Photo prompt');
 assert.equal(ios.queryCount,0,'iPhone skips unnecessary permission query');
 ios.fail({name:'NotAllowedError'});
 assert.equal(ios.direct,false,'Denied camera access in iPhone session falls back to system capture');
 const recoverable=await policyFixture({initial:'granted'});
 recoverable.fail({name:'AbortError'});
 assert.equal(recoverable.direct,true,'Transient camera failure must not mark permission denied');
 const denied=await policyFixture({initial:'granted'});
 denied.fail({name:'SecurityError'});
 assert.equal(denied.direct,false,'Explicit browser security denial disables direct camera');

 const html=js('index.html');
 const start=html.indexOf('camera-permission.js?v=');
 assert.ok(start>0,'Permission policy script is loaded');
 assert.ok(start<html.indexOf('<script src="app.js?v='));
 assert.ok(start<html.indexOf('<script src="command-center.js?v='));

 const project=js('app.js');
 const admin=js('command-center.js');
 for(const [name,text,guard] of [
   ['project',project,/function directCamera130Enabled\(\)\s*\{[^}]*ESTACameraPolicy\?\.canUseDirect\(\)===true/s],
   ['admin',admin,/function ccDirectCameraEnabled\(\)\s*\{[^}]*ESTACameraPolicy\?\.canUseDirect\(\)===true/s]
 ]) assert.match(text,guard,name+' must respect camera permissions');
 assert.match(project,/const input=\$\("#cameraNativeInput"\);\s*input.value="";\s*input.click\(\);/,'Project retains native user-gesture fallback');
 assert.match(admin,/const fallback=\(\)=>\{const input=\$c\("#ccDispatchCamera"\);if\(input\)\{input.value="";input.click\(\)\}\}/,'Admin retains native user-gesture fallback');
 assert.match(html,/id="cameraNativeInput"[^>]*capture="environment"/);
 assert.match(admin,/id="ccDispatchCamera"[^>]*capture="environment"/);
 assert.match(project,/await addPendingTaskFiles\(\[file\],\{retakeHandler:openDirectCamera130\}\)/,'Project camera shutter must open annotator directly');
 assert.match(admin,/await addDispatchMedia\(\[file\],\{retakeInput:null,forceAnnotate:true\}\)/,'Admin shutter always opens annotator even before choosing a project');
 assert.match(admin,/addDispatchMedia\(files,\{retakeInput:m\.querySelector\("#ccDispatchCamera"\),forceAnnotate:true\}\)/,'System fallback must open Admin annotator');
 assert.match(project,/fallback\.onclick=\(\)=>\{\s*cleanup\(\);\s*const input=/,'Project fallback requires a new user gesture');
 assert.match(admin,/fallbackButton\.onclick=\(\)=>\{cleanup\(\);fallback\(\)\}/,'Admin fallback requires a new user gesture');
 assert.ok(html.includes('camera-permission.js?v=20261012-seamless02'));
 assert.equal(prompt.requests,0);
 console.log('ESTA camera direct-to-editor: iOS/Android shutter, permission fallback and project/Admin guards OK');
})().catch(err=>{console.error(err);process.exitCode=1});
