'use strict';
// Regression gate for install metadata and mobile navigation. No Supabase credentials needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const html = read('index.html');
const manifest = JSON.parse(read('manifest.webmanifest'));
const sw = read('sw.js');
const mobile = read('esta-mobile.js');
const css = read('esta-mobile.css');

assert.equal(manifest.start_url, '/');
assert.equal(manifest.scope, '/');
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.icons.some(icon => icon.src === '/icons/icon-maskable-512.png' && icon.purpose === 'maskable'), 'Android adaptive icon must use its own maskable asset');
assert.equal(manifest.lang, 'vi');
assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
assert.match(html, /apple-mobile-web-app-capable/);
assert.match(html, /id="estaBottomNav"/);
assert.match(html, /src="pwa-register\.js\?/);
assert.match(html, /src="esta-mobile\.js\?/);
assert.match(html, /href="esta-mobile\.css\?/);
for (const [name, width] of [['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const bytes = fs.readFileSync(path.join(root, 'icons', name));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16), width);
  assert.equal(bytes.readUInt32BE(20), width);
}
for (const entry of manifest.icons) assert.ok(fs.existsSync(path.join(root, entry.src)));
for (const key of ['home', 'work', 'energy', 'inventory', 'more']) {
  assert.ok(html.includes('data-esta-' + (key === 'more' ? 'action' : 'nav') + '="' + key + '"'));
}
assert.match(mobile, /source\.click\(\)/);
assert.match(mobile, /source\.classList\.contains\("hide"\)/);
assert.match(mobile, /MutationObserver/);
assert.match(css, /@media \(max-width:760px\)/);
assert.match(css, /@media\(min-width:761px\)/);
assert.match(sw, /req\.mode === "navigate"/);
assert.match(sw, /url\.origin !== self\.location\.origin/);
assert.ok(!/cache\.put\(req/.test(sw), 'No private documents/API in the offline cache');
console.log('ESTA PWA metadata, icon dimensions, mobile routes and static privacy checks: OK');
