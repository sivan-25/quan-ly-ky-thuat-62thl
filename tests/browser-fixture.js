/* Isolated visual fixture. No API, database, credential or production session access. */
(async () => {
  const source = new DOMParser().parseFromString(await (await fetch('index.html')).text(), 'text/html');
  for (const node of source.head.querySelectorAll('style,link[rel="stylesheet"],link[rel="preconnect"]')) document.head.appendChild(node.cloneNode(true));
  const shell = source.getElementById('app');
  shell.className = 'demoProjectShell demoProjectMode demoExactProject demoSampleProject reportsMode';
  shell.querySelectorAll('.page').forEach(p => p.classList.toggle('hide', p.id !== 'reportsPage'));
  shell.querySelectorAll('.topModuleTitle').forEach(p => p.classList.toggle('hide', p.id !== 'topReportsTitle'));
  shell.querySelectorAll('.estaNav button').forEach(p => {p.classList.remove('hide');p.classList.toggle('active',p.id==='navReports')});
  shell.querySelectorAll('[onclick],[onchange],[onsubmit]').forEach(el => ['onclick','onchange','onsubmit'].forEach(k=>el.removeAttribute(k)));
  shell.querySelectorAll('.buildingNameText').forEach(p=>p.textContent='DỰ ÁN KIỂM THỬ');
  const filter = shell.querySelector('#filterBar'); if (filter) filter.classList.add('hide');
  document.body.replaceChildren(shell);
  window.currentBuilding = { id: 'DEMO', name: 'DỰ ÁN KIỂM THỬ · Dữ liệu giả lập' };
  window.currentAccount = { id: 'fixture', display_name: 'NGƯỜI KIỂM THỬ' };
  window.centralSession = { access_token: 'ISOLATED-TEST-FIXTURE' };
  const now = '2026-09-15';
  const data = {
    snapshot: { tasks: [
      {id:1,d:now,c:'Kiểm tra hệ thống điện – dữ liệu thử nghiệm',t:'Hằng ngày',s:'Hoàn thành',a:'Nhân sự thử nghiệm'},
      {id:2,d:now,c:'Kiểm tra bơm cấp nước – dữ liệu thử nghiệm',t:'Bảo trì',s:'Đang thực hiện',a:'Nhân sự thử nghiệm',n:'Ghi chú kiểm thử bố cục, không phải kết luận vận hành thực tế.'}
    ], energy:[{id:1,date:'2026-08-31',type:'electric',value:100},{id:2,date:now,type:'electric',value:125}]},
    incidents:[{incident_code:'TEST-001',detected_at:now,area:'Khu vực thử nghiệm',symptom:'Tình huống giả lập để kiểm tra hiển thị',severity:'Cao',status:'Theo dõi',cause:'Dữ liệu thử',solution:'Dữ liệu thử'}],
    inspections:[{inspection_date:now,inspection_code:'TEST-002',template_name:'Checklist giả lập',result_status:'Đạt',items:[{item:'Hạng mục thử nghiệm',result:'Đạt'}]}],
    maintenance_assets:[{code:'TEST',name:'Thiết bị giả lập',next_due_date:'2026-10-20'}],
    inventory_materials:[{id:'m',name:'Vật tư giả lập',unit:'Cái',opening_qty:10,tracking_start_date:'2026-09-01'}],
    inventory_tools:[{name:'Dụng cụ giả lập',qty:1,unit:'Bộ',condition_status:'Tốt'}],
  };
  window.projectSync = async () => ({snapshot:data.snapshot});
  window.sbFetch = async path => data[path.split('?')[0].split('/').pop()] || [];
  window.canProjectEdit = () => false;
  window.pdfSafeFilename = x=>x;
  window.centralAuthFetch = async () => ({ok:false,status:400,json:async()=>({error:'Trang kiểm thử độc lập không gọi API PDF'})});
  window.mediaImgHtml = () => '';
  window.hydrateMediaImages = async () => {};
  window.waitForReportImages = async () => {};
  for (const src of ['report-model.js','report-center.js']) await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
  await window.ESTAReports.open();
  document.getElementById('rcMonth').value='2026-09';
  document.getElementById('rcPeriodForm').requestSubmit();
  const menu=document.getElementById('menu');
  if(menu)menu.onclick=()=>document.getElementById('app').classList.toggle('mobileMenuOpen');
})().catch(error=>{document.body.textContent='Không nạp được fixture: '+error.message});
