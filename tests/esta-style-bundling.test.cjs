"use strict";
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const cp=require("node:child_process");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const names=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+\.css(?:\?[^"]*)?)"/g)]
 .map(m=>m[1].split("?")[0]);
assert.ok(names.length>=45,"expected original ESTA CSS manifest, not a pre-bundled source");
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"esta-style-check-"));
try {
 fs.mkdirSync(path.join(dir,"scripts"));
 fs.copyFileSync(path.join(root,"scripts/build-styles.cjs"),path.join(dir,"scripts/build-styles.cjs"));
 fs.writeFileSync(path.join(dir,"index.html"),html);
 for(const name of new Set(names))fs.copyFileSync(path.join(root,name),path.join(dir,name));
 const result=cp.spawnSync(process.execPath,["scripts/build-styles.cjs"],{cwd:dir,encoding:"utf8"});
 assert.equal(result.status,0,result.stderr);
 const output=fs.readFileSync(path.join(dir,"index.html"),"utf8");
 const builtLinks=[...output.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+\.css(?:\?[^"]*)?)"[^>]*>/g)];
 assert.ok(builtLinks.length<names.length-15,"not enough CSS requests removed");
 assert.deepEqual([...output.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]),
  [...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]),"inline style rules must retain exact position and content");
 assert.deepEqual([...output.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]),
  [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]),"scripts must be untouched");
 const expanded=[];
 for(const tag of builtLinks){
  const link=tag[0],filename=tag[1].split("?")[0];
  if(link.includes('data-esta-css-bundle="true"')){
   const css=fs.readFileSync(path.join(dir,filename),"utf8");
   const sources=[...css.matchAll(/^\/\* SOURCE: ([\w.-]+\.css) \*\/$/gm)].map(m=>m[1]);
   assert.ok(sources.length>=2,filename+" bundle should contain multiple sources");
   expanded.push(...sources);
  }else expanded.push(filename);
 }
 assert.deepEqual(expanded,names,"CSS cascade order or a stylesheet was changed");
 const again=cp.spawnSync(process.execPath,["scripts/build-styles.cjs"],{cwd:dir,encoding:"utf8"});
 assert.equal(again.status,0,again.stderr);
 assert.equal(fs.readFileSync(path.join(dir,"index.html"),"utf8"),output,"bundling must be idempotent");
 console.log("PASS ESTA CSS network optimization: "+names.length+" links -> "+builtLinks.length+"; cascade/inline styles/scripts identical");
}finally{fs.rmSync(dir,{force:true,recursive:true})}
