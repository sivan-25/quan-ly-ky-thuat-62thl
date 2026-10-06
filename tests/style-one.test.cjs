const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');

const wait=(ms=40)=>new Promise(resolve=>setTimeout(resolve,ms));

(async()=>{
  const dom=new JSDOM(`
    <div id="app">
      <button id="navWork">Công việc</button>
      <button id="menu"></button>
      <button id="logout"></button>
      <button id="backupBtn"></button>
      <button id="restoreBtn"></button>
      <button id="exportBtn"></button>
      <main>
        <div id="homePage">
          <section class="homeWelcome"></section>
          <section class="homeKpis"></section>
        </div>
      </main>
      <img id="fixtureImage" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==">
    </div>
  `,{runScripts:'outside-only',url:'https://fixture.test',pretendToBeVisual:true});

  const w=dom.window;
  w.eval(`
    var currentBuilding={id:'127HH'};
    var load=()=>[
      {s:'Đã hoàn thành'},
      {s:'Đang thực hiện'},
      {s:'Bắt đầu'}
    ];
  `);
  w.eval(fs.readFileSync(path.join(__dirname,'../style-one.js'),'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  await wait();

  const app=w.document.getElementById('app');
  assert.equal(app.classList.contains('styleOnePilot'),true,'127HH must enable Style 1');
  assert.ok(w.document.getElementById('styleOneInsights'),'127HH must render insights');
  assert.equal(w.document.getElementById('styleOneTotal').textContent,'3');
  assert.equal(w.document.getElementById('styleOneDoing').textContent,'1');
  assert.equal(w.document.getElementById('styleOneDone').textContent,'1');
  assert.equal(w.document.getElementById('styleOneRate').textContent,'33%');
  assert.equal(w.document.getElementById('fixtureImage').loading,'lazy');
  assert.equal(w.document.getElementById('fixtureImage').decoding,'async');

  w.eval("currentBuilding.id='62THL'");
  app.dispatchEvent(new w.Event('click',{bubbles:true}));
  await wait();
  assert.equal(app.classList.contains('styleOnePilot'),false,'non-pilot project must remain unchanged');
  assert.equal(w.document.getElementById('styleOneInsights'),null,'insights must be removed outside pilot');

  w.eval("currentBuilding.id='DEMO'");
  w.dispatchEvent(new w.Event('focus'));
  await wait();
  assert.equal(app.classList.contains('styleOnePilot'),true,'DEMO must enable Style 1');

  dom.window.close();
  console.log('PASS Style 1 isolation: DEMO + 127HH only, metrics, lazy images, and safe project switching.');
})().catch(error=>{console.error(error);process.exit(1)});
