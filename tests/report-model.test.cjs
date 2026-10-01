const assert=require('node:assert/strict');
const fs=require('node:fs');
const M=require('../report-model');
let tests=0;
const check=(name,fn)=>{fn();tests++;console.log('PASS '+name)};
check('Leap year month',()=>assert.deepEqual(M.range('month','2028-02-12'),{from:'2028-02-01',to:'2028-02-29',kind:'month'}));
check('Week at month boundary',()=>assert.deepEqual(M.range('week','2026-09-30'),{from:'2026-09-28',to:'2026-09-30',kind:'week'}));
check('ESTA week label wording',()=>assert.equal(M.periodLabel(M.range('week','2026-09-30')),'Tuần thứ 5 của tháng 9/2026'));
check('Vietnam local date',()=>assert.equal(M.localDay(new Date('2026-09-30T18:00:00Z')),'2026-10-01'));
check('Invalid/reversed ranges',()=>{assert.equal(M.validRange({from:'2026-02-30',to:'2026-03-02'}),false);assert.equal(M.validRange({from:'2026-09-30',to:'2026-09-01'}),false)});
const r={from:'2026-09-01',to:'2026-09-30',kind:'month'};
check('EVN1 and EVN2 preserve prior period baseline',()=>{
 const rows=M.energyRows([{id:1,type:'electric',date:'2026-08-31',value:100,value2:200},{id:2,type:'electric',date:'2026-09-01',value:110,value2:230},{id:3,type:'electric',date:'2026-09-02',value:120}], 'electric',r,true);
 assert.equal(rows[0].diff,10);assert.equal(rows[0].diff2,30);assert.equal(rows[1].diff2,null);
});
check('Missing baseline is unknown, not zero',()=>assert.equal(M.energyRows([{id:1,type:'xlnt',date:'2026-09-01',value:0}],'xlnt',r,false)[0].diff,null));
check('Negative reading remains visible and excluded from consumption',()=>{
 const model=M.build({snapshot:{energy:[{id:1,type:'water',date:'2026-08-31',value:100},{id:2,type:'water',date:'2026-09-02',value:50}]}},r,['energy_water']);
 assert.equal(model.sections[0].rows[0][2],'-50');assert.equal(model.energyTotals[0].value,'—');assert.equal(model.notes.length,1);
});
check('Inventory stock uses opening and dated transactions',()=>{
 const model=M.build({materials:[{id:'m',name:'Test',opening_qty:10,tracking_start_date:'2026-08-01'}],transactions:[{material_id:'m',tx_type:'out',qty:2,tx_date:'2026-08-20'},{material_id:'m',tx_type:'in',qty:5,tx_date:'2026-09-03'},{material_id:'m',tx_type:'out',qty:3,tx_date:'2026-09-20'},{material_id:'m',tx_type:'in',qty:99,tx_date:'2026-10-01'}]},r,['materials']);
 assert.deepEqual(model.sections[0].rows[0].slice(2),['8','5','3','10']);
});
check('Checklist counts records, retains all detailed items',()=>{
 const model=M.build({inspections:[{inspection_date:'2026-09-01',items:[{item:'A'},{item:'B'}]}]},r,['inspection']);assert.equal(model.count,1);assert.equal(model.sections[0].rows.length,2);
});
check('No selection produces no report or photos',()=>{const m=M.build({snapshot:{tasks:[{d:'2026-09-01',imgs:['storage:x']}]}},r,[]);assert.equal(m.count,0);assert.equal(m.photos.length,0)});
check('Linked contractor task not counted twice',()=>{const m=M.build({snapshot:{tasks:[{id:1,d:'2026-09-01',contractorId:'c'}]},jobs:[{source_task_id:'1',contractor_id:'c',work_date:'2026-09-01'}]},r,['contractor']);assert.equal(m.count,1)});
check('XLNT uses m³',()=>{const m=M.build({snapshot:{energy:[{date:'2026-09-01',type:'xlnt',value:1}]}},r,['energy_xlnt']);assert.equal(m.energyTotals[0].unit,'m³');assert.ok(m.sections[0].columns[1].includes('m³'))});
check('Empty periods do not imply good operating condition',()=>{const m=M.build({},r,['work','incident','inspection']);assert.ok(m.health.every(x=>x.tone==='muted'))});
check('Invalid month does not throw',()=>assert.equal(M.validRange(M.range('month','2026-13-01')),false));
check('Future material is excluded',()=>assert.equal(M.build({materials:[{created_at:'2026-10-01'}]},r,['materials']).count,0));
check('Paused asset keeps its actual state',()=>assert.equal(M.build({assets:[{status:'Ngừng sử dụng',next_due_date:'2025-01-01'}]},r,['maintenance']).schedule[0].status.text,'Ngừng sử dụng'));
check('Timestamp near midnight uses Vietnam report day',()=>{assert.equal(M.date('2026-08-31T18:00:00+00:00'),'01/09/2026');assert.equal(M.build({incidents:[{detected_at:'2026-08-31T18:00:00+00:00'}]},r,['incident']).count,1)});
check('Latest report date only uses selected modules',()=>{const d={snapshot:{tasks:[{d:'2026-09-29'}],energy:[{date:'2026-10-01',type:'xlnt'}]},incidents:[{detected_at:'2026-10-01'}]};assert.equal(M.latestRecordDate(d,['work']),'2026-09-29');assert.equal(M.latestRecordDate(d,['energy_xlnt']),'2026-10-01');assert.equal(M.latestRecordDate(d,['energy_water']),'')});
check('Latest date handles linked contractor tasks and Vietnam midnight',()=>{assert.equal(M.latestRecordDate({snapshot:{tasks:[{d:'2026-09-29',contractorId:'c'}]}},['contractor']),'2026-09-29');assert.equal(M.latestRecordDate({incidents:[{detected_at:'2026-09-30T18:00:00Z'}]},['incident']),'2026-10-01')});
check('Latest date does not invent dates for empty or invalid records',()=>{assert.equal(M.latestRecordDate({},['work']),'');assert.equal(M.latestRecordDate({snapshot:{tasks:[{d:'2026-02-30'},{d:''}]}},['work']),'')});
console.log(tests+' model tests passed');
