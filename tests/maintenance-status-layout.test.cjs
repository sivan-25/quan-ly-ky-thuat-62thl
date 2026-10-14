const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM}=require("jsdom");
const base=path.join(__dirname,"..");
const js=fs.readFileSync(path.join(base,"maintenance-130.js"),"utf8");
const css=fs.readFileSync(path.join(base,"maintenance-readability.css"),"utf8");
new Function(js);

const start=js.indexOf("function renderList(){");
const finish=js.indexOf("\nfunction renderAlternative(events){",start);
assert.ok(start>0&&finish>start,"renderList is extracted from production source");
const source=js.slice(start,finish)+"\nreturn renderList;";

const states=[
 ["completed","done","Hoàn thành"],
 ["in_progress","working","Đang thực hiện"],
 ["overdue","late","Quá hạn"],
 ["planned","planned","Chưa thực hiện"]
];
const data=states.map(([status,key],i)=>({
 item:{
  id:"plan"+i,work_title:"Kiểm tra thiết bị "+status,system_group:"PCCC",
  subsystem:"Tầng "+i,asset_code:"TB-"+i,assigned_to:"Văn",priority:"normal",
  cadence:"3",source_notes:""
 },
 event:{
  status,event_key:"event-"+i,planned_date:"2026-10-0"+(i+1),
  result_note:"Kết quả kiểm tra "+status,completed_by:"Văn",
  image_paths:i===0?[{kind:"before",ref:"storage:sample.jpg"},{kind:"after",ref:"storage:sample2.jpg"}]:[]
 },
 scheduled:"2026-10-0"+(i+1)
}));
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const markup='<div id="maint130"><button data-m130-view="rows"></button><button data-m130-view="cards"></button><button data-m130-layout="list"></button></div>'+
 '<div id="m130ListTitle"></div><div id="m130ListCount"></div><div id="m130List"></div>'+
 '<input id="m130Search"><select id="m130Group"><option value=""></option></select>'+
 '<select id="m130State"><option value=""></option></select>'+
 '<select id="m130PriorityFilter"><option value=""></option></select>'+
 '<select id="m130TypeFilter"><option value=""></option></select>'+
 '<select id="m130TechnicianFilter"><option value=""></option></select>'+
 '<button id="m130Create"></button>';
const dom=new JSDOM(markup),d=dom.window.document;
const $=id=>d.getElementById(id);
let hydrationCount=0;
function render(viewMode){
 const context={
  $,show:()=>true,ready:true,year:2026,month:10,viewMode,layoutMode:"list",
  scopeEvents:events=>events,getYearSchedule:()=>data,
  renderAlternative:()=>{},status:o=>states.find(s=>s[0]===o.event.status).slice(2).concat(states.find(s=>s[0]===o.event.status)[1]),
  stateKey:()=>"",canWrite:()=>true,esc:escape,pad:n=>String(n).padStart(2,"0"),
  interval:()=>3,cycleLabel:()=> "3 tháng",fmt:v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?v.slice(8,10)+"/"+v.slice(5,7)+"/"+v.slice(0,4):(v||"—"),dateOf:o=>o.scheduled,
  personLabel:v=>v,lastCompleted:()=>"2026-09-01",nextCardDate:()=>"2027-01-01",
  maintenanceEvidenceHtml:(e,key)=>e.image_paths.length?'<div class="m130Evidence" data-evidence="'+escape(key)+'"></div>':"",
  hydrateMaintenanceEvidence:()=>{hydrationCount++;}
 };
 new Function("ctx","with(ctx){"+source+"}")(context)();
}
render("cards");
assert.equal(d.querySelectorAll(".m130ServiceCard").length,4);
for(const [status,key,label] of states){
 const card=d.querySelector(".m130ServiceCard.m130State-"+key);
 assert.ok(card,"missing "+status+" card");
 assert.equal(card.querySelector(".m130CardStatus").textContent,"Tình trạng: "+label);
 assert.equal(card.querySelectorAll(".m130TopTags > span").length,1,"one combined status pill on card");
 assert.equal(card.querySelector(".m130StatusLabel").parentElement,card.querySelector(".m130CardStatus"));
 assert.equal((card.textContent.match(/Trạng thái:/g)||[]).length,0,"duplicate status: "+status);
 assert.equal(card.querySelectorAll(".m130CardMeta").length,1);
}
const done=d.querySelector(".m130ServiceCard.m130State-done");
assert.ok(done.querySelector(".m130CardLower > .m130CardDetails"));
assert.ok(done.querySelector(".m130CardLower > .m130Evidence"),"photos to right of the card details");
assert.equal(d.querySelectorAll(".m130ServiceCard .m130Evidence").length,1,"no blank photo blocks");
render("rows");
assert.equal(d.querySelectorAll(".m130CompactRow").length,4);
const completedRow=d.querySelector(".m130CompactRow.m130State-done");
assert.ok(completedRow.querySelector(":scope > .m130EntryBody"),"description is first section");
assert.equal(completedRow.querySelector("time.m130Date").getAttribute("datetime"),"2026-10-01");
assert.equal(completedRow.querySelector("time.m130Date b").textContent,"01");
assert.equal(completedRow.querySelector("time.m130Date small").textContent,"Th10");
assert.equal(completedRow.querySelectorAll(".m130Pills > .m130Badge").length,1);
assert.ok(completedRow.querySelector(":scope > .m130Evidence"),"evidence on same row, not nested in description");
assert.ok(completedRow.querySelector(":scope > .m130EntryActions"));
assert.equal(completedRow.querySelector(".m130EntryBody .m130Evidence"),null);
assert.equal(hydrationCount,2,"images hydrated after both view renders");

const required=["done","working","late","planned","review","postponed"];
for(const key of required){
 assert.ok(css.includes(".m130State-"+key),"missing state "+key);
}
assert.match(css,/--maint-bg-start/);
assert.match(css,/border-left:6px solid var\(--maint-color\)!important/);
assert.match(css,/\.m130CardLower>\.m130Evidence/);
assert.match(css,/\.m130CompactRow>\.m130Evidence/);
assert.match(css,/@media\(max-width:640px\)/);
assert.match(css,/flex-direction:column;gap:4px/);
assert.match(css,/max-width:calc\(100% - 75px\)/);
assert.doesNotMatch(js,/Trạng thái: <b>/,"duplicate status HTML not reintroduced");
assert.match(css,/#154566/,"navy date background must be present");
assert.match(css,/\.m130StatusValue/,"status must have a merged-value style");
assert.equal((css.match(/\.m130State-done/g)||[]).length,1,"clean CSS: only one completed state rule");
dom.window.close();
console.log("Maintenance status colors, duplicate label and inline evidence regression tests passed.");
