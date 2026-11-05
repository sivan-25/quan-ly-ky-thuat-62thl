#!/usr/bin/env node
"use strict";
/* Bundle only adjacent same-media local CSS links: keep the exact CSS cascade. */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const htmlPath=path.join(root,"index.html");
const html=fs.readFileSync(htmlPath,"utf8");
const attr=(tag,name)=>{
 const m=tag.match(new RegExp("\\b"+name+"\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)')","i"));
 return m?(m[1]??m[2]):null;
};
const known=tag=>/^<link\s+rel="stylesheet"\s+href="[^"]+\.css(?:\?[^"]*)?"(?:\s+media="[^"]*")?\s*>$/i.test(tag);
const tags=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>({
 start:m.index,end:m.index+m[0].length,tag:m[0],
 href:attr(m[0],"href"),rel:attr(m[0],"rel"),media:attr(m[0],"media")||"all"
}));
if(html.includes('data-esta-css-bundle="true"')){
 for(const m of html.matchAll(/href="(esta-css-[a-z0-9-]+\.css)"/g)){
  if(!fs.existsSync(path.join(root,m[1])))throw Error("Missing built stylesheet: "+m[1]);
 }
 console.log("ESTA styles already generated; verified.");
 process.exit(0);
}
const groups=[];let current=[];
function flush(){if(current.length>1)groups.push([...current]);current=[];}
for(const x of tags){
 const file=x.href?.split("?")[0];
 const eligible=x.rel?.toLowerCase()==="stylesheet"&&file&&/^[\w.-]+\.css$/i.test(file)&&known(x.tag)&&fs.existsSync(path.join(root,file));
 if(!eligible){flush();continue;}
 if(current.length){
  const prev=current[current.length-1];
  if(prev.media!==x.media||html.slice(prev.end,x.start).trim()!=="")flush();
 }
 current.push(x);
}
flush();
const localCount=tags.filter(x=>x.rel?.toLowerCase()==="stylesheet"&&x.href&&/^[\w.-]+\.css(?:\?.*)?$/i.test(x.href)).length;
if(localCount<40||groups.length<5)throw Error("Unexpected CSS manifest: "+localCount+" local links, "+groups.length+" groups");
const replacements=[];let packed=0;
groups.forEach((items,i)=>{
 const css=items.map(x=>{
  const name=x.href.split("?")[0],source=fs.readFileSync(path.join(root,name),"utf8");
  if(/@import\b|@charset\b/i.test(source))throw Error("Order-sensitive CSS import: "+name);
  return "\n/* SOURCE: "+name+" */\n"+source+"\n";
 }).join("\n");
 const hash=crypto.createHash("sha256").update(css).digest("hex").slice(0,16);
 const output="esta-css-"+i+"-"+hash+".css";
 fs.writeFileSync(path.join(root,output),css,"utf8");
 const link='<link rel="stylesheet" href="'+output+'" data-esta-css-bundle="true"'+(items[0].media!=="all"?' media="'+items[0].media+'"':"")+">";
 replacements.push({start:items[0].start,end:items[items.length-1].end,link});
 packed+=items.length;
});
let rewritten=html;
for(const x of replacements.sort((a,b)=>b.start-a.start))rewritten=rewritten.slice(0,x.start)+x.link+rewritten.slice(x.end);
fs.writeFileSync(htmlPath,rewritten,"utf8");
console.log("ESTA CSS: "+localCount+" source links -> "+(localCount-packed+groups.length)+" links; "+packed+" files in "+groups.length+" order-safe bundles.");
