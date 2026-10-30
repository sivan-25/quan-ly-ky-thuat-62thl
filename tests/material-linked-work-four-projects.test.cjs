const fs=require("node:fs");
const assert=require("node:assert/strict");
const {JSDOM}=require("jsdom");
const source=fs.readFileSync("material-linked-work-report.js","utf8");
const sleep=w=>new Promise(resolve=>w.setTimeout(resolve,0));
const buildings=[
  {id:"62THL",name:"62 Trần Huy Liệu"},
  {id:"68PĐL",name:"68 Phan Đăng Lưu"},
  {id:"127HH",name:"127 Hồng Hà"},
  {id:"130HH",name:"130 Hồng Hà"}
];
async function checkProject(building){
 const dom=new JSDOM('<!doctype html><html><head></head><body><div id="app"><div id="inventoryPage" class="page"><section class="inventorySwitchBar"></section></div></div></body></html>',{runScripts:"outside-only",url:"https://example.test/"});
 const w=dom.window;
 w.eval(`
 let currentBuilding=${JSON.stringify(building)};
 let inventoryLoadedBuilding=currentBuilding.id;
 let inventoryMaterials=[{id:"mat-"+currentBuilding.id,name:"Đèn LED "+currentBuilding.id,code:"VT-01",unit:"Cái"}];
 let inventoryTransactions=[];
 let projectPeople=[{name:"Nhân viên kỹ thuật"}];
 let cloudCalls=[];
 async function loadInventoryData(id){cloudCalls.push(id);inventoryLoadedBuilding=id}
 const load=()=>[{id:"task-"+currentBuilding.id,d:"2026-10-30",c:"Thay đèn "+currentBuilding.id,s:"Hoàn thành",materials:[{materialId:"mat-"+currentBuilding.id,name:"Đèn LED "+currentBuilding.id,qty:2}],imgs:["storage:"+currentBuilding.id+"/tasks/one.jpg"]}];
 function toast(m){}
 async function exportGenericEstaPdf(m){window.__pdf=m;return true}
 `);
 w.exportGenericEstaPdf=w.eval("exportGenericEstaPdf");
 w.eval(source);
 w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
 await sleep(w);
 const btn=w.document.getElementById("estaMaterialWorkReportLaunch");
 assert.ok(btn,"button exists in "+building.id);
 btn.click();await sleep(w);
 const modal=w.document.getElementById("estaMaterialWorkReportModal");
 assert.equal(modal.hidden,false);
 assert.match(w.document.getElementById("emwrProject").textContent,new RegExp(building.name));
 const mat=w.document.querySelector('input[data-material-id="mat-'+building.id+'"]');
 assert.ok(mat,"correct material in "+building.id);
 mat.checked=true;mat.dispatchEvent(new w.Event("change",{bubbles:true}));
 const task=w.document.querySelector('[data-emwr-task="task-'+building.id+'"]');
 assert.ok(task,"correct linked task");
 task.checked=true;task.dispatchEvent(new w.Event("change",{bubbles:true}));
 w.document.getElementById("emwrExport").click();
 const manual=w.document.querySelector('input[name="emwrPerformerMode"][value="manual"]');
 manual.checked=true;manual.dispatchEvent(new w.Event("change",{bubbles:true}));
 w.document.getElementById("emwrManualPerformer").value="Kỹ thuật viên "+building.id;
 w.document.getElementById("emwrExport").click();await sleep(w);
 const pdf=w.__pdf;
 assert.ok(pdf,"PDF model generated");
 assert.equal(pdf.building,building.name);
 assert.equal(pdf.rows.length,1);
 assert.match(JSON.stringify(pdf.rows),new RegExp(building.id));
 assert.equal(pdf.photos.length,1);
 assert.equal(pdf.photos[0].path,"storage:"+building.id+"/tasks/one.jpg");
 assert.equal(pdf.signer.name,"Kỹ thuật viên "+building.id);
 // Leaving the building invalidates open selection even if both support this feature.
 w.eval('currentBuilding={id:"UNKNOWN",name:"Other"};inventoryMaterials=[];inventoryLoadedBuilding="";');
 w.document.getElementById("app").appendChild(w.document.createElement("span"));
 await sleep(w);
 assert.equal(modal.hidden,true,"modal closes when project changes");
 assert.equal(w.document.getElementById("estaMaterialWorkReportLaunch"),null,"button hidden outside approved projects");
 w.close();
}
(async()=>{
 for(const building of buildings)await checkProject(building);
 assert.match(source,/SUPPORTED_PROJECTS = new Set\(\["130HH","127HH","62THL","68PĐL","68PDL"\]\)/);
 assert.match(source,/modalProjectId !== projectId\(\).toUpperCase\(\)/);
 assert.doesNotMatch(source,/is130HH\(\)/);
 console.log("PASS material-linked work/PDF: 4 building scopes, images, performer, project-switch isolation");
})().catch(e=>{console.error(e);process.exitCode=1});
