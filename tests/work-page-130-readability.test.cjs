const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('work-page-130-readability.css', 'utf8');
const brandLink = html.indexOf('esta-brand-130-complete.css?v=20261030-130hh-slate-blue01');
const finalLink = html.indexOf('work-page-130-readability.css?v=20261030-130hh-slate-blue01');

assert.ok(brandLink >= 0, 'the 130HH brand stylesheet remains linked');
assert.ok(finalLink > brandLink, 'the final readability layer loads after the brand stylesheet');
assert.ok(css.includes('body.estaBrand130 #app.estaBrand130#app #workPage'), 'work page overrides are gated to active 130HH');
assert.ok(css.includes('color:#1E293B!important'), 'work counts and text use high-contrast navy');
assert.ok(css.includes('color:#8A5A00!important'), 'selected priority stars use readable dark amber');
assert.ok(css.includes('#demoWorkLinks > summary'), 'linked-work section heading is explicitly styled');
assert.ok(css.includes('.performerChips.pro > span b'), 'performer names are explicitly styled');
assert.ok(css.includes('border-bottom:1.5px solid #94A3B8!important'), 'work rows have a accessible slate divider');
console.log('130HH work-page readability checks passed: counts, linked work, priority star, performers, row dividers and project scope.');
