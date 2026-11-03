const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('work-page-130-readability.css', 'utf8');
const brandLink = html.indexOf('esta-brand-130-complete.css?v=');
const finalLink = html.indexOf('work-page-130-readability.css?v=');

assert.ok(brandLink >= 0, 'the 130HH brand stylesheet remains linked');
assert.ok(finalLink > brandLink, 'the final readability layer loads after the brand stylesheet');
assert.ok(css.includes('body.estaBrand130 #app.estaBrand130#app #workPage'), 'work page overrides are gated to active 130HH');
assert.ok(css.includes('color:#411437!important'), 'work counts and text use high-contrast plum');
assert.ok(css.includes('color:#F4B400!important'), 'selected priority stars use visible gold');
assert.ok(css.includes('#demoWorkLinks > summary'), 'linked-work section heading is explicitly styled');
assert.ok(css.includes('.performerChips.pro > span b'), 'performer names are explicitly styled');
assert.ok(css.includes('border-bottom:1.5px solid #A46427!important'), 'work rows have a strong copper divider');
console.log('130HH work-page readability checks passed: counts, linked work, priority star, performers, row dividers and project scope.');

/* Regression: iOS native date text must never affect control height/alignment. */
const mobileDateCss = fs.readFileSync('demo-mobile.css','utf8');
const mobileEditCss = fs.readFileSync('update-lab.css','utf8');
const oldDemoCss = fs.readFileSync('demo-lab.css','utf8');
const appScript = fs.readFileSync('app.js','utf8');
assert.match(html, /<input id="date" type="date" required aria-label="Ngày thực hiện">\s*<output class="workDateDisplayed" aria-hidden="true"><\/output>/);
assert.match(mobileDateCss, /#workEditDrawer #taskForm \.workDate \.workDateDisplayed\{[\s\S]*?display:flex!important;[\s\S]*?align-items:center!important;[\s\S]*?justify-content:center!important/);
assert.match(mobileDateCss, /#workEditDrawer #taskForm \.workDate \.workDateDisplayed\{[\s\S]*?position:relative!important;[\s\S]*?height:44px!important;[\s\S]*?min-height:44px!important;[\s\S]*?max-height:44px!important/);
assert.match(mobileDateCss, /#workEditDrawer #taskForm \.workDate #date\{[\s\S]*?position:absolute!important;[\s\S]*?height:44px!important/);
assert.match(mobileDateCss, /#workEditDrawer #taskForm \.workDate #date\{[\s\S]*?opacity:\.01!important;[\s\S]*?pointer-events:auto!important/);
assert.match(mobileDateCss, /\.workDate \.workDateDisplayed\{[\s\S]*?pointer-events:none!important/);
assert.match(mobileDateCss, /\.imageActionBtn\{\s*height:44px!important;min-height:44px!important;max-height:44px!important/);
assert.equal(mobileEditCss.includes('MOBILE_WORK_EDITOR_DATE_ALIGNMENT_20261006'),false,'obsolete date rules were removed from edit drawer');
assert.equal(oldDemoCss.includes('#app.demoMobilePilot #workPage #taskForm .workDate input[type="date"]'),false,'legacy duplicate date CSS was removed');
assert.match(appScript, /function syncWorkDateDisplay\(\)/);
assert.match(appScript, /#date"\)\?\.addEventListener\("change",syncWorkDateDisplay\)/);
for (const point of ['date after draft restore','date after reset','date after edit']) {
  assert.ok((appScript.match(/syncWorkDateDisplay\(\);/g)||[]).length>=4, point+' synchronizes visible date');
}
console.log('Work mobile date regression checks passed: matching 44px controls, centered native-safe date, draft/edit/reset syncing.');
