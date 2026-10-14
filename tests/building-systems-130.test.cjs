const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {JSDOM}=require("jsdom");
const file=fs.readFileSync(path.join(__dirname,"..","building-systems-130.js"),"utf8");
new Function(file);
const dom=new JSDOM('<!doctype html><html><body><div id="buildingSystems130"></div></body></html>',{
  url:"https://esta.example/",runScripts:"outside-only"
});
const w=dom.window,d=w.document,$=id=>d.getElementById(id);
w.eval('var currentBuilding={id:"130HH"};var projectOverviewActive=true;var centralSession={access_token:"fixture"};');
let writable=true;w.canProjectEdit=()=>writable;w.toast=()=>{};
let store=[],calls=[];
w.confirm=()=>true;
w.sbFetch=async(path,opts={})=>{
 calls.push({path,opts});
 if(path.startsWith("/rest/v1/building_equipment_profiles")){
  if(opts.method==="POST")store.unshift({...opts.body,id:"profile1",created_at:new Date().toISOString()});
  if(opts.method==="PATCH"){const i=store.findIndex(x=>x.id==="profile1");store[i]={...store[i],...opts.body};}
  if(opts.method==="DELETE")store=[];
  return path.includes("select=*")?[...store]:null;
 }
 throw Error("Unknown test endpoint");
};
const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
(async()=>{
 w.eval(file);w.renderBuildingSystems130();await flush();
 assert.ok($("bs130Add"),"module is mounted");
 assert.match($("bs130List").textContent,/Chưa có hồ sơ/);
 $("bs130Add").click();
 $("bs130Group").value="Điều hòa & thông gió";
 $("bs130Group").dispatchEvent(new w.Event("change"));
 $("bs130Type").value="Điều hòa âm trần";
 $("bs130Type").dispatchEvent(new w.Event("change"));
 assert.match($("bs130Specs").textContent,/Năng suất lạnh/);
 $("bs130Form").elements.namedItem("name").value="Điều hòa phòng họp";
 $("bs130Brand").value="Daikin";
 $("bs130Quantity").value="2";
 $("bs130Specs").querySelector('[data-bs-spec="hp"]').value="2.5";
 $("bs130Form").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
 await flush();await flush();
 assert.equal(store.length,1,"one profile inserted");
 assert.equal(store[0].building_id,"130HH");
 assert.equal(store[0].quantity,2);
 assert.equal(store[0].specs.hp,"2.5");
 assert.equal($("bs130Count").textContent,"1");
 assert.match($("bs130List").textContent,/Điều hòa phòng họp/);
 assert.ok(calls.some(x=>x.opts.method==="POST"&&x.path.includes("building_equipment_profiles")),"POST to project-only table");
 $("bs130List").querySelector("[data-bs-edit]").click();
 assert.equal($("bs130Group").value,"Điều hòa & thông gió");
 assert.equal($("bs130Specs").querySelector('[data-bs-spec="hp"]').value,"2.5");
 $("bs130Form").elements.namedItem("model").value="FX-TEST";
 $("bs130Form").dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}));
 await flush();await flush();
 assert.equal(store[0].model,"FX-TEST");
 assert.ok(calls.some(x=>x.opts.method==="PATCH"),"edit persists");
 writable=false;w.renderBuildingSystems130();await flush();
 assert.equal($("bs130Add").hidden,true,"read only users cannot add");
 assert.equal($("bs130List").querySelector("[data-bs-delete]"),null,"read only users cannot delete");
 w.currentBuilding.id="127HH";w.renderBuildingSystems130();await flush();
 assert.equal(calls.filter(x=>x.opts.method===undefined).length,4,"other projects do not request profiles");
 console.log("130HH catalog: selection, save, reload, edit, project isolation, read-only passed.");
 dom.window.close();
})().catch(err=>{console.error(err);dom.window.close();process.exitCode=1;});
