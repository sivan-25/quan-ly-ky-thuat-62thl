"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {JSDOM}=require("jsdom");
const source=fs.readFileSync(path.join(__dirname,"..","maintenance-130.js"),"utf8");
const from=source.indexOf("function renderAlternative(events){");
const to=source.indexOf("\nasync function rescheduleOccurrence",from);
assert(from>0&&to>from,"source calendar function available");
const fast=source.slice(from,to);
const begin=fast.indexOf(" const eventsByDay=new Map();");
const end=fast.indexOf("  const chips=daily.map",begin);
assert(begin>0&&end>begin,"optimized daily date index available");
const legacy=fast.slice(0,begin)+
 ' for(let day=1;day<=days;day++){\n  const date=year+"-"+pad(month)+"-"+pad(day),daily=events.filter(o=>!isMonthOnly(o)&&dateOf(o)===date);\n'+
 fast.slice(end);
const lastStart=source.indexOf("function lastCompleted(o,completedByItem){");
const lastEnd=source.indexOf("\nfunction nextCardDate",lastStart);
assert(lastStart>=0&&lastEnd>lastStart,"indexed last-completed logic available");
const buildings=["68PĐL","62THL","127HH","130HH"];
const escape=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function date(day){return "2026-10-"+String(day).padStart(2,"0");}
function buildEvents(project){
 return Array.from({length:450},(_,i)=>({
  scheduled:date((i*7)%31+1),
  virtual:false,
  item:{id:project+"-plan-"+(i%35),work_title:"Bảo trì "+project+" #"+i,system_group:i%2?"PCCC":"HVAC"},
  event:{event_key:project+"-"+i,status:i%4===0?"completed":"planned",planned_date:date((i*7)%31+1)}
 }));
}
function markup(program,events){
 const dom=new JSDOM('<main id="m130List"></main>'),d=dom.window.document;
 let calls=0;
 const ctx={
  $:id=>d.getElementById(id),layoutMode:"calendar",year:2026,month:10,
  dateOf:o=>{calls++;return o.event.planned_date;},
  isMonthOnly:()=>false,shownDate:o=>o.event.planned_date,
  fmt:v=>v.slice(8,10)+"/"+v.slice(5,7)+"/"+v.slice(0,4),
  stateKey:o=>o.event.status,status:o=>[o.event.status,o.event.status],canWrite:()=>true,esc:escape,
  pad:n=>String(n).padStart(2,"0")
 };
 new Function("ctx","with(ctx){"+program+";return renderAlternative;}")(ctx)(events);
 const html=d.getElementById("m130List").innerHTML;
 const dates=[...d.querySelectorAll("[data-m130-date]")];
 const chips=d.querySelectorAll(".m130CalendarChip").length;
 dom.window.close();
 return {html,calls,dates:dates.length,chips};
}
for(const building of buildings){
 const events=buildEvents(building);
 const before=markup(legacy,events),after=markup(fast,events);
 assert.equal(after.html,before.html,building+" must preserve exact calendar DOM structure and ordering");
 assert.equal(after.dates,31);
 assert.equal(after.chips,events.length);
 assert(after.calls<=events.length,building+" indexed calendar should call dateOf at most once per event");
 assert(before.calls>=events.length*31,building+" baseline must scan each event per day");
 // Completed history: same latest past date as previous row-by-row scanning behavior.
 const history=Array.from({length:450},(_,i)=>({item_id:building+"-plan-"+(i%35),
  status:i%3===0?"completed":"planned",planned_date:date((i%31)+1)}));
 const findLast=new Function("stored",source.slice(lastStart,lastEnd)+";return lastCompleted;")(history);
 const index=new Map();
 for(const h of history)if(h.status==="completed"&&h.planned_date){
  const list=index.get(h.item_id)||[];
  list.push(h.planned_date);index.set(h.item_id,list);
 }
 for(const dates of index.values())dates.sort((a,b)=>b.localeCompare(a));
 for(const o of events)assert.equal(findLast(o,index),findLast(o),building+" latest completed date parity");
 console.log("PASS "+building+": exact same 450-item calendar HTML, "+before.calls+" → "+after.calls+" day lookups");
}
