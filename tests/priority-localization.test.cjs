'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const src=name=>fs.readFileSync(path.join(root,name),'utf8');
for(const name of ['command-center.js','admin-work-editor.js','demo-lab.js','admin-summary-report.js','report-model.js'])new Function(src(name));
const center=src('command-center.js');
const from=center.indexOf('const priorityVi='),to=center.indexOf('function syncAdminHeader()',from);
assert.ok(from>0&&to>from,'Admin priority utilities exist');
const {priorityVi,priorityRank}=new Function(center.slice(from,to)+';return {priorityVi,priorityRank}')();
for(const [input,label,rank] of [['High','Cao',3],['high','Cao',3],['Cao','Cao',3],['Medium','Trung bình',2],['Trung bình','Trung bình',2],['Low','Thấp',1],['Thấp','Thấp',1],['Critical','Khẩn cấp',4],['Khẩn cấp','Khẩn cấp',4]]){
 assert.equal(priorityVi(input),label,input);
 assert.equal(priorityRank(input),rank,input);
}
assert.equal(priorityVi(undefined),'Trung bình');
assert.match(center,/priorityVi\(t\.priority\)===priority/,'Admin filters mixed-language records');
assert.match(center,/escC\(priorityVi\(t\.priority\)\)/,'Admin badges and warnings are localized');
assert.match(center,/t\.priority\?" · "\+priorityVi\(t\.priority\)/,'Admin PDF is localized');
const edit=src('admin-work-editor.js');
assert.match(edit,/ccWePriority:priorityVi\(task\.priority\)/,'Admin edit dropdown shows Vietnamese');
assert.match(edit,/priorityVi\(before\.priority\)===/,'Unchanged old values are preserved on edit');
const report=require('../report-model.js');
for(const [value,expected] of [['High','Cao'],['Medium','Trung bình'],['Low','Thấp'],['Critical','Khẩn cấp']])assert.equal(report.status(value).text,expected);
console.log('ESTA priority localization passed: table, filter, warning, form, PDF, report, old data.');
