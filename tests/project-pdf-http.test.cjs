const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const app = fs.readFileSync(path.resolve(__dirname,'../app.js'),'utf8');
function section(first, last) {
 const a=app.indexOf(first), b=app.indexOf(last,a+first.length);
 assert.ok(a>=0&&b>a,'Missing app source segment: '+first);
 return app.slice(a,b);
}
async function main(){
 const dom=new JSDOM('<select id="pdfSignerName"></select><input id="pdfSignerFullName"><input id="pdfSignatureFile" type="file"><div id="pdfSignaturePreview"></div><p id="pdfSignatureError"></p><div id="toast"></div>',{url:'https://fixture.test'});
 const context={
  Response,Blob,URL,console:{warn:()=>{}},document:dom.window.document,$:selector=>dom.window.document.querySelector(selector),
  currentBuilding:{id:'62THL',name:'62 Trần Huy Liệu'},
  projectPeople:[{name:'Kỹ thuật Test'}],currentAccount:{display_name:'Quản lý ESTA'},
  pdfSignaturePreviewUrl:'',
  toast:()=>{},
  performerArray:x=>x.performers||[x.a].filter(Boolean),
  fmt:x=>x.slice(8,10)+'/'+x.slice(5,7)+'/'+x.slice(0,4),
  esc:x=>String(x)
 };
 vm.createContext(context);
 const pdfFns=section('async function readVerifiedEstaPdf(', 'async function sbFetch(');
 vm.runInContext(pdfFns,context);
 const valid=new Response('%PDF-1.4\nSynthetic fixture\n',{status:200,headers:{'Content-Type':'application/pdf'}});
 const blob=await context.readVerifiedEstaPdf(valid);
 assert.equal(blob.size>0,true);
 await assert.rejects(context.readVerifiedEstaPdf(new Response('<html>Sign in to Vercel</html>',{status:200,headers:{'Content-Type':'text/html'}})),/trang đăng nhập\/web/);
 await assert.rejects(context.readVerifiedEstaPdf(new Response('not-a-pdf',{status:200,headers:{'Content-Type':'application/pdf'}})),/không phải PDF hợp lệ/);
 await assert.rejects(context.readVerifiedEstaPdf(new Response('{"error":"missing auth"}',{status:401,headers:{'Content-Type':'application/json'}})),/Phiên đăng nhập/);
 await assert.rejects(context.readVerifiedEstaPdf(new Response('{"error":"permission denied"}',{status:403,headers:{'Content-Type':'application/json'}})),/403/);
 await assert.rejects(context.readVerifiedEstaPdf(new Response('',{status:413})),/quá lớn/);
 await assert.rejects(context.readVerifiedEstaPdf(new Response('{"detail":"layout error"}',{status:500,headers:{'Content-Type':'application/json'}})),/layout error/);
 context.reportPdfIssue(new Error('Đã thử nghiệm phản hồi lỗi'));
 assert.match(dom.window.document.querySelector('#estaPdfErrorText').textContent,/Đã thử nghiệm phản hồi lỗi/);
 context.clearReportPdfIssue();
 assert.equal(dom.window.document.querySelector('#estaPdfErrorNotice'),null);

 vm.runInContext(section('function pdfSignaturePeople()', 'function closePdfSignatureModal('),context);
 context.resetPdfSignatureModal();
 assert.equal(dom.window.document.querySelector('#pdfSignerName').value,'Kỹ thuật Test');
 assert.equal(dom.window.document.querySelector('#pdfSignerFullName').value,'Kỹ thuật Test');

 vm.runInContext(section('function estaGeneratorStatus(', 'async function exportEstaGeneratorPdf('),context);
 const cases=[['62THL','62 Trần Huy Liệu'],['68PĐL','68 Phan Đăng Lưu'],['127HH','127 Hồng Hà'],['130HH','130 Hồng Hà']];
 for(const [id,name] of cases){
  context.currentBuilding={id,name};
  const payload=context.estaGeneratorPayload([{id:1,c:'Kiểm tra hệ thống kỹ thuật',t:'Hằng ngày',s:'Đã hoàn thành',d:'2026-10-10',a:'KT Test',n:'Đã kiểm tra',imgs:['storage:b-TEST/work/photo.jpg']}]);
  assert.equal(payload.building,name);
  assert.equal(payload.tasks[0].status,'Hoàn thành');
  assert.equal(payload.tasks[0].images.length,1);
 }
 for(const name of ['exportEstaGeneratorPdf','exportGenericEstaPdf','exportEnergyEstaPdf','exportToolsEstaPdf']){
  const start=app.indexOf('async function '+name+'(');
  assert.ok(start>=0,'Missing PDF exporter '+name);
  assert.ok(app.slice(start,start+4600).includes('readVerifiedEstaPdf(res)'),name+' does not verify genuine PDF response');
 }
 for(const name of ['exportEnergyEstaPdf','exportToolsEstaPdf']){
  const start=app.indexOf('async function '+name+'(');
  assert.ok(app.slice(start,start+4400).includes('centralAuthFetch("/api/esta_report"'),name+' lacks refreshed auth');
 }
 dom.window.close();
 console.log('PASS ESTA project PDF: PDF/HTML/401/403/413/500, persistent diagnostics, signature defaults, 4 project payloads and all exporters');
}
main().catch(e=>{console.error(e);process.exitCode=1});
