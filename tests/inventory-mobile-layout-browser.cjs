'use strict';
/* DOM geometry and foreground contrast of both mobile inventory tabs.
   Static fixture: no account or inventory mutations and no external requests. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

function components(c){
  const m=String(c).match(/rgba?\(([^)]+)\)/);
  if(!m)throw Error('Expected rgb color, received '+c);
  return m[1].split(',').slice(0,3).map(x=>Number(x.trim()));
}
function luminance(rgb){
  const a=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});
  return a[0]*.2126+a[1]*.7152+a[2]*.0722;
}
function contrast(fg,bg){const a=luminance(components(fg)),b=luminance(components(bg));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)}
const screenWidths=[320,375,390,430],projects=['130HH','127HH','62THL','68PĐL'];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const dir='visual-artifacts/inventory-phone';
 fs.mkdirSync(dir,{recursive:true});
 try{
  for(const width of screenWidths)for(const id of projects)for(const tab of ['materials','tools']){
    const ctx=await browser.newContext({viewport:{width,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:1});
    const page=await ctx.newPage();
    await page.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.hostname==='127.0.0.1'&& !url.pathname.endsWith('.js'))return route.continue();
      return route.abort();
    });
    await page.goto('http://127.0.0.1:8766/',{waitUntil:'load'});
    const metrics=await page.evaluate(({id,tab})=>{
      const $=s=>document.querySelector(s);
      $('#login').classList.add('hide');
      const app=$('#app');app.classList.remove('hide');app.classList.add('demoMobilePilot','inventoryMode','updateProjectMode','estaFourProjectCompact');
      app.classList.toggle('estaBrand130',id==='130HH');
      document.body.classList.toggle('estaBrand130',id==='130HH');
      $('#quickReturnAdmin').classList.remove('hide');
      $('#topInventoryTitle').classList.remove('hide');
      const inv=$('#inventoryPage');inv.classList.remove('hide');inv.classList.add('inventoryRefShared','inventorySharedMobileCompact');
      if(id==='130HH')inv.classList.add('inventoryRef130');
      if(id==='127HH')inv.classList.add('inventoryRef127');
      $('#inventoryMaterialsPane').classList.toggle('hide',tab!=='materials');
      $('#inventoryToolsPane').classList.toggle('hide',tab!=='tools');
      for(const btn of document.querySelectorAll('[data-inventory-tab]'))btn.classList.toggle('active',btn.dataset.inventoryTab===tab);
      const command=$('#inventoryPage .inventoryCommandControls');
      const pdf=document.createElement('div');pdf.className='inventory130PdfMenu';pdf.id='inventory130PdfMenu';
      pdf.innerHTML='<button id="inventory130PdfTrigger">↓ Xuất file ▾</button><div id="inventory130PdfDropdown" class="inventory130PdfDropdown" hidden>Xuất PDF</div>';
      command.insertBefore(pdf,command.querySelector('.inventoryCommandMeta'));
      const strip=document.createElement('div');strip.id='updateInventoryIntel';strip.textContent='TỒN KHO';
      inv.prepend(strip);
      $('#materialMobileCards').innerHTML='<article class="invMobileCard130"><div class="invMobileCardName"><strong>Cảm biến bồn tiểu</strong><small>Thiết bị vật tư</small></div><div class="invMobileValue"><span>Tồn cuối</span><b>3</b></div></article>';
      $('#toolsMobileCards').innerHTML='<article class="estaToolCard"><div class="invMobileCardHead"><div class="invMobileCardName"><strong>Máy đo nhiệt</strong><small>FLUKE</small></div><span class="toolCondition good">Đang dùng</span></div></article>';
      const rect=s=>{const e=$(s),r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,visible:getComputedStyle(e).display!=='none'}};
      const tabs=[...document.querySelectorAll('#inventoryPage .inventoryLocalTabs button')].map(e=>{
        const text=e.querySelector('span'),cs=getComputedStyle(e),ts=getComputedStyle(text);
        return {name:e.dataset.inventoryTab,active:e.classList.contains('active'),
         foreground:cs.webkitTextFillColor||cs.color,background:cs.backgroundColor,
         spanForeground:ts.webkitTextFillColor||ts.color,spanBorder:ts.borderTopWidth,
         spanShadow:ts.boxShadow,rect:rect('#inventoryPage [data-inventory-tab="'+e.dataset.inventoryTab+'"]')};
      });
      const colors = sel=>{const e=$(sel),cs=getComputedStyle(e);return {color:cs.webkitTextFillColor||cs.color,bg:cs.backgroundColor}};
      const result={
        header:rect('header.estaTopbar'),command:rect('#inventoryPage .inventoryCommand'),
        title:rect('#inventoryPage .inventory130PageTitle'),pdf:rect('#inventory130PdfTrigger'),
        tabs,tabsWrap:rect('#inventoryPage .inventoryLocalTabs'),stripVisible:getComputedStyle($('#updateInventoryIntel')).display!=='none',
        horizOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+3
      };
      if(tab==='tools'){
        result.toolbar=rect('#inventoryToolsPane>.inventorySectionBar');
        result.actionGrid=rect('#inventoryToolsPane .inventoryToolbarActions');
        result.toolSearch=rect('#inventoryToolsPane .inventorySearch');
        const inputStyle=getComputedStyle($('#toolSearch'));
        result.toolInputBorder=inputStyle.borderTopWidth;
        result.toolInputShadow=inputStyle.boxShadow;
        result.status=rect('#toolStatusFilter');result.add=rect('#addToolBtn');result.export=rect('#toolExportPdf');
        result.stats=rect('#inventoryToolsPane .toolsStats');
        result.statCards=[...document.querySelectorAll('#inventoryToolsPane .toolsStats article')].map(e=>{
          const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,h:r.height,bg:getComputedStyle(e).backgroundImage}
        });
        result.statColor=colors('#inventoryToolsPane .toolsStats article small');
        result.statBackground=getComputedStyle($('#inventoryToolsPane .toolsStats article')).backgroundColor;
        result.toolCardBackground=getComputedStyle($('#inventoryToolsPane .estaToolCard')).backgroundColor;
        result.condition=colors('#inventoryToolsPane .estaToolCard .toolCondition.good');
        result.conditionFill=getComputedStyle($('#inventoryToolsPane .estaToolCard .toolCondition.good')).webkitTextFillColor;
        result.quickAdd=colors('#inventoryToolsPane .toolsQuickAdd');
        result.quickAddTitle=colors('#inventoryToolsPane .toolsQuickAdd .inventoryQuickAddHead h3');
      } else {
        result.material=rect('#materialMobileCards .invMobileCard130');
        result.materialBackground=getComputedStyle($('#materialMobileCards .invMobileCard130')).backgroundColor;
        result.materialTitle=colors('#materialMobileCards .invMobileCardName strong');
        result.materialSub=colors('#materialMobileCards .invMobileCardName small');
      }
      return result;
    },{id,tab});
    const key=id+'-'+tab+'-'+width;
    assert.ok(metrics.header.h<=96,key+' header too tall: '+metrics.header.h);
    assert.ok(metrics.command.h<190,key+' command area has oversized blank space: '+metrics.command.h);
    assert.equal(metrics.stripVisible,false,key+' duplicates old low stock banner');
    assert.equal(metrics.horizOverflow,false,key+' horizontal overflow');
    assert.ok(Math.abs(metrics.title.y-metrics.pdf.y)<15,key+' PDF should be aligned with title');
    assert.equal(metrics.tabs.length,2);
    for(const t of metrics.tabs){
      assert.ok(contrast(t.foreground,t.background)>=4.5,key+' '+t.name+' tab contrast '+contrast(t.foreground,t.background).toFixed(2));
      assert.ok(contrast(t.spanForeground,t.background)>=4.5,key+' '+t.name+' span contrast');
      assert.ok(Math.abs(t.rect.h-44)<1,key+' '+t.name+' must be 44px');
      assert.equal(t.spanBorder,'0px',key+' '+t.name+' has nested button border');
      assert.equal(t.spanShadow,'none',key+' '+t.name+' has nested button shadow');
    }
    if(tab==='tools'){
      assert.equal(metrics.toolSearch.visible,true,key+' search hidden');
      assert.equal(metrics.toolInputBorder,'0px',key+' search input has a duplicate border');
      assert.equal(metrics.toolInputShadow,'none',key+' search input has a duplicate shadow');
      assert.ok(metrics.toolbar.bottom<=metrics.stats.y+1,key+' toolbar overlaps KPI: '+JSON.stringify({toolbar:metrics.toolbar,stats:metrics.stats}));
      assert.ok(metrics.stats.y>=metrics.actionGrid.bottom,key+' actions overlap stats');
      assert.ok(Math.abs(metrics.status.y-metrics.add.y)<2&&Math.abs(metrics.add.y-metrics.export.y)<2,key+' actions not in one row');
      assert.ok(metrics.export.right<=width+1,key+' export leaves viewport');
      assert.ok(metrics.statCards.length===4,key+' expected four cards');
      for(const c of metrics.statCards){
        assert.ok(Math.abs(c.y-metrics.statCards[0].y)<1,key+' four KPI cards must occupy one row');
        assert.ok(Math.abs(c.h-44)<1,key+' KPI must be 44px high, got '+c.h);
      }
      for(let i=1;i<4;i++)assert.ok(metrics.statCards[i].x>metrics.statCards[i-1].x,key+' KPI columns not ordered');
      assert.ok(metrics.statCards[3].right<=width+1,key+' four KPIs overflow the phone');
      assert.ok(contrast(metrics.statColor.color,metrics.statBackground)>=4.5,key+' KPI label contrast too low');
      assert.ok(contrast(metrics.statColor.color,metrics.statBackground)<20,key+' KPI palette unexpectedly stark');
      assert.notEqual(metrics.toolCardBackground,'rgb(255, 255, 255)',key+' tool cards must not be stark white');
      assert.ok(contrast(metrics.condition.color,metrics.condition.bg)>=4.5,key+' status label unreadable');
      assert.equal(metrics.condition.color,metrics.conditionFill,key+' status iOS text fill mismatch');
      assert.ok(contrast(metrics.quickAddTitle.color,metrics.quickAdd.bg)>=4.5,key+' quick-add title unreadable');
      assert.ok(contrast(metrics.quickAdd.color,metrics.quickAdd.bg)>=4.5,key+' quick-add foreground unreadable');
    }else{
      assert.ok(contrast(metrics.materialTitle.color,metrics.materialBackground)>=4.5,key+' material title unreadable');
      assert.ok(contrast(metrics.materialSub.color,metrics.materialBackground)>=4.5,key+' material subtitle unreadable');
    }
    await page.screenshot({path:path.join(dir,key+'.png'),fullPage:false});
    console.log('PASS',key,JSON.stringify({header:Math.round(metrics.header.h),command:Math.round(metrics.command.h),tabs:metrics.tabs.map(t=>contrast(t.foreground,t.background).toFixed(1)),statsTop:Math.round(metrics.stats?.y||0)}));
    await ctx.close();
  }
 }finally{await browser.close()}
 console.log('PASS 32 mobile inventory tab/viewport/project combinations');
})().catch(e=>{console.error(e);process.exitCode=1});
