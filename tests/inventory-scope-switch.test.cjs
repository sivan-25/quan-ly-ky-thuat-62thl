const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://fixture.test',runScripts:'outside-only'}),w=dom.window,d=w.document;
w.matchMedia=()=>({matches:true});d.querySelector('#inventoryPage').classList.remove('hide');
w.eval(fs.readFileSync('inventory-correction-130.js','utf8'));d.dispatchEvent(new w.Event('DOMContentLoaded'));
const tick=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
 const controls=d.querySelector('.inventoryCommandControls'),parent=controls.parentNode;
 for(const project of ['130','127','62','68','130','62']){
  const p=d.querySelector('#inventoryPage');p.classList.toggle('inventoryRef130',project==='130');p.classList.toggle('inventoryRef127',project==='127');await tick();
  const pilot=['130','127'].includes(project);
  assert.equal(d.querySelectorAll('#inventory130PdfMenu').length,pilot?1:0,project+' no duplicate/stale PDF menu');
  assert.equal(controls.parentNode,pilot?d.querySelector('header.estaTopbar'):parent,project+' controls restored');
 }
 assert.equal(d.querySelectorAll('#inventoryYear').length,1);assert.equal(d.querySelectorAll('.inventoryLocalTabs').length,1);
 dom.window.close();console.log('PASS inventory 130 → 127 → 62 → 68: no duplicate menu, controls restored, one year selector');
})().catch(e=>{console.error(e);process.exitCode=1;w.close()});
