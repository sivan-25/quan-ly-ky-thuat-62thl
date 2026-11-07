#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const tokens=read("esta-130-tokens.css");
const html=read("index.html");
const app=read("app.js");
assert.ok(html.includes('href="esta-130-tokens.css?v='),"130HH token source is not loaded");
assert.ok(app.includes('root.dataset.project="130-hong-ha"'),"130HH scope is missing");
assert.ok(app.includes("delete root.dataset.project"),"130HH scope must be removed on project switch");
for(const role of ["plum","deep","cream","soft","lift","copper","text","secondary","line","control-height","font"]){
 assert.match(tokens,new RegExp("--esta130-"+role+":"),"missing approved token "+role);
}
for(const [file,baseline] of Object.entries({
 "esta-brand-130.css":{hex:24,important:133},
 // Content-fit rules for contractor, inventory, documents and energy replace
 // legacy project colors in the existing 130HH stylesheet (no extra override file).
 "esta-brand-130-complete.css":{hex:128,important:1260}
})){
 const css=read(file);
 const hex=(css.match(/#[0-9a-fA-F]{3,8}(?![\w-])/g)||[]).length;
 const important=(css.match(/!important/g)||[]).length;
 assert.ok(hex<=baseline.hex,`${file}: ${hex} hard-coded colors exceed the audited legacy baseline ${baseline.hex}`);
 assert.ok(important<=baseline.important,`${file}: ${important} !important declarations exceed the audited legacy baseline ${baseline.important}`);
 assert.ok(!/--([\w-]+):\s*var\(--\1\)/.test(css),`${file}: self-referential token`);
 assert.ok(!/font-family\s*:\s*(?!var\(|inherit)/.test(css),`${file}: font family must use the token`);
}
assert.ok((html.match(/\bstyle\s*=/g)||[]).length<=15,"new inline styles need to be moved to the scoped stylesheet");
console.log("PASS 130HH design guard: token source, project switch scope, no new color/important/inline debt");
