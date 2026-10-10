'use strict';
// Anonymous cold-load comparison of the production MAIN SOURCE and candidate source.
// Runs local servers only, blocks all external requests (Supabase, fonts, CDN).
// Times are useful for detecting gross regressions, not real user network timings.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const out=process.env.ESTA_VISUAL_DIR||'visual-artifacts';
fs.mkdirSync(out,{recursive:true});
const sites=[
 {name:'production-main-source',url:'http://127.0.0.1:8765/'},
 {name:'optimized-branch-source',url:'http://127.0.0.1:8766/'}
];
function median(values){
 const ordered=[...values].sort((a,b)=>a-b);
 return (ordered[(ordered.length-1)>>1]+ordered[ordered.length>>1])/2;
}
async function measure(browser,site){
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
 const page=await context.newPage();
 const failures=[];
 let localRequests=0,externalBlocked=0;
 await page.route('**/*',route=>{
  let url;
  try{url=new URL(route.request().url());}catch(e){externalBlocked++;return route.abort();}
  if(['127.0.0.1','localhost'].includes(url.hostname)){
   localRequests++;return route.continue();
  }
  externalBlocked++;return route.abort();
 });
 page.on('pageerror',e=>failures.push(String(e.message||e)));
 const wallStart=process.hrtime.bigint();
 try{
  await page.goto(site.url,{waitUntil:'load',timeout:30000});
  const elapsedMs=Number(process.hrtime.bigint()-wallStart)/1e6;
  const metrics=await page.evaluate(()=>{
   const n=performance.getEntriesByType('navigation')[0];
   const resources=performance.getEntriesByType('resource');
   const local=resources.filter(r=>r.name.startsWith(location.origin));
   return {
    domContentLoadedMs:Math.round(n.domContentLoadedEventEnd),
    loadEventMs:Math.round(n.loadEventEnd),
    domNodes:document.querySelectorAll('*').length,
    totalLocalEncodedBytes:local.reduce((n,r)=>n+r.encodedBodySize,0),
    localResourceCount:local.length,
    loginVisible:!!document.querySelector('#login:not(.hide)'),
    appHidden:!!document.querySelector('#app.hide')
   };
  });
  return {...metrics,wallMs:+elapsedMs.toFixed(2),localRequests,externalBlocked,failures};
 }finally{
  await context.close();
 }
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 const samples=Object.fromEntries(sites.map(site=>[site.name,[]]));
 try{
  // Alternating order limits systematic variance from warm browser process.
  for(let i=0;i<7;i++){
   for(const site of i%2===0?sites:[...sites].reverse()){
    const result=await measure(browser,site);
    if(result.failures.length)throw Error(site.name+' page errors: '+result.failures.join('; '));
    if(!result.loginVisible || !result.appHidden)throw Error(site.name+' initial login UI did not render');
    samples[site.name].push(result);
   }
  }
 }finally{await browser.close();}
 const summary={};
 for(const site of sites){
  const rows=samples[site.name];
  summary[site.name]={
   medianWallMs:median(rows.map(r=>r.wallMs)),
   medianLoadEventMs:median(rows.map(r=>r.loadEventMs)),
   medianDomContentLoadedMs:median(rows.map(r=>r.domContentLoadedMs)),
   medianTotalLocalEncodedBytes:median(rows.map(r=>r.totalLocalEncodedBytes)),
   medianLocalResourceCount:median(rows.map(r=>r.localResourceCount)),
   medianDOMNodes:median(rows.map(r=>r.domNodes))
  };
 }
 const b=summary['production-main-source'],a=summary['optimized-branch-source'];
 const output={test:'anonymous local HTTP cold loads in headless Chromium (7 per version)',externalRequestsBlocked:true,
  doesNotTest:'Supabase authenticated reads/writes, mobile devices, CDN latency, production LCP/INP, real save latency',
  summary,delta:{wallMs:+(a.medianWallMs-b.medianWallMs).toFixed(2),
  loadEventMs:a.medianLoadEventMs-b.medianLoadEventMs,
  totalLocalEncodedBytes:a.medianTotalLocalEncodedBytes-b.medianTotalLocalEncodedBytes},samples};
 fs.writeFileSync(path.join(out,'cold-load-comparison.json'),JSON.stringify(output,null,2));
 fs.writeFileSync(path.join(out,'COLD_LOAD_REPORT.md'),[
  '# ESTA anonymous browser cold-load comparison',
  '',
  'Seven isolated headless Chromium loads per source; localhost assets only; ALL remote services blocked.',
  '',
  '| Metric | Production main source | Optimized branch |',
  '|---|---:|---:|',
  ...['medianWallMs','medianLoadEventMs','medianDomContentLoadedMs','medianTotalLocalEncodedBytes','medianLocalResourceCount','medianDOMNodes'].map(k=>'| '+k+' | '+b[k]+' | '+a[k]+' |'),
  '',
  '**Interpretation:** This is a static anonymous local-login baseline only, not a real authenticated speed result. Small timing differences are noisy; runtime optimization targets project data polling and operations refresh, not login page startup.',
  ''
 ].join('\n'));
 console.log('ESTA anonymous cold-load comparison '+JSON.stringify({summary,delta:output.delta}));
 if(a.medianTotalLocalEncodedBytes>b.medianTotalLocalEncodedBytes+16384)throw Error('Static login payload grew by over 16KB');
})().catch(error=>{console.error(error);process.exitCode=1;});
