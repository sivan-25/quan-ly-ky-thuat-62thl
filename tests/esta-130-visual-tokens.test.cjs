const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const read = (name) => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const base = read("esta-brand-130-complete.css");
const tokens = {
  "control-height": "44px",
  "compact-height": "40px",
  "kpi-height": "44px",
  "table-head-height": "44px",
  "table-row-height": "44px",
  "field-bg": "#FBF3E3",
  "stat-bg": "#F5ECD0",
  "stat-text": "#411437",
  "progress-bg": "#E7F0FA",
  "progress-text": "#164A70",
  "complete-bg": "#E8F4E8",
  "complete-text": "#175B36",
  "pending-bg": "#FFF0DA",
  "pending-text": "#7A4300",
  "overdue-bg": "#FDE8E8",
  "overdue-text": "#991B1B",
};
assert.match(base, /body\.estaBrand130,\s*#app\.estaBrand130\s*\{/);
const tokenValue = name => {
  const raw = base.split("--esta130-"+name+":")[1]?.split(";")[0]?.trim();
  assert.ok(raw, "missing token "+name);
  const alias = /^var\(--esta130-([a-z-]+)\)$/.exec(raw);
  return alias ? tokenValue(alias[1]) : raw;
};
for (const [name, value] of Object.entries(tokens)) {
  assert.equal(tokenValue(name), value, "wrong resolved 130HH token "+name);
}
for (const [name, source] of Object.entries({
  "table-row-bg":"ui-surface", "table-row-text":"ui-text", "table-row-border":"ui-border",
  "field-bg":"ui-surface", "field-text":"ui-text",
  "stat-label":"ui-muted", "stat-border":"ui-border", "today-text":"stat-text",
  "complete-bg":"success-bg", "complete-text":"success-text",
  "pending-bg":"warning-bg", "pending-text":"warning-text",
  "overdue-bg":"danger-bg", "overdue-text":"danger-text"
})) {
  assert.ok(base.includes("--esta130-"+name+": var(--esta130-"+source+");"),
    "duplicate color should use the 130HH role token: "+name);
}
for (const state of ["doing", "done", "waiting"]) {
  assert.ok(base.includes(`.badge.${state}`), `missing semantic status ${state}`);
  assert.ok(base.includes(`.homeStatus.${state}`), `missing home semantic status ${state}`);
}
const markup = read("index.html");
assert.ok(markup.includes('data-work-stat-filter="today"'), "today KPI missing");
assert.ok(base.includes("article[data-work-stat-filter]>i"), "shared KPI icon styling missing");
for (const metric of ["doing", "done", "waiting"]) {
  assert.ok(base.includes(`data-work-stat-filter="${metric}"`), `missing work KPI ${metric}`);
}
const approved = read("inventory-approved-four.css");
for (const n of [1, 2, 3, 4]) {
  const part = approved.match(new RegExp(`\\.monthlyStats article:nth-child\\(${n}\\)\\s*\\{([^}]+)\\}`));
  assert.ok(part, `inventory KPI ${n} missing`);
  assert.ok(part[1].includes("background:var(--esta130-stat-bg,"), `inventory KPI ${n} inconsistent`);
}
assert.ok(base.includes(".inventoryMetric.lowMetric{\n  background:var(--esta130-stat-bg)!important;"), "low-stock tile shares KPI background");
const workMobile = read("demo-mobile.css");
assert.ok(workMobile.includes("background:var(--esta130-field-bg)!important"), "visible date output uses normal form field color");
const mobile = read("inventory-mobile-cards.css");
assert.ok(mobile.includes("background:var(--esta130-stat-bg,#16233a)"), "mobile KPI role");
assert.ok(mobile.includes("color:var(--esta130-stat-label,#a9b8d2)"), "mobile KPI label role");
for (const name of ["style.css","unified.css","demo-lab.css","update-lab.css","inventory-approved-four.css","inventory-mobile-cards.css"]) {
  const css = read(name);
  assert.ok(!css.includes(",undefined)"), `invalid legacy fallback in ${name}`);
  assert.ok(!css.includes(".color:var(--esta130-"), `invalid color declaration in ${name}`);
}
const singleCountRule = /body\.estaBrand130 #app\.estaBrand130#app#app #workPage \.workTableMeta #count\{\s*color:var\(--esta130-stat-text\)!important;\s*-webkit-text-fill-color:var\(--esta130-stat-text\)!important;/;
assert.match(base, singleCountRule, "task count uses the shared 130HH semantic token");
assert.ok(!base.includes("body.estaBrand130 #app.estaBrand130#app #workPage .workTableMeta #count{"),
  "obsolete lower-specificity task count override must be removed");
console.log("PASS 130HH visual roles: fields, KPI cards, 3 statuses, desktop/mobile inventory and safe fallbacks");
