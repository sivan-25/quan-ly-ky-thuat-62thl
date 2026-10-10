const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const M = require('../report-model');
const source = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
const report = source.window.document.getElementById('reportsPage').outerHTML;
const fixture = { snapshot: { tasks: [{ id: 1, d: '2026-09-01', c: '<script>bad()</script>', s: 'Hoàn thành', a: 'Kỹ thuật thử nghiệm' }] }, assets: [{ id: 'a', name: 'Thiết bị thử nghiệm', next_due_date: '2026-10-20' }] };
const tables = { maintenance_assets: 'assets' };
const next = () => new Promise(resolve => setTimeout(resolve, 0));
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
function setup() {
  const dom = new JSDOM('<input id="globalSearch">' + report, { runScripts: 'outside-only', url: 'https://example.test' });
  const w = dom.window;
  const calls = [], posts = [];
  let mode = 'ok', snapshotCalls = 0;
  Object.assign(w, {
    ESTAReportModel: M,
    currentBuilding: { id: 'DEMO', name: 'DỰ ÁN KIỂM THỬ' },
    currentAccount: { id: 'test-user', display_name: 'KIỂM THỬ' },
    centralSession: { access_token: 'LOCAL-TEST-ONLY' },
    projectSync: async () => { snapshotCalls++; return { snapshot: fixture.snapshot }; },
    sbFetch: async (url, options) => {
      calls.push(url);
      if (options.method === 'POST') { posts.push(options.body); if (mode === 'history-error') throw Error('test history failure'); return []; }
      if (mode === 'read-error') throw Error('test read failure');
      const u = new URL(url, 'https://example.test');
      const table = u.pathname.split('/').pop();
      if (mode === 'pagination' && table === 'incidents') return Number(u.searchParams.get('offset')) === 0 ? Array.from({ length: 500 }, (_, id) => ({ id, detected_at: '2026-09-01' })) : [{ id: 501, detected_at: '2026-09-01' }];
      return fixture[tables[table]] || [];
    },
    canProjectEdit: () => mode !== 'viewer',
    pdfSafeFilename: x => x,
    requestPdfSignature: async () => ({ name: 'Kỹ thuật kiểm thử', image_data_url: 'data:image/jpeg;base64,AA==' }),
    pdfSignaturePayload: s => ({ kt_signer_name: s.name, kt_signature_data_url: s.image_data_url }),
    appendPdfSignatureToElement: (root, s) => {
      const el = w.document.createElement('div'); el.className = 'estaPdfSignatureBlock'; el.textContent = s.name; root.appendChild(el); return el;
    },
    centralAuthFetch: async (url, opts) => {
      calls.push(JSON.parse(opts.body));
      if (mode === 'pdf-error') return { ok: false, status: 500, json: async () => ({ error: 'test PDF error' }) };
      return { ok: true, blob: async () => new w.Blob(['%PDF-test'], { type: 'application/pdf' }), headers: new Map() };
    },
    // Shared verifier is separately covered by project-pdf-http.test.cjs.
    // This isolated report-controller test exercises its success and error flows.
    readVerifiedEstaPdf: async res => {
      if (!res.ok) { const error = await res.json(); throw new Error(error.error || 'PDF failed'); }
      return res.blob();
    },
    mediaImgHtml: () => '', hydrateMediaImages: async () => {}, waitForReportImages: async () => {},
    print: () => w.dispatchEvent(new w.Event('afterprint')),
  });
  w.URL.createObjectURL = () => 'blob:local-test'; w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = () => {};
  w.setTimeout = () => 0;
  w.eval(fs.readFileSync(path.join(root, 'report-center.js'), 'utf8'));
  const q = s => w.document.querySelector(s);
  const month = async () => { q('#rcMonth').value = '2026-09'; q('#rcPeriodForm').dispatchEvent(new w.Event('submit', { cancelable: true })); await next(); };
  return { w, q, calls, posts, month, mode: v => mode = v, snapshotCalls: () => snapshotCalls, close: () => w.close() };
}
(async () => {
  await check('Period selection, counts, escaping, select all and none', async () => {
    const t = setup(); await t.w.ESTAReports.open(); await t.month();
    assert.equal(t.q('#demoReportCombinedExport').disabled, false);
    assert.ok(t.q('#rcPreview').textContent.includes('<script>bad()</script>'));
    assert.equal(t.q('#rcPreview script'), null);
    t.q('#rcSelectAll').click(); assert.equal(t.q('#demoReportSelectedCount').textContent, '11 hạng mục');
    t.q('#rcSelectNone').click(); assert.equal(t.q('#demoReportCombinedExport').disabled, true);
    const box = t.q('input[value="maintenance"]'); box.checked = true; box.dispatchEvent(new t.w.Event('change', { bubbles: true }));
    assert.equal(t.q('#demoReportCombinedExport').disabled, false, 'Schedule alone can be exported');
    t.close();
  });
  await check('Invalid dates preserve applied period', async () => {
    const t = setup(); await t.w.ESTAReports.open(); await t.month();
    t.q('[data-demo-report-range="custom"]').click(); t.q('#demoReportFrom').value = '2026-10-30'; t.q('#demoReportTo').value = '2026-10-01';
    t.q('#rcPeriodForm').dispatchEvent(new t.w.Event('submit', { cancelable: true }));
    assert.ok(t.q('#rcRangeHint').classList.contains('is-error')); assert.ok(t.q('#rcPreview').textContent.includes('30/09/2026')); t.close();
  });
  await check('Empty selected period still exports and prints with an explicit explanation', async () => {
    const t = setup(); await t.w.ESTAReports.open();
    t.q('#rcSelectNone').click(); const work = t.q('input[value="work"]'); work.checked = true; work.dispatchEvent(new t.w.Event('change', { bubbles: true }));
    t.q('#rcMonth').value = '2026-10'; t.q('#rcPeriodForm').dispatchEvent(new t.w.Event('submit', { cancelable: true }));
    assert.equal(t.q('#demoReportCombinedExport').disabled, false); assert.equal(t.q('#rcPrint').disabled, false);
    assert.ok(t.q('#rcExportNote').textContent.includes('Không có bản ghi từ 01/10/2026')); assert.ok(t.q('#rcExportNote').textContent.includes('Chưa có dữ liệu'));
    t.q('#demoReportCombinedExport').click(); await next(); await next();
    const payload = t.calls.find(x => x.report_type === 'operations');
    assert.equal(payload.kt_signer_name, 'Kỹ thuật kiểm thử'); assert.ok(payload.kt_signature_data_url.startsWith('data:image/'));
    assert.equal(payload.counts.records, 0); assert.equal(payload.sections.length, 1); assert.equal(payload.sections[0].rows.length, 0); assert.equal(payload.range.from, '2026-10-01');
    assert.equal(t.posts.length, 1); assert.equal(t.posts[0].period_from, '2026-10-01');
    let printed = 0; t.w.print = () => { printed++; t.w.dispatchEvent(new t.w.Event('afterprint')); };
    t.q('#rcPrint').click(); await next(); await next(); assert.equal(printed, 1); t.close();
  });
  await check('Suggested month changes only on click and retains selected modules', async () => {
    const t = setup(); await t.w.ESTAReports.open(); t.q('#rcSelectNone').click();
    const work = t.q('input[value="work"]'); work.checked = true; work.dispatchEvent(new t.w.Event('change', { bubbles: true }));
    t.q('#rcMonth').value = '2026-10'; t.q('#rcPeriodForm').dispatchEvent(new t.w.Event('submit', { cancelable: true }));
    assert.equal(t.q('#rcMonth').value, '2026-10'); assert.equal(t.q('#rcLatestPeriod').classList.contains('hide'), false);
    assert.ok(t.q('#rcLatestPeriod').textContent.includes('09/2026'));
    t.q('#rcLatestPeriod').click(); assert.equal(t.q('#rcMonth').value, '2026-09'); assert.ok(t.q('#rcPreview').textContent.includes('1 bản ghi'));
    assert.equal(t.q('#demoReportSelectedCount').textContent, '1 hạng mục'); assert.equal(t.q('#rcExportState').classList.contains('hide'), true); t.close();
  });
  await check('A project without any records has no fabricated month suggestion', async () => {
    const t = setup(); t.w.projectSync = async () => ({ snapshot: {} }); await t.w.ESTAReports.open();
    assert.equal(t.q('#demoReportCombinedExport').disabled, false); assert.equal(t.q('#rcLatestPeriod').classList.contains('hide'), true);
    t.q('#rcSelectNone').click(); assert.equal(t.q('#demoReportCombinedExport').disabled, true); assert.ok(t.q('#rcExportNote').textContent.includes('Chọn ít nhất')); t.close();
  });
  await check('Incomplete reads block export and clear history', async () => {
    const t = setup(); await t.w.ESTAReports.open(); t.mode('read-error'); await t.w.ESTAReports.open();
    assert.equal(t.q('#demoReportCombinedExport').disabled, true); assert.ok(t.q('#rcMessage').classList.contains('is-error')); assert.equal(t.q('#rcHistoryCount').textContent, '0 báo cáo'); t.close();
  });
  await check('Pagination loads more than 500 records', async () => {
    const t = setup(); t.mode('pagination'); await t.w.ESTAReports.open(); await t.month();
    assert.ok(t.q('#rcPreview').textContent.includes('501 bản ghi')); assert.ok(t.calls.some(x => typeof x === 'string' && x.includes('offset=500'))); t.close();
  });
  await check('Reopening refreshes source; history search does not reload', async () => {
    const t = setup(); await t.w.ESTAReports.open(); await t.w.ESTAReports.open(); assert.equal(t.snapshotCalls(), 2);
    t.w.ESTAReports.renderHistory(); assert.equal(t.snapshotCalls(), 2); t.close();
  });
  await check('Successful PDF writes selected report history; viewer does not write', async () => {
    const t = setup(); await t.w.ESTAReports.open(); await t.month();
    t.q('#demoReportCombinedExport').click(); await next(); await next();
    assert.equal(t.posts.length, 1); assert.equal(t.posts[0].building_id, 'DEMO'); assert.equal(t.posts[0].period_from, '2026-09-01');
    t.mode('viewer'); t.q('#demoReportCombinedExport').click(); await next(); await next(); assert.equal(t.posts.length, 1); t.close();
  });
  await check('PDF failure is recoverable and never records a successful export', async () => {
    const t = setup(); await t.w.ESTAReports.open(); await t.month(); t.mode('pdf-error'); t.q('#demoReportCombinedExport').click(); await next(); await next();
    assert.equal(t.posts.length, 0); assert.equal(t.q('#demoReportCombinedExport').disabled, false); assert.ok(t.q('#rcMessage').textContent.includes('chưa thành công')); t.close();
  });
  await check('History failure keeps successful PDF result explicit', async () => {
    const t = setup(); await t.w.ESTAReports.open(); await t.month(); t.mode('history-error'); t.q('#demoReportCombinedExport').click(); await next(); await next();
    assert.ok(t.q('#rcMessage').textContent.includes('Chưa lưu được lịch sử')); t.close();
  });
  await check('Print expands and restores report details', async () => {
    const t = setup(); await t.w.ESTAReports.open(); await t.month(); const before = [...t.w.document.querySelectorAll('details')].map(x => x.open);
    t.q('#rcPrint').click(); await next(); await next(); assert.deepEqual([...t.w.document.querySelectorAll('details')].map(x => x.open), before); t.close();
  });
  await check('Slow response from old project cannot replace new project', async () => {
    const t = setup(); let release;
    t.w.projectSync = (action, body, id) => id === 'DEMO' ? new Promise(resolve => release = resolve) : Promise.resolve({ snapshot: { tasks: [] } });
    const old = t.w.ESTAReports.open(); t.w.currentBuilding = { id: 'NEXT', name: 'DỰ ÁN TIẾP THEO' }; await t.w.ESTAReports.open();
    release({ snapshot: fixture.snapshot }); await old; assert.ok(t.q('#rcPreview').textContent.includes('DỰ ÁN TIẾP THEO')); assert.ok(!t.q('#rcPreview').textContent.includes('bad()')); t.close();
  });
  console.log(passed + ' controller tests passed');
})().catch(e => { console.error(e); process.exitCode = 1; });
