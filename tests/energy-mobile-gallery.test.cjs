"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const {JSDOM} = require("jsdom");

const html = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("energy-refresh.css", "utf8");
const dom = new JSDOM(html, {url:"https://esta-property-operations.vercel.app", runScripts:"outside-only"});
const {document, File, Event} = dom.window;
const $ = s => document.querySelector(s);

for(const [galleryId,cameraId] of [["energyImage","energyImageCamera"],["energyImage2","energyImage2Camera"]]){
 const gallery=$("#"+galleryId),camera=$("#"+cameraId);
 assert.ok(gallery && camera, "Both pickers exist for "+galleryId);
 assert.ok(gallery.getAttribute("accept").includes("image/jpeg"),"Gallery accepts common photo-library formats");
 assert.equal(gallery.hasAttribute("capture"),false,"Gallery must not force camera");
 assert.equal(gallery.hasAttribute("multiple"),true,"Multiple selection opens the photo-library picker on mobile browsers");
 assert.equal(camera.getAttribute("capture"),"environment","Camera must open rear-facing camera");
 assert.ok(document.querySelector('#energyForm [data-energy-picker="'+galleryId+'"]'));
 assert.ok(document.querySelector('#energyForm [data-energy-picker="'+cameraId+'"]'));
}
assert.match(css,/energyPhotoActions/);
assert.match(css,/#app #energyPage #energyForm \\.energyImage2Field\\.hide[\\s\\S]*?display:none!important/,"Hidden EVN2 must remain hidden despite form layout rules");
assert.match(css,/energyImage2Field:not\\(\\.hide\\)/,"Only visible EVN2 fields get flex layout");
assert.match(app,/const f=\$\("#energyImageCamera"\)\.files\[0\]\|\|\$\("#energyImage"\)\.files\[0\]/);
assert.match(app,/const f2=\$\("#energyImage2Camera"\)\.files\[0\]\|\|\$\("#energyImage2"\)\.files\[0\]/);

const begin=app.indexOf('let energyPreviewObjectUrl="",energyPreviewObjectUrl2="";');
const end=app.indexOf('\n$("#energyForm").onsubmit=',begin);
assert.ok(begin>0&&end>begin,"Expected photo preview and picker handlers");
const picks=new Map();
const mockUrls=[];
let editAllowed=true;
const context=vm.createContext({
 $,
 document,
 URL:{createObjectURL:f=>{const url="blob:energy-"+(mockUrls.length+1);mockUrls.push(url);return url;},revokeObjectURL:()=>{}},
 canProjectEdit:()=>editAllowed,
 toast:()=>{},
 sync68EnergyTabs:()=>{},
 ENERGY_META:{electric:{form:"Điện",unit:"kWh",valueLabel:"Chỉ số",name:"điện"}},
 energyType:"electric",
 is68DualElectric:()=>false,
 today:()=>"2026-10-21",
 syncEnergyDateCompact:()=>{},
 setPeopleSelected:()=>{},
 setEnergyNoteOpen:()=>{}
});
for(const id of ["energyImage","energyImageCamera","energyImage2","energyImage2Camera"]){
 let selected=[];
 const input=$("#"+id);
 Object.defineProperty(input,"files",{configurable:true,get:()=>selected});
 picks.set(id,files=>{selected=files});
}
vm.runInContext(app.slice(begin,end),context);
for(const id of ["energyImage","energyImageCamera","energyImage2","energyImage2Camera"]){
 const input=$("#"+id);
 let opened=0;
 input.click=()=>opened++;
 document.querySelector('[data-energy-picker="'+id+'"]').click();
 assert.equal(opened,1,"Expected button to open picker: "+id);
}
const libraryFile=new File(["image"],"meter.jpg",{type:"image/jpeg"});
picks.get("energyImage")([libraryFile]);
$("#energyImage").dispatchEvent(new Event("change"));
assert.match($("#energyImagePreview").innerHTML,/Ảnh đã chọn/);
assert.match($("#energyImagePreview").innerHTML,/blob:energy-1/);
picks.get("energyImage")([]);
$("#energyImage").dispatchEvent(new Event("change"));
assert.match($("#energyImagePreview").innerHTML,/blob:energy-1/,"Picker cancel retains selected preview");
const cameraFile=new File(["image2"],"evn2.png",{type:"image/png"});
picks.get("energyImage2Camera")([cameraFile]);
$("#energyImage2Camera").dispatchEvent(new Event("change"));
assert.match($("#energyImage2Preview").innerHTML,/blob:energy-2/,"EVN2 camera preview");
editAllowed=false;
let denied=0;
$("#energyImage").click=()=>denied++;
document.querySelector('[data-energy-picker="energyImage"]').click();
assert.equal(denied,0,"Read-only role cannot select photos");
vm.runInContext("resetEnergyForm()",context);
assert.equal($("#energyImagePreview").innerHTML,"");
assert.equal($("#energyImage2Preview").innerHTML,"");
console.log("PASS: Energy camera/gallery picker, EVN1/EVN2, preview, cancel, reset, read-only guard.");
