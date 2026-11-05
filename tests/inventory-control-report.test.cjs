const assert = require('node:assert/strict');
const report = require('../inventory-control-report.js');

function make(project) {
  return report.buildPayload({
    from:'2026-11-01',to:'2026-11-30',report_date:'2026-11-05',
    selected:['materials','tools'],projects:[project]
  });
}
const project = {
  id:'62THL',name:'62 Trần Huy Liệu',
  materials:[{id:'m1',name:'Keo',unit:'Cái',opening_qty:10,tracking_start_date:'2026-01-01'}],
  transactions:[
    {material_id:'m1',tx_date:'2026-10-09',tx_type:'in',qty:5},
    {material_id:'m1',tx_date:'2026-11-02',tx_type:'in',qty:4,note:'Nhập kho'},
    {material_id:'m1',tx_date:'2026-11-03',tx_type:'out',qty:2,
      source_type:'work_task',source_task_id:'t1',performer:'Ân'},
    {material_id:'m1',tx_date:'2026-11-04',tx_type:'out',qty:1}
  ],
  tools:[{name:'Ampe kìm',brand:'Asaki',unit:'Cái',qty:1,
    keeper:'Ân',condition_status:'Tốt'}],
  tasks:[{id:'t1',c:'Sửa bóng đèn',s:'Đã hoàn thành',completed_at:'2026-11-03',a:'Ân'}],
  signers:{prepared_by:'Kỹ thuật dự án',checked_by:'Giám sát',approved_by:'Kỹ sư trưởng'}
};
const data=make(project), p=data.projects[0];
assert.equal(data.report_type,'inventory_control');
assert.equal(p.materials[0].opening,15);
assert.equal(p.materials[0].inbound,4);
assert.equal(p.materials[0].outbound,3);
assert.equal(p.materials[0].closing,16);
assert.equal(p.work.length,2);
assert.equal(p.work.reduce((n,x)=>n+x.qty,0),p.materials[0].outbound);
assert.equal(p.work.filter(x=>x.linked).length,1);
assert.match(p.work.find(x=>!x.linked).task,/chưa liên kết/);
assert.equal(p.tools[0].brand,'Asaki');
assert.equal(p.checked_by,'Giám sát');
const tools=report.buildPayload({from:'2026-11-01',to:'2026-11-30',
  selected:['tools'],projects:[project]});
assert.equal(tools.projects[0].materials.length,0);
assert.equal(tools.projects[0].work.length,0);
assert.equal(tools.projects[0].tools.length,1);
const admin=report.buildPayload({from:'2026-11-01',to:'2026-11-30',
 selected:['materials'],projects:[project,{...project,id:'127HH',name:'127 Hồng Hà'}]});
assert.equal(admin.projects.length,2);
assert.deepEqual(admin.projects.map(x=>x.name),['62 Trần Huy Liệu','127 Hồng Hà']);
assert.throws(()=>report.buildPayload({from:'2026-12-01',to:'2026-11-30',
 selected:['materials'],projects:[project]}),/Kỳ báo cáo/);
console.log('ESTA inventory report template: passed');
