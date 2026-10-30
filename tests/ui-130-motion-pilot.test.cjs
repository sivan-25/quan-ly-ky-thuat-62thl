const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('esta-brand-130-complete.css','utf8'),demo=fs.readFileSync('demo-lab.js','utf8');
assert.match(html,/esta-brand-130-complete.css\?v=20261030-130hh-classic-contrast02/);
assert.doesNotMatch(html,/ui-130-motion-pilot.css/);
for(const token of ['--esta130-plum:#411437','--esta130-cream:#F3DEBF','--esta130-copper:#A46427','--esta130-copper-ink:#82491D','prefers-reduced-motion:reduce',':focus-visible','min-height:44px'])assert.ok(css.includes(token),token);
assert.ok(demo.includes('buildingId!=="130HH"||Date.now()-(demoCache.loadedAt||0)<15000'));
assert.ok(demo.includes('demoLoad(String(currentBuilding?.id||"")!=="130HH")'));
assert.ok(demo.includes('buildingId==="130HH"&&!syncResult'));
assert.ok(demo.includes('if(buildingId!=="130HH")await new Promise'));
console.log('PASS 130HH scoped cache, save acknowledgement, consolidated brand and mobile interaction');

// WCAG AA normal-text contrast for the core light theme combinations.
function luminance(h){const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)}
for(const [fg,bg] of [['#2B1526','#F3DEBF'],['#411437','#F5ECD0'],['#625045','#FBF3E3'],['#82491D','#F5ECD0'],['#F3DEBF','#411437'],['#8A5A00','#FFF0B3']])assert.ok(contrast(fg,bg)>=4.5,'low contrast '+fg+' / '+bg);
