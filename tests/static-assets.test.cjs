'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const urls = [...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)]
  .map(match => match[2]);

const local = urls
  .filter(url => !/^(?:https?:)?\/\//i.test(url) && !url.startsWith('data:'))
  .map(url => url.split(/[?#]/, 1)[0].replace(/^\//, ''))
  .filter(url => /\.(?:css|js)$/i.test(url));

assert(local.length > 0, 'No local CSS/JS references found in index.html');

const missing = local.filter(url => !fs.existsSync(path.join(root, url)));
assert.deepEqual(missing, [], 'Missing local frontend assets');

const bytes = local.reduce((sum, url) => sum + fs.statSync(path.join(root, url)).size, 0);
const css = local.filter(url => url.endsWith('.css')).length;
const js = local.filter(url => url.endsWith('.js')).length;

console.log('ESTA static asset references: OK');
console.log(`Local CSS files: ${css}; local JS files: ${js}; referenced source bytes: ${bytes}`);
console.log('Note: this is not a runtime, accessibility, visual, performance, or PDF regression test.');
