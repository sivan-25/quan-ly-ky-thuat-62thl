"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const source=fs.readFileSync(path.join(__dirname,"..","upgrade-equipment.js"),"utf8");
new vm.Script(source,{filename:"upgrade-equipment.js"});
const anchor="window.estaUpgradeAssets={render,refresh:()=>load(true),close:closeForm};";
assert(source.includes(anchor),"equipment module public API not found");
const instrumented=source.replace(anchor,
 "window.__upgradeProbe={G,SEEDS,FULL_FIELDS,advancedFields,extraFields,installFields,inspectionDue,conditionOf,isDue,active};"+anchor);
const window={};
const scope={window,document:{addEventListener(){}},currentBuilding:{id:"NANGCAP"},projectOverviewActive:true};
vm.runInNewContext(instrumented,scope,{filename:"upgrade-equipment.js"});
const p=window.__upgradeProbe;

assert.equal(p.G.length,9,"9 technical building systems required");
assert.equal(p.SEEDS.length,44,"sample catalog must contain 44 entries");
assert.equal(new Set(p.SEEDS.map(x=>x.seedKey)).size,44,"sample keys must be unique");
const types=new Set(p.SEEDS.map(x=>x._technicalType));
for(const type of types){
 assert(p.advancedFields(type).length>0,"missing equipment-specific fields for "+type);
}
assert.equal(types.size,40,"equipment catalog should cover 40 technical subtypes");
assert.equal(p.extraFields().length,2);
assert.equal(p.installFields().length,5);
assert(p.advancedFields("bao_chay").some(f=>f.key==="dau"),"fire alarm detector count must be retained");
assert(p.advancedFields("nvr").some(f=>f.key==="raid"),"NVR RAID property must be retained");
assert(p.advancedFields("xlnt").some(f=>f.unit==="m³/ngày"),"wastewater must be in m³/day");
assert(p.advancedFields("thang").some(f=>f.unit==="@"),"elevator certification must be a date");
const verified={system_group:"PCCC",specs:{_estaUpgrade:{verified:true,condition:"tot",lastCheck:"2026-10-01",interval:30}}};
const notVerified={...verified,specs:{_estaUpgrade:{verified:false,condition:"chua",lastCheck:"2026-10-01",interval:30}}};
assert.equal(p.inspectionDue(verified),"2026-10-31");
assert.equal(p.inspectionDue(notVerified),"");
assert.equal(p.conditionOf({virtual:true}),"mau");
assert.equal(p.active(),true);
scope.currentBuilding={id:"130HH"};
assert.equal(p.active(),false,"NANGCAP feature must never show on other projects");
assert(source.includes("filter(x=>!x.virtual&&metaOf(x).verified)"),"print must only include verified records");
assert(source.includes('building_id=eq."+BID'),"write paths must be project-scoped");

console.log("ESTA NANGCAP equipment schema: 9 systems, 44 samples, 40 types, dates, RLS scope and print checks passed.");
