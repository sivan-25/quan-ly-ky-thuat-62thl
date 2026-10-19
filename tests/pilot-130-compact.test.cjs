"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const appSource=fs.readFileSync("app.js","utf8");
const maintenanceSource=fs.readFileSync("maintenance-130.js","utf8");
const css=fs.readFileSync("pilot-130-compact.css","utf8");
const html=fs.readFileSync("index.html","utf8");

assert.match(html,/pilot-130-compact\\.css\\?v=20261019-pilot01/);
assert.match(appSource,/currentBuilding=\\{\\.\\.\\.building\\};[\\s\\S]{0,250}classList\\.toggle\\("estaPilot130HH",String\\(currentBuilding\\.id\\)==="130HH"\\)/);
assert.match(maintenanceSource,/if\\(B==="130HH"\\)return "rows";/);
assert.match(maintenanceSource,/localStorage\\.getItem\\(viewKey\\(\\)\\)/);

const selectors=css.replace(/\\/\\*[\\s\\S]*?\\*\\//g,"").split("\n").map(x=>x.trim())
 .filter(x=>x.endsWith("{")&&!x.startsWith("@media"));
assert.ok(selectors.length>=25,"meaningful scoped style coverage");
for(const selector of selectors){
 assert.ok(selector.startsWith("#app.estaPilot130HH "), "unscoped CSS rule: "+selector);
}

const match=appSource.match(/function syncOverviewNavigation\\(\\)\\{[\\s\\S]*?\\n\\}\\nfunction showHome/);
assert.ok(match,"central navigation function exists");
const fn=match[0].slice(0,-"\nfunction showHome".length);
const fake=()=>({
 classList:{
  values:new Set(),
  toggle(k,on){if(on)this.values.add(k);else this.values.delete(k)},
  contains(k){return this.values.has(k)}
 },
 querySelector(){return {textContent:""}},
 setAttribute(){},
 textContent:""
});
const app=fake();
const nodes=new Map();
const select=id=>{if(!nodes.has(id))nodes.set(id,fake());return nodes.get(id)};
const ctx={
 document:{getElementById(id){return id==="app"?app:select(id)},body:fake()},
 $:select,currentAccount:{is_admin:true,buildings:[]},currentBuilding:{id:"130HH"},
 projectOverviewActive:true,lastAdminProject:null
};
vm.createContext(ctx);
vm.runInContext(fn+"\nsyncOverviewNavigation();",ctx);
assert.equal(app.classList.contains("estaPilot130HH"),true,"130 HH pilot active");
for(const project of ["127HH","62THL","68PĐL"]){
 ctx.currentBuilding={id:project};
 vm.runInContext("syncOverviewNavigation();",ctx);
 assert.equal(app.classList.contains("estaPilot130HH"),false,project+" must keep original UI");
}
ctx.currentBuilding={id:"130HH"};
ctx.projectOverviewActive=false;
vm.runInContext("syncOverviewNavigation();",ctx);
assert.equal(app.classList.contains("estaPilot130HH"),false,"Admin overview cannot carry pilot styling");
ctx.projectOverviewActive=true;ctx.currentAccount={is_admin:false,buildings:[]};
vm.runInContext("syncOverviewNavigation();",ctx);
assert.equal(app.classList.contains("estaPilot130HH"),true,"130 HH works for technical users");
console.log("PASS 130HH pilot gating, compact stylesheet, and saved view preference");
