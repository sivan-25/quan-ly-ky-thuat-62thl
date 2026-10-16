"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {JSDOM}=require("jsdom");
const root=path.join(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const css=fs.readFileSync(path.join(root,"upgrade-equipment-compact.css"),"utf8");
const js=fs.readFileSync(path.join(root,"upgrade-equipment.js"),"utf8");
assert(html.includes("upgrade-equipment-compact.css?v=20261016-reference-compact01"),"compact CSS must be loaded");
assert(html.includes("upgrade-equipment.js?v=20261016-reference-compact01"),"script cache should be refreshed");
assert(html.indexOf("upgrade-equipment.css?v")<html.indexOf("upgrade-equipment-compact.css?v"),"overrides must load after base CSS");
for(const marker of [".ueStatusSummary",".ueSystemRail",".ueRailCard",".ueClassicMain",".ueItem"]){
 assert(css.includes(marker),"missing compact style "+marker);
}
assert(css.includes("@media(max-width:1190px)"),"tablet responsive treatment missing");
assert(css.includes("@media(max-width:700px)"),"mobile responsive treatment missing");
assert(!css.includes("border:5px solid red"),"annotation box must not be reproduced");

// DOM integration: source HTML-like page, no database/network and no login session.
const dom=new JSDOM("<!doctype html><html><body><div id='updateAssetsPage'></div></body></html>",{url:"https://example.test"});
const scope={
 document:dom.window.document,window:dom.window,
 currentBuilding:{id:"NANGCAP",role:"admin"},projectOverviewActive:true,
 centralSession:{access_token:"test-token"},currentAccount:{is_admin:true}
};
new vm.Script(js,{filename:"upgrade-equipment.js"}).runInNewContext(scope);
const page=dom.window.document.getElementById("updateAssetsPage");
dom.window.estaUpgradeAssets.render(page,true);
const $=sel=>page.querySelector(sel);
const $$=sel=>Array.from(page.querySelectorAll(sel));

assert.equal($(".ueGrandTotal strong").textContent.trim(),"0","virtual samples must not count as real equipment");
assert.equal($$("[data-ue-group]").length,10,"all + 9 real system groups required");
assert.equal($$("#ueRows .ueItem").length,44,"44 ready-to-edit templates required");
assert.equal($(".ueSummaryCaption").parentElement.className,"ueStatusSummary",
 "compact summary caption must be a third aligned grid cell");
assert.equal($$("[data-ue-status-chip]").length,7,"all seven status shortcuts must exist");
assert($(".ueClassicHead #ueAdd"),"Add equipment button must survive");
assert($(".ueClassicHead #uePrint"),"PDF button must survive");

const pccc=$('[data-ue-group="PCCC"]');
pccc.click();
assert.equal($(".ueMainHead h2").textContent,"PCCC");
assert.equal($$("#ueRows .ueItem").length,9,"system navigation must actually filter");
assert.equal($('[data-ue-group="PCCC"]').getAttribute("aria-pressed"),"true");

$('[data-ue-group=""]').click();
const search=$("#ueSearch");
search.value="AHU";search.oninput({target:search});
assert.equal($$("#ueRows .ueItem").length,1,"search must filter list");
assert($(".ueItemId strong").textContent.includes("AHU"));

scope.currentBuilding={id:"130HH"};
assert(!dom.window.estaUpgradeAssets.render(page,true),"NANGCAP page must not be active in 130HH");
console.log("Compact NANGCAP visual structure and filters: PASS (9 systems, 44 templates, status row, sidebar, search, responsive CSS).");
