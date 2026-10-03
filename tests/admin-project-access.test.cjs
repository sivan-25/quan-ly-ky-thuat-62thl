const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

(async () => {
  const root = path.resolve(__dirname, '..');
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  w.matchMedia = () => ({matches: false, addEventListener() {}, addListener() {}});
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.fetch = async () => { throw new Error('Unexpected network request in isolated test'); };
  w.eval(fs.readFileSync(path.join(root, 'app.js'), 'utf8') + `\nwindow.__setTestContext=(account,session)=>{currentAccount=account;centralSession=session;}; window.__setTestFetch=fn=>{sbFetch=fn;}; window.__setTestBuilding=b=>{currentBuilding=b;}; window.__setTestEnterProject=fn=>{enterProject=fn;};`);
  const projects = [{id:'62THL', name:'62 Trần Huy Liệu'}, {id:'68PĐL', name:'68 PĐL'}, {id:'130HH', name:'130 Hồng Hà'}];
  let users = [{id:'technical-test', username:'test', display_name:'Kỹ thuật thử', active:true,
    buildings:[{...projects[0], role:'editor'}, {...projects[1], role:'viewer'}]}];
  const calls = [];
  let failSave = false;
  w.__requests = async (url, options) => {
    const body = options.body;
    calls.push(body);
    if (body.action === 'list') return {users};
    if (body.action === 'set_buildings') {
      if (failSave) throw new Error('Lỗi thử nghiệm: quyền cũ được giữ');
      users = users.map(u => u.id === body.user_id ? {...u, buildings:body.memberships.map(m => ({
        ...projects.find(p => p.id === m.building_id), role:m.role
      }))} : u);
    }
    return {ok:true};
  };
  w.__setTestContext({is_admin:true,buildings:projects},{access_token:'TEST'}); w.__setTestFetch(w.__requests); w.renderAdminProjects();
  const $ = selector => w.document.querySelector(selector);
  const checks = id => [...w.document.querySelectorAll(`#${id} input[type=checkbox]`)];
  const change = el => el.dispatchEvent(new w.Event('change', {bubbles:true}));
  const submit = id => $(id).onsubmit({preventDefault() {}});
  assert.equal(checks('adminCreateProjectPicker').length, 3);
  assert.equal(checks('adminCreateProjectPicker').filter(x => x.checked).length, 0);
  checks('adminCreateProjectPicker')[0].click(); checks('adminCreateProjectPicker')[1].click();
  assert.match($('#adminCreateProjectPicker').textContent, /Đã chọn 2 \/ 3/);
  $('#adminUsername').value = 'technical-test'; $('#adminDisplayName').value = 'Kỹ thuật thử'; $('#adminPassword').value = 'test-only-password';
  await submit('#adminCreateAccountForm');
  const create = calls.find(x => x.action === 'create');
  assert.deepEqual([...create.building_ids], ['62THL', '68PĐL']);
  assert.equal(create.role, 'editor');
  assert.equal(checks('adminCreateProjectPicker').filter(x => x.checked).length, 0);
  const createCount = calls.filter(x => x.action === 'create').length;
  await submit('#adminCreateAccountForm');
  assert.equal(calls.filter(x => x.action === 'create').length, createCount);
  assert.match($('#toast').textContent, /ít nhất một dự án/);
  await w.renderAdminUsers();
  assert.equal([...w.document.querySelectorAll('.adminUserActions button')].filter(x => x.textContent === 'Chọn dự án').length, 1);
  w.adminEditUserProjects('technical-test');
  assert.equal(checks('adminEditProjectPicker').filter(x => x.checked).length, 2);
  assert.equal(checks('adminEditProjectPicker')[1].closest('.adminProjectChoice').querySelector('select').value, 'viewer');
  checks('adminEditProjectPicker')[0].click(); checks('adminEditProjectPicker')[2].click();
  await submit('#adminProjectAccessForm');
  const save = calls.find(x => x.action === 'set_buildings');
  assert.deepEqual(JSON.parse(JSON.stringify(save.memberships.map(x => [x.building_id, x.role]))), [['68PĐL','viewer'], ['130HH','editor']]);
  assert.equal($('#adminProjectAccessEditor').classList.contains('hide'), true);
  assert.match($('#adminUsersList').textContent, /130 Hồng Hà/);
  w.adminEditUserProjects('technical-test');
  $('#adminEditProjectPicker [data-project-pick=none]').click();
  const saveCount = calls.filter(x => x.action === 'set_buildings').length;
  await submit('#adminProjectAccessForm');
  assert.equal(calls.filter(x => x.action === 'set_buildings').length, saveCount);
  assert.match($('#adminProjectAccessError').textContent, /ít nhất một dự án/);
  $('#adminEditProjectPicker [data-project-pick=all]').click();
  failSave = true;
  await submit('#adminProjectAccessForm');
  assert.equal($('#adminProjectAccessEditor').classList.contains('hide'), false);
  assert.equal(checks('adminEditProjectPicker').filter(x => x.checked).length, 3);
  assert.match($('#adminProjectAccessError').textContent, /quyền cũ được giữ/);
  assert.equal($('#adminSaveProjectAccess').disabled, false);
  $('#adminCancelProjectAccess').click();
  assert.equal($('#adminProjectAccessEditor').classList.contains('hide'), true);
  w.__setTestContext({is_admin:false,buildings:users[0].buildings},{access_token:'TEST'}); w.__setTestBuilding(users[0].buildings[0]); w.renderTechnicalProjectSwitcher();
  assert.equal($('#technicalProjectSwitcher').classList.contains('hide'), false);
  assert.deepEqual([...$('#technicalProjectSelect').options].map(x => x.value), ['68PĐL','130HH']);
  w.__open = async b => {w.__opened = b; w.__setTestBuilding(b);};
  w.__setTestEnterProject(w.__open);
  $('#technicalProjectSelect').value = '130HH';
  await $('#technicalProjectSelect').onchange({target:$('#technicalProjectSelect')});
  assert.equal(w.__opened.id, '130HH'); assert.equal(w.__opened.role, 'editor');
  assert.equal($('#technicalProjectSelect').disabled, false);
  w.adminEditUserProjects('technical-test');
  assert.equal($('#adminProjectAccessEditor').classList.contains('hide'), true);
  w.__setTestContext({is_admin:false,buildings:users[0].buildings.slice(0,1)},{access_token:'TEST'}); w.renderTechnicalProjectSwitcher();
  assert.equal($('#technicalProjectSwitcher').classList.contains('hide'), true);
  dom.window.close();
  console.log('PASS: multi-project create/edit, separate roles, deselect, cancellation, failed save, admin guard, and technical switching');
})().catch(error => {console.error(error); process.exit(1);});
