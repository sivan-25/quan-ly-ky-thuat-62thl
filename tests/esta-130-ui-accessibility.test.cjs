"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const brand=read("esta-130-tokens.css")+read("esta-brand-130-complete.css");
const stock=read("inventory-approved-four.css");
const unified=read("unified.css");
const energy=read("energy-refresh.css");
const contractor=read("contractor.css");
const contractorMobile=read("contractor-mobile-130.css");
const incident=read("demo-lab.css");
const markup=read("index.html");
const hexLum=hex=>{const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;};
const contrast=(a,b)=>{const x=hexLum(a),y=hexLum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
assert.ok(contrast("#2B1526","#FBF3E3")>=4.5,"main text must be legible");
assert.ok(contrast("#411437","#F5ECD0")>=4.5,"KPI text must be legible");
assert.ok(contrast("#F3DEBF","#411437")>=4.5,"dark heading text must be legible");
assert.ok(contrast("#987759","#FBF3E3")>=3,"input border must be visible against field background");
assert.match(brand,/--esta130-field-border:\s*#987759/);
assert.match(brand,/grid-template-columns:140px minmax\(160px,1\.5fr\)/,"desktop work date receives a usable track");
assert.match(brand,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important/,"tablet work form wraps into four columns");
assert.match(brand,/grid-row:auto!important;/,"tablet fields must release legacy first-row layout");
assert.match(brand,/--esta130-label-font-size:\s*12px/);
assert.match(brand,/body\.estaBrand130 #app\.estaBrand130#app #workPage #saveBtn\{\s*min-height:var\(--esta130-control-height\)!important;\s*height:var\(--esta130-control-height\)!important;/,"main Save button must use 44px control height");
assert.match(brand,/--esta130-caption-size:\s*12px/);
assert.match(brand,/:not\(button \*\):not\(\[class\*="status"\]\)/,"buttons inherit semantic foreground");
assert.match(stock,/body #app#app #inventoryPage\.inventoryRefShared \.monthlyStats :is\(small,b\)\{color:var\(--esta130-stat-text/);
assert.match(stock,/-webkit-text-fill-color:var\(--esta130-stat-text,#f5f8ff\)!important/);
assert.match(stock,/materialNameCell b\{\s*color:var\(--esta130-table-row-text/);
assert.match(unified,/\.maintenanceHistoryCard th\{\s*font-size:var\(--esta130-table-font-size,11px\)!important;\s*background:var\(--esta130-table-head-bg/);
assert.match(unified,/\.maintenanceStats article\{\s*border-color:var\(--esta130-stat-border/);
assert.match(unified,/\.inventorySectionHead\{\s*border-bottom-color:var\(--esta130-stat-border/);
assert.match(energy,/#energyPage #energyForm \.energyPhotoActions \.energyActionText\{[^}]*color:inherit!important;/);
assert.match(contractor,/#app\.contractorMode #contractorPage \.contractorStats small\{\s*font-size:var\(--esta130-caption-size,8px\)!important;/);
assert.match(contractorMobile,/contractorMobileProjects \.contractorStats small\{font-size:var\(--esta130-caption-size,8px\)!important\}/);
assert.match(incident,/\.demoKpi small\{[^}]*font-size:var\(--esta130-caption-size,9px\)/);
for(const name of ["inventory-approved-four.css","energy-refresh.css","unified.css","contractor.css","contractor-mobile-130.css","demo-lab.css"]) {
 assert.ok(markup.includes('href="'+name+'?v=20261105-130-ui-readability-v3"'),"missing cache bust for "+name);
}
assert.ok(markup.includes('href="esta-brand-130-complete.css?v=20261106-approved44"'));
for (const [bg,fg] of [
  ["#E8F4E8","#175B36"], // completed work
  ["#FFF0DA","#7A4300"], // waiting work
  ["#FDE8E8","#991B1B"], // overdue work
  ["#E7F0FA","#164A70"], // in progress
  ["#411437","#F3DEBF"]  // project toolbar
]) assert.ok(contrast(bg,fg)>=4.5, "130HH status text below WCAG AA contrast: "+bg+" / "+fg);
for (const focusRule of [
  '#app.estaBrand130 :is(input,select,textarea,button,summary,[role="button"]):focus-visible{',
  'body.estaBrand130 #app.estaBrand130 :is(input,select,textarea,button,summary,[role="button"]):focus-visible{',
  'body.estaBrand130 :is(.workEditDrawerCard,.demoDrawerCard,.modalCard,.contractorModalCard,.inventoryModalCard,.ccModalCard,#m130Overlay .m130Dialog) :is(button,input,select,textarea,summary,[role="button"]):focus-visible{'
]) assert.ok(brand.includes(focusRule), "keyboard focus missing on 130HH: "+focusRule);
console.log("PASS 130HH UI: text/button inheritance, KPI/table readability, border contrast and project-scoped fonts");
