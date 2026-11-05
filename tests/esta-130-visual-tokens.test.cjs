const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const read = (name) => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const base = read("esta-brand-130-complete.css");
const tokens = {
  "control-height": "44px",
  "compact-height": "36px",
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
for (const [name, value] of Object.entries(tokens)) {
  assert.ok(base.includes(`--esta130-${name}: ${value};`), `missing token ${name}`);
}
for (const state of ["doing", "done", "waiting"]) {
  assert.ok(base.includes(`.badge.${state}`), `missing semantic status ${state}`);
  assert.ok(base.includes(`.homeStatus.${state}`), `missing home semantic status ${state}`);
}
for (const metric of ["today", "doing", "done", "waiting"]) {
  assert.ok(base.includes(`data-work-stat-filter="${metric}"`), `missing work KPI ${metric}`);
}
const approved = read("inventory-approved-four.css");
for (const n of [1, 2, 3, 4]) {
  const part = approved.match(new RegExp(`\\.monthlyStats article:nth-child\\(${n}\\)\\s*\\{([^}]+)\\}`));
  assert.ok(part, `inventory KPI ${n} missing`);
  assert.ok(part[1].includes("background:var(--esta130-stat-bg,"), `inventory KPI ${n} inconsistent`);
}
const mobile = read("inventory-mobile-cards.css");
assert.ok(mobile.includes("background:var(--esta130-stat-bg,#16233a)"), "mobile KPI role");
assert.ok(mobile.includes("color:var(--esta130-stat-label,#a9b8d2)"), "mobile KPI label role");
for (const name of ["style.css","unified.css","demo-lab.css","update-lab.css","inventory-approved-four.css","inventory-mobile-cards.css"]) {
  const css = read(name);
  assert.ok(!css.includes(",undefined)"), `invalid legacy fallback in ${name}`);
  assert.ok(!css.includes(".color:var(--esta130-"), `invalid color declaration in ${name}`);
}
console.log("PASS 130HH visual roles: fields, KPI cards, 3 statuses, desktop/mobile inventory and safe fallbacks");
