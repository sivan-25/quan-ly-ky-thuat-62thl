/* Non-destructive regression for four-project contractor mobile parity.
   Run: node tests/contractor-four-project-mobile.test.cjs */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const js=fs.readFileSync(path.join(root,"contractor.js"),"utf8");
const css=fs.readFileSync(path.join(root,"contractor-mobile-130.css"),"utf8");
const formCss=fs.readFileSync(path.join(root,"contractor-profile-form-mobile.css"),"utf8");
const jobCss=fs.readFileSync(path.join(root,"contractor-job-mobile-130.css"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");

const start=js.indexOf("const ESTA_CONTRACTOR_PROJECTS=");
const end=js.indexOf("let contractors=",start);
assert.ok(start>=0&&end>start,"shared contractor-project gate missing");
const projectFnBody=js.slice(start,end)+"\nreturn isEstaContractorProject;";
function projectTest(id){
  return new Function("currentBuilding",projectFnBody)({id})();
}
const projects=["130HH","127HH","62THL","68PĐL","68PDL"];
for(const id of projects)assert.equal(projectTest(id),true,id+" must use compact contractor mobile");
for(const id of ["Demo","update","other",""])assert.equal(projectTest(id),false,id+" is not an active building");

assert.ok(js.includes('classList.toggle("contractorMobileProjects",isEstaContractorProject())'),"list/detail UI shared gate missing");
assert.equal((js.match(/classList.toggle\("contractorMobileProjects",isEstaContractorProject\(\)\)/g)||[]).length,2,"list and detail must both have shared gate");
assert.ok(css.includes("#contractorPage.contractorMobileProjects"),"CSS not aligned with shared gate");
assert.ok(!css.includes("contractorMobile130"),"stale project-specific CSS selector");
assert.ok(!js.includes('String(currentBuilding?.id||"")==="130HH"'),"stale 130 HH-only JavaScript gate");

assert.ok(css.includes(".contractorMobileCall svg"),"approved mobile call icon missing");
assert.ok(css.includes(".contractorMobileTermGroup"),"compact contract term missing");
assert.ok(css.includes(".contractorJobFilters"),"compact history search missing");
assert.ok(html.includes('contractor-mobile-130.css?v=20261020-copy-phone01'));
assert.ok(html.includes('contractor.js?v=20261020-copy-phone01'));

const profile=html.slice(html.indexOf('<div id="contractorModal"'),html.indexOf('<div id="contractorJobModal"'));
const job=html.slice(html.indexOf('<div id="contractorJobModal"'),html.indexOf('<div id="maintenanceAssetModal"'));
for(const cls of ["contractorPhoneField","contractorContactField","contractorStartField","contractorEndField"]){
  assert.ok(profile.includes('class="'+cls+'"'),cls+" form field missing");
}
assert.ok(profile.includes("contractorProfileFieldsScroll"),"profile scroll body missing");
assert.ok(profile.includes("contractorProfileFormActions"),"profile footer missing");
assert.ok(profile.includes('id="contractorProfileSaveStatus"'),"profile save status missing");
assert.ok(job.includes('id="contractorJobSaveBtn"'),"contractor job save button missing");
assert.ok(job.includes('>Xác nhận</button>'),"contractor job button must say Xác nhận");
assert.ok(job.includes("contractorJobFieldsScroll"),"job scroll body missing");
assert.ok(formCss.includes("grid-template-columns:repeat(2,minmax(0,1fr))"),"paired profile fields missing");
assert.ok(formCss.includes("contractorProfileFormActions"),"visible profile footer missing");
assert.ok(jobCss.includes("contractorJobFormActions"),"visible job footer missing");
for (const [name,source] of [["contractor CSS",css],["profile CSS",formCss],["job CSS",jobCss]]) {
  assert.equal((source.match(/{/g)||[]).length,(source.match(/}/g)||[]).length,name+" malformed");
}

// Database reads and writes must stay restricted to the currently selected building.
assert.ok(js.includes('building_id=eq."+b'),"data load must be building-scoped");
assert.ok(js.includes("building_id:currentBuilding.id"),"data mutations need building id");
assert.ok(js.includes('"&building_id=eq."+encodeURIComponent(currentBuilding.id)'),"scoped updates/deletes missing");

// Exercise actual renderContractors DOM-free for each project without live database writes.
const renderStart=js.indexOf("function renderContractors(){");
const renderEnd=js.indexOf("window.openContractorDetail=",renderStart);
assert.ok(renderStart>=0&&renderEnd>renderStart,"renderContractors not found");
const factory=new Function("$","contractors","contractorJobsFor","contractorLastJob",
  "contractorSpecialtyFilter","currentBuilding","contractorFieldLabel","contractorFieldClass",
  "contractorInitial","contractorPhoneHref","esc","fmt","isEstaContractorProject",
  js.slice(renderStart,renderEnd)+"\nreturn renderContractors;");
function renderFor(projectId,phone="0900000000"){
  const nodes=Object.create(null);
  const $=id=>nodes[id]??(nodes[id]={
    value:"",textContent:"",innerHTML:"",
    classList:{activated:null,toggle(_cls,on){this.activated=!!on}},
    querySelectorAll(){return []}
  });
  const currentBuilding={id:projectId};
  const isEstaContractorProject=()=>projectTest(projectId);
  const item={id:"test",name:"Fixture Contractor",phone,contact_name:"Tester",specialty:"PCCC",status:"Đang hợp tác"};
  const f=factory($,[item],()=>[],()=>null,"",currentBuilding,x=>x||"Khác",()=>"pccc",
    x=>x.charAt(0),x=>"tel:"+x,x=>String(x).replace(/&/g,"&amp;").replace(/"/g,"&quot;"),x=>x,isEstaContractorProject);
  f();
  return {activated:nodes["#contractorPage"].classList.activated,html:nodes["#contractorGrid"].innerHTML};
}
for(const id of projects){
  const rendered=renderFor(id);
  assert.equal(rendered.activated,true,id+" layout not activated");
  assert.ok(rendered.html.includes("contractorMobileCard"),id+" mobile card not rendered");
  assert.ok(rendered.html.includes("Gọi ngay"),id+" call action missing");
  assert.ok(rendered.html.includes('href="tel:0900000000"'),id+" tap-to-call broken");
  assert.ok(rendered.html.includes('data-copy-contractor-phone="0900000000"'),id+" phone-copy action missing");
  assert.ok(rendered.html.includes("contractorMobilePhoneActions"),id+" copy/call pair container missing");
  assert.ok(rendered.html.includes("<span>Sao chép</span>"),id+" copy label missing");
}
assert.equal(renderFor("Demo").activated,false,"unapproved demo project was changed");
const noNumber=renderFor("130HH","");
assert.ok(noNumber.html.includes('contractorMobileCopy disabled'),"no-number copy button must be disabled");
assert.ok(noNumber.html.includes('disabled aria-label="Không có số để sao chép"'),"disabled copy lacks hint");
assert.ok(css.includes(".contractorMobileCopy")&&css.includes(".contractorMobilePhoneActions"),"copy button styling missing");
const copyStart=js.indexOf("async function copyContractorPhone(phone){");
const copyEnd=js.indexOf("function contractorInitial(",copyStart);
assert.ok(copyStart>=0&&copyEnd>copyStart,"copy helper not found");
async function testClipboard(){
  const copied=[];
  const makeCopy=new Function("navigator","document",
    js.slice(copyStart,copyEnd)+"\nreturn copyContractorPhone;");
  const modern=makeCopy({clipboard:{writeText:async value=>{copied.push(value)}}},{});
  assert.equal(await modern("0868 897 511"),true,"modern clipboard must report success");
  assert.deepEqual(copied,["0868 897 511"],"clipboard must retain actual phone text");
  assert.equal(await modern(""),false,"empty phone must not copy");
  const selected={value:"",style:{},setAttribute(){},focus(){},select(){},remove(){}};
  let usedFallback=false;
  const legacy=makeCopy({clipboard:null},{
    createElement:()=>selected,body:{appendChild(){}},execCommand:(command)=>{usedFallback=command==="copy";return true}
  });
  assert.equal(await legacy("0912345678"),true,"legacy iPhone copy must work");
  assert.equal(selected.value,"0912345678","legacy copy must keep phone");
  assert.equal(usedFallback,true,"legacy execCommand never invoked");
  console.log("PASS contractor mobile directory/copy/call for all four ESTA projects (read-only fixtures)");
}
testClipboard().catch(error=>{console.error(error);process.exitCode=1});
