const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const app=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8'),demo=fs.readFileSync(require('node:path').join(__dirname,'../demo-lab.js'),'utf8');
const policy=app.slice(app.indexOf('function usesSingleTaskResult'),app.indexOf('$("#status")?.addEventListener("change",()=>{',app.indexOf('function usesSingleTaskResult')));
const panel=demo.slice(demo.indexOf('function demoEnsureWorkPanel'),demo.indexOf('function demoTaskMaterialOptions'));
const submit=demo.slice(demo.indexOf('const originalTaskSubmit='),demo.indexOf('const originalDemoDelTask='));
(async()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,'');
 const dom=new JSDOM(html,{url:'https://fixture.test',runScripts:'outside-only'});
 dom.window.HTMLElement.prototype.scrollIntoView=function(){};
 const page={addScriptTag:async({content})=>dom.window.eval(content),evaluate:async(fn,arg)=>dom.window.eval('('+fn.toString()+')('+JSON.stringify(arg)+')')};
 await page.addScriptTag({content:`
 var $=s=>document.querySelector(s),currentBuilding={id:'62THL'},demoCache={incidents:[],materials:[]};
 var demoIs=()=>true,demoLoad=()=>Promise.resolve(),demoPopulateWorkOptions=()=>{},demoResetWorkLinks=()=>{},demoUpdateLinkSummary=()=>{};
 var calls=[],messages=[],rows=[],taskSelectedPeople=['KT Test'],pendingTaskFiles=[],removedTaskImageRefs=[],existingTaskImages=[];
 var canProjectEdit=()=>true,toast=s=>messages.push(s),taskStorageKeyFor=id=>'fixture_'+id,load=()=>rows,taskDispatchMetadata=x=>({}),
 syncTaskRecord=async(a,obj,id)=>{calls.push({a,obj,id});return {};},resetForm=()=>{},render=()=>{},renderHomeDashboard=()=>{},demoRenderHomeOps=()=>{},
 demoSyncContractorTask=async()=>{},demoFinalizeLinks=async()=>{};
 var demoReadWorkLinks=()=>({result:$('#demoTaskResult').value.trim(),cause:$('#demoTaskCause').value.trim(),materials:[]});
 `+policy+panel+submit+`;demoEnsureWorkPanel();`});
 {
  for(const project of ['62THL','68PĐL','68PDL','127HH','130HH']){
   const out=await page.evaluate(async(project)=>{
    currentBuilding.id=project; calls=[];messages=[];
    $('#content').value='Thay đèn';$('#date').value='2026-10-06';$('#editId').value='';$('#type').value='Hằng ngày';$('#status').value='Đã hoàn thành';
    $('#note').value='';$('#demoTaskResult').value='Đã thay đèn, hoạt động bình thường';demoSyncCompletionFields();
    const valid=$('#taskForm').checkValidity(),noteRequired=$('#note').required;
    await $('#taskForm').onsubmit({preventDefault(){}});
    const saved=calls[0];calls=[];$('#demoTaskResult').value='   ';demoSyncCompletionFields();
    await $('#taskForm').onsubmit({preventDefault(){}});
    const blocked=calls.length===0;
    $('#status').value='Đang thực hiện';$('#status').dispatchEvent(new Event('change'));await $('#taskForm').onsubmit({preventDefault(){}});
    const inProgress=calls.length===1;calls=[];
    $('#note').value='Ghi chú cũ';$('#note').dispatchEvent(new Event('input'));$('#demoUseNoteAsResult').click();
    const copied=$('#demoTaskResult').value==='Ghi chú cũ'&&$('#note').value==='Ghi chú cũ';
    $('#demoTaskResult').value='Kết quả cũ';$('#demoUseNoteAsResult').click();const preserved=$('#demoTaskResult').value==='Kết quả cũ';
    const causeHidden=$('#demoTaskCause').closest('label').classList.contains('hide');
    $('#type').value='Sự cố';$('#type').dispatchEvent(new Event('change'));
    const causeShown=!$('#demoTaskCause').closest('label').classList.contains('hide')&&!$('#demoTaskCause').required;
    return {valid,noteRequired,saved,blocked,inProgress,copied,preserved,causeHidden,causeShown};
   },project);
   assert.equal(out.valid,true);assert.equal(out.noteRequired,false);assert.equal(out.saved.id,project);assert.equal(out.saved.obj.n,'');assert.ok(out.saved.obj.result);
   for(const key of ['blocked','inProgress','copied','preserved','causeHidden','causeShown'])assert.equal(out[key],true,key);
  }
 }
 const legacy=await page.evaluate(()=>{currentBuilding.id='DEMO';$('#status').value='Đã hoàn thành';$('#note').value='';demoSyncCompletionFields();return $('#note').required;});
 assert.equal(legacy,true);
 dom.window.close();console.log('PASS: actual form validity and submit handler, optional notes, copy/preserve, incident fields across four projects + alias; Demo unchanged. Persistence mocked; no production writes.');
})().catch(e=>{console.error(e);process.exit(1)});
