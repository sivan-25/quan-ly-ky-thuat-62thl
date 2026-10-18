const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const src=read("maintenance-130.js");
const css=read("maintenance-readability.css");
const html=read("index.html");
const demo=read("demo-lab.js");
new Function(src);
new Function(demo);

// Exercise the actual thumbnail renderer with saved Supabase storage references.
const begin=src.indexOf("function maintenanceEvidenceHtml(event,key){");
const end=src.indexOf("\nlet m130EvidenceObserver=",begin);
assert.ok(begin>=0&&end>begin,"evidence renderer exists");
const functionCode=src.slice(begin,end);
const build=new Function("recordedImages","mediaImgHtml","esc",
 functionCode+"\nreturn maintenanceEvidenceHtml;");
const recordedImages=e=>Array.isArray(e.image_paths)?
 e.image_paths.map(p=>typeof p==="string"?{kind:"after",ref:p}:p).filter(p=>p?.ref):[];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mediaImgHtml=(ref,cls)=>'<img class="'+cls+'" data-storage-path="'+esc(String(ref).slice(8))+'">';
const thumb=build(recordedImages,mediaImgHtml,esc);

assert.equal(thumb({image_paths:[]},"event-1"),"","no empty photo blocks");
const evidence=thumb({image_paths:[
 {kind:"before",ref:"storage:130HH/first.jpg"},
 {kind:"after",ref:"storage:130HH/second.jpg"},
 {kind:"after",ref:"storage:130HH/third.jpg"},
 {kind:"after",ref:"storage:130HH/fourth.jpg"}
]},"photo-event");
assert.equal((evidence.match(/data-m130-photo-index/g)||[]).length,4,"four thumbs visible");
assert.equal((evidence.match(/<img /g)||[]).length,4,"all four saved thumbnails remain visible");
assert.match(evidence,/Trước 1/);
assert.match(evidence,/Sau 2/);
const five=thumb({image_paths:[
 ...Array.from({length:5},(_,i)=>({kind:"after",ref:"storage:130HH/photo-"+i+".jpg"}))
]},"five");
assert.equal((five.match(/<img /g)||[]).length,4,"only four images initially rendered for larger sets");
assert.match(five,/\+1 ảnh/,"additional images stay available in the gallery");
assert.match(five,/data-m130-photo-index="4"/,"more button opens the fifth image");
assert.match(evidence,/data-storage-path="130HH\/first.jpg"/);
assert.match(thumb({image_paths:["storage:130HH/legacy.jpg"]},"a"),/Sau 1/,"legacy string images supported");
assert.match(thumb({image_paths:[{kind:"before",ref:"storage:p"}]},"quote'key"),/quote&#39;key/,"HTML attribute encoded");
// Two display paths must use the same renderer and hydrate stored image references.
assert.match(src,/maintenanceEvidenceHtml\(e,e\.event_key\)/);
assert.match(src,/hydrateMaintenanceEvidence\(\);/);
assert.match(src,/hydrateMediaImages\(\$\("m130GalleryImage"\)\)/);
assert.match(src,/data-m130-gallery-close/);
assert.match(src,/IntersectionObserver/);
assert.match(src,/showMaintenanceGallery\(photo\.dataset\.m130Gallery/);
// Contrast fixes and lifecycle: the banner should not be generated at all.
assert.match(css,/#maintenancePage #maint130 \.m130ServiceCard h3/);
assert.match(css,/color:#172e4d!important/);
assert.match(css,/#maintenancePage #maint130 \.m130ServiceCard \.m130CardLocation/);
assert.match(css,/#maintenancePage #maint130 \.m130ServiceCard \.m130CardMetrics strong/);
assert.match(css,/#maintenancePage #maint130 \.m130Evidence img/);
assert.doesNotMatch(demo,/p\.innerHTML='<div><b>Hồ sơ thiết bị liên kết & QR/);
assert.match(demo,/function demoEnsureAssetPassport\(\)\{\s*\/\/[\s\S]*?\$\("#demoAssetPassport"\)\?\.remove\(\)/);
const cssBase=html.indexOf("maintenance-redesign.css");
const cssNew=html.indexOf("maintenance-readability.css");
assert.ok(cssBase>0&&cssNew>cssBase,"legibility overrides load after redesign");
assert.match(html,/maintenance-130\.js\?v=\d{8}-[a-z0-9-]+/i,"maintenance JS uses a versioned asset URL");
console.log("Maintenance evidence, contrast and banner regression checks passed.");
