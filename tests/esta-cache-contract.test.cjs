"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const conf=JSON.parse(fs.readFileSync(path.join(root,"vercel.json"),"utf8"));
assert.equal(conf.buildCommand,"npm run build");
assert.equal(conf.outputDirectory,".");
function cache(source){
 const row=conf.headers.find(r=>r.source===source);
 assert.ok(row,"Missing Vercel header policy for "+source);
 return row.headers.find(x=>x.key.toLowerCase()==="cache-control")?.value;
}
for(const name of ["/","/index.html","/sw.js","/manifest.webmanifest"]){
 assert.match(cache(name),/no-cache/,"navigation, service worker and manifest must revalidate");
}
assert.match(cache("/:path*.js"),/max-age=600/,"scripts should cache briefly");
assert.match(cache("/:path*.css"),/max-age=600/,"nonhashed styles cache briefly");
assert.match(cache("/esta-css-:path*"),/max-age=31536000,\s*immutable/,"hashed bundles should be cached by content hash");
assert.equal(conf.functions["api/esta_report.py"].maxDuration,120,"PDF endpoint config must remain unchanged");
console.log("PASS ESTA cache policy: HTML/SW revalidate; short-lived assets; immutable fingerprinted bundles");
