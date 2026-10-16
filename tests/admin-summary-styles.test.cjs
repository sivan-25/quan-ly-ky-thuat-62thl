'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

(async () => {
  const html = '<!doctype html><html><head></head><body><div id="homePage"></div><nav id="navAdmin"></nav></body></html>';
  const dom = new JSDOM(html, { url: 'https://esta.test/', runScripts: 'outside-only' });
  const w = dom.window, docs = w.document;
  const captured = [];
  const records = [{
    building: { id: '68PĐL', name: '68 Phan Đăng Lưu' },
    snapshot: { tasks: [{
      id: 1, d: '2026-10-15', c: 'Kiểm tra FCU tầng 17', s: 'Đang thực hiện',
      t: 'Sự cố', a: 'Sĩ Văn', n: 'Đang xử lý', imgs: ['storage:photos/test.jpg']
    }] },
    ops: {}
  }];
  w.currentAccount = { is_admin: true };
  w.projectOverviewActive = false;
  w.centralSession = { access_token: 'TEST-SESSION' };
  w.ESTAReportModel = { localDay: () => '2026-10-16' };
  w.sbFetch = async (url) => url.includes('admin-overview') ? { rows: records } : [];
  w.exportGenericEstaPdf = async config => { captured.push(config); return true; };
  w.eval(fs.readFileSync(path.join(__dirname, '..', 'admin-summary-report.js'), 'utf8'));
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));
  const settle = async () => { for (let i=0;i<5;i++) await tick(); };
  w.ESTAAdminSummary.open();
  await settle();
  const exportButton = docs.querySelector('#asExport');
  assert(exportButton, 'Export PDF button must exist');
  assert.equal(exportButton.disabled, false, 'The user can export fully loaded data');
  exportButton.click();
  const dlg = docs.querySelector('#asFormatDialog');
  assert(dlg && !dlg.hidden, 'Clicking export opens format choices');
  assert.equal(docs.querySelectorAll('[data-as-format]').length, 2);
  docs.querySelector('[data-as-format="standard"]').click();
  await settle();
  assert.equal(dlg.hidden, true);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].reportStyle, undefined, 'Old format stays unchanged');
  assert.equal(captured[0].rows.length, 1);
  assert.equal(captured[0].photos.length, 1);
  exportButton.click();
  docs.querySelector('[data-as-format="executive"]').click();
  await settle();
  assert.equal(captured.length, 2);
  assert.equal(captured[1].reportStyle, 'executive');
  assert.equal(captured[1].executiveItems.length, 1);
  assert.equal(captured[1].executiveItems[0].project, '68 PĐL');
  assert.equal(captured[1].executiveImageCount, 1);
  assert.ok(captured[1].filename.includes('Kieu2_'));
  exportButton.click();
  docs.querySelector('#asFormatCancel').click();
  assert.equal(dlg.hidden, true, 'Cancel never exports a third PDF');
  assert.equal(captured.length, 2);
  dom.window.close();
  console.log('Admin PDF dual-format menu: OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
