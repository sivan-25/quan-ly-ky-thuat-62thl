'use strict';
/* Accessible modal semantics, without changing shared inventory behavior.
   All three inventory dialogs must have a dynamic title, visible description
   and an accessible close button. Existing save/cancel IDs remain intact. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
for(const [id,title,description,close,save,cancel] of [
  ["materialItemModal","materialModalTitle","materialModalHelp","closeMaterialModal","materialSaveBtn","cancelMaterialModal"],
  ["stockTxnModal","stockTxnModalTitle","stockTxnModalHelp","closeStockTxnModal","stockTxnSubmit","cancelStockTxnModal"],
  ["toolItemModal","toolModalTitle","toolModalHelp","closeToolModal",null,"cancelToolModal"]
]){
  const open=new RegExp('<div\\s+id="'+id+'"[^>]*>');
  const tag=html.match(open)?.[0]||"";
  assert.ok(tag,'Missing inventory dialog '+id);
  assert.match(tag,/role="dialog"/,id+" lacks dialog role");
  assert.ok(tag.includes('aria-labelledby="'+title+'"'),id+" lacks accessible title");
  assert.ok(tag.includes('aria-describedby="'+description+'"'),id+" lacks accessible description");
  assert.ok(html.includes('id="'+title+'"'),id+" missing title target");
  assert.ok(html.includes('id="'+description+'"'),id+" missing description target");
  const closeTag=html.match(new RegExp('<button\\s+id="'+close+'"[^>]*>'))?.[0]||"";
  assert.match(closeTag,/aria-label="Đóng[^"]+"/,id+" icon close needs readable name");
  assert.ok(html.includes('id="'+cancel+'"'),id+" missing cancel action");
  if(save)assert.ok(html.includes('id="'+save+'"'),id+" missing save action");
}
console.log("PASS three inventory popups: accessible title/description/close and original save/cancel actions preserved");
