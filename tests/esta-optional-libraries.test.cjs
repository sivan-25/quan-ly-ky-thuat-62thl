"use strict";
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert.ok(html.includes("optional-libraries.js"),"optional loader must be present");
assert.ok(!html.includes('<script src="https://cdn.jsdelivr.net/npm/xlsx@'),"do not eagerly fetch Excel");
assert.ok(!html.includes('<script src="https://cdn.jsdelivr.net/npm/qrcodejs@'),"do not eagerly fetch QR");
assert.ok(fs.readFileSync(path.join(root,"contractor.js"),"utf8").includes('estaEnsureOptionalLibrary("XLSX")'));
assert.ok(fs.readFileSync(path.join(root,"construction.js"),"utf8").includes('estaEnsureOptionalLibrary("XLSX")'));
assert.ok(fs.readFileSync(path.join(root,"update-lab.js"),"utf8").includes('estaEnsureOptionalLibrary("QRCode")'));
const appended=[];
const global={};
const document={
 head:{appendChild(el){appended.push(el);}},
 createElement(tag){assert.equal(tag,"script");return {remove(){this.removed=true;}};}
};
const code=fs.readFileSync(path.join(root,"optional-libraries.js"),"utf8");
vm.runInNewContext(code,{window:global,document,setTimeout,clearTimeout,Promise});
(async()=>{
 assert.equal(appended.length,0,"no remote library should be loaded during startup");
 const a=global.estaEnsureOptionalLibrary("XLSX");
 const b=global.estaEnsureOptionalLibrary("XLSX");
 assert.equal(a,b,"multiple clicks should share one loading operation");
 assert.equal(appended.length,1);
 assert.ok(appended[0].src.includes("xlsx.full.min.js"));
 global.XLSX={utils:{aoa_to_sheet() {}}};
 appended[0].onload();
 await a;await b;
 await global.estaEnsureOptionalLibrary("XLSX");
 assert.equal(appended.length,1,"XLSX remains cached once loaded");
 const qr=global.estaEnsureOptionalLibrary("QRCode");
 assert.equal(appended.length,2);
 assert.ok(appended[1].src.includes("qrcode.min.js"));
 global.QRCode=function(){};
 appended[1].onload();await qr;
 assert.equal(appended.length,2);
 console.log("PASS lazy Excel/QR loading, duplicate request protection and unchanged export handlers");
})().catch(e=>{console.error(e);process.exitCode=1});
