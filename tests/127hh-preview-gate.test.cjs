"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const css=read("esta-brand-127.css");
const app=read("app.js");
const html=read("index.html");
const preview=read("127hh-review.html");

assert.match(css,/#app\.estaFourProjectCompact\[data-building-id="127HH"\]/,"127HH theme must be active-project scoped");
assert.ok(!css.includes("#app.estaBrand130"),"127HH theme must not target 130HH styles");
for(const token of ["--esta127-primary","--esta127-canvas","--esta127-surface","--esta127-text","--esta127-border","--esta127-control-height"])
 assert.ok(css.includes(token+":"),"missing 127HH token: "+token);
assert.ok(css.includes("--esta130-table-head-bg"),"shared inventory uses existing themed variables");
assert.ok(css.includes("#materialMonthTabs button.active"),"selected month remains distinctive");
assert.ok(css.includes(".materialMonthlyTable"),"tables should share 127HH theme");
assert.ok(html.includes('href="esta-brand-127.css?v=20261106-mobile02"'),"127HH theme stylesheet missing");
assert.ok(html.indexOf("inventory-approved-four.css")<html.indexOf("esta-brand-127.css"),"theme must follow shared inventory styles");
assert.ok(app.includes('$("#app").dataset.buildingId=String(currentBuilding?.id||"");'),"project-specific scope must follow selected project");
assert.ok(preview.includes("CHỈ XEM GIAO DIỆN"),"mock-data warning missing");
for(const name of ["overview","work","materials","tools","maintenance"])
 assert.ok(preview.includes('data-view="'+name+'"'),"review tab missing: "+name);
assert.ok(!/https:\/\/[^\s"']+\/rest\/v1\//.test(preview),"mock preview must not call production database");
assert.ok(!preview.includes("supabase.co"),"mock must stay disconnected from Supabase");
// Verify project isolation and reuse of existing 127 mobile components (no app.js rewrites).
assert.match(css,/#inventoryPage\.inventoryRef127[\s\S]*?#materialMonthTabs\{display:none!important\}/);
assert.match(css,/#materialMobilePeriod\{/);
assert.match(css,/#materialMobileCards,#toolsMobileCards/);
assert.ok(html.includes('id="materialMobilePeriod"'),"the existing real-app mobile month picker must stay intact");
assert.ok(html.includes('id="materialMobileCards"')&&html.includes('id="toolsMobileCards"'),"do not replace business-backed mobile cards");
assert.match(preview,/id="mobileMonth"/);
assert.match(preview,/id="mobileMaintenance"/);
assert.match(preview,/\.tablewrap tbody tr\{display:grid/);
assert.match(preview,/overflow-x:clip/);
console.log("PASS 127HH preview gate: scoped theme, stylesheet order, five review tabs, backend-free mock");
