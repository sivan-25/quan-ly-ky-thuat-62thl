'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const dom=new JSDOM('',{runScripts:'outside-only',url:'https://fixture.test'}),w=dom.window;
Object.assign(w,{SB_URL:'https://db.fixture.test',SB_KEY:'TEST',currentBuilding:{id:'130HH'},centralSession:{access_token:'TEST'},ensureCentralSessionFresh:async()=>{}});
w.eval(fs.readFileSync('data-sync.js','utf8'));
const source=fs.readFileSync('app.js','utf8');w.eval(source.slice(source.indexOf('async function sbFetch('),source.indexOf('const MEDIA_BUCKET=')));
const events=[];w.addEventListener('esta:data-changed',e=>events.push(e.detail));let fail=false;
w.fetch=async()=>({ok:!fail,status:fail?403:200,json:async()=>fail?{message:'Denied'}:[]});
(async()=>{
 await w.sbFetch('/rest/v1/inventory_materials',{token:'TEST'});assert.equal(events.length,0);
 await w.sbFetch('/rest/v1/inventory_materials',{method:'POST',token:'TEST',body:{building_id:'127HH',name:'Test'}});
 assert.equal(events.length,1);assert.equal(events[0].buildingId,'127HH');assert.deepEqual([...events[0].tables],['inventory_materials']);
 fail=true;await assert.rejects(w.sbFetch('/rest/v1/inventory_materials',{method:'PATCH',body:{building_id:'130HH'}}),/Denied/);
 assert.equal(events.length,1,'failed writes cannot signal saved data');
 fail=false;await w.sbFetch('/functions/v1/project-sync',{method:'POST',body:{action:'get',building_id:'130HH'}});assert.equal(events.length,1);
 await w.sbFetch('/functions/v1/project-sync',{method:'POST',body:{action:'upsert_task',building_id:'130HH'}});
 assert.equal(events.at(-1).tables[0],'tasks');
 dom.window.close();console.log('PASS actual request→sync: successful-write-only, correct building, read RPC excluded, failed writes retain error');
})().catch(e=>{console.error(e);process.exitCode=1;w.close()});
