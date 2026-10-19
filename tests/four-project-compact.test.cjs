"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const appSource=fs.readFileSync("app.js","utf8");
const maintenanceSource=fs.readFileSync("maintenance-130.js","utf8");
const css=fs.readFileSync("four-project-compact.css","utf8");
const html=fs.readFileSync("index.html","utf8");
const projects=["68PĐL","62THL","127HH","130HH"];

assert.match(html,/four-project-compact\.css\?v=20261019-four-buildings01/);
assert.ok(!html.includes("pilot-130-compact.css"),"no obsolete pilot stylesheet");
assert.match(maintenanceSource,/if\(LINK_BUILDINGS\.has\(B\)\)return "rows";/);
assert.match(maintenanceSource,/localStorage\.getItem\(viewKey\(\)\)/);
const selectors=css.replace(/\/\*[\s\S]*?\*\//g,"").split("\n").map(x=>x.trim())
  .filter(x=>x.endsWith("{")&&!x.startsWith("@media"));
assert.ok(selectors.length>=65,"Shared layout must retain complete 130HH styling");
for(const selector of selectors){
 assert.ok(selector.startsWith("#app.estaFourProjectCompact "),"unscoped CSS rule: "+selector);
}
const match=appSource.match(/function syncOverviewNavigation\(\)\{[\s\S]*?\n\}\nfunction showHome/);
assert.ok(match,"shared project navigation exists");
const fn=match[0].slice(0,-"\nfunction showHome".length);
const fake=()=>({
 classList:{
  values:new Set(),
  toggle(k,on){if(on)this.values.add(k);else this.values.delete(k)},
  contains(k){return this.values.has(k)}
 },
 querySelector(){return {textContent:""}},
 setAttribute(){},textContent:""
});
const app=fake(),nodes=new Map();
const select=id=>{if(!nodes.has(id))nodes.set(id,fake());return nodes.get(id)};
const ctx={
 document:{getElementById(id){return id==="app"?app:select(id)},body:fake()},
 $:select,currentAccount:{is_admin:true,buildings:[]},currentBuilding:{id:"130HH"},
 projectOverviewActive:true,lastAdminProject:null
};
vm.createContext(ctx);
for(const project of projects){
 ctx.currentBuilding={id:project};ctx.projectOverviewActive=true;
 vm.runInContext(fn+"\nsyncOverviewNavigation();",ctx);
 assert.equal(app.classList.contains("estaFourProjectCompact"),true,project+" should use approved shared layout");
}
ctx.currentBuilding={id:"NANGCAP"};
vm.runInContext("syncOverviewNavigation();",ctx);
assert.equal(app.classList.contains("estaFourProjectCompact"),false,"retired project excluded");
ctx.currentBuilding={id:"130HH"};ctx.projectOverviewActive=false;
vm.runInContext("syncOverviewNavigation();",ctx);
assert.equal(app.classList.contains("estaFourProjectCompact"),false,"Admin overview excluded");
ctx.projectOverviewActive=true;ctx.currentAccount={is_admin:false,buildings:[]};
vm.runInContext("syncOverviewNavigation();",ctx);
assert.equal(app.classList.contains("estaFourProjectCompact"),true,"technical users supported");
const src=maintenanceSource.match(/const viewKey=\(\)=>[\s\S]*?\nfunction readView\(\)\{[\s\S]*?\n\}/);
assert.ok(src,"readView exists");
const stored=new Map(),viewContext={B:"130HH",LINK_BUILDINGS:new Set(projects),
 localStorage:{getItem:key=>stored.get(key)||null},
 window:{matchMedia:()=>({matches:false})}};
vm.createContext(viewContext);
for(const project of projects){
 viewContext.B=project;
 assert.equal(vm.runInContext(src[0]+"\nreadView();",viewContext),"rows",project+" default row view");
 stored.set("esta.maintenance."+project+".view","cards");
 assert.equal(vm.runInContext("readView()",viewContext),"cards",project+" saved view kept");
 stored.delete("esta.maintenance."+project+".view");
}
console.log("PASS four shared buildings, Admin isolation, CSS scope, row defaults and saved preferences");
