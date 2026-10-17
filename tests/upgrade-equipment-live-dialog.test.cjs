"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),crypto=require("node:crypto");
const {JSDOM}=require("jsdom");
const root=path.join(__dirname,"..");
const source=fs.readFileSync(path.join(root,"upgrade-equipment.js"),"utf8");
const css=fs.readFileSync(path.join(root,"upgrade-equipment.css"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const dom=new JSDOM('<!doctype html><html><head></head><body><div id="app"><section id="updateAssetsPage"></section></div></body></html>',{url:"https://esta.test",runScripts:"outside-only"});
const w=dom.window,d=w.document,app=d.getElementById("app"),page=d.getElementById("updateAssetsPage");
d.head.append(Object.assign(d.createElement("style"),{textContent:css}));
const state={building:"130HH"},db=new Map(),calls=[];
const sbFetch=async(url,opts={})=>{
 const method=opts.method||"GET";
 calls.push({url,method,building:state.building});
 if(url.includes("/maintenance_assets")||url.includes("/esta_maintenance_plan_items"))return [];
 if(!url.includes("/building_equipment_profiles_nangcap"))throw Error("Unexpected API "+url);
 const id=url.match(/id=eq\.([a-f\d-]{36})/i)?.[1],bid=decodeURIComponent(url.match(/building_id=eq\.([^&]+)/)?.[1]||"");
 if(method==="GET")return [...db.values()].filter(x=>(!id||x.id===id)&&(!bid||x.building_id===bid));
 if(method==="POST"){assert.equal(opts.body.building_id,"130HH");db.set(opts.body.id,opts.body);return [];}
 if(method==="PATCH"){const old=db.get(id);assert(old);db.set(id,{...old,...opts.body});return [];}
 throw Error("Unexpected method "+method);
};
const scope={window:w,document:d,crypto,currentAccount:{is_admin:true},
 centralSession:{access_token:"fixture"},sbFetch,
 get currentBuilding(){return {id:state.building,name:"130 Hồng Hà",role:"editor"}},
 get projectOverviewActive(){return true}};
new vm.Script(source).runInNewContext(scope);
const $=id=>d.getElementById(id);
(async()=>{
 w.estaUpgradeAssets.render(page,true);await w.estaUpgradeAssets.refresh();
 assert.equal(page.querySelectorAll(".ueRefRow").length,44);
 assert.equal($("#ueAdd").disabled,false,"real project must allow profile creation for Admin");
 $("#ueAdd").click();
 const overlay=$("#ueOverlay"),form=$("#ueForm");
 assert(overlay&&!overlay.hidden,"form opened");
 assert.equal(w.getComputedStyle(overlay).display,"flex","live project's overlay must be visible, not blocked by legacy CSS");
 assert.equal(form.elements.namedItem("name").disabled,false,"name editable");
 assert.equal($("#ueSubmit").hidden,false,"save action available");
 form.elements.namedItem("name").value="Bơm PCCC thử nghiệm";
 await form.onsubmit({preventDefault(){},currentTarget:form});
 assert.equal(db.size,1,"saved equipment profile must persist in 130HH fixture");
 assert.equal($("#ueSaveFlag").textContent.trim(),"✓ Đã lưu");
 assert.equal($("#ueFormError").hidden,true);
 const saved=[...db.values()][0];assert.equal(saved.building_id,"130HH");
 assert(calls.some(c=>c.method==="POST"&&c.url.includes("building_equipment_profiles_nangcap")));
 $("#ueClose").click();
 const sample=page.querySelector('[data-ue-id^="sample:"]');
 sample.click();sample.closest(".ueRefEntry").querySelector("[data-ue-edit]").click();
 assert.equal(w.getComputedStyle(overlay).display,"flex","built-in profile entry must open editable form");
 assert.equal($("#ueSubmit").hidden,false);
 d.body.classList.remove("estaTechnicalAssetsMode");
 assert.equal(w.getComputedStyle(overlay).display,"none","dialog must hide outside technical routes");
 assert.match(css,/body:not\(\.estaUpgradeMode\):not\(\.estaTechnicalAssetsMode\) \.ueOverlay/);
 assert(html.includes("upgrade-equipment.css?v=20261017-live-dialog01"),"CSS version bump required");
 dom.window.close();
 console.log("ESTA 130HH equipment: add, edit built-in, save and route-scoped modal visibility PASS");
})().catch(e=>{console.error(e);process.exitCode=1;dom.window.close()});
