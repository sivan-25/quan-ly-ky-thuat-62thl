'use strict';
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = process.env.ESTA_VISUAL_DIR || 'visual-artifacts';
fs.mkdirSync(output, {recursive:true});
const widths=[{width:320,height:720},{width:390,height:844},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900}];
const scenarios=['login','admin','admin-home','work-62THL','work-68PĐL','work-127HH','work-130HH','edit-62THL','edit-130HH','energy-68PĐL'];
const results=[];
const fixedTime=Date.parse('2026-10-10T02:00:00.000Z');
const channelTolerance=8; // observed headless anti-aliasing jitter was at most 6/255
async function fixture(page,scenario){
 if(scenario==='login')return;
 const projectId=scenario.startsWith('work-')?scenario.slice(5):scenario.startsWith('edit-')?scenario.slice(5):'68PĐL';
 await page.evaluate(({id,scenario})=>{
   const names={'62THL':'62 Trần Huy Liệu','68PĐL':'68 Phan Đăng Lưu','127HH':'127 Hồng Hà','130HH':'130 Hồng Hà'};
   const buildings=Object.keys(names).map(key=>({id:key,name:names[key],role:'editor'}));
   const data=[
    {id:1001,d:'2026-10-10',c:'Kiểm tra hệ thống chiếu sáng',t:'Hằng ngày',s:'Đang thực hiện',n:'Kiểm tra khu vực sảnh và hành lang',a:'Kỹ thuật 1',imgs:[]},
    {id:1002,d:'2026-10-09',c:'Kiểm tra hệ thống nước',t:'Bảo trì',s:'Đã hoàn thành',n:'Đã kiểm tra và ghi nhận kết quả',result:'Hệ thống vận hành bình thường',a:'Kỹ thuật 2',imgs:[]}
   ];
   window.eval('centralSession={access_token:"TEST-ONLY"};');
   window.eval('currentAccount='+JSON.stringify({id:'fixture-admin',is_admin:true,buildings})+';');
   window.eval('currentBuilding='+JSON.stringify(buildings.find(x=>x.id===id))+';projectOverviewActive=true;projectOpenSeq++;');
   window.eval('sbFetch=async function(path){if(String(path).includes("admin-overview"))return {rows:'+JSON.stringify(buildings.map(building=>({building,snapshot:{tasks:[],energy:[]},ops:{}})))+',activity:[],generated_at:"2026-10-10T02:00:00Z"};return [];}');
   for(const building of buildings){
     window.localStorage.setItem(building.id==='62THL'?'qlkt62_v1':'qlkt_tasks_'+building.id,JSON.stringify(data));
   }
   document.querySelector('#login').classList.add('hide');
   document.querySelector('#app').classList.remove('hide');
   window.eval('applyBuildingUI()');
   if(scenario==='admin')window.eval('openAdminPortal();renderAdminProjects();');
   else if(scenario==='admin-home')window.eval('projectOverviewActive=false;showHome();');
   else if(scenario.startsWith('work-'))window.eval('showModule("work");');
   else if(scenario.startsWith('edit-'))window.eval('showModule("work");window.editTask(1001);');
   else window.eval('showModule("energy");');
 },{id:projectId,scenario});
}
async function capture(browser,site,scenario,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:1,colorScheme:'light',reducedMotion:'reduce'});
 const page=await context.newPage();
 const errors=[];
 await page.addInitScript(ts=>{
  const NativeDate=Date;
  class FixedDate extends NativeDate {
   constructor(...args){super(...(args.length?args:[ts]));}
   static now(){return ts;}
  }
  window.Date=FixedDate;
 },fixedTime);
 await page.route('**/*',route=>{
  let url;
  try{url=new URL(route.request().url());}catch(err){return route.abort();}
  if(['localhost','127.0.0.1'].includes(url.hostname))return route.continue();
  return route.abort();
 });
 page.on('pageerror',err=>errors.push(String(err.message||err).slice(0,200)));
 await page.goto(site,{waitUntil:'load',timeout:30000});
 await page.waitForTimeout(350);
 await fixture(page,scenario);
 await page.waitForTimeout(550);
 await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important;}'});
 await page.waitForTimeout(120);
 const stats=await page.evaluate(()=>{
   const visible=selector=>{
     const el=document.querySelector(selector);
     return el&&!el.classList.contains('hide')&&getComputedStyle(el).display!=='none';
   };
   const selector=['#login','#adminPage','#homePage','#workPage','#energyPage'].find(visible)||'body';
   const rect=document.querySelector(selector).getBoundingClientRect();
   return {section:selector,rect:[rect.x,rect.y,rect.width,rect.height].map(x=>Math.round(x*10)/10),
     docWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,
     tasks:document.querySelectorAll('#tbody tr').length,drawerOpen:!!document.querySelector('#workEditDrawer:not(.hide)'),title:document.title};
 });
 const png=await page.screenshot({animations:'disabled',fullPage:false});
 await context.close();
 return {png,stats,errors};
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 let failures=0;
 try{
  for(const viewport of widths){
   for(const scenario of scenarios){
    const label=scenario+'-'+viewport.width;
    const base=await capture(browser,'http://127.0.0.1:8765/',scenario,viewport);
    const next=await capture(browser,'http://127.0.0.1:8766/',scenario,viewport);
    const expected=scenario==='login'?'#login':scenario==='admin'?'#adminPage':scenario==='admin-home'?'#homePage':scenario==='energy-68PĐL'?'#energyPage':'#workPage';
    assert.equal(base.stats.section,expected,'main source should display '+expected+' for '+scenario);
    assert.equal(next.stats.section,expected,'candidate should display '+expected+' for '+scenario);
    if(scenario.startsWith('work-'))assert.ok(base.stats.tasks>=2,'fixture work tasks must actually render for '+scenario);
    if(scenario.startsWith('edit-'))assert.equal(base.stats.drawerOpen,true,'editing drawer must actually open for '+scenario);
    const a=PNG.sync.read(base.png),b=PNG.sync.read(next.png);
    assert.equal(a.width,b.width);
    assert.equal(a.height,b.height);
    let rawDifferentPixels=0,significantDifferentPixels=0,maxColorDeviation=0;
    for(let i=0;i<a.data.length;i+=4){
     const delta=Math.max(...[0,1,2,3].map(channel=>Math.abs(a.data[i+channel]-b.data[i+channel])));
     if(delta>0)rawDifferentPixels++;
     if(delta>channelTolerance)significantDifferentPixels++;
     if(delta>maxColorDeviation)maxColorDeviation=delta;
    }
    fs.writeFileSync(path.join(output,label+'-before.png'),base.png);
    fs.writeFileSync(path.join(output,label+'-after.png'),next.png);
    const equal=JSON.stringify(base.stats)===JSON.stringify(next.stats);
    const item={scenario,viewport:viewport.width+'x'+viewport.height,rawDifferentPixels,significantDifferentPixels,
     maxColorDeviation,channelTolerance,
     significantPercentDiff:+(significantDifferentPixels*100/(a.width*a.height)).toFixed(4),
     geometryEqual:equal,baseline:base.stats,candidate:next.stats,errors:{baseline:base.errors,candidate:next.errors}};
    results.push(item);
    if(significantDifferentPixels||!equal||base.errors.length||next.errors.length){
     failures++;console.error('DIFF '+label+': '+JSON.stringify(item).slice(0,900));
    }else console.log('PASS meaningful pixel/DOM parity '+label+
       (rawDifferentPixels?' ('+rawDifferentPixels+' minor anti-aliasing pixels, max channel delta '+maxColorDeviation+')':''));
   }
  }
 }finally{
  await browser.close();
  fs.writeFileSync(path.join(output,'comparison.json'),JSON.stringify(results,null,2));
  const rows=results.map(x=>'| '+x.scenario+' | '+x.viewport+' | '+x.rawDifferentPixels+' | '+x.significantDifferentPixels+' | '+x.maxColorDeviation+' | '+(x.geometryEqual?'Yes':'No')+' |');
  const md=['# ESTA browser screenshot parity','',
   'All data is mocked; all external network requests are blocked. This does not test live Supabase or actual device performance.',
   'Minor headless rendering noise up to '+channelTolerance+'/255 per channel is tolerated. Raw differences remain reported. Geometry and JavaScript error checks are exact.',
   '',
   '| Scenario | Viewport | Raw differing pixels | Significant differing pixels | Max channel difference | Geometry equal |',
   '|---|---|---:|---:|---:|---|',...rows,''];
  fs.writeFileSync(path.join(output,'REPORT.md'),md.join('\n'));
 }
 if(failures){console.error(failures+' visual parity cases failed. Inspect images/artifacts.');process.exitCode=1;}
 else console.log('PASS '+results.length+' screenshot/DOM parity cases');
})().catch(err=>{console.error(err);process.exitCode=1;});
