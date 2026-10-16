'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(root,'maintenance-130.js'),'utf8');
const center=fs.readFileSync(path.join(root,'command-center.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
new Function(js);
new Function(center);
const injected=js.replace(/\}\)\(\);\s*$/,'window.__maintenanceBadgeTest={calculate:maintenance130DueSummary};\n})();');
assert.notEqual(injected,js,'summary helper must be injectable');
const dom=new JSDOM('<!doctype html><div id="maintenancePage"><section class="maintenanceSchedule"></section></div>',{url:'https://esta.example/',runScripts:'outside-only'});
const w=dom.window;
w.currentBuilding={id:'130HH'};
w.centralSession={access_token:'fixture'};
w.sbFetch=async url=>{
 if(url.includes('esta_maintenance_plan_items'))return plans;
 if(url.includes('esta_maintenance_plan_occurrences'))return events;
 throw Error('unexpected query: '+url);
};
w.eval(injected);
const plans=[
 {id:'a',plan_code:'A',cadence:'1 tháng',work_title:'Bảo trì hệ thống',deleted_at:null},
 {id:'b',plan_code:'B',cadence:'Không lặp',work_title:'Kiểm tra bơm'},
 {id:'c',plan_code:'C',cadence:'Không lặp',work_title:'Đã hoàn thành'},
 {id:'d',plan_code:'D',cadence:'Không lặp',work_title:'Tháng sau'},
 {id:'e',plan_code:'E',cadence:'Không lặp',work_title:'Đã xóa',deleted_at:'2026-10-01'},
 {id:'f',plan_code:'F',cadence:'Không lặp',work_title:'Hủy'},
 {id:'g',plan_code:'G',cadence:'Không lặp',work_title:'Hoãn'}
];
const events=[
 {item_id:'a',event_key:'A:2026-09',planned_month:'2026-09-01',planned_date:'2026-09-10',status:'planned'},
 {item_id:'b',event_key:'B:2026-10',planned_month:'2026-10-01',planned_date:'2026-10-12',status:'in_progress'},
 {item_id:'c',event_key:'C:2026-10',planned_month:'2026-10-01',planned_date:'2026-10-20',status:'completed'},
 {item_id:'d',event_key:'D:2026-11',planned_month:'2026-11-01',planned_date:'2026-11-20',status:'planned'},
 {item_id:'e',event_key:'E:2026-10',planned_month:'2026-10-01',planned_date:'2026-10-11',status:'planned'},
 {item_id:'f',event_key:'F:2026-10',planned_month:'2026-10-01',planned_date:'2026-10-10',status:'cancelled'},
 {item_id:'g',event_key:'G:2026-10',planned_month:'2026-10-01',planned_date:'2026-10-11',status:'postponed'}
];
const calculate=w.__maintenanceBadgeTest.calculate;
let result=calculate(plans,events,'2026-10-14','2026-11-13');
assert.deepEqual(JSON.parse(JSON.stringify(result)),{count:4,critical:true},'overdue + next 30 days incl. recurring; exclude done/removed/cancelled/postponed');
events.push({item_id:'a',event_key:'A:2026-10',planned_month:'2026-10-01',planned_date:'2026-10-10',status:'completed'});
result=calculate(plans,events,'2026-10-14','2026-11-13');
assert.deepEqual(JSON.parse(JSON.stringify(result)),{count:3,critical:true},'completion immediately removes one occurrence');
assert.deepEqual(JSON.parse(JSON.stringify(calculate([],[],'2026-10-14','2026-11-13'))),{count:0,critical:false});
assert.match(center,/\["130HH","127HH","62THL","68PĐL","NANGCAP"\]\.includes\(bid\)\?Promise\.resolve\(\[\]\):sbFetch\("\/rest\/v1\/maintenance_assets/,'Shared projects use maintenance plan badge rather than legacy assets');
assert.match(center,/window\.estaMaintenance130NavSummary/,'badge must be based on maintenance plan summary');
assert.match(center,/window\.estaRefreshProjectNavAlerts/,'badge must expose refresh hook');
assert.match(js,/notifyMaintenance130Nav\(\);toast\("✓ Đã lưu kế hoạch bảo trì"\)/);
assert.match(html,/command-center\.js\?v=\d{8}-[a-z0-9-]+/i,"versioned Admin command-center JS");
assert.match(html,/maintenance-130\.js\?v=\d{8}-[a-z0-9-]+/i,"versioned maintenance JS");
dom.window.close();
console.log('4-project maintenance sidebar badge: due, recurring, completed, removed, status and refresh checks passed.');
